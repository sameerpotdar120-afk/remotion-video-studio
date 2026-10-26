import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { C, inOut, ramp } from './theme';

// m14_trade (line 5, "Madeira पूरे Europe के लिए चीनी उगाने लगा"; line 6, the trade moving to Brazil): glowing arcs
// shoot out from `from` (Madeira, screen px) to each target (Europe's ports), one after another, each with the
// creator's sugar loaf (md07) riding its tip and a dashed shimmer running along it once it lands; a pulse ring at
// each arrival. `color` gold for the boom; pass the Brazil target alone for the move. Transparent, 1080×1920, 60 fps.
export const M14Trade: React.FC<{ from: [number, number]; to: [number, number][]; icon?: string; color?: string; step?: number; dur?: number; lift?: number }> = ({
  from, to, icon, color = C.gold, step = 8, dur = 36, lift = 0.35,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {to.map(([x, y], i) => {
          const p = ramp(f, i * step, i * step + dur, inOut);
          if (p <= 0) return null;
          const mx = (from[0] + x) / 2, my = (from[1] + y) / 2 - Math.hypot(x - from[0], y - from[1]) * lift;
          const d = `M ${from[0]} ${from[1]} Q ${mx} ${my} ${x} ${y}`;
          const ring = (f - i * step - dur) / 30;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={color} strokeWidth={10} strokeOpacity={0.3} pathLength={1} strokeDasharray={`${p} 2`} style={{ filter: 'blur(5px)' }} />
              <path d={d} fill="none" stroke={color} strokeWidth={3.5} pathLength={1} strokeDasharray={`${p} 2`} strokeLinecap="round" />
              {p >= 1 && <path d={d} fill="none" stroke="#fff" strokeWidth={2.5} pathLength={1} strokeDasharray="0.03 0.07" strokeDashoffset={-f * 0.004} opacity={0.8} />}
              {ring > 0 && ring < 1 && <circle cx={x} cy={y} r={10 + ring * 40} fill="none" stroke={color} strokeWidth={3} opacity={1 - ring} />}
              {p >= 1 && <circle cx={x} cy={y} r={7} fill={color} stroke="#fff" strokeWidth={2} />}
            </g>
          );
        })}
      </svg>
      {icon && to.map(([x, y], i) => {
        const p = ramp(f, i * step, i * step + dur, inOut);
        if (p <= 0 || p >= 1) return null;
        const mx = (from[0] + x) / 2, my = (from[1] + y) / 2 - Math.hypot(x - from[0], y - from[1]) * lift;
        const qx = (1 - p) ** 2 * from[0] + 2 * (1 - p) * p * mx + p * p * x, qy = (1 - p) ** 2 * from[1] + 2 * (1 - p) * p * my + p * p * y;
        return <Img key={`i${i}`} src={icon} style={{ position: 'absolute', left: qx - 30, top: qy - 50, width: 60, height: 60, objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />;
      })}
    </AbsoluteFill>
  );
};
