# REMOTION ANIMATION CODE — 4K (3840×2160) @ 60 fps

The complete motion system for the video, rebuilt from the frame-by-frame analysis of the
reference (`analysis/reference-framelog.md`, 5,062 frames). Every number here comes from that
analysis, doubled from the reference's 30 fps to our 60 fps.

**Status: real code, not pseudo-code.** Everything below is the actual source in this repo. It
type-checks with zero errors (`npx tsc -p .`) and was test-rendered at full 4K 60 fps
(`3840×2160, 60/1, h264` confirmed with ffprobe). Placeholder art was used in the test; drop in the
GPT assets from `docs/ASSET_PROMPTS.md` with the same file names.

---

## 1. Setup

```bash
npm install
npm install @remotion/paths@4.0.523 @remotion/noise@4.0.523 @remotion/transitions@4.0.523 \
  @remotion/motion-blur@4.0.523 @remotion/shapes@4.0.523 @remotion/fonts@4.0.523 \
  @remotion/three@4.0.523 three@0.178.0 @react-three/fiber@9.3.0 \
  d3-geo@3.1.1 topojson-client@3.1.0
npm install -D @types/d3-geo @types/topojson-client @types/geojson @types/three@0.178.1
npx remotion studio                      # preview
```

All `@remotion/*` packages MUST be the same version as `remotion` (4.0.523 here).

**Render**

```bash
# one scene at a time (recommended at 4K60)
npx remotion render src/index.ts Demo-MapHook out/maphook.mp4
# master for colour grading (10-bit ProRes 422 HQ)
npx remotion render src/index.ts Demo-MapHook out/maphook.mov --codec=prores --prores-profile=hq
# REAL 3D scenes (Map3D) need WebGL: --gl=angle on a GPU machine, --gl=swangle on CPU-only
npx remotion render src/index.ts Demo-Map3D out/map3d.mp4 --gl=angle
# quick preview at 1080p
npx remotion render src/index.ts Demo-MapHook out/preview.mp4 --scale=0.5
```

**Speed:** the 4K60 test rendered at ~1 frame/second on a 4-core cloud machine. A 15-minute video is
54,000 frames, so render **scene by scene** (each a few hundred frames), on your fastest machine, and
join with `ffmpeg -f concat`. An 8–16-core machine will be several times faster; Remotion Lambda is
the option for the whole film in minutes.

---

## 2. Motion grammar (frames @ 60 fps)

| Move | Frames | Reference (30 fps) |
|---|---|---|
| Prop / icon pop: 1-frame squash → overshoot ~110% → 100% | 8 + 6 settle | 2–6 f |
| Stamp: appears at 150% for 1 f → 100% | 6, then 8 f micro-shake | 3 f |
| Stamp lands after a cut | 20 | ~10 f |
| Wind-up before a slam (shrink, rise) | 16 | 4–15 f |
| Whip-pan (directional blur) | 8 | 3–5 f |
| Zoom-blur transition | 10 | 3–9 f |
| Zoom punch to read a document (2.5–4×) | 10 | 3–6 f |
| Comic slide-in with blur | 7 | 3–4 f |
| Character travelling across a map | 34 | 15–18 f |
| Stagger between repeated items | 3 | 1–3 f |
| Musket raise / offset between soldiers | 12 / 8 | 6 / 3–5 f |
| Lip-flap cycle | 10 | 4–6 f |
| Glove point/pump cycle | 16 | 8 f |
| Blink (every ~2.7 s) | 5 | 2–3 f |
| Strike-through | 14 | 6–7 f |
| Spoken-list item spacing | 44 | 18–25 f |
| Title entry (slam-down / type-on 1 char per 2 f) | 12 | 4–8 f |
| Colony fill per state (white flash → colour) | 14 | 6–8 f |
| Neon outline hold | 44 | 22 f |
| "Let it land" hold | 200 | 84–150 f |
| The one black hold | 62 | 31 f |
| Camera drift during holds | +1.2 % zoom / s | camera never stops |

---

## 3. How a scene is assembled

```tsx
<AbsoluteFill>
  <Shake hits={[...gunshot/stamp frames]}>        {/* screen shake */}
    <ZoomPunch start={..} focus={[x, y]}>          {/* optional punch-in */}
      <Grade>                                       {/* contrast / saturation */}
        <MapStage style="parchment" camera={[...]}
          world={<>{/* SVG in world px: fills, outlines, lines */}</>}
          overlay={<>{/* screen px: pins, labels, characters, props */}</>} />
      </Grade>
    </ZoomPunch>
  </Shake>
  <Finish />                                        {/* warm soft-light, vignette, film grain */}
  <Sfx at={..} file="stamp_slam.wav" />
</AbsoluteFill>
```

**Syncing to the VO (DONE for this video):** the ElevenLabs VO was aligned word-by-word
(`scripts/vo/align_vo.py`: pause detection + Whisper number anchors + dynamic programming over the exact
script). Result: `scripts/vo/vo_timeline.json` (1,286 words with start/end) → `src/vo/cues.json`
(20 scenes, 163 cues) → `docs/VO_CUE_SHEET.md`. Scenes read cues by phrase, never by hand-typed numbers:

```tsx
const c = scene('S11_massacre');            // from src/vo/cues.ts
<Sequence from={c.from} durationInFrames={c.duration}>
  <StampSlam start={c.at('बर्फ़ के गोले')} … />
</Sequence>
```
`Full-Animatic` plays the real VO with every scene/cue on its frame — preview it in Studio.

**Map camera:** `{ frame, lon, lat, span }`, where `span` is the degrees of longitude visible
across the frame. Useful presets:

| Shot | lon | lat | span |
|---|---|---|---|
| World (Seven Years' War) | 0 | 25 | 330 |
| North Atlantic (Britain ↔ colonies) | −40 | 44 | 80 |
| Eastern North America | −78 | 37 | 30 |
| New England | −71.5 | 42.5 | 7 |
| Boston / Lexington / Concord | −71.2 | 42.4 | 1.2 |
| Western Pennsylvania (Jumonville Glen) | −79.6 | 39.9 | 4 |
| Great Britain | −3 | 54 | 14 |

`tilt: 20–30` on a key gives the 3D-terrain look (use with the hillshade raster).

---

## 3b. The 3D layer — why this is not "flat AI slop"

The reference mixes three depths; we match and beat each one:

| Depth | Reference | Ours |
|---|---|---|
| **True 3D** | 3D-rendered props (crown, stamp block, eraser) | `Map3D` (`src/lib/three/Map3D.tsx`): real extruded 3D colonies that rise one by one with spring overshoot, real lighting and soft shadows, an orbiting/tilting camera. Plus STYLE C 3D-rendered props from the asset doc. |
| **2.5D** | photo plates with slow push-ins | `ParallaxPlate`: plate + foreground layer moving at different speeds, characters in between, depth-of-field blur; `Paper3D`: documents/prints floating with real perspective tilt, moving sheen and shifting shadow; `ContactShadow` under every character on a plate; `MapStage` `tilt` for 3D terrain. |
| **2D** | cel-shaded chibi cut-outs | `Puppet` + `Face`: same look, but every character blinks, talks, glares, raises arms, holds props and reacts on any frame. |

Rules that keep it engaging (from the frame analysis): something new every 1.5–3 s, a style or depth
switch on every narrative turn, the camera never fully still, every pop/stamp has its own SFX, and the
two serious beats (Lexington black hold, Monticello) get NO gags and NO SFX hits.

---

## 4. Scene recipes for our VO (in order)

Cues are relative to the start of each scene. Replace them with the frames from your VO timestamps.

1. **Hook** (`Map3D` opening: top view → 42° tilt while the 13 colonies RISE in 3D; then cut to the 2D `satellite` MapStage) · camera World → Eastern NA (`ease.out`, 70 f) · `ColonyFill` start 30 ·
   `NeonOutline` (all colonies) at fill end · `FlagFill` (href = `assets/flags/grand_union_1775.png`, exported from the `Flag-GrandUnion` composition; seed = Philadelphia) · `TimelineRuler`
   1775/**1776**/1777 → rewind to 1762/**1763**/1764 (+ `rewind_tape.wav`) · `LineWipe` to parchment.
2. **13 colonies**: `RegionEyes` per colony (stagger 3, mood `angry`, look ±1 = bickering) · pop
   `pd_join_or_die_1754.png` with `PopIn` + `franklin` puppet · `StampSlam` stamp_rejected on "शुक्रिया".
3. **Jumonville Glen**: camera → Western PA, `tilt 25` + hillshade · `MapPin` "Jumonville Glen / 28 May 1754" ·
   `ZoomBlurOut` → `bg_forest_ohio_1754_dawn` plate · `washingtonYoung` puppet + one `MuzzleSmoke` ·
   back to world map: `Territory` fills spreading (Europe, India, Caribbean) · `MapTitle` "Seven Years' War (1756–1763)".
4. **Debt**: `Territory` French Canada → red (`mode:'smash'`) · `MapCharacter` Britain + `DropIn` crown ·
   `StampSlam` stamp_debt with `handleSrc` (wind-up) · Britain travels west (`path`), glove `point` at colonies,
   `talk` on the line "bill कौन भरेगा".
5. **Proclamation Line**: camera `tilt 28` over the Appalachians · `DrawLine` (dash 34) · settler puppets bump the line.
6. **Sugar Act**: Britain `holding` doc_sugar_act → `ZoomPunch` · price tag `6d` → strike → `3d` (`StrikeThrough`) ·
   `Territory` flash on smuggling coast · `NeonIcon` red X on "jury".
7. **Stamp Act**: four background plates cut every ~50 f; `StampSlam` stamp_taxed 20 f after each cut ·
   tavern: `Fling` table + `playing_card_single` ×8 with random vx/vy · `bg_liberty_tree_1765` ·
   `MapPin` New York "Stamp Act Congress / October 1765" + 9 colonies `ColonyFill` (`per 3`) · `MapTitle` slogan.
8. **Repeal / Declaratory Act**: `PaperTear` on the Stamp Act · `ZoomPunch` doc_declaratory_act + `Highlighter` on "in all cases whatsoever".
9. **Townshend**: doc_townshend_list, items pop on `listGap` (44 f) · redcoat squad `SlideIn` onto Boston.
10. **Boston Massacre**: `IrisBlob` → pin "Boston / 5 March 1770" → `ZoomBlurIn` King Street plate · crowd puppets
    `talk` · `Fling` snowball + `ImpactPuff` · three `redcoat` puppets, `musketOffset` 8 · `MuzzleSmoke` + `Shake` ·
    `fallAt` on casualties · `Fling`-in `pd_revere_bloody_massacre_1770` (spin, blur) · `attucks` puppet, respectful hold.
11. **John Adams**: courtroom plate, `johnAdams` puppet `talk`, soldiers' moods switch to `smile` on "बरी".
12. **Tea Act → Tea Party**: doc_townshend_list strikes Glass→Paper, `MarkerLoop` on Tea · wharf plate ·
    `teaPartyDisguised` ×3 with `hop` up the gangplank · `Fling` tea_chest ×N into the water + `splash_crate.wav`
    · counter to 342 (`MapTitle` mode 'type') · title "Boston Tea Party / 16 December 1773".
13. **Intolerable Acts + First Congress**: Britain `furious` slide-in · `StampSlam` closed / limited · redcoat squad ·
    `ColonyFill` (`color C.congressOrange`, ids without 'georgia') · `MapTitle` "First Continental Congress / 5 September 1774".
14. **Lexington**: night map, `PopIn` lantern_pair · `paul_revere_on_horse` travelling along a `DrawLine` route ·
    myth card with `NeonIcon` red X · dawn plate, 5-second hold with camera drift · ONE `MuzzleSmoke`, `fallAt` ·
    `WordReveal` "The shot heard round the world." · `BlackHold` (62 f) · Concord route map with small smoke puffs.
15. **Washington / Bunker Hill / Olive Branch**: `ColonyFill` army spawn (continental puppets cascade) · `ArrowLabel`
    "George Washington" · Breed's Hill plate, `MuzzleSmoke` ×many · Washington holds doc_olive_branch_scroll →
    camera follows it across the Atlantic (camera keys only, no cut) → `king_george_iii` `PaperTear`.
16. **Common Sense**: print-shop plate · `pd_common_sense_titlepage_1776` `PopIn` · copies `Fling` across the map.
17. **July 2 / July 4**: `TimelineRuler` Jul 1/**Jul 2**/Jul 3 → Jul 4 · `ballot_raised_fist` cascade (12 colonies; New York gets none) ·
    `FlagFill` GrandUnion again (callback to the hook) · `DropIn` declaration → `ZoomBlurIn` to the macro scan ·
    `Highlighter` "All men are created equal" (chars = 29).
18. **Monticello**: porch plate with `marthaJefferson` + `patsyJefferson` · slow pull-back (camera-only) to `bg_monticello_1776`
    with `enslavedWorkerMan` / `enslavedWorkerWoman` puppets standing still. No gag, no SFX hit, music drops.
19. **Payoff**: recap icons `PopIn` along a `DrawLine` timeline route (one per law, 20 f apart) · colonies `NeonOutline`.
20. **Close**: parchment war map, `Territory` red vs blue, mini flags (code flags) `PopIn` with `stagger 3` · `MapTitle`.

---

## 5. Colour grade (studio look)

1. In-code: `<Grade>` (contrast 1.06, saturation 1.08) + `<Finish>` (warm soft-light 6 %, vignette 32 %, animated grain 6 %).
2. Better: render **ProRes HQ**, grade in DaVinci Resolve (free): gentle S-curve, lift shadows to warm brown,
   highlights slightly cream; keep map blues/reds saturated with a qualifier.
3. Or apply a `.cube` LUT with ffmpeg:
   ```bash
   ffmpeg -i maphook.mov -vf "lut3d=file=filmic_warm.cube" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -r 60 maphook_graded.mp4
   ```
4. Loudness for YouTube: VO −14 LUFS integrated, music bed ~20 dB under the VO, true peak ≤ −1 dBTP
   (the reference clipped above 0 dBFS — don't copy that).

---

## 6. Using this with ChatGPT's Remotion connector

Paste section 2 (motion grammar) plus the source files the scene needs (always include `constants.ts`,
`easing.ts` and the component files you use), then ask:
*"Using ONLY these components and timings, build `src/scenes/S10_BostonMassacre.tsx` for 3840×2160 @ 60 fps.
VO cue frames: …"*. Keep new code inside these primitives so every scene shares the same motion language.

---

## 7. Source code (verbatim from the repo)

### 7.1 `remotion.config.ts`

```ts
import { Config } from '@remotion/cli/config';

// 4K 60 fps master settings.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(16); // visually lossless for YouTube 4K; use ProRes (see docs) if you grade afterwards
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // auto; lower it if 4K frames run out of memory
```

### 7.2 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "lib": ["DOM", "ES2022"]
  },
  "include": ["src"]
}
```

### 7.3 `src/index.ts`

```ts
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
```

### 7.4 `src/Root.tsx`

```tsx
import React from 'react';
import { Composition } from 'remotion';
import { MainComposition } from './Video';
import { FPS, H, W } from './lib/constants';
import { loadFonts } from './lib/fonts';
import { DemoBritain, DemoMap3D, DemoMapHook, DemoVolley } from './scenes/Demos';
import { GrandUnion, UnionFlag1707 } from './lib/fx/flags';
import { Animatic } from './scenes/Animatic';
import { TOTAL_FRAMES } from './vo/cues';

