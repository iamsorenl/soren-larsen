/** @jest-environment node */
import { streamChat, summarize, ChatApiError } from '../chatApi';

// ---------------------------------------------------------------------------
// Minimal fake web globals for Jest 27 + Node 24 (jest-environment-node
// does not expose browser globals even though Node 24 has them natively).
// ---------------------------------------------------------------------------
const { ReadableStream } = require('stream/web');
const { TextEncoder, TextDecoder } = require('util');

class FakeHeaders {
    constructor(init = {}) {
        this._map = {};
        for (const [k, v] of Object.entries(init)) {
            this._map[k.toLowerCase()] = v;
        }
    }
    get(name) { return this._map[name.toLowerCase()] ?? null; }
}

class FakeResponse {
    constructor(body, { status = 200, headers = {} } = {}) {
        this.status = status;
        this.ok = status >= 200 && status < 300;
        this.headers = new FakeHeaders(headers);
        if (body instanceof ReadableStream) {
            this.body = body;
        } else {
            // string / JSON body — expose via json() / text()
            this._raw = typeof body === 'string' ? body : JSON.stringify(body);
            this.body = null;
        }
    }
    async json() { return JSON.parse(this._raw); }
    async text() { return this._raw; }
}

// ---------------------------------------------------------------------------
// Bootstrap globals before any test runs.
// ---------------------------------------------------------------------------
beforeAll(() => {
    if (typeof global.fetch === 'undefined')  global.fetch  = jest.fn();
    if (typeof global.Response === 'undefined') global.Response = FakeResponse;
    if (typeof global.ReadableStream === 'undefined') global.ReadableStream = ReadableStream;
    if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
    if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;
});

afterEach(() => { jest.restoreAllMocks(); });

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function textStreamResponse(chunks, status = 200, headers = {}) {
    const encoder = new TextEncoder();
    const body = new ReadableStream({
        start(c) {
            for (const chunk of chunks) c.enqueue(encoder.encode(chunk));
            c.close();
        },
    });
    return new FakeResponse(body, { status, headers });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
test('streamChat yields decoded text chunks', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(textStreamResponse(['hel', 'lo']));
    const chunks = [];
    for await (const chunk of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
        chunks.push(chunk);
    }
    expect(chunks.join('')).toBe('hello');
});

test('streamChat throws ChatApiError with kind "rateLimited" on 429', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
        new FakeResponse(JSON.stringify({ error: 'rate_limited' }), {
            status: 429,
            headers: { 'Retry-After': '30', 'Content-Type': 'application/json' },
        })
    );
    await expect((async () => {
        for await (const _ of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
            // consume
        }
    })()).rejects.toMatchObject({ kind: 'rateLimited', retryAfterSec: 30 });
});

test('streamChat throws ChatApiError with kind "upstream" on 5xx', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new FakeResponse('boom', { status: 502 }));
    await expect((async () => {
        for await (const _ of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
            // consume
        }
    })()).rejects.toMatchObject({ kind: 'upstream' });
});

test('summarize returns the summary string', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
        new FakeResponse(JSON.stringify({ summary: 'visitor asked about X' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    );
    const out = await summarize({ messages: [{ role: 'user', content: 'hi' }] });
    expect(out).toBe('visitor asked about X');
});
