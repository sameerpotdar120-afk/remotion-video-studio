import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile } from 'remotion';
import SIZES from '../../../public/whiskywar/img_sizes.json';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, Cam, DURATION_S, GEO, P, SC, merc, toScreen } from './cam';
import { HEAD, NUM as TZNUM, SUB } from '../../timezones/fonts';
import { COL } from './regions';
import { CanadaFlag, DenmarkFlag, PoleFlag } from '../motion/Flags';
import { SCRIPT, useFonts } from '../motion/font';
import { W02WarBadge } from '../motion/W02WarBadge';
import { W03Highlight } from '../motion/W03Highlight';
import { W04BurnReveal } from '../motion/W04BurnReveal';
import { W05RingLabel } from '../motion/W05RingLabel';
import { W06TypeTag } from '../motion/W06TypeTag';
import { W07Distance } from '../motion/W07Distance';
import { W08PinPulse } from '../motion/W08PinPulse';
import { W09YearType } from '../motion/W09YearType';
import { W10TwoWay } from '../motion/W10TwoWay';
import { W11ColorFlash } from '../motion/W11ColorFlash';
import { W12HeliRoute } from '../motion/W12HeliRoute';
import { W13Sticker } from '../motion/W13Sticker';
import { W14FlagSwap } from '../motion/W14FlagSwap';
import { W15ScriptNote } from '../motion/W15ScriptNote';
import { W16WarArrows } from '../motion/W16WarArrows';
import { W17TapeStop } from '../motion/W17TapeStop';
import { W18Montage } from '../motion/W18Montage';
import { W19IslandSplit } from '../motion/W19IslandSplit';
import { W20BorderSweep } from '../motion/W20BorderSweep';

const FPS = 60;
const STROKE = (w: number, col = '#06101a') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';
type Pt = [number, number];
const S = (c: Cam, lon: number, lat: number): Pt => toScreen(c, merc(lon, lat));
const f60 = (s: number) => Math.round(s * FPS);
const rel = (s: number, at: number) => Math.round((s - at) * FPS);

/** The creator's images (cut out by tools/cut_whiskywar_assets.py); missing ones fall back to drawn stand-ins. */
type Size = { w: number; h: number; ext?: string };
const SZ = SIZES as Record<string, Size>;
export const IMG = (k: string) => (SZ[k] ? { src: staticFile(`whiskywar/img/${k}.${SZ[k].ext ?? 'png'}`), w: SZ[k].w, h: SZ[k].h } : null);

/** A motion component placed on screen and started at second t0 (its own frame 0); it runs until t1. */
export const At: React.FC<{ t0: number; t1: number; x: number; y: number; w: number; h: number; ax?: number; ay?: number; scale?: number; opacity?: number; rot?: number; children: React.ReactNode }> = ({
  t0, t1, x, y, w, h, ax = 0.5, ay = 0.5, scale = 1, opacity = 1, rot = 0, children,
}) => (
  <Sequence from={f60(t0)} durationInFrames={Math.max(1, f60(t1 - t0))} layout="none">
    <div style={{ position: 'absolute', left: x - w * ax, top: y - h * ay, width: w, height: h, transform: `rotate(${rot}deg) scale(${scale})`, transformOrigin: `${ax * 100}% ${ay * 100}%`, opacity, pointerEvents: 'none' }}>
      {children}
    </div>
  </Sequence>
);

/** Kinetic headline. */
const Big: React.FC<{ t: number; t0: number; t1: number; text: React.ReactNode; x: number; y: number; size?: number; color?: string; rot?: number }> = ({ t, t0, t1, text, x, y, size = 110, color = '#fff', rot = -3 }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 260)) + kick(t, t0 + 0.12, 0.06, 24, 9);
  return (
    <div style={{ position: 'absolute', left: x, top: y + Math.sin((t - t0) * 2.2) * 5, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', textAlign: 'center',
      fontFamily: HEAD, fontWeight: 800, fontSize: size, color, lineHeight: 1.05, textShadow: SHADOW, ...STROKE(size > 150 ? 12 : 9) }}>{text}</div>
  );
};

