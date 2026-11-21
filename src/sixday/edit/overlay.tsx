import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { clamp01, easeOut, inOut, lerp, ramp } from '../../darien/anim';
import { drawFlag, Side } from './flags';
import { CARDF, ENF, LABEL, NUMF, UI } from './font';

/** 2D pieces drawn over the map. `u` is the frame's unit: 1 px of a 1080-px-tall landscape frame (so 2 at 4K), or
 * the same for a portrait frame's width, so every card keeps its size across formats. */

const img = (n: string) => staticFile(`sixday/img/${n}.webp`);

/** A flag as an inline canvas-free SVG-ish block (drawn once into a data URL). */
const flagCache: Record<string, string> = {};
export const flagURL = (s: Side) => {
  if (!flagCache[s]) {
    const c = document.createElement('canvas'); c.width = 300; c.height = 200;
    drawFlag(c.getContext('2d') as CanvasRenderingContext2D, s, 0, 0, 300, 200);
    flagCache[s] = c.toDataURL();
  }
  return flagCache[s];
};

/** A portrait card standing on the map at screen point (x, y): framed B&W photo, a name plate, "AI illustration". */
export const Portrait: React.FC<{ x: number; y: number; u: number; name: string; en: string; role: string; pic: string; p: number; side?: Side; scale?: number; bounds?: [number, number] }> = ({ x: x0, y: y0, u, name, en, role, pic, p, side, scale = 1, bounds }) => {
  if (p <= 0.001) return null;
  const s = u * scale * (0.6 + 0.4 * easeOut(clamp01(p)));
  const w = 210 * s;
  // keep the whole card on screen (and clear of the top date slot)
  const x = bounds ? Math.min(Math.max(x0, w / 2 + 30 * u), bounds[0] - w / 2 - 30 * u) : x0;
  const y = bounds ? Math.min(Math.max(y0, 330 * u * scale + 150 * u), bounds[1] - 60 * u) : y0;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - 330 * s, width: w, opacity: clamp01(p * 1.6), transform: `translateY(${(1 - easeOut(clamp01(p))) * 40 * s}px)` }}>
      <div style={{ background: 'linear-gradient(#3a4250, #1b2029)', border: `${3 * s}px solid #9aa4b4`, borderRadius: 10 * s, padding: 9 * s, boxShadow: `0 ${14 * s}px ${30 * s}px rgba(0,0,0,0.55)` }}>
        <div style={{ position: 'relative', width: '100%', height: 200 * s, overflow: 'hidden', borderRadius: 4 * s, border: `${2 * s}px solid #c9ced6` }}>
          <Img src={img(pic)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.08)' }} />
          {side && <img src={flagURL(side)} style={{ position: 'absolute', right: 6 * s, top: 6 * s, width: 40 * s, height: 27 * s, border: `${1.5 * s}px solid #fff` }} />}
          <div style={{ position: 'absolute', left: 6 * s, bottom: 4 * s, fontFamily: LABEL, fontSize: 9.5 * s, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5 * s }}>AI illustration</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 7 * s, fontFamily: CARDF, fontSize: 21 * s, color: '#ffd76a', lineHeight: 1.15, textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>{name}</div>
        <div style={{ textAlign: 'center', fontFamily: ENF, fontWeight: 700, fontSize: 11 * s, color: '#e9e1c8', letterSpacing: 1 * s }}>{en}</div>
        <div style={{ textAlign: 'center', fontFamily: UI, fontWeight: 600, fontSize: 13 * s, color: '#c3cad6', marginTop: 1 * s }}>{role}</div>
      </div>
      <div style={{ margin: '0 auto', width: 16 * s, height: 26 * s, background: 'linear-gradient(90deg,#4a5260,#9aa4b4,#4a5260)' }} />
      <div style={{ margin: '0 auto', width: 90 * s, height: 10 * s, borderRadius: '50%', background: 'radial-gradient(#9aa4b4,#3a4250)', boxShadow: `0 ${6 * s}px ${12 * s}px rgba(0,0,0,0.6)` }} />
    </div>
  );
};

