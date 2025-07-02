import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Chip,
    Stack,
    Collapse,
    IconButton,
    Link,
    Tooltip,
    Grid,
    useTheme
} from '@mui/material';
import {
    School,
    ExpandMore,
    ExpandLess,
    OpenInNew,
    Description,
    CalendarToday,
    MenuBook
} from '@mui/icons-material';
import educationData from '../data/education';
import diplomaPDF from '../data/CertifiedElectronicDiploma.pdf';

const EnhancedEducationCard = () => {
    const [expandedEducation, setExpandedEducation] = useState(null);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const handleExpandClick = (index) => {
        setExpandedEducation(expandedEducation === index ? null : index);
    };

    const getEducationColor = (school) => {
        const colors = {
            'University of California Santa Cruz': isDark ? '#64b5f6' : '#003c6c',
            'La Jolla High School': '#4caf50'
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
                    <School sx={{ mr: 2, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Education
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {educationData.map((education, index) => {
                        const status = getEducationStatus(education.diploma);
                        
                        return (
                            <Card 
                                key={index}
                                sx={{ 
                                    backgroundColor: 'background.paper',
                                    backdropFilter: 'blur(10px)',
                                    border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                    position: 'relative',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '4px',
                                        backgroundColor: getEducationColor(education.school),
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
                                                {education.degree || 'High School Diploma'}
                                            </Typography>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <School sx={{ fontSize: 16, mr: 1, color: getEducationColor(education.school) }} />
                                                <Typography 
                                                    variant="subtitle1" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: getEducationColor(education.school)
                                                    }}
                                                >
                                                    {education.school}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <CalendarToday sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                                <Chip
                                                    label={status.text}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: status.color,
                                                        color: 'white',
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="Visit Institution Website" arrow>
                                                <IconButton
                                                    component={Link}
                                                    href={education.link}
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
                                            
                                            {education.diploma === 'yes' && (
                                                <Tooltip title="View Diploma" arrow>
                                                    <IconButton
                                                        onClick={() => window.open(diplomaPDF, '_blank')}
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
                                                        <Description fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            
                                            {education.relevantCoursework.length > 0 && (
                                                <IconButton
                                                    onClick={() => handleExpandClick(index)}
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
                                                    {expandedEducation === index ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>

                                    {education.relevantCoursework.length > 0 && (
                                        <Collapse in={expandedEducation === index} timeout="auto" unmountOnExit>
                                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <MenuBook sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        Relevant Coursework ({education.relevantCoursework.length} courses)
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
                                            </Box>
                                        </Collapse>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            </CardContent>
        </Card>
    );
};

export default EnhancedEducationCard;
