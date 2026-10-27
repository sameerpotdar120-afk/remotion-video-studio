import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// p13_boat (line 7, "जहाज़ों से"; the reference's purple cartoon trawlers at 0:30–0:36): the creator's fishing boat
// (gp07) pops in at `from` and sails to `to` (screen px) over `dur` frames (ease-in-out), facing its way, bobbing and
// rolling on the swell, leaving a V wake that spreads and fades behind it. `w` its width. Transparent.
export const P13Boat: React.FC<{ src: string; from: [number, number]; to: [number, number]; dur?: number; w?: number; ratio?: number; seed?: number }> = ({ src, from, to, dur = 240, w = 190, ratio = 0.56, seed = 1 }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const s = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const x = from[0] + (to[0] - from[0]) * t, y = from[1] + (to[1] - from[1]) * t;
  const dir = to[0] >= from[0] ? 1 : -1;
  const bob = Math.sin(f / 13 + seed) * 4, roll = Math.sin(f / 19 + seed * 2) * 3.5;
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const h = w * ratio;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        {[0, 1, 2, 3].map((k) => {
          const p = ((f / 40 + k / 4) % 1);
          const bx = x - Math.cos(a) * (w * 0.35 + p * w * 1.2), by = y + h * 0.25 - Math.sin(a) * (w * 0.35 + p * w * 1.2);
          const spread = 10 + p * 50;
          return <path key={k} d={`M${bx - Math.sin(a) * spread},${by + Math.cos(a) * spread} L${x - Math.cos(a) * w * 0.35},${y + h * 0.25 - Math.sin(a) * w * 0.35} L${bx + Math.sin(a) * spread},${by - Math.cos(a) * spread}`}
            fill="none" stroke="#E8F7FF" strokeWidth={3} strokeLinecap="round" opacity={(1 - p) * 0.55 * s} />;
        })}
      </svg>
      <Img src={src} style={{ position: 'absolute', left: x - w / 2, top: y - h / 2 + bob, width: w, height: h, objectFit: 'contain',
        transform: `scale(${s * dir}, ${s}) rotate(${roll}deg)`, filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.45))' }} />
    </AbsoluteFill>
  );
};
