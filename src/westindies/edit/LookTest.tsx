import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { useMontserrat } from '../../darien/Brand';
import { DURATION_S, PLANE, camAt, camMotion, shake } from './cam';
import { Grade, MAP_GRADE, MapFx, regionsAt } from './Fx';
import { MapCanvas } from './Map';
import { Shapes } from './Shapes';
import { useFonts } from '../motion/font';

export const WI_TEST_60 = Math.ceil(DURATION_S * 60);

/** The dark-map look test: lines 1–4 of the West Indies script on estimated timings (no VO yet). The dark Midnight
 *  plates, the eased camera with motion blur on every whip, the outline, the island tour fills and names, the 13, the
 *  territories, the crosses. 1080×1920 at 60 fps. */
export const WILookTest: React.FC<{ res?: number }> = ({ res = 1 }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  useMontserrat();
  useFonts();
  const cam = camAt(t);
  const mv = camMotion(t);
  const blurK = (30 / fps) ** 0.5;
  const bx = Math.min(16, Math.abs(mv.vx) * 0.22 + mv.zoom * 1.4) * blurK;
  const by = Math.min(16, Math.abs(mv.vy) * 0.22 + mv.zoom * 1.4) * blurK;
  const [sx, sy] = shake(t);
  return (
    <AbsoluteFill style={{ background: '#030b12', overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="wiblur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" /></filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.03)` }}>
        <AbsoluteFill style={{ filter: (Math.max(bx, by) > 0.6 ? 'url(#wiblur) ' : '') + MAP_GRADE }}>
          <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h, transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
            <MapCanvas cam={cam} res={res} />
            <Shapes c={cam} t={t} regions={regionsAt(t)} />
          </div>
        </AbsoluteFill>
        <MapFx t={t} c={cam} />
        <Grade t={t} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', right: 22, bottom: 14, left: 22, fontFamily: "'Montserrat', sans-serif", fontSize: 14, color: '#fff', opacity: 0.5, textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles (SRTM/NASA, ETOPO1/NOAA) · borders: Natural Earth
      </div>
      <Watermark t={t} />
    </AbsoluteFill>
  );
};
