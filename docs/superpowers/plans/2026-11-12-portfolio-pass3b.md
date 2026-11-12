# Portfolio pass 3b Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the top of larsensoren.com and the media around it: hero with bio + one 9-photo carousel, pause/arrows on every slideshow, one place per photo, new Experience/Project/Education/Contact media.

**Architecture:** `CyclingMedia` becomes the single slideshow (controls, counter, tooltip, crops). Clickable tiles (DemoTile, Experience Tile) switch to a "stretched" overlay link/button so the slideshow controls sit above it instead of inside it. Data stays in JSON/JS data files that `mediaPaths.js` scans, so `media.test.js` keeps guarding paths, sizes and audio.

**Tech Stack:** React 18, MUI 5, CRA jest + Testing Library, worker vitest, ffmpeg for loops, `sips` for web copies.

**Spec:** `docs/superpowers/specs/2026-11-12-portfolio-pass3b-design.md` (read it first; mockups it names are in `.superpowers/brainstorm/11424-1794453798/content/`).

## Global Constraints

- Soren approves every image, crop, frame and preview before it ships. Never invent URLs, media or numbers.
- **Frame gate:** before encoding Gray Whale, Sentinel or Boardal loops, extract frames to `.superpowers/frames/<name>/` and show Soren; encode only after his yes.
- Loops: H.264, no audio (`-an`), `-movflags +faststart`, ≤ 3.5 MB (media.test.js cap). Images ≤ 1 MB.
- Crops come from `.superpowers/crops-2026-11-11-v2.json` (`pos`, `zoom`), copied verbatim into data.
- One place per photo across hero / experience / projects / education.
- Visible copy (tooltips, press card, bubble lines) ships as `DRAFT` text until Soren approves in Task 9; never write "sentinal", "Causality Labs", Devpost links, Gray Whale internals, or waves in Contact. Don't remove projects.json entries.
- No commits unless Soren asks; when he does, stage by explicit path. Done = `npm run lint`, `CI=true npm test -- --watchAll=false`, `cd worker && npm test` all green.

## Review Focus

1. Keyboard user tabbing a project tile: Tab reaches the demo link and the pause/prev/next buttons separately; Enter on pause doesn't open the demo. (Task 3 test)
2. Pausing a slideshow that is showing a video actually stops the video, not just the timer. (Task 1 test)
3. Reduced motion: every slideshow shows the first item still, arrows still work, no video plays; Causality shows the finished drawing; ocean doesn't move. (Tasks 1, 5, 6 tests)
4. Phone width (72px experience tiles, 280x320 hero): controls don't cover the whole tile; Boardal shows only the riding clip. (Task 4 test + manual check at 375px)
5. A photo reused in two places slips in during the rework. (Task 2 data test)

---

### Task 1: CyclingMedia controls, counter, tooltip, a11y

**Files:**
- Modify: `src/components/CyclingMedia.js` (keeps the uncommitted pos/zoom change)
- Test: `src/components/__tests__/CyclingMedia.test.js`

**Interfaces:**
- Produces: `<CyclingMedia items label intervalMs sx counter={false} tooltip={false} />`. Item shape unchanged plus optional `tip` (tooltip text, falls back to `alt`). Wrapper is `role="group"` `aria-roledescription="slideshow"` `aria-label={label}`, keeps `data-active-alt`. Controls: buttons named `Pause slideshow` / `Play slideshow`, `Previous`, `Next`, rendered with `position:absolute; zIndex: 2` so a parent overlay at zIndex 1 stays below them. Controls render only when `items.length > 1` or the single item is a video (pause only).

- [ ] **Step 1: Update tests.** Change `active()` to `screen.getByRole('group', { name: 't' })`. Add:
  - `pause button stops cycling and toggles its name`: fake timers, click `Pause slideshow`, advance 5000 → still `a`; button now named `Play slideshow`.
  - `next and previous move and wrap`: Next → `b`, Previous twice → `b` (wrap from a).
  - `pausing pauses the active video`: mockInView, spy `HTMLMediaElement.prototype.pause`, click pause → spy called.
  - `inner images keep their own alt`: `getByAltText('a')` is accessible (no `role="img"` ancestor).
  - `counter shows "1 / 2"` when `counter` prop set, updates to `2 / 2` after Next.
  - `reduced motion: arrows still work, no pause button`.
