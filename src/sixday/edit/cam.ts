import { CamS } from './World';
import { groundXZ, xz } from './geo';

/** A camera pose: looking at lon/lat from d km away, pitched `pitch` degrees down, heading `head` (0 = facing north). */
export type CamK = { lon: number; lat: number; d: number; pitch: number; head: number; fov?: number; roll?: number };

export const camOf = (h: Float32Array, k: CamK): CamS => {
  const [x, z] = xz(k.lon, k.lat);
  const y = groundXZ(h, x, z);
  const p = (k.pitch * Math.PI) / 180, hd = (k.head * Math.PI) / 180;
  const c = Math.cos(p) * k.d;
  return { pos: [x - Math.sin(hd) * c, y + Math.sin(p) * k.d, z + Math.cos(hd) * c], look: [x, y, z], fov: k.fov ?? 30, roll: k.roll };
};
