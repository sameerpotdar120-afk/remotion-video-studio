import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { useMontserrat } from '../../darien/Brand';
import { clamp01, easeOut, inOut, lerp, linear, pop, ramp } from '../../darien/anim';
import SIZES from '../../../public/chandigarh/img_sizes.json';
import { P03HandArrow } from '../../garbagepatch/motion/P03HandArrow';
import { P07CountUp } from '../../garbagepatch/motion/P07CountUp';
import { P12DashPaths } from '../../garbagepatch/motion/P12DashPaths';
import { P24PinDrop } from '../../garbagepatch/motion/P24PinDrop';
import { P32Shock } from '../../garbagepatch/motion/P32Shock';
import { C01EmbossFill } from '../motion/C01EmbossFill';
import { C02SerifLabel } from '../motion/C02SerifLabel';
import { C03Ribbon } from '../motion/C03Ribbon';
import { C04PhotoBubble } from '../motion/C04PhotoBubble';
import { C05Badge } from '../motion/C05Badge';
import { C06Blob } from '../motion/C06Blob';
import { C07Pill } from '../motion/C07Pill';
import { C08DiagonalWipe } from '../motion/C08DiagonalWipe';
import { BODY, C09LineMorph, SQUARE, unit } from '../motion/C09LineMorph';
import { C10BrushWipe } from '../motion/C10BrushWipe';
import { C11PaperTear } from '../motion/C11PaperTear';
import { C12SectorPlan, S17, planGeom } from '../motion/C12SectorPlan';
import { C13Dim, C13Leader } from '../motion/C13Leader';
import { C14Roads, Road, veins } from '../motion/C14Roads';
import { C15Spotlight } from '../motion/C15Spotlight';
import { C16SunRays } from '../motion/C16SunRays';
import { C17Particles } from '../motion/C17Particles';
import { C18Highlight } from '../motion/C18Highlight';
import { C19MapGrade } from '../motion/C19MapGrade';
import { C20Seal } from '../motion/C20Seal';
import { C21Tag } from '../motion/C21Tag';
import { C22Card } from '../motion/C22Card';
import { C26PinHop } from '../motion/C26PinHop';
import { C27Stop } from '../motion/C27Stop';
import { GEO, UI, useFonts } from '../motion/font';
import { G, MapView, lineD, ringsD, town } from '../motion/MapView';
import { C as COL } from '../motion/theme';
import { C, CAM0, CAPS, Cam, DURATION_S, LOOPF, P, camAt, camMotion, ll, merc, shake, toS } from './cam';

export const CG_DURATION_60 = Math.round(DURATION_S * 60);
const F = (s: number) => Math.round(s * 60);
const AUDIO = 'chandigarh/audio/mix.wav';

// The creator's images, by prompt id (cg01–cg26, plus gp10 and gp19 reused). A piece that needs an image that isn't
// in img_sizes.json yet is left out, never replaced with a stand-in.
const SZ = SIZES as Record<string, { w: number; h: number; ext?: string; pts?: Record<string, number[][]> }>;
const KEYS = Object.keys(SZ);
const key = (id: string) => KEYS.find((k) => k === id || k.startsWith(id + '_'));
const has = (id: string) => !!key(id);
const IMG = (id: string) => { const k = key(id); return k ? staticFile(`chandigarh/img/${k}.${SZ[k].ext ?? 'png'}`) : ''; };
const RATIO = (id: string) => { const k = key(id); return k ? SZ[k].h / SZ[k].w : 1; };
/** Points marked on an image (the High Court roof, the Secretariat facade), in image px, mapped onto a cover-fit frame. */
const PTS = (id: string, name: string, fallback: number[][]): [number, number][] => {
  const k = key(id), p = k ? SZ[k].pts?.[name] : undefined;
  if (!k || !p) return fallback as [number, number][];
  const s = Math.max(1080 / SZ[k].w, 1920 / SZ[k].h), ox = (1080 - SZ[k].w * s) / 2, oy = (1920 - SZ[k].h * s) / 2;
  return p.map(([x, y]) => [ox + x * s, oy + y * s]);
};