- [ ] **Step 2:** Run `CI=true npx react-scripts test CyclingMedia --watchAll=false` → new tests FAIL.
- [ ] **Step 3: Implement.** `userPaused` state separate from hover `paused`; effect calls `.pause()`/`.play()` on the active `<video>` ref when `userPaused` changes. Arrows show on hover/focus-within (opacity), always visible on `(hover: none)`; pause button is a 28px corner button (pause-controls mockup option 1), 24px on tiles under 100px. `tooltip` wraps the frame in MUI `Tooltip` titled `item.tip || item.alt`, `enterTouchDelay={0}`.
- [ ] **Step 4:** Rerun → PASS.

### Task 2: Data: hero photos, web copies, one place per photo

**Files:**
- Create: `src/data/heroPhotos.js`, `public/media/hero/*.jpg` (9 web copies), `public/media/education/poster-presentation.jpg`, `public/media/projects/*.jpg` web copies as needed
- Modify: `src/data/mediaPaths.js` (SOURCES += heroPhotos; drop moments), `src/data/experienceImages.js`, `src/data/education.json`, `src/data/projects.json` (add `slides` arrays only; no entries removed)
- Delete: `src/data/moments.json`, `src/data/__tests__/moments.test.js`
- Test: `src/data/__tests__/media.test.js`

**Interfaces:**
- Produces: `heroPhotos` default export = MediaItem[] (9, spec order: Headshot1, Headshot2, HalfDome, Peru, Turtle, Surf, longboard, snowflake-dev-day-selfie, caffeine_hack), each with `pos`/`zoom` from crops and a DRAFT `tip`. Project `slides: MediaItem[]` (demo excluded; DemoTile prepends the preview). Experience `gray-whale` 6 items and `boardal: 'boardal-squares'` (Task 4). Education M.S. media `[poster-presentation, poster-talk]` + `press: { outlet, title, author, date, url, image }`; B.S. media `[bs-grad]` with crop `61.7% 53.6%` zoom `1.04`.

- [ ] **Step 1: Test.** Add to media.test.js `no media file is used in two places`: collect every `src` across heroPhotos, experienceImages, projects (`slides`, `preview.poster`), education media → no duplicates. Keep existing three tests.
- [ ] **Step 2:** Run → FAIL (heroPhotos missing).
- [ ] **Step 3:** Make ~700px-long-edge web copies with `sips -Z 700` (JPEG quality ~80) into `public/media/hero/` and `public/media/education/poster-presentation.jpg`; write the data files. Gray Whale items: loop (Task 7 output path `/media/experience/gray-whale-loop.mp4`, start 25 s), devcamp-talk, devcamp-crowd (`64.5% 51.5%`), developer-camp-team (`50% 42.1%`), FrontierTower web copy (`39.8% 43.9%`, 1.03), surf-ranch-barrel (`1.8% 48.7%`). Project slides: Sentinel `[sentinel-hackathon-team-selfie 52.4% 0%]`, SLAC `[hackathon-table 14.7% 56.1% 1.13]`, No RAGrets `[no-ragrets-poster-team 66.4% 64.3% 1.42, SlugFest web copy 50.1% 73%]`. Press `image` stays unset until Task 8.
- [ ] **Step 4:** Rerun media + data tests → PASS. Old moments/hero assets no longer referenced are left on disk (not deleted).

### Task 3: DemoTile as a stretched-link slideshow

**Files:**
- Modify: `src/components/DemoTile.js`
- Test: `src/components/__tests__/ProjectCard.test.js`

**Interfaces:**
- Consumes: CyclingMedia (Task 1), `project.slides` (Task 2).
- Produces: same props as today. Outer element becomes a `Box` (not `a`); an absolutely positioned `<a>` (zIndex 1, inset 0, label `Play <title>` / `Watch <title>`) covers it; CyclingMedia items = `[preview as video/image item, ...slides]`; Play/Watch label row stays, `pointer-events: none`.

- [ ] **Step 1: Tests.** `Sentinel tile: link and slideshow buttons are separate` — the demo link has href `https://www.youtube.com/watch?v=4D9yiXNAT0k`; `Pause slideshow` is not inside any `a` (`closest('a') === null`). `tile with no slides has no arrows` (EduMUSE).
- [ ] **Step 2:** Run ProjectCard tests → FAIL.
- [ ] **Step 3:** Implement. Both call sites (`ProjectCard.js` ~124, ~384) keep calling DemoTile unchanged.
- [ ] **Step 4:** Rerun → PASS.

