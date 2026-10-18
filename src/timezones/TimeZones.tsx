import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { inOut, ramp } from './anim';
import { Watermark } from '../brand/Watermark';
import { useMontserrat } from '../darien/Brand';
import { C, DURATION_S, NULL_WIN, PLANE, SC, camAt, camMotion, sceneAt, shake } from './cam';
import { useTZFonts } from './fonts';
import { Garden, Grade, MapFx, PlaneFx, Subtitles, Whips } from './Fx';
import { MapCanvas } from './Map';
import { regionsAt } from './regions';
import { Shapes } from './Shapes';
import { Meridian, OffsetRow, ZoneBands } from './Zones';

export const TZ_DURATION_60 = Math.ceil(DURATION_S * 60);
/** The mixed track (VO, music, SFX) once the mix has run; empty until the VO arrives. */
const AUDIO = '';

/** Null's Omni clip: only the band from source y 420 to 1380 is shown, well above the Gemini sparkle. */
const BAND_TOP = 420;
const splitAt = (t: number) => {
  for (const w of NULL_WIN()) {
    const q = Math.min(ramp(t, w.t0 - 0.2, w.t0 + 0.2, inOut), 1 - ramp(t, w.t1 - 0.2, w.t1 + 0.2, inOut));
    if (q > 0) return { q, w };
  }
  return null;
};
const NullPanel: React.FC<{ t: number; q: number; name: string; t0: number; t1: number; from: number; fps: number; ready: boolean }> = ({ t, q, name, t0, t1, from, fps, ready }) => {
  const push = 1 + 0.05 * ramp(t, t0, t1, inOut);
  return (
    <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d' }}>
      {ready && (
        <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 260}px`, transform: `scale(${push})` }}>
          <Sequence from={Math.round((t0 - 0.2) * fps)} durationInFrames={Math.round((t1 - t0 + 0.6) * fps)} layout="none">
            <OffthreadVideo src={staticFile(`timezones/null_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
          </Sequence>
        </div>
      )}
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

/** The reference's backdrop: a textured royal-blue board the world sheet lies on. */
const Backdrop: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #4a73f0 0%, #3a5fe0 45%, #2a46b8 100%)' }}>
    <AbsoluteFill style={{ opacity: 0.18, mixBlendMode: 'overlay', backgroundSize: '512px 512px', backgroundPosition: `${Math.sin(t * 0.2) * 20}px ${t * 6}px`,
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.05' numOctaves='3' seed='4'/></filter><rect width='512' height='512' filter='url(%23p)'/></svg>")` }} />
  </AbsoluteFill>
);

export const TimeZones: React.FC<{ captions?: boolean; res?: number; audio?: string; nullReady?: boolean }> = ({ captions = true, res = 1, audio = AUDIO, nullReady = false }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  useTZFonts();
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
  return (
    <AbsoluteFill style={{ background: '#2a46b8', overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="tzblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px) scale(1.03)` }}>
        <Backdrop t={t} />
        {scene === 'map' && (
          <>
            <AbsoluteFill style={{ filter: Math.max(bx, by) > 0.6 ? 'url(#tzblur)' : undefined }}>
              <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h, transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
                <div style={{ position: 'absolute', inset: 0, filter: 'saturate(1.2) contrast(1.12) brightness(1.03)' }}><MapCanvas cam={cam} res={res} /></div>
                <ZoneBands c={cam} t={t} />
                <Meridian c={cam} t={t} lon={0} t0={C.yahin2 - 0.05} t1={SC.offsets + 0.6} color="#FF2B3A" dur={0.8} />
                <Meridian c={cam} t={t} lon={0} t0={C.zero2 - 0.1} t1={SC.offsets + 0.6} color="#2F63FF" width={3} band={ramp(t, C.zero2 - 0.1, C.zero2 + 0.4)} dur={0.01} />
                <Meridian c={cam} t={t} lon={82.5} t0={C.ist5 + 0.2} t1={SC.borders + 0.3} color="#FFE11A" width={8} dur={0.9} />
                <Shapes c={cam} t={t} regions={regionsAt(t)} starts={landings(t)} />
                <PlaneFx t={t} c={cam} />
              </div>
            </AbsoluteFill>
            <OffsetRow c={cam} t={t} />
            <MapFx t={t} c={cam} />
          </>
        )}
        <Garden t={t} />
        <Grade t={t} frame={frame} />
        <Whips t={t} />
      </AbsoluteFill>
      {sp && <NullPanel t={t} q={sp.q} name={sp.w.name} t0={sp.w.t0} t1={sp.w.t1} from={sp.w.from} fps={fps} ready={nullReady} />}
      <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, fontFamily: "'Montserrat', sans-serif", fontSize: 15, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · borders & time zones: Natural Earth · zone lines approximate · AI illustration
      </div>
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1620} />}
      {captions && <Watermark t={t} />}
      {captions && audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
