import React, { useState, useMemo, useCallback } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    Box,
    Button,
    IconButton,
    Collapse,
    Link,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { GitHub, ExpandMore, ExpandLess, Code, Launch, PlayArrow } from '@mui/icons-material';
import projectsData from '../data/projects';
import { parseDate } from '../utils/dates';
import SectionHeader from './SectionHeader';

const TOOL_COLORS = {
    Python: '#3776ab',
    PyTorch: '#ee4c2c',
    TensorFlow: '#ff6f00',
    React: '#61dafb',
    JavaScript: '#f7df1e',
    'Node.js': '#339933',
    'Scikit-learn': '#f7931e',
    Pandas: '#150458',
    Numpy: '#013243',
    HTML: '#e34f26',
    CSS: '#1572b6',
    SQL: '#336791',
    Git: '#f05032',
};
const getToolColor = (tool) => TOOL_COLORS[tool] || '#666666';

// projects.json descriptions are "summary\n- bullet\n- bullet". The summary
// carries the pitch, so it stays visible; only the bullets collapse.
const splitDescription = (description) => {
    const [summary, ...bullets] = String(description).split('\n-');
    return {
        summary: summary.trim(),
        detail: bullets.map((b) => `- ${b.trim()}`).join('\n'),
    };
};

const ProjectEntry = React.memo(({ project, accent, entryId, expanded, onToggle, isMobile }) => {
    const { summary, detail } = splitDescription(project.description);
    return (
    <Card
        sx={{
            backgroundColor: 'background.paper',
            border: (t) => `1px solid ${t.palette.divider}`,
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
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
        <CardContent sx={{ py: 1.75, px: 3, pl: 4, '&:last-child': { pb: 1.75 } }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="subtitle1"
                        component="h3"
                        sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            lineHeight: 1.3,
                            ...(isMobile && { fontSize: '0.95rem', wordBreak: 'break-word' }),
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
                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, alignItems: 'center' }}>
                        {project.tools.slice(0, 3).map((tool) => (
                            <Chip
                                key={tool}
                                label={tool}
                                size="small"
                                sx={{
                                    backgroundColor: getToolColor(tool),
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.7rem',
                                    height: 22,
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
                    {project.demo && (
                        <Button
                            component={Link}
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            size="small"
                            disableElevation
                            startIcon={<Launch fontSize="small" />}
                            sx={{
                                backgroundColor: accent,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.72rem',
                                py: 0.4,
                                px: 1,
                                whiteSpace: 'nowrap',
                                minWidth: 0,
                            }}
                        >
                            Live demo
                        </Button>
                    )}
                    {project.video && (
                        <Button
                            component={Link}
                            href={project.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outlined"
                            size="small"
                            startIcon={<PlayArrow fontSize="small" />}
                            sx={{
                                borderColor: accent,
                                color: accent,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.72rem',
                                py: 0.4,
                                px: 1,
                                whiteSpace: 'nowrap',
                                minWidth: 0,
                                '&:hover': {
                                    borderColor: accent,
                                    backgroundColor: `${accent}14`,
                                },
                            }}
                        >
                            Watch demo
                        </Button>
                    )}
                    {project.link && (
                        <Button
                            component={Link}
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outlined"
                            size="small"
                            startIcon={<GitHub fontSize="small" />}
                            sx={{
                                borderColor: accent,
                                color: accent,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.72rem',
                                py: 0.4,
                                px: 1,
                                whiteSpace: 'nowrap',
                                minWidth: 0,
                                '&:hover': {
                                    borderColor: accent,
                                    backgroundColor: `${accent}14`,
                                },
                            }}
                        >
                            View on GitHub
                        </Button>
                    )}
                    <IconButton
                        onClick={() => onToggle(entryId)}
                        size="small"
                        aria-label={expanded ? `Collapse ${project.title}` : `Expand ${project.title}`}
                        aria-expanded={expanded}
                        sx={{ color: accent }}
                    >
                        {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                </Box>
            </Box>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.6 }}
            >
                {summary}
            </Typography>

            {isMobile && (
                <Stack
                    direction="row"
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ mt: 1, gap: 0.5 }}
                >
                    {project.tools.slice(0, 3).map((tool) => (
                        <Chip
                            key={tool}
                            label={tool}
                            size="small"
                            sx={{
                                backgroundColor: getToolColor(tool),
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: 22,
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
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.6, whiteSpace: 'pre-line', mb: 1.5 }}
                    >
                        {detail}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600 }}>
                        Technologies
                    </Typography>
                    <Stack
                        direction="row"
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ gap: 0.5 }}
                    >
                        {project.tools.map((tool) => (
                            <Chip
                                key={tool}
                                label={tool}
                                size="small"
                                sx={{
                                    backgroundColor: getToolColor(tool),
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.7rem',
                                    height: 22,
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            </Collapse>
        </CardContent>
    </Card>
    );
});

ProjectEntry.displayName = 'ProjectEntry';

const ProjectCard = () => {
    const [expandedProject, setExpandedProject] = useState(null);
    const [showCoursework, setShowCoursework] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Coursework is real work but it dilutes the list, so it sits behind a toggle.
    const { featured, coursework } = useMemo(() => {
        const sorted = [...projectsData].sort(
            (a, b) => parseDate(b.startDate) - parseDate(a.startDate),
        );
        return {
            featured: sorted.filter((p) => p.category !== 'nlp'),
            coursework: sorted.filter((p) => p.category === 'nlp'),
        };
    }, []);

    const handleExpandClick = useCallback((id) => {
        setExpandedProject((current) => (current === id ? null : id));
    }, []);


    return (
        <Card
            sx={{
                backgroundColor: 'background.paper',
                borderRadius: '16px',
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
                    eyebrow="Projects"
                    title="What I've built"
                    icon={<Code />}
                />

                <Stack spacing={1.25}>
                    {featured.map((project) => (
                        <ProjectEntry
                            key={project.title}
                            project={project}
                            accent={theme.palette.primary.main}
                            entryId={project.title}
                            expanded={expandedProject === project.title}
                            onToggle={handleExpandClick}
                            isMobile={isMobile}
                        />
                    ))}
                </Stack>

                {coursework.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Button
                            onClick={() => setShowCoursework((v) => !v)}
                            size="small"
                            aria-expanded={showCoursework}
                            endIcon={showCoursework ? <ExpandLess /> : <ExpandMore />}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            {showCoursework ? 'Hide' : 'Show'} NLP coursework ({coursework.length})
                        </Button>
                        <Collapse in={showCoursework} timeout="auto" unmountOnExit>
                            <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                                {coursework.map((project) => (
                                    <ProjectEntry
                                        key={project.title}
                                        project={project}
                                        accent={theme.palette.primary.main}
                                        entryId={project.title}
                                        expanded={expandedProject === project.title}
                                        onToggle={handleExpandClick}
                                        isMobile={isMobile}
                                    />
                                ))}
                            </Stack>
                        </Collapse>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default ProjectCard;
