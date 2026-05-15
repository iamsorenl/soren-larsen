import { loadSession, saveSession, clearSession, SESSION_KEY } from '../sessionStore';

beforeEach(() => { sessionStorage.clear(); });

test('saveSession then loadSession round-trips', () => {
    saveSession({ messages: [{ role: 'user', content: 'hi' }], summary: 's' });
    expect(loadSession()).toEqual({ messages: [{ role: 'user', content: 'hi' }], summary: 's' });
});

test('loadSession returns null when nothing is stored', () => {
    expect(loadSession()).toBeNull();
});

test('clearSession removes the entry', () => {
    saveSession({ messages: [], summary: null });
    clearSession();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
});

test('loadSession returns null on corrupt JSON', () => {
    sessionStorage.setItem(SESSION_KEY, 'not-json');
    expect(loadSession()).toBeNull();
});
