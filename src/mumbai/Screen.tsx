import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { clamp01, easeIn, easeOut, graphemes, inOut, kick, lerp, linear, pop, ramp, window4 } from '../darien/anim';
import sizes from '../../public/mumbai/img_sizes.json';
import { FELL, SERIF } from '../louisiana/Plane';
import { C, CAPS, Cam, DURATION_S, GEO, P, merc, toScreen } from './cam';
import { COL, ISLANDS, ROUTE_COMPANY, floodFront, routePoint } from './Plane';

export const FONT = "'NotoDeva', 'Noto Sans Devanagari', sans-serif";
const SZ = sizes as unknown as Record<string, [number, number]>;
const img = (n: string) => staticFile(`mumbai/img/${n}.png`);
const S = (c: Cam, lon: number, lat: number): P => toScreen(c, merc(lon, lat));

// ---------------------------------------------------------------- characters and props
type Pose = [number, string];
/**
 * A miniature standing at a screen point (bottom-centre anchor): springs in with overshoot and a squash on
 * landing, breathes while idle, can glide/hop along a path, and pops out.
 */
const Actor: React.FC<{
  t: number; t0: number; t1: number; pose: string; x: number; y: number; h: number; flip?: boolean; bob?: number; sway?: number;
  path?: { t0: number; t1: number; x: number; y: number; hops?: number }; shadow?: boolean; rot?: number; glow?: string; drop?: boolean;
}> = ({ t, t0, t1, pose, x, y, h, flip, bob = 4, sway = 0, path, shadow = true, rot = 0, glow, drop = true }) => {
  if (t < t0 - 0.02 || t > t1 + 0.35) return null;
  const s = pop(t, t0, 10, 200);
  const out = ramp(t, t1, t1 + 0.3, easeIn);
  const land = kick(t, t0 + 0.16, 0.1, 26, 10);
  let px = x, py = y, hopY = 0, tilt = 0;
  if (path) {
    const q = ramp(t, path.t0, path.t1, inOut);
    px = lerp(x, path.x, q);
    py = lerp(y, path.y, q);
    const hops = path.hops ?? 0;
    if (hops && q > 0 && q < 1) {
      hopY = Math.abs(Math.sin(q * Math.PI * hops)) * 26;
      tilt = Math.sin(q * Math.PI * hops * 2) * 5;
    }
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
          background: 'radial-gradient(closest-side, rgba(30,20,10,0.5), rgba(30,20,10,0))', transform: `scale(${Math.min(1, sc)})` }} />
      )}
      <div style={{ position: 'absolute', left: -w / 2, top: -h, width: w, height: h, transformOrigin: '50% 100%',
        transform: `translateY(${-hopY - (drop ? (1 - clamp01(s)) * 90 : 0)}px) rotate(${rot + tilt + rock}deg) scale(${sc * (1 - land) * (flip ? -1 : 1)}, ${sc * (1 + land) + breathe / h})`,
        filter: `${glow ? `drop-shadow(0 0 14px ${glow}) ` : ''}drop-shadow(0 6px 8px rgba(20,12,4,0.45))` }}>
        <img src={img(pose)} style={{ width: w, height: h, display: 'block' }} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- text
