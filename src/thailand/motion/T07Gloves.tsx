import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { FlagBall } from './Flags';
import { C, clamp, wobble } from './theme';

// t07_gloves (line 15, "Siam बन गया दोनों के बीच की गद्दी"): two white cartoon gloves shoot out of the British and French
// flag-balls on long black arms and meet over Siam in a handshake: three shake bounces, then a hold with a soft pulse.
// Transparent; `a`, `b` (the flag-balls) and `meet` are frame pixels. 1080x1920, 60 fps, 180 frames.

type Pt = [number, number];

// a side-view glove pointing +x: cuff, palm, four fingers wrapped, thumb on top
const Glove: React.FC = () => (
  <g stroke={C.ink} strokeWidth={7} strokeLinejoin="round">
    <rect x={-92} y={-40} width={40} height={80} rx={14} fill="#EDEDED" />
    <path d="M -56 -46 Q 10 -66 40 -40 Q 70 -30 70 0 Q 70 34 40 44 Q 0 56 -56 46 Z" fill="#fff" />
    <path d="M 4 -30 Q 40 -40 46 -16 M 6 -6 Q 46 -12 50 10 M 6 18 Q 40 16 42 36" fill="none" strokeWidth={5} />
    <path d="M -30 -46 Q -10 -86 26 -74 Q 44 -64 22 -50 Q 4 -46 -6 -40" fill="#fff" />
    <path d="M -86 -22 H -58 M -86 0 H -58 M -86 22 H -58" strokeWidth={4} />
  </g>
);

export const T07Gloves: React.FC<{ a?: Pt; b?: Pt; meet?: Pt }> = ({ a = [210, 820], b = [870, 820], meet = [540, 980] }) => {
  const f = useCurrentFrame();
  const t1 = interpolate(f, [12, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.5)) });
  const t2 = interpolate(f, [18, 46], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.5)) });
  const shake = f > 50 && f < 110 ? Math.sin(((f - 50) / 20) * Math.PI * 2) * 34 : 0;
  const settle = wobble(f, 110, 2.5, 6) * 8;
  const g = (p: Pt, t: number, side: 1 | -1) => {
    const x = p[0] + (meet[0] - side * 52 - p[0]) * t, y = p[1] + (meet[1] - p[1]) * t + shake + settle;
    const sag = 80 * (1 - t) + 40;
    const arm = `M ${p[0]} ${p[1]} Q ${(p[0] + x) / 2} ${Math.max(p[1], y) + sag} ${x - side * 70} ${y}`;
    const ang = (Math.atan2(y - p[1], x - p[0]) * 180) / Math.PI * (1 - t);
    return (
      <g>
        <path d={arm} stroke={C.ink} strokeWidth={18} fill="none" strokeLinecap="round" />
        <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${side * 1.1} 1.1)`}><Glove /></g>
      </g>
    );
  };
  const glow = f > 110 ? 0.5 + Math.sin((f - 110) / 10) * 0.25 : 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs><filter id="gg" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={24} /></filter></defs>
        {glow > 0 && <circle cx={meet[0]} cy={meet[1] + settle} r={150} fill="#FFF6C8" opacity={glow} filter="url(#gg)" />}
        {f >= 12 && g(a, t1, 1)}
        {f >= 18 && g(b, t2, -1)}
        <g transform={`translate(${a[0]} ${a[1]})`}><FlagBall id="britain" r={62} uid="ga" /></g>
        <g transform={`translate(${b[0]} ${b[1]})`}><FlagBall id="france" r={62} uid="gb" /></g>
      </svg>
    </AbsoluteFill>
  );
};
