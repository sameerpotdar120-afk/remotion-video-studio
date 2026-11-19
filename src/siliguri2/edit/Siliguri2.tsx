import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { ASPECT } from './assets';
import { C, CAPS, DURATION_S, LOOPF, PL, camK, camS, camSpeed, rollAt, shake } from './cam';
import { At, Badge, Big, COL, Clouds, DARK, FOCAL, FlatSprite, OnGround, Pin, Prop, Ribbon, Stamp, TerritoryTag, useTextures } from './Kit';
import { LABEL, TITLE, UI, useFonts } from './font';
import { CamS, HL, M, P3, Terrain, V3, groundXZ, project, useHeights, xz } from './Terrain';

/**
 * Siliguri Corridor v2 (Nov 19): the reference's look rebuilt from open data. A real 3D terrain (SRTM heights, EOX
 * Sentinel-2 imagery) with strong country colours, glowing rivers and snow; procedural clouds parting at the start
 * and closing at the end (the loop); code-drawn flag tags, pins, ringed equipment badges and ground labels; jets with
 * contrails; the creator's photoreal props standing on the terrain.
 */
export const SG_DURATION_S = DURATION_S;
const D = DURATION_S;
const AUDIO = 'siliguri2/audio/mix.wav';
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.max(0, Math.min(fi > 0 ? ramp(t, a, a + fi, linear) : t >= a ? 1 : 0, fo > 0 ? 1 - ramp(t, b - fo, b, linear) : t <= b ? 1 : 0));
const LL = (k: string) => PL[k];
/** Loop-wrapped time for things alive across the seam (the hook's jets): runs from -lead .. through 0 .. */
const wrapT = (t: number, lead: number) => (t > D - lead ? t - D : t);

// ------------------------------------------------------------------ routes (lon, lat)
const ROUTE: [number, number][] = [[88.263, 27.041], [88.32, 26.92], [88.43, 26.73], [88.6, 26.66], [88.72, 26.53], [89.0, 26.45], [89.45, 26.33], [89.98, 26.4], [90.55, 26.48], [91.0, 26.3], [91.74, 26.145]];
const RAIL: [number, number][] = [[87.2, 25.85], [87.6, 25.95], [87.95, 26.1], [88.17, 26.45], [88.33, 26.62], [88.6, 26.64], [88.72, 26.53], [89.1, 26.42], [89.45, 26.33], [89.98, 26.32], [90.55, 26.38], [91.0, 26.2], [91.74, 26.15]];
const ROAD: [number, number][] = [[87.2, 26.0], [87.95, 26.2], [88.2, 26.52], [88.4, 26.68], [88.62, 26.71], [88.9, 26.62], [89.4, 26.45], [90.0, 26.42], [91.0, 26.3], [91.74, 26.15]];
const DOKLAM_ROAD: [number, number][] = [[88.925, 27.39], [88.935, 27.35], [88.945, 27.315], [88.955, 27.285], [88.965, 27.262]];
const JETS_HOOK: [number, number][] = [[85.8, 26.2], [87.0, 26.5], [88.2, 26.75], [89.3, 26.9], [90.6, 26.9]];
const JETS_HASI: [number, number][] = [[87.2, 25.9], [88.0, 26.3], [88.7, 26.6], [89.369, 26.698], [89.9, 26.8]];

const dens = (pts: [number, number][], step = 0.02): [number, number][] => {
  const o: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < n; k++) o.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  o.push(pts[pts.length - 1]);
  return o;
};
const along = (pts: [number, number][], s: number): { p: [number, number]; head: number } => {
  const L: number[] = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot((pts[i][0] - pts[i - 1][0]) * Math.cos(0.46), pts[i][1] - pts[i - 1][1]));
  const tgt = clamp01(s) * L[L.length - 1];
  let i = 1;
  while (i < pts.length - 1 && L[i] < tgt) i++;
  const q = (tgt - L[i - 1]) / Math.max(1e-9, L[i] - L[i - 1]);
  const a = pts[i - 1], b = pts[i];
  const p: [number, number] = [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];
  const head = Math.atan2((b[0] - a[0]) * Math.cos(0.46), b[1] - a[1]);
  return { p, head };
};

