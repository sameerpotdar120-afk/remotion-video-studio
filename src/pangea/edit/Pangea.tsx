import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, kick, linear, pop, ramp } from '../../darien/anim';
import { C, CAPS, Cam, DURATION_S, EVEREST, GEO, HOOK_FF1, LOOPF, P, PIECES, PIN, Piece, Pose, TODAY, camAt, camSpeed, onCanvas, poseAt, rollAt, satKm, shake, toS } from './cam';
import { Crumble, Cut, Hue, Pin, Slab } from './Studio';
import { HAVE } from './assets';
import { LABEL, SERIF, TITLE, UI, useFonts } from './font';

export const PG_DURATION_S = DURATION_S;
const AUDIO = 'pangea/audio/mix.wav';
const INK = '#2A1A08';
const DARK = '#0B1830';
export const COL = { gold: '#FFC21A', india: '#FF9933', red: '#FF4A3A', sea: '#3E8FA0', tethys: '#2FB7D6', heat: '#FF5A1F' };
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));
const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// ------------------------------------------------------------------ type
export const Big: React.FC<{ text: React.ReactNode; size: number; color?: string; font?: string; ink?: string }> = ({ text, size, color = '#fff', font = TITLE, ink = DARK }) => (
  <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 11)}px ${ink}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const Tag: React.FC<{ text: React.ReactNode; color?: string; size?: number; font?: string }> = ({ text, color = COL.gold, size = 46, font = UI }) => (
  <div style={{ padding: `${size * 0.1}px ${size * 0.5}px`, background: 'rgba(10,15,22,0.88)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: '#fff', whiteSpace: 'nowrap', boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: o }}>{children}</div>;
/** An old-map label with an arrow down (the Mumbai reel's place labels). */
const MapLabel: React.FC<{ text: string; color?: string; size?: number }> = ({ text, color = '#FFE7A0', size = 50 }) => (
  <div style={{ textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.1, color, WebkitTextStroke: `${size / 7}px ${INK}`, paintOrder: 'stroke fill', textShadow: '0 6px 14px rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>
    {text}<div style={{ fontSize: size * 0.8, lineHeight: 0.9 }}>↓</div>
  </div>
);

// ------------------------------------------------------------------ the satellite plate ("today")
const PLATE = staticFile('pangea/maps/india_geo.jpg');
const WORLD = staticFile('pangea/maps/world_geo.jpg');
let preloaded: Promise<unknown> | null = null;
const usePreload = () => {
  const [h] = React.useState(() => delayRender('pg plate'));
  React.useEffect(() => {
    if (!preloaded) preloaded = Promise.all([PLATE, WORLD].map((src) => { const i = new Image(); i.src = src; return i.decode().catch(() => undefined); }));
    preloaded.then(() => continueRender(h));
  }, [h]);
};
const Satellite: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  usePreload();
  const [b0, b1, b2, b3] = GEO.plate.bounds;
  const [l, tp] = toS(c, satKm([b0, b3])), [r, bt] = toS(c, satKm([b2, b1]));
  const W = GEO.plate_world.bounds;
  const [wl, wt] = toS(c, satKm([W[0], W[3]])), [wr, wb] = toS(c, satKm([W[2], W[1]]));
  const FEATHER = 'linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent), linear-gradient(180deg, transparent, #000 4%, #000 96%, transparent)';
  const india = GEO.india_merc.map((ring) => ring.map((m, i) => { const [x, y] = toS(c, satKm(m)); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join('') + 'Z').join('');
  // the hook: India rises as a red slab on "par hamara Bharat", slides north-east on "har saal… khisak", hits Asia
  const g = ramp(t, C.par - 0.1, C.par + 0.35, easeOut) * (1 - ramp(t, C.n25 + 0.1, C.n25 + 0.5, linear));
  const slide = 70 * ramp(t, C.harsaal - 0.1, C.khisak + 0.1, inOut) * (1 - ramp(t, C.khisak + 0.5, C.n25 + 0.3, inOut));
  const jit = kick(t, C.khisak, 9, 34, 7);
  const [cx, cy] = toS(c, [TODAY.india[0], TODAY.india[1]]);
  const sc = 0.96 + 0.06 * pop(t, C.par - 0.05, 9, 190);
  const ghost = clamp01(slide / 12) * g;
  const him = GEO.himalaya.map((p, i) => { const [x, y] = toS(c, onCanvas(TODAY.india, p)); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join('');
  const flash = win(t, C.khisak - 0.05, C.n25 + 0.2, 0.08, 0.6) * (0.75 + 0.25 * Math.sin((t - C.khisak) * 30));
  const arrows = win(t, C.harsaal - 0.1, C.n25 + 0.1, 0.3, 0.3);
  return (
    <AbsoluteFill style={{ background: '#0E3A57', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${WORLD})`, backgroundSize: `${wr - wl}px ${wb - wt}px`, backgroundPosition: `${wl}px ${wt}px`, backgroundRepeat: 'no-repeat', filter: 'contrast(1.1) saturate(1.2) brightness(1.03)' }} />
      <div style={{ position: 'absolute', left: l, top: tp, width: r - l, height: bt - tp, backgroundImage: `url(${PLATE})`, backgroundSize: '100% 100%', filter: 'contrast(1.1) saturate(1.2) brightness(1.03)',
        WebkitMaskImage: FEATHER, WebkitMaskComposite: 'source-in', maskImage: FEATHER, maskComposite: 'intersect' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 55% 50%, rgba(0,10,25,0.15), rgba(0,10,25,0.7))', opacity: 0.85 * g }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={india} fill="none" stroke="#fff" strokeWidth={3} opacity={0.6 * (1 - g)} strokeLinejoin="round" />
        {ghost > 0.01 && <path d={india} fill="rgba(255,255,255,0.08)" stroke="#fff" strokeWidth={4} strokeDasharray="16 12" opacity={0.8 * ghost} strokeLinejoin="round" />}
        <Slab d={india} hue="red" g={g} t={t} id="satin" depth={22} cx={cx} cy={cy} s={sc} dx={slide * 0.55 + jit} dy={-slide * 0.83 + jit * 0.6} />
        {flash > 0 && <>
          <path d={him} fill="none" stroke="#FF3B1F" strokeWidth={34} strokeLinecap="round" opacity={0.55 * flash} filter="url(#bl_satin)" />
          <path d={him} fill="none" stroke="#FFD27A" strokeWidth={10} strokeLinecap="round" opacity={flash} />
        </>}
        {arrows > 0 && [0, 1, 2].map((k) => {
          const p = (t * 0.8 + k / 3) % 1, x = cx - 60 + (k - 1) * 170 + 150 * p * 0.55, y = cy + 120 - 150 * p * 0.83 + Math.abs(k - 1) * 90;
          const o = arrows * Math.sin(p * Math.PI);
          return (
            <g key={k} transform={`translate(${x} ${y}) rotate(33.5)`} opacity={o}>
              <path d="M-22,70 L-22,0 L-50,0 L0,-62 L50,0 L22,0 L22,70Z" fill="#fff" stroke="#7A0008" strokeWidth={6} strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the old map (past and future)
const ringsAt = (c: Cam, pose: Pose, rings: P[][]) => rings.map((ring) => ring.map((p, i) => { const [x, y] = toS(c, onCanvas(pose, p)); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join('') + 'Z').join('');
const FILLS: { k: Piece; cue: () => number; end: () => number; hue: Hue }[] = [
  { k: 'india', cue: () => C.aur_bharat, end: () => C.n5cr, hue: 'red' },
  { k: 'eurasia', cue: () => C.asia, end: () => C.africa, hue: 'blue' },
  { k: 'africa', cue: () => C.africa, end: () => C.toota + 0.6, hue: 'blue' },
  { k: 'madagascar', cue: () => C.africa, end: () => C.toota + 0.6, hue: 'blue' },
  { k: 'antarctica', cue: () => C.antarc, end: () => C.toota + 0.6, hue: 'blue' },
  { k: 'australia', cue: () => C.austr, end: () => C.toota + 0.6, hue: 'blue' },
  { k: 'samerica', cue: () => C.america, end: () => C.n25b, hue: 'blue' },
  { k: 'namerica', cue: () => C.america, end: () => C.n25b, hue: 'blue' },
  { k: 'africa', cue: () => C.africa2, end: () => C.n25b, hue: 'blue' },
  { k: 'australia', cue: () => C.austr2, end: () => C.n25b, hue: 'blue' },
  { k: 'eurasia', cue: () => C.asia2, end: () => C.n25b, hue: 'blue' },
  { k: 'india', cue: () => C.ultima + 0.3, end: () => C.n2023, hue: 'red' },
  { k: 'india', cue: () => C.yani, end: () => C.safar + 0.8, hue: 'red' },
];
export const OldMap: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const heat = Math.max(ramp(t, C.n40 - 1.2, C.n70 + 0.4, inOut) * (1 - ramp(t, C.safar - 0.4, C.kyunki + 0.3, inOut)), 0.85 * win(t, C.yahi - 0.6, C.karib30 + 0.4, 0.8, 0.6));
  const future = Math.max(ramp(t, C.model, C.model + 1.2, inOut), win(t, C.n25, C.karib30 + 0.5, 0.6, 0.7));
  const land = `rgb(${Math.round(233 + 10 * heat)}, ${Math.round(207 - 95 * heat)}, ${Math.round(152 - 110 * heat)})`;
  // graticule: every 1,500 km on the canvas
  const lines: string[] = [];
  const step = 1500;
  const x0 = c.x - 540 * c.kpp, x1 = c.x + 540 * c.kpp, y0 = c.y - 960 * c.kpp, y1 = c.y + 960 * c.kpp;
  for (let x = Math.ceil(x0 / step) * step; x < x1; x += step) { const sx = 540 + (x - c.x) / c.kpp; lines.push(`M${sx.toFixed(1)},0V1920`); }
  for (let y = Math.ceil(y0 / step) * step; y < y1; y += step) { const sy = 960 + (y - c.y) / c.kpp; lines.push(`M0,${sy.toFixed(1)}H1080`); }
  const paths = PIECES.map((k) => ({ k, d: ringsAt(c, poseAt(t, k), GEO.pieces[k]) }));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #6FB0AA, #4A8E8C 55%, #2F6A70)`, overflow: 'hidden' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="paper" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#fff6dc" stopOpacity="0.35" /><stop offset="1" stopColor="#8a5a20" stopOpacity="0.25" /></radialGradient>
        </defs>
        <path d={lines.join('')} stroke="#E8F4EE" strokeOpacity={0.16} strokeWidth={2} fill="none" />
        {paths.map(({ k, d }) => <path key={`s${k}`} d={d} fill="#173E44" opacity={0.28} transform="translate(8 14)" />)}
        {paths.map(({ k, d }) => <path key={`w${k}`} d={d} fill="none" stroke="#BFE6E0" strokeOpacity={0.35} strokeWidth={14} strokeLinejoin="round" />)}
        {paths.map(({ k, d }) => <path key={k} d={d} fill={land} stroke="#6B4A22" strokeWidth={2.6} strokeLinejoin="round" />)}
        {paths.map(({ k, d }) => <path key={`p${k}`} d={d} fill="url(#paper)" />)}
        {FILLS.map((f, i) => {
          const g = ramp(t, f.cue() - 0.15, f.cue() + 0.35, easeOut) * (1 - ramp(t, f.end() - 0.4, f.end(), linear));
          if (g <= 0) return null;
          const pose = poseAt(t, f.k);
          const d = f.k === 'india' ? ringsAt(c, pose, GEO.india_country) : paths.find((p) => p.k === f.k)!.d;
          const [cx, cy] = toS(c, [pose[0], pose[1]]);
          return <Slab key={i} d={d} hue={f.hue} g={g} t={t} id={`f${i}`} depth={14} cx={cx} cy={cy} s={0.97 + 0.04 * pop(t, f.cue() - 0.1, 9, 190)} />;
        })}
      </svg>
      {HAVE.x_paper && <AbsoluteFill style={{ backgroundImage: `url(${staticFile('pangea/img/x_paper.png')})`, backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply', opacity: 0.55 }} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,90,30,0.0), rgba(160,30,10,0.45))', opacity: future * 0.3 + heat * 0.12, mixBlendMode: 'multiply' }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Tethys, the crash and the Himalaya
const Tethys: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const o = ramp(t, C.beech - 0.1, C.tethys + 0.1, easeOut) * (1 - ramp(t, C.takraya - 0.6, C.takraya, linear));
  if (o <= 0) return null;
  const [ix, iy] = toS(c, onCanvas(poseAt(t, 'india'), [0, -1100]));
  const [ax, ay] = toS(c, [8300, -3600]);
  const cx = (ix + ax) / 2, cy = (iy + ay) / 2;
  const rx = Math.max(60, Math.abs(ax - ix) * 0.5 + 280 / (c.kpp / 5)), ry = Math.max(40, Math.abs(ay - iy) * 0.42);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={COL.tethys} opacity={0.42} />
        {[0, 1, 2, 3].map((k) => {
          const y = cy - ry * 0.5 + k * ry * 0.33, sh = 30 * Math.sin(t * 3 + k);
          return <path key={k} d={`M${cx - rx * 0.55 + sh},${y} q30,-18 60,0 t60,0 t60,0`} stroke="#E8FFFF" strokeWidth={5} fill="none" opacity={0.7} strokeLinecap="round" />;
        })}
      </svg>
      <At x={cx} y={cy - ry - 40} p={pop(t, C.tethys - 0.1, 10, 200)}><MapLabel text="टेथिस सागर" color="#BFF4FF" size={58} /></At>
    </>
  );
};
const Ridge: React.FC<{ c: Cam; t: number }> = ({ c, t }) => {
  const g = ramp(t, C.farsh - 0.2, C.bana + 0.3, inOut);
  const o = 1 - ramp(t, C.everest - 0.6, C.everest, linear) + ramp(t, C.himalaya2 - 0.4, C.himalaya2, linear) * (1 - ramp(t, C.kyunki - 0.8, C.kyunki, linear));
  if (g <= 0 || o <= 0) return null;
  const pose = poseAt(t, 'india');
  const pts = GEO.himalaya.map((p) => toS(c, onCanvas(pose, p)));
  const peaks: React.ReactNode[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    for (let k = 0; k < 3; k++) {
      const f = (k + 0.5) / 3;
      const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
      const h = (34 + 30 * rnd(i, k)) * g * Math.min(1.6, 2.4 / c.kpp + 0.3), w = h * 0.9;
      peaks.push(<g key={`${i}_${k}`}><path d={`M${x - w},${y + h * 0.3} L${x},${y - h} L${x + w},${y + h * 0.3}Z`} fill="#8A6236" stroke={INK} strokeWidth={2.5} /><path d={`M${x - w * 0.32},${y - h * 0.55} L${x},${y - h} L${x + w * 0.32},${y - h * 0.55}Z`} fill="#fff" /></g>);
    }
  }
  const [lx, ly] = pts[5];
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: clamp01(o) }}>{peaks}</svg>
      {t > C.himalaya - 0.2 && <At x={lx} y={ly - 150} p={pop(t, C.himalaya - 0.1, 10, 200)} o={clamp01(o)}><MapLabel text="हिमालय" size={64} /></At>}
    </>
  );
};
const Crash: React.FC<{ t: number }> = ({ t }) => {
  const d = t - C.takraya;
  if (d < -0.05 || d > 0.7) return null;
  const o = d < 0 ? 0 : Math.exp(-5 * d);
  return <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 42%, rgba(255,255,240,0.95), rgba(255,200,120,0.4) 30%, rgba(255,140,60,0) 60%)', opacity: o }} />;
};

// ------------------------------------------------------------------ props drawn in code
const Ammonite: React.FC<{ s: number; color?: string; stroke?: string; rot?: number }> = ({ s, color = '#D9B77A', stroke = '#5A3A14', rot = 0 }) => {
  const pts: string[] = [], ribs: string[] = [];
  for (let i = 0; i <= 260; i++) {
    const a = i * 0.075, r = 4 * Math.exp(0.19 * a);
    pts.push(`${i ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`);
    if (i % 6 === 0 && i > 30) { const r2 = r * 0.72; ribs.push(`M${(r2 * Math.cos(a)).toFixed(1)},${(r2 * Math.sin(a)).toFixed(1)}L${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`); }
  }
  return (
    <svg width={260 * s} height={260 * s} viewBox="-130 -130 260 260" style={{ overflow: 'visible', transform: `rotate(${rot}deg)` }}>
      <circle r={118} fill={color} stroke={stroke} strokeWidth={6} />
      <path d={pts.join('')} fill="none" stroke={stroke} strokeWidth={6} strokeLinecap="round" />
      <path d={ribs.join('')} stroke={stroke} strokeWidth={3} opacity={0.75} />
      <circle r={118} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={4} transform="translate(-4 -4)" />
    </svg>
  );
};
/** A shaligram (a black ammonite stone) on a brass plate with a lamp. */
const Shaligram: React.FC<{ t: number; split: number }> = ({ t, split }) => (
  <svg width={720} height={620} viewBox="-360 -340 720 620" style={{ overflow: 'visible' }}>
    <defs>
      <radialGradient id="brass" cx="45%" cy="35%" r="70%"><stop offset="0" stopColor="#FFE9A0" /><stop offset="0.5" stopColor="#D9A43A" /><stop offset="1" stopColor="#8A5A12" /></radialGradient>
      <radialGradient id="stone" cx="38%" cy="30%" r="75%"><stop offset="0" stopColor="#5A5A5E" /><stop offset="0.45" stopColor="#1E1E22" /><stop offset="1" stopColor="#050506" /></radialGradient>
      <radialGradient id="glowL" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FFD27A" stopOpacity="0.9" /><stop offset="1" stopColor="#FF9A2A" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse cx={0} cy={200} rx={330} ry={70} fill="url(#brass)" stroke="#6A4208" strokeWidth={5} />
    <ellipse cx={0} cy={190} rx={280} ry={50} fill="none" stroke="#FFF2C0" strokeOpacity={0.5} strokeWidth={4} />
    <g transform={`translate(${-split * 120},0) rotate(${-split * 8})`}>
      <ellipse cx={0} cy={40} rx={170} ry={165} fill="url(#stone)" stroke="#000" strokeWidth={4} />
      <path d="M-60,-40 q50,-40 95,10" stroke="#9a9aa0" strokeOpacity={0.45} strokeWidth={8} fill="none" strokeLinecap="round" />
      <circle cx={-60} cy={110} r={12} fill="#E8402A" opacity={0.85} />
    </g>
    {split > 0 && <g transform={`translate(${split * 140},20)`} opacity={split}><Ammonite s={1.2} color="#3A3A40" stroke="#C9B48A" /></g>}
    <g transform="translate(250,150)">
      <circle cx={0} cy={-46} r={70 + 6 * Math.sin(t * 9)} fill="url(#glowL)" />
      <path d="M-34,0 q34,26 68,0 l-10,-14 h-48z" fill="url(#brass)" stroke="#6A4208" strokeWidth={3} />
      <path d={`M0,-14 q${-12 + 3 * Math.sin(t * 13)},-22 0,-46 q${12 + 3 * Math.sin(t * 11)},22 0,46z`} fill="#FFB52A" stroke="#FF7A1A" strokeWidth={2} />
    </g>
  </svg>
);
const Gauge: React.FC<{ v: number; max: number; label: string }> = ({ v, max, label }) => {
  const a = -120 + 240 * Math.min(1, v / max);
  return (
    <svg width={320} height={250} viewBox="-160 -150 320 250">
      <path d="M-130,40 A140,140 0 1 1 130,40" fill="rgba(10,15,22,0.85)" stroke="#fff" strokeWidth={6} />
      {Array.from({ length: 9 }, (_, i) => { const b = ((-120 + i * 30 - 90) * Math.PI) / 180; return <line key={i} x1={Math.cos(b) * 112} y1={Math.sin(b) * 112} x2={Math.cos(b) * 128} y2={Math.sin(b) * 128} stroke={i > 6 ? COL.red : '#fff'} strokeWidth={6} />; })}
      <line x1={0} y1={0} x2={Math.cos(((a - 90) * Math.PI) / 180) * 100} y2={Math.sin(((a - 90) * Math.PI) / 180) * 100} stroke={COL.gold} strokeWidth={10} strokeLinecap="round" />
      <circle r={14} fill={COL.gold} />
      <text x={0} y={80} textAnchor="middle" fontFamily={TITLE} fontSize={46} fill="#fff">{label}</text>
    </svg>
  );
};
const Thermo: React.FC<{ v: number }> = ({ v }) => {
  const h = 340 * clamp01((v - 10) / 65);
  return (
    <svg width={170} height={520} viewBox="-85 -440 170 520">
      <rect x={-34} y={-420} width={68} height={420} rx={34} fill="rgba(255,255,255,0.92)" stroke={DARK} strokeWidth={6} />
      <circle cx={0} cy={20} r={62} fill={COL.heat} stroke={DARK} strokeWidth={6} />
      <rect x={-18} y={-h - 10} width={36} height={h + 30} fill={COL.heat} />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={14} x2={34} y1={-70 - i * 80} y2={-70 - i * 80} stroke={DARK} strokeWidth={5} />)}
    </svg>
  );
};
const Mammal: React.FC<{ kind: number; s?: number }> = ({ kind, s = 1 }) => (
  <svg width={150 * s} height={120 * s} viewBox="-75 -70 150 120">
    {kind === 0 && <g fill="#2A1A0E">{/* elephant */}<ellipse cx={0} cy={0} rx={48} ry={32} /><circle cx={44} cy={-14} r={24} /><path d="M60,-8 q14,30 2,46 l-8,-2 q8,-18 -6,-36z" /><rect x={-38} y={18} width={14} height={30} rx={4} /><rect x={22} y={18} width={14} height={30} rx={4} /><rect x={-14} y={20} width={12} height={28} rx={4} /><path d="M28,-30 q-26,-6 -22,24 q14,4 20,-4z" fill="#3E2A18" /></g>}
    {kind === 1 && <g fill="#2A1A0E">{/* deer */}<ellipse cx={0} cy={0} rx={40} ry={18} /><path d="M30,-8 l14,-30 l10,4 l-10,30z" /><ellipse cx={52} cy={-38} rx={14} ry={9} /><path d="M46,-44 l-6,-22 M46,-50 l-12,-8 M52,-46 l6,-22 M56,-56 l10,-8" stroke="#2A1A0E" strokeWidth={4} fill="none" /><rect x={-34} y={10} width={7} height={34} /><rect x={-20} y={10} width={7} height={34} /><rect x={18} y={10} width={7} height={34} /><rect x={30} y={10} width={7} height={34} /></g>}
    {kind === 2 && <g fill="#2A1A0E">{/* person */}<circle cx={0} cy={-46} r={14} /><path d="M-16,-28 h32 l6,40 h-12 l-2,34 h-16 l-2,-34 h-12z" /></g>}
    {kind === 3 && <g fill="#2A1A0E">{/* tiger */}<ellipse cx={0} cy={0} rx={50} ry={20} /><circle cx={50} cy={-12} r={18} /><path d="M-48,-4 q-26,-18 -22,-40 q6,20 26,30z" /><rect x={-40} y={10} width={10} height={32} rx={4} /><rect x={-22} y={10} width={10} height={32} rx={4} /><rect x={22} y={10} width={10} height={32} rx={4} /><rect x={38} y={8} width={10} height={32} rx={4} /></g>}
  </svg>
);
const LIFE = ['m_elephant', 'm_tiger', 'm_family', 'm_deer', 'm_rhino'];
/** The animals and the family; they crumble into dust one by one from fadeAt (keep = how many survive). */
const Mammals: React.FC<{ t: number; y: number; fadeAt: number; show: number; keep?: number }> = ({ t, y, fadeAt, show, keep = 0 }) => (
  <>
    {LIFE.map((k, i) => {
      const p = pop(t, show + i * 0.1, 10, 200);
      const t0 = fadeAt + [1, 0, 3, 2, 4][i] * 0.18;
      const dies = i !== 2 || keep === 0;
      const o = dies ? 1 - ramp(t, t0, t0 + 0.45, linear) : 1;
      const x = 120 + i * 210, yy = y + (i % 2) * 70 - (i === 2 ? 40 : 0);
      return (
        <React.Fragment key={k}>
          <At x={x} y={yy} p={p} o={o}>
            <div style={{ transform: `translateX(${dies ? 40 * ramp(t, t0, t0 + 0.45, linear) : 0}px)`, filter: dies && t > t0 ? `sepia(${clamp01((t - t0) * 3)}) brightness(${1 - 0.3 * clamp01((t - t0) * 3)})` : undefined }}>
              <Cut k={k} w={i === 2 ? 250 : 230} fallback={<div style={{ background: 'rgba(255,240,210,0.9)', borderRadius: 30, padding: 10, border: `5px solid ${DARK}` }}><Mammal kind={[0, 3, 2, 1, 0][i]} /></div>} />
            </div>
          </At>
          {dies && t > t0 && t < t0 + 1.6 && <div style={{ position: 'absolute', left: x, top: yy, width: 0, height: 0 }}>
            <Crumble t={t} t0={t0} w={220} seed={i + 1} />
            {HAVE.x_dust_burst && <div style={{ position: 'absolute', left: -60, top: -170, opacity: (1 - (t - t0) / 1.6) * 0.95, mixBlendMode: 'screen', transform: `scale(${0.7 + 0.5 * (t - t0)})` }}><Cut k="x_dust_burst" w={420} /></div>}
          </div>}
        </React.Fragment>
      );
    })}
  </>
);

/** The burning Earth (creator's GPT image; a code globe until it arrives). */
const FireEarth: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ transform: `rotate(${Math.sin(t * 1.3) * 3}deg)` }}>
    <Cut k="f_earth_fire" w={520} fallback={
      <svg width={460} height={460} viewBox="-230 -230 460 460">
        <defs><radialGradient id="fe" cx="38%" cy="32%" r="70%"><stop offset="0" stopColor="#FFD08A" /><stop offset="0.45" stopColor="#FF5A1F" /><stop offset="1" stopColor="#5A0A04" /></radialGradient></defs>
        <circle r={200} fill="url(#fe)" stroke="#2A0602" strokeWidth={6} />
        {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M${-150 + k * 55},${-120 + (k % 3) * 70} l40,30 l-20,40 l35,25`} stroke="#FFE7A0" strokeWidth={5} fill="none" opacity={0.8} />)}
      </svg>} />
  </div>
);

// ------------------------------------------------------------------ the counters (the Mumbai reel's rolling numbers)
const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');
const Counters: React.FC<{ t: number }> = ({ t }) => {
  const cm = 5 * easeOut(ramp(t, C.n5 - 0.1, C.n5 + 0.9, linear));
  // one counter for the hook: it spins up to +25 crore, then "30 crore saal pehle" rewinds it through 0 to −30
  const yr = 25 * easeOut(ramp(t, C.n25 - 0.1, C.n25 + 1.0, linear)) - 55 * inOut(ramp(t, C.karib30 - 0.05, C.n30 + 0.9, linear));
  const yrS = `${yr >= 0 ? '+' : '−'}${fmt(Math.abs(yr))} करोड़ साल`;
  const p5 = 5 * easeOut(ramp(t, C.karib5, C.n5cr + 0.8, linear));
  const fut2 = 25 * easeOut(ramp(t, C.model, C.n25b + 0.6, linear));
  const yrPunch = 1 + 0.12 * Math.exp(-6 * Math.max(0, t - C.karib30)) * (t > C.karib30 ? 1 : 0);
  return (
    <>
      <At x={540} y={330} p={pop(t, C.n5 - 0.15, 9, 220)} o={win(t, C.n5 - 0.2, C.n25 - 0.1)} rot={-4}><Big text={<>+{cm.toFixed(1)} cm<span style={{ fontSize: 70 }}> / साल</span></>} size={140} color={COL.gold} /></At>
      <At x={540} y={330} p={pop(t, C.n25 - 0.15, 10, 200) * yrPunch} o={win(t, C.n25 - 0.2, C.pangea - 0.1)}><Big text={yrS} size={118} color={yr >= 0 ? '#FFB08A' : '#fff'} font={UI} /></At>
      <At x={850} y={560} rot={10} p={pop(t, C.kyu - 0.05, 8, 240)} o={win(t, C.kyu - 0.1, C.karib30 + 0.1)}><Big text="?" size={300} color={COL.gold} /></At>
      <At x={540} y={300} p={pop(t, C.pangea - 0.1, 9, 200)} o={win(t, C.pangea - 0.15, C.aur_bharat + 0.4)}><Big text="PANGEA" size={170} font={SERIF} color="#FFF1C8" ink={INK} /></At>
      <At x={540} y={300} p={pop(t, C.karib5 - 0.1, 10, 200)} o={win(t, C.karib5 - 0.15, C.farsh)}><Big text={<>−{p5.toFixed(0)} करोड़ साल</>} size={110} font={UI} /></At>
      <At x={540} y={300} p={pop(t, C.model, 10, 200)} o={win(t, C.model - 0.05, C.ultima - 0.1)}><Big text={<>+{fmt(fut2)} करोड़ साल</>} size={110} color="#FFB08A" font={UI} /></At>
      <At x={540} y={310} p={pop(t, C.ultima - 0.1, 9, 200)} o={win(t, C.ultima - 0.15, C.n2023 + 0.3)}><Big text={<div style={{ textAlign: 'center' }}>PANGAEA<br />ULTIMA</div>} size={140} font={SERIF} color="#FFD0A8" ink={INK} /></At>
    </>
  );
};

// ------------------------------------------------------------------ scenes over the map
const Overlays: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  // the hook's future flash: the continents heat up and the mammals fade
  const hookHeat = win(t, C.n25 - 0.1, C.karib30 + 0.2, 0.6, 0.5);
  // "Tumhe": the viewer's pin on frame 0 (and the loop's end)
  const pinS = toS(c, PIN);
  const pinO = 1 - ramp(t, C.par - 0.3, C.par + 0.1, linear) + ramp(t, DURATION_S - 1.2, DURATION_S - 0.4, linear);
  // "Asia mein tha hi nahi": India and Asia, far apart
  const iS = toS(c, onCanvas(poseAt(t, 'india'), [0, -400]));
  const aS = toS(c, onCanvas(poseAt(t, 'eurasia'), [-1500, 2400]));
  const asiaO = win(t, C.asia - 0.2, C.africa + 0.2);
  // breakup: India's speed trail and the gauge
  const runO = win(t, C.bhagta - 0.3, C.beech + 0.2);
  const speed = 15 * ramp(t, C.bhagta - 0.2, C.n15 + 0.4, inOut) + (t > C.n15 ? 2 * Math.sin(t * 7) : 0);
  const trail = [-0.9, -0.6, -0.3].map((dt) => toS(c, onCanvas(poseAt(t + dt, 'india'), [0, 0])));
  // Everest and the fossil
  const ev = toS(c, EVEREST);
  const evO = win(t, C.everest - 0.3, C.shaligram - 0.2);
  // the shaligram card
  const sh = win(t, C.shaligram - 0.3, C.jaari - 0.9, 0.4, 0.4);
  const split = ramp(t, C.ammonite - 0.5, C.ammonite + 0.3, inOut);
  // takkar jaari: arrows pushing north (in the top half, above Null)
  const arrows = win(t, C.takkar2 - 0.2, C.model + 0.3);
  // the 2023 study
  const studyO = win(t, C.n2023 - 0.2, C.yani - 0.1);
  const temp = 10 + 30 * ramp(t, C.n40 - 0.4, C.n40 + 0.3, inOut) + 30 * ramp(t, C.n70 - 0.1, C.n70 + 0.6, inOut);
  const meter = 100 - 84 * ramp(t, C.n8 - 0.5, C.n8 + 0.3, inOut) + 8 * ramp(t, C.n16 - 0.1, C.n16 + 0.4, inOut);
  const mammO = win(t, C.mammals2 - 0.2, C.yani + 0.1);
  return (
    <>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(255,120,40,0.1), rgba(200,30,10,0.4))', mixBlendMode: 'multiply', opacity: hookHeat * 0.6 }} />
      {pinO > 0.01 && <At x={pinS[0]} y={pinS[1] - 70} o={pinO} p={0.9 + 0.1 * Math.sin(t * 6)}><div style={{ position: 'relative' }}><Pin t={t} size={140} /><div style={{ position: 'absolute', left: '50%', top: 10, transform: 'translate(-50%,-100%)' }}><Tag text="तुम" color="#FF2B2B" size={58} /></div></div></At>}
      {t > C.yahi - 0.3 && t < C.karib30 + 0.4 && <At x={540} y={780} p={pop(t, C.yahi - 0.2, 10, 170)} o={win(t, C.yahi - 0.3, C.karib30 + 0.4, 0.2, 0.4)}><FireEarth t={t} /></At>}
      {t > C.mammals - 0.4 && t < C.karib30 + 0.4 && <AbsoluteFill style={{ opacity: win(t, C.mammals - 0.4, C.karib30 + 0.4, 0.2, 0.3) }}><Mammals t={t} y={1180} show={C.mammals - 0.3} fadeAt={C.mita1 - 0.05} /></AbsoluteFill>}
      {asiaO > 0 && <>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: asiaO }}>
          <line x1={iS[0]} y1={iS[1]} x2={aS[0]} y2={aS[1]} stroke="#fff" strokeWidth={6} strokeDasharray="18 14" strokeDashoffset={-t * 60} />
        </svg>
        <At x={aS[0]} y={aS[1] - 70} p={pop(t, C.asia - 0.1, 10, 200)} o={asiaO}><Tag text="ASIA" color={COL.red} size={56} font={TITLE} /></At>
        <At x={(iS[0] + aS[0]) / 2 + 80} y={(iS[1] + aS[1]) / 2} p={pop(t, C.asia + 0.3, 9, 220)} o={asiaO} rot={-8}><Big text="✕" size={150} color={COL.red} /></At>
      </>}
      {t > C.africa - 0.2 && t < C.toota + 0.4 && <>
        <At {...xy(toS(c, onCanvas(poseAt(t, 'africa'), [0, -300])))} p={pop(t, C.africa - 0.1, 10, 200)} o={win(t, C.africa - 0.2, C.toota + 0.4)}><MapLabel text="अफ्रीका" /></At>
        <At {...xy(toS(c, onCanvas(poseAt(t, 'antarctica'), [0, -200])))} p={pop(t, C.antarc - 0.1, 10, 200)} o={win(t, C.antarc - 0.2, C.toota + 0.4)}><MapLabel text="अंटार्कटिका" /></At>
        <At {...xy(toS(c, onCanvas(poseAt(t, 'australia'), [0, -300])))} p={pop(t, C.austr - 0.1, 10, 200)} o={win(t, C.austr - 0.2, C.toota + 0.4)}><MapLabel text="ऑस्ट्रेलिया" /></At>
        <At {...xy(toS(c, onCanvas(poseAt(t, 'india'), [0, 0])))} p={pop(t, C.aur_bharat - 0.1, 10, 200)} o={win(t, C.aur_bharat - 0.2, C.toota + 0.4)}><MapLabel text="भारत" color="#FFD7A8" size={56} /></At>
      </>}
      {runO > 0 && <>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: runO }}>
          {trail.map(([x, y], k) => <circle key={k} cx={x} cy={y} r={40 + k * 18} fill={COL.india} opacity={0.12 + k * 0.1} />)}
        </svg>
        <At x={850} y={1260} p={pop(t, C.bhagta - 0.2, 10, 200)} o={runO}><Gauge v={speed} max={20} label={`${Math.max(0, speed).toFixed(0)}+ cm/साल`} /></At>
        <At {...xy(toS(c, onCanvas(poseAt(t, 'india'), [0, 0])))} o={runO}><MapLabel text="भारत" color="#FFD7A8" size={52} /></At>
      </>}
      <Crash t={t} />
      {evO > 0 && <>
        <At x={ev[0]} y={ev[1] - 70} p={pop(t, C.everest - 0.1, 10, 200)} o={evO}><Tag text={<>EVEREST <span style={{ color: COL.gold }}>8,849 m</span></>} size={50} font={TITLE} /></At>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: evO }}><circle cx={ev[0]} cy={ev[1]} r={16 + 4 * Math.sin(t * 8)} fill="none" stroke="#fff" strokeWidth={5} /><circle cx={ev[0]} cy={ev[1]} r={6} fill={COL.gold} /></svg>
        <At x={ev[0] + 200} y={ev[1] + 330} p={pop(t, C.fossil - 0.1, 9, 200)} o={evO} rot={-8}>
          <div style={{ background: 'rgba(255,248,230,0.95)', borderRadius: 40, padding: 22, border: `6px solid ${DARK}`, textAlign: 'center' }}>
            <Ammonite s={1.1} /><div style={{ fontFamily: UI, fontWeight: 800, fontSize: 46, color: DARK }}>समुद्री जीव का fossil</div>
          </div>
        </At>
      </>}
      {sh > 0 && <>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(40,20,5,0.55), rgba(10,5,0,0.88))', opacity: sh }} />
        <At x={540} y={980} p={pop(t, C.shaligram - 0.2, 11, 170)} o={sh}><Shaligram t={t} split={split} /></At>
        <At x={540} y={540} p={pop(t, C.shaligram, 10, 200)} o={sh}><Big text="शालिग्राम" size={130} font={UI} color={COL.gold} /></At>
        <At x={760} y={1300} p={pop(t, C.ammonite - 0.1, 10, 200)} o={sh * split}><Tag text="AMMONITE · 15+ करोड़ साल" size={46} font={TITLE} /></At>
      </>}
      {arrows > 0 && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: arrows }}>
        {[-1, 0, 1].map((k) => {
          const x = 540 + k * 260, y = 820 - 26 * ((t * 1.6 + k * 0.3) % 1);
          return <path key={k} d={`M${x - 40},${y} L${x},${y - 70} L${x + 40},${y} M${x},${y - 60} V${y + 80}`} stroke={COL.gold} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
        })}
      </svg>}
      {arrows > 0 && <At x={540} y={250} p={pop(t, C.takkar2 - 0.1, 10, 200)} o={arrows}><Big text={<>टक्कर <span style={{ color: COL.gold }}>जारी है</span></>} size={110} font={UI} /></At>}
      {studyO > 0 && <>
        <At x={540} y={250} p={pop(t, C.n2023 - 0.1, 10, 200)} o={studyO}><Tag text={<>2023 STUDY · <span style={{ color: COL.gold }}>Nature Geoscience</span></>} size={48} font={TITLE} /></At>
        <At x={150} y={1140} p={pop(t, C.n40 - 0.3, 10, 200)} o={win(t, C.n40 - 0.4, C.yani - 0.1)}><Thermo v={temp} /></At>
        <At x={150} y={820} p={pop(t, C.n40 - 0.2, 10, 200)} o={win(t, C.n40 - 0.3, C.yani - 0.1)}><Big text={`${Math.round(temp)}°C`} size={100} color={COL.heat} /></At>
      </>}
      {mammO > 0 && <>
        <At x={540} y={1190} p={pop(t, C.mammals2 - 0.2, 10, 200)} o={mammO}>
          <div style={{ width: 760, height: 64, borderRadius: 32, background: 'rgba(10,15,22,0.85)', border: '6px solid #fff', overflow: 'hidden' }}>
            <div style={{ width: `${meter}%`, height: '100%', background: `linear-gradient(90deg, #4ED16A, ${meter < 40 ? COL.red : '#9BE15A'})` }} />
          </div>
        </At>
        <At x={540} y={1090} p={pop(t, C.n8 - 0.2, 10, 200)} o={win(t, C.n8 - 0.3, C.yani + 0.1)}><Big text="8–16% ज़मीन" size={96} font={UI} color="#9BE15A" /></At>
        <Mammals t={t} y={1340} show={C.mammals2 - 0.1} fadeAt={C.n8 - 0.3} keep={1} />
      </>}
      {t > C.mita - 0.1 && t < C.safar && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,60,30,0), rgba(200,20,10,0.5))', opacity: Math.max(0, Math.sin((t - C.mita) * 6)) * (1 - ramp(t, C.mita + 0.6, C.safar, linear)) }} />}
    </>
  );
};
const xy = ([x, y]: P) => ({ x, y });

// ------------------------------------------------------------------ the house grade (no grain)
export const Grade: React.FC<{ t: number }> = ({ t }) => {
  const lx = 50 + 38 * Math.sin(t * LOOPF(3) + 1.1), ly = 30 + 22 * Math.sin(t * LOOPF(2) + 0.4);
  const leak = 0.5 + 0.2 * Math.sin(t * LOOPF(8));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,92,118,0.3), rgba(0,70,96,0.15) 45%, rgba(0,60,90,0.28))', mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,196,128,0.28), rgba(255,140,70,0.06) 26%, rgba(255,120,60,0) 46%)`, mixBlendMode: 'screen', opacity: leak }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 56%, rgba(0,4,12,0.42) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,8,16,0.24), rgba(0,0,0,0) 18%, rgba(0,0,0,0) 76%, rgba(0,6,12,0.38))' }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Null (split screen, once, middle only)
