import { describe, it, expect } from 'vitest';
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

  it('returns 405 for non-POST on chat', async () => {
    const req = new Request('http://x/api/chat', { method: 'GET' });
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(405);
  });
});
