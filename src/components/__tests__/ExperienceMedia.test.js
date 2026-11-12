import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ExperienceCard from '../ExperienceCard';

beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query.includes('min-width'), media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
});
afterEach(() => { delete window.matchMedia; });

const toggle = (company) => screen.getByRole('button', { name: new RegExp(company) });
const tile = (company) => screen.getByRole('article', { name: new RegExp(company) });

test('Gray Whale tile is anchored and cycles its surf ranch loop poster first', () => {
    render(<ExperienceCard />);
    expect(toggle('Gray Whale')).toHaveAttribute('id', 'exp-gray-whale');
    expect(within(tile('Gray Whale')).getByAltText('Surfing the Gray Whale event at Surf Ranch')).toHaveAttribute('src', '/media/experience/gray-whale-loop.jpg');
});

test('Gray Whale tile has five slides', () => {
    render(<ExperienceCard />);
    expect(within(tile('Gray Whale')).getAllByRole('img', { hidden: true }).length).toBe(5);
});

test('Boardal tile shows both square clips side by side and two Instagram links when opened', () => {
    render(<ExperienceCard />);
    expect(within(tile('Boardal')).getByAltText('Soren surfing in a Boardal reel, slowed down')).toHaveAttribute('src', '/media/experience/boardal-ride.jpg');
    expect(within(tile('Boardal')).getByAltText('Soren giving a surf tip in a Boardal reel')).toBeInTheDocument();
    expect(within(tile('Boardal')).getByAltText(/Boardal app feed/)).toHaveAttribute('src', '/media/experience/boardal-app-feed.jpg'); // poster until in view
    expect(within(tile('Boardal')).getByAltText(/Boardal search filters/)).toHaveAttribute('src', '/media/experience/boardal-app-filters.jpg');
    fireEvent.click(toggle('Boardal'));
    const links = screen.getAllByRole('link', { name: /Instagram/ }).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['https://www.instagram.com/boardal.app/']);
});

test('Boardal on phones shows only the riding clip', () => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
    render(<ExperienceCard />);
    expect(within(tile('Boardal')).getByAltText('Soren surfing in a Boardal reel, slowed down')).toBeInTheDocument();
    expect(within(tile('Boardal')).queryByAltText('Soren giving a surf tip in a Boardal reel')).toBeNull();
    expect(within(tile('Boardal')).queryByAltText(/Boardal app feed/)).toBeNull();
    expect(within(tile('Onda')).queryByAltText(/Onda app spot page/)).toBeNull();
});

test("pausing a tile's slideshow doesn't open the tile", () => {
    render(<ExperienceCard />);
    const pause = within(tile('Gray Whale')).getByRole('button', { name: 'Pause slideshow' });
    expect(within(toggle('Gray Whale')).queryByRole('button', { name: 'Pause slideshow' })).toBeNull(); // not nested in the tile's toggle
    fireEvent.click(pause);
    expect(toggle('Gray Whale')).toHaveAttribute('aria-expanded', 'false');
});

test('Causality tile draws its animation', () => {
    render(<ExperienceCard />);
    expect(within(tile('Causality')).getByTestId('causality-anim')).toBeInTheDocument();
});

test('Onda shows the booth photo; Baskin shows the banana slug', () => {
    render(<ExperienceCard />);
    expect(within(tile('Onda')).getByAltText(/Onda booth/)).toHaveAttribute('src', '/media/experience/onda-booth.jpg');
    expect(within(tile('Onda')).getByAltText(/Onda app spot page/)).toHaveAttribute('src', '/media/experience/onda-app.jpg');
    expect(within(tile('Baskin')).getByTestId('slug-anim')).toBeInTheDocument();
});

test('no tile says Causality Labs', () => {
    render(<ExperienceCard />);
    expect(screen.queryByText(/Causality Labs/)).toBeNull();
});

test('Self-Employed tile draws the real GitHub contribution graph', () => {
    render(<ExperienceCard />);
    expect(within(tile('Self-Employed')).getByRole('img', { name: /GitHub contributions in the last year/ })).toBeInTheDocument();
});

test('Causality draws the decision path: main, gray, dashed red, green to a dashed end', () => {
    render(<ExperienceCard />);
    const anim = within(tile('Causality')).getByTestId('causality-anim');
    // eslint-disable-next-line testing-library/no-node-access
    const branch = (b) => anim.querySelectorAll(`[data-branch="${b}"]`);
    expect(branch('main').length).toBe(2);
    expect(branch('gray').length).toBe(2);
    expect(branch('red')[0]).toHaveAttribute('stroke-dasharray', '4 4');
    expect(branch('green').length).toBe(1);
    expect(branch('green-end')[0]).toHaveAttribute('stroke-dasharray', '3 4');
});

test('Causality under reduced motion shows the finished drawing, no pause button', () => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query.includes('min-width') || query.includes('reduced-motion'), media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
    render(<ExperienceCard />);
    const anim = within(tile('Causality')).getByTestId('causality-anim');
    // eslint-disable-next-line testing-library/no-node-access
    anim.querySelectorAll('path, circle, g').forEach((el) => expect(el.style.animation).toBe(''));
    expect(within(anim).queryByRole('button', { name: 'Pause slideshow' })).toBeNull();
});

test('Causality pause freezes the drawing mid-way', () => {
    render(<ExperienceCard />);
    const anim = within(tile('Causality')).getByTestId('causality-anim');
    fireEvent.click(within(anim).getByRole('button', { name: 'Pause slideshow' }));
    // eslint-disable-next-line testing-library/no-node-access
    const main = anim.querySelector('[data-branch="main"]');
    expect(main.style.animationPlayState).toBe('paused');
});
