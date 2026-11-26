import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Campus, BState } from './Campus';
import { CC, DUR, GEO, L, LETTERS, READ, campusCam, cloud, mapCam, mode, mppC, P, PL, projC, threeCam, Cam } from './cam';
import { C, IMG, LABEL, Pill, Prop, Person, TAMIL, TITLE, UI, asp, back, clamp01, easeIn, easeOut, inOut, useFonts, win } from './Kit';
import { MapLayers } from './Map';
import TIMING from './timing.json';

export const TN_DURATION_S = DUR;
const TM = TIMING as unknown as { words: [number, number, string][]; caps: number[][] };
const GOLD = '#FFC23A';
const IGN = (i: number) => 5.64 + i * 0.28; // the hook: letters cut in one by one
const RISE: Record<L, number> = { 'ழ்': 38.76, 'மி': 41.22, 'டு': 42.18, 'த': 44.55, 'நா': 44.75 };
const FAC: Partial<Record<L, [number, number, string, string, string]>> = { // building: [t0, t1, prop, hi, en]
  'ழ்': [50.45, 52.2, 'tn04_palm_leaf_manuscript', 'भाषा विभाग', 'LANGUAGE'],
  'மி': [52.4, 53.6, 'tn05_microscope', 'विज्ञान', 'SCIENCE'],
  'டு': [53.8, 55.55, 'tn06_sapling', 'तमिल विकास', 'DEVELOPING TAMIL'],
};
/** the frame-0 state: the word lit and labelled (also the last frames, for the loop) */
const wordOn = (t: number) => Math.max(t < 0.42 ? 1 : 1 - clamp01((t - 0.42) / 0.08), clamp01((t - 73.0) / 0.45));

// ------------------------------------------------------------------ building state
const bstate = (t: number): BState => {
  const s = {} as BState;
  LETTERS.forEach((L, i) => {
    let glow = 0, rise = 1;
    if (t < 0.5 || t >= 72.84) glow = Math.max(wordOn(t), t >= 72.84 ? 0.25 : 1);
    else if (t >= 2.1 && t < 7.84) glow = easeOut((t - IGN(i)) / 0.25);
    else if (t >= 9.88 && t < 20.5) glow = 0.55;
    else if (t >= 36.8 && t < 48) {
      rise = easeOut((t - RISE[L]) / 0.9);
      glow = Math.max(0.12 * rise, easeOut((t - 45.8) / 0.5));
    } else if (t >= 48 && t < 56) {
      const f = FAC[L];
      glow = f ? 0.35 + 0.65 * win(t, f[0] - 0.15, f[1], 0.25, 0.25) : 0.35;
    } else if (t >= 56 && t < 69.9) glow = L === 'ழ்' ? 1 : 0.3;
    s[L] = { rise, glow };
  });
  return s;
};

// ------------------------------------------------------------------ small pieces
/** our own map pin (no app branding): a teardrop that drops in and pulses */
const MapPin: React.FC<{ x: number; y: number; t: number; t0: number; o?: number }> = ({ x, y, t, t0, o = 1 }) => {
  if (t < t0 || o <= 0) return null;
  const p = back((t - t0) / 0.35);
  const ring = ((t - t0) % 1.0) / 1.0;
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: o }}>
      <div style={{ position: 'absolute', left: -70 * ring, top: -26 * ring, width: 140 * ring, height: 52 * ring, borderRadius: '50%', border: `3px solid ${C.red}`, opacity: 1 - ring }} />
      <svg width={84} height={112} style={{ position: 'absolute', left: -42, top: -112 + (1 - p) * -160, opacity: clamp01(p * 2) }}>
        <path d="M42 108 C30 80 6 62 6 38 A36 36 0 1 1 78 38 C78 62 54 80 42 108Z" fill={C.red} stroke="#fff" strokeWidth={5} />
        <circle cx={42} cy={38} r={13} fill="#fff" />
      </svg>
    </div>
  );
};

