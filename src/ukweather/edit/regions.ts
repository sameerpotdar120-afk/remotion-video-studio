import { random } from 'remotion';
import { ramp } from './anim';
import { C, GEO, P, SC, merc } from './cam';

export type Region = { key: string; rings: P[][]; a: number; color: string; phase: number; sat?: number; from?: P; edge?: string };

/** The four winds' colours (shared by the arrows, the tags and the end card's winner). */
export const WIND = { west: '#2E9BE0', north: '#9FE3FF', south: '#E8402B', east: '#F2C12E' };
export const COL = { india: '#FF9933', uk: '#D8262B', rain: '#2F7FE0', colombia: '#F28A2E', yellow: '#F5F23A', white: '#FFFFFF' };

const reg = (key: string, rings: P[][], a: number, color: string, more: Partial<Region> = {}): Region => ({ key, rings, a, color, phase: random(key), ...more });
const out1 = (t: number, a: number, b: number) => 1 - ramp(t, a, b);

/** The end card: which wind "wins" at time t (it cycles, faster then slower, and lands on the Gulf Stream). */
export const winnerAt = (t: number): keyof typeof WIND | null => {
  if (t < C.jeet10) return null;
  const order: (keyof typeof WIND)[] = ['north', 'east', 'south', 'west'];
  const u = t - C.jeet10;
  const steps = Math.floor(9 * Math.sqrt(Math.min(u, 1.6) / 1.6));
  return order[steps % 4] ?? 'west';
};

/** The map's fills; later entries draw on top. */
export const regionsAt = (t: number): Region[] => {
  const out: Region[] = [];
  if (t < C.par1 + 0.6) out.push(reg('ind', GEO.india, Math.min(ramp(t, 0.2, 0.9), out1(t, C.par1 - 0.1, C.par1 + 0.4)), COL.india, { sat: 0.5, edge: '#FFFFFF' }));
  if (t >= C.britain1 - 0.4 && t < SC.flight[0]) out.push(reg('uk1', GEO.uk, ramp(t, C.britain1 - 0.15, C.britain1 + 0.5), COL.uk, { sat: 0.72, edge: '#FFD7D0' }));
  if (t >= C.scotland3 - 0.3 && t < SC.tilt[0]) {
    out.push(reg('irl', GEO.ireland, ramp(t, C.scotland3 + 0.1, C.scotland3 + 0.7), COL.rain, { sat: 0.45 }));
    out.push(reg('uk3', GEO.uk, ramp(t, C.scotland3 - 0.2, C.scotland3 + 0.45), COL.rain, { sat: 0.7, edge: '#BFE2FF', from: merc(-4.8, 57.5) }));
  }
  if (t >= SC.tilt[0] && t < SC.tilt[1]) out.push(reg('ukt', GEO.uk, ramp(t, C.britain5 - 0.2, C.britain5 + 0.3), COL.uk, { sat: 0.9, edge: '#FFFFFF' }));
  if (t >= C.colombia5 - 0.3 && t < C.kyunki7) out.push(reg('col', GEO.colombia, ramp(t, C.colombia5 - 0.15, C.colombia5 + 0.5), COL.colombia, { sat: 0.62, edge: '#FFE2B8', from: merc(-74.1, 4.7) }));
  if (t >= SC.battle) {
    const w = winnerAt(t);
    const col = w ? { west: '#2E9BE0', north: '#9FE3FF', south: '#E8402B', east: '#F2C12E' }[w] : '#C8CDD3';
    out.push(reg(w ? `ukw${w}` : 'ukb', GEO.gb, w ? 1 : ramp(t, SC.battle + 0.4, SC.battle + 1.0), col, { sat: w ? 0.75 : 0.35 }));
  }
  return out;
};

export const LAND: Record<string, number[]> = {
  ind: [0.9], uk1: [C.britain1 + 0.5], uk3: [C.scotland3 + 0.45], ukt: [C.britain5 + 0.3], col: [C.colombia5 + 0.5],
};
