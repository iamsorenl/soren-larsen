import getTheme from '../theme';

describe('focus visibility', () => {
    it.each(['light', 'dark'])('gives buttons a visible focus ring in %s mode', (mode) => {
        const theme = getTheme(mode);
        const button = theme.components?.MuiButton?.styleOverrides?.root;
        const iconButton = theme.components?.MuiIconButton?.styleOverrides?.root;

        // theme.js has no standalone `palette` binding in scope inside
        // `components`, so the focus-ring styles are written as MUI's
        // theme-callback form: `root: ({ theme }) => ({ ... })`. A function
        // doesn't stringify to matching text, so call it with the built
        // theme to get the resolved style object before asserting.
        const buttonStyle = typeof button === 'function' ? button({ theme }) : button;
        const iconButtonStyle = typeof iconButton === 'function' ? iconButton({ theme }) : iconButton;

        [buttonStyle, iconButtonStyle].forEach((style) => {
            const rule = style?.['&.Mui-focusVisible'];
            expect(rule).toBeDefined();
            expect(rule.outline).toMatch(/^2px solid /);
            expect(rule.outline).not.toBe('none');
        });
    });
});
