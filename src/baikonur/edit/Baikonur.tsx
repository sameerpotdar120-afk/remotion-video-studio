import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { ASPECT } from './assets';
import { C, CAPS, Cam, DURATION_S, GEO, LOOPF, P, camAt, camSpeed, lineD, merc, ringsD, rollAt, shake, toS } from './cam';
import { LABEL, TITLE, UI, useFonts } from './font';
import { Globe } from './Globe';
import { MapLayers } from './Map';

/**
 * Baikonur (Nov 20), edited like the reference ("Why Does Kazakhstan Have a Giant Circle"): a natural-colour satellite
 * map, Kazakhstan filled turquoise with the lease circle cut out of it and ringed red, the USSR in red (breaking apart in
 * 1991), Russia in yellow, white leader labels and callouts, people rising out of the map, latitude lines down to the
 * equator, a spinning globe, and the creator's photoreal props (Soyuz, Sputnik, the pad, the papers, the coins).
 */
export const BK_DURATION_S = DURATION_S;
const D = DURATION_S;
const AUDIO = 'baikonur/audio/mix.wav';
const DARK = '#071623';
const COL = { teal: '#2EE6C4', red: '#E3262E', yellow: '#F7C600', gold: '#FFC21A', white: '#F4F4F4', sky: '#8FD0FF' };
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.max(0, Math.min(fi > 0 ? ramp(t, a, a + fi, linear) : t >= a ? 1 : 0, fo > 0 ? 1 - ramp(t, b - fo, b, linear) : t <= b ? 1 : 0));
/** Loop-wrapped time for what is alive across the seam (Rakesh and the hook's rocket). */
const wrapT = (t: number, lead: number) => (t > D - lead ? t - D : t);
const has = (k: string) => !!ASPECT[k];
const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');
const L = (k: string) => GEO.places[k];

