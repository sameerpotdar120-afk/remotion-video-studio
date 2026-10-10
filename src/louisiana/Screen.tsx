import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, graphemes, inOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import sizes from '../../public/louisiana/img_sizes.json';
import { C, CAPS, Cam, DURATION_S, GEO, P, merc, toScreen } from './cam';
import { COL, FELL, SERIF } from './Plane';

export const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
const SZ = sizes as unknown as Record<string, [number, number]>;
const img = (n: string) => staticFile(`louisiana/img/${n}`);
const S = (c: Cam, lon: number, lat: number): P => toScreen(c, merc(lon, lat));
const glow = (color: string, r: number, n = 2) => Array.from({ length: n }, (_, i) => `drop-shadow(0 0 ${r * (i + 1)}px ${color})`).join(' ');

let fontsP: Promise<void> | null = null;
export const useSerifFonts = () => {
  const [h] = useState(() => delayRender('serif fonts'));
  useEffect(() => {
    fontsP ??= Promise.all([
      new FontFace('IMFell', `url(${staticFile('louisiana/fonts/IMFeENrm28P.ttf')})`).load(),
      new FontFace('NotoSerifDeva', `url(${staticFile('louisiana/fonts/NotoSerifDevanagari.ttf')})`, { weight: '100 900' }).load(),
    ]).then((fs) => fs.forEach((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f)));
    fontsP.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

// ---------------------------------------------------------------- characters and props
type Pose = [number, string]; // from time t, show image
/**
 * A chibi character or prop standing at a screen point (bottom-centre anchor): springs in with overshoot and a squash
 * on landing, breathes/bobs while idle, swaps poses with a quick squash-pop, can hop along a path, and pops out.
 */
const Actor: React.FC<{
  t: number; t0: number; t1: number; poses: Pose[]; x: number; y: number; h: number; flip?: boolean; bob?: number;
  path?: { t0: number; t1: number; x: number; y: number; hops?: number }; shadow?: boolean; rot?: number; z?: number;
}> = ({ t, t0, t1, poses, x, y, h, flip, bob = 5, path, shadow = true, rot = 0 }) => {
  if (t < t0 - 0.02 || t > t1 + 0.35) return null;
  const s = pop(t, t0, 10, 200);
  const out = ramp(t, t1, t1 + 0.3, easeIn);
  let pose = poses[0][1];
  let lastSwap = -99;
  for (const [pt, n] of poses) if (t >= pt) { pose = n; lastSwap = pt; }
  const swap = lastSwap > t0 ? kick(t, lastSwap, 0.09, 30, 10) : 0;
  const land = kick(t, t0 + 0.16, 0.1, 26, 10);
  let px = x, py = y, hopY = 0, tilt = 0;
  if (path) {
    const q = ramp(t, path.t0, path.t1, inOut);
    px = lerp(x, path.x, q);
    py = lerp(y, path.y, q);
    const hops = path.hops ?? 4;
    if (q > 0 && q < 1) {
      hopY = Math.abs(Math.sin(q * Math.PI * hops)) * 26;
      tilt = Math.sin(q * Math.PI * hops * 2) * 5;
    }
  }
  const [iw, ih] = SZ[pose] ?? [600, 900];
  const w = (h * iw) / ih;
  const sc = Math.max(0, s) * (1 - out);
  if (sc <= 0.01) return null;
  const breathe = Math.sin((t - t0) * 2.4) * bob;
  return (
    <div style={{ position: 'absolute', left: px, top: py, width: 0, height: 0 }}>
      {shadow && (
        <div style={{ position: 'absolute', left: -w * 0.34, top: -h * 0.045, width: w * 0.68, height: h * 0.09, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(40,25,10,0.45), rgba(40,25,10,0))', transform: `scale(${Math.min(1, sc) * (1 - hopY / 120)})` }} />
      )}
      <div style={{ position: 'absolute', left: -w / 2, top: -h, width: w, height: h, transformOrigin: '50% 100%',
        transform: `translateY(${-hopY - (1 - clamp01(s)) * 90}px) rotate(${rot + tilt}deg) scale(${sc * (1 - land - swap) * (flip ? -1 : 1)}, ${sc * (1 + land + swap) + breathe / h})`,
        filter: 'drop-shadow(0 4px 6px rgba(40,25,10,0.35))' }}>
        <img src={img(pose)} style={{ width: w, height: h, display: 'block' }} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- text
const Year: React.FC<{ text: string; t: number; t0: number; t1: number; x?: number; y?: number; size?: number }> = ({ text, t, t0, t1, x = 540, y = 760, size = 230 }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.25, t1);
  if (a <= 0) return null;
  const s = pop(t, t0, 9, 230);
  const bl = Math.max(0, 1 - clamp01((t - t0) / 0.18)) * 14;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${lerp(1.8, 1, clamp01(s)) + (s > 1 ? (s - 1) * 0.4 : 0)})`, opacity: a,
      fontFamily: FELL, fontSize: size, color: '#f7ecd4', letterSpacing: 4, filter: `${bl > 0.3 ? `blur(${bl.toFixed(1)}px) ` : ''}drop-shadow(0 6px 12px rgba(30,20,10,0.6))` }}>{text}</div>
  );
};

const Label: React.FC<{ text: string; t: number; t0: number; t1: number; x: number; y: number; size?: number; color?: string; arrow?: boolean }> = ({ text, t, t0, t1, x, y, size = 58, color = '#fff', arrow }) => {
  const a = window4(t, t0, t0 + 0.15, t1 - 0.25, t1);
  if (a <= 0) return null;
  const g = graphemes(text);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-100%)', opacity: a, textAlign: 'center' }}>
      <div style={{ whiteSpace: 'nowrap', fontFamily: SERIF, fontWeight: 800, fontSize: size, color, textShadow: '0 3px 8px rgba(20,12,4,0.85), 0 0 2px rgba(20,12,4,0.9)' }}>
        {g.map((ch, i) => {
          const p = clamp01(pop(t, t0 + i * 0.03, 12, 210));
          return <span key={i} style={{ display: 'inline-block', opacity: clamp01(p * 1.4), transform: `translateY(${(1 - p) * 22}px)` }}>{ch === ' ' ? ' ' : ch}</span>;
        })}
      </div>
      {arrow && (
        <svg width={60} height={70} style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
          <path d="M30,4 L30,52 M14,38 L30,58 L46,38" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round"
            pathLength={1} strokeDasharray={`${ramp(t, t0 + 0.15, t0 + 0.5, easeOut)} 1`} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))' }} />
        </svg>
      )}
    </div>
  );
};

/** Red price tag swinging in on its string, with the amount written on it. */
const PriceTag: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; text: string; w?: number; strike?: number }> = ({ t, t0, t1, x, y, text, w = 230, strike = -1 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = pop(t, t0, 8, 160);
  const swing = kick(t, t0, 22, 9, 3.2);
  const out = ramp(t, t1, t1 + 0.3, easeIn);
  const [iw, ih] = SZ['price_tag_blank.png'];
  const h = (w * ih) / iw;
  const st = strike > 0 ? ramp(t, strike, strike + 0.3, easeOut) : 0;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: 'absolute', left: -w * 0.78, top: -h * 0.1, width: w, height: h, transformOrigin: '78% 10%',
        transform: `rotate(${swing}deg) scale(${Math.max(0, s) * (1 - out)})`, filter: 'drop-shadow(0 6px 8px rgba(30,15,5,0.45))' }}>
        <img src={img('price_tag_blank.png')} style={{ width: w, height: h }} />
        <div style={{ position: 'absolute', left: '8%', top: '38%', width: '70%', textAlign: 'center', transform: 'rotate(-38deg)', fontFamily: "'Montserrat', sans-serif",
          fontWeight: 900, fontSize: w * 0.22, color: '#fff7e0', textShadow: '0 2px 0 rgba(90,10,10,0.6)' }}>{text}</div>
        {st > 0 && <div style={{ position: 'absolute', left: '12%', top: '50%', width: `${70 * st}%`, height: w * 0.035, background: '#fff', transform: 'rotate(-38deg)', transformOrigin: '0 50%', borderRadius: 4 }} />}
      </div>
    </div>
  );
};

/** Ink stamp slamming onto the screen. */
const Stamp: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number }> = ({ t, t0, t1, text, x, y }) => {
  const a = window4(t, t0, t0 + 0.02, t1 - 0.2, t1);
  if (a <= 0) return null;
  const s = ramp(t, t0, t0 + 0.12, easeIn);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(-12deg) scale(${lerp(2.4, 1, s) + kick(t, t0 + 0.12, 0.06, 30, 10)})`, opacity: a * (0.6 + 0.4 * s),
      padding: '10px 34px', border: '10px solid #C42A2A', borderRadius: 18, fontFamily: SERIF, fontWeight: 900, fontSize: 92, color: '#C42A2A', whiteSpace: 'nowrap',
      background: 'rgba(255,240,230,0.15)', mixBlendMode: 'multiply' }}>{text}</div>
  );
};

/** Waving tricolour drawn in code, on a little pole. */
const Flag: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; h?: number }> = ({ t, t0, t1, x, y, h = 120 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = pop(t, t0, 10, 200) * (1 - ramp(t, t1, t1 + 0.3, easeIn));
  const fw = h * 0.9;
  const fh = h * 0.55;
  const strips = 18;
  const cols = ['#1f3d99', '#ffffff', '#d62b2b'];
  return (
    <svg width={fw + 20} height={h + 20} style={{ position: 'absolute', left: x - 4, top: y - h, overflow: 'visible', transform: `scale(${Math.max(0, s)})`, transformOrigin: '4px 100%', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.4))' }}>
      <rect x={0} y={0} width={5} height={h} rx={2} fill="#4a3320" />
      {Array.from({ length: strips }, (_, i) => {
        const u = i / strips;
        const dy = Math.sin(u * 7 - t * 7) * 6 * u;
        return <rect key={i} x={5 + u * fw} y={4 + dy} width={fw / strips + 0.6} height={fh} fill={cols[Math.floor(u * 3)]} opacity={0.93 + 0.07 * Math.cos(u * 7 - t * 7)} />;
      })}
    </svg>
  );
};

/** Map pin dropping onto a city. */
const Pin: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; color?: string }> = ({ t, t0, t1, x, y, color = '#C9353D' }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const d = ramp(t, t0, t0 + 0.25, easeIn);
  const s = 1 - ramp(t, t1, t1 + 0.3, easeIn);
  const ring = ramp(t, t0 + 0.25, t0 + 0.9, easeOut);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      {ring > 0 && ring < 1 && <div style={{ position: 'absolute', left: -60 * ring, top: -24 * ring, width: 120 * ring, height: 48 * ring, borderRadius: '50%', border: `4px solid ${color}`, opacity: 1 - ring }} />}
      <svg width={60} height={84} style={{ position: 'absolute', left: -30, top: -84 - (1 - d) * 140, transform: `scale(${s})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.45))' }}>
        <path d="M30,82 C30,82 4,46 4,30 A26,26 0 1 1 56,30 C56,46 30,82 30,82 Z" fill={color} stroke="#5a1010" strokeWidth={3} />
        <circle cx={30} cy={30} r={10} fill="#fff6e6" />
      </svg>
    </div>
  );
};

/** Crossed sabres between two rivals. */
const Swords: React.FC<{ t: number; t0: number; t1: number; x: number; y: number }> = ({ t, t0, t1, x, y }) => {
  const a = window4(t, t0, t0 + 0.05, t1 - 0.2, t1);
  if (a <= 0) return null;
  const p = ramp(t, t0, t0 + 0.25, easeOut);
  const clash = window4(t, t0 + 0.22, t0 + 0.25, t0 + 0.3, t0 + 0.6);
  const blade = (ang: number) => (
    <g transform={`rotate(${ang})`}>
      <rect x={-6} y={-150} width={12} height={170} rx={6} fill="#dfe6ee" stroke="#5b6670" strokeWidth={3} />
      <rect x={-34} y={20} width={68} height={12} rx={6} fill="#b8862b" />
      <rect x={-7} y={32} width={14} height={40} rx={5} fill="#5a3a1c" />
    </g>
  );
  return (
    <svg width={400} height={400} style={{ position: 'absolute', left: x - 200, top: y - 200, opacity: a, overflow: 'visible', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>
      <g transform="translate(200,210)">
        {blade(lerp(-80, -35, p))}
        {blade(lerp(80, 35, p))}
        {clash > 0 && <circle cx={0} cy={-90} r={60} fill="url(#spark)" opacity={clash} />}
      </g>
      <defs><radialGradient id="spark"><stop offset="0" stopColor="#fff" /><stop offset="0.4" stopColor="#ffe08a" stopOpacity={0.8} /><stop offset="1" stopColor="#ffe08a" stopOpacity={0} /></radialGradient></defs>
    </svg>
  );
};

/** A four-point sparkle (sword glint, coins). */
const Glint: React.FC<{ t: number; t0: number; x: number; y: number; s?: number }> = ({ t, t0, x, y, s = 1 }) => {
  const a = window4(t, t0, t0 + 0.08, t0 + 0.25, t0 + 0.45);
  if (a <= 0) return null;
  const r = 40 * s * (0.6 + 0.4 * a);
  return (
    <svg width={r * 2} height={r * 2} style={{ position: 'absolute', left: x - r, top: y - r, opacity: a, transform: `rotate(${(t - t0) * 180}deg)`, overflow: 'visible' }}>
      <path d={`M${r},0 L${r * 1.12},${r * 0.88} L${r * 2},${r} L${r * 1.12},${r * 1.12} L${r},${r * 2} L${r * 0.88},${r * 1.12} L0,${r} L${r * 0.88},${r * 0.88} Z`} fill="#fffbe8" style={{ filter: 'drop-shadow(0 0 8px #ffe9a0)' }} />
    </svg>
  );
};

/** Comic thought bubble with a little tricolour planted over a sketch of America. */
const Thought: React.FC<{ t: number; t0: number; t1: number; x: number; y: number }> = ({ t, t0, t1, x, y }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = pop(t, t0, 10, 180) * (1 - ramp(t, t1, t1 + 0.3, easeIn));
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      <svg width={360} height={300} style={{ position: 'absolute', left: -40, top: -300, transform: `scale(${Math.max(0, s) * 1.45})`, transformOrigin: '40px 300px', overflow: 'visible', filter: 'drop-shadow(0 6px 8px rgba(30,15,5,0.35))' }}>
        <circle cx={40} cy={280} r={12} fill="#fffaf0" stroke="#3b2a1a" strokeWidth={4} />
        <circle cx={70} cy={240} r={20} fill="#fffaf0" stroke="#3b2a1a" strokeWidth={4} />
        <path d="M80,190 C40,170 50,110 100,110 C110,60 190,50 210,95 C250,60 330,90 315,140 C355,165 330,225 280,215 C260,250 180,250 165,220 C130,240 85,225 80,190 Z" fill="#fffaf0" stroke="#3b2a1a" strokeWidth={5} />
        <path d="M120,190 C130,160 150,150 170,140 C200,130 230,140 260,150 C280,160 285,180 270,195 C240,205 200,200 170,205 C150,207 130,205 120,190 Z" fill="#3A62C9" opacity={0.85} />
        <rect x={196} y={108} width={4} height={60} fill="#4a3320" />
        <rect x={200} y={110} width={14} height={26} fill="#1f3d99" /><rect x={214} y={110} width={14} height={26} fill="#fff" stroke="#ddd" /><rect x={228} y={110} width={14} height={26} fill="#d62b2b" />
      </svg>
    </div>
  );
};

/** Count-up number with a glow and a bump when it lands. */
const Counter: React.FC<{ t: number; t0: number; t1: number; text: (p: number) => string; x: number; y: number; size: number; color?: string; glowC?: string; dur?: number; font?: string }> = ({
  t, t0, t1, text, x, y, size, color = '#fff', glowC = '#ffcf4a', dur = 0.8, font = "'Montserrat', sans-serif",
}) => {
  const a = window4(t, t0, t0 + 0.1, t1 - 0.25, t1);
  if (a <= 0) return null;
  const p = ramp(t, t0, t0 + dur, easeOut);
  const s = clamp01(pop(t, t0, 11, 200));
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${(0.6 + 0.4 * s) * (1 + kick(t, t0 + dur, 0.08, 20, 8))})`, opacity: a, whiteSpace: 'nowrap',
      fontFamily: font, fontWeight: 900, fontSize: size, color, filter: `drop-shadow(0 0 ${size * 0.08}px ${glowC}) drop-shadow(0 4px 8px rgba(0,0,0,0.6))` }}>{text(p)}</div>
  );
};

