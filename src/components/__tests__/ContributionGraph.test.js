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

test('one very busy day does not flatten everyone else to the lowest shade', () => {
    const skewed = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 157].map((count, i) => ({ date: `2026-02-${String(i + 1).padStart(2, '0')}`, count }));
    render(<ContributionGraph days={skewed} total={235} />);
    const levels = screen.getAllByTestId('day').map((c) => c.getAttribute('data-level'));
    expect(new Set(levels)).toEqual(new Set(['1', '2', '3', '4']));
});

test('on phones the graph crops to the most recent weeks instead of shrinking to a sliver', () => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query.includes('max-width'), media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
    render(<ContributionGraph days={days} total={42} />);
    expect(screen.getByRole('img', { name: /GitHub contributions/ })).toHaveAttribute('preserveAspectRatio', 'xMaxYMid slice');
});
