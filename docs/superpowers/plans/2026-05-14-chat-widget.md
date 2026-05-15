# Soren's Assistant Chat Widget — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a floating, mobile-friendly chat widget on `larsensoren.com` that answers recruiter questions about Soren's career using a Cloudflare Worker + Groq Llama 3.1 8B Instant, grounded in the existing JSON data files.

**Architecture:** Two independent deployables — the existing React (CRA) site on Firebase Hosting, and a new Cloudflare Worker that proxies streamed Groq completions. Conversation state lives in browser React state mirrored to `sessionStorage`. KV-backed per-IP rate limiting. See `docs/superpowers/specs/2026-05-14-chat-widget-design.md` for full design rationale.

**Tech Stack:** React 18 (CRA), MUI 5, Cloudflare Workers, Cloudflare KV, Groq API, Vitest, Wrangler, Storybook.

---

## File Structure

**New (worker/):**
- `worker/package.json` — wrangler devDep, npm scripts
- `worker/wrangler.jsonc` — Worker config + KV binding
- `worker/.gitignore` — exclude `.wrangler`, `node_modules`, copied data
- `worker/README.md` — setup + deploy docs
- `worker/scripts/sync-data.mjs` — copies `src/data/*.json` → `worker/src/data/`
- `worker/src/index.js` — `fetch` handler + router
- `worker/src/cors.js` — CORS helpers
- `worker/src/rateLimit.js` — KV-backed fixed-window per-IP counter
- `worker/src/systemPrompt.js` — builds prompt from JSON
- `worker/src/groq.js` — Groq client (streaming + non-streaming)
- `worker/src/chat.js` — `/api/chat` handler
- `worker/src/summarize.js` — `/api/summarize` handler
- `worker/src/data/*.json` — gitignored, synced via script
- `worker/test/*.test.js` — Vitest unit tests
- `worker/vitest.config.js`

**New (src/components/chat/):**
- `ChatWidget.js` — FAB ↔ panel root mount
- `ChatPanel.js` — expanded panel
- `ChatMessage.js` — single message bubble
- `SuggestedPrompts.js` — empty-state chips
- `useChat.js` — messages/streaming/summary hook
- `chatApi.js` — fetch + ReadableStream + AbortController helpers
- `chatConfig.js` — constants, suggested prompts, copy
- `sessionStore.js` — sessionStorage mirror helpers

**New (other):**
- `src/components/chat/__tests__/useChat.test.js`
- `src/components/chat/__tests__/sessionStore.test.js`
- `src/components/chat/__tests__/chatApi.test.js`
- `src/stories/ChatPanel.stories.jsx`

**Modified:**
- `src/App.js` — mount `<ChatWidget />`
- `src/stories/mockData.js` — add `mockChatMessages`
- `.github/workflows/deploy.yml` — pass `REACT_APP_CHAT_WORKER_URL` env var to build step

---

## Task 0: Setup — Create Branch

**Files:** none (git only)

- [ ] **Step 1: Create and switch to feature branch**

```bash
git checkout -b feat/chat-widget
git status
```

Expected: `On branch feat/chat-widget` with clean working tree (modulo any pre-existing changes).

---

## Task 1: Worker Skeleton

**Files:**
- Create: `worker/package.json`
- Create: `worker/wrangler.jsonc`
- Create: `worker/.gitignore`
- Create: `worker/README.md`
- Create: `worker/src/index.js`
- Create: `worker/vitest.config.js`

- [ ] **Step 1: Create `worker/package.json`**

```json
{
  "name": "soren-larsen-chat-worker",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "sync-data": "node scripts/sync-data.mjs",
    "dev": "npm run sync-data && wrangler dev",
    "deploy": "npm run sync-data && wrangler deploy",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "wrangler": "^3.90.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `worker/wrangler.jsonc`**

```jsonc
{
  "$schema": "https://unpkg.com/wrangler/config-schema.json",
  "name": "soren-larsen-chat",
  "main": "src/index.js",
  "compatibility_date": "2024-11-01",
  "compatibility_flags": ["nodejs_compat"],
  "kv_namespaces": [
    {
      "binding": "RATE_LIMIT",
      "id": "REPLACE_WITH_KV_ID_AFTER_CREATION"
    }
  ],
  "vars": {
    "GROQ_MODEL": "llama-3.1-8b-instant",
    "GROQ_SUMMARY_MODEL": "llama-3.1-8b-instant",
    "ALLOWED_ORIGINS": "https://larsensoren.com,https://www.larsensoren.com,http://localhost:3000"
  },
  "observability": {
    "enabled": true
  }
}
```

- [ ] **Step 3: Create `worker/.gitignore`**

```
node_modules
.wrangler
.dev.vars
src/data
```

- [ ] **Step 4: Create placeholder `worker/src/index.js`**

```js
export default {
  async fetch() {
    return new Response('ok', { status: 200 });
  },
};
```

- [ ] **Step 5: Create `worker/vitest.config.js`**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.js'],
  },
});
```

- [ ] **Step 6: Create `worker/README.md`**

