import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Easing } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { kick } from '../../darien/anim';
import { ASPECT } from './assets';
import { LABEL, SERIF, TITLE, UI, useFonts } from './font';
import { Aravalli3D, P3, V3, project, useHeights } from './Terrain3D';
import timing from './timing.json';

/**
 * Aravalli (Nov 17): the documentary "charcoal" style with real 3D. The ground is a 3D terrain of north-west India
 * (AWS/SRTM heights, EOX Sentinel-2 texture, black-and-white); the Aravalli lights up in the documentary green and rises
 * out of it. The creator's photoreal 3D props (Rashtrapati Bhavan, the quarry, the excavator, the dust...) stand on the
 * terrain at their real places, projected with the same camera, each with a contact shadow, so nothing floats.
 */
const T = timing as unknown as { duration: number; cues: Record<string, number>; caps: [number, string][] };
const C = T.cues;
export const AR_DURATION_S = T.duration;
const D = AR_DURATION_S;
const AUDIO = 'aravalli/audio/mix.wav';
const DARK = '#0B1830';
const COL = { gold: '#FFC21A', green: '#5BE07F', sand: '#E8B060', red: '#E8202A', white: '#F4F4F4' };
const io = Easing.bezier(0.65, 0, 0.35, 1);
const eo = Easing.bezier(0.16, 1, 0.3, 1);
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (t: number, a: number, b: number, e = io) => e(cl((t - a) / (b - a)));
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(cl((t - a) / fi), cl((b - t) / fo));
/** A springy pop 0 → 1 (with a little overshoot) from t0. */
const pop = (t: number, t0: number) => { if (t < t0) return 0; const d = t - t0; return 1 - Math.exp(-7 * d) * Math.cos(d * 11); };
const LOOPF = (k: number) => (2 * Math.PI * k) / D;

// ------------------------------------------------------------------ the camera (lon, lat, height km) and the ground
type Key = { t: number; pos: [number, number, number]; look: [number, number]; fov?: number };
const KEYS = (): Key[] => [
  { t: 0, pos: [77.02, 28.18, 46], look: [77.2, 28.6] },
  { t: C.wahi - 0.1, pos: [77.05, 28.24, 40], look: [77.2, 28.6] },
  { t: C.delhi1 + 0.4, pos: [75.7, 25.9, 250], look: [76.3, 27.7] },
  { t: C.rokta + 0.6, pos: [75.1, 25.0, 320], look: [75.7, 27.1] },
  { t: C.aravalli1 + 1.6, pos: [71.6, 22.4, 600], look: [75.4, 26.7] },
  { t: C.karod + 0.6, pos: [72.1, 22.9, 540], look: [75.5, 26.8] },
  { t: C.raisina + 0.2, pos: [76.55, 27.5, 150], look: [77.15, 28.5] },
  { t: C.aakhri + 0.6, pos: [76.6, 27.58, 135], look: [77.15, 28.5] },
  { t: C.thar1 + 0.3, pos: [74.8, 21.6, 660], look: [74.9, 26.9] },
  { t: C.deewar1 + 0.9, pos: [74.9, 22.1, 600], look: [75.0, 26.9] },
  { t: C.n2018 + 0.5, pos: [75.2, 25.4, 170], look: [75.9, 26.9] },
  { t: C.n50, pos: [75.3, 25.6, 150], look: [76.0, 27.0] },
  { t: C.mining + 0.4, pos: [75.8, 26.5, 140], look: [76.35, 27.45] },
  { t: C.jahan + 0.4, pos: [75.82, 26.55, 130], look: [76.35, 27.45] },
  { t: C.n12 + 0.3, pos: [73.6, 24.4, 290], look: [75.6, 26.8] },
  { t: C.dhool + 0.8, pos: [73.9, 24.7, 250], look: [75.6, 26.9] },
  { t: C.sc2 + 0.6, pos: [72.4, 23.2, 520], look: [75.4, 26.7] },
  { t: C.decision + 0.6, pos: [72.8, 23.5, 470], look: [75.5, 26.8] },
  { t: C.agli + 0.5, pos: [76.3, 27.3, 120], look: [77.2, 28.6] },
  { t: D, pos: [77.02, 28.18, 46], look: [77.2, 28.6] },
];
const camAt = (t: number) => {
  const K = KEYS();
  let i = 1;
  while (i < K.length - 1 && t > K[i].t) i++;
  const a = K[i - 1], b = K[i];
  const q = io(cl((t - a.t) / Math.max(1e-6, b.t - a.t)));
  // log-interpolate the height so big zooms feel even
  const h = Math.exp(Math.log(a.pos[2]) + (Math.log(b.pos[2]) - Math.log(a.pos[2])) * q);
  const L = (x: number, y: number) => x + (y - x) * q;
  const drift = 0.012 * Math.sin(t * LOOPF(11)), drift2 = 0.01 * Math.sin(t * LOOPF(7) + 1);
  return { pos: [L(a.pos[0], b.pos[0]) + drift, L(a.pos[1], b.pos[1]) + drift2, h * (1 + 0.02 * Math.sin(t * LOOPF(13)))] as [number, number, number], look: [L(a.look[0], b.look[0]), L(a.look[1], b.look[1])] as [number, number] };
};
const riseAt = (t: number) => Math.min(ramp(t, C.aravalli1 - 0.2, C.aravalli1 + 2.0), 1 - ramp(t, C.agli + 0.2, C.yaad - 0.6));
const hlAt = (t: number) => Math.min(ramp(t, C.desert1 + 0.3, C.rokta + 0.6), 1 - ramp(t, C.agli + 0.4, C.yaad - 0.3));

