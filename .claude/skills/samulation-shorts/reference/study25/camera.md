# Camera / motion: 25 Samulation-style references (camera grammar, transitions, timing vs the voice)

Units: **px = pixels at 1080x1920** (the measurements were taken at 360x640 and multiplied by 3). **f** = frame at 30 fps.
Speed = hypot(translation, zoom x 1101 px), where 1101 px is the frame-corner radius at 1080 wide, so a pure push-in of
1 %/f counts as 11 px/f. The material is 25 videos, 42,523 frames (1,417 s).

Scripts and intermediate data are in `/root/proj/refs/work/camera/`:
- `cam.py`, `stats2.py`: camera statistics.
- `trans.py`: shot-change detector, run on 90x160 frames in `tiny/`.
- `timing.py`, `timing2.py`: offsets to the voice-over words.
- `shake.py`: impact-shake search.
- Verification strips: `strip_*.jpg`, `whips.jpg`, `sh/*.jpg`.

## 0. Verdict

1. **The camera never stops.**
   - Hold (< 0.45 px/f) is 9 % of frames, drift (< 3 px/f) 20 %, move 70 %.
   - Median speed is 6.5 px/f and p90 36 px/f.
   - Even in quiet frames the camera keeps **pushing in**: 68 % of quiet frames zoom, 80 % of those push in, at a median
     0.24 %/f.
2. **Shots change by cross-dissolve, not by cut.**
   - The median video has 11.4 shot changes per minute (one every 3.5 s).
   - Dissolves outnumber hard cuts by about 8:1 (261 dissolves against about 34 cuts in 25 videos; 12 videos have no hard
     cut at all).
   - A dissolve lasts **6 f** (p10-p90 3-9 f).
   - The camera is **still moving into and out of the dissolve**: the median speed is 2.2 px/f before it and 3.8 px/f after.
3. **The dissolve is what lands on the voice.**
   - Dissolves start a median **+2 f after the first word of a phrase** (IQR −2..+6 f). 35 % start within ±3 f of a
     phrase onset, against 11 % for random frames.
   - Camera moves are **not** locked to words: their onsets and peaks match the random baseline (28 % vs 25 % within ±3 f of
     a content word).
   - So the camera is continuous, the cut lands on the phrase, and the character acting lands on the word (see the motion
     report).
4. **Moves are long glides with a speed hump, not snaps.**
   - Attack and release are both 10 f (median, p25-p75 5-19 f).
   - The median speed profile is a narrow peak (−1 f: 0.96, ±3 f: 0.78) sitting on a broad shoulder (±10 f: 0.55-0.59,
     ±15 f: 0.45).
   - 42 % of moves are symmetric, 31 % ease-out and 26 % ease-in.
   - The median peak is 30 px/f (p25 18, p75 48).
5. **Fast reframes replace cuts.** There are about 5 per minute at ≥ 60 px/f for 3-12 f. They are pushes into a TV or scope,
   pull-backs out of a porthole, tilt-up reveals from feet to face, or the camera following a flying object. They are crisp:
   no strong motion blur was seen at full resolution.
6. **Impact camera shake is rare.** Of 123 automatic "frame-alternating" detections, a check of 9 found mostly texture or
   fast-move fit errors (rain, water, a fly-through). One confirmed example is v01 912-926, a train rattle on "clickety
   clack ... every gap": the image offset flips every 1-2 f by 20-40 px, roll ±0.5-2°, for 14 f. Impacts are sold by
   props and effects, and the camera keeps gliding.
7. **Roll is constantly in play.**
   - Rolls of at least 1° happen 6.0 times per 10 s (median 3.3° over 16 f).
   - Rolls of at least 5° happen 2.1 times per 10 s (median 10.6° over 30 f).
   - The p90 rolls (≥ 20°) are partly fit noise in fast moves; see Limits.

## 1. Method

