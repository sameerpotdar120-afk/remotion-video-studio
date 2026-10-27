import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// p25_shatter (line 8, "इसे तोड़-तोड़कर"): the creator's whole bottle (gp03) pops in big at the centre (back-ease,
// 10 frames) and shakes; white crack lines race across it (frames 10–24, jagged, from one impact point); at `burst`
// it swaps for its broken pieces (gp13, cut out one by one, `pieces`) which fly apart, spinning, under gravity, shrink
// and fade into specks; a flash and a spray of tiny dots at the burst. `w` the bottle's width. Centred; transparent.
export const P25Shatter: React.FC<{ whole: string; pieces: string[]; w?: number; burst?: number }> = ({ whole, pieces, w = 420, burst = 30 }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const shake = f > 10 && f < burst ? Math.sin(f * 2.7) * 4 : 0;
  const crack = interpolate(f, [10, burst - 4], [0, 1], clamp);
  const g = f - burst;
  const flash = g >= 0 ? Math.max(0, 1 - g / 8) : 0;
  const cracks = ['M0,0 L-30,-60 L-20,-110 L-55,-170', 'M0,0 L40,-40 L35,-95 L70,-150', 'M0,0 L-45,30 L-90,40', 'M0,0 L50,45 L60,110 L95,160', 'M0,0 L-10,70 L-40,130'];
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      {g < 0 && (
        <div style={{ position: 'relative', width: w, height: w, transform: `translateX(${shake}px) scale(${s})` }}>
          <Img src={whole} style={{ width: w, height: w, objectFit: 'contain', filter: 'drop-shadow(0 16px 16px rgba(0,0,0,0.5))' }} />
          <svg width={w} height={w} viewBox={`${-w / 2} ${-w / 2} ${w} ${w}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            {cracks.map((d, i) => <path key={i} d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={4} strokeLinejoin="round" strokeDasharray={`${crack} 2`} style={{ filter: 'drop-shadow(0 0 4px #fff)' }} />)}
          </svg>
        </div>
      )}
      {g >= 0 && (
        <div style={{ position: 'relative', width: 0, height: 0 }}>
          {pieces.map((src, i) => {
            const a = (i / pieces.length) * Math.PI * 2 + random(`a${i}`) * 0.6, v = 9 + random(`v${i}`) * 7;
            const x = Math.cos(a) * v * g, y = Math.sin(a) * v * g + 0.25 * g * g, k = Math.max(0, 1 - g / 50);
            const pw = w * 0.32;
            return <Img key={i} src={src} style={{ position: 'absolute', left: x - pw / 2, top: y - pw / 2, width: pw, height: pw, objectFit: 'contain', transform: `rotate(${(random(`r${i}`) - 0.5) * 30 * g}deg) scale(${k})`, opacity: k }} />;
          })}
          <svg width={1} height={1} style={{ position: 'absolute', overflow: 'visible' }}>
            {Array.from({ length: 30 }, (_, i) => { const a = random(`s${i}`) * Math.PI * 2, v = 6 + random(`w${i}`) * 14; return <circle key={i} cx={Math.cos(a) * v * g} cy={Math.sin(a) * v * g + 0.2 * g * g} r={3} fill="#E8F8FF" opacity={Math.max(0, 1 - g / 30)} />; })}
            <circle r={w * 0.5 * (1 + g / 10)} fill="#fff" opacity={flash * 0.6} />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
