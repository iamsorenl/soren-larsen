import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AboutCard from './AboutCard';
import CardLayout from './CardLayout';

function Body() {
    return (
        <Box sx={{ mx: 4 }}>
            <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
                <Grid item xs={12}>
                    <AboutCard />
                </Grid>
                <Grid item xs={12}>
                    <CardLayout />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Body;
