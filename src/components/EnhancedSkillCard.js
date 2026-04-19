import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Collapse,
    IconButton,
    Stack
} from '@mui/material';
import {
    Code,
    Psychology,
    Storage,
    Web,
    Cloud,
    Terminal,
    TextFields,
    ExpandMore,
    ExpandLess
} from '@mui/icons-material';
import skillsData from '../data/skills';

const EnhancedSkillCard = () => {
    const skillCategories = [
        {
            label: 'Languages',
            icon: <Code />,
            data: skillsData.languages,
            color: '#3776ab'
        },
        {
            label: 'AI / LLM Systems',
            icon: <Psychology />,
            data: skillsData.aiLlmSystems,
            color: '#9c27b0'
        },
        {
            label: 'Backend / APIs',
            icon: <Storage />,
            data: skillsData.backendApis,
            color: '#ff6f00'
        },
        {
            label: 'Frontend',
            icon: <Web />,
            data: skillsData.frontend,
            color: '#2196f3'
        },
        {
            label: 'Infra / DevOps',
            icon: <Cloud />,
            data: skillsData.infraDevops,
            color: '#4caf50'
        },
        {
            label: 'Developer Workflows',
            icon: <Terminal />,
            data: skillsData.developerWorkflows,
            color: '#607d8b'
        },
        {
            label: 'Applied NLP',
            icon: <TextFields />,
            data: skillsData.appliedNlp,
            color: '#ff5722'
        }
    ];

    const initialExpanded = {};
    skillCategories.forEach((_, index) => {
        initialExpanded[index] = true;
    });
    const [expanded, setExpanded] = useState(initialExpanded);

    const handleToggle = (index) => {
        setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <Card
            sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                height: '100%',
                width: '100%',
                mb: 1,
                borderRadius: '16px',
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1a237e 0%, #283593 100%)'
                    : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)'
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Code sx={{ mr: 2, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Technical Skills
                    </Typography>
                </Box>

                <Stack spacing={2}>
                    {skillCategories.map((category, index) => (
                        <Card
                            key={index}
                            sx={{
                                backgroundColor: 'background.paper',
                                backdropFilter: 'blur(10px)',
                                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    px: 2,
                                    py: 1.5,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                                onClick={() => handleToggle(index)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ color: category.color, display: 'flex', mr: 1 }}>
                                        {category.icon}
                                    </Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 600,
                                            color: 'text.primary'
                                        }}
                                    >
                                        {category.label}
                                    </Typography>
                                    <Chip
                                        label={category.data.length}
                                        size="small"
                                        sx={{
                                            ml: 1,
                                            height: 22,
                                            fontSize: '0.75rem',
                                            backgroundColor: category.color,
                                            color: 'white',
                                            fontWeight: 600
                                        }}
                                    />
                                </Box>
                                <IconButton
                                    size="small"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    {expanded[index] ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Box>
                            <Collapse in={expanded[index]}>
                                <Box sx={{ px: 2, pb: 2 }}>
                                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                                        {category.data.map((skill, skillIndex) => {
                                            const skillName = typeof skill === 'object' ? skill.name : skill;
                                            return (
                                                <Chip
                                                    key={skillIndex}
                                                    label={skillName}
                                                    sx={{
                                                        backgroundColor: category.color,
                                                        color: 'white',
                                                        fontWeight: 500,
                                                        '&:hover': {
                                                            backgroundColor: category.color,
                                                            opacity: 0.8
                                                        }
                                                    }}
                                                />
                                            );
                                        })}
                                    </Stack>
                                </Box>
                            </Collapse>
                        </Card>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default EnhancedSkillCard;
