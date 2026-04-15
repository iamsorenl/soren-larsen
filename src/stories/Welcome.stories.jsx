import React from 'react';
import { Box, Card, CardContent, Typography, Button, Stack, Chip } from '@mui/material';

const Welcome = () => (
    <Box sx={{ p: 4, minHeight: '80vh' }}>
        <Typography variant="h3" gutterBottom>
            Component Playground
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
            Storybook is wired up with the MUI theme. Use the toolbar sun/moon toggle
            to switch between light and dark modes.
        </Typography>

        <Card sx={{ mt: 3, maxWidth: 520 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Theme preview
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    This card uses the real MUI theme from <code>src/theme.js</code>.
                    Shadows, colors, and typography should match the live site.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip label="React" color="primary" />
                    <Chip label="MUI" color="secondary" />
                    <Chip label="Storybook" />
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Button variant="contained">Primary</Button>
                    <Button variant="outlined">Outlined</Button>
                    <Button variant="text">Text</Button>
                </Stack>
            </CardContent>
        </Card>
    </Box>
);

const meta = {
    title: 'Welcome',
    component: Welcome
};

export default meta;

export const Default = { args: {} };
