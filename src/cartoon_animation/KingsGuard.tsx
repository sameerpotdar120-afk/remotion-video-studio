/**
 * Trial: cartoon-explainer edit ("Why do the King's Guard exist?"), separate from the map videos.
 * Script and VO are the reference's (vocals separated with Demucs); every image is ours (GPT), text/graphics in code.
 */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FPS, clamp01, easeIn, easeOut, inOut, kick, lerp, linear, pop, ramp, window4 } from './anim';
import sizes from '../../public/cartoon_animation/img_sizes.json';
import words from './words.json';

type Word = { w: string; s: number; e: number };
const WORDS = words as Word[];
const SZ = sizes as unknown as Record<string, [number, number]>;
const img = (n: string) => staticFile(`cartoon_animation/img/${n}.png`);
export const KG_DURATION_S = 89.2;
export const KG_DURATION = Math.ceil(KG_DURATION_S * FPS);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
/** Start time of a spoken phrase (its `occ`-th occurrence). */
const T = (phrase: string, occ = 1): number => {
  const p = phrase.split(' ').map(norm);
  let n = 0;
  for (let i = 0; i + p.length <= WORDS.length; i++) {
    if (p.every((x, j) => norm(WORDS[i + j].w) === x) && ++n === occ) return WORDS[i].s;
  }
  throw new Error(`cue not found: ${phrase}`);
};
const speaking = (t: number) => WORDS.some((w) => t >= w.s && t <= w.e);

const CAP = "'Montserrat', sans-serif";
const POP = "'LuckiestGuy', 'Bangers', sans-serif";

let fontPromise: Promise<unknown> | null = null;
const useFonts = () => {
  const [h] = useState(() => delayRender('kg fonts'));
  useEffect(() => {
    if (!fontPromise) {
      const add = (f: FontFace) => f.load().then((x) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(x));
      fontPromise = Promise.all([
        add(new FontFace('Montserrat', `url(${staticFile('cartoon_animation/fonts/Montserrat.ttf')})`, { weight: '100 900' })),
        add(new FontFace('LuckiestGuy', `url(${staticFile('cartoon_animation/fonts/LuckiestGuy.ttf')})`)),
        add(new FontFace('Bangers', `url(${staticFile('cartoon_animation/fonts/Bangers.ttf')})`)),
      ]);
    }
    fontPromise.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

// ---------------------------------------------------------------- building blocks
/** A background filling the frame (cover), optionally only a band of it (for foreground occluders). */
const Bg: React.FC<{ name: string; pos?: string; clip?: string }> = ({ name, pos = '50% 50%', clip }) => (
  <img src={img(name)} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, objectFit: 'cover', objectPosition: pos, clipPath: clip }} />
);

type Enter = 'pop' | 'up' | 'left' | 'right' | 'drop' | 'none';
/** A character or prop: bottom-centre anchor; springs in, breathes, bounces while the VO speaks. */
const Actor: React.FC<{
  t: number; name: string; x: number; y: number; h: number; t0: number; t1?: number; enter?: Enter; flip?: boolean;
  rot?: number; talk?: boolean; bob?: number; path?: { t0: number; t1: number; x: number; y?: number; e?: (x: number) => number }; walk?: boolean; shake?: number; filter?: string;
}> = ({ t, name, x, y, h, t0, t1 = 999, enter = 'pop', flip, rot = 0, talk, bob = 1, path, walk, shake = 0, filter }) => {
  if (t < t0 - 0.01 || t > t1 + 0.25) return null;
  const [iw, ih] = SZ[name] ?? [600, 900];
  const w = (h * iw) / ih;
  const s = pop(t, t0, 9, 210);
  const out = ramp(t, t1, t1 + 0.22, easeIn);
  let px = x, py = y, sc = 1, ty = 0;
  if (enter === 'pop') sc = s;
  if (enter === 'up') ty = (1 - clamp01(s)) * 700 - (s > 1 ? (s - 1) * 60 : 0);
  if (enter === 'drop') ty = -(1 - clamp01(s)) * 900;
  if (enter === 'left') px = lerp(-w, x, clamp01(s));
  if (enter === 'right') px = lerp(1080 + w, x, clamp01(s));
  if (path) {
    const q = ramp(t, path.t0, path.t1, path.e ?? inOut);
    px = lerp(px, path.x, q);
    py = lerp(y, path.y ?? y, q);
  }
  const lt = t - t0;
  const breathe = Math.sin(lt * 3.1) * 0.012 * bob;
  const tk = talk && speaking(t) ? Math.abs(Math.sin(lt * 17)) * 0.03 : 0;
  const step = walk ? Math.abs(Math.sin(lt * 9)) * 18 : 0;
  const wob = walk ? Math.sin(lt * 9) * 3 : 0;
  const sh = shake ? Math.sin(lt * 63) * shake : 0;
  const land = enter === 'pop' || enter === 'drop' ? kick(t, t0 + 0.14, 0.08, 26, 10) : 0;
  const k = sc * (1 - out);
  if (k <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: px - w / 2 + sh, top: py - h + ty - step, width: w, height: h, transformOrigin: '50% 100%',
      transform: `rotate(${rot + wob}deg) scale(${k * (1 - land) * (flip ? -1 : 1)}, ${k * (1 + land + breathe + tk)})`,
      filter: filter ?? 'drop-shadow(0 10px 14px rgba(0,0,0,0.35))' }}>
      <img src={img(name)} style={{ width: w, height: h, display: 'block' }} />
    </div>
  );
};

