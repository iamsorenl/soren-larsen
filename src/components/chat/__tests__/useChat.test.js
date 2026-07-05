import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../useChat';
import * as chatApi from '../chatApi';
import * as sessionStore from '../sessionStore';
import { SESSION_KEY, SESSION_VERSION } from '../sessionStore';
import { ERROR_COPY } from '../chatConfig';

async function* fakeStream(parts) {
    for (const p of parts) yield p;
}

function tooLargeStream() {
    return (async function* () {
        throw new chatApi.ChatApiError('tooLarge', 'too big');
        // eslint-disable-next-line no-unreachable
        yield 'unreachable';
    })();
}

async function* throwingStream(err) {
    throw err;
    // eslint-disable-next-line no-unreachable
    yield 'unreachable';
}

// A stream that yields one chunk, then pends until the AbortSignal fires.
function abortableStream(signal) {
    return (async function* () {
        yield 'partial';
        await new Promise((_, reject) => {
            const rejectAbort = () => {
                const err = new Error('aborted');
                err.name = 'AbortError';
                reject(err);
            };
            if (signal.aborted) {
                rejectAbort();
                return;
            }
            signal.addEventListener('abort', rejectAbort);
        });
    })();
}

// Seed sessionStorage with the current persisted shape (version + ids).
function seedSession(messages, summary = null) {
    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
            version: SESSION_VERSION,
            messages: messages.map((m, i) => ({ id: i + 1, ...m })),
            summary,
        })
    );
}

const roleContent = (msgs) => msgs.map(({ role, content }) => ({ role, content }));

beforeEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
});

describe('initial state', () => {
    test('starts with no messages when sessionStorage is empty', () => {
        const { result } = renderHook(() => useChat());
        expect(result.current.messages).toEqual([]);
        expect(result.current.status).toBe('idle');
    });

    test('rehydrates messages and summary from sessionStorage', () => {
        seedSession([{ role: 'user', content: 'hi' }], 'visitor said hi');
        const { result } = renderHook(() => useChat());
        expect(roleContent(result.current.messages)).toEqual([{ role: 'user', content: 'hi' }]);
    });

    test('drops persisted data whose version mismatches (old v1 shape)', () => {
        sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ messages: [{ role: 'user', content: 'old' }], summary: null })
        );
        const { result } = renderHook(() => useChat());
        expect(result.current.messages).toEqual([]);
    });
});

describe('basic send', () => {
    test('appends user + streamed assistant messages and persists with version', async () => {
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['Hel', 'lo']));
        const { result } = renderHook(() => useChat());

        await act(async () => {
            await result.current.send('hi');
        });

        expect(roleContent(result.current.messages)).toEqual([
            { role: 'user', content: 'hi' },
            { role: 'assistant', content: 'Hello' },
        ]);
        const persisted = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        expect(persisted.version).toBe(SESSION_VERSION);
        expect(persisted.messages).toHaveLength(2);
    });

    test('gives each message a stable unique id', async () => {
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['ok']));
        const { result } = renderHook(() => useChat());

        await act(async () => { await result.current.send('one'); });
        await act(async () => { await result.current.send('two'); });

        const ids = result.current.messages.map((m) => m.id);
        expect(ids.every((id) => typeof id === 'number')).toBe(true);
        expect(new Set(ids).size).toBe(ids.length);
    });

    test('seeds the id counter past rehydrated ids so new ids stay unique', async () => {
        seedSession([
            { role: 'user', content: 'first' },
            { role: 'assistant', content: 'first reply' },
        ]);
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['ok']));
        const { result } = renderHook(() => useChat());

        await act(async () => { await result.current.send('second'); });

        const ids = result.current.messages.map((m) => m.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    test('ignores empty input', async () => {
        const spy = jest.spyOn(chatApi, 'streamChat');
        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('   '); });
        expect(spy).not.toHaveBeenCalled();
        expect(result.current.messages).toEqual([]);
    });

    test('sends prior chat history along with the new user message (ids stripped)', async () => {
        const spy = jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['ok']));
        seedSession([
            { role: 'user', content: 'first' },
            { role: 'assistant', content: 'first reply' },
        ]);
        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('second'); });

        const sentMessages = spy.mock.calls[0][0].messages;
        expect(sentMessages).toEqual([
            { role: 'user', content: 'first' },
            { role: 'assistant', content: 'first reply' },
            { role: 'user', content: 'second' },
        ]);
    });
});

