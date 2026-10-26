import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { useMontserrat } from '../../darien/Brand';
import { clamp01, easeOut, inOut, lerp, linear, pop, ramp } from '../../darien/anim';
import SIZES from '../../../public/greenland/img_sizes.json';
import { useFonts, UI } from '../motion/font';
import { G01Highlighter } from '../motion/G01Highlighter';
import { G03IceSpread } from '../motion/G03IceSpread';
import { G04LabelSwap } from '../motion/G04LabelSwap';
import { G05PaperReveal } from '../motion/G05PaperReveal';
import { G06RomanIX } from '../motion/G06RomanIX';
import { G07Route } from '../motion/G07Route';
import { G08Snow } from '../motion/G08Snow';
import { G09Spyglass } from '../motion/G09Spyglass';
import { G10Pops } from '../motion/G10Pops';
import { G11HandLabel } from '../motion/G11HandLabel';
import { G12Stamp } from '../motion/G12Stamp';
import { G13Alert } from '../motion/G13Alert';
import { G14Fleet } from '../motion/G14Fleet';
import { G16Title } from '../motion/G16Title';
import { G17Card } from '../motion/G17Card';
import { G18Character } from '../motion/G18Character';
import { G19Ravens } from '../motion/G19Ravens';
import { C, CAPS, Cam, DURATION_S, GEO, GL, IS, LOOPF, P, camAt, camMotion, ll, merc, ringsD, shake, toS } from './cam';
import { MapLayers } from './Map';

export const GL_DURATION_60 = Math.round(DURATION_S * 60);
const FPS = 60;
const F = (s: number) => Math.round(s * FPS);
const AUDIO = 'greenland/audio/mix.wav';

const SZ = SIZES as Record<string, { w: number; h: number; ext?: string }>;
const IMG = (k: string) => staticFile(`greenland/img/${k}.${SZ[k]?.ext ?? 'png'}`);
const RATIO = (k: string) => SZ[k].h / SZ[k].w;

/** The images drawn inside SVG (the ice texture, the green plate) are decoded before any frame renders, so an SVG
 *  <image> never paints empty on a fresh tab (every render chunk opens its own). */
const SVG_IMAGES = [IMG('gl11_ice_sheet_texture'), staticFile('greenland/maps/atlantic_green.jpg')];
let preloaded: Promise<unknown> | null = null;
const usePreload = () => {
  const [h] = React.useState(() => delayRender('gl svg images'));
  React.useEffect(() => {
    if (!preloaded) preloaded = Promise.all(SVG_IMAGES.map((src) => { const i = new Image(); i.src = src; return i.decode().catch(() => undefined); }));
    preloaded.then(() => continueRender(h));
  }, [h]);
};

/** A layer that lives from t0 to t1 (seconds) with its own frame clock starting at 0. */
const At: React.FC<{ t0: number; t1: number; children: React.ReactNode }> = ({ t0, t1, children }) => (
  <Sequence from={F(t0)} durationInFrames={Math.max(1, F(t1) - F(t0))} layout="none">{children}</Sequence>
);
/** A w×h box centred on (x, y). */
const Box: React.FC<{ x: number; y: number; w: number; h: number; children: React.ReactNode }> = ({ x, y, w, h, children }) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h }}>{children}</div>
);

// ------------------------------------------------------------------ Null (split screen, middle only)
/** Clip B: the open hand pointing out, then three fingers on "3 साल"; clip C: the shrug on "रहने आएगा कौन?", then the
 *  idea finger on "तो Erik ने नाम रखा". `from` = the clip time at t0. */
