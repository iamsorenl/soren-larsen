# HDR "Glowing" Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Hero photo carousel physically glow on HDR displays (MacBook Pro XDR, iPhone 12+) by re-encoding the photos as Rec2020/PQ AVIF, while all text stays live.

**Architecture:** A build-time Python tool (`scripts/hdr/`) decodes each source JPEG, boosts bright low-saturation highlights up the PQ curve into HDR headroom while pinning colored pixels at the 203-nit SDR reference, writes a 10/16-bit PQ-encoded PNG, then tags it as Rec2020/PQ AVIF via `avifenc --cicp 9/16/9`. The React Hero swaps its image list to the `.hdr.avif` variants. Browsers tonemap back to normal on SDR displays, so the same files degrade gracefully.

**Tech Stack:** Python 3 + Pillow + numpy (encoder), `avifenc` from libavif (container/CICP tagging), pytest (encoder tests), React 18 + MUI (existing site).

## Global Constraints

- **No text glows.** Only images are converted. All headlines/body stay live HTML/MUI text — verbatim from spec.
- **HDR tag via CICP only.** AVIF nclx codes: primaries `9` (BT.2020), transfer `16` (PQ / SMPTE ST 2084), matrix `9` (BT.2020 NCL). No ICC profile file is sourced or embedded.
- **SDR reference white = 203 nits**; highlight boost target ≈ **1000 nits**; PQ absolute scale = **10000 nits = 1.0** PQ input.
- **Encoder is build-time only** — not bundled into the CRA app, adds no runtime dependency.
- **Verification targets:** Chrome and Safari 16.4+ on the author's XDR display. Firefox/SDR must fall back sanely, not break.
- Output files named `<OriginalName>.hdr.avif`, written alongside originals in `src/images/`.

---

## Task 0: Toolchain + encoder package skeleton

**Files:**
- Create: `scripts/hdr/__init__.py` (empty)
- Create: `scripts/hdr/requirements.txt`
- Create: `scripts/hdr/README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the `scripts/hdr/` package directory that all later tasks add modules to.

- [ ] **Step 1: Install avifenc**

Run: `brew install libavif`
Then verify: `avifenc --version`
Expected: prints a version line (e.g. `Version: 1.x.x`). `numpy`, `Pillow`, `pytest` are already present in the environment.

- [ ] **Step 2: Create the package files**

`scripts/hdr/__init__.py`:
```python
```
(empty file)

`scripts/hdr/requirements.txt`:
```
Pillow>=11
numpy>=1.26
pypng>=0.20
pytest>=7
```

Then install: `pip3 install -r scripts/hdr/requirements.txt` (numpy/Pillow/pytest are already present; this adds `pypng`, used to write true 16-bit RGB PNGs that Pillow cannot).

`scripts/hdr/README.md`:
```markdown
# HDR image encoder

Build-time tool. Converts SDR JPEGs into Rec2020/PQ AVIF whose bright,
low-saturation highlights glow on HDR displays. Not part of the app bundle.

## Usage
    python3 -m scripts.hdr.cli src/images/Headshot1.jpg

Outputs `src/images/Headshot1.hdr.avif`.

## Requirements
    pip3 install -r scripts/hdr/requirements.txt
    brew install libavif   # provides avifenc

## How it works
1. Decode + linearize sRGB.
2. Convert Rec709 primaries -> Rec2020.
3. Boost bright low-saturation pixels toward ~1000 nits; keep colored
   pixels pinned at the 203-nit SDR reference.