```markdown
# Soren's Assistant — Cloudflare Worker

Backend for the chat widget on larsensoren.com. Streams Groq Llama 3.1 8B Instant responses, grounded in copies of `src/data/*.json`.

## One-time setup

1. Install deps:
   ```bash
   cd worker
   npm install
   ```
2. Authenticate Wrangler (browser flow):
   ```bash
   npx wrangler login
   ```
3. Create the KV namespace for rate limiting:
   ```bash
   npx wrangler kv namespace create RATE_LIMIT
   ```
   Copy the returned `id` into `wrangler.jsonc` under `kv_namespaces[0].id`.
4. Set the Groq API key as a secret:
   ```bash
   npx wrangler secret put GROQ_API_KEY
   ```
   Paste your key from https://console.groq.com when prompted.

## Local dev

```bash
npm run dev
```

Serves at `http://localhost:8787`. The CRA app on `http://localhost:3000` will hit this by default.

## Deploy

```bash
npm run deploy
```

The `predeploy` step syncs `src/data/*.json` from the project root into `worker/src/data/` so the latest JSON gets bundled.

## Testing

```bash
npm test
```
```

- [ ] **Step 7: Install deps and verify wrangler is callable**

```bash
cd worker && npm install
npx wrangler --version
```

Expected: prints a `3.x` version number.

- [ ] **Step 8: Commit**

```bash
cd ..
git add worker/
git commit -m "feat(worker): scaffold Cloudflare Worker package"
```

---

## Task 2: Data Sync Script

**Files:**
- Create: `worker/scripts/sync-data.mjs`

- [ ] **Step 1: Create the sync script**

```js
// worker/scripts/sync-data.mjs
import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../src/data');
const dest = resolve(here, '../src/data');

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true, filter: (path) => !path.endsWith('.pdf') });

console.log(`Synced ${src} -> ${dest}`);
```

- [ ] **Step 2: Run the script and verify**

```bash
cd worker && npm run sync-data && ls src/data
```

Expected: lists `about.json`, `certifications.json`, `contact.json`, `education.json`, `experience.json`, `highlights.json`, `projects.json`, `skills.json` (no `.pdf` files).

- [ ] **Step 3: Commit**

```bash
cd ..
git add worker/scripts/
git commit -m "feat(worker): add JSON data sync script"
```

---

## Task 3: CORS Helper

**Files:**
- Create: `worker/src/cors.js`
- Create: `worker/test/cors.test.js`

- [ ] **Step 1: Write the failing test**

Create `worker/test/cors.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { corsHeaders, handlePreflight } from '../src/cors.js';

const env = { ALLOWED_ORIGINS: 'https://a.com,https://b.com,http://localhost:3000' };

describe('corsHeaders', () => {
  it('echoes allowed origin', () => {
    const req = new Request('https://example.com', { headers: { Origin: 'https://a.com' } });
    const h = corsHeaders(req, env);
    expect(h['Access-Control-Allow-Origin']).toBe('https://a.com');
    expect(h['Vary']).toBe('Origin');
  });

  it('returns empty headers for disallowed origin', () => {
    const req = new Request('https://example.com', { headers: { Origin: 'https://evil.com' } });
    const h = corsHeaders(req, env);
    expect(h['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('returns empty headers for missing origin', () => {
    const req = new Request('https://example.com');
    const h = corsHeaders(req, env);
    expect(h['Access-Control-Allow-Origin']).toBeUndefined();
  });
});

describe('handlePreflight', () => {
  it('returns 204 with CORS headers for allowed origin', async () => {
    const req = new Request('https://example.com', {
      method: 'OPTIONS',
      headers: { Origin: 'https://a.com', 'Access-Control-Request-Method': 'POST' },
    });
    const res = handlePreflight(req, env);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://a.com');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
cd worker && npm test
```

Expected: `Cannot find module '../src/cors.js'`.

- [ ] **Step 3: Implement `worker/src/cors.js`**

```js
export function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
  const origin = request.headers.get('Origin');
  const headers = { Vary: 'Origin' };
  if (origin && allowed.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

export function handlePreflight(request, env) {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request, env),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test
```

Expected: all CORS tests pass.

- [ ] **Step 5: Commit**

```bash
cd .. && git add worker/src/cors.js worker/test/cors.test.js
git commit -m "feat(worker): add CORS helpers with tests"
```

---

## Task 4: Rate Limit Helper

**Files:**
- Create: `worker/src/rateLimit.js`
- Create: `worker/test/rateLimit.test.js`

- [ ] **Step 1: Write the failing test**

Create `worker/test/rateLimit.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '../src/rateLimit.js';

class MockKV {
  constructor() { this.store = new Map(); }
  async get(key, type) {
    const v = this.store.get(key);
    if (v === undefined) return null;
    return type === 'json' ? JSON.parse(v) : v;
  }
  async put(key, value) { this.store.set(key, value); }
}

let kv;
beforeEach(() => { kv = new MockKV(); });

describe('checkRateLimit', () => {
  it('allows the first request', async () => {
    const r = await checkRateLimit(kv, '1.2.3.4');
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(RATE_LIMIT_MAX - 1);
  });

  it('blocks after exceeding the limit in the window', async () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      await checkRateLimit(kv, '1.2.3.4');
    }
    const r = await checkRateLimit(kv, '1.2.3.4');
    expect(r.allowed).toBe(false);
    expect(r.retryAfterSec).toBeGreaterThan(0);
  });

  it('resets after the window expires', async () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      await checkRateLimit(kv, '1.2.3.4');
    }
    const expired = { count: RATE_LIMIT_MAX, windowStart: Date.now() - RATE_LIMIT_WINDOW_MS - 1000 };
    await kv.put('1.2.3.4', JSON.stringify(expired));
    const r = await checkRateLimit(kv, '1.2.3.4');
    expect(r.allowed).toBe(true);
  });

  it('skips enforcement for "local" key', async () => {
    for (let i = 0; i < RATE_LIMIT_MAX + 5; i++) {
      const r = await checkRateLimit(kv, 'local');
      expect(r.allowed).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
cd worker && npm test
```

Expected: module not found.

- [ ] **Step 3: Implement `worker/src/rateLimit.js`**

```js
export const RATE_LIMIT_MAX = 10;
export const RATE_LIMIT_WINDOW_MS = 60_000;

export function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || 'local';
}

export async function checkRateLimit(kv, ip) {
  if (ip === 'local') {
    return { allowed: true, remaining: RATE_LIMIT_MAX, retryAfterSec: 0 };
  }
  const now = Date.now();
  const existing = await kv.get(ip, 'json');
  let count = 0;
  let windowStart = now;
  if (existing && now - existing.windowStart < RATE_LIMIT_WINDOW_MS) {
    count = existing.count;
    windowStart = existing.windowStart;
  }
  count += 1;
  await kv.put(ip, JSON.stringify({ count, windowStart }), {
    expirationTtl: 120,
  });
  if (count > RATE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil((windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec: Math.max(retryAfterSec, 1) };
  }
  return { allowed: true, remaining: RATE_LIMIT_MAX - count, retryAfterSec: 0 };
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test
```

Expected: all rate-limit tests pass.

- [ ] **Step 5: Commit**

```bash
cd .. && git add worker/src/rateLimit.js worker/test/rateLimit.test.js
git commit -m "feat(worker): add KV-backed per-IP rate limit"
```

---

## Task 5: System Prompt Builder

**Files:**
- Create: `worker/src/systemPrompt.js`
- Create: `worker/test/systemPrompt.test.js`

- [ ] **Step 1: Run data sync (so the test fixtures exist)**

```bash
cd worker && npm run sync-data
```

- [ ] **Step 2: Write the failing test**

Create `worker/test/systemPrompt.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, SUMMARIZE_SYSTEM_PROMPT } from '../src/systemPrompt.js';

describe('buildSystemPrompt', () => {
  it('includes the persona header', () => {
    const p = buildSystemPrompt(null);
    expect(p).toContain("Soren's Assistant");
    expect(p).toContain('FACTS');
  });

  it('embeds JSON data sections', () => {
    const p = buildSystemPrompt(null);
    expect(p.toLowerCase()).toContain('about');
    expect(p.toLowerCase()).toContain('experience');
  });

  it('appends summary when provided', () => {
    const p = buildSystemPrompt('Earlier: visitor asked about X.');
    expect(p).toContain('PRIOR CONVERSATION SUMMARY');
    expect(p).toContain('Earlier: visitor asked about X.');
  });

  it('uses "(none)" when no summary provided', () => {
    const p = buildSystemPrompt(null);
    expect(p).toContain('(none)');
  });
});

describe('SUMMARIZE_SYSTEM_PROMPT', () => {
  it('instructs the model to be concise', () => {
    expect(SUMMARIZE_SYSTEM_PROMPT).toMatch(/concise|short|brief/i);
  });
});
```

- [ ] **Step 3: Run and verify failure**

```bash
npm test
```

Expected: module not found.

- [ ] **Step 4: Implement `worker/src/systemPrompt.js`**

```js
import about from './data/about.json';
import experience from './data/experience.json';
import projects from './data/projects.json';
import skills from './data/skills.json';
import education from './data/education.json';
import certifications from './data/certifications.json';
import highlights from './data/highlights.json';
import contact from './data/contact.json';

const FACTS = `
ABOUT:
${JSON.stringify(about, null, 2)}

EXPERIENCE:
${JSON.stringify(experience, null, 2)}

PROJECTS:
${JSON.stringify(projects, null, 2)}

SKILLS:
${JSON.stringify(skills, null, 2)}

EDUCATION:
${JSON.stringify(education, null, 2)}

CERTIFICATIONS:
${JSON.stringify(certifications, null, 2)}

HIGHLIGHTS:
${JSON.stringify(highlights, null, 2)}

CONTACT:
${JSON.stringify(contact, null, 2)}
`.trim();

export function buildSystemPrompt(sessionSummary) {
  return `You are "Soren's Assistant", a concise factual assistant on Soren Larsen's portfolio site.
Your audience is recruiters and hiring managers evaluating Soren's fit.

RULES:
- Answer ONLY from the FACTS below. Do not invent experience, skills, or details.
- If asked about opinions, preferences, salary, availability, visa, or anything
  not in FACTS, reply "That's a great question for Soren directly — you can
  reach him via the Contact section."
- If a question is partially answerable, answer what you can and redirect for the rest.
- Refer to Soren in third person ("Soren", "he"). Never speak as Soren.
- Keep answers under 4 sentences unless asked for detail. No marketing fluff.

FACTS (authoritative source for all claims):
${FACTS}

PRIOR CONVERSATION SUMMARY (if any):
${sessionSummary || '(none)'}`;
}

export const SUMMARIZE_SYSTEM_PROMPT = `You summarize chat conversations on a recruiter-facing portfolio site.
Produce a concise summary (max 3 sentences) of what the visitor asked and what Soren's Assistant said.
Refer to participants as "the visitor" and "Soren's Assistant". Output ONLY the summary text, no preamble.`;
```

- [ ] **Step 5: Run tests, verify pass**

```bash
npm test
```

Expected: all prompt tests pass.

- [ ] **Step 6: Commit**

```bash
cd .. && git add worker/src/systemPrompt.js worker/test/systemPrompt.test.js
git commit -m "feat(worker): assemble system prompt from JSON data"
```

---

## Task 6: Groq Client

**Files:**
- Create: `worker/src/groq.js`
- Create: `worker/test/groq.test.js`

- [ ] **Step 1: Write the failing test**

Create `worker/test/groq.test.js`:

```js
import { describe, it, expect, vi, afterEach } from 'vitest';
import { groqChatStream, groqChatJson, parseSseToText } from '../src/groq.js';

afterEach(() => { vi.restoreAllMocks(); });

function sseStream(events) {
  return new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      for (const e of events) controller.enqueue(enc.encode(e));
      controller.close();
    },
  });
}

describe('parseSseToText', () => {
  it('extracts delta.content from each data event', async () => {
    const upstream = sseStream([
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
      'data: [DONE]\n\n',
    ]);
    const out = parseSseToText(upstream);
    const reader = out.getReader();
    const dec = new TextDecoder();
    let result = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      result += dec.decode(value);
    }
    expect(result).toBe('Hello world');
  });

  it('skips malformed JSON gracefully', async () => {
    const upstream = sseStream([
      'data: not-json\n\n',
      'data: {"choices":[{"delta":{"content":"ok"}}]}\n\n',
      'data: [DONE]\n\n',
    ]);
    const out = parseSseToText(upstream);
    const reader = out.getReader();
    const dec = new TextDecoder();
    let result = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      result += dec.decode(value);
    }
    expect(result).toBe('ok');
  });
});

describe('groqChatStream', () => {
  it('POSTs to Groq with stream=true and returns a text stream', async () => {
    const upstream = sseStream([
      'data: {"choices":[{"delta":{"content":"hi"}}]}\n\n',
      'data: [DONE]\n\n',
    ]);
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(upstream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
    );
    const stream = await groqChatStream({
      apiKey: 'k',
      model: 'm',
      messages: [{ role: 'user', content: 'hi' }],
      systemPrompt: 's',
    });
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(opts.headers.Authorization).toBe('Bearer k');
    const body = JSON.parse(opts.body);
    expect(body.stream).toBe(true);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[1].content).toBe('hi');
    const reader = stream.getReader();
    const { value } = await reader.read();
    expect(new TextDecoder().decode(value)).toBe('hi');
  });

  it('throws GroqUpstreamError on non-2xx', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('boom', { status: 500 }));
    await expect(
      groqChatStream({ apiKey: 'k', model: 'm', messages: [], systemPrompt: 's' })
    ).rejects.toThrow(/Groq/);
  });
});

describe('groqChatJson', () => {
  it('returns content from non-streaming response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: 'summary text' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const text = await groqChatJson({
      apiKey: 'k',
      model: 'm',
      messages: [{ role: 'user', content: 'x' }],
      systemPrompt: 's',
    });
    expect(text).toBe('summary text');
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
cd worker && npm test
```

Expected: module not found.

- [ ] **Step 3: Implement `worker/src/groq.js`**

```js
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqUpstreamError extends Error {
  constructor(status, body) {
    super(`Groq upstream error ${status}: ${body}`);
    this.status = status;
  }
}

function buildPayload({ model, messages, systemPrompt, stream }) {
  return {
    model,
    stream,
    temperature: 0.2,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
  };
}

export async function groqChatStream({ apiKey, model, messages, systemPrompt }) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildPayload({ model, messages, systemPrompt, stream: true })),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new GroqUpstreamError(res.status, body);
  }
  return parseSseToText(res.body);
}

export async function groqChatJson({ apiKey, model, messages, systemPrompt }) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildPayload({ model, messages, systemPrompt, stream: false })),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new GroqUpstreamError(res.status, body);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}

export function parseSseToText(upstream) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const event = JSON.parse(payload);
              const text = event.choices?.[0]?.delta?.content;
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              // skip malformed events
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test
```

Expected: all Groq tests pass.

- [ ] **Step 5: Commit**

```bash
cd .. && git add worker/src/groq.js worker/test/groq.test.js
git commit -m "feat(worker): add Groq client with SSE→text streaming"
```

---

## Task 7: /api/chat Handler

**Files:**
- Create: `worker/src/chat.js`
- Create: `worker/test/chat.test.js`

- [ ] **Step 1: Write the failing test**

Create `worker/test/chat.test.js`:

```js
import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleChat } from '../src/chat.js';

class MockKV {
  constructor() { this.store = new Map(); }
  async get(key, type) {
    const v = this.store.get(key);
    if (v === undefined) return null;
    return type === 'json' ? JSON.parse(v) : v;
  }
  async put(key, value) { this.store.set(key, value); }
}

const baseEnv = {
  GROQ_API_KEY: 'k',
  GROQ_MODEL: 'llama-3.1-8b-instant',
  ALLOWED_ORIGINS: 'http://localhost:3000',
  RATE_LIMIT: new MockKV(),
};

afterEach(() => { vi.restoreAllMocks(); });

function mockGroqStream(text) {
  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(c) {
        c.enqueue(enc.encode(`data: {"choices":[{"delta":{"content":${JSON.stringify(text)}}}]}\n\n`));
        c.enqueue(enc.encode('data: [DONE]\n\n'));
        c.close();
      },
    }),
    { status: 200 }
  );
}

describe('handleChat', () => {
  it('returns 400 for invalid JSON body', async () => {
    const env = { ...baseEnv, RATE_LIMIT: new MockKV() };
    const req = new Request('http://x/api/chat', { method: 'POST', body: 'nope' });
    const res = await handleChat(req, env);
    expect(res.status).toBe(400);
  });

  it('returns 400 when messages is missing or empty', async () => {
    const env = { ...baseEnv, RATE_LIMIT: new MockKV() };
    const req = new Request('http://x/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await handleChat(req, env);
    expect(res.status).toBe(400);
  });

  it('streams plain text from Groq', async () => {
    const env = { ...baseEnv, RATE_LIMIT: new MockKV() };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockGroqStream('hello'));
    const req = new Request('http://x/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' },
    });
    const res = await handleChat(req, env);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toMatch(/text\/plain/);
    const text = await res.text();
    expect(text).toBe('hello');
  });

  it('returns 429 with Retry-After when rate limited', async () => {
    const kv = new MockKV();
    const env = { ...baseEnv, RATE_LIMIT: kv };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockGroqStream('x'));
    const body = JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] });
    const headers = { 'Content-Type': 'application/json', 'CF-Connecting-IP': '5.6.7.8' };
    for (let i = 0; i < 10; i++) {
      await handleChat(new Request('http://x/api/chat', { method: 'POST', body, headers }), env);
    }
    const res = await handleChat(new Request('http://x/api/chat', { method: 'POST', body, headers }), env);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBeTruthy();
  });

  it('returns 502 when Groq upstream fails', async () => {
    const env = { ...baseEnv, RATE_LIMIT: new MockKV() };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('boom', { status: 500 }));
    const req = new Request('http://x/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '9.9.9.9' },
    });
    const res = await handleChat(req, env);
    expect(res.status).toBe(502);
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
cd worker && npm test
```

Expected: module not found.

- [ ] **Step 3: Implement `worker/src/chat.js`**

```js
import { corsHeaders } from './cors.js';
import { checkRateLimit, clientIp } from './rateLimit.js';
import { buildSystemPrompt } from './systemPrompt.js';
import { groqChatStream, GroqUpstreamError } from './groq.js';

function jsonError(status, error, message, extraHeaders = {}) {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export async function handleChat(request, env) {
  const cors = corsHeaders(request, env);
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'bad_request', 'Invalid JSON body.', cors);
  }
  const { messages, sessionSummary } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError(400, 'bad_request', 'messages must be a non-empty array.', cors);
  }

  const ip = clientIp(request);
  const rl = await checkRateLimit(env.RATE_LIMIT, ip);
  if (!rl.allowed) {
    return jsonError(
      429,
      'rate_limited',
      'Too many requests. Try again in a minute.',
      { ...cors, 'Retry-After': String(rl.retryAfterSec) }
    );
  }

  const systemPrompt = buildSystemPrompt(sessionSummary || null);
  try {
    const stream = await groqChatStream({
      apiKey: env.GROQ_API_KEY,
      model: env.GROQ_MODEL,
      messages,
      systemPrompt,
    });
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        ...cors,
      },
    });
  } catch (err) {
    if (err instanceof GroqUpstreamError) {
      return jsonError(502, 'upstream_error', 'Upstream model error.', cors);
    }
    console.error('chat handler error', err);
    return jsonError(500, 'internal_error', 'Unexpected error.', cors);
  }
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test
```

Expected: all chat handler tests pass.

- [ ] **Step 5: Commit**

```bash
cd .. && git add worker/src/chat.js worker/test/chat.test.js
git commit -m "feat(worker): add /api/chat streaming handler"
```

---

## Task 8: /api/summarize Handler

**Files:**
- Create: `worker/src/summarize.js`
- Create: `worker/test/summarize.test.js`

- [ ] **Step 1: Write the failing test**

Create `worker/test/summarize.test.js`:

```js
import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleSummarize } from '../src/summarize.js';

class MockKV {
  constructor() { this.store = new Map(); }
  async get() { return null; }
  async put() {}
}

const baseEnv = {
  GROQ_API_KEY: 'k',
  GROQ_SUMMARY_MODEL: 'llama-3.1-8b-instant',
  ALLOWED_ORIGINS: 'http://localhost:3000',
  RATE_LIMIT: new MockKV(),
};

afterEach(() => { vi.restoreAllMocks(); });

describe('handleSummarize', () => {
  it('returns 400 for missing messages', async () => {
    const req = new Request('http://x/api/summarize', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await handleSummarize(req, baseEnv);
    expect(res.status).toBe(400);
  });

  it('returns { summary } JSON on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: 'visitor asked about X' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    const req = new Request('http://x/api/summarize', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hi' }, { role: 'assistant', content: 'hello' }],
      }),
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.1.1.1' },
    });
    const res = await handleSummarize(req, { ...baseEnv, RATE_LIMIT: new MockKV() });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.summary).toBe('visitor asked about X');
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
cd worker && npm test
```

Expected: module not found.

- [ ] **Step 3: Implement `worker/src/summarize.js`**

```js
import { corsHeaders } from './cors.js';
import { checkRateLimit, clientIp } from './rateLimit.js';
import { SUMMARIZE_SYSTEM_PROMPT } from './systemPrompt.js';
import { groqChatJson, GroqUpstreamError } from './groq.js';

function jsonError(status, error, message, extraHeaders = {}) {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export async function handleSummarize(request, env) {
  const cors = corsHeaders(request, env);
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'bad_request', 'Invalid JSON body.', cors);
  }
  const { messages, priorSummary } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError(400, 'bad_request', 'messages must be a non-empty array.', cors);
  }

  const ip = clientIp(request);
  const rl = await checkRateLimit(env.RATE_LIMIT, ip);
  if (!rl.allowed) {
    return jsonError(
      429,
      'rate_limited',
      'Too many requests. Try again in a minute.',
      { ...cors, 'Retry-After': String(rl.retryAfterSec) }
    );
  }

  const transcript = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
  const userContent = priorSummary
    ? `PRIOR SUMMARY:\n${priorSummary}\n\nNEW TURNS:\n${transcript}`
    : transcript;

  try {
    const summary = await groqChatJson({
      apiKey: env.GROQ_API_KEY,
      model: env.GROQ_SUMMARY_MODEL,
      messages: [{ role: 'user', content: userContent }],
      systemPrompt: SUMMARIZE_SYSTEM_PROMPT,
    });
    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  } catch (err) {
    if (err instanceof GroqUpstreamError) {
      return jsonError(502, 'upstream_error', 'Upstream model error.', cors);
    }
    console.error('summarize handler error', err);
    return jsonError(500, 'internal_error', 'Unexpected error.', cors);
  }
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test
```

Expected: all summarize tests pass.

- [ ] **Step 5: Commit**

```bash
cd .. && git add worker/src/summarize.js worker/test/summarize.test.js
git commit -m "feat(worker): add /api/summarize handler"
```

---

## Task 9: Worker Router

**Files:**
- Modify: `worker/src/index.js`
- Create: `worker/test/index.test.js`

- [ ] **Step 1: Write the failing test**

Create `worker/test/index.test.js`:

```js
import { describe, it, expect } from 'vitest';
import worker from '../src/index.js';

const env = {
  GROQ_API_KEY: 'k',
  GROQ_MODEL: 'llama-3.1-8b-instant',
  GROQ_SUMMARY_MODEL: 'llama-3.1-8b-instant',
  ALLOWED_ORIGINS: 'http://localhost:3000',
  RATE_LIMIT: { get: async () => null, put: async () => {} },
};

describe('Worker router', () => {
  it('handles CORS preflight', async () => {
    const req = new Request('http://x/api/chat', {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:3000' },
    });
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
  });

  it('returns 404 for unknown routes', async () => {
    const req = new Request('http://x/nope', { method: 'POST' });
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(404);
  });

  it('returns 405 for non-POST on chat', async () => {
    const req = new Request('http://x/api/chat', { method: 'GET' });
    const res = await worker.fetch(req, env);
    expect(res.status).toBe(405);
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
cd worker && npm test
```

Expected: routing tests fail (current `index.js` returns 'ok' for everything).

- [ ] **Step 3: Replace `worker/src/index.js`**

```js
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
```

- [ ] **Step 4: Run all tests, verify pass**

```bash
npm test
```

Expected: every worker test suite passes.

- [ ] **Step 5: Commit**

```bash
cd .. && git add worker/src/index.js worker/test/index.test.js
git commit -m "feat(worker): wire router for /api/chat and /api/summarize"
```

---

## Task 10: Local Worker Smoke Test

**Files:** none

- [ ] **Step 1: Create a local `.dev.vars` file for the Groq key**

```bash
cd worker
printf 'GROQ_API_KEY="YOUR_GROQ_KEY_HERE"\n' > .dev.vars
```

(Replace with a real key from https://console.groq.com. `.dev.vars` is already gitignored.)

- [ ] **Step 2: Start the Worker locally**

```bash
npm run dev
```

Expected: wrangler prints something like `Ready on http://localhost:8787`.

- [ ] **Step 3: From another terminal, smoke test `/api/chat`**

```bash
curl -N -X POST http://localhost:8787/api/chat \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:3000' \
  -d '{"messages":[{"role":"user","content":"What was Soren'\''s most recent role?"}]}'
```

Expected: streamed plain-text response describing Soren's most recent role.

- [ ] **Step 4: Smoke test `/api/summarize`**

```bash
curl -X POST http://localhost:8787/api/summarize \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:3000' \
  -d '{"messages":[{"role":"user","content":"What is his tech stack?"},{"role":"assistant","content":"Python, JS, React, NLP tooling."}]}'
```

Expected: `{"summary":"..."}`.

- [ ] **Step 5: Stop the local Worker (Ctrl+C). No commit needed — this task is verification only.**

---

## Task 11: Frontend Session Store

**Files:**
- Create: `src/components/chat/sessionStore.js`
- Create: `src/components/chat/__tests__/sessionStore.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/components/chat/__tests__/sessionStore.test.js`:

```js
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
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- --watchAll=false src/components/chat/__tests__/sessionStore.test.js
```

Expected: module not found.

- [ ] **Step 3: Implement `src/components/chat/sessionStore.js`**

```js
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
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test -- --watchAll=false src/components/chat/__tests__/sessionStore.test.js
```

Expected: all session-store tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/sessionStore.js src/components/chat/__tests__/sessionStore.test.js
git commit -m "feat(chat): add sessionStorage mirror helpers"
```

---

## Task 12: Frontend Chat Config

**Files:**
- Create: `src/components/chat/chatConfig.js`

- [ ] **Step 1: Create the config file**

```js
export const WORKER_URL = process.env.REACT_APP_CHAT_WORKER_URL || 'http://localhost:8787';

export const GREETING = "Hi — I'm Soren's Assistant. Here are a few things I can help with:";

export const SUGGESTED_PROMPTS = [
    "What was Soren's most recent role?",
    'What NLP projects has he worked on?',
    "What's his tech stack?",
    'How do I get in touch?',
];

export const SUMMARIZE_AFTER_TURNS = 8;
export const KEEP_TAIL_TURNS = 4;

export const ERROR_COPY = {
    network: "Couldn't reach the assistant. Try again in a moment.",
    upstream: 'Something went wrong on my end. Please try again.',
    rateLimited: "You're sending messages quickly — try again in a minute.",
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/chatConfig.js
git commit -m "feat(chat): add config constants and copy"
```

---

## Task 13: Frontend Chat API Wrapper

**Files:**
- Create: `src/components/chat/chatApi.js`
- Create: `src/components/chat/__tests__/chatApi.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/components/chat/__tests__/chatApi.test.js`:

```js
import { streamChat, summarize, ChatApiError } from '../chatApi';

function textStreamResponse(chunks, status = 200, headers = {}) {
    const encoder = new TextEncoder();
    const body = new ReadableStream({
        start(c) {
            for (const chunk of chunks) c.enqueue(encoder.encode(chunk));
            c.close();
        },
    });
    return new Response(body, { status, headers });
}

afterEach(() => { jest.restoreAllMocks(); });

test('streamChat yields decoded text chunks', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(textStreamResponse(['hel', 'lo']));
    const chunks = [];
    for await (const chunk of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
        chunks.push(chunk);
    }
    expect(chunks.join('')).toBe('hello');
});

test('streamChat throws ChatApiError with kind "rateLimited" on 429', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ error: 'rate_limited' }), {
            status: 429,
            headers: { 'Retry-After': '30', 'Content-Type': 'application/json' },
        })
    );
    await expect((async () => {
        for await (const _ of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
            // consume
        }
    })()).rejects.toMatchObject({ kind: 'rateLimited', retryAfterSec: 30 });
});

test('streamChat throws ChatApiError with kind "upstream" on 5xx', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response('boom', { status: 502 }));
    await expect((async () => {
        for await (const _ of streamChat({ messages: [{ role: 'user', content: 'hi' }] })) {
            // consume
        }
    })()).rejects.toMatchObject({ kind: 'upstream' });
});

test('streamChat respects AbortSignal', async () => {
    const controller = new AbortController();
    const encoder = new TextEncoder();
    const body = new ReadableStream({
        start(c) {
            c.enqueue(encoder.encode('hi'));
            controller.abort();
            c.close();
        },
    });
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(body, { status: 200 }));
    const iter = streamChat({ messages: [{ role: 'user', content: 'hi' }], signal: controller.signal });
    const out = [];
    try {
        for await (const c of iter) out.push(c);
    } catch (err) {
        expect(err.name).toBe('AbortError');
    }
});

test('summarize returns the summary string', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ summary: 'visitor asked about X' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    );
    const out = await summarize({ messages: [{ role: 'user', content: 'hi' }] });
    expect(out).toBe('visitor asked about X');
});
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- --watchAll=false src/components/chat/__tests__/chatApi.test.js
```

Expected: module not found.

- [ ] **Step 3: Implement `src/components/chat/chatApi.js`**

```js
import { WORKER_URL } from './chatConfig';

export class ChatApiError extends Error {
    constructor(kind, message, retryAfterSec = 0) {
        super(message);
        this.kind = kind; // 'network' | 'upstream' | 'rateLimited' | 'badRequest'
        this.retryAfterSec = retryAfterSec;
    }
}

async function postJson(path, body, signal) {
    try {
        return await fetch(`${WORKER_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal,
        });
    } catch (err) {
        if (err.name === 'AbortError') throw err;
        throw new ChatApiError('network', err.message);
    }
}

function mapErrorResponse(res) {
    if (res.status === 429) {
        const retryAfterSec = Number(res.headers.get('Retry-After')) || 60;
        return new ChatApiError('rateLimited', 'Rate limited', retryAfterSec);
    }
    if (res.status >= 500) return new ChatApiError('upstream', `Status ${res.status}`);
    return new ChatApiError('badRequest', `Status ${res.status}`);
}

export async function* streamChat({ messages, sessionSummary = null, signal }) {
    const res = await postJson('/api/chat', { messages, sessionSummary }, signal);
    if (!res.ok) throw mapErrorResponse(res);
    if (!res.body) throw new ChatApiError('upstream', 'No response body');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            yield decoder.decode(value, { stream: true });
        }
    } finally {
        try { reader.releaseLock(); } catch { /* noop */ }
    }
}