/** Images drawn inside SVG or as CSS textures are decoded before any frame renders (every render chunk opens a fresh tab). */
const PRE = ['cg19', 'cg20', 'cg23', 'cg16', 'cg17'].filter(has).map(IMG);
let preloaded: Promise<unknown> | null = null;
const usePreload = () => {
  const [h] = React.useState(() => delayRender('cg images'));
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
const sec = (a: number, b: number) => F(b - a);
/** A centred row for pills and labels. */
const Row: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center' }}>{children}</div>
);
/** A red ✕ slammed over a point (the pencil lines). */
const Stamp: React.FC<{ at: P; size?: number }> = ({ at, size = 150 }) => {
  const f = useCurrentFrame();
  const s = ramp(f, 0, 8, easeOut);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <g transform={`translate(${at[0]} ${at[1]}) scale(${2 - s})`} stroke="#FF2E3F" strokeWidth={24} strokeLinecap="round" opacity={Math.min(1, s * 2)} style={{ filter: 'drop-shadow(0 0 10px #FF2E3F)' }}>
        <line x1={-size / 2} y1={-size / 2} x2={size / 2} y2={size / 2} /><line x1={size / 2} y1={-size / 2} x2={-size / 2} y2={size / 2} />
      </g>
    </svg>
  );
};
/** A full-frame photo with a slow push and drift (cover fit). */
const Photo: React.FC<{ id: string; t: number; t0: number; t1: number; z0?: number; z1?: number; ox?: number; children?: React.ReactNode }> = ({ id, t, t0, t1, z0 = 1.04, z1 = 1.14, ox = 0, children }) => {
  if (!has(id)) return <AbsoluteFill style={{ background: '#15120f' }} />;
  const u = ramp(t, t0, t1, linear);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${lerp(z0, z1, u)}) translateX(${ox * u}px)` }}>
        <Img src={IMG(id)} style={{ width: 1080, height: 1920, objectFit: 'cover' }} />
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the shots, in order, and how each one hands over
type ShotId = 'map' | 'temple' | 'city' | 'corb' | 'glitter' | 'paper' | 'photos' | 'spot' | 'secr' | 'hc' | 'end';
type Cut = { t: number; to: ShotId; kind: 'cut' | 'fade' | 'diag' | 'brush' | 'tear'; dur?: number };
const CUTS = (): Cut[] => [
  { t: C.paas4 + 0.5, to: 'temple', kind: 'cut' }, // the blob reveal has already covered the frame
  { t: C.chd4 - 0.25, to: 'city', kind: 'fade', dur: 0.35 },
  { t: C.design5 + 0.5, to: 'corb', kind: 'cut' },
  { t: C.unhone5 - 0.15, to: 'glitter', kind: 'diag', dur: 0.32 },
  { t: C.jism5 - 0.35, to: 'paper', kind: 'diag', dur: 0.32 },
  { t: C.jahan6, to: 'photos', kind: 'brush', dur: 0.45 },
  { t: C.poora7 - 0.35, to: 'paper', kind: 'tear', dur: 0.4 },
  { t: C.sirf8, to: 'spot', kind: 'cut' },
  { t: C.nasen9 - 0.15, to: 'paper', kind: 'fade', dur: 0.25 },
  { t: C.imaraten11 - 0.25, to: 'secr', kind: 'brush', dur: 0.45 },
  { t: C.highcourt11 - 0.05, to: 'hc', kind: 'cut' },
  { t: C.isi12 - 0.1, to: 'paper', kind: 'tear', dur: 0.4 },
  { t: C.isiliye13 - 0.25, to: 'end', kind: 'diag', dur: 0.32 },
];
const shotAt = (t: number): { cur: ShotId; prev?: ShotId; cut?: Cut } => {
  let cur: ShotId = 'map', prev: ShotId | undefined;
  for (const c of CUTS()) {
    if (t < c.t) break;
    prev = cur; cur = c.to;
    if (c.kind !== 'cut' && t < c.t + (c.dur ?? 0.3)) return { cur, prev, cut: c };
  }
  return { cur };
};

// ------------------------------------------------------------------ look A: the warm relief map (lines 1–4)
const pt = (c: Cam, lon: number, lat: number) => ll(c, lon, lat);
const CHD_LL: P = [76.78, 30.74];
const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const d = (r: number[][][]) => ringsD(c, r);
  const chd = pt(c, ...CHD_LL), site = pt(c, 76.78, 30.76), lahore = toS(c, town('Lahore'));
  const pin = IMG('gp19');
  const bubble: [number, string, ('cover' | 'contain')?][] = [['cg03', 0], ['cg11', sec(C.shahar1, C.computer1)], ['cg12', sec(C.shahar1, C.balki1)]]
    .filter(([id]) => has(id as string)).map(([id, f]) => [f as number, IMG(id as string), id === 'cg12' ? 'contain' : 'cover']);
  if (bubble.length) bubble[0][0] = 0;
  const hop: P[] = [toS(c, town('Amritsar')), toS(c, town('Patiala')), pt(c, 75.85, 30.9), toS(c, town('Ambala')), site];
  const slope0 = pt(c, 76.95, 31.05), slope1 = pt(c, 76.62, 30.5);
  const rain = [-60, -20, 20, 60].map((k) => `M${slope0[0] + k},${slope0[1] - 40} L${slope1[0] + k},${slope1[1]}`);
  return (
    <AbsoluteFill>
      {/* India red from frame 0 (the loop); Pakistan, Punjab and the split on line 3; everything dissolves on "ज़मीन चुनी गई" */}
      <At t0={0} t1={C.zameen4 + 0.7}><AbsoluteFill style={{ opacity: 0.45 + 0.55 * clamp01((c.mpp - 450) / 1100) }}><C01EmbossFill d={d(G.countries.India)} color={COL.india} mode="fade" dur={0} out={F(C.zameen4)} outDur={18} /></AbsoluteFill></At>
      <At t0={C.bantwara3 - 0.1} t1={C.zameen4 + 0.7}><C01EmbossFill d={d(G.countries.Pakistan)} color={COL.pakistan} mode="wipe" angle={0} dur={18} out={sec(C.bantwara3 - 0.1, C.zameen4)} outDur={18} /></At>
      <At t0={C.punjab3 - 0.1} t1={C.lahore3 + 0.3}><C01EmbossFill d={d(G.states.PunjabUndivided)} color="#FFFFFF" mode="fade" dur={12} blend="normal" strength={0.55} out={sec(C.punjab3 - 0.1, C.lahore3 + 0.05)} outDur={10} /></At>
      <At t0={C.lahore3 - 0.1} t1={C.zameen4 + 0.7}><C01EmbossFill d={d(G.states.PunjabPK)} color={COL.punjabPK} mode="wipe" angle={180} dur={12} out={sec(C.lahore3 - 0.1, C.zameen4)} outDur={18} /></At>
      <At t0={C.lahore3 + 0.15} t1={C.zameen4 + 0.7}><C01EmbossFill d={d(G.states.PunjabIN)} color={COL.punjabIN} mode="wipe" angle={0} dur={12} out={sec(C.lahore3 + 0.15, C.zameen4)} outDur={18} /></At>

      {/* line 1: the pin, its ripple, the bubble (Capitol → computer ✕ → the body), the heartbeat */}
      <At t0={C.shahar1 - 0.1} t1={C.jee2}><P24PinDrop src={pin} at={[chd[0], chd[1]]} h={120} ask={false} /></At>
      <At t0={C.shahar1 + 0.15} t1={C.shahar1 + 1.2}><P32Shock at={chd} r={160} color="#FFFFFF" /></At>
      {bubble.length > 0 && <At t0={C.shahar1 + 0.35} t1={C.design1 + 1.0}><C04PhotoBubble at={[chd[0], chd[1] - 130]} shots={bubble.map(([f, s, fit]) => [Math.max(0, f - F(0.35)), s, fit] as [number, string, ('cover' | 'contain')?])} size={380}
        stamp={has('cg11') ? sec(C.shahar1 + 0.35, C.computer1 + 0.75) : undefined} out={sec(C.shahar1 + 0.35, C.design1 + 0.55)} /></At>}
      <At t0={C.zinda1} t1={C.zinda1 + 1.4}><P32Shock at={[chd[0], chd[1] - 330]} r={260} color="#FF5A6A" repeat={36} /></At>

      {/* line 2: the city (gold), the head, the heart, the lungs, the veins; the tag on "Chandigarh" */}
      <At t0={C.jee2 + 0.1} t1={C.hum2 + 0.5}><C06Blob at={chd} r={58} out={sec(C.jee2 + 0.1, C.hum2 + 0.1)} /></At>
      {has('cg16') && <At t0={C.sir2 - 0.15} t1={C.hum2 + 0.5}><C05Badge at={chd} to={[chd[0], chd[1] - 360]} items={[[0, IMG('cg16'), 'सिर']]} out={sec(C.sir2 - 0.15, C.hum2)} /></At>}
      {has('cg17') && <At t0={C.dil2 - 0.15} t1={C.hum2 + 0.5}><C05Badge at={chd} to={[chd[0] - 300, chd[1] - 60]} items={[[0, IMG('cg17'), 'दिल']]} beat out={sec(C.dil2 - 0.15, C.hum2)} /></At>}
      {has('cg18') && <At t0={C.saans2 - 0.1} t1={C.hum2 + 0.5}><C05Badge at={chd} to={[chd[0] + 300, chd[1] - 60]} items={[[0, IMG('cg18'), 'फेफड़े']]} breathe out={sec(C.saans2 - 0.1, C.hum2)} /></At>}
      <At t0={C.nasen2 - 0.1} t1={C.hum2 + 0.4}><C14Roads roads={veins(chd, 11, 620)} step={2} glow out={sec(C.nasen2 - 0.1, C.hum2)} /></At>
      <At t0={C.chd2 - 0.05} t1={C.kahani3 + 0.3}><C21Tag at={[chd[0], chd[1] + 10]} text="CHANDIGARH" out={sec(C.chd2 - 0.05, C.kahani3)} /></At>
      <At t0={C.chd2} t1={C.chd2 + 1}><P32Shock at={chd} r={240} color="#FFFFFF" /></At>

      {/* line 3: 1947, the "LAHORE" tag, the mosque flying into Pakistan, "PUNJAB", the "?" pin hunting */}
      <At t0={C.y1947 - 0.25} t1={C.bantwara3 + 0.5}><Row y={430}><C02SerifLabel text="1947" size={170} tone="gold" out={sec(C.y1947 - 0.25, C.bantwara3 + 0.15)} /></Row></At>
      <At t0={C.lahore3 + 0.05} t1={C.azaad3 + 0.2}><C21Tag at={lahore} text="LAHORE" side="left" out={sec(C.lahore3 + 0.05, C.azaad3 - 0.1)} /></At>
      {has('cg10') && <At t0={C.pakistan3 - 0.45} t1={C.azaad3}><C04PhotoBubble at={[lahore[0], lahore[1] - 40]} shots={[[0, IMG('cg10')]]} size={300} fly={[sec(C.pakistan3 - 0.45, C.pakistan3 + 0.45), -320, 60]} /></At>}
      <At t0={C.azaad3 - 0.1} t1={C.zameen4 + 0.3}><Row y={560}><C02SerifLabel text="PUNJAB" size={96} tone="gold" out={sec(C.azaad3 - 0.1, C.zameen4)} /></Row></At>
      <At t0={C.chahiye3 - 0.1} t1={C.zameen4}><C26PinHop src={pin} pts={hop} step={Math.round(sec(C.chahiye3 - 0.1, C.zameen4 - 0.4) / hop.length)} h={120} /></At>

      {/* line 4: the Shivalik ribbon, the gold site, "✓", the slope, the three icons, rain, ripples; the temple reveal */}
      <At t0={C.shivalik4 - 0.15} t1={C.paas4 + 0.6}><C03Ribbon d={lineD(c, G.shivalik)} texture={has('cg20') ? IMG('cg20') : undefined} dur={42} /></At>
      <At t0={C.neeche4 - 0.1} t1={C.paas4 + 0.2}><C06Blob at={site} r={86} texture={has('cg23') ? IMG('cg23') : undefined} /></At>
      <At t0={C.ittefaq4 + 0.1} t1={C.dhalaan4 + 0.2}><Box x={site[0] + 150} y={site[1] - 140} w={300} h={140}><Row y={30}><C07Pill text="✓" size={70} color={COL.neon} out={sec(C.ittefaq4 + 0.1, C.dhalaan4 - 0.1)} /></Row></Box></At>
      <At t0={C.dhalaan4 - 0.1} t1={C.mitti4}><P03HandArrow from={slope0} to={slope1} bend={0.25} out={sec(C.dhalaan4 - 0.1, C.mitti4 - 0.3)} /></At>
      <At t0={C.baarish4} t1={C.mitti4}><P12DashPaths ds={rain} step={3} width={4} out={sec(C.baarish4, C.mitti4 - 0.25)} /></At>
      {['cg13', 'cg14', 'cg15'].some(has) && <At t0={C.baarish4 - 0.1} t1={C.paas4 + 0.3}><C05Badge at={site} to={[site[0] + 230, site[1] - 330]} size={190} out={sec(C.baarish4 - 0.1, C.paas4 - 0.1)}
        items={([['cg13', C.baarish4, 'Natural Drainage'], ['cg14', C.mitti4, 'Fertile Soil'], ['cg15', C.paani4, 'Water']] as [string, number, string][]).filter(([id]) => has(id)).map(([id, t0, cap], i) => [i ? sec(C.baarish4 - 0.1, t0) : 0, IMG(id), cap])} /></At>}
      <At t0={C.paani4 + 0.1} t1={C.paani4 + 1.4}><P32Shock at={site} r={200} color="#7FE6FF" repeat={30} /></At>
      {has('cg01') && <At t0={C.paas4 - 0.1} t1={C.paas4 + 0.6}><C06Blob at={site} r={86} mode="reveal" image={IMG('cg01')} grow={6} /></At>}
    </AbsoluteFill>
  );
};
const MapShot: React.FC<{ t: number; blur: number }> = ({ t, blur }) => {
  const c = camAt(t);
  const desat = ramp(t, C.chd4 + 0.3, C.design5 + 0.3, inOut);
  const city = t > C.chd4 - 0.4 && t < C.isiliye13 - 0.5;
  const end = t >= C.isiliye13 - 0.5;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: blur > 0.6 ? 'url(#cgblur)' : undefined }}><MapView c={c} desat={city ? desat : 0} /></AbsoluteFill>
      {!city && !end && <MapFx t={t} c={c} />}
      {city && (
        <>
          <At t0={C.chd4 - 0.25} t1={C.design5 + 0.6}><C01EmbossFill d={ringsD(c, G.states.Chandigarh)} color={COL.ut} mode="fade" dur={14} strength={0.75} out={sec(C.chd4 - 0.25, C.design5 - 0.1)} outDur={30} /></At>
          <At t0={C.chd4 + 0.05} t1={C.design5 + 0.6}><C21Tag at={pt(c, ...CHD_LL)} text="CHANDIGARH" /></At>
        </>
      )}
      {end && <C01EmbossFill d={ringsD(c, G.countries.India)} color={COL.india} mode="fade" dur={0} />}
      <C19MapGrade />
      {/* "INDIA" sits settled on frame 0 and on the last frame (the loop) */}
      {(t < C.design1 + 0.4 || end) && <Sequence from={end ? F(C.isiliye13 - 0.5) - 120 : -120} layout="none"><Row y={1210}><C02SerifLabel text="INDIA" size={110} out={end ? undefined : 120 + F(C.design1)} /></Row></Sequence>}
      {t >= C.chd2 - 0.2 && t < C.bantwara3 + 0.4 && <At t0={C.chd2 - 0.2} t1={C.bantwara3 + 0.4}><Row y={1250}><C02SerifLabel text="INDIA" size={110} out={sec(C.chd2 - 0.2, C.bantwara3 + 0.05)} /></Row></At>}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ photo shots
const TempleShot: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Photo id="cg01" t={t} t0={C.paas4 + 0.3} t1={C.chd4} z0={1.04} z1={1.26} ox={-30} />
    <C17Particles mode="petals" amount={0.9} />
    <At t0={C.paas4 + 0.55} t1={C.chd4 + 0.2}><Row y={1380}><C07Pill text="माँ चंडी मंदिर" size={60} out={sec(C.paas4 + 0.55, C.chd4 - 0.4)} /></Row></At>
  </AbsoluteFill>
);
const CorbShot: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Photo id="cg02" t={t} t0={C.design5 + 0.5} t1={C.unhone5 + 0.3} z0={1.26} z1={1.04} ox={25} />
    <At t0={C.corb5 - 0.3} t1={C.unhone5 + 0.4}><Row y={1360}><C07Pill text="LE CORBUSIER" size={62} sub="French architect" /></Row></At>
  </AbsoluteFill>
);
const UT_SHAPE = unit(G.states.Chandigarh.reduce((a, r) => (r.length > a.length ? r : a)), true);
const utPath = (box: [number, number, number, number]) => 'M' + UT_SHAPE.map(([x, y]) => `${(box[0] + x * box[2]).toFixed(1)},${(box[1] + y * box[3]).toFixed(1)}`).join('L') + 'Z';
const GlitterShot: React.FC<{ t: number }> = () => {
  const box: [number, number, number, number] = [230, 560, 640, 640];
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 45%, #7A1220, #2A0508)' }}>
      {has('cg22') && <Img src={IMG('cg22')} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, objectFit: 'cover' }} />}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>{has('cg23') && <pattern id="cgGold" patternUnits="userSpaceOnUse" width={640} height={640} x={230} y={560}><image href={IMG('cg23')} width={640} height={640} preserveAspectRatio="xMidYMid slice" /></pattern>}</defs>
        <path d={utPath(box)} fill={has('cg23') ? 'url(#cgGold)' : COL.gold} stroke="#FFE7A0" strokeWidth={4} style={{ filter: 'drop-shadow(0 18px 22px rgba(0,0,0,0.6))' }} />
      </svg>
      <C17Particles mode="sparkle" at={[540, 880]} amount={0.7} />
      <At t0={C.lakeeren5 - 0.35} t1={C.jism5}><C14Roads roads={[{ d: 'M180,700 L360,620 L300,820 L560,700 L480,960 L760,820 L700,1080 L920,980', color: '#2B2B2B', width: 8 }]} step={1} /></At>
      <At t0={C.lakeeren5 + 0.3} t1={C.jism5}><Stamp at={[550, 860]} size={260} /></At>
    </AbsoluteFill>
  );
};
const PhotosShot: React.FC<{ t: number }> = ({ t }) => {
  const id = t < C.secretariat6 - 0.05 ? 'cg03' : t < C.highcourt6 - 0.05 ? 'cg04' : 'cg05';
  const [label, t0] = id === 'cg03' ? ['विधानसभा', C.vidhan6] : id === 'cg04' ? ['SECRETARIAT', C.secretariat6] : ['HIGH COURT', C.highcourt6];
  return (
    <AbsoluteFill>
      <Photo id={id} t={t} t0={id === 'cg03' ? C.jahan6 : id === 'cg04' ? C.secretariat6 - 0.05 : C.highcourt6 - 0.05} t1={id === 'cg03' ? C.secretariat6 : id === 'cg04' ? C.highcourt6 : C.poora7} z0={1.04} z1={1.16} ox={id === 'cg04' ? -30 : 20} />
      {t >= t0 - 0.1 && <At t0={t0 - 0.1} t1={C.poora7}><Row y={1380}><C07Pill text={label} size={62} /></Row></At>}
    </AbsoluteFill>
  );
};
const SpotShot: React.FC<{ t: number }> = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    {has('cg25') ? <At t0={C.sirf8} t1={C.nasen9 + 0.3}><C15Spotlight src={IMG('cg25')} rect={[220, 560, 640, 860]} /></At> : null}
    <At t0={C.paradise8 - 0.55} t1={C.nasen9 + 0.3}><Row y={1300}><C07Pill text="PEDESTRIANS' PARADISE" size={54} color={COL.neon} /></Row></At>
    {has('cg06') && <At t0={C.ise8 - 0.1} t1={C.nasen9 + 0.3}><Box x={720} y={760} w={480} h={400}><C22Card src={IMG('cg06')} w={340} ratio={RATIO('cg06')} tilt={4} seed={6} /></Box></At>}
  </AbsoluteFill>
);
const SecrShot: React.FC<{ t: number }> = ({ t }) => {
  const facade = PTS('cg04', 'facade', [[150, 640], [930, 640], [930, 1320], [150, 1320]]);
  const src = facade.reduce((a, p) => [a[0] + p[0] / facade.length, a[1] + p[1] / facade.length], [0, 0]) as P;
  return (
    <AbsoluteFill>
      <Photo id="cg04" t={t} t0={C.imaraten11 - 0.25} t1={C.highcourt11} z0={1.02} z1={1.18} ox={-25}>
        {has('cg04') && <At t0={C.secretariat11 - 0.1} t1={C.highcourt11}><C18Highlight points={facade} color="#D42AB0" mode="strips" strips={6} /></At>}
      </Photo>
      <At t0={C.mausam11 - 0.1} t1={C.garmi11}><Row y={560}><C07Pill text="☀ 45°C" size={60} color="#FFB347" out={sec(C.mausam11 - 0.1, C.garmi11 - 0.3)} /></Row></At>
      <At t0={C.garmi11 - 0.1} t1={C.highcourt11}><C17Particles mode="cool" at={src} amount={1.2} /></At>
      <At t0={C.garmi11} t1={C.highcourt11}><Row y={560}><C07Pill text="गर्मी → ठंडक" size={60} color="#9BE8FF" /></Row></At>
      <At t0={C.thanda11 - 0.2} t1={C.highcourt11}><Box x={540} y={1250} w={700} h={260}><P07CountUp from={45} to={28} dur={30} unit="°C" size={120} /></Box></At>
    </AbsoluteFill>
  );
};
const HcShot: React.FC<{ t: number }> = ({ t }) => {
  const roof = PTS('cg05', 'roof', [[120, 560], [960, 560], [960, 700], [120, 700]]);
  const xs = roof.map((p) => p[0]), ys = roof.map((p) => p[1]);
  const line: [P, P] = [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.min(...ys)]];
  return (
    <AbsoluteFill>
      <Photo id="cg05" t={t} t0={C.highcourt11} t1={C.isi12} z0={1.02} z1={1.18} ox={20}>
        {has('cg05') && <At t0={C.mudi11 - 0.1} t1={C.isi12 + 0.4}><C18Highlight points={roof} color="#8A1FC8" mode="roof" /></At>}
        <At t0={C.dhoop11 - 0.4} t1={C.isi12 + 0.4}><C16SunRays sun={IMG('gp10')} roof={line} rays={5} /></At>
      </Photo>
      <At t0={C.mudi11 + 0.2} t1={C.isi12 + 0.4}><Row y={1380}><C07Pill text="मुड़ी हुई छत" size={62} /></Row></At>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ look B: the paper plan (lines 5–13)
const BOX: [number, number, number, number] = [80, 380, 920, 1300];
const SNAP = Easing.bezier(0.7, 0, 0.18, 1);
const PG = planGeom(BOX);
const MORPH_BOX: [number, number, number, number] = [PG.ox - 26, PG.oy - 26, PG.gw + 52, PG.gh + 52];
const HI: [number, number] = [5, 4];
type Z = { t: number; s: number; at: P };
/** The plan's own camera: gentle zooms on every beat, two zoom-throughs (the sector, the V7 footpaths). */
const PLANZ = (): Z[] => {
  const hc = PG.cell(...HI), s17 = PG.cell(S17[0], S17[1]), mid: P = [PG.ox + PG.gw / 2, PG.oy + PG.gh / 2], cap: P = [PG.capitol.x + PG.capitol.w / 2, PG.capitol.y + 200];
  const hcc: P = [hc.x + hc.w / 2, hc.y + hc.h / 2], s17c: P = [s17.x + s17.w / 2, s17.y + s17.h / 2];
  return [
    { t: 0, s: 1, at: mid },
    { t: C.sabse6 - 0.2, s: 1.0, at: mid },
    { t: C.capitol6 + 0.2, s: 1.12, at: cap },
    { t: C.poora7 + 0.2, s: 1.0, at: mid },
    { t: C.sector7 + 0.45, s: 1.85, at: hcc },
    { t: C.sab7 + 0.3, s: 2.35, at: hcc },
    { t: C.s17 - 0.1, s: 1.05, at: mid },
    { t: C.gaadiyan8, s: 1.35, at: s17c },
    { t: C.nasen9 - 0.1, s: 1.0, at: mid },
    { t: C.v7b - 0.1, s: 1.08, at: mid },
    { t: C.v7b + 0.5, s: 2.2, at: s17c },
    { t: C.phephde10 + 0.3, s: 1.0, at: mid },
    { t: C.saaf10 + 0.5, s: 1.08, at: mid },
    { t: C.isi12 + 0.4, s: 1.05, at: cap },
    { t: C.unesco12 + 0.2, s: 1.3, at: cap },
    { t: C.corb13 - 0.1, s: 1.25, at: cap },
    { t: C.corb13 + 0.8, s: 0.92, at: mid },
    { t: DURATION_S, s: 0.97, at: mid },
  ];
};
const planCam = (t: number) => {
  const K = PLANZ();
  let i = 1;
  while (i < K.length - 1 && t > K[i].t) i++;
  const a = K[i - 1], b = K[i], u = SNAP(clamp01((t - a.t) / Math.max(1e-3, b.t - a.t)));
  const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), u));
  const at: P = [lerp(a.at[0], b.at[0], u), lerp(a.at[1], b.at[1], u)];
  const breathe = 1 + 0.008 * Math.sin(t * LOOPF(41));
  return { s: s * breathe, at };
};
const PaperShot: React.FC<{ t: number }> = ({ t }) => {
  const { s, at } = planCam(t);
  const hc = PG.cell(...HI), s17 = PG.cell(S17[0], S17[1]);
  const s17c: P = [s17.x + s17.w / 2, s17.y + s17.h / 2];
  const cap: P = [PG.capitol.x + PG.capitol.w / 2, PG.capitol.y + PG.capitol.h / 2];
  const x0 = PG.ox, y0 = PG.oy, x1 = PG.ox + PG.gw, y1 = PG.oy + PG.gh;
  const roads: Road[] = [
    ...[1, 3, 5, 7].map((k) => ({ d: `M${x0 + k * PG.w},${y0 - 200} L${x0 + k * PG.w},${y1 + 200}`, color: COL.roadV1, width: 9 })),
    ...[1, 3, 5].map((k) => ({ d: `M${x0 - 200},${y0 + k * PG.h} L${x1 + 200},${y0 + k * PG.h}`, color: COL.roadV2, width: 7 })),
    { d: `M${x0},${y0 + PG.gh * 0.82} Q${x0 + PG.gw * 0.5},${y0 + PG.gh * 0.55} ${x1},${y0 + PG.gh * 0.86}`, color: COL.roadV3, width: 7 },
  ];
  const foot: Road[] = [0, 2, 4, 6].map((k) => ({ d: `M${x0 + (k + 0.5) * PG.w},${y0} L${x0 + (k + 0.5) * PG.w},${y1}`, color: '#555', width: 4, dashed: true }));
  const tagAt: [P, string, 'left' | 'right' | 'below'][] = [[[x1 + 20, y0 - 60], 'KALKA', 'left'], [[x1 + 20, y1 + 40], 'AMBALA', 'left'], [[x0 - 20, y1 + 40], 'PATIALA', 'right'], [[x0 - 20, y0 - 60], 'MULLANPUR', 'right']];
  const valley: P = [x0 + 2 * PG.w, y0 + PG.gh * 0.5];
  // the body over the plan at the end: brain at its head, heart in the chest, lungs either side
  const head: P = [MORPH_BOX[0] + MORPH_BOX[2] * 0.5, MORPH_BOX[1] + MORPH_BOX[3] * 0.08];
  const chest: P = [MORPH_BOX[0] + MORPH_BOX[2] * 0.53, MORPH_BOX[1] + MORPH_BOX[3] * 0.27];
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #FBF8F1 40%, #D9D4CA 100%)', overflow: 'hidden' }}>
      {has('cg21') && <Img src={IMG('cg21')} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, objectFit: 'cover', opacity: 0.9, mixBlendMode: 'multiply' }} />}
      <Row y={200}><div style={{ fontFamily: GEO, fontWeight: 600, letterSpacing: 18, fontSize: 70, color: '#151515', opacity: ramp(t, C.jism5 - 0.2, C.jism5 + 0.3, linear) }}>CHANDIGARH</div></Row>
      <AbsoluteFill style={{ transformOrigin: `${at[0]}px ${at[1]}px`, transform: `scale(${s})` }}>
        {/* the UT outline → the body → the plan's frame (it stays as the frame) */}
        <C09LineMorph shapes={[UT_SHAPE, BODY, SQUARE]} keys={[[F(C.jism5 - 0.35), 0], [F(C.jism5 + 0.15), 1], [F(C.sabse6 + 1.15), 2]]} box={MORPH_BOX} width={5} />
        <At t0={C.sabse6 - 0.1} t1={C.sabse6 + 1.2}><Glow at={[MORPH_BOX[0] + MORPH_BOX[2] * 0.5, MORPH_BOX[1] + MORPH_BOX[3] * 0.07]} r={110} color="#FFC93C" /></At>
        <C12SectorPlan box={BOX} jute={has('cg19') ? IMG('cg19') : undefined} brain={has('cg16') ? IMG('cg16') : undefined} heart={has('cg17') ? IMG('cg17') : undefined}
          reveal={F(C.poora7)} revealDur={60} capitol={F(C.capitol6 - 0.1)} s17={F(C.s17 - 0.1)} hi={[F(C.sector7 + 0.2), HI[0], HI[1]]} pale={[F(C.nasen9 + 0.1), 30]}
          edu={F(C.school7 + 2.8)} ind={F(C.school7 + 3.0)} valley={F(C.leisure10 - 0.2)} gardens={F(C.leisure10 + 0.5)} />
        <At t0={C.capitol6 + 0.1} t1={C.jahan6 + 0.5}><C13Leader at={[PG.capitol.x + PG.capitol.w, PG.capitol.y + 20]} to={[PG.capitol.x + PG.capitol.w + 150, PG.capitol.y - 100]} text="Capitol Complex" size={36} /></At>
        <At t0={C.poora7 + 0.9} t1={C.sector7 + 0.2}><C13Leader at={[x0 + PG.w * 0.5, y0 + PG.h * 2.5]} to={[x0 - 10, y0 - 70]} text="Sectors" size={40} side="right" /></At>
        <At t0={C.m800 - 0.15} t1={C.dil8}><C13Dim from={[hc.x, hc.y - 12]} to={[hc.x + hc.w, hc.y - 12]} value={800} side="above" size={22} dur={22} /></At>
        <At t0={C.m1200 - 0.1} t1={C.dil8}><C13Dim from={[hc.x + hc.w + 12, hc.y]} to={[hc.x + hc.w + 12, hc.y + hc.h]} value={1200} side="right" size={22} dur={22} /></At>
        <At t0={C.apne7} t1={C.dil8}><Glow at={[hc.x + hc.w / 2, hc.y + hc.h / 2]} r={hc.h * 0.75} color="#FFC93C" ring /></At>
        {(['cg07', 'cg08', 'cg09'] as const).map((id, i) => has(id) && (
          <At key={id} t0={[C.ghar7, C.school7, C.hospital7][i] - 0.15} t1={C.sab7 + 0.5}>
            <Box x={hc.x + hc.w / 2 + (i - 1) * 46} y={hc.y + hc.h / 2 - 20 + i * 8} w={300} h={260}>
              <C22Card src={IMG(id)} w={200} ratio={RATIO(id)} tilt={(i - 1) * 6} seed={i + 2} into={[sec([C.ghar7, C.school7, C.hospital7][i] - 0.15, C.sab7 + 0.05), -(i - 1) * 46, 20 - i * 8]} />
            </Box>
          </At>
        ))}
        <At t0={C.sab7 + 0.25} t1={C.sab7 + 1.2}><P32Shock at={[hc.x + hc.w / 2, hc.y + hc.h / 2]} r={110} color="#FFC93C" /></At>
        <At t0={C.s17 + 0.2} t1={C.sirf8}><C13Leader at={s17c} to={[s17c[0] - 180, s17c[1] - 170]} text="Sector 17" size={34} side="left" /></At>
        {has('cg24') && <At t0={C.gaadiyan8 - 0.35} t1={C.sirf8}><C27Stop src={IMG('cg24')} from={[s17c[0] + 520, s17c[1] + 40]} to={[s17c[0] + 120, s17c[1] + 40]} w={150} ratio={RATIO('cg24')} stamp={24} dur={20} /></At>}
        {/* the roads, the 7 Vs, the V1 lines off the map, then the footpaths and walkers */}
        <At t0={C.v1a - 0.3} t1={C.v7b + 0.2}><C14Roads roads={roads} step={5} out={sec(C.v1a - 0.3, C.v7b - 0.1)} /></At>
        {tagAt.map(([p, n, side], i) => <At key={n} t0={C.duniya9 - 0.4 + i * 0.12} t1={C.v7b}><C21Tag at={p} text={n} side={side} size={30} out={sec(C.duniya9 - 0.4 + i * 0.12, C.v7b - 0.2)} /></At>)}
        <At t0={C.v7b + 0.1} t1={C.phephde10 + 0.2}><C14Roads roads={foot} step={3} walkers={12} out={sec(C.v7b + 0.1, C.phephde10)} /></At>
        <At t0={C.leisure10 + 0.2} t1={C.imaraten11}><C13Leader at={valley} to={[valley[0] + 260, valley[1] + 380]} text="Leisure Valley" size={36} /></At>
        {has('cg18') && <At t0={C.saaf10 - 0.3} t1={C.imaraten11}><C05Badge at={valley} to={[valley[0] + 230, valley[1] - 260]} items={[[0, IMG('cg18'), 'फेफड़े']]} breathe /></At>}
        {/* line 12: the Capitol glows, the seal stamps on it */}
        <At t0={C.isi12 + 0.2} t1={C.corb13}><Glow at={cap} r={160} color="#FFE14D" /></At>
        {has('cg26') && <At t0={C.unesco12 - 0.25} t1={C.corb13 + 0.3}><Box x={cap[0]} y={cap[1] + 150} w={340} h={340}><C20Seal src={IMG('cg26')} size={300} /></Box></At>}
        <At t0={C.unesco12 - 0.05} t1={C.unesco12 + 1}><P32Shock at={[cap[0], cap[1] + 150]} r={260} color="#FFD45A" /></At>
        <At t0={C.world12} t1={C.corb13 + 0.3}><C17Particles mode="sparkle" at={[cap[0], cap[1] + 150]} /></At>
        {/* line 13: the body over the plan; brain, heart and lungs pulse on it together */}
        <At t0={C.corb13 + 0.2} t1={DURATION_S}><C09LineMorph shapes={[BODY]} keys={[[0, 0]]} box={MORPH_BOX} width={6} color="#B3202E" glow={8} drawDur={40} /></At>
        {has('cg16') && <At t0={C.zinda13 - 0.15} t1={DURATION_S}><C05Badge at={head} to={[head[0] - 230, head[1] - 60]} items={[[0, IMG('cg16'), 'सिर']]} size={150} beat /></At>}
        {has('cg17') && <At t0={C.zinda13} t1={DURATION_S}><C05Badge at={chest} to={[chest[0] + 260, chest[1] - 40]} items={[[0, IMG('cg17'), 'दिल']]} size={150} beat /></At>}
        {has('cg18') && <At t0={C.zinda13 + 0.15} t1={DURATION_S}><C05Badge at={chest} to={[chest[0] - 260, chest[1] + 160]} items={[[0, IMG('cg18'), 'फेफड़े']]} size={150} breathe /></At>}
      </AbsoluteFill>
      {/* screen-space pieces: the V pills, the counter, the zone wind, 2016, the heritage pill */}
      <At t0={C.saat9 - 0.2} t1={C.v1b}><Box x={540} y={250} w={800} h={240}><P07CountUp from={1} to={7} dur={30} unit=" सड़कें" size={96} /></Box></At>
      <At t0={C.v1b} t1={C.v7b}><Row y={1720}><C07Pill text="V1 Line" dot={COL.roadV1} size={54} /></Row></At>
      <At t0={C.v7b} t1={C.phephde10}><Row y={1720}><C07Pill text="V7 Line" dot="#9A9A9A" size={54} /></Row></At>
      <At t0={C.saaf10 - 0.2} t1={C.imaraten11}><C17Particles mode="wind" amount={0.9} /></At>
      <At t0={C.y2016 - 0.2} t1={C.world12 + 0.2}><Row y={1480}><C02SerifLabel text="2016" size={150} tone="gold" out={sec(C.y2016 - 0.2, C.world12 - 0.1)} /></Row></At>
      <At t0={C.world12 - 0.1} t1={C.corb13 + 0.4}><Row y={1700}><C07Pill text="WORLD HERITAGE SITE" size={54} color={COL.pillText} /></Row></At>
    </AbsoluteFill>
  );
};
/** A soft glow (or a ring closing round a point). */
const Glow: React.FC<{ at: P; r: number; color: string; ring?: boolean }> = ({ at, r, color, ring }) => {
  const f = useCurrentFrame();
  const a = ramp(f, 0, 10, easeOut) * (0.75 + 0.25 * Math.sin(f / 7));
  if (ring) {
    const k = ramp(f, 0, 16, easeOut);
    return <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}><circle cx={at[0]} cy={at[1]} r={r * (1.6 - 0.6 * k)} fill="none" stroke={color} strokeWidth={6} opacity={k} style={{ filter: `drop-shadow(0 0 8px ${color})` }} /></svg>;
  }
  return <div style={{ position: 'absolute', left: at[0] - r, top: at[1] - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: `radial-gradient(circle, ${color}, rgba(0,0,0,0) 70%)`, opacity: a * 0.8, mixBlendMode: 'multiply' }} />;
};

// ------------------------------------------------------------------ Null (split screen, middle only)
/** Clip B: chest taps on "दिल", the stop palm on "गाड़ियाँ नहीं", the finger-walk on "पैदल"; clip C: shading his eyes
 *  on "मौसम", the finger grid on "जालीदार", fanning cool air on "ठंडा"; clip D: the clap and the thumbs-up. */
export const NULL_WIN = () => [
  { name: 'B', t0: C.dil8 - 0.15, t1: C.paradise8 + 0.9, from: 0.0 },
  { name: 'C', t0: C.imaraten11 + 0.05, t1: C.thanda11 + 0.8, from: 0.0 },
  { name: 'D', t0: C.world12 - 0.15, t1: C.ghoshit12 + 1.0, from: 0.0 },
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
          <OffthreadVideo src={staticFile(`chandigarh/null/null_cg_${name}.mp4`)} muted startFrom={Math.max(0, Math.round(from * 24))} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #4a0d14, #E8B23A, #fff, #E8B23A, #4a0d14)', boxShadow: '0 0 24px #E8B23A' }} />
    </div>
  );
};

// ------------------------------------------------------------------ subtitles, grade, flashes
const STROKE = (w: number, col = '#000') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const HOT = /^[0-9]|^[A-Za-z]/;
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
        <span key={q} style={{ color: q === cur ? '#FFC93C' : HOT.test(w) ? '#FFE14D' : '#fff', display: 'inline-block', marginRight: '0.3em', transform: `scale(${q === cur ? 1.08 : 1})` }}>{w}</span>
      ))}
    </div>
  );
};
/** A light warm drifting light and a soft vignette on everything (the map shots carry their own tilt-shift grade). No grain. */
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 34 * Math.sin(t * LOOPF(3) + 0.6), ly = 36 + 20 * Math.sin(t * LOOPF(2));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,236,200,0.08), rgba(0,0,0,0) 45%)`, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 60%, rgba(20,8,0,0.32) 100%)' }} />
    </AbsoluteFill>
  );
};
const Flashes: React.FC<{ t: number }> = ({ t }) => {
  let a = 0;
  for (const p of [C.chd2, C.bantwara3, C.ittefaq4, C.chd4 - 0.1, C.unesco12 + 0.05]) a = Math.max(a, 0.35 * ramp(t, p - 0.04, p, linear) * (1 - ramp(t, p, p + 0.28, easeOut)));
  return a > 0.01 ? <AbsoluteFill style={{ background: '#fff', opacity: a, pointerEvents: 'none' }} /> : null;
};

