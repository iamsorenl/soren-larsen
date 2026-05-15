import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChatWidget from '../ChatWidget';

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
});
