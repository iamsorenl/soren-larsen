import React from 'react';
import { render, screen } from '@testing-library/react';
import ResultChart from '../ResultChart';

const results = { metric: 'Test F1', bars: [['Baseline', 43.79], ['LoRA', 54.33]] };

test('one bar per entry with its number', () => {
    render(<ResultChart results={results} />);
    expect(screen.getAllByTestId('bar')).toHaveLength(2);
    expect(screen.getByText('43.79')).toBeInTheDocument();
    expect(screen.getByText('54.33')).toBeInTheDocument();
    expect(screen.getByText('Test F1')).toBeInTheDocument();
});

test('the max value gets the longest bar', () => {
    render(<ResultChart results={results} />);
    const [a, b] = screen.getAllByTestId('bar');
    expect(Number(b.getAttribute('data-pct'))).toBe(100);
    expect(Number(a.getAttribute('data-pct'))).toBeLessThan(100);
});

test('when lower is better, the smallest value is the highlighted one', () => {
    render(<ResultChart results={{ metric: 'Test perplexity', lowerIsBetter: true, bars: [['Baseline', 83.35], ['Smaller, tuned', 39.11], ['Larger', 134.72]] }} />);
    const bars = screen.getAllByTestId('bar');
    expect(bars.map((b) => b.getAttribute('data-best'))).toEqual(['false', 'true', 'false']);
});

test('when higher is better, the largest value is the highlighted one', () => {
    render(<ResultChart results={results} />);
    expect(screen.getAllByTestId('bar').map((b) => b.getAttribute('data-best'))).toEqual(['false', 'true']);
});
