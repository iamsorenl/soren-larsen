import React from 'react';
import Grid from '@mui/material/Grid';
import EnhancedProjectCard from './EnhancedProjectCard';
import ExperienceCard from './ExperienceCard';
import EnhancedSkillCard from './EnhancedSkillCard';
import EnhancedEducationCard from './EnhancedEducationCard';
import EnhancedContactCard from './EnhancedContactCard';
import EnhancedCertifications from './EnhancedCertifications';

const CardLayout = () => {
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} md={6} id="projects">
                <EnhancedProjectCard />
            </Grid>
            <Grid item xs={12} md={6} id="experience">
                <ExperienceCard />
            </Grid>
            <Grid item xs={12} md={12} id="skills">
                <EnhancedSkillCard />
            </Grid>
            <Grid item xs={12} md={12}>
                <EnhancedCertifications />
            </Grid>
            <Grid item xs={12} md={6} id="education">
                <EnhancedEducationCard />
            </Grid>
            <Grid item xs={12} md={6} id="contact">
                <EnhancedContactCard />
            </Grid>
        </Grid>
    );
};

export default CardLayout;
