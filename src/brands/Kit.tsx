import React, { useEffect, useState } from 'react';
import { Img, continueRender, delayRender, staticFile } from 'remotion';
import sizes from '../../public/brands/img_sizes.json';

/** The Brands Short's overlay kit (1080x1920 design px): fonts, the brand-name card (the reference's "logo pop",
 * done with type), glass pills with a strike, props with a contact shadow, people rising out of the map, pins. */
export const TITLE = "'BRAnton', 'Anton', Impact, sans-serif";
export const UI = "'BRBaloo', 'Baloo 2', sans-serif";
export const LABEL = "'BRMont', 'Montserrat', sans-serif";
export const C = { saffron: '#FF8A1E', yellow: '#FFD23F', red: '#E8202A', blue: '#2F7BFF', white: '#F6F7F8', green: '#1FA03E' };

let fontsP: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('br fonts'));
  useEffect(() => {
    fontsP ??= Promise.all(([['BRAnton', 'Anton.ttf', '400'], ['BRBaloo', 'Baloo2.ttf', '400 800'], ['BRMont', 'Montserrat.ttf', '100 900']] as const)
      .map(([n, f, w]) => new FontFace(n, `url(${staticFile(`brands/fonts/${f}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    fontsP.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeIn = (x: number) => Math.pow(clamp01(x), 3);
export const inOut = (x: number) => { const v = clamp01(x); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
export const back = (x: number) => { const v = clamp01(x), c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
/** 0..1 in over [t0, t0+a], 1..0 out over [t1, t1+b]; t0 < 0 means "already in at frame 0" */
export const win = (t: number, t0: number, t1: number, a = 0.3, b = 0.25) => (t0 < 0 ? 1 : clamp01((t - t0) / a)) * (1 - clamp01((t - t1) / b));
export const graphemes = (s: string): string[] => {
  const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: object) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter;
  return Seg ? Array.from(new Seg('hi', { granularity: 'grapheme' }).segment(s), (x) => x.segment) : Array.from(s);
};

const SZ = sizes as Record<string, { w: number; h: number }>;
export const asp = (k: string) => SZ[k].w / SZ[k].h;
export const IMG = (k: string) => staticFile(`brands/img/${k}.png`);

/** The brand name lands like the reference's logo: scale + blur in a few frames, a light sweep, an accent bar. */
export const Card: React.FC<{ t: number; t0: number; t1: number; name: string; col: string; y?: number }> = ({ t, t0, t1, name, col, y = 470 }) => {
  if (t0 >= 0 && t < t0) return null;
  if (t > t1 + 0.2) return null;
  const p = t0 < 0 ? 1 : easeOut((t - t0) / 0.24);
  const q = clamp01((t - t1) / 0.16);
  const size = Math.min(176, 960 / (name.length * 0.5));
  const sweep = t0 < 0 ? 2 : (t - t0) / 0.7;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', transform: `translateY(-50%) scale(${(1.14 - 0.14 * p) * (1 + 0.12 * q)})`, opacity: p * (1 - q), filter: `blur(${((1 - p) * 14 + q * 10).toFixed(1)}px)` }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ fontFamily: TITLE, fontSize: size, lineHeight: 1, letterSpacing: size * 0.03, color: '#fff', whiteSpace: 'nowrap', textShadow: `0 0 40px ${col}66, 0 8px 30px rgba(0,0,0,0.75)` }}>{name}</div>
        {sweep < 1.4 && (
          <div style={{ position: 'absolute', inset: 0, fontFamily: TITLE, fontSize: size, lineHeight: 1, letterSpacing: size * 0.03, whiteSpace: 'nowrap', color: 'transparent',
            backgroundImage: `linear-gradient(105deg, transparent ${(sweep * 140 - 30).toFixed(0)}%, rgba(255,255,255,0.95) ${(sweep * 140 - 12).toFixed(0)}%, transparent ${(sweep * 140 + 6).toFixed(0)}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>{name}</div>
        )}
        <div style={{ height: 9, margin: '14px auto 0', width: `${(t0 < 0 ? 1 : easeOut((t - t0 - 0.1) / 0.35)) * 62}%`, background: col, borderRadius: 5, boxShadow: `0 0 22px ${col}` }} />
      </div>
    </div>
  );
};

/** A glass pill with the twist; it can be struck through (a red line draws across, the text dims). */
export const Pill: React.FC<{ t: number; t0: number; t1: number; hi: string; en?: string; col: string; y?: number; strike?: number }> = ({ t, t0, t1, hi, en, col, y = 640, strike }) => {
  if ((t0 >= 0 && t < t0) || t > t1 + 0.25) return null;
  const p = t0 < 0 ? 1 : back((t - t0) / 0.3);
  const q = clamp01((t - t1) / 0.2);
  const s = strike !== undefined ? easeOut((t - strike) / 0.22) : 0;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', transform: `translateY(-50%) scale(${(0.7 + 0.3 * p) * (1 - 0.1 * q)})`, opacity: clamp01(p * 1.5) * (1 - q) }}>
      <div style={{ position: 'relative', display: 'inline-block', padding: '12px 40px 10px', borderRadius: 60, background: 'linear-gradient(180deg, rgba(22,24,30,0.82), rgba(8,9,12,0.9))', border: `3px solid ${col}`,
        boxShadow: `0 0 30px ${col}77, inset 0 0 24px ${col}33, 0 12px 30px rgba(0,0,0,0.6)`, whiteSpace: 'nowrap' }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 60, lineHeight: 1.1, color: '#fff', opacity: 1 - 0.45 * s }}>{hi}</div>
        {en && <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: col, marginTop: -2, opacity: 1 - 0.45 * s }}>{en}</div>}
        {s > 0 && <div style={{ position: 'absolute', left: '6%', top: '50%', height: 9, width: `${88 * s}%`, background: '#FF2B2B', borderRadius: 5, transform: 'rotate(-6deg)', boxShadow: '0 0 16px #FF2B2B' }} />}
      </div>
    </div>
  );
};

/** A prop render landing on its word, with a contact shadow and a soft light wrap in the accent colour. */
export const Prop: React.FC<{ t: number; t0: number; t1: number; k: string; x: number; y: number; w: number; col: string; rot?: number }> = ({ t, t0, t1, k, x, y, w, col, rot = 0 }) => {
  if ((t0 >= 0 && t < t0) || t > t1 + 0.25) return null;
  const p = t0 < 0 ? 1 : back((t - t0) / 0.42);
  const q = clamp01((t - t1) / 0.2);
  const h = w / asp(k);
  const life = t0 < 0 ? t + 1 : t - t0;
  const drift = 1 + 0.025 * clamp01(life / 3);
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: clamp01(p * 1.6) * (1 - q),
      transform: `translateY(${(1 - p) * 80}px) scale(${(0.82 + 0.18 * p) * drift * (1 - 0.15 * q)}) rotate(${rot * (1 - p) * 4 + rot}deg)` }}>
      <div style={{ position: 'absolute', left: '12%', right: '12%', bottom: -h * 0.04, height: h * 0.12, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.7), rgba(0,0,0,0) 70%)' }} />
      <Img src={IMG(k)} style={{ position: 'absolute', inset: 0, width: w, height: h, filter: `drop-shadow(0 0 26px ${col}55) drop-shadow(0 18px 24px rgba(0,0,0,0.55))` }} />
    </div>
  );
};

/** A person rising out of their place on the map: head and shoulders, bottom fading into the map, a dark halo, a name box. */
export const Person: React.FC<{ t: number; t0: number; t1: number; k: string; x: number; bottom: number; h: number; hi: string; en: string; bar: string }> = ({ t, t0, t1, k, x, bottom, h, hi, en, bar }) => {
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const q = easeOut((t - t0) / 0.7);
  const lq = easeOut((t - t0 - 0.3) / 0.5);
  const out = clamp01((t - t1) / 0.3);
  const w = h * 0.92;
  const a = asp(k);
  const imgW = w * 1.02, imgH = imgW / a;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: bottom - h, width: w, height: h * 1.3, opacity: clamp01(q * 1.6) * (1 - out) }}>
      <div style={{ position: 'absolute', left: -w * 0.2, top: h * 0.05, width: w * 1.4, height: h, background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.75), rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 70%)', opacity: q }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 64%, rgba(0,0,0,0) 97%)', maskImage: 'linear-gradient(180deg, #000 0%, #000 64%, rgba(0,0,0,0) 97%)' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - q) * h * 0.4}px) scale(${(1.08 - 0.08 * q) * (1 + 0.04 * clamp01((t - t0) / 3))})`, transformOrigin: '50% 30%' }}>
          <Img src={IMG(k)} style={{ position: 'absolute', width: imgW, height: imgH, left: (w - imgW) / 2, top: -h * 0.02, filter: 'contrast(1.06) saturate(0.92)' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: -60, right: -60, top: h * 0.86, textAlign: 'center', transform: `translateY(${(1 - lq) * 30}px) scale(${0.85 + 0.15 * lq})`, opacity: lq }}>
        <div style={{ display: 'inline-block', background: '#F7F7F2', borderTop: `7px solid ${bar}`, padding: '4px 26px 8px', boxShadow: '0 8px 22px rgba(0,0,0,0.55)' }}>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 46, lineHeight: 1.12, color: '#0A0A0A', whiteSpace: 'nowrap' }}>{hi}</div>
          <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 18, letterSpacing: 2, color: '#333', whiteSpace: 'nowrap' }}>{en}</div>
        </div>
        <div style={{ marginTop: 4, fontFamily: LABEL, fontSize: 15, color: 'rgba(255,255,255,0.7)', textShadow: '0 2px 6px #000' }}>AI illustration</div>
      </div>
    </div>
  );
};

/** A pin on the map: a dot with a pulsing ring, a stem, a label. */
export const Pin: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; label: string; col: string; side?: 'r' | 'l'; drop?: number }> = ({ t, t0, t1, x, y, label, col, side = 'r', drop = 0 }) => {
  if (t < t0 || t > t1 + 0.25) return null;
  const p = back((t - t0) / 0.35);
  const q = clamp01((t - t1) / 0.2);
  const ring = ((t - t0) % 1.2) / 1.2;
  const lo = easeOut((t - t0 - 0.15) / 0.3);
  return (
    <div style={{ position: 'absolute', left: x, top: y + drop, opacity: (1 - q) * clamp01(p * 2) }}>
      <div style={{ position: 'absolute', left: -60 * ring, top: -60 * ring, width: 120 * ring, height: 120 * ring, borderRadius: '50%', border: `3px solid ${col}`, opacity: 1 - ring }} />
      <div style={{ position: 'absolute', left: -15, top: -15, width: 30, height: 30, borderRadius: '50%', background: '#fff', border: `7px solid ${col}`, boxShadow: `0 0 20px ${col}, 0 4px 10px rgba(0,0,0,0.6)`, transform: `scale(${p})` }} />
      <div style={{ position: 'absolute', top: 0, [side === 'r' ? 'left' : 'right']: 30, transform: `translate(${(side === 'r' ? -1 : 1) * (1 - lo) * 20}px, -50%)`, opacity: lo, whiteSpace: 'nowrap',
        fontFamily: TITLE, fontSize: 52, letterSpacing: 2, color: '#fff', textShadow: `0 0 20px ${col}aa, 0 4px 12px rgba(0,0,0,0.85)` } as React.CSSProperties}>{label}</div>
    </div>
  );
};

/** The ghost country name drifting across the frame (the reference's huge faint name). */
export const Ghost: React.FC<{ t: number; t0: number; t1: number; text: string; y?: number }> = ({ t, t0, t1, text, y = 1180 }) => {
  const o = win(t, t0, t1, 0.4, 0.3);
  if (o <= 0) return null;
  const life = t0 < 0 ? t + 1 : t - t0;
  return (
    <div style={{ position: 'absolute', left: 0, top: y, whiteSpace: 'nowrap', transform: `translate(${120 - life * 55}px, -50%)`, fontFamily: TITLE, fontSize: 300, letterSpacing: 18, color: '#fff', opacity: 0.13 * o }}>{text}</div>
  );
};
