import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
    Tabs,
    Tab,
    Link,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { GitHub, ExpandMore, ExpandLess, Code, Launch, PlayArrow, Description, Science } from '@mui/icons-material';
import projectsData from '../data/projects';
import contactInfo from '../data/contact';
import DemoTile from './DemoTile';
import ResultChart from './ResultChart';
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

// projects.json descriptions are "summary\nmore". The summary carries the
// pitch, so it stays visible; everything after the first line collapses.
const splitDescription = (description) => {
    const [summary, ...rest] = String(description).split('\n');
    return { summary: summary.trim(), detail: rest.join('\n').trim() };
};

// Card buttons, in display order. `demo`, `video` and `link` (GitHub) are
// shorthands; anything else goes in `links: [{ "label", "url" }]`.
const projectLinks = (project) => [
    project.explore && { label: 'Explore', url: project.explore, icon: <Science fontSize="small" />, primary: true },
    project.demo && { label: 'Live demo', url: project.demo, icon: <Launch fontSize="small" />, primary: true },
    project.video && { label: 'Watch demo', url: project.video, icon: <PlayArrow fontSize="small" /> },
    ...(project.links || []).map((l) => ({ ...l, icon: <Launch fontSize="small" /> })),
    project.writeup && { label: 'Write-up', url: project.writeup, icon: <Description fontSize="small" /> },
    project.link && { label: 'View on GitHub', url: project.link, icon: <GitHub fontSize="small" /> },
].filter(Boolean);

const LinkButton = ({ href, icon, primary, accent, children }) => (
    <Button
        component={Link}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        variant={primary ? 'contained' : 'outlined'}
        size="small"
        disableElevation
        startIcon={icon}
        sx={{
            ...(primary
                ? { backgroundColor: accent }
                : {
                      borderColor: accent,
                      color: accent,
                      '&:hover': { borderColor: accent, backgroundColor: `${accent}14` },
                  }),
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.72rem',
            py: 0.4,
            px: 1,
            whiteSpace: 'nowrap',
            minWidth: 0,
        }}
    >
        {children}
    </Button>
);

// Optional photo and extra links shown under a play tile. The tile itself is
// one big link, so these can't live inside it.
const TileExtras = ({ project, accent }) => {
    const { photo, links = [] } = project;
    if (!photo && links.length === 0) return null;
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            {photo && (
                <Link href={photo.src} target="_blank" rel="noopener noreferrer" sx={{ lineHeight: 0 }}>
                    <Box
                        component="img"
                        src={photo.src}
                        alt={photo.alt}
                        loading="lazy"
                        sx={{ width: 64, height: 48, objectFit: 'cover', borderRadius: '6px', display: 'block' }}
                    />
                </Link>
            )}
            {links.map(({ label, url }) => (
                <LinkButton key={url} href={url} icon={<Launch fontSize="small" />} accent={accent}>
                    {label}
                </LinkButton>
            ))}
        </Box>
    );
};

// Card anchor ids, used by hero moments and chat "take me there".
const anchorId = (project) =>
    `project-${project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

// Research media above the entry: the video preview, or a chart of the write-up's results.
const ResearchMedia = ({ project }) => {
    if (project.preview) return <DemoTile project={project} showTitle={false} />;
    if (project.results) {
        return (
            <Box sx={{ minHeight: 180, display: 'flex', flexDirection: 'column', '& > *': { flex: 1 }, borderRadius: '12px', overflow: 'hidden', border: (t) => `1px solid ${t.palette.divider}` }}>
                <ResultChart results={project.results} />
            </Box>
        );
    }
    return null;
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
        <CardContent sx={{ py: 1.75, px: { xs: 2, sm: 3 }, pl: { xs: 2.5, sm: 4 }, '&:last-child': { pb: 1.75 } }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                <Box sx={{ flex: '1 1 180px', minWidth: 0 }}>
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

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                    {projectLinks(project).map(({ label, url, icon, primary }) => (
                        <LinkButton key={url} href={url} icon={icon} primary={primary} accent={accent}>
                            {label}
                        </LinkButton>
                    ))}
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

const TABS = [
    { key: 'play', label: 'Play with it' },
    { key: 'how', label: 'How it works' },
    { key: 'research', label: 'Research' },
];

const ProjectCard = () => {
    const [expandedProject, setExpandedProject] = useState(null);
    const [tab, setTab] = useState('play');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Only projects with a `tab` render here; the rest live on GitHub.
    const tabs = useMemo(
        () => TABS.map((t) => ({ ...t, items: projectsData.filter((p) => p.tab === t.key) }))
            .filter((t) => t.items.length > 0),
        [],
    );

    useEffect(() => {
        const onTab = (e) => {
            if (tabs.some((t) => t.key === e.detail)) setTab(e.detail);
        };
        window.addEventListener('portfolio:projects-tab', onTab);
        return () => window.removeEventListener('portfolio:projects-tab', onTab);
    }, [tabs]);

    const handleExpandClick = useCallback((id) => {
        setExpandedProject((current) => (current === id ? null : id));
    }, []);

    const active = tabs.find((t) => t.key === tab) || tabs[0];

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

                <Tabs
                    value={active.key}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ mb: 2, borderBottom: (t) => `1px solid ${t.palette.divider}` }}
                >
                    {tabs.map((t) => (
                        <Tab key={t.key} value={t.key} label={t.label} sx={{ textTransform: 'none', fontWeight: 600 }} />
                    ))}
                </Tabs>

                {active.key === 'play' ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                        {active.items.map((project) => (
                            <Box key={project.title} id={anchorId(project)} component="article" aria-label={project.title}>
                                <DemoTile project={project} />
                                <TileExtras project={project} accent={theme.palette.primary.main} />
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'start' }}>
                        {active.items.map((project) => (
                            <Stack key={project.title} id={anchorId(project)} component="article" aria-label={project.title} spacing={1}>
                                <ResearchMedia project={project} />
                                <ProjectEntry
                                    project={project}
                                    accent={theme.palette.primary.main}
                                    entryId={project.title}
                                    expanded={expandedProject === project.title}
                                    onToggle={handleExpandClick}
                                    isMobile={isMobile}
                                />
                            </Stack>
                        ))}
                    </Box>
                )}

                <Button
                    component={Link}
                    href={contactInfo[0].github}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    startIcon={<GitHub />}
                    sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    More on GitHub
                </Button>
            </CardContent>
        </Card>
    );
};

export default ProjectCard;
