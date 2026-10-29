import React from 'react';
import { render, screen } from '@testing-library/react';
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
    renderMessage('He was a **Founding Engineer** at **Levangie**, see https://larsensoren.com');
    expect(screen.queryByText(/\*\*/)).toBeNull();
    expect(screen.getByText('Founding Engineer').tagName).toBe('STRONG');
    expect(screen.getByText('Levangie').tagName).toBe('STRONG');
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://larsensoren.com');
});
