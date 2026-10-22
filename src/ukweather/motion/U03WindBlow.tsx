import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { P0, Tourist, UmbrellaSvg } from './Tourist';
import { clamp, ramp } from './theme';

// u03_wind_blow (line 2, "और हवा तो free में मिलती है"; the reference's 9.7–11.4 s): diagonal white wind streaks race across
// (top-left → bottom-right, ~15 frames each, staggered); the tourist leans ~15° into it, his hair blows back, at `flip` the
// umbrella turns inside out, at `rip` it is torn from his hand and tumbles away up-right, and he slides and is blown out of
// frame. Transparent, 1080×1920, 60 fps; he starts at (540, 1150).
export const WindStreaks: React.FC<{ f: number; a: number; n?: number }> = ({ f, a, n = 22 }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
    {Array.from({ length: n }, (_, i) => {
      const per = 28 + random(`wp${i}`) * 16, ph = random(`wf${i}`) * per;
      const t = ((f + ph) % per) / per;
      const y0 = random(`wy${i}`) * 2100 - 200, x = -300 + t * 1700;
      const len = 180 + random(`wl${i}`) * 220;
      return <path key={i} d={`M ${x} ${y0 + x * 0.35} l ${-len} ${-len * 0.35}`} stroke="#fff" strokeWidth={4 + random(`ww${i}`) * 4} strokeLinecap="round" opacity={Math.sin(t * Math.PI) * 0.8} />;
    })}
  </svg>
);
export const U03WindBlow: React.FC<{ flip?: number; rip?: number; gone?: number }> = ({ flip = 20, rip = 44, gone = 70 }) => {
  const f = useCurrentFrame();
  const gust = ramp(f, 0, 12);
  const lean = 15 * gust + 4 * Math.sin(f / 3) * gust;
  const slide = interpolate(f, [rip, gone], [0, 900], { ...clamp, easing: Easing.in(Easing.cubic) });
  const lift = interpolate(f, [rip, gone], [0, 260], { ...clamp, easing: Easing.in(Easing.quad) });
  const uk = interpolate(f, [rip, rip + 40], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <WindStreaks f={f} a={gust} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${540 + slide} ${1150 - lift}) rotate(${slide / 12}) scale(0.62)`}>
          <Tourist f={f} pose={{ ...P0, outfit: 'coat', umbrella: f < rip ? (f >= flip ? 'inside' : 'open') : 'none', open: 1, lean, hair: gust, mouth: 'oh', brow: 1, arm: 30 * gust }} />
        </g>
        {f >= rip && (
          <g transform={`translate(${720 + uk * 800} ${780 - uk * 900 + Math.sin(uk * 6) * 40}) rotate(${uk * 720}) scale(0.62)`}>
            <UmbrellaSvg state="inside" open={1} f={f} />
          </g>
        )}
        {Array.from({ length: 8 }, (_, i) => {
          const t = ((f + i * 9) % 40) / 40;
          return <path key={i} d="M 0 0 q 12 -8 24 0 q -12 8 -24 0" fill="#6B8E3A" opacity={gust * (1 - t)} transform={`translate(${-60 + t * 1200} ${700 + i * 120 + t * 300}) rotate(${t * 900})`} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
