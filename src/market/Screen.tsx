import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, graphemes, inOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import sizes from '../../public/market/img_sizes.json';
import { C, CAPS, Cam, DURATION_S, GEO, P, merc, pxPerM, toScreen } from './cam';
import { COL } from './Plane';

export const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
const SERIF = "'NotoSerifDeva', 'Noto Serif Devanagari', serif";
const MONT = "'Montserrat', sans-serif";
const SZ = sizes as unknown as Record<string, [number, number]>;
const img = (n: string) => staticFile(`market/img/${n}.png`);

// island-local metres (x east, y north) around the island's centre, as in build_market_maps.py
const IC = merc(19.1327, 60.3009);
const K = 1 / Math.cos((60.3009 * Math.PI) / 180);
const L = (x: number, y: number): P => [IC[0] + x * K, IC[1] + y * K];

// ---------------------------------------------------------------- props
/** A miniature at a screen point (bottom-centre anchor): springs in, breathes, can glide along a path, pops out. */
const Actor: React.FC<{
  t: number; t0: number; t1: number; pose: string; x: number; y: number; h: number; flip?: boolean; bob?: number; sway?: number;
  path?: { t0: number; t1: number; x: number; y: number; arc?: number }; shadow?: boolean; rot?: number; glow?: string; drop?: boolean; rise?: number;
}> = ({ t, t0, t1, pose, x, y, h, flip, bob = 4, sway = 0, path, shadow = true, rot = 0, glow, drop = true, rise = 0 }) => {
  if (t < t0 - 0.02 || t > t1 + 0.35) return null;
  const s = rise ? 1 : pop(t, t0, 10, 200);
  const out = ramp(t, t1, t1 + 0.3, easeIn);
  const land = rise ? 0 : kick(t, t0 + 0.16, 0.1, 26, 10);
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
  // "rise": grows up out of the ground (clipped at its base) over `rise` seconds
  const up = rise ? ramp(t, t0, t0 + rise, easeOut) : 1;
  return (
    <div style={{ position: 'absolute', left: px, top: py, width: 0, height: 0 }}>
      {shadow && (
        <div style={{ position: 'absolute', left: -w * 0.34, top: -h * 0.045, width: w * 0.68, height: h * 0.09, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0))', transform: `scale(${Math.min(1, sc) * up})` }} />
      )}
      <div style={{ position: 'absolute', left: -w / 2 - 40, top: -h - 60, width: w + 80, height: h + 60, overflow: rise && t < t0 + rise ? 'hidden' : 'visible' }}>
        <div style={{ position: 'absolute', left: 40, top: 60, width: w, height: h, transformOrigin: '50% 100%',
          transform: `translateY(${(1 - up) * h - (drop && !rise ? (1 - clamp01(s)) * 90 : 0)}px) rotate(${rot + rock}deg) scale(${sc * (1 - land) * (flip ? -1 : 1)}, ${sc * (1 + land) + breathe / h})`,
          filter: `${glow ? `drop-shadow(0 0 16px ${glow}) ` : ''}drop-shadow(0 8px 10px rgba(0,0,0,0.5))` }}>
          <img src={img(pose)} style={{ width: w, height: h, display: 'block' }} />
        </div>
      </div>
    </div>
  );
};

