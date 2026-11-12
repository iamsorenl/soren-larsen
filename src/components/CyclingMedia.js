import React, { useEffect, useRef, useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';

// Fills its parent and crossfades through `items`:
//   { type: 'image' | 'video', src, poster?, alt }
// Muted, lazy (videos load only once in view), pauses on hover/focus,
// and under reduced motion shows the first item as a still, no cycling.
const CyclingMedia = ({ items, intervalMs = 6000, label, sx }) => {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const ref = useRef(null);
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [inView, setInView] = useState(false);
    const count = items ? items.length : 0;

    useEffect(() => {
        if (reduced || paused || count < 2) return undefined;
        const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
        return () => clearInterval(id);
    }, [reduced, paused, count, intervalMs]);

    useEffect(() => {
        // No IntersectionObserver (old browsers, jsdom): videos stay posters.
        if (reduced || !ref.current || typeof IntersectionObserver === 'undefined') return undefined;
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                io.disconnect();
            }
        });
        io.observe(ref.current);
        return () => io.disconnect();
    }, [reduced]);

    if (!count) return null;

    const fill = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' };

    return (
        <Box
            ref={ref}
            role="img"
            aria-label={label}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...sx }}
        >
            {items.map((item, i) => {
                const isActive = i === index;
                const playVideo = item.type === 'video' && isActive && inView && !reduced;
                return (
                    <Box
                        key={item.src}
                        data-active={isActive ? 'true' : 'false'}
                        aria-hidden={!isActive}
                        sx={{ ...fill, opacity: isActive ? 1 : 0, transition: reduced ? 'none' : 'opacity 0.8s ease' }}
                    >
                        {playVideo ? (
                            <Box
                                component="video"
                                src={item.src}
                                poster={item.poster}
                                muted
                                loop
                                autoPlay
                                playsInline
                                preload="metadata"
                                aria-label={item.alt}
                                ref={(el) => { if (el) el.muted = true; }}
                                sx={fill}
                            />
                        ) : (
                            <Box
                                component="img"
                                src={item.type === 'video' ? item.poster : item.src}
                                alt={item.alt}
                                loading="lazy"
                                sx={fill}
                            />
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};

export default CyclingMedia;