### Task 4: Experience tiles: stretched toggle + Boardal squares

**Files:**
- Modify: `src/components/ExperienceCard.js` (Tile, TileMedia)
- Create: `src/components/BoardalSquares.js`
- Test: `src/components/__tests__/ExperienceMedia.test.js`

**Interfaces:**
- Consumes: Task 1, Task 2 data, Task 7 clips at `/media/experience/boardal-ride.mp4` + `/media/experience/boardal-tip.mp4` (+ `.jpg` posters).
- Produces: Tile's `CardActionArea` becomes an absolute overlay (zIndex 1, `aria-expanded`, `aria-label={company}`) with media/text beneath; `TileMedia` handles `'boardal-squares'`. `<BoardalSquares />`: two square videos side by side over a blurred copy of the first (boardal-square.html option 1); under `sm` only the ride clip; one pause button pauses both.

- [ ] **Step 1: Tests.** Update the Boardal test: two videos/posters at sm+, one at xs (mock matchMedia), no `boardal-feed` image. Gray Whale test: 6 items, poster first. `Experience pause button doesn't toggle the tile` → click pause, `aria-expanded` stays `false`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Rerun → PASS.

### Task 5: Causality decision-path SVG

**Files:**
- Modify: `src/components/CausalityAnim.js`
- Test: `src/components/__tests__/ExperienceMedia.test.js`

- [ ] **Step 1: Tests.** `Causality draws the decision path`: `data-testid="causality-anim"` contains paths with `data-branch="main" | "gray" | "red" | "green"`; red branch and the final green segment have `stroke-dasharray`. `reduced motion shows the finished drawing` (no `animation` style on paths).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Port the SVG from `causality-anim.html` (path draws, grays fade, red dashed ends in ✕, green continues to dotted end, faint contours behind; ~7 s loop). Dark palette in dark mode, `#f4f1ea` paper palette in light. Pause control: CSS `animation-play-state` toggled by a corner pause button (same look as Task 1).
- [ ] **Step 4:** Rerun → PASS.

### Task 6: Self-Employed "graph is the ocean"

**Files:**
- Modify: `src/components/ContributionGraph.js`
- Test: `src/components/__tests__/ContributionGraph.test.js`

- [ ] **Step 1: Tests.** Existing quartile tests stay. Add `ocean: a swell path is drawn and no counter text` (`data-testid="swell"` exists; no text matching `/contributions/` outside the aria-label). `reduced motion: swell is static`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Port option 3 from `selfemployed-wave-v2.html` on `contributions.json`: swell line moves across, squares below it bright, above dim, squares bob. Pause button like Task 5.
- [ ] **Step 4:** Rerun → PASS.

### Task 7: Encode the loops (frame gate)

**Files:**
- Create: `public/media/experience/gray-whale-loop.{mp4,jpg}` (replace), `public/media/experience/boardal-ride.{mp4,jpg}`, `public/media/experience/boardal-tip.{mp4,jpg}`, `public/media/projects/sentinel.mp4` (+ keep `sentinel.jpg` as poster, regenerate at 42.1 s), `.superpowers/frames/*`
- Delete from data only (files stay): `boardal-wave.*`, `boardal-feed.jpg`, `boardal-filter.jpg`
- Modify: `src/data/projects.json` Sentinel `preview.video` + `preview.pos: "39% 27.9%"`

- [ ] **Step 1:** Extract 4 frames per clip (start, ¼, ½, end) with ffmpeg into `.superpowers/frames/{gray-whale,sentinel,boardal-ride,boardal-tip}/`; show Soren in the visual companion with the crop applied. Sources/times: Gray Whale `public/videos/gray-whale-surf-ranch-720p.mp4` 25 s +7 s; Sentinel `.superpowers/media-src/sentinel.webm` 42.1 s +4 s; Boardal ride `.superpowers/media-src/boardal-reel.mp4` 3.0 s +2 s slowed 1.5x (`setpts=1.5*PTS`, 3 s out); Boardal tip `boardal-C-BmIEKyAQh.mp4` 0.3 s +2 s. **Stop until Soren says yes.**
- [ ] **Step 2:** Encode: `-c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -an -movflags +faststart`. Boardal clips cropped square at their saved `pos` (`48% 18.3%`, `46.3% 45.5%`) to 480x480; others scaled to 720 wide, crop left to CSS. Posters = first frame JPEG.
- [ ] **Step 3:** `CI=true npx react-scripts test media --watchAll=false` → PASS (sizes, no audio).

