import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { DUR, GEO, P, PL, camAt, camSpeed } from './cam';
import { C, Card, Ghost, Person, Pill, Pin, Prop, TITLE, UI, LABEL, back, clamp01, easeOut, inOut, useFonts, win, IMG, asp } from './Kit';
import { MapLayers } from './Map';
import TIMING from './timing.json';

export const BR_DURATION_S = DUR;
const TM = TIMING as unknown as { words: [number, number, string][]; caps: number[][] };

// ------------------------------------------------------------------ fills (flat, hard-light, wipe from the centre)
type Paint = string | 'tri' | 'fr' | 'ch' | 'cz';
type FillDef = { id: string; rings: number[][][]; paint: Paint; on: number; off: number };
const country = (k: string) => GEO.countries[k];
const state = (k: string) => GEO.states[k];
// prettier-ignore
const FILLS: FillDef[] = [
  { id: 'in0', rings: country('India'), paint: C.saffron, on: -1, off: 1.6 },
  { id: 'cz0', rings: country('Czechia'), paint: 'cz', on: 2.42, off: 4.5 },
  { id: 'mc0', rings: country('Monaco'), paint: C.red, on: 4.95, off: 6.5 },
  { id: 'pb0', rings: state('Punjab'), paint: C.saffron, on: 6.98, off: 7.86 },
  { id: 'cz1', rings: country('Czechia'), paint: 'cz', on: 8.22, off: 11.3 },
  { id: 'wb0', rings: state('West Bengal'), paint: C.saffron, on: 13.0, off: 17.7 },
  { id: 'ch0', rings: country('Switzerland'), paint: 'ch', on: 18.12, off: 19.06 },
  { id: 'us0', rings: country('United States of America'), paint: C.blue, on: 19.5, off: 20.8 },
  { id: 'uk0', rings: country('United Kingdom'), paint: C.red, on: 21.22, off: 23.56 },
  { id: 'cz2', rings: country('Czechia'), paint: 'cz', on: 22.75, off: 23.56 },
  { id: 'ch2', rings: country('Switzerland'), paint: 'ch', on: 22.85, off: 23.56 },
  { id: 'fr2', rings: country('France'), paint: 'fr', on: 22.95, off: 23.56 },
  { id: 'in1', rings: country('India'), paint: 'tri', on: 27.85, off: 29.0 },
  { id: 'fr0', rings: country('France'), paint: 'fr', on: 29.05, off: 31.9 },
  { id: 'in2', rings: country('India'), paint: 'tri', on: 32.3, off: 33.1 },
  { id: 'mc1', rings: country('Monaco'), paint: C.red, on: 33.5, off: 35.6 },
  { id: 'pb1', rings: state('Punjab'), paint: C.saffron, on: 36.0, off: 38.25 },
  { id: 'uk1', rings: country('United Kingdom'), paint: C.red, on: 39.75, off: 40.95 },
  { id: 'up0', rings: state('Uttar Pradesh'), paint: C.saffron, on: 41.55, off: 42.66 },
  { id: 'fr1', rings: country('France'), paint: 'fr', on: 43.05, off: 45.9 },
  { id: 'mh0', rings: state('Maharashtra'), paint: C.saffron, on: 46.3, off: 48.95 },
  { id: 'in3', rings: country('India'), paint: 'tri', on: 50.3, off: 55.65 },
  { id: 'in4', rings: country('India'), paint: C.saffron, on: 55.55, off: 99 },
];
const bboxOf = (rings: number[][][]) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  rings.forEach((r) => r.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
  return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, R: Math.hypot(x1 - x0, y1 - y0) * 0.62 };
};
const PREP = FILLS.map((f) => ({ ...f, b: bboxOf(f.rings) }));
const fillG = (t: number, f: FillDef) => {
  const inn = f.on < 0 ? 1 : easeOut((t - f.on) / 0.5);
  return t < f.on ? 0 : inn * (1 - clamp01((t - f.off) / 0.3));
};

