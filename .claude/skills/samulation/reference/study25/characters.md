# Characters and acting: 25 reference shorts measured, with rules for our cards

Private study. Scripts, crops and data are in `/root/proj/refs/work/characters/` (`scripts/heads.py`, `hstats.py`, `static.py`, `statan.py`, `strip.py`, `track.py`; `data/heads_NN.json`, `data/static_NN.json`; strips in `fr/`).
Units:
- **W** = head width.
- **HH** = head height.
- **px** = pixels at 1080×1920.
- **f** = frames at 30 fps.

## 0. Method and coverage

| measurement | sample |
|---|---|
| Automatic head detector: white blob, ink ring, eye/mouth holes, ellipse fill; 48 rays per head give outline thickness and ink core colour | 1 fps × 25 videos = 1,416 frames → **712 heads** kept after filtering; 268 "big" heads (W ≥ 240 px); 44 bare big heads used for directional outline |
| Camera-static windows (from `measure/*.json`: \|dx\|,\|dy\| < 0.15, \|zoom\| < 0.0008, ≥ 15 f). Per-frame 16 px block max \|diff\| with captions masked, giving the pose-change timeline | **115 windows, 4,300 frames**, all 25 videos except 08 and 12 (those have no static windows) |
| Frame-by-frame strips at 30 fps | walk (02 @ 4.6–7.6 s), lip-sync (20 @ 8.0–8.8 s), shock (18 @ 30–32 s), fear/run (04 @ 4–6 s), stomp (23 @ 22–24 s), crank (23 @ 0–2 s), turn-around (20 @ 8.6–9.0 s) |
| Full-body gridded crops | 05 @ 2.5, 14 @ 5, 23 @ 0.5, 23 @ 43, 07 @ 14.5, 12 @ 15 |
| Contact-sheet survey | all 25 overview sheets (`work/characters/ov/`, 1 tile per second) plus about 15 full 30 fps sheets |

## 1. Design (measured)

### 1.1 Heads

| param | value | n / note |
|---|---|---|
| head shape | **circle**. H/W of visible white **0.96** (IQR 0.91–1.00) on bare heads | 242 |
| top of head covered by hair or hat | **66 %** of heads (visible-white H/W < 0.85; median visible 0.79) | 712. Hair or hat covers the top **20–35 %** of the circle and follows the skull curve |
| head fill | near-white **#f4f0ee … #fffcfa** in bright scenes. Centre-band median rgb (212,205,202) = **#d4cdca**, which includes eye pixels. Rare skin tones: peach #f6d2b0 (18), #f2e0c8 (02) | 490 |
| head size on screen | median **17.8 % of frame width** (p10 4.8 %, p90 36 %). Close-ups reach 50–80 % (02, 20, 25) | 712 |
| heads per frame (when ≥1 is visible) | 1: 63 %, 2: 25 %, 3: 9 %, ≥4: 3 % (crowds are mostly too small to detect) | 453 frames |
| frames with a readable face | ≥ **32 %** of all seconds (lower bound: hatted, back-facing and tiny heads are missed) | |

### 1.2 Ink

- **Head outline:** median **7.5 % W** on all big heads (this includes blur). On bare heads by direction:
  - top 4.9 %, upper-right **3.5 %** (thinnest), upper-left 5.0 %, left 4.6 %, right 6.3 %;
  - the line is thicker on the lower and shadow side;
  - the thick/thin ratio around one head is about 1.5–2.5. My p90/p10 figure is inflated by hat and torso joins, so treat it as an estimate.
- **Outline in px:** 6 / 8 / **14** / 24 / 38 px (p10 / 25 / 50 / 75 / 90). The line gets *relatively thinner* on big heads: about **3–4 % W** at W ≈ 380 px (23 @ 43 s), because the line is roughly constant in screen space at 10–14 px.
- **Ink core colour:** median rgb **(34, 22, 30) = #22161e**, a dark plum (IQR #170910 … #302029). It is never pure black.
- **Line weights inside the drawing:** torso outline ≈ 0.75× the head line. Brows are thick, tapered wedges ≈ 0.045 W. Mouth line ≈ 0.025 W.

### 1.3 Bodies (gridded crops; ±5 px)

