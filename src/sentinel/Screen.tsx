import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import { FONT, RED } from './Overlays';

const img = (f: string) => staticFile(`sentinel/img/${f}`);

/** Caption chunks: text from the creator's SRT, starts from the voiceover's word timings. */
const CAPS: [number, string][] = [
  [0.0, 'ये दुनिया का'], [1.04, 'सबसे खतरनाक टापू है।'],
  [3.12, 'यहाँ जाने की सोची,'], [4.48, 'तो जमीन पर'], [5.38, 'पैर रखने से पहले ही'], [6.62, 'मारे जा सकते हो।'],
  [7.86, 'खतरा जंगली जानवरों'], [9.38, 'या ज़हरीली हवा से नहीं,'],
  [11.34, 'बल्कि यहाँ रहने वाले'], [12.72, 'सेंटिनलीज़ लोगों से है।'],
  [14.68, 'यह हजारों सालों से'], [15.92, 'यहाँ रह रहे हैं'], [16.96, 'और बाहर वालों को'], [18.08, 'पास नहीं आने देते।'],
  [19.38, 'यह है'], [20.56, 'नॉर्थ सेंटिनल आइलैंड,'], [22.4, 'लगभग मैनहैटन'], [23.58, 'जितना बड़ा,'],
  [24.46, 'इंडियन ओशन में'], [25.68, 'और ऑफिशियली'], [26.62, 'भारत का हिस्सा।'],
  [27.88, 'पर शायद इन्होंने'], [29.0, 'कभी इंडिया का नाम'], [30.28, 'भी नहीं सुना,'],
  [31.12, 'जबकि पोर्ट ब्लेयर'], [32.24, 'सिर्फ 64 किलोमीटर'], [33.72, 'दूर है।'],
  [34.46, 'संपर्क की कई कोशिशें'], [36.44, 'जानलेवा साबित हुई।'],
  [37.74, '2004 की सुनामी'], [39.26, 'के बाद'], [39.8, 'कोस्ट गार्ड का'], [40.62, 'हेलिकॉप्टर पहुँचा,'], [41.64, 'तो उस पर भी'], [42.72, 'तीर तान दिया गया।'],
  [43.8, 'इसीलिए टापू के'], [45.4, 'चारों ओर'], [46.14, '9 किलोमीटर तक'], [47.32, 'जाना गैरकानूनी है।'],
  [48.92, 'चोरी छिपे'], [49.76, 'पहुँच भी गए,'], [50.66, 'तो किनारे पर'], [51.6, 'तीर और भाले'], [52.78, 'बरसने लगते हैं।'],
  [54.04, 'घने जंगल की वजह से'], [55.52, 'कोई नहीं जानता'], [56.74, 'कि यहाँ'], [57.3, 'कितने लोग रहते हैं।'],
  [58.76, 'और सबसे बड़ी बात,'], [60.06, 'इनके शरीर'], [61.06, 'हमारी आम बीमारियों से'], [62.6, 'लड़ना नहीं जानते।'],
  [63.68, 'हमसे एक मुलाकात भी'], [65.9, 'इनके लिए'], [66.68, 'जानलेवा हो सकती है।'],
];
const CAP_END = 68.4;

export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  if (i < 0 || t > CAP_END) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : CAP_END;
  const a = (i === 0 ? 1 : ramp(t, t0, t0 + 0.1, linear)) * (1 - ramp(t, t1 - 0.02, t1, linear));
  return (
    <div style={{
      position: 'absolute', left: 60, right: 60, top: 1500, textAlign: 'center',
      fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.25, color: '#fff', opacity: a,
      transform: `translateY(${(1 - ramp(t, t0, t0 + 0.14)) * 8}px)`,
      textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.45)',
    }}>{text}</div>
  );
};

// ---------------------------------------------------------------- illustrated inserts (replace the reference's footage)
type Shot = { f: string; t0: number; t1: number; tint: string; from: number; to: number; ox?: number };
const SHOTS: Shot[] = [
  { f: 'scene_beach_figures.png', t0: 14.68, t1: 16.96, tint: '#FF8A1E', from: 1.06, to: 1.2 },
  { f: 'scene_jungle_edge.png', t0: 16.96, t1: 18.08, tint: '#7B3CFF', from: 1.15, to: 1.05, ox: -30 },
  { f: 'scene_archer_aiming.png', t0: 18.08, t1: 19.38, tint: '#E0182D', from: 1.04, to: 1.18 },
  { f: 'scene_heli_beach.png', t0: 41.64, t1: 43.8, tint: '#FF7A1A', from: 1.05, to: 1.2 },
];
export const SHOT_CUTS = SHOTS.flatMap((s) => [s.t0]).concat([19.38, 43.8]);

