# larsensoren.com Pass 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn larsensoren.com into a short, demo-first page: a demo strip in the hero, picture-tile experience, tabbed projects, and a chat that invites people in and can show contact buttons, take people to sections and demos, and email Soren a note.

**Architecture:** All content stays in `src/data/*.json`, the single source for the page, the prerender script and the worker. The chat worker gets client-action tools. When the model calls one, the worker puts the action in an `X-Chat-Action` response header and streams the text answer as before, so the text stream protocol does not change. Notes go through a separate `/api/note` route that never touches the model.

**Tech Stack:** React 18, MUI 5, CRA (Jest and Testing Library), Firebase Hosting, Cloudflare Worker (vitest), Groq, Turnstile, Resend for email.

**Spec:** `docs/superpowers/specs/2026-11-11-portfolio-pass2-design.md`

**Base:** main after PR #34 (pass 1) merges. Branch `feat/pass2`.

## Global Constraints

- `src/data/*.json` stays the single source of truth. Run `node worker/scripts/sync-data.mjs` (or the worker `pretest`) after any data edit.
- Never remove a project entry from `projects.json`. The worker's README allowlist and the deploy-gate test pin repos from it. Placement is controlled by the new `tab` field only.
- The prerendered crawler HTML keeps listing every project.
- Visible copy follows Soren's voice rules:
  - plain English and confident
  - no colons, dashes or parentheses in drafted sentences
  - no user counts except Boardal's approved line
  - no "Causality Labs"
  - no Levangie customers or seed round
  - no Gray Whale model internals
- The chat keeps deflecting salary and work authorization to Soren directly, and now also shows the contact card when it does.
- Demo buttons open in a new tab (`target="_blank" rel="noopener noreferrer"`). There is no embedded demo viewer.
- Preview media lives in `public/previews/`, about 300 KB per tile at most, and video loads only when the tile is in view. With `prefers-reduced-motion`, show the poster only.
- Every image ships only after Soren approves it (see the Asset checklist). A missing image falls back to a monogram tile.
- **Email transport change from the spec.** larsensoren.com DNS is on Google Cloud DNS, not Cloudflare, so Cloudflare email sending isn't available without moving DNS. Use Resend's API with the `onboarding@resend.dev` sender. On the free tier it can deliver only to the account owner's address, which is exactly Soren's Gmail, so no DNS change is needed. The secret is `RESEND_API_KEY` and the var is `NOTE_TO_EMAIL`.
- The chat worker deploys by hand (`cd worker && npm run deploy`). The site deploys through CI on merge to main.

## Review Focus

1. **Header injection in a note.** A name or email containing CR or LF characters, or an email that isn't an address, gets a 400. Nothing is sent. Test in Task 8.
2. **Note spam.** The 4th note from one IP within an hour gets a 429. Test in Task 8.
3. **Bad action arguments.** If the model calls `open_demo` with a title that isn't a Play-tab project, or `go_to_section` with an unknown section, no `X-Chat-Action` header is set and the text still streams. Test in Task 6.
4. **Starter card on revisit and mobile.** The card never shows again in a session after ✕ or after the chat opens, and it never covers the chat button. Test in Task 9.
5. **Reduced motion and missing media.** Tiles show the poster with no `<video>` when `prefers-reduced-motion`. A project without a preview still renders a tile. Test in Task 3.

## Asset checklist (Soren supplies or approves)

Fill in as you go. Tasks treat an empty row as "use the fallback" and never invent content.

| Where | What | Status |
|---|---|---|
| Hero tile, SLAC | demo URL already in data; approve poster and loop recorded from the live demo | to approve |
| Hero tile, Sentinel | Devpost video URL | **need URL** |
| Hero tile, StockPulse | demo URL already in data; approve poster and loop | to approve |
| Hero tile, AI League | URL that serves the live game (Funnel or Pages); approve poster and loop | **need confirm** |
| Research tab, CarbonBridge | Santa Cruz Works article URL ("How a Chance Encounter Became a Game-Changing Research Partnership"), demo video already in data, an image of the knowledge graph UI | **need article URL and image** |
| Experience, Self-Employed | image, for example a team-build or benchmark screenshot | to approve |
| Experience, Causality | logo only (no platform screenshots) | **need logo** |
| Experience, Gray Whale | Products can't be demoed, so the tile describes Gray Whale and links out to public videos. The surf video is the primary link chip, plus any Developer Camp links (the AI Developer Camp page and Leo Sagolla's recap video). Tile image is a still from the surf video or a public Developer Camp photo. Never product screenshots. | **need video URLs** |
| Experience, Onda | app screenshot and App Store link | **need** |
| Experience, TA | photo, for example Poster_Presentation.JPG already in src/images | to approve |
| Experience, Boardal | app screenshot and App Store link | **need** |
| Email | Resend account under Soren's Gmail, then `wrangler secret put RESEND_API_KEY` | **Soren, Task 8** |

