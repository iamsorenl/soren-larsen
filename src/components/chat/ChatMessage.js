import React from 'react';
import { Box, Link, Typography, useTheme } from '@mui/material';

// Splits text into runs alternating between plain strings and URL strings so
// the assistant's references like "https://larsensoren.com/SorenLarsenResume.pdf"
// render as clickable links. Avoids pulling in a markdown parser.
const URL_PATTERN = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?])/g;

function renderRichContent(content) {
    if (!content) return null;
    const parts = content.split(URL_PATTERN);
    return parts.map((part, i) => {
        if (URL_PATTERN.test(part)) {
            return (
                <Link
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{ color: 'inherit', fontWeight: 600 }}
                >
                    {part}
                </Link>
            );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
    });
}

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
                    {renderRichContent(content)}
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
