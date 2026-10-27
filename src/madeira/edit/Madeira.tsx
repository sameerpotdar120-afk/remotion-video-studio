import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { useMontserrat } from '../../darien/Brand';
import { clamp01, easeOut, inOut, lerp, linear, pop, ramp } from '../../darien/anim';
import SIZES from '../../../public/madeira/img_sizes.json';
import { UI, useFonts } from '../motion/font';
import { M01Neon } from '../motion/M01Neon';
import { M02Forest, scatter, southCoast } from '../motion/M02Forest';
import { M03Fuse } from '../motion/M03Fuse';
import { M04Fire } from '../motion/M04Fire';
import { M05TitleDrop } from '../motion/M05TitleDrop';
import { M06Voyage } from '../motion/M06Voyage';
import { M07Sprout } from '../motion/M07Sprout';
import { M08CardFlip } from '../motion/M08CardFlip';
import { M09ZoomThrough } from '../motion/M09ZoomThrough';
import { M10NeonLabel } from '../motion/M10NeonLabel';
import { M12Player } from '../motion/M12Player';
import { M13Embers } from '../motion/M13Embers';
import { M14Trade } from '../motion/M14Trade';
import { M15Levadas } from '../motion/M15Levadas';
import { M16Boats } from '../motion/M16Boats';
import { M17PinLabel } from '../motion/M17PinLabel';
import { MapView } from '../motion/MapView';
import { AIRPORT, C, CAPS, Cam, DURATION_S, FUNCHAL, GEO, LOOPF, MAD, P, camAt, camMotion, ll, merc, ringsD, shake, toS } from './cam';

export const MD_DURATION_60 = Math.round(DURATION_S * 60);
const F = (s: number) => Math.round(s * 60);
const AUDIO = 'madeira/audio/mix.wav';

const SZ = SIZES as Record<string, { w: number; h: number; ext?: string }>;
const HAS = (k: string) => !!SZ[k];
const IMG = (k: string) => staticFile(`madeira/img/${k}.${SZ[k]?.ext ?? 'png'}`);
const RATIO = (k: string) => (SZ[k] ? SZ[k].h / SZ[k].w : 1);

/** Images painted inside SVG or used as CSS masks are decoded before any frame renders (every render chunk opens a fresh tab). */
const PRE = ['md04_flame_a', 'md04b_flame_b', 'md02_laurel_tree', 'md02b_laurel_tree_tall', 'md03_tree_burning', 'md11_wine_bottle'].filter(HAS).map(IMG);
let preloaded: Promise<unknown> | null = null;
const usePreload = () => {
  const [h] = React.useState(() => delayRender('md images'));
  React.useEffect(() => {
    if (!preloaded) preloaded = Promise.all(PRE.map((src) => { const i = new Image(); i.src = src; return i.decode().catch(() => undefined); }));
    preloaded.then(() => continueRender(h));
  }, [h]);
};

const At: React.FC<{ t0: number; t1: number; children: React.ReactNode }> = ({ t0, t1, children }) => (
  <Sequence from={F(t0)} durationInFrames={Math.max(1, F(t1) - F(t0))} layout="none">{children}</Sequence>
);
const Box: React.FC<{ x: number; y: number; w: number; h: number; children: React.ReactNode }> = ({ x, y, w, h, children }) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h }}>{children}</div>
);

// ------------------------------------------------------------------ Null (split screen, middle only)
/** Clip B: the hand sinks on "पूरा धंधा Brazil चला गया… डूब गई", the fist on "हार नहीं मानी"; clip C: the hand low (a small
 *  child) on "एक लड़का पैदा हुआ", sweeping up on "Cristiano Ronaldo", the thumbs-up on the airport. `from` = clip time at t0. */