export async function summarize({ messages, priorSummary = null, signal }) {
    const res = await postJson('/api/summarize', { messages, priorSummary }, signal);
    if (!res.ok) throw mapErrorResponse(res);
    const json = await res.json();
    return json.summary || '';
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test -- --watchAll=false src/components/chat/__tests__/chatApi.test.js
```

Expected: all chat API tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/chatApi.js src/components/chat/__tests__/chatApi.test.js
git commit -m "feat(chat): add fetch wrapper with streaming and abort"
```

---

## Task 14: useChat Hook

**Files:**
- Create: `src/components/chat/useChat.js`
- Create: `src/components/chat/__tests__/useChat.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/components/chat/__tests__/useChat.test.js`:

```js
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
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- --watchAll=false src/components/chat/__tests__/useChat.test.js
```

Expected: module not found.

- [ ] **Step 3: Implement `src/components/chat/useChat.js`**

```js
import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChat, summarize, ChatApiError } from './chatApi';
import { loadSession, saveSession, clearSession } from './sessionStore';
import { SUMMARIZE_AFTER_TURNS, KEEP_TAIL_TURNS } from './chatConfig';

export function useChat() {
    const [messages, setMessages] = useState(() => {
        const stored = loadSession();
        return stored?.messages ?? [];
    });
    const [summary, setSummary] = useState(() => loadSession()?.summary ?? null);
    const [status, setStatus] = useState('idle'); // 'idle' | 'streaming' | 'rateLimited' | 'error'
    const [errorKind, setErrorKind] = useState(null);
    const abortRef = useRef(null);

    useEffect(() => {
        saveSession({ messages, summary });
    }, [messages, summary]);

    const cancel = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
    }, []);

    const send = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || status === 'streaming') return;

        cancel();
        const controller = new AbortController();
        abortRef.current = controller;

        setStatus('streaming');
        setErrorKind(null);
        setMessages((prev) => [
            ...prev,
            { role: 'user', content: trimmed },
            { role: 'assistant', content: '' },
        ]);

        try {
            for await (const chunk of streamChat({
                messages: [...messages, { role: 'user', content: trimmed }],
                sessionSummary: summary,
                signal: controller.signal,
            })) {
                setMessages((prev) => {
                    const next = prev.slice();
                    const last = next[next.length - 1];
                    next[next.length - 1] = { ...last, content: last.content + chunk };
                    return next;
                });
            }
            setStatus('idle');

            // Background summarization if we've grown too long.
            setMessages((prev) => {
                const userTurns = prev.filter((m) => m.role === 'user').length;
                if (userTurns >= SUMMARIZE_AFTER_TURNS) {
                    const tailStart = Math.max(0, prev.length - KEEP_TAIL_TURNS * 2);
                    const toSummarize = prev.slice(0, tailStart);
                    const keep = prev.slice(tailStart);
                    summarize({ messages: toSummarize, priorSummary: summary })
                        .then((s) => { setSummary(s || null); })
                        .catch(() => { /* silent — degraded path */ });
                    return keep;
                }
                return prev;
            });
        } catch (err) {
            if (err.name === 'AbortError') {
                setStatus('idle');
                return;
            }
            const kind = err instanceof ChatApiError ? err.kind : 'network';
            setErrorKind(kind);
            setStatus(kind === 'rateLimited' ? 'rateLimited' : 'error');
            // Remove the empty assistant placeholder on hard error.
            setMessages((prev) => {
                if (prev[prev.length - 1]?.role === 'assistant' && prev[prev.length - 1].content === '') {
                    return prev.slice(0, -1);
                }
                return prev;
            });
        }
    }, [messages, summary, status, cancel]);

    const reset = useCallback(() => {
        cancel();
        setMessages([]);
        setSummary(null);
        setStatus('idle');
        setErrorKind(null);
        clearSession();
    }, [cancel]);

    return { messages, status, errorKind, send, cancel, reset };
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test -- --watchAll=false src/components/chat/__tests__/useChat.test.js
```

Expected: all useChat tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/useChat.js src/components/chat/__tests__/useChat.test.js
git commit -m "feat(chat): add useChat hook with streaming, summarization, abort"
```

---

## Task 15: ChatMessage Component

**Files:**
- Create: `src/components/chat/ChatMessage.js`

- [ ] **Step 1: Implement `src/components/chat/ChatMessage.js`**

```js
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

function ChatMessage({ role, content, isStreaming }) {
    const theme = useTheme();
    const isUser = role === 'user';
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                mb: 1,
            }}
        >
            <Box
                sx={{
                    maxWidth: '85%',
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: isUser ? theme.palette.primary.main : theme.palette.action.hover,
                    color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
                }}
                role={isUser ? undefined : 'log'}
                aria-live={isUser ? undefined : 'polite'}
            >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {content}
                    {isStreaming && content && (
                        <Box component="span" sx={{ ml: 0.25, animation: 'blink 1s steps(2, start) infinite' }}>
                            ▍
                        </Box>
                    )}
                </Typography>
            </Box>
            <style>{`@keyframes blink { to { visibility: hidden; } }`}</style>
        </Box>
    );
}

