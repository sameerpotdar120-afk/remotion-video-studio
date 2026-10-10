import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS } from '../darien/anim';
import { useDevanagariFont } from '../darien/DarienGap';
import { useMontserrat } from '../darien/Brand';
import { Watermark } from '../brand/Watermark';
import { DURATION_S, PLANE, camAt, camMotion } from './cam';
import { MapCanvas } from './Map';
import { PlaneLayers } from './Plane';
import { Grade, ScreenLayer, Subtitles, mapHidden, satAt, shake, useSerifFonts } from './Screen';

export const LOUISIANA_DURATION = Math.ceil(DURATION_S * FPS);
export const HAS_AUDIO = true;

export const Louisiana: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const t = useCurrentFrame() / FPS;
  useDevanagariFont();
  useMontserrat();
  useSerifFonts();
  const cam = camAt(t);
  const mv = camMotion(t);
  // directional motion blur from the camera's screen-space speed
  const bx = Math.min(14, Math.abs(mv.vx) * 0.3 + mv.zoom * 2);
  const by = Math.min(14, Math.abs(mv.vy) * 0.3 + mv.zoom * 2);
  const blurOn = bx > 0.6 || by > 0.6;
  const [sx, sy] = shake(t);
  return (
    <AbsoluteFill style={{ background: '#6f9a98', overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="lmblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.02)` }}>
        {!mapHidden(t) && (
          <AbsoluteFill style={{ filter: blurOn ? 'url(#lmblur)' : undefined }}>
            <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h,
              transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
              <MapCanvas cam={cam} sat={satAt(t)} />
              <PlaneLayers t={t} c={cam} />
            </div>
          </AbsoluteFill>
        )}
        <ScreenLayer t={t} c={cam} />
      </AbsoluteFill>
      <Grade t={t} />
      {captions && <Subtitles t={t} />}
      {captions && <Watermark t={t} />}
      {captions && HAS_AUDIO && <Audio src={staticFile('louisiana/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
