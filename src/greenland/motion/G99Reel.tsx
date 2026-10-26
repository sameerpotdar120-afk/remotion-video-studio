import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { G01Highlighter } from './G01Highlighter';
import { G02NameLabel, NameMorph } from './G02NameLabel';
import { G03IceSpread } from './G03IceSpread';
import { G04LabelSwap } from './G04LabelSwap';
import { G05PaperReveal } from './G05PaperReveal';
import { G06RomanIX } from './G06RomanIX';
import { G07Route } from './G07Route';
import { G08Snow } from './G08Snow';
import { G09Spyglass } from './G09Spyglass';
import { G10Pops } from './G10Pops';
import { G11HandLabel } from './G11HandLabel';
import { G12Stamp } from './G12Stamp';
import { G13Alert } from './G13Alert';
import { G14Fleet } from './G14Fleet';
import { G15TitleCard } from './G15TitleCard';
import { NUM, UI, useFonts } from './font';
import { Cam, centroid, country, MapView, proj, ringsD } from './MapView';
import { C, inOut, lerp, ramp } from './theme';

// g99_reel: every piece in a row on the real bright map (the atlantic and iceland plates), with a slow camera push,
// the way they will sit in the edit. Only the graphic motion shows here: the people, ships, ravens and helmets come
// from the creator's images (gl01–gl08) and are left out until they arrive. Opaque, 1080×1920, 60 fps.
const GL = centroid('Greenland'), IS = centroid('Iceland'), NO = centroid('Norway');
const push = (f: number, a: Cam, b: Cam, dur: number): Cam => {
  const t = ramp(f, 0, dur, inOut);
  return { plate: a.plate, center: [lerp(a.center[0], b.center[0], t), lerp(a.center[1], b.center[1], t)], z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), t)) };
};
const box = (w: number, h: number, node: React.ReactNode, top = 960, left = 540) => (
  <div style={{ position: 'absolute', left: left - w / 2, top: top - h / 2, width: w, height: h }}>{node}</div>
);
const at = (from: number, node: React.ReactNode) => <Sequence from={from} layout="none">{node}</Sequence>;

