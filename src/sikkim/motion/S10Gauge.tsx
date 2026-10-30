import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { LABEL, TITLE, useFonts } from './font';
import { C, clamp, idle } from './theme';

// s10_gauge (lines 7 and 12, the reference's teal ring gauge): a thick ring sweeps round to `value`% while the number
// counts up, with a small caps caption under it. `steps` lets it count again to a new value later ([frame, value, label?]).
// Also exports Counter: a big number that ticks up (Anton) with a unit and caption, popping in at t0.
export const S10Gauge: React.FC<{ x: number; y: number; r?: number; steps: [number, number, string?][]; out?: number; color?: string; suffix?: string }> = ({ x, y, r = 150, steps, out, color = C.cyan, suffix = '%' }) => {
  useFonts();
  const f = useCurrentFrame();
  const t0 = steps[0][0];
  const In = interpolate(f, [t0 - 8, t0 + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
  const O = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  let v = 0, lab = steps[0][2] ?? '';
  steps.forEach(([t, val, l], i) => {
    const prev = i ? steps[i - 1][1] : 0;
    if (f >= t) { v = interpolate(f, [t, t + 30], [prev, val], { ...clamp, easing: Easing.out(Easing.cubic) }); if (l) lab = l; }
  });
  const [ix, iy] = idle(f, 4, 0.6);
  if (f < t0 - 8) return null;
  const circ = 2 * Math.PI * r;
  return (
    <AbsoluteFill style={{ opacity: O, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: x - r - 30 + ix, top: y - r - 30 + iy, width: 2 * r + 60, transform: `scale(${In})` }}>
        <svg width={2 * r + 60} height={2 * r + 60}>
          <circle cx={r + 30} cy={r + 30} r={r + 22} fill="rgba(6,10,14,0.8)" />
          <circle cx={r + 30} cy={r + 30} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={30} />
          <circle cx={r + 30} cy={r + 30} r={r} fill="none" stroke={color} strokeWidth={30} strokeDasharray={`${(circ * v) / 100} ${circ}`} transform={`rotate(-90 ${r + 30} ${r + 30})`} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
          <text x={r + 30} y={r + 30 + r * 0.24} textAnchor="middle" fontFamily={TITLE} fontSize={r * 0.72} fill="#fff">{Math.round(v)}{suffix}</text>
        </svg>
        {lab && <div style={{ textAlign: 'center', marginTop: 6, fontFamily: LABEL, fontWeight: 800, fontSize: 32, letterSpacing: 4, color: C.label, textShadow: '0 2px 4px #000' }}>{lab}</div>}
      </div>
    </AbsoluteFill>
  );
};
export const Counter: React.FC<{ x: number; y: number; to: number; t0: number; dur?: number; unit?: string; caption?: string; size?: number; out?: number; decimals?: number; plus?: boolean; color?: string }> = ({ x, y, to, t0, dur = 30, unit = '', caption, size = 150, out, decimals = 0, plus, color = '#fff' }) => {
  useFonts();
  const f = useCurrentFrame();
  const In = interpolate(f, [t0, t0 + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const O = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  const v = interpolate(f, [t0, t0 + dur], [0, to], { ...clamp, easing: Easing.out(Easing.cubic) });
  const done = f >= t0 + dur;
  const kick = done ? interpolate(f, [t0 + dur, t0 + dur + 8], [1.12, 1], clamp) : 1;
  if (f < t0) return null;
  const txt = v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <AbsoluteFill style={{ opacity: O, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${In * kick})`, textAlign: 'center', whiteSpace: 'nowrap' }}>
        <div style={{ fontFamily: TITLE, fontSize: size, lineHeight: 1, color, textShadow: '0 6px 0 rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.6)' }}>{txt}{plus && done ? '+' : ''}<span style={{ fontSize: size * 0.42, marginLeft: 10 }}>{unit}</span></div>
        {caption && <div style={{ display: 'inline-block', marginTop: 8, background: 'rgba(8,12,16,0.85)', padding: '6px 18px', fontFamily: LABEL, fontWeight: 800, fontSize: size * 0.2, letterSpacing: 4, color: C.label }}>{caption}</div>}
      </div>
    </AbsoluteFill>
  );
};
