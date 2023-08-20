import React from 'react';
import Grid from '@mui/material/Grid';
import ProjectCard from './ProjectCard';
//import ExperienceCard from './ExperienceCard';

const CardLayout = () => {
    return (
        <Grid container spacing={1}>
            {/* Column of Cards */}
            <Grid item xs={12} md={6}>
                <ProjectCard />
            </Grid>
            {/* Duplicate the Column of Cards in a Row */}
            <Grid item xs={12} md={6}>
            </Grid>
        </Grid>
    );
};

export default CardLayout;
