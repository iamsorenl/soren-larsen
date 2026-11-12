import React, { useState, useMemo, useCallback } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Dialog,
    IconButton,
    Slide,
    Stack,
    CardActionArea,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Work, Close, Language, Instagram, GitHub, PlayCircleOutline, NorthEast } from '@mui/icons-material';
import experienceData from '../data/experience';
import experienceImages from '../data/experienceImages';
import { parseDate } from '../utils/dates';
import SectionHeader from './SectionHeader';
import { FONT_DISPLAY } from '../theme';
import CyclingMedia from './CyclingMedia';
import CausalityAnim from './CausalityAnim';
import SlugAnim from './SlugAnim';
import BoardalSquares from './BoardalSquares';
import ContributionGraph from './ContributionGraph';
import contributions from '../data/contributions.json';

const initials = (name) =>
    name
        .split(/[\s-]+/)
        .filter((w) => /^[A-Za-z0-9]/.test(w))
        .map((w) => w[0].toUpperCase())
        .join('')
        .slice(0, 2);

// "September 2026" -> "Sep 2026"; "Present" stays as is.
const abbrev = (d) => d.replace(/^([A-Za-z]{3})[A-Za-z]* (\d{4})$/, '$1 $2');

const tileBoxSx = {
    width: { xs: 72, sm: '100%' },
    height: { xs: 72, sm: 140 },
    flexShrink: 0,
    borderRadius: { xs: 1.5, sm: 0 },
    overflow: 'hidden',
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const TileMedia = ({ media, alt, small, hovered, boxSx }) => {
    const mediaBoxSx = boxSx || tileBoxSx;
    if (Array.isArray(media)) {
        return (
            <Box sx={mediaBoxSx}>
                <CyclingMedia items={media} label={alt} small={small} hovered={hovered} />
            </Box>
        );
    }
    if (media && media.pair) {
        const shown = small ? media.pair.slice(0, 1) : media.pair;
        return (
            <Box sx={{ ...mediaBoxSx, display: 'flex', gap: '6px', bgcolor: '#000' }}>
                {shown.map((m) => (
                    <Box key={m.src} component="img" src={m.src} alt={m.alt} loading="lazy"
                        sx={{ flex: 1, minWidth: 0, height: '100%', objectFit: 'cover', objectPosition: m.pos }} />
                ))}
            </Box>
        );
    }
    if (media === 'boardal-squares') {
        return (
            <Box sx={mediaBoxSx}>
                <BoardalSquares full={!small} />
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
    if (media === 'slug-anim') {
        return (
            <Box sx={mediaBoxSx}>
                <SlugAnim />
            </Box>
        );
    }
    if (media === 'github-graph') {
        return (
            <Box sx={mediaBoxSx}>
                <ContributionGraph days={contributions.days} total={contributions.total} />
            </Box>
        );
    }
    return <Box component="img" src={media} alt={alt} sx={{ ...mediaBoxSx, objectFit: 'cover' }} />;
};

// The toggle is a stretched overlay (zIndex 1) so slideshow controls (zIndex 2)
// aren't nested inside a button.
const Tile = ({ experience, open, onToggle }) => {
    const src = experienceImages[experience.image];
    const small = !useMediaQuery(useTheme().breakpoints.up('sm'));
    const [hovered, setHovered] = useState(false);
    return (
        <Card
            component="article"
            aria-label={experience.company}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                height: '100%',
                position: 'relative',
                '&:hover .cm-arrow': { opacity: 1 },
                border: (t) => `1px solid ${open ? t.palette.primary.main : t.palette.divider}`,
            }}
        >
            <CardActionArea
                id={`exp-${experience.image || slug(experience.company)}`}
                onClick={onToggle}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-label={`${experience.company}, ${experience.title}`}
                sx={{ position: 'absolute', inset: 0, zIndex: 1 }}
            />
            <Box
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
                    <TileMedia media={src} alt={experience.company} small={small} hovered={hovered} />
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
            </Box>
        </Card>
    );
};

// Links get their own row of real buttons: an icon for where it goes, the
// label, and the domain, so they never read as one more skill chip.
const linkIcon = (url) => {
    if (url.includes('instagram.com')) return <Instagram />;
    if (url.includes('github.com')) return <GitHub />;
    if (url.startsWith('/') || /\.mp4$/.test(url)) return <PlayCircleOutline />;
    return <Language />;
};
const domain = (url) => (url.startsWith('http') ? new URL(url).hostname.replace(/^www\./, '') : null);

const LinkButton = ({ label, url }) => {
    const host = domain(url);
    return (
        <Button
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={linkIcon(url)}
            endIcon={<NorthEast aria-hidden="true" sx={{ fontSize: '14px !important', transition: 'transform .2s' }} />}
            sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '10px',
                px: 1.75,
                '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.12) },
                '&:hover .MuiButton-endIcon svg': { transform: 'translate(2px, -2px)' },
            }}
        >
            {label}
            {host && (
                <Box component="span" aria-hidden="true" sx={{ ml: 1, fontWeight: 400, opacity: 0.7, fontSize: '0.8rem' }}>
                    {host}
                </Box>
            )}
        </Button>
    );
};

