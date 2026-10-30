import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { Cam, toS } from './MapView';
import { C, clamp, wobble } from './theme';
import { TITLE, useFonts } from './font';

// s04_track (line 2, the reference's 0:07–0:10): a drawn railway (two rails and sleepers) grows from `from` toward
// `to` (Mercator points) and stops at `stopAt` (0..1 of the way); a small train (yellow loco, two coaches) rides its
// head and brakes with a jolt; a "?" pops over the gap. Times in frames from the piece's start. Transparent.
export const S04Track: React.FC<{ c: Cam; from: number[]; to: number[]; stopAt?: number; grow?: [number, number]; q?: number; out?: number; scale?: number }> = ({ c, from, to, stopAt = 0.8, grow = [0, 50], q, out, scale = 1 }) => {
  useFonts();
  const f = useCurrentFrame();
  const [ax, ay] = toS(c, from), [bx, by] = toS(c, to);
  const u = interpolate(f, grow, [0, stopAt], { ...clamp, easing: Easing.out(Easing.quad) });
  const O = out !== undefined ? interpolate(f, [out, out + 12], [1, 0], clamp) : 1;
  const L = Math.hypot(bx - ax, by - ay), ang = Math.atan2(by - ay, bx - ax);
  const len = L * u, w = 9 * scale;
  const jolt = wobble(f, grow[1], 3, 5) * 6 * scale;
  const Q = q !== undefined ? interpolate(f, [q, q + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) }) : 0;
  const gx = ax + (bx - ax) * (stopAt + 1) / 2, gy = ay + (by - ay) * (stopAt + 1) / 2;
  return (
    <AbsoluteFill style={{ opacity: O, pointerEvents: 'none' }}>
      <svg width={1080} height={1920} style={{ overflow: 'visible' }}>
        <g transform={`translate(${ax},${ay}) rotate(${(ang * 180) / Math.PI})`} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))' }}>
          {Array.from({ length: Math.floor(len / (14 * scale)) }, (_, i) => <rect key={i} x={i * 14 * scale} y={-w * 1.25} width={5 * scale} height={w * 2.5} fill="#7A5A3A" />)}
          <line x1={0} y1={-w} x2={len} y2={-w} stroke="#E8EEF2" strokeWidth={3 * scale} />
          <line x1={0} y1={w} x2={len} y2={w} stroke="#E8EEF2" strokeWidth={3 * scale} />
          <g transform={`translate(${len - 6 * scale + jolt},0)`}>
            {[0, 1, 2].map((k) => (
              <g key={k} transform={`translate(${-k * 46 * scale},0)`}>
                <rect x={-40 * scale} y={-13 * scale} width={40 * scale} height={26 * scale} rx={5 * scale} fill={k ? '#C7CFD6' : C.gold} stroke="#1a1a1a" strokeWidth={2 * scale} />
                <rect x={-34 * scale} y={-8 * scale} width={(k ? 28 : 12) * scale} height={16 * scale} rx={2} fill={k ? '#5A6B78' : '#2C3A44'} />
              </g>
            ))}
            {f > grow[0] && f < grow[1] + 8 && <circle cx={4 * scale} cy={0} r={7 * scale} fill="#FFF7C8" opacity={0.9} style={{ filter: 'blur(3px)' }} />}
          </g>
        </g>
        {Q > 0 && <g transform={`translate(${gx},${gy - 70 * scale}) scale(${Q * scale})`}>
          <circle r={40} fill={C.ink} stroke={C.cyan} strokeWidth={4} />
          <text y={22} textAnchor="middle" fontFamily={TITLE} fontSize={62} fill="#fff">?</text>
        </g>}
      </svg>
    </AbsoluteFill>
  );
};
