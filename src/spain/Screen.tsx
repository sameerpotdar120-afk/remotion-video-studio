import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, graphemes, inOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import sizes from '../../public/spain/img_sizes.json';
import { C, CAPS, Cam, DURATION_S, GEO, P, merc, toScreen } from './cam';
import { COL } from './Plane';

export const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
const SERIF = "'NotoSerifDeva', 'Noto Serif Devanagari', serif";
const MONT = "'Montserrat', sans-serif";
const SZ = sizes as unknown as Record<string, [number, number]>;
const img = (n: string) => staticFile(`spain/img/${n}.png`);
const S = (c: Cam, lon: number, lat: number): P => toScreen(c, merc(lon, lat));

// ---------------------------------------------------------------- props
/** A miniature at a screen point (bottom-centre anchor): springs in, breathes, can glide along a path, pops out. */
const Actor: React.FC<{
  t: number; t0: number; t1: number; pose: string; x: number; y: number; h: number; flip?: boolean; bob?: number; sway?: number;
  path?: { t0: number; t1: number; x: number; y: number; arc?: number }; shadow?: boolean; rot?: number; glow?: string; drop?: boolean; z?: number;
}> = ({ t, t0, t1, pose, x, y, h, flip, bob = 4, sway = 0, path, shadow = true, rot = 0, glow, drop = true }) => {
  if (t < t0 - 0.02 || t > t1 + 0.35) return null;
  const s = pop(t, t0, 10, 200);
  const out = ramp(t, t1, t1 + 0.3, easeIn);
  const land = kick(t, t0 + 0.16, 0.1, 26, 10);
  let px = x, py = y;
  if (path) {
    const q = ramp(t, path.t0, path.t1, inOut);
    px = lerp(x, path.x, q);
    py = lerp(y, path.y, q) - Math.sin(q * Math.PI) * (path.arc ?? 0);
  }
  const [iw, ih] = SZ[pose] ?? [600, 900];
  const w = (h * iw) / ih;
  const sc = Math.max(0, s) * (1 - out);
  if (sc <= 0.01) return null;
  const breathe = Math.sin((t - t0) * 2.4) * bob;
  const rock = sway ? Math.sin((t - t0) * 2.1) * sway : 0;
  return (
    <div style={{ position: 'absolute', left: px, top: py, width: 0, height: 0 }}>
      {shadow && (
        <div style={{ position: 'absolute', left: -w * 0.34, top: -h * 0.045, width: w * 0.68, height: h * 0.09, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0))', transform: `scale(${Math.min(1, sc)})` }} />
      )}
      <div style={{ position: 'absolute', left: -w / 2, top: -h, width: w, height: h, transformOrigin: '50% 100%',
        transform: `translateY(${-(drop ? (1 - clamp01(s)) * 90 : 0)}px) rotate(${rot + rock}deg) scale(${sc * (1 - land) * (flip ? -1 : 1)}, ${sc * (1 + land) + breathe / h})`,
        filter: `${glow ? `drop-shadow(0 0 16px ${glow}) ` : ''}drop-shadow(0 8px 10px rgba(0,0,0,0.5))` }}>
        <img src={img(pose)} style={{ width: w, height: h, display: 'block' }} />
      </div>
    </div>
  );
};

