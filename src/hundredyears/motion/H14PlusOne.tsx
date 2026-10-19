import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { NUM, useAnton } from './font';
import { clamp, pop } from './theme';

// h14_plus_one (line 9, each victory; the reference's 62.5–63.5 and 65.8–68.3 s): a glowing green "+1" with a laurel
// wreath pops in, floats up about 120 px and fades. Transparent, 500×400, 60 fps, 90 frames.
export const H14PlusOne: React.FC = () => {
  useAnton();
  const f = useCurrentFrame();
  const k = pop(f, 0, 12, 2.6);
  const up = interpolate(f, [0, 90], [0, -120], clamp);
  const o = interpolate(f, [60, 90], [1, 0], clamp);
  const leaf = (s: number) => Array.from({ length: 7 }).map((_, i) => {
    const a = (-60 + i * 22) * (Math.PI / 180);
    return <ellipse key={`${s}${i}`} cx={330 + s * Math.cos(a) * 70} cy={200 + Math.sin(a) * 70} rx={16} ry={8} fill="#3BD45A" stroke="#0E5A20" strokeWidth={3} transform={`rotate(${s * (i * 22 - 60) + 90} ${330 + s * Math.cos(a) * 70} ${200 + Math.sin(a) * 70})`} />;
  });
  return (
    <AbsoluteFill style={{ opacity: o, transform: `translateY(${up}px) scale(${k})` }}>
      <svg width={500} height={400} style={{ position: 'absolute', filter: 'drop-shadow(0 0 18px #4BE36A)' }}>{leaf(1)}{leaf(-1)}</svg>
      <div style={{ position: 'absolute', left: 60, top: 120, fontFamily: NUM, fontSize: 150, color: '#E8FFE8', WebkitTextStroke: '6px #0E5A20', paintOrder: 'stroke fill',
        textShadow: '0 0 24px #4BE36A, 0 0 50px #4BE36A' }}>+1</div>
    </AbsoluteFill>
  );
};
