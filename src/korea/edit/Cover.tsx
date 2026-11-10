import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Cam, GEO, ll, merc, ringsD } from './cam';
import { Badge } from './Flags';
import { Clouds, Grade, HiFill, MAP_GRADE } from './Fx';
import { UI, useFonts } from './font';
import { Stopwatch } from './Korea';
import { MapLayers } from './Map';

/**
 * The cover for YouTube Shorts and Instagram Reels: the peninsula on the satellite map, North red and South blue with
 * their flags, the 38th parallel as a thick glowing pencil line with the pencil at its end, a stopwatch, and the hook
 * "30 मिनट की लाइन". Everything that matters sits inside the 3:4 crop (y 240-1680).
 */
const INK = '#0B1830';
export const KoCover: React.FC = () => {
  useFonts();
  const c: Cam = { x: merc(127.4, 0)[0], y: merc(0, 37.7)[1], mpp: 760 };
  const [x0, y] = ll(c, 122.5, 38), [x1] = ll(c, 129.75, 38);
  const st = (size: number) => ({ fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.05, WebkitTextStroke: `${Math.round(size / 10)}px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap', textShadow: '0 10px 24px rgba(0,0,0,0.6)' } as const);
  const [nx, ny] = ll(c, 126.9, 39.25), [sx, sy] = ll(c, 128.0, 36.2);
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={c} /></AbsoluteFill>
      <Clouds t={10} a={0.6} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs><filter id="glow"><feGaussianBlur stdDeviation="6" /></filter><filter id="glow2"><feGaussianBlur stdDeviation="18" /></filter></defs>
        <HiFill id="nk" t={10} d={ringsD(c, GEO.countries.NK)} color="#E8343B" alpha={0.72} edge={5} />
        <HiFill id="sk" t={10} d={ringsD(c, GEO.countries.SK)} color="#2F6BFF" alpha={0.72} edge={5} />
        <path d={`M${x0},${y}L${x1},${y}`} stroke="#FFE27A" strokeWidth={60} filter="url(#glow2)" opacity={0.9} />
        <path d={`M${x0},${y}L${x1},${y}`} stroke="#fff" strokeWidth={22} strokeLinecap="round" />
        <path d={`M${x0},${y}L${x1},${y}`} stroke="#E0221B" strokeWidth={10} strokeDasharray="34 16" strokeLinecap="round" />
        {/* the pencil at the line's east end */}
        <g transform={`translate(${x1 + 6} ${y}) rotate(-35)`} style={{ filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.6))' }}>
          <path d="M0 0 L46 -16 L46 16 Z" fill="#F2C38B" stroke="#3A2A1A" strokeWidth={3} />
          <path d="M0 0 L14 -5 L14 5 Z" fill="#222" />
          <rect x={46} y={-16} width={250} height={32} fill="#FFC21A" stroke="#3A2A1A" strokeWidth={3} />
          <rect x={46} y={-5} width={250} height={10} fill="#E5A800" />
          <rect x={296} y={-16} width={26} height={32} fill="#B9B9B9" stroke="#3A2A1A" strokeWidth={3} />
          <rect x={322} y={-16} width={34} height={32} rx={8} fill="#F08A9A" stroke="#3A2A1A" strokeWidth={3} />
        </g>
      </svg>
      <Grade t={10} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, height: 280, background: 'linear-gradient(180deg, rgba(5,10,20,0.78), rgba(5,10,20,0))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 268, textAlign: 'center' }}>
        <span style={{ ...st(150), color: '#FFC21A' }}>30 मिनट</span><br />
        <span style={{ ...st(118), color: '#fff' }}>की लाइन</span>
      </div>
      <div style={{ position: 'absolute', left: nx - 70, top: ny - 70 }}><Badge id="kp" r={64} /></div>
      <div style={{ position: 'absolute', left: sx - 70, top: sy - 70 }}><Badge id="kr" r={64} /></div>
      <div style={{ position: 'absolute', left: 760, top: 1250, transform: 'rotate(10deg)' }}><Stopwatch p={0.5} size={250} /></div>
    </AbsoluteFill>
  );
};
