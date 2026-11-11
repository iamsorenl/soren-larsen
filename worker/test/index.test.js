import { describe, it, expect, vi } from 'vitest';
import worker from '../src/index.js';

const env = {
  GROQ_API_KEY: 'k',
  GROQ_MODEL: 'llama-3.1-8b-instant',
  GROQ_SUMMARY_MODEL: 'llama-3.1-8b-instant',
  ALLOWED_ORIGINS: 'http://localhost:3000',
  RATE_LIMIT: { get: async () => null, put: async () => {} },
};

describe('Worker router', () => {
  it('handles CORS preflight', async () => {
    const req = new Request('http://x/api/chat', {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:3000' },
    });
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
  });

  it('returns 404 for unknown routes', async () => {
    const req = new Request('http://x/nope', { method: 'POST' });
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(404);
  });

  it('returns 403 for /api/note without a Turnstile token and never sends', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    const req = new Request('http://x/api/note', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ada', email: 'ada@example.com', message: 'Hello Soren, nice site.' }),
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' },
    });
    const res = await worker.fetch(req, { ...env, RESEND_API_KEY: 'k', NOTE_TO_EMAIL: 'o@example.com' });
    expect(res.status).toBe(403);
    expect(f).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('returns 405 for non-POST on chat', async () => {
    const req = new Request('http://x/api/chat', { method: 'GET' });
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(405);
  });
});