// ---------------------------------------------------------------- inserts
/** Photo background insert with a whip in/out and a slow push. */
const Insert: React.FC<{ t: number; t0: number; t1: number; bg: string; children?: React.ReactNode; dir?: 1 | -1 }> = ({ t, t0, t1, bg, children, dir = 1 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const inP = ramp(t, t0, t0 + 0.28, easeOut);
  const outP = ramp(t, t1, t1 + 0.28, easeIn);
  const x = dir * ((1 - inP) * 1080 - outP * 1080);
  const vel = Math.max(1 - inP, outP) * (inP > 0 ? 1 : 0);
  const z = 1.04 + 0.06 * ramp(t, t0, t1, linear);
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: vel > 0.05 ? `blur(${(vel * 16).toFixed(1)}px)` : undefined, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <img src={img(bg)} style={{ width: 1080, height: 1920, objectFit: 'cover' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 50%, rgba(20,10,0,0.45) 100%)' }} />
      {children}
    </AbsoluteFill>
  );
};

/** The negotiation room in Paris: our real map of 1803 North America is drawn onto the empty board. */
const MapRoom: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.chaunk - 0.15;
  const t1 = C.haan16 - 0.35;
  if (t < t0 || t > t1 + 0.35) return null;
  const inP = ramp(t, t0, t0 + 0.35, easeOut);
  const outP = ramp(t, t1, t1 + 0.32, easeIn);
  const sc = lerp(0.6, 1, inP) * lerp(1, 1.6, outP);
  const a = Math.min(1, inP * 1.5) * (1 - outP);
  // board rectangle inside set_map_room.png (900×725): measured by eye from the asset
  const SW = 1000;
  const [iw, ih] = SZ['set_map_room.png'];
  const SH = (SW * ih) / iw;
  const bx = SW * 0.205, by = SH * 0.085, bw = SW * 0.59, bh = SH * 0.43;
  // fit North America 1803 into the board
  const b = { x0: merc(-128, 20)[0], x1: merc(-60, 20)[0], y0: merc(0, 22)[1], y1: merc(0, 56)[1] };
  const fx = (x: number) => bx + ((x - b.x0) / (b.x1 - b.x0)) * bw;
  const fy = (y: number) => by + ((b.y1 - y) / (b.y1 - b.y0)) * bh;
  const ring = (rs: P[][]) => rs.map((r) => r.map(([x, y], i) => `${i ? 'L' : 'M'}${fx(x).toFixed(1)},${fy(y).toFixed(1)}`).join('') + 'Z').join('');
  const louGlow = window4(t, C.poora15 - 0.1, C.poora15 + 0.2, t1, t1 + 0.3);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(20,12,4,0.35), rgba(20,12,4,0.75))' }} />
      <div style={{ position: 'absolute', left: 540 - SW / 2, top: 560, width: SW, height: SH, transform: `scale(${sc})`, transformOrigin: '50% 60%' }}>
        <img src={img('set_map_room.png')} style={{ width: SW, height: SH, position: 'absolute', left: 0, top: 0 }} />
        <svg width={SW} height={SH} style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs><clipPath id="board"><rect x={bx} y={by} width={bw} height={bh} rx={6} /></clipPath></defs>
          <g clipPath="url(#board)">
            <rect x={bx} y={by} width={bw} height={bh} fill="#e9d9b4" />
            <path d={ring(GEO.britainNA)} fill={COL.britain} opacity={0.85} />
            <path d={ring(GEO.usa)} fill={COL.usa} opacity={0.85} />
            <path d={ring(GEO.spain)} fill={COL.spain} opacity={0.85} />
            <path d={ring(GEO.louisiana)} fill={COL.louisiana} opacity={0.9} style={{ filter: louGlow > 0 ? `drop-shadow(0 0 ${10 * louGlow}px #8fb0ff)` : undefined }} />
            <path d={ring([...GEO.britainNA, ...GEO.usa, ...GEO.spain, ...GEO.louisiana])} fill="none" stroke="#2a1d12" strokeWidth={1.4} />
          </g>
        </svg>
        <PriceTag t={t} t0={C.dedh - 0.05} t1={t1} x={SW * 0.43} y={by + bh * 0.36} text="$15M" w={170} />
      </div>
      {/* the negotiators */}
      <Actor t={t} t0={t0 + 0.15} t1={t1} x={250} y={1380} h={430} poses={[[0, 'diplomat_livingston_neutral.png'], [C.dedh + 0.15, 'diplomat_livingston_shocked.png'], [C.mauka - 0.1, 'diplomats_nod.png']]} />
      <Actor t={t} t0={t0 + 0.22} t1={C.mauka - 0.12} x={420} y={1420} h={400} poses={[[0, 'diplomat_monroe_neutral.png'], [C.dedh + 0.25, 'diplomat_monroe_shocked.png']]} />
      <Actor t={t} t0={t0 + 0.3} t1={t1} x={830} y={1410} h={440} poses={[[0, 'napoleon_smirk.png'], [C.dedh - 0.1, 'napoleon_handshake.png']]} flip />
      <Stamp t={t} t0={C.ijazat - 0.05} t1={C.mauka + 0.2} text="इजाज़त नहीं!" x={540} y={520} />
    </AbsoluteFill>
  );
};

