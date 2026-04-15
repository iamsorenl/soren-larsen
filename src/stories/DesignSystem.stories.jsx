import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Divider,
    Button,
} from '@mui/material';
import {
    palette,
    fonts,
    easing,
    gradients,
    shadows,
    radii,
    durations,
} from '../theme/tokens';

// ---------------------------------------------------------------------------
// Section scaffolding
// ---------------------------------------------------------------------------

const Section = ({ label, title, description, children }) => (
    <Box sx={{ mb: 8 }}>
        <Typography
            variant="overline"
            sx={{
                fontFamily: fonts.mono,
                color: palette.coralDeep,
                letterSpacing: '0.22em',
            }}
        >
            {label}
        </Typography>
        <Typography
            variant="h3"
            sx={{ fontFamily: fonts.display, mt: 0.5, mb: 1 }}
        >
            {title}
        </Typography>
        {description && (
            <Typography
                variant="body1"
                sx={{ maxWidth: 720, mb: 3, color: 'text.secondary' }}
            >
                {description}
            </Typography>
        )}
        {children}
    </Box>
);

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

const paletteGroups = [
    {
        label: 'Primary — Deep Sea',
        swatches: [
            { name: 'navy', hex: palette.navy },
            { name: 'twilight', hex: palette.twilight },
            { name: 'abyss', hex: palette.abyss },
            { name: 'teal', hex: palette.teal },
            { name: 'tealDeep', hex: palette.tealDeep },
            { name: 'tealLight', hex: palette.tealLight },
        ],
    },
    {
        label: 'Secondary — Sunset',
        swatches: [
            { name: 'coralDeep', hex: palette.coralDeep },
            { name: 'coral', hex: palette.coral },
            { name: 'coralLight', hex: palette.coralLight },
            { name: 'sandDeep', hex: palette.sandDeep },
            { name: 'sand', hex: palette.sand },
        ],
    },
    {
        label: 'Accents & Neutrals',
        swatches: [
            { name: 'foam', hex: palette.foam },
            { name: 'cream', hex: palette.cream },
            { name: 'seaMist', hex: palette.seaMist },
            { name: 'driftwood', hex: palette.driftwood },
        ],
    },
];

const Swatch = ({ name, hex }) => {
    // Pick readable text color based on a quick luminance check.
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const fg = lum > 0.6 ? palette.navy : palette.foam;

    return (
        <Box
            sx={{
                width: 180,
                height: 120,
                bgcolor: hex,
                color: fg,
                borderRadius: `${radii.md}px`,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                boxShadow: shadows[2],
            }}
        >
            <Typography
                variant="subtitle2"
                sx={{ fontFamily: fonts.mono, letterSpacing: '0.1em' }}
            >
                {name}
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: fonts.mono }}>
                {hex.toUpperCase()}
            </Typography>
        </Box>
    );
};

const PaletteSection = () => (
    <Section
        label="Swell 01 / Palette"
        title="Colors"
        description="Deep-sea primaries, sunset secondaries, and warm foam neutrals. Use navy and teal as anchors; coral and sand sparingly for warmth and emphasis."
    >
        <Stack spacing={3}>
            {paletteGroups.map((group) => (
                <Box key={group.label}>
                    <Typography
                        variant="overline"
                        sx={{ fontFamily: fonts.mono, color: 'text.secondary' }}
                    >
                        {group.label}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap', gap: 2 }}>
                        {group.swatches.map((s) => (
                            <Swatch key={s.name} name={s.name} hex={s.hex} />
                        ))}
                    </Stack>
                </Box>
            ))}
        </Stack>
    </Section>
);

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

