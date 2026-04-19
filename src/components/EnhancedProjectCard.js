import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    Box,
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
    Code
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

/* Project card */
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

    const allProjects = [...projectsData].sort((a, b) => {
        const parseDate = (str) => {
            if (!str) return 0;
            const parts = str.split(' ');
            const months = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 };
            return new Date(parseInt(parts[1]), months[parts[0]] || 0).getTime();
        };
        return parseDate(b.startDate) - parseDate(a.startDate);
    });

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
                        Projects
                    </Typography>
                </Box>

                {/* ---- All projects, chronological ---- */}
                {allProjects.map((project, index) => (
                    <CompactCard
                        key={`project-${index}`}
                        project={project}
                        expanded={expandedProject === `project-${index}`}
                        onToggle={() => handleExpandClick(`project-${index}`)}
                        isMobile={isMobile}
                    />
                ))}
            </CardContent>
        </Card>
    );
};

export default EnhancedProjectCard;
