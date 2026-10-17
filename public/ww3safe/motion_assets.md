# World War 3 safe countries: motion assets

Render each one in a fresh Remotion project (Remotion 4, React 19). Every component below is self-contained: it imports only `react` and `remotion`.
Put each file in `src/`, register all of them in `src/Root.tsx`, and run the render command under each one.

**Setup (once):**
```bash
npm init -y && npm i remotion@4.0.523 @remotion/cli@4.0.523 react@19.1.0 react-dom@19.1.0
mkdir -p src out
```

**src/index.ts**
```ts
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
```

**src/Root.tsx**
```tsx
import React from 'react';
import { Composition } from 'remotion';
import { M01TitleBanner } from './M01TitleBanner';
import { M02ImpactFlash } from './M02ImpactFlash';
import { M03Nuke } from './M03Nuke';
import { M04WarSplat } from './M04WarSplat';
import { M05AshFall } from './M05AshFall';
import { M06SpaceBg } from './M06SpaceBg';
import { M07Steam } from './M07Steam';
import { M08CommentBurst } from './M08CommentBurst';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="m01-title-banner" component={M01TitleBanner} width={1080} height={560} fps={60} durationInFrames={150} />
    <Composition id="m02-impact-flash" component={M02ImpactFlash} width={360} height={360} fps={60} durationInFrames={48} />
    <Composition id="m03-nuke" component={M03Nuke} width={700} height={1000} fps={60} durationInFrames={240} />
    <Composition id="m04-war-splat" component={M04WarSplat} width={420} height={420} fps={60} durationInFrames={240} />
    <Composition id="m05-ash-fall" component={M05AshFall} width={1080} height={1920} fps={60} durationInFrames={360} />
    <Composition id="m06-space-bg" component={M06SpaceBg} width={1080} height={1920} fps={60} durationInFrames={480} />
    <Composition id="m07-steam" component={M07Steam} width={600} height={900} fps={60} durationInFrames={240} />
    <Composition id="m08-comment-burst" component={M08CommentBurst} width={600} height={600} fps={60} durationInFrames={180} />
  </>
);
```

Transparent renders use WebM VP9 with alpha. Send back every file in `out/`.

---

## m01_title_banner  (1080×560, 60 fps, 150 frames = 2.5 s, transparent)

**src/M01TitleBanner.tsx**
```tsx
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, Easing, interpolate, useCurrentFrame } from 'remotion';

// m01_title_banner: black box title that slams in from the top-left (3x, -12deg) and settles level.
// 1080x560, 60 fps, 150 frames. Transparent.

const useBaloo = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&display=block';
    document.head.appendChild(css);
    css.onload = () => document.fonts.load('800 80px "Baloo 2"', 'कहाँ').then(() => continueRender(handle));
    css.onerror = () => continueRender(handle);
  }, [handle]);
};

export const M01TitleBanner: React.FC = () => {
  useBaloo();
  const f = useCurrentFrame();
  const slam = interpolate(f, [0, 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
  const settle = interpolate(f, [36, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const scale = interpolate(slam, [0, 1], [3, 1.1]) * interpolate(settle, [0, 1], [1, 1 / 1.1]);
  const rot = interpolate(slam, [0, 1], [-12, -4]) * (1 - settle);
  const x = interpolate(slam, [0, 1], [-520, 0]);
  const y = interpolate(slam, [0, 1], [-380, 0]);
  // fake motion blur: strongest while it is moving fast
  const speed = f < 36 ? (1 - slam) : 0;
  const blur = 10 * speed;
  // tiny landing bump and idle breathing
  const bump = f >= 30 && f < 44 ? Math.sin(((f - 30) / 14) * Math.PI) * 0.025 : 0;
  const breathe = f > 80 ? Math.sin((f - 80) / 22) * 0.006 : 0;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale + bump + breathe})`,
          filter: `blur(${blur}px) drop-shadow(0 14px 24px rgba(0,0,0,0.45))`,
          background: '#0b0b0d',
          padding: '14px 48px 6px',
          borderRadius: 10,
          fontFamily: '"Baloo 2", sans-serif',
          fontWeight: 800,
          fontSize: 104,
          lineHeight: 1.0,
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        <div style={{ color: '#ffffff' }}>WORLD WAR 3 में</div>
        <div style={{ color: '#ff4d6d' }}>SAFE कहाँ?</div>
      </div>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m01-title-banner out/m01_title_banner.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m02_impact_flash  (360×360, 60 fps, 48 frames = 0.8 s, transparent)

