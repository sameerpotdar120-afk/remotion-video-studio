import React from 'react';
import { AbsoluteFill, Audio, interpolate, random, staticFile, useCurrentFrame } from 'remotion';
import { C, FONTS, H, T, W } from '../lib/constants';
import { clamp, ease, loop, popScale, ramp, wobble } from '../lib/easing';
import speech from '../vo/speech.json';

/* ───────────────────────────── audio ───────────────────────────── */

const SPEECH = speech as [number, number][];
/** 0 = silence … 1 = VO speaking, smoothed (attack 8 f, release 24 f) for natural ducking. */
const speaking = (f: number) => {
  let v = 0;
  for (const [a, b] of SPEECH) {
    if (f < a - 8 || f > b + 24) continue;
    const up = interpolate(f, [a - 8, a], [0, 1], clamp);
    const down = interpolate(f, [b, b + 24], [1, 0], clamp);
    v = Math.max(v, Math.min(up, down));
  }
  return v;
};

/** Original score (scripts/audio/make_bgm.py), ducked under the narration. */
export const Bgm: React.FC<{ under?: number; gaps?: number }> = ({ under = 0.2, gaps = 0.42 }) => (
  <Audio
    src={staticFile('assets/music/bgm.wav')}
    volume={(f) => interpolate(speaking(f), [0, 1], [gaps, under]) * interpolate(f, [0, 20], [0, 1], clamp)}
  />
);

/** Narration master (ElevenLabs VO, normalised). */
export const Vo: React.FC = () => <Audio src={staticFile('assets/vo/vo_master.mp3')} volume={1} />;

/* ───────────────────────────── on-screen FX ───────────────────────────── */

/** Firework rocket + spark burst (ref opener). Burst lands `rise` frames after launch. */
export const Firework: React.FC<{ x: number; y: number; start: number; color?: string; rise?: number; size?: number }> = ({
  x,
  y,
  start,
  color = '#FFD84A',
  rise = 42,
  size = 520,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > rise + 80) return null;
  const nodes: React.ReactNode[] = [];
  if (t < rise) {
    const p = ease.out(t / rise);
    const ry = H + 40 - (H + 40 - y) * p;
    nodes.push(
      <div key="r" style={{ position: 'absolute', left: x - 6, top: ry, width: 12, height: 120, borderRadius: 6,
        background: 'linear-gradient(#fff, rgba(255,210,120,0))', filter: 'blur(1px)' }} />,
    );
  } else {
    const b = t - rise;
    const k = ease.out(Math.min(1, b / 40));
    const fade = interpolate(b, [30, 80], [1, 0], clamp);
    if (b < 6) {
      nodes.push(<div key="f" style={{ position: 'absolute', left: x - size * 0.5, top: y - size * 0.5, width: size, height: size,
        borderRadius: '50%', background: `radial-gradient(circle, #fff 0%, ${color} 25%, rgba(0,0,0,0) 65%)`, opacity: 1 - b / 6 }} />);
    }
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2 + random(`fa${start}${i}`) * 0.2;
      const v = size * (0.55 + random(`fv${start}${i}`) * 0.45);
      const px = x + Math.cos(a) * v * k;
      const py = y + Math.sin(a) * v * k + 0.012 * b * b * 6;
      const tw = loop(frame + i * 7, 9) < 0.5 ? 1 : 0.55;
      nodes.push(
        <div key={i} style={{ position: 'absolute', left: px - 9, top: py - 9, width: 18, height: 18, borderRadius: '50%',
          background: i % 3 === 0 ? '#fff' : color, opacity: fade * tw, boxShadow: `0 0 24px ${color}` }} />,
      );
    }
  }
  return <>{nodes}</>;
};

/** Cartoon eyes in SCREEN px (for 3D colonies / plates). mood 'love' = heart pupils. */
export const ScreenEyes: React.FC<{
  x: number;
  y: number;
  start: number;
  size?: number;
  look?: number;
  mood?: 'neutral' | 'angry' | 'worried' | 'love';
  exit?: number;
}> = ({ x, y, start, size = 70, look = 0, mood = 'neutral', exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (out <= 0) return null;
  const s = popScale(frame, start) * out;
  const blink = loop(frame + Math.round(x), T.blinkEvery) < T.blink / T.blinkEvery ? 0.12 : 1;
  const brow = mood === 'angry' ? 18 : mood === 'worried' ? -14 : 0;
  const beat = mood === 'love' ? 1 + 0.12 * Math.max(0, Math.sin(loop(frame, 30) * Math.PI * 2)) : 1;
  return (
    <svg width={size * 2.4} height={size * 1.6} viewBox="0 0 120 80"
      style={{ position: 'absolute', left: x - size * 1.2, top: y - size * 0.8, transform: `scale(${s})`, overflow: 'visible' }}>
      {[34, 86].map((cx, i) => (
        <g key={cx}>
          <ellipse cx={cx} cy={44} rx={20} ry={24 * blink} fill="#fff" stroke={C.outline} strokeWidth={4} />
          {mood === 'love' ? (
            <path d={HEART} fill="#E8304A" transform={`translate(${cx + look * 6} 46) scale(${0.5 * beat * blink})`} />
          ) : (
            <circle cx={cx + look * 8} cy={46} r={9 * blink} fill={C.ink} />
          )}
          {(mood === 'angry' || mood === 'worried') && (
            <line x1={cx - 20} y1={14 + (i === 0 ? -brow / 3 : brow / 3)} x2={cx + 20} y2={14 + (i === 0 ? brow / 3 : -brow / 3)}
              stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          )}
        </g>
      ))}
    </svg>
  );
};

/** Heart path centred on 0,0 (≈ 40 px wide at scale 1). */
export const HEART = 'M0 12 C-22 -4 -20 -22 -8 -22 C-2 -22 0 -16 0 -14 C0 -16 2 -22 8 -22 C20 -22 22 -4 0 12 Z';

/** Little hearts that pop and float up from a point (love for the king). */
export const FloatHearts: React.FC<{ x: number; y: number; start: number; count?: number; exit?: number }> = ({
  x,
  y,
  start,
  count = 4,
  exit,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const s0 = start + i * 22;
        const t = frame - s0;
        if (t < 0 || (exit !== undefined && frame > exit + 10)) return null;
        const life = loop(t, 90);
        const sc = popScale(frame, s0) * (exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1);
        const dx = wobble(`h${x}${i}`, frame, 30, 0.04) + (random(`hx${x}${i}`) - 0.5) * 80;
        return (
          <svg key={i} width={120} height={120} viewBox="-30 -30 60 60"
            style={{ position: 'absolute', left: x + dx - 60, top: y - life * 260 - 60, opacity: 1 - life ** 3, transform: `scale(${sc})` }}>
            <path d={HEART} fill="#E8304A" stroke="#fff" strokeWidth={3} />
          </svg>
        );
      })}
    </>
  );
};

