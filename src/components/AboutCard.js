import React from 'react';
import { Box, Typography, Stack, useTheme } from '@mui/material';
import about from '../data/about';
import { ACCENT_PALETTE, resolveAccent } from '../theme/accents';

const AboutCard = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const accent = resolveAccent(ACCENT_PALETTE.indigo, isDark);

    const paragraphs = about[0].about.split('\n\n').slice(1);
    const closingIndex = paragraphs.length - 1;

    return (
        <Box
            component="section"
            aria-label="About Soren"
            sx={{
                py: { xs: 1, md: 2 },
                px: { xs: 3, md: 5 },
                position: 'relative',
                borderLeft: `4px solid ${accent}`,
                ml: { xs: 0, md: 1 },
            }}
        >
            <Stack spacing={2.5}>
                {paragraphs.map((p, i) => (
                    <Typography
                        key={i}
                        variant="body1"
                        sx={{
                            color: 'text.primary',
                            lineHeight: 1.75,
                            fontSize: { xs: '1.0625rem', md: '1.125rem' },
                            fontStyle: i === closingIndex ? 'italic' : 'normal',
                            ...(i === closingIndex && {
                                color: 'text.secondary',
                            }),
                        }}
                    >
                        {p}
                    </Typography>
                ))}
            </Stack>
        </Box>
    );
};

export default AboutCard;