---

### Task 1: Data fields and chat facts

**Files:**
- Modify: `src/data/projects.json`, `src/data/experience.json`, `src/data/about.json`, `src/data/skills.json`
- Create: `src/__tests__/data.test.js`
- Modify: `worker/src/systemPrompt.js` (ABOUT facts are already injected; add one rule line naming the new fields)
- Test: `worker/test/systemPrompt.test.js`

**Interfaces:**
- **Produces, projects.** Optional `tab: "play" | "research" | "how"`, with no tab meaning the project is not shown on the page. Optional `preview: { poster: string, video?: string }`, with paths under `/previews/`.
  - Play order is SLAC, Sentinel, StockPulse, Ranked AI League.
  - No RAGrets gets `tab: "research"` and `links: [{ label: "Read the article", url }]` once the URL is supplied.
  - Sentinel gets `video` once its URL is supplied.
- **Produces, experience.** Optional `image: string` (import path key, see Task 4) and `links: [{ label, url }]`.
- **Produces, about.** `about[0].contractEnd`, `experienceSummary`, `strongestProject`, `now`, copied verbatim from the spec, "New chat facts".
- **Produces, skills.** Add AWS, Terraform and DynamoDB under `dataInfra`. The `level` and `proficiency` fields stay in the JSON (unused after Task 2).

- [ ] **Step 1: Write the failing test** `src/__tests__/data.test.js`

```js
test('play tab has exactly the four demos in order', () => {
  expect(projects.filter(p => p.tab === 'play').map(p => p.title)).toEqual([
    'SLAC Accelerator Fault Investigator', 'Sentinel: Cyber Incident Response Council', 'StockPulse', 'Ranked AI League']);
});
test('every play project has a demo or video', () => {
  projects.filter(p => p.tab === 'play').forEach(p => expect(p.demo || p.video).toBeTruthy());
});
test('preview files exist and are under 300 KB', () => { /* fs.statSync(public + path).size <= 300*1024 for each poster/video */ });
test('about has the four approved facts', () => {
  expect(about[0].contractEnd).toMatch(/^He was brought on to take Causality's platform/);
  ['experienceSummary','strongestProject','now'].forEach(k => expect(about[0][k]).toBeTruthy());
});
test('no banned names in data', () => { expect(JSON.stringify(allData)).not.toMatch(/Causality Labs/); });
```

- [ ] **Step 2: Run the test.** `CI=true npx react-scripts test src/__tests__/data.test.js --watchAll=false`. Expected: FAIL (no `tab` fields).
- [ ] **Step 3: Edit the JSON.**
  - Verify the AI League game URL live (`curl -sI`) before setting `demo`.
  - Rewrite the League description so it no longer claims Supabase or Deno if that's no longer true. Ask Soren if unsure.
  - Until Sentinel's video URL arrives, set `video` to its GitHub repo and leave a `TODO(soren)` row in the checklist. Do not invent a URL.
  - Until previews exist (Task 10), omit `preview`.
- [ ] **Step 4: Add the system prompt rule.** Add to `worker/src/systemPrompt.js`: "ABOUT[0] also has contractEnd, experienceSummary, strongestProject and now. Use them for why the last contract ended, years of experience and level, his strongest project, and what he is working on." Add a matching assertion in `systemPrompt.test.js`.
- [ ] **Step 5: Run the tests.** Root tests plus `cd worker && npm test`. Expected: all PASS.
- [ ] **Step 6: Commit.** `git commit -m "data: tabs, previews, tile fields, approved chat facts"`

### Task 2: Skills as tags

**Files:** Modify `src/components/SkillCard.js`. Test: `src/components/__tests__/SkillCard.test.js` (create).

