import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import { camAt, camSpeed, EV, LOOPF, LZ } from './cam';
import { Globe, GlobeState, INDIA_C, onSphere } from './Globe';
import { asp, Captions, COL, Counter, Grade, LABEL, Particles, Pill, Pin, Prop, Rays, Ruler, src, Tag, TITLE, UI, useFonts, W } from './Kit';
import { C, CAPS, DURATION_S } from './timing';
import { CamS, P3, project, useHeights, World } from './World';

export const EV_DURATION_S = DURATION_S;
const FPS = 30;
type HMap = Record<string, Float32Array>;

// ------------------------------------------------------------------ scene schedule (cuts are whips: zoom-through + blur + flash)
const CUTS = { rock: 8.45, edge: 14.28, fossil: 17.5, globe: 24.76, rise: 32.3, send: 52.62 };
type SceneK = 'hook' | 'rock' | 'edge' | 'fossil' | 'globe' | 'rise' | 'send';
const sceneAt = (t: number): SceneK => t < CUTS.rock ? 'hook' : t < CUTS.edge ? 'rock' : t < CUTS.fossil ? 'edge' : t < CUTS.globe ? 'fossil' : t < CUTS.rise ? 'globe' : t < CUTS.send ? 'rise' : 'send';
const CUT_T = [CUTS.rock, CUTS.edge, CUTS.fossil, CUTS.globe, CUTS.rise, CUTS.send];
/** The whip envelope around the nearest cut: -1..0 leaving, 0..1 arriving. */
const whip = (t: number) => {
  for (const c of CUT_T) {
    if (t >= c - 0.24 && t < c) return { out: easeIn((t - (c - 0.24)) / 0.24), inn: 0, c };
    if (t >= c && t < c + 0.3) return { out: 0, inn: 1 - easeOut((t - c) / 0.3), c };
  }
  return { out: 0, inn: 0, c: -1 };
};

// ------------------------------------------------------------------ world state over time
const SUMMIT_M = 8740; // the DEM's summit (the official height, 8,848.86 m, is what the counter says)
const vexAt = (t: number) => {
  if (t < CUTS.edge) return 1;
  if (t < CUTS.fossil) return 0.25;
  if (t < CUTS.send) {
    if (t < 35.3) return lerp(0.04, 1.8, inOut(clamp01((t - 32.6) / 2.6)));
    if (t < 38.0) return 1.8;
    if (t < 46.2) return lerp(1.8, 1.3, inOut(clamp01((t - 38.0) / 1.6)));
    if (t < 50.6) return lerp(1.3, 1.8, inOut(clamp01((t - 46.2) / 1.2)));
    return lerp(1.8, 2.6, inOut(clamp01((t - 50.7) / 1.8)));
  }
  return t < 56.9 ? 1.3 : 1.0;
};
const WATER_TOP = SUMMIT_M / 1000 + 0.35;
const waterAt = (t: number): { water: number; waterY: number } => {
  if (t < CUTS.rock) {
    if (t < 1.25) return { water: 1, waterY: WATER_TOP };
    if (t < 2.4) return { water: 1 - ramp(t, 2.05, 2.4, linear), waterY: lerp(WATER_TOP, 5.0, easeIn(clamp01((t - 1.25) / 0.85))) };
    if (t < 6.0) return { water: 0, waterY: 5 };
    return { water: ramp(t, 5.85, 6.1, linear), waterY: lerp(6.9, 9.6, inOut(clamp01((t - 5.9) / 1.6))) };
  }
  if (t >= 58.9 && t >= CUTS.send) return { water: ramp(t, 58.9, 59.15, linear), waterY: lerp(5.0, WATER_TOP, inOut(clamp01((t - 59.0) / 1.45))) };
  return { water: 0, waterY: 0 };
};
const hlAt = (t: number) => {
  const vex = vexAt(t), w = waterAt(t);
  const hl = { vex, t, ...w, north: 0, northR: 1e5, india: 0, indiaR: 1e5, indiaLine: 0, hp: 0, hpR: 1e5, hpLine: 0, spot: 0, spotC: LZ as [number, number], spotR: 0.6, spotCol: [0.4, 1.0, 1.0] as [number, number, number], dim: 0, desat: 0 };
  if (t >= CUTS.edge && t < CUTS.fossil) {
    hl.north = 1; hl.northR = lerp(0, 3600, inOut(clamp01((t - 14.5) / 1.3)));
    hl.india = 1; hl.indiaR = lerp(0, 3600, inOut(clamp01((t - 15.45) / 0.9))); hl.indiaLine = ramp(t, 15.45, 15.9);
  }
  if (t >= CUTS.rise && t < CUTS.send) {
    hl.north = 1 - ramp(t, 33.4, 35.0); hl.northR = 1e5;
    hl.indiaLine = window4(t, 35.9, 36.5, 39.0, 39.6) + window4(t, 47.4, 47.9, 50.6, 51.3);
    hl.hp = window4(t, 37.15, 37.2, 38.45, 38.95); hl.hpR = lerp(0, 700, inOut(clamp01((t - 37.15) / 0.75))); hl.hpLine = window4(t, 37.15, 37.6, 38.6, 39.1);
    hl.spot = window4(t, 38.8, 39.2, 40.6, 41.2);
    hl.india = window4(t, 47.75, 47.8, 50.6, 51.3); hl.indiaR = lerp(0, 3600, inOut(clamp01((t - 47.75) / 0.9)));
  }
  return hl;
};
const segAt = (t: number) => (t < CUTS.rock ? 'hook' : t < CUTS.fossil ? 'edge' : t < CUTS.send ? 'rise' : 'send');

