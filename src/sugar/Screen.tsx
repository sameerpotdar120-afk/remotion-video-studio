import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, graphemes, inOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import sizes from '../../public/sugar/img_sizes.json';
import { C, CAPS, Cam, DURATION_S, GEO, P, toScreen } from './cam';
import { COL } from './Plane';

export const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
const SERIF = "'NotoSerifDeva', 'Noto Serif Devanagari', serif";
const MONT = "'Montserrat', sans-serif";
const SZ = sizes as unknown as Record<string, [number, number]>;
const img = (n: string) => staticFile(`sugar/img/${n}.png`);

// ---------------------------------------------------------------- props
/** A miniature at a screen point (bottom-centre anchor): springs in, breathes, can glide along a path, pops out. */
const Actor: React.FC<{
  t: number; t0: number; t1: number; pose: string; x: number; y: number; h: number; flip?: boolean; bob?: number; sway?: number;
  path?: { t0: number; t1: number; x: number; y: number; arc?: number }; shadow?: boolean; rot?: number; glow?: string; drop?: boolean;
}> = ({ t, t0, t1, pose, x, y, h, flip, bob = 4, sway = 0, path, shadow = true, rot = 0, glow, drop = true }) => {
  if (t < t0 - 0.02 || t > t1 + 0.35) return null;
  const s = pop(t, t0, 10, 200);
  const out = ramp(t, t1, t1 + 0.3, easeIn);
  const land = kick(t, t0 + 0.16, 0.1, 26, 10);
  let px = x, py = y;
  if (path) {
    const q = ramp(t, path.t0, path.t1, inOut);
    px = lerp(x, path.x, q);
    py = lerp(y, path.y, q) - Math.sin(q * Math.PI) * (path.arc ?? 0);
  }
  const [iw, ih] = SZ[pose] ?? [600, 900];
  const w = (h * iw) / ih;
  const sc = Math.max(0, s) * (1 - out);
  if (sc <= 0.01) return null;
  const breathe = Math.sin((t - t0) * 2.4) * bob;
  const rock = sway ? Math.sin((t - t0) * 2.1) * sway : 0;
  return (
    <div style={{ position: 'absolute', left: px, top: py, width: 0, height: 0 }}>
      {shadow && (
        <div style={{ position: 'absolute', left: -w * 0.34, top: -h * 0.045, width: w * 0.68, height: h * 0.09, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0))', transform: `scale(${Math.min(1, sc)})` }} />
      )}
      <div style={{ position: 'absolute', left: -w / 2, top: -h, width: w, height: h, transformOrigin: '50% 100%',
        transform: `translateY(${-(drop ? (1 - clamp01(s)) * 90 : 0)}px) rotate(${rot + rock}deg) scale(${sc * (1 - land) * (flip ? -1 : 1)}, ${sc * (1 + land) + breathe / h})`,
        filter: `${glow ? `drop-shadow(0 0 16px ${glow}) ` : ''}drop-shadow(0 8px 10px rgba(0,0,0,0.5))` }}>
        <img src={img(pose)} style={{ width: w, height: h, display: 'block' }} />
      </div>
    </div>
  );
};

