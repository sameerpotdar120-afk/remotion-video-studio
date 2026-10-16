import React from 'react';
import { clamp01, easeIn, easeOut, inOut, lerp, linear, ramp, window4 } from './anim';
import { C, Cam, DURATION_S, GEO, P, merc, project } from './cam';
import { NUM } from './fonts';

/** Region colours: the Judwa Desh palette (bold, flat, one warm and one cool next to each other). */
export const COL = {
  india: '#4F8BFF', ne: '#3EE6A0', corridor: '#FF5468', nepal: '#FFC93C', bangladesh: '#3DDC4A', bhutan: '#B67CFF',
  china: '#FF3B30', chumbi: '#FF3B30', myanmar: '#B67CFF', mizoram: '#38E1FF', andaman: '#FFC93C',
  gold: '#FFD84A', red: '#FF3B30', white: '#FFF6E6', teal: '#2EC4B6', river: '#38D6FF', road: '#FFB347', rail: '#7CC4FF', oil: '#FF5E7E',
};
const ll = (lon: number, lat: number) => merc(lon, lat);
const pl = GEO.places;

export type Region = { key: string; rings: P[][]; a: number; color: string; fill: number; phase: number; sat?: number; dx?: number; dy?: number };

/** Every region's beat: rises on its word, as a raised 3D slab in its country colour. */
export const regionsAt = (t: number): Region[] => {
  const w = window4;
  // the Northeast drifts away from India when the strip is cut ("…ख़त्म"), and comes back for "कहाँ है ये पट्टी?"
  const drift = ramp(t, C.khatam1 - 0.1, C.khatam1 + 0.7, easeOut) * (1 - ramp(t, C.kahan1 + 0.2, C.kahan1 + 0.9, inOut));
  const r = (key: string, rings: P[][], a: number, color: string, sat: number, fill = 0.2, extra: Partial<Region> = {}): Region =>
    ({ key, rings, a: clamp01(a), color, fill, phase: 0, sat, ...extra });
  return [
    r('india', GEO.india, w(t, -1, -0.5, C.kahan1 + 0.2, C.kahan1 + 0.8) + w(t, C.to10 - 0.3, C.to10 + 0.3, DURATION_S, DURATION_S + 1), COL.india, 0.55, 0.12),
    r('china', GEO.china, w(t, C.china4 - 0.2, C.china4 + 0.3, C.isiliye5 + 0.2, C.isiliye5 + 0.8) + w(t, C.china9 - 0.2, C.china9 + 0.3, C.malacca9, C.malacca9 + 0.6), COL.china, 0.55, 0.12),
    r('nepal', GEO.nepal, w(t, C.nepal4 - 0.15, C.nepal4 + 0.25, C.isiliye5 + 0.2, C.isiliye5 + 0.8), COL.nepal, 0.6),
    r('bhutan', GEO.bhutan, w(t, C.bhutan4 - 0.15, C.bhutan4 + 0.25, C.isiliye5 + 0.2, C.isiliye5 + 0.8), COL.bhutan, 0.6),
    r('bangladesh', GEO.bangladesh, w(t, C.bangla4 - 0.15, C.bangla4 + 0.25, C.par6 + 0.2, C.par6 + 0.8) + w(t, C.teesta7 - 0.2, C.teesta7 + 0.3, C.par8 - 0.2, C.par8 + 0.3),
      COL.bangladesh, 0.55),
    r('myanmar', GEO.myanmar, w(t, C.myanmar8 - 0.15, C.myanmar8 + 0.25, C.aur9 - 0.2, C.aur9 + 0.4), COL.myanmar, 0.55),
    r('ne', GEO.ne, w(t, C.crore1 - 0.4, C.crore1 + 0.1, C.kahan1 + 0.3, C.kahan1 + 0.9) + w(t, C.northeast2 - 0.2, C.northeast2 + 0.3, C.sadak3 - 0.2, C.sadak3 + 0.4) +
      w(t, C.to10 - 0.2, C.to10 + 0.4, DURATION_S, DURATION_S + 1), COL.ne, 0.55, 0.2, { dx: drift * 1.6e5, dy: drift * 0.9e5 }),
    r('mizoram', GEO.states['Mizoram'], w(t, C.mizoram8 - 0.15, C.mizoram8 + 0.25, C.aur9 - 0.2, C.aur9 + 0.4), COL.mizoram, 0.6),
    r('corridor', GEO.corridor, w(t, C.n22 - 0.2, C.n22 + 0.3, C.crore1 - 0.3, C.crore1 + 0.2) + w(t, C.kahan1 + 0.1, C.kahan1 + 0.6, C.sadak3 - 0.2, C.sadak3 + 0.3) +
      w(t, C.sab3 - 0.2, C.sab3 + 0.3, C.nepal4 - 0.3, C.nepal4) + w(t, C.chumbi4, C.chumbi4 + 0.4, C.isiliye5 + 0.2, C.isiliye5 + 0.8) +
      w(t, C.karib7 - 0.3, C.karib7 + 0.2, C.par8, C.par8 + 0.4) + w(t, C.army8 - 0.2, C.army8 + 0.3, C.kaladan8, C.kaladan8 + 0.5) +
      w(t, C.to10, C.to10 + 0.5, DURATION_S, DURATION_S + 1), COL.corridor, 0.6, 0.3),
    r('chumbi', GEO.chumbi, w(t, C.chumbi4 - 0.15, C.chumbi4 + 0.25, C.isiliye5 + 0.2, C.isiliye5 + 0.8), COL.chumbi, 0.7, 0.35),
    r('andaman', GEO.andaman, w(t, C.darwaze9 - 0.1, C.darwaze9 + 0.3, C.to10 - 0.2, C.to10 + 0.3), COL.andaman, 0.6, 0.35),
  ];
};