/** A text-only remembrance card (no portrait), for Captain Vijay Sachar. */
export const NameCard: React.FC<{ x: number; y: number; u: number; p: number; lines: [string, string, string] }> = ({ x, y, u, p, lines }) => {
  if (p <= 0.001) return null;
  const s = u;
  return (
    <div style={{ position: 'absolute', left: x - 230 * s, top: y - 70 * s, width: 460 * s, opacity: clamp01(p * 1.4), transform: `scale(${0.9 + 0.1 * easeOut(clamp01(p))})`, textAlign: 'center',
      background: 'linear-gradient(rgba(16,24,36,0.92), rgba(10,14,22,0.92))', border: `${2 * s}px solid rgba(160,190,230,0.6)`, borderRadius: 12 * s, padding: `${14 * s}px ${18 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)` }}>
      <img src={flagURL('in')} style={{ width: 54 * s, height: 36 * s, border: `${1.5 * s}px solid #fff`, marginBottom: 6 * s }} />
      <div style={{ fontFamily: CARDF, fontSize: 34 * s, color: '#fff' }}>{lines[0]}</div>
      <div style={{ fontFamily: ENF, fontWeight: 700, fontSize: 15 * s, color: '#cfe0ff', letterSpacing: 2 * s }}>{lines[1]}</div>
      <div style={{ fontFamily: UI, fontSize: 18 * s, color: '#b9c6da', marginTop: 4 * s }}>{lines[2]}</div>
    </div>
  );
};

/** A stat card: icon tile + big number, sliding in. */
export const Stat: React.FC<{ x: number; y: number; u: number; p: number; value: string; label: string; side?: Side; color?: string; align?: 'left' | 'right' }> = ({ x, y, u, p, value, label, side, color = '#f2e6c4', align = 'left' }) => {
  if (p <= 0.001) return null;
  const s = u, e = easeOut(clamp01(p));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translateX(${(align === 'left' ? -1 : 1) * (1 - e) * 60 * s}px)`, opacity: clamp01(p * 1.5), display: 'flex', alignItems: 'center', gap: 14 * s, flexDirection: align === 'left' ? 'row' : 'row-reverse' }}>
      {side && <div style={{ padding: 7 * s, background: 'linear-gradient(#24331f,#121a10)', border: `${2 * s}px solid #9fb39a`, borderRadius: 8 * s, boxShadow: `0 ${6 * s}px ${14 * s}px rgba(0,0,0,0.5)` }}><img src={flagURL(side)} style={{ width: 66 * s, height: 44 * s, display: 'block' }} /></div>}
      <div style={{ textAlign: align }}>
        <div style={{ fontFamily: NUMF, fontSize: 64 * s, lineHeight: 1, color, textShadow: `0 ${3 * s}px ${10 * s}px rgba(0,0,0,0.8)` }}>{value}</div>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 22 * s, color: '#e8e2d0', textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>{label}</div>
      </div>
    </div>
  );
};

/** A date ticker card ("22 मई 1967"), flipping to each new date. */
export const DateCard: React.FC<{ x: number; y: number; u: number; text: string; sub?: string; p: number; flip: number }> = ({ x, y, u, text, sub, p, flip }) => {
  if (p <= 0.001) return null;
  const s = u;
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: clamp01(p * 1.5), transform: `translateY(${(1 - easeOut(clamp01(p))) * -30 * s}px)` }}>
      <div style={{ background: 'linear-gradient(#f3ead2,#d8ccab)', borderRadius: 6 * s, padding: `${8 * s}px ${20 * s}px`, boxShadow: `0 ${8 * s}px ${20 * s}px rgba(0,0,0,0.55)`, borderTop: `${10 * s}px solid #a8322a`, transform: `perspective(${600 * s}px) rotateX(${(1 - easeOut(clamp01(flip))) * 70}deg)`, transformOrigin: 'top' }}>
        <div style={{ fontFamily: NUMF, fontSize: 46 * s, color: '#2a2219', lineHeight: 1.05, textAlign: 'center' }}>{text}</div>
        {sub && <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 18 * s, color: '#5d4c36', textAlign: 'center' }}>{sub}</div>}
      </div>
    </div>
  );
};