export const NULL_WIN = () => [
  { name: 'B', t0: C.dhandha6 - 0.15, t1: C.haar7 + 1.1, from: 0.3 },
  { name: 'C', t0: C.funchal10 - 0.2, t1: C.airport10 + 0.4, from: 0.3 },
];
const BAND_TOP = 560;
const splitAt = (t: number) => {
  for (const w of NULL_WIN()) {
    const q = Math.min(ramp(t, w.t0 - 0.2, w.t0 + 0.2, inOut), 1 - ramp(t, w.t1 - 0.2, w.t1 + 0.2, inOut));
    if (q > 0) return { q, w };
  }
  return null;
};
const NullPanel: React.FC<{ t: number; q: number; name: string; t0: number; t1: number; from: number }> = ({ t, q, name, t0, t1, from }) => {
  const push = 1 + 0.05 * ramp(t, t0, t1, inOut);
  return (
    <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d' }}>
      <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 260}px`, transform: `scale(${push})` }}>
        <Sequence from={F(t0 - 0.2)} durationInFrames={F(t1 - t0 + 0.6)} layout="none">
          <OffthreadVideo src={staticFile(`madeira/null/null_md_${name}1.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #4a0710, #FF2A3D, #fff, #FF2A3D, #4a0710)', boxShadow: '0 0 24px #FF2A3D' }} />
    </div>
  );
};

// ------------------------------------------------------------------ fills on the map
const Fill: React.FC<{ t: number; c: Cam; rings: number[][][]; t0: number; t1: number; color: string; from: P; reach?: number; alpha?: number; id: string }> = ({ t, c, rings, t0, t1, color, from, reach = 900, alpha = 0.5, id }) => {
  const p = ramp(t, t0, t0 + 0.45, inOut), o = 1 - ramp(t, t1 - 0.25, t1, linear);
  if (p <= 0 || o <= 0) return null;
  const d = ringsD(c, rings), [fx, fy] = toS(c, from);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}g`} gradientUnits="userSpaceOnUse" cx={fx} cy={fy} r={Math.max(1, reach * p)}><stop offset="0.85" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity={0} /></radialGradient>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-3000} y={-3000} width={7000} height={8000}><rect x={-3000} y={-3000} width={7000} height={8000} fill={`url(#${id}g)`} /></mask>
      </defs>
      <g mask={`url(#${id}m)`} opacity={o}>
        <path d={d} fill={color} fillOpacity={alpha * (1 + 0.06 * Math.sin(t * 2.3))} style={{ filter: `drop-shadow(0 0 14px ${color})` }} />
        <path d={d} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={2.5} />
      </g>
    </svg>
  );
};

/** Frame 0 and the loop's last frame: the North Atlantic, a red neon pin on Madeira and the creator's Ronaldo portrait.
 *  Its float runs on the loop clock, so the last frame matches frame 0. */
const Portrait: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  if (a <= 0 || !HAS('md15_ronaldo_portrait')) return null;
  const fy = Math.sin(t * LOOPF(7)) * 8, w = 760;
  return (
    <div style={{ position: 'absolute', left: 540 - w / 2, top: 1920 - w * RATIO('md15_ronaldo_portrait') - 40 + (1 - a) * 500 + fy, width: w, opacity: Math.min(1, a * 2) }}>
      <Img src={IMG('md15_ronaldo_portrait')} style={{ width: w, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6)) drop-shadow(0 0 22px rgba(255,42,61,0.35))' }} />
    </div>
  );
};

