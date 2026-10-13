import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import sizes from '../../public/twins/img_sizes.json';
import { C, CAPS, Cam, DURATION_S, GEO, P, THAI_TWIN, pxPerM, toScreen } from './cam';
import { HEAD, NUM, SUB } from './fonts';
import { BIG, MIRROR_Y, PAIR, TOGO_COAST } from './Shapes';

export const COL = { gold: '#FFD84A', red: '#FF4D5E', green: '#3DDC4A', mint: '#3EE6A0', sea: '#38B6FF', white: '#FFF6E6', violet: '#B67CFF' };
const SZ = sizes as unknown as Record<string, [number, number]>;
const img = (n: string) => staticFile(`twins/img/${n}.png`);
const STROKE = (w: number, col = '#120a02') => ({ WebkitTextStroke: `${w}px ${col}`, paintOrder: 'stroke fill' as const });
const SHADOW = '0 6px 0 rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.65)';
const G = GEO.c;

/** A prop image centred on a screen point; springs in, can turn and scale. Skipped until the asset exists. */
const Prop: React.FC<{ name: string; x: number; y: number; h: number; a?: number; rot?: number; sc?: number; flip?: boolean; glow?: string; shadow?: boolean }> = ({
  name, x, y, h, a = 1, rot = 0, sc = 1, flip, glow, shadow = true,
}) => {
  if (a <= 0.001 || sc <= 0.01 || !SZ[name]) return null;
  const [iw, ih] = SZ[name];
  const w = (h * iw) / ih;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a, transform: `rotate(${rot}deg) scale(${sc * (flip ? -1 : 1)}, ${sc})`,
      filter: `${glow ? `drop-shadow(0 0 22px ${glow}) ` : ''}${shadow ? 'drop-shadow(0 14px 14px rgba(0,0,0,0.55))' : ''}` }}>
      <img src={img(name)} style={{ width: w, height: h, display: 'block' }} />
    </div>
  );
};

/** A country name pill (Latin, Anton) that pops in near a shape. */
const Label: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; rot?: number }> = ({ t, t0, t1, text, x, y, color, rot = -3 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = clamp01(pop(t, t0, 8, 260)) * (1 - ramp(t, t1, t1 + 0.25, easeIn));
  if (s <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, whiteSpace: 'nowrap', background: color, color: '#140c03',
      padding: '8px 26px 2px', borderRadius: 14, border: '4px solid #140c03', fontFamily: NUM, fontSize: 54, letterSpacing: 1.5, boxShadow: SHADOW, lineHeight: 1.15 }}>{text}</div>
  );
};

/** Kinetic headline: letters rise in one by one. */
const Big: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; size?: number; color?: string; font?: string; rot?: number }> = ({ t, t0, t1, text, x, y, size = 110, color = '#fff', font = HEAD, rot = -3 }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.15, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 9, 260)) + kick(t, t0 + 0.12, 0.06, 24, 9);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: a, whiteSpace: 'nowrap', textAlign: 'center',
      fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.1, textShadow: `${SHADOW}, 0 0 34px ${color}55`, ...STROKE(size > 150 ? 12 : 9) }}>{text}</div>
  );
};

/** The countdown badge: a big Anton number in a gold disc, with the spoken word under it. */
const Num: React.FC<{ t: number; t0: number; t1: number; n: string; word: string; color: string }> = ({ t, t0, t1, n, word, color }) => {
  const a = window4(t, t0 - 0.05, t0 + 0.05, t1 - 0.2, t1);
  if (a <= 0) return null;
  const s = clamp01(pop(t, t0, 8, 280)) * (1 + kick(t, t0 + 0.14, 0.1, 26, 9));
  const spin = lerp(-200, 0, clamp01(ramp(t, t0, t0 + 0.35, easeOut)));
  return (
    <div style={{ position: 'absolute', left: 540, top: 300, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, textAlign: 'center' }}>
      <div style={{ width: 210, height: 210, borderRadius: '50%', margin: '0 auto', background: `radial-gradient(circle at 35% 30%, #fff6c8, ${color} 45%, #b07a00)`, border: '8px solid #140c03',
        boxShadow: `${SHADOW}, 0 0 50px ${color}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${spin}deg)` }}>
        <span style={{ fontFamily: NUM, fontSize: 150, color: '#140c03', lineHeight: 1, marginTop: 12 }}>{n}</span>
      </div>
      <div style={{ marginTop: 6, fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: '#fff', textShadow: SHADOW, ...STROKE(8) }}>{word}</div>
    </div>
  );
};

