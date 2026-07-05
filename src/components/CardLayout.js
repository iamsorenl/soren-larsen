import React, { Suspense, lazy } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorBoundary from './ErrorBoundary';

const ProjectCard = lazy(() => import('./ProjectCard'));
const ExperienceCard = lazy(() => import('./ExperienceCard'));
const SkillCard = lazy(() => import('./SkillCard'));
const EducationCard = lazy(() => import('./EducationCard'));
const ContactCard = lazy(() => import('./ContactCard'));

const SectionFallback = () => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 240,
            width: '100%'
        }}
    >
        <CircularProgress />
    </Box>
);

const SectionErrorFallback = ({ label }) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1.5,
            minHeight: 240,
            width: '100%',
            px: 3,
            textAlign: 'center',
        }}
    >
        <Typography variant="body1" color="text.secondary">
            The {label} section failed to load.
        </Typography>
        <Button variant="outlined" size="small" onClick={() => window.location.reload()}>
            Reload page
        </Button>
    </Box>
);

// Each lazy section gets its own ErrorBoundary so a failed chunk (e.g. a
// stale deploy or flaky network) only blanks that section, not the page.
const Section = ({ label, children }) => (
    <ErrorBoundary fallback={<SectionErrorFallback label={label} />}>
        <Suspense fallback={<SectionFallback />}>{children}</Suspense>
    </ErrorBoundary>
);

const CardLayout = () => {
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} md={12} id="experience">
                <Section label="experience">
                    <ExperienceCard />
                </Section>
            </Grid>
            <Grid item xs={12} md={12} id="projects">
                <Section label="projects">
                    <ProjectCard />
                </Section>
            </Grid>
            <Grid item xs={12} md={12} id="skills">
                <Section label="skills">
                    <SkillCard />
                </Section>
            </Grid>
            <Grid item xs={12} md={6} id="education">
                <Section label="education">
                    <EducationCard />
                </Section>
            </Grid>
            <Grid item xs={12} md={6} id="contact">
                <Section label="contact">
                    <ContactCard />
                </Section>
            </Grid>
        </Grid>
    );
};

export default CardLayout;
