import { createTheme } from '@mui/material/styles';
import {
    palette as tokenPalette,
    fonts,
    easing,
    gradients,
    shadows,
    radii,
    durations,
} from './tokens';

// Build the MUI theme for the "Surf / Coastal" design system.
// Supported modes: 'light' ("Dawn") and 'dark' ("Night Tide").
const getSurfTheme = (mode = 'light') => {
    const isDark = mode === 'dark';

    const bg = isDark
        ? { default: tokenPalette.abyss, paper: tokenPalette.twilight }
        : { default: tokenPalette.cream, paper: tokenPalette.foam };

    const text = isDark
        ? { primary: tokenPalette.foam, secondary: tokenPalette.seaMist }
        : { primary: tokenPalette.navy, secondary: tokenPalette.driftwood };

    return createTheme({
        palette: {
            mode,
            primary: {
                main: isDark ? tokenPalette.tealLight : tokenPalette.navy,
                light: tokenPalette.tealLight,
                dark: tokenPalette.navy,
                contrastText: tokenPalette.foam,
            },
            secondary: {
                main: isDark ? tokenPalette.coralLight : tokenPalette.coral,
                light: tokenPalette.coralLight,
                dark: tokenPalette.coralDeep,
                contrastText: tokenPalette.navy,
            },
            background: bg,
            text,
            divider: isDark ? 'rgba(247, 245, 240, 0.12)' : 'rgba(10, 37, 64, 0.12)',
            // Surface the custom tokens so components can reach them via useTheme().
            surf: {
                navy: tokenPalette.navy,
                teal: tokenPalette.teal,
                tealDeep: tokenPalette.tealDeep,
                tealLight: tokenPalette.tealLight,
                coral: tokenPalette.coral,
                coralDeep: tokenPalette.coralDeep,
                coralLight: tokenPalette.coralLight,
                sand: tokenPalette.sand,
                foam: tokenPalette.foam,
                cream: tokenPalette.cream,
                twilight: tokenPalette.twilight,
                abyss: tokenPalette.abyss,
                driftwood: tokenPalette.driftwood,
                seaMist: tokenPalette.seaMist,
            },
        },
        typography: {
            fontFamily: fonts.body,
            h1: {
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: '4rem',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
            },
            h2: {
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: '3rem',
                lineHeight: 1.1,
                letterSpacing: '-0.015em',
            },
            h3: {
                fontFamily: fonts.display,
                fontWeight: 500,
                fontSize: '2.25rem',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
            },
            h4: {
                fontFamily: fonts.display,
                fontWeight: 500,
                fontSize: '1.75rem',
                lineHeight: 1.25,
            },
            h5: {
                fontFamily: fonts.display,
                fontWeight: 500,
                fontSize: '1.375rem',
                lineHeight: 1.35,
            },
            h6: {
                fontFamily: fonts.body,
                fontWeight: 600,
                fontSize: '1.125rem',
                lineHeight: 1.4,
                letterSpacing: '0.01em',
            },
            subtitle1: {
                fontFamily: fonts.body,
                fontWeight: 500,
                fontSize: '1rem',
                lineHeight: 1.5,
            },
            subtitle2: {
                fontFamily: fonts.mono,
                fontWeight: 500,
                fontSize: '0.75rem',
                lineHeight: 1.4,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
            },
            body1: {
                fontSize: '1rem',
                lineHeight: 1.65,
            },
            body2: {
                fontSize: '0.875rem',
                lineHeight: 1.6,
            },
            button: {
                fontFamily: fonts.body,
                fontWeight: 600,
                letterSpacing: '0.02em',
                textTransform: 'none',
            },
            overline: {
                fontFamily: fonts.mono,
                fontWeight: 500,
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
            },
            caption: {
                fontSize: '0.75rem',
                lineHeight: 1.5,
            },
        },
        shape: {
            borderRadius: radii.md,
        },
        shadows,
        // Custom namespace — stable place for consumers to pull surf-specific tokens.
        surf: {
            gradients,
            easing,
            radii,
            durations,
            fonts,
        },
        transitions: {
            easing: {
                easeInOut: easing.rolling,
                easeOut: easing.swellOut,
                easeIn: easing.swellIn,
                sharp: easing.swellOut,
            },
            duration: {
                shortest: durations.quick,
                shorter: durations.quick,
                short: durations.base,
                standard: durations.base,
                complex: durations.slow,
                enteringScreen: durations.base,
                leavingScreen: durations.quick,
            },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        fontFamily: fonts.body,
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: radii.lg,
                        backgroundImage: 'none',
                        boxShadow: shadows[2],
                        transition: `transform ${durations.base}ms ${easing.swellOut}, box-shadow ${durations.base}ms ${easing.swellOut}`,
                        '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: shadows[6],
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: radii.pill,
                        padding: '10px 22px',
                        transition: `all ${durations.base}ms ${easing.swellOut}`,
                    },
                    containedPrimary: {
                        boxShadow: shadows[1],
                        '&:hover': { boxShadow: shadows[4] },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: radii.pill,
                        fontWeight: 500,
                        fontFamily: fonts.body,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
        },
    });
};

export default getSurfTheme;
export { getSurfTheme };