type CamT = ReturnType<typeof camAt>;
/** world rings to a screen-space path (projected every frame: Chrome mis-clips paths with Mercator-size coordinates) */
const sPath = (c: CamT, rings: number[][][]) => rings.map((r) => {
  let d = '';
  for (let i = 0; i < r.length; i++) { const x = 540 + (r[i][0] - c.x) / c.mpp, y = 960 - (r[i][1] - c.y) / c.mpp; d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); }
  return d + 'Z';
}).join('');
const onScreen = (c: CamT, b: { x0: number; y0: number; x1: number; y1: number }) => {
  const [l, t] = P(c, b.x0, b.y1), [r, btm] = P(c, b.x1, b.y0);
  return r > -200 && l < 1280 && btm > -200 && t < 2120;
};

const World: React.FC<{ c: CamT; t: number; pass: 'fill' | 'line' }> = ({ c, t, pass }) => {
  const live = PREP.map((f) => ({ f, g: fillG(t, f) })).filter((v) => v.g > 0.001 && onScreen(c, v.f.b));
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, mixBlendMode: pass === 'fill' ? 'hard-light' : 'normal' }}>
      {live.map(({ f, g }) => {
        const { b } = f;
        const d = sPath(c, f.rings);
        const [cx, cy] = P(c, b.cx, b.cy);
        const r = (b.R / c.mpp) * easeOut(clamp01(g * 1.1));
        const cid = `cl_${pass}_${f.id}`;
        if (pass === 'line') {
          return (
            <g key={f.id}>
              <defs><clipPath id={cid}><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
              <g clipPath={`url(#${cid})`} opacity={clamp01(g * 2)}>
                <path d={d} fill="none" stroke="#000" strokeWidth={8} opacity={0.35} strokeLinejoin="round" />
                <path d={d} fill="none" stroke="#fff" strokeWidth={3.5} strokeLinejoin="round" />
              </g>
            </g>
          );
        }
        const [sx0, sy0] = P(c, b.x0, b.y1), [sx1, sy1] = P(c, b.x1, b.y0);
        const w = sx1 - sx0, h = sy1 - sy0;
        let paint: string = typeof f.paint === 'string' && f.paint.startsWith('#') ? f.paint : `url(#gr_${f.id})`;
        if (f.paint === 'ch') paint = '#DA291C';
        return (
          <g key={f.id}>
            <defs>
              <clipPath id={cid}><circle cx={cx} cy={cy} r={r} /></clipPath>
              <clipPath id={`in_${f.id}`}><path d={d} /></clipPath>
              {f.paint === 'tri' && (
                <linearGradient id={`gr_${f.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FF7A12" /><stop offset="0.36" stopColor="#FF9A3C" /><stop offset="0.36" stopColor="#E8E8E8" />
                  <stop offset="0.64" stopColor="#E8E8E8" /><stop offset="0.64" stopColor="#1FA03E" /><stop offset="1" stopColor="#138A30" />
                </linearGradient>
              )}
              {f.paint === 'fr' && (
                <linearGradient id={`gr_${f.id}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#1E5BD8" /><stop offset="0.36" stopColor="#1E5BD8" /><stop offset="0.36" stopColor="#E8E8E8" />
                  <stop offset="0.64" stopColor="#E8E8E8" /><stop offset="0.64" stopColor="#EF4135" /><stop offset="1" stopColor="#EF4135" />
                </linearGradient>
              )}
              {f.paint === 'cz' && (
                <linearGradient id={`gr_${f.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#E8E8E8" /><stop offset="0.5" stopColor="#E8E8E8" /><stop offset="0.5" stopColor="#D7141A" /><stop offset="1" stopColor="#D7141A" />
                </linearGradient>
              )}
            </defs>
            <g clipPath={`url(#${cid})`} opacity={clamp01(g * 2)}>
              <path d={d} fill={paint} />
              {f.paint === 'cz' && <path clipPath={`url(#in_${f.id})`} d={`M${sx0},${sy0}L${sx0},${sy1}L${sx0 + w * 0.5},${(sy0 + sy1) / 2}Z`} fill="#11457E" />}
              {f.paint === 'ch' && (
                <g clipPath={`url(#in_${f.id})`}>
                  <rect x={cx - h * 0.1} y={cy - h * 0.32} width={h * 0.2} height={h * 0.64} fill="#F2F2F2" />
                  <rect x={cx - h * 0.32} y={cy - h * 0.1} width={h * 0.64} height={h * 0.2} fill="#F2F2F2" />
                </g>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
};

/** country borders (thin) and India's official outline (crisp), in the normal layer */
const BORDERS = GEO.borders.map((l) => ({ l, b: bboxOf([l]) }));
const INDIA = GEO.countries.India;
const Lines: React.FC<{ c: CamT }> = ({ c }) => {
  let d = '';
  BORDERS.forEach(({ l, b }) => {
    if (!onScreen(c, b)) return;
    // skip vertices closer than ~1.5 px at this zoom
    let lx = 1e9, ly = 1e9;
    l.forEach(([x, y], i) => {
      const sx = 540 + (x - c.x) / c.mpp, sy = 960 - (y - c.y) / c.mpp;
      if (i && i < l.length - 1 && Math.abs(sx - lx) + Math.abs(sy - ly) < 1.5) return;
      d += (i ? 'L' : 'M') + sx.toFixed(1) + ',' + sy.toFixed(1); lx = sx; ly = sy;
    });
  });
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <path d={d} fill="none" stroke="#fff" strokeOpacity={0.26} strokeWidth={1.6} />
      <path d={sPath(c, INDIA)} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={2.4} strokeLinejoin="round" />
    </svg>
  );
};

/** the route Bata took: Zlín to Kolkata, drawn on as the camera flies it */
const Route: React.FC<{ c: CamT; t: number }> = ({ c, t }) => {
  const o = win(t, 11.2, 17.5, 0.2, 0.4);
  if (o <= 0) return null;
  const a = GEO.places.zlin, b = GEO.places.kolkata;
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 1.6e6];
  const N = 90;
  const p = inOut((t - 11.3) / 1.95);
  const pts = Array.from({ length: N + 1 }, (_, i) => { const s = (i / N) * p; return [(1 - s) * (1 - s) * a[0] + 2 * (1 - s) * s * mid[0] + s * s * b[0], (1 - s) * (1 - s) * a[1] + 2 * (1 - s) * s * mid[1] + s * s * b[1]]; });
  const scr = pts.map(([x, y]) => P(c, x, y));
  const d = 'M' + scr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L');
  const head = scr[scr.length - 1];
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <path d={d} fill="none" stroke={C.yellow} strokeWidth={14} strokeOpacity={0.25} strokeLinecap="round" />
      <path d={d} fill="none" stroke={C.yellow} strokeWidth={5} strokeDasharray="18 12" strokeLinecap="round" />
      {p < 0.999 && <circle cx={head[0]} cy={head[1]} r={13} fill="#fff" stroke={C.yellow} strokeWidth={5} />}
    </svg>
  );
};

/** "≈ आधा हिस्सा": a half-filled ring that counts up */
const Half: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 14.6, 17.55, 0.3, 0.25);
  if (o <= 0) return null;
  const p = inOut((t - 14.8) / 0.9);
  const R = 120, L = 2 * Math.PI * R;
  return (
    <div style={{ position: 'absolute', left: 540, top: 1215, transform: `translate(-50%,-50%) scale(${0.8 + 0.2 * back((t - 14.6) / 0.35)})`, opacity: o, textAlign: 'center' }}>
      <svg width={300} height={300} style={{ display: 'block', margin: '0 auto' }}>
        <circle cx={150} cy={150} r={R} fill="rgba(8,9,12,0.78)" stroke="rgba(255,255,255,0.18)" strokeWidth={34} />
        <circle cx={150} cy={150} r={R} fill="none" stroke={C.red} strokeWidth={34} strokeDasharray={`${L * 0.5 * p} ${L}`} transform="rotate(-90 150 150)" style={{ filter: `drop-shadow(0 0 12px ${C.red})` }} />
        <text x={150} y={168} textAnchor="middle" fontFamily={TITLE} fontSize={74} fill="#fff">≈{Math.round(50 * p)}%</text>
      </svg>
      <div style={{ marginTop: 6, fontFamily: UI, fontWeight: 800, fontSize: 50, color: '#fff', textShadow: '0 4px 14px #000', whiteSpace: 'nowrap' }}>विदेशी parent कंपनी</div>
    </div>
  );
};

/** the opera stage opening over Paris (Lakmé) */
const Opera: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  const o = win(t, 44.05, 45.85, 0.25, 0.2);
  if (o <= 0) return null;
  const p = easeOut((t - 44.05) / 0.6);
  const w = 900, h = w / asp('br10_opera_stage');
  const open = inOut((t - 44.2) / 0.8);
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: o, transform: `scale(${0.86 + 0.14 * p + 0.03 * clamp01((t - 44.2) / 1.6)})`,
      clipPath: `inset(0 ${(1 - p) * 50}% 0 ${(1 - p) * 50}%)`, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.7))' }}>
      <Img src={IMG('br10_opera_stage')} style={{ position: 'absolute', inset: 0, width: w, height: h }} />
      {/* curtains drawn in code, parting */}
      <div style={{ position: 'absolute', left: '12%', top: '17%', width: `${38 * (1 - open)}%`, height: '72%', background: 'linear-gradient(90deg, #5a0710, #a3121f 40%, #6d0a14 70%, #b01725)', boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'absolute', right: '12%', top: '17%', width: `${38 * (1 - open)}%`, height: '72%', background: 'linear-gradient(270deg, #5a0710, #a3121f 40%, #6d0a14 70%, #b01725)', boxShadow: 'inset 10px 0 20px rgba(0,0,0,0.5)' }} />
    </div>
  );
};

/** the flip: "उल्टा" turning over in the top half while Null is in the bottom half */
const Flip: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 23.5, 27.75, 0.2, 0.25);
  if (o <= 0) return null;
  const r = 180 * (1 - easeOut((t - 23.5) / 0.55));
  const l2 = back((t - 25.55) / 0.35);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', opacity: o, perspective: 900 }}>
      <div style={{ display: 'inline-block', transform: `rotateX(${r}deg)`, fontFamily: UI, fontWeight: 800, fontSize: 190, lineHeight: 1.05, color: C.yellow, textShadow: '0 0 40px rgba(255,210,63,0.6), 0 10px 30px rgba(0,0,0,0.8)' }}>उल्टा!</div>
      {t > 25.55 && (
        <div style={{ marginTop: 10, transform: `scale(${0.6 + 0.4 * l2})`, opacity: clamp01(l2 * 1.5), fontFamily: UI, fontWeight: 800, fontSize: 64, color: '#fff', textShadow: '0 6px 18px #000', whiteSpace: 'nowrap' }}>
          नाम विदेशी <span style={{ color: C.yellow }}>→</span> brand <span style={{ color: C.saffron }}>देसी</span>
        </div>
      )}
    </div>
  );
};