const TypographySection = () => (
    <Section
        label="Swell 02 / Type"
        title="Typography"
        description="Fraunces for display (variable, warm, characterful). Inter for body. JetBrains Mono for section markers and coded accents."
    >
        <Stack spacing={3}>
            <Box>
                <Typography
                    variant="overline"
                    sx={{ fontFamily: fonts.mono, color: 'text.secondary' }}
                >
                    Fraunces — Display
                </Typography>
                <Typography sx={{ fontFamily: fonts.display, fontSize: '4rem', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                    Dawn patrol.
                </Typography>
                <Typography sx={{ fontFamily: fonts.display, fontSize: '3rem', fontWeight: 600, lineHeight: 1.1 }}>
                    Heading two — the set is building.
                </Typography>
                <Typography sx={{ fontFamily: fonts.display, fontSize: '2.25rem', fontWeight: 500 }}>
                    Heading three — paddle out.
                </Typography>
                <Typography sx={{ fontFamily: fonts.display, fontSize: '1.75rem', fontWeight: 500 }}>
                    Heading four — drop in.
                </Typography>
                <Typography sx={{ fontFamily: fonts.display, fontSize: '1.375rem', fontWeight: 500 }}>
                    Heading five — trim the line.
                </Typography>
            </Box>
            <Divider />
            <Box>
                <Typography
                    variant="overline"
                    sx={{ fontFamily: fonts.mono, color: 'text.secondary' }}
                >
                    Inter — Body
                </Typography>
                <Typography sx={{ fontFamily: fonts.body, fontSize: '1rem', lineHeight: 1.65, maxWidth: 640 }}>
                    Body copy sits in Inter at 16px with generous line-height. It should feel
                    like clean saltwater glass — legible, unhurried, confident. Use it for
                    paragraph text, captions, and UI labels.
                </Typography>
                <Typography sx={{ fontFamily: fonts.body, fontSize: '0.875rem', mt: 1, color: 'text.secondary' }}>
                    Secondary body — smaller, muted, for meta information.
                </Typography>
            </Box>
            <Divider />
            <Box>
                <Typography
                    variant="overline"
                    sx={{ fontFamily: fonts.mono, color: 'text.secondary' }}
                >
                    JetBrains Mono — Accent
                </Typography>
                <Typography sx={{ fontFamily: fonts.mono, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: palette.coralDeep }}>
                    Swell 01 / About
                </Typography>
                <Typography sx={{ fontFamily: fonts.mono, fontSize: '0.875rem', mt: 1 }}>
                    const wave = ocean.next();
                </Typography>
            </Box>
        </Stack>
    </Section>
);

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

const shadowSteps = [1, 2, 3, 4, 6, 8, 12, 16, 20, 24];

const ShadowsSection = () => (
    <Section
        label="Swell 03 / Elevation"
        title="Shadows"
        description="Warmer than MUI defaults — stacked ambient navy + diffused warm drop. Scales across all 25 MUI elevations; a few stops shown below."
    >
        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 3, rowGap: 4 }}>
            {shadowSteps.map((step) => (
                <Box
                    key={step}
                    sx={{
                        width: 160,
                        height: 120,
                        bgcolor: palette.foam,
                        borderRadius: `${radii.md}px`,
                        boxShadow: shadows[step],
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        p: 1.5,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{ fontFamily: fonts.mono, color: palette.navy }}
                    >
                        elevation {step}
                    </Typography>
                </Box>
            ))}
        </Stack>
    </Section>
);

// ---------------------------------------------------------------------------
// Gradients
// ---------------------------------------------------------------------------

const gradientEntries = Object.entries(gradients);

const GradientsSection = () => (
    <Section
        label="Swell 04 / Gradients"
        title="Gradients"
        description="Named gradients for hero surfaces and section dividers. Reference by name when possible."
    >
        <Stack spacing={2}>
            {gradientEntries.map(([name, value]) => (
                <Box
                    key={name}
                    sx={{
                        height: 96,
                        borderRadius: `${radii.md}px`,
                        background: value,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 3,
                        color: palette.foam,
                        textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                        boxShadow: shadows[3],
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: fonts.display,
                            fontSize: '1.5rem',
                            fontWeight: 600,
                        }}
                    >
                        {name}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ fontFamily: fonts.mono, opacity: 0.85 }}
                    >
                        gradients.{name}
                    </Typography>
                </Box>
            ))}
        </Stack>
    </Section>
);

// ---------------------------------------------------------------------------
// Easing — animated demo
// ---------------------------------------------------------------------------

const easingEntries = Object.entries(easing);

// One shared keyframe — translate across the track. Each row swaps the curve.
const easingKeyframes = `
    @keyframes surf-slide {
        0% { transform: translateX(0); }
        50% { transform: translateX(calc(100% - 44px)); }
        100% { transform: translateX(0); }
    }
`;

