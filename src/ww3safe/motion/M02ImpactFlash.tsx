import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m02_impact_flash: missile hit. White-hot core, yellow bloom, thin shockwave ring.
// 360x360, 60 fps, 48 frames. Transparent.

export const M02ImpactFlash: React.FC = () => {
  const f = useCurrentFrame();
  const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const core = interpolate(f, [0, 4, 14, 26], [0, 1, 0.75, 0], c);
  const coreR = interpolate(f, [0, 4, 26], [6, 34, 22], c);
  const bloom = interpolate(f, [0, 6, 40], [0, 1, 0], { ...c, easing: Easing.out(Easing.quad) });
  const bloomR = interpolate(f, [0, 8, 44], [20, 120, 150], { ...c, easing: Easing.out(Easing.cubic) });
  const ringT = interpolate(f, [2, 34], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <svg width={360} height={360} viewBox="-180 -180 360 360">
        <defs>
          <radialGradient id="bl">
            <stop offset="0" stopColor="#fff9c4" stopOpacity={1} />
            <stop offset="0.35" stopColor="#ffe14a" stopOpacity={0.85} />
            <stop offset="1" stopColor="#ffb300" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="co">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#fffbe0" />
            <stop offset="1" stopColor="#fff3a0" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle r={bloomR} fill="url(#bl)" opacity={bloom} />
        <circle r={20 + 150 * ringT} fill="none" stroke="#fff6c0" strokeWidth={10 * (1 - ringT) + 1} opacity={(1 - ringT) * 0.9} />
        <circle r={coreR} fill="url(#co)" opacity={core} />
      </svg>
    </AbsoluteFill>
  );
};
