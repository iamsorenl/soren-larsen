import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MomentStrip from '../MomentStrip';

beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
    window.scrollTo = jest.fn();
});
afterEach(() => { delete window.matchMedia; });

test('renders four moment tiles', () => {
    render(<MomentStrip />);
    expect(screen.getAllByTestId('moment')).toHaveLength(4);
});

test('only moments with a target are buttons', () => {
    render(<MomentStrip />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
});

test('the hackathon tile opens the Play tab', () => {
    const seen = [];
    const onTab = (e) => seen.push(e.detail);
    window.addEventListener('portfolio:projects-tab', onTab);
    render(<MomentStrip />);
    fireEvent.click(screen.getByRole('button', { name: /hackathon/i }));
    window.removeEventListener('portfolio:projects-tab', onTab);
    expect(seen).toEqual(['play']);
});
