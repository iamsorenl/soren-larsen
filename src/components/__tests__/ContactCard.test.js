import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ContactCard from '../ContactCard';
import contact from '../../data/contact.json';

beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
});
afterEach(() => { delete window.matchMedia; });

test('heading and five tiles: Phone, Email, GitHub, LinkedIn, X', () => {
    render(<ContactCard />);
    const c = contact[0];
    expect(screen.getByRole('heading', { name: /build something/i })).toBeInTheDocument();
    const tiles = within(screen.getByRole('list', { name: 'Ways to reach me' })).getAllByRole('link');
    expect(tiles.map((a) => a.getAttribute('href'))).toEqual([
        `tel:${c.phone.replace(/[^\d+]/g, '')}`, `mailto:${c.email}`, c.github, c.linkedin, c.x,
    ]);
    expect(tiles.map((a) => a.textContent)).toEqual([
        expect.stringMatching(/^Phone/), expect.stringMatching(/^Email/), expect.stringMatching(/^GitHub/),
        expect.stringMatching(/^LinkedIn/), expect.stringMatching(/^X/),
    ]);
});

test('phone shows as (858) 210-2261', () => {
    expect(contact[0].phone).toBe('(858) 210-2261');
});

test('the note bubble is the only way in, and it opens the note form', () => {
    const seen = [];
    const on = (e) => seen.push(e.detail);
    window.addEventListener('portfolio:open-chat', on);
    render(<ContactCard />);
    expect(screen.queryByRole('button', { name: /Leave me a note/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /write me a note/i }));
    window.removeEventListener('portfolio:open-chat', on);
    expect(seen).toEqual([{ prompt: 'Leave Soren a note' }]);
});

test('no waves in Contact, and the planes are decorative', () => {
    render(<ContactCard />);
    expect(screen.queryByTestId('wave-line')).toBeNull();
    expect(screen.getByTestId('paper-planes')).toHaveAttribute('aria-hidden', 'true');
});
