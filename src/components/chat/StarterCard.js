import React from 'react';
import { Box, Chip, Fade, IconButton, Typography, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { STARTER_PROMPTS } from './chatConfig';

// FAB is 56px at bottom 16, so the card's bottom edge sits 16px above its top.
export const STARTER_CARD_BOTTOM = 56 + 16 + 16;

function StarterCard({ onSelect, onClose, zIndex }) {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const card = (
        <Box
            sx={{
                position: 'fixed',
                bottom: STARTER_CARD_BOTTOM,
                right: 16,
                width: 240,
                maxWidth: 'calc(100vw - 32px)',
                zIndex,
                p: 1.5,
                backgroundColor: 'background.paper',
                border: (t) => `1px solid ${t.palette.divider}`,
                borderRadius: '14px',
                boxShadow: 4,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Ask me about Soren
                </Typography>
                <IconButton size="small" aria-label="Close" onClick={onClose} sx={{ mr: -0.5 }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {STARTER_PROMPTS.map((p) => (
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
    return reduced ? card : <Fade in appear timeout={350}>{card}</Fade>;
}

export default StarterCard;
