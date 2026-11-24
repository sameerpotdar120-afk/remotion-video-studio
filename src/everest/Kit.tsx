import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from 'remotion';
import { clamp01, easeOut, graphemes, inOut, lerp, pop, ramp } from '../darien/anim';
import sizes from '../../public/everest/img_sizes.json';

/** The Everest Short's overlay kit: fonts, glass pills, big counters, pins, the altitude ruler, props with contact
 * shadows and light wrap, tags, captions, light rays, particles and the final grade. 1080x1920 design pixels. */
export const W = 1080, HH = 1920;
export const TITLE = "'EVAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'EVJost', 'Jost', sans-serif";
export const UI = "'EVBaloo', 'Baloo 2', sans-serif";
export const COL = { gold: '#FFC23A', amber: '#FFA21A', pink: '#FF3D86', sea: '#38C8FF', cyan: '#7FF4FF', white: '#F6F7F8', ink: '#06121c' };
let fontsP: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('ev fonts'));
  useEffect(() => {
    fontsP ??= Promise.all(([['EVAnton', 'Anton.ttf', '400'], ['EVJost', 'Jost.ttf', '100 900'], ['EVBaloo', 'Baloo2.ttf', '400 800']] as const)
      .map(([n, f, w]) => new FontFace(n, `url(${staticFile(`everest/fonts/${f}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    fontsP.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
const SZ = sizes as Record<string, { w: number; h: number }>;
export const asp = (k: string) => SZ[k].w / SZ[k].h;
export const src = (k: string) => staticFile(`everest/img/${k}.png`);

/** A glass pill with a glowing rim, the text typing on (West Indies' label), optional small English line. */
export const Pill: React.FC<{ x: number; y: number; t: number; t0: number; t1?: number; hi: string; en?: string; col?: string; size?: number; anchor?: 'c' | 'l' | 'r' }> = ({ x, y, t, t0, t1 = 1e9, hi, en, col = COL.gold, size = 54, anchor = 'c' }) => {
  if (t < t0 || t > t1 + 0.4) return null;
  const p = pop(t, t0, 13, 210);
  const out = ramp(t, t1, t1 + 0.35, inOut);
  const g = graphemes(hi);
  const n = Math.round(clamp01((t - t0 - 0.08) / 0.4) * g.length);
  const sweep = ((t - t0) * 0.55) % 1.6;
  const tx = anchor === 'c' ? '-50%' : anchor === 'l' ? '0%' : '-100%';
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(${tx},-50%) scale(${lerp(0.6, 1, p) * (1 - out * 0.15)})`, opacity: Math.min(1, p * 1.4) * (1 - out), transformOrigin: anchor === 'l' ? '0 50%' : anchor === 'r' ? '100% 50%' : '50% 50%' }}>
      <div style={{ position: 'relative', overflow: 'hidden', padding: `${size * 0.22}px ${size * 0.55}px ${size * 0.18}px`, borderRadius: size, background: 'linear-gradient(180deg, rgba(20,32,44,0.78), rgba(6,14,22,0.86))',
        border: `2.5px solid ${col}`, boxShadow: `0 0 ${size * 0.5}px ${col}88, inset 0 0 ${size * 0.4}px ${col}33, 0 ${size * 0.25}px ${size * 0.6}px rgba(0,0,0,0.55)`, whiteSpace: 'nowrap', textAlign: 'center' }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.12, color: '#fff', textShadow: `0 0 18px ${col}66` }}>
          {g.slice(0, n).join('')}<span style={{ opacity: 0 }}>{g.slice(n).join('')}</span>
        </div>
        {en && <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: size * 0.36, letterSpacing: size * 0.09, color: col, marginTop: -size * 0.04, opacity: clamp01((t - t0 - 0.3) / 0.3) }}>{en}</div>}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(sweep - 0.3) * 100}%`, width: '22%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)', transform: 'skewX(-20deg)' }} />
      </div>
    </div>
  );
};

/** A big number counting up and landing with a ring and a light sweep. */
export const Counter: React.FC<{ x: number; y: number; t: number; t0: number; t1: number; to: number; fmt: (v: number) => string; unit?: string; col?: string; size?: number; dur?: number }> = ({ x, y, t, t0, t1, to, fmt, unit, col = COL.gold, size = 170, dur = 0.7 }) => {
  if (t < t0 || t > t1 + 0.35) return null;
  const p = pop(t, t0, 12, 190);
  const c = easeOut(clamp01((t - t0) / dur));
  const land = t - t0 - dur;
  const bump = land > 0 ? Math.exp(-9 * land) * Math.sin(land * 30) * 0.05 : 0;
  const ring = land > 0 ? clamp01(land / 0.5) : 0;
  const out = ramp(t, t1, t1 + 0.3, inOut);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${(lerp(0.7, 1, p) + bump) * (1 - out * 0.2)})`, opacity: Math.min(1, p * 1.5) * (1 - out), textAlign: 'center' }}>
      {ring > 0 && ring < 1 && <div style={{ position: 'absolute', left: '50%', top: '45%', width: size * 3 * ring, height: size * 3 * ring, transform: 'translate(-50%,-50%)', borderRadius: '50%', border: `4px solid ${col}`, opacity: 1 - ring }} />}
      <div style={{ fontFamily: TITLE, fontSize: size, lineHeight: 0.95, color: '#fff', letterSpacing: 2, textShadow: `0 0 30px ${col}aa, 0 6px 24px rgba(0,0,0,0.7)`, whiteSpace: 'nowrap' }}>{fmt(to * c)}</div>
      {unit && <div style={{ fontFamily: UI, fontWeight: 800, fontSize: size * 0.36, color: col, marginTop: size * 0.02, textShadow: '0 3px 12px rgba(0,0,0,0.8)', whiteSpace: 'nowrap' }}>{unit}</div>}
    </div>
  );
};

/** A map pin with a pulsing halo and a two-line label. */
export const Pin: React.FC<{ x: number; y: number; t: number; t0: number; t1?: number; hi: string; en?: string; col?: string; side?: 'r' | 'l' | 'u'; size?: number }> = ({ x, y, t, t0, t1 = 1e9, hi, en, col = '#fff', side = 'r', size = 46 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const p = pop(t, t0, 11, 200), o = 1 - ramp(t, t1, t1 + 0.3);
  const ph = ((t - t0) * 1.1) % 1;
  const lab: React.CSSProperties = side === 'r' ? { left: x + 34, top: y, transform: `translate(0,-50%) scale(${p})`, transformOrigin: '0 50%' }
    : side === 'l' ? { left: x - 34, top: y, transform: `translate(-100%,-50%) scale(${p})`, transformOrigin: '100% 50%', textAlign: 'right' }
      : { left: x, top: y - 40, transform: `translate(-50%,-100%) scale(${p})`, transformOrigin: '50% 100%', textAlign: 'center' };
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <svg width={W} height={HH} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <circle cx={x} cy={y} r={12 + 46 * ph} fill="none" stroke={col} strokeWidth={4} opacity={(1 - ph) * p} />
        <circle cx={x} cy={y} r={13 * p} fill={col} stroke="rgba(0,0,0,0.55)" strokeWidth={3} />
        <circle cx={x} cy={y} r={30 * p} fill={col} opacity={0.18} />
      </svg>
      <div style={{ position: 'absolute', ...lab, whiteSpace: 'nowrap', textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 0 22px rgba(0,0,0,0.7)' }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.0, color: '#fff' }}>{hi}</div>
        {en && <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: size * 0.42, letterSpacing: 4, color: col }}>{en}</div>}
      </div>
    </div>
  );
};

/** A vertical altitude ruler from the ground up to a mark, ticking up as it draws. */
export const Ruler: React.FC<{ x: number; yTop: number; yBase: number; t: number; t0: number; t1: number; label: string; col?: string }> = ({ x, yTop, yBase, t, t0, t1, label, col = COL.cyan }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const d = easeOut(clamp01((t - t0) / 0.8)), o = 1 - ramp(t, t1, t1 + 0.3);
  const y = lerp(yBase, yTop, d);
  const ticks = Array.from({ length: 11 }, (_, i) => lerp(yBase, yTop, i / 10)).filter((v) => v >= y - 1);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <svg width={W} height={HH} style={{ position: 'absolute', overflow: 'visible' }}>
        <line x1={x} y1={yBase} x2={x} y2={y} stroke={col} strokeWidth={5} style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
        {ticks.map((v, i) => <line key={i} x1={x - (i % 5 === 0 ? 22 : 12)} y1={v} x2={x} y2={v} stroke={col} strokeWidth={3} />)}
        <circle cx={x} cy={y} r={11} fill="#fff" stroke={col} strokeWidth={4} />
      </svg>
      <div style={{ position: 'absolute', left: x + 26, top: y, transform: 'translate(0,-50%)', fontFamily: TITLE, fontSize: 92, color: '#fff', textShadow: `0 0 24px ${col}, 0 4px 14px rgba(0,0,0,0.8)`, whiteSpace: 'nowrap', opacity: d }}>{label}</div>
    </div>
  );
};

/** A prop cut-out standing in the scene: contact shadow, a light wrap from the scene colour, optional underwater tint. */
export const Prop: React.FC<{ k: string; x: number; y: number; h: number; o?: number; rot?: number; tint?: number; wrap?: string; shadow?: number; flip?: boolean; origin?: string; style?: React.CSSProperties; bright?: number }> = ({ k, x, y, h, o = 1, rot = 0, tint = 0, wrap = '#6fb6ff', shadow = 1, flip = false, origin = '50% 100%', style, bright = 1 }) => {
  if (o <= 0.002 || h < 2) return null;
  const w = h * asp(k);
  const f = `drop-shadow(0 ${h * 0.02}px ${h * 0.03}px rgba(0,0,0,${0.55 * shadow})) brightness(${bright * (1 - tint * 0.35)}) saturate(${1 - tint * 0.55}) contrast(1.04)`;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, opacity: o, transform: `rotate(${rot}deg)${flip ? ' scaleX(-1)' : ''}`, transformOrigin: origin, ...style }}>
      {shadow > 0 && <div style={{ position: 'absolute', left: '8%', right: '8%', bottom: -h * 0.02, height: h * 0.06, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.6), transparent)', opacity: shadow }} />}
      <Img src={src(k)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: f }} />
      {/* light wrap: the scene colour bleeding in from the edges, clipped to the cut-out */}
      <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: `url(${src(k)})`, WebkitMaskSize: '100% 100%', maskImage: `url(${src(k)})`, maskSize: '100% 100%',
        background: `radial-gradient(120% 90% at 50% 40%, transparent 55%, ${wrap}55 100%)`, mixBlendMode: 'screen' }} />
      {tint > 0 && <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: `url(${src(k)})`, WebkitMaskSize: '100% 100%', maskImage: `url(${src(k)})`, maskSize: '100% 100%',
        background: 'linear-gradient(180deg, #4fd2e6, #0c4a63)', mixBlendMode: 'color', opacity: tint * 0.85 }} />}
    </div>
  );
};

/** A small corner tag: "AI illustration", "चित्रण". */
export const Tag: React.FC<{ text: string; o: number; x?: number; y?: number }> = ({ text, o, x = 44, y = 1740 }) => o <= 0.01 ? null : (
  <div style={{ position: 'absolute', left: x, top: y, opacity: o * 0.92, fontFamily: LABEL, fontWeight: 600, fontSize: 25, letterSpacing: 2, color: 'rgba(255,255,255,0.85)', padding: '5px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.42)', border: '1px solid rgba(255,255,255,0.25)' }}>{text}</div>
);

/** Captions: one chunk at a time, the spoken word lit gold. */
export const Captions: React.FC<{ t: number; caps: [number, number, string][]; y: number; o?: number }> = ({ t, caps, y, o = 1 }) => {
  const c = caps.find(([a, b]) => t >= a && t < b);
  if (!c || o <= 0.01) return null;
  const [a, b, s] = c;
  const words = s.split(' ');
  const lens = words.map((w) => graphemes(w).length + 1);
  const tot = lens.reduce((x, y2) => x + y2, 0);
  let acc = 0;
  const span = (b - a) * 0.92;
  const p = pop(t, a, 14, 260);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: y, transform: `translateY(-50%) scale(${lerp(0.86, 1, p)})`, opacity: o * Math.min(1, p * 2), textAlign: 'center', lineHeight: 1.18 }}>
      {words.map((w, i) => {
        const ws = a + (acc / tot) * span; acc += lens[i];
        const on = t >= ws;
        const cur = on && t < a + (acc / tot) * span;
        return (
          <span key={i} style={{ fontFamily: UI, fontWeight: 800, fontSize: 74, color: cur ? COL.gold : '#fff', opacity: on ? 1 : 0.55,
            WebkitTextStroke: '7px rgba(4,10,16,0.92)', paintOrder: 'stroke fill', textShadow: cur ? `0 0 26px ${COL.gold}99, 0 6px 16px rgba(0,0,0,0.6)` : '0 6px 16px rgba(0,0,0,0.6)', margin: '0 9px', display: 'inline-block' }}>{w}</span>
        );
      })}
    </div>
  );
};

/** God rays from the surface (underwater) or the sun. */
export const Rays: React.FC<{ o: number; t: number; col?: string; x?: number }> = ({ o, t, col = '160,235,255', x = 540 }) => o <= 0.01 ? null : (
  <AbsoluteFill style={{ opacity: o, mixBlendMode: 'screen', pointerEvents: 'none' }}>
    {Array.from({ length: 7 }, (_, i) => {
      const a = -24 + i * 8 + 3 * Math.sin(t * 0.6 + i * 1.7);
      const w = 70 + 50 * Math.sin(i * 2.3 + 1), al = 0.1 + 0.07 * Math.sin(t * 0.9 + i * 2.1);
      return <div key={i} style={{ position: 'absolute', left: x - w / 2 + (i - 3) * 60, top: -200, width: w, height: 2300, transformOrigin: '50% 0', transform: `rotate(${a}deg)`,
        background: `linear-gradient(180deg, rgba(${col},${al * 2}), rgba(${col},${al}) 40%, transparent 85%)`, filter: 'blur(18px)' }} />;
    })}
  </AbsoluteFill>
);

/** Rising bubbles / drifting marine snow (seeded, loop-safe in time). */
export const Particles: React.FC<{ o: number; t: number; n?: number; up?: boolean; col?: string }> = ({ o, t, n = 46, up = true, col = '200,245,255' }) => o <= 0.01 ? null : (
  <AbsoluteFill style={{ opacity: o, pointerEvents: 'none' }}>
    {Array.from({ length: n }, (_, i) => {
      const r1 = (Math.sin(i * 12.9898) * 43758.5453) % 1, r2 = (Math.sin(i * 78.233) * 12543.123) % 1, r3 = (Math.sin(i * 39.17) * 9631.77) % 1;
      const sp = 60 + Math.abs(r2) * 160, s = 3 + Math.abs(r3) * (up ? 10 : 5);
      const yy = (((Math.abs(r2) * 2200 + (up ? -1 : 0.25) * t * sp) % 2200) + 2200) % 2200 - 140;
      const xx = Math.abs(r1) * 1080 + 18 * Math.sin(t * 1.3 + i);
      return <div key={i} style={{ position: 'absolute', left: xx, top: yy, width: s, height: s, borderRadius: '50%', border: up ? `1.5px solid rgba(${col},0.7)` : 'none', background: up ? `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8), rgba(${col},0.15))` : `rgba(${col},0.55)`, filter: up ? 'none' : 'blur(1px)' }} />;
    })}
  </AbsoluteFill>
);

/** The final look: vignette, a gentle teal/amber split, a soft top/bottom fall-off. No grain. */
export const Grade: React.FC<{ v?: number }> = ({ v = 1 }) => (
  <>
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,30,48,0.22), transparent 30%, transparent 70%, rgba(40,22,6,0.16))', mixBlendMode: 'soft-light', pointerEvents: 'none' }} />
    <AbsoluteFill style={{ background: `radial-gradient(120% 85% at 50% 46%, transparent 52%, rgba(0,4,10,${0.62 * v}) 100%)`, pointerEvents: 'none' }} />
  </>
);