const SlideUp = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

// Focused card over a dimmed page; a bottom sheet on phones. MUI's modal gives
// Esc/backdrop close, a focus trap, and returns focus to the tile on close.
const Detail = ({ experience, onClose }) => {
    const small = !useMediaQuery(useTheme().breakpoints.up('sm'));
    const src = experience && experienceImages[experience.image];
    const links = experience
        ? [...(experience.link ? [{ label: 'Website', url: experience.link }] : []), ...(experience.links || [])]
        : [];
    return (
        <Dialog
            open={!!experience}
            onClose={onClose}
            fullWidth
            maxWidth={false}
            scroll="paper"
            aria-labelledby="exp-detail-title"
            TransitionComponent={small ? SlideUp : undefined}
            sx={{
                zIndex: (t) => t.zIndex.modal + 2, // above the chat button
                ...(small && { '& .MuiDialog-container': { alignItems: 'flex-end' } }),
            }}
            PaperProps={{
                sx: {
                    maxWidth: small ? 'none' : 560,
                    m: small ? 0 : 3,
                    width: small ? '100%' : undefined,
                    maxHeight: small ? '88vh' : 'calc(100% - 48px)',
                    borderRadius: small ? '20px 20px 0 0' : '16px',
                    border: (t) => `1px solid ${t.palette.divider}`,
                    backgroundImage: 'none',
                    overflowY: 'auto',
                },
            }}
        >
            {experience && (
                <>
                    <IconButton
                        aria-label="Close"
                        onClick={onClose}
                        sx={{
                            position: 'absolute', top: 10, right: 10, zIndex: 3,
                            bgcolor: 'rgba(0,0,0,.6)', color: '#fff', '&:hover': { bgcolor: '#000' },
                        }}
                    >
                        <Close />
                    </IconButton>
                    {src && (
                        <TileMedia
                            media={src}
                            alt={experience.company}
                            hovered
                            boxSx={{ width: '100%', height: { xs: 200, sm: 240 }, flexShrink: 0, overflow: 'hidden' }}
                        />
                    )}
                    <Box sx={{ p: { xs: '20px 20px 24px', sm: '20px 24px 24px' } }}>
                        <Typography id="exp-detail-title" variant="h5" component="h2" sx={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.2, pr: src ? 0 : 5 }}>
                            {experience.company}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                            {experience.title} · {abbrev(experience.startDate)} to {abbrev(experience.endDate)}
                        </Typography>
                        {experience.description.split(/\n\s*\n/).map((para) => (
                            <Typography key={para.slice(0, 40)} variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line', mb: 1.5 }}>
                                {para}
                            </Typography>
                        ))}
                        {links.length > 0 && (
                            <Stack direction="row" useFlexGap flexWrap="wrap" sx={{ gap: 1, my: 2 }}>
                                {links.map((l) => (
                                    <LinkButton key={l.url} {...l} />
                                ))}
                            </Stack>
                        )}
                        {experience.skills.length > 0 && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                component="p"
                                sx={{ lineHeight: 1.6, pt: 1.5, borderTop: (t) => `1px solid ${t.palette.divider}` }}
                            >
                                {experience.skills.join(' · ')}
                            </Typography>
                        )}
                    </Box>
                </>
            )}
        </Dialog>
    );
};

const ExperienceCard = () => {
    const [expandedExperience, setExpandedExperience] = useState(null);

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
                        <Tile
                            key={`${experience.company}-${experience.startDate}`}
                            experience={experience}
                            open={expandedExperience === index}
                            onToggle={() => handleExpandClick(index)}
                        />
                    ))}
                </Box>
                <Detail
                    experience={expandedExperience === null ? null : sortedExperiences[expandedExperience]}
                    onClose={() => setExpandedExperience(null)}
                />
            </CardContent>
        </Card>
    );
};

export default ExperienceCard;
