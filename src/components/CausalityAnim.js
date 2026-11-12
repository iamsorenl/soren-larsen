import React from 'react';
import { Box, useMediaQuery } from '@mui/material';

// Slowly drifting contour lines, in the spirit of causality.ai's hero.
const RINGS = [0, 1, 2, 3, 4, 5, 6];
const ring = (k) => {
    const r = 18 + k * 14;
    const w = 6 + k * 2; // wobble grows outward
    return `M ${100 - r} 60 C ${100 - r} ${60 - r * 0.6 - w}, ${100 + r * 0.4} ${60 - r * 0.7}, ${100 + r} ${60 - w / 2}
            S ${100 + r * 0.2} ${60 + r * 0.8}, ${100 - r} 60 Z`;
};

const CausalityAnim = () => {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    return (
        <Box
            data-testid="causality-anim"
            aria-hidden="true"
            sx={{
                width: '100%',
                height: '100%',
                bgcolor: (t) => (t.palette.mode === 'dark' ? '#0d1240' : '#eef0fb'),
                color: (t) => (t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.main),
                '@keyframes contourDrift': {
                    from: { transform: 'translate(-6px, -3px) rotate(-2deg)' },
                    to: { transform: 'translate(6px, 3px) rotate(2deg)' },
                },
            }}
        >
            <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
                <g
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    style={{
                        transformOrigin: '100px 60px',
                        animation: reduced ? 'none' : 'contourDrift 18s ease-in-out infinite alternate',
                    }}
                >
                    {RINGS.map((k) => (
                        <path key={k} d={ring(k)} opacity={0.85 - k * 0.1} />
                    ))}
                </g>
            </svg>
        </Box>
    );
};

export default CausalityAnim;
