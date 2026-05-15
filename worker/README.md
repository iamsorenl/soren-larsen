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
6. Set the GitHub personal access token as a secret (scoped to **Contents: Read** on public repos):
   ```bash
   npx wrangler secret put GITHUB_TOKEN
   ```
   Create a fine-grained PAT at https://github.com/settings/tokens with `Contents: Read` permission on the repos you want to expose. This token is used to fetch README files for the `fetch_repo_readme` tool.

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