// ------------------------------------------------------------------ the edit
const Shot: React.FC<{ id: ShotId; t: number; blur: number }> = ({ id, t, blur }) => {
  switch (id) {
    case 'map': case 'city': case 'end': return <MapShot t={t} blur={blur} />;
    case 'temple': return <TempleShot t={t} />;
    case 'corb': return <CorbShot t={t} />;
    case 'glitter': return <GlitterShot t={t} />;
    case 'paper': return <PaperShot t={t} />;
    case 'photos': return <PhotosShot t={t} />;
    case 'spot': return <SpotShot t={t} />;
    case 'secr': return <SecrShot t={t} />;
    case 'hc': return <HcShot t={t} />;
  }
};
const Shots: React.FC<{ t: number; blur: number }> = ({ t, blur }) => {
  const { cur, prev, cut } = shotAt(t);
  const next = <Shot id={cur} t={t} blur={blur} />;
  if (!cut || !prev) return next;
  const before = <Shot id={prev} t={t} blur={blur} />;
  const at = F(cut.t), dur = F(cut.dur ?? 0.3);
  if (cut.kind === 'fade') return <AbsoluteFill>{before}<AbsoluteFill style={{ opacity: ramp(t, cut.t, cut.t + (cut.dur ?? 0.3), linear) }}>{next}</AbsoluteFill></AbsoluteFill>;
  if (cut.kind === 'diag') return <C08DiagonalWipe at={at} dur={dur} next={next}>{before}</C08DiagonalWipe>;
  if (cut.kind === 'brush') return <C10BrushWipe at={at} dur={dur} next={next}>{before}</C10BrushWipe>;
  return <C11PaperTear at={at} dur={dur} next={next}>{before}</C11PaperTear>;
};

