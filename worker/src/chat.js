import { corsHeaders } from './cors.js';
import { checkRateLimit, clientIp } from './rateLimit.js';
import { buildSystemPrompt, estimateRequestTokens, MAX_PROMPT_TOKENS } from './systemPrompt.js';
import { groqChatStream, groqChatStreamAuto, GroqUpstreamError } from './groq.js';
import { TOOLS_SPEC, executeToolCall } from './tools.js';
import { MAX_MESSAGES, MAX_MESSAGE_CHARS } from './constants.js';

function jsonError(status, error, message, extraHeaders = {}) {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

/**
 * Validate a client-supplied messages array. Client messages are spread
 * directly after the system prompt when calling Groq, so we must reject
 * anything that could smuggle in extra 'system'/'tool' turns or oversized
 * payloads.
 * @param {unknown} messages
 * @returns {string|null} human-readable error message, or null when valid
 */
export function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'messages must be a non-empty array.';
  }
  if (messages.length > MAX_MESSAGES) {
    return `messages must contain at most ${MAX_MESSAGES} entries.`;
  }
  for (const m of messages) {
    if (typeof m !== 'object' || m === null || Array.isArray(m)) {
      return 'each message must be an object.';
    }
    if (m.role !== 'user' && m.role !== 'assistant') {
      return "each message role must be 'user' or 'assistant'.";
    }
    if (typeof m.content !== 'string' || m.content.length === 0) {
      return 'each message content must be a non-empty string.';
    }
    if (m.content.length > MAX_MESSAGE_CHARS) {
      return `each message content must be at most ${MAX_MESSAGE_CHARS} characters.`;
    }
  }
  return null;
}

export async function handleChat(request, env) {
  const cors = corsHeaders(request, env);
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'bad_request', 'Invalid JSON body.', cors);
  }
  const { messages, sessionSummary } = body || {};
  const validationError = validateMessages(messages);
  if (validationError) {
    return jsonError(400, 'bad_request', validationError, cors);
  }

  const ip = clientIp(request);
  const rl = await checkRateLimit(env.RATE_LIMIT, ip);
  if (!rl.allowed) {
    return jsonError(
      429,
      'rate_limited',
      'Too many requests. Try again in a minute.',
      { ...cors, 'Retry-After': String(rl.retryAfterSec) }
    );
  }

  const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const systemPrompt = buildSystemPrompt(sessionSummary || null, latestUserMessage);

  const estimatedTokens = estimateRequestTokens({ systemPrompt, messages });
  if (estimatedTokens > MAX_PROMPT_TOKENS) {
    console.warn('request over token budget', { estimatedTokens, max: MAX_PROMPT_TOKENS });
    return jsonError(
      413,
      'too_large',
      'This conversation has gotten too long for the assistant to handle. Use the clear button to start over.',
      cors
    );
  }

  try {
    // Single streaming call with tools. If the model answers directly we pipe
    // its content deltas straight through; if it emits tool_calls the deltas
    // are buffered and assembled so we can execute the tool and stream a
    // second call with the tool result appended.
    const first = await groqChatStreamAuto({
      apiKey: env.GROQ_API_KEY,
      model: env.GROQ_MODEL,
      messages,
      systemPrompt,
      tools: TOOLS_SPEC,
      tool_choice: 'auto',
    });

    if (first.kind === 'content') {
      // No tool call — pipe the same stream back to the client. One upstream call.
      return new Response(first.stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
          ...cors,
        },
      });
    }

    // Tool path: execute the first tool call and stream back the final answer
    const toolCall = first.toolCalls[0];
    const toolResultContent = await executeToolCall(toolCall, env, latestUserMessage);

    // Build augmented message list: original + assistant tool_call msg + tool result msg
    const toolCallId = toolCall.id || 'tc_0';
    const augmentedMessages = [
      ...messages,
      {
        role: 'assistant',
        content: null,
        tool_calls: [toolCall],
      },
      {
        role: 'tool',
        tool_call_id: toolCallId,
        content: toolResultContent,
      },
    ];

    // Check token budget for augmented messages before phase 2
    const augmentedTokens = estimateRequestTokens({ systemPrompt, messages: augmentedMessages });
    let phase2Messages = augmentedMessages;
    if (augmentedTokens > MAX_PROMPT_TOKENS) {
      // Truncate the tool result to fit within budget
      const overhead = augmentedTokens - MAX_PROMPT_TOKENS;
      const trimChars = overhead * 4 + 200; // a bit extra
      const trimmedContent = toolResultContent.slice(0, Math.max(100, toolResultContent.length - trimChars));
      phase2Messages = [
        ...messages,
        {
          role: 'assistant',
          content: null,
          tool_calls: [toolCall],
        },
        {
          role: 'tool',
          tool_call_id: toolCallId,
          content: trimmedContent,
        },
      ];
    }

    const stream = await groqChatStream({
      apiKey: env.GROQ_API_KEY,
      model: env.GROQ_MODEL,
      messages: phase2Messages,
      systemPrompt,
    });
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        ...cors,
      },
    });
  } catch (err) {
    if (err instanceof GroqUpstreamError) {
      console.error('groq upstream error', { status: err.status, message: err.message, model: env.GROQ_MODEL });
      // Map Groq's own 429s onto more informative responses so the widget can
      // tell the visitor what's actually happening instead of "upstream error".
      if (err.status === 429) {
        const { isDailyLimit, retryAfterSec } = parseGroqRateLimit(err);
        return jsonError(
          429,
          isDailyLimit ? 'service_capacity' : 'service_busy',
          isDailyLimit
            ? "The assistant is taking a break for the day — daily token limit reached. Try again in a few hours."
            : 'The assistant is briefly overloaded. Try again in a moment.',
          { ...cors, 'Retry-After': String(retryAfterSec) }
        );
      }
      return jsonError(502, 'upstream_error', 'Upstream model error.', cors);
    }
    console.error('chat handler error', err);
    return jsonError(500, 'internal_error', 'Unexpected error.', cors);
  }
}

