import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { HAND, useFonts } from './font';
import { C, ramp } from './theme';

// g11_hand_label (line 6, "Erik the Red"; the reference's handwritten name with an arrow): the name writes on left to
// right in a marker hand, then a hand-drawn arrow curls from the text down to `to` (relative to the label box) and its
// head flicks on. Like the reference it "boils": the lines redraw with a tiny jitter every 4 frames, so it looks drawn
// by hand. Transparent, 900×700, 60 fps; the text is centred at (450, 160).
export const G11HandLabel: React.FC<{ text?: string; to?: [number, number]; color?: string; size?: number; bend?: number; arrow?: boolean }> = ({ text = 'Erik the Red', to = [620, 600], color = C.red, size = 110, bend = 180, arrow = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const w = ramp(f, 0, Math.max(14, text.length * 2.2), Easing.linear);
  const a = ramp(f, text.length * 2.2 + 2, text.length * 2.2 + 20, Easing.inOut(Easing.quad));
  const boil = Math.floor(f / 4);
  const j = (k: number) => Math.sin(boil * 12.9898 + k * 78.233) * 2.2;
  const [x0, y0] = [450 + j(1), 235 + j(2)], [x1, y1] = [to[0] + j(3), to[1] + j(4)];
  const cx = (x0 + x1) / 2 + bend + j(5), cy = (y0 + y1) / 2 - 40 + j(6);
  const d = `M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`;
  const ang = Math.atan2(y1 - cy, x1 - cx);
  const head = (s: number) => `M ${x1 - Math.cos(ang - 0.5) * 44 * s} ${y1 - Math.sin(ang - 0.5) * 44 * s} L ${x1} ${y1} L ${x1 - Math.cos(ang + 0.5) * 44 * s} ${y1 - Math.sin(ang + 0.5) * 44 * s}`;
  return (
    <AbsoluteFill>
      {arrow && <svg width={900} height={700} style={{ position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.35))' }}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={17} strokeLinecap="round" pathLength={1} strokeDasharray={`${a} 2`} />
        <path d={d} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={`${a} 2`} />
        {a >= 1 && <><path d={head(1)} fill="none" stroke="#fff" strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" /><path d={head(1)} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /></>}
      </svg>}
      <div style={{ position: 'absolute', left: 450, top: 160, transform: `translate(-50%,-50%) rotate(${-4 + j(7) * 0.3}deg)`, fontFamily: HAND, fontWeight: 700, fontSize: size, color, whiteSpace: 'nowrap',
        WebkitTextStroke: '10px #fff', paintOrder: 'stroke fill', clipPath: `inset(-30% ${100 - w * 100}% -30% -5%)`, lineHeight: 1.2 }}>{text}</div>
    </AbsoluteFill>
  );
};
