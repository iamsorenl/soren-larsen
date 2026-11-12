import React, { useEffect, useRef, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { PauseButton } from './CyclingMedia';

// Our own drawing for the Baskin TA tile: a UCSC banana slug crawls across,
// leaving a slime trail. 10 s loop; reduced motion shows it still, mid-tile.
const PALETTE = {
    dark: { bg: '#121538', ground: 'rgba(143,156,245,.14)', slug: '#f5c518', spots: '#3a2f0b', trail: 'rgba(200,215,255,.35)' },
    light: { bg: '#f4f1ea', ground: 'rgba(0,0,0,.08)', slug: '#e8b100', spots: '#3a2f0b', trail: 'rgba(35,80,200,.25)' },
};
const W = 450;
const H = 140;
const GY = 104; // ground line (slug drawn at 1x, scaled 1.6x on wide tiles)

const SlugAnim = () => {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const c = PALETTE[useTheme().palette.mode] || PALETTE.dark;
    const [paused, setPaused] = useState(false);
    // Match the viewBox to the tile's aspect so nothing is cropped; on narrow
    // tiles (the 72px phone square) the slug is drawn smaller so it fits whole.
    const ref = useRef(null);
    const [vw, setVw] = useState(W);
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof ResizeObserver === 'undefined') return undefined;
        const ro = new ResizeObserver(([e]) => {
            const { width, height } = e.contentRect;
            if (width && height) setVw(Math.round((H * width) / height));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    // Too small to cross (the 72px phone square): the slug stays put mid-tile.
    const narrow = vw < W;
    const run = (name, t) => (reduced ? {} : { animation: `${name} ${t}s linear infinite`, animationPlayState: paused ? 'paused' : 'running' });

    return (
        <Box
            ref={ref}
            data-testid="slug-anim"
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                bgcolor: c.bg,
                '@keyframes slugMove': { from: { transform: 'translateX(-180px)' }, to: { transform: `translateX(${vw + 10}px)` } },
                '@keyframes slugTrail': { from: { transform: 'scaleX(0)' }, to: { transform: `scaleX(${(vw + 190) / vw})` } },
                '@keyframes slugInch': { '0%,100%': { transform: 'scaleX(1)' }, '50%': { transform: 'scaleX(1.06)' } },
            }}
        >
            <svg aria-hidden="true" viewBox={`0 0 ${vw} ${H}`} preserveAspectRatio="xMidYMid meet" width="100%" height="100%" style={{ display: 'block' }}>
                <line x1="0" y1={GY + 2} x2={vw} y2={GY + 2} stroke={c.ground} strokeWidth="2" />
                <rect x="0" y={GY - 1} width={vw} height="3" rx="1.5" fill={c.trail}
                    style={{ transformOrigin: '0 0', ...(reduced || narrow ? { transform: 'scaleX(0.55)' } : run('slugTrail', 10)) }} />
                <g style={reduced || narrow ? { transform: `translateX(${Math.max(0, vw / 2 - 60)}px)` } : run('slugMove', 10)}>
                    <g transform={`translate(0 ${GY}) scale(${vw < W ? 1 : 1.6}) translate(0 ${-GY})`}>
                    <g style={{ transformOrigin: `0px ${GY}px`, ...run('slugInch', 1.2) }}>
                        {/* body: tapered tail left, rounded head right */}
                        <path d={`M 0 ${GY} C 20 ${GY - 4}, 40 ${GY - 22}, 75 ${GY - 22} C 95 ${GY - 22}, 104 ${GY - 14}, 104 ${GY - 6} C 104 ${GY}, 98 ${GY + 1}, 90 ${GY + 1} Z`} fill={c.slug} />
                        <path d={`M 60 ${GY - 21} C 70 ${GY - 30}, 92 ${GY - 30}, 98 ${GY - 16}`} fill="none" stroke={c.slug} strokeWidth="9" strokeLinecap="round" />
                        {/* eye stalks */}
                        <line x1="94" y1={GY - 24} x2="100" y2={GY - 40} stroke={c.slug} strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="99" y1={GY - 22} x2="108" y2={GY - 36} stroke={c.slug} strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="100" cy={GY - 41} r="2.6" fill={c.spots} />
                        <circle cx="108.5" cy={GY - 37} r="2.6" fill={c.spots} />
                        {/* banana-slug spots */}
                        <circle cx="48" cy={GY - 12} r="2.5" fill={c.spots} opacity=".55" />
                        <circle cx="66" cy={GY - 16} r="3" fill={c.spots} opacity=".55" />
                        <circle cx="30" cy={GY - 6} r="2" fill={c.spots} opacity=".55" />
                    </g>
                    </g>
                </g>
            </svg>
            {!reduced && <PauseButton paused={paused} onToggle={() => setPaused((p) => !p)} size={24} />}
        </Box>
    );
};

export default SlugAnim;
