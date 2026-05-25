import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Link,
    Tooltip,
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
import diplomaPDF from '../data/CertifiedElectronicDiploma.pdf';
import diplomaPDF2 from '../data/CertifiedElectronicDiploma2.pdf';
import {
    ACCENT_PALETTE,
    SECTION_ACCENTS,
    resolveAccent,
} from '../theme/accents';
import SectionHeader from './SectionHeader';

// Distinct entry colors so the section isn't monochrome with sage.
// Avoids sage (the section accent) on entries so the eyebrow stands apart.
const ENTRY_ACCENT_ROTATION = [
    ACCENT_PALETTE.indigo,
    ACCENT_PALETTE.coral,
    ACCENT_PALETTE.gold,
];

const getStatus = (diploma) => {
    if (diploma === 'in progress') return { text: 'In Progress', color: '#ff9800' };
    return { text: 'Completed', color: '#4caf50' };
};

const EducationCard = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const sectionAccent = resolveAccent(SECTION_ACCENTS.education, isDark);

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
                    accent={sectionAccent}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {educationData.map((education, index) => {
                        const status = getStatus(education.diploma);
                        const accent = resolveAccent(
                            ENTRY_ACCENT_ROTATION[index % ENTRY_ACCENT_ROTATION.length],
                            isDark,
                        );
                        const hasExpandableContent =
                            education.description ||
                            (education.relevantCoursework &&
                                education.relevantCoursework.length > 0);

                        return (
                            <Accordion
                                key={`${education.school}-${education.degree || index}`}
                                disableGutters
                                elevation={0}
                                sx={{
                                    backgroundColor: 'background.paper',
                                    border: (t) => `1px solid ${t.palette.divider}`,
                                    borderRadius: '8px !important',
                                    '&:before': { display: 'none' },
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::after': {
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
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
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
                                        {education.diploma === 'yes' && (
                                            <Chip
                                                label={status.text}
                                                size="small"
                                                sx={{
                                                    backgroundColor: status.color,
                                                    color: 'white',
                                                    fontWeight: 500,
                                                    fontSize: '0.7rem',
                                                    display: { xs: 'none', sm: 'inline-flex' },
                                                }}
                                            />
                                        )}
                                        {education.link && (
                                            <Tooltip title="Visit institution website" arrow>
                                                <IconButton
                                                    component={Link}
                                                    href={education.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    size="small"
                                                    aria-label={`Open ${education.school} website`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    sx={{ color: accent }}
                                                >
                                                    <OpenInNew fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {education.diploma === 'yes' && (
                                            <Tooltip title="View diploma" arrow>
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const pdfFile =
                                                            education.diplomaFile ===
                                                            'CertifiedElectronicDiploma2.pdf'
                                                                ? diplomaPDF2
                                                                : diplomaPDF;
                                                        window.open(pdfFile, '_blank');
                                                    }}
                                                    size="small"
                                                    aria-label={`View ${education.degree || education.school} diploma`}
                                                    sx={{ color: accent }}
                                                >
                                                    <Description fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
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
                        );
                    })}
                </Box>
            </CardContent>
        </Card>
    );
};

export default EducationCard;