// ------------------------------------------------------------------ the highlights the ground shader draws
const hlAt = (t: number): HL => ({
  corr: Math.max(0.55 * (1 - win(t, C.ne1 - 0.3, C.sili + 99, 0.4, 0)), win(t, C.sili - 0.1, C.jude, 0.3, 0.5), win(t, C.corr2 - 0.2, C.army2, 0.2, 0.4), win(t, C.pooche - 1.2, D + 1, 0.8, 0) * 0.55 / 0.55 * 0.55, win(t, -1, C.ne1 - 0.3, 0, 0.4) * 0.55),
  corrRed: win(t, -1, C.ne1, 0, 0.4) * 0.5 + win(t, C.pooche - 1.2, D + 1, 0.8, 0) * 0.5 + win(t, C.sili, C.jude, 0.3, 0.4) * 0.6,
  corrLine: win(t, C.n22 - 0.1, C.upar1, 0.2, 0.3) * 0.8 + win(t, C.sili, C.neck + 0.8, 0.2, 0.3) * 0.9,
  fort: win(t, C.kila - 0.2, C.pooche, 0.3, 0.6),
  chumbi: win(t, C.china1 - 0.1, C.sili - 0.3, 0.2, 0.4) * 0.8 + win(t, C.chumbi - 0.1, C.doklam + 0.4, 0.2, 0.4),
  ne: 8 * easeOut(ramp(t, C.ne1 + 0.1, C.n8 + 0.5, linear)) * (1 - ramp(t, C.upar2 - 0.4, C.upar2 + 0.2, linear)) + 8 * win(t, C.ne2 - 0.4, C.parl + 1.2, 0.3, 0.5) * 0.4,
  neLine: win(t, C.ne1, C.upar2, 0.3, 0.4) * 0.7 + win(t, C.greater - 0.2, C.gardan, 0.3, 0.4) * 0.8,
  hatch: win(t, C.greater - 0.1, C.gardan - 0.2, 0.3, 0.4),
  hatchR: 900 * easeOut(ramp(t, C.greater - 0.1, C.ne2 + 0.8, linear)),
  bang: win(t, C.bang1 - 0.2, C.jagane + 0.6, 0.2, 0.5) + win(t, C.dhaka - 0.2, C.greater, 0.2, 0.4) * 0.8,
  pulse: Math.sin(t * LOOPF(70)),
  dim: 0,
});

// ------------------------------------------------------------------ cloud cover (closed at the seam's edges, open in between)
const coverAt = (t: number) => {
  const open = ramp(t, 0, 1.4, easeOut), close = ramp(t, D - 2.2, D, inOut);
  return 0.52 + 0.75 * open * (1 - close);
};

// ------------------------------------------------------------------ the three.js extras (jets, contrails, train, clouds)
const JET = 'siliguri2/img/j_jet_top.png', TRAIN = 'siliguri2/img/t_train_top.png';
const formation = [[0, 0], [-1.2, -1.6], [1.2, -1.6], [-2.4, -3.2], [2.4, -3.2]];
const Jets: React.FC<{ h: Float32Array; tex: Record<string, any>; path: [number, number][]; s: number; alt: number; len: number; o: number; trail: number }> = ({ h, tex, path, s, alt, len, o, trail }) => {
  if (o <= 0.01) return null;
  const items: React.ReactNode[] = [];
  formation.forEach(([fx, fz], i) => {
    const lead = along(path, s);
    const [cx, cz] = xz(lead.p[0], lead.p[1]);
    const ch = Math.cos(lead.head), sh = Math.sin(lead.head);
    // offsets in the jet's frame: fx to the right, fz backward (km scaled by len)
    const ox = (fx * ch - fz * sh) * len, oz = (-fx * sh - fz * ch) * len;
    const gy = Math.max(0, groundXZ(h, cx + ox, cz + oz));
    const pos: V3 = [cx + ox, gy + alt, cz + oz];
    // the contrail: back along the path
    const pts: V3[] = [];
    for (let k = 24; k >= 0; k--) {
      const b = along(path, s - (trail * k) / 24);
      const [bx, bz] = xz(b.p[0], b.p[1]);
      const bch = Math.cos(b.head), bsh = Math.sin(b.head);
      const bo = [(fx * bch - fz * bsh) * len, (-fx * bsh - fz * bch) * len];
      const back = 0.45 * len;
      pts.push([bx + bo[0] - bsh * back, gy + alt - 0.05, bz + bo[1] + bch * back]);
    }
    items.push(<Ribbon key={`r${i}`} pts={pts} width={len * 0.16} opacity={0.75 * o} fadeIn={0.9} flat={false} />);
    items.push(<FlatSprite key={`j${i}`} tex={tex[JET]} pos={pos} head={lead.head} len={len} aspect={ASPECT.j_jet_top} shadow shadowY={gy} opacity={o} />);
  });
  return <>{items}</>;
};

