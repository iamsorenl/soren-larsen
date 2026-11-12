import React, { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ContactMail, Phone, Email, GitHub, LinkedIn, X as XIcon, EditNote } from '@mui/icons-material';
import contactInfo from '../data/contact';
import { FONT_DISPLAY, FONT_MONO } from '../theme';
import { NOTE_PROMPT } from './chat/chatConfig';
import SectionHeader from './SectionHeader';
import PaperPlanes from './PaperPlanes';

const openNote = () => window.dispatchEvent(new CustomEvent('portfolio:open-chat', { detail: { prompt: NOTE_PROMPT } }));

// Lets an address wrap only after @, / or - (e.g. "iamsorenl@ gmail.com"),
// never mid-word.
const softBreaks = (v) => v.split(/(?<=[@/-])/).flatMap((part, i) => (i ? [<wbr key={i} />, part] : [part]));

// Example notes the bubble types out. Wording approved by Soren 2026-11-12.
const BUBBLE_LINES = ['Hey Soren, loved the No RAGrets demo…', 'Are you open to talking about a role?', 'Want to grab coffee in SF?'];
const BUBBLE_LABEL = 'click to write me a note';

// Types each line, holds, deletes, moves on. Reduced motion: first line, still.
const useTyped = (lines, reduced) => {
    const [text, setText] = useState(reduced ? lines[0] : '');
    useEffect(() => {
        if (reduced) { setText(lines[0]); return undefined; }
        let qi = 0;
        let ci = 0;
        let dir = 1;
        const id = setInterval(() => {
            const L = lines[qi];
            if (dir === 1) { ci += 1; if (ci > L.length + 30) dir = -1; } else {
                ci -= 2;
                if (ci <= 0) { ci = 0; dir = 1; qi = (qi + 1) % lines.length; }
            }
            setText(L.slice(0, Math.min(ci, L.length)));
        }, 60);
        return () => clearInterval(id);
    }, [lines, reduced]);
    return text;
};

const ContactCard = () => {
    const { phone, email, github, linkedin, x } = contactInfo[0];
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const typed = useTyped(BUBBLE_LINES, reduced);
    const cardRef = useRef(null);
    const [target, setTarget] = useState(null);

    const tiles = [
        { label: 'Phone', href: `tel:${phone.replace(/[^\d+]/g, '')}`, value: phone, icon: <Phone /> },
        { label: 'Email', href: `mailto:${email}`, value: email, icon: <Email /> },
        { label: 'GitHub', href: github, value: github.replace(/^https?:\/\//, ''), icon: <GitHub />, external: true },
        { label: 'LinkedIn', href: linkedin, value: linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, '').replace(/\/$/, ''), icon: <LinkedIn />, external: true },
        { label: 'X', href: x, value: `@${x.replace(/\/$/, '').split('/').pop()}`, icon: <XIcon />, external: true },
    ];

    const aim = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const c = cardRef.current.getBoundingClientRect();
        setTarget({ x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2, rx: r.width * 0.7, ry: r.height * 0.75 });
    };

    return (
        <Card
            ref={cardRef}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'background.paper',
                borderRadius: '16px',
                height: '100%',
                border: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
            }}
        >
            <PaperPlanes target={target} />
            <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 4 } }}>
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

                <Box
                    component="ul"
                    aria-label="Ways to reach me"
                    sx={{
                        listStyle: 'none',
                        p: 0,
                        m: 0,
                        mt: 3,
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(5, minmax(0, 1fr))' },
                        gap: 1.25,
                    }}
                >
                    {tiles.map((t) => (
                        <li key={t.label}>
                            <Tooltip title={t.value} arrow placement="top" componentsProps={{ tooltip: { sx: { fontFamily: FONT_MONO } } }}>
                                <Box
                                    component="a"
                                    href={t.href}
                                    target={t.external ? '_blank' : undefined}
                                    rel={t.external ? 'noopener noreferrer' : undefined}
                                    onMouseEnter={aim}
                                    onFocus={aim}
                                    onMouseLeave={() => setTarget(null)}
                                    onBlur={() => setTarget(null)}
                                    sx={(th) => ({
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 0.75,
                                        py: 1.75,
                                        px: 0.75,
                                        height: '100%',
                                        boxSizing: 'border-box',
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        color: 'text.primary',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        bgcolor: 'background.paper',
                                        border: `1px solid ${alpha(th.palette.primary.main, 0.3)}`,
                                        transition: reduced ? 'none' : 'transform .18s, background-color .18s, border-color .18s, box-shadow .18s',
                                        '& svg': { color: th.palette.mode === 'dark' ? 'primary.light' : 'primary.main' },
                                        '&:hover, &:focus-visible': {
                                            transform: reduced ? 'none' : 'translateY(-3px)',
                                            borderColor: 'primary.main',
                                            bgcolor: alpha(th.palette.primary.main, 0.14),
                                            boxShadow: `0 6px 20px ${alpha(th.palette.primary.main, 0.25)}`,
                                            outline: 'none',
                                        },
                                    })}
                                >
                                    {t.icon}
                                    {t.label}
                                    <Box
                                        component="span"
                                        sx={{ display: 'none', fontFamily: FONT_MONO, fontSize: 11, fontWeight: 400, color: 'text.secondary', overflowWrap: 'anywhere', textAlign: 'center', '@media (hover: none)': { display: 'block' } }}
                                    >
                                        {softBreaks(t.value)}
                                    </Box>
                                </Box>
                            </Tooltip>
                        </li>
                    ))}
                </Box>

                <Box sx={{ position: 'relative', height: 110, mt: 2 }}>
                    <Box
                        component="button"
                        type="button"
                        onClick={openNote}
                        aria-label="Write me a note"
                        sx={(th) => ({
                            position: 'absolute',
                            left: 0,
                            bottom: 22,
                            maxWidth: '100%',
                            textAlign: 'left',
                            cursor: 'pointer',
                            font: 'inherit',
                            fontSize: 14,
                            color: 'text.primary',
                            bgcolor: th.palette.mode === 'dark' ? '#1f2457' : alpha(th.palette.primary.main, 0.08),
                            border: `1px solid ${alpha(th.palette.primary.main, 0.4)}`,
                            borderRadius: '14px 14px 14px 4px',
                            px: 1.75,
                            py: 1.25,
                            transition: 'border-color .2s',
                            '&:hover, &:focus-visible': { borderColor: 'primary.main', outline: 'none' },
                            '@keyframes caret': { '50%': { opacity: 0 } },
                        })}
                    >
                        <span aria-hidden="true">{typed}</span>
                        <Box component="span" aria-hidden="true" sx={{ display: 'inline-block', width: 7, height: 15, ml: 0.25, verticalAlign: -2, bgcolor: 'primary.main', animation: reduced ? 'none' : 'caret 1s steps(1) infinite' }} />
                        <Box component="small" aria-hidden="true" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 10, color: 'text.secondary', mt: 0.5 }}>
                            <EditNote sx={{ fontSize: 12 }} /> {BUBBLE_LABEL}
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ContactCard;