| figure | W px | total HH | torso w / W | torso len (HH) | legs (HH) | limb stroke / W | hand | foot |
|---|---|---|---|---|---|---|---|---|
| pirate 05 @ 2.5 | 215 | **3.2** | 0.58 | 0.95 | 1.29 | 0.045 | ink dot ≈ 0.08 W | stroke 0.16 W |
| drill man 23 @ 0.5 | 330 | ≈ 3.3 (crop) | 0.80 | 1.0 | 1.3 | 0.05 | ink ball **0.10 W** | — |
| seated old man 14 @ 5 | 130 | sitting | 0.73 | 0.9 | — | 0.05 | dot 0.11 W | — |
| king 07 @ 14.5 | 160 | robe | 0.7 | robe to the ground | — | 0.045 | dot | — |

Body rules:
- **Torso** is a vertical capsule ("bean") that is widest low. It has *no neck*: the head overlaps the top of the torso by ≈ 0.1 HH.
- **Clothing detail** is drawn as flat patterns: stripes, quilting, dot rivets, a belt, a lanyard.
- **Torso shading** is a soft gradient. The shadow side is ×0.6–0.7, sometimes with a light rim.
- **Arms and legs** are single plum strokes ≈ 0.045–0.05 W, with soft knees and elbows (curved, not jointed).
- **Feet** are short flat strokes (0.15–0.2 W) pointing outward in front view.
- **Hands** are plum dots ≈ 0.08–0.11 W, with no fingers.
- **When a hand grips a prop**, the dot sits *on* the handle and the prop is drawn in front of it, or the dot sits on top of the prop. Examples: the drill crank (23), the mug (05), the door handle (02).

### 1.4 Face library (measured on 23 @ 43, 12 @ 15, 20 @ 8, 18 @ 30, 04 @ 4; ÷ W, y from head centre)

