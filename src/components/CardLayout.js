import React, { Suspense, lazy } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const ProjectCard = lazy(() => import('./ProjectCard'));
const ExperienceCard = lazy(() => import('./ExperienceCard'));
const SkillCard = lazy(() => import('./SkillCard'));
const EducationCard = lazy(() => import('./EducationCard'));
const ContactCard = lazy(() => import('./ContactCard'));
const Certifications = lazy(() => import('./Certifications'));

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

const CardLayout = () => {
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} md={12} id="experience">
                <Suspense fallback={<SectionFallback />}>
                    <ExperienceCard />
                </Suspense>
            </Grid>
            <Grid item xs={12} md={12} id="projects">
                <Suspense fallback={<SectionFallback />}>
                    <ProjectCard />
                </Suspense>
            </Grid>
            <Grid item xs={12} md={12} id="skills">
                <Suspense fallback={<SectionFallback />}>
                    <SkillCard />
                </Suspense>
            </Grid>
            <Grid item xs={12} md={12}>
                <Suspense fallback={<SectionFallback />}>
                    <Certifications />
                </Suspense>
            </Grid>
            <Grid item xs={12} md={6} id="education">
                <Suspense fallback={<SectionFallback />}>
                    <EducationCard />
                </Suspense>
            </Grid>
            <Grid item xs={12} md={6} id="contact">
                <Suspense fallback={<SectionFallback />}>
                    <ContactCard />
                </Suspense>
            </Grid>
        </Grid>
    );
};

export default CardLayout;
