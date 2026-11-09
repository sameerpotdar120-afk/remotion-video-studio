import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Cam, GEO, merc, ringsD, toS } from './cam';
import { Clouds, Grade, HiFill, MAP_GRADE } from './Fx';
import { UI, useFonts } from './font';
import { MapLayers } from './Map';

/**
 * The cover for YouTube Shorts and Instagram Reels: frame 0's Mercator world, Greenland lit yellow and huge, India
 * orange and small, each named, the hook "भारत > ग्रीनलैंड?" above and a red "नक्शा झूठा?" sticker below.
 * Everything that matters sits inside the 3:4 crop (y 240-1680).
 */
const INK = '#0B1830';
export const MsCover: React.FC = () => {
  useFonts();
  const c: Cam = { x: merc(13, 0)[0], y: 7.6e6, mpp: 19500 };
  const st = (size: number) => ({ fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.1, WebkitTextStroke: `${Math.round(size / 10)}px ${INK}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap', textShadow: '0 10px 24px rgba(0,0,0,0.55)' } as const);
  const [gx, gy] = toS(c, merc(-41, 72));
  const [ix, iy] = toS(c, merc(...GEO.centroids.India));
  const label = (x: number, y: number, text: string, color: string, size: number) => (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', ...st(size), color }}>{text}</div>
  );
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={c} /></AbsoluteFill>
      <Clouds t={10} a={0.8} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <HiFill id="gl" t={10} d={ringsD(c, GEO.countries.Greenland)} color="#FFC21A" alpha={0.85} edge={6} />
        <HiFill id="in" t={10} d={ringsD(c, GEO.countries.India)} color="#FF7A12" alpha={0.85} edge={6} />
      </svg>
      <Grade t={10} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, height: 200, background: 'linear-gradient(180deg, rgba(5,10,20,0.75), rgba(5,10,20,0))' }} />
      {label(540, 320, 'भारत > ग्रीनलैंड?', '#fff', 124)}
      {label(Math.max(250, gx + 20), gy + 30, 'ग्रीनलैंड', '#FFC21A', 96)}
      {label(Math.min(860, ix - 10), iy + 175, 'भारत', '#FF7A12', 110)}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1490, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '0 44px', background: 'linear-gradient(180deg, #E2333A, #A8161D)', border: '8px solid #fff', borderRadius: 22, transform: 'rotate(-3deg)', boxShadow: '0 14px 30px rgba(0,0,0,0.55)' }}>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 110, lineHeight: 1.3, color: '#fff' }}>नक्शा <span style={{ color: '#FFD23F' }}>झूठा?</span></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