export default ChatMessage;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/ChatMessage.js
git commit -m "feat(chat): add ChatMessage bubble component"
```

---

## Task 16: SuggestedPrompts Component

**Files:**
- Create: `src/components/chat/SuggestedPrompts.js`

- [ ] **Step 1: Implement `src/components/chat/SuggestedPrompts.js`**

```js
import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { GREETING, SUGGESTED_PROMPTS } from './chatConfig';

function SuggestedPrompts({ onSelect }) {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
                {GREETING}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {SUGGESTED_PROMPTS.map((p) => (
                    <Chip
                        key={p}
                        label={p}
                        onClick={() => onSelect(p)}
                        variant="outlined"
                        size="small"
                        sx={{ height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 } }}
                    />
                ))}
            </Box>
        </Box>
    );
}

export default SuggestedPrompts;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/SuggestedPrompts.js
git commit -m "feat(chat): add greeting + suggested prompt chips"
```

---

## Task 17: ChatPanel Component

**Files:**
- Create: `src/components/chat/ChatPanel.js`

- [ ] **Step 1: Implement `src/components/chat/ChatPanel.js`**

```js
import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ChatMessage from './ChatMessage';
import SuggestedPrompts from './SuggestedPrompts';
import { ERROR_COPY } from './chatConfig';

