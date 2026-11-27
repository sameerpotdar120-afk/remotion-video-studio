// Layered photo-cutout engine (from the Caesar/Napoleon Shorts, extended: several faces per image, glow eyes, grades).
// Composition space is 1080x1920; render with --scale=2 for 2160x3840 (4K). Images are 2560-3840 px, so they stay sharp.
import React, { createContext, useContext } from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ASPECT, BBOX, FACES } from "./data";
import { GooglyEyes, type Mood } from "./GooglyEyes";
import { CartoonMouth, type Viseme } from "./CartoonMouth";
import { mouthTimeline } from "./LipSync";
import { WORDS } from "./data";

export const W = 1080, H = 1920;
export const src = (k: string) => staticFile(`lighthouse/${k}.webp`);

// ---------- time helpers ----------
export const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
export const ease = Easing.bezier(0.33, 0, 0.2, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.9, 0.5);
/** keyframes: [[t, v], ...] with smooth easing between keys */
export const kf = (t: number, keys: [number, number][], e = ease) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
    return v0 + (v1 - v0) * e((t - t0) / Math.max(1e-6, t1 - t0));
  }
  return keys[keys.length - 1][1];
};
export const lin = (t: number, a: number, b: number, v0: number, v1: number) =>
  interpolate(t, [a, b], [v0, v1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
/** smooth noise in -1..1 */
export const wob = (t: number, speed: number, seed: number) => {
  const x = t * speed, i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f);
  const a = random(`w${seed}:${i}`) * 2 - 1, b = random(`w${seed}:${i + 1}`) * 2 - 1;
  return a + (b - a) * s;
};

// ---------- camera with parallax ----------
export type Cam = { x: number; y: number; zoom: number; rot: number };
const CamCtx = createContext<Cam>({ x: 0, y: 0, zoom: 1, rot: 0 });
export const Scene: React.FC<{ cam?: Partial<Cam>; shake?: number; shakeSeed?: number; children: React.ReactNode; grade?: string }> = ({ cam, shake = 0, shakeSeed = 1, children, grade }) => {
  const t = useT();
  const c: Cam = { x: 0, y: 0, zoom: 1, rot: 0, ...cam };
  if (shake > 0) { c.x += wob(t, 22, shakeSeed) * shake; c.y += wob(t, 25, shakeSeed + 7) * shake; c.rot += wob(t, 15, shakeSeed + 3) * shake * 0.02; }
  return <CamCtx.Provider value={c}><AbsoluteFill style={{ overflow: "hidden", background: "#000", filter: grade }}>{children}</AbsoluteFill></CamCtx.Provider>;
};
/** wraps content in the camera transform at depth z (0 = infinitely far, 1 = subject plane, >1 = foreground) */
export const Depth: React.FC<{ z: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ z, children, style }) => {
  const c = useContext(CamCtx);
  const s = 1 + (c.zoom - 1) * z;
  return <AbsoluteFill style={{ transform: `translate(${W / 2}px,${H / 2}px) rotate(${c.rot * Math.min(1, z)}deg) scale(${s}) translate(${-c.x * z - W / 2}px,${-c.y * z - H / 2}px)`, transformOrigin: "0 0", ...style }}>{children}</AbsoluteFill>;
};

// ---------- background plate ----------
/** cover the frame; `over` extra scale so the camera can move; panX/panY -1..1 slide across the spare image */
export const Bg: React.FC<{ k: string; z?: number; over?: number; panX?: number; panY?: number; blur?: number; filter?: string }> = ({ k, z = 0.35, over = 1.12, panX = 0, panY = 0, blur = 0, filter = "" }) => {
  const a = ASPECT[k];
  let w = W * over, h = w / a; if (h < H * over) { h = H * over; w = h * a; }
  const x = (W - w) / 2 + (-panX * (w - W)) / 2, y = (H - h) / 2 + (-panY * (h - H)) / 2;
  return <Depth z={z}><Img src={src(k)} style={{ position: "absolute", left: x, top: y, width: w, height: h, filter: `${blur ? `blur(${blur}px)` : ""} ${filter}` }} /></Depth>;
};