/** Chunky cartoon pop text with a thick outline. */
const PopText: React.FC<{ t: number; t0: number; t1?: number; text: string; x: number; y: number; size: number; color?: string; stroke?: string; rot?: number; wiggle?: boolean; font?: string }> = ({
  t, t0, t1 = 999, text, x, y, size, color = '#fff', stroke = '#1c1414', rot = 0, wiggle = true, font = POP,
}) => {
  if (t < t0 || t > t1 + 0.2) return null;
  const s = pop(t, t0, 8, 260) * (1 - ramp(t, t1, t1 + 0.18, easeIn));
  if (s <= 0.01) return null;
  const wg = wiggle ? Math.sin((t - t0) * 6) * 2 : 0;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot + wg}deg) scale(${s})`, whiteSpace: 'nowrap',
      fontFamily: font, fontSize: size, color, WebkitTextStroke: `${size * 0.09}px ${stroke}`, paintOrder: 'stroke fill', letterSpacing: 1,
      filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))', lineHeight: 1 }}>{text}</div>
  );
};

/** Shot: a camera (push/pan) over everything inside; enters with a whip-pan or a zoom punch. */
const Shot: React.FC<{ t: number; t0: number; t1: number; z?: [number, number]; x?: [number, number]; y?: [number, number]; enter?: 'whip' | 'whipL' | 'punch' | 'cut'; children: React.ReactNode }> = ({
  t, t0, t1, z = [1, 1.08], x = [0, 0], y = [0, 0], enter = 'cut', children,
}) => {
  if (t < t0 - 0.001 || t >= t1) return null;
  const q = ramp(t, t0, t1, linear);
  const e = inOut(q) * 0.3 + q * 0.7;
  let zz = lerp(z[0], z[1], e), xx = lerp(x[0], x[1], e), yy = lerp(y[0], y[1], e), blur = 0;
  if (enter === 'whip' || enter === 'whipL') {
    const w = 1 - ramp(t, t0, t0 + 0.22, easeOut);
    xx += (enter === 'whip' ? 1 : -1) * w * 1100;
    blur = w * 40;
  }
  if (enter === 'punch') {
    const w = 1 - ramp(t, t0, t0 + 0.28, easeOut);
    zz *= 1 + w * 0.35;
    blur = w * 12;
  }
  return (
    <AbsoluteFill style={{ overflow: 'hidden', filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
      <AbsoluteFill style={{ transform: `translate(${xx}px, ${yy}px) scale(${zz})`, transformOrigin: '50% 50%' }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Rotating comic sunburst. */
const Sunburst: React.FC<{ t: number; c1: string; c2: string }> = ({ t, c1, c2 }) => (
  <AbsoluteFill style={{ overflow: 'hidden', background: c1 }}>
    <div style={{ position: 'absolute', left: 540 - 1600, top: 960 - 1600, width: 3200, height: 3200, transform: `rotate(${t * 18}deg)`,
      background: `repeating-conic-gradient(${c2} 0deg 10deg, ${c1} 10deg 20deg)` }} />
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.55), rgba(255,255,255,0) 45%)' }} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- special graphics
/** "EMPLOYMENT" in dripping horror red. */
const Dripping: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  if (t < t0 || t > t1 + 0.2) return null;
  const s = pop(t, t0, 9, 240) * (1 - ramp(t, t1, t1 + 0.18, easeIn));
  const drip = ramp(t, t0 + 0.2, t0 + 1.6, easeOut);
  return (
    <div style={{ position: 'absolute', left: 540, top: 330, transform: `translate(-50%,-50%) scale(${s})` }}>
      <svg width={900} height={260} style={{ overflow: 'visible' }}>
        {[90, 210, 330, 470, 560, 700, 810].map((dx, i) => (
          <rect key={i} x={dx} y={120} width={14 + (i % 3) * 5} height={20 + drip * (40 + ((i * 37) % 90))} rx={9} fill="#a8141a" />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: POP, fontSize: 124, color: '#d6232a',
        WebkitTextStroke: '10px #3a0608', paintOrder: 'stroke fill', filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.5))', letterSpacing: 2 }}>EMPLOYMENT</div>
    </div>
  );
};

/** Persona-style red/black/white graphic background. */
const Noir: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const q = ramp(t, t0, t0 + 0.35, easeOut);
  const drift = (t - t0) * 30;
  return (
    <AbsoluteFill style={{ background: '#0b0b0b', overflow: 'hidden' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        <polygon points={`${-200 + (1 - q) * -900 + drift},0 ${700 + (1 - q) * -900 + drift},0 ${200 + (1 - q) * -900 + drift},1920 ${-700 + (1 - q) * -900 + drift},1920`} fill="#d71920" />
        <polygon points={`${980 - drift + (1 - q) * 900},0 ${1300 - drift + (1 - q) * 900},0 ${900 - drift + (1 - q) * 900},1920 ${560 - drift + (1 - q) * 900},1920`} fill="#f2f2f2" />
        <polygon points={`${1060 - drift + (1 - q) * 900},0 ${1180 - drift + (1 - q) * 900},0 ${780 - drift + (1 - q) * 900},1920 ${660 - drift + (1 - q) * 900},1920`} fill="#d71920" />
      </svg>
    </AbsoluteFill>
  );
};

const TrustCard: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  if (t < t0) return null;
  const s = pop(t, t0, 8, 240);
  const n = Math.min(10, Math.round(ramp(t, t0 + 0.15, t0 + 0.7, easeOut) * 10));
  return (
    <div style={{ position: 'absolute', left: 560, top: 420, transform: `translate(-50%,-50%) rotate(-8deg) scale(${s})` }}>
      <div style={{ background: '#fff', padding: '14px 34px 10px', border: '8px solid #111', boxShadow: '14px 14px 0 #d71920', display: 'flex', alignItems: 'center', gap: 26 }}>
        <span style={{ fontFamily: "'Bangers', sans-serif", fontSize: 120, color: '#111', letterSpacing: 4 }}>TRUST</span>
        <span style={{ fontFamily: "'Bangers', sans-serif", fontSize: 150, color: '#fff', background: '#111', padding: '0 22px', transform: 'rotate(6deg)', display: 'inline-block' }}>{n}<span style={{ fontSize: 70 }}>/10</span></span>
      </div>
    </div>
  );
};

/** The monitor screen on bg_office_desk (screen rect measured on the background). */
const Monitor: React.FC<{ t: number; t0: number; tArmy: number; tJoin: number }> = ({ t, t0, tArmy, tJoin }) => {
  const R = { x: 150, y: 878, w: 800, h: 404 };
  const boot = ramp(t, t0, t0 + 0.4, easeOut);
  const army = t >= tArmy;
  const click = window4(t, tJoin, tJoin + 0.05, tJoin + 0.15, tJoin + 0.3);
  const cx = lerp(R.x + 700, R.x + 400, ramp(t, tArmy, tJoin - 0.1, inOut));
  const cy = lerp(R.y + 360, R.y + 300, ramp(t, tArmy, tJoin - 0.1, inOut));
  return (
    <div style={{ position: 'absolute', left: R.x, top: R.y, width: R.w, height: R.h, overflow: 'hidden', background: '#eef1f5', opacity: boot, borderRadius: 6 }}>
      {!army ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', border: '14px solid #c9d0da', borderTopColor: '#4a6fa5', transform: `rotate(${t * 400}deg)`, opacity: 1 - ramp(t, t0 + 0.6, t0 + 0.9) }} />
          <div style={{ fontFamily: CAP, fontWeight: 900, fontSize: 84, color: '#2c3440', letterSpacing: 2, opacity: ramp(t, t0 + 0.7, t0 + 1.0), transform: `scale(${clamp01(pop(t, t0 + 0.7, 10, 220))})`, marginTop: -60, lineHeight: 1 }}>JOB<br />PORTAL</div>
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#012169 0 50%,#0b2d7a 50%)' }} />
          <svg width={R.w} height={R.h} style={{ position: 'absolute', opacity: 0.35 }}>
            <path d={`M0,0 L${R.w},${R.h} M${R.w},0 L0,${R.h}`} stroke="#fff" strokeWidth={60} />
            <path d={`M${R.w / 2},0 V${R.h} M0,${R.h / 2} H${R.w}`} stroke="#fff" strokeWidth={90} />
            <path d={`M${R.w / 2},0 V${R.h} M0,${R.h / 2} H${R.w}`} stroke="#C8102E" strokeWidth={50} />
          </svg>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: CAP, fontWeight: 900, fontSize: 130, color: '#fff', letterSpacing: 8, textShadow: '0 6px 0 #0a1a40',
            transform: `scale(${clamp01(pop(t, tArmy, 10, 220))})` }}>ARMY</div>
          <div style={{ position: 'absolute', left: R.w / 2 - 120, top: 260, width: 240, height: 76, borderRadius: 40, background: click > 0 ? '#9a0d22' : '#C8102E', border: '5px solid #fff',
            fontFamily: CAP, fontWeight: 900, fontSize: 44, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - click * 0.08})` }}>JOIN</div>
          <svg width={60} height={70} style={{ position: 'absolute', left: cx - R.x - R.x + R.x, top: cy - R.y, overflow: 'visible' }}>
            <path d="M0,0 L0,52 L14,40 L24,62 L33,58 L23,36 L42,36 Z" fill="#fff" stroke="#111" strokeWidth={4} strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
};

