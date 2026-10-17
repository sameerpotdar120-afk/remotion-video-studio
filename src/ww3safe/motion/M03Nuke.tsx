import React from 'react';
import { AbsoluteFill, Easing, interpolate, interpolateColors, random, useCurrentFrame } from 'remotion';

// m03_nuke: a mushroom cloud standing on the horizon. Flash, fireball bloom, rising cap on a stem, cooling from
// white-yellow to dark smoke, then drifting up and dissolving. Ground line = bottom centre of the frame.
// 700x1000, 60 fps, 240 frames. Transparent.

const W = 700, H = 1000, CX = W / 2, GY = H - 40;
const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const HEAT_IN = [0, 0.2, 0.4, 0.6, 0.8, 1];
const HEAT_OUT = ['#1c1411', '#45231a', '#a63c18', '#f2701c', '#ffc24a', '#fff8cf'];
const heatColor = (h: number) => interpolateColors(Math.max(0, Math.min(1, h)), HEAT_IN, HEAT_OUT);

type Puff = { x: number; y: number; r: number; h: number };

export const M03Nuke: React.FC = () => {
  const f = useCurrentFrame();
  const grow = interpolate(f, [4, 30], [0, 1], { ...c, easing: Easing.out(Easing.back(1.6)) });
  const capY = interpolate(f, [16, 130, 240], [GY - 40, GY - 560, GY - 640], { ...c, easing: Easing.out(Easing.cubic) });
  const capW = interpolate(f, [10, 140, 240], [60, 190, 230], { ...c, easing: Easing.out(Easing.cubic) });
  const cool = interpolate(f, [14, 170], [0, 1], { ...c, easing: Easing.in(Easing.quad) });
  const fade = interpolate(f, [150, 238], [1, 0], { ...c, easing: Easing.in(Easing.quad) });
  const spread = interpolate(f, [150, 240], [1, 1.35], c);

  const puffs: Puff[] = [];
  // stem: from the ground to the cap, thin at the top, wide at the base
  const stemTop = capY + capW * 0.35;
  const stemShow = interpolate(f, [20, 70], [0, 1], c);
  for (let i = 0; i < 44; i++) {
    const k = i / 43;
    const y = GY - k * (GY - stemTop) * stemShow;
    const w = interpolate(k, [0, 0.12, 0.85, 1], [80, 30, 34, 50]);
    puffs.push({
      x: CX + (random(`sx${i}`) - 0.5) * w * 1.1 + Math.sin(f / 30 + i) * 5,
      y,
      r: (w * (0.55 + random(`sr${i}`) * 0.4)) * grow * spread,
      h: 0.75 - k * 0.15 - cool * (0.95 - k * 0.2),
    });
  }
  // base ring: dust spreading along the ground
  const ringW = interpolate(f, [8, 120, 240], [40, 230, 270], { ...c, easing: Easing.out(Easing.cubic) });
  for (let i = 0; i < 34; i++) {
    const s = (random(`bs${i}`)) * 2 - 1;
    puffs.push({
      x: CX + s * ringW * (0.8 + random(`bx${i}`) * 0.3),
      y: GY - 6 - random(`by${i}`) * 46 * (1 - Math.abs(s) * 0.6),
      r: (26 + random(`br${i}`) * 30) * grow * spread * interpolate(Math.abs(s), [0, 1], [1.3, 0.6]),
      h: 0.45 - cool * 0.6 - Math.abs(s) * 0.2,
    });
  }
  // cap: puffs round a flattened torus, hotter inside
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2 + random(`ca${i}`) * 0.4;
    const rr = 0.6 + random(`cr${i}`) * 0.5;
    const front = Math.sin(a) > 0;
    puffs.push({
      x: CX + Math.cos(a) * capW * rr + Math.sin(f / 40 + i) * 3,
      y: capY + Math.sin(a) * capW * 0.42 * rr - (front ? 0 : 18),
      r: (capW * (0.26 + random(`cs${i}`) * 0.2)) * grow * spread,
      h: 0.9 - cool * (0.9 + random(`ch${i}`) * 0.25) + (front ? 0 : 0.05),
    });
  }
  // cap dome on top and the hot core
  for (let i = 0; i < 10; i++) {
    const a = Math.PI + (i / 9) * Math.PI;
    puffs.push({
      x: CX + Math.cos(a) * capW * 0.55,
      y: capY - capW * 0.25 + Math.sin(a) * capW * 0.38,
      r: capW * (0.36 + random(`dr${i}`) * 0.12) * grow * spread,
      h: 0.95 - cool * 1.05,
    });
  }
  for (let i = 0; i < 6; i++) {
    puffs.push({
      x: CX + (random(`kx${i}`) - 0.5) * capW * 0.7,
      y: capY + (random(`ky${i}`) - 0.5) * capW * 0.3,
      r: capW * 0.32 * grow * spread,
      h: 1.05 - cool * 1.3,
    });
  }

  const flash = interpolate(f, [0, 3, 14], [0, 1, 0], c);
  const flashR = interpolate(f, [0, 14], [30, 260], { ...c, easing: Easing.out(Easing.cubic) });
  const freq = 0.011 + 0.002 * Math.sin(f / 50);
  const glow = interpolate(f, [6, 20, 140], [0, 1, 0], c);

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={W} height={H}>
        <defs>
          <filter id="billow" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency={freq * 1.6} numOctaves={4} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={62} xChannelSelector="R" yChannelSelector="G" result="d" />
            <feGaussianBlur in="d" stdDeviation={interpolate(f, [0, 240], [2.5, 8], c)} result="b" />
            <feTurbulence type="fractalNoise" baseFrequency={0.045} numOctaves={3} seed={19} result="t" />
            <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 0.75" result="dark" />
            <feComposite in="dark" in2="b" operator="in" result="tex" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="tex" /></feMerge>
          </filter>
          <radialGradient id="shade" cx="0.35" cy="0.3" r="0.75">
            <stop offset="0" stopColor="#fff" stopOpacity={0.28} />
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.45} />
          </radialGradient>
          <radialGradient id="fl">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.4" stopColor="#fff6c8" stopOpacity={0.8} />
            <stop offset="1" stopColor="#ffd34a" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="gl">
            <stop offset="0" stopColor="#ffb547" stopOpacity={0.7} />
            <stop offset="1" stopColor="#ff6a00" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={CX} cy={capY} rx={capW * 2.2} ry={capW * 1.6} fill="url(#gl)" opacity={glow} />
        <g filter="url(#billow)">
          {puffs.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={Math.max(0.1, p.r)} fill={heatColor(p.h)} />
              <circle cx={p.x} cy={p.y} r={Math.max(0.1, p.r)} fill="url(#shade)" />
            </g>
          ))}
        </g>
        <circle cx={CX} cy={GY - 20} r={flashR} fill="url(#fl)" opacity={flash} />
      </svg>
    </AbsoluteFill>
  );
};
