import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ExperienceCard from '../ExperienceCard';
import experienceData from '../../data/experience';

jest.mock('../../data/experienceImages', () => ({
    __esModule: true,
    default: { pic: 'pic.png' },
}));
jest.mock('../../data/experience', () => ({
    __esModule: true,
    default: [
        { company: 'Boardal', title: 'Dev', location: 'X', startDate: 'April 2024', endDate: 'Present', description: 'Boardal desc', skills: ['React'] },
        { company: 'Self-Employed', title: 'AI Engineer', location: 'X', startDate: 'September 2026', endDate: 'Present', description: 'Self desc\n\nline two', skills: ['Python'], link: 'https://example.com/site', links: [{ label: 'Repo', url: 'https://example.com/r' }] },
        { company: 'Pic Co', title: 'Eng', location: 'X', startDate: 'May 2025', endDate: 'Present', description: 'Pic desc', skills: [], image: 'pic' },
    ],
}));

test('renders one tile per job in date order', () => {
    render(<ExperienceCard />);
    const names = screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'));
    expect(names[0]).toMatch(/Self-Employed/);
    expect(names[names.length - 1]).toMatch(/Boardal/);
    expect(names).toHaveLength(experienceData.length);
});

test('tile without image shows monogram, with image shows img', () => {
    render(<ExperienceCard />);
    expect(screen.getByText('SE')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
});

test('clicking a tile opens a dialog with paragraphs, links and a skills line', () => {
    render(<ExperienceCard />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Self-Employed/ }));
    const dialog = screen.getByRole('dialog', { name: 'Self-Employed' });
    expect(within(dialog).getByText('Self desc')).toBeInTheDocument();
    expect(within(dialog).getByText('line two')).toBeInTheDocument();
    const link = within(dialog).getByRole('link', { name: 'Repo' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(within(dialog).getByText('Python')).toBeInTheDocument();
});

test('Escape and the X both close the dialog', async () => {
    render(<ExperienceCard />);
    fireEvent.click(screen.getByRole('button', { name: /Self-Employed/ }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Boardal/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('company link renders as the first Website button opening in a new tab', () => {
    render(<ExperienceCard />);
    fireEvent.click(screen.getByRole('button', { name: /Self-Employed/ }));
    const chips = screen.getAllByRole('link');
    expect(chips[0]).toHaveTextContent('Website');
    expect(chips[0]).toHaveAttribute('href', 'https://example.com/site');
    expect(chips[0]).toHaveAttribute('target', '_blank');
    expect(chips[0]).toHaveAttribute('rel', 'noopener noreferrer');
    expect(chips[1]).toHaveTextContent('Repo');
});

test('tile shows abbreviated dates under the title', () => {
    render(<ExperienceCard />);
    expect(screen.getByText('Sep 2026 to Present')).toBeInTheDocument();
    expect(screen.getByText('Apr 2024 to Present')).toBeInTheDocument();
});
