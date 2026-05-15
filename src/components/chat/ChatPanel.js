import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ChatMessage from './ChatMessage';
import SuggestedPrompts from './SuggestedPrompts';
import { ERROR_COPY } from './chatConfig';

function ChatPanel({ open, onClose, chat }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const [draft, setDraft] = useState('');

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat.messages, chat.status]);

    useEffect(() => {
        if (!open) return undefined;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    const submit = () => {
        if (!draft.trim() || chat.status === 'streaming') return;
        chat.send(draft);
        setDraft('');
    };

    const onSelectPrompt = (text) => {
        chat.send(text);
    };

    const panelSx = isMobile
        ? {
            position: 'fixed',
            inset: 'auto 0 0 0',
            height: '85vh',
            borderRadius: '16px 16px 0 0',
            zIndex: theme.zIndex.modal,
        }
        : {
            position: 'fixed',
            bottom: 88,
            right: 16,
            width: 380,
            height: 560,
            borderRadius: 2,
            zIndex: theme.zIndex.modal,
        };

    return (
        <>
            {isMobile && (
                <Box
                    onClick={onClose}
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        zIndex: theme.zIndex.modal - 1,
                    }}
                />
            )}
            <Box
                role="dialog"
                aria-label="Soren's Assistant"
                sx={{
                    ...panelSx,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Soren's Assistant</Typography>
                    <IconButton size="small" onClick={onClose} aria-label="Close chat"><CloseIcon /></IconButton>
                </Box>

                <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1 }}>
                    {chat.messages.length === 0 ? (
                        <SuggestedPrompts onSelect={onSelectPrompt} />
                    ) : (
                        chat.messages.map((m, i) => (
                            <ChatMessage
                                key={i}
                                role={m.role}
                                content={m.content}
                                isStreaming={chat.status === 'streaming' && i === chat.messages.length - 1 && m.role === 'assistant'}
                            />
                        ))
                    )}
                    {chat.status === 'rateLimited' && (
                        <ChatMessage role="assistant" content={ERROR_COPY.rateLimited} isStreaming={false} />
                    )}
                </Box>

                {(chat.status === 'error') && (
                    <Box sx={{ px: 2, py: 1, bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText }}>
                        <Typography variant="caption">
                            {chat.errorKind === 'upstream' ? ERROR_COPY.upstream : ERROR_COPY.network}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <TextField
                        inputRef={inputRef}
                        fullWidth
                        size="small"
                        placeholder="Ask about Soren's experience..."
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                submit();
                            }
                        }}
                        disabled={chat.status === 'streaming'}
                    />
                    <IconButton color="primary" onClick={submit} disabled={!draft.trim() || chat.status === 'streaming'} aria-label="Send">
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>
        </>
    );
}

export default ChatPanel;
