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

const ProjectPopUpCard = ({ open, onClose, project }) => {
    const handleViewProjectClick = () => {
        window.open(project.link, '_blank');
        onClose();
    };

    const handleCancelProjectClick = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent sx={{ backgroundColor: 'primary.main' }}>
                <Typography variant="h6" color="primary.contrastText" mb={1}>
                    {project.title} : {project.startDate} - {project.endDate}
                </Typography>
                <Card>
                    <CardContent>
                        <Stack direction='column' spacing={1}>
                            <ReadMoreText text={project.description} maxWords={18} />
                            <Typography variant='body2'>
                                Tools: {project.tools.join(', ')}
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
                <Stack direction='row' spacing={1}>
                    <Button
                        onClick={handleViewProjectClick}
                        variant="contained"
                        color="secondary"
                        startIcon={<Launch />}
                        style={{
                            marginTop: '16px',
                            color: "white"
                        }}
                    >
                        View Project
                    </Button>
                    <Button
                        onClick={handleCancelProjectClick}
                        variant="contained"
                        color="secondary"
                        startIcon={<Close />}
                        style={{
                            marginTop: '16px',
                            color: "white"
                        }}
                    >
                        Cancel
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default ProjectPopUpCard;