/** VHS-style rewind between "कैसे?" and "1802". */
const Rewind: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.kaise + 0.4, C.kaise + 0.55, C.y1802 - 0.35, C.y1802 - 0.1);
  if (a <= 0) return null;
  const jit = Math.sin(t * 90) * 6;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)', transform: `translateY(${(t * 400) % 6}px)` }} />
      <AbsoluteFill style={{ background: 'rgba(30,40,60,0.25)', mixBlendMode: 'multiply' }} />
      <div style={{ position: 'absolute', left: 540 + jit, top: 920, transform: 'translate(-50%,-50%)', display: 'flex', gap: 6, filter: glow('rgba(255,255,255,0.8)', 6, 2) }}>
        {[0, 1, 2].map((i) => {
          const on = (Math.floor(t * 8) + i) % 3 !== 0;
          return <svg key={i} width={90} height={110} style={{ opacity: on ? 1 : 0.35 }}><path d="M85,8 L15,55 L85,102 Z" fill="#fff" /></svg>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the screen layer
export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const dc = S(c, -77, 38.9);
  const nola = S(c, -90.07, 29.95);
  const lou = S(c, -99, 41.5);
  const fr = S(c, 2.3, 46.8);
  const uk = S(c, -1.8, 52.6);
  const ht = S(c, -72.6, 19.0);
  // tiny workers filling the island ("लाखों लोग")
  const crowd = Array.from({ length: 22 }, (_, i) => {
    const r = (k: number) => {
      const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
      return v - Math.floor(v);
    };
    const lon = -74.2 + r(1) * 2.6;
    const lat = 18.3 + r(2) * 1.4 + (lon < -73 ? -0.3 : 0.2);
    return { lon, lat, d: r(3) * 0.9 };
  });
  return (
    <AbsoluteFill>
      {/* ---- hook: two diplomats sent for one city */}
      <Pin t={t} t0={C.shahar - 0.1} t1={C.kaise + 0.3} x={nola[0]} y={nola[1]} />
      <Label text="न्यू ऑर्लियंस" t={t} t0={C.shahar} t1={C.poora - 0.1} x={nola[0]} y={nola[1] - 95} size={46} />
      <Actor t={t} t0={C.do - 0.15} t1={C.bhejo + 0.1} x={dc[0] - 40} y={dc[1]} h={220} poses={[[0, 'diplomat_livingston_neutral.png']]} />
      <Actor t={t} t0={C.do} t1={C.bhejo + 0.1} x={dc[0] + 70} y={dc[1] + 10} h={210} poses={[[0, 'diplomat_monroe_neutral.png']]} />
      <Actor t={t} t0={C.bhejo} t1={C.poora + 0.2} x={S(c, -70, 38)[0]} y={S(c, -70, 38)[1]} h={170} poses={[[0, 'ship_small.png']]} shadow={false} bob={3}
        path={{ t0: C.bhejo, t1: C.poora + 0.2, x: S(c, -15, 44)[0], y: S(c, -15, 44)[1], hops: 0 }} />
      <Actor t={t} t0={C.louis + 0.3} t1={C.kaise + 0.3} x={lou[0] + 160} y={lou[1] + 380} h={240} poses={[[0, 'diplomats_nod.png'], [C.louis + 0.3, 'diplomats_nod.png']]} />
      <PriceTag t={t} t0={C.daam - 0.5} t1={C.kaise + 0.3} x={lou[0] - 120} y={lou[1] - 260} text="$10M" w={200} strike={C.daam + 0.25} />
      <PriceTag t={t} t0={C.daam + 0.25} t1={C.kaise + 0.3} x={lou[0] + 120} y={lou[1] - 200} text="$15M" w={230} />
      <Rewind t={t} />

      {/* ---- 1802: France and Britain shake hands, swords behind their backs */}
      <Year text="1802" t={t} t0={C.y1802} t1={C.jung + 0.2} />
      <Actor t={t} t0={C.sulah - 0.5} t1={C.udhar + 0.1} x={uk[0] - 60} y={uk[1] + 170} h={300} poses={[[0, 'briton_handshake.png']]} flip
        path={{ t0: C.sulah - 0.3, t1: C.sulah + 0.6, x: uk[0] + 10, y: uk[1] + 230, hops: 2 }} />
      <Actor t={t} t0={C.sulah - 0.4} t1={C.udhar + 0.1} x={fr[0] + 60} y={fr[1] + 40} h={300} poses={[[0, 'napoleon_handshake.png']]}
        path={{ t0: C.sulah - 0.3, t1: C.sulah + 0.6, x: fr[0] - 10, y: fr[1] - 10, hops: 2 }} />
      <Glint t={t} t0={C.brk - 0.1} x={uk[0] - 70} y={uk[1] + 110} s={1.2} />
      <Glint t={t} t0={C.brk + 0.05} x={fr[0] + 80} y={fr[1] - 120} s={1.2} />

      {/* ---- Napoleon's Louisiana and his plan */}
      <Label text="लुईज़ियाना" t={t} t0={C.louis4 - 0.05} t1={C.plan + 0.2} x={lou[0]} y={lou[1] - 150} size={66} color="#FFE07A" arrow />
      <Actor t={t} t0={C.plan - 0.2} t1={C.chaabi + 0.3} x={lou[0] + 30} y={lou[1] + 200} h={300} poses={[[0, 'napoleon_neutral.png'], [C.samrajya - 0.4, 'napoleon_smirk.png']]} />
      <Thought t={t} t0={C.samrajya - 0.3} t1={C.chaabi + 0.2} x={lou[0] + 90} y={lou[1] - 120} />

      {/* ---- Saint-Domingue: the money machine */}
      <Label text="सेंट डॉमिंग" t={t} t0={C.saint - 0.05} t1={C.paise} x={ht[0]} y={ht[1] - 180} size={70} color="#fff" />
      <Label text="(आज का हैती)" t={t} t0={C.haiti - 0.1} t1={C.paise} x={ht[0]} y={ht[1] - 95} size={52} color="#FFE07A" arrow />
      <Actor t={t} t0={C.paise - 0.05} t1={C.cheeni - 0.1} x={ht[0]} y={ht[1] + 60} h={250} poses={[[0, 'money_pile.png']]} shadow={false} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Glint key={i} t={t} t0={C.paise + 0.1 + i * 0.13} x={ht[0] - 160 + i * 64} y={ht[1] - 40 - (i % 2) * 70} s={0.7} />
      ))}
      <Actor t={t} t0={C.cheeni - 0.15} t1={C.laakhon - 0.1} x={ht[0] + 10} y={ht[1] + 70} h={230} poses={[[0, 'sacks_sugar_coffee.png']]} shadow={false} />
      {crowd.map((p, i) => {
        const [x, y] = S(c, p.lon, p.lat);
        return <Actor key={i} t={t} t0={C.laakhon - 0.2 + p.d} t1={C.haan - 0.05} x={x} y={y} h={112} poses={[[0, 'worker_chained.png']]} bob={2} shadow={false} />;
      })}

      {/* ---- हाँ, गुलामी … बगावत */}
      <Insert t={t} t0={C.haan - 0.15} t1={C.control - 0.35} bg="scene_plantation.png">
        <Actor t={t} t0={C.haan + 0.05} t1={C.bagawat - 0.1} x={540} y={1330} h={620} poses={[[0, 'worker_chained.png']]} bob={3} />
        <Actor t={t} t0={C.toota - 0.05} t1={C.bagawat + 0.3} x={560} y={1180} h={190} poses={[[0, 'chain_broken.png']]} shadow={false} rot={-8} />
        <Actor t={t} t0={C.bagawat - 0.05} t1={C.control - 0.35} x={540} y={1360} h={430} poses={[[0, 'rebels_rise.png']]} bob={8} />
      </Insert>
      <Label text="बगावत" t={t} t0={C.control - 0.2} t1={C.napo9} x={ht[0]} y={ht[1] - 150} size={72} color="#FFB0A0" />

      {/* ---- the fleet, then the beach */}
      {[0, 1, 2].map((i) => (
        <Actor key={i} t={t} t0={C.napo9 + 0.3 + i * 0.12} t1={C.shuru9 - 0.15} x={S(c, -4.5 - i * 2, 47 - i)[0]} y={S(c, -4.5 - i * 2, 47 - i)[1]} h={130} poses={[[0, 'ship_warship.png']]} flip shadow={false} bob={3}
          path={{ t0: C.napo9 + 0.4 + i * 0.12, t1: C.shuru9 - 0.25, x: S(c, -70 + i * 2.5, 21 + i)[0], y: S(c, -70 + i * 2.5, 21 + i)[1], hops: 0 }} />
      ))}
      <Insert t={t} t0={C.shuru9 - 0.3} t1={C.dweep - 0.3} bg="scene_beach.png" dir={-1}>
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <Actor t={t} t0={C.shuru9 - 0.05 + i * 0.08} t1={C.hissa + i * 0.15} x={210 + i * 220} y={1330 + (i % 2) * 40} h={360}
              poses={[[0, 'french_soldier.png'], [C.peela + i * 0.12, 'french_soldier_sick.png']]} bob={4} />
            <Actor t={t} t0={C.hissa + 0.1 + i * 0.15} t1={C.dweep} x={210 + i * 220} y={1340 + (i % 2) * 40} h={150} poses={[[0, 'french_soldier_fallen.png']]} />
          </React.Fragment>
        ))}
      </Insert>
      <Label text="पीला बुखार" t={t} t0={C.peela} t1={C.hissa + 0.6} x={540} y={560} size={84} color="#FFE45A" />
      <Label text="हैती" t={t} t0={C.dweep + 0.3} t1={C.saint11 + 0.2} x={ht[0]} y={ht[1] - 140} size={80} color="#C9F7C0" />

      {/* ---- Louisiana now pointless */}
      <Actor t={t} t0={C.matlab - 0.3} t1={C.vyapar + 0.1} x={lou[0]} y={lou[1] + 230} h={300} poses={[[0, 'napoleon_shrug.png']]} />

      {/* ---- the Mississippi trade */}
      {[0, 1, 2, 3, 4].map((i) => {
        const pts = GEO.mississippi;
        const u = ((t - C.miss - 0.4 - i * 0.55) / 4.2);
        if (u < 0 || u > 1 || t > C.neworl2) return null;
        const k = Math.min(pts.length - 1, Math.floor((1 - u) * (pts.length - 1)));
        const [x, y] = toScreen(c, pts[k]);
        return <Actor key={i} t={t} t0={C.miss + 0.4 + i * 0.55} t1={C.neworl2 - 0.1} x={x} y={y + 30} h={70} poses={[[0, i % 2 ? 'cargo_barrel.png' : 'cargo_crate.png']]} shadow={false} bob={3} />;
      })}
      <Pin t={t} t0={C.neworl - 0.1} t1={C.jeff} x={nola[0]} y={nola[1]} />
      <Label text="न्यू ऑर्लियंस" t={t} t0={C.neworl2 - 0.1} t1={C.jeff} x={nola[0]} y={nola[1] - 100} size={56} />
      <Flag t={t} t0={C.france12 - 0.1} t1={C.jeff} x={nola[0] + 40} y={nola[1] - 20} h={130} />

      {/* ---- 1803: Jefferson's offer */}
      <Year text="1803" t={t} t0={C.jeff - 0.1} t1={C.dipl + 0.3} y={560} size={180} />
      <Actor t={t} t0={C.jeff} t1={C.britain14} x={dc[0] - 150} y={dc[1] + 80} h={270} poses={[[0, 'jefferson_neutral.png'], [C.badle - 0.2, 'jefferson_briefcase.png']]} />
      <Actor t={t} t0={C.dipl} t1={C.britain14} x={dc[0] + 30} y={dc[1] + 60} h={240} poses={[[0, 'diplomat_livingston_neutral.png']]} />
      <Actor t={t} t0={C.dipl + 0.1} t1={C.britain14} x={dc[0] + 160} y={dc[1] + 80} h={230} poses={[[0, 'diplomat_monroe_neutral.png']]} />
      <PriceTag t={t} t0={C.crore - 0.2} t1={C.britain14} x={dc[0] - 40} y={dc[1] - 140} text="$10M" w={190} />

      {/* ---- war with Britain, money, too far to defend */}
      <Swords t={t} t0={C.jung14 - 0.15} t1={C.paisa + 0.3} x={(S(c, -2, 51)[0] + S(c, 2.5, 47.5)[0]) / 2} y={S(c, 0, 50)[1] - 60} />
      <Actor t={t} t0={C.paisa - 0.1} t1={C.chaunk - 0.1} x={fr[0] + 40} y={fr[1] + 120} h={260} poses={[[0, 'napoleon_smirk.png']]} />
      <Actor t={t} t0={C.paisa + 0.15} t1={C.door + 0.2} x={fr[0] - 120} y={fr[1] + 140} h={150} poses={[[0, 'money_pile.png']]} shadow={false} />
      <Label text="बहुत दूर!" t={t} t0={C.namumkin - 0.3} t1={C.chaunk} x={S(c, -45, 34)[0]} y={S(c, -45, 34)[1] - 40} size={66} color="#FFB0A0" />

      {/* ---- the map room in Paris */}
      <MapRoom t={t} />

      {/* ---- SOLD, doubling, India, under 3 cents */}
      <SoldSign t={t} x={lou[0] + 40} y={lou[1] + 40} />
      <Counter t={t} t0={C.dugna - 0.15} t1={C.bharat} text={() => '×2'} x={540} y={520} size={180} glowC="#7FF2E6" dur={0.3} />
      <Label text="भारत का 2/3" t={t} t0={C.tihai - 0.05} t1={DURATION_S + 1} x={540} y={540} size={74} color="#FFD45A" />
      <Actor t={t} t0={C.cent - 0.15} t1={DURATION_S + 1} x={330} y={1360} h={170} poses={[[0, 'coin_gold.png']]} shadow={false} />
      <Counter t={t} t0={C.cent - 0.05} t1={DURATION_S + 1} text={(p) => `<${Math.max(1, Math.round(3 * p))}¢ / एकड़`} font={FONT} x={640} y={1290} size={96} glowC="#FFCF4A" dur={0.6} />
    </AbsoluteFill>
  );
};

