import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { C, CAPS, Cam, DURATION_S, GEO, LOOPF, P, camAt, camSpeed, lineD, merc, ringsD, rollAt, shake, toS } from './cam';
import { ASPECT } from './assets';
import { Fill, FlatHL, MapPerson, Person } from './Doc';
import { LABEL, SERIF, TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';

/**
 * Malacca (Nov 18): the documentary map edit, following the reference ("Why China fears Indian Ocean and Indian Navy"):
 * a black-and-white satellite map, China red and India blue as flat highlights, the leaders rising out of their
 * countries, the strait lighting up with a counter, the tanker route, the ports lighting up one by one on a dashed loop,
 * and the creator's photoreal 3D props (tanker, destroyers, island, lighthouse, ports, carrier) standing on the map.
 */
export const ML_DURATION_S = DURATION_S;
const D = DURATION_S;
const AUDIO = 'malacca/audio/mix.wav';
const DARK = '#0B1830';
const COL = { gold: '#FFC21A', red: '#E3262E', blue: '#2F7BFF', sky: '#7FC4FF', white: '#F4F4F4', green: '#5BE07F' };
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));
const has = (k: string) => !!ASPECT[k];
const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');

// ------------------------------------------------------------------ the kit
const Big: React.FC<{ text: React.ReactNode; size: number; color?: string; font?: string }> = ({ text, size, color = '#fff', font = TITLE }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 11)}px ${DARK}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const Tag: React.FC<{ text: React.ReactNode; color?: string; size?: number; font?: string }> = ({ text, color = COL.gold, size = 46, font = UI }) => (
  <div style={{ padding: `${size * 0.1}px ${size * 0.5}px`, background: 'rgba(10,12,16,0.9)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: '#fff', whiteSpace: 'nowrap', boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: Math.min(1, o) }}>{children}</div>;
const Stamp: React.FC<{ t: number; t0: number; hi: string; en?: string; color?: string; rot?: number; size?: number }> = ({ t, t0, hi, en, color = COL.red, rot = -10, size = 84 }) => {
  const d = t - t0;
  if (d < 0) return null;
  const s = d < 0.18 ? 2.4 - 1.4 * (d / 0.18) : 1 + 0.04 * Math.exp(-8 * (d - 0.18)) * Math.cos((d - 0.18) * 30);
  return (
    <div style={{ transform: `rotate(${rot}deg) scale(${s})`, opacity: Math.min(1, d * 8), padding: '6px 30px', border: `10px solid ${color}`, borderRadius: 18, fontFamily: UI, fontWeight: 800, fontSize: size, color, background: 'rgba(255,245,235,0.88)', lineHeight: 1.1, textAlign: 'center', whiteSpace: 'nowrap' }}>
      {hi}{en && <div style={{ fontFamily: TITLE, fontSize: size * 0.4, letterSpacing: 8 }}>{en}</div>}
    </div>
  );
};
/** A port / place pin with a name plate (Hindi + English). */
const Place: React.FC<{ t: number; t0: number; x: number; y: number; hi: string; en: string; color?: string; up?: boolean; o?: number; size?: number }> = ({ t, t0, x, y, hi, en, color = COL.gold, up = true, o = 1, size = 40 }) => {
  const p = pop(t, t0, 10, 200);
  if (p <= 0 || o <= 0) return null;
  const ph = ((t - t0) * 1.1) % 1;
  const stem = size * 1.3;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: Math.min(1, o) }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <circle cx={x} cy={y} r={12 + 40 * ph} fill="none" stroke={color} strokeWidth={5} opacity={(1 - ph) * p} />
        <circle cx={x} cy={y} r={11 * p} fill={color} stroke="#fff" strokeWidth={4} />
        <line x1={x} y1={y + (up ? -14 : 14)} x2={x} y2={y + (up ? -stem : stem) * p} stroke="#fff" strokeWidth={4} />
      </svg>
      <div style={{ position: 'absolute', left: x, top: y + (up ? -stem - 4 : stem + 4), transform: `translate(-50%, ${up ? '-100%' : '0'}) scale(${p})`, transformOrigin: up ? '50% 100%' : '50% 0', textAlign: 'center', padding: '4px 16px 6px', background: 'rgba(8,12,20,0.9)', border: `4px solid ${color}`, borderRadius: 14, boxShadow: `0 0 22px ${color}66` }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.05, color: '#fff', whiteSpace: 'nowrap' }}>{hi}</div>
        <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: size * 0.45, letterSpacing: 3, color, whiteSpace: 'nowrap' }}>{en}</div>
      </div>
    </div>
  );
};
/** A photoreal prop standing on the map: (x, y) is its foot, w its width; a soft contact shadow under it. */
const Prop: React.FC<{ k: string; x: number; y: number; w: number; o?: number; p?: number; rot?: number; shadow?: boolean; foot?: number; flip?: boolean }> = ({ k, x, y, w, o = 1, p = 1, rot = 0, shadow = true, foot = 0.82, flip = false }) => {
  if (o <= 0.01 || p <= 0.01 || !has(k) || w < 4) return null;
  const h = w / ASPECT[k];
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h * foot, width: w, height: h, opacity: Math.min(1, o), transform: `scale(${p}) rotate(${rot}deg)`, transformOrigin: `50% ${foot * 100}%` }}>
      {shadow && <div style={{ position: 'absolute', left: w * 0.1, right: w * 0.1, top: h * foot - h * 0.07, height: h * 0.15, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)' }} />}
      <Img src={staticFile(`malacca/img/${k}.png`)} style={{ position: 'absolute', inset: 0, width: w, height: h, transform: flip ? 'scaleX(-1)' : undefined }} />
    </div>
  );
};
/** A glowing hex badge with a prop inside (the tri-service row). */
const Badge: React.FC<{ color: string; k: string; size?: number; t: number; label: string }> = ({ color, k, size = 250, t, label }) => {
  const r = size / 2;
  const pts = Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i - Math.PI / 2; return `${(r + Math.cos(a) * r * 0.92).toFixed(1)},${(r + Math.sin(a) * r * 0.92).toFixed(1)}`; }).join(' ');
  return (
    <div style={{ textAlign: 'center', transform: `translateY(${Math.sin(t * 2.2 + size + label.length) * 5}px)` }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <polygon points={pts} fill="rgba(8,12,20,0.92)" stroke={color} strokeWidth={8} />
          <polygon points={pts} fill={color} opacity={0.18} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{has(k) && <Img src={staticFile(`malacca/img/${k}.png`)} style={{ width: size * (ASPECT[k] < 0.8 ? 0.5 : 0.74) }} />}</div>
      </div>
      <div style={{ marginTop: 6, fontFamily: UI, fontWeight: 800, fontSize: 40, color: '#fff', textShadow: '0 4px 10px #000' }}>{label}</div>
    </div>
  );
};

