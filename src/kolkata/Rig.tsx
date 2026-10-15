import React from 'react';
import { staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, lerp, pop, ramp } from './anim';
import sizes from '../../public/kolkata/img_sizes.json';

/** Sizes of every cut-out, by "set/part". All parts of one set share the set's canvas (cropped to the union of their
 *  alpha), so stacking them at the same origin re-assembles the object exactly. */
export const SZ = sizes as unknown as Record<string, [number, number]>;
export const has = (key: string) => !!SZ[key];
const src = (key: string) => staticFile(`kolkata/img/${key}.png`);

/** One moving part. Pivot is in fractions of the set's canvas (0..1). */
export type Part = {
  name: string;
  pivot?: [number, number];
  rot?: number;            // degrees
  dx?: number; dy?: number; // fractions of the set height
  sx?: number; sy?: number;
  a?: number;
  blur?: number;
};

export type Entry = 'rise' | 'pop' | 'drop' | 'slideL' | 'slideR' | 'fade';

/** A UE5 asset assembled from its parts, standing on the screen with a contact shadow, a slow hand-held float,
 *  a warm rim-light sweep across it, and an entrance/exit. Skipped until its files exist. */
export const Rig: React.FC<{
  set: string; parts: Part[]; x: number; y: number; h: number; t: number; t0: number; t1: number;
  entry?: Entry; tilt?: number; shadow?: boolean; sweep?: boolean; glow?: string; float?: number; z?: number;
}> = ({ set, parts, x, y, h, t, t0, t1, entry = 'rise', tilt = 0, shadow = true, sweep = true, glow, float = 1 }) => {
  const base = parts.find((p) => SZ[`${set}/${p.name}`]);
  if (!base || t < t0 - 0.05 || t > t1 + 0.45) return null;
  const [iw, ih] = SZ[`${set}/${base.name}`];
  const w = (h * iw) / ih;
  const inP = clamp01(pop(t, t0, 10, 190));
  const outP = ramp(t, t1, t1 + 0.4, easeIn);
  let tx = 0, ty = 0, s = 1, op = 1;
  switch (entry) {
    case 'rise': ty = (1 - inP) * 420 + outP * 420; op = clamp01(inP * 2) * (1 - outP); s = lerp(0.9, 1, inP); break;
    case 'pop': s = inP * (1 - outP); break;
    case 'drop': ty = (1 - inP) * -700 - outP * 200; op = 1 - outP; break;
    case 'slideL': tx = (1 - inP) * -900 + outP * 900; break;
    case 'slideR': tx = (1 - inP) * 900 - outP * 900; break;
    case 'fade': op = ramp(t, t0, t0 + 0.35) * (1 - outP); break;
  }
  if (op <= 0.01 || s <= 0.01) return null;
  const fl = float * (Math.sin((t - t0) * 1.6) * 8);
  const yaw = float * Math.sin((t - t0) * 0.7) * 1.2 + tilt;
  const sweepX = ((t - t0) * 0.35) % 1.6 - 0.3;
  return (
    <div style={{ position: 'absolute', left: x - w / 2 + tx, top: y - h / 2 + ty + fl, width: w, height: h, opacity: op, transform: `rotate(${yaw}deg) scale(${s})`, transformOrigin: '50% 90%' }}>
      {shadow && (
        <div style={{ position: 'absolute', left: w * 0.1, right: w * 0.1, top: h * 0.86, height: h * 0.12, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.6), rgba(0,0,0,0) 70%)',
          filter: 'blur(14px)', transform: `scale(${1 - fl / 200})` }} />
      )}
      {parts.map((p) => {
        const key = `${set}/${p.name}`;
        if (!SZ[key] || (p.a ?? 1) <= 0.005) return null;
        const [px, py] = p.pivot ?? [0.5, 0.5];
        const tr = `translate(${(p.dx ?? 0) * h}px, ${(p.dy ?? 0) * h}px) rotate(${p.rot ?? 0}deg) scale(${p.sx ?? 1}, ${p.sy ?? 1})`;
        const mask = `url(${src(key)})`;
        return (
          <div key={p.name} style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: `${px * 100}% ${py * 100}%`, transform: tr, opacity: p.a ?? 1,
            filter: `${p.blur ? `blur(${p.blur}px) ` : ''}${glow ? `drop-shadow(0 0 22px ${glow}) ` : ''}drop-shadow(0 18px 18px rgba(0,0,0,0.45))` }}>
            <img src={src(key)} style={{ width: w, height: h, display: 'block' }} />
            {sweep && (
              <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', mixBlendMode: 'screen',
                background: `linear-gradient(105deg, rgba(255,210,140,0) ${sweepX * 100 - 18}%, rgba(255,214,150,0.5) ${sweepX * 100}%, rgba(255,210,140,0) ${sweepX * 100 + 18}%)` }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/** Swing between two angles around a hinge: a heavy door or gate closing with a small overshoot and settle. */
export const hinge = (t: number, t0: number, from: number, to: number, dur = 0.9) => {
  const p = ramp(t, t0, t0 + dur, easeOut);
  const settle = t > t0 + dur * 0.6 ? Math.sin((t - t0 - dur * 0.6) * 18) * Math.exp(-(t - t0 - dur * 0.6) * 6) * 2.5 : 0;
  return lerp(from, to, p) + settle;
};
/** A strike: up, then a fast hit down with a bounce (gavel, stamp, seal). Returns 0 (rest) … 1 (raised). */
export const strike = (t: number, t0: number) => {
  const up = ramp(t, t0 - 0.45, t0 - 0.1, easeOut);
  const down = ramp(t, t0 - 0.1, t0, easeIn);
  const bounce = t > t0 ? Math.abs(Math.sin((t - t0) * 20)) * Math.exp(-(t - t0) * 9) * 0.25 : 0;
  return t < t0 ? up * (1 - down) : bounce;
};

export { easeIn, easeOut };
