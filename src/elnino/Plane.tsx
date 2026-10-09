import React from 'react';
import { clamp01, easeIn, easeOut, inOut, lerp, linear, ramp, window4 } from '../darien/anim';
import { C, Cam, GEO, P, PLANE, merc, project } from './cam';
import { Mass, WaterCanvas, WindCanvas } from './Water';

export const WARM = '#FF5A36';
export const WARM_CORE = '#FFB27A';
export const COLD = '#2FD6FF';
export const COLD_CORE = '#C8F7FF';
export const GOLD = '#FFC21F';

const glow = (color: string, r: number, n = 2) => Array.from({ length: n }, (_, i) => `drop-shadow(0 0 ${r * (i + 1)}px ${color})`).join(' ');

const pathD = (c: Cam, rings: P[][]) =>
  rings.map((r) => r.map(([x, y], i) => {
    const [px, py] = project(c, x, y);
    return (i ? 'L' : 'M') + px.toFixed(1) + ',' + py.toFixed(1);
  }).join('') + 'Z').join('');

/** Country glow on the map: soft fill + bright rim, drawn on with p (0..1) and pulsing gently. */
const Country: React.FC<{ c: Cam; rings: P[][]; color: string; a: number; t: number; fill?: number }> = ({ c, rings, color, a, t, fill = 0.38 }) => {
  if (a <= 0.001) return null;
  const d = pathD(c, rings);
  const pulse = 0.85 + 0.15 * Math.sin(t * 4.2);
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a, filter: glow(color, 9, 2) }}>
      <path d={d} fill={color} fillOpacity={fill * pulse} stroke={color} strokeWidth={4} strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
};

/** Big translucent curved arrow lying on the map (reference 18–20 s), drawn along lon/lat points with a moving sheen. */
const MapArrow: React.FC<{ c: Cam; pts: [number, number][]; p: number; a: number; width: number; t: number; id: string }> = ({ c, pts, p, a, width, t, id }) => {
  if (a <= 0.001 || p <= 0) return null;
  const xy = pts.map(([lo, la]) => project(c, ...merc(lo, la)));
  let d = `M${xy[0][0]},${xy[0][1]}`;
  for (let i = 1; i < xy.length - 1; i++) {
    const mx = (xy[i][0] + xy[i + 1][0]) / 2;
    const my = (xy[i][1] + xy[i + 1][1]) / 2;
    d += ` Q${xy[i][0]},${xy[i][1]} ${mx},${my}`;
  }
  d += ` L${xy[xy.length - 1][0]},${xy[xy.length - 1][1]}`;
  const q = clamp01(p);
  // arrowhead at the drawn end: approximate along the polyline
  const L = xy.slice(1).reduce((s, b, i) => s + Math.hypot(b[0] - xy[i][0], b[1] - xy[i][1]), 0);
  let s = q * L;
  let hx = xy[0][0], hy = xy[0][1], ang = 0;
  for (let i = 1; i < xy.length; i++) {
    const sl = Math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]);
    ang = Math.atan2(xy[i][1] - xy[i - 1][1], xy[i][0] - xy[i - 1][0]);
    if (s <= sl) {
      hx = xy[i - 1][0] + (xy[i][0] - xy[i - 1][0]) * (s / sl);
      hy = xy[i - 1][1] + (xy[i][1] - xy[i - 1][1]) * (s / sl);
      break;
    }
    s -= sl;
    hx = xy[i][0];
    hy = xy[i][1];
  }
  const hs = width * 1.9;
  const head = `M${hx + Math.cos(ang) * hs * 0.9},${hy + Math.sin(ang) * hs * 0.9} L${hx + Math.cos(ang + 2.25) * hs},${hy + Math.sin(ang + 2.25) * hs} L${hx + Math.cos(ang - 2.25) * hs},${hy + Math.sin(ang - 2.25) * hs} Z`;
  const sheen = (t * 0.6) % 1;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: a, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))' }}>
      <defs>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1={xy[0][0]} y1={xy[0][1]} x2={hx} y2={hy}>
          <stop offset="0" stopColor="#fff" stopOpacity={0.05} />
          <stop offset={Math.max(0, sheen - 0.15)} stopColor="#fff" stopOpacity={0.45} />
          <stop offset={sheen} stopColor="#fff" stopOpacity={0.85} />
          <stop offset={Math.min(1, sheen + 0.15)} stopColor="#fff" stopOpacity={0.45} />
          <stop offset="1" stopColor="#fff" stopOpacity={0.7} />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={`url(#${id}g)`} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={`${q} 1`} />
      <path d={head} fill="#fff" fillOpacity={0.8} />
    </svg>
  );
};