/** The word tag: a bold coloured pill on a short stem, pinned to a place (screen point). */
const Tag: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; color: string; size?: number; sub?: string; rot?: number; latin?: boolean; up?: number }> = ({
  t, t0, t1, text, x, y, color, size = 64, sub, rot = -4, latin, up = 70,
}) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = pop(t, t0, 9, 240) * (1 - ramp(t, t1, t1 + 0.25, easeIn));
  if (s <= 0.01) return null;
  const stem = ramp(t, t0, t0 + 0.2, easeOut) * up;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      <svg width={10} height={up + 10} style={{ position: 'absolute', left: -5, top: -stem, overflow: 'visible' }}>
        <line x1={5} y1={0} x2={5} y2={stem} stroke="#fff" strokeWidth={3} />
        <circle cx={5} cy={stem} r={7} fill="#fff" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div style={{ position: 'absolute', left: 0, top: -stem, transform: `translate(-50%,-100%) rotate(${rot}deg) scale(${s})`, transformOrigin: '50% 100%', textAlign: 'center' }}>
        <div style={{ whiteSpace: 'nowrap', background: color, color: '#1b1206', padding: latin ? '6px 26px 4px' : '0 24px 6px', borderRadius: 12,
          fontFamily: latin ? MONT : SERIF, fontWeight: 900, fontSize: size, letterSpacing: latin ? 2 : 0, boxShadow: '0 8px 0 rgba(0,0,0,0.35), 0 10px 24px rgba(0,0,0,0.45)',
          border: '4px solid #1b1206' }}>{text}</div>
        {sub && <div style={{ marginTop: 8, fontFamily: SERIF, fontWeight: 800, fontSize: size * 0.48, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.9)', whiteSpace: 'nowrap' }}>{sub}</div>}
      </div>
    </div>
  );
};

const Label: React.FC<{ text: string; t: number; t0: number; t1: number; x: number; y: number; size?: number; color?: string; box?: string; font?: string }> = ({ text, t, t0, t1, x, y, size = 58, color = '#fff', box, font = SERIF }) => {
  const a = window4(t, t0, t0 + 0.15, t1 - 0.25, t1);
  if (a <= 0) return null;
  const g = graphemes(text);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-100%)', opacity: a, textAlign: 'center' }}>
      <div style={{ whiteSpace: 'nowrap', fontFamily: font, fontWeight: 900, fontSize: size, color, textShadow: '0 3px 10px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)',
        ...(box ? { background: box, padding: '2px 22px 8px', borderRadius: 16, boxShadow: '0 8px 18px rgba(0,0,0,0.45)', transform: `scale(${clamp01(pop(t, t0, 11, 220))})` } : {}) }}>
        {g.map((ch, i) => {
          const p = clamp01(pop(t, t0 + i * 0.03, 12, 210));
          return <span key={i} style={{ display: 'inline-block', opacity: clamp01(p * 1.4), transform: `translateY(${(1 - p) * 22}px)` }}>{ch === ' ' ? ' ' : ch}</span>;
        })}
      </div>
    </div>
  );
};