export const NULL_WIN = () => [
  { name: 'B', t0: C.sau6 - 0.1, t1: C.nikal6 + 0.75, from: 0.3 },
  { name: 'C', t0: C.socho8 - 0.25, t1: C.green8 - 0.15, from: 0.6 },
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
          <OffthreadVideo src={staticFile(`greenland/null/null_gl_${name}1.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #0b3b55, #6CD6FF, #fff, #6CD6FF, #0b3b55)', boxShadow: '0 0 24px #6CD6FF' }} />
    </div>
  );
};

// ------------------------------------------------------------------ the map's overlays
const GLR = GEO.countries.Greenland, ISR = GEO.countries.Iceland, NOR = GEO.countries.Norway;
const above = (p: P, dy: number): P => [p[0], p[1] + dy];
/** A flat fill on a country (green for the "green land", red for Norway, a warm tone for Iceland on paper), revealed
 *  from a point with a soft edge, a darker rim and a soft glow; it breathes a little. */
const Fill: React.FC<{ t: number; c: Cam; rings: P[][]; t0: number; t1: number; color: string; from: P; reach?: number; alpha?: number; id: string; dur?: number; blend?: 'multiply'; plate?: string }> = ({ t, c, rings, t0, t1, color, from, reach = 1200, alpha = 0.55, id, dur = 0.5, blend, plate }) => {
  const p = ramp(t, t0, t0 + dur, inOut), o = 1 - ramp(t, t1 - 0.25, t1, linear);
  if (p <= 0 || o <= 0) return null;
  const d = ringsD(c, rings), [fx, fy] = toS(c, from);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', mixBlendMode: blend }}>
      <defs>
        <radialGradient id={`${id}g`} gradientUnits="userSpaceOnUse" cx={fx} cy={fy} r={Math.max(1, reach * p)}>
          <stop offset="0.85" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-600} y={-600} width={2300} height={3100}><rect x={-600} y={-600} width={2300} height={3100} fill={`url(#${id}g)`} /></mask>
      </defs>
      {plate && <clipPath id={`${id}c`}><path d={d} /></clipPath>}
      <g mask={`url(#${id}m)`} opacity={o}>
        {plate && (() => {
          const [b0, b1, b2, b3] = GEO.plates.atlantic.bounds;
          return <image href={staticFile(plate)} clipPath={`url(#${id}c)`} preserveAspectRatio="none" x={540 + (b0 - c.x) / c.mpp} y={960 - (b3 - c.y) / c.mpp} width={(b2 - b0) / c.mpp} height={(b3 - b1) / c.mpp} />;
        })()}
        {!plate && <path d={d} fill={color} fillOpacity={alpha * (1 + 0.06 * Math.sin(t * 2.3))} style={blend ? undefined : { filter: `drop-shadow(0 0 14px ${color})` }} />}
        <path d={d} fill="none" stroke={color} strokeWidth={3} style={{ filter: 'brightness(0.6)' }} />
      </g>
    </svg>
  );
};

/** Frame 0 and the loop's last frame: GREENLAND carved in ice over Greenland, ICELAND in grass, a "नाम उल्टे क्यों?"
 *  sticker. Its float runs on the loop clock, so the last frame matches frame 0. */
const TitleCard: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  if (a <= 0) return null;
  const fx = Math.sin(t * LOOPF(9)) * 6, fy = Math.sin(t * LOOPF(7) + 1) * 8;
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, a * 1.5), transform: `scale(${0.85 + 0.15 * a})` }}>
      <Box x={540 + fx} y={470 + fy} w={980} h={980 * RATIO('gl09b_title_greenland_ice')}>
        <G16Title src={IMG('gl09b_title_greenland_ice')} ratio={RATIO('gl09b_title_greenland_ice')} w={940} kind="ice" fo={600} seed={2} sweep={false} still />
      </Box>
      <div style={{ position: 'absolute', left: 540, top: 760, transform: `translate(-50%,-50%) translate(${-fx}px, ${fy * 0.5}px) rotate(${-3 + Math.sin(t * LOOPF(5)) * 1.2}deg)`, padding: '8px 40px 0', borderRadius: 24,
        background: '#FFE234', border: '6px solid #111', boxShadow: '0 12px 20px rgba(0,0,0,0.4)', fontFamily: UI, fontWeight: 800, fontSize: 84, lineHeight: 1.3, color: '#111', whiteSpace: 'nowrap' }}>नाम उल्टे क्यों?</div>
      <Box x={600 - fx} y={1040 - fy} w={760} h={760 * RATIO('gl10b_title_iceland_grass')}>
        <G16Title src={IMG('gl10b_title_iceland_grass')} ratio={RATIO('gl10b_title_iceland_grass')} w={720} kind="grass" fo={600} seed={3} sweep={false} still />
      </Box>
    </AbsoluteFill>
  );
};

