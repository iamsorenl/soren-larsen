export const RATE_LIMIT_MAX = 10;
export const RATE_LIMIT_WINDOW_MS = 60_000;

export function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || 'local';
}

export async function checkRateLimit(kv, ip) {
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
  return { allowed: true, remaining: RATE_LIMIT_MAX - count, retryAfterSec: 0 };
}
