import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp, pop } from './theme';

// t17_send (line 21, "ये video उस दोस्त को भेजो"): a paper-plane send icon pops in with a burst of rays, wiggles, then
// takes off up and to the right in a loop, leaving a dashed trail. Transparent, 700x700, 60 fps, 150 frames.
const PLANE = 'M -120 10 L 120 -90 L 40 110 L 0 40 Z';

export const T17Send: React.FC = () => {
  const f = useCurrentFrame();
  const k = pop(f, 0, 14, 2.4);
  const fly = interpolate(f, [70, 130], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  // a loop-de-loop path out of frame
  const px = 350 + fly * 520 - Math.sin(fly * Math.PI * 2) * 120 * (1 - fly);
  const py = 360 - fly * 520 + (1 - Math.cos(fly * Math.PI * 2)) * 60 * (1 - fly);
  const wig = f < 70 ? Math.sin(f / 5) * 6 : -20 * fly;
  const trail: string[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = (i / 20) * fly;
    trail.push(`${i ? 'L' : 'M'} ${350 + t * 520 - Math.sin(t * Math.PI * 2) * 120 * (1 - t)} ${360 - t * 520 + (1 - Math.cos(t * Math.PI * 2)) * 60 * (1 - t)}`);
  }
  const rays = interpolate(f, [0, 22], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg width={700} height={700}>
        {rays < 1 && Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2, r0 = 90 + rays * 120, r1 = r0 + 60 * (1 - rays);
          return <path key={i} d={`M ${350 + Math.cos(a) * r0} ${360 + Math.sin(a) * r0} L ${350 + Math.cos(a) * r1} ${360 + Math.sin(a) * r1}`} stroke={C.siam} strokeWidth={14} strokeLinecap="round" />;
        })}
        {fly > 0 && <path d={trail.join(' ')} stroke="#fff" strokeWidth={10} strokeDasharray="22 18" fill="none" strokeLinecap="round" opacity={0.9} />}
        <g transform={`translate(${px} ${py}) rotate(${wig}) scale(${k * (1 - fly * 0.4)})`}>
          <path d={PLANE} fill="#000" opacity={0.25} transform="translate(8 12)" />
          <path d={PLANE} fill="#fff" stroke={C.ink} strokeWidth={12} strokeLinejoin="round" />
          <path d="M 120 -90 L 0 40 L 40 110 Z" fill="#DDE6F0" stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
