import React, { useEffect, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { PauseButton } from './CyclingMedia';

// Our own drawing of a branching decision path (Causality's idea, not their
// artwork): the path draws left to right, gray branches fade, a red dashed
// branch fails, a green branch carries on to a dotted end. Loops every 7 s;
// reduced motion shows the finished drawing.
const PALETTE = {
    dark: { bg: '#121538', contour: 'rgba(143,156,245,.16)', path: '#8f9cf5', glow: 'rgba(143,156,245,.25)', dim: 'rgba(174,180,214,.45)', ok: '#4ade80', okGlow: 'rgba(74,222,128,.25)', bad: '#f87171' },
    light: { bg: '#f4f1ea', contour: 'rgba(0,0,0,.10)', path: '#2350c8', glow: 'rgba(35,80,200,.18)', dim: 'rgba(0,0,0,.30)', ok: '#22a35a', okGlow: 'rgba(34,163,90,.2)', bad: '#e0524f' },
};
const W = 450;
const H = 140;
const MY = H / 2;
const x = (f) => f * W;
const N1 = [x(0.08), MY + 22];
const N2 = [x(0.38), MY];
const N3 = [x(0.6), MY];
const N4 = [x(0.84), MY - 26];
const END = [x(0.97), MY - 40];
const BADX = [x(0.84), MY + 30];
const P = {
    main1: `M ${N1[0]} ${N1[1]} C ${x(0.22)} ${N1[1]}, ${x(0.25)} ${N2[1]}, ${N2[0]} ${N2[1]}`,
    main2: `M ${N2[0]} ${N2[1]} L ${N3[0]} ${N3[1]}`,
    ok: `M ${N3[0]} ${N3[1]} C ${x(0.72)} ${N3[1]}, ${x(0.72)} ${N4[1]}, ${N4[0]} ${N4[1]}`,
    dot: `M ${N4[0]} ${N4[1]} C ${x(0.9)} ${N4[1]}, ${x(0.92)} ${END[1]}, ${END[0]} ${END[1]}`,
    fadeUp: `M ${N2[0]} ${N2[1]} C ${x(0.48)} ${N2[1]}, ${x(0.5)} ${MY - 48}, ${x(0.84)} ${MY - 58}`,
    fadeDn: `M ${N2[0]} ${N2[1]} C ${x(0.48)} ${N2[1]}, ${x(0.52)} ${MY + 46}, ${x(0.84)} ${MY + 54}`,
    bad: `M ${N3[0]} ${N3[1]} C ${x(0.7)} ${N3[1]}, ${x(0.74)} ${MY + 30}, ${BADX[0]} ${BADX[1]}`,
};
const CONTOURS = Array.from({ length: 7 }, (_, k) => {
    const y = (k / 6) * H * 1.2 - H * 0.1;
    return `M -10 ${y} C ${x(0.25)} ${y - 25}, ${x(0.5)} ${y + 30}, ${x(0.75)} ${y - 10} S ${W + 20} ${y + 20}, ${W + 20} ${y}`;
});

const CausalityAnim = () => {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const c = PALETTE[useTheme().palette.mode] || PALETTE.dark;
    const [cycle, setCycle] = useState(0);
    const [paused, setPaused] = useState(false);
    const animate = !reduced;

    useEffect(() => {
        if (!animate || paused) return undefined;
        const id = setInterval(() => setCycle((c) => c + 1), 7000);
        return () => clearInterval(id);
    }, [animate, paused]);

    // Draw-on via dashoffset. Dashed strokes reveal through a mask that draws
    // instead, so they keep their dash pattern.
    // Play state goes inline too: the inline `animation` shorthand resets it.
    const state = paused ? 'paused' : 'running';
    const draw = (len, t, d) => (animate
        ? { strokeDasharray: len, strokeDashoffset: len, animation: `caDraw ${t}s ease-in-out ${d}s forwards`, animationPlayState: state }
        : {});
    const pop = (p, d) => (animate
        ? { opacity: 0, transformOrigin: `${p[0]}px ${p[1]}px`, animation: `caPop .3s ease-out ${d}s forwards`, animationPlayState: state }
        : {});

    return (
        <Box
            data-testid="causality-anim"
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                bgcolor: c.bg,
                '@keyframes caDraw': { to: { strokeDashoffset: 0 } },
                '@keyframes caPop': { from: { opacity: 0, transform: 'scale(.3)' }, to: { opacity: 1, transform: 'scale(1)' } },
            }}
        >
            <PaletteSvg key={cycle} c={c} draw={draw} pop={pop} />
            {animate && <PauseButton paused={paused} onToggle={() => setPaused((p) => !p)} size={24} />}
        </Box>
    );
};

