import React from 'react';
import { clamp01, pop } from '../../darien/anim';
import { HAND, TITLE } from './font';

// Every prop in this video is drawn in code (SVG), in parts, so each piece can move on its own: no image assets.
export const K = {
  orange: '#F28C1E', orangeD: '#C46A0C', gold: '#FFD23F', red: '#E2333A', blue: '#2F7BEA', white: '#F4F6FA', ink: '#0B1830',
  green: '#2ECC71', paper: '#F6F0E1', stone: '#E9E4D8', stoneD: '#BDB4A2', boardA: '#1767C4', boardB: '#0A3772',
};

/** The blueprint board: a blue gradient with a fine and a coarse grid. dy scrolls the grid with the board camera. */
export const Board: React.FC<{ dy?: number; dx?: number }> = ({ dy = 0, dx = 0 }) => {
  const oy = -(((dy % 180) + 180) % 180), ox = -(((dx % 180) + 180) % 180);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id="bd" cx="50%" cy="38%" r="75%"><stop offset="0" stopColor={K.boardA} /><stop offset="1" stopColor={K.boardB} /></radialGradient>
        <pattern id="g1" width={36} height={36} patternUnits="userSpaceOnUse" x={ox} y={oy}><path d="M36 0H0V36" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} /></pattern>
        <pattern id="g2" width={180} height={180} patternUnits="userSpaceOnUse" x={ox} y={oy}><path d="M180 0H0V180" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={2.5} /></pattern>
      </defs>
      <rect width={1080} height={1920} fill="url(#bd)" />
      <rect width={1080} height={1920} fill="url(#g1)" />
      <rect width={1080} height={1920} fill="url(#g2)" />
    </svg>
  );
};

/** A person icon (head + body + legs), drawn around its feet at (x, y). */
export const Person: React.FC<{ x: number; y: number; s?: number; fill?: string; o?: number }> = ({ x, y, s = 1, fill = K.white, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-62} r={11} fill={fill} />
    <rect x={-13} y={-48} width={26} height={30} rx={8} fill={fill} />
    <rect x={-11} y={-26} width={9} height={26} rx={3} fill={fill} />
    <rect x={2} y={-26} width={9} height={26} rx={3} fill={fill} />
  </g>
);