- **Camera.** The input is the per-frame similarity fit in `measure/NN.json` (9-tile phase correlation, caption band
  excluded).
  - Fits are dropped for frames inside a detected transition (±1 f), for frames with a cut score > 0.5, and for fits above
    40 px@360.
  - Each channel is smoothed with a NaN-aware Gaussian, σ = 1.2 f.
  - Classes: hold < 0.45, drift < 3, move ≥ 3 px/f. These are the bridge study's 0.3 / 2 thresholds at 720p, scaled ×1.5.
  - Bursts are local maxima ≥ 9 px/f that are the highest point within ±6 f. Attack and release are measured to 10 % of the
    peak. A burst counts as "clean" when it is not cut off by a gap in the fit (741 of 1,057).
- **Transitions** (`trans.py`, run on 90x160 RGB with the caption band masked).
  - A candidate is a peak of the 64-bin colour-histogram distance between f−6 and f+6 (≥ 0.45).
  - Its span is the run of frames whose frame-to-frame histogram change is at least 40 % of the peak.
  - **Dissolve** test: on the middle frames, the error against a linear blend of the two ends must be < 0.75 × the error
    against the nearer end.
  - **Hard cut**: one frame carries more than 3× the change of its neighbours, and the far-window distance is ≥ 0.9.
- **Visual check** on 60 sampled events (strips `strip_1`, `strip_cuts`, `strip_bigmo`, `strip_bighc`, `strip_dlow`):
  - The dissolve class was right 6/6 at high distance and 8/12 at low distance. The misses were lighting changes such as
    lamps switching on or the night-to-morning grade.
  - The hard-cut class (distance ≥ 0.9) was right 9/12. The misses were a lightning flash, a smoke wipe and a smash.
  - About 25 % of the large "motion" events were dissolves the test missed. So counts are ±20 %.
- **Timing.**
  - Word onsets come from `tx/NN.json`.
  - A **phrase onset** is the first word after a gap of at least 0.12 s or after punctuation.
  - A **content word** has at least 5 letters, or contains a digit.
  - The signed offset is event frame minus the nearest onset (negative means the event comes before the word).
  - The baseline is 1,500 random frames inside the speech. Words come every ~9 f, so the nearest-any-word offset is
    meaningless on its own: random frames score the same as real events.

## 2. Numbers

### 2.1 Speed classes per video
| v | s | hold | drift | move | med px/f | p90 | moves/10 s | dissolves | hard cuts | shot changes/min |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | 65 | 3 % | 15 % | 83 % | 11.5 | 40 | 9.4 | 10 | 0 | 9.2 |
| 02 | 60 | 3 % | 10 % | 86 % | 12.5 | 36 | 9.6 | 18 | 0 | 17.9 |
| 03 | 58 | 11 % | 18 % | 71 % | 6.5 | 31 | 5.5 | 11 | 0 | 11.3 |
| 04 | 65 | 8 % | 23 % | 69 % | 6.5 | 29 | 6.6 | 16 | 2 | 16.7 |
| 05 | 64 | 6 % | 11 % | 83 % | 13.5 | 39 | 9.6 | 5 | 4 | 8.5 |
| 06 | 41 | 9 % | 17 % | 74 % | 6.0 | 31 | 6.4 | 14 | 0 | 20.7 |
| 07 | 45 | 10 % | 30 % | 61 % | 4.7 | 26 | 6.0 | 10 | 1 | 14.7 |
| 08 | 34 | 1 % | 5 % | 94 % | 19.2 | 47 | 14.5 | 10 | 0 | 17.4 |
| 09 | 31 | 7 % | 18 % | 75 % | 8.1 | 35 | 4.8 | 4 | 0 | 7.8 |
| 10 | 40 | 3 % | 12 % | 85 % | 8.7 | 26 | 7.8 | 2 | 3 | 7.5 |
| 11 | 47 | 7 % | 26 % | 67 % | 5.3 | 26 | 5.5 | 7 | 1 | 10.2 |
| 12 | 65 | 1 % | 20 % | 79 % | 10.3 | 38 | 11.6 | 8 | 3 | 10.2 |
| 13 | 39 | 12 % | 33 % | 55 % | 3.8 | 27 | 5.1 | 7 | 0 | 10.8 |
| 14 | 64 | 9 % | 21 % | 70 % | 9.5 | 45 | 7.8 | 10 | 1 | 10.3 |
| 15 | 66 | 8 % | 26 % | 66 % | 5.9 | 37 | 6.3 | 12 | 0 | 11.0 |
| 16 | 56 | 14 % | 22 % | 65 % | 7.0 | 42 | 7.8 | 6 | 1 | 7.5 |
| 17 | 78 | 20 % | 27 % | 52 % | 3.3 | 29 | 6.7 | 25 | 0 | 19.3 |
| 18 | 63 | 16 % | 34 % | 50 % | 3.0 | 37 | 6.3 | 12 | 0 | 11.4 |
| 19 | 60 | 9 % | 20 % | 71 % | 8.4 | 37 | 7.1 | 14 | 0 | 14.1 |
| 20 | 58 | 25 % | 33 % | 43 % | 2.3 | 36 | 5.0 | 10 | 1 | 11.4 |
| 21 | 65 | 10 % | 38 % | 53 % | 3.4 | 39 | 6.1 | 10 | 1 | 10.1 |
| 22 | 61 | 11 % | 24 % | 64 % | 6.1 | 40 | 7.5 | 3 | 11 | 13.8 |
| 23 | 67 | 7 % | 19 % | 75 % | 9.1 | 36 | 7.8 | 15 | 0 | 13.5 |
| 24 | 62 | 28 % | 18 % | 55 % | 3.8 | 16 | 6.6 | 10 | 4 | 13.5 |
| 25 | 63 | 7 % | 13 % | 81 % | 12.3 | 32 | 8.7 | 12 | 1 | 12.3 |


