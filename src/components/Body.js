import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AboutCard from './AboutCard';
import CardLayout from './CardLayout';
import CopyrightCard from './Copyright';

function Body() {
    return (
        <Box sx={{ mx: 4 }}>
            <Grid container spacing={2} sx={{ mb: 1, mt: 1 }}>
                <Grid item xs={12} id="about">
                    <AboutCard />
                </Grid>
                <Grid item xs={12}>
                    <CardLayout />
                </Grid>
                <Grid item xs={12}>
                    <CopyrightCard />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Body;
