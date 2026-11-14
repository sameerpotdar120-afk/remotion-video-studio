# 04: The Samulation hero (mascot)

He is the most important asset of the channel: people should recognise a Samulation video from his silhouette alone.
Art: `hero/hero-sheet.jpg` (full body + 4 expressions), `hero/poses.png` (8 poses), `hero/avatar-sample-800x800.png`
(channel profile, smug), `hero/avatar_mood_happy.png`, `hero/avatar_mood_shock.png`, `brand/` (profile + banner).
Code: `engine/src/char.js` (the rig, single source of truth) + `engine/src/kit.js` (ink drawing). `hero/sheet-tool/` renders sheets.

## 1. Locked identity (never change without the creator's explicit OK)
| element | spec |
|---|---|
| head | big circle, radius `r = 108·s` px, off-white `#f7f4ef`, ink outline 8, soft violet shading on the side away from light (`rgba(120,112,150,0.30)` blurred), white highlight top-left |
| **hair: Flame Spikes** | ginger `#e8742c`, shadow `#5a1d05`; four sharp spikes ALL swept to his left (screen right), short sides covering the head top to ~0.1r above the brows; thin highlight streaks; `hair: 'spiky'` |
| **gold chain** | gold rope chain (15 alternating oval links, gradient `#fff2a8→#f2c033→#a8700e`, ink `#4a2c05`) hanging in a U on the chest, round gold **"S" medallion** (radius 0.15·bodyW, radial gradient, inner ring, embossed "S" in Montserrat Black, specular glint); `chain: 'S'`; drawn over every outfit, under the head; shifts with `turn` |
| body | **bean**: narrow shoulders, full rounded bottom, `bodyW 170·s`, `bodyH 245·s`; colour = his outfit for that video (default slate blue `#5a7fa8`, shadow `#16233a`); cel shadow + soft gradient + highlight |
| limbs | **tubes, not lines**: grey-violet `#5e5a6a`, shadow `#1c1926`, ink 4.2 on both edges, tapering (legs 24→19·s, arms 18→15·s), gentle outward bow on legs |
| hands / feet | small round white mitten hands (r 16·s); rounded shoes (default off-white `#e9e4d8`) |
| face | small black oval eyes with a white glint, thick short brows, small mouth; mood via lids/brows/mouth only |
| name | the channel is Samulation; the hero has **no personal name yet**. Ask the creator before naming him |
| sizes | in 3D he is an `Actor` cut-out 1.72 m tall; in 2D art `char(x, groundY, scale)` with scale 1 ≈ 690 px tall |

Silhouette test: render him solid black at 180 px tall; the spikes alone must identify him.

## 2. How he is built (read `char.js` top to bottom)
Draw order inside `char(x, gy, s, o)`:
1. contact shadow (blurred ellipse) unless `noShadow`;
2. back arm tube + hand; 3. legs (tubes) + shoes, or the `sit` pose; 4. **bean body** (`bean()`); 5. outfit trims (hood strings, etc.);
6. **gold chain** (`goldChain()`); 7. front arm tube + hand; 8. back hair/headwear layer; 9. **head** (`headShape()`);
10. front hair (`hairFront()`: the Flame Spikes) and hats (`headwear()`); 11. **face** (`face()`: mood, look direction, turn);
12. `o.over(hx, hy, r)` callback for props drawn over the face (glasses, a held phone); 13. hair parts that fall over the face.
Ink style comes from `kit.js`: `F(path, colour, {line, shadow, shadowCol, soft, hi, tex})` = fill + hard cel shadow + soft gradient
+ highlight + grain + a brush outline that swells on the shadow side; `Ln` = ink line; `sm` = smooth closed/open path; `tube` = limb.
Lines "boil" (tiny jitter) at 12 fps via `S.boil`; keep `S.boil = Math.floor(t*12)` in animation, 0 in stills.

