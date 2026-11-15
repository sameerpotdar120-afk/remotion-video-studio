import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { C, CAPS, Cam, DURATION_S, GEO, LOOPF, P, camAt, camSpeed, lineD, merc, ringsD, rollAt, shake, toS } from './cam';
import { ASPECT, FILE } from './assets';
import { LABEL, SERIF, TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';
import { Cut, Hue, Slab } from './Studio';

export const JG_DURATION_S = DURATION_S;
const AUDIO = 'junagadh/audio/mix.wav';
const DARK = '#0B1830';
const COL = { gold: '#FFC21A', red: '#E8202A', blue: '#1F5FD6', green: '#1FA34A', saffron: '#FF8A1E', white: '#F4F4F4', paper: '#F3E6C8' };
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));
const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const has = (k: string) => !!ASPECT[k];
const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');

// ------------------------------------------------------------------ type
const Big: React.FC<{ text: React.ReactNode; size: number; color?: string; font?: string; ink?: string }> = ({ text, size, color = '#fff', font = TITLE, ink = DARK }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 11)}px ${ink}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const Tag: React.FC<{ text: React.ReactNode; color?: string; size?: number; font?: string }> = ({ text, color = COL.gold, size = 46, font = UI }) => (
  <div style={{ padding: `${size * 0.1}px ${size * 0.5}px`, background: 'rgba(10,15,22,0.88)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: '#fff', whiteSpace: 'nowrap', boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: Math.min(1, o) }}>{children}</div>;
/** A date plate: big serif date with a thin gold rule (the documentary look). */
const DatePlate: React.FC<{ d: string; sub?: string; size?: number }> = ({ d, sub, size = 110 }) => (
  <div style={{ textAlign: 'center' }}>
    <Big text={d} size={size} font={SERIF} color="#FFE9B0" />
    {sub && <div style={{ marginTop: 6, display: 'inline-block', padding: '2px 18px', borderTop: `3px solid ${COL.gold}`, fontFamily: LABEL, fontWeight: 600, fontSize: 26, letterSpacing: 4, color: '#FFE9B0', textShadow: '0 4px 10px rgba(0,0,0,0.7)' }}>{sub}</div>}
  </div>
);
/** A place on the map: a pulsing pin and a name plate (Hindi + English). */
const Place: React.FC<{ t: number; t0: number; x: number; y: number; hi: string; en: string; color?: string; up?: boolean; o?: number; size?: number }> = ({ t, t0, x, y, hi, en, color = COL.gold, up = true, o = 1, size = 44 }) => {
  const p = pop(t, t0, 10, 200);
  if (p <= 0 || o <= 0) return null;
  const ph = ((t - t0) * 1.1) % 1;
  const stem = size * 1.35;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: Math.min(1, o) }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <circle cx={x} cy={y} r={12 + 40 * ph} fill="none" stroke={color} strokeWidth={5} opacity={(1 - ph) * p} />
        <circle cx={x} cy={y} r={11 * p} fill={color} stroke="#fff" strokeWidth={4} />
        <line x1={x} y1={y + (up ? -14 : 14)} x2={x} y2={y + (up ? -stem : stem) * p} stroke="#fff" strokeWidth={4} />
      </svg>
      <div style={{ position: 'absolute', left: x, top: y + (up ? -stem - 4 : stem + 4), transform: `translate(-50%, ${up ? '-100%' : '0'}) scale(${p})`, transformOrigin: up ? '50% 100%' : '50% 0', textAlign: 'center', padding: '4px 18px 6px', background: 'rgba(8,12,20,0.88)', border: `4px solid ${color}`, borderRadius: 16, boxShadow: `0 0 22px ${color}66` }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.05, color: '#fff', whiteSpace: 'nowrap' }}>{hi}</div>
        <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: size * 0.45, letterSpacing: 3, color, whiteSpace: 'nowrap' }}>{en}</div>
      </div>
    </div>
  );
};
/** A rubber stamp slamming in (text in a bordered box). */
const Stamp: React.FC<{ t: number; t0: number; hi: string; en?: string; color?: string; rot?: number; size?: number }> = ({ t, t0, hi, en, color = COL.red, rot = -12, size = 92 }) => {
  const d = t - t0;
  if (d < 0) return null;
  const s = d < 0.18 ? 2.4 - 1.4 * (d / 0.18) : 1 + 0.04 * Math.exp(-8 * (d - 0.18)) * Math.cos((d - 0.18) * 30);
  return (
    <div style={{ transform: `rotate(${rot}deg) scale(${s})`, opacity: Math.min(1, d * 8), padding: '6px 30px', border: `10px solid ${color}`, borderRadius: 18, fontFamily: UI, fontWeight: 800, fontSize: size, color, background: 'rgba(255,245,235,0.85)', letterSpacing: 2, lineHeight: 1.1, textAlign: 'center', whiteSpace: 'nowrap' }}>
      {hi}{en && <div style={{ fontFamily: TITLE, fontSize: size * 0.42, letterSpacing: 8 }}>{en}</div>}
    </div>
  );
};