const Labels: React.FC<{ cam: ReturnType<typeof threeCam>; t: number; on: (i: number) => number; dy?: number; white?: boolean; reading?: boolean }> = ({ cam, t, on, white, reading = true }) => (
  <>
    {LETTERS.map((L, i) => {
      const o = on(i);
      if (o <= 0) return null;
      const [cx, cy] = GEO.letters[L].c;
      const k = 1 + 78 / Math.hypot(cx, cy);
      const [x, y, z] = projC(cam, cx * k, cy * k, 0);
      if (z > 1) return null;
      return (
        <div key={L} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * back(o)})`, opacity: clamp01(o * 1.5), textAlign: 'center', whiteSpace: 'nowrap' }}>
          <div style={{ fontFamily: TAMIL, fontWeight: 800, fontSize: 78, lineHeight: 1, color: white ? '#F4F6FF' : GOLD, textShadow: white ? '0 0 14px rgba(200,220,255,0.7)' : '0 0 26px rgba(255,194,58,0.75), 0 4px 14px rgba(0,0,0,0.9)' }}>{L}</div>
          {reading && <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 34, color: '#fff', marginTop: 2, textShadow: '0 3px 10px #000' }}>{READ[L]}</div>}
        </div>
      );
    })}
  </>
);

const Word: React.FC<{ o: number; y?: number; t: number }> = ({ o, y = 300 }) => {
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: o, transform: `scale(${0.9 + 0.1 * easeOut(o)})` }}>
      <div style={{ fontFamily: TAMIL, fontWeight: 800, fontSize: 132, lineHeight: 1.05, color: GOLD, textShadow: '0 0 40px rgba(255,194,58,0.7), 0 8px 24px rgba(0,0,0,0.9)' }}>தமிழ்நாடு</div>
      <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 64, color: '#fff', marginTop: 2, textShadow: '0 4px 14px #000' }}>तमिलनाडु</div>
    </div>
  );
};

/** the ring through the five letters (drawn on in screen space from the projected circle) */
const RingSvg: React.FC<{ cam: ReturnType<typeof threeCam>; o: number; draw: number }> = ({ cam, o, draw }) => {
  if (o <= 0) return null;
  const N = 96, r = 285;
  const pts = Array.from({ length: N + 1 }, (_, i) => { const a = Math.PI / 2 - (i / N) * Math.PI * 2 * draw; return projC(cam, Math.cos(a) * r, Math.sin(a) * r, 0); });
  const d = 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L');
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <path d={d} fill="none" stroke="#000" strokeOpacity={0.45} strokeWidth={9} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={4} />
    </svg>
  );
};

/** the flip-clock year (top left) */
const yearAt = (t: number): string | null => {
  if (t >= 14.94 && t < 20.4) return '1981';
  if (t >= 30.42 && t < 36.82) return '1987';
  if (t >= 36.82 && t < 38.5) return String(1987 + Math.min(2, Math.floor((t - 36.82) / 0.6)));
  if (t >= 38.5 && t < 43.66) return '1989';
  if (t >= 43.66 && t < 44.5) return String(Math.min(2016, 1989 + Math.floor(((t - 43.66) / 0.8) * 27)));
  if (t >= 44.5 && t < 46.45) return '2016';
  return null;
};
const Clock: React.FC<{ t: number }> = ({ t }) => {
  const y = yearAt(t);
  if (!y) return null;
  const prev = yearAt(t - 0.1) ?? y;
  const start = [14.94, 30.42, 36.82].find((s) => t >= s && t < s + 0.3);
  const p = start !== undefined ? back((t - start) / 0.3) : 1;
  return (
    <div style={{ position: 'absolute', left: 54, top: 150, display: 'flex', gap: 8, transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: '0 0', opacity: clamp01(p * 2) }}>
      {y.split('').map((d, i) => {
        const flip = prev[i] !== d ? 1 : 0;
        return (
          <div key={i} style={{ width: 92, height: 130, borderRadius: 12, background: 'linear-gradient(180deg,#22252b 0 49%,#111316 51% 100%)', boxShadow: '0 10px 24px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, textAlign: 'center', fontFamily: TITLE, fontSize: 112, lineHeight: '130px', color: '#F4F4F0', transform: `translateY(${flip * -18}px)`, opacity: 1 - flip * 0.4 }}>{d}</div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 64, height: 2, background: 'rgba(0,0,0,0.7)' }} />
          </div>
        );
      })}
    </div>
  );
};

/** passing through haze on the whips between the map and the campus */
const Clouds: React.FC<{ v: number; t: number }> = ({ v, t }) => {
  if (v < 0.01) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: v }}>
      {[0, 1, 2, 3].map((i) => {
        const s = 1.2 + i * 0.5 + ((t * 3 + i) % 1.5);
        return <div key={i} style={{ position: 'absolute', left: 540 - 700 * s + (i - 1.5) * 260, top: 960 - 520 * s + (i % 2 ? 180 : -200), width: 1400 * s, height: 1040 * s, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(235,238,242,0.95), rgba(220,225,232,0.55) 40%, rgba(210,215,222,0) 70%)', filter: 'blur(18px)' }} />;
      })}
    </AbsoluteFill>
  );
};

/** the map world: plates + hard-light fills (India saffron flash, Tamil Nadu) + India's official outline */
const sPath = (c: Cam, rings: number[][][]) => rings.map((r) => r.map(([x, y], i) => { const [sx, sy] = P(c, x, y); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join('') + 'Z').join('');
const MapWorld: React.FC<{ t: number }> = ({ t }) => {
  const c = mapCam(t);
  const india = Math.max(win(t, 0.78, 1.5, 0.25, 0.3), win(t, 70.2, 71.4, 0.25, 0.3));
  const tn = win(t, 8.2, 9.7, 0.35, 0.3);
  const [px, py] = PL(c, 'campus');
  const pinT0 = t < 3 ? 0.48 : t < 20 ? 7.9 : 72.2;
  return (
    <AbsoluteFill>
      <MapLayers c={c} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, mixBlendMode: 'hard-light' }}>
        {india > 0 && <path d={sPath(c, GEO.countries.India)} fill={C.saffron} opacity={india * 0.9} />}
        {tn > 0 && <path d={sPath(c, GEO.states['Tamil Nadu'])} fill={C.saffron} opacity={tn} />}
      </svg>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={sPath(c, GEO.countries.India)} fill="none" stroke="#fff" strokeOpacity={0.65} strokeWidth={2.4} strokeLinejoin="round" />
        {tn > 0 && <path d={sPath(c, GEO.states['Tamil Nadu'])} fill="none" stroke="#fff" strokeWidth={3.5} opacity={tn} strokeLinejoin="round" />}
      </svg>
      <MapPin x={px} y={py} t={t} t0={pinT0} />
      {tn > 0 && (
        <>
          <div style={{ position: 'absolute', left: px + 40, top: py - 150, opacity: tn, fontFamily: UI, fontWeight: 800, fontSize: 64, color: '#fff', textShadow: '0 4px 14px #000', whiteSpace: 'nowrap' }}>तंजावुर</div>
          <Prop t={t} t0={8.3} t1={9.7} k="tn02_thanjavur_doll" x={px - 170} y={py - 260 + 0 * Math.sin(t)} w={240} col={C.saffron} rot={6 * Math.exp(-(t - 8.3) * 2.5) * Math.sin((t - 8.3) * 12)} />
        </>
      )}
      {india > 0 && <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', opacity: india, fontFamily: UI, fontWeight: 800, fontSize: 96, color: '#fff', textShadow: '0 6px 18px #000' }}>भारत</div>}
    </AbsoluteFill>
  );
};

/** the blueprint: the plan on paper (20.4–36.8 s) */
const Blueprint: React.FC<{ t: number; cam: ReturnType<typeof threeCam> }> = ({ t, cam }) => {
  if (t < 20.3 || t > 37.6) return null;
  const inn = easeOut((t - 20.35) / 0.45), out = easeIn((t - 36.8) / 0.7);
  const w = 1080 * 1.22, h = w / asp('tn03_blueprint_sheet');
  return (
    <AbsoluteFill style={{ transform: `translateY(${(1 - inn) * -1950 - out * 2100}px) rotate(${(1 - inn) * -4 + out * 6}deg)`, opacity: clamp01(inn * 3) }}>
      <Img src={IMG('tn03_blueprint_sheet')} style={{ position: 'absolute', left: (1080 - w) / 2, top: (1920 - h) / 2, width: w, height: h, filter: 'brightness(0.9) saturate(1.1)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {LETTERS.map((L, i) => {
          const p = clamp01((t - (22.14 + i * 0.55)) / 0.55);
          if (p <= 0) return null;
          return GEO.letters[L].parts.map((ring, j) => {
            const d = 'M' + ring.map(([x, y]) => projC(cam, x, y, 0)).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';
            return <path key={`${L}${j}`} d={d} fill="none" stroke="#EAF2FF" strokeWidth={3} strokeDasharray="10 7" pathLength={1} style={{ strokeDasharray: `${p} 1` }} opacity={0.95} />;
          });
        })}
        {(() => {
          const p = clamp01((t - 28.45) / 0.8);
          if (p <= 0) return null;
          const N = 64, r = 40;
          const pts = Array.from({ length: Math.max(2, Math.round(N * p)) + 1 }, (_, i) => { const a = (i / N) * Math.PI * 2; return projC(cam, Math.cos(a) * r, Math.sin(a) * r, 0); });
          return <path d={'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')} fill="none" stroke="#EAF2FF" strokeWidth={3.5} />;
        })()}
      </svg>
      <Labels cam={cam} t={t} white reading={false} on={(i) => clamp01((t - (23.16 + i * 0.42)) / 0.3)} />
      {t > 28.6 && (() => { const [x, y] = projC(cam, 0, 0, 0); return <div style={{ position: 'absolute', left: x, top: y + 54, transform: 'translateX(-50%)', opacity: clamp01((t - 28.6) / 0.3), fontFamily: UI, fontWeight: 800, fontSize: 40, color: '#EAF2FF' }}>Library</div>; })()}
      {t > 26.75 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: clamp01((t - 26.75) / 0.35) }}>
          <div style={{ fontFamily: TAMIL, fontWeight: 700, fontSize: 112, color: '#EAF2FF', textShadow: '0 0 18px rgba(200,220,255,0.6)', clipPath: `inset(0 ${100 - clamp01((t - 26.75) / 0.6) * 100}% 0 0)` }}>தமிழ்நாடு</div>
        </div>
      )}
      {/* MGR's photo on the plan, fading when he is gone */}
      {t > 29.75 && (
        <div style={{ position: 'absolute', left: 700, top: 1220, width: 300, padding: 10, background: '#f4f1e8', transform: `rotate(5deg) scale(${0.7 + 0.3 * back((t - 29.75) / 0.35)})`, boxShadow: '0 14px 30px rgba(0,0,0,0.6)', opacity: clamp01((t - 29.75) / 0.25) * (1 - clamp01((t - 32.4) / 0.6)) }}>
          <Img src={IMG('tn01_mgr')} style={{ width: 280, height: 280 / asp('tn01_mgr'), display: 'block', filter: `grayscale(${clamp01((t - 31.4) / 0.6)}) brightness(${1 - 0.35 * clamp01((t - 31.4) / 0.6)})` }} />
          <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 18, color: '#333', textAlign: 'center', marginTop: 6 }}>MGR · 1917–1987</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** the side-view mouth: the tongue curls back for ழ */
const Mouth: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 61.0, 65.75, 0.3, 0.3);
  if (o <= 0) return null;
  const c = inOut((t - 61.3) / 1.0);
  // tongue: from flat (c=0) to the tip curled up and back (c=1)
  const tip = [610 - 150 * c, 300 - 150 * c];
  const tongue = `M260,420 C360,${400 - 20 * c} 470,${380 - 60 * c} ${560 - 40 * c},${340 - 110 * c} S${tip[0] + 40},${tip[1] - 10} ${tip[0]},${tip[1]}`;
  return (
    <div style={{ position: 'absolute', left: 540 - 380, top: 1100, width: 760, height: 520, opacity: o }}>
      <svg width={760} height={520}>
        <path d="M120,230 C260,150 470,140 640,200 L700,250" fill="none" stroke="#9fb3c8" strokeWidth={10} strokeLinecap="round" />
        <path d="M640,200 L650,250 M610,190 L618,240" stroke="#f4f4f0" strokeWidth={14} strokeLinecap="round" />
        <path d={tongue} fill="none" stroke="#FF6B7A" strokeWidth={34} strokeLinecap="round" />
        <path d="M120,470 C300,500 520,480 700,420" fill="none" stroke="#9fb3c8" strokeWidth={10} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: -64, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 46, color: '#fff' }}>जीभ पीछे मुड़ती है</div>
    </div>
  );
};

const Struck: React.FC<{ t: number; t0: number; slash: number; ch: string; x: number }> = ({ t, t0, slash, ch, x }) => {
  const o = win(t, t0, 65.75, 0.2, 0.3);
  if (o <= 0) return null;
  const s = easeOut((t - slash) / 0.2);
  return (
    <div style={{ position: 'absolute', left: x, top: 560, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * back((t - t0) / 0.3)})`, opacity: o }}>
      <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 150, color: '#fff', textShadow: '0 6px 18px #000', opacity: 1 - 0.4 * s }}>{ch}</div>
      {s > 0 && <div style={{ position: 'absolute', left: -20, top: 100, width: 190 * s, height: 14, borderRadius: 7, background: '#FF2B2B', transform: 'rotate(-35deg)', transformOrigin: '0 50%', boxShadow: '0 0 16px #FF2B2B' }} />}
    </div>
  );
};