/** Subtitles: Mukta ExtraBold, karaoke (the spoken word lights green), English names and numbers in gold. */
const HOT = /^[+\-−0-9,.~%:"]*[0-9A-Za-z]/;
export const Subtitles: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.3;
  if (i < 0 || t < 0.2 || t > end) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = ramp(t, t0, t0 + 0.08, linear) * (1 - ramp(t, t1 - 0.02, t1, linear));
  if (a <= 0) return null;
  const s = lerp(0.86, 1, clamp01(pop(t, t0, 12, 260)));
  const words = text.replace(/"/g, '').split(' ');
  const len = words.map((w) => Math.max(1, w.replace(/[…।,?!:."]/g, '').length));
  const tot = len.reduce((x, y) => x + y, 0);
  const span = Math.max(0.3, Math.min(t1, t0 + tot * 0.075) - t0);
  let acc = 0, cur = words.length - 1;
  for (let q = 0; q < words.length; q++) { acc += len[q]; if (t < t0 + (span * acc) / tot) { cur = q; break; } }
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: SUB, fontWeight: 800, fontSize: 58, lineHeight: 1.22,
      color: '#fff', opacity: a, transform: `scale(${s})`, textShadow: '0 4px 0 rgba(0,0,0,0.4), 0 6px 18px rgba(0,0,0,0.7)', ...STROKE(9, '#000') }}>
      {words.map((w, q) => (
        <span key={q} style={{ color: q === cur ? '#7CFF6B' : HOT.test(w) ? COL.yellow : '#fff', display: 'inline-block', transform: `scale(${q === cur ? 1.08 : 1})` }}>{w}&nbsp;</span>
      ))}
    </div>
  );
};

/** The grade: teal shadows and warm highlights, a vignette, darker edges, grain. */
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='256' height='256' filter='url(%23n)'/></svg>")`;
export const Grade: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,70,90,0.18), rgba(0,40,60,0.05) 40%, rgba(255,150,60,0.06) 70%, rgba(255,140,40,0.12))', mixBlendMode: 'soft-light' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.38) 100%)' }} />
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.26), rgba(0,0,0,0) 18%, rgba(0,0,0,0) 76%, rgba(0,6,12,0.4))' }} />
    <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'overlay', backgroundImage: GRAIN, backgroundSize: '256px 256px', backgroundPosition: `${(frame * 73) % 256}px ${(frame * 151) % 256}px` }} />
  </AbsoluteFill>
);

// ================================================================ map beats

const ringsD = (c: Cam, rings: P[][]) => rings.map((r) => r.map((pt, i) => {
  const [x, y] = toScreen(c, pt);
  return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
}).join('') + 'Z').join('');

/** Line 1: the flag wipes out from a dot inside the country to fill its outline (the reference's 0.0–1.25 s), waving. */
const FlagFill: React.FC<{ t: number; c: Cam; t0: number; rings: P[][]; kind: 'canada' | 'denmark'; from: Pt; label: string; size: number; t1: number }> = ({ t, c, t0, rings, kind, from, label, size, t1 }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.25, t1);
  if (a <= 0) return null;
  const r = ramp(t, t0 + 0.1, t0 + 0.8, easeOut) * 1600;
  const d = ringsD(c, rings);
  const f = Math.round(t * FPS);
  const id = `ff${kind}`;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <defs>
        <clipPath id={`${id}c`}><path d={d} /></clipPath>
        <clipPath id={`${id}r`}><circle cx={from[0]} cy={from[1]} r={Math.max(0.1, r)} /></clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <g clipPath={`url(#${id}r)`}>
          <g transform={`translate(${from[0] - (kind === 'canada' ? 900 : 300)} ${from[1] - (kind === 'canada' ? 450 : 227)})`}>
            {kind === 'canada' ? <CanadaFlag w={1800} h={900} f={f} wave={1} uid={id} /> : <DenmarkFlag w={600} h={454} f={f} wave={1} uid={id} />}
          </g>
        </g>
      </g>
      {r < 50 && <circle cx={from[0]} cy={from[1]} r={16 * ramp(t, t0, t0 + 0.08)} fill="#E1261C" />}
      <text x={from[0]} y={from[1] + size * 0.35} textAnchor="middle" fontFamily={TZNUM} fontSize={size} fill="#fff" stroke="#1A3A6A" strokeWidth={10} paintOrder="stroke"
        opacity={ramp(t, t0 + 0.4, t0 + 0.7)} transform={`rotate(-4 ${from[0]} ${from[1]})`} letterSpacing={6}>{label}</text>
    </svg>
  );
};

