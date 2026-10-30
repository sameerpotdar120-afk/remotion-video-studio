import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { LABEL, useFonts } from './font';
import { Cam, lineD, toS } from './MapView';
import { C, clamp } from './theme';

// s05_pins (line 3): a map pin drops on a place with a bounce and a ring, and a dark label bar types out next to it.
export const Pin: React.FC<{ c: Cam; at: number[]; text: string; t0: number; out?: number; color?: string; side?: 'l' | 'r'; size?: number }> = ({ c, at, text, t0, out, color = C.cyan, side = 'r', size = 1 }) => {
  useFonts();
  const f = useCurrentFrame();
  const [x, y] = toS(c, at);
  const d = interpolate(f, [t0, t0 + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const ring = interpolate(f, [t0 + 6, t0 + 30], [0, 1], clamp);
  const n = Math.round(interpolate(f, [t0 + 8, t0 + 8 + text.length * 1.4], [0, text.length], clamp));
  const O = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  if (f < t0) return null;
  const s = size;
  return (
    <AbsoluteFill style={{ opacity: O, pointerEvents: 'none' }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <ellipse cx={x} cy={y} rx={50 * ring * s} ry={20 * ring * s} fill="none" stroke={color} strokeWidth={3} opacity={1 - ring} />
        <g transform={`translate(${x},${y - (1 - d) * 80}) scale(${d * s})`} style={{ filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.6))' }}>
          <path d="M0,0 C-6,-14 -22,-26 -22,-44 A22,22 0 1 1 22,-44 C22,-26 6,-14 0,0Z" fill={color} stroke="#fff" strokeWidth={3} />
          <circle cy={-44} r={8} fill="#fff" />
        </g>
      </svg>
      {n > 0 && <div style={{ position: 'absolute', top: y - 64 * s, ...(side === 'r' ? { left: x + 34 * s } : { right: 1080 - x + 34 * s }), background: 'rgba(8,12,16,0.82)', borderLeft: `5px solid ${color}`,
        padding: `${6 * s}px ${14 * s}px`, fontFamily: LABEL, fontWeight: 700, fontSize: 34 * s, letterSpacing: 3, color: C.label, whiteSpace: 'nowrap' }}>{text.slice(0, n).toUpperCase()}</div>}
    </AbsoluteFill>
  );
};

// The road (NH10): a dashed yellow-white line draws up the valley, a small car drives along it.
export const Road: React.FC<{ c: Cam; pts: number[][]; t0: number; dur?: number; out?: number }> = ({ c, pts, t0, dur = 70, out }) => {
  useFonts();
  const f = useCurrentFrame();
  const u = interpolate(f, [t0, t0 + dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const O = out !== undefined ? interpolate(f, [out, out + 10], [1, 0], clamp) : 1;
  const S = pts.map((p) => toS(c, p));
  const seg = S.slice(1).map((p, i) => Math.hypot(p[0] - S[i][0], p[1] - S[i][1]));
  const tot = seg.reduce((a, b) => a + b, 0);
  let k = u * tot, i = 0;
  while (i < seg.length - 1 && k > seg[i]) { k -= seg[i]; i++; }
  const r = seg[i] ? k / seg[i] : 0;
  const cx = S[i][0] + (S[i + 1][0] - S[i][0]) * r, cy = S[i][1] + (S[i + 1][1] - S[i][1]) * r;
  const ang = (Math.atan2(S[i + 1][1] - S[i][1], S[i + 1][0] - S[i][0]) * 180) / Math.PI;
  if (f < t0) return null;
  const d = lineD(c, pts);
  return (
    <AbsoluteFill style={{ opacity: O, pointerEvents: 'none' }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <path d={d} fill="none" stroke="#000" strokeOpacity={0.55} strokeWidth={14} pathLength={1} strokeDasharray={`${u} 2`} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#FFD86B" strokeWidth={7} pathLength={1} strokeDasharray={`${u} 2`} strokeLinecap="round" strokeLinejoin="round" />
        <mask id={`rdM${t0}`} maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={5000} height={6000}><path d={d} fill="none" stroke="#fff" strokeWidth={12} pathLength={1} strokeDasharray={`${u} 2`} /></mask>
        <path d={d} fill="none" stroke="#3a2a00" strokeWidth={2} strokeDasharray="10 12" mask={`url(#rdM${t0})`} />
        <g transform={`translate(${cx},${cy}) rotate(${ang})`} style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.8))' }}>
          <rect x={-18} y={-10} width={36} height={20} rx={6} fill="#fff" />
          <rect x={2} y={-7} width={10} height={14} rx={2} fill="#2b3a46" />
          <circle cx={20} cy={-5} r={2.5} fill="#FFF3B0" /><circle cx={20} cy={5} r={2.5} fill="#FFF3B0" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
