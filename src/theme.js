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
            main: '#3d5afe',
            light: '#536dfe',
            dark: '#304ffe',
            contrastText: '#8c9eff',
        },
        background: {
            default: '#000000',
            paper: colors.indigo[200],
        },
        // Add other custom colors here
        // ...
    },
});

export default theme;
