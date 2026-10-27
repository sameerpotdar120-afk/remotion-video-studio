import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { useMontserrat } from '../../darien/Brand';
import { clamp01, easeOut, inOut, lerp, linear, pop, ramp } from '../../darien/anim';
import SIZES from '../../../public/garbagepatch/img_sizes.json';
import { UI, useFonts } from '../motion/font';
import { MapView, indiaRing, patchRing, riverD, ringsD, state } from '../motion/MapView';
import { P01Mosaic } from '../motion/P01Mosaic';
import { P02Accent } from '../motion/P02Accent';
import { P03HandArrow } from '../motion/P03HandArrow';
import { P04GlowOutline } from '../motion/P04GlowOutline';
import { P05Leader } from '../motion/P05Leader';
import { P06RegionGlow } from '../motion/P06RegionGlow';
import { P07CountUp } from '../motion/P07CountUp';
import { P08ShapeLand } from '../motion/P08ShapeLand';
import { P09MapCard } from '../motion/P09MapCard';
import { P10NumRing } from '../motion/P10NumRing';
import { P11Callout } from '../motion/P11Callout';
import { P12DashPaths } from '../motion/P12DashPaths';
import { P13Boat } from '../motion/P13Boat';
import { P14SunDrops } from '../motion/P14SunDrops';
import { P15Patch } from '../motion/P15Patch';
import { P16FoodChain } from '../motion/P16FoodChain';
import { P17Letterbox } from '../motion/P17Letterbox';
import { P18ZoomBlur } from '../motion/P18ZoomBlur';
import { P19Currents } from '../motion/P19Currents';
import { P20Smear } from '../motion/P20Smear';
import { P21CrossSection } from '../motion/P21CrossSection';
import { P22Satellite } from '../motion/P22Satellite';
import { P23Plane } from '../motion/P23Plane';
import { P24PinDrop } from '../motion/P24PinDrop';
import { P25Shatter } from '../motion/P25Shatter';
import { P26Magnifier } from '../motion/P26Magnifier';
import { P27Hud } from '../motion/P27Hud';
import { P28Vortex } from '../motion/P28Vortex';
import { P29PropPath } from '../motion/P29PropPath';
import { P30Rivers } from '../motion/P30Rivers';
import { P31SoupBowl } from '../motion/P31SoupBowl';
import { P32Shock } from '../motion/P32Shock';
import { P33CityPins } from '../motion/P33CityPins';
import { P34Waves } from '../motion/P34Waves';
import { P35Bracket } from '../motion/P35Bracket';
import { C, CAPS, Cam, DURATION_S, LOOPF, PATCH, P, camAt, camMotion, ll, merc, shake, toS } from './cam';

export const GP_DURATION_60 = Math.round(DURATION_S * 60);
const F = (s: number) => Math.round(s * 60);
const AUDIO = 'garbagepatch/audio/mix.wav';

const SZ = SIZES as Record<string, { w: number; h: number; ext?: string; lens?: number[] }>;
const IMG = (k: string) => staticFile(`garbagepatch/img/${k}.${SZ[k]?.ext ?? 'png'}`);
const RATIO = (k: string) => (SZ[k] ? SZ[k].h / SZ[k].w : 1);
const SHARDS = Object.keys(SZ).filter((k) => k.startsWith('gp13_shard_')).sort().map(IMG);
const ISLAND = IMG('gp01_trash_island'), TEXTURE = IMG('gp02_microplastic_texture');

