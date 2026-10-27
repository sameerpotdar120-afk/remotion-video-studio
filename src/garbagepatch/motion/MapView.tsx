import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import geo from '../geo.json';

// The bright plates under a simple camera (centre in Web Mercator metres, metres per screen px), coarse to fine: the
// world and the north-east Pacific. `toS` projects with the same camera. The patch sits between California and
// Hawaii; `patchRing` is its outline (about 1.6 million km², the 2018 estimate) and `indiaRing` lays India's official
// boundary at its true size (scaled for Mercator at the point it is drawn).
type Plate = { bounds: number[]; w: number; h: number };
export type Cam = { x: number; y: number; mpp: number };
const G = geo as unknown as { plates: Record<string, Plate>; india: number[][][]; indiaCentroid: number[]; states: Record<string, number[][][]> };
const R = 6378137;
export const merc = (lon: number, lat: number): [number, number] => [R * (lon * Math.PI / 180), R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))];
export const toS = (c: Cam, [x, y]: number[]): [number, number] => [540 + (x - c.x) / c.mpp, 960 - (y - c.y) / c.mpp];
export const ringsD = (c: Cam, rings: number[][][]) => rings.map((r) => r.map((p, i) => { const [sx, sy] = toS(c, p); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
export const state = (n: string) => G.states[n];
export const PATCH = merc(-142, 32);
/** The patch outline in Mercator metres: a lumpy oval of ~1.6 million km² (real), centred on PATCH. */
export const patchRing = (seed = 0): number[][][] => {
  const k = 1 / Math.cos((32 * Math.PI) / 180), a = 900e3 * k, b = 560e3 * k;
  return [Array.from({ length: 72 }, (_, i) => {
    const t = (i / 72) * Math.PI * 2, w = 1 + 0.07 * Math.sin(3 * t + seed) + 0.05 * Math.sin(5 * t + 1.3 + seed) + 0.03 * Math.sin(9 * t + seed * 2);
    return [PATCH[0] + Math.cos(t) * a * w, PATCH[1] + Math.sin(t) * b * w];
  })];
};
/** India at true size, its centroid moved to `at` (Mercator metres), for comparing areas on the Pacific plate. */
export const indiaRing = (at: number[]): number[][][] => {
  const [clo, cla] = G.indiaCentroid, lat = Math.atan(Math.sinh(at[1] / R));
  return G.india.map((r) => r.map(([lo, la]) => {
    const ex = ((lo - clo) * Math.PI / 180) * R * Math.cos((la * Math.PI) / 180), ny = ((la - cla) * Math.PI / 180) * R;
    return [at[0] + ex / Math.cos(lat), at[1] + ny / Math.cos(lat)];
  }));
};
const FEATHER = 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent), linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent)';
// the world plate repeats east and west so the Pacific can sit across the 180° line
const WRAP = 2 * Math.PI * R;
const fade = (mpp: number, full: number, none: number) => Math.min(1, Math.max(0, (none - mpp) / (none - full)));
export const MapView: React.FC<{ c: Cam }> = ({ c }) => {
  const layer = (name: string, a: number, feather: boolean, dx = 0) => {
    const [p0, b1, p2, b3] = G.plates[name].bounds, b0 = p0 + dx, b2 = p2 + dx;
    if (a <= 0 || 540 + (b0 - c.x) / c.mpp > 1080 || 540 + (b2 - c.x) / c.mpp < 0) return null;
    return <Img key={`${name}${dx}`} src={staticFile(`garbagepatch/maps/${name}_geo.jpg`)} style={{ position: 'absolute', left: 540 + (b0 - c.x) / c.mpp, top: 960 - (b3 - c.y) / c.mpp, width: (b2 - b0) / c.mpp, height: (b3 - b1) / c.mpp, maxWidth: 'none', opacity: a,
      ...(feather ? { WebkitMaskImage: FEATHER, WebkitMaskComposite: 'source-in', maskImage: FEATHER, maskComposite: 'intersect' } : {}) }} />;
  };
  return (
    <AbsoluteFill style={{ background: '#0d3a5c', overflow: 'hidden' }}>
      {[-WRAP, 0, WRAP].map((dx) => layer('world', 1, false, dx))}
      {layer('pacific', fade(c.mpp, 9000, 14000), true)}
    </AbsoluteFill>
  );
};
