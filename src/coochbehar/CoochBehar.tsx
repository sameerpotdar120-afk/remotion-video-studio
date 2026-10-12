import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS } from '../darien/anim';
import { useMontserrat } from '../darien/Brand';
import { Watermark } from '../brand/Watermark';
import { DURATION_S, PLANE, camAt, camMotion } from './cam';
import { useCBFonts } from './fonts';
import { MapCanvas, SEA_BG } from './Map';
import { PlaneLayers, coldAt, nightAt, pastAt } from './Plane';
import { Grade, ScreenLayer, Subtitles, shake } from './Screen';

export const COOCHBEHAR_DURATION = Math.ceil(DURATION_S * FPS);
export const HAS_AUDIO = true;

export const CoochBehar: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const t = useCurrentFrame() / FPS;
  useCBFonts();
  useMontserrat();
  const cam = camAt(t);
  const mv = camMotion(t);
  const bx = Math.min(16, Math.abs(mv.vx) * 0.3 + mv.zoom * 2.2);
  const by = Math.min(16, Math.abs(mv.vy) * 0.3 + mv.zoom * 2.2);
  const blurOn = bx > 0.6 || by > 0.6;
  const [sx, sy] = shake(t);
  const night = Math.min(1, nightAt(t)), past = pastAt(t), cold = coldAt(t);
  // satellite grade (Lumetri-style): richer greens, deeper contrast; drained for the past and the 68 years, darker at night
  const sat = 1.18 - 0.45 * past - 0.4 * cold - 0.35 * night;
  const bri = 1.0 - 0.38 * night - 0.06 * cold;
  const grade = `saturate(${sat.toFixed(2)}) contrast(${(1.14 + 0.06 * past).toFixed(2)}) brightness(${bri.toFixed(2)}) hue-rotate(${(-6 + 10 * night).toFixed(1)}deg)`;
  return (
    <AbsoluteFill style={{ background: SEA_BG, overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="cbblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.03)` }}>
        <AbsoluteFill style={{ filter: blurOn ? 'url(#cbblur)' : undefined }}>
          <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h,
            transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
            <div style={{ position: 'absolute', inset: 0, filter: grade }}><MapCanvas cam={cam} /></div>
            <PlaneLayers t={t} c={cam} />
          </div>
        </AbsoluteFill>
        <Grade t={t} night={night} past={past} cold={cold} />
        <ScreenLayer t={t} c={cam} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', right: 22, bottom: 14, fontFamily: "'Montserrat', sans-serif", fontSize: 15, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · borders: Natural Earth · enclave dots illustrative
      </div>
      {captions && <Subtitles t={t} />}
      {captions && <Watermark t={t} />}
      {captions && HAS_AUDIO && <Audio src={staticFile('coochbehar/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
