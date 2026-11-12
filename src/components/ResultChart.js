import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Bars from a write-up's real numbers:
//   { headline?, metric, lowerIsBetter?, bars: [[label, value]] }
//   or groups: [{ label?, bars: [[label, value]] }] sharing one scale.
// A two-bar group shows the change from its first bar to its second.
// Hovering the chart redraws the bars from zero, one after another.
const fmt = (n) => Number(n.toFixed(2)).toString();

const ResultChart = ({ results }) => {
    const groups = results.groups || [{ bars: results.bars }];
    const values = groups.flatMap((g) => g.bars.map(([, v]) => v));
    const max = Math.max(...values);
    const pick = results.lowerIsBetter ? Math.min : Math.max;
    let n = 0;
    return (
        <Box
            sx={{
                height: '100%',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 1,
                bgcolor: (t) => (t.palette.mode === 'dark' ? '#0d1240' : '#eef0fb'),
                '@keyframes rcGrow': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
                '@keyframes rcFade': { from: { opacity: 0 }, to: { opacity: 1 } },
                '@media (prefers-reduced-motion: no-preference)': {
                    '&:hover [data-testid="bar"]': { animation: 'rcGrow .7s cubic-bezier(.2,.8,.2,1) both', animationDelay: 'var(--d)' },
                    '&:hover .rc-num': { animation: 'rcFade .3s ease both', animationDelay: 'calc(var(--d) + .5s)' },
                },
            }}
        >
            {results.headline && (
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>{results.headline}</Typography>
            )}
            {groups.map((g, gi) => {
                const best = pick(...g.bars.map(([, v]) => v));
                const delta = g.bars.length === 2 ? g.bars[1][1] - g.bars[0][1] : null;
                return (
                    <Box key={g.label || gi}>
                        {g.label && (
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, letterSpacing: '.04em', mb: 0.25 }}>
                                {g.label}
                            </Typography>
                        )}
                        {g.bars.map(([label, value], bi) => {
                            const pct = Math.round((value / max) * 100);
                            const isBest = value === best;
                            const d = { '--d': `${(n++) * 0.12}s` };
                            return (
                                <Box key={label} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '92px 1fr' }, alignItems: 'center', columnGap: 1, mb: { xs: 0.75, sm: 0.25 } }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>{label}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                        <Box
                                            data-testid="bar"
                                            data-pct={pct}
                                            data-best={String(isBest)}
                                            style={d}
                                            sx={{
                                                height: 12,
                                                // Scale inside the room left after the number, so bars stay proportional on narrow cards.
                                                width: `calc((100% - 96px) * ${pct / 100})`,
                                                flexShrink: 0,
                                                borderRadius: 1,
                                                transformOrigin: 'left',
                                                bgcolor: (t) => alpha(t.palette.primary.main, isBest ? 0.9 : 0.45),
                                            }}
                                        />
                                        <Typography className="rc-num" style={d} variant="caption" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                                            {value}
                                            {bi === 1 && delta !== null && (
                                                <Box component="span" sx={{ ml: 0.75, color: isBest ? 'success.main' : 'error.main' }}>
                                                    {delta > 0 ? '+' : '−'}{fmt(Math.abs(delta))}
                                                </Box>
                                            )}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                );
            })}
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {results.metric}
            </Typography>
        </Box>
    );
};

export default ResultChart;
