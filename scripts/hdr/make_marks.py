"""Generate the site's glowing brand marks and their light-mode counterparts.

Run:  python3 -m scripts.hdr.make_marks

Produces, in src/images/marks/:
  monogram-glow.hdr.avif  white "SL" (Fraunces)  -> dark-mode navbar (glows)
  monogram-light.png      indigo "SL"            -> light-mode navbar
  accent-glow.hdr.avif    white sparkle          -> dark-mode hero accent (glows)
  accent-light.png        indigo sparkle         -> light-mode hero accent
  fab-glow.hdr.avif       white halo             -> behind the chat FAB (glows)

The white PNG sources are transient; only the AVIF/indigo-PNG outputs persist.
"""
import math
import os
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from scripts.hdr.cli import convert

# MUI Brightness7 (sun) icon path — matches the theme toggle's light icon so the
# glowing dark-mode sun is the same family as the light-mode moon.
SUN_PATH = (
    "M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 "
    "15.31 20H20v-4.69L23.31 12zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 "
    "6 6-2.69 6-6 6m0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4"
)

HERE = os.path.dirname(__file__)
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "src", "images", "marks")
FONT = os.path.join(HERE, "fonts", "Fraunces.ttf")

INDIGO = (26, 35, 126, 255)  # #1a237e — site primary.dark
WHITE = (255, 255, 255, 255)
PAD = 0.16  # fraction of glyph box added as breathing room


def _font(size):
    f = ImageFont.truetype(FONT, size)
    try:
        f.set_variation_by_name("Bold")
    except Exception:
        pass
    return f


def _trim_to_content(img, pad_frac):
    """Crop to the non-transparent bounding box, then re-pad proportionally."""
    bbox = img.getbbox()
    if bbox is None:
        return img
    cropped = img.crop(bbox)
    w, h = cropped.size
    pad = int(round(max(w, h) * pad_frac))
    out = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    out.paste(cropped, (pad, pad))
    return out


def monogram(fill, out):
    canvas = 1024
    img = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f = _font(560)
    d.text((canvas / 2, canvas / 2), "SL", font=f, fill=fill, anchor="mm")
    _trim_to_content(img, PAD).save(out)
    print("wrote", out)


def sparkle(fill, out):
    size = 256
    c, R, r = size / 2, size * 0.46, size * 0.46 * 0.30
    rd = r / math.sqrt(2)
    pts = [(c, c - R), (c + rd, c - rd), (c + R, c), (c + rd, c + rd),
           (c, c + R), (c - rd, c + rd), (c - R, c), (c - rd, c - rd)]
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(img).polygon(pts, fill=fill)
    img.save(out)
    print("wrote", out)


def sun(out):
    """Rasterize the white MUI sun icon (with its ring hole) via rsvg-convert."""
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
        f'<path fill="#ffffff" d="{SUN_PATH}"/></svg>'
    )
    subprocess.run(
        ["rsvg-convert", "-w", "512", "-h", "512", "-o", out],
        input=svg.encode(), check=True,
    )
    print("wrote", out)


def halo(out):
    """Soft white radial aura: bright core fading to transparent."""
    size = 256
    yy, xx = np.mgrid[0:size, 0:size]
    c = (size - 1) / 2
    dist = np.sqrt((xx - c) ** 2 + (yy - c) ** 2) / (size / 2)
    falloff = np.clip(1.0 - dist, 0.0, 1.0) ** 1.8  # smooth edge
    rgba = np.zeros((size, size, 4), dtype=np.uint8)
    rgba[..., :3] = 255  # white
    rgba[..., 3] = np.round(falloff * 255).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(out)
    print("wrote", out)


def _to_avif(white_png, final_avif):
    produced = convert(white_png)  # writes <white_png stem>.hdr.avif
    os.replace(produced, final_avif)
    os.unlink(white_png)
    print("wrote", final_avif)


def main():
    os.makedirs(OUT, exist_ok=True)
    p = lambda name: os.path.join(OUT, name)

    # Light-mode (indigo, no glow) — kept as-is.
    monogram(INDIGO, p("monogram-light.png"))
    sparkle(INDIGO, p("accent-light.png"))

    # Glow sources (white) -> PQ AVIF, then delete the white PNG.
    monogram(WHITE, p("_monogram-white.png"))
    sparkle(WHITE, p("_accent-white.png"))
    halo(p("_fab-white.png"))
    sun(p("_sun-white.png"))
    _to_avif(p("_monogram-white.png"), p("monogram-glow.hdr.avif"))
    _to_avif(p("_accent-white.png"), p("accent-glow.hdr.avif"))
    _to_avif(p("_fab-white.png"), p("fab-glow.hdr.avif"))
    _to_avif(p("_sun-white.png"), p("sun-glow.hdr.avif"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
