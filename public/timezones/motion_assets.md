# Time zones: motion assets (4K, 60 fps)

Same setup as before: a Remotion 4 project (React 19). Every component imports only `react` and `remotion`; none of them uses a font or an outside file (all text, numbers and Hindi labels are added in my edit), so they render the same anywhere.
Put the files in `src/`, register them in `src/Root.tsx`, and run the render commands. Every command renders at `--scale=2`, so each file comes out at twice the size shown (4K detail: a full-screen one is 2160×3840), 60 fps, transparent WebM (VP9 with alpha). Send back every file in `out/`.

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
import { M01CircleArrows } from './M01CircleArrows';
import { M02AlarmClock } from './M02AlarmClock';
import { M03ClockBubble } from './M03ClockBubble';
import { M04Steam } from './M04Steam';
import { M05Question } from './M05Question';
import { M06Crack } from './M06Crack';
import { M07RedCross } from './M07RedCross';
import { M08Sunrise } from './M08Sunrise';
import { M09NightSweep } from './M09NightSweep';
import { M10WallClock } from './M10WallClock';
import { M11CommentBubble } from './M11CommentBubble';
import { M12Whip } from './M12Whip';
import { M13TeaLeaves } from './M13TeaLeaves';
import { M14PinPulse } from './M14PinPulse';
import { M15Zzz } from './M15Zzz';
import { M16Sparkle } from './M16Sparkle';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="m01-circle-arrows" component={M01CircleArrows} width={800} height={800} fps={60} durationInFrames={180} />
    <Composition id="m02-alarm-clock" component={M02AlarmClock} width={600} height={700} fps={60} durationInFrames={150} defaultProps={{ h: 10, m: 10 }} />
    <Composition id="m02-alarm-clock-10am" component={M02AlarmClock} width={600} height={700} fps={60} durationInFrames={150} defaultProps={{ h: 10, m: 0 }} />
    <Composition id="m03-clock-bubble-5" component={M03ClockBubble} width={700} height={560} fps={60} durationInFrames={180} defaultProps={{ h: 5, flip: false, tail: 'left' as const }} />
    <Composition id="m03-clock-bubble-6" component={M03ClockBubble} width={700} height={560} fps={60} durationInFrames={180} defaultProps={{ h: 5, flip: true, tail: 'right' as const }} />
    <Composition id="m04-steam" component={M04Steam} width={300} height={420} fps={60} durationInFrames={180} />
    <Composition id="m05-question" component={M05Question} width={400} height={520} fps={60} durationInFrames={120} />
    <Composition id="m06-crack" component={M06Crack} width={360} height={1600} fps={60} durationInFrames={90} />
    <Composition id="m07-red-cross" component={M07RedCross} width={520} height={520} fps={60} durationInFrames={90} />
    <Composition id="m08-sunrise" component={M08Sunrise} width={1000} height={1000} fps={60} durationInFrames={240} defaultProps={{ peek: false }} />
    <Composition id="m08-sun-peek" component={M08Sunrise} width={1000} height={1000} fps={60} durationInFrames={240} defaultProps={{ peek: true }} />
    <Composition id="m09-night-sweep" component={M09NightSweep} width={1080} height={1920} fps={60} durationInFrames={240} defaultProps={{ from: 'right' as const, cover: 0.75 }} />
    <Composition id="m10-clock-plus60" component={M10WallClock} width={600} height={600} fps={60} durationInFrames={180} defaultProps={{ h: 6, m: 0, add: 60, arc: '#3BE07A' }} />
    <Composition id="m10-clock-plus15" component={M10WallClock} width={600} height={600} fps={60} durationInFrames={180} defaultProps={{ h: 6, m: 0, add: 15, arc: '#FF4D6D' }} />
    <Composition id="m11-comment-bubble" component={M11CommentBubble} width={900} height={620} fps={60} durationInFrames={210} />
    <Composition id="m12-whip-left" component={M12Whip} width={1080} height={1920} fps={60} durationInFrames={30} defaultProps={{ dir: 'left' as const }} />
    <Composition id="m12-whip-right" component={M12Whip} width={1080} height={1920} fps={60} durationInFrames={30} defaultProps={{ dir: 'right' as const }} />
    <Composition id="m13-tea-leaves" component={M13TeaLeaves} width={1080} height={1920} fps={60} durationInFrames={300} />
    <Composition id="m14-pin-pulse" component={M14PinPulse} width={420} height={420} fps={60} durationInFrames={240} defaultProps={{ color: '#FF2B3A' }} />
    <Composition id="m15-zzz" component={M15Zzz} width={360} height={460} fps={60} durationInFrames={180} />
    <Composition id="m16-sparkle" component={M16Sparkle} width={640} height={640} fps={60} durationInFrames={72} defaultProps={{ color: '#FFE11A' }} />
  </>
);
```

**Render everything:**
```bash
npx remotion render src/index.ts m01-circle-arrows out/m01_circle_arrows.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m02-alarm-clock out/m02_alarm_clock.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m02-alarm-clock-10am out/m02_alarm_clock_10am.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m03-clock-bubble-5 out/m03_clock_bubble_5.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m03-clock-bubble-6 out/m03_clock_bubble_6.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m04-steam out/m04_steam.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m05-question out/m05_question.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m06-crack out/m06_crack.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m07-red-cross out/m07_red_cross.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m08-sunrise out/m08_sunrise.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m08-sun-peek out/m08_sun_peek.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m09-night-sweep out/m09_night_sweep.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m10-clock-plus60 out/m10_clock_plus60.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m10-clock-plus15 out/m10_clock_plus15.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m11-comment-bubble out/m11_comment_bubble.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m12-whip-left out/m12_whip_left.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m12-whip-right out/m12_whip_right.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m13-tea-leaves out/m13_tea_leaves.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m14-pin-pulse out/m14_pin_pulse.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m15-zzz out/m15_zzz.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m16-sparkle out/m16_sparkle.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m01_circle_arrows  (800×800 → 1600×1600 at scale 2, 60 fps, 180 frames = 3 s, transparent)

