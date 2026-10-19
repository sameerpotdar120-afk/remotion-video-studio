import { random } from 'remotion';
import { ramp } from './anim';
import { C, GEO, P, SC, merc } from './cam';

export type Region = { key: string; rings: P[][]; a: number; color: string; phase: number; sat?: number; from?: P; edge?: string };

/** The colour code stays fixed through the video (as in the reference): Nepal blue, China red, Ecuador amber. */
export const COL = { nepal: '#2F6BFF', china: '#E1261C', ecuador: '#F59E0B', gold: '#FFC83D', white: '#FFFFFF', green: '#47E36B', red: '#E8262B' };

const reg = (key: string, rings: P[][], a: number, color: string, more: Partial<Region> = {}): Region => ({ key, rings, a, color, phase: random(key), ...more });

/** The map's beats; later entries draw on top. China is Natural Earth's India point-of-view outline (no Aksai Chin,
 *  no Arunachal Pradesh), so India keeps its official boundary on screen. */
export const regionsAt = (t: number): Region[] => {
  const out: Region[] = [];
  if (t >= C.dakshin3 - 0.2 && t < SC.globe1[0] + 0.1) {
    out.push(reg('china', GEO.china, ramp(t, C.china3 - 0.15, C.china3 + 0.45), COL.china, { sat: 0.86, edge: COL.white }));
    // Nepal rises from the south (the reference's wipe up to the border)
    out.push(reg('nepal', GEO.nepal, ramp(t, C.nepal3 - 0.25, C.nepal3 + 0.35), COL.nepal, { sat: 0.9, from: merc(84.5, 25.6), edge: COL.white }));
  }
  if (t >= C.ecuador9 - 0.3 && t < SC.globe2[0] + 0.1) {
    out.push(reg('ecuador', GEO.ecuador, ramp(t, C.ecuador9 - 0.2, C.ecuador9 + 0.45), COL.ecuador, { sat: 0.82, edge: '#FFE7B0' }));
  }
  return out;
};

/** When each region lands (for the lift). */
export const LAND: Record<string, number[]> = { nepal: [C.nepal3 + 0.35], china: [C.china3 + 0.45], ecuador: [C.ecuador9 + 0.45] };
