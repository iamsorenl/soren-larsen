import { corsHeaders } from './cors.js';
import { checkNoteLimit, clientIp } from './rateLimit.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_NEWLINE = /[\r\n]/;

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

// Every field must be a string; name and email also go into email headers,
// so CR/LF is rejected outright (header injection).
function validNote(b) {
  if (!b || typeof b !== 'object') return false;
  const { name, email, message } = b;
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') return false;
  return name.length >= 1 && name.length <= 100 && !HAS_NEWLINE.test(name)
    && email.length <= 200 && !HAS_NEWLINE.test(email) && EMAIL_RE.test(email)
    && message.length >= 10 && message.length <= 2000;
}

export async function sendNote(env, { name, email, message }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify({
      from: 'Portfolio <onboarding@resend.dev>',
      to: env.NOTE_TO_EMAIL,
      reply_to: email,
      subject: 'larsensoren.com note from ' + name,
      text: message,
    }),
  });
  if (!res.ok) throw new Error(`Resend status ${res.status}`);
}

// Turnstile is verified in index.js before this runs. Order here: validate,
// then rate limit (only valid notes count), then send.
export async function handleNote(request, env) {
  const cors = corsHeaders(request, env);
  if (Number(request.headers.get('Content-Length')) > 8192) {
    return json(413, { error: 'too_large' }, cors);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'invalid' }, cors);
  }
  if (!validNote(body)) return json(400, { error: 'invalid' }, cors);

  const rl = await checkNoteLimit(env.RATE_LIMIT, clientIp(request));
  if (!rl.allowed) {
    return json(429, { error: 'rate_limited' }, { ...cors, 'Retry-After': String(rl.retryAfterSec) });
  }
  try {
    await sendNote(env, { name: body.name, email: body.email, message: body.message });
  } catch (err) {
    console.error('note send failed', err.message);
    return json(502, { error: 'send_failed' }, cors);
  }
  return json(200, { ok: true }, cors);
}
