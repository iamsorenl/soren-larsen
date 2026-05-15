import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChat, summarize, ChatApiError } from './chatApi';
import { loadSession, saveSession, clearSession } from './sessionStore';
import { SOFT_SUMMARIZE_AT_TOKENS, KEEP_TAIL_TOKENS } from './chatConfig';

function estimateMessageTokens(message) {
    return Math.ceil((message.content || '').length / 4) + 8;
}

function totalChatTokens(messages) {
    let total = 0;
    for (const m of messages) total += estimateMessageTokens(m);
    return total;
}

// Walk from newest backward, accumulating tokens. Everything older than
// KEEP_TAIL_TOKENS gets compacted. Returns null when chat is small enough or
// there's nothing to summarize.
function planCompaction(messages) {
    if (totalChatTokens(messages) < SOFT_SUMMARIZE_AT_TOKENS) return null;
    let running = 0;
    let splitIndex = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
        running += estimateMessageTokens(messages[i]);
        if (running >= KEEP_TAIL_TOKENS) {
            splitIndex = i;
            break;
        }
    }
    if (splitIndex <= 0) return null;
    return {
        toSummarize: messages.slice(0, splitIndex),
        keep: messages.slice(splitIndex),
    };
}

const STATUS = {
    IDLE: 'idle',
    STREAMING: 'streaming',
    RATE_LIMITED: 'rateLimited',
    TOO_LARGE: 'tooLarge',
    ERROR: 'error',
};

function statusForErrorKind(kind) {
    if (kind === 'rateLimited') return STATUS.RATE_LIMITED;
    if (kind === 'tooLarge') return STATUS.TOO_LARGE;
    return STATUS.ERROR;
}

export function useChat() {
    const [messages, setMessages] = useState(() => {
        const stored = loadSession();
        return stored?.messages ?? [];
    });
    const [summary, setSummary] = useState(() => loadSession()?.summary ?? null);
    const [status, setStatus] = useState(STATUS.IDLE);
    const [errorKind, setErrorKind] = useState(null);
    const abortRef = useRef(null);
    const skipSaveRef = useRef(false);

    useEffect(() => {
        if (skipSaveRef.current) {
            skipSaveRef.current = false;
            return;
        }
        saveSession({ messages, summary });
    }, [messages, summary]);

    const cancel = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
    }, []);

    const removeEmptyAssistantPlaceholder = useCallback(() => {
        setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant' && last.content === '') {
                return prev.slice(0, -1);
            }
            return prev;
        });
    }, []);

    const consumeStream = useCallback(async (messagesToSend, summaryToSend, signal) => {
        for await (const chunk of streamChat({
            messages: messagesToSend,
            sessionSummary: summaryToSend,
            signal,
        })) {
            setMessages((prev) => {
                const next = prev.slice();
                const last = next[next.length - 1];
                next[next.length - 1] = { ...last, content: last.content + chunk };
                return next;
            });
        }
    }, []);

    const send = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || status === STATUS.STREAMING) return;

        cancel();
        const controller = new AbortController();
        abortRef.current = controller;

        setStatus(STATUS.STREAMING);
        setErrorKind(null);

        const priorMessages = messages;
        const newUserMsg = { role: 'user', content: trimmed };
        setMessages([...priorMessages, newUserMsg, { role: 'assistant', content: '' }]);

        try {
            await consumeStream([...priorMessages, newUserMsg], summary, controller.signal);
            setStatus(STATUS.IDLE);

            // Soft proactive summarization once history grows past the token
            // threshold. Token-based so a flurry of one-word exchanges doesn't
            // burn a summarize call and a single long paste doesn't sneak past.
            setMessages((prev) => {
                const plan = planCompaction(prev);
                if (!plan) return prev;
                summarize({ messages: plan.toSummarize, priorSummary: summary })
                    .then((s) => { setSummary(s || null); })
                    .catch(() => { /* silent — degraded path */ });
                return plan.keep;
            });
        } catch (err) {
            if (err.name === 'AbortError') {
                setStatus(STATUS.IDLE);
                return;
            }

            // 413: try to recover by summarizing prior turns and retrying once
            // with just the new user message attached to the new summary.
            if (err instanceof ChatApiError && err.kind === 'tooLarge' && priorMessages.length > 0) {
                try {
                    const newSummary = await summarize({
                        messages: priorMessages,
                        priorSummary: summary,
                        signal: controller.signal,
                    });
                    setSummary(newSummary || null);
                    setMessages([newUserMsg, { role: 'assistant', content: '' }]);
                    await consumeStream([newUserMsg], newSummary || null, controller.signal);
                    setStatus(STATUS.IDLE);
                    return;
                } catch (retryErr) {
                    if (retryErr.name === 'AbortError') {
                        setStatus(STATUS.IDLE);
                        return;
                    }
                    const kind = retryErr instanceof ChatApiError ? retryErr.kind : 'network';
                    setErrorKind(kind);
                    setStatus(statusForErrorKind(kind));
                    removeEmptyAssistantPlaceholder();
                    return;
                }
            }

            const kind = err instanceof ChatApiError ? err.kind : 'network';
            setErrorKind(kind);
            setStatus(statusForErrorKind(kind));
            removeEmptyAssistantPlaceholder();
        }
    }, [messages, summary, status, cancel, consumeStream, removeEmptyAssistantPlaceholder]);

    const reset = useCallback(() => {
        cancel();
        skipSaveRef.current = true;
        clearSession();
        setMessages([]);
        setSummary(null);
        setStatus(STATUS.IDLE);
        setErrorKind(null);
    }, [cancel]);

    return { messages, status, errorKind, send, cancel, reset };
}
