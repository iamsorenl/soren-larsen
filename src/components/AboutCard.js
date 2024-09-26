import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import about from '../data/about';
import headshot1 from '../images/Headshot1.jpg';
import headshot2 from '../images/Headshot2.jpg';
import headshot3 from '../images/Headshot3.jpg';
import headshot4 from '../images/Headshot4.jpg';
import headshot5 from '../images/Headshot5.jpg';
import turtle from '../images/Turtle.jpg';
import surf from '../images/Surf.jpg';
import halfdome from '../images/HalfDome.jpg';

const imageUrls = [headshot5, headshot1, halfdome, headshot2, turtle, headshot3, headshot4, surf];

const AboutCard = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [nextImageIndex, setNextImageIndex] = useState(1);
    const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth <= 1422);

    const handleResize = () => {
        setIsScreenSmall(window.innerWidth <= 1422);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
            setNextImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
        }, 10000); // Change image every 10 seconds

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
        <Card sx={{ borderRadius: '16px', backgroundColor: 'primary.main', color: 'primary.contrastText', maxWidth: '100%' }}>
            <CardContent>
                <Typography variant="h3" component="div" mb={1}>
                    About
                </Typography>
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
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        {about[0].about}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Box>
                </Stack>
            </CardContent>
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
