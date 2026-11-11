import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { C, CAPS, Cam, DURATION_S, GEO, LOOPF, P, camAt, camMotion, lineD, merc, ringsD, shake, toS } from './cam';
import { Clouds, Grade, HiFill, MAP_GRADE } from './Fx';
import { LABEL, TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';

export const ES_DURATION_S = DURATION_S;
const AUDIO = 'everysecond/audio/mix.wav';
const INK = '#0B1830';
const COL = { gold: '#FFC21A', in: '#FF9933', asia: '#FF5E5E', africa: '#7BE04A', bolt: '#9FD8FF', oil: '#FF7A1A', co2: '#8C6E5A', mail: '#FFD84D', upi: '#2BD67B' };
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));
const roll = (t: number, t0: number, n: number, d = 0.9) => n * easeOut(ramp(t, t0, t0 + d, linear));
const fmtIN = (n: number) => Math.round(n).toLocaleString('en-IN');
/** A stable pseudo-random number in 0..1 for (i, k). */
const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// ------------------------------------------------------------------ type
const Big: React.FC<{ text: React.ReactNode; size: number; color?: string; font?: string }> = ({ text, size, color = '#fff', font = TITLE }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 11)}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const Tag: React.FC<{ text: React.ReactNode; color?: string; size?: number; font?: string }> = ({ text, color = COL.gold, size = 46, font = UI }) => (
  <div style={{ padding: `${size * 0.1}px ${size * 0.5}px`, background: 'rgba(10,15,22,0.88)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: '#fff', whiteSpace: 'nowrap', boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: o }}>{children}</div>;

// ------------------------------------------------------------------ props drawn in code
const Baby: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={110 * s} height={150 * s} viewBox="-55 -75 110 150" style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))' }}>
    <rect x={-44} y={-30} width={88} height={102} rx={44} fill="#36C9B4" stroke="#1C8F80" strokeWidth={4} />
    <path d="M-44 10 Q0 30 44 10" stroke="#1C8F80" strokeWidth={4} fill="none" />
    <circle cx={0} cy={-34} r={34} fill="#F6D2B0" stroke="#D9A983" strokeWidth={3} />
    <path d="M-34 -42 Q0 -82 34 -42 Q20 -60 0 -60 Q-20 -60 -34 -42 Z" fill="#36C9B4" />
    <circle cx={-11} cy={-32} r={3.5} fill="#3A2A20" /><circle cx={11} cy={-32} r={3.5} fill="#3A2A20" />
    <circle cx={-18} cy={-22} r={6} fill="#F4A3A3" opacity={0.7} /><circle cx={18} cy={-22} r={6} fill="#F4A3A3" opacity={0.7} />
    <path d="M-6 -18 Q0 -14 6 -18" stroke="#3A2A20" strokeWidth={2.5} fill="none" strokeLinecap="round" />
  </svg>
);
const Candle: React.FC<{ t: number; s?: number }> = ({ t, s = 1 }) => {
  const f = 1 + 0.12 * Math.sin(t * 23) + 0.06 * Math.sin(t * 37);
  return (
    <svg width={70 * s} height={170 * s} viewBox="-35 -110 70 170" style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.5))' }}>
      <ellipse cx={0} cy={-70} rx={22 * f} ry={34 * f} fill="#FFB347" opacity={0.25} />
      <path d={`M0 ${-98 * f} Q14 -66 0 -52 Q-14 -66 0 ${-98 * f} Z`} fill="#FFD36B" />
      <path d="M0 -84 Q6 -66 0 -58 Q-6 -66 0 -84 Z" fill="#FFF6D8" />
      <rect x={-2} y={-54} width={4} height={10} fill="#333" />
      <rect x={-22} y={-46} width={44} height={100} rx={6} fill="#F7F3EA" stroke="#D8D0BE" strokeWidth={3} />
    </svg>
  );
};
const Envelope: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={70 * s} height={50 * s} viewBox="0 0 70 50" style={{ filter: 'drop-shadow(0 5px 6px rgba(0,0,0,0.45))' }}>
    <rect x={2} y={2} width={66} height={46} rx={5} fill="#FFFDF5" stroke={COL.mail} strokeWidth={3} />
    <path d="M4 6 L35 30 L66 6" fill="none" stroke="#D9B02A" strokeWidth={3} strokeLinejoin="round" />
  </svg>
);
const Rupee: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={60 * s} height={60 * s} viewBox="-30 -30 60 60" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))' }}>
    <circle r={26} fill={COL.upi} stroke="#fff" strokeWidth={4} />
    <text x={0} y={11} textAnchor="middle" fontFamily="sans-serif" fontWeight={800} fontSize={32} fill="#fff">₹</text>
  </svg>
);
const SearchBar: React.FC<{ text: string; w: number }> = ({ text, w }) => (
  <div style={{ width: w, height: 110, borderRadius: 55, background: '#fff', display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px', boxShadow: '0 16px 30px rgba(0,0,0,0.45)', boxSizing: 'border-box' }}>
    <svg width={50} height={50} viewBox="0 0 50 50"><circle cx={21} cy={21} r={14} fill="none" stroke="#555" strokeWidth={6} /><path d="M31 31 L44 44" stroke="#555" strokeWidth={7} strokeLinecap="round" /></svg>
    <div style={{ fontFamily: TITLE, fontSize: 56, color: '#1B1B1B', whiteSpace: 'nowrap', overflow: 'hidden' }}>{text}</div>
  </div>
);
const Barrel: React.FC<{ t: number; s?: number; i: number }> = ({ t, s = 1, i }) => {
  const f = 1 + 0.15 * Math.sin(t * 19 + i) + 0.08 * Math.sin(t * 31 + i * 2);
  return (
    <svg width={80 * s} height={150 * s} viewBox="-40 -100 80 150" style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.5))' }}>
      <path d={`M-26 -40 Q-30 ${-80 * f} -6 ${-96 * f} Q-10 -70 4 -66 Q8 ${-92 * f} 22 ${-86 * f} Q30 -60 26 -40 Z`} fill={COL.oil} />
      <path d={`M-14 -40 Q-14 ${-64 * f} 0 ${-74 * f} Q14 -60 12 -40 Z`} fill="#FFD36B" />
      <rect x={-26} y={-40} width={52} height={80} rx={6} fill="#1F3A5F" stroke="#0E1E33" strokeWidth={3} />
      <rect x={-26} y={-20} width={52} height={6} fill="#C9D6E8" /><rect x={-26} y={14} width={52} height={6} fill="#C9D6E8" />
    </svg>
  );
};
const Bolt: React.FC<{ x: number; y: number; h: number; seed: number; o: number }> = ({ x, y, h, seed, o }) => {
  if (o <= 0) return null;
  const pts: P[] = [[x, y - h]];
  const n = 7;
  for (let k = 1; k < n; k++) pts.push([x + (rnd(seed, k) - 0.5) * 70, y - h + (h * k) / n]);
  pts.push([x, y]);
  const d = pts.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join('');
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke={COL.bolt} strokeWidth={22} opacity={0.35} strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#C9B6FF" strokeWidth={10} opacity={0.7} strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
      <circle cx={x} cy={y} r={18} fill="#fff" opacity={0.6} />
    </g>
  );
};
const Satellite: React.FC = () => (
  <svg width={190} height={90} viewBox="-95 -45 190 90" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))' }}>
    <rect x={-90} y={-22} width={60} height={44} fill="#2D5DA8" stroke="#BFD3F2" strokeWidth={3} />
    <rect x={30} y={-22} width={60} height={44} fill="#2D5DA8" stroke="#BFD3F2" strokeWidth={3} />
    <path d="M-90 0 H-30 M30 0 H90 M-60 -22 V22 M60 -22 V22" stroke="#BFD3F2" strokeWidth={2} />
    <rect x={-30} y={-30} width={60} height={60} rx={8} fill="#E8E8E8" stroke="#9AA" strokeWidth={3} />
    <circle cx={0} cy={0} r={12} fill="#FFC21A" />
  </svg>
);
export const Stopwatch: React.FC<{ p: number; size: number }> = ({ p, size }) => (
  <svg width={size} height={size * 1.15} viewBox="-60 -78 120 138" style={{ filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.55))', overflow: 'visible' }}>
    <rect x={-10} y={-76} width={20} height={14} rx={3} fill="#D9D9D9" stroke="#222" strokeWidth={3} />
    <circle r={56} fill="#F4F4F2" stroke="#222" strokeWidth={6} />
    {Array.from({ length: 60 }, (_, i) => { const a = (i * Math.PI) / 30; const L = i % 5 ? 4 : 9; return <line key={i} x1={Math.sin(a) * (50 - L)} y1={-Math.cos(a) * (50 - L)} x2={Math.sin(a) * 50} y2={-Math.cos(a) * 50} stroke="#222" strokeWidth={i % 5 ? 1.2 : 3} />; })}
    <line x1={-Math.sin(p * 2 * Math.PI) * 10} y1={Math.cos(p * 2 * Math.PI) * 10} x2={Math.sin(p * 2 * Math.PI) * 46} y2={-Math.cos(p * 2 * Math.PI) * 46} stroke="#E0221B" strokeWidth={3.5} strokeLinecap="round" />
    <circle r={5} fill="#E0221B" />
  </svg>
);