const Extras: React.FC<{ t: number; h: Float32Array; tex: Record<string, any>; cs: CamS }> = ({ t, h, tex, cs }) => {
  const tw = wrapT(t, 1.6);
  const hookS = (tw + 1.6) / 6.5;
  const hookO = win(tw, -1.6, 6.0, 0.01, 0.8);
  const hasS = ramp(t, C.hasimara - 1.6, C.s400 + 0.4, linear);
  const hasO = win(t, C.hasimara - 1.5, C.s400 + 0.9, 0.3, 0.5);
  const trainS = ramp(t, C.ne1 + 1.2, C.upar2, linear);
  const trainO = win(t, C.crore - 0.2, C.upar2 - 0.1, 0.3, 0.4);
  const tr = along(RAIL, 0.18 + 0.5 * trainS);
  const cl = coverAt(t);
  const [lx, lz] = [cs.look[0], cs.look[2]];
  return (
    <>
      <Jets h={h} tex={tex} path={JETS_HOOK} s={hookS} alt={28} len={20} o={hookO} trail={0.22} />
      <Jets h={h} tex={tex} path={JETS_HASI} s={0.1 + 0.62 * hasS} alt={22} len={16} o={hasO} trail={0.2} />
      {trainO > 0.01 && <FlatSprite tex={tex[TRAIN]} pos={P3(h, tr.p[0], tr.p[1], 0.25)} head={tr.head} len={60} aspect={ASPECT.t_train_top} shadow shadowY={P3(h, tr.p[0], tr.p[1])[1]} opacity={trainO} />}
      <Clouds at={[lx, lz + 60]} cover={cl} t={wrapT(t, 3)} o={1} base={Math.min(cs.pos[1] * 0.42, 140)} />
    </>
  );
};