// ------------------------------------------------------------------ type and cards (the documentary kit)
const Big: React.FC<{ text: React.ReactNode; size: number; color?: string; font?: string }> = ({ text, size, color = '#fff', font = TITLE }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 11)}px ${DARK}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const Tag: React.FC<{ text: React.ReactNode; color?: string; size?: number; font?: string }> = ({ text, color = COL.gold, size = 46, font = UI }) => (
  <div style={{ padding: `${size * 0.1}px ${size * 0.5}px`, background: 'rgba(10,12,16,0.9)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: '#fff', whiteSpace: 'nowrap', boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: Math.min(1, o) }}>{children}</div>;
const DatePlate: React.FC<{ d: string; sub?: string; size?: number }> = ({ d, sub, size = 110 }) => (
  <div style={{ textAlign: 'center' }}>
    <Big text={d} size={size} font={SERIF} color="#FFE9B0" />
    {sub && <div style={{ marginTop: 6, display: 'inline-block', padding: '2px 18px', borderTop: `3px solid ${COL.gold}`, fontFamily: LABEL, fontWeight: 600, fontSize: 26, letterSpacing: 4, color: '#FFE9B0', textShadow: '0 4px 10px rgba(0,0,0,0.7)' }}>{sub}</div>}
  </div>
);
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
/** A pin standing on the terrain (its foot is the projected ground point). */
const Pin: React.FC<{ x: number; y: number; hi: string; en: string; color: string; o: number; size?: number; p?: number }> = ({ x, y, hi, en, color, o, size = 44, p = 1 }) => o <= 0.01 ? null : (
  <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) scale(${p})`, transformOrigin: '50% 100%', opacity: Math.min(1, o), textAlign: 'center' }}>
    <div style={{ padding: '4px 18px 6px', background: 'rgba(8,10,14,0.9)', border: `4px solid ${color}`, borderRadius: 14, boxShadow: `0 0 22px ${color}55` }}>
      <div style={{ fontFamily: UI, fontWeight: 800, fontSize: size, color: '#fff', lineHeight: 1.05, whiteSpace: 'nowrap' }}>{hi}</div>
      <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: size * 0.42, letterSpacing: 3, color, whiteSpace: 'nowrap' }}>{en}</div>
    </div>
    <div style={{ width: 4, height: 64, background: '#fff', margin: '0 auto' }} />
    <div style={{ width: 18, height: 18, borderRadius: 9, background: color, border: '4px solid #fff', margin: '-4px auto 0' }} />
  </div>
);
/** One of the creator's photoreal props, standing on the ground: (x, y) is its foot; w its width in px. A soft
 *  contact shadow sits under it, so it reads as standing on the map. */
const Prop: React.FC<{ k: string; x: number; y: number; w: number; o?: number; p?: number; rot?: number; shadow?: boolean; foot?: number }> = ({ k, x, y, w, o = 1, p = 1, rot = 0, shadow = true, foot = 0.86 }) => {
  if (o <= 0.01 || p <= 0.01 || !ASPECT[k] || w < 4) return null;
  const h = w / ASPECT[k];
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h * foot, width: w, height: h, opacity: Math.min(1, o), transform: `scale(${p}) rotate(${rot}deg)`, transformOrigin: `50% ${foot * 100}%` }}>
      {shadow && <div style={{ position: 'absolute', left: w * 0.08, right: w * 0.08, top: h * foot - h * 0.06, height: h * 0.14, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)' }} />}
      <Img src={staticFile(`aravalli/img/${k}.png`)} style={{ position: 'absolute', inset: 0, width: w, height: h, filter: 'contrast(1.04) saturate(1.05)' }} />
    </div>
  );
};

// ------------------------------------------------------------------ the scenes
const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');
const RIDGE: [number, number][] = [[77.2, 28.6], [76.75, 28.05], [76.2, 27.25], [75.3, 26.6], [74.25, 25.9], [73.65, 24.85], [72.7, 24.6], [72.45, 24.2]];
const Scenes: React.FC<{ t: number; h: Float32Array; cam: { pos: V3; look: V3; fov: number }; W: number; H: number }> = ({ t, h, cam, W, H }) => {
  const w = (a: number, b: number, fi = 0.3, fo = 0.3) => win(t, a, b, fi, fo);
  const at = (lon: number, lat: number, up = 0) => project(cam, W, H, P3(h, lon, lat, up));
  /** Projected width in px of something sizeKm wide standing at lon/lat. */
  const sz = (lon: number, lat: number, sizeKm: number) => { const [, y0] = at(lon, lat, 0), [, y1] = at(lon, lat, sizeKm); return Math.max(0, y0 - y1); };
  const [dx, dy] = at(77.2, 28.6), [rx, ry] = at(77.17, 28.61, 0.3);
  // hook hero: Rashtrapati Bhavan on its rock, full frame (frame 0 and the loop's end)
  const hero = Math.max(1 - ramp(t, C.wahi + 0.1, C.delhi1 + 0.3), ramp(t, C.agli + 1.6, D - 0.3));
  const heroPull = t < 5 ? ramp(t, 0, C.wahi, eo) : 1 - ramp(t, C.agli + 1.6, D - 0.05);
  const ridgeMid = at(75.0, 26.25, 2);
  return (
    <>
      {/* ---------- the hook: the building, then the mountain under it */}
      {hero > 0.01 && (() => {
        const s = 1.35 - 0.35 * heroPull;
        return <AbsoluteFill style={{ opacity: hero }}>
          <div style={{ position: 'absolute', left: 540, top: 1010, transform: `translate(-50%,-50%) scale(${s})` }}>
            <div style={{ position: 'relative', width: 980, height: 980 / ASPECT.r_raisina_rock + 260 }}>
              <div style={{ position: 'absolute', left: 60, right: 60, bottom: 0, height: 120, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.6), rgba(0,0,0,0) 70%)' }} />
              <Img src={staticFile('aravalli/img/r_raisina_rock.png')} style={{ position: 'absolute', left: 0, bottom: 20, width: 980, opacity: cl(0.25 + 1.2 * heroPull) }} />
              <Img src={staticFile('aravalli/img/r_rashtrapati_bhavan.png')} style={{ position: 'absolute', left: 130, bottom: 980 / ASPECT.r_raisina_rock * 0.62, width: 720 }} />
            </div>
          </div>
          {(t < C.pahad1 - 0.1 || t > D - 1.2) && <At x={540} y={330} p={1} o={1}><Tag text={<>राष्ट्रपति भवन · <span style={{ fontFamily: LABEL, fontSize: 28, letterSpacing: 3 }}>RAISINA HILL</span></>} size={48} /></At>}
          {t >= C.pahad1 - 0.1 && t < 3.5 && <At x={540} y={330} p={pop(t, C.pahad1 - 0.05)} o={1}><Tag text={<>एक <span style={{ color: COL.green }}>पहाड़</span> पर</>} color={COL.green} size={64} /></At>}
        </AbsoluteFill>;
      })()}
      {/* ---------- Delhi and the desert */}
      <Pin x={dx} y={dy} hi="दिल्ली" en="DELHI" color={COL.gold} o={w(C.delhi1 - 0.1, C.aravalli1 + 0.4) + w(C.delhi2 - 0.1, C.n700 + 1.0)} size={42} p={pop(t, C.delhi1 - 0.1)} />
      {t > C.desert1 - 0.2 && t < C.aravalli1 + 0.4 && (() => {
        const q = ramp(t, C.desert1, C.rokta + 0.3, eo);
        const [ax, ay] = at(73.6 + 1.2 * q, 27.6 + 0.3 * q);
        return <>
          <Prop k="d_dust_wall" x={ax} y={ay} w={Math.max(320, sz(73.6 + 1.2 * q, 27.6, 140))} o={w(C.desert1 - 0.2, C.aravalli1 + 0.4)} shadow={false} foot={0.7} />
          <At x={540} y={300} p={pop(t, C.desert1)} o={w(C.desert1 - 0.2, C.aravalli1)}><Tag text={<>थार <span style={{ color: COL.sand }}>Desert</span></>} color={COL.sand} size={60} /></At>
          {t > C.rokta - 0.1 && <At x={ridgeMid[0]} y={ridgeMid[1] - 120} o={w(C.rokta - 0.1, C.aravalli1 + 0.4)}><Stamp t={t} t0={C.rokta} hi="रुको!" color={COL.green} rot={-6} size={70} /></At>}
        </>;
      })()}
      {/* ---------- this is the Aravalli */}
      {(() => { const [x, y] = at(74.4, 25.75, 8); return <Pin x={x} y={y} hi="अरावली" en="ARAVALLI" color={COL.green} o={w(C.aravalli1 - 0.1, C.karod + 0.8) + w(C.west - 0.2, C.toot)} size={66} p={pop(t, C.aravalli1)} />; })()}
      {(() => { const [x, y] = at(72.95, 24.45, 2); return <Pin x={x} y={y} hi="गुजरात" en="GUJARAT" color={COL.white} o={w(C.gujarat - 0.1, C.n700 + 1.2)} size={36} p={pop(t, C.gujarat - 0.1)} />; })()}
      {t > C.n700 - 0.3 && t < C.arab && (() => {
        const q = ramp(t, C.n700 - 0.2, C.n700 + 1.2);
        const pts = RIDGE.map(([lo, la]) => at(lo, la, 3));
        let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
        return <>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: w(C.n700 - 0.3, C.arab) }}>
            <path d={d} fill="none" stroke="#fff" strokeWidth={7} strokeDasharray={`${len * q} ${len}`} strokeLinecap="round" />
          </svg>
          <At x={540} y={300} p={pop(t, C.n700 - 0.1)} o={w(C.n700 - 0.3, C.arab)}><Big text={<>~{fmt(700 * eo(q))} km</>} size={150} color="#fff" /></At>
        </>;
      })()}
      {t > C.arab - 0.3 && t < C.rb2 && (() => {
        const hq = ramp(t, C.himalaya - 0.1, C.karod + 0.4, eo);
        const bar = (label: string, en: string, frac: number, col: string, val: string) => (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 48, color: '#fff' }}>{label} <span style={{ fontFamily: LABEL, fontSize: 22, letterSpacing: 3, color: col }}>{en}</span></span>
              <span style={{ fontFamily: TITLE, fontSize: 60, color: col }}>{val}</span>
            </div>
            <div style={{ height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}><div style={{ width: `${frac * 100}%`, minWidth: frac > 0 ? 10 : 0, height: '100%', background: col, borderRadius: 20 }} /></div>
          </div>
        );
        return <At x={540} y={360} p={pop(t, C.arab - 0.2)} o={w(C.arab - 0.3, C.rb2)}>
          <div style={{ width: 880, padding: '16px 28px 24px', background: 'rgba(8,10,14,0.92)', border: `5px solid ${COL.green}`, borderRadius: 26 }}>
            {bar('अरावली', 'ARAVALLI', ramp(t, C.arab - 0.2, C.arab + 0.8, eo), COL.green, '~2 अरब साल')}
            {t > C.himalaya - 0.2 && bar('हिमालय', 'HIMALAYA', 0.025 * hq, '#9EC2FF', '~5 करोड़ साल')}
          </div>
        </At>;
      })()}
      {/* ---------- Raisina: the last tip */}
      {t > C.rb2 - 0.4 && t < C.west + 0.2 && (() => {
        const o = w(C.rb2 - 0.4, C.west + 0.2);
        return <>
          <Prop k="r_rashtrapati_bhavan" x={rx} y={ry} w={Math.max(300, sz(77.17, 28.61, 14))} o={o} p={pop(t, C.rb2 - 0.2)} />
          <Pin x={dx - 10} y={dy - Math.max(60, sz(77.17, 28.61, 5))} hi="रायसीना पहाड़ी" en="RAISINA HILL" color={COL.gold} o={w(C.raisina - 0.1, C.west + 0.2)} size={44} p={pop(t, C.raisina - 0.1)} />
          {t > C.aakhri - 0.2 && <At x={540} y={300} p={pop(t, C.aakhri - 0.1)} o={w(C.aakhri - 0.2, C.west + 0.2)}><Tag text={<>अरावली का <span style={{ color: COL.green }}>आख़िरी सिरा</span></>} color={COL.green} size={56} /></At>}
        </>;
      })()}
      {/* ---------- West, East, the wall */}
      {(() => { const [x, y] = at(71.9, 27.3, 1); return <Pin x={x} y={y} hi="थार Desert" en="WEST" color={COL.sand} o={w(C.west - 0.1, C.toot)} size={46} p={pop(t, C.thar1 - 0.1)} />; })()}
      {(() => { const [x, y] = at(78.4, 26.4, 1); return <Pin x={x} y={y} hi="हरे-भरे मैदान" en="EAST" color="#8FD16A" o={w(C.east - 0.1, C.toot)} size={46} p={pop(t, C.east - 0.1)} />; })()}
      {t > C.deewar1 - 0.3 && t < C.n2018 && <At x={540} y={300} p={pop(t, C.deewar1 - 0.2)} o={w(C.deewar1 - 0.3, C.n2018)}><Tag text={<>एक <span style={{ color: COL.green }}>दीवार</span> की तरह</>} color={COL.green} size={62} /></At>}
      {t > C.toot - 0.2 && t < C.n2018 + 0.2 && <At x={540} y={460} o={w(C.toot - 0.2, C.n2018 + 0.2)}><Stamp t={t} t0={C.toot} hi="टूट रही है" color={COL.red} size={64} /></At>}
      {/* ---------- 2018: the report, 31 of 128 hills */}
      {t > C.n2018 - 0.2 && t < C.n128 && <At x={540} y={290} p={pop(t, C.n2018 - 0.1)} o={w(C.n2018 - 0.2, C.n128)}><DatePlate d="2018" sub="SUPREME COURT · REPORT" size={130} /></At>}
      {t > C.sc1 - 0.3 && t < C.n128 && <At x={540} y={640} p={pop(t, C.sc1 - 0.2)} o={w(C.sc1 - 0.3, C.n128)}><Prop k="c_supreme_court" x={0} y={0} w={560} shadow /></At>}
      {t > C.n128 - 0.3 && t < C.mining && (() => {
        const o = w(C.n128 - 0.3, C.mining);
        const gone = Math.floor(31 * ramp(t, C.n31 - 0.1, C.gayab + 0.4, (x) => x));
        // 31 of 128 fade out: pick them spread through the grid
        const lost = new Set(Array.from({ length: 31 }, (_, i) => (i * 37 + 11) % 128).slice(0, gone));
        return <At x={540} y={500} p={pop(t, C.n128 - 0.2)} o={o}>
          <div style={{ width: 940, padding: '16px 18px 18px', background: 'rgba(8,10,14,0.88)', border: `4px solid ${COL.green}`, borderRadius: 24, textAlign: 'center' }}>
            <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 46, color: '#fff' }}>राजस्थान: <span style={{ color: COL.green }}>128</span> पहाड़ियाँ check · <span style={{ color: COL.red }}>{gone} ग़ायब</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: 4, marginTop: 10 }}>
              {Array.from({ length: 128 }, (_, i) => <Img key={i} src={staticFile(`aravalli/img/${lost.has(i) ? 'h_hill_grey' : 'h_hill_green'}.png`)} style={{ width: 52, height: 52 / ASPECT.h_hill_green, opacity: lost.has(i) ? 0.18 : 1, transform: lost.has(i) ? 'scale(0.7)' : undefined }} />)}
            </div>
            {t > C.n50 - 0.2 && <div style={{ marginTop: 8, fontFamily: TITLE, fontSize: 54, color: COL.gold }}>{fmt(50 * eo(ramp(t, C.n50 - 0.1, C.n50 + 0.8)))} साल में</div>}
          </div>
        </At>;
      })()}
      {/* ---------- mining */}
      {t > C.mining - 0.4 && t < C.n12 + 0.2 && (() => {
        const o = w(C.mining - 0.4, C.n12 + 0.2);
        const [qx, qy] = at(76.35, 27.45, 0.5), [ex, ey] = at(76.27, 27.42, 0.5), [tx, ty] = at(76.45 + 0.05 * ramp(t, C.mining, C.n12), 27.52, 0.5);
        const s = Math.max(260, sz(76.35, 27.45, 30));
        return <>
          <Prop k="m_quarry_pit" x={qx} y={qy} w={s * 1.6} o={o} p={pop(t, C.mining - 0.3)} />
          <Prop k="m_excavator" x={ex} y={ey} w={s * 0.62} o={o} p={pop(t, C.mining)} rot={2 * Math.sin(t * 6)} />
          <Prop k="m_dump_truck" x={tx} y={ty} w={s * 0.55} o={o} p={pop(t, C.mining + 0.25)} />
          <At x={540} y={300} o={o}><Stamp t={t} t0={C.mining} hi="Mining" en="खनन" color={COL.red} size={80} /></At>
        </>;
      })()}
      {/* ---------- 12 gaps, the dust */}
      {t > C.n12 - 0.3 && t < C.n2025a && (() => {
        const o = w(C.n12 - 0.3, C.n2025a);
        const n = Math.round(12 * ramp(t, C.n12 - 0.1, C.darar + 0.6, (x) => x));
        const gaps = Array.from({ length: 12 }, (_, i) => { const f = (i + 0.5) / 12; const seg = f * (RIDGE.length - 1); const k = Math.min(RIDGE.length - 2, Math.floor(seg)); const u = seg - k; return [RIDGE[k][0] + (RIDGE[k + 1][0] - RIDGE[k][0]) * u, RIDGE[k][1] + (RIDGE[k + 1][1] - RIDGE[k][1]) * u] as [number, number]; });
        const dq = ramp(t, C.dhool - 0.4, C.n2025a, (x) => x);
        const [gx, gy] = at(74.6 - 1.4 + 2.6 * dq, 26.2 + 0.3 * dq, 1);
        return <>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
            {gaps.slice(0, n).map(([lo, la], i) => { const [x, y] = at(lo, la, 3); const p = pop(t, C.n12 + i * 0.07); return <g key={i} transform={`translate(${x} ${y}) scale(${p})`}><path d="M-16,-26 L4,-6 L-8,4 L14,28" fill="none" stroke={COL.red} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /><path d="M-16,-26 L4,-6 L-8,4 L14,28" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></g>; })}
          </svg>
          <At x={540} y={300} p={pop(t, C.n12 - 0.1)} o={o}><Tag text={<>करीब <span style={{ color: COL.red }}>{n}</span> बड़ी दरारें</>} color={COL.red} size={62} /></At>
          {t > C.dhool - 0.5 && <Prop k="d_dust_wall" x={gx} y={gy} w={Math.max(200, sz(74.6, 26.2, 120))} o={w(C.dhool - 0.5, C.n2025a)} shadow={false} foot={0.7} />}
          {t > C.dhool - 0.2 && <At x={540} y={460} p={pop(t, C.dhool - 0.1)} o={w(C.dhool - 0.2, C.n2025a)}><Tag text={<>थार की <span style={{ color: COL.sand }}>धूल</span> →</>} color={COL.sand} size={52} /></At>}
        </>;
      })()}
      {/* ---------- 2025: the 100 m definition */}
      {t > C.n2025a - 0.2 && t < C.reports && <At x={540} y={290} p={pop(t, C.n2025a - 0.1)} o={w(C.n2025a - 0.2, C.reports)}><DatePlate d="2025" sub="NEW DEFINITION" size={130} /></At>}
      {t > C.sc2 - 0.3 && t < C.definition + 0.4 && <At x={540} y={680} p={pop(t, C.sc2 - 0.2)} o={w(C.sc2 - 0.3, C.definition + 0.4)}><Prop k="c_supreme_court" x={0} y={0} w={560} /></At>}
      {t > C.definition - 0.3 && t < C.reports && (() => {
        const o = w(C.definition - 0.3, C.reports);
        const lineQ = ramp(t, C.n100a - 0.2, C.n100a + 0.8, eo);
        const hills = [0.55, 1.0, 0.7, 1.25, 0.6, 0.9];
        const below = (s: number) => s < 0.95 && t > C.n100a + 0.5;
        return <At x={540} y={700} p={pop(t, C.definition - 0.2)} o={o}>
          <div style={{ position: 'relative', width: 960, height: 420, background: 'rgba(8,10,14,0.88)', border: `4px solid ${COL.gold}`, borderRadius: 24 }}>
            <div style={{ position: 'absolute', left: 30, right: 30, bottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              {hills.map((s, i) => <Img key={i} src={staticFile(`aravalli/img/${below(s) ? 'h_hill_grey' : 'h_hill_green'}.png`)} style={{ width: 150, height: (150 / ASPECT.h_hill_green) * s * 1.4, objectFit: 'fill', opacity: below(s) ? 0.5 : 1 }} />)}
            </div>
            <div style={{ position: 'absolute', left: 20, width: `${(920 * lineQ)}px`, top: 150, borderTop: '6px dashed #fff' }} />
            <div style={{ position: 'absolute', right: 26, top: 92, fontFamily: TITLE, fontSize: 46, color: '#fff', opacity: lineQ }}>100 मीटर</div>
          </div>
        </At>;
      })()}
      {/* ---------- 12,000 → 1,000 */}
      {t > C.reports - 0.3 && t < C.virodh + 0.2 && (() => {
        const o = w(C.reports - 0.3, C.virodh + 0.2);
        const cut = ramp(t, C.n1000 - 0.4, C.n1000 + 0.9);
        const val = t < C.n1000 - 0.3 ? 12000 * eo(ramp(t, C.n12000 - 0.2, C.n12000 + 0.8)) : 12000 - 11000 * cut;
        return <At x={540} y={430} p={pop(t, C.reports - 0.2)} o={o}>
          <div style={{ width: 920, padding: '14px 18px 18px', background: 'rgba(8,10,14,0.9)', border: `4px solid ${COL.green}`, borderRadius: 24, textAlign: 'center' }}>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 40, color: '#ccc' }}>20 मीटर से ऊँची पहाड़ियाँ</div>
            <div style={{ fontFamily: TITLE, fontSize: 120, color: t > C.n1000 - 0.3 ? COL.green : '#fff', lineHeight: 1.05 }}>{fmt(val)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, marginTop: 4 }}>
              {Array.from({ length: 36 }, (_, i) => { const keep = i % 12 === 5; const g = !keep && cut > 0.05 + (i % 12) / 14; return <Img key={i} src={staticFile(`aravalli/img/${g ? 'h_hill_grey' : 'h_hill_green'}.png`)} style={{ width: 66, height: 66 / ASPECT.h_hill_green, opacity: g ? 0.15 : 1 }} />; })}
            </div>
            {t > C.n100b - 0.2 && <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 44, color: COL.green, marginTop: 6 }}>सिर्फ़ ~1,000 · 100 मीटर से ऊँची</div>}
          </div>
        </At>;
      })()}
      {/* ---------- protest, December 2025: the court holds its own ruling */}
      {t > C.virodh - 0.2 && t < C.agli && <At x={540} y={300} o={w(C.virodh - 0.2, C.agli)}><Stamp t={t} t0={C.virodh} hi="विरोध" en="PROTESTS" color={COL.red} size={74} rot={-8} /></At>}
      {t > C.december - 0.2 && t < C.agli + 0.2 && <At x={540} y={520} p={pop(t, C.december - 0.1)} o={w(C.december - 0.2, C.agli + 0.2)}><DatePlate d="December 2025" size={92} /></At>}
      {t > C.decision - 0.4 && t < C.agli + 0.3 && (() => {
        const d = t - C.decision;
        const slam = d < 0 ? -28 * (1 - ramp(t, C.decision - 0.4, C.decision, (x) => x)) : 4 * Math.exp(-8 * d) * Math.sin(d * 30);
        return <>
          <At x={720} y={860} o={w(C.decision - 0.4, C.agli + 0.3)} rot={slam}><Prop k="c_gavel" x={0} y={0} w={420} /></At>
          {t > C.decision && <At x={380} y={760} o={w(C.decision, C.agli + 0.3)}><Stamp t={t} t0={C.decision + 0.05} hi="रोक" en="ON HOLD" color={COL.gold} size={80} /></At>}
        </>;
      })()}
    </>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.n31 - 0.2, t1: C.gayab + 1.0, from: 2.6 },
  { name: 'B', t0: C.n12000 - 0.2, t1: C.n100b + 0.6, from: 1.8 },
];
const BAND_TOP = 470;
const splitAt = (t: number) => {
  for (const w of NULL_WIN()) {
    const q = Math.min(ramp(t, w.t0 - 0.2, w.t0 + 0.2), 1 - ramp(t, w.t1 - 0.2, w.t1 + 0.2));
    if (q > 0) return { q, w };
  }
  return null;
};
const NullPanel: React.FC<{ t: number; q: number; name: string; t0: number; t1: number; from: number; fps: number }> = ({ t, q, name, t0, t1, from, fps }) => (
  <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d', borderTop: '6px solid #fff' }}>
    <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 300}px`, transform: `scale(${1.12 + 0.04 * ramp(t, t0, t1)})` }}>
      <Sequence from={Math.round((t0 - 0.2) * fps)} durationInFrames={Math.round((t1 - t0 + 0.6) * fps)} layout="none">
        <OffthreadVideo src={staticFile(`aravalli/null/null_ar_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
  </div>
);

// ------------------------------------------------------------------ captions, grade, credits
const Captions: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  if (t < 0.05 || t > D - 0.3) return null;
  let i = -1;
  for (let k = 0; k < T.caps.length; k++) if (T.caps[k][0] <= t) i = k;
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const words = T.caps.slice(g, g + 3);
  const last = words[words.length - 1];
  if (t > last[0] + 1.2 && (!T.caps[g + 3] || t < T.caps[g + 3][0])) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 66, lineHeight: 1.25, color: '#fff', WebkitTextStroke: `10px ${DARK}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
      {words.map(([wt, wd], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0, color: g + k === i ? COL.gold : '#fff' }}>{wd} </span>)}
    </div>
  );
};
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const dust = win(t, C.desert1, C.aravalli1, 0.6, 0.6) + win(t, C.dhool - 0.4, C.n2025a, 0.5, 0.5);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.62) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 16%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.45))' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 20% 45%, rgba(232,176,96,0.45), rgba(232,176,96,0) 60%)', mixBlendMode: 'soft-light', opacity: cl(dust) }} />
    </AbsoluteFill>
  );
};
const CREDIT = '3D terrain: AWS Terrain Tiles (SRTM), heights exaggerated · Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · borders: Natural Earth (India POV) · props: AI illustration';

