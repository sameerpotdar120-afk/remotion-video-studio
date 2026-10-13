import React from 'react';
import { AbsoluteFill } from 'remotion';
import { clamp01, kick, lerp, linear, pop, ramp, window4 } from './anim2';
import { C, CAPS, Cam, DURATION_S, GEO, P, toScreen } from './cam';
import { HEAD, NUM, SUB } from './fonts';
import { Actor, COL, Counter, Cross, Kin, Overlay, SHADOW, STROKE, Stamp, Tag } from './kit';
import { pointAt, routeAt } from './Plane';

/** A small "chapter" chip at the top: इम्तिहान #1 and friends. */
const Chip: React.FC<{ t: number; t0: number; t1: number; text: string; color: string }> = ({ t, t0, t1, text, color }) => {
  const a = window4(t, t0, t0 + 0.1, t1 - 0.2, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 10, 240));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 205, textAlign: 'center', opacity: a }}>
      <span style={{ display: 'inline-block', transform: `scale(${s}) rotate(-2deg)`, background: color, color: '#140c03', fontFamily: HEAD, fontWeight: 800, fontSize: 52,
        padding: '4px 26px 0', borderRadius: 14, border: '4px solid #140c03', boxShadow: SHADOW }}>{text}</span>
    </div>
  );
};

/** Skull pins dropped around the Darién Gap. */
const Skulls: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const a = window4(t, C.taskar5 - 0.3, C.taskar5, C.panama6, C.panama6 + 0.4);
  if (a <= 0) return null;
  const [cx, cy] = toScreen(c, GEO.places.darien_in);
  const spots: [number, number, number][] = [[-170, -60, 0], [120, -110, 0.15], [-40, 90, 0.3], [190, 60, 0.45], [-210, 120, 0.6], [60, -10, 0.75]];
  return (
    <>
      {spots.map(([dx, dy, d], i) => {
        const s = clamp01(pop(t, C.taskar5 - 0.2 + d, 10, 260));
        if (s <= 0.01) return null;
        return (
          <svg key={i} width={70} height={84} viewBox="0 0 70 84" style={{ position: 'absolute', left: cx + dx - 35, top: cy + dy - 84, opacity: a, transform: `scale(${s})`, transformOrigin: '50% 100%',
            filter: 'drop-shadow(0 0 10px rgba(255,60,60,0.8)) drop-shadow(0 6px 6px rgba(0,0,0,0.5))' }}>
            <path d="M35 84 L22 58 A30 30 0 1 1 48 58 Z" fill="#E0262B" stroke="#fff" strokeWidth={3} />
            <circle cx={35} cy={32} r={14} fill="#fff" />
            <circle cx={30} cy={31} r={3.4} fill="#E0262B" /><circle cx={40} cy={31} r={3.4} fill="#E0262B" />
            <rect x={29} y={40} width={12} height={6} rx={2} fill="#fff" />
          </svg>
        );
      })}
    </>
  );
};