/** NullDynasty: Chandigarh, the city designed like a living body. 1080×1920 at 60 fps, rendered at --scale=2 for 4K.
 *  The warm relief map, the paper plan and the creator's photos; the last frame runs straight into frame 0 (a loop). */
export const Chandigarh: React.FC<{ captions?: boolean; audio?: string }> = ({ captions = true, audio = AUDIO }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  useMontserrat();
  useFonts();
  usePreload();
  const mv = camMotion(t);
  const bx = Math.min(12, Math.abs(mv.vx) * 0.16 + mv.zoom * 0.5), by = Math.min(12, Math.abs(mv.vy) * 0.16 + mv.zoom * 0.5);
  const [sx, sy] = shake(t, [C.computer1 + 0.75, C.lakeeren5 + 0.3, C.gaadiyan8 + 0.05, C.unesco12 + 0.05]);
  const sp = splitAt(t);
  const q = sp ? sp.q : 0;
  const onMap = shotAt(t).cur === 'map' || shotAt(t).cur === 'city' || shotAt(t).cur === 'end';
  return (
    <AbsoluteFill style={{ background: '#1d2a33', overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="cgblur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" /></filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px)` }}>
        <Shots t={t} blur={onMap ? Math.max(bx, by) : 0} />
        <Grade t={t} />
      </AbsoluteFill>
      <Flashes t={t} />
      {sp && <NullPanel t={t} q={sp.q} name={sp.w.name} t0={sp.w.t0} t1={sp.w.t1} from={sp.w.from} />}
      {onMap && (
        <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, left: 22, fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontStyle: 'italic', color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right' }}>
          Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles (SRTM/NASA) · borders: Natural Earth
        </div>
      )}
      {!onMap && <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontStyle: 'italic', color: '#fff', opacity: 0.5, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>AI-generated images</div>}
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1600} />}
      {captions && <Watermark t={10 + (t * 120) / DURATION_S} />}
      {captions && audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
export { CAM0, merc };
