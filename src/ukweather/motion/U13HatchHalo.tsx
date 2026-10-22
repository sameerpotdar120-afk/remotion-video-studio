import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { clamp, graphemes, TypeOn } from './theme';

// u13_hatch_halo (line 7, "क्योंकि ये मौसम की जंग का मैदान है"; the reference's 37.4–40.6 s): fat light-blue diagonal
// stripes sweep the whole frame (6 frames), condense into a hatched rounded blob with a bright rim that contracts onto
// the islands (ease-out ~18 frames), the land inside goes grey under the hatch, and the title types in on it. Transparent,
// 1080×1080, 60 fps; the blob centre (540, 540), final radii `rx`, `ry`.
export const U13HatchHalo: React.FC<{ title?: string[]; rx?: number; ry?: number; tilt?: number }> = ({ title = ['मौसम की', 'जंग का मैदान'], rx = 300, ry = 400, tilt = -14 }) => {
  useFonts();
  const f = useCurrentFrame();
  const sweep = interpolate(f, [0, 6, 12], [0, 1, 0.6], clamp);
  const k = interpolate(f, [6, 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const R = (r: number) => r * (3.2 - 2.2 * k);
  const pts = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const w = 1 + 0.06 * Math.sin(a * 3 + 0.7) + 0.04 * Math.sin(a * 2 + f / 40);
    return `${540 + Math.cos(a) * R(rx) * w},${540 + Math.sin(a) * R(ry) * w}`;
  }).join(' L ');
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        <defs>
          <pattern id="hatch" width={18} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><rect width={18} height={18} fill="rgba(120,200,255,0.28)" /><rect width={5} height={18} fill="rgba(230,248,255,0.75)" /></pattern>
          <pattern id="fat" width={120} height={120} patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><rect width={44} height={120} fill="rgba(140,215,255,0.6)" /></pattern>
          <clipPath id="blob"><path d={`M ${pts} Z`} /></clipPath>
        </defs>
        {sweep > 0 && f < 14 && <rect width={1080} height={1080} fill="url(#fat)" opacity={sweep} />}
        <g transform={`rotate(${tilt} 540 540)`} opacity={k}>
          <path d={`M ${pts} Z`} fill="rgba(60,150,230,0.35)" />
          <rect width={1080} height={1080} fill="url(#hatch)" clipPath="url(#blob)" />
          <path d={`M ${pts} Z`} fill="none" stroke="#DFF5FF" strokeWidth={8} style={{ filter: 'drop-shadow(0 0 10px #8FD6FF)' }} />
        </g>
      </svg>
      {f >= 26 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', transform: 'rotate(-4deg)', fontFamily: UI, fontWeight: 800, color: '#fff', lineHeight: 1.02,
          textShadow: '0 5px 0 rgba(0,0,0,0.35), 0 0 22px rgba(0,60,120,0.6)' }}>
          <div style={{ fontSize: 76 }}><TypeOn text={title[0]} f={f} at={26} step={2} /></div>
          <div style={{ fontSize: 104 }}><TypeOn text={title[1]} f={f} at={26 + graphemes(title[0]).length * 2} step={2} /></div>
        </div>
      )}
    </AbsoluteFill>
  );
};
