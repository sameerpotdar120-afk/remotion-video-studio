import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { LABEL, useFonts } from './font';
import { Cam, G, ringsD, toS } from './MapView';
import { C, clamp } from './theme';

// s06_himalaya (line 4, the reference's 0:10–0:12): Sikkim's fill turns into an illustrated Himalaya: rows of snow-capped
// peaks on teal pop up from the back row to the front, clipped to the state, and "HIMALAYAS" in spaced caps curves
// across it. Transparent.
export const S06Himalaya: React.FC<{ c: Cam; t0?: number; out?: number }> = ({ c, t0 = 0, out }) => {
  useFonts();
  const f = useCurrentFrame();
  const sk = ringsD(c, G.states.Sikkim);
  const pts = G.states.Sikkim.flat().map((p) => toS(c, p));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const W = x1 - x0, H = y1 - y0, pk = W / 3.6;
  const A = interpolate(f, [t0, t0 + 10], [0, 1], clamp);
  const O = out !== undefined ? interpolate(f, [out, out + 12], [1, 0], clamp) : 1;
  const rows = 4;
  const T = interpolate(f, [t0 + 16, t0 + 34], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const arc = `M${x0 - W * 0.1},${y0 + H * 0.62} Q${x0 + W / 2},${y0 + H * 0.28} ${x1 + W * 0.1},${y0 + H * 0.62}`;
  return (
    <AbsoluteFill style={{ opacity: O * A, pointerEvents: 'none' }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id="hmClip"><path d={sk} /></clipPath>
          <linearGradient id="hmBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1FB7B5" /><stop offset="1" stopColor="#0A5A63" /></linearGradient>
          <path id="hmArc" d={arc} />
        </defs>
        <g clipPath="url(#hmClip)">
          <rect x={x0 - 20} y={y0 - 20} width={W + 40} height={H + 40} fill="url(#hmBg)" />
          {Array.from({ length: rows }, (_, r) => {
            const yb = y0 + (H * (r + 1)) / rows + 10, n = Math.ceil(W / pk) + 2;
            return Array.from({ length: n }, (_, k) => {
              const s = 0.7 + random(`hs${r}${k}`) * 0.6, h = pk * 1.05 * s, w = pk * 0.75 * s;
              const x = x0 - pk / 2 + k * pk + (r % 2) * pk * 0.5 + (random(`hx${r}${k}`) - 0.5) * pk * 0.3;
              const st = t0 + 2 + r * 2.4 + random(`ht${r}${k}`) * 4;
              const u = interpolate(f, [st, st + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
              if (u <= 0) return null;
              const sy = 1 - 0.38;
              return (
                <g key={`${r}-${k}`} transform={`translate(${x},${yb}) scale(1,${u})`}>
                  <path d={`M${-w},0 L0,${-h} L${w},0Z`} fill={r % 2 ? '#0E6F78' : '#138A8F'} stroke="#04363C" strokeWidth={1.5} />
                  <path d={`M0,${-h} L${w},0 L${w * 0.15},0Z`} fill="#000" opacity={0.18} />
                  <path d={`M${-w * (1 - sy)},${-h * sy} L0,${-h} L${w * (1 - sy)},${-h * sy} L${w * 0.15},${-h * sy * 0.92} L${-w * 0.1},${-h * sy * 1.02}Z`} fill="#F4FBFF" />
                </g>
              );
            });
          })}
        </g>
        <path d={sk} fill="none" stroke="#fff" strokeWidth={4} />
        {T > 0 && <text fontFamily={LABEL} fontWeight={800} fontSize={W * 0.12} letterSpacing={W * 0.02} fill="#fff" opacity={T}
          style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.85))' }}>
          <textPath href="#hmArc" startOffset="50%" textAnchor="middle">{'HIMALAYAS'.slice(0, Math.ceil(T * 9))}</textPath>
        </text>}
      </svg>
    </AbsoluteFill>
  );
};