// ------------------------------------------------------------------ the map layer: India blue, China red, the islands, the routes
const centroid = (c: Cam, k: string): P => { const r = GEO.countries[k][0]; let x = 0, y = 0; for (const p of r) { x += p[0]; y += p[1]; } return toS(c, [x / r.length, y / r.length]); };
/** A smooth (Catmull-Rom) path through screen points. */
const smooth = (pts: P[]) => {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
};
const pathLen = (pts: P[]) => { let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return l * 1.08; };
/** Where along a polyline (screen points) a fraction q lies. */
const along = (pts: P[], q: number): [number, number, number] => {
  const L = pathLen(pts) / 1.08; let d = q * L;
  for (let i = 1; i < pts.length; i++) {
    const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= s || i === pts.length - 1) { const u = s ? Math.min(1, d / s) : 0; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u, Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])]; }
    d -= s;
  }
  return [pts[0][0], pts[0][1], 0];
};
/** Each highlighted country wipes in from its port. */
const PORT_OF: Record<string, string> = { Pakistan: 'gwadar', SriLanka: 'hambantota', Myanmar: 'kyaukpyu', Djibouti: 'djibouti', Iran: 'chabahar', Oman: 'duqm', Indonesia: 'sabang' };
const wideO = (c: Cam) => clamp01((c.mpp - 1200) / 600);
const MapVectors: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const D = DURATION_S;
  const wide = wideO(c);
  const [ix, iy] = toS(c, GEO.places.india_c), [cx, cy] = toS(c, GEO.places.china_c);
  const anO = 1 - wide * 0.0;
  const [ax, ay] = toS(c, merc(93.0, 10.0));
  // the strait itself: a lit corridor along the route between Sumatra and Malaysia
  const strait = win(t, C.malacca1 - 0.3, C.an2, 0.4, 0.5) + win(t, C.naam - 0.2, C.isliye + 0.4, 0.4, 0.4) + win(t, C.sabang - 0.2, C.n2035, 0.4, 0.4);
  // the oil route is already there on frame 0 (the hook's picture) and again at the loop's end
  const routeO = win(t, -1, C.china3 + 0.4, 0.01, 0.5) + win(t, C.n80 - 0.3, C.an2, 0.4, 0.4) + win(t, C.agli + 1.4, D + 1, 0.5, 0.01);
  const routeQ = t < C.china3 + 0.5 || t > C.agli + 1 ? 1 : ramp(t, C.n80 - 0.2, C.malacca1 + 0.4, inOut);
  const route = GEO.route.map((p) => toS(c, p));
  const strPts = GEO.route.slice(8, 13).map((p) => toS(c, p));
  const HL = (pass: 'fill' | 'line') => <>
    <FlatHL id="china" d={ringsD(c, GEO.countries.China)} fill={'red' as Fill} g={wide} cx={cx} cy={cy} pass={pass} />
    <FlatHL id="india" d={ringsD(c, GEO.mainland)} fill="blue" g={wide} cx={ix} cy={iy} pass={pass} />
    <FlatHL id="anb" d={ringsD(c, GEO.andaman)} fill="blue" g={anO} cx={ax} cy={ay} stroke={c.mpp < 600 ? 5 : 3} pass={pass} />
    {[['Pakistan', C.gwadar], ['SriLanka', C.hambantota], ['Myanmar', C.kyaukpyu], ['Djibouti', C.djibouti]].map(([k, t0]) => {
      const o = win(t, (t0 as number) - 0.2, C.jawab, 0.4, 0.4);
      const [x, y] = toS(c, GEO.places[PORT_OF[k as string]]);
      return o > 0.01 && <FlatHL key={k as string} id={`p_${k}`} d={ringsD(c, GEO.countries[k as string])} fill={'red' as Fill} g={o * 0.7} cx={x} cy={y} pass={pass} />;
    })}
    {[['Iran', C.chabahar], ['Oman', C.duqm], ['Indonesia', C.sabang]].map(([k, t0]) => {
      const o = win(t, (t0 as number) - 0.2, C.n2035 + 0.4, 0.4, 0.4);
      const [x, y] = toS(c, GEO.places[PORT_OF[k as string]]);
      return o > 0.01 && <FlatHL key={k as string} id={`d_${k}`} d={ringsD(c, GEO.countries[k as string])} fill="gold" g={o * 0.7} cx={x} cy={y} pass={pass} />;
    })}
  </>;
  return (<>
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', mixBlendMode: 'hard-light' }}>{HL('fill')}</svg>
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <path d={GEO.borders.map((l) => lineD(c, l)).join('')} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.28} />
      {HL('line')}
      {strait > 0.01 && <path d={smooth(strPts)} fill="none" stroke={COL.sky} strokeWidth={Math.max(18, 160000 / c.mpp)} strokeLinecap="round" opacity={0.35 * clamp01(strait)} />}
      {routeO > 0.01 && <>
        <path d={smooth(route)} fill="none" stroke={COL.red} strokeWidth={9} strokeDasharray={`${pathLen(route) * routeQ} ${pathLen(route) * 2}`} strokeLinecap="round" opacity={clamp01(routeO) * 0.6} />
        <path d={smooth(route)} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="16 14" opacity={clamp01(routeO)} mask="url(#rq)" />
        <mask id="rq"><path d={smooth(route)} fill="none" stroke="#fff" strokeWidth={20} strokeDasharray={`${pathLen(route) * routeQ} ${pathLen(route) * 2}`} /></mask>
      </>}
    </svg>
  </>);
};