4. PQ-encode (SMPTE ST 2084) to a 16-bit PNG.
5. `avifenc --cicp 9/16/9 --range full --depth 10` tags it as Rec2020/PQ.
```

- [ ] **Step 3: Commit**

```bash
git add scripts/hdr/__init__.py scripts/hdr/requirements.txt scripts/hdr/README.md
git commit -m "chore(hdr): scaffold build-time HDR encoder package"
```

---

## Task 1: Color + PQ math module

**Files:**
- Create: `scripts/hdr/color.py`
- Test: `scripts/hdr/test_color.py`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `pq_oetf(L: np.ndarray) -> np.ndarray` — linear (0..1, where 1.0 = 10000 nits) → PQ code (0..1).
  - `srgb_to_linear(c: np.ndarray) -> np.ndarray` — sRGB (0..1) → linear (0..1).
  - `REC709_TO_REC2020: np.ndarray` — 3×3 matrix, applied to linear RGB with shape (...,3) via `img @ REC709_TO_REC2020.T`.
  - `SDR_WHITE_NITS = 203.0`, `PQ_MAX_NITS = 10000.0`.

- [ ] **Step 1: Write the failing tests**

`scripts/hdr/test_color.py`:
```python
import numpy as np
from scripts.hdr.color import (
    pq_oetf, srgb_to_linear, REC709_TO_REC2020, SDR_WHITE_NITS, PQ_MAX_NITS,
)


def test_pq_oetf_anchors():
    # PQ(0) == 0; PQ(1.0 == 10000 nits) == 1.0; 100 nits -> ~0.5081 code.
    out = pq_oetf(np.array([0.0, 1.0, 100.0 / PQ_MAX_NITS]))
    assert np.isclose(out[0], 0.0, atol=1e-6)
    assert np.isclose(out[1], 1.0, atol=1e-4)
    assert np.isclose(out[2], 0.5081, atol=2e-3)


def test_pq_oetf_monotonic():
    xs = np.linspace(0, 1, 50)
    ys = pq_oetf(xs)
    assert np.all(np.diff(ys) >= 0)


def test_srgb_to_linear_roundtrip_anchors():
    assert np.isclose(srgb_to_linear(np.array([0.0]))[0], 0.0, atol=1e-7)
    assert np.isclose(srgb_to_linear(np.array([1.0]))[0], 1.0, atol=1e-6)
    # 0.5 sRGB -> ~0.214 linear
    assert np.isclose(srgb_to_linear(np.array([0.5]))[0], 0.214, atol=2e-3)


def test_rec2020_matrix_preserves_white():
    white = np.array([[1.0, 1.0, 1.0]])
    out = white @ REC709_TO_REC2020.T
    assert np.allclose(out, 1.0, atol=1e-3)


def test_constants():
    assert SDR_WHITE_NITS == 203.0
    assert PQ_MAX_NITS == 10000.0
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd "$(git rev-parse --show-toplevel)" && python3 -m pytest scripts/hdr/test_color.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'scripts.hdr.color'`.

- [ ] **Step 3: Write the implementation**

`scripts/hdr/color.py`:
```python
"""Color-space and PQ transfer math for HDR encoding."""
import numpy as np

SDR_WHITE_NITS = 203.0
PQ_MAX_NITS = 10000.0

# SMPTE ST 2084 (PQ) constants.
_M1 = 2610.0 / 16384.0
_M2 = 2523.0 / 4096.0 * 128.0
_C1 = 3424.0 / 4096.0
_C2 = 2413.0 / 4096.0 * 32.0
_C3 = 2392.0 / 4096.0 * 32.0

# BT.2087 linear Rec709 -> linear Rec2020 primaries conversion.
REC709_TO_REC2020 = np.array([
    [0.62740, 0.32930, 0.04330],
    [0.06910, 0.91950, 0.01140],
    [0.01640, 0.08800, 0.89560],
])


def pq_oetf(L):
    """Linear (1.0 == 10000 nits) -> PQ code value (0..1)."""
    L = np.clip(np.asarray(L, dtype=np.float64), 0.0, 1.0)
    Lm1 = np.power(L, _M1)
    return np.power((_C1 + _C2 * Lm1) / (1.0 + _C3 * Lm1), _M2)