| Measure (all 25) | Median | Range / percentiles |
|---|---|---|
| Hold / drift / move | 9 % / 20 % / 70 % | hold 1-28 %, move 43-94 % |
| Median speed | 6.5 px/f | 2.3-19.2 |
| p90 speed | 36 px/f | 16-47 |
| Moves (bursts ≥ 9 px/f) per 10 s | 6.7 | 4.8-14.5 |
| Burst peak | 30 px/f | p10 12, p25 18, p75 48, p90 68 |
| Attack (10 % to peak) | 10 f | p10 3, p25 5, p75 18, p90 30 |
| Release (peak to 10 %) | 10 f | p10 4, p25 6, p75 19, p90 31 |
| Burst duration | 23 f | p25 13, p75 38 |
| Distance travelled in one burst | 188 px | p25 94, p75 374 (zoom −12 to +38 %) |
| Shape | 42 % symmetric (0.67-1.5), 31 % ease-out, 26 % ease-in | strong moves (≥ 45 px/f): 35 / 35 / 30 |
| Fast moves ≥ 60 px/f for ≥ 3 f | 5.2 / min | 3-12 f, peaks 62-121 px/f |

**Median speed profile around a burst peak** (670 bursts, normalised to the peak):

| Frame offset | −15 | −10 | −6 | −4 | −2 | −1 | 0 | +1 | +2 | +4 | +6 | +10 | +15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Speed (× peak) | 0.48 | 0.59 | 0.67 | 0.74 | 0.87 | 0.96 | 1.00 | 0.97 | 0.87 | 0.74 | 0.67 | 0.54 | 0.43 |

Reading: a sustained glide at about half speed carries a short accent of about ±3 f on top. It never starts from or
returns to zero inside ±15 f.

### 2.2 Zoom: push-ins and pull-outs

| Measure | Value |
|---|---|
| Quiet frames (translation < 3 px/f) with zoom ≥ 0.05 %/f | 68 % |
| Share of those that push in | 80 % |
| Push-in rate in quiet frames | median 0.24 %/f (p25 0.12, p75 0.48, p90 0.92) |
| Push-in runs (≥ 12 f, one sign) | 3.3 per 10 s; 39 f (p25 23, p75 60); +32 % total (p25 9, p75 88); 0.67 %/f |
| Pull-out runs | 1.95 per 10 s; 30 f (p25 20, p75 44); −24 % (p25 −48, p75 −9); 0.89 %/f |

These are image-scale changes, so 3D dolly parallax counts as well.

### 2.3 Roll

