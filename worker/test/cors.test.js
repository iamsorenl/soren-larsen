import { describe, it, expect } from 'vitest';
import { corsHeaders, handlePreflight } from '../src/cors.js';

const env = { ALLOWED_ORIGINS: 'https://a.com,https://b.com,http://localhost:3000' };

describe('corsHeaders', () => {
  it('echoes allowed origin', () => {
    const req = new Request('https://example.com', { headers: { Origin: 'https://a.com' } });
    const h = corsHeaders(req, env);
    expect(h['Access-Control-Allow-Origin']).toBe('https://a.com');
    expect(h['Vary']).toBe('Origin');
  });

  it('returns empty headers for disallowed origin', () => {
    const req = new Request('https://example.com', { headers: { Origin: 'https://evil.com' } });
    const h = corsHeaders(req, env);
    expect(h['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('returns empty headers for missing origin', () => {
    const req = new Request('https://example.com');
    const h = corsHeaders(req, env);
    expect(h['Access-Control-Allow-Origin']).toBeUndefined();
  });
});

describe('handlePreflight', () => {
  it('returns 204 with CORS headers for allowed origin', async () => {
    const req = new Request('https://example.com', {
      method: 'OPTIONS',
      headers: { Origin: 'https://a.com', 'Access-Control-Request-Method': 'POST' },
    });
    const res = handlePreflight(req, env);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://a.com');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });
});