// ------------------------------------------------------------------ the scenes
const PEOPLE: Record<string, Person> = {
  xi: { k: 'x_xi_jinping', hi: 'शी जिनपिंग', en: 'XI JINPING · CHINA', bar: COL.red },
  modi: { k: 'm_narendra_modi', hi: 'नरेंद्र मोदी', en: 'NARENDRA MODI · INDIA', bar: COL.blue },
};
const Ships: React.FC<{ n: number; total: number; color: string; flip?: boolean }> = ({ n, total, color, flip }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4, width: 400 }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{ position: 'relative', opacity: i < n ? 1 : 0.1, transform: `scale(${i < n ? 1 : 0.7})` }}>
        <Img src={staticFile('malacca/img/w_destroyer_grey.png')} style={{ width: 38, transform: flip ? 'scaleX(-1)' : undefined, filter: `drop-shadow(0 0 4px ${color})` }} />
      </div>
    ))}
  </div>
);
const Scenes: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const w = (a: number, b: number, fi = 0.25, fo = 0.3) => win(t, a, b, fi, fo);
  const s = (k: string) => toS(c, GEO.places[k]);
  const sz = (km: number) => (km * 1000) / c.mpp;
  const [ix, iy] = toS(c, GEO.places.india_c), [cx, cy] = toS(c, GEO.places.china_c);
  const route = GEO.route.map((p) => toS(c, p));
  // the hook's island and tanker (frame 0 and the loop's end)
  const hookO = Math.max(1 - ramp(t, C.china3 - 0.2, C.china3 + 0.4, linear), ramp(t, C.agli + 1.6, D - 0.2, linear));
  const [nx, ny] = toS(c, merc(93.83, 7.0)), [hx, hy] = s('six_degree');
  const tq = (t < 10 ? 0.38 + 0.12 * (t / 8) : 0.38 + 0.12 * ((t - D) / 8 + 1)) ;
  const [tx, ty, ta] = along(route, Math.max(0, Math.min(1, t < 10 ? 0.47 + 0.02 * t : 0.47 + 0.02 * (t - D))));
  return (
    <>
      {/* ---------- hook: the island, the tanker passing just south of it */}
      {hookO > 0.01 && <>
        <Prop k="a_beach_island" x={nx - 40} y={ny - 40} w={Math.max(330, sz(36))} o={hookO} />
        <Prop k="t_tanker" x={hx + 60 * Math.sin(t * LOOPF(3))} y={hy + 40} w={Math.max(260, sz(22))} o={hookO * clamp01(ramp(t, 0, 0.01, linear) + 1)} rot={(ta * 180) / Math.PI * 0.15} />
        {t < C.china3 && <At x={540} y={300} p={1} o={1}><Tag text={<>अंडमान-निकोबार · <span style={{ fontFamily: LABEL, fontSize: 28, letterSpacing: 3 }}>ANDAMAN & NICOBAR</span></>} color={COL.sky} size={46} /></At>}
        {t > D - 1.2 && <At x={540} y={300} p={1} o={1}><Tag text={<>अंडमान-निकोबार · <span style={{ fontFamily: LABEL, fontSize: 28, letterSpacing: 3 }}>ANDAMAN & NICOBAR</span></>} color={COL.sky} size={46} /></At>}
      </>}
      {t > C.china1 - 0.2 && t < C.china3 && <At x={540} y={460} p={pop(t, C.china1 - 0.1, 10, 200)} o={w(C.china1 - 0.2, C.china3)}><Tag text={<>China का <span style={{ color: '#FF6B6B' }}>तेल</span> →</>} color={COL.red} size={52} /></At>}
      {t > C.darr1 - 0.2 && t < C.china3 + 0.2 && <At x={540} y={1180} o={w(C.darr1 - 0.2, C.china3 + 0.2)}><Stamp t={t} t0={C.darr1} hi="डर" en="CHINA'S FEAR" color={COL.red} size={90} /></At>}
      {/* ---------- the navies: Xi and Modi rise; the fleets */}
      <MapPerson who={PEOPLE.xi} t={t} t0={C.china3 + 0.1} x={Math.min(840, Math.max(240, cx))} bottom={Math.max(560, Math.min(900, cy + 120))} h={430} o={w(C.china3, C.n80)} />
      <MapPerson who={PEOPLE.modi} t={t} t0={C.bharat1 - 0.1} x={Math.min(840, Math.max(240, ix + 40))} bottom={Math.max(600, Math.min(1000, iy + 160))} h={430} o={w(C.bharat1 - 0.2, C.n80)} />
      {t > C.n370 - 0.3 && t < C.n80 && <At x={540} y={1260} p={pop(t, C.n370 - 0.2, 10, 200)} o={w(C.n370 - 0.3, C.n80)}>
        <div style={{ display: 'flex', gap: 30, padding: '16px 24px', background: 'rgba(8,10,14,0.9)', borderRadius: 24, border: '4px solid #333' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: TITLE, fontSize: 84, color: '#FF6B6B' }}>{fmt(370 * easeOut(ramp(t, C.n370 - 0.1, C.n370 + 0.9, linear)))}+</div>
            <Ships n={Math.round(37 * ramp(t, C.n370 - 0.1, C.n370 + 0.9, linear))} total={37} color={COL.red} />
            <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 34, color: '#fff' }}>China</div>
          </div>
          <div style={{ textAlign: 'center', opacity: t > C.bharat1 - 0.2 ? 1 : 0.15 }}>
            <div style={{ fontFamily: TITLE, fontSize: 84, color: COL.sky }}>~{fmt(140 * easeOut(ramp(t, C.n140 - 0.1, C.n140 + 0.8, linear)))}</div>
            <Ships n={Math.round(14 * ramp(t, C.n140 - 0.1, C.n140 + 0.8, linear))} total={14} color={COL.blue} flip />
            <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 34, color: '#fff' }}>भारत</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 6, fontFamily: LABEL, fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>1 ⛴ = 10 जहाज़</div>
      </At>}
      {/* ---------- 80% through one narrow lane */}
      {t > C.n80 - 0.3 && t < C.an2 && (() => {
        const [hx2, hy2] = s('hormuz');
        const q = ramp(t, C.n80 - 0.2, C.malacca1 + 0.4, inOut);
        const [px, py, pa] = along(route, q * 0.72);
        return <>
          <Place t={t} t0={C.n80 - 0.1} x={hx2} y={hy2} hi="Middle East" en="OIL" color={COL.red} up={false} o={w(C.n80 - 0.3, C.malacca1 - 0.2)} size={34} />
          <Prop k="t_tanker" x={px} y={py} w={Math.max(150, sz(150))} o={w(C.n80 - 0.3, C.an2)} rot={(pa * 180) / Math.PI * 0.2} />
          <At x={540} y={320} p={pop(t, C.n80 - 0.1, 10, 200)} o={w(C.n80 - 0.3, C.malacca1)}><div style={{ textAlign: 'center' }}><Big text={`~${Math.round(80 * easeOut(ramp(t, C.n80 - 0.1, C.n80 + 0.9, linear)))}%`} size={170} color="#FF6B6B" /><div><Tag text="China का विदेशी तेल" color={COL.red} size={40} /></div></div></At>
          {t > C.malacca1 - 0.3 && <At x={540} y={320} p={pop(t, C.malacca1 - 0.2, 9, 220)} o={w(C.malacca1 - 0.3, C.an2)}><div style={{ textAlign: 'center' }}><Big text="Malacca Strait" size={110} color={COL.sky} /><div style={{ marginTop: 4 }}><Tag text="एक पतली सी गली" color={COL.sky} size={40} /></div></div></At>}
        </>;
      })()}
      {/* ---------- the door: Andaman-Nicobar, 145 km */}
      {t > C.an2 - 0.3 && t < C.tri && (() => {
        const [pbx, pby] = s('port_blair');
        return <>
          {t < C.indira + 0.3 && <At x={540} y={300} p={pop(t, C.an2 - 0.1, 9, 220)} o={w(C.an2 - 0.3, C.indira + 0.3)}><Tag text={<>गली के <span style={{ color: COL.sky }}>दरवाज़े</span> पर: भारत</>} color={COL.blue} size={56} /></At>}
          {t < C.indira + 0.3 && <Place t={t} t0={C.an2} x={pbx} y={pby} hi="अंडमान-निकोबार" en="INDIA" color={COL.blue} o={w(C.an2 - 0.3, C.indira + 0.3)} size={44} />}
        </>;
      })()}
      {t > C.indira - 0.3 && t < C.tri + 0.4 && (() => {
        const [ipx, ipy] = s('indira_point'), [rx, ry] = s('rondo');
        const q = ramp(t, C.indonesia1 - 0.2, C.n145 + 0.6, inOut);
        const o = w(C.indira - 0.3, C.tri + 0.4);
        return <>
          <Prop k="l_lighthouse" x={ipx} y={ipy} w={Math.max(160, sz(30))} o={o} p={pop(t, C.indira - 0.2, 11, 170)} />
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
            <line x1={ipx} y1={ipy} x2={ipx + (rx - ipx) * q} y2={ipy + (ry - ipy) * q} stroke="#fff" strokeWidth={7} strokeDasharray="18 12" />
            <circle cx={rx} cy={ry} r={12 * q} fill={COL.gold} stroke="#fff" strokeWidth={4} />
          </svg>
          <Place t={t} t0={C.indira} x={ipx} y={ipy} hi="इंदिरा पॉइंट" en="INDIA'S SOUTHERNMOST TIP" color={COL.blue} up={false} o={o} size={36} />
          {t > C.indonesia1 - 0.2 && <Place t={t} t0={C.indonesia1} x={rx} y={ry} hi="Indonesia" en="RONDO ISLAND" color={COL.gold} o={o} size={34} />}
          {t > C.n145 - 0.2 && <At x={(ipx + rx) / 2} y={(ipy + ry) / 2 - 90} p={pop(t, C.n145 - 0.1, 9, 220)} o={o}><Big text="~145 km" size={96} color="#fff" /></At>}
        </>;
      })()}
      {/* ---------- the tri-service command */}
      {t > C.tri - 0.3 && t < C.naam && (() => {
        const o = w(C.tri - 0.3, C.naam);
        const [pbx, pby] = s('port_blair');
        return <>
          <Place t={t} t0={C.tri} x={pbx} y={pby} hi="पोर्ट ब्लेयर" en="ANDAMAN & NICOBAR COMMAND · 2001" color={COL.gold} up={false} o={o} size={38} />
          <At x={540} y={300} p={pop(t, C.tri - 0.2, 9, 220)} o={o}><Tag text={<>भारत का इकलौता <span style={{ color: COL.gold }}>Tri-Service Command</span></>} size={48} /></At>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', gap: 26, opacity: o }}>
            {([['c_soldier', 'Army', '#7BA35A', C.army], ['c_warship_small', 'Navy', COL.blue, C.navy2], ['c_fighter_jet', 'Air Force', COL.sky, C.air]] as const).map(([k, l, col, t0]) => { const p = pop(t, t0 - 0.1, 10, 200); return p > 0 && <div key={k} style={{ transform: `scale(${p})` }}><Badge color={col} k={k} t={t} label={l} size={240} /></div>; })}
          </div>
        </>;
      })()}
      {/* ---------- Malacca Dilemma (Null A in the bottom half) */}
      {t > C.naam - 0.3 && t < C.isliye + 0.3 && <>
        <MapPerson who={PEOPLE.xi} t={t} t0={C.naam - 0.1} x={Math.min(840, Math.max(240, cx))} bottom={Math.max(420, Math.min(760, cy + 120))} h={320} label={false} o={w(C.naam - 0.3, C.isliye + 0.3)} />
        <At x={540} y={250} o={w(C.dilemma - 0.3, C.isliye + 0.3)}><Stamp t={t} t0={C.dilemma - 0.2} hi="Malacca Dilemma" en="CHINA'S FEAR" color={COL.red} size={70} rot={-5} /></At>
      </>}
      {/* ---------- String of Pearls */}
      {t > C.isliye - 0.2 && t < C.jawab + 0.4 && (() => {
        const o = w(C.isliye - 0.2, C.jawab + 0.4);
        const pts = GEO.pearls.map((p) => toS(c, p));
        const q = ramp(t, C.ports - 0.3, C.base + 0.6, linear);
        const ports: [string, string, string, number, string][] = [['gwadar', 'ग्वादर', 'GWADAR · PAKISTAN', C.gwadar, 'p_port_cranes'], ['hambantota', 'हंबनटोटा', 'HAMBANTOTA · SRI LANKA', C.hambantota, 'p_port_cranes'], ['kyaukpyu', 'क्यौकफ्यू', 'KYAUKPYU · MYANMAR', C.kyaukpyu, 'p_port_cranes'], ['djibouti', 'जिबूती', 'DJIBOUTI · AFRICA', C.djibouti, 'p_military_base']];
        return <>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
            <path d={smooth(pts)} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="14 12" opacity={0.9} mask="url(#pq)" />
            <mask id="pq"><path d={smooth(pts)} fill="none" stroke="#fff" strokeWidth={22} strokeDasharray={`${pathLen(pts) * q} ${pathLen(pts) * 2}`} /></mask>
          </svg>
          {ports.map(([k, hi, en, t0, prop]) => { const [x, y] = s(k); return t > t0 - 0.3 && <React.Fragment key={k}>
            <Prop k={prop} x={x} y={y} w={150} p={pop(t, t0 - 0.1, 10, 200)} o={o} />
            <Place t={t} t0={t0 - 0.1} x={x} y={y} hi={hi} en={en} color={COL.red} up={k !== 'hambantota'} o={o} size={32} />
          </React.Fragment>; })}
          {t > C.n99 - 0.2 && (() => { const [x, y] = s('hambantota'); return <At x={x + 150} y={y + 30} o={w(C.n99 - 0.2, C.jawab + 0.4)}><Stamp t={t} t0={C.n99 - 0.1} hi="99 साल" en="LEASE" color={COL.red} size={46} rot={-8} /></At>; })()}
          {t > C.base - 0.3 && (() => { const [x, y] = s('djibouti'); return <At x={x + 40} y={y + 170} p={pop(t, C.base - 0.2, 9, 220)} o={o}><Tag text="पहला विदेशी Military Base" color={COL.red} size={34} /></At>; })()}
          {t > C.string - 0.3 && <At x={540} y={250} p={pop(t, C.string - 0.2, 9, 200)} o={w(C.string - 0.3, C.jawab + 0.4)}><div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>{has('p_pearl') && <Img src={staticFile('malacca/img/p_pearl.png')} style={{ width: 110 }} />}<Big text="String of Pearls" size={86} color="#fff" /></div></At>}
        </>;
      })()}
      {/* ---------- Necklace of Diamonds */}
      <MapPerson who={PEOPLE.modi} t={t} t0={C.jawab - 0.1} x={Math.min(840, Math.max(240, ix + 30))} bottom={Math.max(600, Math.min(1050, iy + 170))} h={400} o={w(C.jawab - 0.2, C.sabang)} />
      {t > C.necklace - 0.3 && t < C.n2035 && (() => {
        const o = w(C.necklace - 0.3, C.n2035);
        const ports: [string, string, string, number, boolean][] = [['chabahar', 'चाबहार', 'CHABAHAR · IRAN', C.chabahar, true], ['duqm', 'दुक़्म', 'DUQM · OMAN', C.duqm, false], ['sabang', 'सबांग', 'SABANG · INDONESIA', C.sabang, true]];
        return <>
          {t < C.sabang && <At x={540} y={250} p={pop(t, C.necklace - 0.2, 9, 200)} o={w(C.necklace - 0.3, C.sabang)}><div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>{has('d_diamond') && <Img src={staticFile('malacca/img/d_diamond.png')} style={{ width: 110 }} />}<Big text="Necklace of Diamonds" size={72} color={COL.gold} /></div></At>}
          {ports.map(([k, hi, en, t0, upp]) => { const [x, y] = s(k); return t > t0 - 0.3 && <Place key={k} t={t} t0={t0 - 0.1} x={x} y={y} hi={hi} en={en} color={COL.gold} up={upp} o={o} size={34} />; })}
          {t > C.muhaane - 0.3 && <At x={540} y={250} p={pop(t, C.muhaane - 0.2, 9, 220)} o={w(C.muhaane - 0.3, C.n2035)}><Tag text={<>Malacca के <span style={{ color: COL.gold }}>मुहाने</span> पर</>} color={COL.gold} size={56} /></At>}
        </>;
      })()}
      {/* ---------- 2035 */}
      {t > C.n2035 - 0.3 && t < C.agli + 0.3 && <At x={540} y={1000} p={pop(t, C.n2035 - 0.2, 10, 200)} o={w(C.n2035 - 0.3, C.agli + 0.3)}>
        <div style={{ textAlign: 'center', padding: '16px 30px 22px', background: 'rgba(8,10,14,0.9)', border: `4px solid ${COL.blue}`, borderRadius: 26 }}>
          <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: COL.sky }}>2035 TARGET</div>
          {has('s_carrier') && <Img src={staticFile('malacca/img/s_carrier.png')} style={{ width: 520, marginTop: 6 }} />}
          <div style={{ fontFamily: TITLE, fontSize: 120, color: '#fff', lineHeight: 1.05 }}>~{fmt(140 + 60 * easeOut(ramp(t, C.n200 - 0.4, C.n200 + 0.8, linear)))}</div>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 40, color: COL.sky }}>भारतीय Navy के जहाज़</div>
        </div>
      </At>}
    </>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.naam - 0.4, t1: C.isliye + 0.4, from: 0.6 },
  { name: 'B', t0: C.string - 0.6, t1: C.jawab + 0.2, from: 0.3 },
];
const BAND_TOP = 470;
const splitAt = (t: number) => {
  for (const w of NULL_WIN()) {
    const q = Math.min(ramp(t, w.t0 - 0.2, w.t0 + 0.2, inOut), 1 - ramp(t, w.t1 - 0.2, w.t1 + 0.2, inOut));
    if (q > 0) return { q, w };
  }
  return null;
};
const NullPanel: React.FC<{ t: number; q: number; name: string; t0: number; t1: number; from: number; fps: number }> = ({ t, q, name, t0, t1, from, fps }) => (
  <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d', borderTop: '6px solid #fff' }}>
    <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 300}px`, transform: `scale(${1.12 + 0.04 * ramp(t, t0, t1, inOut)})` }}>
      <Sequence from={Math.round((t0 - 0.2) * fps)} durationInFrames={Math.round((t1 - t0 + 0.6) * fps)} layout="none">
        <OffthreadVideo src={staticFile(`malacca/null/null_ml_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
  </div>
);

