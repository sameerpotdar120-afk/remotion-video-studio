import React from 'react';
import { AbsoluteFill, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp, pop } from './theme';

// m02_forest (line 2, "पूरा island पेड़ों की एक काली दीवार से ढका था"; the reference's 0:03–0:05 and 0:14–0:16): the
// creator's laurel trees (md02 / md02b) grow over the island in a wave from left to right, each springing up from its
// base (0 → 1 with an overshoot), sorted back to front so nearer trees overlap farther ones, each crown swaying on
// its own slow gust. `burn` (frame) swaps each tree for the burning one (md03) as the fire front passes it (front
// moving from `burnFrom` at `burnSpeed` px per frame), and `clear` (frame) shrinks them all away again in a wave
// ("the ash"). `pts` are tree bases in screen px. Transparent, 1080×1920, 60 fps.
export type TreePt = [number, number];
export const M02Forest: React.FC<{ pts: TreePt[]; trees: string[]; burnt?: string; size?: number; wave?: number; burn?: number; burnFrom?: [number, number]; burnSpeed?: number; clear?: number }> = ({
  pts, trees, burnt, size = 70, wave = 50, burn, burnFrom = [0, 0], burnSpeed = 9, clear,
}) => {
  const f = useCurrentFrame();
  const xs = pts.map((p) => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
  const order = pts.map((p, i) => [p, i] as const).sort((a, b) => a[0][1] - b[0][1]);
  return (
    <AbsoluteFill>
      {order.map(([[x, y], i]) => {
        const at = ((x - x0) / Math.max(1, x1 - x0)) * wave + random(`t${i}`) * 8;
        let s = pop(f, at, at + 14, 2.2);
        if (clear !== undefined) s *= 1 - interpolate(f, [clear + ((x - x0) / Math.max(1, x1 - x0)) * 30, clear + ((x - x0) / Math.max(1, x1 - x0)) * 30 + 12], [0, 1], clamp);
        if (s <= 0.01) return null;
        const k = 0.75 + random(`s${i}`) * 0.5, w = size * k;
        const lit = burn !== undefined && f > burn + Math.hypot(x - burnFrom[0], y - burnFrom[1]) / burnSpeed;
        const sway = Math.sin(f / 37 + x / 80) * 2.2 + Math.sin(f / 13 + i) * 0.6;
        const src = lit && burnt ? burnt : trees[i % trees.length];
        return (
          <Img key={i} src={src} style={{ position: 'absolute', left: x - w / 2, top: y - w, width: w, height: w, objectFit: 'contain', transformOrigin: '50% 100%',
            transform: `scale(${(random(`f${i}`) < 0.5 ? -1 : 1) * s}, ${s}) skewX(${sway}deg)`, filter: 'drop-shadow(0 6px 4px rgba(0,0,0,0.45))' }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Tree bases scattered inside a polygon (screen px), on a jittered grid `step` px apart. */
export const scatter = (poly: [number, number][], step: number, seed = 'f'): TreePt[] => {
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
  const inside = (x: number, y: number) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const out: TreePt[] = [];
  let n = 0;
  for (let y = Math.min(...ys); y <= Math.max(...ys); y += step * 0.8) {
    for (let x = Math.min(...xs); x <= Math.max(...xs); x += step) {
      const px = x + (random(`${seed}x${n}`) - 0.5) * step * 0.9, py = y + (random(`${seed}y${n}`) - 0.5) * step * 0.7;
      n++;
      if (inside(px, py)) out.push([px, py]);
    }
  }
  return out;
};

/** The stretch of a closed coastline (screen px) from its westmost to its eastmost point along the southern side, as
 *  an SVG path: the fuse's route. `lift` raises it a little onto the land. */
export const southCoast = (poly: [number, number][], lift = 8): string => {
  let w = 0, e = 0;
  poly.forEach((p, i) => { if (p[0] < poly[w][0]) w = i; if (p[0] > poly[e][0]) e = i; });
  const walk = (a: number, b: number) => { const out: [number, number][] = []; for (let i = a; ; i = (i + 1) % poly.length) { out.push(poly[i]); if (i === b) break; } return out; };
  const one = walk(w, e), two = walk(e, w).reverse();
  const meanY = (q: [number, number][]) => q.reduce((a, p) => a + p[1], 0) / q.length;
  const arc = meanY(one) > meanY(two) ? one : two;
  return 'M ' + arc.map(([x, y]) => `${x.toFixed(1)} ${(y - lift).toFixed(1)}`).join(' L ');
};