**src/M01CircleArrows.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m01_circle_arrows: a hand-drawn yellow circle scribbles on (a little more than one loop, slightly uneven), then six thick
// yellow arrows punch in from outside, one after another, and keep pulsing toward the centre. 800x800, 60 fps, 180 frames.
// Transparent. Matches the reference's "look so weird" call-out.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const Y = '#FFE11A';

// an uneven loop: radius wobbles a little, and the stroke runs about 1.15 turns so the ends overlap like a real pen
const loop = () => {
  const pts: string[] = [];
  for (let i = 0; i <= 140; i++) {
    const a = -Math.PI / 2 - 0.3 + (i / 140) * Math.PI * 2 * 1.15;
    const r = 250 + Math.sin(a * 3 + 0.6) * 9 + Math.sin(a * 5) * 5 + (i / 140) * 14;
    pts.push(`${i ? 'L' : 'M'} ${(400 + Math.cos(a) * r * 1.02).toFixed(1)} ${(400 + Math.sin(a) * r * 0.94).toFixed(1)}`);
  }
  return pts.join(' ');
};
const LOOP = loop();

const Arrow: React.FC<{ angle: number; start: number; f: number; i: number }> = ({ angle, start, f, i }) => {
  const k = interpolate(f, [start, start + 9], [0, 1], { ...c, easing: Easing.out(Easing.back(2.2)) });
  const pulse = f > start + 9 ? Math.sin((f - start - 9) / 60 * Math.PI * 2 * 1.6 + i) * 10 : 0;
  const dist = 395 - k * 60 + pulse;
  const wob = (random(`w${i}`) - 0.5) * 8;
  return (
    <g transform={`translate(400 400) rotate(${angle + wob}) translate(${dist} 0)`} opacity={k}>
      {/* the arrow points toward the centre (−x) */}
      <path d="M -62 0 L -14 -40 L -14 -16 L 52 -14 L 56 14 L -14 16 L -14 40 Z" fill={Y} stroke="#3a2a00" strokeWidth={5} strokeLinejoin="round"
        transform={`scale(${0.6 + 0.4 * k})`} style={{ filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.45))' }} />
    </g>
  );
};

export const M01CircleArrows: React.FC = () => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [0, 22], [0, 1], { ...c, easing: Easing.inOut(Easing.cubic) });
  const breathe = 1 + Math.sin(f / 60 * Math.PI * 2 * 0.8) * 0.015;
  const angles = [-140, -40, 20, 160, 210, 330];
  return (
    <AbsoluteFill>
      <svg width={800} height={800} viewBox="0 0 800 800">
        <g transform={`translate(400 400) scale(${breathe}) translate(-400 -400)`} opacity={draw > 0.01 ? 1 : 0}>
          <path d={LOOP} fill="none" stroke="#3a2a00" strokeOpacity={0.35} strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`}
            transform="translate(0 6)" />
          <path d={LOOP} fill="none" stroke={Y} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`}
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,225,26,0.6))' }} />
        </g>
        {angles.map((a, i) => <Arrow key={i} angle={a} start={18 + i * 3} f={f} i={i} />)}
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m01-circle-arrows out/m01_circle_arrows.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m02_alarm_clock, m02_alarm_clock_10am  (600×700 → 1200×1400 at scale 2, 60 fps, 150 frames = 2.5 s, transparent)