// ------------------------------------------------------------------ captions, grade, credits
const Captions: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  if (t < 0.05 || t > D - 0.3) return null;
  let i = -1;
  for (let k = 0; k < CAPS.length; k++) if (CAPS[k][0] <= t) i = k;
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const words = CAPS.slice(g, g + 3);
  const last = words[words.length - 1];
  if (t > last[0] + 1.2 && (!CAPS[g + 3] || t < CAPS[g + 3][0])) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 66, lineHeight: 1.25, color: '#fff', WebkitTextStroke: `10px ${DARK}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
      {words.map(([wt, wd], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0, color: g + k === i ? COL.gold : '#fff' }}>{wd} </span>)}
    </div>
  );
};
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 30 * Math.sin(t * LOOPF(3) + 1.1), ly = 32 + 18 * Math.sin(t * LOOPF(2) + 0.4);
  const tense = win(t, C.darr1 - 0.2, C.china3, 0.4, 0.4) + win(t, C.dilemma - 0.3, C.isliye + 0.3, 0.4, 0.4);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,255,255,0.10), rgba(255,255,255,0) 40%)`, mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.62) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 16%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.45))' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 50%, rgba(227,38,46,0.35), rgba(227,38,46,0) 70%)', mixBlendMode: 'soft-light', opacity: clamp01(tense) }} />
    </AbsoluteFill>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · borders: Natural Earth (India POV) · props and portraits: AI illustration';

export const Malacca: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const c = camAt(t);
  const [sx, sy] = shake(t);
  const sp = camSpeed(t);
  const blur = Math.min(12, sp.pan * 0.25 + sp.zoom * 260);
  const split = splitAt(t);
  return (
    <AbsoluteFill style={{ background: '#101215', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) rotate(${rollAt(t).toFixed(3)}deg) scale(1.05)` }}>
        <AbsoluteFill style={{ filter: blur > 0.7 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
          <AbsoluteFill style={{ filter: 'grayscale(1) contrast(1.3) brightness(0.98)' }}><MapLayers c={c} /></AbsoluteFill>
          <MapVectors t={t} c={c} />
        </AbsoluteFill>
        <Grade t={t} />
        <Scenes t={t} c={c} />
      </AbsoluteFill>
      {split && <NullPanel t={t} q={split.q} {...split.w} fps={fps} />}
      {captions && <Captions t={t} top={split ? 860 : 1500} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={(t * 98) / D} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
