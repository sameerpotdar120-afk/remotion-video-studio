import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, Cam, DURATION_S, GEO, P, SC, merc, pxPerM, project, toScreen, xOfLon } from './cam';
import { HEAD, NUM, SUB } from './fonts';
import { COL } from './regions';
import sizes from '../../public/timezones/img_sizes.json';
import { M01CircleArrows } from './motion/M01CircleArrows';
import { M02AlarmClock } from './motion/M02AlarmClock';
import { M03ClockBubble } from './motion/M03ClockBubble';
import { M04Steam } from './motion/M04Steam';
import { M05Question } from './motion/M05Question';
import { M06Crack } from './motion/M06Crack';
import { M07RedCross } from './motion/M07RedCross';
import { M08Sunrise } from './motion/M08Sunrise';
import { M09NightSweep } from './motion/M09NightSweep';
import { M10WallClock } from './motion/M10WallClock';
import { M11CommentBubble } from './motion/M11CommentBubble';
import { M12Whip } from './motion/M12Whip';
import { M13TeaLeaves } from './motion/M13TeaLeaves';
import { M14PinPulse } from './motion/M14PinPulse';
import { M15Zzz } from './motion/M15Zzz';
import { M16Sparkle } from './motion/M16Sparkle';

const FPS = 60;
const SZ = sizes as unknown as Record<string, [number, number]>;
const has = (n: string) => !!SZ[n];
const STROKE = (w: number, col = '#120a02') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';
const pl = GEO.places;
const S = (c: Cam, lon: number, lat: number) => toScreen(c, merc(lon, lat));

/** A motion component placed on screen and started at second t0 (its own frame 0); it runs until t1. */
const At: React.FC<{ t0: number; t1: number; x: number; y: number; w: number; h: number; ax?: number; ay?: number; scale?: number; opacity?: number; rot?: number; children: React.ReactNode }> = ({
  t0, t1, x, y, w, h, ax = 0.5, ay = 0.5, scale = 1, opacity = 1, rot = 0, children,
}) => (
  <Sequence from={Math.round(t0 * FPS)} durationInFrames={Math.max(1, Math.round((t1 - t0) * FPS))} layout="none">
    <div style={{ position: 'absolute', left: x - w * ax, top: y - h * ay, width: w, height: h, transform: `rotate(${rot}deg) scale(${scale})`, transformOrigin: `${ax * 100}% ${ay * 100}%`, opacity, pointerEvents: 'none' }}>
      {children}
    </div>
  </Sequence>
);
const fade = (t: number, t0: number, t1: number) => window4(t, t0, t0 + 0.06, t1 - 0.25, t1);

/** A callout: a pin ring on the place, a thin line, and a white-outlined name box (the reference's boxed labels). */
export const Label: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; pin?: P; size?: number }> = ({ t, t0, t1, text, x, y, color, pin, size = 46 }) => {
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const out = ramp(t, t1, t1 + 0.25, easeIn);
  const line = ramp(t, t0 - 0.05, t0 + 0.2, easeOut) * (1 - out);
  const s = clamp01(pop(t, t0 + 0.12, 8, 260)) * (1 - out);
  const ring = clamp01(pop(t, t0 - 0.05, 9, 260)) * (1 - out);
  const bob = Math.sin((t - t0) * 2.4) * 4;
  return (
    <>
      {pin && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <line x1={pin[0]} y1={pin[1]} x2={lerp(pin[0], x, line)} y2={lerp(pin[1], y + bob, line)} stroke="#fff" strokeWidth={4} style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.7))' }} />
          <circle cx={pin[0]} cy={pin[1]} r={20 * ring} fill="none" stroke="#fff" strokeWidth={5} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
          <circle cx={pin[0]} cy={pin[1]} r={8 * ring} fill="#fff" />
        </svg>
      )}
      {s > 0.01 && (
        <div style={{ position: 'absolute', left: x, top: y + bob, transform: `translate(-50%,-50%) scale(${s})`, whiteSpace: 'nowrap', background: 'rgba(8,16,26,0.72)', color: '#fff',
          padding: '8px 24px 2px 20px', borderRadius: 10, border: '4px solid #fff', fontFamily: NUM, fontSize: size, letterSpacing: 1.5,
          boxShadow: `0 8px 22px rgba(0,0,0,0.55), 0 0 18px ${color}66`, lineHeight: 1.15, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: color, display: 'inline-block', marginTop: -6, boxShadow: `0 0 10px ${color}` }} />{text}
        </div>
      )}
    </>
  );
};

/** Kinetic headline. */
const Big: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; size?: number; color?: string; font?: string; rot?: number }> = ({ t, t0, t1, text, x, y, size = 110, color = '#fff', font = HEAD, rot = -3 }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 260)) + kick(t, t0 + 0.12, 0.06, 24, 9);
  const bob = Math.sin((t - t0) * 2.2) * 5;
  return (
    <div style={{ position: 'absolute', left: x, top: y + bob, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', textAlign: 'center',
      fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.1, textShadow: `${SHADOW}, 0 0 34px ${color}55`, ...STROKE(size > 150 ? 12 : 9) }}>{text}</div>
  );
};

