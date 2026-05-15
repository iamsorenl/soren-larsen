import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

function ChatMessage({ role, content, isStreaming }) {
    const theme = useTheme();
    const isUser = role === 'user';
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                mb: 1,
            }}
        >
            <Box
                sx={{
                    maxWidth: '85%',
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: isUser ? theme.palette.primary.main : theme.palette.action.hover,
                    color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
                }}
                role={isUser ? undefined : 'log'}
                aria-live={isUser ? undefined : 'polite'}
            >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {content}
                    {isStreaming && content && (
                        <Box component="span" sx={{ ml: 0.25, animation: 'blink 1s steps(2, start) infinite' }}>
                            ▍
                        </Box>
                    )}
                </Typography>
            </Box>
            <style>{`@keyframes blink { to { visibility: hidden; } }`}</style>
        </Box>
    );
}

export default ChatMessage;
