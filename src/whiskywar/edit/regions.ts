import { random } from 'remotion';
import { ramp } from './anim';
import { C, GEO, P, SC, merc } from './cam';

export type Region = { key: string; rings: P[][]; a: number; color: string; phase: number; sat?: number; from?: P; edge?: string };

/** The reference's colours: Canada orange on the atlas and parchment (red for the war plan), Greenland violet. */
export const COL = { canada: '#F28A2E', canadaRed: '#E8262B', greenland: '#6A5FD0', denmark: '#C8102E', yellow: '#F5F23A', white: '#FFFFFF' };

const reg = (key: string, rings: P[][], a: number, color: string, more: Partial<Region> = {}): Region => ({ key, rings, a, color, phase: random(key), ...more });

/** The map's beats; later entries draw on top. (Line 1's flag fills are drawn as motion components over the map.) */
export const regionsAt = (t: number): Region[] => {
  const out: Region[] = [];
  const at = SC('atlas'), pa = SC('parch'), war = SC('war');
  if (t >= at.t0 && t < pa.t1) {
    // Canada orange, rippling in from the west (the reference's ragged reveal)
    out.push(reg('can', GEO.canada, t < pa.t0 ? ramp(t, at.t0 + 0.05, at.t0 + 0.75) : 1, COL.canada, { sat: 1, from: merc(-130, 58) }));
  }
  if (t >= pa.t0 && t < pa.t1) {
    out.push(reg('grl', GEO.greenland, ramp(t, C.hissa4 - 0.35, C.hissa4 + 0.4), COL.greenland, { sat: 0.95, from: merc(-40, 70) }));
    out.push(reg('dnk', GEO.denmark, ramp(t, C.hissa4 - 0.5, C.hissa4), COL.greenland, { sat: 0.95 }));
  }
  if (t >= war.t0 && t < war.t1) out.push(reg('canw', GEO.canada, ramp(t, war.t0, war.t0 + 0.45), COL.canadaRed, { sat: 0.95, from: merc(-75, 52) }));
  return out;
};

export const LAND: Record<string, number[]> = { can: [SC('atlas').t0 + 0.75], grl: [C.hissa4 + 0.4] };
