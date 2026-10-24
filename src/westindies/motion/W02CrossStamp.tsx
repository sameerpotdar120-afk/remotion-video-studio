import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { C, clamp, wobble } from './theme';

// w02_cross_stamp (line 4, "Cuba, Haiti, Dominican Republic और Bahamas खेलते ही नहीं"): a red ✗ in a ring slams onto
// each island (from 1.7× in 7 frames, ease-in, a 10° twist), lands with a squash, a red shock ring and a puff of ink
// specks, then the ink looks stamped (a slightly worn edge) and breathes. Transparent, 400×400, 60 fps; centred.
export const W02CrossStamp: React.FC<{ color?: string; seed?: string }> = ({ color = C.red, seed = 'x' }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 7], [1.7, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const rot = interpolate(f, [0, 7], [-10, 0], clamp) + wobble(f, 7, 4, 9) * 3;
  const sq = f >= 7 ? 1 - 0.12 * Math.max(0, 1 - (f - 7) / 6) : 1;
  const a = interpolate(f, [0, 3], [0, 1], clamp);
  const ring = interpolate(f, [7, 25], [0, 1], clamp);
  const br = 1 + 0.02 * Math.sin(f / 9);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      {f >= 7 && <div style={{ position: 'absolute', width: 240 + 180 * ring, height: 240 + 180 * ring, borderRadius: '50%', border: `${8 * (1 - ring)}px solid ${color}`, opacity: 1 - ring }} />}
      {f >= 7 && Array.from({ length: 14 }, (_, i) => {
        const t = interpolate(f, [7, 30], [0, 1], clamp), ang = (i / 14) * Math.PI * 2 + random(`${seed}a${i}`);
        const d = 110 + 90 * t * (0.6 + random(`${seed}d${i}`) * 0.6);
        return <div key={i} style={{ position: 'absolute', left: 200 + Math.cos(ang) * d, top: 200 + Math.sin(ang) * d, width: 7, height: 7, borderRadius: 4, background: color, opacity: 1 - t }} />;
      })}
      <svg width={260} height={260} viewBox="-130 -130 260 260" style={{ opacity: a, transform: `scale(${s * br * sq}, ${s * br / sq}) rotate(${rot}deg)`, filter: `drop-shadow(0 0 10px ${color}aa) drop-shadow(0 6px 10px rgba(0,0,0,0.5))`, overflow: 'visible' }}>
        <defs>
          <filter id={`w02worn${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={7} /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" /><feComposite in="SourceGraphic" operator="in" /></filter>
        </defs>
        <g filter={`url(#w02worn${seed})`}>
          <circle r={108} fill="rgba(240,55,60,0.12)" stroke={color} strokeWidth={16} />
          <path d="M -52 -52 L 52 52 M 52 -52 L -52 52" stroke={color} strokeWidth={30} strokeLinecap="round" />
        </g>
        <path d="M -52 -52 L 52 52 M 52 -52 L -52 52" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.35} />
      </svg>
    </AbsoluteFill>
  );
};
