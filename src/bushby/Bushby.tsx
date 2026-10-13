import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS, inOut, lerp, ramp, window4 } from './anim2';
import { useMontserrat } from '../darien/Brand';
import { Watermark } from '../brand/Watermark';
import { C, DURATION_S, FLAT0, FLAT1, FLAT2, PLANE, camAt, camMotion } from './cam';
import { useBBFonts } from './fonts';
import { Globe } from './Globe';
import { MapCanvas, SEA_BG } from './Map';
import { PlaneLayers } from './Plane';
import { Grade, ScreenLayer, Subtitles, gradeAt, shake } from './Screen';

export const BUSHBY_DURATION = Math.ceil(DURATION_S * FPS);
export const HAS_AUDIO = true;

/** Globe camera: the hook drifts over the Americas then dives to Chile; the pull-out spins the whole planet west to England. */
const globeCam = (t: number) => {
  if (t < FLAT0 + 0.5) {
    const q = ramp(t, 0, C.kyon3 + 0.3, inOut), z = ramp(t, C.kyon3 + 0.2, FLAT0 + 0.4, inOut);
    return { lon: lerp(lerp(-25, -62, q), -70.9, z), lat: lerp(lerp(12, -18, q), -50, z), dist: lerp(lerp(3.15, 2.85, q), 1.42, z), pin: null };
  }
  const q = ramp(t, FLAT1 - 0.3, FLAT2 - 0.7, inOut), z = ramp(t, FLAT2 - 0.8, FLAT2 + 0.3, inOut);
  return { lon: lerp(lerp(-75, -360.3, q), -360.3, z), lat: lerp(lerp(8, 48, q), 53.7, z), dist: lerp(3.2, 1.5, z), pin: [-0.33, 53.74] as [number, number] };
};

export const Bushby: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const t = useCurrentFrame() / FPS;
  useBBFonts();
  useMontserrat();
  const globe = Math.max(1 - ramp(t, FLAT0 - 0.35, FLAT0 + 0.35, inOut), window4(t, FLAT1 - 0.35, FLAT1 + 0.25, FLAT2 - 0.35, FLAT2 + 0.35));
  const cam = camAt(t);
  const mv = camMotion(t);
  const bx = Math.min(9, Math.abs(mv.vx) * 0.22 + mv.zoom * 1.2);
  const by = Math.min(9, Math.abs(mv.vy) * 0.22 + mv.zoom * 1.2);
  const blurOn = bx > 0.6 || by > 0.6;
  const [sx, sy] = shake(t);
  const g = gradeAt(t);
  const sat = 1.18 - 0.5 * g.drain - 0.25 * g.cold;
  const grade = `saturate(${sat.toFixed(2)}) contrast(1.14) brightness(${(1.0 - 0.06 * g.cold).toFixed(2)}) hue-rotate(${(-4 + 8 * g.cold).toFixed(1)}deg)`;
  const gc = globeCam(t);
  return (
    <AbsoluteFill style={{ background: SEA_BG, overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="bbblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.03)` }}>
        {globe < 0.999 && (
          <AbsoluteFill style={{ filter: blurOn ? 'url(#bbblur)' : undefined }}>
            <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h,
              transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
              <div style={{ position: 'absolute', inset: 0, filter: grade }}><MapCanvas cam={cam} /></div>
              <PlaneLayers t={t} c={cam} />
            </div>
          </AbsoluteFill>
        )}
        {globe > 0.001 && (
          <AbsoluteFill style={{ opacity: globe, background: 'radial-gradient(circle at 50% 45%, #10233f 0%, #050a14 70%)' }}>
            <Globe lon={gc.lon} lat={gc.lat} dist={gc.dist} pin={gc.pin} />
          </AbsoluteFill>
        )}
        <Grade t={t} />
        <ScreenLayer t={t} c={cam} globe={globe} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', right: 22, bottom: 14, fontFamily: "'Montserrat', sans-serif", fontSize: 15, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · borders: Natural Earth · route approximate · Karl: AI illustration
      </div>
      {captions && <Subtitles t={t} />}
      {captions && <Watermark t={t} />}
      {captions && HAS_AUDIO && <Audio src={staticFile('bushby/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
