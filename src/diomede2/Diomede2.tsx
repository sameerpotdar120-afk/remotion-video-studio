import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS, window4 } from '../darien/anim';
import { useDevanagariFont } from '../darien/DarienGap';
import { C, DURATION_S, PLANE, camAt, camSpeed } from './cam';
import { MapCanvas } from './Map';
import { Overlays } from './Overlays';
import { ScreenFX, ScreenLayer, Subtitles, shake, villageCover } from './Screen';

export const DIOMEDE2_DURATION = Math.ceil(DURATION_S * FPS);

export const Diomede2: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const t = useCurrentFrame() / FPS;
  useDevanagariFont();
  const cam = camAt(t);
  const blur = Math.min(9, Math.max(0, (camSpeed(t) - 1.4) * 1.4));
  // satellite gets the reference's dark teal grade near the islands; the ice beat brightens it
  const dark = window4(t, C.dono - 0.2, C.dono + 0.3, 99, 100);
  const ice = window4(t, C.jamkar, C.jamkar + 0.6, C.beech, C.beech + 0.4);
  const mapFilter = `saturate(${1 - 0.25 * dark}) brightness(${1 - 0.18 * dark + 0.15 * ice}) contrast(1.05)`;
  const [sx, sy] = shake(t);
  const covered = villageCover(t) >= 1;
  const credit = window4(t, 0, 0.3, DURATION_S - 0.6, DURATION_S);
  return (
    <AbsoluteFill style={{ background: '#081a2a', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.02)` }}>
        {!covered && (
          <AbsoluteFill style={{ filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
            <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h,
              transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
              <MapCanvas cam={cam} style={{ filter: mapFilter }} />
              <Overlays t={t} c={cam} />
            </div>
          </AbsoluteFill>
        )}
        <ScreenLayer t={t} c={cam} />
      </AbsoluteFill>
      <ScreenFX t={t} />
      {captions && <Subtitles t={t} />}
      {captions && (
        <div style={{ position: 'absolute', right: 24, bottom: 20, fontFamily: 'sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.55)', textShadow: '0 1px 2px rgba(0,0,0,0.8)', opacity: credit }}>
          Imagery: NASA Blue Marble · Sentinel-2 cloudless by EOX (Copernicus data 2016–2017) · © OpenStreetMap contributors · Natural Earth
        </div>
      )}
      {captions && <Audio src={staticFile('diomede/v2/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
