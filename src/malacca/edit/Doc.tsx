import React from 'react';
import { Img, staticFile } from 'remotion';
import { clamp01, easeOut, ramp, linear } from '../../darien/anim';
import { ASPECT } from './assets';
import { LABEL, UI } from './font';

/**
 * The documentary map style the creator asked for (Nov 16, from a reference): a black-and-white satellite map, and
 * highlights that sit FLAT on it (no lift, no float, no drop shadow): the colour is laid onto the terrain with a
 * hard-light blend, so the relief shows through, with a crisp white outline. Countries can carry their flag (drawn in
 * code). Highlights wipe in from their centre (a keyframed reveal).
 */
export type Fill = 'india' | 'pakistan' | 'gold' | 'blue' | 'green' | 'saffron' | 'red';
const SOLID: Record<Fill, string> = { india: '#FF8A1E', pakistan: '#1E9A46', gold: '#F2D21B', blue: '#2F7BFF', green: '#22B04E', saffron: '#FF8A1E', red: '#E3262E' };

/** pass "fill" is drawn inside the hard-light layer (the colour on the terrain); pass "line" in the normal layer above it. */
export const FlatHL: React.FC<{ id: string; d: string; fill: Fill; g: number; cx: number; cy: number; mark?: number; stroke?: number; pass: 'fill' | 'line'; alpha?: number }> = ({ id, d, fill, g, cx, cy, mark = 0, stroke = 4, pass, alpha = 1 }) => {
  if (g <= 0.001) return null;
  const r = easeOut(clamp01(g * 1.15)) * 2400;
  const paint = fill === 'india' ? `url(#tri_${id})` : SOLID[fill];
  const o = clamp01(g * 2);
  const cid = `rv_${pass}_${id}`;
  if (pass === 'line') {
    return (
      <>
        <defs><clipPath id={cid}><circle cx={cx} cy={cy} r={r} /></clipPath>
          <linearGradient id={`tri_${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FF7A12" /><stop offset="0.36" stopColor="#FF9A3C" /><stop offset="0.36" stopColor="#F4F4F4" />
            <stop offset="0.64" stopColor="#F4F4F4" /><stop offset="0.64" stopColor="#1FA03E" /><stop offset="1" stopColor="#138A30" />
          </linearGradient>
        </defs>
        <g clipPath={`url(#${cid})`}>
          <path d={d} fill={paint} opacity={0.16 * o} />
          <path d={d} fill="none" stroke="#000" strokeWidth={stroke + 4} opacity={0.35 * o} strokeLinejoin="round" />
          <path d={d} fill="none" stroke="#fff" strokeWidth={stroke} opacity={o} strokeLinejoin="round" />
        </g>
      </>
    );
  }
  return (
    <>
      <defs>
        <clipPath id={cid}><circle cx={cx} cy={cy} r={r} /></clipPath>
        <clipPath id={`in_${id}`}><path d={d} /></clipPath>
        <linearGradient id={`trf_${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF7A12" /><stop offset="0.36" stopColor="#FF9A3C" /><stop offset="0.36" stopColor="#E8E8E8" />
          <stop offset="0.64" stopColor="#E8E8E8" /><stop offset="0.64" stopColor="#1FA03E" /><stop offset="1" stopColor="#138A30" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${cid})`} opacity={o * alpha}>
        <path d={d} fill={fill === 'india' ? `url(#trf_${id})` : SOLID[fill]} />
        {fill === 'india' && mark > 0 && (
          <g clipPath={`url(#in_${id})`}>
            <circle cx={cx} cy={cy} r={mark} fill="none" stroke="#0B2C8A" strokeWidth={mark * 0.12} />
            {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * mark} y2={cy + Math.sin(a) * mark} stroke="#0B2C8A" strokeWidth={mark * 0.04} />; })}
          </g>
        )}
        {fill === 'pakistan' && mark > 0 && (
          <g clipPath={`url(#in_${id})`}>
            <mask id={`cr_${id}`}><rect x={cx - mark * 2} y={cy - mark * 2} width={mark * 4} height={mark * 4} fill="#000" /><circle cx={cx} cy={cy} r={mark} fill="#fff" /><circle cx={cx + mark * 0.32} cy={cy - mark * 0.22} r={mark * 0.82} fill="#000" /></mask>
            <rect x={cx - mark * 2} y={cy - mark * 2} width={mark * 4} height={mark * 4} fill="#fff" mask={`url(#cr_${id})`} />
            <path d={star(cx + mark * 0.55, cy - mark * 0.38, mark * 0.3)} fill="#fff" />
          </g>
        )}
      </g>
    </>
  );
};
const star = (x: number, y: number, r: number) => Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r;
  return `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
}).join('') + 'Z';

/**
 * A person rising out of the map (the reference's keyframed cut-out): head and shoulders, the bottom fading into the
 * map, a dark halo behind, then a name box sliding up under it. x / bottom anchor the portrait's bottom centre; h is
 * the portrait's height in px.
 */
export type Person = { k: string; hi: string; en: string; full?: boolean; bar: string };
export const MapPerson: React.FC<{ who: Person; t: number; t0: number; x: number; bottom: number; h: number; o?: number; label?: boolean; hiOverride?: string; enOverride?: string }> = ({
  who, t, t0, x, bottom, h, o = 1, label = true, hiOverride, enOverride,
}) => {
  if (o <= 0 || t < t0 - 0.05) return null;
  const q = easeOut(ramp(t, t0, t0 + 0.7, linear));
  const lq = easeOut(ramp(t, t0 + 0.3, t0 + 0.8, linear));
  const push = 1 + 0.05 * clamp01((t - t0) / 6);
  const w = h * 0.92;
  const a = ASPECT[who.k] ?? 0.7;
  // full-body cut-outs: show head to chest; busts: fill the width
  const imgH = who.full ? h / 0.4 : (w * 1.02) / a;
  const imgW = imgH * a;
  const top = who.full ? -h * 0.03 : -h * 0.02;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: bottom - h, width: w, height: h + (label ? h * 0.26 : 0), opacity: clamp01(o) * clamp01(q * 1.6) }}>
      <div style={{ position: 'absolute', left: -w * 0.2, top: h * 0.05, width: w * 1.4, height: h * 1.0, background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.75), rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 70%)', opacity: q }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 64%, rgba(0,0,0,0) 97%)', maskImage: 'linear-gradient(180deg, #000 0%, #000 64%, rgba(0,0,0,0) 97%)' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - q) * h * 0.38}px) scale(${(1.08 - 0.08 * q) * push})`, transformOrigin: '50% 30%' }}>
          {ASPECT[who.k] && <Img src={staticFile(`malacca/img/${who.k}.png`)} style={{ position: 'absolute', width: imgW, height: imgH, left: (w - imgW) / 2, top, filter: 'contrast(1.06) saturate(0.92)' }} />}
        </div>
      </div>
      {label && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: h * 0.86, textAlign: 'center', transform: `translateY(${(1 - lq) * 30}px) scale(${0.85 + 0.15 * lq})`, opacity: lq }}>
          <div style={{ display: 'inline-block', background: '#F7F7F2', borderTop: `${Math.max(5, h * 0.012)}px solid ${who.bar}`, padding: `${h * 0.008}px ${h * 0.04}px ${h * 0.012}px`, boxShadow: '0 8px 22px rgba(0,0,0,0.55)' }}>
            <div style={{ fontFamily: UI, fontWeight: 800, fontSize: Math.max(30, h * 0.085), lineHeight: 1.12, color: '#0A0A0A', whiteSpace: 'nowrap' }}>{hiOverride ?? who.hi}</div>
            <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: Math.max(14, h * 0.032), letterSpacing: 2, color: '#333', whiteSpace: 'nowrap' }}>{enOverride ?? who.en}</div>
          </div>
          <div style={{ marginTop: 4, fontFamily: LABEL, fontSize: Math.max(12, h * 0.02), color: 'rgba(255,255,255,0.7)', textShadow: '0 2px 6px #000' }}>AI illustration</div>
        </div>
      )}
    </div>
  );
};