loadFonts();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 4K 60 fps long-form (16:9) */}
      <Composition id="Full-Animatic" component={Animatic} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
      <Composition id="Demo-MapHook" component={DemoMapHook} durationInFrames={480} fps={FPS} width={W} height={H} />
      <Composition id="Demo-Britain" component={DemoBritain} durationInFrames={360} fps={FPS} width={W} height={H} />
      <Composition id="Demo-Map3D" component={DemoMap3D} durationInFrames={480} fps={FPS} width={W} height={H} />
      <Composition id="Demo-Volley" component={DemoVolley} durationInFrames={300} fps={FPS} width={W} height={H} />
      {/* Export flags to PNG once for FlagFill:
          npx remotion still src/index.ts Flag-GrandUnion public/assets/flags/grand_union_1775.png */}
      <Composition id="Flag-GrandUnion" component={() => <GrandUnion width={3800} />} durationInFrames={1} fps={FPS} width={3800} height={2000} />
      <Composition id="Flag-Union1707" component={() => <UnionFlag1707 width={3800} />} durationInFrames={1} fps={FPS} width={3800} height={1900} />
      {/* original vertical starter */}
      <Composition
        id="MainComposition"
        component={MainComposition}
        durationInFrames={240}
        fps={24}
        width={1080}
        height={1920}
        defaultProps={{ title: 'Documentary Video' }}
      />
    </>
  );
};
```

### 7.5 `src/lib/constants.ts`

```ts
// Global constants for 4K @ 60 fps.
// Every timing below comes from the frame-by-frame analysis of the reference
// (analysis/reference-framelog.md, measured at 30 fps) and is doubled for 60 fps.

export const W = 3840;
export const H = 2160;
export const FPS = 60;

/** Convert seconds to frames at 60 fps. */
export const sec = (s: number) => Math.round(s * FPS);

/** Motion grammar, in frames @60fps. */
export const T = {
  popIn: 8, // prop / icon pop: 0 → 110% → 100%   (ref 2–6 f @30)
  popSettle: 6,
  stampAppear: 1, // stamp shows at 150% for 1 frame
  stampSlam: 6, // 150% → 100%                     (ref 3 f @30)
  stampShake: 8, // micro-shake after landing       (ref 3–4 f @30)
  stampAfterCut: 20, // stamp lands ~20 f after a cut (ref ~10 f @30)
  windUp: 16, // shrink/rise before a slam
  whip: 8, // whip-pan blur transition           (ref 3–5 f @30)
  zoomBlur: 10, // radial zoom-blur transition        (ref 3–9 f @30)
  zoomPunch: 10, // punch-in to read a document       (ref 3–6 f @30)
  slideFast: 7, // comic slide-in with motion blur    (ref 3–4 f @30)
  slideTravel: 34, // character travelling across a map (ref 15–18 f @30)
  stagger: 3, // between repeated items             (ref 1–3 f @30)
  musketRaise: 12, // per soldier                        (ref ~6 f @30)
  musketOffset: 8, // offset between soldiers            (ref 3–5 f @30)
  mouthCycle: 10, // lip-flap open/close                (ref 4–6 f @30)
  gestureCycle: 16, // glove point / pump loop            (ref ~8 f @30)
  blink: 5, // eyes closed                        (ref 2–3 f @30)
  blinkEvery: 160, // ~every 2.7 s
  strike: 14, // strike-through draw                (ref 6–7 f @30)
  highlightPerChar: 0.9, // highlighter frames per character
  listGap: 44, // spoken list item spacing           (ref 18–25 f @30)
  titleIn: 12, // title scale-down / fade entry      (ref 4–8 f @30)
  typePerChar: 2, // typewriter                         (ref 1 char/f @30)
  holdShort: 60,
  holdLand: 200, // "let it land" hold                 (ref 84–150 f @30)
  blackHold: 62, // the one black beat                 (ref 31 f @30)
  fillPerState: 14, // colony fill: white flash → blue    (ref 6–8 f @30)
  neonOn: 44, // neon outline hold                  (ref 22 f @30)
  pinGrow: 20, // pin dot → full with overshoot      (ref 10 f @30)
  ripple: 24,
  labelWipe: 16,
  driftPerSec: 0.012, // camera never stops: +1.2% zoom per second during holds
} as const;

/** Palette measured from the reference frames. */
export const C = {
  // satellite style
  colonyBlue: '#5B9BE0',
  colonyBlueLight: '#CFE3FA',
  neonWhite: '#EAF6FF',
  // parchment style
  parchLand: '#C9B48A',
  parchSea: '#5E8C8E',
  parchColony: '#4F7099',
  britainRed: '#D62935',
  britainRedDark: '#A81F2A',
  franceBlue: '#2B3FA0',
  spainOrange: '#E3862D',
  congressOrange: '#F08A24',
  // flat political style
  flatLand: '#3D86C6',
  flatSea: '#1B2B38',
  // UI
  dateYellow: '#FFD84A',
  highlighter: 'rgba(255, 222, 0, 0.78)',
  stampRed: '#C81E2B',
  strikeRed: '#B3121F',
  markerGreen: '#35B84A',
  neonRed: '#FF4D5E',
  neonGreen: '#3DFF8B',
  ink: '#1A1410',
  outline: '#2A211B',
  skin: '#F6D9BF',
} as const;

export const FONTS = {
  // Loaded in src/lib/fonts.ts via @remotion/google-fonts
  serif: '"Playfair Display", "Times New Roman", serif',
  sans: '"Anton", "Impact", sans-serif',
  hand: '"Kalam", cursive', // handwritten notes / labels (supports Devanagari)
  hindi: '"Tiro Devanagari Hindi", "Noto Serif Devanagari", serif',
} as const;
```

### 7.6 `src/lib/easing.ts`

```ts
import { Easing, interpolate, spring } from 'remotion';
import { noise2D } from '@remotion/noise';
import { FPS } from './constants';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0→1 over [start, start+duration] with an easing. */
export const ramp = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = Easing.bezier(0.25, 0.1, 0.25, 1),
) => interpolate(frame, [start, start + Math.max(1, duration)], [0, 1], { ...clamp, easing });

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // arrivals (fast start, soft land)
  in: Easing.bezier(0.7, 0, 0.84, 0), // exits (accelerate away)
  inOut: Easing.bezier(0.65, 0, 0.35, 1), // travel / camera moves
  snap: Easing.bezier(0.5, 0, 0.1, 1), // whip / punch
  linear: (t: number) => t,
};

/** Pop-in scale: 0 → 1.1 → 1 (overshoot), measured from the reference. */
export const popScale = (frame: number, start: number, fps = FPS) =>
  spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 220, mass: 0.6 } });

/** Soft settle used for characters landing / props dropping. */
export const settle = (frame: number, start: number, fps = FPS) =>
  spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 140, mass: 0.8 } });

/** Smooth organic wobble in px (or degrees). Same seed → same motion every render. */
export const wobble = (seed: string, frame: number, amp: number, speed = 0.02) =>
  noise2D(seed, frame * speed, 0) * amp;

/** Repeating 0..1 sawtooth with period p frames. */
export const loop = (frame: number, p: number) => ((frame % p) + p) % p / p;
```

### 7.7 `src/lib/fonts.ts`

```ts
import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

/**
 * Fonts are bundled locally (public/fonts, from @fontsource, SIL Open Font License) so a
 * 4K render never depends on the network. loadFont() blocks rendering until each font is ready.
 */
const FILES: { family: string; file: string; weight: string; unicodeRange?: string }[] = [
  { family: 'Playfair Display', file: 'playfair-display-latin-600-normal.woff2', weight: '600' },
  { family: 'Playfair Display', file: 'playfair-display-latin-700-normal.woff2', weight: '700' },
  { family: 'Playfair Display', file: 'playfair-display-latin-800-normal.woff2', weight: '800' },
  { family: 'Anton', file: 'anton-latin-400-normal.woff2', weight: '400' },
  { family: 'Kalam', file: 'kalam-latin-400-normal.woff2', weight: '400' },
  { family: 'Kalam', file: 'kalam-latin-700-normal.woff2', weight: '700' },
  { family: 'Kalam', file: 'kalam-devanagari-400-normal.woff2', weight: '400', unicodeRange: 'U+0900-097F' },
  { family: 'Kalam', file: 'kalam-devanagari-700-normal.woff2', weight: '700', unicodeRange: 'U+0900-097F' },
  { family: 'Tiro Devanagari Hindi', file: 'tiro-devanagari-hindi-latin-400-normal.woff2', weight: '400' },
  {
    family: 'Tiro Devanagari Hindi',
    file: 'tiro-devanagari-hindi-devanagari-400-normal.woff2',
    weight: '400',
    unicodeRange: 'U+0900-097F',
  },
];

export const loadFonts = () => {
  for (const f of FILES) {
    loadFont({ family: f.family, url: staticFile(`fonts/${f.file}`), weight: f.weight, unicodeRange: f.unicodeRange });
  }
};
```

### 7.8 `src/lib/map/geo.ts`

```ts
import { geoEquirectangular, geoPath, type GeoProjection } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

/**
 * ONE projection for everything = perfect alignment.
 * Equirectangular (plate carrée) at 240 px per degree — the same grid as NASA's
 * Blue Marble 21600×21600 tiles (90° per tile) and Natural Earth's 21600×10800 rasters.
 * Any raster in plate carrée can be placed exactly by its lon/lat bounds, and every
 * vector path, pin, label and character uses the same lon/lat → px function.
 */
export const PX_PER_DEG = 240;
export const WORLD_W = 360 * PX_PER_DEG; // 86 400 px
export const WORLD_H = 180 * PX_PER_DEG; // 43 200 px

export const projection: GeoProjection = geoEquirectangular()
  .scale(WORLD_W / (2 * Math.PI))
  .translate([WORLD_W / 2, WORLD_H / 2])
  .precision(0.1);

export const pathGen = geoPath(projection);

/** lon/lat → world px. */
export const project = (lon: number, lat: number): [number, number] => [
  (lon + 180) * PX_PER_DEG,
  (90 - lat) * PX_PER_DEG,
];

/** world px → lon/lat */
export const unproject = (x: number, y: number): [number, number] => [x / PX_PER_DEG - 180, 90 - y / PX_PER_DEG];

export const featurePath = (f: Feature<Geometry> | Geometry) => pathGen(f as never) ?? '';

export const byId = (fc: FeatureCollection, id: string) => {
  const f = fc.features.find((x) => x.properties?.id === id || x.properties?.name === id || String(x.id) === id);
  if (!f) throw new Error(`Feature ${id} not found`);
  return f;
};

/** Centroid in lon/lat — use to place faces, labels and pins on a region. */
export const centroidLonLat = (f: Feature<Geometry>): [number, number] => {
  const [x, y] = pathGen.centroid(f as never);
  return unproject(x, y);
};

/** Bounds in lon/lat: [[west, south], [east, north]] */
export const boundsLonLat = (f: Feature<Geometry>): [[number, number], [number, number]] => {
  const [[x0, y0], [x1, y1]] = pathGen.bounds(f as never);
  const [w, n] = unproject(x0, y0);
  const [e, s] = unproject(x1, y1);
  return [[w, s], [e, n]];
};
```

### 7.9 `src/lib/map/data.ts`

```ts
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import coloniesJson from '../../../public/maps/colonies-1775.json';
import vermontJson from '../../../public/maps/vermont-disputed.json';
import landJson from '../../../public/maps/land-50m.geo.json';
import countriesJson from '../../../public/maps/countries-50m.geo.json';

/**
 * Sources (all public domain):
 *  - colonies-1775.json   ← US Census Bureau 2017 state boundaries (us-atlas 3.0.1),
 *                           Maine merged into Massachusetts, West Virginia into Virginia.
 *  - vermont-disputed.json← Vermont, claimed by both New York and New Hampshire in 1775.
 *  - land/countries-50m   ← Natural Earth 1:50m (world-atlas 2.0.2). MODERN borders:
 *                           use them for coastlines only; never show modern borders as 1763 borders.
 * Rebuild with: node scripts/build_colonies.mjs <us-atlas>/states-10m.json <world-atlas> public/maps
 */
export const colonies = coloniesJson as unknown as FeatureCollection;
export const vermont = vermontJson as unknown as Feature<Geometry>;
export const land = landJson as unknown as FeatureCollection;
export const countries = countriesJson as unknown as FeatureCollection;

export const COLONY_IDS = colonies.features
  .slice()
  .sort((a, b) => (a.properties?.order ?? 0) - (b.properties?.order ?? 0))
  .map((f) => f.properties?.id as string);

export const country = (name: string) => {
  const f = countries.features.find((x) => x.properties?.name === name);
  if (!f) throw new Error(`Country ${name} not in Natural Earth 50m`);
  return f;
};

/**
 * Key places (lon, lat). Verified against modern coordinates of the historic sites.
 */
export const PLACES = {
  boston: [-71.0589, 42.3601],
  lexington: [-71.2295, 42.4473],
  concord: [-71.3489, 42.4604],
  bunkerHill: [-71.0608, 42.3763],
  newYork: [-74.006, 40.7128],
  philadelphia: [-75.1652, 39.9526],
  jumonvilleGlen: [-79.6489, 39.8806],
  monticello: [-78.4528, 38.0086],
  london: [-0.1276, 51.5072],
  paris: [2.3522, 48.8566],
} as const satisfies Record<string, readonly [number, number]>;

/**
 * Royal Proclamation Line of 7 Oct 1763 — APPROXIMATE trace along the Appalachian
 * watershed, north → south. Before publishing, check it against a georeferenced copy of
 * the 1763 proclamation map (Library of Congress, public domain) and adjust these points.
 */
export const PROCLAMATION_LINE: [number, number][] = [
  [-71.5, 45.0],
  [-73.4, 44.6],
  [-74.7, 43.6],
  [-75.6, 42.6],
  [-77.6, 42.0],
  [-78.8, 41.0],
  [-79.2, 39.7],
  [-79.9, 38.8],
  [-80.7, 37.5],
  [-81.6, 36.6],
  [-82.6, 35.6],
  [-83.6, 34.9],
  [-84.3, 34.1],
  [-84.9, 31.0],
];
```

### 7.10 `src/lib/map/MapStage.tsx`

```tsx
import React, { createContext, useContext, useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, FPS, H, T, W } from '../constants';
import { clamp, ease } from '../easing';
import { PX_PER_DEG, featurePath, project } from './geo';
import { land } from './data';

/** A camera keyframe: look at lon/lat with `span` degrees of longitude across the frame. */
export type CamKey = {
  frame: number;
  lon: number;
  lat: number;
  span: number; // degrees visible horizontally. World ≈ 360, US east coast ≈ 22, Boston close-up ≈ 1.2
  rotate?: number; // degrees
  tilt?: number; // perspective tilt for the 3D terrain look, degrees (0 = flat)
  easing?: (t: number) => number; // easing INTO this key
};

export type Cam = { lon: number; lat: number; span: number; rotate: number; tilt: number };

/** Interpolate camera keys. Zoom is interpolated in log space so it feels linear to the eye.
 *  After the last key the camera keeps drifting in (T.driftPerSec) — the reference never stops. */
export const cameraAt = (keys: CamKey[], frame: number): Cam => {
  const k = keys;
  if (frame <= k[0].frame) return { rotate: 0, tilt: 0, ...k[0] };
  for (let i = 1; i < k.length; i++) {
    if (frame <= k[i].frame) {
      const a = k[i - 1];
      const b = k[i];
      const e = b.easing ?? ease.inOut;
      const t = e((frame - a.frame) / Math.max(1, b.frame - a.frame));
      return {
        lon: a.lon + (b.lon - a.lon) * t,
        lat: a.lat + (b.lat - a.lat) * t,
        span: Math.exp(Math.log(a.span) + (Math.log(b.span) - Math.log(a.span)) * t),
        rotate: (a.rotate ?? 0) + ((b.rotate ?? 0) - (a.rotate ?? 0)) * t,
        tilt: (a.tilt ?? 0) + ((b.tilt ?? 0) - (a.tilt ?? 0)) * t,
      };
    }
  }
  const last = k[k.length - 1];
  const held = (frame - last.frame) / FPS;
  return { rotate: 0, tilt: 0, ...last, span: last.span / (1 + T.driftPerSec * held) };
};

