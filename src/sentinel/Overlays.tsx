import React from 'react';
import { Img, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import { Cam, COAST, GEO, ISL, MS, P, PLANE, merc, project, pxPerM } from './cam';

export const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
export const RED = '#FF2B3D';
const img = (f: string) => staticFile(`sentinel/img/${f}`);

// ---------------------------------------------------------------- helpers
const ringD = (c: Cam, r: P[]) => r.map((p, i) => (i ? 'L' : 'M') + project(c, p[0], p[1]).map((v) => v.toFixed(1)).join(',')).join('') + 'Z';
const ringsD = (c: Cam, rs: P[][]) => rs.map((r) => ringD(c, r)).join('');
const add = (a: P, dx: number, dy: number): P => [a[0] + dx * MS, a[1] + dy * MS];

const Svg: React.FC<{ children: React.ReactNode; opacity?: number; filter?: string; blend?: React.CSSProperties['mixBlendMode'] }> = ({ children, opacity = 1, filter, blend }) =>
  opacity <= 0.001 ? null : (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, filter, mixBlendMode: blend }}>
      {children}
    </svg>
  );

/** HTML pinned to a Mercator point, kept upright against the camera roll unless `flat`. */
export const Pin: React.FC<{ c: Cam; at: P; children: React.ReactNode; anchor?: 'center' | 'bottom'; flat?: boolean; rot?: number }> = ({
  c, at, children, anchor = 'center', flat = false, rot = 0,
}) => {
  const [x, y] = project(c, at[0], at[1]);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `rotate(${flat ? rot : -c.rot}deg)` }}>
      <div style={{ position: 'absolute', left: 0, top: 0, transform: anchor === 'center' ? 'translate(-50%,-50%)' : 'translate(-50%,-100%)' }}>
        {children}
      </div>
    </div>
  );
};

const glow = (color: string, r: number, n = 2) => Array.from({ length: n }, (_, i) => `drop-shadow(0 0 ${r * (i + 1)}px ${color})`).join(' ');

/** Slanted label boxes like the reference: white text on black, key word on red. */
export const Tag: React.FC<{ parts: [string, 'k' | 'r' | 'w'][]; size: number; s?: number; skew?: number }> = ({ parts, size, s = 1, skew = -6 }) => (
  <div style={{ display: 'flex', gap: size * 0.18, transform: `scale(${s}) rotate(${skew}deg)`, whiteSpace: 'nowrap' }}>
    {parts.map(([txt, kind], i) => (
      <div key={i} style={{
        fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.2, padding: `${size * 0.04}px ${size * 0.22}px ${size * 0.1}px`,
        color: kind === 'w' ? '#111' : '#fff', background: kind === 'r' ? RED : kind === 'w' ? '#fff' : '#0b0b0d',
        boxShadow: '0 6px 18px rgba(0,0,0,0.55)',
      }}>{txt}</div>
    ))}
  </div>
);

/** Plain white map label with a heavy shadow (the reference's place-name style). */
export const MapLabel: React.FC<{ text: string; size: number; s?: number; color?: string }> = ({ text, size, s = 1, color = '#fff' }) => (
  <div style={{
    fontFamily: FONT, fontWeight: 800, fontSize: size, color, whiteSpace: 'nowrap', transform: `scale(${s})`,
    textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.6)',
  }}>{text}</div>
);

export const Person: React.FC<{ h: number; color: string }> = ({ h, color }) => (
  <svg width={h * 0.42} height={h} viewBox="0 0 42 100" style={{ display: 'block', overflow: 'visible' }}>
    <circle cx="21" cy="11" r="10" fill={color} />
    <path d="M8 26 Q21 21 34 26 Q39 28 39 34 L39 60 Q39 64 35 64 L33 64 L33 95 Q33 99 29 99 L24 99 L21 70 L18 99 L13 99 Q9 99 9 95 L9 64 L7 64 Q3 64 3 60 L3 34 Q3 28 8 26 Z" fill={color} />
  </svg>
);

// inside-the-island test for placing figures
const inside = (pt: P, poly: P[]) => {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
};
// nine figures spread over the interior (fixed, so every render is identical)
const PEOPLE: P[] = (() => {
  const cand: [number, number][] = [[-1800, 2600], [600, 2900], [2300, 1700], [-2600, 900], [-300, 1100], [1700, -100], [-1500, -900], [900, -1500], [-200, -2600], [2600, -1900], [-2900, -2200]];
  return cand.map(([dx, dy]) => add(ISL, dx, dy)).filter((p) => inside(p, GEO.sentinel)).slice(0, 9);
})();
const OUTSIDER_FROM = add(ISL, 300, -5200);
const OUTSIDER_TO = add(ISL, 200, -3500);
// order in which they catch the disease: nearest to the outsider first
const INFECT = PEOPLE.map((p, i) => ({ i, d: Math.hypot(p[0] - OUTSIDER_TO[0], p[1] - OUTSIDER_TO[1]) })).sort((a, b) => a.d - b.d).map((x) => x.i);

