---
name: ink-toon
description: Make hand-drawn-looking 2D cartoon shorts (9:16, 1080x1920) fully in code with Canvas2D — brush ink outlines, cel + soft painted shading, white bean-head characters, simple mitten hands, history "what if" explainer staging. Use when the user wants a cartoon/animated short "like this reference", an Ink Toon video, a 2D history explainer, or to match a reference cartoon's look shot by shot.
---

# Ink Toon

A Canvas2D look that reads as hand-drawn digital cartoon (the "what if" history-short style): thick dark ink
outlines that taper and boil, flat fills with a hard cel shadow plus a soft airbrushed gradient, paper grain,
blurred painted backgrounds, white egg-shaped heads with tiny oval eyes and heavy lids, and very simple hands.
Everything is drawn from path strings in code, rendered frame-exact in headless Chrome, $0, no assets.

## QUALITY BAR — read this first (user's standing instruction)
The approved 10 s preview (`examples/what-if-test-scenes.js`, shots: soldier on hill, dial + hand, leader at
desk + leap) is the target for EVERY shot of every film. The user judged the first full film
(`examples/full-film/`) as clearly worse after 0:11 and said the quality "goes down and down" — that film is a
cautionary example, NOT a template. Never ship a film whose later shots fall below the preview.

Why the full film dropped (do not repeat):
- The preview got ~8 rounds of reference-vs-ours comparison per shot; the other 21 shots got one pass.
- Later shots used a generic `person()` rig (stubby flipper arms, stiff frontal poses, same body everywhere)
  instead of hand-authoring each character pose the way the preview did.
- Backgrounds/props were thin (blocky map regions, plain boxes for buildings, empty walls) compared with the
  preview's dense, shaded sets.
- No per-shot side-by-side against the reference frame before moving on.

What to do instead:
1. Treat each shot like the preview: hand-author the pose and the set for that shot (the rig may only be a
   starting point), then run the compare-and-fix loop until the shot matches its reference frame at ~90%.
2. Check every shot at full resolution and in face/hand crops before rendering the film. Make a contact sheet of
   our film next to the reference's sheet and look for any shot that looks simpler than the preview.
3. Budget for it and say so up front: roughly 30–60 min per shot to reach the bar (a 90 s short ≈ 20–25 shots).
   If time is short, deliver fewer finished shots or ask — do not fill the rest with quick placeholder shots.
4. Report quality honestly per shot; never present a mixed-quality film as finished.

Files in this skill:
- `kit/kit.js` — the drawing kit (import it from the scene file).
- `kit/index.html` — 1080x1920 canvas page; loads `scenes.js` as a module.
- `kit/Fredoka-700.woff2` — caption + lettering font (copy to `fonts/`).
- `tools/capture.mjs` — frame-exact renderer (frames / sheet / video; `FPS=60`; muxes `data/mix.wav`).
- `tools/compare.sh` — side-by-side vs a reference video at given times.
- `examples/full-film/` — the first full 89.5 s film (BELOW the quality bar after 0:11 — see above; reuse its
  map/globe/lon-lat data and structure, not its look): `lib2.js` has a reusable character rig `person({outfit, mood, armF, armB, legs, …})`
  (outfits: grey soldier, khaki, soviet fur hat, irish cap, leader, uncle-sam style, civilian), a hand-simplified
  Europe map `europe(box, regions)` from lon/lat polygons, and an orthographic `globe()`; `shots.js` shows 21 shots
  built from them (beach, office, forest, house, crate, wall/pull-down maps, globe spins, parchment, passport).
- `examples/what-if-test-scenes.js` — the approved 10 s test (soldier on hill, dial + hand, leader at desk,
  leap + chair swivel). Copy patterns from it; it is the quality bar.

