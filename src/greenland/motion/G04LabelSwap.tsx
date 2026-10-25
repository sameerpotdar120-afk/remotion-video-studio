import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp, mblur, wobble } from './theme';

// g04_label_swap (line 3, "उल्टा क्यों?"; the reference's 0:06–0:08): the two names (g02) lift off their islands and
// swap places along opposite arcs in `dur` frames, eased, with motion blur and a fading speed trail, then land with a
// little bounce. `a` starts at `pa` and ends at `pb`, `b` the other way. Transparent, 1080×1920, 60 fps; each label
// sits in a 1000×360 box centred on its point.
export const G04LabelSwap: React.FC<{ a: React.ReactNode; b: React.ReactNode; pa: [number, number]; pb: [number, number]; at?: number; dur?: number; lift?: number }> = ({
  a, b, pa, pb, at = 10, dur = 26, lift = 260,
}) => {
  const f = useCurrentFrame();
  const pos = (fr: number, from: [number, number], to: [number, number], side: number) => {
    const t = interpolate(fr, [at, at + dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    const arc = Math.sin(t * Math.PI) * lift * side;
    const dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy) || 1;
    return [from[0] + dx * t + (-dy / L) * arc, from[1] + dy * t + (dx / L) * arc, t] as const;
  };
  const layer = (node: React.ReactNode, from: [number, number], to: [number, number], side: number) => {
    const [x, y, t] = pos(f, from, to, side);
    const [x1, y1] = pos(f - 1, from, to, side);
    const v = Math.hypot(x - x1, y - y1);
    const land = wobble(f, at + dur, 3, 7);
    const s = 1 + 0.12 * Math.sin(t * Math.PI) - 0.06 * land;
    return (
      <>
        {[3, 2, 1].map((k) => {
          const [tx, ty] = pos(f - k * 2, from, to, side);
          return v > 2 ? <div key={k} style={{ position: 'absolute', left: tx - 500, top: ty - 180, width: 1000, height: 360, opacity: 0.12 * (4 - k), filter: 'blur(6px)' }}>{node}</div> : null;
        })}
        <div style={{ position: 'absolute', left: x - 500, top: y - 180, width: 1000, height: 360, transform: `scale(${s}) rotate(${(x - x1) * 0.25}deg)`, filter: mblur(v, 0.12, 8) }}>{node}</div>
      </>
    );
  };
  return <AbsoluteFill>{layer(a, pa, pb, 1)}{layer(b, pb, pa, 1)}</AbsoluteFill>;
};