/** Real-estate sign on Louisiana: "बिकाऊ" flips to "बिक गया!". */
const SoldSign: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  const t0 = C.haan16 - 0.3;
  const t1 = C.ekdin + 0.4;
  if (t < t0 || t > t1 + 0.3) return null;
  const s = pop(t, t0, 9, 190) * (1 - ramp(t, t1, t1 + 0.3, easeIn));
  const flip = ramp(t, C.haan16 + 0.35, C.haan16 + 0.6, inOut);
  const sold = flip > 0.5;
  const [iw, ih] = SZ['sign_blank.png'];
  const w = 330;
  const h = (w * ih) / iw;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: 'absolute', left: -w * 0.3, top: -h, width: w, height: h, transformOrigin: '30% 100%', transform: `scale(${Math.max(0, s)}) rotate(${kick(t, t0 + 0.2, 4, 14, 5)}deg)`, filter: 'drop-shadow(0 6px 8px rgba(30,15,5,0.45))' }}>
        <img src={img('sign_blank.png')} style={{ width: w, height: h }} />
        <div style={{ position: 'absolute', left: '28%', top: '33%', width: '66%', height: '36%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scaleY(${Math.abs(1 - 2 * flip)})`, fontFamily: SERIF, fontWeight: 900, fontSize: 52, color: sold ? '#fff' : '#9a1d1d',
          background: sold ? '#C42A2A' : 'transparent', borderRadius: 8 }}>{sold ? 'बिक गया!' : 'बिकाऊ'}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- frame-level
