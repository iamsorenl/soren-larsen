import { WORKER_URL } from './chatConfig';

export class ChatApiError extends Error {
    constructor(kind, message, retryAfterSec = 0) {
        super(message);
        this.kind = kind; // 'network' | 'upstream' | 'rateLimited' | 'badRequest' | 'tooLarge'
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

function mapErrorResponse(res) {
    if (res.status === 429) {
        const retryAfterSec = Number(res.headers.get('Retry-After')) || 60;
        return new ChatApiError('rateLimited', 'Rate limited', retryAfterSec);
    }
    if (res.status === 413) return new ChatApiError('tooLarge', 'Conversation too large');
    if (res.status >= 500) return new ChatApiError('upstream', `Status ${res.status}`);
    return new ChatApiError('badRequest', `Status ${res.status}`);
}

export async function* streamChat({ messages, sessionSummary = null, signal }) {
    const res = await postJson('/api/chat', { messages, sessionSummary }, signal);
    if (!res.ok) throw mapErrorResponse(res);
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
    if (!res.ok) throw mapErrorResponse(res);
    const json = await res.json();
    return json.summary || '';
}
