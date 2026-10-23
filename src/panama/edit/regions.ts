import { random } from 'remotion';
import { ramp } from './anim';
import { C, GEO, P, merc, sceneT0 } from './cam';

export type Region = { key: string; rings: P[][]; a: number; color: string; phase: number; sat?: number; from?: P; edge?: string };

export const COL = { panama: '#F2B233', lake: '#38C6FF', dry: '#E5402B', samerica: '#F28A2E', yellow: '#FFE14D', green: '#7CFF6B' };

const reg = (key: string, rings: P[][], a: number, color: string, more: Partial<Region> = {}): Region => ({ key, rings, a, color, phase: random(key), ...more });
const out1 = (t: number, a: number, b: number) => 1 - ramp(t, a, b);
const LAKE = merc(-79.85, 9.17);
const SAM = Object.values(GEO.samerica).flat();

/** The map's fills, every place the VO names; later entries draw on top. */
export const regionsAt = (t: number): Region[] => {
  const out: Region[] = [];
  const dryEnd = sceneT0('locks').t0;
  // line 1: Panama, then its lake drying up
  if (t >= C.kyunki1 - 0.3 && t < C.ajeeb2 + 0.6) out.push(reg('pan1', GEO.panama, Math.min(ramp(t, C.kyunki1 - 0.1, C.kyunki1 + 0.45), out1(t, C.ajeeb2, C.ajeeb2 + 0.5)), COL.panama, { sat: 0.6, edge: '#FFF0C0' }));
  if (t >= C.paani1 - 0.3 && t < C.khatam1 + 0.3) out.push(reg('gat1', GEO.gatun, ramp(t, C.paani1 - 0.1, C.paani1 + 0.35), COL.lake, { sat: 0.8, edge: '#FFFFFF' }));
  if (t >= C.khatam1 - 0.1 && t < C.ajeeb2 + 0.6) out.push(reg('gatd1', GEO.gatun, Math.min(ramp(t, C.khatam1 - 0.05, C.khatam1 + 0.4), out1(t, C.ajeeb2, C.ajeeb2 + 0.5)), COL.dry, { sat: 0.85, edge: '#FFD0C8', from: LAKE }));
  // line 2: the lake the canal runs on
  if (t >= C.gatun2 - 0.3 && t < dryEnd) out.push(reg('gat2', GEO.gatun, ramp(t, C.gatun2 - 0.1, C.gatun2 + 0.4), COL.lake, { sat: 0.8, edge: '#FFFFFF', from: LAKE }));
  // line 3: the lake water poured into the sea
  if (t >= C.khel3 - 0.4 && t < sceneT0('pools').t0) out.push(reg('gat3', GEO.gatun, ramp(t, C.khel3 - 0.2, C.khel3 + 0.3), COL.lake, { sat: 0.75, edge: '#FFFFFF' }));
  // line 4: filled only by rain
  if (t >= C.baarish4 - 0.3 && t < sceneT0('drought').t0) out.push(reg('gat4', GEO.gatun, ramp(t, C.baarish4 - 0.1, C.baarish4 + 0.4), COL.lake, { sat: 0.85, edge: '#FFFFFF', from: LAKE }));
  // line 6: the same lake, Panama's drinking water
  if (t >= C.gatun6 - 0.3 && t < C.socho8) out.push(reg('gat6', GEO.gatun, Math.min(ramp(t, C.gatun6 - 0.1, C.gatun6 + 0.4), out1(t, C.khatam8 - 0.3, C.khatam8 + 0.1)), COL.lake, { sat: 0.85, edge: '#FFFFFF', from: LAKE }));
  // line 8: the water runs out; then the long way round South America
  if (t >= C.khatam8 - 0.3 && t < C.samerica8 + 0.8) out.push(reg('gatd8', GEO.gatun, Math.min(ramp(t, C.khatam8 - 0.2, C.khatam8 + 0.3), out1(t, C.samerica8, C.samerica8 + 0.6)), COL.dry, { sat: 0.9, edge: '#FFD0C8', from: LAKE }));
  if (t >= C.samerica8 - 0.2 && t < C.isiliye8 + 0.3) out.push(reg('sam', SAM, Math.min(ramp(t, C.samerica8 + 0.1, C.samerica8 + 0.8), out1(t, C.isiliye8 - 0.1, C.isiliye8 + 0.3)), COL.samerica, { sat: 0.55, edge: '#FFE2B8', from: merc(-74, 4.6) }));
  if (t >= C.samerica8 - 0.2 && t < C.isiliye8 + 0.3) out.push(reg('pan8', GEO.panama, Math.min(ramp(t, C.samerica8 + 0.3, C.samerica8 + 0.8), out1(t, C.isiliye8 - 0.1, C.isiliye8 + 0.3)), COL.panama, { sat: 0.8, edge: '#FFFFFF' }));
  return out;
};

export const LAND: Record<string, number[]> = {
  pan1: [C.kyunki1 + 0.45], gat1: [C.paani1 + 0.35], gatd1: [C.khatam1 + 0.4], gat2: [C.gatun2 + 0.4], gat3: [C.khel3 + 0.3],
  gat4: [C.baarish4 + 0.4], gat6: [C.gatun6 + 0.4], gatd8: [C.khatam8 + 0.3], sam: [C.samerica8 + 0.8], pan8: [C.samerica8 + 0.8],
};