/** A dashed border down the Nares Strait (the 1973 line ran down its middle; drawn approximately). */
const Strait: React.FC<{ t: number; c: Cam; t0: number; t1: number; color?: string }> = ({ t, c, t0, t1, color = '#F08AB0' }) => {
  const a = window4(t, t0, t0 + 0.1, t1 - 0.2, t1);
  if (a <= 0) return null;
  const k = ramp(t, t0, t0 + 1.3, inOut);
  const d = GEO.strait[0].map((p, i) => { const [x, y] = toScreen(c, p); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join('');
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <path d={d} stroke={color} strokeWidth={9} strokeDasharray="26 16" fill="none" pathLength={1} style={{ strokeDasharray: `${k} 1` }} />
      {k > 0.99 && <path d={d} stroke={color} strokeWidth={9} strokeDasharray="26 16" fill="none" />}
    </svg>
  );
};

/** Line 1's bottles: a whisky and a schnapps bottle spin in where the weapons would be (the "हथियार" beat). */
const Bottle: React.FC<{ k: 'wk07_schnapps_bottle' | 'wk08_whisky_bottle' }> = ({ k }) => {
  const im = IMG(k);
  if (im) return <Img src={im.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
  const dk = k === 'wk07_schnapps_bottle';
  return (
    <svg width="100%" height="100%" viewBox="0 0 260 520">
      <path d="M 105 20 H 155 V 140 Q 230 180 230 260 V 490 Q 230 510 210 510 H 50 Q 30 510 30 490 V 260 Q 30 180 105 140 Z" fill={dk ? '#16301E' : '#7A3A0A'} />
      <rect x={55} y={300} width={150} height={120} rx={8} fill="#E9DDBF" />
      <rect x={100} y={10} width={60} height={30} rx={6} fill={dk ? '#B3141F' : '#5A1A10'} />
    </svg>
  );
};

/** Map overlays for every map beat; positions follow the camera each frame. */
export const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const can = S(c, -100, 58), dk = S(c, 9.5, 56.1), mid = S(c, -40, 52), hans = S(c, -66.459, 80.826), grl = S(c, -41, 73);
  const cl = (p: Pt): Pt => [Math.min(900, Math.max(180, p[0])), p[1]];
  const ott = cl(S(c, -95, 56)), cph = cl(S(c, 10, 56)), m1 = SC('map1'), atl = SC('atlas'), par = SC('parch');
  return (
    <>
      {/* line 1: Canada and Denmark fill with their flags, WAR? between them, the two bottles */}
      {t < m1.t1 && <FlagFill t={t} c={c} t0={0.05} t1={m1.t1} rings={GEO.canada} kind="canada" from={can} label="CANADA" size={120} />}
      {t < m1.t1 && <FlagFill t={t} c={c} t0={C.desh1 - 0.1} t1={m1.t1} rings={GEO.denmark} kind="denmark" from={dk} label="DENMARK" size={60} />}
      <At t0={C.n49_1 - 0.2} t1={m1.t1} x={mid[0]} y={mid[1] - 120} w={1080} h={1080} scale={0.85}>
        <W02WarBadge text="जंग?" a={[Math.max(-200, can[0] - mid[0] + 540), can[1] - mid[1] + 660]} b={[Math.min(1300, dk[0] - mid[0] + 540), dk[1] - mid[1] + 660]} />
      </At>
      <At t0={C.hathiyar1 - 0.1} t1={m1.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}>
        <W13Sticker w={240} h={480} at={[300, 1260]} from={[-300, 400]} spin={-300} rest={-12}><Bottle k="wk08_whisky_bottle" /></W13Sticker>
      </At>
      <At t0={C.hathiyar1 + 0.2} t1={m1.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}>
        <W13Sticker w={220} h={480} at={[790, 1250]} from={[1400, 400]} spin={300} rest={10}><Bottle k="wk07_schnapps_bottle" /></W13Sticker>
      </At>
      {/* line 2: the dive onto the island; the ring and label */}
      <At t0={C.hans2 - 0.1} t1={atl.t0} x={hans[0]} y={hans[1]} w={900} h={600} ax={300 / 900} ay={400 / 600}><W05RingLabel text="Hans Island" r={46} /></At>
      {/* line 3 on the atlas: CANADA, DENMARK, the distance, the question */}
      <At t0={atl.t0 + 0.3} t1={par.t0} x={250} y={760} w={800} h={300}><W06TypeTag text="CANADA" size={64} /></At>
      <At t0={atl.t0 + 0.6} t1={par.t0} x={850} y={760} w={800} h={300}><W06TypeTag text="DENMARK" size={56} tilt={-3} /></At>
      <At t0={C.door3 - 0.05} t1={par.t0} x={540} y={1000} w={1080} h={700}><W07Distance a={[150, 350]} b={[930, 350]} text="हज़ारों km" /></At>
      <Big t={t} t0={C.jhagda3 - 0.05} t1={par.t0} text="?" x={540} y={760} size={260} color={COL.yellow} rot={8} />
      {/* line 4 on parchment: 1953, GREENLAND, the border down the strait */}
      <At t0={C.n1953_4 - 0.15} t1={C.sarhad4} x={grl[0] + 40} y={grl[1] + 160} w={1080} h={500}><W09YearType year="1953" color="rgba(40,36,30,0.72)" out={rel(C.hissa4 + 0.4, C.n1953_4 - 0.15)} tilt={-8} size={220} /></At>
      <At t0={C.greenland4 - 0.05} t1={C.sarhad4} x={grl[0] - 40} y={grl[1] - 140} w={800} h={300}><W06TypeTag text="GREENLAND" size={58} tilt={-5} /></At>
      <Strait t={t} c={c} t0={C.sarhad4} t1={SC('strait').t1} />
      {/* line 5: the island pinned, then 18 km both ways */}
      <At t0={SC('strait').t0 + 0.2} t1={C.n18_5 - 0.3} x={hans[0]} y={hans[1]} w={600} h={600}><W08PinPulse /></At>
      <At t0={C.n18_5 - 0.6} t1={SC('y1984').t0} x={hans[0]} y={hans[1]} w={1080} h={1080}><W10TwoWay angle={-36 + 14} len={330} km={18} /></At>
      {/* 1984 over Greenland */}
      <At t0={SC('y1984').t0 + 0.1} t1={SC('beach1').t0} x={540} y={820} w={1080} h={500}><W09YearType year="1984" out={999} /></At>
      {/* line 7: the minister's helicopter route to the island */}
      <At t0={SC('heli').t0} t1={SC('beach2').t0} x={0} y={0} w={1080} h={1080} ax={0} ay={0} scale={1.0}>
        <W12HeliRoute name="Tom Høyem" face={IMG('wk04_tom_hoyem_face')?.src} a={[180, 1350]} b={[Math.min(820, Math.max(260, hans[0])), Math.max(520, hans[1])]} />
      </At>
      {/* line 8: war plan */}
      <At t0={SC('war').t0 + 0.2} t1={SC('beach3').t0} x={540} y={1060} w={1080} h={1080}><W16WarArrows target={[Math.min(1040, Math.max(700, hans[0])), Math.max(200, hans[1] - 660 + 540)]} /></At>
      {/* line 11: the new border */}
      <At t0={SC('border').t0 + 0.05} t1={C.tumhare12 + 0.1} x={540} y={960} w={1080} h={1920}><W20BorderSweep left="CANADA" right="DENMARK" /></At>
    </>
  );
};

// ================================================================ the paper, the beach, the montage, the island

/** Line 2: the newspaper (the creator's image, or a drawn stand-in), the headline highlighted, then it burns away. */
const Paper: React.FC = () => {
  const im = IMG('wk02_newspaper_bg');
  return (
    <AbsoluteFill style={{ background: '#E8DCC0' }}>
      {im ? <Img src={im.src} style={{ width: 1080, height: 1920, objectFit: 'cover' }} /> : (
        <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, #EADFC6 0 18px, #D8CBAE 18px 20px)' }}>
          <div style={{ position: 'absolute', left: 80, top: 520, fontFamily: 'Georgia, serif', fontSize: 92, color: '#222', fontWeight: 700, transform: 'rotate(-6deg)' }}>The Northern Courier</div>
          <div style={{ position: 'absolute', left: 90, top: 700, fontFamily: 'Georgia, serif', fontSize: 110, color: '#111', fontWeight: 900, transform: 'rotate(-6deg)' }}>ARCTIC WHISKY WAR</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
export const PaperScene: React.FC<{ t: number }> = ({ t }) => {
  const p = SC('paper');
  const push = 1 + 0.06 * ramp(t, p.t0, p.t1, linear);
  return (
    <At t0={p.t0} t1={SC('dive').t0 + 0.6} x={0} y={0} w={1080} h={1920} ax={0} ay={0}>
      <W04BurnReveal start={rel(C.ladai2 - 0.15, p.t0)} dur={26}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${push}) rotate(${-1 + 2 * ramp(t, p.t0, p.t1)}deg)` }}>
          <Paper />
          <Sequence from={rel(C.whisky2 - 0.1, p.t0)} layout="none">
            <div style={{ position: 'absolute', left: 0, top: 560, width: 1080, height: 400 }}><W03Highlight w={820} h={120} tilt={-6} /></div>
          </Sequence>
        </div>
      </W04BurnReveal>
    </At>
  );
};

/** A person or prop cutout for the beach: the creator's image, or a drawn stand-in silhouette. */
const Cut: React.FC<{ k: string; fallback: 'person' | 'soldier' | 'heli' | 'letter' }> = ({ k, fallback }) => {
  const im = IMG(k);
  if (im) return <Img src={im.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
  if (fallback === 'heli') return (
    <svg width="100%" height="100%" viewBox="0 0 400 200"><ellipse cx={170} cy={110} rx={120} ry={52} fill="#4B5A3A" /><path d="M 270 100 L 390 92 L 392 110 L 280 124 Z" fill="#4B5A3A" />
      <ellipse cx={110} cy={100} rx={44} ry={28} fill="#9FD7FF" /><path d="M 60 170 H 290 M 100 150 V 170 M 240 150 V 170" stroke="#2A2E26" strokeWidth={8} /><path d="M 0 40 H 360" stroke="#2A2E26" strokeWidth={8} /></svg>
  );
  if (fallback === 'letter') return <svg width="100%" height="100%" viewBox="0 0 300 220"><rect width={300} height={220} rx={6} fill="#F4EEDD" />{[50, 80, 110, 140, 170].map((y) => <path key={y} d={`M 30 ${y} H 260`} stroke="#5A6A9A" strokeWidth={4} opacity={0.6} />)}<circle cx={40} cy={30} r={14} fill="#C8102E" /></svg>;
  const col = fallback === 'soldier' ? '#4E5B3A' : '#1E2A44';
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 520"><circle cx={100} cy={70} r={44} fill="#E2B08C" /><path d="M 40 130 Q 100 110 160 130 L 176 330 L 24 330 Z" fill={col} /><rect x={42} y={326} width={48} height={170} fill="#2A2A2A" /><rect x={110} y={326} width={48} height={170} fill="#2A2A2A" /></svg>
  );
};

/** The Arctic beach (the creator's background, or a drawn stand-in), slowly pushing in. */
const BeachBg: React.FC<{ t: number; t0: number; blur?: number }> = ({ t, t0, blur = 0 }) => {
  const im = IMG('wk01_arctic_beach_bg');
  const s = 1.04 + 0.04 * ramp(t, t0, t0 + 10, linear);
  return (
    <AbsoluteFill style={{ transform: `scale(${s})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      {im ? <Img src={im.src} style={{ width: 1080, height: 1920, objectFit: 'cover' }} /> : (
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #8FA6A8 0%, #B9C8C6 38%, #7FA3AE 46%, #A6B9BC 50%, #7A6B5A 54%, #5E5246 100%)' }} />
      )}
    </AbsoluteFill>
  );
};

/** The three beach scenes: Canada lands (1984), the minister answers, Canada answers back. */
export const BeachScene: React.FC<{ t: number; k: 'beach1' | 'beach2' | 'beach3' }> = ({ t, k }) => {
  const sc = SC(k);
  const POLE: Pt = [600, 1340];
  const noteBlur = (n0: number, n1: number) => 10 * window4(t, n0, n0 + 0.3, n1 - 0.3, n1);
  if (k === 'beach1') {
    // the helicopter lands, two soldiers, the Canadian flag goes in, the whisky bottle
    const h0 = sc.t0;
    return (
      <AbsoluteFill>
        <BeachBg t={t} t0={h0} />
        <At t0={h0} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W13Sticker w={520} h={260} at={[300, 1200]} from={[-400, 200]} spin={-20} land={40} rest={0}><Cut k="wk06_helicopter" fallback="heli" /></W13Sticker></At>
        <At t0={h0 + 0.5} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W13Sticker w={200} h={500} at={[760, 1380]} from={[1300, 1500]} spin={30} rest={2}><Cut k="wk05_canadian_soldier" fallback="soldier" /></W13Sticker></At>
        <At t0={h0 + 0.7} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W13Sticker w={190} h={480} at={[880, 1400]} from={[1400, 1400]} spin={40} rest={-3}><div style={{ width: '100%', height: '100%', transform: 'scaleX(-1)' }}><Cut k="wk05_canadian_soldier" fallback="soldier" /></div></W13Sticker></At>
        <At t0={C.jhanda6 - 0.4} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W14FlagSwap old={null} next="canada" at={POLE} plant={24} /></At>
        <At t0={C.whisky6 - 0.1} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W13Sticker w={170} h={330} at={[470, 1450]} from={[-200, 300]} spin={-280} rest={-8}><Bottle k="wk08_whisky_bottle" /></W13Sticker></At>
      </AbsoluteFill>
    );
  }
  if (k === 'beach2') {
    // the minister: his flag replaces Canada's, the schnapps, the letter, the note
    const n0 = C.danish7 - 0.5, n1 = SC('war').t0;
    return (
      <AbsoluteFill>
        <BeachBg t={t} t0={sc.t0} blur={noteBlur(n0, n1 + 0.4)} />
        <div style={{ position: 'absolute', inset: 0, filter: `blur(${noteBlur(n0, n1 + 0.4)}px)` }}>
          <At t0={sc.t0} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W13Sticker w={230} h={560} at={[800, 1370]} from={[1300, 1200]} spin={30} rest={2}><Cut k="wk04_tom_hoyem" fallback="person" /></W13Sticker></At>
          <At t0={sc.t0} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W14FlagSwap old="canada" next="denmark" at={POLE} yank={rel(C.jhanda7 - 0.3, sc.t0)} plant={rel(C.jhanda7 + 0.3, sc.t0)} /></At>
          <At t0={C.schnapps7 - 0.1} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W13Sticker w={150} h={330} at={[440, 1460]} from={[-200, 300]} spin={-280} rest={-6}><Bottle k="wk07_schnapps_bottle" /></W13Sticker></At>
          <At t0={C.note7 - 0.1} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W13Sticker w={300} h={220} at={[300, 1520]} from={[-300, 1900]} spin={-120} rest={-12}><Cut k="wk09_letter" fallback="letter" /></W13Sticker></At>
        </div>
        <At t0={n0} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}>
          <W15ScriptNote text="Danish Island में आपका स्वागत है" sub="Velkommen til den danske ø" sign={[POLE[0] + 140, POLE[1] - 520]} shrink={rel(n1 - 0.4, n0)} />
        </At>
      </AbsoluteFill>
    );
  }
  // beach3: the tape stops on "नहीं", the soldiers are back, the flag swaps again, a bottle, the note
  const n0 = C.canada9 - 0.15, n1 = SC('montage').t0;
  return (
    <AbsoluteFill>
      <At t0={sc.t0} t1={sc.t0 + 0.7} x={0} y={0} w={1080} h={1920} ax={0} ay={0}>
        <W17TapeStop><BeachBg t={t} t0={sc.t0} /><div style={{ position: 'absolute', left: POLE[0], top: POLE[1] }} /></W17TapeStop>
      </At>
      {t >= sc.t0 + 0.65 && <BeachBg t={t} t0={sc.t0} blur={noteBlur(n0, n1 + 0.3)} />}
      <div style={{ position: 'absolute', inset: 0, filter: `blur(${noteBlur(n0, n1 + 0.3)}px)`, opacity: t >= sc.t0 + 0.65 ? 1 : 0 }}>
        <At t0={sc.t0 + 0.6} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W13Sticker w={520} h={260} at={[280, 1190]} from={[-400, 200]} spin={-20} land={30} rest={0}><Cut k="wk06_helicopter" fallback="heli" /></W13Sticker></At>
        <At t0={C.sainik9 - 0.1} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W13Sticker w={200} h={500} at={[790, 1380]} from={[1300, 1500]} spin={30} rest={2}><Cut k="wk05_canadian_soldier" fallback="soldier" /></W13Sticker></At>
        <At t0={sc.t0 + 0.6} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W14FlagSwap old="denmark" next="canada" at={POLE} yank={rel(C.jhanda9 - 0.25, sc.t0 + 0.6)} plant={rel(C.jhanda9 + 0.35, sc.t0 + 0.6)} /></At>
        <At t0={C.botal9 - 0.2} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}><W13Sticker w={170} h={330} at={[460, 1450]} from={[-200, 300]} spin={-280} rest={-8}><Bottle k="wk08_whisky_bottle" /></W13Sticker></At>
      </div>
      <At t0={n0} t1={sc.t1} x={0} y={0} w={1080} h={1920} ax={0} ay={0}>
        <W15ScriptNote text="Canada में आपका स्वागत है" sign={[POLE[0] + 140, POLE[1] - 520]} shrink={rel(n1 - 0.45, n0)} />
      </At>
    </AbsoluteFill>
  );
};

/** Line 10: the years go by, flags and bottles piling up, on a dark desk like the reference's photo prints. */
export const MontageScene: React.FC<{ t: number }> = ({ t }) => {
  const m = SC('montage');
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #2C2622, #0E0C0B 75%)' }}>
      <At t0={m.t0} t1={m.t1} x={540} y={940} w={1080} h={1080} scale={1.0}><W18Montage dur={rel(m.t1, m.t0)} /></At>
    </AbsoluteFill>
  );
};

/** Line 10: 2022, then the island model split along its ridge, 60% / 40%. */
export const IslandScene: React.FC<{ t: number }> = ({ t }) => {
  const s = SC('island');
  const im = IMG('wk03_hans_island_model');
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #5A5C60, #3A3C40 70%)' }}>
      <At t0={s.t0} t1={C.baant10 + 0.2} x={540} y={760} w={1080} h={500}><W09YearType year="2022" out={rel(C.baant10 - 0.6, s.t0)} /></At>
      <At t0={C.baant10 - 0.5} t1={s.t1} x={540} y={1000} w={1080} h={1080} scale={1.0}>
        <W19IslandSplit img={im ?? undefined} dk={60} ca={40} />
      </At>
      <Big t={t} t0={C.n60_10 - 0.05} t1={s.t1} text="Denmark" x={760} y={1380} size={70} color="#fff" rot={-2} />
      <Big t={t} t0={C.n40_10 - 0.05} t1={s.t1} text="Canada" x={320} y={1380} size={70} color="#fff" rot={-2} />
    </AbsoluteFill>
  );
};

/** Colour flashes on the era changes (the reference's overexposed washes). */
export const Flashes: React.FC = () => (
  <>{[SC('dive').t0, SC('strait').t0, SC('y1984').t0, SC('beach1').t0, SC('heli').t0, SC('war').t0, SC('montage').t0, SC('island').t0, SC('border').t0].map((p, i) => (
    <At key={i} t0={p - 0.27} t1={p + 0.4} x={540} y={960} w={1080} h={1920}><W11ColorFlash peak={16} /></At>
  ))}</>
);

/** The close: two poll chips under the map, Canada and Denmark. */
export const Poll: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Big t={t} t0={C.canada12 - 0.05} t1={DURATION_S} text="Canada?" x={300} y={880} size={66} rot={-3} />
    <Big t={t} t0={C.canada12 + 0.45} t1={DURATION_S} text="Denmark?" x={780} y={880} size={66} rot={3} />
  </>
);

export { SCRIPT, useFonts, PoleFlag };