def srgb_to_linear(c):
    """sRGB (0..1) -> linear light (0..1)."""
    c = np.asarray(c, dtype=np.float64)
    return np.where(c <= 0.04045, c / 12.92, np.power((c + 0.055) / 1.055, 2.4))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd "$(git rev-parse --show-toplevel)" && python3 -m pytest scripts/hdr/test_color.py -v`
Expected: PASS (5 passed).

- [ ] **Step 5: Commit**

```bash
git add scripts/hdr/color.py scripts/hdr/test_color.py
git commit -m "feat(hdr): add PQ and Rec2020 color math"
```

---

## Task 2: Highlight-selective PQ encoder → 16-bit PNG

**Files:**
- Create: `scripts/hdr/encode.py`
- Test: `scripts/hdr/test_encode.py`

**Interfaces:**
- Consumes: `scripts.hdr.color` (`pq_oetf`, `srgb_to_linear`, `REC709_TO_REC2020`, `SDR_WHITE_NITS`, `PQ_MAX_NITS`).
- Produces:
  - `boost_highlights(linear_rgb: np.ndarray, *, bright=0.5, sat_max=0.2, target_nits=1000.0) -> np.ndarray` — takes linear Rec2020 RGB (...,3) in 0..1 SDR scale, returns **absolute-nits** linear RGB where selected highlights are scaled up to `target_nits` and everything else stays on the `SDR_WHITE_NITS` scale.
  - `encode_pq_png(src_path: str, dst_png: str, *, bright=0.5, sat_max=0.2, target_nits=1000.0) -> str` — full SDR-JPEG → PQ 16-bit PNG pipeline; returns `dst_png`.

- [ ] **Step 1: Write the failing tests**

`scripts/hdr/test_encode.py`:
```python
import numpy as np
from PIL import Image
from scripts.hdr.color import pq_oetf, SDR_WHITE_NITS, PQ_MAX_NITS
from scripts.hdr.encode import boost_highlights, encode_pq_png


def _sdr_ref_code():
    return pq_oetf(np.array([SDR_WHITE_NITS / PQ_MAX_NITS]))[0]


def test_white_highlight_is_boosted_above_sdr_reference():
    # Pure white pixel (already linear) should exceed the 203-nit reference.
    px = np.ones((1, 1, 3))
    out_nits = boost_highlights(px, target_nits=1000.0)
    assert out_nits.max() > SDR_WHITE_NITS * 1.5


def test_saturated_color_stays_at_sdr_reference():
    # Bright but saturated red must NOT be boosted (keeps its color).
    px = np.zeros((1, 1, 3))
    px[0, 0] = [1.0, 0.0, 0.0]
    out_nits = boost_highlights(px, target_nits=1000.0)
    assert out_nits.max() <= SDR_WHITE_NITS + 1e-6


def test_dark_pixel_not_boosted():
    px = np.full((1, 1, 3), 0.1)
    out_nits = boost_highlights(px, target_nits=1000.0)
    assert out_nits.max() <= SDR_WHITE_NITS + 1e-6


def test_encode_pq_png_writes_16bit(tmp_path):
    # Build a tiny white JPEG, encode it, confirm a 16-bit PNG comes out
    # whose brightest code exceeds the SDR reference code.
    import png
    src = tmp_path / "white.jpg"
    Image.new("RGB", (4, 4), (255, 255, 255)).save(src)
    dst = tmp_path / "white.png"
    encode_pq_png(str(src), str(dst))
    reader = png.Reader(filename=str(dst))
    width, height, rows, info = reader.read()
    assert info["bitdepth"] == 16
    assert info["greyscale"] is False
    flat = np.concatenate([np.asarray(r, dtype=np.float64) for r in rows])
    assert (flat / 65535.0).max() > _sdr_ref_code()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd "$(git rev-parse --show-toplevel)" && python3 -m pytest scripts/hdr/test_encode.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'scripts.hdr.encode'`.

- [ ] **Step 3: Write the implementation**

`scripts/hdr/encode.py`:
```python
"""SDR JPEG -> PQ-encoded 16-bit PNG (Rec2020 highlights boosted into HDR)."""
import numpy as np
import png
from PIL import Image

