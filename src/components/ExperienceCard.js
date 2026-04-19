import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Chip,
    Collapse,
    Stack,
    Divider,
    Link,
    IconButton,
    Tabs,
    Tab,
    useTheme
} from '@mui/material';
import {
    Work,
    LocationOn,
    CalendarToday,
    ExpandMore,
    ExpandLess,
    OpenInNew,
    Business
} from '@mui/icons-material';
import experienceData from '../data/experience';

const TABS = [
    { label: 'Professional', value: 'professional' },
    { label: 'Teaching & Advising', value: 'teaching' },
    { label: 'Other Experience', value: 'other' }
];

const ExperienceCard = () => {
    const [expandedExperience, setExpandedExperience] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const handleExpandClick = (id) => {
        setExpandedExperience(expandedExperience === id ? null : id);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setExpandedExperience(null);
    };

    const filteredExperiences = experienceData.filter(
        (exp) => exp.category === TABS[activeTab].value
    );

    const getCompanyColor = (experience, dark = false) => {
        if (experience.highlightColor) {
            return dark ? experience.highlightColor.dark : experience.highlightColor.light;
        }
        return '#666666';
    };

    const formatDateRange = (startDate, endDate) => {
        return `${startDate} - ${endDate}`;
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
                background: (t) => t.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1a237e 0%, #283593 100%)'
                    : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)'
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Work sx={{ mr: 2, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Experience
                    </Typography>
                </Box>

                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        mb: 3,
                        minHeight: 40,
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#fff',
                            height: 3,
                            borderRadius: '3px 3px 0 0'
                        },
                        '& .MuiTabs-scrollButtons': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-disabled': {
                                opacity: 0.3
                            }
                        },
                        '& .MuiTab-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            minHeight: 40,
                            px: 2,
                            '&.Mui-selected': {
                                color: '#fff'
                            }
                        }
                    }}
                >
                    {TABS.map((tab) => (
                        <Tab key={tab.value} label={tab.label} />
                    ))}
                </Tabs>

                <Box>
                    <Grid container spacing={2}>
                        {filteredExperiences.map((experience, index) => {
                            const cardId = `${activeTab}-${index}`;
                            return (
                                <Grid item xs={12} key={cardId}>
                                    <Card
                                        sx={{
                                            mb: 2,
                                            backgroundColor: 'background.paper',
                                            backdropFilter: 'blur(10px)',
                                            border: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: '4px',
                                                backgroundColor: getCompanyColor(experience, isDark),
                                                borderRadius: '0 4px 4px 0'
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ p: 3, pl: 4 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: 'text.primary',
                                                            mb: 0.5,
                                                            lineHeight: 1.3
                                                        }}
                                                    >
                                                        {experience.title}
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <Business sx={{ fontSize: 16, mr: 1, color: getCompanyColor(experience, isDark) }} />
                                                        <Typography
                                                            variant="subtitle1"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: getCompanyColor(experience, isDark)
                                                            }}
                                                        >
                                                            {experience.company}
                                                        </Typography>
                                                    </Box>

                                                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <LocationOn sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {experience.location}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <CalendarToday sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {formatDateRange(experience.startDate, experience.endDate)}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>

                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    {experience.link && (
                                                        <IconButton
                                                            component={Link}
                                                            href={experience.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            size="small"
                                                            sx={{
                                                                color: isDark ? '#64b5f6' : 'primary.main',
                                                                backgroundColor: isDark ? 'rgba(100, 181, 246, 0.1)' : 'rgba(26, 35, 126, 0.1)',
                                                                '&:hover': {
                                                                    backgroundColor: isDark ? 'rgba(100, 181, 246, 0.2)' : 'rgba(26, 35, 126, 0.2)',
                                                                    transform: 'scale(1.1)'
                                                                }
                                                            }}
                                                        >
                                                            <OpenInNew fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                    <IconButton
                                                        onClick={() => handleExpandClick(cardId)}
                                                        size="small"
                                                        sx={{
                                                            color: isDark ? '#64b5f6' : 'primary.main',
                                                            backgroundColor: isDark ? 'rgba(100, 181, 246, 0.1)' : 'rgba(26, 35, 126, 0.1)',
                                                            '&:hover': {
                                                                backgroundColor: isDark ? 'rgba(100, 181, 246, 0.2)' : 'rgba(26, 35, 126, 0.2)',
                                                                transform: 'scale(1.1)'
                                                            }
                                                        }}
                                                    >
                                                        {expandedExperience === cardId ? <ExpandLess /> : <ExpandMore />}
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            <Box sx={{ mb: 2 }}>
                                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                    {experience.skills.slice(0, 4).map((skill, skillIndex) => (
                                                        <Chip
                                                            key={skillIndex}
                                                            label={skill}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: getCompanyColor(experience, isDark),
                                                                color: 'white',
                                                                fontWeight: 500,
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    ))}
                                                    {experience.skills.length > 4 && (
                                                        <Chip
                                                            label={`+${experience.skills.length - 4} more`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.75rem' }}
                                                        />
                                                    )}
                                                </Stack>
                                            </Box>

                                            <Collapse in={expandedExperience === cardId} timeout="auto" unmountOnExit>
                                                <Divider sx={{ mb: 2 }} />
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                                        Key Responsibilities & Achievements:
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            lineHeight: 1.6,
                                                            whiteSpace: 'pre-line',
                                                            mb: 2
                                                        }}
                                                    >
                                                        {experience.description}
                                                    </Typography>

                                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                                        Skills Developed:
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                        {experience.skills.map((skill, skillIndex) => (
                                                            <Chip
                                                                key={skillIndex}
                                                                label={skill}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: getCompanyColor(experience, isDark),
                                                                    color: 'white',
                                                                    fontWeight: 500,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            />
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            </Collapse>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ExperienceCard;
