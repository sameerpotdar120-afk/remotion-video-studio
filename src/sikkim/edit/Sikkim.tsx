import React from 'react';
import { AbsoluteFill, Audio, Easing, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { LABEL, useFonts } from '../motion/font';
import { Cam, G, MapView, merc, ringsD, toS, Vignette } from '../motion/MapView';
import { S01RailWeb } from '../motion/S01RailWeb';
import { S02StateGlow } from '../motion/S02StateGlow';
import { S03Title3D } from '../motion/S03Title3D';
import { S04Track } from '../motion/S04Track';
import { Pin, Road } from '../motion/S05Pins';
import { S06Himalaya } from '../motion/S06Himalaya';
import { S07Slope } from '../motion/S07Slope';
import { S09Route } from '../motion/S09Route';
import { Counter, S10Gauge } from '../motion/S10Gauge';
import { S11Storm } from '../motion/S11Storm';
import { quakeShake, S13Pulse } from '../motion/S13Pulse';
import { S15FactCard } from '../motion/S15FactCard';
import { S17CloudWipe } from '../motion/S17CloudWipe';
import { C11PaperTear } from '../../chandigarh/motion/C11PaperTear';
import { C as COL, clamp } from '../motion/theme';
import { Rain } from '../tests/Tunnel7Rain';
import { C, camEnd, camFact, camMap1, camQuake, camRoute, camStorm, DURATION_S, F, live, LOOPF } from './cam';

export const SK_DURATION_60 = Math.round(DURATION_S * 60);
const AUDIO = 'sikkim/audio/mix.wav';
const lin = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const sm = (x: number) => x * x * (3 - 2 * x);

// ------------------------------------------------------------------ the shot list (seconds)
// Map sections are drawn in code; the rest are Blender renders (tools/blender/shots.py, tunnel7.py), 30 fps, each timed
// to its VO line.
type ShotId = 'map1' | 'gorge' | 'xray' | 'route' | 'storm' | 'tunnel7' | 'quake' | 'bore' | 'fact' | 'station' | 'train' | 'end';
const SHOTS: [ShotId, number][] = [
  ['map1', 0], ['gorge', 30.0], ['xray', C.isliye6], ['route', C.sevoke7], ['storm', 58.6], ['tunnel7', 60.78], ['quake', C.upar10],
  ['bore', C.yani11], ['fact', C.phir12], ['station', C.rangpo12], ['train', 95.38], ['end', C.isiliye13 - 0.25],
];
/** Blender clips: file, first second in the VO, length (frames at 30 fps). */
const CLIPS: Partial<Record<ShotId, [string, number, number]>> = {
  gorge: ['gorge', 30.0, 152], xray: ['xray', C.isliye6, 160], tunnel7: ['tunnel7', 60.78, 295],
  bore: ['bore', C.yani11, 146], station: ['station', C.rangpo12, 113], train: ['train', 95.38, 194],
};
const shotAt = (t: number) => { let i = 0; for (let j = 0; j < SHOTS.length; j++) if (SHOTS[j][1] <= t) i = j; return i; };
const CUTS = [30.0, C.isliye6, 60.78, C.upar10, C.yani11, C.phir12, 95.38];

// ------------------------------------------------------------------ helpers
/** A piece on screen from a to b (seconds); its own frames count from a. */
const At: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => (
  <Sequence from={F(a)} durationInFrames={Math.max(1, F(b) - F(a))} layout="none"><AbsoluteFill>{children}</AbsoluteFill></Sequence>
);
const r = (s: number, a: number) => F(s) - F(a);
/** Soft clouds drifting over the map (code-drawn noise, two layers, their shadows on the ground); loop-safe drift. */
const Clouds: React.FC<{ t: number; a?: number; low?: boolean }> = ({ t, a = 1, low }) => {
  if (a <= 0.01) return null;
  const L = [{ s: 11, ox: 0, k: 3, o: 0.5 }, { s: 23, ox: 300, k: 2, o: 0.35 }];
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a, pointerEvents: 'none' }}>
      <defs>
        {L.map((l, i) => (
          <filter key={i} id={`skc${i}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={i ? '0.0028 0.004' : '0.004 0.006'} numOctaves={4} seed={l.s} />
            <feColorMatrix values="0 0 0 0 0.9  0 0 0 0 0.92  0 0 0 0 0.95  0 0 0 2.4 -1.2" />
          </filter>
        ))}
        <linearGradient id="skcM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={low ? 0 : 0.5} /><stop offset="0.5" stopColor="#fff" stopOpacity={low ? 0.1 : 0.3} /><stop offset="0.75" stopColor="#fff" stopOpacity={1} /><stop offset="1" stopColor="#fff" /></linearGradient>
        <mask id="skcMask"><rect width={1080} height={1920} fill="url(#skcM)" /></mask>
      </defs>
      <g mask="url(#skcMask)">
        {L.map((l, i) => {
          const x = -400 + 300 * Math.sin(t * LOOPF(l.k)) - l.ox * 0, y = -200 + 120 * Math.sin(t * LOOPF(l.k + 1) + i);
          return <g key={i}>
            <rect x={x + 40} y={y + 60} width={2000} height={2400} filter={`url(#skc${i})`} style={{ filter: 'brightness(0) blur(12px)' }} opacity={0.25} />
            <rect x={x} y={y} width={2000} height={2400} filter={`url(#skc${i})`} opacity={l.o} />
          </g>;
        })}
      </g>
    </svg>
  );
};
/** India filled a dusty rose under the rail web (the reference's frame 0). */
const IndiaFill: React.FC<{ c: Cam; a: number }> = ({ c, a }) => a > 0 ? (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <path d={ringsD(c, G.countries.India)} fill={COL.rose} opacity={0.42 * a} stroke="#fff" strokeOpacity={0.55 * a} strokeWidth={2} />
  </svg>
) : null;
const Tag: React.FC<{ text: string; y: number; color?: string; out?: number }> = ({ text, y, color = COL.cyan, out }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const o = out !== undefined ? interpolate(f, [out, out + 8], [1, 0], clamp) : 1;
  return <div style={{ position: 'absolute', left: 540, top: y, transform: `translate(-50%,-50%) scale(${p})`, opacity: o, background: 'rgba(8,12,16,0.88)', borderLeft: `8px solid ${color}`,
    padding: '10px 26px', fontFamily: LABEL, fontWeight: 800, fontSize: 44, letterSpacing: 5, color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>{text}</div>;
};
// ------------------------------------------------------------------ the shots (backgrounds plus their graphics)
const Map1: React.FC<{ t: number }> = ({ t }) => {
  const c = live(camMap1(t), t);
  const a0 = 0;
  return (
    <AbsoluteFill>
      <MapView c={c} dark={1} />
      <IndiaFill c={c} a={1 - lin(t, 3.0, 4.0)} />
      <Clouds t={t} a={1 - 0.6 * lin(t, 3.2, 4.6)} />
      <At a={a0} b={4.2}><S01RailWeb c={c} build={90} out={r(2.9, a0)} /></At>
      <At a={C.n7000 - 0.1} b={4}><Counter x={540} y={1540} to={7000} t0={0} dur={60} plus caption="RAILWAY STATIONS" out={r(3.2, C.n7000 - 0.1)} /></At>
      <At a={3.9} b={13.9}><S02StateGlow c={c} lit={r(C.rajya1 + 0.3, 3.9)} borders={r(5.3, 3.9)} out={r(13.5, 3.9)} /></At>
      <At a={13.5} b={30.0}><S02StateGlow c={c} borders={-60} dim={0} /></At>
      <At a={23.0} b={30.0}><S02StateGlow c={c} lit={0} /></At>
      <At a={C.sikkim1 - 0.15} b={12.6}><AbsoluteFill style={{ top: -600 }}><S03Title3D text="SIKKIM" size={180} out={r(12.3, C.sikkim1 - 0.15)} /></AbsoluteFill></At>
      <At a={C.kyon2 + 0.2} b={13.3}><S04Track c={c} from={merc(88.3, 25.75)} to={G.towns.Rangpo} stopAt={0.7} grow={[0, 70]} q={r(C.koshish2, C.kyon2 + 0.2)} out={r(12.9, C.kyon2 + 0.2)} /></At>
      <At a={C.siliguri3 - 0.2} b={23.2}><Pin c={c} at={G.towns.Siliguri} text="Siliguri" t0={0} side="l" out={r(22.9, C.siliguri3 - 0.2)} /></At>
      <At a={C.njp3 - 0.2} b={23.2}><Pin c={c} at={G.towns['New Jalpaiguri']} text="New Jalpaiguri" t0={0} out={r(22.9, C.njp3 - 0.2)} /></At>
      <At a={17.2} b={23.2}><S04Track c={c} from={merc(88.44, 26.2)} to={G.towns['New Jalpaiguri']} stopAt={0.97} grow={[0, 60]} scale={0.8} out={r(22.9, 17.2)} /></At>
      <At a={20.2} b={23.2}><Road c={c} pts={G.nh10} t0={0} dur={100} out={r(22.9, 20.2)} /></At>
      <At a={C.himalaya4 - 0.25} b={30.0}><S06Himalaya c={c} /></At>
      <At a={C.train5 - 0.1} b={30.0}><S07Slope steep={r(C.lekin5 - 0.2, C.train5 - 0.1)} /></At>
      <Vignette />
    </AbsoluteFill>
  );
};
/** A Blender clip on the VO timeline (30 fps renders in the 60 fps edit), held on its last frame if the shot runs on. */
const BClip: React.FC<{ id: ShotId; t: number }> = ({ id, t }) => {
  const [file, t0, n] = CLIPS[id]!;
  const f = Math.round((t - t0) * 30);
  const v = <OffthreadVideo src={staticFile(`sikkim/blender/${file}.mp4`)} muted style={{ width: 1080, height: 1920 }} />;
  return (
    <Sequence from={F(t0)} layout="none">
      {f >= n - 1 ? <Freeze frame={Math.round(((n - 1.5) / 30) * 60)}>{v}</Freeze> : v}
    </Sequence>
  );
};
const GorgeShot: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <BClip id="gorge" t={t} />
    <At a={C.zameen5 + 0.6} b={C.ghati5 - 0.2}><Tag text="STEEP SLOPES" y={300} out={r(C.ghati5 - 0.45, C.zameen5 + 0.6)} /></At>
    <At a={C.ghati5 - 0.1} b={C.isliye6}><Tag text="DEEP VALLEYS" y={1580} /></At>
    <Vignette k={0.6} />
  </AbsoluteFill>
);
const XrayShot: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <BClip id="xray" t={t} />
    <At a={C.upar6 - 0.05} b={C.andar6 - 0.3}><Tag text="NOT OVER THE TOP" y={300} color={COL.red} out={r(C.andar6 - 0.55, C.upar6 - 0.05)} /></At>
    <At a={C.andar6 - 0.1} b={C.sevoke7}><Tag text="INSIDE THE MOUNTAIN" y={1580} color={COL.cyan} /></At>
    <Vignette k={0.6} />
  </AbsoluteFill>
);
const Tunnel7Shot: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <BClip id="tunnel7" t={t} />
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(190,200,210,0.16) 0%, rgba(190,200,210,0.04) 60%, rgba(190,200,210,0) 100%)' }} />
    <Rain f={Math.round((t - 60.78) * 30)} width={1080} height={1920} />
    <At a={C.tunnel7 - 0.5} b={C.upar10}><Tag text="TUNNEL 7" y={300} /></At>
    <At a={C.landslide9 - 0.1} b={C.upar10}><Tag text="PROTECTION WALL · LANDSLIDE" y={420} color={COL.red} /></At>
    <Vignette k={0.7} />
  </AbsoluteFill>
);
const BoreShot: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <BClip id="bore" t={t} />
    <Vignette k={0.8} />
  </AbsoluteFill>
);
const RouteShot: React.FC<{ t: number }> = ({ t }) => {
  const c = live(camRoute(t), t), a = C.sevoke7;
  return (
    <AbsoluteFill>
      <MapView c={c} />
      <Clouds t={t} a={0.6} low />
      <At a={a} b={57.4}><S09Route c={c} draw={[r(a + 0.35, a), r(C.km45 - 0.1, a)]} tunnels={r(C.surang7, a)} tstep={3} bridges={r(C.b22, a)} longest={r(C.longest8 + 0.3, a)} /></At>
      <At a={C.km45 - 0.1} b={C.km38 - 0.1}><Counter x={540} y={250} to={45} t0={0} dur={40} unit="KM" caption="SEVOKE → RANGPO" size={130} out={r(C.km38 - 0.25, C.km45 - 0.1)} /></At>
      <At a={C.p86 - 0.1} b={C.surang7}><S10Gauge x={250} y={1500} r={120} steps={[[8, 86, 'IN TUNNELS']]} out={r(C.surang7 - 0.2, C.p86 - 0.1)} /></At>
      <At a={C.km38 - 0.1} b={C.t14 - 0.1}><Counter x={540} y={250} to={38} t0={0} dur={40} unit="KM" caption="INSIDE TUNNELS" size={130} color={COL.cyanGlow} out={r(C.t14 - 0.25, C.km38 - 0.1)} /></At>
      <At a={C.t14 - 0.1} b={57.4}><Counter x={200} y={1690} to={14} t0={0} dur={30} caption="TUNNELS" size={120} color={COL.cyanGlow} /></At>
      <At a={C.b22 - 0.1} b={57.4}><Counter x={540} y={1690} to={22} t0={0} dur={30} caption="BRIDGES" size={120} /></At>
      <At a={C.s5 - 0.1} b={57.4}><Counter x={880} y={1690} to={5} t0={0} dur={20} caption="STATIONS" size={120} color="#FFD3F4" /></At>
      <At a={C.longest8} b={57.4}><Tag text="LONGEST TUNNEL" y={250} color="#fff" /></At>
      <Vignette />
    </AbsoluteFill>
  );
};
const StormShot: React.FC<{ t: number }> = ({ t }) => {
  const c = live(camStorm(t), t), a = 58.6;
  return (
    <AbsoluteFill>
      <MapView c={c} dark={1.15} />
      <At a={a} b={60.78}><S09Route c={c} draw={[-20, -10]} tunnels={-200} highlight={r(C.tunnel7, a)} dimLine={0.3} /></At>
      <At a={a + 0.2} b={60.78}><S11Storm t0={0} bolts={[[r(C.baarish9, a + 0.2), 640, 1050], [r(C.khisak9 + 0.4, a + 0.2), 380, 820], [r(C.landslide9, a + 0.2), 560, 1150]]} /></At>
      <Vignette />
    </AbsoluteFill>
  );
};
const QuakeShot: React.FC<{ t: number }> = ({ t }) => {
  const c = live(camQuake(t), t), a = C.upar10;
  const [px, py] = toS(c, merc(88.45, 27.55));
  return (
    <AbsoluteFill>
      <MapView c={c} />
      <Clouds t={t} a={0.5} low />
      <At a={a} b={C.yani11}><S02StateGlow c={c} lit={-40} borders={-60} /></At>
      <At a={C.bhukamp10 - 0.1} b={C.yani11}><S13Pulse x={px} y={py} tag={r(C.zone10, C.bhukamp10 - 0.1)} /></At>
      <Vignette />
    </AbsoluteFill>
  );
};
const FactShot: React.FC<{ t: number }> = ({ t }) => {
  const c = live(camFact(t), t), a = C.phir12;
  return (
    <AbsoluteFill>
      <MapView c={c} dark={1.4} />
      <Clouds t={t} a={0.5} low />
      <At a={a} b={C.rangpo12}><S02StateGlow c={c} lit={-40} dim={0.4} /></At>
      <At a={a + 0.1} b={C.rangpo12}>
        <S15FactCard kicker="SEVOKE–RANGPO RAIL LINK" lines={['लगभग 85% काम पूरा', 'प्लान के हिसाब से चला तो दिसंबर 2027 तक', 'रंगपो: सिक्किम का पहला रेलवे स्टेशन']} key1={1} hl={r(C.plan12, a + 0.1)} out={r(C.rangpo12 - 0.2, a + 0.1)} />
      </At>
      <At a={C.p85 - 0.2} b={C.rangpo12}><S10Gauge x={540} y={1530} r={135} steps={[[12, 85, 'WORK DONE']]} out={r(C.rangpo12 - 0.2, C.p85 - 0.2)} /></At>
      <Vignette />
    </AbsoluteFill>
  );
};
const StationShot: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <BClip id="station" t={t} />
    <At a={C.rangpo12 + 0.15} b={95.38}><Tag text="RANGPO" y={300} /></At>
    <At a={C.pehla12 - 0.1} b={95.38}><Tag text="SIKKIM'S FIRST STATION" y={1580} /></At>
    <Vignette k={0.8} />
  </AbsoluteFill>
);
const TrainShot: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <BClip id="train" t={t} />
    <Vignette k={0.8} />
  </AbsoluteFill>
);
const EndShot: React.FC<{ t: number }> = ({ t }) => {
  const c = live(camEnd(t), t);
  return (
    <AbsoluteFill>
      <MapView c={c} />
      <IndiaFill c={c} a={1} />
      <Clouds t={t} a={1} />
      <Vignette />
    </AbsoluteFill>
  );
};
const Shot: React.FC<{ id: ShotId; t: number }> = ({ id, t }) => {
  switch (id) {
    case 'map1': return <Map1 t={t} />;
    case 'gorge': return <GorgeShot t={t} />;
    case 'xray': return <XrayShot t={t} />;
    case 'route': return <RouteShot t={t} />;
    case 'storm': return <StormShot t={t} />;
    case 'tunnel7': return <Tunnel7Shot t={t} />;
    case 'quake': return <QuakeShot t={t} />;
    case 'bore': return <BoreShot t={t} />;
    case 'fact': return <FactShot t={t} />;
    case 'station': return <StationShot t={t} />;
    case 'train': return <TrainShot t={t} />;
    case 'end': return <EndShot t={t} />;
  }
};
/** The current shot (its graphics are timed in absolute seconds); the paper tear into the route map, a fade into the
 *  dusk shot and the cloud wipe into the loop. */
