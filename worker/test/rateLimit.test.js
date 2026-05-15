import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '../src/rateLimit.js';

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
});
