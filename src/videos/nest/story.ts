// Samulation #3 "Nest of Bees": timeline. Everything is keyed to the creator's VO words (words.json, 48.43 s) and runs
// at 60 fps. Rules: .claude/skills/samulation-shorts/reference/13-rulebook-25-refs.md (actions +2 f after their word
// at 30 fps = +4 f here, wind-up from -12 f, dissolves on sentence starts, the camera never stops).
import WORDS from "./words.json";

export const FPS = 60;
export const VO_LEN = 48.43;
export const TOTAL = Math.round((VO_LEN + 0.28) * FPS);
export type V3 = [number, number, number];
export type Word = { w: string; s: number; e: number };
export const W: Word[] = WORDS as Word[];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** onset (s) of the n-th occurrence of a word (case/punctuation-insensitive) */
export const wordAt = (w: string, n = 0) => {
  const key = w.toLowerCase().replace(/[^a-z0-9]/g, "");
  const hits = W.filter((x) => x.w.toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(key));
  return hits[Math.min(n, hits.length - 1)]?.s ?? 0;
};

// ---------------- shot 1 (hook, 0 - 1.25 s): "You'd laugh at this beehive." ----------------
// The hero drills the last hole of the honeycomb plate with a brace drill. Brace turns at 1.25 rev/s.
export const BRACE_RPS = 1.25;

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
/** camera of shot 1: a 3/4 view on the plate face, continuous push-in (~0.3 %/frame at 30 fps), slight dutch */
export const camHook = (t: number): Cam => {
  const k = t / 1.25;
  const pos = lerp3([-3.15, 1.32, 12.95], [-3.0, 1.31, 12.62], k);
  return { pos, look: [-0.08, 1.12, 7.95], fov: 44, roll: (-2.5 * Math.PI) / 180 };
};