/** word-highlight captions */
const Captions: React.FC<{ t: number; y: number }> = ({ t, y }) => {
  const W = TM.words;
  const ci = TM.caps.findIndex((c, i) => { const s = W[c[0]][0], nx = TM.caps[i + 1]; const e = nx ? W[nx[0]][0] : W[c[c.length - 1]][1] + 0.4; return t >= s - 0.05 && t < e; });
  if (ci < 0) return null;
  const cap = TM.caps[ci];
  const p = easeOut((t - W[cap[0]][0] + 0.05) / 0.12);
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center', transform: `translateY(-50%) scale(${0.92 + 0.08 * p})`, opacity: p }}>
      {cap.map((k) => {
        const [s, e, w] = W[k];
        const on = t >= s - 0.03 && t < e + 0.08;
        return (
          <span key={k} style={{ display: 'inline-block', margin: '0 12px', fontFamily: UI, fontWeight: 800, fontSize: 76, lineHeight: 1.2, color: on ? C.yellow : '#fff', transform: `scale(${on ? 1.08 : 1})`,
            WebkitTextStroke: '3px rgba(0,0,0,0.9)', paintOrder: 'stroke', textShadow: '0 6px 18px rgba(0,0,0,0.85)' }}>{w.replace(/[.,]$/, '')}</span>
        );
      })}
    </div>
  );
};

