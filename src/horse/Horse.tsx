import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import {
  DAY, DUSK, NIGHT, OVERCAST, SUNSET, Figure, HorseFig, Stage, camAt, lerpLight, type CamKey, type Light,
  BusStopSet, CorralSet, EmptyStreetSet, GateSet, PartySet, StableSet, StreetSet, Cloud, Dust, Leaves, idle, walk, type Pose, WordCaptions, type CapWord,
} from '../styles/stickman3d';
import CAPS from './captions.json';
import { ScrollEnd } from './ScrollEnd';

export const HORSE_TOTAL = 3680;

/* ───────────── timing helpers (global frames, matched to the reference) ───────────── */
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const sm = (t: number) => t * t * (3 - 2 * t);
const ramp = (f: number, a: number, d: number) => sm(clamp01((f - a) / d));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** piecewise-linear keyed value with smoothstep between keys */
const kv = (f: number, k: [number, number][]) => {
  if (f <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (f <= k[i][0]) return lerp(k[i - 1][1], k[i][1], sm((f - k[i - 1][0]) / (k[i][0] - k[i - 1][0])));
  return k[k.length - 1][1];
};
const talk = (f: number, a: number, b: number) => (f >= a && f < b ? Math.abs(Math.sin((f - a) * 0.42)) : 0);

/** Renders children on [a, b) with opacity ramps for dissolves (fade-in length fi at the start, fade-out fo at the end). */
const Seg: React.FC<{ a: number; b: number; fi?: number; fo?: number; children: React.ReactNode }> = ({ a, b, fi = 0, fo = 0, children }) => {
  const f = useCurrentFrame();
  if (f < a || f >= b) return null;
  const o = Math.min(fi ? clamp01((f - a) / fi) : 1, fo ? clamp01((b - f) / fo) : 1);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/* ───────────── the dune the runaway horse climbs (same numbers as StreetSet's Dune) ───────────── */
const duneY = (x: number, z: number) => { const u = 1 - ((x + 9) / 22) ** 2 - ((z + 34) / 14) ** 2; return u > 0 ? -1.2 + 9 * Math.sqrt(u) : 0; };

/* ───────────── poses used a lot ───────────── */
const OLD = (f: number, o: Partial<Pose> = {}): Pose => ({ ...idle(f, 0.3), eyes: 'sleepy', mouth: 'line', ...o });
const shrug = (k: number): Partial<Pose> => ({ armL: { a: lerp(8, 42, k), e: lerp(0, -95, k) }, armR: { a: lerp(8, 42, k), e: lerp(0, -95, k) }, headTilt: -6 * k });
const point = (k: number): Partial<Pose> => ({ armR: { a: lerp(8, 82, k), e: lerp(0, -8, k) } });
const walkTo = (f: number, a: number, d: number, x0: number, x1: number) => { const t = clamp01((f - a) / d); return { x: lerp(x0, x1, t), moving: t > 0 && t < 1 }; };

/* the neighbours in the street (shots 1, 3, 4, 14, 16) */
type Mood = 'calm' | 'puzzled' | 'sad' | 'angry';
const Neighbours: React.FC<{ f: number; mood: Mood; enter?: boolean }> = ({ f, mood, enter }) => {
  const people: { look: string; x: number; z: number; at: number; seed: number }[] = [
    { look: 'blue', x: 1.55, z: 3.0, at: 170, seed: 1 }, { look: 'red', x: 0.55, z: 2.75, at: 196, seed: 2 },
    { look: 'yellow', x: -0.45, z: 2.35, at: 208, seed: 3 }, { look: 'green', x: 1.05, z: 1.8, at: 214, seed: 4 },
  ];
  const face = (i: number): Partial<Pose> => {
    if (mood === 'puzzled') return { eyes: 'dot', brows: 'sad', mouth: i % 2 ? 'wavy' : 'line', look: Math.sin(f * 0.03 + i) > 0 ? -0.8 : 0.8, sweat: i === 1 };
    if (mood === 'sad') return { eyes: 'sad', brows: 'sad', mouth: 'frown' };
    if (mood === 'angry') return { eyes: 'angry', brows: 'angry', mouth: i % 2 ? 'frown' : 'flat', anger: 1, armL: { a: 40, e: 95 }, armR: { a: 40, e: 95 } };
    return { eyes: 'dot', mouth: i === 0 ? 'open' : 'line', open: 0.5 + 0.5 * talk(f, 214, 270), brows: 'sad' };
  };
  return (
    <>
      {people.map((p, i) => {
        const w = enter ? walkTo(f, p.at, 40, -6.5 - i, p.x) : { x: p.x, moving: false };
        if (enter && f < p.at) return null;
        const base = w.moving ? walk(f + i * 9) : idle(f, p.seed);
        return <Figure key={p.look} look={p.look} pose={{ ...base, ...face(i) }} x={w.x} z={p.z} res={12} />;
      })}
    </>
  );
};

/* ───────────── 1 · the street: horse runs off, neighbours come (0–344) ───────────── */
const STREET_WIDE: CamKey[] = [[0, [2.0, 1.45, 10.8], [2.4, 1.75, -8], 47], [329, [2.1, 1.45, 10.4], [2.4, 1.75, -8], 47]];
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const t = clamp01(f / 78), hx = lerp(-1.2, -7.6, t), hz = lerp(-11, -27.5, t);
  return (
    <Stage cam={camAt(STREET_WIDE, f)}>
      <StreetSet />
      {f < 80 && <HorseFig look="brown" pose={{ mode: 'gallop', t: (f % 24) / 24 }} x={hx} z={hz} y={duneY(hx, hz)} s={1.25} res={5} flip={false} />}
      <Figure look="oldman" pose={OLD(f, f >= 288 ? shrug(ramp(f, 288, 10) * (1 - ramp(f, 322, 10))) : {})} x={3.15} z={3.85} res={14} />
      <Neighbours f={f} mood="calm" enter />
    </Stage>
  );
};

/* ───────────── 2 · close-up "bad luck? maybe. who knows" (330–494) ───────────── */
const CU_BOX = { x0: -54, x1: 54, y0: -8, y1: 80 };
const OldCloseUp: React.FC<{ cam: CamKey[]; talkA: [number, number][]; pointAt?: [number, number]; browAt?: [number, number]; light?: Light }> = ({ cam, talkA, pointAt, browAt, light }) => {
  const f = useCurrentFrame();
  const open = Math.max(...talkA.map(([a, b]) => talk(f, a, b)));
  const pk = pointAt ? ramp(f, pointAt[0], 10) * (1 - ramp(f, pointAt[1], 12)) : 0;
  const raised = browAt && f >= browAt[0] && f < browAt[1];
  return (
    <Stage cam={camAt(cam, f)} light={light}>
      <StreetSet />
      <Figure look="oldman" box={CU_BOX} pose={OLD(f, { mouth: open > 0.15 ? 'open' : 'line', open, brows: raised ? 'raised' : 'flat', eyes: 'sleepy', ...point(pk) })} x={3.15} z={3.85} res={46} />
      <Neighbours f={f} mood="calm" />
    </Stage>
  );
};
const CU1: CamKey[] = [[330, [1.6, 1.4, 8.6], [2.4, 1.6, 0], 46], [346, [3.2, 1.44, 5.3], [3.3, 1.4, 3.85], 46], [463, [3.2, 1.44, 5.25], [3.3, 1.4, 3.85], 46]];
const PULL1: CamKey[] = [[463, [3.2, 1.44, 5.25], [3.3, 1.4, 3.85], 46], [494, [1.9, 1.3, 8.4], [1.4, 1.5, -2], 46], [596, [1.9, 1.3, 8.1], [1.4, 1.5, -2], 46]];

/* ───────────── 3/4 · "they thought he'd lost his mind", time-lapse (464–660) ───────────── */
const lapse = (f: number, a: number, b: number): Light => {
  // day → dusk → night → day → dusk → night → day, ~0.33 s per phase
  if (f < a || f >= b) return DAY;
  const seq = [DAY, DUSK, NIGHT, DAY, DUSK, NIGHT, DAY], n = seq.length - 1, u = ((f - a) / (b - a)) * n, i = Math.min(n - 1, Math.floor(u));
  return lerpLight(seq[i], seq[i + 1], sm(u - i));
};
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const L = lapse(f, 596, 646);
  return (
    <Stage cam={camAt(PULL1, f)} light={L}>
      <StreetSet />
      <Figure look="oldman" pose={OLD(f)} x={3.15} z={3.85} res={14} />
      <Neighbours f={f} mood="puzzled" />
      {f >= 596 && [0, 1, 2].map((i) => <Cloud key={i} x={lerp(-30, 40, clamp01((f - 596 - i * 9) / 30))} y={14 + i * 2} z={-40 - i * 4} s={7} />)}
    </Stage>
  );
};

