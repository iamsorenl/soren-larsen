import React, { Suspense, lazy } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const EnhancedProjectCard = lazy(() => import('./EnhancedProjectCard'));
const ExperienceCard = lazy(() => import('./ExperienceCard'));
const EnhancedSkillCard = lazy(() => import('./EnhancedSkillCard'));
const EnhancedEducationCard = lazy(() => import('./EnhancedEducationCard'));
const EnhancedContactCard = lazy(() => import('./EnhancedContactCard'));
const EnhancedCertifications = lazy(() => import('./EnhancedCertifications'));

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
            <Grid item xs={12} md={6} id="projects">
                <Suspense fallback={<SectionFallback />}>
                    <EnhancedProjectCard />
                </Suspense>
            </Grid>
            <Grid item xs={12} md={6} id="experience">
                <Suspense fallback={<SectionFallback />}>
                    <ExperienceCard />
                </Suspense>
            </Grid>
            <Grid item xs={12} md={12} id="skills">
                <Suspense fallback={<SectionFallback />}>
                    <EnhancedSkillCard />
                </Suspense>
            </Grid>
            <Grid item xs={12} md={12}>
                <Suspense fallback={<SectionFallback />}>
                    <EnhancedCertifications />
                </Suspense>
            </Grid>
            <Grid item xs={12} md={6} id="education">
                <Suspense fallback={<SectionFallback />}>
                    <EnhancedEducationCard />
                </Suspense>
            </Grid>
            <Grid item xs={12} md={6} id="contact">
                <Suspense fallback={<SectionFallback />}>
                    <EnhancedContactCard />
                </Suspense>
            </Grid>
        </Grid>
    );
};

export default CardLayout;
