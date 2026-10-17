# Chile: motion asset for the musket firing (m10)

Same project as the last batch. Add this file to `src/`, add the import and the `<Composition>` line to `src/Root.tsx`, render, and send back `out/m10_musket_fire.webm`. No new images are needed: the recoil reuses `c06_soldier_aim`.

**Add to src/Root.tsx:**
```tsx
import { M10MusketFire } from './M10MusketFire';
// inside <>…</>:
<Composition id="m10-musket-fire" component={M10MusketFire} width={700} height={500} fps={60} durationInFrames={120} />
```

---

## m10_musket_fire  (700×500, 60 fps, 120 frames = 2 s, transparent)

**src/M10MusketFire.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m10_musket_fire: one matchlock musket shot, seen from the side, the barrel pointing right. The muzzle is at the left
// edge, middle height (x 60, y 250). A hot white-orange flash and a short flame cone, sparks, then a big puff of grey
// gun smoke that billows forward and drifts up and away. 700x500, 60 fps, 120 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const MX = 60, MY = 250;

export const M10MusketFire: React.FC = () => {
  const f = useCurrentFrame();
  const flash = interpolate(f, [0, 2, 7], [0, 1, 0], c);
  const cone = interpolate(f, [0, 2, 9], [0, 1, 0], c);
  const ring = interpolate(f, [0, 14], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const puffs = Array.from({ length: 22 }, (_, i) => {
    const t0 = random(`t${i}`) * 6;
    const life = interpolate(f, [t0, t0 + 110], [0, 1], { ...c, easing: Easing.out(Easing.quad) });
    const dist = 40 + random(`d${i}`) * 380;
    const spread = (random(`s${i}`) - 0.5) * 120;
    return {
      x: MX + dist * life + 18,
      y: MY + spread * life - life * life * (70 + random(`u${i}`) * 90),
      r: (18 + random(`r${i}`) * 26) * (0.4 + life * 1.9),
      o: f < t0 ? 0 : interpolate(life, [0, 0.08, 0.6, 1], [0, 0.85, 0.5, 0]),
      g: 150 + Math.floor(random(`g${i}`) * 70),
    };
  });
  const sparks = Array.from({ length: 12 }, (_, i) => {
    const a = (random(`a${i}`) - 0.5) * 0.9;
    const v = 220 + random(`v${i}`) * 260;
    const p = interpolate(f, [0, 16], [0, 1], { ...c, easing: Easing.out(Easing.quad) });
    return { x: MX + Math.cos(a) * v * p, y: MY + Math.sin(a) * v * p + p * p * 40, o: interpolate(f, [0, 3, 16], [0, 1, 0], c) };
  });
  return (
    <AbsoluteFill>
      <svg width={700} height={500}>
        <defs>
          <filter id="smoke" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={3} seed={5} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={34} />
            <feGaussianBlur stdDeviation={5} />
          </filter>
          <radialGradient id="fl"><stop offset="0" stopColor="#fff" /><stop offset="0.35" stopColor="#fff2b0" /><stop offset="0.7" stopColor="#ff9a2a" stopOpacity={0.6} /><stop offset="1" stopColor="#ff6a00" stopOpacity={0} /></radialGradient>
        </defs>
        <g filter="url(#smoke)">
          {puffs.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={`rgb(${p.g},${p.g},${p.g - 6})`} opacity={p.o} />)}
        </g>
        <circle cx={MX + 30} cy={MY} r={40 + ring * 120} fill="none" stroke="#fff" strokeWidth={6 * (1 - ring)} opacity={(1 - ring) * 0.6} />
        <path d={`M ${MX} ${MY - 22} L ${MX + 230 * cone} ${MY} L ${MX} ${MY + 22} Z`} fill="#ffd36b" opacity={cone} style={{ filter: 'blur(3px)' }} />
        <circle cx={MX + 20} cy={MY} r={90} fill="url(#fl)" opacity={flash} />
        {sparks.map((s, i) => <circle key={`s${i}`} cx={s.x} cy={s.y} r={3.5} fill="#ffe08a" opacity={s.o} />)}
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m10-musket-fire out/m10_musket_fire.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```