/** The Judwa Desh style is a flat, top-down map: no tilt. */
export const tiltAt = (_t: number) => 0;

// ---- lines (Mercator): the narrowest gap, the lifelines, routes
export const NECK_A = ll(88.1466, 26.6612), NECK_B = ll(88.3528, 26.5787); // Nepal ↔ Bangladesh, 22.5 km (Natural Earth)
const path = (pts: [number, number][]) => pts.map(([a, b]) => ll(a, b));
const shiftLat = (pts: [number, number][], d: number) => path(pts.map(([a, b]) => [a, b + d]));
const LIFE: [number, number][] = [[85.9, 25.6], [87.3, 25.9], [88.0, 26.35], [88.3, 26.62], [88.9, 26.62], [89.9, 26.42], [90.9, 26.25], [91.75, 26.14], [93.2, 26.6]];
export const ROUTES = {
  road: shiftLat(LIFE, 0.07), rail: shiftLat(LIFE, 0), pipe: shiftLat(LIFE, -0.07),
  sea: path([[88.36, 22.57], [88.2, 21.6], [89.0, 21.2], [89.6, 21.9], [89.6, 22.47]]),
  sea2: path([[89.0, 21.2], [90.6, 21.1], [91.6, 21.9], [91.8, 22.33], [91.5, 23.2], [91.28, 23.83]]),
  kaladan: path([[88.36, 22.57], [88.2, 21.6], [89.6, 20.6], [91.6, 20.0], [92.9, 20.15], [92.95, 20.7], [92.87, 21.3], [92.75, 21.9], [92.67, 22.55], [92.72, 23.73]]),
  oil: path([[57.0, 24.0], [62.0, 20.0], [72.0, 12.0], [80.0, 5.6], [88.0, 5.6], [94.0, 6.2], [97.6, 5.3], [100.5, 2.9], [103.0, 1.25], [104.4, 1.3],
    [107.5, 4.5], [110.5, 11.0], [113.6, 18.0], [114.2, 22.2]]),
};
const lineD = (c: Cam, pts: P[]) => pts.map((pt, i) => {
  const [x, y] = project(c, pt[0], pt[1]);
  return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
}).join('');
const ringD = (c: Cam, rings: P[][]) => rings.map((r) => lineD(c, r) + 'Z').join('');
/** A point a fraction of the way along a polyline (by length). */
export const along = (pts: P[], f: number): P => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = clamp01(f) * seg.reduce((a, b) => a + b, 0);
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, d / seg[i]) : 0;
      return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};

