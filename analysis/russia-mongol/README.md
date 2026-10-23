# Micro-frame analysis — Russia & Mongol references

Two reference videos for the next (Russia) project, measured on **every frame** and inspected **shot by shot**.
They are studied for technique only: **no frame, image or audio from them is stored in this repo** (the videos and
contact sheets live in the session scratchpad; only measurements and text descriptions are committed).

| | **The Entire History of Russia in 45 minutes** | **The ENTIRE History of the Mongol Empire** |
| --- | --- | --- |
| File | 1280×720, 30 fps, H.264, AAC 44.1 kHz | 1920×1080, 24 fps, H.264, AAC 44.1 kHz |
| Length | 45:14.9 · **81,447 frames** | 32:19.2 · **46,539 frames** |
| Shots (hard cuts) | **458** · median 5.1 s · p10 2.6 s · p90 10.9 s · max 19.6 s | **244** · median 5.7 s · p10 1.8 s · p90 15.8 s · max 35.6 s |
| Camera moving (>0.3 px/f) | **48 %** of frames — a slow continuous push on 64 % of frames | **20 %** — 77 % of frames fully locked off |
| Local motion (after removing camera) | none on 28 % of frames | none on 69 % of frames |
| Pop-in events (static camera) | 427 detected · **eased**, ~6 f, 38 % overshoot ≈1.10× | 958 detected · mostly **1-frame snaps**, 24 % overshoot ≈1.15× |
| Loudness | **−16.0 LUFS**, LRA 3.0 LU, peak −0.9 dBFS, effectively mono | **−17.6 LUFS**, LRA 4.6 LU, peak −0.6 dBFS, light stereo |
| Voice vs bed | VO on 91 % of runtime · VO **+31 dB** over a near-silent bed | VO on 82 % · VO **+17 dB** over a real music bed |
| Palette | grey stage #C1C0BE 31 % of all pixels · 38 % near-grey pixels | grey stage #BFBFBE 24 % · warm tans/browns · 27 % near-grey |

Both videos come from the **same house style** (same handwritten font, same grey stage, same top-left year tag,
same stick-figure host idea, same scroll chapter cards). Russia is the tighter, map-and-explainer-led version;
Mongol leans harder into full cartoon scenes and dialogue skits.

Files in this folder:
- `README.md` — this synthesis: measured numbers, the device recipes, the style bible, what to copy.
- `russia-shots.md`, `mongol-shots.md` — **one block per shot** (458 + 244): type, background, every character
  (position %, size, facing, expression per frame), props, exact on-screen text, map details, camera, transition,
  animation beats with frame numbers.
- `russia-shots.csv`, `mongol-shots.csv` — measured per-shot numbers (net zoom, pan, held %, local motion,
  pop-ins, SFX hits, VO %).

Method: one streaming decode of every frame at 640×360 → Shi-Tomasi features + pyramidal Lucas-Kanade flow +
RANSAC partial-affine per frame pair (camera pan/zoom/rotation, reported in 720p pixels); camera-compensated
residual for local motion on a 6×10 grid; hard cuts from luminance jump + histogram decorrelation; pop-in curves
from the changed-area size per frame on static-camera stretches; punch-ins re-measured first→last frame with SIFT;
audio at one hop per video frame (VO from the 300–3400 Hz envelope, SFX from spectral onsets, EBU R128 loudness).
Contact sheets of every shot (4 frames each: start, ⅓, ⅔, end) were read one by one; key devices were then
stepped through at full frame rate. **Known gap:** no speech-recognition model could be downloaded (model hosts
are blocked here), so narration is aligned from the speech envelope, not word by word; "story beat" lines in the
shot files are inferred from the pictures.

---

## 1. The grammar of a shot

Both videos are built from the same four shot types, alternated roughly every 1–2 shots so the eye never tires:

1. **Grey explainer stage** — flat light grey (#C4C4C4–#C8C8C8). The stick-figure host stands at the far left
   (≈10–17 % x, ≈55 % frame height) facing right with one arm out; content pops in at 35–65 % x: rounded-corner
   photo/painting cards with a soft shadow, icons, counters, personified countries. Nearly static camera.
2. **Satellite map** — natural-colour relief base (deep-blue sea, green/tan land), **flat translucent territory
   fills (≈50–60 % opacity) with thin white/pale borders**, white handwritten labels, yellow teardrop city pins,
   the year tag top-left. The host appears large in the **bottom-right corner (≈87 % x, cropped at the waist)**
   facing left at the map. **Maps carry the strongest camera moves** (push +10 % … +230 %, occasional huge zooms
   +250–420 %, pull-outs −50 … −65 %).
3. **Cartoon scene** — flat cel colour, thick black outlines, round heads with dot eyes, stick legs on clothed
   bodies; one-point-perspective rooms and outdoor sets **reused and redressed** per era. Mostly locked off
   (held 85–100 %), small pose changes carry the beat.
4. **Real image** — paintings, engravings, archival photos. Full frame with a slow Ken-Burns push (+6 … +17 %),
   pillarbox filled with a **blurred, enlarged (often darkened) copy of the same image**; or as a card on the grey
   stage with the name written on its bottom edge.

**Inside a shot the beat is additive**: establishing frame → main element pops in → label writes on → a punchline
or twist element arrives (stamp, "?", sarcastic aside like "Subtle." / "uh-oh"). Russia averages **2–4 pop-in
beats per shot**; elements **pop or scale in, they almost never slide** (exceptions: walking/riding characters,
growing smoke/fire, routes drawing on).

---

## 2. Device recipes (measured frame by frame)

Frame counts are at the reference's own rate (Russia 30 fps, Mongol 24 fps). Our video renders at 60 fps — double
the Russia numbers.

### 2.1 Year tag + iris spotlight (iris: Russia ≈27×, Mongol ≈15×, median 1.4–1.6 s)
- Tag: small **dark-grey translucent rounded box**, top-left (≈2–8 % x, 4–9 % y), white handwritten year ("862",
  "1547", "December 1825"). Appears **a beat after the shot starts**, fade ≈4 f.
- Iris (on date changes and dark beats; detected as a ≥25 % dim with the top-left kept bright, recovering in 0.6–2.5 s): the frame dims from luminance 195 → **105 (×0.54)** over
  **≈10 f**, while a soft-edged light circle closes onto the tag (circle centre ≈ the tag, final radius ≈ 0.28 of
  frame height; inside the circle stays ≈0.88 brightness). **Hold ≈1.1 s**, then it reopens in **≈8 f**.
  Measured at f4866–4930 (862 AD).

### 2.2 Elastic pop-in (Russia default)
- Median curve of 255 clean pop-ins (changed-area size, 1.00 = settled), frames −2…+6:
  `0.12 0.21 0.43 0.61 0.87 0.94 0.97 0.98 0.99 → 1.00` — an ease-out reaching 94 % in ≈5 f (0.17 s).
- 38 % of pops overshoot; median peak **1.10×**. Stepped example (Viking ship, f5384–5407): dot at +5 → +6, +7,
  +8 growing → **peak ≈1.15× at +9** → settles by +13 (8 frames total, back-out).
- Cards pop with a slight **tilt (≈−5°)** and the same overshoot, then the caption types on (§2.4).

### 2.3 Snap pop / pose swap (Mongol default)
- Median of 685 clean events: **0 → 1.00 in a single frame** (no tween). Characters are puppet-held; pose and
  expression **swap** (arms down → finger up → arm out → shrug → point) every ≈1–2 s with lip-flap and blinks.
- 24 % still overshoot (median **1.15×**) — used for props/labels, not for character swaps.

### 2.4 Handwritten type-on
- One rounded handwritten-marker font for everything. Captions write on **letter by letter, ≈0.6–1 character
  per frame at 30 fps**; in the chapter titles each letter **drops in from slightly below** as it appears.
- Colour code: white (main, soft dark shadow/outline) · **yellow = punchline / emphasis** · **dark red/maroon =
  danger** ("fatal mistake", "SIEGE", "never forgot") · **green = positive** ("ORDER", "actually good?") ·
  **blue = names/places** · small dark grey = sub-caption.
- Dialogue is plain text above the speaker, **no speech bubble** (bubbles are rare exceptions); exchanges are
  3-beat jokes (setup / reply / deflating twist).

### 2.5 Chapter card (Russia 10 chapters, Mongol a "tech tree")
- Before: the host centres, **drops his spear flat**, hands on head; the chapter name types on in dark red.
- Hard cut to **dark brown (#3A2A20)**, closed scroll on two wooden rollers at centre (≈8 f) → **unrolls
  horizontally in ≈12 f** (ease-out) → parchment with **10 medallions on a snake path** (Rus · Mongols · Ivan ·
  Troubles · Peter / Catherine · 1812 · Last Tsar · Stalin · Today). Finished = **terracotta ≈#D07A4A**, the new
  node fills (+84 f) then **pops bigger** (+88 f) → "Chapter 4: The Time of Troubles" types on at the bottom
  (≈1 char/f) → hold → hard cut. **Whole card ≈77 f = 2.6 s.**
- Mongol version: ~16 brown medallions with black silhouette icons + year; each chapter **"unlocks"** the next icon
  (black silhouette → full colour) and a black dashed segment draws to it. ≈2–2.5 s static insert.

### 2.6 Recap timeline HUD (Russia ending)
- A dark rounded strip across the top (≈20–80 % x, ≈2–8 % y) with **5 date medallions: 862 · 1240 · 1613 · 1917 ·
  1999**, joined by a line; the **active node turns red**, past nodes terracotta, future nodes grey. Under it, one
  quick summary scene per era (Vikings/chaos → Mongols vs Moscow "TOTAL CONTROL" → Romanovs → Lenin & Stalin →
  "chaos of the 1990s" → Putin). Introduced by a scroll reading "The whole story".

### 2.7 Map routes and arrows
- **Russia:** thick white brush-stroke routes with a **red arrowhead** that **draw on over time**; route thickness
  = army size (it thins on Napoleon's retreat). Head icons ride the routes. Red translucent pincers = encirclement,
  red dashed circles = sieges, white dashed lines = borders/partitions, flame icons = scorched earth,
  skull-and-swords = destroyed army.
- **Mongol:** **red dotted routes** that spread across the empire west → east over **≈90 f (3.75 s)** while the
  camera pushes in; later turn green ("safe"). Black dashed = roads. Moving ruler-head tokens, motion-blur smears
  for invasions.
- Territory changes are **recolour/absorption** (a rival's fill flips to the conqueror's colour).

### 2.8 Map colours used
- **Russia:** Rus/Muscovy/Russia **red** (Ivan → Romanovs) → **green** from Peter → **gold** "Russian Empire" →
  olive-yellow ≈1900 → **USSR flat rust-red #9A3A2A–#D03A30**. Sweden blue, Poland pale white-grey, Ottomans red,
  Kazan green, Austria gold, Oprichnina black, Germany grey, Napoleon navy-grey, Whites off-white.
- **Mongol:** Mongols **lemon/lime yellow #E0E820 (#E2E51C/#F8D41E)** throughout (red only in the cold open), Jin
  purple-blue #4A30C0, Song/China dark red #9E2226, Khwarazm brown #B07A50, Ilkhanate turquoise #40E0C0, Yuan
  lilac-pink/brown, Europe mustard/red, Muslim world bright green.

### 2.9 Numbers, stamps, icons
- **Big numbers**: large outlined (often hollow) numerals + tiny handwritten unit, **counting up** across frames
  (2,998,673 → 3,000,000; $509M → $1B; "100 miles/Day"; "10X / 100X / 1000X").
- **Stamps**: tilted red rubber-stamp rectangles ("SOLD", "TOP SECRET", "RETURN TO SENDER") and boxed red words;
  red X strike-throughs; red crossed-out text replaced by new red text.
- **Verdict stamps** slam in beside the host to grade a claim: red "LEGEND?" / "EXAGGERATED?", green "TRUE STORY" — the channel's way of flagging myths before telling them.
- **The loop (Russia's thesis device):** a 5-node cycle diagram — Chaos → One man grabs control → Freedom traded for order → Pushes too far → Collapse → AGAIN — reused across the film with the current node highlighted and a rotating pointer; Russia also appears in a hamster wheel. The conclusion returns to it.
- Icon vocabulary: gold-framed portrait with **black mourning ribbon** (death) · lit candle → **snuffed candle
  with smoke wisp** (death) · poison goblet with skull · scroll with rods (laws) · **tear-off calendar with red
  header** (dates, time passing) · ORDER/CHAOS dial gauge · person-icon grids that turn grey (losses) · signposts ·
  **personified countries** (map silhouette + eyes + stick legs) for diplomacy gags.

### 2.10 Transitions (both: almost all hard cuts on narration beats)
- Iris/spotlight (2.1) · white/cream **flash frame** for explosions/lightning (1–4 frames, white runs at Mongol
  f16824, 31828…) · **blur-to-focus** reveal at shot start · **host interrupts**: the scene goes Gaussian-blurred
  and the host pops in large in the foreground · zoom-blur from map into scene · horizontal **whip-pan blur**
  between dialogue scenes (Mongol WHIP 6–9 f, ≈130 px/f) · desaturate-to-grey + blur for death/flashback ·
  VHS/RGB glitch frames (Mongol) · blood drip wipe (Mongol, once) · cloud fly-through cold open (Mongol f0–30) ·
  **split screen** with a thin divider (map | scene, "letters vs reality").
- **Punch-ins are rare**: Russia +21…+30 % in 8–10 f; Mongol +39…+71 % in 7–11 f (median 1.55×).

---

## 3. Camera

| | Russia | Mongol |
| --- | --- | --- |
| Constant drift | **slow push-in on 64 % of frames, median 0.035 %/f = 1.06 %/s**, slight up-left pan; per-shot net zoom median **+5.2 %** (52 % of shots push in >5 %) | only 14 % of frames drift; when they do, 0.078 %/f = 1.9 %/s; per-shot net zoom median 0 % |
| Phase budget (frames) | HOLD 41,606 · drift 29,668 · pan 5,846 · push-in 2,730 · pull-out 1,271 · PUNCH-IN 163 · pan-fast 113 · PUNCH-OUT 33 · WHIP 17 | HOLD 37,651 · drift 3,072 · pan 2,474 · push-in 1,564 · pull-out 1,260 · pan-fast 398 · PUNCH-IN 55 · PUNCH-OUT 52 · WHIP 13 |
| Typical per-frame move | median \|tx\| 0.14 px/f, p99 19.7 px/f | median 0.00 px/f, p99 27.9 px/f |
| Rotation | essentially none (959 frames > 0.15°, all at cuts/effects) | essentially none |

Rule of thumb: **grey stage and cartoon scenes hold; maps move; Russia never lets a frame sit perfectly still.**

---

## 4. Sound

- **Russia:** narration-first. VO on 91 % of runtime (687 phrases, median 2.27 s); **VO +31.2 dB over the bed**
  (bed −54.7 dBFS, VO −23.5 dBFS median); the music bed is barely there and drops a further ~15 dB under speech.
  2,229 SFX transients, almost all short **high-frequency ticks/pops** (+24 dB lift in the >6 kHz band, only
  +4 dB full-band) — they sparkle without masking the voice.
- **Mongol:** VO on 82 % (761 phrases, median 1.33 s — choppier, dialogue-driven); **VO +17 dB over a real music
  bed** (bed −39.9 dBFS); 1,567 SFX hits, **184 of them placed in VO gaps** (skit sound effects, whooshes,
  stingers).
- **Sync:** when a visual pop has a sound, the SFX lands **on the same frame** (median offset 0 f, mean −0.2 f:
  if anything the sound leads by a hair). ~26–29 % of pops get a sound within ±4 f; the rest are silent.

---

## 5. Characters & look (style bible)

- **Host:** stick figure, round head (white/peach) with dot eyes, line mouth that **toggles closed smile ↔ open "o"
  about every 2 frames** while talking, occasional blinks. Russia: golden conical straw hat with red tassel, red
  scarf-tie, beige shorts, tall spear with red tassel. Mongol: brown fur-brim hat / fedora with red feather, tan
  tunic or sash, spear. Gesture set: arm out toward content, index finger up, open palm, two-arm shrug, point,
  hand on chin, **spear dropped flat = chapter break**. Reactions carry the jokes (smile → "O" shock on the reveal →
  eyes closed / grimace).
- **Cast:** flat cel colour, thick black outline, big round heads, dot eyes, simple brows, stick legs under clothed
  bodies, chibi proportions (≈25–35 % frame height in scenes). **Rulers are identified by one or two props** (crown
  with cross, tricorn, bicorne, moustache, bald + goatee, birthmark…) and **keep the same outfit every time they
  reappear**. Group types by uniform colour (red streltsy, black oprichniki, olive Soviets, blue NKVD caps…).
- **Sets:** a small library redressed per era — one-point-perspective room (beige walls, beams, honey floor; drape
  colour changes the era), Kremlin red wall with domes + snow, palace facade, village with log cabin and birch,
  night scene (navy sky #1E2238, white moon, stars), steppe (sky #3D9FE2→#BFE3F7, flat white clouds, yellow-green
  grass #B9C96A, cream gers).
- **Palette:** grey stage #C4C4C4; beige interiors #E8DCC8/#D8CCB0, wood #8B5A2B/#6A4430; Kremlin red #C0453A;
  Soviet red #C83A30; olive #5A6A40; navy #1A2A4A; sky #C9DAEA; accents gold, terracotta, mustard, red, green.
- **Humour layer:** sarcastic on-screen asides, anachronistic gags (SUBSCRIBE button, job-ad posters, loading
  bars, "corner shop" tsar), legends flagged with "the story goes…" before the joke, heroic version vs "small and
  messy" version.
- **Ending (Russia):** teaser for the next topic, then a light-grey end screen "Next: …" with two thumbnail slots and
  the host on the right.

---

## 6. How this compares with our America build (and what to change for Russia)

| Topic | America reference / our build | Russia & Mongol references | For the Russia video |
| --- | --- | --- | --- |
| Host | none — characters only | a **stick-figure host on every explainer beat** | add a host rig (Hinglish narrator persona), mouth toggle every 2 f @30 = every 4 f @60 |
| Background between scenes | maps + full scenes | **flat grey stage** as palette cleanser every 2–4 shots | add a `GreyStage` scene type |
| Dates | DateCard component | **top-left year tag + iris dim** | add `YearTag` + `IrisSpot` (dim ×0.54 in 10 f @30, hold, reopen 8 f) |
| Pop-in | our PopIn with overshoot | eased ≈6 f @30, overshoot 1.10× (38 %) | keep; tune to 12 f @60, peak 1.10–1.15× |
| Chapters | none | **scroll unroll + medallion path** | add `ChapterScroll` (10 nodes) |
| Recap | none | **top timeline HUD** with red active node | add `TimelineHUD` for the ending |
| Map fills | parchment/relief looks | **satellite relief + translucent flat fills + white borders** | our Map3D satellite look + 50–60 % fills fits |
| Routes | arrows | white brush routes + red arrowhead (Russia), red dotted networks (Mongol) | add `BrushRoute` with width = army size |
| Camera | constant moves | Russia: continuous slow push ≈1 %/s | add a global slow push on every shot |
| Mix | VO ≥11 dB over SFX | VO +31 dB over bed; SFX = HF ticks | quieter bed, short bright SFX on pops |
| Text | Hindi display fonts | **one handwritten font**, colour-coded, type-on | pick one handwritten Devanagari+Latin font (e.g. Kalam) for everything |

The full per-shot inventories in `russia-shots.md` and `mongol-shots.md` are the source for building the scene list,
the prop/icon asset list and the character list for the Russia video.
