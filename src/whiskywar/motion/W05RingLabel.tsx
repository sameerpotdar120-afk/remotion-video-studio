import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { C, pop, ramp, typed } from './theme';

// w05_ring_label (line 2, "Hans Island"; the reference's 8.0–9.7 s): a thin yellow ring draws round the point, a short
// leader line shoots up-right from it, and a yellow box label types in letter by letter. Transparent, 900×600, 60 fps;
// the point is (300, 400). `text` is the label (Hindi or English).
export const W05RingLabel: React.FC<{ text?: string; r?: number }> = ({ text = 'Hans Island', r = 34 }) => {
  useFonts();
  const f = useCurrentFrame();
  const ring = ramp(f, 0, 14, Easing.inOut(Easing.cubic));
  const lead = ramp(f, 12, 22);
  const box = pop(f, 18, 28, 2);
  const s = typed(text, f, 22, 26);
  const circ = 2 * Math.PI * r;
  const bob = Math.sin(f / 20) * 3;
  return (
    <AbsoluteFill>
      <svg width={900} height={600}>
        <circle cx={300} cy={400} r={r} fill="none" stroke={C.yellow} strokeWidth={6} strokeDasharray={`${circ * ring} ${circ}`} transform="rotate(-90 300 400)"
          style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.6))' }} />
        <path d={`M ${300 + r * 0.7} ${400 - r * 0.7} L ${300 + r * 0.7 + 90 * lead} ${400 - r * 0.7 - 70 * lead} H ${300 + r * 0.7 + 90 * lead + 40 * lead}`} stroke={C.yellow} strokeWidth={5} fill="none" />
      </svg>
      {box > 0 && (
        <div style={{ position: 'absolute', left: 300 + r * 0.7 + 130, top: 400 - r * 0.7 - 70 - 32 + bob, transform: `scale(${box})`, transformOrigin: '0 50%', background: C.yellow,
          padding: '2px 16px 0', fontFamily: NUM, fontSize: 44, color: C.ink, whiteSpace: 'nowrap', minWidth: 20, boxShadow: '0 6px 14px rgba(0,0,0,0.35)' }}>{s || ' '}</div>
      )}
    </AbsoluteFill>
  );
};