/** A route that draws on with a glowing core, a travelling spark and a soft bloom. */
const Route: React.FC<{ c: Cam; pts: P[]; t: number; t0: number; t1: number; dur?: number; color: string; width?: number; dash?: boolean }> = ({ c, pts, t, t0, t1, dur = 1.2, color, width = 9, dash }) => {
  const a = window4(t, t0, t0 + 0.1, t1 - 0.3, t1);
  if (a <= 0) return null;
  const d = lineD(c, pts);
  const draw = ramp(t, t0, t0 + dur, inOut);
  const spark = (t * 0.45) % 1;
  return (
    <g opacity={a}>
      <path d={d} fill="none" stroke={color} strokeWidth={width * 3.2} strokeOpacity={0.22} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} style={{ filter: 'blur(6px)' }} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={dash ? undefined : `${draw} 1`}
        style={{ filter: `drop-shadow(0 0 6px ${color})`, strokeDasharray: dash ? '0.012 0.008' : undefined, clipPath: undefined }} opacity={dash ? draw : 1} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={width * 0.35} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} opacity={0.85} />
      {draw >= 1 && <path d={d} fill="none" stroke="#fff" strokeWidth={width * 0.9} strokeLinecap="round" pathLength={1} strokeDasharray="0.03 0.97" strokeDashoffset={-spark} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />}
    </g>
  );
};

/** A measurement across two points: end ticks, a dashed glowing bar and its number, laid on the map. */
const Measure: React.FC<{ c: Cam; a: P; b: P; t: number; t0: number; t1: number; text: string; color?: string; size?: number }> = ({ c, a, b, t, t0, t1, text, color = COL.gold, size = 70 }) => {
  const o = window4(t, t0, t0 + 0.1, t1 - 0.25, t1);
  if (o <= 0) return null;
  const [x0, y0] = project(c, a[0], a[1]);
  const [x1, y1] = project(c, b[0], b[1]);
  const g = ramp(t, t0, t0 + 0.45, easeOut);
  const mx = lerp(x0, x1, 0.5), my = lerp(y0, y1, 0.5);
  const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  const ex = lerp(mx, x0, g), ey = lerp(my, y0, g), fx = lerp(mx, x1, g), fy = lerp(my, y1, g);
  const nx = -(y1 - y0), ny = x1 - x0, nl = Math.hypot(nx, ny) || 1;
  const tk = (x: number, y: number) => `M${x + (nx / nl) * 22},${y + (ny / nl) * 22}L${x - (nx / nl) * 22},${y - (ny / nl) * 22}`;
  return (
    <g opacity={o}>
      <line x1={ex} y1={ey} x2={fx} y2={fy} stroke={color} strokeWidth={7} strokeDasharray="16 10" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      <path d={tk(ex, ey) + tk(fx, fy)} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      <text x={mx} y={my - 34} fill={color} fontFamily={NUM} fontSize={size * clamp01(ramp(t, t0 + 0.2, t0 + 0.5, easeOut))} textAnchor="middle"
        transform={`rotate(${ang > 90 || ang < -90 ? ang + 180 : ang} ${mx} ${my})`} style={{ paintOrder: 'stroke', stroke: '#120a02', strokeWidth: 8, filter: `drop-shadow(0 0 10px ${color})` }}>{text}</text>
    </g>
  );
};

/** A country name as a boxed label on the map (white border, a colour chip), the Judwa Desh way. */
const MapName: React.FC<{ c: Cam; at: P; t: number; t0: number; t1: number; text: string; size?: number; rot?: number; color?: string }> = ({ c, at, t, t0, t1, text, size = 96, color = '#fff' }) => {
  const a = window4(t, t0, t0 + 0.12, t1 - 0.25, t1);
  if (a <= 0) return null;
  const [x, y] = project(c, at[0], at[1]);
  const s = clamp01(lerp(0.3, 1, ramp(t, t0, t0 + 0.25, easeOut))) * (1 + 0.06 * Math.sin(Math.min(1, (t - t0) / 0.35) * Math.PI));
  const fs = Math.max(34, Math.min(64, size * 0.5));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, whiteSpace: 'nowrap', background: 'rgba(8,16,26,0.72)', color: '#fff',
      padding: '8px 22px 2px 18px', borderRadius: 10, border: '4px solid #fff', fontFamily: NUM, fontSize: fs, letterSpacing: 1.5, lineHeight: 1.15,
      boxShadow: '0 8px 22px rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: fs * 0.42, height: fs * 0.42, borderRadius: 5, background: color === '#fff' ? '#FFD84A' : color, display: 'inline-block', marginTop: -5 }} />{text}
    </div>
  );
};

