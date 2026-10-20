import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { CanadaFlag, DenmarkFlag } from './Flags';
import { clamp, pop } from './theme';

// w18_montage (line 10, "ये सिलसिला सालों चलता रहा"; the reference shows old photo prints sliding by, 51.4–54.2 s): a
// year counter runs 1984 → 2022 while little flag stickers (alternating Canada, Denmark) and bottle stickers drop in and
// pile up, faster and faster, each swap flipping a small "turn" marker. Transparent, 1080×1080, 60 fps, 150 frames.
const Bottle: React.FC<{ dk: boolean }> = ({ dk }) => (
  <g>
    <path d="M -12 -70 H 12 V -40 Q 34 -28 34 -8 V 60 Q 34 66 28 66 H -28 Q -34 66 -34 60 V -8 Q -34 -28 -12 -40 Z" fill={dk ? '#16301E' : '#5A2A0A'} stroke="#fff" strokeWidth={6} />
    <rect x={-24} y={4} width={48} height={34} rx={4} fill={dk ? '#E9E1C8' : '#F2E0B8'} />
  </g>
);
export const W18Montage: React.FC<{ from?: number; to?: number; dur?: number }> = ({ from = 1984, to = 2022, dur = 130 }) => {
  useFonts();
  const f = useCurrentFrame();
  const yr = Math.round(interpolate(f, [0, dur], [from, to], { ...clamp, easing: Easing.in(Easing.quad) }));
  const items = Array.from({ length: 22 }, (_, i) => {
    const t = Math.pow(i / 22, 0.7) * dur;
    return { t, x: 140 + random(`mx${i}`) * 800, y: 520 + random(`my${i}`) * 420, r: (random(`mr${i}`) - 0.5) * 40, kind: i % 3, dk: i % 2 === 0 };
  });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        {items.map((it, i) => {
          const s = pop(f, it.t, it.t + 8, 2.2);
          if (s <= 0) return null;
          return (
            <g key={i} transform={`translate(${it.x} ${it.y - (1 - s) * 200}) rotate(${it.r}) scale(${s})`} style={{ filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.4))' }}>
              {it.kind === 2 ? <Bottle dk={it.dk} /> : (
                <g transform="translate(-75 -45)">
                  <rect x={-6} y={-6} width={162} height={102} fill="#fff" rx={6} />
                  {it.dk ? <DenmarkFlag w={150} h={90} /> : <CanadaFlag w={150} h={90} />}
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: NUM, fontSize: 220, color: '#F5F23A', textShadow: '0 10px 24px rgba(0,0,0,0.5)' }}>{yr}</div>
    </AbsoluteFill>
  );
};