/** Images drawn on canvases or inside SVG are decoded before any frame renders (every render chunk opens a fresh tab). */
const PRE = [ISLAND, TEXTURE];
let preloaded: Promise<unknown> | null = null;
const usePreload = () => {
  const [h] = React.useState(() => delayRender('gp images'));
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

// ------------------------------------------------------------------ shots that replace the map
/** The map card (line 5), the plastic soup (line 11) and the cross-section (line 13). */
const CARD = () => [C.duniya5 - 0.05, C.yahan6 + 0.05];
const SOUP = () => [C.asal11 + 0.12, C.samundar12];
const SECTION = () => [C.jo13 - 0.25, C.mitti14 - 0.02];
const inWin = (t: number, [a, b]: number[]) => t >= a && t < b;

// ------------------------------------------------------------------ the patch: its size on screen follows the camera
const A = 1062e3, B = 661e3, K = 1.12;
const patchBox = (c: Cam) => { const [x, y] = toS(c, PATCH); return { x, y, w: (2 * A * K) / c.mpp, h: (2 * B * K) / c.mpp }; };
const AtPatch: React.FC<{ c: Cam; children: React.ReactNode }> = ({ c, children }) => {
  const b = patchBox(c);
  return <div style={{ position: 'absolute', left: b.x - b.w / 2, top: b.y - b.h / 2, width: b.w, height: b.h }}>{children}</div>;
};
const MOSAIC_CELL = (c: Cam) => Math.max(8, Math.round(patchBox(c).w / 14));

const Patch: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const b = patchBox(c);
  return (
    <>
      {/* frame 0 to "कचरे": the censor mosaic, which sharpens into the island; the loop's end breaks it back into cells */}
      {(t < C.kachre2 + 0.6) && <AtPatch c={c}><P01Mosaic src={ISLAND} w={b.w} h={b.h} reveal={F(C.kachre2)} dur={30} cell={MOSAIC_CELL(c)} /></AtPatch>}
      <At t0={C.kachre2 + 0.55} t1={C.tukde8 + 1.6}><AtPatch c={c}><P15Patch island={ISLAND} texture={TEXTURE} w={b.w} h={b.h} dissolveAt={F(C.tukde8 - C.kachre2 - 0.55)} dissolveDur={55} /></AtPatch></At>
      <At t0={C.tukde8 + 1.6} t1={C.asal11 + 0.3}><AtPatch c={c}><P15Patch island={ISLAND} texture={TEXTURE} w={b.w} h={b.h} dissolveAt={-200} fadeAt={F(C.chhote10 - C.tukde8 - 1.6)} fadeTo={0.12} /></AtPatch></At>
      <At t0={C.samundar12 - 0.3} t1={C.jo13 + 0.2}><AtPatch c={c}><P15Patch island={ISLAND} texture={TEXTURE} w={b.w} h={b.h} dissolveAt={-200} swellAt={F(C.badhta12 - C.samundar12 + 0.3)} /></AtPatch></At>
      <At t0={C.mitti14 - 0.05} t1={C.isiliye14 + 0.1}><AtPatch c={c}><P15Patch island={ISLAND} texture={TEXTURE} w={b.w} h={b.h} /></AtPatch></At>
      <At t0={C.isiliye14} t1={DURATION_S + 1}><AtPatch c={c}><P01Mosaic src={ISLAND} w={b.w} h={b.h} reveal={-60} dur={F(Math.max(0.4, DURATION_S - C.isiliye14 - 0.25))} cell={MOSAIC_CELL(c)} pixelAt={0} /></AtPatch></At>
    </>
  );
};

