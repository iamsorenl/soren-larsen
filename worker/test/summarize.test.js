import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleSummarize } from '../src/summarize.js';

class MockKV {
  constructor() { this.store = new Map(); }
  async get() { return null; }
  async put() {}
}

const baseEnv = {
  GROQ_API_KEY: 'k',
  GROQ_SUMMARY_MODEL: 'llama-3.1-8b-instant',
  ALLOWED_ORIGINS: 'http://localhost:3000',
  RATE_LIMIT: new MockKV(),
};

afterEach(() => { vi.restoreAllMocks(); });

describe('handleSummarize', () => {
  it('returns 400 for missing messages', async () => {
    const req = new Request('http://x/api/summarize', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await handleSummarize(req, baseEnv);
    expect(res.status).toBe(400);
  });

  it('returns { summary } JSON on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: 'visitor asked about X' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    const req = new Request('http://x/api/summarize', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hi' }, { role: 'assistant', content: 'hello' }],
      }),
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.1.1.1' },
    });
    const res = await handleSummarize(req, { ...baseEnv, RATE_LIMIT: new MockKV() });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.summary).toBe('visitor asked about X');
  });
});
