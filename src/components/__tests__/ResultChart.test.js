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

const grouped = {
    headline: 'Whole words won for both models',
    metric: 'Test BLEU, higher is better',
    groups: [
        { label: 'Transformer', bars: [['BPE pieces', 28.19], ['Whole words', 32.82]] },
        { label: 'CNN', bars: [['BPE pieces', 26.88], ['Whole words', 30.79]] },
    ],
};

test('groups show their labels, a headline, and share one scale', () => {
    render(<ResultChart results={grouped} />);
    expect(screen.getByText('Whole words won for both models')).toBeInTheDocument();
    expect(screen.getByText('Transformer')).toBeInTheDocument();
    expect(screen.getByText('CNN')).toBeInTheDocument();
    const pcts = screen.getAllByTestId('bar').map((b) => Number(b.getAttribute('data-pct')));
    expect(pcts).toEqual([86, 100, 82, 94]);
});

test('a two-bar group shows the gain of the second over the first', () => {
    render(<ResultChart results={grouped} />);
    expect(screen.getByText('+4.63')).toBeInTheDocument();
    expect(screen.getByText('+3.91')).toBeInTheDocument();
});

test('when lower is better, the gain is the drop', () => {
    render(<ResultChart results={{ lowerIsBetter: true, metric: 'm', groups: [{ bars: [['Before', 83.35], ['After', 39.11]] }] }} />);
    expect(screen.getByText('−44.24')).toBeInTheDocument();
});
