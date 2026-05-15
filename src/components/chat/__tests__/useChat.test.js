import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../useChat';
import * as chatApi from '../chatApi';

async function* fakeStream(parts) {
    for (const p of parts) yield p;
}

beforeEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
});

test('starts with no messages', () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.status).toBe('idle');
});

test('send appends user + streamed assistant messages and persists to sessionStorage', async () => {
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

test('sets status to "rateLimited" on 429', async () => {
    jest.spyOn(chatApi, 'streamChat').mockImplementation(() => {
        throw new chatApi.ChatApiError('rateLimited', 'rl', 30);
    });
    const { result } = renderHook(() => useChat());
    await act(async () => { await result.current.send('hi'); });
    await waitFor(() => expect(result.current.status).toBe('rateLimited'));
});

test('reset clears messages and sessionStorage', async () => {
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
