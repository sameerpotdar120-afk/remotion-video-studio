import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { ramp } from './theme';

// u14_dash_arrow (lines 7–9, the air masses; the reference's 40.9–42.4, 43.0–44.0 and 53–61 s): a thick dashed,
// semi-transparent arrow with a big triangle head grows along a cubic curve in `len` frames (ease-out), its dashes
// scrolling toward the head; `fork` splits the tip into two heads (the Gulf Stream reaching Britain). Many share one
// canvas: `arrows` = [{ p: [x0,y0, x1,y1, x2,y2, x3,y3], color, at, len, w, fork }] in 1080×1920. Transparent, 60 fps.
export type Arrow = { p: number[]; color: string; at?: number; len?: number; w?: number; fork?: number; opacity?: number };
const bez = (p: number[], t: number) => {
  const u = 1 - t;
  const x = u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6];
  const y = u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7];
  return [x, y];
};
const DEMO: Arrow[] = [
  { p: [560, -60, 560, 200, 560, 500, 560, 760], color: '#2E9BE0', at: 0 },
  { p: [-80, 520, 160, 600, 330, 700, 470, 820], color: '#2E9BE0', at: 2 },
  { p: [-80, 980, 160, 960, 330, 960, 440, 960], color: '#7A3FD8', at: 4 },
  { p: [1160, 980, 900, 980, 760, 980, 650, 980], color: '#E6D81E', at: 6 },
  { p: [300, 2000, 360, 1600, 440, 1350, 500, 1160], color: '#F07C8A', at: 8 },
  { p: [900, 2000, 820, 1600, 720, 1350, 620, 1160], color: '#D8262B', at: 10 },
];
const Head: React.FC<{ x: number; y: number; ang: number; s: number; color: string }> = ({ x, y, ang, s, color }) => (
  <path d={`M ${-s * 0.2} ${-s * 0.75} L ${s} 0 L ${-s * 0.2} ${s * 0.75} Z`} fill={color} stroke="rgba(255,255,255,0.55)" strokeWidth={3} strokeLinejoin="round" transform={`translate(${x} ${y}) rotate(${ang})`} />
);
export const DashArrows: React.FC<{ f: number; arrows: Arrow[] }> = ({ f, arrows }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
    {arrows.map((a, i) => {
      const k = ramp(f, a.at ?? 0, (a.at ?? 0) + (a.len ?? 14), Easing.out(Easing.cubic));
      if (k <= 0.01) return null;
      const w = a.w ?? 62;
      const n = 40;
      const tail = Math.max(0, k - 0.0);
      const pts = Array.from({ length: n + 1 }, (_, j) => bez(a.p, (j / n) * tail * 0.96));
      const d = pts.map(([x, y], j) => `${j ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
      const [hx, hy] = bez(a.p, k), [bx, by] = bez(a.p, Math.max(0, k - 0.03));
      const ang = (Math.atan2(hy - by, hx - bx) * 180) / Math.PI;
      const fork = a.fork ?? 0;
      return (
        <g key={i} opacity={a.opacity ?? 0.8}>
          <path d={d} stroke={a.color} strokeWidth={w} fill="none" strokeDasharray={`${w * 1.1} ${w * 0.65}`} strokeDashoffset={-f * 5} />
          {fork > 0 ? (
            <g>
              {[-1, 1].map((s) => {
                const fx = hx + Math.cos(((ang + s * 55) * Math.PI) / 180) * fork, fy = hy + Math.sin(((ang + s * 55) * Math.PI) / 180) * fork;
                return (
                  <g key={s}>
                    <path d={`M ${hx} ${hy} L ${fx} ${fy}`} stroke={a.color} strokeWidth={w * 0.7} strokeDasharray={`${w * 0.8} ${w * 0.5}`} strokeDashoffset={-f * 5} />
                    <Head x={fx} y={fy} ang={ang + s * 55} s={w * 1.1} color={a.color} />
                  </g>
                );
              })}
            </g>
          ) : <Head x={hx} y={hy} ang={ang} s={w * 1.9} color={a.color} />}
        </g>
      );
    })}
  </svg>
);
export const U14DashArrow: React.FC<{ arrows?: Arrow[] }> = ({ arrows = DEMO }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill><DashArrows f={f} arrows={arrows} /></AbsoluteFill>;
};