const Year: React.FC<{ text: string; t: number; t0: number; t1: number; x?: number; y?: number; size?: number; color?: string }> = ({ text, t, t0, t1, x = 540, y = 400, size = 190, color = '#fff' }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.25, t1);
  if (a <= 0) return null;
  const s = pop(t, t0, 9, 230);
  const bl = Math.max(0, 1 - clamp01((t - t0) / 0.18)) * 14;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${lerp(1.8, 1, clamp01(s)) + (s > 1 ? (s - 1) * 0.4 : 0)})`, opacity: a,
      fontFamily: MONT, fontWeight: 900, fontSize: size, color, letterSpacing: 2, whiteSpace: 'nowrap',
      filter: `${bl > 0.3 ? `blur(${bl.toFixed(1)}px) ` : ''}drop-shadow(0 0 18px rgba(255,200,90,0.6)) drop-shadow(0 6px 12px rgba(0,0,0,0.7))` }}>{text}</div>
  );
};

const Label: React.FC<{ text: string; t: number; t0: number; t1: number; x: number; y: number; size?: number; color?: string; arrow?: boolean; box?: string }> = ({ text, t, t0, t1, x, y, size = 58, color = '#fff', arrow, box }) => {
  const a = window4(t, t0, t0 + 0.15, t1 - 0.25, t1);
  if (a <= 0) return null;
  const g = graphemes(text);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-100%)', opacity: a, textAlign: 'center' }}>
      <div style={{ whiteSpace: 'nowrap', fontFamily: SERIF, fontWeight: 900, fontSize: size, color, textShadow: '0 3px 10px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)',
        ...(box ? { background: box, padding: '2px 22px 8px', borderRadius: 16, boxShadow: '0 8px 18px rgba(0,0,0,0.45)', transform: `scale(${clamp01(pop(t, t0, 11, 220))})` } : {}) }}>
        {g.map((ch, i) => {
          const p = clamp01(pop(t, t0 + i * 0.03, 12, 210));
          return <span key={i} style={{ display: 'inline-block', opacity: clamp01(p * 1.4), transform: `translateY(${(1 - p) * 22}px)` }}>{ch === ' ' ? '\u00a0' : ch}</span>;
        })}
      </div>
      {arrow && (
        <svg width={60} height={70} style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
          <path d="M30,4 L30,52 M14,38 L30,58 L46,38" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round"
            pathLength={1} strokeDasharray={`${ramp(t, t0 + 0.15, t0 + 0.5, easeOut)} 1`} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
        </svg>
      )}
    </div>
  );
};

/** Sweden's and Finland's flags, drawn in code so the colours are exact, rippling in strips. */
const FlagArt: React.FC<{ kind: 'se' | 'fi'; w: number; t: number }> = ({ kind, w, t }) => {
  const h = w * (kind === 'se' ? 0.625 : 0.611);
  const strips = 16;
  const id = `fl${kind}${Math.round(w)}`;
  const bg = kind === 'se' ? COL.sweBlue : '#fff';
  const cr = kind === 'se' ? COL.sweYellow : COL.finBlue;
  const bar = h * (kind === 'se' ? 0.2 : 0.27);
  const cx = w * (kind === 'se' ? 0.375 : 0.36);
  const art = (<><rect width={w} height={h} fill={bg} /><rect x={cx - bar / 2} width={bar} height={h} fill={cr} /><rect y={h / 2 - bar / 2} width={w} height={bar} fill={cr} /></>);
  return (
    <svg width={w + 10} height={h + 24} style={{ overflow: 'visible', display: 'block' }}>
      <defs><pattern id={`${id}p`} width={w} height={h} patternUnits="userSpaceOnUse">{art}</pattern></defs>
      {Array.from({ length: strips }, (_, i) => {
        const u = i / strips;
        const dy = Math.sin(u * 6 - t * 7) * 5 * u;
        const shade = 0.88 + 0.12 * Math.cos(u * 6 - t * 7);
        return <rect key={i} x={u * w} y={dy} width={w / strips + 0.7} height={h} fill={`url(#${id}p)`} style={{ filter: `brightness(${shade})` }} />;
      })}
    </svg>
  );
};

const Flag: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; kind: 'se' | 'fi'; w?: number }> = ({ t, t0, t1, x, y, kind, w = 130 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = pop(t, t0, 10, 200) * (1 - ramp(t, t1, t1 + 0.3, easeIn));
  const pole = w * 1.3;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `scale(${Math.max(0, s)})`, transformOrigin: '0 0' }}>
      <div style={{ position: 'absolute', left: -3, top: -pole, width: 6, height: pole, borderRadius: 3, background: 'linear-gradient(90deg,#cfcfcf,#7d7d7d)', boxShadow: '0 4px 6px rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'absolute', left: 3, top: -pole, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))' }}><FlagArt kind={kind} w={w} t={t} /></div>
    </div>
  );
};

