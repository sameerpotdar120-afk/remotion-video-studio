import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HEAD, useTZFonts } from '../../timezones/fonts';
import { Cam, PLANE, merc } from './cam';
import { MapCanvas } from './Map';
import { Shapes } from './Shapes';
import { GEO } from './cam';
import { RainLayer } from '../motion/U02WeatherMontage';
import { P0, Tourist } from '../motion/Tourist';

/**
 * The cover for YouTube Shorts and Instagram Reels: Britain on the GeoLayers-style map under a storm (rain, a lightning
 * bolt), the tourist below with his umbrella blown inside out, the hook above. Everything that matters sits inside the
 * 3:4 crop (y 240–1680).
 */
export const UkCover: React.FC<{ text?: boolean; res?: number }> = ({ text = true, res = 1 }) => {
  useTZFonts();
  const [x, y] = merc(-3.2, 53.6);
  const cam: Cam = { x, y, span: 2.5e6, rot: 0 };
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.06, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.6)' };
  return (
    <AbsoluteFill style={{ background: '#0A1A2E', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h }}>
        <MapCanvas cam={cam} res={res} />
        <Shapes c={cam} t={10} regions={[{ key: 'cv', rings: GEO.uk, a: 1, color: '#2F7FE0', phase: 0, sat: 0.62, edge: '#BFE2FF' }]} starts={{}} />
      </div>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,20,0.7), rgba(0,0,0,0) 34%, rgba(0,0,0,0) 62%, rgba(0,8,20,0.55))' }} />
      <AbsoluteFill style={{ background: 'rgba(30,60,110,0.25)', mixBlendMode: 'multiply' }} />
      <RainLayer f={37} a={0.75} n={140} angle={18} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {[[26, '#5FB4FF', 0.35], [12, '#CFE8FF', 0.8], [5, '#FFFFFF', 1]].map(([w, c, o]) => (
          <g key={String(w)} fill="none" stroke={String(c)} strokeWidth={Number(w)} strokeLinejoin="round" strokeLinecap="round" opacity={Number(o)} style={{ filter: Number(w) > 20 ? 'blur(8px)' : undefined }}>
            <path d="M 520 -20 L 470 140 L 560 200 L 480 380 L 590 430 L 520 610 L 640 660 L 600 820" />
            <path d="M 560 200 L 650 300 L 630 380" />
            <path d="M 590 430 L 520 520" />
          </g>
        ))}
      </svg>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform="translate(560 1650) rotate(8) scale(0.78)">
          <Tourist f={40} pose={{ ...P0, outfit: 'coat', umbrella: 'inside', open: 1, mouth: 'oh', brow: 1, lean: -8, hair: 1, arm: 22 }} />
        </g>
      </svg>
      {text && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center' }}>
          <div style={{ ...big, fontSize: 118, color: '#fff' }}>1 दिन में 4 मौसम</div>
          <div style={{ ...big, fontSize: 118, color: '#F5F23A' }}>Britain का मौसम 🤯</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