const Shots: React.FC<{ t: number }> = ({ t }) => {
  const i = shotAt(t), [id, a] = SHOTS[i];
  const seq = (k: number) => <Shot id={SHOTS[k][0]} t={t} />;
  if (id === 'route' && t < a + 0.45) return <C11PaperTear at={F(a)} dur={F(0.45)} next={seq(i)}><Shot id="xray" t={t} /></C11PaperTear>;
  if (id === 'end' && t < a + 0.3) return <S17CloudWipe at={F(a - 0.3)} dur={F(0.6)} next={seq(i)}><Shot id="train" t={t} /></S17CloudWipe>;
  if (id === 'train' && i + 1 < SHOTS.length && t > SHOTS[i + 1][1] - 0.3) return <S17CloudWipe at={F(SHOTS[i + 1][1] - 0.3)} dur={F(0.6)} next={<Shot id="end" t={t} />}><Shot id="train" t={t} /></S17CloudWipe>;
  if (id === 'station' && t < a + 0.35) return <AbsoluteFill><Shot id="fact" t={t} /><AbsoluteFill style={{ opacity: lin(t, a, a + 0.35) }}>{seq(i)}</AbsoluteFill></AbsoluteFill>;
  return seq(i);
};

// ------------------------------------------------------------------ Null (split screen, middle only)
/** Clip A: rain fingers on "बारिश", the slope slide on "पहाड़ खिसकते"; clip B: the pinch on "छोटी सी ग़लती", hands wide
 *  on "बहुत भारी". */
