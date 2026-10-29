import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { C01EmbossFill } from './C01EmbossFill';
import { C02SerifLabel } from './C02SerifLabel';
import { C03Ribbon } from './C03Ribbon';
import { C06Blob } from './C06Blob';
import { C07Pill } from './C07Pill';
import { C08DiagonalWipe } from './C08DiagonalWipe';
import { C09LineMorph, BODY, SQUARE, unit } from './C09LineMorph';
import { C10BrushWipe } from './C10BrushWipe';
import { C11PaperTear } from './C11PaperTear';
import { C12SectorPlan, S17, planGeom } from './C12SectorPlan';
import { C13Dim, C13Leader } from './C13Leader';
import { C14Roads, Road, veins } from './C14Roads';
import { C17Particles } from './C17Particles';
import { C19MapGrade } from './C19MapGrade';
import { C21Tag } from './C21Tag';
import { Cam, G, MapView, lineD, merc, ringsD, toS, town } from './MapView';
import { C, clamp } from './theme';

// c99_reel: the code-only pieces on the real plates and the paper plan, no stand-in images (the photo, icon and prop
// pieces get checked on the creator's own images). Scenes: India → Pakistan → Punjab split; the Shivalik ribbon and the
// site blob; the UT and the desaturated city; the morphs; the sector plan with dims, Sector 17, roads and zones; the
// wipes and pills.
const cam = (f: number, keys: [number, number, number, number][]): Cam => {
  let k = 0;
  while (k < keys.length - 2 && f > keys[k + 1][0]) k++;
  const [f0, lo0, la0, m0] = keys[k], [f1, lo1, la1, m1] = keys[Math.min(k + 1, keys.length - 1)];
  const u = Easing.inOut(Easing.cubic)(interpolate(f, [f0, f1], [0, 1], clamp));
  const a = merc(lo0, la0), b = merc(lo1, la1);
  return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, mpp: Math.exp(Math.log(m0) + (Math.log(m1) - Math.log(m0)) * u) };
};
const Paper: React.FC = () => <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #FBF8F1 40%, #D9D4CA 100%)' }} />;
const Centre: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center' }}>{children}</div>;