| Measure | Value |
|---|---|
| Roll runs ≥ 1° | 6.0 per 10 s; 3.3° (p25 1.8, p75 7.9); 16 f (p25 10, p75 28); peak 0.41°/f |
| Roll runs ≥ 5° | 2.1 per 10 s; 10.6° (p25 7.2, p75 19.9); 30 f (p25 20, p75 47) |

Visually, many shots sit on a constant 5-15° dutch, for example the v21 cell, v20 and v03, and the camera keeps rolling
slowly while it pushes.

### 2.4 Transitions

| Type | Count (25 videos) | Shape |
|---|---|---|
| Cross-dissolve | 261 detected (about 300 after recall correction) | **6 f** (p10 3, p25 5, p75 8, p90 9); longer ones of 8-10 f run under slow pull-outs (v19 864, v01 862). The camera is moving at ≥ 3 px/f before the dissolve in 44 % of cases and after it in 58 %. |
| Hard cut | about 34 (0-11 per video; v22 has 11, 12 videos have 0) | Usually between two moving shots (v05 58: ship flying in, then a hull close-up). |
| Push into or out of a screen, scope or window | many (v21 1390-1399 into a TV in 9 f; v16 1359 out of a scope through a porthole in 19 f; v08 tunnel) | ≥ 60 px/f, crisp, then a dissolve or a direct continuation |
| Foreground-object wipe | seen (v24 1307: a car body sweeps across in 4 f; v12 79: ship hull passes) | 3-5 f |
| Smoke or puff wipe | v05 1792: smoke fills the frame, then a circular reveal of the next scene, about 8 f | |
| Iris | v14 601: circular mask shrinks over about 3 f, then the next shot | |
| Lighting cue (not a cut) | frequent: lamps turn on, morning grade (v20 684), house lights (v08 467) | 3-10 f ramps inside the shot |
| White flash | none detected on dissolves; a v08 dissolve goes through a bright tunnel glow | |

Shots are 3.5 s long (median; p10 1.0 s, p25 2.0 s, p75 5.8 s, p90 8.8 s). There are 11.4 shot changes per minute
(p10-p90 8-18).

### 2.5 Impact shake

| Item | Value |
|---|---|
| High-frequency residual in quiet frames | 0.19 px median, 1.2 px p90: no hand-held float |
| Automatic frame-alternating events (≥ 3 px, ≥ 4 alternations) | 123, of which 36 are in v12 (rain and sea texture) |
| Verified camera rattle | v01 912-926 (train on rails): dx alternates 31, 22, −4, −27, 32, −36, 7, −21, −43, −35, −6, 40, −6, 28 px with roll up to ±2.3°, while the slow push continues |
| Rule | Use shake only for motivated vibration (vehicle, rumble), 14-20 f long. Do not put it on every hit. When you use it, it is big: 20-40 px, flipping every 1-2 f. |

### 2.6 Timing against the voice

Offset is event frame minus the nearest onset. "Within ±3 f" is the share of events that land within 3 f of an onset.

| Event | n | Offset vs phrase onset (median, IQR) | Within ±3 f | Random baseline within ±3 f |
|---|---|---|---|---|
| **Dissolve start** | 261 | **+2.2 f (−2.4..+6.2)** | **35 %** | 11 % |
| Dissolve middle | 261 | +4.2 f (−1.4..+8.2) | 23 % | 11 % |
| Hard cut | 34 | +1.2 f (−9..+14) | 26 % | 11 % |
| Move onset | 741 | +2.6 f (−14..+18) | 10 % | 11 % |
| Move peak | 741 | +1.6 f (−18..+17) | 9 % | 11 % |

Histogram of dissolve starts against phrase onsets, in 6 f bins from −30 to +30 f:
2, 4, 10, 14, 50, **105**, 36, 12, 6, 4. The mode is the bin from 0 to +6 f.

Against content words (≥ 5 letters), move onsets fall within ±3 f 28 % of the time (median −0.6 f) and moves peaking
≥ 45 px/f 28 % of the time (median −1.4 f). The random baseline is 25 %, so camera moves are essentially not word-cued;
at most a ~1 f lead.

## 3. Agreement with the bridge skill's `motion.md` (20 other videos, 720p numbers × 1.5)