type MapCtx = {
  cam: Cam;
  /** world px → screen px multiplier */
  scale: number;
  /** lon/lat → screen px (for pins, labels, characters that keep a constant on-screen size) */
  toScreen: (lon: number, lat: number) => [number, number];
};
const Ctx = createContext<MapCtx | null>(null);
export const useMap = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useMap must be used inside <MapStage>');
  return c;
};

/** A plate-carrée raster placed by its lon/lat bounds → pixel-perfect alignment with vectors. */
export type Raster = { src: string; west: number; south: number; east: number; north: number; style?: React.CSSProperties };

export type MapStyle = 'satellite' | 'parchment' | 'flat';

/**
 * <MapStage> renders two layers:
 *  - world layer  (rasters + SVG children written in WORLD px; the camera is the SVG viewBox,
 *                  so strokes scale with the map. Use vectorEffect="non-scaling-stroke" for
 *                  borders that must stay a constant on-screen width)
 *  - screen layer (`overlay` children placed with toScreen(), constant size on screen)
 * Rasters must be plate carrée crops (see the asset doc for gdal crop commands).
 */
export const MapStage: React.FC<{
  camera: CamKey[];
  style: MapStyle;
  rasters?: Raster[];
  world?: React.ReactNode; // SVG elements in world px
  overlay?: React.ReactNode; // HTML/SVG in screen px
}> = ({ camera, style, rasters = [], world, overlay }) => {
  const frame = useCurrentFrame();
  const cam = cameraAt(camera, frame);
  const scale = W / (cam.span * PX_PER_DEG);
  const [cx, cy] = project(cam.lon, cam.lat);
  const tx = W / 2 - cx * scale;
  const ty = H / 2 - cy * scale;

  const ctx = useMemo<MapCtx>(
    () => ({
      cam,
      scale,
      toScreen: (lon, lat) => {
        const [x, y] = project(lon, lat);
        // rotation around screen centre
        const sx = x * scale + tx - W / 2;
        const sy = y * scale + ty - H / 2;
        const r = (cam.rotate * Math.PI) / 180;
        return [W / 2 + sx * Math.cos(r) - sy * Math.sin(r), H / 2 + sx * Math.sin(r) + sy * Math.cos(r)];
      },
    }),
    [cam, scale, tx, ty],
  );

  const landPath = useMemo(() => featurePath(land as never), []);
  const bg = style === 'satellite' ? '#0B2A44' : style === 'parchment' ? C.parchSea : C.flatSea;
  // Only the visible window is rasterised: the SVG is screen-sized and the camera is a viewBox.
  const viewBox = `${-tx / scale} ${-ty / scale} ${W / scale} ${H / scale}`;

  return (
    <Ctx.Provider value={ctx}>
      <AbsoluteFill style={{ backgroundColor: bg, overflow: 'hidden', perspective: 3200 }}>
        <AbsoluteFill
          style={{ transformOrigin: '50% 50%', transform: `rotateX(${cam.tilt}deg) rotate(${cam.rotate}deg)` }}
        >
          {rasters.map((r) => {
            const [x0, y0] = project(r.west, r.north);
            const [x1, y1] = project(r.east, r.south);
            return (
              <Img
                key={r.src}
                src={r.src}
                style={{
                  position: 'absolute',
                  left: x0 * scale + tx,
                  top: y0 * scale + ty,
                  width: (x1 - x0) * scale,
                  height: (y1 - y0) * scale,
                  ...r.style,
                }}
              />
            );
          })}
          <svg
            width={W}
            height={H}
            viewBox={viewBox}
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
          >
            {style !== 'satellite' && (
              <path d={landPath} fill={style === 'parchment' ? C.parchLand : C.flatLand} stroke="none" />
            )}
            {world}
          </svg>
        </AbsoluteFill>
        {style === 'parchment' && <ParchmentPaper />}
        <AbsoluteFill>{overlay}</AbsoluteFill>
      </AbsoluteFill>
    </Ctx.Provider>
  );
};

/** Paper texture + vignette laid over the parchment style (screen space, so grain never scales). */
export const ParchmentPaper: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <Img
      src={staticFile('assets/textures/parchment_paper_4k.jpg')}
      style={{ width: W, height: H, mixBlendMode: 'multiply', opacity: 0.55 }}
    />
    <AbsoluteFill
      style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(60,35,10,0.35) 100%)' }}
    />
  </AbsoluteFill>
);

