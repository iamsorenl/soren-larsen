import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Link,
    Chip,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    useTheme,
    Avatar,
} from '@mui/material';
import {
    School,
    ExpandMore,
    OpenInNew,
    Description,
    MenuBook,
} from '@mui/icons-material';
import educationData from '../data/education';
import SectionHeader from './SectionHeader';
import CyclingMedia from './CyclingMedia';

// Press mention under a degree. Thumbnail is the article's own image.
const PressCard = ({ press }) => (
    <Box
        component="a"
        href={press.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            mx: 2.5,
            mb: 1.5,
            pt: 1.25,
            textDecoration: 'none',
            color: 'text.primary',
            borderTop: (t) => `1px solid ${t.palette.divider}`,
            '&:hover .press-title, &:focus-visible .press-title': { color: 'primary.main' },
        }}
    >
        {press.image && (
            <Box component="img" src={press.image} alt="" loading="lazy" sx={{ width: 72, height: 48, objectFit: 'cover', objectPosition: '50% 20%', borderRadius: '6px', flexShrink: 0 }} />
        )}
        <Box sx={{ minWidth: 0 }}>
            <Typography component="span" sx={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'primary.main' }}>
                PRESS · {press.outlet.toUpperCase()}
            </Typography>
            <Typography component="span" className="press-title" sx={{ display: 'block', fontSize: 14, fontWeight: 600, my: 0.25, transition: 'color 0.2s' }}>
                {press.title}
            </Typography>
            <Typography component="span" sx={{ display: 'block', fontSize: 12, color: 'text.secondary' }}>
                {press.blurb || `${press.author} · ${press.date}`} ↗
            </Typography>
        </Box>
    </Box>
);

// Small outlined link buttons, same look as the project cards'.
const btnSx = (accent) => ({
    textTransform: 'none', fontWeight: 600, fontSize: '0.72rem', py: 0.4, px: 1, minWidth: 0, whiteSpace: 'nowrap',
    borderColor: accent, color: accent, '&:hover': { borderColor: accent, backgroundColor: `${accent}14` },
});

const EducationCard = () => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                backgroundColor: 'background.paper',
                borderRadius: '16px',
                height: '100%',
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
                    eyebrow="Education"
                    title="Where I studied"
                    icon={<School />}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {educationData.map((education, index) => {
                        const accent = theme.palette.primary.main;
                        const hasExpandableContent =
                            education.description ||
                            (education.relevantCoursework &&
                                education.relevantCoursework.length > 0);

                        return (
                            <Box
                                key={`${education.school}-${education.degree || index}`}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: education.media ? '220px minmax(0, 1fr)' : 'minmax(0, 1fr)' },
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    border: (t) => `1px solid ${t.palette.divider}`,
                                }}
                            >
                            {education.media && (
                                <Box data-testid="degree-photo" sx={{ aspectRatio: { xs: '16 / 9', sm: 'auto' }, minHeight: { sm: 170 } }}>
                                    <CyclingMedia items={education.media} label={`${education.degree} photos`} />
                                </Box>
                            )}
                            <Box sx={{ minWidth: 0 }}>
                            <Accordion
                                defaultExpanded={!education.press}
                                disableGutters
                                elevation={0}
                                sx={{
                                    backgroundColor: 'transparent',
                                    '&:before': { display: 'none' },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={
                                        hasExpandableContent ? (
                                            <ExpandMore sx={{ color: accent }} />
                                        ) : null
                                    }
                                    sx={{
                                        pl: 2.5,
                                        pr: 2,
                                        minHeight: 56,
                                        '& .MuiAccordionSummary-content': {
                                            my: 1,
                                            alignItems: 'center',
                                            gap: 1,
                                            flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                        },
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            backgroundColor: accent,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <School sx={{ fontSize: 16 }} />
                                    </Avatar>
                                    <Box sx={{ flex: '1 1 180px', minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            component="h3"
                                            sx={{
                                                fontWeight: 700,
                                                color: 'text.primary',
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {education.degree || 'High School Diploma'}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 600,
                                                color: accent,
                                                display: 'block',
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {education.school}
                                            {education.dates ? ` · ${education.dates}` : ''}
                                        </Typography>
                                        {education.description && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: { xs: 2, sm: 2, md: 3 },
                                                    overflow: 'hidden',
                                                    color: 'text.secondary',
                                                    lineHeight: 1.5,
                                                    mt: 0.5,
                                                    '.Mui-expanded &': {
                                                        WebkitLineClamp: 'unset',
                                                        overflow: 'visible',
                                                    },
                                                }}
                                            >
                                                {education.description}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {education.link && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    component={Link}
                                                    href={education.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`Open ${education.school} program site`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    startIcon={<OpenInNew fontSize="small" />}
                                                    sx={btnSx(accent)}
                                                >
                                                    Program site
                                                </Button>
                                        )}
                                        {education.diploma === 'yes' && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const pdfFile =
                                                            education.diplomaFile ===
                                                            'CertifiedElectronicDiploma2.pdf'
                                                                ? '/CertifiedElectronicDiploma2.pdf'
                                                                : '/CertifiedElectronicDiploma.pdf';
                                                        window.open(pdfFile, '_blank');
                                                    }}
                                                    aria-label={`View ${education.degree || education.school} diploma`}
                                                    startIcon={<Description fontSize="small" />}
                                                    sx={btnSx(accent)}
                                                >
                                                    Diploma
                                                </Button>
                                        )}
                                    </Box>
                                </AccordionSummary>
                                {education.relevantCoursework &&
                                    education.relevantCoursework.length > 0 && (
                                        <AccordionDetails sx={{ pl: 2.5, pt: 0, pb: 2 }}>
                                            <Box
                                                sx={{
                                                    borderTop: (t) =>
                                                        `1px solid ${t.palette.divider}`,
                                                    pt: 2,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 1.5,
                                                    }}
                                                >
                                                    <MenuBook
                                                        sx={{
                                                            fontSize: 16,
                                                            mr: 1,
                                                            color: 'text.secondary',
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="subtitle2"
                                                        component="p"
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        Relevant coursework (
                                                        {education.relevantCoursework.length})
                                                    </Typography>
                                                </Box>
                                                <Grid container spacing={1}>
                                                    {education.relevantCoursework.map((course) => (
                                                        <Grid item xs={12} sm={6} md={4} key={course}>
                                                            <Chip
                                                                label={course}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    width: '100%',
                                                                    justifyContent: 'flex-start',
                                                                    fontSize: '0.75rem',
                                                                    height: 'auto',
                                                                    py: 0.5,
                                                                    '& .MuiChip-label': {
                                                                        whiteSpace: 'normal',
                                                                        textAlign: 'left',
                                                                    },
                                                                }}
                                                            />
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Box>
                                        </AccordionDetails>
                                    )}
                            </Accordion>
                            {education.press && <PressCard press={education.press} />}
                            </Box>
                            </Box>
                        );
                    })}
                </Box>
            </CardContent>
        </Card>
    );
};

export default EducationCard;