const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const mad = GEO.islands.Madeira, poly = mad[0].map((p) => toS(c, p)) as [number, number][];
  const close = c.mpp < 140;
  // tree bases are fixed on the map (scattered once at a reference camera), projected each frame
  const trees = TREES.map((p) => toS(c, p));
  const fireFrom = toS(c, merc(-17.26, 32.72));
  const flames = ['md04_flame_a', 'md04b_flame_b'].filter(HAS).map(IMG);
  const lev = LEVADAS.map((r) => 'M ' + r.map((p) => toS(c, p).map((v) => v.toFixed(0)).join(' ')).join(' L '));
  const ports = [[-9.14, 38.72], [-8.6, 41.15], [-6.0, 36.5], [2.35, 48.85], [4.4, 51.9], [12.3, 45.4], [-0.1, 51.5]].map(([lo, la]) => ll(c, lo, la));
  return (
    <AbsoluteFill>
      {/* line 1: the neon pin on frame 0, the strobe over the archipelago, "7 साल" */}
      <Fill t={t} c={c} rings={GEO.countries.Portugal} t0={C.portugal2 - 0.2} t1={C.kali2 - 0.3} color="#2FD9A8" from={merc(-8.2, 39.6)} reach={700} id="pt" />
      {t < C.island1 + 0.5 || t > C.chehra11 - 0.5 ? <M01Neon d={ringsD(c, mad)} /> : null}
      <At t0={C.island1 + 0.55} t1={C.portugal2}>
        <M01Neon d={ringsD(c, mad)} /><M01Neon d={ringsD(c, GEO.islands.PortoSanto)} /><M01Neon d={ringsD(c, GEO.islands.Desertas)} width={3} />
      </At>
      <At t0={C.saal1 - 0.6} t1={C.kyun2 + 0.2}><Box x={540} y={520} w={900} h={300}><M10NeonLabel text="7 साल" size={170} /></Box></At>

      {/* line 2: the caravel from Lisbon; the forest grows; the name; "लकड़ी" */}
      {HAS('md01_caravel') && (
        <At t0={C.sailors2 - 0.4} t1={C.jungle2 + 0.2}>
          <M06Voyage d={(() => { const a = ll(c, -9.6, 38.6), b = ll(c, -12.5, 36.8), d2 = ll(c, -15.5, 34.2), e = ll(c, -16.7, 33.0); return `M ${a[0]} ${a[1]} C ${b[0]} ${b[1]} ${d2[0]} ${d2[1]} ${e[0]} ${e[1]}`; })()}
            dur={F(C.kali2 - C.sailors2 + 0.2)} ship={IMG('md01_caravel')} w={230} color="#FFFFFF" ravens={0} />
        </At>
      )}
      {close && HAS('md02_laurel_tree') && (
        <At t0={C.kali2 - 0.4} t1={C.mitti5 + 0.4}>
          <M02Forest pts={trees} trees={[IMG('md02_laurel_tree'), IMG('md02b_laurel_tree_tall')]} burnt={HAS('md03_tree_burning') ? IMG('md03_tree_burning') : undefined}
            size={Math.min(120, 4600 / c.mpp)} wave={50} burn={F(C.aag3 + 0.1 - C.kali2 + 0.4)} burnFrom={fireFrom} burnSpeed={5} clear={F(C.raakh5 - C.kali2 + 0.4)} />
        </At>
      )}
      <At t0={C.madeira2 - 0.3} t1={C.deewar3 - 0.2}>
        <Box x={540} y={430} w={940} h={420}>
          {HAS('md05_title_madeira_wood') ? <M05TitleDrop src={IMG('md05_title_madeira_wood')} ratio={RATIO('md05_title_madeira_wood')} w={880} cuts={[0, 0.229, 0.352, 0.49, 0.61, 0.682, 0.833, 1]} /> : <M10NeonLabel text="MADEIRA" size={170} />}
        </Box>
      </At>
      <At t0={C.lakdi2 - 0.15} t1={C.deewar3 - 0.2}><Box x={540} y={680} w={900} h={260}><M10NeonLabel text="= लकड़ी" size={110} /></Box></At>

      {/* line 3–4: the fuse along the south coast, the fire, the settlers in the sea, the legend */}
      <At t0={C.aag3 - 1.0} t1={C.kahani4 + 0.5}><M03Fuse d={southCoast(poly, 10)} dur={F(2.6)} flame={flames[0]} /></At>
      {close && <At t0={C.aag3 + 0.1} t1={C.raakh5 + 0.6}><M04Fire pts={trees.filter((_, i) => i % 3 === 0)} flames={flames} from={fireFrom} speed={5} size={Math.min(130, 5200 / c.mpp)} out={F(C.raakh5 - C.aag3 - 0.6)} /></At>}
      {HAS('md08_settlers_boat') && (
        <At t0={C.samundar4 - 0.2} t1={C.legend4 + 0.2}>
          <M16Boats src={IMG('md08_settlers_boat')} w={240} pts={[[-16.98, 32.6], [-16.86, 32.585], [-17.08, 32.61]].map(([lo, la]) => ll(c, lo, la))} />
        </At>
      )}
      <At t0={C.do4 - 0.1} t1={C.legend4 + 0.1}><Box x={540} y={460} w={900} h={260}><M10NeonLabel text="2 दिन" size={130} /></Box></At>
      <At t0={C.saat4 - 0.3} t1={C.raakh5}><Box x={540} y={480} w={900} h={320}><M10NeonLabel count={[0, 7, 30]} suffix=" साल" size={190} /></Box></At>

      {/* line 5–6: the cane, the trade to Europe, white gold, number 1, Brazil, the cane sinks */}
      {HAS('md06_sugar_cane') && close && (
        <At t0={C.mitti5 - 0.2} t1={C.europe5 + 0.1}><M07Sprout pts={CANE.map((p) => toS(c, p))} src={IMG('md06_sugar_cane')} size={Math.min(130, 6200 / c.mpp)} step={2} /></At>
      )}
      <At t0={C.europe5 + 0.35} t1={C.ganna6 - 0.2}><M14Trade from={toS(c, MAD)} to={ports} icon={HAS('md07_sugar_loaf') ? IMG('md07_sugar_loaf') : undefined} step={7} dur={34} /></At>
      <At t0={C.safed5 - 0.2} t1={C.duniya6 + 0.2}><Box x={540} y={1360} w={900} h={260}><M10NeonLabel text="सफ़ेद सोना" size={120} /></Box></At>
      <At t0={C.duniya6} t1={C.ganna6 - 0.2}><Box x={540} y={1360} w={900} h={260}><M10NeonLabel text="दुनिया में नंबर 1" size={110} /></Box></At>
      <Fill t={t} c={c} rings={GEO.countries.Brazil} t0={C.brazil6 - 0.2} t1={C.dhandha6 + 0.6} color="#4FCB3A" from={merc(-45, -8)} reach={1200} id="br" />
      <At t0={C.brazil6 - 0.1} t1={C.dhandha6 + 0.6}><M14Trade from={toS(c, MAD)} to={[ll(c, -38.5, -12.9)]} icon={HAS('md07_sugar_loaf') ? IMG('md07_sugar_loaf') : undefined} dur={30} lift={0.25} /></At>
      {HAS('md06_sugar_cane') && close && (
        <At t0={C.dhandha6 + 0.5} t1={C.haar7}><M07Sprout pts={CANE.map((p) => toS(c, p))} src={IMG('md06_sugar_cane')} size={Math.min(130, 6200 / c.mpp)} step={0} sink={F(C.doob6 - 0.4 - C.dhandha6 - 0.5)} /></At>
      )}

      {/* line 7: the levadas, two cards, 2,000 km, "≈ Mumbai → Kolkata" */}
      <At t0={C.nahre7 - 0.4} t1={C.jala9}><M15Levadas paths={lev} step={5} dur={36} /></At>
      {HAS('md09_levada_forest') && <At t0={C.pahad7 - 0.1} t1={C.n2000_7}><Box x={540} y={470} w={760} h={520}><M08CardFlip src={IMG('md09_levada_forest')} ratio={RATIO('md09_levada_forest')} w={640} tilt={-5} fly={[F(C.n2000_7 - 0.35 - C.pahad7 + 0.1), 0, 520]} /></Box></At>}
      {HAS('md09b_levada_cliff') && <At t0={C.levadas7 - 0.1} t1={C.n2000_7}><Box x={560} y={540} w={760} h={520}><M08CardFlip src={IMG('md09b_levada_cliff')} ratio={RATIO('md09b_levada_cliff')} w={640} tilt={5} seed={3} fly={[F(C.n2000_7 - 0.3 - C.levadas7 + 0.1), 0, 460]} /></Box></At>}
      <At t0={C.n2000_7 - 0.2} t1={C.angoor8 - 0.2}><Box x={540} y={470} w={960} h={300}><M10NeonLabel count={[0, 2000, 50]} suffix=" km" size={180} /></Box></At>
      <At t0={C.mumbai7 - 0.1} t1={C.angoor8 - 0.2}><Box x={540} y={680} w={960} h={220}><M10NeonLabel text="≈ Mumbai → Kolkata" size={84} /></Box></At>

      {/* line 8–9: the vineyards, the wine bottle zooms through; today's paradise, the outline in light */}
      {HAS('md10_vineyard_terraces') && <At t0={C.angoor8 - 0.1} t1={C.wine8 + 0.3}><Box x={540} y={500} w={760} h={520}><M08CardFlip src={IMG('md10_vineyard_terraces')} ratio={RATIO('md10_vineyard_terraces')} w={660} tilt={-4} /></Box></At>}
      {HAS('md11_wine_bottle') && <At t0={C.wine8 - 0.1} t1={C.jala9 + 0.1}><Box x={540} y={900} w={700} h={1200}><M09ZoomThrough src={IMG('md11_wine_bottle')} ratio={RATIO('md11_wine_bottle')} h={880} through={F(C.jala9 - 0.35 - C.wine8 + 0.1)} /></Box></At>}
      <At t0={C.jala9 + 0.05} t1={C.n1985_10}><M01Neon d={ringsD(c, mad)} mode="draw" dur={60} /></At>
      {HAS('md12_madeira_paradise') && <At t0={C.paradise9 - 0.2} t1={C.n1985_10 - 0.1}><Box x={540} y={480} w={800} h={540}><M08CardFlip src={IMG('md12_madeira_paradise')} ratio={RATIO('md12_madeira_paradise')} w={700} tilt={3} seed={5} /></Box></At>}
      <At t0={C.laakhon9 - 0.1} t1={C.n1985_10 - 0.1}><Box x={540} y={1420} w={900} h={240}><M10NeonLabel text="लाखों tourists" size={100} /></Box></At>

      {/* line 10: Funchal, the boy, Ronaldo, the airport (top half while Null is in the split) */}
      <At t0={C.funchal10 - 0.1} t1={C.ladka10 + 0.2}><Box x={toS(c, FUNCHAL)[0]} y={toS(c, FUNCHAL)[1] - 240} w={900} h={520}><M17PinLabel text="Funchal" /></Box></At>
      {HAS('md16_boy_funchal') && <At t0={C.ladka10 - 0.2} t1={C.ronaldo10 + 0.1}><Box x={430} y={1080} w={600} h={720}><M12Player src={IMG('md16_boy_funchal')} ratio={RATIO('md16_boy_funchal')} h={560} mode="pop" /></Box></At>}
      {HAS('md13_ronaldo_dribble') && <At t0={C.ronaldo10 - 0.05} t1={C.airport10 + 0.1}><Box x={560} y={1060} w={600} h={760}><M12Player src={IMG('md13_ronaldo_dribble')} ratio={RATIO('md13_ronaldo_dribble')} h={600} mode="run" /></Box></At>}
      <At t0={C.ronaldo10 + 0.1} t1={C.airport10 + 0.1}><Box x={540} y={620} w={1000} h={260}><M10NeonLabel text="CRISTIANO RONALDO" size={96} /></Box></At>
      <At t0={C.airport10 - 0.1} t1={C.lakdi11 - 0.3}><Box x={toS(c, AIRPORT)[0]} y={toS(c, AIRPORT)[1] - 240} w={1000} h={520}><M17PinLabel text="Cristiano Ronaldo" sub="International Airport" /></Box></At>
      {HAS('md14_ronaldo_celebration') && <At t0={C.airport10 + 0.5} t1={C.lakdi11 - 0.2}><Box x={400} y={1500} w={600} h={800}><M12Player src={IMG('md14_ronaldo_celebration')} ratio={RATIO('md14_ronaldo_celebration')} h={700} mode="pop" out={F(C.lakdi11 - 0.45 - C.airport10 - 0.5)} /></Box></At>}

      {/* line 11: the island named wood */}
      <At t0={C.lakdi11 - 0.2} t1={C.chehra11 - 0.4}><Box x={540} y={560} w={900} h={260}><M10NeonLabel text="लकड़ी" size={140} /></Box></At>
    </AbsoluteFill>
  );
};