/** word-highlight captions, 3–4 words */
const Captions: React.FC<{ t: number; y: number }> = ({ t, y }) => {
  const W = TM.words;
  const ci = TM.caps.findIndex((c, i) => { const s = W[c[0]][0], nx = TM.caps[i + 1]; const e = nx ? W[nx[0]][0] : W[c[c.length - 1]][1] + 0.4; return t >= s - 0.05 && t < e; });
  if (ci < 0) return null;
  const cap = TM.caps[ci];
  const p = easeOut((t - W[cap[0]][0] + 0.05) / 0.12);
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center', transform: `translateY(-50%) scale(${0.92 + 0.08 * p})`, opacity: p }}>
      {cap.map((k) => {
        const [s, e, w] = W[k];
        const on = t >= s - 0.03 && t < e + 0.08;
        return (
          <span key={k} style={{ display: 'inline-block', margin: '0 12px', fontFamily: UI, fontWeight: 800, fontSize: 78, lineHeight: 1.2, color: on ? C.yellow : '#fff',
            transform: `scale(${on ? 1.08 : 1})`, WebkitTextStroke: '3px rgba(0,0,0,0.9)', paintOrder: 'stroke', textShadow: '0 6px 18px rgba(0,0,0,0.85)' }}>{w}</span>
        );
      })}
    </div>
  );
};

