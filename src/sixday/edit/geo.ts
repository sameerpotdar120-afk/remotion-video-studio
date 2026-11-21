import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import meta from '../../../public/sixday/map/meta.json';

/**
 * The Six-Day map world (tools/build_sixday_map.py). Scene units are km: x east, z south, y up, origin at 34.0 E,
 * 30.8 N, a plate carree scaled by cos(30.8 N) so distances are true near Israel.
 */
export const M = meta as unknown as {
  bounds: [number, number, number, number]; tex: [number, number]; grid: [number, number]; kx: number; ky: number;
  center: [number, number]; ids: Record<string, number>; places: Record<string, [number, number]>; hmax: number;
};
export type V3 = [number, number, number];
export const [LON0, LON1, LAT0, LAT1] = M.bounds;
export const xz = (lon: number, lat: number): [number, number] => [(lon - M.center[0]) * M.kx, -(lat - M.center[1]) * M.ky];
export const X0 = xz(LON0, LAT1)[0], X1 = xz(LON1, LAT0)[0], Z0 = xz(LON0, LAT1)[1], Z1 = xz(LON1, LAT0)[1];
export const KM_PER_PX = (X1 - X0) / M.tex[0];
export const [GW, GH] = M.grid;
/** Height exaggeration: metres -> scene km. */
export const VEX = 5;

/** Ground height (scene km) at scene x, z. */
export const groundXZ = (h: Float32Array, x: number, z: number) => {
  const fx = Math.min(Math.max(((x - X0) / (X1 - X0)) * (GW - 1), 0), GW - 1.001);
  const fz = Math.min(Math.max(((z - Z0) / (Z1 - Z0)) * (GH - 1), 0), GH - 1.001);
  const i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j;
  const g = (c: number, r: number) => h[r * GW + c];
  const m = (g(i, j) * (1 - tx) + g(i + 1, j) * tx) * (1 - tz) + (g(i, j + 1) * (1 - tx) + g(i + 1, j + 1) * tx) * tz;
  return Math.max(0, (m * VEX) / 1000);
};
/** A place (name from meta, or [lon, lat]) `up` km above the ground. */
export const P3 = (h: Float32Array, p: string | [number, number], up = 0): V3 => {
  const [x, z] = typeof p === 'string' ? M.places[p] : xz(p[0], p[1]);
  if (typeof p === 'string' && !M.places[p]) throw new Error(`no place ${p}`);
  return [x, groundXZ(h, x, z) + up, z];
};
export const PXZ = (p: string | [number, number]): [number, number] => (typeof p === 'string' ? M.places[p] : xz(p[0], p[1]));

const cache: Record<string, Promise<Float32Array>> = {};
const loadHeights = () => (cache.h ??= fetch(staticFile('sixday/map/height.bin')).then((r) => r.arrayBuffer()).then((b) => new Float32Array(b)));
export const useHeights = () => {
  const [h, setH] = useState<Float32Array | null>(null);
  const [handle] = useState(() => delayRender('sd heights'));
  useEffect(() => { loadHeights().then((x) => { setH(x); continueRender(handle); }); }, [handle]);
  return h;
};
