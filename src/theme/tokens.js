// Design tokens for the "Surf / Coastal" theme.
// Raw values only — no MUI dependency — so these can be consumed by stories,
// docs, and the theme factory alike.

export const palette = {
    // Deep sea — primaries
    navy: '#0A2540',
    teal: '#2B6E7F',
    tealDeep: '#1E5566',
    tealLight: '#4A94A6',

    // Sunset — secondaries
    coral: '#F4A261',
    coralDeep: '#E07A3E',
    coralLight: '#F8C08A',
    sand: '#E9DCC9',
    sandDeep: '#D4C2A8',

    // Accents / neutrals
    foam: '#F7F5F0',
    cream: '#FBF7F0',
    twilight: '#1B263B',
    abyss: '#081A2E',

    // Functional
    seaMist: '#C9D8DC',
    driftwood: '#8A7D6B',
};

export const fonts = {
    display: '"Fraunces", "Playfair Display", Georgia, serif',
    body: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace',
};

// Wave-inspired cubic-beziers. Keep names evocative — easy to remember in code.
export const easing = {
    // Standard ease-out that feels like a swell cresting.
    swellOut: 'cubic-bezier(0.25, 0.8, 0.3, 1)',
    // Slow start, fast tail — like water rushing up the beach.
    swellIn: 'cubic-bezier(0.7, 0, 0.85, 0.4)',
    // Symmetric — steady rolling wave.
    rolling: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
    // Playful bounce — foam landing.
    foam: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// Named gradients — stored as raw CSS strings so they can drop into `background`.
export const gradients = {
    dawn: `linear-gradient(135deg, ${palette.cream} 0%, ${palette.coral} 100%)`,
    dusk: `linear-gradient(135deg, ${palette.coral} 0%, ${palette.navy} 100%)`,
    deepSea: `linear-gradient(135deg, ${palette.teal} 0%, ${palette.navy} 100%)`,
    foam: `linear-gradient(135deg, ${palette.foam} 0%, ${palette.sand} 100%)`,
    tide: `linear-gradient(180deg, ${palette.tealLight} 0%, ${palette.navy} 100%)`,
};

// Warm, softer shadows. 25 entries — MUI's required shape.
// Built from two stacked shadows: a tight ambient + a diffused warm drop.
const warm = (alpha) => `rgba(30, 20, 10, ${alpha})`;
const ambient = (alpha) => `rgba(10, 37, 64, ${alpha})`;

export const shadows = [
    'none',
    `0px 1px 2px ${ambient(0.06)}, 0px 1px 3px ${warm(0.05)}`,
    `0px 2px 4px ${ambient(0.07)}, 0px 2px 6px ${warm(0.06)}`,
    `0px 3px 6px ${ambient(0.08)}, 0px 4px 10px ${warm(0.07)}`,
    `0px 4px 8px ${ambient(0.09)}, 0px 6px 14px ${warm(0.08)}`,
    `0px 6px 12px ${ambient(0.10)}, 0px 10px 20px ${warm(0.09)}`,
    `0px 8px 16px ${ambient(0.11)}, 0px 12px 24px ${warm(0.10)}`,
    `0px 10px 20px ${ambient(0.12)}, 0px 14px 28px ${warm(0.10)}`,
    `0px 12px 24px ${ambient(0.13)}, 0px 16px 32px ${warm(0.11)}`,
    `0px 14px 28px ${ambient(0.14)}, 0px 18px 36px ${warm(0.11)}`,
    `0px 16px 32px ${ambient(0.15)}, 0px 20px 40px ${warm(0.12)}`,
    `0px 18px 36px ${ambient(0.16)}, 0px 22px 44px ${warm(0.12)}`,
    `0px 20px 40px ${ambient(0.17)}, 0px 24px 48px ${warm(0.13)}`,
    `0px 22px 44px ${ambient(0.18)}, 0px 26px 52px ${warm(0.13)}`,
    `0px 24px 48px ${ambient(0.19)}, 0px 28px 56px ${warm(0.14)}`,
    `0px 26px 52px ${ambient(0.20)}, 0px 30px 60px ${warm(0.14)}`,
    `0px 28px 56px ${ambient(0.21)}, 0px 32px 64px ${warm(0.15)}`,
    `0px 30px 60px ${ambient(0.22)}, 0px 34px 68px ${warm(0.15)}`,
    `0px 32px 64px ${ambient(0.23)}, 0px 36px 72px ${warm(0.16)}`,
    `0px 34px 68px ${ambient(0.24)}, 0px 38px 76px ${warm(0.16)}`,
    `0px 36px 72px ${ambient(0.25)}, 0px 40px 80px ${warm(0.17)}`,
    `0px 38px 76px ${ambient(0.26)}, 0px 42px 84px ${warm(0.17)}`,
    `0px 40px 80px ${ambient(0.27)}, 0px 44px 88px ${warm(0.18)}`,
    `0px 42px 84px ${ambient(0.28)}, 0px 46px 92px ${warm(0.18)}`,
    `0px 44px 88px ${ambient(0.29)}, 0px 48px 96px ${warm(0.19)}`,
];

export const radii = {
    none: 0,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    pill: 999,
};

export const durations = {
    quick: 180,
    base: 280,
    slow: 480,
    swell: 720,
};

const tokens = { palette, fonts, easing, gradients, shadows, radii, durations };

export default tokens;
