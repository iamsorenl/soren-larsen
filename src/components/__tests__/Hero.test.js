import React from 'react';
import { render, screen, within } from '@testing-library/react';
import Hero from '../Hero';
import about from '../../data/about.json';

beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
    window.scrollTo = jest.fn();
});
afterEach(() => { delete window.matchMedia; });

test('bio paragraphs from about.json render in the hero', () => {
    render(<Hero />);
    expect(screen.getByText(about[0].about.split('\n\n')[0])).toBeInTheDocument();
});

test('one carousel with a "1 / 9" counter and no dots', () => {
    render(<Hero />);
    expect(screen.getByText('1 / 9')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Show photo/ })).toBeNull();
});

test('no photo is a link; the only carousel buttons are controls', () => {
    render(<Hero />);
    const carousel = screen.getByRole('group', { name: 'Photos of Soren' });
    expect(within(carousel).queryByRole('link')).toBeNull();
    const names = within(carousel).getAllByRole('button').map((b) => b.getAttribute('aria-label'));
    expect(names.sort()).toEqual(['Next', 'Pause slideshow', 'Previous']);
});

test('each photo has its own alt text', () => {
    render(<Hero />);
    const alts = screen.getAllByRole('img', { hidden: true }).map((i) => i.getAttribute('alt')).filter(Boolean);
    expect(alts).toHaveLength(9);
    expect(alts).not.toContain('Soren Larsen');
    expect(new Set(alts).size).toBe(9);
});

test('no moment strip under the hero', () => {
    render(<Hero />);
    expect(screen.queryByTestId('moment-strip')).toBeNull();
    expect(screen.queryByText(/Developer Camp/)).toBeNull();
});
