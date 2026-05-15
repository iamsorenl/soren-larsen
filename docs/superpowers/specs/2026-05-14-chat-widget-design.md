# Chat Widget Design — "Soren's Assistant"

**Date:** 2026-05-14
**Status:** Approved, ready for implementation planning
**Owner:** Soren Larsen

## Goal

Add a floating chat widget to `larsensoren.com` that lets recruiters ask factual questions about Soren's experience, projects, skills, and education. The widget is powered by a free-tier open-source LLM (Groq's Llama 3.1 8B Instant) and grounded in the existing JSON data files. It must not invent facts, must redirect non-factual questions to the contact section, and must not require enabling Firebase billing.

## Audience & Use Case

- **Primary:** Recruiters and hiring managers evaluating Soren's fit for a role.
- **Interaction model:** Recruiter clicks a floating bubble, sees a brief greeting plus 3–4 suggested questions, asks something specific, gets a fast factual answer.
- **Non-goals:** Not a general-purpose chatbot, not an opinion engine, not a portfolio replacement.

## Behavior Decisions

| Decision | Choice |
| --- | --- |
| Persona | "Soren's Assistant" (third-person named bot) |
| Voice | Third person about Soren |
| Knowledge source (v1) | The eight JSON files in `src/data/` |
| Knowledge source (v2, out of scope) | Interview brief documents (will likely require RAG) |
| Unknown-info handling | Strict + redirect: only answer from data; if missing, redirect to related known info or to the contact section |
| Out-of-scope topics | Opinions, compensation, visa, availability, personal preferences → redirect to Contact section |
| Conversation memory | Multi-turn within session, oldest messages summarized after ~8 user-turn pairs; ephemeral (dies on tab close) |
| Empty state | One-line greeting + 3–4 suggested prompt chips |
| UI placement | Floating bubble bottom-right, mobile-friendly bottom sheet |

## Architecture

Two independent deployables:

1. **Static site (unchanged).** Existing React app on Firebase Hosting at `larsensoren.com`, deployed by the existing GitHub Action.
2. **Cloudflare Worker (new).** Tiny proxy at `chat.larsensoren.com` (or `*.workers.dev` URL). Holds the Groq API key as a secret. Single endpoint: `POST /api/chat`.

### Request Flow

```
Browser (ChatWidget)
   │ POST /api/chat  { messages: [...], sessionSummary: "..." }
   ▼
Cloudflare Worker
   │ 1. Per-IP rate limit check (KV-backed counter)
   │ 2. Build system prompt = identity + guardrails + JSON data + sessionSummary
   │ 3. Call Groq API (Llama 3.1 8B Instant) with stream: true
   ▼
Groq API
   │ SSE stream
   ▼
Worker re-streams tokens back (ReadableStream)
   ▼
Browser renders message incrementally + updates React state
```

### Why this shape

- Worker is just a proxy + prompt assembler. No DB, no server-side session storage, no auth.
- Conversation state lives entirely in browser React state; dies naturally on tab close.
- HTTP streaming keeps perceived latency low without WebSocket complexity.
- Firebase Hosting setup is untouched, so the Spark (free) plan stays intact.

### Why this provider combo

| Option considered | Verdict |
| --- | --- |
| Firebase Cloud Functions + Groq | Rejected — requires enabling Blaze billing plan |
| Cloudflare Worker + Workers AI | Rejected — tighter free budget (10k neurons/day) and slower than Groq |
| **Cloudflare Worker + Groq API** | **Chosen** — no billing setup anywhere, Groq is the fastest free LLM (~500 tok/sec), 100k req/day Workers free tier |

## Frontend Design

### New files (under `src/components/chat/`)

| File | Responsibility |
| --- | --- |
| `ChatWidget.js` | Top-level mount; floating bubble ↔ expanded panel; handles open/close and mobile breakpoint |
| `ChatPanel.js` | Expanded card: header, message list, suggested-prompt chips (empty state), input row |
| `ChatMessage.js` | Single message bubble; user vs assistant styling; streaming cursor indicator |
| `useChat.js` | Hook owning messages array, streaming state, summarization trigger, error handling |
| `chatConfig.js` | Suggested prompts, greeting copy, constants (max turns before summarize, worker URL) |

### Files modified

- `src/App.js` — mount `<ChatWidget />` once at root so it floats over every section.

### UI behavior

- **Collapsed:** 56px circular MUI `Fab`, bottom-right, chat icon, subtle shadow, tooltip "Ask my assistant".
- **Expanded (desktop ≥ sm):** ~380px × 560px card anchored bottom-right with 16px margin. Drop shadow, rounded corners, header with title and close button, scrollable message area, sticky input row.
- **Expanded (mobile):** Full-width bottom sheet at ~85vh, rounded top corners. Tap-outside or X to dismiss. Input row sits above the soft keyboard.
- **Empty state:** One-line greeting + 3–4 clickable chips. Chips disappear after first user message.
- **Streaming:** Assistant message renders as tokens arrive with a blinking cursor.
- **Theming:** Uses existing MUI `ThemeContext` for light/dark.
- **Accessibility:** Focus moves to input on expand; Esc closes; ARIA live region for streamed responses.

