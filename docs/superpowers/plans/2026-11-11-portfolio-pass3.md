# Portfolio Pass 3 (site) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make larsensoren.com show Soren out in the world at the top and the work (with real media and interactive pieces) below, per the pass 3 design.

**Architecture:** One shared `CyclingMedia` component drives every cycling tile (hero moments, experience, education). Media lives as web-sized copies in `public/`, referenced from JSON data; a data test asserts every referenced file exists. Cross-section jumps reuse the existing `portfolio:projects-tab` event and scroll helper. This plan covers the site only; the three NLP explainer pages (Explore links) are plan B, in their own repos.

**Tech Stack:** CRA React 18, MUI v5, Jest + React Testing Library (`npm test`), Firebase Hosting via CI, Cloudflare Worker (`worker/`, vitest). Media tooling: `ffmpeg`, `sips`, `yt-dlp`, Python PIL (all installed).

**Spec:** `docs/superpowers/specs/2026-11-11-portfolio-pass3-design.md`

## Global Constraints

- Every photo or clip appears in exactly one place on the site.
- Only media listed in the spec's "Approved media" section; never invent media, URLs, numbers or metrics. Numbers on cards come only from Soren's write-ups or repo files.
- Banned in any shipped file: "Causality Labs" (write "Causality"), "sentinal", any `devpost.com/software` link, Levangie customer names, Gray Whale internals.
- Never commit originals: images ≤ 1600px long edge (JPG q≈80 or WebP); video ≤ 720p H.264, muted (`-an`), ≤ ~3 MB per loop. `public/videos/gray-whale-surf-ranch.mp4` and `slac-xray-laser-explained.mp4` stay gitignored.
- All motion is muted, lazy (IntersectionObserver like `DemoTile`), and under `prefers-reduced-motion: reduce` shows the first still only, no auto-advance.
- CSP in `firebase.json` is NOT changed: images/video same-origin only, no YouTube iframes.
- Visible copy goes through the soren-voice skill; Soren approves wording at click-through; log approvals in `~/.claude/skills/soren-voice/voice-profile.md`.
- Never remove entries from `projects.json`.
- Stage by explicit path. The other session's uncommitted SLAC edits (`src/components/ProjectCard.js`, `src/components/__tests__/ProjectCard.test.js`, `src/data/projects.json`) are folded in (Task 5 reviews and commits them).
- Each task ends with a local commit on `feat/pass3` only if Soren has OK'd per-task commits for this run (ask once before execution); push only when Soren says.

## Review Focus

1. A media file referenced in data but missing from `public/` (typo, forgot to copy) → tile shows a broken image. Pinned by `media.test.js` in Task 1, extended by each later task.
2. Reduced-motion users get auto-advancing or autoplaying media → must show first still only. Pinned in Task 2 (`CyclingMedia` tests).
3. A tap target that no longer exists (section id renamed, tab key changed) → tap silently does nothing. Pinned in Task 3 (`moments.test.js` asserts every target is a known section/tab).
4. Phone width (390px): four moment tiles and cycling experience tiles overflow horizontally. Checked at click-through (Task 8) with a scripted 390px screenshot and a `scrollWidth <= innerWidth` assertion.
5. Removing Skills leaves a dead nav link or a chat action that scrolls to `#skills`. Pinned in Task 6 (nav test + grep).

---

### Task 1: Media prep and the "every referenced file exists" test

**Files:**
- Create: `public/media/` (moments, experience, education, projects subfolders), `public/writeups/`
- Create: `src/data/__tests__/media.test.js`
- Create: `scripts/media-notes.md` (the exact ffmpeg/sips commands used, so copies can be rebuilt)

