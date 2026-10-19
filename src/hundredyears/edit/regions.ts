import { random } from 'remotion';
import { merc } from './cam';
import { ramp, window4 } from './anim';
import { BURN, C, CUT, GAME, GEO, P, PARCH } from './cam';

export type Region = { key: string; rings: P[][]; a: number; color: string; phase: number; sat?: number; from?: P; edge?: string };

/** The map colours match the characters (motion/theme.ts): England red, France royal blue, Burgundy amber. */
export const COL = { en: '#D0111B', fr: '#1F2BD0', bur: '#E8A23A', gold: '#FFD84A', cyan: '#9FF3FF', white: '#FFFFFF' };

const reg = (key: string, rings: P[][], a: number, color: string, more: Partial<Region> = {}): Region => ({ key, rings, a, color, phase: random(key), ...more });
const pd = (k: string) => merc(GEO.places_deg[k][0], GEO.places_deg[k][1]);

/** The map's beats; later entries draw on top. */
export const regionsAt = (t: number): Region[] => {
  const out: Region[] = [];
  const parch = t >= PARCH[0] && t < PARCH[1];
  const game = t >= GAME[0] && t < GAME[1];
  const sat = parch ? 0.82 : 0.88;
  // the hook: England pops red, France wipes in blue from a dot (reference 0.9–1.3 s)
  const hook = t < PARCH[0];
  if (hook) {
    out.push(reg('en_h', GEO.england, ramp(t, 0.25, 0.65), COL.en, { sat }));
    out.push(reg('fr_h', GEO.france, ramp(t, 0.55, 1.15), COL.fr, { sat, from: pd('paris') }));
  }
  // 1337 on parchment: England fills on "Edward", France on "France ने मना कर दिया"
  if (parch) {
    out.push(reg('en_p', GEO.england, ramp(t, C.edward3 - 0.1, C.edward3 + 0.4), COL.en, { sat }));
    out.push(reg('fr_p', GEO.france, ramp(t, C.mana4 - 0.4, C.mana4 + 0.4), COL.fr, { sat, from: pd('paris') }));
    out.push(reg('gas_p', GEO.en_1337, ramp(t, C.zid4 + 0.2, C.zid4 + 0.7), COL.en, { sat }));
  }
  // decades later (the game look) and Joan's France: English France and Burgundy over the Dauphin's blue
  const later = t >= GAME[0];
  if (later) {
    const g = game ? { edge: COL.cyan } : {};
    out.push(reg('en_l', GEO.england, 1, COL.en, { sat }));
    out.push(reg('fr_l', GEO.france, 1, COL.fr, { sat }));
    // English France 1429 flows in from Normandy (the reference's soft red flood), then Champagne is freed at Reims
    const flood = t < CUT.village[1] ? 1 : ramp(t, CUT.village[1] + 0.2, C.n1429_9 + 0.6);
    const champagne = t < C.reims9 ? 1 : 1 - ramp(t, C.reims9, C.reims9 + 0.8);
    const end = BURN[0] - 0.02;
    if (t < end) {
      if (champagne > 0.01) out.push(reg('en29', GEO.en_1429, flood * champagne, COL.en, { sat, from: pd('rouen'), ...g }));
      out.push(reg('en30', GEO.en_1430, flood, COL.en, { sat, from: pd('rouen'), ...g }));
      out.push(reg('bur', GEO.burgundy, game ? 1 : ramp(t, C.burgundy11 - 0.1, C.burgundy11 + 0.6), COL.bur, { sat, from: pd('dijon') }));
    } else {
      // after the burn: the English pushed out, only Calais left
      out.push(reg('en53', GEO.en_1453, 1, COL.en, { sat: 0.95 }));
    }
  }
  return out;
};

/** When each region lands (for the lift). */
export const LAND: Record<string, number[]> = { en_p: [C.edward3 + 0.4], fr_p: [C.mana4 + 0.4], en30: [C.jaan8 + 1.2], bur: [C.burgundy11 + 0.6] };
export const windowA = window4;
