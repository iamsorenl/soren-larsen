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
    useTheme,
} from '@mui/material';
import {
    Work,
    LocationOn,
    CalendarToday,
    ExpandMore,
    ExpandLess,
    OpenInNew,
    Business,
} from '@mui/icons-material';
import experienceData from '../data/experience';
import { SECTION_ACCENTS, resolveAccent } from '../theme/accents';
import SectionHeader from './SectionHeader';

const SECTION_ACCENT = SECTION_ACCENTS.experience;

const MONTHS = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};
const parseDate = (str) => {
    if (!str || str === 'Present') return Date.now();
    const [month, year] = str.split(' ');
    return new Date(parseInt(year, 10), MONTHS[month] ?? 0).getTime();
};

const ExperienceCard = () => {
    const [expandedExperience, setExpandedExperience] = useState(null);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const handleExpandClick = (id) => {
        setExpandedExperience(expandedExperience === id ? null : id);
    };

    const getCompanyColor = (experience) =>
        experience.highlightColor
            ? isDark ? experience.highlightColor.dark : experience.highlightColor.light
            : '#666666';

    const sortedExperiences = [...experienceData]
        .filter((exp) => exp.title !== 'Graphic Designer')
        .sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate));

    const sectionAccent = resolveAccent(SECTION_ACCENT, isDark);

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
                    eyebrow="Experience"
                    title="Where I've worked"
                    icon={<Work />}
                    accent={sectionAccent}
                />

                <Stack spacing={1.5}>
                    {sortedExperiences.map((experience, index) => {
                        const accent = getCompanyColor(experience);
                        const expanded = expandedExperience === index;
                        return (
                            <Card
                                key={`${experience.company}-${experience.startDate}`}
                                sx={{
                                    backgroundColor: 'background.paper',
                                    border: (t) => `1px solid ${t.palette.divider}`,
                                    transition: 'all 0.2s ease',
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
                                <CardContent
                                    sx={{ py: 2, px: 3, pl: 4, '&:last-child': { pb: 2 } }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: { xs: 'flex-start', sm: 'center' },
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: { xs: 1, sm: 0 },
                                        }}
                                    >
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: 'text.primary',
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {experience.title}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                    gap: { xs: 0.5, sm: 2 },
                                                    mt: 0.5,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Business
                                                        sx={{ fontSize: 14, mr: 0.5, color: accent }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ fontWeight: 600, color: accent }}
                                                    >
                                                        {experience.company}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <CalendarToday
                                                        sx={{
                                                            fontSize: 12,
                                                            mr: 0.5,
                                                            color: 'text.secondary',
                                                        }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {experience.startDate} - {experience.endDate}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: 0.5,
                                                flexShrink: 0,
                                                alignSelf: { xs: 'flex-end', sm: 'center' },
                                            }}
                                        >
                                            {experience.link && (
                                                <IconButton
                                                    component={Link}
                                                    href={experience.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    size="small"
                                                    aria-label={`Open ${experience.company} in a new tab`}
                                                    sx={{ color: accent }}
                                                >
                                                    <OpenInNew fontSize="small" />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                onClick={() => handleExpandClick(index)}
                                                size="small"
                                                aria-label={
                                                    expanded
                                                        ? `Collapse ${experience.title} details`
                                                        : `Expand ${experience.title} details`
                                                }
                                                aria-expanded={expanded}
                                                sx={{ color: accent }}
                                            >
                                                {expanded ? <ExpandLess /> : <ExpandMore />}
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                                        <Divider sx={{ my: 1.5 }} />
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <LocationOn
                                                sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }}
                                            />
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
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            useFlexGap
                                            flexWrap="wrap"
                                            sx={{ gap: 1 }}
                                        >
                                            {experience.skills.map((skill) => (
                                                <Chip
                                                    key={skill}
                                                    label={skill}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: accent,
                                                        color: 'white',
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Collapse>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default ExperienceCard;
