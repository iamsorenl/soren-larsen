// Shared mock fixtures for Storybook stories.
// Shapes mirror the JSON files in src/data/ so stories stay representative
// of the real site without importing production copy directly.

export const mockProject = {
    title: 'Sample Research Project',
    startDate: 'January 2025',
    endDate: 'March 2025',
    link: 'https://example.com/sample-project',
    muiIcon: 'Abc',
    description:
        '- Built a compact demo pipeline to showcase the project card layout\n- Highlighted key technical decisions and measurable outcomes\n- Connected the work back to broader research goals so reviewers can orient quickly',
    tools: ['React', 'MUI', 'Storybook', 'JavaScript']
};

export const mockShortProject = {
    title: 'Tiny Demo',
    startDate: 'April 2025',
    endDate: 'April 2025',
    link: 'https://example.com/tiny',
    muiIcon: 'Abc',
    description: 'A minimal project used to exercise the popup in its shortest form.',
    tools: ['Python']
};

export const mockCertifications = [
    {
        name: 'Machine Learning Specialization',
        issuer: 'Coursera',
        dateEarned: 'November 2023',
        link: 'https://example.com/certs/ml-specialization'
    },
    {
        name: 'Mayhem Certified',
        issuer: 'ForAllSecure',
        dateEarned: 'May 2023',
        link: 'https://example.com/certs/mayhem'
    },
    {
        name: 'AI For Everyone',
        issuer: 'Coursera',
        dateEarned: 'July 2023',
        link: 'https://example.com/certs/ai-for-everyone'
    }
];

export const mockExperience = {
    company: 'Example Labs',
    title: 'Software Engineer',
    location: 'Remote',
    startDate: 'June 2024',
    endDate: 'Present',
    link: 'https://example.com',
    description:
        '- Shipped playground fixtures for Storybook\n- Refactored data-driven components to accept props\n- Documented patterns for future stories',
    skills: ['React', 'MUI', 'Storybook', 'Testing', 'Documentation'],
    highlightColor: {
        light: '#00acc1',
        dark: '#26c6da'
    }
};

export const mockChatMessagesEmpty = [];

export const mockChatMessagesMid = [
    { role: 'user', content: "What was Soren's most recent role?" },
    {
        role: 'assistant',
        content:
            "Soren most recently finished his M.S. in NLP at UC Santa Cruz. Before that, he worked across full-stack and NLP engineering roles.",
    },
    { role: 'user', content: 'What NLP projects has he worked on?' },
];

export const mockChatStateStreaming = {
    messages: [
        { role: 'user', content: "What's his tech stack?" },
        { role: 'assistant', content: 'Soren works mainly with Python and Java' },
    ],
    status: 'streaming',
    errorKind: null,
};
