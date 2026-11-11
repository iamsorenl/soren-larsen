import React from 'react';
import { Box, Button } from '@mui/material';
import NoteForm from './NoteForm';
import contact from '../../data/contact.json';

const SECTIONS = ['experience', 'projects', 'skills', 'education', 'contact'];
const TABS = ['play', 'research', 'how'];

function ExternalButton({ href, children }) {
    const external = !href.startsWith('mailto:');
    return (
        <Button
            component="a"
            href={href}
            size="small"
            variant="outlined"
            {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
        >
            {children}
        </Button>
    );
}

function ContactButtons() {
    const c = contact[0];
    return (
        <>
            <ExternalButton href={`mailto:${c.email}`}>Email</ExternalButton>
            <ExternalButton href={c.linkedin}>LinkedIn</ExternalButton>
            <ExternalButton href={c.x}>X</ExternalButton>
            <ExternalButton href={c.github}>GitHub</ExternalButton>
            <ExternalButton href={c.resumeUrl}>Resume</ExternalButton>
        </>
    );
}

function goToSection({ section, tab }) {
    if (tab) window.dispatchEvent(new CustomEvent('portfolio:projects-tab', { detail: tab }));
    const el = document.getElementById(section);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
}

// The action comes from a response header: only known types render.
function ChatAction({ action, onNavigate }) {
    let body = null;
    switch (action?.type) {
        case 'contact':
            body = <ContactButtons />;
            break;
        case 'note':
            body = <NoteForm />;
            break;
        case 'section':
            if (!SECTIONS.includes(action.section)) return null;
            body = (
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                        goToSection({ section: action.section, tab: TABS.includes(action.tab) ? action.tab : undefined });
                        // On mobile the panel covers the page.
                        if (onNavigate) onNavigate();
                    }}
                >
                    Take me there
                </Button>
            );
            break;
        case 'demo':
            if (typeof action.url !== 'string' || !action.url.startsWith('https://')) return null;
            body = <ExternalButton href={action.url}>{`Open ${action.title}`}</ExternalButton>;
            break;
        default:
            return null;
    }
    return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>{body}</Box>;
}

export default ChatAction;