/** Frame 0 and the hook: picture first, then the vow and 12 → 28 builds on the voice. */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const a = 1 - ramp(t, C.karl4 - 0.4, C.karl4, linear);
  if (a <= 0) return null;
  const vow = clamp01(pop(t, C.kasam2 - 0.1, 10, 230));
  const plan = clamp01(pop(t, C.plan3 - 0.1, 10, 230));
  const big = clamp01(pop(t, C.n28 - 0.05, 9, 260));
  const strike = ramp(t, C.n28 - 0.25, C.n28, linear);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 210, opacity: a, textAlign: 'center', lineHeight: 1.05 }}>
      <div style={{ transform: `scale(${1 + kick(t, C.n28, 0.08, 26, 8)})` }}>
        <span style={{ fontFamily: NUM, fontSize: 190, color: COL.gold, textShadow: `${SHADOW}, 0 0 40px ${COL.gold}99`, ...STROKE(10) }}>28</span>
        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 132, color: '#fff', textShadow: SHADOW, ...STROKE(10) }}> साल पैदल</span>
      </div>
      <div style={{ marginTop: 10, opacity: vow, transform: `translateY(${(1 - vow) * 30}px)` }}>
        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 66, color: '#fff', background: 'rgba(14,8,2,0.7)', padding: '4px 26px 0', borderRadius: 16 }}>एक कसम: पूरी दुनिया पैदल</span>
      </div>
      <div style={{ marginTop: 18, opacity: plan, transform: `scale(${lerp(0.7, 1, plan)})`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
        <span style={{ position: 'relative', fontFamily: HEAD, fontWeight: 800, fontSize: 70, color: '#fff', textShadow: SHADOW, ...STROKE(7) }}>
          Plan: <span style={{ fontFamily: NUM, fontSize: 90 }}>12</span> साल
          <span style={{ position: 'absolute', left: -6, right: -6, top: '52%', height: 9, background: COL.red, borderRadius: 5, transform: `scaleX(${strike})`, transformOrigin: 'left' }} />
        </span>
        <span style={{ fontFamily: NUM, fontSize: 80, color: COL.red, opacity: big, transform: `scale(${lerp(1.8, 1, big)})`, textShadow: SHADOW, ...STROKE(6) }}>→ 28</span>
      </div>
    </div>
  );
};

/** End card: जुनून या पागलपन? */
const Question: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.junoon15 - 0.5;
  if (t < t0) return null;
  const s = clamp01(pop(t, t0, 11, 190));
  const btn = (label: string, at: number, bg: string) => {
    const p = clamp01(pop(t, at - 0.15, 10, 230));
    const hi = window4(t, at, at + 0.1, at + 0.6, at + 0.9);
    return (
      <div style={{ padding: '8px 40px 0', borderRadius: 30, background: bg, border: '6px solid #fff', transform: `scale(${p * (1 + hi * 0.1)})`, opacity: p,
        boxShadow: `0 12px 24px rgba(0,0,0,0.55), 0 0 ${40 * hi}px rgba(255,216,74,0.95)`, fontFamily: HEAD, fontWeight: 800, fontSize: 84, color: '#140c03', whiteSpace: 'nowrap' }}>{label}</div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: s }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26 }}>
        {btn('जुनून', C.junoon15, `linear-gradient(180deg, ${COL.gold}, #F0A93A)`)}
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 60, color: '#fff', textShadow: SHADOW, ...STROKE(6) }}>या</div>
        {btn('पागलपन?', C.pagal15, 'linear-gradient(180deg, #FF8A8A, #E0262B)')}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', opacity: clamp01(pop(t, C.comment15 - 0.1, 10, 230)) }}>
        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 56, color: '#fff', textShadow: SHADOW, ...STROKE(6) }}>Comment में बताओ 👇</span>
      </div>
    </AbsoluteFill>
  );
};

