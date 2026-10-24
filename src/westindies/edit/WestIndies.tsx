import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { inOut, ramp } from './anim';
import { Watermark } from '../../brand/Watermark';
import { useMontserrat } from '../../darien/Brand';
import { useTZFonts } from '../../timezones/fonts';
import { C, DURATION_S, PLANE, camAt, camMotion, shake } from './cam';
import { Dim, Flashes, Grade, MAP_GRADE, MapFx, Subtitles, regionsAt } from './Fx';
import { useFonts } from '../motion/font';
import { MapCanvas } from './Map';
import { Shapes } from './Shapes';

export const WI_DURATION_60 = Math.ceil(DURATION_S * 60);
/** The mixed track (VO, music, SFX), built to loop. */
const AUDIO = 'westindies/audio/mix.wav';

/** Null's moments (split screen, never at the start, none at the loop's end). `from` = the clip time at t0. Clip B:
 *  the finger on "सबसे अजीब बात", the shrug on "island है ही नहीं", the desk tap on "South America की ज़मीन". */
export const NULL_WIN = () => [
  { name: 'B', t0: C.ajeeb6 - 0.55, t1: C.naam7 - 1.9, from: 0.3 },
];
/** Null's Omni clip: only the band from source y 560 to 1520 is shown (the mask and hands), above the Gemini sparkle. */
const BAND_TOP = 560;
const splitAt = (t: number) => {
  for (const w of NULL_WIN()) {
    const q = Math.min(ramp(t, w.t0 - 0.2, w.t0 + 0.2, inOut), 1 - ramp(t, w.t1 - 0.2, w.t1 + 0.2, inOut));
    if (q > 0) return { q, w };
  }
  return null;
};
const NullPanel: React.FC<{ t: number; q: number; name: string; t0: number; t1: number; from: number; fps: number }> = ({ t, q, name, t0, t1, from, fps }) => {
  const push = 1 + 0.05 * ramp(t, t0, t1, inOut);
  return (
    <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d' }}>
      <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 260}px`, transform: `scale(${push})` }}>
        <Sequence from={Math.round((t0 - 0.2) * fps)} durationInFrames={Math.round((t1 - t0 + 0.6) * fps)} layout="none">
          <OffthreadVideo src={staticFile(`westindies/null/null_wi_${name}1.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #3a0f1f, #C2416B, #fff, #C2416B, #3a0f1f)', boxShadow: '0 0 24px #C2416B' }} />
    </div>
  );
};

/** NullDynasty: why you can't find the West Indies on a map. 1080×1920 at 60 fps; rendered at --scale=2 for 4K. The dark
 *  Midnight map; the last frame runs straight into frame 0 (a seamless loop). */
export const WestIndies: React.FC<{ captions?: boolean; res?: number; audio?: string }> = ({ captions = true, res = 1, audio = AUDIO }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  useTZFonts();
  useMontserrat();
  useFonts();
  const cam = camAt(t);
  const mv = camMotion(t);
  const blurK = (30 / fps) ** 0.5;
  const bx = Math.min(16, Math.abs(mv.vx) * 0.22 + mv.zoom * 1.4) * blurK;
  const by = Math.min(16, Math.abs(mv.vy) * 0.22 + mv.zoom * 1.4) * blurK;
  const [sx, sy] = shake(t);
  const sp = splitAt(t);
  const q = sp ? sp.q : 0;
  return (
    <AbsoluteFill style={{ background: '#030b12', overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="wiblur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" /></filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px) scale(1.03)` }}>
        <AbsoluteFill style={{ filter: (Math.max(bx, by) > 0.6 ? 'url(#wiblur) ' : '') + MAP_GRADE }}>
          <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h, transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
            <MapCanvas cam={cam} res={res} />
            <Shapes c={cam} t={t} regions={regionsAt(t)} />
          </div>
        </AbsoluteFill>
        <Dim t={t} />
        <MapFx t={t} c={cam} />
        <Flashes t={t} />
        <Grade t={t} />
      </AbsoluteFill>
      {sp && <NullPanel t={t} q={sp.q} name={sp.w.name} t0={sp.w.t0} t1={sp.w.t1} from={sp.w.from} fps={fps} />}
      <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, left: 22, fontFamily: "'Montserrat', sans-serif", fontSize: 14, color: '#fff', opacity: 0.5, textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles (SRTM/NASA, ETOPO1/NOAA) · borders: Natural Earth · props drawn in code
      </div>
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1640} />}
      {/* the watermark's spots cycle on a clock squeezed to land between spots at both ends of the loop */}
      {captions && <Watermark t={10 + (t * 90) / DURATION_S} />}
      {captions && audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