from scripts.hdr.color import (
    pq_oetf, srgb_to_linear, REC709_TO_REC2020, SDR_WHITE_NITS, PQ_MAX_NITS,
)


def boost_highlights(linear_rgb, *, bright=0.5, sat_max=0.2, target_nits=1000.0):
    """Scale bright, low-saturation pixels up toward target_nits.

    Input: linear Rec2020 RGB (...,3) on the SDR 0..1 scale.
    Output: linear RGB in ABSOLUTE NITS (SDR white -> SDR_WHITE_NITS).
    """
    rgb = np.clip(np.asarray(linear_rgb, dtype=np.float64), 0.0, None)
    Y = 0.2627 * rgb[..., 0] + 0.6780 * rgb[..., 1] + 0.0593 * rgb[..., 2]
    maxc = rgb.max(axis=-1)
    minc = rgb.min(axis=-1)
    sat = (maxc - minc) / (maxc + 1e-6)

    # Smooth selection mask: bright AND low-saturation.
    bright_ramp = np.clip((Y - bright) / (1.0 - bright + 1e-6), 0.0, 1.0)
    sat_ramp = np.clip((sat_max - sat) / (sat_max + 1e-6), 0.0, 1.0)
    mask = bright_ramp * sat_ramp  # 0..1

    # Per-pixel gain: 1.0 (no boost) -> target_nits/SDR_WHITE_NITS at mask=1.
    max_gain = target_nits / SDR_WHITE_NITS
    gain = 1.0 + mask * (max_gain - 1.0)
    return rgb * SDR_WHITE_NITS * gain[..., None]


def encode_pq_png(src_path, dst_png, *, bright=0.5, sat_max=0.2, target_nits=1000.0):
    """Full pipeline: SDR JPEG -> Rec2020/PQ 16-bit PNG."""
    srgb = np.asarray(Image.open(src_path).convert("RGB"), dtype=np.float64) / 255.0
    linear709 = srgb_to_linear(srgb)
    linear2020 = linear709 @ REC709_TO_REC2020.T
    abs_nits = boost_highlights(
        linear2020, bright=bright, sat_max=sat_max, target_nits=target_nits
    )
    pq_input = np.clip(abs_nits / PQ_MAX_NITS, 0.0, 1.0)
    code = pq_oetf(pq_input)
    out = np.round(code * 65535.0).astype(np.uint16)  # shape (H, W, 3)
    # Pillow cannot save 3-channel 16-bit PNG, so use pypng. It wants rows of
    # interleaved RGB samples: reshape (H, W, 3) -> (H, W*3).
    height, width = out.shape[:2]
    rows = out.reshape(height, width * 3)
    with open(dst_png, "wb") as f:
        writer = png.Writer(width=width, height=height, bitdepth=16, greyscale=False)
        writer.write(f, rows.tolist())
    return dst_png
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd "$(git rev-parse --show-toplevel)" && python3 -m pytest scripts/hdr/test_encode.py -v`
Expected: PASS (4 passed). If the 16-bit-RGB save raised, apply the NOTE's pypng path and re-run.

- [ ] **Step 5: Commit**

```bash
git add scripts/hdr/encode.py scripts/hdr/test_encode.py scripts/hdr/requirements.txt
git commit -m "feat(hdr): highlight-selective PQ encode to 16-bit PNG"
```

---

## Task 3 (Phase 0 POC): AVIF CLI wrapper + convert one photo + verify glow

**Files:**
- Create: `scripts/hdr/cli.py`
- Create: `public/hdr-test.html` (throwaway verification page)
- Create (generated): `src/images/Headshot1.hdr.avif`
- Test: `scripts/hdr/test_cli.py`

**Interfaces:**
- Consumes: `scripts.hdr.encode.encode_pq_png`.
- Produces:
  - `to_avif(png_path: str, avif_path: str) -> str` — runs `avifenc --cicp 9/16/9 --range full --depth 10 -y 444 <png> <avif>` via subprocess; returns `avif_path`. Raises `RuntimeError` on non-zero exit.
  - `convert(src_jpg: str, out_avif: str | None = None) -> str` — end-to-end JPEG → `.hdr.avif`; default out path is the source with extension replaced by `.hdr.avif`.
  - `python3 -m scripts.hdr.cli <img> [<img> ...]` CLI entry.

- [ ] **Step 1: Write the failing test**

`scripts/hdr/test_cli.py`:
```python
import shutil
import subprocess
import numpy as np
import pytest
from PIL import Image
from scripts.hdr.cli import convert, default_out_path


