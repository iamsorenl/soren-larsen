import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Collapse,
    Stack,
    Divider,
    Link,
    IconButton,
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

const ExperienceCard = () => {
    const [expandedExperience, setExpandedExperience] = useState(null);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const handleExpandClick = (id) => {
        setExpandedExperience(expandedExperience === id ? null : id);
    };

    const getCompanyColor = (experience, dark = false) => {
        if (experience.highlightColor) {
            return dark ? experience.highlightColor.dark : experience.highlightColor.light;
        }
        return '#666666';
    };

    const formatDateRange = (startDate, endDate) => {
        return `${startDate} - ${endDate}`;
    };

    // Filter out Graphic Designer and sort chronologically (newest first)
    const sortedExperiences = [...experienceData]
        .filter((exp) => exp.title !== 'Graphic Designer')
        .sort((a, b) => {
            const parseDate = (str) => {
                if (!str || str === 'Present') return Date.now();
                const parts = str.split(' ');
                const months = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11, Jan: 0, Feb: 1, Mar: 2, Apr: 3, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
                return new Date(parseInt(parts[1]), months[parts[0]] || 0).getTime();
            };
            return parseDate(b.startDate) - parseDate(a.startDate);
        });

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

                <Box
                    sx={{
                        maxHeight: 600,
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '3px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '3px',
                            '&:hover': { background: 'rgba(255, 255, 255, 0.5)' }
                        }
                    }}
                >
                    {sortedExperiences.map((experience, index) => (
                        <Card
                            key={index}
                            sx={{
                                mb: 1.5,
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
                            <CardContent sx={{ py: 2, px: 3, pl: 4, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 700,
                                                color: 'text.primary',
                                                lineHeight: 1.3
                                            }}
                                        >
                                            {experience.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Business sx={{ fontSize: 14, mr: 0.5, color: getCompanyColor(experience, isDark) }} />
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600, color: getCompanyColor(experience, isDark) }}
                                                >
                                                    {experience.company}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CalendarToday sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDateRange(experience.startDate, experience.endDate)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                                        {experience.link && (
                                            <IconButton
                                                component={Link}
                                                href={experience.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="small"
                                                sx={{
                                                    color: isDark ? '#64b5f6' : 'primary.main',
                                                    '&:hover': { backgroundColor: isDark ? 'rgba(100, 181, 246, 0.1)' : 'rgba(26, 35, 126, 0.1)' }
                                                }}
                                            >
                                                <OpenInNew fontSize="small" />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            onClick={() => handleExpandClick(index)}
                                            size="small"
                                            sx={{
                                                color: isDark ? '#64b5f6' : 'primary.main',
                                                '&:hover': { backgroundColor: isDark ? 'rgba(100, 181, 246, 0.1)' : 'rgba(26, 35, 126, 0.1)' }
                                            }}
                                        >
                                            {expandedExperience === index ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Collapse in={expandedExperience === index} timeout="auto" unmountOnExit>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <LocationOn sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {experience.location}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ lineHeight: 1.6, whiteSpace: 'pre-line', mb: 2 }}
                                    >
                                        {experience.description}
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
                                </Collapse>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

export default ExperienceCard;
