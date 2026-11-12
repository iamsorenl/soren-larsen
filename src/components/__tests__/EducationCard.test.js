import React from 'react';
import { render, screen } from '@testing-library/react';
import EducationCard from '../EducationCard';

beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
});
afterEach(() => { delete window.matchMedia; });

test("master's shows hooding then poster talk, bachelor's shows the redwoods", () => {
    render(<EducationCard />);
    const srcs = screen.getAllByRole('img', { hidden: true }).map((i) => i.getAttribute('src')).filter(Boolean);
    expect(srcs).toEqual(expect.arrayContaining([
        '/media/education/hooding.jpg',
        '/media/education/poster-talk.jpg',
        '/media/education/redwoods.jpg',
    ]));
    expect(srcs.indexOf('/media/education/hooding.jpg')).toBeLessThan(srcs.indexOf('/media/education/redwoods.jpg'));
});

test('diploma links still render', () => {
    render(<EducationCard />);
    expect(screen.getAllByRole('button', { name: /diploma/i })).toHaveLength(2);
});
