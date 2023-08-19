import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import CardAccordions from './CardAccordions';
import projectsData from '../data/projects';

const ProjectsCard = () => {
    return (
        <Card sx={{ width: '100%', border: '1px solid #ccc', mb: 1, borderRadius: '16px' }}>
            <CardContent>
                <Typography variant="h5" align="center">Projects</Typography>
                {projectsData.map((project, index) => (
                    <CardAccordions
                        key={index}
                        title={project.title}
                        content={
                            <div>
                                <Link href={project.link} underline="hover" color="inherit" variant="body2">
                                    {project.link}
                                </Link>
                                {/* Add padding for space */}
                                <Stack direction="row" spacing={1} sx={{ paddingTop: '8px' }}>
                                    <Typography variant="body2">{project.startDate}</Typography>
                                    <Typography variant="body2">{"-"}</Typography>
                                    <Typography variant="body2">{project.endDate}</Typography>
                                </Stack>
                                {/* Add padding for space */}
                                <Typography variant="body2" sx={{ paddingTop: '8px' }}>
                                    {project.description}
                                </Typography>
                                {/* Add padding for space */}
                                <Typography variant="body2" sx={{ paddingTop: '8px' }}>
                                    Tools: {project.tools.join(', ')}
                                </Typography>
                            </div>
                        }
                    />
                ))}
            </CardContent>
        </Card>
    );
};

export default ProjectsCard;
