import React, { useState } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PlayArrow } from '@mui/icons-material';
import { FONT_DISPLAY } from '../theme';
import CyclingMedia from './CyclingMedia';

// Project tile: a slideshow (demo preview first, then project.slides). The
// whole tile opens the demo on any slide via a stretched link (zIndex 1);
// the slideshow's pause/arrow buttons sit above it (zIndex 2).
// `flush`: sits inside a card, so no own border or corners.
const DemoTile = ({ project, compact = false, showTitle = true, flush = false }) => {
    const { title, demo, video, preview, slides = [] } = project;
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const verb = demo ? 'Play' : 'Watch';
    const [hovered, setHovered] = useState(false);

    const first = preview && (preview.video
        ? { type: 'video', src: preview.video, poster: preview.poster, pos: preview.pos, alt: `${title} demo` }
        : preview.poster && { type: 'image', src: preview.poster, pos: preview.pos, alt: `${title} demo` });
    const items = [first, ...slides].filter(Boolean);

    return (
        <Box
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: flush ? 0 : '12px',
                aspectRatio: compact ? '16 / 10' : '16 / 9',
                color: '#fff',
                border: flush ? 0 : (t) => `1px solid ${alpha(t.palette.primary.main, 0.3)}`,
                background: (t) =>
                    `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.secondary.main} 100%)`,
                '&:focus-within': { outline: '2px solid', outlineOffset: flush ? -2 : 2 },
                '&:hover .cm-arrow': { opacity: 1 },
                // Scale the slide wrapper, not the img, so per-slide crop zoom survives hover.
                ...(reduced ? {} : { '& [data-active]': { transition: 'opacity 0.8s ease, transform 0.3s ease' }, '&:hover [data-active]': { transform: 'scale(1.04)' } }),
            }}
        >
            {items.length > 0 && <CyclingMedia items={items} label={`${title} media`} hovered={hovered} />}
            <Box
                component="a"
                href={demo || video}
                aria-label={`${verb} ${title}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ position: 'absolute', inset: 0, zIndex: 1, '&:focus-visible': { outline: 'none' } }}
            />
            <Box
                aria-hidden="true"
                sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    p: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    pointerEvents: 'none',
                    background: 'linear-gradient(rgba(0,0,0,0.7), transparent)',
                }}
            >
                <Typography component="span" sx={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.25 }}>
                    {showTitle ? title : ''}
                </Typography>
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', flexShrink: 0 }}>
                    <PlayArrow sx={{ fontSize: 16 }} />
                    {verb}
                </Box>
            </Box>
        </Box>
    );
};

export default DemoTile;
