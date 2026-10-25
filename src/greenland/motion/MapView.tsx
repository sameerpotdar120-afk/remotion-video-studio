import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import geo from '../geo.json';

// The bright satellite plate (or the paper one) under a simple camera: `center` in Web Mercator metres, `z` screen px
// per plate px. `proj` maps Mercator metres to screen px with the same camera, so shapes and labels sit on the map.
type Plate = { bounds: number[]; w: number; h: number };
export type Cam = { plate: 'atlantic' | 'iceland'; center: [number, number]; z: number };
const P = (geo as unknown as { plates: Record<string, Plate> }).plates;
// the camera never shows past the plate's edge: zoom is held at "cover" or more, and the centre is kept inside
const fit = (c: Cam) => {
  const p = P[c.plate], [b0, , b2, b3] = p.bounds, b1 = p.bounds[1];
  const z = Math.max(c.z, 1080 / p.w, 1920 / p.h);
  const cx = Math.min(p.w - 540 / z, Math.max(540 / z, ((c.center[0] - b0) / (b2 - b0)) * p.w));
  const cy = Math.min(p.h - 960 / z, Math.max(960 / z, ((b3 - c.center[1]) / (b3 - b1)) * p.h));
  return { p, z, cx, cy };
};
export const proj = (c: Cam, x: number, y: number): [number, number] => {
  const { p, z, cx, cy } = fit(c), [b0, b1, b2, b3] = p.bounds;
  const px = ((x - b0) / (b2 - b0)) * p.w, py = ((b3 - y) / (b3 - b1)) * p.h;
  return [540 + (px - cx) * z, 960 + (py - cy) * z];
};
export const ringsD = (c: Cam, rings: number[][][]) => rings.map((r) => r.map(([x, y], i) => { const [sx, sy] = proj(c, x, y); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const country = (n: string) => (geo as unknown as { countries: Record<string, number[][][]> }).countries[n];
export const centroid = (n: string) => (geo as unknown as { centroids: Record<string, [number, number]> }).centroids[n];
export const MapView: React.FC<{ c: Cam; paper?: boolean }> = ({ c, paper }) => {
  const p = P[c.plate];
  const [x0, y0] = proj(c, p.bounds[0], p.bounds[3]);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: paper ? '#CFC6AE' : '#1B5C80' }}>
      <Img src={staticFile(`greenland/maps/${c.plate}_${paper ? 'paper' : 'geo'}.jpg`)} style={{ position: 'absolute', left: x0, top: y0, width: p.w * fit(c).z, height: p.h * fit(c).z, maxWidth: 'none' }} />
    </AbsoluteFill>
  );
};
