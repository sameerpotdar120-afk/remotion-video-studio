import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { P01Mosaic } from './P01Mosaic';
import { P02Accent } from './P02Accent';
import { P03HandArrow } from './P03HandArrow';
import { P04GlowOutline } from './P04GlowOutline';
import { P05Leader } from './P05Leader';
import { P06RegionGlow } from './P06RegionGlow';
import { P07CountUp } from './P07CountUp';
import { P08ShapeLand } from './P08ShapeLand';
import { P09MapCard } from './P09MapCard';
import { P10NumRing } from './P10NumRing';
import { P11Callout } from './P11Callout';
import { P12DashPaths } from './P12DashPaths';
import { P13Boat } from './P13Boat';
import { P14SunDrops } from './P14SunDrops';
import { P15Patch } from './P15Patch';
import { P16FoodChain } from './P16FoodChain';
import { P17Letterbox } from './P17Letterbox';
import { P18ZoomBlur } from './P18ZoomBlur';
import { P19Currents } from './P19Currents';
import { P20Smear } from './P20Smear';
import { P21CrossSection } from './P21CrossSection';
import { P22Satellite } from './P22Satellite';
import { P23Plane } from './P23Plane';
import { P24PinDrop } from './P24PinDrop';
import { P25Shatter } from './P25Shatter';
import { P26Magnifier } from './P26Magnifier';
import { P27Hud } from './P27Hud';
import { P28Vortex } from './P28Vortex';
import { P29PropPath } from './P29PropPath';
import { P30Rivers } from './P30Rivers';
import { P31SoupBowl } from './P31SoupBowl';
import { P32Shock, shake } from './P32Shock';
import { P33CityPins } from './P33CityPins';
import { P34Waves } from './P34Waves';
import { P35Bracket } from './P35Bracket';
import { NUM, useFonts } from './font';
import { Cam, MapView, PATCH, indiaRing, merc, patchRing, riverD, ringsD, state, toS } from './MapView';
import { inOut, lerp, ramp } from './theme';

// p99_reel: every piece in script order on the real bright map (the world and north-east Pacific plates), with the
// camera moving, as they will sit in the edit. Image slots take the creator's images (gp01–gp17) via `img`; until
// they arrive this is a test harness only. Opaque, 1080×1920, 60 fps.
type Key = 'island' | 'texture' | 'bottle' | 'container' | 'net' | 'bag' | 'boat' | 'ship' | 'plane' | 'sun' | 'drop' | 'wave' | 'shard' | 'glass' | 'fish' | 'bigfish' | 'thali' | 'soup1' | 'soup2' | 'bowl' | 'ladle' | 'cutaway' | 'beach' | 'satellite' | 'pin' | 'city';
type Imgs = Partial<Record<Key, string>>;
const cam = (f: number, a: Cam, b: Cam, from: number, dur: number): Cam => {
  const t = ramp(f, from, from + dur, inOut);
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), mpp: Math.exp(lerp(Math.log(a.mpp), Math.log(b.mpp), t)) };
};
const CP: Cam = { x: PATCH[0] + 250e3, y: PATCH[1] - 150e3, mpp: 4200 };
const FAR: Cam = { x: merc(-118, 34)[0], y: merc(-118, 34)[1], mpp: 13000 };
const WIDE: Cam = { x: merc(-132, 38)[0], y: merc(-132, 38)[1], mpp: 8500 };
const breathe = (c: Cam, f: number): Cam => ({ ...c, x: c.x + Math.sin(f / 90) * c.mpp * 6, y: c.y + Math.cos(f / 110) * c.mpp * 4, mpp: c.mpp * (1 - 0.0004 * f) });
const A = 1062e3, B = 661e3; // the patch's Mercator half-axes (900 × 560 km real at 32°N)
/** A box for the patch: its children are laid out at the patch's size for this camera, centred on it. */
const AtPatch: React.FC<{ c: Cam; k?: number; children: React.ReactNode }> = ({ c, k = 1.12, children }) => {
  const [x, y] = toS(c, PATCH), w = (2 * A * k) / c.mpp, h = (2 * B * k) / c.mpp;
  return <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h }}>{children}</div>;
};
const box = (w: number, h: number, node: React.ReactNode, top = 960, left = 540) => <div style={{ position: 'absolute', left: left - w / 2, top: top - h / 2, width: w, height: h }}>{node}</div>;
const at = (from: number, node: React.ReactNode) => <Sequence from={from} layout="none">{node}</Sequence>;
const patchW = (c: Cam) => (2 * A * 1.12) / c.mpp;
const patchH = (c: Cam) => (2 * B * 1.12) / c.mpp;
const P: React.FC<{ c: Cam; img: Imgs; extra?: Partial<React.ComponentProps<typeof P15Patch>> }> = ({ c, img, extra }) => (
  img.island && img.texture ? <AtPatch c={c}><P15Patch island={img.island} texture={img.texture} w={patchW(c)} h={patchH(c)} {...extra} /></AtPatch> : null
);

