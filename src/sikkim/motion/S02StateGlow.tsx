import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { Cam, G, ringsD, toS } from './MapView';
import { C, clamp } from './theme';

// s02_state_glow (lines 1–2, the reference's 0:04–0:10): Sikkim lights up. Everything outside it darkens; inside, the
// relief stays visible under a cyan-teal tint with an inner glow; a bright rim runs round it. Thick white borders
// (Nepal, Bhutan, China, Bangladesh, West Bengal) draw on. `india` fills India dusty rose (the reference's frame 0).
// Times are frames from this piece's start. Transparent.
export const S02StateGlow: React.FC<{ c: Cam; lit?: number; borders?: number; india?: [number, number] | null; dim?: number; out?: number }> = ({ c, lit, borders, india = null, dim = 0.55, out }) => {
  const f = useCurrentFrame();
  const sk = ringsD(c, G.states.Sikkim);
  const L = lit !== undefined ? interpolate(f, [lit, lit + 18], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  const B = borders !== undefined ? interpolate(f, [borders, borders + 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;
  const I = india ? interpolate(f, [india[0], india[0] + 1, india[1], india[1] + 18], [0, 1, 1, 0], clamp) : 0;
  const O = out !== undefined ? interpolate(f, [out, out + 14], [1, 0], clamp) : 1;
  const pulse = 0.85 + 0.15 * Math.sin(f / 9);
  const [cx, cy] = toS(c, G.towns.Gangtok);
  const wb = ringsD(c, G.states.WestBengal);
  const others = ['Nepal', 'Bhutan', 'China', 'Bangladesh'].map((n) => ringsD(c, G.countries[n]));
  return (
    <AbsoluteFill style={{ opacity: O, pointerEvents: 'none' }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <defs>
          <filter id="sgBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
          <filter id="sgSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
          <clipPath id="sgClip"><path d={sk} /></clipPath>
          <radialGradient id="sgFill" cx={cx} cy={cy} r={260} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={C.cyanGlow} /><stop offset="1" stopColor={C.cyanDeep} /></radialGradient>
        </defs>
        {I > 0 && <path d={ringsD(c, G.countries.India)} fill={C.rose} opacity={0.45 * I} style={{ mixBlendMode: 'soft-light' }} stroke="#fff" strokeOpacity={0.35 * I} strokeWidth={1.5} />}
        {L > 0 && <path d={`M-2000,-2000H3080V3920H-2000Z${sk}`} fillRule="evenodd" fill="#000" opacity={dim * L} />}
        {L > 0 && <g clipPath="url(#sgClip)">
          <path d={sk} fill="url(#sgFill)" opacity={0.62 * L} style={{ mixBlendMode: 'color' }} />
          <path d={sk} fill="url(#sgFill)" opacity={0.32 * L * pulse} style={{ mixBlendMode: 'screen' }} />
          <path d={sk} fill="none" stroke={C.cyanGlow} strokeWidth={40} opacity={0.5 * L} filter="url(#sgBlur)" />
        </g>}
        {B > 0 && [...others, wb].map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#fff" strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={`${B} 2`} style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.8))' }} />
        ))}
        {L > 0 && <>
          <path d={sk} fill="none" stroke={C.cyanGlow} strokeWidth={10} opacity={0.6 * L} filter="url(#sgSoft)" />
          <path d={sk} fill="none" stroke="#fff" strokeWidth={5} pathLength={1} strokeDasharray={`${L} 2`} />
        </>}
      </svg>
    </AbsoluteFill>
  );
};
