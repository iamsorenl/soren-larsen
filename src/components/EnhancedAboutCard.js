import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Avatar,
    Chip,
    Stack,
    useTheme,
    useMediaQuery,
    Fade,
    Button,
    Tooltip
} from '@mui/material';
import {
    Person,
    School,
    Work,
    Code,
    Psychology,
    SurfingOutlined,
    Description,
    Download
} from '@mui/icons-material';
import { GiSpermWhale } from 'react-icons/gi';
import about from '../data/about';
import highlightsData from '../data/highlights';
import resumePDF from '../data/SorenLarsenResume.pdf';
import headshot1 from '../images/Headshot1.jpg';
import headshot2 from '../images/Headshot2.jpg';
import turtle from '../images/Turtle.jpg';
import surf from '../images/Surf.jpg';
import halfdome from '../images/HalfDome.jpg';
import expressive from '../images/Expressive.JPG';
import peru from '../images/Peru.JPG';
import slugfest from '../images/SlugFest.JPG';
import caffeineHack from '../images/caffeine_hack.jpeg';

const imageUrls = [headshot1, expressive, halfdome, headshot2, turtle, peru, slugfest, surf, caffeineHack];

const EnhancedAboutCard = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
        }, 8000); // Change image every 8 seconds

        return () => clearInterval(interval);
    }, []);

    const getIconComponent = (iconName) => {
        const iconMap = {
            'School': <School />,
            'Work': <Work />,
            'Code': <Code />,
            'Psychology': <Psychology />,
            'SurfingOutlined': <SurfingOutlined />,
            'FaWhale': <GiSpermWhale />
        };
        return iconMap[iconName] || <Person />;
    };

    const highlights = highlightsData.map(highlight => ({
        icon: getIconComponent(highlight.icon),
        text: highlight.text,
        color: highlight.color
    }));

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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 2, fontSize: 28 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            About
                        </Typography>
                    </Box>
                    
                    {/* Stylistic Resume Download Button */}
                    <Tooltip title="Download Resume" arrow>
                        <Button
                            onClick={() => window.open(resumePDF, '_blank')}
                            variant="contained"
                            startIcon={<Description />}
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                color: 'white',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                fontWeight: 600,
                                px: 3,
                                py: 1,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontSize: '0.9rem',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Resume
                        </Button>
                    </Tooltip>
                </Box>

                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: 3,
                        alignItems: isMobile ? 'center' : 'flex-start'
                    }}
                >
                    {/* Profile Image */}
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                        <Fade in={true} timeout={1000}>
                            <Avatar
                                src={imageUrls[currentImageIndex]}
                                sx={{
                                    width: isMobile ? 200 : 280,
                                    height: isMobile ? 200 : 280,
                                    border: '4px solid rgba(255, 255, 255, 0.2)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                    transition: 'all 1.5s ease-in-out'
                                }}
                            />
                        </Fade>
                        
                        {/* Image indicators */}
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                mt: 2, 
                                gap: 1 
                            }}
                        >
                            {imageUrls.map((_, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: index === currentImageIndex 
                                            ? 'rgba(255, 255, 255, 0.8)' 
                                            : 'rgba(255, 255, 255, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                        {/* Highlights */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Quick Highlights
                            </Typography>
                            <Stack 
                                direction="row" 
                                spacing={1} 
                                sx={{ 
                                    flexWrap: 'wrap', 
                                    gap: 1,
                                    justifyContent: isMobile ? 'center' : 'flex-start'
                                }}
                            >
                                {highlights.map((highlight, index) => (
                                    <Chip
                                        key={index}
                                        icon={highlight.icon}
                                        label={highlight.text}
                                        sx={{
                                            backgroundColor: highlight.color,
                                            color: 'white',
                                            fontWeight: 500,
                                            fontSize: '0.85rem',
                                            '& .MuiChip-icon': {
                                                color: 'white'
                                            }
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Box>

                        {/* About Text */}
                        <Card 
                            sx={{ 
                                backgroundColor: 'background.paper',
                                backdropFilter: 'blur(10px)',
                                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography 
                                    variant="body1" 
                                    color="text.primary"
                                    sx={{ 
                                        lineHeight: 1.7,
                                        whiteSpace: 'pre-line',
                                        textAlign: isMobile ? 'center' : 'left'
                                    }}
                                >
                                    {about[0].about}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default EnhancedAboutCard;