const Hook: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = breathe(cam(f, { x: merc(-112, 20)[0], y: merc(-112, 20)[1], mpp: 11000 }, CP, 0, 220), f);
  const [px, py] = toS(c, PATCH);
  return (
    <>
      <MapView c={c} />
      {img.island && <AtPatch c={c}><P01Mosaic src={img.island} w={patchW(c)} h={patchH(c)} reveal={190} dur={30} cell={Math.max(8, Math.round(patchW(c) / 14))} /></AtPatch>}
      {at(70, box(1000, 200, <P02Accent text="किसी नक्शे पर नहीं" size={70} out={150} />, py - 330, px))}
      {at(95, <P03HandArrow from={[px - 40, py - 270]} to={[px + 10, py - 150]} bend={0.4} out={125} />)}
      {at(160, box(1080, 260, <P02Accent text="यहाँ कोई नहीं रहता" mode="fly" size={84} out={50} exit="spread" />, py + 230, 540))}
      {at(222, box(800, 220, <P02Accent text="कचरा" size={120} />, py - 300, px))}
      {at(232, <><P03HandArrow from={[px - 230, py - 330]} to={[px - 150, py - 200]} bend={-0.5} /><P03HandArrow from={[px + 230, py - 330]} to={[px + 150, py - 200]} bend={0.5} /></>)}
    </>
  );
};
const Name: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = breathe(cam(f, CP, WIDE, 120, 50), f);
  const [px, py] = toS(c, PATCH);
  const cal = state('California'), haw = state('Hawaii');
  const cc = toS(c, merc(-119.5, 37)), hc = toS(c, merc(-157, 20.6));
  return (
    <>
      <MapView c={c} />
      <P c={c} img={img} />
      <P04GlowOutline d={ringsD(c, patchRing())} dur={40} out={150} />
      {at(30, <P05Leader at={[px, py]} len={240} text="Great Pacific Garbage Patch" out={110} />)}
      {at(150, <><P06RegionGlow d={ringsD(c, cal)} c={cc} /><P06RegionGlow d={ringsD(c, haw)} c={hc} bloom={18} /></>)}
    </>
  );
};
const Size: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = breathe(WIDE, f + 300);
  const ic = merc(-122, 16);
  const [ix, iy] = toS(c, ic);
  return (
    <>
      <MapView c={c} />
      <P c={c} img={img} />
      {box(1000, 360, <P07CountUp to={16} unit=" लाख km²" sub="भारत का लगभग आधा" />, 380)}
      {at(70, <P08ShapeLand d={ringsD(c, indiaRing(ic))} c={[ix, iy]} name="भारत" />)}
      {at(130, <P04GlowOutline d={ringsD(c, patchRing())} dur={30} fill />)}
    </>
  );
};
const RINGS: [number, number][] = [[-145, 32], [-115, -30], [-45, 30], [-15, -30], [80, -25]];
const Gyres: React.FC = () => {
  const f = useCurrentFrame();
  const c: Cam = { x: merc(-25, 0)[0], y: 2.755e6, mpp: 30800 * (1 - 0.0002 * f) };
  return (
    <P09MapCard tilt={24} out={190} band={[960 - 377, 960 + 377]}>
      <MapView c={c} />
      {RINGS.map(([lo, la], i) => { const [x, y] = toS(c, merc(lo, la)); return at(30 + i * 12, box(300, 300, <P10NumRing n={i + 1} size={110} />, y, x)); })}
    </P09MapCard>
  );
};
const Sources: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = breathe(cam(f, CP, { ...CP, mpp: 5200, x: CP.x + 300e3 }, 120, 40), f);
  const [px, py] = toS(c, PATCH);
  const coast = [[-124, 46], [-122.5, 37.8], [-118.3, 33.8], [-125, 50]].map(([lo, la]) => toS(c, merc(lo, la)));
  const ds = coast.map(([x, y], i) => `M${x},${y} C${x - 120},${y + (i % 2 ? 140 : -140)} ${px + 220},${py + (i % 2 ? -160 : 160)} ${px + 40},${py}`);
  return (
    <>
      <MapView c={c} />
      <P c={c} img={img} />
      {img.bottle && <P11Callout at={[px - 40, py - 30]} to={[px - 170, py - 260]} src={img.bottle} out={110} seed={1} />}
      {img.container && at(10, <P11Callout at={[px + 60, py - 10]} to={[px + 230, py - 180]} src={img.container} out={100} seed={2} />)}
      {img.net && at(20, <P11Callout at={[px - 10, py + 50]} to={[px - 150, py + 230]} src={img.net} out={90} seed={3} />)}
      {at(130, <P12DashPaths ds={ds} />)}
      {img.boat && at(140, <><P13Boat src={img.boat} from={[px - 380, py - 300]} to={[px - 120, py - 160]} dur={200} /><P13Boat src={img.boat} from={[px + 420, py + 360]} to={[px + 160, py + 150]} dur={200} seed={4} /></>)}
    </>
  );
};
const Sun: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = breathe(CP, f);
  const [px, py] = toS(c, PATCH);
  const tg: [number, number][] = [[-90, -40], [40, -70], [110, 10], [-20, 40], [-130, 20], [70, 60]].map(([dx, dy]) => [px + dx, py + dy]);
  return (
    <>
      <MapView c={c} />
      <P c={c} img={img} extra={{ dissolveAt: 100, dissolveDur: 60 }} />
      {img.sun && img.drop && <P14SunDrops sun={img.sun} drop={img.drop} targets={tg} out={150} />}
      {at(140, box(1000, 300, <P02Accent text="माइक्रोप्लास्टिक" size={90} arc={0.25} />, py - 320, px))}
    </>
  );
};
const Chain: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = breathe(cam(f, CP, WIDE, 0, 40), f);
  const srcs = [img.texture, img.fish, img.bigfish, img.thali].filter(Boolean) as string[];
  return <><MapView c={c} /><P c={c} img={img} extra={{ dissolveAt: -100 }} />{at(30, <P16FoodChain srcs={srcs} at={[540, 1020]} />)}</>;
};
const Sat: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = breathe(cam(f, WIDE, { ...FAR, mpp: 11000 }, 0, 60), f);
  return (
    <>
      <MapView c={c} />
      <P c={c} img={img} extra={{ dissolveAt: -100, fadeAt: 30, fadeTo: 0.2 }} />
      {img.satellite && at(20, <P22Satellite src={img.satellite} target={toS(c, PATCH)} dur={200} />)}
    </>
  );
};
const Soup: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = cam(f, { ...CP, mpp: 5000 }, { ...CP, x: PATCH[0], y: PATCH[1], mpp: 900 }, 0, 24);
  const into = ramp(f, 16, 24), outOf = 1 - ramp(f, 24, 32), back = ramp(f, 196, 204);
  if (f < 24) return <P18ZoomBlur amount={into}><MapView c={c} /><P c={c} img={img} extra={{ dissolveAt: -100 }} /></P18ZoomBlur>;
  return img.soup1 && img.soup2 ? <P18ZoomBlur amount={Math.max(outOf, back)}><P17Letterbox srcs={[img.soup1, img.soup2]} cuts={[110]} /></P18ZoomBlur> : null;
};
const Gyre: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = breathe({ ...CP, mpp: 5400 }, f);
  const [px, py] = toS(c, PATCH);
  return <><MapView c={c} /><P c={c} img={img} extra={{ dissolveAt: -100, swellAt: 150 }} /><P19Currents c={[px, py]} rx={330} ry={250} burst={150} /></>;
};
const Section: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = breathe({ ...CP, mpp: 5400 }, f + 200);
  const props = [img.bottle, img.container, img.bag].filter(Boolean) as string[];
  const next = img.cutaway ? <Sequence from={30} layout="none"><P21CrossSection bg={img.cutaway} beach={img.beach} props={props} down={60} shore={170} /></Sequence> : null;
  return <P20Smear at={20} dur={14} next={next}><MapView c={c} /><P c={c} img={img} extra={{ dissolveAt: -100 }} /></P20Smear>;
};
const Pin: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const [sx, sy] = shake(f, 90);
  const c = breathe({ ...CP, x: CP.x + sx * CP.mpp, y: CP.y + sy * CP.mpp }, f);
  const [px, py] = toS(c, PATCH);
  return (
    <>
      <MapView c={c} />
      <P c={c} img={img} />
      <P32Shock at={[px, py]} repeat={60} />
      {img.plane && <P23Plane src={img.plane} from={[200, 0]} to={[900, 700]} dur={280} />}
      {img.pin && at(30, <P24PinDrop src={img.pin} at={[px, py - 20]} stamp={90} />)}
      {img.pin && at(160, <P24PinDrop src={img.pin} at={[860, 1180]} ask={false} label="California" />)}
    </>
  );
};
const Rivers: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = breathe({ x: merc(-128, 44)[0], y: merc(-128, 44)[1], mpp: 4200 }, f);
  const ds = ['Stikine', 'Skeena', 'Fraser', 'Columbia', 'Rogue', 'Klamath', 'Eel', 'Sacramento', 'San Joaquin'].map((n) => riverD(c, n));
  const cities: [number, number, string][] = [[-123.1, 49.3, 'Vancouver'], [-122.3, 47.6, 'Seattle'], [-122.4, 37.8, 'San Francisco'], [-118.25, 34.05, 'Los Angeles']].map(([lo, la, n]) => { const [x, y] = toS(c, merc(lo as number, la as number)); return [x, y, n as string]; });
  return (
    <>
      <MapView c={c} />
      <P30Rivers ds={ds} />
      {img.city && at(60, <P33CityPins src={img.city} cities={cities} />)}
      {img.ship && at(30, <P13Boat src={img.ship} from={[-100, 1500]} to={[400, 1300]} dur={200} w={260} ratio={0.5} />)}
      {at(120, <P28Vortex at={[540, 1500]} r={200} />)}
    </>
  );
};
const Break: React.FC<{ img: Imgs }> = ({ img }) => {
  const f = useCurrentFrame();
  const c = breathe(CP, f);
  const [px, py] = toS(c, PATCH);
  return (
    <>
      <MapView c={c} />
      <P c={c} img={img} />
      {img.wave && <P34Waves src={img.wave} at={[px, py]} rx={patchW(c) * 0.55} ry={patchH(c) * 0.6} />}
      {img.bottle && img.shard && at(70, <P25Shatter whole={img.bottle} pieces={Array(7).fill(img.shard)} />)}
      {img.glass && img.texture && at(150, <P26Magnifier glass={img.glass} texture={img.texture} to={[px, py]} />)}
      {img.bottle && <P29PropPath src={img.bottle} keys={[[0, px, py, 0, 0], [12, px + 180, py - 160, 120, 1], [30, px + 60, py - 20, 260, 0.6], [34, px + 60, py - 20, 260, 0]]} />}
    </>
  );
};
const Scan: React.FC = () => {
  const f = useCurrentFrame();
  const c = breathe({ ...WIDE, mpp: 9000 }, f);
  return <><MapView c={c} /><P27Hud at={toS(c, PATCH)} miss={80} /></>;
};
const Bowl: React.FC<{ img: Imgs }> = ({ img }) => <AbsoluteFill style={{ background: '#0a1a2a' }}>{img.bowl && img.ladle && <P31SoupBowl bowl={img.bowl} ladle={img.ladle} />}<P35Bracket top={400} bottom={700} /></AbsoluteFill>;
type Item = [string, number, React.FC<{ img: Imgs }>];
export const REEL: Item[] = [
  ['p01 mosaic + p02 accents + p03 arrows', 300, Hook],
  ['p04 outline + p05 leader + p06 glow', 230, Name],
  ['p07 count + p08 India', 220, Size],
  ['p09 map card + p10 rings', 230, Gyres as React.FC<{ img: Imgs }>],
  ['p11 callouts + p12 paths + p13 boats', 330, Sources],
  ['p14 sun + p15 dissolve', 240, Sun],
  ['p16 food chain', 170, Chain],
  ['p22 satellite + p15 fade', 230, Sat],
  ['p18 zoom blur + p17 letterbox', 210, Soup],
  ['p19 currents + p15 swell', 230, Gyre],
  ['p20 smear + p21 cross-section', 320, Section],
  ['p23 plane + p24 pins + p32 shock', 260, Pin],
  ['p30 rivers + p33 cities + p13 ship + p28 vortex', 240, Rivers],
  ['p34 waves + p25 shatter + p26 magnifier + p29 path', 260, Break],
  ['p27 hud', 160, Scan as React.FC<{ img: Imgs }>],
  ['p31 soup bowl + p35 bracket', 160, Bowl],
];
export const REEL_FRAMES = REEL.reduce((a, [, d]) => a + d, 0);
export const P99Reel: React.FC<{ img?: Imgs }> = ({ img = {} }) => {
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
const T = (p: string) => staticFile(p);
export const TEST_IMGS: Imgs = {
  island: T('greenland/img/gl07_snowed_turf_hut.png'), texture: T('greenland/img/gl11_ice_sheet_texture.jpg'), bottle: T('madeira/img/md11_wine_bottle.png'),
  container: T('madeira/img/md07_sugar_loaf.png'), net: T('greenland/img/gl08_viking_helmet.png'), bag: T('madeira/img/md06_sugar_cane.png'), boat: T('madeira/img/md08_settlers_boat.png'),
  sun: T('madeira/img/md04_flame_a.jpg'), drop: T('madeira/img/md04b_flame_b.jpg'), fish: T('greenland/img/gl04_raven_wings_up.png'), bigfish: T('greenland/img/gl04b_raven_wings_down.png'),
  thali: T('madeira/img/md07_sugar_loaf.png'), soup1: T('madeira/img/md09_levada_forest.jpg'), soup2: T('madeira/img/md10_vineyard_terraces.jpg'),
  ship: T('madeira/img/md01_caravel.png'), plane: T('greenland/img/gl04_raven_wings_up.png'), wave: T('greenland/img/gl09b_title_greenland_ice.png'), shard: T('madeira/img/md11_wine_bottle.png'),
  glass: T('greenland/img/gl12_spyglass_eyepiece.png'), bowl: T('madeira/img/md07_sugar_loaf.png'), ladle: T('madeira/img/md11_wine_bottle.png'), pin: T('madeira/img/md11_wine_bottle.png'), city: T('madeira/img/md12_madeira_paradise.jpg'),
  cutaway: T('greenland/img/gl05_fjord_drift_ice_bg.jpg'), beach: T('greenland/img/gl09_title_greenland_grass.png'), satellite: T('greenland/img/gl12_spyglass_eyepiece.png'),
};
