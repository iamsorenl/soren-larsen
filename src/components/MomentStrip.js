import React from 'react';
import { Box, ButtonBase } from '@mui/material';
import { alpha } from '@mui/material/styles';
import moments from '../data/moments.json';
import CyclingMedia from './CyclingMedia';
import { goToSection } from '../utils/goTo';

const INTERVALS = [5000, 6000, 7000, 8000]; // staggered so tiles don't flip together

const tileSx = {
    position: 'relative',
    display: 'block',
    width: '100%',
    aspectRatio: '16 / 10',
    borderRadius: '12px',
    overflow: 'hidden',
    border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.3)}`,
};

const MomentStrip = () => (
    <Box
        sx={{
            gridColumn: '1 / -1',
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
            gap: { xs: 1.5, md: 2 },
        }}
    >
        {moments.map((m, i) => {
            const media = <CyclingMedia items={m.items} intervalMs={INTERVALS[i % INTERVALS.length]} label={m.items[0].alt} />;
            return m.target ? (
                <ButtonBase
                    key={m.id}
                    data-testid="moment"
                    aria-label={m.items[0].alt}
                    onClick={() => goToSection(m.target)}
                    sx={{ ...tileSx, '&:focus-visible': { outline: '2px solid', outlineOffset: 2 } }}
                >
                    {media}
                </ButtonBase>
            ) : (
                <Box key={m.id} data-testid="moment" sx={tileSx}>
                    {media}
                </Box>
            );
        })}
    </Box>
);

export default MomentStrip;
