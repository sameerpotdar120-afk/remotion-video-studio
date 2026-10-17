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
