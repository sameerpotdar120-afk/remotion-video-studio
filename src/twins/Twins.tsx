import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, inOut, ramp } from './anim';
import { useMontserrat } from '../darien/Brand';
import { Watermark } from '../brand/Watermark';
import { C, DURATION_S, PLANE, camAt, camMotion, shake } from './cam';
import { useTWFonts } from './fonts';
import { MapCanvas, SEA_BG } from './Map';
import { ShapeLayer } from './Shapes';
import { Grade, ScreenLayer, Subtitles, TwinsPop, Whips } from './Screen';

export const TWINS_DURATION = Math.ceil(DURATION_S * FPS);
export const HAS_AUDIO = true;

/** Null's clip: which second of the Omni take starts the split, and the band of it we show.
 *  The band (source y 420–1380) sits well above the Gemini sparkle (source y 1704–1775), so the watermark is never in frame. */
const NULL_SRC = 'twins/null_twins_A1.mp4';
const NULL_FROM = 0.5;
const BAND_TOP = 420;

export const SPLIT_T0 = () => C.to12 - 0.2;

const NullPanel: React.FC<{ t: number; q: number }> = ({ t, q }) => {
  const push = 1 + 0.05 * ramp(t, SPLIT_T0(), DURATION_S, inOut);
  return (
    <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d' }}>
      <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 260}px`, transform: `scale(${push})` }}>
        <Sequence from={Math.round(SPLIT_T0() * FPS)} layout="none">
          <OffthreadVideo src={staticFile(NULL_SRC)} muted startFrom={Math.round(NULL_FROM * FPS)} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #b07a00, #FFD84A, #fff6c8, #FFD84A, #b07a00)', boxShadow: '0 0 24px #FFD84A' }} />
    </div>
  );
};

export const Twins: React.FC<{ captions?: boolean; screen?: boolean }> = ({ captions = true, screen = true }) => {
  const t = useCurrentFrame() / FPS;
  useTWFonts();
  useMontserrat();
  const cam = camAt(t);
  const mv = camMotion(t);
  const bx = Math.min(10, Math.abs(mv.vx) * 0.22 + mv.zoom * 1.2);
  const by = Math.min(10, Math.abs(mv.vy) * 0.22 + mv.zoom * 1.2);
  const blurOn = bx > 0.6 || by > 0.6;
  const [sx, sy] = shake(t);
  const q = ramp(t, SPLIT_T0(), SPLIT_T0() + 0.4, inOut);
  return (
    <AbsoluteFill style={{ background: SEA_BG, overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="twblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy - 480 * q}px) scale(1.03)` }}>
        <AbsoluteFill style={{ filter: blurOn ? 'url(#twblur)' : undefined }}>
          <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h,
            transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotate(${cam.rot}deg)` }}>
            <div style={{ position: 'absolute', inset: 0, filter: 'saturate(1.2) contrast(1.16) brightness(1.02)' }}><MapCanvas cam={cam} /></div>
            <ShapeLayer t={t} c={cam} />
          </div>
        </AbsoluteFill>
        <Grade t={t} />
        {screen && <ScreenLayer t={t} c={cam} />}
        {screen && <Whips t={t} />}
      </AbsoluteFill>
      {screen && q > 0 && <div style={{ position: 'absolute', inset: 0, transform: `translateY(${-30 * (1 - q)}px)` }}><TwinsPop t={t} /></div>}
      {q > 0 && <NullPanel t={t} q={q} />}
      <div style={{ position: 'absolute', right: 22, bottom: q > 0 ? 974 : 14, fontFamily: "'Montserrat', sans-serif", fontSize: 15, color: '#fff', opacity: 0.55, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · shapes: Natural Earth · props &amp; host: AI illustration
      </div>
      {captions && <Subtitles t={t} top={q > 0.5 ? 800 : 1620} />}
      {captions && <Watermark t={t} />}
      {captions && HAS_AUDIO && <Audio src={staticFile('twins/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