// ---------- cut-out actor ----------
export type Eyes = { mood?: Mood; lookX?: number; lookY?: number; lid?: number; pupil?: number; shake?: number; seed?: number; scale?: number; browAngle?: number; browUp?: number; motionFrame?: number };
export type Mouth = Viseme | { lip: [number, number] } | { lip: [number, number]; base: Viseme };
export type ActorProps = {
  k: string | string[];      // one pose, or a cycle of poses
  fps?: number;              // cycle speed (poses per second)
  cycleStart?: number;       // seconds offset into the cycle
  x: number; y: number;      // where the figure's feet (bbox bottom, image centre-x) go, in composition px (pre-camera)
  h: number;                 // full image height in px
  z?: number; rot?: number; sx?: number; sy?: number; flip?: boolean; opacity?: number;
  anchorY?: "feet" | "center" | number; // number = fraction of image height
  eyes?: Eyes | null; mouth?: Mouth | null; face?: boolean; only?: number[]; eyesEach?: Partial<Eyes>[]; mouthEach?: (Mouth | null)[];
  shadow?: number;           // contact shadow strength 0..1
  blur?: number; trail?: [number, number]; // motion trail vector in px (ghost copies behind the motion)
  filter?: string;
  children?: React.ReactNode; // extra layers in the actor's image space (e.g. rabbits clinging on), px relative to image top-left
};
const poseAt = (k: string | string[], t: number, fps: number) => Array.isArray(k) ? k[Math.floor(Math.max(0, t) * fps) % k.length] : k;

export const Actor: React.FC<ActorProps> = (p) => {
  const t = useT(); const { fps: vfps } = useVideoConfig(); const frame = useCurrentFrame();
  const cyc = p.fps ?? 10; const tt = t + (p.cycleStart ?? 0);
  const cur = poseAt(p.k, tt, cyc), prev = poseAt(p.k, tt - 1 / vfps, cyc);
  const swapped = cur !== prev; // 2-frame blur crossfade on pose swaps, like the reference
  const prev2 = poseAt(p.k, tt - 2 / vfps, cyc); const swapped2 = !swapped && prev2 !== cur;
  return <Depth z={p.z ?? 1}>
    {p.shadow ? <Shadow x={p.x} y={p.y} w={p.h * ASPECT[cur] * (BBOX[cur][2] - BBOX[cur][0]) * 0.8} s={p.shadow} /> : null}
    {p.trail ? [3, 2, 1].map((i) => <Figure key={`tr${i}`} {...p} k={cur} x={p.x - p.trail![0] * i / 3} y={p.y - p.trail![1] * i / 3} opacity={(p.opacity ?? 1) * 0.22} eyes={null} mouth={null} children={null} frame={frame} />) : null}
    {swapped ? <Figure {...p} k={prev} opacity={(p.opacity ?? 1) * 0.55} blurExtra={3} frame={frame} eyes={null} mouth={null} /> : null}
    <Figure {...p} k={cur} blurExtra={swapped ? 2.5 : swapped2 ? 1 : 0} frame={frame} />
  </Depth>;
};

