import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { C, CAPS, Cam, DURATION_S, GEO, P, camAt, camMotion, lineD, merc, ringsD, rollAt, shake, toS } from './cam';
import { ASPECT } from './assets';
import { Cut, Slab } from './Studio';
import { Clouds, Grade, MAP_GRADE } from './Fx';
import { LABEL, TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';

export const ES_DURATION_S = DURATION_S;
const AUDIO = 'everysecond/audio/mix.wav';
const INK = '#0B1830';
export const COL = { gold: '#FFC21A', in: '#FF9933', asia: '#FF5E5E', africa: '#7BE04A', bolt: '#9FD8FF', oil: '#FF7A1A', co2: '#8C6E5A', mail: '#FFD84D', upi: '#2BD67B' };
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));
const roll = (t: number, t0: number, n: number, d = 0.9) => n * easeOut(ramp(t, t0, t0 + d, linear));
const fmtIN = (n: number) => Math.round(n).toLocaleString('en-IN');
/** A stable pseudo-random number in 0..1 for (i, k). */
const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// ------------------------------------------------------------------ type
export const Big: React.FC<{ text: React.ReactNode; size: number; color?: string; font?: string; ink?: string }> = ({ text, size, color = '#fff', font = TITLE, ink = INK }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 11)}px ${ink}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
export const Tag: React.FC<{ text: React.ReactNode; color?: string; size?: number; font?: string }> = ({ text, color = COL.gold, size = 46, font = UI }) => (
  <div style={{ padding: `${size * 0.1}px ${size * 0.5}px`, background: 'rgba(10,15,22,0.88)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: '#fff', whiteSpace: 'nowrap', boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
export const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: o }}>{children}</div>;

// ------------------------------------------------------------------ the creator's GPT props (glossy 3D miniatures)
const BABY = ['b_baby_1', 'b_baby_2'];
export const Baby: React.FC<{ s?: number; i?: number }> = ({ s = 1, i = 0 }) => <Cut k={BABY[i % 2]} w={150 * s} />;
export const Envelope: React.FC<{ s?: number }> = ({ s = 1 }) => <Cut k="e_envelope" w={130 * s} />;
export const Barrel: React.FC<{ t: number; s?: number; i: number }> = ({ t, s = 1, i }) => (
  <div style={{ transform: `scaleY(${1 + 0.02 * Math.sin(t * 17 + i)})`, transformOrigin: '50% 100%' }}><Cut k="o_barrel_fire" w={90 * s} /></div>
);
/** A gold coin with the ₹ drawn on it in code. */
export const Rupee: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <div style={{ position: 'relative' }}>
    <Cut k="e_coin" w={80 * s} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-54%)', textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 52 * s, color: '#B8860B', textShadow: '0 2px 0 #FFE9A0' }}>₹</div>
  </div>
);
/** The chrome stopwatch, with a red sweep ring that runs one second. */
export const Stopwatch: React.FC<{ p: number; size: number; tick?: number }> = ({ p, size, tick = 0 }) => {
  const r = size * 0.52, a = p * 2 * Math.PI;
  const end = [Math.sin(a) * r, -Math.cos(a) * r];
  return (
    <div style={{ position: 'relative', width: size, transform: `scale(${1 + 0.05 * tick})` }}>
      <Cut k="a_stopwatch" w={size} />
      <svg width={size * 1.3} height={size * 1.3} viewBox={`${-size * 0.65} ${-size * 0.65} ${size * 1.3} ${size * 1.3}`} style={{ position: 'absolute', left: -size * 0.15, top: size * (1 / ASPECT.a_stopwatch) * 0.58 - size * 0.65, overflow: 'visible' }}>
        <circle r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={size * 0.035} />
        {p > 0.005 && <path d={`M0,${-r} A${r},${r} 0 ${p > 0.5 ? 1 : 0} 1 ${end[0].toFixed(1)},${end[1].toFixed(1)}`} fill="none" stroke="#FF2B2B" strokeWidth={size * 0.045} strokeLinecap="round" />}
        <circle cx={end[0]} cy={end[1]} r={size * 0.035} fill="#fff" stroke="#FF2B2B" strokeWidth={4} />
      </svg>
    </div>
  );
};
const Bolt: React.FC<{ x: number; y: number; h: number; o: number; flip: boolean }> = ({ x, y, h, o, flip }) =>
  o <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y - h, transform: `translateX(-50%) scaleX(${flip ? -1 : 1})`, opacity: o }}><Cut k="l_bolt" w={h * ASPECT.l_bolt} screen /></div>;