/** Fade between two map styles (the reference switches style on every narrative turn). */
export const styleCrossfade = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [0, 1], clamp);
```

### 7.11 `src/lib/map/layers.tsx`

```tsx
import React, { useMemo } from 'react';
import { interpolate, interpolateColors, staticFile, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import type { Feature, Geometry } from 'geojson';
import { C, T } from '../constants';
import { clamp, ease, loop, popScale, ramp } from '../easing';
import { featurePath, pathGen, project } from './geo';
import { colonies, COLONY_IDS } from './data';
import { useMap } from './MapStage';

/* ───────────────────────── WORLD-LAYER (SVG, world px) ───────────────────────── */

/**
 * Colonies fill one by one, north → south. Each state flashes WHITE then settles to blue
 * (two-step fill measured in the reference: f8–57 @30fps).
 */
export const ColonyFill: React.FC<{
  start: number;
  per?: number; // frames between states
  color?: string;
  flash?: string;
  ids?: string[];
  opacity?: number;
}> = ({ start, per = T.fillPerState, color = C.colonyBlue, flash = C.colonyBlueLight, ids = COLONY_IDS, opacity = 0.92 }) => {
  const frame = useCurrentFrame();
  const paths = useMemo(
    () => ids.map((id) => featurePath(colonies.features.find((f) => f.properties?.id === id) as Feature<Geometry>)),
    [ids],
  );
  return (
    <g>
      {paths.map((d, i) => {
        const s = start + i * per;
        const a = ramp(frame, s, 6, ease.out); // appear
        const c = ramp(frame, s + 6, per * 1.4, ease.inOut); // white → color
        return (
          <path
            key={ids[i]}
            d={d}
            fill={interpolateColors(c, [0, 1], [flash, color])}
            fillOpacity={a * opacity}
            stroke="#FFFFFF"
            strokeOpacity={0.55 * a}
            strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </g>
  );
};

/** Neon outline that snaps on in 1 frame, holds, then fades (ref f58–81 @30). */
export const NeonOutline: React.FC<{ d: string; start: number; hold?: number; color?: string; width?: number }> = ({
  d,
  start,
  hold = T.neonOn,
  color = C.neonWhite,
  width = 6,
}) => {
  const frame = useCurrentFrame();
  const on = frame >= start ? 1 : 0;
  const off = interpolate(frame, [start + hold, start + hold + 6], [1, 0], clamp);
  const o = on * off;
  if (o <= 0) return null;
  return (
    <g style={{ filter: `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 28px ${color})` }}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeOpacity={o} vectorEffect="non-scaling-stroke" />
    </g>
  );
};

/** Draw a path on (borders, routes, the 1763 Proclamation Line). Dashes optional. */
export const DrawLine: React.FC<{
  d: string;
  start: number;
  duration: number;
  color?: string;
  width?: number;
  dash?: number; // screen px dash length (0 = solid)
}> = ({ d, start, duration, color = C.stampRed, width = 7, dash = 0 }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start, duration, ease.inOut);
  const { strokeDasharray, strokeDashoffset } = evolvePath(p, d);
  const { scale } = useMap();
  return (
    <g>
      {/* reveal mask drawn with evolvePath, real dashes drawn inside it */}
      <mask id={`m-${start}`}>
        <path
          d={d}
          fill="none"
          stroke="#fff"
          strokeWidth={(width * 3) / scale}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </mask>
      <path
        d={d}
        mask={`url(#m-${start})`}
        fill="none"
        stroke={color}
        strokeWidth={width / scale}
        strokeLinecap="round"
        strokeDasharray={dash ? `${dash / scale} ${(dash * 0.7) / scale}` : undefined}
      />
    </g>
  );
};

/**
 * Territory flood. mode 'fade' = colour cross-fade (French land → British red, ref f497–512),
 * mode 'smash' = appears in ONE frame (ref f916).
 */
export const Territory: React.FC<{
  feature: Feature<Geometry> | Geometry;
  start: number;
  from?: string;
  to: string;
  mode?: 'fade' | 'smash';
  duration?: number;
  opacity?: number;
}> = ({ feature, start, from, to, mode = 'fade', duration = 30, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const d = useMemo(() => featurePath(feature), [feature]);
  if (frame < start && !from) return null;
  const t = mode === 'smash' ? (frame >= start ? 1 : 0) : ramp(frame, start, duration, ease.inOut);
  const fill = from ? interpolateColors(t, [0, 1], [from, to]) : to;
  return <path d={d} fill={fill} fillOpacity={from ? opacity : t * opacity} />;
};

/**
 * Flag cloth on a region: the flag image is clipped to the region, revealed radially from a
 * seed point (ref f82–99 @30) and "waves" with an SVG turbulence displacement.
 * Use the 1707–1801 Union Flag (NO St Patrick's saltire) and, for 1776, the Grand Union Flag.
 */
export const FlagFill: React.FC<{
  d: string;
  href: string;
  seed: [number, number]; // lon/lat where the reveal starts
  start: number;
  duration?: number;
  bbox: [[number, number], [number, number]]; // lon/lat [[w,s],[e,n]] to stretch the flag over
}> = ({ d, href, seed, start, duration = 34, bbox }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start, duration, ease.out);
  const [sx, sy] = project(seed[0], seed[1]);
  const [x0, y0] = project(bbox[0][0], bbox[1][1]);
  const [x1, y1] = project(bbox[1][0], bbox[0][1]);
  const r = Math.hypot(x1 - x0, y1 - y0) * p;
  const id = `flag-${start}`;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={d} />
        </clipPath>
        <filter id={`${id}-wave`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves={2} seed={Math.floor(frame / 2)} />
          <feDisplacementMap in="SourceGraphic" scale={(x1 - x0) * 0.025} />
        </filter>
      </defs>
      <mask id={`${id}-mask`}>
        <circle cx={sx} cy={sy} r={r} fill="#fff" />
      </mask>
      <g clipPath={`url(#${id}-clip)`}>
        <image
          href={href}
          x={x0}
          y={y0}
          width={x1 - x0}
          height={y1 - y0}
          preserveAspectRatio="none"
          mask={`url(#${id}-mask)`}
          filter={`url(#${id}-wave)`}
        />
      </g>
    </g>
  );
};

/** Helper for scenes: SVG path of any colony id. */
export const colonyPath = (id: string) =>
  pathGen(colonies.features.find((f) => f.properties?.id === id) as never) ?? '';

/* ───────────────────────── SCREEN-LAYER (HTML, screen px) ───────────────────────── */

/** Red teardrop pin: dot grows (overshoot) → ripple ring → label wipes on (ref f2056–2076 @30). */
export const MapPin: React.FC<{
  lon: number;
  lat: number;
  start: number;
  label?: string;
  date?: string;
  labelSide?: 'right' | 'left';
}> = ({ lon, lat, start, label, date, labelSide = 'right' }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  const [x, y] = toScreen(lon, lat);
  if (frame < start) return null;
  const s = popScale(frame, start);
  const ripple = ramp(frame, start + 8, T.ripple, ease.out);
  const wipe = ramp(frame, start + 14, T.labelWipe, ease.out);
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      <div
        style={{
          position: 'absolute',
          left: -160 * ripple,
          top: -160 * ripple,
          width: 320 * ripple,
          height: 320 * ripple,
          borderRadius: '50%',
          border: `8px solid ${C.stampRed}`,
          opacity: 1 - ripple,
        }}
      />
      <svg
        width={90}
        height={120}
        viewBox="0 0 30 40"
        style={{ position: 'absolute', left: -45, top: -120, transform: `scale(${s})`, transformOrigin: '50% 100%' }}
      >
        <path d="M15 40 C15 40 2 24 2 14 A13 13 0 0 1 28 14 C28 24 15 40 15 40Z" fill={C.stampRed} stroke="#fff" strokeWidth={2} />
        <circle cx={15} cy={14} r={5} fill="#fff" />
      </svg>
      {label && (
        <div
          style={{
            position: 'absolute',
            top: -110,
            [labelSide === 'right' ? 'left' : 'right']: 70,
            clipPath: `inset(0 ${100 - wipe * 100}% 0 0)`,
            whiteSpace: 'nowrap',
            color: '#fff',
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            fontSize: 96,
            textShadow: '0 6px 18px rgba(0,0,0,0.55)',
            lineHeight: 1,
          }}
        >
          {label}
          {date && <div style={{ fontSize: 46, fontWeight: 600, color: C.dateYellow, marginTop: 10 }}>{date}</div>}
        </div>
      )}
    </div>
  );
};

/** Cartoon eyes (+ optional brows) placed on a map region. Pops in with a 1–3 f stagger. */
export const RegionEyes: React.FC<{
  lon: number;
  lat: number;
  start: number;
  size?: number;
  look?: number; // -1 left … 1 right
  mood?: 'neutral' | 'angry' | 'worried';
}> = ({ lon, lat, start, size = 70, look = 0, mood = 'neutral' }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const [x, y] = toScreen(lon, lat);
  const s = popScale(frame, start);
  const blink = loop(frame + Math.round(lon * 37), T.blinkEvery) < T.blink / T.blinkEvery ? 0.12 : 1;
  const brow = mood === 'angry' ? 18 : mood === 'worried' ? -14 : 0;
  return (
    <svg
      width={size * 2.4}
      height={size * 1.6}
      viewBox="0 0 120 80"
      style={{ position: 'absolute', left: x - size * 1.2, top: y - size * 0.8, transform: `scale(${s})` }}
    >
      {[34, 86].map((cx, i) => (
        <g key={cx}>
          <ellipse cx={cx} cy={44} rx={20} ry={24 * blink} fill="#fff" stroke={C.outline} strokeWidth={4} />
          <circle cx={cx + look * 8} cy={46} r={9 * blink} fill={C.ink} />
          {mood !== 'neutral' && (
            <line
              x1={cx - 20}
              y1={14 + (i === 0 ? -brow / 3 : brow / 3)}
              x2={cx + 20}
              y2={14 + (i === 0 ? brow / 3 : -brow / 3)}
              stroke={C.ink}
              strokeWidth={7}
              strokeLinecap="round"
            />
          )}
        </g>
      ))}
    </svg>
  );
};
```

### 7.12 `src/lib/fx/motion.tsx`

```tsx
import React from 'react';
import { AbsoluteFill, Img, interpolate, random, useCurrentFrame } from 'remotion';
import { C, H, T, W } from '../constants';
import { clamp, ease, loop, popScale, ramp, settle, wobble } from '../easing';

type Pos = { x: number; y: number; w: number; h?: number; rotate?: number };
const abs = (p: Pos): React.CSSProperties => ({
  position: 'absolute',
  left: p.x - p.w / 2,
  top: p.y - (p.h ?? p.w) / 2,
  width: p.w,
  height: p.h,
});

/**
 * PopIn — every prop/icon/sticker in the reference enters like this:
 * 1 frame squashed sliver → overshoot to ~110% → settle 100%, with a damped ±8° wobble.
 */
export const PopIn: React.FC<
  Pos & { start: number; src?: string; children?: React.ReactNode; exit?: number; wobbleDeg?: number }
> = ({ start, src, children, exit, wobbleDeg = 8, ...p }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const s = popScale(frame, start);
  const squash = frame - start < 2 ? 0.15 : 1; // the 1-frame "thin sliver" (ref f580)
  const rot = (p.rotate ?? 0) + wobbleDeg * Math.exp(-(frame - start) / 10) * Math.sin((frame - start) / 2.2);
  const out = exit ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  if (out <= 0) return null;
  return (
    <div style={{ ...abs(p), transform: `rotate(${rot}deg) scale(${s * out}, ${s * squash * out})` }}>
      {src ? <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : children}
    </div>
  );
};

/**
 * StampSlam — wind-up (shrink + rise toward camera) → slam (150% → 100% in 6 f) → micro-shake.
 * Pass `withHandle` to show the wooden stamp block coming down first (ref f580–603 @30).
 */
export const StampSlam: React.FC<
  Pos & { start: number; src: string; handleSrc?: string; onScreenShake?: boolean; exit?: number }
> = ({ start, src, handleSrc, exit, ...p }) => {
  const frame = useCurrentFrame();
  const land = start + (handleSrc ? T.windUp + 6 : 0);
  const out = exit ? 1 - ramp(frame, exit, 6, ease.in) : 1;
  const nodes: React.ReactNode[] = [];
  if (handleSrc && frame >= start && frame < land + 6) {
    const up = ramp(frame, start, T.windUp, ease.out); // hover + rise toward camera
    const down = ramp(frame, start + T.windUp, 6, ease.in);
    const sc = 1 + up * 0.25 - down * 0.25;
    const y = p.y - 260 + down * 260;
    nodes.push(
      <Img
        key="h"
        src={handleSrc}
        style={{ ...abs({ ...p, y, w: p.w * 0.9 }), transform: `scale(${sc})`, opacity: frame > land + 2 ? 0 : 1 }}
      />,
    );
  }
  if (frame >= land && out > 0) {
    const t = frame - land;
    const s = interpolate(t, [0, T.stampSlam], [1.5, 1], { ...clamp, easing: ease.out });
    const shake = t < T.stampShake ? (random(`sh${t}`) - 0.5) * 14 : 0;
    nodes.push(
      <Img
        key="s"
        src={src}
        style={{
          ...abs(p),
          transform: `translate(${shake}px, ${-shake / 2}px) rotate(${p.rotate ?? -8}deg) scale(${s * out})`,
          opacity: interpolate(t, [0, 2], [0.6, 1], clamp) * out,
          mixBlendMode: 'multiply',
        }}
      />,
    );
  }
  return <>{nodes}</>;
};

/** Screen shake for the whole frame on a slam / gunshot. Wrap the scene with it. */
export const Shake: React.FC<{ hits: number[]; amp?: number; dur?: number; children: React.ReactNode }> = ({
  hits,
  amp = 18,
  dur = 10,
  children,
}) => {
  const frame = useCurrentFrame();
  let dx = 0;
  let dy = 0;
  for (const h of hits) {
    const t = frame - h;
    if (t >= 0 && t < dur) {
      const k = amp * (1 - t / dur);
      dx += (random(`x${h}-${t}`) - 0.5) * 2 * k;
      dy += (random(`y${h}-${t}`) - 0.5) * 2 * k;
    }
  }
  return <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px)` }}>{children}</AbsoluteFill>;
};

/**
 * ZoomPunch — instant 2.5–4× push to read a document (ref f1150–1153, f1500–1506 @30).
 * Wrap the content; focus is the point (screen px) that ends up centred.
 */
export const ZoomPunch: React.FC<{
  start: number;
  to?: number;
  focus: [number, number];
  dur?: number;
  children: React.ReactNode;
}> = ({ start, to = 3, focus, dur = T.zoomPunch, children }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, start, dur, ease.snap);
  const s = 1 + (to - 1) * t;
  const fx = (W / 2 - focus[0]) * t;
  const fy = (H / 2 - focus[1]) * t;
  // motion blur proxy during the punch (cheap at 4K): blur peaks mid-move
  const blur = t > 0 && t < 1 ? Math.sin(t * Math.PI) * 10 : 0;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${focus[0]}px ${focus[1]}px`,
        transform: `translate(${fx}px, ${fy}px) scale(${s})`,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Slide a character/prop in from an edge with motion-blur smear (ref f3158–3160: 3 f @30). */
export const SlideIn: React.FC<
  Pos & { start: number; from: 'left' | 'right' | 'top' | 'bottom'; dur?: number; exit?: number; children: React.ReactNode }
> = ({ start, from, dur = T.slideFast, exit, children, ...p }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = ramp(frame, start, dur, ease.out);
  const o = exit ? ramp(frame, exit, dur, ease.in) : 0;
  const dist = from === 'left' || from === 'right' ? W * 0.7 : H * 0.8;
  const dir = from === 'left' || from === 'top' ? -1 : 1;
  const off = dir * dist * (1 - t) + -dir * dist * o * -1;
  const horiz = from === 'left' || from === 'right';
  const v = Math.abs((1 - t) * (t > 0 ? 1 : 0)) + o;
  return (
    <div
      style={{
        ...abs(p),
        transform: horiz ? `translateX(${off}px)` : `translateY(${off}px)`,
        filter: v > 0.02 && v < 0.98 ? `blur(${v * 14}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** Idle bob for anything on screen (signs, crowd heads, flags). */
export const Bob: React.FC<{ seed: string; amp?: number; speed?: number; children: React.ReactNode }> = ({
  seed,
  amp = 6,
  speed = 0.05,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ transform: `translate(${wobble(seed + 'x', frame, amp * 0.4, speed)}px, ${wobble(seed, frame, amp, speed)}px)` }}>
      {children}
    </div>
  );
};

/** White block arrow that pops then pulses in/out (ref f882–915 @30: ~6 px every ~10 f). */
export const ArrowBob: React.FC<Pos & { start: number; src: string; exit?: number }> = ({ start, src, exit, ...p }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const s = popScale(frame, start);
  const pulse = Math.sin(loop(frame - start, 40) * Math.PI * 2) * 18;
  const r = ((p.rotate ?? 0) * Math.PI) / 180;
  const out = exit ? 1 - ramp(frame, exit, 6, ease.in) : 1;
  if (out <= 0) return null;
  return (
    <Img
      src={src}
      style={{
        ...abs(p),
        transform: `translate(${Math.cos(r) * pulse}px, ${Math.sin(r) * pulse}px) rotate(${p.rotate ?? 0}deg) scale(${s * (exit ? 1 + (1 - out) * 0.6 : 1)})`,
        opacity: out,
      }}
    />
  );
};

/** Drop from above with a squash on landing (crown, cap, headbands, the Declaration). */
export const DropIn: React.FC<Pos & { start: number; src: string; fall?: number; spin?: number }> = ({
  start,
  src,
  fall = 12,
  spin = 0,
  ...p
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = ramp(frame, start, fall, ease.in);
  const y = p.y - (1 - t) * (p.y + (p.h ?? p.w));
  const land = frame - (start + fall);
  const squash = land >= 0 ? 1 - 0.18 * Math.exp(-land / 3) * Math.cos(land / 1.5) : 1;
  return (
    <Img
      src={src}
      style={{
        ...abs({ ...p, y }),
        transformOrigin: '50% 100%',
        transform: `rotate(${(1 - t) * spin + (p.rotate ?? 0)}deg) scale(${2 - squash}, ${squash})`,
      }}
    />
  );
};

/** Thrown/flung object on a gravity arc with spin (torn paper halves, tea chests, cards). */
export const Fling: React.FC<
  Pos & { start: number; src: string; vx: number; vy: number; g?: number; spin?: number; life?: number }
> = ({ start, src, vx, vy, g = 2.2, spin = 18, life = 40, ...p }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > life) return null;
  return (
    <Img
      src={src}
      style={{
        ...abs({ ...p, x: p.x + vx * t, y: p.y + vy * t + 0.5 * g * t * t }),
        transform: `rotate(${(p.rotate ?? 0) + spin * t}deg)`,
        opacity: interpolate(t, [life - 8, life], [1, 0], clamp),
      }}
    />
  );
};

/** Lands with a settle spring (used for characters arriving at a mark). */
export const SettleIn: React.FC<Pos & { start: number; children: React.ReactNode }> = ({ start, children, ...p }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const s = settle(frame, start);
  return <div style={{ ...abs(p), transform: `translateY(${(1 - s) * 80}px)`, opacity: Math.min(1, s * 2) }}>{children}</div>;
};

/** Red X / green ✓ neon icon with a flicker-on (ref f1962–1979 @30: 3 f on / 3 f off ×2). */
export const NeonIcon: React.FC<Pos & { start: number; src: string; color: 'red' | 'green'; exit?: number }> = ({
  start,
  src,
  color,
  exit,
  ...p
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  const flick = t < 8 ? 0.35 : t < 14 ? 1 : t < 20 ? 0.35 : t < 26 ? 1 : 1; // 6 f on/off @60
  const glow = color === 'red' ? C.neonRed : C.neonGreen;
  const s = popScale(frame, start);
  const out = exit ? 1 - ramp(frame, exit, 8, ease.in) : 1;
  return (
    <Img
      src={src}
      style={{
        ...abs(p),
        transform: `scale(${s * out})`,
        filter: `drop-shadow(0 0 ${24 * flick}px ${glow}) drop-shadow(0 0 ${60 * flick}px ${glow})`,
        opacity: (0.55 + 0.45 * flick) * out,
      }}
    />
  );
};
```

### 7.13 `src/lib/fx/transitions.tsx`

```tsx
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { H, T, W } from '../constants';
import { clamp, ease, ramp } from '../easing';

/**
 * All transitions are overlays/wrappers applied at a cut frame `at`, so scenes stay simple:
 *   <Sequence from={0} durationInFrames={a}><WhipOut at={a - T.whip/2}><SceneA/></WhipOut></Sequence>
 *   <Sequence from={a}><WhipIn><SceneB/></WhipIn></Sequence>
 * Measured from the reference: whip 3–5 f, zoom-blur 3–9 f, iris 4 f, line-wipe 15 f, black 31 f (@30).
 */

/** Whip-pan OUT: content accelerates sideways with horizontal smear. */
export const WhipOut: React.FC<{ at: number; dir?: 1 | -1; dur?: number; children: React.ReactNode }> = ({
  at,
  dir = -1,
  dur = T.whip / 2,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, dur, ease.in);
  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${dir * t * W * 0.6}px) scaleX(${1 + t * 0.15})`,
        filter: t > 0 ? `blur(${t * 40}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Whip-pan IN: arrives smeared from the opposite side and settles. Use at the start of a Sequence. */
export const WhipIn: React.FC<{ dir?: 1 | -1; dur?: number; children: React.ReactNode }> = ({
  dir = -1,
  dur = T.whip / 2,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = 1 - ramp(frame, 0, dur, ease.out);
  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${-dir * t * W * 0.6}px) scaleX(${1 + t * 0.15})`,
        filter: t > 0.01 ? `blur(${t * 40}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Radial zoom-blur: OUT pushes into the centre, IN lands from a smeared zoom (ref f1786–1795 @30). */
export const ZoomBlurOut: React.FC<{ at: number; dur?: number; children: React.ReactNode }> = ({
  at,
  dur = T.zoomBlur / 2,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, dur, ease.in);
  return <ZoomSmear t={t}>{children}</ZoomSmear>;
};
export const ZoomBlurIn: React.FC<{ dur?: number; children: React.ReactNode }> = ({ dur = T.zoomBlur / 2, children }) => {
  const frame = useCurrentFrame();
  const t = 1 - ramp(frame, 0, dur, ease.out);
  return <ZoomSmear t={t}>{children}</ZoomSmear>;
};
/** Cheap radial smear: 6 stacked copies at increasing scale and falling opacity. */
const ZoomSmear: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  if (t <= 0.01) return <AbsoluteFill>{children}</AbsoluteFill>;
  const copies = 6;
  return (
    <AbsoluteFill>
      {Array.from({ length: copies }).map((_, i) => (
        <AbsoluteFill
          key={i}
          style={{
            transform: `scale(${1 + t * 0.9 * (i / copies) + t * 0.3})`,
            opacity: i === 0 ? 1 : (1 - i / copies) * 0.45,
            filter: `blur(${t * 8 * (i + 1)}px)`,
          }}
        >
          {children}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

/** Soft black blob that sweeps across (ref f2045–2051 @30). Put it ON TOP at the cut. */
export const IrisBlob: React.FC<{ at: number; dur?: number }> = ({ at, dur = 12 }) => {
  const frame = useCurrentFrame();
  const t = (frame - at) / dur; // 0..1 covers, 1..2 uncovers
  if (t < 0 || t > 2) return null;
  const cover = t <= 1 ? ease.in(t) : 1 - ease.out(t - 1);
  const cx = interpolate(t, [0, 2], [W * 1.05, -W * 0.05]);
  const r = cover * Math.hypot(W, H) * 0.75;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle ${r}px at ${cx}px ${H / 2}px, #000 0%, #000 85%, rgba(0,0,0,0) 100%)`,
      }}
    />
  );
};

/** Thin white vertical line sweeping right→left, revealing the NEXT style behind it (ref f187–202 @30). */
export const LineWipe: React.FC<{ at: number; dur?: number; next: React.ReactNode; children: React.ReactNode }> = ({
  at,
  dur = 30,
  next,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, dur, ease.inOut);
  const x = W * (1 - t);
  return (
    <AbsoluteFill>
      {children}
      {t > 0 && (
        <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${x}px)` }}>
          {next}
        </AbsoluteFill>
      )}
      {t > 0 && t < 1 && (
        <div style={{ position: 'absolute', left: x - 5, top: 0, width: 10, height: H, background: '#fff', boxShadow: '0 0 30px #fff' }} />
      )}
    </AbsoluteFill>
  );
};

/** Hard black hold (used ONCE, after "the war begins": ref 31 f @30 = 62 f @60). */
export const BlackHold: React.FC<{ at: number; dur?: number }> = ({ at, dur = T.blackHold }) => {
  const frame = useCurrentFrame();
  return frame >= at && frame < at + dur ? <AbsoluteFill style={{ background: '#000' }} /> : null;
};

/** White flash (1–3 f) for the satellite → parchment style switch. */
export const Flash: React.FC<{ at: number; dur?: number }> = ({ at, dur = 6 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 1, at + dur], [0, 0.85, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ background: '#fff', opacity: o }} /> : null;
};
```

### 7.14 `src/lib/fx/text.tsx`

```tsx
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { C, FONTS, T } from '../constants';
import { clamp, ease, popScale, ramp } from '../easing';

const serif: React.CSSProperties = {
  fontFamily: FONTS.serif,
  fontWeight: 700,
  color: '#fff',
  textShadow: '0 6px 24px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.6)',
  lineHeight: 1.02,
  whiteSpace: 'pre',
};

/**
 * Title like "Seven Years' War (1756–1763)": enters LARGE and scales DOWN into place
 * (ref f375–382 & f3938–3946 @30), date line in yellow. mode 'type' = 1 char / 2 f.
 */
export const MapTitle: React.FC<{
  x: number;
  y: number;
  text: string;
  date?: string;
  start: number;
  size?: number;
  mode?: 'slam' | 'type' | 'fade';
  align?: 'left' | 'center';
  color?: string;
  exit?: number;
}> = ({ x, y, text, date, start, size = 150, mode = 'slam', align = 'center', color = '#fff', exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = ramp(frame, start, T.titleIn, ease.out);
  const sc = mode === 'slam' ? interpolate(t, [0, 1], [1.6, 1]) : mode === 'fade' ? interpolate(t, [0, 1], [1.05, 1]) : 1;
  const chars = mode === 'type' ? Math.floor((frame - start) / T.typePerChar) : text.length;
  const out = exit ? 1 - ramp(frame, exit, 10, ease.in) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%) scale(${sc})`,
        transformOrigin: align === 'center' ? '50% 50%' : '0 50%',
        textAlign: align,
        opacity: (mode === 'type' ? 1 : t) * out,
      }}
    >
      <div style={{ ...serif, fontSize: size, color }}>{text.slice(0, chars)}</div>
      {date && (
        <div style={{ ...serif, fontSize: size * 0.42, color: C.dateYellow, marginTop: size * 0.12, opacity: chars >= text.length ? 1 : 0 }}>
          {date}
        </div>
      )}
    </div>
  );
};

/** Quote typed WORD BY WORD on the VO timing (ref f3719–3752 @30). Pass the frame of each word. */
export const WordReveal: React.FC<{
  x: number;
  y: number;
  words: { w: string; at: number }[];
  attribution?: string;
  size?: number;
  color?: string;
}> = ({ x, y, words, attribution, size = 110, color = C.ink }) => {
  const frame = useCurrentFrame();
  const done = frame >= words[words.length - 1].at + 6;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
      <div style={{ fontFamily: FONTS.serif, fontSize: size, fontWeight: 600, color, whiteSpace: 'pre' }}>
        {words.map(({ w, at }, i) => (
          <span key={i} style={{ opacity: ramp(frame, at, 6, ease.out), display: 'inline-block', transform: `translateY(${(1 - ramp(frame, at, 8, ease.out)) * 20}px)` }}>
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
      {attribution && (
        <div style={{ fontFamily: FONTS.serif, fontSize: size * 0.3, color, opacity: done ? 1 : 0, marginTop: 18, textAlign: 'right' }}>
          — {attribution}
        </div>
      )}
    </div>
  );
};

/** Yellow highlighter swipe over a rectangle (ref f4527–4538 @30). Duration scales with text length. */
export const Highlighter: React.FC<{ x: number; y: number; w: number; h: number; start: number; chars?: number; color?: string }> = ({
  x,
  y,
  w,
  h,
  start,
  chars = 30,
  color = C.highlighter,
}) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start, Math.max(12, chars * T.highlightPerChar), ease.inOut);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w * p,
        height: h,
        background: color,
        mixBlendMode: 'multiply',
        borderRadius: h * 0.25,
        transform: 'skewX(-6deg)',
      }}
    />
  );
};

