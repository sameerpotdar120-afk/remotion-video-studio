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
// ---- the main story (from "A Ming Fort" on: the opening 0-8 s was a flash-forward) ----
export const M = {
  an: wordAt("an", 1), and1: wordAt("and", 0), wheels: wordAt("wheels"), inside: wordAt("inside"), paper: wordAt("paper"),
  every: wordAt("every", 0), one: wordAt("one", 1), spark: wordAt("spark"), enemyThe: wordAt("the", 1), laughs: wordAt("laughs"),
  then1: wordAt("then", 0), then2: wordAt("then", 1), lights2: wordAt("lights", 1), blastThe: wordAt("the", 2), blasts: wordAt("blasts"),
  like: wordAt("like", 0), let: wordAt("let"), and2: wordAt("and", 1), n32: wordAt("32", 2), swarm: wordAt("swarm"), you3: wordAt("you", 2),
  point: wordAt("point"), crowd: wordAt("crowd"), thats: wordAt("thats"), nest: wordAt("nest"), because: wordAt("because"), stings: wordAt("stings"),
};
export type ShotId = "hook" | "wall" | "volley" | "hill" | "hero" | "aerial" | "march" | "wheel" | "inside" | "fuses" | "spark" | "laugh" | "closer"
  | "light" | "blast" | "balloon" | "ride" | "swarm" | "point" | "crowd" | "nest" | "end" | "stings";
const at = (w: number) => w - 2 / FPS;
export const SHOTS: { id: ShotId; t0: number }[] = [
  { id: "hook", t0: 0 }, { id: "wall", t0: at(T.but) }, { id: "volley", t0: at(T.it) }, { id: "hill", t0: at(T.at) },
  { id: "hero", t0: at(T.heres) }, { id: "aerial", t0: at(T.ming) }, { id: "march", t0: at(M.an) }, { id: "wheel", t0: at(M.and1) },
  { id: "inside", t0: at(M.inside) }, { id: "fuses", t0: at(M.every) }, { id: "spark", t0: at(M.one) }, { id: "laugh", t0: at(M.enemyThe) },
  { id: "closer", t0: at(M.then1) }, { id: "light", t0: at(M.then2) }, { id: "blast", t0: at(M.blastThe) }, { id: "balloon", t0: at(M.like) },
  { id: "ride", t0: at(M.and2) }, { id: "swarm", t0: at(M.n32) }, { id: "point", t0: at(M.you3) }, { id: "crowd", t0: at(M.crowd) },
  { id: "nest", t0: at(M.thats) }, { id: "end", t0: at(M.because) }, { id: "stings", t0: at(M.stings) },
];
/** volley time: the flash-forward runs in real time; the main story replays it — spark demo, then the real launch, a slow-motion
 *  flight from "blasts" to "crowd", and the impacts in real time on "crowd" */
const pw = (pts: [number, number][], x: number) => { if (x <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0); } const [xl, yl] = pts[pts.length - 1]; return yl + (x - xl); };
export const tau = (t: number) => {
  if (t < T.ming - 2 / FPS) return t;
  if (t >= M.spark + LEAD && t < M.spark + 1.75) return pw([[M.spark + LEAD, 3.55], [M.spark + 1.75, 3.97]], t);   // demo: spark splits to all 32
  if (t < M.lights2 + LEAD) return 0.5;                                                                           // loaded, waiting
  const fire = M.blasts + LEAD;
  return pw([[M.lights2 + LEAD, T.y1380 + LEAD], [fire, T.fire + LEAD], [fire + 0.3, 4.85], [M.crowd + LEAD, 6.28]], t);
};
/** the army's advance up the hill (metres toward the fort, 0 = where the volley lands) */
export const armyDz = (t: number) => (t < T.ming - 2 / FPS ? 0 : -38 * (1 - smooth((t - M.an) / (M.then2 + 0.3 - M.an))));
/** the cart rolls into the embrasure on "wheels out" */
export const cartZ = (t: number) => (t < T.ming - 2 / FPS ? -9.6 : -6.9 - 2.7 * smooth((t - (M.wheels + LEAD)) / 1.6));
export const shotAt = (t: number) => { let i = 0; while (i < SHOTS.length - 1 && SHOTS[i + 1].t0 <= t) i++; return i; };
/** what to draw at time t: the current shot, plus the next one fading in during its dissolve */
export const layersAt = (t: number): { i: number; a: number }[] => {
  const i = shotAt(t), k = (t - SHOTS[i].t0) * FPS;
  if (i > 0 && k < XF) return [{ i: i - 1, a: 1 }, { i, a: (k + 1) / (XF + 1) }];
  return [{ i, a: 1 }];
};
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
