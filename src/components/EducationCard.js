import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import EducationPopUpCard from './EducationPopUpCard';
import educationData from '../data/education';
import diplomaPDF from '../data/CertifiedElectronicDiploma.pdf';

const EducationCard = () => {
    const [openPopUp, setOpenPopUp] = useState(false);
    const [selectedEducation, setSelectedEducation] = useState(null);

    const handleOpenPopUp = (education) => {
        setSelectedEducation(education);
        setOpenPopUp(true);
    };

    const handleClosePopUp = () => {
        setOpenPopUp(false);
    };

    const handleOpenLink = (education) => {
        window.open(education.link, '_blank');
    }

    const handleOpenPdf = () => {
        window.open(diplomaPDF, '_blank');
    };

    return (
        <Card sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', height: '100%', width: '100%', mb: 1, borderRadius: '16px' }}>
            <CardContent>
                <Typography variant="h5" mb={2}>Education</Typography>
                {educationData.map((education, index) => (
                    <div key={index}>
                        <Card sx={{ mb: 2 }}>
                            <CardContent>
                                <Grid container spacing={1}>
                                    <Grid item xs={12}>
                                        <Typography variant='body2' color='text.secondary'>
                                            {education.degree && `${education.degree} -`} {education.school}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container spacing={1} alignItems='center'>
                                            {education.relevantCoursework.length > 0 && (
                                                <Grid item>
                                                    <Button
                                                        onClick={() => handleOpenPopUp(education)}
                                                        variant="contained"
                                                        color="primary"
                                                        style={{
                                                            color: "white",
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        Relevant Courses
                                                    </Button>
                                                </Grid>
                                            )}
                                            {education.diploma === "yes" && (
                                                <Grid item>
                                                    <Button
                                                        onClick={() => handleOpenPdf()}
                                                        variant="contained"
                                                        color="primary"
                                                        style={{
                                                            color: "white",
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        View Diploma
                                                    </Button>
                                                </Grid>
                                            )}
                                            <Grid item>
                                                <Button
                                                    onClick={() => handleOpenLink(education)}
                                                    variant="contained"
                                                    color="primary"
                                                    style={{
                                                        color: "white",
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    View Site
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </div>
                ))}
                {selectedEducation && (
                    <EducationPopUpCard open={openPopUp} onClose={handleClosePopUp} education={selectedEducation} />
                )}
            </CardContent>
        </Card >
    );
};

export default EducationCard;
