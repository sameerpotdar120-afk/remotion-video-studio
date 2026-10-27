import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { clamp, idle } from './theme';

// p31_soup_bowl (line 11, "plastic का soup है"): the creator's bowl of seawater and plastic (gp23) pops up from below
// (back-ease, 14 frames) and the ladle (gp23b) dips in and stirs round and round on a flat ellipse over the bowl, its
// handle tilting as it goes, while ripple rings spread on the soup. `w` the bowl's width. Centred; transparent.
export const P31SoupBowl: React.FC<{ bowl: string; ladle: string; w?: number; out?: number }> = ({ bowl, ladle, w = 640, out }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
  const q = out !== undefined ? interpolate(f, [out, out + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  const lIn = interpolate(f, [10, 24], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const a = f / 14;
  const lx = Math.cos(a) * w * 0.16, ly = Math.sin(a) * w * 0.05;
  const [ix, iy] = idle(f, 3, 0.3);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: w, height: w, transform: `translate(${ix}px, ${iy + (1 - s) * 400 + q * 700}px) scale(${0.6 + 0.4 * s})` }}>
        <Img src={bowl} style={{ width: w, height: w, objectFit: 'contain', filter: 'drop-shadow(0 22px 22px rgba(0,0,0,0.5))' }} />
        <svg width={w} height={w} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {[0, 1, 2].map((k) => { const p = ((f / 50 + k / 3) % 1); return <ellipse key={k} cx={w / 2 + lx} cy={w * 0.42 + ly} rx={w * (0.04 + p * 0.22)} ry={w * (0.012 + p * 0.06)} fill="none" stroke="#E6FBFF" strokeWidth={2.5} opacity={(1 - p) * 0.7} />; })}
        </svg>
        {lIn > 0 && <Img src={ladle} style={{ position: 'absolute', left: w * 0.3 + lx, top: w * 0.02 + ly - (1 - lIn) * 300, width: w * 0.55, height: w * 0.55, objectFit: 'contain', opacity: lIn,
          transform: `rotate(${-20 + Math.sin(a) * 14}deg)`, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.45))' }} />}
      </div>
    </AbsoluteFill>
  );
};
