import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Watermark } from '../../brand/Watermark';
import { clamp01, easeOut, inOut, linear, pop, ramp } from '../../darien/anim';
import { AUS_MPP, C, CAPS, CLOSE_MPP, Cam, DURATION_S, FENCE_PT, GEO, LOOPF, P, camAt, camMotion, fencePart, lineD, merc, ringsD, rotAt, shake, toS, toW } from './cam';
import { Parchment, Post, Settler, Sheep, Ship, Trap } from './Cartoon';
import { Clouds, Grade, HiFill, MAP_GRADE } from './Fx';
import { LABEL, SERIF, TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';
import { Board, Hand, K } from './Props';
import sizes from '../../../public/dingofence/img/img_sizes.json';

export const DG_DURATION_60 = Math.round(DURATION_S * 60);
const FPS = 60;
const F = (s: number) => Math.round(s * FPS);
const AUDIO = 'dingofence/audio/mix.wav';
const IMG = (k: string) => staticFile(`dingofence/img/${k}.png`);
const SZ = sizes as unknown as Record<string, { w: number; h: number; lens?: [number, number, number] }>;
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(ramp(t, a, a + fi, linear), 1 - ramp(t, b - fo, b, linear));
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const BLUE = '#3FA9FF', FENCE_RED = '#FF3B3B';

// ------------------------------------------------------------------ small parts
const Big: React.FC<{ text: string; size: number; color?: string }> = ({ text, size, color = K.gold }) => (
  <span style={{ fontFamily: TITLE, fontSize: size, lineHeight: 1, color, WebkitTextStroke: `${Math.round(size / 11)}px ${K.ink}`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const Tag: React.FC<{ text: React.ReactNode; color?: string; size?: number }> = ({ text, color = K.gold, size = 40 }) => (
  <div style={{ padding: `${size * 0.14}px ${size * 0.5}px`, background: 'rgba(10,15,22,0.88)', border: `${Math.max(3, size / 10)}px solid ${color}`, borderRadius: size * 0.3, fontFamily: TITLE, fontSize: size, color: '#fff', whiteSpace: 'nowrap', letterSpacing: 1, boxShadow: `0 0 ${size * 0.5}px ${color}55, 0 8px 18px rgba(0,0,0,0.5)` }}>{text}</div>
);
const At: React.FC<{ x: number; y: number; p?: number; o?: number; rot?: number; children: React.ReactNode }> = ({ x, y, p = 1, o = 1, rot = 0, children }) =>
  p <= 0 || o <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: o }}>{children}</div>;
/** A cut-out image of width w centred at (x, y), with a soft contact shadow. */
const Cut: React.FC<{ k: string; x: number; y: number; w: number; o?: number; rot?: number; flip?: boolean; filter?: string; shadow?: boolean }> = ({ k, x, y, w, o = 1, rot = 0, flip, filter, shadow = true }) => {
  if (o <= 0 || w <= 0) return null;
  const h = (w * SZ[k].h) / SZ[k].w;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: o, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})` }}>
      {shadow && <div style={{ position: 'absolute', left: w * 0.12, right: w * 0.12, bottom: -h * 0.04, height: h * 0.1, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', filter: 'blur(10px)' }} />}
      <Img src={IMG(k)} style={{ position: 'absolute', inset: 0, width: w, height: h, filter: filter ?? 'drop-shadow(0 12px 16px rgba(0,0,0,0.35))' }} />
    </div>
  );
};
const Arrow: React.FC<{ x: number; y: number; p: number; rot?: number }> = ({ x, y, p, rot = 0 }) =>
  p <= 0 ? null : <svg width={80} height={110} viewBox="-40 -100 80 110" style={{ position: 'absolute', left: x - 40, top: y - 110, transform: `scale(${p}) rotate(${rot}deg)`, transformOrigin: '50% 100%', overflow: 'visible', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.55))' }}><path d="M-12 -96 H12 V-40 H32 L0 0 L-32 -40 H-12 Z" fill="#fff" /></svg>;

// ------------------------------------------------------------------ the satellite map scene
const fenceIdxNear = (lon: number) => { const x = merc(lon, 0)[0]; let best = 0; GEO.fence.forEach((p, i) => { if (Math.abs(p[0] - x) < Math.abs(GEO.fence[best][0] - x)) best = i; }); return best; };
const DINGO_PT = GEO.fence[fenceIdxNear(140.2)];
const CHUNKS = 7;

const MapVectors: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  // the hook: the whole fence flashes on, the continent splits in two along it
  const hook = win(t, C.n5614 - 0.1, C.look - 0.1, 0.2, 0.5);
  const hookP = ramp(t, C.n5614 - 0.1, C.km0 + 0.3, inOut);
  const split = win(t, C.cut, C.look - 0.2, 0.3, 0.5);
  // line 3: the fence draws west to east
  const draw = ramp(t, C.runs + 0.3, C.three + 1.3, inOut);
  const l3 = win(t, C.runs + 0.2, C.dingo + 0.4, 0.2, 0.3);
  // line 10: the old red pieces, joined, turning blue; then the two sides
  const fin = t > C.by - 0.2;
  const sides = ramp(t, C.sheepside - 0.1, C.sheepside + 0.5, inOut) * (1 - ramp(t, DURATION_S - 0.9, DURATION_S - 0.3, linear));
  const sideD = ramp(t, C.most - 0.1, C.most + 0.5, inOut) * (1 - ramp(t, DURATION_S - 0.9, DURATION_S - 0.3, linear));
  const close = c.mpp < 400;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="glow2"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      {!close && <path d={ringsD(c, GEO.countries.Australia)} fill="none" stroke="#fff" strokeWidth={2.5} opacity={0.7} />}
      {!close && <path d={ringsD(c, Object.values(GEO.states).flat())} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.35} />}
      {split > 0 && (
        <g>
          <g transform={`translate(${-10 * split} ${-14 * split})`}><HiFill id="hs1" t={t} d={ringsD(c, GEO.sides.dingo)} color="#FF9A3C" g={split} alpha={0.28} /></g>
          <g transform={`translate(${10 * split} ${14 * split})`}><HiFill id="hs2" t={t} d={ringsD(c, GEO.sides.sheep)} color="#7FD36B" g={split} alpha={0.28} /></g>
        </g>
      )}
      {hook > 0 && <FenceLine c={c} pts={fencePart(hookP)} color={BLUE} o={hook} w={6} />}
      {l3 > 0 && !close && <FenceLine c={c} pts={fencePart(draw)} color={BLUE} o={l3} w={7} />}
      {close && t < C.three + 0.6 && <CloseFence c={c} t={t} />}
      {fin && Array.from({ length: CHUNKS }, (_, i) => {
        const a = i / CHUNKS, b = (i + 1) / CHUNKS, m = (a + b) / 2;
        const t0 = C.y1940 + 0.05 + i * 0.18;
        const g = ramp(t, t0, t0 + 0.5, easeOut) * 0.55 + ramp(t, C.joined - 0.1, C.joined + 0.7, inOut) * 0.45;
        const half = ((b - a) / 2) * Math.min(1.04, g);
        if (g <= 0) return null;
        const blue = ramp(t, C.giant - 0.15 + i * 0.07, C.giant + 0.15 + i * 0.07, linear);
        const col = blue >= 1 ? BLUE : blue <= 0 ? FENCE_RED : `rgb(${Math.round(255 + (63 - 255) * blue)},${Math.round(59 + (169 - 59) * blue)},${Math.round(59 + (255 - 59) * blue)})`;
        return <FenceLine key={i} c={c} pts={fencePart(Math.min(1, m + half), Math.max(0, m - half))} color={col} o={1 - ramp(t, DURATION_S - 0.9, DURATION_S - 0.3, linear)} w={7 + 3 * Math.exp(-6 * Math.max(0, t - C.giant))} />;
      })}
      {sides > 0 && <HiFill id="sheepside" t={t} d={ringsD(c, GEO.sides.sheep)} color="#7FD36B" g={sides} alpha={0.32} />}
      {sideD > 0 && <HiFill id="dingoside" t={t} d={ringsD(c, GEO.sides.dingo)} color="#FF9A3C" g={sideD} alpha={0.3} />}
    </svg>
  );
};
/** The fence as a glowing line: a wide soft glow, a white core, its colour on top. */
const FenceLine: React.FC<{ c: Cam; pts: P[]; color: string; o: number; w: number }> = ({ c, pts, color, o, w }) => {
  if (pts.length < 2 || o <= 0) return null;
  const d = lineD(c, pts);
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke={color} strokeWidth={w * 4} strokeLinecap="round" strokeLinejoin="round" filter="url(#glow2)" opacity={0.75} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={w * 1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};
/** The close-up: the fence drawn as a real fence, a pale track beside a line of posts every ~60 m. */
const CloseFence: React.FC<{ c: Cam; t: number }> = ({ c }) => {
  const pts = GEO.fence.map((p) => toS(c, p)).filter(([x, y]) => x > -400 && x < 1480 && y > -400 && y < 2320);
  if (pts.length < 2) return null;
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
  const posts: P[] = [];
  const step = 60 / c.mpp;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const L = Math.hypot(x1 - x0, y1 - y0);
    for (let s = 0; s < L; s += step) posts.push([x0 + ((x1 - x0) * s) / L, y0 + ((y1 - y0) * s) / L]);
  }
  return (
    <g>
      <path d={d} fill="none" stroke="#E9D9BF" strokeWidth={26} strokeLinecap="round" opacity={0.55} transform="translate(0 14)" />
      <path d={d} fill="none" stroke="#2A1E14" strokeWidth={5} opacity={0.6} transform="translate(2 4)" />
      <path d={d} fill="none" stroke="#D9DDE2" strokeWidth={3} />
      {posts.slice(0, 400).map(([x, y], i) => <rect key={i} x={x - 2.5} y={y - 9} width={5} height={12} rx={1.5} fill="#5B4A3A" />)}
    </g>
  );
};

const MapOverlays: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const s = (p: P) => toS(c, p);
  const tip = fencePart(ramp(t, C.runs + 0.3, C.three + 1.3, inOut));
  const [tx, ty] = tip.length ? s(tip[tip.length - 1]) : [0, 0];
  const hookTip = fencePart(ramp(t, C.n5614 - 0.1, C.km0 + 0.3, inOut));
  const [hx, hy] = hookTip.length ? s(hookTip[hookTip.length - 1]) : [0, 0];
  const [dx, dy] = s(DINGO_PT);
  const [fx, fy] = s(FENCE_PT);
  return (
    <AbsoluteFill>
      {/* the hook: the km counter rides the fence as it flashes on */}
      {t > C.n5614 - 0.1 && t < C.look - 0.1 && <At x={Math.min(860, Math.max(220, hx))} y={hy - 70} o={win(t, C.n5614 - 0.1, C.look - 0.1, 0.15, 0.4)}><Tag text={`${fmt(5614 * ramp(t, C.n5614 - 0.1, C.km0 + 0.3, inOut))} KM`} size={44} color={BLUE} /></At>}
      {t > C.cut && t < C.look - 0.1 && <At x={540} y={420} p={pop(t, C.cut, 10, 200)} o={1 - ramp(t, C.look - 0.4, C.look - 0.1, linear)}><Big text="CUT IN TWO" size={120} color="#fff" /></At>}
      {/* the close-up: handwritten Fence */}
      {c.mpp < 400 && t > C.is + 0.5 && t < C.runs + 0.5 && (
        <div style={{ opacity: 1 - ramp(t, C.runs + 0.2, C.runs + 0.5, linear) }}>
          <Hand text="Fence" x={fx - 30} y={fy - 190} size={110} p={ramp(t, C.is + 0.6, C.is + 1.0, linear)} rot={-10} color="#fff" />
          <Arrow x={fx} y={fy - 10} p={pop(t, C.is + 0.75, 10, 200)} rot={8} />
        </div>
      )}
      {/* line 3: the counter riding the drawn fence, then its final tag */}
      {t > C.runs + 0.3 && t < C.longer + 0.2 && c.mpp > 400 && <At x={Math.min(830, Math.max(250, tx))} y={ty - 64} o={win(t, C.runs + 0.3, C.longer + 0.2, 0.2, 0.3)}><Tag text={<>{fmt(5614 * ramp(t, C.runs + 0.3, C.three + 1.3, inOut))} KM <span style={{ fontSize: 26, opacity: 0.85 }}>({fmt(3488 * ramp(t, C.runs + 0.3, C.three + 1.3, inOut))} MI)</span></>} size={44} color={BLUE} /></At>}
      <StatesLift t={t} c={c} />
      {/* line 4: the dingo silhouette on the fence */}
      {t > C.oneanimal - 0.1 && t < C.dingo + 0.15 && (
        <>
          <Cut k="d01_dingo_stand" x={dx} y={dy - 50 - (1 - pop(t, C.oneanimal, 10, 190)) * 120} w={180 * pop(t, C.oneanimal, 10, 190)} filter="brightness(0) drop-shadow(0 0 10px rgba(255,255,255,0.6))" shadow={false} />
          <Arrow x={dx + 10} y={dy - 140} p={pop(t, C.thisone - 0.1, 10, 200)} rot={-12} />
        </>
      )}
      {/* line 11: sheep on one side, dingoes on the other */}
      {t > C.sheepside && SHEEP_PTS.map(([lon, lat], i) => { const [x, y] = s(merc(lon, lat)); const q = pop(t, C.sheepside + 0.1 + i * 0.06, 10, 200) * (1 - ramp(t, DURATION_S - 0.9, DURATION_S - 0.3, linear)); return q > 0 ? <svg key={i} width={1} height={1} style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }}><Sheep s={1.35 * q} bob={Math.abs(Math.sin(t * 6 + i))} /></svg> : null; })}
      {t > C.most && DINGO_PTS.map(([lon, lat], i) => { const [x, y] = s(merc(lon, lat)); const q = pop(t, C.most + 0.1 + i * 0.06, 10, 200) * (1 - ramp(t, DURATION_S - 0.9, DURATION_S - 0.3, linear)); return q > 0 ? <Cut key={i} k="d01_dingo_stand" x={x} y={y - 20} w={130 * q} flip={i % 2 === 1} /> : null; })}
      {t > C.whos - 0.05 && <At x={540} y={360} p={pop(t, C.whos, 9, 210)} o={1 - ramp(t, DURATION_S - 0.9, DURATION_S - 0.4, linear)} rot={Math.sin(t * 3) * 6}><Big text="?" size={260} color="#fff" /></At>}
    </AbsoluteFill>
  );
};
const SHEEP_PTS: [number, number][] = [[142, -34], [145.2, -35.1], [147.4, -33.2], [149.2, -31], [146, -30.6], [143.4, -32.2], [150.4, -28.7], [148, -36.2], [144.2, -36.6], [140.4, -33.6], [138.6, -33.2], [147.8, -29.3]];
const DINGO_PTS: [number, number][] = [[121.5, -25], [127, -22], [132.4, -20], [135, -24.5], [128.8, -28.4], [119.6, -30.2], [125.4, -17.8], [138.6, -22.4], [143.4, -20.2], [131.2, -15.8], [117.4, -26.8], [146.6, -22.6]];

/** The three states the fence crosses lift off the map as paper pieces, each on its name. */
const StatesLift: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const list: [string, string, number][] = [['South Australia', 'sa', C.sa], ['New South Wales', 'nsw', C.nsw], ['Queensland', 'qld', C.qld]];
  const out = 1 - ramp(t, C.longer - 0.5, C.longer - 0.1, linear);
  if (t < C.sa - 0.1 || out <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {list.map(([n, id, t0]) => {
        if (t < t0 - 0.05) return null;
        const lift = pop(t, t0 - 0.05, 9, 170);
        const d = ringsD(c, GEO.states[n]);
        const [x, y] = toS(c, GEO.statePts[n]);
        return (
          <React.Fragment key={id}>
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
              <path d={d} fill="#000" opacity={0.4 * lift} transform={`translate(${10 * lift} ${26 * lift})`} style={{ filter: 'blur(8px)' }} />
              <g transform={`translate(0 ${-22 * lift})`}>
                <path d={d} fill="#F4F1EA" opacity={0.92} stroke="#fff" strokeWidth={5} />
                <path d={d} fill="none" stroke="#B8B2A6" strokeWidth={2} transform="translate(0 6)" opacity={0.6} />
              </g>
            </svg>
            <At x={x} y={y - 22 * lift} p={pop(t, t0, 11, 190)}><span style={{ fontFamily: SERIF, fontSize: 40, color: '#2B2B2B', whiteSpace: 'nowrap' }}>{n}</span></At>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the magnifying glass (line 2)
const lensAt = (t: number) => {
  const pts: [number, number, number][] = [[C.look - 0.15, -320, 1650], [C.look + 0.45, 420, 880], [C.no + 0.6, 470, 850], [C.notthere + 0.15, 330, 720], [C.there - 0.05, 553, 940]];
  let x = pts[0][1], y = pts[0][2];
  for (let i = 1; i < pts.length; i++) {
    const [t0, x0, y0] = pts[i - 1], [t1, x1, y1] = pts[i];
    if (t >= t0) { const q = inOut(clamp01((t - t0) / (t1 - t0))); x = x0 + (x1 - x0) * q; y = y0 + (y1 - y0) * q; }
  }
  const grow = ramp(t, C.is - 0.05, C.is + 0.55, (q) => q * q * (3 - 2 * q));
  return { x: x + (540 - x) * grow, y: y + (960 - y) * grow, r: 290 + (1180 - 290) * grow, grow };
};
const Magnifier: React.FC<{ t: number; main: Cam }> = ({ t, main }) => {
  if (t < C.look - 0.2 || t > C.is + 0.56) return null;
  const L = lensAt(t);
  const under = toW(main, [L.x, L.y]);
  const dive = ramp(t, C.there - 0.05, C.is + 0.55, (q) => q * q);
  const mpp = Math.exp(Math.log(main.mpp / 5) + (Math.log(CLOSE_MPP) - Math.log(main.mpp / 5)) * dive);
  const f = clamp01(ramp(t, C.there - 0.2, C.is + 0.3, inOut));
  const lc: Cam = { x: under[0] + (FENCE_PT[0] - under[0]) * f, y: under[1] + (FENCE_PT[1] - under[1]) * f, mpp };
  const sz = SZ.d06_magnifier_hand, lens = sz.lens as [number, number, number];
  const k = L.r / lens[2];
  const w = sz.w * k, h = sz.h * k;
  const handDrop = L.grow * 900;
  const gag = win(t, C.no - 0.05, C.notthere + 0.1, 0.1, 0.2);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: L.x - L.r, top: L.y - L.r, width: 2 * L.r, height: 2 * L.r, borderRadius: '50%', overflow: 'hidden', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }}>
        <div style={{ position: 'absolute', left: -(L.x - L.r), top: -(L.y - L.r), width: 1080, height: 1920, filter: MAP_GRADE }}>
          <MapLayers c={lc} />
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}><CloseFence c={lc} t={t} /></svg>
          {gag > 0 && <Cut k="d08_kangaroo" x={L.x + 40} y={L.y + 10} w={220 * pop(t, C.no - 0.05, 10, 200)} o={gag} />}
          {t > C.there - 0.05 && <Arrow x={L.x + 4} y={L.y - 14} p={pop(t, C.there, 10, 200) * (1 - L.grow)} />}
        </div>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.28), rgba(255,255,255,0) 40%)' }} />
      </div>
      <Img src={IMG('d06_magnifier_hand')} style={{ position: 'absolute', left: L.x - lens[0] * k, top: L.y - lens[1] * k + handDrop, width: w, height: h, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the London-New York comparison panel (line 3)
const ATL: P = (() => { const n = GEO.londonNY.length; return [GEO.londonNY.reduce((a, p) => a + p[0], 0) / n, GEO.londonNY.reduce((a, p) => a + p[1], 0) / n - 600000]; })();
const Compare: React.FC<{ t: number }> = ({ t }) => {
  const a = C.longer - 0.25, b = C.built - 0.3;
  if (t < a || t > b + 0.45) return null;
  const x = 1080 - 540 * (ramp(t, a, a + 0.45, inOut) - ramp(t, b, b + 0.45, inOut));
  const c: Cam = { x: ATL[0], y: ATL[1], mpp: 21500 * (1 - 0.03 * ramp(t, a, b, linear)) };
  const draw = ramp(t, C.london - 0.1, C.ny + 0.3, inOut);
  const n = Math.max(2, Math.round(GEO.londonNY.length * draw));
  const pts = GEO.londonNY.slice(0, n);
  const [lx, ly] = toS(c, GEO.points.London), [nx, ny] = toS(c, GEO.points['New York']);
  const [ex, ey] = toS(c, pts[pts.length - 1]);
  return (
    <div style={{ position: 'absolute', left: x, top: 0, width: 540, height: 1920, overflow: 'hidden', borderLeft: '6px solid #fff', boxShadow: '-20px 0 40px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: -270, top: 0, width: 1080, height: 1920 }}>
        <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={c} /></AbsoluteFill>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <defs><filter id="glowc"><feGaussianBlur stdDeviation="10" /></filter></defs>
          <path d={lineD(c, pts)} fill="none" stroke={BLUE} strokeWidth={22} filter="url(#glowc)" opacity={0.8} />
          <path d={lineD(c, pts)} fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
          <path d={lineD(c, pts)} fill="none" stroke={BLUE} strokeWidth={5} strokeLinecap="round" />
          <circle cx={lx} cy={ly} r={10} fill="#fff" stroke={K.ink} strokeWidth={3} />
          {draw > 0.98 && <circle cx={nx} cy={ny} r={10} fill="#fff" stroke={K.ink} strokeWidth={3} />}
        </svg>
        <At x={lx + 30} y={ly - 50} p={pop(t, C.london - 0.1, 11, 190)}><span style={{ fontFamily: SERIF, fontSize: 42, color: '#fff', textShadow: '0 3px 10px rgba(0,0,0,0.8)' }}>London</span></At>
        <At x={nx - 20} y={ny + 52} p={pop(t, C.ny, 11, 190)}><span style={{ fontFamily: SERIF, fontSize: 42, color: '#fff', textShadow: '0 3px 10px rgba(0,0,0,0.8)' }}>New York</span></At>
        <At x={(lx + nx) / 2} y={Math.min(ly, ey) - 120} p={pop(t, C.ny + 0.2, 10, 200)}><Tag text={`${fmt(5570 * ramp(t, C.london - 0.1, C.ny + 0.3, inOut))} KM`} size={46} color={BLUE} /></At>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ the blueprint board (the dingo)
const BoardScene: React.FC<{ t: number }> = ({ t }) => {
  const intro = t < C.wild;
  const line = win(t, C.wild - 0.05, C.sprint - 0.05, 0.3, 0.3);
  const run = t > C.sprint - 0.3 && t < C.then + 0.6;
  // line-up sizes by shoulder height: Jack Russell ~30 cm, dingo ~55 cm, golden retriever ~58 cm
  const hpx = 300;
  const wOf = (k: string, cm: number) => (hpx * (cm / 55) * SZ[k].w) / SZ[k].h;
  const lp = ramp(t, C.wild - 0.05, C.wild + 0.45, inOut);
  const speed = Math.round(48 * ramp(t, C.sprint + 0.3, C.hour + 0.2, (q) => q * (2 - q)));
  const leap = ramp(t, C.hunted - 0.4, C.kangaroos + 0.05, (q) => q);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Board dy={t * 12} dx={t * 6} />
      {/* the dingo arrives from the wash, then joins the line-up */}
      {(intro || line > 0) && (
        <>
          <Cut k="d01_dingo_stand" x={540 + (540 - 540) * lp} y={900 + (930 - 900) * lp} w={(760 + (wOf('d01_dingo_stand', 55) - 760) * lp) * (intro ? Math.min(1, 0.4 + 0.6 * pop(t, C.dingo - 0.05, 12, 150)) : 1)} o={intro ? 1 : line} />
          {intro && <><Hand text="Dingo" x={430} y={560} size={130} p={ramp(t, C.dingo + 0.05, C.dingo + 0.5, linear)} rot={-8} color="#fff" /><Arrow x={560} y={720} p={pop(t, C.dingo + 0.3, 10, 200)} rot={20} /></>}
          {!intro && (
            <>
              <Cut k="d04_dog_small" x={210} y={930 + (hpx - hpx * (30 / 55)) / 2} w={wOf('d04_dog_small', 30) * pop(t, C.size - 0.1, 10, 190)} o={line} />
              <Cut k="d05_dog_large" x={865} y={930 - (hpx * (58 / 55) - hpx) / 2} w={wOf('d05_dog_large', 58) * pop(t, C.medium - 0.05, 10, 190)} o={line} />
              <At x={540} y={1180} p={pop(t, C.medium + 0.3, 10, 200)} o={line}><Tag text={<>11–24 KG <span style={{ fontSize: 30, opacity: 0.85 }}>(24–53 LB)</span></>} size={50} color={K.gold} /></At>
              <At x={540} y={640} p={pop(t, C.wild, 11, 190)} o={line}><Tag text="WILD DOG" size={46} color="#fff" /></At>
            </>
          )}
        </>
      )}
      {/* the treadmill, the speed, the leap at the kangaroo */}
      {run && (
        <div style={{ position: 'absolute', inset: 0, opacity: win(t, C.sprint - 0.3, C.then + 0.6, 0.3, 0.01) }}>
          <Cut k="d07_treadmill" x={460 - leap * 700} y={1150} w={820} />
          {leap < 0.02 && <Cut k="d02_dingo_run" x={460 + Math.sin(t * 9) * 8} y={1000 - Math.abs(Math.sin(t * 9)) * 22} w={640} rot={Math.sin(t * 9) * 2} />}
          {leap >= 0.02 && leap < 1 && <Cut k="d03_dingo_leap" x={460 + leap * 260} y={980 - Math.sin(leap * Math.PI) * 240} w={640} rot={-8 + 16 * leap} />}
          {leap >= 1 && <Cut k="d01_dingo_stand" x={330} y={1010} w={560} />}
          {t < C.hunted && <At x={540} y={560} p={pop(t, C.sprint, 10, 190)}><Big text={`${speed} KM/H`} size={130} /></At>}
          {t > C.hunted - 0.1 && <At x={540} y={520} p={pop(t, C.hunted, 10, 190)}><Tag text="ITS PREY" size={48} color="#fff" /></At>}
          {t > C.kangaroos - 0.1 && <Cut k="d08_kangaroo" x={800} y={960 + Math.sin(t * 5) * 6} w={440 * pop(t, C.kangaroos - 0.05, 9, 200)} rot={Math.sin(t * 4) * 2} />}
          {t > C.small - 0.1 && [[640, 1190, 0], [960, 1215, 0.12]].map(([x, y, d]) => <Cut key={x} k="d08_kangaroo" x={x} y={y} w={150 * pop(t, C.small + d, 10, 200)} flip={x > 900} />)}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the parchment map (history)
const ParchmentScene: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const s = (lon: number, lat: number) => toS(c, merc(lon, lat));
  const [bx, by] = s(151.25, -34.0);
  const farm = s(148.6, -33.2);
  const shipP = (d: number): P => { const q = ramp(t, C.europeans - 0.9 + d, C.brought - 0.3 + d * 0.5, inOut); return s(112 + (151.5 - 112) * q, -46 + (-34.2 + 46) * q - Math.sin(q * Math.PI) * 4); };
  const sheepLost = ramp(t, C.losing - 0.2, C.so + 0.3, linear);
  const angry = t > C.farmers - 0.1 ? 1 : 0;
  const posts = ramp(t, C.building - 0.2, C.fences + 0.5, linear);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Parchment c={c} />
      {t > C.y1788 - 0.1 && t < C.brought && (
        <At x={540} y={360} p={pop(t, C.y1788 - 0.05, 10, 180)} o={1 - ramp(t, C.brought - 0.4, C.brought, linear)}>
          <div style={{ padding: '6px 70px', background: 'linear-gradient(180deg, #D7A848, #A87A22)', borderRadius: 8, boxShadow: '0 10px 20px rgba(70,45,20,0.45)', fontFamily: SERIF, fontSize: 120, color: '#3E2C1E', clipPath: 'polygon(0 0, 100% 0, 94% 50%, 100% 100%, 0 100%, 6% 50%)' }}>1788</div>
        </At>
      )}
      {t > C.europeans - 1.0 && t < C.fora + 1.0 && [0, 0.25, 0.5].map((d, i) => { const [x, y] = shipP(d); return <svg key={i} width={1} height={1} style={{ position: 'absolute', left: x + i * 34, top: y + i * 26, overflow: 'visible', opacity: 1 - ramp(t, C.fora + 0.4, C.fora + 1.0, linear) }}><Ship s={1.25} rock={Math.sin(t * 3 + i) * 4} /></svg>; })}
      {t > C.brought - 0.1 && (
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {[[0, 0, '#2F4A7A'], [60, 18, '#7A3A2F']].map(([dx, dy, coat], i) => {
            const q = pop(t, C.brought + i * 0.15, 11, 180);
            return <g key={i} transform={`translate(${farm[0] + 250 + (dx as number) * 1.5 + (t > C.fora ? -60 : 0)} ${farm[1] + 120 + (dy as number)})`}><Settler s={2.0 * q} coat={coat as string} mood={angry} rifle={t > C.guns - 0.2} arm={ramp(t, C.guns - 0.2, C.guns + 0.3, easeOut)} /></g>;
          })}
          {SHEEP_FIELD.map(([dx, dy], i) => {
            const q = pop(t, C.sheep1 - 0.1 + i * 0.07, 10, 200);
            const lost = sheepLost * SHEEP_FIELD.length > SHEEP_FIELD.length - 1 - i ? 1 - clamp01((sheepLost * SHEEP_FIELD.length - (SHEEP_FIELD.length - 1 - i)) * 2) : 1;
            return q > 0 && lost > 0 ? <g key={i} transform={`translate(${farm[0] + dx * 1.7} ${farm[1] + dy * 1.7})`} opacity={lost}><Sheep s={1.8 * q} flip={i % 3 === 0} bob={Math.abs(Math.sin(t * 5 + i)) * (t > C.fora ? 1 : 0.3)} /></g> : null;
          })}
          {t > C.traps - 0.2 && [0, 1, 2].map((i) => { const q = ramp(t, C.traps - 0.1 + i * 0.12, C.traps + 0.4 + i * 0.12, easeOut); return <g key={i} transform={`translate(${farm[0] + 160 - q * (260 + i * 70)} ${farm[1] + 40 - Math.sin(q * Math.PI) * 120 + i * 30})`}><Trap s={1.2} /></g>; })}
          {posts > 0 && Array.from({ length: 9 }, (_, i) => { const q = pop(t, C.building - 0.2 + i * 0.07, 10, 200); const x = farm[0] - 330 + i * 52, y = farm[1] - 210 + i * 46; return q > 0 ? <g key={i} transform={`translate(${x} ${y - (1 - q) * 200})`}><Post h={80} /></g> : null; })}
          {posts > 0.3 && [0, 26].map((o) => <line key={o} x1={farm[0] - 330} y1={farm[1] - 260 + o} x2={farm[0] - 330 + 8 * 52 * clamp01((posts - 0.3) / 0.7)} y2={farm[1] - 260 + o + 8 * 46 * clamp01((posts - 0.3) / 0.7)} stroke="#6B6F75" strokeWidth={3} />)}
        </svg>
      )}
      {t > C.fora - 0.2 && DINGO_PACK.map(([dx, dy], i) => {
        const run = ramp(t, C.fora - 0.1 + i * 0.05, C.meal + i * 0.05, inOut);
        const x = farm[0] - 800 + (dx * 1.6 + 600) * run, y = farm[1] + dy * 1.6;
        return <Cut key={i} k="d02_dingo_run" x={x} y={y - 20 + Math.sin(t * 10 + i) * 4} w={250} filter="sepia(0.35) saturate(1.1) drop-shadow(0 8px 8px rgba(60,40,20,0.35))" />;
      })}
      {t > C.y1940 - 0.4 ? null : t > C.losing - 0.1 && <At x={540} y={380} p={pop(t, C.losing, 10, 200)} o={1 - ramp(t, C.so + 0.2, C.so + 0.5, linear)}><div style={{ padding: '4px 30px', background: '#F4EBD6', border: '5px solid #A8322D', borderRadius: 10, fontFamily: SERIF, fontSize: 64, color: '#A8322D', transform: 'rotate(-4deg)' }}>SHEEP LOST</div></At>}
    </AbsoluteFill>
  );
};
const SHEEP_FIELD: P[] = [[-40, 20], [20, -10], [80, 30], [-100, 60], [-20, 80], [60, 95], [120, -30], [-140, -10], [10, 150], [-80, 140]];
const DINGO_PACK: P[] = [[-120, -60], [-60, 10], [-160, 60], [-40, 110], [-110, 150], [10, 60]];

// ------------------------------------------------------------------ scene switching
/** What is on screen: 'map', 'board' (24-36.4, with the wash in and the whip out), 'parch' (36.4-53.5). */
const washMask = (m: number, x: number, y: number) => [0, 0.08, 0.16, 0.24].map((d, i) => { const r = Math.max(0, (m - d) / (1 - d)) * 2300; const ox = [0, 160, -140, 60][i], oy = [0, -120, 90, 200][i]; return `radial-gradient(circle at ${x + ox * (m)}px ${y + oy * m}px, #000 ${r * 0.8}px, transparent ${r}px)`; }).join(',');

// ------------------------------------------------------------------ Null (split screen, middle only)
const NULL_WIN = () => [
  { name: 'A', t0: C.wild - 0.1, t1: C.home + 0.5, from: 0.1 },
  { name: 'B', t0: C.farmers, t1: C.so - 0.15, from: 0.2 },
];
const BAND_TOP = 470;
const splitAt = (t: number) => {
  for (const w of NULL_WIN()) {
    const q = Math.min(ramp(t, w.t0 - 0.2, w.t0 + 0.2, inOut), 1 - ramp(t, w.t1 - 0.2, w.t1 + 0.2, inOut));
    if (q > 0) return { q, w };
  }
  return null;
};
const NullPanel: React.FC<{ t: number; q: number; name: string; t0: number; t1: number; from: number }> = ({ t, q, name, t0, t1, from }) => (
  <div style={{ position: 'absolute', left: 0, top: 1920 - 960 * q, width: 1080, height: 960, overflow: 'hidden', background: '#05080d', borderTop: '6px solid #fff' }}>
    <div style={{ position: 'absolute', left: 0, top: -BAND_TOP, width: 1080, height: 1920, transformOrigin: `540px ${BAND_TOP + 300}px`, transform: `scale(${1.12 + 0.04 * ramp(t, t0, t1, inOut)})` }}>
      <Sequence from={F(t0 - 0.2)} durationInFrames={F(t1 - t0 + 0.6)} layout="none">
        <OffthreadVideo src={staticFile(`dingofence/null/null_dg_${name}.mp4`)} muted startFrom={Math.max(0, Math.round((from - 0.2) * 24))} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    </div>
    <div style={{ position: 'absolute', right: 18, bottom: 14, fontFamily: LABEL, fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>AI-generated host</div>
  </div>
);

// ------------------------------------------------------------------ captions, credits
const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t < 0.3 || t > DURATION_S - 0.3) return null;
  let i = -1;
  for (let k = 0; k < CAPS.length; k++) if (CAPS[k][0] <= t) i = k;
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const words = CAPS.slice(g, g + 3);
  const last = words[words.length - 1];
  if (t > last[0] + 1.2 && (!CAPS[g + 3] || t < CAPS[g + 3][0])) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: 1470, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 62, lineHeight: 1.15, color: '#fff', textTransform: 'uppercase',
      WebkitTextStroke: `10px ${K.ink}`, paintOrder: 'stroke fill', textShadow: '0 6px 16px rgba(0,0,0,0.6)' }}>
      {words.map(([wt, w], k) => <span key={k} style={{ opacity: t >= wt ? 1 : 0, color: g + k === i ? K.gold : '#fff' }}>{w} </span>)}
    </div>
  );
};
const CREDIT = 'Sentinel-2 cloudless 2024 by EOX (CC BY 4.0) · relief: AWS Terrain Tiles · fence: © OpenStreetMap contributors (ODbL) · borders, land: Natural Earth';

