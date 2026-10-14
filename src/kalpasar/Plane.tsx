import React from 'react';
import { clamp01, easeOut, inOut, lerp, linear, pop, ramp, window4 } from './anim';
import { C, Cam, GEO, P, PLANE, merc, project, pxPerM } from './cam';

export const COL = { gold: '#FFD84A', red: '#FF4D5E', green: '#3DDC84', fresh: '#38D6FF', salt: '#7FE3B0', sand: '#E3B05A', white: '#FFF6E6', violet: '#B67CFF' };

const ringD = (c: Cam, rings: P[][]) =>
  rings.map((r) => r.map((pt, i) => {
    const [x, y] = project(c, pt[0], pt[1]);
    return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join('') + 'Z').join('');
const lineD = (c: Cam, pts: P[]) => pts.map((pt, i) => {
  const [x, y] = project(c, pt[0], pt[1]);
  return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
}).join('');
/** The point a fraction f of the way along a polyline (by length). */
const along = (pts: P[], f: number): P => {
  let tot = 0;
  const seg = pts.slice(1).map((p, i) => { const d = Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]); tot += d; return d; });
  let need = clamp01(f) * tot;
  for (let i = 0; i < seg.length; i++) {
    if (need <= seg[i]) { const q = need / seg[i]; return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)]; }
    need -= seg[i];
  }
  return pts[pts.length - 1];
};

