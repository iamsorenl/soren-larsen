import React, { useState } from 'react';
import { Fab, Tooltip, useTheme } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ChatPanel from './ChatPanel';
import { useChat } from './useChat';

function ChatWidget() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const chat = useChat();

    const handleClose = () => {
        chat.cancel();
        setOpen(false);
    };

    return (
        <>
            <Tooltip title="Ask my assistant" placement="left">
                <Fab
                    color="primary"
                    aria-label="Open chat with Soren's Assistant"
                    onClick={() => setOpen((v) => !v)}
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        zIndex: theme.zIndex.modal + 1,
                    }}
                >
                    <ChatIcon />
                </Fab>
            </Tooltip>
            <ChatPanel open={open} onClose={handleClose} chat={chat} />
        </>
    );
}

export default ChatWidget;
