import React, { useEffect, useRef, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

const CELL = 10;
const GAP = 2;

// 0 for no contributions, else 1-4 by quartile of the non-zero days, so one
// very busy day doesn't flatten the rest into the lowest shade.
const quartiles = (days) => {
    const nz = days.map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b);
    return [0.25, 0.5, 0.75].map((q) => nz[Math.floor(q * (nz.length - 1))] ?? 0);
};
const level = (count, [q1, q2, q3]) => (count === 0 ? 0 : count <= q1 ? 1 : count <= q2 ? 2 : count <= q3 ? 3 : 4);

// GitHub-style calendar that fills in week by week once it scrolls into view.
const ContributionGraph = ({ days, total }) => {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const phone = useMediaQuery(useTheme().breakpoints.down('sm')); // tile is a 72px square there
    const ref = useRef(null);
    const [drawing, setDrawing] = useState(false);

    useEffect(() => {
        if (reduced || !ref.current || typeof IntersectionObserver === 'undefined') return undefined;
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setDrawing(true);
                io.disconnect();
            }
        });
        io.observe(ref.current);
        return () => io.disconnect();
    }, [reduced]);

    if (!days || days.length === 0) return null;

    const cuts = quartiles(days);
    const offset = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
    const weeks = Math.ceil((days.length + offset) / 7);
    const width = weeks * (CELL + GAP);
    const height = 7 * (CELL + GAP);

    return (
        <Box
            ref={ref}
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (t) => (t.palette.mode === 'dark' ? '#0d1240' : '#eef0fb'),
                '@keyframes dayIn': { from: { opacity: 0 }, to: { opacity: 1 } },
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
                            data-testid="day"
                            data-level={String(lv)}
                            x={col * (CELL + GAP)}
                            y={row * (CELL + GAP)}
                            width={CELL}
                            height={CELL}
                            rx={2}
                            sx={{
                                fill: (t) => alpha(t.palette.primary.main, lv === 0 ? 0.12 : 0.2 + lv * 0.2),
                                ...(drawing && {
                                    opacity: 0,
                                    animation: 'dayIn 0.3s ease forwards',
                                    animationDelay: `${col * 35}ms`,
                                }),
                            }}
                        />
                    );
                })}
            </svg>
        </Box>
    );
};

export default ContributionGraph;
