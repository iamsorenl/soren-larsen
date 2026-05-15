import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { GREETING, SUGGESTED_PROMPTS } from './chatConfig';

function SuggestedPrompts({ onSelect }) {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
                {GREETING}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {SUGGESTED_PROMPTS.map((p) => (
                    <Chip
                        key={p}
                        label={p}
                        onClick={() => onSelect(p)}
                        variant="outlined"
                        size="small"
                        sx={{ height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 } }}
                    />
                ))}
            </Box>
        </Box>
    );
}

export default SuggestedPrompts;
