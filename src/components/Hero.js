import React, { useEffect, useState } from 'react';
import {
    Box,
    Stack,
    Typography,
    Button,
    Avatar,
    Fade,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { Description, ContactMail, GitHub } from '@mui/icons-material';
import contact from '../data/contact';
import resumePDF from '../data/SorenLarsenResume.pdf';
import { ACCENT_PALETTE, resolveAccent } from '../theme/accents';

import headshot1 from '../images/Headshot1.jpg';
import headshot2 from '../images/Headshot2.jpg';
import turtle from '../images/Turtle.jpg';
import surf from '../images/Surf.jpg';
import halfdome from '../images/HalfDome.jpg';
import expressive from '../images/Expressive.JPG';
import peru from '../images/Peru.JPG';
import slugfest from '../images/SlugFest.JPG';
import caffeineHack from '../images/caffeine_hack.jpeg';
import posterPresentation from '../images/Poster_Presentation.JPG';
import frontierTower from '../images/FrontierTower.jpg';

const IMAGE_URLS = [
    headshot1,
    expressive,
    halfdome,
    headshot2,
    turtle,
    peru,
    slugfest,
    surf,
    caffeineHack,
    posterPresentation,
    frontierTower,
];
const INTERVAL_MS = 8000;

const scrollToContact = (event) => {
    event.preventDefault();
    const el = document.getElementById('contact');
    if (el) {
        window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
};

const TAGLINE =
    'An AI and full-stack engineer working at the intersection of NLP, product, and platform engineering.';

const Hero = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    // Theme primary in dark mode is #1a237e (near-black indigo), which
    // disappears into the hero's dark gradient on outlined buttons.
    // Use the lighter palette indigo so the CTAs read against both modes.
    const outlinedColor = resolveAccent(ACCENT_PALETTE.indigo, isDark);

    const [imgIndex, setImgIndex] = useState(0);
    useEffect(() => {
        const id = setInterval(
            () => setImgIndex((i) => (i + 1) % IMAGE_URLS.length),
            INTERVAL_MS,
        );
        return () => clearInterval(id);
    }, []);

    return (
        <Box
            component="section"
            aria-label="Introduction"
            sx={{
                py: { xs: 5, md: 7 },
                px: { xs: 3, md: 5 },
                borderRadius: '16px',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
                gap: { xs: 4, md: 5 },
                alignItems: 'center',
                background: isDark
                    ? 'linear-gradient(160deg, #0d1240 0%, #111827 100%)'
                    : 'linear-gradient(160deg, #eef0fb 0%, #f5f5f5 100%)',
                border: isDark
                    ? '1px solid rgba(121, 134, 203, 0.18)'
                    : '1px solid rgba(121, 134, 203, 0.25)',
            }}
        >
            <Box>
                <Typography
                    variant="overline"
                    sx={{
                        fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
                        color: isDark ? 'secondary.light' : 'primary.dark',
                        letterSpacing: '0.14em',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                    }}
                >
                    Portfolio
                </Typography>

                <Typography
                    component="h1"
                    sx={{
                        fontFamily: '"Fraunces", "Times New Roman", serif',
                        fontWeight: 700,
                        fontSize: { xs: '2.75rem', md: '4rem' },
                        lineHeight: 1.1,
                        color: 'text.primary',
                        mt: 0.5,
                    }}
                >
                    Soren Larsen
                </Typography>

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
                    AI &amp; Full-Stack Engineer
                    <Box
                        component="span"
                        aria-hidden="true"
                        sx={{
                            mx: 1.25,
                            color: isDark ? 'secondary.light' : 'primary.main',
                        }}
                    >
                        •
                    </Box>
                    Founding Engineer @ Levangie Laboratories
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        mt: 2.5,
                        maxWidth: 560,
                        color: 'text.secondary',
                        lineHeight: 1.6,
                    }}
                >
                    {TAGLINE}
                </Typography>

                <Stack
                    direction="row"
                    spacing={1.5}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ mt: 4 }}
                >
                    <Button
                        component="a"
                        href={resumePDF}
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
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifySelf: { xs: 'center', md: 'end' },
                }}
            >
                <Fade in key={imgIndex} timeout={1200}>
                    <Avatar
                        src={IMAGE_URLS[imgIndex]}
                        imgProps={{
                            loading: imgIndex === 0 ? 'eager' : 'lazy',
                            decoding: 'async',
                            alt: 'Soren Larsen',
                        }}
                        variant="rounded"
                        sx={{
                            width: isMobile ? 280 : 340,
                            height: isMobile ? 320 : 400,
                            borderRadius: '16px',
                            border: isDark
                                ? '4px solid rgba(255, 255, 255, 0.18)'
                                : '4px solid rgba(121, 134, 203, 0.30)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.22)',
                        }}
                    />
                </Fade>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                    {IMAGE_URLS.map((_, i) => (
                        <Box
                            key={i}
                            component="button"
                            onClick={() => setImgIndex(i)}
                            aria-label={`Show photo ${i + 1} of ${IMAGE_URLS.length}`}
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                border: 'none',
                                p: 0,
                                cursor: 'pointer',
                                backgroundColor:
                                    i === imgIndex
                                        ? isDark
                                            ? 'rgba(255,255,255,0.85)'
                                            : 'primary.main'
                                        : isDark
                                          ? 'rgba(255,255,255,0.28)'
                                          : 'rgba(121,134,203,0.40)',
                                transition: 'background-color 0.3s ease',
                                '&:focus-visible': {
                                    outline: '2px solid',
                                    outlineColor: isDark ? 'secondary.light' : 'primary.main',
                                    outlineOffset: 2,
                                },
                            }}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default Hero;