export const ScreenLayer: React.FC<{ t: number; c: Cam; globe: number }> = ({ t, c, globe }) => {
  const at = (k: string): P => toScreen(c, GEO.places[k]);
  const head = toScreen(c, pointAt(routeAt(t)));
  const pa = at('punta_arenas'), dar = at('darien_in'), met = at('meteti'), ber = at('wales'), uel = at('uelen'), cas = at('aktau'), dov = at('dover'), hull = at('hull');
  const flat = 1 - globe;
  return (
    <AbsoluteFill>
      {/* ---- the hook, on the globe */}
      <Actor t={t} t0={-1} t1={C.karl4 - 0.3} pose="karl_front" x={540} y={1530} h={640} bob={3} glow="rgba(255,216,74,0.35)" />
      <Hook t={t} />
      <Stamp t={t} t0={C.kyon3 - 0.05} t1={C.karl4 - 0.1} x={540} y={800} rot={-4}>
        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 96, color: '#fff' }}>पर क्यों?</span>
      </Stamp>

      {/* ---- the start */}
      <Tag t={t} t0={C.karl4 + 0.1} t1={C.gaadi4 + 0.4} text="KARL BUSHBY" x={pa[0]} y={pa[1]} color={COL.gold} latin size={58} up={130} />
      <Stamp t={t} t0={C.y1998 - 0.05} t1={C.gaadi4} x={540} y={420} rot={-5}>
        <span style={{ fontFamily: NUM, fontSize: 120, color: '#fff', letterSpacing: 3 }}>1998</span>
      </Stamp>
      <Kin text="Chile का आखिरी छोर" t={t} t0={C.chile4 - 0.05} t1={C.gaadi4 - 0.1} x={540} y={600} size={64} />
      <Actor t={t} t0={C.chile4 - 0.1} t1={C.gaadi4 - 0.25} pose="karl_walk" x={380} y={1560} h={400} bob={4} path={{ t0: C.chile4, t1: C.gaadi4, x: 640, y: 1560 }} />
      <Actor t={t} t0={C.gaadi4 - 0.15} t1={C.imtihan5 - 0.2} pose="car" x={230} y={1420} h={220} />
      <Actor t={t} t0={C.jahaz4 - 0.15} t1={C.imtihan5 - 0.2} pose="ship" x={540} y={1420} h={200} />
      <Actor t={t} t0={C.plane4 - 0.15} t1={C.imtihan5 - 0.2} pose="plane" x={850} y={1400} h={190} />
      <Cross t={t} t0={C.gaadi4 + 0.25} t1={C.imtihan5 - 0.2} x={230} y={1310} r={90} />
      <Cross t={t} t0={C.jahaz4 + 0.25} t1={C.imtihan5 - 0.2} x={540} y={1320} r={90} />
      <Cross t={t} t0={C.plane4 + 0.25} t1={C.imtihan5 - 0.2} x={850} y={1300} r={90} />

      {/* ---- Darién Gap → jail */}
      <Chip t={t} t0={C.imtihan5 - 0.05} t1={C.jail6 + 0.6} text="पहला इम्तिहान" color={COL.green} />
      <Tag t={t} t0={C.darien5 - 0.05} t1={C.maut6} text="DARIÉN GAP" x={dar[0]} y={dar[1] - 40} color={COL.green} latin size={56} up={140} />
      <Skulls t={t} c={c} />
      <Actor t={t} t0={C.jungle5 - 0.1} t1={C.panama6 - 0.1} pose="jungle" x={540} y={1530} h={420} />
      <Actor t={t} t0={C.jungle5 + 0.2} t1={C.panama6 - 0.1} pose="karl_jungle" x={560} y={1560} h={520} bob={5} />
      <Overlay name="overlay_jungle_mist" a={window4(t, C.jungle5, C.jungle5 + 0.5, C.panama6 - 0.3, C.panama6) * 0.7} x={540} y={1560} w={1700} />
      <Kin text="मौत को छूकर लौटा…" t={t} t0={C.maut6 - 0.05} t1={C.panama6 - 0.1} x={540} y={420} size={82} color={COL.red} />
      <Tag t={t} t0={C.panama6 - 0.05} t1={C.bering7 - 0.3} text="PANAMA" x={met[0]} y={met[1]} color={COL.red} latin size={52} up={110} />
      <Actor t={t} t0={C.visa6 - 0.05} t1={C.bering7 - 0.3} pose="jail" x={540} y={1500} h={460} />
      <Counter t={t} t0={C.n18 - 0.1} t1={C.bering7 - 0.3} to={18} x={540} y={430} size={180} color={COL.red} sub="दिन जेल" />

      {/* ---- Bering Strait → arrest */}
      <Tag t={t} t0={C.jamne7 - 0.1} t1={C.n14 + 0.6} text="BERING STRAIT" x={ber[0]} y={ber[1]} color={COL.ice} latin size={52} up={120} />
      <Kin text="समंदर जमने का इंतज़ार…" t={t} t0={C.jamne7 - 0.05} t1={C.n14 - 0.1} x={540} y={420} size={72} color={COL.ice} />
      <Actor t={t} t0={C.n14 - 0.2} t1={C.giraftar7 - 0.1} pose="ice_floe" x={540} y={1560} h={300} drop={false} />
      <Actor t={t} t0={C.n14 - 0.1} t1={C.giraftar7 - 0.1} pose="karl_ice" x={420} y={1500} h={420} bob={4} path={{ t0: C.n14, t1: C.russia7, x: 660, y: 1490 }} />
      <Counter t={t} t0={C.n14 - 0.05} t1={C.russia7 + 0.3} to={14} x={540} y={430} size={170} color={COL.ice} sub="दिन बहती बर्फ़ पर" />
      <Tag t={t} t0={C.russia7 - 0.05} t1={C.russia8 + 0.6} text="RUSSIA" x={uel[0]} y={uel[1]} color={COL.red} latin size={52} up={110} rot={3} />
      <Actor t={t} t0={C.giraftar7 - 0.15} t1={C.russia8 + 0.3} pose="handcuffs" x={540} y={1430} h={300} rot={-8} />
      <Kin text="गिरफ़्तार!" t={t} t0={C.giraftar7 - 0.05} t1={C.russia8 + 0.2} x={540} y={430} size={120} color={COL.red} />

      {/* ---- visas, the ban, 11 years */}
      <Actor t={t} t0={C.russia8 + 0.3} t1={C.ban9 + 0.2} pose="passport" x={540} y={1500} h={360} rot={-6} />
      <Counter t={t} t0={C.n90 - 0.1} t1={C.exit8 + 1.2} to={90} x={540} y={430} size={170} color={COL.white} sub="दिन का Visa" />
      <Tag t={t} t0={C.exit8 - 0.05} t1={C.ban9} text="EXIT" x={head[0] + 140} y={head[1] + 260} color={COL.red} latin size={46} up={0} />
      <Tag t={t} t0={C.entry8 - 0.1} t1={C.ban9} text="ENTRY" x={head[0] - 150} y={head[1] + 200} color={COL.green} latin size={46} up={0} rot={3} />
      <Stamp t={t} t0={C.ban9 - 0.05} t1={C.siberia9 + 0.4} x={540} y={430} rot={-8} color={COL.red}>
        <span style={{ fontFamily: NUM, fontSize: 120, color: COL.red, letterSpacing: 6 }}>BANNED</span>
      </Stamp>
      <Kin text="SIBERIA" t={t} t0={C.siberia9 - 0.05} t1={C.n11 - 0.1} x={540} y={420} size={110} color={COL.ice} font={NUM} />
      <Counter t={t} t0={C.n11 - 0.1} t1={C.pandemic10 - 0.1} to={11} x={540} y={430} size={190} color={COL.ice} sub="साल, अकेले Russia में" />
      <Overlay name="overlay_snow" a={window4(t, C.jamne7 - 0.2, C.jamne7 + 0.4, C.pandemic10 - 0.3, C.pandemic10) * 0.75} x={540} y={960} w={2000} sc={1 + 0.04 * Math.sin(t * 2)} />

      {/* ---- the pandemic */}
      <Actor t={t} t0={C.pandemic10 - 0.1} t1={C.caspian11 - 0.1} pose="border_barrier" x={540} y={1480} h={360} />
      <Actor t={t} t0={C.pandemic10 + 0.2} t1={C.caspian11 - 0.1} pose="karl_waiting" x={300} y={1560} h={330} />
      <Kin text="सरहदें बंद" t={t} t0={C.sarhad10 - 0.05} t1={C.caspian11 - 0.1} x={540} y={430} size={110} color={COL.red} />

      {/* ---- the Caspian */}
      <Tag t={t} t0={C.caspian11 - 0.05} t1={C.turkey13} text="CASPIAN SEA" x={cas[0] - 60} y={cas[1] + 520} color={COL.sea} latin size={52} up={0} />
      <Kin text="दोनों रास्ते बंद" t={t} t0={C.band11 - 0.15} t1={C.kood12 - 0.05} x={540} y={430} size={92} color={COL.red} />
      <Overlay name="overlay_splash" a={window4(t, C.kood12 - 0.05, C.kood12 + 0.05, C.kood12 + 0.5, C.kood12 + 0.9)} x={head[0]} y={head[1] - 40} w={900} />
      <Actor t={t} t0={C.kood12} t1={C.turkey13} pose="karl_swim" x={head[0] - 30} y={head[1] + 70} h={150} shadow={false} drop={false} bob={4} />
      <Actor t={t} t0={C.kood12 + 0.3} t1={C.turkey13} pose="support_boat" x={head[0] + 150} y={head[1] + 40} h={130} shadow={false} drop={false} bob={3} sway={2} />
      <Counter t={t} t0={C.n31 - 0.1} t1={C.turkey13 - 0.1} to={31} x={330} y={430} size={160} color={COL.sea} sub="दिन" />
      <Counter t={t} t0={C.n288 - 0.1} t1={C.turkey13 - 0.1} to={288} x={760} y={430} size={140} color={COL.white} post=" KM" sub="तैरकर" dur={0.8} />

      {/* ---- Europe, the Channel */}
      <Actor t={t} t0={C.turkey13 - 0.1} t1={C.channel13 - 0.2} pose="karl_walk" x={330} y={1560} h={400} bob={4} path={{ t0: C.turkey13, t1: C.channel13, x: 760, y: 1560 }} />
      <Kin text="TURKEY → EUROPE" t={t} t0={C.turkey13 - 0.05} t1={C.october13} x={540} y={420} size={88} color={COL.gold} font={NUM} />
      <Tag t={t} t0={C.channel13 - 0.1} t1={C.n28b} text="ENGLISH CHANNEL" x={dov[0] + 20} y={dov[1] + 120} color={COL.sea} latin size={46} up={0} />
      <Actor t={t} t0={C.channel13} t1={C.england13 + 0.6} pose="karl_swim" x={head[0] - 20} y={head[1] + 70} h={150} shadow={false} drop={false} bob={4} />
      <Stamp t={t} t0={C.england13 - 0.05} t1={C.n28b - 0.1} x={540} y={430} rot={-4}>
        <div style={{ fontFamily: NUM, fontSize: 96, color: '#fff', letterSpacing: 3, lineHeight: 1.05 }}>ENGLAND</div>
        <div style={{ fontFamily: NUM, fontSize: 50, color: COL.gold, letterSpacing: 3 }}>OCT 2026</div>
      </Stamp>

      {/* ---- 28 years, 50,000 km (globe) */}
      <Counter t={t} t0={C.n28b - 0.05} t1={C.ghar14 - 0.2} to={28} x={540} y={360} size={170} color={COL.gold} sub="साल" dur={0.6} />
      <Counter t={t} t0={C.n50k - 0.1} t1={C.ghar14 - 0.2} to={50000} pre="~" x={540} y={640} size={130} color={COL.white} post=" KM" dur={1.0} />

      {/* ---- home */}
      {flat > 0.5 && <Tag t={t} t0={C.ghar14 - 0.05} t1={C.junoon15 - 0.6} text="HULL · घर" x={hull[0]} y={hull[1]} color={COL.gold} size={52} up={120} />}
      <Actor t={t} t0={C.ghar14 + 0.1} t1={DURATION_S + 1} pose="home" x={720} y={1520} h={420} glow="rgba(255,200,110,0.45)" />
      <Actor t={t} t0={C.ghar14 + 0.4} t1={DURATION_S + 1} pose="karl_arrive" x={330} y={1560} h={520} bob={3} />
      <Kin text="बस कुछ सौ KM दूर" t={t} t0={C.sau14 - 0.2} t1={C.junoon15 - 0.6} x={540} y={430} size={84} color={COL.gold} />
      <Question t={t} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- frame-level
