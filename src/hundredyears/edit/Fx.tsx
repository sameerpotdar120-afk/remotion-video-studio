import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { BURN, C, CAPS, CUT, Cam, DURATION_S, GAME, PARCH, merc, toScreen } from './cam';
import { HEAD, NUM, SUB } from '../../timezones/fonts';
import { COL } from './regions';
import { M12Whip } from '../../timezones/motion/M12Whip';
import { M16Sparkle } from '../../timezones/motion/M16Sparkle';
import { PP0, Plush } from '../motion/Plush';
import { H01Duel } from '../motion/H01Duel';
import { H02Counter } from '../motion/H02Counter';
import { H03Slam } from '../motion/H03Slam';
import { H04Edward } from '../motion/H04Edward';
import { H05PhilipNo } from '../motion/H05PhilipNo';
import { H06Brawl } from '../motion/H06Brawl';
import { H07Cavalry } from '../motion/H07Cavalry';
import { H08Longbow } from '../motion/H08Longbow';
import { H09Game } from '../motion/H09Game';
import { H10JoanCard } from '../motion/H10JoanCard';
import { H11Voices } from '../motion/H11Voices';
import { H12ArmorUp } from '../motion/H12ArmorUp';
import { H13Shockwave } from '../motion/H13Shockwave';
import { H14PlusOne } from '../motion/H14PlusOne';
import { H15ArrowHit } from '../motion/H15ArrowHit';
import { H16Coronation } from '../motion/H16Coronation';
import { H17Grab } from '../motion/H17Grab';
import { H18Trial } from '../motion/H18Trial';
import { H19Stake } from '../motion/H19Stake';
import { H20Burn } from '../motion/H20Burn';
import { H21Banners } from '../motion/H21Banners';
import { H22Saint } from '../motion/H22Saint';

const FPS = 60;
const STROKE = (w: number, col = '#120a02') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';
type Pt = [number, number];
const S = (c: Cam, lon: number, lat: number): Pt => toScreen(c, merc(lon, lat));
const f60 = (s: number) => Math.round(s * FPS);
const rel = (s: number, at: number) => Math.round((s - at) * FPS);

/** A motion component placed on screen and started at second t0 (its own frame 0); it runs until t1. */
const At: React.FC<{ t0: number; t1: number; x: number; y: number; w: number; h: number; ax?: number; ay?: number; scale?: number; opacity?: number; children: React.ReactNode }> = ({
  t0, t1, x, y, w, h, ax = 0.5, ay = 0.5, scale = 1, opacity = 1, children,
}) => (
  <Sequence from={f60(t0)} durationInFrames={Math.max(1, f60(t1 - t0))} layout="none">
    <div style={{ position: 'absolute', left: x - w * ax, top: y - h * ay, width: w, height: h, transform: `scale(${scale})`, transformOrigin: `${ax * 100}% ${ay * 100}%`, opacity, pointerEvents: 'none' }}>
      {children}
    </div>
  </Sequence>
);

/** Kinetic headline. */
const Big: React.FC<{ t: number; t0: number; t1: number; text: React.ReactNode; x: number; y: number; size?: number; color?: string; font?: string; rot?: number }> = ({ t, t0, t1, text, x, y, size = 110, color = '#fff', font = HEAD, rot = -3 }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 260)) + kick(t, t0 + 0.12, 0.06, 24, 9);
  return (
    <div style={{ position: 'absolute', left: x, top: y + Math.sin((t - t0) * 2.2) * 5, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', textAlign: 'center',
      fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.05, textShadow: `${SHADOW}, 0 0 34px ${color}55`, ...STROKE(size > 150 ? 12 : 9) }}>{text}</div>
  );
};

