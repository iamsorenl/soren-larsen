import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import getTheme from '../src/theme';
import getSurfTheme from '../src/theme/surfTheme';

const themes = {
    'classic-light': getTheme('light'),
    'classic-dark': getTheme('dark'),
    'surf-light': getSurfTheme('light'),
    'surf-dark': getSurfTheme('dark')
};

/** @type { import('@storybook/react').Preview } */
const preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        },
        backgrounds: {
            default: 'classic-light',
            values: [
                { name: 'classic-light', value: themes['classic-light'].palette.background.default },
                { name: 'classic-dark', value: themes['classic-dark'].palette.background.default },
                { name: 'surf-light', value: themes['surf-light'].palette.background.default },
                { name: 'surf-dark', value: themes['surf-dark'].palette.background.default }
            ]
        }
    },
    globalTypes: {
        theme: {
            name: 'Theme',
            description: 'MUI theme mode',
            defaultValue: 'classic-light',
            toolbar: {
                icon: 'paintbrush',
                items: [
                    { value: 'classic-light', icon: 'sun', title: 'Classic Light' },
                    { value: 'classic-dark', icon: 'moon', title: 'Classic Dark' },
                    { value: 'surf-light', icon: 'sun', title: 'Surf Light' },
                    { value: 'surf-dark', icon: 'moon', title: 'Surf Dark' }
                ],
                dynamicTitle: true
            }
        }
    },
    decorators: [
        (Story, context) => {
            const key = context.globals.theme || 'classic-light';
            const theme = themes[key] || themes['classic-light'];
            return (
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Story />
                </ThemeProvider>
            );
        }
    ]
};

export default preview;