/** Everything that lies flat on the map plane, by beat (cues = words of the creator's voiceover). */
export const PlaneLayers: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const masses: Mass[] = [];
  // opening: the AC's cold air spreading west across the eastern Pacific, draining when it switches off
  masses.push({
    id: 'acCool', t, flow: -1, color: COLD, core: COLD_CORE,
    spine: [[-81, -3, 380], [-95, -1, 650], [-115, 0, 820], [-140, 1, 900]],
    grow: ramp(t, 0.35, C.ac + 0.2, easeOut),
    tail: ramp(t, C.band, C.band + 1.2, easeIn),
    a: window4(t, 0.3, 0.8, C.isi, C.agla + 0.2),
  });
  // warm water creeping in once it stops
  masses.push({
    id: 'openWarm', t, flow: 1, color: WARM, core: WARM_CORE,
    spine: [[-150, 2, 950], [-125, 0, 950], [-100, -1, 750], [-84, -3, 420]],
    grow: ramp(t, C.band, C.agla + 0.3, easeOut),
    a: window4(t, C.band, C.band + 0.5, C.naam + 0.3, C.naam + 0.9),
  });
  // trade winds push warm surface water west to Indonesia/Australia
  masses.push({
    id: 'pushWest', t, flow: -1, color: WARM, core: WARM_CORE,
    spine: [[-84, -3, 520], [-120, -1, 900], [-170, 0, 1100], [160, -2, 1250], [135, -4, 1150], [118, -5, 800]],
    grow: ramp(t, C.garm - 0.2, C.indo + 0.9, inOut),
    tail: lerp(0, 0.5, ramp(t, C.indo + 0.3, C.barish + 0.8, inOut)) * (1 - ramp(t, C.garm5, C.laut + 0.6, inOut)),
    a: window4(t, C.garm - 0.2, C.garm + 0.3, C.bas - 0.4, C.bas),
  });
  // cold upwelling off Peru
  masses.push({
    id: 'peruCold', t, flow: -1, color: COLD, core: COLD_CORE,
    spine: [[-78, -13, 380], [-84, -6, 520], [-96, -2, 680], [-112, 0, 720]],
    grow: ramp(t, C.peru, C.thanda4 + 0.4, easeOut),
    a: window4(t, C.peru, C.peru + 0.4, C.garm5, C.laut + 0.8),
  });
  // winds weaken: the warm water sloshes back east
  masses.push({
    id: 'backEast', t, flow: 1, color: WARM, core: WARM_CORE,
    spine: [[128, -4, 900], [160, -2, 1150], [-170, 0, 1200], [-130, 0, 1100], [-100, -2, 850], [-82, -4, 500]],
    grow: ramp(t, C.garm5 - 0.2, C.samandar + 0.3, inOut),
    a: window4(t, C.garm5 - 0.2, C.garm5 + 0.3, C.bas - 0.3, C.bas + 0.05),
  });
  // flooding Peru/Ecuador coast, drought over Australia
  masses.push({
    id: 'flood', t, flow: 1, color: '#2E6BFF', core: '#9EC2FF',
    spine: [[-81, -9, 200], [-80.5, -5, 230], [-80, -1, 220], [-79.5, 2, 180]],
    grow: ramp(t, C.peru7 - 0.1, C.baadh + 0.4, easeOut),
    a: window4(t, C.peru7 - 0.1, C.peru7 + 0.3, C.aus7 - 0.2, C.aus7 + 0.2),
  });
  masses.push({
    id: 'ausDry', t, flow: -1, color: GOLD, core: '#FFF0B0',
    spine: [[150, -26, 650], [134, -25, 1000], [120, -22, 700], [112, -6, 450]],
    grow: ramp(t, C.aus7 - 0.1, C.sukha7 + 0.4, easeOut),
    a: window4(t, C.aus7 - 0.1, C.aus7 + 0.3, C.bharat + 0.2, C.monsoon),
  });
  // now: the record warm water in the eastern Pacific
  masses.push({
    id: 'nowWarm', t, flow: 1, color: WARM, core: '#FFD1A0',
    spine: [[-175, 0, 900], [-140, 0, 1150], [-110, -1, 1150], [-85, -4, 650]],
    grow: ramp(t, C.ab - 0.1, C.d3 + 0.2, easeOut),
    a: window4(t, C.ab - 0.1, C.ab + 0.3, C.dharti, C.tapayegi + 0.3) * (1 + 0.25 * ramp(t, C.garmi, C.garmi + 0.5)),
  });

  // wind: steady, then weakening
  const windA = window4(t, C.hawayen - 0.3, C.hawayen + 0.4, C.garm5 + 0.2, C.laut + 0.4);
  const weak = ramp(t, C.lekin + 0.2, C.kamzor + 0.6, inOut);

  // countries
  const hiIndoAus = window4(t, C.indo - 0.1, C.indo + 0.3, C.peru - 0.1, C.peru + 0.2);
  const hiPeru = window4(t, C.peru, C.peru + 0.3, C.lekin, C.lekin + 0.4);
  const hiIndia = window4(t, C.bharat + 0.05, C.bharat + 0.45, C.p13 - 0.3, C.p13);
  const hiIndia76 = window4(t, C.akele - 0.2, C.akele + 0.3, C.ab - 0.2, C.ab + 0.1);

  // big curved arrows (east → west)
  const arrP = ramp(t, C.purab - 0.1, C.paschim + 0.5, easeOut);
  const arrA = window4(t, C.purab - 0.1, C.purab + 0.2, C.garm - 0.2, C.garm + 0.3);

  return (
    <>
      <WindCanvas cam={c} t={t} a={windA} n={1 - 0.7 * weak} speed={1 - 0.65 * weak} />
      <Country c={c} rings={GEO.indonesia} color={GOLD} a={hiIndoAus} t={t} fill={0.3} />
      <Country c={c} rings={GEO.australia} color={GOLD} a={hiIndoAus} t={t} fill={0.3} />
      <Country c={c} rings={[...GEO.peru_c, ...GEO.ecuador]} color="#FFD27A" a={hiPeru} t={t} fill={0.26} />
      <Country c={c} rings={GEO.india_c} color={GOLD} a={hiIndia} t={t} fill={0.22} />
      <Country c={c} rings={GEO.india_c} color="#FF3B30" a={hiIndia76} t={t} fill={0.16} />
      <WaterCanvas cam={c} masses={masses} />
      <MapArrow id="ar1" c={c} t={t} p={arrP} a={arrA} width={44} pts={[[-95, 9], [-130, 7], [-165, 6.5], [170, 7.5], [150, 9]]} />
      <MapArrow id="ar2" c={c} t={t} p={clamp01(arrP * 1.1 - 0.1)} a={arrA} width={44} pts={[[-92, -7], [-125, -8], [-160, -7.5], [175, -6.5], [155, -5]]} />
    </>
  );
};

export { easeIn, easeOut, inOut, linear };
