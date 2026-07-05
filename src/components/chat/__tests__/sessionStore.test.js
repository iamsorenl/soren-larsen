import { loadSession, saveSession, clearSession, SESSION_KEY, SESSION_VERSION } from '../sessionStore';

beforeEach(() => { sessionStorage.clear(); });

test('saveSession then loadSession round-trips with the version stamped in', () => {
    saveSession({ messages: [{ id: 1, role: 'user', content: 'hi' }], summary: 's' });
    expect(loadSession()).toEqual({
        version: SESSION_VERSION,
        messages: [{ id: 1, role: 'user', content: 'hi' }],
        summary: 's',
    });
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

test('loadSession drops old v1-shaped data (no version field)', () => {
    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ messages: [{ role: 'user', content: 'old' }], summary: null })
    );
    expect(loadSession()).toBeNull();
});

test('loadSession drops data with a mismatched version number', () => {
    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ version: SESSION_VERSION + 1, messages: [], summary: null })
    );
    expect(loadSession()).toBeNull();
});

test('loadSession drops payloads whose messages field is not an array', () => {
    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ version: SESSION_VERSION, messages: 'nope', summary: null })
    );
    expect(loadSession()).toBeNull();
});
