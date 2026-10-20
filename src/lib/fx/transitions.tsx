import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { H, T, W } from '../constants';
import { clamp, ease, ramp } from '../easing';

/**
 * All transitions are overlays/wrappers applied at a cut frame `at`, so scenes stay simple:
 *   <Sequence from={0} durationInFrames={a}><WhipOut at={a - T.whip/2}><SceneA/></WhipOut></Sequence>
 *   <Sequence from={a}><WhipIn><SceneB/></WhipIn></Sequence>
 * Measured from the reference: whip 3–5 f, zoom-blur 3–9 f, iris 4 f, line-wipe 15 f, black 31 f (@30).
 */

/** Whip-pan OUT: content accelerates sideways with horizontal smear. */
export const WhipOut: React.FC<{ at: number; dir?: 1 | -1; dur?: number; children: React.ReactNode }> = ({
  at,
  dir = -1,
  dur = T.whip / 2,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, dur, ease.in);
  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${dir * t * W * 0.6}px) scaleX(${1 + t * 0.15})`,
        filter: t > 0 ? `blur(${t * 40}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Whip-pan IN: arrives smeared from the opposite side and settles. Use at the start of a Sequence. */
export const WhipIn: React.FC<{ dir?: 1 | -1; dur?: number; children: React.ReactNode }> = ({
  dir = -1,
  dur = T.whip / 2,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = 1 - ramp(frame, 0, dur, ease.out);
  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${-dir * t * W * 0.6}px) scaleX(${1 + t * 0.15})`,
        filter: t > 0.01 ? `blur(${t * 40}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Radial zoom-blur: OUT pushes into the centre, IN lands from a smeared zoom (ref f1786–1795 @30). */
export const ZoomBlurOut: React.FC<{ at: number; dur?: number; children: React.ReactNode }> = ({
  at,
  dur = T.zoomBlur / 2,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, dur, ease.in);
  return <ZoomSmear t={t}>{children}</ZoomSmear>;
};
export const ZoomBlurIn: React.FC<{ dur?: number; children: React.ReactNode }> = ({ dur = T.zoomBlur / 2, children }) => {
  const frame = useCurrentFrame();
  const t = 1 - ramp(frame, 0, dur, ease.out);
  return <ZoomSmear t={t}>{children}</ZoomSmear>;
};
/** Cheap radial smear: 6 stacked copies at increasing scale and falling opacity. */
const ZoomSmear: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  if (t <= 0.01) return <AbsoluteFill>{children}</AbsoluteFill>;
  const copies = 6;
  return (
    <AbsoluteFill>
      {Array.from({ length: copies }).map((_, i) => (
        <AbsoluteFill
          key={i}
          style={{
            transform: `scale(${1 + t * 0.9 * (i / copies) + t * 0.3})`,
            opacity: i === 0 ? 1 : (1 - i / copies) * 0.45,
            filter: `blur(${t * 8 * (i + 1)}px)`,
          }}
        >
          {children}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

/** Soft black blob that sweeps across (ref f2045–2051 @30). Put it ON TOP at the cut. */
export const IrisBlob: React.FC<{ at: number; dur?: number }> = ({ at, dur = 12 }) => {
  const frame = useCurrentFrame();
  const t = (frame - at) / dur; // 0..1 covers, 1..2 uncovers
  if (t < 0 || t > 2) return null;
  const cover = t <= 1 ? ease.in(t) : 1 - ease.out(t - 1);
  const cx = interpolate(t, [0, 2], [W * 1.05, -W * 0.05]);
  const r = cover * Math.hypot(W, H) * 0.75;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle ${r}px at ${cx}px ${H / 2}px, #000 0%, #000 85%, rgba(0,0,0,0) 100%)`,
      }}
    />
  );
};

/** Thin white vertical line sweeping right→left, revealing the NEXT style behind it (ref f187–202 @30). */
export const LineWipe: React.FC<{ at: number; dur?: number; next: React.ReactNode; children: React.ReactNode }> = ({
  at,
  dur = 30,
  next,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, dur, ease.inOut);
  const x = W * (1 - t);
  return (
    <AbsoluteFill>
      {children}
      {t > 0 && (
        <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${x}px)` }}>
          {next}
        </AbsoluteFill>
      )}
      {t > 0 && t < 1 && (
        <div style={{ position: 'absolute', left: x - 5, top: 0, width: 10, height: H, background: '#fff', boxShadow: '0 0 30px #fff' }} />
      )}
    </AbsoluteFill>
  );
};

/** Hard black hold (used ONCE, after "the war begins": ref 31 f @30 = 62 f @60). */
export const BlackHold: React.FC<{ at: number; dur?: number }> = ({ at, dur = T.blackHold }) => {
  const frame = useCurrentFrame();
  return frame >= at && frame < at + dur ? <AbsoluteFill style={{ background: '#000' }} /> : null;
};

/** White flash (1–3 f) for the satellite → parchment style switch. */
export const Flash: React.FC<{ at: number; dur?: number }> = ({ at, dur = 6 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 1, at + dur], [0, 0.85, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ background: '#fff', opacity: o }} /> : null;
};
