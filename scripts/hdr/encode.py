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
    """Full pipeline: SDR image -> Rec2020/PQ 16-bit PNG.

    Preserves an alpha channel when the source has one (for transparent marks).
    Alpha is coverage, not light, so it is NOT PQ-encoded — only the RGB is.
    """
    img = Image.open(src_path)
    has_alpha = img.mode in ("RGBA", "LA") or "transparency" in img.info
    img = img.convert("RGBA" if has_alpha else "RGB")
    arr = np.asarray(img, dtype=np.float64) / 255.0
    srgb = arr[..., :3]
    alpha = arr[..., 3] if has_alpha else None

    linear709 = srgb_to_linear(srgb)
    linear2020 = linear709 @ REC709_TO_REC2020.T
    abs_nits = boost_highlights(
        linear2020, bright=bright, sat_max=sat_max, target_nits=target_nits
    )
    pq_input = np.clip(abs_nits / PQ_MAX_NITS, 0.0, 1.0)
    code = pq_oetf(pq_input)
    out = np.round(code * 65535.0).astype(np.uint16)  # (H, W, 3)

    if has_alpha:
        alpha16 = np.round(np.clip(alpha, 0.0, 1.0) * 65535.0).astype(np.uint16)
        out = np.concatenate([out, alpha16[..., None]], axis=-1)  # (H, W, 4)

    # Pillow cannot save multi-channel 16-bit PNG, so use pypng. It wants rows of
    # interleaved samples: reshape (H, W, C) -> (H, W*C).
    height, width, channels = out.shape
    rows = out.reshape(height, width * channels)
    with open(dst_png, "wb") as f:
        writer = png.Writer(
            width=width, height=height, bitdepth=16,
            greyscale=False, alpha=has_alpha,
        )
        writer.write(f, rows.tolist())
    return dst_png
