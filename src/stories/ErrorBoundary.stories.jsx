import React from 'react';
import { Box, Typography } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';

const HealthyChild = () => (
    <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
            Happy path
        </Typography>
        <Typography variant="body1" color="text.secondary">
            This child renders without throwing, so the ErrorBoundary passes it
            through untouched.
        </Typography>
    </Box>
);

const BrokenChild = () => {
    throw new Error('Intentional render error for Storybook preview');
};

const meta = {
    title: 'Components/ErrorBoundary',
    component: ErrorBoundary,
    parameters: {
        docs: {
            description: {
                component:
                    'Top-level error boundary used to guard the app shell. Catches render-time errors and shows a reload prompt.'
            }
        }
    }
};

export default meta;

export const Default = {
    name: 'Healthy children',
    render: () => (
        <ErrorBoundary>
            <HealthyChild />
        </ErrorBoundary>
    )
};

export const CaughtError = {
    name: 'Caught render error',
    render: () => (
        <ErrorBoundary>
            <BrokenChild />
        </ErrorBoundary>
    )
};