/** ARMY → regiments tree on white. */
const Tree: React.FC<{ t: number; tCrest: number; tReg: number; tA: number; tB: number }> = ({ t, tCrest, tReg, tA, tB }) => {
  const line = ramp(t, tReg, tReg + 0.5, easeOut);
  const branch = ramp(t, tReg + 0.4, tReg + 0.9, easeOut);
  return (
    <AbsoluteFill style={{ background: '#fbfaf6' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 40%, #ffffff, #ece8de)' }} />
      <Actor t={t} name="prop_army_crest" x={540} y={600} h={400} t0={tCrest} bob={0.4} />
      <PopText t={t} t0={tCrest + 0.25} text="ARMY" x={540} y={670} size={110} color="#c8102e" wiggle={false} font={CAP} stroke="#fff" />
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d="M540,730 V840" stroke="#222" strokeWidth={10} pathLength={1} strokeDasharray={`${line} 1`} fill="none" />
        <path d="M540,840 H270 V920 M540,840 H810 V920" stroke="#222" strokeWidth={10} pathLength={1} strokeDasharray={`${branch} 1`} fill="none" strokeLinejoin="round" />
      </svg>
      <Actor t={t} name="prop_badge_a" x={270} y={1180} h={260} t0={tA} bob={0.4} />
      <Actor t={t} name="prop_badge_b" x={810} y={1170} h={240} t0={tB} bob={0.4} />
      <PopText t={t} t0={tA + 0.1} text="GRENADIERS" x={270} y={1230} size={60} color="#1c2a5c" stroke="#fff" wiggle={false} font={CAP} />
      <PopText t={t} t0={tB + 0.1} text="COLDSTREAM" x={810} y={1230} size={60} color="#9a0d22" stroke="#fff" wiggle={false} font={CAP} />
    </AbsoluteFill>
  );
};

/** The recruit's file: photo, name, CLEAN stamp, radar chart. */
const Dossier: React.FC<{ t: number; t0: number; tClean: number; tStrong: number }> = ({ t, t0, tClean, tStrong }) => {
  if (t < t0) return null;
  const s = ramp(t, t0, t0 + 0.45, easeOut);
  const stats = [0.9, 0.85, 0.95, 0.8, 0.9];
  const g = ramp(t, tStrong - 0.1, tStrong + 0.6, easeOut);
  const pt = (i: number, r: number) => [200 + Math.sin((i / 5) * Math.PI * 2) * r * 150, 190 - Math.cos((i / 5) * Math.PI * 2) * r * 150];
  return (
    <div style={{ position: 'absolute', left: 90, top: lerp(1950, 760, s), width: 900, height: 980, background: '#f7f3e8', borderRadius: 18, transform: `rotate(${-3 + (1 - s) * 8}deg)`,
      boxShadow: '0 20px 40px rgba(0,0,0,0.45)', border: '6px solid #2b2120', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 40, top: 40, width: 230, height: 270, background: '#cfd8e3', border: '5px solid #2b2120', overflow: 'hidden' }}>
        <img src={img('you_headshot')} style={{ width: 230, position: 'absolute', bottom: -20 }} />
      </div>
      <div style={{ position: 'absolute', left: 300, top: 70, fontFamily: CAP, fontWeight: 900, fontSize: 78, color: '#2b2120' }}>JOHN DOE</div>
      <div style={{ position: 'absolute', left: 300, top: 165, width: 520, height: 8, background: '#2b2120' }} />
      <div style={{ position: 'absolute', left: 300, top: 195, fontFamily: CAP, fontWeight: 700, fontSize: 38, color: '#6b5d52' }}>RECRUIT · GUARD DUTY</div>
      {t >= tClean && (
        <div style={{ position: 'absolute', left: 40, top: 350, padding: '6px 30px', background: '#5b8c3a', border: '6px solid #2b2120', fontFamily: POP, fontSize: 96, color: '#fff',
          transform: `rotate(-4deg) scale(${lerp(1.8, 1, ramp(t, tClean, tClean + 0.15, easeIn))})` }}>CLEAN ✓</div>
      )}
      <div style={{ position: 'absolute', left: 40, top: 500, fontFamily: CAP, fontWeight: 900, fontSize: 48, color: '#2b2120' }}>STATS</div>
      <svg width={400} height={400} style={{ position: 'absolute', left: 250, top: 540 }}>
        {[1, 0.66, 0.33].map((r, k) => <polygon key={k} points={[0, 1, 2, 3, 4].map((i) => pt(i, r).join(',')).join(' ')} fill="none" stroke="#8a7d72" strokeWidth={3} />)}
        <polygon points={stats.map((v, i) => pt(i, v * g).join(',')).join(' ')} fill="rgba(74,111,165,0.55)" stroke="#2c4f86" strokeWidth={6} strokeLinejoin="round" />
      </svg>
      {['DISCIPLINE', 'FITNESS', 'LOYALTY', 'FOCUS', 'DRILL'].map((n, i) => {
        const [x, y] = pt(i, 1.32);
        return <div key={n} style={{ position: 'absolute', left: 250 + x, top: 540 + y, transform: 'translate(-50%,-50%)', fontFamily: CAP, fontWeight: 800, fontSize: 26, color: '#4b3f36' }}>{n}</div>;
      })}
    </div>
  );
};

const Thought: React.FC<{ t: number; t0: number; t1: number; x: number; y: number }> = ({ t, t0, t1, x, y }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = clamp01(pop(t, t0, 10, 200));
  const burst = ramp(t, t1, t1 + 0.25, easeOut);
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: 1 - burst, transform: `scale(${s * (1 + burst * 0.4)})`, transformOrigin: '20% 100%' }}>
      {[[0, 260, 34], [50, 200, 50]].map(([dx, dy, r], i) => (
        <div key={i} style={{ position: 'absolute', left: dx - r, top: dy - r, width: r * 2, height: r * 2, borderRadius: '50%', background: '#fff', border: '6px solid #2b2120',
          transform: `scale(${clamp01(pop(t, t0 + i * 0.08, 10, 220))})` }} />
      ))}
      <div style={{ position: 'absolute', left: 30, top: -330, width: 520, height: 440, borderRadius: '50%', background: '#fff', border: '7px solid #2b2120', overflow: 'hidden',
        transform: `scale(${clamp01(pop(t, t0 + 0.15, 10, 200))})` }}>
        <img src={img('prop_uniform')} style={{ position: 'absolute', left: 90, top: 50, width: 340, filter: `drop-shadow(0 0 ${10 + Math.sin(t * 8) * 6}px rgba(255,214,90,0.9))` }} />
      </div>
    </div>
  );
};

