import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// images
import aiSuit from '../images/AI-Suit.jpeg';
import graduate from '../images/Graduate.jpeg';
import surf from '../images/Surf.jpeg';

const imageUrls = [
    aiSuit,
    graduate,
    surf,
];

const AboutCard = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [nextImageIndex, setNextImageIndex] = useState(1);
    const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth <= 1009);

    const handleResize = () => {
        setIsScreenSmall(window.innerWidth <= 1009);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
            setNextImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
        }, 30000); // Change image every 30 seconds

        // Add event listener to handle window resize
        window.addEventListener('resize', handleResize);

        // Clean up the event listener when the component unmounts
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const backgroundImageStyle = {
        backgroundImage: `url(${imageUrls[currentImageIndex]})`,
        transition: 'background-image 2s', // Apply the CSS transition
    };

    return (
        <Card sx={{ borderRadius: '16px' }}>
            <Box display="flex">
                <Stack direction={isScreenSmall ? 'column' : 'row'} alignItems={isScreenSmall ? 'center' : 'stretch'}>
                    {/* Left side (Image) */}
                    <CardMedia
                        component="div"
                        sx={{
                            width: '250px',
                            height: '250px',
                            borderRadius: '16px', // Rounded all the way around
                            minWidth: '250px', // Ensure fixed size even when shrunk
                            ...backgroundImageStyle,
                        }}
                    />

                    {/* Right side (Text) */}
                    <Box flexGrow={1} display="flex" flexDirection="column" sx={{ textAlign: isScreenSmall ? 'center' : 'left' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h5" component="div">
                                About
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '800px' }} mt={'5px'}>
                                My name is Soren and I recently received my Bachelor of Science in Computer Science from the University of California Santa Cruz. My expertise lies in the realm of software and application development. I have honed my skills in working with prominent frameworks like React, React Native, and Flutter, delivering seamless and user-friendly experiences. I am constantly driven to stay at the forefront of industry trends, diligently keeping up with the latest advancements. Currently, I am expanding my skillset into cutting-edge domains such as AI, ML, NLP, and cloud computing with AWS. Beyond software development, I find solace in the ocean. Surfing serves as both my personal escape and my means of giving back to the community, as I actively engage in teaching surf lessons to share the stoke.
                            </Typography>
                        </CardContent>
                    </Box>
                </Stack>
            </Box>
            {/* Update background image */}
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