/** A chip: a small boxed line of text. */
const Chip: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; size?: number; rot?: number; fill?: string; font?: string }> = ({ t, t0, t1, text, x, y, color, size = 52, rot = -2, fill, font = HEAD }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 8, 260));
  const bob = Math.sin((t - t0) * 2.6) * 4;
  return (
    <div style={{ position: 'absolute', left: x, top: y + bob, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', fontFamily: font, fontWeight: 800, fontSize: size,
      color: '#fff', background: fill ?? 'rgba(8,16,26,0.82)', border: `5px solid ${color}`, borderRadius: 16, padding: '6px 26px 0', boxShadow: `${SHADOW}, 0 0 24px ${color}66` }}>{text}</div>
  );
};

/** A rolling counter. */
const Counter: React.FC<{ t: number; t0: number; t1: number; to: number; x: number; y: number; size?: number; color?: string; pre?: string; post?: string; dur?: number; comma?: boolean; from?: number }> = ({
  t, t0, t1, to, x, y, size = 160, color = COL.gold, pre = '', post = '', dur = 0.8, comma, from = 0,
}) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.2, t1);
  if (a <= 0) return null;
  const v = Math.round(lerp(from, to, ramp(t, t0, t0 + dur, easeOut)));
  const s = clamp01(pop(t, t0, 10, 240)) * (1 + kick(t, t0 + dur, 0.08, 26, 9));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, textAlign: 'center', whiteSpace: 'nowrap',
      fontFamily: NUM, fontSize: size, color, lineHeight: 1, letterSpacing: 2, textShadow: `${SHADOW}, 0 0 30px ${color}66`, ...STROKE(8) }}>
      {pre}{comma ? v.toLocaleString('en-US') : v}<span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: size * 0.45 }}>{post}</span>
    </div>
  );
};

/** One of the creator's cut-outs (img/<name>.png), or a soft placeholder until it arrives. */
const Pic: React.FC<{ name: string; w: number; h: number; style?: React.CSSProperties }> = ({ name, w, h, style }) =>
  has(name)
    ? <Img src={staticFile(`timezones/img/${name}.png`)} style={{ width: w, height: h, objectFit: 'contain', ...style }} />
    : <div style={{ width: w, height: h, borderRadius: 24, background: 'linear-gradient(160deg, rgba(255,255,255,0.35), rgba(255,255,255,0.08))', border: '3px dashed rgba(255,255,255,0.7)', ...style }} />;

/** A round avatar badge (the reference's character bubbles): pops in, bobs, squashes as it talks; an optional rigged arm. */
const Avatar: React.FC<{ t: number; t0: number; t1: number; name: string; x: number; y: number; r?: number; ring?: string; arm?: string; armAt?: [number, number]; armRot?: (t: number) => number; children?: React.ReactNode }> = ({
  t, t0, t1, name, x, y, r = 150, ring = '#fff', arm, armAt = [0.62, 0.62], armRot, children,
}) => {
  if (t < t0 - 0.02 || t > t1 + 0.3) return null;
  const s = clamp01(pop(t, t0, 8, 240)) * (1 - ramp(t, t1, t1 + 0.22, easeIn));
  const bob = Math.sin((t - t0) * 3.1) * 6;
  const squash = 1 + Math.sin((t - t0) * 9) * 0.015;
  return (
    <div style={{ position: 'absolute', left: x - r, top: y - r + bob, width: r * 2, height: r * 2, transform: `scale(${s * squash}, ${s / squash})`, transformOrigin: '50% 90%' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', background: 'radial-gradient(circle at 40% 30%, #e9f3ff, #8fb3d9)', border: `9px solid ${ring}`,
        boxShadow: `0 16px 30px rgba(0,0,0,0.5), 0 0 24px ${ring}88` }}>
        <Pic name={name} w={r * 2} h={r * 2} style={{ position: 'absolute', left: 0, top: r * 0.08 }} />
      </div>
      {arm && (
        <div style={{ position: 'absolute', left: r * 2 * armAt[0] - r * 0.6, top: r * 2 * armAt[1] - r * 0.6, width: r * 1.2, height: r * 1.2, transformOrigin: '50% 90%',
          transform: `rotate(${armRot ? armRot(t - t0) : 0}deg)` }}>
          <Pic name={arm} w={r * 1.2} h={r * 1.2} />
        </div>
      )}
      {children}
    </div>
  );
};

/** Whip transitions on the cuts. */
const WHIPS = () => [SC.greenwich, SC.india, SC.india2, SC.assam, SC.nepal, SC.garden - 0.05];
export const Whips: React.FC<{ t: number }> = () => (
  <>{WHIPS().map((w, i) => <At key={i} t0={w - 0.22} t1={w + 0.3} x={540} y={960} w={1080} h={1920}><M12Whip dir={i % 2 ? 'right' : 'left'} /></At>)}</>
);

/** Sparkle hits on the punches. */
const HITS = () => [C.n24_1, C.greenwich2, C.utc2, C.ist3, C.france8, C.n12_8, C.beijing9, C.n4_10, C.n15_12, C.n2_13];
const Hits: React.FC = () => <>{HITS().map((h, i) => <At key={i} t0={h - 0.05} t1={h + 1.2} x={540} y={760} w={640} h={640} scale={1.4}><M16Sparkle color={i % 2 ? '#FFFFFF' : COL.gold} /></At>)}</>;

/** The grade: teal shadows and warm highlights (soft light), a vignette, darker edges, grain, and flashes on the hits. */
export const Grade: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  let flash = 0;
  for (const h of [C.kat5, C.mod7, C.france8, C.beijing9, C.n2_13]) flash = Math.max(flash, window4(t, h - 0.02, h, h + 0.04, h + 0.3));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,70,90,0.24), rgba(0,40,60,0.08) 40%, rgba(255,150,60,0.08) 70%, rgba(255,140,40,0.14))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.32), rgba(0,0,0,0) 20%, rgba(0,0,0,0) 74%, rgba(0,6,12,0.45))' }} />
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'overlay', backgroundImage: GRAIN, backgroundSize: '256px 256px', backgroundPosition: `${(frame * 73) % 256}px ${(frame * 151) % 256}px` }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.3, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='256' height='256' filter='url(%23n)'/></svg>")`;

