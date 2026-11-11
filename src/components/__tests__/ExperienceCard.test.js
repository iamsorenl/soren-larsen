import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
        { company: 'Self-Employed', title: 'AI Engineer', location: 'X', startDate: 'September 2026', endDate: 'Present', description: 'Self desc\nline two', skills: ['Python'], link: 'https://example.com/site', links: [{ label: 'Repo', url: 'https://example.com/r' }] },
        { company: 'Pic Co', title: 'Eng', location: 'X', startDate: 'May 2025', endDate: 'Present', description: 'Pic desc', skills: [], image: 'pic' },
    ],
}));

test('renders one tile per job in date order', () => {
    render(<ExperienceCard />);
    const names = screen.getAllByRole('button').map((b) => b.textContent);
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

test('clicking a tile reveals description and links', () => {
    render(<ExperienceCard />);
    expect(screen.queryByText(/Self desc/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Self-Employed/ }));
    expect(screen.getByText(/Self desc/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Repo' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('Python')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Boardal/ }));
    expect(screen.queryByText(/Self desc/)).not.toBeInTheDocument();
});

test('company link renders as first Website chip opening in a new tab', () => {
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
