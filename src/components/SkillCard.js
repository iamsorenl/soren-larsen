import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Collapse,
    IconButton,
    Stack,
    useTheme,
} from '@mui/material';
import {
    Code,
    Psychology,
    Extension,
    Cloud,
    Terminal,
    TextFields,
    ExpandMore,
    ExpandLess,
} from '@mui/icons-material';
import skillsData from '../data/skills';
import {
    ACCENT_PALETTE,
    SECTION_ACCENTS,
    resolveAccent,
} from '../theme/accents';
import SectionHeader from './SectionHeader';

const CATEGORIES = [
    {
        key: 'languages',
        label: 'Languages',
        icon: <Code />,
        accent: ACCENT_PALETTE.indigo,
        data: skillsData.languages,
    },
    {
        key: 'aiLlmSystems',
        label: 'AI / LLM Systems',
        icon: <Psychology />,
        accent: ACCENT_PALETTE.coral,
        data: skillsData.aiLlmSystems,
    },
    {
        key: 'frameworks',
        label: 'Frameworks',
        icon: <Extension />,
        accent: ACCENT_PALETTE.sage,
        data: skillsData.frameworks,
    },
    {
        key: 'dataInfra',
        label: 'Data & Infra',
        icon: <Cloud />,
        accent: ACCENT_PALETTE.cyan,
        data: skillsData.dataInfra,
    },
    {
        key: 'mlNlpResearch',
        label: 'ML / NLP Research',
        icon: <TextFields />,
        accent: ACCENT_PALETTE.gold,
        data: skillsData.mlNlpResearch,
    },
    {
        key: 'developerWorkflows',
        label: 'Developer Workflows',
        icon: <Terminal />,
        accent: ACCENT_PALETTE.indigo,
        data: skillsData.developerWorkflows,
    },
];

const SkillCard = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const sectionAccent = resolveAccent(SECTION_ACCENTS.skills, isDark);

    const [expanded, setExpanded] = useState(() =>
        Object.fromEntries(CATEGORIES.map((c) => [c.key, true])),
    );

    const handleToggle = (key) => {
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Card
            sx={{
                backgroundColor: 'background.paper',
                borderRadius: '16px',
                border: (t) =>
                    `1px solid ${
                        t.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.08)'
                    }`,
            }}
        >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <SectionHeader
                    eyebrow="Technical Skills"
                    title="What I work with"
                    icon={<Code />}
                    accent={sectionAccent}
                />

                <Stack spacing={1.25}>
                    {CATEGORIES.map((category) => {
                        const accent = resolveAccent(category.accent, isDark);
                        const isOpen = expanded[category.key];
                        return (
                            <Card
                                key={category.key}
                                sx={{
                                    backgroundColor: 'background.paper',
                                    border: (t) => `1px solid ${t.palette.divider}`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '4px',
                                        backgroundColor: accent,
                                    },
                                }}
                            >
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => handleToggle(category.key)}
                                    aria-expanded={isOpen}
                                    aria-controls={`${category.key}-skills`}
                                    sx={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        px: 3,
                                        pl: 4,
                                        py: 1.5,
                                        cursor: 'pointer',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        textAlign: 'left',
                                        font: 'inherit',
                                        color: 'inherit',
                                        '&:hover': { backgroundColor: 'action.hover' },
                                        '&:focus-visible': {
                                            outline: `2px solid ${accent}`,
                                            outlineOffset: -2,
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box
                                            aria-hidden="true"
                                            sx={{
                                                color: accent,
                                                display: 'inline-flex',
                                                mr: 1.25,
                                                '& > *': { fontSize: 22 },
                                            }}
                                        >
                                            {category.icon}
                                        </Box>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 600, color: 'text.primary' }}
                                        >
                                            {category.label}
                                        </Typography>
                                        <Chip
                                            label={category.data.length}
                                            size="small"
                                            sx={{
                                                ml: 1.25,
                                                height: 22,
                                                fontSize: '0.75rem',
                                                backgroundColor: accent,
                                                color: 'white',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>
                                    <IconButton
                                        component="span"
                                        size="small"
                                        sx={{ color: 'text.secondary', pointerEvents: 'none' }}
                                        tabIndex={-1}
                                    >
                                        {isOpen ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                </Box>
                                <Collapse in={isOpen} id={`${category.key}-skills`}>
                                    <Box sx={{ px: 3, pl: 4, pb: 2 }}>
                                        <Stack
                                            direction="row"
                                            useFlexGap
                                            flexWrap="wrap"
                                            sx={{ gap: 1 }}
                                        >
                                            {category.data.map((skill, i) => {
                                                const skillName =
                                                    typeof skill === 'object' ? skill.name : skill;
                                                return (
                                                    <Chip
                                                        key={`${category.key}-${i}`}
                                                        label={skillName}
                                                        sx={{
                                                            backgroundColor: accent,
                                                            color: 'white',
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                </Collapse>
                            </Card>
                        );
                    })}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default SkillCard;
