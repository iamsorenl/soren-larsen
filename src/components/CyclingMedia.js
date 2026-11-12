import React, { useEffect, useRef, useState } from 'react';
import { Box, Tooltip, useMediaQuery } from '@mui/material';
import { Pause, PlayArrow, ChevronLeft, ChevronRight } from '@mui/icons-material';

// Round overlay button used for pause/play and the arrows. zIndex 2 keeps it
// above a parent's stretched link or toggle (zIndex 1).
export const controlSx = (size = 30) => ({
    position: 'absolute',
    zIndex: 2,
    width: size,
    height: size,
    p: 0,
    border: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    color: '#fff',
    bgcolor: 'rgba(10,12,40,0.7)',
    '& svg': { fontSize: size * 0.6 },
    '&:focus-visible': { outline: '2px solid #fff', outlineOffset: 1 },
});

export const PauseButton = ({ paused, onToggle, size = 30 }) => (
    <Box
        component="button"
        type="button"
        aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggle(); }}
        sx={{ ...controlSx(size), right: 6, bottom: 6 }}
    >
        {paused ? <PlayArrow /> : <Pause />}
    </Box>
);

// Fills its parent and crossfades through `items`:
//   { type: 'image' | 'video', src, poster?, alt, tip?, pos?, zoom? }
// Muted, lazy (videos load only in view, pause when scrolled away). Corner
// pause + hover arrows; hover/focus holds image slides. Videos never loop in a
// multi-item set: they play once, then the next slide shows. On mouse devices a
// video plays only while hovered (hovering jumps to it); idle, it shows its
// poster. Touch devices play it whenever it's the active slide in view.
// Reduced motion: first item still, arrows only.
// `hovered`: a parent with an overlay on top (stretched link/toggle) passes its
// own hover state, since the frame itself never sees the pointer.
// `small` (72px phone tiles): pause button only, no arrows.
const CyclingMedia = ({ items, intervalMs = 6000, label, sx, counter = false, tooltip = false, small = false, hovered: parentHovered = false }) => {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const canHover = useMediaQuery('(hover: hover)');
    const ref = useRef(null);
    const videos = useRef({});
    const [index, setIndex] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [userPaused, setUserPaused] = useState(false);
    const [inView, setInView] = useState(false);
    const count = items ? items.length : 0;
    const engaged = hovered || parentHovered;
    // Mouse devices only play video while hovered; touch plays the active one.
    const videoOn = !canHover || engaged;
    const activeIsVideo = items?.[index]?.type === 'video';

    // Hovering an image slide jumps to the first video.
    useEffect(() => {
        if (!canHover || !engaged || reduced || !items || activeIsVideo) return;
        const v = items.findIndex((it) => it.type === 'video');
        if (v >= 0) setIndex(v);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engaged]);

    useEffect(() => {
        // A playing video advances itself when it ends.
        const playing = activeIsVideo && videoOn && inView;
        if (reduced || engaged || userPaused || count < 2 || playing) return undefined;
        const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
        return () => clearInterval(id);
    }, [reduced, engaged, userPaused, count, intervalMs, activeIsVideo, videoOn, inView]);

    useEffect(() => {
        // No IntersectionObserver (old browsers, jsdom): videos stay posters.
        if (reduced || !ref.current || typeof IntersectionObserver === 'undefined') return undefined;
        const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
        io.observe(ref.current);
        return () => io.disconnect();
    }, [reduced]);

    useEffect(() => {
        const v = videos.current[index];
        if (!v) return;
        if (userPaused) v.pause();
        else if (v.paused) {
            const p = v.play();
            if (p && p.catch) p.catch(() => {});
        }
    }, [userPaused, index, videoOn, inView]);

    if (!count) return null;

    const hasVideo = items.some((it) => it.type === 'video');
    const showPause = !reduced && (count > 1 || hasVideo);
    const step = (d) => (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIndex((i) => (i + d + count) % count);
    };
    const size = small ? 24 : 30;
    const fill = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
    const item = items[index];

    const frame = (
        <Box
            ref={ref}
            role="group"
            aria-roledescription="slideshow"
            aria-label={label}
            data-active-alt={item.alt}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                '& .cm-arrow': { opacity: 0, transition: 'opacity 0.2s' },
                '&:hover .cm-arrow, &:focus-within .cm-arrow': { opacity: 1 },
                '@media (hover: none)': { '& .cm-arrow': { opacity: 1 } },
                ...sx,
            }}
        >
            {items.map((it, i) => {
                const isActive = i === index;
                // Optional crop from scripts/crop-tool.html: pos "X% Y%", zoom >= 1.
                const crop = it.pos
                    ? { objectPosition: it.pos, transformOrigin: it.pos, transform: it.zoom > 1 ? `scale(${it.zoom})` : undefined }
                    : {};
                const playVideo = it.type === 'video' && isActive && inView && !reduced && videoOn;
                return (
                    <Box
                        key={it.src}
                        data-active={isActive ? 'true' : 'false'}
                        aria-hidden={!isActive}
                        sx={{ ...fill, opacity: isActive ? 1 : 0, transition: reduced ? 'none' : 'opacity 0.8s ease' }}
                    >
                        {playVideo ? (
                            <Box
                                component="video"
                                src={it.src}
                                poster={it.poster}
                                muted
                                loop={count < 2}
                                onEnded={() => setIndex((n) => (n + 1) % count)}
                                autoPlay={!userPaused}
                                playsInline
                                preload="metadata"
                                aria-label={it.alt}
                                ref={(el) => {
                                    if (el) el.muted = true;
                                    videos.current[i] = el;
                                }}
                                sx={{ ...fill, ...crop }}
                            />
                        ) : (
                            <Box
                                component="img"
                                src={it.type === 'video' ? it.poster : it.src}
                                alt={it.alt}
                                loading="lazy"
                                sx={{ ...fill, ...crop }}
                            />
                        )}
                    </Box>
                );
            })}
            {count > 1 && !small && (
                <>
                    <Box component="button" type="button" className="cm-arrow" aria-label="Previous" onClick={step(-1)}
                        sx={{ ...controlSx(size), left: 6, top: '50%', transform: 'translateY(-50%)' }}>
                        <ChevronLeft />
                    </Box>
                    <Box component="button" type="button" className="cm-arrow" aria-label="Next" onClick={step(1)}
                        sx={{ ...controlSx(size), right: 6, top: '50%', transform: 'translateY(-50%)' }}>
                        <ChevronRight />
                    </Box>
                </>
            )}
            {showPause && <PauseButton paused={userPaused} onToggle={() => setUserPaused((p) => !p)} size={size} />}
            {counter && count > 1 && (
                <Box
                    aria-live="polite"
                    sx={{ position: 'absolute', zIndex: 2, left: 8, bottom: 8, px: 1, py: 0.25, borderRadius: 2, fontSize: 12, color: '#fff', bgcolor: 'rgba(10,12,40,0.6)', fontVariantNumeric: 'tabular-nums' }}
                >
                    {index + 1} / {count}
                </Box>
            )}
        </Box>
    );

    if (!tooltip || !item.tip) return frame;
    return (
        <Tooltip title={item.tip} followCursor enterTouchDelay={0} leaveTouchDelay={2500}>
            {frame}
        </Tooltip>
    );
};

export default CyclingMedia;
