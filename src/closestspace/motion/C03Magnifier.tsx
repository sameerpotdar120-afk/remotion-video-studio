import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp, ramp } from './theme';

// c03_magnifier ("सबसे पहले ढूँढते हैं धरती की सबसे ऊँची जगह", "तो अब ढूँढते हैं equator के पास का सबसे ऊँचा पहाड़";
// the reference's 6.8–11.2 s and 65.0–68.5 s): a chrome magnifying glass enters from the bottom-right and hunts across
// whatever is behind it, the lens showing it 1.7× bigger with a refraction rim; it lands, and at `fill` the lens grows
// to cover the whole screen (the dive through the lens). 1080×1920, 60 fps. Pass the scene as `children` (the same
// node is drawn twice: plain, and magnified inside the lens); `path` is [frame, x, y] keys for the lens centre.
type Key = [number, number, number];
/** An image of the glass instead of the drawn one: its size and the lens centre and radius in its pixels. */
export type GlassImg = { src: string; w: number; h: number; cx: number; cy: number; r: number };
const DEF_PATH: Key[] = [[0, 1250, 1500], [30, 700, 980], [70, 420, 820], [110, 700, 700], [150, 760, 780]];
export const C03Magnifier: React.FC<{ path?: Key[]; fill?: number; zoom?: number; glass?: GlassImg; children?: React.ReactNode }> = ({ path = DEF_PATH, fill = 200, zoom = 1.7, glass, children }) => {
  const f = useCurrentFrame();
  const fr = path.map((k) => k[0]);
  const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  const cx = interpolate(f, fr, path.map((k) => k[1]), ease);
  const cy = interpolate(f, fr, path.map((k) => k[2]), ease);
  const g = ramp(f, fill, fill + 20, Easing.in(Easing.cubic));
  const R = 190 + g * 1900;
  const z = zoom + g * 1.5;
  const scene = children ?? <DemoScene />;
  // the glass tilts with its motion, like a hand moving it
  const vx = interpolate(f + 1, fr, path.map((k) => k[1]), ease) - cx;
  const tilt = Math.max(-10, Math.min(10, vx * 0.6));
  return (
    <AbsoluteFill>
      <AbsoluteFill>{scene}</AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${R}px at ${cx}px ${cy}px)` }}>
        <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${cx}px ${cy}px` }}>{scene}</AbsoluteFill>
        <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx - R * 0.35}px ${cy - R * 0.4}px, rgba(255,255,255,0.28), rgba(255,255,255,0) ${R * 0.6}px)` }} />
      </AbsoluteFill>
      {glass && (() => {
        const k = (R * 1.04) / glass.r;
        return (
          <div style={{ position: 'absolute', left: cx - glass.cx * k, top: cy - glass.cy * k, width: glass.w * k, height: glass.h * k, opacity: 1 - g,
            transform: `rotate(${tilt}deg)`, transformOrigin: `${glass.cx * k}px ${glass.cy * k}px`, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.45))' }}>
            <Img src={glass.src} style={{ width: '100%', height: '100%' }} />
          </div>
        );
      })()}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: glass ? 0 : 1 - g }}>
        <defs>
          <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" /><stop offset="0.3" stopColor="#B9C2CC" /><stop offset="0.55" stopColor="#F2F5F8" /><stop offset="0.8" stopColor="#7C8691" /><stop offset="1" stopColor="#DDE3EA" />
          </linearGradient>
          <linearGradient id="handle" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A3D44" /><stop offset="0.4" stopColor="#14161C" /><stop offset="1" stopColor="#05060A" /></linearGradient>
        </defs>
        <g transform={`translate(${cx} ${cy}) rotate(${tilt})`}>
          <g transform="rotate(-35)">
            <rect x={-26} y={R + 6} width={52} height={70} rx={10} fill="url(#chrome)" stroke="#2A2E38" strokeWidth={3} />
            <rect x={-34} y={R + 70} width={68} height={330} rx={30} fill="url(#handle)" stroke="#000" strokeWidth={3} />
            <rect x={-20} y={R + 90} width={10} height={290} rx={5} fill="#fff" opacity={0.18} />
          </g>
          <circle r={R + 10} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={30} />
          <circle r={R} fill="none" stroke="url(#chrome)" strokeWidth={22} />
          <circle r={R - 13} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={6} />
          <path d={`M ${-R * 0.62} ${-R * 0.5} A ${R * 0.8} ${R * 0.8} 0 0 1 ${-R * 0.1} ${-R * 0.8}`} stroke="#fff" strokeWidth={10} opacity={0.6} fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// a test pattern so the composition renders on its own
const DemoScene: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(160deg, #0d4f6b, #2f7f3f 45%, #c8a86a 70%, #1b4f7a)' }}>
    <svg width={1080} height={1920}>
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M 0 ${i * 160} H 1080 M ${i * 100} 0 V 1920`} stroke="#fff" strokeWidth={2} opacity={0.15} />)}
      <path d="M 700 760 l 26 44 h -52 Z" fill={C.red} stroke="#fff" strokeWidth={4} />
    </svg>
  </AbsoluteFill>
);
