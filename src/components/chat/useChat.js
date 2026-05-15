import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChat, summarize, ChatApiError } from './chatApi';
import { loadSession, saveSession, clearSession } from './sessionStore';
import { SUMMARIZE_AFTER_TURNS, KEEP_TAIL_TURNS } from './chatConfig';

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

            // Soft proactive summarization once history grows past the threshold.
            setMessages((prev) => {
                const userTurns = prev.filter((m) => m.role === 'user').length;
                if (userTurns >= SUMMARIZE_AFTER_TURNS) {
                    const tailStart = Math.max(0, prev.length - KEEP_TAIL_TURNS * 2);
                    const toSummarize = prev.slice(0, tailStart);
                    const keep = prev.slice(tailStart);
                    summarize({ messages: toSummarize, priorSummary: summary })
                        .then((s) => { setSummary(s || null); })
                        .catch(() => { /* silent — degraded path */ });
                    return keep;
                }
                return prev;
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
