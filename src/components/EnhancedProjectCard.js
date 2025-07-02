import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Stack,
    Button,
    Chip,
    Box,
    Grid,
    IconButton,
    Collapse,
    Link,
    Tooltip,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    GitHub,
    ExpandMore,
    ExpandLess,
    Code,
    Timeline
} from '@mui/icons-material';
import projectsData from '../data/projects';

const EnhancedProjectCard = () => {
    const [expandedProject, setExpandedProject] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleExpandClick = (index) => {
        setExpandedProject(expandedProject === index ? null : index);
    };

    const displayedProjects = showAll ? projectsData : projectsData.slice(0, 3);

    const getToolColor = (tool) => {
        const toolColors = {
            'Python': '#3776ab',
            'PyTorch': '#ee4c2c',
            'TensorFlow': '#ff6f00',
            'React': '#61dafb',
            'JavaScript': '#f7df1e',
            'Node.js': '#339933',
            'Scikit-learn': '#f7931e',
            'Pandas': '#150458',
            'Numpy': '#013243',
            'HTML': '#e34f26',
            'CSS': '#1572b6',
            'SQL': '#336791',
            'Git': '#f05032',
        };
        return toolColors[tool] || '#666666';
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
                    <Code sx={{ mr: 2, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Featured Projects
                    </Typography>
                </Box>
                
                <Box 
                    sx={{ 
                        maxHeight: showAll ? '600px' : 'none',
                        overflowY: showAll ? 'auto' : 'visible',
                        pr: showAll ? 1 : 0,
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '4px',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.5)',
                            },
                        },
                    }}
                >
                    <Grid container spacing={2}>
                        {displayedProjects.map((project, index) => (
                            <Grid item xs={12} key={index}>
                                <Card 
                                    sx={{ 
                                        mb: 2,
                                        backgroundColor: 'background.paper',
                                        backdropFilter: 'blur(10px)',
                                        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box 
                                            sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'flex-start', 
                                                mb: 2,
                                                ...(isMobile && {
                                                    overflowX: 'auto',
                                                    gap: 2,
                                                    '&::-webkit-scrollbar': {
                                                        height: '4px',
                                                    },
                                                    '&::-webkit-scrollbar-track': {
                                                        background: 'rgba(0, 0, 0, 0.1)',
                                                        borderRadius: '2px',
                                                    },
                                                    '&::-webkit-scrollbar-thumb': {
                                                        background: 'rgba(0, 0, 0, 0.3)',
                                                        borderRadius: '2px',
                                                        '&:hover': {
                                                            background: 'rgba(0, 0, 0, 0.5)',
                                                        },
                                                    },
                                                })
                                            }}
                                        >
                                            <Box 
                                                sx={{ 
                                                    flex: 1,
                                                    ...(isMobile && {
                                                        minWidth: 0, // Allow text to wrap/truncate
                                                        flexShrink: 1
                                                    })
                                                }}
                                            >
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 600, 
                                                        color: 'text.primary',
                                                        mb: 1,
                                                        lineHeight: 1.3,
                                                        ...(isMobile && {
                                                            fontSize: '1.1rem',
                                                            wordBreak: 'break-word',
                                                            hyphens: 'auto'
                                                        })
                                                    }}
                                                >
                                                    {project.title}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <Timeline sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                    <Typography 
                                                        variant="body2" 
                                                        color="text.secondary"
                                                        sx={{
                                                            ...(isMobile && {
                                                                fontSize: '0.8rem'
                                                            })
                                                        }}
                                                    >
                                                        {project.startDate} - {project.endDate}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box 
                                                sx={{ 
                                                    display: 'flex', 
                                                    gap: 1,
                                                    ...(isMobile && {
                                                        flexShrink: 0, // Prevent buttons from shrinking
                                                        minWidth: 'fit-content'
                                                    })
                                                }}
                                            >
                                                <Tooltip title="View GitHub Repository" arrow>
                                                    <Button
                                                        component={Link}
                                                        href={project.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<GitHub />}
                                                        sx={{ 
                                                            color: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : 'primary.main',
                                                            borderColor: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : 'primary.main',
                                                            '&:hover': { 
                                                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(100, 181, 246, 0.1)' : 'rgba(26, 35, 126, 0.1)',
                                                                borderColor: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : 'primary.main'
                                                            },
                                                            ...(isMobile && {
                                                                minWidth: 'fit-content',
                                                                px: 1.5,
                                                                fontSize: '0.75rem'
                                                            })
                                                        }}
                                                    >
                                                        GitHub
                                                    </Button>
                                                </Tooltip>
                                                <IconButton
                                                    onClick={() => handleExpandClick(index)}
                                                    sx={{ 
                                                        color: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : 'primary.main',
                                                        '&:hover': { backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(100, 181, 246, 0.1)' : 'rgba(26, 35, 126, 0.1)' },
                                                        ...(isMobile && {
                                                            minWidth: 'fit-content',
                                                            flexShrink: 0
                                                        })
                                                    }}
                                                >
                                                    {expandedProject === index ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <Box sx={{ mb: 2 }}>
                                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                {project.tools.slice(0, 4).map((tool, toolIndex) => (
                                                    <Chip
                                                        key={toolIndex}
                                                        label={tool}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getToolColor(tool),
                                                            color: 'white',
                                                            fontWeight: 500,
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                ))}
                                                {project.tools.length > 4 && (
                                                    <Chip
                                                        label={`+${project.tools.length - 4} more`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.75rem' }}
                                                    />
                                                )}
                                            </Stack>
                                        </Box>

                                        <Collapse in={expandedProject === index} timeout="auto" unmountOnExit>
                                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary"
                                                    sx={{ 
                                                        lineHeight: 1.6,
                                                        whiteSpace: 'pre-line',
                                                        mb: 2
                                                    }}
                                                >
                                                    {project.description}
                                                </Typography>
                                                
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                                    Technologies Used:
                                                </Typography>
                                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                    {project.tools.map((tool, toolIndex) => (
                                                        <Chip
                                                            key={toolIndex}
                                                            label={tool}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: getToolColor(tool),
                                                                color: 'white',
                                                                fontWeight: 500,
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    ))}
                                                </Stack>
                                            </Box>
                                        </Collapse>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {projectsData.length > 3 && (
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
                            {showAll ? 'Show Less' : `View All ${projectsData.length} Projects`}
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default EnhancedProjectCard;
