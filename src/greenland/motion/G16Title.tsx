import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp, idle } from './theme';

// g16_title (the reference's glowing names, rebuilt on the creator's 3D lettering, gl09 / gl09b / gl10 / gl10b): the
// title springs open from a flat line in 6 frames (taking over from g01's squeeze), overshoots and settles, then floats.
// A light sweep crosses the letters (masked to their own alpha). Ice titles shed a few snow puffs from their icicles;
// grass titles let a blade or a petal fall now and then. `fo` offsets the clock (a title already in place, e.g. for
// the loop) and `out` squeezes it away in 6 frames; `still` drops its own float and particles (the edit's loop-clocked
// title card moves it instead). `w` is its width in px; centred in its box.
export const G16Title: React.FC<{ src: string; ratio: number; w?: number; kind?: 'ice' | 'grass'; fo?: number; out?: number; seed?: number; sweep?: boolean; still?: boolean }> = ({
  src, ratio, w = 900, kind = 'ice', fo = 0, out, seed = 1, sweep = true, still = false,
}) => {
  const f0 = useCurrentFrame();
  const f = f0 + fo;
  const open = fo > 0 ? 1 : interpolate(f, [0, 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.6)) });
  const sx = fo > 0 ? 1 : interpolate(f, [0, 8], [1.18, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const close = out !== undefined ? interpolate(f0, [out, out + 6], [1, 0], { ...clamp, easing: Easing.in(Easing.cubic) }) : 1;
  if (close <= 0) return null;
  const h = w * ratio;
  const [ix, iy, ir] = still ? [0, 0, 0] : idle(f, seed, 0.35);
  const sw = ((f + seed * 40) % 170) / 170;
  const ice = kind === 'ice';
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: w, height: h, transform: `translate(${ix}px, ${iy}px) rotate(${ir * 0.6}deg) scale(${sx * (2 - close)}, ${open * close})` }}>
        <Img src={src} style={{ position: 'absolute', inset: 0, width: w, height: h, filter: `drop-shadow(0 14px 14px rgba(0,0,0,0.45)) drop-shadow(0 0 ${ice ? 18 : 10}px ${ice ? 'rgba(150,225,255,0.55)' : 'rgba(170,255,120,0.35)'})` }} />
        {sweep && (
          <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: `url(${src})`, WebkitMaskSize: '100% 100%', maskImage: `url(${src})`, maskSize: '100% 100%', mixBlendMode: 'screen',
            background: `linear-gradient(105deg, rgba(255,255,255,0) ${sw * 140 - 30}%, rgba(255,255,255,0.55) ${sw * 140 - 20}%, rgba(255,255,255,0) ${sw * 140 - 10}%)` }} />
        )}
        <svg width={w} height={h + 260} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
          {!still && Array.from({ length: ice ? 9 : 6 }, (_, i) => {
            const per = 80 + Math.floor(random(`p${seed}${i}`) * 70), ph = (f + Math.floor(random(`o${seed}${i}`) * per)) % per, q = ph / per;
            const x = w * (0.06 + 0.88 * random(`x${seed}${i}`)), y0 = h * (ice ? 0.82 : 0.55);
            const y = y0 + q * q * (ice ? 220 : 180), a = Math.sin(q * Math.PI) * (open >= 1 ? 1 : 0);
            return ice
              ? <circle key={i} cx={x + Math.sin(q * 6 + i) * 8} cy={y} r={2.5 + random(`r${seed}${i}`) * 3.5} fill="#fff" opacity={0.85 * a} style={{ filter: 'blur(0.6px)' }} />
              : <ellipse key={i} cx={x + Math.sin(q * 5 + i) * 18} cy={y} rx={7} ry={2.6} fill={i % 3 ? '#6FD13B' : '#FFE27A'} opacity={0.9 * a} transform={`rotate(${q * 540 + i * 40} ${x + Math.sin(q * 5 + i) * 18} ${y})`} />;
          })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
