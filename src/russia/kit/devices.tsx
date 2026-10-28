import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { H, W } from '../../lib/constants';
import { clamp, ease, ramp } from '../../lib/easing';
import { HAND, RC, TypeOn, hand, pop } from './core';

/* ════════════════════════ chapter scroll (§2.5) ════════════════════════
 * Hard cut to dark brown; closed scroll on two wooden rollers (≈8 f @30) → unrolls horizontally (≈12 f,
 * ease-out) → parchment with 10 medallions on a snake path; finished = terracotta, the new node fills then
 * pops bigger; "Chapter n: Title" types on at the bottom. Whole card ≈2.6–2.8 s.
 */
export const CHAPTER_NAMES = ['Rus', 'Mongols', 'Ivan', 'Troubles', 'Peter', 'Catherine', '1812', 'Last Tsar', 'Stalin', 'Today'];
export const CHAPTER_TITLES = ['Rus', 'Mongols', 'Ivan the Terrible', 'Time of Troubles', 'Peter the Great', 'Catherine', '1812', 'The Last Tsar', 'Stalin', 'Today'];

const Icon: React.FC<{ n: number; color: string }> = ({ n, color }) => {
  const p = { fill: color, stroke: 'none' };
  switch (n) {
    case 1: return <g {...p}><path d="M-34 6 L34 6 L24 18 L-24 18 Z" /><path d="M-2 6 L-2 -30 L2 -30 L2 6 Z" /><path d="M2 -28 L26 -10 L2 -2 Z" /><path d="M-34 6 Q-42 -6 -36 -12 L-30 4 Z" /></g>;
    case 2: return <g {...p}><path d="M-30 20 Q0 -46 30 20" fill="none" stroke={color} strokeWidth={7} /><path d="M-30 20 L30 20" stroke={color} strokeWidth={3} /><path d="M-6 -2 L30 -26 L24 -12 Z" /></g>;
    case 3: return <g {...p}><path d="M-30 18 L-30 -10 L-16 4 L0 -22 L16 4 L30 -10 L30 18 Z" /><rect x={-3} y={-34} width={6} height={14} /><rect x={-8} y={-30} width={16} height={5} /></g>;
    case 4: return <text x={0} y={22} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={66} fill={color}>?</text>;
    case 5: return <g {...p}><circle cx={0} cy={0} r={22} fill="none" stroke={color} strokeWidth={7} />{[0, 45, 90, 135].map((a) => <rect key={a} x={-3} y={-34} width={6} height={68} transform={`rotate(${a})`} />)}<circle r={7} /></g>;
    case 6: return <g {...p}><path d="M-28 16 Q-30 -14 -12 -18 Q0 -34 12 -18 Q30 -14 28 16 Z" /><circle cx={0} cy={-32} r={6} /></g>;
    case 7: return <g {...p}><path d="M-38 10 Q-20 -24 0 -26 Q20 -24 38 10 Q0 -2 -38 10 Z" /><circle cx={12} cy={-12} r={6} fill="#C8352B" /></g>;
    case 8: return <g {...p} transform="rotate(28)"><path d="M-26 16 L-26 -8 L-12 4 L0 -18 L12 4 L26 -8 L26 16 Z" /><path d="M-30 30 L30 30" stroke={color} strokeWidth={5} /></g>;
    case 9: return <path {...p} d="M0 -32 L9 -10 L32 -10 L14 4 L21 28 L0 14 L-21 28 L-14 4 L-32 -10 L-9 -10 Z" />;
    default: return <g {...p}><path d="M0 -36 Q16 -18 12 14 L-12 14 Q-16 -18 0 -36 Z" /><path d="M-12 6 L-24 22 L-12 18 Z M12 6 L24 22 L12 18 Z" /><circle cx={0} cy={-10} r={6} fill="#3A2A20" /></g>;
  }
};

