import React, { useEffect, useRef } from 'react';
import { Box, useMediaQuery } from '@mui/material';

const PLANES = [0, 1, 2, 3];

// Four paper planes drifting near the bottom of their parent, behind its
// content. When `target` ({ x, y, rx, ry } in parent px) is set they fly over
// and circle it; when it clears they drift back. Static under reduced motion.
const PaperPlanes = ({ target }) => {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    const svg = useRef(null);
    const targetRef = useRef(target);
    targetRef.current = target;

    useEffect(() => {
        const el = svg.current;
        if (!el) return undefined;
        const planes = PLANES.map((i) => ({
            g: el.querySelector(`[data-plane="${i}"]`),
            tr: el.querySelector(`[data-trail="${i}"]`),
            t: i * 1.57, x: 0, y: 0, a: 0, pts: [], sp: 0.012 + i * 0.002, s: 1 - i * 0.12, init: false,
        }));
        let id;
        const step = () => {
            const W = el.clientWidth || 600;
            const H = el.clientHeight || 300;
            const tg = targetRef.current;
            planes.forEach((p, i) => {
                p.t += reduced ? 0 : p.sp;
                const gx = tg ? tg.x + Math.cos(p.t * 2.2) * tg.rx : W * (0.4 + 0.15 * i) + Math.cos(p.t) * W * 0.12;
                const gy = tg ? tg.y + Math.sin(p.t * 2.2) * tg.ry : H - 50 + Math.sin(p.t * 2) * (14 + 4 * i);
                if (!p.init || reduced) { p.x = gx; p.y = gy; p.init = true; }
                const k = tg ? 0.07 : 0.04;
                const dx = (gx - p.x) * k;
                const dy = (gy - p.y) * k;
                p.x += dx;
                p.y += dy;
                if (Math.abs(dx) + Math.abs(dy) > 0.05) p.a = (Math.atan2(dy, dx) * 180) / Math.PI;
                p.pts.push([p.x, p.y]);
                if (p.pts.length > 34) p.pts.shift();
                if (p.tr) p.tr.setAttribute('d', p.pts.length > 1 && !reduced ? `M${p.pts.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join(' L ')}` : '');
                if (p.g) p.g.setAttribute('transform', `translate(${p.x - 9} ${p.y - 7}) rotate(${p.a} 9 7) scale(${p.s})`);
            });
            if (!reduced) id = requestAnimationFrame(step);
        };
        step();
        return () => cancelAnimationFrame(id);
    }, [reduced]);

    return (
        <Box
            component="svg"
            ref={svg}
            data-testid="paper-planes"
            aria-hidden="true"
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
        >
            {PLANES.map((i) => (
                <React.Fragment key={i}>
                    <Box component="path" data-trail={i} sx={{ fill: 'none', stroke: (t) => (t.palette.mode === 'dark' ? 'rgba(143,156,245,.5)' : 'rgba(63,81,181,.35)'), strokeWidth: 1.5, strokeDasharray: '4 6' }} />
                    <g data-plane={i}>
                        <Box component="path" d="M0 0 L 18 7 L 0 14 L 4 7 Z" sx={{ fill: (t) => (t.palette.mode === 'dark' ? '#a9b4ff' : t.palette.primary.main) }} />
                    </g>
                </React.Fragment>
            ))}
        </Box>
    );
};

export default PaperPlanes;
