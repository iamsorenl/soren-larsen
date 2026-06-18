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