export const ChapterScroll: React.FC<{ n: number; dur?: number }> = ({ n, dur = 168 }) => {
  const frame = useCurrentFrame();
  const closed = 14, unroll = 26;
  const open = ramp(frame, closed, unroll, ease.out);
  const pw = W * 0.76 * Math.max(0.04, open), ph = H * 0.64;
  const cx = W / 2, cy = H * 0.47;
  // snake path: row 1 left→right (1–5), row 2 right→left (6–10)
  const nodes = Array.from({ length: 10 }, (_, i) => {
    const row = i < 5 ? 0 : 1;
    const col = row === 0 ? i : 9 - i;
    return [cx - W * 0.3 + col * W * 0.15, cy - ph * 0.2 + row * ph * 0.42] as [number, number];
  });
  const fillAt = closed + unroll + 30, popAt = fillAt + 10;
  const bob = Math.sin(frame / 10) * 2;
  const end = ramp(frame, dur - 8, 8, ease.in);
  return (
    <AbsoluteFill style={{ background: RC.scrollBg }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(255,210,150,0.10), rgba(0,0,0,0.45))' }} />
      {/* parchment */}
      <div style={{ position: 'absolute', left: cx - pw / 2, top: cy - ph / 2, width: pw, height: ph, background: RC.parchment, overflow: 'hidden',
        boxShadow: 'inset 0 0 120px rgba(120,80,30,0.45), 0 30px 60px rgba(0,0,0,0.5)' }}>
        <svg width={W * 0.76} height={ph} style={{ position: 'absolute', left: (pw - W * 0.76) / 2, top: 0, opacity: ramp(frame, closed + unroll * 0.6, 10) }}>
          <g transform={`translate(${-(cx - W * 0.38)} ${-(cy - ph / 2)})`}>
            <path d={`M ${nodes.map((p) => p.join(' ')).join(' L ')}`} fill="none" stroke="#7A5532" strokeWidth={10} strokeDasharray="4 22" strokeLinecap="round" />
            {nodes.map(([x, y], i) => {
              const k = i + 1;
              const done = k < n || (k === n && frame >= fillAt);
              const fillT = k === n ? ramp(frame, fillAt, 10, ease.out) : done ? 1 : 0;
              const s = k === n ? 1 + 0.3 * pop(frame, popAt, 1.15) * (frame >= popAt ? 1 : 0) : 1;
              const col = interpolateColors(fillT, [0, 1], ['#B9A27C', RC.terracotta]);
              return (
                <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
                  <circle r={78} fill={col} stroke="#5A3B24" strokeWidth={8} />
                  <circle r={64} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
                  <g transform="scale(1.25)"><Icon n={k} color={done ? '#FFF4E0' : '#6E5638'} /></g>
                  <text y={128} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={54} fill="#4A3220">{CHAPTER_NAMES[i]}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      {/* rollers */}
      {[-1, 1].map((side) => (
        <div key={side} style={{ position: 'absolute', left: cx + side * pw / 2 - 46, top: cy - ph / 2 - 50 + bob, width: 92, height: ph + 100, borderRadius: 46,
          background: 'linear-gradient(90deg, #4A2E18, #A8754A 45%, #5C3A1E)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          {[0, 1].map((e) => <div key={e} style={{ position: 'absolute', left: 14, [e ? 'bottom' : 'top']: -28, width: 64, height: 64, borderRadius: '50%', background: '#3A2414' }} />)}
        </div>
      ))}
      <TypeOn text={`Chapter ${n}: ${CHAPTER_TITLES[n - 1]}`} x={cx} y={H * 0.9} start={popAt + 4} size={120} color="#F4E3C1" rate={0.9} />
      <AbsoluteFill style={{ background: '#000', opacity: end }} />
    </AbsoluteFill>
  );
};

/* ════════════════════════ the loop (§2.9 — the thesis device) ════════════════════════ */
export const LOOP_LABELS = ['Chaos', 'एक ताक़तवर आदमी', 'Order, आज़ादी के बदले', 'हद पार', 'Collapse'];
const LOOP_COL = [RC.danger, RC.blue, RC.green, '#C76A1E', RC.danger];

export const LoopWheel: React.FC<{
  x: number; y: number; r: number; start: number; exit?: number;
  labelsAt?: number[]; // frame each label types on (default: all with the wheel)
  steps?: [number, number][]; // [frame, node] — pointer moves there, node lights
  againAt?: number; // "AGAIN" stamp under Chaos
  spinAt?: number; // one full spin
  center?: { text: string; at: number; color?: string };
  small?: boolean;
}> = ({ x, y, r, start, exit, labelsAt, steps = [], againAt, spinAt, center, small }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, start, 1.08) * (exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1);
  if (s <= 0.001) return null;
  const ang = (i: number) => -90 + i * 72;
  let node = -1, prevNode = -1, since = -999;
  for (const [f, k] of steps) if (frame >= f) { prevNode = node; node = k; since = f; }
  // pointer angle: unwrap so it always travels forward around the loop
  const a0 = prevNode < 0 ? ang(0) - 40 : ang(prevNode);
  let a1 = node < 0 ? ang(0) - 40 : ang(node);
  while (a1 < a0) a1 += 360;
  const t = ramp(frame, since, 22, ease.out);
  const over = t < 1 ? Math.sin(t * Math.PI) * 6 : 0;
  let pa = a0 + (a1 - a0) * t + over;
  if (spinAt !== undefined && frame >= spinAt) pa += 360 * ramp(frame, spinAt, 70, ease.inOut);
  const fs = small ? r * 0.2 : r * 0.17;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `scale(${s})` }}>
      <svg width={r * 3} height={r * 3} viewBox={`${-r * 1.5} ${-r * 1.5} ${r * 3} ${r * 3}`} style={{ position: 'absolute', left: -r * 1.5, top: -r * 1.5, overflow: 'visible' }}>
        <circle r={r} fill="none" stroke="rgba(40,40,40,0.55)" strokeWidth={r * 0.035} strokeDasharray={`${r * 0.08} ${r * 0.05}`} />
        {Array.from({ length: 5 }, (_, i) => {
          const am = ((ang(i) + 36) * Math.PI) / 180;
          return <path key={i} d={`M ${-r * 0.08} ${-r * 0.06} L ${r * 0.08} 0 L ${-r * 0.08} ${r * 0.06} Z`} fill="#333"
            transform={`translate(${Math.cos(am) * r} ${Math.sin(am) * r}) rotate(${ang(i) + 36 + 90})`} />;
        })}
        {Array.from({ length: 5 }, (_, i) => {
          const a = (ang(i) * Math.PI) / 180;
          const on = i === node && frame >= since;
          const pulse = on ? 1 + 0.18 * Math.max(0, 1 - (frame - since) / 14) : 1;
          return (
            <g key={i} transform={`translate(${Math.cos(a) * r} ${Math.sin(a) * r}) scale(${pulse})`}>
              <circle r={r * 0.13} fill={on ? LOOP_COL[i] : '#E9E6E0'} stroke="#2A2A2A" strokeWidth={r * 0.022} />
              {on && <circle r={r * 0.19} fill="none" stroke={LOOP_COL[i]} strokeWidth={r * 0.02} opacity={0.6} />}
            </g>
          );
        })}
        <g transform={`rotate(${pa})`}>
          <path d={`M 0 ${-r * 0.05} L ${r * 0.72} 0 L 0 ${r * 0.05} Z`} fill="#222" />
          <circle r={r * 0.08} fill="#222" />
        </g>
      </svg>
      {LOOP_LABELS.map((txt, i) => {
        const a = (ang(i) * Math.PI) / 180;
        const cxa = Math.cos(a);
        const lx = cxa * r * 1.0 + Math.sign(Math.round(cxa * 10)) * r * 0.22, ly = Math.sin(a) * r * 1.0 + (i === 0 ? -r * 0.24 : r * 0.02);
        const align = Math.abs(cxa) < 0.2 ? 'center' : cxa > 0 ? 'left' : 'right';
        const at = labelsAt ? labelsAt[i] : start + 6;
        const on = i === node;
        const size = fs * (on ? 1.12 : 1);
        // long labels wrap onto two lines (split at the space nearest the middle) so they stay inside the frame
        const words = txt.split(' ');
        let lines = [txt];
        if (txt.length > 12 && words.length > 1) {
          let best = 1, bd = 1e9;
          for (let k = 1; k < words.length; k++) { const dd = Math.abs(words.slice(0, k).join(' ').length - txt.length / 2); if (dd < bd) { bd = dd; best = k; } }
          lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
        }
        return lines.map((ln, j) => (
          <TypeOn key={`${i}-${j}`} text={ln} x={lx} y={ly + (j - (lines.length - 1) / 2) * size * 1.08} start={at + j * 6} size={size} color={on ? LOOP_COL[i] : '#2B2B2B'} rate={0.8} align={align} />
        ));
      })}
      {againAt !== undefined && frame >= againAt && (
        <div style={{ position: 'absolute', left: Math.cos((ang(0) * Math.PI) / 180) * r * 0.05 - r * 0.85, top: -r * 1.45, transform: `rotate(-10deg) scale(${pop(frame, againAt, 1.2)})`,
          ...hand(fs * 1.3, RC.danger) }}>AGAIN ↻</div>
      )}
      {center && frame >= center.at && (
        <div style={{ position: 'absolute', left: 0, top: r * 0.48, transform: `translate(-50%, -50%) scale(${pop(frame, center.at, 1.15)})`, ...hand(r * 0.32, center.color ?? RC.danger) }}>{center.text}</div>
      )}
    </div>
  );
};

/* ════════════════════════ the 4 collapses counter ════════════════════════ */
export const CollapseMarks: React.FC<{ redAt: (number | undefined)[]; start: number; x?: number; y?: number; size?: number; exit?: number; labels?: boolean; slamFrom?: number }> = ({
  redAt, start, x = W * 0.83, y = H * 0.07, size = 90, exit, labels = true, slamFrom,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const o = exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1;
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: size * 0.3, transform: 'translate(-50%, 0)', opacity: o }}>
      {[0, 1, 2, 3].map((i) => {
        const appear = slamFrom !== undefined ? slamFrom + i * 9 : start;
        if (frame < appear) return <div key={i} style={{ width: size, height: size }} />;
        const r = redAt[i];
        const red = r !== undefined && frame >= r;
        const k = r !== undefined ? ramp(frame, r, 8, ease.out) : 0;
        const slam = r !== undefined && frame >= r ? 1 + 0.6 * Math.exp(-(frame - r) / 5) * (frame - r < 12 ? 1 : 0) : 1;
        return (
          <div key={i} style={{ width: size, textAlign: 'center', transform: `scale(${pop(frame, appear, 1.15) * slam})` }}>
            <svg width={size} height={size} viewBox="0 0 100 100">
              <rect x={6} y={6} width={88} height={88} rx={14} fill={red ? 'rgba(200,30,43,0.15)' : 'rgba(80,80,80,0.18)'} stroke={red ? RC.stampRed : '#8A8A8A'} strokeWidth={6} />
              <path d="M26 26 L74 74 M74 26 L26 74" stroke={interpolateColors(k, [0, 1], ['#9A9A9A', RC.stampRed])} strokeWidth={13} strokeLinecap="round" />
            </svg>
            {labels && <div style={{ ...hand(size * 0.42, red ? RC.stampRed : '#DDD'), textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>{i + 1}</div>}
          </div>
        );
      })}
    </div>
  );
};

/* ════════════════════════ recap timeline HUD (§2.6) ════════════════════════ */
export const TimelineHUD: React.FC<{ nodes: string[]; start: number; active: [number, number][]; collapses?: number[]; exit?: number }> = ({ nodes, start, active, collapses = [], exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const o = ramp(frame, start, 12, ease.out) * (exit !== undefined ? 1 - ramp(frame, exit, 10, ease.in) : 1);
  let cur = -1;
  for (const [f, k] of active) if (frame >= f) cur = k;
  const x0 = W * 0.2, x1 = W * 0.8, y = H * 0.08;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: o, transform: `translateY(${(1 - o) * -60}px)` }}>
      <div style={{ position: 'absolute', left: x0 - 90, top: y - 80, width: x1 - x0 + 180, height: 160, borderRadius: 80, background: 'rgba(30,30,34,0.82)' }} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line x1={x0} y1={y} x2={x1} y2={y} stroke="#888" strokeWidth={8} />
        {nodes.map((n, i) => {
          const x = x0 + ((x1 - x0) * i) / (nodes.length - 1);
          const col = i === cur ? '#E0312B' : i < cur ? RC.terracotta : '#777';
          const s = i === cur ? 1.25 : 1;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <circle r={38} fill={col} stroke="#fff" strokeWidth={5} />
              {collapses.includes(i) && i <= cur && <path d="M-16 -16 L16 16 M16 -16 L-16 16" stroke="#fff" strokeWidth={8} strokeLinecap="round" />}
              <text y={-52} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={52} fill="#fff">{n}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ════════════════════════ small icons drawn in code ════════════════════════ */

/** Lit candle → snuffed with a smoke wisp (death icon, §2.9). */
export const Candle: React.FC<{ x: number; y: number; size: number; start: number; outAt?: number; exit?: number }> = ({ x, y, size, start, outAt, exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const o = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  const lit = outAt === undefined || frame < outAt;
  const fl = Math.sin(frame / 3) * 0.08 + Math.sin(frame / 7.3) * 0.05;
  const smokeT = outAt !== undefined ? frame - outAt : -1;
  return (
    <svg width={size} height={size * 2} viewBox="0 0 50 100" style={{ position: 'absolute', left: x - size / 2, top: y - size * 2, overflow: 'visible', opacity: o, transform: `scale(${pop(frame, start)})`, transformOrigin: '50% 100%' }}>
      <rect x={17} y={42} width={16} height={52} rx={3} fill="#F4EEDC" stroke="#3A2A20" strokeWidth={2} />
      <rect x={10} y={92} width={30} height={7} rx={3} fill="#B8893E" stroke="#3A2A20" strokeWidth={2} />
      <line x1={25} y1={42} x2={25} y2={36} stroke="#222" strokeWidth={2} />
      {lit && (
        <g transform={`translate(25 34) scale(${1 + fl} ${1 - fl})`}>
          <ellipse cx={0} cy={-6} rx={14} ry={20} fill="rgba(255,190,80,0.25)" />
          <path d="M0 -20 Q8 -6 5 2 Q0 6 -5 2 Q-8 -6 0 -20 Z" fill="#FFB938" />
          <path d="M0 -12 Q4 -4 2 1 Q0 3 -2 1 Q-4 -4 0 -12 Z" fill="#FFF3C4" />
        </g>
      )}
      {smokeT >= 0 && smokeT < 120 && [0, 1, 2].map((i) => {
        const u = (smokeT - i * 8) / 90;
        if (u < 0 || u > 1) return null;
        return <circle key={i} cx={25 + Math.sin(u * 7 + i) * 6} cy={34 - u * 60} r={3 + u * 8} fill="rgba(200,200,200,0.6)" opacity={1 - u} />;
      })}
    </svg>
  );
};

/** Tear-off calendar with a red header (dates / time passing, §2.9): pages fly off, lands on `day / month`. */
export const Calendar: React.FC<{ x: number; y: number; size: number; start: number; pages?: string[]; final: [string, string]; per?: number; exit?: number }> = ({
  x, y, size, start, pages = [], final, per = 6, exit,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const o = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  const flips = pages.length;
  const idx = Math.min(flips, Math.floor((frame - start - 12) / per));
  const showing = idx < 0 ? pages[0] ?? final[0] : idx >= flips ? final[0] : pages[idx];
  const sheet = (txt: string, extra: React.CSSProperties = {}) => (
    <div style={{ position: 'absolute', inset: 0, top: size * 0.26, background: '#FBF8F1', borderRadius: `0 0 ${size * 0.06}px ${size * 0.06}px`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...hand(size * 0.42, '#222'), textShadow: 'none', ...extra }}>{txt}</div>
  );
  const flying = idx >= 0 && idx < flips ? (frame - start - 12) % per : -1;
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y - size * 0.6, width: size, height: size * 1.2, opacity: o, transform: `scale(${pop(frame, start)})` }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: size * 0.06, background: '#FBF8F1', boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }} />
      {sheet(showing)}
      {flying >= 0 && sheet(pages[idx] ?? '', { transform: `translate(${flying * size * 0.18}px, ${-flying * size * 0.12}px) rotate(${flying * 9}deg)`, opacity: 1 - flying / per })}
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: size * 0.26, background: '#D2342B', borderRadius: `${size * 0.06}px ${size * 0.06}px 0 0`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', ...hand(size * 0.15, '#fff') }}>{idx >= flips ? final[1] : ''}</div>
    </div>
  );
};

/** Grid of person icons that turn grey row by row (losses, §2.9). */
export const PeopleGrid: React.FC<{ x: number; y: number; cols: number; rows: number; size: number; start: number; greyFrom?: number; perRow?: number; greyCount?: number; color?: string; exit?: number }> = ({
  x, y, cols, rows, size, start, greyFrom, perRow = 8, greyCount, color = '#F2EFE8', exit,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const o = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  const nodes: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const s = pop(frame, start + i * 0.6, 1.1);
      // greyCount: only the first N figures grey, one after another (2 f apart); else whole rows, perRow frames apart
      const g = greyFrom === undefined ? 0 : greyCount !== undefined ? (i < greyCount ? ramp(frame, greyFrom + i * 2, 8, ease.out) : 0) : ramp(frame, greyFrom + r * perRow, 8, ease.out);
      const col = interpolateColors(g, [0, 1], [color, '#5B5B5B']);
      nodes.push(
        <svg key={i} width={size} height={size * 1.4} viewBox="0 0 20 28" style={{ position: 'absolute', left: c * size * 1.15, top: r * size * 1.55, transform: `scale(${s})` }}>
          <circle cx={10} cy={6} r={5} fill={col} />
          <path d="M2 27 Q2 13 10 13 Q18 13 18 27 Z" fill={col} />
        </svg>,
      );
    }
  return <div style={{ position: 'absolute', left: x - (cols * size * 1.15) / 2, top: y - (rows * size * 1.55) / 2, opacity: o }}>{nodes}</div>;
};

/** Hand-drawn red X strike over something (red crossed-out text, §2.9). */
export const RedX: React.FC<{ x: number; y: number; w: number; h?: number; start: number; exit?: number }> = ({ x, y, w, h, start, exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const o = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  const hh = h ?? w;
  const a = ramp(frame, start, 7, ease.out), b = ramp(frame, start + 6, 7, ease.out);
  return (
    <svg width={w} height={hh} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', left: x - w / 2, top: y - hh / 2, overflow: 'visible', opacity: o }}>
      <path d="M8 10 L92 90" stroke={RC.stampRed} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - a} vectorEffect="non-scaling-stroke" style={{ strokeWidth: w * 0.05 }} />
      <path d="M92 10 L8 90" stroke={RC.stampRed} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - b} vectorEffect="non-scaling-stroke" style={{ strokeWidth: w * 0.05 }} />
    </svg>
  );
};

/** "?" that bounces (empty throne, mystery). */
export const Bouncy: React.FC<{ x: number; y: number; start: number; text?: string; size?: number; color?: string; exit?: number }> = ({ x, y, start, text = '?', size = 220, color = RC.white, exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const o = exit !== undefined ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  const b = -Math.abs(Math.sin((frame - start) / 9)) * size * 0.25 * Math.max(0.3, Math.exp(-(frame - start) / 90));
  return <div style={{ position: 'absolute', left: x, top: y + b, opacity: o, transform: `translate(-50%, -50%) scale(${pop(frame, start, 1.2)})`, ...hand(size, color) }}>{text}</div>;
};

export const fadeIn = (frame: number, a: number, d = 10) => interpolate(frame, [a, a + d], [0, 1], clamp);