/** The White House: wings, columns, portico, flag; a white sticker edge like a cut-out. */
export const WhiteHouse: React.FC<{ flag?: number }> = ({ flag = 0 }) => (
  <svg viewBox="-260 -190 520 290" width={520} height={290} style={{ overflow: 'visible' }}>
    <defs><linearGradient id="whw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#D5DAE1" /></linearGradient></defs>
    <rect x={-252} y={-114} width={504} height={194} rx={12} fill="#fff" style={{ filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.5))' }} />
    <rect x={-236} y={-62} width={472} height={128} rx={3} fill="url(#whw)" />
    <rect x={-244} y={-74} width={488} height={13} rx={2} fill="#E3E6EA" />
    {[0, 1].map((r) => [-210, -173, -136, -99, 81, 118, 155, 192].map((x) => <rect key={`${r}${x}`} x={x} y={-46 + r * 58} width={18} height={34} rx={2} fill="#5A6E86" />))}
    <polygon points="-86,-74 86,-74 0,-118" fill="#F2F4F7" stroke="#C8CDD4" strokeWidth={3} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-72 + i * 26.5} y={-64} width={11} height={126} rx={3} fill="#E9ECF0" />)}
    <rect x={-250} y={64} width={500} height={14} rx={3} fill="#BFC5CC" />
    <rect x={-2} y={-182} width={4} height={66} fill="#6B7280" />
    <path d={`M2 -182 Q 26 ${-186 + flag * 6} 50 -182 L 50 -154 Q 26 ${-158 + flag * 6} 2 -154 Z`} fill={K.red} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M22 ${-176 + i * 7} Q 36 ${-178 + i * 7 + flag * 3} 50 ${-176 + i * 7}`} stroke="#fff" strokeWidth={2.5} fill="none" />)}
    <rect x={2} y={-182} width={20} height={15} fill={K.blue} />
  </svg>
);

/** The Capitol: wings, centre block, drum and dome (the dome part lifts by `dome` 0..1 so it can pop on last). */
export const Capitol: React.FC<{ dome?: number }> = ({ dome = 1 }) => (
  <svg viewBox="-320 -330 640 440" width={640} height={440} style={{ overflow: 'visible' }}>
    <defs>
      <linearGradient id="cst" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F3EFE6" /><stop offset="1" stopColor={K.stoneD} /></linearGradient>
      <linearGradient id="cdm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#D8D1C2" /><stop offset="0.45" stopColor="#FBF9F4" /><stop offset="1" stopColor="#BFB6A3" /></linearGradient>
    </defs>
    <path d="M-306 76 L-306 -36 L-96 -36 L-96 -76 L-68 -76 L-68 -156 Q-66 -270 0 -284 L0 -312 L0 -284 Q66 -270 68 -156 L68 -76 L96 -76 L96 -36 L306 -36 L306 76 Z" fill="#fff" stroke="#fff" strokeWidth={16} strokeLinejoin="round" style={{ filter: 'drop-shadow(0 16px 20px rgba(0,0,0,0.5))' }} />
    {[-1, 1].map((sx) => (
      <g key={sx}>
        <rect x={sx > 0 ? 95 : -295} y={-26} width={200} height={92} rx={4} fill="url(#cst)" />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={(sx > 0 ? 108 : -282) + i * 21} y={-14} width={9} height={66} rx={2} fill="#CFC7B6" />)}
        <polygon points={sx > 0 ? '95,-26 295,-26 285,-40 105,-40' : '-295,-26 -95,-26 -105,-40 -285,-40'} fill={K.stoneD} />
      </g>
    ))}
    <rect x={-92} y={-66} width={184} height={132} rx={4} fill="url(#cst)" />
    <polygon points="-70,-66 70,-66 0,-100" fill={K.stone} stroke={K.stoneD} strokeWidth={3} />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-78 + i * 21} y={-52} width={10} height={110} rx={2} fill="#D9D2C2" />)}
    <g transform={`translate(0 ${(1 - dome) * 60})`} opacity={clamp01(dome * 1.4)}>
      <rect x={-62} y={-150} width={124} height={84} rx={4} fill="url(#cst)" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-56 + i * 13.5} y={-140} width={6} height={66} rx={2} fill="#C9C0AD" />)}
      <path d="M-58 -150 Q-56 -255 0 -270 Q56 -255 58 -150 Z" fill="url(#cdm)" />
      {[-36, -14, 14, 36].map((k) => <path key={k} d={`M${k} -150 Q${k * 0.7} -230 0 -268`} stroke="rgba(120,110,95,0.5)" strokeWidth={2} fill="none" />)}
      <rect x={-10} y={-292} width={20} height={24} rx={3} fill={K.stone} />
      <rect x={-3} y={-312} width={6} height={22} rx={2} fill="#8C836F" />
    </g>
    <rect x={-300} y={60} width={600} height={14} rx={3} fill="#A99F8A" />
    <polygon points="-80,74 80,74 110,96 -110,96" fill="#CFC7B6" />
  </svg>
);

/** An orange label box (scaled in by p 0..1). */
export const LabelBox: React.FC<{ text: string; x: number; y: number; w: number; size?: number; p?: number; color?: string }> = ({ text, x, y, w, size = 34, p = 1, color }) => {
  if (p <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - size * 0.95, width: w, height: size * 1.9, transform: `scale(${p})`, borderRadius: 8,
      background: color ?? `linear-gradient(180deg, ${K.orange}, ${K.orangeD})`, boxShadow: '0 8px 16px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: TITLE, fontSize: size, color: '#fff', letterSpacing: 1.5 }}>{text}</div>
  );
};

/** Exact seat positions for a hemicycle of n seats in `rows` rows (largest-remainder split by row length), sorted left to right. */
export const hemiSeats = (n: number, rows: number, r0: number, r1: number) => {
  const rads = Array.from({ length: rows }, (_, r) => r0 + ((r1 - r0) * r) / Math.max(1, rows - 1));
  const sum = rads.reduce((a, b) => a + b, 0);
  const raw = rads.map((rd) => (n * rd) / sum);
  const k = raw.map(Math.floor);
  let left = n - k.reduce((a, b) => a + b, 0);
  raw.map((v, i) => [v - Math.floor(v), i] as [number, number]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { k[i]++; left--; } });
  const seats: { a: number; x: number; y: number }[] = [];
  rads.forEach((rd, r) => { for (let i = 0; i < k[r]; i++) { const a = Math.PI + (Math.PI * (i + 0.5)) / k[r]; seats.push({ a, x: Math.cos(a) * rd, y: Math.sin(a) * rd }); } });
  return seats.sort((p, q) => p.a - q.a);
};
/** A hemicycle at (cx, cy): seat i is drawn with color(i, n) once its turn in `fill` (0..1) arrives. */
export const Hemicycle: React.FC<{ cx: number; cy: number; n: number; rows: number; r0: number; r1: number; fill?: number; color: (i: number, n: number) => string; dot?: number; glow?: (i: number) => number }> = ({ cx, cy, n, rows, r0, r1, fill = 1, color, dot, glow }) => {
  const seats = React.useMemo(() => hemiSeats(n, rows, r0, r1), [n, rows, r0, r1]);
  const d = dot ?? ((r1 - r0) / rows) * 0.36;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {seats.map((s, i) => {
        const q = clamp01((fill * (n + 12) - i) / 12);
        if (q <= 0) return <circle key={i} cx={s.x} cy={s.y} r={d * 0.55} fill="rgba(255,255,255,0.12)" />;
        const g = glow ? glow(i) : 0;
        return <circle key={i} cx={s.x} cy={s.y} r={d * (0.6 + 0.4 * q) * (1 + 0.35 * g)} fill={color(i, n)} style={g > 0.05 ? { filter: `drop-shadow(0 0 ${6 * g}px ${K.gold})` } : undefined} />;
      })}
    </g>
  );
};

/** Handwritten words that write on left to right (p 0..1), in Caveat. */
export const Hand: React.FC<{ text: string; x: number; y: number; size?: number; rot?: number; p?: number; color?: string }> = ({ text, x, y, size = 56, rot = -6, p = 1, color = K.gold }) => {
  if (p <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, fontFamily: HAND, fontWeight: 700, fontSize: size, color, whiteSpace: 'nowrap',
      clipPath: `inset(-20% ${(1 - clamp01(p)) * 100}% -20% -5%)`, textShadow: '0 3px 8px rgba(0,0,0,0.45)' }}>{text}</div>
  );
};

/** A glowing green tick box (pops in at t0). */
export const Tick: React.FC<{ t: number; t0: number; x: number; y: number; s?: number }> = ({ t, t0, x, y, s = 1 }) => {
  if (t < t0) return null;
  const p = pop(t, t0, 9, 220), draw = clamp01((t - t0 - 0.06) / 0.18);
  return (
    <svg width={110} height={110} viewBox="-55 -55 110 110" style={{ position: 'absolute', left: x - 55, top: y - 55, transform: `scale(${p * s})`, overflow: 'visible' }}>
      <rect x={-42} y={-42} width={84} height={84} rx={12} fill="#122a1c" stroke={K.green} strokeWidth={6} style={{ filter: `drop-shadow(0 0 16px ${K.green})` }} />
      <path d="M-22 2 L-6 18 L24 -18" fill="none" stroke={K.green} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={80} strokeDashoffset={80 * (1 - draw)} />
    </svg>
  );
};

/** The federal law: paper, title, lines, a seal (pops at seal), a signature that writes on (sign 0..1). */
export const LawPaper: React.FC<{ sign?: number; seal?: number }> = ({ sign = 0, seal = 0 }) => (
  <svg width={260} height={340} viewBox="-130 -170 260 340" style={{ overflow: 'visible' }}>
    <rect x={-122} y={-162} width={244} height={324} rx={8} fill={K.paper} style={{ filter: 'drop-shadow(0 16px 20px rgba(0,0,0,0.5))' }} />
    <text x={0} y={-112} textAnchor="middle" fontFamily={TITLE} fontSize={34} fill="#4A3A28">FEDERAL</text>
    <text x={0} y={-74} textAnchor="middle" fontFamily={TITLE} fontSize={34} fill="#4A3A28">LAW</text>
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-92} y={-48 + i * 22} width={i % 3 === 2 ? 120 : 184} height={7} rx={3} fill="#CFC3A7" />)}
    <path d="M-92 128 C -62 100, -42 150, -12 118 C 8 100, 18 140, 30 122" fill="none" stroke="#2A2F6A" strokeWidth={4} strokeLinecap="round" strokeDasharray={220} strokeDashoffset={220 * (1 - clamp01(sign))} />
    {seal > 0 && (
      <g transform={`translate(82 122) scale(${seal})`}>
        <path d={Array.from({ length: 37 }, (_, i) => { const a = (i / 36) * Math.PI * 2, r = 32 + Math.sin(a * 9) * 3; return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join('') + 'Z'} fill="#B8862E" />
        <circle r={21} fill="none" stroke="#8C6420" strokeWidth={3} />
      </g>
    )}
  </svg>
);
/** A fountain pen, nib at (0,0), pointing down-left. */
export const Pen: React.FC = () => (
  <svg width={60} height={200} viewBox="-30 -180 60 200" style={{ overflow: 'visible' }}>
    <rect x={-11} y={-170} width={22} height={150} rx={9} fill="#1C1F26" style={{ filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.45))' }} />
    <rect x={-11} y={-170} width={22} height={26} rx={7} fill="#C9A45C" />
    <rect x={-12} y={-40} width={24} height={10} rx={3} fill="#C9A45C" />
    <polygon points="-10,-20 10,-20 0,12" fill="#C9A45C" />
  </svg>
);
/** Two senators (a pair of people icons) on a small round plate. */
export const Pair: React.FC<{ s?: number; fill?: string }> = ({ s = 1, fill = K.white }) => (
  <svg width={120 * s} height={110 * s} viewBox="-60 -90 120 110" style={{ overflow: 'visible' }}>
    <ellipse cx={0} cy={4} rx={50} ry={12} fill="rgba(0,0,0,0.35)" />
    <Person x={-17} y={0} s={1} fill={fill} />
    <Person x={17} y={0} s={1} fill={fill} />
  </svg>
);
