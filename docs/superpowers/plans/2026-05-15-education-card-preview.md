# Education Card Description Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive line-clamped description preview to the collapsed state of each Education accordion row so the Education card fills the gap next to the taller Contact card on desktop.

**Architecture:** Single-file change to `src/components/EnhancedEducationCard.js`. The existing `description` paragraph moves from `AccordionDetails` (only visible when expanded) into `AccordionSummary` (always visible). A `-webkit-line-clamp` clamps the preview at 2 lines on `xs`/`sm` and 3 lines on `md+`. A `.Mui-expanded` CSS selector unsets the clamp so the full description appears in place when the row is opened. `AccordionDetails` then holds only the coursework chip grid.

**Tech Stack:** React 18, MUI 5 (`@mui/material`), CSS `-webkit-line-clamp`. No new deps. JSDOM-based existing test suite (`src/App.test.js`) for regression check; visual verification in the React dev server for the new behavior.

**Spec:** `docs/superpowers/specs/2026-05-15-education-card-preview-design.md`

---

## File Structure

**Modified:**
- `src/components/EnhancedEducationCard.js` — move description into summary, add responsive clamp, prune `AccordionDetails` content.

**Not modified (out of scope, confirmed in spec):**
- `src/data/education.json` — no data changes.
- `src/components/CardLayout.js` — grid stays at `md={6}` for both cards.
- `src/App.test.js` — existing assertions still hold; no new test added (see Task 3 rationale).

---

## Task 1: Replace the description rendering in EnhancedEducationCard

**Why one task:** moving the description and clamping it must land together. An intermediate state with the description rendered twice (once in summary, once in details) is broken — keep the diff atomic.

**Files:**
- Modify: `src/components/EnhancedEducationCard.js`

- [ ] **Step 1: Open the file and confirm the regions to edit**

Open `src/components/EnhancedEducationCard.js`. Confirm:
- The collapsed-state typography block lives inside `AccordionSummary` → inner `Box` at roughly lines 129–151, ending after the school+dates `Typography`.
- The full-description `Typography` inside `AccordionDetails` lives at roughly lines 207–215, wrapped in `{education.description && (...)}`.

Line numbers may have drifted; the structure is the anchor.

- [ ] **Step 2: Add the clamped description preview inside `AccordionSummary`**

Inside the inner `Box sx={{ flex: 1, minWidth: 0 }}`, **immediately after** the school+dates `Typography`, add a new conditional `Typography` block. The full block to insert (drop in below the existing school+dates `Typography`, before the closing `</Box>`):

```jsx
{education.description && (
    <Typography
        variant="body2"
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
    >
        {education.description}
    </Typography>
)}
```

Notes on the sx:
- `display: '-webkit-box'` + `WebkitBoxOrient: 'vertical'` + `WebkitLineClamp` is the standard line-clamp recipe.
- MUI's `sx` accepts breakpoint objects on any CSS prop — `{ xs: 2, sm: 2, md: 3 }` compiles to a media query rule at the theme's `md` breakpoint (default 900px).
- `.Mui-expanded &` targets ancestor of this Typography that has the `Mui-expanded` class (MUI adds this to `MuiAccordionSummary-root` when the accordion is open).

- [ ] **Step 3: Remove the description block from `AccordionDetails`**

Inside `AccordionDetails` → inner `Box` with the `borderTop` divider, delete the description `Typography` block:

```jsx
{/* DELETE THIS BLOCK */}
{education.description && (
    <Typography
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.6, mb: 2 }}
    >
        {education.description}
    </Typography>
)}
```

After deletion, the inner `Box` should contain only the coursework rendering (`{education.relevantCoursework && education.relevantCoursework.length > 0 && (...)}`).

- [ ] **Step 4: Tighten the `AccordionDetails` render condition**

Currently `AccordionDetails` renders whenever `hasExpandableContent` (which is `description || coursework.length > 0`). With the description now in the summary, an accordion that has only a description would render an empty `AccordionDetails`. Change the wrapping condition so `AccordionDetails` renders only when there is coursework to show.

Find:

