import { random } from 'remotion';
import { ramp, window4 } from './anim';
import { C, GEO, P, SC } from './cam';

export type Region = { key: string; rings: P[][]; a: number; color: string; fill: number; phase: number; sat?: number; dx?: number; dy?: number };

export const COL = {
  india: '#FF9933', indiaEast: '#22C1C3', russia: '#E8473A', usa: '#3D6FE0', france: '#2F63FF', china: '#E8263A', chinaZone: '#2F7BFF',
  assam: '#2FB86A', arunachal: '#FFB23E', gujarat: '#5A7BD8', nepal: '#C8102E', gold: '#FFD84A', red: '#FF2B3A', yellow: '#FFE11A', cyan: '#36D6FF',
};

const reg = (key: string, rings: P[][], a: number, color: string, sat = 0.75): Region => ({ key, rings, a, color, fill: 1, phase: random(key), sat });
const ctry = (n: string) => GEO.countries[n];
const state = (n: string) => GEO.states[n] ?? [];

/** Every region's beat: each country or state named in the VO lights up on its word. */
export const regionsAt = (t: number): Region[] => {
  const out: Region[] = [];
  const india = Math.max(
    window4(t, C.india3 - 0.05, C.india3 + 0.3, SC.whatif + 0.2, SC.whatif + 0.6),
    window4(t, C.ist5 - 0.1, C.ist5 + 0.3, C.mirzapur5 + 0.3, C.seedhi5),
    window4(t, C.india10 - 0.1, C.india10 + 0.3, C.arunachal10 - 0.2, C.arunachal10 + 0.3) ,
  );
  if (india > 0) out.push(reg('india', ctry('India'), india, COL.india, 0.65));
  // France beat: the two wrong guesses, then France
  const ru = window4(t, C.russia8 - 0.1, C.russia8 + 0.25, C.france8 - 0.2, C.france8 + 0.1);
  if (ru > 0) out.push(reg('russia', ctry('Russia'), ru, COL.russia, 0.6));
  const us = window4(t, C.america8 - 0.1, C.america8 + 0.25, C.france8 - 0.2, C.france8 + 0.1);
  if (us > 0) out.push(reg('usa', ctry('United States of America'), us, COL.usa, 0.6));
  const fr = window4(t, C.france8 - 0.05, C.france8 + 0.3, C.dweep8 + 0.3, C.dweep8 + 0.8);
  if (fr > 0) out.push(reg('france', GEO.countries.France_metro, fr, COL.france, 0.85));
  // China: red, then its single zone glows blue
  const cn = window4(t, C.china9 - 0.15, C.china9 + 0.25, C.ghadi9, C.ghadi9 + 0.4);
  if (cn > 0) out.push(reg('china', ctry('China'), cn, COL.china, 0.75));
  const cz = window4(t, C.ghadi9 + 0.1, C.beijing9, C.sardi9, C.sardi9 + 0.5);
  if (cz > 0) out.push(reg('china_zone', GEO.china_zone, cz, COL.chinaZone, 0.7));
  // India's east and west: Arunachal in the sun, Gujarat in the dark
  const ar = window4(t, C.arunachal10 - 0.1, C.arunachal10 + 0.3, SC.assam - 0.2, SC.assam);
  if (ar > 0) out.push(reg('arunachal', state('Arunachal Pradesh'), ar, COL.arunachal, 0.8));
  const gj = window4(t, C.gujarat10 - 0.1, C.gujarat10 + 0.3, SC.assam - 0.2, SC.assam);
  if (gj > 0) out.push(reg('gujarat', state('Gujarat'), gj, COL.gujarat, 0.8));
  const as = window4(t, C.assam11 - 0.1, C.assam11 + 0.3, SC.gardenEnd, SC.gardenEnd + 0.1);
  if (as > 0) out.push(reg('assam', state('Assam'), as, COL.assam, 0.85));
  const np = window4(t, C.nepal12 - 0.1, C.nepal12 + 0.3, SC.close + 0.2, SC.close + 0.6);
  if (np > 0) out.push(reg('nepal', ctry('Nepal'), np, COL.nepal, 0.85));
  // the close: India in two halves (the proposal), the east lighting up second
  const cw = ramp(t, C.india13 - 0.1, C.india13 + 0.3);
  if (cw > 0) out.push(reg('india_west', GEO.india_split.west, cw, COL.india, 0.7));
  const ce = ramp(t, C.n2_13 - 0.05, C.n2_13 + 0.3);
  if (ce > 0) out.push(reg('india_east', GEO.india_split.east, ce, COL.indiaEast, 0.85));
  return out;
};
