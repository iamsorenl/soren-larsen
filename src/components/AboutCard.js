import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import about from '../data/about';
import aiSuit from '../images/AI-Suit.jpeg';
import graduate from '../images/Graduate.jpeg';
import surf from '../images/Surf.jpeg';

const imageUrls = [aiSuit, graduate, surf];

const AboutCard = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [nextImageIndex, setNextImageIndex] = useState(1);
    const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth <= 1208);

    const handleResize = () => {
        setIsScreenSmall(window.innerWidth <= 1208);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
            setNextImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
        }, 30000); // Change image every 30 seconds

        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const backgroundImageStyle = {
        backgroundImage: `url(${imageUrls[currentImageIndex]})`,
        transition: 'background-image 2s',
    };

    return (
        <Card sx={{ borderRadius: '16px', backgroundColor: 'primary.main', color: 'primary.contrastText', }}>
            <Box display="flex">
                <Stack direction={isScreenSmall ? 'column' : 'row'} alignItems={isScreenSmall ? 'center' : 'stretch'}>
                    <CardMedia
                        component="div"
                        sx={{
                            width: '350px',
                            height: '350px',
                            borderRadius: '16px',
                            minWidth: '350px',
                            ...backgroundImageStyle,
                        }}
                    />
                    <Box flexGrow={1} display="flex" flexDirection="column" sx={{ textAlign: isScreenSmall ? 'center' : 'left', alignSelf: 'center' }}>
                        <Typography variant="h5" component="div" align="center" mb={1}>
                            About
                        </Typography>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary">
                                        {about[0].about}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Box>
                </Stack>
            </Box>
            <style>
                {`
                    .MuiCardMedia-root {
                        background-image: url(${imageUrls[nextImageIndex]});
                    }
                `}
            </style>
        </Card>
    );
};

export default AboutCard;