/** Subtitles: Mukta ExtraBold, karaoke (the spoken word lights green), English names and numbers in gold. */
const HOT = /^[+\-−0-9,.~%:]+|^[A-Za-z]/;
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
  const words = text.split(' ');
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

// ================================================================ beats

/** Hook: the call-out circles on the two messy clusters, the alarm clock, and night taking half the screen. */
const Hook: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Big t={t} t0={C.n24_1 - 0.05} t1={C.seedhi1 - 0.1} text="24" x={540} y={1380} size={260} color={COL.gold} font={NUM} rot={-4} />
    <Chip t={t} t0={C.n24_1 + 0.25} t1={C.seedhi1 - 0.1} text="TIME ZONES" x={540} y={1560} color={COL.cyan} size={60} font={NUM} />
    <At t0={C.seedhi1 - 0.1} t1={C.kyon1 + 0.2} x={560} y={900} w={800} h={800} scale={1.05}><M01CircleArrows /></At>
    <At t0={C.kyon1 + 0.2} t1={C.ghadi1 - 0.05} x={540} y={940} w={800} h={800} scale={0.95}><M01CircleArrows /></At>
    <At t0={C.ghadi1 - 0.15} t1={SC.greenwich} x={540} y={1300} w={600} h={700} scale={0.75}><M02AlarmClock h={6} m={0} /></At>
    <At t0={C.subah1 - 0.2} t1={SC.greenwich} x={540} y={960} w={1080} h={1920}><M09NightSweep from="left" cover={0.5} /></At>
  </>
);

/** Greenwich: the pin, the observatory, the red meridian, the 0 UTC badge and the typed name. */
const GreenwichFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const g = toScreen(c, pl.greenwich);
  const typed = Math.floor(ramp(t, C.utc2 + 0.05, C.utc2 + 0.9, linear) * 27);
  const ua = fade(t, C.utc2, SC.offsets + 0.6);
  return (
    <>
      <Label t={t} t0={C.greenwich2 - 0.05} t1={C.yahin2 + 0.2} text="GREENWICH" x={g[0] + 120} y={g[1] - 300} color={COL.red} pin={g} size={50} />
      {t > C.greenwich2 && t < C.yahin2 + 0.3 && (
        <div style={{ position: 'absolute', left: g[0] - 420, top: g[1] - 520, opacity: fade(t, C.greenwich2 + 0.1, C.yahin2 + 0.3), transform: `scale(${clamp01(pop(t, C.greenwich2 + 0.1, 9, 230))}) translateY(${Math.sin(t * 2) * 6}px)` }}>
          <Pic name="a11_greenwich_observatory" w={300} h={300} style={{ filter: 'drop-shadow(0 16px 20px rgba(0,0,0,0.55))' }} />
        </div>
      )}
      <Chip t={t} t0={C.zero2 - 0.05} t1={SC.offsets + 0.6} text="0 UTC" x={540} y={330} color="#fff" fill="#2F63FF" size={70} font={NUM} rot={0} />
      {ua > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', opacity: ua, fontFamily: NUM, fontSize: 54, letterSpacing: 1.5, color: '#fff',
          textShadow: '0 0 18px #B36BFF, 0 0 36px #8A3BFF, 0 4px 8px rgba(0,0,0,0.6)' }}>
          ({'Coordinated Universal Time'.slice(0, typed)}{typed < 27 && Math.floor(t * 6) % 2 ? '|' : ''})
        </div>
      )}
    </>
  );
};

