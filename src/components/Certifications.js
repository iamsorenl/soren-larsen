import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button'; // Import Button
import certifications from '../data/certifications'; // Adjust the path as necessary

const Certifications = () => {
    // Function to handle opening of links
    const handleOpenLink = (link) => {
        window.open(link, '_blank');
    };

    return (
        <Card sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', height: '100%', width: '100%', mb: 1, borderRadius: '16px' }}>
            <CardContent>
                <Typography variant='h5' mb={3.5}>Certifications</Typography>
                {certifications.map((certification, index) => (
                    <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant='body1' color='text.secondary'>{certification.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant='body2' color='text.secondary'>Issuer: {certification.issuer}</Typography>
                            <Typography variant='body2' color='text.secondary'>Date Earned: {certification.dateEarned}</Typography>
                            <Button
                                onClick={() => handleOpenLink(certification.link)}
                                variant="contained"
                                color="primary"
                                style={{
                                    color: "white",
                                    fontSize: '12px',
                                    marginTop: '8px'
                                }}
                            >
                                View Credential
                            </Button>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </CardContent>
        </Card>
    );
};

export default Certifications;
