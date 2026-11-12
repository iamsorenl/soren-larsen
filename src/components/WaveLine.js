import React from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Two slow sine lines drifting sideways behind the Contact card. Decorative.
const wave = (amp, phase) => {
    let d = `M 0 ${60 + amp * Math.sin(phase)}`;
    for (let x = 10; x <= 800; x += 10) d += ` L ${x} ${(60 + amp * Math.sin(x / 50 + phase)).toFixed(1)}`;
    return d;
};

const WaveLine = () => {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const drift = (s) => (reduced ? 'none' : `waveDrift ${s}s linear infinite`);
    return (
        <Box
            data-testid="wave-line"
            aria-hidden="true"
            sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 120,
                overflow: 'hidden',
                pointerEvents: 'none',
                color: (t) => alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.35 : 0.25),
                '@keyframes waveDrift': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-314px)' } },
            }}
        >
            <svg viewBox="0 0 800 120" preserveAspectRatio="none" width="200%" height="100%">
                <path d={wave(14, 0)} fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: drift(14) }} />
                <path d={wave(9, 1.6)} fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.6" style={{ animation: drift(22) }} />
            </svg>
        </Box>
    );
};

export default WaveLine;