const Year: React.FC<{ text: string; t: number; t0: number; t1: number; x?: number; y?: number; size?: number }> = ({ text, t, t0, t1, x = 540, y = 430, size = 190 }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.25, t1);
  if (a <= 0) return null;
  const s = pop(t, t0, 9, 230);
  const bl = Math.max(0, 1 - clamp01((t - t0) / 0.18)) * 14;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${lerp(1.8, 1, clamp01(s)) + (s > 1 ? (s - 1) * 0.4 : 0)})`, opacity: a,
      fontFamily: MONT, fontWeight: 900, fontSize: size, color: '#fff', letterSpacing: 2, whiteSpace: 'nowrap',
      filter: `${bl > 0.3 ? `blur(${bl.toFixed(1)}px) ` : ''}drop-shadow(0 0 18px rgba(255,200,90,0.6)) drop-shadow(0 6px 12px rgba(0,0,0,0.7))` }}>{text}</div>
  );
};

const Label: React.FC<{ text: string; t: number; t0: number; t1: number; x: number; y: number; size?: number; color?: string; arrow?: boolean }> = ({ text, t, t0, t1, x, y, size = 58, color = '#fff', arrow }) => {
  const a = window4(t, t0, t0 + 0.15, t1 - 0.25, t1);
  if (a <= 0) return null;
  const g = graphemes(text);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-100%)', opacity: a, textAlign: 'center' }}>
      <div style={{ whiteSpace: 'nowrap', fontFamily: SERIF, fontWeight: 900, fontSize: size, color, textShadow: '0 3px 10px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)' }}>
        {g.map((ch, i) => {
          const p = clamp01(pop(t, t0 + i * 0.03, 12, 210));
          return <span key={i} style={{ display: 'inline-block', opacity: clamp01(p * 1.4), transform: `translateY(${(1 - p) * 22}px)` }}>{ch === ' ' ? ' ' : ch}</span>;
        })}
      </div>
      {arrow && (
        <svg width={60} height={70} style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
          <path d="M30,4 L30,52 M14,38 L30,58 L46,38" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round"
            pathLength={1} strokeDasharray={`${ramp(t, t0 + 0.15, t0 + 0.5, easeOut)} 1`} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
        </svg>
      )}
    </div>
  );
};

const Stamp: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; size?: number; rot?: number; color?: string }> = ({ t, t0, t1, text, x, y, size = 80, rot = -12, color = '#D62B2B' }) => {
  const a = window4(t, t0, t0 + 0.02, t1 - 0.2, t1);
  if (a <= 0) return null;
  const s = ramp(t, t0, t0 + 0.12, easeIn);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.4, 1, s) + kick(t, t0 + 0.12, 0.06, 30, 10)})`, opacity: a * (0.6 + 0.4 * s),
      padding: '4px 26px', border: `${size * 0.1}px solid ${color}`, borderRadius: 14, fontFamily: SERIF, fontWeight: 900, fontSize: size, color, whiteSpace: 'nowrap',
      background: 'rgba(255,248,236,0.88)', boxShadow: '0 6px 14px rgba(0,0,0,0.35)' }}>{text}</div>
  );
};

/** Flags drawn in code so the colours are exact (Spain's plain civil flag, France's tricolour, the Union Jack). */
const FlagArt: React.FC<{ kind: 'es' | 'fr' | 'uk'; w: number; t: number }> = ({ kind, w, t }) => {
  const h = w * (kind === 'uk' ? 0.5 : 0.66);
  const strips = 16;
  const id = `fl${kind}${Math.round(w)}`;
  const art = kind === 'es'
    ? (<><rect width={w} height={h} fill="#AA151B" /><rect y={h / 4} width={w} height={h / 2} fill="#F1BF00" /></>)
    : kind === 'fr'
      ? (<><rect width={w / 3} height={h} fill="#002395" /><rect x={w / 3} width={w / 3} height={h} fill="#fff" /><rect x={(2 * w) / 3} width={w / 3} height={h} fill="#ED2939" /></>)
      : (<>
        <rect width={w} height={h} fill="#012169" />
        <path d={`M0,0 L${w},${h} M${w},0 L0,${h}`} stroke="#fff" strokeWidth={h * 0.2} />
        <path d={`M0,0 L${w},${h} M${w},0 L0,${h}`} stroke="#C8102E" strokeWidth={h * 0.067} />
        <path d={`M${w / 2},0 V${h} M0,${h / 2} H${w}`} stroke="#fff" strokeWidth={h * 0.333} />
        <path d={`M${w / 2},0 V${h} M0,${h / 2} H${w}`} stroke="#C8102E" strokeWidth={h * 0.2} />
      </>);
  return (
    <svg width={w + 10} height={h + 24} style={{ overflow: 'visible', display: 'block' }}>
      <defs><clipPath id={id}><rect width={w} height={h} rx={3} /></clipPath><pattern id={`${id}p`} width={w} height={h} patternUnits="userSpaceOnUse">{art}</pattern></defs>
      {Array.from({ length: strips }, (_, i) => {
        const u = i / strips;
        const dy = Math.sin(u * 6 - t * 7) * 5 * u;
        const shade = 0.88 + 0.12 * Math.cos(u * 6 - t * 7);
        return (
          <g key={i} transform={`translate(0,${dy})`} opacity={1}>
            <rect x={u * w} y={0} width={w / strips + 0.7} height={h} fill={`url(#${id}p)`} style={{ filter: `brightness(${shade})` }} />
          </g>
        );
      })}
    </svg>
  );
};