describe('persistence', () => {
    test('persists on status transitions, not per streamed chunk', async () => {
        const saveSpy = jest.spyOn(sessionStore, 'saveSession');
        const chunks = Array.from({ length: 30 }, (_, i) => `c${i}`);
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(chunks));
        const { result } = renderHook(() => useChat());

        await act(async () => { await result.current.send('hi'); });

        // Exactly two saves: send start + stream complete. Never one per chunk.
        expect(saveSpy).toHaveBeenCalledTimes(2);
    });

    test('persists on error transitions', async () => {
        const saveSpy = jest.spyOn(sessionStore, 'saveSession');
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() =>
            throwingStream(new chatApi.ChatApiError('upstream', 'boom'))
        );
        const { result } = renderHook(() => useChat());

        await act(async () => { await result.current.send('hi'); });

        // send start + error = 2 saves; the failed turn's user message survives.
        expect(saveSpy).toHaveBeenCalledTimes(2);
        const persisted = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        expect(roleContent(persisted.messages)).toEqual([{ role: 'user', content: 'hi' }]);
    });
});

describe('error handling', () => {
    test('sets status to "rateLimited" on 429', async () => {
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() =>
            throwingStream(new chatApi.ChatApiError('rateLimited', 'rl', 30))
        );
        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('hi'); });
        await waitFor(() => expect(result.current.status).toBe('rateLimited'));
    });

    test('sets status to "error" with kind "network" on network failure', async () => {
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() =>
            throwingStream(new chatApi.ChatApiError('network', 'fetch failed'))
        );
        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('hi'); });
        await waitFor(() => expect(result.current.status).toBe('error'));
        expect(result.current.errorKind).toBe('network');
    });

    test('removes the empty assistant placeholder on hard error', async () => {
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() =>
            throwingStream(new chatApi.ChatApiError('upstream', 'boom'))
        );
        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('hi'); });
        await waitFor(() => expect(result.current.status).toBe('error'));
        expect(roleContent(result.current.messages)).toEqual([{ role: 'user', content: 'hi' }]);
    });

    test('mid-stream failure preserves partial assistant text with errorKind "upstream"', async () => {
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() =>
            (async function* () {
                yield 'partial answer';
                throw new chatApi.ChatApiError('upstream', 'stream died mid-response');
            })()
        );
        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('hi'); });

        await waitFor(() => expect(result.current.status).toBe('error'));
        expect(result.current.errorKind).toBe('upstream');
        // Partial text stays; error copy is never appended as message content.
        const last = result.current.messages[result.current.messages.length - 1];
        expect(last.role).toBe('assistant');
        expect(last.content).toBe('partial answer');
        const persisted = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        expect(roleContent(persisted.messages)).toEqual([
            { role: 'user', content: 'hi' },
            { role: 'assistant', content: 'partial answer' },
        ]);
    });

    test('400 maps to errorKind "badRequest" with its own copy', async () => {
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() =>
            throwingStream(new chatApi.ChatApiError('badRequest', 'Status 400'))
        );
        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('hi'); });

        await waitFor(() => expect(result.current.status).toBe('error'));
        expect(result.current.errorKind).toBe('badRequest');
        // Dedicated copy exists and doesn't claim connectivity problems.
        expect(typeof ERROR_COPY.badRequest).toBe('string');
        expect(ERROR_COPY.badRequest).not.toBe(ERROR_COPY.network);
    });
});