/** The highlighter types the name, squeezes flat and the 3D title springs open in its place. */
const NameIn: React.FC<{ text: string; title: string; kind: 'ice' | 'grass'; at: number; w: number; out?: number; seed?: number }> = ({ text, title, kind, at, w, out, seed = 1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {f < at + 5 && <Box x={540} y={180} w={900} h={260}><G01Highlighter text={text} out={at} seed={seed} /></Box>}
      <Sequence from={at + 4} layout="none">
        <Box x={540} y={180} w={w} h={w * RATIO(title)}><G16Title src={IMG(title)} ratio={RATIO(title)} w={w} kind={kind} seed={seed} out={out !== undefined ? out - at - 4 : undefined} /></Box>
      </Sequence>
    </AbsoluteFill>
  );
};

const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const g = toS(c, GL), i = toS(c, IS);
  const glFrom = toS(c, above(GL, -500000));
  const isTitle: P = [i[0], i[1] - 300];
  return (
    <AbsoluteFill>
      {/* line 1: the ice spreads over Greenland, 80%; the highlighter names it and the grass title lands */}
      <At t0={C.n80_1 - 0.15} t1={C.hari2 + 0.1}>
        <G03IceSpread d={ringsD(c, GLR)} from={glFrom} tex={IMG('gl11_ice_sheet_texture')} reach={1250} dur={110} badge={[830, 1330]} out={F(C.hari2 - 0.3 - (C.n80_1 - 0.15))} />
      </At>
      <At t0={C.naam1 - 0.1} t1={C.hari2 + 0.05}>
        <AbsoluteFill style={{ transform: `translate(0px, ${g[1] - 180 - 200}px)` }}>
          <NameIn text="Greenland" title="gl09_title_greenland_grass" kind="grass" at={F(C.green1 + 0.35 - C.naam1 + 0.1)} w={820} out={F(C.hari2 - 0.15 - C.naam1 + 0.1)} />
        </AbsoluteFill>
      </At>

      {/* line 2: Iceland, green and full of hot springs: three photo cards; then its name, in ice */}
      <At t0={C.hari2} t1={C.naam2}><Box x={330} y={560} w={600} h={420}><G17Card src={IMG('gl06_iceland_green_valley')} ratio={RATIO('gl06_iceland_green_valley')} w={520} rot={-7} from={[-700, -200]} out={F(C.naam2 - 0.45 - C.hari2)} seed={1} /></Box></At>
      <At t0={C.garam2 + 0.05} t1={C.naam2}><Box x={760} y={720} w={600} h={420}><G17Card src={IMG('gl06b_iceland_hot_spring')} ratio={RATIO('gl06b_iceland_hot_spring')} w={520} rot={5} from={[700, -100]} out={F(C.naam2 - 0.4 - C.garam2 - 0.05)} seed={2} /></Box></At>
      <At t0={C.jharno2 + 0.15} t1={C.naam2}><Box x={420} y={1380} w={600} h={420}><G17Card src={IMG('gl06c_iceland_volcano')} ratio={RATIO('gl06c_iceland_volcano')} w={500} rot={-3} from={[-600, 500]} out={F(C.naam2 - 0.35 - C.jharno2 - 0.15)} seed={3} /></Box></At>
      <At t0={C.naam2 - 0.05} t1={C.ulta3 + 0.2}>
        <AbsoluteFill style={{ transform: `translate(0px, ${isTitle[1] - 180}px)` }}>
          <NameIn text="Iceland" title="gl10_title_iceland_ice" kind="ice" at={F(C.ice2 + 0.4 - C.naam2 + 0.05)} w={720} seed={4} />
        </AbsoluteFill>
      </At>

      {/* line 3: उल्टा क्यों? the two names swap islands; then the Vikings' 1000-year-old trick */}
      <At t0={C.ulta3 + 0.2} t1={C.vikings3 - 0.15}>
        <G04LabelSwap pa={[g[0] + 40, g[1] - 160]} pb={[i[0] - 20, i[1] - 150]} at={4} dur={30} lift={300}
          a={<G16Title src={IMG('gl09_title_greenland_grass')} ratio={RATIO('gl09_title_greenland_grass')} w={520} kind="grass" fo={300} seed={5} />}
          b={<G16Title src={IMG('gl10_title_iceland_ice')} ratio={RATIO('gl10_title_iceland_ice')} w={430} kind="ice" fo={300} seed={6} />} />
      </At>
      <At t0={C.ulta3 + 0.75} t1={C.vikings3 - 0.15}><Box x={540} y={1480} w={400} h={400}><G13Alert mark="?" /></Box></At>
      <At t0={C.vikings3 - 0.05} t1={C.sadi4 - 0.1}><Box x={540} y={820} w={560} h={560}><G17Card src={IMG('gl08_viking_helmet')} ratio={RATIO('gl08_viking_helmet')} w={420} rot={-6} from={[0, 900]} contain seed={7} /></Box></At>
      <At t0={C.hazar3 - 0.05} t1={C.sadi4 - 0.1}><Box x={540} y={1260} w={900} h={700}><G11HandLabel text="1000 साल पुरानी चाल" arrow={false} color="#E5262B" size={96} /></Box></At>

      <At t0={C.poora7 - 0.1} t1={C.socho8 + 0.4}>
        <G03IceSpread d={ringsD(c, GLR)} from={glFrom} tex={IMG('gl11_ice_sheet_texture')} reach={1250} dur={70} badge={null} out={F(C.socho8 + 0.1 - C.poora7 + 0.1)} />
      </At>
      {/* line 6–7: Erik's exile from Iceland, then west to the biggest island */}
      <At t0={C.green6 - 0.15} t1={C.sau6 + 0.2}><Box x={g[0]} y={g[1] - 120} w={900} h={260}><G01Highlighter text="Greenland" /></Box></At>
      <At t0={C.sau6 + 0.05} t1={C.erik6 - 0.1}><Box x={540} y={1000} w={900} h={700}><G11HandLabel text="लगभग 100 साल बाद" arrow={false} color="#111" size={92} /></Box></At>
      <At t0={C.erik6 - 0.15} t1={C.paschim7 - 0.1}>
        <Box x={790} y={1060} w={600} h={760}><G18Character src={IMG('gl02_erik_the_red')} ratio={RATIO('gl02_erik_the_red')} h={720} out={F(C.paschim7 - 0.35 - C.erik6 + 0.15)} seed={2} /></Box>
      </At>
      <At t0={C.erik6 + 0.25} t1={C.paschim7 - 0.1}><Box x={430} y={830} w={900} h={700}><G11HandLabel text="Erik the Red" to={[640, 560]} bend={120} size={100} /></Box></At>
      <At t0={C.nikal6 - 0.05} t1={C.paschim7 + 0.2}><Box x={330} y={1250} w={900} h={500}><div style={{ transform: 'scale(0.66)', width: 900, height: 500 }}><G12Stamp text="देश निकाला" sub="3 साल" /></div></Box></At>
      <At t0={C.paschim7 - 0.05} t1={C.bada7 + 0.4}>
        <G07Route d={(() => { const a = ll(c, -22.5, 64.6), b = ll(c, -30, 64.2), d2 = ll(c, -38, 64.5), e = ll(c, -42.5, 63.0); return `M ${a[0]} ${a[1]} C ${b[0]} ${b[1] + 40} ${d2[0]} ${d2[1] - 30} ${e[0]} ${e[1]}`; })()}
          dur={F(C.mila7 - C.paschim7 + 0.3)} ship={IMG('gl03_longship')} w={170} color="#FFFFFF" ravens={0} />
      </At>
      <At t0={C.bada7 - 0.1} t1={C.socho8 - 0.1}><Box x={g[0] + 60} y={g[1] - 500} w={900} h={700}><G11HandLabel text="सबसे बड़ा island" to={[420, 640]} bend={-90} color="#E5262B" size={92} /></Box></At>
      <At t0={C.barf7 + 0.25} t1={C.socho8 + 0.1}><Box x={820} y={760} w={400} h={400}><G13Alert /></Box></At>

      <Fill t={t} c={c} rings={GLR} t0={C.hari8 - 0.1} t1={C.chaal9 + 0.4} color="#7BE35A" from={above(GL, -600000)} reach={1400} alpha={1} id="glgreen" dur={1.1} plate="greenland/maps/atlantic_green.jpg" />
      {/* line 8: Erik names it Greenland: the grass title, green spreads over the ice; the people come */}
      <At t0={C.green8 - 0.1} t1={C.chaal9 + 0.35}>
        <AbsoluteFill style={{ transform: `translate(0px, ${g[1] - 180 - 230}px)` }}>
          <NameIn text="Greenland" title="gl09_title_greenland_grass" kind="grass" at={F(0.55)} w={800} seed={8} out={F(C.chaal9 + 0.2 - C.green8 + 0.1)} />
        </AbsoluteFill>
      </At>
      <At t0={C.achha8 - 0.1} t1={C.chaal9 + 0.2}>
        <Box x={830} y={1500} w={520} h={760}><G18Character src={IMG('gl02_erik_the_red')} ratio={RATIO('gl02_erik_the_red')} h={680} flip out={F(C.chaal9 - 0.05 - C.achha8 + 0.1)} seed={5} /></Box>
      </At>
      <At t0={C.log8 - 0.05} t1={C.chaal9 + 0.3}>
        <G10Pops src={IMG('gl08_viking_helmet')} size={64} step={5} points={[[-21.9, 64.1], [-18.1, 65.7], [-14.6, 65.2], [-20.3, 63.9], [-22.6, 65.5], [-16.3, 64.3], [-19.5, 64.9]].map(([lo, la]) => ll(c, lo, la))} />
      </At>

      {/* line 9: 25 ships from Iceland to Greenland's south-west coast */}
      <At t0={C.n25_9 - 0.25} t1={C.matlab10 + 0.1}>
        <G14Fleet from={ll(c, -22.0, 64.6)} to={ll(c, -46.5, 61.2)} n={25} step={4} travel={110} ship={IMG('gl03_longship')} counter={[540, 380]} />
      </At>

      {/* line 10: a 1000-year-old clickbait; the name stays; back to frame 0 */}
      <At t0={C.click10 - 0.08} t1={C.duniya10 + 0.6}><Box x={540} y={1120} w={900} h={500}><G12Stamp text="CLICKBAIT" sub="1000 साल पुराना" seed="c" tilt={-7} /></Box></At>
      <At t0={C.duniya10 + 0.1} t1={C.isiliye10 - 0.15}>
        <Box x={g[0]} y={g[1] - 160} w={760} h={760 * RATIO('gl09_title_greenland_grass')}>
          <G16Title src={IMG('gl09_title_greenland_grass')} ratio={RATIO('gl09_title_greenland_grass')} w={720} kind="grass" seed={9} out={F(C.isiliye10 - 0.3 - C.duniya10 - 0.1)} />
        </Box>
      </At>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the 9th-century paper map (line 4–5)
const PAPER_T0 = C.sadi4 - 0.2, PAPER_T1 = C.neeche5 + 0.15;
const PaperScene: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const no = ll(c, 5.3, 61.0), isl = ll(c, -14.2, 64.9);
  const route = (() => {
    const a = ll(c, 4.8, 61.2), b = ll(c, -3.0, 63.4), d = ll(c, -9.5, 63.0), e = ll(c, -13.6, 64.6);
    return `M ${a[0]} ${a[1]} C ${b[0]} ${b[1]} ${d[0]} ${d[1]} ${e[0]} ${e[1]}`;
  })();
  const winter = Math.min(ramp(t, C.sardi5 - 0.2, C.sardi5 + 0.6), 1 - ramp(t, C.vasant5 - 0.2, C.vasant5 + 0.6));
  return (
    <G05PaperReveal parchment={IMG('gl13_parchment_texture')}>
      <MapLayers c={c} paper={1} />
      <Fill t={t} c={c} rings={NOR} t0={C.norway4 - 0.1} t1={C.sardi5} color="#E5262B" from={merc(14, 64)} reach={900} alpha={0.55} id="norway" dur={0.45} />
      <Fill t={t} c={c} rings={ISR} t0={C.zameen4 - 0.1} t1={PAPER_T1 + 1} color="#C77B2E" from={GEO.centroids.Iceland} reach={500} alpha={0.45} id="isl" dur={0.4} />
      <AbsoluteFill style={{ background: '#5A86B8', mixBlendMode: 'multiply', opacity: 0.35 * winter }} />
      <Sequence from={F(C.samundar4 - 0.2 - PAPER_T0)} layout="none">
        <G07Route d={route} dur={F(C.pahuncha4 - C.samundar4 + 0.2)} ship={IMG('gl03_longship')} w={230} color="#4A3220" ravens={0} />
      </Sequence>
      <Sequence from={F(C.teen4 - 0.1 - PAPER_T0)} durationInFrames={F(C.samundar4 + 0.6 - C.teen4)} layout="none">
        <G19Ravens up={IMG('gl04_raven_wings_up')} down={IMG('gl04b_raven_wings_down')} size={170}
          flights={[0, 1, 2].map((k) => ({ from: [1200, 380 + k * 120] as [number, number], to: [no[0] - 120 - k * 70, no[1] - 260 + k * 60] as [number, number], bend: 0.25, at: k * 10, dur: 70 }))} />
      </Sequence>
      <Sequence from={F(C.kauva4 - 0.15 - PAPER_T0)} durationInFrames={F(C.jahaz4 + 1.0 - C.kauva4)} layout="none">
        <G19Ravens up={IMG('gl04_raven_wings_up')} down={IMG('gl04b_raven_wings_down')} size={150}
          flights={[{ from: [no[0] - 200, no[1] - 160], to: [isl[0] + 60, isl[1] - 120], bend: -0.15, at: 0, dur: F(C.jahaz4 + 0.8 - C.kauva4) }]} />
      </Sequence>
      <G08Snow amount={0.55 + 0.9 * winter} wind={1 + winter} />
      <Sequence from={F(C.sadi4 - PAPER_T0)} durationInFrames={F(C.floki4 - 0.2 - C.sadi4)} layout="none"><Box x={540} y={420} w={800} h={520}><G06RomanIX /></Box></Sequence>
      <Sequence from={F(C.floki4 - 0.15 - PAPER_T0)} durationInFrames={F(C.samundar4 + 0.3 - C.floki4)} layout="none">
        <Box x={810} y={1460} w={620} h={900}><G18Character src={IMG('gl01_floki_viking')} ratio={RATIO('gl01_floki_viking')} h={860} out={F(C.samundar4 - 0.05 - C.floki4)} seed={1} /></Box>
        <Sequence from={F(0.35)} layout="none"><Box x={380} y={920} w={900} h={700}><G11HandLabel text="Flóki" to={[700, 560]} bend={100} color="#4A3220" size={120} /></Box></Sequence>
      </Sequence>
      <Sequence from={F(C.map4 - 0.05 - PAPER_T0)} durationInFrames={F(C.teen4 + 0.2 - C.map4)} layout="none"><Box x={330} y={600} w={900} h={500}><div style={{ transform: 'scale(0.62)', width: 900, height: 500 }}><G12Stamp text="NO MAP" sub="" seed="m" tilt={8} /></div></Box></Sequence>
      <Sequence from={F(C.zameen4 - 0.1 - PAPER_T0)} durationInFrames={F(C.sardi5 - C.zameen4)} layout="none"><Box x={isl[0] - 60} y={isl[1] - 420} w={900} h={700}><G11HandLabel text="नई ज़मीन!" to={[480, 660]} bend={-80} color="#4A3220" size={100} /></Box></Sequence>
      <Sequence from={F(C.sardi5 - 0.05 - PAPER_T0)} durationInFrames={F(C.vasant5 + 0.4 - C.sardi5)} layout="none">
        <Box x={540} y={1320} w={760} h={620}><G17Card src={IMG('gl07_snowed_turf_hut')} ratio={RATIO('gl07_snowed_turf_hut')} w={640} rot={-3} from={[0, 900]} contain seed={4} out={F(C.vasant5 + 0.1 - C.sardi5)} /></Box>
      </Sequence>
      <Sequence from={F(C.vasant5 - 0.05 - PAPER_T0)} durationInFrames={F(PAPER_T1 - C.vasant5)} layout="none">
        <Box x={300} y={1480} w={620} h={900}><G18Character src={IMG('gl01_floki_viking')} ratio={RATIO('gl01_floki_viking')} h={820} seed={3} flip /></Box>
      </Sequence>
    </G05PaperReveal>
  );
};