/* ───────────── 5 · stable yard: the horse returns with a stallion (650–1020) ───────────── */
const STABLE: CamKey[] = [[650, [-0.6, 1.3, 11.5], [0.2, 1.9, -4], 50], [880, [0.0, 1.3, 11.0], [0.6, 1.8, -4], 50], [1010, [2.6, 1.45, 7.3], [2.8, 1.5, -2], 50]];
const S5: React.FC = () => {
  const f = useCurrentFrame();
  // the brown horse along the far ridge (left → right) then down into the yard
  const t1 = clamp01((f - 660) / 110), bx = lerp(-16, 2, t1), bz = -30;
  const t2 = clamp01((f - 778) / 100), sx = lerp(-17, 0, t2);
  const arrive = f >= 890;
  const st = clamp01((f - 952) / 46), stx = lerp(9.5, -2.5, st);
  return (
    <Stage cam={camAt(STABLE, f)}>
      <StableSet />
      {!arrive && f >= 660 && f < 780 && <HorseFig look="brown" pose={{ mode: 'gallop', t: (f % 22) / 22 }} x={bx} z={bz} y={4.6} s={1.3} res={4} />}
      {!arrive && f >= 778 && <HorseFig look="black" pose={{ mode: 'gallop', t: (f % 20) / 20 }} x={sx} z={bz - 2} y={4.8} s={1.35} res={4} />}
      {arrive && <HorseFig look="brown" pose={{ mode: f > 935 ? 'graze' : 'stand' }} x={3.6} z={-1.4} s={1.25} res={8} />}
      {arrive && f < 952 && <HorseFig look="black" pose={{ mode: 'stand' }} x={1.2} z={-1.6} s={1.3} res={8} />}
      {f >= 952 && <HorseFig look="black" pose={{ mode: 'gallop', t: (f % 20) / 20 }} x={stx} z={0.9} s={1.35} res={9} flip />}
      <Figure look="oldman" pose={OLD(f, { eyes: f > 912 ? 'closed' : 'sleepy', mouth: f > 912 ? 'smile' : 'line' })} x={5.0} z={0.9} res={12} />
    </Stage>
  );
};

