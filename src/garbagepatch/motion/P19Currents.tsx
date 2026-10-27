import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp } from './theme';

// p19_currents (line 12, "समुंदर की धाराएँ इसे एक भँवर की तरह घुमाती रहती हैं…"; the reference's 0:48–0:52): flat,
// slightly see-through blue arrows on an oval round the patch (`c`, radii `rx`×`ry`, screen px) grow in one after
// another and travel round clockwise like the North Pacific gyre; a faint swirl line circles under them. At `burst`
// they turn and shoot outward in all directions, stretching and fading (the patch growing). Transparent, 1080×1920.
export const P19Currents: React.FC<{ c: [number, number]; rx?: number; ry?: number; n?: number; burst?: number }> = ({ c, rx = 380, ry = 300, n = 8, burst }) => {
  const f = useCurrentFrame();
  const b = burst !== undefined ? interpolate(f, [burst, burst + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  const arrow = 'M -40 -9 L 18 -9 L 18 -22 L 46 0 L 18 22 L 18 9 L -40 9 Z';
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <ellipse cx={c[0]} cy={c[1]} rx={rx * 0.92} ry={ry * 0.92} fill="none" stroke={C.current} strokeWidth={3} strokeDasharray="30 26" strokeDashoffset={-f * 2} opacity={0.35 * (1 - b)} />
        {Array.from({ length: n }, (_, i) => {
          const g = interpolate(f, [i * 5, i * 5 + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
          if (g <= 0) return null;
          const a = (i / n) * Math.PI * 2 + f * 0.012;
          const x = c[0] + Math.cos(a) * rx * (1 + b * 1.4), y = c[1] + Math.sin(a) * ry * (1 + b * 1.4);
          const tang = (Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx) * 180) / Math.PI;
          const rad = (Math.atan2(Math.sin(a) * ry, Math.cos(a) * rx) * 180) / Math.PI;
          const rot = tang + (rad - tang + (Math.abs(rad - tang) > 180 ? (rad > tang ? -360 : 360) : 0)) * b;
          return <path key={i} d={arrow} fill={C.current} stroke="#BFE6FF" strokeWidth={1.5} opacity={0.82 * (1 - b * b)} transform={`translate(${x} ${y}) rotate(${rot}) scale(${g * (1 + b * 0.6)}, ${g})`} style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.35))' }} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