const S1: React.FC = () => {
  const f = useCurrentFrame();
  const c = push(f, { plate: 'atlantic', center: [-3300000, 11000000], z: 0.36 }, { plate: 'atlantic', center: [-3300000, 11000000], z: 0.4 }, 300);
  return <><MapView c={c} />{box(1080, 760, <G15TitleCard />, 520)}</>;
};
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const c = push(f, { plate: 'atlantic', center: [GL[0], GL[1] - 300000], z: 0.36 }, { plate: 'atlantic', center: [GL[0], GL[1] - 300000], z: 0.44 }, 320);
  const d = ringsD(c, country('Greenland'));
  const [gx, gy] = proj(c, GL[0], GL[1]);
  return (
    <>
      <MapView c={c} />
      {at(70, <G03IceSpread d={d} from={[gx, gy + 300]} reach={1100} dur={80} badge={[820, 1500]} />)}
      {box(1000, 360, <NameMorph at={34} hi={<G01Highlighter text="Greenland" out={34} />} label={<G02NameLabel kind="green" />} />, 560)}
    </>
  );
};
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const c = push(f, { plate: 'iceland', center: IS, z: 0.52 }, { plate: 'iceland', center: IS, z: 0.6 }, 200);
  return <><MapView c={c} />{box(1000, 360, <NameMorph at={30} hi={<G01Highlighter text="Iceland" out={30} seed={4} />} label={<G02NameLabel kind="ice" seed={5} />} />, 560)}</>;
};
const S4: React.FC = () => {
  const c: Cam = { plate: 'atlantic', center: [(GL[0] + IS[0]) / 2, (GL[1] + IS[1]) / 2 - 200000], z: 0.3 };
  const [gx, gy] = proj(c, GL[0], GL[1]), [ix, iy] = proj(c, IS[0], IS[1]);
  return (
    <>
      <MapView c={c} />
      <G04LabelSwap pa={[gx + 60, gy - 120]} pb={[ix - 60, iy - 150]} at={30} a={<G02NameLabel kind="green" size={100} fo={40} />} b={<G02NameLabel kind="ice" size={100} fo={40} seed={6} />} />
      {box(700, 260, <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 120, color: '#fff', textAlign: 'center', textShadow: '0 6px 12px rgba(0,0,0,0.6)', opacity: ramp(useCurrentFrame(), 60, 70) }}>उल्टा क्यों?</div>, 1600)}
    </>
  );
};
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const sat = push(f, { plate: 'atlantic', center: [(IS[0] + NO[0]) / 2, 9600000], z: 0.3 }, { plate: 'atlantic', center: [(IS[0] + NO[0]) / 2, 9600000], z: 0.33 }, 300);
  const [nx, ny] = proj(sat, NO[0], NO[1]), [ix, iy] = proj(sat, IS[0], IS[1]);
  return (
    <>
      <MapView c={sat} />
      <G05PaperReveal>
        <MapView c={sat} paper />
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}><path d={ringsD(sat, country('Norway'))} fill={C.red} fillOpacity={0.55 * ramp(f, 30, 44)} stroke={C.redDeep} strokeWidth={3} /></svg>
        {at(60, <G07Route d={`M ${nx - 40} ${ny} C ${nx - 200} ${ny - 220} ${ix + 260} ${iy - 200} ${ix + 60} ${iy}`} dur={170} />)}
        <G08Snow amount={0.8} />
        {at(12, box(800, 520, <G06RomanIX />, 380))}
      </G05PaperReveal>
    </>
  );
};
const S6: React.FC = () => {
  const c: Cam = { plate: 'iceland', center: [IS[0] + 150000, IS[1] + 80000], z: 1.5 };
  return <G09Spyglass><MapView c={c} /><G08Snow amount={0.6} /></G09Spyglass>;
};
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const c = push(f, { plate: 'iceland', center: IS, z: 0.52 }, { plate: 'iceland', center: IS, z: 0.57 }, 260);
  const pts: [number, number][] = [[-21.9, 64.1], [-18.1, 65.7], [-14.4, 65.3], [-20.3, 63.9], [-22.6, 65.5], [-16.0, 64.3], [-19.5, 64.9], [-23.9, 64.9], [-17.4, 66.0]].map(([lo, la]) =>
    proj(c, (lo * Math.PI / 180) * 6378137, 6378137 * Math.log(Math.tan(Math.PI / 4 + (la * Math.PI) / 360))));
  return (
    <>
      <MapView c={c} />
      <G10Pops points={pts} />
      {at(60, box(900, 700, <G11HandLabel to={[330, 640]} bend={-160} />, 520, 560))}
      {at(140, box(900, 500, <G12Stamp />, 1450))}
    </>
  );
};
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const c = push(f, { plate: 'atlantic', center: [(GL[0] + IS[0]) / 2, IS[1] + 500000], z: 0.3 }, { plate: 'atlantic', center: [GL[0], GL[1] - 300000], z: 0.36 }, 240);
  const [ix, iy] = proj(c, IS[0], IS[1]);
  const [sx, sy] = proj(c, -5000000, 8800000);
  return (
    <>
      <MapView c={c} />
      <G07Route d={`M ${ix} ${iy} C ${ix - 200} ${iy + 80} ${sx + 220} ${sy + 60} ${sx} ${sy - 30}`} dur={120} color="#FFFFFF" />
      {at(130, box(400, 400, <G13Alert />, 700))}
    </>
  );
};
const S9: React.FC = () => {
  const c: Cam = { plate: 'atlantic', center: [(GL[0] + IS[0]) / 2 - 300000, IS[1] - 200000], z: 0.36 };
  const [ix, iy] = proj(c, IS[0], IS[1] - 100000), [sx, sy] = proj(c, -5100000, 9000000);
  return <><MapView c={c} /><G14Fleet from={[ix, iy]} to={[sx, sy]} counter={[540, 460]} /></>;
};
const S10: React.FC = () => {
  const c: Cam = { plate: 'atlantic', center: [GL[0], GL[1] - 300000], z: 0.38 };
  return <><MapView c={c} /><G02 />{box(900, 500, <G12Stamp text="CLICKBAIT" sub="1000 साल पुराना" seed="c" tilt={-7} />, 1300)}</>;
};
const G02: React.FC = () => box(1000, 360, <G02NameLabel kind="green" fo={60} />, 560);

type Item = [string, number, React.FC];
export const REEL: Item[] = [
  ['g15 title card (frame 0)', 150, S1],
  ['g01 → g02 Greenland + g03 ice spread', 300, S2],
  ['g01 → g02 Iceland', 170, S3],
  ['g04 label swap', 140, S4],
  ['g05 paper + g06 IX + g07 route + g08 snow', 300, S5],
  ['g09 spyglass', 150, S6],
  ['g10 pops + g11 hand label + g12 exile stamp', 250, S7],
  ['g07 route west + g13 alert', 240, S8],
  ['g14 fleet', 220, S9],
  ['g12 clickbait stamp', 130, S10],
];
export const REEL_FRAMES = REEL.reduce((a, [, d]) => a + d, 0);
export const G99Reel: React.FC = () => {
  useFonts();
  let t = 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {REEL.map(([name, d, Node], i) => {
        const from = t;
        t += d;
        return (
          <Sequence key={i} from={from} durationInFrames={d}>
            <AbsoluteFill><Node /></AbsoluteFill>
            <div style={{ position: 'absolute', left: 30, bottom: 30, fontFamily: NUM, fontSize: 34, color: '#fff', opacity: 0.75, textShadow: '0 2px 4px #000' }}>{name}</div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