| Item | Bridge report | These 25 | Verdict |
|---|---|---|---|
| Hold / drift / move | 10 / 24 / 65 % | 9 / 20 / 70 % | agree |
| Median speed | 5.4 px/f | 6.5 | agree |
| p90 speed | 25 px/f | 36 | **ours faster** |
| Moves per 10 s | 6.0 | 6.7 | agree |
| Burst peak | 20.5 px/f | 30 | **1.5x faster** |
| Attack / release | 10 / 10 f | 10 / 10 f | agree |
| Symmetric moves | 62 % | 42 % (31 % ease-out) | mostly agree; more variety here |
| Push-in in quiet frames | 0.14 %/f; 70 % active, 83 % in | 0.24 %/f; 68 % active, 80 % in | same habit, **1.7x faster rate** |
| Push-in runs | 35 f, +22 % | 39 f, +32 % | agree (bigger here) |
| Rolls | 3.2 per 10 s, 3.6° over 18 f | 6.0 per 10 s, 3.3° over 16 f; ≥ 5°: 2.1 per 10 s, 10.6° over 30 f | **twice as many** |
| Hand-held float | none | none (0.19 px) | agree |
| Impact shake | 7 f kick flipping every frame, ~4.5 px | rare; when present a 14-20 f rattle at 20-40 px | **disagree**: do not put a kick on every hit |
| Big reframes | "are cuts" | **dissolves (6 f) while moving, or fast push/pull/tilt reveals** | **disagree**: replace `cut: true` with a 6 f dissolve |
| Whips | 0.45 per min, blurred | about 5 per min ≥ 60 px/f, crisp push/pull/tilt reveals | different grammar |
| Camera vs word timing | "…" | camera not word-locked; dissolves start 0-6 f after a phrase onset | new |

## 4. Rules for `story.ts` (CAMS) and `Bridge.tsx`

### R1. Every key is a moving framing

Each framing `s(f)` must keep moving during its hold:
- `pushK` rate **0.0025-0.005 /f** (0.24 %/f median, 0.48 %/f p75). The bridge template uses 0.0015-0.003, so raise it.
- Add a slow lateral or orbital drift of about 1-3 px/f, so that hold frames (< 0.45 px/f) stay under 10 % of the film.
- Punch pushes run at 0.0067 /f for about 39 f (+30 %).
- Pull-outs are about 0.009 /f for about 30 f (−24 %). Use roughly one pull-out for every two push-ins.

### R2. Glides: half-speed carrier plus a short hump

Replace the pure smootherstep with a blend: 55 % linear, 45 % smootherstep. With that mix the start and end speeds are
about 0.55 × the mean speed, and the peak (centre) is 1.4 ×. That matches the measured shoulder of 0.5-0.6 at ±10-15 f.

```ts
/** reference glide: moving at ~55 % speed at both ends, hump in the middle (25 refs: attack 10 f, release 10 f) */
export const glide2 = (u: number) => { const x = clamp01(u); return 0.55 * x + 0.45 * x * x * x * (x * (6 * x - 15) + 10); };
```

- Duration: `dur` 20-40 f, median 23.
- Peak speed: at most 48 px/f at 1080 (p75), normally about 30.
- Peak speed = (0.55 + 0.45 × 1.875) × distance / dur = 1.39 × distance / dur. So keep `dur` ≥ 0.046 × distance in px
  (for example 400 px needs ≥ 19 f).
- Chain keys back to back so the camera arrives already moving. Do not insert a 0-speed hold between glides.

### R3. Shot changes: 6 f dissolves with the camera moving on both sides

This replaces `cut: true`.
- In `Bridge.tsx`, render the outgoing camera and the incoming camera into two render targets for `xf` frames and mix them
  linearly in the composite pass.
- Keep both cameras moving: the outgoing one continues its glide and push, and the incoming one is already in its push.
- `xf`: 6 by default (range 4-9). Use 8-10 under a slow pull-out or for the time-skip lines ("the next morning").
- Target about 11 shot changes per minute: one every 3.5 s (2-6 s).
- Allow at most 1-2 true hard cuts per film, and only between two fast-moving shots or on an impact.