/** A magnifying glass drawn in code (used if the asset is missing). */
const Glass: React.FC<{ x: number; y: number; r: number; rot: number }> = ({ x, y, r, rot }) => (
  <svg width={r * 4} height={r * 4} style={{ position: 'absolute', left: x - r * 2, top: y - r * 2, overflow: 'visible', transform: `rotate(${rot}deg)` }}>
    <line x1={r * 2 + r * 0.7} y1={r * 2 + r * 0.7} x2={r * 2 + r * 1.75} y2={r * 2 + r * 1.75} stroke="#4a2c12" strokeWidth={r * 0.32} strokeLinecap="round" />
    <circle cx={r * 2} cy={r * 2} r={r} fill="rgba(200,240,255,0.12)" stroke="#d9a441" strokeWidth={r * 0.16} style={{ filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.6))' }} />
    <path d={`M${r * 1.45},${r * 1.55} A${r * 0.7},${r * 0.7} 0 0 1 ${r * 2.35},${r * 1.3}`} stroke="#fff" strokeWidth={r * 0.08} fill="none" opacity={0.8} />
  </svg>
);

const shapePos = (c: Cam, k: keyof typeof G, dx = 0, dy = 0): P => toScreen(c, [G[k].centre[0] + dx, G[k].centre[1] + dy]);

