import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { C, idle, pop, ramp, TypeOn } from './theme';

// w12_glow_label (labels on the dark map: "WEST INDIES" and "EAST INDIES" in line 7, "13 आज़ाद देश", "British राज",
// "Guyana", "1958"): a glass pill with a glowing coloured rim, the text typing on, a short arrow drawing to the anchor
// below with a pulsing dot. It pops in from 0.6× in 9 frames and floats. Transparent, 700×320, 60 fps; the pill is
// centred at (350, 110), the anchor at (350, 290).
export const W12GlowLabel: React.FC<{ text?: string; color?: string; arrow?: boolean; size?: number }> = ({ text = 'WEST INDIES', color = C.teal, arrow = true, size = 60 }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = pop(f, 0, 9, 2.2);
  const ld = ramp(f, 6, 18);
  const [ix, iy, ir] = idle(f, 7, 0.5);
  const pulse = (f % 45) / 45;
  return (
    <AbsoluteFill>
      {arrow && (
        <svg width={700} height={320} style={{ position: 'absolute', inset: 0 }}>
          <path d={`M 350 160 L 350 ${160 + 120 * ld}`} stroke={color} strokeWidth={5} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
          {ld >= 1 && <circle cx={350} cy={288} r={10 + pulse * 26} fill="none" stroke={color} strokeWidth={3} opacity={1 - pulse} />}
          {ld >= 1 && <circle cx={350} cy={288} r={9} fill={color} stroke={C.ink} strokeWidth={3} />}
        </svg>
      )}
      <div style={{ position: 'absolute', left: 350, top: 110, transform: `translate(-50%,-50%) translate(${ix}px, ${iy}px) rotate(${ir}deg) scale(${s})`, padding: '6px 34px 0', borderRadius: 60,
        background: 'rgba(6,20,32,0.82)', border: `4px solid ${color}`, boxShadow: `0 0 26px ${color}88, inset 0 0 18px ${color}33, 0 10px 20px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap',
        fontFamily: UI, fontWeight: 800, fontSize: size, color: '#fff', lineHeight: 1.3, textShadow: `0 0 12px ${color}` }}>
        <TypeOn text={text} f={f} at={3} step={2} />
      </div>
    </AbsoluteFill>
  );
};
