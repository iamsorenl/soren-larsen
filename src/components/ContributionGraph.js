import React, { useEffect, useRef, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PauseButton } from './CyclingMedia';

const CELL = 10;
const GAP = 2;
const STEP = CELL + GAP;

// 0 for no contributions, else 1-4 by quartile of the non-zero days, so one
// very busy day doesn't flatten the rest into the lowest shade.
const quartiles = (days) => {
    const nz = days.map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b);
    return [0.25, 0.5, 0.75].map((q) => nz[Math.floor(q * (nz.length - 1))] ?? 0);
};
const level = (count, [q1, q2, q3]) => (count === 0 ? 0 : count <= q1 ? 1 : count <= q2 ? 2 : count <= q3 ? 3 : 4);

// Swell height in rows (0 = top) at fraction fx across the graph, time secs.
const swellAt = (fx, secs) => 3.5 + 1.6 * Math.sin(fx * 9 - secs * 1.6) + 0.8 * Math.sin(fx * 23 - secs * 2.7);

// "The graph is the ocean": GitHub-style calendar where a swell line rolls
// through the squares; below it is bright water, above it dim sky, and the
// squares bob. Static under reduced motion.
const ContributionGraph = ({ days, total }) => {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const theme = useTheme();
    const phone = useMediaQuery(theme.breakpoints.down('sm')); // tile is a 72px square there
    const ref = useRef(null);
    const rects = useRef([]);
    const swell = useRef(null);
    const [inView, setInView] = useState(false);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (reduced || !ref.current || typeof IntersectionObserver === 'undefined') return undefined;
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                io.disconnect();
            }
        });
        io.observe(ref.current);
        return () => io.disconnect();
    }, [reduced]);

    const n = days ? days.length : 0;
    const offset = n ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay() : 0;
    const weeks = Math.ceil((n + offset) / 7);
    const width = weeks * STEP;
    const height = 7 * STEP;
    const crest = alpha('#e6ecff', 0.9);

    // Draw one frame by setting attributes directly (no React render per frame).
    const paint = (secs) => {
        rects.current.forEach((el, i) => {
            if (!el) return;
            const col = Math.floor((i + offset) / 7);
            const row = (i + offset) % 7;
            const fx = col / weeks;
            const s = swellAt(fx, secs);
            el.style.opacity = row >= s ? 1 : 0.28;
            el.style.transform = `translateY(${(Math.sin(fx * 9 - secs * 1.6 + row * 0.3) * 1.2).toFixed(2)}px)`;
            el.style.fill = Math.abs(row - s) < 0.6 ? crest : '';
        });
        if (swell.current) {
            let d = '';
            for (let c = 0; c <= weeks; c += 1) {
                d += `${c ? 'L' : 'M'} ${c * STEP} ${(swellAt(c / weeks, secs) * STEP).toFixed(1)} `;
            }
            swell.current.setAttribute('d', d);
        }
    };

    useEffect(() => {
        if (!n) return undefined;
        if (reduced || !inView || paused) {
            if (!inView || reduced) paint(0);
            return undefined;
        }
        const t0 = performance.now();
        let id;
        const frame = (now) => {
            paint((now - t0) / 1000);
            id = requestAnimationFrame(frame);
        };
        id = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(id);
        // paint only depends on values covered here
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [n, reduced, inView, paused, weeks, offset]);

    if (!n) return null;

    const cuts = quartiles(days);

    return (
        <Box
            ref={ref}
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (t) => (t.palette.mode === 'dark' ? '#0d1240' : '#eef0fb'),
            }}
        >
            <svg
                role="img"
                aria-label={`${total} GitHub contributions in the last year`}
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio={phone ? 'xMaxYMid slice' : 'xMidYMid meet'}
                width={phone ? '100%' : '92%'}
                height={phone ? '100%' : '80%'}
            >
                {days.map((d, i) => {
                    const col = Math.floor((i + offset) / 7);
                    const row = (i + offset) % 7;
                    const lv = level(d.count, cuts);
                    return (
                        <Box
                            component="rect"
                            key={d.date}
                            ref={(el) => { rects.current[i] = el; }}
                            data-testid="day"
                            data-level={String(lv)}
                            x={col * STEP}
                            y={row * STEP}
                            width={CELL}
                            height={CELL}
                            rx={2}
                            sx={{ fill: (t) => alpha(t.palette.primary.main, lv === 0 ? 0.12 : 0.2 + lv * 0.2) }}
                        />
                    );
                })}
                <path
                    ref={swell}
                    data-testid="swell"
                    fill="none"
                    stroke={alpha(theme.palette.primary.light || '#a9b4ff', 0.55)}
                    strokeWidth="1.2"
                />
            </svg>
            {!reduced && <PauseButton paused={paused} onToggle={() => setPaused((p) => !p)} size={phone ? 24 : 30} />}
        </Box>
    );
};

export default ContributionGraph;