// ------------------------------------------------------------------ the map's highlight layer (studio slabs)
const MapVectors: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const asia = win(t, C.har + 0.4, C.bharat + 0.3, 0.4, 0.4), africa = win(t, C.har + 0.8, C.bharat + 0.3, 0.4, 0.4);
  const india = Math.max(win(t, C.n4a - 0.2, C.dharti + 0.3, 0.3, 0.4), win(t, C.bharat - 0.1, C.isi + 0.3, 0.4, 0.5), win(t, C.bharat2 - 0.2, C.dharti2 + 0.3, 0.4, 0.5));
  const s = (p: P) => toS(c, p);
  const [ax, ay] = s(GEO.centroids.Asia), [fx, fy] = s(GEO.centroids.Africa), [ix, iy] = s(GEO.centroids.India);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <path d={GEO.borders.map((l) => lineD(c, l)).join('')} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.28} />
      <Slab id="as" t={t} d={ringsD(c, GEO.continents.Asia)} hue="blue" g={asia} depth={12} cx={ax} cy={ay} s={0.98 + 0.03 * pop(t, C.har + 0.3, 9, 190)} />
      <Slab id="af" t={t} d={ringsD(c, GEO.continents.Africa)} hue="blue" g={africa} depth={12} cx={fx} cy={fy} s={0.98 + 0.03 * pop(t, C.har + 0.7, 9, 190)} />
      <Slab id="in" t={t} d={ringsD(c, GEO.countries.India)} hue="red" g={india} depth={18} cx={ix} cy={iy} s={0.97 + 0.05 * Math.max(pop(t, C.n4a - 0.1, 9, 190) * (t < C.dharti + 0.4 ? 1 : 0), pop(t, C.bharat - 0.05, 9, 190) * (t > C.bharat - 0.1 && t < C.isi + 0.4 ? 1 : 0), pop(t, C.bharat2 - 0.1, 9, 190) * (t > C.bharat2 - 0.3 ? 1 : 0))} />
    </svg>
  );
};

