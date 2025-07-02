import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Stack,
    Collapse,
    IconButton,
    Link,
    Tooltip,
    Grid,
    useTheme,
    Avatar,
    Button
} from '@mui/material';
import {
    EmojiEvents,
    ExpandMore,
    ExpandLess,
    OpenInNew,
    CalendarToday,
    Business,
    Verified,
    School
} from '@mui/icons-material';
import certifications from '../data/certifications';

const EnhancedCertifications = () => {
    const [expandedCert, setExpandedCert] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const handleExpandClick = (index) => {
        setExpandedCert(expandedCert === index ? null : index);
    };

    const displayedCertifications = showAll ? certifications : certifications.slice(0, 2);

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
                background: (theme) => theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #1a237e 0%, #283593 100%)'
                    : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)'
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <EmojiEvents sx={{ mr: 2, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Certifications
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {displayedCertifications.map((certification, index) => {
                        const certType = getCertificationType(certification.name);
                        const issuerColor = getIssuerColor(certification.issuer);
                        const issuerIcon = getIssuerIcon(certification.issuer);
                        
                        return (
                            <Grid item xs={12} md={6} key={index}>
                                <Card 
                                    sx={{ 
                                        backgroundColor: 'background.paper',
                                        backdropFilter: 'blur(10px)',
                                        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                        position: 'relative',
                                        height: '100%',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: '4px',
                                            backgroundColor: issuerColor,
                                            borderRadius: '0 4px 4px 0'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 2.5, pl: 3.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            backgroundColor: issuerColor,
                                                            fontSize: '12px',
                                                            mr: 1
                                                        }}
                                                    >
                                                        {issuerIcon}
                                                    </Avatar>
                                                    <Chip
                                                        label={certType.type}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: certType.color,
                                                            color: 'white',
                                                            fontWeight: 500,
                                                            fontSize: '0.7rem'
                                                        }}
                                                    />
                                                </Box>
                                                
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 700, 
                                                        color: 'text.primary',
                                                        mb: 1,
                                                        lineHeight: 1.3,
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    {certification.name}
                                                </Typography>
                                                
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Business sx={{ fontSize: 14, mr: 0.5, color: issuerColor }} />
                                                    <Typography 
                                                        variant="subtitle2" 
                                                        sx={{ 
                                                            fontWeight: 600,
                                                            color: issuerColor
                                                        }}
                                                    >
                                                        {certification.issuer}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <CalendarToday sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {formatDate(certification.dateEarned)}
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

                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 1 }}>
                                            <Verified sx={{ fontSize: 16, mr: 1, color: '#4caf50' }} />
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                Verified Credential
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                {certifications.length > 2 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setShowAll(!showAll)}
                            sx={{
                                color: 'primary.contrastText',
                                borderColor: 'primary.contrastText',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    borderColor: 'primary.contrastText'
                                }
                            }}
                        >
                            {showAll ? 'Show Less' : `View All ${certifications.length} Certifications`}
                        </Button>
                    </Box>
                )}

            </CardContent>
        </Card>
    );
};

export default EnhancedCertifications;