/** A chip: a small boxed line of text. */
const Chip: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; size?: number; rot?: number; fill?: string; font?: string }> = ({ t, t0, t1, text, x, y, color, size = 52, rot = -2, fill, font = HEAD }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.15, t1);
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y + Math.sin((t - t0) * 2.6) * 4, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${clamp01(pop(t, t0, 8, 260))})`, opacity: a, whiteSpace: 'nowrap', fontFamily: font, fontWeight: 800,
      fontSize: size, color: '#fff', background: fill ?? 'rgba(20,14,8,0.82)', border: `5px solid ${color}`, borderRadius: 16, padding: '6px 26px 0', boxShadow: `${SHADOW}, 0 0 24px ${color}66` }}>{text}</div>
  );
};

/** The reference's calligraphic map label: italic serif small caps with a hand-drawn curved arrow that draws on to the place. */
const Callout: React.FC<{ t: number; t0: number; t1: number; text: string; sub?: string; pin: Pt; dx?: number; dy?: number; rot?: number }> = ({ t, t0, t1, text, sub, pin, dx = 160, dy = -150, rot = -14 }) => {
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const out = ramp(t, t1, t1 + 0.25, easeIn);
  const draw = ramp(t, t0 + 0.15, t0 + 0.6, easeOut) * (1 - out);
  const s = clamp01(pop(t, t0, 9, 240)) * (1 - out);
  const lx = pin[0] + dx, ly = pin[1] + dy;
  const mx = (pin[0] + lx) / 2 + (dy > 0 ? 60 : -60), my = (pin[1] + ly) / 2 + 30;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <path d={`M ${lx - dx * 0.25} ${ly + (dy < 0 ? 40 : -40)} Q ${mx} ${my} ${pin[0] + 8} ${pin[1] - 14}`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" pathLength={1}
          strokeDasharray={`${draw} 1`} style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.8))' }} />
        {draw > 0.95 && <path d={`M ${pin[0] + 8} ${pin[1] - 14} l -2 -26 M ${pin[0] + 8} ${pin[1] - 14} l -24 -8`} stroke="#fff" strokeWidth={6} strokeLinecap="round" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.8))' }} />}
        <circle cx={pin[0]} cy={pin[1]} r={10 * s} fill="#fff" />
      </svg>
      <div style={{ position: 'absolute', left: lx, top: ly, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, whiteSpace: 'nowrap', textAlign: 'center', color: '#fff',
        fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontVariant: 'small-caps', fontWeight: 700, fontSize: 62, lineHeight: 0.95, letterSpacing: 1,
        textShadow: '0 3px 0 rgba(0,0,0,0.5), 0 6px 16px rgba(0,0,0,0.8)' }}>
        {text}{sub && <div style={{ fontSize: 38, fontVariant: 'normal' }}>({sub})</div>}
      </div>
    </>
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
        <span key={q} style={{ color: q === cur ? '#7CFF6B' : HOT.test(w) ? COL.gold : '#fff', display: 'inline-block', transform: `scale(${q === cur ? 1.08 : 1})` }}>{w}&nbsp;</span>
      ))}
    </div>
  );
};

/** The grade: teal shadows and warm highlights (soft light), a vignette, darker edges, grain, flashes on the hits. */
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='256' height='256' filter='url(%23n)'/></svg>")`;
export const Grade: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  let flash = 0;
  for (const h of [C.n17_2 + 0.1, C.n1337_3, C.jaan8, C.n1453_12]) flash = Math.max(flash, window4(t, h - 0.02, h, h + 0.04, h + 0.3));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,70,90,0.2), rgba(0,40,60,0.06) 40%, rgba(255,150,60,0.08) 70%, rgba(255,140,40,0.14))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.3), rgba(0,0,0,0) 20%, rgba(0,0,0,0) 74%, rgba(0,6,12,0.42))' }} />
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'overlay', backgroundImage: GRAIN, backgroundSize: '256px 256px', backgroundPosition: `${(frame * 73) % 256}px ${(frame * 151) % 256}px` }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.3, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};

/** Whips on the cuts. */
const WHIPS = () => [PARCH[1], CUT.field[1], GAME[1], C.longbow5 - 0.35, CUT.village[1], CUT.square[0]];
export const Whips: React.FC = () => (
  <>{WHIPS().map((w, i) => <At key={i} t0={w - 0.22} t1={w + 0.3} x={540} y={960} w={1080} h={1920}><M12Whip dir={i % 2 ? 'right' : 'left'} /></At>)}</>
);

const Hits: React.FC = () => (
  <>{[C.n116_1 + 0.3, C.joan7, C.ghera9, C.charles9, C.n1453_12, C.saint13].map((h, i) => <At key={i} t0={h - 0.05} t1={h + 1.2} x={540} y={760} w={640} h={640} scale={1.3}><M16Sparkle color={i % 2 ? '#FFFFFF' : COL.gold} /></At>)}</>
);

// ================================================================ map beats

