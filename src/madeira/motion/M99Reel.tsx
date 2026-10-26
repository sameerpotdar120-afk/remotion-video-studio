import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { M01Neon } from './M01Neon';
import { M02Forest, scatter, southCoast } from './M02Forest';
import { M03Fuse } from './M03Fuse';
import { M04Fire } from './M04Fire';
import { M05TitleDrop } from './M05TitleDrop';
import { M07Sprout } from './M07Sprout';
import { M08CardFlip } from './M08CardFlip';
import { M09ZoomThrough } from './M09ZoomThrough';
import { M10NeonLabel } from './M10NeonLabel';
import { M12Player } from './M12Player';
import { M13Embers } from './M13Embers';
import { M14Trade } from './M14Trade';
import { M15Levadas } from './M15Levadas';
import { M16Boats } from './M16Boats';
import { M17PinLabel } from './M17PinLabel';
import { NUM, useFonts } from './font';
import { Cam, MapView, island, merc, ringsD, toS } from './MapView';
import { inOut, lerp, ramp } from './theme';

// m99_reel: every piece in a row on the real Midnight map (the Atlantic, the archipelago and Madeira plates), with the
// camera moving, as they will sit in the edit. Image slots take the creator's images (md01–md16) via `img`; until they
// arrive this is a test harness only. Opaque, 1080×1920, 60 fps.
type Imgs = Partial<Record<'tree' | 'tree2' | 'burnt' | 'flame' | 'flame2' | 'title' | 'cane' | 'loaf' | 'boat' | 'card' | 'card2' | 'bottle' | 'player' | 'celebrate', string>>;
const MAD = merc(-16.96, 32.75), ARCH = merc(-16.75, 32.75);
const cam = (f: number, a: Cam, b: Cam, dur: number): Cam => {
  const t = ramp(f, 0, dur, inOut);
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), mpp: Math.exp(lerp(Math.log(a.mpp), Math.log(b.mpp), t)) };
};
const C_MAD: Cam = { x: MAD[0], y: MAD[1], mpp: 72 };
const box = (w: number, h: number, node: React.ReactNode, top = 960, left = 540) => <div style={{ position: 'absolute', left: left - w / 2, top: top - h / 2, width: w, height: h }}>{node}</div>;
const at = (from: number, node: React.ReactNode) => <Sequence from={from} layout="none">{node}</Sequence>;
const poly = (c: Cam) => island('Madeira')[0].map((p) => toS(c, p));

