import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { Cam, G, toS } from './MapView';
import { C, clamp } from './theme';

// s01_rail_web (line 1, the reference's 0:00–0:03): gold dots light up on India's big junctions, then gold lines shoot
// between them (each to its 3 nearest and a few long ones) with a bright head, building a dense web over ~1.5 s; at
// `out` every line shrinks to its middle and flashes out as a spark. Drawn in screen space each frame, so it rides the
// camera. Transparent.
const names = Object.keys(G.cities);
const P = names.map((n) => G.cities[n]);
const PAIRS: [number, number][] = (() => {
  const s = new Set<string>(), out: [number, number][] = [];
  P.forEach((a, i) => {
    const near = P.map((b, j) => [Math.hypot(a[0] - b[0], a[1] - b[1]), j] as const).filter(([, j]) => j !== i).sort((x, y) => x[0] - y[0]).slice(0, 3);
    near.forEach(([, j]) => { const k = i < j ? `${i}-${j}` : `${j}-${i}`; if (!s.has(k)) { s.add(k); out.push([i, j]); } });
  });
  for (let k = 0; k < 14; k++) { const i = Math.floor(random(`la${k}`) * P.length), j = Math.floor(random(`lb${k}`) * P.length); if (i !== j) out.push([i, j]); }
  return out;
})();
export const S01RailWeb: React.FC<{ c: Cam; build?: number; out?: number }> = ({ c, build = 90, out }) => {
  const f = useCurrentFrame();
  const S = P.map((p) => toS(c, p));
  const o = out !== undefined ? interpolate(f, [out, out + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <defs><filter id="rwGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter></defs>
        {PAIRS.map(([i, j], k) => {
          const t0 = 8 + random(`ps${k}`) * (build - 30), d = 14 + random(`pd${k}`) * 10;
          const u = interpolate(f, [t0, t0 + d], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          if (u <= 0) return null;
          const [ax, ay] = S[i], [bx, by] = S[j];
          const mx = (ax + bx) / 2, my = (ay + by) / 2;
          // shrink to the middle on the way out
          const sx = ax + (mx - ax) * o, sy = ay + (my - ay) * o, ex = ax + (bx - ax) * u, ey = ay + (by - ay) * u;
          const ex2 = ex + (mx - ex) * o, ey2 = ey + (my - ey) * o;
          return (
            <g key={k} opacity={1 - o * 0.6}>
              <line x1={sx} y1={sy} x2={ex2} y2={ey2} stroke={C.gold} strokeWidth={5} opacity={0.35} filter="url(#rwGlow)" />
              <line x1={sx} y1={sy} x2={ex2} y2={ey2} stroke="#FFE7A3" strokeWidth={1.8} opacity={0.85} />
              {u < 1 && <circle cx={ex} cy={ey} r={4} fill="#fff" filter="url(#rwGlow)" />}
              {o > 0 && o < 1 && <circle cx={mx} cy={my} r={6 * (1 - o) + 2} fill="#FFF3C4" opacity={1 - o} filter="url(#rwGlow)" />}
            </g>
          );
        })}
        {S.map(([x, y], i) => {
          const a = interpolate(f, [i * 0.8, i * 0.8 + 8], [0, 1], clamp) * (1 - o);
          return <g key={i} opacity={a}><circle cx={x} cy={y} r={9} fill={C.gold} opacity={0.4} filter="url(#rwGlow)" /><circle cx={x} cy={y} r={3.5} fill="#FFF6D6" /></g>;
        })}
      </svg>
    </AbsoluteFill>
  );
};