const Shadow: React.FC<{ x: number; y: number; w: number; s: number }> = ({ x, y, w, s }) =>
  <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.09, width: w, height: w * 0.18, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(10,8,5,${0.55 * s}), rgba(10,8,5,0))`, filter: "blur(4px)" }} />;

const Figure: React.FC<ActorProps & { k: string; blurExtra?: number; frame: number }> = (p) => {
  const a = ASPECT[p.k], bb = BBOX[p.k];
  const h = p.h, w = h * a;
  const ay = p.anchorY === "center" ? 0.5 : typeof p.anchorY === "number" ? p.anchorY : bb[3];
  const left = p.x - w / 2, top = p.y - h * ay;
  const faces = FACES[p.k] || [];
  const blur = (p.blur ?? 0) + (p.blurExtra ?? 0);
  return <div style={{ position: "absolute", left, top, width: w, height: h, opacity: p.opacity ?? 1,
    transform: `rotate(${p.rot ?? 0}deg) scale(${(p.flip ? -1 : 1) * (p.sx ?? 1)},${p.sy ?? 1})`, transformOrigin: `50% ${ay * 100}%` }}>
    <Img src={src(p.k)} style={{ width: w, height: h, filter: `${blur > 0 ? `blur(${blur}px)` : ""} ${p.filter ?? ""}` }} />
    {p.face !== false && (p.eyes || p.mouth) ? faces.map((f, i) => (p.only && !p.only.includes(i)) ? null : <FaceRig key={i} f={f} w={w} h={h} eyes={p.eyes ? { ...p.eyes, seed: (p.eyes.seed ?? 1) * 7 + i, ...(p.eyesEach?.[i] ?? {}) } : null} mouth={p.mouthEach?.[i] ?? p.mouth} flip={p.flip} />) : null}
    {p.children}
  </div>;
};

// ---------- googly eyes + cartoon mouth placed on the real face ----------
const FaceRig: React.FC<{ f: (typeof FACES)[string][number]; w: number; h: number; eyes?: Eyes | null; mouth?: Mouth | null; flip?: boolean }> = ({ f, w, h, eyes, mouth, flip }) => {
  const t = useT(); const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const lx = f.le[0] * w, ly = f.le[1] * h, rx = f.re[0] * w, ry = f.re[1] * h;
  const dist = Math.max(Math.hypot(rx - lx, ry - ly), w * 0.03);
  const cx = (lx + rx) / 2, cy = (ly + ry) / 2;
  const es = eyes?.scale ?? 1;
  const size = dist * (eyes?.mood === 'glow' ? 0.75 : 0.72) * es, gap = Math.max(size * 0.08, dist - size);
  const pad = size * 0.38, ew = 2 * size + gap + 2 * pad, eh = size + 2 * pad;
  const ang = f.angle * (flip ? -1 : 1);
  // mouth
  let vis: Viseme | null = null, from: Viseme = "rest", tf = 2;
  if (mouth) {
    if (typeof mouth === "string") vis = mouth;
    else {
      const [a, b] = mouth.lip; const base: Viseme = "base" in mouth ? mouth.base : "rest";
      const tl = mouthTimeline(WORDS.filter((x) => x.s >= a - 0.01 && x.e <= b + 0.01));
      let i = tl.findIndex((s) => t >= s.s && t < s.e); if (i < 0) i = tl.length - 1;
      vis = tl[i].viseme === "rest" ? base : tl[i].viseme; from = i > 0 ? (tl[i - 1].viseme === "rest" ? base : tl[i - 1].viseme) : base; tf = (t - tl[i].s) * fps;
    }
  }
  const mw = Math.max(f.mouthW * w * 1.05, dist * 0.58) * (eyes?.scale ? Math.sqrt(es) : 1);
  const mx = f.mouth[0] * w, my = f.mouth[1] * h;
  return <>
    {eyes ? <div style={{ position: "absolute", left: cx - ew / 2, top: cy - eh / 2, width: ew, height: eh }}>
      <GooglyEyes size={size} gap={gap} rotate={ang} mood={eyes.mood} lookX={eyes.lookX} lookY={eyes.lookY} lid={eyes.lid} pupil={eyes.pupil} shake={eyes.shake} seed={eyes.seed ?? 1} browAngle={eyes.browAngle} browUp={eyes.browUp} motionFrame={eyes.motionFrame ?? frame} />
    </div> : null}
    {vis ? <div style={{ position: "absolute", left: mx - (mw * 1.2) / 2, top: my - mw * 0.5, width: mw * 1.2, height: mw * 1.04 }}>
      <CartoonMouth width={mw} rotate={ang} viseme={vis} fromViseme={from} transitionFrame={tf} />
    </div> : null}
  </>;
};

// ---------- plain sprite (FX, props) ----------
export const Sprite: React.FC<{ k: string; x: number; y: number; w: number; z?: number; rot?: number; opacity?: number; blur?: number; blend?: React.CSSProperties["mixBlendMode"]; flip?: boolean; sy?: number; filter?: string; origin?: string }> = (p) => {
  const a = ASPECT[p.k], h = p.w / a;
  return <Depth z={p.z ?? 1}><Img src={src(p.k)} style={{ position: "absolute", left: p.x - p.w / 2, top: p.y - h / 2, width: p.w, height: h, opacity: p.opacity ?? 1,
    transform: `rotate(${p.rot ?? 0}deg) scale(${p.flip ? -1 : 1},${p.sy ?? 1})`, transformOrigin: p.origin ?? "50% 50%", filter: `${p.blur ? `blur(${p.blur}px)` : ""} ${p.filter ?? ""}`, mixBlendMode: p.blend }} /></Depth>;
};

// ---------- finishing: vignette, warm light, grain ----------
export const Finish: React.FC<{ vignette?: number; warm?: number }> = ({ vignette = 0.45, warm = 0.0 }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ pointerEvents: "none" }}>
    {warm > 0 ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at 70% 15%, rgba(255,190,110,${warm}), rgba(255,190,110,0) 60%)`, mixBlendMode: "screen" }} /> : null}
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)` }} />
    <svg width={W} height={H} style={{ position: "absolute", opacity: 0.07, mixBlendMode: "overlay" }}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} /></filter>
      <rect width={W} height={H} filter="url(#grain)" />
    </svg>
  </AbsoluteFill>;
};

/** quick white-ish flash / impact frame */
export const Flash: React.FC<{ at: number; dur?: number; color?: string; max?: number }> = ({ at, dur = 0.12, color = "#fff", max = 0.6 }) => {
  const t = useT(); const o = t < at ? 0 : lin(t, at, at + dur, max, 0);
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} /> : null;
};