/** Offsets: east forward, west back, India +5:30. */
const OffsetsFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const ind = toScreen(c, pl.india_mid);
  return (
    <>
      <Chip t={t} t0={C.poorab3 - 0.05} t1={C.paschim3 - 0.1} text="पूरब ➜ घड़ी आगे" x={720} y={1420} color={COL.cyan} size={58} rot={-2} />
      <Chip t={t} t0={C.paschim3 - 0.05} t1={SC.india - 0.05} text="घड़ी पीछे ⬅ पश्चिम" x={360} y={1420} color={COL.red} size={58} rot={2} />
      <Label t={t} t0={C.india3 + 0.05} t1={SC.whatif + 0.2} text="INDIA" x={ind[0] - 230} y={ind[1] - 420} color={COL.india} pin={ind} size={50} />
      <Big t={t} t0={C.ist3 - 0.05} t1={SC.whatif + 0.3} text="+5:30" x={ind[0] + 150} y={ind[1] + 30} size={190} color={COL.gold} font={NUM} rot={-4} />
      <Chip t={t} t0={C.saadhe3 - 0.05} t1={SC.whatif + 0.3} text="साढ़े 5 घंटे आगे" x={ind[0] + 150} y={ind[1] + 190} color={COL.india} size={52} />
      <At t0={C.kya4 - 0.1} t1={SC.mirzapur + 0.2} x={540} y={1250} w={400} h={520} scale={0.9}><M05Question /></At>
    </>
  );
};

/** Mirzapur: the IST line, the town split in two, and the two friends. */
const MirzapurFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const mz = toScreen(c, pl.mirzapur), vd = toScreen(c, pl.vindhyachal);
  const [lx] = toScreen(c, [xOfLon(82.5), pl.mirzapur[1]]);
  const split = fade(t, C.kat5 - 0.05, SC.borders + 0.2);
  const crawl = (t * 40) % 56;
  const gap = ramp(t, C.kat5, C.kat5 + 0.5, easeOut) * 14 + Math.sin(t * 2.4) * 3;
  return (
    <>
      <Chip t={t} t0={C.ist5 - 0.05} t1={SC.borders + 0.2} text="IST 82.5°E" x={540} y={300} color={COL.yellow} size={56} font={NUM} rot={0} />
      <Label t={t} t0={C.mirzapur5 - 0.05} t1={C.seedhi5 + 0.3} text="MIRZAPUR" x={mz[0] + 210} y={mz[1] - 260} color={COL.red} pin={mz} size={52} />
      <At t0={C.mirzapur5 - 0.05} t1={C.seedhi5 + 0.4} x={mz[0]} y={mz[1]} w={420} h={420} scale={0.7}><M14PinPulse color={COL.red} /></At>
      {split > 0 && (
        <>
          {/* the two halves: yellow stripes west (+5), cyan stripes east (+6), crawling; a little gap opens at the crack */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: lx - gap, height: 1920, opacity: split * 0.5,
            background: `repeating-linear-gradient(45deg, rgba(255,225,26,0.85) ${crawl}px, rgba(255,225,26,0.85) ${crawl + 26}px, rgba(255,225,26,0) ${crawl + 26}px, rgba(255,225,26,0) ${crawl + 56}px)`,
            WebkitMaskImage: `radial-gradient(ellipse 620px 520px at ${lx}px ${mz[1]}px, #000 60%, transparent 100%)` }} />
          <div style={{ position: 'absolute', left: lx + gap, top: 0, right: 0, height: 1920, opacity: split * 0.5,
            background: `repeating-linear-gradient(45deg, rgba(54,214,255,0.85) ${crawl}px, rgba(54,214,255,0.85) ${crawl + 26}px, rgba(54,214,255,0) ${crawl + 26}px, rgba(54,214,255,0) ${crawl + 56}px)`,
            WebkitMaskImage: `radial-gradient(ellipse 620px 520px at ${-gap}px ${mz[1]}px, #000 60%, transparent 100%)` }} />
        </>
      )}
      <At t0={C.kat5 - 0.05} t1={SC.borders + 0.2} x={lx} y={960} w={360} h={1600} scale={1.2}><M06Crack /></At>
      <Chip t={t} t0={C.kat5 + 0.2} t1={SC.borders + 0.2} text="+5" x={Math.max(120, lx - 190)} y={560} color={COL.yellow} size={90} font={NUM} rot={-3} />
      <Chip t={t} t0={C.kat5 + 0.32} t1={SC.borders + 0.2} text="+6" x={Math.min(950, lx + 190)} y={560} color={COL.cyan} size={90} font={NUM} rot={3} />
      <Label t={t} t0={C.mirzapur5b} t1={C.gali6 - 0.1} text="VINDHYACHAL" x={vd[0] - 40} y={vd[1] + 230} color={COL.yellow} pin={vd} size={40} />
      {t > C.mirzapur5b - 0.1 && t < C.gali6 && (
        <div style={{ position: 'absolute', left: mz[0] - 120, top: mz[1] - 330, opacity: fade(t, C.mirzapur5b, C.gali6), transform: `scale(${clamp01(pop(t, C.mirzapur5b, 9, 230))}) translateY(${Math.sin(t * 2) * 6}px)` }}>
          <Pic name="a10_mirzapur_clock_tower" w={240} h={240} style={{ filter: 'drop-shadow(0 16px 20px rgba(0,0,0,0.55))' }} />
        </div>
      )}
      {/* the two lanes: 5 o'clock on the west side, 6 on the east */}
      <Avatar t={t} t0={C.gali6 - 0.05} t1={SC.borders + 0.1} name="a01_chai_friend_body" x={200} y={1250} r={150} ring={COL.yellow}
        arm="a01_chai_friend_arm" armAt={[0.7, 0.72]} armRot={(d) => Math.sin(d * 2.2) * 6 - 4}>
        <div style={{ position: 'absolute', left: 190, top: 40, width: 150, height: 210 }}><At t0={C.gali6} t1={SC.borders + 0.1} x={75} y={105} w={300} h={420} scale={0.5}><M04Steam /></At></div>
      </Avatar>
      <At t0={C.five6 - 0.1} t1={SC.borders + 0.1} x={250} y={950} w={700} h={560} scale={0.55}><M03ClockBubble h={5} tail="left" /></At>
      <Avatar t={t} t0={C.bagal6 - 0.05} t1={SC.borders + 0.1} name="a02_confused_friend_body" x={820} y={1250} r={150} ring={COL.cyan}
        arm="a02_confused_friend_hand" armAt={[0.3, 0.18]} armRot={(d) => Math.sin(d * 7) * 8} />
      <At t0={C.six6 - 1.25} t1={SC.borders + 0.1} x={790} y={950} w={700} h={560} scale={0.55}><M03ClockBubble h={5} flip tail="right" /></At>
    </>
  );
};

