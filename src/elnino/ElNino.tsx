import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS, inOut, ramp, window4 } from '../darien/anim';
import { useDevanagariFont } from '../darien/DarienGap';
import { Watermark } from '../brand/Watermark';
import { C, DURATION_S, PERSP, PLANE, camAt, camMotion } from './cam';
import { MapCanvas, SST_DAYS } from './Map';
import { PlaneLayers } from './Plane';
import { Grade, ScreenLayer, Subtitles, mapGrade, mapHidden, shake } from './Screen';

export const ELNINO_DURATION = Math.ceil(DURATION_S * FPS);
export const HAS_AUDIO = false;

/** NOAA layer: today's anomaly at "अभी", then the June → October time-lapse at "अब". */
const sstAt = (t: number) => {
  const last = SST_DAYS.length - 1;
  const a1 = window4(t, C.abhi - 0.1, C.abhi + 0.5, C.hawayen - 0.4, C.hawayen + 0.2);
  const a2 = window4(t, C.ab - 0.15, C.ab + 0.35, C.yahan + 0.1, C.yahan + 0.6);
  if (a2 > 0) return { a: a2 * 0.92, day: last * ramp(t, C.ab + 0.25, C.taqatwar + 0.9, inOut) };
  return { a: a1 * 0.92, day: last };
};

export const ElNino: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const t = useCurrentFrame() / FPS;
  useDevanagariFont();
  const cam = camAt(t);
  const mv = camMotion(t);
  // directional motion blur from the camera's screen-space velocity (plus a little for zooms)
  const bx = Math.min(16, Math.abs(mv.vx) * 0.32 + mv.zoom * 2.2);
  const by = Math.min(16, Math.abs(mv.vy) * 0.32 + mv.zoom * 2.2);
  const blurOn = bx > 0.6 || by > 0.6;
  const [sx, sy] = shake(t);
  const hidden = mapHidden(t);
  const credit = window4(t, 0, 0.3, DURATION_S - 0.6, DURATION_S);
  return (
    <AbsoluteFill style={{ background: '#06121c', overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="mblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.03)` }}>
        {!hidden && (
          <AbsoluteFill style={{ filter: blurOn ? 'url(#mblur)' : undefined, perspective: PERSP, perspectiveOrigin: '540px 960px' }}>
            <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h,
              transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotateX(${cam.tilt}deg) rotate(${cam.rot}deg)`, filter: mapGrade(t) }}>
              <MapCanvas cam={cam} sst={sstAt(t)} />
              <PlaneLayers t={t} c={cam} />
            </div>
          </AbsoluteFill>
        )}
        <ScreenLayer t={t} c={cam} />
      </AbsoluteFill>
      <Grade t={t} />
      {captions && <Subtitles t={t} />}
      {captions && <Watermark t={t} />}
      {captions && (
        <div style={{ position: 'absolute', right: 24, bottom: 20, fontFamily: 'sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.55)', textShadow: '0 1px 2px rgba(0,0,0,0.8)', opacity: credit }}>
          Imagery: NASA Blue Marble · Sea temperature: NOAA OISST v2.1 · Natural Earth
        </div>
      )}
      {captions && HAS_AUDIO && <Audio src={staticFile('elnino/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
