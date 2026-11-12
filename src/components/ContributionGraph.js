import React, { useEffect, useRef, useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';

const CELL = 10;
const GAP = 2;

// 0 for no contributions, else 1-4 by share of the busiest day.
const level = (count, max) => (count === 0 || max === 0 ? 0 : Math.max(1, Math.ceil((count / max) * 4)));

// GitHub-style calendar that fills in week by week once it scrolls into view.
const ContributionGraph = ({ days, total }) => {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
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

    const max = Math.max(...days.map((d) => d.count));
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
                preserveAspectRatio="xMidYMid meet"
                width="92%"
                height="80%"
            >
                {days.map((d, i) => {
                    const col = Math.floor((i + offset) / 7);
                    const row = (i + offset) % 7;
                    const lv = level(d.count, max);
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
