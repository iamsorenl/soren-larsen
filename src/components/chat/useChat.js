import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChat, summarize, ChatApiError } from './chatApi';
import { loadSession, saveSession, clearSession } from './sessionStore';
import { planCompaction, estimateMessageTokens } from './compaction';
import { MAX_USER_MESSAGE_TOKENS } from './chatConfig';

const STATUS = {
    IDLE: 'idle',
    STREAMING: 'streaming',
    RATE_LIMITED: 'rateLimited',
    SERVICE_BUSY: 'serviceBusy',
    SERVICE_CAPACITY: 'serviceCapacity',
    TOO_LARGE: 'tooLarge',
    ERROR: 'error',
};

function statusForErrorKind(kind) {
    if (kind === 'rateLimited') return STATUS.RATE_LIMITED;
    if (kind === 'serviceBusy') return STATUS.SERVICE_BUSY;
    if (kind === 'serviceCapacity') return STATUS.SERVICE_CAPACITY;
    if (kind === 'tooLarge') return STATUS.TOO_LARGE;
    return STATUS.ERROR;
}

// Strip local-only fields (id) before putting messages on the wire.
function toWire(messages) {
    return messages.map(({ role, content }) => ({ role, content }));
}

export function useChat() {
    // Load the persisted session exactly once per mount.
    const [initialSession] = useState(() => loadSession());

    // Monotonic id counter for stable message keys, seeded past any ids that
    // came back from sessionStorage.
    const idRef = useRef(null);
    if (idRef.current === null) {
        let maxId = 0;
        for (const m of initialSession?.messages ?? []) {
            if (typeof m.id === 'number' && m.id > maxId) maxId = m.id;
        }
        idRef.current = maxId + 1;
    }
    const nextId = useCallback(() => idRef.current++, []);

    const [messages, setMessages] = useState(() =>
        (initialSession?.messages ?? []).map((m) => (m.id != null ? m : { ...m, id: idRef.current++ }))
    );
    const [summary, setSummary] = useState(() => initialSession?.summary ?? null);
    const [status, setStatus] = useState(STATUS.IDLE);
    const [errorKind, setErrorKind] = useState(null);
    const [retryAfterSec, setRetryAfterSec] = useState(0);
    const abortRef = useRef(null);
    // Wall-clock timestamp before which send() is a no-op (rate-limit gate).
    const retryUntilRef = useRef(0);

    const cancel = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
    }, []);

    // Unmounting mid-stream aborts the in-flight request.
    useEffect(() => () => cancel(), [cancel]);

    // Persistence happens only on status transitions (send start, stream
    // complete, error, reset) — never per streamed chunk, which would be
    // O(n²) serialization work across a response.
    const persist = useCallback((msgs, summ) => {
        saveSession({ messages: msgs, summary: summ });
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

    // Streams the reply into the message with id assistantId, accumulating the
    // full text in acc so callers can reconstruct final state without reading
    // it back out of React state.
    const consumeStream = useCallback(async (messagesToSend, summaryToSend, signal, assistantId, acc) => {
        for await (const chunk of streamChat({
            messages: toWire(messagesToSend),
            sessionSummary: summaryToSend,
            signal,
        })) {
            acc.text += chunk;
            const text = acc.text;
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: text } : m)));
        }
    }, []);

    const applyError = useCallback((err) => {
        const kind = err instanceof ChatApiError ? err.kind : 'network';
        if (err instanceof ChatApiError && err.retryAfterSec > 0) {
            setRetryAfterSec(err.retryAfterSec);
            retryUntilRef.current = Date.now() + err.retryAfterSec * 1000;
        }
        setErrorKind(kind);
        setStatus(statusForErrorKind(kind));
        removeEmptyAssistantPlaceholder();
    }, [removeEmptyAssistantPlaceholder]);

    const send = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        // abortRef-based guard rather than reading the closed-over `status`,
        // which can be stale when send() is invoked twice in the same render
        // before React re-renders. The button's disabled state covers the UI;
        // this covers programmatic callers.
        if (abortRef.current) return;
        // Rate-limit gate: the worker told us when we may retry via
        // Retry-After. Don't burn requests before then.
        if (retryUntilRef.current > Date.now()) return;
        retryUntilRef.current = 0;

        const newUserMsg = { id: nextId(), role: 'user', content: trimmed };

        // Pre-send guard: a single message this large can never succeed — the
        // 413 recovery path summarizes prior turns, which can't shrink the new
        // message itself. Short-circuit locally instead of two doomed 413s.
        if (estimateMessageTokens(newUserMsg) > MAX_USER_MESSAGE_TOKENS) {
            setErrorKind('tooLarge');
            setStatus(STATUS.TOO_LARGE);
            return;
        }

        const controller = new AbortController();
        abortRef.current = controller;

        setStatus(STATUS.STREAMING);
        setErrorKind(null);
        setRetryAfterSec(0);

        const priorMessages = messages;
        const assistantMsg = { id: nextId(), role: 'assistant', content: '' };
        const acc = { text: '' };
        setMessages([...priorMessages, newUserMsg, assistantMsg]);
        persist([...priorMessages, newUserMsg], summary);

        try {
            await consumeStream([...priorMessages, newUserMsg], summary, controller.signal, assistantMsg.id, acc);
            setStatus(STATUS.IDLE);

            const finalMessages = [...priorMessages, newUserMsg, { ...assistantMsg, content: acc.text }];
            let nextMessages = finalMessages;
            let nextSummary = summary;

            // Soft proactive summarization once history grows past the token
            // threshold. The plan is computed outside any state updater and
            // summarize() is called exactly once; messages are only truncated
            // together with the new summary after it resolves. On failure we
            // keep the full message array — no data loss for a failed call.
            const plan = planCompaction(finalMessages);
            if (plan) {
                try {
                    const newSummary = await summarize({
                        messages: toWire(plan.toSummarize),
                        priorSummary: summary,
                        signal: controller.signal,
                    });
                    nextSummary = newSummary || null;
                    nextMessages = plan.keep;
                    setSummary(nextSummary);
                    setMessages(plan.keep);
                } catch (summarizeErr) {
                    console.warn('Chat compaction summarize failed; keeping full history.', summarizeErr);
                }
            }
            persist(nextMessages, nextSummary);
        } catch (err) {
            if (err.name === 'AbortError') {
                setStatus(STATUS.IDLE);
                // Keep partial assistant text if any streamed before the cancel.
                persist(
                    acc.text
                        ? [...priorMessages, newUserMsg, { ...assistantMsg, content: acc.text }]
                        : [...priorMessages, newUserMsg],
                    summary
                );
                return;
            }

            // 413: try to recover by summarizing prior turns and retrying once
            // with just the new user message attached to the new summary.
            if (err instanceof ChatApiError && err.kind === 'tooLarge' && priorMessages.length > 0) {
                let retried = false;
                let retrySummary = summary;
                try {
                    const newSummary = await summarize({
                        messages: toWire(priorMessages),
                        priorSummary: summary,
                        signal: controller.signal,
                    });
                    retrySummary = newSummary || null;
                    setSummary(retrySummary);
                    acc.text = '';
                    retried = true;
                    setMessages([newUserMsg, { ...assistantMsg, content: '' }]);
                    await consumeStream([newUserMsg], retrySummary, controller.signal, assistantMsg.id, acc);
                    setStatus(STATUS.IDLE);
                    persist([newUserMsg, { ...assistantMsg, content: acc.text }], retrySummary);
                    return;
                } catch (retryErr) {
                    const retryMessages = retried
                        ? (acc.text ? [newUserMsg, { ...assistantMsg, content: acc.text }] : [newUserMsg])
                        : [...priorMessages, newUserMsg];
                    if (retryErr.name === 'AbortError') {
                        setStatus(STATUS.IDLE);
                        persist(retryMessages, retrySummary);
                        return;
                    }
                    applyError(retryErr);
                    persist(retryMessages, retrySummary);
                    return;
                }
            }

            applyError(err);
            // Preserve any partial assistant text already rendered; drop only
            // the empty placeholder. Error copy is never message content.
            persist(
                acc.text
                    ? [...priorMessages, newUserMsg, { ...assistantMsg, content: acc.text }]
                    : [...priorMessages, newUserMsg],
                summary
            );
        } finally {
            // Always clear the abort marker so the next send can proceed.
            // (cancel() may have already cleared it; this is the redundant
            // safety net for the success path.)
            if (abortRef.current === controller) {
                abortRef.current = null;
            }
        }
    }, [messages, summary, consumeStream, applyError, persist, nextId]);

    const reset = useCallback(() => {
        cancel();
        clearSession();
        setMessages([]);
        setSummary(null);
        setStatus(STATUS.IDLE);
        setErrorKind(null);
        setRetryAfterSec(0);
        retryUntilRef.current = 0;
    }, [cancel]);

    return { messages, status, errorKind, retryAfterSec, send, cancel, reset };
}