// ------------------------------------------------------------------ the overlays (projected onto the terrain)
const Overlays: React.FC<{ t: number; h: Float32Array; cs: CamS }> = ({ t, h, cs }) => {
  const pr = (lon: number, lat: number, up = 0) => project(cs, 1080, 1920, P3(h, lon, lat, up));
  const at = (k: string, up = 0) => pr(LL(k)[0], LL(k)[1], up);
  const sizeAt = (lon: number, lat: number, km: number) => { const q = pr(lon, lat); return (km * FOCAL) / q[3]; };
  const svgLine = (pts: [number, number][], up = 0.25) => dens(pts, 0.015).map(([lo, la], i) => { const [x, y] = pr(lo, la, up); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join('');
  const w = win;
  const tw = wrapT(t, 1.6);
  // ---- the country tags (on at the seam too)
  const tagO = Math.max(win(tw, -2, C.ne1 - 0.3, 0.01, 0.4), win(t, C.pooche - 1, D + 1, 0.6, 0));
  const chinaP = pr(89.4, 28.25, 1), bangP = pr(89.3, 25.4, 0.5), nepalP = pr(87.55, 27.05, 1);
  const tagS = (d: number) => Math.min(1.15, Math.max(0.55, 420 / d));
  // ---- the 22 km bar
  const g0 = pr(M.gap[0][0], M.gap[0][1], 0.3), g1 = pr(M.gap[1][0], M.gap[1][1], 0.3);
  const barP = ramp(t, C.n22 - 0.2, C.n22 + 0.3, easeOut);
  const barO = w(t, C.n22 - 0.25, C.baithi, 0.1, 0.4);
  const km = Math.round(22 * easeOut(ramp(t, C.n22 - 0.1, C.patti, linear)));
  // ---- the route Darjeeling -> Guwahati
  const routeP = ramp(t, C.guw - 0.2, C.n22 + 0.2, inOut);
  const routeO = w(t, C.guw - 0.3, C.upar1 + 0.4, 0.1, 0.5);
  const routeD = svgLine(ROUTE, 0.4);
  // ---- corridor label lying on the ground
  const cc = M.corridor_c;
  const labO = Math.max(w(t, C.sili - 0.15, C.ne1 + 0.2, 0.2, 0.4), w(tw, -2, C.darj + 0.6, 0.01, 0.5) * 0.0);
  const fortO = w(t, C.kila - 0.15, C.pooche - 0.2, 0.25, 0.5);
  // ---- lines through the corridor
  const linkP = ramp(t, C.log - 0.2, C.jude + 0.4, inOut);
  const linkO = w(t, C.log - 0.3, C.upar2, 0.2, 0.4);
  // ---- Doklam
  const roadP = ramp(t, C.sadak1 - 0.1, C.pahadi + 0.2, inOut);
  const roadO = w(t, C.sadak1 - 0.2, C.neeche, 0.2, 0.4);
  const coneO = w(t, C.pahadi - 0.1, C.army2 - 0.2, 0.3, 0.4);
  const jp = at('jampheri', 0.3);
  // ---- props
  const prop = (k: string, lon: number, lat: number, kmW: number, t0: number, t1: number, ring?: string, flip = false) => {
    const q = pr(lon, lat);
    if (!q[2] || t < t0 - 0.1 || t > t1 + 0.4) return null;
    return <Prop key={k + t0} k={k} x={q[0]} y={q[1]} w={(kmW * FOCAL) / q[3]} p={pop(t, t0, 10, 180)} o={w(t, t0 - 0.05, t1, 0.15, 0.35)} ring={ring} flip={flip} />;
  };
  // ---- counters
  const n73 = Math.max(1, Math.round(73 * easeOut(ramp(t, C.n73 - 0.15, C.sadak2 - 0.1, linear))));
  return (
    <AbsoluteFill>
      {/* the corridor label lying on the ground */}
      <OnGround cs={cs} hts={h} lon={cc[0] + 0.05} lat={cc[1] + 0.02} wKm={95} hKm={25} ang={18} elW={1000} elH={260} o={labO * pop(t, C.sili - 0.15, 12, 160)}>
        <div style={{ width: 1000, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontWeight: 800, fontSize: 168, lineHeight: 1, background: 'linear-gradient(180deg, #FFE27A, #FF8A1A 55%, #E2380E)', WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 18px rgba(255,120,20,0.9)) drop-shadow(0 6px 4px rgba(0,0,0,0.7))', whiteSpace: 'nowrap' }}>सिलीगुड़ी कॉरिडोर</div>
      </OnGround>
      <OnGround cs={cs} hts={h} lon={cc[0] + 0.05} lat={cc[1] + 0.02} wKm={110} hKm={33} ang={10} elW={1000} elH={300} o={fortO * pop(t, C.kila - 0.15, 12, 160)}>
        <div style={{ width: 1000, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontWeight: 800, fontSize: 230, lineHeight: 1, background: 'linear-gradient(180deg, #E8F6FF, #6FC0FF 55%, #2F6BFF)', WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 22px rgba(80,170,255,0.95)) drop-shadow(0 6px 4px rgba(0,0,0,0.7))' }}>किला</div>
      </OnGround>
      {/* the S-400 umbrella: a ring lying on the ground round the corridor */}
      <OnGround cs={cs} hts={h} lon={88.45} lat={26.65} wKm={190} hKm={190} elW={800} elH={800} o={w(t, C.s400 - 0.2, C.garrison + 0.3, 0.3, 0.5)}>
        <svg width={800} height={800}><circle cx={400} cy={400} r={380 * easeOut(ramp(t, C.s400 - 0.2, C.s400 + 0.6, linear))} fill="rgba(80,170,255,0.12)" stroke="#8FD0FF" strokeWidth={10} strokeDasharray="40 22" /></svg>
      </OnGround>

      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>
        {/* Darjeeling -> Guwahati: one road, through the corridor */}
        {routeO > 0 && <g opacity={routeO}>
          <path d={routeD} pathLength={1} fill="none" stroke={COL.gold} strokeWidth={22} strokeDasharray={`${routeP} 2`} opacity={0.5} filter="url(#glow)" />
          <path d={routeD} pathLength={1} fill="none" stroke="#FFF3B0" strokeWidth={7} strokeLinecap="round" strokeDasharray={`${routeP} 2`} />
        </g>}
        {/* road, rail and pipeline through the neck */}
        {linkO > 0 && [[RAIL, '#FFD23A'], [ROAD, '#FF8A1A']].map(([pts, c], i) => {
          const d = svgLine(pts as [number, number][], 0.3);
          return <g key={i} opacity={linkO}>
            <path d={d} pathLength={1} fill="none" stroke={c as string} strokeWidth={20} strokeDasharray={`${linkP} 2`} opacity={0.55} filter="url(#glow)" />
            <path d={d} pathLength={1} fill="none" stroke="#FFF6D8" strokeWidth={5} strokeLinecap="round" strokeDasharray={`${linkP} 2`} />
          </g>;
        })}
        {/* the 22 km bar across the narrowest point */}
        {barO > 0 && g0[2] && g1[2] && <g opacity={barO}>
          {(() => {
            const mxp = (g0[0] + g1[0]) / 2, myp = (g0[1] + g1[1]) / 2;
            const ax = mxp + (g0[0] - mxp) * barP, ay = myp + (g0[1] - myp) * barP, bx = mxp + (g1[0] - mxp) * barP, by = myp + (g1[1] - myp) * barP;
            const nx = -(by - ay), ny = bx - ax, nl = Math.hypot(nx, ny) || 1;
            const tk = 26;
            return <>
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#000" strokeOpacity={0.5} strokeWidth={14} />
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#fff" strokeWidth={7} />
              {[[ax, ay], [bx, by]].map(([x, y], i) => <line key={i} x1={x + (nx / nl) * tk} y1={y + (ny / nl) * tk} x2={x - (nx / nl) * tk} y2={y - (ny / nl) * tk} stroke="#fff" strokeWidth={7} />)}
            </>;
          })()}
        </g>}
        {/* Doklam: China's road south toward the ridge */}
        {roadO > 0 && <g opacity={roadO}>
          <path d={svgLine(DOKLAM_ROAD, 0.3)} pathLength={1} fill="none" stroke={COL.red} strokeWidth={22} strokeDasharray={`${roadP} 2`} opacity={0.5} filter="url(#glow)" />
          <path d={svgLine(DOKLAM_ROAD, 0.3)} pathLength={1} fill="none" stroke="#FFB0A0" strokeWidth={8} strokeLinecap="round" strokeDasharray={`${roadP * 0.05} 0.02`} strokeDashoffset={0} />
        </g>}
        {/* the view from the ridge down to the corridor */}
        {coneO > 0 && jp[2] && (() => {
          const a = pr(88.2, 26.62, 0.2), b = pr(88.62, 26.56, 0.2);
          return <path d={`M${jp[0]},${jp[1]} L${a[0]},${a[1]} L${b[0]},${b[1]} Z`} fill="rgba(255,60,40,0.22)" stroke="rgba(255,120,90,0.8)" strokeWidth={4} strokeDasharray="14 10" opacity={coneO} />;
        })()}
        {/* the road stops: a red bar across its tip */}
        {t > C.ruk - 0.15 && t < C.neeche + 0.3 && (() => {
          const e = pr(DOKLAM_ROAD[4][0], DOKLAM_ROAD[4][1], 0.3), f = pr(DOKLAM_ROAD[3][0], DOKLAM_ROAD[3][1], 0.3);
          const dx = e[0] - f[0], dy = e[1] - f[1], L = Math.hypot(dx, dy) || 1;
          const s = 60 * pop(t, C.ruk - 0.15, 9, 220);
          return <g opacity={w(t, C.ruk - 0.15, C.neeche + 0.3, 0.05, 0.3)}><line x1={e[0] - (dy / L) * s} y1={e[1] + (dx / L) * s} x2={e[0] + (dy / L) * s} y2={e[1] - (dx / L) * s} stroke="#000" strokeOpacity={0.5} strokeWidth={26} strokeLinecap="round" /><line x1={e[0] - (dy / L) * s} y1={e[1] + (dx / L) * s} x2={e[0] + (dy / L) * s} y2={e[1] - (dx / L) * s} stroke={COL.red} strokeWidth={16} strokeLinecap="round" /></g>;
        })()}
      </svg>

      {/* country tags */}
      {chinaP[2] && <TerritoryTag x={chinaP[0]} y={chinaP[1]} flag="china" hi="चीन" en="CHINA" s={tagS(chinaP[3])} o={tagO + w(t, C.china1 - 0.1, C.sili - 0.2, 0.15, 0.3)} p={1 + 0.1 * Math.exp(-6 * Math.max(0, t - C.china1)) * (t > C.china1 ? 1 : 0)} />}
      {bangP[2] && <TerritoryTag x={bangP[0]} y={bangP[1]} flag="bangladesh" hi="बांग्लादेश" en="BANGLADESH" s={tagS(bangP[3])} o={Math.max(tagO, w(t, C.bang1 - 0.1, C.gardan, 0.15, 0.4))} />}
      {nepalP[2] && <TerritoryTag x={nepalP[0]} y={nepalP[1]} flag="nepal" hi="नेपाल" en="NEPAL" s={tagS(nepalP[3]) * 0.85} o={tagO * 0.95} />}

      {/* hook pins */}
      {(() => { const q = at('darjeeling'); return q[2] && <Pin x={q[0]} y={q[1]} t={tw} t0={C.darj - 0.05} hi="दार्जिलिंग" en="DARJEELING" o={w(tw, C.darj - 0.1, C.upar1 + 0.3, 0.05, 0.4)} side="l" />; })()}
      {(() => { const q = at('guwahati'); return q[2] && <Pin x={q[0]} y={q[1]} t={t} t0={C.guw - 0.05} hi="गुवाहाटी" en="GUWAHATI" o={w(t, C.guw - 0.1, C.n22 + 0.5, 0.05, 0.4)} side="u" />; })()}
      {barO > 0 && g0[2] && g1[2] && <At x={(g0[0] + g1[0]) / 2 + 40} y={(g0[1] + g1[1]) / 2 - 190} p={pop(t, C.n22 - 0.15, 10, 220)} o={barO}><Big text={`${km} KM`} size={110} color="#fff" glow={COL.orange} /></At>}
      {/* Darjeeling's tea hills on the pin */}
      {prop('d_darjeeling_hill', 88.263, 27.06, 55, C.darj - 0.05, C.guw + 0.4)}
      {/* China's army in the Chumbi Valley */}
      {prop('a_china_armour', 88.93, 27.47, 48, C.army1 - 0.1, C.sili - 0.3, COL.red)}
      {t > C.china1 - 0.1 && t < C.sili && (() => { const q = at('yadong'); return q[2] && <Pin x={q[0]} y={q[1]} t={t} t0={C.china1} hi="चुम्बी घाटी" en="CHUMBI VALLEY" color="#FF8A8A" o={w(t, C.china1, C.sili - 0.2, 0.1, 0.3)} side="r" />; })()}

      {/* Chicken's Neck */}
      {t > C.neck - 0.2 && t < C.ne1 + 0.3 && <At x={540} y={560} p={pop(t, C.neck - 0.1, 10, 200)} o={w(t, C.neck - 0.15, C.ne1 + 0.3, 0.1, 0.3)}><Big text="CHICKEN'S NECK" size={96} color="#FFE7C2" glow={COL.orange} /></At>}
      {/* Northeast: 8 states, 4.5 crore */}
      {t > C.n8 - 0.3 && t < C.upar2 && <At x={540} y={480} p={pop(t, C.n8 - 0.2, 10, 200)} o={w(t, C.n8 - 0.3, C.upar2, 0.1, 0.3)}>
        <div style={{ textAlign: 'center' }}>
          <Big text={<>{Math.min(8, Math.max(1, Math.round(8 * easeOut(ramp(t, C.ne1, C.n8 + 0.4, linear)))))} <span style={{ fontFamily: UI }}>राज्य</span></>} size={120} color="#fff" glow={COL.blue} />
          {t > C.crore - 0.3 && <div style={{ marginTop: 10, transform: `scale(${pop(t, C.crore - 0.3, 10, 200)})` }}><Big text={<>{(4.5 * easeOut(ramp(t, C.crore - 0.4, C.log + 0.2, linear))).toFixed(1)} <span style={{ fontFamily: UI }}>करोड़ लोग</span></>} size={100} color={COL.sky} glow={COL.blue} /></div>}
        </div>
      </At>}
      {/* Sikkim, Bhutan */}
      {(() => { const q = at('gangtok'); return q[2] && <Pin x={q[0]} y={q[1]} t={t} t0={C.sikkim - 0.05} hi="सिक्किम" en="SIKKIM" o={w(t, C.sikkim - 0.1, C.n2017, 0.05, 0.4)} side="l" />; })()}
      {(() => { const q = at('thimphu'); return q[2] && <Pin x={q[0]} y={q[1]} t={t} t0={C.bhutan - 0.05} hi="भूटान" en="BHUTAN" color="#D8A8FF" o={w(t, C.bhutan - 0.1, C.n2017, 0.05, 0.4)} side="r" />; })()}
      {(() => { const q = at('yadong'); return q[2] && <Pin x={q[0]} y={q[1]} t={t} t0={C.chumbi - 0.05} hi="चुम्बी घाटी" en="CHUMBI VALLEY · CHINA" color="#FF8A8A" o={w(t, C.chumbi - 0.1, C.doklam + 0.2, 0.05, 0.4)} side="r" />; })()}
      {t > C.n2017 - 0.2 && t < C.pahadi && <At x={540} y={430} p={pop(t, C.n2017 - 0.15, 10, 220)} o={w(t, C.n2017 - 0.2, C.pahadi, 0.1, 0.3)}><Big text="2017" size={150} color="#fff" glow={COL.red} /></At>}
      {(() => { const q = at('doklam', 0.3); return q[2] && <Pin x={q[0]} y={q[1]} t={t} t0={C.doklam - 0.05} hi="डोकलाम" en="DOKLAM" color="#FFC4B8" o={w(t, C.doklam - 0.1, C.army2 - 0.1, 0.05, 0.4)} side="l" />; })()}
      {prop('r_road_works', 88.946, 27.31, 14, C.sadak1 - 0.05, C.pahadi + 1.2)}
      {jp[2] && <Pin x={jp[0]} y={jp[1]} t={t} t0={C.pahadi - 0.05} hi="जम्फेरी रिज" en="JAMPHERI RIDGE" color="#FFE08A" o={w(t, C.pahadi - 0.1, C.ruk + 0.4, 0.05, 0.4)} side="r" />}
      {prop('a_indian_soldiers', 88.972, 27.252, 13, C.army2 - 0.05, C.neeche, COL.blue)}
      {t > C.n73 - 0.2 && t < C.neeche + 0.2 && <At x={540} y={440} p={pop(t, C.n73 - 0.15, 10, 220)} o={w(t, C.n73 - 0.2, C.neeche + 0.2, 0.1, 0.3)}><Big text={<>{n73} <span style={{ fontFamily: UI }}>दिन</span></>} size={150} color="#fff" glow={COL.blue} /></At>}
      {t > C.ruk - 0.1 && t < C.neeche + 0.2 && <At x={540} y={640} o={w(t, C.ruk - 0.1, C.neeche + 0.2, 0.05, 0.3)}><Stamp t={t} t0={C.ruk - 0.05} hi="सड़क रुकी" color={COL.red} size={78} /></At>}

      {/* Bangladesh: Lalmonirhat */}
      {(() => { const q = at('lalmonirhat'); return q[2] && <Pin x={q[0]} y={q[1]} t={t} t0={C.lalmo - 0.05} hi="लालमनिरहाट" en="LALMONIRHAT AIRBASE" color="#9DFFB5" o={w(t, C.lalmo - 0.1, C.dhaka - 0.1, 0.05, 0.4)} side="r" />; })()}
      {prop('l_old_airbase', 89.405, 25.935, 20, C.lalmo - 0.05, C.dhaka - 0.2)}
      {t > C.ww - 0.2 && t < C.n2025 - 0.1 && <At x={540} y={450} p={pop(t, C.ww - 0.15, 10, 220)} o={w(t, C.ww - 0.2, C.n2025 - 0.1, 0.1, 0.25)}><Big text={<><span style={{ fontFamily: UI }}>बना</span> 1931</>} size={120} color="#fff" glow="#9DFFB5" /></At>}
      {t > C.n2025 - 0.15 && t < C.dhaka && <At x={540} y={450} p={pop(t, C.n2025 - 0.1, 10, 220)} o={w(t, C.n2025 - 0.15, C.dhaka, 0.1, 0.3)}><Big text="2025" size={150} color="#fff" glow={COL.green} /></At>}
      {/* Dhaka and the map */}
      {(() => { const q = at('dhaka'); return q[2] && <Pin x={q[0]} y={q[1]} t={t} t0={C.dhaka - 0.05} hi="ढाका" en="DHAKA" color="#9DFFB5" o={w(t, C.dhaka - 0.1, C.gardan - 0.2, 0.05, 0.4)} side="r" />; })()}
      {t > C.greater - 0.2 && t < C.gardan && <At x={540} y={360} p={pop(t, C.greater - 0.15, 10, 200)} o={w(t, C.greater - 0.2, C.gardan, 0.1, 0.3)}>
        <div style={{ padding: '10px 26px 14px', background: 'rgba(6,20,12,0.9)', border: `4px solid ${COL.green}`, borderRadius: 18, textAlign: 'center' }}>
          <div style={{ fontFamily: LABEL, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: '#9DFFB5' }}>A DHAKA GROUP'S MAP</div>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 66, color: '#fff', lineHeight: 1.15 }}>"ग्रेटर बांग्लादेश"</div>
        </div>
      </At>}
      {t > C.parl - 0.2 && t < C.gardan && <At x={540} y={600} p={pop(t, C.parl - 0.15, 10, 220)} o={w(t, C.parl - 0.2, C.gardan, 0.1, 0.3)}>
        <div style={{ padding: '8px 26px 12px', background: 'rgba(8,10,14,0.92)', border: `4px solid ${COL.gold}`, borderRadius: 16, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden' }}><svg width={66} height={44} viewBox="0 0 30 20"><rect width={30} height={20} fill="#fff" /><rect width={30} height={6.67} fill="#FF9933" /><rect y={13.33} width={30} height={6.67} fill="#138808" /><circle cx={15} cy={10} r={2.9} fill="none" stroke="#000080" strokeWidth={0.45} /></svg></div>
          <div><div style={{ fontFamily: UI, fontWeight: 800, fontSize: 52, color: '#fff', lineHeight: 1.1 }}>भारत की Parliament</div>
            <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: COL.gold }}>RAJYA SABHA · 1 AUG 2025</div></div>
        </div>
      </At>}

      {/* the fortress: Rafale at Hasimara, S-400 (reported), three garrisons */}
      {(() => { const q = at('hasimara'); return q[2] && <>
        <Pin x={q[0]} y={q[1]} t={t} t0={C.hasimara - 0.05} hi="हासीमारा" en="HASIMARA AIR FORCE STATION" color={COL.sky} o={w(t, C.hasimara - 0.1, C.garrison - 0.1, 0.05, 0.4)} side="r" />
        <Badge x={q[0] + 10} y={q[1] - 300} t={t} t0={C.rafale - 0.05} k="j_jet_badge" label="RAFALE" sub="Fighter Jets" o={w(t, C.rafale - 0.1, C.garrison - 0.1, 0.05, 0.4)} />
      </>; })()}
      {(() => { const q = pr(88.4, 26.75); return q[2] && <Badge x={Math.min(820, Math.max(260, q[0] - 120))} y={q[1] - 330} t={t} t0={C.s400 - 0.1} k="s_s400_launcher" label="S-400" sub="रिपोर्ट्स के मुताबिक़" color={COL.sky} o={w(t, C.s400 - 0.15, C.garrison + 0.2, 0.05, 0.4)} />; })()}
      {([['bamuni', C.bamuni, 'बामुनी', 'BAMUNI · ASSAM', 'r'], ['kishanganj', C.kishan, 'किशनगंज', 'KISHANGANJ · BIHAR', 'r'], ['chopra', C.chopra, 'चोपड़ा', 'CHOPRA · WEST BENGAL', 'l']] as [string, number, string, string, 'r' | 'l'][]).map(([k, t0, hi, en, side]) => {
        const q = at(k);
        if (!q[2]) return null;
        const o = w(t, t0 - 0.1, C.pooche, 0.05, 0.4);
        return <React.Fragment key={k}>
          {prop('g_garrison', LL(k)[0], LL(k)[1], 60, t0 - 0.05, C.pooche - 0.1)}
          <Pin x={q[0]} y={q[1]} t={t} t0={t0 - 0.05} hi={hi} en={en} color={COL.sky} o={o} side={side} size={36} />
        </React.Fragment>;
      })}
      {t > C.garrison - 0.2 && t < C.pooche && <At x={540} y={420} p={pop(t, C.garrison - 0.15, 10, 200)} o={w(t, C.garrison - 0.2, C.pooche, 0.1, 0.3)}><Big text={<>3 <span style={{ fontFamily: UI }}>नए Garrison</span></>} size={104} color="#fff" glow={COL.blue} /></At>}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.neeche - 0.25, t1: C.border + 0.2, from: 2.3 },
  { name: 'B', t0: C.dhaka - 0.3, t1: C.ne2 + 0.3, from: 0.4 },
];
const BAND_TOP = 470;
const splitAt = (t: number) => {
  for (const w of NULL_WIN()) {
    const q = Math.min(ramp(t, w.t0 - 0.2, w.t0 + 0.2, inOut), 1 - ramp(t, w.t1 - 0.2, w.t1 + 0.2, inOut));
    if (q > 0) return { q, w };
  }
  return null;
};
const NullPanel: React.FC<{ t: number; q: number; name: string; t0: number; t1: number; from: number; fps: number }> = ({ t, q, name, t0, t1, from, fps }) => (
  <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d', borderTop: '6px solid #fff' }}>
    <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 300}px`, transform: `scale(${1.12 + 0.04 * ramp(t, t0, t1, inOut)})` }}>
      <Sequence from={Math.round((t0 - 0.2) * fps)} durationInFrames={Math.round((t1 - t0 + 0.6) * fps)} layout="none">
        <OffthreadVideo src={staticFile(`siliguri2/null/null_sg2_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
  </div>
);

// ------------------------------------------------------------------ captions, grade, credits
const Captions: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  if (t < 0.05 || t > D - 0.3) return null;
  let i = -1;
  for (let k = 0; k < CAPS.length; k++) if (CAPS[k][0] <= t) i = k;
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const words = CAPS.slice(g, g + 3);
  const last = words[words.length - 1];
  if (t > last[0] + 1.2 && (!CAPS[g + 3] || t < CAPS[g + 3][0])) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 66, lineHeight: 1.25, color: '#fff', WebkitTextStroke: `10px ${DARK}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
      {words.map(([wt, wd], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0, color: g + k === i ? COL.gold : '#fff' }}>{wd} </span>)}
    </div>
  );
};
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 30 * Math.sin(t * LOOPF(3) + 1.1), ly = 32 + 18 * Math.sin(t * LOOPF(2) + 0.4);
  const tense = win(t, C.china1 - 0.2, C.sili - 0.2, 0.4, 0.4) + win(t, C.doklam, C.neeche, 0.4, 0.4) * 0.6;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,255,255,0.12), rgba(255,255,255,0) 42%)`, mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.30), rgba(0,0,0,0) 14%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.4))' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,40,40,0.30), rgba(255,40,40,0) 70%)', mixBlendMode: 'soft-light', opacity: clamp01(tense) }} />
    </AbsoluteFill>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles (SRTM) · borders: Natural Earth (India POV) · props: AI illustration';

