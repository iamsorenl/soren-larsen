import React from 'react';
import { Card, CardContent, Typography, Box, Button, Stack, Link } from '@mui/material';
import { ContactMail, Email, LinkedIn, X as XIcon, EditNote } from '@mui/icons-material';
import contactInfo from '../data/contact';
import { FONT_DISPLAY } from '../theme';
import { NOTE_PROMPT } from './chat/chatConfig';
import SectionHeader from './SectionHeader';
import WaveLine from './WaveLine';

const openNote = () => window.dispatchEvent(new CustomEvent('portfolio:open-chat', { detail: { prompt: NOTE_PROMPT } }));

const ContactCard = () => {
    const { phone, email, github, linkedin, x } = contactInfo[0];
    const big = { px: 3, py: 1.25, fontSize: '1rem', textTransform: 'none', fontWeight: 600 };
    const links = [
        { label: 'Email', href: `mailto:${email}`, icon: <Email /> },
        { label: 'LinkedIn', href: linkedin, icon: <LinkedIn />, external: true },
        { label: 'X', href: x, icon: <XIcon />, external: true },
    ];

    return (
        <Card
            sx={{
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'background.paper',
                borderRadius: '16px',
                height: '100%',
                border: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
            }}
        >
            <WaveLine />
            <CardContent sx={{ position: 'relative', p: { xs: 3, md: 4 }, pb: { xs: 10, md: 12 } }}>
                <SectionHeader eyebrow="Contact" title="Get in touch" icon={<ContactMail />} />

                <Typography
                    component="h3"
                    sx={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.5rem' }, lineHeight: 1.15, mt: 1 }}
                >
                    Want to build something together?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 560 }}>
                    Leave me a note and it goes straight to my inbox, or reach me wherever you like.
                </Typography>

                <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1.5} sx={{ mt: 3 }}>
                    <Button variant="contained" size="large" startIcon={<EditNote />} onClick={openNote} sx={big}>
                        Leave me a note
                    </Button>
                    {links.map((l) => (
                        <Button
                            key={l.label}
                            component="a"
                            href={l.href}
                            target={l.external ? '_blank' : undefined}
                            rel={l.external ? 'noopener noreferrer' : undefined}
                            variant="outlined"
                            size="large"
                            startIcon={l.icon}
                            aria-label={l.label}
                            sx={big}
                        >
                            {l.label}
                        </Button>
                    ))}
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Write to <Link href={`mailto:${email}`}>{email}</Link>, call{' '}
                    <Link href={`tel:${phone}`}>{phone}</Link>, or find my code on{' '}
                    <Link href={github} target="_blank" rel="noopener noreferrer">GitHub</Link>.
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ContactCard;
