import React from 'react';
import { render, screen, act, within, fireEvent } from '@testing-library/react';
import ProjectCard from '../ProjectCard';
import contact from '../../data/contact.json';

describe('ProjectCard tabs', () => {
    test('only tabbed projects render', () => {
        render(<ProjectCard />);
        expect(screen.queryByText('policy-tree')).toBeNull();
    });

    test('Play tab default shows StockPulse and the league; Hackathons shows SLAC and Sentinel', () => {
        render(<ProjectCard />);
        expect(screen.getByRole('tab', { name: 'Play with it', selected: true })).toBeTruthy();
        expect(screen.getAllByRole('article').map((a) => a.id)).toEqual(['project-stockpulse', 'project-ranked-ai-league']);
        act(() => { window.dispatchEvent(new CustomEvent('portfolio:projects-tab', { detail: 'hackathon' })); });
        expect(screen.getByRole('tab', { name: 'Hackathons', selected: true })).toBeTruthy();
        expect(screen.getAllByRole('article').map((a) => a.id)).toEqual(['project-slac', 'project-sentinel-cyber-incident-response-council']);
    });

    test('play tiles have no extra link buttons under them', () => {
        render(<ProjectCard />);
        expect(screen.queryByRole('link', { name: /What is an X-ray laser/ })).toBeNull();
        expect(screen.queryByRole('link', { name: 'Flower Hub' })).toBeNull();
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

    test('Hackathon tab cards are anchored', () => {
        render(<ProjectCard />);
        act(() => { window.dispatchEvent(new CustomEvent('portfolio:projects-tab', { detail: 'hackathon' })); });
        expect(screen.getByRole('article', { name: 'SLAC Accelerator Fault Investigator' })).toHaveAttribute('id', 'project-slac');
    });

    test('How it works tab hidden when no project has tab "how"', () => {
        render(<ProjectCard />);
        expect(screen.queryByRole('tab', { name: 'How it works' })).toBeNull();
    });

    test('Research tab shows No RAGrets with its links', () => {
        render(<ProjectCard />);
        expect(screen.queryByText('No RAGrets')).toBeNull();
        act(() => screen.getByRole('tab', { name: "Master's work" }).click());
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
    test('Sentinel tile: demo link and slideshow buttons are separate', () => {
        render(<ProjectCard />);
        act(() => { window.dispatchEvent(new CustomEvent('portfolio:projects-tab', { detail: 'hackathon' })); });
        const card = screen.getByRole('article', { name: /Sentinel/ });
        expect(within(card).getByRole('link', { name: /^Watch Sentinel/ }).getAttribute('href')).toBe('https://www.youtube.com/watch?v=4D9yiXNAT0k');
        expect(within(card).getByRole('button', { name: 'Pause slideshow' })).toBeInTheDocument();
        within(card).getAllByRole('link').forEach((a) => expect(within(a).queryByRole('button')).toBeNull());
    });

    test('tile with no slides has no arrows (EduMUSE)', () => {
        render(<ProjectCard />);
        act(() => screen.getByRole('tab', { name: "Master's work" }).click());
        const card = screen.getByRole('article', { name: 'EduMUSE' });
        expect(within(card).queryByRole('button', { name: 'Next' })).toBeNull();
    });
    test('hovering a project tile holds its slideshow', () => {
        jest.useFakeTimers();
        render(<ProjectCard />);
        act(() => { window.dispatchEvent(new CustomEvent('portfolio:projects-tab', { detail: 'hackathon' })); });
        const card = screen.getByRole('article', { name: /Sentinel/ });
        const show = within(card).getByRole('group', { name: /Sentinel/ });
        fireEvent.mouseEnter(within(card).getByRole('link', { name: /^Watch Sentinel/ }));
        act(() => jest.advanceTimersByTime(20000));
        expect(show).toHaveAttribute('data-active-alt', expect.stringMatching(/demo/));
        jest.useRealTimers();
    });
});


