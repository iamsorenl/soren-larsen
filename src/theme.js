import { createTheme, colors } from '@mui/material';

const theme = createTheme({
    palette: {
        primary: {
            main: colors.indigo[800],
            light: colors.indigo[600],
            dark: colors.indigo[900],
            contrastText: colors.indigo[50],
        },
        secondary: {
            main: colors.lightBlue[400],
            light: colors.lightBlue[200],
            dark: colors.lightBlue[600],
            contrastText: colors.lightBlue[50],
        },
        background: {
            default: '#000000',
            paper: '#000000',
        },
        // Add other custom colors here
        // ...
    },
});

export default theme;