**src/M02AlarmClock.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// m02_alarm_clock: a cartoon twin-bell alarm clock springs in, its hands whirl round fast and slow down to land on a
// set time (props h, m), and it rattles as if ringing, with little shake lines. 600x700, 60 fps, 150 frames. Transparent.
// No numerals on the face (ticks only), so no fonts are needed.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M02AlarmClock: React.FC<{ h?: number; m?: number; body?: string }> = ({ h = 10, m = 0, body = '#E8343A' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 9, stiffness: 160, mass: 0.7 } });
  // the hands spin 3 extra turns, easing out onto the target time
  const spin = interpolate(f, [6, 78], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const target = (h % 12) * 60 + m;
  const minutes = target - 3 * 720 * (1 - spin);
  const minA = (minutes % 60) * 6, hourA = (minutes / 60) * 30;
  const ring = f > 70 && f < 130 ? Math.sin(f * 1.9) * 5 * interpolate(f, [70, 130], [1, 0], c) : 0;
  const lines = f > 70 && f < 130 ? interpolate(f, [70, 80, 120, 130], [0, 1, 1, 0], c) : 0;
  return (
    <AbsoluteFill>
      <svg width={600} height={700} viewBox="0 0 600 700">
        <defs>
          <radialGradient id="face" cx="45%" cy="40%" r="65%"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e9eef5" /></radialGradient>
          <linearGradient id="bodyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={body} /><stop offset="1" stopColor="#9c1a22" /></linearGradient>
        </defs>
        <g transform={`translate(300 380) scale(${pop}) rotate(${ring})`}>
          {/* shake lines */}
          {[-1, 1].map((s) => (
            <g key={s} opacity={lines} stroke="#fff" strokeWidth={10} strokeLinecap="round">
              <path d={`M ${s * 250} -150 l ${s * 40} -24`} /><path d={`M ${s * 262} -80 l ${s * 46} 0`} /><path d={`M ${s * 250} -10 l ${s * 40} 24`} />
            </g>
          ))}
          {/* legs */}
          <path d="M -120 160 L -165 235" stroke="#2b2b33" strokeWidth={22} strokeLinecap="round" />
          <path d="M 120 160 L 165 235" stroke="#2b2b33" strokeWidth={22} strokeLinecap="round" />
          {/* bells and hammer */}
          <g transform={`rotate(${ring * 2})`}>
            <path d="M -175 -170 A 85 85 0 0 1 -30 -255 Z" fill="url(#bodyg)" stroke="#5a0c12" strokeWidth={6} />
            <path d="M 175 -170 A 85 85 0 0 0 30 -255 Z" fill="url(#bodyg)" stroke="#5a0c12" strokeWidth={6} />
            <rect x={-8} y={-268} width={16} height={46} rx={6} fill="#2b2b33" />
          </g>
          {/* body and face */}
          <circle r={210} fill="url(#bodyg)" stroke="#5a0c12" strokeWidth={8} />
          <circle r={210} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={10} transform="translate(-6 -8) scale(0.94)" />
          <circle r={168} fill="url(#face)" stroke="#7a1a20" strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={-5} y={-156} width={10} height={i % 3 === 0 ? 30 : 18} rx={4} fill="#2b2b33" transform={`rotate(${i * 30})`} />
          ))}
          <rect x={-9} y={-100} width={18} height={112} rx={9} fill="#1f1f26" transform={`rotate(${hourA})`} />
          <rect x={-6} y={-140} width={12} height={152} rx={6} fill="#1f1f26" transform={`rotate(${minA})`} />
          <circle r={16} fill={body} stroke="#1f1f26" strokeWidth={5} />
          {/* glass shine */}
          <path d="M -120 -90 A 150 150 0 0 1 -20 -150" fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={14} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m02-alarm-clock out/m02_alarm_clock.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m02-alarm-clock-10am out/m02_alarm_clock_10am.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m03_clock_bubble_5, m03_clock_bubble_6  (700×560 → 1400×1120 at scale 2, 60 fps, 180 frames = 3 s, transparent)

**src/M03ClockBubble.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// m03_clock_bubble: a white speech bubble pops in with a springy overshoot; inside it a small clock shows a time. With
// flip on, the minute hand whips one full turn and the hour hand moves on one hour (5:00 → 6:00) and the bubble boings.
// Tail on the left or right. 700x560, 60 fps, 180 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M03ClockBubble: React.FC<{ h?: number; flip?: boolean; tail?: 'left' | 'right' }> = ({ h = 5, flip = false, tail = 'left' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 8, stiffness: 180, mass: 0.6 } });
  const turn = flip ? interpolate(f, [70, 100], [0, 1], { ...c, easing: Easing.inOut(Easing.cubic) }) : 0;
  const boing = flip && f > 100 ? Math.sin((f - 100) / 3) * 0.06 * Math.exp(-(f - 100) / 14) : 0;
  const idle = Math.sin(f / 60 * Math.PI * 2 * 0.7) * 6;
  const minA = turn * 360, hourA = (h % 12) * 30 + turn * 30;
  const sx = tail === 'left' ? 1 : -1;
  return (
    <AbsoluteFill>
      <svg width={700} height={560} viewBox="0 0 700 560">
        <g transform={`translate(350 ${270 + idle}) scale(${pop * (1 + boing)}) scale(${sx} 1)`} style={{ filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.4))' }}>
          {/* bubble with tail (tail drawn toward the bottom left; mirrored for the right) */}
          <path d="M -250 -170 Q -250 -215 -205 -215 L 205 -215 Q 250 -215 250 -170 L 250 120 Q 250 165 205 165 L -120 165 L -230 245 L -170 165 L -205 165 Q -250 165 -250 120 Z"
            fill="#ffffff" stroke="#1d2a3a" strokeWidth={9} strokeLinejoin="round" />
          <g transform={`scale(${sx} 1)`}>
            <circle cy={-25} r={140} fill="#fdf6e3" stroke="#1d2a3a" strokeWidth={10} />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={-5} y={-155} width={10} height={i % 3 === 0 ? 26 : 14} rx={4} fill="#1d2a3a" transform={`translate(0 -25) rotate(${i * 30}) translate(0 0)`} />
            ))}
            <g transform="translate(0 -25)">
              <rect x={-9} y={-78} width={18} height={90} rx={9} fill="#1d2a3a" transform={`rotate(${hourA})`} />
              <rect x={-6} y={-112} width={12} height={124} rx={6} fill="#E8343A" transform={`rotate(${minA})`} />
              <circle r={14} fill="#1d2a3a" />
            </g>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m03-clock-bubble-5 out/m03_clock_bubble_5.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m03-clock-bubble-6 out/m03_clock_bubble_6.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m04_steam  (300×420 → 600×840 at scale 2, 60 fps, 180 frames = 3 s, transparent)

**src/M04Steam.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

// m04_steam: three soft white steam wisps curl up from the bottom centre and fade, for a glass of chai. Loops cleanly
// every 180 frames. 300x420, 60 fps, 180 frames. Transparent.

