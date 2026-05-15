export const SESSION_KEY = 'sorenAssistant.session.v1';

export function loadSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.messages)) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function saveSession(session) {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
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