const India: React.FC = () => {
  const f = useCurrentFrame();
  const c = cam(f, [[0, 82, 21.5, 3500], [150, 77, 29, 2300], [300, 75.2, 31, 1300]]);
  const d = (r: number[][][]) => ringsD(c, r);
  return (
    <AbsoluteFill>
      <MapView c={c} />
      <C01EmbossFill d={d(G.countries.India)} color={C.india} mode="fade" dur={0} />
      <Sequence from={40}><C01EmbossFill d={d(G.countries.Pakistan)} color={C.pakistan} mode="wipe" angle={0} dur={30} /></Sequence>
      <Sequence from={120}><C01EmbossFill d={d(G.states.PunjabUndivided)} color="#FFFFFF" mode="fade" dur={12} out={50} outDur={8} blend="normal" strength={0.55} /></Sequence>
      <Sequence from={170}><C01EmbossFill d={d(G.states.PunjabPK)} color={C.punjabPK} mode="wipe" angle={180} dur={18} /></Sequence>
      <Sequence from={185}><C01EmbossFill d={d(G.states.PunjabIN)} color={C.punjabIN} mode="wipe" angle={0} dur={18} /></Sequence>
      <Sequence from={200}><C21Tag at={toS(c, town('Lahore'))} text="LAHORE" side="left" /></Sequence>
      <C19MapGrade />
      <Sequence durationInFrames={110}><Centre y={1180}><C02SerifLabel text="INDIA" size={110} /></Centre></Sequence>
      <Sequence from={210}><Centre y={560}><C02SerifLabel text="PUNJAB" size={90} tone="gold" /></Centre></Sequence>
    </AbsoluteFill>
  );
};
const Shivalik: React.FC = () => {
  const f = useCurrentFrame();
  const c = cam(f, [[0, 76.3, 31.1, 700], [240, 76.75, 30.8, 380]]);
  const site = toS(c, merc(76.78, 30.74));
  return (
    <AbsoluteFill>
      <MapView c={c} />
      <Sequence from={10}><C03Ribbon d={lineD(c, G.shivalik)} dur={70} /></Sequence>
      <Sequence from={100}><C06Blob at={site} r={90} mode="gold" /></Sequence>
      <Sequence from={130}><C14Roads roads={veins(site, 9, 520)} step={2} /></Sequence>
      <C19MapGrade />
    </AbsoluteFill>
  );
};
const City: React.FC = () => {
  const f = useCurrentFrame();
  const c = cam(f, [[0, 76.78, 30.74, 60], [180, 76.77, 30.73, 30]]);
  const ds = interpolate(f, [70, 140], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <MapView c={c} desat={ds} />
      <C01EmbossFill d={ringsD(c, G.states.Chandigarh)} color={C.ut} mode="fade" dur={14} out={110} outDur={30} strength={0.75} />
      <Sequence from={30}><C21Tag at={toS(c, town('Chandigarh'))} text="CHANDIGARH" /></Sequence>
      <C19MapGrade />
    </AbsoluteFill>
  );
};
const UTSHAPE = unit(G.states.Chandigarh.reduce((a, r) => (r.length > a.length ? r : a)), true);
const Morph: React.FC = () => (
  <AbsoluteFill>
    <Paper />
    <C09LineMorph shapes={[UTSHAPE, BODY, SQUARE]} keys={[[0, 0], [60, 1], [150, 2]]} box={[190, 460, 700, 1000]} width={5} />
    <Sequence from={20}><Centre y={210}><div style={{ fontFamily: 'CGJost', fontWeight: 600, letterSpacing: 18, fontSize: 70, color: '#151515' }}>CHANDIGARH</div></Centre></Sequence>
  </AbsoluteFill>
);
const BOX: [number, number, number, number] = [80, 360, 920, 1360];
const Plan: React.FC = () => {
  const f = useCurrentFrame();
  const g = planGeom(BOX);
  const s = g.cell(S17[0], S17[1]), hc = g.cell(5, 4);
  const z = interpolate(f, [150, 190, 290, 320], [1, 1.5, 1.5, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const roads: Road[] = [
    ...[1, 3, 5, 7].map((k) => ({ d: `M${g.ox + k * g.w},${g.oy - 120} L${g.ox + k * g.w},${g.oy + g.gh + 120}`, color: C.roadV1, width: 9 })),
    ...[1, 3, 5].map((k) => ({ d: `M${g.ox - 120},${g.oy + k * g.h} L${g.ox + g.gw + 120},${g.oy + k * g.h}`, color: C.roadV2, width: 7 })),
    { d: `M${g.ox},${g.oy + g.gh * 0.8} Q${g.ox + g.gw * 0.5},${g.oy + g.gh * 0.55} ${g.ox + g.gw},${g.oy + g.gh * 0.85}`, color: C.roadV3, width: 7 },
  ];
  return (
    <AbsoluteFill>
      <Paper />
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${hc.x + hc.w / 2}px ${hc.y + hc.h / 2}px` }}>
        <C12SectorPlan box={BOX} reveal={0} revealDur={100} capitol={90} s17={340} hi={[160, 5, 4]} pale={[420, 30]} edu={560} ind={580} valley={600} gardens={640} />
        <Sequence from={200}><C13Dim from={[hc.x, hc.y - 14]} to={[hc.x + hc.w, hc.y - 14]} value={800} side="above" size={30} /></Sequence>
        <Sequence from={240}><C13Dim from={[hc.x + hc.w + 14, hc.y]} to={[hc.x + hc.w + 14, hc.y + hc.h]} value={1200} side="right" size={30} /></Sequence>
      </AbsoluteFill>
      <Sequence from={100}><C13Leader at={[g.capitol.x + g.capitol.w, g.capitol.y + 20]} to={[g.capitol.x + g.capitol.w + 140, g.capitol.y - 90]} text="Capitol Complex" /></Sequence>
      <Sequence from={350}><C13Leader at={[s.x + s.w / 2, s.y + s.h / 2]} to={[s.x - 60, s.y - 120]} text="Sector 17" side="left" /></Sequence>
      <Sequence from={450} durationInFrames={110}><C14Roads roads={roads} step={5} walkers={0} /></Sequence>
      <Sequence from={480} durationInFrames={80}><Centre y={1760}><C07Pill text="V1 Line" dot={C.roadV1} /></Centre></Sequence>
      <Sequence from={610}><C13Leader at={[g.ox + 2 * g.w, g.oy + g.gh * 0.5]} to={[g.ox + 2 * g.w + 220, g.oy + g.gh * 0.5 + 360]} text="Leisure Valley" /></Sequence>
      <Sequence from={640}><C17Particles mode="wind" amount={0.8} /></Sequence>
    </AbsoluteFill>
  );
};
const Wipes: React.FC = () => {
  const glitter = <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 45%, #7A1220, #2A0508)' }}><C17Particles mode="sparkle" at={[540, 900]} /></AbsoluteFill>;
  const panel = (bg: string, text: string) => <AbsoluteFill style={{ background: bg }}><Sequence from={10}><Centre y={900}><C07Pill text={text} /></Centre></Sequence></AbsoluteFill>;
  return (
    <C08DiagonalWipe at={40} next={<C10BrushWipe at={70} next={<C11PaperTear at={130} next={<Paper />}>{panel('#3B4A57', 'HIGH COURT')}</C11PaperTear>}>{panel('#1E5F74', 'विधानसभा')}</C10BrushWipe>}>{glitter}</C08DiagonalWipe>
  );
};
const SCENES: [React.FC, number][] = [[India, 300], [Shivalik, 240], [City, 180], [Morph, 220], [Plan, 720], [Wipes, 200]];
export const REEL_FRAMES = SCENES.reduce((a, s) => a + s[1], 0);
export const C99Reel: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {SCENES.map(([S, n], i) => { const from = at; at += n; return <Sequence key={i} from={from} durationInFrames={n}><S /></Sequence>; })}
    </AbsoluteFill>
  );
};
