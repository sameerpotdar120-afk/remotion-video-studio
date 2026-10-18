import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Chibi, POSE0, Pose } from './Chibi';
import { clamp } from './theme';

// t13_soldiers (line 4, "तीन जंगों के बाद उसने Burma ले लिया"): chibi British redcoats in a firing line on the left, Burmese
// soldiers with spears on the right, over the battlefield background (t02_battlefield_bg). The redcoats fire three volleys
// (muzzle flash, smoke puff, recoil) for the three wars; the Burmese line braces and flinches. Cartoon, no blood.
// Transparent, 1080x1920, 60 fps, 240 frames.

const VOLLEYS = [40, 110, 180];
const RED: [number, number, number][] = [[90, 1520, 0.3], [240, 1550, 0.32], [140, 1700, 0.37], [300, 1740, 0.39]];
const BUR: [number, number, number][] = [[800, 1530, 0.3], [960, 1560, 0.32], [760, 1710, 0.37], [930, 1750, 0.39]];

export const T13Soldiers: React.FC = () => {
  const f = useCurrentFrame();
  const since = Math.min(...VOLLEYS.map((v) => (f >= v ? f - v : 999)));
  const recoil = since < 20 ? Math.exp(-since / 5) * 30 : 0;
  const flash = since < 8 ? 1 - since / 8 : 0;
  const aim: Pose = { ...POSE0, stick: 1, stickA: -4, nx: 160, ny: -10, fx: 300, fy: 10, fb: 1, face: 'angry', brow: -0.7, squint: 0.4, lookX: 1, turn: 0.6 };
  const brace: Pose = { ...POSE0, stick: 1, stickA: -35, nx: 150, ny: -60, nb: -1, fx: 230, fy: -20, fb: 1, face: since < 30 ? 'oh' : 'angry', brow: since < 30 ? 0.8 : -0.6, lookX: 1, turn: 0.55 };
  const row = (list: [number, number, number][], outfit: 'redcoat' | 'burmese', p: Pose, mirror: boolean) =>
    [...list].sort((a, b) => a[1] - b[1]).map(([x, y, k], i) => {
      const step = Math.sin(f / 9 + i * 1.7) * 6;
      const pose = outfit === 'redcoat' ? { ...p, dx: -recoil, hop: Math.max(0, step) } : { ...p, hop: Math.abs(step) * 2, lean: since < 20 ? -10 : 4 };
      return (
        <g key={`${outfit}${i}`} transform={`translate(${x} ${y}) scale(${mirror ? -k : k} ${k})`}>
          <Chibi outfit={outfit} pose={pose} f={f + i * 37} seed={`${outfit}${i}`} />
          {outfit === 'redcoat' && flash > 0 && (
            <g transform={`translate(${118 + 160 + 520 - recoil} ${-480})`} opacity={flash}>
              <path d="M 0 -60 L 30 -16 L 90 0 L 30 16 L 0 60 L -10 14 L -40 0 L -10 -14 Z" fill="#FFE27A" stroke="#FF8A1F" strokeWidth={8} transform={`scale(${1 + (1 - flash) * 0.5})`} />
            </g>
          )}
          {outfit === 'redcoat' && since < 70 && (
            <circle cx={820 + since * 3} cy={-490 - since * 1.5} r={40 + since * 2.2} fill="#E9E4DA" opacity={interpolate(since, [0, 6, 70], [0, 0.8, 0], clamp)} />
          )}
        </g>
      );
    });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {row(BUR, 'burmese', brace, true)}
        {row(RED, 'redcoat', aim, false)}
      </svg>
    </AbsoluteFill>
  );
};
