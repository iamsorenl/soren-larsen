# HDR "Glowing" Images — Design

**Date:** 2026-06-17
**Status:** Approved, pending implementation plan

## Problem / Motivation

Some company logos (Knot API, 222place, cosmos.so) appear to physically *glow* —
brighter than the surrounding white UI — on HDR-capable displays. This is real:
the assets are encoded as HDR images, and displays with HDR headroom (MacBook Pro
XDR 2021+, iPhone 12+, Pro Display XDR) render their bright pixels *above* SDR
"paper white." On SDR displays they fall back to ordinary white.

Goal: bring this effect to the portfolio site (CRA + MUI) on the surfaces where it
adds impact without harming usability.

## Scope

**In scope — glow on images only:**
- The Hero photo carousel (11 rotating photos in `src/components/Hero.js`).
- Optionally, one synthetic pure-white "glow mark" accent (Phase 2, decided later).

**Out of scope — explicitly not glowing:**
- Body text and headlines. The only way to make text glow is to rasterize it into
  an image, which destroys selectable text, screen-reader access, SEO, copy-paste,
  and responsive reflow. Not acceptable for a portfolio recruiters read. All text
  stays live.

## Constraints & Assumptions

- Effect is only visible on HDR displays in Chrome or Safari. Firefox / SDR show
  the graceful fallback (normal-looking image). Verification target: author's
  MacBook Pro XDR.
- Source photos are SDR JPEGs with no real above-white highlight data, so the glow
  is *synthesized* by pushing existing highlights into the display's HDR headroom.
- A botched SDR fallback (image renders dark/washed) is the primary failure mode and
  must be checked explicitly.

## Approach

### Pipeline — single committed script

`scripts/hdr/encode.py` (Python + Pillow + numpy), using the **selective-highlight
PQ method**, emitting **AVIF tagged via CICP**:

1. Decode the source image.
2. Identify bright, low-saturation pixels (whites / specular highlights / sky).
3. Encode those pixels up the **PQ curve (ST 2084 / BT.2100)** toward ~1000 nits to
   create HDR headroom; pin colored pixels at the **203-nit SDR reference** so they
   keep their original color. This selectivity is what keeps photos natural (only
   highlights glow) instead of uniformly blown out.
4. Output a **Rec2020 + PQ AVIF** whose color space is declared via **CICP nclx
   codes** baked into the bitstream — primaries `9` (BT.2020), transfer `16` (PQ /
   ST 2084), matrix `9` (BT.2020 NCL). **No ICC profile file is needed or sourced.**
   This sidesteps the fragile "borrow an ICC from a random HDR image" step entirely.
   Encoding via `avifenc` (libavif) with explicit CICP and full-range flags.
5. Write output as `<name>.hdr.avif` alongside the originals in `src/images/`.

The same script serves both jobs: photos (selective highlight boost) and, for a
future Phase 2 synthetic mark, pushing pure white to maximum brightness.

**Format decision:** AVIF + CICP chosen over JPEG + PQ-ICC because macOS ships no
PQ ICC profile (the bundled `ITU-2020.icc` uses an SDR parametric TRC, not PQ —
verified), so the JPEG route would require sourcing/generating a profile. AVIF
carries the HDR tag natively. Supported in Chrome and Safari 16.4+ (the
verification targets).

### Integration

- Swap the entries in `IMAGE_URLS` (`src/components/Hero.js`) to the `.hdr.avif`
  variants.
- PQ-tagged AVIFs are color-managed; modern browsers tonemap them back to normal on
  SDR displays. No `<picture>`/media-query switching needed unless verification
  reveals a fallback problem.

## Phasing

- **Phase 0 — Proof of concept.** Build the script, convert one image
  (`Headshot1.jpg`), drop it on a throwaway test page, verify glow on XDR in Chrome
  + Safari. De-risks the toolchain before any batch work.
- **Phase 1 — Hero carousel.** Batch-convert all 11 photos; wire into `Hero.js`.
- **Phase 2 — Optional synthetic accent.** After seeing Phase 1 in context, decide
  whether to add one pure-white glow mark (would also need `brew install librsvg`
  for an SVG source). Deferred decision.

## Verification

Per phase, on the XDR display:
1. Open in Chrome **and** Safari; lower screen brightness — the converted image
   should stay bright while surrounding UI white dims (the glow tell).
2. SDR sanity check: confirm the image still looks correct (not dark/washed) when
   HDR headroom is unavailable.

## Tooling

- `pip3 install Pillow numpy`
- `brew install libavif` — provides `avifenc` for AVIF + CICP encoding.
- `brew install librsvg` — only if Phase 2 uses a vector source.

## Risks

- **SDR fallback looks wrong** — mitigated by explicit SDR verification gate.
- **Photos look oversaturated / artificial** — mitigated by selective-highlight
  encoding and tuning the brightness/saturation thresholds; verified by eye.
- **File size** — AVIF typically compresses smaller than the source JPEGs, but
  verify total carousel weight against the existing lazy-loading.
- **Firefox AVIF-PQ tonemapping** — out of the stated Chrome/Safari target, but
  worth a glance so it at least falls back sanely rather than breaking.
