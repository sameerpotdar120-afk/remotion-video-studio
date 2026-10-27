import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp, idle, wobble } from './theme';

// p11_callout (line 6, "बोतलें, डिब्बे, और… मछली पकड़ने के पुराने जाल"; the reference's 0:27–0:31): from a point on
// the island (`at`) a thin dark leader line shoots out to `to` (8 frames), a white disc with a dark rim pops open
// there (back-ease, then a springy wobble) holding the creator's prop (gp03 bottle / gp04 container / gp05 net), the
// prop bobbing inside it; a bright dot marks the anchor. `out` sucks it back into the anchor. Transparent.
export const P11Callout: React.FC<{ at: [number, number]; to: [number, number]; src: string; size?: number; out?: number; seed?: number }> = ({ at, to, src, size = 150, out, seed = 1 }) => {
  const f = useCurrentFrame();
  const q = out !== undefined ? interpolate(f, [out, out + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.back(1.6)) }) : 0;
  if (q >= 1) return null;
  const l = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const s = interpolate(f, [6, 16], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) }) * (1 + 0.08 * wobble(f, 16, 2.6, 3));
  const [ix, iy, ir] = idle(f, seed, 0.35);
  const bx = at[0] + (to[0] + ix - at[0]) * l * (1 - q), by = at[1] + (to[1] + iy - at[1]) * l * (1 - q);
  const r = size / 2;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <line x1={at[0]} y1={at[1]} x2={bx} y2={by} stroke="#1A2530" strokeWidth={3} opacity={0.85} />
        <circle cx={at[0]} cy={at[1]} r={7} fill="#fff" stroke="#1A2530" strokeWidth={2} style={{ filter: `drop-shadow(0 0 6px ${C.cyanGlow})` }} />
      </svg>
      {s > 0 && (
        <div style={{ position: 'absolute', left: bx - r, top: by - r, width: size, height: size, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #FFFFFF, #E4EEF4)',
          border: '5px solid #1A2530', boxShadow: '0 10px 18px rgba(0,0,0,0.45)', transform: `scale(${s * (1 - q)}) rotate(${ir}deg)`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Img src={src} style={{ width: size * 0.78, height: size * 0.78, objectFit: 'contain', transform: `translateY(${Math.sin(f / 15 + seed) * 4}px) rotate(${Math.sin(f / 23 + seed) * 6}deg)`, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.35))' }} />
        </div>
      )}
    </AbsoluteFill>
  );
};
