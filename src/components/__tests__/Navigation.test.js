import React from 'react';
import { render, screen } from '@testing-library/react';
import Navigation from '../Navigation';
import { ThemeProvider } from '../../contexts/ThemeContext';

beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
});
afterEach(() => { delete window.matchMedia; });

test('nav has no Skills link', () => {
    render(<ThemeProvider><Navigation /></ThemeProvider>);
    expect(screen.getAllByText('Experience').length).toBeGreaterThan(0);
    expect(screen.queryByText('Skills')).toBeNull();
});
