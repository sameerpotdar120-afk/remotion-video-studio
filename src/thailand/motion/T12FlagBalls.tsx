import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { FlagBall, FlagId } from './Flags';
import { clamp, wobble } from './theme';

// t12_flag_balls (lines 4–5, 17): flag-ball pins that pop, slide and split, as the reference does on the map. Each ball has
// keys [frame, x, y, scale]; a ball whose first scale is 0 pops in with an overshoot, every move eases in-out and lands with
// a small squash, and a pulse ring marks each arrival. Default: France slides in from the right edge onto Vietnam, then a
// second ball splits off it toward Cambodia. Transparent, 1080x1920, 60 fps, 180 frames.

type Key = [number, number, number, number];
type Ball = { id: FlagId; keys: Key[] };
const DEF: Ball[] = [
  { id: 'france', keys: [[0, 1180, 760, 1], [34, 800, 760, 1]] },
  { id: 'france', keys: [[70, 800, 760, 0.6], [104, 600, 1000, 1]] },
];

const along = (keys: Key[], f: number) => {
  if (f <= keys[0][0]) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const [t0, x0, y0, s0] = keys[i - 1], [t1, x1, y1, s1] = keys[i];
    if (f <= t1) {
      const e = interpolate(f, [t0, t1], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
      return [f, x0 + (x1 - x0) * e, y0 + (y1 - y0) * e, s0 + (s1 - s0) * e] as Key;
    }
  }
  return keys[keys.length - 1];
};

export const T12FlagBalls: React.FC<{ balls?: Ball[]; r?: number }> = ({ balls = DEF, r = 62 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {balls.map((b, i) => {
          if (f < b.keys[0][0]) return null;
          const [, x, y, s0] = along(b.keys, f);
          const popIn = b.keys[0][3] === 0 ? interpolate(f, [b.keys[0][0], b.keys[0][0] + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) }) : 1;
          const last = b.keys[b.keys.length - 1][0];
          const sq = 1 - wobble(f, last, 3, 7) * 0.15;
          const ring = f > last ? (f - last) / 30 : -1;
          const s = b.keys[0][3] === 0 ? popIn * (b.keys[1]?.[3] ?? 1) : s0;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              {ring >= 0 && ring <= 1 && <circle r={r * (1 + ring * 1.4)} fill="none" stroke="#fff" strokeWidth={8 * (1 - ring)} opacity={1 - ring} />}
              <g transform={`translate(0 ${r}) scale(${(s / Math.sqrt(sq))} ${s * sq}) translate(0 ${-r})`}><FlagBall id={b.id} r={r} uid={`fb${i}`} /></g>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
