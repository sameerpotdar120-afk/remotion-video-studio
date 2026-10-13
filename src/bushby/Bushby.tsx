import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS, inOut, lerp, ramp, window4 } from './anim2';
import { useMontserrat } from '../darien/Brand';
import { Watermark } from '../brand/Watermark';
import { C, DURATION_S, FLAT0, FLAT1, FLAT2, GEO, PLANE, camAt, camMotion } from './cam';
import { useBBFonts } from './fonts';
import { Globe } from './Globe';
import { MapCanvas, SEA_BG } from './Map';
import { PlaneLayers } from './Plane';
import { Grade, ScreenLayer, Subtitles, Whips, gradeAt, hookRoute, shake } from './Screen';

export const BUSHBY_DURATION = Math.ceil(DURATION_S * FPS);
export const HAS_AUDIO = true;

/** Where along the route (lon/lat, unwrapped) a fractional point index lands. */
const llAt = (k: number): [number, number] => {
  const ll = GEO.route_ll;
  const i = Math.max(0, Math.min(ll.length - 2, Math.floor(k)));
  const f = Math.min(1, Math.max(0, k - i));
  return [ll[i][0] + (ll[i + 1][0] - ll[i][0]) * f, ll[i][1] + (ll[i + 1][1] - ll[i][1]) * f];
};
const N = GEO.route_ll.length - 1;

/** Globe camera: the hook chases the line around the planet (Chile → Alaska → Siberia → Hull), swings back west to Chile and dives;
 *  the pull-out spins the whole planet west to England. */
const globeCam = (t: number) => {
  if (t < FLAT0 + 0.5) {
    const head = llAt(hookRoute(t) * N);
    // chase the head with a little lag, never too far from the equator so the globe stays readable
    const lag = llAt(Math.max(0, hookRoute(Math.max(0, t - 0.5)) * N));
    const chase = { lon: lerp(head[0], lag[0], 0.4), lat: Math.max(-35, Math.min(55, lerp(head[1], lag[1], 0.4) * 0.8)) };
    const back = ramp(t, C.plan3 + 0.2, C.kyon3, inOut), z = ramp(t, C.kyon3, FLAT0 + 0.4, inOut);
    const lon = lerp(lerp(chase.lon, -431, back), -430.9, z);
    const lat = lerp(lerp(chase.lat, -22, back), -50, z);
    const dist = lerp(lerp(2.55 + 0.25 * Math.sin(t * 0.9), 3.05, back), 1.42, z);
    return { lon, lat, dist, pin: t < C.plan3 + 0.4 ? head : null, route: hookRoute(t) };
  }
  const q = ramp(t, FLAT1 - 0.3, FLAT2 - 0.7, inOut), z = ramp(t, FLAT2 - 0.8, FLAT2 + 0.3, inOut);
  return { lon: lerp(lerp(-75, -360.3, q), -360.3, z), lat: lerp(lerp(8, 48, q), 53.7, z), dist: lerp(3.2, 1.5, z), pin: [-0.33, 53.74] as [number, number], route: 1 };
};

export const Bushby: React.FC<{ captions?: boolean; screen?: boolean }> = ({ captions = true, screen = true }) => {
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
            <Globe lon={gc.lon} lat={gc.lat} dist={gc.dist} pin={gc.pin} route={gc.route} />
          </AbsoluteFill>
        )}
        <Grade t={t} />
        {screen && <ScreenLayer t={t} c={cam} globe={globe} />}
        {screen && <Whips t={t} />}
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
