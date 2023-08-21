import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Icon from '@mui/material/Icon';
import Button from '@mui/material/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import projectsData from '../data/projects';
import { Message, DirectionsCar, Http, AlternateEmail, Abc } from '@mui/icons-material';
import ProjectPopUpCard from './ProjectPopUpCard';

const iconMap = {
    Message: <Message />,
    DirectionsCar: <DirectionsCar />,
    Http: <Http />,
    AlternateEmail: <AlternateEmail />,
    Abc: <Abc />,
};

const ProjectsCard = () => {
    const [openPopUp, setOpenPopUp] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const handleOpenPopUp = (project) => {
        setSelectedProject(project);
        setOpenPopUp(true);
    };

    const handleClosePopUp = () => {
        setOpenPopUp(false);
    };

    return (
        <Card sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', width: '100%', mb: 1, borderRadius: '16px' }}>
            <CardContent>
                <Typography variant="h5" mb={1}>Projects</Typography>
                {projectsData.map((project, index) => (
                    <div key={index}>
                        <Card>
                            <CardContent>
                                <Stack direction={'row'} justifyContent="space-between" alignItems="center">
                                    <Icon color={'primary.main'}>{iconMap[project.muiIcon]}</Icon>
                                    <Typography color='text.secondary'>
                                        {project.title}
                                    </Typography>
                                    <Button onClick={() => handleOpenPopUp(project)}>
                                        <OpenInNewIcon />
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                        <div style={{ height: '16px' }} />
                    </div>
                ))}
                {selectedProject && (
                    <ProjectPopUpCard open={openPopUp} onClose={handleClosePopUp} project={selectedProject} />
                )}
            </CardContent>
        </Card >
    );
};

export default ProjectsCard;