const NW = () => ({ t0: C.takkar2 - 0.4, t1: C.atlantic + 0.2, from: 0.3 });
const BAND_TOP = 470;
const NullPanel: React.FC<{ t: number; q: number; fps: number }> = ({ t, q, fps }) => {
  const { t0, t1, from } = NW();
  return (
    <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d', borderTop: '6px solid #fff' }}>
      <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 300}px`, transform: `scale(${1.12 + 0.04 * ramp(t, t0, t1, inOut)})` }}>
        <Sequence from={Math.round((t0 - 0.2) * fps)} durationInFrames={Math.round((t1 - t0 + 0.6) * fps)} layout="none">
          <OffthreadVideo src={staticFile('pangea/null/null_pg_A.mp4')} muted startFrom={Math.max(0, Math.round((from - 0.2) * fps))} style={{ width: 1080, height: 1920 }} />
        </Sequence>
      </div>
      <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
    </div>
  );
};

// ------------------------------------------------------------------ captions, credits
const Captions: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  if (t < 0.05 || t > DURATION_S - 0.3) return null;
  let i = -1;
  for (let k = 0; k < CAPS.length; k++) if (CAPS[k][0] <= t) i = k;
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const words = CAPS.slice(g, g + 3);
  const last = words[words.length - 1];
  if (t > last[0] + 1.2 && (!CAPS[g + 3] || t < CAPS[g + 3][0])) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 66, lineHeight: 1.25, color: '#fff', WebkitTextStroke: `10px ${DARK}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
      {words.map(([wt, w], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0, color: g + k === i ? COL.gold : '#fff' }}>{w} </span>)}
    </div>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · borders: Natural Earth (India POV) · past/future maps illustrative · study: Farnsworth et al. 2023';