// ------------------------------------------------------------------ the kit
const Big: React.FC<{ text: React.ReactNode; size: number; color?: string; font?: string; glow?: string }> = ({ text, size, color = '#fff', font = TITLE, glow }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 12)}px ${DARK}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 3}px ${glow ?? color}66, 0 10px 24px rgba(0,0,0,0.55)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0.001 || o <= 0.001 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: Math.min(1, o) }}>{children}</div>;
const Stamp: React.FC<{ t: number; t0: number; hi: string; en?: string; color?: string; rot?: number; size?: number }> = ({ t, t0, hi, en, color = COL.red, rot = -8, size = 84 }) => {
  const d = t - t0;
  if (d < 0) return null;
  const s = d < 0.18 ? 2.4 - 1.4 * (d / 0.18) : 1 + 0.04 * Math.exp(-8 * (d - 0.18)) * Math.cos((d - 0.18) * 30);
  return (
    <div style={{ transform: `rotate(${rot}deg) scale(${s})`, opacity: Math.min(1, d * 8), padding: '6px 30px', border: `10px solid ${color}`, borderRadius: 18, fontFamily: UI, fontWeight: 800, fontSize: size, color, background: 'rgba(255,245,235,0.92)', lineHeight: 1.1, textAlign: 'center', whiteSpace: 'nowrap' }}>
      {hi}{en && <div style={{ fontFamily: TITLE, fontSize: size * 0.4, letterSpacing: 8 }}>{en}</div>}
    </div>
  );
};
/** The reference's leader label: a dot on the map, a thin white line up, the name on top. */
const Leader: React.FC<{ x: number; y: number; t: number; t0: number; hi: string; en?: string; len?: number; o?: number }> = ({ x, y, t, t0, hi, en, len = 220, o = 1 }) => {
  if (o <= 0.001 || t < t0) return null;
  const q = easeOut(ramp(t, t0, t0 + 0.45, linear));
  const top = y - len * q;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: Math.min(1, o) }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <line x1={x} y1={y} x2={x} y2={top} stroke="#fff" strokeWidth={4} />
        <circle cx={x} cy={y} r={8} fill="#fff" stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
      </svg>
      <div style={{ position: 'absolute', left: x, top: top - 6, transform: `translate(-50%,-100%) scale(${0.8 + 0.2 * q})`, transformOrigin: '50% 100%', opacity: q, textAlign: 'center', whiteSpace: 'nowrap', textShadow: '0 3px 10px rgba(0,0,0,0.85)' }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 58, color: '#fff', lineHeight: 1 }}>{hi}</div>
        {en && <div style={{ fontFamily: LABEL, fontWeight: 800, fontSize: 22, letterSpacing: 5, color: 'rgba(255,255,255,0.85)' }}>{en}</div>}
      </div>
    </div>
  );
};
/** The reference's white callout box with a pointer. */
const Callout: React.FC<{ x: number; y: number; t: number; t0: number; hi: string; en: string; o?: number }> = ({ x, y, t, t0, hi, en, o = 1 }) => {
  const p = pop(t, t0, 10, 200);
  if (p <= 0.001 || o <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y - 26, transform: `translate(-50%,-100%) scale(${p})`, transformOrigin: '50% 100%', opacity: Math.min(1, o) }}>
      <div style={{ background: '#FFFFFF', border: '4px solid #111', borderRadius: 10, padding: '6px 26px 8px', textAlign: 'center', boxShadow: '0 10px 26px rgba(0,0,0,0.45)' }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 50, lineHeight: 1.1, color: '#0A0A0A', whiteSpace: 'nowrap' }}>{hi}</div>
        <div style={{ fontFamily: LABEL, fontWeight: 800, fontSize: 20, letterSpacing: 4, color: '#333', whiteSpace: 'nowrap' }}>{en}</div>
      </div>
      <svg width={40} height={26} style={{ position: 'absolute', left: '50%', bottom: -22, transform: 'translateX(-50%)' }}><path d="M2,0 L38,0 L20,24 Z" fill="#fff" stroke="#111" strokeWidth={4} /></svg>
    </div>
  );
};
/** A photoreal prop standing on the map: (x, y) is its foot, w its width. */
const Prop: React.FC<{ k: string; x: number; y: number; w: number; o?: number; p?: number; foot?: number; rot?: number; shadow?: boolean }> = ({ k, x, y, w, o = 1, p = 1, foot = 0.86, rot = 0, shadow = true }) => {
  if (o <= 0.01 || p <= 0.01 || !has(k) || w < 4) return null;
  const h = w / ASPECT[k];
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h * foot, width: w, height: h, opacity: Math.min(1, o), transform: `scale(${p}) rotate(${rot}deg)`, transformOrigin: `50% ${foot * 100}%` }}>
      {shadow && <div style={{ position: 'absolute', left: w * 0.1, right: w * 0.1, top: h * foot - h * 0.07, height: h * 0.14, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)' }} />}
      <Img src={staticFile(`baikonur/img/${k}.png`)} style={{ position: 'absolute', inset: 0, width: w, height: h }} />
    </div>
  );
};
/** A person rising out of the map: head and shoulders, the bottom fading into the map, a white name box under it. */
const MapPerson: React.FC<{ k: string; hi: string; en: string; bar: string; t: number; t0: number; x: number; bottom: number; h: number; o?: number }> = ({ k, hi, en, bar, t, t0, x, bottom, h, o = 1 }) => {
  if (o <= 0.001 || t < t0 - 0.05 || !has(k)) return null;
  const q = easeOut(ramp(t, t0, t0 + 0.7, linear));
  const lq = easeOut(ramp(t, t0 + 0.3, t0 + 0.8, linear));
  const w = h * 0.86;
  const a = ASPECT[k];
  const imgH = (w * 1.0) / a, imgW = imgH * a;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: bottom - h, width: w, height: h * 1.3, opacity: clamp01(o) * clamp01(q * 1.6) }}>
      <div style={{ position: 'absolute', left: -w * 0.2, top: h * 0.05, width: w * 1.4, height: h, background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.7), rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 70%)', opacity: q }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 66%, rgba(0,0,0,0) 97%)', maskImage: 'linear-gradient(180deg, #000 0%, #000 66%, rgba(0,0,0,0) 97%)' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - q) * h * 0.38}px) scale(${1.08 - 0.08 * q})`, transformOrigin: '50% 30%' }}>
          <Img src={staticFile(`baikonur/img/${k}.png`)} style={{ position: 'absolute', width: imgW, height: imgH, left: (w - imgW) / 2, top: -h * 0.01 }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: h * 0.86, textAlign: 'center', transform: `translateY(${(1 - lq) * 30}px) scale(${0.85 + 0.15 * lq})`, opacity: lq }}>
        <div style={{ display: 'inline-block', background: '#F7F7F2', borderTop: `${Math.max(5, h * 0.014)}px solid ${bar}`, padding: `${h * 0.008}px ${h * 0.045}px ${h * 0.012}px`, boxShadow: '0 8px 22px rgba(0,0,0,0.55)' }}>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: Math.max(30, h * 0.09), lineHeight: 1.12, color: '#0A0A0A', whiteSpace: 'nowrap' }}>{hi}</div>
          <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: Math.max(14, h * 0.034), letterSpacing: 2, color: '#333', whiteSpace: 'nowrap' }}>{en}</div>
        </div>
        <div style={{ marginTop: 4, fontFamily: LABEL, fontSize: Math.max(12, h * 0.022), color: 'rgba(255,255,255,0.75)', textShadow: '0 2px 6px #000' }}>AI illustration</div>
      </div>
    </div>
  );
};
const Tag: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = COL.gold, size = 46 }) => (
  <div style={{ padding: `${size * 0.12}px ${size * 0.5}px`, background: 'rgba(8,12,18,0.9)', border: `${Math.max(3, size / 11)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.25, color: '#fff', whiteSpace: 'nowrap', boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)`, textAlign: 'center' }}>{children}</div>
);

// ------------------------------------------------------------------ the map layer
const cen = (rings: P[][]): P => { let best = rings[0]; for (const r of rings) if (r.length > best.length) best = r; let x = 0, y = 0; for (const p of best) { x += p[0]; y += p[1]; } return [x / best.length, y / best.length]; };
const KZC = merc(67.5, 48.3), USSRC = merc(80, 58), RUC = merc(95, 61);
/** A flat fill (hard-light, so the relief shows through) revealed in a circle from (cx, cy). */
const Fill: React.FC<{ d: string; color: string; g: number; cx: number; cy: number; alpha?: number; rule?: 'evenodd' | 'nonzero'; dx?: number; dy?: number }> = ({ d, color, g, cx, cy, alpha = 0.8, rule = 'evenodd', dx = 0, dy = 0 }) => {
  if (g <= 0.001) return null;
  const r = easeOut(clamp01(g * 1.15)) * 3200;
  const id = `c${Math.round(cx)}_${Math.round(cy)}_${color.slice(1)}`;
  return (
    <g transform={`translate(${dx},${dy})`}>
      <defs><clipPath id={id}><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
      <path d={d} fill={color} fillRule={rule} clipPath={g >= 0.999 ? undefined : `url(#${id})`} opacity={clamp01(g * 2) * alpha} />
    </g>
  );
};
const Outline: React.FC<{ d: string; o: number; w?: number; color?: string; dx?: number; dy?: number }> = ({ d, o, w = 3, color = '#fff', dx = 0, dy = 0 }) =>
  o <= 0.001 ? null : <g transform={`translate(${dx},${dy})`} opacity={o}><path d={d} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={w + 3} strokeLinejoin="round" /><path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" /></g>;

