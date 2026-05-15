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
    const res = await postJson('/api/chat', { messages, sessionSummary }, signal);
    if (!res.ok) throw await mapErrorResponse(res);
    if (!res.body) throw new ChatApiError('upstream', 'No response body');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            yield decoder.decode(value, { stream: true });
        }
    } finally {
        try { reader.releaseLock(); } catch { /* noop */ }
    }
}

export async function summarize({ messages, priorSummary = null, signal }) {
    const res = await postJson('/api/summarize', { messages, priorSummary }, signal);
    if (!res.ok) throw await mapErrorResponse(res);
    const json = await res.json();
    return json.summary || '';
}
