# Chile: motion assets

Same setup as last time: a Remotion 4 project (React 19). Each component below imports only `react` and `remotion`.
Put the files in `src/`, register them in `src/Root.tsx`, and run the render commands. `m02` needs `public/fonts/Mukta-Bold.ttf` (Google Fonts, OFL), the same file you used for the WW3 banner.

**Setup (once):**
```bash
npm init -y && npm i remotion@4.0.523 @remotion/cli@4.0.523 react@19.1.0 react-dom@19.1.0
mkdir -p src out public/fonts
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
import { M01ChiliLabel } from './M01ChiliLabel';
import { M02LongLetters } from './M02LongLetters';
import { M03ShipToEmoji } from './M03ShipToEmoji';
import { M04TalkingFlag } from './M04TalkingFlag';
import { M05MiniFlags } from './M05MiniFlags';
import { M06BoliviaFace } from './M06BoliviaFace';
import { M07Arrows } from './M07Arrows';
import { M08SendBurst } from './M08SendBurst';
import { M09Title1500 } from './M09Title1500';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="m01-chili-label" component={M01ChiliLabel} width={700} height={420} fps={60} durationInFrames={300} />
    <Composition id="m02-long-letters" component={M02LongLetters} width={500} height={1400} fps={60} durationInFrames={240} />
    <Composition id="m03-ship-to-emoji" component={M03ShipToEmoji} width={300} height={300} fps={60} durationInFrames={300} />
    <Composition id="m04-flag-talk" component={M04TalkingFlag} width={640} height={480} fps={60} durationInFrames={240} defaultProps={{ mood: 'talk' as const }} />
    <Composition id="m04-flag-shocked" component={M04TalkingFlag} width={640} height={480} fps={60} durationInFrames={240} defaultProps={{ mood: 'shocked' as const }} />
    <Composition id="m04-flag-south" component={M04TalkingFlag} width={640} height={480} fps={60} durationInFrames={240} defaultProps={{ mood: 'south' as const }} />
    <Composition id="m05-mini-flags" component={M05MiniFlags} width={500} height={400} fps={60} durationInFrames={120} />
    <Composition id="m06-bolivia-face" component={M06BoliviaFace} width={600} height={500} fps={60} durationInFrames={300} />
    <Composition id="m07-arrows-wider" component={M07Arrows} width={700} height={1000} fps={60} durationInFrames={150} defaultProps={{ kind: 'wider' as const }} />
    <Composition id="m07-arrows-longer" component={M07Arrows} width={700} height={1000} fps={60} durationInFrames={150} defaultProps={{ kind: 'longer' as const }} />
    <Composition id="m08-send-burst" component={M08SendBurst} width={500} height={500} fps={60} durationInFrames={180} />
    <Composition id="m09-title-1500" component={M09Title1500} width={1080} height={400} fps={60} durationInFrames={180} />
  </>
);
```

All renders are transparent WebM (VP9 with alpha). Send back every file in `out/`.

---

## m01_chili_label  (700×420, 60 fps, 300 frames = 5 s, transparent)

**src/M01ChiliLabel.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m01_chili_label: a hand-written "Chili" label with a curved arrow writes on; later the "i" is struck through in red
// and an "e" pops in above it ("Chili" → "Chile"). 700x420, 60 fps, 300 frames. Transparent.
// Font: any bold rounded/handwritten face; falls back to a heavy system sans.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const FONT = '"Kalam", "Comic Sans MS", "Arial Rounded MT Bold", sans-serif';