export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.n28, 9], [C.kyon3, 10], [C.y1998, 8], [C.darien5 + 0.4, 9], [C.n18, 8], [C.giraftar7, 10], [C.ban9, 12],
    [C.kood12, 10], [C.england13, 8], [C.n28b, 8]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

/** Scene grades (a Lumetri look per section): jungle warm-green, ice and Siberia cold blue, pandemic drained, sea teal, home golden. */
export const gradeAt = (t: number) => ({
  jungle: window4(t, C.imtihan5 - 0.2, C.darien5, C.panama6, C.panama6 + 0.4),
  cold: window4(t, C.jamne7 - 0.4, C.jamne7, C.n11 + 0.6, C.pandemic10),
  drain: window4(t, C.pandemic10 - 0.1, C.pandemic10 + 0.3, C.caspian11 - 0.2, C.caspian11 + 0.2),
  gold: ramp(t, C.ghar14 - 0.3, C.ghar14 + 0.6),
});

export const Grade: React.FC<{ t: number }> = ({ t }) => {
  const g = gradeAt(t);
  const flash = Math.max(window4(t, C.n28 - 0.02, C.n28, C.n28 + 0.05, C.n28 + 0.35) * 0.5, window4(t, C.ban9 - 0.02, C.ban9, C.ban9 + 0.05, C.ban9 + 0.4) * 0.45);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,60,80,0.20), rgba(0,40,60,0.06) 40%, rgba(255,150,60,0.06) 70%, rgba(255,140,40,0.12))', mixBlendMode: 'soft-light' }} />
      {g.jungle > 0 && <AbsoluteFill style={{ background: '#2c5a1a', opacity: g.jungle * 0.25, mixBlendMode: 'soft-light' }} />}
      {g.cold > 0 && <AbsoluteFill style={{ background: 'linear-gradient(180deg, #1b3f6e, #5b86b8)', opacity: g.cold * 0.32, mixBlendMode: 'multiply' }} />}
      {g.drain > 0 && <AbsoluteFill style={{ background: '#3a3f45', opacity: g.drain * 0.3, mixBlendMode: 'color' }} />}
      {g.gold > 0 && <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(255,190,90,0.25), rgba(255,140,50,0.15))', opacity: g.gold, mixBlendMode: 'soft-light' }} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.45), rgba(0,0,0,0) 24%, rgba(0,0,0,0) 70%, rgba(0,6,12,0.6))' }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.55, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};

/** Subtitles: Mukta ExtraBold, heavy outline; numbers and English names in gold. Hidden under the hook and the end card. */
const HOT = /^[0-9,~]+|^[A-Za-z]/;
export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.4;
  if (i < 0 || t < C.karl4 - 0.2 || t > end || t > C.junoon15 - 0.6) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = ramp(t, t0, t0 + 0.08, linear) * (1 - ramp(t, t1 - 0.02, t1, linear));
  if (a <= 0) return null;
  const s = lerp(0.86, 1, clamp01(pop(t, t0, 12, 260)));
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: 1620, textAlign: 'center', fontFamily: SUB, fontWeight: 800, fontSize: 58, lineHeight: 1.22,
      color: '#fff', opacity: a, transform: `scale(${s})`, textShadow: '0 4px 0 rgba(0,0,0,0.4), 0 6px 18px rgba(0,0,0,0.7)', ...STROKE(9, '#000') }}>
      {text.split(' ').map((w, k) => <span key={k} style={{ color: HOT.test(w) ? COL.gold : '#fff' }}>{w}{' '}</span>)}
    </div>
  );
};