const MapVectors: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const [kx, ky] = toS(c, KZC), [ux, uy] = toS(c, USSRC), [rx, ry] = toS(c, RUC);
  const lease = lineD(c, GEO.lease) + 'Z';
  const kzD = ringsD(c, GEO.countries.kazakhstan) + lease; // the lease circle cut out of the turquoise
  const close = clamp01((c.mpp - 120) / 600);
  // phases: the USSR (1955 and 1991), Russia yellow (the rent, the latitudes), Kazakhstan turquoise (everywhere else)
  const ussrO = Math.max(win(t, C.soviet1 - 0.15, C.n1957 - 0.1, 0.35, 0.4), win(t, C.n1991 - 0.3, C.raaton + 0.4, 0.3, 0.6));
  const breakQ = easeOut(ramp(t, C.toot - 0.05, C.raaton + 0.4, linear));
  const russiaO = Math.max(win(t, C.russia2 - 0.3, C.ghere2 - 0.1, 0.35, 0.4), win(t, C.kyun1 - 0.2, C.dhakka - 0.1, 0.35, 0.4));
  const kzG = Math.max(win(t, -1, C.soviet1 - 0.1, 0, 0.35), win(t, C.n1957 - 0.2, C.n1991 - 0.2, 0.35, 0.3) , win(t, C.toot, D + 1, 0.4, 0));
  const kzAlpha = 0.42 + 0.33 * close;
  const ringO = Math.max(0, 1 - win(t, C.spaceport1 - 0.2, C.n1955 + 0.3, 0.3, 0.3)) * (1 - 0.6 * ussrO);
  const [lx, ly] = toS(c, L('lease_c'));
  const ringPulse = 1 + 0.15 * Math.max(0, Math.sin(t * LOOPF(40)));
  const parts = Object.entries(GEO.ussr_parts).filter(([n]) => n !== 'Kazakhstan');
  const fills = (
    <>
      <Fill d={kzD} color={COL.teal} g={kzG} cx={kx} cy={ky} alpha={kzAlpha} />
      {breakQ < 0.01
        ? <Fill d={ringsD(c, GEO.ussr) + lease} color={COL.red} g={ussrO} cx={ux} cy={uy} alpha={0.72} />
        : parts.map(([n, r]) => {
          const pc = toS(c, cen(r)), dir = [pc[0] - ux, pc[1] - uy], L2 = Math.hypot(dir[0], dir[1]) || 1;
          return <Fill key={n} d={ringsD(c, r)} color={COL.red} g={ussrO * (1 - breakQ * 0.85)} cx={pc[0]} cy={pc[1]} alpha={0.72} dx={(dir[0] / L2) * 40 * breakQ} dy={(dir[1] / L2) * 40 * breakQ} />;
        })}
      <Fill d={ringsD(c, GEO.countries.russia)} color={COL.yellow} g={russiaO} cx={rx} cy={ry} alpha={0.82} />
    </>
  );
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, mixBlendMode: 'hard-light' }}>{fills}</svg>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={GEO.borders.map((b) => lineD(c, b)).join('')} fill="none" stroke="#fff" strokeOpacity={0.35 * clamp01((c.mpp - 800) / 1500)} strokeWidth={1.6} />
        <Outline d={ringsD(c, GEO.countries.kazakhstan)} o={kzG * 0.9} w={3} />
        <Outline d={ringsD(c, GEO.ussr)} o={ussrO * (1 - breakQ)} w={3} />
        <Outline d={ringsD(c, GEO.countries.russia)} o={russiaO * 0.9} w={3} />
        {/* the lease circle, ringed red like the reference */}
        {ringO > 0.01 && <g opacity={ringO}>
          <path d={lease} fill="none" stroke="#000" strokeOpacity={0.45} strokeWidth={14 * ringPulse} />
          <path d={lease} fill="none" stroke={COL.red} strokeWidth={8 * ringPulse} />
          {c.mpp > 1500 && <circle cx={lx} cy={ly} r={16 * ringPulse} fill="none" stroke={COL.red} strokeWidth={6} />}
        </g>}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the scenes (labels, people, props, counters)
