import React, { useEffect, useState } from 'react';
import { Box, Link, Typography, useTheme } from '@mui/material';

const URL_REGEX = /https?:\/\/[^\s<>()]+[^\s<>().,;:!?]/g;

// Walks `content`, splitting it into plain-text runs and URL runs without
// relying on `.test()` (which has a sticky-lastIndex bug under the /g flag).
function renderRichContent(content) {
    if (!content) return null;
    const out = [];
    let cursor = 0;
    let key = 0;
    const re = new RegExp(URL_REGEX);
    let match;
    while ((match = re.exec(content)) !== null) {
        if (match.index > cursor) {
            out.push(<React.Fragment key={key++}>{content.slice(cursor, match.index)}</React.Fragment>);
        }
        out.push(
            <Link
                key={key++}
                href={match[0]}
                target="_blank"
                rel="noopener noreferrer"
                underline="always"
                sx={{
                    // Mode-aware link color so it never falls back to MUI's
                    // default magenta. Dark mode pulls the warm yellow accent
                    // already used on the Education card; light mode uses the
                    // classic Material "link blue".
                    color: (theme) =>
                        theme.palette.mode === 'dark' ? '#fdc700' : '#64b5f6',
                    fontWeight: 600,
                    wordBreak: 'break-all',
                }}
            >
                {match[0]}
            </Link>
        );
        cursor = match.index + match[0].length;
    }
    if (cursor < content.length) {
        out.push(<React.Fragment key={key++}>{content.slice(cursor)}</React.Fragment>);
    }
    return out;
}

function ChatMessage({ role, content, isStreaming }) {
    const theme = useTheme();
    const isUser = role === 'user';
    const showDots = !isUser && isStreaming && !content;

    const [dotCount, setDotCount] = useState(1);
    useEffect(() => {
        if (!showDots) {
            setDotCount(1);
            return undefined;
        }
        const id = setInterval(() => {
            setDotCount((n) => (n % 3) + 1);
        }, 400);
        return () => clearInterval(id);
    }, [showDots]);

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
                    {showDots ? (
                        <Box
                            component="span"
                            data-testid="dots-placeholder"
                            sx={{ opacity: 0.7, fontStyle: 'italic' }}
                        >
                            {'.'.repeat(dotCount)}
                        </Box>
                    ) : (
                        <>
                            {renderRichContent(content)}
                            {isStreaming && content && (
                                <Box component="span" sx={{ ml: 0.25, animation: 'blink 1s steps(2, start) infinite' }}>
                                    ▍
                                </Box>
                            )}
                        </>
                    )}
                </Typography>
            </Box>
            <style>{`@keyframes blink { to { visibility: hidden; } }`}</style>
        </Box>
    );
}

export default ChatMessage;