/** A flag on a pole that pops up at a screen point; `kind` can change over time (it flips with a turn). */
const Flag: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; kinds: [number, 'es' | 'fr' | 'uk'][]; w?: number }> = ({ t, t0, t1, x, y, kinds, w = 130 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  let kind = kinds[0][1];
  let last = -99;
  for (const [kt, k] of kinds) if (t >= kt) { kind = k; last = kt; }
  const flip = last > t0 ? Math.abs(Math.cos(clamp01((t - last) / 0.35) * Math.PI)) : 1;
  const s = pop(t, t0, 10, 200) * (1 - ramp(t, t1, t1 + 0.3, easeIn));
  const pole = w * 1.3;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `scale(${Math.max(0, s)})`, transformOrigin: '0 0' }}>
      <div style={{ position: 'absolute', left: -3, top: -pole, width: 6, height: pole, borderRadius: 3, background: 'linear-gradient(90deg,#cfcfcf,#7d7d7d)', boxShadow: '0 4px 6px rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'absolute', left: 3, top: -pole, transform: `scaleX(${0.08 + 0.92 * flip})`, transformOrigin: '0 50%', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))' }}>
        <FlagArt kind={kind} w={w} t={t} />
      </div>
    </div>
  );
};

/** The neighbour tracker: five slots across the top, two filled from the start, three found one by one. */
const Tracker: React.FC<{ t: number }> = ({ t }) => {
  const a = window4(t, C.paanch - 0.2, C.paanch + 0.2, C.pehle - 0.2, C.pehle + 0.3) + window4(t, C.teesra - 0.3, C.teesra, 998, 999);
  if (a <= 0.001) return null;
  const slots: { name: string; color: string; at: number }[] = [
    { name: 'फ्रांस', color: COL.france, at: -1 }, { name: 'पुर्तगाल', color: COL.portugal, at: -1 },
    { name: 'अंडोरा', color: COL.andorra, at: C.andorra }, { name: 'ब्रिटेन', color: COL.uk, at: C.britain }, { name: 'मोरक्को', color: COL.morocco, at: C.morocco },
  ];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 168, display: 'flex', justifyContent: 'center', gap: 18, opacity: Math.min(1, a) }}>
      {slots.map((s, i) => {
        const found = s.at < 0 || t >= s.at;
        const p = s.at < 0 ? 1 : clamp01(pop(t, s.at, 9, 210));
        const enter = clamp01(pop(t, C.paanch - 0.1 + i * 0.07, 11, 220));
        return (
          <div key={i} style={{ width: 150, textAlign: 'center', transform: `scale(${enter})` }}>
            <div style={{ width: 74, height: 74, margin: '0 auto', borderRadius: '50%', border: `4px solid ${found ? s.color : 'rgba(255,255,255,0.7)'}`,
              background: found ? s.color : 'rgba(10,20,30,0.55)', boxShadow: found ? `0 0 ${18 * p}px ${s.color}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: MONT, fontWeight: 900, fontSize: 40, color: '#fff', transform: `scale(${found ? lerp(1.4, 1, p) : 1})` }}>{found ? i + 1 : '?'}</div>
            <div style={{ marginTop: 6, fontFamily: SERIF, fontWeight: 800, fontSize: 28, color: '#fff', opacity: found ? 1 : 0.55, textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>{found ? s.name : '???'}</div>
          </div>
        );
      })}
    </div>
  );
};

/** The classroom wall map: Spain with only France and Portugal, then the quiz is lost. */
const WallMap: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.padha - 0.2;
  const t1 = C.paanch - 0.15;
  if (t < t0 || t > t1 + 0.4) return null;
  const s = clamp01(pop(t, t0, 10, 180));
  const outP = ramp(t, t1, t1 + 0.4, easeIn);
  const W = 560;
  const [iw, ih] = SZ.school_wall_map;
  const H = (W * ih) / iw;
  // paper area inside the asset (measured by eye): x 9–91 %, y 8–92 %
  const px0 = W * 0.1, px1 = W * 0.9, py0 = H * 0.1, py1 = H * 0.88;
  const b = { x0: merc(-10.5, 0)[0], x1: merc(8.5, 0)[0], y0: merc(0, 35.5)[1], y1: merc(0, 51.5)[1] };
  const sc = Math.min((px1 - px0) / (b.x1 - b.x0), (py1 - py0) / (b.y1 - b.y0));
  const ox = (px0 + px1) / 2 - ((b.x0 + b.x1) / 2) * sc;
  const oy = (py0 + py1) / 2 + ((b.y0 + b.y1) / 2) * sc;
  const d = (rs: P[][]) => rs.map((r) => r.map(([x, y], i) => `${i ? 'L' : 'M'}${(ox + x * sc).toFixed(1)},${(oy - y * sc).toFixed(1)}`).join('') + 'Z').join('');
  const fr = ramp(t, C.france1 - 0.1, C.france1 + 0.3);
  const pt = ramp(t, C.portugal - 0.1, C.portugal + 0.3);
  return (
    <div style={{ position: 'absolute', left: 540 - W / 2, top: 300 - (1 - s) * 120 - outP * 900, width: W, height: H, opacity: s * (1 - outP),
      transform: `rotate(${Math.sin(t * 1.7) * 1.5 + outP * -20}deg)`, transformOrigin: '50% 0', filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.55))' }}>
      <img src={img('school_wall_map')} style={{ position: 'absolute', width: W, height: H }} />
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs><clipPath id="paper"><rect x={px0} y={py0} width={px1 - px0} height={py1 - py0} /></clipPath></defs>
        <g clipPath="url(#paper)">
          <rect x={px0} y={py0} width={px1 - px0} height={py1 - py0} fill="#BFD9E6" opacity={0.75} />
          <path d={d(GEO.france)} fill={COL.france} opacity={0.85 * fr + 0.15} stroke="#2a2a2a" strokeWidth={1.2} />
          <path d={d(GEO.portugal)} fill={COL.portugal} opacity={0.85 * pt + 0.15} stroke="#2a2a2a" strokeWidth={1.2} />
          <path d={d(GEO.spain)} fill={COL.spain} stroke="#2a2a2a" strokeWidth={1.4} />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: py1 - 6, textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: 40, color: '#3a2a1a' }}>
        {t > C.do1 - 0.1 ? 'पड़ोसी: 2' : ''}
      </div>
      <Stamp t={t} t0={C.haar - 0.05} t1={t1 + 0.4} text="✗ हार गए" x={W / 2} y={H * 0.5} size={68} rot={-14} />
    </div>
  );
};

/** The 1659 treaty: villages go to France; "गाँव" is crossed out over Llívia and "शहर" stamped. */
const Treaty: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.y1659 - 0.1;
  const t1 = C.pashchim - 0.2;
  if (t < t0 || t > t1 + 0.35) return null;
  const s = clamp01(pop(t, t0, 10, 180)) * (1 - ramp(t, t1, t1 + 0.3, easeIn));
  const unroll = ramp(t, t0, t0 + 0.6, easeOut);
  const W = 860;
  const [iw, ih] = SZ.treaty_scroll;
  const H = (W * ih) / iw;
  const strike = ramp(t, C.gaon5 - 0.05, C.gaon5 + 0.3, easeOut);
  return (
    <div style={{ position: 'absolute', left: 540 - W / 2, top: 250, width: W, height: H, transform: `scale(${s})`, transformOrigin: '50% 50%', filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.55))' }}>
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - unroll) * 50}% 0 ${(1 - unroll) * 50}%)` }}>
        <img src={img('treaty_scroll')} style={{ width: W, height: H }} />
        <div style={{ position: 'absolute', left: '18%', right: '18%', top: '18%', textAlign: 'center', color: '#3b2410' }}>
          <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 64, letterSpacing: 6 }}>1659</div>
          <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 46, marginTop: 6, opacity: ramp(t, C.gaon - 0.1, C.gaon + 0.3) }}>
            सारे <span style={{ position: 'relative', display: 'inline-block' }}>गाँव
              {strike > 0 && <span style={{ position: 'absolute', left: '-8%', top: '52%', width: `${116 * strike}%`, height: 7, background: '#C42A2A', borderRadius: 4, transform: 'rotate(-6deg)' }} />}
            </span> → फ्रांस
          </div>
        </div>
      </div>
      <Stamp t={t} t0={C.shahar5 - 0.05} t1={t1 + 0.3} text="लिविया = शहर" x={W * 0.5} y={H * 0.74} size={54} rot={-8} />
    </div>
  );
};

