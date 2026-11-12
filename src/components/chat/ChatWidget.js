import React, { useState, useEffect, useRef } from 'react';
import { Fab, Tooltip, Box, useTheme } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ChatPanel from './ChatPanel';
import StarterCard from './StarterCard';
import { useChat } from './useChat';
import fabGlow from '../../images/marks/fab-glow.hdr.avif';

const NAV_SECTIONS = [
    'about',
    'experience',
    'projects',
    'education',
    'contact',
];
const STARTER_DELAY_MS = 4000;
const STARTER_FLAG_KEY = 'chatStarterDismissed';
const WIGGLE_DURATION_MS = 700;

const readFlag = () => {
    try {
        return sessionStorage.getItem(STARTER_FLAG_KEY) === '1';
    } catch {
        return false;
    }
};
const writeFlag = () => {
    try {
        sessionStorage.setItem(STARTER_FLAG_KEY, '1');
    } catch {
        // storage blocked: the in-memory state below still hides the card
    }
};

function ChatWidget() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [showStarter, setShowStarter] = useState(false);
    const [starterDismissed, setStarterDismissed] = useState(readFlag);
    const [wiggle, setWiggle] = useState(false);
    const chat = useChat();

    const lastSectionRef = useRef(null);
    const wiggleTimerRef = useRef(null);

    // Starter card: shows once per session after a short delay
    useEffect(() => {
        if (starterDismissed) return undefined;
        const t = setTimeout(() => setShowStarter(true), STARTER_DELAY_MS);
        return () => clearTimeout(t);
    }, [starterDismissed]);

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

    const dismissStarter = () => {
        setStarterDismissed(true);
        setShowStarter(false);
        writeFlag();
    };

    const handleOpen = () => {
        dismissStarter();
        setOpen(true);
    };

    const handleStarterSelect = (prompt) => {
        handleOpen();
        chat.send(prompt);
    };

    const handleClose = () => {
        chat.cancel();
        setOpen(false);
    };

    return (
        <>
            {!open && (
                <>
                    {showStarter && !starterDismissed && (
                        <StarterCard
                            onSelect={handleStarterSelect}
                            onClose={dismissStarter}
                            zIndex={theme.zIndex.modal + 1}
                        />
                    )}

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
