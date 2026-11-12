import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChatWidget from '../ChatWidget';
import * as useChatModule from '../useChat';

const theme = createTheme();

function withTheme(ui) {
    return <ThemeProvider theme={theme}>{ui}</ThemeProvider>;
}

beforeEach(() => {
    sessionStorage.clear();
});

describe('ChatWidget FAB visibility', () => {
    test('shows the FAB when the panel is closed', () => {
        render(withTheme(<ChatWidget />));
        expect(
            screen.getByRole('button', { name: /open chat with soren's assistant/i })
        ).toBeInTheDocument();
        // Panel header is not rendered
        expect(screen.queryByText("Soren's Assistant")).not.toBeInTheDocument();
    });

    test('hides the FAB when the panel is open', () => {
        render(withTheme(<ChatWidget />));
        fireEvent.click(
            screen.getByRole('button', { name: /open chat with soren's assistant/i })
        );
        // FAB is gone, panel is up
        expect(
            screen.queryByRole('button', { name: /open chat with soren's assistant/i })
        ).not.toBeInTheDocument();
        expect(screen.getByText("Soren's Assistant")).toBeInTheDocument();
    });

    test('closing the panel restores the FAB', () => {
        render(withTheme(<ChatWidget />));
        // Open
        fireEvent.click(
            screen.getByRole('button', { name: /open chat with soren's assistant/i })
        );
        expect(screen.getByText("Soren's Assistant")).toBeInTheDocument();
        // Close via the X button in the panel header
        fireEvent.click(screen.getByLabelText('Close chat'));
        // FAB returns, panel is gone
        expect(
            screen.getByRole('button', { name: /open chat with soren's assistant/i })
        ).toBeInTheDocument();
        expect(screen.queryByText("Soren's Assistant")).not.toBeInTheDocument();
    });

    test('closing the panel cancels any in-flight request', () => {
        const cancel = jest.fn();
        const spy = jest.spyOn(useChatModule, 'useChat').mockReturnValue({
            messages: [],
            status: 'idle',
            errorKind: null,
            retryAfterSec: 0,
            send: jest.fn(),
            cancel,
            reset: jest.fn(),
        });
        try {
            render(withTheme(<ChatWidget />));
            fireEvent.click(
                screen.getByRole('button', { name: /open chat with soren's assistant/i })
            );
            fireEvent.click(screen.getByLabelText('Close chat'));
            expect(cancel).toHaveBeenCalledTimes(1);
        } finally {
            spy.mockRestore();
        }
    });
});

describe('ChatWidget starter card', () => {
    const FLAG = 'chatStarterDismissed';
    const chipName = 'Show me his best demo';
    let send;
    let spy;

    beforeEach(() => {
        jest.useFakeTimers();
        send = jest.fn();
        spy = jest.spyOn(useChatModule, 'useChat').mockReturnValue({
            messages: [],
            status: 'idle',
            errorKind: null,
            retryAfterSec: 0,
            send,
            cancel: jest.fn(),
            reset: jest.fn(),
        });
    });
    afterEach(() => {
        spy.mockRestore();
        jest.useRealTimers();
    });

    const advance = (ms) => act(() => { jest.advanceTimersByTime(ms); });

    test('not visible before 4s, visible after', () => {
        render(withTheme(<ChatWidget />));
        advance(3900);
        expect(screen.queryByText(chipName)).not.toBeInTheDocument();
        advance(200);
        expect(screen.getByText(chipName)).toBeInTheDocument();
    });

    test('never auto-opens on phones', () => {
        window.matchMedia = jest.fn().mockImplementation((query) => ({
            matches: query.includes('max-width:599.95px'), media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
        }));
        render(withTheme(<ChatWidget />));
        advance(10000);
        expect(screen.queryByText(chipName)).not.toBeInTheDocument();
        delete window.matchMedia;
    });

    test('close button hides and does not return after remount', () => {
        const { unmount } = render(withTheme(<ChatWidget />));
        advance(4100);
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(screen.queryByText(chipName)).not.toBeInTheDocument();
        expect(sessionStorage.getItem(FLAG)).toBe('1');
        unmount();
        render(withTheme(<ChatWidget />));
        advance(10000);
        expect(screen.queryByText(chipName)).not.toBeInTheDocument();
    });

    test('a portfolio:open-chat event opens the panel and sends its prompt', () => {
        render(withTheme(<ChatWidget />));
        act(() => { window.dispatchEvent(new CustomEvent('portfolio:open-chat', { detail: { prompt: 'Leave Soren a note' } })); });
        expect(send).toHaveBeenCalledWith('Leave Soren a note');
        expect(screen.getByText("Soren's Assistant")).toBeInTheDocument();
    });

    test('clicking a chip opens the panel and sends that prompt', () => {
        render(withTheme(<ChatWidget />));
        advance(4100);
        fireEvent.click(screen.getByRole('button', { name: chipName }));
        expect(send).toHaveBeenCalledWith(chipName);
        expect(screen.getByText("Soren's Assistant")).toBeInTheDocument();
        expect(sessionStorage.getItem(FLAG)).toBe('1');
    });

    test('opening the chat via the FAB marks the card dismissed', () => {
        render(withTheme(<ChatWidget />));
        fireEvent.click(
            screen.getByRole('button', { name: /open chat with soren's assistant/i })
        );
        expect(sessionStorage.getItem(FLAG)).toBe('1');
        fireEvent.click(screen.getByLabelText('Close chat'));
        advance(10000);
        expect(screen.queryByText(chipName)).not.toBeInTheDocument();
    });

    test('does not show if dismissed flag already set', () => {
        sessionStorage.setItem(FLAG, '1');
        render(withTheme(<ChatWidget />));
        advance(10000);
        expect(screen.queryByText(chipName)).not.toBeInTheDocument();
    });

    test('sessionStorage throwing still renders the card', () => {
        const g = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        const s = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        try {
            render(withTheme(<ChatWidget />));
            advance(4100);
            expect(screen.getByText(chipName)).toBeInTheDocument();
            fireEvent.click(screen.getByRole('button', { name: 'Close' }));
            expect(screen.queryByText(chipName)).not.toBeInTheDocument();
        } finally {
            g.mockRestore();
            s.mockRestore();
        }
    });
});