const NULL_WIN = [
  { name: 'A', t0: C.baarish9 - 0.25, t1: C.pichhle9 + 1.3, from: 0 },
  { name: 'B', t0: C.galti11 - 1.9, t1: C.phir12 + 0.2, from: 0 },
];
const splitAt = (t: number) => {
  for (const w of NULL_WIN) {
    const q = Math.min(sm(lin(t, w.t0 - 0.2, w.t0 + 0.2)), 1 - sm(lin(t, w.t1 - 0.2, w.t1 + 0.2)));
    if (q > 0) return { q, w };
  }
  return null;
};
const BAND_TOP = 560;
const NullPanel: React.FC<{ t: number; q: number; w: (typeof NULL_WIN)[number] }> = ({ t, q, w }) => (
  <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d' }}>
    <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 260}px`, transform: `scale(${1 + 0.05 * lin(t, w.t0, w.t1)})` }}>
      <Sequence from={F(w.t0 - 0.2)} durationInFrames={F(w.t1 - w.t0 + 0.6)} layout="none">
        <OffthreadVideo src={staticFile(`sikkim/null/null_sk_${w.name}.mp4`)} muted startFrom={Math.round(w.from * 24)} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: `linear-gradient(90deg, ${COL.cyanDeep}, ${COL.cyan}, #fff, ${COL.cyan}, ${COL.cyanDeep})`, boxShadow: `0 0 24px ${COL.cyan}` }} />
  </div>
);

