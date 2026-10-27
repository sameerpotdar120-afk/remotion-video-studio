import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { C, clamp, idle } from './theme';

// p08_shape_land (line 4, "मतलब पूरे भारत का लगभग आधा"; the reference's France, Germany and Spain flying in at
// 0:17): a country (`d`, screen px; India's official boundary from Natural Earth's India edition) flies in from
// `fromOff` px away at 0.3× (16 frames, motion blur while fast), lands with a back-ease overshoot and a flash on the
// edge, then bobs gently. Translucent fill with a white top sheen, a bright edge with a glow, a lift shadow, and the
// boxed name label popping on it. `out` shrinks it back. Transparent, 1080×1920.
export const P08ShapeLand: React.FC<{ d: string; c: [number, number]; name?: string; color?: string; fromOff?: [number, number]; out?: number; seed?: number }> = ({
  d, c, name = 'भारत', color = C.india, fromOff = [-700, -300], out, seed = 1,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 16], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.5)) });
  const v = interpolate(f, [0, 16], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const q = out !== undefined ? interpolate(f, [out, out + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  if (q >= 1) return null;
  const [ix, iy, ir] = idle(f, seed, 0.45);
  const flash = interpolate(f, [14, 18, 30], [0, 1, 0], clamp);
  const s = (0.3 + 0.7 * t) * (1 - q);
  const lab = interpolate(f, [16, 26], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  const tr = `translate(${c[0] + fromOff[0] * (1 - t) + ix} ${c[1] + fromOff[1] * (1 - t) + iy}) rotate(${ir * 0.6}) scale(${s}) translate(${-c[0]} ${-c[1]})`;
  return (
    <AbsoluteFill style={{ filter: v > 0.3 ? `blur(${v * 8}px)` : undefined }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <defs>
          <filter id={`p08g${seed}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={10} /></filter>
          <linearGradient id={`p08s${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.45} /><stop offset="0.5" stopColor="#fff" stopOpacity={0} /></linearGradient>
        </defs>
        <g transform={`translate(10 ${18 + 8 * (1 - t)})`} opacity={0.35}><path d={d} transform={tr} fill="#000" filter={`url(#p08g${seed})`} /></g>
        <g transform={tr}>
          <path d={d} fill="none" stroke={color} strokeWidth={14} filter={`url(#p08g${seed})`} opacity={0.9} />
          <path d={d} fill={color} fillOpacity={0.55} />
          <path d={d} fill={`url(#p08s${seed})`} />
          <path d={d} fill="none" stroke="#fff" strokeWidth={3 + 4 * flash} strokeLinejoin="round" opacity={0.85} />
        </g>
      </svg>
      {lab > 0 && <div style={{ position: 'absolute', left: c[0] + ix, top: c[1] + iy, transform: `translate(-50%, -50%) scale(${lab * (1 - q)})`, padding: '4px 22px 0', borderRadius: 12, background: 'rgba(255,255,255,0.94)',
        fontFamily: UI, fontWeight: 800, fontSize: 46, color: C.ink, boxShadow: `0 0 16px ${color}, 0 6px 12px rgba(0,0,0,0.4)`, whiteSpace: 'nowrap' }}>{name}</div>}
    </AbsoluteFill>
  );
};