/** An analogue wall clock reading hh:mm (the minute hand sweeps with `sweep` minutes). */
export const Clock: React.FC<{ x: number; y: number; u: number; p: number; hh: number; mm: number; label?: string }> = ({ x, y, u, p, hh, mm, label }) => {
  if (p <= 0.001) return null;
  const s = u, R = 70 * s;
  const ma = (mm / 60) * 360, ha = ((hh % 12) / 12) * 360 + (mm / 60) * 30;
  return (
    <div style={{ position: 'absolute', left: x - R, top: y - R, width: R * 2, opacity: clamp01(p * 1.5), transform: `scale(${0.7 + 0.3 * easeOut(clamp01(p))})` }}>
      <div style={{ width: R * 2, height: R * 2, borderRadius: '50%', background: 'radial-gradient(#f6efdc,#d9cba5)', border: `${6 * s}px solid #2b2b2b`, boxShadow: `0 ${8 * s}px ${22 * s}px rgba(0,0,0,0.6)`, position: 'relative' }}>
        {Array.from({ length: 12 }, (_, i) => <div key={i} style={{ position: 'absolute', left: R - 3 * s - 6 * s, top: 4 * s, width: 4 * s, height: 12 * s, background: '#333', transformOrigin: `${2 * s}px ${R - 10 * s}px`, transform: `translateX(${4 * s}px) rotate(${i * 30}deg)` }} />)}
        <div style={{ position: 'absolute', left: R - 6 * s - 3 * s, top: R - 38 * s - 6 * s, width: 6 * s, height: 40 * s, background: '#1b1b1b', borderRadius: 3 * s, transformOrigin: `${3 * s}px ${38 * s}px`, transform: `rotate(${ha}deg)` }} />
        <div style={{ position: 'absolute', left: R - 4 * s - 2 * s, top: R - 56 * s - 6 * s, width: 4 * s, height: 58 * s, background: '#a8322a', borderRadius: 2 * s, transformOrigin: `${2 * s}px ${56 * s}px`, transform: `rotate(${ma}deg)` }} />
      </div>
      {label && <div style={{ marginTop: 8 * s, textAlign: 'center', fontFamily: NUMF, fontSize: 34 * s, color: '#fff', textShadow: '0 2px 8px #000' }}>{label}</div>}
    </div>
  );
};

/** Radio-wave arcs travelling from screen point a to b (diplomacy, reports, orders). */
export const Radio: React.FC<{ a: [number, number]; b: [number, number]; u: number; p: number; t: number; color?: string }> = ({ a, b, u, p, t, color = '#8fc4ff' }) => {
  if (p <= 0.001) return null;
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const n = 7;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width="1" height="1">
      <g transform={`translate(${a[0]},${a[1]}) rotate(${ang})`} opacity={clamp01(p * 1.5)}>
        {Array.from({ length: n }, (_, i) => {
          const f = ((t * 0.55 + i / n) % 1);
          const r = 26 * u + 16 * u * Math.sin(f * Math.PI);
          const x = f * L * Math.min(1, p * 1.4);
          const o = Math.sin(f * Math.PI);
          return <path key={i} d={`M ${x} ${-r} A ${r * 0.6} ${r} 0 0 1 ${x} ${r}`} fill="none" stroke={color} strokeWidth={8 * u} strokeLinecap="round" opacity={o} style={{ filter: `drop-shadow(0 0 ${5 * u}px ${color})` }} />;
        })}
      </g>
    </svg>
  );
};