## v2 tools (what got later shots close to the preview)
- `examples/v2/fig.js` — 3/4-view character `fig({x,y,s,d,kit,mood,armF,armB,legF,legB,armFTo,armBTo,hold,lean,tilt})`:
  bean torso, puffy breeches + short boots, egg head (`hs` 0.72), simple hands, 2-bone arm IK (`armFTo:[x,y]`)
  so hands land on props (rifles via `rifle(..., d)` which mirrors for left-facing figures). Kits: grey, soviet,
  khaki, irish, civ, civ2, leader, sam. Kneel-aim pose: `legF:[86,-86], legB:[6,-96]` + IK onto the rifle.
- `examples/v2/geo.js` + `geo.json` — real Natural Earth (public domain) countries: `drawEurope(c, colourFn, {extra})`
  inks thick coastlines/thin borders with a coastal glow; `drawGlobe(...)` orthographic. Hand-typed outlines looked
  amateur next to the reference — always use real geodata for maps. Drop far-east Russia points (antimeridian band).
- `examples/v2/hq.js` — every shot of the v2 film; reuse sets (beach, office corner, desk set via `shot3(t,{mid,top})`,
  pine forest + X fence, porch house, pull-down map, globe on stand, parchment + candle + swords, Roman street).
- 4K: canvas 2160x3840, `DPR` in kit scales drawing; `blur()` multiplies by DPR. Render 4 time-ranges in parallel.
- Per-shot loop that worked: measure reference positions in its pixels → place → render 1 frame → compare at full
  size and in crops → fix 3–5 biggest gaps → repeat (usually 3–6 rounds per shot).

