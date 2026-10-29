import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { GEO, UI, NUM, useFonts } from './font';
import { clamp, graphemes } from './theme';

// c13_leader (the plan map's labels, "Capitol Complex", "Sectors", "Sector 17", "Leisure Valley"): a thin black
// leader with a dot at each end draws from the feature (`at`) to `to` (8 frames), bending once; the bold geometric
// label then types on beside the far dot. `C13Dim`: a dimension line with end ticks draws along a side (`from`→`to`)
// and its label counts up to `value` with `unit` (the reference's "800m" / "1200m"). Transparent, 1080×1920.
export const C13Leader: React.FC<{ at: [number, number]; to: [number, number]; text: string; size?: number; side?: 'left' | 'right' | 'above' | 'below'; out?: number; color?: string }> = ({ at, to, text, size = 40, side = 'right', out, color = '#141414' }) => {
  useFonts();
  const f = useCurrentFrame();
  const l = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const o = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  const ch = graphemes(text);
  const shown = Math.floor(interpolate(f, [8, 8 + ch.length * 2], [0, ch.length], clamp));
  const ex = at[0] + (to[0] - at[0]) * l, ey = at[1] + (to[1] - at[1]) * l;
  const latin = /^[\x00-\x7F]*$/.test(text);
  const pos: React.CSSProperties = side === 'right' ? { left: to[0] + 14, top: to[1], transform: 'translateY(-50%)' } : side === 'left' ? { left: to[0] - 14, top: to[1], transform: 'translate(-100%, -50%)' }
    : side === 'above' ? { left: to[0], top: to[1] - 10, transform: 'translate(-50%, -100%)' } : { left: to[0], top: to[1] + 10, transform: 'translateX(-50%)' };
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
        <path d={`M${at[0]},${at[1]} L${ex},${ey}`} stroke={color} strokeWidth={2.5} fill="none" />
        <circle cx={at[0]} cy={at[1]} r={6} fill={color} />
        {l >= 1 && <circle cx={to[0]} cy={to[1]} r={7} fill={color} />}
      </svg>
      <div style={{ position: 'absolute', ...pos, fontFamily: latin ? GEO : UI, fontWeight: 700, fontSize: size, color, whiteSpace: 'nowrap' }}>{ch.slice(0, shown).join('')}</div>
    </AbsoluteFill>
  );
};
export const C13Dim: React.FC<{ from: [number, number]; to: [number, number]; value: number; unit?: string; side?: 'left' | 'right' | 'above' | 'below'; dur?: number; size?: number }> = ({ from, to, value, unit = 'm', side = 'above', dur = 30, size = 46 }) => {
  useFonts();
  const f = useCurrentFrame();
  const l = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const v = Math.round(interpolate(f, [6, 6 + dur], [0, value], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const bump = f > 6 + dur ? 1 + 0.12 * Math.exp(-(f - 6 - dur) / 5) : 1;
  const dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy), nx = -dy / L * 14, ny = dx / L * 14;
  const ex = from[0] + dx * l, ey = from[1] + dy * l, mx = (from[0] + to[0]) / 2, my = (from[1] + to[1]) / 2;
  const pos: React.CSSProperties = side === 'above' ? { left: mx, top: my - 16, transform: `translate(-50%, -100%) scale(${bump})` } : side === 'below' ? { left: mx, top: my + 16, transform: `translateX(-50%) scale(${bump})` }
    : side === 'right' ? { left: mx + 20, top: my, transform: `translateY(-50%) scale(${bump})` } : { left: mx - 20, top: my, transform: `translate(-100%, -50%) scale(${bump})` };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
        <line x1={from[0]} y1={from[1]} x2={ex} y2={ey} stroke="#141414" strokeWidth={4} />
        <line x1={from[0] - nx} y1={from[1] - ny} x2={from[0] + nx} y2={from[1] + ny} stroke="#141414" strokeWidth={4} opacity={l} />
        {l >= 1 && <line x1={to[0] - nx} y1={to[1] - ny} x2={to[0] + nx} y2={to[1] + ny} stroke="#141414" strokeWidth={4} />}
      </svg>
      {f > 6 && <div style={{ position: 'absolute', ...pos, fontFamily: NUM, fontSize: size, color: '#141414', whiteSpace: 'nowrap', transformOrigin: '50% 50%' }}>{v}{unit}</div>}
    </AbsoluteFill>
  );
};