```ts
type Key = { f: number; dur?: number; xf?: number; s: (f: number) => Shot };   // xf>0: crossfade from previous key's shot
// camAt returns {a: Cam, b?: Cam, mix?: number}; mix = clamp01((f - k.f) / k.xf) (linear), the old shot keeps running s(f)
```

### R4. Put the dissolve on the phrase, not on the word

Set the dissolve start `k.f = round(phraseOnset × 30) + 2`. The first word of the new phrase has just started, and the
mix finishes about 8 f in. Phrase onsets come from `words.json`: the first word after a gap of at least 0.12 s or after
punctuation.

Do not try to hit words with camera moves. They are free-running. Hit words with character acting (motion report) and
with SFX.

### R5. Fast reframes as transitions (about 3-5 per minute)

These run at 60-120 px/f for 3-12 f, with ease-in-out:
- push into a screen, window or scope and dissolve to the scene "inside" (v21 TV: 9 f);
- pull back out of a porthole or scope (v16: 19 f);
- tilt up from feet to face (v03: 17 f);
- follow a flying object (v05 cup, v08 pill).

No motion blur is needed: the references are crisp. Use `glide` (smootherstep) for these, since 35 % of strong moves
are symmetric.

### R6. Roll

- Every 2-3 framings, give a dutch of 0.09-0.26 rad (5-15°), static or slowly growing.
- Glided roll changes: 3° over about 16 f routinely; on emphasis, 10° over about 30 f.
- In practice, set `roll` per key to ±0.05-0.18 and let the glide carry it. The template's ±0.02-0.04 is too timid.

### R7. Shake only for motivated vibration

Replace `KICKS` on ordinary impacts with nothing: the push keeps going.

For vehicles or rumbles, use a 14-20 f rattle:

```ts
const rattle = (f: number, f0: number, n = 16, A = 30) => { const i = f - f0; if (i < 0 || i >= n) return [0, 0, 0];
  const s = (Math.floor(i / (1 + (i % 3 === 0 ? 1 : 0))) % 2 ? -1 : 1) * (1 - i / n) ** 0.7;  // flips every 1-2 f
  return [s * A, -0.4 * s * A * hh(i, 3), s * 1.2]; }; // px@1080 x, y, roll deg  -> convert px to world at the look distance as in kickAt
```

### R8. Captions

Captions and camera are independent. The camera never waits for captions.

## 5. Top rules, ranked by visual and retention impact

1. **Cross-dissolve (6 f) between shots with both cameras moving**, about 11 per minute, starting 0-6 f after a phrase
   onset (R3, R4). This is the single biggest grammar difference from "cuts" in the bridge template.
2. **Never a dead frame**: push-in 0.25-0.5 %/f in every hold and ≤ 10 % hold frames (R1). Our last attempt failed with a
   "static camera".
3. **Glides that arrive already moving**: carrier plus hump, 20-40 f, peak about 30 px/f, keys chained (R2).
4. **3-5 fast reframe transitions per minute** (push into a screen, pull out of a scope, tilt-up reveal) at 60-120 px/f
   for 3-12 f (R5).
5. **More roll**: a 5-15° dutch on a third of the framings, and 10° glided rolls on emphasis (R6).
6. **No kick on every hit**: shake only for motivated vibration, big and short (R7).
7. **Camera moves are not word-cued.** Lock dissolves to phrases and actions to words, and do not spend effort syncing
   glides to syllables.

## 6. Limits

- **Speeds include zoom and parallax.** The values are an image-similarity fit on 9 tiles. Fast fly-throughs and
  repetitive textures (rails, windows, rain) give fit errors, which inflate p90, roll p90 and the shake count. The shake
  numbers were therefore checked by eye, and only v01 was confirmed.
- **Transition counts are ±20 %.** Lighting changes are sometimes taken for dissolves, and dissolves under fast motion are
  sometimes missed. Dissolve length is the span of strong change; visually the blends look 5-8 f.
- **Phrase onsets come from Whisper word times**, which are accurate to about ±2 f, so offsets carry that error.
- **Dutch angle (absolute tilt) cannot be measured** from frame-to-frame fits. The 5-15° figure is a visual estimate from
  the sheets.
