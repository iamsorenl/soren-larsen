import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CardAccordions from './CardAccordions';
import experiences from '../data/experience'

const ExperienceCard = () => {
    return (
        <Card sx={{ width: '100%', border: '1px solid #ccc', mb: 1, borderRadius: '16px' }}>
            <CardContent>
                <Typography variant="h5">Experience</Typography>
                {experiences.map((experience, index) => (
                    <CardAccordions
                        key={index}
                        title={`${experience.Title} at ${experience.Company}`}
                        content={
                            <div>
                                <Typography variant="body2">{experience.Location}</Typography>
                                <Stack direction="row" spacing={1} sx={{ paddingTop: '8px' }}>
                                    <Typography variant="body2">{experience.start}</Typography>
                                    <Typography variant="body2">{" - "}</Typography>
                                    <Typography variant="body2">{experience.end}</Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ paddingTop: '8px' }}>
                                    {experience.description}
                                </Typography>
                                <Typography variant="body2" sx={{ paddingTop: '8px' }}>
                                    Skills: {experience.skills.join(', ')}
                                </Typography>
                            </div>
                        }
                    />
                ))}
            </CardContent>
        </Card>
    );
};

export default ExperienceCard;
