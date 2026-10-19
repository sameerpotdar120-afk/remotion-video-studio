import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp } from './theme';

// c08_flat_earth ("वो चपटी है। हाहा, मज़ाक कर रहा हूँ।"; the reference's 32.4–34.5 s): a cartoon flat-earth disc
// (blue ocean, simple green-and-sand continents round the North Pole, an ice wall rim, a brown rock underside) slides in
// from the right with a bounce and settles with a slow wobble; at `out` it slides off to the left. Drawn in code (no
// map data). Transparent, 1080×1920, 60 fps; the disc centre lands at (540, 960).
const CONT = [
  'M -40 -40 C -120 -110 -260 -60 -250 20 C -240 70 -170 90 -120 60 C -80 40 -30 10 -40 -40 Z',
  'M 40 -30 C 120 -120 260 -90 300 -20 C 320 30 250 60 200 40 C 150 20 90 30 40 -30 Z',
  'M 60 40 C 120 40 160 90 150 150 C 140 200 80 200 70 150 C 60 110 30 70 60 40 Z',
  'M -160 90 C -110 80 -80 120 -100 170 C -120 210 -170 190 -175 150 C -178 120 -180 100 -160 90 Z',
  'M 220 120 C 260 110 290 140 270 170 C 250 190 210 180 210 150 Z',
];
export const C08FlatEarth: React.FC<{ out?: number }> = ({ out = 90 }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 22, out, out + 22], [1500, 540, 540, -500], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const settle = f > 18 && f < out ? Math.exp(-(f - 18) / 20) * Math.sin((f - 18) / 4) * 6 : 0;
  const spin = f * 0.6;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs>
          <radialGradient id="feSea" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stopColor="#5FC3F0" /><stop offset="1" stopColor="#1C6FB0" /></radialGradient>
          <linearGradient id="feRock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A5A3A" /><stop offset="1" stopColor="#3E2516" /></linearGradient>
          <clipPath id="feTop"><ellipse cx={0} cy={0} rx={400} ry={400} /></clipPath>
        </defs>
        <g transform={`translate(${x} 960) rotate(${settle})`}>
          <ellipse cx={0} cy={260} rx={330} ry={60} fill="#000" opacity={0.25} />
          {/* the rocky underside, a shallow bowl */}
          <path d="M -420 0 Q -380 220 0 250 Q 380 220 420 0 Z" fill="url(#feRock)" stroke={C.ink} strokeWidth={7} />
          {[-260, -120, 40, 190, 300].map((xx, i) => <path key={i} d={`M ${xx} ${60 + (i % 2) * 30} l 30 40 l -40 30`} stroke="#2A170C" strokeWidth={6} fill="none" opacity={0.5} />)}
          {/* the top disc, squashed into perspective */}
          <g transform="scale(1 0.38)">
            <ellipse cx={0} cy={0} rx={430} ry={430} fill="#F2F8FF" stroke={C.ink} strokeWidth={14} />
            <ellipse cx={0} cy={0} rx={400} ry={400} fill="url(#feSea)" />
            <g clipPath="url(#feTop)" transform={`rotate(${spin})`}>
              {CONT.map((d, i) => <path key={i} d={d} fill={i % 2 ? '#7BBF4A' : '#D9B96E'} stroke="#3E6B2A" strokeWidth={5} />)}
              <circle cx={0} cy={0} r={34} fill="#fff" />
              {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={0} cy={0} r={70 * (i + 1)} fill="none" stroke="#fff" strokeWidth={3} opacity={0.2} />)}
              {Array.from({ length: 12 }, (_, i) => <path key={`m${i}`} d={`M 0 0 L ${Math.cos((i * Math.PI) / 6) * 400} ${Math.sin((i * Math.PI) / 6) * 400}`} stroke="#fff" strokeWidth={3} opacity={0.18} />)}
            </g>
            {/* the ice wall round the edge */}
            <ellipse cx={0} cy={0} rx={412} ry={412} fill="none" stroke="#fff" strokeWidth={26} />
            <ellipse cx={0} cy={0} rx={412} ry={412} fill="none" stroke="#BFE3FF" strokeWidth={8} strokeDasharray="30 20" />
          </g>
          <path d="M -430 0 Q -425 30 -415 40 L 415 40 Q 425 30 430 0" fill="none" stroke="#fff" strokeWidth={10} opacity={0.9} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
