import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { PP0, Plush } from './Plush';
import { C, clamp, ramp } from './theme';

// c11_rumali_roti ("बिल्कुल वैसे, जैसे हवा में घुमाई हुई रूमाली रोटी फैल जाती है"): our own analogy for the equatorial
// bulge. A plush cook spins a thin roti over his head on his fingertips; as it spins faster it stretches wider and
// thinner, with speed lines and a little flour dust. Transparent, 1080×1400, 60 fps, 300 frames.
const SPOTS = Array.from({ length: 22 }, (_, i) => [random(`rx${i}`) * 2 - 1, random(`ry${i}`) * 2 - 1, 6 + random(`rr${i}`) * 12]);
export const C11RumaliRoti: React.FC<{ img?: { src: string; w: number; h: number } }> = ({ img }) => {
  const f = useCurrentFrame();
  const sp = ramp(f, 0, 200, Easing.in(Easing.quad));
  const ang = f * (4 + 26 * sp);
  const rx = interpolate(sp, [0, 1], [150, 420], clamp);
  const ry = interpolate(sp, [0, 1], [70, 46], clamp);
  const lift = Math.sin(f / 9) * 10;
  const hands = { ...PP0, arms: 1, lx: -130 + Math.sin(f / 4) * 20 * sp, ly: -360, rx: 130 - Math.sin(f / 4) * 20 * sp, ry: -360, mouth: sp > 0.6 ? ('oh' as const) : ('grin' as const), brow: 0.3 + 0.4 * sp, lookY: -1.2 };
  const cy = 330 + lift;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1400}>
        <defs>
          <radialGradient id="roti" cx="0.5" cy="0.5" r="0.55"><stop offset="0" stopColor="#FFF4DC" /><stop offset="0.75" stopColor="#F3DDAE" /><stop offset="1" stopColor="#E2C08A" /></radialGradient>
          <clipPath id="rotiClip"><ellipse cx={540} cy={cy} rx={rx} ry={ry} /></clipPath>
        </defs>
        <g transform="translate(540 1360) scale(0.62)"><Plush who="cook" f={f} pose={hands} /></g>
        {/* speed lines round the roti */}
        {[0, 1, 2].map((k) => {
          const a = ((ang * 0.6 + k * 120) % 360) * (Math.PI / 180);
          return <path key={k} transform={`translate(540 ${cy}) scale(1 ${ry / rx})`} d={`M ${Math.cos(a) * (rx + 40)} ${Math.sin(a) * (rx + 40)} A ${rx + 40} ${rx + 40} 0 0 1 ${Math.cos(a + 0.9) * (rx + 40)} ${Math.sin(a + 0.9) * (rx + 40)}`}
            stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.25 + 0.6 * sp} />;
        })}
        <ellipse cx={540} cy={cy + 10} rx={rx} ry={ry} fill="#000" opacity={0.12} />
        {img && (
          <foreignObject x={540 - rx * 1.08} y={cy - ((rx * 2.16) / 2.2) * (1 - 0.25 * sp) / 2} width={rx * 2.16} height={((rx * 2.16) / 2.2) * (1 - 0.25 * sp)}>
            <div style={{ width: '100%', height: '100%', transform: `rotate(${Math.sin(ang / 40) * 3}deg) scaleX(${1 + 0.03 * Math.sin(ang / 9)})` }}>
              <Img src={img.src} style={{ width: '100%', height: '100%' }} />
            </div>
          </foreignObject>
        )}
        {!img && <ellipse cx={540} cy={cy} rx={rx} ry={ry} fill="url(#roti)" stroke="#B88A50" strokeWidth={5} opacity={0.96} />}
        <g clipPath="url(#rotiClip)" opacity={img ? 0 : 1}>
          <g transform={`translate(540 ${cy}) scale(${rx / 200} ${ry / 200}) rotate(${ang})`}>
            {SPOTS.map(([x, y, r], i) => (x * x + y * y < 0.9 ? <circle key={i} cx={x * 170} cy={y * 170} r={r * 2.2} fill="#B9803F" opacity={0.45} /> : null))}
          </g>
        </g>
        {/* flour puffs flung off the rim */}
        {Array.from({ length: 8 }, (_, i) => {
          const t = ((f + i * 11) % 40) / 40;
          const a = random(`fa${i}`) * Math.PI * 2;
          return sp > 0.3 ? <circle key={i} cx={540 + Math.cos(a) * (rx + 80 * t)} cy={cy + Math.sin(a) * (ry + 30 * t)} r={6 + 10 * t} fill="#fff" opacity={(1 - t) * 0.6 * sp} /> : null;
        })}
      </svg>
    </AbsoluteFill>
  );
};
