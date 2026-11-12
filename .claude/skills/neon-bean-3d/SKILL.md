---
name: neon-bean-3d
description: Make the channel's house-style vertical shorts - flat 2D stick-and-bean cartoon characters (our locked hero with the ginger Flame Spikes hair) acting inside a lit 3D world drawn to look hand-made (neon night streets, alleys, interiors), word-synced one-word captions, cross-dissolves on a camera that never stops. Rendered in code with three.js + Canvas2D in headless Chrome, free. Use for any new video in this style, for "our character", the hero, the bean/stickman style, or a "loophole / how does this work" explainer like the approved preview.
---

# Neon Bean 3D (house style, approved quality bar)

The user approved the 13.75 s preview built with this skill as **the quality to keep for every video** ("keep this
quality ... stick to it"). Never ship below it. Improve on it only in the directions listed in section 9.
`SKILL` = this folder. `template/` is the approved preview's engine and four sets. `character/` is the hero rig and sheet tool.
`look-key-frames.jpg` shows the approved look. `character/hero-sheet.jpg` shows the locked hero.

## 0. Locked decisions (do not change without the user saying so)
- **Hero:** stick limbs drawn as shaded **tubes** (grey-violet `#5e5a6a`, ink on both edges, lit and shadow side), a **bean body** for
  volume, a big round white head (`#f7f4ef`) with soft shading, simple oval eyes with a glint, thick brows, short mouth.
- **Signature hair: Flame Spikes.** Ginger `#e8742c` (shadow `#5a1d05`), four sharp spikes all swept to his left (screen right), short
  sides. Code: `HERO` in `char.js` (`hair: 'spiky'`). The hair stays in every video and every outfit. Caps sit *under* the spikes.
- **Clothes/body colour change per video** (default slate blue `#5a7fa8`). He has no name yet: ask before inventing one.
- **Extras:** same build and ink, other hair/hats/colours (`LOOKS.A/B/C` + `hair: mop|afro|topknot`, `hat: beanie|police`, `phones`).
  Never give an extra flame-spike hair.
- **Captions:** plain white, Montserrat Black 78 px, black outline 9 px + soft drop shadow, centred, baseline y = 1381 of 1920,
  ONE word at a time (short words ride with the next: "in Japan", "a gambling"). No coloured keywords.

## 1. The look (measured from the reference the user chose; keep these numbers)
- 1080x1920, 30 fps, 30-60 s. Voice ~3.5 words/s, pauses 0.2-0.6 s, constant music/ambience bed under the voice, -14 LUFS.
- **No hard cuts.** Every shot change = a short **cross-dissolve (~5 frames, `XF = 0.085` s half-length)** on top of a moving
  camera. One shot every ~2.5-4 s. The camera **never stops** (dolly, push-in, crane-up, follow).
- **World = 3D drawn as 2D:** simple geometry carrying hand-painted canvas textures: flat colour + grain + ink seams +
  ink frame on every face (`inkBox`, `frame()`), drawn props (AC units, cables, posters, crates, vending machines, lanterns,
  signs with readable text, Japanese text via IPAGothic where the topic needs it).
- **Lighting:** night = deep blue/violet walls (`#7479c8`→`#5a5eb0` texture, hemisphere `#6a74ff`/`#2a2260` ×1.5-1.7), warm
  practical lights (lit windows ~`#ffd27a`), neon accents (pink/cyan/orange/green), wet reflective floor (roughness 0.22-0.32),
  soft glow sprites at 0.1-0.25 opacity. Interior = warm cream/gold (`#f0dcae`, fog `#f6dca8`), red carpet with gold diamonds.
- **Characters = 2D cut-outs** (`Actor`): drawn with the rig onto a canvas, mapped on an upright plane that always faces the
  camera, emissive 0.42 so they read in dark scenes, blob shadow. They pose and change mood per beat.
- **Post:** bloom 0.32-0.36 (threshold 0.8-0.86), tiny depth of field (aperture 0.00012-0.00022), vignette 0.3-0.42, grain 0.012,
  saturation ×1.15-1.2.

## 2. Workflow (same gates as the Short Video Studio skill)
1. **Script** (original; facts checked twice; loop ending; ~3.5 words/s; hook = paradox or "why/how" question). Show the plan,
   wait for "build it".
2. **Voice:** the user's recording or a free local voice → `data/mix.wav`. Word timings → `data/words.json` (`[{w,s,e}]`) with
   faster-whisper (Short Video Studio `tools/words.py`). Never publish a reference video's audio. It's for private tests only.
3. **Shot list on words:** one set per story place, 2-4 shots per set, each with camera from→to, who's in frame, the mood
   and pose changes and the word each lands on.
4. **Build sets** by copying `template/` (`cp -r SKILL/template ~/proj/<name>`), then reuse or adapt `alley.js`, `city.js`,
   `hall.js`, `front.js`, or write new ones with the same helpers (section 4).
5. **Look-dev each set:** render 1-3 stills (`frames`) and compare with the approved look (`look-key-frames.jpg`) and the reference.
   Fix the biggest gap, repeat. Check: nothing blown out (a lit window or door must keep its detail), characters readable,
   captions clear, ink lines visible on walls.
6. **Contact sheet** of the whole film (`sheet review/sheet.jpg 0.75 6`), read every cell, show the user frames while working.
7. **Render** (time measured below), make a side-by-side with the reference for scoring, send both, score honestly.

## 3. Commands (run inside the project folder)
```bash
SOFTWARE_GL=1 node tools/capture.mjs check                          # boots, lists shots + captions -> CHECK OK
SOFTWARE_GL=1 node tools/capture.mjs frames review/x "1.0,6.0"     # stills
SOFTWARE_GL=1 node tools/capture.mjs sheet review/sheet.jpg 0.75 6  # contact sheet
SOFTWARE_GL=1 FPS=30 node tools/capture.mjs video renders/out.mp4   # final (muxes data/mix.wav), run in the background
```
- **Measured speed (no GPU, this sandbox): 2.9 s per frame** at full 1080x1920 → 30 s ≈ 45 min, 60 s ≈ 90 min.
  Long films: render time ranges in parallel (`video renders/p1.mp4 0 20`, …) on separate machines/processes, then concat.
  Progress prints only every 150 frames, so tell the user the expected finish time up front, in their time zone (IST).
- Character sheet: `cd SKILL/character && QS='&opt=HERO' node tools/capture.mjs frames review/h "0.5"`.

## 4. Engine API (`template/src/`)
- `engine.js`: `makeEngine(canvas)`, `E.render(scene, cam, { bloom, bloomThreshold, focus, aperture, maxblur, vignette, grain, sat, warm, exposure, t })`, `camera(fov)`.
- `core.js`: `tex(w, h, draw, {repeat})` (canvas texture painted with the ink kit), `fill`, `grain`, `frame` (ink border),
  `lit(map,{roughness})`, `glowMat(map, k)` (emissive), `flat(col)`, `plane(w,h,mat,pos,rot)`, `box`, `inkBox(w,h,d,col,pos,{detail,col2})`,
  `glow(col,size,pos,opacity)` (additive haze sprite), `point(col, intensity, pos, dist)`, `Actor(look)` → `.at(x,y,z).set(state).face(cam)`,
  easing `ease/eout/lerp/lerp3/seg/clamp`, `rnd(n)`.
- `char.js` (rig): `char(x, groundY, scale, { look, mood, turn, lookAt, armL, armR, walk, sit, headDx, over })`. Moods: `neutral`,
  `happy`, `smug`, `shock`, `worried`. `walk` = phase (`t * 5`) for a walk cycle; `sit: true` for stools/benches (place the Actor at
  seat height ~0.16 m above floor); `turn` -1..1 turns face and feet; arms are hand offsets `[dx, dy]` from the shoulder.
- `kit.js`: ink drawing (`F` fill+shade+ink, `Ln` ink line, `sm` smooth path, `poly`, `tube`, `ellD`, `rectD`, `blur`).
- `main.js`: shots `{ id, at, draw(t, d) }`, cross-dissolve between neighbours, one-word captions from `data/words.json`;
  duration = last word end + 0.6 s (override with `?dur=`).
- **Set templates:** `alley.js` (night back alley with a lit hatch window, vending machine, crates, cat, cables, lantern),
  `city.js` (neon shopping street with vertical signs, wet road reflections, a city grid for aerial crane-ups),
  `hall.js` (long symmetric interior aisle: machines with flashing screens, LED counters, stools, carpet, light strip),
  `front.js` (shopfront at night: lit glass doors showing the interior, big sign, posters, kerb).

## 5. Shot recipes that worked
- **Walk-through establishing:** hero walks across the foreground (`walk`, smug, `turn` 0.75) while extras wait at the lit
  focal point deep in frame; camera slow push, fov ~54, look at the focal point.
- **Crane-up reveal:** start at street level (fov 50) then ease up to ~60 m looking down the street grid; neon lifts the frame.
- **Aisle dolly:** camera at eye height moving down a symmetric aisle (fov 62), seated extras in profile facing their machines,
  one character walking toward camera carrying a prop; machines flicker (emissive sine), lamps blink.
- **Pass-by:** a character (e.g. police) walks across the frame in front of a lit doorway while the hero reacts (shock) at the side.

## 6. QA checklist (every film)
- Hero always on model: spikes, colours, tube limbs; caps under the spikes. Faces readable at phone size.
- No blown-out lights (a door, window or sign keeps its detail), no character hidden by props, no camera inside geometry.
- People are cut-outs: keep the camera within ~60° of facing them; feet on the floor (blob shadow under the feet).
- Captions on the spoken word, spelled right, inside the safe zone, never over the hero's face.
- Zero hard cuts; the camera moves in every frame; the dissolve is ~5 frames.
- Audio: voice clear, -14 LUFS, video length = audio length.

## 7. Delivery
Master MP4 (1080x1920, 30 fps, CRF 18) + a private side-by-side vs the reference when one exists + key frames + an honest score
(the approved preview scored ~65-70% vs the reference: colour 8, edit 8, captions 8.5, set detail 5, acting 5, camera 7).
Publishing kit via the Short Video Studio skill (`reference/10`).

## 8. Rules
Original script, voice, characters and set designs. Our own sign names (e.g. "STAR HALL"), never a real brand or the reference's
names. No hate symbols, no gore. Credits for any CC-BY asset. Times in IST. Show frames while working; never claim a match you
haven't measured.

## 9. Where to improve next (in this order, without dropping below the approved bar)
1. **Set density:** more drawn detail on every wall (pipes, cables, signs, posters, clutter) and ink outlines on all 3D edges.
2. **Acting:** change mood/pose on the key words (every 1-2 s), hand gestures, look-at targets, blinks.
3. **Neon balance:** less saturated street signs, softer glows; slightly tighter framing on characters.