/** The fix: every border draws on in white and locks with a flash. */
const BordersFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const a = window4(t, C.seema7 - 0.15, C.seema7 + 0.1, SC.france + 0.2, SC.france + 0.8);
  if (a <= 0) return null;
  const draw = ramp(t, C.seema7 - 0.1, C.mod7 + 0.1, inOut);
  const d = GEO.borders.map((r) => r.map((pt, i) => { const [x, y] = project(c, pt[0], pt[1]); return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); }).join('') + 'Z').join('');
  const lock = window4(t, C.mod7 - 0.05, C.mod7, C.mod7 + 0.1, C.mod7 + 0.5);
  return (
    <path d={d} fill="none" stroke="#fff" strokeWidth={2.2 + 3 * lock} strokeOpacity={0.9 * a} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`}
      style={{ filter: `drop-shadow(0 0 ${4 + 10 * lock}px #9fe3ff)` }} />
  );
};

/** France: ✕ on Russia and America, France, its territories round the world, and the counter to 12. */
const FranceFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const ru = toScreen(c, pl.moscow), us = toScreen(c, pl.washington), pa = toScreen(c, pl.paris);
  const dots = window4(t, C.dweep8 - 0.1, C.dweep8 + 0.3, SC.china - 0.4, SC.china);
  return (
    <>
      <Label t={t} t0={C.russia8} t1={C.france8 - 0.2} text="RUSSIA · 11" x={540} y={560} color={COL.russia} size={50} />
      <At t0={C.russia8 + 0.35} t1={C.france8 - 0.1} x={540} y={900} w={520} h={520} scale={0.9}><M07RedCross /></At>
      <Label t={t} t0={C.america8} t1={C.france8 - 0.2} text="USA · 11" x={540} y={560} color={COL.usa} size={50} />
      <At t0={C.america8 + 0.55} t1={C.france8 - 0.1} x={540} y={900} w={520} h={520} scale={0.9}><M07RedCross /></At>
      <Label t={t} t0={C.france8 + 0.2} t1={C.dweep8 + 0.3} text="FRANCE" x={pa[0] + 190} y={pa[1] - 330} color={COL.france} pin={pa} size={56} />
      {dots > 0 && GEO.france_zones.map((f, i) => {
        const [x, y] = toScreen(c, f.at);
        const s = clamp01(pop(t, C.dweep8 + i * 0.06, 8, 260)) * dots;
        return (
          <div key={f.name} style={{ position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, transform: `scale(${s * (1 + 0.15 * Math.sin(t * 6 + i))})`,
            background: 'radial-gradient(circle, #fff 0 25%, #FFD84A 30% 60%, rgba(255,216,74,0) 70%)', boxShadow: '0 0 22px #FFD84A' }} />
        );
      })}
      <Counter t={t} t0={C.n12_8 - 0.75} t1={SC.china - 0.1} to={12} from={1} x={540} y={1330} size={230} dur={0.75} />
      <Chip t={t} t0={C.n12_8 + 0.1} t1={SC.china - 0.1} text="TIME ZONES" x={540} y={1500} color={COL.gold} size={58} font={NUM} rot={0} />
    </>
  );
};