- [ ] **Step 1: Write the failing test.** Render `<SkillCard />` and expect `getByText('Python')` and `getByText('AWS')`. Expect `queryAllByRole('progressbar')` to have length 0, and no text matching `/Expert|Advanced|Intermediate/`.
- [ ] **Step 2: Run the test.** Expected: FAIL (bars exist).
- [ ] **Step 3: Implement.** Render each category as a small heading plus wrapped MUI `Chip`s of `name`. Keep the category labels the component already uses.
- [ ] **Step 4: Run the test.** Expected: PASS. Run the full root suite, since `App.test.js` touches skills.
- [ ] **Step 5: Commit.** `git commit -m "skills: tags instead of self-rated bars"`

### Task 3: Hero demo strip and tighter hero

**Files:**
- Create: `src/components/DemoTile.js`, `src/components/DemoStrip.js`
- Modify: `src/components/Hero.js`
- Test: `src/components/__tests__/DemoStrip.test.js`

**Interfaces:**
- **Produces:** `DemoTile({ project, compact })`, used by Task 5's Play tab. `DemoStrip()` reads `projects.filter(p => p.tab === 'play')`.
- **Tile link:** `href = project.demo || project.video`. Label: "Play" when `demo` is set, "Watch" when only `video` is.

- [ ] **Step 1: Write the failing tests.**
  - `renders four tiles linking out`: 4 links, each with `target="_blank"` and `href` equal to the data value.
  - `reduced motion shows posters only`: mock `matchMedia('(prefers-reduced-motion: reduce)')` true, then `container.querySelector('video')` is null.
  - `tile without preview still renders title and link`.
- [ ] **Step 2: Run the tests.** Expected: FAIL (module missing).
- [ ] **Step 3: Implement.**
  - `DemoTile` shows the poster `<img loading="lazy">`. It mounts a muted, `playsInline`, looping `<video>` only once an `IntersectionObserver` reports the tile in view and reduced motion is off. The fallback is a gradient block with the title.
  - `DemoStrip` lays out a 4-column grid on md and up, and 2 columns on xs.
- [ ] **Step 4: Rework the hero.** In `Hero.js`, place the photo carousel directly beside the text column. Use `maxWidth` around 960 on the inner row with `justifyContent: 'space-between'` removed, so the gap closes. Render `<DemoStrip />` as the last child inside the hero card. Keep the existing buttons, carousel and reduced-motion logic.
- [ ] **Step 5: Run the tests.** Root suite. Expected: PASS. Run `npm run build` and confirm it compiles.
- [ ] **Step 6: Commit.** `git commit -m "hero: demo strip, close the gap beside the photo"`

### Task 4: Experience picture tiles

**Files:**
- Modify: `src/components/ExperienceCard.js`
- Create: `src/data/experienceImages.js`
- Test: `src/components/__tests__/ExperienceCard.test.js` (create)

**Interfaces:**
- **Consumes:** `experience[].image` (a key) and `experience[].links` from Task 1.
- **Produces:** `experienceImages.js` exports `{ [key]: importedImageUrl }`. Only approved files go here, so JSON stays import-free and the worker never sees binary paths.

- [ ] **Step 1: Write the failing tests.**
  - `renders one tile per job in date order`: Self-Employed first, Boardal last.
  - `tile without image shows monogram`: a job whose key is missing from `experienceImages` renders its initials.
  - `clicking a tile reveals description and links`: after the click, the description text and the link chips are visible, and each link has `target="_blank"`.
- [ ] **Step 2: Run the tests.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Grid: 3 columns on md, 2 on sm, 1 on xs. Tile = image (or monogram) + company + title.
  - Clicking expands that tile's detail full width below its row, using MUI `Collapse`. Only one tile is open at a time, reusing the existing `expandedExperience` state.
  - The detail shows `description` (pre-line), `links` chips and `skills` chips.
  - Keep the `Graphic Designer` filter and the `parseDate` sort.
