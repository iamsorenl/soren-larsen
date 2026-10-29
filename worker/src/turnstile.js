import { clientIp } from './rateLimit.js';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
export const TURNSTILE_HEADER = 'X-Turnstile-Token';

/**
 * Verify the request's Turnstile token with Cloudflare Siteverify. Fails
 * closed: a missing secret, missing hostname allowlist, network error or any
 * mismatch returns false. Tokens are single-use, so the frontend fetches a
 * fresh one per request.
 * @param {Request} request
 * @param {object} env - needs TURNSTILE_SECRET and TURNSTILE_HOSTNAMES
 * @param {string} expectedAction - 'chat' | 'summarize'
 * @returns {Promise<boolean>}
 */
export async function verifyTurnstile(request, env, expectedAction) {
  const token = request.headers.get(TURNSTILE_HEADER);
  const hostnames = new Set(
    (env.TURNSTILE_HOSTNAMES || '').split(',').map((h) => h.trim()).filter(Boolean)
  );
  if (!env.TURNSTILE_SECRET || hostnames.size === 0) return false;
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) return false;

  let result;
  try {
    const r = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        // 'local' only happens under wrangler dev; Siteverify wants a real IP.
        ...(clientIp(request) !== 'local' && { remoteip: clientIp(request) }),
      }),
    });
    if (!r.ok) return false;
    result = await r.json();
  } catch {
    return false;
  }
  return result.success === true
    && result.action === expectedAction
    && hostnames.has(result.hostname);
}