export const M01ChiliLabel: React.FC = () => {
  const f = useCurrentFrame();
  const letters = ['C', 'h', 'i', 'l', 'i'];
  const arrow = interpolate(f, [24, 44], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const strike = interpolate(f, [180, 192], [0, 1], { ...c, easing: Easing.out(Easing.quad) });
  const e = interpolate(f, [190, 200, 208], [0, 1.25, 1], { ...c, easing: Easing.out(Easing.quad) });
  const wob = f > 190 && f < 230 ? Math.sin((f - 190) / 2.5) * 8 * Math.exp(-(f - 190) / 12) : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 60, top: 190, transform: 'rotate(-18deg)', transformOrigin: '0 50%', fontFamily: FONT, fontWeight: 800, fontSize: 132,
        color: '#fff', letterSpacing: 2, textShadow: '0 6px 0 rgba(0,0,0,0.35), 0 10px 22px rgba(0,0,0,0.55)', WebkitTextStroke: '3px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>
        {letters.map((ch, i) => {
          const s = interpolate(f, [i * 4, i * 4 + 6, i * 4 + 10], [0, 1.2, 1], { ...c, easing: Easing.out(Easing.quad) });
          const last = i === letters.length - 1;
          return (
            <span key={i} style={{ display: 'inline-block', position: 'relative', transform: `scale(${s})`, transformOrigin: '50% 80%' }}>
              {ch}
              {last && (
                <>
                  <span style={{ position: 'absolute', left: -6, right: -6, top: '52%', height: 14, background: '#ff2a2a', borderRadius: 8, transformOrigin: '0 50%',
                    transform: `scaleX(${strike}) rotate(-12deg)`, boxShadow: '0 0 10px rgba(255,40,40,0.8)' }} />
                  <span style={{ position: 'absolute', left: '50%', top: -96, transform: `translateX(-50%) scale(${e}) rotate(${wob}deg)`, color: '#fff', fontSize: 104 }}>e</span>
                </>
              )}
            </span>
          );
        })}
      </div>
      <svg width={700} height={420} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d="M 250 340 C 300 400, 380 410, 450 370" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={`${arrow} 1`}
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
        {arrow > 0.95 && <path d="M 420 352 L 456 368 L 432 398" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m01-chili-label out/m01_chili_label.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m02_long_letters  (500×1400, 60 fps, 240 frames = 4 s, transparent)

**src/M02LongLetters.tsx**
```tsx
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';

// m02_long_letters: "लंबाऽऽऽऽऽ" (ऽ = the Hindi sign for a stretched vowel) letters pop one by one up a gentle arc, a thin white arc draws beside them, then the
// letters shrink to dots and fade. 500x1400, 60 fps, 240 frames. Transparent. (Place it along Chile and rotate.)

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
// Hindi font: put Mukta-Bold.ttf (Google Fonts, OFL) at public/fonts/Mukta-Bold.ttf, as in the last batch.
const useMukta = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const font = new FontFace('Mukta', `url(${staticFile('fonts/Mukta-Bold.ttf')})`, { weight: '700' });
    font.load().then((f) => { (document.fonts as unknown as { add: (x: FontFace) => void }).add(f); }).catch(() => undefined).finally(() => continueRender(handle));
  }, [handle]);
};

const PARTS = ['लं', 'बा', 'ऽ', 'ऽ', 'ऽ', 'ऽ', 'ऽ'];

export const M02LongLetters: React.FC = () => {
  useMukta();
  const f = useCurrentFrame();
  const arc = interpolate(f, [0, 70], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const out = interpolate(f, [170, 220], [0, 1], { ...c, easing: Easing.in(Easing.quad) });
  // points along a soft arc from bottom (y 1300) to top (y 100)
  const at = (u: number) => ({ x: 250 + Math.sin(u * Math.PI) * 90, y: 1300 - u * 1200 });
  return (
    <AbsoluteFill>
      <svg width={500} height={1400} style={{ position: 'absolute' }}>
        <path d={`M ${at(0).x + 110} ${at(0).y} Q ${at(0.5).x + 200} ${at(0.5).y} ${at(1).x + 110} ${at(1).y}`} fill="none" stroke="#fff" strokeWidth={6}
          strokeLinecap="round" pathLength={1} strokeDasharray={`${arc} 1`} opacity={1 - out} />
      </svg>
      {PARTS.map((p, i) => {
        const u = i / (PARTS.length - 1);
        const { x, y } = at(u);
        const t0 = 6 + i * 8;
        const s = interpolate(f, [t0, t0 + 7, t0 + 12], [0, 1.25, 1], { ...c, easing: Easing.out(Easing.quad) }) * (1 - out * 0.85);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(-90deg) scale(${s})`, opacity: 1 - out * out,
            fontFamily: '"Mukta", "Noto Sans Devanagari", sans-serif', fontWeight: 700, fontSize: 150, color: '#fff', whiteSpace: 'nowrap',
            textShadow: '0 6px 0 rgba(0,0,0,0.35), 0 10px 22px rgba(0,0,0,0.6)' }}>{p}</div>
        );
      })}
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m02-long-letters out/m02_long_letters.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m03_ship_to_emoji  (300×300, 60 fps, 300 frames = 5 s, transparent)

