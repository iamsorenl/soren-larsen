import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import ReadMoreText from './ReadMoreText';
import Launch from '@mui/icons-material/Launch';
import Close from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const ExperiencePopUpCard = ({ open, onClose, experience }) => {
    const handleViewExperienceClick = () => {
        window.open(experience.link, '_blank');
        onClose();
    };

    const handleCancelExperienceClick = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent sx={{ backgroundColor: 'primary.main' }}>
                <Typography variant="h6" color="primary.contrastText" mb={1}>
                    {experience.title} : {experience.startDate} - {experience.endDate}
                </Typography>
                <Card>
                    <CardContent>
                        <Stack direction='column' spacing={1}>
                            <ReadMoreText text={experience.description} maxWords={18} />
                            <Typography variant='body2'>
                                Skills: {experience.skills.join(', ')}
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
                <Stack direction='row' spacing={1}>
                    <Button
                        onClick={handleViewExperienceClick}
                        variant="contained"
                        color="secondary"
                        startIcon={<Launch />}
                        style={{
                            marginTop: '16px',
                            color: "white"
                        }}
                    >
                        Visit Company Site
                    </Button>
                    <Button
                        onClick={handleCancelExperienceClick}
                        variant="contained"
                        color="secondary"
                        startIcon={<Close />}
                        style={{
                            marginTop: '16px',
                            color: "white"
                        }}
                    >
                        Close
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default ExperiencePopUpCard;
