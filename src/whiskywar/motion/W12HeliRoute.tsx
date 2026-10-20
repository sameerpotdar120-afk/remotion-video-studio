import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { NUM, useFonts } from './font';
import { C, clamp, pop, typed } from './theme';

// w12_heli_route (line 7, "उसी साल Denmark के मंत्री Tom Høyem पहुँचे"; the reference's 27.5–28.7 s): a round portrait pops
// with a white rim, a yellow name tag types in under it, and a small helicopter flies along a curved route to the island
// leaving a bright yellow trail. Transparent, 1080×1080, 60 fps. `face` is the portrait image (the edit passes a crop
// of our Høyem character); route from `a` to `b`.
const Heli: React.FC = () => (
  <g>
    <ellipse cx={0} cy={0} rx={34} ry={14} fill="#2B2F36" />
    <path d="M 26 -4 L 70 -8 L 74 0 L 30 6 Z" fill="#2B2F36" />
    <path d="M 70 -8 L 76 -22 L 80 -20 L 76 0 Z" fill="#2B2F36" />
    <path d="M -10 -14 V -22" stroke="#2B2F36" strokeWidth={4} />
    <path d="M -10 16 L -24 22 M 14 16 L 22 22 M -30 22 H 30" stroke="#2B2F36" strokeWidth={4} />
    <ellipse cx={-18} cy={-2} rx={12} ry={8} fill="#9FD7FF" />
  </g>
);
export const W12HeliRoute: React.FC<{ name?: string; face?: string; a?: [number, number]; b?: [number, number] }> = ({ name = 'Tom Høyem', face, a = [240, 820], b = [700, 360] }) => {
  useFonts();
  const f = useCurrentFrame();
  const k = interpolate(f, [20, 90], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const c = [(a[0] + b[0]) / 2 - 160, (a[1] + b[1]) / 2 - 60];
  const q = (t: number) => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
  const [hx, hy] = q(k), [nx, ny] = q(Math.min(1, k + 0.02));
  const ang = (Math.atan2(ny - hy, nx - hx) * 180) / Math.PI;
  const pts = Array.from({ length: 30 }, (_, i) => q((i / 29) * k)).map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
  const p = pop(f, 0, 12, 2);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080}>
        {k > 0 && <path d={pts} stroke={C.yellow} strokeWidth={14} fill="none" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(245,242,58,0.8))' }} />}
        <g transform={`translate(${hx} ${hy}) rotate(${ang + 180}) scale(1.4)`}><Heli /></g>
      </svg>
      <div style={{ position: 'absolute', left: b[0] + 60, top: b[1] - 260, transform: `scale(${p})`, transformOrigin: '50% 100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 150, height: 150, borderRadius: '50%', overflow: 'hidden', border: '7px solid #fff', background: '#C9C2B4', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
          {face && <Img src={face} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ marginTop: 10, background: C.yellow, padding: '0 16px', fontFamily: NUM, fontSize: 40, color: C.ink, whiteSpace: 'nowrap', minWidth: 20 }}>{typed(name, f, 8, 20) || ' '}</div>
      </div>
    </AbsoluteFill>
  );
};