**src/M03ShipToEmoji.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m03_ship_to_emoji: a small galleon (drawn in code) bobs on the water, then at frame 120 pops into a smiling,
// waving face ("बातचीत"), which keeps smiling innocently. 300x300, 60 fps, 300 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M03ShipToEmoji: React.FC = () => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 9) * 6, tilt = Math.sin(f / 13) * 5;
  const shipOut = interpolate(f, [116, 124], [1, 0], c);
  const face = interpolate(f, [120, 130, 138], [0, 1.25, 1], { ...c, easing: Easing.out(Easing.quad) });
  const wave = Math.sin(f / 4) * 22;
  const blink = f % 150 > 140 ? 0.15 : 1;
  return (
    <AbsoluteFill>
      <svg width={300} height={300} viewBox="-150 -150 300 300">
        {shipOut > 0 && (
          <g transform={`translate(0 ${bob + 20}) rotate(${tilt}) scale(${shipOut})`}>
            <path d="M -95 10 L 95 10 L 70 52 L -78 52 Z" fill="#6b3f1f" stroke="#2d1a0c" strokeWidth={5} />
            <rect x={-70} y={18} width={140} height={8} fill="#c9a061" />
            {[-40, 15].map((x, i) => <line key={i} x1={x} y1={10} x2={x} y2={-110 + i * 15} stroke="#3a2412" strokeWidth={7} />)}
            {[-40, 15].map((x, i) => <path key={`s${i}`} d={`M ${x - 38} ${-95 + i * 15} Q ${x + 8} ${-70 + i * 15} ${x + 34} ${-95 + i * 15} L ${x + 30} ${-25} Q ${x} ${-12} ${x - 34} ${-25} Z`} fill="#f3ead6" stroke="#8a7a5a" strokeWidth={4} />)}
            <path d="M 15 -96 L 52 -86 L 15 -76 Z" fill="#c8102e" stroke="#7a0a1c" strokeWidth={3} />
            <path d="M -120 54 Q -60 44 0 54 T 120 54" fill="none" stroke="#bfe6ff" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
          </g>
        )}
        {face > 0 && (
          <g transform={`scale(${face})`}>
            <circle r={78} fill="#ffcc33" stroke="#e09a12" strokeWidth={6} />
            <ellipse cx={-26} cy={-16} rx={10} ry={14 * blink} fill="#3b2410" />
            <ellipse cx={26} cy={-16} rx={10} ry={14 * blink} fill="#3b2410" />
            <path d="M -40 18 Q 0 58 40 18" fill="none" stroke="#3b2410" strokeWidth={9} strokeLinecap="round" />
            <circle cx={-48} cy={14} r={11} fill="#ff8a65" opacity={0.6} /><circle cx={48} cy={14} r={11} fill="#ff8a65" opacity={0.6} />
            <g transform={`translate(78 20) rotate(${-30 + wave})`}>
              <rect x={-14} y={-60} width={28} height={60} rx={14} fill="#ffcc33" stroke="#e09a12" strokeWidth={5} />
            </g>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m03-ship-to-emoji out/m03_ship_to_emoji.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m04_flag_talk  (640×480, 60 fps, 240 frames = 4 s, transparent)

**src/M04TalkingFlag.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m04_flag_*: the Chile flag as a cartoon character (flag drawn in code: white band, red band, blue canton with a white
// star), waving cloth, eyes, brows, a talking mouth and one arm. 640x480, 60 fps, 240 frames. Transparent.
//   mood "talk":    marches right, points east, mouth talking ("चलो, देश बड़ा करते हैं!")
//   mood "shocked": stops dead, eyes wide, tiny "o" mouth, brows up ("अच्छा…")
//   mood "south":   looks down, small shrug, then hops downward ("…दक्षिण चलते हैं")

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
type Mood = 'talk' | 'shocked' | 'south';

const star = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.4 : r;
    return `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join('') + 'Z';

export const M04TalkingFlag: React.FC<{ mood: Mood }> = ({ mood }) => {
  const f = useCurrentFrame();
  const W = 300, H = 200;
  // cloth wave: each column offset by a sine
  const wave = (x: number) => Math.sin(x / 45 - f / 6) * 9 * (x / W);
  const cloth = (y0: number, y1: number) => {
    const top = Array.from({ length: 13 }, (_, i) => { const x = (i / 12) * W; return `${i ? 'L' : 'M'}${x},${y0 + wave(x)}`; }).join('');
    const bot = Array.from({ length: 13 }, (_, i) => { const x = W - (i / 12) * W; return `L${x},${y1 + wave(x)}`; }).join('');
    return top + bot + 'Z';
  };
  const walk = mood === 'talk' ? interpolate(f, [0, 240], [-60, 60], c) : 0;
  const hop = mood === 'talk' ? -Math.abs(Math.sin(f / 7)) * 14 : 0;
  const stop = mood === 'shocked' ? interpolate(f, [0, 6, 14], [1, 0.82, 1], c) : 1;
  const down = mood === 'south' ? interpolate(f, [120, 240], [0, 120], { ...c, easing: Easing.in(Easing.quad) }) : 0;
  const hopS = mood === 'south' && f > 120 ? -Math.abs(Math.sin(f / 7)) * 12 : 0;
  // face
  const look = mood === 'south' ? interpolate(f, [10, 40], [0, 1], c) : 0;
  const px = mood === 'talk' ? 8 : 0, py = look * 12 + (mood === 'shocked' ? -2 : 0);
  const eyeR = mood === 'shocked' ? 34 : 28;
  const blink = (f % 110) > 103 ? 0.12 : 1;
  const talk = mood === 'talk' ? Math.abs(Math.sin(f / 3.2)) : 0;
  const brow = mood === 'shocked' ? -16 : mood === 'south' ? -4 : 0;
  const shrug = mood === 'south' ? Math.sin(interpolate(f, [50, 100], [0, Math.PI], c)) * 18 : 0;
  const armA = mood === 'talk' ? -20 + Math.sin(f / 8) * 6 : mood === 'shocked' ? -70 : 40 - shrug;
  return (
    <AbsoluteFill>
      <svg width={640} height={480} viewBox="-170 -140 640 480">
        <g transform={`translate(${walk} ${hop + hopS + down}) scale(${stop}, ${2 - stop})`}>
          <line x1={-10} y1={-10} x2={-10} y2={260} stroke="#5b4636" strokeWidth={10} strokeLinecap="round" />
          <path d={cloth(0, 100)} fill="#ffffff" stroke="#1b1b1b" strokeWidth={5} />
          <path d={cloth(100, 200)} fill="#d52b1e" stroke="#1b1b1b" strokeWidth={5} />
          <path d={`M0,${wave(0)} L100,${wave(100)} L100,${100 + wave(100)} L0,${100 + wave(0)} Z`} fill="#0039a6" stroke="#1b1b1b" strokeWidth={5} />
          <path d={star(50, 50 + wave(50), 26)} fill="#fff" />
          {/* face on the white band */}
          {[150, 225].map((ex, i) => (
            <g key={i} transform={`translate(${ex} ${70 + wave(ex)})`}>
              <ellipse rx={eyeR} ry={eyeR * 1.12 * blink} fill="#fff" stroke="#1b1b1b" strokeWidth={5} />
              <circle cx={px} cy={py} r={eyeR * 0.42 * blink} fill="#1b1b1b" />
              <circle cx={px + 6} cy={py - 6} r={4} fill="#fff" />
              <line x1={-22} y1={-eyeR - 14 + brow + (i ? 0 : 0)} x2={22} y2={-eyeR - 18 + brow - (mood === 'shocked' ? 4 : 0)} stroke="#1b1b1b" strokeWidth={7} strokeLinecap="round" />
            </g>
          ))}
          <g transform={`translate(188 ${150 + wave(188)})`}>
            {mood === 'shocked' ? <ellipse rx={12} ry={16} fill="#3a0d0d" /> : (
              <path d={`M -28 0 Q 0 ${10 + talk * 26} 28 0 Q 0 ${4 + talk * 10} -28 0 Z`} fill="#3a0d0d" stroke="#1b1b1b" strokeWidth={4} />
            )}
          </g>
          {/* arm from the flag's right edge */}
          <g transform={`translate(${W + 4} ${110 + wave(W)}) rotate(${armA})`}>
            <path d="M0 0 Q 50 -10 90 -4" fill="none" stroke="#1b1b1b" strokeWidth={9} strokeLinecap="round" />
            <circle cx={96} cy={-4} r={14} fill="#fff" stroke="#1b1b1b" strokeWidth={5} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m04-flag-talk out/m04_flag_talk.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m04_flag_shocked  (640×480, 60 fps, 240 frames = 4 s, transparent)

Uses `src/M04TalkingFlag.tsx` from above.

**Render:**
```bash
npx remotion render src/index.ts m04-flag-shocked out/m04_flag_shocked.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m04_flag_south  (640×480, 60 fps, 240 frames = 4 s, transparent)

Uses `src/M04TalkingFlag.tsx` from above.

**Render:**
```bash
npx remotion render src/index.ts m04-flag-south out/m04_flag_south.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m05_mini_flags  (500×400, 60 fps, 120 frames = 2 s, transparent)

**src/M05MiniFlags.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

// m05_mini_flags: five small Chile flags (the followers) bobbing as they march. Seamless loop.
// 500x400, 60 fps, 120 frames. Transparent.

const Flag: React.FC<{ x: number; y: number; ph: number; f: number }> = ({ x, y, ph, f }) => {
  const bob = -Math.abs(Math.sin((f / 120) * Math.PI * 4 + ph)) * 10;
  const w = (k: number) => Math.sin(k / 18 - (f / 120) * Math.PI * 8 + ph) * 3;
  return (
    <g transform={`translate(${x} ${y + bob})`}>
      <line x1={-3} y1={-2} x2={-3} y2={70} stroke="#5b4636" strokeWidth={4} />
      <path d={`M0,${w(0)} L90,${w(90)} L90,${30 + w(90)} L0,${30 + w(0)}Z`} fill="#fff" stroke="#1b1b1b" strokeWidth={3} />
      <path d={`M0,${30 + w(0)} L90,${30 + w(90)} L90,${60 + w(90)} L0,${60 + w(0)}Z`} fill="#d52b1e" stroke="#1b1b1b" strokeWidth={3} />
      <rect x={0} y={w(0)} width={30} height={30} fill="#0039a6" stroke="#1b1b1b" strokeWidth={3} />
      <circle cx={15} cy={15 + w(15)} r={6} fill="#fff" />
    </g>
  );
};

export const M05MiniFlags: React.FC = () => {
  const f = useCurrentFrame();
  const pos = [[40, 40], [150, 10], [260, 60], [80, 200], [210, 230]];
  return (
    <AbsoluteFill>
      <svg width={500} height={400}>
        {pos.map(([x, y], i) => <Flag key={i} x={x} y={y} ph={i * 1.3} f={f} />)}
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m05-mini-flags out/m05_mini_flags.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m06_bolivia_face  (600×500, 60 fps, 300 frames = 5 s, transparent)

**src/M06BoliviaFace.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m06_bolivia_face: a cartoon face and arms to lay over Bolivia's shape: eyes look left, right, then at the camera;
// brows go from worried to annoyed; the arms open in a "where did it go?" shrug. 600x500, 60 fps, 300 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M06BoliviaFace: React.FC = () => {
  const f = useCurrentFrame();
  const pop = interpolate(f, [0, 8, 14], [0, 1.15, 1], { ...c, easing: Easing.out(Easing.quad) });
  const look = interpolate(f, [20, 40, 70, 90, 120, 135], [0, -1, -1, 1, 1, 0], c);
  const annoyed = interpolate(f, [150, 175], [0, 1], c);
  const shrug = interpolate(f, [40, 60], [0, 1], { ...c, easing: Easing.out(Easing.back(1.6)) });
  const blink = (f % 95) > 89 ? 0.12 : 1;
  const mouthO = interpolate(f, [150, 175], [1, 0], c);
  return (
    <AbsoluteFill>
      <svg width={600} height={500} viewBox="-300 -250 600 500">
        <g transform={`scale(${pop})`}>
          {/* arms: curved black lines with round hands, opening into a shrug */}
          {[-1, 1].map((s) => (
            <g key={s}>
              <path d={`M ${s * 70} 30 Q ${s * (130 + 60 * shrug)} ${60 - 70 * shrug} ${s * (170 + 70 * shrug)} ${-10 - 90 * shrug}`} fill="none" stroke="#111" strokeWidth={9} strokeLinecap="round" />
              <circle cx={s * (172 + 70 * shrug)} cy={-14 - 90 * shrug} r={14} fill="#fff" stroke="#111" strokeWidth={5} />
            </g>
          ))}
          {[-48, 48].map((ex, i) => (
            <g key={i} transform={`translate(${ex} -30)`}>
              <ellipse rx={36} ry={42 * blink} fill="#fff" stroke="#111" strokeWidth={6} />
              <circle cx={look * 14} cy={4} r={15 * blink} fill="#111" />
              <circle cx={look * 14 + 6} cy={-2} r={4} fill="#fff" />
              {/* brows: worried (inner up) → annoyed (inner down) */}
              <line x1={i ? -26 : 26} y1={-58 + (1 - annoyed) * -10 + annoyed * 12} x2={i ? 30 : -30} y2={-66 - (1 - annoyed) * 2 - annoyed * 4}
                stroke="#111" strokeWidth={8} strokeLinecap="round" />
            </g>
          ))}
          {mouthO > 0.5 ? <ellipse cx={0} cy={50} rx={12} ry={16} fill="#3a0d0d" /> : (
            <path d="M -26 56 Q 0 44 26 56" fill="none" stroke="#111" strokeWidth={8} strokeLinecap="round" />
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m06-bolivia-face out/m06_bolivia_face.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m07_arrows_wider  (700×1000, 60 fps, 150 frames = 2.5 s, transparent)

**src/M07Arrows.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m07_arrows_*: glowing arrows for "can't grow wider → grow longer". 700x1000, 60 fps, 150 frames. Transparent.
//   kind "wider":  a red double arrow pushes out sideways, bonks (shake) on invisible walls, a red ✕ pops, fades.
//   kind "longer": two green arrows stretch out north and south from the centre with a pulse.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Arrow: React.FC<{ len: number; color: string; glow: string }> = ({ len, color, glow }) => (
  <g style={{ filter: `drop-shadow(0 0 14px ${glow}) drop-shadow(0 0 4px ${glow})` }}>
    <line x1={0} y1={0} x2={len - 30} y2={0} stroke={color} strokeWidth={22} strokeLinecap="round" />
    <path d={`M ${len - 44} -34 L ${len} 0 L ${len - 44} 34 Z`} fill={color} />
  </g>
);

export const M07Arrows: React.FC<{ kind: 'wider' | 'longer' }> = ({ kind }) => {
  const f = useCurrentFrame();
  if (kind === 'wider') {
    const push = interpolate(f, [0, 18], [30, 150], { ...c, easing: Easing.out(Easing.cubic) });
    const bonk = f > 18 && f < 40 ? Math.sin((f - 18) * 1.6) * 10 * Math.exp(-(f - 18) / 8) : 0;
    const x = interpolate(f, [40, 50, 58], [0, 1.25, 1], c);
    const fade = interpolate(f, [110, 145], [1, 0], c);
    return (
      <AbsoluteFill style={{ opacity: fade }}>
        <svg width={700} height={1000} viewBox="-350 -500 700 1000">
          <g transform={`translate(${bonk} 0)`}><Arrow len={push} color="#fff" glow="#ff2a2a" /></g>
          <g transform={`translate(${-bonk} 0) rotate(180)`}><Arrow len={push} color="#fff" glow="#ff2a2a" /></g>
          <circle r={70} fill="#ff2a2a" opacity={0.25 * Math.max(0, 1 - Math.abs(f - 20) / 20)} />
          <g transform={`translate(0 -150) scale(${x})`} style={{ filter: 'drop-shadow(0 0 12px #ff2a2a)' }}>
            <line x1={-40} y1={-40} x2={40} y2={40} stroke="#ff2a2a" strokeWidth={20} strokeLinecap="round" />
            <line x1={40} y1={-40} x2={-40} y2={40} stroke="#ff2a2a" strokeWidth={20} strokeLinecap="round" />
          </g>
        </svg>
      </AbsoluteFill>
    );
  }
  const grow = interpolate(f, [0, 40], [40, 380], { ...c, easing: Easing.out(Easing.cubic) });
  const pulse = 1 + 0.06 * Math.sin(f / 5);
  const fade = interpolate(f, [120, 148], [1, 0], c);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={700} height={1000} viewBox="-350 -500 700 1000">
        <g transform={`rotate(-90) scale(${pulse})`}><Arrow len={grow} color="#eaffea" glow="#39ff5a" /></g>
        <g transform={`rotate(90) scale(${pulse})`}><Arrow len={grow} color="#eaffea" glow="#39ff5a" /></g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m07-arrows-wider out/m07_arrows_wider.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m07_arrows_longer  (700×1000, 60 fps, 150 frames = 2.5 s, transparent)

Uses `src/M07Arrows.tsx` from above.

**Render:**
```bash
npx remotion render src/index.ts m07-arrows-longer out/m07_arrows_longer.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m08_send_burst  (500×500, 60 fps, 180 frames = 3 s, transparent)

**src/M08SendBurst.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m08_send_burst: a white paper-plane "send" icon pops in, does a small swoop, with a ring of sparkles.
// 500x500, 60 fps, 180 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M08SendBurst: React.FC = () => {
  const f = useCurrentFrame();
  const pop = interpolate(f, [0, 10, 16], [0, 1.25, 1], { ...c, easing: Easing.out(Easing.quad) });
  const swoop = interpolate(f, [20, 50], [0, 1], { ...c, easing: Easing.inOut(Easing.cubic) });
  const x = Math.sin(swoop * Math.PI) * 50, y = -Math.sin(swoop * Math.PI * 2) * 24;
  const ring = interpolate(f, [0, 30], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const ringO = interpolate(f, [0, 6, 26, 40], [0, 1, 1, 0], c);
  const float = Math.sin(f / 20) * 6;
  return (
    <AbsoluteFill>
      <svg width={500} height={500} viewBox="-250 -250 500 500">
        <g opacity={ringO}>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2, r0 = 60 + ring * 60, r1 = 80 + ring * 110;
            return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke={i % 2 ? '#39b4ff' : '#ffd84a'} strokeWidth={9} strokeLinecap="round" />;
          })}
        </g>
        <g transform={`translate(${x} ${y + float}) rotate(${-12 + swoop * 10}) scale(${pop})`} style={{ filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.4))' }}>
          <path d="M -90 -10 L 100 -80 L 40 90 L 10 20 Z" fill="#ffffff" stroke="#1d2a3a" strokeWidth={8} strokeLinejoin="round" />
          <path d="M 10 20 L 100 -80" stroke="#1d2a3a" strokeWidth={8} strokeLinecap="round" />
          <path d="M 10 20 L 18 70 L 40 90" fill="#dfe8f2" stroke="#1d2a3a" strokeWidth={6} strokeLinejoin="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m08-send-burst out/m08_send_burst.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```

---

## m09_title_1500  (1080×400, 60 fps, 180 frames = 3 s, transparent)

**src/M09Title1500.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m09_title_1500: an old-map serif title "1500 AD" that starts huge (3×) and settles over the vintage map, ink colour,
// slight letter spacing, with a thin rule under it. 1080x400, 60 fps, 180 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M09Title1500: React.FC = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 30], [3, 1], { ...c, easing: Easing.out(Easing.exp) });
  const o = interpolate(f, [0, 6], [0, 1], c);
  const rule = interpolate(f, [24, 48], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${s})`, opacity: o, textAlign: 'center' }}>
        <div style={{ fontFamily: '"Cinzel", "Trajan Pro", Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: 150, letterSpacing: 14, color: '#f3ead6',
          textShadow: '0 4px 0 rgba(60,40,20,0.35), 0 8px 24px rgba(0,0,0,0.45)' }}>1500 AD</div>
        <div style={{ height: 6, width: 560, margin: '6px auto 0', background: '#f3ead6', transform: `scaleX(${rule})`, borderRadius: 3, opacity: 0.85 }} />
      </div>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m09-title-1500 out/m09_title_1500.webm --codec=vp9 --pixel-format=yuva420p --image-format=png
```
