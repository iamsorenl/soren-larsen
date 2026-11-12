# Portfolio pass 3b: design decisions (builder check done 2026-11-12; awaiting Soren's approval)

Branch `feat/pass3` (on top of 0c820cd8). Decided with Soren in the 2026-11-11 evening session, using mockups in
`.superpowers/brainstorm/11424-1794453798/content/` (hero-a-v2, pause-controls, education, boardal-square,
causality-anim, selfemployed-wave-v2, contact-v4). Crops: `.superpowers/crops-2026-11-11-v2.json` (latest; v1 alongside).

## Why
The top of the page read as "no rhyme or reason": an 11-photo carousel plus a 4-tile strip that also cycled.
Soren wants a visitor to take away "he's cool and does a bunch of stuff", his bio back in the top card, fewer
images, and every photo in exactly one place.

## Rules that apply everywhere
- One place per photo. No repeats across hero / experience / projects / education.
- Every slideshow and video loop gets the **corner pause button + hover arrows** (pause-controls option 1).
  Hover also pauses. Reduced motion shows the first item still (as today). Needed for WCAG 2.2.2.
- Crops come from the crop tool: `pos` "X% Y%" + `zoom`, rendered as object-fit cover + object-position +
  transform scale with transform-origin = pos. `CyclingMedia` already supports `item.pos` / `item.zoom`
  (uncommitted change in src/components/CyclingMedia.js).
- Show Soren frames before encoding any loop. Loops: H.264, no audio, faststart.

## Hero (option A v2)
- Left: overline, name, title, bio paragraphs (from about.json `about`, first-person; NOT the third-person
  lookingFor/availability fields), Resume/Contact/GitHub buttons. Separate AboutCard removed (merged in).
- Right: ONE carousel, portrait frame (340x400 desktop, 280x320 phone). No captions. Hover shows a tooltip
  saying what the photo is. None of the 9 photos link anywhere (Soren, 11-12), so no link/two-tap logic;
  phones show the tooltip on tap. Counter "3 / 9" replaces the 11 dots. Corner pause + arrows.
- Photos (9): Headshot1, Headshot2, HalfDome, Peru, Turtle, Surf, longboard, snowflake-dev-day-selfie (new),
  caffeine_hack. Cut from hero: Expressive (removed entirely), SlugFest/Poster_Presentation/FrontierTower
  (moved), surf-ranch-laugh (removed entirely), MomentStrip removed.
- Tooltip wording: drafts only, needs approval.
- Carousel images are ~2.2 MB bundled at 1000-1200px; make ~700px web copies.

## Experience tiles
- **Gray Whale** (6 slides): video loop from gray-whale-surf-ranch-720p.mp4 start 25 s, 7 s (Soren confirmed
  this is him, right after his title card), devcamp-talk, devcamp-crowd, developer-camp-team, FrontierTower
  (part of Developer Camp), surf-ranch-barrel.
- **Boardal**: two SQUARE clips side by side over a blurred copy of the first (boardal-square option 1);
  phone (72x72) shows only the riding clip. Clips: reel C90xFCBywPS 3.0 s +2 s (riding, 1.5x slow-mo),
  reel C-BmIEKyAQh 0.3 s +2 s (surf tip). Sources in `.superpowers/media-src/`. App screenshots
  (boardal-feed/filter) dropped.
- **Causality**: our own SVG of Causality's branching-decision-path idea (not their artwork): path draws,
  gray branches fade, red dashed branch ends in ✕, green branch continues to a dotted end, faint contours
  behind. Dark palette in dark mode, warm paper (#f4f1ea) palette in light mode. Loops ~7 s; reduced motion
  shows the finished drawing. Real build: red + final segment dashed.
- **Self-Employed**: "graph is the ocean" (selfemployed-wave-v2 option 3) on real contributions.json:
  swell line moves through the squares, below = bright water, above = dim sky, squares bob. NO counter.
- **Onda, Baskin TA**: still waiting on media from Soren; keep monograms until it arrives.

## Project tiles become slideshows (demo = one slide)
- Clicking the tile on ANY slide opens the demo (Soren, 11-12); only the pause/arrow buttons don't.
  Builder's call: no buttons nested in an <a>; use a stretched link (an <a> covering the tile, controls
  layered above it). DemoTile is shared by the Play grid (ProjectCard.js ~384) and Research media
  (~124), so change DemoTile once.
- Sentinel: loop from YouTube 4D9yiXNAT0k (`.superpowers/media-src/sentinel.webm`, AV1) start 42.1 s, 4 s,
  pos 39% 27.9% (Soren's pick), then sentinel-hackathon-team-selfie (new).
- SLAC: existing demo + hackathon-table.
- No RAGrets: existing demo + no-ragrets-poster-team (new) + SlugFest.
- EduMUSE and others: demo only.

## Education (approved layout, content not final)
- One row per degree: fixed 4:3 photo left (stacks above on phones, same 4:3), text right; coursework +
  diploma behind expand as today.
- M.S.: slideshow Poster_Presentation + poster-talk; a press card under the description: Santa Cruz Works,
  "How a Chance Encounter Became a Game-Changing Research Partnership", Doug Erickson, May 7 2025,
  https://www.santacruzworks.org/news/how-a-chance-encounter-became-a-game-changing-research-partnershi
  (verified 200). Thumbnail: the article's own image (Soren, 11-12), downloaded from the article page and
  stored locally; show Soren before it ships. Wording draft.
- B.S.: bs-grad (cap and gown on campus sculpture; web copy public/media/education/bs-grad.jpg, original
  public/images/bs-grad-sculpture.jpg), crop 61.7% 53.6% zoom 1.04. Redwoods dropped (Soren: "don't like the
  shorts"). Hooding and poster-demo dropped.

## Contact (contact-v4)
- No "Write me a note" button and no plain-text line. Tiles with logos: Phone, Email, GitHub, LinkedIn, X
  (Phone + GitHub restored; were lost in pass 3). Hover: tile lifts/highlights + tooltip with the real value
  ((858) 210-2261, email, github.com/iamsorenl, linkedin in/..., @iamsorenl). Phones: value in small text
  under the label. Clicking = tel / mailto / open profile.
- Bottom: a chat bubble types example notes; clicking it opens the note form (NOTE_PROMPT via the existing
  portfolio:open-chat event). It is the ONLY way to write a note. Example lines + "click to write me a note"
  label are placeholders: Soren wants better ones (soren-voice, approval).
- Four paper planes loop in a layer BEHIND the tiles/bubble; hovering a tile makes them fly over and orbit it;
  leaving lets them drift back. No waves anywhere in Contact (ocean belongs to Self-Employed).

## Open / pending
- Copy approvals: bio-in-hero, hero tooltips, press card, contact bubble lines, NLP blurbs, "What does he work
  with?" starter prompt. Log approvals in ~/.claude/skills/soren-voice/voice-profile.md.
- Resume is NOT a contact tile (Soren, 11-12); it stays a hero button.
- Builder's call: SLAC second slide stays hackathon-table (it has a saved crop). Untracked
  public/images/slac-team.jpg, developer-camp*.jpg are left alone, not deleted, not shipped.
- Onda / Baskin TA media from Soren; maybe more vertical photos of Soren for the hero.
- Phone-judge a11y findings to fix during the rework: per-photo alt text in the hero (all "Soren Larsen" now);
  role="img" wrapper in CyclingMedia hides inner alts; MomentStrip goes away anyway.
- Next: Soren approves, then superpowers:writing-plans.
