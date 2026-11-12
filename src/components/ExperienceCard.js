import React, { useState, useMemo, useCallback } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Collapse,
    Stack,
    CardActionArea,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Work } from '@mui/icons-material';
import experienceData from '../data/experience';
import experienceImages from '../data/experienceImages';
import { parseDate } from '../utils/dates';
import SectionHeader from './SectionHeader';
import CyclingMedia from './CyclingMedia';
import CausalityAnim from './CausalityAnim';

const initials = (name) =>
    name
        .split(/[\s-]+/)
        .filter((w) => /^[A-Za-z0-9]/.test(w))
        .map((w) => w[0].toUpperCase())
        .join('')
        .slice(0, 2);

// "September 2026" -> "Sep 2026"; "Present" stays as is.
const abbrev = (d) => d.replace(/^([A-Za-z]{3})[A-Za-z]* (\d{4})$/, '$1 $2');

const mediaBoxSx = {
    width: { xs: 72, sm: '100%' },
    height: { xs: 72, sm: 140 },
    flexShrink: 0,
    borderRadius: { xs: 1.5, sm: 0 },
    overflow: 'hidden',
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const TileMedia = ({ media, alt }) => {
    if (Array.isArray(media)) {
        return (
            <Box sx={mediaBoxSx}>
                <CyclingMedia items={media} label={alt} />
            </Box>
        );
    }
    if (media === 'causality-anim') {
        return (
            <Box sx={mediaBoxSx}>
                <CausalityAnim />
            </Box>
        );
    }
    return <Box component="img" src={media} alt={alt} sx={{ ...mediaBoxSx, objectFit: 'cover' }} />;
};

const Tile = ({ experience, open, onToggle }) => {
    const src = experienceImages[experience.image];
    return (
        <Card
            id={`exp-${experience.image || slug(experience.company)}`}
            sx={{
                height: '100%',
                border: (t) => `1px solid ${open ? t.palette.primary.main : t.palette.divider}`,
            }}
        >
            <CardActionArea
                onClick={onToggle}
                aria-expanded={open}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: { xs: 'row', sm: 'column' },
                    alignItems: { xs: 'center', sm: 'stretch' },
                    gap: { xs: 2, sm: 0 },
                    p: { xs: 1.5, sm: 0 },
                }}
            >
                {src ? (
                    <TileMedia media={src} alt={experience.company} />
                ) : (
                    <Box
                        aria-hidden="true"
                        sx={{
                            width: { xs: 72, sm: '100%' },
                            height: { xs: 72, sm: 140 },
                            flexShrink: 0,
                            borderRadius: { xs: 1.5, sm: 0 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.18 : 0.1),
                            color: (t) => (t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.main),
                            fontSize: { xs: '1.5rem', sm: '2.5rem' },
                            fontWeight: 700,
                        }}
                    >
                        {initials(experience.company)}
                    </Box>
                )}
                <Box sx={{ p: { xs: 0, sm: 2 }, flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {experience.company}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {experience.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
                        {abbrev(experience.startDate)} to {abbrev(experience.endDate)}
                    </Typography>
                </Box>
            </CardActionArea>
        </Card>
    );
};

const Detail = ({ experience, open }) => (
    <Box sx={{ gridColumn: '1 / -1' }}>
        <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 1 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6, whiteSpace: 'pre-line', mb: 2 }}
                >
                    {experience.description}
                </Typography>
                <Stack direction="row" useFlexGap flexWrap="wrap" sx={{ gap: 1 }}>
                    {[...(experience.link ? [{ label: 'Website', url: experience.link }] : []), ...(experience.links || [])].map((l) => (
                        <Chip
                            key={l.url}
                            component="a"
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            clickable
                            color="primary"
                            variant="outlined"
                            size="small"
                            label={l.label}
                        />
                    ))}
                    {experience.skills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" sx={{ fontWeight: 500, fontSize: '0.75rem' }} />
                    ))}
                </Stack>
            </Box>
        </Collapse>
    </Box>
);

const ExperienceCard = () => {
    const [expandedExperience, setExpandedExperience] = useState(null);
    const theme = useTheme();
    const md = useMediaQuery(theme.breakpoints.up('md'));
    const sm = useMediaQuery(theme.breakpoints.up('sm'));
    const cols = md ? 3 : sm ? 2 : 1;

    const handleExpandClick = useCallback((id) => {
        setExpandedExperience((current) => (current === id ? null : id));
    }, []);

    const sortedExperiences = useMemo(
        () =>
            [...experienceData]
                .filter((exp) => exp.title !== 'Graphic Designer')
                .sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate)),
        [],
    );

    // detail goes after the last tile of the open tile's row
    const openRowEnd =
        expandedExperience === null
            ? -1
            : Math.min((Math.floor(expandedExperience / cols) + 1) * cols, sortedExperiences.length) - 1;

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
                />

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 2,
                    }}
                >
                    {sortedExperiences.map((experience, index) => (
                        <React.Fragment key={`${experience.company}-${experience.startDate}`}>
                            <Tile
                                experience={experience}
                                open={expandedExperience === index}
                                onToggle={() => handleExpandClick(index)}
                            />
                            {index === openRowEnd && (
                                <Detail experience={sortedExperiences[expandedExperience]} open />
                            )}
                        </React.Fragment>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

export default ExperienceCard;
