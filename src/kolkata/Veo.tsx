import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useVideoConfig } from 'remotion';
import { clamp01, easeOut, inOut, lerp, pop, ramp, window4 } from './anim';
import { C } from './cam';
import { COL } from './Plane';
import { BookText, Big, Chip } from './Screen';
import { NUM } from './fonts';
import bell from '../../public/kolkata/veo/proc/v03_temple_bell.json';
import seal from '../../public/kolkata/veo/proc/v06_seal_stamp.json';
import book from '../../public/kolkata/veo/proc/v11_old_book.json';
import gavel from '../../public/kolkata/veo/proc/v12_gavel.json';
import ship from '../../public/kolkata/veo/proc/v00_ship_raw.json';

/** The creator's Veo clips (AI video, see public/kolkata/veo_prompts.md), cut in like an editor would:
 *  full-screen cutaways on the story's big images, keyed props that replace their still versions on the map, and
 *  smoke/mist/dust on black blended over the frame. Prepared by tools/process_kolkata_veo.py. */

type Meta = { w: number; h: number; frames: number; fps: number };
const META: Record<string, Meta> = { v03_temple_bell: bell, v06_seal_stamp: seal, v11_old_book: book, v12_gavel: gavel, v00_ship_raw: ship };
const P = (f: string) => staticFile(`kolkata/veo/${f}`);

/** One clip on the timeline: plays from `from` seconds into the clip at comp time t0 (frame-exact via Sequence). */
const Clip: React.FC<{ t0: number; t1: number; from?: number; children: (fromFrames: number) => React.ReactNode }> = ({ t0, t1, from = 0, children }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.round(t0 * fps)} durationInFrames={Math.max(1, Math.round((t1 - t0) * fps))} layout="none">
      {children(Math.round(from * fps))}
    </Sequence>
  );
};

/** A keyed prop (WebM with alpha), centred at x,y and `h` pixels tall, with a pop-in, a soft contact shadow and a hold on its
 *  last frame once the clip runs out. */
const Keyed: React.FC<{
  t: number; name: string; t0: number; t1: number; from?: number; x: number; y: number; h: number; flip?: boolean;
  entry?: 'pop' | 'drop' | 'slideL' | 'slideR' | 'fade'; shadow?: number; rot?: number; rate?: number; inset?: string;
}> = ({ t, name, t0, t1, from = 0, x, y, h, flip, entry = 'pop', shadow = 0.5, rot = 0, rate = 1, inset }) => {
  if (t < t0 - 0.05 || t > t1 + 0.05) return null;
  const m = META[name];
  const w = (h * m.w) / m.h;
  const a = window4(t, t0, t0 + 0.12, t1 - 0.2, t1);
  const p = clamp01(pop(t, t0, 8, 240));
  const e = ramp(t, t0, t0 + 0.35, easeOut);
  const out = ramp(t, t1 - 0.2, t1, inOut);
  const dx = entry === 'slideL' ? lerp(-700, 0, e) : entry === 'slideR' ? lerp(700, 0, e) : 0;
  const dy = entry === 'drop' ? lerp(-900, 0, e) : 0;
  const s = (entry === 'pop' ? p : 1) * (1 - 0.06 * out);
  const clipEnd = t0 + (m.frames / m.fps - from) / rate;
  return (
    <div style={{ position: 'absolute', left: x - w / 2 + dx, top: y - h / 2 + dy, width: w, height: h, opacity: a, transform: `scale(${s}) rotate(${rot}deg)` }}>
      {shadow > 0 && <div style={{ position: 'absolute', left: '12%', right: '12%', bottom: -h * 0.02, height: h * 0.1, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', filter: 'blur(18px)', opacity: shadow }} />}
      <div style={{ position: 'absolute', inset: 0, transform: flip ? 'scaleX(-1)' : undefined, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.45))', clipPath: inset ? `inset(${inset})` : undefined }}>
        {t < clipEnd - 0.02 ? (
          <Clip t0={t0 - 0.05} t1={Math.min(t1, clipEnd) + 0.05} from={Math.max(0, from - 0.05)}>
            {(f) => <OffthreadVideo src={P(`proc/${name}.webm`)} transparent muted startFrom={f} playbackRate={rate} style={{ width: w, height: h }} />}
          </Clip>
        ) : (
          <Img src={P(`proc/${name}_last.png`)} style={{ width: w, height: h }} />
        )}
      </div>
    </div>
  );
};

/** An effect shot on pure black, screen-blended (the black disappears). x,y: where the clip's centre sits; w: its width. */
const Fx: React.FC<{ t: number; name: string; t0: number; t1: number; from?: number; x: number; y: number; w: number; a?: number; flip?: boolean; mask?: string; rot?: number }> = ({
  t, name, t0, t1, from = 0, x, y, w, a = 1, flip, mask, rot = 0,
}) => {
  if (t < t0 - 0.05 || t > t1 + 0.05) return null;
  const h = (w * 9) / 16;
  const o = a * window4(t, t0, t0 + 0.2, t1 - 0.5, t1);
  // Veo's "black" is a very dark grey: crush it to true black (contrast) and feather all four edges, so no rectangle shows
  const fv = 'linear-gradient(180deg, transparent 0%, #000 22%, #000 78%, transparent 100%)';
  const fh = 'linear-gradient(90deg, transparent 0%, #000 16%, #000 84%, transparent 100%)';
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: o, mixBlendMode: 'screen', transform: `${flip ? 'scaleX(-1) ' : ''}rotate(${rot}deg)`,
      WebkitMaskImage: fv, maskImage: fv }}>
      <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: fh, maskImage: fh }}>
        <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask, filter: 'contrast(1.3) brightness(0.95)' }}>
          <Clip t0={t0 - 0.05} t1={t1 + 0.05} from={from}>
            {(f) => <OffthreadVideo src={P(`${name}.mp4`)} muted startFrom={f} style={{ width: w, height: h }} />}
          </Clip>
        </div>
      </div>
    </div>
  );
};

