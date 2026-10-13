import { inOut } from '../darien/anim';

export * from '../darien/anim';

/** Piecewise value through [time, value] keys, eased in-out between keys and held outside them. */
export const interpolateKeys = (keys: [number, number][], t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      return v0 + (v1 - v0) * inOut(Math.min(1, Math.max(0, (t - t0) / Math.max(1e-6, t1 - t0))));
    }
  }
  return keys[keys.length - 1][1];
};