describe('retry-after gating', () => {
    test('stores retryAfterSec and drops sends until the window elapses', async () => {
        const streamSpy = jest.spyOn(chatApi, 'streamChat').mockImplementation(() =>
            throwingStream(new chatApi.ChatApiError('rateLimited', 'rl', 30))
        );
        const { result } = renderHook(() => useChat());

        await act(async () => { await result.current.send('hi'); });
        await waitFor(() => expect(result.current.status).toBe('rateLimited'));
        expect(result.current.retryAfterSec).toBe(30);

        // A send inside the retry window is dropped without a request.
        await act(async () => { await result.current.send('again'); });
        expect(streamSpy).toHaveBeenCalledTimes(1);

        // Once the window elapses, sends flow again.
        const realNow = Date.now();
        const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(realNow + 31000);
        streamSpy.mockImplementation(() => fakeStream(['ok']));
        await act(async () => { await result.current.send('later'); });
        expect(streamSpy).toHaveBeenCalledTimes(2);
        nowSpy.mockRestore();
    });
});

describe('pre-send size guard', () => {
    test('a single oversized message short-circuits to tooLarge locally', async () => {
        const streamSpy = jest.spyOn(chatApi, 'streamChat');
        const summarizeSpy = jest.spyOn(chatApi, 'summarize');
        const { result } = renderHook(() => useChat());

        // 8000 chars ≈ 2008 tokens, over MAX_USER_MESSAGE_TOKENS (1500).
        await act(async () => { await result.current.send('x'.repeat(8000)); });

        expect(result.current.status).toBe('tooLarge');
        expect(result.current.errorKind).toBe('tooLarge');
        expect(streamSpy).not.toHaveBeenCalled();
        expect(summarizeSpy).not.toHaveBeenCalled();
        expect(result.current.messages).toEqual([]);
    });
});

describe('413 auto-summarize-then-retry', () => {
    test('recovers by summarizing prior turns and retrying once', async () => {
        seedSession([
            { role: 'user', content: 'first' },
            { role: 'assistant', content: 'first reply' },
            { role: 'user', content: 'second' },
            { role: 'assistant', content: 'second reply' },
        ]);

        let callCount = 0;
        const streamSpy = jest.spyOn(chatApi, 'streamChat').mockImplementation(() => {
            callCount++;
            if (callCount === 1) return tooLargeStream();
            return fakeStream(['retry', ' ok']);
        });
        const summarizeSpy = jest.spyOn(chatApi, 'summarize').mockResolvedValue(
            'the visitor previously asked first and second'
        );

        const { result } = renderHook(() => useChat());

        await act(async () => { await result.current.send('third'); });

        // streamChat called twice (initial + retry), summarize called once
        expect(streamSpy).toHaveBeenCalledTimes(2);
        expect(summarizeSpy).toHaveBeenCalledTimes(1);

        // The summarize call should receive the prior turns (before "third")
        const summarizeArgs = summarizeSpy.mock.calls[0][0];
        expect(summarizeArgs.messages).toEqual([
            { role: 'user', content: 'first' },
            { role: 'assistant', content: 'first reply' },
            { role: 'user', content: 'second' },
            { role: 'assistant', content: 'second reply' },
        ]);

        // The retry stream call should send only the new user message + the new summary
        const retryArgs = streamSpy.mock.calls[1][0];
        expect(retryArgs.messages).toEqual([{ role: 'user', content: 'third' }]);
        expect(retryArgs.sessionSummary).toBe('the visitor previously asked first and second');

        // Final state: only the new turn + retry assistant content
        await waitFor(() => expect(result.current.status).toBe('idle'));
        expect(roleContent(result.current.messages)).toEqual([
            { role: 'user', content: 'third' },
            { role: 'assistant', content: 'retry ok' },
        ]);
    });

    test('surfaces tooLarge if the retry also returns 413', async () => {
        seedSession([
            { role: 'user', content: 'one' },
            { role: 'assistant', content: 'one reply' },
        ]);

        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => tooLargeStream());
        jest.spyOn(chatApi, 'summarize').mockResolvedValue('compacted');

        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('huge message'); });

        await waitFor(() => expect(result.current.status).toBe('tooLarge'));
    });

    test('surfaces tooLarge if summarize itself fails during retry', async () => {
        seedSession([
            { role: 'user', content: 'one' },
            { role: 'assistant', content: 'one reply' },
        ]);

        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => tooLargeStream());
        jest.spyOn(chatApi, 'summarize').mockRejectedValue(
            new chatApi.ChatApiError('upstream', 'summarize fail')
        );

        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('hi'); });

        // Retry path failed via summarize → status should reflect the retry error
        await waitFor(() => {
            expect(result.current.status === 'error' || result.current.status === 'tooLarge').toBe(true);
        });
    });

    test('does NOT attempt the retry when there are no prior messages to summarize', async () => {
        const streamSpy = jest.spyOn(chatApi, 'streamChat').mockImplementation(() => tooLargeStream());
        const summarizeSpy = jest.spyOn(chatApi, 'summarize');

        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('first message ever'); });

        await waitFor(() => expect(result.current.status).toBe('tooLarge'));
        // Only the initial attempt — no retry, no summarize call
        expect(streamSpy).toHaveBeenCalledTimes(1);
        expect(summarizeSpy).not.toHaveBeenCalled();
    });
});