/* ───────────── 6/7 · the party; "you're the luckiest man in the village" (1010–1265) ───────────── */
const PARTY: CamKey[] = [[1010, [0.6, 1.55, 8.4], [0.4, 1.45, -1], 48], [1144, [0.4, 1.55, 7.6], [0.3, 1.45, -1], 48], [1172, [-1.0, 1.25, 3.55], [-1.1, 1.3, 0.6], 48], [1265, [-1.0, 1.25, 3.45], [-1.1, 1.3, 0.6], 48]];
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const cheer = ramp(f, 1150, 14);
  const blue: Pose = { ...idle(f, 1), eyes: f > 1150 ? 'star' : 'happy', mouth: 'grin', open: 0.5 + 0.5 * talk(f, 1144, 1260),
    armL: { a: lerp(10, 150, cheer), e: lerp(0, -25, cheer) + Math.sin(f * 0.3) * 6 * cheer }, armR: { a: lerp(30, 150, cheer), e: lerp(60, -25, cheer) - Math.sin(f * 0.3) * 6 * cheer },
    sparkles: cheer, bob: -Math.abs(Math.sin(f * 0.15)) * 1.5 * cheer };
  return (
    <Stage cam={camAt(PARTY, f)}>
      <PartySet />
      <Figure look="blue" pose={blue} x={-1.15} z={0.6} res={f > 1150 ? 30 : 12} box={f > 1160 ? { x0: -42, x1: 42, y0: -42, y1: 80 } : undefined} />
      <Figure look="oldman" pose={OLD(f, { mouth: 'smile', eyes: 'closed' })} x={0.3} z={-1.6} res={10} />
      <Figure look="yellow" pose={{ ...idle(f, 3), eyes: 'happy', mouth: 'open', open: talk(f, 1040, 1140), armR: { a: 60, e: 80 } }} x={1.8} z={0.1} res={10} />
      <Figure look="green" pose={{ ...idle(f, 4), eyes: 'happy', mouth: 'smile' }} x={2.6} z={-1.0} res={9} />
    </Stage>
  );
};

