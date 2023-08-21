import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import experiences from '../data/experience';
import Info from '@mui/icons-material/Info';
import ExperiencePopUpCard from './ExperiencePopUpCard';

const ExperienceCard = () => {
    const [openPopUp, setOpenPopUp] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState(null);

    const handleOpenPopUp = (experience) => {
        setSelectedExperience(experience);
        setOpenPopUp(true);
    };

    const handleClosePopUp = () => {
        setOpenPopUp(false);
    };

    return (
        <Card sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', width: '100%', mb: 1, borderRadius: '16px' }}>
            <CardContent>
                <Typography variant="h5" mb={1}>Experience</Typography>
                {experiences.map((experience, index) => (
                    <div key={index}>
                        <Card>
                            <CardContent>
                                <Stack direction={'row'} spacing={1} alignItems="center">
                                    <Button onClick={() => handleOpenPopUp(experience)}>
                                        <Info />
                                    </Button>
                                    <Typography color='text.secondary'>{experience.company} - {experience.title}</Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                        <div style={{ height: '16px' }} />
                    </div>
                ))}
                {selectedExperience && (
                    <ExperiencePopUpCard open={openPopUp} onClose={handleClosePopUp} experience={selectedExperience} />
                )}
            </CardContent>
        </Card >
    );
};

export default ExperienceCard;