const Sparkles: React.FC<{ t: number; t0: number; t1: number; x: number; y: number }> = ({ t, t0, t1, x, y }) => {
  if (t < t0 || t > t1) return null;
  return (
    <>
      {[[-180, -40], [170, -120], [120, 90], [-140, 130], [0, -200]].map(([dx, dy], i) => {
        const ph = (t - t0) * 3 + i * 1.3;
        const a = Math.abs(Math.sin(ph));
        return <div key={i} style={{ position: 'absolute', left: x + dx, top: y + dy, fontSize: 70, color: '#FFD84A', opacity: a, transform: `translate(-50%,-50%) scale(${0.5 + a * 0.7}) rotate(${ph * 40}deg)`,
          filter: 'drop-shadow(0 0 10px #fff3b0)' }}>✦</div>;
      })}
    </>
  );
};

const Subscribe: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  if (t < t0) return null;
  const s = pop(t, t0, 8, 260);
  const press = window4(t, t0 + 0.55, t0 + 0.62, t0 + 0.75, t0 + 0.9);
  return (
    <div style={{ position: 'absolute', left: 540, top: 520, transform: `translate(-50%,-50%) rotate(-4deg) scale(${s * (1 - press * 0.08)})` }}>
      <div style={{ padding: '18px 50px 22px', borderRadius: 60, background: press > 0 ? '#7a7a7a' : '#e2231a', border: '8px solid #2b0c0a', boxShadow: '0 10px 0 #2b0c0a',
        fontFamily: POP, fontSize: 100, color: '#fff', WebkitTextStroke: '8px #2b0c0a', paintOrder: 'stroke fill' }}>{press > 0 || t > t0 + 0.75 ? 'SUBSCRIBED!' : 'SUBSCRIBE!'}</div>
    </div>
  );
};