export const DingoFence: React.FC<{ audio?: string; captions?: boolean }> = ({ audio = AUDIO, captions = true }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const c0 = camAt(t);
  const [sx, sy] = shake(t);
  const mv = camMotion(t);
  const blur = Math.min(14, Math.hypot(mv.vx, mv.vy) * 0.06 + mv.zoom * 6);
  const split = splitAt(t);
  const off = split ? -480 * split.q : 0;
  const rot = rotAt(t);
  // scenes
  const washIn = ramp(t, C.dingo - 0.05, C.dingo + 0.65, (q) => q * q * (3 - 2 * q));
  const whip = ramp(t, C.then - 0.05, C.then + 0.3, inOut);
  const boardOn = t > C.dingo - 0.05 && t < C.then + 0.3;
  const parchOn = t > C.then - 0.05 && t < C.y1940 + 0.6;
  const parchToSat = ramp(t, C.by - 0.1, C.y1940 + 0.5, inOut);
  const mapOn = !boardOn || washIn < 1;
  const [dsx, dsy] = toS(c0, DINGO_PT);
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      {mapOn && !(parchOn && parchToSat <= 0 && t > C.then + 0.3) && (
        <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy + off}px)` }}>
          <AbsoluteFill style={{ transform: rot > 0.05 ? `rotate(${rot}deg) scale(${1 + 0.18 * Math.sin((rot / 180) * Math.PI)})` : undefined, filter: blur > 0.6 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
            <AbsoluteFill style={{ filter: MAP_GRADE }}><MapLayers c={c0} /></AbsoluteFill>
            <Clouds t={t} a={clamp01((c0.mpp - 150) / 600)} />
            <MapVectors t={t} c={c0} />
          </AbsoluteFill>
          <Grade t={t} />
          <MapOverlays t={t} c={c0} />
        </AbsoluteFill>
      )}
      <Magnifier t={t} main={c0} />
      <Compare t={t} />
      {boardOn && (
        <AbsoluteFill style={{ transform: `translate(${-whip * 1080}px, ${off}px)`, filter: whip > 0.02 && whip < 0.98 ? `blur(${(Math.sin(whip * Math.PI) * 30).toFixed(1)}px)` : undefined, ...(washIn < 1 ? { WebkitMaskImage: washMask(washIn, dsx, dsy), maskImage: washMask(washIn, dsx, dsy) } : {}) }}>
          <BoardScene t={t} />
          <Grade t={t} board />
        </AbsoluteFill>
      )}
      {parchOn && (
        <AbsoluteFill style={{ transform: `translate(${(1 - whip) * 1080}px, ${off}px)`, opacity: 1 - parchToSat, filter: whip > 0.02 && whip < 0.98 ? `blur(${(Math.sin(whip * Math.PI) * 30).toFixed(1)}px)` : undefined }}>
          <ParchmentScene t={t} c={c0} />
          <Grade t={t} board />
        </AbsoluteFill>
      )}
      {split && <NullPanel t={t} q={split.q} {...split.w} />}
      {captions && !split && <Captions t={t} />}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, textAlign: 'center', fontFamily: LABEL, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{CREDIT}</div>
      <Watermark t={t} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
export { AUS_MPP, LOOPF };