const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (s2maps.eu), CC BY 4.0 · © OpenStreetMap contributors · Natural Earth · AI illustrations';

export const TamilNadu: React.FC<{ captions?: boolean; audio?: string; thumb?: boolean }> = ({ captions = true, audio = '', thumb = false }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const m = mode(t);
  const cc = campusCam(t);
  const cam = threeCam(cc);
  const b = bstate(t);
  // motion blur from the camera speed
  const c0 = campusCam(t - 0.5 / fps), c1 = campusCam(t + 0.5 / fps);
  const mpp = mppC(cc);
  const pan = Math.hypot(c1.x - c0.x, c1.y - c0.y) / mpp + Math.abs(Math.log(c1.d / c0.d)) * 900 + Math.abs(c1.head - c0.head) * 14 + Math.abs(c1.tilt - c0.tilt) * 14;
  const m0 = mapCam(t - 0.5 / fps), m1 = mapCam(t + 0.5 / fps);
  const mpan = Math.hypot(m1.x - m0.x, m1.y - m0.y) / m1.mpp + Math.abs(Math.log(m1.mpp / m0.mpp)) * 900;
  const blur = Math.min(14, Math.max(0, ((m === 'map' ? mpan : pan) - 2) * 0.18)) + cloud(t) * 10;
  const split = t >= 31.9 && t < 36.75 ? easeOut((t - 31.9) / 0.35) * (1 - clamp01((t - 36.45) / 0.3)) : 0;
  const dark = Math.max(win(t, 5.18, 7.84, 0.3, 0.3) * 0.25, win(t, 56.0, 69.65, 0.6, 0.35) * 0.9);
  const ringO = Math.max(wordOn(t), win(t, 6.85, 7.84, 0.15, 0.2), win(t, 46.6, 48.0, 0.2, 0.3));
  const ringDraw = t > 6.8 && t < 7.84 ? easeOut((t - 6.85) / 0.45) : t > 46.5 && t < 48.2 ? easeOut((t - 46.6) / 0.5) : 1;
  const wordO = Math.max(wordOn(t), win(t, 7.0, 7.84, 0.2, 0.15), win(t, 46.9, 48.0, 0.25, 0.3));
  const capY = split > 0.5 ? 880 : t > 55.7 && t < 69.8 ? 1700 : 1600;
  const center = projC(cam, 0, 0, 0);
  const L0 = (L: L, k = 0) => { const [x, y] = GEO.letters[L].c; return projC(cam, x, y, k); };

  return (
    <AbsoluteFill style={{ background: '#0b0d10', overflow: 'hidden' }}>
      {audio && <Audio src={staticFile(audio)} />}
      <AbsoluteFill style={{ transform: `translateY(${-430 * split}px)` }}>
        <AbsoluteFill style={{ filter: blur > 0.4 ? `blur(${blur.toFixed(2)}px)` : undefined }}>
          {m === 'campus' ? <Campus c={cc} b={b} dark={dark} width={width} height={height} ring={Math.max(wordOn(t), win(t, 6.9, 7.84, 0.2, 0.2), win(t, 46.7, 48, 0.3, 0.3), win(t, 9.9, 20.4, 0.3, 0.3) * 0.6)} />
            : <MapWorld t={t} />}
        </AbsoluteFill>

        {m === 'campus' && (
          <>
            <RingSvg cam={cam} o={ringO} draw={ringDraw} />
            {/* letters + readings: frame 0 / the hook / the reveal at 2016 / the end */}
            <Labels cam={cam} t={t} on={(i) => Math.max(wordOn(t), t >= 2.1 && t < 7.84 ? clamp01((t - IGN(i)) / 0.2) : 0, win(t, 45.9 + i * 0.12, 48.0, 0.25, 0.3), win(t, 9.95, 15.2, 0.3, 0.3) * 0.85)} />
            {/* the viewfinder on "ऊपर से देखो" */}
            {t > 2.38 && t < 4.0 && (() => {
              const o = win(t, 2.38, 3.9, 0.12, 0.2), s = 1 + 0.12 * (1 - easeOut((t - 2.38) / 0.25));
              const r = Math.abs(projC(cam, 330, 0, 0)[0] - center[0]) * s;
              const k = 70;
              return (
                <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
                  {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
                    <path key={i} d={`M${center[0] + sx * r},${center[1] + sy * r - sy * k}L${center[0] + sx * r},${center[1] + sy * r}L${center[0] + sx * r - sx * k},${center[1] + sy * r}`} fill="none" stroke="#fff" strokeWidth={6} />
                  ))}
                  <text x={center[0]} y={center[1] + r + 60} textAnchor="middle" fontFamily="BRMont, Montserrat" fontWeight={700} fontSize={30} fill="#fff" letterSpacing={3}>10.74° N · 79.09° E</text>
                </svg>
              );
            })()}
            {/* "पाँच Buildings ... नहीं": count, then one red slash each */}
            {t > 3.88 && t < 5.4 && LETTERS.map((L, i) => {
              const t0 = 3.92 + i * 0.15;
              if (t < t0) return null;
              const [x, y] = L0(L);
              const s = easeOut((t - 4.68 - i * 0.03) / 0.15);
              const o = 1 - clamp01((t - 5.15) / 0.2);
              return (
                <div key={L} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.5 + 0.5 * back((t - t0) / 0.25)})`, opacity: o }}>
                  <div style={{ width: 96, height: 96, borderRadius: 48, background: 'rgba(8,9,12,0.8)', border: '4px solid #fff', fontFamily: TITLE, fontSize: 62, color: '#fff', textAlign: 'center', lineHeight: '88px' }}>{i + 1}</div>
                  {s > 0 && <div style={{ position: 'absolute', left: -14, top: 42, width: 124 * s, height: 12, borderRadius: 6, background: '#FF2B2B', transform: 'rotate(-30deg)', transformOrigin: '0 50%', boxShadow: '0 0 14px #FF2B2B' }} />}
                </div>
              );
            })}
            {/* frame 0 / the end: our own map pin on the campus */}
            {(t < 0.5 || t >= 73.0) && <MapPin x={center[0]} y={center[1]} t={t < 0.5 ? t + 1 : t} t0={t < 0.5 ? 0 : 73.0} o={wordOn(t)} />}
            {/* the place and its size */}
            <Pill t={t} t0={10.0} t1={11.05} hi="तमिल यूनिवर्सिटी, तंजावुर" en="TAMIL UNIVERSITY · THANJAVUR" col={GOLD} y={560} />
            <Pill t={t} t0={11.15} t1={14.8} hi="≈ 900 एकड़" en="CAMPUS" col={GOLD} y={560} />
            {t > 11.15 && t < 14.9 && (() => {
              const px = 1000 / mppC(cc);
              const o = win(t, 11.15, 14.8, 0.3, 0.2);
              return (
                <div style={{ position: 'absolute', left: 60, top: 1420, opacity: o }}>
                  <div style={{ width: px, height: 10, background: '#fff', borderRadius: 3, boxShadow: '0 2px 8px #000' }} />
                  <div style={{ fontFamily: TITLE, fontSize: 40, color: '#fff', marginTop: 6, textShadow: '0 3px 10px #000' }}>1 km</div>
                </div>
              );
            })()}
            {t > 13.1 && t < 14.9 && (
              <div style={{ position: 'absolute', left: 540, top: 820, transform: `translate(-50%,-50%) rotate(-8deg) scale(${1 + 0.6 * (1 - easeOut((t - 13.12) / 0.18))})`, opacity: clamp01((t - 13.12) / 0.08) * (1 - clamp01((t - 14.6) / 0.25)) }}>
                <div style={{ padding: '14px 34px', border: '7px solid #E8202A', borderRadius: 16, color: '#E8202A', fontFamily: UI, fontWeight: 800, fontSize: 64, lineHeight: 1.1, textAlign: 'center', background: 'rgba(10,10,12,0.55)', boxShadow: '0 0 30px rgba(232,32,42,0.45)' }}>
                  सबसे बड़ा campus<div style={{ fontFamily: LABEL, fontSize: 22, letterSpacing: 3 }}>LARGEST IN TAMIL NADU</div>
                </div>
              </div>
            )}
            {/* MGR rises out of the campus */}
            <Person t={t} t0={17.0} t1={20.25} k="tn01_mgr" x={540} bottom={center[1] + 120} h={560} hi="एम. जी. रामचंद्रन (MGR)" en="M. G. RAMACHANDRAN · CHIEF MINISTER" bar={GOLD} />
            <Pill t={t} t0={15.0} t1={20.25} hi="1981" en="TAMIL UNIVERSITY FOUNDED" col={GOLD} y={560} />
            {/* the rise: crane, dust, years */}
            <Prop t={t} t0={38.4} t1={40.5} k="tn07_tower_crane" x={L0('ழ்', 0)[0] + 230} y={L0('ழ்', 0)[1] - 260} w={330} col={GOLD} />
            {LETTERS.map((L) => {
              const t0 = RISE[L];
              const o = win(t, t0, t0 + 1.2, 0.15, 0.6);
              if (o <= 0) return null;
              const [x, y] = L0(L);
              const s = easeOut((t - t0) / 1.2);
              return <div key={L} style={{ position: 'absolute', left: x - 160 * (0.6 + s), top: y - 70 * (0.6 + s), width: 320 * (0.6 + s), height: 140 * (0.6 + s), borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(210,190,160,0.55), rgba(210,190,160,0) 70%)', opacity: o * (1 - s * 0.6), filter: 'blur(6px)' }} />;
            })}
            <Pill t={t} t0={39.0} t1={40.55} hi="1989" en="ழ் · FIRST LETTER" col={GOLD} y={560} />
            <Pill t={t} t0={44.6} t1={45.75} hi="2016" en="த · நா · THE LAST TWO" col={GOLD} y={560} />
            <Pill t={t} t0={46.45} t1={47.8} hi="≈ 35 साल" en="1981 → 2016" col={GOLD} y={1300} />
            {/* the faculties */}
            {LETTERS.map((L) => {
              const f = FAC[L];
              if (!f || t < f[0] - 0.1 || t > f[1] + 0.3) return null;
              const [x, y] = L0(L, 10);
              return (
                <React.Fragment key={L}>
                  <Prop t={t} t0={f[0]} t1={f[1]} k={f[2]} x={Math.min(820, Math.max(260, x + 180))} y={y - 260} w={380} col={GOLD} />
                  <Pill t={t} t0={f[0] + 0.1} t1={f[1]} hi={f[3]} en={f[4]} col={GOLD} y={560} />
                </React.Fragment>
              );
            })}
          </>
        )}
        {m === 'campus' && <AbsoluteFill style={{ background: '#07080a', opacity: win(t, 56.1, 69.6, 0.6, 0.3) * 0.86, pointerEvents: 'none' }} />}
        <Clouds v={cloud(t)} t={t} />
      </AbsoluteFill>

      {/* the blueprint sits over everything in the top half while Null is on */}
      <AbsoluteFill style={{ transform: `translateY(${-430 * split}px)` }}>
        <Blueprint t={t} cam={cam} />
      </AbsoluteFill>
      <Clock t={t} />
      <Word o={wordO} t={t} />

      {/* ழ: the sound Hindi does not have (55.7–69.7 s) */}
      {t > 56.6 && t < 69.95 && (() => {
        const p = inOut((t - 56.75) / 0.6);
        const [lx, ly] = L0('ழ்');
        const x = lx + (540 - lx) * p, y = ly + (560 - ly) * p;
        const word = easeOut((t - 66.0) / 0.7);
        const out = clamp01((t - 69.6) / 0.3);
        return (
          <>
            <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${1 - 0.45 * word})`, fontFamily: TAMIL, fontWeight: 800, fontSize: 110 + 330 * p, color: GOLD, lineHeight: 1, opacity: (1 - word) * (1 - out), textShadow: '0 0 50px rgba(255,194,58,0.7)' }}>ழ்</div>
            {word > 0 && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: 560, transform: `translateY(-50%) scale(${0.85 + 0.15 * word})`, textAlign: 'center', opacity: word * (1 - out), fontFamily: TAMIL, fontWeight: 800, fontSize: 250, lineHeight: 1, whiteSpace: 'nowrap' }}>
                <span style={{ color: '#F4F4F0', textShadow: '0 8px 24px #000' }}>தமி</span><span style={{ color: GOLD, textShadow: '0 0 50px rgba(255,194,58,0.7)' }}>ழ்</span>
              </div>
            )}
            {t > 58.2 && t < 60.6 && <Pill t={t} t0={58.25} t1={60.4} hi="हिंदी में नहीं" en="NO SUCH SOUND IN HINDI" col={C.red} y={900} />}
            {t > 60.7 && t < 66.0 && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: win(t, 60.72, 65.8, 0.25, 0.3) }}>
                <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 104, color: '#fff' }}>= ऴ</span>
                <span style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 38, color: GOLD, marginLeft: 24 }}>"zha"</span>
              </div>
            )}
            <Mouth t={t} />
            <Struck t={t} t0={63.9} slash={64.3} ch="र" x={170} />
            <Struck t={t} t0={64.9} slash={65.45} ch="ल" x={910} />
            {t > 68.9 && <div style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', opacity: clamp01((t - 68.95) / 0.25) * (1 - out), fontFamily: UI, fontWeight: 800, fontSize: 104, color: '#fff', textShadow: '0 6px 18px #000' }}>तमिऴ</div>}
          </>
        );
      })()}

      {/* Null, split screen (bottom half) */}
      {split > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 960 + 960 * (1 - split), width: 1080, height: 960, overflow: 'hidden', borderTop: `6px solid ${GOLD}`, boxShadow: `0 -10px 40px ${GOLD}55` }}>
          <OffthreadVideo src={staticFile('tamilnadu/null/null_tn_A.mp4')} startFrom={Math.round(0.4 * fps)} muted style={{ position: 'absolute', left: 0, top: -300, width: 1080, height: 1920 }} />
        </div>
      )}

      {/* the old camera flash for MGR */}
      {t > 17.05 && t < 17.3 && <AbsoluteFill style={{ background: '#fff', opacity: 0.55 * (1 - (t - 17.05) / 0.25) }} />}
      {/* grade */}
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)' }} />
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.45) 100%)' }} />
      {captions && !thumb && <Captions t={t} y={capY} />}
      {thumb && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1530, textAlign: 'center' }}>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 150, lineHeight: 1.05, color: '#fff', WebkitTextStroke: '6px #000', paintOrder: 'stroke', textShadow: '0 0 40px rgba(255,194,58,0.8), 0 12px 30px rgba(0,0,0,0.9)' }}>
            ऊपर से <span style={{ color: GOLD }}>पढ़ो!</span>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 20, right: 20, top: 1892, textAlign: 'center', fontFamily: LABEL, fontSize: 15, letterSpacing: 0.5, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>{CREDIT}</div>
    </AbsoluteFill>
  );
};
