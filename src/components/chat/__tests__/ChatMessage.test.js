import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChatMessage from '../ChatMessage';
import contact from '../../../data/contact.json';

function renderMessage(content) {
    return render(
        <ThemeProvider theme={createTheme()}>
            <ChatMessage role="assistant" content={content} isStreaming={false} />
        </ThemeProvider>
    );
}

test('renders **bold** runs as bold text without the asterisks', () => {
    renderMessage('He was a **Founding Engineer** at **Levangie**, see https://larsensoren.com');
    expect(screen.queryByText(/\*\*/)).toBeNull();
    expect(screen.getByText('Founding Engineer').tagName).toBe('STRONG');
    expect(screen.getByText('Levangie').tagName).toBe('STRONG');
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://larsensoren.com');
});

function renderAction(action, onNavigate) {
    return render(
        <ThemeProvider theme={createTheme()}>
            <ChatMessage role="assistant" content="hi" action={action} onNavigate={onNavigate} isStreaming={false} />
        </ThemeProvider>
    );
}

test('contact action renders 5 buttons with hrefs from contact.json and no phone', () => {
    const { container } = renderAction({ type: 'contact' });
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([
        `mailto:${contact[0].email}`, contact[0].linkedin, contact[0].x, contact[0].github, contact[0].resumeUrl,
    ]);
    expect(container.textContent).not.toContain(contact[0].phone);
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('target', '_blank');
});

test('demo action opens https url in a new tab; non-https renders nothing', () => {
    const { unmount } = renderAction({ type: 'demo', title: 'Chat', url: 'https://example.com/d' });
    const a = screen.getByRole('link', { name: 'Open Chat' });
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('href', 'https://example.com/d');
    unmount();
    renderAction({ type: 'demo', title: 'Bad', url: 'http://example.com/insecure' });
    expect(screen.queryByRole('link', { name: /Open/ })).toBeNull();
});

test('section action scrolls and dispatches the tab event', () => {
    const el = document.createElement('div');
    el.id = 'projects';
    el.getBoundingClientRect = () => ({ top: 500 });
    document.body.appendChild(el);
    const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const onNavigate = jest.fn();
    const handler = jest.fn();
    window.addEventListener('portfolio:projects-tab', handler);
    renderAction({ type: 'section', section: 'projects', tab: 'play' }, onNavigate);
    fireEvent.click(screen.getByRole('button', { name: 'Take me there' }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 420, behavior: 'smooth' });
    expect(onNavigate).toHaveBeenCalledTimes(1);
    scrollTo.mockRestore();
    expect(handler.mock.calls[0][0].detail).toBe('play');
    window.removeEventListener('portfolio:projects-tab', handler);
    el.remove();
});

test('unknown action types render nothing', () => {
    renderAction({ type: 'evil' });
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
});