const LATS: [number, string, string, string][] = [[62.93, 'प्लेसेत्स्क', 'PLESETSK · 63° N', '#FFFFFF'], [51.88, 'वोस्तोचनी', 'VOSTOCHNY · 52° N', '#DDE6F0'], [45.92, 'बैकोनूर', 'BAIKONUR · 46° N', '#FF5A4A'], [0, 'भूमध्य रेखा', 'EQUATOR · 0°', '#FFC21A']];
const Scenes: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const S = (p: P) => toS(c, p);
  const w = win;
  const tw = wrapT(t, 0.8);
  const [lx, ly] = S(L('lease_c'));
  const leaseR = 45000 / c.mpp;
  // ---- hook: Rakesh rises beside the circle; a Soyuz streaks up out of it; the rent
  const rkO = w(tw, -0.8, C.kz1 - 0.2, 0.01, 0.35);
  const sy = ramp(t, C.antriksh - 0.15, C.kiraya1 + 0.6, linear);
  const n115 = 115 * easeOut(ramp(t, C.n115a - 0.2, C.dollar1 + 0.3, linear));
  // ---- the spaceport close-up
  const [gx, gy] = S(L('gagarin_start'));
  // ---- Sputnik's orbit round the circle
  const orbA = (t - C.n1957) * 2.4;
  const orbR = leaseR * 1.35;
  // ---- the rent line Moscow -> circle
  const [mx_, my_] = S(L('moscow'));
  const rentQ = ramp(t, C.kiraye - 0.1, C.n115b + 0.3, inOut);
  const rentO = w(t, C.kiraye - 0.2, C.ghere2 - 0.1, 0.2, 0.35);
  const mid: P = [(mx_ + lx) / 2 - 120, (my_ + ly) / 2 - 80];
  const arc = `M${mx_},${my_} Q${mid[0]},${mid[1]} ${lx},${ly}`;
  // ---- latitude lines
  const latO = w(t, C.south - 0.3, C.dhakka - 0.1, 0.3, 0.4);
  // ---- globe
  const globeO = w(t, C.dharti - 0.25, C.dhakka - 0.05, 0.3, 0.3);
  // ---- the closing launch
  const launchQ = ramp(t, C.dhakka - 0.2, C.fuel + 0.6, linear);
  const launchO = w(t, C.dhakka - 0.25, C.pooche + 0.2, 0.15, 0.4);
  return (
    <>
      {/* the hook's rocket: up out of the circle with a white trail */}
      {sy > 0 && sy < 1 && has('s_soyuz_launch') && (() => {
        const y0 = ly, y1 = ly - 1300, yy = y0 + (y1 - y0) * easeOut(sy) * 0.95;
        const o = w(t, C.antriksh - 0.15, C.kiraya1 + 0.6, 0.1, 0.35);
        return <>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}><path d={`M${lx},${ly} L${lx + 10},${yy + 120}`} stroke="#fff" strokeWidth={26} strokeLinecap="round" opacity={0.55} /><path d={`M${lx},${ly} L${lx + 10},${yy + 120}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" /></svg>
          <Prop k="s_soyuz_launch" x={lx + 10} y={yy + 200} w={130} o={o} shadow={false} foot={0.98} />
        </>;
      })()}
      <MapPerson k="r_rakesh_sharma" hi="राकेश शर्मा" en="RAKESH SHARMA · 1984" bar="#FF8A1E" t={tw} t0={-0.6} x={lx + 300} bottom={ly + 120} h={520} o={rkO} />
      {t > C.kiraya1 - 0.1 && t < C.kz1 && <At x={lx} y={ly - 330} o={w(t, C.kiraya1 - 0.1, C.kz1, 0.05, 0.3)}><Stamp t={t} t0={C.kiraya1 - 0.05} hi="किराया" en="ON RENT" color={COL.red} size={86} /></At>}
      {t > C.n115a - 0.25 && t < C.kz1 && <At x={540} y={1260} p={pop(t, C.n115a - 0.2, 10, 220)} o={w(t, C.n115a - 0.25, C.kz1, 0.1, 0.3)}><Big text={<>${fmt(n115)}M <span style={{ fontFamily: UI, fontSize: 70 }}>/ साल</span></>} size={130} color="#FFE07A" glow={COL.gold} /></At>}

      {/* Kazakhstan and the circle */}
      <Leader x={S(KZC)[0]} y={S(KZC)[1]} t={t} t0={C.kz1 - 0.05} hi="कज़ाकिस्तान" en="KAZAKHSTAN" len={260} o={w(t, C.kz1 - 0.1, C.ghera1, 0.05, 0.3)} />
      {t > C.registan - 0.2 && t < C.bk1 && <Prop k="d_steppe_camels" x={lx - 230} y={ly + 230} w={300} p={pop(t, C.registan - 0.1, 10, 180)} o={w(t, C.registan - 0.2, C.bk1, 0.1, 0.3)} />}
      {t > C.ghera1 - 0.2 && t < C.spaceport1 && <At x={lx} y={ly - leaseR - 70} p={pop(t, C.ghera1 - 0.1, 10, 220)} o={w(t, C.ghera1 - 0.2, C.spaceport1, 0.1, 0.3)}><Tag color={COL.red}>गोल घेरा</Tag></At>}
      {/* the spaceport close-up */}
      <Callout x={gx} y={gy - 40} t={t} t0={C.bk1} hi="बैकोनूर कॉस्मोड्रोम" en="BAIKONUR COSMODROME" o={w(t, C.bk1 - 0.05, C.soviet1, 0.05, 0.3)} />
      {t > C.spaceport1 - 0.2 && t < C.soviet1 && <Prop k="s_soyuz_pad" x={gx + 210} y={gy + 380} w={420} p={pop(t, C.spaceport1 - 0.1, 10, 180)} o={w(t, C.spaceport1 - 0.2, C.soviet1, 0.1, 0.3)} />}
      {t > C.pehla1 - 0.2 && t < C.n1955 && <At x={540} y={1250} p={pop(t, C.pehla1 - 0.15, 10, 200)} o={w(t, C.pehla1 - 0.2, C.n1955, 0.1, 0.25)}><Tag color={COL.gold} size={56}>दुनिया का पहला Spaceport</Tag></At>}
      {t > C.n1955 - 0.2 && t < C.ussr + 0.6 && <At x={540} y={430} p={pop(t, C.n1955 - 0.15, 10, 220)} o={w(t, C.n1955 - 0.2, C.ussr + 0.6, 0.1, 0.3)}><Big text="1955" size={170} color="#fff" glow={COL.red} /></At>}
      <Leader x={S(USSRC)[0]} y={S(USSRC)[1]} t={t} t0={C.soviet1 + 0.1} hi="सोवियत संघ" en="USSR" len={200} o={w(t, C.soviet1, C.n1957 - 0.2, 0.05, 0.3)} />
      <Leader x={S(KZC)[0]} y={S(KZC)[1]} t={t} t0={C.kz2 - 0.05} hi="कज़ाकिस्तान भी" en="PART OF THE USSR" len={140} o={w(t, C.kz2 - 0.1, C.n1957 - 0.2, 0.05, 0.3)} />

      {/* 1957, 1961, 1984 */}
      {t > C.sputnik - 0.3 && t < C.n1961 && (() => {
        const o = w(t, C.sputnik - 0.3, C.n1961, 0.15, 0.3);
        const sx = lx + Math.cos(orbA) * orbR, syy = ly + Math.sin(orbA) * orbR * 0.42;
        return <>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}><ellipse cx={lx} cy={ly} rx={orbR} ry={orbR * 0.42} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="16 12" /></svg>
          <Prop k="s_sputnik" x={sx} y={syy} w={170} o={o} shadow={false} foot={0.5} />
        </>;
      })()}
      {t > C.n1957 - 0.2 && t < C.n1961 - 0.05 && <At x={540} y={420} p={pop(t, C.n1957 - 0.15, 10, 220)} o={w(t, C.n1957 - 0.2, C.n1961 - 0.05, 0.1, 0.2)}><div style={{ textAlign: 'center' }}><Big text="1957" size={150} color="#fff" glow={COL.sky} /><div style={{ marginTop: 6 }}><Tag color={COL.sky} size={44}>पहला Satellite · SPUTNIK</Tag></div></div></At>}
      <MapPerson k="g_yuri_gagarin" hi="यूरी गगारिन" en="YURI GAGARIN · 1961" bar={COL.red} t={t} t0={C.n1961 - 0.05} x={540 - 235} bottom={ly + 60} h={520} o={w(t, C.n1961 - 0.1, C.n1991 - 0.3, 0.05, 0.4)} />
      {t > C.n1961 - 0.2 && t < C.n1984 && <At x={540} y={380} p={pop(t, C.n1961 - 0.15, 10, 220)} o={w(t, C.n1961 - 0.2, C.n1984, 0.1, 0.2)}><div style={{ textAlign: 'center' }}><Big text="1961" size={150} color="#fff" glow={COL.red} /><div style={{ marginTop: 6 }}><Tag color={COL.red} size={44}>अंतरिक्ष में पहला इंसान</Tag></div></div></At>}
      <MapPerson k="r_rakesh_sharma" hi="राकेश शर्मा" en="RAKESH SHARMA · 1984" bar="#FF8A1E" t={t} t0={C.n1984 - 0.05} x={540 + 235} bottom={ly + 60} h={520} o={w(t, C.n1984 - 0.1, C.n1991 - 0.3, 0.05, 0.4)} />
      {t > C.n1984 - 0.2 && t < C.n1991 - 0.2 && <At x={540} y={380} p={pop(t, C.n1984 - 0.15, 10, 220)} o={w(t, C.n1984 - 0.2, C.n1991 - 0.2, 0.1, 0.25)}><div style={{ textAlign: 'center' }}><Big text="1984" size={150} color="#fff" glow="#FF8A1E" /><div style={{ marginTop: 6 }}><Tag color="#FF8A1E" size={44}>पहला भारतीय · SOYUZ T-11</Tag></div></div></At>}

      {/* 1991 */}
      {t > C.n1991 - 0.2 && t < C.kiraye && <At x={540} y={250} o={w(t, C.n1991 - 0.2, C.kiraye, 0.05, 0.3)}><Stamp t={t} t0={C.n1991 - 0.1} hi="1991" en="USSR BREAKS UP" color={COL.red} size={90} rot={-6} /></At>}
      <Leader x={S(KZC)[0]} y={S(KZC)[1]} t={t} t0={C.desh - 0.3} hi="नया देश: कज़ाकिस्तान" en="KAZAKHSTAN · INDEPENDENT" len={150} o={w(t, C.desh - 0.35, C.kiraye + 0.2, 0.05, 0.3)} />

      {/* the rent */}
      {rentO > 0 && <>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: rentO }}>
          <path d={arc} pathLength={1} fill="none" stroke="#000" strokeOpacity={0.4} strokeWidth={14} strokeDasharray={`${rentQ} 2`} />
          <path d={arc} pathLength={1} fill="none" stroke="#fff" strokeWidth={7} strokeDasharray={`${rentQ} 2`} strokeLinecap="round" />
          <circle cx={mx_} cy={my_} r={12} fill="#fff" />
        </svg>
        <Leader x={mx_} y={my_} t={t} t0={C.kiraye - 0.1} hi="मॉस्को" en="MOSCOW" len={120} o={rentO} />
        <Prop k="l_lease_papers" x={mid[0] + 60} y={mid[1] + 160} w={300} p={pop(t, C.kiraye, 10, 180)} o={rentO} />
        {t > C.n115b - 0.25 && <At x={540} y={1240} p={pop(t, C.n115b - 0.2, 10, 220)} o={rentO}><div style={{ textAlign: 'center' }}><Big text={<>${fmt(115 * easeOut(ramp(t, C.n115b - 0.2, C.n115b + 0.7, linear)))}M <span style={{ fontFamily: UI, fontSize: 70 }}>/ साल</span></>} size={120} color="#FFE07A" glow={COL.gold} />
          {t > C.n2050 - 0.2 && <div style={{ marginTop: 10, transform: `scale(${pop(t, C.n2050 - 0.15, 10, 220)})` }}><Tag color={COL.gold} size={54}>2050 तक</Tag></div>}</div></At>}
      </>}
      <Leader x={S(RUC)[0]} y={S(RUC)[1]} t={t} t0={C.russia2 - 0.1} hi="रूस" en="RUSSIA" len={160} o={w(t, C.russia2 - 0.2, C.ghere2 - 0.1, 0.05, 0.3)} />
      {/* inside the circle */}
      {t > C.ghere2 - 0.1 && t < C.kyun1 && <At x={lx} y={ly - leaseR - 60} p={pop(t, C.ghere2, 10, 220)} o={w(t, C.ghere2 - 0.1, C.kyun1, 0.1, 0.3)}><Tag color={COL.red} size={50}>6,717 km²</Tag></At>}
      {t > C.kanoon - 0.2 && t < C.kyun1 && <At x={lx - 160} y={ly - 40} p={pop(t, C.kanoon - 0.15, 10, 220)} o={w(t, C.kanoon - 0.2, C.kyun1, 0.1, 0.3)}><Tag color={COL.yellow} size={48}>क़ानून: <span style={{ fontFamily: LABEL }}>RUSSIA</span></Tag></At>}
      {t > C.rouble - 0.2 && t < C.kyun1 && <>
        <Prop k="c_coins" x={lx + 170} y={ly + 160} w={260} p={pop(t, C.rouble - 0.15, 10, 180)} o={w(t, C.rouble - 0.2, C.kyun1, 0.1, 0.3)} />
        <At x={lx + 170} y={ly - 80} p={pop(t, C.rouble - 0.05, 9, 220)} o={w(t, C.rouble - 0.2, C.kyun1, 0.1, 0.3)}><div style={{ width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #FFE9A0, #D9A21B)', border: '6px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LABEL, fontWeight: 800, fontSize: 76, color: '#5A3A00', boxShadow: '0 10px 24px rgba(0,0,0,0.5)' }}>₽</div></At>
      </>}

      {/* why so far south */}
      {t > C.kyun1 - 0.2 && t < C.south && <At x={540} y={330} p={pop(t, C.kyun1 - 0.1, 9, 200)} o={w(t, C.kyun1 - 0.2, C.south, 0.1, 0.25)}><Big text="?" size={220} color="#fff" glow={COL.gold} /></At>}
      {latO > 0 && <AbsoluteFill style={{ opacity: latO }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          {LATS.map(([lat, , , col], i) => {
            const y = S(merc(0, lat))[1];
            const q = easeOut(ramp(t, C.south - 0.2 + i * 0.25, C.south + 0.4 + i * 0.25, linear));
            return <g key={i}><line x1={0} y1={y} x2={1080 * q} y2={y} stroke="#000" strokeOpacity={0.4} strokeWidth={10} /><line x1={0} y1={y} x2={1080 * q} y2={y} stroke={col} strokeWidth={lat === 0 ? 7 : 5} strokeDasharray={lat === 0 ? undefined : '22 12'} /></g>;
          })}
          {/* arrows: Baikonur is south of Russia's other sites, toward the equator */}
          {t > C.equator - 0.2 && (() => { const y0 = S(merc(0, 45.92))[1] + 20, y1 = S(merc(0, 2))[1] - 20, q = easeOut(ramp(t, C.equator - 0.2, C.equator + 0.6, linear)); return <g><line x1={lx} y1={y0} x2={lx} y2={y0 + (y1 - y0) * q} stroke="#fff" strokeWidth={8} /><path d={`M${lx - 22},${y0 + (y1 - y0) * q - 10} L${lx},${y0 + (y1 - y0) * q + 24} L${lx + 22},${y0 + (y1 - y0) * q - 10} Z`} fill="#fff" /></g>; })()}
        </svg>
        {LATS.map(([lat, hi, en, col], i) => {
          const y = S(merc(0, lat))[1];
          const o = ramp(t, C.south + i * 0.25, C.south + 0.4 + i * 0.25, linear);
          return o > 0 && <div key={i} style={{ position: 'absolute', right: 40, top: y - 74, opacity: o, textAlign: 'right', textShadow: '0 3px 10px rgba(0,0,0,0.9)' }}>
            <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 46, color: col, lineHeight: 1 }}>{hi}</div>
            <div style={{ fontFamily: LABEL, fontWeight: 800, fontSize: 20, letterSpacing: 4, color: '#fff' }}>{en}</div>
          </div>;
        })}
      </AbsoluteFill>}
      {globeO > 0 && <AbsoluteFill style={{ opacity: globeO }}>
        <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 46%, rgba(4,10,20,0.55), rgba(4,10,20,0.85) 70%)' }} />
        <div style={{ position: 'absolute', left: 120, top: 330, width: 840, height: 840, transform: `scale(${0.85 + 0.15 * easeOut(ramp(t, C.dharti - 0.25, C.dharti + 0.6, linear))})` }}><Globe spin={2.69 + (t - C.dharti) * 0.55} size={840} /></div>
        {[['प्लेसेत्स्क', '~760 km/h', '#FFFFFF', 1170], ['बैकोनूर', '~1,170 km/h', '#FF5A4A', 1250], ['भूमध्य रेखा', '~1,670 km/h', '#FFC21A', 1330]].map(([hi, v, col, y], i) => {
          const o = ramp(t, C.dharti + 0.2 + i * 0.3, C.dharti + 0.6 + i * 0.3, linear);
          return <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: y as number, textAlign: 'center', opacity: o, fontFamily: UI, fontWeight: 800, fontSize: 50, color: col as string, textShadow: '0 3px 10px #000' }}>{hi} <span style={{ fontFamily: TITLE, color: '#fff' }}>{v}</span></div>;
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center' }}><Big text={<span style={{ fontFamily: UI }}>धरती की रफ़्तार</span>} size={84} color="#fff" glow={COL.sky} /></div>
      </AbsoluteFill>}
      {/* the closing launch: east out of the circle, a curved white trail */}
      {launchO > 0 && (() => {
        const q = easeOut(launchQ);
        const pts = Array.from({ length: 30 }, (_, i) => { const s = (i / 29) * q; return [lx + 380 * s * s, ly - 720 * s] as P; });
        const head = pts[pts.length - 1], prev = pts[pts.length - 2];
        const ang = (Math.atan2(head[0] - prev[0], -(head[1] - prev[1])) * 180) / Math.PI;
        return <>
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: launchO }}>
            <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('')} fill="none" stroke="#fff" strokeWidth={30} opacity={0.45} strokeLinecap="round" />
            <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('')} fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
          </svg>
          <Prop k="s_soyuz_launch" x={head[0]} y={head[1] + 60} w={150} o={launchO} shadow={false} foot={0.95} rot={ang} />
          {t > C.fuel - 0.3 && <At x={540} y={1250} p={pop(t, C.fuel - 0.25, 10, 220)} o={w(t, C.fuel - 0.3, C.pooche + 0.2, 0.1, 0.3)}><Tag color={COL.gold} size={54}>कम Fuel में Orbit</Tag></At>}
        </>;
      })()}
    </>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.n1991 - 0.2, t1: C.desh + 0.1, from: 2.4 },
  { name: 'B', t0: C.russia5 - 0.3, t1: C.south - 0.1, from: 0.3 },
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
        <OffthreadVideo src={staticFile(`baikonur/null/null_bk_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
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
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,255,255,0.10), rgba(255,255,255,0) 40%)`, mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0) 14%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.38))' }} />
    </AbsoluteFill>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · borders: Natural Earth (India POV) · lease area approximate · props and portraits: AI illustration';

export const Baikonur: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
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
    <AbsoluteFill style={{ background: '#0E3A57', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) rotate(${rollAt(t).toFixed(3)}deg) scale(1.05)` }}>
        <AbsoluteFill style={{ filter: blur > 0.7 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
          <AbsoluteFill style={{ filter: 'saturate(1.12) contrast(1.05)' }}><MapLayers c={c} /></AbsoluteFill>
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
