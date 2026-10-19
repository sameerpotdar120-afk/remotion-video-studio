import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { inOut, ramp } from './anim';
import { Watermark } from '../../brand/Watermark';
import { useMontserrat } from '../../darien/Brand';
import { useTZFonts } from '../../timezones/fonts';
import { C, DURATION_S, NULL_WIN, PLANE, SC, camAt, camMotion, merc, sceneAt, shake, toScreen } from './cam';
import { Cutaways, Ev3DFx, GLASS, GlobeFx, Grade, MapFx, Subtitles, zoomCut } from './Fx';
import { Ev3D, cam3At } from './Ev3D';
import { Globe, SpaceBg, globeAt } from './Globe';
import { MapCanvas } from './Map';
import { LAND, regionsAt } from './regions';
import { Shapes } from './Shapes';
import { C03Magnifier } from '../motion/C03Magnifier';

export const CS_DURATION_60 = Math.ceil(DURATION_S * 60);
/** The mixed track (VO, music, SFX). */
const AUDIO = 'closestspace/audio/mix.wav';

/** Null's Omni clip: only the band from source y 420 to 1380 is shown, well above the Gemini sparkle on the desk. */
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
          <OffthreadVideo src={staticFile(`closestspace/null/null_cs_${name}1.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #0a5a8a, #6fd0ff, #e8f8ff, #6fd0ff, #0a5a8a)', boxShadow: '0 0 24px #6fd0ff' }} />
    </div>
  );
};

const starts = (t: number) => {
  const out: Record<string, number> = {};
  for (const [k, ts] of Object.entries(LAND)) for (const s of ts) if (s <= t) out[k] = s;
  return out;
};

/** The flat map: plates, fills, overlays. */
const MapLayer: React.FC<{ t: number; res: number; blur?: string }> = ({ t, res, blur }) => {
  const cam = camAt(t);
  return (
    <AbsoluteFill style={{ filter: blur }}>
      <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h, transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
        <div style={{ position: 'absolute', inset: 0, filter: 'saturate(1.05) contrast(1.06) brightness(1.08)' }}>
          <MapCanvas cam={cam} res={res} />
        </div>
        <Shapes c={cam} t={t} regions={regionsAt(t)} starts={starts(t)} />
      </div>
    </AbsoluteFill>
  );
};

/** The magnifier's paths: screen positions of places at given times (the camera moves under it). */
const lensKeys = (pts: [number, number, number][], t0: number): [number, number, number][] =>
  pts.map(([tt, lon, lat]) => {
    const p = toScreen(camAt(tt), merc(lon, lat));
    return [Math.round((tt - t0) * 60), p[0], p[1]];
  });

/** NullDynasty: which country is closest to space? 1080×1920 at 60 fps; rendered at --scale=2 for 4K. */
export const Closest: React.FC<{ captions?: boolean; res?: number; audio?: string }> = ({ captions = true, res = 1, audio = AUDIO }) => {
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
  const zc = zoomCut(t);
  const lens1 = t >= SC.lens1[0] && t < SC.lens1[1];
  const lens2 = t >= SC.lens2[0] && t < SC.lens2[1];
  const mapBlur = Math.max(bx, by) > 0.6 ? 'url(#csblur)' : undefined;
  const L1 = lensKeys([[SC.lens1[0], 60, -25], [SC.lens1[0] + 0.5, 22, 6], [C.dhoond2 + 1.2, 44, 22], [C.unchi2 + 0.2, 77, 21], [C.everest2 - 0.15, 86.9, 28.0], [SC.lens1[1], 86.9, 28.0]], SC.lens1[0]);
  const L2 = lensKeys([[SC.lens2[0], 40, -2], [SC.lens2[0] + 0.4, 34, 0], [C.equator9 + 0.4, 18, 0], [C.ecuador9 - 0.6, -40, 0], [C.ecuador9 - 0.05, -76, -1.0], [C.chimb9, -78.8, -1.47], [SC.lens2[1], -78.8, -1.47]], SC.lens2[0]);
  return (
    <AbsoluteFill style={{ background: '#0c2a3c', overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="csblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px) scale(${1.03 * zc.scale})`, filter: zc.blur > 0.5 ? `blur(${zc.blur.toFixed(1)}px)` : undefined }}>
        {scene === 'map' && (
          <>
            {lens1 || lens2 ? (
              <Sequence from={Math.round((lens1 ? SC.lens1[0] : SC.lens2[0]) * fps)} durationInFrames={Math.round(((lens1 ? SC.lens1[1] - SC.lens1[0] : SC.lens2[1] - SC.lens2[0]) + 0.1) * fps)} layout="none">
                <C03Magnifier path={lens1 ? L1 : L2} fill={lens1 ? Math.round((C.everest2 + 0.3 - SC.lens1[0]) * 60) : 99999} zoom={1.7} glass={GLASS()}>
                  <MapLayer t={t} res={res} />
                </C03Magnifier>
              </Sequence>
            ) : (
              <MapLayer t={t} res={res} blur={mapBlur} />
            )}
            <MapFx t={t} c={cam} />
          </>
        )}
        {scene === 'ev3d' && (
          <>
            <Ev3D t={t} />
            <Ev3DFx t={t} cam={cam3At(t)} />
          </>
        )}
        {(scene === 'globe' || scene === 'roti' || scene === 'geoid') && <SpaceBg t={t} />}
        {scene === 'globe' && (
          <>
            <Globe t={t} />
            <GlobeFx t={t} g={globeAt(t)} />
          </>
        )}
        {scene === 'geoid' && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #0b1220, #000 70%)' }} />}
        <Cutaways t={t} />
        <Grade t={t} frame={frame} />
      </AbsoluteFill>
      {zc.flash > 0.01 && <AbsoluteFill style={{ background: '#fff', opacity: zc.flash, mixBlendMode: 'screen' }} />}
      {sp && <NullPanel t={t} q={sp.q} name={sp.w.name} t0={sp.w.t0} t1={sp.w.t1} from={sp.w.from} fps={fps} />}
      <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, fontFamily: "'Montserrat', sans-serif", fontSize: 15, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · elevation: AWS Terrain Tiles (SRTM) · borders: Natural Earth · geoid: EGM96 (NGA) · characters drawn in code
      </div>
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1640} />}
      {captions && <Watermark t={t} />}
      {captions && audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