- [ ] **Step 4: Run the tests.** Root suite. Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "experience: picture tiles with monogram fallback"`

### Task 5: Projects tabs

**Files:**
- Modify: `src/components/ProjectCard.js`
- Test: `src/components/__tests__/ProjectCard.test.js` (create, or extend if present)
- Test: `scripts/prerender.test.js`

**Interfaces:**
- **Consumes:** `DemoTile` from Task 3, `tab` from Task 1, `contact[0].github`.
- **Produces:** listens for `window` event `portfolio:projects-tab` with `detail: 'play' | 'research' | 'how'` and switches to that tab. Task 7 dispatches it.

- [ ] **Step 1: Write the failing tests.**
  - `only tabbed projects render`: `queryByText('policy-tree')` is null.
  - `Play tab default shows four demo tiles`.
  - `How it works tab hidden when no project has tab "how"`.
  - `Research tab shows No RAGrets with its links`.
  - `More on GitHub links to contact github`.
  - `projects-tab event switches tab`: `act(() => window.dispatchEvent(new CustomEvent('portfolio:projects-tab', { detail: 'research' })))`, then No RAGrets is visible.
  - In `scripts/prerender.test.js`, add `policy-tree` to the needles. The crawler view keeps all projects.
- [ ] **Step 2: Run the tests.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Use MUI `Tabs` with labels "Play with it", "How it works" and "Research".
  - Play renders `DemoTile`s in a 2-column grid. Research renders the existing expanded entry layout for its projects.
  - Remove the sponsored, personal, school and coursework grouping from the page only.
  - Leave `scripts/prerender.js` unchanged.
- [ ] **Step 4: Run the tests.** Root suite plus `node scripts/prerender.test.js` after `npm run build`. Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "projects: three tabs, rest on GitHub"`

### Task 6: Worker client-action tools

**Files:**
- Modify: `worker/src/tools.js`, `worker/src/chat.js`, `worker/src/cors.js`, `worker/src/systemPrompt.js`
- Test: `worker/test/chat.test.js`, `worker/test/tools.test.js`, `worker/test/cors.test.js`

**Interfaces:**
- **Produces, tools.** Added to `TOOLS_SPEC`:
  - `show_contact()`
  - `go_to_section({ section: "experience"|"projects"|"skills"|"education"|"contact" , tab?: "play"|"research"|"how" })`
  - `open_demo({ title: <enum of play-tab titles built from projects.json> })`
  - `leave_note()`
- **Produces, validation.** `resolveClientAction(toolCall) -> { type: 'contact' } | { type: 'section', section, tab? } | { type: 'demo', title, url } | { type: 'note' } | null`, exported from `tools.js`. It validates the arguments against the enums and the data, and returns `null` on anything else.
- **Produces, header.** `X-Chat-Action: <JSON of the resolved action>`, set only when the result is non-null. Add `Access-Control-Expose-Headers: X-Chat-Action` to `corsHeaders`.
- **Chat flow.** For a client action, the tool result message sent to phase 2 is `"Shown to the visitor."` (no fetch). `fetch_repo_readme` behaves exactly as today.

- [ ] **Step 1: Write the failing tests.**
  - `tools.test.js`, `resolveClientAction`:
    - `open_demo` with `"StockPulse"` → `{ type:'demo', title:'StockPulse', url:<data demo> }`
    - `"policy-tree"` → `null`
    - `go_to_section` with `"blog"` → `null`
    - `show_contact` → `{ type:'contact' }`
  - `chat.test.js`, using the existing Groq mock helpers to make the first call emit a `show_contact` tool call:
    - the response has `X-Chat-Action` equal to `'{"type":"contact"}'` and the body text from phase 2
    - a bad `open_demo` gives no header and still a 200 text body
  - `cors.test.js`: the expose header is present for an allowed origin.
- [ ] **Step 2: Run the tests.** `cd worker && npx vitest run test/tools.test.js test/chat.test.js test/cors.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** as specified above. In `systemPrompt.js`, replace the "reach him via the Contact section" deflection with: "...that's a great question for Soren directly." Then call `show_contact`. Add rules:
  - Call `show_contact` when asked how to reach him or for links.
  - Call `open_demo` when asked to see something he built.
  - Call `go_to_section` when asked where something is on the page.
  - Call `leave_note` when the visitor wants to message him.
  - Never mention tool names to the visitor.
- [ ] **Step 4: Run the tests.** Full worker suite. Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "chat worker: client action tools via X-Chat-Action header"`

### Task 7: Chat action rendering

**Files:**
- Modify: `src/components/chat/chatApi.js`, `src/components/chat/useChat.js`, `src/components/chat/ChatMessage.js`, `src/components/chat/chatConfig.js`
- Create: `src/components/chat/ChatAction.js`
- Tests: `src/components/chat/__tests__/chatApi.test.js`, `useChat.test.js`, `ChatMessage.test.js`