/* ───────────── 8/9 · he shrugs; "good luck? maybe. who knows" (1265–1470) ───────────── */
const MED: CamKey[] = [[1265, [2.9, 1.15, 7.35], [3.12, 1.0, 3.85], 46], [1334, [2.95, 1.15, 7.05], [3.12, 1.0, 3.85], 46], [1348, [3.2, 1.44, 5.3], [3.3, 1.4, 3.85], 46], [1470, [3.2, 1.44, 5.25], [3.3, 1.4, 3.85], 46]];
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const k = ramp(f, 1290, 10) * (1 - ramp(f, 1328, 10));
  if (f < 1340) {
    return (
      <Stage cam={camAt(MED, f)}>
        <StreetSet />
        <Figure look="oldman" pose={OLD(f, shrug(k))} x={3.15} z={3.85} res={22} />
      </Stage>
    );
  }
  return <OldCloseUp cam={MED} talkA={[[1338, 1375], [1386, 1412], [1420, 1462]]} pointAt={[1385, 1420]} browAt={[1388, 1418]} />;
};

/* ───────────── 10-12 · the son rides, is thrown, legs snap (1462–1760) ───────────── */
const CORRAL: CamKey[] = [[1462, [-1.4, 1.75, 6.6], [-1.2, 2.2, -2], 48], [1600, [0.3, 1.75, 6.4], [0.5, 2.2, -2], 48], [1700, [1.5, 1.6, 5.6], [2.3, 1.5, -1], 48], [1760, [1.5, 1.6, 5.5], [2.3, 1.5, -1], 48]];
const S10: React.FC = () => {
  const f = useCurrentFrame();
  const hx = kv(f, [[1462, -2.6], [1600, 0.4], [1640, 1.2]]);
  const buck = f < 1640 ? Math.sin(f * 0.22) : 0;
  const thrown = f >= 1640, landed = f >= 1678;
  // flight: up from the saddle in an arc, spinning, landing behind the fence
  const ft = clamp01((f - 1640) / 38);
  const sx = lerp(hx + 0.1, hx + 1.4, ft), sy = lerp(1.25, 0, ft) + 4.2 * Math.sin(Math.PI * ft) * (1 - ft * 0.15);
  const riding: Pose = { eyes: 'wide', mouth: 'o', armL: { a: 120 + 20 * buck }, armR: { a: 110 - 20 * buck }, legL: 70, legR: 62, kneeL: -60, kneeR: -55, sweat: true };
  const flying: Pose = { eyes: 'wide', mouth: 'o', armL: { a: 150 }, armR: { a: 140 }, legL: 30, legR: -25 };
  const hurt: Pose = { ...idle(f, 2), eyes: f < 1724 ? 'wide' : 'dizzy', mouth: f < 1724 ? 'o' : 'wavy', dizzy: f >= 1724 ? 1 : 0, legR: 18, kneeR: -35, armL: { a: 25 }, armR: { a: 30 } };
  return (
    <Stage cam={camAt(CORRAL, f)}>
      <CorralSet />
      <HorseFig look="black" pose={f < 1648 ? { mode: f > 1600 ? 'buck' : 'rear', t: f / 26 } : { mode: 'gallop', t: (f % 20) / 20 }} x={f < 1648 ? hx : lerp(hx, hx + 6, clamp01((f - 1648) / 50))} z={-0.6} s={1.35} res={9} />
      {!thrown && <Figure look="son" pose={riding} x={hx + 0.05} z={-0.45} y={1.05 + 0.25 * Math.max(0, buck)} res={10} rot={-0.15 * buck} />}
      {thrown && !landed && <Figure look="son" pose={flying} x={sx} z={0.0} y={sy} res={10} rot={-(f - 1640) * 0.2} />}
      {landed && <Figure look="son" pose={hurt} x={hx + 1.4} z={0.0} res={11} />}
      <Dust at={1678} x={hx + 1.4} z={0.3} s={1.2} />
      <Dust at={1690} x={hx + 1.1} z={0.4} s={0.9} />
    </Stage>
  );
};

