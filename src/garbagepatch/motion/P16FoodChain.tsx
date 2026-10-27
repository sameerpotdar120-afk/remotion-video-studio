import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp, idle } from './theme';

// p16_food_chain (line 9, "मछलियों के पेट से होते हुए, हमारी थाली तक"; the reference's 0:38–0:42): a row of round
// badges, glowing pink-red, pops in left to right (`step` frames apart), each holding one of the creator's images
// (microplastic → small fish gp10 → big fish gp11 → fish thali gp12), joined by dashes that draw on from badge to
// badge with a red pulse running along them; the badges throb gently. `out` collapses them into the first badge and
// to a dot. `at` is the row's centre, `gap` the spacing. Transparent, 1080×1920.
export const P16FoodChain: React.FC<{ srcs: string[]; at?: [number, number]; gap?: number; size?: number; step?: number; out?: number }> = ({ srcs, at = [540, 960], gap = 230, size = 170, step = 10, out }) => {
  const f = useCurrentFrame();
  const n = srcs.length;
  const q = out !== undefined ? interpolate(f, [out, out + 16], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  if (q >= 1) return null;
  const x0 = at[0] - (gap * (n - 1)) / 2;
  const xs = srcs.map((_, i) => x0 + i * gap * (1 - q));
  const r = size / 2;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        {xs.slice(1).map((x, i) => {
          const t = interpolate(f, [(i + 1) * step - 4, (i + 1) * step + 6], [0, 1], clamp);
          const a = xs[i] + r * 1.05, b = x - r * 1.05, e = a + (b - a) * t;
          const pulse = ((f + i * 12) % 40) / 40;
          return t > 0 ? (
            <g key={i}>
              <line x1={a} y1={at[1]} x2={e} y2={at[1]} stroke={C.pinkGlow} strokeWidth={5} strokeDasharray="10 10" strokeLinecap="round" />
              {t >= 1 && <circle cx={a + (b - a) * pulse} cy={at[1]} r={7} fill="#fff" style={{ filter: `drop-shadow(0 0 8px ${C.pink})` }} opacity={Math.sin(pulse * Math.PI)} />}
            </g>
          ) : null;
        })}
      </svg>
      {srcs.map((src, i) => {
        const s = interpolate(f, [i * step, i * step + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.4)) }) * (1 - q);
        if (s <= 0) return null;
        const th = 0.75 + 0.25 * Math.sin(f / 9 + i);
        const [ix, iy] = idle(f, i + 2, 0.2);
        return (
          <div key={i} style={{ position: 'absolute', left: xs[i] - r + ix, top: at[1] - r + iy, width: size, height: size, borderRadius: '50%', overflow: 'hidden', transform: `scale(${s})`,
            background: 'radial-gradient(circle at 40% 35%, #FFFFFF, #F4DCE4)', border: `6px solid ${C.pink}`,
            boxShadow: `0 0 ${24 * th}px ${C.pink}, 0 0 ${50 * th}px rgba(255,61,110,0.6), 0 8px 14px rgba(0,0,0,0.4)` }}>
            <Img src={src} style={{ width: '100%', height: '100%', objectFit: i === 0 ? 'cover' : 'contain', padding: i === 0 ? 0 : size * 0.1, boxSizing: 'border-box' }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