/** Map overlays for every map beat; positions follow the camera each frame. */
export const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const ch = S(c, 1.0, 50.2), en = S(c, -1.6, 52.4), fr = S(c, 2.4, 46.9);
  const dom = S(c, 5.6847, 48.4417), orl = S(c, 1.909, 47.903), rei = S(c, 4.032, 49.258), cmp = S(c, 2.826, 49.418), rou = S(c, 1.099, 49.443), lon = S(c, -0.13, 51.51);
  const fl = S(c, 3.2, 50.8), mid = S(c, 2.5, 46.9);
  const joanPin = S(c, 2.2, 48.3);
  return (
    <>
      {/* line 1–2: the duel on the Channel, the counter, Joan's swoop, the stake */}
      <At t0={0.2} t1={PARCH[0]} x={ch[0]} y={ch[1]} w={1080} h={1080} ay={0.83} scale={0.62}>
        <H01Duel swoop={rel(C.n17_2 - 0.1, 0.2)} worry={rel(C.par2, 0.2)} />
      </At>
      <At t0={C.desh1 - 0.3} t1={C.n17_2} x={540} y={520} w={900} h={500}><H02Counter fly={rel(C.rok1 + 0.8, C.desh1 - 0.3)} /></At>
      <Big t={t} t0={C.desh1 + 1.4} t1={C.rok1 + 0.9} text="साल" x={760} y={640} size={90} color="#fff" rot={-4} />
      {t >= C.par2 && t < PARCH[0] && (
        <div style={{ position: 'absolute', left: ch[0] + 120, top: ch[1] - 470, width: 300, height: 392, transform: `scale(${clamp01(pop(t, C.par2, 8, 220))})`, transformOrigin: '50% 100%' }}>
          <Img src={staticFile('hundredyears/img/h04_stake_pyre.png')} style={{ width: 300, height: 392, filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.6))' }} />
        </div>
      )}
      {/* line 3–4 on parchment: 1337, Edward, the French king, the brawl, the title */}
      <At t0={C.n1337_3} t1={C.edward3 + 0.3} x={540} y={760} w={1080} h={700}><H03Slam punch={rel(C.n1337_3 + 1.6, C.n1337_3)} /></At>
      <At t0={C.edward3 - 0.2} t1={C.mana4 + 0.1} x={en[0]} y={en[1] + 280} w={900} h={1100} ay={1} scale={0.6}>
        <H04Edward talk={[rel(C.maa3, C.edward3 - 0.2), rel(C.kyon3 + 0.8, C.edward3 - 0.2)]} flail={rel(C.raja3, C.edward3 - 0.2)} bubble={rel(C.maa3 - 0.2, C.edward3 - 0.2)} />
      </At>
      <At t0={C.mana4 - 0.3} t1={C.zid4 + 0.2} x={fr[0]} y={fr[1] + 260} w={900} h={1100} ay={1} scale={0.6}><H05PhilipNo /></At>
      <At t0={C.zid4} t1={PARCH[1]} x={S(c, 0.8, 49.0)[0]} y={S(c, 0.8, 49.0)[1]} w={900} h={900} scale={0.9}><H06Brawl /></At>
      <Big t={t} t0={C.hundred4 - 0.05} t1={PARCH[1]} text={<><span style={{ color: COL.gold }}>Hundred Years' War</span><br />1337</>} x={540} y={420} size={92} font={NUM} rot={-3} />
      {/* line 6: the game look over France (Null shrugs first, then the chat) */}
      <At t0={GAME[0]} t1={GAME[1]} x={540} y={960} w={1080} h={1920}><H09Game chat={rel(C.khel6 - 1.1, GAME[0])} speed={1.5} /></At>
      {/* line 7: Domrémy, Joan's card */}
      <At t0={C.domremy7 - 0.45} t1={CUT.village[0] + 0.3} x={dom[0]} y={dom[1]} w={900} h={1200} ay={0.92} scale={0.9}>
        <H10JoanCard tag={rel(C.joan7, C.domremy7 - 0.45)} crown={rel(C.shahi7, C.domremy7 - 0.45)} swords={rel(C.fauj7, C.domremy7 - 0.45)} fist={rel(C.yakeen7, C.domremy7 - 0.45)} />
      </At>
      <Callout t={t} t0={C.domremy7 + 0.2} t1={CUT.village[0]} text="Domrémy" pin={dom} dx={-250} dy={-120} rot={-10} />
      {/* line 8–9: the rally, Orléans, the arrow, Reims */}
      {t >= CUT.village[1] && t < C.dushman10 && (
        <div style={{ position: 'absolute', left: joanPin[0] - 70, top: joanPin[1] - 150 + Math.abs(Math.sin(t * 6)) * -8, width: 140, height: 160 }}>
          <svg width={140} height={160}><g transform="translate(70 158) scale(0.13)"><Plush who="joanArmor" f={Math.round(t * 60)} seed="pin" pose={{ ...PP0, mouth: 'grin' }} banner={1} /></g></svg>
        </div>
      )}
      <At t0={C.jaan8} t1={C.jaan8 + 2.0} x={joanPin[0]} y={joanPin[1]} w={1080} h={1080} scale={1.1}><H13Shockwave /></At>
      <Callout t={t} t0={C.orleans9 - 0.1} t1={C.reims9} text="Orléans" sub="1429" pin={orl} dx={-210} dy={-200} rot={-12} />
      <At t0={C.teer9 - 0.3} t1={C.ghera9 - 0.1} x={540} y={1250} w={1080} h={1300} ay={1} scale={0.75}><H15ArrowHit hit={rel(C.teer9 + 0.15, C.teer9 - 0.3)} /></At>
      <At t0={C.ghera9} t1={C.ghera9 + 1.5} x={orl[0] + 40} y={orl[1] - 120} w={500} h={400} scale={0.8}><H14PlusOne /></At>
      <Callout t={t} t0={C.reims9 - 0.05} t1={C.dushman10} text="Reims" sub="1429" pin={rei} dx={200} dy={-210} rot={-12} />
      <At t0={C.reims9 + 0.4} t1={C.reims9 + 1.9} x={rei[0] - 60} y={rei[1] - 140} w={500} h={400} scale={0.7}><H14PlusOne /></At>
      <At t0={C.charles9 - 0.4} t1={C.dushman10 - 0.1} x={rei[0]} y={rei[1] + 40} w={900} h={1200} ay={1} scale={0.42}><H16Coronation crown={rel(C.charles9 + 0.9, C.charles9 - 0.4)} /></At>
      {/* line 10: the English king */}
      {t >= C.dushman10 - 0.2 && t < C.burgundy11 && (
        <div style={{ position: 'absolute', left: en[0] - 200, top: en[1] - 380, width: 400, height: 460, transform: `scale(${clamp01(pop(t, C.dushman10 - 0.2, 8, 220))})`, transformOrigin: '50% 100%' }}>
          <svg width={400} height={460}><g transform="translate(200 450) scale(0.42)">
            <Plush who="edward" f={Math.round(t * 60)} seed="ed2" pose={{ ...PP0, mouth: 'frown', brow: -1, arms: 1, rx: 200, ry: -160 + Math.sin(t * 10) * 40, lx: -200, ly: -160 + Math.cos(t * 10) * 40,
              talk: t > C.dushman10 + 0.3 && t < C.burgundy11 - 0.3 ? Math.max(0, Math.sin(t * 30) * 0.6 + 0.3) : 0 }} />
          </g></svg>
        </div>
      )}
      {/* line 11: Burgundy captures her at Compiègne, sells her; Rouen */}
      <Callout t={t} t0={C.burgundy11 + 0.6} t1={C.rouen11 - 0.2} text="Compiègne" sub="1430" pin={cmp} dx={230} dy={160} rot={-8} />
      <At t0={C.burgundy11 + 0.4} t1={CUT.square[0]} x={540} y={960} w={1080} h={1920}><H17Grab from={fl} at={cmp} to={rou} pay={lon} /></At>
      <Callout t={t} t0={C.rouen11 - 0.1} t1={CUT.square[0] + 0.1} text="Rouen" sub="1431" pin={rou} dx={-220} dy={-180} rot={-12} />
      {/* line 12–13 after the burn: banners, the saint, 1453, the card, the poll */}
      <At t0={BURN[0] + 0.6} t1={DURATION_S} x={mid[0]} y={mid[1]} w={1080} h={1920} scale={0.9}><H21Banners flee={rel(C.n1453_12 - 0.4, BURN[0] + 0.6)} /></At>
      <At t0={C.ummeed12 - 0.5} t1={DURATION_S} x={mid[0] + 40} y={mid[1] - 60} w={900} h={1300} ay={1} scale={0.5}><H22Saint halo={rel(C.saint13, C.ummeed12 - 0.5)} /></At>
      <Big t={t} t0={C.n1453_12 - 0.05} t1={C.church13} text={<><span style={{ color: COL.gold }}>Hundred Years' War</span><br />1337–1453</>} x={540} y={420} size={92} font={NUM} rot={-3} />
      <Chip t={t} t0={C.church13 + 0.1} t1={C.n500_13 + 0.2} text="1431 🔥" x={540} y={330} color="#FF7A3A" size={70} font={NUM} rot={-3} />
      <Chip t={t} t0={C.n500_13 + 0.2} t1={DURATION_S} text="1920 ✨ SAINT" x={540} y={330} color={COL.gold} size={70} font={NUM} rot={-3} />
      <Chip t={t} t0={C.insaaf13} t1={DURATION_S} text="⚖️ इंसाफ़" x={330} y={820} color="#5AD06A" size={60} rot={-4} />
      <Chip t={t} t0={C.dhokha13} t1={DURATION_S} text="🗡️ धोखा" x={760} y={820} color="#FF4A4A" size={60} rot={4} />
      <Hits />
    </>
  );
};

/** The cutaways: the battlefield, the village (opened with an iris from Joan on the map), the town square (burnt away). */
export const Cutaways: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const [f0, f1] = CUT.field, [v0, v1] = CUT.village, [s0, s1] = CUT.square;
  const bg = (name: string, a: number, b: number) => (
    <AbsoluteFill style={{ transform: `scale(${1 + 0.05 * ramp(t, a, b, linear)})` }}>
      <Img src={staticFile(`hundredyears/img/${name}.jpg`)} style={{ width: 1080, height: 1920 }} />
    </AbsoluteFill>
  );
  // the iris opens from Joan's spot on the map
  const dom = toScreen(c, merc(5.6847, 48.4417));
  const iris = ramp(t, v0, v0 + 0.33, easeIn);
  const square = (
    <AbsoluteFill>
      {bg('h03_town_square_bg', s0, s1)}
      {t < C.n19_11 - 0.15 ? (
        <Sequence from={f60(s0)} layout="none"><AbsoluteFill><div style={{ position: 'absolute', left: 0, top: 420, width: 1080, height: 1500 }}><H18Trial talk={[30, rel(C.n19_11 - 0.4, s0)]} ticks={[rel(C.kapde11, s0), rel(C.bhatkaya11, s0)]} /></div></AbsoluteFill></Sequence>
      ) : (
        <>
          <div style={{ position: 'absolute', left: 140, top: 640, width: 800, height: 1046 }}><Img src={staticFile('hundredyears/img/h04_stake_pyre.png')} style={{ width: 800, height: 1046 }} /></div>
          <Sequence from={f60(C.n19_11 - 0.15)} layout="none"><div style={{ position: 'absolute', left: 90, top: 1240 - 1180, width: 900, height: 1400, transform: 'scale(0.72)', transformOrigin: '50% 84.3%' }}><H19Stake /></div></Sequence>
        </>
      )}
    </AbsoluteFill>
  );
  return (
    <>
      {t >= f0 && t < f1 && bg('h02_battlefield_bg', f0, f1)}
      <At t0={f0} t1={C.longbow5 - 0.35} x={540} y={960} w={1080} h={1920}><H07Cavalry rain={rel(C.jaldi5 - 0.2, f0)} /></At>
      <At t0={C.longbow5 - 0.35} t1={f1} x={540} y={960} w={1080} h={1920}><H08Longbow /></At>
      {t >= f0 && t < C.longbow5 - 0.35 && <Chip t={t} t0={C.ghud5} t1={C.longbow5 - 0.4} text="⚔️ CRÉCY 1346" x={540} y={460} color={COL.gold} size={58} font={NUM} rot={-2} />}
      {t >= v0 && t < v1 && (
        <AbsoluteFill style={{ clipPath: iris < 1 ? `circle(${iris * 2300}px at ${dom[0]}px ${dom[1]}px)` : undefined }}>
          {bg('h01_village_bg', v0, v1)}
          <At t0={v0} t1={C.jhande8 - 0.9} x={540} y={1240} w={1080} h={1400} ay={1}><H11Voices talk={[rel(C.upar7, v0), rel(C.bachana7 + 1.0, v0)]} /></At>
          <At t0={C.jhande8 - 0.9} t1={v1} x={540} y={1330} w={1080} h={1500} ay={1}><H12ArmorUp armor={12} horse={rel(C.jhande8 - 0.3, C.jhande8 - 0.9)} banner={rel(C.jhande8 + 0.1, C.jhande8 - 0.9)} /></At>
        </AbsoluteFill>
      )}
      {t >= s0 && t < BURN[0] && square}
      {t >= BURN[0] && t < BURN[1] && (
        <Sequence from={f60(BURN[0])} layout="none"><H20Burn start={0} dur={rel(BURN[1] - 0.1, BURN[0])}>{square}</H20Burn></Sequence>
      )}
    </>
  );
};

export { inOut };