const ISL_R = 4700; // rough island radius in true metres, for the zone and the isolation halo

// the reference keeps every other part of the map dark while we are on the island
export const isolation = (t: number) =>
  Math.max(window4(t, 4.3, 4.8, 14.6, 14.75), window4(t, 28.9, 29.4, 31.2, 31.7), window4(t, 34.7, 35.1, 37.7, 38.1), window4(t, 40.4, 41.0, 41.6, 41.7), window4(t, 54.3, 54.9, 68.9, 69));

// ---------------------------------------------------------------- the layer
export const Overlays: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const k = pxPerM(c);
  const items: React.ReactNode[] = [];
  const [cx, cy] = project(c, ISL[0], ISL[1]);
  const island = ringD(c, GEO.sentinel);

  // ---- isolation halo: dark everywhere except a soft disc around the island
  const iso = isolation(t);
  if (iso > 0) {
    const r0 = ISL_R * 1.35 * MS * k;
    const r1 = ISL_R * 2.3 * MS * k;
    items.push(
      <Svg key="iso" opacity={iso}>
        <defs>
          <radialGradient id="isoG" gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={r1}>
            <stop offset={r0 / r1} stopColor="#06121f" stopOpacity={0} />
            <stop offset={1} stopColor="#06121f" stopOpacity={0.82} />
          </radialGradient>
        </defs>
        <rect x={-4000} y={-4000} width={PLANE.w + 8000} height={PLANE.h + 8000} fill="url(#isoG)" />
      </Svg>,
    );
  }

  // ---- opening: pin, ring, slanted label (0 – 3.4)
  const openA = 1 - ramp(t, 3.2, 3.6, linear);
  if (openA > 0) {
    const ring = 1 + 0.25 * Math.sin(t * 6);
    const sL = pop(t, 0.9, 11, 190);
    items.push(
      <Pin key="open" c={c} at={ISL}>
        <div style={{ position: 'relative', width: 0, height: 0, opacity: openA }}>
          <div style={{ position: 'absolute', left: -44 * ring, top: -44 * ring, width: 88 * ring, height: 88 * ring, borderRadius: '50%',
            border: `7px solid ${RED}`, opacity: clamp01(pop(t, 0.2, 12, 200)), boxShadow: `0 0 18px ${RED}` }} />
          <div style={{ position: 'absolute', left: -13, top: -13, width: 26, height: 26, borderRadius: '50%', background: '#fff', border: `6px solid ${RED}`,
            transform: `scale(${pop(t, 0.15, 10, 220)})` }} />
          <div style={{ position: 'absolute', left: -2, top: -300 * clamp01(sL), width: 4, height: 300 * clamp01(sL) - 20, background: RED }} />
          <div style={{ position: 'absolute', left: 0, top: -300, transform: 'translate(-50%,-100%)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transform: `scale(${sL}) rotate(-7deg)` }}>
              <Tag parts={[['दुनिया का सबसे', 'k']]} size={56} skew={0} />
              <Tag parts={[['ख़तरनाक', 'r'], ['टापू', 'k']]} size={72} skew={0} s={pop(t, 1.54, 9, 220)} />
            </div>
          </div>
        </div>
      </Pin>,
    );
  }

  // ---- neon outline + skull (4.6 – 7.9)
  const neonA = window4(t, 4.55, 4.75, 7.7, 8.1);
  if (neonA > 0) {
    const draw = ramp(t, 4.6, 5.4, easeOut);
    const beat = 1 + 0.5 * window4(t, 6.55, 6.65, 6.8, 7.2);
    items.push(
      <Svg key="neon" opacity={neonA} filter={glow(RED, 8 * beat, 3)}>
        <path d={island} fill="none" stroke="#FF6B78" strokeWidth={9} strokeLinejoin="round" pathLength={1}
          strokeDasharray={`${draw} 1`} />
      </Svg>,
    );
    const s = pop(t, 5.38, 10, 180) * beat ** 0.4 * (1 - ramp(t, 7.7, 8.0, easeIn));
    if (s > 0.01)
      items.push(
        <Pin key="skull" c={c} at={ISL}>
          <Img src={img('glow_skull_neon.png')} style={{ width: 360, transform: `scale(${s})`, filter: `${glow(RED, 10, 3)} brightness(1.05)`, opacity: 0.95 }} />
        </Pin>,
      );
  }

  // ---- not the animals, not the air (8.4 – 11.3)
  const pins: [string, P, number][] = [
    ['pin_crocodile.png', add(ISL, -2000, 1700), 8.4],
    ['pin_snake.png', add(ISL, 2100, 300), 8.84],
    ['pin_toxic_gas.png', add(ISL, -100, -1600), 9.56],
  ];
  const no = window4(t, 10.6, 10.68, 10.9, 11.0);
  const pinsOut = ramp(t, 10.95, 11.35, easeIn);
  for (const [f, at, t0] of pins) {
    const s = pop(t, t0, 10, 200) * (1 - pinsOut);
    if (s <= 0.01) continue;
    items.push(
      <Pin key={f} c={c} at={at} anchor="bottom">
        <Img src={img(f)} style={{ width: 320, transform: `translateX(${Math.sin(t * 70) * 10 * no}px) scale(${s})`, transformOrigin: '50% 100%',
          filter: `drop-shadow(0 10px 14px rgba(0,0,0,0.6)) ${glow('rgba(255,43,61,0.55)', 10, 1)} grayscale(${ramp(t, 10.62, 10.8)})` }} />
      </Pin>,
    );
  }

  // ---- the people: bow pin, silhouettes rising, red label (11.3 – 14.6)
  const bow = pop(t, 11.34, 10, 200) * (1 - ramp(t, 11.95, 12.25, easeIn));
  if (bow > 0.01)
    items.push(
      <Pin key="bow" c={c} at={ISL} anchor="bottom">
        <Img src={img('pin_bow_arrow.png')} style={{ width: 280, transform: `scale(${bow})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.6))' }} />
      </Pin>,
    );
  const silA = window4(t, 12.0, 12.25, 14.45, 14.7);
  if (silA > 0) {
    const rise = ramp(t, 12.0, 12.6, easeOut);
    const sLbl = pop(t, 12.72, 10, 210);
    items.push(
      <Pin key="sil" c={c} at={ISL}>
        <div style={{ position: 'relative', width: 760, height: 620, opacity: silA }}>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 140, height: 470, overflow: 'hidden' }}>
            <Img src={img('silhouette_group_cutout.png')} style={{ position: 'absolute', left: 0, bottom: 0, width: 760,
              transform: `translateY(${(1 - rise) * 100}%)`, filter: `brightness(0.35) sepia(1) hue-rotate(-30deg) saturate(4) ${glow('rgba(255,43,61,0.6)', 6, 1)}` }} />
          </div>
          <div style={{ position: 'absolute', left: '50%', bottom: 120, transform: 'translateX(-50%)' }}>
            <Tag parts={[['सेंटिनलीज़', 'r']]} size={92} s={sLbl} skew={-4} />
          </div>
        </div>
      </Pin>,
    );
  }

  // ---- "ये है North Sentinel Island" pin + label (19.4 – 28.3)
  const nameA = window4(t, 19.45, 19.7, 27.9, 28.3) * (1 - window4(t, 22.85, 23.05, 24.4, 24.7)) * (1 - window4(t, 26.4, 26.7, 28, 28.3));
  if (nameA > 0) {
    const ring = pop(t, 19.6, 12, 200);
    const sL = pop(t, 20.56, 11, 200);
    const zoomedOut = ramp(t, 24.5, 25.3);
    const lead = lerp(220, 150, zoomedOut);
    items.push(
      <Pin key="name" c={c} at={ISL}>
        <div style={{ position: 'relative', width: 0, height: 0, opacity: nameA }}>
          <div style={{ position: 'absolute', left: -58 * ring, top: -58 * ring, width: 116 * ring, height: 116 * ring, borderRadius: '50%',
            border: `5px solid ${RED}`, opacity: 0.85 * (1 - zoomedOut) * (1 - ramp(t, 22.6, 23.0)) }} />
          <div style={{ position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: RED, boxShadow: `0 0 12px ${RED}`, transform: `scale(${ring})` }} />
          <div style={{ position: 'absolute', left: -2.5, top: -lead * clamp01(sL), width: 5, height: lead * clamp01(sL), background: RED }} />
          <div style={{ position: 'absolute', left: 0, top: -lead - 8, transform: 'translate(-50%,-100%)' }}>
            <MapLabel text="नॉर्थ सेंटिनल आइलैंड" size={lerp(64, 52, zoomedOut)} s={sL} />
          </div>
        </div>
      </Pin>,
    );
  }

  // ---- Manhattan at true scale, sliding over the island (23.0 – 24.6)
  const manA = window4(t, 22.95, 23.1, 24.35, 24.7);
  if (manA > 0) {
    const slide = 1 - ramp(t, 23.0, 23.65, easeOut);
    const off = add(ISL, 1200 + 16000 * slide, -5200 + 2500 * slide);
    const d = GEO.manhattan.map((p, i) => (i ? 'L' : 'M') + project(c, off[0] + p[0], off[1] + p[1]).map((v) => v.toFixed(1)).join(',')).join('') + 'Z';
    items.push(
      <Svg key="man" opacity={manA}>
        <path d={d} fill="rgba(214,219,228,0.78)" stroke="#ffffff" strokeWidth={3} strokeLinejoin="round" style={{ filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.55))' }} />
      </Svg>,
    );
    items.push(
      <Pin key="manL" c={c} at={add(off, -400, -1500)} flat rot={-61}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: 'rgba(30,40,55,0.85)', whiteSpace: 'nowrap', opacity: manA,
          textShadow: 'none' }}>मैनहैटन, न्यूयॉर्क</div>
      </Pin>,
    );
  }

  // ---- "Indian Ocean" + India in the flag (24.6 – 28.4)
  const oceanA = window4(t, 24.7, 25.05, 27.6, 28.1);
  if (oceanA > 0)
    items.push(
      <Pin key="ocean" c={c} at={merc(80, 3)}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontStyle: 'italic', fontSize: 110, color: '#fff', whiteSpace: 'nowrap', opacity: oceanA,
          transform: `scale(${pop(t, 24.75, 12, 180)}) skewX(-8deg)`, textShadow: '0 4px 16px rgba(0,30,60,0.6)', letterSpacing: 2 }}>इंडियन ओशन</div>
      </Pin>,
    );
  const flagA = window4(t, 26.5, 26.85, 27.95, 28.4);
  if (flagA > 0) {
    const [ix0, iy1] = project(c, merc(68, 37)[0], merc(68, 37)[1]);
    const [ix1, iy0] = project(c, merc(97.5, 6.5)[0], merc(97.5, 6.5)[1]);
    const bh = (iy0 - iy1) / 3;
    const wave = Math.sin(t * 5) * 6;
    const fill = ramp(t, 26.55, 27.1, easeOut);
    const chakraC: P = [lerp(ix0, ix1, 0.45), iy1 + bh * 1.5];
    const cr = bh * 0.42;
    items.push(
      <Svg key="flag" opacity={flagA}>
        <defs>
          <clipPath id="indiaClip"><path d={ringsD(c, GEO.india)} /></clipPath>
          <linearGradient id="flagShade" x1="0" x2="1" y1="0" y2="0.3">
            <stop offset="0" stopColor="#000" stopOpacity={0.18} />
            <stop offset={0.5 + 0.2 * Math.sin(t * 2)} stopColor="#fff" stopOpacity={0.12} />
            <stop offset="1" stopColor="#000" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <g clipPath="url(#indiaClip)">
          <g opacity={fill}>
            <rect x={ix0 - 50} y={iy1 - 50 + wave} width={ix1 - ix0 + 100} height={bh + 50} fill="#FF9933" />
            <rect x={ix0 - 50} y={iy1 + bh + wave} width={ix1 - ix0 + 100} height={bh} fill="#FFFFFF" />
            <rect x={ix0 - 50} y={iy1 + 2 * bh + wave} width={ix1 - ix0 + 100} height={bh * 2} fill="#138808" />
            <g transform={`translate(${chakraC[0]},${chakraC[1] + wave})`}>
              <circle r={cr} fill="none" stroke="#000080" strokeWidth={cr * 0.09} />
              <circle r={cr * 0.17} fill="#000080" />
              {Array.from({ length: 24 }, (_, i) => (
                <line key={i} x1={0} y1={0} x2={cr * Math.cos((i * Math.PI) / 12)} y2={cr * Math.sin((i * Math.PI) / 12)} stroke="#000080" strokeWidth={cr * 0.035} />
              ))}
            </g>
            <rect x={ix0 - 50} y={iy1 - 50} width={ix1 - ix0 + 100} height={bh * 3 + 100} fill="url(#flagShade)" />
          </g>
        </g>
        <path d={ringsD(c, GEO.india)} fill="none" stroke="#fff" strokeWidth={2.5} opacity={0.8 * fill} />
      </Svg>,
    );
  }

  // ---- the flag badge on the island, then "?" (29.3 – 31.4)
  const badgeA = window4(t, 29.2, 29.35, 30.95, 31.35);
  if (badgeA > 0) {
    const s = pop(t, 29.34, 10, 190);
    const q = pop(t, 30.42, 9, 220);
    const R = 150;
    items.push(
      <Pin key="badge" c={c} at={ISL}>
        <div style={{ position: 'relative', width: 2 * R, height: 2 * R, opacity: badgeA, transform: `scale(${s})` }}>
          <svg width={2 * R} height={2 * R} viewBox={`${-R} ${-R} ${2 * R} ${2 * R}`} style={{ filter: `drop-shadow(0 12px 18px rgba(0,0,0,0.55)) grayscale(${ramp(t, 30.42, 30.7)}) brightness(${1 - 0.35 * ramp(t, 30.42, 30.7)})` }}>
            <defs><clipPath id="bc"><circle r={R - 8} /></clipPath></defs>
            <g clipPath="url(#bc)">
              <rect x={-R} y={-R} width={2 * R} height={(2 * R) / 3} fill="#FF9933" />
              <rect x={-R} y={-R / 3} width={2 * R} height={(2 * R) / 3} fill="#fff" />
              <rect x={-R} y={R / 3} width={2 * R} height={(2 * R) / 3} fill="#138808" />
              <g>
                <circle r={R * 0.3} fill="none" stroke="#000080" strokeWidth={4} />
                {Array.from({ length: 24 }, (_, i) => (
                  <line key={i} x1={0} y1={0} x2={R * 0.3 * Math.cos((i * Math.PI) / 12)} y2={R * 0.3 * Math.sin((i * Math.PI) / 12)} stroke="#000080" strokeWidth={1.6} />
                ))}
              </g>
            </g>
            <circle r={R - 8} fill="none" stroke="#fff" strokeWidth={10} />
          </svg>
          {q > 0.01 && (
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-55%) scale(${q})`, fontFamily: FONT, fontWeight: 900,
              fontSize: 230, color: RED, textShadow: '0 6px 0 #fff, 0 0 24px rgba(0,0,0,0.6)', WebkitTextStroke: '6px #fff', paintOrder: 'stroke fill' }}>?</div>
          )}
        </div>
      </Pin>,
    );
  }

  // ---- Port Blair, 64 km (31.4 – 34.5)
  const pbA = window4(t, 31.4, 31.6, 34.2, 34.6);
  if (pbA > 0) {
    const a: P = add(ISL, 5200, 300);
    const b: P = add(GEO.portBlair, -3200, -400);
    const [ax, ay] = project(c, a[0], a[1]);
    const [bx, by] = project(c, b[0], b[1]);
    const g = ramp(t, 32.2, 33.0, easeOut);
    const ex = lerp(ax, bx, g);
    const ey = lerp(ay, by, g);
    const ang = Math.atan2(by - ay, bx - ax);
    const head = (x: number, y: number, dir: number) =>
      `M${x + 30 * Math.cos(dir + 2.6)},${y + 30 * Math.sin(dir + 2.6)}L${x},${y}L${x + 30 * Math.cos(dir - 2.6)},${y + 30 * Math.sin(dir - 2.6)}`;
    items.push(
      <Svg key="dist" opacity={pbA * clamp01(g * 8)} filter="drop-shadow(0 3px 6px rgba(0,0,0,0.6))">
        <path d={`M${ax},${ay}L${ex},${ey}`} stroke="#fff" strokeWidth={9} strokeLinecap="round" />
        <path d={head(ax, ay, ang + Math.PI)} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {g > 0.98 && <path d={head(bx, by, ang)} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      </Svg>,
    );
    const km = Math.round(64 * ramp(t, 32.6, 33.3, easeOut));
    const mid = project(c, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    items.push(
      <div key="km" style={{ position: 'absolute', left: mid[0], top: mid[1], width: 0, height: 0 }}>
        <div style={{ position: 'absolute', transform: `translate(-50%,-150%) rotate(${(ang * 180) / Math.PI}deg)`, fontFamily: FONT, fontWeight: 900, fontSize: 88,
          color: '#fff', whiteSpace: 'nowrap', opacity: pbA * clamp01((t - 32.55) * 6), textShadow: '0 3px 10px rgba(0,0,0,0.85)' }}>{km} किमी</div>
      </div>,
    );
    items.push(
      <Pin key="pb" c={c} at={GEO.portBlair} anchor="bottom">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: pbA }}>
          <MapLabel text="पोर्ट ब्लेयर" size={50} s={pop(t, 31.7, 11, 200)} />
          <Img src={img('pin_city.png')} style={{ width: 210, transform: `scale(${pop(t, 31.56, 10, 200)})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.6))' }} />
        </div>
      </Pin>,
    );
  }

  // ---- contact attempts: waving emoji, an arrow, dead emoji (34.5 – 37.8)
  const emA = window4(t, 34.5, 34.6, 37.45, 37.8);
  if (emA > 0) {
    const dead = t >= 36.44;
    const s = pop(t, 34.55, 10, 190) * (1 + 0.12 * window4(t, 36.44, 36.5, 36.6, 36.9));
    const fly = ramp(t, 36.12, 36.44, easeIn);
    items.push(
      <Pin key="emoji" c={c} at={ISL}>
        <div style={{ position: 'relative', width: 330, height: 330, opacity: emA, transform: `scale(${s}) rotate(${dead ? -8 : Math.sin(t * 9) * 6}deg)` }}>
          <Img src={img(dead ? 'emoji_dead.png' : 'emoji_wave_smile.png')} style={{ width: 330, filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.55))' }} />
          {t > 36.1 && (
            <Img src={img('arrow_single.png')} style={{ position: 'absolute', width: 330, left: lerp(420, 40, fly), top: lerp(-260, 70, fly),
              transform: 'rotate(140deg)', transformOrigin: '50% 50%', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.5))' }} />
          )}
        </div>
      </Pin>,
    );
  }

  // ---- the helicopter (39.8 – 41.7)
  if (t > 39.75 && t < 41.75) {
    const p = ramp(t, 39.8, 41.25, easeOut);
    const from = add(ISL, 15000, -14000);
    const to = add(ISL, 900, -900);
    const pos: P = [lerp(from[0], to[0], p) + Math.sin(p * Math.PI) * 2500, lerp(from[1], to[1], p)];
    const [hx, hy] = project(c, pos[0], pos[1]);
    const dir = (Math.atan2(-(to[1] - from[1]), to[0] - from[0]) * 180) / Math.PI + 90;
    const size = 520;
    const a = ramp(t, 39.8, 40.0, linear);
    items.push(
      <div key="heli" style={{ position: 'absolute', left: hx, top: hy, width: 0, height: 0, opacity: a }}>
        <Img src={img('heli_body_topdown.png')} style={{ position: 'absolute', width: size, left: -size / 2 + 40, top: -size / 2 + 60,
          transform: `rotate(${dir}deg)`, filter: 'brightness(0) blur(6px)', opacity: 0.35 }} />
        <Img src={img('heli_body_topdown.png')} style={{ position: 'absolute', width: size, left: -size / 2, top: -size / 2, transform: `rotate(${dir}deg)` }} />
        <div style={{ position: 'absolute', left: 0, top: 0, transform: `rotate(${dir}deg)` }}>
          <Img src={img('heli_rotor_blur.png')} style={{ position: 'absolute', width: size * 1.05, left: -size * 0.525 + size * 0.002, top: -size * 0.525 - size * 0.147,
            transform: `rotate(${t * 1500}deg)`, opacity: 0.85 }} />
        </div>
      </div>,
    );
  }

  // ---- the 9 km zone and patrol boats (44.6 – 49.6)
  const zA = window4(t, 44.6, 44.8, 49.2, 49.7);
  if (zA > 0) {
    const RZ = (ISL_R + 9260) * MS * k;
    const g = ramp(t, 44.66, 45.6, easeOut);
    const pulse = 1 + 0.03 * Math.sin(t * 4);
    items.push(
      <Svg key="zone" opacity={zA}>
        <circle cx={cx} cy={cy} r={RZ * g * pulse} fill="rgba(255,43,61,0.40)" stroke={RED} strokeWidth={6} />
        <path d={island} fill="none" stroke="#fff" strokeWidth={2} opacity={0.6} />
      </Svg>,
    );
    const lr = ramp(t, 46.0, 46.5, easeOut);
    if (lr > 0) {
      const x0 = cx + ISL_R * MS * k;
      const x1 = cx + RZ;
      items.push(
        <Svg key="zr" opacity={zA} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))">
          <path d={`M${x0},${cy}L${lerp(x0, x1, lr)},${cy}`} stroke="#fff" strokeWidth={6} strokeDasharray="16 10" />
        </Svg>,
        <div key="zl" style={{ position: 'absolute', left: (x0 + x1) / 2, top: cy - 20, transform: `translate(-50%,-100%) rotate(${-c.rot}deg)`, opacity: zA * lr }}>
          <MapLabel text="9 किमी" size={66} s={pop(t, 46.14, 10, 210)} />
        </div>,
      );
    }
    const bA = window4(t, 46.5, 46.9, 49.1, 49.5);
    if (bA > 0)
      for (const ph of [0, Math.PI]) {
        const th = ph + (t - 46) * 0.35;
        const bx = cx + Math.cos(th) * RZ * 1.0;
        const by = cy + Math.sin(th) * RZ * 1.0;
        items.push(
          <Img key={`pb${ph}`} src={img('boat_patrol_topdown.png')} style={{ position: 'absolute', width: 150, left: bx - 75, top: by - 75, opacity: bA,
            transform: `rotate(${(th * 180) / Math.PI + 180}deg)`, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.6))' }} />,
        );
      }
  }

  // ---- sneaking in: the boat and the arrows (49.2 – 54.0)
  if (t > 49.2 && t < 54.2) {
    const inP = ramp(t, 49.3, 51.5, easeOut);
    const back = ramp(t, 53.0, 54.0, easeIn);
    const start = add(COAST, -4200, -900);
    const near = add(COAST, -1250, -300);
    const bpos: P = back > 0 ? [lerp(near[0], start[0], back), lerp(near[1], start[1], back)] : [lerp(start[0], near[0], inP), lerp(start[1], near[1], inP)];
    const [bx, by] = project(c, bpos[0], bpos[1]);
    const head = back > 0 ? 250 - 180 * ramp(t, 53.0, 53.3) : 70;
    const a = window4(t, 49.2, 49.4, 53.8, 54.1);
    items.push(
      <Img key="boat" src={img('boat_fishing_topdown.png')} style={{ position: 'absolute', width: 300, left: bx - 150, top: by - 150, opacity: a,
        transform: `rotate(${head}deg)`, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.55))' }} />,
    );
    const shots: [number, number, number, 'a' | 's'][] = [
      [51.6, 300, 700, 'a'], [51.85, 500, -300, 'a'], [52.1, 200, 300, 'a'], [52.36, 400, 1100, 's'], [52.55, 350, -700, 's'],
      [52.78, 250, 100, 'a'], [52.92, 450, 500, 'a'], [53.06, 300, -100, 'a'], [53.2, 380, 900, 's'], [53.34, 260, -500, 'a'],
    ];
    shots.forEach(([t0, dxs, dys, kind], i) => {
      if (t < t0) return;
      const from = add(COAST, dxs, dys);
      const tgt: P = [bpos[0] + ((i * 37) % 7 - 3) * 60 * MS, bpos[1] + ((i * 53) % 5 - 2) * 60 * MS];
      const dur = kind === 'a' ? 0.42 : 0.55;
      const p = clamp01((t - t0) / dur);
      const [fx, fy] = project(c, from[0], from[1]);
      const [tx, ty] = project(c, tgt[0], tgt[1]);
      const arc = Math.sin(p * Math.PI) * -90;
      const x = lerp(fx, tx, p);
      const y = lerp(fy, ty, p) + arc;
      const ang = Math.atan2(ty - fy, tx - fx) + Math.cos(p * Math.PI) * -0.35;
      const fadeOut = 1 - ramp(t, t0 + dur + 0.15, t0 + dur + 0.45, linear);
      if (fadeOut <= 0) return;
      const trail = Array.from({ length: 9 }, (_, j) => {
        const q = clamp01(p - j * 0.05);
        return [lerp(fx, tx, q), lerp(fy, ty, q) + Math.sin(q * Math.PI) * -90];
      });
      items.push(
        <Svg key={`tr${i}`} opacity={0.75 * fadeOut}>
          <path d={'M' + trail.map((q) => q.join(',')).join('L')} stroke="#0b0b0d" strokeWidth={6} strokeDasharray="14 10" fill="none" strokeLinecap="round" />
        </Svg>,
        <Img key={`ar${i}`} src={img(kind === 'a' ? 'arrow_single.png' : 'spear_single.png')} style={{ position: 'absolute', width: kind === 'a' ? 230 : 320,
          left: x - (kind === 'a' ? 115 : 160), top: y - 38, transform: `rotate(${(ang * 180) / Math.PI}deg)`, opacity: fadeOut, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))' }} />,
      );
    });
  }

  // ---- dense jungle glow, then the population guess (54.3 – 58.8)
  const jA = window4(t, 54.35, 54.75, 58.3, 58.8);
  if (jA > 0) {
    const [bx0, by1] = project(c, GEO.bounds[0], GEO.bounds[3]);
    const [bx1, by0] = project(c, GEO.bounds[2], GEO.bounds[1]);
    items.push(
      <Svg key="jungle" opacity={jA}>
        <defs><clipPath id="islClip"><path d={island} /></clipPath></defs>
        <g clipPath="url(#islClip)">
          <image href={img('texture_jungle_glow.png')} x={bx0} y={by1} width={bx1 - bx0} height={by0 - by1} preserveAspectRatio="xMidYMid slice"
            opacity={0.55} style={{ mixBlendMode: 'screen' }} />
          <path d={island} fill="rgba(110,255,170,0.18)" />
        </g>
        <path d={island} fill="none" stroke="#A6FFD0" strokeWidth={10} strokeLinejoin="round" style={{ filter: glow('#3CFF9A', 10, 3) }} />
      </Svg>,
    );
  }
  const popA = window4(t, 57.2, 57.35, 58.55, 58.85);
  if (popA > 0) {
    const s = pop(t, 57.3, 10, 200);
    items.push(
      <Pin key="pop" c={c} at={add(ISL, -300, -600)}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, opacity: popA, transform: `scale(${s}) rotate(-28deg)`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.6))' }}>
          <Person h={150} color="#BFF5CC" />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, color: '#BFF5CC', lineHeight: 1, whiteSpace: 'nowrap' }}>50–200?</div>
        </div>
      </Pin>,
    );
  }

  // ---- the ending: people, the outsider, disease (59.0 – 68.8)
  if (t > 58.9) {
    PEOPLE.forEach((p, i) => {
      const order = INFECT.indexOf(i);
      const tRed = 64.5 + order * 0.22;
      const tGone = 66.7 + order * 0.13;
      const s = pop(t, 59.0 + i * 0.11, 11, 210);
      const red = ramp(t, tRed, tRed + 0.18, linear);
      const gone = ramp(t, tGone, tGone + 0.4, easeIn);
      if (s <= 0.01 || gone >= 1) return;
      items.push(
        <Pin key={`pp${i}`} c={c} at={p} anchor="bottom">
          <div style={{ transform: `scale(${s})`, transformOrigin: '50% 100%', opacity: 1 - gone, filter: `drop-shadow(0 6px 6px rgba(0,0,0,0.5))` }}>
            <div style={{ position: 'relative' }}>
              <Person h={150} color="#0d0d10" />
              <div style={{ position: 'absolute', inset: 0, opacity: red }}><Person h={150} color={RED} /></div>
            </div>
          </div>
        </Pin>,
      );
    });
    const walk = ramp(t, 60.3, 61.5, easeOut);
    const op: P = [lerp(OUTSIDER_FROM[0], OUTSIDER_TO[0], walk), lerp(OUTSIDER_FROM[1], OUTSIDER_TO[1], walk)];
    const oA = ramp(t, 60.25, 60.5, linear);
    if (oA > 0)
      items.push(
        <Pin key="outsider" c={c} at={op} anchor="bottom">
          <div style={{ opacity: oA, transform: `translateY(${Math.abs(Math.sin(t * 12)) * -6 * (walk < 1 ? 1 : 0)}px)`, filter: `drop-shadow(0 6px 6px rgba(0,0,0,0.5)) ${glow('rgba(255,43,61,0.6)', 6, 1)}` }}>
            <Person h={165} color={RED} />
          </div>
        </Pin>,
      );
    // virus particles drift from the outsider to the people
    if (t > 61.8 && t < 65.6) {
      PEOPLE.forEach((p, i) => {
        const t0 = 61.9 + (INFECT.indexOf(i) % 5) * 0.28;
        const pr = ramp(t, t0, t0 + 2.2, inOut);
        if (pr <= 0 || pr >= 1) return;
        const pos: P = [lerp(OUTSIDER_TO[0], p[0], pr) + Math.sin(pr * 7 + i) * 250, lerp(OUTSIDER_TO[1] + 900, p[1] + 900, pr)];
        items.push(
          <Pin key={`v${i}`} c={c} at={pos}>
            <Img src={img('virus_particle.png')} style={{ width: 70, opacity: Math.sin(pr * Math.PI) * 0.95, transform: `rotate(${t * 120 + i * 40}deg)` }} />
          </Pin>,
        );
      });
    }
  }

  return <>{items}</>;
};