// fixed map points: the forest (a jittered grid inside Madeira), the cane, the levadas (inset bands of the coast)
const REF: Cam = { x: MAD[0], y: MAD[1], mpp: 72 };
const unproj = (c: Cam, [sx, sy]: number[]): P => [c.x + (sx - 540) * c.mpp, c.y - (sy - 960) * c.mpp];
const MADPOLY = () => GEO.islands.Madeira[0].map((p) => toS(REF, p)) as [number, number][];
const TREES: P[] = scatter(MADPOLY(), 40, 'mt').map((p) => unproj(REF, p));
const CANE: P[] = scatter(MADPOLY(), 70, 'mc').map((p) => unproj(REF, p));
const LEVADAS: P[][] = (() => {
  const p = MADPOLY(), cx = p.reduce((a, q) => a + q[0], 0) / p.length, cy = p.reduce((a, q) => a + q[1], 0) / p.length;
  return [0.85, 0.7, 0.55, 0.4].map((k, j) => {
    const r = p.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k * 0.9]);
    const n = r.length, a = Math.floor(n * (0.02 + j * 0.13)), b = Math.floor(n * (0.5 + j * 0.1));
    return r.slice(a, b).map((q) => unproj(REF, q));
  });
})();

// ------------------------------------------------------------------ subtitles, grade, flashes
const STROKE = (w: number, col = '#000') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const HOT = /^[0-9≈]|^[A-Za-zÁ-úó]/;
const Subtitles: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.05;
  if (i < 0 || t < 0.15 || t > end) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = ramp(t, t0, t0 + 0.08, linear) * (1 - ramp(t, t1 - 0.02, t1, linear));
  if (a <= 0) return null;
  const s = lerp(0.86, 1, clamp01(pop(t, t0, 12, 260)));
  const words = text.split(' ');
  const len = words.map((w) => Math.max(1, w.replace(/[…।,?!:."']/g, '').length));
  const tot = len.reduce((x, y) => x + y, 0);
  const span = Math.max(0.3, Math.min(t1, t0 + tot * 0.075) - t0);
  let acc = 0, cur = words.length - 1;
  for (let q = 0; q < words.length; q++) { acc += len[q]; if (t < t0 + (span * acc) / tot) { cur = q; break; } }
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 58, lineHeight: 1.22,
      color: '#fff', opacity: a, transform: `scale(${s})`, textShadow: '0 4px 0 rgba(0,0,0,0.4), 0 6px 18px rgba(0,0,0,0.8)', ...STROKE(9) }}>
      {words.map((w, q) => (
        <span key={q} style={{ color: q === cur ? '#FF5A66' : HOT.test(w) ? '#FFD84D' : '#fff', display: 'inline-block', marginRight: '0.3em', transform: `scale(${q === cur ? 1.08 : 1})` }}>{w}</span>
      ))}
    </div>
  );
};
/** The reference's grade: a dark navy sea, cool shadows, a slow warm light drifting on the loop clock, a deep vignette;
 *  warmer while the island burns. No grain. */
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 34 * Math.sin(t * LOOPF(3) + 0.6), ly = 36 + 20 * Math.sin(t * LOOPF(2));
  const fire = Math.min(ramp(t, C.aag3 - 0.3, C.aag3 + 0.8), 1 - ramp(t, C.raakh5, C.mitti5 + 0.4));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,40,70,0.3), rgba(0,30,60,0.1) 50%, rgba(0,40,70,0.3))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,220,180,0.1), rgba(0,0,0,0) 45%)`, mixBlendMode: 'screen' }} />
      {fire > 0 && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(255,110,30,0.28), rgba(120,20,0,0.2) 60%, rgba(0,0,0,0) 100%)', mixBlendMode: 'screen', opacity: fire }} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,3,8,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,4,10,0.4), rgba(0,0,0,0) 20%, rgba(0,0,0,0) 76%, rgba(0,4,10,0.5))' }} />
    </AbsoluteFill>
  );
};
const Flashes: React.FC<{ t: number }> = ({ t }) => {
  let a = 0;
  for (const p of [C.island1 + 0.55, C.kyun2 + 0.05, C.europe5 + 0.05, C.ganna6 - 0.15, C.dhandha6 + 0.3, C.jala9]) a = Math.max(a, 0.45 * ramp(t, p - 0.04, p, linear) * (1 - ramp(t, p, p + 0.28, easeOut)));
  return a > 0.01 ? <AbsoluteFill style={{ background: '#fff', opacity: a, pointerEvents: 'none' }} /> : null;
};

/** NullDynasty: Madeira, the island that burned for 7 years, and Ronaldo's home. 1080×1920 at 60 fps, rendered at
 *  --scale=2 for 4K. The dark Midnight map; the last frame runs straight into frame 0 (a seamless loop). */
export const Madeira: React.FC<{ captions?: boolean; audio?: string }> = ({ captions = true, audio = AUDIO }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  useMontserrat();
  useFonts();
  usePreload();
  const cam = camAt(t);
  const mv = camMotion(t);
  const bx = Math.min(14, Math.abs(mv.vx) * 0.16 + mv.zoom * 0.5), by = Math.min(14, Math.abs(mv.vy) * 0.16 + mv.zoom * 0.5);
  const [sx, sy] = shake(t);
  const sp = splitAt(t);
  const q = sp ? sp.q : 0;
  const portrait = Math.max(1 - ramp(t, C.island1 - 1.0, C.island1 - 0.2, inOut), ramp(t, C.chehra11 - 0.3, DURATION_S - 0.05, inOut));
  return (
    <AbsoluteFill style={{ background: '#06121c', overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="mdblur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" /></filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px)` }}>
        <AbsoluteFill style={{ filter: (Math.max(bx, by) > 0.6 ? 'url(#mdblur) ' : '') + 'contrast(1.06) saturate(1.05)' }}>
          <MapView c={cam} />
        </AbsoluteFill>
        <MapFx t={t} c={cam} />
        <M13Embers amount={Math.max(0.25, Math.min(1, ramp(t, C.aag3, C.aag3 + 1) * (1 - ramp(t, C.raakh5, C.mitti5))))} />
        <Grade t={t} />
        <Portrait t={t} a={portrait} />
      </AbsoluteFill>
      <Flashes t={t} />
      {sp && <NullPanel t={t} q={sp.q} name={sp.w.name} t0={sp.w.t0} t1={sp.w.t1} from={sp.w.from} />}
      <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, left: 22, fontFamily: "'Montserrat', sans-serif", fontSize: 14, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles (SRTM/NASA, ETOPO1/NOAA) · borders: Natural Earth · AI-generated images (Ronaldo likeness ref: Anna Nessi, CC BY-SA 3.0)
      </div>
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1640} />}
      {captions && <Watermark t={10 + (t * 120) / DURATION_S} />}
      {captions && audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