const Wisp: React.FC<{ f: number; off: number; x: number }> = ({ f, off, x }) => {
  const p = ((f + off) % 180) / 180; // 0 → 1 over the loop
  const y = 400 - p * 330;
  const sway = Math.sin(p * Math.PI * 2 + off) * 26;
  const o = Math.sin(p * Math.PI) * 0.75;
  const w = 26 + p * 46;
  return (
    <path d={`M ${x} ${y + 60} C ${x - 30 + sway} ${y + 30}, ${x + 30 + sway} ${y}, ${x + sway} ${y - 40}`} fill="none" stroke="#ffffff"
      strokeOpacity={o} strokeWidth={w} strokeLinecap="round" style={{ filter: `blur(${10 + p * 10}px)` }} />
  );
};

export const M04Steam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={300} height={420} viewBox="0 0 300 420">
        <Wisp f={f} off={0} x={130} />
        <Wisp f={f} off={60} x={165} />
        <Wisp f={f} off={120} x={148} />
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m04-steam out/m04_steam.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m05_question  (400×520 → 800×1040 at scale 2, 60 fps, 120 frames = 2 s, transparent)

**src/M05Question.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// m05_question: a chunky yellow "?" (drawn as a shape, no font) drops in, squashes on landing, bounces twice and then
// keeps a small tilt-wobble. 400x520, 60 fps, 120 frames. Transparent.