const Dive: React.FC = () => {
  const f = useCurrentFrame();
  const c = cam(f, { x: merc(-10, 38)[0], y: merc(-10, 38)[1], mpp: 4200 }, { x: ARCH[0], y: ARCH[1], mpp: 150 }, 70);
  return <><MapView c={c} />{at(70, <><M01Neon d={ringsD(c, island('Madeira'))} /><M01Neon d={ringsD(c, island('PortoSanto'))} /><M01Neon d={ringsD(c, island('Desertas'))} width={3} /></>)}</>;
};
const Fire: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = cam(f, { ...C_MAD, mpp: 80 }, C_MAD, 300);
  const pts = scatter(poly(c), 44);
  const d = southCoast(poly(c));
  const coast = [poly(c).reduce((a, p) => (p[0] < a[0] ? p : a))];
  const trees = [img.tree, img.tree2].filter(Boolean) as string[];
  return (
    <>
      <MapView c={c} />
      {trees.length > 0 && <M02Forest pts={pts} trees={trees} burnt={img.burnt} size={64} burn={150} burnFrom={coast[0]} burnSpeed={5} />}
      {at(90, <M03Fuse d={d} dur={110} flame={img.flame} />)}
      {at(150, <M04Fire pts={pts.filter((_, i) => i % 3 === 0)} flames={[img.flame, img.flame2].filter(Boolean) as string[]} from={coast[0]} speed={5} size={70} />)}
      {at(20, box(900, 400, img.title ? <M05TitleDrop src={img.title} ratio={0.36} w={820} /> : <M10NeonLabel text="MADEIRA" size={150} />, 420))}
      {at(60, box(900, 240, <M10NeonLabel text="लकड़ी" size={96} />, 640))}
      <M13Embers amount={0.6} />
    </>
  );
};
const Boats: React.FC<{ img: Imgs }> = ({ img }) => {
  const c = { ...C_MAD, y: C_MAD.y + 12000 };
  return <><MapView c={c} />{img.boat && <M16Boats src={img.boat} pts={[[300, 1350], [560, 1420], [800, 1330]]} />}{box(900, 300, <M10NeonLabel count={[0, 7, 50]} suffix=" साल" size={170} />, 560)}<M13Embers /></>;
};
const Sugar: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = cam(f, C_MAD, { x: merc(-9, 40)[0], y: merc(-9, 40)[1], mpp: 1800 }, 60);
  const cane = scatter(poly(C_MAD), 70, 'c');
  const ports = [[-9.14, 38.72], [-8.6, 41.15], [3.0, 51.2], [4.4, 51.9], [-6.0, 36.5], [12.3, 45.4]].map(([lo, la]) => toS(c, merc(lo, la)));
  return (
    <>
      <MapView c={c} />
      {f < 70 && img.cane && <M07Sprout pts={cane} src={img.cane} size={84} sink={50} />}
      {at(70, <M14Trade from={toS(c, MAD)} to={ports} icon={img.loaf} />)}
      {at(110, box(900, 240, <M10NeonLabel text="सफ़ेद सोना" size={110} />, 520))}
    </>
  );
};
const Levadas: React.FC<{ img: Imgs }> = ({ img }) => {
  const c = C_MAD;
  const p = poly(c), cx = p.reduce((a, q) => a + q[0], 0) / p.length, cy = p.reduce((a, q) => a + q[1], 0) / p.length;
  const paths = [0.82, 0.62, 0.42].flatMap((k, j) => {
    const r = p.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k * 0.9]);
    const n = r.length, a = Math.floor(n * (0.05 + j * 0.2)), b = Math.floor(n * (0.45 + j * 0.15));
    return ['M ' + r.slice(a, b).map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join(' L ')];
  });
  return (
    <>
      <MapView c={c} />
      <M15Levadas paths={paths} />
      {img.card && at(60, box(720, 520, <M08CardFlip src={img.card} ratio={0.5625} w={600} tilt={-6} />, 520))}
      {img.card2 && at(90, box(720, 520, <M08CardFlip src={img.card2} ratio={0.5625} w={600} tilt={5} fly={[100, 0, 500]} seed={3} />, 600, 580))}
      {at(30, box(900, 260, <M10NeonLabel count={[0, 2000, 60]} suffix=" km" size={150} />, 1450))}
    </>
  );
};
const Wine: React.FC<{ img: Imgs }> = ({ img }) => {
  const c = C_MAD;
  return <><MapView c={c} /><M01Neon d={ringsD(c, island('Madeira'))} mode="draw" dur={60} />{img.bottle && at(70, box(600, 1000, <M09ZoomThrough src={img.bottle} ratio={2.4} h={800} through={90} />, 900))}</>;
};
const Ronaldo: React.FC<{ img: Imgs }> = ({ img }) => {
  const c = C_MAD, fx = toS(c, merc(-16.91, 32.65));
  return (
    <>
      <MapView c={c} />
      <M01Neon d={ringsD(c, island('Madeira'))} mode="draw" dur={40} />
      {box(900, 520, <M17PinLabel text="Funchal" />, fx[1] - 250, fx[0])}
      {at(60, box(900, 520, <M17PinLabel text="Cristiano Ronaldo" sub="International Airport" />, fx[1] - 200, fx[0] + 120))}
      {img.player && at(20, <div style={{ position: 'absolute', left: 340, top: 520, width: 400, height: 700 }}><M12Player src={img.player} ratio={1.33} h={620} /></div>)}
      <M13Embers amount={0.4} />
    </>
  );
};
type Item = [string, number, React.FC<{ img: Imgs }>];
export const REEL: Item[] = [
  ['m01 dive + neon strobe', 180, Dive as React.FC<{ img: Imgs }>],
  ['m02 forest + m03 fuse + m04 fire + m05 title + m10 label', 330, Fire],
  ['m16 boats + m10 count', 140, Boats],
  ['m07 cane + m14 trade + m10', 220, Sugar],
  ['m15 levadas + m08 cards + m10 count', 240, Levadas],
  ['m01 draw + m09 zoom-through', 200, Wine],
  ['m17 pins + m12 player + m13 embers', 200, Ronaldo],
];
export const REEL_FRAMES = REEL.reduce((a, [, d]) => a + d, 0);
export const M99Reel: React.FC<{ img?: Imgs }> = ({ img = {} }) => {
  useFonts();
  let t = 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {REEL.map(([name, d, Node], i) => {
        const from = t;
        t += d;
        return (
          <Sequence key={i} from={from} durationInFrames={d}>
            <AbsoluteFill><Node img={img} /></AbsoluteFill>
            <div style={{ position: 'absolute', left: 30, bottom: 30, fontFamily: NUM, fontSize: 30, color: '#fff', opacity: 0.7 }}>{name}</div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
/** Test-only stand-ins from earlier videos' images, to check the motion mechanics before the creator's images arrive. */
export const TEST_IMGS: Imgs = {
  tree: staticFile('test/gl08_viking_helmet.png'), tree2: staticFile('test/gl08_viking_helmet.png'), burnt: staticFile('test/gl07_snowed_turf_hut.png'),
  title: staticFile('test/gl09_title_greenland_grass.png'), cane: staticFile('test/gl08_viking_helmet.png'), loaf: staticFile('test/gl08_viking_helmet.png'),
  boat: staticFile('test/gl03_longship.png'), card: staticFile('test/gl06_iceland_green_valley.jpg'), card2: staticFile('test/gl06b_iceland_hot_spring.jpg'),
  bottle: staticFile('test/gl02_erik_the_red.png'), player: staticFile('test/gl01_floki_viking.png'),
};