const EasingDemo = () => {
    const [runId, setRunId] = useState(0);
    const timer = useRef(null);

    useEffect(() => {
        timer.current = setInterval(
            () => setRunId((n) => n + 1),
            (durations.swell * 2) + 600,
        );
        return () => clearInterval(timer.current);
    }, []);

    return (
        <Stack spacing={2}>
            <style>{easingKeyframes}</style>
            {easingEntries.map(([name, curve]) => (
                <Box key={name}>
                    <Stack direction="row" spacing={2} alignItems="baseline" sx={{ mb: 0.5 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{ fontFamily: fonts.mono, minWidth: 110, color: palette.coralDeep }}
                        >
                            {name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: fonts.mono, color: 'text.secondary' }}>
                            {curve}
                        </Typography>
                    </Stack>
                    <Box
                        sx={{
                            position: 'relative',
                            height: 28,
                            borderRadius: `${radii.pill}px`,
                            bgcolor: 'action.hover',
                            overflow: 'hidden',
                            p: '4px',
                        }}
                    >
                        <Box
                            key={`${name}-${runId}`}
                            sx={{
                                width: 36,
                                height: 20,
                                borderRadius: `${radii.pill}px`,
                                background: gradients.dusk,
                                animation: `surf-slide ${durations.swell * 2}ms ${curve} forwards`,
                            }}
                        />
                    </Box>
                </Box>
            ))}
            <Button
                variant="outlined"
                size="small"
                onClick={() => setRunId((n) => n + 1)}
                sx={{ alignSelf: 'flex-start', mt: 1 }}
            >
                Replay
            </Button>
        </Stack>
    );
};

const EasingSection = () => (
    <Section
        label="Swell 05 / Motion"
        title="Easing"
        description="Wave-inspired cubic-beziers. swellOut is the default for UI reveals; foam adds a playful overshoot for confirmation states."
    >
        <EasingDemo />
    </Section>
);

// ---------------------------------------------------------------------------
// Radii
// ---------------------------------------------------------------------------

const RadiiSection = () => {
    const entries = Object.entries(radii);
    return (
        <Section
            label="Swell 06 / Shape"
            title="Radii"
            description="Slightly softer than the classic theme. Pill radius lives at 999 for buttons and chips."
        >
            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 3 }}>
                {entries.map(([name, value]) => (
                    <Stack key={name} spacing={1} alignItems="center">
                        <Box
                            sx={{
                                width: 120,
                                height: 120,
                                borderRadius: `${value}px`,
                                background: gradients.deepSea,
                                boxShadow: shadows[2],
                            }}
                        />
                        <Typography variant="subtitle2" sx={{ fontFamily: fonts.mono }}>
                            {name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: fonts.mono, color: 'text.secondary' }}>
                            {value}px
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Section>
    );
};

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

const DesignSystem = () => (
    <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 1200, mx: 'auto' }}>
        <Card sx={{ mb: 6, overflow: 'hidden' }}>
            <Box sx={{ background: gradients.dusk, color: palette.foam, p: { xs: 3, md: 5 } }}>
                <Typography
                    variant="overline"
                    sx={{ fontFamily: fonts.mono, letterSpacing: '0.22em' }}
                >
                    Surf Design System / v0.1
                </Typography>
                <Typography
                    sx={{
                        fontFamily: fonts.display,
                        fontSize: { xs: '2.5rem', md: '4rem' },
                        fontWeight: 600,
                        lineHeight: 1.05,
                        mt: 1,
                    }}
                >
                    Dawn Patrol.
                </Typography>
                <Typography sx={{ mt: 2, maxWidth: 640, opacity: 0.9 }}>
                    A warm, coastal token set for the Soren Larsen portfolio. Use this page
                    as the source of truth while iterating on components in Storybook.
                </Typography>
            </Box>
            <CardContent>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Toggle the theme picker in the toolbar to preview tokens against Surf Light
                    and Surf Dark surfaces. Classic Light/Dark are still available for
                    comparison with the current live site.
                </Typography>
            </CardContent>
        </Card>

        <PaletteSection />
        <TypographySection />
        <ShadowsSection />
        <GradientsSection />
        <EasingSection />
        <RadiiSection />
    </Box>
);

const meta = {
    title: 'Design System/Surf Tokens',
    component: DesignSystem,
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

export const Overview = { args: {} };
