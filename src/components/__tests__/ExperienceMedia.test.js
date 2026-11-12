import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ExperienceCard from '../ExperienceCard';

beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query.includes('min-width'), media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
});
afterEach(() => { delete window.matchMedia; });

const tile = (company) => screen.getByRole('button', { name: new RegExp(company) }).closest('[id^="exp-"]');

test('Gray Whale tile is anchored and cycles its surf ranch loop poster first', () => {
    const { container } = render(<ExperienceCard />);
    const gw = container.querySelector('#exp-gray-whale');
    expect(gw).not.toBeNull();
    expect(gw.querySelector('img').getAttribute('src')).toBe('/media/experience/gray-whale-loop.jpg');
});

test('Boardal tile shows its wave clip poster and two Instagram links when opened', () => {
    render(<ExperienceCard />);
    expect(tile('Boardal').querySelector('img').getAttribute('src')).toBe('/media/experience/boardal-wave.jpg');
    fireEvent.click(screen.getByRole('button', { name: /Boardal/ }));
    const links = screen.getAllByRole('link', { name: /Instagram/ }).map((a) => a.getAttribute('href'));
    expect(links).toEqual([
        'https://www.instagram.com/reel/C-BmIEKyAQh/',
        'https://www.instagram.com/reel/DACZSzDSRT1/',
    ]);
});

test('Causality tile draws its animation', () => {
    render(<ExperienceCard />);
    expect(within(tile('Causality')).getByTestId('causality-anim')).toBeInTheDocument();
});

test('Onda and Baskin keep monograms', () => {
    render(<ExperienceCard />);
    expect(within(tile('Onda')).getByText('OS')).toBeInTheDocument();
    expect(within(tile('Baskin')).getByText('BE')).toBeInTheDocument();
});

test('no tile says Causality Labs', () => {
    const { container } = render(<ExperienceCard />);
    expect(container.textContent).not.toMatch(/Causality Labs/);
});

test('Self-Employed tile draws the real GitHub contribution graph', () => {
    render(<ExperienceCard />);
    expect(within(tile('Self-Employed')).getByRole('img', { name: /GitHub contributions in the last year/ })).toBeInTheDocument();
});
