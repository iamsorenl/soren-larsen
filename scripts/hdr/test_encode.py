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
