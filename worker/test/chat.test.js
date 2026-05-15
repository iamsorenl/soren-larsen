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
  GITHUB_TOKEN: 'github-test-token',
  README_CACHE: new MockKV(),
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

/** Phase 1: non-streaming Groq response with no tool call */
function mockGroqPhase1NoTool(content = 'hello') {
  return new Response(
    JSON.stringify({ choices: [{ message: { role: 'assistant', content } }] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

/** Phase 1: non-streaming Groq response that contains a tool call */
function mockGroqPhase1WithToolCall(toolCallId, repoUrl) {
  return new Response(
    JSON.stringify({
      choices: [{
        message: {
          role: 'assistant',
          content: null,
          tool_calls: [{
            id: toolCallId,
            type: 'function',
            function: {
              name: 'fetch_repo_readme',
              arguments: JSON.stringify({ github_url: repoUrl }),
            },
          }],
        },
      }],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
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

  it('streams plain text from Groq when Phase 1 returns no tool call', async () => {
    const env = { ...baseEnv, RATE_LIMIT: new MockKV(), README_CACHE: new MockKV() };
    // Phase 1 returns text (no tool call), Phase 2 returns streaming response
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockGroqPhase1NoTool('hello'))
      .mockResolvedValueOnce(mockGroqStream('hello'));
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
    const env = { ...baseEnv, RATE_LIMIT: kv, README_CACHE: new MockKV() };
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockGroqPhase1NoTool('x'))
      .mockResolvedValue(mockGroqStream('x'));
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
    const env = { ...baseEnv, RATE_LIMIT: new MockKV(), README_CACHE: new MockKV() };
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
    const env = { ...baseEnv, RATE_LIMIT: new MockKV(), README_CACHE: new MockKV() };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('boom', { status: 500 }));
    const req = new Request('http://x/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '9.9.9.9' },
    });
    const res = await handleChat(req, env);
    expect(res.status).toBe(502);
  });

  it('Phase 1 returns text (no tool) → re-issues as streaming and returns plain text', async () => {
    const env = { ...baseEnv, RATE_LIMIT: new MockKV(), README_CACHE: new MockKV() };
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockGroqPhase1NoTool('direct answer'))
      .mockResolvedValueOnce(mockGroqStream('direct answer'));
    const req = new Request('http://x/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'what is Soren studying?' }] }),
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '10.0.0.1' },
    });
    const res = await handleChat(req, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toMatch(/text\/plain/);
    const text = await res.text();
    expect(text).toBe('direct answer');
  });

  it('Phase 1 returns tool_call → executes tool → Phase 2 streams final answer', async () => {
    const env = { ...baseEnv, RATE_LIMIT: new MockKV(), README_CACHE: new MockKV() };
    const repoUrl = 'https://github.com/iamsorenl/EduMUSE';

    vi.spyOn(globalThis, 'fetch')
      // Call 1: Phase 1 Groq (non-streaming) → returns tool call
      .mockResolvedValueOnce(mockGroqPhase1WithToolCall('tc_1', repoUrl))
      // Call 2: GitHub README fetch
      .mockResolvedValueOnce(
        new Response('# EduMUSE\nAn educational music platform.\n\n## Architecture\nBuilt with React.', { status: 200 })
      )
      // Call 3: Phase 2 Groq (streaming) → returns answer
      .mockResolvedValueOnce(mockGroqStream('EduMUSE uses React for its architecture.'));

    const req = new Request('http://x/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'how does EduMUSE work internally?' }] }),
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '10.0.0.2' },
    });
    const res = await handleChat(req, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toMatch(/text\/plain/);
    const text = await res.text();
    expect(text).toBe('EduMUSE uses React for its architecture.');
  });
});
