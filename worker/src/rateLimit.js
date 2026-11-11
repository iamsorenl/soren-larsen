export const RATE_LIMIT_MAX = 10;
export const RATE_LIMIT_WINDOW_MS = 60_000;
// Global cap across ALL clients per minute window. The per-IP limit alone
// doesn't stop distributed abuse (many IPs, each under the per-IP cap), so
// this is a hard ceiling on total upstream traffic.
export const GLOBAL_RATE_LIMIT_MAX = 60;
const GLOBAL_KEY_PREFIX = 'global:';

export function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || 'local';
}

export async function checkRateLimit(kv, ip) {
  // The 'local' bypass is safe in production: Cloudflare always sets
  // CF-Connecting-IP on requests that reach a deployed Worker, so ip can
  // only be 'local' in local dev (wrangler dev / tests) where the header is
  // absent. Real traffic always carries an IP and is rate limited below.
  if (ip === 'local') {
    return { allowed: true, remaining: RATE_LIMIT_MAX, retryAfterSec: 0 };
  }
  const now = Date.now();
  const existing = await kv.get(ip, 'json');
  let count = 0;
  let windowStart = now;
  if (existing && now - existing.windowStart < RATE_LIMIT_WINDOW_MS) {
    count = existing.count;
    windowStart = existing.windowStart;
  }
  count += 1;
  await kv.put(ip, JSON.stringify({ count, windowStart }), {
    expirationTtl: 120,
  });
  if (count > RATE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil((windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec: Math.max(retryAfterSec, 1) };
  }

  // Second layer: global per-minute counter shared by all IPs. One KV key per
  // minute window; checked alongside the per-IP limit so a swarm of distinct
  // IPs still can't exceed GLOBAL_RATE_LIMIT_MAX requests/minute in total.
  const windowId = Math.floor(now / RATE_LIMIT_WINDOW_MS);
  const globalKey = `${GLOBAL_KEY_PREFIX}${windowId}`;
  const globalCount = (((await kv.get(globalKey, 'json')) || 0) + 1);
  await kv.put(globalKey, JSON.stringify(globalCount), {
    expirationTtl: 120,
  });
  if (globalCount > GLOBAL_RATE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil(((windowId + 1) * RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec: Math.max(retryAfterSec, 1) };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX - count, retryAfterSec: 0 };
}

export const NOTE_LIMIT_MAX = 3;
export const NOTE_LIMIT_WINDOW_MS = 3_600_000;
// Hard ceiling on notes across ALL IPs per hour window, same idea as the chat global cap.
export const NOTE_GLOBAL_LIMIT_MAX = 20;

// Per-IP cap on notes (each one sends an email). Same shape as checkRateLimit,
// separate key prefix and a one hour window.
export async function checkNoteLimit(kv, ip) {
  if (ip === 'local') return { allowed: true, retryAfterSec: 0 };
  const key = `note:${ip}`;
  const now = Date.now();
  const existing = await kv.get(key, 'json');
  let count = 0;
  let windowStart = now;
  if (existing && now - existing.windowStart < NOTE_LIMIT_WINDOW_MS) {
    count = existing.count;
    windowStart = existing.windowStart;
  }
  count += 1;
  await kv.put(key, JSON.stringify({ count, windowStart }), {
    expirationTtl: Math.ceil(NOTE_LIMIT_WINDOW_MS / 1000) + 60,
  });
  if (count > NOTE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil((windowStart + NOTE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSec: Math.max(retryAfterSec, 1) };
  }

  const windowId = Math.floor(now / NOTE_LIMIT_WINDOW_MS);
  const globalKey = `note-global:${windowId}`;
  const globalCount = (((await kv.get(globalKey, 'json')) || 0) + 1);
  await kv.put(globalKey, JSON.stringify(globalCount), {
    expirationTtl: Math.ceil(NOTE_LIMIT_WINDOW_MS / 1000) + 60,
  });
  if (globalCount > NOTE_GLOBAL_LIMIT_MAX) {
    const retryAfterSec = Math.ceil(((windowId + 1) * NOTE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSec: Math.max(retryAfterSec, 1) };
  }
  return { allowed: true, retryAfterSec: 0 };
}