def test_default_out_path():
    assert default_out_path("a/b/Headshot1.jpg") == "a/b/Headshot1.hdr.avif"
    assert default_out_path("x/Surf.JPG") == "x/Surf.hdr.avif"


@pytest.mark.skipif(shutil.which("avifenc") is None, reason="avifenc not installed")
def test_convert_produces_pq_avif(tmp_path):
    src = tmp_path / "white.jpg"
    Image.new("RGB", (8, 8), (255, 255, 255)).save(src)
    out = convert(str(src))
    assert out.endswith(".hdr.avif")
    # Confirm the CICP transfer is PQ (16) via avifdec/exiftool-free probe:
    info = subprocess.run(
        ["avifdec", "--info", out], capture_output=True, text=True
    ).stdout + subprocess.run(
        ["avifenc", "--version"], capture_output=True, text=True
    ).stdout
    # avifdec --info prints "Transfer Characteristics: 16" for PQ.
    assert "16" in info
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "$(git rev-parse --show-toplevel)" && python3 -m pytest scripts/hdr/test_cli.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'scripts.hdr.cli'`.

- [ ] **Step 3: Write the implementation**

`scripts/hdr/cli.py`:
```python
"""CLI: convert SDR JPEGs to Rec2020/PQ AVIF that glows on HDR displays."""
import os
import subprocess
import sys
import tempfile

from scripts.hdr.encode import encode_pq_png


def default_out_path(src_jpg):
    root, _ = os.path.splitext(src_jpg)
    return root + ".hdr.avif"


def to_avif(png_path, avif_path):
    cmd = [
        "avifenc", "--cicp", "9/16/9", "--range", "full",
        "--depth", "10", "-y", "444", png_path, avif_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"avifenc failed:\n{result.stderr}")
    return avif_path


def convert(src_jpg, out_avif=None):
    out_avif = out_avif or default_out_path(src_jpg)
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        png_path = tmp.name
    try:
        encode_pq_png(src_jpg, png_path)
        to_avif(png_path, out_avif)
    finally:
        os.unlink(png_path)
    return out_avif


