import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NoteForm from '../NoteForm';
import { sendNote } from '../chatApi';

jest.mock('../chatApi', () => ({ sendNote: jest.fn() }));

function renderForm() {
    return render(<ThemeProvider theme={createTheme()}><NoteForm /></ThemeProvider>);
}
function fill() {
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Message/), { target: { value: 'Hello Soren, nice site.' } });
}

beforeEach(() => sendNote.mockReset());

test('submits the field values and shows the sent message', async () => {
    sendNote.mockResolvedValue();
    renderForm();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Sent. Soren will reply by email.')).toBeInTheDocument();
    expect(sendNote).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@example.com', message: 'Hello Soren, nice site.' });
});

test('a rejected send shows an error and the contact buttons', async () => {
    sendNote.mockRejectedValue(new Error('x'));
    renderForm();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByRole('link', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByText(/could not send/i)).toBeInTheDocument();
});
