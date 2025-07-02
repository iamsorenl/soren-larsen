import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeProvider');
    }
    return context;
};

const createAppTheme = (mode) => {
    const isDark = mode === 'dark';
    
    return createTheme({
        palette: {
            mode,
            primary: {
                main: isDark ? '#1a237e' : '#7986cb',
                light: isDark ? '#534bae' : '#aab6fe',
                dark: isDark ? '#000051' : '#49599a',
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#00bcd4',
                light: '#62efff',
                dark: '#008ba3',
                contrastText: '#000000',
            },
            background: {
                default: isDark ? '#0a0e27' : '#f5f5f5',
                paper: isDark ? '#1e1e1e' : '#ffffff',
            },
            text: {
                primary: isDark ? '#ffffff' : '#212121',
                secondary: isDark ? '#b0bec5' : '#757575',
            },
            grey: {
                50: '#fafafa',
                100: '#f5f5f5',
                200: '#eeeeee',
                300: '#e0e0e0',
                400: '#bdbdbd',
                500: '#9e9e9e',
                600: '#757575',
                700: '#616161',
                800: '#424242',
                900: '#212121',
            },
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontWeight: 700,
                fontSize: '3.5rem',
                lineHeight: 1.2,
            },
            h2: {
                fontWeight: 600,
                fontSize: '2.75rem',
                lineHeight: 1.3,
            },
            h3: {
                fontWeight: 600,
                fontSize: '2.25rem',
                lineHeight: 1.4,
            },
            h4: {
                fontWeight: 600,
                fontSize: '1.75rem',
                lineHeight: 1.4,
            },
            h5: {
                fontWeight: 600,
                fontSize: '1.5rem',
                lineHeight: 1.5,
            },
            h6: {
                fontWeight: 600,
                fontSize: '1.25rem',
                lineHeight: 1.5,
            },
            body1: {
                fontSize: '1rem',
                lineHeight: 1.6,
            },
            body2: {
                fontSize: '0.875rem',
                lineHeight: 1.6,
            },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        boxShadow: isDark 
                            ? '0px 4px 20px rgba(0, 0, 0, 0.3)' 
                            : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                        borderRadius: 16,
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: isDark 
                                ? '0px 8px 30px rgba(0, 0, 0, 0.4)' 
                                : '0px 8px 30px rgba(0, 0, 0, 0.15)',
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '10px 24px',
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 20,
                        fontWeight: 500,
                    },
                },
            },
        },
    });
};

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        if (savedMode) return savedMode;
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleMode = () => {
        setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
    };

    const setLightMode = () => setMode('light');
    const setDarkMode = () => setMode('dark');
    const setSystemMode = () => {
        const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setMode(systemMode);
    };

    const theme = createAppTheme(mode);

    const value = {
        mode,
        toggleMode,
        setLightMode,
        setDarkMode,
        setSystemMode,
        isDark: mode === 'dark'
    };

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
