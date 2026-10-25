import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { C, clamp, pop } from './theme';

// g09_spyglass (line 5, "पहाड़ पर चढ़ा, नीचे देखा तो पूरी खाड़ी बर्फ़ से भरी हुई थी"; the reference's iris into a
// spyglass view): the frame irises in to a circle in 4 frames (black outside), a polished rim with a moving glint
// round it, and inside it `children` (the fjord full of drift ice, gl05) drifts slowly as if hand-held, then the
// "ICELAND!" shout bubble bursts out. `bubbleAt` frames after the iris. Opaque, 1080×1920, 60 fps.
export const G09Spyglass: React.FC<{ children: React.ReactNode; bubble?: string; bubbleAt?: number; r?: number }> = ({ children, bubble = 'ICELAND!', bubbleAt = 50, r = 430 }) => {
  useFonts();
  const f = useCurrentFrame();
  const rr = interpolate(f, [0, 4], [1300, r], { ...clamp, easing: Easing.out(Easing.quad) });
  const sx = Math.sin(f / 37) * 14 + Math.sin(f / 13) * 3, sy = Math.cos(f / 43) * 10 + Math.sin(f / 17) * 3;
  const cx = 540, cy = 900;
  const b = pop(f, bubbleAt, bubbleAt + 10, 2.6);
  const glint = (f * 1.2) % 360;
  return (
    <AbsoluteFill style={{ background: '#05070A' }}>
      <AbsoluteFill style={{ clipPath: `circle(${rr}px at ${cx + sx}px ${cy + sy}px)` }}>
        <AbsoluteFill style={{ transform: `translate(${-sx * 1.6}px, ${-sy * 1.6}px) scale(${1.08 + f * 0.0006})` }}>{children}</AbsoluteFill>
        <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx + sx}px ${cy + sy}px, rgba(0,0,0,0) ${rr * 0.7}px, rgba(0,0,0,0.55) ${rr}px)` }} />
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="g09rim" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#F4D58A" /><stop offset="0.5" stopColor="#8A6326" /><stop offset="1" stopColor="#E8C36A" /></linearGradient>
        </defs>
        <circle cx={cx + sx} cy={cy + sy} r={rr + 14} fill="none" stroke="url(#g09rim)" strokeWidth={30} />
        <circle cx={cx + sx} cy={cy + sy} r={rr + 1} fill="none" stroke="#2B1C08" strokeWidth={5} />
        <path d={`M ${cx + sx + (rr + 14) * Math.cos((glint * Math.PI) / 180)} ${cy + sy + (rr + 14) * Math.sin((glint * Math.PI) / 180)} A ${rr + 14} ${rr + 14} 0 0 1 ${cx + sx + (rr + 14) * Math.cos(((glint + 25) * Math.PI) / 180)} ${cy + sy + (rr + 14) * Math.sin(((glint + 25) * Math.PI) / 180)}`}
          fill="none" stroke="#FFF6D8" strokeWidth={10} strokeLinecap="round" opacity={0.8} />
      </svg>
      {b > 0 && (
        <div style={{ position: 'absolute', left: 540, top: 300, transform: `translate(-50%,-50%) scale(${b}) rotate(${-4 + Math.sin(f / 7) * 1.5}deg)` }}>
          <svg width={760} height={300} viewBox="-380 -150 760 300" style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -380, marginTop: -150, overflow: 'visible' }}>
            <path d={Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2, k = i % 2 ? 1 : 1.18; return `${i ? 'L' : 'M'} ${Math.cos(a) * 340 * k} ${Math.sin(a) * 120 * k}`; }).join(' ') + ' Z'}
              fill="#fff" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" style={{ filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.5))' }} />
            <path d="M 60 120 L 120 230 L 140 115" fill="#fff" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
            <path d="M 56 112 L 146 108" stroke="#fff" strokeWidth={12} />
          </svg>
          <div style={{ position: 'relative', fontFamily: NUM, fontSize: 150, lineHeight: 1, color: C.iceDeep, WebkitTextStroke: `6px ${C.ink}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap' }}>{bubble}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
