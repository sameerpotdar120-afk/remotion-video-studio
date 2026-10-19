import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { Fleur } from './Heraldry';
import { PP0, Plush, PlushPose, blendP } from './Plush';
import { C, clamp, pop } from './theme';

// h04_edward (line 3, Edward III's idea; the reference's 15.2–18.6 s): Edward pops in (on England, in the edit), rubs
// his chin with a sly look, then his stick arms flail as he schemes and talks. A thought bubble rises with his mother
// Isabella's head crowned with a fleur-de-lis crown (the claim through her). `talk` = [start, end] frames of his line.
// Transparent, 900×1100, 60 fps, 240 frames.
export const H04Edward: React.FC<{ talk?: [number, number]; flail?: number; bubble?: number }> = ({ talk = [40, 200], flail = 110, bubble = 60 }) => {
  const f = useCurrentFrame();
  const s = pop(f, 0, 14, 2);
  const chin: PlushPose = { ...PP0, arms: 1, rx: -30, ry: -170, lx: -150, ly: 100, mouth: 'smile', look: 0.6, lookY: -0.5, brow: 0.4, tilt: 6 };
  const sch: PlushPose = { ...PP0, arms: 1, mouth: 'grin', look: -0.4, brow: -0.4,
    rx: 210 + Math.sin(f / 4) * 70, ry: -200 + Math.cos(f / 4) * 90, lx: -210 + Math.sin(f / 4 + 2) * 70, ly: -200 + Math.cos(f / 4 + 2) * 90 };
  let p = blendP(chin, sch, interpolate(f, [flail, flail + 10], [0, 1], clamp));
  const rub = f < flail ? Math.sin(f / 5) * 25 : 0;
  const tk = f > talk[0] && f < talk[1] ? Math.max(0, Math.sin(f * 0.55) * 0.6 + 0.3) : 0;
  p = { ...p, rx: p.rx + rub, talk: tk, hop: Math.abs(Math.sin(f / 9)) * 8 };
  const b = pop(f, bubble, bubble + 16, 2);
  return (
    <AbsoluteFill>
      <svg width={900} height={1100}>
        <g transform={`translate(450 1060) scale(${0.85 * s})`}><Plush who="edward" pose={p} f={f} seed="ed" /></g>
        {b > 0.01 && (
          <g transform={`translate(680 170) scale(${b})`}>
            {[[-110, 150, 16], [-70, 110, 24]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" stroke={C.ink} strokeWidth={5} />)}
            <ellipse rx={170} ry={140} fill="#fff" stroke={C.ink} strokeWidth={7} />
            <g transform="translate(0 30) scale(0.42)">
              <circle cx={0} cy={-60} r={210} fill="#F6CFAE" stroke={C.ink} strokeWidth={12} />
              <path d="M -210 -40 C -230 -300 230 -300 210 -40 L 230 200 L 150 180 L 150 -40 Q 0 -140 -150 -40 L -150 180 L -230 200 Z" fill="#C88A3A" stroke={C.ink} strokeWidth={10} />
              {[-1, 1].map((k) => <circle key={k} cx={k * 70} cy={-40} r={24} fill={C.ink} />)}
              <path d="M -40 60 Q 0 90 40 60" stroke={C.ink} strokeWidth={10} fill="none" strokeLinecap="round" />
              <rect x={-170} y={-260} width={340} height={70} fill="#F4C542" stroke={C.ink} strokeWidth={8} />
              {[-110, 0, 110].map((x) => <Fleur key={x} x={x} y={-300} s={0.9} />)}
            </g>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