**src/M02ImpactFlash.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m02_impact_flash: missile hit. White-hot core, yellow bloom, thin shockwave ring.
// 360x360, 60 fps, 48 frames. Transparent.

export const M02ImpactFlash: React.FC = () => {
  const f = useCurrentFrame();
  const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const core = interpolate(f, [0, 4, 14, 26], [0, 1, 0.75, 0], c);
  const coreR = interpolate(f, [0, 4, 26], [6, 34, 22], c);
  const bloom = interpolate(f, [0, 6, 40], [0, 1, 0], { ...c, easing: Easing.out(Easing.quad) });
  const bloomR = interpolate(f, [0, 8, 44], [20, 120, 150], { ...c, easing: Easing.out(Easing.cubic) });
  const ringT = interpolate(f, [2, 34], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <svg width={360} height={360} viewBox="-180 -180 360 360">
        <defs>
          <radialGradient id="bl">
            <stop offset="0" stopColor="#fff9c4" stopOpacity={1} />
            <stop offset="0.35" stopColor="#ffe14a" stopOpacity={0.85} />
            <stop offset="1" stopColor="#ffb300" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="co">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#fffbe0" />
            <stop offset="1" stopColor="#fff3a0" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle r={bloomR} fill="url(#bl)" opacity={bloom} />
        <circle r={20 + 150 * ringT} fill="none" stroke="#fff6c0" strokeWidth={10 * (1 - ringT) + 1} opacity={(1 - ringT) * 0.9} />
        <circle r={coreR} fill="url(#co)" opacity={core} />
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m02-impact-flash out/m02_impact_flash.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m03_nuke  (700×1000, 60 fps, 240 frames = 4 s, transparent)

**src/M03Nuke.tsx**
```tsx
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
```

**Render:**
```bash
npx remotion render src/index.ts m03-nuke out/m03_nuke.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m04_war_splat  (420×420, 60 fps, 240 frames = 4 s, transparent)

**src/M04WarSplat.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m04_war_splat: black spiky burst that pops onto a country and keeps smoking, rotating slowly.
// 420x420, 60 fps, 240 frames. Transparent. The smoke loops after frame 60.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M04WarSplat: React.FC = () => {
  const f = useCurrentFrame();
  const pop = interpolate(f, [0, 8, 14], [0, 1.18, 1], { ...c, easing: Easing.out(Easing.quad) });
  const spikes = 30;
  let d = '';
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 70 + random(`s${i}`) * 55 : 26 + random(`s${i}`) * 10;
    d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1);
  }
  d += 'Z';
  const smoke = Array.from({ length: 14 }, (_, i) => {
    const period = 90;
    const t = ((f + i * (period / 14)) % period) / period;
    const on = f > 4 ? 1 : 0;
    return {
      x: (random(`px${i}`) - 0.5) * 60 + t * 40 * (random(`pd${i}`) - 0.3),
      y: -t * 170,
      r: 18 + t * 46,
      o: on * interpolate(t, [0, 0.15, 1], [0, 0.55, 0]),
    };
  });
  const flash = interpolate(f, [0, 3, 12], [0, 1, 0], c);
  return (
    <AbsoluteFill>
      <svg width={420} height={420} viewBox="-210 -230 420 420">
        <defs>
          <filter id="soft"><feGaussianBlur stdDeviation={7} /></filter>
          <radialGradient id="ember">
            <stop offset="0" stopColor="#ff9a3c" stopOpacity={0.9} />
            <stop offset="1" stopColor="#ff3d00" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle r={110} fill="url(#ember)" opacity={flash} />
        <g transform={`rotate(${f * 0.25}) scale(${pop})`}>
          <path d={d} fill="#0d0b0b" stroke="#2a201c" strokeWidth={3} />
          <circle r={30} fill="#1a1412" />
          <circle r={14} fill="#ff5a1f" opacity={0.35 + 0.25 * Math.sin(f / 6)} filter="url(#soft)" />
        </g>
        <g filter="url(#soft)">
          {smoke.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#6d6a68" opacity={s.o} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m04-war-splat out/m04_war_splat.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m05_ash_fall  (1080×1920, 60 fps, 360 frames = 6 s, transparent)

**src/M05AshFall.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

// m05_ash_fall: grey ash drifting down for the nuclear-winter shot. Seamless loop of 360 frames.
// 1080x1920, 60 fps, 360 frames. Transparent.

const N = 260, LOOP = 360;

export const M05AshFall: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs>
          <filter id="b1"><feGaussianBlur stdDeviation={1.2} /></filter>
          <filter id="b3"><feGaussianBlur stdDeviation={3.5} /></filter>
        </defs>
        {Array.from({ length: N }, (_, i) => {
          const depth = random(`d${i}`);
          const laps = 1 + Math.floor(depth * 2);
          const t = ((f / LOOP) * laps + random(`t${i}`)) % 1;
          const x0 = random(`x${i}`) * 1180 - 50;
          const sway = Math.sin(((f / LOOP) * Math.PI * 2) * (1 + Math.floor(random(`w${i}`) * 3)) + i) * (12 + depth * 30);
          const y = -40 + t * 2000;
          const r = 1.5 + depth * 5;
          const g = 150 + Math.floor(random(`g${i}`) * 90);
          return (
            <circle key={i} cx={x0 + sway + t * 60} cy={y} r={r} fill={`rgb(${g},${g},${g})`}
              opacity={0.35 + depth * 0.5} filter={depth > 0.75 ? 'url(#b3)' : 'url(#b1)'} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m05-ash-fall out/m05_ash_fall.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m06_space_bg  (1080×1920, 60 fps, 480 frames = 8 s, opaque)

**src/M06SpaceBg.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

// m06_space_bg: teal-green nebula with twinkling stars and slow drift, behind the globe. Opaque, seamless loop.
// 1080x1920, 60 fps, 480 frames. Render as MP4 (no alpha needed).

const LOOP = 480;

export const M06SpaceBg: React.FC = () => {
  const f = useCurrentFrame();
  const ph = (f / LOOP) * Math.PI * 2;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(120% 75% at 50% 20%, #12614f 0%, #0b3b3c 40%, #071d27 75%, #03080f 100%)' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        <defs>
          <filter id="neb" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0022 0.0035" numOctaves={4} seed={11} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.95  0 0 0 0 0.75  0 0 0 1.6 -0.75" />
            <feGaussianBlur stdDeviation={6} />
          </filter>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.6} />
          </radialGradient>
        </defs>
        <g transform={`translate(${Math.sin(ph) * 30},${Math.cos(ph) * 20}) scale(1.08)`} opacity={0.5}>
          <rect x={-60} y={-60} width={1200} height={2040} filter="url(#neb)" />
        </g>
        {Array.from({ length: 380 }, (_, i) => {
          const depth = random(`z${i}`);
          const x = random(`x${i}`) * 1080 + Math.sin(ph) * depth * 14;
          const y = random(`y${i}`) * 1920 + Math.cos(ph) * depth * 10;
          const tw = 0.55 + 0.45 * Math.sin(ph * (1 + Math.floor(random(`k${i}`) * 4)) + i);
          const r = 0.6 + depth * depth * 2.2;
          return <circle key={i} cx={x} cy={y} r={r} fill={random(`c${i}`) > 0.85 ? '#bff6ff' : '#ffffff'} opacity={(0.25 + depth * 0.75) * tw} />;
        })}
        <rect width={1080} height={1920} fill="url(#vig)" />
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m06-space-bg out/m06_space_bg.mp4 --codec=h264 --crf=16
```

---

## m07_steam  (600×900, 60 fps, 240 frames = 4 s, transparent)

**src/M07Steam.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';

// m07_steam: white geothermal steam rising from a vent at the bottom centre. Seamless loop.
// 600x900, 60 fps, 240 frames. Transparent.

const LOOP = 240, N = 26;

export const M07Steam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={600} height={900}>
        <defs>
          <filter id="st" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={40} />
            <feGaussianBlur stdDeviation={9} />
          </filter>
        </defs>
        <g filter="url(#st)">
          {Array.from({ length: N }, (_, i) => {
            const t = (f / LOOP + i / N) % 1;
            const lean = (random(`l${i}`) - 0.3) * 120;
            const x = 300 + lean * t * t + Math.sin(t * 5 + i * 1.7) * 60 * t;
            const y = 860 - t * 820;
            const r = 22 + t * 150 * (0.6 + random(`r${i}`) * 0.6);
            const o = interpolate(t, [0, 0.12, 0.6, 1], [0, 0.42, 0.2, 0]);
            return <circle key={i} cx={x} cy={y} r={r} fill="#f4f7f8" opacity={o} />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m07-steam out/m07_steam.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m08_comment_burst  (600×600, 60 fps, 180 frames = 3 s, transparent)

**src/M08CommentBurst.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m08_comment_burst: blue sparkle burst, then a white comment bubble with a "?" pops in with a wobble while
// red and blue confetti dashes fly out. The bubble then floats gently.
// 600x600, 60 fps, 180 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M08CommentBurst: React.FC = () => {
  const f = useCurrentFrame();
  const spark = interpolate(f, [0, 18], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const sparkO = interpolate(f, [0, 4, 18, 26], [0, 1, 1, 0], c);
  const pop = interpolate(f, [12, 22, 30], [0, 1.22, 1], { ...c, easing: Easing.out(Easing.quad) });
  const wob = f < 50 ? Math.sin((f - 12) / 3.2) * 12 * Math.exp(-(f - 12) / 14) * (f > 12 ? 1 : 0) : 0;
  const float = Math.sin(f / 24) * 6;
  const conf = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 + random(`a${i}`) * 0.3;
    const t = interpolate(f, [14, 60], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
    const dist = 120 + t * (110 + random(`d${i}`) * 80);
    return { a, x: Math.cos(a) * dist, y: Math.sin(a) * dist, o: interpolate(f, [14, 18, 50, 66], [0, 1, 1, 0], c), col: i % 2 ? '#ff2d55' : '#2f8cff' };
  });
  return (
    <AbsoluteFill>
      <svg width={600} height={600} viewBox="-300 -300 600 600">
        <g opacity={sparkO}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const r0 = 30 + spark * 80, r1 = 60 + spark * 150;
            return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1}
              stroke="#39b4ff" strokeWidth={10 * (1 - spark) + 3} strokeLinecap="round" />;
          })}
        </g>
        {conf.map((p, i) => (
          <line key={i} x1={p.x} y1={p.y} x2={p.x + Math.cos(p.a) * 22} y2={p.y + Math.sin(p.a) * 22}
            stroke={p.col} strokeWidth={9} strokeLinecap="round" opacity={p.o} />
        ))}
        <g transform={`translate(0 ${float}) rotate(${wob}) scale(${pop})`} style={{ filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.35))' }}>
          <path d="M-120,-95 Q-120,-125 -90,-125 L90,-125 Q120,-125 120,-95 L120,45 Q120,75 90,75 L-20,75 L-70,120 L-60,75 L-90,75 Q-120,75 -120,45 Z"
            fill="#ffffff" />
          <path d="M-28,-48 Q-28,-88 2,-88 Q34,-88 34,-56 Q34,-34 12,-24 Q2,-19 2,-4 L2,6" fill="none" stroke="#1d2a3a" strokeWidth={20}
            strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={2} cy={40} r={12} fill="#1d2a3a" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m08-comment-burst out/m08_comment_burst.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```