export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const k = pxPerM(c);
  // ---------------------------------------------------------------- hook
  const glassP = ramp(t, C.notice1 - 0.5, C.notice1 + 1.1, inOut);
  const glassA = window4(t, C.notice1 - 0.5, C.notice1 - 0.3, C.notice1 + 0.9, C.notice1 + 1.15);
  const gx = lerp(-120, 1200, glassP), gy = 960 + Math.sin(glassP * Math.PI * 2) * 140;
  // ---------------------------------------------------------------- 1
  const slide = ramp(t, C.samne4 - 0.25, C.samne4 + 0.6, inOut);
  const thai = shapePos(c, 'thailand', (THAI_TWIN[0] - G.thailand.centre[0]) * slide, (THAI_TWIN[1] - G.thailand.centre[1]) * slide);
  const myan = shapePos(c, 'myanmar');
  const stampAt = (t0: number, at: P) => {
    const down = ramp(t, t0 - 0.25, t0, easeIn), upq = ramp(t, t0 + 0.12, t0 + 0.4, easeOut);
    return { y: at[1] - 300 + 200 * down - 200 * upq, a: window4(t, t0 - 0.3, t0 - 0.2, t0 + 0.3, t0 + 0.45) };
  };
  const st1 = stampAt(C.same4 + 0.25, thai), st2 = stampAt(C.saanche4 + 0.05, myan);
  // ---------------------------------------------------------------- 2
  const togo = shapePos(c, 'togo'), benin = shapePos(c, 'benin');
  const coastMid = toScreen(c, [(TOGO_COAST.w[0] + TOGO_COAST.e[0]) / 2, TOGO_COAST.w[1]]);
  // ---------------------------------------------------------------- 3
  const italy = shapePos(c, 'italy'), viet = shapePos(c, 'vietnam');
  const itH = (G.italy.bbox[3] - G.italy.bbox[1]) * k, vnH = (G.vietnam.bbox[3] - G.vietnam.bbox[1]) * k;
  const bootIt = window4(t, C.boot7, C.boot7 + 0.35, C.asli9 - 0.1, C.asli9 + 0.3) * (t > C.hazaron8 + 0.3 && t < C.farak8 + 0.2 ? 0 : 1);
  const bootVn = window4(t, C.boot8 - 0.05, C.boot8 + 0.1, C.farak8 + 0.1, C.farak8 + 0.4);
  const bootDrop = (t0: number) => lerp(-260, 0, clamp01(ramp(t, t0 - 0.05, t0 + 0.2, easeIn))) * (1 - 0) + kick(t, t0 + 0.2, 18, 24, 9);
  const kickRot = t > C.laat8 - 0.15 ? -9 * Math.sin(clamp01((t - C.laat8 + 0.15) / 0.35) * Math.PI) : 0;
  const sic = toScreen(c, GEO.sicily);
  const ballIn = clamp01(pop(t, C.football8, 8, 240));
  const fly = ramp(t, C.laat8 + 0.05, C.laat8 + 0.9, linear);
  const ballX = sic[0] - 520 * fly, ballY = sic[1] + 90 * fly - Math.sin(fly * Math.PI) * 260;
  const ballA = window4(t, C.football8 - 0.05, C.football8 + 0.05, C.laat8 + 1.0, C.laat8 + 1.2);
  // ---------------------------------------------------------------- 4
  const nor = shapePos(c, 'norway'), chi = shapePos(c, 'chile');
  const norH = (G.norway.bbox[3] - G.norway.bbox[1]) * k * BIG, chH = (G.chile.bbox[3] - G.chile.bbox[1]) * k * BIG;
  const chil = window4(t, C.mirchi11 - 0.05, C.mirchi11 + 0.25, C.aaina11 - 0.2, C.aaina11 + 0.2);
  const mirrorY = toScreen(c, [-2.5e6, MIRROR_Y])[1];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* hook: picture first, then three words */}
      <Big t={t} t0={0} t1={C.maps1 + 0.5} text="जुड़वा देश?" x={540} y={330} size={150} color={COL.gold} />
      {SZ.magnifying_glass ? <Prop name="magnifying_glass" x={gx} y={gy} h={520} a={glassA} rot={-12 + glassP * 20} /> : glassA > 0 && <div style={{ opacity: glassA }}><Glass x={gx} y={gy} r={150} rot={0} /></div>}
      <Big t={t} t0={C.judwa2 - 0.05} t1={C.pehla3} text="जुड़वा!" x={540} y={420} size={140} color={COL.gold} rot={3} />

      {/* 1 */}
      <Num t={t} t0={C.pehla3} t1={C.thai3 + 0.6} n="1" word="पहला" color={COL.gold} />
      <Label t={t} t0={C.thai3} t1={C.doosra5 - 0.1} text="THAILAND" x={thai[0] + 30} y={thai[1] + 120} color={PAIR.thailand} />
      <Label t={t} t0={C.myan3} t1={C.doosra5 - 0.1} text="MYANMAR" x={myan[0] + 40} y={myan[1] - 210} color={PAIR.myanmar} rot={3} />
      <Prop name="brass_stamp" x={thai[0]} y={st1.y} h={300} a={st1.a} />
      <Prop name="brass_stamp" x={myan[0]} y={st2.y} h={300} a={st2.a} />
      {(() => {
        const t0 = C.same4 + 0.25;
        const a = window4(t, t0, t0 + 0.02, C.doosra5 - 0.2, C.doosra5);
        if (a <= 0) return null;
        const s = ramp(t, t0, t0 + 0.13, easeIn);
        return (
          <div style={{ position: 'absolute', left: 540, top: 1420, transform: `translate(-50%,-50%) rotate(-6deg) scale(${lerp(2.4, 1, s) + kick(t, t0 + 0.13, 0.07, 30, 10)})`, opacity: a,
            padding: '8px 36px 2px', border: `10px solid ${COL.gold}`, borderRadius: 22, background: 'rgba(14,8,2,0.84)', boxShadow: `0 12px 34px rgba(0,0,0,0.55), 0 0 40px ${COL.gold}55`,
            fontFamily: NUM, fontSize: 74, color: COL.gold, letterSpacing: 3, whiteSpace: 'nowrap' }}>SAME TO SAME</div>
        );
      })()}

      {/* 2 */}
      <Num t={t} t0={C.doosra5} t1={C.benin5 + 0.5} n="2" word="दूसरा" color={COL.gold} />
      <Label t={t} t0={C.benin5} t1={C.suno6} text="BENIN" x={benin[0] + 150} y={benin[1] + 260} color={PAIR.benin} rot={4} />
      <Label t={t} t0={C.togo5} t1={C.suno6} text="TOGO" x={togo[0] - 160} y={togo[1] + 200} color={PAIR.togo} />
      <Big t={t} t0={C.lambe6} t1={C.suno6} text="लंबे" x={300} y={360} size={110} color={COL.gold} rot={-6} />
      <Big t={t} t0={C.patle6} t1={C.suno6} text="पतले" x={780} y={360} size={110} color={COL.red} rot={5} />
      {(() => {
        const a = window4(t, C.n56 - 0.1, C.n56 + 0.05, C.teesra7 - 0.2, C.teesra7 + 0.05);
        if (a <= 0) return null;
        const v = Math.round(56 * ramp(t, C.n56 - 0.1, C.n56 + 0.6, easeOut));
        const s = clamp01(pop(t, C.n56 - 0.1, 9, 240)) * (1 + kick(t, C.n56 + 0.6, 0.08, 26, 9));
        return (
          <div style={{ position: 'absolute', left: coastMid[0], top: coastMid[1] - 230, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, textAlign: 'center',
            fontFamily: NUM, fontSize: 170, color: COL.gold, lineHeight: 1, textShadow: `${SHADOW}, 0 0 30px ${COL.gold}66`, ...STROKE(8), whiteSpace: 'nowrap' }}>{v} KM</div>
        );
      })()}
      <Label t={t} t0={C.togo6} t1={C.teesra7 - 0.2} text="TOGO" x={coastMid[0]} y={coastMid[1] - 420} color={PAIR.togo} />

      {/* 3 */}
      <Num t={t} t0={C.teesra7} t1={C.italy7 + 0.4} n="3" word="तीसरा" color={COL.gold} />
      <Label t={t} t0={C.italy7} t1={C.hazaron8 + 0.2} text="ITALY" x={italy[0] + 260} y={Math.max(230, italy[1] - 330)} color={PAIR.italy} rot={4} />
      <Prop name="boot" x={italy[0] - itH * 0.04} y={italy[1] + bootDrop(C.boot7)} h={itH * 0.98} a={bootIt * 0.92} rot={c.rot - 33 + kickRot} />
      <Label t={t} t0={C.vietnam8} t1={C.farak8} text="VIETNAM" x={viet[0] + 210} y={viet[1] - 420} color={PAIR.vietnam} rot={-3} />
      <Prop name="boot" x={viet[0] - vnH * 0.02} y={viet[1] + bootDrop(C.boot8)} h={vnH * 0.95} a={bootVn * 0.92} rot={c.rot - 4} />
      <Label t={t} t0={C.italy8} t1={C.asli9 - 0.2} text="ITALY" x={italy[0] + 260} y={Math.max(230, italy[1] - 330)} color={PAIR.italy} rot={4} />
      {SZ.football
        ? <Prop name="football" x={ballX} y={ballY} h={150} a={ballA} sc={ballIn} rot={fly * -720} glow="#fff" />
        : ballA > 0 && <div style={{ position: 'absolute', left: ballX - 70, top: ballY - 70, width: 140, height: 140, borderRadius: '50%', opacity: ballA, transform: `scale(${ballIn}) rotate(${fly * -720}deg)`,
          background: 'radial-gradient(circle at 35% 30%, #fff, #ddd 60%, #999)', border: '6px solid #111', boxShadow: SHADOW }} />}
      <Big t={t} t0={C.laat8 + 0.05} t1={C.asli9 - 0.1} text="लात!" x={760} y={420} size={130} color={COL.red} rot={8} />

      {/* 4 */}
      <Big t={t} t0={C.asli9} t1={C.norway10 + 0.2} text="असली जुड़वा…" x={540} y={330} size={120} color={COL.gold} />
      <Label t={t} t0={C.norway10} t1={C.aaina11 - 0.2} text="NORWAY" x={nor[0] + 30} y={nor[1] + norH * 0.55} color={PAIR.norway} rot={-4} />
      <Label t={t} t0={C.chile10} t1={C.aaina11 - 0.2} text="CHILE" x={chi[0] + 240} y={chi[1] - 160} color={PAIR.chile} rot={4} />
      <Prop name="chilli_green" x={nor[0] + norH * 0.02} y={nor[1]} h={norH * 1.15} a={chil} sc={clamp01(pop(t, C.mirchi11, 8, 240))} rot={c.rot + 36} />
      <Prop name="chilli_red" x={chi[0]} y={chi[1]} h={chH * 1.12} a={chil} sc={clamp01(pop(t, C.mirchi11 + 0.12, 8, 240))} rot={c.rot + 4} />
      <Big t={t} t0={C.mirchi11} t1={C.upar11} text="मिर्ची!" x={760} y={1380} size={120} color={COL.red} rot={6} />
      <Big t={t} t0={C.upar11} t1={C.aaina11} text="ऊपर ⬆" x={nor[0] - 120} y={Math.max(200, nor[1] - norH * 0.62)} size={84} color={COL.green} rot={-3} />
      <Big t={t} t0={C.neeche11} t1={C.aaina11} text="नीचे ⬇" x={chi[0] + 280} y={chi[1] + 40} size={84} color={COL.red} rot={3} />
      <Big t={t} t0={C.aaina11} t1={C.to12 + 0.4} text="आईना!" x={760} y={mirrorY - 120} size={110} color="#BFF4FF" rot={-4} />
    </AbsoluteFill>
  );
};

