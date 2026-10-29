import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { GEO, UI, useFonts } from './font';
import { clamp } from './theme';

// c21_tag (the reference's place tags: "LAHORE", "CHANDIGARH", and the V1 towns "Kalka", "Ambala"): a black box with
// white caps drops onto `at` (screen px, the point it names) from 30 px above with a small bounce, with a short arrow
// notch toward the point on `side`; the letters reveal left to right. `out` slides it away. Transparent, 1080×1920.
export const C21Tag: React.FC<{ at: [number, number]; text: string; side?: 'left' | 'right' | 'below'; size?: number; out?: number }> = ({ at, text, side = 'below', size = 34, out }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const q = out !== undefined ? interpolate(f, [out, out + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  if (s <= 0 || q >= 1) return null;
  const rev = interpolate(f, [4, 16], [0, 100], clamp);
  const latin = /^[\x00-\x7F]*$/.test(text);
  const off = 18;
  const pos: React.CSSProperties = side === 'below' ? { left: at[0], top: at[1] + off, transform: 'translateX(-50%)' } : side === 'right' ? { left: at[0] + off, top: at[1], transform: 'translateY(-50%)' } : { left: at[0] - off, top: at[1], transform: 'translate(-100%, -50%)' };
  return (
    <AbsoluteFill style={{ opacity: s * (1 - q) }}>
      <div style={{ position: 'absolute', ...pos, marginTop: (1 - s) * -30 }}>
        <div style={{ padding: `${size * 0.15}px ${size * 0.45}px ${size * 0.1}px`, background: '#0B0B0B', color: '#fff', fontFamily: latin ? GEO : UI, fontWeight: 700, fontSize: size, letterSpacing: latin ? 2 : 0,
          whiteSpace: 'nowrap', boxShadow: '0 6px 10px rgba(0,0,0,0.55)', clipPath: `inset(0 ${100 - rev}% 0 0)` }}>{latin ? text.toUpperCase() : text}</div>
      </div>
    </AbsoluteFill>
  );
};