### Storybook

One story for `ChatPanel` with mocked message states (empty, mid-conversation, streaming, error). Follows existing `src/stories/mockData.js` pattern.

## Backend Design (Cloudflare Worker)

### Repo location

`worker/` at project root. Own `package.json`, own `wrangler.toml`. Not bundled into the React build.

### Files

| File | Responsibility |
| --- | --- |
| `worker/src/index.js` | `fetch` handler; routes `POST /api/chat`, `POST /api/summarize`, and CORS preflight |
| `worker/src/systemPrompt.js` | Assembles system prompt from imported JSON |
| `worker/src/data/*.json` | Copies of `src/data/*.json` (synced via npm script) |
| `worker/src/rateLimit.js` | Per-IP counter using Cloudflare KV |
| `worker/wrangler.toml` | Worker config, KV binding, route |
| `worker/package.json` | Minimal — `wrangler` as devDep, npm scripts for sync + deploy |
| `worker/README.md` | Setup and deploy instructions |

### Data sync

Workers can't import from `../src/data/` cleanly without bundling the whole React app. Solution: `npm run sync-data` script in the worker package copies `src/data/*.json` → `worker/src/data/`. Must be run before `wrangler deploy`. Documented in `worker/README.md`.

### System prompt structure

Assembled per request:

```
You are "Soren's Assistant", a concise factual assistant on Soren Larsen's portfolio site.
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
<about.json>
<experience.json>
<projects.json>
<skills.json>
<education.json>
<certifications.json>
<highlights.json>
<contact.json>

PRIOR CONVERSATION SUMMARY (if any):
<sessionSummary or "(none)">
```

Then the last N raw messages are appended as chat turns.

### Memory strategy

- Browser keeps the full message array in React state for the active session.
- After every 8 user-turn pairs, the browser sends a "summarize" request to the Worker, receives a `sessionSummary` string, drops the oldest turns from local state, and includes the summary on subsequent chat requests.
- Summarization uses a separate `POST /api/summarize` endpoint on the Worker, which calls Groq with a fixed summarization system prompt and returns `{ summary: string }` as plain JSON (no streaming).
- All conversation memory dies on page unload. Browser uses `sessionStorage` only (cleared on tab close); never `localStorage`.

### Rate limiting

- Cloudflare KV namespace `RATE_LIMIT`. Key = client IP (from `CF-Connecting-IP` header). Value = JSON `{count, windowStart}`.
- Limit: 10 requests/minute per IP. Exceeded → 429 with a friendly JSON error body the frontend renders as a toast.
- KV free tier (100k reads/day, 1k writes/day) easily covers personal-site traffic.

### Secrets

- `GROQ_API_KEY` set via `wrangler secret put GROQ_API_KEY`. Never committed. Documented in `worker/README.md`.

### CORS

- Allow origins: `https://larsensoren.com`, `https://www.larsensoren.com`, `http://localhost:3000`.
- Methods: `POST`, `OPTIONS`.

### Logging

- `console.log` request count + IP hash + token estimate. View via `wrangler tail` for ad-hoc debugging. No persistent log store.

### Model choice

- Default: `llama-3.1-8b-instant` (fast, sufficient for this domain).
- Fallback: `llama-3.3-70b-versatile` if answer quality is lacking — switched via worker env var, one-line change.

## Out of Scope (YAGNI)

Explicitly not building in v1, documented so they're deliberate omissions:

- RAG / embeddings / vector search (current JSON fits comfortably in context)
- Interview brief document ingestion (v2 — likely needs RAG)
- Persistent conversation history (no DB, no per-user storage)
- User accounts / auth
- Analytics dashboard (`wrangler tail` is enough)
- Conversation export / share-link
- Voice input / TTS
- Multi-language (English only)
- Admin panel to edit prompts (system prompt lives in code; edit + redeploy)
- A/B testing different prompts
- Profanity / abuse classifier (relying on rate limit + Groq's built-in safety)
- Email notification when someone asks a question
- WebSocket streaming (using HTTP streaming via ReadableStream instead)

## Success Criteria

- Recruiter visiting `larsensoren.com` sees a floating chat bubble on every page.
- Clicking the bubble expands a panel with greeting + suggested prompts; works on desktop and mobile.
- Asking a factual question grounded in JSON data returns a correct, concise answer streamed in under ~2 seconds.
- Asking an out-of-scope question (opinion, salary, availability) returns the contact-section redirect.
- Conversation history is lost when the tab closes.
- Rate limit triggers cleanly after 10 requests/minute per IP.
- Firebase project remains on the Spark (free) plan.
- Cloudflare Worker, Workers KV, and Groq usage all stay within free tiers under expected personal-site traffic.

## Open Questions for Implementation

- Final decision on Worker URL: subdomain (`chat.larsensoren.com`, requires DNS) vs default `*.workers.dev` URL. Default workers.dev is simpler for MVP.
- Summarization-trigger threshold (8 turns) is a guess; may need tuning after observing real traffic.
