import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { GEO, useFonts } from './font';
import { C, clamp, idle, wobble } from './theme';

// c05_badge (line 2, the brain, heart and lungs; line 4, the reference's 0:18.5 icons: drainage, soil, water): from
// an anchor on the map (`at`) a squiggly leader draws out to `to` (10 frames); a small gold disc grows there and pops
// (with overshoot) into a gold-rimmed round badge holding the creator's image; a black caption tag slides in under it.
// `items` = [frame, src, caption] flips to the next image and caption (a quick 3D flip). `beat` makes it throb like a
// heart, `breathe` swell slowly like lungs. `out` shrinks it back along the leader. Transparent, 1080×1920.
export const C05Badge: React.FC<{ at: [number, number]; to: [number, number]; items: [number, string, string?][]; size?: number; beat?: boolean; breathe?: boolean; out?: number; bare?: boolean }> = ({
  at, to, items, size = 170, beat, breathe, out, bare,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const q = out !== undefined ? interpolate(f, [out, out + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  if (q >= 1) return null;
  const l = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) * (1 - q);
  const s = interpolate(f, [8, 20], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.4)) }) * (1 - q);
  let k = 0;
  for (let i = 0; i < items.length; i++) if (f >= items[i][0]) k = i;
  const flip = items[k][0] > 0 ? Math.cos(interpolate(f, [items[k][0] - 6, items[k][0], items[k][0] + 6], [0, Math.PI / 2, 0], clamp)) : 1;
  const tag = interpolate(f, [4, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) * (1 - q);
  const pulse = beat ? 1 + 0.08 * Math.max(0, Math.sin((f / 60) * Math.PI * 2 * 1.2)) ** 6 + 0.05 * wobble(f % 50, 0, 3, 8) : breathe ? 1 + 0.07 * Math.sin(f / 22) : 1;
  const [ix, iy] = idle(f, at[0] % 7, 0.25);
  const x = at[0] + (to[0] + ix - at[0]) * l, y = at[1] + (to[1] + iy - at[1]) * l;
  const mx = (at[0] + x) / 2, my = (at[1] + y) / 2;
  const squig = `M${at[0]},${at[1]} Q${mx + 30},${my - 10} ${mx},${my} T${x},${y}`;
  const r = size / 2;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
        <path d={squig} fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.9 * l} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }} />
        <circle cx={at[0]} cy={at[1]} r={5 * l} fill="#fff" />
      </svg>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x - r, top: y - r, width: size, height: size, transform: `scale(${s * pulse}) scaleX(${flip})`, borderRadius: '50%',
          background: bare ? undefined : 'radial-gradient(circle at 40% 35%, #FFF6DA, #F1D38A)', border: bare ? undefined : `${size / 18}px solid ${C.gold}`,
          boxShadow: bare ? undefined : '0 10px 20px rgba(0,0,0,0.5), inset 0 0 10px rgba(120,80,0,0.4)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Img src={items[k][1]} style={{ width: bare ? '100%' : '86%', height: bare ? '100%' : '86%', objectFit: 'contain', filter: bare ? 'drop-shadow(0 10px 12px rgba(0,0,0,0.5))' : undefined }} />
        </div>
      )}
      {items[k][2] && tag > 0 && (
        <div style={{ position: 'absolute', left: x, top: y + r * s + 10, transform: `translateX(-50%) translateX(${(1 - tag) * -60}px)`, opacity: tag, padding: '3px 14px 2px', background: '#0E0E0E',
          fontFamily: GEO, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>{items[k][2]}</div>
      )}
    </AbsoluteFill>
  );
};
