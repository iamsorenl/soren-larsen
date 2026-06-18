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
