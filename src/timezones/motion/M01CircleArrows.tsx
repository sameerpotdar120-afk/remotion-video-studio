import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m01_circle_arrows: a hand-drawn yellow circle scribbles on (a little more than one loop, slightly uneven), then six thick
// yellow arrows punch in from outside, one after another, and keep pulsing toward the centre. 800x800, 60 fps, 180 frames.
// Transparent. Matches the reference's "look so weird" call-out.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const Y = '#FFE11A';

// an uneven loop: radius wobbles a little, and the stroke runs about 1.15 turns so the ends overlap like a real pen
const loop = () => {
  const pts: string[] = [];
  for (let i = 0; i <= 140; i++) {
    const a = -Math.PI / 2 - 0.3 + (i / 140) * Math.PI * 2 * 1.15;
    const r = 250 + Math.sin(a * 3 + 0.6) * 9 + Math.sin(a * 5) * 5 + (i / 140) * 14;
    pts.push(`${i ? 'L' : 'M'} ${(400 + Math.cos(a) * r * 1.02).toFixed(1)} ${(400 + Math.sin(a) * r * 0.94).toFixed(1)}`);
  }
  return pts.join(' ');
};
const LOOP = loop();

const Arrow: React.FC<{ angle: number; start: number; f: number; i: number }> = ({ angle, start, f, i }) => {
  const k = interpolate(f, [start, start + 9], [0, 1], { ...c, easing: Easing.out(Easing.back(2.2)) });
  const pulse = f > start + 9 ? Math.sin((f - start - 9) / 60 * Math.PI * 2 * 1.6 + i) * 10 : 0;
  const dist = 395 - k * 60 + pulse;
  const wob = (random(`w${i}`) - 0.5) * 8;
  return (
    <g transform={`translate(400 400) rotate(${angle + wob}) translate(${dist} 0)`} opacity={k}>
      {/* the arrow points toward the centre (−x) */}
      <path d="M -62 0 L -14 -40 L -14 -16 L 52 -14 L 56 14 L -14 16 L -14 40 Z" fill={Y} stroke="#3a2a00" strokeWidth={5} strokeLinejoin="round"
        transform={`scale(${0.6 + 0.4 * k})`} style={{ filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.45))' }} />
    </g>
  );
};

export const M01CircleArrows: React.FC = () => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [0, 22], [0, 1], { ...c, easing: Easing.inOut(Easing.cubic) });
  const breathe = 1 + Math.sin(f / 60 * Math.PI * 2 * 0.8) * 0.015;
  const angles = [-140, -40, 20, 160, 210, 330];
  return (
    <AbsoluteFill>
      <svg width={800} height={800} viewBox="0 0 800 800">
        <g transform={`translate(400 400) scale(${breathe}) translate(-400 -400)`} opacity={draw > 0.01 ? 1 : 0}>
          <path d={LOOP} fill="none" stroke="#3a2a00" strokeOpacity={0.35} strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`}
            transform="translate(0 6)" />
          <path d={LOOP} fill="none" stroke={Y} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`}
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,225,26,0.6))' }} />
        </g>
        {angles.map((a, i) => <Arrow key={i} angle={a} start={18 + i * 3} f={f} i={i} />)}
      </svg>
    </AbsoluteFill>
  );
};