/** The map is hidden while a full-screen insert covers it. */
export const mapHidden = (t: number) =>
  (t > C.haan + 0.15 && t < C.control - 0.4) || (t > C.shuru9 && t < C.dweep - 0.35) || (t > C.chaunk + 0.25 && t < C.haan16 - 0.4);

export const satAt = (t: number) => window4(t, C.saint - 0.2, C.saint + 0.5, C.bina + 0.2, C.haan);

export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.y1802, 12], [C.jeff - 0.1, 9], [C.toota, 12], [C.jung14, 10], [C.ijazat, 14], [C.dedh, 8], [C.dugna, 8]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

/** Paper vignette, a warm grade, grain, flashes. */
export const Grade: React.FC<{ t: number }> = ({ t }) => {
  const flash = Math.max(
    window4(t, C.y1802 - 0.04, C.y1802, C.y1802 + 0.03, C.y1802 + 0.2),
    window4(t, C.toota - 0.03, C.toota, C.toota + 0.03, C.toota + 0.2),
    window4(t, C.ekdin - 0.03, C.ekdin, C.ekdin + 0.03, C.ekdin + 0.25) * 0.6,
  );
  const gx = (Math.floor(t * 30) * 137) % 512;
  const gy = (Math.floor(t * 30) * 241) % 512;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(40,24,8,0.42) 100%)' }} />
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile('elnino/fx/noise_b.png')})`, backgroundPosition: `${gx}px ${gy}px`, backgroundSize: '256px 256px', opacity: 0.05, mixBlendMode: 'overlay' }} />
      {flash > 0 && <AbsoluteFill style={{ background: '#fff', opacity: flash * 0.5, mixBlendMode: 'screen' }} />}
    </AbsoluteFill>
  );
};

export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  const end = DURATION_S - 0.4;
  if (i < 0 || t > end) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : end;
  const a = (i === 0 ? 1 : ramp(t, t0, t0 + 0.1, linear)) * (1 - ramp(t, t1 - 0.02, t1, linear));
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: 1500, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.25,
      color: '#fff', opacity: a, transform: `translateY(${(1 - ramp(t, t0, t0 + 0.14)) * 8}px)`,
      textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.45)' }}>{text}</div>
  );
};
