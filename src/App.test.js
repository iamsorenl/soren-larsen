import React from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import aboutData from './data/about.json';
import experienceData from './data/experience.json';
import educationData from './data/education.json';
import projectsData from './data/projects.json';
import contactData from './data/contact.json';
import skillsData from './data/skills.json';

// JSDOM doesn't implement matchMedia; MUI's useMediaQuery and the ThemeContext
// both call it, so provide a minimal mock.
beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }),
    });
});

beforeEach(() => {
    // Ensure a clean, deterministic starting theme for every test.
    window.localStorage.clear();
    window.localStorage.setItem('themeMode', 'light');
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('App', () => {
    test('renders without crashing', async () => {
        render(<App />);
        // 'Soren Larsen' now appears in both the navbar and the hero h1.
        const matches = await screen.findAllByText('Soren Larsen');
        expect(matches.length).toBeGreaterThan(0);
    });

    test('renders all main section labels', async () => {
        render(<App />);
        // Each section surfaces its name in either the heading or an eyebrow
        // label. Text-presence is used so this test survives section-by-section
        // header redesigns (h4 → h2 + Fraunces / mono-eyebrow pattern).
        const expectPresent = async (re) => {
            const matches = await screen.findAllByText(re);
            expect(matches.length).toBeGreaterThan(0);
        };
        await expectPresent(/Projects/i);
        await expectPresent(/Experience/i);
        await expectPresent(/Technical Skills/i);
        await expectPresent(/Education/i);
        await expectPresent(/Contact/i);
    });

    test('renders data from JSON files across sections', async () => {
        render(<App />);

        // About: the slimmed card renders paragraphs 2+ of the bio.
        // Pick a snippet from paragraph 2 (the UCSC backstory) — paragraph 1 is
        // intentionally skipped because it duplicates the hero tagline.
        const paragraphs = aboutData[0].about.split('\n\n');
        const aboutSnippet = paragraphs[1].slice(0, 20);
        await screen.findAllByText(new RegExp(escapeRegex(aboutSnippet), 'i'));

        // Experience: most recent company name.
        await screen.findAllByText(new RegExp(escapeRegex(experienceData[0].company), 'i'));

        // Education: first school name.
        await screen.findAllByText(new RegExp(escapeRegex(educationData[0].school), 'i'));

        // Projects: first project title.
        await screen.findAllByText(new RegExp(escapeRegex(projectsData[0].title), 'i'));

        // Skills: first language name from skills.json.
        await screen.findAllByText(new RegExp(escapeRegex(skillsData.languages[0].name), 'i'));

        // Contact: email appears somewhere.
        await screen.findAllByText(new RegExp(escapeRegex(contactData[0].email), 'i'));
    });

    test('theme toggle switches between light and dark modes', async () => {
        render(<App />);

        // Starts in light mode per beforeEach.
        expect(window.localStorage.getItem('themeMode')).toBe('light');

        const toolbar = await screen.findByRole('banner');
        const buttons = within(toolbar).getAllByRole('button');
        const themeTrigger = buttons.find((b) => !b.textContent.trim());
        expect(themeTrigger).toBeDefined();

        fireEvent.click(themeTrigger);
        const darkItem = await screen.findByRole('menuitem', { name: /dark/i });
        fireEvent.click(darkItem);
        await waitFor(() =>
            expect(window.localStorage.getItem('themeMode')).toBe('dark')
        );

        // Re-query the trigger (DOM may have re-rendered with a new icon).
        const toolbar2 = screen.getByRole('banner');
        const buttons2 = within(toolbar2).getAllByRole('button');
        const themeTrigger2 = buttons2.find((b) => !b.textContent.trim());
        fireEvent.click(themeTrigger2);
        const lightItem = await screen.findByRole('menuitem', { name: /light/i });
        fireEvent.click(lightItem);
        await waitFor(() =>
            expect(window.localStorage.getItem('themeMode')).toBe('light')
        );
    });
});
