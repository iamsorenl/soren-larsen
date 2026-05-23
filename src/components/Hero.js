import React from 'react';
import { Box, Stack, Typography, Button, useTheme } from '@mui/material';
import { Description, Email, GitHub } from '@mui/icons-material';
import contact from '../data/contact';
import resumePDF from '../data/SorenLarsenResume.pdf';

const TAGLINE =
    'An AI and full-stack engineer working at the intersection of NLP, product, and platform engineering.';

const Hero = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box
            component="section"
            aria-label="Introduction"
            sx={{
                py: { xs: 5, md: 7 },
                px: { xs: 3, md: 5 },
                borderRadius: '16px',
                background: isDark
                    ? 'linear-gradient(160deg, #0d1240 0%, #111827 100%)'
                    : 'linear-gradient(160deg, #eef0fb 0%, #f5f5f5 100%)',
                border: isDark
                    ? '1px solid rgba(121, 134, 203, 0.18)'
                    : '1px solid rgba(121, 134, 203, 0.25)',
            }}
        >
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
                    maxWidth: 620,
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
                    href={`mailto:${contact[0].email}`}
                    variant="outlined"
                    startIcon={<Email />}
                    sx={{ px: 3 }}
                >
                    Email
                </Button>
                <Button
                    component="a"
                    href={contact[0].github}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    startIcon={<GitHub />}
                    sx={{ px: 3 }}
                >
                    GitHub
                </Button>
            </Stack>
        </Box>
    );
};

export default Hero;