// ------------------------------------------------------------------ grade, flashes, shake
/** A cool drifting light and the edge darkening on everything (no grain). */
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 30 * Math.sin(t * LOOPF(3) + 0.6), ly = 38 + 18 * Math.sin(t * LOOPF(2));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(190,240,255,0.07), rgba(0,0,0,0) 45%)`, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 62%, rgba(0,6,10,0.3) 100%)' }} />
    </AbsoluteFill>
  );
};
const Flashes: React.FC<{ t: number }> = ({ t }) => {
  let a = 0;
  for (const p of [...CUTS, C.sikkim1, C.rajya1 + 0.3]) a = Math.max(a, 0.32 * lin(t, p - 0.03, p) * (1 - sm(lin(t, p, p + 0.25))));
  return a > 0.01 ? <AbsoluteFill style={{ background: '#fff', opacity: a, pointerEvents: 'none' }} /> : null;
};
const shakeAt = (f: number) => {
  let x = 0, y = 0;
  for (const s of [C.zone10, C.risk10, C.landslide9]) { const [a, b] = quakeShake(f, F(s)); x += a; y += b; }
  return [x, y];
};
const CREDIT_3D = 'terrain: AWS Terrain Tiles (SRTM/NASA) · imagery: Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · textures, trees: Poly Haven (CC0)';
const CREDIT_BORE = 'textures: Poly Haven (CC0)';
const CREDIT_MAP = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles (SRTM/NASA) · borders: Natural Earth';

/** NullDynasty: Sikkim, the only state with no railway station yet. 1080×1920 at 60 fps, rendered at --scale=2 for 4K.
 *  The dark relief map and code-drawn graphics for the map lines; Blender renders (the real Teesta gorge, Tunnel 7, the
 *  bore, Rangpo, the train) for the rest; the last frame runs straight into frame 0 (a loop). */
export const Sikkim: React.FC<{ audio?: string; brand?: boolean }> = ({ audio = AUDIO, brand = true }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  useFonts();
  const sp = splitAt(t);
  const q = sp ? sp.q : 0;
  const [sx, sy] = shakeAt(frame);
  const id = SHOTS[shotAt(t)][0];
  const credit = id === 'bore' ? CREDIT_BORE : CLIPS[id] ? CREDIT_3D : CREDIT_MAP;
  return (
    <AbsoluteFill style={{ background: '#0b1418', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px)` }}>
        <Shots t={t} />
        <Grade t={t} />
      </AbsoluteFill>
      <Flashes t={t} />
      {sp && <NullPanel t={t} q={sp.q} w={sp.w} />}
      {credit && <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, left: 22, fontFamily: LABEL, fontSize: 14, fontStyle: 'italic', color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right' }}>{credit}</div>}
      {brand && <Watermark t={10 + (t * 120) / DURATION_S} />}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