/** China: five dashed zones squeeze into one, Beijing Time, then Kashgar waiting for the sun. */
const ChinaFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const five = window4(t, C.n5_9 - 0.1, C.n5_9 + 0.3, C.beijing9, C.beijing9 + 0.3);
  const squeeze = ramp(t, C.ghadi9 - 0.1, C.beijing9 - 0.1, inOut);
  const ks = toScreen(c, pl.kashgar);
  const [cx] = toScreen(c, [xOfLon(120), 0]);
  const top = toScreen(c, merc(100, 56))[1], bot = toScreen(c, merc(100, 14))[1];
  return (
    <>
      {five > 0 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: five }}>
          {[5, 6, 7, 8, 9].map((n, i) => {
            const [x0] = toScreen(c, [xOfLon(n * 15 - 7.5), 0]);
            const [x1] = toScreen(c, [xOfLon(n * 15 + 7.5), 0]);
            const slide = ramp(t, C.n5_9 - 0.1 + i * 0.07, C.n5_9 + 0.25 + i * 0.07, easeOut);
            const xa = lerp(x0, cx - (cx - x0) * 0.2, squeeze), xb = lerp(x1, cx + (x1 - cx) * 0.2, squeeze);
            const yb = lerp(top, bot, slide);
            return (
              <g key={n}>
                <rect x={xa} y={top} width={Math.max(0, xb - xa)} height={Math.max(0, yb - top)} fill="#2F63FF" fillOpacity={i % 2 ? 0.28 : 0.4} />
                <line x1={xa} y1={top} x2={xa} y2={yb} stroke="#fff" strokeWidth={4} strokeDasharray="14 10" strokeDashoffset={-t * 40} />
                <line x1={xb} y1={top} x2={xb} y2={yb} stroke="#fff" strokeWidth={4} strokeDasharray="14 10" strokeDashoffset={-t * 40} />
                <text x={(xa + xb) / 2} y={top - 24} textAnchor="middle" fontFamily={NUM} fontSize={56} fill="#FFE53B" stroke="#2a1d00" strokeWidth={3} paintOrder="stroke">+{n}</text>
              </g>
            );
          })}
        </svg>
      )}
      <Label t={t} t0={C.china9 + 0.1} t1={C.n5_9 - 0.1} text="CHINA" x={540} y={560} color={COL.china} size={58} />
      <Chip t={t} t0={C.beijing9 - 0.05} t1={C.kashgar9 + 0.1} text="BEIJING TIME · UTC+8" x={540} y={1420} color="#2F7BFF" size={60} font={NUM} rot={0} />
      <Label t={t} t0={C.kashgar9 + 0.15} t1={SC.india2} text="KASHGAR" x={ks[0] + 200} y={ks[1] - 320} color={COL.yellow} pin={ks} size={52} />
      <At t0={C.sardi9 - 0.2} t1={SC.india2} x={540} y={960} w={1080} h={1920}><M09NightSweep from="left" cover={0.9} /></At>
      <At t0={C.sardi9 + 0.1} t1={SC.india2} x={540} y={1530} w={1000} h={1000} scale={1.05}><M08Sunrise peek /></At>
      <At t0={C.n10_9 - 0.35} t1={SC.india2} x={300} y={1150} w={600} h={700} scale={0.62}><M02AlarmClock h={10} m={0} /></At>
      <Chip t={t} t0={C.n10_9 + 0.1} t1={SC.india2} text="10:00 AM" x={300} y={1420} color={COL.yellow} size={62} font={NUM} rot={-2} />
      <Avatar t={t} t0={C.sardi9 + 0.2} t1={SC.india2} name="a03_kashgar_sleepy" x={780} y={1170} r={150} ring="#9fb7ff">
        <div style={{ position: 'absolute', left: 220, top: -150, width: 180, height: 230 }}><At t0={C.sardi9 + 0.2} t1={SC.india2} x={90} y={115} w={360} h={460} scale={0.5}><M15Zzz /></At></div>
      </Avatar>
    </>
  );
};

