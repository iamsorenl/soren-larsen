import React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const CardComponent = () => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Card Title</Typography>
                <Typography variant="body2">
                    This is a sample card content.
                </Typography>
            </CardContent>
        </Card>
    );
};

const CardLayout = () => {
    return (
        <Container maxWidth="lg">
            <Grid container spacing={3}>
                {/* Column of Cards */}
                <Grid item xs={12} md={6}>
                    <CardComponent />
                </Grid>

                {/* Duplicate the Column of Cards in a Row */}
                <Grid item xs={12} md={6}>
                    <CardComponent />
                </Grid>
            </Grid>
        </Container>
    );
};

export default CardLayout;
