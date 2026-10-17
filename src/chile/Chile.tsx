import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { easeIn, easeOut, inOut, lerp, ramp } from './anim';
import { Watermark } from '../brand/Watermark';
import { useMontserrat } from '../darien/Brand';
import { DURATION_S, NULL_WIN, PL, PLANE, SC, camAt, camMotion, sceneAt, shake } from './cam';
import { useCHFonts } from './fonts';
import { AndesBand, FlagScenes, Grade, LakeFx, Lens, MapFx, Skit, Subtitles, Whips } from './Fx';
import { MapCanvas, SEA_BG } from './Map';
import { regionsAt } from './regions';
import { Shapes } from './Shapes';

export const CHILE_DURATION_60 = Math.ceil(DURATION_S * 60);
/** The mixed track (VO, music, SFX) once tools/mix_chile.py has run; the raw VO until then. */
const AUDIO = 'chile/audio/mix.wav';

/** Null's Omni clips: only the band from source y 420 to 1380 is shown, well above the Gemini sparkle. */
const BAND_TOP = 420;
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
          <OffthreadVideo src={staticFile(`chile/null_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #b07a00, #FFD84A, #fff6c8, #FFD84A, #b07a00)', boxShadow: '0 0 24px #FFD84A' }} />
    </div>
  );
};

const landings = (t: number) => {
  const now = regionsAt(t);
  const out: Record<string, number> = {};
  for (let k = 1; k <= 20; k++) {
    const back = regionsAt(t - k * 0.05);
    for (const r of now) if (out[r.key] === undefined && r.a > 0.5 && (back.find((q) => q.key === r.key)?.a ?? 0) <= 0.5) out[r.key] = t - (k - 0.5) * 0.05;
  }
  return out;
};

export const Chile: React.FC<{ captions?: boolean; res?: number; audio?: string }> = ({ captions = true, res = 1, audio = AUDIO }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  useCHFonts();
  useMontserrat();
  const cam = camAt(t);
  const mv = camMotion(t);
  const blurK = (30 / fps) ** 0.5;
  const bx = Math.min(12, Math.abs(mv.vx) * 0.22 + mv.zoom * 1.2) * blurK;
  const by = Math.min(12, Math.abs(mv.vy) * 0.22 + mv.zoom * 1.2) * blurK;
  const [sx, sy] = shake(t);
  const sp = splitAt(t);
  const q = sp ? sp.q : 0;
  const scene = sceneAt(t);
  const vintage = scene === 'vintage';
  const mapOn = scene === 'sat' || scene === 'vintage' || scene === 'lake';
  // the intro: the world map as a tilted sheet of paper that rises and flattens as the camera dives
  const p = ramp(t, 0, 0.95, easeOut);
  const sheet = t < 0.95 ? `perspective(1800px) rotateX(${lerp(38, 0, p)}deg) rotateZ(${lerp(-9, 0, p)}deg) scale(${lerp(0.62, 1, p)})` : undefined;
  const lensCam = { ...camAt(SC.valley + 0.02), span: lerp(1.3e6, 4.4e5, ramp(t, SC.lens, SC.valley, easeIn)) };
  return (
    <AbsoluteFill style={{ background: t < 0.95 ? '#1d4f9a' : SEA_BG, overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="chblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px) scale(1.03)` }}>
        {mapOn && (
          <AbsoluteFill style={{ transform: sheet, boxShadow: sheet ? '0 40px 80px rgba(0,0,0,0.6)' : undefined, outline: sheet ? '10px solid #fff' : undefined }}>
            <AbsoluteFill style={{ filter: Math.max(bx, by) > 0.6 ? 'url(#chblur)' : undefined }}>
              <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h, transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
                <div style={{ position: 'absolute', inset: 0, filter: vintage ? 'saturate(0.95)' : 'saturate(1.2) contrast(1.12) brightness(1.03)' }}><MapCanvas cam={cam} res={res} vintage={vintage} /></div>
                <Shapes c={cam} t={t} regions={regionsAt(t)} starts={landings(t)} />
              </div>
            </AbsoluteFill>
            {!vintage && <AndesBand t={t} c={cam} />}
            <MapFx t={t} c={cam} />
            {vintage && (
              <Lens t={t}>
                <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h, transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${lensCam.rot}deg)` }}>
                  <div style={{ position: 'absolute', inset: 0, filter: 'saturate(1.2) contrast(1.12)' }}><MapCanvas cam={lensCam} res={res} /></div>
                </div>
              </Lens>
            )}
          </AbsoluteFill>
        )}
        {scene === 'skit' && <Skit t={t} />}
        <FlagScenes t={t} />
        {scene === 'lake' && <LakeFx t={t} />}
        <Grade t={t} frame={frame} vintage={vintage} />
        <Whips t={t} />
      </AbsoluteFill>
      {sp && <NullPanel t={t} q={sp.q} name={sp.w.name} t0={sp.w.t0} t1={sp.w.t1} from={sp.w.from} fps={fps} />}
      <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, fontFamily: "'Montserrat', sans-serif", fontSize: 15, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · borders: Natural Earth · Andes: AWS Terrain Tiles · historical shapes approximate · AI illustration
      </div>
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1620} />}
      {captions && <Watermark t={t} />}
      {captions && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
export { PL };