/** India: one clock across ~3,000 km; the 4 AM sun in Arunachal, Gujarat still asleep. */
const IndiaFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const w = toScreen(c, merc(68.2, 23.4)), e = toScreen(c, merc(97.3, 23.4));
  const line = window4(t, C.n3000_10 - 0.2, C.n3000_10 + 0.5, C.arunachal10 - 0.1, C.arunachal10 + 0.2);
  const draw = ramp(t, C.n3000_10 - 0.2, C.n3000_10 + 0.5, inOut);
  const ar = toScreen(c, merc(94.5, 28.0)), gj = toScreen(c, merc(71.2, 22.7));
  return (
    <>
      {line > 0 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: line }}>
          <line x1={w[0]} y1={w[1]} x2={lerp(w[0], e[0], draw)} y2={lerp(w[1], e[1], draw)} stroke="#fff" strokeWidth={7} strokeDasharray="22 12" strokeDashoffset={-t * 60}
            style={{ filter: 'drop-shadow(0 0 8px #FFD84A)' }} />
          {[w, e].map(([x, y], i) => <line key={i} x1={x} y1={y - 34} x2={x} y2={y + 34} stroke="#fff" strokeWidth={7} opacity={i ? draw : 1} />)}
        </svg>
      )}
      <Counter t={t} t0={C.n3000_10 - 0.1} t1={C.arunachal10} to={3000} x={540} y={(w[1] + e[1]) / 2 - 120} size={130} pre="~" post=" KM" comma dur={0.8} />
      <At t0={C.ghadi10 - 0.15} t1={C.arunachal10 + 0.1} x={540} y={1360} w={600} h={600} scale={0.55}><M10WallClock h={5} m={30} add={0} /></At>
      <Chip t={t} t0={C.ghadi10} t1={C.arunachal10 + 0.1} text="एक ही घड़ी: IST" x={540} y={1560} color={COL.india} size={54} rot={0} />
      <Label t={t} t0={C.arunachal10 + 0.25} t1={C.gujarat10 - 0.1} text="ARUNACHAL" x={ar[0] - 120} y={ar[1] - 330} color={COL.arunachal} pin={ar} size={48} />
      <At t0={C.arunachal10 + 0.1} t1={C.gujarat10 - 0.05} x={ar[0] + 180} y={ar[1] - 40} w={1000} h={1000} scale={0.95}><M08Sunrise /></At>
      <Avatar t={t} t0={C.n4_10 - 0.25} t1={C.gujarat10 - 0.1} name="a04_arunachal_awake" x={300} y={1240} r={150} ring={COL.arunachal} />
      <Chip t={t} t0={C.n4_10 - 0.05} t1={C.gujarat10 - 0.1} text="4:00 AM ☀️" x={300} y={1470} color={COL.arunachal} size={62} font={NUM} />
      <At t0={C.gujarat10 - 0.15} t1={SC.assam} x={540} y={960} w={1080} h={1920}><M09NightSweep from="left" cover={0.8} /></At>
      <Label t={t} t0={C.gujarat10 + 0.4} t1={SC.assam - 0.1} text="GUJARAT" x={gj[0] + 150} y={gj[1] - 320} color={COL.gujarat} pin={gj} size={48} />
      <Avatar t={t} t0={C.n6_10 - 0.25} t1={SC.assam - 0.1} name="a05_gujarat_sleeping" x={780} y={1240} r={150} ring={COL.gujarat}>
        <div style={{ position: 'absolute', left: 220, top: -150, width: 180, height: 230 }}><At t0={C.n6_10 - 0.25} t1={SC.assam} x={90} y={115} w={360} h={460} scale={0.5}><M15Zzz /></At></div>
      </Avatar>
      <Chip t={t} t0={C.n6_10 - 0.05} t1={SC.assam - 0.1} text="6 बजे के बाद" x={780} y={1470} color={COL.gujarat} size={56} />
    </>
  );
};

/** Assam on the map (the garden cutaway is its own scene). */
const AssamFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const a = toScreen(c, merc(92.9, 26.3));
  return (
    <>
      <Label t={t} t0={C.assam11 + 0.1} t1={SC.garden} text="ASSAM" x={a[0] - 60} y={a[1] - 330} color={COL.assam} pin={a} size={52} />
      <At t0={C.assam11} t1={SC.garden} x={540} y={960} w={1080} h={1920} opacity={0.85}><M13TeaLeaves /></At>
    </>
  );
};

