import getTheme from '../theme';

const lum = (hex) => {
    const c = [1, 3, 5]
        .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

it('light mode secondary text clears WCAG AA on the page background', () => {
    const { palette } = getTheme('light');
    expect(ratio(palette.text.secondary, palette.background.default)).toBeGreaterThanOrEqual(4.5);
});