// ------------------------------------------------------------------ the hook (0-11 s)
/** "Ek second par tum kabhi dhyan nahi dete": the stopwatch ticks one second; "tum" scrolls his phone. Also the loop's end. */
const Clock: React.FC<{ t: number }> = ({ t }) => {
  const o = clamp01(1 - ramp(t, C.par + 0.4, C.par + 0.9, linear) + ramp(t, C.yesab + 0.3, DURATION_S - 0.25, linear));
  // the hand sweeps one second at a time; each new second lands with a tick punch
  const p = ((t - C.sec + 10) % 1);
  const tick = Math.exp(-14 * p);
  // on "par isi ek second mein" the stopwatch flies to the top corner and keeps ticking there through the hook
  const fly = ramp(t, C.par - 0.1, C.par + 0.5, inOut) * (1 - ramp(t, C.yesab + 0.3, DURATION_S - 0.4, inOut));
  const corner = win(t, C.par, C.kya + 0.2, 0.3, 0.3);
  const youO = clamp01(1 - ramp(t, C.par, C.par + 0.4, linear) + ramp(t, C.yesab + 0.5, DURATION_S - 0.25, linear));
  const yx = 225 - 300 * (1 - youO), yy = 1300;
  return (
    <>
      {o > 0.01 && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,10,25,0.1), rgba(0,10,25,0.6))', opacity: o * 0.9 }} />}
      {o > 0.01 && <At x={540} y={290} o={o} p={1 + 0.04 * tick}><Big text={<>1 सेकंड</>} size={150} color="#fff" font={UI} /></At>}
      {(o > 0.01 || corner > 0.01) && (() => {
        const x = 600 + (870 - 600) * fly, y = 860 + (330 - 860) * fly, sz = 560 - 330 * fly;
        return <At x={x} y={y} o={Math.max(o, corner)} rot={-6 + 4 * Math.sin(t * 2.1)}><Stopwatch p={p} size={sz} tick={tick} /></At>;
      })()}
      {youO > 0.01 && <At x={yx} y={yy} o={youO} rot={Math.sin(t * 1.7) * 1.5}><Cut k="a_you_phone" w={210} /></At>}
      {youO > 0.01 && <At x={yx + 30} y={yy - 340} o={youO} p={0.9 + 0.1 * Math.sin(t * 5)}><Tag text="तुम" size={52} color={COL.in} /></At>}
      {t > C.kya - 0.2 && t < C.har + 0.3 && <At x={540} y={620} p={pop(t, C.kya - 0.1, 8, 240)} o={1 - ramp(t, C.har, C.har + 0.3, linear)} rot={6}><Big text="?" size={300} color={COL.gold} /></At>}
    </>
  );
};
/** "Aur dharti 30 km aage": a quick cut to space, the Earth streaking along its orbit. */
const HookSpace: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, C.dharti + 0.25, C.kya - 0.05, 0.25, 0.3);
  if (o <= 0) return null;
  const q = ramp(t, C.dharti + 0.3, C.kya, inOut);
  const sx = 1000, sy = 1820, R = 1180, a = -2.3 + 0.42 * q;
  const ex = sx + Math.cos(a) * R, ey = sy + Math.sin(a) * R, ang = (a * 180) / Math.PI + 90;
  return (
    <AbsoluteFill style={{ opacity: o, background: '#02040A', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: -60, transform: `translate(${-40 * q}px, ${20 * q}px) scale(1.08)` }}><Cut k="s_stars" w={1200} screen shadow={false} /></div>
      <div style={{ position: 'absolute', left: sx - 420, top: sy - 420, transform: `rotate(${t * 6}deg)` }}><Cut k="s_sun" w={840} screen /></div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={sx} cy={sy} r={R} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="12 14" opacity={0.5} />
        <path d={`M${sx + Math.cos(-2.3) * R},${sy + Math.sin(-2.3) * R} A${R} ${R} 0 0 1 ${ex},${ey}`} fill="none" stroke={COL.gold} strokeWidth={14} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', left: ex, top: ey, transform: `translate(-100%,-50%) rotate(${ang}deg)`, transformOrigin: '100% 50%', opacity: 0.95 }}><Cut k="s_light_streak" w={620} screen /></div>
      <At x={ex} y={ey} rot={t * 20}><Cut k="s_earth" w={300} /></At>
      <At x={ex - 30} y={ey - 260} p={pop(t, C.km30a - 0.1, 9, 220)} rot={-10}><Big text="30 KM" size={130} color={COL.gold} /></At>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the beats
/** Births: 4 babies drop onto the map (hook and again at 10.9 s), two diyas for the two who leave, the mother in India. */
const Births: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const s = (p: P) => toS(c, p);
  const hook = win(t, C.n4a - 0.25, C.dharti + 0.35, 0.2, 0.3);
  const drop = win(t, C.n4b - 0.3, C.bharat + 0.2, 0.2, 0.4);
  const hookT: P[] = [s(merc(79, 23)), s(merc(100, 26)), s(merc(22, 4)), s(merc(46, 10))];
  const targets: P[] = [s(merc(85, 32)), s(merc(105, 24)), s(merc(20, 6)), s(merc(-58, -12))];
  const diyas: P[] = [s(merc(-5, 50)), s(merc(62, 55))];
  const dropIn = (t0: number, [x, y]: P, i: number, sc: number) => {
    const q = easeOut(ramp(t, t0, t0 + 0.45, linear));
    const sq = 1 + 0.18 * Math.exp(-8 * Math.max(0, t - t0 - 0.45)) * Math.sin(Math.max(0, t - t0 - 0.45) * 22);
    return <At key={i} x={x} y={y - (1 - q) * 520} o={Math.min(1, q * 2.5)} rot={(i % 2 ? 6 : -6) + 3 * Math.sin(t * 3 + i)}><div style={{ transform: `scale(${sc}) scaleY(${sq})`, transformOrigin: '50% 100%' }}><Baby i={i} s={1} /></div></At>;
  };
  const cnt4 = (t0: number, until: number) => t > t0 - 0.2 && t < until && <At x={540} y={330} p={pop(t, t0 - 0.1, 9, 220)} o={1 - ramp(t, until - 0.3, until, linear)}><Big text={<>{Math.min(4, Math.max(1, Math.ceil((t - t0 + 0.05) / 0.13)))} बच्चे</>} size={130} color={COL.gold} font={UI} /></At>;
  return (
    <>
      {hook > 0 && <AbsoluteFill style={{ opacity: hook }}>{hookT.map((p, i) => dropIn(C.n4a - 0.15 + i * 0.13, p, i, 1.25))}</AbsoluteFill>}
      {cnt4(C.n4a, C.dharti + 0.3)}
      {drop > 0 && <AbsoluteFill style={{ opacity: drop }}>{targets.map((p, i) => dropIn(C.n4b - 0.2 + i * 0.13, p, i, 1.0))}</AbsoluteFill>}
      {cnt4(C.n4b, C.n2 - 0.1)}
      {t > C.n2 - 0.2 && t < C.bharat + 0.2 && diyas.map(([x, y], i) => (
        <At key={i} x={x} y={y} p={pop(t, C.n2 - 0.1 + i * 0.18, 10, 170)} o={1 - ramp(t, C.bharat - 0.2, C.bharat + 0.2, linear)}>
          <div style={{ position: 'relative' }}><div style={{ position: 'absolute', left: '50%', top: '30%', width: 220, height: 220, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(circle, rgba(255,190,90,${0.55 + 0.1 * Math.sin(t * 9 + i)}), rgba(255,140,40,0) 70%)` }} /><Cut k="d_diya" w={170} /></div>
        </At>
      ))}
      {t > C.n2 - 0.2 && t < C.bharat + 0.2 && <At x={540} y={330} p={pop(t, C.n2 - 0.1, 10, 200)} o={1 - ramp(t, C.bharat - 0.2, C.bharat + 0.2, linear)}><Big text="~2 / सेकंड" size={110} color="#E8E2D6" font={UI} /></At>}
      {t > C.dedh - 0.2 && t < C.isi + 0.3 && <>
        <At x={s(merc(79, 21))[0] + 40} y={s(merc(79, 21))[1] + 40} p={pop(t, C.ek - 0.25, 10, 170)} o={1 - ramp(t, C.isi, C.isi + 0.3, linear)}>
          <div style={{ position: 'relative' }}><div style={{ position: 'absolute', inset: -60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,220,170,0.6), rgba(255,200,140,0) 65%)' }} /><Cut k="b_mother_india" w={430} /></div>
        </At>
        <At x={540} y={330} p={pop(t, C.dedh - 0.1, 10, 200)} o={1 - ramp(t, C.isi, C.isi + 0.3, linear)}><Big text={<>हर 1.5 सेकंड</>} size={120} color="#FF5A4E" font={UI} /></At>
      </>}
    </>
  );
};
/** Emails stream across the world, the burst, and the magnifying glass for searches. */
const Mails: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const o = win(t, C.n40 - 0.4, C.bharat2 + 0.2, 0.3, 0.4);
  if (o <= 0) return null;
  const n = 34;
  const burst = t - (C.emails - 0.1);
  const mg = ramp(t, C.google - 0.3, C.bharat2, linear);
  const scan = Math.sin(mg * Math.PI * 2.2);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {Array.from({ length: n }, (_, i) => {
        const per = 1.4 + rnd(i, 1) * 0.9, ph = ((t - C.n40 + 0.3 + rnd(i, 2) * per) / per) % 1;
        if (t < C.n40 - 0.3 + rnd(i, 3) * 0.8) return null;
        const lane = rnd(i, 4), x = -150 + ph * 1400, y = 450 + lane * 1100 - ph * 260 + Math.sin(ph * 6 + i) * 30;
        const flap = 1 + 0.18 * Math.sin(t * 24 + i * 2);
        return <At key={i} x={x} y={y} o={Math.sin(ph * Math.PI)} rot={-14 + (rnd(i, 5) - 0.5) * 16} p={0.6 + 0.6 * lane}><div style={{ transform: `scaleY(${flap})` }}><Envelope s={1} /></div></At>;
      })}
      {burst > -0.05 && burst < 1.3 && <At x={540} y={960} p={0.4 + 1.1 * easeOut(clamp01(burst / 0.6))} o={1 - clamp01((burst - 0.7) / 0.6)}><Cut k="e_mail_burst" w={900} /></At>}
      <At x={540} y={330} p={pop(t, C.n40 - 0.1, 10, 200)} o={1 - ramp(t, C.google - 0.3, C.google, linear)}><Big text={<>{fmtIN(roll(t, C.n40 - 0.1, 40, 0.8))} लाख emails</>} size={100} color={COL.mail} font={UI} /></At>
      {t > C.google - 0.4 && <>
        <At x={540 + 300 * scan} y={980 + 160 * Math.sin(mg * Math.PI * 1.3)} p={pop(t, C.google - 0.3, 10, 180)} rot={-20 + 10 * scan}>
          <div style={{ position: 'relative' }}><div style={{ position: 'absolute', left: '8%', top: '6%', width: '62%', height: '62%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(140,210,255,0.55), rgba(140,210,255,0) 70%)' }} /><Cut k="e_magnifier" w={460} /></div>
        </At>
        <At x={540} y={330} p={pop(t, C.lakh1 - 0.2, 10, 200)}><Big text={<>1 लाख+ searches</>} size={100} color="#8FD3FF" font={UI} /></At>
      </>}
    </AbsoluteFill>
  );
};
/** UPI: phones with the green tick pop up over Indian cities, ₹ coins rain (with Null in the split). */
const Upi: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const o = win(t, C.bharat2, C.dharti2 + 0.2, 0.4, 0.4);
  if (o <= 0) return null;
  const cities: P[] = [[72.88, 19.07], [77.2, 28.6], [77.6, 12.97], [88.36, 22.57], [80.27, 13.08], [78.48, 17.39], [75.79, 26.91], [80.95, 26.85], [85.14, 25.6], [76.27, 9.93], [91.74, 26.14], [75.86, 22.72]];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {cities.map((cy, i) => {
        const t0 = C.upi - 0.8 + i * 0.09, [x, y] = toS(c, merc(cy[0], cy[1]));
        const bob = Math.sin(t * 4 + i) * 6;
        return <At key={i} x={x} y={y - 60 + bob} p={pop(t, t0, 9, 210) * 0.95} rot={(i % 2 ? 7 : -7)}><Cut k="e_phone_paid" w={72} /></At>;
      })}
      {Array.from({ length: 22 }, (_, i) => {
        const per = 1.1 + rnd(i, 6) * 0.6, ph = ((t + rnd(i, 7) * per) % per) / per;
        if (t < C.n9500 - 0.3 + rnd(i, 8) * 0.5) return null;
        return <At key={`c${i}`} x={80 + rnd(i, 9) * 920} y={-60 + ph * 900} rot={ph * 360 * (rnd(i, 10) > 0.5 ? 1 : -1)} o={Math.min(1, (1 - ph) * 3)}><div style={{ transform: `scaleX(${Math.cos(ph * 9 + i)})` }}><Rupee s={0.9} /></div></At>;
      })}
      <At x={540} y={250} p={pop(t, C.n9500 - 0.1, 10, 200)}><Big text={<>{fmtIN(roll(t, C.n9500 - 0.1, 9500, 1.0))} UPI / सेकंड</>} size={90} color={COL.upi} font={UI} /></At>
    </AbsoluteFill>
  );
};
/** Lightning: storm clouds drift, bolts strike with flashes; the old book says 100, the satellite counts 44 (Null in the split). */
const Lightning: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const o = win(t, C.dharti2 - 0.2, C.oil + 0.2, 0.3, 0.4);
  if (o <= 0) return null;
  const spots: P[] = [[-60, 0], [20, 5], [100, 20], [-90, 35], [80, 30], [10, 45], [130, 40], [-50, -20], [40, -5], [115, 5]];
  const bolts = spots.map(([lon, lat], i) => {
    const per = 0.7 + rnd(i, 9) * 0.6, ph = ((t + rnd(i, 10) * per) % per) / per;
    const [x, y] = toS(c, merc(lon, lat));
    return { x, y, ph, flip: Math.floor((t + rnd(i, 10) * per) / per) % 2 === 0 };
  });
  const flash = bolts.reduce((m, b) => Math.max(m, b.ph < 0.06 ? 1 - b.ph / 0.06 : 0), 0) * (t > C.bijli - 0.3 && t < C.purani ? 1 : 0.4);
  const cross = ramp(t, C.n100 + 0.2, C.n100 + 0.6, inOut);
  const sa = ramp(t, C.sat - 0.4, C.oil, linear);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {t > C.dharti2 - 0.2 && [[-30, 25], [60, 35], [110, 15]].map(([lon, lat], i) => {
        const [x, y] = toS(c, merc(lon, lat));
        return <At key={`cl${i}`} x={x + Math.sin(t * 0.7 + i) * 40 + (t - C.dharti2) * 20} y={y - 180} p={pop(t, C.dharti2 - 0.1 + i * 0.15, 11, 170)} o={0.95}><Cut k="l_storm_cloud" w={420} /></At>;
      })}
      {t > C.bijli - 0.4 && bolts.map((b, i) => <Bolt key={i} x={b.x} y={b.y} h={330 + rnd(i, 13) * 140} o={b.ph < 0.16 ? 1 - b.ph / 0.16 : 0} flip={b.flip} />)}
      <AbsoluteFill style={{ background: '#CFE2FF', opacity: flash * 0.18, mixBlendMode: 'screen' }} />
      {t > C.n44 - 0.2 && t < C.purani && <At x={540} y={330} p={pop(t, C.n44 - 0.1, 9, 220)} o={1 - ramp(t, C.purani - 0.3, C.purani, linear)}><Big text="44 / सेकंड" size={130} color={COL.bolt} /></At>}
      {t > C.purani - 0.2 && <At x={330} y={330} p={pop(t, C.purani - 0.1, 10, 180)} rot={-8}>
        <div style={{ position: 'relative' }}>
          <Cut k="l_old_book" w={460} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '22%', textAlign: 'center' }}><Big text="100" size={120} color="#5A3A14" ink="#F3E3C0" /></div>
          <svg width={460} height={360} viewBox="0 0 460 360" style={{ position: 'absolute', left: 0, top: 0 }}><path d={`M90 230 L${90 + 280 * cross} ${230 - 170 * cross}`} stroke="#E8141F" strokeWidth={22} strokeLinecap="round" /></svg>
        </div>
      </At>}
      {t > C.sat - 0.4 && <At x={-120 + 1320 * sa} y={250 + Math.sin(sa * Math.PI) * -60 + 120} p={pop(t, C.sat - 0.3, 10, 200)} rot={-10 + 6 * sa}><Cut k="l_satellite" w={420} /></At>}
      {t > C.n44b - 0.2 && <At x={780} y={360} p={pop(t, C.n44b - 0.1, 8, 240)} rot={6}>
        <div style={{ padding: '0 30px', border: `12px solid ${COL.bolt}`, borderRadius: 22, background: 'rgba(5,10,25,0.6)' }}><Big text="44" size={180} color={COL.bolt} /></div>
      </At>}
    </AbsoluteFill>
  );
};
/** Oil burned (barrels on fire, pump jacks) and CO2 (smoke clouds rising). */
const Oil: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const o = win(t, C.oil - 0.2, C.roshni + 0.2, 0.3, 0.4);
  if (o <= 0) return null;
  const pts = Object.values(GEO.oil);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {pts.map((p, i) => { const [x, y] = toS(c, p); return i % 4 === 1 ? <At key={i} x={x} y={y - 40} p={pop(t, C.n1200a - 0.35 + i * 0.05, 10, 210)}><div style={{ transform: `rotate(${3 * Math.sin(t * 3 + i)}deg)` }}><Cut k="o_pumpjack" w={150} /></div></At> : <At key={i} x={x} y={y - 50} p={pop(t, C.n1200a - 0.35 + i * 0.05, 10, 210)}><Barrel t={t} i={i} s={1} /></At>; })}
      {t > C.co2a - 0.3 && Array.from({ length: 12 }, (_, i) => {
        const p = pts[(i * 5) % pts.length];
        const [x, y] = toS(c, p);
        const ph = ((t - C.co2a + 0.3) * 0.32 + rnd(i, 14)) % 1;
        return <At key={`s${i}`} x={x + (rnd(i, 15) - 0.5) * 140 + ph * 120} y={y - 120 - ph * 520} p={0.5 + ph * 1.1} o={Math.sin(ph * Math.PI) * ramp(t, C.co2a - 0.3, C.co2a + 0.5, linear)}><Cut k="o_co2_cloud" w={360} shadow={false} /></At>;
      })}
      <At x={540} y={300} p={pop(t, C.n1200a - 0.1, 10, 200)} o={1 - ramp(t, C.co2a - 0.2, C.co2a + 0.2, linear)}><Big text={<>{fmtIN(roll(t, C.n1200a - 0.1, 1200))} बैरल तेल</>} size={110} color={COL.oil} font={UI} /></At>
      {t > C.n1200b - 0.2 && <At x={540} y={300} p={pop(t, C.n1200b - 0.1, 10, 200)}><Big text={<>{fmtIN(roll(t, C.n1200b - 0.1, 1200))} टन CO₂</>} size={110} color="#D7B9A2" font={UI} /></At>}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ space (light ×7.5, the orbit)
const SpaceScene: React.FC<{ t: number }> = ({ t }) => {
  const inQ = ramp(t, C.roshni - 0.6, C.roshni + 0.2, inOut);
  const out = ramp(t, C.yesab - 0.4, C.yesab + 0.3, inOut);
  if (inQ <= 0 || out >= 1) return null;
  const orbit = ramp(t, C.tum - 0.2, C.suraj + 0.6, inOut);
  const r = 300 - 170 * orbit;
  const a0 = -2.25, a = a0 + 0.35 * ramp(t, C.km30 - 0.4, C.km30 + 1.0, inOut);
  const sx = 1020, sy = 1880, R = 980;
  const gx = 540 + (sx + Math.cos(a) * R - 540) * orbit, gy = 900 + (sy + Math.sin(a) * R - 900) * orbit;
  const loops = 7.5 * ramp(t, C.n7 - 0.4, C.chakkar + 0.8, linear);
  const ringO = win(t, C.n7 - 0.5, C.tum, 0.3, 0.3);
  const ph = (loops % 1) * Math.PI * 2;
  const lx = gx + Math.cos(ph) * r * 1.35, ly = gy + Math.sin(ph) * r * 0.36, front = Math.sin(ph) > 0;
  const tang = (Math.atan2(Math.cos(ph) * r * 0.36, -Math.sin(ph) * r * 1.35) * 180) / Math.PI;
  const streak = (z: boolean) => ringO > 0 && front === z && (
    <div style={{ position: 'absolute', left: lx, top: ly, transform: `translate(-100%,-50%) rotate(${tang}deg)`, transformOrigin: '100% 50%', opacity: ringO }}><Cut k="s_light_streak" w={520} screen /></div>
  );
  return (
    <AbsoluteFill style={{ opacity: inQ * (1 - out), background: '#02040A', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: -80, transform: `translate(${-30 * (t - C.roshni)}px, 0) scale(1.1)` }}><Cut k="s_stars" w={1240} screen shadow={false} /></div>
      {orbit > 0.01 && <div style={{ position: 'absolute', left: sx - 470, top: sy - 470, opacity: orbit, transform: `rotate(${t * 5}deg)` }}><Cut k="s_sun" w={940} screen /></div>}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {orbit > 0.01 && <circle cx={sx} cy={sy} r={R} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="10 12" opacity={0.55 * orbit} />}
        {(() => { const p = ramp(t, C.km30 - 0.4, C.km30 + 1.0, inOut); if (p <= 0) return null; return <path d={`M${sx + Math.cos(a0) * R},${sy + Math.sin(a0) * R} A${R} ${R} 0 0 1 ${sx + Math.cos(a) * R},${sy + Math.sin(a) * R}`} fill="none" stroke={COL.gold} strokeWidth={14} strokeLinecap="round" />; })()}
        {ringO > 0 && <ellipse cx={gx} cy={gy} rx={r * 1.35} ry={r * 0.36} fill="none" stroke="#9FD8FF" strokeWidth={4} opacity={0.45 * ringO} />}
      </svg>
      {streak(false)}
      <At x={gx} y={gy} rot={(t - C.roshni) * 14}><Cut k="s_earth" w={r * 2} /></At>
      {streak(true)}
      {ringO > 0 && <At x={540} y={330} p={pop(t, C.n7 - 0.1, 10, 200)} o={ringO}><Big text={<>×{(Math.floor(loops * 2) / 2).toFixed(1)}</>} size={160} color={COL.gold} /></At>}
      {t > C.km30 - 0.3 && <At x={gx - 40} y={gy - r - 110} p={pop(t, C.km30 - 0.2, 10, 200)} rot={-14}><Big text="30 KM" size={120} color={COL.gold} /></At>}
      {t > C.tum - 0.3 && <At x={230} y={1380 - 60 * ramp(t, C.tum - 0.3, C.tum + 0.4, easeOut)} p={pop(t, C.tum - 0.25, 10, 180)} o={1 - ramp(t, C.yesab - 0.3, C.yesab, linear)}><Cut k="a_you_lookup" w={230} /></At>}
      {t > C.tum - 0.1 && <At x={260} y={1000} p={pop(t, C.tum - 0.05, 10, 220)} o={1 - ramp(t, C.yesab - 0.3, C.yesab, linear)}><Tag text="तुम" size={56} color={COL.in} /></At>}
      <div style={{ position: 'absolute', right: 30, bottom: 110, fontFamily: LABEL, fontSize: 22, color: 'rgba(255,255,255,0.55)', opacity: orbit }}>NOT TO SCALE</div>
    </AbsoluteFill>
  );
};

/** "Ye sab hua": every prop of the video flashes past once, then "aur phir bhi…" lands back on the stopwatch. */
const Montage: React.FC<{ t: number }> = ({ t }) => {
  const ks = ['b_baby_1', 'e_envelope', 'e_phone_paid', 'l_storm_cloud', 'o_barrel_fire', 's_earth', 'b_mother_india', 'l_satellite', 'e_coin', 'b_baby_2'];
  const t0 = C.yesab - 0.1;
  if (t < t0 || t > C.phirbhi + 0.3) return null;
  return (
    <>
      {ks.map((k, i) => {
        const a = t0 + i * 0.12, d = t - a;
        if (d < 0 || d > 0.9) return null;
        const ang = i * 2.4, rad = 300 + 140 * (i % 3);
        return <At key={k} x={540 + Math.cos(ang) * rad * (0.6 + d)} y={960 + Math.sin(ang) * rad * (0.6 + d)} p={pop(t, a, 9, 230)} o={1 - clamp01((d - 0.5) / 0.4)} rot={(i % 2 ? 1 : -1) * 12}><Cut k={k} w={260} /></At>;
      })}
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
      {space < 0.999 && <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) rotate(${rollAt(t).toFixed(3)}deg) scale(1.05)` }}>
        <AbsoluteFill style={{ perspective: '1600px', perspectiveOrigin: '540px 700px' }}>
          <AbsoluteFill style={{ transform: `rotateX(${tilt}deg) scale(${1 + tilt / 120})`, transformOrigin: '540px 1100px', boxShadow: tilt > 0.5 ? '0 -20px 60px rgba(0,0,0,0.5)' : undefined }}>
            <AbsoluteFill style={{ filter: blur > 0.6 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
              <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={c} /></AbsoluteFill>
              <Clouds t={t} a={0.35} />
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
      </AbsoluteFill>}
      <SpaceScene t={t} />
      <HookSpace t={t} />
      <Clock t={t} />
      <Montage t={t} />
      {split && <NullPanel t={t} q={split.q} {...split.w} fps={fps} />}
      {captions && <Captions t={t} top={split ? 860 : 1470} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={(t * 98) / DURATION_S} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