// ------------------------------------------------------------------ helpers
const P = (cam: CamS, H: HMap, lon: number, lat: number, vex: number, up = 0) => project(cam, 1080, 1920, P3(H, lon, lat, vex, up));
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; col?: string }> = ({ x1, y1, x2, y2, p, col = '#fff' }) => {
  if (p <= 0.01) return null;
  const x = lerp(x1, x2, p), y = lerp(y1, y2, p), a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={col} strokeWidth={5} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
      <polygon points={`${x},${y} ${x - 26 * Math.cos(a - 0.45)},${y - 26 * Math.sin(a - 0.45)} ${x - 26 * Math.cos(a + 0.45)},${y - 26 * Math.sin(a + 0.45)}`} fill={col} />
    </svg>
  );
};

/** The climber on the summit: body plus a rigged arm with the ice axe (down, then raised on "खड़े हो"). */
const Climber: React.FC<{ x: number; y: number; h: number; raise: number; tint: number; t: number; o: number }> = ({ x, y, h, raise, tint, t, o }) => {
  if (o <= 0.01) return null;
  const bw = h * asp('ev01_climber_body');
  const ah = h * 0.6, aw = ah * asp('ev01b_climber_arm_axe');
  const sx = x - bw / 2 + bw * 0.8, sy = y - h + h * 0.2; // right shoulder (seen from behind)
  const rot = lerp(128, 0, raise) + 3 * Math.sin(t * LOOPF(23));
  const breathe = 1 + 0.008 * Math.sin(t * LOOPF(19));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o, transform: `scale(1, ${breathe})`, transformOrigin: `${x}px ${y}px` }}>
      <Prop k="ev01b_climber_arm_axe" x={sx - aw * 0.08 + aw / 2} y={sy + ah * 0.08} h={ah} rot={rot} origin="8% 92%" tint={tint} shadow={0} wrap="#9fd0ff" />
      <Prop k="ev01_climber_body" x={x} y={y} h={h} tint={tint} shadow={0.8} wrap="#9fd0ff" />
    </div>
  );
};

