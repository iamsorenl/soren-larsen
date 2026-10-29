import { TURNSTILE_SITEKEY } from './chatConfig';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

// Element the widget renders into. ChatPanel provides it near the input so the
// rare interactive challenge shows up inside the chat; body is the fallback.
export const TURNSTILE_SLOT_ID = 'turnstile-slot';

let scriptPromise = null;

function loadScript() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (!scriptPromise) {
        scriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = SCRIPT_SRC;
            script.async = true;
            script.onload = () => resolve(window.turnstile);
            script.onerror = () => {
                scriptPromise = null; // let the next send retry the load
                reject(new Error('Turnstile script failed to load'));
            };
            document.head.appendChild(script);
        });
    }
    return scriptPromise;
}

/**
 * Get a fresh single-use Turnstile token for one worker request. Renders a
 * throwaway widget (invisible unless Cloudflare wants an interaction), waits
 * for its token, then removes it. Tokens are single-use, so every request
 * gets its own.
 * @param {'chat'|'summarize'} action - must match what the worker checks
 * @returns {Promise<string>}
 */
export async function getTurnstileToken(action) {
    const turnstile = await loadScript();
    const host = document.createElement('div');
    (document.getElementById(TURNSTILE_SLOT_ID) || document.body).appendChild(host);
    return new Promise((resolve, reject) => {
        let widgetId;
        const done = (fn, value) => {
            // Defer removal: removing a widget from inside its own callback
            // can throw inside the Turnstile script.
            setTimeout(() => {
                try { turnstile.remove(widgetId); } catch { /* already gone */ }
                host.remove();
            }, 0);
            fn(value);
        };
        widgetId = turnstile.render(host, {
            sitekey: TURNSTILE_SITEKEY,
            action,
            appearance: 'interaction-only',
            callback: (token) => done(resolve, token),
            'error-callback': () => done(reject, new Error('Turnstile challenge failed')),
            'expired-callback': () => done(reject, new Error('Turnstile token expired')),
        });
    });
}
