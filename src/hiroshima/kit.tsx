import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import META from './assets.generated.json';

/** Vertical 4K stage. Everything is laid out in these pixels (the reference is 720×1280, so ×3). */
export const HW = 2160;
export const HH = 3840;
export const FPS = 60;

type Meta = { w: number; h: number; box?: [number, number, number, number] };
const M = META as unknown as Record<string, Meta>;
export const src = (p: string) => staticFile(`hiroshima/assets/${p}`);
export const meta = (p: string) => {
  const m = M[p];
  if (!m) throw new Error(`missing asset ${p}`);
  return m;
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = {
  inOut: Easing.bezier(0.45, 0, 0.55, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.33, 0, 0.67, 1),
};
/** 0→1 over [a, a+d] with easing. */
export const ramp = (f: number, a: number, d: number, e: (t: number) => number = ease.inOut) => e(clamp01((f - a) / Math.max(1, d)));

/** Keyframed value: keys [[frame, value], ...] eased between neighbours. */
export const keys = (f: number, k: [number, number][], e: (t: number) => number = ease.inOut) => {
  if (f <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (f <= k[i][0]) return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * e((f - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
  }
  return k[k.length - 1][1];
};

/* ───────────── camera + parallax layers ───────────── */
type Cam = { z: number; x: number; y: number };
const CamCtx = createContext<Cam>({ z: 1, x: 0, y: 0 });
/** Camera for one shot. z = zoom (1 = stage fills the frame), x/y = stage pixels the view centre moves by. */
export const Shot: React.FC<{ z?: [number, number][]; x?: [number, number][]; y?: [number, number][]; e?: (t: number) => number; bg?: string; children: React.ReactNode }> = ({ z, x, y, e = ease.inOut, bg = '#000', children }) => {
  const f = useCurrentFrame();
  const cam = { z: z ? keys(f, z, e) : 1, x: x ? keys(f, x, e) : 0, y: y ? keys(f, y, e) : 0 };
  return (
    <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
      <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>
    </AbsoluteFill>
  );
};
/** A parallax layer: depth 1 moves with the camera, <1 slower (far), >1 faster (near). */
export const Layer: React.FC<{ depth?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ depth = 1, children, style }) => {
  const c = useContext(CamCtx);
  const z = 1 + (c.z - 1) * depth;
  return (
    <AbsoluteFill style={{ transform: `translate(${HW / 2}px, ${HH / 2}px) scale(${z}) translate(${-HW / 2 - c.x * depth}px, ${-HH / 2 - c.y * depth}px)`, transformOrigin: '0 0', ...style }}>
      {children}
    </AbsoluteFill>
  );
};

/** Background plate covering the stage (cover-fit), optionally oversized for camera moves. */
export const Plate: React.FC<{ p: string; scale?: number; ox?: number; oy?: number; filter?: string }> = ({ p, scale = 1, ox = 0, oy = 0, filter }) => {
  const m = meta(p);
  const k = Math.max(HW / m.w, HH / m.h) * scale;
  const w = m.w * k, h = m.h * k;
  return <Img src={src(p)} style={{ position: 'absolute', width: w, height: h, left: (HW - w) / 2 + ox, top: (HH - h) / 2 + oy, filter }} />;
};

/** Place an image by its drawn content: (x, y) is where the anchor point of the content box lands, h = content height. */
export const Art: React.FC<{
  p: string; x: number; y: number; h: number; anchor?: [number, number]; rot?: number; pivot?: [number, number];
  flip?: boolean; opacity?: number; filter?: string; sx?: number; sy?: number; style?: React.CSSProperties;
}> = ({ p, x, y, h, anchor = [0.5, 1], rot = 0, pivot, flip, opacity = 1, filter, sx = 1, sy = 1, style }) => {
  const m = meta(p); const b = m.box ?? [0, 0, 1, 1];
  const k = h / ((b[3] - b[1]) * m.h);
  const W = m.w * k, H = m.h * k;
  const ax = (b[0] + anchor[0] * (b[2] - b[0])) * W, ay = (b[1] + anchor[1] * (b[3] - b[1])) * H;
  const pv = pivot ? [(b[0] + pivot[0] * (b[2] - b[0])) * W, (b[1] + pivot[1] * (b[3] - b[1])) * H] : [ax, ay];
  return (
    <Img src={src(p)} style={{
      position: 'absolute', left: x - ax, top: y - ay, width: W, height: H, opacity, filter,
      transformOrigin: `${pv[0]}px ${pv[1]}px`, transform: `rotate(${rot}deg) scale(${(flip ? -1 : 1) * sx}, ${sy})`, ...style,
    }} />
  );
};

/** Body + separately drawn arm, fitted in body-canvas fractions (measured with scripts/../armfit).
 *  arm pivot (fraction of arm canvas) sits on att (fraction of body canvas); s = arm canvas scale vs body canvas;
 *  cut = polygon (body fractions) where the arm is hidden; stub = polygon of the body redrawn over the arm. */
export type ArmFit = { arm: string; piv: [number, number]; att: [number, number]; s: number; cut?: [number, number][]; stub?: [number, number][] };
export const Rig: React.FC<{ body: string; fit: ArmFit; r: number; x: number; y: number; h: number; flip?: boolean; rot?: number; bob?: number; only?: 'body' | 'arm'; style?: React.CSSProperties }> = ({ body, fit, r, x, y, h, flip, rot = 0, bob = 0, only, style }) => {
  const m = meta(body); const b = m.box ?? [0, 0, 1, 1]; const am = meta(fit.arm);
  const k = h / ((b[3] - b[1]) * m.h);
  const W = m.w * k, H = m.h * k;
  const left = x - (b[0] + 0.5 * (b[2] - b[0])) * W, top = y - b[3] * H;
  const aw = am.w * k * fit.s, ah = am.h * k * fit.s;
  const ax = fit.att[0] * W - fit.piv[0] * aw, ay = fit.att[1] * H - fit.piv[1] * ah;
  const poly = (pts: [number, number][]) => pts.map(([px, py]) => `${px * W}px ${py * H}px`).join(', ');
  const cutPath = fit.cut ? `path(evenodd, 'M0 0 H${W} V${H} H0 Z M${fit.cut.map(([px, py]) => `${px * W} ${py * H}`).join(' L')} Z')` : undefined;
  return (
    <div style={{ position: 'absolute', left, top, width: W, height: H, transformOrigin: `${(b[0] + b[2]) / 2 * W}px ${b[3] * H}px`, transform: `translateY(${bob}px) rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, ...style }}>
      {only !== 'arm' && <Img src={src(body)} style={{ position: 'absolute', inset: 0, width: W, height: H }} />}
      {only !== 'body' && <div style={{ position: 'absolute', inset: 0, clipPath: cutPath }}>
        <Img src={src(fit.arm)} style={{ position: 'absolute', left: ax, top: ay, width: aw, height: ah, transformOrigin: `${fit.piv[0] * aw}px ${fit.piv[1] * ah}px`, transform: `rotate(${r}deg)` }} />
      </div>}
      {fit.stub && only !== 'body' && <Img src={src(body)} style={{ position: 'absolute', inset: 0, width: W, height: H, clipPath: `polygon(${poly(fit.stub)})` }} />}
    </div>
  );
};

/** Screen position of a point on the arm (fraction of the arm canvas) for a Rig placed at x, y, h with arm angle r (no flip/rot/bob). */
export const rigPoint = (body: string, fit: ArmFit, x: number, y: number, h: number, r: number, pt: [number, number]) => {
  const m = meta(body); const b = m.box ?? [0, 0, 1, 1]; const am = meta(fit.arm);
  const k = h / ((b[3] - b[1]) * m.h), W = m.w * k, H = m.h * k;
  const left = x - (b[0] + 0.5 * (b[2] - b[0])) * W, top = y - b[3] * H;
  const aw = am.w * k * fit.s, ah = am.h * k * fit.s;
  const px = fit.att[0] * W, py = fit.att[1] * H; // pivot on screen (relative to the body box)
  const dx = (pt[0] - fit.piv[0]) * aw, dy = (pt[1] - fit.piv[1]) * ah, a = (r * Math.PI) / 180;
  return [left + px + dx * Math.cos(a) - dy * Math.sin(a), top + py + dx * Math.sin(a) + dy * Math.cos(a)] as const;
};

export const FITS = {
  kenjiEat: { arm: 'chars/kenji_eat_arm.png', piv: [0.12, 0.33], att: [0.27, 0.37], s: 0.5 } as ArmFit,
  hanaTea: { arm: 'chars/hana_tea_arm.png', piv: [0.11, 0.36], att: [0.29, 0.41], s: 0.47, cut: [[0, 0], [0.33, 0], [0.33, 0.33], [0.26, 0.36], [0, 0.39]] } as ArmFit,
  hanaSit: { arm: 'chars/hana_sit_arm.png', piv: [0.12, 0.27], att: [0.32, 0.42], s: 0.5 } as ArmFit,
  soldierCrank: {
    arm: 'chars/soldier_siren_arm.png', piv: [0.13, 0.1], att: [0.24, 0.315], s: 0.36,
    cut: [[0, 0], [0.4, 0], [0.4, 0.3], [0.25, 0.33], [0.21, 0.37], [0, 0.4]],
    stub: [[0.08, 0.22], [0.3, 0.22], [0.3, 0.34], [0.22, 0.385], [0.08, 0.36]],
  } as ArmFit,
};

/* ───────────── captions (the reference's word-pop system) ───────────── */
import CAPS from './captions.generated.json';
type CapWord = { t: string; line: number; red: boolean; at: number; redOut?: number };
type Cap = { text: string; words: CapWord[]; start: number; end: number };
/** Word pop measured on the reference: ~55 % on its first frame, overshoot ~115 %, settled by frame 5. */
const POP = [0.55, 1.12, 1.15, 1.07, 1.02, 1];
export const CAP_SIZE = 124; // px at 2160 wide (cap height ≈ 5 % of the frame width, as in the reference)
export const Captions: React.FC<{ y?: number }> = ({ y = HH * 0.69 }) => {
  const f = useCurrentFrame();
  const cap = (CAPS as Cap[]).find((c) => f >= c.start && f < c.end);
  if (!cap) return null;
  const lines: CapWord[][] = [];
  cap.words.forEach((w) => { (lines[w.line] ??= []).push(w); });
  const style: React.CSSProperties = {
    fontFamily: 'Nunito', fontWeight: 900, fontSize: CAP_SIZE, lineHeight: 1.02, letterSpacing: -1, textTransform: 'uppercase',
    WebkitTextStroke: '20px #0b0b0b', paintOrder: 'stroke fill', textShadow: '8px 12px 14px rgba(0,0,0,0.45)',
  };
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y - CAP_SIZE * 0.55, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: 'flex', gap: CAP_SIZE * 0.26, whiteSpace: 'nowrap' }}>
            {ln.map((w, wi) => {
              const k = f - w.at;
              const gone = w.redOut !== undefined && f >= w.redOut;
              const s = k < 0 ? 0 : POP[Math.min(k, POP.length - 1)];
              return (
                <span key={wi} style={{ ...style, color: w.red ? '#e5161f' : '#ffffff', display: 'inline-block', visibility: k < 0 || gone ? 'hidden' : 'visible', transform: `scale(${s})`, transformOrigin: '50% 60%' }}>
                  {w.t}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── countdown stopwatch ───────────── */
/** Card pop measured on all 8 reference cards (scale per frame), then hold. */
const CARD_POP = [0.5, 0.57, 0.66, 0.73, 0.82, 0.89, 0.97, 1.05, 1.13, 1.1, 1.08, 1.05, 1.02, 1];
const WATCH_W = HW * 0.62; // stopwatch content width on screen
export const Stopwatch: React.FC<{ n: number; x?: number; y?: number; scale?: number; rot?: number; opacity?: number; blur?: number }> = ({ n, x = HW / 2, y = HH * 0.48, scale = 1, rot = 0, opacity = 1, blur = 0 }) => {
  const p = 'props/stopwatch_empty.png'; const m = meta(p); const b = m.box!;
  const w = WATCH_W, k = w / ((b[2] - b[0]) * m.w), W = m.w * k, H = m.h * k;
  const fx = 0.5 * W, fy = 0.593 * H, faceD = 0.61 * W; // glass face centre / diameter (measured)
  const watch = (
    <div style={{ position: 'absolute', left: x - fx, top: y - fy, width: W, height: H, transformOrigin: `${fx}px ${fy}px`, transform: `rotate(${rot}deg) scale(${scale})`, opacity, filter: blur ? `blur(${blur}px)` : undefined }}>
      <Img src={src(p)} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
      <div style={{
        position: 'absolute', left: fx - faceD / 2, top: fy - faceD / 2, width: faceD, height: faceD, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Nunito', fontWeight: 900, fontSize: faceD * (n >= 10 ? 0.5 : 0.62), color: '#e3141c', letterSpacing: -6,
        WebkitTextStroke: '14px #2a0507', paintOrder: 'stroke fill', textShadow: '0 0 30px rgba(255,30,30,0.35)', lineHeight: 1, paddingTop: faceD * 0.02,
      }}>{n}</div>
    </div>
  );
  return watch;
};
/** Full-screen countdown card on black: the measured 14-frame pop, then hold. */
export const CountCard: React.FC<{ n: number; at?: number; fade?: [number, number][] }> = ({ n, at = 0, fade }) => {
  const f = useCurrentFrame() - at;
  const s = CARD_POP[Math.min(Math.max(f, 0), CARD_POP.length - 1)];
  const o = fade ? keys(f, fade) : 1;
  return (
    <AbsoluteFill style={{ background: '#000', opacity: o }}>
      <Stopwatch n={n} scale={s} />
    </AbsoluteFill>
  );
};
/** The opening "60": spins in over the first shot and spins out (reference f6–15 in, f65–75 out). */
export const SpinWatch: React.FC<{ n: number; inAt: number; outAt: number }> = ({ n, inAt, outAt }) => {
  const f = useCurrentFrame();
  const tin = clamp01((f - inAt) / 9), tout = clamp01((f - outAt) / 10);
  if (f < inAt || tout >= 1) return null;
  const rot = -100 * (1 - ease.out(tin)) + 100 * ease.in(tout);
  const o = ease.out(tin) * (1 - ease.in(tout));
  const blur = 18 * (1 - tin) + 18 * tout;
  // motion-blur trail: two faint ghosts behind the spin direction
  const ghosts = tin < 1 || tout > 0 ? [1, 2].map((g) => <Stopwatch key={g} n={n} rot={rot + (tout > 0 ? -g * 14 : g * 14)} opacity={o * 0.25 / g} blur={blur + 10} />) : null;
  return (
    <AbsoluteFill>
      {ghosts}
      <Stopwatch n={n} rot={rot} opacity={o} blur={blur} />
    </AbsoluteFill>
  );
};

/* ───────────── light / transitions ───────────── */
/** Vertical whip blur: stacked offset copies (directional blur), used for the bomb → couple transition. */
export const WhipBlur: React.FC<{ amount: number; children: React.ReactNode }> = ({ amount, children }) => {
  if (amount <= 0.01) return <>{children}</>;
  const n = 7;
  return (
    <AbsoluteFill>
      {Array.from({ length: n }, (_, i) => {
        const d = (i - (n - 1) / 2) * amount * 120;
        return <AbsoluteFill key={i} style={{ transform: `translateY(${d}px)`, opacity: i === (n - 1) / 2 ? 1 : 0.45, filter: `blur(${amount * 10}px)` }}>{children}</AbsoluteFill>;
      })}
    </AbsoluteFill>
  );
};

/** Deterministic pseudo-random. */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