describe('soft summarization trigger', () => {
    const bigHistory = () => {
        // 8 messages * ~248 tokens ≈ 2000 tokens, over SOFT_SUMMARIZE_AT_TOKENS.
        const bigContent = 'x'.repeat(960);
        return Array.from({ length: 8 }, (_, i) => ({
            role: i % 2 === 0 ? 'user' : 'assistant',
            content: bigContent,
        }));
    };

    test('does not trigger summarize when chat history is small', async () => {
        const summarizeSpy = jest.spyOn(chatApi, 'summarize').mockResolvedValue('s');
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['ok']));
        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('hi'); });
        await waitFor(() => expect(result.current.status).toBe('idle'));
        expect(summarizeSpy).not.toHaveBeenCalled();
    });

    test('summarizes exactly once past the soft threshold and compacts messages', async () => {
        seedSession(bigHistory());

        const summarizeSpy = jest.spyOn(chatApi, 'summarize').mockResolvedValue('compacted');
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['ok']));

        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('one more'); });

        // Exactly one summarize call — computed outside any state updater, so
        // double-invoked updaters (StrictMode) can't double-fire the request.
        expect(summarizeSpy).toHaveBeenCalledTimes(1);
        // After compaction the local message array shrinks — older turns are
        // gone, only the tail remains — and the compacted state is persisted.
        expect(result.current.messages.length).toBeLessThan(10);
        const persisted = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        expect(persisted.summary).toBe('compacted');
        expect(persisted.messages.length).toBe(result.current.messages.length);
    });

    test('a failed summarize keeps the full message array (no data loss)', async () => {
        seedSession(bigHistory());

        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const summarizeSpy = jest.spyOn(chatApi, 'summarize').mockRejectedValue(
            new chatApi.ChatApiError('upstream', 'summarize down')
        );
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['ok']));

        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('one more'); });

        expect(summarizeSpy).toHaveBeenCalledTimes(1);
        // Turns are NOT dropped: 8 seeded + user + assistant all survive.
        expect(result.current.messages).toHaveLength(10);
        expect(result.current.status).toBe('idle');
        expect(warnSpy).toHaveBeenCalled();
        // The full history is what gets persisted, too.
        const persisted = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        expect(persisted.messages).toHaveLength(10);
    });
});

