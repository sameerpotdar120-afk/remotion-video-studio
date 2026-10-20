import React, { createContext, useContext, useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, FPS, H, T, W } from '../constants';
import { clamp, ease } from '../easing';
import { PX_PER_DEG, featurePath, project } from './geo';
import { land } from './data';

/** A camera keyframe: look at lon/lat with `span` degrees of longitude across the frame. */
export type CamKey = {
  frame: number;
  lon: number;
  lat: number;
  span: number; // degrees visible horizontally. World ≈ 360, US east coast ≈ 22, Boston close-up ≈ 1.2
  rotate?: number; // degrees
  tilt?: number; // perspective tilt for the 3D terrain look, degrees (0 = flat)
  easing?: (t: number) => number; // easing INTO this key
};

export type Cam = { lon: number; lat: number; span: number; rotate: number; tilt: number };

/** Interpolate camera keys. Zoom is interpolated in log space so it feels linear to the eye.
 *  After the last key the camera keeps drifting in (T.driftPerSec) — the reference never stops. */
export const cameraAt = (keys: CamKey[], frame: number): Cam => {
  const k = keys;
  if (frame <= k[0].frame) return { rotate: 0, tilt: 0, ...k[0] };
  for (let i = 1; i < k.length; i++) {
    if (frame <= k[i].frame) {
      const a = k[i - 1];
      const b = k[i];
      const e = b.easing ?? ease.inOut;
      const t = e((frame - a.frame) / Math.max(1, b.frame - a.frame));
      return {
        lon: a.lon + (b.lon - a.lon) * t,
        lat: a.lat + (b.lat - a.lat) * t,
        span: Math.exp(Math.log(a.span) + (Math.log(b.span) - Math.log(a.span)) * t),
        rotate: (a.rotate ?? 0) + ((b.rotate ?? 0) - (a.rotate ?? 0)) * t,
        tilt: (a.tilt ?? 0) + ((b.tilt ?? 0) - (a.tilt ?? 0)) * t,
      };
    }
  }
  const last = k[k.length - 1];
  const held = (frame - last.frame) / FPS;
  return { rotate: 0, tilt: 0, ...last, span: last.span / (1 + T.driftPerSec * held) };
};

type MapCtx = {
  cam: Cam;
  /** world px → screen px multiplier */
  scale: number;
  /** lon/lat → screen px (for pins, labels, characters that keep a constant on-screen size) */
  toScreen: (lon: number, lat: number) => [number, number];
};
const Ctx = createContext<MapCtx | null>(null);
export const useMap = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useMap must be used inside <MapStage>');
  return c;
};

/** A plate-carrée raster placed by its lon/lat bounds → pixel-perfect alignment with vectors. */
export type Raster = { src: string; west: number; south: number; east: number; north: number; style?: React.CSSProperties };

export type MapStyle = 'satellite' | 'parchment' | 'flat';

/**
 * <MapStage> renders two layers:
 *  - world layer  (rasters + SVG children written in WORLD px; the camera is the SVG viewBox,
 *                  so strokes scale with the map. Use vectorEffect="non-scaling-stroke" for
 *                  borders that must stay a constant on-screen width)
 *  - screen layer (`overlay` children placed with toScreen(), constant size on screen)
 * Rasters must be plate carrée crops (see the asset doc for gdal crop commands).
 */
export const MapStage: React.FC<{
  camera: CamKey[];
  style: MapStyle;
  rasters?: Raster[];
  world?: React.ReactNode; // SVG elements in world px
  overlay?: React.ReactNode; // HTML/SVG in screen px
}> = ({ camera, style, rasters = [], world, overlay }) => {
  const frame = useCurrentFrame();
  const cam = cameraAt(camera, frame);
  const scale = W / (cam.span * PX_PER_DEG);
  const [cx, cy] = project(cam.lon, cam.lat);
  const tx = W / 2 - cx * scale;
  const ty = H / 2 - cy * scale;

  const ctx = useMemo<MapCtx>(
    () => ({
      cam,
      scale,
      toScreen: (lon, lat) => {
        const [x, y] = project(lon, lat);
        // rotation around screen centre
        const sx = x * scale + tx - W / 2;
        const sy = y * scale + ty - H / 2;
        const r = (cam.rotate * Math.PI) / 180;
        return [W / 2 + sx * Math.cos(r) - sy * Math.sin(r), H / 2 + sx * Math.sin(r) + sy * Math.cos(r)];
      },
    }),
    [cam, scale, tx, ty],
  );

  const landPath = useMemo(() => featurePath(land as never), []);
  const bg = style === 'satellite' ? '#0B2A44' : style === 'parchment' ? C.stageParchSea : C.flatSea;
  // Only the visible window is rasterised: the SVG is screen-sized and the camera is a viewBox.
  const viewBox = `${-tx / scale} ${-ty / scale} ${W / scale} ${H / scale}`;

  return (
    <Ctx.Provider value={ctx}>
      <AbsoluteFill style={{ backgroundColor: bg, overflow: 'hidden', perspective: 3200 }}>
        <AbsoluteFill
          style={{ transformOrigin: '50% 50%', transform: `rotateX(${cam.tilt}deg) rotate(${cam.rotate}deg)` }}
        >
          {rasters.map((r) => {
            const [x0, y0] = project(r.west, r.north);
            const [x1, y1] = project(r.east, r.south);
            return (
              <Img
                key={r.src}
                src={r.src}
                style={{
                  position: 'absolute',
                  left: x0 * scale + tx,
                  top: y0 * scale + ty,
                  width: (x1 - x0) * scale,
                  height: (y1 - y0) * scale,
                  ...r.style,
                }}
              />
            );
          })}
          <svg
            width={W}
            height={H}
            viewBox={viewBox}
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
          >
            {style !== 'satellite' && (
              <path d={landPath} fill={style === 'parchment' ? C.stageParchLand : C.flatLand} stroke="none" />
            )}
            {world}
          </svg>
        </AbsoluteFill>
        {style === 'parchment' && <ParchmentPaper />}
        <AbsoluteFill>{overlay}</AbsoluteFill>
      </AbsoluteFill>
    </Ctx.Provider>
  );
};

/** Paper texture + vignette laid over the parchment style (screen space, so grain never scales). */
export const ParchmentPaper: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <Img
      src={staticFile('assets/textures/parchment_paper_4k.jpg')}
      style={{ width: W, height: H, mixBlendMode: 'multiply', opacity: 0.55 }}
    />
    <AbsoluteFill
      style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(60,35,10,0.35) 100%)' }}
    />
  </AbsoluteFill>
);

/** Fade between two map styles (the reference switches style on every narrative turn). */
export const styleCrossfade = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [0, 1], clamp);