// ---------------------------------------------------------------- captions (word by word, phrase builds up)
type Chunk = { s: number; e: number; words: { w: string; s: number }[] };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Chunk | null = null;
  for (let i = 0; i < WORDS.length; i++) {
    const w = WORDS[i];
    let txt = w.w.replace(/[.,!?]/g, '').toUpperCase();
    if (/^2500$/.test(txt)) txt = '£2,500';
    if (txt === 'THOUSAND') continue;
    if (txt === 'POUNDS' && cur?.words.some((x) => x.w === '£2,500')) continue;
    if (!cur || cur.words.length >= 5 || w.s - cur.e > 0.35) {
      if (cur) out.push(cur);
      cur = { s: w.s, e: w.e, words: [] };
    }
    cur.words.push({ w: txt, s: w.s });
    cur.e = w.e;
    if (/[.,!?]$/.test(w.w)) { out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = CHUNKS.findIndex((c, k) => t >= c.s && t < (CHUNKS[k + 1]?.s ?? c.e + 0.5));
  if (i < 0) return null;
  const c = CHUNKS[i];
  if (t > c.e + 0.6) return null;
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: 1290, textAlign: 'center', fontFamily: CAP, fontWeight: 900, fontSize: 58, lineHeight: 1.15, color: '#fff',
      WebkitTextStroke: '9px #000', paintOrder: 'stroke fill', textShadow: '0 5px 0 rgba(0,0,0,0.6)' }}>
      {c.words.filter((w) => w.s <= t + 0.02).map((w, k, arr) => {
        const p = clamp01(pop(t, w.s, 11, 300));
        const last = k === arr.length - 1;
        return <span key={k} style={{ display: 'inline-block', marginRight: 16, transform: `scale(${lerp(0.6, 1, p)})`, color: last ? '#fff' : '#fff' }}>{w.w}</span>;
      })}
    </div>
  );
};

