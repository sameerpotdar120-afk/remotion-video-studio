import { random } from 'remotion';
import { ramp, window4 } from './anim';
import { C, CUT, DURATION_S, GEO, P } from './cam';

export type Region = { key: string; rings: P[][]; a: number; color: string; fill: number; phase: number; sat?: number; hatch?: boolean; pulse?: number; dx?: number; dy?: number };

/** The map colours match the characters (motion/theme.ts). */
export const COL = {
  brit: '#B51CC9', fr: '#F03A0B', siam: '#F2D80A', dutch: '#4B1FB0', spain: '#2FD27A', portugal: '#2E9BDA', burma: '#2EE6A8', ochre: '#D89A00',
  core: '#3BE07A', grey: '#7C8794', cyan: '#36D6FF', gold: '#FFD84A', red: '#FF2B3A', yellow: '#FFE11A',
};

const mixHex = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * Math.min(1, Math.max(0, t))).toString(16).padStart(2, '0')).join('');
};
const reg = (key: string, rings: P[][], a: number, color: string, sat = 0.75, more: Partial<Region> = {}): Region => ({ key, rings, a, color, fill: 1, phase: random(key), sat, ...more });

/** Every colony greys out on "इसीलिए Thailand कभी … colony नहीं बना" while Siam glows. */
const greyK = (t: number) => ramp(t, C.isiliye20 + 0.2, C.isiliye20 + 1.2);
const colony = (c: string, t: number) => mixHex(c, COL.grey, greyK(t) * 0.85);

/** The map's beats; later entries draw on top. */
export const regionsAt = (t: number): Region[] => {
  const out: Region[] = [];
  const end = DURATION_S + 1;
  // the colonies of the 1890s: British India first (in India's official boundary), the rest fill in on "बगल में"
  const bi = ramp(t, C.britain1 - 0.05, C.britain1 + 0.35);
  if (bi > 0) out.push(reg('british_india', GEO.british_india, bi, colony(COL.brit, t), 0.7));
  const seq: [string, P[][], string, number][] = [
    ['burma', GEO.burma, COL.brit, 0.35], ['malaya', GEO.malaya_british, COL.brit, 0.6], ['vietnam', GEO.vietnam, COL.fr, 0.85],
    ['cambodia_rest', GEO.cambodia_rest, COL.fr, 1.0], ['dutch', GEO.dutch_east_indies, COL.dutch, 1.25], ['philippines', GEO.philippines, COL.spain, 1.5],
    ['timor', GEO.timor, COL.portugal, 1.7],
  ];
  for (const [key, rings, color, dt] of seq) {
    const a = ramp(t, C.bagal1 + dt, C.bagal1 + dt + 0.35);
    if (a <= 0) continue;
    // Burma reads as not yet British (teal) while Britain pushes in from India, until "Burma ले लिया"
    let col = color;
    if (key === 'burma') col = mixHex(COL.burma, COL.brit, t < C.paschim4 - 0.1 ? 1 : ramp(t, C.burma4, C.burma4 + 0.5));
    out.push(reg(key, rings, a, colony(col, t), key === 'dutch' || key === 'philippines' ? 0.55 : 0.75));
  }
  // Siam: plain in the hook (the "?"), then lemon yellow, in its 1890s extent
  const sm = ramp(t, C.thailand2 - 0.05, C.thailand2 + 0.35);
  if (sm > 0) out.push(reg('siam', GEO.siam_1890, sm, COL.siam, 0.8));
  // "जो भी Siam को लेता": the east goes French, the west British, and their borders touch
  const take = window4(t, CUT.balance[1], CUT.balance[1] + 0.4, CUT.palace[0] + 0.1, CUT.palace[0] + 0.2);
  if (take > 0) {
    out.push(reg('take_w', GEO.sphere_west, take, COL.brit, 0.8));
    out.push(reg('take_e', GEO.sphere_east, take, COL.fr, 0.8));
  }
  // the buffer: cyan stripes sweep across Siam
  const buf = window4(t, C.bas15 - 0.1, C.bas15 + 0.5, C.chao15 - 0.2, C.chao15 + 0.3);
  if (buf > 0) out.push(reg('buffer', GEO.siam_1890, buf, COL.cyan, 0.8, { hatch: true }));
  // the spheres (1904): British hatching west, French east; the protected core stays clear and green
  const sph = window4(t, C.matlab16 - 0.1, C.matlab16 + 0.4, C.french17 - 0.1, C.french17);
  if (sph > 0) {
    out.push(reg('sph_w', GEO.sphere_west, sph, COL.brit, 0.8, { hatch: true }));
    out.push(reg('sph_e', GEO.sphere_east, sph, COL.fr, 0.8, { hatch: true }));
  }
  const core = window4(t, C.chao15 - 0.05, C.chao15 + 0.35, C.french17 - 0.1, C.french17);
  if (core > 0) out.push(reg('core', GEO.chao_phraya_core, core, COL.core, 0.85));
  // "पर किनारे?": the edges pulse red
  const edge = window4(t, C.kinare16 - 0.05, C.kinare16 + 0.2, C.french17 - 0.1, C.french17);
  if (edge > 0) {
    for (const [k, r] of [['e_laos', GEO.laos], ['e_cam', GEO.cambodia_1907], ['e_malay', GEO.malay4]] as [string, P[][]][]) {
      out.push(reg(k, r, edge, COL.siam, 0.3, { pulse: edge }));
    }
  }
  // the losses: Laos (1893) and western Cambodia (1907) to France, the four Malay states (1909) to Britain
  const lost = (t0: number) => ramp(t, t0 - 0.05, t0 + 0.6);
  const dim = ramp(t, C.kinare19 - 0.1, C.kinare19 + 0.5) * (1 - ramp(t, C.isiliye20, C.isiliye20 + 0.5));
  const lostCol = (c: string, t0: number) => colony(mixHex(COL.siam, c, ramp(t, t0, t0 + 0.6)), t);
  const la = lost(C.laos17);
  if (la > 0) out.push(reg('laos', GEO.laos, la, lostCol(COL.fr, C.laos17), 0.8 - 0.4 * dim));
  const cb = lost(C.cambodia17);
  if (cb > 0) out.push(reg('cambodia_1907', GEO.cambodia_1907, cb, lostCol(COL.fr, C.cambodia17), 0.8 - 0.4 * dim));
  const ml = lost(C.malaya17);
  if (ml > 0) out.push(reg('malay4', GEO.malay4, ml, lostCol(COL.brit, C.malaya17), 0.8 - 0.4 * dim));
  // the heart that was kept, and Siam glowing at the end while the colonies go grey
  const heart = ramp(t, C.kinare19 + 0.3, C.dil19 + 0.2);
  if (heart > 0) out.push(reg('heart', GEO.siam_today, heart * (t < end ? 1 : 0), COL.yellow, 0.95));
  return out;
};

/** When each region lands (for the lift): its first fill, plus the moments the VO names it again. */
export const LAND: Record<string, number[]> = {
  burma: [C.burma4], vietnam: [C.vietnam5], cambodia_rest: [C.cambodia5], siam: [C.siam2, C.beech6, C.sarhad7], laos: [C.laos17], cambodia_1907: [C.cambodia17],
  malay4: [C.malaya17], core: [C.chao15], heart: [C.dil19, C.colony20],
};
