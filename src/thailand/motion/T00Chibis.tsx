import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Chibi, Outfit, POSE0, Pose } from './Chibi';
import { C } from './theme';

// t00_chibis: a test card for the chibi rig. Not used in the edit.
export const T00Chibis: React.FC = () => {
  const f = useCurrentFrame();
  const P: [Outfit, Partial<Pose>][] = [
    ['brit', { nx: 90, ny: -210, stick: 1, stickA: -55, tilt: 8, lookY: -0.6 }],
    ['fr', { cross: 1, nx: -150, ny: 70, fx: 170, fy: 60, squint: 0.7, brow: -0.6, face: 'smirk', turn: 0.6 }],
    ['king', { turn: 0, lookX: 0, face: 'calm', nx: 80, ny: 160, fx: -80, fy: 160 }],
    ['redcoat', { stick: 1, stickA: 0, nx: 150, ny: 30, fx: 260, fy: 60, face: 'angry', brow: -0.8 }],
    ['burmese', { stick: 1, stickA: -20, nx: 140, ny: -40, face: 'oh', brow: 0.7 }],
    ['fr', { stick: 1, stickA: 0, nx: 220, ny: -40, face: 'angry', brow: -1, lean: 8 }],
  ];
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <svg width={1080} height={1920}>
        {P.map(([o, p], i) => (
          <g key={i} transform={`translate(${200 + (i % 2) * 520} ${620 + Math.floor(i / 2) * 620}) scale(0.5)`}>
            <Chibi outfit={o} pose={{ ...POSE0, ...p }} f={f} seed={`s${i}`} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
