import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { PP0, Plush } from './Plush';
import { clamp } from './theme';

// h22_saint (lines 12–13, the hope that did not burn, and "उसी Church ने उसे Saint बना दिया"; the reference's 91–94 s
// ghost): a translucent, glowing armoured Joan rises slowly with soft light rays behind her; at `halo` a golden halo ring
// fades in over her head and pulses. Respectful and calm. Transparent, 900×1300, 60 fps, 240 frames.
export const H22Saint: React.FC<{ halo?: number }> = ({ halo = 90 }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 40], [0, 0.85], clamp);
  const rise = interpolate(f, [0, 240], [60, -40]);
  const h = interpolate(f, [halo, halo + 30], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg width={900} height={1300}>
        <defs>
          <filter id="sg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={18} /></filter>
          <radialGradient id="sr" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stopColor="#FFF6D0" stopOpacity={0.9} /><stop offset="1" stopColor="#FFF6D0" stopOpacity={0} /></radialGradient>
        </defs>
        <g opacity={a}>
          {Array.from({ length: 12 }).map((_, i) => {
            const ang = (i / 12) * 360 + f * 0.2;
            return <path key={i} d="M 450 520 L 430 -200 L 470 -200 Z" fill="#FFF6D0" opacity={0.18} transform={`rotate(${ang} 450 520)`} />;
          })}
          <circle cx={450} cy={520} r={380} fill="url(#sr)" />
          <g transform={`translate(450 ${1240 + rise}) scale(0.8)`} opacity={0.75} style={{ filter: 'drop-shadow(0 0 30px #FFF6D0)' }}>
            <Plush who="joanArmor" seed="sa" f={f} pose={{ ...PP0, mouth: 'smile', lookY: -0.4, brow: 0.2 }} banner={1} />
          </g>
          {h > 0 && (
            <g transform={`translate(450 ${1240 + rise - 0.8 * 980})`} opacity={h}>
              <ellipse rx={150 + Math.sin(f / 10) * 6} ry={40} fill="none" stroke="#FFD84A" strokeWidth={22} filter="url(#sg)" />
              <ellipse rx={150 + Math.sin(f / 10) * 6} ry={40} fill="none" stroke="#FFE98A" strokeWidth={12} />
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