/** the closing India with the four Indian names on their cities */
const Chips: React.FC<{ c: CamT; t: number }> = ({ c, t }) => {
  const L: [string, string, number, 'l' | 'r'][] = [['MONTE CARLO', 'ludhiana', 50.55, 'l'], ['RED TAPE', 'kanpur', 50.85, 'r'], ['LAKMÉ', 'mumbai', 51.15, 'l'], ['LOUIS PHILIPPE', 'bengaluru', 51.45, 'r']];
  return (
    <>
      {L.map(([n, k, t0, side]) => {
        const o = win(t, t0, 55.75, 0.3, 0.3);
        if (o <= 0) return null;
        const [x, y] = PL(c, k);
        const p = back((t - t0) / 0.35);
        const pulse = n === 'LOUIS PHILIPPE' ? 1 + 0.12 * Math.sin(clamp01((t - 54.85) / 0.5) * Math.PI) : 1;
        return (
          <div key={n} style={{ position: 'absolute', left: x, top: y, opacity: o }}>
            <div style={{ position: 'absolute', left: -14, top: -14, width: 28, height: 28, borderRadius: '50%', background: '#fff', border: `6px solid ${C.saffron}`, boxShadow: `0 0 18px ${C.saffron}` }} />
            <div style={{ position: 'absolute', top: 0, [side === 'r' ? 'left' : 'right']: 26, transform: `translateY(-50%) scale(${(0.6 + 0.4 * p) * pulse})`, transformOrigin: side === 'r' ? '0 50%' : '100% 50%', whiteSpace: 'nowrap',
              padding: '6px 18px 4px', borderRadius: 12, background: 'rgba(8,9,12,0.82)', border: `3px solid ${C.saffron}`, boxShadow: `0 0 20px ${C.saffron}66`, fontFamily: TITLE, fontSize: 46, letterSpacing: 2, color: '#fff' } as React.CSSProperties}>{n}</div>
          </div>
        );
      })}
    </>
  );
};