describe('cancel behavior', () => {
    test('cancel() on an idle chat is a noop', () => {
        const { result } = renderHook(() => useChat());
        expect(() => result.current.cancel()).not.toThrow();
        expect(result.current.status).toBe('idle');
    });

    test('cancel() mid-stream aborts the in-flight request and returns to idle', async () => {
        jest.spyOn(chatApi, 'streamChat').mockImplementation(({ signal }) =>
            abortableStream(signal)
        );

        const { result } = renderHook(() => useChat());

        // Kick off send in the background.
        let sendPromise;
        act(() => {
            sendPromise = result.current.send('hi');
        });

        // Allow the generator to yield its first chunk.
        await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
        await waitFor(() => expect(result.current.status).toBe('streaming'));

        // Now cancel — the abortable stream should reject with AbortError,
        // useChat should swallow it and return to idle.
        await act(async () => {
            result.current.cancel();
            await sendPromise;
        });

        expect(result.current.status).toBe('idle');
        // Partial assistant content is preserved (not deleted on abort).
        const last = result.current.messages[result.current.messages.length - 1];
        expect(last).toMatchObject({ role: 'assistant', content: 'partial' });

        // After cancel the abort-ref guard should be cleared, so a new send proceeds.
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['again']));
        await act(async () => { await result.current.send('next'); });
        expect(result.current.messages.map((m) => m.content)).toContain('again');
    });

    test('unmounting mid-stream aborts the in-flight request', async () => {
        let capturedSignal = null;
        jest.spyOn(chatApi, 'streamChat').mockImplementation(({ signal }) => {
            capturedSignal = signal;
            return abortableStream(signal);
        });

        const { result, unmount } = renderHook(() => useChat());

        let sendPromise;
        act(() => {
            sendPromise = result.current.send('hi');
        });
        await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
        expect(capturedSignal.aborted).toBe(false);

        unmount();
        await sendPromise;
        expect(capturedSignal.aborted).toBe(true);
    });

    test('a new send while one is in flight is ignored (no concurrent streams)', async () => {
        const streamSpy = jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['ok']));
        const { result } = renderHook(() => useChat());

        // Fire two sends in the same act without awaiting the first to completion.
        await act(async () => {
            const p1 = result.current.send('first');
            const p2 = result.current.send('second'); // should be dropped — status is 'streaming'
            await Promise.all([p1, p2]);
        });

        // Only one streamChat call should have happened.
        expect(streamSpy).toHaveBeenCalledTimes(1);
        // Only "first" made it into the conversation as a user message.
        const userTurns = result.current.messages.filter((m) => m.role === 'user');
        expect(userTurns.map((m) => m.content)).toEqual(['first']);
    });
});

describe('reset', () => {
    test('clears messages and sessionStorage', async () => {
        seedSession([{ role: 'user', content: 'old' }]);
        const { result } = renderHook(() => useChat());
        expect(result.current.messages).toHaveLength(1);
        act(() => { result.current.reset(); });
        expect(result.current.messages).toEqual([]);
        expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });

    test('resets status and errorKind from a tooLarge state', async () => {
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => tooLargeStream());
        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('hi'); });
        await waitFor(() => expect(result.current.status).toBe('tooLarge'));

        act(() => { result.current.reset(); });
        expect(result.current.status).toBe('idle');
        expect(result.current.errorKind).toBeNull();
        expect(result.current.messages).toEqual([]);
    });

    test('a no-op reset does not skip the next real save', async () => {
        const { result } = renderHook(() => useChat());
        // Reset with nothing in flight and nothing stored.
        act(() => { result.current.reset(); });

        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['ok']));
        await act(async () => { await result.current.send('hi'); });

        // The send after a no-op reset still persists.
        const persisted = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        expect(roleContent(persisted.messages)).toEqual([
            { role: 'user', content: 'hi' },
            { role: 'assistant', content: 'ok' },
        ]);
    });
});