/** A full-screen cutaway: cut in on a fast zoom-blur with a flash, a slow push while it plays, a filmic vignette and grain
 *  to sit with the map's grade; it cuts out hard on the next beat (the map punches back in). */
const Full: React.FC<{ t: number; name: string; t0: number; t1: number; children?: React.ReactNode; warm?: number }> = ({ t, name, t0, t1, children, warm = 0.12 }) => {
  if (t < t0 - 0.02 || t >= t1) return null;
  const k = ramp(t, t0, t0 + 0.22, easeOut);
  const push = lerp(1.14, 1, k) * (1 + 0.06 * ramp(t, t0, t1, inOut));
  const blur = (1 - k) * 12;
  const flash = Math.max(0, 1 - (t - t0) / 0.12);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, filter: `blur(${blur.toFixed(2)}px) saturate(1.08) contrast(1.06)` }}>
        <Clip t0={t0 - 0.02} t1={t1}>
          {(f) => <OffthreadVideo src={P(`proc/${name}.mp4`)} muted startFrom={f} style={{ width: 1080, height: 1920 }} />}
        </Clip>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(255,170,80,${warm})`, mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: '#fff', opacity: flash * 0.55 }} />
      {children}
    </AbsoluteFill>
  );
};

// ---- the timeline (seconds, from the VO's word cues)
export const FULL_WIN = {
  city: [0, C.kolkata1 - 0.76] as const, // "दुनिया इसे City of Joy कहती है…" → cut at "पर हमारा"
  market: [C.soot2 - 0.08, C.aaj2] as const, // "जहाँ सूत के गट्ठर बिकते थे।"
  leaving: [C.fort6 + 1.32, C.khali6 + 0.31] as const, // "अंग्रेज़ों ने पूरा Gobindapur ही खाली…" → slam into the gates
  palaces: [C.shehar7 + 1.08, C.raj7] as const, // "और वही शहर British India की" → cut on "राजधानी"
};
const FIRE = C.yahin7 + 0.15;

/** Keyed props and effects: drawn above the map and the still props, under the full-screen cutaways. */
export const VeoOverlays: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    {/* Kalikata: incense rising beside the temple, the brass bell dropping in on its chain and swinging */}
    <Fx t={t} name="v04_incense_smoke" t0={C.kalikata4 + 0.3} t1={C.hooghly5 - 0.1} from={0.8} x={300} y={760} w={1300} a={0.85}
      mask="linear-gradient(90deg, transparent 0%, transparent 22%, #000 40%)" />
    <Keyed t={t} name="v03_temple_bell" t0={C.kalikata4 + 0.25} t1={C.hooghly5 - 0.15} x={700} y={560} h={560} entry="drop" shadow={0} inset="0 0 0 30%" />
    {/* the Hooghly: the Company ship sails up the river through low morning mist */}
    <Fx t={t} name="v05_river_mist" t0={C.hooghly5 + 0.1} t1={C.y1698 - 0.1} from={1.0} x={540} y={1380} w={2000} a={0.6} />
    <Keyed t={t} name="v00_ship_raw" t0={C.hooghly5 + 0.1} t1={C.y1698 - 0.2} x={lerp(380, 680, ramp(t, C.hooghly5, C.y1698))} y={1120 + Math.sin(t * 2.2) * 8} h={720}
      entry="slideL" shadow={0} rot={Math.sin(t * 1.8) * 1.5} />
    {/* 1698: the Company's seal is pressed into the wax and lifted off */}
    <Keyed t={t} name="v06_seal_stamp" t0={C.haq5 - 0.45} t1={C.fort6 - 0.15} from={2.6} x={540} y={1180} h={560} entry="fade" shadow={0.4} />
    {/* dust rolls over the emptied village into the gates */}
    <Fx t={t} name="v08_dust_drift" t0={C.khali6 - 0.1} t1={C.yahin7 + 0.2} from={0.6} x={600} y={1350} w={2200} a={0.9} />
    {/* the cannon's blast smoke billows across the frame */}
    <Fx t={t} name="v09_cannon_smoke" t0={FIRE - 0.05} t1={FIRE + 2.0} from={0.15} x={-40} y={1130} w={1150} a={0.95} flip />
    {/* the history book flies open; the High Court's gavel comes down */}
    <Keyed t={t} name="v11_old_book" t0={C.kitab8 - 0.05} t1={C.pehle8} from={1.0} rate={1.8} x={540} y={1110} h={520} entry="pop" />
    <BookText t={t} x={748} y={1169} delay={0.9} rot={-5} />
    <Keyed t={t} name="v12_gavel" t0={C.court8 + 0.3} t1={C.pehle8 + 0.2} from={0.48} x={840} y={1470} h={250} entry="slideR" inset="0 11% 0 0" />
  </AbsoluteFill>
);

/** Full-screen cutaways, with the titles that belong to those moments mirrored on top (same component and position as on
 *  the map, so they carry straight across the cut). */
export const VeoFull: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Full t={t} name="v01_city_today" t0={FULL_WIN.city[0]} t1={FULL_WIN.city[1]}>
      <Big t={t} t0={0.25} t1={C.teen1 - 0.05} text="CITY OF JOY" x={540} y={300} size={140} color={COL.gold} font={NUM} rot={-2} />
    </Full>
    <Full t={t} name="v02_sutanuti_market" t0={FULL_WIN.market[0]} t1={FULL_WIN.market[1]} />
    <Full t={t} name="v07_gobindapur_leaving" t0={FULL_WIN.leaving[0]} t1={FULL_WIN.leaving[1]} warm={0.18}>
      <Big t={t} t0={C.khali6} t1={C.yahin7} text="पूरा गाँव खाली!" x={540} y={320} size={112} color={COL.red} rot={-2} />
    </Full>
    <Full t={t} name="v10_city_of_palaces" t0={FULL_WIN.palaces[0]} t1={FULL_WIN.palaces[1]}>
      <Chip t={t} t0={C.british7 - 0.1} t1={C.kitab8 - 0.1} text="BRITISH INDIA की राजधानी" x={540} y={320} color={COL.gold} size={56} />
    </Full>
  </>
);
