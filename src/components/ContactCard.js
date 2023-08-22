import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import contactInfo from '../data/contact';

const ContactCard = () => {
    const { phone, email, github, linkedin } = contactInfo[0];
    const resumePDFURL = process.env.PUBLIC_URL + '/path/to/your/resume.pdf';

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 1190); // Adjust the breakpoint as needed

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 1190); // Adjust the breakpoint as needed
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleEmailClick = () => {
        window.location.href = `mailto:${email}`;
    };

    const handleLinkClick = (link) => {
        window.open(link, '_blank');
    };

    const handleOpenPdf = () => {
        window.open(resumePDFURL, '_blank');
    };

    const truncateLink = (url) => {
        const truncatedUrl = url.replace(/^https?:\/\/(www\.)?/, '');
        return truncatedUrl;
    };

    const smallTextStyle = {
        fontSize: isSmallScreen ? '13px' : 'inherit', // Adjust the font size as needed
    };

    return (
        <Card sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', width: '100%', mb: 1, borderRadius: '16px' }}>
            <CardContent>
                <Typography variant='h6' mb={1}>Contact</Typography>
                <Card sx={{ mb: 1 }}>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon />
                            <Typography variant='body2' color='text.secondary' style={smallTextStyle}>
                                {phone}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <EmailIcon />
                            <Button onClick={handleEmailClick} sx={{ color: 'primary.contrastText', padding: 0 }}>
                                <Typography variant='body2' color='text.secondary' style={smallTextStyle}>
                                    {email}
                                </Typography>
                            </Button>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <GitHubIcon />
                            <Tooltip title={github} placement="top">
                                <Button onClick={() => handleLinkClick(github)} sx={{ color: 'primary.contrastText', padding: 0 }}>
                                    <Typography variant='body2' color='text.secondary' style={smallTextStyle}>
                                        {truncateLink(github)}
                                    </Typography>
                                </Button>
                            </Tooltip>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <LinkedInIcon />
                            <Tooltip title={linkedin} placement="top">
                                <Button onClick={() => handleLinkClick(linkedin)} sx={{ color: 'primary.contrastText', padding: 0 }}>
                                    <Typography variant='body2' color='text.secondary' style={smallTextStyle}>
                                        {truncateLink(linkedin)}
                                    </Typography>
                                </Button>
                            </Tooltip>
                        </Stack>
                    </CardContent>
                </Card>
                <Typography variant='h6' mb={1}>Resume</Typography>
                <Card>
                    <CardContent>
                        <Button onClick={handleOpenPdf} variant="contained" color="primary">
                            Open Resume
                        </Button>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
};

export default ContactCard;