| feature | value |
|---|---|
| eye spacing (centre to centre) | **0.25 W** |
| eye height | −0.04 W |
| default eye | **lidded half-disc**: a lid line 0.12 W plus a dark half-disc below it. Gives a deadpan look; this is the most common eye |
| other eyes | closed dash (0.12 × 0.02); happy ∩ arcs; **shock**: white circles 0.16–0.2 W with a ring 0.02 W and pupil dot 0.04 W, almost touching; squint `> <`; spirals rare |
| brows | tapered wedges **0.17 × 0.045 W at y −0.20 W**. Angry = V shape; worried = inner end up; one brow raised = skeptical |
| mouth | at **y +0.14 … +0.19 W**, x shifted toward the facing side by ≈ 0.05 W |
| neutral mouth | small dark oval or dash 0.06–0.1 W |
| talk / shout mouth | open D 0.25–0.35 W with an upper teeth band and a pink tongue (#e86e78) |
| grin | teeth box with dividers |
| frown | arc |
| extras | sweat drop (light blue, beside the temple) on fear. Blush **in 4 of 25 videos** (12 captain, 21 pink-faced cast); none elsewhere. **No catchlights** anywhere. Moustache or beard drawn as a fill over the mouth area |
| side view and turn | features slide to the facing side. **Back view = whole head filled with the hair colour** (20 @ 8.8 s) |

## 2. Animation (measured)

### 2.1 Frame rate and holds

- **On ones, not twos.** In the static-camera windows, pose changes run continuously frame after frame. Moves (consecutive changed frames, ≥ 3) last **3 / 5 / 8 / 12 f** (p25 / 50 / 75 / 90).
- Alternating `#.#.` patterns (the signature of twos) are rare: they occur in about 10 % of windows, and mostly in squash or emanata effects.
- The walk (02 @ 5.3 s) changes leg pose on **every frame**.
- **Holds** between moves inside a beat last **4 / 7 / 12 / 15 f** (p25 / 50 / 75 / 90).
- Long holds of more than 20 f make up 23 of the 359 hold runs.
- **Fraction of frames with visible character motion** per static window: median **0.27** (IQR 0.10–0.44). So in roughly three-quarters of the time the character is *holding a pose* while the camera does the moving.

### 2.2 Mouth and lip sync

- Mouths move only when the character "owns" the line (quoted speech such as "…", or "cheese?"). During plain narration, faces hold a fixed expression; the mouth is shaped as "o", a smirk or a dash.
- Lip sync **morphs per frame** between three shapes: closed, mid with teeth band, and wide with tongue.
- Each open/close cycle lasts **4–6 f**.
- The mouth closes **3–4 f after the last word ends** (20: "life," ends 8.30 s, mouth closed by frame 12 = 8.40 s).

### 2.3 Expressions and blinks

- **Expression change:** brows and mouth morph over **4 f**. A **blink** is attached to almost every expression change:
  - eyes go to a closed dash for **1–2 f**, then a half-lid for 1 f, then the new eyes;
  - so a blink is 3 f in total.
- **Idle blinks** in long holds come roughly every 2–4 s; I saw only a few clean examples.

### 2.4 Timing of reactions against the VO word onset

| reaction | timing |
|---|---|
| anticipation: squint or blink | **−3 … 0 f** (just before the word) |
| reaction pose hits | **0 … +4 f** after the word onset |
| sweat drop | appears 1–2 f after the shock eyes |

Examples:
- **Shock (18):** "jumps" at 30.90 s. Squint in f 27–29, shock eyes at f 30 (31.0 s, +3 f). On "out" at 31.22 s there is a blink at +5 f, then the eyes open *wider* and hold.
- **Fear/run (04):** "run!" at 4.84 s. Shock eyes and sweat drop arrive first (on "out,"). Blink/squint at f 24–26. Then the arm whips up within 4 f, and the camera does a whip with radial speed lines at +2…+5 f.
- **Anger (23):** "nobody's" at 22.74 s. Squint and V brows within +3…+10 f while the character stomps toward the camera.

### 2.5 Walks, turns and other motion

- **Walk (02):**
  - leg pose changes every frame; one step ≈ **8 f** (cycle ≈ 16 f = 0.53 s);
  - legs are curved strokes with a soft knee; the passing pose crosses the legs;
  - the contact foot is flat;
  - the moving foot gets **motion smear / ghosting** (2–3 faint copies) at fast steps (02 @ 6.4 s, f 0–3);
  - the camera tracks the walkers, so the screen-space bob is small (about 2–3 % of body height);
  - torso lean is about 3–5° forward.
- **Turn-around (20 @ 8.6 s):** 3 f in total. Front → 3/4 (features slide 0.15 W toward the edge, hair grows over the side) → back (hair-coloured head). The character then walks into depth, and the card shrinks because it is really moving away in 3D.
- **Prop use (23 crank):**
  - two hands on the prop: one dot on the crank knob, which circles about 1 rev / 10 f, the other on the drill body;
  - the body leans 15° into the work;
  - the head holds still with an "o" mouth.
- **Door (02):** the arm extends to the handle over 6 f on the word, the hand dot sits on the handle, then the door opens over 10 f.
- **Idle:** in the 73 % of frames with no motion, nothing moves on the card at all. No breathing loop was measurable (block diff below the noise floor). Life comes from the camera drift and from blinks or expression swaps.

### 2.6 Reactions, emanata and big poses

- Shock eyes with a sweat drop.
- Hats and helmets **pop off and spin** on an impact (23 @ 25.7 s "slaps": 6 helmets fly up and fall over about 40 f).
- Radial speed lines on panic (04).
- Bodies can be drawn lying down: a horizontal card on a cart (23 @ 38).
- Characters fall or slide out of frame on "fell".

## 3. 2D cards in the 3D world

| property | finding |
|---|---|
| facing | cards always face the camera (billboards). For a turn they swap to a 3/4 or back drawing; the card never rotates to go edge-on |
| scale | heads range from 5 % to 80 % of frame width. Adult figures are ≈ 1.7–1.8 m against world props (cart wheel ≈ hip height, door ≈ 1.25× figure height) |
| depth of field | foreground cards are **blurred** when they are out of focus (14 @ 5 s foreground man). Background crowds are softened |
| occlusion | world props occlude cards: counters, barrels, cart rails, grass blades in front of legs (23), desks (02). Cards stand *in* grass, which hides the feet |
| world shadows on cards | world shadows fall across cards (23 wall shadow darkens part of the crowd). Cards also cast real shadows on the ground (07 long sunset shadows, 23) |
| light response | face luma is almost **independent of scene brightness**: corr(face luma, scene luma) = **0.04**. Faces hold 0.76 in dark scenes and 0.82 in bright ones (median centre band). Faces are near self-lit with a mild key-colour tint (b/r 0.95–0.96). Under a strong time-of-day grade (07 day→dusk→night) the cards take the full grade (pink, then violet) together with the world |

## 4. Secondary characters, crowds and armies

| tier | count on screen | how it is built |
|---|---|---|
| hero plus 1–3 partners | 2–4, 0.6–1.0× hero scale | each is unique: costume colour, hat, facial hair. They react individually |
| crowd (court, soldiers, office) | **5–10 visible** | Every figure has a unique costume and colour, and figures overlap in 2–3 depth rows. They react on events with eye swaps (lidded → shock circles), a few head turns, and helmets popping. Reactions are **staggered by 2–6 f**; most of the crowd holds still |
| army line (07) | 20–40 in one row | **identical repeated card** (same face, shield, pose), tinted by faction (teal vs red). Lined up in depth so they overlap ~40 %; they do not animate |
| mass army (07 top-down, 18 card sea) | 500–5,000+ | tiny instanced sprites in arrow or block formations, coloured by faction, read as texture. Motion is the whole block sliding |

## 5. Rules for our stack (`toon.ts` / `cast.ts`)

### 5.1 Drawing (toon.ts)

**Head**
- Head is a near-circle: `b/a = 0.96 ± 0.03` in `headBlob`.
- Fill `#fbf8f5`, with the soft lavender crescent from the bridge report (`SH_WHITE`).
- **The mascot's Flame Spikes hair covers the top 30 % of the head** and spikes out by 0.25 W.
  - Colour: ginger **#e0782a**, shadow #b4561c, spike tips #f29a45.
  - The hair takes the same ink ring as the head.
  - Back view = the whole head filled with hair.

**Ink**
- `INK = "#22161e"`, which matches the measurement (the bridge value #241726 is close enough).
- Head outline = `max(10 px on screen, 0.045 W)`, with ±35 % variation by angle: thinnest at the upper-right, thickest at the lower and shadow side.
- Since cards are textures, compute it as `0.045 W` but clamp to ≥ 4 px at render scale.

**Body** (3.2–3.4 HH; the bridge `adult` build at 3.5 is OK)
- Bean torso 0.6–0.8 W.
- Limb strokes **0.045 W** in INK.
- Hand dots r = 0.045 W, in INK.
- Feet are strokes 0.16 W long.
- **Mascot torso:** hoodie or jacket in a solid colour, plus a gold chain.
  - Chain: a 0.025 W stroke #d9a521 (shadow #9c7212) hanging from both sides of the neck overlap.
  - Pendant: a 0.18 W plate with an embossed "S", gold #f2c23a with a #fff3b0 highlight and an ink ring 0.6× the outline.
  - Place it at the torso centre, 0.35 HH below the chin.

**Face library**
- Default to the lidded half-disc eye; spacing 0.25 W.
- Brows 0.17 × 0.045 W at y −0.2 W.
- Mouth at y +0.16 W, shifted 0.05 W toward the facing side.
- Add **talk mouths** (`talkA` closed, `talkB` mid with teeth band, `talkC` wide with tongue) and **shock** (ringed circles 0.18 W with 0.04 W pupils).
- No blush on the mascot. Never draw catchlights.

### 5.2 Animation (cast.ts / story.ts)

**Motion and holds**
- Animate on **ones**. Poses are keyed, and a move between keys lasts **5 f** (range 3–8). Use ease-in-out with a 1–2 f overshoot on arms and head.
- Hold a key for **7 f or more** (4–15 f). Keep the card *completely still* during holds: no breathing loop. The camera keeps the shot alive.
- Budget about **27 % moving / 73 % holding** per shot.

**Texture cost**
- Card textures re-render only on a pose or expression change, about every 7–12 f. This keeps the Canvas2D cost modest.
- Cache by `fkey()`. Walk and lip-sync are the only per-frame redraws: use 8 walk drawings and 3 mouth drawings, cached.

**Word sync**
- For every action verb in the VO, put the **pose key at the word onset + 0…4 f**, and the anticipation (squint, blink or wind-up) at **−3 f**.
- Expression swaps happen through a **3 f blink**: closed for 2 f, half for 1 f.
- Add an idle blink every 2.5–4 s (seeded jitter ±0.7 s) in holds longer than 2 s.

**Lip sync**
- Only on lines the character speaks (quotes).
- Cycle closed → mid → wide → mid in 4–6 f, driven by word timing: open on the word onset, close within 3 f after the word ends.
- Narration-only shots: keep a fixed mouth.

**Walk**
- Step 8 f (cycle 16 f).
- Curved-stroke legs, pass pose at mid-step.
- Body bob 2.5 % of height, lean 4°.
- Add 2 smear copies of the swinging foot at 30 % alpha when the foot moves more than 0.3 W per frame.

**Turn**
- 3 f: front → 3/4 → back drawing, with no card rotation.

**Props**
- The hand dot is placed exactly on the grip point, which comes from the prop's 3D transform projected into card space.
- Two-handed props get two dots.
- The prop renders as a separate 3D mesh in front of the card (`renderOrder` +1).

### 5.3 Cards in the scene

- Cards are camera-facing billboards. They receive world shadows (shadow-receiving card material) and cast a ground shadow, plus a contact blob 0.5 W × 0.06 W at alpha 0.3.
- Grass and props occlude them naturally: do not draw cards with `depthTest = false`.
- **Lighting:** keep faces at about 0.9 of design luma in every scene, e.g. `emissive = 0.75 × map`, lit = 0.25. Multiply by the key-light colour at 15–25 %; for dusk/night grades let the global grade tint everything.
- **Defocus:** apply the lens blur to foreground cards too.

### 5.4 Crowds and armies

**Mid crowd** (5–10 figures)
- Every figure is unique: seeded outfit from 8 colours, hat or hair from 6, facial hair on 25 %.
- Place them in 2–3 depth rows with 30–40 % overlap.
- On an event, swap to the shock face and/or turn the head, with a stagger of **rand(0, 6) f** per figure. 30 % of them do a bigger move: a helmet pops off with an arc of about 40 f, or an arm goes up.

**Army line**
- One cached card instanced 20–40×, tinted by faction: our side gold/ginger accent, the enemy a cold teal or red.
- Static, apart from a whole-row advance with a per-figure bob phase offset (0.5 W bob, 16 f cycle) when marching.

**Mass**
- InstancedMesh of 8×12 px sprites in formation blocks.
- Animate by moving the block, plus a per-instance jitter of ±1 px at 8 f.

## 6. Comparison with the bridge study (`cartoon-3d-short/references/reports/characters.md`)

**Agrees**
- Head H/W ≈ 0.93–0.96.
- Ink ≈ 5 % W, plum (#201628–#2f1d28 there, **#22161e** here).
- Limbs are single strokes ≈ 0.05 W, hands are ink dots ≈ 0.1 W, feet are short strokes.
- Eye spacing ≈ 0.26 (0.25 here); the lidded half-disc is the default eye.
- Brows at −0.20 W.
- No catchlights.

**Disagrees or adds**
- **Blush:** the bridge study found 0 cases. Here it appears in 4 of 25 videos; it is a per-character trait, not banned.
- **Heads are almost always white**, not skin-toned. 66 % carry hair or a hat over the top 20–35 %.
- **Face brightness does not follow scene light** (corr 0.04). This supports the bridge report's "raise emissive" suggestion, and goes further.
- **Body height:** 3.2–3.4 HH here vs 3.5 there. Use 3.3.
- The bridge study had no animation timing. This one adds ones vs twos, moves 5 f, holds 7 f, 73 % hold time, word-onset +0…4 f, 3 f blink on expression change, lip-sync only on quoted lines, walk step 8 f, 3 f turn.

## 7. Top rules ranked by impact

1. **Key every action to its VO word:** pose at onset + 0…4 f, with a 3 f anticipation (squint, blink or wind-up) before it. The last attempt failed on exactly this.
2. **Hold, then snap:** about 73 % of the time the card holds a pose completely still (median hold 7 f, long holds up to 15+ f). Moves last 5 f on ones with ease and overshoot. The camera provides continuous life.
3. **Expression swaps through a 3 f blink.** Shock = ringed white circles plus a sweat drop. Talk mouths only on the character's own quoted lines, cycling every 4–6 f.
4. **Crowds of 5–10 unique figures with staggered (0–6 f) reactions.** Armies are identical tinted repeats in overlapping depth rows, and masses are instanced sprites. This fixes the "weak enemy crowd".
5. **Cards live in the world:** world shadows fall on them, they cast ground shadows plus a contact blob, they are occluded by grass and props, and foreground cards get DOF blur. Faces stay at about 0.9 luma regardless of scene darkness.
6. **Design constants:** circle head (H/W 0.96), plum ink #22161e at ≈ 0.045 W (≥ 10 px on screen), limbs 0.045 W, hand dots 0.1 W, eye spacing 0.25 W. The hair or hat cap covers the top 30 %, so the mascot's Flame Spikes go there.
7. **Props:** hand dots sit exactly on the projected grip points; two-handed props get two dots; the body leans 10–15° into the work.
8. **Walk 8 f per step, turn in 3 drawn frames**, with smear copies on fast feet. The figure really moves through 3D depth, so its on-screen size changes.
