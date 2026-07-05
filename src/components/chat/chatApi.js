import { WORKER_URL } from './chatConfig';

export class ChatApiError extends Error {
    constructor(kind, message, retryAfterSec = 0) {
        super(message);
        // 'network' | 'upstream' | 'rateLimited' | 'serviceBusy' |
        // 'serviceCapacity' | 'badRequest' | 'tooLarge'
        this.kind = kind;
        this.retryAfterSec = retryAfterSec;
    }
}

// A stalled worker must not wedge the widget: without these, abortRef stays
// set forever and every future send is silently dropped. First-byte covers
// fetch + headers; inactivity covers gaps between streamed chunks.
export const FIRST_BYTE_TIMEOUT_MS = 20000;
export const STREAM_INACTIVITY_TIMEOUT_MS = 20000;

// Race a promise against a watchdog. On timeout, fires onTimeout (used to
// abort the underlying fetch) and rejects with a 'network' ChatApiError.
function withTimeout(promise, ms, message, onTimeout) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
            if (onTimeout) onTimeout();
            reject(new ChatApiError('network', message));
        }, ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Chain the caller's signal onto a locally-owned controller so the watchdogs
// can abort the underlying fetch without owning the caller's controller.
function chainedController(signal) {
    const controller = new AbortController();
    if (signal) {
        if (signal.aborted) controller.abort();
        else signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
    return controller;
}

async function postJson(path, body, signal) {
    try {
        return await fetch(`${WORKER_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal,
        });
    } catch (err) {
        if (err.name === 'AbortError') throw err;
        throw new ChatApiError('network', err.message);
    }
}

async function mapErrorResponse(res) {
    if (res.status === 429) {
        const retryAfterSec = Number(res.headers.get('Retry-After')) || 60;
        // Differentiate the three 429 sources by reading the error code the
        // worker put in the JSON body. Falls back to plain 'rateLimited' if
        // the body can't be parsed.
        let kind = 'rateLimited';
        try {
            const body = await res.clone().json();
            if (body.error === 'service_capacity') kind = 'serviceCapacity';
            else if (body.error === 'service_busy') kind = 'serviceBusy';
        } catch { /* keep default */ }
        return new ChatApiError(kind, 'Rate limited', retryAfterSec);
    }
    if (res.status === 413) return new ChatApiError('tooLarge', 'Conversation too large');
    if (res.status >= 500) return new ChatApiError('upstream', `Status ${res.status}`);
    return new ChatApiError('badRequest', `Status ${res.status}`);
}

export async function* streamChat({ messages, sessionSummary = null, signal }) {
    const controller = chainedController(signal);
    const res = await withTimeout(
        postJson('/api/chat', { messages, sessionSummary }, controller.signal),
        FIRST_BYTE_TIMEOUT_MS,
        'Timed out waiting for the assistant to respond',
        () => controller.abort()
    );
    if (!res.ok) throw await mapErrorResponse(res);
    if (!res.body) throw new ChatApiError('upstream', 'No response body');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    try {
        while (true) {
            let result;
            try {
                result = await withTimeout(
                    reader.read(),
                    STREAM_INACTIVITY_TIMEOUT_MS,
                    'The response stream stalled',
                    () => controller.abort()
                );
            } catch (err) {
                if (err instanceof ChatApiError) throw err; // watchdog → 'network'
                if (err.name === 'AbortError') throw err; // caller cancel stays a cancel
                // The worker errored the stream after the 200 header (e.g. the
                // upstream model fell over mid-response). Partial text already
                // yielded stays with the caller; surface as an upstream error.
                throw new ChatApiError('upstream', err.message || 'Stream failed mid-response');
            }
            if (result.done) break;
            yield decoder.decode(result.value, { stream: true });
        }
        // Flush any partial multi-byte sequence buffered by streaming decode.
        const tail = decoder.decode();
        if (tail) yield tail;
    } finally {
        try { reader.releaseLock(); } catch { /* noop */ }
    }
}

export async function summarize({ messages, priorSummary = null, signal }) {
    const controller = chainedController(signal);
    const res = await withTimeout(
        postJson('/api/summarize', { messages, priorSummary }, controller.signal),
        FIRST_BYTE_TIMEOUT_MS,
        'Timed out waiting for the summarizer',
        () => controller.abort()
    );
    if (!res.ok) throw await mapErrorResponse(res);
    const json = await res.json();
    return json.summary || '';
}
