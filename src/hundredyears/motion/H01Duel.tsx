import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { PP0, Plush, PlushPose } from './Plush';
import { C, clamp } from './theme';

// h01_duel (line 1, "116 साल तक दो देश लड़ते रहे"; the reference's 1.3–8.6 s): the English knight (St George) and the
// French knight (fleur-de-lis) duel on the Channel coast. Alternate sword swings at about 4 Hz, a lunge on every fourth
// swing, a bob, a clash spark at each contact. With `swoop` (a frame), armoured Joan flies in from the bottom-left on
// her banner with a glow and knocks both knights flying (the reference's 8.73–8.93 s). Transparent, 1080×1080, 60 fps.

const SW = 15; // frames per swing
const swing = (f: number, off: number) => {
  const t = ((f + off) % SW) / SW;
  return t < 0.35 ? interpolate(t, [0, 0.35], [0, 1], { easing: Easing.in(Easing.quad) }) : interpolate(t, [0.35, 1], [1, 0], { easing: Easing.out(Easing.quad) });
};

export const H01Duel: React.FC<{ swoop?: number }> = ({ swoop = -1 }) => {
  const f = useCurrentFrame();
  const se = swing(f, 0), sf = swing(f, SW / 2);
  const lunge = (k: number) => (Math.floor((f + k) / SW) % 4 === 3 ? Math.sin((((f + k) % SW) / SW) * Math.PI) * 40 : 0);
  const bob = (k: number) => Math.abs(Math.sin((f + k) / 7)) * 14;
  const hit = swoop >= 0 && f >= swoop + 8 ? interpolate(f, [swoop + 8, swoop + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  const en: PlushPose = { ...PP0, arms: 1, rx: 170 + se * 60, ry: -170 + se * 230, lx: -150, ly: 90, mouth: 'flat', brow: -0.8, look: 0.8, lean: 6 + se * 6, hop: bob(0) };
  const fr: PlushPose = { ...PP0, arms: 1, rx: 170 + sf * 60, ry: -170 + sf * 230, lx: -150, ly: 90, mouth: 'frown', brow: -0.8, look: 0.8, lean: 6 + sf * 6, hop: bob(5), visor: 1 };
  const contact = (k: number) => ((f + k) % SW) === Math.round(SW * 0.35);
  const sparks = [contact(0), contact(SW / 2)].some(Boolean) && hit === 0;
  // Joan's swoop: from the bottom-left to the centre in 8 frames with an overshoot
  const js = swoop >= 0 ? interpolate(f, [swoop, swoop + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) }) : 0;
  const jx = interpolate(js, [0, 1], [-200, 540]), jy = interpolate(js, [0, 1], [1500, 930]);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        <defs><filter id="d1g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={30} /></filter></defs>
        <g transform={`translate(${330 + lunge(0) - hit * 700} ${900 - hit * 420}) rotate(${-hit * 260}) scale(0.5)`}><Plush who="knightEN" pose={en} f={f} shield seed="en" /></g>
        <g transform={`translate(${750 - lunge(SW / 2) + hit * 700} ${900 - hit * 420}) rotate(${hit * 260}) scale(-0.5 0.5)`}><Plush who="knightFR" pose={fr} f={f} shield seed="fr" /></g>
        {sparks && Array.from({ length: 8 }).map((_, i) => {
          const a = random(`s${Math.floor(f / SW)}${i}`) * Math.PI * 2;
          return <path key={i} d={`M 540 ${720} l ${Math.cos(a) * 60} ${Math.sin(a) * 60}`} stroke="#FFE27A" strokeWidth={8} strokeLinecap="round" />;
        })}
        {swoop >= 0 && f >= swoop && (
          <g>
            <circle cx={jx} cy={jy - 300} r={260} fill="#FFF6D8" opacity={0.75} filter="url(#d1g)" />
            <g transform={`translate(${jx} ${jy}) scale(0.62) rotate(${(1 - js) * -20})`}>
              <Plush who="joanArmor" pose={{ ...PP0, mouth: 'grin', arms: 0, brow: -0.3 }} f={f} banner={1} seed="j" />
            </g>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
