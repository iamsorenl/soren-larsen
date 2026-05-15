import { corsHeaders } from './cors.js';
import { checkRateLimit, clientIp } from './rateLimit.js';
import { SUMMARIZE_SYSTEM_PROMPT } from './systemPrompt.js';
import { groqChatJson, GroqUpstreamError } from './groq.js';

function jsonError(status, error, message, extraHeaders = {}) {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export async function handleSummarize(request, env) {
  const cors = corsHeaders(request, env);
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'bad_request', 'Invalid JSON body.', cors);
  }
  const { messages, priorSummary } = body || {};
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

  const transcript = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
  const userContent = priorSummary
    ? `PRIOR SUMMARY:\n${priorSummary}\n\nNEW TURNS:\n${transcript}`
    : transcript;

  try {
    const summary = await groqChatJson({
      apiKey: env.GROQ_API_KEY,
      model: env.GROQ_SUMMARY_MODEL,
      messages: [{ role: 'user', content: userContent }],
      systemPrompt: SUMMARIZE_SYSTEM_PROMPT,
    });
    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  } catch (err) {
    if (err instanceof GroqUpstreamError) {
      return jsonError(502, 'upstream_error', 'Upstream model error.', cors);
    }
    console.error('summarize handler error', err);
    return jsonError(500, 'internal_error', 'Unexpected error.', cors);
  }
}
