import React from 'react';
import { render, screen } from '@testing-library/react';
import ContributionGraph from '../ContributionGraph';

beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
});
afterEach(() => { delete window.matchMedia; });

const days = Array.from({ length: 14 }, (_, i) => ({ date: `2026-01-${String(i + 1).padStart(2, '0')}`, count: i % 4 }));

test('one cell per day', () => {
    render(<ContributionGraph days={days} total={42} />);
    expect(screen.getAllByTestId('day')).toHaveLength(14);
});

test('labels the real total', () => {
    render(<ContributionGraph days={days} total={42} />);
    expect(screen.getByRole('img', { name: '42 GitHub contributions in the last year' })).toBeInTheDocument();
});

test('empty days renders nothing', () => {
    const { container } = render(<ContributionGraph days={[]} total={0} />);
    expect(container).toBeEmptyDOMElement();
});

test('zero-count days get the lowest shade, busiest day the highest', () => {
    render(<ContributionGraph days={days} total={42} />);
    const cells = screen.getAllByTestId('day');
    expect(cells[0]).toHaveAttribute('data-level', '0');
    expect(cells[3]).toHaveAttribute('data-level', '4');
});
