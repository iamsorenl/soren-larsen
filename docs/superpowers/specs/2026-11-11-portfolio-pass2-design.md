# larsensoren.com pass 2: flashier, shorter, a chat that does things

Date: 2026-11-11. Status: draft for Soren's review.

## Why

The site reads like a resume. It has about 3,500 words, 15 project cards of equal weight, and live demos hidden as small buttons halfway down. Avery Jones's portfolio feedback (call 2026-11-09) was to use less dense text and less blue, offer one-click demos, and disclose detail progressively. The first 15 seconds should earn the click. Soren wants visitors, mostly recruiters, hiring managers and AI startup founders, to play with something he built, not read about it. The chat widget is a differentiator nobody notices, and when they do find it, it can only talk.

Success means a visitor clicks a live demo or asks the chat something within the first screen. The project list fits on one screen per tab. Every word on the page is accurate.

## Already done (pass 1, branch `content/pass1-slim`, uncommitted)

- All copy uses LinkedIn wording: hero title "Product Engineer", a two-line About, Self-Employed and Causality entries, and plain one-paragraph project descriptions.
- The old resume bullets moved into a hidden `details` field on experience and project entries. The chat bot still sees them, the page doesn't render them.
- The Onda title is "ML/AI Engineer", and X (@iamsorenl) is in contact.
- All tests, lint and the build pass. Pass 2 builds on this branch, or on main after pass 1 merges.

## Goals

1. **Hero (picked option A, "demo strip").** The name, title and buttons sit close to the photo carousel, so the empty gap is gone. A row of four demo tiles fills the bottom of the hero: SLAC, Sentinel, StockPulse and Ranked AI League. Each tile has a moving preview (GIF or short muted video) and opens the live demo in one click.
2. **Chat invitation (picked option B, "starter card").** A few seconds after load, a small card pops up above the chat button with three question chips and a close ✕. Clicking a chip opens the chat and sends that question. Once dismissed, it doesn't come back that session.
3. **Experience (picked option B, "picture tiles").** A grid with one tile per job, each led by a real image: a logo, an app screenshot, the Developer Camp photo. Clicking a tile shows the existing two-line description and link chips (company site, App Store, video). Soren's condition: everything must be accurate. Use no stock or invented imagery.
4. **Projects (picked option B, "tabs").**
   - **Play with it:** the four demos with previews.
   - **How it works:** one or two interactive NLP visuals built from Soren's M.S. coursework, so people can see how they work. An example is the transformer he wrote himself.
   - **Research:** CarbonBridge / No RAGrets with the Medium (Santa Cruz Works) article and demo video, plus a "try it" slot that is empty until the rebuilt tool is hosted.
   - Below the tabs, a "More on GitHub" link. All other projects leave the page, but their data stays in `projects.json` for the chat.
5. **Chat actions (first three of four proposed).**
   - **Contact card.** When asked how to reach Soren, the chat renders buttons for email, LinkedIn, X, GitHub and the resume. Today the starter "How do I get in touch?" tells people to use a Contact section the bot can't open.
   - **Take me there.** The chat can scroll to a section, switch the projects tab, and show a demo as a button.
   - **Leave Soren a note.** The visitor gives a name, email and message from inside the chat, and it reaches Soren.
6. **New chat facts (wording approved 2026-11-11).** Add these to `about.json` and the system prompt:
   - **Contract end:** "He was brought on to take Causality's platform and agents to a defined milestone, and the contract wrapped up in September 2026 once that work was delivered."
   - **Experience:** "About two and a half years of professional engineering, starting at Boardal in April 2024, plus an M.S. in NLP. He's targeting junior to mid-level roles and is open to some senior roles where the scope fits."
   - **Strongest project:** "No RAGrets, his capstone partnership with CarbonBridge. He led the build of a tool that pulls findings out of scientific papers, links them in a knowledge graph, and traces every answer back to its source."
   - **Now:** "He's packaging the dev tools that have helped him into open source projects and running small experiments like MCP tests and agent benchmarks. Next he's rebuilding the CarbonBridge tool as a public demo where you can feed in your own papers. After that comes a long-term surf agent project he plans to build in public."
   - The starter questions change to match, for example "What's he building now?", "Show me his best demo" and "How do I reach him?"
7. **Data fixes.**
   - The Ranked AI League card still says Supabase and Deno and links GitHub Pages. It moved to a self-hosted k3s and Go setup on 2026-11-10, with the Tailscale Funnel URL at https://league.tail88a93f.ts.net. Verify what's live before rewriting it.
   - Gray Whale's hidden `details` no longer include benchmark sizes or evaluation-method detail. This was done in pass 1, since Gray Whale internals stay private.
   - Add AWS, Terraform and DynamoDB to skills, since StockPulse uses them.
   - Skills becomes a short row of tags. The self-rated percentage bars go.