export const Siliguri2: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const h = useHeights();
  const tex = useTextures([JET, TRAIN]);
  const ck = camK(t);
  const [sx, sy] = shake(t);
  const sp = camSpeed(t);
  const blur = Math.min(6, Math.max(0, sp.pan * 150 + sp.zoom * 150 - 0.6));
  const split = splitAt(t);
  if (!h || !tex) return <AbsoluteFill style={{ background: '#0d1a22' }} />;
  const [lx, lz] = xz(ck.lon, ck.lat);
  const gy = Math.max(0, groundXZ(h, lx, lz));
  const cs = camS(ck, Math.min(gy, 1.5), rollAt(t), split ? split.q : 0);
  return (
    <AbsoluteFill style={{ background: '#0d1a22', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.04)` }}>
        <AbsoluteFill style={{ filter: `${blur > 0.7 ? `blur(${blur.toFixed(1)}px) ` : ''}saturate(1.08) contrast(1.06)` }}>
          <Terrain h={h} cam={cs} width={1080} height={1920} hl={hlAt(t)}>
            <Extras t={t} h={h} tex={tex} cs={cs} />
          </Terrain>
        </AbsoluteFill>
        <Grade t={t} />
        <Overlays t={t} h={h} cs={cs} />
      </AbsoluteFill>
      {split && <NullPanel t={t} q={split.q} {...split.w} fps={fps} />}
      {captions && <Captions t={t} top={split ? 860 : 1500} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={(t * 98) / D} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