/** Hand-drawn red strike-through, drawn left→right in 14 f (ref f2706–2712 @30). */
export const StrikeThrough: React.FC<{ x: number; y: number; w: number; start: number; color?: string; width?: number }> = ({
  x,
  y,
  w,
  start,
  color = C.strikeRed,
  width = 10,
}) => {
  const frame = useCurrentFrame();
  const d = `M 0 ${width} C ${w * 0.3} ${width * 0.2}, ${w * 0.7} ${width * 1.8}, ${w} ${width * 0.8}`;
  const p = ramp(frame, start, T.strike, ease.inOut);
  if (p <= 0) return null;
  const ev = evolvePath(p, d);
  return (
    <svg style={{ position: 'absolute', left: x, top: y - width, overflow: 'visible' }} width={w} height={width * 2}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" {...ev} />
    </svg>
  );
};

/** Green marker loop around an item, with an overshoot tail (ref f2805–2812 @30). */
export const MarkerLoop: React.FC<{ cx: number; cy: number; rx: number; ry: number; start: number; color?: string }> = ({
  cx,
  cy,
  rx,
  ry,
  start,
  color = C.markerGreen,
}) => {
  const frame = useCurrentFrame();
  // slightly open, rotated ellipse with a tail = hand-drawn feel
  const d = `M ${cx + rx * 0.9} ${cy - ry * 0.55}
    C ${cx + rx * 1.15} ${cy + ry * 0.6}, ${cx - rx * 0.4} ${cy + ry * 1.25}, ${cx - rx} ${cy + ry * 0.2}
    C ${cx - rx * 1.25} ${cy - ry * 0.9}, ${cx + rx * 0.5} ${cy - ry * 1.3}, ${cx + rx * 1.05} ${cy - ry * 0.25}
    L ${cx + rx * 1.18} ${cy + ry * 0.05}`;
  const p = ramp(frame, start, 16, ease.inOut);
  if (p <= 0) return null;
  return (
    <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width="100%" height="100%">
      <path d={d} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" {...evolvePath(p, d)} />
    </svg>
  );
};

/**
 * Timeline ruler "1775 – 1776 – 1777": enters as a horizontal light streak (12 f), labels fade up,
 * the active label turns yellow on a single frame (ref f114–127 @30). `steps` lets it scroll/rewind.
 */
export const TimelineRuler: React.FC<{
  x: number;
  y: number;
  start: number;
  steps: { at: number; labels: [string, string, string] }[];
  header?: string;
  exit?: number;
}> = ({ x, y, start, steps, header, exit }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const streak = ramp(frame, start, 12, ease.out);
  const current = [...steps].reverse().find((s) => frame >= s.at) ?? steps[0];
  const sinceStep = frame - current.at;
  const labelIn = ramp(frame, Math.max(start + 12, current.at), 10, ease.out);
  const slide = sinceStep < 10 ? (1 - ramp(frame, current.at, 10, ease.out)) * 120 : 0;
  const out = exit ? 1 - ramp(frame, exit, 12, ease.in) : 1;
  const w = 1100;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y, width: w, opacity: out }}>
      {header && <div style={{ ...serif, fontSize: 80, textAlign: 'center', marginBottom: 12, opacity: labelIn }}>{header}</div>}
      <div style={{ height: 5, background: '#fff', width: w * streak, margin: '0 auto', boxShadow: '0 0 20px #fff' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', transform: `translateX(${slide}px)`, opacity: labelIn }}>
        {current.labels.map((l, i) => (
          <div key={i} style={{ ...serif, fontSize: i === 1 ? 84 : 60, color: i === 1 && sinceStep >= 6 ? C.dateYellow : '#fff', marginTop: 10 }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Label with a hand-drawn curved arrow (e.g. "George Washington" ↘). Arrow draws on in 12 f. */
export const ArrowLabel: React.FC<{ x: number; y: number; text: string; to: [number, number]; start: number; size?: number }> = ({
  x,
  y,
  text,
  to,
  start,
  size = 72,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const s = popScale(frame, start);
  const d = `M ${x} ${y + size * 0.7} Q ${(x + to[0]) / 2 + 120} ${y + size * 0.4}, ${to[0]} ${to[1]}`;
  const p = ramp(frame, start + 4, 12, ease.out);
  return (
    <>
      <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, ...serif, fontSize: size }}>
        {text}
      </div>
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width="100%" height="100%">
        <path d={d} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" {...evolvePath(p, d)} />
      </svg>
    </>
  );
};

export { clamp };
```

### 7.15 `src/lib/fx/particles.tsx`

```tsx
import React from 'react';
import { AbsoluteFill, Audio, Img, random, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { H, W } from '../constants';
import { ease, ramp } from '../easing';

/**
 * Musket smoke: grey puffs spawn at the muzzle, grow, drift and fade over ~40 f (ref f2421–2443 @30).
 * Also used for the Lexington single shot and battle-map puffs (smaller `size`).
 */
export const MuzzleSmoke: React.FC<{ x: number; y: number; start: number; dir?: 1 | -1; size?: number; puffs?: number }> = ({
  x,
  y,
  start,
  dir = -1,
  size = 160,
  puffs = 7,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > 90) return null;
  return (
    <>
      {t < 3 && (
        <div
          style={{
            position: 'absolute',
            left: x - size * 0.35,
            top: y - size * 0.35,
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fff7c2 0%, #ffb02e 45%, rgba(255,120,0,0) 70%)',
          }}
        />
      )}
      {Array.from({ length: puffs }).map((_, i) => {
        const d = Math.max(0, t - i * 2);
        const g = ramp(d, 0, 50, ease.out);
        const px = x + dir * (i * size * 0.22 + g * size * 0.9) + (random(`sx${start}${i}`) - 0.5) * size * 0.4;
        const py = y - g * size * 0.35 + (random(`sy${start}${i}`) - 0.5) * size * 0.3;
        const r = size * (0.35 + g * 0.9) * (0.7 + random(`sr${start}${i}`) * 0.6);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - r,
              top: py - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(225,225,225,0.85) 0%, rgba(200,200,200,0.5) 45%, rgba(200,200,200,0) 70%)',
              filter: 'blur(6px)',
              opacity: 1 - ramp(d, 30, 60, ease.inOut),
            }}
          />
        );
      })}
    </>
  );
};

/** White powder burst (snowball hit, ref f2307–2319 @30). */
export const ImpactPuff: React.FC<{ x: number; y: number; start: number; color?: string; size?: number }> = ({
  x,
  y,
  start,
  color = '#ffffff',
  size = 140,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > 30) return null;
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = random(`ia${start}${i}`) * Math.PI * 2;
        const v = 6 + random(`iv${start}${i}`) * 10;
        const r = 10 + random(`ir${start}${i}`) * 22;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.cos(a) * v * t - r,
              top: y + Math.sin(a) * v * t + 0.25 * t * t - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: color,
              opacity: 1 - t / 30,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: x - size,
          top: y - size,
          width: size * 2,
          height: size * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 70%)`,
          opacity: 1 - t / 12,
        }}
      />
    </>
  );
};

/**
 * Paper tear: one image split into two halves along a jagged line, halves pull apart then fling
 * (ref f1437–1462 @30). The jag is generated deterministically.
 */
export const PaperTear: React.FC<{ x: number; y: number; w: number; h: number; src: string; tearAt: number; flingAt: number }> = ({
  x,
  y,
  w,
  h,
  src,
  tearAt,
  flingAt,
}) => {
  const frame = useCurrentFrame();
  const pts = Array.from({ length: 9 }).map((_, i) => [50 + (random(`tear${i}`) - 0.5) * 12, (i / 8) * 100]);
  const left = `polygon(0% 0%, ${pts.map(([px, py]) => `${px}% ${py}%`).join(', ')}, 0% 100%)`;
  const right = `polygon(100% 0%, ${pts.map(([px, py]) => `${px}% ${py}%`).join(', ')}, 100% 100%)`;
  const apart = ramp(frame, tearAt, 8, ease.out) * w * 0.18;
  const ft = Math.max(0, frame - flingAt);
  const half = (side: -1 | 1, clip: string) => (
    <Img
      src={src}
      style={{
        position: 'absolute',
        left: x - w / 2 + side * apart + side * ft * 14,
        top: y - h / 2 - ft * 10 + 0.5 * 1.6 * ft * ft,
        width: w,
        height: h,
        clipPath: clip,
        transform: `rotate(${side * (frame >= tearAt ? 6 : 0) + side * ft * 9}deg)`,
        opacity: ft > 40 ? 0 : 1,
      }}
    />
  );
  return (
    <>
      {half(-1, left)}
      {half(1, right)}
    </>
  );
};

/* ───────────── COLOUR GRADE / FINISH (put <Finish/> as the LAST layer of every scene) ───────────── */

/**
 * Studio finish: gentle S-curve via contrast/saturation, warm highlights, vignette and
 * animated film grain (feTurbulence seeded per frame, rendered at 1/2 res then upscaled).
 * For a real LUT, render ProRes and grade in DaVinci, or ffmpeg -vf lut3d=file.cube (see docs).
 */
export const Finish: React.FC<{ grain?: number; vignette?: number; warmth?: number }> = ({
  grain = 0.06,
  vignette = 0.32,
  warmth = 0.06,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `rgba(255, 170, 80, ${warmth})`, mixBlendMode: 'soft-light' }} />
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 58%, rgba(0,0,0,${vignette}) 100%)` }}
      />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: grain, mixBlendMode: 'overlay' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={frame % 97} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W / 2} height={H / 2} filter="url(#grain)" transform="scale(2)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Grade wrapper: apply to the scene content (NOT to <Finish/>). */
export const Grade: React.FC<{ children: React.ReactNode; contrast?: number; saturate?: number; brightness?: number }> = ({
  children,
  contrast = 1.06,
  saturate = 1.08,
  brightness = 1.0,
}) => <AbsoluteFill style={{ filter: `contrast(${contrast}) saturate(${saturate}) brightness(${brightness})` }}>{children}</AbsoluteFill>;

/** One-shot SFX at a frame. Files live in public/assets/sfx (see the asset doc for sources). */
export const Sfx: React.FC<{ at: number; file: string; volume?: number }> = ({ at, file, volume = 0.9 }) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(`assets/sfx/${file}`)} volume={volume} />
  </Sequence>
);
```

### 7.16 `src/lib/fx/flags.tsx`

```tsx
import React from 'react';

/**
 * Historically correct flags drawn as SVG (never AI-generated — generators get them wrong).
 *  - UnionFlag1707: Great Britain 1707–1801. St George's cross + St Andrew's saltire.
 *    NO red St Patrick's saltire (that was added in 1801).
 *  - GrandUnion: "Continental Colours", raised Jan 1776 — 13 red/white stripes + the 1707 union.
 *    (The 13-star flag was only adopted on 14 June 1777 — do NOT use it for 1776.)
 *  - BourbonFrance: plain white royal ensign used by French ships/forts in the period.
 * Use as React components, or render once to PNG for FlagFill/<image>.
 */
const NAVY = '#012169';
const RED = '#C8102E';

export const UnionFlag1707: React.FC<{ width: number }> = ({ width }) => {
  const h = width / 2;
  return (
    <svg width={width} height={h} viewBox="0 0 60 30">
      <rect width="60" height="30" fill={NAVY} />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke={RED} strokeWidth="6" />
    </svg>
  );
};

export const GrandUnion: React.FC<{ width: number }> = ({ width }) => {
  const h = (width * 10) / 19;
  return (
    <svg width={width} height={h} viewBox="0 0 190 100">
      {Array.from({ length: 13 }).map((_, i) => (
        <rect key={i} y={(i * 100) / 13} width="190" height={100 / 13 + 0.2} fill={i % 2 ? '#fff' : '#B22234'} />
      ))}
      <svg x="0" y="0" width="76" height={(100 / 13) * 7} viewBox="0 0 60 30" preserveAspectRatio="none">
        <rect width="60" height="30" fill={NAVY} />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke={RED} strokeWidth="6" />
      </svg>
    </svg>
  );
};

export const BourbonFrance: React.FC<{ width: number }> = ({ width }) => (
  <svg width={width} height={(width * 2) / 3} viewBox="0 0 3 2">
    <rect width="3" height="2" fill="#FBFBF5" stroke="#bbb" strokeWidth="0.02" />
  </svg>
);
```

### 7.17 `src/lib/fx/depth.tsx`

```tsx
import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { H, T, W } from '../constants';
import { ease, wobble } from '../easing';

/**
 * 2.5D depth tools — this is what makes flat assets feel 3D like the reference:
 * parallax between background layers, depth-of-field blur, contact shadows under feet,
 * and real CSS-3D rotation (with moving light) on paper props.
 */

export type PlateKey = { frame: number; x: number; y: number; zoom: number }; // x/y = pan in px at depth 1

/**
 * ParallaxPlate — one background split into layers (far sky → mid buildings → near floor).
 * A camera move shifts near layers more than far layers = depth. `blur` on far layers = depth of field.
 * Generate the layers with the "LAYERED PLATE" prompts in docs/ASSET_PROMPTS.md §7.2.
 */
export const ParallaxPlate: React.FC<{
  layers: { src: string; depth: number; blur?: number }[]; // depth 0 = infinitely far, 1 = foreground
  camera: PlateKey[];
  children?: React.ReactNode; // characters go between layers: pass them here, rendered at depth 0.8
  charactersDepth?: number;
}> = ({ layers, camera, children, charactersDepth = 0.8 }) => {
  const frame = useCurrentFrame();
  let k = camera[0];
  let x = k.x;
  let y = k.y;
  let zoom = k.zoom;
  for (let i = 1; i < camera.length; i++) {
    const b = camera[i];
    const a = camera[i - 1];
    if (frame >= a.frame) {
      const t = ease.inOut(Math.min(1, (frame - a.frame) / Math.max(1, b.frame - a.frame)));
      x = a.x + (b.x - a.x) * t;
      y = a.y + (b.y - a.y) * t;
      zoom = a.zoom + (b.zoom - a.zoom) * t;
      k = b;
    }
  }
  const last = camera[camera.length - 1];
  if (frame > last.frame) zoom *= 1 + T.driftPerSec * ((frame - last.frame) / 60); // never stops
  const layerStyle = (depth: number, blur = 0): React.CSSProperties => {
    const z = 1 + (zoom - 1) * (0.35 + depth * 0.65);
    return {
      position: 'absolute',
      inset: 0,
      transform: `translate(${x * depth}px, ${y * depth}px) scale(${z * (1.04 + depth * 0.04)})`,
      transformOrigin: '50% 60%',
      filter: blur ? `blur(${blur}px)` : undefined,
    };
  };
  const sorted = [...layers].sort((a, b) => a.depth - b.depth);
  const front = sorted.filter((l) => l.depth > charactersDepth);
  const back = sorted.filter((l) => l.depth <= charactersDepth);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {back.map((l) => (
        <Img key={l.src} src={l.src} style={{ ...layerStyle(l.depth, l.blur), width: W, height: H, objectFit: 'cover' }} />
      ))}
      <div style={layerStyle(charactersDepth)}>{children}</div>
      {front.map((l) => (
        <Img key={l.src} src={l.src} style={{ ...layerStyle(l.depth, l.blur), width: W, height: H, objectFit: 'cover' }} />
      ))}
    </AbsoluteFill>
  );
};

