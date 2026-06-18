import React, { useState, useEffect, useRef } from 'react';
import { Fab, Tooltip, Box, Typography, Fade, useTheme } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ChatPanel from './ChatPanel';
import { useChat } from './useChat';
import fabGlow from '../../images/marks/fab-glow.hdr.avif';

const NAV_SECTIONS = [
    'about',
    'experience',
    'projects',
    'skills',
    'education',
    'contact',
];
const PEEK_FLAG_KEY = 'chat-widget-peeked';
const PEEK_DELAY_MS = 1200;
const PEEK_DURATION_MS = 6000;
const WIGGLE_DURATION_MS = 700;

const readStorage = (key) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};
const writeStorage = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        // privacy mode / quota exceeded — silently skip
    }
};

function ChatWidget() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [showPeek, setShowPeek] = useState(false);
    const [wiggle, setWiggle] = useState(false);
    const chat = useChat();

    const lastSectionRef = useRef(null);
    const wiggleTimerRef = useRef(null);
    const peekTimersRef = useRef([]);

    // First-visit peek: appears once, then never again on this device
    useEffect(() => {
        if (readStorage(PEEK_FLAG_KEY)) return undefined;
        const showTimer = setTimeout(() => setShowPeek(true), PEEK_DELAY_MS);
        const hideTimer = setTimeout(() => {
            setShowPeek(false);
            writeStorage(PEEK_FLAG_KEY, '1');
        }, PEEK_DELAY_MS + PEEK_DURATION_MS);
        peekTimersRef.current.push(showTimer, hideTimer);
        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    // Section-change wiggle: each time the active section transitions, the
    // FAB does a brief shake. The initial section landing on load doesn't
    // count (lastSectionRef is null until the first scroll observation).
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100;
            let current = null;
            for (let i = NAV_SECTIONS.length - 1; i >= 0; i--) {
                const section = document.getElementById(NAV_SECTIONS[i]);
                if (section && section.offsetTop <= scrollPosition) {
                    current = NAV_SECTIONS[i];
                    break;
                }
            }
            if (
                current &&
                lastSectionRef.current &&
                current !== lastSectionRef.current
            ) {
                setWiggle(true);
                if (wiggleTimerRef.current) clearTimeout(wiggleTimerRef.current);
                wiggleTimerRef.current = setTimeout(() => {
                    setWiggle(false);
                    wiggleTimerRef.current = null;
                }, WIGGLE_DURATION_MS);
            }
            if (current) lastSectionRef.current = current;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // seed lastSectionRef without triggering wiggle
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (wiggleTimerRef.current) clearTimeout(wiggleTimerRef.current);
        };
    }, []);

    const dismissPeek = () => {
        setShowPeek(false);
        writeStorage(PEEK_FLAG_KEY, '1');
        peekTimersRef.current.forEach(clearTimeout);
        peekTimersRef.current = [];
    };

    const handleOpen = () => {
        dismissPeek();
        setOpen(true);
    };

    const handleClose = () => {
        chat.cancel();
        setOpen(false);
    };

    return (
        <>
            {!open && (
                <>
                    <Fade in={showPeek} timeout={350}>
                        <Box
                            component="button"
                            type="button"
                            onClick={handleOpen}
                            aria-label="Open chat with Soren's assistant"
                            sx={{
                                position: 'fixed',
                                bottom: 26,
                                right: 84,
                                zIndex: theme.zIndex.modal + 1,
                                pointerEvents: showPeek ? 'auto' : 'none',
                                backgroundColor: 'background.paper',
                                border: (t) => `1px solid ${t.palette.divider}`,
                                borderRadius: '14px',
                                px: 2,
                                py: 1.1,
                                boxShadow: 4,
                                cursor: 'pointer',
                                font: 'inherit',
                                color: 'inherit',
                                transition: 'border-color 0.2s ease, transform 0.2s ease',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    transform: 'translateX(-2px)',
                                },
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    right: -6,
                                    top: '50%',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    width: 10,
                                    height: 10,
                                    backgroundColor: 'background.paper',
                                    borderRight: (t) => `1px solid ${t.palette.divider}`,
                                    borderTop: (t) => `1px solid ${t.palette.divider}`,
                                },
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 500,
                                    color: 'text.primary',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Ask me about Soren →
                            </Typography>
                        </Box>
                    </Fade>

                    <Box
                        component="img"
                        src={fabGlow}
                        alt=""
                        aria-hidden="true"
                        sx={{
                            position: 'fixed',
                            bottom: -4,
                            right: -4,
                            width: 96,
                            height: 96,
                            pointerEvents: 'none',
                            zIndex: theme.zIndex.modal,
                        }}
                    />

                    <Tooltip title="Ask my assistant" placement="left">
                        <Fab
                            color="primary"
                            aria-label="Open chat with Soren's Assistant"
                            onClick={handleOpen}
                            sx={{
                                position: 'fixed',
                                bottom: 16,
                                right: 16,
                                zIndex: theme.zIndex.modal + 1,
                                animation: wiggle
                                    ? `chat-fab-wiggle ${WIGGLE_DURATION_MS}ms ease-in-out`
                                    : 'none',
                                '@keyframes chat-fab-wiggle': {
                                    '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
                                    '15%': { transform: 'translateX(-4px) rotate(-6deg)' },
                                    '30%': { transform: 'translateX(4px) rotate(6deg)' },
                                    '45%': { transform: 'translateX(-3px) rotate(-4deg)' },
                                    '60%': { transform: 'translateX(3px) rotate(4deg)' },
                                    '80%': { transform: 'translateX(-1px) rotate(-2deg)' },
                                },
                            }}
                        >
                            <ChatIcon />
                        </Fab>
                    </Tooltip>
                </>
            )}
            <ChatPanel open={open} onClose={handleClose} chat={chat} />
        </>
    );
}

export default ChatWidget;