// ------------------------------------------------------------------ the map's vector layer
const MapVectors: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const asia = win(t, C.har + 0.4, C.bharat + 0.3, 0.4, 0.4), africa = win(t, C.har + 0.8, C.bharat + 0.3, 0.4, 0.4);
  const india = win(t, C.bharat - 0.1, C.isi + 0.3, 0.4, 0.5) + win(t, C.bharat2 - 0.2, C.dharti2 + 0.3, 0.4, 0.5);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs><filter id="glow"><feGaussianBlur stdDeviation="6" /></filter></defs>
      <path d={GEO.borders.map((l) => lineD(c, l)).join('')} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.28} />
      {asia > 0.01 && <HiFill id="as" t={t} d={ringsD(c, GEO.continents.Asia)} color={COL.asia} g={Math.min(1, asia)} alpha={0.5} edge={3} />}
      {africa > 0.01 && <HiFill id="af" t={t} d={ringsD(c, GEO.continents.Africa)} color={COL.africa} g={Math.min(1, africa)} alpha={0.5} edge={3} />}
      {india > 0.01 && <HiFill id="in" t={t} d={ringsD(c, GEO.countries.India)} color={COL.in} g={Math.min(1, india)} alpha={0.7} edge={4} />}
    </svg>
  );
};

// ------------------------------------------------------------------ the beats
/** Births and deaths: four babies drop onto the continents (2 Asia, 1 Africa, 1 the rest), two candles. */
const Births: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const s = (p: P) => toS(c, p);
  const hook = win(t, C.n4a - 0.2, C.kya + 0.3, 0.2, 0.4);
  const drop = win(t, C.n4b - 0.3, C.bharat + 0.2, 0.2, 0.4);
  const targets: P[] = [s(merc(85, 32)), s(merc(103, 22)), s(merc(20, 6)), s(merc(8, 47))];
  const candles: P[] = [s(merc(-5, 52)), s(merc(62, 56))];
  return (
    <>
      {hook > 0 && [0, 1, 2, 3].map((i) => <At key={i} x={250 + i * 195} y={1180} p={pop(t, C.n4a - 0.1 + i * 0.12, 10, 220)} o={hook}><Baby s={1.4} /></At>)}
      {drop > 0 && targets.map(([x, y], i) => {
        const q = easeOut(ramp(t, C.n4b - 0.2 + i * 0.12, C.n4b + 0.5 + i * 0.12, linear));
        return <At key={i} x={x} y={y - (1 - q) * 500} o={drop * Math.min(1, q * 2)} p={1}><Baby s={1.1} /></At>;
      })}
      {t > C.n4b - 0.2 && t < C.bharat + 0.2 && <At x={540} y={330} p={pop(t, C.n4b - 0.1, 10, 200)} o={1 - ramp(t, C.bharat - 0.2, C.bharat + 0.2, linear)}><Big text={<>~4 / सेकंड</>} size={110} color={COL.gold} font={UI} /></At>}
      {t > C.n2 - 0.2 && t < C.bharat + 0.2 && candles.map(([x, y], i) => <At key={i} x={x} y={y} p={pop(t, C.n2 - 0.1 + i * 0.15, 10, 200)} o={1 - ramp(t, C.bharat - 0.2, C.bharat + 0.2, linear)}><Candle t={t} s={1.2} /></At>)}
      {t > C.n2 - 0.2 && t < C.bharat + 0.2 && <At x={540} y={1250} p={pop(t, C.n2, 10, 200)} o={1 - ramp(t, C.bharat - 0.2, C.bharat + 0.2, linear)}><Tag text="~2 / सेकंड" size={60} color="#C9C9C9" /></At>}
      {t > C.dedh - 0.2 && t < C.isi + 0.3 && <>
        <At x={s(merc(79, 23))[0]} y={s(merc(79, 23))[1]} p={pop(t, C.ek - 0.2, 10, 200)} o={1 - ramp(t, C.isi, C.isi + 0.3, linear)}><Baby s={1.6} /></At>
        <At x={540} y={330} p={pop(t, C.dedh - 0.1, 10, 200)} o={1 - ramp(t, C.isi, C.isi + 0.3, linear)}><Big text={<>हर 1.5 सेकंड</>} size={110} color={COL.in} font={UI} /></At>
      </>}
    </>
  );
};
/** Emails rain across the world; the search bar types. */
const Mails: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const o = win(t, C.n40 - 0.4, C.bharat2 + 0.2, 0.3, 0.4);
  if (o <= 0) return null;
  const n = 46;
  const typed = 'Search…  1,00,000+ / sec';
  const k = Math.round(typed.length * ramp(t, C.google - 0.1, C.lakh1 + 0.9, linear));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {Array.from({ length: n }, (_, i) => {
        const t0 = C.n40 - 0.3 + rnd(i, 1) * 1.6;
        const q = ramp(t, t0, t0 + 0.6, easeOut);
        if (q <= 0) return null;
        const lon = -120 + rnd(i, 2) * 260, lat = -30 + rnd(i, 3) * 85;
        const [x, y] = toS(c, merc(lon, lat));
        return <At key={i} x={x} y={y - (1 - q) * 300} o={Math.min(1, q * 2)} rot={(rnd(i, 4) - 0.5) * 30}><Envelope s={0.9} /></At>;
      })}
      <At x={540} y={330} p={pop(t, C.n40 - 0.1, 10, 200)}><Big text={<>{fmtIN(roll(t, C.n40 - 0.1, 40, 0.8))} लाख emails</>} size={92} color={COL.mail} font={UI} /></At>
      {t > C.google - 0.3 && <At x={540} y={1240} p={pop(t, C.google - 0.2, 11, 180)}><SearchBar text={typed.slice(0, k)} w={900} /></At>}
    </AbsoluteFill>
  );
};
/** UPI: rupee pings over India (with Null in the split). */
const Upi: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const o = win(t, C.bharat2, C.dharti2 + 0.2, 0.4, 0.4);
  if (o <= 0) return null;
  const cities: P[] = [[72.88, 19.07], [77.2, 28.6], [77.6, 12.97], [88.36, 22.57], [80.27, 13.08], [78.48, 17.39], [73.85, 18.52], [72.57, 23.02], [75.79, 26.91], [80.95, 26.85], [85.14, 25.6], [76.27, 9.93], [83.0, 25.3], [91.74, 26.14], [75.86, 22.72], [79.08, 21.15]];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {Array.from({ length: 48 }, (_, i) => {
        const city = cities[i % cities.length];
        const ph = (t * 1.4 + rnd(i, 5)) % 1;
        if (t < C.upi - 0.6 + rnd(i, 6) * 0.6) return null;
        const [x, y] = toS(c, merc(city[0] + (rnd(i, 7) - 0.5) * 2.5, city[1] + (rnd(i, 8) - 0.5) * 2.5));
        return <At key={i} x={x} y={y - ph * 70} p={0.6 + 0.5 * (1 - ph)} o={1 - ph}><Rupee s={1} /></At>;
      })}
      <At x={540} y={250} p={pop(t, C.n9500 - 0.1, 10, 200)}><Big text={<>{fmtIN(roll(t, C.n9500 - 0.1, 9500, 1.0))} UPI / सेकंड</>} size={84} color={COL.upi} font={UI} /></At>
    </AbsoluteFill>
  );
};
/** Lightning: bolts everywhere, the old 100 crossed out, NASA's 44 (with Null in the split). */
const Lightning: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const o = win(t, C.dharti2 - 0.2, C.oil + 0.2, 0.3, 0.4);
  if (o <= 0) return null;
  const bolts = Array.from({ length: 16 }, (_, i) => {
    const per = 0.55 + rnd(i, 9) * 0.5;
    const ph = ((t + rnd(i, 10) * per) % per) / per;
    const lon = -110 + rnd(i, 11) * 250, lat = -25 + rnd(i, 12) * 70;
    const [x, y] = toS(c, merc(lon, lat));
    return { x, y, ph, seed: i * 7 + Math.floor((t + rnd(i, 10) * per) / per) };
  });
  const cross = ramp(t, C.n100 + 0.2, C.n100 + 0.6, inOut);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {t > C.bijli - 0.3 && bolts.map((b, i) => <Bolt key={i} x={b.x} y={b.y} h={260 + rnd(i, 13) * 160} seed={b.seed} o={b.ph < 0.18 ? 1 - b.ph / 0.18 : 0} />)}
      </svg>
      {t > C.n44 - 0.2 && t < C.purani && <At x={540} y={330} p={pop(t, C.n44 - 0.1, 9, 220)} o={1 - ramp(t, C.purani - 0.3, C.purani, linear)}><Big text="44 / सेकंड" size={120} color={COL.bolt} /></At>}
      {t > C.n100 - 0.2 && <At x={360} y={300} p={pop(t, C.n100 - 0.1, 10, 200)} rot={-6}>
        <div style={{ position: 'relative' }}>
          <Big text="100" size={150} color="#BBB" />
          <svg width={260} height={160} viewBox="0 0 260 160" style={{ position: 'absolute', left: -20, top: 0 }}><path d={`M10 140 L${10 + 240 * cross} ${140 - 130 * cross}`} stroke="#FF3B3B" strokeWidth={18} strokeLinecap="round" /></svg>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, color: '#ddd', textAlign: 'center' }}>1925</div>
        </div>
      </At>}
      {t > C.n44b - 0.2 && <At x={760} y={300} p={pop(t, C.n44b - 0.1, 8, 240)} rot={4}>
        <div style={{ padding: '0 30px', border: `10px solid ${COL.bolt}`, borderRadius: 18 }}><Big text="44" size={170} color={COL.bolt} /></div>
      </At>}
      {t > C.sat - 0.3 && (() => { const a = ramp(t, C.sat - 0.3, C.oil, linear); return <At x={150 + 780 * a} y={150 + Math.sin(a * Math.PI) * -40 + 60} p={pop(t, C.sat - 0.2, 10, 200)} rot={-8}><Satellite /></At>; })()}
    </AbsoluteFill>
  );
};
/** Oil burned and CO2 emitted. */
const Oil: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const o = win(t, C.oil - 0.2, C.roshni + 0.2, 0.3, 0.4);
  if (o <= 0) return null;
  const pts = Object.values(GEO.oil);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {pts.map((p, i) => { const [x, y] = toS(c, p); return <At key={i} x={x} y={y} p={pop(t, C.n1200a - 0.3 + i * 0.06, 10, 220)}><Barrel t={t} i={i} s={0.9} /></At>; })}
      {t > C.co2a - 0.2 && Array.from({ length: 30 }, (_, i) => {
        const p = pts[i % pts.length];
        const [x, y] = toS(c, p);
        const ph = ((t - C.co2a) * 0.45 + rnd(i, 14)) % 1;
        return <At key={i} x={x + (rnd(i, 15) - 0.5) * 120} y={y - 80 - ph * 420} p={0.6 + ph * 0.9} o={(1 - ph) * ramp(t, C.co2a - 0.2, C.co2a + 0.6, linear)}>
          <div style={{ width: 70, height: 70, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, #B49A88, ${COL.co2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LABEL, fontWeight: 700, fontSize: 18, color: '#fff' }}>CO₂</div>
        </At>;
      })}
      <At x={540} y={300} p={pop(t, C.n1200a - 0.1, 10, 200)} o={1 - ramp(t, C.co2a - 0.2, C.co2a + 0.2, linear)}><Big text={<>{fmtIN(roll(t, C.n1200a - 0.1, 1200))} बैरल तेल</>} size={100} color={COL.oil} font={UI} /></At>
      {t > C.n1200b - 0.2 && <At x={540} y={300} p={pop(t, C.n1200b - 0.1, 10, 200)}><Big text={<>{fmtIN(roll(t, C.n1200b - 0.1, 1200))} टन CO₂</>} size={100} color="#D7B9A2" font={UI} /></At>}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the globe scenes (light ×7.5, the orbit)
const GLOBE = staticFile('everysecond/maps/globe_eq.jpg');
/** A spinning globe: the equirectangular texture scrolled inside a circle, with sphere shading on top. */
const Globe: React.FC<{ t: number; r: number }> = ({ t, r }) => {
  const off = (t * 0.06) % 1;
  return (
    <div style={{ position: 'relative', width: r * 2, height: r * 2, borderRadius: '50%', overflow: 'hidden', boxShadow: `0 0 ${r * 0.35}px rgba(110,190,255,0.55)` }}>
      <div style={{ position: 'absolute', left: -off * r * 4, top: 0, width: r * 8, height: r * 2, backgroundImage: `url(${GLOBE})`, backgroundSize: `${r * 4}px ${r * 2}px`, backgroundRepeat: 'repeat-x', filter: 'saturate(1.2)' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 36% 34%, rgba(255,255,255,0.22), rgba(255,255,255,0) 35%), radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,10,0.65) 74%, rgba(0,0,10,0.92) 100%)' }} />
    </div>
  );
};
const SpaceScene: React.FC<{ t: number }> = ({ t }) => {
  const stars = React.useMemo(() => Array.from({ length: 140 }, (_, i) => [rnd(i, 20) * 1080, rnd(i, 21) * 1920, 0.8 + rnd(i, 22) * 2, rnd(i, 23) * 6]), []);
  const inQ = ramp(t, C.roshni - 0.6, C.roshni + 0.2, inOut);
  const out = ramp(t, C.yesab - 0.4, C.yesab + 0.3, inOut);
  if (inQ <= 0 || out >= 1) return null;
  const orbit = ramp(t, C.tum - 0.2, C.suraj + 0.6, inOut);
  const r = 330 - 190 * orbit;
  // the globe moves onto its orbit (an arc around the Sun at the bottom right)
  const a0 = -2.25, a = a0 + 0.35 * ramp(t, C.km30 - 0.4, C.km30 + 1.0, inOut);
  const sx = 1020, sy = 1880, R = 980;
  const gx = 540 + (sx + Math.cos(a) * R - 540) * orbit, gy = 900 + (sy + Math.sin(a) * R - 900) * orbit;
  const loops = 7.5 * ramp(t, C.n7 - 0.4, C.chakkar + 0.8, linear);
  const ringO = win(t, C.n7 - 0.5, C.tum, 0.3, 0.3);
  return (
    <AbsoluteFill style={{ opacity: inQ * (1 - out), background: 'radial-gradient(ellipse at 50% 40%, #0F3A4E 0%, #082236 45%, #030A16 100%)' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {stars.map(([x, y, s, ph], i) => <circle key={i} cx={x} cy={y} r={s} fill="#fff" opacity={0.25 + 0.3 * (0.5 + 0.5 * Math.sin(t * LOOPF(9) * (1 + (i % 3)) + ph))} />)}
        {orbit > 0.01 && <>
          <circle cx={sx} cy={sy} r={150} fill="#FFC94A" opacity={orbit} />
          <circle cx={sx} cy={sy} r={230} fill="#FFB020" opacity={0.25 * orbit} />
          <circle cx={sx} cy={sy} r={R} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="10 12" opacity={0.6 * orbit} />
          {(() => { const p = ramp(t, C.km30 - 0.4, C.km30 + 1.0, inOut); if (p <= 0) return null; const d = `M${sx + Math.cos(a0) * R},${sy + Math.sin(a0) * R} A${R} ${R} 0 0 1 ${sx + Math.cos(a) * R},${sy + Math.sin(a) * R}`; return <path d={d} fill="none" stroke={COL.gold} strokeWidth={14} strokeLinecap="round" />; })()}
        </>}
      </svg>
      <div style={{ position: 'absolute', left: gx - r, top: gy - r }}><Globe t={t} r={r} /></div>
      {ringO > 0 && (() => {
        const ph = (loops % 1) * Math.PI * 2;
        const lx = gx + Math.cos(ph) * r * 1.25, ly = gy + Math.sin(ph) * r * 0.32;
        return (
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: ringO }}>
            <ellipse cx={gx} cy={gy} rx={r * 1.25} ry={r * 0.32} fill="none" stroke={COL.gold} strokeWidth={6} opacity={0.7} />
            <circle cx={lx} cy={ly} r={18} fill="#fff" /><circle cx={lx} cy={ly} r={40} fill={COL.gold} opacity={0.35} />
          </svg>
        );
      })()}
      {ringO > 0 && <At x={540} y={330} p={pop(t, C.n7 - 0.1, 10, 200)} o={ringO}><Big text={<>×{(Math.floor(loops * 2) / 2).toFixed(1)}</>} size={150} color={COL.gold} /></At>}
      {t > C.km30 - 0.3 && <At x={gx - 40} y={gy - r - 90} p={pop(t, C.km30 - 0.2, 10, 200)} rot={-14}><Big text="30 KM" size={110} color={COL.gold} /></At>}
      {t > C.tum - 0.1 && <At x={gx + r * 0.25} y={gy - r * 0.05} p={pop(t, C.tumbhi - 0.1, 10, 220)}><Tag text="तुम" size={44} color={COL.in} /></At>}
      <div style={{ position: 'absolute', right: 30, bottom: 110, fontFamily: LABEL, fontSize: 22, color: 'rgba(255,255,255,0.55)', opacity: orbit }}>NOT TO SCALE</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the frame-0 stopwatch (and the loop's end)
const Clock: React.FC<{ t: number }> = ({ t }) => {
  const o = 1 - ramp(t, C.n4a - 0.4, C.n4a, linear) + ramp(t, C.yesab + 0.2, DURATION_S - 0.3, linear);
  const p = ((t % 1) + 1) % 1;
  return (
    <>
      <At x={540} y={290} o={clamp01(o)}><Big text={<>1 सेकंड</>} size={140} color="#fff" font={UI} /></At>
      <At x={540} y={1080} o={clamp01(o)}><Stopwatch p={p} size={470} /></At>
      {t > C.dharti - 0.2 && t < C.kya + 0.3 && <At x={540} y={480} p={pop(t, C.km30a - 0.1, 10, 200)} o={1 - ramp(t, C.kya, C.kya + 0.3, linear)} rot={-6}><Big text="30 KM" size={120} color={COL.gold} /></At>}
      {t > C.kya - 0.2 && t < C.har + 0.2 && <At x={540} y={480} p={pop(t, C.kya - 0.1, 9, 220)} o={1 - ramp(t, C.har - 0.1, C.har + 0.2, linear)}><Big text="?" size={220} color="#fff" /></At>}
    </>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.bharat2 - 0.1, t1: C.dharti2 - 0.1, from: 0.3 },
  { name: 'B', t0: C.purani - 0.1, t1: C.oil - 0.2, from: 0.2 },
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
        <OffthreadVideo src={staticFile(`everysecond/null/null_es_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
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
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 66, lineHeight: 1.25, color: '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
      {words.map(([wt, w], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0, color: g + k === i ? COL.gold : '#fff' }}>{w} </span>)}
    </div>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · borders: Natural Earth (India POV) · data: UN WPP, NPCI, NASA, EIA';

export const EverySecond: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const c = camAt(t);
  const [sx, sy] = shake(t);
  const mv = camMotion(t);
  const blur = Math.min(10, Math.hypot(mv.vx, mv.vy) * 0.04 + mv.zoom * 4);
  const split = splitAt(t);
  // the reference's tilted-map moments: the world tips back on the emails and the oil beats
  const tilt = 22 * (win(t, C.isi - 0.2, C.bharat2 + 0.2, 0.6, 0.6) + win(t, C.oil - 0.3, C.roshni, 0.6, 0.5));
  const space = ramp(t, C.roshni - 0.6, C.roshni + 0.2, inOut) * (1 - ramp(t, C.yesab - 0.4, C.yesab + 0.3, inOut));
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #1D4E8F, #0E2A55)', overflow: 'hidden' }}>
      {space < 0.999 && <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <AbsoluteFill style={{ perspective: '1600px', perspectiveOrigin: '540px 700px' }}>
          <AbsoluteFill style={{ transform: `rotateX(${tilt}deg) scale(${1 + tilt / 120})`, transformOrigin: '540px 1100px', boxShadow: tilt > 0.5 ? '0 -20px 60px rgba(0,0,0,0.5)' : undefined }}>
            <AbsoluteFill style={{ filter: blur > 0.6 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
              <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={c} /></AbsoluteFill>
              <Clouds t={t} a={0.5} />
              <MapVectors t={t} c={c} />
            </AbsoluteFill>
          </AbsoluteFill>
        </AbsoluteFill>
        <Grade t={t} />
        <Births t={t} c={c} />
        <Mails t={t} c={c} />
        <Upi t={t} c={c} />
        <Lightning t={t} c={c} />
        <Oil t={t} c={c} />
        <Clock t={t} />
      </AbsoluteFill>}
      <SpaceScene t={t} />
      {split && <NullPanel t={t} q={split.q} {...split.w} fps={fps} />}
      {captions && <Captions t={t} top={split ? 860 : 1470} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={(t * 98) / DURATION_S} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
