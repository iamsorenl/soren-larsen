import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Chip,
    Tab,
    Tabs,
    Stack,
    LinearProgress,
    useTheme
} from '@mui/material';
import {
    Code,
    Storage,
    Build,
    Psychology,
    School
} from '@mui/icons-material';
import skillsData from '../data/skills';

const EnhancedSkillCard = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const theme = useTheme();

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const skillCategories = [
        {
            label: 'Languages',
            icon: <Code />,
            data: skillsData.languages,
            color: '#3776ab'
        },
        {
            label: 'Frameworks & Databases',
            icon: <Storage />,
            data: skillsData.frameworksDatabases,
            color: '#ff6f00'
        },
        {
            label: 'Developer Tools',
            icon: <Build />,
            data: skillsData.developerTools,
            color: '#4caf50'
        },
        {
            label: 'Development Practices',
            icon: <School />,
            data: skillsData.developmentPractices,
            color: '#9c27b0'
        },
        {
            label: 'Soft Skills',
            icon: <Psychology />,
            data: skillsData.softSkills,
            color: '#ff5722'
        }
    ];

    const getSkillLevel = (skill) => {
        // Define skill levels based on your expertise
        const expertSkills = ['Python', 'React', 'JavaScript', 'Machine Learning (ML)', 'Natural Language Processing (NLP)', 'PyTorch', 'TensorFlow'];
        const advancedSkills = ['Node.js', 'Git/GitHub', 'Scikit-Learn', 'Pandas', 'NumPy', 'Full-Stack Development', 'Agile Methodologies'];
        const intermediateSkills = ['C', 'C++', 'Java', 'SQL', 'Docker', 'PostgreSQL', 'Firebase'];
        
        if (expertSkills.includes(skill)) return { level: 90, label: 'Expert' };
        if (advancedSkills.includes(skill)) return { level: 75, label: 'Advanced' };
        if (intermediateSkills.includes(skill)) return { level: 60, label: 'Intermediate' };
        return { level: 45, label: 'Familiar' };
    };

    const renderSkillChips = (skills, color) => (
        <Grid container spacing={1}>
            {skills.map((skill, index) => {
                const skillInfo = getSkillLevel(skill);
                return (
                    <Grid item key={index}>
                        <Box sx={{ mb: 2, minWidth: 200 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {skill}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {skillInfo.label}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={skillInfo.level}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: color,
                                        borderRadius: 3,
                                    }
                                }}
                            />
                        </Box>
                    </Grid>
                );
            })}
        </Grid>
    );

    const renderSimpleChips = (skills, color) => (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {skills.map((skill, index) => (
                <Chip
                    key={index}
                    label={skill}
                    sx={{
                        backgroundColor: color,
                        color: 'white',
                        fontWeight: 500,
                        '&:hover': {
                            backgroundColor: color,
                            opacity: 0.8
                        }
                    }}
                />
            ))}
        </Stack>
    );

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

                <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.2)', mb: 3 }}>
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 500,
                                minHeight: 48,
                                '&.Mui-selected': {
                                    color: 'white',
                                    fontWeight: 600
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'white',
                                height: 3
                            }
                        }}
                    >
                        {skillCategories.map((category, index) => (
                            <Tab
                                key={index}
                                icon={category.icon}
                                label={category.label}
                                iconPosition="start"
                                sx={{ textTransform: 'none' }}
                            />
                        ))}
                    </Tabs>
                </Box>

                <Card 
                    sx={{ 
                        backgroundColor: 'background.paper',
                        backdropFilter: 'blur(10px)',
                        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                        minHeight: 300
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            {skillCategories[selectedTab].icon}
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    ml: 1, 
                                    fontWeight: 600,
                                    color: skillCategories[selectedTab].color
                                }}
                            >
                                {skillCategories[selectedTab].label}
                            </Typography>
                        </Box>
                        
                        {selectedTab < 3 ? 
                            renderSkillChips(skillCategories[selectedTab].data, skillCategories[selectedTab].color) :
                            renderSimpleChips(skillCategories[selectedTab].data, skillCategories[selectedTab].color)
                        }
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
};

export default EnhancedSkillCard;
