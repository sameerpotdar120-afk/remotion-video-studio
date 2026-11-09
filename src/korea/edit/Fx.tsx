import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { DURATION_S, LOOPF } from './cam';

/** The map's CSS grade (house style, Lumetri "Creative" basics): S-curve contrast, vibrance, a touch of lift. */
export const MAP_GRADE = 'contrast(1.14) saturate(1.28) brightness(1.04)';

/** The house grade (from the UK weather video), no grain: teal split-tone into the shadows, warm highlights, a slowly
 *  drifting warm light leak, a vignette, darker top and bottom. Every motion is a whole number of cycles per loop. */
export const Grade: React.FC<{ t: number; board?: boolean }> = ({ t, board }) => {
  const lx = 50 + 38 * Math.sin(t * LOOPF(3) + 1.1), ly = 30 + 22 * Math.sin(t * LOOPF(2) + 0.4);
  const leak = 0.55 + 0.25 * Math.sin(t * LOOPF(8)) + 0.1 * Math.sin(t * LOOPF(27));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {!board && <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,92,118,0.34), rgba(0,70,96,0.18) 45%, rgba(0,60,90,0.3))', mixBlendMode: 'soft-light' }} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(255,176,96,0.2), rgba(255,140,60,0) 62%)', mixBlendMode: 'overlay' }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,196,128,0.32), rgba(255,140,70,0.08) 26%, rgba(255,120,60,0) 46%)`, mixBlendMode: 'screen', opacity: leak * (board ? 0.6 : 1) }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 56%, rgba(0,4,12,0.42) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.26), rgba(0,0,0,0) 18%, rgba(0,0,0,0) 76%, rgba(0,6,12,0.4))' }} />
    </AbsoluteFill>
  );
};

/** Two parallax layers of soft cloud (with ground shadows) drifting over the map; each moves a whole number of tiles
 *  per loop, so the last frame matches frame 0. */
const CLOUDS = staticFile('korea/fx/clouds.png');
export const Clouds: React.FC<{ t: number; a?: number }> = ({ t, a = 1 }) => {
  if (a <= 0.01) return null;
  const L = [{ size: 1500, kx: 1, ky: 0, o: 0.15, sh: 0.12, off: 0 }, { size: 2300, kx: 1, ky: -0, o: 0.1, sh: 0.08, off: 700 }];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: a }}>
      {L.map((l, i) => {
        const x = l.off + (t / DURATION_S) * l.size * l.kx, y = l.off * 0.6 + (t / DURATION_S) * l.size * l.ky;
        const base: React.CSSProperties = { position: 'absolute', inset: -200, backgroundImage: `url(${CLOUDS})`, backgroundSize: `${l.size}px ${l.size}px` };
        return (
          <React.Fragment key={i}>
            <div style={{ ...base, backgroundPosition: `${x + 46}px ${y + 70}px`, filter: 'brightness(0) blur(14px)', opacity: l.sh }} />
            <div style={{ ...base, backgroundPosition: `${x}px ${y}px`, opacity: l.o }} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** A highlight fill (house style): drop shadow, a breathing colour fill, a gloss, a light shimmer sweep, a pulsing glow
 *  edge and a crisp white edge. g = 0..1 grows it in. id must be unique per fill. */
export const HiFill: React.FC<{ d: string; color: string; t: number; g?: number; id: string; alpha?: number; edge?: number; box?: [number, number, number, number] }> = ({ d, color, t, g = 1, id, alpha = 0.7, edge = 4, box = [0, 0, 1080, 1920] }) => {
  if (g <= 0) return null;
  const breathe = 1 + 0.07 * Math.sin(t * LOOPF(40) + id.length);
  const sweep = ((t * 0.45 + id.length * 0.13) % 1.6) - 0.3;
  const [x0, y0, x1, y1] = box;
  return (
    <g opacity={Math.min(1, g * 1.4)}>
      <defs>
        <linearGradient id={`sh_${id}`} gradientUnits="userSpaceOnUse" x1={x0 + (x1 - x0) * (sweep - 0.25)} y1={y0} x2={x0 + (x1 - x0) * (sweep + 0.25)} y2={y1}>
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.32" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`gl_${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.3" /><stop offset="0.55" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <clipPath id={`cl_${id}`}><path d={d} /></clipPath>
      </defs>
      <path d={d} fill="#000" opacity={0.35 * g} transform="translate(6 12)" filter="url(#glow)" />
      <path d={d} fill={color} opacity={alpha * g * breathe} />
      <path d={d} fill={`url(#gl_${id})`} opacity={g} />
      <rect x={-200} y={-200} width={1480} height={2320} fill={`url(#sh_${id})`} clipPath={`url(#cl_${id})`} opacity={g} />
      <path d={d} fill="none" stroke={color} strokeWidth={edge * 3.5 * (0.8 + 0.4 * Math.sin(t * LOOPF(53) + id.length))} filter="url(#glow)" opacity={0.85 * g} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={edge} opacity={g} />
    </g>
  );
};