function ChatPanel({ open, onClose, chat }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const [draft, setDraft] = useState('');

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat.messages, chat.status]);

    useEffect(() => {
        if (!open) return undefined;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    const submit = () => {
        if (!draft.trim() || chat.status === 'streaming') return;
        chat.send(draft);
        setDraft('');
    };

    const onSelectPrompt = (text) => {
        chat.send(text);
    };

    const panelSx = isMobile
        ? {
            position: 'fixed',
            inset: 'auto 0 0 0',
            height: '85vh',
            borderRadius: '16px 16px 0 0',
            zIndex: theme.zIndex.modal,
        }
        : {
            position: 'fixed',
            bottom: 88,
            right: 16,
            width: 380,
            height: 560,
            borderRadius: 2,
            zIndex: theme.zIndex.modal,
        };

    return (
        <>
            {isMobile && (
                <Box
                    onClick={onClose}
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        zIndex: theme.zIndex.modal - 1,
                    }}
                />
            )}
            <Box
                role="dialog"
                aria-label="Soren's Assistant"
                sx={{
                    ...panelSx,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Soren's Assistant</Typography>
                    <IconButton size="small" onClick={onClose} aria-label="Close chat"><CloseIcon /></IconButton>
                </Box>

                <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1 }}>
                    {chat.messages.length === 0 ? (
                        <SuggestedPrompts onSelect={onSelectPrompt} />
                    ) : (
                        chat.messages.map((m, i) => (
                            <ChatMessage
                                key={i}
                                role={m.role}
                                content={m.content}
                                isStreaming={chat.status === 'streaming' && i === chat.messages.length - 1 && m.role === 'assistant'}
                            />
                        ))
                    )}
                    {chat.status === 'rateLimited' && (
                        <ChatMessage role="assistant" content={ERROR_COPY.rateLimited} isStreaming={false} />
                    )}
                </Box>

                {(chat.status === 'error') && (
                    <Box sx={{ px: 2, py: 1, bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText }}>
                        <Typography variant="caption">
                            {chat.errorKind === 'upstream' ? ERROR_COPY.upstream : ERROR_COPY.network}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <TextField
                        inputRef={inputRef}
                        fullWidth
                        size="small"
                        placeholder="Ask about Soren's experience..."
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                submit();
                            }
                        }}
                        disabled={chat.status === 'streaming'}
                    />
                    <IconButton color="primary" onClick={submit} disabled={!draft.trim() || chat.status === 'streaming'} aria-label="Send">
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>
        </>
    );
}