const Year: React.FC<{ text: string; t: number; t0: number; t1: number; x?: number; y?: number; size?: number }> = ({ text, t, t0, t1, x = 540, y = 470, size = 210 }) => {
  const a = window4(t, t0, t0 + 0.06, t1 - 0.25, t1);
  if (a <= 0) return null;
  const s = pop(t, t0, 9, 230);
  const bl = Math.max(0, 1 - clamp01((t - t0) / 0.18)) * 14;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${lerp(1.8, 1, clamp01(s)) + (s > 1 ? (s - 1) * 0.4 : 0)})`, opacity: a,
      fontFamily: FELL, fontSize: size, color: '#f7ecd4', letterSpacing: 4, whiteSpace: 'nowrap',
      filter: `${bl > 0.3 ? `blur(${bl.toFixed(1)}px) ` : ''}drop-shadow(0 6px 12px rgba(20,12,4,0.7))` }}>{text}</div>
  );
};

const Label: React.FC<{ text: string; t: number; t0: number; t1: number; x: number; y: number; size?: number; color?: string; arrow?: boolean; strike?: number }> = ({
  text, t, t0, t1, x, y, size = 58, color = '#fff', arrow, strike = -1,
}) => {
  const a = window4(t, t0, t0 + 0.15, t1 - 0.25, t1);
  if (a <= 0) return null;
  const g = graphemes(text);
  const st = strike > 0 ? ramp(t, strike, strike + 0.25, easeOut) : 0;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-100%)', opacity: a, textAlign: 'center' }}>
      <div style={{ position: 'relative', whiteSpace: 'nowrap', fontFamily: SERIF, fontWeight: 800, fontSize: size, color, textShadow: '0 3px 8px rgba(20,12,4,0.85), 0 0 2px rgba(20,12,4,0.9)' }}>
        {g.map((ch, i) => {
          const p = clamp01(pop(t, t0 + i * 0.03, 12, 210));
          return <span key={i} style={{ display: 'inline-block', opacity: clamp01(p * 1.4), transform: `translateY(${(1 - p) * 22}px)` }}>{ch === ' ' ? ' ' : ch}</span>;
        })}
        {st > 0 && <div style={{ position: 'absolute', left: '-4%', top: '52%', width: `${108 * st}%`, height: size * 0.09, background: '#E03C3C', borderRadius: 6, transform: 'rotate(-4deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.6)' }} />}
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

/** Ink stamp slamming onto the screen. */
const Stamp: React.FC<{ t: number; t0: number; t1: number; text: string; x: number; y: number; size?: number; rot?: number }> = ({ t, t0, t1, text, x, y, size = 86, rot = -12 }) => {
  const a = window4(t, t0, t0 + 0.02, t1 - 0.2, t1);
  if (a <= 0) return null;
  const s = ramp(t, t0, t0 + 0.12, easeIn);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.4, 1, s) + kick(t, t0 + 0.12, 0.06, 30, 10)})`, opacity: a * (0.6 + 0.4 * s),
      padding: '6px 30px', border: `${size * 0.11}px solid #C42A2A`, borderRadius: 16, fontFamily: SERIF, fontWeight: 900, fontSize: size, color: '#C42A2A', whiteSpace: 'nowrap',
      background: 'rgba(255,240,230,0.82)', boxShadow: '0 6px 14px rgba(0,0,0,0.35)' }}>{text}</div>
  );
};

const indian = (n: number) => {
  const s = String(Math.round(n));
  if (s.length <= 3) return s;
  const last = s.slice(-3);
  return s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last;
};

// ---------------------------------------------------------------- set pieces
/** Saffron pennants strung over the temple (drawn in code, no symbols on them). */
const Bunting: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; w: number }> = ({ t, t0, t1, x, y, w }) => {
  const a = window4(t, t0, t0 + 0.3, t1 - 0.3, t1);
  if (a <= 0) return null;
  const n = 9;
  const sag = 34;
  const cols = ['#FF8A1F', '#FFC21F', '#E9461F'];
  return (
    <svg width={w + 40} height={160} style={{ position: 'absolute', left: x - w / 2 - 20, top: y - 30, opacity: a, overflow: 'visible', filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.35))' }}>
      <path d={`M20,30 Q${w / 2 + 20},${30 + sag * 2} ${w + 20},30`} fill="none" stroke="#6b4a26" strokeWidth={3} />
      {Array.from({ length: n }, (_, i) => {
        const u = (i + 0.5) / n;
        const px = 20 + u * w;
        const py = 30 + 4 * sag * u * (1 - u);
        const flut = Math.sin(t * 6 + i * 1.3) * 7;
        const p = clamp01(pop(t, t0 + i * 0.05, 11, 220));
        return <path key={i} d={`M${px - 16},${py} L${px + 16},${py} L${px + flut * 0.4},${py + 44 * p}`} fill={cols[i % 3]} stroke="#7a3a10" strokeWidth={1.2} />;
      })}
    </svg>
  );
};

/** The seven islands as a little glowing chart, used inside the dowry chest. */
const MiniIslands: React.FC<{ w: number; color?: string }> = ({ w, color = '#FFE7A0' }) => {
  const b = { x0: merc(72.785, 0)[0], x1: merc(72.885, 0)[0], y0: merc(0, 18.885)[1], y1: merc(0, 19.055)[1] };
  const h = (w * (b.y1 - b.y0)) / (b.x1 - b.x0);
  const d = ISLANDS.flatMap((k) => GEO.islands[k]).map((r) => r.map(([x, y], i) => `${i ? 'L' : 'M'}${(((x - b.x0) / (b.x1 - b.x0)) * w).toFixed(1)},${(((b.y1 - y) / (b.y1 - b.y0)) * h).toFixed(1)}`).join('') + 'Z').join('');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible', filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 22px #ffb84a)` }}>
      <path d={d} fill={color} stroke="#7a4a10" strokeWidth={1.2} />
    </svg>
  );
};