/** Black-background overlays from the asset pack, added with screen blending. */
const Overlay: React.FC<{ name: string; a: number; x: number; y: number; w: number; rot?: number; origin?: string }> = ({ name, a, x, y, w, rot = 0, origin }) => {
  if (a <= 0.001) return null;
  const [iw, ih] = SZ[name];
  const h = (w * ih) / iw;
  return <img src={img(name)} style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a, mixBlendMode: 'screen', transform: `rotate(${rot}deg)`, transformOrigin: origin }} />;
};

/** The hook line, on screen from frame 0. */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const a = 1 - ramp(t, C.lighthouse1 + 0.5, C.sweden2 - 0.1, linear);
  if (a <= 0) return null;
  const lines = ['ये बॉर्डर', 'ज़िग-ज़ैग क्यों है?'];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', opacity: a }}>
      {lines.map((ln, i) => (
        <div key={i} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: i ? 112 : 92, lineHeight: 1.12, color: i ? '#FFE45A' : '#fff',
          transform: `scale(${1 + kick(t, C.zigzag1 - 0.05, 0.07, 18, 7) * i})`, textShadow: '0 4px 14px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)' }}>{ln}</div>
      ))}
      <div style={{ marginTop: 10, display: 'inline-block', opacity: ramp(t, C.wajah - 0.1, C.wajah + 0.2), fontFamily: SERIF, fontWeight: 900, fontSize: 60, color: '#1b1206',
        background: '#FFE45A', borderRadius: 14, padding: '0 26px 6px', transform: `scale(${clamp01(pop(t, C.lighthouse1 - 0.1, 11, 220))})`, boxShadow: '0 8px 18px rgba(0,0,0,0.5)' }}>वजह: एक लाइटहाउस</div>
    </div>
  );
};

/** "Rewind to 1809": film sprockets race past, the years count down, and everything goes sepia. */
const Rewind: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.y1809 - 0.45, t1 = C.y1809 + 0.35;
  if (t < t0 || t > t1) return null;
  const q = (t - t0) / (t1 - t0);
  const a = Math.sin(q * Math.PI);
  const yr = Math.round(lerp(2025, 1809, easeOut(clamp01(q * 1.25))));
  const off = (t * 4200) % 140;
  const strip = (left: boolean) => (
    <div style={{ position: 'absolute', top: 0, bottom: 0, [left ? 'left' : 'right']: 0, width: 92, background: '#0b0907', overflow: 'hidden' }}>
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: 26, top: i * 140 - off, width: 40, height: 62, borderRadius: 8, background: '#e8dcc2', opacity: 0.85 }} />
      ))}
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ background: '#5a3c1c', mixBlendMode: 'color', opacity: 0.8 }} />
      {strip(true)}{strip(false)}
      <div style={{ position: 'absolute', left: 540, top: 960, transform: 'translate(-50%,-50%)', fontFamily: MONT, fontWeight: 900, fontSize: 200, color: '#f6e8c8',
        filter: 'blur(1.5px) drop-shadow(0 0 20px rgba(255,200,120,0.7))' }}>{yr}</div>
      <div style={{ position: 'absolute', left: 540, top: 1110, transform: 'translate(-50%,-50%)', fontFamily: MONT, fontWeight: 900, fontSize: 80, color: '#f6e8c8' }}>◀◀</div>
    </AbsoluteFill>
  );
};

/** The 1809 peace treaty: Finland handed over, with a wax seal stamped on. */
const Treaty: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.finland4 - 0.15, t1 = C.naya5 + 0.2;
  if (t < t0 || t > t1 + 0.35) return null;
  const s = clamp01(pop(t, t0, 10, 180)) * (1 - ramp(t, t1, t1 + 0.3, easeIn));
  const W = 520;
  const [iw, ih] = SZ.treaty_1809;
  const H = (W * ih) / iw;
  const stamp = ramp(t, C.russi4 - 0.05, C.russi4 + 0.1, easeIn);
  return (
    <div style={{ position: 'absolute', left: 540 - W / 2, top: 1010, width: W, height: H, transform: `scale(${s}) rotate(${-3 + Math.sin(t * 1.4) * 1}deg)`, transformOrigin: '50% 50%', filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.55))' }}>
      <img src={img('treaty_1809')} style={{ width: W, height: H }} />
      {stamp > 0 && (
        <div style={{ position: 'absolute', left: '50%', top: '42%', transform: `translate(-50%,-50%) rotate(-10deg) scale(${lerp(2.2, 1, stamp) + kick(t, C.russi4 + 0.1, 0.06, 30, 10)})`, opacity: 0.6 + 0.4 * stamp,
          padding: '2px 22px 8px', border: `6px solid ${COL.russia}`, borderRadius: 12, fontFamily: SERIF, fontWeight: 900, fontSize: 56, color: COL.russia, background: 'rgba(255,246,228,0.88)', whiteSpace: 'nowrap' }}>
          फ़िनलैंड → रूस
        </div>
      )}
    </div>
  );
};