export default ChatPanel;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/ChatPanel.js
git commit -m "feat(chat): add expanded ChatPanel with mobile sheet + scrim"
```

---

## Task 18: ChatWidget Component

**Files:**
- Create: `src/components/chat/ChatWidget.js`

- [ ] **Step 1: Implement `src/components/chat/ChatWidget.js`**

```js
import React, { useState } from 'react';
import { Fab, Tooltip, useTheme } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ChatPanel from './ChatPanel';
import { useChat } from './useChat';

function ChatWidget() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const chat = useChat();

    const handleClose = () => {
        chat.cancel();
        setOpen(false);
    };

    return (
        <>
            <Tooltip title="Ask my assistant" placement="left">
                <Fab
                    color="primary"
                    aria-label="Open chat with Soren's Assistant"
                    onClick={() => setOpen((v) => !v)}
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        zIndex: theme.zIndex.modal + 1,
                    }}
                >
                    <ChatIcon />
                </Fab>
            </Tooltip>
            <ChatPanel open={open} onClose={handleClose} chat={chat} />
        </>
    );
}

export default ChatWidget;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/ChatWidget.js
git commit -m "feat(chat): add ChatWidget FAB + panel mount"
```

---

## Task 19: Mount ChatWidget in App

**Files:**
- Modify: `src/App.js`

- [ ] **Step 1: Update `src/App.js`**

Replace the file contents with:

```js
import React from 'react';
import './App.css';
import Navigation from './components/Navigation';
import Body from './components/Body';
import ErrorBoundary from './components/ErrorBoundary';
import ChatWidget from './components/chat/ChatWidget';
import { ThemeProvider } from './contexts/ThemeContext';
import { Box } from '@mui/material';

