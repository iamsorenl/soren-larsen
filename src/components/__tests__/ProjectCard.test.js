import React from 'react';
import { render, screen, act } from '@testing-library/react';
import ProjectCard from '../ProjectCard';
import contact from '../../data/contact.json';

describe('ProjectCard tabs', () => {
    test('only tabbed projects render', () => {
        render(<ProjectCard />);
        expect(screen.queryByText('policy-tree')).toBeNull();
    });

    test('Play tab default shows four demo tiles', () => {
        render(<ProjectCard />);
        expect(screen.getByRole('tab', { name: 'Play with it', selected: true })).toBeTruthy();
        expect(screen.getAllByText(/^(Play|Watch)$/)).toHaveLength(4);
    });

    test('How it works tab hidden when no project has tab "how"', () => {
        render(<ProjectCard />);
        expect(screen.queryByRole('tab', { name: 'How it works' })).toBeNull();
    });

    test('Research tab shows No RAGrets with its links', () => {
        render(<ProjectCard />);
        expect(screen.queryByText('No RAGrets')).toBeNull();
        act(() => screen.getByRole('tab', { name: 'Research' }).click());
        expect(screen.getByText('No RAGrets')).toBeTruthy();
        expect(screen.getByRole('link', { name: /Watch demo/ }).getAttribute('href')).toMatch(/youtu/);
    });

    test('More on GitHub links to contact github', () => {
        render(<ProjectCard />);
        const a = screen.getByRole('link', { name: /More on GitHub/ });
        expect(a.getAttribute('href')).toBe(contact[0].github);
        expect(a.getAttribute('target')).toBe('_blank');
        expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    });

    test('projects-tab event switches tab', () => {
        render(<ProjectCard />);
        act(() => {
            window.dispatchEvent(new CustomEvent('portfolio:projects-tab', { detail: 'research' }));
        });
        expect(screen.getByText('No RAGrets')).toBeTruthy();
    });
});
