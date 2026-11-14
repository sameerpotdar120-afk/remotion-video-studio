# 13 · The rule book from 25 reference shorts (measured at 30 fps, 2026-11-14)

Source: 25 reference shorts (1080x1920, 30 fps, 31-78 s), ~42,000 frames measured one by one (luma/sat/cut/camera
similarity fit), word-timed transcripts, 2 s contact sheets, and 8 topic analysts. Full numbers: `reference/study25/*.md`
(camera, vosync, colour_lighting, world, characters, fx_mechanics, sound, script). The videos themselves are private
study material: never commit, upload or publish them.

**Engine from now on: three.js rendered inside Remotion** (`src/videos/<name>/`, started from the cartoon-3d-short bridge
template). Blender plates are retired: they cannot move the camera through 3D and cost hours per change.
Where these 25 videos disagree with the bridge skill's reports, **this file wins**.

## A. Sync to the voice (the #1 failure of video #3)
- Author every visible change as an **event keyed to a word index** in `words.json` (never typed seconds); lint that every
  key verb/noun has an event. Template: `study25/vosync.md` §6 (`events.ts`).
- Action contact **+2 f after the word onset** (0..+4); wind-up/anticipation from **−6 f**; FX burst **+4..+5 f** lasting 6-12 f.
- Expression swap **+1 f**, held ≥15 f, always through a 3-frame blink. Blink/squint ~3 f before a reaction.
- Phrasal verbs hit on the particle ("blast **off**"). Effects that lead: wisp −10 f, muzzle flash −3 f, fireball −1 f.
- 1.5-2 visual beats per second; never 30 f without a visible change; ~95 % of phrases illustrated literally.
- New staging on sentence starts: a dissolve starting at −1..+6 f on the first word of about half the sentences;
  median shot 3.2 s, max ~8 s. A mid-sentence change ends on the noun it shows.
- Lighting changes start on the word that names them (sunrise ramp 27 f, switch to night 12 f).

## B. Camera (never dead)
- Every hold pushes in 0.25-0.5 %/f; ≤10 % of frames are still. No hand-held float.
- Moves are glides of 20-40 f with a speed hump (peak ~30 px/f at 1080), chained so the camera arrives already moving;
  ease off in the last ~12 f of a sentence, restart 3-9 f into the next.
- Shot changes = short cross-dissolves (6-10 f) with both cameras moving; ~11 per minute; hard cuts are rare.
- 3-5 fast reframes per minute (push into a screen/scope, tilt-up reveal) at 60-120 px/f for 3-12 f.
- Roll: 5-15° dutch on ~1/3 of framings; 10° glided rolls on emphasis.
- Shake only by scale: frame-alternating kick for hand hits; push-in 1.5-3 %/f for blasts; stillness for crashes.

## C. Colour and light
- Four presets: day (mid luma .52), golden (.54), **interior (.39, the most common: ~49 % of frames)**, night (.37).
- No pure black: black point #201314 day / #100e26 night. Shadows are colours: violet #7c7388 by day, indigo #273165
  at night, rose #3b292e indoors. Day sky #3e79cd → horizon #83a7e4..#c8e0f6.
- Faces stay near white (.89-.96) except night (~.70, mauve). Vignette corners .80 day, .60-.66 interior/night.
- Bloom only on light sources; far ground fades 50-65 % to the horizon colour; no film grain.

## D. World
- Two families in the refs: **A (01-20)** painted toon world with inked props; **B (21-25)** game-engine look (PBR-ish,
  haze, bloom, almost no world ink). Same grade and characters. Pick one per video (default A).
- Ink is selective: props, machines, signs, vehicles; not walls/floors/ground/sky. World lines 3-5 px at 1080, a dark tint
  of the surface. Character lines thicker, dark plum.
- Chunky low-mid poly with small bevels, painted line detail every 40-120 px, 8-15 props in a wide interior, walls never bare.
  4-6 sets per video, revisit 2-3.
- DOF on ~18 % of frames (background ~3.5 px, foreground props 8-13 px).
- Shots: MS 42 %, WS 27 %, object CU 18 %, face CU 10 %. Heads at .35-.40 of frame height, captions on the torso, skyline ~.36.

## E. Characters
- White round heads (h/w .96), hair/hat covering the top 20-35 %; ink #22161e ~4.5-5 % of head width (~14 px);
  3.2-3.4 heads tall; bean torso .6-.8 head widths, no neck; single-stroke limbs ~.045 W; dot hands ~.1 W, no fingers;
  eyes .25 W apart; no catchlights; blush rare. Our mascot keeps his locked Flame Spikes hair + gold S chain.
- On ones; moves ~5 f, holds ~7 f, still ~73 % of the time. Mouths move only on the character's own quoted lines
  (every 4-6 f). Walk step ~8 f; turn-around 3 drawn frames.
- Hands grip props by sitting the dot on the handle (drill crank, mug, door handle): both hands when the action needs it.
- Cards face the camera, take world shadows, cast their own, get hidden by grass/props, get DOF.
- Crowds: 5-10 unique figures reacting 0-6 f apart; armies = one card per side tinted, banner every 8-12, a big
  foreground leader, faces readable down to ~35 px; distant masses are tiny instanced sprites.

## F. Physics, mechanisms and effects (the #2 failure of video #3)
- Projectile block (5 beats): whole weapon ≥35 % of width with the target in frame → camera behind the breech pushing,
  muzzle flash −2..−5 f → ride the projectile near screen centre → camera stops 4-6 f before contact while it shrinks into
  the target → blast 1 f before its word.
- Impact geography: show hits from behind our own landmark (parapet in the bottom 12-18 %, target band at 55-60 % height),
  with launch edge and target in one wide shot first.
- Machines: whole machine next to a character first, then CU of the moving part; explain by glowing the part, following
  the energy in one move, or opening the casing. No arrows/labels; numbers only on in-world signs.
- One hero explosion per video (climax): cel-shaded cumulus with ink edge, 85-100 % width in 3 f, colour ramp
  #ffca5f → #c16b29 → smoke #33231f, 35 f fire + ≥70 f smoke. Only 1-3 near faces react (~2 f before impact); distant
  armies are swallowed by a left→right chain of puffs.
- Replace white flashes with a 9-11 f smoke/dust wipe or follow-the-object transition.

## G. Sound
- Master −14 LUFS, true peak −2 dBTP, LRA ~2 LU, effectively mono.
- Voice heavily compressed (peaks vary ~1.8 dB), 3.7 words/s, starts frame 1, pauses capped at 0.2 s, ends 0.28 s after
  the last word.
- Music: continuous dark sustained bed ~19-21 LU under the voice, no beat emphasis, no ducking, never dropped.
- SFX sparse (~1 whoosh / 10 s), on action words, not on cuts.

## H. Script
- Hook: one 14-word paradox sentence (~3.4 s), "He/They + odd act" is the most common form.
- First small payoff ~5.4 s; main twist/answer at ~75 % of the runtime; ending calls back the hook object (~22/25).
- "You see," in 17/25 (early to state the rule, or late to explain the mechanism); a mystery beat ("Wait…?") in 17/25.
- 3.74 words/s flat; median sentence 13 words, 12 % punches of ≤5 words; ~2 dialogue lines and ~2 jokes; no CTA.
- Template + checklist: `study25/script.md`.

## Our output
Reference format is 1080x1920 30 fps. Our channel standard stays **4K (2160x3840) 60 fps** unless the creator changes it:
author at 30 fps timing in frames ×2, render with Remotion `--scale 2` at 60 fps (measure render speed before quoting time).
