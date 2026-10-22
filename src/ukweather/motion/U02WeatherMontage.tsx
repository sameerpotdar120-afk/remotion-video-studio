import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { P0, Pose, Tourist } from './Tourist';
import { clamp, ramp } from './theme';

// u02_weather_montage (line 2, "सुबह तेज़ बारिश, दोपहर में घना कोहरा, शाम को निकलती हुई धूप, और उसके 10 मिनट बाद ओले";
// the reference's 4.2–9.7 s): one full-screen weather per word, with the tourist reacting. Frames: `rain`, `fog`, `sun`,
// `hail` (each starts its layer; the previous one fades in 10 frames). Rain = diagonal streaks and a cool grade; fog =
// lumpy grey clouds drifting across and a desaturated wash; sun = a white-yellow bloom from the top-right, a golden grade,
// he puts his sunglasses on and lowers the umbrella; hail = white balls falling and bouncing with splash rings.
// Transparent (the map shows through), 1080×1920, 60 fps. The tourist stands at (540, 1150).
export const RainLayer: React.FC<{ f: number; a: number; n?: number; angle?: number }> = ({ f, a, n = 90, angle = 16 }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
    {Array.from({ length: n }, (_, i) => {
      const x0 = random(`rx${i}`) * 1400 - 200, sp = 38 + random(`rs${i}`) * 26, len = 60 + random(`rl${i}`) * 80;
      const y = ((random(`ry${i}`) * 2200 + f * sp) % 2200) - 200;
      const dx = Math.tan((angle * Math.PI) / 180) * len;
      return <path key={i} d={`M ${x0 + (y * Math.tan((angle * Math.PI) / 180))} ${y} l ${-dx} ${-len}`} stroke="#E8F4FF" strokeWidth={3} opacity={0.55} strokeLinecap="round" />;
    })}
  </svg>
);
export const FogLayer: React.FC<{ f: number; a: number }> = ({ f, a }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
    <defs>
      <filter id="fogF" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.009" numOctaves={3} seed={9} /><feColorMatrix values="0 0 0 0 0.86  0 0 0 0 0.88  0 0 0 0 0.9  0 0 0 1.4 -0.35" /></filter>
    </defs>
    <rect x={-400 + ((f * 2.2) % 400)} y={0} width={1880} height={1920} filter="url(#fogF)" />
    <rect width={1080} height={1920} fill="#C9CED3" opacity={0.35} />
  </svg>
);
export const SunLayer: React.FC<{ a: number; f: number }> = ({ a, f }) => (
  <AbsoluteFill style={{ opacity: a }}>
    <AbsoluteFill style={{ background: 'rgba(255,200,40,0.28)', mixBlendMode: 'overlay' }} />
    <AbsoluteFill style={{ background: `radial-gradient(circle at 92% 6%, #ffffff 0, #FFF7C0 ${7 + Math.sin(f / 9)}%, rgba(255,214,80,0.55) 22%, rgba(255,200,40,0) 52%)`, mixBlendMode: 'screen' }} />
  </AbsoluteFill>
);
export const HailLayer: React.FC<{ f: number; a: number; ground?: number }> = ({ f, a, ground = 1280 }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
    {Array.from({ length: 46 }, (_, i) => {
      const x = random(`hx${i}`) * 1080, per = 50 + random(`hp${i}`) * 30, ph = random(`hf${i}`) * per;
      const t = ((f + ph) % per) / per;
      const gy = ground + random(`hg${i}`) * 600;
      const fall = Math.min(1, t / 0.6), bounce = t > 0.6 ? (t - 0.6) / 0.4 : 0;
      const y = fall < 1 ? -50 + (gy + 50) * fall * fall : gy - Math.sin(bounce * Math.PI) * 60;
      return (
        <g key={i}>
          <circle cx={x + bounce * 30} cy={y} r={9 + random(`hr${i}`) * 6} fill="#F4F8FF" stroke="#9DB7D0" strokeWidth={2} />
          {bounce > 0 && <ellipse cx={x} cy={gy + 8} rx={30 * bounce} ry={8 * bounce} fill="none" stroke="#fff" strokeWidth={3} opacity={1 - bounce} />}
        </g>
      );
    })}
  </svg>
);
export const U02WeatherMontage: React.FC<{ rain?: number; fog?: number; sun?: number; hail?: number }> = ({ rain = 0, fog = 70, sun = 140, hail = 220 }) => {
  const f = useCurrentFrame();
  const win = (a: number, b: number) => Math.min(ramp(f, a, a + 10), 1 - ramp(f, b, b + 10));
  const aR = win(rain, fog), aF = win(fog, sun), aS = win(sun, hail), aH = ramp(f, hail, hail + 10);
  const pose: Pose = f >= hail ? { ...P0, outfit: 'coat', umbrella: 'open', open: 1, mouth: 'oh', brow: 0.9, squash: 1 - 0.04 * Math.abs(Math.sin(f / 4)) }
    : f >= sun ? { ...P0, outfit: 'sun', umbrella: 'closed', mouth: 'grin', arm: 40 }
    : f >= fog ? { ...P0, outfit: 'coat', umbrella: 'open', open: 1, mouth: 'worried', brow: 0.6, tilt: Math.sin(f / 10) * 8 }
    : { ...P0, outfit: 'coat', umbrella: 'open', open: 1, mouth: 'frown', brow: 0.5, shiver: 0.6 };
  const swap = (k: number) => 1 - 0.12 * Math.max(0, 1 - Math.abs(f - k) / 6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'rgba(40,90,140,0.35)', mixBlendMode: 'multiply', opacity: Math.max(aR, aH) }} />
      <AbsoluteFill style={{ backdropFilter: 'saturate(0.4)', background: 'rgba(200,205,210,0.25)', opacity: aF }} />
      <SunLayer a={aS} f={f} />
      <RainLayer f={f} a={aR} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(540 1150) scale(${0.62 * swap(fog) * swap(sun) * swap(hail)})`}><Tourist f={f} pose={pose} /></g>
      </svg>
      <FogLayer f={f} a={aF} />
      <HailLayer f={f} a={aH} />
      {interpolate(f, [sun - 2, sun + 3, sun + 14], [0, 0.6, 0], clamp) > 0 && <AbsoluteFill style={{ background: '#FFF6C8', opacity: interpolate(f, [sun - 2, sun + 3, sun + 14], [0, 0.6, 0], { ...clamp, easing: Easing.out(Easing.quad) }) }} />}
    </AbsoluteFill>
  );
};
