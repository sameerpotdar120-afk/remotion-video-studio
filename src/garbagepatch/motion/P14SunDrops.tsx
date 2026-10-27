import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// p14_sun_drops (line 8, "फिर धूप और लहरें इसे तोड़-तोड़कर…"; the reference's 0:33–0:36): the creator's sun (gp08)
// slides in from the top-left corner (20 frames, back-ease), turning slowly, its glow throbbing and a warm light wash
// spreading over the frame; then water drops (gp09) fall one by one onto `targets` (screen px), stretching as they
// fall and bursting into a splash ring and spray where they land. `out` slides the sun away. Transparent, 1080×1920.
export const P14SunDrops: React.FC<{ sun: string; drop: string; targets: [number, number][]; dropFrom?: number; out?: number }> = ({ sun, drop, targets, dropFrom = 20, out }) => {
  const f = useCurrentFrame();
  const sIn = interpolate(f, [0, 20], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const sOut = out !== undefined ? interpolate(f, [out, out + 16], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  const p = sIn * (1 - sOut);
  const th = 0.8 + 0.2 * Math.sin(f / 9);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 15% 12%, rgba(255,214,90,${0.45 * p * th}), rgba(255,190,60,${0.12 * p}) 35%, transparent 65%)`, mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', left: -120 + 260 * p - 260, top: -120 + 260 * p - 260, width: 560, height: 560, transform: `rotate(${f * 0.4}deg) scale(${0.9 + 0.05 * th})`,
        filter: `drop-shadow(0 0 ${40 * th}px rgba(255,210,80,0.9))` }}>
        <Img src={sun} style={{ width: 560, height: 560, objectFit: 'contain' }} />
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', overflow: 'visible' }}>
        {targets.map(([x, y], i) => {
          const a = dropFrom + i * 9 + Math.floor(random(`d${i}`) * 6), land = a + 18, g = f - land;
          return g >= 0 && g < 40 ? (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={10 + g * 2.2} ry={(10 + g * 2.2) * 0.4} fill="none" stroke="#BFF0FF" strokeWidth={3} opacity={1 - g / 40} />
              {[0, 1, 2, 3, 4].map((k) => { const an = -Math.PI * (0.15 + 0.7 * k / 4), sp = 3.2; return <circle key={k} cx={x + Math.cos(an) * sp * g} cy={y + Math.sin(an) * sp * g + 0.09 * g * g} r={4} fill="#9FE6FF" opacity={1 - g / 30} />; })}
            </g>
          ) : null;
        })}
      </svg>
      {targets.map(([x, y], i) => {
        const a = dropFrom + i * 9 + Math.floor(random(`d${i}`) * 6), t = interpolate(f, [a, a + 18], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        if (t <= 0 || t >= 1) return null;
        return <Img key={i} src={drop} style={{ position: 'absolute', left: x - 22, top: y - 60 - (1 - t) * 500, width: 44, height: 64, objectFit: 'contain', transform: `scaleY(${1 + t * 0.5})`, filter: 'drop-shadow(0 0 8px rgba(120,220,255,0.8))' }} />;
      })}
    </AbsoluteFill>
  );
};
