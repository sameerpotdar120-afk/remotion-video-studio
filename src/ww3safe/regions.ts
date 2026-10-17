import { random } from 'remotion';
import { easeOut, linear, ramp, window4 } from './anim';
import { C, DURATION_S, GEO, P, SC } from './cam';

export type Region = { key: string; rings: P[][]; a: number; color: string; fill: number; phase: number; sat?: number; dx?: number; dy?: number };

export const COL = {
  war: '#E8263A', safe: '#2EDC5E', aus: '#F08A24', teaser: '#4F7BFF', gold: '#FFD84A', zone: '#36E0C8', winter: '#9aa3a8',
};

const reg = (name: string, a: number, color: string, sat = 0.7): Region => ({
  key: name.replace(/\W/g, ''), rings: GEO.countries[name], a, color, fill: 1, phase: random(name) , sat,
});

/** Every country's beat on the flat map. */
export const regionsAt = (t: number): Region[] => {
  const out: Region[] = [];
  const hook = 1 - ramp(t, SC.globeIn, SC.globeIn + 0.3, linear);
  if (hook > 0) {
    // "America नहीं": the US goes red; "Europe भी नहीं": Europe goes red, country by country as the missiles land
    for (const [i, n] of ['United States of America'].entries()) {
      out.push(reg(n, ramp(t, C.america1 - 0.15 + i * 0.12, C.america1 + 0.3 + i * 0.12, easeOut) * hook, COL.war));
    }
    for (const [i, n] of GEO.groups.hit.entries()) {
      const t0 = C.europe1 - 0.25 + i * 0.045;
      out.push(reg(n, ramp(t, t0, t0 + 0.35, easeOut) * hook, COL.war));
    }
  }
  if (t > SC.flat - 0.1 && t < SC.iceland + 0.2) {
    out.push(reg('Australia', window4(t, C.aus4 - 0.05, C.aus4 + 0.4, C.akela4 + 0.4, C.akela4 + 0.9), COL.aus, 0.5));
    out.push(reg('Fiji', window4(t, C.fiji4 - 0.08, C.fiji4 + 0.3, SC.iceland - 0.2, SC.iceland), COL.safe, 0.85));
    out.push(reg('New Zealand', window4(t, C.nz5 - 0.05, C.nz5 + 0.4, SC.iceland - 0.2, SC.iceland), COL.safe, 0.85));
  }
  if (t > SC.iceland - 0.1 && t < SC.close + 0.1) {
    out.push(reg('Iceland', window4(t, C.iceland6 - 0.08, C.iceland6 + 0.3, SC.close - 0.1, SC.close), COL.safe, 0.85));
  }
  if (t > SC.close - 0.1) {
    // the teaser: blue fills flicker over many countries, a few at a time, so the answer can't be read off the map
    const names = GEO.groups.teaser;
    const step = 0.16;
    const best: Record<string, number> = {};
    for (let k = 0; k * step < DURATION_S - SC.close + 1; k++) {
      const s = SC.close + k * step;
      if (s > t + 0.05 || s < t - 0.8) continue;
      const n = names[Math.floor(random(`tz${k}`) * names.length)];
      best[n] = Math.max(best[n] ?? 0, window4(t, s, s + 0.1, s + 0.42, s + 0.62));
    }
    for (const n of names) if (best[n]) out.push(reg(n, best[n], COL.teaser, 0.9));
  }
  return out;
};
