import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS } from '../darien/anim';
import { useDevanagariFont } from '../darien/DarienGap';
import { useMontserrat } from '../darien/Brand';
import { Watermark } from '../brand/Watermark';
import { useSerifFonts } from '../louisiana/Screen';
import { DURATION_S, PLANE, camAt, camMotion } from './cam';
import { MapCanvas, SEA_BG } from './Map';
import { PlaneLayers, landAt } from './Plane';
import { Grade, ScreenLayer, Subtitles, satAt, shake } from './Screen';

export const MUMBAI_DURATION = Math.ceil(DURATION_S * FPS);
export const HAS_AUDIO = true;

export const Mumbai: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
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
  const sat = satAt(t);
  return (
    <AbsoluteFill style={{ background: SEA_BG, overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="mmblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.02)` }}>
        <AbsoluteFill style={{ filter: blurOn ? 'url(#mmblur)' : undefined }}>
          <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h }}>
            <MapCanvas cam={cam} sat={sat} land={landAt(t)} />
            <PlaneLayers t={t} c={cam} sat={sat} />
          </div>
        </AbsoluteFill>
        <ScreenLayer t={t} c={cam} />
      </AbsoluteFill>
      <Grade t={t} sat={sat} />
      <div style={{ position: 'absolute', right: 22, bottom: 14, fontFamily: "'Montserrat', sans-serif", fontSize: 15, color: '#fff', opacity: 0.55,
        textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right' }}>
        {sat > 0.5 ? 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · coastline © OpenStreetMap contributors' : 'Map: © OpenStreetMap contributors, Natural Earth'}
      </div>
      {captions && <Subtitles t={t} />}
      {captions && <Watermark t={t} />}
      {captions && HAS_AUDIO && <Audio src={staticFile('mumbai/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
