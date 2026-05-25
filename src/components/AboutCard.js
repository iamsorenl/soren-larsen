import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Stack } from '@mui/material';
import {
    Person,
    School,
    Work,
    Code,
    Psychology,
    SurfingOutlined,
} from '@mui/icons-material';
import { GiSpermWhale } from 'react-icons/gi';
import about from '../data/about';
import highlightsData from '../data/highlights';

const ICON_MAP = {
    School: <School />,
    Work: <Work />,
    Code: <Code />,
    Psychology: <Psychology />,
    SurfingOutlined: <SurfingOutlined />,
    FaWhale: <GiSpermWhale />,
};

const renderHighlightIcon = (iconName) => ICON_MAP[iconName] || <Person />;

const AboutCard = () => {
    const highlights = highlightsData.map((h) => ({
        icon: renderHighlightIcon(h.icon),
        text: h.text,
        color: h.color,
    }));

    return (
        <Card
            sx={{
                backgroundColor: 'background.paper',
                borderRadius: '16px',
                border: (theme) =>
                    `1px solid ${
                        theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.08)'
                    }`,
            }}
        >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Person sx={{ mr: 2, fontSize: 28, color: 'text.primary' }} />
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: 'text.primary' }}
                    >
                        About
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="overline"
                        sx={{
                            fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
                            color: 'text.secondary',
                            letterSpacing: '0.12em',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                        }}
                    >
                        Quick Highlights
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mt: 1.5, gap: 1 }}
                    >
                        {highlights.map((h, i) => (
                            <Chip
                                key={i}
                                icon={h.icon}
                                label={h.text}
                                sx={{
                                    backgroundColor: h.color,
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.85rem',
                                    '& .MuiChip-icon': { color: 'white' },
                                }}
                            />
                        ))}
                    </Stack>
                </Box>

                <Typography
                    variant="body1"
                    sx={{
                        color: 'text.primary',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-line',
                    }}
                >
                    {about[0].about}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default AboutCard;
