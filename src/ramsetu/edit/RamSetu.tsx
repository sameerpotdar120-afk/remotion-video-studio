import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { C, CAPS, Cam, DURATION_S, GEO, LOOPF, P, camAt, camSpeed, lineD, merc, ringsD, rollAt, shake, toS } from './cam';
import { ASPECT } from './assets';
import { LABEL, SERIF, TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';
import { Cut, Slab } from './Studio';

export const RS_DURATION_S = DURATION_S;
const AUDIO = 'ramsetu/audio/mix.wav';
const INK = '#1A0E04';
const DARK = '#0B1830';
const COL = { gold: '#FFC21A', saffron: '#FF8A1E', sky: '#8FD3FF', red: '#FF3B30', blue: '#2E8BFF', laser: '#5CFF8A' };
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));
const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const has = (k: string) => !!ASPECT[k];

// ------------------------------------------------------------------ type
export const Big: React.FC<{ text: React.ReactNode; size: number; color?: string; font?: string; ink?: string }> = ({ text, size, color = '#fff', font = TITLE, ink = DARK }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 11)}px ${ink}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const Tag: React.FC<{ text: React.ReactNode; color?: string; size?: number; font?: string }> = ({ text, color = COL.gold, size = 46, font = UI }) => (
  <div style={{ padding: `${size * 0.1}px ${size * 0.5}px`, background: 'rgba(10,15,22,0.88)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: '#fff', whiteSpace: 'nowrap', boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
export const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: o }}>{children}</div>;
const MapLabel: React.FC<{ text: string; color?: string; size?: number }> = ({ text, color = '#FFE7A0', size = 50 }) => (
  <div style={{ textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.1, color, WebkitTextStroke: `${size / 7}px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 6px 14px rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>
    {text}<div style={{ fontSize: size * 0.8, lineHeight: 0.9 }}>↓</div>
  </div>
);
/** A place on the map: a pulsing pin on the exact point and a name plate (Hindi, with the English name below). */
const Place: React.FC<{ t: number; t0: number; x: number; y: number; hi: string; en: string; color?: string; up?: boolean; o?: number }> = ({ t, t0, x, y, hi, en, color = COL.gold, up = true, o = 1 }) => {
  const p = pop(t, t0, 10, 200);
  if (p <= 0 || o <= 0) return null;
  const ph = ((t - t0) * 1.1) % 1;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: o }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <circle cx={x} cy={y} r={14 + 46 * ph} fill="none" stroke={color} strokeWidth={5} opacity={(1 - ph) * p} />
        <circle cx={x} cy={y} r={13 * p} fill={color} stroke="#fff" strokeWidth={5} />
        <line x1={x} y1={y + (up ? -16 : 16)} x2={x} y2={y + (up ? -78 : 78) * p} stroke="#fff" strokeWidth={4} />
      </svg>
      <div style={{ position: 'absolute', left: x, top: y + (up ? -84 : 84), transform: `translate(-50%, ${up ? '-100%' : '0'}) scale(${p})`, transformOrigin: up ? '50% 100%' : '50% 0', textAlign: 'center', padding: '6px 22px 8px', background: 'rgba(8,12,20,0.88)', border: `5px solid ${color}`, borderRadius: 18, boxShadow: `0 0 26px ${color}66, 0 10px 18px rgba(0,0,0,0.5)` }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 56, lineHeight: 1.05, color: '#fff', whiteSpace: 'nowrap' }}>{hi}</div>
        <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: 24, letterSpacing: 3, color, whiteSpace: 'nowrap' }}>{en}</div>
      </div>
    </div>
  );
};
/** An asset if it has arrived, else a simple placeholder card (so a missing image never breaks a render). */
const Img: React.FC<{ k: string; w: number; label?: string }> = ({ k, w, label }) => has(k) ? <Cut k={k} w={w} /> : (
  <div style={{ width: w, height: w * 0.7, borderRadius: 24, background: 'rgba(255,240,210,0.15)', border: '4px dashed rgba(255,240,210,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LABEL, fontSize: 30, color: '#FFE7C0' }}>{label ?? k}</div>
);

// ------------------------------------------------------------------ geometry helpers
/** A point a fraction f along a screen polyline. */
const along = (pts: P[], f: number): [number, number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const tot = seg.reduce((a, b) => a + b, 0);
  let d = clamp01(f) * tot;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const q = seg[i] ? Math.min(1, d / seg[i]) : 0;
      const a = pts[i], b = pts[i + 1];
      return [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q, Math.atan2(b[1] - a[1], b[0] - a[0])];
    }
    d -= seg[i];
  }
  return [pts[0][0], pts[0][1], 0];
};
const plen = (pts: P[]) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

// ------------------------------------------------------------------ the map layer: highlights, the Setu, footprints
const MapVectors: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const S = GEO.setu.map((p) => toS(c, p));
  const L = plen(S);
  const far = c.mpp > 600;
  // India (red) and Sri Lanka (blue) rise at "Bharat ka aakhri sira" (wide), Pamban (yellow-red) and Mannar (blue) up close
  const indiaG = win(t, C.ye - 0.2, C.dhanush1 + 0.4, 0.4, 0.5) + win(t, C.angrez - 0.1, C.rahega + 0.3, 0.4, 0.5);
  const slG = win(t, C.mannar - 0.2, C.aastha + 0.3, 0.4, 0.5) + win(t, C.angrez + 0.2, C.rahega + 0.3, 0.4, 0.5) + 0.85 * win(t, C.isro2 - 0.2, C.vigyan, 0.4, 0.5);
  const pambanG = win(t, C.dhanush1 - 0.3, C.aastha + 0.3, 0.4, 0.5) + 0.85 * win(t, C.isro2 - 0.2, C.vigyan, 0.4, 0.5) + 0.8 * win(t, C.pamban - 0.3, C.sarkar + 0.3, 0.4, 0.5);
  // the gold Setu line: drawn Dhanushkodi→Mannar on "yahin se… ek lakeer", glowing in the faith, ISRO and ending beats
  const draw = ramp(t, C.yahin, C.lakeer + 0.6, inOut);
  const lineO = Math.max(win(t, C.yahin - 0.1, C.aastha + 0.6, 0.2, 0.6), win(t, C.n2024, C.vigyan + 0.2, 0.4, 0.4), win(t, C.jo - 0.2, C.par2 + 0.2, 0.4, 0.4), win(t, C.setu_last - 0.2, DURATION_S - 1.4, 0.5, 1.0));
  const broken = ramp(t, C.nok - 0.05, C.nok + 0.4, easeOut) * (1 - ramp(t, C.yahin - 0.4, C.yahin, linear));
  // footprints walking toward Sri Lanka (frame 0) — they wash away in the storm; and again at the very end (no prints at the seam)
  const walk = ramp(t, 0.05, C.toofan + 0.4, linear);
  const wash = ramp(t, C.toofan, C.toofan + 1.2, linear);
  const nPrints = 26;
  const [cx, cy] = toS(c, GEO.places.dhanushkodi);
  const [mx, my] = toS(c, GEO.places.talaimannar);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <filter id="rsglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8" /></filter>
        <linearGradient id="setugold" x1="0" x2="1"><stop offset="0" stopColor="#FFE9A0" /><stop offset="0.5" stopColor={COL.gold} /><stop offset="1" stopColor="#FFB020" /></linearGradient>
      </defs>
      {far && <path d={GEO.borders.map((l) => lineD(c, l)).join('')} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.3} />}
      {far && <Slab id="in" t={t} d={ringsD(c, GEO.countries.India)} hue="red" g={clamp01(indiaG)} depth={18} cx={toS(c, merc(79, 21))[0]} cy={toS(c, merc(79, 21))[1]} s={0.97 + 0.05 * pop(t, C.ye - 0.1, 9, 190)} />}
      {far && <Slab id="sl" t={t} d={ringsD(c, GEO.countries.SriLanka)} hue="blue" g={clamp01(slG)} depth={12} cx={toS(c, merc(80.7, 7.9))[0]} cy={toS(c, merc(80.7, 7.9))[1]} />}
      {!far && <Slab id="pb" t={t} d={ringsD(c, GEO.pamban_sat)} hue="red" g={clamp01(pambanG)} depth={14} cx={cx - 300} cy={cy - 300} s={0.98 + 0.03 * pop(t, C.dhanush1 - 0.2, 9, 190)} />}
      {!far && <Slab id="mn" t={t} d={ringsD(c, GEO.mannar_sat)} hue="blue" g={clamp01(slG)} depth={12} cx={mx + 200} cy={my + 100} s={0.98 + 0.03 * pop(t, C.mannar - 0.1, 9, 190)} />}
      {lineO > 0.01 && draw > 0 && (() => {
        const d = lineD(c, GEO.setu);
        const vis = L * draw;
        const pulse = 0.75 + 0.25 * Math.sin(t * LOOPF(60));
        return (
          <g opacity={lineO}>
            <path d={d} fill="none" stroke={COL.gold} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" opacity={0.45 * pulse} filter="url(#rsglow)" strokeDasharray={`${vis} ${L + 10}`} />
            <path d={d} fill="none" stroke="url(#setugold)" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={broken > 0 ? `${vis * 0.12} ${14 + 30 * broken} ${vis}` : `${vis} ${L + 10}`} />
            <path d={d} fill="none" stroke="#FFF8E0" strokeWidth={3} strokeLinecap="round" strokeDasharray={`${vis} ${L + 10}`} opacity={0.9} />
            {(() => { const [x, y] = along(S, draw); return draw < 0.999 ? <circle cx={x} cy={y} r={14} fill="#fff" filter="url(#rsglow)" /> : null; })()}
          </g>
        );
      })()}
      {t < C.toofan + 1.3 && Array.from({ length: nPrints }, (_, i) => {
        const f = 0.02 + (i / nPrints) * 0.96;
        if (f > walk) return null;
        const [x, y, a] = along(S, f);
        const side = i % 2 ? 1 : -1;
        const o = (1 - wash * (0.6 + 0.4 * rnd(i, 3))) * clamp01((walk - f) * 12);
        if (o <= 0) return null;
        const ox = -Math.sin(a) * 9 * side, oy = Math.cos(a) * 9 * side;
        return <ellipse key={i} cx={x + ox} cy={y + oy} rx={9} ry={5} transform={`rotate(${(a * 180) / Math.PI} ${x + ox} ${y + oy})`} fill="#FFF3C4" opacity={0.85 * o} />;
      })}
      {t > DURATION_S - 3.4 && Array.from({ length: 6 }, (_, i) => {
        const f = 0.02 + (i / nPrints) * 0.96;
        const o = win(t, DURATION_S - 3.4 + i * 0.25, DURATION_S - 0.3, 0.3, 0.6);
        if (o <= 0) return null;
        const [x, y, a] = along(S, f);
        const side = i % 2 ? 1 : -1;
        const ox = -Math.sin(a) * 9 * side, oy = Math.cos(a) * 9 * side;
        return <ellipse key={`e${i}`} cx={x + ox} cy={y + oy} rx={9} ry={5} transform={`rotate(${(a * 180) / Math.PI} ${x + ox} ${y + oy})`} fill="#FFF3C4" opacity={0.85 * o} />;
      })}
      {broken > 0 && t < C.yahin && <circle cx={cx} cy={cy} r={20 + 220 * ((t - C.nok) % 1.2)} fill="none" stroke="#FFE9A0" strokeWidth={6} opacity={broken * (1 - ((t - C.nok) % 1.2) / 1.2)} />}
    </svg>
  );
};

// ------------------------------------------------------------------ weather and grades
const Rain: React.FC<{ t: number; o: number; slant?: number }> = ({ t, o, slant = 0.25 }) => o <= 0 ? null : (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
    {Array.from({ length: 90 }, (_, i) => {
      const sp = 1.4 + rnd(i, 1), y = ((t * sp * 1000 + rnd(i, 2) * 2400) % 2400) - 240, x = rnd(i, 3) * 1300 - 110 - y * slant;
      return <line key={i} x1={x} y1={y} x2={x + 60 * slant * 2} y2={y + 120} stroke="#CFE4FF" strokeWidth={2.4} opacity={0.35 + 0.3 * rnd(i, 4)} />;
    })}
  </svg>
);
const Grades: React.FC<{ t: number }> = ({ t }) => {
  const storm = win(t, C.toofan - 0.3, C.ye + 0.3, 0.4, 0.4);
  const faith = win(t, C.aastha - 0.4, C.angrez, 0.8, 0.6);
  const night = win(t, C.par2 - 0.2, C.sarkar + 0.4, 0.8, 0.9);
  const dawn = win(t, C.sarkar, C.mita, 0.8, 0.8);
  const flash = (t > C.toofan && t < C.ye) || (t > C.chakravat - 0.5 && t < C.sarkar) ? Math.max(0, Math.sin(t * 7.3) * Math.sin(t * 3.1) - 0.82) * 5 : 0;
  return (
    <>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0A1A33, #142844)', mixBlendMode: 'multiply', opacity: storm * 0.55 + night * 0.72 }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,170,60,0.55), rgba(255,110,20,0.15) 60%, rgba(120,40,0,0.3))', mixBlendMode: 'soft-light', opacity: faith }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(255,170,120,0.35), rgba(255,210,170,0.1))', mixBlendMode: 'soft-light', opacity: dawn }} />
      <AbsoluteFill style={{ background: '#DDE8FF', opacity: clamp01(flash) * 0.35, mixBlendMode: 'screen' }} />
      <Rain t={t} o={storm * 0.9 + night * win(t, C.chakravat - 0.6, C.sarkar, 0.4, 0.6)} />
    </>
  );
};
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 38 * Math.sin(t * LOOPF(3) + 1.1), ly = 30 + 22 * Math.sin(t * LOOPF(2) + 0.4);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,92,118,0.3), rgba(0,70,96,0.15) 45%, rgba(0,60,90,0.28))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,196,128,0.28), rgba(255,140,70,0.06) 26%, rgba(255,120,60,0) 46%)`, mixBlendMode: 'screen', opacity: 0.5 + 0.2 * Math.sin(t * LOOPF(8)) }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 56%, rgba(0,4,12,0.42) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.26), rgba(0,0,0,0) 18%, rgba(0,0,0,0) 76%, rgba(0,6,12,0.4))' }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the scenes (props, titles, counters)
const fmtIN = (n: number) => Math.round(n).toLocaleString('en-IN');
const Scenes: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const dk = toS(c, GEO.places.dhanushkodi), tm = toS(c, GEO.places.talaimannar);
  const rm = toS(c, GEO.places.rameswaram), palk = toS(c, GEO.places.palk), gulf = toS(c, GEO.places.gulf), pb = toS(c, merc(79.37, 9.24)), pbw = toS(c, merc(79.26, 9.21));
  const S = GEO.setu.map((p) => toS(c, p));
  const rail = GEO.rail.map((p) => toS(c, p));
  const w = (a: number, b: number, fi = 0.25, fo = 0.3) => win(t, a, b, fi, fo);
  // the storm sweeping across (hook)
  const stormX = -500 + 2100 * ramp(t, C.toofan - 0.3, C.ye, linear);
  // the faith beat: the Vanar Sena wide shot slides across, Nal, floating stones with "राम"
  const vs = w(C.aastha - 0.2, C.valmiki + 0.6, 0.4, 0.4);
  const stones = Array.from({ length: 7 }, (_, i) => along(S, 0.08 + i * 0.13));
  const day = Math.min(5, Math.max(1, Math.ceil(5 * ramp(t, C.n5din - 0.3, C.n5din + 1.4, linear))));
  // ISRO
  const sa = ramp(t, C.n2024 - 0.6, C.lambai, linear);
  const satX = -200 + 1480 * sa, satY = 420 + Math.sin(sa * Math.PI) * -60;
  const scan = t > C.isro - 0.2 && t < C.lambai + 0.3;
  const cut = w(C.n8m - 0.4, C.isro2 + 0.4, 0.4, 0.4);
  // 1964: train along the rail from Rameswaram toward Dhanushkodi; the wave takes it
  const trainQ = ramp(t, C.n115 - 0.8, C.train + 0.5, linear);
  const [tx, ty, ta] = along(rail, 0.35 + 0.5 * trainQ);
  const waveQ = ramp(t, C.train - 0.2, C.train + 1.6, inOut);
  const trainO = w(C.n115 - 0.9, C.train + 0.9, 0.3, 0.5);
  return (
    <>
      {/* hook: frame 0 (and the loop's end) names the two shores */}
      {(() => {
        const o = clamp01(1 - ramp(t, C.n1480 - 0.6, C.n1480 - 0.1, linear) + ramp(t, DURATION_S - 1.8, DURATION_S - 0.6, linear));
        if (o <= 0.01) return null;
        return (
          <>
            <At x={Math.max(150, dk[0] + 40)} y={dk[1] - 150} o={o}><Tag text="← भारत" size={54} color={COL.red} /></At>
            <At x={Math.min(900, tm[0] - 40)} y={tm[1] + 150} o={o}><Tag text="श्रीलंका →" size={54} color={COL.blue} /></At>
          </>
        );
      })()}
      {t > C.n1480 - 0.3 && t < C.toofan + 0.6 && <At x={540} y={330} p={pop(t, C.n1480 - 0.1, 9, 220)} o={w(C.n1480 - 0.2, C.toofan + 0.6)} rot={-3}><Big text="1480" size={180} font={SERIF} color="#FFE9B0" ink={INK} /></At>}
      {t > C.ram0 + 3.0 && t < C.toofan + 0.4 && <At x={270} y={600} p={pop(t, C.ram0 + 3.1, 10, 170)} o={w(C.ram0 + 3.0, C.toofan + 0.4)} rot={-5}><div style={{ textAlign: 'center' }}><Img k="t_rameswaram_temple" w={400} /><Tag text="रामेश्वरम मंदिर" size={40} color={COL.saffron} /></div></At>}
      {t > C.n1480 - 0.6 && t < C.toofan + 0.6 && <At x={780} y={600} p={pop(t, C.n1480 - 0.4, 10, 180)} o={w(C.n1480 - 0.5, C.toofan + 0.6)} rot={8}><Img k="p_palm_leaf" w={380} label="palm-leaf record" /></At>}
      {t > C.toofan - 0.4 && t < C.ye + 0.2 && <At x={stormX} y={520} o={w(C.toofan - 0.4, C.ye + 0.2, 0.3, 0.4)}><Cut k="l_storm_cloud" w={780} /></At>}
      {t > C.toofan + 0.3 && t < C.ye && has('c_giant_wave') && <At x={1300 - 1700 * ramp(t, C.toofan + 0.3, C.n1964 + 0.8, inOut)} y={1150} o={w(C.toofan + 0.3, C.ye)}><Cut k="c_giant_wave" w={900} /></At>}
      {t > C.n1964 - 0.2 && t < C.ye && <At x={540} y={330} p={pop(t, C.n1964 - 0.1, 8, 240)} o={w(C.n1964 - 0.2, C.ye)} rot={4}><Big text="1964" size={180} font={SERIF} color="#FFB0A0" ink={INK} /></At>}
      {t > C.n1964 - 0.2 && t < C.ye && has('c_cyclone') && <At x={820} y={640} p={pop(t, C.n1964, 10, 180)} o={w(C.n1964 - 0.2, C.ye) * 0.9} rot={-t * 90}><Cut k="c_cyclone" w={360} /></At>}
      {t > C.kaise - 0.2 && t < C.ye + 0.4 && <At x={540} y={1180} p={pop(t, C.kaise - 0.1, 8, 240)} o={w(C.kaise - 0.2, C.ye + 0.4)} rot={6}><Big text="?" size={300} color={COL.gold} /></At>}
      {/* Dhanushkodi, the bow */}
      {t > C.dhanush1 - 0.3 && t < C.aastha + 0.3 && <Place t={t} t0={C.dhanush1 - 0.2} x={dk[0]} y={dk[1]} hi="धनुषकोडी" en="DHANUSHKODI" color={COL.red} o={w(C.dhanush1 - 0.3, C.aastha + 0.3)} />}
      {t > C.matlab - 0.2 && t < C.nok - 0.6 && <At x={540} y={330} p={pop(t, C.matlab - 0.1, 10, 200)} o={w(C.matlab - 0.2, C.nok - 0.6)}><Big text={<>धनुष + कोडी</>} size={120} font={UI} color={COL.gold} /><div style={{ textAlign: 'center' }}><Big text="= धनुष का सिरा" size={70} font={UI} /></div></At>}
      {t > C.matlab + 1.4 && t < C.yahin && <At x={300} y={1180} p={pop(t, C.matlab + 1.5, 10, 160)} o={w(C.matlab + 1.4, C.yahin, 0.4, 0.4)}><Img k="f_shri_ram" w={460} label="Shri Ram" /></At>}
      {t > C.nok - 1.2 && t < C.yahin && (() => {
        const q = ramp(t, C.nok - 1.0, C.nok, inOut);
        return <At x={760 + (dk[0] - 760) * q} y={1020 + (dk[1] - 140 - 1020) * q} p={pop(t, C.nok - 1.1, 10, 170)} o={w(C.nok - 1.2, C.yahin, 0.3, 0.4)} rot={-30 + 40 * q}><Img k="f_golden_bow" w={300} label="golden bow" /></At>;
      })()}
      {/* the two bays, Ram Setu */}
      {t > C.palk - 0.2 && t < C.aastha + 0.3 && <At x={palk[0]} y={palk[1]} p={pop(t, C.palk - 0.1, 10, 200)} o={w(C.palk - 0.2, C.aastha + 0.3)}><div style={{ textAlign: 'center' }}><Big text="पाक की खाड़ी" size={64} font={UI} color={COL.sky} /><div style={{ fontFamily: LABEL, fontSize: 24, letterSpacing: 4, color: '#DDF1FF' }}>PALK BAY</div></div></At>}
      {t > C.mannar2 - 0.2 && t < C.aastha + 0.3 && <At x={gulf[0]} y={gulf[1]} p={pop(t, C.mannar2 - 0.1, 10, 200)} o={w(C.mannar2 - 0.2, C.aastha + 0.3)}><div style={{ textAlign: 'center' }}><Big text="मन्नार की खाड़ी" size={64} font={UI} color={COL.sky} /><div style={{ fontFamily: LABEL, fontSize: 24, letterSpacing: 4, color: '#DDF1FF' }}>GULF OF MANNAR</div></div></At>}
      {t > C.lakeer - 0.6 && t < C.aastha + 0.3 && <Place t={t} t0={C.lakeer - 0.5} x={rm[0]} y={rm[1]} hi="रामेश्वरम" en="RAMESWARAM" color={COL.saffron} o={w(C.lakeer - 0.6, C.aastha + 0.3)} />}
      {t > C.lakeer - 0.2 && t < C.aastha + 0.3 && <At x={pbw[0]} y={pbw[1] + 70} p={pop(t, C.lakeer - 0.1, 10, 200)} o={w(C.lakeer - 0.2, C.aastha + 0.3)}><Tag text="पंबन द्वीप" size={40} color={COL.red} /></At>}
      {t > C.beech - 0.1 && t < C.aastha + 0.4 && <At x={540} y={320} p={pop(t, C.beech, 9, 210)} o={w(C.beech - 0.1, C.aastha + 0.4)}><Big text="राम सेतु" size={170} font={UI} color={COL.saffron} /></At>}
      {t > C.mannar - 0.2 && t < C.aastha + 0.3 && <Place t={t} t0={C.mannar - 0.1} x={tm[0]} y={tm[1]} hi="तलाईमन्नार" en="TALAIMANNAR · SRI LANKA" color={COL.blue} up={false} o={w(C.mannar - 0.2, C.aastha + 0.3)} />}
      {/* faith */}
      {vs > 0 && <At x={540 + 80 * Math.sin(t * 0.5)} y={1150} p={pop(t, C.aastha - 0.1, 11, 160)} o={vs}><Img k="f_vanar_sena" w={1000} label="Vanar Sena" /></At>}
      {t > C.nal - 0.3 && t < C.tairne + 1.2 && <At x={330} y={1180} p={pop(t, C.nal - 0.2, 10, 180)} o={w(C.nal - 0.3, C.tairne + 1.2)}><Img k="f_nal" w={480} label="Nal" /></At>}
      {t > C.nal - 0.2 && t < C.tairne + 1.2 && <At x={330} y={880} p={pop(t, C.nal - 0.1, 10, 200)} o={w(C.nal - 0.2, C.tairne + 1.2)}><Tag text="नल" size={64} color={COL.saffron} /></At>}
      {t > C.vishwa - 0.2 && t < C.tairne && <At x={540} y={330} p={pop(t, C.vishwa - 0.1, 10, 200)} o={w(C.vishwa - 0.2, C.tairne)}><Big text="विश्वकर्मा के पुत्र" size={90} font={UI} color={COL.gold} /></At>}
      {t > C.tairne - 0.4 && t < C.angrez + 0.3 && stones.map(([x, y], i) => {
        const p = pop(t, C.tairne - 0.3 + i * 0.12, 10, 190);
        const bob = Math.sin(t * 2.4 + i) * 6;
        const ramO = ramp(t, C.ramnaam - 0.6 + i * 0.08, C.ramnaam + 0.1 + i * 0.08, easeOut);
        return (
          <At key={i} x={x} y={y - 30 + bob} p={p * 0.95} o={w(C.tairne - 0.4, C.angrez + 0.3)}>
            <div style={{ position: 'relative' }}>
              {has('f_floating_stone') ? <Cut k="f_floating_stone" w={215} /> : <div style={{ width: 150, height: 90, borderRadius: '45% 50% 40% 55%', background: 'radial-gradient(circle at 40% 35%, #A9A39B, #6E6860 60%, #4A453F)', boxShadow: '0 12px 16px rgba(0,0,0,0.45)' }} />}
              <div style={{ position: 'absolute', left: 0, right: 0, top: '22%', textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 64, color: COL.saffron, opacity: ramO, textShadow: `0 0 ${18 * ramO}px #FFB347, 0 2px 0 #5A2A00` }}>राम</div>
            </div>
          </At>
        );
      })}
      {t > C.n5din - 0.2 && t < C.angrez && <At x={540} y={330} p={pop(t, C.n5din - 0.1, 10, 200)} o={w(C.n5din - 0.2, C.angrez)}><Big text={<>दिन {day}</>} size={140} font={UI} color={COL.saffron} /></At>}
      {t > C.sita - 0.3 && t < C.angrez + 0.2 && <At x={800} y={1180} p={pop(t, C.sita - 0.2, 11, 160)} o={w(C.sita - 0.3, C.angrez + 0.2, 0.4, 0.4)}><Img k="f_sita_vatika" w={460} label="Sita Maa" /></At>}
      {/* Adam's Bridge → राम सेतु */}
      {t > C.angrez - 0.2 && t < C.rahega + 0.4 && (() => {
        const stamp = pop(t, C.hamare + 0.6, 8, 240);
        return (
          <At x={540} y={360} p={pop(t, C.angrez - 0.1, 11, 170)} o={w(C.angrez - 0.2, C.rahega + 0.4)} rot={-2}>
            <div style={{ position: 'relative', width: 820, padding: '26px 30px', background: 'linear-gradient(160deg, #F2E3C2, #D9C29A)', borderRadius: 14, boxShadow: '0 18px 30px rgba(0,0,0,0.5)', border: '6px double #6B4A22' }}>
              <div style={{ fontFamily: SERIF, fontSize: 30, color: '#6B4A22', textAlign: 'center', letterSpacing: 4 }}>CHART OF THE GULF OF MANAAR · 18—</div>
              <div style={{ fontFamily: SERIF, fontSize: 92, color: '#3A2410', textAlign: 'center', marginTop: 6, textDecoration: stamp > 0.3 ? 'line-through' : 'none', textDecorationColor: '#C1121F', textDecorationThickness: 8 }}>Adam's Bridge</div>
              {stamp > 0 && <div style={{ position: 'absolute', left: '50%', top: '58%', transform: `translate(-50%,-50%) rotate(-10deg) scale(${stamp})`, padding: '4px 34px', border: `10px solid ${COL.saffron}`, borderRadius: 20, fontFamily: UI, fontWeight: 800, fontSize: 110, color: COL.saffron, background: 'rgba(255,248,230,0.85)' }}>राम सेतु</div>}
            </div>
          </At>
        );
      })()}
      {/* ISRO */}
      {t > C.n2024 - 0.6 && t < C.lambai + 0.4 && <At x={satX} y={satY} p={pop(t, C.n2024 - 0.5, 10, 200)} o={w(C.n2024 - 0.6, C.lambai + 0.4)} rot={-8}><Cut k="l_satellite" w={420} /></At>}
      {scan && (() => {
        const f = ((t - C.isro) * 0.35) % 1;
        const [x, y] = along(S, f);
        return (
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: w(C.isro - 0.2, C.lambai + 0.3) }}>
            <path d={`M${satX},${satY + 30} L${x - 26},${y} L${x + 26},${y}Z`} fill={COL.laser} opacity={0.22} />
            <line x1={satX} y1={satY + 30} x2={x} y2={y} stroke={COL.laser} strokeWidth={4} />
            <circle cx={x} cy={y} r={18} fill="none" stroke={COL.laser} strokeWidth={5} />
            {Array.from({ length: 22 }, (_, i) => { const g = i / 22; if (g > f) return null; const [px, py] = along(S, g); return <circle key={i} cx={px} cy={py} r={5} fill={COL.laser} opacity={0.85} />; })}
          </svg>
        );
      })()}
      {t > C.n2024 - 0.2 && t < C.lambai && <At x={540} y={330} p={pop(t, C.n2024 - 0.1, 10, 200)} o={w(C.n2024 - 0.2, C.lambai)}><Tag text={<>2024 · <span style={{ color: COL.laser }}>ISRO + NASA ICESat-2</span></>} size={52} font={TITLE} color={COL.laser} /></At>}
      {t > C.n48 - 0.2 && t < C.n9998 && (() => {
        const cross = ramp(t, C.n48 + 0.2, C.n48 + 0.6, inOut);
        return (
          <>
            <At x={330} y={330} p={pop(t, C.n48 - 0.1, 10, 200)} o={w(C.n48 - 0.2, C.n9998)} rot={-6}>
              <div style={{ position: 'relative' }}><Big text="48 km" size={120} color="#BBB" /><svg width={360} height={140} viewBox="0 0 360 140" style={{ position: 'absolute', left: -10, top: 0 }}><path d={`M10 120 L${10 + 330 * cross} ${120 - 110 * cross}`} stroke={COL.red} strokeWidth={18} strokeLinecap="round" /></svg></div>
            </At>
            {t > C.n29 - 0.2 && <At x={760} y={340} p={pop(t, C.n29 - 0.1, 8, 240)} o={w(C.n29 - 0.2, C.n9998)} rot={4}><div style={{ padding: '0 26px', border: `10px solid ${COL.gold}`, borderRadius: 20, background: 'rgba(5,10,25,0.6)' }}><Big text="29 km" size={130} color={COL.gold} /></div></At>}
          </>
        );
      })()}
      {t > C.n9998 - 0.2 && t < C.choona && <At x={540} y={330} p={pop(t, C.n9998 - 0.1, 10, 200)} o={w(C.n9998 - 0.2, C.choona)}><Big text={<>{(99.98 * easeOut(ramp(t, C.n9998 - 0.1, C.n9998 + 1.0, linear))).toFixed(2)}% पानी के नीचे</>} size={88} font={UI} color={COL.sky} /></At>}
      {cut > 0 && (() => {
        const rise = easeOut(ramp(t, C.n8m - 0.3, C.n8m + 0.8, linear));
        return (
          <At x={540} y={1240} o={cut} p={0.9 + 0.1 * cut}>
            <svg width={940} height={420} viewBox="0 0 940 420" style={{ filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.5))' }}>
              <defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3FB6D6" stopOpacity="0.85" /><stop offset="1" stopColor="#0B4A6E" stopOpacity="0.95" /></linearGradient></defs>
              <rect x={0} y={0} width={940} height={420} rx={26} fill="rgba(5,12,24,0.75)" stroke="#fff" strokeWidth={4} />
              <rect x={20} y={70} width={900} height={330} rx={12} fill="url(#sea)" />
              <path d="M20,90 q40,-12 80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0" stroke="#E8FFFF" strokeWidth={4} fill="none" opacity={0.8} />
              <path d={`M20,400 L120,${400 - 40 * rise} C260,${400 - 250 * rise} 680,${400 - 250 * rise} 820,${400 - 40 * rise} L920,400Z`} fill="#D9C08A" stroke="#7A5A2A" strokeWidth={4} />
              <path d={`M200,${400 - 160 * rise} C330,${400 - 230 * rise} 610,${400 - 230 * rise} 740,${400 - 160 * rise}`} stroke="#B9A27A" strokeWidth={10} fill="none" strokeDasharray="22 12" opacity={0.7} />
              <line x1={860} y1={400} x2={860} y2={400 - 210 * rise} stroke={COL.gold} strokeWidth={6} />
              <text x={850} y={400 - 220 * rise} textAnchor="end" fontFamily="sans-serif" fontWeight={800} fontSize={34} fill={COL.gold}>~8 मीटर</text>
              <text x={470} y={52} textAnchor="middle" fontFamily="sans-serif" fontWeight={700} fontSize={30} fill="#fff">समुद्र तल से ऊपर उठा सेतु (Section)</text>
              {t > C.choona - 0.1 && <text x={470} y={400 - 120 * rise} textAnchor="middle" fontFamily="sans-serif" fontWeight={800} fontSize={34} fill="#3A2410" opacity={ramp(t, C.choona - 0.1, C.choona + 0.3, linear)}>चूना-पत्थर + रेत</text>}
            </svg>
          </At>
        );
      })()}
      {/* science vs faith */}
      {t > C.vigyan - 0.3 && t < C.par2 + 0.2 && (() => {
        const o = w(C.vigyan - 0.3, C.par2 + 0.2, 0.3, 0.4);
        const faithUp = ramp(t, C.aastha2 - 0.2, C.aastha2 + 0.5, inOut);
        return (
          <>
            <At x={290} y={300} o={o} p={pop(t, C.vigyan - 0.2, 10, 200)}><div style={{ textAlign: 'center' }}><Tag text="विज्ञान" size={60} color={COL.sky} /><div style={{ marginTop: 10 }}><Cut k="l_satellite" w={330} /></div></div></At>
            <At x={790} y={300} o={o * (0.35 + 0.65 * faithUp)} p={(0.9 + 0.1 * faithUp) * pop(t, C.vigyan - 0.1, 10, 200)}><div style={{ textAlign: 'center' }}><Tag text="आस्था" size={60} color={COL.saffron} /><div style={{ marginTop: 10, position: 'relative' }}><div style={{ position: 'absolute', inset: -40, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,190,90,${0.5 * faithUp}), rgba(255,140,40,0) 70%)` }} /><Cut k="d_diya" w={260} /></div></div></At>
            {t > C.jo - 0.2 && <At x={540} y={1200} p={pop(t, C.jo - 0.1, 10, 180)} o={w(C.jo - 0.2, C.par2 + 0.2)}><Big text="राम नाम" size={150} font={UI} color={COL.saffron} /></At>}
          </>
        );
      })()}
      {/* 1964 */}
      {t > C.n22 - 0.2 && t < C.n115 && <At x={540} y={330} p={pop(t, C.n22 - 0.1, 10, 200)} o={w(C.n22 - 0.2, C.n115)}><Big text={<>22 दिसंबर 1964</>} size={110} font={UI} color="#FFD2C4" /></At>}
      {t > C.chakravat - 0.6 && t < C.sarkar && <At x={540 + 120 * Math.sin(t * 0.6)} y={760} p={pop(t, C.chakravat - 0.5, 12, 140)} o={w(C.chakravat - 0.6, C.sarkar, 0.5, 0.8) * 0.92} rot={-(t - C.chakravat) * 70}>{has('c_cyclone') ? <Cut k="c_cyclone" w={760} /> : <svg width={700} height={700} viewBox="-350 -350 700 700">{Array.from({ length: 5 }, (_, i) => <path key={i} d={`M0,0 ${Array.from({ length: 40 }, (_, k) => { const a = k * 0.25 + i * 1.26, r = 12 * Math.exp(0.11 * k * 1.2); return `L${(r * Math.cos(a)).toFixed(0)},${(r * Math.sin(a)).toFixed(0)}`; }).join(' ')}`} stroke="#E8F0FF" strokeWidth={22 - i * 2} fill="none" opacity={0.5} />)}</svg>}</At>}
      {trainO > 0 && <At x={tx} y={ty - 30} o={trainO * (1 - ramp(t, C.train + 0.3, C.train + 0.9, linear))} rot={(ta * 180) / Math.PI + (ta > Math.PI / 2 || ta < -Math.PI / 2 ? 180 : 0)}><Img k="c_steam_train" w={420} label="train" /></At>}
      {waveQ > 0 && waveQ < 1 && <At x={1400 - 1900 * waveQ} y={ty - 20} o={Math.sin(waveQ * Math.PI)}>{has('c_giant_wave') ? <Cut k="c_giant_wave" w={1100} /> : <div style={{ width: 900, height: 360, borderRadius: '60% 40% 0 0', background: 'linear-gradient(180deg, #E8FFFF, #2C6E8E 30%, #0B2A44)' }} />}</At>}
      {t > C.n115 - 0.2 && t < C.sarkar && <At x={540} y={330} p={pop(t, C.n115 - 0.1, 10, 180)} o={w(C.n115 - 0.2, C.sarkar)}><Big text={<>{fmtIN(115 * easeOut(ramp(t, C.n115 - 0.1, C.n115 + 0.8, linear)))} यात्री</>} size={110} font={UI} color="#fff" /></At>}
      {t > C.n1800 - 0.2 && t < C.sarkar && <At x={540} y={480} p={pop(t, C.n1800 - 0.1, 10, 180)} o={w(C.n1800 - 0.2, C.sarkar)}><Big text={<>~{fmtIN(1800 * easeOut(ramp(t, C.n1800 - 0.1, C.n1800 + 1.0, linear)))} लोग</>} size={96} font={UI} color="#E8E2D6" /></At>}
      {/* Dhanushkodi today */}
      {t > C.church - 0.4 && t < C.mita + 0.4 && <At x={300} y={1150} p={pop(t, C.church - 0.3, 11, 160)} o={w(C.church - 0.4, C.mita + 0.4, 0.3, 0.6)}><Img k="r_ruined_church" w={420} label="ruined church" /></At>}
      {t > C.station - 0.4 && t < C.mita + 0.4 && <At x={790} y={1120} p={pop(t, C.station - 0.3, 11, 160)} o={w(C.station - 0.4, C.mita + 0.4, 0.3, 0.6)}><Img k="r_ruined_station" w={380} label="ruined station" /></At>}
      {t > C.machhuare - 0.4 && t < C.mita + 0.4 && <At x={540} y={1430} p={pop(t, C.machhuare - 0.3, 11, 160)} o={w(C.machhuare - 0.4, C.mita + 0.4, 0.3, 0.6)}><Img k="r_fisher_family" w={560} label="fisher family" /></At>}
      {t > C.par2 - 0.3 && t < C.chakravat && <Place t={t} t0={C.par2 - 0.2} x={dk[0]} y={dk[1]} hi="धनुषकोडी" en="DHANUSHKODI · 1964" color={COL.red} o={w(C.par2 - 0.3, C.chakravat)} />}
      {t > C.pamban - 0.3 && t < C.sarkar + 0.2 && <At x={pb[0]} y={pb[1] - 60} p={pop(t, C.pamban - 0.2, 10, 200)} o={w(C.pamban - 0.3, C.sarkar + 0.2)}><Tag text="पंबन द्वीप" size={50} color={COL.red} /></At>}
      {t > C.sarkar - 0.2 && t < C.mita && <Place t={t} t0={C.sarkar - 0.1} x={dk[0]} y={dk[1]} hi="धनुषकोडी" en="DHANUSHKODI · TODAY" color="#FFB0A0" o={w(C.sarkar - 0.2, C.mita)} />}
      {t > C.setu_last - 0.2 && t < C.usi + 0.5 && <At x={540} y={330} p={pop(t, C.setu_last - 0.1, 9, 210)} o={w(C.setu_last - 0.2, C.usi + 0.5)}><Big text="राम सेतु" size={170} font={UI} color={COL.saffron} /></At>}
      {t > C.n29b - 0.3 && t < DURATION_S - 1.2 && <At x={(dk[0] + tm[0]) / 2} y={(dk[1] + tm[1]) / 2 + 120} p={pop(t, C.n29b - 0.2, 10, 200)} o={w(C.n29b - 0.3, DURATION_S - 1.2, 0.3, 0.8)}><Tag text="29 km" size={52} /></At>}
    </>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.hamare - 0.2, t1: C.rahega + 0.25, from: 0.4 },
  { name: 'B', t0: C.vigyan - 0.1, t1: C.aastha2 + 0.5, from: 0.3 },
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
        <OffthreadVideo src={staticFile(`ramsetu/null/null_rs_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
  </div>
);

// ------------------------------------------------------------------ captions, credits
const Captions: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  if (t < 0.05 || t > DURATION_S - 0.3) return null;
  let i = -1;
  for (let k = 0; k < CAPS.length; k++) if (CAPS[k][0] <= t) i = k;
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const words = CAPS.slice(g, g + 3);
  const last = words[words.length - 1];
  if (t > last[0] + 1.2 && (!CAPS[g + 3] || t < CAPS[g + 3][0])) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 66, lineHeight: 1.25, color: '#fff', WebkitTextStroke: `10px ${DARK}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
      {words.map(([wt, w], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0, color: g + k === i ? COL.gold : '#fff' }}>{w} </span>)}
    </div>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · borders: Natural Earth (India POV) · ISRO NRSC 2024 (Sci. Rep.) · Setu line traced, approximate';

export const RamSetu: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
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
    <AbsoluteFill style={{ background: '#0E2A55', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) rotate(${rollAt(t).toFixed(3)}deg) scale(1.05)` }}>
        <AbsoluteFill style={{ filter: blur > 0.7 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
          <AbsoluteFill style={{ filter: 'contrast(1.08) saturate(1.2) brightness(1.03)' }}><MapLayers c={c} /></AbsoluteFill>
          <MapVectors t={t} c={c} />
        </AbsoluteFill>
        <Grade t={t} />
        <Grades t={t} />
        <Scenes t={t} c={c} />
      </AbsoluteFill>
      {split && <NullPanel t={t} q={split.q} {...split.w} fps={fps} />}
      {captions && <Captions t={t} top={split ? 860 : 1500} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={(t * 98) / DURATION_S} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