// Interprets a Groq 429. Prefers Groq's structured response headers
// (retry-after, x-ratelimit-remaining-requests for the daily RPD cap,
// x-ratelimit-remaining-tokens for the per-minute TPM cap) and falls back to
// parsing the error body only for whatever the headers don't answer.
function parseGroqRateLimit(err) {
  let { isDailyLimit, retryAfterSec } = parseGroqRateLimitBody(err.message || '');
  const headers = err.headers;
  if (headers && typeof headers.get === 'function') {
    const retryAfter = headers.get('retry-after');
    if (retryAfter !== null && Number.isFinite(Number(retryAfter))) {
      retryAfterSec = Math.max(1, Math.ceil(Number(retryAfter)));
    }
    // Requests are capped per day (RPD); tokens are capped per minute (TPM).
    // A zeroed remaining-requests header therefore means the daily cap.
    const remainingRequests = headers.get('x-ratelimit-remaining-requests');
    const remainingTokens = headers.get('x-ratelimit-remaining-tokens');
    if (remainingRequests !== null && Number(remainingRequests) <= 0) {
      isDailyLimit = true;
    } else if (remainingTokens !== null && Number(remainingTokens) <= 0) {
      isDailyLimit = false;
    }
  }
  return { isDailyLimit, retryAfterSec };
}

// Fallback: parses Groq's 429 error body for the retry hint and whether it's
// the daily (TPD) cap vs the per-minute (TPM/RPM) cap. Groq formats look like:
//   "Rate limit reached ... on tokens per day (TPD): Limit ..., Please try
//    again in 4m45.984s. ..."
//   "Rate limit reached ... on tokens per minute (TPM): ... try again in 7.37s"
function parseGroqRateLimitBody(message) {
  const isDailyLimit = /tokens per day|TPD/i.test(message);
  // Capture "try again in Xm Ys" or "Xs" — convert to whole seconds.
  let retryAfterSec = isDailyLimit ? 3600 : 60;
  const m = message.match(/try again in (?:(\d+)m)?(\d+(?:\.\d+)?)s/i);
  if (m) {
    const minutes = m[1] ? parseInt(m[1], 10) : 0;
    const seconds = parseFloat(m[2]);
    retryAfterSec = Math.max(1, Math.ceil(minutes * 60 + seconds));
  }
  return { isDailyLimit, retryAfterSec };
}
