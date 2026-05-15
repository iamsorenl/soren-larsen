import { corsHeaders } from './cors.js';
import { checkRateLimit, clientIp } from './rateLimit.js';
import { buildSystemPrompt, estimateRequestTokens, MAX_PROMPT_TOKENS } from './systemPrompt.js';
import { groqChatStream, groqChatNonStreaming, GroqUpstreamError } from './groq.js';
import { TOOLS_SPEC, executeToolCall } from './tools.js';

function jsonError(status, error, message, extraHeaders = {}) {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
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
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError(400, 'bad_request', 'messages must be a non-empty array.', cors);
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
    // Phase 1: non-streaming call with tools to detect if the model wants to call a tool
    const phase1Message = await groqChatNonStreaming({
      apiKey: env.GROQ_API_KEY,
      model: env.GROQ_MODEL,
      messages,
      systemPrompt,
      tools: TOOLS_SPEC,
      tool_choice: 'auto',
    });

    const toolCalls = phase1Message.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      // No tool call — re-issue as streaming and pipe back to client
      const stream = await groqChatStream({
        apiKey: env.GROQ_API_KEY,
        model: env.GROQ_MODEL,
        messages,
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
    }

    // Phase 2: execute the first tool call and stream back the final answer
    const toolCall = toolCalls[0];
    const toolResultContent = await executeToolCall(toolCall, env, latestUserMessage);

    // Build augmented message list: original + assistant tool_call msg + tool result msg
    const toolCallId = toolCall.id || 'tc_0';
    const augmentedMessages = [
      ...messages,
      {
        role: 'assistant',
        content: phase1Message.content ?? null,
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
          content: phase1Message.content ?? null,
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
      return jsonError(502, 'upstream_error', 'Upstream model error.', cors);
    }
    console.error('chat handler error', err);
    return jsonError(500, 'internal_error', 'Unexpected error.', cors);
  }
}
