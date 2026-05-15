import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleChat } from '../src/chat.js';

class MockKV {
  constructor() { this.store = new Map(); }
  async get(key, type) {
    const v = this.store.get(key);
    if (v === undefined) return null;
    return type === 'json' ? JSON.parse(v) : v;
  }
  async put(key, value) { this.store.set(key, value); }
}

const baseEnv = {
  GROQ_API_KEY: 'k',
  GROQ_MODEL: 'llama-3.1-8b-instant',
  ALLOWED_ORIGINS: 'http://localhost:3000',
  RATE_LIMIT: new MockKV(),
};

afterEach(() => { vi.restoreAllMocks(); });

function mockGroqStream(text) {
  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(c) {
        c.enqueue(enc.encode(`data: {"choices":[{"delta":{"content":${JSON.stringify(text)}}}]}\n\n`));
        c.enqueue(enc.encode('data: [DONE]\n\n'));
        c.close();
      },
    }),
    { status: 200 }
  );
}

describe('handleChat', () => {
  it('returns 400 for invalid JSON body', async () => {
    const env = { ...baseEnv, RATE_LIMIT: new MockKV() };
    const req = new Request('http://x/api/chat', { method: 'POST', body: 'nope' });
    const res = await handleChat(req, env);
    expect(res.status).toBe(400);
  });

  it('returns 400 when messages is missing or empty', async () => {
    const env = { ...baseEnv, RATE_LIMIT: new MockKV() };
    const req = new Request('http://x/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await handleChat(req, env);
    expect(res.status).toBe(400);
  });

  it('streams plain text from Groq', async () => {
    const env = { ...baseEnv, RATE_LIMIT: new MockKV() };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockGroqStream('hello'));
    const req = new Request('http://x/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' },
    });
    const res = await handleChat(req, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toMatch(/text\/plain/);
    const text = await res.text();
    expect(text).toBe('hello');
  });

  it('returns 429 with Retry-After when rate limited', async () => {
    const kv = new MockKV();
    const env = { ...baseEnv, RATE_LIMIT: kv };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockGroqStream('x'));
    const body = JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] });
    const headers = { 'Content-Type': 'application/json', 'CF-Connecting-IP': '5.6.7.8' };
    for (let i = 0; i < 10; i++) {
      await handleChat(new Request('http://x/api/chat', { method: 'POST', body, headers }), env);
    }
    const res = await handleChat(new Request('http://x/api/chat', { method: 'POST', body, headers }), env);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBeTruthy();
  });

  it('returns 413 when the request exceeds the token budget', async () => {
    const env = { ...baseEnv, RATE_LIMIT: new MockKV() };
    // 60k chars ~= 15k tokens, well above MAX_PROMPT_TOKENS (5500)
    const huge = 'x'.repeat(60000);
    const req = new Request('http://x/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: huge }] }),
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '2.2.2.2' },
    });
    const res = await handleChat(req, env);
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.error).toBe('too_large');
  });

  it('returns 502 when Groq upstream fails', async () => {
    const env = { ...baseEnv, RATE_LIMIT: new MockKV() };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('boom', { status: 500 }));
    const req = new Request('http://x/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '9.9.9.9' },
    });
    const res = await handleChat(req, env);
    expect(res.status).toBe(502);
  });
});