/** Soft contact shadow under a character's feet (x, y = feet). Grounds cut-outs on photo plates. */
export const ContactShadow: React.FC<{ x: number; y: number; width: number; opacity?: number }> = ({ x, y, width, opacity = 0.38 }) => (
  <div
    style={{
      position: 'absolute',
      left: x - width / 2,
      top: y - width * 0.06,
      width,
      height: width * 0.12,
      borderRadius: '50%',
      background: `radial-gradient(ellipse at center, rgba(20,12,6,${opacity}) 0%, rgba(20,12,6,0) 70%)`,
      filter: 'blur(6px)',
    }}
  />
);

/**
 * Paper3D — a document/print that floats in real 3D: perspective tilt that slowly swings,
 * a moving specular sheen and a soft shadow that shifts with the tilt
 * (the reference's Revere engraving / Declaration shots).
 */
export const Paper3D: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  start: number;
  baseTilt?: [number, number, number]; // rotateX, rotateY, rotateZ in degrees
  swing?: number; // degrees of slow swing
}> = ({ src, x, y, w, h, start, baseTilt = [8, -14, -4], swing = 5 }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  const rx = baseTilt[0] + wobble('p3x', frame, swing, 0.015);
  const ry = baseTilt[1] + wobble('p3y', frame, swing, 0.012);
  const rz = baseTilt[2] + wobble('p3z', frame, swing * 0.4, 0.01);
  const enter = Math.min(1, t / 14);
  const sheen = 50 + ry * 3;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, perspective: 2600 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateZ(${(1 - ease.out(enter)) * -900}px) rotateX(${rx}deg) rotateY(${ry + (1 - enter) * 60}deg) rotateZ(${rz}deg)`,
          transformStyle: 'preserve-3d',
          boxShadow: `${-ry * 2.4}px ${18 + rx * 2}px 60px rgba(0,0,0,0.45)`,
        }}
      >
        <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(115deg, rgba(255,255,255,0) ${sheen - 18}%, rgba(255,255,255,0.22) ${sheen}%, rgba(255,255,255,0) ${sheen + 18}%)`,
            mixBlendMode: 'screen',
          }}
        />
      </div>
    </div>
  );
};
```

### 7.18 `src/lib/three/Map3D.tsx`

```tsx
import React, { useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import type { Feature, Geometry, MultiPolygon, Polygon, Position } from 'geojson';
import { C, T } from '../constants';
import { ease } from '../easing';
import { colonies, land, COLONY_IDS } from '../map/data';

/**
 * REAL 3D map (Three.js inside Remotion). Same lon/lat data as the 2D map, so it lines up 1:1.
 * World units: 1 unit = 1 degree of latitude; longitude is scaled by cos(lat0) so shapes are not stretched.
 *
 *  - land: thin extruded slab (parchment colour), receives shadows
 *  - colonies: extruded blocks that RISE one by one (N→S stagger) with a spring overshoot,
 *    flash white → colony blue, cast soft shadows on the land
 *  - ocean: large plane, slightly glossy
 *  - camera: keyframes in lon/lat + distance + tilt + yaw, eased; never fully stops (drift)
 *
 * Render with:  --gl=angle   (GPU)   or   --gl=swangle   (CPU-only machines / cloud)
 */

export type Cam3DKey = {
  frame: number;
  lon: number;
  lat: number;
  dist: number; // distance from target in world units (≈ degrees). 40 = eastern NA, 8 = New England
  tilt: number; // degrees from straight-down (0 = top view, 55 = dramatic oblique)
  yaw?: number; // degrees around the vertical axis
};

const ORIGIN = { lon: -77, lat: 38 };
const KX = Math.cos((ORIGIN.lat * Math.PI) / 180);
const toXY = (lon: number, lat: number): [number, number] => [(lon - ORIGIN.lon) * KX, lat - ORIGIN.lat];

const ringToPath = (ring: Position[], path: THREE.Path) => {
  ring.forEach(([lon, lat], i) => {
    const [x, y] = toXY(lon, lat);
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
};

const polygonsOf = (g: Geometry): Position[][][] =>
  g.type === 'Polygon' ? [(g as Polygon).coordinates] : g.type === 'MultiPolygon' ? (g as MultiPolygon).coordinates : [];

const shapesFrom = (g: Geometry, bbox?: [number, number, number, number]) => {
  const shapes: THREE.Shape[] = [];
  for (const poly of polygonsOf(g)) {
    const [lon0, lat0] = poly[0][0];
    if (bbox && (lon0 < bbox[0] - 30 || lon0 > bbox[2] + 30 || lat0 < bbox[1] - 20 || lat0 > bbox[3] + 20)) continue;
    const s = new THREE.Shape();
    ringToPath(poly[0], s);
    for (const hole of poly.slice(1)) {
      const h = new THREE.Path();
      ringToPath(hole, h);
      s.holes.push(h);
    }
    shapes.push(s);
  }
  return shapes;
};

const camAt = (keys: Cam3DKey[], frame: number) => {
  if (frame <= keys[0].frame) return { yaw: 0, ...keys[0] };
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame <= b.frame) {
      const t = ease.inOut((frame - a.frame) / Math.max(1, b.frame - a.frame));
      const l = (x: number, y: number) => x + (y - x) * t;
      return {
        lon: l(a.lon, b.lon),
        lat: l(a.lat, b.lat),
        dist: Math.exp(l(Math.log(a.dist), Math.log(b.dist))),
        tilt: l(a.tilt, b.tilt),
        yaw: l(a.yaw ?? 0, b.yaw ?? 0),
      };
    }
  }
  const last = keys[keys.length - 1];
  const held = (frame - last.frame) / 60;
  return { yaw: 0, ...last, dist: last.dist / (1 + T.driftPerSec * held) }; // the camera never stops
};

const CameraRig: React.FC<{ keys: Cam3DKey[] }> = ({ keys }) => {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  const c = camAt(keys, frame);
  const [tx, ty] = toXY(c.lon, c.lat);
  const tilt = (c.tilt * Math.PI) / 180;
  const yaw = ((c.yaw ?? 0) * Math.PI) / 180;
  // orbit: start above the target, lean back by `tilt` toward the south, rotate by `yaw`
  const back = Math.sin(tilt) * c.dist;
  camera.position.set(tx + Math.sin(yaw) * back, ty - Math.cos(yaw) * back, Math.cos(tilt) * c.dist);
  camera.up.set(0, 0, 1);
  camera.lookAt(tx, ty, 0);
  camera.updateProjectionMatrix();
  return null;
};

const Colony: React.FC<{ feature: Feature<Geometry>; index: number; start: number; height: number; color: string }> = ({
  feature,
  index,
  start,
  height,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const geom = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shapesFrom(feature.geometry), {
      depth: 1,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 1,
    });
    return g;
  }, [feature]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geom, 40), [geom]);
  const s = start + index * T.fillPerState;
  const rise = spring({ frame: frame - s, fps, config: { damping: 10, stiffness: 160, mass: 0.7 } }); // overshoot
  const flash = Math.min(1, Math.max(0, (frame - s - 6) / (T.fillPerState * 1.4)));
  // ±4% lightness per colony so neighbours read as separate states (like the reference's borders)
  const tint = new THREE.Color(color).offsetHSL(0, 0, (index % 3) * 0.04 - 0.04);
  const col = new THREE.Color('#F2F7FF').lerp(tint, flash);
  if (frame < s) return null;
  return (
    <mesh geometry={geom} scale={[1, 1, Math.max(0.001, rise * height)]} castShadow receiveShadow>
      <meshStandardMaterial color={col} roughness={0.55} metalness={0.05} />
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#FFFFFF" transparent opacity={0.75} />
      </lineSegments>
    </mesh>
  );
};

export const Map3D: React.FC<{
  camera: Cam3DKey[];
  riseStart?: number;
  height?: number; // extrude height of colonies in world units (0.35 ≈ subtle, 0.8 = bold)
  colonyColor?: string;
  landColor?: string;
  seaColor?: string;
  width: number;
  heightPx: number;
}> = ({
  camera,
  riseStart = 20,
  height = 0.45,
  colonyColor = C.colonyBlue,
  landColor = C.parchLand,
  seaColor = C.parchSea,
  width,
  heightPx,
}) => {
  const landGeom = useMemo(() => {
    const feats = (land.features as Feature<Geometry>[]).flatMap((f) => shapesFrom(f.geometry, [-100, 20, -55, 55]));
    return new THREE.ExtrudeGeometry(feats, { depth: 0.06, bevelEnabled: false, curveSegments: 1 });
  }, []);
  const ordered = useMemo(
    () => COLONY_IDS.map((id) => colonies.features.find((f) => f.properties?.id === id) as Feature<Geometry>),
    [],
  );
  return (
    <ThreeCanvas
      width={width}
      height={heightPx}
      shadows
      camera={{ fov: 32, near: 0.1, far: 1000, position: [0, -20, 40] }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      style={{ backgroundColor: seaColor }}
    >
      <CameraRig keys={camera} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#fff6e6', '#3d5a5c', 0.35]} />
      <directionalLight
        position={[-25, 30, 45]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0004}
      />
      <mesh position={[0, 0, -0.02]} receiveShadow>
        <planeGeometry args={[400, 300]} />
        <meshStandardMaterial color={seaColor} roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh geometry={landGeom} receiveShadow>
        <meshStandardMaterial color={landColor} roughness={0.9} />
      </mesh>
      <group position={[0, 0, 0.06]}>
        {ordered.map((f, i) => (
          <Colony key={f.properties?.id} feature={f} index={i} start={riseStart} height={height} color={colonyColor} />
        ))}
      </group>
    </ThreeCanvas>
  );
};
```

### 7.19 `src/lib/character/Face.tsx`

```tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, T } from '../constants';
import { loop } from '../easing';

export type Mood = 'neutral' | 'smile' | 'grin' | 'angry' | 'furious' | 'worried' | 'shocked' | 'smug' | 'sad';
export type Talk = [number, number][]; // frame ranges where the character speaks (lip-flap)

/**
 * Chibi face drawn in code (reference style: dot eyes, thin brows, simple mouth).
 * Mouth shapes: closed line / small "o" / open oval / big grin / gritted teeth.
 * Talking = open↔closed every T.mouthCycle frames inside each `talk` range.
 */
export const Face: React.FC<{
  size: number; // face width in px
  mood?: Mood;
  look?: number; // -1..1 pupils left/right
  talk?: Talk;
  blinkSeed?: number;
  style?: 'dot' | 'googly'; // dot = human chibi, googly = map characters (big white eyes)
}> = ({ size, mood = 'neutral', look = 0, talk = [], blinkSeed = 0, style = 'dot' }) => {
  const frame = useCurrentFrame();
  const talking = talk.some(([a, b]) => frame >= a && frame <= b);
  const open = talking && loop(frame, T.mouthCycle) < 0.5;
  const blink = loop(frame + blinkSeed * 53, T.blinkEvery) < T.blink / T.blinkEvery;
  const brow = { neutral: 0, smile: -4, grin: -6, angry: 16, furious: 24, worried: -14, shocked: -18, smug: 6, sad: -10 }[mood];
  const eyeY = 42;
  const googly = style === 'googly';
  const eyeR = googly ? 17 : 5.5;

  const mouth = () => {
    if (mood === 'furious') return <rect x={36} y={70} width={28} height={12} rx={3} fill="#fff" stroke={C.ink} strokeWidth={3} />;
    if (mood === 'shocked') return <ellipse cx={50} cy={76} rx={8} ry={open ? 12 : 10} fill={C.ink} />;
    if (open) return <ellipse cx={50} cy={74} rx={9} ry={7} fill={C.ink} />;
    if (mood === 'grin' || mood === 'smile' || mood === 'smug')
      return (
        <path
          d={mood === 'grin' ? 'M34 68 Q50 90 66 68 Z' : 'M38 70 Q50 80 62 70'}
          fill={mood === 'grin' ? '#fff' : 'none'}
          stroke={C.ink}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      );
    if (mood === 'sad' || mood === 'worried') return <path d="M40 76 Q50 68 60 76" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />;
    return <line x1={42} y1={73} x2={58} y2={73} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />;
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      {[32, 68].map((cx, i) => {
        const side = i === 0 ? -1 : 1;
        return (
          <g key={cx}>
            {googly && <ellipse cx={cx} cy={eyeY} rx={eyeR} ry={blink ? 2 : eyeR * 1.15} fill="#fff" stroke={C.ink} strokeWidth={3} />}
            {!blink && <circle cx={cx + look * (googly ? 7 : 2.5)} cy={eyeY + (googly ? 3 : 0)} r={googly ? 7 : eyeR} fill={C.ink} />}
            {blink && !googly && <line x1={cx - 6} y1={eyeY} x2={cx + 6} y2={eyeY} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />}
            {mood !== 'neutral' && (
              <line
                x1={cx - 12}
                y1={eyeY - (googly ? 26 : 15)}
                x2={cx + 12}
                y2={eyeY - (googly ? 26 : 15)}
                stroke={C.ink}
                strokeWidth={googly ? 6 : 4}
                strokeLinecap="round"
                // positive brow = angry "V" (inner ends down), negative = worried (inner ends up)
                transform={`rotate(${-side * brow} ${cx} ${eyeY - (googly ? 26 : 15)})`}
              />
            )}
          </g>
        );
      })}
      {mouth()}
    </svg>
  );
};

/** Pick the mood active at this frame from a list of [frame, mood] changes. */
export const moodAt = (frame: number, moods: [number, Mood][], fallback: Mood = 'neutral'): Mood => {
  let m = fallback;
  for (const [f, mood] of moods) if (frame >= f) m = mood;
  return m;
};
```

### 7.20 `src/lib/character/Puppet.tsx`

```tsx
import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';
import { C, T } from '../constants';
import { clamp, ease, loop, popScale, ramp, wobble } from '../easing';
import { Face, moodAt, type Mood, type Talk } from './Face';

/**
 * Cut-out puppet built from ONE generated PNG (blank face, arms tucked in — see asset doc)
 * plus code-drawn face, noodle arms, hands and held props. Everything animates on 1s (60 fps).
 *
 * Coordinates: x,y = the character's FEET (bottom centre) in screen px; height = on-screen height.
 * Rig anchors are fractions of the image box (set once per character in RIGS below).
 */
export type Rig = {
  src: string;
  aspect: number; // image width / height
  face: { x: number; y: number; w: number }; // face centre + width as fractions of the box
  shoulderL: [number, number];
  shoulderR: [number, number];
  skin?: string;
};

export type ArmPose = { at: number; angle: number; reach: number; dur?: number }; // angle deg (0 = right, -90 = up)

export type HeldProp = {
  src: string;
  hand: 'L' | 'R';
  w: number; // px
  pivot: [number, number]; // fraction of the prop image where the hand grips
  angle: { at: number; deg: number; dur?: number }[]; // keyframes (musket: -80 shouldered → 0 aimed)
  recoilAt?: number[]; // frames where it kicks back (gun fire)
};

