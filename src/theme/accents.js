// Unified accent palette. Five coordinated colors that rotate across
// employers, projects, skills, education entries, etc., so the page reads
// as one designed system rather than per-section ad-hoc colors.
//
// Each accent has light/dark variants tuned for sufficient contrast on the
// background.paper surface in both modes.

export const ACCENT_PALETTE = {
    indigo: { light: '#7986cb', dark: '#9fa8da' },
    cyan: { light: '#0097a7', dark: '#26c6da' },
    coral: { light: '#e85a4f', dark: '#ff8a80' },
    gold: { light: '#d4a017', dark: '#ffd54f' },
    sage: { light: '#5d8a66', dark: '#81c784' },
};

// One signature accent per section. Used for the eyebrow label color and
// the section icon. Per-entry accents inside a section come from the same
// palette but can differ from the section signature.
export const SECTION_ACCENTS = {
    experience: ACCENT_PALETTE.cyan,
    projects: ACCENT_PALETTE.coral,
    skills: ACCENT_PALETTE.gold,
    education: ACCENT_PALETTE.sage,
    contact: ACCENT_PALETTE.indigo,
};

export const resolveAccent = (accent, isDark) => {
    if (!accent) return undefined;
    return isDark ? accent.dark : accent.light;
};