/** VHS-style rewind streaks + chroma split for ~0.4 s (the reference's timeline rewind gag). */
export const RewindLines: React.FC<{ at: number; dur?: number }> = ({ at, dur = 26 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > dur) return null;
  const o = interpolate(t, [0, 4, dur], [0, 0.65, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {Array.from({ length: 11 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: (i * 263 + t * 160) % H, height: 6 + (i % 3) * 6,
          background: 'rgba(255,255,255,0.75)', filter: 'blur(2px)' }} />
      ))}
      <div style={{ position: 'absolute', right: 140, top: 120, fontFamily: FONTS.sans, fontSize: 130, color: '#fff',
        textShadow: '6px 0 0 rgba(255,0,60,0.6), -6px 0 0 rgba(0,200,255,0.6)' }}>◀◀</div>
    </AbsoluteFill>
  );
};

/** Big Hindi caption that slams in (scale 1.6 → 1) with a soft drop shadow. */
export const HindiTitle: React.FC<{
  x: number;
  y: number;
  text: string;
  start: number;
  exit?: number;
  size?: number;
  color?: string;
  sub?: string;
  subColor?: string;
}> = ({ x, y, text, start, exit, size = 190, color = '#fff', sub, subColor = C.dateYellow }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = ramp(frame, start, T.titleIn, ease.out);
  const out = exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1;
  if (out <= 0) return null;
  const subIn = ramp(frame, start + 10, 12, ease.out);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${interpolate(t, [0, 1], [1.6, 1]) * (0.9 + 0.1 * out)})`,
      opacity: t * out, textAlign: 'center', whiteSpace: 'nowrap' }}>
      <div style={{ fontFamily: FONTS.display, fontSize: size, color, lineHeight: 1.15,
        textShadow: '0 10px 30px rgba(0,0,0,0.55), 0 3px 6px rgba(0,0,0,0.6)', WebkitTextStroke: `${size * 0.012}px rgba(30,20,10,0.6)` }}>{text}</div>
      {sub && <div style={{ fontFamily: FONTS.label, fontWeight: 700, fontSize: size * 0.34, color: subColor, opacity: subIn,
        transform: `translateY(${(1 - subIn) * 20}px)`, textShadow: '0 4px 14px rgba(0,0,0,0.6)', letterSpacing: 2 }}>{sub}</div>}
    </div>
  );
};

/** Reveal the children with a vertical white line sweeping right→left (style switch, ref f187–202 @30). */
export const WipeReveal: React.FC<{ dur?: number; children: React.ReactNode }> = ({ dur = 30, children }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, 0, dur, ease.inOut);
  const x = W * (1 - t);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: t < 1 ? `inset(0 0 0 ${x}px)` : undefined }}>{children}</AbsoluteFill>
      {t > 0 && t < 1 && <div style={{ position: 'absolute', left: x - 6, top: 0, width: 12, height: H, background: '#fff', boxShadow: '0 0 40px #fff, 0 0 90px #fff' }} />}
    </AbsoluteFill>
  );
};

/** Year counter that flips like a split-flap: big year + small caption. */
export const YearFlip: React.FC<{ x: number; y: number; from: number; to: number; start: number; per: number; exit?: number }> = ({
  x,
  y,
  from,
  to,
  start,
  per,
  exit,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const i = Math.min(to - from, Math.floor((frame - start) / per));
  const year = from + i;
  const local = (frame - start) % per;
  const flip = i < to - from ? Math.min(1, local / 6) : 1;
  const done = i === to - from;
  const out = exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1;
  const s = popScale(frame, start) * (done ? 1 + 0.15 * Math.exp(-(frame - start - (to - from) * per) / 8) : 1);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s * out})`, opacity: out }}>
      <div style={{ fontFamily: FONTS.sans, fontSize: 300, color: done ? C.dateYellow : '#fff', letterSpacing: 6,
        transform: `rotateX(${(1 - flip) * 80}deg)`, textShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>{year}</div>
    </div>
  );
};
