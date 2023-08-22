import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const EducationPopUpCard = ({ open, onClose, education }) => {
    const handleCloseSchoolClick = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent sx={{ backgroundColor: 'primary.main' }}>
                <Typography variant="h6" color="primary.contrastText" mb={1}>
                    {education.school}
                </Typography>
                <Card>
                    <CardContent>
                        <Stack direction='column' spacing={1}>
                            {education.relevantCoursework.length > 0 && (
                                <Typography variant='body2' color='text.secondary'>
                                    Relevant Courses:
                                    <ul style={{ listStyleType: 'disc', paddingLeft: '16px', marginTop: '4px' }}>
                                        {education.relevantCoursework.map((course, index) => (
                                            <li key={index}><Typography variant='body2' color='text.secondary'>{course}</Typography></li>
                                        ))}
                                    </ul>
                                </Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
                <Button
                    onClick={handleCloseSchoolClick}
                    variant="contained"
                    color="secondary"
                    style={{
                        marginTop: '16px',
                        color: "white"
                    }}
                >
                    Close
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default EducationPopUpCard;