**Interfaces:**
- Produces: these public paths, used by later tasks:
  - `/media/moments/devcamp-talk.jpg`, `/media/moments/devcamp-crowd.jpg` (from `public/images/developer-camp-talk.jpg`, `developer-camp.jpg`), `/media/moments/hackathon-table.jpg` (from `public/images/slac-team.jpg`), `/media/moments/surf-ranch-laugh.jpg` (`Copy of DSC09810.JPEG`), `/media/moments/surf-ranch-barrel.jpg` (`IMG_0391.jpg`), `/media/moments/longboard.jpg` (`~/Pictures/IMG_9824.jpg`), `/media/moments/poster-demo.jpg` (`IMG_3678.JPG`)
  - `/media/experience/gray-whale-loop.mp4` + `.jpg` poster (≤ 8 s from `public/videos/gray-whale-surf-ranch-720p.mp4`), `/media/experience/boardal-wave.mp4` + `.jpg` (reel C90xFCBywPS, ~3 s to 9 s, center-cropped to 16:9 around Soren), `/media/experience/boardal-feed.jpg`, `/media/experience/boardal-filter.jpg` (stills from reel DACZSzDSRT1, app screens only, no face)
  - `/media/education/hooding.jpg` (`IMG_3674.JPG`), `/media/education/poster-talk.jpg` (`IMG_3689.JPG`), `/media/education/redwoods.jpg` (`HIC_0512-…-032.jpg`)
  - `/media/projects/sentinel.jpg` (YouTube `4D9yiXNAT0k` maxres/hq thumbnail, saved), `/media/projects/no-ragrets.mp4` + `.jpg`, `/media/projects/edumuse.mp4` + `.jpg` (≤ 8 s muted loops cut from Soren's own videos `2yX1e5xogUQ`, `LAdN2gNdSyM` via `yt-dlp`)
  - `/writeups/ptb-transformer.pdf` (`Report.pdf` from repo `iamsorenl/Language-Modeling-on-Penn-Treebank`), `/writeups/transformer-qa.pdf` (`NLP 203/A2/NLP_203_Assignment_2.pdf`), `/writeups/nmt.pdf` (`NLP 203/A1/NLP_203_Assignment_1.pdf`)
  - Instagram sources (if the scratchpad copies are gone): `yt-dlp https://www.instagram.com/reel/C90xFCBywPS/` and `…/DACZSzDSRT1/`.
- Produces: `collectMediaPaths(): string[]` exported from `src/data/mediaPaths.js`, which walks the data files and returns every `/media/…`, `/images/…`, `/previews/…`, `/writeups/…` path they reference. Later tasks add their data files to it.

- [ ] **Step 1: Write the failing test** `src/data/__tests__/media.test.js`

```js
import fs from 'fs';
import path from 'path';
import { collectMediaPaths } from '../mediaPaths';

test('every media path referenced in data exists in public/', () => {
    const missing = collectMediaPaths().filter((p) => !fs.existsSync(path.join(__dirname, '../../../public', p)));
    expect(missing).toEqual([]);
});

test('no shipped media file is over the size cap', () => {
    const big = collectMediaPaths().filter((p) => {
        const f = path.join(__dirname, '../../../public', p);
        const cap = p.endsWith('.mp4') ? 3.5e6 : p.endsWith('.pdf') ? 10e6 : 1e6;
        return fs.existsSync(f) && fs.statSync(f).size > cap;
    });
    expect(big).toEqual([]);
});
```

- [ ] **Step 2: Run it, expect FAIL** (`Cannot find module '../mediaPaths'`): `CI=true npm test -- media.test`
- [ ] **Step 3: Implement `collectMediaPaths()`** in `src/data/mediaPaths.js`: JSON-stringify the imported data modules (`projects.json`, `experienceImages.js` for now) and regex-match `"(/(?:media|images|previews|writeups)/[^"]+)"`.
- [ ] **Step 4: Make all the web copies above** with ffmpeg/sips/PIL; record each command in `scripts/media-notes.md`. View each output once (stills: Read the image; video: one frame) to confirm crop and content. Boardal stills must show only app screens.
- [ ] **Step 5: Run `CI=true npm test -- media.test`, expect PASS.**
- [ ] **Step 6: Commit**

```bash
git add public/media public/writeups src/data/mediaPaths.js src/data/__tests__/media.test.js scripts/media-notes.md
git commit -m "media: web copies of approved pass 3 media and a presence test"
```

---

### Task 2: `CyclingMedia` shared component

**Files:**
- Create: `src/components/CyclingMedia.js`
- Test: `src/components/__tests__/CyclingMedia.test.js`

**Interfaces:**
- Produces: `<CyclingMedia items={MediaItem[]} intervalMs={number=6000} sx={object} label={string} />` where `MediaItem = { type: 'image' | 'video', src: string, poster?: string, alt: string }`. Fills its parent (`position:relative`, 100% w/h, `objectFit: cover`). Crossfades between items. Videos are `muted loop playsInline autoPlay`, loaded only once in view (same IntersectionObserver pattern as `src/components/DemoTile.js:13-27`); a video item advances on `ended`-free timer like images. Pauses on hover/focus. One item → no timer.

- [ ] **Step 1: Write failing tests**

```js
// mock matchMedia per test: reduced = true/false
test('shows the first item, then the next after intervalMs', () => {
    jest.useFakeTimers();
    render(<CyclingMedia items={[img('a'), img('b')]} intervalMs={1000} label="t" />);
    expect(screen.getByAltText('a')).toBeVisible();
    act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByAltText('b')).toBeVisible();
});
test('reduced motion: first still only, never advances', () => { /* advance 10000, still 'a', no <video> in DOM */ });
test('video item renders a poster img until in view (no IntersectionObserver in jsdom)', () => { /* expect img with poster src, no <video> */ });
test('single item sets no interval', () => { /* jest.getTimerCount() === 0 */ });
```

- [ ] **Step 2: Run `CI=true npm test -- CyclingMedia`, expect FAIL** (module not found).
- [ ] **Step 3: Implement** `CyclingMedia` (only the active item and the next are mounted; non-active ones `opacity: 0`, 0.8 s transition; reduced motion → `transition: none`).
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `git add src/components/CyclingMedia.js src/components/__tests__/CyclingMedia.test.js && git commit -m "ui: CyclingMedia, one cycling tile for hero, experience, education"`

---

### Task 3: Hero moments strip, tappable SlugFest, carousel dots fix

**Files:**
- Create: `src/data/moments.json`, `src/components/MomentStrip.js`, `src/utils/goTo.js`
- Modify: `src/components/Hero.js` (swap `DemoStrip` for `MomentStrip`; SlugFest tap; dots wrap), `src/components/chat/ChatAction.js:37-41` (import `goToSection` from `src/utils/goTo.js` instead of the local copy), `src/data/mediaPaths.js` (add `moments.json`)
- Delete: `src/components/DemoStrip.js`, `src/components/__tests__/DemoStrip.test.js` (DemoTile stays: Projects uses it)
- Test: `src/components/__tests__/MomentStrip.test.js`, `src/data/__tests__/moments.test.js`

**Interfaces:**
- Consumes: `CyclingMedia` (Task 2), media paths (Task 1).
- Produces: `goToSection({ section: string, tab?: 'play'|'research', anchor?: string })` in `src/utils/goTo.js`. Moves the existing function out of `ChatAction.js` unchanged, plus: when `anchor` is given, scroll to `document.getElementById(anchor)` instead of the section (used for a specific experience tile or project card). Experience tiles get `id="exp-<image key>"` (Task 4); project cards get `id="project-<slug>"` (Task 5).
- `moments.json`: `[{ "id": "devcamp", "items": [MediaItem…], "target": null | { section, tab?, anchor? } }]`, four entries in the spec's order and targets: devcamp → null; hackathon → `{section:'projects', tab:'play', anchor:'project-slac'}`; surf-ranch → `{section:'experience', anchor:'exp-gray-whale'}`; longboard+poster → `{section:'education'}`.

- [ ] **Step 1: Failing tests**
  - `moments.test.js`: exactly 4 moments; every `target.section` ∈ `['about','experience','projects','education','contact']`; every `target.tab` ∈ `['play','research']`; no media `src` appears twice across `moments.json`, and none of them equals a hero carousel file name.
  - `MomentStrip.test.js`: renders 4 tiles; a tile with a target is a `button` (accessible name from its first item's alt); clicking the hackathon tile dispatches `portfolio:projects-tab` with `detail: 'play'`; the devcamp tile is not a button.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** `goTo.js`, `moments.json`, `MomentStrip` (4 columns ≥ md, 2×2 below md, each tile 16:9 with `CyclingMedia`, staggered `intervalMs` 5000/6000/7000/8000 so they don't flip together). In `Hero.js`: replace `<DemoStrip />`; make the SlugFest carousel image a button calling `goToSection({ section: 'projects', tab: 'research', anchor: 'project-no-ragrets' })` with `aria-label` "SlugFest talk, see No RAGrets"; make the dots row `flexWrap: 'nowrap'` with dot spacing that fits 11 dots under the photo at 1440px.
- [ ] **Step 4: Run `CI=true npm test`, expect PASS** (whole suite: `ChatAction` still works after the move).
- [ ] **Step 5: Commit** the files listed above by path, message `hero: four moment tiles of Soren in the world, SlugFest jumps to No RAGrets`.

---

### Task 4: Experience tile media (Gray Whale, Boardal, Causality)

**Files:**
- Modify: `src/data/experienceImages.js` → rename to `src/data/experienceMedia.js` exporting `{ [imageKey]: MediaItem[] | 'causality-anim' | 'github-graph' }`; `src/components/ExperienceCard.js:31-60` (tile media slot renders `CyclingMedia`, `CausalityAnim`, or monogram; tile gets `id="exp-<image key>"`); `src/data/experience.json` (add `image` keys where missing: `boardal`, `causality`, `self-employed`; add Boardal `links`: `[{label:"Surf tip reel", url:"https://www.instagram.com/reel/C-BmIEKyAQh/"},{label:"App demo reel", url:"https://www.instagram.com/reel/DACZSzDSRT1/"}]` rendered as "Watch on Instagram" chips like the existing Website chip); `src/data/mediaPaths.js`.
- Create: `src/components/CausalityAnim.js` (CSS/SVG loop inspired by causality.ai's hero animation: look at the live page first, describe it in the commit message; static frame under reduced motion)
- Test: `src/components/__tests__/ExperienceCard.test.js` (extend)

**Interfaces:**
- Consumes: `CyclingMedia`, Task 1 paths. Gray Whale items: `[video gray-whale-loop.mp4, image /images/developer-camp-team.jpg]`. Boardal: `[video boardal-wave.mp4, image boardal-feed.jpg, image boardal-filter.jpg]`.
- Produces: `exp-<key>` element ids used by Task 3's surf-ranch target (`exp-gray-whale`).

- [ ] **Step 1: Failing tests:** Gray Whale tile has `id="exp-gray-whale"` and renders a CyclingMedia (poster img `gray-whale-loop.jpg`); Boardal tile shows two links named /Instagram/ with the two URLs; Causality tile renders `data-testid="causality-anim"`; Onda and Baskin tiles still render monograms; no tile text contains "Causality Labs".
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run `CI=true npm test`, expect PASS.**
- [ ] **Step 5: Commit** by path: `experience: real media for Gray Whale and Boardal, Causality animation`.

### Task 4b: Self-Employed animated GitHub contribution graph

**Files:**
- Create: `scripts/fetch-contributions.mjs`, `src/data/contributions.json`, `src/components/ContributionGraph.js`
- Modify: `package.json` (script `"sync:contributions": "node scripts/fetch-contributions.mjs"`), `src/data/experienceMedia.js` (`'self-employed': 'github-graph'`), `src/components/ExperienceCard.js`
- Test: `src/components/__tests__/ContributionGraph.test.js`

**Interfaces:**
- First run the reuse-kits skill: if a kit already does GitHub GraphQL fetching, use it in the script.
- `fetch-contributions.mjs`: token from `GITHUB_TOKEN` or `gh auth token`; queries `user(login:"iamsorenl"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}`; writes `{ fetchedAt, total, days: [{ date, count }] }` (last 365 days). On any failure it prints the error, exits 1, and leaves the existing JSON untouched. It is run by hand, not in `npm run build`, so CI never depends on it. *(Deviation from the spec's "at build time": same result, no CI token needed. Mention to Soren.)*
- `<ContributionGraph days={Day[]} />`: SVG grid of 7-row week columns, cell shade from count quartiles using theme primary; cells fade in column by column over ~2 s once in view; reduced motion → fully drawn, no animation. `aria-label` = "`{total}` GitHub contributions in the last year".

- [ ] **Step 1: Failing tests:** given 14 fake days renders 14 cells (`data-testid="day"`); empty `days` renders nothing (no crash); aria-label contains the total.
- [ ] **Step 2: Run, expect FAIL.** **Step 3: Implement component + script; run `npm run sync:contributions` once for real data.** **Step 4: Run tests, expect PASS.**
- [ ] **Step 5: Commit** by path: `experience: Self-Employed tile draws the real GitHub contribution graph`.

---

### Task 5: Projects: Research tab, YouTube previews, Sentinel thumbnail, NLP cards, SLAC fold-in

**Files:**
- Modify: `src/data/projects.json`, `src/components/ProjectCard.js`, `src/components/__tests__/ProjectCard.test.js`, `src/data/mediaPaths.js`
- Create: `src/components/ResultChart.js` (tiny SVG bar chart used as the NLP card thumbnail)
- Test: `src/components/__tests__/ResultChart.test.js`, `src/data/__tests__/projects.test.js` (create if absent, else extend)

**Interfaces:**
- First: read the other session's uncommitted diff in the three files (`git diff`), keep the "What is an X-ray laser? (SLAC)" link (`https://www.youtube.com/watch?v=kUeraeIkTmo`), keep its `ProjectCard` changes and test if they pass, and remove the SLAC `photo` field (`slac-team.jpg` is now moment tile 2).
- `projects.json` changes (no entries removed):
  - No RAGrets: `tab:"research"` (already), `preview:{poster:"/media/projects/no-ragrets.jpg", video:"/media/projects/no-ragrets.mp4"}`.
  - EduMUSE: `tab:"research"`, `preview:{poster:"/media/projects/edumuse.jpg", video:"/media/projects/edumuse.mp4"}`.
  - Sentinel: `preview:{poster:"/media/projects/sentinel.jpg"}`.
  - Three new entries, `tab:"research"`, each with `slug`, `link` (repo), `writeup` (`/writeups/…pdf`), `explore` (omit until plan B publishes the page; never a guessed URL), and `results` for the chart:
    - `ptb-transformer`: "Transformer language model on Penn Treebank", repo `https://github.com/iamsorenl/Language-Modeling-on-Penn-Treebank`, `results: { metric: "Test perplexity (lower is better)", bars: [["Baseline", 83.35], ["Smaller, tuned", 39.11], ["Larger", 134.72]] }`
    - `transformer-qa`: "Transformer QA: robustness and domain adaptation", repo `https://github.com/iamsorenl/Transformer_QA`, `results: { metric: "Test F1", bars: [["Baseline", 43.79], ["LoRA", 54.33]] }`
    - `nmt`: "Neural machine translation, French to English", repo `https://github.com/iamsorenl/Neural-Machine-Translation`, `results`: re-read the BLEU tables in `/writeups/nmt.pdf` (`pdftotext -layout`) and use only rows whose condition (BPE / no BPE, model) the write-up states; if a table's condition is unclear, leave it out and tell Soren.
  - Descriptions: 1–2 sentences each, drafted with soren-voice, flagged for Soren's approval.
- Every card in `tab` gets `id="project-<slug>"` (slug = existing `slug` field, else kebab-case title; SLAC → `project-slac`, No RAGrets → `project-no-ragrets`).
- `ProjectCard` research cards with `results` show `<ResultChart results={…} />` as the thumbnail and three buttons: Repo, Write-up, Explore (Explore only if `explore` set). Cards with `preview.video` keep using `DemoTile` (muted loop, click opens YouTube).
- `<ResultChart results={{ metric: string, bars: [string, number][] }} />`: horizontal bars scaled to the max value, value label on each bar, `metric` as caption, theme colors in light and dark.

- [ ] **Step 1: Failing tests:**
  - `projects.test.js`: the research tab holds exactly No RAGrets, EduMUSE, ptb-transformer, transformer-qa, nmt (by title or slug, in that order); the project count did not drop compared with `origin/main` (hard-code the current count); no `photo` on SLAC; no string matches `/devpost\.com\/software|sentinal|Causality Labs/`; every `explore` value, if present, starts with `https://iamsorenl.github.io/`.
  - `ResultChart.test.js`: renders one bar per entry with its number as text; the longest bar belongs to the max value.
  - `ProjectCard.test.js`: Research tab shows a "Write-up" link to `/writeups/transformer-qa.pdf`; no Explore button when `explore` is absent; each card has the `project-<slug>` id.
- [ ] **Step 2: Run, expect FAIL.** **Step 3: Implement.** **Step 4: `CI=true npm test`, expect PASS.**
- [ ] **Step 5: Commit** by path (includes the folded-in SLAC edits): `projects: Research tab with NLP write-ups and charts, video previews, Sentinel thumbnail`.

---

### Task 6: Remove Skills, add the "what does he work with" prompt

**Files:**
- Delete: `src/components/SkillCard.js`, `src/components/__tests__/SkillCard.test.js`
- Modify: `src/components/CardLayout.js` (drop the skills section and lazy import), `src/components/Navigation.js:36` (drop the Skills link), `src/components/chat/chatConfig.js` (`STARTER_PROMPTS` gains a 4th prompt, wording via soren-voice, e.g. "What does he work with?"), worker system prompt/section list only if it offers a `skills` section to the "take me there" action (grep `skills` in `worker/src`; remove it from the allowed sections and its test)
- Keep: `src/data/skills.json` (the worker reads it via sync-data so the chat can still answer).
- Test: `src/components/chat/__tests__/chatConfig.test.js`, a nav test (create `src/components/__tests__/Navigation.test.js` if none)

- [ ] **Step 1: Failing tests:** nav has no "Skills" link; `STARTER_PROMPTS` has 4 entries and includes the new prompt; `grep -rn "'skills'\|\"skills\"\|#skills" src worker/src` finds no section reference (assert in the plan step, not a test).
- [ ] **Step 2: Run, expect FAIL.** **Step 3: Implement.** **Step 4: `CI=true npm test` and `cd worker && npm test`, expect PASS (including the prompt-size test).**
- [ ] **Step 5: Commit** by path: `skills: section removed, chat answers it from a starter prompt`.

---

### Task 7: Education cycling media

**Files:**
- Modify: `src/data/education.json` (master's entry gets `media: [hooding.jpg, poster-talk.jpg]`, bachelor's gets `media: [redwoods.jpg]`, as MediaItems with alt text), `src/components/EducationCard.js` (a 16:9 media header per degree using `CyclingMedia` when `media` is present), `src/data/mediaPaths.js`
- Test: `src/components/__tests__/EducationCard.test.js` (create)

- [ ] **Step 1: Failing tests:** master's card renders an img with src `/media/education/hooding.jpg`; bachelor's renders `/media/education/redwoods.jpg`; diploma link still present.
- [ ] **Step 2: FAIL. Step 3: Implement. Step 4: `CI=true npm test` PASS.**
- [ ] **Step 5: Commit** by path: `education: cycling photos per degree`.

---

### Task 8: Contact closing card

**Files:**
- Modify: `src/components/ContactCard.js`, `src/components/CardLayout.js` (Contact becomes full width `md={12}` after Education; Education goes `md={12}` too so the media headers have room), `src/components/chat/chatConfig.js` (`NOTE_PROMPT = 'Leave Soren a note'`), `src/components/chat/useChat.js:130-140` (answer `NOTE_PROMPT` locally like `CONTACT_PROMPT`, with `action: { type: 'note' }`), `src/components/chat/ChatWidget.js` (listen for `window` event `portfolio:open-chat` with `detail: { prompt }` → `handleStarterSelect(prompt)`)
- Create: `src/components/WaveLine.js` (SVG sine path, slow horizontal drift via CSS keyframes, static under reduced motion, `aria-hidden`)
- Test: `src/components/__tests__/ContactCard.test.js` (create), `src/components/chat/__tests__/useChat.test.js`, `src/components/chat/__tests__/ChatWidget.test.js` (extend)

**Interfaces:**
- Produces: `portfolio:open-chat` event contract `{ detail: { prompt: string } }`.

- [ ] **Step 1: Failing tests:**
  - `useChat`: `send(NOTE_PROMPT)` makes no network call and appends an assistant message with `action: { type: 'note' }`.
  - `ChatWidget`: dispatching `portfolio:open-chat` with `{ prompt: NOTE_PROMPT }` opens the panel and shows the note form.
  - `ContactCard`: shows the closing line, Email (`mailto:`), LinkedIn and X links from `contact.json`, and a "Leave me a note" button that dispatches `portfolio:open-chat`.
- [ ] **Step 2: FAIL. Step 3: Implement** (closing line drafted with soren-voice, flagged for approval). **Step 4: `CI=true npm test` PASS.**
- [ ] **Step 5: Commit** by path: `contact: closing card with a note button that opens the chat`.

---

### Task 9: Whole-branch check and click-through prep

- [ ] **Step 1:** `CI=true npm test`, `cd worker && npm test`, `npm run build`: all pass.
- [ ] **Step 2:** `git diff origin/main -- src public worker | grep -inE "sentinal|devpost\.com/software|causality labs"` → only test guards.
- [ ] **Step 3:** Serve locally the way pass 2 did (build with `REACT_APP_CHAT_WORKER_URL=http://localhost:8787`, `npx serve -s build -l 3100`, `cd worker && npx wrangler dev --remote --port 8787 --var TURNSTILE_HOSTNAMES:localhost --var ALLOWED_ORIGINS:http://localhost:3100`). Port 3000 belongs to another app.
- [ ] **Step 4:** Playwright (standalone, `channel: 'chrome'`) screenshots at 1440×900 and 390×844, light and dark, full page; assert `document.documentElement.scrollWidth <= innerWidth` at 390. Read every screenshot.
- [ ] **Step 5:** Hand Soren the URL, the screenshots, and the list of copy needing his approval (NLP card descriptions, starter prompt, closing line). Do not push.