export const Pangea: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const c = camAt(t);
  const [sx, sy] = shake(t);
  // satellite = today, the old map = past and future (the Mumbai reel's code)
  const sat = 1 - ramp(t, C.n25 + 0.05, C.n25 + 0.6, inOut) + ramp(t, C.himalaya + 0.3, C.everest - 0.1, inOut) - ramp(t, C.model + 0.1, C.model + 0.9, inOut) + ramp(t, C.safar + 0.2, C.kyunki + 0.4, inOut);
  const so = clamp01(sat);
  // living camera: a slow roll, and motion blur on the fast moves (whip-outs, dives)
  const roll = rollAt(t);
  const sp = camSpeed(t);
  const blur = Math.min(12, sp.pan * 0.25 + sp.zoom * 260);
  const q = Math.min(ramp(t, NW().t0 - 0.2, NW().t0 + 0.2, inOut), 1 - ramp(t, NW().t1 - 0.2, NW().t1 + 0.2, inOut));
  return (
    <AbsoluteFill style={{ background: '#0E2A55', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <AbsoluteFill style={{ transform: `rotate(${roll.toFixed(3)}deg) scale(1.06)`, filter: blur > 0.7 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
          {so < 0.999 && <OldMap c={c} t={t} />}
          {so > 0.001 && <AbsoluteFill style={{ opacity: so }}><Satellite c={c} t={t} /></AbsoluteFill>}
          <Tethys c={c} t={t} />
          <Ridge c={c} t={t} />
        </AbsoluteFill>
        <Grade t={t} />
        <Overlays t={t} c={c} />
        <Counters t={t} />
      </AbsoluteFill>
      {q > 0 && <NullPanel t={t} q={q} fps={fps} />}
      {captions && <Captions t={t} top={q > 0 ? 860 : 1500} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={(t * 98) / DURATION_S} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