```jsx
{hasExpandableContent && (
    <AccordionDetails sx={{ pl: 2.5, pt: 0, pb: 2 }}>
        <Box sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', pt: 2 }}>
            {/* coursework block */}
        </Box>
    </AccordionDetails>
)}
```

Replace with:

```jsx
{education.relevantCoursework && education.relevantCoursework.length > 0 && (
    <AccordionDetails sx={{ pl: 2.5, pt: 0, pb: 2 }}>
        <Box sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', pt: 2 }}>
            {/* coursework block stays as-is */}
        </Box>
    </AccordionDetails>
)}
```

Leave `hasExpandableContent` as it is — it still drives whether the expand chevron renders (`expandIcon={hasExpandableContent ? <ExpandMore .../> : null}`). A row with description-only should still show the chevron because expanding it is meaningful (it un-clamps the preview).

- [ ] **Step 5: Run the existing test suite**

Run:

```bash
npm test -- --watchAll=false
```

Expected: all existing tests pass. The relevant assertions in `src/App.test.js` (school name renders, Education heading exists) are unaffected. MUI keeps `AccordionDetails` mounted in the DOM, so any previous queries for description text would still resolve — and the description now also exists in the summary, so any such query would still find it.

If any test fails, stop and inspect — do **not** edit tests to make them pass.

- [ ] **Step 6: Run the dev server and verify visually at desktop width**

Run:

```bash
npm start
```

In the browser at a desktop width (≥1200px so the cards sit side-by-side):
1. Scroll to the Education card.
2. Confirm the **Master's** row shows a 3-line description preview ending in `…`, in muted secondary-text color, beneath the school+dates line.
3. Confirm the **Bachelor's** row shows the same.
4. Confirm the **High School** row is unchanged — short, no preview text, no chevron.
5. Confirm the Education card height is now visibly closer to the Contact card height — the large empty gap below Education on desktop should be substantially reduced (it does not need to match pixel-for-pixel).
6. Click the Master's row to expand. The preview text should expand to the **full description** in place (no longer clamped, no `…`) and the coursework chip grid should appear below the divider in `AccordionDetails`.
7. Click again to collapse — preview returns to clamped state.
8. Verify the action buttons (institution link, diploma button, status chip) still work without expanding the accordion.

- [ ] **Step 7: Verify visually at mobile/narrow width**

Use the browser's responsive devtools (or resize the window) to a width below the `md` breakpoint (e.g., 600px wide):
1. Cards should stack vertically (Education above Contact).
2. The Master's and Bachelor's preview text should clamp at **2 lines** ending in `…`.
3. Expanding shows full description in place.

- [ ] **Step 8: Verify in dark mode**

Toggle the theme (the navbar has a theme toggle). Confirm the new preview text color (`text.secondary`) reads clearly against the dark accordion background. If contrast is poor, that's a real defect — stop and report; do not patch in-flight.

- [ ] **Step 9: Commit**

```bash
git add src/components/EnhancedEducationCard.js
git commit -m "$(cat <<'EOF'
feat(education): show responsive description preview in collapsed card

Moves degree description text from AccordionDetails into AccordionSummary
with a responsive -webkit-line-clamp (2 lines on xs/sm, 3 lines on md+).
The .Mui-expanded selector unsets the clamp so opening a row shows the
full description in place. AccordionDetails now only renders when
coursework chips exist, avoiding an empty expanded panel.

Closes the desktop height gap with the Contact card without changing
data, layout, or interaction behavior. High School row is unchanged.
EOF
)"
```

---

## Self-Review Checklist for the Implementer

Before declaring the task complete:

- [ ] Description preview visible in Master's and Bachelor's rows when collapsed.
- [ ] Preview clamps at 2 lines on `xs`/`sm`, 3 lines on `md+`.
- [ ] Expanding shows the full description in place (single source of truth).
- [ ] No duplicate description anywhere (not in both summary and details).
- [ ] High School row visually identical to before.
- [ ] Existing tests still pass.
- [ ] Both light and dark themes look right.
- [ ] No JSON, layout, or other file changes outside `EnhancedEducationCard.js`.