// ------------------------------------------------------------------ overlays on the map, line by line
const INDIA_AT = merc(-122, 16);
const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const b = patchBox(c), px = b.x, py = b.y;
  const top = py - b.h / 2;
  const cal = state('California'), haw = state('Hawaii');
  const calC = ll(c, -119.5, 37.2), hawC = ll(c, -157, 20.6);
  const [ix, iy] = toS(c, INDIA_AT);
  // the outline copy that flies from the patch onto India ("मतलब पूरे भारत का लगभग आधा")
  const fly = ramp(t, C.aadha4 - 0.35, C.aadha4 + 0.15, inOut);
  const ghost = patchRing().map((r) => r.map(([x, y]) => [x + (INDIA_AT[0] - PATCH[0]) * fly, y + (INDIA_AT[1] - PATCH[1] + 250e3) * fly]));
  const mouths: [string, number, number][] = [['Fraser', -123.2, 49.1], ['Columbia', -124.0, 46.25], ['Klamath', -124.07, 41.55], ['Sacramento', -122.5, 37.8]];
  const toPatch = (x: number, y: number, k: number) => `M${x},${y} C${x - 160},${y + (k % 2 ? 160 : -120)} ${px + 260},${py + (k % 2 ? -140 : 140)} ${px + b.w * 0.25},${py}`;
  const cities: [number, number, string][] = [[-123.1, 49.28, 'Vancouver'], [-122.33, 47.6, 'Seattle'], [-122.42, 37.77, 'San Francisco'], [-118.25, 34.05, 'Los Angeles']].map(([lo, la, n]) => { const [x, y] = ll(c, lo as number, la as number); return [x, y, n as string]; });
  const drops: [number, number][] = [[-0.3, -0.2], [0.15, -0.3], [0.35, 0.05], [-0.05, 0.15], [-0.4, 0.1], [0.25, 0.25]].map(([dx, dy]) => [px + dx * b.w, py + dy * b.h]);
  const lens = SZ.gp14_magnifying_glass?.lens as [number, number, number] | undefined;
  const sec = (a: number, z: number) => F(z - a);
  return (
    <AbsoluteFill>
      {/* line 1: the plane over Alaska; "Pacific Ocean"; India's ghost; the throb; the pin, its "?", the ✕ */}
      <At t0={0.2} t1={C.nakshe1}><P23Plane src={IMG('gp09_airplane')} from={[160, 60]} to={[700, 640]} dur={sec(0.2, C.nakshe1)} w={64} /></At>
      <At t0={C.pacific1 - 0.05} t1={C.island1}><Box x={300} y={1240} w={700} h={160}><P02Accent text="Pacific Ocean" size={62} out={sec(C.pacific1 - 0.05, C.island1 - 0.3)} /></Box></At>
      <At t0={C.bharat1 - 0.1} t1={C.nakshe1 - 0.1}><P08ShapeLand d={ringsD(c, indiaRing(INDIA_AT))} c={[ix, iy]} name="भारत" out={sec(C.bharat1 - 0.1, C.nakshe1 - 0.35)} /></At>
      <At t0={C.bharat1 + 0.35} t1={C.island1 + 0.3}><Box x={px} y={top - 90} w={400} h={200}><P02Accent text="½" size={130} out={sec(C.bharat1 + 0.35, C.island1)} /></Box></At>
      <At t0={C.island1} t1={C.island1 + 0.9}><P32Shock at={[px, py]} r={b.w * 0.6} /></At>
      <At t0={C.nakshe1 - 0.45} t1={C.kyun2 + 0.1}><P24PinDrop src={IMG('gp19_map_pin')} at={[px, py - b.h * 0.1]} h={170} stamp={sec(C.nakshe1 - 0.45, C.milega1 + 0.05)} /></At>
      <At t0={C.nakshe1 - 0.25} t1={C.kyun2}><Box x={px} y={top - 300} w={1000} h={200}><P02Accent text="किसी नक्शे पर नहीं" size={72} out={sec(C.nakshe1 - 0.25, C.milega1 + 0.45)} /></Box></At>
      <At t0={C.nakshe1 + 0.15} t1={C.milega1 + 0.6}><P03HandArrow from={[px - 70, top - 240]} to={[px - 10, top - 50]} bend={0.4} out={sec(C.nakshe1 + 0.15, C.milega1 + 0.3)} /></At>

      {/* line 2: "क्यों?", nobody lives there, population 0; the reveal: "कचरा", arrows, debris bursting out */}
      <At t0={C.kyun2 - 0.05} t1={C.koi2}><Box x={540} y={560} w={600} h={300}><P02Accent text="क्यों?" size={170} out={sec(C.kyun2 - 0.05, C.koi2 - 0.25)} /></Box></At>
      <At t0={C.koi2 - 0.05} t1={C.poora2 + 0.1}><Box x={540} y={py + b.h / 2 + 170} w={1080} h={220}><P02Accent text="यहाँ कोई नहीं रहता" mode="fly" size={84} out={sec(C.koi2 - 0.05, C.poora2 - 0.2)} exit="spread" /></Box></At>
      <At t0={C.koi2 + 0.55} t1={C.poora2 + 0.2}><Box x={540} y={500} w={900} h={320}><P07CountUp from={500} to={0} dur={34} unit=" लोग" size={150} /></Box></At>
      <At t0={C.kachre2} t1={C.kehte3}><Box x={px} y={top - 150} w={800} h={240}><P02Accent text="कचरा" size={130} out={sec(C.kachre2, C.kehte3 - 0.3)} exit="spread" /></Box></At>
      <At t0={C.kachre2 + 0.2} t1={C.kehte3}>
        <P03HandArrow from={[px - 230, top - 170]} to={[px - 150, top - 20]} bend={-0.5} out={sec(C.kachre2 + 0.2, C.kehte3 - 0.3)} />
        <P03HandArrow from={[px + 230, top - 170]} to={[px + 150, top - 20]} bend={0.5} out={sec(C.kachre2 + 0.2, C.kehte3 - 0.3)} />
      </At>
      <At t0={C.kachre2 + 0.15} t1={C.kachre2 + 1.5}>
        <P29PropPath src={IMG('gp03_plastic_bottle')} w={130} keys={[[0, px, py, 0, 0.3], [16, px - 230, py - 250, 200, 1], [44, px - 70, py - 20, 380, 0.6], [50, px - 70, py - 20, 380, 0]]} />
        <P29PropPath src={IMG('gp06_plastic_bag')} w={130} keys={[[2, px, py, 0, 0.3], [18, px + 250, py - 230, -160, 1], [46, px + 80, py - 10, -320, 0.6], [52, px + 80, py - 10, -320, 0]]} />
        <P29PropPath src={IMG('gp04_plastic_crate')} w={120} keys={[[4, px, py, 0, 0.3], [20, px + 40, py - 330, 120, 1], [48, px + 10, py - 30, 260, 0.6], [54, px + 10, py - 30, 260, 0]]} />
      </At>

      {/* line 3: the outline, the name; California gold with its pin, Hawaii, the dashed line between */}
      <At t0={C.kehte3 - 0.1} t1={C.california3 + 0.5}><P04GlowOutline d={ringsD(c, patchRing())} dur={34} out={sec(C.kehte3 - 0.1, C.california3 + 0.25)} /></At>
      <At t0={C.great3 - 0.15} t1={C.california3 + 0.2}><P05Leader at={[px, py]} len={Math.max(160, b.h * 0.6 + 60)} text="Great Pacific Garbage Patch" size={50} out={sec(C.great3 - 0.15, C.california3 - 0.1)} /></At>
      <At t0={C.california3} t1={C.size4 + 0.1}><P06RegionGlow d={ringsD(c, cal)} c={calC} out={sec(C.california3, C.size4 - 0.25)} /></At>
      <At t0={C.california3 + 0.1} t1={C.size4}><P24PinDrop src={IMG('gp19_map_pin')} at={[calC[0], calC[1] - 20]} h={110} ask={false} label="California" /></At>
      <At t0={C.hawaii3 - 0.1} t1={C.size4 + 0.1}><P06RegionGlow d={ringsD(c, haw)} c={hawC} bloom={18} out={sec(C.hawaii3 - 0.1, C.size4 - 0.25)} /></At>
      <At t0={C.hawaii3 + 0.15} t1={C.size4}><P24PinDrop src={IMG('gp19_map_pin')} at={[hawC[0], hawC[1] - 10]} h={100} ask={false} label="Hawaii" /></At>
      <At t0={C.beech3 - 0.35} t1={C.size4}><P12DashPaths ds={[`M${calC[0]},${calC[1]} Q${(calC[0] + px) / 2},${(calC[1] + py) / 2 - 80} ${px + b.w * 0.3},${py}`, `M${hawC[0]},${hawC[1]} Q${(hawC[0] + px) / 2},${(hawC[1] + py) / 2 + 60} ${px - b.w * 0.1},${py + b.h * 0.35}`]} step={4} /></At>
      <At t0={C.beech3 - 0.1} t1={C.size4}><Box x={px} y={py + b.h / 2 + 90} w={600} h={140}><P02Accent text="बीच में" size={64} /></Box></At>

      {/* line 4: the shock, 16 लाख km², the outline lifts off, India lands, the outline covers half of it, "½" */}
      <At t0={C.size4} t1={C.size4 + 0.8}><P32Shock at={[px, py]} r={b.w * 0.6} /></At>
      <At t0={C.lakh4 - 0.25} t1={C.akela5}><Box x={540} y={380} w={1000} h={340}><P07CountUp to={16} unit=" लाख km²" size={150} /></Box></At>
      <At t0={C.km4} t1={C.akela5 + 0.1}><P04GlowOutline d={ringsD(c, ghost)} dur={20} fill out={sec(C.km4, C.akela5 - 0.15)} /></At>
      <At t0={C.matlab4 - 0.15} t1={C.akela5 + 0.35}><P08ShapeLand d={ringsD(c, indiaRing(INDIA_AT))} c={[ix, iy]} name="भारत" out={sec(C.matlab4 - 0.15, C.akela5)} /></At>
      <At t0={C.aadha4 + 0.05} t1={C.akela5 + 0.2}><Box x={ix + 150} y={iy + 60} w={400} h={220}><P02Accent text="½" size={150} out={sec(C.aadha4 + 0.05, C.akela5 - 0.1)} /></Box></At>

      {/* line 6: 80,000 tonnes slams down; pieces drift; the callouts; the ghost net drifting across */}
      <At t0={C.ton6 - 0.55} t1={C.botal6 - 0.05}><Box x={540} y={400} w={1000} h={340}><P07CountUp from={0} to={80000} dur={30} unit=" टन" size={140} /></Box></At>
      <At t0={C.ton6 + 0.3} t1={C.ton6 + 1.1}><P32Shock at={[px, py]} r={b.w * 0.7} /></At>
      <At t0={C.tair6 - 0.1} t1={C.botal6 + 0.6}><P29PropPath src={IMG('gp06_plastic_bag')} w={110} keys={[[0, px + b.w * 0.45, py, 0, 1], [40, px + b.w * 0.7, py + 40, 40, 1], [80, px + b.w * 0.45, py + 10, 0, 1], [86, px + b.w * 0.45, py + 10, 0, 0]]} /></At>
      <At t0={C.botal6 - 0.05} t1={C.aata7 + 0.3}><P11Callout at={[px - b.w * 0.15, py - b.h * 0.15]} to={[px - 250, py - 300]} src={IMG('gp03_plastic_bottle')} size={170} out={sec(C.botal6 - 0.05, C.aata7)} seed={1} /></At>
      <At t0={C.dibbe6 - 0.05} t1={C.aata7 + 0.3}><P11Callout at={[px + b.w * 0.2, py - b.h * 0.05]} to={[px + 270, py - 240]} src={IMG('gp04_plastic_crate')} size={170} out={sec(C.dibbe6 - 0.05, C.aata7)} seed={2} /></At>
      <At t0={C.machhli6 - 0.05} t1={C.aata7 + 0.3}><P11Callout at={[px, py + b.h * 0.2]} to={[px - 120, py + 330]} src={IMG('gp05_ghost_net')} size={230} out={sec(C.machhli6 - 0.05, C.aata7)} seed={3} /></At>
      <At t0={C.machhli6 + 0.3} t1={C.nadiyon7 + 0.4}><P29PropPath src={IMG('gp05_ghost_net')} w={150} keys={[[0, px + b.w * 0.7, py - 60, 0, 0.4], [10, px + b.w * 0.5, py - 50, -10, 1], [F(C.nadiyon7 - C.machhli6) - 6, px - b.w * 0.2, py - 20, -40, 1], [F(C.nadiyon7 - C.machhli6), px - b.w * 0.2, py - 20, -40, 0]]} /></At>

      {/* line 7: rivers light up and drain toward the patch; ships; cities with dashed paths */}
      <At t0={C.nadiyon7 - 0.1} t1={C.dhoop8 + 0.2}><P30Rivers ds={['Stikine', 'Skeena', 'Fraser', 'Columbia', 'Rogue', 'Klamath', 'Eel', 'Sacramento', 'San Joaquin'].map((n) => riverD(c, n))} step={3} out={sec(C.nadiyon7 - 0.1, C.dhoop8 - 0.1)} /></At>
      <At t0={C.nadiyon7 + 0.45} t1={C.dhoop8 + 0.2}><P12DashPaths ds={mouths.map(([, lo, la], k) => { const [x, y] = ll(c, lo, la); return toPatch(x, y, k); })} step={4} out={sec(C.nadiyon7 + 0.45, C.dhoop8 - 0.1)} /></At>
      <At t0={C.jahazon7 - 0.25} t1={C.dhoop8 + 0.3}>
        <P13Boat src={IMG('gp07_fishing_boat')} ratio={RATIO('gp07_fishing_boat')} from={[px - 400, py - 330]} to={[px - 160, py - 190]} dur={sec(C.jahazon7, C.dhoop8 + 0.5)} w={170} />
        <P13Boat src={IMG('gp07_fishing_boat')} ratio={RATIO('gp07_fishing_boat')} from={[px + 420, py + 380]} to={[px + 200, py + 170]} dur={sec(C.jahazon7, C.dhoop8 + 0.5)} w={170} seed={4} />
        <P13Boat src={IMG('gp08_cargo_ship')} ratio={RATIO('gp08_cargo_ship')} from={[1180, py - 520]} to={[px + 330, py - 300]} dur={sec(C.jahazon7, C.dhoop8 + 0.5)} w={260} seed={7} />
      </At>
      <At t0={C.jahazon7 + 0.2} t1={C.dhoop8 + 0.2}><P12DashPaths ds={[`M${px - 300},${py - 280} Q${px - 200},${py - 120} ${px - b.w * 0.2},${py - b.h * 0.1}`, `M${px + 300},${py + 300} Q${px + 160},${py + 160} ${px + b.w * 0.2},${py + b.h * 0.2}`]} out={sec(C.jahazon7 + 0.2, C.dhoop8 - 0.1)} /></At>
      <At t0={C.shehron7 - 0.4} t1={C.dhoop8 + 0.2}><P33CityPins src={IMG('gp20_city_skyline')} cities={cities} w={150} step={6} out={sec(C.shehron7 - 0.4, C.dhoop8 - 0.1)} /></At>
      <At t0={C.shehron7} t1={C.dhoop8 + 0.2}><P12DashPaths ds={cities.map(([x, y], k) => toPatch(x, y, k + 1))} step={3} out={sec(C.shehron7, C.dhoop8 - 0.1)} /></At>

      {/* line 8: the sun and drops; the waves; the bottle shatters; the dissolve (in Patch); "microplastic"; the magnifier */}
      <At t0={C.dhoop8 - 0.1} t1={C.tod8 + 0.2}><P14SunDrops sun={IMG('gp10_sun')} drop={IMG('gp11_water_drop')} targets={drops} dropFrom={sec(C.dhoop8 - 0.1, C.lehrein8 - 0.2)} out={sec(C.dhoop8 - 0.1, C.tod8 - 0.2)} /></At>
      <At t0={C.lehrein8 - 0.1} t1={C.tukde8 + 0.3}><P34Waves src={IMG('gp12_wave')} at={[px, py]} rx={b.w * 0.55} ry={b.h * 0.6} w={Math.min(240, b.w * 0.5)} /></At>
      <At t0={C.tod8 - 0.1} t1={C.tukde8 + 0.8}><P25Shatter whole={IMG('gp03_plastic_bottle')} pieces={SHARDS} w={460} burst={sec(C.tod8 - 0.1, C.tod8 + 0.5)} /></At>
      <At t0={C.micro8 - 0.15} t1={C.yahi9 + 0.1}><Box x={px} y={top - 170} w={1000} h={300}><P02Accent text="माइक्रोप्लास्टिक" size={92} arc={0.22} out={sec(C.micro8 - 0.15, C.yahi9 - 0.2)} /></Box></At>
      <At t0={C.micro8 + 0.25} t1={C.yahi9 + 0.3}><P26Magnifier glass={IMG('gp14_magnifying_glass')} texture={TEXTURE} to={[px + 30, py + 20]} w={440} lens={lens} out={sec(C.micro8 + 0.25, C.yahi9 - 0.1)} /></At>

      {/* line 9 (Null in the split): the pulse, the food chain */}
      <At t0={C.yahi9} t1={C.yahi9 + 0.9}><P32Shock at={[px, py]} r={b.w * 0.5} color="#FF8FB0" /></At>
      <At t0={C.machhli9 - 0.6} t1={C.chhote10 + 0.1}><P16FoodChain srcs={[TEXTURE, IMG('gp15_small_fish'), IMG('gp16_big_fish'), IMG('gp17_fish_thali')]} at={[540, 930]} gap={240} size={175} step={Math.max(8, Math.round(F(C.thali9 - C.machhli9 + 0.6) / 3))} out={sec(C.machhli9 - 0.6, C.chhote10 - 0.2)} /></At>

      {/* line 10: the satellite's pass; the viewfinder finds nothing */}
      <At t0={C.satellite10 - 0.35} t1={C.upar10 + 0.2}><P22Satellite src={IMG('gp18_satellite')} target={[px, py]} dur={sec(C.satellite10 - 0.35, C.upar10 + 0.2)} w={380} /></At>
      <At t0={C.dekh10 - 0.2} t1={C.asal11 + 0.15}><P27Hud at={[px, py]} size={[Math.max(520, b.w * 1.5), Math.max(400, b.h * 1.6)]} miss={sec(C.dekh10 - 0.2, C.dekh10 + 0.3)} missText="कुछ नहीं" zoom={[1, 24]} /></At>

      {/* line 12: the currents, the vortex, the bottle that can't get out, the swell (in Patch) */}
      <At t0={C.samundar12 - 0.1} t1={C.jo13}><P19Currents c={[px, py]} rx={b.w * 0.95} ry={b.h * 1.1} burst={sec(C.samundar12 - 0.1, C.badhta12)} /></At>
      <At t0={C.bhanwar12 - 0.2} t1={C.patch12}><P28Vortex at={[px, py]} r={b.w * 0.75} squash={b.h / b.w} out={sec(C.bhanwar12 - 0.2, C.patch12 - 0.3)} /></At>
      <At t0={C.kachra12 - 0.15} t1={C.patch12 + 0.2}><P29PropPath src={IMG('gp03_plastic_bottle')} w={110} bounce keys={[[0, px + b.w * 0.35, py - b.h * 0.1, 0, 1], [26, px + b.w * 0.85, py - b.h * 0.3, 60, 1], [44, px + b.w * 0.4, py - b.h * 0.05, 140, 1], [50, px + b.w * 0.4, py - b.h * 0.05, 140, 0]]} /></At>
      <At t0={C.badhta12 - 0.05} t1={C.jo13}><P04GlowOutline d={ringsD(c, patchRing().map((r) => r.map(([x, y]) => [PATCH[0] + (x - PATCH[0]) * 1.2, PATCH[1] + (y - PATCH[1]) * 1.2])))} dur={18} /></At>

      {/* line 14: three punches, three words */}
      <At t0={C.mitti14} t1={C.kinara14}><Box x={540} y={470} w={900} h={260}><P02Accent text="ना मिट्टी" size={120} /></Box></At>
      <At t0={C.kinara14} t1={C.pakki14}><Box x={540} y={470} w={900} h={260}><P02Accent text="ना किनारा" size={120} /></Box></At>
      <At t0={C.pakki14} t1={C.isiliye14 + 0.1}><Box x={540} y={470} w={1000} h={260}><P02Accent text="ना पक्की ज़मीन" size={110} out={sec(C.pakki14, C.isiliye14 - 0.15)} exit="spread" /></Box></At>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the five gyres on the map card (line 5)
const GYRES: [number, number][] = [[-145, 32], [-115, -30], [-45, 30], [-15, -30], [80, -25]];
const CardFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => (
  // inside the card's Sequence: shift every window by the card's start
  <AbsoluteFill>
    {GYRES.map(([lo, la], i) => {
      const [x, y] = ll(c, lo, la);
      const t0 = i < 2 ? C.paanch5 - 0.15 + i * 0.25 : C.bhanwar5 - 0.2 + (i - 2) * 0.25;
      const big = i === 0 ? 1 + 0.5 * ramp(t, C.sabse5, C.sabse5 + 0.4, easeOut) : 1 - 0.3 * ramp(t, C.sabse5, C.sabse5 + 0.4);
      return (
        <At key={i} t0={t0 - CARD()[0]} t1={CARD()[1] - CARD()[0]}>
          <Box x={x} y={y} w={330} h={330}><div style={{ position: 'absolute', inset: 0, transform: `scale(${big})`, filter: i === 0 && t > C.sabse5 ? 'hue-rotate(-150deg) saturate(1.6) brightness(1.15)' : undefined }}><P10NumRing n={i + 1} size={110} /></div></Box>
          <P28Vortex at={[x, y]} r={44} squash={1} speed={2} />
        </At>
      );
    })}
    <At t0={C.sabse5 + 0.05 - CARD()[0]} t1={CARD()[1] - CARD()[0]}><Box x={ll(c, GYRES[0][0], GYRES[0][1])[0] + 170} y={ll(c, GYRES[0][0], GYRES[0][1])[1] - 140} w={560} h={160}><P02Accent text="सबसे बड़ा" size={64} /></Box></At>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ the plastic soup (line 11)
const Strike: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  const s = ramp(f, 14, 22, easeOut);
  return (
    <AbsoluteFill>
      <P02Accent text={text} size={120} />
      <svg width={900} height={300} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <line x1={170} y1={170} x2={170 + 560 * s} y2={130} stroke="#FF2E3F" strokeWidth={16} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #FF2E3F)' }} />
      </svg>
    </AbsoluteFill>
  );
};
const Soup: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = SOUP();
  const amount = Math.max(1 - ramp(t, a, a + 0.15, linear), ramp(t, b - 0.15, b, linear));
  return (
    <AbsoluteFill>
      <P18ZoomBlur amount={amount}>
        <Sequence from={F(a)} layout="none"><P17Letterbox srcs={[IMG('gp21_soup_underwater'), IMG('gp22_soup_surface')]} cuts={[F(C.paani11 - 0.25 - a)]} /></Sequence>
      </P18ZoomBlur>
      <At t0={C.zameen11 - 0.3} t1={C.paani11 - 0.2}><Box x={540} y={420} w={900} h={300}><Strike text="ज़मीन" /></Box></At>
      <At t0={C.soup11 - 0.35} t1={b}><Box x={540} y={1340} w={760} h={760}><P31SoupBowl bowl={IMG('gp23_soup_bowl')} ladle={IMG('gp23b_ladle')} w={600} /></Box></At>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Null (split screen, middle only)
/** Clip B: the pinch on "यही टुकड़े", the hops on "मछलियों के पेट से", the palm up on "हमारी थाली"; clip C: the flat
 *  hand on "जो ऊपर तैर रहा है", the tiny gap on "थोड़ा सा", pointing down on "बाकी". `from` = clip time at t0. */
export const NULL_WIN = () => [
  { name: 'B', t0: C.yahi9 - 0.15, t1: C.chhote10 - 0.25, from: 0.1 },
  { name: 'C', t0: C.jo13 + 0.05, t1: C.baaki13 + 0.3, from: 0.7 },
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
          <OffthreadVideo src={staticFile(`garbagepatch/null/null_gp_${name}1.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #04324a, #3FD8FF, #fff, #3FD8FF, #04324a)', boxShadow: '0 0 24px #3FD8FF' }} />
    </div>
  );
};

// ------------------------------------------------------------------ subtitles, grade, flashes
const STROKE = (w: number, col = '#000') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const HOT = /^[0-9½]|^[A-Za-z]/;
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
        <span key={q} style={{ color: q === cur ? '#3FD8FF' : HOT.test(w) ? '#FFD84D' : '#fff', display: 'inline-block', marginRight: '0.3em', transform: `scale(${q === cur ? 1.08 : 1})` }}>{w}</span>
      ))}
    </div>
  );
};
/** The reference's bright, clean look: a little contrast, a soft drifting light on the loop clock, a light vignette.
 *  No grain. */
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 34 * Math.sin(t * LOOPF(3) + 0.6), ly = 36 + 20 * Math.sin(t * LOOPF(2));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,240,210,0.09), rgba(0,0,0,0) 45%)`, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,10,20,0.4) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.3), rgba(0,0,0,0) 16%, rgba(0,0,0,0) 78%, rgba(0,8,16,0.42))' }} />
    </AbsoluteFill>
  );
};
const Flashes: React.FC<{ t: number }> = ({ t }) => {
  let a = 0;
  for (const p of [C.kachre2, C.duniya5, C.yahan6, C.tod8 + 0.5, C.mitti14]) a = Math.max(a, 0.42 * ramp(t, p - 0.04, p, linear) * (1 - ramp(t, p, p + 0.28, easeOut)));
  return a > 0.01 ? <AbsoluteFill style={{ background: '#fff', opacity: a, pointerEvents: 'none' }} /> : null;
};