// ------------------------------------------------------------------ subtitles, grade, flashes
const STROKE = (w: number, col = '#000') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const HOT = /^[0-9]|^[A-Za-zÁ-úó]/;
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
  const len = words.map((w) => Math.max(1, w.replace(/[…।,?!:."]/g, '').length));
  const tot = len.reduce((x, y) => x + y, 0);
  const span = Math.max(0.3, Math.min(t1, t0 + tot * 0.075) - t0);
  let acc = 0, cur = words.length - 1;
  for (let q = 0; q < words.length; q++) { acc += len[q]; if (t < t0 + (span * acc) / tot) { cur = q; break; } }
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 58, lineHeight: 1.22,
      color: '#fff', opacity: a, transform: `scale(${s})`, textShadow: '0 4px 0 rgba(0,0,0,0.4), 0 6px 18px rgba(0,0,0,0.8)', ...STROKE(9) }}>
      {words.map((w, q) => (
        <span key={q} style={{ color: q === cur ? '#FFE234' : HOT.test(w) ? '#9BEBFF' : '#fff', display: 'inline-block', marginRight: '0.3em', transform: `scale(${q === cur ? 1.08 : 1})` }}>{w}</span>
      ))}
    </div>
  );
};
/** The bright look (no grain): a touch of contrast, cool shadows, a soft vignette, a slow light drifting across on the
 *  loop clock. */
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 34 * Math.sin(t * LOOPF(3) + 0.6), ly = 36 + 20 * Math.sin(t * LOOPF(2));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,70,110,0.22), rgba(0,0,0,0) 45%, rgba(0,60,100,0.22))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,250,235,0.12), rgba(0,0,0,0) 45%)`, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,10,25,0.38) 100%)' }} />
    </AbsoluteFill>
  );
};
const Flashes: React.FC<{ t: number }> = ({ t }) => {
  let a = 0;
  for (const p of [C.hari2 + 0.05, C.ulta3 + 0.05, C.ab6 + 0.02, C.matlab10 + 0.35]) a = Math.max(a, 0.45 * ramp(t, p - 0.04, p, linear) * (1 - ramp(t, p, p + 0.28, easeOut)));
  return a > 0.01 ? <AbsoluteFill style={{ background: '#fff', opacity: a, pointerEvents: 'none' }} /> : null;
};

/** NullDynasty: why Greenland is ice and Iceland is green. 1080×1920 at 60 fps, rendered at --scale=2 for 4K. The
 *  bright satellite map, a 9th-century paper map for the Vikings, a spyglass view; the last frame runs into frame 0. */
export const Greenland: React.FC<{ captions?: boolean; audio?: string }> = ({ captions = true, audio = AUDIO }) => {
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
  const title = Math.max(1 - ramp(t, C.n80_1 - 0.3, C.n80_1 + 0.05, inOut), ramp(t, C.isiliye10 - 0.35, DURATION_S - 0.05, inOut));
  const inPaper = t >= PAPER_T0 && t < PAPER_T1;
  const spyglass = t >= C.neeche5 - 0.05 && t < C.ab6 + 0.15;
  return (
    <AbsoluteFill style={{ background: '#0c2a3d', overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="glblur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" /></filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px)` }}>
        <AbsoluteFill style={{ filter: (Math.max(bx, by) > 0.6 ? 'url(#glblur) ' : '') + 'contrast(1.05) saturate(1.06)' }}>
          <MapLayers c={cam} />
        </AbsoluteFill>
        <MapFx t={t} c={cam} />
        {inPaper && <Sequence from={F(PAPER_T0)} durationInFrames={F(PAPER_T1 - PAPER_T0)} layout="none"><PaperScene t={t} c={cam} /></Sequence>}
        <TitleCard t={t} a={title} />
        <Grade t={t} />
      </AbsoluteFill>
      {spyglass && (
        <Sequence from={F(C.neeche5 - 0.05)} durationInFrames={F(C.ab6 + 0.15 - C.neeche5 + 0.05)} layout="none">
          <G09Spyglass ring={IMG('gl12_spyglass_eyepiece')} r={330} irisOut={F(C.ab6 - 0.1 - C.neeche5 + 0.05)}
            overlay={<Sequence from={F(C.bas5 - 0.15 - C.neeche5 + 0.05)} layout="none"><AbsoluteFill style={{ transform: 'translate(0px, 140px)' }}><NameIn text="Iceland" title="gl10_title_iceland_ice" kind="ice" at={F(C.ice5 + 0.1 - C.bas5 + 0.15)} w={760} seed={11} /></AbsoluteFill></Sequence>}>
            <AbsoluteFill style={{ transform: 'translate(0px, -60px)' }}><Img src={IMG('gl05_fjord_drift_ice_bg')} style={{ width: 1080, height: 1920, objectFit: 'cover' }} /></AbsoluteFill>
            <G08Snow amount={0.35} />
          </G09Spyglass>
        </Sequence>
      )}
      <Flashes t={t} />
      {sp && <NullPanel t={t} q={sp.q} name={sp.w.name} t0={sp.w.t0} t1={sp.w.t1} from={sp.w.from} />}
      <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, left: 22, fontFamily: "'Montserrat', sans-serif", fontSize: 14, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles (SRTM/NASA, ETOPO1/NOAA) · borders: Natural Earth · AI-generated images
      </div>
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1640} />}
      {captions && <Watermark t={10 + (t * 90) / DURATION_S} />}
      {captions && audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