/** Whip transitions: a light streak sweeps across the frame on every big camera move. */
const WHIPS = () => [C.maps1 + 0.15, C.pehla3 - 0.1, C.doosra5 - 0.05, C.togo6, C.teesra7 - 0.05, C.hazaron8 + 0.15, C.farak8, C.asli9 - 0.05];
export const Whips: React.FC<{ t: number }> = ({ t }) => (
  <>
    {WHIPS().map((w, i) => {
      const p = ramp(t, w, w + 0.32, linear);
      if (p <= 0 || p >= 1) return null;
      const dir = i % 2 ? -1 : 1;
      return (
        <AbsoluteFill key={i} style={{ pointerEvents: 'none', mixBlendMode: 'screen', opacity: Math.sin(p * Math.PI) * 0.85,
          background: `linear-gradient(${dir > 0 ? 100 : 80}deg, rgba(255,255,255,0) ${lerp(-40, 100, p) - 25}%, rgba(255,240,200,0.9) ${lerp(-40, 100, p)}%, rgba(255,255,255,0) ${lerp(-40, 100, p) + 25}%)` }} />
      );
    })}
  </>
);

/** The NullDynasty grade: teal shadows, warm gold highlights, a vignette, and a flash on the big hits. */
export const Grade: React.FC<{ t: number }> = ({ t }) => {
  let flash = 0;
  for (const h of [C.pehla3, C.doosra5, C.teesra7, C.laat8, C.asli9]) flash = Math.max(flash, window4(t, h - 0.02, h, h + 0.04, h + 0.3));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,70,90,0.24), rgba(0,40,60,0.08) 40%, rgba(255,150,60,0.08) 70%, rgba(255,140,40,0.14))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.45), rgba(0,0,0,0) 24%, rgba(0,0,0,0) 70%, rgba(0,6,12,0.55))' }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.35, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};

