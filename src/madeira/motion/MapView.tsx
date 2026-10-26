import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import geo from '../geo.json';

// The Midnight plates under a simple camera (centre in Web Mercator metres, metres per screen px), coarse to fine:
// the Atlantic, the archipelago, Madeira. `toS` projects with the same camera.
type Plate = { bounds: number[]; w: number; h: number };
export type Cam = { x: number; y: number; mpp: number };
const G = geo as unknown as { plates: Record<string, Plate>; islands: Record<string, number[][][]>; countries: Record<string, number[][][]> };
const R = 6378137;
export const merc = (lon: number, lat: number): [number, number] => [R * (lon * Math.PI / 180), R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))];
export const toS = (c: Cam, [x, y]: number[]): [number, number] => [540 + (x - c.x) / c.mpp, 960 - (y - c.y) / c.mpp];
export const ringsD = (c: Cam, rings: number[][][]) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const island = (n: string) => G.islands[n];
export const country = (n: string) => G.countries[n];
const FEATHER = 'linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent), linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)';
const fade = (mpp: number, full: number, none: number) => Math.min(1, Math.max(0, (none - mpp) / (none - full)));
export const MapView: React.FC<{ c: Cam }> = ({ c }) => {
  const layer = (name: string, a: number, feather: boolean) => {
    const p = G.plates[name], [b0, b1, b2, b3] = p.bounds;
    if (a <= 0) return null;
    return <Img src={staticFile(`madeira/maps/${name}_geo.jpg`)} style={{ position: 'absolute', left: 540 + (b0 - c.x) / c.mpp, top: 960 - (b3 - c.y) / c.mpp, width: (b2 - b0) / c.mpp, height: (b3 - b1) / c.mpp, maxWidth: 'none', opacity: a,
      ...(feather ? { WebkitMaskImage: FEATHER, WebkitMaskComposite: 'source-in', maskImage: FEATHER, maskComposite: 'intersect' } : {}) }} />;
  };
  return (
    <AbsoluteFill style={{ background: '#06121c', overflow: 'hidden' }}>
      {layer('atlantic', 1, false)}
      {layer('archipelago', fade(c.mpp, 400, 1400), true)}
      {layer('madeira', fade(c.mpp, 60, 160), true)}
    </AbsoluteFill>
  );
};