/** Five tiny football pitches lined up: the island is smaller than all five together. */
const Pitches: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.paanch3 - 0.1, t1 = C.market3 + 0.3;
  if (t < t0 || t > t1 + 0.4) return null;
  const out = ramp(t, t1, t1 + 0.35, easeIn);
  const w = 176;
  const [iw, ih] = SZ.football_pitch;
  const h = (w * ih) / iw;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 300 - out * 500 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const s = clamp01(pop(t, t0 + i * 0.12, 10, 220));
          return <img key={i} src={img('football_pitch')} style={{ width: w, height: h, transform: `translateY(${(1 - s) * -80}px) scale(${s})`, opacity: s, filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.55))' }} />;
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: 10, fontFamily: SERIF, fontWeight: 900, fontSize: 66, color: '#fff', opacity: ramp(t, C.maidan3 - 0.2, C.maidan3 + 0.1),
        textShadow: '0 3px 10px rgba(0,0,0,0.9)' }}>
        टापू <span style={{ color: '#FFE45A' }}>{'<'} 5</span> फुटबॉल मैदान
      </div>
    </div>
  );
};

/** End card: one question, two buttons; a cursor hovers between them. */
const Question: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.hatate12 - 0.4;
  if (t < t0) return null;
  const s = clamp01(pop(t, t0, 11, 190));
  const b1 = clamp01(pop(t, C.lighthouse12 - 0.15, 10, 220));
  const b2 = clamp01(pop(t, C.border12 - 0.15, 10, 220));
  const btn = (label: string, p: number, color: string, icon: React.ReactNode, hi: number) => (
    <div style={{ width: 400, padding: '22px 0 26px', borderRadius: 30, background: color, transform: `scale(${p * (1 + 0.05 * hi)})`, opacity: p,
      boxShadow: `0 12px 24px rgba(0,0,0,0.5), 0 0 ${30 * hi}px rgba(255,228,90,0.8)`, textAlign: 'center', border: '4px solid rgba(255,255,255,0.85)' }}>
      <div style={{ height: 150, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 3px 8px rgba(0,0,0,0.6)' }}>{label}</div>
    </div>
  );
  const hover = Math.sin((t - t0) * 2.6);
  const zz = (
    <svg width={150} height={140} viewBox="0 0 150 140"><path d="M20,10 L60,40 L30,70 L95,95 L60,130" fill="none" stroke="#FFE45A" strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" /></svg>
  );
  return (
    <AbsoluteFill style={{ opacity: s }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', transform: `scale(${lerp(0.85, 1, s)})` }}>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 100, color: '#fff', textShadow: '0 4px 14px rgba(0,0,0,0.9)' }}>तुम होते तो</div>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 100, color: '#FFE45A', textShadow: '0 4px 14px rgba(0,0,0,0.9)' }}>क्या हटाते?</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', gap: 50 }}>
        {btn('लाइटहाउस', b1, '#C8102E', <img src={img('lighthouse')} style={{ height: 150 }} />, clamp01(hover) * b2)}
        {btn('बॉर्डर', b2, COL.sweBlue, zz, clamp01(-hover) * b2)}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', fontFamily: SERIF, fontWeight: 800, fontSize: 50, color: '#fff', opacity: ramp(t, C.border12 + 0.2, C.border12 + 0.6),
        textShadow: '0 3px 8px rgba(0,0,0,0.9)' }}>कमेंट में बताओ ↓</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the screen layer
export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const at = (k: string) => toScreen(c, GEO.places[k]);
  const lh = toScreen(c, GEO.lighthouse);
  const isl = at('market');
  const k = pxPerM(c);
  const lhH = Math.min(420, Math.max(60, 150 * K * k)); // the lighthouse drawn ~150 m tall (stylised) at close range
  const near = c.span < 6000;
  const west = toScreen(c, L(-150, -55));
  const east = toScreen(c, L(135, -15));
  // the magnifier follows the sea border down to the island
  const mq = ramp(t, C.zoom3 - 0.3, C.zoom3b + 0.2, inOut);
  const m0 = toScreen(c, merc(21.0, 63.2)), m1 = isl;
  const mx = lerp(m0[0], m1[0], mq), my = lerp(m0[1], m1[1], mq);
  const [hw, hh] = SZ.hand_magnifier;
  const mh = 640;
  const mw = (mh * hw) / hh;
  // the steamer crosses below the island, through the lighthouse beam
  const sh0 = toScreen(c, L(-380, -190)), sh1 = toScreen(c, L(360, -190));
  const beamA = window4(t, C.fayda8 - 0.4, C.fayda8, C.y1985 - 0.2, C.y1985 + 0.2) * (near ? 1 : 0);
  return (
    <AbsoluteFill>
      {/* ---- the hook */}
      {near && <Actor t={t} t0={-0.1} t1={C.sweden2 - 0.4} pose="lighthouse" x={lh[0]} y={lh[1]} h={lhH} bob={0} drop={false} glow={`rgba(255,220,120,${(0.5 + 0.5 * Math.sin(t * 6)).toFixed(2)})`} />}
      <Hook t={t} />

      {/* ---- Sweden and Finland */}
      <Label text="स्वीडन" t={t} t0={C.sweden2 - 0.05} t1={C.zoom3 - 0.1} x={at('sweden_c')[0]} y={at('sweden_c')[1]} size={74} color="#FFE45A" />
      <Label text="फ़िनलैंड" t={t} t0={C.finland2 - 0.05} t1={C.zoom3 - 0.1} x={at('finland_c')[0]} y={at('finland_c')[1]} size={74} color="#fff" />
      <Label text="समंदर में भी बॉर्डर" t={t} t0={C.samandar2 - 0.05} t1={C.zoom3b} x={540} y={420} size={70} color="#fff" box="rgba(10,30,45,0.7)" />

      {/* ---- the dive */}
      {t > C.zoom3 - 0.35 && t < C.paanch3 + 0.4 && (
        <div style={{ position: 'absolute', left: mx - mw * 0.27, top: my - mh * 0.21, width: mw, height: mh, opacity: window4(t, C.zoom3 - 0.35, C.zoom3 - 0.1, C.paanch3 - 0.1, C.paanch3 + 0.3),
          transform: `rotate(${-6 + Math.sin(t * 2) * 2}deg) scale(${lerp(0.9, 1.15, mq)})`, transformOrigin: '27% 21%', filter: 'drop-shadow(0 16px 20px rgba(0,0,0,0.55))' }}>
          <img src={img('hand_magnifier')} style={{ width: mw, height: mh }} />
        </div>
      )}
      <Pitches t={t} />
      <Label text="मार्केट" t={t} t0={C.market3 - 0.05} t1={C.y1809 - 0.4} x={isl[0] + 40} y={isl[1] - 120} size={96} color="#fff" arrow />

      {/* ---- 1809 */}
      <Rewind t={t} />
      <Year text="1809" t={t} t0={C.y1809 + 0.25} t1={C.sweden4 + 0.2} color="#f6e8c8" />
      <Actor t={t} t0={C.sweden4 - 0.1} t1={C.finland4 - 0.1} pose="soldier_sweden_1809" x={300} y={1340} h={560} />
      <Actor t={t} t0={C.jung4 - 0.4} t1={C.finland4 - 0.1} pose="soldier_russia_1809" x={790} y={1340} h={560} flip />
      <Label text="जंग" t={t} t0={C.jung4 - 0.05} t1={C.finland4 - 0.1} x={545} y={900} size={110} color="#FF5A4A" />
      <Treaty t={t} />
      <Label text="रूसी साम्राज्य" t={t} t0={C.russi4 + 0.1} t1={C.naya5 + 0.1} x={at('petersburg')[0] - 60} y={at('petersburg')[1] - 40} size={64} color="#FFD1C8" />
      <Label text="नया बॉर्डर" t={t} t0={C.naya5 - 0.05} t1={C.beech5 - 0.3} x={540} y={420} size={86} color="#f6e8c8" box="rgba(90,30,20,0.75)" />
      <Label text="टापू के बीच से!" t={t} t0={C.beech5 + 0.15} t1={C.y1885 - 0.1} x={540} y={420} size={82} color="#fff" />

      {/* ---- 1885: the lighthouse */}
      <Year text="1885" t={t} t0={C.y1885 - 0.05} t1={C.lighthouse6} />
      {near && <Actor t={t} t0={C.lighthouse6 - 0.3} t1={C.shareef11 + 0.1} pose="lighthouse" x={lh[0]} y={lh[1]} h={lhH} bob={0} rise={1.1} drop={false}
        glow={t > C.dikkat7 - 0.1 && t < C.par8 + 0.3 ? 'rgba(255,60,60,0.9)' : undefined} />}
      <Label text="सबसे ऊँची जगह" t={t} t0={C.oonchi6 - 0.05} t1={C.dikkat7 - 0.1} x={lh[0]} y={lh[1] - lhH - 20} size={58} color="#FFE45A" arrow />
      <Label text="बस एक दिक्कत…" t={t} t0={C.dikkat7 - 0.05} t1={C.sweden7 - 0.05} x={540} y={420} size={84} color="#fff" />
      <Flag t={t} t0={C.sweden7 - 0.1} t1={C.jung8 - 0.1} x={lh[0] - 170} y={lh[1] - 30} kind="se" w={150} />
      <Label text="स्वीडन की ज़मीन" t={t} t0={C.sweden7 - 0.05} t1={C.jung8 - 0.1} x={540} y={420} size={84} color="#FFE45A" box="rgba(0,60,110,0.8)" />

      {/* ---- no war: the lighthouse helps everyone */}
      <Actor t={t} t0={C.jung8 - 0.08} t1={C.par8 + 0.1} pose="swords_crossed" x={540} y={1000} h={420} shadow={false} bob={0} glow="rgba(255,80,60,0.7)" />
      <Label text="जंग?" t={t} t0={C.jung8 - 0.05} t1={C.par8 + 0.1} x={540} y={420} size={110} color="#FF5A4A" />
      <Label text="यहाँ नहीं" t={t} t0={C.par8 + 0.1} t1={C.fayda8 - 0.1} x={540} y={420} size={110} color="#9CF0B0" />
      <Overlay name="overlay_lighthouse_beam" a={beamA * 0.75} x={lh[0]} y={lh[1] - lhH * 0.86} w={1500} rot={Math.sin((t - C.fayda8) * 1.2) * 28} origin="50% 50%" />
      {near && <Actor t={t} t0={C.fayda8 - 0.5} t1={C.y1985 - 0.2} pose="steamship_1880s" x={sh0[0]} y={sh0[1]} h={190} shadow={false} bob={2} sway={1.5} drop={false}
        path={{ t0: C.fayda8 - 0.5, t1: C.y1985 - 0.1, x: sh1[0], y: sh1[1] }} />}
      <Label text="सबका फ़ायदा" t={t} t0={C.fayda8 - 0.05} t1={C.sau9 + 0.6} x={540} y={420} size={86} color="#FFE45A" />

      {/* ---- 1985: the fix */}
      <Year text="1985" t={t} t0={C.y1985 - 0.05} t1={C.hal9 - 0.1} />
      <Label text="~100 साल बाद" t={t} t0={C.sau9 + 0.6} t1={C.y1985 - 0.05} x={540} y={420} size={70} color="#fff" />
      <Actor t={t} t0={C.y1985 + 0.2} t1={C.moda10 - 0.3} pose="surveyor_theodolite" x={east[0] + 160} y={east[1] + 280} h={380} />
      <Actor t={t} t0={C.hal9 - 0.15} t1={C.nahi10 + 0.6} pose="handshake" x={540} y={1360} h={300} shadow={false} bob={2} />
      <Label text="कमाल का हल" t={t} t0={C.hal9 - 0.05} t1={C.nahi10 - 0.05} x={540} y={420} size={86} color="#9CF0B0" />
      <Label text="बॉर्डर ही मोड़ दिया" t={t} t0={C.moda10 - 0.05} t1={C.finland10 - 0.1} x={540} y={420} size={82} color="#FFE45A" box="rgba(10,30,45,0.7)" />
      <Label text="फ़िनलैंड" t={t} t0={C.finland10 - 0.05} t1={C.jung11} x={east[0]} y={east[1] - 30} size={58} color="#fff" box="rgba(0,47,108,0.85)" />
      <Label text="स्वीडन" t={t} t0={C.finland10 + 0.2} t1={C.jung11} x={west[0]} y={west[1] - 30} size={58} color="#1b1206" box="rgba(254,204,0,0.9)" />
      <Label text="दोनों की ज़मीन बराबर" t={t} t0={C.barabar10 - 0.05} t1={C.jung11} x={540} y={420} size={92} color="#fff" />
      <Actor t={t} t0={C.barabar10 - 0.1} t1={C.jung11 - 0.05} pose="balance_scale" x={540} y={1400} h={300} shadow={false} bob={0}
        rot={kick(t, C.barabar10, 9, 7, 3.5)} glow="rgba(255,212,90,0.6)" />

      {/* ---- the end */}
      <Label text="न जंग, न नुकसान" t={t} t0={C.jung11 - 0.05} t1={C.shareef11 - 0.1} x={540} y={420} size={86} color="#fff" />
      <Actor t={t} t0={C.shareef11 + 0.1} t1={C.hatate12 - 0.5} pose="market_island" x={540} y={1130} h={420} shadow={false} bob={3} glow="rgba(255,228,140,0.6)" />
      <Label text="दुनिया का सबसे शरीफ़ बॉर्डर" t={t} t0={C.shareef11 - 0.05} t1={C.hatate12 - 0.4} x={540} y={470} size={70} color="#FFE45A" />
      <Overlay name="overlay_sea_fog" a={window4(t, C.jung11, C.shareef11, DURATION_S - 0.5, DURATION_S + 2) * 0.55} x={lerp(420, 660, ramp(t, C.jung11, DURATION_S, linear))} y={1100} w={2200} />
      <Question t={t} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- frame-level
/** Darkens the map under the end card. */
export const darkAt = (t: number) => ramp(t, C.hatate12 - 0.5, C.hatate12, linear) * 0.6;

export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.zigzag1, 8], [C.y1809, 10], [C.jung4, 12], [C.russi4, 7], [C.dikkat7, 7], [C.jung8, 14], [C.y1985, 8], [C.moda10, 8]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export const Grade: React.FC<{ t: number }> = ({ t }) => {
  const flash = Math.max(
    window4(t, C.y1809 + 0.3, C.y1809 + 0.33, C.y1809 + 0.37, C.y1809 + 0.6) * 0.6,
    window4(t, C.y1985 - 0.03, C.y1985, C.y1985 + 0.04, C.y1985 + 0.25) * 0.5,
    window4(t, C.zigzag10 - 0.03, C.zigzag10, C.zigzag10 + 0.04, C.zigzag10 + 0.3) * 0.4,
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,10,20,0.35), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,8,16,0.5))' }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff', opacity: flash * 0.5, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};

export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.4;
  if (i < 0 || t > end || t > C.hatate12 - 0.5) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = (i === 0 ? 1 : ramp(t, t0, t0 + 0.1, linear)) * (1 - ramp(t, t1 - 0.02, t1, linear));
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1500, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.25,
      color: '#fff', opacity: a, transform: `translateY(${(1 - ramp(t, t0, t0 + 0.14)) * 8}px)`,
      textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.45)' }}>{text}</div>
  );
};

export { easeIn, easeOut, inOut, linear };