/** The dowry chest: islands rise out of it, then it sails from Lisbon to London. */
const DowryChest: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const t0 = C.dahej - 0.15;
  const t1 = C.raja + 0.2;
  if (t < t0 || t > t1 + 0.35) return null;
  const lis = toScreen(c, GEO.cities.lisbon);
  const lon = toScreen(c, GEO.cities.london);
  const q = ramp(t, C.england - 0.15, C.chale + 0.55, inOut);
  const x = lerp(lis[0] + 40, lon[0] + 30, q);
  const y = lerp(lis[1] - 20, lon[1] + 40, q) - Math.sin(q * Math.PI) * 60;
  const s = clamp01(pop(t, t0, 10, 190)) * (1 - ramp(t, t1, t1 + 0.3, easeIn)) * lerp(1, 0.78, q);
  const rise = ramp(t, C.dahej + 0.05, C.dahej + 0.55, easeOut);
  const W = 300;
  const [iw, ih] = SZ.dowry_chest;
  const H = (W * ih) / iw;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `scale(${s})` }}>
      <div style={{ position: 'absolute', left: -W / 2, top: -H, width: W, height: H, filter: 'drop-shadow(0 8px 10px rgba(20,12,4,0.5))' }}>
        <img src={img('dowry_chest')} style={{ width: W, height: H }} />
        <div style={{ position: 'absolute', left: W * 0.33, top: H * 0.06 - rise * 70, opacity: rise, transform: `rotate(${Math.sin(t * 3) * 3}deg)` }}>
          <MiniIslands w={W * 0.34} />
        </div>
      </div>
      <Label text="दहेज" t={t} t0={C.dahej + 0.1} t1={C.england + 0.2} x={0} y={-H - 70} size={54} color="#FFE07A" />
    </div>
  );
};

/** Gold tag swinging in on its cord, written on in code. */
const GoldTag: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; w?: number; lines: string[] }> = ({ t, t0, t1, x, y, w = 260, lines }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = pop(t, t0, 8, 160);
  const swing = kick(t, t0, 18, 8, 3.0);
  const out = ramp(t, t1, t1 + 0.3, easeIn);
  const [iw, ih] = SZ.price_tag_gold;
  const h = (w * ih) / iw;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      <div style={{ position: 'absolute', left: -w * 0.18, top: -h * 0.05, width: w, height: h, transformOrigin: '18% 5%',
        transform: `rotate(${swing - 6}deg) scale(${Math.max(0, s) * (1 - out)})`, filter: 'drop-shadow(0 8px 10px rgba(20,12,4,0.5))' }}>
        <img src={img('price_tag_gold')} style={{ width: w, height: h }} />
        <div style={{ position: 'absolute', left: '22%', top: '36%', width: '66%', textAlign: 'center', transform: 'rotate(8deg)' }}>
          <div style={{ fontFamily: FELL, fontSize: w * 0.34, color: '#4a2408', lineHeight: 1 }}>{lines[0]}</div>
          <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: w * 0.15, color: '#5a2c0a', marginTop: 6 }}>{lines[1]}</div>
        </div>
      </div>
    </div>
  );
};

/** The Company's suspension letter: flies in, gets stamped, then Hornby tosses it away (the seal cracks). */
const Letter: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  const t0 = C.company19 - 0.1;
  const toss = C.ruka - 0.15;
  if (t < t0 || t > toss + 0.9) return null;
  const fly = ramp(t, t0, t0 + 0.55, easeOut);
  const sx = lerp(-260, x, fly);
  const sy = lerp(260, y, fly) - Math.sin(fly * Math.PI) * 120;
  const out = ramp(t, toss, toss + 0.8, easeIn);
  const W = 380;
  const [iw, ih] = SZ.letter_wax_seal;
  const H = (W * ih) / iw;
  const crack = ramp(t, toss - 0.35, toss - 0.15, easeOut);
  return (
    <div style={{ position: 'absolute', left: sx + out * 500, top: sy - out * 260 + out * out * 900, width: 0, height: 0,
      transform: `rotate(${lerp(-25, 4, fly) + out * 160 + Math.sin(t * 2.5) * 2 * (1 - out)}deg) scale(${lerp(0.5, 1, fly) * (1 - out * 0.5)})`, opacity: 1 - ramp(t, toss + 0.5, toss + 0.85) }}>
      <div style={{ position: 'absolute', left: -W / 2, top: -H / 2, width: W, height: H, filter: 'drop-shadow(0 10px 12px rgba(20,12,4,0.5))' }}>
        <img src={img('letter_wax_seal')} style={{ width: W, height: H }} />
        {crack > 0 && (
          <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            {/* the seal sits about 63%/45% across the asset */}
            <path d={`M${W * 0.63},${H * 0.3} L${W * 0.61},${H * 0.4} L${W * 0.655},${H * 0.47} L${W * 0.625},${H * 0.6}`} fill="none" stroke="#2a0606" strokeWidth={4}
              pathLength={1} strokeDasharray={`${crack} 1`} strokeLinecap="round" />
            <path d={`M${W * 0.61},${H * 0.4} L${W * 0.56},${H * 0.43}`} fill="none" stroke="#2a0606" strokeWidth={3} pathLength={1} strokeDasharray={`${crack} 1`} />
          </svg>
        )}
      </div>
      <Stamp t={t} t0={C.suspend - 0.05} t1={toss + 0.9} text="सस्पेंड!" x={0} y={-H * 0.05} size={64} rot={-14} />
    </div>
  );
};

