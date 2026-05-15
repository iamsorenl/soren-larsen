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
    Avatar
} from '@mui/material';
import {
    School,
    ExpandMore,
    OpenInNew,
    Description,
    MenuBook
} from '@mui/icons-material';
import educationData from '../data/education';
import diplomaPDF from '../data/CertifiedElectronicDiploma.pdf';
import diplomaPDF2 from '../data/CertifiedElectronicDiploma2.pdf';

const EnhancedEducationCard = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const getEducationColor = (school) => {
        const colors = {
            'University of California Santa Cruz': isDark ? '#fdc700' : '#003c6c',
            'La Jolla High School': isDark ? '#34d399' : '#10b981'
        };
        return colors[school] || '#666666';
    };

    const getEducationStatus = (diploma) => {
        switch (diploma) {
            case 'yes':
                return { text: 'Completed', color: '#4caf50' };
            case 'in progress':
                return { text: 'In Progress', color: '#ff9800' };
            default:
                return { text: 'Completed', color: '#4caf50' };
        }
    };

    return (
        <Card
            sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                height: 'auto',
                width: '100%',
                mb: 1,
                borderRadius: '16px',
                alignSelf: 'flex-start',
                background: (t) => t.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1a237e 0%, #283593 100%)'
                    : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)'
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <School sx={{ mr: 2, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Education
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {educationData.map((education, index) => {
                        const status = getEducationStatus(education.diploma);
                        const schoolColor = getEducationColor(education.school);
                        const hasExpandableContent = education.description || (education.relevantCoursework && education.relevantCoursework.length > 0);

                        return (
                            <Accordion
                                key={index}
                                disableGutters
                                elevation={0}
                                sx={{
                                    backgroundColor: 'background.paper',
                                    backdropFilter: 'blur(10px)',
                                    border: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
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
                                        backgroundColor: schoolColor
                                    }
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={hasExpandableContent ? <ExpandMore sx={{ color: isDark ? '#64b5f6' : 'primary.main' }} /> : null}
                                    sx={{
                                        pl: 2.5,
                                        pr: 2,
                                        minHeight: 56,
                                        '& .MuiAccordionSummary-content': {
                                            my: 1,
                                            alignItems: 'center',
                                            gap: 1,
                                            flexWrap: { xs: 'wrap', sm: 'nowrap' }
                                        }
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            backgroundColor: schoolColor,
                                            flexShrink: 0
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
                                                lineHeight: 1.3
                                            }}
                                        >
                                            {education.degree || 'High School Diploma'}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 600,
                                                color: schoolColor,
                                                display: 'block',
                                                lineHeight: 1.2
                                            }}
                                        >
                                            {education.school}{education.dates ? ` · ${education.dates}` : ''}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                                        <Chip
                                            label={status.text}
                                            size="small"
                                            sx={{
                                                backgroundColor: status.color,
                                                color: 'white',
                                                fontWeight: 500,
                                                fontSize: '0.7rem',
                                                display: { xs: 'none', sm: 'inline-flex' }
                                            }}
                                        />
                                        <Tooltip title="Visit Institution Website" arrow>
                                            <IconButton
                                                component={Link}
                                                href={education.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="small"
                                                onClick={(e) => e.stopPropagation()}
                                                sx={{
                                                    color: isDark ? '#64b5f6' : 'primary.main',
                                                    '&:hover': {
                                                        backgroundColor: isDark ? 'rgba(100, 181, 246, 0.15)' : 'rgba(26, 35, 126, 0.15)'
                                                    }
                                                }}
                                            >
                                                <OpenInNew fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {education.diploma === 'yes' && (
                                            <Tooltip title="View Diploma" arrow>
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const pdfFile = education.diplomaFile === 'CertifiedElectronicDiploma2.pdf' ? diplomaPDF2 : diplomaPDF;
                                                        window.open(pdfFile, '_blank');
                                                    }}
                                                    size="small"
                                                    sx={{
                                                        color: isDark ? '#64b5f6' : 'primary.main',
                                                        '&:hover': {
                                                            backgroundColor: isDark ? 'rgba(100, 181, 246, 0.15)' : 'rgba(26, 35, 126, 0.15)'
                                                        }
                                                    }}
                                                >
                                                    <Description fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </AccordionSummary>
                                {hasExpandableContent && (
                                    <AccordionDetails sx={{ pl: 2.5, pt: 0, pb: 2 }}>
                                        <Box sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', pt: 2 }}>
                                            {education.description && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ lineHeight: 1.6, mb: 2 }}
                                                >
                                                    {education.description}
                                                </Typography>
                                            )}
                                            {education.relevantCoursework && education.relevantCoursework.length > 0 && (
                                                <>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                                        <MenuBook sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            Relevant Coursework ({education.relevantCoursework.length})
                                                        </Typography>
                                                    </Box>
                                                    <Grid container spacing={1}>
                                                        {education.relevantCoursework.map((course, courseIndex) => (
                                                            <Grid item xs={12} sm={6} md={4} key={courseIndex}>
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
                                                                            textAlign: 'left'
                                                                        }
                                                                    }}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </>
                                            )}
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

export default EnhancedEducationCard;
