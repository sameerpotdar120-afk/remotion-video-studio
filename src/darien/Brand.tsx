import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { useDevanagariFont } from './DarienGap';

const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";

/** 800 x 800 channel logo: GPT-made Earth centred on India + the ND monogram (cropped to a circle by YouTube/Instagram). */
export const ProfilePic: React.FC<{ variant?: 'center' | 'low' }> = ({ variant = 'center' }) => {
  useDevanagariFont();
  const low = variant === 'low';
  return (
    <AbsoluteFill style={{ background: '#03060d', overflow: 'hidden' }}>
      <Img src={staticFile('brand/logo_globe_gpt.png')} style={{ position: 'absolute', left: -12, top: -12, width: 824, height: 824 }} />
      <AbsoluteFill style={{ background: low
        ? 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)'
        : 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 50%)' }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: low ? 'flex-end' : 'center' }}>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: low ? 250 : 320, letterSpacing: low ? -10 : -14, color: '#fff', lineHeight: 1,
          marginTop: low ? 0 : 24, marginBottom: low ? 105 : 0,
          WebkitTextStroke: low ? '10px #000' : '12px #000', paintOrder: 'stroke fill', textShadow: '0 0 40px rgba(0,0,0,0.6)',
        }}>
          N<span style={{ color: '#FFD21F' }}>D</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Banner: the world, lon -100..140, lat 72..-63, at 2560 x 1440
const bx = (lon: number) => ((lon + 100) / 240) * 2560;
const by = (lat: number) => ((72 - lat) / 135) * 1440;

// strange and dangerous places the channel covers (markers only, no labels)
const PLACES: { lon: number; lat: number; c: string }[] = [
  { lon: -77.5, lat: 8.0, c: '#3CFF6E' }, // Darién Gap
  { lon: -70, lat: 26, c: '#FF2B3D' }, // Bermuda Triangle
  { lon: -46.7, lat: -24.5, c: '#FFD21F' }, // Snake Island
  { lon: 30.1, lat: 51.4, c: '#FF2B3D' }, // Chernobyl
  { lon: 59.2, lat: 30.6, c: '#FFD21F' }, // Lut Desert
  { lon: 86.9, lat: 28.0, c: '#FFD21F' }, // Everest
  { lon: 92.2, lat: 11.6, c: '#FF2B3D' }, // North Sentinel Island
  { lon: 13.0, lat: -19.0, c: '#3CFF6E' }, // Skeleton Coast
];
const ROUTES: [number, number, number][] = [
  [0, 1, -80],
  [1, 3, -260],
  [3, 4, -90],
  [4, 5, -70],
  [5, 6, -50],
  [2, 7, 120],
];

export const Banner: React.FC = () => {
  useDevanagariFont();
  return (
    <AbsoluteFill style={{ background: '#04101f', overflow: 'hidden' }}>
      <Img src={staticFile('brand/banner_world.jpg')} style={{ position: 'absolute', inset: 0, width: 2560, height: 1440, filter: 'brightness(0.72) saturate(0.95)' }} />
      <svg width={2560} height={1440} style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 6px rgba(255,190,0,0.85))' }}>
        {ROUTES.map(([a, b, bend], i) => {
          const A = PLACES[a];
          const B = PLACES[b];
          const x1 = bx(A.lon), y1 = by(A.lat), x2 = bx(B.lon), y2 = by(B.lat);
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + bend;
          return <path key={i} d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} fill="none" stroke="#FFD21F" strokeWidth={4} strokeDasharray="14 11" strokeLinecap="round" opacity={0.9} />;
        })}
      </svg>
      {PLACES.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: bx(p.lon), top: by(p.lat) }}>
          {[34, 56].map((R, j) => (
            <div key={j} style={{ position: 'absolute', left: -R, top: -R, width: 2 * R, height: 2 * R, borderRadius: '50%',
              border: `4px solid ${p.c}`, opacity: j ? 0.35 : 0.7, boxShadow: `0 0 14px ${p.c}` }} />
          ))}
          <div style={{ position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: '#fff',
            boxShadow: `0 0 16px 7px ${p.c}` }} />
        </div>
      ))}
      {/* calm area behind the text, inside the 1546 x 423 mobile-safe strip */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 820px 300px at 1280px 720px, rgba(2,8,18,0.88) 0%, rgba(2,8,18,0.55) 60%, rgba(2,8,18,0) 100%)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, width: 2560, top: 560, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 158, lineHeight: 1, color: '#fff', letterSpacing: -2,
          textShadow: '0 6px 24px rgba(0,0,0,0.85)' }}>
          Null<span style={{ color: '#FFD21F', textShadow: '0 0 24px rgba(255,190,0,0.55), 0 6px 24px rgba(0,0,0,0.85)' }}>Dynasty</span>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 58, color: '#E8F4FF', marginTop: 24, textShadow: '0 3px 12px rgba(0,0,0,0.95)' }}>
          दुनिया की अनोखी और ख़तरनाक जगहें
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: '#8FF5A6', marginTop: 10, textShadow: '0 3px 12px rgba(0,0,0,0.95)' }}>
          सैटेलाइट maps पर · हिंदी में
        </div>
      </div>
    </AbsoluteFill>
  );
};
