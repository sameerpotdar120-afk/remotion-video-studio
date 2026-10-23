import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { inOut, ramp } from './anim';
import { Watermark } from '../../brand/Watermark';
import { useMontserrat } from '../../darien/Brand';
import { useTZFonts } from '../../timezones/fonts';
import { DURATION_S, NULL_WIN, PLANE, camAt, camMotion, sceneAt, shake } from './cam';
import { Clouds, Flashes, Grade, MAP_GRADE, MapFx, Stage, Subtitles, useFonts } from './Fx';
import { MapCanvas } from './Map';
import { LAND, regionsAt } from './regions';
import { Shapes } from './Shapes';

export const PC_DURATION_60 = Math.ceil(DURATION_S * 60);
/** The mixed track (VO, music, SFX), built to loop. */
const AUDIO = 'panama/audio/mix.wav';

/** Null's Omni clip: only the band from source y 360 to 1320 is shown, well above the Gemini sparkle on the desk. */
const BAND_TOP = 360;
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
          <OffthreadVideo src={staticFile(`panama/null/null_pc_${name}1.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #6a4a0b, #F2B233, #fff, #F2B233, #6a4a0b)', boxShadow: '0 0 24px #F2B233' }} />
    </div>
  );
};

const starts = (t: number) => {
  const out: Record<string, number> = {};
  for (const [k, ts] of Object.entries(LAND)) for (const s of ts) if (s <= t) out[k] = s;
  return out;
};

/** NullDynasty: the Panama Canal is running out of water. 1080×1920 at 60 fps; rendered at --scale=2 for 4K. The last
 *  frame runs straight into frame 0 (a seamless loop). */
export const PanamaCanal: React.FC<{ captions?: boolean; res?: number; audio?: string }> = ({ captions = true, res = 1, audio = AUDIO }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  useTZFonts();
  useMontserrat();
  useFonts();
  const scene = sceneAt(t);
  const cam = camAt(t);
  const mv = camMotion(t);
  const blurK = (30 / fps) ** 0.5;
  const bx = Math.min(14, Math.abs(mv.vx) * 0.22 + mv.zoom * 1.2) * blurK;
  const by = Math.min(14, Math.abs(mv.vy) * 0.22 + mv.zoom * 1.2) * blurK;
  const [sx, sy] = shake(t);
  const sp = splitAt(t);
  const q = sp ? sp.q : 0;
  const isMap = scene.k === 'map';
  return (
    <AbsoluteFill style={{ background: '#0A1A2E', overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="pcblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px) scale(1.03)` }}>
        {isMap ? (
          <>
            <AbsoluteFill style={{ filter: (Math.max(bx, by) > 0.6 ? 'url(#pcblur) ' : '') + MAP_GRADE }}>
              <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h, transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
                <MapCanvas cam={cam} res={res} />
                <Shapes c={cam} t={t} regions={regionsAt(t)} starts={starts(t)} />
              </div>
            </AbsoluteFill>
            <Clouds t={t} a={Math.min(1, cam.span / 3e4)} />
            <MapFx t={t} c={cam} />
          </>
        ) : (
          <Stage t={t} k={scene.k} t0={scene.t0} t1={scene.t1} />
        )}
        <Flashes t={t} />
        <Grade frame={frame} />
      </AbsoluteFill>
      {sp && <NullPanel t={t} q={sp.q} name={sp.w.name} t0={sp.w.t0} t1={sp.w.t1} from={sp.w.from} fps={fps} />}
      <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, left: 22, fontFamily: "'Montserrat', sans-serif", fontSize: 14, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles (SRTM/NASA, ETOPO1/NOAA) · borders, lakes: Natural Earth · canal and Río Indio lines approximate · images AI, props drawn in code
      </div>
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1640} />}
      {/* the watermark's spots cycle on a clock squeezed to land between spots at both ends of the loop */}
      {captions && <Watermark t={10 + (t * 90) / DURATION_S} />}
      {captions && audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