// ------------------------------------------------------------------ the world scenes' overlays
const WorldOverlay: React.FC<{ t: number; cam: CamS; H: HMap; vex: number; under: boolean }> = ({ t, cam, H, vex, under }) => {
  const els: React.ReactNode[] = [];
  const summit = P(cam, H, EV[0], EV[1], vex);
  const dS = summit[3];
  // climber (hook and the loop's end)
  if (t < CUTS.rock || t >= 57.25) {
    const hpx = Math.min(430, 1850 / dS);
    const raise = t < CUTS.rock ? easeOut(clamp01((t - 1.3) / 0.45)) - 0.0 * 0 : easeOut(clamp01((t - 57.9) / 0.5)) * (1 - inOut(clamp01((t - 59.6) / 0.9)));
    const r = t < CUTS.rock ? raise * (1 - inOut(clamp01((t - 7.0) / 0.8))) : raise;
    const o = t < CUTS.rock ? 1 - ramp(t, 8.15, 8.35) : ramp(t, 57.25, 57.6);
    els.push(<Climber key="cl" x={summit[0] + 6} y={summit[1] + hpx * 0.03} h={hpx} raise={r} tint={under ? 1 : 0} t={t} o={o} />);
    els.push(<Tag key="ai1" text="AI illustration" o={o} />);
  }
  if (t < CUTS.rock) {
    els.push(<Counter key="c8849" x={540} y={430} t={t} t0={C.n8849 - 0.1} t1={6.1} to={8849} fmt={(v) => Math.round(v).toLocaleString('en-US')} unit="मीटर ऊँचा" size={190} dur={1.3} />);
    const lead = window4(t, 3.3, 3.6, 5.9, 6.1);
    if (lead > 0) els.push(<svg key="ld" width={1080} height={1920} style={{ position: 'absolute', opacity: lead }}><line x1={540} y1={560} x2={summit[0]} y2={summit[1] - Math.min(430, 1850 / dS) - 14} stroke="#fff" strokeWidth={3} strokeDasharray="10 10" opacity={0.8} /></svg>);
    els.push(<Pill key="sea1" x={540} y={430} t={t} t0={6.5} t1={8.1} hi="पुराने समंदर का तल" en="OLD SEA FLOOR" col={COL.sea} size={62} />);
  }
  if (t >= CUTS.edge && t < CUTS.fossil) {
    const s = P(cam, H, 86.0, 33.2, vex), e = P(cam, H, 80.6, 29.9, vex);
    els.push(<Pill key="sm" x={s[0]} y={s[1]} t={t} t0={14.75} t1={17.3} hi="समंदर" en="SEA" col={COL.sea} size={64} />);
    els.push(<Arrow key="ar" x1={e[0] - 170} y1={e[1] + 330} x2={e[0]} y2={e[1] + 20} p={easeOut(clamp01((t - 16.2) / 0.4))} col={COL.gold} />);
    els.push(<Pill key="kin" x={e[0] - 150} y={e[1] + 400} t={t} t0={16.15} t1={17.3} hi="भारत का उत्तरी किनारा" en="INDIA'S NORTHERN EDGE" col={COL.gold} size={52} />);
    els.push(<Tag key="ch" text="चित्रण · क़रीब 47 करोड़ साल पहले" o={window4(t, 14.4, 14.7, 17.2, 17.5)} y={120} />);
  }
  if (t >= CUTS.rise && t < CUTS.send) {
    els.push(<Pill key="him" x={540} y={520} t={t} t0={34.5} t1={35.6} hi="हिमालय" en="HIMALAYA" col={COL.white} size={66} />);
    const ev = P(cam, H, EV[0], EV[1], vex, 0.1);
    els.push(<Pin key="evp" x={ev[0]} y={ev[1]} t={t} t0={35.7} t1={36.5} hi="एवरेस्ट" en="EVEREST" col={COL.cyan} side="u" />);
    els.push(<Pill key="hp" x={540} y={520} t={t} t0={37.25} t1={38.6} hi="हिमाचल प्रदेश" en="HIMACHAL PRADESH" col={COL.pink} size={56} />);
    const sp = P(cam, H, 78.25, 32.05, vex);
    els.push(<Pin key="spi" x={sp[0]} y={sp[1]} t={t} t0={37.8} t1={38.7} hi="स्पीति घाटी" en="SPITI VALLEY" col={COL.pink} side="r" />);
    const lz = P(cam, H, LZ[0], LZ[1], vex);
    els.push(<Pin key="lz" x={lz[0]} y={lz[1]} t={t} t0={38.8} t1={42.4} hi="लांगज़ा" en="LANGZA · SPITI" col={COL.cyan} side="r" size={52} />);
    els.push(<Ruler key="ru" x={lz[0] - 70} yBase={lz[1] + 40} yTop={lz[1] - 330} t={t} t0={40.55} t1={42.35} label="4,400 m" />);
    // the village house rises out of its slope; then the ammonite
    if (t > 42.3 && t < 46.2) {
      const hv = P(cam, H, LZ[0] + 0.004, LZ[1] - 0.002, vex);
      const hh = Math.min(520, 2900 / hv[3]) * easeOut(clamp01((t - 42.45) / 0.45));
      const o = 1 - ramp(t, 45.75, 46.05);
      els.push(<Prop key="hs" k="ev09_spiti_house" x={hv[0]} y={hv[1] + 6} h={hh} o={o} wrap="#ffcf8a" bright={0.95} />);
      // the living ammonite swims in through the old sea, then lies as a fossil on the slope
      const sw = clamp01((t - 43.55) / 0.85);
      const live = window4(t, 43.5, 43.7, 44.3, 44.45);
      const fx = lerp(1180, hv[0] + 230, easeOut(sw)), fy = lerp(760, hv[1] + 90, easeOut(sw)) + 14 * Math.sin(t * 6);
      els.push(<Prop key="am" k="ev08_living_ammonite" x={fx} y={fy} h={260} o={live} tint={0.55} shadow={0} rot={-6 + 4 * Math.sin(t * 5)} />);
      const fo = ramp(t, 44.3, 44.5) * o;
      const fp = pop(t, 44.3, 11, 200);
      els.push(<Prop key="af" k="ev07_ammonite_fossil" x={hv[0] + 230} y={hv[1] + 110} h={210 * lerp(0.6, 1, fp)} o={fo} wrap="#ffcf8a" />);
      const fl = Math.exp(-((t - 44.34) ** 2) / 0.004);
      if (fl > 0.01) els.push(<div key="fl" style={{ position: 'absolute', left: hv[0] + 230 - 200, top: hv[1] + 5 - 200, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(200,255,255,0.9), transparent)', opacity: fl }} />);
      els.push(<Pill key="amp" x={hv[0] + 230} y={hv[1] + 210} t={t} t0={44.4} t1={45.8} hi="अमोनाइट" en="AMMONITE" col={COL.cyan} size={50} />);
      els.push(<Tag key="ban" text="ये fossil बेचना मना है" o={window4(t, 44.9, 45.1, 45.7, 45.9)} x={44} y={1680} />);
      els.push(<Tag key="ai3" text="AI illustration" o={o * ramp(t, 42.4, 42.6)} />);
    }
    // all of India pushing north
    if (t > 47.6 && t < 51.4) {
      const ic = P(cam, H, 79.0, 21.5, vex);
      els.push(<Pill key="bh" x={ic[0]} y={ic[1]} t={t} t0={47.85} t1={48.7} hi="भारत" en="INDIA" col={COL.gold} size={72} />);
      for (let i = 0; i < 3; i++) {
        const ph = ((t - 48.7) * 0.9 + i / 3) % 1;
        if (t < 48.7) continue;
        const a = P(cam, H, 78.5 + i * 1.5, lerp(17, 27.5, ph), vex);
        const o = Math.sin(Math.PI * ph) * window4(t, 48.7, 49.0, 50.6, 51.2);
        els.push(<svg key={`ch${i}`} width={1080} height={1920} style={{ position: 'absolute', opacity: o }}><polyline points={`${a[0] - 70},${a[1] + 40} ${a[0]},${a[1] - 20} ${a[0] + 70},${a[1] + 40}`} fill="none" stroke={COL.gold} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${COL.gold})` }} /></svg>);
      }
    }
    els.push(<Pill key="aaj" x={540} y={520} t={t} t0={51.05} t1={52.5} hi="आज भी ऊपर ↑" en="STILL RISING" col={COL.cyan} size={66} />);
  }
  if (t >= CUTS.send) {
    // the traveller looking up at Spiti's peaks
    const en = easeOut(clamp01((t - 52.65) / 0.6)), ex = easeIn(clamp01((t - 56.45) / 0.3));
    const o = en * (1 - ex);
    els.push(<Prop key="tr" k="ev10_traveller" x={300 - 40 * (t - 52.6)} y={1990 + 140 * (1 - en) + 400 * ex} h={1300} o={o} wrap="#ffd9a0" />);
    els.push(<Tag key="ai4" text="AI illustration" o={o} />);
    els.push(<Pill key="sp7" x={700} y={420} t={t} t0={54.1} t1={54.7} hi="स्पीति" en="SPITI" col={COL.pink} size={64} />);
    els.push(<Pill key="ev7" x={700} y={560} t={t} t0={54.85} t1={56.4} hi="एवरेस्ट" en="EVEREST" col={COL.cyan} size={64} />);
    els.push(<Pill key="sea7" x={540} y={430} t={t} t0={58.5} t1={59.9} hi="भारत का पुराना समंदर" en="INDIA'S OLD SEA" col={COL.sea} size={60} />);
  }
  return <>{els}</>;
};

// ------------------------------------------------------------------ the limestone block
const Rock: React.FC<{ t: number }> = ({ t }) => {
  const enter = easeOut(clamp01((t - CUTS.rock) / 0.55));
  const s = lerp(2.6, 1, enter) * (1 + 0.05 * clamp01((t - 9) / 5));
  const ry = -10 + 16 * inOut(clamp01((t - 8.5) / 5.6)), rx = 8 + 2 * Math.sin(t * 0.7);
  const h = 600, w = h * asp('ev06_limestone_block');
  const scan = clamp01((t - 9.3) / 0.9);
  const sea = ramp(t, 12.7, 13.2);
  const m = `url(${src('ev06_limestone_block')})`;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 55%, ${sea > 0 ? '#0b3a4c' : '#1a2a36'}, #050b12)` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(90% 60% at 50% 55%, #0d4a5e, #020a12)', opacity: sea }} />
      <Rays o={0.55 * sea + 0.18} t={t} col={sea > 0.5 ? '140,230,255' : '255,240,220'} />
      <Particles o={0.7} t={t} n={36} up={false} col={sea > 0.5 ? '190,240,255' : '255,245,230'} />
      <div style={{ position: 'absolute', left: 540, top: 1060, perspective: 1400 }}>
        <div style={{ position: 'absolute', left: -w / 2, top: -h / 2, width: w, height: h, transform: `scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg)`, filter: `blur(${(1 - enter) * 10}px)` }}>
          <div style={{ position: 'absolute', left: '10%', right: '10%', bottom: -30, height: 70, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.75), transparent)' }} />
          <Img src={src('ev06_limestone_block')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'contrast(1.08) brightness(0.95) drop-shadow(0 30px 40px rgba(0,0,0,0.6))' }} />
          {/* scan band: the layers light up top to bottom */}
          <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: m, WebkitMaskSize: '100% 100%', maskImage: m, maskSize: '100% 100%', mixBlendMode: 'screen' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: `${lerp(-20, 110, scan)}%`, height: '16%', background: 'linear-gradient(180deg, transparent, rgba(255,214,120,0.85), transparent)', opacity: scan > 0 && scan < 1 ? 1 : 0 }} />
            {[0.32, 0.5, 0.68, 0.84].map((v, i) => <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${v * 100}%`, height: 6, background: COL.gold, boxShadow: `0 0 18px ${COL.gold}`, opacity: window4(t, 9.4 + i * 0.18, 9.6 + i * 0.18, 12.4, 12.8) * 0.75 }} />)}
            {/* the old sea's caustics playing over the stone */}
            <div style={{ position: 'absolute', inset: '-20%', opacity: sea * 0.55, background: `repeating-radial-gradient(circle at ${50 + 20 * Math.sin(t)}% ${40 + 15 * Math.cos(t * 0.8)}%, rgba(120,230,255,0.0) 0 22px, rgba(120,230,255,0.5) 26px, rgba(120,230,255,0.0) 34px)`, filter: 'blur(6px)' }} />
          </div>
        </div>
      </div>
      <Pill x={540} y={700} t={t} t0={9.4} t1={12.6} hi="चूना पत्थर" en="LIMESTONE" col={COL.gold} size={70} />
      <Counter x={540} y={420} t={t} t0={C.n47 - 0.15} t1={14.1} to={47} fmt={(v) => `≈ ${Math.round(v)}`} unit="करोड़ साल पहले" size={200} dur={0.9} />
      <Pill x={540} y={700} t={t} t0={13.0} t1={14.1} hi="समुद्र की तली पर बना" en="FORMED ON THE SEA FLOOR" col={COL.sea} size={62} />
      <Tag text="AI illustration" o={1} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the fossils: living sea animals turning to stone
const Fossils: React.FC<{ t: number }> = ({ t }) => {
  // a 2D camera over the stage: wide, then the brachiopod, then the crinoid
  const k = [[17.5, 540, 1060, 0.9], [18.2, 540, 1000, 1.0], [20.3, 540, 1000, 1.05], [21.0, 360, 1090, 1.42], [21.9, 380, 1080, 1.45], [22.6, 740, 1050, 1.25], [24.7, 740, 1020, 1.32]] as const;
  let cx: number = k[0][1], cy: number = k[0][2], z: number = k[0][3];
  for (let i = 1; i < k.length; i++) if (t > k[i - 1][0]) { const p = inOut(clamp01((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]))); cx = lerp(k[i - 1][1], k[i][1], p); cy = lerp(k[i - 1][2], k[i][2], p); z = lerp(k[i - 1][3], k[i][3], p); }
  const enter = easeOut(clamp01((t - CUTS.fossil) / 0.5));
  z *= lerp(1.6, 1, enter);
  const stone1 = ramp(t, 21.0, 21.35), stone2 = ramp(t, 22.55, 22.9);
  const sweep = (t0: number) => clamp01((t - t0) / 0.45);
  const SweepBar: React.FC<{ k2: string; t0: number }> = ({ k2, t0 }) => {
    const s = sweep(t0);
    if (s <= 0 || s >= 1) return null;
    const m = `url(${src(k2)})`;
    return <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: m, WebkitMaskSize: '100% 100%', maskImage: m, maskSize: '100% 100%' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${lerp(-30, 110, s)}%`, width: '28%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)', transform: 'skewX(-16deg)' }} /></div>;
  };
  const Stage = (kk: string, x: number, y: number, h: number, o: number, rot: number, tint = 0, bar?: number) => {
    const w = h * asp(kk);
    return o <= 0.01 ? null : (
      <div style={{ position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, opacity: o, transform: `rotate(${rot}deg)`, transformOrigin: '50% 100%' }}>
        <Img src={src(kk)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: `drop-shadow(0 20px 30px rgba(0,0,0,0.55)) saturate(${1 - tint * 0.3})` }} />
        {bar !== undefined && <SweepBar k2={kk} t0={bar} />}
      </div>
    );
  };
  const sway = 3 * Math.sin(t * 1.4);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0a5a72 0%, #063849 35%, #021a26 100%)', overflow: 'hidden' }}>
      <Rays o={0.75} t={t} />
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${540 - cx * z}px, ${1000 - cy * z}px) scale(${z})`, transformOrigin: '0 0' }}>
        {/* the sea floor */}
        <div style={{ position: 'absolute', left: -600, right: -600, top: 1180, height: 1400, background: 'radial-gradient(70% 40% at 50% 0%, #4a6a6a, #12262c 70%)', borderRadius: '50% 50% 0 0 / 120px 120px 0 0' }} />
        {Stage('ev05_living_brachiopod', 360, 1215, 330, 1 - stone1, sway * 0.4, 0, 20.75)}
        {Stage('ev02_brachiopod_fossil', 360, 1235, 380, stone1, 0)}
        {Stage('ev04_living_crinoid', 760, 1215, 900, 1 - stone2, sway, 0, 22.3)}
        {Stage('ev03_crinoid_fossil', 760, 1245, 400, stone2, 0)}
      </div>
      <Particles o={0.85} t={t} n={40} up />
      <Particles o={0.6} t={t + 7} n={30} up={false} />
      <Pill x={540} y={330} t={t} t0={18.3} t1={20.3} hi="समुद्री जीव" en="SEA ANIMALS" col={COL.sea} size={66} />
      <Pill x={540} y={330} t={t} t0={21.05} t1={22.0} hi="ब्रेकियोपॉड" en="BRACHIOPOD" col={COL.gold} size={66} />
      <Pill x={540} y={330} t={t} t0={22.15} t1={23.6} hi="क्रिनॉइड" en="CRINOID" col={COL.gold} size={66} />
      <Pill x={540} y={330} t={t} t0={23.65} t1={24.7} hi="समुद्री लिली" en="SEA LILY" col={COL.cyan} size={66} />
      <Tag text="AI illustration" o={1} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the globe: India drifts north and closes the Tethys
const globeState = (t: number): GlobeState => {
  const p = clamp01((t - 24.95) / (C.takraya - 24.95));
  const dl = -26 * (1 - Math.pow(p, 1.35)) - 0.9 * (1 - ramp(t, 30.4, 32.0));
  const flash = t > C.takraya ? Math.exp(-6 * (t - C.takraya)) : 0;
  const enter = easeOut(clamp01((t - CUTS.globe) / 0.6));
  return {
    lon: 80 + 3 * Math.sin(t * 0.25), lat: lerp(-2, 22, inOut(clamp01((t - 24.8) / 5.0))) + 2 * ramp(t, 30, 32.3), dist: lerp(5.2, 3.15, enter) * (1 - 0.05 * ramp(t, 29.0, 32.3)) * (1 - 0.03 * flash),
    roll: 2 * Math.sin(t * 0.5) + kick(t, C.takraya, 3.5, 28, 7), dlat: dl, dlat0: -26, hide: 1, tethys: ramp(t, 25.0, 25.6) * clamp01((dl + 15) / 5), trail: ramp(t, 25.1, 25.6) * (1 - ramp(t, 31.0, 32.0)),
    rim: 1, asia: window4(t, 28.7, 28.95, 31.2, 32.0) * (0.75 + 0.25 * Math.sin(t * 9)), flash, t,
  };
};
const projG = (s: GlobeState, lon: number, lat: number): [number, number] => {
  const c = new THREE.PerspectiveCamera(32, 1080 / 1920, 0.01, 100);
  c.position.copy(onSphere(s.lon, s.lat, s.dist)); c.up.set(0, 1, 0); c.lookAt(0, 0, 0); c.rotateZ((s.roll * Math.PI) / 180);
  c.updateMatrixWorld(); c.updateProjectionMatrix();
  const v = onSphere(lon, lat, 1.01).project(c);
  return [(v.x * 0.5 + 0.5) * 1080, (-v.y * 0.5 + 0.5) * 1920];
};
const GlobeScene: React.FC<{ t: number }> = ({ t }) => {
  const s = globeState(t);
  const ic = projG(s, INDIA_C[0], INDIA_C[1] + s.dlat);
  const asia = projG(s, 88, 38.5);
  const teth = projG(s, 84.5, 29.4);
  const hit = projG(s, 81.5, 30.2);
  const ring = t > C.takraya ? clamp01((t - C.takraya) / 0.8) : 0;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(80% 60% at 50% 45%, #0a1826, #01050a)' }}>
      <Globe s={s} width={1080} height={1920} />
      <Pill x={ic[0]} y={ic[1]} t={t} t0={24.95} t1={28.6} hi="भारत" en="INDIA" col={COL.gold} size={70} />
      <Pill x={asia[0]} y={asia[1]} t={t} t0={28.8} t1={30.6} hi="एशिया" en="ASIA" col={COL.white} size={70} />
      {ring > 0 && ring < 1 && <div style={{ position: 'absolute', left: hit[0] - 700 * ring, top: hit[1] - 700 * ring, width: 1400 * ring, height: 1400 * ring, borderRadius: '50%', border: `${10 * (1 - ring)}px solid rgba(255,210,150,${1 - ring})`, boxShadow: `0 0 60px rgba(255,180,90,${(1 - ring) * 0.8})` }} />}
      <Pill x={teth[0]} y={teth[1] - 90} t={t} t0={31.3} t1={32.25} hi="टेथिस सागर" en="TETHYS SEA" col={COL.sea} size={62} />
      <Counter x={540} y={330} t={t} t0={C.panch - 0.1} t1={29.2} to={5} fmt={(v) => `≈ ${Math.round(v)}`} unit="करोड़ साल पहले" size={170} dur={0.5} />
      <Tag text="सरल चित्रण · simplified illustration" o={1} y={120} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the composition
export const Everest: React.FC<{ captions?: boolean; audio?: string }> = ({ captions = true, audio = '' }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const H = useHeights();
  const sc = sceneAt(t);
  const wp = whip(t);
  const split = t >= 28.4 && t < 34.6 ? easeOut(clamp01((t - 28.4) / 0.35)) * (1 - easeIn(clamp01((t - 34.3) / 0.3))) : 0;
  let body: React.ReactNode = null;
  let blur = 0;
  if (H && (sc === 'hook' || sc === 'edge' || sc === 'rise' || sc === 'send')) {
    const seg = segAt(t);
    const hl = hlAt(t);
    const cam = camAt(seg, t, H, hl.vex);
    const under = hl.water > 0 && cam.pos[1] < hl.waterY;
    const sp = camSpeed(seg, t, H, hl.vex);
    blur = Math.min(9, Math.max(0, (sp.pan * 260 + sp.zoom * 160) - 0.8));
    body = (
      <AbsoluteFill>
        <div style={{ position: 'absolute', inset: 0, filter: blur > 0.4 ? `blur(${blur.toFixed(2)}px)` : undefined }}>
          <World H={H} cam={cam} hl={hl} width={1080} height={1920} />
        </div>
        <Rays o={under ? 0.9 : 0} t={t} />
        <Particles o={under ? 0.85 : 0} t={t} n={44} up />
        {under && <AbsoluteFill style={{ background: 'radial-gradient(100% 70% at 50% 20%, rgba(80,200,220,0.18), rgba(0,30,45,0.35))' }} />}
        <WorldOverlay t={t} cam={cam} H={H} vex={hl.vex} under={under} />
      </AbsoluteFill>
    );
  } else if (sc === 'rock') body = <Rock t={t} />;
  else if (sc === 'fossil') body = <Fossils t={t} />;
  else if (sc === 'globe') body = <GlobeScene t={t} />;
  // the whip: zoom-through with blur and a flash
  const wz = 1 + 0.35 * wp.out - 0.18 * wp.inn;
  const wb = 16 * Math.max(wp.out, wp.inn);
  const flash = Math.max(wp.out, wp.inn) ** 2 * 0.5;
  const capY = split > 0.5 ? 960 : 1470;
  return (
    <AbsoluteFill style={{ background: '#02080e', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translateY(${-430 * split}px) scale(${wz})`, filter: wb > 0.3 ? `blur(${wb.toFixed(1)}px) brightness(${1 + flash})` : undefined }}>
        {body}
      </AbsoluteFill>
      {flash > 0.01 && <AbsoluteFill style={{ background: '#e8f6ff', opacity: flash * 0.5, mixBlendMode: 'screen' }} />}
      <Grade />
      {/* Null, split screen (bottom half) */}
      {split > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 960 + 960 * (1 - split), width: 1080, height: 960, overflow: 'hidden', borderTop: `5px solid ${COL.gold}`, boxShadow: `0 -10px 40px ${COL.gold}55` }}>
          <Sequence from={Math.round(28.4 * FPS)} layout="none">
            <OffthreadVideo src={staticFile('everest/null/null_ev_B.mp4')} startFrom={Math.round(2.0 * FPS)} muted style={{ position: 'absolute', left: 0, top: -300, width: 1080, height: 1920 }} />
          </Sequence>
        </div>
      )}
      {captions && <Captions t={t} caps={CAPS} y={capY} />}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1884, textAlign: 'center', fontFamily: LABEL, fontSize: 17, letterSpacing: 1, color: 'rgba(255,255,255,0.5)' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · Terrain: AWS Terrain Tiles / SRTM · Borders: Natural Earth
      </div>
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
export { TITLE, UI, W };
