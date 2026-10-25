import React from 'react';
import { AbsoluteFill, Img, random, useCurrentFrame } from 'remotion';
import { C, pop, wobble } from './theme';

// g10_pops (line 6, Iceland settled in the hundred years after Flóki; the reference's Viking helmets popping up all
// over Iceland): at each point (screen px) a Viking helmet (gl08) springs up out of the ground one after another,
// `step` frames apart in a shuffled order, with a little squash on landing, a dust ring and a slow idle bob after.
// Without `src` a glowing pin marks each point instead. Transparent, 1080×1920, 60 fps.
export const G10Pops: React.FC<{ points: [number, number][]; src?: string; size?: number; step?: number }> = ({ points, src, size = 90, step = 4 }) => {
  const f = useCurrentFrame();
  const order = points.map((_, i) => i).sort((a, b) => random(`o${a}`) - random(`o${b}`));
  return (
    <AbsoluteFill>
      {points.map(([x, y], i) => {
        const at = order.indexOf(i) * step;
        const s = pop(f, at, at + 9, 3);
        if (s <= 0) return null;
        const sq = 1 - 0.18 * wobble(f, at + 7, 3, 8);
        const ring = Math.min(1, Math.max(0, (f - at - 6) / 16));
        const bob = Math.sin((f + i * 13) / 21) * 3;
        return (
          <React.Fragment key={i}>
            {ring > 0 && ring < 1 && <div style={{ position: 'absolute', left: x, top: y, width: size * (0.6 + 1.2 * ring), height: size * (0.25 + 0.4 * ring), borderRadius: '50%', border: `3px solid rgba(255,255,255,${0.8 * (1 - ring)})`, transform: 'translate(-50%,-50%)' }} />}
            <div style={{ position: 'absolute', left: x, top: y + bob, transform: `translate(-50%,-100%) scale(${s * (2 - sq)}, ${s * sq})`, transformOrigin: '50% 100%' }}>
              {src ? <Img src={src} style={{ width: size, height: size, objectFit: 'contain', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.45))' }} />
                : <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.red, border: '5px solid #fff', boxShadow: `0 0 16px ${C.red}, 0 4px 6px rgba(0,0,0,0.4)` }} />}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