/* ───────────── 13 · he'll limp for the rest of his life (1758–1910) ───────────── */
const LIMP: CamKey[] = [[1758, [-0.8, 1.4, 4.6], [-0.9, 1.3, -3], 46], [1910, [-0.6, 1.4, 4.3], [-0.7, 1.3, -3], 46]];
const S13: React.FC = () => {
  const f = useCurrentFrame();
  const x = kv(f, [[1770, -1.5], [1860, 0.1]]);
  const step = Math.sin(f * 0.16);
  return (
    <Stage cam={camAt(LIMP, f)}>
      <StableSet />
      <Figure look="son" pose={{ eyes: 'sad', brows: 'sad', mouth: 'wavy', bandage: true, crutch: true, legR: 6 * step, legL: -4 * step, bob: -Math.abs(step) * 1.4, lean: 3 * step, armR: { a: 18 } }} x={x} z={-2.6} res={12} />
      <Figure look="oldman" pose={OLD(f)} x={-4.1} z={-1.0} res={11} />
    </Stage>
  );
};

/* ───────────── 14-16 · "what terrible luck" / "maybe" / everyone's annoyed (1900–2265) ───────────── */
const SAD: CamKey[] = [[1900, [-1.2, 1.3, 9.0], [-0.6, 1.6, -4], 46], [1980, [1.9, 1.3, 8.4], [1.4, 1.5, -2], 46], [2012, [0.55, 1.25, 5.4], [0.5, 1.2, 1.8], 46], [2060, [0.55, 1.25, 5.3], [0.5, 1.2, 1.8], 46]];
const S14: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage cam={camAt(SAD, f)}>
      <StreetSet />
      <Figure look="oldman" pose={OLD(f)} x={3.15} z={3.85} res={14} />
      <Neighbours f={f} mood="sad" />
    </Stage>
  );
};
const CU2: CamKey[] = [[2058, [3.17, 1.42, 5.55], [3.28, 1.38, 3.85], 46], [2112, [3.2, 1.44, 5.3], [3.3, 1.4, 3.85], 46]];
const ANNOY: CamKey[] = [[2112, [3.2, 1.44, 5.3], [3.3, 1.4, 3.85], 46], [2140, [1.9, 1.3, 8.4], [1.4, 1.5, -2], 46], [2265, [1.85, 1.3, 8.0], [1.4, 1.5, -2], 46]];
const S16: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage cam={camAt(ANNOY, f)}>
      <StreetSet />
      <Figure look="oldman" pose={OLD(f)} x={3.15} z={3.85} res={f < 2125 ? 40 : 14} />
      <Neighbours f={f} mood={f > 2150 ? 'angry' : 'sad'} />
    </Stage>
  );
};