const PaletteSvg = ({ c, draw, pop }) => (
    <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{ display: 'block' }}>
        <defs>
            <mask id="ca-bad-mask" maskUnits="userSpaceOnUse">
                <path d={P.bad} stroke="#fff" strokeWidth="6" fill="none" style={draw(300, 0.9, 2.0)} />
            </mask>
            <mask id="ca-dot-mask" maskUnits="userSpaceOnUse">
                <path d={P.dot} stroke="#fff" strokeWidth="6" fill="none" style={draw(200, 0.8, 3.0)} />
            </mask>
        </defs>
        {CONTOURS.map((d) => <path key={d} d={d} fill="none" stroke={c.contour} strokeWidth="1" />)}
        <g fill="none" strokeLinecap="round">
            <path d={P.main1} stroke={c.glow} strokeWidth="7" style={draw(400, 1.0, 0.2)} />
            <path data-branch="main" d={P.main1} stroke={c.path} strokeWidth="2" style={draw(400, 1.0, 0.2)} />
            <path data-branch="gray" d={P.fadeUp} stroke={c.dim} strokeWidth="1" style={draw(500, 1.2, 1.2)} />
            <path data-branch="gray" d={P.fadeDn} stroke={c.dim} strokeWidth="1" style={draw(500, 1.2, 1.3)} />
            <path d={P.main2} stroke={c.glow} strokeWidth="7" style={draw(200, 0.6, 1.2)} />
            <path data-branch="main" d={P.main2} stroke={c.path} strokeWidth="2" style={draw(200, 0.6, 1.2)} />
            <path data-branch="red" d={P.bad} stroke={c.bad} strokeWidth="1.4" strokeDasharray="4 4" mask="url(#ca-bad-mask)" />
            <path d={P.ok} stroke={c.okGlow} strokeWidth="7" style={draw(300, 0.9, 2.1)} />
            <path data-branch="green" d={P.ok} stroke={c.ok} strokeWidth="2" style={draw(300, 0.9, 2.1)} />
            <path data-branch="green-end" d={P.dot} stroke={c.path} strokeWidth="1.6" strokeDasharray="3 4" mask="url(#ca-dot-mask)" />
        </g>
        {[[N1, c.path, 4, 0.1], [N2, c.path, 4, 1.15], [N3, c.path, 5, 1.8], [N4, c.ok, 4.5, 3.0]].map(([p, col, r, d]) => (
            <circle key={d} cx={p[0]} cy={p[1]} r={r} fill={c.bg} stroke={col} strokeWidth="1.6" style={pop(p, d)} />
        ))}
        <g style={pop(BADX, 2.9)}>
            <path d={`M ${BADX[0] - 5} ${BADX[1] - 5} L ${BADX[0] + 5} ${BADX[1] + 5} M ${BADX[0] + 5} ${BADX[1] - 5} L ${BADX[0] - 5} ${BADX[1] + 5}`} stroke={c.bad} strokeWidth="1.6" />
        </g>
        <circle cx={END[0]} cy={END[1]} r="4" fill="none" stroke={c.path} strokeWidth="1.4" strokeDasharray="2 2" style={pop(END, 3.8)} />
    </svg>
);

export default CausalityAnim;
