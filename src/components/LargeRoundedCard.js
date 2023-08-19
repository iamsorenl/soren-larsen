import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Drawer from '@mui/material/Drawer';

const SmallCard = ({ title, icon }) => {
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    return (
        <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <IconButton color="primary" onClick={toggleDrawer}>
                {icon}
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1 }}>
                {title}
            </Typography>
            <IconButton onClick={toggleDrawer}>
                <ChevronRightIcon />
            </IconButton>
            <Drawer anchor="right" open={isDrawerOpen} onClose={toggleDrawer}>
                <div>
                    {/* Drawer content */}
                    <Typography variant="h6">{title}</Typography>
                    {/* Add more content for the drawer */}
                </div>
            </Drawer>
        </Card>
    );
};

const LargeRoundedCard = () => {
    const smallCards = [
        { title: 'Card 1', icon: <ChevronRightIcon /> },
        { title: 'Card 2', icon: <ChevronRightIcon /> },
        { title: 'Card 3', icon: <ChevronRightIcon /> },
    ];

    return (
        <Card sx={{ width: '100%', border: '1px solid #ccc', mb: 1, borderRadius: '16px' }}>
            <CardContent>
                <Typography variant="h5">Large Rounded Card</Typography>
                {smallCards.map((card, index) => (
                    <SmallCard key={index} title={card.title} icon={card.icon} />
                ))}
            </CardContent>
        </Card>
    );
};

export default LargeRoundedCard;
