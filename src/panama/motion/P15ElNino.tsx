import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ramp } from './theme';

// p15_el_nino (line 5–6 context and the drought cause; the reference's 42.2–44 s "El Niño"): a warm sea-surface band
// (deep red core, orange-pink edges) spreads east to west along the equator over the map, its edge ragged and its
// inside churning (animated turbulence shifting every frame), with a slow breathing glow. Transparent overlay,
// 1080×1920, 60 fps; the band centred at y = `y`, `h` tall.
export const P15ElNino: React.FC<{ y?: number; h?: number }> = ({ y = 1100, h = 420 }) => {
  const f = useCurrentFrame();
  const k = ramp(f, 0, 50);
  const glow = 0.85 + 0.15 * Math.sin(f / 15);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs>
          <filter id="enT" x="-20%" y="-50%" width="140%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.03" numOctaves={3} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={120} xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation={10} />
          </filter>
          <linearGradient id="enG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FF7A6A" stopOpacity={0} />
            <stop offset="0.3" stopColor="#FF4A3D" stopOpacity={0.75} />
            <stop offset="0.5" stopColor="#F2343A" stopOpacity={0.92} />
            <stop offset="0.7" stopColor="#FF4A3D" stopOpacity={0.75} />
            <stop offset="1" stopColor="#FF7A6A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <g filter="url(#enT)" opacity={0.85 * glow}>
          <rect x={1080 - 1300 * k} y={y - h / 2 + Math.sin(f / 30) * 12} width={1300 * k + 200} height={h} fill="url(#enG)" transform={`translate(${Math.sin(f / 17) * 20} 0)`} />
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={i} cx={1080 - (((f * 1.4 + i * 190) % 1300))} cy={y + Math.sin(f / 20 + i) * h * 0.2} rx={120} ry={40} fill="#C81E28" opacity={0.45 * k} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
