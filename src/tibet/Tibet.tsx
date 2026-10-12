import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS } from '../darien/anim';
import { useDevanagariFont } from '../darien/DarienGap';
import { useMontserrat } from '../darien/Brand';
import { Watermark } from '../brand/Watermark';
import { useSerifFonts } from '../louisiana/Screen';
import { DURATION_S, PLANE, camAt, camMotion } from './cam';
import { MapCanvas, SEA_BG } from './Map';
import { PlaneLayers } from './Plane';
import { Fly, flyFade } from './Fly';
import { Globe } from './Globe';
import { C } from './cam';
import { clamp01, inOut, lerp, ramp } from '../darien/anim';
import { Grade, ScreenLayer, Subtitles, shake } from './Screen';

export const TIBET_DURATION = Math.ceil(DURATION_S * FPS);
export const HAS_AUDIO = true;

export const Tibet: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const t = useCurrentFrame() / FPS;
  useDevanagariFont();
  useMontserrat();
  useSerifFonts();
  const cam = camAt(t);
  const mv = camMotion(t);
  const bx = Math.min(14, Math.abs(mv.vx) * 0.3 + mv.zoom * 2);
  const by = Math.min(14, Math.abs(mv.vy) * 0.3 + mv.zoom * 2);
  const blurOn = bx > 0.6 || by > 0.6;
  const [sx, sy] = shake(t);
  const dark = 0;
  const gq = ramp(t, 0, 2.0, inOut);
  const globeA = 1 - ramp(t, 1.55, 2.15, inOut);
  const fly = flyFade(t);
  // satellite grade: a touch more colour and contrast than raw Sentinel-2; darkened for the count beat
  const grade = `saturate(${(1.0 - 0.6 * dark).toFixed(2)}) contrast(1.1) brightness(${(1.02 - 0.6 * dark).toFixed(2)}) hue-rotate(-4deg)`;
  return (
    <AbsoluteFill style={{ background: SEA_BG, overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="tbblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.02)` }}>
        <AbsoluteFill style={{ filter: blurOn ? 'url(#tbblur)' : undefined }}>
          <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h,
            transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
            <div style={{ position: 'absolute', inset: 0, filter: grade }}><MapCanvas cam={cam} /></div>
            <PlaneLayers t={t} c={cam} />
          </div>
        </AbsoluteFill>
        {globeA > 0.001 && (
          <AbsoluteFill style={{ opacity: globeA, background: 'radial-gradient(circle at 50% 45%, #10233f 0%, #050a14 70%)' }}>
            <Globe lon={lerp(20, 88, gq)} lat={lerp(18, 32, gq)} dist={lerp(3.6, 1.55, gq)} />
          </AbsoluteFill>
        )}
        {fly > 0.001 && <AbsoluteFill style={{ opacity: clamp01(fly * 1.3) }}><Fly t={t} /></AbsoluteFill>}
        <ScreenLayer t={t} c={cam} />
      </AbsoluteFill>
      <Grade t={t} />
      <div style={{ position: 'absolute', right: 22, bottom: 14, fontFamily: "'Montserrat', sans-serif", fontSize: 15, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · elevation: AWS Terrain Tiles (SRTM) · borders: Natural Earth
      </div>
      {captions && <Subtitles t={t} />}
      {captions && <Watermark t={t} />}
      {captions && HAS_AUDIO && <Audio src={staticFile('tibet/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
