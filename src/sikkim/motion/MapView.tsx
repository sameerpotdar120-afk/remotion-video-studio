import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import geo from '../geo.json';

// The relief plates under a simple camera (centre in Web Mercator metres, metres per screen px), coarse to fine: India,
// the north-east around Sikkim, the Teesta valley. Graded dark like the reference's map: desaturated, darker, a little
// contrast, heavy vignette and a dark band at the top. `dim` (0..1) darkens everything except what's drawn on top.
type Plate = { bounds: number[]; w: number; h: number };
export type Cam = { x: number; y: number; mpp: number };
export const G = geo as unknown as {
  plates: Record<string, Plate>; countries: Record<string, number[][][]>; states: Record<string, number[][][]>; teesta: number[][]; route: number[][];
  stations: Record<string, number[]>; towns: Record<string, number[]>; cities: Record<string, number[]>; nh10: number[][];
};
const R = 6378137;
export const merc = (lon: number, lat: number): [number, number] => [R * (lon * Math.PI / 180), R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))];
export const toS = (c: Cam, [x, y]: number[]): [number, number] => [540 + (x - c.x) / c.mpp, 960 - (y - c.y) / c.mpp];
export const ringsD = (c: Cam, rings: number[][][]) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const lineD = (c: Cam, pts: number[][]) => pts.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('');
const FEATHER = 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent), linear-gradient(180deg, transparent, #000 8%, #000 92%, transparent)';
const fade = (mpp: number, full: number, none: number) => Math.min(1, Math.max(0, (none - mpp) / (none - full)));
export const MapView: React.FC<{ c: Cam; dark?: number }> = ({ c, dark = 1 }) => {
  const layer = (name: string, a: number, feather: boolean) => {
    const p = G.plates[name], [b0, b1, b2, b3] = p.bounds;
    if (a <= 0) return null;
    return <Img key={name} src={staticFile(`sikkim/maps/${name}_geo.jpg`)} style={{ position: 'absolute', left: 540 + (b0 - c.x) / c.mpp, top: 960 - (b3 - c.y) / c.mpp, width: (b2 - b0) / c.mpp, height: (b3 - b1) / c.mpp, maxWidth: 'none', opacity: a,
      ...(feather ? { WebkitMaskImage: FEATHER, WebkitMaskComposite: 'source-in', maskImage: FEATHER, maskComposite: 'intersect' } : {}) }} />;
  };
  return (
    <AbsoluteFill style={{ background: '#0b1418', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: `brightness(${1 - 0.42 * dark}) saturate(${1 - 0.45 * dark}) contrast(${1 + 0.12 * dark}) sepia(${0.18 * dark})` }}>
        {layer('india', 1, false)}
        {layer('ne', fade(c.mpp, 700, 1300), true)}
        {layer('teesta', fade(c.mpp, 70, 140), true)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
/** The reference's frame: a heavy black vignette on every edge and a darker band at the top. */
export const Vignette: React.FC<{ k?: number }> = ({ k = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 52%, rgba(0,0,0,0) 45%, rgba(0,0,0,${0.75 * k}) 100%)` }} />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${0.55 * k}), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 80%, rgba(0,0,0,${0.5 * k}))` }} />
  </AbsoluteFill>
);
