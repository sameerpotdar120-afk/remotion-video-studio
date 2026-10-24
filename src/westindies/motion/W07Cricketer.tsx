import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { C, clamp, wobble } from './theme';

// w07_cricketer (lines 1 and 5, the cricket West Indies; the reference's 0:28.7, Chris Gayle rising out of Jamaica,
// rebuilt with a fictional cricketer): a cricketer in plain maroon rises out of the island from below its line (the
// bottom is masked at y `ground`) in 20 frames with an overshoot, then at `raise` lifts the bat over his head (the
// wi02b arm pivots at the shoulder) with gold rays turning behind him and a burst of sparkles; he keeps a small
// celebratory bounce. Drawn stand-in until the creator's wi02/wi02b arrive. Transparent, 600×900, 60 fps; the shoulder
// pivot is at (380, 330).
export const W07Cricketer: React.FC<{ body?: string; arm?: string; raise?: number; ground?: number }> = ({ body, arm, raise = 26, ground = 820 }) => {
  const f = useCurrentFrame();
  const rise = interpolate(f, [0, 20], [1, 0], { ...clamp, easing: Easing.out(Easing.back(1.3)) });
  const up = interpolate(f, [raise, raise + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
  const ang = 110 - 150 * up + wobble(f, raise + 14, 2.6, 6) * 6;
  const bounce = f > raise + 14 ? Math.abs(Math.sin((f - raise) / 9)) * -8 : 0;
  const rays = interpolate(f, [raise, raise + 16], [0, 1], clamp);
  return (
    <AbsoluteFill>
      {rays > 0 && (
        <svg width={600} height={900} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: 0.6 * rays }}>
          {Array.from({ length: 12 }, (_, i) => <path key={i} d="M 300 360 L 900 330 L 900 390 Z" fill={C.goldGlow} opacity={0.35 + 0.25 * Math.sin(f / 8 + i)} transform={`rotate(${i * 30 + f * 0.6} 300 360)`} style={{ filter: 'blur(5px)' }} />)}
        </svg>
      )}
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 ${900 - ground}px 0)` }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${rise * 700 + bounce}px)` }}>
          {body ? <Img src={body} style={{ position: 'absolute', inset: 0, width: 600, height: 900, objectFit: 'contain' }} /> : (
            <svg width={600} height={900} style={{ position: 'absolute', inset: 0 }}>
              <rect x={235} y={560} width={56} height={290} rx={20} fill="#F4F2EC" /><rect x={309} y={560} width={56} height={290} rx={20} fill="#F4F2EC" />
              <path d="M 220 330 Q 300 300 380 330 L 400 580 L 200 580 Z" fill={C.maroon} />
              <path d="M 220 340 L 170 520" stroke={C.maroon} strokeWidth={46} strokeLinecap="round" />
              <circle cx={168} cy={530} r={22} fill="#F4F2EC" />
              <circle cx={300} cy={250} r={64} fill="#5A3A26" />
              <path d="M 232 250 A 70 70 0 0 1 368 250 L 372 232 A 74 74 0 0 0 228 232 Z" fill={C.maroon} />
              <path d="M 236 252 L 364 252 L 356 300 L 244 300 Z" fill="none" stroke="#C9CDD2" strokeWidth={5} />
              <path d="M 244 270 L 356 270 M 246 286 L 354 286" stroke="#C9CDD2" strokeWidth={3} />
            </svg>
          )}
          <div style={{ position: 'absolute', left: 380 - 60, top: 330 - 60, width: 360, height: 360, transformOrigin: '60px 60px', transform: `rotate(${ang}deg)` }}>
            {arm ? <Img src={arm} style={{ width: 360, height: 360, objectFit: 'contain' }} /> : (
              <svg width={360} height={360} style={{ overflow: 'visible' }}>
                <path d="M 60 60 L 190 60" stroke={C.maroon} strokeWidth={46} strokeLinecap="round" />
                <circle cx={200} cy={60} r={24} fill="#F4F2EC" />
                <rect x={210} y={50} width={60} height={18} rx={8} fill="#5A1A2E" />
                <path d="M 268 44 L 360 36 Q 372 59 360 82 L 268 74 Z" fill="#E8CF98" stroke="#8C6A2E" strokeWidth={3} />
              </svg>
            )}
          </div>
        </div>
      </div>
      {f >= raise + 10 && Array.from({ length: 16 }, (_, i) => {
        const t = interpolate(f, [raise + 10, raise + 50], [0, 1], clamp);
        const a = (i / 16) * Math.PI * 2 + random(`cs${i}`), d = 90 + 220 * t * (0.6 + random(`cd${i}`) * 0.5);
        return <div key={i} style={{ position: 'absolute', left: 300 + Math.cos(a) * d, top: 300 + Math.sin(a) * d * 0.8, width: 12, height: 12, background: C.goldGlow, transform: `rotate(45deg) scale(${1 - t})`, boxShadow: `0 0 10px ${C.gold}`, opacity: 1 - t }} />;
      })}
    </AbsoluteFill>
  );
};
