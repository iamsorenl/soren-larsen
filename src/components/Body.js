import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AboutCard from './AboutCard';

function Body() {
    return (
        <Box sx={{ mx: 4 }}>
            <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
                <Grid item xs={12}>
                    <AboutCard />
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ bgcolor: 'lightgray', p: 2, textAlign: 'center', mt: 2 }}>placeholder</Box>
                </Grid>
                <Grid item xs={4}>
                    <Box sx={{ bgcolor: 'lightgray', p: 2, textAlign: 'center', mt: 2 }}>placeholder</Box>
                </Grid>
                <Grid item xs={4}>
                    <Box sx={{ bgcolor: 'lightgray', p: 2, textAlign: 'center', mt: 2 }}>placeholder</Box>
                </Grid>
                <Grid item xs={4}>
                    <Box sx={{ bgcolor: 'lightgray', p: 2, textAlign: 'center', mt: 2 }}>placeholder</Box>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Body;
