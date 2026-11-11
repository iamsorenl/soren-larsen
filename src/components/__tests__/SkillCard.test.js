import React from 'react';
import { render, screen } from '@testing-library/react';
import SkillCard from '../SkillCard';

test('renders skills as plain tags with no self-rating', () => {
    const { container } = render(<SkillCard />);
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
    expect(container.textContent).not.toMatch(/Expert|Advanced|Intermediate/);
    // level must not drive order or styling: tags keep JSON order
    /* eslint-disable testing-library/no-container, testing-library/no-node-access */
    const tags = [...container.querySelectorAll('#languages-skills .MuiChip-label')].map((e) => e.textContent);
    /* eslint-enable testing-library/no-container, testing-library/no-node-access */
    expect(tags.slice(4, 8)).toEqual(['Dart', 'C/C++', 'Swift', 'Java']);
});
