import { corsHeaders } from './cors.js';
import { checkRateLimit, clientIp } from './rateLimit.js';
import { buildSystemPrompt } from './systemPrompt.js';
import { groqChatStream, GroqUpstreamError } from './groq.js';

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

  const systemPrompt = buildSystemPrompt(sessionSummary || null);
  try {
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
  } catch (err) {
    if (err instanceof GroqUpstreamError) {
      return jsonError(502, 'upstream_error', 'Upstream model error.', cors);
    }
    console.error('chat handler error', err);
    return jsonError(500, 'internal_error', 'Unexpected error.', cors);
  }
}
