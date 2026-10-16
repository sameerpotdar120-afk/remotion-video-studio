import React from 'react';
import { AbsoluteFill } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import { C, CAPS, Cam, DURATION_S, GEO, P, merc, toScreen } from './cam';
import { HEAD, NUM, SUB } from './fonts';
import { COL, ROUTES, along } from './Plane';
import { Part, Rig, has } from './Rig';

const STROKE = (w: number, col = '#120a02') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';
const S = (c: Cam, at: P) => toScreen(c, at);
const pl = GEO.places;

/** A callout: a pin ring on the place, a thin line, and a white-outlined name box. */
const Label: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; pin?: P; size?: number }> = ({ t, t0, t1, text, x, y, color, pin, size = 46 }) => {
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const out = ramp(t, t1, t1 + 0.25, easeIn);
  const line = ramp(t, t0 - 0.05, t0 + 0.2, easeOut) * (1 - out);
  const s = clamp01(pop(t, t0 + 0.12, 8, 260)) * (1 - out);
  const ring = clamp01(pop(t, t0 - 0.05, 9, 260)) * (1 - out);
  return (
    <>
      {pin && (
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <line x1={pin[0]} y1={pin[1]} x2={lerp(pin[0], x, line)} y2={lerp(pin[1], y, line)} stroke="#fff" strokeWidth={4} style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.7))' }} />
          <circle cx={pin[0]} cy={pin[1]} r={20 * ring} fill="none" stroke="#fff" strokeWidth={5} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
          <circle cx={pin[0]} cy={pin[1]} r={8 * ring} fill="#fff" />
        </svg>
      )}
      {s > 0.01 && (
        <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, whiteSpace: 'nowrap', background: 'rgba(8,16,26,0.7)', color: '#fff',
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
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', textAlign: 'center',
      fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.1, textShadow: `${SHADOW}, 0 0 34px ${color}55`, ...STROKE(size > 150 ? 12 : 9) }}>{text}</div>
  );
};

/** A chip: a small boxed line of text. */
const Chip: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; size?: number; rot?: number; fill?: string }> = ({ t, t0, t1, text, x, y, color, size = 52, rot = -2, fill }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 8, 260));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 800, fontSize: size,
      color: '#fff', background: fill ?? 'rgba(8,16,26,0.8)', border: `5px solid ${color}`, borderRadius: 16, padding: '6px 26px 0', boxShadow: `${SHADOW}, 0 0 24px ${color}66` }}>{text}</div>
  );
};

/** A rolling counter (Anton numerals), with decimals. */
const Counter: React.FC<{ t: number; t0: number; t1: number; to: number; x: number; y: number; size?: number; color?: string; post?: string; dec?: number; dur?: number }> = ({
  t, t0, t1, to, x, y, size = 160, color = COL.gold, post = '', dec = 0, dur = 0.8,
}) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.2, t1);
  if (a <= 0) return null;
  const v = lerp(0, to, ramp(t, t0, t0 + dur, easeOut));
  const s = clamp01(pop(t, t0, 10, 240)) * (1 + kick(t, t0 + dur, 0.08, 26, 9));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, textAlign: 'center', whiteSpace: 'nowrap',
      fontFamily: NUM, fontSize: size, color, lineHeight: 1, letterSpacing: 2, textShadow: `${SHADOW}, 0 0 30px ${color}66`, ...STROKE(8) }}>
      {v.toFixed(dec)}<span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: size * 0.5 }}>{post}</span>
    </div>
  );
};

