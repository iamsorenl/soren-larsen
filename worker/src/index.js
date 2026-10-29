import { corsHeaders, handlePreflight } from './cors.js';
import { handleChat } from './chat.js';
import { handleSummarize } from './summarize.js';
import { verifyTurnstile } from './turnstile.js';

const ROUTES = {
  '/api/chat': { action: 'chat', handler: handleChat },
  '/api/summarize': { action: 'summarize', handler: handleSummarize },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return handlePreflight(request, env);
    }
    const route = ROUTES[url.pathname];
    if (!route) {
      return new Response('Not Found', { status: 404 });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    // Bot check runs before any handler work (validation, rate limit, Groq).
    if (!(await verifyTurnstile(request, env, route.action))) {
      return new Response(
        JSON.stringify({ error: 'verification_failed', message: 'Could not verify this request.' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders(request, env) } }
      );
    }
    return route.handler(request, env);
  },
};
