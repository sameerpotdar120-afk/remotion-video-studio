import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS, ramp, window4 } from '../darien/anim';
import { useDevanagariFont } from '../darien/DarienGap';
import { PLANE, camAt, camSpeed } from './cam';
import { MapCanvas } from './Map';
import { Overlays } from './Overlays';
import { ScreenFX, ScreenLayer, Subtitles, insertCover, shake } from './Screen';

export const SENTINEL_DURATION = Math.ceil(68.8 * FPS);

export const Sentinel: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const t = useCurrentFrame() / FPS;
  useDevanagariFont();
  const cam = camAt(t);
  const blur = Math.min(9, Math.max(0, (camSpeed(t) - 1.4) * 1.4));
  // the reference's map: dark, slightly desaturated; the ocean beat turns vivid cyan
  const vivid = window4(t, 24.5, 25.2, 27.6, 28.3);
  const mapFilter = `saturate(${0.88 + 0.75 * vivid}) brightness(${0.92 + 0.2 * vivid}) contrast(1.05) hue-rotate(${-6 * vivid}deg)`;
  const [sx, sy] = shake(t);
  const covered = insertCover(t) >= 1;
  const credit = window4(t, 0, 0.3, 68.3, 68.8);

  return (
    <AbsoluteFill style={{ background: '#071624', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.02)` }}>
        {!covered && (
          <AbsoluteFill style={{ filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
            <div style={{
              position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h,
              transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)`,
            }}>
              <MapCanvas cam={cam} style={{ filter: mapFilter }} />
              <Overlays t={t} c={cam} />
            </div>
          </AbsoluteFill>
        )}
        <ScreenLayer t={t} />
      </AbsoluteFill>
      <ScreenFX t={t} />
      {captions && <Subtitles t={t} />}
      {captions && (
        <div style={{ position: 'absolute', right: 24, bottom: 20, fontFamily: 'sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.55)',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right', opacity: credit * (1 - ramp(t, 14.6, 14.7) + ramp(t, 19.38, 19.5)) }}>
          Imagery: NASA Blue Marble · Sentinel-2 cloudless by EOX (Copernicus data 2016–2017) · © OpenStreetMap contributors · Scenes are illustrations
        </div>
      )}
      {captions && <Audio src={staticFile('sentinel/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
