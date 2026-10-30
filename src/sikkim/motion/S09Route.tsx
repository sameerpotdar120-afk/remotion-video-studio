import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { LABEL, TITLE, useFonts } from './font';
import { Cam, G, lineD, toS } from './MapView';
import { C, clamp } from './theme';

// s09_route (lines 7–8): the Sevoke–Rangpo line on the Teesta plate. The route draws in pink with a bright head from
// `draw[0]` to `draw[1]`; station dots pop and label as the head passes them. From `tunnels`, 14 tunnel segments light
// up one by one (thick cyan dashes over the line; together they cover ~86% of it, as the VO says), bridges as 22 small
// white ticks across the gaps from `bridges`, and from `longest` the longest tunnel (the 5.3 km one) pulses with a
// bracket. Station label sides are hand-set. Transparent.
// 14 tunnels as fractions of the route; gaps between them carry the bridges and stations. Tunnel 7 is index 6.
export const TUNNELS: [number, number][] = [[0.009, 0.058], [0.0683, 0.128], [0.1346, 0.1882], [0.1984, 0.2602], [0.2721, 0.3346], [0.344, 0.387], [0.398, 0.4392], [0.4496, 0.5196], [0.5255, 0.5753], [0.5864, 0.7044], [0.7143, 0.7632], [0.7709, 0.8463], [0.8521, 0.9092], [0.9211, 0.991]];
export const LONGEST = 9;
const ST_SIDE: Record<string, 'l' | 'r'> = { Sevoke: 'r', Riyang: 'r', 'Teesta Bazar': 'l', Melli: 'r', Rangpo: 'r' };
const R = G.route;
const cum = (() => { const c = [0]; for (let i = 1; i < R.length; i++) c.push(c[i - 1] + Math.hypot(R[i][0] - R[i - 1][0], R[i][1] - R[i - 1][1])); return c.map((v) => v / c[c.length - 1]); })();
const sub = (a: number, b: number) => {
  const out: number[][] = [];
  const at = (u: number) => { let i = 1; while (i < cum.length - 1 && cum[i] < u) i++; const r = (u - cum[i - 1]) / (cum[i] - cum[i - 1] || 1); return [R[i - 1][0] + (R[i][0] - R[i - 1][0]) * r, R[i - 1][1] + (R[i][1] - R[i - 1][1]) * r]; };
  out.push(at(a)); cum.forEach((u, i) => { if (u > a && u < b) out.push(R[i]); }); out.push(at(b));
  return out;
};
export const routeAt = (u: number) => sub(0, Math.max(0.0001, u)).slice(-1)[0];
const stU = (p: number[]) => { let best = 0, bd = Infinity; R.forEach((q, i) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = i; } }); return cum[best]; };
export const S09Route: React.FC<{ c: Cam; draw?: [number, number]; tunnels?: number; tstep?: number; bridges?: number; longest?: number; highlight?: number; out?: number; dimLine?: number }> = ({ c, draw = [0, 80], tunnels, tstep = 4, bridges, longest, highlight, out, dimLine = 0 }) => {
  useFonts();
  const f = useCurrentFrame();
  const u = interpolate(f, draw, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const O = out !== undefined ? interpolate(f, [out, out + 12], [1, 0], clamp) : 1;
  const full = lineD(c, R);
  const head = toS(c, routeAt(u));
  // 22 bridges, all in the open stretches between tunnels: one in each of the 15 gaps (both ends too), two in the 7 widest
  const G15 = [[0, TUNNELS[0][0]], ...TUNNELS.slice(0, -1).map(([, b], i) => [b, TUNNELS[i + 1][0]]), [TUNNELS[13][1], 1]];
  const wide = new Set(G15.map((g, i) => [g[1] - g[0], i]).sort((a, b) => b[0] - a[0]).slice(0, 7).map(([, i]) => i));
  const BR = G15.flatMap(([a, b], i) => (wide.has(i) ? [a + (b - a) / 3, a + (2 * (b - a)) / 3] : [(a + b) / 2]));
  return (
    <AbsoluteFill style={{ opacity: O, pointerEvents: 'none' }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <defs><filter id="rtG" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter></defs>
        <path d={full} fill="none" stroke="#000" strokeOpacity={0.6} strokeWidth={16} pathLength={1} strokeDasharray={`${u} 2`} strokeLinecap="round" />
        <path d={full} fill="none" stroke={C.pink} strokeWidth={14} pathLength={1} strokeDasharray={`${u} 2`} filter="url(#rtG)" opacity={0.7 * (1 - dimLine)} />
        <path d={full} fill="none" stroke="#FFD3F4" strokeWidth={6} pathLength={1} strokeDasharray={`${u} 2`} strokeLinecap="round" opacity={1 - dimLine * 0.5} />
        {u > 0 && u < 1 && <circle cx={head[0]} cy={head[1]} r={12} fill="#fff" filter="url(#rtG)" />}
        {tunnels !== undefined && TUNNELS.map(([a, b], i) => {
          const t = interpolate(f, [tunnels + i * tstep, tunnels + i * tstep + 8], [0, 1], clamp);
          if (t <= 0) return null;
          const d = lineD(c, sub(a, b));
          const pulse = highlight !== undefined && i === 6 ? 0.5 + 0.5 * Math.sin((f - highlight) / 4) : 0;
          const big = longest !== undefined && i === LONGEST ? interpolate(f, [longest, longest + 10], [0, 1], clamp) : 0;
          return (
            <g key={i} opacity={t}>
              <path d={d} fill="none" stroke={big || pulse ? '#fff' : C.cyan} strokeWidth={22 + 10 * big} filter="url(#rtG)" opacity={0.6 + 0.4 * Math.max(big, pulse)} />
              <path d={d} fill="none" stroke="#0B2E33" strokeWidth={14 + 6 * big} strokeLinecap="butt" />
              <path d={d} fill="none" stroke={pulse ? C.red : C.cyan} strokeWidth={8 + 4 * big} strokeDasharray="14 6" strokeLinecap="butt" />
            </g>
          );
        })}
        {bridges !== undefined && BR.map((b, i) => {
          const t = interpolate(f, [bridges + i * 1.6, bridges + i * 1.6 + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(3)) });
          if (t <= 0) return null;
          const p0 = toS(c, routeAt(Math.max(0.001, b - 0.004))), p1 = toS(c, routeAt(Math.min(1, b + 0.004)));
          const a = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math.PI;
          const [x, y] = toS(c, routeAt(b));
          return <g key={i} transform={`translate(${x},${y}) rotate(${a}) scale(${t})`}><rect x={-7} y={-16} width={14} height={32} rx={3} fill="#fff" stroke="#111" strokeWidth={2} /></g>;
        })}
        {longest !== undefined && (() => {
          const t = interpolate(f, [longest + 4, longest + 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          const [a, b] = TUNNELS[LONGEST];
          const pa = toS(c, routeAt(a)), pb = toS(c, routeAt(b));
          const off = 70, mx = Math.max(pa[0], pb[0]) + off;
          return <g opacity={t}>
            <path d={`M${pa[0] + 20},${pa[1]} H${mx} V${pb[1]} H${pb[0] + 20}`} fill="none" stroke="#fff" strokeWidth={4} pathLength={1} strokeDasharray={`${t} 2`} />
            <text x={mx + 16} y={(pa[1] + pb[1]) / 2 + 20} fontFamily={TITLE} fontSize={64} fill="#fff" style={{ filter: 'drop-shadow(0 3px 4px #000)' }}>5.3 KM</text>
          </g>;
        })()}
        {Object.entries(G.stations).map(([n, p], i) => {
          const su = stU(p);
          const t0 = draw[0] + (draw[1] - draw[0]) * su;
          const t = interpolate(f, [t0, t0 + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.4)) });
          if (t <= 0) return null;
          const [x, y] = toS(c, p), side = ST_SIDE[n];
          return (
            <g key={n} transform={`translate(${x},${y})`}>
              <circle r={16 * t} fill="#fff" stroke={C.pink} strokeWidth={6} />
              <g opacity={Math.min(1, t * 1.4)}>
                <rect x={side === 'r' ? 28 : -28 - n.length * 21 - 28} y={-24} width={n.length * 21 + 28} height={48} fill="rgba(8,12,16,0.85)" />
                <text x={side === 'r' ? 42 : -42} y={12} textAnchor={side === 'r' ? 'start' : 'end'} fontFamily={LABEL} fontWeight={700} fontSize={32} letterSpacing={2} fill="#fff">{n.toUpperCase()}</text>
              </g>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