## Project layout
```
my-short/
  index.html            (from kit/index.html)
  fonts/Fredoka-700.woff2
  kit.js                (from kit/kit.js) — next to scenes.js (it imports ./kit.js)
  scenes.js             your shots; sets window.OP
  tools/capture.mjs
  data/mix.wav          voiceover (+music) — optional
```
`scenes.js` must set `window.OP = { ready, duration(), draw(t), frame(t,q), shots(), captions(), cues() }`
(see the example's last 15 lines) and set `S.boil = Math.floor(t * 12)` at the start of every draw.

Render:
```bash
node tools/capture.mjs frames review/x "1.2,4.8,9.0"      # stills to check
FPS=60 node tools/capture.mjs video renders/out.mp4        # the film, with data/mix.wav
FPS=60 node tools/capture.mjs video renders/part1.mp4 0 30  # a time range (run ranges in parallel, then concat)
```

## Kit API (kit.js)
- `F(d, color, opts)` — fill a path string and ink it. opts: `line` (outline width, scaled by `S.lw`),
  `shadow` + `shadowCol` (hard cel shadow; offset away from `S.light`, or an explicit `shadowD` path),
  `soft` (airbrushed gradient toward the shadow side, default 0.22), `hi` (soft highlight), `tex` (grain),
  `off`, `seed`, `alpha`, `ink:false`.
- Paths: `sm(pts, closed)` smooth Catmull-Rom path; `poly(pts)` sharp; `tube(centerline, widths)` limbs,
  sleeves, fingers; `ellD`, `rectD`; `xform(pts, cx, cy, rot, s, dx, dy)`.
- Lines: `Ln(d, w, seed, color)` detail/fold lines; `stroke(pts, …)` low level.
- Paint: `grad`, `blur(px, fn)` (ctx.filter blur — use for soft shading, glows, drop shadows),
  `strokes` (brush texture — use sparingly, it reads as streaks), `puff` (clouds), `vignette`, `grainAll`.
- Text: `caption(t, x, y, size)` outlined white captions; `hand(txt, x, y, size, seed)` hand-lettered marker text.
- Transforms: `at(x, y, rotDEG, scale, fn)` — **rotation is in degrees**; `cam(z, fx, fy)`.
- Globals: `S.light` (light direction), `S.lw` (line weight, 0.86 is right), `S.boil`.

## The look — rules that made it match (keep all of these)
1. **Ink**: solid dark `#2b2220` outlines, `S.lw = 0.86` (≈6 px at 1080 wide); detail lines 2.5–4 px.
   Boil jitter small (0.8 px) and at 12 fps — never every frame.
2. **Shading**: every shape gets a hard cel shadow shape (explicit `shadowD` when the form matters) *and*
   `soft` gradient. Backgrounds are smooth gradients + `blur()` shapes, not brush streaks.
3. **Heads**: white egg `SKIN #f7f4ef`; outline 8; shadow crescent on the side away from light (cel for
   outdoor scenes, `softShade` blurred shading for interiors). Backlit outdoor scenes: grey skin `#e4e3e9`.
4. **Eyes**: tiny black ovals (12x19 * s) with a white glint; moods via a lid line that *clips* the eye
   (never paint skin over the eye — it shows as a patch on shaded skin); thick tapered brows; frown wrinkles
   between brows; mouth a short 7 px curve.
5. **Hands are simple** (the user insisted): small smooth white palm, 3–4 short rounded finger stubs
   (`smallHand()` in the example), or a plain mitten for big close-ups. Clasped hands = two smooth blobs with
   2–3 thin curved finger lines (2.6 px), sitting just over the bottom of the moustache. No knuckle-tube fingers.
6. **Clothes**: darker-than-you-think uniforms (`#73797d` coat, shadow `#2a2c3a`, shadow 0.38, soft 0.3),
   belts with buckle + pouch, pocket flaps, a few fold lines (3.5 px, 55–60% alpha) at elbows, skirt, chest.
   Sleeves lighter than the jacket with a pale rim highlight so arms read against the body.
7. **Props carry the frame**: perspective books (pages face + rounded red spine + gold bands), envelopes,
   chessboards, brass nameplates (serif text), torn tape labels with hand-lettering, beveled lights, ribbed dials.
   Each prop casts a blurred contact shadow.
8. **Staging copies the reference's framing**: measure reference boxes in its pixels and scale to 1080x1920
   (720p reference → ×1.5). Characters large; desk/ground line at ~62% height; captions at y≈1338.
9. **Captions**: plain white Fredoka, dark outline, 1–3 words at a time synced to word timestamps, small pop.
   This user does NOT want colored keyword captions.
10. **Motion**: slow camera push (≤5%) per shot, blink every ~3 s, breathing bob, flag waves with traveling
    fold shading, hits on key words (arm rises on "we gotta", dial turns on "how", leap + chair swivel).
11. **Own characters**: never copy a creator's character designs, insignia or symbols (no Nazi symbols ever).
    Historical caricature cues the user asks for (e.g. the leader's moustache, side-part hair) are fine.

## Workflow (how the 90% match was reached)
1. Get the voiceover word timings: faster-whisper `small.en` with `word_timestamps=True` (offline:
   `HF_HUB_OFFLINE=1`). Save `data/words.json`; captions and cues come from it.
2. Contact sheet of the reference (`ffmpeg … fps=1/2,tile=9x5`) → list the shots, what each shows, and the
   word each cut lands on. Follow its shot order and framing; swap in our own characters.
3. Author one shot at a time as hand-placed path coordinates. Draw back to front: sky/wall → far props →
   characters (legs, skirt, back arm, torso, front arm, head, face, headwear) → foreground → captions.
4. Render stills at 3–4 times and **compare side by side at full res** (`tools/compare.sh`, or crop just the
   face/hands region). List every visible difference, fix the biggest 5–10, repeat. Crops of faces and hands
   catch what full frames hide.
5. Render: `FPS=60`, split long films into time ranges across CPU cores, concat with ffmpeg, mux audio.

## Gotchas
- `at()` takes degrees; passing radians (e.g. -0.12) silently does nothing visible.
- A python/sed edit that fails to match leaves the file unchanged — re-check with grep before rendering.
- Hands placed too high cover the eyes; too low hide nothing. Check with a face crop.
- `strokes()` streak textures look wrong on smooth metal/walls; use gradients + blur.
- Keep each render job under the session's background limit; render ranges in parallel instead.
