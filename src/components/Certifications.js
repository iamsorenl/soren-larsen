import React from 'react';
import PropTypes from 'prop-types';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Link,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    useTheme,
    Avatar
} from '@mui/material';
import {
    EmojiEvents,
    OpenInNew,
    CalendarToday,
    Business,
    Verified,
    ExpandMore
} from '@mui/icons-material';
import defaultCertifications from '../data/certifications';

const EnhancedCertifications = ({ certifications = defaultCertifications }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const getIssuerColor = (issuer) => {
        const colors = {
            'ForAllSecure': '#ff5722',
            'Coursera': '#0056d3'
        };
        return colors[issuer] || '#666666';
    };

    const getIssuerIcon = (issuer) => {
        const icons = {
            'ForAllSecure': '🛡️',
            'Coursera': '🎓'
        };
        return icons[issuer] || '📜';
    };

    const getCertificationType = (name) => {
        if (name.includes('Specialization')) {
            return { type: 'Specialization', color: '#9c27b0' };
        } else if (name.includes('Machine Learning') || name.includes('AI')) {
            return { type: 'AI/ML', color: '#2196f3' };
        } else if (name.includes('Security') || name.includes('Mayhem')) {
            return { type: 'Security', color: '#ff5722' };
        }
        return { type: 'Certificate', color: '#4caf50' };
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString + ' 1, 2023');
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
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
                    <EmojiEvents sx={{ mr: 2, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Certifications
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {certifications.map((certification, index) => {
                        const certType = getCertificationType(certification.name);
                        const issuerColor = getIssuerColor(certification.issuer);
                        const issuerIcon = getIssuerIcon(certification.issuer);

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
                                        backgroundColor: issuerColor
                                    }
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMore sx={{ color: isDark ? '#64b5f6' : 'primary.main' }} />}
                                    sx={{
                                        pl: 2.5,
                                        pr: 2,
                                        minHeight: 48,
                                        '& .MuiAccordionSummary-content': {
                                            my: 1,
                                            alignItems: 'center',
                                            gap: 1
                                        }
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            backgroundColor: issuerColor,
                                            fontSize: '12px',
                                            flexShrink: 0
                                        }}
                                    >
                                        {issuerIcon}
                                    </Avatar>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 600,
                                            color: 'text.primary',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            flex: 1,
                                            minWidth: 0
                                        }}
                                    >
                                        {certification.name}
                                    </Typography>
                                    <Chip
                                        label={certType.type}
                                        size="small"
                                        sx={{
                                            backgroundColor: certType.color,
                                            color: 'white',
                                            fontWeight: 500,
                                            fontSize: '0.7rem',
                                            flexShrink: 0,
                                            display: { xs: 'none', sm: 'inline-flex' }
                                        }}
                                    />
                                </AccordionSummary>
                                <AccordionDetails sx={{ pl: 2.5, pt: 0, pb: 2 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        justifyContent: 'space-between',
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        gap: 1
                                    }}>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                <Business sx={{ fontSize: 14, mr: 0.5, color: issuerColor }} />
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{ fontWeight: 600, color: issuerColor }}
                                                >
                                                    {certification.issuer}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                <CalendarToday sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(certification.dateEarned)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Verified sx={{ fontSize: 16, mr: 0.5, color: '#4caf50' }} />
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                    Verified Credential
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Tooltip title="View Credential" arrow>
                                            <IconButton
                                                component={Link}
                                                href={certification.link}
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
                                        </Tooltip>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Box>
            </CardContent>
        </Card>
    );
};

EnhancedCertifications.propTypes = {
    certifications: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            issuer: PropTypes.string.isRequired,
            dateEarned: PropTypes.string.isRequired,
            link: PropTypes.string
        })
    )
};

export default EnhancedCertifications;