**Interfaces:**
- **Consumes:** the `X-Chat-Action` header (Task 6). The `portfolio:projects-tab` event and `#<section>` ids (Task 5, CardLayout). `contact.json`, including `x`.
- **Produces, streaming.** `streamChat({ ..., onAction })` calls `onAction(parsedJSON)` once, before yielding text, when the header is present and parses. Unparseable headers are ignored.
- **Produces, messages.** An assistant message may carry `action`.
- **Produces, rendering.** `ChatAction({ action })` renders one of:
  - **contact:** buttons for Email (`mailto:`), LinkedIn, X, GitHub and Resume
  - **section:** a "Take me there" button that calls `document.getElementById(section).scrollIntoView({ behavior: 'smooth' })`, and when `tab` is set also dispatches `portfolio:projects-tab`
  - **demo:** an "Open <title>" button to `url` in a new tab
  - **note:** `<NoteForm />` from Task 8
- **Produces, starter config.** `chatConfig.STARTER_PROMPTS = ["What's he building now?", 'Show me his best demo', 'How do I reach him?']` replaces `SUGGESTED_PROMPTS`. `useChat.send` treats exactly `'How do I reach him?'` as local: it appends the user message plus an assistant message `{ content: "Here's how to reach Soren.", action: { type: 'contact' } }` with no network call.

- [ ] **Step 1: Write the failing tests.**
  - chatApi: a response with the header → `onAction` called with the object. A bad JSON header → not called, and the text still yields.
  - useChat: an action is stored on the assistant message. `'How do I reach him?'` makes zero fetch calls and produces a contact action.
  - ChatMessage:
    - contact renders 5 buttons with the hrefs from `contact.json`
    - a demo button has `target="_blank"`
    - a section click calls a mocked `scrollIntoView` and dispatches the tab event
- [ ] **Step 2: Run the tests.** `CI=true npx react-scripts test src/components/chat --watchAll=false`. Expected: FAIL.
- [ ] **Step 3: Implement** to the interfaces above.
- [ ] **Step 4: Run the tests.** Expected: PASS. Fix existing tests that assert the old suggested prompts.
- [ ] **Step 5: Commit.** `git commit -m "chat UI: render contact, section, demo and note actions"`

### Task 8: Leave-a-note email

**Files:**
- Create: `worker/src/note.js`, `src/components/chat/NoteForm.js`
- Modify: `worker/src/index.js`, `worker/src/rateLimit.js`, `worker/wrangler.jsonc`, `src/components/chat/chatApi.js`, `src/components/chat/turnstile.js` (doc type only)
- Tests: `worker/test/note.test.js`, `worker/test/rateLimit.test.js`, `src/components/chat/__tests__/NoteForm.test.js`

**Interfaces:**
- **Route.** `POST /api/note`, body `{ name, email, message }`, Turnstile action `'note'`, added to `ROUTES` in `index.js`.
- **Validation.**
  - `name`: 1 to 100 chars, no `\r` or `\n`.
  - `email`: at most 200 chars, matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, no CR or LF.
  - `message`: 10 to 2000 chars.
  - Failing input → 400 `{ error: 'invalid' }`.
- **Rate limit.** `checkNoteLimit(kv, ip) -> { allowed, retryAfterSec }` in `rateLimit.js`, with 3 per hour per IP under key prefix `note:`. Over the limit → 429.
- **Send.** `sendNote(env, { name, email, message }) -> Promise<void>` POSTs `https://api.resend.com/emails` with `Authorization: Bearer ${env.RESEND_API_KEY}` and body:
  - `from: 'Portfolio <onboarding@resend.dev>'`
  - `to: env.NOTE_TO_EMAIL`
  - `reply_to: email`
  - `subject: 'larsensoren.com note from ' + name`
  - `text: message`
  - A non-2xx response → 502 `{ error: 'send_failed' }`. Success → 200 `{ ok: true }`.
- **Config.** Add `NOTE_TO_EMAIL` to `vars` in `wrangler.jsonc` with Soren's Gmail. Never in client code.
- **Client.** `sendNote({ name, email, message })` in `chatApi.js` uses `turnstileToken('note')` and maps 400, 429 and 502 to `ChatApiError` kinds `badRequest`, `rateLimited` and `upstream`.
  - `NoteForm` has 3 fields and a Send button. On success it says "Sent. Soren will reply by email."
  - On error it shows the message plus `<ChatAction action={{type:'contact'}} />` as the fallback.

- [ ] **Step 1: Write the failing tests.**
  - note.test:
    - valid → 200, with Resend `fetch` called once and its JSON containing `reply_to`
    - name `"a\r\nBcc: x@y.z"` → 400, fetch not called
    - email `"nope"` → 400
    - Resend 500 → 502
  - rateLimit.test: the 4th `checkNoteLimit` within an hour → `allowed:false`.
  - NoteForm: submit calls `sendNote` with the field values. The rejected promise shows the contact fallback.
