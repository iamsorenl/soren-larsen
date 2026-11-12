import React from 'react';
import { render, screen } from '@testing-library/react';
import EducationCard from '../EducationCard';

beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
});
afterEach(() => { delete window.matchMedia; });

test("master's shows the grad sash photo, poster presentation, poster talk; bachelor's shows bs-grad", () => {
    render(<EducationCard />);
    const srcs = screen.getAllByRole('img', { hidden: true }).map((i) => i.getAttribute('src')).filter(Boolean);
    const at = (f) => srcs.indexOf(`/media/education/${f}`);
    expect(at('hooding.jpg')).toBeGreaterThan(-1);
    expect(at('hooding.jpg')).toBeLessThan(at('poster-presentation.jpg'));
    expect(at('poster-presentation.jpg')).toBeLessThan(at('poster-talk.jpg'));
    expect(at('poster-talk.jpg')).toBeLessThan(at('bs-grad.jpg'));
    expect(at('redwoods.jpg')).toBe(-1);
});

test("the Santa Cruz Works press card links to the article, under the master's", () => {
    render(<EducationCard />);
    const card = screen.getByRole('link', { name: /How a Chance Encounter Became a Game-Changing Research Partnership/ });
    expect(card).toHaveAttribute('href', 'https://www.santacruzworks.org/news/how-a-chance-encounter-became-a-game-changing-research-partnershi');
    expect(card).toHaveAttribute('target', '_blank');
    expect(screen.getAllByRole('link', { name: /santa cruz works/i })).toHaveLength(1);
});

test('each degree has its photo', () => {
    render(<EducationCard />);
    expect(screen.getAllByTestId('degree-photo')).toHaveLength(2);
});

test('diploma links still render', () => {
    render(<EducationCard />);
    expect(screen.getAllByRole('button', { name: /^View .* diploma$/ })).toHaveLength(2);
});
