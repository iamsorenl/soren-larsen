import React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import ProjectCard from './ProjectCard';
import projectsData from '../data/projects'; // Assuming this is the path to your projects.json file

const CardLayout = () => {
    return (
        <Container maxWidth="xl" sx={{ margin: 0, padding: 0 }}>
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
                </Grid>
            </Grid>
        </Container>
    );
};

export default CardLayout;
