import { describe, it, expect, vi, afterEach } from 'vitest';
import worker from '../src/index.js';
import { verifyTurnstile } from '../src/turnstile.js';

const env = {
  TURNSTILE_SECRET: 's',
  TURNSTILE_HOSTNAMES: 'larsensoren.com,www.larsensoren.com',
  ALLOWED_ORIGINS: 'https://larsensoren.com',
};

afterEach(() => { vi.restoreAllMocks(); });

function req(token, path = '/api/chat') {
  const headers = { 'Content-Type': 'application/json', Origin: 'https://larsensoren.com' };
  if (token !== undefined) headers['X-Turnstile-Token'] = token;
  return new Request(`http://x${path}`, { method: 'POST', headers, body: '{}' });
}

function siteverify(result, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(result), { status }));
}

const good = { success: true, action: 'chat', hostname: 'larsensoren.com' };

describe('verifyTurnstile', () => {
  it('accepts a valid token for the right action and hostname', async () => {
    const spy = siteverify(good);
    expect(await verifyTurnstile(req('t'), env, 'chat')).toBe(true);
    const body = spy.mock.calls[0][1].body;
    expect(body.get('secret')).toBe('s');
    expect(body.get('response')).toBe('t');
  });

  it.each([
    ['failed check', { ...good, success: false }],
    ['wrong action', { ...good, action: 'summarize' }],
    ['unapproved hostname', { ...good, hostname: 'evil.example' }],
    ['localhost token in prod', { ...good, hostname: 'localhost' }],
  ])('rejects %s', async (_, result) => {
    siteverify(result);
    expect(await verifyTurnstile(req('t'), env, 'chat')).toBe(false);
  });

  it('rejects a missing token without calling Siteverify', async () => {
    const spy = siteverify(good);
    expect(await verifyTurnstile(req(undefined), env, 'chat')).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('fails closed without a secret or hostname allowlist', async () => {
    siteverify(good);
    expect(await verifyTurnstile(req('t'), { ...env, TURNSTILE_SECRET: '' }, 'chat')).toBe(false);
    expect(await verifyTurnstile(req('t'), { ...env, TURNSTILE_HOSTNAMES: '' }, 'chat')).toBe(false);
  });

  it('fails closed when Siteverify errors', async () => {
    siteverify({}, 500);
    expect(await verifyTurnstile(req('t'), env, 'chat')).toBe(false);
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('down'));
    expect(await verifyTurnstile(req('t'), env, 'chat')).toBe(false);
  });
});

describe('router gate', () => {
  it('returns 403 with CORS headers before any handler runs', async () => {
    siteverify({ ...good, success: false });
    const res = await worker.fetch(req('t'), env);
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('verification_failed');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://larsensoren.com');
  });

  it('checks the summarize action on /api/summarize', async () => {
    siteverify(good); // action 'chat' token replayed against summarize
    const res = await worker.fetch(req('t', '/api/summarize'), env);
    expect(res.status).toBe(403);
  });

  it('allows the token header in preflight', async () => {
    const res = await worker.fetch(new Request('http://x/api/chat', { method: 'OPTIONS', headers: { Origin: 'https://larsensoren.com' } }), env);
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('X-Turnstile-Token');
  });
});