/** Subtitles: Mukta ExtraBold, heavy outline; English names and numbers in gold. Hidden on frame 0 (the hook is picture-first). */
const HOT = /^[0-9,~]+|^[A-Za-z]/;
export const Subtitles: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.3;
  if (i < 0 || t < C.maps1 + 0.3 || t > end) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = ramp(t, t0, t0 + 0.08, linear) * (1 - ramp(t, t1 - 0.02, t1, linear));
  if (a <= 0) return null;
  const s = lerp(0.86, 1, clamp01(pop(t, t0, 12, 260)));
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: SUB, fontWeight: 800, fontSize: 58, lineHeight: 1.22,
      color: '#fff', opacity: a, transform: `scale(${s})`, textShadow: '0 4px 0 rgba(0,0,0,0.4), 0 6px 18px rgba(0,0,0,0.7)', ...STROKE(9, '#000') }}>
      {text.split(' ').map((w, k) => <span key={k} style={{ color: HOT.test(w) ? COL.gold : '#fff' }}>{w}{' '}</span>)}
    </div>
  );
};

/** The twin friends who pop up on "आपकी Copy" in the top half of the split. */
export const TwinsPop: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.copy12 - 0.1, C.copy12, 99, 100);
  return <Prop name="twins_friends" x={540} y={560} h={560} a={a} sc={clamp01(pop(t, C.copy12, 8, 220)) * (1 + 0.02 * Math.sin(t * 5))} glow={COL.gold} />;
};
