import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m06_bolivia_face: a cartoon face and arms to lay over Bolivia's shape: eyes look left, right, then at the camera;
// brows go from worried to annoyed; the arms open in a "where did it go?" shrug. 600x500, 60 fps, 300 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M06BoliviaFace: React.FC = () => {
  const f = useCurrentFrame();
  const pop = interpolate(f, [0, 8, 14], [0, 1.15, 1], { ...c, easing: Easing.out(Easing.quad) });
  const look = interpolate(f, [20, 40, 70, 90, 120, 135], [0, -1, -1, 1, 1, 0], c);
  const annoyed = interpolate(f, [150, 175], [0, 1], c);
  const shrug = interpolate(f, [40, 60], [0, 1], { ...c, easing: Easing.out(Easing.back(1.6)) });
  const blink = (f % 95) > 89 ? 0.12 : 1;
  const mouthO = interpolate(f, [150, 175], [1, 0], c);
  return (
    <AbsoluteFill>
      <svg width={600} height={500} viewBox="-300 -250 600 500">
        <g transform={`scale(${pop})`}>
          {/* arms: curved black lines with round hands, opening into a shrug */}
          {[-1, 1].map((s) => (
            <g key={s}>
              <path d={`M ${s * 70} 30 Q ${s * (130 + 60 * shrug)} ${60 - 70 * shrug} ${s * (170 + 70 * shrug)} ${-10 - 90 * shrug}`} fill="none" stroke="#111" strokeWidth={9} strokeLinecap="round" />
              <circle cx={s * (172 + 70 * shrug)} cy={-14 - 90 * shrug} r={14} fill="#fff" stroke="#111" strokeWidth={5} />
            </g>
          ))}
          {[-48, 48].map((ex, i) => (
            <g key={i} transform={`translate(${ex} -30)`}>
              <ellipse rx={36} ry={42 * blink} fill="#fff" stroke="#111" strokeWidth={6} />
              <circle cx={look * 14} cy={4} r={15 * blink} fill="#111" />
              <circle cx={look * 14 + 6} cy={-2} r={4} fill="#fff" />
              {/* brows: worried (inner up) → annoyed (inner down) */}
              <line x1={i ? -26 : 26} y1={-58 + (1 - annoyed) * -10 + annoyed * 12} x2={i ? 30 : -30} y2={-66 - (1 - annoyed) * 2 - annoyed * 4}
                stroke="#111" strokeWidth={8} strokeLinecap="round" />
            </g>
          ))}
          {mouthO > 0.5 ? <ellipse cx={0} cy={50} rx={12} ry={16} fill="#3a0d0d" /> : (
            <path d="M -26 56 Q 0 44 26 56" fill="none" stroke="#111" strokeWidth={8} strokeLinecap="round" />
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
