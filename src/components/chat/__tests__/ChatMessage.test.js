import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChatMessage from '../ChatMessage';

function renderMessage(content) {
    return render(
        <ThemeProvider theme={createTheme()}>
            <ChatMessage role="assistant" content={content} isStreaming={false} />
        </ThemeProvider>
    );
}

test('renders **bold** runs as bold text without the asterisks', () => {
    const { container } = renderMessage('He was a **Founding Engineer** at **Levangie**, see https://larsensoren.com');
    expect(container.textContent).not.toContain('**');
    expect([...container.querySelectorAll('strong')].map((n) => n.textContent)).toEqual(['Founding Engineer', 'Levangie']);
    expect(container.querySelector('a').getAttribute('href')).toBe('https://larsensoren.com');
});