/** Full-screen overlays from the asset pack (black backgrounds, added with screen blending). */
const Rain: React.FC<{ a: number; t: number }> = ({ a, t }) => {
  if (a <= 0.001) return null;
  const h = 1620;
  const off = (t * 2600) % h;
  return (
    <AbsoluteFill style={{ opacity: a, mixBlendMode: 'screen', overflow: 'hidden', transform: 'rotate(8deg) scale(1.2)' }}>
      {[-1, 0, 1].map((k) => (
        <img key={k} src={img('overlay_rain')} style={{ position: 'absolute', left: 0, top: off + k * h, width: 1080, height: h }} />
      ))}
    </AbsoluteFill>
  );
};
const Surge: React.FC<{ x: number; y: number; w: number; a: number; flip?: boolean }> = ({ x, y, w, a, flip }) => {
  if (a <= 0.001) return null;
  const [iw, ih] = SZ.wave_surge;
  const h = (w * ih) / iw;
  return <img src={img('wave_surge')} style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a, mixBlendMode: 'screen', transform: flip ? 'scaleX(-1)' : undefined }} />;
};

// ---------------------------------------------------------------- the screen layer
export const ScreenLayer: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const lab = (k: keyof typeof GEO.label) => toScreen(c, GEO.label[k]);
  const temple = toScreen(c, GEO.places.mumbadevi);
  const kw = toScreen(c, GEO.places.worliKoliwada);
  const lis = toScreen(c, GEO.cities.lisbon);
  const lon = toScreen(c, GEO.cities.london);
  const vs = toScreen(c, GEO.vellard[0]);
  const ve = toScreen(c, GEO.vellard[GEO.vellard.length - 1]);
  const vm = toScreen(c, GEO.vellard[1]);
  const names: [keyof typeof GEO.label, string, number, number][] = [
    ['colaba', 'कोलाबा', C.colaba, C.bombay + 0.1], ['bombay', 'बॉम्बे', C.bombay, C.mazgaon + 0.1], ['mazagaon', 'मज़गाँव', C.mazgaon, C.parel + 0.1],
    ['parel', 'परेल', C.parel, C.worli + 0.1], ['worli', 'वर्ली', C.worli, C.mahim + 0.1], ['mahim', 'माहिम', C.mahim, C.oldw + 0.1],
    ['oldwoman', 'ओल्ड वुमन्स आइलैंड', C.oldw, C.island7 + 0.3],
  ];
  // flood front on screen (for the surge riding it)
  const ff = floodFront(t);
  const ffx = ff !== null ? toScreen(c, [ff, c.y])[0] : 0;
  const fA = ff !== null ? window4(t, C.samandar2 - 0.3, C.samandar2, C.mumbai3 - 0.3, C.mumbai3 + 0.1) : 0;
  const rainA = window4(t, C.monsoon - 0.25, C.monsoon + 0.3, C.y1782 - 0.1, C.y1782 + 0.5) * 0.75;
  const surgeA = window4(t, C.samandar16 - 0.2, C.samandar16 + 0.1, C.ghus + 0.6, C.ghus + 1.0) * 0.9;
  const sp = ramp(t, C.samandar16 - 0.2, C.ghus + 1.0, linear);
  // company ship along the route round the Cape
  const shipU = ramp(t, C.company14, C.diya + 0.4, inOut);
  const ship = toScreen(c, routePoint(ROUTE_COMPANY, shipU));
  return (
    <AbsoluteFill>
      {/* ---- hook: 2 crore people today, rolled back 200 years */}
      <Counter t={t} t0={C.crore - 0.15} t1={C.dosau + 0.1} text={(p) => indian(2e7 * p)} x={540} y={430} size={128} dur={0.9} />
      <Label text="लोग" t={t} t0={C.log - 0.05} t1={C.dosau + 0.1} x={540} y={600} size={64} color="#FFE07A" />
      <Counter t={t} t0={C.dosau - 0.05} t1={C.mumbai3 - 0.1} text={(p) => `−${Math.round(200 * p)} साल`} font={FONT} x={540} y={440} size={120} glowC="#7FD8F0" dur={1.1} />
      <Surge x={ffx - 90} y={980} w={620} a={fA * 0.6} />
      <Surge x={ffx - 120} y={1260} w={520} a={fA * 0.45} />

      {/* ---- not one city: seven islands */}
      <Label text="एक शहर" t={t} t0={C.mumbai3 + 0.2} t1={C.saat + 0.1} x={540} y={470} size={96} color="#FFF3D6" strike={C.nahi3} />
      <Counter t={t} t0={C.saat - 0.05} t1={C.colaba} text={() => '7'} x={540} y={400} size={230} glowC="#FFD45A" dur={0.2} />
      <Label text="द्वीप" t={t} t0={C.dweep4 - 0.05} t1={C.colaba} x={540} y={640} size={76} color="#FFE07A" />
      {names.map(([k, text, t0, t1]) => {
        const [x, y] = lab(k);
        return <Label key={k} text={text} t={t} t0={t0 - 0.05} t1={t1} x={x} y={y - 10} size={k === 'oldwoman' ? 58 : 76} color="#FFF6DA" arrow />;
      })}

      {/* ---- our Koli brothers, the real masters of the sea */}
      <Actor t={t} t0={C.koli8 - 0.05} t1={C.devi10 - 0.1} pose="koliwada_houses" x={S(c, 72.808, 18.9655)[0]} y={S(c, 72.808, 18.9655)[1]} h={300} bob={0} />
      <Actor t={t} t0={C.koli8 + 0.05} t1={C.devi10 - 0.2} pose="koli_fisherman" x={S(c, 72.806, 18.9575)[0]} y={S(c, 72.806, 18.9575)[1]} h={400} />
      <Actor t={t} t0={C.bhai8 - 0.05} t1={C.devi10 - 0.2} pose="koli_woman" x={S(c, 72.8255, 18.9525)[0]} y={S(c, 72.8255, 18.9525)[1]} h={380} />
      <Actor t={t} t0={C.samandar9 - 0.2} t1={C.devi10 - 0.1} pose="koli_boat" x={S(c, 72.827, 18.934)[0]} y={S(c, 72.827, 18.934)[1]} h={190} shadow={false} bob={3} sway={3}
        path={{ t0: C.samandar9 - 0.2, t1: C.devi10 + 0.2, x: S(c, 72.812, 18.938)[0], y: S(c, 72.812, 18.938)[1] }} flip drop={false} />
      <Actor t={t} t0={C.samandar9} t1={C.devi10 - 0.1} pose="koli_boat" x={S(c, 72.782, 18.952)[0]} y={S(c, 72.782, 18.952)[1]} h={160} shadow={false} bob={3} sway={4}
        path={{ t0: C.samandar9, t1: C.devi10 + 0.2, x: S(c, 72.79, 18.942)[0], y: S(c, 72.79, 18.942)[1] }} drop={false} />
      <Label text="कोली" t={t} t0={C.koli8} t1={C.malik + 0.4} x={S(c, 72.806, 18.9575)[0]} y={S(c, 72.806, 18.9575)[1] - 420} size={60} color="#FFE07A" />

      {/* ---- Mumba Devi → Mumbai */}
      <Actor t={t} t0={C.devi10 - 0.2} t1={C.y1534 - 0.05} pose="mumbadevi_temple" x={temple[0]} y={temple[1] + 40} h={560} bob={0} glow={t > C.mumba ? 'rgba(255,200,90,0.9)' : undefined} />
      <Bunting t={t} t0={C.devi10 + 0.1} t1={C.y1534 - 0.05} x={temple[0]} y={temple[1] - 360} w={420} />
      <Label text="मुंबा देवी" t={t} t0={C.mumba - 0.05} t1={C.mumbai10 - 0.05} x={540} y={430} size={92} color="#FFE07A" />
      <MumbaToMumbai t={t} />

      {/* ---- 1534: the Portuguese */}
      <Year text="1534" t={t} t0={C.y1534 - 0.05} t1={C.portu + 0.2} />
      <Actor t={t} t0={C.y1534 + 0.2} t1={C.y1661 - 0.05} pose="ship_portuguese_caravel" x={S(c, 72.60, 18.93)[0]} y={S(c, 72.60, 18.93)[1]} h={300} shadow={false} bob={3} sway={2.5} drop={false}
        path={{ t0: C.y1534 + 0.3, t1: C.kabja + 0.2, x: S(c, 72.77, 18.938)[0], y: S(c, 72.77, 18.938)[1] }} />
      <Label text="पुर्तगाली" t={t} t0={C.portu - 0.05} t1={C.y1661 - 0.05} x={540} y={470} size={88} color="#BFF0C8" />

      {/* ---- 1661: a royal wedding, the islands in the dowry */}
      <Year text="1661" t={t} t0={C.y1661 - 0.05} t1={C.dahej + 0.1} />
      <Actor t={t} t0={C.dahej - 0.2} t1={C.raja + 0.2} pose="royal_ring" x={lis[0] + 20} y={lis[1] - 230} h={150} shadow={false} drop={false} />
      <Label text="पुर्तगाल" t={t} t0={C.dahej - 0.1} t1={C.company14} x={lis[0] + 40} y={lis[1] + 90} size={50} color="#FFF6DA" />
      <DowryChest t={t} c={c} />
      <Actor t={t} t0={C.england - 0.1} t1={C.company14 + 0.3} pose="royal_crown" x={lon[0] + 10} y={lon[1] - 70} h={200} shadow={false} drop={false} />
      <Label text="इंग्लैंड" t={t} t0={C.england - 0.05} t1={C.company14 + 0.3} x={lon[0] + 20} y={lon[1] + 120} size={56} color="#FFF6DA" />
      <Label text="चार्ल्स द्वितीय" t={t} t0={C.raja - 0.05} t1={C.company14 + 0.3} x={lon[0] + 30} y={lon[1] - 290} size={46} color="#FFE07A" />
      <GoldTag t={t} t0={C.das - 0.1} t1={C.diya + 0.1} x={lon[0] + 240} y={lon[1] - 150} w={250} lines={['£10', 'सालाना']} />
      <Actor t={t} t0={C.company14 - 0.05} t1={C.kam} pose="ship_east_indiaman" x={ship[0]} y={ship[1] + 50} h={200} shadow={false} bob={3} sway={2} drop={false} flip />
      <Label text="ईस्ट इंडिया कंपनी" t={t} t0={C.company14 + 0.05} t1={C.kam} x={ship[0]} y={ship[1] - 160} size={50} color="#FFD9A0" />

      {/* ---- too little land, the monsoon sea */}
      <Label text="ज़मीन कम" t={t} t0={C.zameen15} t1={C.monsoon + 0.1} x={540} y={470} size={88} color="#FFF3D6" />
      <Actor t={t} t0={C.monsoon - 0.3} t1={C.y1782 + 0.2} pose="monsoon_cloud" x={lerp(380, 640, ramp(t, C.monsoon - 0.3, C.y1782 + 0.3, linear))} y={560} h={430} shadow={false} bob={6} drop={false} />
      <Rain a={rainA} t={t} />
      <Surge x={lerp(-200, 1200, sp)} y={1080} w={760} a={surgeA * 0.65} />
      <Surge x={lerp(-500, 900, sp)} y={1320} w={620} a={surgeA * 0.45} />

      {/* ---- 1782: Governor Hornby and the wall at Worli */}
      <Year text="1782" t={t} t0={C.y1782 - 0.05} t1={C.hornby17 + 0.1} y={430} />
      <Actor t={t} t0={C.hornby17 - 0.15} t1={C.saaton} pose="hornby_figure" x={vs[0] - 230} y={vs[1] + 150} h={460} />
      <Label text="गवर्नर हॉर्नबी" t={t} t0={C.hornby17} t1={C.deewar + 0.2} x={vs[0] - 230} y={vs[1] - 330} size={54} color="#FFE07A" />
      <Label text="वर्ली" t={t} t0={C.worli17 - 0.05} t1={C.company19} x={ve[0] + 40} y={ve[1] - 40} size={64} color="#FFF6DA" arrow />
      <Label text="दीवार" t={t} t0={C.deewar - 0.05} t1={C.company19} x={vm[0] + 170} y={vm[1] + 10} size={60} color="#FFB0A0" />
      <Letter t={t} x={760} y={560} />
      <Actor t={t} t0={C.ruka - 0.3} t1={C.saaton} pose="rubble_pile" x={vs[0] + 70} y={vs[1] + 40} h={130} bob={0} />
      <Actor t={t} t0={C.ruka - 0.1} t1={C.saaton} pose="rubble_pile" x={ve[0] + 80} y={ve[1] + 40} h={110} bob={0} flip />
      <Year text="1784" t={t} t0={C.y1784 - 0.05} t1={C.vellard + 0.1} y={430} />
      <WallCard t={t} x={800} y={1180} lineFrom={vm} />
      <Label text="हॉर्नबी वेलार्ड" t={t} t0={C.vellard - 0.05} t1={C.saaton + 0.2} x={540} y={470} size={80} color="#FFE07A" />

      {/* ---- seven become one */}
      <Counter t={t} t0={C.saaton - 0.05} t1={C.ek22} text={() => '7'} x={540} y={420} size={200} glowC="#FFD45A" dur={0.2} />
      <Counter t={t} t0={C.ek22 - 0.05} t1={C.aajbhi + 0.2} text={() => '1'} x={540} y={420} size={240} glowC="#FFD45A" dur={0.2} />

      {/* ---- still taking land from the sea: the 2024 Coastal Road */}
      <Actor t={t} t0={C.zameen23 - 0.1} t1={C.kisne} pose="crane_construction" x={S(c, 72.7995, 18.9745)[0]} y={S(c, 72.7995, 18.9745)[1]} h={330} bob={0} />
      <Year text="2024" t={t} t0={C.y2024 - 0.05} t1={C.coastal + 0.3} y={430} />
      <Label text="कोस्टल रोड" t={t} t0={C.coastal - 0.05} t1={C.kisne} x={S(c, 72.798, 19.0)[0]} y={S(c, 72.798, 19.0)[1]} size={60} color="#FFE07A" arrow />
      <Counter t={t} t0={C.ek25 - 0.05} t1={C.kisne} text={(p) => `${Math.round(100 * p)} हेक्टेयर`} font={FONT} x={540} y={440} size={104} glowC="#FFB020" dur={0.9} />

      {/* ---- who lost the most? our Koli brothers */}
      <Counter t={t} t0={C.kisne - 0.1} t1={C.wahi + 0.1} text={() => '?'} x={540} y={430} size={220} glowC="#FFFFFF" dur={0.2} font={SERIF} />
      <Actor t={t} t0={C.wahi - 0.1} t1={C.devi28 + 0.25} pose="koliwada_houses" x={kw[0] + 110} y={kw[1] + 40} h={330} bob={0} />
      <Actor t={t} t0={C.koli27 - 0.1} t1={C.devi28 + 0.3} pose="koli_fisherman" x={kw[0] - 160} y={kw[1] + 170} h={440} />
      <Actor t={t} t0={C.koli27 + 0.1} t1={C.devi28 + 0.3} pose="koli_boat" x={kw[0] - 300} y={kw[1] + 330} h={170} shadow={false} bob={3} sway={4} drop={false} />
      <Label text="वर्ली कोलीवाडा" t={t} t0={C.wahi} t1={C.devi28 + 0.2} x={kw[0] + 110} y={kw[1] - 300} size={56} color="#FFE07A" />
      {/* the goddess's temple and the city named after her */}
      <Actor t={t} t0={C.devi28 + 0.05} t1={DURATION_S + 1} pose="mumbadevi_temple" x={temple[0]} y={temple[1] + 20} h={190} bob={0} glow="rgba(255,200,90,0.95)" />
      <Label text="मुंबा देवी" t={t} t0={C.devi28 + 0.2} t1={DURATION_S + 1} x={temple[0]} y={temple[1] - 185} size={44} color="#FFE07A" />
      <Label text="मुंबई" t={t} t0={C.shahar28 - 0.1} t1={DURATION_S + 1} x={540} y={470} size={150} color="#FFF3D6" />
    </AbsoluteFill>
  );
};

