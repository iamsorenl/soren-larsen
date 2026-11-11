import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { sendNote } from './chatApi';
import ChatAction from './ChatAction';

// Leave-a-note form shown inside the chat. The worker holds the destination
// address; nothing about it lives here.
function NoteForm() {
    const [fields, setFields] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | sending | sent | error

    const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

    async function submit(e) {
        e.preventDefault();
        setStatus('sending');
        try {
            await sendNote(fields);
            setStatus('sent');
        } catch {
            setStatus('error');
        }
    }

    if (status === 'sent') return <Typography variant="body2">Sent. Soren will reply by email.</Typography>;

    return (
        <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            <TextField label="Name" size="small" required value={fields.name} onChange={set('name')} inputProps={{ maxLength: 100 }} />
            <TextField label="Email" type="email" size="small" required value={fields.email} onChange={set('email')} inputProps={{ maxLength: 200 }} />
            <TextField label="Message" size="small" required multiline minRows={3} value={fields.message} onChange={set('message')} inputProps={{ minLength: 10, maxLength: 2000 }} />
            <Button type="submit" size="small" variant="contained" disabled={status === 'sending'} sx={{ alignSelf: 'flex-start' }}>
                Send
            </Button>
            {status === 'error' && (
                <>
                    <Typography variant="body2" role="alert">Could not send your note. You can reach Soren here instead.</Typography>
                    <ChatAction action={{ type: 'contact' }} />
                </>
            )}
        </Box>
    );
}

export default NoteForm;