// ---------------------------------------------------------------- the edit
export const KingsGuard: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const t = useCurrentFrame() / FPS;
  useFonts();
  const c = {
    surely: T('surely'), fun: T('fun fact'), k2500: T('2500'), just: T('just standing'), thisGot: T('this got'), land: T('land a job'), andWhy: T('and why'),
    orig: T('originally'), purpose: T('their entire purpose'), protect: T('protect'), costs: T('costs'), cent: T('centuries'), assas: T('assassinations'), coups: T('coups'), power: T('power struggles'),
    so: T('so they surrounded'), loyal: T('loyal'), capable: T('capable'), ifHad: T('if you had'), trusted: T('trusted'), andYes: T('and yes that'), real: T('real soldiers'), shoot: T('shoot'),
    want: T('if you want'), first: T('first of all'), british: T('british army'), from: T('from there'), serve: T('serve'), regiments: T('regiments'), gren: T('grenadiers'), cold: T('coldstream'),
    these: T('these are frontline'), disc: T('disciplined'), clean: T('clean records'), strong: T('strong performance'), once: T('once selected'), uniform: T('uniform'), trained: T('trained'),
    includes: T('that includes'), marching: T('marching'), andYes2: T('and yes learning'), still: T('still for'), alert: T('alert'), andNo: T('and no'), two: T('two hours'), switched: T('switched'), sub: T('subscribe'),
  };
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* 1 · London: the guards */}
      <Shot t={t} t0={0} t1={c.surely} z={[1.0, 1.12]} y={[0, -40]}>
        <Bg name="bg_palace_front" />
        {[300, 540, 780].map((x, i) => <Actor key={i} t={t} name="guard_attention" x={x} y={1560} h={560} t0={0.05 + i * 0.1} bob={0.6} />)}
      </Shot>
      <Shot t={t} t0={c.surely} t1={c.fun} z={[1.05, 1.18]} enter="punch">
        <Bg name="bg_palace_front" />
        <Actor t={t} name="guard_closeup" x={290} y={1980} h={1400} t0={c.surely} enter="left" rot={8} />
        <Actor t={t} name="guard_closeup" x={820} y={2020} h={1300} t0={c.surely + 0.25} enter="right" rot={-8} flip />
        <PopText t={t} t0={T('goofy')} text="GOOFY?" x={540} y={360} size={130} color="#FFD84A" rot={-6} />
      </Shot>

      {/* 2 · £2,500 a month for standing */}
      <Shot t={t} t0={c.fun} t1={c.k2500} z={[1.0, 1.1]} enter="whip">
        <Bg name="bg_sentry_box" />
        <Actor t={t} name="guard_attention" x={480} y={1390} h={900} t0={c.fun} enter="none" bob={0.5} />
        <PopText t={t} t0={c.fun + 0.05} text="FUN FACT" x={540} y={300} size={110} color="#7fe0ff" rot={-5} />
      </Shot>
      <Shot t={t} t0={c.k2500} t1={c.just} z={[1.0, 1.06]} enter="punch">
        <Sunburst t={t} c1="#f2b84b" c2="#f7d67a" />
        <Actor t={t} name="guard_smug" x={540} y={1560} h={1100} t0={c.k2500} talk />
        <PopText t={t} t0={c.k2500 + 0.05} text="+£2,500" x={540} y={330} size={190} color="#4fd65a" stroke="#0d3312" rot={-4} />
        <PopText t={t} t0={T('a month')} text="/ MONTH" x={600} y={500} size={90} color="#fff" rot={3} />
        <Sparkles t={t} t0={c.k2500} t1={c.just} x={540} y={900} />
      </Shot>
      <Shot t={t} t0={c.just} t1={c.thisGot} z={[1.12, 1.2]} enter="cut">
        <Bg name="bg_sentry_box" />
        <Actor t={t} name="guard_attention" x={480} y={1390} h={900} t0={c.just} enter="none" bob={0.2} />
        <PopText t={t} t0={T('standing')} text="...JUST STANDING" x={540} y={300} size={86} color="#fff" rot={-3} />
      </Shot>

      {/* 3 · how do you and me get that job, and why does it exist */}
      <Shot t={t} t0={c.thisGot} t1={c.orig} z={[1.0, 1.1]} enter="whip">
        <Bg name="bg_lineup_wall" />
        <Actor t={t} name={t < c.andWhy ? 'you_think' : 'you_shrug'} x={360} y={1720} h={1000} t0={c.thisGot} enter="up" talk />
        <Actor t={t} name="recruiter_desk" x={820} y={1660} h={760} t0={T('average person')} enter="right" flip />
        <Dripping t={t} t0={c.land} t1={c.orig - 0.05} />
        <PopText t={t} t0={c.andWhy + 0.3} text="WHY?!" x={760} y={620} size={140} color="#FFD84A" rot={8} />
      </Shot>

      {/* 4 · originally: real bodyguards */}
      <Shot t={t} t0={c.orig} t1={c.cent} z={[1.0, 1.14]} y={[0, -30]} enter="whipL">
        <Bg name="bg_royal_path" />
        <Actor t={t} name="king_walk" x={260} y={1560} h={640} t0={c.orig} enter="none" walk path={{ t0: c.orig, t1: c.cent, x: 760, e: linear }} />
        <Actor t={t} name="old_bodyguard" x={440} y={1640} h={760} t0={c.purpose} enter="left" path={{ t0: c.purpose + 0.3, t1: c.cent, x: 560, e: linear }} />
        <PopText t={t} t0={T('ceremonial')} t1={c.purpose} text="NOT CEREMONIAL" x={540} y={330} size={96} color="#fff" rot={-4} />
        <PopText t={t} t0={c.costs - 0.3} text="AT ALL COSTS" x={540} y={330} size={120} color="#ff5a4a" rot={-4} />
      </Shot>

      {/* 5 · kings were targets */}
      <Shot t={t} t0={c.cent} t1={c.so} z={[1.0, 1.12]} enter="punch">
        <Bg name="bg_dark_table" />
        <Actor t={t} name="prop_coins" x={250} y={700} h={260} t0={c.cent + 0.1} enter="drop" bob={0} />
        <Actor t={t} name="prop_poison_cake" x={800} y={830} h={360} t0={T('kings were')} enter="drop" bob={0} />
        <Actor t={t} name="prop_king_portrait" x={540} y={1380} h={620} t0={c.cent} enter="drop" bob={0} rot={-4} />
        <Actor t={t} name="prop_dagger" x={560} y={1180} h={560} t0={c.assas - 0.1} enter="drop" bob={0} rot={12} />
        <PopText t={t} t0={c.assas} text="ASSASSINATIONS" x={540} y={1560} size={92} color="#ff3b30" rot={-5} />
        <PopText t={t} t0={c.coups} text="COUPS" x={300} y={360} size={110} color="#ff3b30" rot={-8} />
        <PopText t={t} t0={c.power} text="POWER!" x={780} y={440} size={110} color="#ff3b30" rot={7} />
      </Shot>

      {/* 6 · surrounded by the most loyal soldiers */}
      <Shot t={t} t0={c.so} t1={c.ifHad} z={[1.0, 1.1]} y={[0, 30]} enter="whip">
        <Bg name="bg_throne_room" />
        <Actor t={t} name="king_throne" x={540} y={860} h={470} t0={c.so} bob={0.6} />
        {[180, 400, 680, 900].map((x, i) => <Actor key={i} t={t} name="guard_back" x={x} y={2050} h={1050} t0={T('themselves') + i * 0.12} enter="up" bob={0.3} />)}
        <PopText t={t} t0={c.loyal} text="LOYAL" x={300} y={330} size={110} color="#FFD84A" rot={-6} />
        <PopText t={t} t0={c.capable} text="CAPABLE" x={760} y={420} size={110} color="#FFD84A" rot={6} />
      </Shot>

      {/* 7 · the king trusted you with his life */}
      <Shot t={t} t0={c.ifHad} t1={c.andYes} z={[1.0, 1.08]} enter="punch">
        <Noir t={t} t0={c.ifHad} />
        <Actor t={t} name="guard_noir" x={540} y={1760} h={1350} t0={c.ifHad + 0.15} enter="up" bob={0.3}
          filter="grayscale(1) contrast(1.6) brightness(0.95) drop-shadow(14px 0 0 #d71920) drop-shadow(0 0 0 #fff)" />
        <TrustCard t={t} t0={c.trusted} />
      </Shot>

      {/* 8 · real soldiers, allowed to shoot */}
      <Shot t={t} t0={c.andYes} t1={c.want} z={[1.0, 1.1]} enter="whip">
        <Bg name="bg_palace_hall" />
        <Actor t={t} name="you_chocolate" x={330} y={1980} h={1150} t0={c.andYes} enter="up" talk />
        <Actor t={t} name="guard_rifle" x={800} y={1500} h={880} t0={c.real - 0.2} enter="right" shake={t > c.shoot ? 2 : 0} />
        <PopText t={t} t0={c.real} text="REAL SOLDIERS" x={540} y={330} size={100} color="#fff" rot={-4} />
        <PopText t={t} t0={c.shoot} text="BANG?!" x={760} y={600} size={140} color="#ff3b30" rot={10} />
      </Shot>

      {/* 9 · the job portal: join the army */}
      <Shot t={t} t0={c.want} t1={c.from} z={[1.0, 1.06]} enter="whipL">
        <Bg name="bg_office_desk" />
        <Monitor t={t} t0={c.want} tArmy={c.british - 0.2} tJoin={c.british + 0.5} />
        <Actor t={t} name="you_back_computer" x={460} y={2010} h={700} t0={c.want} enter="up" bob={0.4} />
        <PopText t={t} t0={T('not easy')} t1={c.first} text="NOT EASY" x={540} y={330} size={110} color="#ff5a4a" rot={-5} />
      </Shot>

      {/* 10 · the regiments */}
      <Shot t={t} t0={c.from} t1={c.these} z={[1.0, 1.05]} enter="cut">
        <Tree t={t} tCrest={c.from + 0.05} tReg={c.regiments} tA={c.gren} tB={c.cold} />
      </Shot>

      {/* 11 · only the best are chosen */}
      <Shot t={t} t0={c.these} t1={c.once} z={[1.0, 1.08]} enter="whip">
        <Bg name="bg_recruiter_office" />
        <Actor t={t} name="recruiter_desk" x={540} y={1140} h={760} t0={c.these} enter="up" talk />
        <Bg name="bg_recruiter_office" clip="inset(1080px 0 0 0)" />
        <PopText t={t} t0={T('frontline')} t1={c.clean - 0.1} text="FRONTLINE" x={540} y={260} size={110} color="#9CF0B0" rot={-4} />
        <Dossier t={t} t0={c.clean - 0.25} tClean={c.clean + 0.1} tStrong={c.strong} />
      </Shot>

      {/* 12 · selected: no free uniform, training */}
      <Shot t={t} t0={c.once} t1={c.includes} z={[1.0, 1.1]} enter="whipL">
        <Bg name="bg_barracks" />
        <Actor t={t} name="you_sleep" x={430} y={1020} h={420} t0={c.once} enter="none" bob={1.5} />
        <Thought t={t} t0={c.once + 0.2} t1={T("you'll be")} x={420} y={760} />
        <Actor t={t} name="drill_sergeant" x={760} y={1980} h={1050} t0={c.trained - 0.35} enter="right" talk shake={3} />
        <PopText t={t} t0={c.trained} text="WAKE UP!" x={600} y={420} size={130} color="#ff5a4a" rot={6} />
      </Shot>

      {/* 13 · drills and marching */}
      <Shot t={t} t0={c.includes} t1={c.andYes2} z={[1.0, 1.12]} x={[0, -60]} enter="whip">
        <Bg name="bg_training_field" />
        <Actor t={t} name="guard_march" x={-150} y={1700} h={1050} t0={c.includes} enter="none" walk path={{ t0: c.includes, t1: c.andYes2, x: 900, e: linear }} />
        <PopText t={t} t0={T('drills')} text="DRILLS" x={300} y={360} size={120} color="#fff" rot={-6} />
        <PopText t={t} t0={c.marching} text="IN SYNC" x={760} y={480} size={110} color="#FFD84A" rot={6} />
      </Shot>

      {/* 14 · standing completely still */}
      <Shot t={t} t0={c.andYes2} t1={c.andNo} z={[1.0, 1.25]} y={[0, -120]} enter="punch">
        <Bg name="bg_training_field" pos="30% 50%" />
        <Actor t={t} name="guard_still_sweat" x={540} y={1700} h={1250} t0={c.andYes2} enter="none" bob={0} shake={t > c.still ? 1.2 : 0} />
        <PopText t={t} t0={c.still} text="DON'T. MOVE." x={540} y={330} size={120} color="#fff" rot={-4} />
        <PopText t={t} t0={c.alert - 0.1} text="STAY ALERT" x={540} y={500} size={90} color="#FFD84A" rot={4} />
      </Shot>

      {/* 15 · two hours, then the change, subscribe */}
      <Shot t={t} t0={c.andNo} t1={KG_DURATION_S + 1} z={[1.0, 1.08]} enter="whip">
        <Bg name="bg_sentry_box" />
        <Actor t={t} name="guard_peace" x={480} y={1390} h={900} t0={c.andNo} t1={999} enter="none" bob={0.5}
          path={{ t0: c.switched, t1: c.switched + 1.0, x: -400, e: easeIn }} walk={t > c.switched} />
        <Actor t={t} name="guard_attention" x={1500} y={1390} h={900} t0={c.switched + 0.2} enter="none" bob={0.5}
          path={{ t0: c.switched + 0.2, t1: c.switched + 1.0, x: 480, e: easeOut }} />
        <PopText t={t} t0={T('all day')} t1={c.two - 0.1} text="NOT ALL DAY" x={540} y={330} size={110} color="#fff" rot={-4} />
        <PopText t={t} t0={c.two} t1={c.sub - 0.1} text="⏱ 2 HOURS" x={540} y={330} size={130} color="#FFD84A" rot={-4} />
        <Subscribe t={t} t0={c.sub} />
      </Shot>

      {captions && <Captions t={t} />}
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.28) 100%)' }} />
      {captions && <Audio src={staticFile('cartoon_animation/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