def main(argv):
    if not argv:
        print("usage: python3 -m scripts.hdr.cli <img.jpg> [<img.jpg> ...]")
        return 1
    for src in argv:
        out = convert(src)
        print(f"{src} -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "$(git rev-parse --show-toplevel)" && python3 -m pytest scripts/hdr/test_cli.py -v`
Expected: PASS (2 passed). If `avifdec` is absent the probe test skips — that's acceptable; `test_default_out_path` must pass.

- [ ] **Step 5: Convert the POC photo**

Run: `cd "$(git rev-parse --show-toplevel)" && python3 -m scripts.hdr.cli src/images/Headshot1.jpg`
Expected: prints `src/images/Headshot1.jpg -> src/images/Headshot1.hdr.avif` and the file exists (`ls -la src/images/Headshot1.hdr.avif`).

- [ ] **Step 6: Build the throwaway verification page**

`public/hdr-test.html`:
```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>HDR glow test</title>
    <style>
      body { background: #f5f5f5; color: #111; font-family: system-ui;
             display: flex; gap: 32px; padding: 48px; align-items: center; }
      .label { font-size: 14px; }
      img { width: 340px; border-radius: 16px; }
      .swatch { width: 340px; height: 400px; border-radius: 16px;
                background: #ffffff; border: 1px solid #ccc; }
    </style>
  </head>
  <body>
    <div>
      <div class="label">HDR AVIF (should glow brighter than white)</div>
      <img src="/Headshot1.hdr.avif" alt="hdr" />
    </div>
    <div>
      <div class="label">Plain white #fff (SDR reference)</div>
      <div class="swatch"></div>
    </div>
  </body>
</html>
```

Copy the AVIF where the static page can load it:
Run: `cp "$(git rev-parse --show-toplevel)/src/images/Headshot1.hdr.avif" "$(git rev-parse --show-toplevel)/public/Headshot1.hdr.avif"`

- [ ] **Step 7: MANUAL verification on the XDR display (not automated)**

Run: `cd "$(git rev-parse --show-toplevel)" && npm start`
Then in turn:
1. Open `http://localhost:3000/hdr-test.html` in **Chrome**. Lower the screen brightness. Expected: the photo's highlights read **brighter** than the `#fff` swatch beside it (the glow). The swatch is your SDR-white baseline.
2. Open the same URL in **Safari**. Expected: same glow.
3. **SDR fallback check:** System Settings → Displays → toggle off HDR (or view on an SDR external monitor / screenshot). Expected: the photo looks **normal** — not dark, washed, or oversaturated.

If the photo does NOT glow: increase `target_nits` (e.g. 2000) or lower `bright` (e.g. 0.4) in a one-off `convert(... target_nits=..., bright=...)` call and re-check. If it looks oversaturated/unnatural on SDR: raise `bright` toward 0.65 or lower `sat_max` toward 0.12. Record the values that look right — they become the Phase 1 defaults.

- [ ] **Step 8: Commit the POC**

```bash
git add scripts/hdr/cli.py scripts/hdr/test_cli.py public/hdr-test.html
git add src/images/Headshot1.hdr.avif
git commit -m "feat(hdr): AVIF CICP encoder + Headshot1 POC + test page"
```

> **STOP — Phase 0 gate.** Do not proceed to Task 4 until the manual glow + SDR-fallback check passes and the good `target_nits`/`bright`/`sat_max` values are recorded. Report results to the user before continuing.

---

## Task 4 (Phase 1): Batch-convert the carousel + wire into Hero

**Files:**
- Modify: `scripts/hdr/cli.py` (if Step 7 above changed default tuning, bake the chosen `bright`/`sat_max`/`target_nits` into `encode_pq_png`/`boost_highlights` defaults so the batch uses them)
- Create (generated): `src/images/<Name>.hdr.avif` for all 11 carousel photos
- Modify: `src/components/Hero.js:17-41` (imports + `IMAGE_URLS`)
- Delete: `public/hdr-test.html`, `public/Headshot1.hdr.avif` (throwaway POC artifacts)

**Interfaces:**
- Consumes: `scripts.hdr.cli.convert`.
- Produces: 11 `.hdr.avif` files imported by `Hero.js`.

- [ ] **Step 1: Bake the tuned defaults (only if Phase 0 changed them)**

If Phase 0 settled on non-default values, edit the keyword defaults in
`scripts/hdr/encode.py` (`boost_highlights` and `encode_pq_png` signatures) to
match. Then re-run the encoder tests:
Run: `cd "$(git rev-parse --show-toplevel)" && python3 -m pytest scripts/hdr/ -v`
Expected: PASS (all tests).

- [ ] **Step 2: Batch-convert all 11 carousel photos**

Run:
```bash
cd "$(git rev-parse --show-toplevel)" && python3 -m scripts.hdr.cli \
  src/images/Headshot1.jpg src/images/Expressive.JPG src/images/HalfDome.jpg \
  src/images/Headshot2.jpg src/images/Turtle.jpg src/images/Peru.JPG \
  src/images/SlugFest.JPG src/images/Surf.jpg src/images/caffeine_hack.jpeg \
  src/images/Poster_Presentation.JPG src/images/FrontierTower.jpg
```
Expected: 11 lines `… -> ….hdr.avif`. Verify: `ls src/images/*.hdr.avif | wc -l` prints `11`.

- [ ] **Step 3: Point Hero.js at the AVIF variants**

In `src/components/Hero.js`, change the image imports (lines 17–27) to the
`.hdr.avif` files. Replace:
```javascript
import headshot1 from '../images/Headshot1.jpg';
import headshot2 from '../images/Headshot2.jpg';
import turtle from '../images/Turtle.jpg';
import surf from '../images/Surf.jpg';
import halfdome from '../images/HalfDome.jpg';
import expressive from '../images/Expressive.JPG';
import peru from '../images/Peru.JPG';
import slugfest from '../images/SlugFest.JPG';
import caffeineHack from '../images/caffeine_hack.jpeg';
import posterPresentation from '../images/Poster_Presentation.JPG';
import frontierTower from '../images/FrontierTower.jpg';
```
with:
```javascript
import headshot1 from '../images/Headshot1.hdr.avif';
import headshot2 from '../images/Headshot2.hdr.avif';
import turtle from '../images/Turtle.hdr.avif';
import surf from '../images/Surf.hdr.avif';
import halfdome from '../images/HalfDome.hdr.avif';
import expressive from '../images/Expressive.hdr.avif';
import peru from '../images/Peru.hdr.avif';
import slugfest from '../images/SlugFest.hdr.avif';
import caffeineHack from '../images/caffeine_hack.hdr.avif';
import posterPresentation from '../images/Poster_Presentation.hdr.avif';
import frontierTower from '../images/FrontierTower.hdr.avif';
```
Leave the `IMAGE_URLS` array (lines 29–41) unchanged — it references the same variable names.

- [ ] **Step 4: Verify the build compiles**

Run: `cd "$(git rev-parse --show-toplevel)" && CI=true npm run build`
Expected: build succeeds (CRA resolves `.avif` imports as static assets by default). If it fails to resolve `.avif`, confirm the files exist and the import paths match exactly.

- [ ] **Step 5: MANUAL carousel verification on XDR (not automated)**

Run: `cd "$(git rev-parse --show-toplevel)" && npm start`
1. Open the site in Chrome on the XDR display. Watch the Hero carousel cycle (8s interval) or click the dots. Expected: each photo's highlights glow brighter than the page's white surfaces.
2. Repeat in Safari.
3. SDR fallback: disable HDR / use an SDR display. Expected: all 11 photos look natural, none dark or blown out.
4. Note total weight: DevTools → Network → filter `avif`. Confirm the carousel's lazy-loading still defers non-first images and total weight is acceptable.

- [ ] **Step 6: Remove throwaway POC artifacts**

```bash
cd "$(git rev-parse --show-toplevel)"
git rm public/hdr-test.html public/Headshot1.hdr.avif
```

- [ ] **Step 7: Commit Phase 1**

```bash
cd "$(git rev-parse --show-toplevel)"
git add src/images/*.hdr.avif src/components/Hero.js scripts/hdr/encode.py
git commit -m "feat(hero): HDR-glowing photo carousel via Rec2020/PQ AVIF"
```

---

## Phase 2 (deferred — not planned here)

One synthetic pure-white "glow mark" accent. Decision deferred until the
carousel is seen in context (per spec). If pursued, it reuses the same
encoder (`target_nits` maxed, applied to a white-on-transparent source) and
would add `brew install librsvg` for a vector source. Write a follow-up plan
at that point.
```
