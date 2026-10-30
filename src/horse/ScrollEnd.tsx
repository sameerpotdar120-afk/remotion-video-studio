import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import HANZI from './hanzi.generated.json';

type Glyph = { strokes: string[]; medians: [number, number][][] };
const G = HANZI as unknown as Record<string, Glyph>;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const sm = (t: number) => t * t * (3 - 2 * t);

/** Writing order and frame windows, from the reference: 塞 3520–3546, 翁 –3564, 失 –3578, 马 –3592. */
const TITLE: [string, number, number][] = [['塞', 3520, 3546], ['翁', 3546, 3564], ['失', 3564, 3578], ['马', 3578, 3592]];
const mlen = (m: [number, number][]) => m.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - m[i][0], p[1] - m[i][1]), 0);

/** One character drawn stroke by stroke (Make Me a Hanzi stroke data): each stroke is revealed along its median. */
const Hanzi: React.FC<{ ch: string; a: number; b: number; size: number; color?: string; id: string }> = ({ ch, a, b, size, color = '#1d1814', id }) => {
  const f = useCurrentFrame();
  const g = G[ch];
  const lens = useMemo(() => g.medians.map((m) => mlen(m) + 60), [ch]);
  const total = lens.reduce((s, l) => s + l, 0);
  const prog = clamp01((f - a) / Math.max(1, b - a)) * total;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024">
      <g transform="scale(1,-1) translate(0,-900)">
        {g.strokes.map((s, i) => {
          const start = acc; acc += lens[i];
          const p = clamp01((prog - start) / lens[i]);
          if (p <= 0) return null;
          const m = g.medians[i];
          const d = 'M' + m.map(([x, y]) => `${x} ${y}`).join(' L');
          return (
            <g key={i}>
              <clipPath id={`${id}-${i}`}><path d={s} /></clipPath>
              <path d={d} fill="none" stroke={color} strokeWidth={150} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${lens[i]} ${lens[i] + 10}`} strokeDashoffset={lens[i] * (1 - sm(p))} clipPath={`url(#${id}-${i})`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/** The ending: a hanging scroll on a plaster wall unrolls and 塞翁失马 is brushed on, then pinyin, a red seal and 焉知非福. */
export const ScrollEnd: React.FC = () => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const unroll = sm(clamp01((f - 3494) / 26));
  const sw = W * 0.2, sh = H * 0.42 * unroll, sx = W / 2 - sw / 2, sy = H * 0.105;
  const ch = sw * 0.62;
  const late = clamp01((f - 3596) / 14), later = clamp01((f - 3616) / 20);
  const wall = useMemo(() => {
    // plaster wall with faint hairline cracks, warm centre light and vignette
    const cracks = Array.from({ length: 9 }, (_, i) => {
      const r = (k: number) => { const v = Math.sin((i + 1) * 77.7 * k) * 43758.5; return v - Math.floor(v); };
      let x = r(1) * W, y = r(2) * H; let d = `M${x} ${y}`;
      for (let k = 0; k < 6; k++) { x += (r(k + 3) - 0.5) * W * 0.06; y += H * 0.012 + r(k + 9) * H * 0.02; d += ` L${x} ${y}`; }
      return d;
    });
    return cracks;
  }, [W, H]);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 38%, #f5f2ea 0%, #e9e4d8 55%, #cfc8b8 100%)' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {wall.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(120,110,95,0.25)" strokeWidth={W * 0.0012} />)}
      </svg>
      {/* string and hook */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={W / 2} cy={sy - H * 0.028} r={W * 0.006} fill="#5a3a24" />
        <path d={`M${sx + sw * 0.08} ${sy} L${W / 2} ${sy - H * 0.026} L${sx + sw * 0.92} ${sy}`} fill="none" stroke="#7a2a22" strokeWidth={W * 0.003} />
      </svg>
      {/* scroll: mount, paper, rods */}
      <div style={{ position: 'absolute', left: sx, top: sy, width: sw, height: sh, background: '#9aa7ad', boxShadow: `0 ${W * 0.01}px ${W * 0.03}px rgba(60,50,40,0.35)`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: sw * 0.07, right: sw * 0.07, top: sw * 0.07, bottom: sw * 0.07, background: '#fbfaf5' }} />
        <div style={{ position: 'absolute', left: sw / 2 - ch / 2, top: sw * 0.12, width: ch, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {TITLE.map(([c, a, b], i) => <Hanzi key={c} ch={c} a={a} b={b} size={ch * 0.98} id={`t${i}`} />)}
          <div style={{ opacity: late, fontFamily: 'Poppins', fontWeight: 600, fontSize: ch * 0.15, color: '#2b2520', marginTop: ch * 0.02, whiteSpace: 'nowrap' }}>sài wēng shī mǎ</div>
          <div style={{ opacity: later, display: 'flex', gap: ch * 0.02, marginTop: ch * 0.04 }}>
            {['焉', '知', '非', '福'].map((c, i) => <div key={c} style={{ opacity: 0.55 }}><Hanzi ch={c} a={3616 + i * 4} b={3632 + i * 4} size={ch * 0.2} color="#c4403a" id={`s${i}`} /></div>)}
          </div>
        </div>
        <div style={{ position: 'absolute', right: sw * 0.16, top: sw * 0.12 + ch * 3.55, width: ch * 0.13, height: ch * 0.13, background: '#d24a3c', opacity: late, borderRadius: ch * 0.01 }} />
      </div>
      {[sy - W * 0.008, sy + sh - W * 0.004].map((y, i) => (
        <div key={i} style={{ position: 'absolute', left: sx - sw * 0.06, top: y, width: sw * 1.12, height: W * 0.013, background: 'linear-gradient(#7a4a2e, #4e2c1a)', borderRadius: W * 0.006 }}>
          {[0, 1].map((k) => <div key={k} style={{ position: 'absolute', top: -W * 0.003, [k ? 'right' : 'left']: -W * 0.01, width: W * 0.014, height: W * 0.019, background: '#e8e0cc', borderRadius: W * 0.004, border: `${W * 0.0015}px solid #6a5a44` }} />)}
        </div>
      ))}
    </AbsoluteFill>
  );
};