/** The Mongla tag: "INDIA ECONOMIC ZONE · 2015" in blue, which flips over to China's red. */
const ZoneTag: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const a = window4(t, C.y2015 - 0.1, C.y2015 + 0.15, C.teesta7 - 0.3, C.teesta7);
  if (a <= 0) return null;
  const pin = S(c, pl.mongla);
  const flip = ramp(t, C.china6 - 0.15, C.china6 + 0.2, inOut);
  const india = flip < 0.5;
  const sx = Math.abs(Math.cos(flip * Math.PI));
  const x = 540, y = 600;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: a }}>
        <line x1={pin[0]} y1={pin[1]} x2={x} y2={y + 60} stroke="#fff" strokeWidth={4} />
        <circle cx={pin[0]} cy={pin[1]} r={14} fill="#fff" style={{ filter: `drop-shadow(0 0 10px ${india ? COL.india : COL.china})` }} />
      </svg>
      <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${clamp01(pop(t, C.y2015, 8, 240)) * sx}, ${clamp01(pop(t, C.y2015, 8, 240))})`, opacity: a,
        whiteSpace: 'nowrap', textAlign: 'center', background: india ? COL.india : COL.china, color: '#fff', border: '5px solid #fff', borderRadius: 18, padding: '10px 30px 4px',
        fontFamily: NUM, fontSize: 52, letterSpacing: 2, lineHeight: 1.1, boxShadow: `${SHADOW}, 0 0 34px ${india ? COL.india : COL.china}` }}>
        {india ? 'INDIA ECONOMIC ZONE' : 'CHINA ECONOMIC ZONE'}
        <div style={{ fontSize: 34, opacity: 0.9 }}>{india ? 'MONGLA · 2015' : 'MONGLA · 2026'}</div>
      </div>
    </>
  );
};

/** A prop that travels along a route (truck, train, ship, tanker), placed by the camera. */
const Mover: React.FC<{ t: number; c: Cam; set: string; part: string; route: P[]; t0: number; t1: number; f0: number; f1: number; h: number; flip?: boolean; wheels?: boolean; dy?: number }> = ({
  t, c, set, part, route, t0, t1, f0, f1, h, flip, wheels, dy = -40,
}) => {
  if (t < t0 - 0.05 || t > t1 + 0.5) return null;
  const f = lerp(f0, f1, ramp(t, t0, t1, linear));
  const [x, y] = S(c, along(route, f));
  const [x2] = S(c, along(route, Math.min(1, f + 0.01)));
  const right = x2 >= x;
  const spin = (t * 540) % 360;
  const mirror = flip ? right : !right;
  const parts: Part[] = [{ name: part, flip: mirror }];
  // the truck's wheel arches sit at 22% and 83% of its width, 85% down (measured on the cut-out; width = 2.26 × height)
  if (wheels) for (const wx of [-0.63, 0.75]) parts.push({ name: 'wheel', box: [mirror ? -wx : wx, 0.36, 0.3], rot: mirror ? -spin : spin });
  return <Rig set={set} parts={parts.map((p) => ({ ...p, box: p.box ?? [0, 0, 1] }))} x={x} y={y + dy} h={h} t={t} t0={t0} t1={t1} entry="pop" float={0.3} />;
};

/** The rigged UE5 props: each on its beat, many placed on the map by the camera. */
const Props: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const at = (p: P) => S(c, p);
  const [ux, uy] = at(pl.neck);
  const [mx, my] = at(pl.mongla);
  const [ax, ay] = at(merc(92.75, 11.4));
  const tubes = ramp(t, C.n3_8 + 0.9, C.n3_8 + 1.6, easeOut);
  const dish = Math.cos(t * 2.4);
  return (
    <>
      {/* the chicken's neck */}
      <Rig set="s1" parts={[{ name: 'chicken', box: [0, 0, 1], rot: Math.sin(t * 7) * 3 * window4(t, C.chicken2, C.chicken2 + 0.2, C.chicken2 + 1, C.chicken2 + 1.4) }]}
        x={ux + 250} y={uy - 120} h={300} t={t} t0={C.chicken2 - 0.05} t1={C.northeast2 - 0.2} entry="pop" />
      {/* road, rail: the truck and the train run through the strip */}
      <Mover t={t} c={c} set="s2" part="truck" route={ROUTES.road} t0={C.sadak3} t1={C.nepal4 - 0.2} f0={0.12} f1={0.75} h={120} wheels />
      <Mover t={t} c={c} set="s3" part="train" route={ROUTES.rail} t0={C.rail3} t1={C.nepal4 - 0.2} f0={0.08} f1={0.68} h={90} dy={10} />
      {/* the second route: a cargo ship along the coast */}
      <Mover t={t} c={c} set="s4" part="ship" route={ROUTES.sea2} t0={C.y2018 + 0.6} t1={C.par6} f0={0} f1={0.75} h={150} />
      {/* China at Mongla: cranes rise, money pours in */}
      <Rig set="s5" parts={[{ name: 'crane', box: [-0.35, 0, 1] }, { name: 'crane', box: [0.35, 0.05, 0.85], flip: true }]} x={mx + 20} y={my - 250} h={420}
        t={t} t0={C.port6 - 0.1} t1={C.teesta7 - 0.2} entry="rise" />
      <Rig set="s6" parts={[{ name: 'coins', box: [0, 0, 1] }]} x={mx + 290} y={my + 80} h={260} t={t} t0={C.paisa6 - 0.05} t1={C.teesta7 - 0.2} entry="drop" glow={COL.gold} />
      {/* India is ready: three bases drop onto the map, the air defence lifts its tubes, a soldier stands guard */}
      {(['kishanganj', 'chopra', 'bamuni'] as const).map((k, i) => {
        const [bx, by] = at(pl[k]);
        return <Rig key={k} set="s7" parts={[{ name: 'army_base', box: [0, 0, 1] }]} x={bx} y={by - 70} h={190} t={t} t0={C.n3_8 + i * 0.22} t1={C.kaladan8 - 0.2} entry="drop" float={0.2} />;
      })}
      <Rig set="s8" parts={[
        { name: 'launcher_body', box: [0, 0.1, 0.62] },
        { name: 'launcher_tubes', box: [0.08, -0.16, 0.42], pivot: [0.08, 0.6], rot: -32 * tubes },
      ]} x={780} y={1360} h={380} t={t} t0={C.n3_8 + 0.6} t1={C.kaladan8 - 0.2} entry="slideR" />
      <Rig set="s9" parts={[{ name: 'soldier', box: [0, 0, 1] }]} x={230} y={1300} h={560} t={t} t0={C.n3_8 + 0.4} t1={C.kaladan8 - 0.2} entry="slideL" float={0.3} />
      {/* Kaladan: the same cargo ship, now to Sittwe */}
      <Mover t={t} c={c} set="s4" part="ship" route={ROUTES.kaladan} t0={C.kaladan8 + 0.4} t1={C.aur9 - 0.2} f0={0.05} f1={0.48} h={130} />
      {/* China's oil comes by tanker through Malacca */}
      <Mover t={t} c={c} set="s10" part="tanker" route={ROUTES.oil} t0={C.tel9} t1={C.darwaze9} f0={0.36} f1={0.62} h={150} />
      {/* India at the door: a radar post on the Andamans, its antenna sweeping */}
      <Rig set="s11" parts={[
        { name: 'radar_base', box: [0, 0.08, 1] },
        { name: 'radar_dish', box: [0.02, -0.38, 0.34], sx: 0.25 + 0.75 * Math.abs(dish) },
      ]} x={ax + 230} y={ay - 160} h={340} t={t} t0={C.andaman9 - 0.1} t1={C.to10 - 0.1} entry="rise" />
    </>
  );
};

/** The closing card: two answers to choose from. */
const Choice: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.kamzori10 - 0.2, C.kamzori10, DURATION_S, DURATION_S + 1);
  if (a <= 0) return null;
  const btn = (label: string, col: string, t0: number, x: number) => (
    <div style={{ position: 'absolute', left: x, top: 700, transform: `translate(-50%,-50%) scale(${clamp01(pop(t, t0, 9, 240)) * (1 + 0.04 * Math.sin(t * 6 + x))})`, whiteSpace: 'nowrap',
      background: col, border: '6px solid #fff', borderRadius: 26, padding: '14px 40px 6px', fontFamily: HEAD, fontWeight: 800, fontSize: 70, color: '#fff', boxShadow: `${SHADOW}, 0 0 40px ${col}` }}>{label}</div>
  );
  return (
    <AbsoluteFill style={{ opacity: a, pointerEvents: 'none' }}>
      {btn('कमज़ोरी', '#E0262B', C.kamzori10, 300)}
      {btn('ताकत', '#16A34A', C.taqat10, 780)}
      <div style={{ position: 'absolute', left: 540, top: 700, transform: 'translate(-50%,-50%)', fontFamily: NUM, fontSize: 60, color: '#fff', opacity: ramp(t, C.taqat10, C.taqat10 + 0.2), ...STROKE(6) }}>OR</div>
    </AbsoluteFill>
  );
};

export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const sg = S(c, pl.siliguri), ct = S(c, pl.chattogram), mo = S(c, pl.mongla), ko = S(c, pl.kolkata);
  const sit = S(c, pl.sittwe), miz = S(c, pl.aizawl), ph = S(c, pl.phillips), ch = S(c, pl.yadong);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <Props t={t} c={c} />

      {/* hook: 22 km → cut → 4.5 crore people → "where?" */}
      <Big t={t} t0={C.kati1} t1={C.crore1 - 0.1} text="अगर ये कटी…" x={540} y={330} size={110} color={COL.red} />
      <Counter t={t} t0={C.crore1 - 0.05} t1={C.kahan1} to={4.5} dec={1} post=" करोड़ लोग" x={540} y={330} size={150} color={COL.gold} />
      <Chip t={t} t0={C.khatam1 - 0.1} t1={C.kahan1} text="ज़मीनी रास्ता ख़त्म" x={540} y={480} color={COL.red} size={54} />
      <Big t={t} t0={C.kahan1} t1={C.siliguri2 - 0.1} text="कहाँ है ये पट्टी?" x={540} y={330} size={104} />

      {/* the corridor and the chicken's neck; 8 states, 8% */}
      <Label t={t} t0={C.siliguri2 + 0.4} t1={C.northeast2 - 0.2} text="SILIGURI" x={760} y={470} color={COL.corridor} pin={sg} />
      <Big t={t} t0={C.chicken2} t1={C.northeast2 - 0.1} text="CHICKEN'S NECK" x={540} y={300} size={120} color={COL.gold} font={NUM} rot={-2} />
      <Counter t={t} t0={C.n8a2 - 0.05} t1={C.n8b2 - 0.1} to={8} post=" राज्य" x={540} y={330} size={170} color={COL.ne} dur={0.5} />
      <Counter t={t} t0={C.n8b2 - 0.05} t1={C.sadak3 - 0.1} to={8} post="% ज़मीन" x={540} y={330} size={170} color={COL.gold} dur={0.5} />

      {/* road, rail, oil */}
      <Chip t={t} t0={C.sadak3} t1={C.nepal4 - 0.2} text="सड़क" x={230} y={330} color={COL.road} size={56} />
      <Chip t={t} t0={C.rail3} t1={C.nepal4 - 0.2} text="रेल" x={540} y={330} color={COL.rail} size={56} />
      <Chip t={t} t0={C.tel3} t1={C.nepal4 - 0.2} text="तेल पाइपलाइन" x={850} y={330} color={COL.oil} size={56} />
      <Big t={t} t0={C.sab3} t1={C.nepal4 - 0.2} text="सब यहीं से!" x={540} y={470} size={96} color={COL.gold} />

      {/* the neighbours and the Chumbi Valley (names are on the map) */}
      <Label t={t} t0={C.chumbi4 + 0.3} t1={C.isiliye5} text="CHINA" x={760} y={420} color={COL.china} pin={ch} />
      <Big t={t} t0={C.chumbi4 + 0.2} t1={C.isiliye5} text="⚠ बीच में China" x={540} y={300} size={96} color={COL.red} />

      {/* the second route */}
      <Chip t={t} t0={C.y2018 - 0.1} t1={C.par6 - 0.2} text="2018 का समझौता" x={540} y={300} color={COL.gold} size={58} />
      <Label t={t} t0={C.y2018 + 0.2} t1={C.par6 - 0.2} text="KOLKATA" x={250} y={520} color={COL.india} pin={ko} size={40} />
      <Label t={t} t0={C.ctg5} t1={C.par6 - 0.2} text="CHATTOGRAM" x={800} y={560} color={COL.gold} pin={ct} size={40} />
      <Label t={t} t0={C.mongla5} t1={C.par6 - 0.2} text="MONGLA" x={520} y={1360} color={COL.gold} pin={mo} size={40} />

      {/* Mongla: India's zone becomes China's; China pays for the port */}
      <ZoneTag t={t} c={c} />
      <Big t={t} t0={C.china6} t1={C.port6 - 0.1} text="अब China का!" x={540} y={330} size={110} color={COL.red} />
      <Chip t={t} t0={C.paisa6} t1={C.teesta7 - 0.2} text="$336 M · China Exim Bank" x={540} y={330} color={COL.china} size={48} />

      {/* the Teesta project */}
      <Chip t={t} t0={C.teesta7 + 0.3} t1={C.par8 - 0.2} text="TEESTA PROJECT" x={540} y={300} color={COL.river} size={56} />
      <Big t={t} t0={C.karib7} t1={C.par8 - 0.1} text="बेहद करीब!" x={540} y={450} size={100} color={COL.red} />

      {/* India is ready */}
      <Big t={t} t0={C.taiyar8} t1={C.army8 + 0.6} text="India भी तैयार!" x={540} y={300} size={110} color={COL.gold} />
      <Counter t={t} t0={C.n3_8 - 0.05} t1={C.kaladan8 - 0.1} to={3} post=" नए ठिकाने" x={540} y={300} size={140} color={COL.gold} dur={0.4} />
      <Chip t={t} t0={C.kaladan8} t1={C.aur9 - 0.2} text="KALADAN PROJECT" x={540} y={300} color={COL.mizoram} size={58} />
      <Label t={t} t0={C.myanmar8 + 0.3} t1={C.aur9 - 0.2} text="SITTWE" x={280} y={1250} color={COL.myanmar} pin={sit} size={40} />
      <Label t={t} t0={C.mizoram8} t1={C.aur9 - 0.2} text="MIZORAM" x={820} y={560} color={COL.mizoram} pin={miz} size={40} />

      {/* China's own thin neck */}
      <Big t={t} t0={C.gardan9} t1={C.tel9 - 0.1} text="China की भी गर्दन!" x={540} y={560} size={100} color={COL.red} />
      <Chip t={t} t0={C.tel9} t1={C.malacca9} text="China का तेल" x={540} y={300} color={COL.oil} size={58} />
      <Counter t={t} t0={C.n28 - 0.05} t1={C.darwaze9 - 0.1} to={2.8} dec={1} post=" KM" x={540} y={330} size={170} color={COL.gold} dur={0.6} />
      <Label t={t} t0={C.n28} t1={C.darwaze9 - 0.1} text="SINGAPORE STRAIT" x={760} y={1300} color={COL.gold} pin={ph} size={36} />
      <Chip t={t} t0={C.andaman9} t1={C.to10 - 0.1} text="दरवाज़े पर India" x={540} y={300} color={COL.gold} size={64} />

      {/* the question */}
      <Choice t={t} />
    </AbsoluteFill>
  );
};

/** Whip transitions on the big moves. */
const WHIPS = () => [C.kahan1 + 0.1, C.northeast2 - 0.1, C.sadak3 - 0.1, C.nepal4 - 0.2, C.isiliye5 + 0.1, C.par6, C.teesta7, C.kaladan8, C.aur9, C.malacca9, C.darwaze9, C.to10];
export const Whips: React.FC<{ t: number }> = ({ t }) => (
  <>
    {WHIPS().map((w, i) => {
      const p = ramp(t, w, w + 0.32, linear);
      if (p <= 0 || p >= 1) return null;
      const dir = i % 2 ? -1 : 1;
      return (
        <AbsoluteFill key={i} style={{ pointerEvents: 'none', mixBlendMode: 'screen', opacity: Math.sin(p * Math.PI) * 0.75,
          background: `linear-gradient(${dir > 0 ? 100 : 80}deg, rgba(255,255,255,0) ${lerp(-40, 100, p) - 25}%, rgba(200,225,255,0.9) ${lerp(-40, 100, p)}%, rgba(255,255,255,0) ${lerp(-40, 100, p) + 25}%)` }} />
      );
    })}
  </>
);

/** Section grades: a cool, dark geopolitical base (deep blue shadows); a red danger pulse when the strip is cut and
 *  when China closes in; a warm gold when India answers. Vignette and film grain on top. */
export const gradeAt = (t: number) => ({
  danger: window4(t, C.kati1 - 0.05, C.kati1 + 0.2, C.kahan1, C.kahan1 + 0.4) + window4(t, C.chumbi4, C.chumbi4 + 0.3, C.isiliye5, C.isiliye5 + 0.4) * 0.6 +
    window4(t, C.china6, C.china6 + 0.3, C.port6, C.port6 + 0.5) * 0.5 + window4(t, C.karib7, C.karib7 + 0.3, C.par8, C.par8 + 0.3) * 0.5,
  gold: window4(t, C.taiyar8 - 0.2, C.taiyar8 + 0.3, C.kaladan8, C.kaladan8 + 0.5) + window4(t, C.andaman9, C.andaman9 + 0.4, C.to10, C.to10 + 0.4),
});
export const Grade: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const g = gradeAt(t);
  let flash = 0;
  for (const h of [C.kati1, C.siliguri2, C.chumbi4, C.china6, C.n3_8, C.n28]) flash = Math.max(flash, window4(t, h - 0.02, h, h + 0.04, h + 0.3));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,40,110,0.32), rgba(0,20,60,0.12) 45%, rgba(10,30,80,0.22))', mixBlendMode: 'soft-light' }} />
      {g.danger > 0 && (
        <>
          <AbsoluteFill style={{ background: '#ff1a2a', opacity: clamp01(g.danger) * (0.18 + 0.08 * Math.sin(t * 9)), mixBlendMode: 'soft-light' }} />
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,0,0,0) 45%, rgba(200,0,20,0.55) 100%)', opacity: clamp01(g.danger) }} />
        </>
      )}
      {g.gold > 0 && <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(255,170,60,0.35), rgba(255,120,40,0.18))', opacity: clamp01(g.gold), mixBlendMode: 'soft-light' }} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,6,16,0.5), rgba(0,0,0,0) 24%, rgba(0,0,0,0) 70%, rgba(0,6,12,0.55))' }} />
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: 'overlay', backgroundImage: GRAIN, backgroundSize: '256px 256px', backgroundPosition: `${(frame * 73) % 256}px ${(frame * 151) % 256}px` }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#eaf2ff', opacity: flash * 0.3, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='256' height='256' filter='url(%23n)'/></svg>")`;

/** Subtitles: Mukta ExtraBold, karaoke (the spoken word lights green), English names and numbers in gold. */
const HOT = /^[0-9,.~₹$]+|^[A-Za-z]/;
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
  const len = words.map((w) => Math.max(1, w.replace(/[…।,?!:.]/g, '').length));
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

export { has, inOut };
