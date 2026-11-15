# 01 · The method from the long tutorial video (how to train yourself on a style)

Source: a ~12 min tutorial the creator shared (a builder showing how he taught Claude a "2D characters in a 3D world"
shorts style and released his result as an MIT-licensed skill, `claude-animated-shorts`). This file is our own summary of
the *method*; it quotes no lines. What we already did and what we changed is marked **[we]**.

## 1. The core idea: measure, don't opine
- A model asked to "analyse a video" samples a few frames. Styles live in the tiny things (micro camera drifts, a little
  shading, light changes) that only show up when you look at **every frame at the source rate (30 fps)**.
- So: gather many references of the exact style (he used ~20 shorts, ~18 min, ~32,000 frames), and study them at 30 fps.
- Ask for **numbers**, not opinions. An opinion can't be recreated; a number can. Every rule should be a value
  (frames, px/frame, hex colour, % of frames, LUFS) with the sample it came from.
- **[we]** did this on 25 shorts (~42,000 frames) and on the train reference: `reference/02` (tools), `reference/03`
  (rule book), `reference/04` (case study).

## 2. The three layers he decoded
1. **Script engineering:**
   - Get the *original-language* audio track; dubbed tracks get served by default.
   - Transcribe every reference yourself.
   - The common shape:
     1. a paradox in the very first sentence (no intro);
     2. escalation;
     3. a pivot where the real reason comes out, very often introduced by the same two words ("You see,");
     4. the payoff;
     5. one last twist line.
   - The delivery is relentless: close to 4 words per second, with almost no dead air.
2. **Visual construction:**
   - The characters are flat 2D but lit as if they physically exist: they catch the key light and cast real shadows.
   - The world is real 3D geometry, outlined in black ink like a comic.
   - Colour: saturated, with warm highlights and cool blue shadows.
   - Lighting follows the story: warm and bright during setup, deep night-blue when the explanation starts.
   - The camera rarely hard-cuts (12 of his 20 had at most one hard cut). Instead it physically travels into the next moment.
3. **Measurement:** he had Claude write its own measuring tools:
   - 2 s = 60-frame contact sheets (549 of them);
   - phase-correlation camera tracking (how far the image shifts per frame);
   - hard-cut flags;
   - brightness/contrast/saturation per short.

## 3. Topic and facts
- Check the reference channel hasn't already covered your topic (he dropped his first topic for that reason).
- Verify every fact before writing (dates, counts, depths). Facts can become the best joke in the script.
- Write with the exact formula: paradox line → build → "You see," → twist.

## 4. Engine journey (and why we ended where we did)
- He started in Blender (a quick 5 s look test). His camera push flew past the character, an early lesson in framing checks.
- He then moved to **three.js** (3D in code), with **Remotion** turning it into video frame by frame:
  - flat characters on cards in a real 3D world;
  - ~37 free models plus code-painted textures;
  - 14 facial expressions;
  - a physics-driven bridge whose bounce grows until it snaps;
  - a custom **edge-detect ink pass** for the world outlines.
- **[we]** used three.js + Remotion for video #3 (`reference/07`). For video #4 the creator asked for **Blender** for the
  environment; we built a fully procedural Blender engine (`reference/10`). Keep both.

## 5. Check stills before video
Before rendering, render still frames of every shot. His stills caught:
- cameras stuck inside houses;
- wrongly coloured (teal) trees;
- a chain in front of every face.

**[we]** found the same class of bugs:
- a camera inside an army;
- a hero hiding the cart;
- rails sunk into the ties;
- a maul head hidden behind a rail.

## 6. The "looks cheap" gap analysis (the most valuable part)
He put one of his frames next to an original and it looked cheap. He then asked for a frame-by-frame comparison with a
team of agents. The gaps found are a checklist for every video:

| area | the original | the weak version | rule |
|---|---|---|---|
| ink | black lines on ~3 of 4 world edges | almost none (the blur ran in the same pass and erased the ink) | ink pass **after** DOF, or in a separate layer; verify edge coverage numerically |
| DOF | backgrounds clearly blurred | blur too weak to see | the eye should go straight to the character |
| colour | bold, long blue shadows, deep darks, **no pure black**, purple shadows at sunset | pastel, flat, near-black darks, brown sunset shadows | black point lifted and tinted, shadows coloured |
| materials | wood/stone look hand-painted (grain, dark gaps between planks) | plain | paint grain, plank gaps and wear into every material |
| camera | glides over ~23 frames, ease in and ease out | snapped between positions in 3 frames | never snap; ease every move |
| characters | ~3.5 heads tall, thin limbs | <3 heads, limbs ~5× too thick | measure proportions on many frames |

The agents also **corrected earlier notes**:
- **Head shape:** the original heads were *rounder* than his, not egg-shaped (measured on 38 heads).
- **Camera stillness:** the first tool said the camera was still in ~80 % of frames. Re-measured, it moves in ~65 %, as
  slow push-ins the first tool could not detect.

Lesson: **validate your measuring tool**. Very slow moves (<0.3 px/frame) hide below phase-correlation noise. Fit zoom
over many frames, not frame to frame.

## 7. Agent teams that don't break each other
- He asked for 10 agents and got a team of 12:
  - **7 gap analysts:** colour, ink, light/shadow, textures, characters, depth/framing, motion;
  - **1 sound analyst;**
  - **4 builders:** camera, world, characters, final look.
- **Split the files, not just the jobs.** Each builder works in its own copy of the project and owns its files exclusively.
  The lead merges file by file.
- **[we]** used:
  - 8 topic analysts for the 25-reference study;
  - 5 render helpers, each on its own branch.

  The same rules apply: one owner per file, each helper on its own branch, merge by the lead.

## 8. What came next in his series (relevant to us)
- A realistic 3D science short. He promised to cover:
  - rigging for free;
  - animating a face with an open model;
  - making a world look real;
  - cutting render time from ~7.5 h to ~1 h by rendering smaller and upscaling.
- **[we]** apply the same render economics: `reference/11` (render at 2/3 scale, Lanczos to 4K, split frame ranges).
