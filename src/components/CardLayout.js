import React from 'react';
import Grid from '@mui/material/Grid';
import ProjectCard from './ProjectCard';
import projectsData from '../data/projects'; // Assuming this is the path to your projects.json file

const CardLayout = () => {
    return (
        <Grid container spacing={1}>
            {/* Column of Cards */}
            <Grid item xs={12} md={8}>
                {projectsData.map((project, index) => (
                    <ProjectCard
                        key={index}
                        cardLink={project.link}
                        cardTitle={project.title}
                        startDate={project.startDate}
                        endDate={project.endDate}
                        description={project.description}
                        tools={project.tools}
                    />
                ))}
            </Grid>
            {/* Duplicate the Column of Cards in a Row */}
            <Grid item xs={12} md={4}>
                {/* You can add more cards or other content here */}
                {projectsData.map((project, index) => (
                    <ProjectCard
                        key={index}
                        cardLink={project.link}
                        cardTitle={project.title}
                        startDate={project.startDate}
                        endDate={project.endDate}
                        description={project.description}
                        tools={project.tools}
                    />
                ))}
            </Grid>
        </Grid>
    );
};

export default CardLayout;