export const Puppet: React.FC<{
  rig: Rig;
  x: number;
  y: number;
  height: number;
  start?: number; // pops in at this frame
  flip?: boolean;
  moods?: [number, Mood][];
  look?: number;
  talk?: Talk;
  armL?: ArmPose[]; // omit = arm hidden (reference default)
  armR?: ArmPose[];
  handStyle?: 'skin' | 'glove';
  gloveSrc?: string; // white cartoon glove PNG (map characters)
  prop?: HeldProp;
  idle?: number; // idle bob amplitude px
  seed?: string;
  fallAt?: number; // tips over 90° (casualty) — ref f3697–3704 @30
}> = ({
  rig,
  x,
  y,
  height,
  start = 0,
  flip = false,
  moods = [],
  look = 0,
  talk = [],
  armL,
  armR,
  handStyle = 'skin',
  gloveSrc = '',
  prop,
  idle = 4,
  seed = 'p',
  fallAt,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const w = height * rig.aspect;
  const s = popScale(frame, start);
  const bob = wobble(seed, frame, idle, 0.06);
  const fall = fallAt !== undefined ? ramp(frame, fallAt, 12, ease.in) : 0;
  const mood = moodAt(frame, moods);

  const shoulder = (side: 'L' | 'R'): [number, number] => {
    const [fx, fy] = side === 'L' ? rig.shoulderL : rig.shoulderR;
    return [fx * w, fy * height];
  };
  const poseAt = (poses: ArmPose[]) => {
    let prev = poses[0];
    for (const p of poses) {
      if (frame >= p.at) prev = p;
    }
    const i = poses.indexOf(prev);
    const next = poses[i + 1];
    if (!next || frame < next.at) {
      const before = poses[i - 1];
      if (before && frame < prev.at + (prev.dur ?? 10)) {
        const t = ramp(frame, prev.at, prev.dur ?? 10, ease.out);
        return { angle: before.angle + (prev.angle - before.angle) * t, reach: before.reach + (prev.reach - before.reach) * t };
      }
    }
    return prev;
  };
  const armGeo = (side: 'L' | 'R', poses?: ArmPose[]) => {
    if (!poses?.length) return null;
    const [sx, sy] = shoulder(side);
    const { angle, reach } = poseAt(poses);
    const len = height * 0.42 * reach;
    const a = (angle * Math.PI) / 180;
    const hx = sx + Math.cos(a) * len;
    const hy = sy + Math.sin(a) * len;
    // noodle (rubber-hose) arm: quadratic curve with an elbow sag
    const mx = (sx + hx) / 2 - Math.sin(a) * len * 0.18;
    const my = (sy + hy) / 2 + Math.cos(a) * len * 0.18;
    return { d: `M ${sx} ${sy} Q ${mx} ${my} ${hx} ${hy}`, hx, hy, angle };
  };
  const arms = [armGeo('L', armL), armGeo('R', armR)].filter((g): g is NonNullable<typeof g> => g !== null);
  const hr = height * 0.05;
  const armPaths = arms.map((g, i) => (
    <path key={i} d={g.d} fill="none" stroke={C.ink} strokeWidth={height * 0.012} strokeLinecap="round" />
  ));
  const hands = arms.map((g, i) =>
    handStyle === 'glove' ? (
      <Img
        key={i}
        src={gloveSrc}
        style={{
          position: 'absolute',
          left: g.hx - hr * 1.6,
          top: g.hy - hr * 1.6,
          width: hr * 3.2,
          transform: `rotate(${g.angle}deg)`,
        }}
      />
    ) : (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: g.hx - hr * 0.55,
          top: g.hy - hr * 0.55,
          width: hr * 1.1,
          height: hr * 1.1,
          borderRadius: '50%',
          background: rig.skin ?? C.skin,
          border: `${height * 0.008}px solid ${C.ink}`,
        }}
      />
    ),
  );

  const propNode = () => {
    if (!prop) return null;
    const poses = prop.hand === 'L' ? armL : armR;
    const [sx, sy] = shoulder(prop.hand);
    const p = poses?.length ? poseAt(poses) : { angle: 60, reach: 0.6 };
    const len = height * 0.42 * p.reach;
    const a = (p.angle * Math.PI) / 180;
    const hx = sx + Math.cos(a) * len;
    const hy = sy + Math.sin(a) * len;
    // angle keyframes with overshoot (musket raise ref f2373–2380 @30)
    let deg = prop.angle[0].deg;
    for (let i = 1; i < prop.angle.length; i++) {
      const k = prop.angle[i];
      const prevDeg = prop.angle[i - 1].deg;
      if (frame >= k.at) {
        const t = interpolate(frame - k.at, [0, k.dur ?? T.musketRaise], [0, 1], { ...clamp, easing: ease.out });
        const over = Math.sin(Math.min(1, t) * Math.PI) * 4 * Math.sign(k.deg - prevDeg) * (t < 1 ? 1 : 0);
        deg = prevDeg + (k.deg - prevDeg) * t + over;
      }
    }
    const recoil = (prop.recoilAt ?? []).reduce((acc, r) => {
      const t = frame - r;
      return t >= 0 && t < 8 ? acc + (1 - t / 8) * 16 : acc;
    }, 0);
    const ph = prop.w * 0.25;
    return (
      <Img
        src={prop.src}
        style={{
          position: 'absolute',
          left: hx - prop.w * prop.pivot[0] - recoil,
          top: hy - ph * prop.pivot[1],
          width: prop.w,
          transformOrigin: `${prop.pivot[0] * 100}% ${prop.pivot[1] * 100}%`,
          transform: `rotate(${deg}deg)`,
        }}
      />
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - height + bob,
        width: w,
        height,
        transformOrigin: '50% 100%',
        transform: `scaleX(${flip ? -1 : 1}) scale(${s}) rotate(${fall * (flip ? -90 : 90)}deg)`,
      }}
    >
      <Img src={rig.src} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          left: rig.face.x * w - (rig.face.w * w) / 2,
          top: rig.face.y * height - (rig.face.w * w) / 2,
          transform: flip ? 'scaleX(-1)' : undefined,
        }}
      >
        <Face size={rig.face.w * w} mood={mood} look={flip ? -look : look} talk={talk} blinkSeed={seed.length} />
      </div>
      <svg width={w} height={height} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {armPaths}
      </svg>
      {hands}
      {propNode()}
    </div>
  );
};

/** A line of identical puppets with staggered timing (musket volley, crowds, armies). */
export const Squad: React.FC<{
  count: number;
  render: (i: number, offset: number) => React.ReactNode;
  stagger?: number;
}> = ({ count, render, stagger = T.musketOffset }) => <>{Array.from({ length: count }).map((_, i) => render(i, i * stagger))}</>;

/** Walk/hop gait for travelling chibis (ref Tea Party gangplank: ~10 f per hop @30). */
export const hop = (frame: number, start: number, period = 20, height = 18) =>
  frame < start ? 0 : -Math.abs(Math.sin(loop(frame - start, period) * Math.PI)) * height;
```

### 7.21 `src/lib/character/MapCharacter.tsx`

```tsx
import React, { useMemo } from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { geoEquirectangular, geoPath } from 'd3-geo';
import type { Feature, Geometry, MultiPolygon, Polygon } from 'geojson';
import { C, T } from '../constants';
import { ease, loop, popScale, ramp, wobble } from '../easing';
import { Face, moodAt, type Mood, type Talk } from './Face';
import { country } from '../map/data';

/**
 * Great Britain in 1763 = the island of Great Britain only (England, Wales, Scotland).
 * Natural Earth's "United Kingdom" also contains Northern Ireland (Ireland was a separate
 * kingdom until 1801), so we keep only the largest polygon.
 */
export const greatBritain1763 = (): Feature<Polygon> => {
  const uk = country('United Kingdom') as Feature<MultiPolygon | Polygon>;
  const polys = uk.geometry.type === 'MultiPolygon' ? uk.geometry.coordinates : [uk.geometry.coordinates];
  const area = (ring: number[][]) =>
    Math.abs(ring.reduce((s, [x, y], i) => { const [x2, y2] = ring[(i + 1) % ring.length]; return s + x * y2 - x2 * y; }, 0));
  const biggest = polys.slice().sort((a, b) => area(b[0]) - area(a[0]))[0];
  return { type: 'Feature', properties: { name: 'Great Britain' }, geometry: { type: 'Polygon', coordinates: biggest } };
};

/** Fit any feature into a w×h box and return its SVG path. */
const fitPath = (f: Feature<Geometry>, w: number, h: number) => {
  const proj = geoEquirectangular().fitSize([w, h], f as never);
  return geoPath(proj)(f as never) ?? '';
};

export type GloveKey = { at: number; pose: 'open' | 'point' | 'fist' | 'hold'; angle: number; reach: number };

/**
 * A country shape as a character (reference: red Britain with googly eyes, angry brows,
 * one noodle arm ending in a white cartoon glove).
 * Movement: travel keyframes in screen px (slides across the ocean, ref f650–668 @30),
 * idle squash-bob, rage shake when mood is 'furious' (ref f3160–3191 @30).
 */
export const MapCharacter: React.FC<{
  feature: Feature<Geometry>;
  color?: string;
  height: number; // on-screen height px
  path: { at: number; x: number; y: number; dur?: number }[]; // screen positions over time (centre)
  start?: number;
  moods?: [number, Mood][];
  look?: [number, number][]; // [frame, -1..1]
  talk?: Talk;
  glove?: GloveKey[];
  holding?: { src: string; w: number; from: number; to?: number }; // paper in glove
  face?: { x: number; y: number; w: number }; // fractions of the box (GB: upper-middle, over northern England)
}> = ({
  feature,
  color = C.britainRed,
  height,
  path,
  start = 0,
  moods = [],
  look = [],
  talk = [],
  glove = [],
  holding,
  face = { x: 0.62, y: 0.42, w: 0.55 },
}) => {
  const frame = useCurrentFrame();
  const w = height * 0.62;
  const d = useMemo(() => fitPath(feature, w, height), [feature, w, height]);
  if (frame < start) return null;

  // position along keyframes
  let x = path[0].x;
  let y = path[0].y;
  for (let i = 1; i < path.length; i++) {
    const k = path[i];
    const dur = k.dur ?? T.slideTravel;
    if (frame >= k.at) {
      const t = ramp(frame, k.at, dur, ease.inOut);
      x = path[i - 1].x + (k.x - path[i - 1].x) * t;
      y = path[i - 1].y + (k.y - path[i - 1].y) * t;
    }
  }
  const mood = moodAt(frame, moods);
  const lk = look.reduce((v, [f, l]) => (frame >= f ? l : v), 0);
  const s = popScale(frame, start);
  const rage = mood === 'furious' ? (loop(frame, 4) < 0.5 ? 3 : -3) : 0;
  const squash = 1 + Math.sin(frame / 14) * 0.012;

  // glove arm from the west coast (left side) toward the target angle
  const g = glove.reduce<GloveKey | null>((v, k) => (frame >= k.at ? k : v), null);
  const prev = g ? glove[glove.indexOf(g) - 1] : undefined;
  const t = g && prev ? ramp(frame, g.at, 8, ease.out) : 1;
  const angle = g ? (prev ? prev.angle + (g.angle - prev.angle) * t : g.angle) : 0;
  const reach = g ? (prev ? prev.reach + (g.reach - prev.reach) * t : g.reach * ramp(frame, g.at, 8, ease.out)) : 0;
  const sx = w * 0.18;
  const sy = height * 0.55;
  const len = height * 0.55 * reach;
  const a = (angle * Math.PI) / 180;
  const pump = g?.pose === 'point' ? Math.sin(loop(frame, T.gestureCycle) * Math.PI * 2) * 10 : 0;
  const hx = sx + Math.cos(a) * (len + pump);
  const hy = sy + Math.sin(a) * (len + pump);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2 + rage,
        top: y - height / 2 + wobble('mc', frame, 3, 0.05),
        width: w,
        height,
        transform: `scale(${s}) scaleY(${squash})`,
        transformOrigin: '50% 100%',
      }}
    >
      <svg width={w} height={height} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={d} fill={color} stroke={C.britainRedDark} strokeWidth={4} />
        {g && reach > 0.02 && (
          <path
            d={`M ${sx} ${sy} Q ${(sx + hx) / 2} ${(sy + hy) / 2 + len * 0.2} ${hx} ${hy}`}
            fill="none"
            stroke={C.ink}
            strokeWidth={height * 0.014}
            strokeLinecap="round"
          />
        )}
      </svg>
      {g && reach > 0.02 && (
        <Img
          src={staticFile(`assets/props/glove_${g.pose}.png`)}
          style={{
            position: 'absolute',
            left: hx - height * 0.09,
            top: hy - height * 0.09,
            width: height * 0.18,
            transform: `rotate(${angle + 180}deg) scaleY(-1)`,
          }}
        />
      )}
      {holding && frame >= holding.from && (holding.to === undefined || frame < holding.to) && (
        <Img
          src={holding.src}
          style={{
            position: 'absolute',
            left: hx - holding.w * 0.9,
            top: hy - holding.w * 0.7,
            width: holding.w,
            transform: `scale(${popScale(frame, holding.from)}) rotate(${-6 + Math.sin(frame / 18) * 2}deg)`,
          }}
        />
      )}
      <div style={{ position: 'absolute', left: face.x * w - (face.w * w) / 2, top: face.y * height - (face.w * w) / 2 }}>
        <Face size={face.w * w} mood={mood} look={lk} talk={talk} style="googly" />
      </div>
    </div>
  );
};
```

### 7.22 `src/lib/character/rigs.ts`

```ts
import { staticFile } from 'remotion';
import type { Rig } from './Puppet';

/**
 * Character registry. File names MUST match the asset doc (docs/ASSET_PROMPTS.md, section 3).
 * Every PNG: transparent background, character standing, FULL BODY, BLANK FACE (no eyes,
 * no mouth, no brows), arms tucked inside the coat. Canvas 2048×2048, feet touching the
 * bottom edge, body centred.
 * After generating, open each PNG once and fine-tune face/shoulder fractions if needed.
 */
const r = (file: string, over: Partial<Rig> = {}): Rig => ({
  src: staticFile(`assets/chars/${file}`),
  aspect: 1,
  face: { x: 0.5, y: 0.3, w: 0.26 },
  shoulderL: [0.36, 0.52],
  shoulderR: [0.64, 0.52],
  ...over,
});

export const RIGS = {
  colonist: r('colonist_brown_coat.png'),
  colonistBearded: r('colonist_bearded.png'),
  colonistYoung: r('colonist_young_waistcoat.png'),
  merchant: r('merchant_green_coat.png'),
  printer: r('printer_apron.png'),
  clerk: r('stamp_clerk.png'),
  judge: r('judge_white_wig.png', { face: { x: 0.5, y: 0.33, w: 0.22 } }),
  redcoat: r('redcoat_soldier.png', { face: { x: 0.5, y: 0.34, w: 0.24 } }),
  redcoatOfficer: r('redcoat_officer.png', { face: { x: 0.5, y: 0.34, w: 0.24 } }),
  militia: r('militia_minuteman.png', { face: { x: 0.5, y: 0.34, w: 0.24 } }),
  continental: r('continental_soldier.png', { face: { x: 0.5, y: 0.34, w: 0.24 } }),
  washingtonYoung: r('washington_1754_virginia_officer.png', { face: { x: 0.5, y: 0.31, w: 0.24 } }),
  washington: r('washington_1775_general.png', { face: { x: 0.5, y: 0.31, w: 0.24 } }),
  franklin: r('benjamin_franklin.png', { face: { x: 0.5, y: 0.32, w: 0.24 } }),
  jefferson: r('thomas_jefferson.png', { face: { x: 0.5, y: 0.31, w: 0.24 } }),
  johnAdams: r('john_adams.png', { face: { x: 0.5, y: 0.31, w: 0.24 } }),
  paulRevere: r('paul_revere.png'),
  paine: r('thomas_paine.png'),
  kingGeorge: r('king_george_iii.png', { face: { x: 0.5, y: 0.36, w: 0.22 } }),
  lordNorth: r('lord_north.png', { face: { x: 0.5, y: 0.32, w: 0.24 } }),
  attucks: r('crispus_attucks.png', { skin: '#8A5A3C' }),
  marthaJefferson: r('martha_jefferson.png'),
  patsyJefferson: r('patsy_jefferson_child.png', { face: { x: 0.5, y: 0.34, w: 0.3 } }),
  enslavedWorkerMan: r('enslaved_worker_man.png', { skin: '#6B4430' }),
  enslavedWorkerWoman: r('enslaved_worker_woman.png', { skin: '#7A4E36' }),
  teaPartyDisguised: r('tea_party_disguised_colonist.png'),
} satisfies Record<string, Rig>;
```

### 7.23 `src/vo/cues.ts`

```ts
import cuesJson from './cues.json';

