import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Hero from '../Hero';

beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn(),
    }));
    window.scrollTo = jest.fn();
});
afterEach(() => { delete window.matchMedia; });

test('the SlugFest photo jumps to No RAGrets in Research', () => {
    const seen = [];
    const onTab = (e) => seen.push(e.detail);
    window.addEventListener('portfolio:projects-tab', onTab);
    render(<Hero />);
    fireEvent.click(screen.getByRole('button', { name: 'Show photo 7 of 11' }));
    fireEvent.click(screen.getByRole('button', { name: /SlugFest talk, see No RAGrets/i }));
    window.removeEventListener('portfolio:projects-tab', onTab);
    expect(seen).toEqual(['research']);
});

test('other carousel photos are not buttons', () => {
    render(<Hero />);
    expect(screen.queryByRole('button', { name: /see No RAGrets/i })).toBeNull();
});
