import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { C, clamp, wobble } from './theme';

// c12_sector_plan (lines 6–13, the reference's paper planning map 0:41–1:26): Chandigarh's plan as a grid of sector
// tiles (each 800 × 1200 m, so 2:3), slightly irregular, paper-cut, filled with the creator's woven jute (cg19) tinted
// burnt orange, separated by white roads, inside `box` = [x, y, w, h] (screen px). Driven by frame props:
//   reveal: the tiles paint in with a noisy dissolve sweeping from the top-left (the reference's 0:41.6, ~1.8 s)
//   capitol: the yellow Capitol block lands on top with the brain image (cg16) (the head)
//   s17: Sector 17 turns red with the heart image (cg17) beating (the heart)
//   hi: [frame, col, row] one sector darkens and lifts with a shadow (the 800 × 1200 m sector)
//   pale: [frame, dur] every tile fades to pale jute (for the roads)
//   edu / ind: the Education Zone (blue, left edge) and Industrial Zone (magenta, right edge) wipe in from the edge
//   valley: the green Leisure Valley ribbon draws from top to bottom; gardens: green dots pop across the sectors
// `planGeom(box)` gives the cell rectangles and road lines for the other pieces (dimension lines, roads). Transparent.
export const LAYOUT = ['01111100', '01111110', '11111111', '11111111', '01111111', '11111111', '11111110'];
export const S17 = [3, 2] as const;
export const planGeom = (box: [number, number, number, number]) => {
  const [bx, by, bw, bh] = box, cols = 8, rows = LAYOUT.length;
  const u = Math.min(bw / (cols * 2), (bh * 0.9) / (rows * 3));
  const w = u * 2, h = u * 3, gw = cols * w, gh = rows * h;
  const ox = bx + (bw - gw) / 2, oy = by + bh * 0.1 + (bh * 0.9 - gh) / 2;
  const cells: { c: number; r: number; x: number; y: number; w: number; h: number }[] = [];
  LAYOUT.forEach((row, r) => [...row].forEach((v, c) => { if (v === '1') cells.push({ c, r, x: ox + c * w, y: oy + r * h, w, h }); }));
  const capitol = { x: ox + 1.7 * w, y: oy - h * 0.42, w: w * 1.7, h: h * 0.42 };
  return { cells, w, h, ox, oy, gw, gh, capitol, cell: (c: number, r: number) => ({ x: ox + c * w, y: oy + r * h, w, h }) };
};
const tileD = (x: number, y: number, w: number, h: number, k: string, gap: number) => {
  const j = (n: string) => (random(k + n) - 0.5) * gap * 0.9;
  const g = gap / 2;
  return `M${x + g + j('a')},${y + g + j('b')} L${x + w - g + j('c')},${y + g + j('d')} L${x + w - g + j('e')},${y + h - g + j('f')} L${x + g + j('g')},${y + h - g + j('h')}Z`;
};
let uid = 0;
export const C12SectorPlan: React.FC<{
  box: [number, number, number, number]; jute?: string; brain?: string; heart?: string;
  reveal?: number; revealDur?: number; capitol?: number; s17?: number; hi?: [number, number, number]; pale?: [number, number]; edu?: number; ind?: number; valley?: number; gardens?: number;
}> = ({ box, jute, brain, heart, reveal = 0, revealDur = 100, capitol, s17, hi, pale, edu, ind, valley, gardens }) => {
  const f = useCurrentFrame();
  const [id] = React.useState(() => `c12_${uid++}`);
  const g = planGeom(box);
  const gap = g.w * 0.07;
  const rv = interpolate(f, [reveal, reveal + revealDur], [0, 1], clamp);
  const pl = pale ? interpolate(f, [pale[0], pale[0] + pale[1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;
  const tint = `rgb(${Math.round(184 + (235 - 184) * pl)},${Math.round(105 + (207 - 105) * pl)},${Math.round(44 + (168 - 44) * pl)})`;
  const cap = capitol !== undefined ? interpolate(f, [capitol, capitol + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) }) : 0;
  const hs = s17 !== undefined ? interpolate(f, [s17, s17 + 10], [0, 1], clamp) : 0;
  const beat = 1 + 0.12 * Math.max(0, Math.sin((f / 60) * Math.PI * 2 * 1.15)) ** 8 + 0.04 * wobble(f % 52, 0, 3, 8);
  const hiT = hi ? interpolate(f, [hi[0], hi[0] + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) }) : 0;
  const s17c = g.cell(S17[0], S17[1]);
  const x0 = g.ox, y0 = g.oy, x1 = g.ox + g.gw, y1 = g.oy + g.gh;
  const sweep = rv * 1.4;
  const wipe = (at: number | undefined) => (at !== undefined ? interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0);
  const eduT = wipe(edu), indT = wipe(ind);
  const vT = valley !== undefined ? interpolate(f, [valley, valley + 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;
  const vx = g.ox + 2 * g.w;
  const vd = `M${vx},${y0 - g.h * 0.3} C${vx + g.w * 0.3},${y0 + g.h * 1.5} ${vx - g.w * 0.35},${y0 + g.h * 3.5} ${vx + g.w * 0.1},${y0 + g.h * 5} S${vx - g.w * 0.1},${y1} ${vx},${y1 + g.h * 0.2}`;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <defs>
          {jute && <pattern id={`${id}p`} patternUnits="userSpaceOnUse" width={g.w * 0.9} height={g.w * 0.9}><image href={jute} width={g.w * 0.9} height={g.w * 0.9} preserveAspectRatio="xMidYMid slice" /></pattern>}
          <linearGradient id={`${id}s`} gradientUnits="userSpaceOnUse" x1={x0} y1={y0} x2={x1} y2={y1}>
            <stop offset={Math.max(0, sweep - 0.4)} stopColor="#fff" /><stop offset={Math.max(0.001, sweep)} stopColor="#000" />
          </linearGradient>
          <filter id={`${id}n`} x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={7} result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0.6 0  0 0 0 0.6 0  0 0 0 0.6 0  0 0 0 0 1" result="nl" />
            <feComposite in="SourceGraphic" in2="nl" operator="arithmetic" k1={0} k2={1} k3={1} k4={-0.55} result="sum" />
            <feComponentTransfer in="sum"><feFuncR type="discrete" tableValues="0 1" /><feFuncG type="discrete" tableValues="0 1" /><feFuncB type="discrete" tableValues="0 1" /></feComponentTransfer>
          </filter>
          <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={x0 - 50} y={y0 - 50} width={g.gw + 100} height={g.gh + 100}>
            <rect x={x0 - 50} y={y0 - 50} width={g.gw + 100} height={g.gh + 100} fill={rv >= 1 ? '#fff' : `url(#${id}s)`} filter={rv >= 1 ? undefined : `url(#${id}n)`} />
          </mask>
          <clipPath id={`${id}c`}>{g.cells.map((c) => <path key={`${c.c}${c.r}`} d={tileD(c.x, c.y, c.w, c.h, `${c.c}${c.r}`, gap)} />)}</clipPath>
        </defs>
        {rv > 0 && (
          <g mask={`url(#${id}m)`}>
            <g clipPath={`url(#${id}c)`}>
              <rect x={x0} y={y0} width={g.gw} height={g.gh} fill={tint} />
              {jute && <rect x={x0} y={y0} width={g.gw} height={g.gh} fill={`url(#${id}p)`} style={{ mixBlendMode: 'multiply' }} opacity={0.9 - 0.3 * pl} />}
              {jute && <rect x={x0} y={y0} width={g.gw} height={g.gh} fill={`url(#${id}p)`} style={{ mixBlendMode: 'soft-light' }} opacity={0.5} />}
            </g>
          </g>
        )}
        {eduT > 0 && <path d={`M${x0},${y0 + g.h * 1.05} h${g.w * 0.9} v${g.h * 2.9} h${-g.w * 0.9} q${-g.w * 0.5},${-g.h * 1.4} 0,${-g.h * 2.9}Z`} fill={C.education} opacity={0.92}
          transform={`translate(${(1 - eduT) * -g.w * 1.5} 0)`} style={{ clipPath: `inset(0 0 0 ${(1 - eduT) * 100}%)` }} />}
        {indT > 0 && <path d={`M${x1 - g.w * 0.25},${y0 + g.h * 2.6} q${g.w * 0.9},${g.h * 0.2} ${g.w * 0.8},${g.h * 1.1} q${-g.w * 0.4},${g.h * 0.5} ${g.w * 0.1},${g.h * 1.2} q${-g.w * 0.3},${g.h * 0.4} ${-g.w * 0.65},${g.h * 0.3}Z`}
          fill={C.industrial} opacity={0.92 * indT} transform={`translate(${(1 - indT) * g.w} 0)`} />}
        {vT > 0 && <path d={vd} pathLength={1} fill="none" stroke={C.leisure} strokeWidth={g.w * 0.28} strokeLinecap="round" strokeDasharray={`${vT} 2`} />}
        {gardens !== undefined && g.cells.filter((_, i) => i % 3 === 1).map((c, i) => {
          const s = interpolate(f, [gardens + i * 1.5, gardens + i * 1.5 + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(3)) });
          return s > 0 ? <circle key={i} cx={c.x + c.w * (0.3 + random(`g${i}`) * 0.4)} cy={c.y + c.h * (0.3 + random(`h${i}`) * 0.4)} r={g.w * 0.09 * s} fill="#5BBF3A" stroke="#2E6B1E" strokeWidth={1.5} /> : null;
        })}
        {hs > 0 && <path d={tileD(s17c.x, s17c.y, s17c.w, s17c.h, 's17', gap)} fill={C.s17} opacity={hs} />}
        {hiT > 0 && hi && (() => { const c = g.cell(hi[1], hi[2]); return (
          <g transform={`translate(${-6 * hiT} ${-10 * hiT})`}>
            <path d={tileD(c.x, c.y, c.w, c.h, 'hi', gap)} fill="#000" opacity={0.35 * hiT} transform="translate(10 16)" style={{ filter: 'blur(6px)' }} />
            <path d={tileD(c.x, c.y, c.w, c.h, 'hi', gap)} fill="#8A4512" opacity={hiT} />
            {jute && <path d={tileD(c.x, c.y, c.w, c.h, 'hi', gap)} fill={`url(#${id}p)`} style={{ mixBlendMode: 'multiply' }} opacity={hiT * 0.9} />}
          </g>); })()}
        {cap > 0 && <path d={`M${g.capitol.x},${g.capitol.y + g.capitol.h} l${g.capitol.w * 0.08},${-g.capitol.h} h${g.capitol.w * 0.55} l${g.capitol.w * 0.05},${g.capitol.h * 0.35} h${g.capitol.w * 0.32} v${g.capitol.h * 0.65}Z`}
          fill={C.capitol} stroke="#B88A10" strokeWidth={2} transform={`translate(0 ${(1 - cap) * -80})`} opacity={Math.min(1, cap * 2)} style={{ filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.3))' }} />}
      </svg>
      {cap > 0 && brain && <Img src={brain} style={{ position: 'absolute', left: g.capitol.x + g.capitol.w * 0.18, top: g.capitol.y - g.capitol.h * 0.25 + (1 - cap) * -80, width: g.capitol.h * 1.2, height: g.capitol.h * 1.2, objectFit: 'contain', transform: `scale(${cap})` }} />}
      {hs > 0 && heart && <Img src={heart} style={{ position: 'absolute', left: s17c.x + s17c.w * 0.15, top: s17c.y + s17c.h * 0.25, width: s17c.w * 0.7, height: s17c.w * 0.7, objectFit: 'contain', opacity: hs, transform: `scale(${beat})` }} />}
    </AbsoluteFill>
  );
};
