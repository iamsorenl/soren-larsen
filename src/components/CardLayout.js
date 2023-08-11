import React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const CardComponent = () => {
    return (
        <Card sx={{ width: '100%', border: '1px solid #ccc', mb: 1 }}>
            <CardContent>
                <Typography variant="h6">Card Title</Typography>
                <Typography variant="body2" color="text.secondary">
                    This is a sample card content.
                </Typography>
            </CardContent>
        </Card>
    );
};

const CardLayout = () => {
    return (
        <Container maxWidth="xl" sx={{ margin: 0, padding: 0 }}>
            <Grid container spacing={1}>
                {/* Column of Cards */}
                <Grid item xs={12} md={8}>
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                </Grid>
                {/* Duplicate the Column of Cards in a Row */}
                <Grid item xs={12} md={4}>
                    <CardComponent />
                </Grid>
            </Grid>
        </Container>
    );
};

export default CardLayout;
