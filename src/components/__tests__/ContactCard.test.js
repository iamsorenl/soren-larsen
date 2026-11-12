import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactCard from '../ContactCard';
import contact from '../../data/contact.json';

beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
});
afterEach(() => { delete window.matchMedia; });

test('closing line and the three big links', () => {
    render(<ContactCard />);
    expect(screen.getByRole('heading', { name: /build something/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Email/ })).toHaveAttribute('href', `mailto:${contact[0].email}`);
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', contact[0].linkedin);
    expect(screen.getByRole('link', { name: /^X$/ })).toHaveAttribute('href', contact[0].x);
});

test('Leave me a note opens the chat into the note form', () => {
    const seen = [];
    const on = (e) => seen.push(e.detail);
    window.addEventListener('portfolio:open-chat', on);
    render(<ContactCard />);
    fireEvent.click(screen.getByRole('button', { name: /Leave me a note/i }));
    window.removeEventListener('portfolio:open-chat', on);
    expect(seen).toEqual([{ prompt: 'Leave Soren a note' }]);
});

test('the wave line is decorative', () => {
    render(<ContactCard />);
    expect(screen.getByTestId('wave-line')).toHaveAttribute('aria-hidden', 'true');
});