/** A measuring bar between two screen points, with a counter label. */
export const Measure: React.FC<{ a: [number, number]; b: [number, number]; u: number; p: number; text: string }> = ({ a, b, u, p, text }) => {
  if (p <= 0.001) return null;
  const e = easeOut(clamp01(p));
  const bx = lerp(a[0], b[0], e), by = lerp(a[1], b[1], e);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const tick = (x: number, y: number) => <line x1={x - Math.sin(ang) * 16 * u} y1={y + Math.cos(ang) * 16 * u} x2={x + Math.sin(ang) * 16 * u} y2={y - Math.cos(ang) * 16 * u} stroke="#fff" strokeWidth={4 * u} />;
  return (
    <>
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width="1" height="1">
        <line x1={a[0]} y1={a[1]} x2={bx} y2={by} stroke="#000" strokeOpacity={0.5} strokeWidth={9 * u} strokeLinecap="round" />
        <line x1={a[0]} y1={a[1]} x2={bx} y2={by} stroke="#fff" strokeWidth={4.5 * u} strokeDasharray={`${12 * u} ${7 * u}`} />
        {tick(a[0], a[1])}{p > 0.6 && tick(b[0], b[1])}
      </svg>
      <div style={{ position: 'absolute', left: (a[0] + b[0]) / 2 - 120 * u, top: Math.min(a[1], b[1]) - 78 * u, width: 240 * u, textAlign: 'center', opacity: clamp01((p - 0.3) * 2),
        fontFamily: NUMF, fontSize: 48 * u, color: '#fff', textShadow: `0 ${3 * u}px ${10 * u}px #000, 0 0 ${20 * u}px rgba(0,0,0,0.6)` }}>{text}</div>
    </>
  );
};

/** A rubber stamp slammed onto the frame. */
export const Stamp: React.FC<{ x: number; y: number; u: number; p: number; text: string; color?: string; rot?: number; size?: number }> = ({ x, y, u, p, text, color = '#d23a2f', rot = -8, size = 1 }) => {
  if (p <= 0.001) return null;
  const k = clamp01(p * 3);
  const sc = lerp(2.4, 1, easeOut(k));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc * size})`, opacity: k, fontFamily: NUMF, fontSize: 92 * u, color,
      border: `${8 * u}px solid ${color}`, borderRadius: 14 * u, padding: `${2 * u}px ${26 * u}px`, letterSpacing: 4 * u, textShadow: `0 0 ${2 * u}px ${color}`, background: 'rgba(0,0,0,0.12)', whiteSpace: 'nowrap', mixBlendMode: 'normal' }}>{text}</div>
  );
};

/** A paper card holding a B&W photo (our AI breathers), slowly pushing in; "AI illustration" on the corner. */
export const Breather: React.FC<{ W: number; H: number; u: number; pic: string; p: number; t: number; dur: number; caption?: string; portrait?: boolean }> = ({ W, H, u, pic, p, t, dur, caption, portrait }) => {
  if (p <= 0.001) return null;
  const e = inOut(clamp01(p));
  const cw = portrait ? W * 0.9 : W * 0.72, ch = cw * (9 / 16);
  const zoom = 1.04 + 0.08 * clamp01(t / dur);
  return (
    <AbsoluteFill style={{ background: `rgba(6,8,10,${0.55 * e})` }}>
      <div style={{ position: 'absolute', left: (W - cw) / 2, top: (H - ch) / 2 - (portrait ? 60 * u : 0), width: cw, height: ch, padding: 16 * u, background: '#e9e2d0', boxShadow: `0 ${18 * u}px ${50 * u}px rgba(0,0,0,0.7)`,
        transform: `translateY(${(1 - e) * 120 * u}px) rotate(${lerp(-4, -1.2, e)}deg)`, opacity: e, boxSizing: 'border-box' }}>
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
          <Img src={img(pic)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.12) brightness(0.95) sepia(0.12)', transform: `scale(${zoom})` }} />
          <div style={{ position: 'absolute', right: 10 * u, bottom: 8 * u, fontFamily: LABEL, fontSize: 13 * u, color: 'rgba(255,255,255,0.8)' }}>AI illustration</div>
        </div>
        {caption && <div style={{ position: 'absolute', left: 0, right: 0, bottom: -54 * u, textAlign: 'center', fontFamily: UI, fontWeight: 700, fontSize: 30 * u, color: '#f3ecd8', textShadow: '0 2px 8px #000' }}>{caption}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** A chapter title: a small number and a big Hindi title, lower left, with a gold rule (long video only). */
export const Chapter: React.FC<{ u: number; n: string; title: string; p: number; W: number; H: number }> = ({ u, n, title, p, W, H }) => {
  if (p <= 0.001) return null;
  const e = easeOut(clamp01(p));
  return (
    <div style={{ position: 'absolute', left: 120 * u, top: H - 300 * u, opacity: clamp01(p * 1.5), width: W }}>
      <div style={{ fontFamily: ENF, fontWeight: 800, fontSize: 24 * u, color: '#e9c46a', letterSpacing: 8 * u, transform: `translateX(${(1 - e) * -40 * u}px)` }}>{n}</div>
      <div style={{ width: 340 * u * e, height: 3 * u, background: 'linear-gradient(90deg,#e9c46a,rgba(233,196,106,0))', margin: `${8 * u}px 0` }} />
      <div style={{ fontFamily: CARDF, fontSize: 64 * u, color: '#fff', textShadow: `0 ${4 * u}px ${18 * u}px rgba(0,0,0,0.85)`, transform: `translateX(${(1 - e) * -60 * u}px)` }}>{title}</div>
    </div>
  );
};

/** Big centred kinetic number (counter), e.g. "~200" jets or "14". */
export const BigNum: React.FC<{ x: number; y: number; u: number; p: number; value: string; label?: string; color?: string; size?: number }> = ({ x, y, u, p, value, label, color = '#fff', size = 1 }) => {
  if (p <= 0.001) return null;
  const e = easeOut(clamp01(p));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${(0.7 + 0.3 * e) * size})`, opacity: clamp01(p * 1.6), textAlign: 'center' }}>
      <div style={{ fontFamily: NUMF, fontSize: 150 * u, lineHeight: 1, color, textShadow: `0 ${6 * u}px ${24 * u}px rgba(0,0,0,0.85)` }}>{value}</div>
      {label && <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 36 * u, color: '#f1ead8', textShadow: '0 2px 10px #000', marginTop: 4 * u, whiteSpace: 'nowrap' }}>{label}</div>}
    </div>
  );
};