/** "मुंबा" slides into "मुंबई": the name of the goddess becoming the name of the city. */
const MumbaToMumbai: React.FC<{ t: number }> = ({ t }) => {
  const t0 = C.mumbai10 - 0.05;
  const a = window4(t, t0, t0 + 0.1, C.y1534 - 0.3, C.y1534);
  if (a <= 0) return null;
  const p = ramp(t, t0, t0 + 0.45, easeOut);
  const s = 1 + kick(t, t0 + 0.45, 0.08, 18, 7);
  return (
    <div style={{ position: 'absolute', left: 540, top: 430, transform: `translate(-50%,-50%) scale(${s})`, opacity: a, whiteSpace: 'nowrap',
      fontFamily: SERIF, fontWeight: 900, fontSize: 132, color: '#FFF3D6', filter: 'drop-shadow(0 0 14px #FFC24A) drop-shadow(0 6px 10px rgba(0,0,0,0.6))' }}>
      <span>मुंब</span>
      <span style={{ display: 'inline-block', opacity: 1 - p, width: `${(1 - p) * 0.5}em`, overflow: 'hidden', verticalAlign: 'bottom' }}>ा</span>
      <span style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * -40}px)`, color: '#FFD45A' }}>ई</span>
    </div>
  );
};

/** A close-up card of the stone wall holding the sea back, linked to the line on the map. */
const WallCard: React.FC<{ t: number; x: number; y: number; lineFrom: P }> = ({ t, x, y, lineFrom }) => {
  const t0 = C.y1784 + 0.25;
  const t1 = C.saaton - 0.1;
  if (t < t0 || t > t1 + 0.3) return null;
  const s = clamp01(pop(t, t0, 10, 190)) * (1 - ramp(t, t1, t1 + 0.3, easeIn));
  const W = 400;
  const [iw, ih] = SZ.sea_wall_segment;
  const H = (W * ih) / iw;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: s }}>
        <path d={`M${lineFrom[0]},${lineFrom[1]} L${x - W * 0.3},${y - H * 0.2}`} stroke="#FFE7A0" strokeWidth={3} strokeDasharray="8 6" />
        <circle cx={lineFrom[0]} cy={lineFrom[1]} r={10} fill="none" stroke="#FFE7A0" strokeWidth={3} />
      </svg>
      <div style={{ position: 'absolute', left: x - W / 2, top: y - H / 2, width: W, height: H, transform: `scale(${s}) rotate(${Math.sin(t * 1.6) * 1.2}deg)`,
        filter: 'drop-shadow(0 10px 14px rgba(10,8,4,0.6))' }}>
        <img src={img('sea_wall_segment')} style={{ width: W, height: H }} />
      </div>
    </>
  );
};

// ---------------------------------------------------------------- frame-level
/** Chart (history) vs satellite (today): satellite for the hook and from "आज भी" to the end. */
export const satAt = (t: number) => 1 - window4(t, C.dosau + 0.05, C.pehle + 0.35, C.aajbhi - 0.1, C.samandar23 + 0.3);

export const shake = (t: number): [number, number] => {
  let x = 0, y = 0;
  for (const [t0, a] of [[C.y1534, 9], [C.y1661, 9], [C.ghus, 12], [C.y1782, 9], [C.suspend, 10], [C.y1784, 11], [C.ek22, 10], [C.y2024, 8]] as [number, number][]) {
    x += kick(t, t0, a, 31, 9);
    y += kick(t, t0 + 0.02, a * 0.7, 27, 9);
  }
  return [x, y];
};

/** Vignette, a warm paper grade on the chart, grain, storm darkening and lightning. */
export const Grade: React.FC<{ t: number; sat: number }> = ({ t, sat }) => {
  const storm = window4(t, C.monsoon - 0.3, C.monsoon + 0.3, C.y1782 - 0.2, C.y1782 + 0.5);
  const bolt = Math.max(
    window4(t, C.samandar16 - 0.05, C.samandar16, C.samandar16 + 0.04, C.samandar16 + 0.18),
    window4(t, C.ghus + 0.25, C.ghus + 0.28, C.ghus + 0.31, C.ghus + 0.45) * 0.7,
  );
  const flash = Math.max(
    window4(t, C.ek22 - 0.03, C.ek22, C.ek22 + 0.04, C.ek22 + 0.3) * 0.6,
    window4(t, C.pehle - 0.05, C.pehle, C.pehle + 0.05, C.pehle + 0.35) * 0.5,
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 52%, rgba(30,20,8,0.45) 100%)' }} />
      {sat > 0.01 && <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,20,30,0.25), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(10,15,20,0.35))', opacity: sat }} />}
      {storm > 0 && <AbsoluteFill style={{ background: 'rgba(15,25,40,0.38)', mixBlendMode: 'multiply', opacity: storm }} />}
      {bolt > 0 && <AbsoluteFill style={{ background: '#dfe9ff', opacity: bolt * 0.55, mixBlendMode: 'screen' }} />}
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

export { COL, easeIn, easeOut, inOut, linear };