// ------------------------------------------------------------------ the map shot (map + patch + overlays), reused by the transitions
const MapShot: React.FC<{ t: number; c: Cam; blur: number }> = ({ t, c, blur }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ filter: (blur > 0.6 ? 'url(#gpblur) ' : '') + 'contrast(1.05) saturate(1.06)' }}><MapView c={c} /></AbsoluteFill>
    <Patch t={t} c={c} />
    <MapFx t={t} c={c} />
  </AbsoluteFill>
);

/** NullDynasty: the Great Pacific Garbage Patch, an island half the size of India that no map shows. 1080×1920 at
 *  60 fps, rendered at --scale=2 for 4K. The bright satellite map; the last frame runs straight into frame 0 (a loop). */
export const GarbagePatch: React.FC<{ captions?: boolean; audio?: string }> = ({ captions = true, audio = AUDIO }) => {
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
  const card = inWin(t, CARD()), soup = inWin(t, SOUP()), section = inWin(t, SECTION());
  // the zoom blur into the soup (from the map) and back out of it
  const [sa, sb] = SOUP();
  const mapBlur = Math.max(ramp(t, sa - 0.3, sa, linear) * (t < sa ? 1 : 0), (1 - ramp(t, sb, sb + 0.15, linear)) * (t >= sb ? 1 : 0));
  const [ca, cb] = CARD();
  const [xa] = SECTION();
  return (
    <AbsoluteFill style={{ background: '#0d3a5c', overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="gpblur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" /></filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px)` }}>
        {card ? (
          <Sequence from={F(ca)} layout="none">
            <P09MapCard tilt={20} out={F(cb - ca - 0.4)} band={[960 - 377, 960 + 377]}>
              <MapView c={cam} />
              <CardFx t={t} c={cam} />
            </P09MapCard>
          </Sequence>
        ) : soup ? (
          <Soup t={t} />
        ) : section ? (
          <Sequence from={F(xa)} layout="none">
            <P20Smear at={0} dur={15} next={<Sequence from={8} layout="none"><P21CrossSection bg={IMG('gp24_ocean_cutaway')} beach={IMG('gp25_shore_slope')}
              props={[IMG('gp03_plastic_bottle'), IMG('gp04_plastic_crate'), IMG('gp06_plastic_bag'), IMG('gp05_ghost_net')]} down={F(C.baaki13 - xa - 0.13)} shore={F(C.kinaron13 - xa - 0.2)} /></Sequence>}>
              <MapShot t={t} c={cam} blur={0} />
            </P20Smear>
            <At t0={C.thoda13 - 0.35 - xa} t1={C.baaki13 + 0.25 - xa}><P35Bracket top={700} bottom={1010} x={1000} label="थोड़ा सा" out={F(C.baaki13 - C.thoda13 + 0.35)} /></At>
          </Sequence>
        ) : (
          <P18ZoomBlur amount={mapBlur}><MapShot t={t} c={cam} blur={Math.max(bx, by)} /></P18ZoomBlur>
        )}
        <Grade t={t} />
      </AbsoluteFill>
      <Flashes t={t} />
      {sp && <NullPanel t={t} q={sp.q} name={sp.w.name} t0={sp.w.t0} t1={sp.w.t1} from={sp.w.from} />}
      <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, left: 22, fontFamily: "'Montserrat', sans-serif", fontSize: 14, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles (SRTM/NASA, ETOPO1/NOAA) · borders and rivers: Natural Earth · AI-generated images
      </div>
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1640} />}
      {captions && <Watermark t={10 + (t * 120) / DURATION_S} />}
      {captions && audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
export type { P };