const Stamp: React.FC<{ t: number; t0: number; t1: number; children: React.ReactNode; x: number; y: number; rot?: number }> = ({ t, t0, t1, children, x, y, rot = -6 }) => {
  const a = window4(t, t0, t0 + 0.02, t1 - 0.2, t1);
  if (a <= 0) return null;
  const s = ramp(t, t0, t0 + 0.14, easeIn);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.4, 1, s) + kick(t, t0 + 0.14, 0.06, 30, 10)})`, opacity: a * (0.6 + 0.4 * s),
      padding: '8px 34px 14px', border: `10px solid ${COL.gold}`, borderRadius: 20, background: 'rgba(20,12,4,0.82)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>{children}</div>
  );
};

/** Black-background overlays from the asset pack, added with screen blending. */
const Overlay: React.FC<{ name: string; a: number; x: number; y: number; w: number; rot?: number; sc?: number }> = ({ name, a, x, y, w, rot = 0, sc = 1 }) => {
  if (a <= 0.001) return null;
  const [iw, ih] = SZ[name];
  const h = (w * ih) / iw;
  return <img src={img(name)} style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a, mixBlendMode: 'screen', transform: `rotate(${rot}deg) scale(${sc})` }} />;
};

/** The hook: two bold questions on screen from frame 0. */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const a = 1 - ramp(t, C.jawab2 + 0.2, C.jawab2 + 0.6, linear);
  if (a <= 0) return null;
  const row = (l: string, r: string, t0: number, col: string) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 22, transform: `scale(${t0 <= 0 ? 1 : clamp01(pop(t, t0, 10, 230))})`, opacity: t0 <= 0 ? 1 : (t >= t0 ? 1 : 0) }}>
      <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 112, color: '#fff' }}>{l}</span>
      <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 90, color: col }}>=</span>
      <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 112, color: col }}>{r}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 190, opacity: a, textShadow: '0 4px 14px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)', lineHeight: 1.12 }}>
      {row('चीनी', 'चीन?', 0, COL.gold)}
      {row('मिश्री', 'मिस्र?', C.mishri1 - 0.1, COL.cyan)}
    </div>
  );
};

/** End card: one question, three answers. */
const Question: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.kya14 - 0.3;
  if (t < t0) return null;
  const s = clamp01(pop(t, t0, 11, 190));
  const btn = (label: string, at: number, bg: string) => {
    const p = clamp01(pop(t, at - 0.1, 10, 230));
    const hi = window4(t, at, at + 0.1, at + 0.5, at + 0.8);
    return (
      <div style={{ padding: '12px 34px 20px', borderRadius: 28, background: bg, border: '5px solid #fff', transform: `scale(${p * (1 + hi * 0.08)})`, opacity: p,
        boxShadow: `0 10px 22px rgba(0,0,0,0.5), 0 0 ${30 * hi}px rgba(255,216,74,0.9)`, fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: '#1b1206', whiteSpace: 'nowrap' }}>{label}</div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: s }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', transform: `scale(${lerp(0.85, 1, s)})`, textShadow: '0 4px 14px rgba(0,0,0,0.9)' }}>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 96, color: '#fff' }}>तुम्हारे घर में</div>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 96, color: COL.gold }}>इसे क्या कहते हैं?</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', gap: 26 }}>
        {btn('शक्कर', C.shakkar14, COL.gold)}
        {btn('चीनी', C.cheeni14, '#ffffff')}
        {btn('कुछ और?', C.aur14, COL.cyan)}
      </div>
    </AbsoluteFill>
  );
};

/** At "घर लौट आई", every name flies home into India. */
const HomeComing: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const t0 = C.nikli13 - 0.2, tHome = C.ghar13 - 0.5, t1 = C.ghar14;
  if (t < t0 || t > t1 + 0.4) return null;
  const home = toScreen(c, GEO.places.india_c);
  const items: [string, string, string, boolean][] = [
    ['शकर', 'persia', COL.gold, false], ['सुक्कर', 'arabia', COL.gold, false], ['SUGAR', 'england', COL.gold, true], ['कंद', 'persia', COL.green, false],
    ['CANDY', 'england', COL.green, true], ['मिश्री', 'egypt', COL.cyan, false], ['चीनी', 'canton', '#ffffff', false], ['SUCRE', 'france', COL.gold, true],
  ];
  return (
    <>
      {items.map(([txt, place, col, latin], i) => {
        const src = toScreen(c, GEO.places[place]);
        const off: P = [Math.sin(i * 2.1) * 90, Math.cos(i * 1.7) * 60 - 40];
        const q = ramp(t, tHome + i * 0.05, tHome + 0.7 + i * 0.05, inOut);
        const x = lerp(src[0] + off[0], home[0], q), y = lerp(src[1] + off[1], home[1], q) - Math.sin(q * Math.PI) * 160;
        const s = clamp01(pop(t, t0 + i * 0.07, 10, 230)) * (1 - ramp(t, tHome + 0.6 + i * 0.05, tHome + 0.75 + i * 0.05, easeIn));
        if (s <= 0.01) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s * lerp(1, 0.6, q)}) rotate(${(i % 2 ? 4 : -4)}deg)`, background: col, border: '3px solid #1b1206',
            borderRadius: 10, padding: latin ? '4px 16px' : '0 16px 4px', fontFamily: latin ? MONT : SERIF, fontWeight: 900, fontSize: 40, color: '#1b1206', whiteSpace: 'nowrap', boxShadow: '0 6px 0 rgba(0,0,0,0.35)' }}>{txt}</div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the screen layer
