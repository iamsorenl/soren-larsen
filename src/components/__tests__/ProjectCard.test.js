import React from 'react';
import { render, screen, act, within } from '@testing-library/react';
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

    test('SLAC tile shows the explainer video link', () => {
        render(<ProjectCard />);
        expect(screen.getByRole('link', { name: /What is an X-ray laser/ }).getAttribute('href')).toMatch(/kUeraeIkTmo/);
    });

    test('Research tab: write-up link, no Explore yet, anchored cards', () => {
        render(<ProjectCard />);
        act(() => { window.dispatchEvent(new CustomEvent('portfolio:projects-tab', { detail: 'research' })); });
        const writeups = screen.getAllByRole('link', { name: 'Write-up' }).map((a) => a.getAttribute('href'));
        expect(writeups).toContain('/writeups/transformer-qa.pdf');
        expect(screen.queryByRole('link', { name: 'Explore' })).toBeNull();
        expect(screen.getAllByRole('article').map((a) => a.id)).toEqual(
            ['project-no-ragrets', 'project-edumuse', 'project-ptb-transformer', 'project-transformer-qa', 'project-nmt']);
    });

    test('Play tab cards are anchored', () => {
        render(<ProjectCard />);
        expect(screen.getByRole('article', { name: 'SLAC Accelerator Fault Investigator' })).toHaveAttribute('id', 'project-slac');
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
        const card = screen.getByRole('article', { name: 'No RAGrets' });
        expect(within(card).getByRole('link', { name: /Watch demo/ }).getAttribute('href')).toBe('https://youtu.be/2yX1e5xogUQ');
        expect(within(card).getByRole('link', { name: 'Watch No RAGrets' }).getAttribute('href')).toBe('https://youtu.be/2yX1e5xogUQ');
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