## Non-goals

- Do not show every project. GitHub is the archive.
- No job-description fit check in the chat yet (proposed action 4, deferred).
- No new section for the surf project, which doesn't exist yet.
- No rebuild of the CarbonBridge tool here. That's a separate project. This only reserves its slot.
- No redesign of Education beyond keeping it small.

## Anti-goals (failure even if it works)

- Inaccurate media or claims, such as a screenshot of something he didn't build, an inflated metric, or a stale stack.
- An invitation pop-up that nags: it reappears, blocks content on mobile, or can't be dismissed.
- A chat that invents facts, quotes a salary, or states a work authorization status. Keep deflecting salary and visa questions to Soren directly.
- Naming Levangie customers or the seed round, calling the company "Causality Labs", or describing Gray Whale's model internals.
- A heavier first load that kills the speed of the first 15 seconds. Previews must be lazy and lightweight.
- Breaking the crawler-readable prerendered HTML.

## Constraints

- Stack stays React 18, MUI 5, CRA, Firebase Hosting, with the chat on a Cloudflare Worker (Groq) behind Turnstile and rate limits.
- `src/data/*.json` stays the single source of truth for the page, the prerender script and the worker (synced by `worker/scripts/sync-data.mjs`).
- The worker's tool allowlist and the deploy-gate test pin repos from `projects.json`. Removing cards from the page must not remove their data entries.
- The chat worker deploys by hand (`cd worker && npm run deploy`). The site deploys on merge to main through CI, with firebase-tools pinned at 15.34.0.
- All visible copy follows Soren's voice rules: plain English, confident, no colons, dashes or parentheses in drafted sentences, no user counts except Boardal's approved line, and no hedges.
- The page must work on mobile.

## Decided by Soren

Hero A, starter card B, experience tiles B, projects tabs B, chat actions 1 to 3, the four fact lines above, demo picks (SLAC, Sentinel, StockPulse, AI League), and CarbonBridge as the strongest and featured project.

## Left to the builder (Claude's calls)

- Preview format (GIF vs muted looping video) and how previews are recorded.
- How chat actions reach the page. Assumption: the worker returns structured action events alongside the text stream, and the frontend renders buttons and performs scrolls.
- Pop-up timing (about 4 seconds) and the dismiss memory (sessionStorage).
- Exact tile layouts, breakpoints and how much less blue to use.
- Which NLP coursework projects become "How it works" visuals. Do a recon of Soren's coursework repos first and propose one or two.

## Calls made after the builder check (Claude's, for Soren to check)

- **Base.** Pass 1 merges to main first, and pass 2 plans against its data shape, including the `details` fields.
- **Demo buttons link out** in a new tab. There is no embedded demo viewer, which avoids iframe and framing problems on hosted demos.
- **Experience images.**
  - Soren approves every image before it ships. A tile with no approved image falls back to a clean monogram tile.
  - For Causality and Gray Whale, use logos or public event photos only, never platform screenshots, so no customer or internal detail can leak.
- **"How it works" tab.** It stays hidden until its first visual is done, so pass 2 can ship without it. The recon uses only Soren's own coursework repos. Any visual built from team or instructor code gets flagged to Soren before it's built.
- **Previews.** Each tile gets a poster image plus a short muted looping video, served from `public/` on Firebase Hosting. The budget is about 300 KB per tile, and the video loads only when the tile scrolls into view. Previews are recorded from the live demos using demo-safe data only.
- **Crawler view.** The prerendered HTML keeps listing every project from `projects.json`. Only the visible page drops the 11 non-demo cards. A `featured`/`tab` field on each project decides placement.
- **Chat actions transport.** Actions are model tool calls returned as structured events alongside the text. One turn can carry text plus one action. The contact card also triggers on the "How do I reach him?" starter chip without a model call.

## Soren's answers (2026-11-11)

- **Leave a note** sends a real email to Soren's Gmail through Cloudflare email sending, with a one-time dashboard setup Soren does with guidance. The visitor never leaves the chat. It needs its own Turnstile check, rate limit and input validation. On failure the chat says so and shows the contact card.
- **Sentinel's tile** opens its Devpost video.
- **Ranked AI League's tile** opens the playable game itself. Verify which URL serves the live game, the self-hosted Funnel or GitHub Pages, before wiring it. It also gets a "How it works" visual later, explaining how the AI and its custom ranked system work, in the same spirit as the NLP visuals.
- **Pass 1** is approved to ship (2026-11-11).
