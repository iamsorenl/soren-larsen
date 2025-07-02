import React from 'react';
import Grid from '@mui/material/Grid';
import EnhancedProjectCard from './EnhancedProjectCard';
import EnhancedExperienceCard from './EnhancedExperienceCard';
import EnhancedSkillCard from './EnhancedSkillCard';
import EducationCard from './EducationCard';
import ContactCard from './ContactCard';
import Certifications from './Certifications';

const CardLayout = () => {
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} md={6} id="projects">
                <EnhancedProjectCard />
            </Grid>
            <Grid item xs={12} md={6} id="experience">
                <EnhancedExperienceCard />
            </Grid>
            <Grid item xs={12} md={12} id="skills">
                <EnhancedSkillCard />
            </Grid>
            <Grid item xs={12} md={12}>
                <Certifications />
            </Grid>
            <Grid item xs={12} md={6} id="education">
                <EducationCard />
            </Grid>
            <Grid item xs={12} md={6} id="contact">
                <ContactCard />
            </Grid>
        </Grid>
    );
};

export default CardLayout;