const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (s2maps.eu), CC BY 4.0 · AWS Terrain Tiles · Natural Earth · AI illustrations';

export const Brands: React.FC<{ captions?: boolean; audio?: string; thumb?: boolean }> = ({ captions = true, audio = '', thumb = false }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const c = camAt(t);
  const sp = camSpeed(t, fps);
  // directional motion blur from the camera's screen speed (180° shutter) plus a little for zoom
  const bx = Math.min(16, Math.abs(sp.vx) * 0.15 + sp.zoom * 70), by = Math.min(16, Math.abs(sp.vy) * 0.15 + sp.zoom * 70);
  const blur = bx > 0.35 || by > 0.35;
  const split = t >= 23.45 && t < 27.95 ? easeOut((t - 23.45) / 0.35) * (1 - clamp01((t - 27.65) / 0.3)) : 0;
  const pl = (k: string) => PL(c, k);
  const paris = pl('paris'), zlin = pl('zlin');
  const capY = split > 0.5 ? 870 : 1590;
  return (
    <AbsoluteFill style={{ background: '#0b0d10', overflow: 'hidden' }}>
      {audio && <Audio src={staticFile(audio)} />}
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="mb" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} /></filter>
      </svg>
      <AbsoluteFill style={{ transform: `translateY(${-430 * split}px)` }}>
        <AbsoluteFill style={{ filter: blur ? 'url(#mb)' : undefined }}>
          <MapLayers c={c} />
          <World c={c} t={t} pass="fill" />
          <Lines c={c} />
          <World c={c} t={t} pass="line" />
          <Route c={c} t={t} />
        </AbsoluteFill>

        {/* ghost names */}
        <Ghost t={t} t0={-1} t1={1.6} text="INDIA" />
        <Ghost t={t} t0={2.5} t1={4.45} text="CZECH REPUBLIC" />
        <Ghost t={t} t0={5.0} t1={6.45} text="MONACO" />
        <Ghost t={t} t0={7.05} t1={7.84} text="PUNJAB" />
        <Ghost t={t} t0={8.35} t1={11.2} text="CZECH REPUBLIC" />
        <Ghost t={t} t0={13.2} t1={17.6} text="WEST BENGAL" />
        <Ghost t={t} t0={18.25} t1={19.0} text="SWITZERLAND" />
        <Ghost t={t} t0={19.55} t1={20.75} text="USA" />
        <Ghost t={t} t0={21.3} t1={22.5} text="BRITAIN" />
        <Ghost t={t} t0={29.1} t1={31.84} text="FRANCE" />
        <Ghost t={t} t0={33.56} t1={35.5} text="MONACO" />
        <Ghost t={t} t0={36.1} t1={38.18} text="PUNJAB" />
        <Ghost t={t} t0={38.7} t1={41.1} text="LONDON" />
        <Ghost t={t} t0={41.62} t1={42.6} text="UTTAR PRADESH" />
        <Ghost t={t} t0={43.12} t1={45.86} text="PARIS" />
        <Ghost t={t} t0={46.36} t1={48.9} text="MUMBAI" />
        <Ghost t={t} t0={50.6} t1={55.6} text="INDIA" />

        {/* pins */}
        <Pin t={t} t0={7.15} t1={7.84} {...xy(pl('ludhiana'))} label="LUDHIANA" col={C.saffron} />
        <Pin t={t} t0={8.45} t1={11.25} {...xy(zlin)} label="ZLÍN" col={C.red} side="l" />
        <Pin t={t} t0={13.05} t1={17.6} {...xy(pl('konnagar'))} label="KOLKATA" col={C.saffron} side="l" />
        <Pin t={t} t0={29.3} t1={31.84} {...xy(paris)} label="PARIS" col={C.blue} />
        <Pin t={t} t0={36.15} t1={38.18} {...xy(pl('ludhiana'))} label="LUDHIANA" col={C.saffron} />
        <Pin t={t} t0={38.75} t1={41.1} {...xy(pl('london'))} label="LONDON?" col={C.red} drop={-40 * (1 - easeOut((t - 38.75) / 1.2))} />
        <Pin t={t} t0={41.65} t1={42.6} {...xy(pl('kanpur'))} label="KANPUR" col={C.saffron} />
        <Pin t={t} t0={46.4} t1={48.9} {...xy(pl('mumbai'))} label="MUMBAI" col={C.saffron} side="l" />
        <Monaco t={t} c={c} />

        {/* people rising out of their place */}
        <Person t={t} t0={9.6} t1={11.25} k="br03_tomas_bata" x={clampX(zlin[0])} bottom={zlin[1] - 40} h={470} hi="टॉमस बाटा" en="TOMÁŠ BAŤA · ZLÍN" bar={C.red} />
        <Person t={t} t0={30.8} t1={31.85} k="br07_king_louis_philippe" x={clampX(paris[0])} bottom={paris[1] - 40} h={470} hi="राजा लुई फ़िलिप" en="KING LOUIS-PHILIPPE I · FRANCE" bar={C.blue} />
        <Opera t={t} x={540} y={paris[1] + 60} />
        <Chips c={c} t={t} />
      </AbsoluteFill>

      {/* brand cards (screen space) */}
      <AbsoluteFill style={{ transform: `translateY(${-430 * split}px)` }}>
        <Card t={t} t0={-1} t1={4.45} name="BATA" col={C.red} />
        {!thumb && <Pill t={t} t0={-1} t1={2.15} hi="भारतीय?" col={C.saffron} strike={1.56} />}
        <Pill t={t} t0={2.5} t1={4.45} hi="चेक रिपब्लिक" en="CZECH REPUBLIC · 1894" col={C.red} />
        <Prop t={t} t0={-1} t1={4.45} k="br01_canvas_shoes" x={760} y={1250} w={440} col={C.saffron} rot={-4} />

        <Card t={t} t0={4.92} t1={7.84} name="MONTE CARLO" col={C.saffron} />
        <Pill t={t} t0={5.1} t1={6.5} hi="Monaco?" col={C.red} strike={6.15} />
        <Pill t={t} t0={7.05} t1={7.84} hi="लुधियाना, पंजाब" en="LUDHIANA · INDIA" col={C.saffron} />
        <Prop t={t} t0={5.62} t1={7.84} k="br02_wool_sweater" x={760} y={1260} w={430} col={C.saffron} rot={3} />

        <Card t={t} t0={8.1} t1={17.62} name="BATA" col={C.red} />
        <Pill t={t} t0={8.3} t1={11.25} hi="1894 · ज़्लिन" en="FOUNDED IN CZECH LANDS" col={C.red} />
        <Pill t={t} t0={12.95} t1={17.62} hi="भारत · 1930s" en="KOLKATA" col={C.saffron} />
        <Half t={t} />

        <Card t={t} t0={18.08} t1={19.02} name="MAGGI" col={C.red} />
        <Pill t={t} t0={18.55} t1={19.02} hi="स्विट्ज़रलैंड" en="SWITZERLAND" col={C.red} />
        <Prop t={t} t0={18.25} t1={19.02} k="br04_noodles" x={770} y={1250} w={420} col={C.red} />

        <Card t={t} t0={19.45} t1={20.75} name="COLGATE" col={C.blue} />
        <Pill t={t} t0={20.12} t1={20.75} hi="अमेरिका" en="USA" col={C.blue} />
        <Prop t={t} t0={19.62} t1={20.75} k="br05_toothpaste" x={770} y={1250} w={430} col={C.blue} rot={-6} />

        <Card t={t} t0={21.26} t1={22.5} name="LIFEBUOY" col={C.red} />
        <Pill t={t} t0={21.78} t1={22.5} hi="ब्रिटेन" en="BRITAIN" col={C.red} />
        <Prop t={t} t0={21.45} t1={22.5} k="br06_soap" x={770} y={1250} w={420} col={C.red} rot={4} />

        <Card t={t} t0={28.95} t1={33.02} name="LOUIS PHILIPPE" col={C.blue} />
        <Pill t={t} t0={30.05} t1={32.15} hi="नाम: फ़्रांस का राजा" col={C.blue} strike={31.5} />
        <Pill t={t} t0={32.25} t1={33.02} hi="भारत · 1989" en="MADE IN INDIA" col={C.saffron} />
        <Prop t={t} t0={32.3} t1={33.02} k="br08_formal_shirt" x={760} y={1260} w={430} col={C.saffron} rot={-3} />

        <Card t={t} t0={33.25} t1={38.18} name="MONTE CARLO" col={C.saffron} />
        <Pill t={t} t0={34.45} t1={35.95} hi="नाम: Monaco" col={C.red} strike={35.33} />
        <Pill t={t} t0={36.05} t1={38.18} hi="लुधियाना" en="OSWAL WOOLLEN MILLS" col={C.saffron} />
        <Prop t={t} t0={36.2} t1={38.18} k="br02_wool_sweater" x={760} y={1260} w={430} col={C.saffron} rot={3} />

        <Card t={t} t0={38.37} t1={42.6} name="RED TAPE" col={C.red} />
        <Pill t={t} t0={39.75} t1={41.5} hi="British?" col={C.red} strike={40.43} />
        <Pill t={t} t0={41.6} t1={42.6} hi="कानपुर" en="KANPUR · INDIA" col={C.saffron} />
        <Prop t={t} t0={41.68} t1={42.6} k="br09_leather_shoes" x={760} y={1270} w={450} col={C.saffron} rot={-3} />

        <Card t={t} t0={42.85} t1={48.88} name="LAKMÉ" col={C.blue} />
        <Pill t={t} t0={44.4} t1={45.86} hi="French opera" en="NAME ONLY" col={C.blue} />
        <Pill t={t} t0={46.25} t1={48.88} hi="टाटा · 1952" en="TATA · MUMBAI" col={C.saffron} />
        <Prop t={t} t0={46.5} t1={48.88} k="br11_lipstick" x={770} y={1260} w={400} col={C.saffron} rot={4} />

        <Card t={t} t0={56.38} t1={99} name="BATA" col={C.red} />
        <Pill t={t} t0={56.85} t1={99} hi="भारतीय?" col={C.saffron} />
        <Prop t={t} t0={56.55} t1={99} k="br01_canvas_shoes" x={760} y={1250} w={440} col={C.saffron} rot={-4} />

      </AbsoluteFill>
      <Flip t={t} />

      {/* Null, split screen (bottom half) */}
      {split > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 960 + 960 * (1 - split), width: 1080, height: 960, overflow: 'hidden', borderTop: `6px solid ${C.yellow}`, boxShadow: `0 -10px 40px ${C.yellow}55` }}>
          <OffthreadVideo src={staticFile('brands/null/null_br_A.mp4')} startFrom={Math.round(0.6 * fps)} muted style={{ position: 'absolute', left: 0, top: -300, width: 1080, height: 1920 }} />
        </div>
      )}

      {/* grade: vignette and edge darkening for the type */}
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.62) 100%)' }} />
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.45) 100%)' }} />

      {captions && <Captions t={t} y={capY} />}
      {thumb && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1440, textAlign: 'center' }}>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 168, lineHeight: 1.05, color: '#fff', WebkitTextStroke: '6px #000', paintOrder: 'stroke', textShadow: '0 0 40px rgba(232,32,42,0.9), 0 12px 30px rgba(0,0,0,0.9)' }}>
            भारतीय <span style={{ color: '#FF3B3B' }}>नहीं!</span>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 20, right: 20, top: 1892, textAlign: 'center', fontFamily: LABEL, fontSize: 15, letterSpacing: 0.5, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>{CREDIT}</div>
    </AbsoluteFill>
  );
};

