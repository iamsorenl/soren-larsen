import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChatPanel from '../ChatPanel';

const theme = createTheme();

function withTheme(ui) {
    return <ThemeProvider theme={theme}>{ui}</ThemeProvider>;
}

function makeChat(overrides = {}) {
    return {
        messages: [],
        status: 'idle',
        errorKind: null,
        send: jest.fn(),
        cancel: jest.fn(),
        reset: jest.fn(),
        ...overrides,
    };
}

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('ChatPanel rendering', () => {
    test('renders nothing when open=false', () => {
        const chat = makeChat();
        const { container } = render(withTheme(<ChatPanel open={false} onClose={jest.fn()} chat={chat} />));
        expect(container).toBeEmptyDOMElement();
    });

    test('renders the header title when open', () => {
        const chat = makeChat();
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        expect(screen.getByText("Soren's Assistant")).toBeInTheDocument();
    });

    test('empty state shows suggested prompt chips', () => {
        const chat = makeChat();
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        expect(screen.getByText(/What was Soren's most recent role\?/i)).toBeInTheDocument();
    });

    test('populated state renders user + assistant bubbles', () => {
        const chat = makeChat({
            messages: [
                { role: 'user', content: 'hi' },
                { role: 'assistant', content: 'hello there' },
            ],
        });
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        expect(screen.getByText('hi')).toBeInTheDocument();
        expect(screen.getByText('hello there')).toBeInTheDocument();
    });

    test('rateLimited status shows the inline assistant message', () => {
        const chat = makeChat({
            messages: [{ role: 'user', content: 'too fast' }],
            status: 'rateLimited',
        });
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        expect(screen.getByText(/sending messages quickly/i)).toBeInTheDocument();
    });

    test('tooLarge status shows the conversation-too-long message', () => {
        const chat = makeChat({
            messages: [{ role: 'user', content: 'a lot' }],
            status: 'tooLarge',
        });
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        expect(screen.getByText(/gotten too long/i)).toBeInTheDocument();
    });

    test('error status shows the upstream/network banner', () => {
        const chat = makeChat({
            messages: [{ role: 'user', content: 'hi' }],
            status: 'error',
            errorKind: 'upstream',
        });
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        expect(screen.getByText(/went wrong on my end/i)).toBeInTheDocument();
    });
});

describe('ChatPanel interactions', () => {
    test('clicking a suggested prompt calls chat.send with that prompt', () => {
        const chat = makeChat();
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        fireEvent.click(screen.getByText(/most recent role/i));
        expect(chat.send).toHaveBeenCalledWith("What was Soren's most recent role?");
    });

    test('typing + clicking send calls chat.send and clears the draft', () => {
        const chat = makeChat();
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        const input = screen.getByPlaceholderText(/Ask about/i);
        fireEvent.change(input, { target: { value: 'tell me about him' } });
        expect(input.value).toBe('tell me about him');
        fireEvent.click(screen.getByLabelText('Send'));
        expect(chat.send).toHaveBeenCalledWith('tell me about him');
        expect(input.value).toBe('');
    });

    test('Enter key submits the draft', () => {
        const chat = makeChat();
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        const input = screen.getByPlaceholderText(/Ask about/i);
        fireEvent.change(input, { target: { value: 'hello' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(chat.send).toHaveBeenCalledWith('hello');
    });

    test('clicking the close button calls onClose', () => {
        const onClose = jest.fn();
        const chat = makeChat();
        render(withTheme(<ChatPanel open onClose={onClose} chat={chat} />));
        fireEvent.click(screen.getByLabelText('Close chat'));
        expect(onClose).toHaveBeenCalled();
    });

    test('clicking the clear button calls chat.reset', () => {
        const chat = makeChat({ messages: [{ role: 'user', content: 'hi' }] });
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        fireEvent.click(screen.getByRole('button', { name: 'Clear chat' }));
        expect(chat.reset).toHaveBeenCalled();
    });

    test('clear button is disabled in the empty state', () => {
        const chat = makeChat({ messages: [], status: 'idle' });
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        expect(screen.getByRole('button', { name: 'Clear chat' })).toBeDisabled();
    });

    test('clear button is enabled when status is tooLarge even with empty messages', () => {
        const chat = makeChat({ messages: [], status: 'tooLarge' });
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        expect(screen.getByRole('button', { name: 'Clear chat' })).not.toBeDisabled();
    });

    test('send button is disabled while streaming', () => {
        const chat = makeChat({
            messages: [{ role: 'user', content: 'hi' }, { role: 'assistant', content: 'partial' }],
            status: 'streaming',
        });
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        const input = screen.getByPlaceholderText(/Ask about/i);
        fireEvent.change(input, { target: { value: 'foo' } });
        // TextField gets disabled prop; the IconButton is also disabled
        expect(screen.getByLabelText('Send')).toBeDisabled();
    });

    test('URLs in assistant messages render as clickable links', () => {
        const chat = makeChat({
            messages: [
                { role: 'user', content: 'resume?' },
                {
                    role: 'assistant',
                    content: 'You can view his resume here: https://larsensoren.com/SorenLarsenResume.pdf',
                },
            ],
        });
        render(withTheme(<ChatPanel open onClose={jest.fn()} chat={chat} />));
        const link = screen.getByRole('link', { name: /SorenLarsenResume\.pdf/i });
        expect(link).toHaveAttribute('href', 'https://larsensoren.com/SorenLarsenResume.pdf');
        expect(link).toHaveAttribute('target', '_blank');
    });

    test('Escape key calls onClose', () => {
        const onClose = jest.fn();
        const chat = makeChat();
        render(withTheme(<ChatPanel open onClose={onClose} chat={chat} />));
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalled();
    });
});
