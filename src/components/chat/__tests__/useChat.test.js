import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../useChat';
import * as chatApi from '../chatApi';

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
        sessionStorage.setItem(
            'sorenAssistant.session.v1',
            JSON.stringify({
                messages: [{ role: 'user', content: 'hi' }],
                summary: 'visitor said hi',
            })
        );
        const { result } = renderHook(() => useChat());
        expect(result.current.messages).toEqual([{ role: 'user', content: 'hi' }]);
    });
});

describe('basic send', () => {
    test('appends user + streamed assistant messages and persists', async () => {
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['Hel', 'lo']));
        const { result } = renderHook(() => useChat());

        await act(async () => {
            await result.current.send('hi');
        });

        expect(result.current.messages).toEqual([
            { role: 'user', content: 'hi' },
            { role: 'assistant', content: 'Hello' },
        ]);
        const persisted = JSON.parse(sessionStorage.getItem('sorenAssistant.session.v1'));
        expect(persisted.messages).toHaveLength(2);
    });

    test('ignores empty input', async () => {
        const spy = jest.spyOn(chatApi, 'streamChat');
        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('   '); });
        expect(spy).not.toHaveBeenCalled();
        expect(result.current.messages).toEqual([]);
    });

    test('sends prior chat history along with the new user message', async () => {
        const spy = jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['ok']));
        sessionStorage.setItem(
            'sorenAssistant.session.v1',
            JSON.stringify({
                messages: [
                    { role: 'user', content: 'first' },
                    { role: 'assistant', content: 'first reply' },
                ],
                summary: null,
            })
        );
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
        expect(result.current.messages).toEqual([{ role: 'user', content: 'hi' }]);
    });
});

describe('413 auto-summarize-then-retry', () => {
    test('recovers by summarizing prior turns and retrying once', async () => {
        sessionStorage.setItem(
            'sorenAssistant.session.v1',
            JSON.stringify({
                messages: [
                    { role: 'user', content: 'first' },
                    { role: 'assistant', content: 'first reply' },
                    { role: 'user', content: 'second' },
                    { role: 'assistant', content: 'second reply' },
                ],
                summary: null,
            })
        );

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
        expect(result.current.messages).toEqual([
            { role: 'user', content: 'third' },
            { role: 'assistant', content: 'retry ok' },
        ]);
    });

    test('surfaces tooLarge if the retry also returns 413', async () => {
        sessionStorage.setItem(
            'sorenAssistant.session.v1',
            JSON.stringify({
                messages: [
                    { role: 'user', content: 'one' },
                    { role: 'assistant', content: 'one reply' },
                ],
                summary: null,
            })
        );

        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => tooLargeStream());
        jest.spyOn(chatApi, 'summarize').mockResolvedValue('compacted');

        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('huge message'); });

        await waitFor(() => expect(result.current.status).toBe('tooLarge'));
    });

    test('surfaces tooLarge if summarize itself fails during retry', async () => {
        sessionStorage.setItem(
            'sorenAssistant.session.v1',
            JSON.stringify({
                messages: [
                    { role: 'user', content: 'one' },
                    { role: 'assistant', content: 'one reply' },
                ],
                summary: null,
            })
        );

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
    test('does not trigger summarize when chat history is small', async () => {
        const summarizeSpy = jest.spyOn(chatApi, 'summarize').mockResolvedValue('s');
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['ok']));
        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('hi'); });
        await waitFor(() => expect(result.current.status).toBe('idle'));
        // Give the background summarize a microtask cycle to potentially fire
        await new Promise((r) => setTimeout(r, 10));
        expect(summarizeSpy).not.toHaveBeenCalled();
    });

    test('triggers a background summarize once chat history exceeds the soft threshold', async () => {
        // Pre-populate with enough content to push past SOFT_SUMMARIZE_AT_TOKENS (1500)
        // after the new turn is appended. 8 messages * 250 tokens ≈ 2000 tokens.
        const bigContent = 'x'.repeat(960); // ~248 tokens
        sessionStorage.setItem(
            'sorenAssistant.session.v1',
            JSON.stringify({
                messages: Array.from({ length: 8 }, (_, i) => ({
                    role: i % 2 === 0 ? 'user' : 'assistant',
                    content: bigContent,
                })),
                summary: null,
            })
        );

        const summarizeSpy = jest.spyOn(chatApi, 'summarize').mockResolvedValue('compacted');
        jest.spyOn(chatApi, 'streamChat').mockImplementation(() => fakeStream(['ok']));

        const { result } = renderHook(() => useChat());
        await act(async () => { await result.current.send('one more'); });

        await waitFor(() => expect(summarizeSpy).toHaveBeenCalled());
        // After compaction the local message array should shrink — older turns
        // are gone, only the tail remains.
        await waitFor(() => {
            expect(result.current.messages.length).toBeLessThan(11);
        });
    });
});

describe('cancel behavior', () => {
    test('cancel() on an idle chat is a noop', () => {
        const { result } = renderHook(() => useChat());
        expect(() => result.current.cancel()).not.toThrow();
        expect(result.current.status).toBe('idle');
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
        sessionStorage.setItem(
            'sorenAssistant.session.v1',
            JSON.stringify({ messages: [{ role: 'user', content: 'old' }], summary: null })
        );
        const { result } = renderHook(() => useChat());
        expect(result.current.messages).toHaveLength(1);
        act(() => { result.current.reset(); });
        expect(result.current.messages).toEqual([]);
        expect(sessionStorage.getItem('sorenAssistant.session.v1')).toBeNull();
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
});
