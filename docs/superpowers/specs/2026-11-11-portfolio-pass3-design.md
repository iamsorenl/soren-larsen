# larsensoren.com pass 3: show me out in the world, then the work

Date: 2026-11-11. Branch: `feat/pass3` (from `origin/main` after PR #35).

## Why

Pass 2 shipped a hero demo strip, but the strip shows the same four projects as the Play tab, so the page says one thing twice. Soren wants a visitor to come away feeling he is **super creative, active, and doing cool and fun stuff**. Pass 3 splits the page into two jobs:

1. **Top of the page = Soren out in the world.** Real photos and clips of him talking, building at hackathons, demoing his poster, and surfing, with several things going on at once.
2. **Everything below = the work, with interactive pieces.** Experience, projects, research and education are where a visitor pokes at what he built.

Rule: **each photo or clip appears in exactly one place on the site.**

## Goals

- Keep the hero photo carousel; replace the hero demo strip with 4 cycling "moment" tiles of Soren in the world.
- Give every experience tile real media (or a real-data animation) instead of a monogram.
- Make Research a real section: No RAGrets and EduMUSE play their YouTube videos, plus two NLP course projects with generated visuals and SLAC-style interactive explainer pages.
- Remove the Technical Skills section; the chat answers "what does he work with?".
- Make Education and Contact livelier.
- Fix the photo carousel dots wrapping to a second line at 1440px.

## Non-goals

- No new chat backend features (pass 2 actions stay as they are), except adding one suggested prompt.
- No better No RAGrets demo yet (later pass).
- No How-it-works tab (stays hidden).
- No UCSC RAG Chatbot in Research.

## Anti-goals (failure even if it works)

- Any invented media, URL, number or metric. Every number on an explainer page must come from Soren's own write-up or repo files.
- AI-generated imagery of Soren (the Veo T-rex clip is rejected).
- Gray Whale internals, Levangie customers, "Causality Labs" (just "Causality"), "sentinal", any Devpost link.
- Classmates' work (`kiara_submission`, `NLP 203/A*/Peer Review`) or course-staff starter code presented as Soren's.
- The Boardal screen-recording walkthrough, guitar clip, HeyGen avatar clips, Zoom recordings, family tapes.
- A page that feels busy or slow: reels must be muted, lazy, small (720p or less, short loops), and respect `prefers-reduced-motion` (show a still).

## Approved media (Soren signed off 2026-11-11)

Source files stay where they are; the builder makes web-sized copies (≤ 1600px long edge JPG/WebP; video ≤ 720p H.264, muted, ≤ ~3 MB per loop) into `public/` and commits only the web copies. Big originals are never committed.

### Hero (revised with Soren 2026-11-11 after finding the existing carousel)
The hero already has an 11-photo carousel of Soren in the world (`src/components/Hero.js` `IMAGE_URLS`: headshots, Half Dome, turtle, Peru, SlugFest talk, surf, caffeine hack, poster presentation, Frontier Tower). **It stays as is**, with one change: `SlugFest.JPG` (the "Blue Innovation" talk, tied to CarbonBridge) becomes tappable and jumps to No RAGrets in the Research tab.

The **demo strip under it is replaced by 4 "moment" tiles**, each cycling its approved stills (slow pan/zoom ok, muted, reduced-motion = first still only). Only the listed targets are tappable:
1. Dev Camp: talk `public/images/developer-camp-talk.jpg` → crowd `public/images/developer-camp.jpg`. Not tappable.
2. Hackathon table: `public/images/slac-team.jpg` → taps to the SLAC project.
3. Surf ranch: laugh `~/Desktop/Archive/ACTAI media/Copy of DSC09810.JPEG` → barrel `~/Desktop/Archive/ACTAI media/IMG_0391.jpg` → taps to the Gray Whale experience tile.
4. Longboard `~/Pictures/IMG_9824.jpg` → poster demo `~/Desktop/CarbonBridge/images for linkeidn post/IMG_3678.JPG` → taps to Education.

`IMG_8038.jpg` is the same moment as `slac-team.jpg`; not used. `FrontierTower.jpg` (carousel) is the Dev Camp panel, so the panel is not used anywhere else.

### Experience tiles
- **Gray Whale:** cycles the surf ranch video (`public/videos/gray-whale-surf-ranch-720p.mp4`, trimmed to a short muted loop), then the current `public/images/developer-camp-team.jpg`. (The Dev Camp panel is already in the hero carousel as `FrontierTower.jpg`, so it is not used here.)
- **Boardal:** cycles (a) Soren's wave from reel C90xFCBywPS, cropped to roughly 3s to 9s, then (b) the app marketplace feed and (c) the volume filter screens from reel DACZSzDSRT1. Two "Watch on Instagram" links: the surf tip reel `https://www.instagram.com/reel/C-BmIEKyAQh/` and the app reel `https://www.instagram.com/reel/DACZSzDSRT1/`. Downloads are in the session scratchpad `ig-boardal/`; re-download with `yt-dlp` if gone. Vertical sources: crop to the tile's aspect around the subject.
- **Self-Employed:** an animated GitHub contribution graph for `iamsorenl`, built from real data fetched at build time (GitHub GraphQL `contributionsCollection.contributionCalendar`), saved to a JSON file in `src/data/`, animated filling in day by day. Check Soren's component kits (reuse-kits skill) for existing GitHub GraphQL fetch code first. Build must not fail if the fetch fails: keep the last committed JSON.
- **Causality:** *Claude's call:* a small CSS/SVG animation inspired by the one on their public page (no third-party screenshot), shown to Soren at click-through.
- **Onda, Baskin TA:** **waiting on media from Soren.** Keep the monogram until it arrives.

### Education
Cycles: master's hooding `IMG_3674.JPG`, then poster explanation `IMG_3689.JPG` (both in `~/Desktop/CarbonBridge/images for linkeidn post/`), then the redwoods grad shot `~/Documents/School/Grad Photos/HIC_0512-ZF-2851-30610-1-001-032.jpg` (2023 degree). `IMG_3676.JPG` (Soren next to his poster) is a spare if one fails.

### Sentinel
Use the YouTube thumbnail of its existing video (`4D9yiXNAT0k`) instead of the plain gradient, **saved as a local file** in `public/` (the CSP allows only same-origin images).

### YouTube cards (Sentinel, No RAGrets, EduMUSE)
*Claude's call:* the CSP (`firebase.json`) is not loosened, so no YouTube iframe. "Plays the video" means: the card shows a muted, short preview loop cut from Soren's own video (self-hosted, ≤ ~3 MB), and clicking opens the full video on YouTube, as the Sentinel Watch tile does today. Soren reviews this at click-through; inline playback would need a CSP change and is a later call.

## Research tab

Cards, in order:
1. **No RAGrets:** the thumbnail plays its YouTube video (`https://youtu.be/2yX1e5xogUQ`), already in `projects.json`.
2. **EduMUSE:** the thumbnail plays its YouTube video (`https://youtu.be/LAdN2gNdSyM`), already in `projects.json`. Move EduMUSE into the Research tab.
3. **Transformer language model on Penn Treebank** (NLP 243). Repo `https://github.com/iamsorenl/Language-Modeling-on-Penn-Treebank` (public, has `Report.pdf`). Real results from the report: baseline val/test perplexity 42.58 / 83.35; smaller tuned config 17.61 / 39.11; larger config 80.35 / 134.72.
4. **Transformer QA: robustness and domain adaptation** (NLP 203 A2, solo; Soren confirmed the pick 2026-11-11). Repo `https://github.com/iamsorenl/Transformer_QA` (public). Write-up `~/Desktop/NLP Classes & Projects/NLP 203/A2/NLP_203_Assignment_2.pdf`. Real results: LoRA vs baseline dev F1 46.38 → 61.22, test F1 43.79 → 54.33, test EM 24.27 → 29.60. Repo has per-model prediction files.

Each NLP card has three ways in: **Repo**, **Write-up (PDF)**, **Explore**. The PDF is served from the site (`public/writeups/…pdf`) so the link works even if the repo moves.

**Explore pages** follow the SLAC pattern: SLAC's explainer is a separate static site (`iamsorenl.github.io/slac-investigator/`, linked from the `demo` field in `projects.json`), not a page in this app. **Soren's call (2026-11-11):** each explainer lives in its **original assignment repo**, served from that repo's GitHub Pages (e.g. `iamsorenl.github.io/Transformer_QA/`), with the visuals added to the repo itself, linked from the card's Explore button. No router is added to this app. Structure: a question, let the visitor try, then reveal what happened.
- PTB: "Does a bigger transformer always win?" Visitor picks a config (baseline, smaller tuned, larger), guesses, then sees the real perplexities and a short why from the report.
- QA: "Does LoRA help a model trained on SQuAD answer COVID questions?" Visitor picks a real question from the prediction files and sees the answer spans from the baseline vs LoRA, then the F1/EM numbers.
- Explore pages may only display numbers and examples that exist in the write-up or repo files.
- *Claude's call:* the "why" text is a short summary written from Soren's own report (voice-checked); PTB `Report.pdf` is pulled from its repo and, with the QA PDF, copied to `public/writeups/` (Soren asked for the write-up link).
- *Claude's call:* QA examples are a fixed list of about 5 to 8 questions picked from the prediction files, including at least one where LoRA does no better, so the page is honest. The examples live in the explainer repo, not this app.

**Thumbnails** are generated from the real results, not stock art: PTB = perplexity bars for the three configs; QA = before/after F1 bars, or a highlighted answer span. Simple SVG or canvas is fine.

5. **Neural Machine Translation, French to English** (NLP 203 A1, solo; Soren wants a third NLP project, this is it). Repo `https://github.com/iamsorenl/Neural-Machine-Translation` (public; bundles third-party Moses/subword-nmt, credit them, don't present as Soren's). Write-up `~/Desktop/NLP Classes & Projects/NLP 203/A1/NLP_203_Assignment_1.pdf`. Results from the write-up (builder re-reads the tables to confirm which is which before using): with BPE, Transformer 28.19 / CNN 26.88 BLEU; a second table shows Transformer 32.82 / CNN 30.79 (appears to be the no-BPE run); tuning experiments reached 28.98. The write-up has side-by-side translation examples. Explore idea: "Does splitting words into pieces (BPE) help translation?" Visitor guesses which tokenizer produced a translation, then sees the BLEU table.

**Later, not this pass:** a better No RAGrets demo.

## Remove Technical Skills

Delete the Skills section and its nav link (`SkillCard.js`, `skills.json` usage). The chat keeps its knowledge of skills (worker data). Add a starter-card suggested prompt like "What does Soren work with?" (copy goes through soren-voice).

## Contact

- A big closing line in Soren's voice (draft through soren-voice, Soren approves the words), e.g. along the lines of "Want to build something?".
- Three large buttons: Email, LinkedIn, X (existing contact data).
- A "Leave me a note" button that opens the chat directly into the existing note action. Client-side chat state changes (opening the widget into note mode) are allowed; no worker changes.
- Background: a slow animated wave line drawn in SVG/CSS (no photo, so no media is reused). Still for reduced motion.

## Constraints

- Existing stack: CRA React app, Firebase Hosting via CI on merge to `main`, Cloudflare Worker chat in `worker/` (deploy after merge, and from a clean `origin/main` worktree because local `src/data` may have another session's uncommitted edits).
- The pre-existing uncommitted SLAC photo + "What is an X-ray laser?" YouTube edits in `ProjectCard.js`, its test, and `projects.json` (from another session) are **folded into pass 3** (Soren's call, 2026-11-11). Review them like pass 3 code and commit them with the pass 3 work. Their media still needs to be approved: the SLAC photo is `slac-team.jpg` (hero reel item 3), so under the one-place rule *Claude's call:* drop the `photo` field from the SLAC project entry (the card keeps its demo preview, and moment tile 2 links to SLAC). Keep the "What is an X-ray laser? (SLAC)" YouTube link (https://www.youtube.com/watch?v=kUeraeIkTmo) as written.
- Never remove entries from `projects.json`.
- Starter prompt token headroom in the worker is thin (~309 tokens); the new suggested prompt and any data changes must keep the worker prompt-size test passing.
- Visible copy follows the soren-voice skill; approvals logged in `~/.claude/skills/soren-voice/voice-profile.md`.
- Commit or push only when Soren asks.

## Left to the builder

- Reel mechanics (crossfade vs slide, timing, how tap-to-jump is shown), as long as it is muted, lazy, small and reduced-motion safe.
- Tile cycling component shape (one shared component for hero, experience, education is expected).
- Exact crop points and compression settings.
- Thumbnail chart styling, within the site's existing theme tokens, light and dark.
- Where the carousel-dots fix lives.

## Done when

- Soren clicks through a local build at 1440px, 390px, light and dark, and approves the draft before anything is final (he expects one feedback round).
- Tests and the worker prompt-size test pass; no banned strings in the diff.
