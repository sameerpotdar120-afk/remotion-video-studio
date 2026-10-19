import React from 'react';
import { AbsoluteFill, Easing, random, useCurrentFrame } from 'remotion';
import { ramp } from './theme';

// c12_lumpy_glow ("ऊपर से पहाड़, गहरे समुंदर और अंदर का uneven वज़न"; the reference's 46.2–50.6 s): a glowing yellow
// outline crawls once round the (squashed) globe's edge, starting at the top and running clockwise; the line is jagged
// and lumpy like a potato's silhouette and keeps wriggling once closed. Transparent, 1080×1080, 60 fps; ellipse centre
// (540, 540), radii `rx`, `ry` (match the squashed globe).
const N = 140;
export const C12LumpyGlow: React.FC<{ rx?: number; ry?: number; dur?: number }> = ({ rx = 350, ry = 260, dur = 70 }) => {
  const f = useCurrentFrame();
  const draw = ramp(f, 0, dur, Easing.inOut(Easing.cubic));
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = -Math.PI / 2 + t * Math.PI * 2;
    // a few slow lumps plus fine jitter, wriggling with time
    const lump = 0.06 * Math.sin(3 * a + 0.7) + 0.045 * Math.sin(5 * a + 2.1 + f / 40) + 0.03 * Math.sin(9 * a + f / 25);
    const jit = (random(`j${i}`) - 0.5) * 0.035;
    const k = 1 + lump + jit;
    pts.push(`${540 + Math.cos(a) * rx * k},${540 + Math.sin(a) * ry * k}`);
  }
  const shown = pts.slice(0, Math.max(2, Math.round(draw * N) + 1));
  const d = `M ${shown.join(' L ')}`;
  const head = shown[shown.length - 1].split(',').map(Number);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        <defs>
          <filter id="lg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14" /></filter>
        </defs>
        <path d={d} stroke="#FFC83D" strokeWidth={30} fill="none" filter="url(#lg)" opacity={0.85} strokeLinejoin="round" />
        <path d={d} stroke="#FFE27A" strokeWidth={10} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d={d} stroke="#FFFBEA" strokeWidth={3} fill="none" strokeLinejoin="round" />
        {draw < 1 && <circle cx={head[0]} cy={head[1]} r={18} fill="#FFFBEA" filter="url(#lg)" />}
      </svg>
    </AbsoluteFill>
  );
};
