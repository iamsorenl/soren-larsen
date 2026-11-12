import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Horizontal bars from a write-up's real numbers: { metric, bars: [[label, value], ...] }.
const ResultChart = ({ results }) => {
    const max = Math.max(...results.bars.map(([, v]) => v));
    return (
        <Box
            sx={{
                height: '100%',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 0.75,
                bgcolor: (t) => (t.palette.mode === 'dark' ? '#0d1240' : '#eef0fb'),
            }}
        >
            {results.bars.map(([label, value]) => {
                const pct = Math.round((value / max) * 100);
                return (
                    <Box key={label}>
                        <Typography variant="caption" color="text.secondary" component="div" sx={{ lineHeight: 1.3 }}>
                            {label}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                data-testid="bar"
                                data-pct={pct}
                                sx={{
                                    height: 12,
                                    width: `${pct}%`,
                                    maxWidth: 'calc(100% - 52px)',
                                    borderRadius: 1,
                                    bgcolor: (t) => alpha(t.palette.primary.main, value === max ? 0.9 : 0.45),
                                }}
                            />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {value}
                            </Typography>
                        </Box>
                    </Box>
                );
            })}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                {results.metric}
            </Typography>
        </Box>
    );
};

export default ResultChart;