function App() {
    return (
        <ThemeProvider>
            <ErrorBoundary>
                <div className="App">
                    <Navigation />
                    <Box sx={{ pt: 8 }}>
                        <Body />
                    </Box>
                    <ChatWidget />
                </div>
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default App;
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run lint && npm run build
```

Expected: no lint errors, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/App.js
git commit -m "feat(app): mount ChatWidget at root"
```

---

## Task 20: Storybook Story for ChatPanel

**Files:**
- Modify: `src/stories/mockData.js`
- Create: `src/stories/ChatPanel.stories.jsx`

- [ ] **Step 1: Add chat mocks to `src/stories/mockData.js`**

Append to the file:

```js
export const mockChatMessagesEmpty = [];

export const mockChatMessagesMid = [
    { role: 'user', content: "What was Soren's most recent role?" },
    {
        role: 'assistant',
        content:
            "Soren most recently finished his M.S. in NLP at UC Santa Cruz. Before that, he worked across full-stack and NLP engineering roles.",
    },
    { role: 'user', content: 'What NLP projects has he worked on?' },
];

export const mockChatStateStreaming = {
    messages: [
        { role: 'user', content: "What's his tech stack?" },
        { role: 'assistant', content: 'Soren works mainly with Python and Java' },
    ],
    status: 'streaming',
    errorKind: null,
};
```

- [ ] **Step 2: Create `src/stories/ChatPanel.stories.jsx`**

```jsx
import React from 'react';
import ChatPanel from '../components/chat/ChatPanel';
import { mockChatMessagesEmpty, mockChatMessagesMid, mockChatStateStreaming } from './mockData';

const noop = () => {};

const meta = {
    title: 'Chat/ChatPanel',
    component: ChatPanel,
};

export default meta;

const baseChat = {
    send: noop,
    cancel: noop,
    reset: noop,
    errorKind: null,
};

export const Empty = {
    args: {
        open: true,
        onClose: noop,
        chat: { ...baseChat, messages: mockChatMessagesEmpty, status: 'idle' },
    },
};

export const MidConversation = {
    args: {
        open: true,
        onClose: noop,
        chat: { ...baseChat, messages: mockChatMessagesMid, status: 'idle' },
    },
};

export const Streaming = {
    args: {
        open: true,
        onClose: noop,
        chat: { ...baseChat, ...mockChatStateStreaming },
    },
};

export const RateLimited = {
    args: {
        open: true,
        onClose: noop,
        chat: { ...baseChat, messages: mockChatMessagesMid, status: 'rateLimited' },
    },
};

export const ErrorState = {
    args: {
        open: true,
        onClose: noop,
        chat: { ...baseChat, messages: mockChatMessagesMid, status: 'error', errorKind: 'upstream' },
    },
};
```

- [ ] **Step 3: Verify Storybook builds**

```bash
npm run build-storybook
```

Expected: build completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/stories/mockData.js src/stories/ChatPanel.stories.jsx
git commit -m "feat(chat): add Storybook stories for ChatPanel states"
```

---

## Task 21: End-to-End Local Verification

**Files:** none

- [ ] **Step 1: In one terminal, start the Worker**

```bash
cd worker && npm run dev
```

Expected: `Ready on http://localhost:8787`.

- [ ] **Step 2: In another terminal, start the CRA dev server**

```bash
npm start
```

Expected: opens `http://localhost:3000` with the portfolio site.

- [ ] **Step 3: Manual smoke test the widget**

In the browser:
1. Confirm the floating FAB appears bottom-right on every page.
2. Click it — panel opens with greeting + 4 suggested chips.
3. Click "What was Soren's most recent role?" — streamed answer arrives.
4. Type a follow-up — multi-turn works.
5. Resize to mobile width (or use device emulator) — verify bottom sheet + scrim.
6. Send 11 messages rapidly — verify the 11th shows the rate-limited inline message.
7. Refresh the page mid-conversation — verify messages restore from sessionStorage.
8. Close the tab and reopen — verify the conversation is empty.

- [ ] **Step 4: Stop both servers (Ctrl+C in each). No commit — verification only.**

---

## Task 22: Deploy Worker to Production

**Files:** none (Cloudflare/Wrangler operations)

- [ ] **Step 1: Authenticate Wrangler if not already done**

```bash
cd worker && npx wrangler whoami
```

Expected: shows logged-in account email. If not, run `npx wrangler login`.

- [ ] **Step 2: Create the production KV namespace**

```bash
npx wrangler kv namespace create RATE_LIMIT
```

Copy the returned `id` value.

- [ ] **Step 3: Update `worker/wrangler.jsonc`**

Replace `REPLACE_WITH_KV_ID_AFTER_CREATION` with the real id from Step 2.

- [ ] **Step 4: Set the Groq API key as a Worker secret**

```bash
npx wrangler secret put GROQ_API_KEY
```

Paste a real key when prompted.

- [ ] **Step 5: Deploy the Worker**

```bash
npm run deploy
```

Expected: prints the deployed URL like `https://soren-larsen-chat.<your-subdomain>.workers.dev`.

- [ ] **Step 6: Smoke test production URL**

```bash
curl -N -X POST https://soren-larsen-chat.<your-subdomain>.workers.dev/api/chat \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://larsensoren.com' \
  -d '{"messages":[{"role":"user","content":"What was Soren'\''s most recent role?"}]}'
```

Expected: streamed plain-text answer.

- [ ] **Step 7: Commit the updated wrangler.jsonc**

```bash
cd .. && git add worker/wrangler.jsonc
git commit -m "chore(worker): pin production KV namespace id"
```

---

## Task 23: Wire Production Worker URL into Frontend Build

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Update the deploy workflow**

In `.github/workflows/deploy.yml`, modify the `Build` step to inject the Worker URL:

```yaml
      - name: Build
        run: npm run build
        env:
          REACT_APP_CHAT_WORKER_URL: ${{ secrets.CHAT_WORKER_URL }}
```

- [ ] **Step 2: Add the secret in GitHub**

In the GitHub repo → Settings → Secrets and variables → Actions, add a secret named `CHAT_WORKER_URL` with the value from Task 22 Step 5 (e.g. `https://soren-larsen-chat.<your-subdomain>.workers.dev`).

(This step is performed in the GitHub UI, not in the terminal.)

- [ ] **Step 3: Commit the workflow change**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: inject REACT_APP_CHAT_WORKER_URL into Firebase Hosting build"
```

---

## Task 24: Open PR and Merge

**Files:** none

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feat/chat-widget
```

- [ ] **Step 2: Open a PR via gh CLI**

```bash
gh pr create --title "Add Soren's Assistant chat widget" --body "$(cat <<'EOF'
## Summary
- New Cloudflare Worker (`worker/`) that proxies streamed Groq Llama 3.1 8B Instant responses, grounded in `src/data/*.json`, with per-IP KV rate limiting.
- New floating chat widget (`src/components/chat/`) with greeting, suggested-prompt chips, multi-turn conversation, in-session summarization, and `sessionStorage`-backed persistence.
- Wires `REACT_APP_CHAT_WORKER_URL` through the Firebase Hosting GitHub Action.

See `docs/superpowers/specs/2026-05-14-chat-widget-design.md` for full design and `docs/superpowers/plans/2026-05-14-chat-widget.md` for the implementation plan.

## Test plan
- [x] `cd worker && npm test` (worker unit tests pass)
- [x] `npm test -- --watchAll=false` (frontend unit tests pass)
- [x] `npm run build` and `npm run build-storybook`
- [x] Local end-to-end manual smoke (Task 21)
- [x] Production Worker smoke test (Task 22 Step 6)
- [ ] Post-merge smoke test against `https://larsensoren.com`

EOF
)"
```

- [ ] **Step 3: After PR is merged, do a final production smoke**

Visit `https://larsensoren.com`, open the chat widget, click a suggested prompt, confirm streaming works end-to-end.

---

## Done

When all tasks complete:
- Worker deployed at the workers.dev URL (or custom subdomain if you set it up later).
- Site at `https://larsensoren.com` has the floating chat widget.
- Conversations are ephemeral, rate-limited, and grounded in JSON data.
