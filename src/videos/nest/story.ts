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
  const hits = W.filter((x) => x.w.toLowerCase().replace(/[^a-z0-9]/g, "") === key);
  return hits[Math.min(n, hits.length - 1)]?.s ?? 0;
};

// ---------------- shots (all times = VO word onsets; dissolves start on the first word of a sentence) ----------------
export const BRACE_RPS = 1.25;
export const T = {
  beehive: wordAt("beehive"),              // 1.12: camera lands on the plate, bit backs out, last hole revealed
  but: wordAt("but"),                      // 2.12: dissolve to the wall top
  y1380: wordAt("1380"),                   // 2.48: torch touches the rope
  it: wordAt("it", 0),                     // 3.70: dissolve behind the launcher
  fire: wordAt("fire"),                    // 3.92: first rocket leaves (+4 f)
  at: wordAt("at", 1),                     // 5.48: dissolve onto the hill
  blink: wordAt("blink"),                  // 7.02: impacts under way
  heres: wordAt("heres"),                  // 8.00: dissolve to the hero on the wall
  ming: wordAt("a", 0),                    // 9.32: dissolve to the aerial of the fort
};
export const LEAD = 4 / FPS;               // actions land +2 f (30 fps) after their word = +4 f at 60 fps
export const XF = 20;                      // dissolve length (frames at 60 fps) = 10 f at 30 fps
export type ShotId = "hook" | "wall" | "volley" | "hill" | "hero" | "aerial";
export const SHOTS: { id: ShotId; t0: number }[] = [
  { id: "hook", t0: 0 }, { id: "wall", t0: T.but - 2 / FPS }, { id: "volley", t0: T.it - 2 / FPS }, { id: "hill", t0: T.at - 2 / FPS },
  { id: "hero", t0: T.heres - 2 / FPS }, { id: "aerial", t0: T.ming - 2 / FPS },
];
export const shotAt = (t: number) => { let i = 0; while (i < SHOTS.length - 1 && SHOTS[i + 1].t0 <= t) i++; return i; };
/** what to draw at time t: the current shot, plus the next one fading in during its dissolve */
export const layersAt = (t: number): { i: number; a: number }[] => {
  const i = shotAt(t), k = (t - SHOTS[i].t0) * FPS;
  if (i > 0 && k < XF) return [{ i: i - 1, a: 1 }, { i, a: (k + 1) / (XF + 1) }];
  return [{ i, a: 1 }];
};
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
