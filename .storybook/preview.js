import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import getTheme from '../src/theme';

const lightTheme = getTheme('light');
const darkTheme = getTheme('dark');

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
            default: 'light',
            values: [
                { name: 'light', value: lightTheme.palette.background.default },
                { name: 'dark', value: darkTheme.palette.background.default }
            ]
        }
    },
    globalTypes: {
        theme: {
            name: 'Theme',
            description: 'MUI theme mode',
            defaultValue: 'light',
            toolbar: {
                icon: 'circlehollow',
                items: [
                    { value: 'light', icon: 'sun', title: 'Light' },
                    { value: 'dark', icon: 'moon', title: 'Dark' }
                ],
                dynamicTitle: true
            }
        }
    },
    decorators: [
        (Story, context) => {
            const mode = context.globals.theme || 'light';
            const theme = mode === 'dark' ? darkTheme : lightTheme;
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
