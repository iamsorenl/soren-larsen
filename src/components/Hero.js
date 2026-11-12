import React from 'react';
import {
    Box,
    Stack,
    Typography,
    Button,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Description, ContactMail, GitHub } from '@mui/icons-material';
import contact from '../data/contact';
import { FONT_DISPLAY, FONT_MONO } from '../theme';
import GlowMark from './GlowMark';
import CyclingMedia from './CyclingMedia';
import about from '../data/about.json';
import heroPhotos from '../data/heroPhotos';

const INTERVAL_MS = 8000;
const BIO = about[0].about.split('\n\n');

// Ambient swell lines in the hero's empty side margins (lg+). Each line is a
// seamless 400px wave tile slid left by one period with a CSS transform, so it
// loops without JS. Masked out of the center so the copy stays clean.
const PERIOD = 400;
const SWELLS = [
    { top: '18%', amp: 10, dur: 38, op: 0.35 },
    { top: '34%', amp: 14, dur: 52, op: 0.25 },
    { top: '52%', amp: 9, dur: 30, op: 0.4 },
    { top: '68%', amp: 16, dur: 64, op: 0.22 },
    { top: '84%', amp: 11, dur: 44, op: 0.3 },
];
const waveTile = (amp, color) => {
    const h = amp * 2 + 4;
    const m = h / 2;
    const d = `M0 ${m} C100 ${m - amp} 100 ${m - amp} 200 ${m} S300 ${m + amp} 400 ${m}`;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${PERIOD}' height='${h}'><path d='${d}' fill='none' stroke='${color}' stroke-width='1.5'/></svg>`;
    return { url: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, h };
};

const SwellLines = ({ color, reduced }) => (
    <Box
        aria-hidden="true"
        data-testid="hero-swells"
        sx={{
            display: { xs: 'none', lg: 'block' },
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            maskImage: 'linear-gradient(to right, #000 0%, transparent 28%, transparent 72%, #000 100%)',
            '@keyframes swellDrift': { from: { transform: 'translateX(0)' }, to: { transform: `translateX(-${PERIOD}px)` } },
        }}
    >
        {SWELLS.map((w) => {
            const t = waveTile(w.amp, color);
            return (
                <Box
                    key={w.top}
                    sx={{
                        position: 'absolute',
                        top: w.top,
                        left: 0,
                        width: `calc(100% + ${PERIOD}px)`,
                        height: t.h,
                        backgroundImage: t.url,
                        backgroundRepeat: 'repeat-x',
                        opacity: w.op,
                        animation: reduced ? 'none' : `swellDrift ${w.dur}s linear infinite`,
                    }}
                />
            );
        })}
    </Box>
);

const scrollToContact = (event) => {
    event.preventDefault();
    const el = document.getElementById('contact');
    if (el) {
        window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
};

const Hero = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const outlinedColor = theme.palette.primary.main;

    return (
        <Box
            component="section"
            aria-label="Introduction"
            sx={{
                py: { xs: 4, md: 5 },
                px: { xs: 2.5, sm: 3, md: 5 },
                borderRadius: '16px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: { xs: 4, md: 5 },
                background: isDark
                    ? 'linear-gradient(160deg, #0d1240 0%, #111827 100%)'
                    : 'linear-gradient(160deg, #eef0fb 0%, #f5f5f5 100%)',
                border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.3)}`,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <SwellLines color={isDark ? theme.palette.primary.light : theme.palette.primary.main} reduced={reduced} />
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' },
                    maxWidth: { md: 960 },
                    width: '100%',
                    mx: 'auto',
                    gap: { xs: 4, md: 5 },
                    alignItems: 'center',
                    position: 'relative',
                }}
            >
            <Box>
                <Typography
                    variant="overline"
                    sx={{
                        fontFamily: FONT_MONO,
                        color: isDark ? 'primary.light' : 'primary.dark',
                        letterSpacing: '0.14em',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                    }}
                >
                    Portfolio
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1.5, md: 2 },
                        mt: 0.5,
                    }}
                >
                    <Typography
                        component="h1"
                        sx={{
                            fontFamily: FONT_DISPLAY,
                            fontWeight: 700,
                            fontSize: { xs: '2rem', sm: '2.75rem', md: '4rem' },
                            lineHeight: 1.1,
                            color: 'text.primary',
                        }}
                    >
                        Soren Larsen
                    </Typography>
                    <GlowMark variant="accent" size={32} />
                </Box>

                <Typography
                    component="p"
                    sx={{
                        fontWeight: 400,
                        color: isDark ? 'grey.300' : 'grey.700',
                        mt: 1,
                        fontSize: { xs: '1rem', md: '1.25rem' },
                        lineHeight: 1.5,
                    }}
                >
                    <Box component="span" sx={{ display: { xs: 'block', sm: 'inline' } }}>
                        AI &amp; Full-Stack Engineer
                    </Box>
                    <Box
                        component="span"
                        aria-hidden="true"
                        sx={{
                            display: { xs: 'none', sm: 'inline' },
                            mx: 1.25,
                            color: isDark ? 'primary.light' : 'primary.main',
                        }}
                    >
                        •
                    </Box>
                    Product Engineer
                </Typography>

                <Box sx={{ mt: 2.5, maxWidth: 600 }}>
                    {BIO.map((para, i) => (
                        <Typography
                            key={para}
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                lineHeight: 1.6,
                                mt: i ? 1.25 : 0,
                                ...(i === BIO.length - 1 && i > 1 && { fontStyle: 'italic' }),
                            }}
                        >
                            {para}
                        </Typography>
                    ))}
                </Box>

                <Stack
                    direction="row"
                    spacing={1.5}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ mt: 4 }}
                >
                    <Button
                        component="a"
                        href="/SorenLarsenResume.pdf"
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        startIcon={<Description />}
                        sx={{ px: 3 }}
                    >
                        Resume
                    </Button>
                    <Button
                        component="a"
                        href="#contact"
                        onClick={scrollToContact}
                        variant="outlined"
                        startIcon={<ContactMail />}
                        sx={{
                            px: 3,
                            color: outlinedColor,
                            borderColor: outlinedColor,
                            '&:hover': {
                                borderColor: outlinedColor,
                                backgroundColor: `${outlinedColor}1A`,
                            },
                        }}
                    >
                        Contact
                    </Button>
                    <Button
                        component="a"
                        href={contact[0].github}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        startIcon={<GitHub />}
                        sx={{
                            px: 3,
                            color: outlinedColor,
                            borderColor: outlinedColor,
                            '&:hover': {
                                borderColor: outlinedColor,
                                backgroundColor: `${outlinedColor}1A`,
                            },
                        }}
                    >
                        GitHub
                    </Button>
                </Stack>
            </Box>

            <Box
                sx={{
                    width: '100%',
                    maxWidth: isMobile ? 280 : 340,
                    height: isMobile ? 320 : 400,
                    justifySelf: 'center',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: `4px solid ${alpha(theme.palette.primary.main, isDark ? 0.35 : 0.3)}`,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.22)',
                }}
            >
                <CyclingMedia items={heroPhotos} intervalMs={INTERVAL_MS} label="Photos of Soren" counter tooltip />
            </Box>
            </Box>
        </Box>
    );
};

export default Hero;
