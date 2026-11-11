import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PlayArrow } from '@mui/icons-material';
import { FONT_DISPLAY } from '../theme';

const DemoTile = ({ project, compact = false }) => {
    const { title, demo, video, preview } = project;
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    const wantsVideo = Boolean(preview && preview.video) && !prefersReducedMotion;

    useEffect(() => {
        // No IntersectionObserver (old browsers, jsdom): never load the video.
        if (!wantsVideo || !ref.current || typeof IntersectionObserver === 'undefined') {
            return undefined;
        }
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                io.disconnect();
            }
        });
        io.observe(ref.current);
        return () => io.disconnect();
    }, [wantsVideo]);

    const mediaSx = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };

    return (
        <Box
            component="a"
            ref={ref}
            href={demo || video}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
                position: 'relative',
                display: 'block',
                overflow: 'hidden',
                borderRadius: '12px',
                aspectRatio: compact ? '16 / 10' : '16 / 9',
                textDecoration: 'none',
                color: '#fff',
                border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.3)}`,
                background: (t) =>
                    `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.secondary.main} 100%)`,
                '&:focus-visible': { outline: '2px solid', outlineOffset: 2 },
                '&:hover img, &:hover video': { transform: 'scale(1.04)' },
            }}
        >
            {preview && preview.poster && (
                <Box
                    component="img"
                    src={preview.poster}
                    alt=""
                    loading="lazy"
                    sx={{ ...mediaSx, position: 'absolute', inset: 0, transition: 'transform 0.3s ease' }}
                />
            )}
            {wantsVideo && inView && (
                <Box
                    component="video"
                    src={preview.video}
                    poster={preview.poster}
                    muted
                    loop
                    autoPlay
                    playsInline
                    sx={{ ...mediaSx, position: 'absolute', inset: 0, transition: 'transform 0.3s ease' }}
                />
            )}
            <Box
                sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    p: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                }}
            >
                <Typography
                    component="span"
                    sx={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.25 }}
                >
                    {title}
                </Typography>
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', flexShrink: 0 }}>
                    <PlayArrow sx={{ fontSize: 16 }} aria-hidden="true" />
                    {demo ? 'Play' : 'Watch'}
                </Box>
            </Box>
        </Box>
    );
};

export default DemoTile;
