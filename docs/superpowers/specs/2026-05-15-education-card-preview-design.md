# Education Card — Description Preview in Collapsed State

**Date:** 2026-05-15
**Component:** `src/components/EnhancedEducationCard.js`

## Problem

On wide viewports (`md` breakpoint and above), the Education card sits beside the Contact card in a two-column layout (`CardLayout.js`). Contact contains a "Get In Touch" panel plus a four-field message form and renders substantially taller than Education, which shows only three collapsed accordion rows. The result is a large block of empty space below the Education card on desktop. On narrow viewports the cards stack vertically and the imbalance is invisible.

## Goal

Fill the vertical gap by surfacing existing degree description text in the **collapsed** accordion state, so each row carries more visible content without changing the underlying interaction or data model. Character count of the preview must respond to viewport size — wider screens show more text per line.

## Approach

Move the existing `description` paragraph out of `AccordionDetails` and into `AccordionSummary`, rendered as a CSS-clamped preview by default. Removing the clamp via the `.Mui-expanded` selector reveals the full paragraph in place when the accordion is opened. `AccordionDetails` is then dedicated to the coursework chip grid only — no description duplication.

## Behavior

### Collapsed state (default)

Each row gains a third line block beneath the existing "School · Dates" line:

- Renders only when `education.description` exists. High School has no description and remains the current short height — by design.
- Typography: `body2`, `color: 'text.secondary'`, `lineHeight: 1.5`, `mt: 0.5`.
- Truncation: `-webkit-line-clamp` with responsive line count:
  - `xs`, `sm`: 2 lines
  - `md`, `lg`, `xl`: 3 lines
- Characters per line scale naturally with card width (no JS measurement). On `md+` the card sits at half-width beside Contact (~70–90 chars/line); on `xs` it spans full width (~120+ chars/line).

### Expanded state

- The same preview block in the summary unsets its line-clamp via a `.Mui-expanded &` selector and shows the full description in place.
- `AccordionDetails` renders only the coursework chip grid (when `relevantCoursework.length > 0`).
- The expand chevron renders when `description` OR `relevantCoursework.length > 0` — same logic as today, with description still counting as expandable content because un-clamping is meaningful UX.
- Clicking the preview text continues to expand the accordion (it lives inside `AccordionSummary`).

## Responsiveness summary

| Viewport | Card width | Preview shown |
|---|---|---|
| `xs` (stacks below Contact) | Full width | 2 lines, longer chars/line |
| `sm` (stacks below Contact) | Full width | 2 lines, longer chars/line |
| `md+` (side-by-side with Contact) | Half width | 3 lines, fewer chars/line |

This closes the desktop height gap with Contact without overshooting on mobile, where Contact appears below Education rather than beside it.

## Implementation notes

- Single-file change: `src/components/EnhancedEducationCard.js`.
- New `Typography` block inside the `Box` that already holds the degree/school text (lines 129–151).
- Remove the `description` rendering from `AccordionDetails` (lines 207–215).
- Keep the `borderTop` divider in `AccordionDetails` only when coursework is rendered — otherwise drop it to avoid an empty-looking expanded panel for any future "description-only" degree (currently no such case; defensive).
- `sx` example for the preview block:
  ```js
  sx={{
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: { xs: 2, sm: 2, md: 3 },
    overflow: 'hidden',
    color: 'text.secondary',
    lineHeight: 1.5,
    mt: 0.5,
    '.Mui-expanded &': {
      WebkitLineClamp: 'unset',
      overflow: 'visible'
    }
  }}
  ```

## Out of scope

- No data edits. No new descriptions added to `education.json`, no GPA, honors, or location synthesis.
- No changes to icons, status chips, diploma viewer, institution link, or any action button.
- No layout changes to `CardLayout.js` — the Grid stays at `xs={12} md={6}` for both cards.
- No new components, no new tests. Visual verification only.

## Acceptance

- On `md+`: collapsed Master's and Bachelor's rows each show a 3-line description preview ending in `…`; combined card height visibly approaches Contact's height (gap roughly closed, not necessarily pixel-matched).
- On `xs`/`sm`: same rows show a 2-line preview; layout reads as a clean teaser when cards stack vertically.
- Expanding any row shows the full description in place (no clamp, no duplication) and the coursework grid below it.
- High School row is unchanged.
- All existing action buttons (diploma, institution link, status chip) continue to work without triggering accordion expansion (they already `stopPropagation`).
