import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { FPS, inOut, ramp } from './anim';
import { useMontserrat } from '../darien/Brand';
import { Watermark } from '../brand/Watermark';
import { DURATION_S, NULL_WIN, PERSP, PLANE, camAt, camMotion, shake } from './cam';
import { useKKFonts } from './fonts';
import { MapCanvas, SEA_BG } from './Map';
import { PlaneLayer, regionsAt, tiltAt } from './Plane';
import { Cutouts } from './Cutout';
import { Grade, NamesCard, ScreenLayer, Subtitles, Whips } from './Screen';
import { VeoFull, VeoOverlays } from './Veo';

export const KOLKATA_DURATION = Math.ceil(DURATION_S * FPS);
/** The 4K 60 fps master: same timeline at 60 frames a second (render with --scale=2). */
export const KOLKATA_DURATION_60 = Math.ceil(DURATION_S * 60);
export const HAS_AUDIO = true;
/** The mixed track once it exists (VO, music, SFX); the raw VO until then. */
const AUDIO = 'kolkata/audio/mix.wav';

/** Null's Omni clips. We only ever show the band of each clip from source y 420 to 1380 (around the mask and hands),
 *  well above the Gemini sparkle at source y 1704–1775, so the watermark is never in frame. */
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
          <OffthreadVideo src={staticFile(`kolkata/null_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #b07a00, #FFD84A, #fff6c8, #FFD84A, #b07a00)', boxShadow: '0 0 24px #FFD84A' }} />
    </div>
  );
};

/** cut3d: regions rise as 3D cut-outs instead of flat glows. */
export const Kolkata: React.FC<{ captions?: boolean; screen?: boolean; res?: number; zoomOut?: number; cut3d?: boolean; veo?: boolean; propsOnly?: boolean }> = ({ captions = true, screen = true, res = 1, zoomOut = 1, cut3d = false, veo = false, propsOnly = false }) => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  useKKFonts();
  useMontserrat();
  const c0 = camAt(t);
  const cam = { ...c0, span: c0.span * zoomOut, tilt: cut3d ? tiltAt(t) : 0, cut: cut3d };
  const mv = camMotion(t);
  const blurK = (30 / fps) ** 0.5;
  const bx = Math.min(10, Math.abs(mv.vx) * 0.22 + mv.zoom * 1.2) * blurK;
  const by = Math.min(10, Math.abs(mv.vy) * 0.22 + mv.zoom * 1.2) * blurK;
  const blurOn = bx > 0.6 || by > 0.6;
  const [sx, sy] = shake(t);
  const sp = splitAt(t);
  const q = sp ? sp.q : 0;
  return (
    <AbsoluteFill style={{ background: SEA_BG, overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="kkblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px) scale(1.03)` }}>
        <AbsoluteFill style={{ filter: blurOn ? 'url(#kkblur)' : undefined }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '540px 960px',
            transform: cam.tilt ? `perspective(${PERSP}px) rotateX(${cam.tilt}deg)` : undefined }}>
          <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h,
            transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
            <div style={{ position: 'absolute', inset: 0, filter: 'saturate(1.2) contrast(1.16) brightness(1.02)' }}><MapCanvas cam={cam} res={res} /></div>
            <PlaneLayer t={t} c={cam} flat={!cut3d} between={cut3d ? <Cutouts cam={cam} t={t} regions={regionsAt(t)} res={res} /> : undefined} />
          </div>
          </div>
        </AbsoluteFill>
        <Grade t={t} frame={Math.round(t * fps)} />
        {screen && <ScreenLayer t={t} c={cam} propsOnly={propsOnly} />}
        {screen && veo && <VeoOverlays t={t} />}
        {screen && !propsOnly && <Whips t={t} />}
      </AbsoluteFill>
      {screen && veo && <VeoFull t={t} />}
      {screen && q > 0 && <div style={{ position: 'absolute', inset: 0, opacity: q }}><NamesCard t={t} /></div>}
      {NULL_WIN().map((w) => {
        const s = splitAt(t);
        return s && s.w.name === w.name ? <NullPanel key={w.name} t={t} q={s.q} name={w.name} t0={w.t0} t1={w.t1} from={w.from} fps={fps} /> : null;
      })}
      <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, fontFamily: "'Montserrat', sans-serif", fontSize: 15, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · borders: Natural Earth · village spots approximate · props, people, video clips &amp; host: AI
      </div>
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1620} />}
      {captions && <Watermark t={t} />}
      {captions && HAS_AUDIO && <Audio src={staticFile(AUDIO)} />}
    </AbsoluteFill>
  );
};
