import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleNote } from '../src/note.js';

class MockKV {
  constructor() { this.store = new Map(); }
  async get(key, type) {
    const v = this.store.get(key);
    if (v === undefined) return null;
    return type === 'json' ? JSON.parse(v) : v;
  }
  async put(key, value) { this.store.set(key, value); }
}

const mkEnv = () => ({
  RESEND_API_KEY: 'test-key',
  NOTE_TO_EMAIL: 'owner@example.com',
  ALLOWED_ORIGINS: 'http://localhost:3000',
  RATE_LIMIT: new MockKV(),
});
const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello Soren, nice site.' };
const mkReq = (body, ip = '1.2.3.4') => new Request('http://x/api/note', {
  method: 'POST',
  body: typeof body === 'string' ? body : JSON.stringify(body),
  headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip },
});

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function stubFetch(status = 200) {
  const f = vi.fn(async () => new Response('{}', { status }));
  vi.stubGlobal('fetch', f);
  return f;
}

describe('handleNote', () => {
  it('sends a valid note through Resend', async () => {
    const f = stubFetch();
    const res = await handleNote(mkReq(valid), mkEnv());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(f).toHaveBeenCalledTimes(1);
    const [url, init] = f.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer test-key');
    const sent = JSON.parse(init.body);
    expect(sent.reply_to).toBe('ada@example.com');
    expect(sent.to).toBe('owner@example.com');
    expect(sent.subject).toBe('larsensoren.com note from Ada');
    expect(sent.text).toBe(valid.message);
  });

  it.each([
    ['CRLF in name', { ...valid, name: 'a\r\nBcc: x@y.z' }],
    ['LF in name', { ...valid, name: 'a\nb' }],
    ['CR in email', { ...valid, email: 'a@b.co\rBcc: x@y.z' }],
    ['LF in email', { ...valid, email: 'a@b.co\nBcc: x@y.z' }],
    ['bad email', { ...valid, email: 'nope' }],
    ['email too long', { ...valid, email: 'a'.repeat(200) + '@b.co' }],
    ['empty name', { ...valid, name: '' }],
    ['long name', { ...valid, name: 'a'.repeat(101) }],
    ['short message', { ...valid, message: 'too short' }],
    ['long message', { ...valid, message: 'a'.repeat(2001) }],
    ['non-string name', { ...valid, name: ['Ada'] }],
    ['non-string email', { ...valid, email: { a: 1 } }],
    ['non-string message', { ...valid, message: 12345678901 }],
    ['missing fields', {}],
    ['null body', null],
  ])('rejects %s with 400 and never calls Resend', async (_l, body) => {
    const f = stubFetch();
    const res = await handleNote(mkReq(body), mkEnv());
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid' });
    expect(f).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON with 400', async () => {
    const f = stubFetch();
    const res = await handleNote(mkReq('{nope'), mkEnv());
    expect(res.status).toBe(400);
    expect(f).not.toHaveBeenCalled();
  });

  it('returns 502 when Resend answers non-2xx', async () => {
    stubFetch(500);
    const res = await handleNote(mkReq(valid), mkEnv());
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'send_failed' });
  });

  it('returns 502 when the Resend request throws', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('boom'); }));
    const res = await handleNote(mkReq(valid), mkEnv());
    expect(res.status).toBe(502);
  });

  it('returns 429 on the 4th valid note from one IP and does not send it', async () => {
    const f = stubFetch();
    const env = mkEnv();
    for (let i = 0; i < 3; i++) expect((await handleNote(mkReq(valid), env)).status).toBe(200);
    const res = await handleNote(mkReq(valid), env);
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0);
    expect(f).toHaveBeenCalledTimes(3);
  });

  it('does not count invalid input against the limit', async () => {
    stubFetch();
    const env = mkEnv();
    for (let i = 0; i < 5; i++) await handleNote(mkReq({ ...valid, email: 'nope' }), env);
    expect((await handleNote(mkReq(valid), env)).status).toBe(200);
  });
});
