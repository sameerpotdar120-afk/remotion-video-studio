import React from 'react';
import { AbsoluteFill, Img, random, useCurrentFrame } from 'remotion';
import { pop } from './theme';

// m16_boats (line 4, "settlers को जान बचाने के लिए समुंदर के पानी में उतरना पड़ा… 2 दिन तक अपनी boats पर"): the
// creator's settlers' boat (md08) at each point (screen px, offshore), popping in one after another, bobbing and
// rolling on the swell, each leaving slow ripple rings on the water and lit orange from the fire on the shore side.
// Transparent, 1080×1920, 60 fps.
export const M16Boats: React.FC<{ pts: [number, number][]; src: string; w?: number; step?: number }> = ({ pts, src, w = 200, step = 8 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {pts.map(([x, y], i) => {
        const s = pop(f, i * step, i * step + 12, 2);
        if (s <= 0) return null;
        const bob = Math.sin(f / 14 + i * 2) * 5, roll = Math.sin(f / 19 + i) * 3;
        const k = w * (0.85 + random(`b${i}`) * 0.3);
        return (
          <React.Fragment key={i}>
            <svg width={k * 2} height={k} style={{ position: 'absolute', left: x - k, top: y - k * 0.3, overflow: 'visible' }}>
              {[0, 1, 2].map((j) => { const t = ((f / 90 + j / 3 + i * 0.13) % 1); return <ellipse key={j} cx={k} cy={k * 0.3} rx={k * (0.35 + t * 0.7)} ry={k * (0.1 + t * 0.2)} fill="none" stroke="#BFE9FF" strokeWidth={2} opacity={0.5 * (1 - t) * s} />; })}
            </svg>
            <Img src={src} style={{ position: 'absolute', left: x - k / 2, top: y - k * 0.5 + bob, width: k, height: k * 0.56, objectFit: 'contain', transform: `rotate(${roll}deg) scale(${s})`,
              filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.5)) drop-shadow(-6px 0 12px rgba(255,120,40,0.45))' }} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
