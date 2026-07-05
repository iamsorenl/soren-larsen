/** @jest-environment node */
import { streamChat, summarize } from '../chatApi';

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

afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
});

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
        // eslint-disable-next-line no-unused-vars
        for await (const _chunk of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
            // consume
        }
    })()).rejects.toMatchObject({ kind: 'rateLimited', retryAfterSec: 30 });
});

test('streamChat throws ChatApiError with kind "upstream" on 5xx', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new FakeResponse('boom', { status: 502 }));
    await expect((async () => {
        // eslint-disable-next-line no-unused-vars
        for await (const _chunk of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
            // consume
        }
    })()).rejects.toMatchObject({ kind: 'upstream' });
});

test('streamChat throws ChatApiError with kind "badRequest" on 400', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new FakeResponse('nope', { status: 400 }));
    await expect((async () => {
        // eslint-disable-next-line no-unused-vars
        for await (const _chunk of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
            // consume
        }
    })()).rejects.toMatchObject({ kind: 'badRequest' });
});

test('streamChat maps a stalled first byte to a "network" error', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => { /* never settles */ }));

    const iterator = streamChat({ messages: [{ role: 'user', content: 'hi' }] });
    const first = iterator.next();
    jest.advanceTimersByTime(20001);
    await expect(first).rejects.toMatchObject({ kind: 'network' });
});

test('streamChat maps a mid-stream stall to a "network" error, keeping earlier chunks', async () => {
    jest.useFakeTimers();
    const encoder = new TextEncoder();
    const body = new ReadableStream({
        start(c) {
            c.enqueue(encoder.encode('par'));
            // never closes, never enqueues again → inactivity watchdog fires
        },
    });
    jest.spyOn(global, 'fetch').mockResolvedValue(new FakeResponse(body, { status: 200 }));

    const chunks = [];
    const consume = (async () => {
        for await (const chunk of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
            chunks.push(chunk);
        }
    })();
    // Flush microtasks so the first chunk arrives and the second read pends.
    for (let i = 0; i < 20; i++) await Promise.resolve();
    jest.advanceTimersByTime(20001);

    await expect(consume).rejects.toMatchObject({ kind: 'network' });
    expect(chunks).toEqual(['par']);
});

test('streamChat maps a mid-stream rejection to "upstream", keeping earlier chunks', async () => {
    const encoder = new TextEncoder();
    // Deliver one chunk, then error on the next pull so the first read
    // resolves before the failure (erroring inside start() would discard
    // the queued chunk entirely).
    let pullCount = 0;
    const body = new ReadableStream({
        pull(c) {
            pullCount++;
            if (pullCount === 1) c.enqueue(encoder.encode('par'));
            else c.error(new Error('worker exploded mid-response'));
        },
    });
    jest.spyOn(global, 'fetch').mockResolvedValue(new FakeResponse(body, { status: 200 }));

    const chunks = [];
    await expect((async () => {
        for await (const chunk of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
            chunks.push(chunk);
        }
    })()).rejects.toMatchObject({ kind: 'upstream' });
    expect(chunks).toEqual(['par']);
});

test('streamChat lets an AbortError propagate as a cancel, not an upstream error', async () => {
    const encoder = new TextEncoder();
    const abortErr = new Error('aborted');
    abortErr.name = 'AbortError';
    const body = new ReadableStream({
        start(c) {
            c.enqueue(encoder.encode('par'));
            c.error(abortErr);
        },
    });
    jest.spyOn(global, 'fetch').mockResolvedValue(new FakeResponse(body, { status: 200 }));

    await expect((async () => {
        // eslint-disable-next-line no-unused-vars
        for await (const _chunk of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
            // consume
        }
    })()).rejects.toMatchObject({ name: 'AbortError' });
});

test('streamChat flushes a buffered partial multi-byte sequence at stream end', async () => {
    // 'hé' encodes to [0x68, 0xC3, 0xA9]; ending after 0xC3 leaves the decoder
    // holding an incomplete sequence that only the final decode() flush emits.
    const bytes = new TextEncoder().encode('hé');
    const body = new ReadableStream({
        start(c) {
            c.enqueue(bytes.slice(0, 2));
            c.close();
        },
    });
    jest.spyOn(global, 'fetch').mockResolvedValue(new FakeResponse(body, { status: 200 }));

    const chunks = [];
    for await (const chunk of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
        chunks.push(chunk);
    }
    expect(chunks.join('')).toBe('h�');
});

test('summarize maps a hung request to a "network" error', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => { /* never settles */ }));

    const promise = summarize({ messages: [{ role: 'user', content: 'hi' }] });
    jest.advanceTimersByTime(20001);
    await expect(promise).rejects.toMatchObject({ kind: 'network' });
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
