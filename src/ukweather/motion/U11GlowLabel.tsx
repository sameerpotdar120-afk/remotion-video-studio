import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { pop, TypeOn } from './theme';

// u11_glow_label (line 5, "बाजू में Pacific Ocean"; the reference's 32.7–33.4 s): a glowing cyan ocean label pops on and
// types, two lines, with a soft wave shimmer under it. Transparent, 800×400, 60 fps.
export const U11GlowLabel: React.FC<{ a?: string; b?: string; color?: string }> = ({ a = 'Pacific', b = 'Ocean', color = '#6FE6FF' }) => {
  useFonts();
  const f = useCurrentFrame();
  const s = pop(f, 0, 10, 2);
  const glow = `0 0 14px ${color}, 0 0 36px ${color}`;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${s}) translateY(${Math.sin(f / 18) * 4}px)`, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 96, color: '#E8FBFF', lineHeight: 0.95, textShadow: glow }}>
        <div><TypeOn text={a} f={f} step={2} /></div>
        <div><TypeOn text={b} f={f} at={10} step={2} /></div>
      </div>
      <svg width={800} height={400} style={{ position: 'absolute', inset: 0 }}>
        {[0, 1].map((i) => <path key={i} d={`M 180 ${320 + i * 22} q 55 ${-14 + Math.sin(f / 8 + i) * 6} 110 0 t 110 0 t 110 0 t 110 0`} stroke={color} strokeWidth={4} fill="none" opacity={0.6 * s} />)}
      </svg>
    </AbsoluteFill>
  );
};
