import React, { useEffect, useRef, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { PauseButton } from './CyclingMedia';
import { boardalClips, boardalApp } from '../data/experienceImages';

// Four looping squares over a blurred copy of the ride: app feed, ride clip,
// tip clip, app filters. Squares shrink together on narrow tiles. Phones (72px tile)
// show only the ride.
// Up to 140px square; shrinks to fit four across.
const Square = ({ children }) => (
    <Box sx={{ position: 'relative', flex: '0 1 140px', minWidth: 0, aspectRatio: '1 / 1', maxHeight: '100%' }}>{children}</Box>
);

// `full`: always show all four (the experience dialog on phones has the room).
const BoardalSquares = ({ full = false }) => {
    const sm = useMediaQuery(useTheme().breakpoints.up('sm')) || full;
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const ref = useRef(null);
    const vids = useRef([]);
    const [inView, setInView] = useState(false);
    const [paused, setPaused] = useState(false);
    const clips = sm ? [boardalApp[0], ...boardalClips, boardalApp[1]] : boardalClips.slice(0, 1);
    const play = inView && !reduced;

    useEffect(() => {
        if (reduced || !ref.current || typeof IntersectionObserver === 'undefined') return undefined;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setInView(true); io.disconnect(); }
        });
        io.observe(ref.current);
        return () => io.disconnect();
    }, [reduced]);

    useEffect(() => {
        vids.current.forEach((v) => {
            if (!v) return;
            if (paused) v.pause();
            else { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        });
    }, [paused, play]);

    const fill = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
    const media = (c, i, sx) => (play ? (
        <Box component="video" src={c.src} poster={c.poster} muted loop autoPlay={!paused} playsInline preload="metadata"
            aria-label={c.alt} ref={(el) => { if (el) el.muted = true; vids.current[i] = el; }} sx={sx} />
    ) : (
        <Box component="img" src={c.poster} alt={c.alt} loading="lazy" sx={sx} />
    ));

    return (
        <Box ref={ref} role="group" aria-label="Boardal reels" sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', bgcolor: '#000' }}>
            {sm && (
                <Box component="img" src={boardalClips[0].poster} alt="" aria-hidden="true"
                    sx={{ ...fill, inset: -20, width: 'calc(100% + 40px)', height: 'calc(100% + 40px)', filter: 'blur(18px) brightness(.55)' }} />
            )}
            <Box sx={{ position: 'relative', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                {clips.map((c, i) => <Square key={c.src}>{media(c, i, fill)}</Square>)}
            </Box>
            {!reduced && <PauseButton paused={paused} onToggle={() => setPaused((p) => !p)} size={sm ? 30 : 24} />}
        </Box>
    );
};

export default BoardalSquares;