/** A region lit the After Effects way: graded fill, a wide bloom, a hot edge that draws on, and a light sweep. */
const Glow: React.FC<{ c: Cam; rings: P[][]; a: number; color: string; t: number; fill?: number }> = ({ c, rings, a, color, t, fill = 0.22 }) => {
  if (a <= 0.001 || !rings.length) return null;
  const d = ringD(c, rings);
  const pulse = 0.8 + 0.2 * Math.sin(t * 4.2);
  const draw = Math.min(1, a * 1.15);
  return (
    <g opacity={Math.min(1, a * 1.6)}>
      <path d={d} fill={color} fillOpacity={fill * a * pulse} />
      <path d={d} fill="none" stroke={color} strokeWidth={30} strokeOpacity={0.22 * pulse} strokeLinejoin="round" style={{ filter: 'blur(12px)' }} pathLength={1} strokeDasharray={`${draw} 1`} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={3} strokeOpacity={0.9} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray="0.05 0.95" strokeDashoffset={-((t * 0.22) % 1)}
        style={{ filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 4px #fff)` }} />
    </g>
  );
};

// Saurashtra's dry earth: crack lines inside the region (fixed pseudo-random, clipped to Saurashtra)
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const SAU_BB = (() => {
  const pts = GEO.saurashtra.flat();
  return [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
})();
const CRACKS: P[][] = Array.from({ length: 46 }, (_, i) => {
  let x = lerp(SAU_BB[0], SAU_BB[2], rnd(i)), y = lerp(SAU_BB[1], SAU_BB[3], rnd(i + 99));
  const pts: P[] = [[x, y]];
  let ang = rnd(i + 7) * Math.PI * 2;
  for (let k = 0; k < 5; k++) {
    ang += (rnd(i * 13 + k) - 0.5) * 1.6;
    const step = 9000 + rnd(i * 5 + k) * 14000;
    x += Math.cos(ang) * step; y += Math.sin(ang) * step;
    pts.push([x, y]);
  }
  return pts;
});
const SALT: P[] = Array.from({ length: 140 }, (_, i) => [lerp(SAU_BB[0], SAU_BB[2], rnd(i + 500)), lerp(SAU_BB[1], SAU_BB[3], rnd(i + 900))]);

/** Saurashtra district headquarters (illustrative points for the canals; not labelled on screen). */
const DISTRICTS: P[] = [[70.8, 22.3], [70.07, 22.47], [70.46, 21.52], [71.22, 21.6], [72.05, 21.68], [69.61, 21.64], [70.84, 22.82], [71.65, 22.73], [71.67, 22.17]].map(([a, b]) => merc(a, b));

const DAM = GEO.dam;
/** The sea part of the wall (between the two shore points), where the gates are. */
const SEA0 = DAM[1], SEA1 = DAM[2];
export const damBuild = (t: number) => ramp(t, C.aarpaar8 - 0.4, C.km8 + 0.7, inOut);

export const PlaneLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const k = pxPerM(c);
  // ---------------------------------------------------------------- hook and the farmer's dry land
  const indiaA = window4(t, -1, -0.5, C.n60 - 0.3, C.deewar1 - 0.4);  // fully lit on frame 0
  const gujA = window4(t, C.n60 - 0.6, C.n60, C.deewar1 + 0.2, C.socho2);
  const sauA = window4(t, C.saurashtra2 - 0.3, C.saurashtra2 + 0.2, C.door4, C.door4 + 0.6) + window4(t, C.kisan10 - 0.2, C.kisan10 + 0.3, C.bonus11 - 0.3, C.bonus11);
  const dryA = window4(t, C.baarish3 - 0.1, C.baarish3 + 0.6, C.door4, C.door4 + 0.6);
  const cracks = ramp(t, C.kuen3 - 0.2, C.khet3 + 0.4, easeOut);
  const salt = ramp(t, C.khaara3 - 0.1, C.khaara3 + 0.8, easeOut);
  // ---------------------------------------------------------------- the rivers carry fresh water into the gulf... and lose it to the sea
  const riverOn = { mahi: C.mahi5, sabarmati: C.sabarmati5, dhadhar: C.dhadhar5 } as Record<string, number>;
  const riverA = window4(t, C.saamne5 - 0.2, C.saamne5 + 0.3, C.tabhi6 + 0.2, C.tabhi6 + 0.8) + window4(t, C.andar9 - 0.4, C.andar9, C.n1600 + 0.5, C.n1600 + 1.2);
  const saltTint = ramp(t, C.khaare5 - 0.3, C.baha5 + 0.4, inOut) * (t < C.tabhi6 + 1 ? 1 : 0);
  // ---------------------------------------------------------------- the idea: a pencil line across the gulf on the old map
  const pencil = window4(t, C.nadiyon6, C.rok6 + 0.2, C.kalpasar7 - 0.2, C.kalpasar7 + 0.2);
  const pencilP = ramp(t, C.nadiyon6, C.rok6 + 0.3, inOut);
  // ---------------------------------------------------------------- the wall
  const build = damBuild(t);
  const notBuilt = ramp(t, C.n50b - 0.2, C.n50b + 0.6, inOut) * (1 - ramp(t, C.naam15 - 0.3, C.naam15 + 0.3, inOut));
  const damA = t < C.aarpaar8 - 0.4 ? 0 : 1;
  const gatesOpen = ramp(t, C.khulenge9 - 0.2, C.khulenge9 + 0.3, easeOut) * (1 - ramp(t, C.aaj10, C.aaj10 + 0.6, linear));
  const tideHigh = window4(t, C.bharti9 - 0.2, C.bharti9 + 0.5, C.utregi9 - 0.2, C.utregi9 + 0.5);
  const tideLow = window4(t, C.utregi9, C.utregi9 + 0.6, C.andar9 + 0.8, C.aaj10 + 0.4);
  const outflow = window4(t, C.bahar9 - 0.3, C.bahar9 + 0.2, C.aaj10, C.aaj10 + 0.5);
  const inflow = window4(t, C.andar9 - 0.4, C.andar9 + 0.1, C.n1600 + 0.3, C.n1600 + 0.9);
  // ---------------------------------------------------------------- the lake, the canals, the 9 districts
  const lakeFill = ramp(t, C.aaj10 - 0.2, C.n1600 + 0.8, inOut);
  const lakeA = lakeFill * (1 - ramp(t, C.par12, C.par12 + 0.4, linear)) + window4(t, C.naam15 - 0.3, C.naam15 + 0.4, 999, 1000);
  const lakeDream = ramp(t, C.kalpana16 - 0.3, C.kalpana16 + 0.6, inOut);
  const canals = ramp(t, C.kisan10 - 0.1, C.n9 + 0.6, easeOut) * (1 - ramp(t, C.bonus11 - 0.2, C.bonus11 + 0.3, linear));
  // ---------------------------------------------------------------- the routes
  const oldR = ramp(t, C.n356 - 0.5, C.n356 + 0.9, inOut), newR = ramp(t, C.n177 - 0.5, C.n177 + 0.7, inOut);
  const routeA = 1 - ramp(t, C.perfect12 - 0.8, C.perfect12 - 0.3, linear);
  // ---------------------------------------------------------------- the storm and the tide in the twist
  const storm = window4(t, C.par12 - 0.1, C.par12 + 0.3, C.n50b - 0.3, C.n50b + 0.3);
  const surge = window4(t, C.jwaar13 - 0.1, C.n10m + 0.3, C.zameen13, C.zameen13 + 0.5);

  const [s0x, s0y] = project(c, SEA0[0], SEA0[1]), [s1x, s1y] = project(c, SEA1[0], SEA1[1]);
  const gates = 7;
  return (
    <svg width={PLANE.w} height={PLANE.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <clipPath id="kpSau"><path d={ringD(c, GEO.saurashtra)} /></clipPath>
        <clipPath id="kpLake"><path d={ringD(c, GEO.lake)} /></clipPath>
        <linearGradient id="kpLakeG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FF0FF" />
          <stop offset="1" stopColor="#1C8FD8" />
        </linearGradient>
      </defs>

      <Glow c={c} rings={GEO.india} a={indiaA} color={COL.gold} t={t} fill={0.3} />
      <Glow c={c} rings={GEO.gujarat} a={gujA} color={COL.gold} t={t} fill={0.12} />
      <Glow c={c} rings={GEO.saurashtra} a={Math.min(1, sauA)} color={dryA > 0.5 ? COL.sand : COL.gold} t={t} fill={0.14 + 0.18 * dryA} />

      {/* dry, cracked, salty earth */}
      {dryA > 0.001 && (
        <g clipPath="url(#kpSau)" opacity={dryA}>
          <path d={ringD(c, GEO.saurashtra)} fill="#8a5a22" fillOpacity={0.35} />
          {CRACKS.map((pts, i) => (
            <path key={i} d={lineD(c, pts)} fill="none" stroke="#2a1606" strokeWidth={Math.max(1.5, 900 * k)} strokeLinecap="round" strokeOpacity={0.85}
              pathLength={1} strokeDasharray={`${clamp01(cracks * 1.3 - rnd(i) * 0.3)} 1`} />
          ))}
          {SALT.map((p, i) => {
            const [x, y] = project(c, p[0], p[1]);
            const s = clamp01(salt * 1.4 - rnd(i + 3) * 0.4);
            return s > 0 ? <circle key={i} cx={x} cy={y} r={(2 + rnd(i) * 3) * s} fill="#fff" opacity={0.7 * s} /> : null;
          })}
        </g>
      )}

      {/* the rivers: fresh water flows toward the gulf, then turns salty at the sea */}
      {riverA > 0.001 && Object.entries(GEO.rivers).map(([name, pts]) => {
        const on = ramp(t, (riverOn[name] ?? C.saamne5) - 0.2, (riverOn[name] ?? C.saamne5) + 0.6, easeOut);
        if (on <= 0) return null;
        const d = lineD(c, pts);
        const col = saltTint > 0.5 ? COL.salt : COL.fresh;
        return (
          <g key={name} opacity={Math.min(1, riverA)}>
            <path d={d} fill="none" stroke={col} strokeWidth={18} strokeOpacity={0.3} strokeLinecap="round" pathLength={1} strokeDasharray={`${on} 1`} style={{ filter: 'blur(6px)' }} />
            <path d={d} fill="none" stroke={col} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={`${on} 1`} style={{ filter: `drop-shadow(0 0 6px ${col})` }} />
            <path d={d} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="0.03 0.09" strokeDashoffset={-((t * 0.18) % 1)} opacity={on} />
          </g>
        );
      })}
      {saltTint > 0.01 && riverA > 0.01 && (
        <g opacity={saltTint * Math.min(1, riverA)}>
          {Object.values(GEO.rivers).map((pts, i) => {
            const [x, y] = project(c, ...pts[pts.length - 1]);
            const r = (12000 + 9000 * ((t * 0.8 + i * 0.3) % 1)) * k;
            return <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={COL.salt} strokeWidth={4} opacity={1 - ((t * 0.8 + i * 0.3) % 1)} />;
          })}
        </g>
      )}

      {/* the idea: a pencil line across the gulf */}
      {pencil > 0.001 && (
        <path d={lineD(c, DAM)} fill="none" stroke="#3a2a14" strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={`${pencilP} 1`}
          opacity={pencil} style={{ filter: 'drop-shadow(0 0 2px #f5e6c0)' }} />
      )}
      {pencil > 0.001 && (() => {
        const [hx, hy] = project(c, ...along(DAM, pencilP));
        return <circle cx={hx} cy={hy} r={10} fill="#3a2a14" opacity={pencil * (pencilP < 1 ? 1 : 0)} />;
      })()}

      {/* the lake: it fills from the river mouths in the north down to the wall */}
      {lakeA > 0.001 && (() => {
        const [, yTop] = project(c, 0, merc(0, 22.45)[1]), [, yDam] = project(c, 0, SEA0[1]);
        const yFill = lerp(yTop, yDam + 40, lakeFill);
        return (
          <g clipPath="url(#kpLake)" opacity={Math.min(1, lakeA) * (1 - 0.75 * lakeDream)}>
            <rect x={0} y={yTop - 200} width={PLANE.w} height={Math.max(0, yFill - yTop + 200)} fill="url(#kpLakeG)" fillOpacity={0.72} />
            <rect x={0} y={yFill - 6} width={PLANE.w} height={12} fill="#E8FDFF" opacity={lakeFill < 1 ? 0.9 : 0} style={{ filter: 'blur(3px)' }} />
            {Array.from({ length: 10 }, (_, i) => {
              const yy = lerp(yTop, yDam, (i + 0.5) / 10) + Math.sin(t * 1.4 + i) * 6;
              return <rect key={i} x={0} y={yy} width={PLANE.w} height={2} fill="#fff" opacity={yy < yFill ? 0.18 : 0} />;
            })}
          </g>
        );
      })()}
      {lakeDream > 0.01 && (
        <path d={ringD(c, GEO.lake)} fill="none" stroke="#BFF4FF" strokeWidth={4} strokeDasharray="14 12" opacity={lakeDream * (0.6 + 0.4 * Math.sin(t * 9))} />
      )}

      {/* canals from the lake into Saurashtra, and the 9 districts */}
      {canals > 0.001 && DISTRICTS.map((d, i) => {
        const src: P = merc(72.3, 22.05);
        const [ax, ay] = project(c, src[0], src[1]), [bx, by] = project(c, d[0], d[1]);
        const mxp = (ax + bx) / 2, myp = (ay + by) / 2 - Math.hypot(bx - ax, by - ay) * 0.15;
        const p = clamp01(canals * 1.5 - i * 0.05);
        const dot = clamp01(pop(t, C.n9 + i * 0.08, 9, 260));
        return (
          <g key={i} opacity={canals}>
            <path d={`M${ax},${ay} Q${mxp},${myp} ${bx},${by}`} fill="none" stroke={COL.fresh} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`}
              style={{ filter: `drop-shadow(0 0 6px ${COL.fresh})` }} />
            {dot > 0.01 && <circle cx={bx} cy={by} r={16 * dot} fill={COL.green} stroke="#fff" strokeWidth={4} style={{ filter: `drop-shadow(0 0 10px ${COL.green})` }} />}
          </g>
        );
      })}

      {/* the sea side of the wall: high tide pushes in, low tide pulls out; in the storm it turns dark and heaves */}
      {(tideHigh > 0.01 || tideLow > 0.01 || storm > 0.01) && (
        <g>
          <path d={ringD(c, GEO.sea_south)} fill={storm > 0.5 ? '#0a2236' : '#1e6fb0'} fillOpacity={0.28 * Math.max(tideHigh, storm) + 0.12 * tideLow} />
          {Array.from({ length: 6 }, (_, i) => {
            const dir = tideHigh > tideLow ? 1 : -1;
            const ph = ((t * 0.6 * dir + i / 6) % 1 + 1) % 1;
            const [, yd] = project(c, 0, SEA0[1]);
            const y = yd + (40 + ph * 520) * (storm > 0.5 ? 1.2 : 1);
            return <path key={i} d={`M${s0x - 40},${y} Q${(s0x + s1x) / 2},${y - 18 - 30 * surge} ${s1x + 40},${y}`} fill="none" stroke="#E8FDFF" strokeWidth={3 + 4 * surge}
              opacity={(1 - ph) * 0.7 * Math.max(tideHigh, tideLow, storm)} />;
          })}
        </g>
      )}

      {/* the wall: concrete with a gold glow, built west to east; gates along the sea part */}
      {damA > 0 && build > 0 && (
        <g opacity={1 - 0.65 * notBuilt}>
          <path d={lineD(c, DAM)} fill="none" stroke={COL.gold} strokeWidth={34} strokeOpacity={0.3} strokeLinecap="round" pathLength={1} strokeDasharray={`${build} 1`} style={{ filter: 'blur(10px)' }} />
          <path d={lineD(c, DAM)} fill="none" stroke="#d9d4c7" strokeWidth={Math.max(10, 1600 * k)} strokeLinecap="round" pathLength={1} strokeDasharray={notBuilt > 0.5 ? '0.02 0.02' : `${build} 1`} />
          <path d={lineD(c, DAM)} fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={`${build} 1`} style={{ filter: `drop-shadow(0 0 8px ${COL.gold})` }} />
          {build >= 0.99 && Array.from({ length: gates }, (_, i) => {
            const q = (i + 1) / (gates + 1);
            const gx = lerp(s0x, s1x, q), gy = lerp(s0y, s1y, q);
            const open = gatesOpen;
            const col = open > 0.5 ? COL.green : tideHigh > 0.3 ? COL.red : '#ffffff';
            return (
              <g key={i}>
                <rect x={gx - 9} y={gy - 18 - 14 * open} width={18} height={36} rx={4} fill={col} stroke="#111" strokeWidth={2} style={{ filter: `drop-shadow(0 0 6px ${col})` }} />
              </g>
            );
          })}
          {/* the salt water leaving through the open gates (south) and the river water filling in (north) */}
          {outflow > 0.01 && Array.from({ length: 24 }, (_, i) => {
            const q = ((t * 0.5 + rnd(i)) % 1);
            const x = lerp(s0x, s1x, (i % gates + 1) / (gates + 1)) + (rnd(i + 3) - 0.5) * 20;
            const y = lerp(s0y, s1y, (i % gates + 1) / (gates + 1)) + 20 + q * 260;
            return <circle key={`o${i}`} cx={x} cy={y} r={6} fill={COL.salt} opacity={outflow * (1 - q)} />;
          })}
          {inflow > 0.01 && Object.values(GEO.rivers).map((pts, j) => {
            const [mx0, my0] = project(c, ...pts[pts.length - 1]);
            return Array.from({ length: 10 }, (_, i) => {
              const q = ((t * 0.45 + i / 10 + j * 0.13) % 1);
              const x = lerp(mx0, lerp(s0x, s1x, 0.3 + 0.2 * j), q), y = lerp(my0, s0y - 30, q);
              return <circle key={`i${j}${i}`} cx={x} cy={y} r={7} fill={COL.fresh} opacity={inflow * Math.sin(q * Math.PI)} style={{ filter: `drop-shadow(0 0 6px ${COL.fresh})` }} />;
            });
          })}
        </g>
      )}

      {/* Bhavnagar → Surat: the long way round the gulf, then straight across the wall */}
      {oldR > 0.001 && routeA > 0.01 && (
        <g opacity={routeA}>
          <path d={lineD(c, GEO.route_old)} fill="none" stroke={COL.red} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${oldR} 1`}
            strokeOpacity={1 - 0.55 * newR} style={{ filter: `drop-shadow(0 0 8px ${COL.red})` }} />
          {newR > 0.001 && <path d={lineD(c, GEO.route_new)} fill="none" stroke={COL.green} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" pathLength={1}
            strokeDasharray={`${newR} 1`} style={{ filter: `drop-shadow(0 0 10px ${COL.green})` }} />}
          {newR > 0.001 && (() => { const [x, y] = project(c, ...along(GEO.route_new, newR)); return <circle cx={x} cy={y} r={14} fill="#fff" stroke={COL.green} strokeWidth={5} />; })()}
        </g>
      )}
    </svg>
  );
};

export { along, lineD, ringD };
