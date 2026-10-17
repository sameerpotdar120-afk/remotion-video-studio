import { random } from 'remotion';
import { easeOut, linear, ramp, window4 } from './anim';
import { C, GEO, P, SC } from './cam';

export type Region = { key: string; rings: P[][]; a: number; color: string; fill: number; phase: number; sat?: number; dx?: number; dy?: number };

export const COL = {
  chile: '#E8263A', spain: '#B3261E', portugal: '#22408A', mapuche: '#D99A2B', bolivia: '#3D7BFF', peru: '#E0A21C', andes: '#FF8A1F',
  gold: '#FFD84A', ink: '#3a2614', paper: '#f3ead6',
  // independence-era countries (bright flat colours, as on the reference)
  gran: '#2EC4B6', brazil: '#57D94F', argentina: '#D8343A', paraguay: '#7B3FC4', chileBlue: '#2F6FE0',
};

const reg = (key: string, rings: P[][], a: number, color: string, sat = 0.75): Region => ({ key, rings, a, color, fill: 1, phase: random(key), sat });
const ctry = (n: string) => GEO.countries[n];

/** Every region's beat. Chile's own fill is drawn separately (it grows south), see ChileFill in Fx. */
export const regionsAt = (t: number): Region[] => {
  const out: Region[] = [];
  // the vintage map after the skit: Spain and Portugal take the continent, the Mapuche hold the south
  const col = window4(t, C.mapuche10 - 0.3, C.mapuche10 + 0.3, C.y1818 - 0.2, C.y1818 + 0.2);
  if (col > 0) {
    out.push(reg('spain', GEO.spain, ramp(t, C.mapuche10 - 0.3, C.mapuche10 + 0.4, easeOut) * col, COL.spain, 0.85));
    out.push(reg('portugal', GEO.portugal, ramp(t, C.mapuche10 - 0.1, C.mapuche10 + 0.6, easeOut) * col, COL.portugal, 0.85));
    out.push(reg('mapuche', GEO.mapuche, ramp(t, C.mapuche10 + 0.3, C.mapuche10 + 0.9, easeOut) * col, COL.mapuche, 0.9));
  }
  // independence: new countries pop in one by one (modern borders, approximate)
  const ind = window4(t, C.y1818 - 0.1, C.y1818 + 0.2, SC.valley - 0.3, SC.valley);
  if (ind > 0) {
    const list: [string, string[], string][] = [
      ['gran', ['Colombia', 'Venezuela', 'Ecuador'], COL.gran], ['brazil', ['Brazil'], COL.brazil], ['peru', ['Peru'], COL.peru],
      ['bolivia', ['Bolivia'], COL.bolivia], ['argentina', ['Argentina'], COL.argentina], ['paraguay', ['Paraguay', 'Uruguay'], COL.paraguay],
    ];
    list.forEach(([k, ns, c], i) => {
      const t0 = C.y1818 + 0.15 + i * 0.16;
      out.push(reg(`ind_${k}`, ns.flatMap(ctry), ramp(t, t0, t0 + 0.3, easeOut) * ind, c, 0.85));
    });
    out.push(reg('ind_chile', GEO.chile_1818, ramp(t, C.y1818 + 1.2, C.y1818 + 1.5, easeOut) * ind, COL.chileBlue, 0.95));
  }
  // the war: Bolivia (with its coast) and Peru (with its south) before Chile takes them
  if (t > C.uttar16 && t < SC.lake + 0.2) {
    const o = 1 - ramp(t, SC.lake - 0.3, SC.lake, linear);
    out.push(reg('war_bolivia', ctry('Bolivia'), ramp(t, C.bolivia16 - 0.1, C.bolivia16 + 0.3, easeOut) * o, COL.bolivia, 0.85));
    out.push(reg('war_peru', ctry('Peru'), ramp(t, C.peru16 - 0.1, C.peru16 + 0.3, easeOut) * o, COL.peru, 0.85));
    const bc = ramp(t, C.bolivia16 - 0.1, C.bolivia16 + 0.3, easeOut) * (1 - ramp(t, C.kinara17 - 0.1, C.kinara17 + 0.3, linear));
    const ps = ramp(t, C.peru16 - 0.1, C.peru16 + 0.3, easeOut) * (1 - ramp(t, C.hissa17 - 0.2, C.hissa17 + 0.2, linear));
    out.push(reg('war_bcoast', GEO.bolivia_coast, bc, COL.bolivia, 0.85));
    out.push(reg('war_psouth', GEO.peru_south, ps, COL.peru, 0.85));
  }
  return out;
};