### Task 8: Hero, Education, Contact

**Files:**
- Modify: `src/components/Hero.js`, `src/components/Body.js`, `src/components/EducationCard.js`, `src/components/ContactCard.js`, `src/data/contact.json` (phone → `(858) 210-2261`)
- Create: `src/components/PaperPlanes.js`, `public/media/education/press-santa-cruz-works.jpg`
- Delete: `src/components/AboutCard.js`, `src/components/MomentStrip.js`, `src/components/__tests__/MomentStrip.test.js`, `src/components/WaveLine.js`
- Test: `Hero.test.js`, `EducationCard.test.js`, `ContactCard.test.js`

**Interfaces:**
- Consumes: CyclingMedia `counter` + `tooltip` (Task 1), heroPhotos (Task 2), `NOTE_PROMPT` + `portfolio:open-chat` (existing).

- [ ] **Step 1: Tests.**
  - Hero: `bio paragraphs from about.json render in the hero` (first paragraph of `about[0].about`); `carousel shows "1 / 9"`; `no photo is a link or button except controls`; `each photo has its own alt (not "Soren Larsen")`. Delete the two SlugFest tests.
  - Education: `master's shows poster presentation then poster talk, and the Santa Cruz Works press card links to the article` (href is the spec URL verbatim); `bachelor's shows bs-grad`; diploma test stays.
  - Contact: `five tiles: Phone, Email, GitHub, LinkedIn, X` with hrefs `tel:`, `mailto:`, and the three profile URLs from contact.json; `the note bubble opens the note form` (dispatches `portfolio:open-chat` with `NOTE_PROMPT`); `no Leave me a note button and no wave-line`; `planes are aria-hidden`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Hero.** Per `hero-a-v2.html`: bio paragraphs from `about[0].about` replace TAGLINE; CyclingMedia (340x400 / 280x320) with `counter tooltip`; remove dots, PHOTO_TARGETS, MomentStrip, `src/images` imports. Body drops AboutCard.
- [ ] **Step 4: Education.** Per `education.html`: row per degree, 4:3 photo left (stacks on xs), text right, accordion content unchanged. Press card under M.S. description: fetch the article page, take its `og:image` URL, download to `public/media/education/press-santa-cruz-works.jpg` (≤1 MB, `sips -Z 600`), **show Soren before it ships**; card text DRAFT.
- [ ] **Step 5: Contact.** Per `contact-v4.html`: logo tiles with hover lift + tooltip of the real value, value as small text under the label on `(hover: none)`; typing chat bubble (DRAFT lines) is the only note entry; `PaperPlanes` (4 planes, layer behind, orbit hovered tile via a `hoveredIndex` prop, static under reduced motion). No WaveLine.
- [ ] **Step 6:** Rerun all three → PASS.

### Task 9: Copy approvals, visual check, verify

**Files:**
- Modify: copy in `src/data/heroPhotos.js` (tips), `src/data/education.json` (press), `src/components/ContactCard.js` (bubble lines); `~/.claude/skills/soren-voice/voice-profile.md` (approval log)

- [ ] **Step 1:** Invoke soren-voice (then humanizer); draft hero tooltips, press card wording, bubble lines + label; bio-in-hero is existing about.json copy, confirm it still reads right first-person. Show Soren; apply his edits; log approvals.
- [ ] **Step 2:** `npm start`, screenshot at 1280 and 375 widths, light + dark, reduced motion on; show Soren.
- [ ] **Step 3:** `npm run lint && CI=true npm test -- --watchAll=false && (cd worker && npm test)` → all pass. Report output.
- [ ] **Step 4:** On Soren's word: stage by explicit path, commit, PR (commit-commands:commit-push-pr). Worker deploy only from a clean origin/main worktree, and only if the worker changed (it doesn't in this plan).
