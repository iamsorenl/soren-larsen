export const SESSION_KEY = 'sorenAssistant.session.v1';

// Explicit payload version. Bump when the persisted shape changes (v2 added
// per-message ids). Data with a mismatched or missing version is dropped on
// load — losing a transient chat session is preferable to feeding the UI a
// shape it no longer understands.
export const SESSION_VERSION = 2;

export function loadSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== SESSION_VERSION) return null;
        if (!Array.isArray(parsed.messages)) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function saveSession(session) {
    try {
        sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ version: SESSION_VERSION, ...session })
        );
    } catch {
        // ignore quota / disabled storage
    }
}

export function clearSession() {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch {
        // ignore
    }
}