/** Hindi captions (the Shorts): 3-5 words at a time, the spoken word lit gold. */
export const Captions: React.FC<{ caps: [number, string, number][]; t: number; W: number; H: number; u: number; from: number; to: number }> = ({ caps, t, W, H, u, from, to }) => {
  const idx = caps.findIndex((c, i) => c[0] <= t && (i === caps.length - 1 || caps[i + 1][0] > t));
  if (idx < 0 || t < from || t > to) return null;
  // group into lines of up to 4 words, breaking at punctuation
  const groups: number[][] = [];
  let cur: number[] = [];
  for (let i = 0; i < caps.length; i++) {
    if (caps[i][0] < from - 0.01 || caps[i][0] > to) continue;
    cur.push(i);
    if (cur.length >= 4 || /[।,?:!]$/.test(caps[i][1]) || (i + 1 < caps.length && caps[i + 1][0] - caps[i][0] > 0.7)) { groups.push(cur); cur = []; }
  }
  if (cur.length) groups.push(cur);
  const g = groups.find((gr) => gr.includes(idx)) ?? groups.find((gr) => caps[gr[0]][0] > t);
  if (!g) return null;
  const g0 = caps[g[0]][0];
  const pin = easeOut(ramp(t, g0 - 0.05, g0 + 0.12));
  return (
    <div style={{ position: 'absolute', left: 50 * u, right: 50 * u, top: H * 0.7, textAlign: 'center', transform: `scale(${0.92 + 0.08 * pin})` }}>
      <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 74 * u, lineHeight: 1.25, WebkitTextStroke: `${10 * u}px #000`, paintOrder: 'stroke fill' }}>
        {g.map((i) => {
          const said = caps[i][0] <= t;
          return <span key={i} style={{ color: i === idx ? '#ffd23f' : said ? '#ffffff' : 'rgba(255,255,255,0.88)', marginRight: 16 * u }}>{caps[i][1].replace(/[।]/g, '')}</span>;
        })}
      </span>
    </div>
  );
};