/** The red cut across the strip: a slash that strikes through, with a hot glow. */
const Slash: React.FC<{ c: Cam; t: number; t0: number; t1: number }> = ({ c, t, t0, t1 }) => {
  const o = window4(t, t0, t0 + 0.05, t1 - 0.3, t1);
  if (o <= 0) return null;
  const a = ll(88.05, 26.95), b = ll(88.5, 26.25);
  const [x0, y0] = project(c, a[0], a[1]);
  const [x1, y1] = project(c, b[0], b[1]);
  const g = ramp(t, t0, t0 + 0.16, easeIn);
  return (
    <g opacity={o}>
      <line x1={x0} y1={y0} x2={lerp(x0, x1, g)} y2={lerp(y0, y1, g)} stroke={COL.red} strokeWidth={34} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 18px ${COL.red})` }} />
      <line x1={x0} y1={y0} x2={lerp(x0, x1, g)} y2={lerp(y0, y1, g)} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
    </g>
  );
};

/** The plane layer: everything drawn in map space (it leans back with the camera tilt). */
export const PlaneLayer: React.FC<{ t: number; c: Cam; between?: React.ReactNode }> = ({ t, c, between }) => {
  const box = ringD(c, GEO.corridor);
  const boxA = window4(t, C.siliguri2 - 0.2, C.siliguri2 + 0.2, C.northeast2 - 0.2, C.northeast2 + 0.2);
  const teesta = window4(t, C.teesta7 - 0.1, C.teesta7 + 0.3, C.par8 - 0.2, C.par8 + 0.3);
  const ring = ramp(t, C.karib7 - 0.4, C.karib7 + 0.4, easeOut);
  const [tx, ty] = project(c, pl.teesta[0], pl.teesta[1]);
  const [nx, ny] = project(c, pl.neck[0], pl.neck[1]);
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  return (
    <>
      {between}
      <svg width={2600} height={3200} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {/* the corridor as the reference draws it: a dashed, glowing outline */}
        {boxA > 0 && (
          <path d={box} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="22 14" strokeDashoffset={-t * 40} opacity={boxA} style={{ filter: `drop-shadow(0 0 10px ${COL.corridor})` }} />
        )}
        <Measure c={c} a={NECK_A} b={NECK_B} t={t} t0={C.n22} t1={C.crore1 - 0.2} text="22 KM" />
        <Measure c={c} a={NECK_A} b={NECK_B} t={t} t0={C.kahan1 + 0.6} t1={C.chicken2 - 0.1} text="22 KM" size={60} />
        <Slash c={c} t={t} t0={C.kati1} t1={C.kahan1 + 0.2} />
        {/* road, rail and oil through the strip */}
        <Route c={c} pts={ROUTES.road} t={t} t0={C.sadak3} t1={C.nepal4 - 0.1} color={COL.road} />
        <Route c={c} pts={ROUTES.rail} t={t} t0={C.rail3} t1={C.nepal4 - 0.1} color={COL.rail} />
        <Route c={c} pts={ROUTES.pipe} t={t} t0={C.tel3} t1={C.nepal4 - 0.1} color={COL.oil} />
        {/* the 2018 route by sea through Mongla and Chattogram */}
        <Route c={c} pts={ROUTES.sea} t={t} t0={C.y2018} t1={C.teesta7} dur={1.6} color={COL.gold} width={8} />
        <Route c={c} pts={ROUTES.sea2} t={t} t0={C.y2018 + 0.8} t1={C.par6 + 0.4} dur={1.8} color={COL.gold} width={8} />
        {/* the Teesta and the project ring next to the neck */}
        {teesta > 0 && (
          <g opacity={teesta}>
            <path d={lineD(c, GEO.teesta)} fill="none" stroke={COL.river} strokeWidth={26} strokeOpacity={0.3} strokeLinecap="round" style={{ filter: 'blur(8px)' }} />
            <path d={lineD(c, GEO.teesta)} fill="none" stroke={COL.river} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={`${ramp(t, C.teesta7, C.teesta7 + 1.2, inOut)} 1`}
              style={{ filter: `drop-shadow(0 0 8px ${COL.river})` }} />
            <circle cx={tx} cy={ty} r={60 + 30 * pulse} fill="none" stroke={COL.red} strokeWidth={6} opacity={0.9} style={{ filter: `drop-shadow(0 0 10px ${COL.red})` }} />
            {ring > 0 && (
              <line x1={tx} y1={ty} x2={lerp(tx, nx, ring)} y2={lerp(ty, ny, ring)} stroke={COL.red} strokeWidth={6} strokeDasharray="14 10" style={{ filter: `drop-shadow(0 0 8px ${COL.red})` }} />
            )}
          </g>
        )}
        {/* Kaladan: Kolkata → Sittwe by sea, up the river to Paletwa, by road into Mizoram */}
        <Route c={c} pts={ROUTES.kaladan} t={t} t0={C.kaladan8} t1={C.aur9} dur={2.2} color={COL.mizoram} width={9} />
        {/* China's oil route through Malacca */}
        <Route c={c} pts={ROUTES.oil} t={t} t0={C.tel9 - 0.2} t1={C.to10 - 0.2} dur={2.0} color={COL.oil} width={10} />
      </svg>
      {/* names on the map */}
      <MapName c={c} at={ll(80.5, 22.5)} t={t} t0={0.2} t1={C.n22 + 0.2} text="INDIA" size={150} color={COL.india} />
      <MapName c={c} at={ll(88.25, 26.62)} t={t} t0={C.siliguri2} t1={C.northeast2 - 0.1} text="SILIGURI CORRIDOR" size={78} color={COL.corridor} />
      <MapName c={c} at={ll(93.6, 26.4)} t={t} t0={C.northeast2 + 0.2} t1={C.sadak3 - 0.1} text="NORTHEAST" size={110} color={COL.ne} />
      <MapName c={c} at={ll(86.0, 27.8)} t={t} t0={C.nepal4} t1={C.isiliye5 + 0.4} text="NEPAL" size={120} color={COL.nepal} />
      <MapName c={c} at={ll(89.6, 24.6)} t={t} t0={C.bangla4} t1={C.isiliye5 + 0.4} text="BANGLADESH" size={110} color={COL.bangladesh} />
      <MapName c={c} at={ll(90.4, 27.5)} t={t} t0={C.bhutan4} t1={C.isiliye5 + 0.4} text="BHUTAN" size={100} color={COL.bhutan} />
      <MapName c={c} at={ll(89.6, 29.4)} t={t} t0={C.china4} t1={C.isiliye5 + 0.4} text="CHINA" size={140} color={COL.china} />
      <MapName c={c} at={ll(88.95, 27.62)} t={t} t0={C.chumbi4} t1={C.isiliye5 + 0.4} text="CHUMBI VALLEY" size={80} color={COL.chumbi} />
      <MapName c={c} at={ll(90.0, 21.0)} t={t} t0={C.y2018 - 0.2} t1={C.par6} text="BAY OF BENGAL" size={80} color={COL.river} />
      <MapName c={c} at={ll(96.0, 21.2)} t={t} t0={C.myanmar8} t1={C.aur9} text="MYANMAR" size={110} color={COL.myanmar} />
      <MapName c={c} at={ll(105.0, 33.0)} t={t} t0={C.china9} t1={C.malacca9 + 0.3} text="CHINA" size={170} color={COL.china} />
      <MapName c={c} at={ll(99.6, 4.0)} t={t} t0={C.malacca9} t1={C.darwaze9 + 0.3} text="MALACCA STRAIT" size={90} color={COL.river} />
      <MapName c={c} at={ll(91.6, 10.5)} t={t} t0={C.andaman9} t1={C.to10} text="ANDAMAN & NICOBAR" size={80} color={COL.andaman} />
      <MapName c={c} at={ll(80.5, 22.5)} t={t} t0={C.to10 + 0.3} t1={DURATION_S + 1} text="INDIA" size={150} color={COL.india} />
    </>
  );
};

export { easeOut, linear };