/* ───────────── 17 · war: soldiers march in and drag the young men off (2256–2614) ───────────── */
const WAR: CamKey[] = [[2256, [1.4, 1.5, 9.8], [1.0, 2.2, -6], 48], [2420, [0.6, 1.45, 8.4], [0.2, 1.9, -6], 48], [2614, [0.0, 1.45, 7.8], [-0.4, 1.8, -6], 48]];
const S17: React.FC = () => {
  const f = useCurrentFrame();
  const soldiers = [0, 1, 2, 3, 4, 5, 6, 7];
  const villagers = ['blue', 'green', 'red', 'yellow'];
  return (
    <Stage cam={camAt(WAR, f)} light={SUNSET}>
      <GateSet />
      {soldiers.map((i) => {
        const at = 2290 + i * 16, x0 = 9 + i * 1.3, x1 = -3.5 + i * 1.6 - (f > 2450 ? (f - 2450) * 0.035 : 0);
        const w = walkTo(f, at, 140, x0, x1);
        return <Figure key={i} look={i % 2 ? 'soldier2' : 'soldier'} pose={{ ...(w.moving || f > 2450 ? walk(f + i * 7, 0.9) : idle(f, i)), eyes: 'angry', brows: 'angry', mouth: 'flat', spear: true }} x={w.x} z={-1.8 + (i % 3) * 1.1} res={9} />;
      })}
      {villagers.map((v, i) => {
        const dragged = f > 2466 + i * 14;
        const x = dragged ? lerp(-1 + i * 1.5, -12, clamp01((f - 2466 - i * 14) / 150)) : -1 + i * 1.5;
        return <Figure key={v} look={v} pose={{ ...(dragged ? walk(f + i * 5, 1.2) : idle(f, i)), eyes: 'wide', brows: 'sad', mouth: 'o', sweat: true, lean: dragged ? -8 : 0 }} x={x} z={0.6 + (i % 2) * 0.8} res={9} />;
      })}
      <Dust at={2470} x={-1} z={1.2} s={1.1} /><Dust at={2500} x={-4} z={1.0} s={1} /><Dust at={2540} x={-7} z={1.1} s={1} />
    </Stage>
  );
};

/* ───────────── 18/19 · empty street; except his son (2604–2930) ───────────── */
const EMPTY: CamKey[] = [[2604, [2.4, 1.2, 12.5], [0.2, 1.7, -6], 50], [2726, [2.5, 1.2, 12.2], [0.4, 1.7, -6], 50], [2770, [1.6, 1.35, 9.2], [1.55, 1.25, 2.0], 46], [2930, [1.65, 1.35, 8.9], [1.6, 1.25, 2.0], 46]];
const S18: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage cam={camAt(EMPTY, f)} light={SUNSET}>
      <EmptyStreetSet />
      <Leaves x={1} z={5} n={7} span={9} />
      {f > 2720 && <>
        <Figure look="soldier" pose={{ ...idle(f, 5), eyes: 'angry', brows: 'angry', mouth: 'flat', spear: true, look: 0.8 }} x={0.55} z={3.6} res={12} />
        <Figure look="oldman" pose={OLD(f, { eyes: 'sleepy' })} x={1.5} z={3.3} res={12} />
        <Figure look="son" pose={{ ...idle(f, 2), eyes: 'dot', mouth: 'smile', bandage: true, crutch: true, sweat: f > 2800 }} x={2.45} z={3.2} res={12} />
      </>}
    </Stage>
  );
};

/* ───────────── 20/21 · "the old man wasn't lucky… one day never tells you the whole story" (2916–3260) ───────────── */
const CALM: CamKey[] = [[2916, [1.6, 1.4, 8.6], [1.8, 1.4, -1], 48], [3130, [1.8, 1.45, 7.8], [1.9, 1.4, -1], 48], [3160, [1.0, 4.5, 14], [0.6, 1.5, -4], 52], [3260, [-2, 16, 26], [0.5, 0, -6], 52]];
const S20: React.FC = () => {
  const f = useCurrentFrame();
  const L = f < 3150 ? DAY : lapse(f, 3150, 3250);
  return (
    <Stage cam={camAt(CALM, f)} light={L}>
      <CorralSet />
      <HorseFig look="brown" pose={{ mode: 'graze', blink: f % 140 < 6 }} x={2.6} z={-0.3} s={1.25} res={9} />
      <HorseFig look="black" pose={{ mode: 'graze', blink: (f + 50) % 160 < 6 }} x={4.4} z={-1.3} s={1.3} res={9} flip />
      <Figure look="son" pose={{ ...idle(f, 2), eyes: 'happy', mouth: 'smile', bandage: true, crutch: true }} x={0.0} z={-1.0} res={11} />
      <Figure look="oldman" pose={OLD(f, { eyes: 'closed', mouth: 'smile' })} x={1.1} z={-1.6} res={11} />
      {f >= 3150 && [0, 1, 2].map((i) => <Cloud key={i} x={lerp(-40, 40, clamp01((f - 3150 - i * 10) / 40))} y={18 + i * 2} z={-40} s={8} />)}
    </Stage>
  );
};