export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const at = (k: string) => toScreen(c, GEO.places[k]);
  const ind = at('india_c'), per = at('persia'), arb = at('arabia'), ita = at('italy'), fra = at('france'), eng = at('england'), egy = at('egypt'), chi = at('china');
  const guj = at('gujarat'), can = at('canton'), ben = at('bengal');
  const burst = window4(t, C.ghar13 - 0.2, C.ghar13 + 0.1, C.ghar13 + 0.6, C.ghar13 + 1.2);
  return (
    <AbsoluteFill>
      {/* ---- the hook */}
      <Actor t={t} t0={-0.1} t1={C.jawab2 + 0.1} pose="sugar_bowl" x={540} y={1300} h={520} bob={3} glow="rgba(255,240,200,0.5)" />
      <Label text="चीन" t={t} t0={0.6} t1={C.jawab2 + 0.2} x={Math.min(960, chi[0])} y={chi[1] - 40} size={56} />
      <Label text="मिस्र" t={t} t0={C.misr1 - 0.1} t1={C.jawab2 + 0.2} x={Math.max(120, egy[0])} y={egy[1] - 40} size={56} color={COL.cyan} />
      <Hook t={t} />
      <Overlay name="overlay_sugar_sparkle" a={window4(t, C.jawab2, C.jawab2 + 0.3, C.bharat2, C.bharat2 + 0.5) * 0.95} x={lerp(300, 780, ramp(t, C.jawab2, C.bharat2 + 0.5, linear))} y={900} w={1500} rot={-18} />

      {/* ---- India: cane → juice → crystals = शर्करा */}
      <Label text="भारत" t={t} t0={C.bharat2 - 0.05} t1={C.y1500} x={ind[0]} y={ind[1] - 60} size={78} color={COL.gold} />
      <Label text="करीब 1500 साल पहले" t={t} t0={C.y1500 - 0.05} t1={C.sanskrit4} x={540} y={420} size={72} box="rgba(30,18,6,0.72)" />
      <Actor t={t} t0={C.ganne3 - 0.1} t1={C.sharkara4} pose="sugarcane" x={280} y={1400} h={560} />
      <Actor t={t} t0={C.jama3 - 0.15} t1={C.sharkara4} pose="juice_pot" x={700} y={1420} h={480} />
      <Overlay name="overlay_steam" a={window4(t, C.jama3 + 0.1, C.jama3 + 0.5, C.sharkara4 - 0.3, C.sharkara4) * 0.8} x={700} y={820} w={420} />
      <Actor t={t} t0={C.daane3 - 0.05} t1={C.persia5 - 0.5} pose="sugar_crystals_raw" x={C.matlab4 < t ? 360 : 540} y={1450} h={300} glow="rgba(255,200,90,0.5)" />
      <Tag t={t} t0={C.sharkara4 - 0.05} t1={C.persia5 - 0.5} text="शर्करा" x={C.matlab4 < t ? 360 : 540} y={1190} color={COL.gold} size={84} sub="संस्कृत" />
      <Actor t={t} t0={C.matlab4 + 0.2} t1={C.persia5 - 0.5} pose="pebbles" x={790} y={1450} h={240} />
      <Label text="=" t={t} t0={C.matlab4 + 0.3} t1={C.persia5 - 0.5} x={575} y={1420} size={110} color={COL.gold} font={MONT} />
      <Label text="छोटे-छोटे कंकड़" t={t} t0={C.kankad4 - 0.1} t1={C.persia5 - 0.5} x={790} y={1160} size={54} />

      {/* ---- Persia → Arab → Europe */}
      <Actor t={t} t0={C.persia5 - 0.8} t1={C.shakar5 + 0.3} pose="camel_caravan" x={guj[0]} y={guj[1] + 30} h={110} shadow={false} bob={1} drop={false} flip
        path={{ t0: C.persia5 - 0.8, t1: C.persia5 + 0.4, x: per[0] + 60, y: per[1] + 30 }} />
      <Tag t={t} t0={C.shakar5 - 0.05} t1={C.yani7 + 0.3} text="शकर" x={per[0]} y={per[1]} color={COL.gold} sub="Persia (आज का ईरान)" />
      <Tag t={t} t0={C.sukkar5 - 0.05} t1={C.yani7 + 0.3} text="सुक्कर" x={arb[0]} y={arb[1]} color={COL.gold} sub="Arab" rot={4} />
      <Actor t={t} t0={C.sukkar5 + 0.1} t1={C.europe6} pose="sugar_sack" x={arb[0]} y={arb[1] + 230} h={170} />
      <Actor t={t} t0={C.europe6 - 0.4} t1={C.italy6 + 0.6} pose="dhow_ship" x={arb[0] - 40} y={arb[1] + 20} h={130} shadow={false} bob={2} sway={2} drop={false} flip
        path={{ t0: C.europe6 - 0.3, t1: C.italy6 + 0.3, x: ita[0] + 60, y: ita[1] + 90 }} />
      <Tag t={t} t0={C.zucchero - 0.05} t1={C.yani7 + 0.3} text="ZUCCHERO" x={ita[0]} y={ita[1]} color={COL.gold} size={46} latin sub="Italy" rot={4} />
      <Tag t={t} t0={C.sucre - 0.05} t1={C.yani7 + 0.3} text="SUCRE" x={fra[0]} y={fra[1]} color={COL.gold} size={46} latin sub="France" up={120} />
      <Tag t={t} t0={C.sugar6 - 0.05} t1={C.yani7 + 0.3} text="SUGAR" x={eng[0]} y={eng[1]} color={COL.gold} size={70} latin sub="England" up={150} rot={-6} />
      <Actor t={t} t0={C.england6 - 0.1} t1={C.yani7 + 0.2} pose="sugar_loaf" x={230} y={1400} h={260} />
      <Stamp t={t} t0={C.yani7 + 0.55} t1={C.tukde8 - 0.1} x={540} y={470}>
        <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 92, color: '#fff', letterSpacing: 2 }}>SUGAR</span>
        <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 92, color: COL.gold, margin: '0 22px' }}>=</span>
        <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 100, color: COL.gold }}>शर्करा</span>
      </Stamp>
      <Label text="हमारा ही शब्द!" t={t} t0={C.hamara7 - 0.05} t1={C.tukde8 - 0.1} x={540} y={640} size={66} color="#fff" />

      {/* ---- खण्ड → कंद → Candy */}
      <Actor t={t} t0={C.tukde8 - 0.2} t1={C.persia9 + 0.2} pose="sugar_lump_big" x={ind[0]} y={ind[1] + 260} h={340} glow="rgba(255,190,90,0.5)" />
      <Tag t={t} t0={C.khand8 - 0.05} t1={C.persia9 + 0.2} text="खण्ड" x={ind[0]} y={ind[1] - 100} color={COL.green} size={90} sub="टुकड़ा" />
      <Tag t={t} t0={C.kand9 - 0.05} t1={C.egypt11} text="कंद" x={per[0]} y={per[1]} color={COL.green} size={80} sub="Persia" />
      <Actor t={t} t0={C.kalakand - 0.1} t1={C.angrez10 + 0.3} pose="kalakand" x={per[0] - 210} y={per[1] + 380} h={230} />
      <Actor t={t} t0={C.gulkand - 0.1} t1={C.angrez10 + 0.3} pose="gulkand" x={per[0] + 220} y={per[1] + 400} h={240} />
      <Label text="कलाकंद" t={t} t0={C.kalakand} t1={C.angrez10 + 0.2} x={per[0] - 210} y={per[1] + 450} size={44} />
      <Label text="गुलकंद" t={t} t0={C.gulkand} t1={C.angrez10 + 0.2} x={per[0] + 220} y={per[1] + 470} size={44} />
      <Actor t={t} t0={C.candy - 0.2} t1={C.egypt11} pose="rock_candy" x={eng[0] + 200} y={eng[1] + 380} h={280} />
      <Tag t={t} t0={C.candy - 0.05} t1={C.egypt11} text="CANDY" x={eng[0]} y={eng[1]} color={COL.green} size={66} latin sub="England" up={150} />

      {/* ---- Egypt → मिश्री */}
      <Actor t={t} t0={C.egypt11 + 0.1} t1={C.bharat11} pose="pyramid" x={egy[0] - 40} y={egy[1] + 260} h={230} />
      <Label text="Egypt (मिस्र)" t={t} t0={C.egypt11 + 0.1} t1={C.bharat11} x={egy[0]} y={egy[1] - 60} size={56} color={COL.cyan} />
      <Actor t={t} t0={C.crystals - 0.1} t1={C.china12 - 0.2} pose="misri" x={egy[0] + 40} y={egy[1] + 40} h={230} glow="rgba(127,227,255,0.6)" shadow={false} drop={false}
        path={{ t0: C.arab11 - 0.1, t1: C.bharat11 + 0.5, x: guj[0], y: guj[1] - 20, arc: 120 }} />
      <Stamp t={t} t0={C.misr11 - 0.05} t1={C.china12 - 0.1} x={540} y={430} rot={-4}>
        <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 88, color: '#fff' }}>मिस्र</span>
        <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 80, color: COL.cyan, margin: '0 20px' }}>→</span>
        <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 96, color: COL.cyan }}>मिश्री</span>
      </Stamp>

      {/* ---- China → चीनी */}
      <Label text="China (चीन)" t={t} t0={C.china12 - 0.05} t1={C.cheeni12} x={chi[0]} y={chi[1] - 60} size={56} />
      <Actor t={t} t0={C.china12 - 0.1} t1={C.cheeni12 + 0.3} pose="junk_ship" x={can[0]} y={can[1] + 60} h={130} shadow={false} bob={2} sway={2} drop={false}
        path={{ t0: C.china12 + 0.1, t1: C.safed12 + 0.4, x: ben[0] + 80, y: ben[1] + 120 }} />
      <Actor t={t} t0={C.safed12 - 0.05} t1={C.nikli13 - 0.4} pose="white_sugar" x={ind[0]} y={ind[1] + 300} h={250} glow="rgba(255,255,255,0.6)" />
      <Stamp t={t} t0={C.cheeni12 - 0.05} t1={C.nikli13 - 0.3} x={540} y={430} rot={4}>
        <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 88, color: '#fff' }}>चीन</span>
        <span style={{ fontFamily: MONT, fontWeight: 900, fontSize: 80, color: '#fff', margin: '0 20px' }}>→</span>
        <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 96, color: COL.gold }}>चीनी</span>
      </Stamp>

      {/* ---- everything comes home */}
      <HomeComing t={t} c={c} />
      <Overlay name="overlay_sugar_sparkle" a={burst} x={ind[0]} y={ind[1]} w={1500} sc={lerp(0.6, 1.4, burst)} />
      <Actor t={t} t0={C.ghar14 - 0.1} t1={DURATION_S + 1} pose="sugar_dabba" x={540} y={1340} h={380} bob={3} />
      <Question t={t} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- frame-level
export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.bharat2, 8], [C.sugar6, 9], [C.yani7 + 0.55, 12], [C.khand8, 8], [C.candy, 7], [C.misr11, 8], [C.cheeni12, 10], [C.ghar13, 10]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export const Grade: React.FC<{ t: number }> = ({ t }) => {
  const flash = Math.max(
    window4(t, C.yani7 + 0.52, C.yani7 + 0.55, C.yani7 + 0.6, C.yani7 + 0.85) * 0.5,
    window4(t, C.ghar13 - 0.03, C.ghar13, C.ghar13 + 0.05, C.ghar13 + 0.35) * 0.6,
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,10,20,0.35), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,8,16,0.5))' }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.5, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};

export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.4;
  if (i < 0 || t > end || t > C.kya14 - 0.3) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = (i === 0 ? 1 : ramp(t, t0, t0 + 0.1, linear)) * (1 - ramp(t, t1 - 0.02, t1, linear));
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1560, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.25,
      color: '#fff', opacity: a, transform: `translateY(${(1 - ramp(t, t0, t0 + 0.14)) * 8}px)`,
      textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.45)' }}>{text}</div>
  );
};

export { easeIn, easeOut, inOut, linear };