- [ ] **Step 2: Run the tests.** Expected: FAIL.
- [ ] **Step 3: Implement** to the interfaces above.
- [ ] **Step 4: Run the tests.** Both suites. Expected: PASS.
- [ ] **Step 5: Soren setup (manual, wait for him).**
  - He creates a Resend account with his Gmail and makes an API key.
  - Then he runs `cd worker && npx wrangler secret put RESEND_API_KEY`.
  - Verify after deploy (Task 11) by sending one real note.
- [ ] **Step 6: Commit.** `git commit -m "chat: leave Soren a note via /api/note and Resend"`

### Task 9: Starter card pop-up

**Files:**
- Modify: `src/components/chat/ChatWidget.js`
- Create: `src/components/chat/StarterCard.js`
- Test: `src/components/chat/__tests__/ChatWidget.test.js`

**Interfaces:**
- **Consumes:** `STARTER_PROMPTS` (Task 7) and `chat.send` from `useChat`.
- **Produces:**
  - The card appears `STARTER_DELAY_MS = 4000` after mount, positioned above the FAB and never overlapping it.
  - The ✕ or opening the chat sets `sessionStorage['chatStarterDismissed'] = '1'`. Wrap it in try/catch.
  - A chip opens the panel and calls `chat.send(prompt)`.
  - The existing section-change wiggle stays. The existing peek tooltip is removed if it would show at the same time as the card.

- [ ] **Step 1: Write the failing tests** (fake timers).
  - `not visible before 4s, visible after`.
  - `✕ hides and does not return after remount`: same sessionStorage.
  - `clicking a chip opens the panel and sends that prompt`: mock the `useChat` send.
  - `does not show if dismissed flag already set`.
  - `sessionStorage throwing still renders the card`.
- [ ] **Step 2: Run the tests.** Expected: FAIL.
- [ ] **Step 3: Implement.** The card is about 240px wide on xs. On narrow screens it sits above the FAB with `bottom` offset equal to the FAB size plus 16px. It fades in, with no animation under reduced motion.
- [ ] **Step 4: Run the tests.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "chat: starter card invites visitors in"`

### Task 10: Preview media

**Files:**
- Create: `public/previews/<slug>.jpg` and `public/previews/<slug>.mp4` for slac, sentinel, stockpulse, league, plus `scripts/record-previews.md` (the commands used)
- Modify: `src/data/projects.json` (`preview` fields)

- [ ] **Step 1: Record.**
  - Use Playwright on each live demo with demo-safe data only: an 8 to 10 second screen capture at 1280x800.
  - For Sentinel, take frames from its Devpost video.
  - Encode with `ffmpeg -i in.webm -vf scale=640:-2 -an -c:v libx264 -crf 32 -movflags +faststart <slug>.mp4`, and take the poster as frame 1 at quality 4.
- [ ] **Step 2: Show Soren every poster and loop.** Ship only the ones he approves.
- [ ] **Step 3: Set the `preview` fields.** Run `src/__tests__/data.test.js`. Expected: PASS, with the size check under 300 KB each. Re-encode at a higher CRF if not.
- [ ] **Step 4: Commit.** `git commit -m "previews: approved demo loops"`

### Task 11: How-it-works recon, verify, ship

**Files:** Create `docs/superpowers/specs/2026-11-11-how-it-works-candidates.md`.

- [ ] **Step 1: Recon.**
  - Scan Soren's own NLP coursework repos (`gh repo list iamsorenl`, plus local folders) and the AI League's AI and ranking code.
  - Propose 2 or 3 visual candidates, each with what a visitor would see and interact with, the source it's built from, and effort. Flag any team or instructor code.
  - Write the doc. No build. The tab stays hidden.
- [ ] **Step 2: Full checks.**
  - `CI=true npm test -- --watchAll=false`, `npm run lint`, `npm run build`, `node scripts/prerender.test.js` and `cd worker && npm test`. Expected: all pass.
  - Serve `build/` locally and click through with Soren: hero tiles open demos, the starter card appears and dismisses, every chat action works (one real note after his Resend setup), the tabs switch, and the tiles expand. Check at mobile width (390px) too.
- [ ] **Step 3: Ship.**
  - Open the PR. After Soren merges, run `cd worker && npm run deploy`.
  - Confirm the live chat answers "How do I reach him?" with buttons, and that `X-Chat-Action` is readable cross-origin from larsensoren.com.
