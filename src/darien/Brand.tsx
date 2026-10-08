import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { useDevanagariFont } from './DarienGap';
import { GEO, LINES, LonLat, RINGS } from './geo';

const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";

type View = { west: number; north: number; ppd: number };

const AMERICAS = { src: 'darien/maps/map_americas.jpg', west: -180, north: 84, ppd: 60, w: 9000, h: 8640 };
const DARIEN = { src: 'darien/maps/map_darien.jpg', west: -84.5, north: 11, ppd: 512, w: 4608, h: 4096 };

const xy = (v: View, [lon, lat]: LonLat) => [(lon - v.west) * v.ppd, (v.north - lat) * v.ppd];
const ringD = (v: View, r: LonLat[]) => 'M' + r.map((p) => xy(v, p).map((n) => n.toFixed(1)).join(',')).join('L') + 'Z';
const lineD = (v: View, r: LonLat[]) => 'M' + r.map((p) => xy(v, p).map((n) => n.toFixed(1)).join(',')).join('L');

const Plate: React.FC<{ v: View; plate: typeof AMERICAS }> = ({ v, plate }) => {
  const k = v.ppd / plate.ppd;
  return (
    <Img
      src={staticFile(plate.src)}
      style={{
        position: 'absolute',
        left: (plate.west - v.west) * v.ppd,
        top: (v.north - plate.north) * v.ppd,
        width: plate.w * k,
        height: plate.h * k,
        maxWidth: 'none',
      }}
    />
  );
};

const Region: React.FC<{ v: View; w: number; h: number; stroke: number }> = ({ v, w, h, stroke }) => (
  <svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
    <path d={ringD(v, RINGS.region[0])} fill="rgba(52,222,82,0.5)" stroke="#C8FFD4" strokeWidth={stroke} strokeLinejoin="round"
      style={{ filter: `drop-shadow(0 0 ${stroke * 4}px rgba(60,255,110,0.9)) drop-shadow(0 0 ${stroke * 10}px rgba(40,220,90,0.6))` }} />
  </svg>
);

/** 800 x 800 profile picture (YouTube and Instagram crop it to a circle). */
export const ProfilePic: React.FC = () => {
  useDevanagariFont();
  const [cx, cy] = GEO.regionCenter;
  const v: View = { west: cx - 800 / 2 / 300, north: cy + 0.15 + 800 / 2 / 300, ppd: 300 };
  return (
    <AbsoluteFill style={{ background: '#04101f', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, filter: 'brightness(0.55) saturate(0.85)' }}>
        <Plate v={v} plate={DARIEN} />
      </div>
      <Region v={v} w={800} h={800} stroke={4} />
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.75) 72%)' }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: 330, letterSpacing: -14, color: '#fff', lineHeight: 1,
          WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', marginTop: 20,
          textShadow: '0 0 40px rgba(0,0,0,0.7)',
        }}>
          N<span style={{ color: '#FFD21F' }}>D</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 2560 x 1440 YouTube banner; text and region stay inside the 1546 x 423 mobile-safe strip. */
export const Banner: React.FC = () => {
  useDevanagariFont();
  const [rlon, rlat] = GEO.regionCenter;
  const ppd = 60;
  // put the Darién at x≈1820, y≈720
  const v: View = { west: rlon - 1820 / ppd, north: rlat + 720 / ppd, ppd };
  return (
    <AbsoluteFill style={{ background: '#04101f', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, filter: 'brightness(0.8) saturate(0.95)' }}>
        <Plate v={v} plate={AMERICAS} />
      </div>
      <svg width={2560} height={1440} style={{ position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 0 8px rgba(255,190,0,0.9))' }}>
        <path d={lineD(v, LINES.hwNorth)} fill="none" stroke="#FFD21F" strokeWidth={7} strokeDasharray="20 13" strokeLinecap="round" />
        <path d={lineD(v, LINES.hwSouth)} fill="none" stroke="#FFD21F" strokeWidth={7} strokeDasharray="20 13" strokeLinecap="round" />
      </svg>
      <Region v={v} w={2560} h={1440} stroke={3} />
      {/* darken the left of the safe strip for the text */}
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(2,8,18,0.85) 0%, rgba(2,8,18,0.7) 45%, rgba(2,8,18,0) 68%)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)' }} />
      <div style={{ position: 'absolute', left: 560, top: 545, width: 1100 }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, lineHeight: 1, color: '#fff', letterSpacing: -2,
          textShadow: '0 6px 24px rgba(0,0,0,0.8)' }}>
          Null<span style={{ color: '#FFD21F', textShadow: '0 0 24px rgba(255,190,0,0.6), 0 6px 24px rgba(0,0,0,0.8)' }}>Dynasty</span>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 56, color: '#E8F4FF', marginTop: 26,
          textShadow: '0 3px 12px rgba(0,0,0,0.9)' }}>
          दुनिया की अनोखी और ख़तरनाक जगहें
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: '#8FF5A6', marginTop: 10,
          textShadow: '0 3px 12px rgba(0,0,0,0.9)' }}>
          सैटेलाइट maps पर · हिंदी में
        </div>
      </div>
    </AbsoluteFill>
  );
};