const xy = (p: readonly [number, number]) => ({ x: p[0], y: p[1] });
const clampX = (x: number) => Math.min(800, Math.max(280, x));

/** Monaco is two kilometres wide: a white ring marks it */
const Monaco: React.FC<{ t: number; c: CamT }> = ({ t, c }) => {
  const o = Math.max(win(t, 4.95, 6.45, 0.3, 0.25), win(t, 33.5, 35.5, 0.3, 0.25));
  if (o <= 0) return null;
  const [x, y] = PL(c, 'monaco');
  const t0 = t < 20 ? 4.95 : 33.5;
  const p = back((t - t0) / 0.45);
  const r = 70 + 12 * Math.sin((t - t0) * 4);
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: o }}>
      <div style={{ position: 'absolute', left: -r * p, top: -r * p, width: 2 * r * p, height: 2 * r * p, borderRadius: '50%', border: '6px solid #fff', boxShadow: `0 0 24px ${C.red}, inset 0 0 24px ${C.red}` }} />
      <div style={{ position: 'absolute', left: r + 18, top: 0, transform: 'translateY(-50%)', fontFamily: TITLE, fontSize: 56, color: '#fff', letterSpacing: 3, whiteSpace: 'nowrap', textShadow: `0 0 20px ${C.red}, 0 4px 12px #000` }}>MONACO</div>
    </div>
  );
};
