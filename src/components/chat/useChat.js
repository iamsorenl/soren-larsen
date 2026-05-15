import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChat, summarize, ChatApiError } from './chatApi';
import { loadSession, saveSession, clearSession } from './sessionStore';
import { SUMMARIZE_AFTER_TURNS, KEEP_TAIL_TURNS } from './chatConfig';

export function useChat() {
    const [messages, setMessages] = useState(() => {
        const stored = loadSession();
        return stored?.messages ?? [];
    });
    const [summary, setSummary] = useState(() => loadSession()?.summary ?? null);
    const [status, setStatus] = useState('idle'); // 'idle' | 'streaming' | 'rateLimited' | 'error'
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

    const send = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || status === 'streaming') return;

        cancel();
        const controller = new AbortController();
        abortRef.current = controller;

        setStatus('streaming');
        setErrorKind(null);
        setMessages((prev) => [
            ...prev,
            { role: 'user', content: trimmed },
            { role: 'assistant', content: '' },
        ]);

        try {
            for await (const chunk of streamChat({
                messages: [...messages, { role: 'user', content: trimmed }],
                sessionSummary: summary,
                signal: controller.signal,
            })) {
                setMessages((prev) => {
                    const next = prev.slice();
                    const last = next[next.length - 1];
                    next[next.length - 1] = { ...last, content: last.content + chunk };
                    return next;
                });
            }
            setStatus('idle');

            // Background summarization if we've grown too long.
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
                setStatus('idle');
                return;
            }
            const kind = err instanceof ChatApiError ? err.kind : 'network';
            setErrorKind(kind);
            setStatus(kind === 'rateLimited' ? 'rateLimited' : 'error');
            // Remove the empty assistant placeholder on hard error.
            setMessages((prev) => {
                if (prev[prev.length - 1]?.role === 'assistant' && prev[prev.length - 1].content === '') {
                    return prev.slice(0, -1);
                }
                return prev;
            });
        }
    }, [messages, summary, status, cancel]);

    const reset = useCallback(() => {
        cancel();
        skipSaveRef.current = true;
        clearSession();
        setMessages([]);
        setSummary(null);
        setStatus('idle');
        setErrorKind(null);
    }, [cancel]);

    return { messages, status, errorKind, send, cancel, reset };
}
