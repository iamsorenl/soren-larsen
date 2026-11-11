import React from 'react';
import { Box } from '@mui/material';
import projects from '../data/projects.json';
import DemoTile from './DemoTile';

const play = projects.filter((p) => p.tab === 'play');

const DemoStrip = () => (
    <Box
        sx={{
            gridColumn: '1 / -1',
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
            gap: { xs: 1.5, md: 2 },
        }}
    >
        {play.map((p) => (
            <DemoTile key={p.title} project={p} compact />
        ))}
    </Box>
);

export default DemoStrip;