/** The tea-garden cutaway: background, the picker, a parallax row of bushes, drifting leaves, the clock jumping an hour. */
export const Garden: React.FC<{ t: number }> = ({ t }) => {
  if (t < SC.garden - 0.01 || t > SC.gardenEnd + 0.01) return null;
  const p = ramp(t, SC.garden, SC.gardenEnd, linear);
  const inn = ramp(t, SC.garden, SC.garden + 0.22, easeOut);
  const out = ramp(t, SC.gardenEnd - 0.2, SC.gardenEnd, easeIn);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', transform: `translateX(${(1 - inn) * 1080 - out * 1080}px)`, filter: inn < 1 || out > 0 ? `blur(${Math.max(1 - inn, out) * 14}px)` : undefined }}>
      {has('a07_tea_garden_bg')
        ? <Img src={staticFile('timezones/img/a07_tea_garden_bg.png')} style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${lerp(1.04, 1.14, p)}) translateX(${lerp(-20, 20, p)}px)` }} />
        : <AbsoluteFill style={{ background: 'linear-gradient(180deg, #ffb46b 0%, #ffd9a0 22%, #9fd28b 40%, #3f8f3a 70%, #1f5a24 100%)' }} />}
      <div style={{ position: 'absolute', left: lerp(560, 520, p), top: 760, transform: `translateY(${Math.sin(t * 2) * 5}px)` }}>
        <Pic name="a09_tea_picker" w={420} h={760} style={{ filter: 'drop-shadow(0 20px 26px rgba(0,0,0,0.45))' }} />
      </div>
      <div style={{ position: 'absolute', left: lerp(-120, -260, p), top: 1380, width: 1500 }}>
        <Pic name="a08_tea_bushes_fg" w={1500} h={840} style={{ filter: 'blur(1.5px)' }} />
      </div>
      <At t0={SC.garden} t1={SC.gardenEnd} x={540} y={960} w={1080} h={1920}><M13TeaLeaves /></At>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)' }} />
      <At t0={C.alag11 - 0.2} t1={SC.gardenEnd} x={540} y={560} w={600} h={600} scale={0.8}><M10WallClock h={6} m={0} add={60} arc="#3BE07A" /></At>
      <Chip t={t} t0={C.bagaan11 - 0.05} t1={SC.gardenEnd} text="बागान टाइम" x={540} y={880} color={COL.assam} size={78} rot={-2} />
      <Chip t={t} t0={C.n1_11 - 0.1} t1={SC.gardenEnd} text="IST + 1 घंटा" x={540} y={1010} color={COL.gold} size={56} rot={2} />
    </AbsoluteFill>
  );
};

/** Nepal: the friend with the watch, the clock ticking 15 minutes on, +5:45. */
const NepalFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const n = toScreen(c, pl.kathmandu);
  return (
    <>
      <Label t={t} t0={C.nepal12 + 0.1} t1={SC.close} text="NEPAL" x={n[0] + 120} y={n[1] - 300} color={COL.nepal} pin={n} size={52} />
      <Avatar t={t} t0={C.mazedar12 - 0.1} t1={SC.close} name="a06_nepal_friend_body" x={250} y={1230} r={140} ring={COL.nepal}
        arm="a06_nepal_friend_arm" armAt={[0.66, 0.7]} armRot={(d) => Math.sin(d * 5) * 5} />
      <At t0={C.n15_12 - 0.9} t1={SC.close} x={790} y={1180} w={600} h={600} scale={0.55}><M10WallClock h={5} m={30} add={15} arc="#FF4D6D" /></At>
      <Chip t={t} t0={C.n15_12 + 0.15} t1={SC.close} text="+5:45 😂" x={790} y={1370} color={COL.nepal} size={66} font={NUM} rot={-3} />
    </>
  );
};

/** The close: India's two halves (the proposal) and the comment card. */
const CloseFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const wi = toScreen(c, merc(78, 22)), ea = toScreen(c, merc(93.5, 25.8));
  return (
    <>
      <Chip t={t} t0={C.india13 + 0.1} t1={DURATION_S} text="+5:30" x={wi[0]} y={wi[1]} color={COL.india} size={64} font={NUM} rot={-2} />
      <Chip t={t} t0={C.n2_13 + 0.05} t1={DURATION_S} text="+6:30 ?" x={Math.min(900, ea[0])} y={ea[1] - 40} color={COL.indiaEast} size={64} font={NUM} rot={3} />
      <Chip t={t} t0={C.n2_13 + 0.25} t1={DURATION_S} text="प्रस्ताव" x={Math.min(900, ea[0])} y={ea[1] + 70} color={COL.indiaEast} size={40} rot={3} />
      <At t0={C.haan13 - 0.35} t1={DURATION_S} x={540} y={740} w={900} h={620} scale={0.55}>
        <M11CommentBubble />
      </At>
      {/* हाँ / ना under the two buttons (the card's buttons sit at x 270 and 630, y 330 of its 900×620 box) */}
      {[['हाँ', 270, 0.2], ['ना', 630, 0.3]].map(([w, bx, d]) => {
        const a = ramp(t, C.haan13 - 0.35 + (d as number), C.haan13 - 0.15 + (d as number), easeOut);
        if (a <= 0) return null;
        const x = 540 + ((bx as number) - 450) * 0.55, y = 740 + (330 - 310 + 100) * 0.55 + Math.sin((t - C.haan13 + 0.35) * Math.PI * 2 * 0.6) * 6 * 0.55;
        return <div key={w as string} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${a})`, fontFamily: HEAD, fontWeight: 800, fontSize: 44, color: '#fff', ...STROKE(5, '#0a1a10') }}>{w as string}</div>;
      })}
    </>
  );
};

/** Everything drawn over the map (screen space), by beat. */
export const MapFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => (
  <>
    {t < SC.greenwich + 0.3 && <Hook t={t} />}
    {t > SC.greenwich - 0.1 && t < SC.offsets + 0.8 && <GreenwichFx t={t} c={c} />}
    {t > SC.offsets - 0.1 && t < SC.mirzapur + 0.3 && <OffsetsFx t={t} c={c} />}
    {t > SC.mirzapur - 0.1 && t < SC.borders + 0.5 && <MirzapurFx t={t} c={c} />}
    {t > SC.france - 0.1 && t < SC.china + 0.3 && <FranceFx t={t} c={c} />}
    {t > SC.china - 0.1 && t < SC.india2 + 0.3 && <ChinaFx t={t} c={c} />}
    {t > SC.india2 - 0.1 && t < SC.assam + 0.3 && <IndiaFx t={t} c={c} />}
    {t > SC.assam - 0.1 && t < SC.garden + 0.2 && <AssamFx t={t} c={c} />}
    {t > SC.nepal - 0.1 && t < SC.close + 0.3 && <NepalFx t={t} c={c} />}
    {t > SC.close - 0.1 && <CloseFx t={t} c={c} />}
    <Hits />
  </>
);

/** Plane-space overlays (drawn with the map, under its rotation): the borders draw-on. */
export const PlaneFx: React.FC<{ t: number; c: Cam }> = ({ t, c }) => (
  <svg width={2600} height={3200} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
    {t > SC.borders && t < SC.china && <BordersFx t={t} c={c} />}
  </svg>
);

export { pxPerM, easeOut };
