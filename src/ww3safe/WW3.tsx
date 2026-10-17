import React from 'react';
import { AbsoluteFill, Audio, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { easeIn, easeOut, inOut, lerp, linear, ramp } from './anim';
import { Watermark } from '../brand/Watermark';
import { useMontserrat } from '../darien/Brand';
import { DURATION_S, NULL_WIN, PLANE, SC, camAt, camMotion, shake } from './cam';
import { useWWFonts } from './fonts';
import { Ash, Banner, Comment, Grade, GlobeFx, MapFx, Scenes, Subtitles, Whips, winterAt } from './Fx';
import { Globe } from './Globe';
import { MapCanvas, SEA_BG } from './Map';
import { regionsAt } from './regions';
import { Shapes } from './Shapes';

export const WW3_DURATION_60 = Math.ceil(DURATION_S * 60);
/** The mixed track: VO, music, SFX (tools/mix_ww3safe.py). */
const AUDIO = 'ww3safe/audio/mix.wav';

/** Null's Omni clips: only the band from source y 420 to 1380 is ever shown, well above the Gemini sparkle. */
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
          <OffthreadVideo src={staticFile(`ww3safe/null_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #b07a00, #FFD84A, #fff6c8, #FFD84A, #b07a00)', boxShadow: '0 0 24px #FFD84A' }} />
    </div>
  );
};

/** When each region last landed (rose past half): drives the little lift on entry. */
const landings = (t: number) => {
  const now = regionsAt(t);
  const out: Record<string, number> = {};
  for (let k = 1; k <= 20; k++) {
    const back = regionsAt(t - k * 0.05);
    for (const r of now) if (out[r.key] === undefined && r.a > 0.5 && (back.find((q) => q.key === r.key)?.a ?? 0) <= 0.5) out[r.key] = t - (k - 0.5) * 0.05;
  }
  return out;
};

export const WW3: React.FC<{ captions?: boolean; res?: number; audio?: string }> = ({ captions = true, res = 1, audio = AUDIO }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  useWWFonts();
  useMontserrat();
  const cam = camAt(t);
  const mv = camMotion(t);
  const blurK = (30 / fps) ** 0.5;
  const bx = Math.min(12, Math.abs(mv.vx) * 0.22 + mv.zoom * 1.2) * blurK;
  const by = Math.min(12, Math.abs(mv.vy) * 0.22 + mv.zoom * 1.2) * blurK;
  const [sx, sy] = shake(t);
  const sp = splitAt(t);
  const q = sp ? sp.q : 0;
  // flat map → globe (zoom out, blur) and the dive back to a flat map
  const toGlobe = ramp(t, SC.globeIn, SC.globeIn + 0.45, easeIn);
  const flatOn = t < SC.globeIn + 0.45 || t >= SC.flat;
  const globeOn = t >= SC.globeIn && t < SC.flat;
  const gIn = ramp(t, SC.globeIn + 0.05, SC.globeIn + 0.55, easeOut);
  const dive = ramp(t, SC.dive, SC.flat, easeIn);
  const land = 1 - ramp(t, SC.flat, SC.flat + 0.35, easeOut);
  const flatScale = t < SC.flat ? lerp(1, 0.32, toGlobe) : 1 + 0.25 * land;
  const flatBlur = t < SC.flat ? 14 * toGlobe : 18 * land;
  const winter = winterAt(t);
  const blur = Math.max(bx, by) > 0.6 || flatBlur > 0.3;
  return (
    <AbsoluteFill style={{ background: SEA_BG, overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="wwblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${(bx + flatBlur).toFixed(2)} ${(by + flatBlur * 0.5).toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px) scale(1.03)` }}>
        {flatOn && (
          <AbsoluteFill style={{ opacity: t < SC.flat ? 1 - ramp(t, SC.globeIn + 0.15, SC.globeIn + 0.45, linear) : 1, transform: `scale(${flatScale})` }}>
            <AbsoluteFill style={{ filter: blur ? 'url(#wwblur)' : undefined }}>
              <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h, transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
                <div style={{ position: 'absolute', inset: 0, filter: `saturate(${1.2 * (1 - 0.9 * winter)}) contrast(1.12) brightness(${1.03 - 0.3 * winter})` }}><MapCanvas cam={cam} res={res} /></div>
                <Shapes c={cam} t={t} regions={regionsAt(t)} starts={landings(t)} />
              </div>
            </AbsoluteFill>
            <MapFx t={t} c={cam} />
          </AbsoluteFill>
        )}
        {globeOn && (
          <AbsoluteFill style={{ opacity: gIn }}>
            <Sequence from={Math.round(SC.globeIn * fps)} durationInFrames={Math.round((SC.flat - SC.globeIn + 0.2) * fps)} layout="none">
              <AbsoluteFill><Loop durationInFrames={480}><OffthreadVideo src={staticFile('ww3safe/motion/m06_space_bg.mp4')} muted style={{ width: 1080, height: 1920 }} /></Loop></AbsoluteFill>
            </Sequence>
            <AbsoluteFill style={{ transform: `scale(${lerp(2.4, 1, gIn) * (1 + 0.9 * dive)})`, filter: dive > 0.05 ? `blur(${dive * dive * 10}px)` : undefined }}>
              <Globe t={t} />
              <GlobeFx t={t} />
            </AbsoluteFill>
            {dive > 0 && <AbsoluteFill style={{ background: 'radial-gradient(circle, rgba(220,245,255,0) 30%, rgba(220,245,255,0.9) 100%)', opacity: dive * dive }} />}
          </AbsoluteFill>
        )}
        <Ash t={t} />
        <Scenes t={t} />
        <Grade t={t} frame={frame} />
        <Whips t={t} />
        <Banner t={t} />
        <Comment t={t} />
      </AbsoluteFill>
      {(() => {
        if (!sp) return null;
        return <NullPanel t={t} q={sp.q} name={sp.w.name} t0={sp.w.t0} t1={sp.w.t1} from={sp.w.from} fps={fps} />;
      })()}
      <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, fontFamily: "'Montserrat', sans-serif", fontSize: 15, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · borders: Natural Earth · zone approximate · props &amp; host: AI illustration
      </div>
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1620} />}
      {captions && <Watermark t={t} />}
      {captions && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
