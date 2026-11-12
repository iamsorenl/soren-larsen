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
