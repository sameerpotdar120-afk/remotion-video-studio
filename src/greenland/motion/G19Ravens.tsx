import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { ramp } from './theme';

// g19_ravens (line 4, "बिना map के 3 कौवों को लेकर…, कौवा जिधर उड़ता और वापस नहीं आता"): the creator's raven (gl04 /
// gl04b) flaps by swapping its two wing poses every 5 frames (each bird on its own phase), bobbing with each beat and
// banking into turns. Each bird flies its own path (`paths`, screen px, from → to with a bend) over `dur` frames,
// starting `stagger` frames apart; it faces the way it flies. `size` px.
export type Flight = { from: [number, number]; to: [number, number]; bend?: number; at?: number; dur?: number };
export const G19Ravens: React.FC<{ up: string; down: string; flights: Flight[]; size?: number }> = ({ up, down, flights, size = 150 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {flights.map((fl, i) => {
        const at = fl.at ?? i * 8, dur = fl.dur ?? 120;
        const p = ramp(f, at, at + dur, (x) => x);
        if (f < at || p >= 1) return null;
        const [x0, y0] = fl.from, [x1, y1] = fl.to;
        const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, bend = fl.bend ?? 0.2;
        const cx = (x0 + x1) / 2 - (dy / L) * L * bend, cy = (y0 + y1) / 2 + (dx / L) * L * bend;
        const q = (t: number) => [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1];
        const [x, y] = q(p), [ux, uy] = q(Math.min(1, p + 0.01));
        const beat = Math.floor((f + i * 3) / 5) % 2;
        const bob = beat ? -6 : 6;
        const ang = (Math.atan2(uy - y, ux - x) * 180) / Math.PI;
        const left = ux < x;
        const a = Math.min(1, p * 8, (1 - p) * 8);
        return (
          <Img key={i} src={beat ? up : down} style={{ position: 'absolute', left: x - size / 2, top: y - size / 2 + bob, width: size, height: size, objectFit: 'contain', opacity: a,
            transform: `scaleX(${left ? -1 : 1}) rotate(${(left ? -1 : 1) * (left ? ang - 180 : ang) * 0.35}deg)`, filter: 'drop-shadow(0 12px 10px rgba(0,0,0,0.35))' }} />
        );
      })}
    </AbsoluteFill>
  );
};