/* ───────────── 22 · the bus stop, today (3250–3500) ───────────── */
const BUS: CamKey[] = [[3250, [1.05, 1.15, 3.9], [1.05, 1.15, -2], 46], [3500, [1.05, 1.15, 3.75], [1.05, 1.15, -2], 46]];
const S22: React.FC = () => {
  const f = useCurrentFrame();
  const man = walkTo(f, 3305, 50, 3.2, 0.75);
  const wom = walkTo(f, 3398, 30, 3.0, 1.45);
  const busX = kv(f, [[3250, 0], [3378, 0], [3420, -20]]);
  const pat = f > 3436 ? Math.sin((f - 3436) * 0.25) * 8 : 0;
  return (
    <Stage cam={camAt(BUS, f)} light={OVERCAST}>
      <BusStopSet busX={busX} />
      {f >= 3305 && <Figure look="modern" pose={{ ...(man.moving ? walk(f) : idle(f)), eyes: f < 3380 ? 'wide' : 'sad', brows: f < 3380 ? 'raised' : 'sad', mouth: f < 3380 ? 'o' : 'frown', holdBag: true, look: f > 3380 && f < 3400 ? -1 : 0 }} x={man.x} z={-1.2} res={14} />}
      {f >= 3398 && <Figure look="woman" pose={{ ...(wom.moving ? walk(f) : idle(f, 2)), eyes: 'happy', mouth: 'smile', armL: f > 3430 ? { a: 72 + pat, e: 25 } : { a: 10 } }} x={wom.x} z={-1.35} res={14} />}
    </Stage>
  );
};

/* ───────────── the whole short ───────────── */
export const Horse: React.FC<{ noAudio?: boolean }> = ({ noAudio }) => {
  const f = useCurrentFrame();
  const flash = f >= 1716 && f < 1730 ? 1 - (f - 1716) / 14 : 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Seg a={0} b={344} fo={14}><S1 /></Seg>
      <Seg a={330} b={464}><OldCloseUp cam={CU1} talkA={[[330, 378], [382, 418], [422, 462]]} pointAt={[382, 420]} browAt={[388, 418]} /></Seg>
      <Seg a={463} b={660} fo={20}><S3 /></Seg>
      <Seg a={640} b={1020} fi={20} fo={10}><S5 /></Seg>
      <Seg a={1010} b={1265} fi={10}><S6 /></Seg>
      <Seg a={1258} b={1470} fi={8}><S8 /></Seg>
      <Seg a={1460} b={1766} fi={10} fo={8}><S10 /></Seg>
      <Seg a={1758} b={1910} fi={8}><S13 /></Seg>
      <Seg a={1900} b={2066} fi={10}><S14 /></Seg>
      <Seg a={2058} b={2118} fi={8}><OldCloseUp cam={CU2} talkA={[[2060, 2096], [2104, 2112]]} pointAt={[2062, 2102]} /></Seg>
      <Seg a={2112} b={2268} fo={14}><S16 /></Seg>
      <Seg a={2254} b={2614} fi={14} fo={10}><S17 /></Seg>
      <Seg a={2604} b={2930} fi={10} fo={14}><S18 /></Seg>
      <Seg a={2916} b={3262} fi={14} fo={12}><S20 /></Seg>
      <Seg a={3250} b={3500} fi={12} fo={10}><S22 /></Seg>
      <Seg a={3490} b={HORSE_TOTAL} fi={10}><ScrollEnd /></Seg>
      {flash > 0 && <AbsoluteFill style={{ background: '#fffaf0', opacity: flash }} />}
      <Grade />
      <WordCaptions words={CAPS as CapWord[]} />
      {!noAudio && <Audio src={staticFile('horse/audio.wav')} />}
    </AbsoluteFill>
  );
};

/** Our grade (different from the reference's hazy beige): gentle contrast, warm highlights, cool vignette. */
const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(20,30,45,0.28) 100%)' }} />
);
