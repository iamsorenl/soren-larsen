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

/* Full-size project card used for the Featured section */
const FeaturedCard = ({ project, expanded, onToggle, isMobile }) => (
    <Card
        sx={{
            mb: 2,
            backgroundColor: 'background.paper',
            backdropFilter: 'blur(10px)',
            border: (theme) =>
                `1px solid ${theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)'}`,
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
                        '&::-webkit-scrollbar': { height: '4px' },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(0, 0, 0, 0.1)',
                            borderRadius: '2px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '2px',
                            '&:hover': { background: 'rgba(0, 0, 0, 0.5)' },
                        },
                    })
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        ...(isMobile && { minWidth: 0, flexShrink: 1 })
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
                            sx={{ ...(isMobile && { fontSize: '0.8rem' }) }}
                        >
                            {project.startDate} - {project.endDate}
                        </Typography>
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        ...(isMobile && { flexShrink: 0, minWidth: 'fit-content' })
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
                                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                                        ? 'rgba(100, 181, 246, 0.1)'
                                        : 'rgba(26, 35, 126, 0.1)',
                                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : 'primary.main'
                                },
                                ...(isMobile && { minWidth: 'fit-content', px: 1.5, fontSize: '0.75rem' })
                            }}
                        >
                            GitHub
                        </Button>
                    </Tooltip>
                    <IconButton
                        onClick={onToggle}
                        sx={{
                            color: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : 'primary.main',
                            '&:hover': {
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                    ? 'rgba(100, 181, 246, 0.1)'
                                    : 'rgba(26, 35, 126, 0.1)'
                            },
                            ...(isMobile && { minWidth: 'fit-content', flexShrink: 0 })
                        }}
                    >
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {project.tools.slice(0, 4).map((tool, i) => (
                        <Chip
                            key={i}
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

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.6, whiteSpace: 'pre-line', mb: 2 }}
                    >
                        {project.description}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Technologies Used:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {project.tools.map((tool, i) => (
                            <Chip
                                key={i}
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
);

/* Compact row card used for the category tabs */
const CompactCard = ({ project, expanded, onToggle, isMobile }) => (
    <Card
        sx={{
            mb: 1,
            backgroundColor: 'background.paper',
            border: (theme) =>
                `1px solid ${theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.08)'}`,
            transition: 'all 0.3s ease'
        }}
    >
        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            lineHeight: 1.3,
                            ...(isMobile && {
                                fontSize: '0.85rem',
                                wordBreak: 'break-word'
                            })
                        }}
                    >
                        {project.title}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.25 }}
                    >
                        {project.startDate} - {project.endDate}
                    </Typography>
                </Box>

                {!isMobile && (
                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ flexShrink: 0, alignItems: 'center' }}
                    >
                        {project.tools.slice(0, 3).map((tool, i) => (
                            <Chip
                                key={i}
                                label={tool}
                                size="small"
                                sx={{
                                    backgroundColor: getToolColor(tool),
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.7rem',
                                    height: 22
                                }}
                            />
                        ))}
                        {project.tools.length > 3 && (
                            <Chip
                                label={`+${project.tools.length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 22 }}
                            />
                        )}
                    </Stack>
                )}

                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, alignItems: 'center' }}>
                    <Tooltip title="View GitHub Repository" arrow>
                        <IconButton
                            component={Link}
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            sx={{
                                color: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : 'primary.main'
                            }}
                        >
                            <GitHub fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <IconButton
                        onClick={onToggle}
                        size="small"
                        sx={{
                            color: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : 'primary.main'
                        }}
                    >
                        {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                </Box>
            </Box>

            {isMobile && (
                <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                    {project.tools.slice(0, 3).map((tool, i) => (
                        <Chip
                            key={i}
                            label={tool}
                            size="small"
                            sx={{
                                backgroundColor: getToolColor(tool),
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: 22
                            }}
                        />
                    ))}
                    {project.tools.length > 3 && (
                        <Chip
                            label={`+${project.tools.length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                    )}
                </Stack>
            )}

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.6, whiteSpace: 'pre-line', mb: 1.5 }}
                    >
                        {project.description}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                        Technologies Used:
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                        {project.tools.map((tool, i) => (
                            <Chip
                                key={i}
                                label={tool}
                                size="small"
                                sx={{
                                    backgroundColor: getToolColor(tool),
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.7rem',
                                    height: 22
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            </Collapse>
        </CardContent>
    </Card>
);

const EnhancedProjectCard = () => {
    const [expandedProject, setExpandedProject] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const featuredProjects = projectsData.filter((p) => p.category === 'featured');
    const otherProjects = projectsData.filter((p) => p.category !== 'featured');

    const handleExpandClick = (id) => {
        setExpandedProject(expandedProject === id ? null : id);
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
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #1a237e 0%, #283593 100%)'
                        : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)'
            }}
        >
            <CardContent sx={{ p: 3 }}>
                {/* ---- Section heading ---- */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Code sx={{ mr: 2, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Featured Projects
                    </Typography>
                </Box>

                {/* ---- Featured hero cards ---- */}
                <Box>
                    <Grid container spacing={2}>
                        {featuredProjects.map((project, index) => (
                            <Grid item xs={12} key={`featured-${index}`}>
                                <FeaturedCard
                                    project={project}
                                    expanded={expandedProject === `featured-${index}`}
                                    onToggle={() => handleExpandClick(`featured-${index}`)}
                                    isMobile={isMobile}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* ---- Other projects ---- */}
                {otherProjects.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                            All Projects
                        </Typography>
                        {otherProjects.map((project, index) => (
                            <CompactCard
                                key={`other-${index}`}
                                project={project}
                                expanded={expandedProject === `other-${index}`}
                                onToggle={() => handleExpandClick(`other-${index}`)}
                                isMobile={isMobile}
                            />
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default EnhancedProjectCard;