/**
 * Typed access to the VO cue sheet (src/vo/cues.json, built by scripts/vo/build_cues.py from the
 * aligned ElevenLabs VO). Scenes NEVER hard-code timings: they ask for the frame of a phrase.
 *
 *   const c = scene('S11_massacre');
 *   <Sequence from={c.from} durationInFrames={c.duration}> … start={c.at('गोली चल गई')} …
 */
export type CueEvent = { phrase: string; action: string; frame: number; sec: number; wordIndex: number };
export type SceneCues = { id: string; title: string; style: string; from: number; to: number; events: CueEvent[] };

const data = cuesJson as { fps: number; totalFrames: number; scenes: SceneCues[] };
export const TOTAL_FRAMES = data.totalFrames;
export const SCENES = data.scenes;

export const scene = (id: string) => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return {
    ...s,
    duration: s.to - s.from,
    /** LOCAL frame (inside the scene's <Sequence>) of the cue whose phrase matches. */
    at: (phrase: string) => {
      const e = s.events.find((x) => x.phrase === phrase);
      if (!e) throw new Error(`Cue "${phrase}" not in ${id}`);
      return e.frame - s.from;
    },
  };
};
```

### 7.24 `src/scenes/Animatic.tsx`

```tsx
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { C, FONTS, H, W } from '../lib/constants';
import { SCENES } from '../vo/cues';

/**
 * Full-length ANIMATIC: the real VO + every scene on its exact frames + each cue flashing as it fires.
 * Use it to check sync in Remotion Studio before assets exist; real scenes replace each <Sequence> body.
 */
const SceneCard: React.FC<{ idx: number }> = ({ idx }) => {
  const s = SCENES[idx];
  const frame = useCurrentFrame(); // local to the scene
  const active = [...s.events].reverse().find((e) => frame >= e.frame - s.from);
  return (
    <AbsoluteFill style={{ background: idx % 2 ? '#1E2B33' : '#26343D', color: '#fff', padding: 160, fontFamily: FONTS.serif }}>
      <div style={{ fontSize: 70, color: C.dateYellow }}>{s.id}</div>
      <div style={{ fontSize: 120, fontWeight: 700, marginTop: 20 }}>{s.title}</div>
      <div style={{ fontSize: 56, opacity: 0.7, marginTop: 12 }}>{s.style}</div>
      {active && (
        <div style={{ position: 'absolute', left: 160, right: 160, bottom: 220 }}>
          <div style={{ fontFamily: FONTS.hindi, fontSize: 110, color: C.dateYellow }}>“{active.phrase}”</div>
          <div style={{ fontSize: 64, marginTop: 24, lineHeight: 1.25 }}>{active.action}</div>
        </div>
      )}
      <div style={{ position: 'absolute', right: 160, top: 160, fontSize: 60, opacity: 0.6 }}>
        f {s.from + frame} · {((s.from + frame) / 60).toFixed(2)} s
      </div>
    </AbsoluteFill>
  );
};

export const Animatic: React.FC = () => (
  <AbsoluteFill style={{ width: W, height: H }}>
    <Audio src={staticFile('assets/vo/vo_master.mp3')} />
    {SCENES.map((s, i) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from} name={s.id}>
        <SceneCard idx={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
```

### 7.25 `src/scenes/Demos.tsx`

```tsx
import React, { useMemo } from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { C, H, T, W } from '../lib/constants';
import { MapStage } from '../lib/map/MapStage';
import { ColonyFill, DrawLine, MapPin, NeonOutline, RegionEyes, colonyPath } from '../lib/map/layers';
import { COLONY_IDS, PLACES, PROCLAMATION_LINE, colonies } from '../lib/map/data';
import { centroidLonLat, pathGen } from '../lib/map/geo';
import { MapTitle, TimelineRuler } from '../lib/fx/text';
import { ArrowBob, PopIn, Shake, StampSlam, ZoomPunch } from '../lib/fx/motion';
import { Finish, Grade, ImpactPuff, MuzzleSmoke } from '../lib/fx/particles';
import { MapCharacter, greatBritain1763 } from '../lib/character/MapCharacter';
import { Puppet } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { Map3D } from '../lib/three/Map3D';

/**
 * DEMO 1 — the hook map beat: push-in, colonies fill N→S (white flash → blue), neon outline,
 * Boston pin, angry eyes cascade, the 1763 Proclamation Line draws on, timeline ruler.
 */
export const DemoMapHook: React.FC = () => {
  const allColonies = useMemo(() => pathGen(colonies as never) ?? '', []);
  const fillEnd = 30 + COLONY_IDS.length * T.fillPerState;
  const procD = useMemo(
    () => pathGen({ type: 'LineString', coordinates: PROCLAMATION_LINE } as never) ?? '',
    [],
  );
  return (
    <AbsoluteFill>
      <Grade>
        <MapStage
          style="parchment"
          camera={[
            { frame: 0, lon: -68, lat: 40, span: 62 },
            { frame: 70, lon: -77.5, lat: 37.2, span: 30 },
            { frame: 420, lon: -78, lat: 37, span: 27 },
          ]}
          world={
            <>
              <ColonyFill start={30} color={C.parchColony} flash="#E9F1FB" />
              <NeonOutline d={allColonies} start={fillEnd + 6} />
              <DrawLine d={procD} start={360} duration={70} color={C.stampRed} width={10} dash={34} />
            </>
          }
          overlay={
            <>
              <MapPin lon={PLACES.boston[0]} lat={PLACES.boston[1]} start={fillEnd + 40} label="Boston" date="March 5, 1770" />
              {COLONY_IDS.map((id, i) => {
                const [lon, lat] = centroidLonLat(colonies.features.find((f) => f.properties?.id === id)!);
                return <RegionEyes key={id} lon={lon} lat={lat} start={300 + i * T.stagger} size={44} mood="angry" look={i % 2 ? 1 : -1} />;
              })}
              <TimelineRuler
                x={W / 2}
                y={120}
                start={20}
                steps={[
                  { at: 20, labels: ['1775', '1776', '1777'] },
                  { at: 150, labels: ['1762', '1763', '1764'] },
                ]}
                exit={290}
              />
              <MapTitle x={W * 0.22} y={H * 0.82} text="Proclamation Line" date="7 October 1763" start={380} mode="type" size={120} align="left" />
            </>
          }
        />
      </Grade>
      <Finish />
    </AbsoluteFill>
  );
};

/**
 * DEMO 2 — Britain as a character: slides across the Atlantic, points with the glove,
 * pulls out the Sugar Act (pop + wobble), DEBT stamp slams, zoom-punch onto the paper.
 */
export const DemoBritain: React.FC = () => {
  const gb = useMemo(() => greatBritain1763(), []);
  return (
    <AbsoluteFill>
      <Shake hits={[70]}>
        <ZoomPunch start={290} to={2.6} focus={[1500, 980]}>
          <Grade>
            <MapStage
              style="parchment"
              camera={[
                { frame: 0, lon: -40, lat: 44, span: 80 },
                { frame: 330, lon: -42, lat: 44, span: 74 },
              ]}
              world={<ColonyFill start={0} per={0} color={C.parchColony} />}
              overlay={
                <>
                  <MapCharacter
                    feature={gb}
                    height={900}
                    start={10}
                    path={[
                      { at: 0, x: 3300, y: 900 },
                      { at: 100, x: 2100, y: 1000 },
                    ]}
                    moods={[[0, 'smug'], [70, 'shocked'], [100, 'smile'], [230, 'grin']]}
                    look={[[0, 0], [120, -1]]}
                    talk={[[130, 200]]}
                    glove={[
                      { at: 130, pose: 'point', angle: 190, reach: 0.9 },
                      { at: 220, pose: 'hold', angle: 200, reach: 0.7 },
                    ]}
                    holding={{ src: staticFile('assets/docs/doc_sugar_act_1764.png'), w: 340, from: 222 }}
                  />
                  <StampSlam
                    x={3000}
                    y={700}
                    w={900}
                    h={360}
                    start={40}
                    src={staticFile('assets/props/stamp_debt.png')}
                    exit={110}
                  />
                  <ArrowBob x={1000} y={700} w={420} h={210} rotate={150} start={150} src={staticFile('assets/icons/arrow_white_block.png')} exit={260} />
                </>
              }
            />
          </Grade>
        </ZoomPunch>
      </Shake>
      <Finish />
    </AbsoluteFill>
  );
};

/**
 * DEMO 3 — Boston Massacre volley: snowball hits the front soldier, muskets rise with an
 * 8-frame stagger, recoil + muzzle smoke, screen shake. Characters are cut-out puppets.
 */
export const DemoVolley: React.FC = () => {
  const soldiers = [0, 1, 2];
  const fire = 200;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#9AA3AD, #C9CED3 55%, #7D7F82)' }}>
      <Shake hits={[fire]} amp={22}>
        <Grade>
          <AbsoluteFill>
            {soldiers.map((i) => (
              <Puppet
                key={i}
                rig={RIGS.redcoat}
                x={1500 + i * 520}
                y={2050 - i * 40}
                height={1500 - i * 60}
                flip
                seed={`s${i}`}
                moods={[[0, 'neutral'], [70, i === 0 ? 'shocked' : 'neutral'], [110, 'angry']]}
                armR={[{ at: 0, angle: 80, reach: 0.55 }, { at: 120 + i * T.musketOffset, angle: 10, reach: 0.75, dur: T.musketRaise }]}
                prop={{
                  src: staticFile('assets/props/musket_brown_bess.png'),
                  hand: 'R',
                  w: 1100,
                  pivot: [0.72, 0.5],
                  angle: [
                    { at: 0, deg: -78 },
                    { at: 120 + i * T.musketOffset, deg: 0, dur: T.musketRaise },
                  ],
                  recoilAt: [fire + i * 2],
                }}
              />
            ))}
            {soldiers.map((i) => {
              // muzzle = hand position (mirrored right shoulder + arm) minus the musket length left of the grip
              const h = 1500 - i * 60;
              const left = 1500 + i * 520 - h / 2;
              const hand: [number, number] = [left + (1 - 0.64) * h - Math.cos((10 * Math.PI) / 180) * h * 0.42 * 0.75, 2050 - i * 40 - h + 0.52 * h + Math.sin((10 * Math.PI) / 180) * h * 0.42 * 0.75];
              return <MuzzleSmoke key={`m${i}`} x={hand[0] - 1100 * 0.72} y={hand[1]} start={fire + i * 2} size={260} />;
            })}
            <ImpactPuff x={1500} y={900} start={70} />
            <PopIn x={600} y={1500} w={900} h={900} start={20}>
              <Puppet rig={RIGS.colonist} x={450} y={900} height={900} talk={[[20, 60]]} moods={[[0, 'angry']]} seed="c" armR={[{ at: 20, angle: -60, reach: 0.8 }]} />
            </PopIn>
          </AbsoluteFill>
        </Grade>
      </Shake>
      <Finish />
    </AbsoluteFill>
  );
};

export const colonyD = colonyPath;

/**
 * DEMO 4 — REAL 3D map: colonies rise as extruded blocks with spring overshoot and shadows,
 * camera tilts from top-down into a dramatic oblique and slowly orbits.
 * Render: npx remotion render src/index.ts Demo-Map3D out/map3d.mp4 --gl=angle   (or --gl=swangle on CPU)
 */
export const DemoMap3D: React.FC = () => (
  <AbsoluteFill>
    <Grade>
      <Map3D
        width={W}
        heightPx={H}
        riseStart={30}
        camera={[
          { frame: 0, lon: -76, lat: 38.5, dist: 70, tilt: 0, yaw: 0 },
          { frame: 150, lon: -77, lat: 37.5, dist: 38, tilt: 42, yaw: -12 },
          { frame: 420, lon: -76.5, lat: 38.5, dist: 30, tilt: 50, yaw: 8 },
        ]}
      />
    </Grade>
    <AbsoluteFill>
      <MapTitle x={W / 2} y={H * 0.12} text="The Thirteen Colonies" date="1775" start={250} size={150} />
    </AbsoluteFill>
    <Finish />
  </AbsoluteFill>
);
```

### 7.26 `scripts/build_colonies.mjs`

```js
// Builds public/maps/*.json from public-domain data:
//  - us-atlas 3.0.1 (US Census Bureau cartographic boundaries 2017, public domain)
//  - world-atlas 2.0.2 (Natural Earth 1:10m / 1:50m, public domain)
// 1775 colonies = modern state outlines, with Maine merged into Massachusetts and
// West Virginia merged into Virginia (both were part of those colonies in 1775).
// Vermont is exported separately as a disputed territory (claimed by NY and NH).
// Western land claims (Kentucky, Tennessee, Ohio country) are intentionally NOT included.
import fs from 'node:fs';
import * as topo from 'topojson-client';
const [usPath, worldDir, out] = process.argv.slice(2);
const us = JSON.parse(fs.readFileSync(usPath, 'utf8'));
const colonies = [
  ['new-hampshire', 'New Hampshire', ['33']],
  ['massachusetts', 'Massachusetts', ['25', '23']],
  ['rhode-island', 'Rhode Island', ['44']],
  ['connecticut', 'Connecticut', ['09']],
  ['new-york', 'New York', ['36']],
  ['new-jersey', 'New Jersey', ['34']],
  ['pennsylvania', 'Pennsylvania', ['42']],
  ['delaware', 'Delaware', ['10']],
  ['maryland', 'Maryland', ['24']],
  ['virginia', 'Virginia', ['51', '54']],
  ['north-carolina', 'North Carolina', ['37']],
  ['south-carolina', 'South Carolina', ['45']],
  ['georgia', 'Georgia', ['13']],
];
const geoms = us.objects.states.geometries;
const features = colonies.map(([id, name, fips], order) => ({
  type: 'Feature',
  properties: { id, name, order }, // order = north→south, used for stagger
  geometry: topo.merge(us, geoms.filter((g) => fips.includes(String(g.id).padStart(2, '0')))),
}));
fs.writeFileSync(`${out}/colonies-1775.json`, JSON.stringify({ type: 'FeatureCollection', features }));
const vt = geoms.filter((g) => String(g.id) === '50');
fs.writeFileSync(`${out}/vermont-disputed.json`, JSON.stringify({ type: 'Feature', properties: { id: 'vermont', name: 'Vermont (disputed NY/NH)' }, geometry: topo.merge(us, vt) }));
// World land + countries (Natural Earth 50m is enough for 4K at continental zoom; 10m for close-ups)
for (const f of ['land-50m', 'countries-50m', 'land-10m', 'countries-10m']) {
  const w = JSON.parse(fs.readFileSync(`${worldDir}/${f}.json`, 'utf8'));
  const key = f.startsWith('land') ? 'land' : 'countries';
  fs.writeFileSync(`${out}/${f}.geo.json`, JSON.stringify(topo.feature(w, w.objects[key])));
}
console.log('ok', features.map((f) => f.properties.id).join(','));
```