// ------------------------------------------------------------------ portraits: documentary cards, labelled "AI illustration"
type Who = { k: string; hi: string; en: string; sub: string; full?: boolean };
const WHO: Record<string, Who> = {
  patel: { k: 'p_patel', hi: 'सरदार वल्लभभाई पटेल', en: 'SARDAR VALLABHBHAI PATEL', sub: 'गृह मंत्री, भारत · 1947', full: true },
  nawab: { k: 'n_nawab', hi: 'नवाब महाबत ख़ान III', en: 'NAWAB MAHABAT KHAN III', sub: 'जूनागढ़ के नवाब', full: true },
  diwan: { k: 'b_shahnawaz_bhutto', hi: 'शाहनवाज़ भुट्टो', en: 'SIR SHAH NAWAZ BHUTTO', sub: 'जूनागढ़ के दीवान · 1947' },
  zulfi: { k: 'b_zulfikar_bhutto', hi: 'ज़ुल्फ़िक़ार अली भुट्टो', en: 'ZULFIKAR ALI BHUTTO', sub: 'Pakistan के Prime Minister · 1973–77' },
};
const Portrait: React.FC<{ who: Who; t: number; t0: number; w?: number; color?: string; name?: number; hiOverride?: string }> = ({ who, t, t0, w = 440, color = COL.gold, name = 1, hiOverride }) => {
  const h = w * 1.28;
  const a = ASPECT[who.k] ?? 0.6;
  const imgH = who.full ? h * 1.95 : h * 1.04;
  const imgW = imgH * a;
  const kb = 1 + 0.07 * clamp01((t - t0) / 6);
  const sweep = (((t - t0) * 0.35) % 1.6) - 0.3;
  const lift = Math.sin(t * 1.6 + w) * 6;
  return (
    <div style={{ width: w, transform: `translateY(${lift}px)`, filter: 'drop-shadow(0 22px 26px rgba(0,0,0,0.6))' }}>
      <div style={{ position: 'relative', width: w, height: h, borderRadius: 22, overflow: 'hidden', border: `6px solid ${color}`, background: 'radial-gradient(circle at 50% 32%, #6B5638 0%, #2E2416 48%, #120E09 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${kb})`, transformOrigin: '50% 28%' }}>
          {has(who.k) && <Img src={staticFile(`junagadh/img/${FILE[who.k]}`)} style={{ position: 'absolute', width: imgW, height: imgH, left: (w - imgW) / 2, top: who.full ? h * 0.03 : h - imgH }} />}
        </div>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep * 100 - 12}%, rgba(255,240,200,0.18) ${sweep * 100}%, rgba(255,255,255,0) ${sweep * 100 + 12}%)` }} />
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 60px rgba(0,0,0,0.55)' }} />
        <div style={{ position: 'absolute', right: 10, top: 10, padding: '2px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.55)', fontFamily: LABEL, fontSize: 15, letterSpacing: 1, color: 'rgba(255,255,255,0.8)' }}>AI illustration</div>
      </div>
      {name > 0 && (
        <div style={{ marginTop: -26, position: 'relative', textAlign: 'center', opacity: name, transform: `scale(${0.9 + 0.1 * name})` }}>
          <div style={{ display: 'inline-block', padding: '6px 22px 8px', background: 'rgba(8,12,20,0.94)', border: `4px solid ${color}`, borderRadius: 14 }}>
            <div style={{ fontFamily: UI, fontWeight: 800, fontSize: w * 0.105, lineHeight: 1.1, color: '#fff', whiteSpace: 'nowrap' }}>{hiOverride ?? who.hi}</div>
            {!hiOverride && <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: w * 0.043, letterSpacing: 2, color, whiteSpace: 'nowrap' }}>{who.en}</div>}
            <div style={{ fontFamily: UI, fontWeight: 600, fontSize: w * 0.055, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{who.sub}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------ the map layer
/** Junagadh's colour over the story: Pakistan green in the hook and after the Nawab's choice, India red after 9 November. */
const jgState = (t: number): { hue: Hue; g: number } => {
  if (t < C.yehai - 0.3) return { hue: 'green', g: 1 };
  if (t < C.chose) return { hue: 'gold', g: 1 };
  if (t < C.haath) return { hue: 'green', g: 1 };
  if (t < C.pak_last) return { hue: 'red', g: 1 };
  return { hue: 'green', g: 1 };
};
const inRing = (r: P[], x: number, y: number) => {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > y) !== (r[j][1] > y) && x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) c = !c;
  return c;
};
/** Villages for "गाँव-गाँव": seeded dots inside the (approximate) state outline. */
const VILLAGES: P[] = (() => {
  const out: P[] = [];
  for (let i = 0; out.length < 46 && i < 2000; i++) {
    const p = merc(69.9 + rnd(i, 1) * 1.35, 20.78 + rnd(i, 2) * 1.0);
    if (inRing(GEO.junagadh[0], p[0], p[1])) out.push(p);
  }
  return out;
})();
const MapVectors: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const wide = c.mpp > 420;
  const flash = (t0: number) => Math.max(0, 1 - Math.abs(t - t0 - 0.12) / 0.22);
  const js = jgState(t);
  const [jx, jy] = toS(c, GEO.jg_center);
  const jd = ringsD(c, GEO.junagadh);
  // India and Pakistan as slabs when the camera is out wide
  const indO = wide ? clamp01((c.mpp - 420) / 200) * (win(t, -1, C.yehai, 0.01, 0.5) + win(t, C.azadi - 0.2, C.sardar + 0.4, 0.4, 0.5) + win(t, C.mumbai - 0.3, C.gaon, 0.4, 0.4) + win(t, C.karachi - 0.4, C.n9 + 0.3, 0.4, 0.4) + win(t, C.n2020 - 0.3, C.somnath3, 0.4, 0.5) + win(t, C.pak_last - 0.2, DURATION_S + 1, 0.5, 0.01)) : 0;
  const pakO = wide ? clamp01((c.mpp - 420) / 200) * clamp01(win(t, -1, C.yehai, 0.01, 0.5) + win(t, C.pakc - 0.2, C.sardar + 0.4, 0.4, 0.5) + win(t, C.karachi - 0.4, C.n9 + 0.3, 0.4, 0.4) + win(t, C.n2020 - 0.3, C.somnath3, 0.4, 0.5) + win(t, C.pak_last - 0.2, DURATION_S + 1, 0.5, 0.01)) : 0;
  const gujO = win(t, C.gujarat1 - 0.1, C.somnath1, 0.3, 0.5);
  // Pakistan's 2020 map: a hatched claim over Junagadh (and Manavadar)
  const claimO = win(t, C.map1 - 0.1, C.yehai - 0.2, 0.3, 0.4) + win(t, C.newmap - 0.2, C.somnath3 - 0.2, 0.3, 0.4) + win(t, C.map_last - 0.3, DURATION_S + 1, 0.4, 0.01) + win(t, -1, 0.6, 0.01, 0.4);
  const ringO = win(t, C.naka - 0.1, C.mumbai - 0.1, 0.3, 0.4);
  const ringR = 360 / (c.mpp / 300) * (1.25 - 0.25 * ramp(t, C.naka - 0.1, C.naka + 0.9, easeOut));
  const villO = win(t, C.gaon - 0.4, C.october, 0.3, 0.4);
  const centroid = (k: string): P => { const r = GEO.countries[k][0]; let x = 0, y = 0; for (const p of r) { x += p[0]; y += p[1]; } return toS(c, [x / r.length, y / r.length]); };
  const [ix, iy] = centroid('India'), [px, py] = centroid('Pakistan');
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <pattern id="hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform={`rotate(45) translate(${(t * 20) % 18} 0)`}><rect width="18" height="18" fill="rgba(31,163,74,0.25)" /><rect width="7" height="18" fill="#1FC25A" /></pattern>
      </defs>
      {wide && <path d={GEO.borders.map((l) => lineD(c, l)).join('')} fill="none" stroke="#fff" strokeWidth={1.4} opacity={0.35} />}
      {indO > 0.01 && <Slab id="ind" t={t} d={ringsD(c, GEO.countries.India)} hue="red" g={clamp01(indO)} depth={16} cx={ix} cy={iy} s={0.99 + 0.02 * Math.sin(t * LOOPF(23))} />}
      {pakO > 0.01 && <Slab id="pak" t={t} d={ringsD(c, GEO.countries.Pakistan)} hue="green" g={clamp01(pakO)} depth={16} cx={px} cy={py} s={0.99 + 0.02 * Math.sin(t * LOOPF(19) + 1)} />}
      {gujO > 0.01 && <Slab id="guj" t={t} d={ringsD(c, GEO.countries.Gujarat)} hue="blue" g={gujO} depth={12} cx={jx} cy={jy} />}
      <Slab id={`jg_${js.hue}`} t={t} d={jd} hue={js.hue} g={js.g} depth={wide ? 10 : 18} cx={jx} cy={jy} alpha={wide ? 1 : 0.22 + 0.38 * clamp01((c.mpp - 80) / 110)}
        s={1 + 0.05 * pop(t, C.yehai, 9, 200) * (t < C.zila ? 1 : 0) + 0.04 * Math.sin(t * LOOPF(29))} />
      {[C.yehai, C.chose, C.haath, C.pak_last].map((t0, i) => flash(t0) > 0 && <path key={i} d={jd} fill="#fff" opacity={flash(t0)} />)}
      {claimO > 0.01 && <g opacity={clamp01(claimO)}>
        <path d={jd} fill="url(#hatch)" stroke="#1FC25A" strokeWidth={4} strokeDasharray="14 10" />
        <path d={ringsD(c, GEO.manavadar)} fill="url(#hatch)" stroke="#1FC25A" strokeWidth={3} strokeDasharray="10 8" />
      </g>}
      {ringO > 0.01 && <g opacity={ringO} transform={`rotate(${t * 18} ${jx} ${jy})`}>
        <circle cx={jx} cy={jy} r={ringR} fill="none" stroke={COL.red} strokeWidth={22} opacity={0.3} />
        <circle cx={jx} cy={jy} r={ringR} fill="none" stroke="#fff" strokeWidth={8} strokeDasharray="34 18" />
      </g>}
      {villO > 0.01 && VILLAGES.map((v, i) => {
        const [x, y] = toS(c, v);
        const flip = ramp(t, C.gaon - 0.2 + i * 0.03, C.gaon + i * 0.03, linear);
        return <g key={i} opacity={villO}><circle cx={x} cy={y} r={9 + 5 * pop(t, C.gaon + i * 0.03, 8, 260)} fill={flip > 0.5 ? COL.saffron : COL.green} stroke="#fff" strokeWidth={3} /></g>;
      })}
    </svg>
  );
};

// ------------------------------------------------------------------ the scenes
const Scenes: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const w = (a: number, b: number, fi = 0.25, fo = 0.3) => win(t, a, b, fi, fo);
  const s = (k: string) => toS(c, GEO.places[k]);
  const [jx, jy] = s('junagadh'), [kx, ky] = s('karachi'), [sx, sy] = s('somnath'), [mx, my] = s('mumbai');
  const [cx, cy] = toS(c, GEO.jg_center);
  // the hook's kinetic title (frame 0 and the loop's end)
  const kin = Math.max(1 - ramp(t, 1.2, 1.9, linear), ramp(t, DURATION_S - 1.4, DURATION_S - 0.05, linear));
  const kq = t < 3 ? t / 2.0 : clamp01((DURATION_S - t) / 1.4);
  // the Nawab's flight, Junagadh → Karachi
  const fl = ramp(t, C.october + 0.2, C.bhaag + 0.3, inOut);
  const arc = (q: number): P => [cx + (kx - cx) * q, cy + (ky - cy) * q - Math.sin(q * Math.PI) * 260];
  // portraits
  const diwanSlide = ramp(t, C.pm - 0.4, C.pm + 0.3, inOut);
  const votes = 190870 * easeOut(ramp(t, C.votes - 0.1, C.vote + 0.3, linear));
  return (
    <>
      {/* ---------------- hook */}
      {kin > 0.01 && <At x={540 + 280 * (0.5 - kq)} y={700} o={kin} p={2.5 - 1.5 * clamp01(kq)} rot={-6}><Big text="1947" size={250} font={SERIF} color="#FFE9B0" /></At>}
      {t > C.gujarat1 - 0.2 && t < C.somnath1 && (() => { const [x, y] = toS(c, merc(71.8, 22.6)); return <At x={x} y={y} p={pop(t, C.gujarat1 - 0.1, 10, 200)} o={w(C.gujarat1 - 0.2, C.somnath1)}><Tag text={<>गुजरात <span style={{ fontFamily: LABEL, fontSize: 24, letterSpacing: 3, color: '#9FD6FF' }}>GUJARAT</span></>} color="#3AA8FF" size={50} /></At>; })()}
      {t > C.pak1 - 0.3 && t < C.somnath1 + 0.2 && (() => {
        const q = ramp(t, C.pak1 - 0.2, C.pak1 + 0.9, inOut);
        const d = `M${cx},${cy} Q${(cx + kx) / 2 - 60},${Math.min(cy, ky) - 240} ${kx},${ky}`;
        return <>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: w(C.pak1 - 0.3, C.somnath1 + 0.2) }}>
            <path d={d} fill="none" stroke="#1FC25A" strokeWidth={10} strokeDasharray={`${1400 * q} 1400`} strokeLinecap="round" />
            <path d={d} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray={`${1400 * q} 1400`} strokeLinecap="round" />
          </svg>
          <Place t={t} t0={C.pak1 + 0.4} x={kx} y={ky} hi="Pakistan" en="KARACHI · 1947" color="#1FC25A" o={w(C.pak1 - 0.3, C.somnath1 + 0.2)} />
        </>;
      })()}
      {t > C.somnath1 - 0.2 && t < C.map1 + 0.5 && <>
        <Place t={t} t0={C.somnath1} x={sx} y={sy} hi="सोमनाथ मंदिर" en="SOMNATH" color={COL.saffron} up={false} o={w(C.somnath1 - 0.2, C.map1 + 0.5)} />
        <At x={sx + 40} y={sy - 330} p={0.5 + 0.5 * pop(t, C.somnath1 + 0.1, 11, 170)} o={w(C.somnath1 - 0.2, C.map1 + 0.5)}><Cut k="s_somnath_ruins" w={560} /></At>
      </>}
      {t > C.map1 - 0.1 && t < C.yehai - 0.2 && <At x={540} y={300} p={pop(t, C.map1, 9, 220)} o={w(C.map1 - 0.1, C.yehai - 0.2)}><Tag text={<>Pakistan का Map · <span style={{ color: '#5BE07F' }}>आज भी</span></>} color="#1FC25A" size={54} /></At>}
      {t > C.map1 + 0.2 && t < C.yehai - 0.2 && <At x={cx + 40} y={cy + 150} p={pop(t, C.map1 + 0.4, 10, 200)} o={w(C.map1 + 0.2, C.yehai - 0.2)}><Tag text="जूनागढ़ = Pakistan ?" color="#1FC25A" size={40} /></At>}
      {t > C.kaise - 0.1 && t < C.yehai && <At x={820} y={1180} p={pop(t, C.kaise, 8, 240)} o={w(C.kaise - 0.1, C.yehai)} rot={8}><Big text="?" size={300} color={COL.gold} /></At>}

      {/* ---------------- this is Junagadh */}
      {t > C.yehai - 0.1 && t < C.nawab1 && <Place t={t} t0={C.yehai} x={jx} y={jy} hi="जूनागढ़" en="JUNAGADH" color={COL.gold} size={64} o={w(C.yehai - 0.1, C.nawab1)} />}
      {t > C.zila - 0.2 && t < C.nawab1 && ([['veraval', 'वेरावल', 'VERAVAL', false], ['keshod', 'केशोद', 'KESHOD', true], ['una', 'ऊना', 'UNA', false], ['visavadar', 'विसावदर', 'VISAVADAR', true], ['kutiyana', 'कुतियाना', 'KUTIYANA', true]] as const).map(([k, hi, en, up], i) => { const [x, y] = s(k); return <Place key={k} t={t} t0={C.zila - 0.1 + i * 0.16} x={x} y={y} hi={hi} en={en} color="#FFE07A" up={up} size={34} o={w(C.zila - 0.2, C.nawab1)} />; })}
      {t > C.zila - 0.2 && t < C.princely && <At x={540} y={300} p={pop(t, C.zila - 0.1, 9, 220)} o={w(C.zila - 0.2, C.princely)}><Tag text={<>आज: Gujarat का एक <span style={{ color: COL.gold }}>ज़िला</span></>} size={52} /></At>}
      {t > C.princely - 0.2 && t < C.n80 && <At x={540} y={300} p={pop(t, C.princely - 0.1, 9, 220)} o={w(C.princely - 0.2, C.n80)}><div style={{ textAlign: 'center' }}><DatePlate d="1947" size={96} /><div style={{ marginTop: 8 }}><Tag text={<>रियासत · <span style={{ fontFamily: LABEL, fontSize: 34, letterSpacing: 3 }}>PRINCELY STATE</span></>} size={50} /></div></div></At>}
      {t > C.n80 - 0.2 && t < C.nawab1 + 0.2 && (() => {
        const fill = 0.8 * easeOut(ramp(t, C.n80 - 0.1, C.n80 + 0.9, linear));
        return <At x={540} y={330} p={pop(t, C.n80 - 0.1, 10, 200)} o={w(C.n80 - 0.2, C.nawab1 + 0.2)}>
          <div style={{ width: 860, padding: '18px 26px', background: 'rgba(8,12,20,0.9)', border: `5px solid ${COL.saffron}`, borderRadius: 24, boxShadow: `0 0 30px ${COL.saffron}55` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 56, color: '#fff' }}>{t > C.hindu - 0.1 ? 'हिंदू आबादी' : 'आबादी'}</span>
              <span style={{ fontFamily: TITLE, fontSize: 84, color: COL.saffron }}>~{Math.round(fill * 100)}%</span>
            </div>
            <div style={{ marginTop: 8, height: 46, borderRadius: 23, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
              <div style={{ width: `${fill * 100}%`, height: '100%', background: `linear-gradient(90deg, #FF6A00, ${COL.saffron}, #FFC266)`, boxShadow: 'inset 0 -6px 10px rgba(0,0,0,0.25)' }} />
            </div>
          </div>
        </At>;
      })()}
      {t > C.nawab1 - 0.2 && t < C.azadi + 0.4 && <At x={540} y={1060} p={pop(t, C.nawab1 - 0.1, 11, 170)} o={w(C.nawab1 - 0.2, C.azadi + 0.4)}><Portrait who={WHO.nawab} t={t} t0={C.nawab1} w={500} color={COL.gold} /></At>}
      {t > C.nawab1 + 0.2 && t < C.azadi + 0.4 && <At x={540} y={300} p={pop(t, C.nawab1 + 0.3, 9, 220)} o={w(C.nawab1 + 0.2, C.azadi + 0.4)}><Tag text={<>पर राजा: <span style={{ color: COL.gold }}>नवाब</span></>} size={56} /></At>}

      {/* ---------------- the choice */}
      {t > C.bharat1 - 0.2 && t < C.n15 && <At x={300} y={330} p={pop(t, C.bharat1 - 0.1, 9, 220)} o={w(C.bharat1 - 0.2, C.n15)} rot={-4}><Tag text="भारत" color={COL.red} size={80} /></At>}
      {t > C.pakc - 0.2 && t < C.n15 && <At x={780} y={330} p={pop(t, C.pakc - 0.1, 9, 220)} o={w(C.pakc - 0.2, C.n15)} rot={4}><Tag text="Pakistan" color="#1FC25A" size={80} /></At>}
      {t > C.pakc + 0.2 && t < C.n15 && <At x={540} y={480} p={pop(t, C.pakc + 0.3, 9, 220)} o={w(C.pakc + 0.2, C.n15)}><Big text="या" size={90} font={UI} color={COL.gold} /></At>}
      {t > C.azadi - 0.1 && t < C.bharat1 && <At x={540} y={330} p={pop(t, C.azadi, 9, 220)} o={w(C.azadi - 0.1, C.bharat1)}><Tag text={<>हर रियासत को <span style={{ color: COL.gold }}>चुनना</span> था</>} size={58} /></At>}
      {t > C.n15 - 0.2 && t < C.zameen && <At x={540} y={290} p={pop(t, C.n15 - 0.1, 9, 220)} o={w(C.n15 - 0.2, C.zameen)}><DatePlate d="15 सितंबर 1947" sub="ACCESSION TO PAKISTAN" size={92} /></At>}
      {t > C.n15 + 0.2 && t < C.zameen && <At x={560} y={1120} p={pop(t, C.n15 + 0.3, 11, 170)} o={w(C.n15 + 0.2, C.zameen)} rot={-3 + Math.sin(t * 1.3) * 1.5}><Cut k="d_accession" w={800} /></At>}
      {t > C.chose - 0.3 && t < C.zameen && <At x={600} y={1190} o={w(C.chose - 0.3, C.zameen)}><Stamp t={t} t0={C.chose - 0.1} hi="Pakistan ✔" color="#169B4A" size={84} /></At>}
      {t > C.n15 + 0.5 && t < C.zameen && <At x={240} y={760} p={pop(t, C.n15 + 0.6, 11, 170)} o={w(C.n15 + 0.5, C.zameen)}><Portrait who={WHO.nawab} t={t} t0={C.n15} w={300} name={0} /></At>}

      {/* ---------------- not even connected */}
      {t > C.zameen - 0.2 && t < C.teen && (() => {
        // the gap: Junagadh → the nearest Pakistani land (Sindh coast), across Kutch and the sea
        const [gx, gy] = toS(c, merc(68.6, 23.7));
        const q = ramp(t, C.zameen, C.nahi, inOut);
        return <>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: w(C.zameen - 0.2, C.teen) }}>
            <line x1={cx} y1={cy} x2={cx + (gx - cx) * q} y2={cy + (gy - cy) * q} stroke="#fff" strokeWidth={7} strokeDasharray="18 14" />
          </svg>
          {t > C.nahi - 0.2 && <At x={(cx + gx) / 2} y={(cy + gy) / 2} o={w(C.nahi - 0.2, C.teen)}><Stamp t={t} t0={C.nahi - 0.1} hi="✕ जुड़ा नहीं" size={64} rot={-8} /></At>}
        </>;
      })()}
      {t > C.teen - 0.2 && t < C.sardar + 0.3 && (() => {
        const o = w(C.teen - 0.2, C.sardar + 0.3);
        const arrows = [[-150, -170, 0], [0, -230, 0.2], [190, -120, 0.4]];
        return <>
          {arrows.map(([dx, dy, d0], i) => { const p = pop(t, C.teen + d0, 10, 220); const ang = Math.atan2(-dy, -dx) * 180 / Math.PI; return p > 0 && <At key={i} x={cx + dx * (1.25 - 0.25 * p)} y={cy + dy * (1.25 - 0.25 * p)} p={p} o={o} rot={ang}><svg width={140} height={60} viewBox="0 0 140 60"><path d="M0,18 L90,18 L90,0 L140,30 L90,60 L90,42 L0,42 Z" fill={COL.red} stroke="#fff" strokeWidth={5} /></svg></At>; })}
          {t > C.teen + 0.3 && <At x={cx + 30} y={cy - 300} p={pop(t, C.teen + 0.4, 10, 200)} o={o}><Tag text={<>तीन तरफ़ <span style={{ color: '#FF6B6B' }}>भारत</span></>} color={COL.red} size={50} /></At>}
          {t > C.samundar - 0.3 && (() => { const ph = ((t - C.samundar) * 0.9) % 1; return <>
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
              {[0, 0.33, 0.66].map((k) => { const q = (ph + k) % 1; return <path key={k} d={`M${cx - 260 - 120 * q},${cy + 90 + 120 * q} q60,-30 120,0 t120,0 t120,0`} fill="none" stroke="#7FD4FF" strokeWidth={7} opacity={(1 - q) * 0.9} strokeLinecap="round" />; })}
            </svg>
            <At x={cx - 170} y={cy + 230} p={pop(t, C.samundar - 0.2, 10, 200)} o={o}><Tag text="सामने समुंदर" color="#3AA8FF" size={46} /></At>
          </>; })()}
        </>;
      })()}

      {/* ---------------- Patel, the blockade, the Arzi Hukumat */}
      {t > C.sardar - 0.3 && t < C.mumbai && <At x={540} y={1000 + 30 * ramp(t, C.naka, C.mumbai, linear)} p={pop(t, C.sardar - 0.2, 11, 170) * (1 - 0.35 * ramp(t, C.naka - 0.2, C.naka + 0.4, inOut))} o={w(C.sardar - 0.3, C.mumbai)}><Portrait who={WHO.patel} t={t} t0={C.sardar} w={520} color={COL.saffron} /></At>}
      {t > C.naka - 0.2 && t < C.mumbai + 0.2 && <At x={540} y={300} o={w(C.naka - 0.2, C.mumbai + 0.2)}><Stamp t={t} t0={C.naka - 0.1} hi="नाकाबंदी" en="BLOCKADE" rot={-6} size={84} /></At>}
      {t > C.mumbai - 0.3 && t < C.gaon && <>
        <Place t={t} t0={C.mumbai} x={mx} y={my} hi="बॉम्बे (मुंबई)" en="BOMBAY · 25 SEPT 1947" color={COL.saffron} o={w(C.mumbai - 0.3, C.gaon)} />
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: w(C.mumbai, C.gaon) }}>
          <path d={`M${mx},${my} Q${(mx + jx) / 2 + 120},${(my + jy) / 2 - 40} ${jx},${jy}`} fill="none" stroke={COL.saffron} strokeWidth={7} strokeDasharray={`${1500 * ramp(t, C.sarkar - 0.4, C.arzi + 0.6, inOut)} 1500`} strokeLinecap="round" />
        </svg>
      </>}
      {t > C.sarkar - 0.4 && t < C.gaon + 0.2 && <At x={470} y={1290} p={pop(t, C.sarkar - 0.3, 11, 170)} o={w(C.sarkar - 0.4, C.gaon + 0.2)}><Cut k="a_volunteers" w={640} /></At>}
      {t > C.arzi - 0.2 && t < C.gaon + 0.2 && <At x={540} y={330} o={w(C.arzi - 0.2, C.gaon + 0.2)}><Stamp t={t} t0={C.arzi - 0.1} hi="आरज़ी हुकूमत" en="PEOPLE'S GOVERNMENT" color={COL.saffron} rot={-5} size={80} /></At>}
      {t > C.gaon - 0.2 && t < C.october && <At x={540} y={300} p={pop(t, C.gaon - 0.1, 9, 220)} o={w(C.gaon - 0.2, C.october)}><Tag text={<>गाँव-गाँव <span style={{ color: COL.saffron }}>control</span> में</>} color={COL.saffron} size={60} /></At>}

      {/* ---------------- the Nawab leaves for Karachi */}
      {t > C.october - 0.2 && t < C.n9 && <At x={540} y={300} p={pop(t, C.october - 0.1, 9, 220)} o={w(C.october - 0.2, C.n9)}><DatePlate d="October 1947" size={92} /></At>}
      {t > C.october && t < C.n9 + 0.2 && <>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: w(C.october, C.n9 + 0.2) }}>
          <path d={`M${cx},${cy} Q${(cx + kx) / 2},${Math.min(cy, ky) - 520} ${kx},${ky}`} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="16 14" opacity={0.85} />
        </svg>
        {t > C.karachi - 0.3 && <Place t={t} t0={C.karachi - 0.2} x={kx} y={ky} hi="कराची" en="KARACHI" color="#1FC25A" up={false} o={w(C.karachi - 0.3, C.n9 + 0.2)} />}
        {(() => { const [x, y] = arc(fl); return <At x={x} y={y - 120} p={pop(t, C.october + 0.1, 11, 170) * (1 - 0.3 * fl)} o={w(C.october, C.n9)} rot={-6 + 10 * fl}><Portrait who={WHO.nawab} t={t} t0={C.october} w={240} name={0} /></At>; })()}
      </>}

      {/* ---------------- 9 November, the Dewan, the Bhuttos */}
      {t > C.n9 - 0.2 && t < C.diwan1 + 0.6 && <At x={540} y={290} p={pop(t, C.n9 - 0.1, 9, 220)} o={w(C.n9 - 0.2, C.diwan1 + 0.6)}><DatePlate d="9 नवंबर 1947" sub="INDIA TAKES OVER" size={96} /></At>}
      {t > C.diwan1 - 0.3 && t < C.n13 && (() => {
        const x = 540 + (300 - 540) * diwanSlide, y = 1000 + (860 - 1000) * diwanSlide;
        const named = ramp(t, C.shahnawaz - 0.2, C.shahnawaz + 0.2, linear);
        return <At x={x} y={y} p={pop(t, C.diwan1 - 0.2, 11, 170) * (1 - 0.28 * diwanSlide)} o={w(C.diwan1 - 0.3, C.n13)}>
          <Portrait who={WHO.diwan} t={t} t0={C.diwan1} w={480} color={COL.gold} hiOverride={named < 0.5 ? 'नवाब के दीवान' : undefined} />
        </At>;
      })()}
      {t > C.haath - 0.2 && t < C.shahnawaz && <At x={540} y={290} o={w(C.haath - 0.2, C.shahnawaz)}><Stamp t={t} t0={C.haath - 0.1} hi="भारत ✔" color={COL.red} size={84} rot={-7} /></At>}
      {t > C.pm - 0.3 && t < C.n13 && <At x={790} y={860} p={pop(t, C.pm - 0.2, 11, 170) * 0.72} o={w(C.pm - 0.3, C.n13)}><Portrait who={WHO.zulfi} t={t} t0={C.pm} w={480} color="#1FC25A" /></At>}
      {t > C.pita - 0.4 && t < C.n13 && (() => {
        const q = ramp(t, C.pita - 0.4, C.pita + 0.3, inOut);
        return <>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: w(C.pita - 0.4, C.n13) }}>
            <path d={`M420,${560} Q540,${470} 660,${560}`} fill="none" stroke={COL.gold} strokeWidth={8} strokeDasharray={`${300 * q} 300`} strokeLinecap="round" />
          </svg>
          <At x={540} y={440} p={pop(t, C.pita - 0.2, 9, 220)} o={w(C.pita - 0.4, C.n13)}><Tag text="पिता → बेटा" size={50} /></At>
        </>;
      })()}

      {/* ---------------- Somnath */}
      {t > C.n13 - 0.2 && t < C.khandhar && <At x={540} y={290} p={pop(t, C.n13 - 0.1, 9, 220)} o={w(C.n13 - 0.2, C.khandhar)}><DatePlate d="13 नवंबर 1947" sub="PATEL AT SOMNATH" size={92} /></At>}
      {t > C.khandhar - 0.3 && t < C.n1951 + 0.6 && <At x={sx} y={sy - 200 - 30 * ramp(t, C.khandhar, C.n1951, linear)} p={0.6 + 0.4 * pop(t, C.khandhar - 0.2, 12, 160)} o={w(C.khandhar - 0.3, C.n1951 + 0.6, 0.3, 0.7)}><Cut k="s_somnath_ruins" w={860} /></At>}
      {t > C.khandhar - 0.1 && t < C.faisla && <At x={540} y={290} p={pop(t, C.khandhar, 9, 220)} o={w(C.khandhar - 0.1, C.faisla)}><Tag text="मंदिर: खंडहर" color="#C9A27A" size={60} /></At>}
      {t > C.faisla - 0.2 && t < C.n1951 && <At x={540} y={290} p={pop(t, C.faisla - 0.1, 9, 220)} o={w(C.faisla - 0.2, C.n1951)}><Tag text={<>फिर से <span style={{ color: COL.saffron }}>बनाने</span> का फ़ैसला</>} color={COL.saffron} size={56} /></At>}
      {t > C.n1951 - 0.3 && t < C.feb + 0.3 && <>
        <Rays t={t} x={sx} y={sy - 230} o={w(C.n1951 - 0.3, C.feb + 0.3, 0.6, 0.5)} />
        <At x={sx} y={sy - 230 - 30 * ramp(t, C.n1951, C.feb, linear)} p={0.92 + 0.08 * pop(t, C.n1951 - 0.2, 12, 160)} o={w(C.n1951 - 0.3, C.feb + 0.3, 0.7, 0.5)}><Cut k="s_somnath_new" w={880} /></At>
        <At x={540} y={290} p={pop(t, C.n1951 - 0.1, 9, 220)} o={w(C.n1951 - 0.3, C.feb + 0.3)}><DatePlate d="1951" sub="नया सोमनाथ मंदिर" size={130} /></At>
      </>}

      {/* ---------------- the 1948 vote */}
      {t > C.feb - 0.2 && t < C.n2020 && <At x={540} y={290} p={pop(t, C.feb - 0.1, 9, 220)} o={w(C.feb - 0.2, C.bharat_q)}><DatePlate d="फ़रवरी 1948" sub="REFERENDUM" size={92} /></At>}
      {t > C.feb && t < C.n2020 && <At x={540} y={1180} p={pop(t, C.feb + 0.1, 11, 170)} o={w(C.feb, C.n2020)} rot={Math.sin(t * 1.4) * 1.5}><Cut k="v_ballot_box" w={600} /></At>}
      {t > C.bharat_q - 0.2 && t < C.votes && <>
        <At x={300} y={330} p={pop(t, C.bharat_q - 0.1, 9, 220)} o={w(C.bharat_q - 0.2, C.votes)} rot={-4}><Tag text="भारत" color={COL.red} size={76} /></At>
        <At x={780} y={330} p={pop(t, C.bharat_q + 0.7, 9, 220)} o={w(C.bharat_q + 0.5, C.votes)} rot={4}><Tag text="Pakistan ?" color="#1FC25A" size={76} /></At>
      </>}
      {t > C.votes - 0.2 && t < C.n2020 && <At x={540} y={360} p={pop(t, C.votes - 0.1, 9, 220)} o={w(C.votes - 0.2, C.n2020)}>
        <div style={{ width: 900, padding: '18px 28px 22px', background: 'rgba(8,12,20,0.92)', border: `5px solid ${COL.gold}`, borderRadius: 26, boxShadow: `0 0 34px ${COL.gold}44`, textAlign: 'center' }}>
          <div style={{ fontFamily: TITLE, fontSize: 124, lineHeight: 1.05, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{fmt(votes)}</div>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 40, color: COL.gold }}>vote पड़े</div>
          {t > C.vote + 0.5 && (() => {
            const g = pop(t, C.vote + 0.6, 10, 200);
            return <div style={{ marginTop: 14, textAlign: 'left', opacity: Math.min(1, g * 2) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 200, fontFamily: UI, fontWeight: 800, fontSize: 40, color: '#fff' }}>भारत</span>
                <div style={{ flex: 1, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.12)' }}><div style={{ width: `${99.95 * g}%`, height: '100%', borderRadius: 17, background: `linear-gradient(90deg, #B8000F, ${COL.red}, #FF6B6B)` }} /></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
                <span style={{ width: 200, fontFamily: UI, fontWeight: 800, fontSize: 40, color: '#fff' }}>Pakistan</span>
                <div style={{ flex: 1, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.12)', position: 'relative' }}><div style={{ width: 6, height: '100%', borderRadius: 3, background: '#1FC25A', boxShadow: '0 0 12px #1FC25A' }} /></div>
                {t > C.n91 - 0.2 && <span style={{ fontFamily: TITLE, fontSize: 64 * (0.6 + 0.4 * pop(t, C.n91 - 0.1, 8, 260)), color: '#5BE07F' }}>91</span>}
              </div>
            </div>;
          })()}
        </div>
      </At>}

      {/* ---------------- Pakistan's 2020 map */}
      {t > C.n2020 - 0.2 && t < C.somnath3 && <At x={540} y={250} p={pop(t, C.n2020 - 0.1, 9, 220)} o={w(C.n2020 - 0.2, C.somnath3)}><DatePlate d="4 अगस्त 2020" sub="PAKISTAN'S NEW MAP" size={84} /></At>}
      {t > C.newmap - 0.3 && t < C.somnath3 && (() => { const [vx, vy] = s('manavadar'); return <>
        <At x={cx + 40} y={cy - 150} p={pop(t, C.newmap - 0.2, 10, 200)} o={w(C.newmap - 0.3, C.somnath3)}><Tag text="जूनागढ़ + मानावदर" color="#1FC25A" size={40} /></At>
        {t > C.dikhaya - 0.3 && <At x={vx + 60} y={vy + 40} o={w(C.dikhaya - 0.3, C.somnath3)}><Stamp t={t} t0={C.dikhaya - 0.1} hi="सिर्फ़ काग़ज़ पर" color={COL.red} size={56} rot={-9} /></At>}
      </>; })()}

      {/* ---------------- the ending: darshan without a passport, one signature, and the loop */}
      {t > C.somnath3 - 0.3 && t < C.signature + 0.2 && <>
        <Rays t={t} x={sx} y={sy - 230} o={w(C.somnath3 - 0.3, C.signature + 0.2, 0.6, 0.4)} />
        <At x={sx} y={sy - 230 - 25 * ramp(t, C.somnath3, C.signature, linear)} p={0.9 + 0.1 * pop(t, C.somnath3 - 0.2, 12, 160)} o={w(C.somnath3 - 0.3, C.signature + 0.2, 0.5, 0.4)}><Cut k="s_somnath_new" w={860} /></At>
        <At x={540} y={290} p={pop(t, C.darshan - 0.1, 9, 220)} o={w(C.darshan - 0.2, C.signature)}><Tag text={<>सोमनाथ के <span style={{ color: COL.saffron }}>दर्शन</span></>} color={COL.saffron} size={60} /></At>
      </>}
      {t > C.passport - 0.3 && t < C.signature + 0.2 && <At x={830} y={1200} p={0.8 * pop(t, C.passport - 0.2, 10, 200)} o={w(C.passport - 0.3, C.signature + 0.2)} rot={6}><Passport t={t} t0={C.passport + 0.2} /></At>}
      {t > C.signature - 0.3 && t < C.map_last && <>
        <At x={540} y={1130} p={pop(t, C.signature - 0.2, 11, 170)} o={w(C.signature - 0.3, C.map_last)} rot={-3}>
          <div style={{ position: 'relative' }}>
            <Cut k="d_accession" w={820} />
            <svg width={820} height={571} viewBox="0 0 820 571" style={{ position: 'absolute', left: 0, top: 0 }}>
              <path d="M300,388 c20,-40 40,-40 30,0 c-8,30 20,-46 44,-20 c14,16 -10,34 6,26 c22,-12 30,-40 46,-22 c10,12 -6,26 12,18 c18,-8 34,-26 52,-12" fill="none" stroke="#1B2A6B" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={`${520 * ramp(t, C.signature - 0.1, C.signature + 0.9, linear)} 520`} />
            </svg>
          </div>
        </At>
        <At x={540} y={290} p={pop(t, C.signature - 0.1, 9, 220)} o={w(C.signature - 0.3, C.pak_last)}><Tag text={<>एक <span style={{ color: COL.gold }}>Signature</span></>} size={60} /></At>
        {t > C.pak_last - 0.2 && <At x={640} y={1230} o={w(C.pak_last - 0.2, C.map_last)}><Stamp t={t} t0={C.pak_last - 0.1} hi="Pakistan ✔" color="#169B4A" size={80} /></At>}
      </>}
      {t > C.map_last - 0.3 && <At x={540} y={1230} p={pop(t, C.map_last - 0.2, 9, 220)} o={w(C.map_last - 0.3, DURATION_S - 0.6, 0.3, 0.6)}><Tag text={<>Pakistan का Map · <span style={{ color: '#5BE07F' }}>आज भी…</span></>} color="#1FC25A" size={54} /></At>}
    </>
  );
};
/** Slow rotating light rays behind the temple (drawn in code). */
const Rays: React.FC<{ t: number; x: number; y: number; o: number }> = ({ t, x, y, o }) => o <= 0 ? null : (
  <div style={{ position: 'absolute', left: x - 900, top: y - 900, width: 1800, height: 1800, opacity: o * 0.75, borderRadius: '50%', transform: `rotate(${t * 6}deg)`,
    background: 'repeating-conic-gradient(from 0deg, rgba(255,200,110,0.30) 0deg 6deg, rgba(255,200,110,0) 6deg 18deg)', WebkitMaskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0.6) 30%, transparent 62%)', maskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0.6) 30%, transparent 62%)', mixBlendMode: 'screen' }} />
);
/** A passport drawn in code, struck through: "बिना Passport". */
const Passport: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const q = ramp(t, t0, t0 + 0.35, easeOut);
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={220} height={290} viewBox="0 0 220 290" style={{ filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.55))' }}>
        <rect x={6} y={6} width={208} height={278} rx={18} fill="#123A7A" stroke="#E9C46A" strokeWidth={6} />
        <circle cx={110} cy={128} r={46} fill="none" stroke="#E9C46A" strokeWidth={6} />
        <path d="M64,128 h92 M110,82 v92 M78,100 q32,28 64,0 M78,156 q32,-28 64,0" stroke="#E9C46A" strokeWidth={4} fill="none" />
        <rect x={50} y={214} width={120} height={14} rx={7} fill="#E9C46A" />
        <line x1={20} y1={270} x2={20 + 180 * q} y2={270 - 250 * q} stroke={COL.red} strokeWidth={18} strokeLinecap="round" />
      </svg>
      <div style={{ marginTop: 6 }}><Tag text="बिना Passport" color={COL.red} size={40} /></div>
    </div>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.teen - 0.2, t1: C.samundar + 1.1, from: 2.4 },
  { name: 'B', t0: C.newmap - 0.2, t1: C.dikhaya + 0.6, from: 2.2 },
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
        <OffthreadVideo src={staticFile(`junagadh/null/null_jg_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
  </div>
);

// ------------------------------------------------------------------ the full-frame photo: Patel at the Somnath ruins
const PatelPhoto: React.FC<{ t: number }> = ({ t }) => {
  const a = C.somnath2 - 0.5, b = C.khandhar + 0.2;
  const o = win(t, a, b, 0.5, 0.5);
  if (o <= 0) return null;
  const q = ramp(t, a, b, linear);
  return (
    <AbsoluteFill style={{ opacity: o, overflow: 'hidden', background: '#000' }}>
      <Img src={staticFile(`junagadh/img/${FILE.p_patel_somnath}`)} style={{ position: 'absolute', width: 1300, height: 1300 / (ASPECT.p_patel_somnath ?? 0.667), left: -110 - 60 * q, top: -60 - 40 * q, transform: `scale(${1.02 + 0.06 * q})`, transformOrigin: '55% 35%' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)' }} />
      <div style={{ position: 'absolute', right: 24, top: 120, padding: '2px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.55)', fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.8)' }}>AI illustration</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', transform: `scale(${pop(t, a + 0.3, 9, 220)})` }}><Tag text={<>पटेल, <span style={{ color: COL.saffron }}>सोमनाथ</span> में</>} color={COL.saffron} size={58} /></div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ captions, grade, credits
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
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 38 * Math.sin(t * LOOPF(3) + 1.1), ly = 30 + 22 * Math.sin(t * LOOPF(2) + 0.4);
  const sombre = win(t, C.chose - 0.2, C.teen, 0.5, 0.6) * 0.7 + win(t, C.october - 0.2, C.n9, 0.4, 0.4) * 0.6;
  const saffron = win(t, C.n1951 - 0.3, C.feb + 0.2, 0.6, 0.6) + win(t, C.somnath3 - 0.3, C.signature, 0.6, 0.6);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,92,118,0.3), rgba(0,70,96,0.15) 45%, rgba(0,60,90,0.28))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,196,128,0.28), rgba(255,140,70,0.06) 26%, rgba(255,120,60,0) 46%)`, mixBlendMode: 'screen', opacity: 0.5 + 0.2 * Math.sin(t * LOOPF(8)) }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 56%, rgba(0,4,12,0.42) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.26), rgba(0,0,0,0) 18%, rgba(0,0,0,0) 76%, rgba(0,6,12,0.4))' }} />
      <AbsoluteFill style={{ background: 'rgba(10,14,24,1)', mixBlendMode: 'multiply', opacity: 0.3 * sombre }} />
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,150,40,0.5), rgba(255,110,20,0.15) 50%, rgba(0,0,0,0) 80%)', mixBlendMode: 'soft-light', opacity: saffron }} />
    </AbsoluteFill>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · borders: Natural Earth (India POV) · Junagadh outline approximate · portraits: AI illustration';

export const Junagadh: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
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
        <Scenes t={t} c={c} />
      </AbsoluteFill>
      <PatelPhoto t={t} />
      {split && <NullPanel t={t} q={split.q} {...split.w} fps={fps} />}
      {captions && <Captions t={t} top={split ? 860 : 1500} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={(t * 98) / DURATION_S} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
