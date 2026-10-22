import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { inOut, ramp } from './anim';
import { Watermark } from '../../brand/Watermark';
import { useMontserrat } from '../../darien/Brand';
import { useTZFonts } from '../../timezones/fonts';
import { DURATION_S, NULL_WIN, PLANE, SC, camAt, camMotion, inTilt, shake } from './cam';
import { Close, Flashes, Grade, MapFx, Subtitles, TiltCounter, UKTag, useFonts, wetterTags } from './Fx';
import { MapCanvas } from './Map';
import { LAND, regionsAt } from './regions';
import { Shapes } from './Shapes';
import { U09TiltWorld } from '../motion/U09TiltWorld';

export const UK_DURATION_60 = Math.ceil(DURATION_S * 60);
/** The mixed track (VO, music, SFX). */
const AUDIO = 'ukweather/audio/mix.wav';

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
          <OffthreadVideo src={staticFile(`ukweather/null/null_uk_${name}1.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #0b3a6a, #2E9BE0, #fff, #2E9BE0, #0b3a6a)', boxShadow: '0 0 24px #2E9BE0' }} />
    </div>
  );
};

const starts = (t: number) => {
  const out: Record<string, number> = {};
  for (const [k, ts] of Object.entries(LAND)) for (const s of ts) if (s <= t) out[k] = s;
  return out;
};

/** NullDynasty: why Britain's weather is so strange. 1080×1920 at 60 fps; rendered at --scale=2 for 4K. */
export const UKWeather: React.FC<{ captions?: boolean; res?: number; audio?: string }> = ({ captions = true, res = 1, audio = AUDIO }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  useTZFonts();
  useMontserrat();
  useFonts();
  const cam = camAt(t);
  const mv = camMotion(t);
  const blurK = (30 / fps) ** 0.5;
  const bx = Math.min(14, Math.abs(mv.vx) * 0.22 + mv.zoom * 1.2) * blurK;
  const by = Math.min(14, Math.abs(mv.vy) * 0.22 + mv.zoom * 1.2) * blurK;
  const [sx, sy] = shake(t);
  const sp = splitAt(t);
  const q = sp ? sp.q : 0;
  const tilt = inTilt(t);
  const map = (
    <AbsoluteFill style={{ filter: Math.max(bx, by) > 0.6 ? 'url(#ukblur)' : undefined }}>
      <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h, transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
        <MapCanvas cam={cam} res={res} />
        <Shapes c={cam} t={t} regions={regionsAt(t)} starts={starts(t)} />
      </div>
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ background: '#0A1A2E', overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="ukblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px) scale(1.03)` }}>
        {tilt ? (
          <Sequence from={Math.round(SC.tilt[0] * fps)} durationInFrames={Math.round((SC.tilt[1] - SC.tilt[0]) * fps) + 1} layout="none">
            <U09TiltWorld tags={wetterTags(cam)} back={Math.round((SC.tilt[1] - SC.tilt[0]) * fps) - 26}>
              <AbsoluteFill>{map}<UKTag t={t} c={cam} /></AbsoluteFill>
            </U09TiltWorld>
          </Sequence>
        ) : map}
        <MapFx t={t} c={cam} />
        {tilt && <TiltCounter t={t} />}
        <Flashes t={t} />
        <Grade frame={frame} />
      </AbsoluteFill>
      {sp && <NullPanel t={t} q={sp.q} name={sp.w.name} t0={sp.w.t0} t1={sp.w.t1} from={sp.w.from} fps={fps} />}
      {sp?.w.name === 'A' && <AbsoluteFill style={{ transform: `translateY(${-480 * q + 480}px)` }}><Close t={t} /></AbsoluteFill>}
      <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, left: 22, fontFamily: "'Montserrat', sans-serif", fontSize: 14, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles (SRTM/NASA, ETOPO1/NOAA) · borders: Natural Earth · rainfall: World Bank · props AI, drawn in code
      </div>
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1640} />}
      {captions && <Watermark t={t} />}
      {captions && audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