export const M05Question: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: f, fps, config: { damping: 7, stiffness: 140, mass: 0.8 } });
  const y = (1 - drop) * -420;
  const squash = f > 10 && f < 30 ? 1 + Math.sin((f - 10) / 20 * Math.PI) * 0.12 : 1;
  const tilt = Math.sin(f / 60 * Math.PI * 2 * 0.9) * 7;
  return (
    <AbsoluteFill>
      <svg width={400} height={520} viewBox="0 0 400 520">
        <g transform={`translate(200 ${470 + y}) rotate(${tilt}) scale(${1 / squash} ${squash}) translate(-200 -470)`}
          style={{ filter: 'drop-shadow(0 12px 10px rgba(0,0,0,0.45))' }}>
          {/* hook of the question mark */}
          <path d="M 110 150 C 110 60, 290 50, 290 150 C 290 215, 210 225, 205 300 L 205 335" fill="none" stroke="#3a2a00" strokeWidth={88} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 110 150 C 110 60, 290 50, 290 150 C 290 215, 210 225, 205 300 L 205 335" fill="none" stroke="#FFE11A" strokeWidth={68} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 135 125 C 150 90, 200 82, 235 95" fill="none" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={14} strokeLinecap="round" />
          <circle cx={205} cy={430} r={46} fill="#3a2a00" />
          <circle cx={205} cy={430} r={36} fill="#FFE11A" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m05-question out/m05_question.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m06_crack  (360×1600 → 720×3200 at scale 2, 60 fps, 90 frames = 1.5 s, transparent)

**src/M06Crack.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m06_crack: a jagged vertical crack tears down from top to bottom with a white-hot core and an orange glow, chips and
// dust fly off both sides, then the glow cools to a thin dark seam. 360x1600, 60 fps, 90 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const PTS = Array.from({ length: 33 }, (_, i) => [180 + (i === 0 || i === 32 ? 0 : (random(`x${i}`) - 0.5) * 70), i * 50] as const);
const D = PTS.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y}`).join(' ');

export const M06Crack: React.FC = () => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [0, 18], [0, 1], { ...c, easing: Easing.in(Easing.quad) });
  const heat = interpolate(f, [16, 60], [1, 0], c);
  return (
    <AbsoluteFill>
      <svg width={360} height={1600} viewBox="0 0 360 1600" opacity={draw > 0.01 ? 1 : 0}>
        <path d={D} fill="none" stroke="#ff8a1f" strokeOpacity={0.7 * heat} strokeWidth={46} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`}
          style={{ filter: 'blur(14px)' }} />
        <path d={D} fill="none" stroke="#1a1208" strokeWidth={14} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} />
        <path d={D} fill="none" stroke="#fff6d8" strokeOpacity={heat} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} />
        {Array.from({ length: 40 }, (_, i) => {
          const t0 = (i / 40) * 18;
          const k = interpolate(f, [t0, t0 + 40], [0, 1], { ...c, easing: Easing.out(Easing.quad) });
          if (k <= 0 || k >= 1) return null;
          const side = i % 2 ? 1 : -1;
          const y0 = (i / 40) * 1600;
          const vx = side * (60 + random(`v${i}`) * 110), vy = -40 - random(`u${i}`) * 80;
          const x = 180 + vx * k, y = y0 + vy * k + 260 * k * k;
          const s = 4 + random(`s${i}`) * 9;
          return <rect key={i} x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={i % 3 ? '#d9c7a3' : '#ffb24a'} opacity={1 - k} transform={`rotate(${k * 300 * side} ${x} ${y})`} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m06-crack out/m06_crack.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m07_red_cross  (520×520 → 1040×1040 at scale 2, 60 fps, 90 frames = 1.5 s, transparent)

**src/M07RedCross.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m07_red_cross: a big brush-stroke red ✕ slashes on (two strokes), punches from 1.35× to 1×, shakes, and glows. Holds.
// 520x520, 60 fps, 90 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M07RedCross: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 7], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const b = interpolate(f, [5, 12], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const s = interpolate(f, [10, 22], [1.35, 1], { ...c, easing: Easing.out(Easing.back(3)) });
  const shake = f > 10 && f < 34 ? Math.sin(f * 2.3) * 8 * interpolate(f, [10, 34], [1, 0], c) : 0;
  const stroke = (d: string, k: number) => k < 0.01 ? null : (
    <>
      <path d={d} fill="none" stroke="#5a0008" strokeWidth={78} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} transform="translate(0 8)" />
      <path d={d} fill="none" stroke="#FF2A3A" strokeWidth={64} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`}
        style={{ filter: 'drop-shadow(0 0 18px rgba(255,42,58,0.75))' }} />
      <path d={d} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${k * 0.9} 1`} transform="translate(-6 -10)" />
    </>
  );
  return (
    <AbsoluteFill>
      <svg width={520} height={520} viewBox="0 0 520 520">
        <g transform={`translate(${260 + shake} 260) scale(${s}) translate(-260 -260)`}>
          {stroke('M 110 105 Q 260 250 410 415', a)}
          {stroke('M 415 110 Q 255 265 105 410', b)}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m07-red-cross out/m07_red_cross.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m08_sunrise, m08_sun_peek  (1000×1000 → 2000×2000 at scale 2, 60 fps, 240 frames = 4 s, transparent)

**src/M08Sunrise.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// m08_sunrise: a warm sun rises over a soft horizon glow with slowly turning rays and a light bloom. With peek on (for
// Kashgar), the sun stays below the horizon: only a faint cold glow pulses at the edge. 1000x1000, 60 fps, 240 frames.
// Transparent (the horizon itself is only light, no ground), so it sits on the map.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M08Sunrise: React.FC<{ peek?: boolean }> = ({ peek = false }) => {
  const f = useCurrentFrame();
  const rise = interpolate(f, [0, 120], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  const sunY = peek ? 640 + Math.sin(f / 60 * Math.PI) * 6 : 760 - rise * 300;
  const glow = peek ? 0.35 + Math.sin(f / 60 * Math.PI * 2 * 0.5) * 0.08 : interpolate(f, [0, 60, 240], [0.2, 0.9, 1], c);
  const rot = f * 0.25;
  const warm = peek ? '#9fb7ff' : '#FFB23E';
  return (
    <AbsoluteFill>
      <svg width={1000} height={1000} viewBox="0 0 1000 1000">
        <defs>
          <radialGradient id="bloom" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={peek ? '#cfe0ff' : '#FFF4C2'} stopOpacity={0.95} />
            <stop offset="0.35" stopColor={warm} stopOpacity={0.55} />
            <stop offset="1" stopColor={warm} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="hz" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={warm} stopOpacity={0} />
            <stop offset="0.5" stopColor={warm} stopOpacity={0.55} />
            <stop offset="1" stopColor={warm} stopOpacity={0} />
          </linearGradient>
          <clipPath id="sky"><rect x={0} y={0} width={1000} height={640} /></clipPath>
        </defs>
        <rect x={0} y={560} width={1000} height={160} fill="url(#hz)" opacity={glow} />
        <g clipPath="url(#sky)">
          <circle cx={500} cy={sunY} r={430} fill="url(#bloom)" opacity={glow} />
          {!peek && (
            <g transform={`translate(500 ${sunY}) rotate(${rot})`} opacity={0.55 * rise}>
              {Array.from({ length: 16 }, (_, i) => (
                <path key={i} d="M -18 -150 L 0 -470 L 18 -150 Z" fill="#FFE7A0" transform={`rotate(${i * 22.5})`} style={{ filter: 'blur(3px)' }} />
              ))}
            </g>
          )}
          {!peek && (
            <>
              <circle cx={500} cy={sunY} r={120} fill="#FFD24A" />
              <circle cx={500} cy={sunY} r={120} fill="none" stroke="#FFF6D0" strokeWidth={10} opacity={0.8} />
              <circle cx={470} cy={sunY - 30} r={60} fill="#FFF3B8" opacity={0.6} style={{ filter: 'blur(14px)' }} />
            </>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m08-sunrise out/m08_sunrise.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m08-sun-peek out/m08_sun_peek.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m09_night_sweep  (1080×1920 → 2160×3840 at scale 2, 60 fps, 240 frames = 4 s, transparent)

**src/M09NightSweep.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m09_night_sweep: night rolls across the frame like the line between day and night: a deep blue-black shade with a soft
// edge sweeps in from one side (prop from), and stars twinkle on in the dark part. Holds at the end. 1080x1920, 60 fps,
// 240 frames. Transparent where it is still day.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M09NightSweep: React.FC<{ from?: 'left' | 'right'; cover?: number }> = ({ from = 'right', cover = 0.75 }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 150], [0, 1], { ...c, easing: Easing.inOut(Easing.cubic) });
  const edge = 1080 * (from === 'right' ? 1 - cover * k : cover * k); // x of the soft edge
  const dark = from === 'right' ? { x0: edge - 220, x1: edge + 220 } : { x0: edge + 220, x1: edge - 220 };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="term" gradientUnits="userSpaceOnUse" x1={dark.x0} y1={0} x2={dark.x1} y2={0}>
            <stop offset="0" stopColor="#050b1e" stopOpacity={0} />
            <stop offset="0.5" stopColor="#081333" stopOpacity={0.55} />
            <stop offset="1" stopColor="#050b1e" stopOpacity={0.82} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1080} height={1920} fill="url(#term)" />
        {Array.from({ length: 70 }, (_, i) => {
          const x = random(`sx${i}`) * 1080, y = random(`sy${i}`) * 1920;
          const inDark = from === 'right' ? x > edge + 80 : x < edge - 80;
          if (!inDark) return null;
          const tw = 0.45 + 0.55 * Math.abs(Math.sin(f / 60 * Math.PI * (0.6 + random(`st${i}`)) + i));
          const r = 1.5 + random(`sr${i}`) * 2.5;
          return <circle key={i} cx={x} cy={y} r={r} fill="#eaf2ff" opacity={tw * interpolate(f, [40, 120], [0, 1], c)} style={{ filter: 'drop-shadow(0 0 4px #bcd4ff)' }} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m09-night-sweep out/m09_night_sweep.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m10_clock_plus60, m10_clock_plus15  (600×600 → 1200×1200 at scale 2, 60 fps, 180 frames = 3 s, transparent)

**src/M10WallClock.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// m10_wall_clock: a round wooden-rim wall clock pops in showing a start time, waits, then its minute hand sweeps forward
// by add minutes (60 for बागान टाइम, 15 for Nepal) with a springy overshoot and settle; a glowing arc marks the minutes
// gained. 600x600, 60 fps, 180 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M10WallClock: React.FC<{ h?: number; m?: number; add?: number; arc?: string }> = ({ h = 6, m = 0, add = 60, arc = '#3BE07A' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 10, stiffness: 170, mass: 0.6 } });
  const go = spring({ frame: f - 50, fps, config: { damping: 8, stiffness: 90, mass: 0.9 } });
  const mins = h * 60 + m + add * go;
  const minA = (mins % 60) * 6, hourA = ((mins / 60) % 12) * 30;
  const a0 = (m % 60) * 6, a1 = a0 + add * 6 * Math.min(1, go);
  const r = 168;
  const p = (a: number) => [Math.sin((a * Math.PI) / 180) * r, -Math.cos((a * Math.PI) / 180) * r];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  const tick = f > 50 && f < 110 ? interpolate(f, [50, 110], [1, 0], c) : 0;
  return (
    <AbsoluteFill>
      <svg width={600} height={600} viewBox="0 0 600 600">
        <defs>
          <radialGradient id="wface" cx="45%" cy="40%" r="70%"><stop offset="0" stopColor="#fffdf6" /><stop offset="1" stopColor="#efe6d2" /></radialGradient>
          <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a8693a" /><stop offset="1" stopColor="#5b3216" /></linearGradient>
        </defs>
        <g transform={`translate(300 300) scale(${pop}) rotate(${Math.sin(f * 1.7) * 2 * tick})`} style={{ filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.45))' }}>
          <circle r={250} fill="url(#rim)" stroke="#3b1f0c" strokeWidth={8} />
          <circle r={214} fill="url(#wface)" stroke="#3b1f0c" strokeWidth={6} />
          {add > 0 && go > 0.01 && (a1 - a0 >= 359.5
            ? <circle r={r} fill={arc} opacity={0.38} />
            : <path d={`M 0 0 L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`} fill={arc} opacity={0.38} />)}
          {Array.from({ length: 60 }, (_, i) => (
            <rect key={i} x={i % 5 ? -2.5 : -5} y={-204} width={i % 5 ? 5 : 10} height={i % 5 ? 12 : 26} rx={3} fill="#2b2016" transform={`rotate(${i * 6})`} />
          ))}
          <rect x={-10} y={-112} width={20} height={124} rx={10} fill="#1d150e" transform={`rotate(${hourA})`} />
          <rect x={-6} y={-178} width={12} height={194} rx={6} fill="#1d150e" transform={`rotate(${minA})`} />
          <circle r={18} fill="#c9302c" stroke="#1d150e" strokeWidth={5} />
          <path d="M -150 -100 A 180 180 0 0 1 -40 -175" fill="none" stroke="#fff" strokeOpacity={0.75} strokeWidth={14} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m10-clock-plus60 out/m10_clock_plus60.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m10-clock-plus15 out/m10_clock_plus15.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m11_comment_bubble  (900×620 → 1800×1240 at scale 2, 60 fps, 210 frames = 3.5 s, transparent)

**src/M11CommentBubble.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// m11_comment_bubble: a comment card pops up with two pill buttons, a green one with a tick on the left and a red one with
// a cross on the right (labels हाँ / ना are added in the edit), then a hand cursor slides in and taps the green one: the
// button presses down and a ripple spreads. 900x620, 60 fps, 210 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M11CommentBubble: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 9, stiffness: 160, mass: 0.7 } });
  const b1 = spring({ frame: f - 10, fps, config: { damping: 9, stiffness: 180 } });
  const b2 = spring({ frame: f - 16, fps, config: { damping: 9, stiffness: 180 } });
  const hand = spring({ frame: f - 60, fps, config: { damping: 14, stiffness: 90 } });
  const press = f > 100 && f < 112 ? Math.sin(((f - 100) / 12) * Math.PI) : 0;
  const ripple = interpolate(f, [104, 150], [0, 1], c);
  const float = Math.sin(f / 60 * Math.PI * 2 * 0.6) * 6;
  return (
    <AbsoluteFill>
      <svg width={900} height={620} viewBox="0 0 900 620">
        <g transform={`translate(450 ${300 + float}) scale(${pop}) translate(-450 -300)`} style={{ filter: 'drop-shadow(0 18px 20px rgba(0,0,0,0.45))' }}>
          <path d="M 90 70 Q 90 30 130 30 L 770 30 Q 810 30 810 70 L 810 400 Q 810 440 770 440 L 300 440 L 200 530 L 220 440 L 130 440 Q 90 440 90 400 Z" fill="#ffffff" stroke="#16202e" strokeWidth={9} strokeLinejoin="round" />
          {/* two grey lines stand in for the comment text above the buttons */}
          {[0, 1].map((i) => <rect key={i} x={150} y={80 + i * 46} width={i ? 380 : 560} height={22} rx={11} fill="#d7dde6" />)}
          <g transform={`translate(270 330) scale(${b1 * (1 - 0.08 * press)})`}>
            <rect x={-150} y={-60} width={300} height={120} rx={60} fill="#22C55E" stroke="#0d4a24" strokeWidth={7} />
            <path d="M -40 2 L -8 34 L 46 -30" fill="none" stroke="#fff" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
            <circle r={150 * ripple} fill="none" stroke="#22C55E" strokeWidth={10} opacity={1 - ripple} />
          </g>
          <g transform={`translate(630 330) scale(${b2})`}>
            <rect x={-150} y={-60} width={300} height={120} rx={60} fill="#EF4444" stroke="#5a1010" strokeWidth={7} />
            <path d="M -32 -32 L 32 32 M 32 -32 L -32 32" fill="none" stroke="#fff" strokeWidth={20} strokeLinecap="round" />
          </g>
        </g>
        {/* hand cursor */}
        <g transform={`translate(${900 - 560 * hand} ${640 - 300 * hand}) translate(0 ${press * 10})`} opacity={hand > 0.02 ? 1 : 0}>
          <path d="M 0 0 L 0 -70 Q 0 -86 16 -86 Q 32 -86 32 -70 L 32 -24 L 40 -28 Q 56 -34 62 -18 L 70 -22 Q 86 -26 90 -10 L 96 -12 Q 112 -14 112 4 L 112 60 Q 112 110 62 120 L 30 120 Q -4 116 -20 86 L -46 30 Q -54 12 -36 6 Q -20 2 -10 16 Z"
            fill="#ffffff" stroke="#16202e" strokeWidth={7} strokeLinejoin="round" transform="rotate(-18)" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m11-comment-bubble out/m11_comment_bubble.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m12_whip_left, m12_whip_right  (1080×1920 → 2160×3840 at scale 2, 60 fps, 30 frames = 0.5 s, transparent)

**src/M12Whip.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';

// m12_whip: a fast whip-pan transition overlay: bright horizontal speed streaks rush across the frame in the direction
// of travel with a short white flash in the middle. Lay it over the cut between two map moves. 1080x1920, 60 fps,
// 30 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const M12Whip: React.FC<{ dir?: 'left' | 'right' }> = ({ dir = 'left' }) => {
  const f = useCurrentFrame();
  const s = dir === 'left' ? -1 : 1;
  const flash = interpolate(f, [8, 14, 22], [0, 0.55, 0], c);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {Array.from({ length: 46 }, (_, i) => {
          const y = random(`y${i}`) * 1920;
          const len = 300 + random(`l${i}`) * 900;
          const t0 = random(`t${i}`) * 10;
          const k = interpolate(f, [t0, t0 + 16], [0, 1], c);
          if (k <= 0 || k >= 1) return null;
          const x = s > 0 ? -len + k * (1080 + len * 2) : 1080 + len - k * (1080 + len * 2);
          const h = 3 + random(`h${i}`) * 10;
          return <rect key={i} x={s > 0 ? x : x - len} y={y} width={len} height={h} rx={h / 2} fill="#ffffff" opacity={0.25 + random(`o${i}`) * 0.5}
            style={{ filter: `blur(${2 + random(`b${i}`) * 4}px)` }} />;
        })}
        <rect x={0} y={0} width={1080} height={1920} fill="#ffffff" opacity={flash} />
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m12-whip-left out/m12_whip_left.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
npx remotion render src/index.ts m12-whip-right out/m12_whip_right.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m13_tea_leaves  (1080×1920 → 2160×3840 at scale 2, 60 fps, 300 frames = 5 s, transparent)

**src/M13TeaLeaves.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

// m13_tea_leaves: fresh green tea leaves drift down and across the frame, turning and fluttering, at three depths (near
// leaves bigger, faster and softly blurred). Loops cleanly every 300 frames. 1080x1920, 60 fps, 300 frames. Transparent.

const L = 300;
const Leaf: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const depth = i % 3; // 0 far, 1 mid, 2 near
  const size = [34, 54, 86][depth];
  const speed = [1, 1, 2][depth];
  const p = ((f / L) * speed + random(`p${i}`)) % 1; // whole-number speeds, so frame 300 matches frame 0
  const x = random(`x${i}`) * 1180 - 50 + Math.sin(p * Math.PI * 4 + i) * 60 + p * 160;
  const y = -120 + p * 2160;
  const rot = random(`r${i}`) * 360 + p * 720 * (i % 2 ? 1 : -1);
  const flip = Math.cos(p * Math.PI * 6 + i);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip} 1)`} opacity={[0.55, 0.8, 0.95][depth]} style={{ filter: depth === 2 ? 'blur(2px)' : undefined }}>
      <path d={`M 0 ${-size} C ${size * 0.62} ${-size * 0.5}, ${size * 0.58} ${size * 0.5}, 0 ${size} C ${-size * 0.58} ${size * 0.5}, ${-size * 0.62} ${-size * 0.5}, 0 ${-size} Z`}
        fill={depth === 0 ? '#3f8f3a' : '#5cb848'} stroke="#24561f" strokeWidth={2} />
      <path d={`M 0 ${-size * 0.9} L 0 ${size * 0.95}`} stroke="#2f6e29" strokeWidth={2.5} />
      {[-0.45, -0.1, 0.25].map((t, k) => (
        <path key={k} d={`M 0 ${size * t} q ${size * 0.3} ${-size * 0.15} ${size * 0.42} ${-size * 0.32} M 0 ${size * t} q ${-size * 0.3} ${-size * 0.15} ${-size * 0.42} ${-size * 0.32}`}
          fill="none" stroke="#2f6e29" strokeWidth={1.6} />
      ))}
    </g>
  );
};

export const M13TeaLeaves: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {Array.from({ length: 30 }, (_, i) => <Leaf key={i} i={i} f={f} />)}
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m13-tea-leaves out/m13_tea_leaves.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m14_pin_pulse  (420×420 → 840×840 at scale 2, 60 fps, 240 frames = 4 s, transparent)

**src/M14PinPulse.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// m14_pin_pulse: the reference's place pin: a glowing dot drops in with a ring, then rings keep pulsing out from it
// (three, staggered). Colour by prop. Loops from frame 60 every 60 frames. 420x420, 60 fps, 240 frames. Transparent.

export const M14PinPulse: React.FC<{ color?: string }> = ({ color = '#FF2B3A' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 7, stiffness: 200, mass: 0.6 } });
  return (
    <AbsoluteFill>
      <svg width={420} height={420} viewBox="0 0 420 420">
        {[0, 20, 40].map((d) => {
          const p = (((f - d) % 60) + 60) % 60 / 60;
          return f >= d ? <circle key={d} cx={210} cy={210} r={30 + p * 170} fill="none" stroke={color} strokeWidth={10 * (1 - p) + 2} opacity={(1 - p) * 0.8} /> : null;
        })}
        <g transform={`translate(210 210) scale(${pop})`}>
          <circle r={58} fill={color} opacity={0.35} style={{ filter: 'blur(10px)' }} />
          <circle r={40} fill="#ffffff" />
          <circle r={28} fill={color} />
          <circle r={11} fill="#ffffff" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m14-pin-pulse out/m14_pin_pulse.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m15_zzz  (360×460 → 720×920 at scale 2, 60 fps, 180 frames = 3 s, transparent)

**src/M15Zzz.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

// m15_zzz: three cartoon "Z" shapes float up and to the right from the bottom left, growing and fading, for a sleeping
// character. Drawn as shapes (no font). Loops every 180 frames. 360x460, 60 fps, 180 frames. Transparent.

const Z: React.FC<{ s: number; o: number }> = ({ s, o }) => (
  <path d={`M ${-s} ${-s} L ${s} ${-s} L ${-s} ${s} L ${s} ${s}`} fill="none" stroke="#ffffff" strokeWidth={s * 0.42} strokeLinecap="round" strokeLinejoin="round" opacity={o}
    style={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))' }} />
);

export const M15Zzz: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={360} height={460} viewBox="0 0 360 460">
        {[0, 60, 120].map((d) => {
          const p = ((f + d) % 180) / 180;
          const x = 70 + p * 210 + Math.sin(p * Math.PI * 3) * 18;
          const y = 420 - p * 360;
          const o = Math.sin(p * Math.PI);
          return <g key={d} transform={`translate(${x} ${y}) rotate(${-12 + p * 20})`}><Z s={14 + p * 30} o={o} /></g>;
        })}
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m15-zzz out/m15_zzz.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```

---

## m16_sparkle  (640×640 → 1280×1280 at scale 2, 60 fps, 72 frames = 1.2 s, transparent)

**src/M16Sparkle.tsx**
```tsx
import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';

// m16_sparkle: a landing hit: a quick white flash ring plus a burst of four-point sparkles and small dots that fly out,
// twinkle and fade. Colour by prop. 640x640, 60 fps, 72 frames. Transparent.

const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const star = (r: number) => `M 0 ${-r} Q ${r * 0.18} ${-r * 0.18} ${r} 0 Q ${r * 0.18} ${r * 0.18} 0 ${r} Q ${-r * 0.18} ${r * 0.18} ${-r} 0 Q ${-r * 0.18} ${-r * 0.18} 0 ${-r} Z`;

export const M16Sparkle: React.FC<{ color?: string }> = ({ color = '#FFE11A' }) => {
  const f = useCurrentFrame();
  const ring = interpolate(f, [0, 22], [0, 1], { ...c, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <svg width={640} height={640} viewBox="0 0 640 640">
        <circle cx={320} cy={320} r={40 + ring * 230} fill="none" stroke="#ffffff" strokeWidth={18 * (1 - ring) + 1} opacity={1 - ring} />
        <circle cx={320} cy={320} r={90} fill={color} opacity={interpolate(f, [0, 4, 16], [0, 0.6, 0], c)} style={{ filter: 'blur(20px)' }} />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2 + random(`a${i}`) * 0.3;
          const d = 80 + random(`d${i}`) * 200;
          const k = interpolate(f, [0, 34 + random(`t${i}`) * 20], [0, 1], { ...c, easing: Easing.out(Easing.quad) });
          const tw = 0.6 + 0.4 * Math.sin(f / 3 + i);
          const r = (i % 3 ? 14 : 26) * (1 - k * 0.6);
          return (
            <g key={i} transform={`translate(${320 + Math.cos(a) * d * k} ${320 + Math.sin(a) * d * k}) rotate(${k * 90})`} opacity={(1 - k) * tw}>
              {i % 2 ? <path d={star(r)} fill={i % 4 === 1 ? '#ffffff' : color} /> : <circle r={r * 0.35} fill="#ffffff" />}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
```

**Render:**
```bash
npx remotion render src/index.ts m16-sparkle out/m16_sparkle.webm --codec=vp9 --pixel-format=yuva420p --image-format=png --scale=2
```
