import { handlePreflight } from './cors.js';
import { handleChat } from './chat.js';
import { handleSummarize } from './summarize.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return handlePreflight(request, env);
    }
    if (url.pathname === '/api/chat') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      return handleChat(request, env);
    }
    if (url.pathname === '/api/summarize') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      return handleSummarize(request, env);
    }
    return new Response('Not Found', { status: 404 });
  },
};