## 3. Controls (what every shot can set)
```js
hero.set({
  mood: 'neutral' | 'happy' | 'smug' | 'shock' | 'worried',
  turn: -1..1,            // turns face, feet, chain toward screen left/right (0.6-0.8 for walking across frame)
  lookAt: [x, y],         // pupils, -1..1
  armL: [dx, dy], armR: [dx, dy],   // hand offset from the shoulder in rig px: [70,110] relaxed, [150,-70] point, [70,-40] surprise, [-95,-25]/[95,-25] shrug, [90,-80] cheer
  walk: phase,            // walk cycle: phase = t*5 (legs + shoe lift); swing arms with sin(phase)
  sit: true,              // seated: place the Actor 0.16 m above the seat base
  headDx: px,             // lean the head forward/back
  over: (hx, hy, r) => {...}, // extra drawing over the face
  noChain: true,          // ONLY if the creator asks
});
const p = hero.hand([75, -15], 'R');   // world position of a hand -> put a 3D prop there (eggs, phones, tokens)
```
Pose library in `hero/poses.png`: neutral, walk, point, shock, worried, happy, shrug, 3/4 turn.
Outfit per video: `new Actor({ ...HERO, body: '#3fa58f', sh: '#0f3a32' })` (chain and hair stay). Caps: add `hat: 'police'`/`'beanie'`
(drawn under the spikes; if a new hat would cover the spikes, cut a gap so 2+ spikes stay visible).

## 4. Acting rules (the reference's characters act on almost every word)
- Change **mood or pose on every key word** (every 1-2 s): reaction words (lose, banned, illegal, never) → `shock`/`worried`;
  reveal/payoff words → `smug`; discovery → `shock` then `happy` 0.5-1 s later.
- He looks at what matters (`lookAt` toward the prop or the other character); blink every ~3 s (planned enhancement).
- Hands do something: point at the reveal, hold the prop, shrug on "nobody".
- In 3D keep the camera within ~60° of facing him (he is a flat cut-out); he always stands on the floor (shadow under the shoes).

## 5. How to enhance him (in this order; keep every locked element)
1. **Talking mouth**: add `talk: phase` → mouth open/closed shapes cycling on voice amplitude (read `data/vo.wav` RMS per frame).
2. **Blinks**: `blink: 0..1` closing lids every 2.5-4 s at random, 3 frames.
3. **True 3/4 head**: shift eyes/brows/mouth toward the turned side (partly done via `turn`) and draw the far spike row shorter;
   add a side view for walks across frame (profile head, one eye, spikes pointing back).
4. **Secondary motion**: spikes bounce 2-4 px on footsteps, the medallion swings (rotate by `sin(walk)` × 6°) and catches a glint
   when the light hits it.
5. **Hand shapes**: thumbs-up, open palm, holding (fingers wrap a prop) as alternative `hand()` drawings.
6. **More moods**: `angry`, `sly` (one brow up), `confused` (one eye squint + "?"), `proud` (eyes closed, chin up).
7. **Outfits library**: jacket, suit, hoodie, police/customs, chef, scientist; always the same bean silhouette underneath.
8. **Signature move**: a recurring smug point-and-wink at the reveal moment in every video (brand habit).
Each enhancement: add it to `char.js`, render `hero/poses.png` and the hero sheet again, check the silhouette test, then sync
`hero/sheet-tool/char.js` (copy of `engine/src/char.js`).

## 6. Rendering his art
```bash
cd SKILL/hero/sheet-tool && QS='&opt=HERO' node tools/capture.mjs frames review/h "0.5"          # hero sheet (1080x1920)
cd SKILL/engine && PAGE=brand.html QS='&what=avatar' SOFTWARE_GL=1 node tools/capture.mjs frames review/a "0"            # profile 800x800 (smug)
PAGE=brand.html QS='&what=avatar&mood=happy' SOFTWARE_GL=1 node tools/capture.mjs frames review/a2 "0"                   # mood variants
PAGE=brand.html QS='&what=banner' SOFTWARE_GL=1 node tools/capture.mjs frames review/b "0"     # 2560x1440 banner (add &guides for safe areas)
PAGE=brand.html QS='&what=poses' SOFTWARE_GL=1 node tools/capture.mjs frames review/p "0"      # pose sheet
```
Frames are saved as PNG data with a .jpg name: convert with PIL before uploading. Avatar safe area = inner circle (hair + medallion
must fit); banner safe area = centre 1546x423 (hero + logotype + tagline inside).

## 7. Channel art spec
Logotype: **SAMULATION**, Montserrat Black, "SAM" in a gold gradient (`#fff3a6→#f6c23a→#c9780e`), "ULATION" white, dark ink outline
(0.14 × size), orange glow. Tagline (placeholder, creator may change): "HOW THE WORLD REALLY WORKS". Background: our 3D neon street,
blurred.
