import React from 'react';
import Grid from '@mui/material/Grid';
import ProjectCard from './ProjectCard';
import ExperienceCard from './ExperienceCard';
import SkillCard from './SkillCard';
import EducationCard from './EducationCard';
import ContactCard from './ContactCard';
import Certifications from './Certifications';

const CardLayout = () => {
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
                <ProjectCard />
            </Grid>
            <Grid item xs={12} md={6}>
                <ExperienceCard />
            </Grid>
            <Grid item xs={12} md={12}>
                <SkillCard />
            </Grid>
            <Grid item xs={12} md={12}>
                <Certifications />
            </Grid>
            <Grid item xs={12} md={6}>
                <EducationCard />
            </Grid>
            <Grid item xs={12} md={6}>
                <ContactCard />
            </Grid>
        </Grid>
    );
};

export default CardLayout;
