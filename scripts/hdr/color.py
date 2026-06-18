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