/** Desk calendar for Pheasant Island: Feb–Jul (Spain), Aug–Jan (France), and now: France. */
const Calendar: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  const t0 = C.farvari - 0.2;
  const t1 = C.teesra - 0.1;
  if (t < t0 || t > t1 + 0.35) return null;
  const W = 300;
  const [iw, ih] = SZ.desk_calendar;
  const H = (W * ih) / iw;
  const s = clamp01(pop(t, t0, 10, 200)) * (1 - ramp(t, t1, t1 + 0.3, easeIn));
  const phase = t < C.agast ? 0 : 1;
  const text = ['फरवरी → जुलाई', 'अगस्त → जनवरी'][phase];
  const color = [COL.spain, COL.france][phase];
  const flipAt = [t0, C.agast][phase];
  const f = ramp(t, flipAt, flipAt + 0.25, easeOut);
  return (
    <div style={{ position: 'absolute', left: x - W / 2, top: y - H, width: W, height: H, transform: `scale(${s})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.55))' }}>
      <img src={img('desk_calendar')} style={{ width: W, height: H }} />
      <div style={{ position: 'absolute', left: '22%', right: '12%', top: '34%', textAlign: 'center', transform: `rotateX(${(1 - f) * 80}deg)`, transformOrigin: '50% 0' }}>
        <div style={{ width: 54, height: 8, margin: '0 auto 10px', borderRadius: 4, background: color }} />
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 34, color: '#2b2016', lineHeight: 1.15 }}>{text}</div>
      </div>
    </div>
  );
};

/** Black-background overlays from the asset pack, added with screen blending. */
const Overlay: React.FC<{ name: string; a: number; x: number; y: number; w: number; rot?: number }> = ({ name, a, x, y, w, rot = 0 }) => {
  if (a <= 0.001) return null;
  const [iw, ih] = SZ[name];
  const h = (w * ih) / iw;
  return <img src={img(name)} style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a, mixBlendMode: 'screen', transform: `rotate(${rot}deg)` }} />;
};

/** Clouds the camera falls through on the big dives and pull-outs. */
const Clouds: React.FC<{ t: number }> = ({ t }) => {
  const passes: [number, number, number][] = [[0.0, 1.9, 1], [C.britain - 1.6, C.britain + 0.3, -1], [C.gib - 0.6, C.gib + 0.6, 1], [C.africa10 - 0.7, C.africa10 + 0.6, -1], [C.paanch12 - 0.6, C.paanch12 + 0.7, -1]];
  return (
    <>
      {passes.map(([a, b, dir], i) => {
        if (t < a || t > b) return null;
        const q = (t - a) / (b - a);
        const al = Math.sin(q * Math.PI) * 0.75;
        const sc = dir > 0 ? lerp(1.0, 2.6, q) : lerp(2.6, 1.0, q);
        return (
          <AbsoluteFill key={i} style={{ transform: `scale(${sc})`, opacity: al, mixBlendMode: 'screen' }}>
            <img src={img('overlay_clouds')} style={{ width: 1080, height: 1920, objectFit: 'cover' }} />
          </AbsoluteFill>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the screen layer
export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const at = (k: string) => toScreen(c, GEO.places[k]);
  const lv = at('llivia');
  const ph = at('pheasant');
  const an = at('andorra');
  const gb = at('gibraltar');
  const ce = at('ceuta');
  const ml = at('melilla');
  const pn = at('penon');
  // the magnifying glass sweeps over the three hidden neighbours
  const lensPts: P[] = [at('andorra'), at('gibraltar'), S(c, -6.0, 33.6)];
  const lq = ramp(t, C.baaki - 0.1, C.chupa + 0.4, inOut) * 2;
  const li = Math.min(1, Math.floor(lq));
  const lf = inOut(lq - li);
  const lens = [lerp(lensPts[li][0], lensPts[li + 1][0], lf), lerp(lensPts[li][1], lensPts[li + 1][1], lf)];
  // the cargo ship crossing the Strait under the gate
  const sh0 = S(c, -6.2, 35.92), sh1 = S(c, -4.9, 36.02);
  return (
    <AbsoluteFill>
      <Clouds t={t} />

      {/* ---- the quiz */}
      <WallMap t={t} />
      <Counter t={t} t0={C.paanch - 0.05} t1={C.pehle} text={() => '5'} x={540} y={560} size={260} />
      <Label text="पड़ोसी" t={t} t0={C.paanch + 0.1} t1={C.pehle} x={540} y={760} size={70} color="#FFE07A" />
      <Actor t={t} t0={C.baaki - 0.15} t1={C.chupa + 0.5} pose="magnifying_glass" x={lens[0] + 130} y={lens[1] + 230} h={330} shadow={false} bob={2} rot={-8} drop={false} />
      <Tracker t={t} />

      {/* ---- the border itself */}
      {[0, 1, 2, 3].map((i) => {
        const q = S(c, -1.2 + i * 0.95, 42.75 + (i % 2) * 0.12);
        return <Label key={i} text="?" t={t} t0={C.ajeeb - 0.2 + i * 0.12} t1={C.france4} x={q[0]} y={q[1] - 20} size={84} color="#FFE45A" />;
      })}

      {/* ---- Llívia */}
      <Actor t={t} t0={C.llivia - 0.1} t1={C.y1659 - 0.2} pose="llivia_town" x={lv[0]} y={lv[1] + 120} h={300} bob={0} />
      <Label text="डेढ़ km" t={t} t0={C.dedh + 0.4} t1={C.y1659 - 0.3} x={(lv[0] + toScreen(c, GEO.llivia_gap[1])[0]) / 2 - 120} y={(lv[1] + toScreen(c, GEO.llivia_gap[1])[1]) / 2 + 60} size={54} color="#FFE45A" />
      <Flag t={t} t0={C.spain4 - 0.1} t1={C.y1659 - 0.2} x={lv[0] + 120} y={lv[1] - 140} kinds={[[0, 'es']]} w={110} />
      <Treaty t={t} />
      <Actor t={t} t0={C.y1659 + 0.2} t1={C.shabd} pose="quill_inkwell" x={880} y={760} h={220} shadow={false} bob={2} rot={6} />
      <Label text="एक शब्द!" t={t} t0={C.shabd - 0.05} t1={C.pashchim - 0.1} x={540} y={1180} size={80} color="#FFE45A" />

      {/* ---- Pheasant Island */}
      <Actor t={t} t0={C.tapu - 0.1} t1={C.teesra - 0.1} pose="pheasant_island" x={ph[0]} y={ph[1] + 150} h={300} shadow={false} bob={2} />
      <Actor t={t} t0={C.pheasant - 0.1} t1={C.chhah + 0.3} pose="pheasant_bird" x={ph[0] - 420} y={ph[1] - 60} h={200} shadow={false} bob={0} drop={false}
        path={{ t0: C.pheasant - 0.1, t1: C.chhah + 0.3, x: ph[0] + 520, y: ph[1] - 380, arc: 120 }} />
      <Label text="फेज़ेंट आइलैंड" t={t} t0={C.pheasant - 0.05} t1={C.teesra} x={ph[0]} y={ph[1] - 210} size={64} color="#fff" />
      <Flag t={t} t0={C.badalta - 0.2} t1={C.teesra - 0.1} x={ph[0] + 40} y={ph[1] - 10} kinds={[[0, 'fr'], [C.farvari - 0.05, 'es'], [C.agast - 0.05, 'fr']]} w={120} />
      <Calendar t={t} x={830} y={1360} />
      <Label text="अभी: फ्रांस का" t={t} t0={C.waqt - 0.05} t1={C.teesra} x={540} y={470} size={76} color="#CFE0FF" />

      {/* ---- Andorra and its two princes */}
      <Actor t={t} t0={C.andorra - 0.1} t1={C.chautha} pose="andorra_village" x={an[0]} y={an[1] + 160} h={300} bob={0} />
      <Actor t={t} t0={C.rashtrapati - 0.35} t1={C.chautha} pose="coprince_president" x={an[0] - 300} y={an[1] + 330} h={360} />
      <Flag t={t} t0={C.rashtrapati - 0.2} t1={C.chautha} x={an[0] - 410} y={an[1] + 130} kinds={[[0, 'fr']]} w={90} />
      <Actor t={t} t0={C.bishop - 0.9} t1={C.chautha} pose="coprince_bishop" x={an[0] + 300} y={an[1] + 330} h={360} />
      <Flag t={t} t0={C.bishop - 0.75} t1={C.chautha} x={an[0] + 400} y={an[1] + 130} kinds={[[0, 'es']]} w={90} />
      <Label text="2 प्रिंस" t={t} t0={C.prince - 0.05} t1={C.chautha} x={540} y={470} size={86} color="#FFE07A" />

      {/* ---- Britain and Gibraltar */}
      <Flag t={t} t0={C.britain - 0.05} t1={C.dakshin + 0.4} x={toScreen(c, GEO.places.london)[0] + 20} y={toScreen(c, GEO.places.london)[1] - 10} kinds={[[0, 'uk']]} w={130} />
      <Actor t={t} t0={C.gib - 0.1} t1={C.darwaza - 0.2} pose="rock_gibraltar" x={gb[0]} y={gb[1] + 180} h={300} shadow={false} bob={0} />
      <Actor t={t} t0={C.y1713 + 0.4} t1={C.darwaza - 0.3} pose="barbary_macaque" x={gb[0] + 300} y={gb[1] + 330} h={190} />
      <Flag t={t} t0={C.gib + 0.2} t1={C.darwaza - 0.2} x={gb[0] - 90} y={gb[1] - 80} kinds={[[0, 'uk']]} w={110} />
      <Year text="1713" t={t} t0={C.y1713 - 0.05} t1={C.bhumadhya + 0.2} />
      <Actor t={t} t0={C.darwaza - 0.15} t1={C.paanchva - 0.1} pose="stone_gate" x={540} y={1180} h={480} shadow={false} bob={0} />
      <Actor t={t} t0={C.khulta - 0.3} t1={C.paanchva + 0.2} pose="ship_cargo" x={sh0[0]} y={sh0[1] + 60} h={110} shadow={false} bob={2} sway={1.5} drop={false}
        path={{ t0: C.khulta - 0.3, t1: C.paanchva + 0.4, x: sh1[0], y: sh1[1] + 60 }} />
      <Label text="भूमध्य सागर" t={t} t0={C.bhumadhya - 0.05} t1={C.paanchva} x={S(c, -4.6, 36.3)[0]} y={S(c, -4.6, 36.3)[1]} size={52} color="#CFF4FF" />

      {/* ---- Morocco, Ceuta, Melilla, the Peñón */}
      <Label text="अकेला देश" t={t} t0={C.akela - 0.05} t1={C.do11} x={540} y={470} size={80} color="#FFE07A" />
      <Actor t={t} t0={C.ceuta - 0.1} t1={C.tapu11 - 0.1} pose="white_coastal_city" x={ce[0]} y={ce[1] + 90} h={170} bob={0} />
      <Actor t={t} t0={C.melilla - 0.1} t1={C.tapu11 - 0.1} pose="white_coastal_city" x={ml[0]} y={ml[1] + 90} h={170} bob={0} flip />
      <Actor t={t} t0={C.chattan - 0.1} t1={DURATION_S - 3.6} pose="penon_rock" x={pn[0]} y={pn[1] + 150} h={340} shadow={false} bob={0} />
      <Overlay name="overlay_sand_drift" a={window4(t, C.ret - 0.2, C.ret + 0.2, C.jod + 0.4, C.jod + 0.9) * 0.85} x={lerp(380, 700, ramp(t, C.ret - 0.2, C.jod + 0.9, linear))} y={pn[1] + 40} w={900} />
      <Label text="दुनिया का सबसे छोटा बॉर्डर" t={t} t0={C.duniya - 0.05} t1={C.sach} x={540} y={430} size={62} color="#fff" />
      <Actor t={t} t0={C.m85 - 0.35} t1={C.sach} pose="tape_measure" x={pn[0] - 20} y={pn[1] - 190} h={120} shadow={false} bob={0} />
      <Counter t={t} t0={C.m85 - 0.1} t1={C.sach} text={(p) => `${Math.round(85 * p)} मीटर`} x={540} y={570} size={130} font={FONT} glowC="#FFE45A" dur={0.6} />
    </AbsoluteFill>
  );
};

const Counter: React.FC<{ t: number; t0: number; t1: number; text: (p: number) => string; x: number; y: number; size: number; color?: string; glowC?: string; dur?: number; font?: string }> = ({
  t, t0, t1, text, x, y, size, color = '#fff', glowC = '#ffcf4a', dur = 0.25, font = MONT,
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

// ---------------------------------------------------------------- frame-level
/** The count beat: the map goes dark so the five slots (and the hidden three) read. */
export const darkAt = (t: number) => window4(t, C.paanch - 0.25, C.paanch + 0.15, C.chupa + 0.6, C.pehle + 0.2);

export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.haar, 10], [C.paanch, 12], [C.y1659, 8], [C.shahar5, 8], [C.y1713, 9], [C.morocco, 8], [C.m85, 10]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

export const Grade: React.FC<{ t: number }> = ({ t }) => {
  const flash = Math.max(
    window4(t, C.paanch - 0.03, C.paanch, C.paanch + 0.04, C.paanch + 0.25) * 0.6,
    window4(t, C.m85 - 0.03, C.m85, C.m85 + 0.04, C.m85 + 0.25) * 0.5,
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,10,20,0.35), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,8,16,0.5))' }} />
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

export { easeIn, easeOut, inOut, linear };
