import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
    palette: {
        mode,
        primary: {
            main: mode === 'dark' ? '#1a237e' : '#7986cb', // Darker purple for dark mode, lighter for light mode
            light: mode === 'dark' ? '#534bae' : '#aab6fe',
            dark: mode === 'dark' ? '#000051' : '#49599a',
            contrastText: '#ffffff',
        },
        secondary: {
            main: mode === 'dark' ? '#00bcd4' : '#26a69a',
            light: mode === 'dark' ? '#62efff' : '#64d8cb',
            dark: mode === 'dark' ? '#008ba3' : '#00766c',
            contrastText: mode === 'dark' ? '#000000' : '#ffffff',
        },
        background: {
            default: mode === 'dark' ? '#121212' : '#f5f5f5',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
        text: {
            primary: mode === 'dark' ? '#ffffff' : '#000000',
            secondary: mode === 'dark' ? '#b0bec5' : '#666666',
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
    shadows: [
        'none',
        '0px 2px 4px rgba(0, 0, 0, 0.1)',
        '0px 4px 8px rgba(0, 0, 0, 0.12)',
        '0px 8px 16px rgba(0, 0, 0, 0.14)',
        '0px 12px 24px rgba(0, 0, 0, 0.16)',
        '0px 16px 32px rgba(0, 0, 0, 0.18)',
        '0px 20px 40px rgba(0, 0, 0, 0.20)',
        '0px 24px 48px rgba(0, 0, 0, 0.22)',
        '0px 28px 56px rgba(0, 0, 0, 0.24)',
        '0px 32px 64px rgba(0, 0, 0, 0.26)',
        '0px 36px 72px rgba(0, 0, 0, 0.28)',
        '0px 40px 80px rgba(0, 0, 0, 0.30)',
        '0px 44px 88px rgba(0, 0, 0, 0.32)',
        '0px 48px 96px rgba(0, 0, 0, 0.34)',
        '0px 52px 104px rgba(0, 0, 0, 0.36)',
        '0px 56px 112px rgba(0, 0, 0, 0.38)',
        '0px 60px 120px rgba(0, 0, 0, 0.40)',
        '0px 64px 128px rgba(0, 0, 0, 0.42)',
        '0px 68px 136px rgba(0, 0, 0, 0.44)',
        '0px 72px 144px rgba(0, 0, 0, 0.46)',
        '0px 76px 152px rgba(0, 0, 0, 0.48)',
        '0px 80px 160px rgba(0, 0, 0, 0.50)',
        '0px 84px 168px rgba(0, 0, 0, 0.52)',
        '0px 88px 176px rgba(0, 0, 0, 0.54)',
        '0px 92px 184px rgba(0, 0, 0, 0.56)',
    ],
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: mode === 'dark' 
                        ? '0px 4px 20px rgba(0, 0, 0, 0.3)'
                        : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                    borderRadius: 16,
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: mode === 'dark'
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

export default getTheme;