export const Aravalli: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const h = useHeights();
  const split = splitAt(t);
  if (!h) return <AbsoluteFill style={{ background: '#16181b' }} />;
  const c = camAt(t);
  const cam = { pos: P3(h, c.pos[0], c.pos[1], c.pos[2]), look: P3(h, c.look[0], c.look[1], 0), fov: 50 };
  let sx = 0, sy = 0;
  for (const [t0, a] of [[C.toot, 9], [C.mining, 7], [C.decision, 8], [C.n12, 5]]) { sx += kick(t, t0, a, 31, 8); sy += kick(t, t0 + 0.02, a * 0.7, 27, 8); }
  // depth of field: the map behind the hook's building goes soft
  const hero = Math.max(1 - ramp(t, C.wahi + 0.1, C.delhi1 + 0.3), ramp(t, C.agli + 1.6, D - 0.3));
  return (
    <AbsoluteFill style={{ background: '#16181b', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.04)` }}>
        <AbsoluteFill style={{ filter: hero > 0.02 ? `blur(${(7 * hero).toFixed(1)}px)` : undefined }}>
          <Aravalli3D h={h} pos={cam.pos} look={cam.look} fov={cam.fov} width={width} height={height} rise={riseAt(t)} hl={hlAt(t)} />
        </AbsoluteFill>
        <Grade t={t} />
        <Scenes t={t} h={h} cam={cam} W={width} H={height} />
      </AbsoluteFill>
      {split && <NullPanel t={t} q={split.q} {...split.w} fps={fps} />}
      {captions && <Captions t={t} top={split ? 860 : 1500} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={(t * 98) / D} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