/** 0..1: how much a full-screen insert covers the map (used to skip drawing the map). */
export const insertCover = (t: number) => Math.max(window4(t, 14.6, 14.72, 19.3, 19.45), window4(t, 41.56, 41.68, 43.72, 43.86));

const Insert: React.FC<{ t: number }> = ({ t }) => {
  const shot = SHOTS.find((s) => t >= s.t0 - 0.08 && t < s.t1 + 0.08);
  if (!shot) return null;
  const a = insertCover(t);
  const p = clamp01((t - shot.t0) / (shot.t1 - shot.t0));
  const s = lerp(shot.from, shot.to, p);
  const shakeX = Math.sin(t * 23) * 3 + Math.sin(t * 37) * 2;
  return (
    <AbsoluteFill style={{ opacity: a, background: '#000' }}>
      <AbsoluteFill style={{ transform: `translate(${(shot.ox ?? 0) * p + shakeX}px, 0) scale(${s})` }}>
        <Img src={img(shot.f)} style={{ width: 1080, height: 1920, objectFit: 'cover', filter: 'contrast(1.12) saturate(0.6) brightness(0.95)' }} />
      </AbsoluteFill>
      {/* colour wash like the reference's tinted film */}
      <AbsoluteFill style={{ background: shot.tint, mixBlendMode: 'color', opacity: 0.62 }} />
      <AbsoluteFill style={{ background: shot.tint, mixBlendMode: 'soft-light', opacity: 0.35 }} />
      {/* heavy soft vignette with blurred edges */}
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 220px 90px rgba(0,0,0,0.92)', backdropFilter: 'none' }} />
      <Grain t={t} />
    </AbsoluteFill>
  );
};

const Grain: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ opacity: 0.22, mixBlendMode: 'overlay' }}>
    <svg width={1080} height={1920}>
      <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(t * 24) % 97} /></filter>
      <rect width={1080} height={1920} filter="url(#gr)" />
    </svg>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- tsunami sweep + "2004" (37.7 – 39.8)
const Tsunami: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, 37.7, 37.85, 39.45, 39.8);
  if (a <= 0) return null;
  const p = ramp(t, 37.75, 39.6, linear);
  const x = lerp(700, -1700, p);
  const y = lerp(1150, 450, p);
  const yr = pop(t, 37.74, 10, 200);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 70% 60%, rgba(0,160,210,0.0), rgba(0,40,80,0.35))', opacity: a }} />
      <Img src={img('tsunami_wave.png')} style={{ position: 'absolute', width: 1500, left: x, top: y, opacity: a * 0.95, transform: 'rotate(-28deg) scaleX(-1)',
        filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.5))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', opacity: a }}>
        <div style={{ display: 'flex', gap: 18, transform: `scale(${yr}) rotate(-5deg)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 120, color: '#fff', background: '#0b0b0d', padding: '0 26px 8px', lineHeight: 1.15 }}>2004</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 120, color: '#fff', background: RED, padding: '0 26px 8px', lineHeight: 1.15,
            transform: `scale(${pop(t, 38.86, 10, 220)})` }}>सुनामी</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- flashes, vignette, light leaks
export const ScreenFX: React.FC<{ t: number }> = ({ t }) => {
  const cuts = [14.68, 16.96, 18.08, 19.38, 41.64, 43.8];
  let flash = 0;
  for (const c of cuts) flash = Math.max(flash, window4(t, c - 0.06, c, c + 0.04, c + 0.22));
  const leak = Math.max(...cuts.map((c) => window4(t, c - 0.1, c, c + 0.15, c + 0.45)));
  return (
    <>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)' }} />
      {leak > 0 && <Img src={img('overlay_lightleak.png')} style={{ position: 'absolute', width: 1080, height: 1920, objectFit: 'cover', mixBlendMode: 'screen', opacity: leak * 0.8 }} />}
      {flash > 0 && <AbsoluteFill style={{ background: '#FFF4E6', opacity: flash * 0.9 }} />}
    </>
  );
};

export const shake = (t: number): [number, number] => {
  const hits: [number, number][] = [[6.62, 7], [10.62, 4], [36.44, 7], [37.8, 6], [42.72, 6], [51.6, 5], [52.78, 4], [66.68, 4]];
  let x = 0;
  let y = 0;
  for (const [t0, a] of hits) {
    x += kick(t, t0, a, 38, 9);
    y += kick(t, t0, a * 0.8, 31, 9);
  }
  // tsunami rumble
  const rumble = window4(t, 37.8, 38.0, 39.2, 39.6);
  x += Math.sin(t * 61) * 4 * rumble;
  y += Math.sin(t * 47) * 3 * rumble;
  return [x, y];
};

export const ScreenLayer: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Tsunami t={t} />
    <Insert t={t} />
  </>
);

export { easeIn, easeOut };
