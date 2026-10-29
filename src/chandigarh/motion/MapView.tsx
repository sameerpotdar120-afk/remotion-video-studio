import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import geo from '../geo.json';

// The warm relief plates under a simple camera (centre in Web Mercator metres, metres per screen px), coarse to fine:
// South Asia, Punjab, the Chandigarh tricity. `desat` (0..1) drains the colour toward the reference's grey city view.
// `toS` projects with the same camera; `ringsD` turns rings (Mercator metres) into an SVG path.
type Plate = { bounds: number[]; w: number; h: number };
export type Cam = { x: number; y: number; mpp: number };
export const G = geo as unknown as { plates: Record<string, Plate>; countries: Record<string, number[][][]>; states: Record<string, number[][][]>; shivalik: number[][]; towns: Record<string, number[]> };
const R = 6378137;
export const merc = (lon: number, lat: number): [number, number] => [R * (lon * Math.PI / 180), R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))];
export const toS = (c: Cam, [x, y]: number[]): [number, number] => [540 + (x - c.x) / c.mpp, 960 - (y - c.y) / c.mpp];
export const ringsD = (c: Cam, rings: number[][][]) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const lineD = (c: Cam, pts: number[][]) => pts.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('');
export const town = (n: string) => G.towns[n];
const FEATHER = 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent), linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent)';
const fade = (mpp: number, full: number, none: number) => Math.min(1, Math.max(0, (none - mpp) / (none - full)));
export const MapView: React.FC<{ c: Cam; desat?: number }> = ({ c, desat = 0 }) => {
  const layer = (name: string, a: number, feather: boolean) => {
    const p = G.plates[name], [b0, b1, b2, b3] = p.bounds;
    if (a <= 0) return null;
    return <Img key={name} src={staticFile(`chandigarh/maps/${name}_geo.jpg`)} style={{ position: 'absolute', left: 540 + (b0 - c.x) / c.mpp, top: 960 - (b3 - c.y) / c.mpp, width: (b2 - b0) / c.mpp, height: (b3 - b1) / c.mpp, maxWidth: 'none', opacity: a,
      ...(feather ? { WebkitMaskImage: FEATHER, WebkitMaskComposite: 'source-in', maskImage: FEATHER, maskComposite: 'intersect' } : {}) }} />;
  };
  return (
    <AbsoluteFill style={{ background: '#20384a', overflow: 'hidden', filter: desat > 0.01 ? `saturate(${1 - 0.8 * desat}) brightness(${1 - 0.08 * desat}) contrast(${1 + 0.05 * desat})` : undefined }}>
      {layer('southasia', 1, false)}
      {layer('punjab', fade(c.mpp, 900, 1500), true)}
      {layer('city', fade(c.mpp, 35, 70), true)}
    </AbsoluteFill>
  );
};
