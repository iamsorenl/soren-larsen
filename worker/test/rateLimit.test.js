import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS, GLOBAL_RATE_LIMIT_MAX } from '../src/rateLimit.js';

class MockKV {
  constructor() { this.store = new Map(); }
  async get(key, type) {
    const v = this.store.get(key);
    if (v === undefined) return null;
    return type === 'json' ? JSON.parse(v) : v;
  }
  async put(key, value) { this.store.set(key, value); }
}

let kv;
beforeEach(() => { kv = new MockKV(); });
afterEach(() => { vi.restoreAllMocks(); });

describe('checkRateLimit', () => {
  it('allows the first request', async () => {
    const r = await checkRateLimit(kv, '1.2.3.4');
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(RATE_LIMIT_MAX - 1);
  });

  it('blocks after exceeding the limit in the window', async () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      await checkRateLimit(kv, '1.2.3.4');
    }
    const r = await checkRateLimit(kv, '1.2.3.4');
    expect(r.allowed).toBe(false);
    expect(r.retryAfterSec).toBeGreaterThan(0);
  });

  it('resets after the window expires', async () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      await checkRateLimit(kv, '1.2.3.4');
    }
    const expired = { count: RATE_LIMIT_MAX, windowStart: Date.now() - RATE_LIMIT_WINDOW_MS - 1000 };
    await kv.put('1.2.3.4', JSON.stringify(expired));
    const r = await checkRateLimit(kv, '1.2.3.4');
    expect(r.allowed).toBe(true);
  });

  it('skips enforcement for "local" key', async () => {
    for (let i = 0; i < RATE_LIMIT_MAX + 5; i++) {
      const r = await checkRateLimit(kv, 'local');
      expect(r.allowed).toBe(true);
    }
  });

  it('global cap blocks even when every IP is under the per-IP limit', async () => {
    // Pin time so the test can't straddle a minute-window boundary.
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    // Each request comes from a distinct IP, so per-IP counts stay at 1.
    for (let i = 0; i < GLOBAL_RATE_LIMIT_MAX; i++) {
      const r = await checkRateLimit(kv, `10.0.${Math.floor(i / 250)}.${i % 250}`);
      expect(r.allowed).toBe(true);
    }
    const blocked = await checkRateLimit(kv, '10.9.9.9');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it('global counter resets in a new minute window', async () => {
    const t0 = 1_700_000_000_000;
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(t0);
    for (let i = 0; i < GLOBAL_RATE_LIMIT_MAX + 1; i++) {
      await checkRateLimit(kv, `10.1.${Math.floor(i / 250)}.${i % 250}`);
    }
    // Advance into the next minute window — a fresh global key applies.
    nowSpy.mockReturnValue(t0 + RATE_LIMIT_WINDOW_MS);
    const r = await checkRateLimit(kv, '10.9.9.10');
    expect(r.allowed).toBe(true);
  });
});
