import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HEAD, useTZFonts } from '../../timezones/fonts';
import { Cam, PLANE, merc } from './cam';
import { MapCanvas } from './Map';
import { Clouds, Grade, IMG, MAP_GRADE } from './Fx';
import { P01ShipQueue } from '../motion/P01ShipQueue';
import { P04Sticker } from '../motion/P04Sticker';
import { NUM, useFonts } from '../motion/font';

/**
 * The cover for YouTube Shorts and Instagram Reels: the line of ships in the canal's Pacific approach on the
 * GeoLayers-style map, the gold LPG carrier mid-overtake, "PANAMA CANAL / सूख रही है" on top and the $5.3M price
 * across the middle. Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const PcCover: React.FC<{ text?: boolean; res?: number }> = ({ text = true, res = 1 }) => {
  useTZFonts();
  useFonts();
  const [x, y] = merc(-79.515, 8.862);
  const cam: Cam = { x, y, span: 1.6e4, rot: -2 };
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.06, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.6)' };
  return (
    <AbsoluteFill style={{ background: '#0A1A2E', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h, filter: MAP_GRADE, transform: 'rotate(-2deg)', transformOrigin: `${PLANE.ox}px ${PLANE.oy}px` }}>
        <MapCanvas cam={cam} res={res} />
      </div>
      <Clouds t={12} />
      <P01ShipQueue angle={-118} overtake={200} goldAt={0.45} ship={IMG('pc02_container_ship_top')} gold={IMG('pc01_lpg_carrier_top')} fo={240} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,20,0.6), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 66%, rgba(0,8,20,0.5))' }} />
      <Grade frame={300} />
      {text && (
        <>
          <div style={{ position: 'absolute', left: 0, top: 230, width: 1080, height: 500, transform: 'scale(1.12)', transformOrigin: '50% 0' }}><P04Sticker fo={40} /></div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center' }}>
            <div style={{ fontFamily: NUM, fontSize: 190, color: '#FFD53D', letterSpacing: 2, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 0 40px rgba(255,200,60,0.7), 0 10px 30px rgba(0,0,0,0.6)', transform: 'rotate(-4deg)' }}>$5,300,000</div>
            <div style={{ ...big, fontSize: 96, color: '#fff', marginTop: 10 }}>सिर्फ़ line तोड़ने के लिए</div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
