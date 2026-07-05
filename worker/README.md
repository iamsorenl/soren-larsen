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
5. Create the KV namespace for README caching:
   ```bash
   npx wrangler kv namespace create README_CACHE
   ```
   Copy the returned `id` into `wrangler.jsonc` under the `README_CACHE` binding (replace `REPLACE_WITH_README_CACHE_KV_ID`).
6. (Optional — not currently used.) GitHub README fetches are anonymous; we rely on the 24h KV cache (`README_CACHE`) to keep total outbound GitHub traffic to ~one request per project per day, well under the 60/hr-per-egress-IP anonymous limit. If you ever need higher throughput, you can re-enable PAT auth by passing `Authorization: Bearer ${env.GITHUB_TOKEN}` in `worker/src/github.js` and uploading the token via `npx wrangler secret put GITHUB_TOKEN`.

## Local dev

```bash
npm run dev
```

Serves at `http://localhost:8787`. The CRA app on `http://localhost:3000` will hit this by default.

## Deploy

```bash
npm run deploy
```

The `deploy` script runs `npm run sync-data` first, copying `src/data/*.json` (dotfiles and PDFs excluded) from the project root into `worker/src/data/` so the latest JSON gets bundled. `worker/src/data/` is gitignored — it's a generated artifact, and the root `src/data` is the single source of truth. Run `wrangler deploy` directly at your own risk: it skips the sync and ships whatever copies happen to be on disk.

## Testing

```bash
npm test
```

A `pretest` hook runs `sync-data` automatically, so a fresh clone can `npm test` without a separate sync step. CI runs these on every PR and gates the site deploy on them (see `.github/workflows/`).

## Request handling & safeguards

- **Message validation** — `/api/chat` and `/api/summarize` reject any request whose `messages` isn't a non-empty array of `{ role, content }` objects where `role` is `user` or `assistant` (client-supplied `system`/`tool` roles are refused so the trusted system prompt can't be overridden), `content` is a non-empty string, and the payload stays within `MAX_MESSAGES` (40) and `MAX_MESSAGE_CHARS` (8000 per message). Violations return `400 bad_request`.
- **README-tool allowlist** — `fetch_repo_readme` only fetches repos whose `owner/repo` appears in `projects.json` (`link` fields, matched case-insensitively). Any other URL is refused before a GitHub request is made, closing an arbitrary-README / prompt-injection vector.
- **Two-tier rate limiting** — a per-IP cap (keyed on `CF-Connecting-IP`) plus a global per-minute ceiling (`GLOBAL_RATE_LIMIT_MAX`, 60/min), both KV-backed. The `ip === 'local'` bypass is production-safe because Cloudflare always sets `CF-Connecting-IP` at the edge.
- **Single streaming completion** — a chat turn makes one streaming Groq call with `tools` + `tool_choice: 'auto'`. Plain content is piped straight to the client; only if the model emits `tool_calls` deltas does the worker buffer them, run the tool, and make a second streaming call with the tool result appended. The old two-call detect-then-restream path (which doubled token cost) is gone.
- **Timeouts** — every Groq fetch has a 15s header-response timeout and a ~20s inactivity watchdog on the stream; a stall maps to the `502 upstream_error` taxonomy instead of hanging.
- **Negative caching** — failed README fetches (404, auth, rate-limit, empty) cache a short-TTL "unavailable" marker (10 min) so known-bad repos aren't re-fetched on every request.
- **Rate-limit signalling** — Groq's `retry-after` / `x-ratelimit-*` response headers are preferred (with the human-readable 429 body only as a fallback) to distinguish the per-minute cap (`service_busy`) from the daily-token cap (`service_capacity`) and to surface an accurate countdown.
