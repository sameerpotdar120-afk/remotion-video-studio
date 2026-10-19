import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { UI, useAnton } from './font';
import { PP0, Plush } from './Plush';
import { C, clamp, pop } from './theme';

// h10_joan_card (line 7, "तभी Domrémy गाँव से आती है Joan of Arc … ना शाही खून था, ना फ़ौज"; the reference's 40.3–49.3 s):
// a light flare blooms on the map, peasant Joan pops in inside an expanding ring of light, then a parchment name tag
// "Joan of Arc" flips in above her and RPG stat icons pop under it: a crown with "0" (no noble blood), crossed swords with
// "0" (no army), then a fist whose bar fills green (just belief). Cues are props. Transparent, 900×1200, 60 fps, 420 f.
export const H10JoanCard: React.FC<{ tag?: number; crown?: number; swords?: number; fist?: number }> = ({ tag = 120, crown = 200, swords = 250, fist = 330 }) => {
  useAnton();
  const f = useCurrentFrame();
  const flare = interpolate(f, [0, 10, 30], [0, 1, 0.25], clamp);
  const pj = pop(f, 14, 30, 2.2);
  const ring = interpolate(f, [14, 60], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const flip = interpolate(f, [tag, tag + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
  const stat = (at: number) => pop(f, at, at + 14, 2.4);
  const bar = interpolate(f, [fist + 10, fist + 60], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const icon = (x: number, k: number, glyph: React.ReactNode, label: React.ReactNode) => k > 0.01 && (
    <g transform={`translate(${x} 330) scale(${k})`}>
      <circle r={58} fill="rgba(20,14,8,0.6)" stroke="#E6D3A4" strokeWidth={6} />
      {glyph}
      <g transform="translate(0 92)">{label}</g>
    </g>
  );
  return (
    <AbsoluteFill>
      <svg width={900} height={1200}>
        <defs><filter id="jcg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={30} /></filter></defs>
        <circle cx={450} cy={850} r={60 + flare * 220} fill="#FFF8E0" opacity={flare} filter="url(#jcg)" />
        {ring > 0 && ring < 1 && <circle cx={450} cy={850} r={80 + ring * 360} fill="none" stroke="#FFF3CC" strokeWidth={30 * (1 - ring)} opacity={1 - ring} />}
        <g transform={`translate(450 1120) scale(${0.6 * pj})`}><Plush who="joan" seed="jp" f={f} pose={{ ...PP0, mouth: 'smile', look: 0, hop: Math.abs(Math.sin(f / 14)) * 10 }} /></g>
        {flip > 0.01 && (
          <g transform={`translate(450 160) scale(1 ${flip}) rotate(${(1 - flip) * -8})`}>
            <path d="M -260 -60 H 260 L 240 0 L 260 60 H -260 L -240 0 Z" fill="#F6EBCF" stroke="#8A6A3A" strokeWidth={8} strokeLinejoin="round" />
            <text x={0} y={22} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize={68} fontWeight={700} fill="#3A2A1A">Joan <tspan fontSize={40} fontStyle="italic">of</tspan> Arc</text>
          </g>
        )}
        {icon(230, stat(crown),
          <path d="M -36 18 L -40 -22 L -18 -4 L 0 -32 L 18 -4 L 40 -22 L 36 18 Z" fill="#F4C542" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />,
          <text textAnchor="middle" fontFamily={UI} fontSize={50} fontWeight={800} fill="#FF5A5A" stroke={C.ink} strokeWidth={3}>0</text>)}
        {icon(450, stat(swords),
          <g stroke={C.ink} strokeWidth={4}><path d="M -30 30 L 30 -30 M -30 -30 L 30 30" stroke="#C9D1DA" strokeWidth={12} strokeLinecap="round" /><path d="M -22 14 L -10 26 M 22 14 L 10 26" stroke="#8A5A2B" strokeWidth={10} /></g>,
          <text textAnchor="middle" fontFamily={UI} fontSize={50} fontWeight={800} fill="#FF5A5A" stroke={C.ink} strokeWidth={3}>0</text>)}
        {icon(670, stat(fist),
          <path d="M -24 -10 Q -26 -34 -8 -32 Q 0 -40 10 -32 Q 22 -38 28 -24 Q 36 -20 30 0 L 26 26 Q 0 38 -24 26 Z" fill="#F6CFAE" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />,
          <g><rect x={-60} y={-22} width={120} height={26} rx={13} fill="#2A1E12" stroke="#E6D3A4" strokeWidth={4} /><rect x={-56} y={-18} width={112 * bar} height={18} rx={9} fill={C.green} /></g>)}
      </svg>
    </AbsoluteFill>
  );
};
