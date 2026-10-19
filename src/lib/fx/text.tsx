import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { C, FONTS, T } from '../constants';
import { clamp, ease, popScale, ramp } from '../easing';

const serif: React.CSSProperties = {
  fontFamily: FONTS.serif,
  fontWeight: 700,
  color: '#fff',
  textShadow: '0 6px 24px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.6)',
  lineHeight: 1.02,
  whiteSpace: 'pre',
};

/**
 * Title like "Seven Years' War (1756–1763)": enters LARGE and scales DOWN into place
 * (ref f375–382 & f3938–3946 @30), date line in yellow. mode 'type' = 1 char / 2 f.
 */
export const MapTitle: React.FC<{
  x: number;
  y: number;
  text: string;
  date?: string;
  start: number;
  size?: number;
  mode?: 'slam' | 'type' | 'fade';
  align?: 'left' | 'center';
  color?: string;
  exit?: number;
}> = ({ x, y, text, date, start, size = 150, mode = 'slam', align = 'center', color = '#fff', exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = ramp(frame, start, T.titleIn, ease.out);
  const sc = mode === 'slam' ? interpolate(t, [0, 1], [1.6, 1]) : mode === 'fade' ? interpolate(t, [0, 1], [1.05, 1]) : 1;
  const chars = mode === 'type' ? Math.floor((frame - start) / T.typePerChar) : text.length;
  const out = exit ? 1 - ramp(frame, exit, 10, ease.in) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%) scale(${sc})`,
        transformOrigin: align === 'center' ? '50% 50%' : '0 50%',
        textAlign: align,
        opacity: (mode === 'type' ? 1 : t) * out,
      }}
    >
      <div style={{ ...serif, fontSize: size, color }}>{text.slice(0, chars)}</div>
      {date && (
        <div style={{ ...serif, fontSize: size * 0.42, color: C.dateYellow, marginTop: size * 0.12, opacity: chars >= text.length ? 1 : 0 }}>
          {date}
        </div>
      )}
    </div>
  );
};

/** Quote typed WORD BY WORD on the VO timing (ref f3719–3752 @30). Pass the frame of each word. */
export const WordReveal: React.FC<{
  x: number;
  y: number;
  words: { w: string; at: number }[];
  attribution?: string;
  size?: number;
  color?: string;
}> = ({ x, y, words, attribution, size = 110, color = C.ink }) => {
  const frame = useCurrentFrame();
  const done = frame >= words[words.length - 1].at + 6;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
      <div style={{ fontFamily: FONTS.serif, fontSize: size, fontWeight: 600, color, whiteSpace: 'pre' }}>
        {words.map(({ w, at }, i) => (
          <span key={i} style={{ opacity: ramp(frame, at, 6, ease.out), display: 'inline-block', transform: `translateY(${(1 - ramp(frame, at, 8, ease.out)) * 20}px)` }}>
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
      {attribution && (
        <div style={{ fontFamily: FONTS.serif, fontSize: size * 0.3, color, opacity: done ? 1 : 0, marginTop: 18, textAlign: 'right' }}>
          — {attribution}
        </div>
      )}
    </div>
  );
};

/** Yellow highlighter swipe over a rectangle (ref f4527–4538 @30). Duration scales with text length. */
export const Highlighter: React.FC<{ x: number; y: number; w: number; h: number; start: number; chars?: number; color?: string }> = ({
  x,
  y,
  w,
  h,
  start,
  chars = 30,
  color = C.highlighter,
}) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start, Math.max(12, chars * T.highlightPerChar), ease.inOut);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w * p,
        height: h,
        background: color,
        mixBlendMode: 'multiply',
        borderRadius: h * 0.25,
        transform: 'skewX(-6deg)',
      }}
    />
  );
};

/** Hand-drawn red strike-through, drawn left→right in 14 f (ref f2706–2712 @30). */
export const StrikeThrough: React.FC<{ x: number; y: number; w: number; start: number; color?: string; width?: number }> = ({
  x,
  y,
  w,
  start,
  color = C.strikeRed,
  width = 10,
}) => {
  const frame = useCurrentFrame();
  const d = `M 0 ${width} C ${w * 0.3} ${width * 0.2}, ${w * 0.7} ${width * 1.8}, ${w} ${width * 0.8}`;
  const p = ramp(frame, start, T.strike, ease.inOut);
  if (p <= 0) return null;
  const ev = evolvePath(p, d);
  return (
    <svg style={{ position: 'absolute', left: x, top: y - width, overflow: 'visible' }} width={w} height={width * 2}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" {...ev} />
    </svg>
  );
};

/** Green marker loop around an item, with an overshoot tail (ref f2805–2812 @30). */
export const MarkerLoop: React.FC<{ cx: number; cy: number; rx: number; ry: number; start: number; color?: string }> = ({
  cx,
  cy,
  rx,
  ry,
  start,
  color = C.markerGreen,
}) => {
  const frame = useCurrentFrame();
  // slightly open, rotated ellipse with a tail = hand-drawn feel
  const d = `M ${cx + rx * 0.9} ${cy - ry * 0.55}
    C ${cx + rx * 1.15} ${cy + ry * 0.6}, ${cx - rx * 0.4} ${cy + ry * 1.25}, ${cx - rx} ${cy + ry * 0.2}
    C ${cx - rx * 1.25} ${cy - ry * 0.9}, ${cx + rx * 0.5} ${cy - ry * 1.3}, ${cx + rx * 1.05} ${cy - ry * 0.25}
    L ${cx + rx * 1.18} ${cy + ry * 0.05}`;
  const p = ramp(frame, start, 16, ease.inOut);
  if (p <= 0) return null;
  return (
    <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width="100%" height="100%">
      <path d={d} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" {...evolvePath(p, d)} />
    </svg>
  );
};

/**
 * Timeline ruler "1775 – 1776 – 1777": enters as a horizontal light streak (12 f), labels fade up,
 * the active label turns yellow on a single frame (ref f114–127 @30). `steps` lets it scroll/rewind.
 */
export const TimelineRuler: React.FC<{
  x: number;
  y: number;
  start: number;
  steps: { at: number; labels: [string, string, string] }[];
  header?: string;
  exit?: number;
}> = ({ x, y, start, steps, header, exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const streak = ramp(frame, start, 12, ease.out);
  const current = [...steps].reverse().find((s) => frame >= s.at) ?? steps[0];
  const sinceStep = frame - current.at;
  const labelIn = ramp(frame, Math.max(start + 12, current.at), 10, ease.out);
  const slide = sinceStep < 10 ? (1 - ramp(frame, current.at, 10, ease.out)) * 120 : 0;
  const out = exit ? 1 - ramp(frame, exit, 12, ease.in) : 1;
  const w = 1100;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y, width: w, opacity: out }}>
      {header && <div style={{ ...serif, fontSize: 80, textAlign: 'center', marginBottom: 12, opacity: labelIn }}>{header}</div>}
      <div style={{ height: 5, background: '#fff', width: w * streak, margin: '0 auto', boxShadow: '0 0 20px #fff' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', transform: `translateX(${slide}px)`, opacity: labelIn }}>
        {current.labels.map((l, i) => (
          <div key={i} style={{ ...serif, fontSize: i === 1 ? 84 : 60, color: i === 1 && sinceStep >= 6 ? C.dateYellow : '#fff', marginTop: 10 }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Label with a hand-drawn curved arrow (e.g. "George Washington" ↘). Arrow draws on in 12 f. */
export const ArrowLabel: React.FC<{ x: number; y: number; text: string; to: [number, number]; start: number; size?: number }> = ({
  x,
  y,
  text,
  to,
  start,
  size = 72,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const s = popScale(frame, start);
  const d = `M ${x} ${y + size * 0.7} Q ${(x + to[0]) / 2 + 120} ${y + size * 0.4}, ${to[0]} ${to[1]}`;
  const p = ramp(frame, start + 4, 12, ease.out);
  return (
    <>
      <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, ...serif, fontSize: size }}>
        {text}
      </div>
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width="100%" height="100%">
        <path d={d} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" {...evolvePath(p, d)} />
      </svg>
    </>
  );
};

export { clamp };
