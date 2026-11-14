# Colour, grade and lighting: 25 reference shorts

Private study. Work files are in `/root/proj/refs/work/colour/`:

- scripts: `agg.py`, `stats.py`, `summ.py`, `beats.py`, `trans.py`, `deep.py`;
- frame labels: `labels.txt`;
- per-frame stats: `out/stats.json`;
- montages: `out/mont0.jpg`, `out/mont1.jpg`;
- lighting-event strips: `out/events.jpg`.

## 0. Method

**Per-frame series.** `measure/NN.json` gives every frame of all 25 videos at 360x640, with the caption band masked:

- luma mean and std, p2 and p98;
- HSV saturation;
- a cut score.

**Deep stats.** 200 PNG frames, 8 per video at 4, 16, 28 … 88 % of the duration, decoded at 540x960. Decoding used a bt709 tv→pc full-chroma scale.

- Rows 56-80 % (the captions) are masked.
- Luma is Y' = Rec.709 weights on sRGB-encoded values.
- Lab is D65.
- "Ink" means a black top-hat (7x7 closing − Y' > 0.12 and Y' < 0.30). "Non-ink" drops the ink plus 1 px.

**Hand labels**, by eye from the montages:

| Label | Meaning | Frames |
|---|---|---|
| I | interior | 97 (49 %) |
| D | day exterior | 57 (28 %) |
| N | night or blue-hour | 21 (10 %) |
| G | golden or sunset | 12 (6 %) |
| X | full-screen graphic or close-up | 13 |

Note that **interiors dominate this set**. The bridge study was day-heavy.

**Lighting events.**

- In-shot luma changes of more than 0.15 within 1 s (`beats.py`, 93 found; most are camera tilts into the sky).
- Flashes: more than +0.12 over the ±0.5 s median for 12 frames or fewer (21 found).
- Five story-driven events were then traced at 0.1-0.25 s against the word timestamps (`trans.py`).

## 1. Tone: luma and black/white levels

Medians of the per-frame values, at 540x960, with captions masked.

| | D | G | N | I | X | ALL |
|---|---|---|---|---|---|---|
| Y' p0.5 | .103 | .116 | .079 | .078 | .102 | .087 |
| Y' p2 | .145 | .150 | .099 | .101 | .147 | .113 |
| Y' p5 | .195 | .173 | .127 | .122 | .214 | .142 |
| Y' p25 | .373 | .329 | .240 | .251 | .343 | .292 |
| **Y' p50** | **.517** | **.535** | **.371** | **.385** | .477 | .434 |
| Y' p75 | .646 | .672 | .442 | .547 | .605 | .578 |
| Y' p95 | .867 | .875 | .630 | .861 | .869 | .854 |
| Y' p98 | .930 | .939 | .740 | .913 | .899 | .914 |
| Y' p99.5 | .972 | .967 | .864 | .956 | .930 | .959 |
| Y' mean / std | .518/.203 | .514/.191 | .364/.153 | .426/.214 | .490/.219 | .459/.198 |
| L* p2 / p50 / p98 | 15.8/58.2/93.8 | 17.7/57.8/94.7 | 9.8/42.8/77.6 | 9.7/44.8/92.3 | 16.6/53.3/91.5 | 11.6/49.4/92.4 |
| non-ink Y' p2 | .169 | .164 | .104 | .105 | .192 | .120 |
| ink pixel share | 2.7 % | 1.6 % | 1.7 % | 2.1 % | 1.5 % | 2.2 % |
| pure-black px share (max RGB < 10/255) | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | **0.000** |
| near-black share (Y' < .08) | 0.2 % | 0.1 % | 0.5 % | 0.6 % | 0.2 % | 0.3 % |
| clipped white (min RGB > 250) | 0.08 % | 0.02 % | 0 | 0.02 % | 0.03 % | 0.03 % |
| black point, darkest 0.5 % | **#201314** | #301318 | **#100e26** | #1a0c14 | #21111b | #1d0e16 |
| black point, non-ink | #251a21 | #3c1a26 | #101029 | #1d1019 | #252020 | #1f131d |
| white point, brightest 0.5 % | #fefbf5 | #fef9ee | #eceaf7 | #fef8ed | #fef2ec | #fef8f3 |

**Whole-video numbers** from `measure/*.json` (360x640, every frame). The median over the 25 videos:

- lm 0.441, ls 0.196;
- p2 0.116, p98 0.913;
- HSV sat 0.455.

The ranges across videos:

| Measure | Range |
|---|---|
| lm | 0.227 (13, a sleep/night video) to 0.619 (11) |
| p98 | 0.81 to 0.99 |
| sat | 0.354 (21) to 0.634 (12) |

**Pure black almost never appears.**

- Only 12 of the 200 frames have more than 1 % of pixels with max RGB under 10/255.
- The exceptions are deliberate: the "drift off" blackout in video 13 (13_3 is 19.5 %), and a casino and a mine at 4.5 % and 2.8 %.
- p2 falls below 0.03 in only 4 videos (09, 12, 13, 24), and only during fades or black interiors.

**Highlight roll-off.**

- The top 2 % sits at Y' .91-.94 and the white point is near-white (#fefbf5). Hard clipping is under 0.1 %.
- Highlights are warm-white: Lab b* +2 day, +12 interior, +24 golden.
- The roll-off is a soft shoulder, not a clip. Use NeutralToneMapping, or the curve in section 7.

**Grain.** None. The high-pass std on flat areas is 0.30/255 in every cluster, which is the h264 noise floor. Do not add film grain.

## 2. Saturation and chroma

| | D | G | N | I | X | ALL |
|---|---|---|---|---|---|---|
| HSV S mean | .449 | .451 | **.543** | .463 | .443 | .464 |
| C*ab non-ink p50 | 29.3 | 30.3 | 37.0 | 22.3 | 20.6 | 26.9 |
| C*ab p90 | 55.2 | 49.9 | 59.0 | 44.7 | 45.9 | 51.5 |
| C*ab p98 | 62.9 | 62.7 | 71.5 | 62.2 | 68.1 | 64.5 |

Night is the most saturated mode, because everything is pushed into deep blue. It is not dark grey.

## 3. Palette

### Zone colours

Non-ink pixels. Share = fraction of non-ink pixels; a*/b* are mean Lab; hex is the mean colour.

| zone | D | G | N | I |
|---|---|---|---|---|
| shadows Y' < .3 | 10 %, a +11.9 b +1.1, **#393336** | 21 %, a +17.7 b +1.8, **#552e38** | 37 %, a +17.2 b **−34.4**, **#273165** | 31 %, a +11.6 b +1.9, **#3b292e** |
| mids | 61 %, a +4.6 b −0.2, #7a8186 | 55 %, a +21.8 b +18.6, #b27a69 | 61 %, a +16.1 b −28.0, #696eab | 45 %, a +13.0 b +12.3, #90726d |
| highlights Y' > .7 | 19 %, a +0.4 b +2.2, #d4d0d4 | 25 %, a +6.4 b +23.6, #f3cfa8 | 3 %, #d5cbd8 | 14 %, a +2.8 b +11.9, #e7d3c4 |

**The rule: warm key, cool or rose shadow.**

- Darks are always **rose / plum** (a* +12 to +18). They are never grey or brown.
- At night, darks go deep **indigo-violet**: hue about 235°, a* +17 b* −34. They are not cyan.
- Highlights are warm in every mode except day exteriors, which are neutral because the sky is in the frame.

### Hue shares

Saturation-weighted, % of hue mass. Bins are 30° wide and named by their centre.

| | red 0 | orange 30 | yellow 60 | chartr 90 | green 120 | spring 150 | cyan 180 | azure 210 | blue 240 | violet 270 | magenta 300 | rose 330 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| D | 9 | 27 | 6 | 5 | 5 | 2 | 3 | **35** | 5 | 1 | 1 | 2 |
| G | 21 | **45** | 2 | 0 | 0 | 0 | 1 | 12 | 6 | 2 | 2 | 8 |
| N | 6 | 7 | 1 | 1 | 0 | 0 | 2 | 30 | **46** | 4 | 1 | 1 |
| I | 19 | **38** | 4 | 1 | 1 | 1 | 3 | 11 | 11 | 2 | 2 | 7 |

The palette in practice:

- Day is two poles, **orange wood/sand (#d6ad7f, #e3b684) against azure sky (#3e79cd)**, with greens as a minority.
- Interiors are about 57 % red and orange (wood, carpet, wallpaper), with 22 % blue/azure accents from windows and screens.
- Night is 76 % azure and blue, with small warm practicals (6 % red, 7 % orange).

### Sky

The sky mask is hue 180-250°, S > .2, V > .4, and is only taken when it fills at least 60 % of the top 5 % of rows.

| mode | n | sky top (rows 0-5 %) | horizon (lowest sky band) | sky ends at |
|---|---|---|---|---|
| D | 25 | **#3e79cd** (range #0550eb to #608acd) | **#83a7e4** (range #70a4dd to #bbd3f6, horizon haze #c8e0f6 / #dee7dc) | 36 % of frame height |
| N | 15 | **#2b50ad** (#081796 to #6987b7) | **#426aad** (#1a457a to #7b7dad) | 45 % |
| G | 3 | #5d8edf, horizon #7683b4 / peach | – | 21 % |

The golden sample is too small to stand alone. For golden, use the bridge study's top **#937b80 violet → #d99d83 peach** (rows 20-40 %), plus the row means from this set: 0-5 % #726f74, 10-20 % #a38282, 30-45 % #e48871.

**The day sky has a strong vertical gradient.** It runs from a saturated top (S about .6-.9) to a horizon about 2.4x brighter in linear light and half as saturated.

### Characters' faces and heads

Heads are white bean heads. The proxy is pixels with S < .22 and V > .55 in the character band, rows 12-56 %.

| mode | n | median colour | V p10/p50/p90 | S |
|---|---|---|---|---|
| D | 47 | #d9dcdc | .76 / .89 / .99 | .08 |
| G | 9 | #f4ebdd (warm cream) | .77 / .96 / 1.00 | .09 |
| I | 74 | #e7dbd7 (warm) | .74 / .92 / .99 | .09 |
| N | 11 | **#b2a0a9** (mauve) | .64 / **.70** / .95 | .12 |

Faces stay the brightest object in the frame: p90 V = 1.0 in D, G and I.

- At night faces drop about 25 % and take the scene tint (mauve or blue). The brightest face pixels stay at .95, because a practical or the moon rims them.
- So **characters are lit by the scene's colour, not its intensity**. Their luma stays in the top 10 % of the frame except at night.

## 4. Lighting setups

### Time-of-day modes

| mode | share | key | fill / shadow | practicals |
|---|---|---|---|---|
| **Interior** (49 %) | warm pools | Warm practicals, lamps and windows. Floor light pools under lamps: bright warm oval on the rug, falling off over about 1 head-width. | Rose-brown shadow #3b292e, cool window light | Lamps, screens, slot machines (blue/cyan accents 22 %) |
| **Day** (28 %) | Sun from side or side-back | Warm, neutral highlights #d4d0d4 | Shadows lifted to Y' .19-.37 and rose-grey | none |
| **Night / blue hour** (10 %) | Moon or sky, blue | Overall Y' p50 .37 | Indigo shadow #273165, mids #696eab | Warm windows and lamps, with bloom |
| **Golden** (6 %) | Low sun | Orange-peach highlights #f3cfa8 | Rose-plum shadows #552e38 | Fire and lanterns |

Examples of each mode, from the montages:

- **Interior:** offices in 02, homes in 03, 19 and 20, the casino in 09, the lab in 21, the mine in 22.
- **Day:** fields in 07, 14 and 23; the road in 24; the coaster in 25; the dock in 05.
- **Night:** 03, 12, 15 and 19.
- **Golden:** 01, 11 and 16.

### Character contact shadows

Measured on 16_0, a day street:

- The **soft blob** under the character is **#7c7388** on lit sand **#d6ad7f**.
- Linear lit/shadow per channel is R 3.36, G 2.45, **B 0.87**. The shadow is *bluer than the lit ground*, so it is a painted violet multiply, not a darker copy of the ground.
- The blob is an ellipse about 1.2-1.5x the body width, offset away from the sun, with soft edges.
- 16_0 shows a long shadow streak toward the camera. Full silhouette shadows appear only in low-sun or golden shots.
- Interiors show a warm light pool plus a small dark blob. Night shots show a lit pool under a lamp (19_4/5, 22_0).

### Light sources: bloom

Radial luma profile around the brightest source, in px at 540-wide (×2 for 1080):

| source | r0 | 6 | 12 | 24 | 48 | 96 | 160 |
|---|---|---|---|---|---|---|---|
| moon 04_5 | .95 | .92 | .90 | .76 | .49 | .37 | .31 |
| moon 25_2 | .98 | .95 | .83 | .61 | .47 | .36 | .32 |
| window 19_4 | .92 | .82 | .77 | .74 | .49 | .39 | .26 |
| casino lamp 09_0 | .99 | .99 | .97 | .74 | .57 | .55 | .36 |
| mine lantern 22_4 (#cc9e36 core) | .62 | .53 | .51 | .29 | .18 | .13 | .11 |

The halo falls to half the core-to-background difference at about 40-60 px at 1080, with a long tail out to about 200 px. So: **moderate, wide bloom on emissives only.**

- Threshold: Y' of about .85 in display space.
- In linear space: bloom intensity about 0.6 and mip radius about 0.7.

### Haze with distance

Haze is strong in exteriors.

- 23_0: far mountains are #8fafbb (S .29), against mid-ground greens #3c7040/#6aac46 (S .51-.59).
- 14_2: far fields are #b0c990 (S .31), against foreground #d2e19a.
- 24_1: the horizon band is #c1dbdb → #dee7dc (S .06).
- The far range is mixed **50-65 % toward the horizon colour**.
- Interiors have no visible fog. They rely on depth of field instead (see the depth report).

### Vignette

Corner/centre luma ratio, per-frame median:

| mode | corner/centre | mid-edge/centre |
|---|---|---|
| D | .80 | 1.00 |
| G | .74 | .93 |
| N | **.66** | .89 |
| I | **.60** | .81 |

The vignette is clearly visible in interiors and at night. Part of it is lighting falloff from the pools, and part is a post vignette.

## 5. Lighting changes on story beats

Traced at 0.1-0.25 s against word onsets. Each lighting change **starts on the onset of the word that names it, or 0-0.2 s before it**, and takes 0.4-0.9 s.

| video | words (onset s) | what changes | timing |
|---|---|---|---|
| 19 | "until **sunrise**" (51.90) | Night room #3e3378 → warm sunrise #b98d8f. The floor goes #301e49 → #c8a0a4: sun pours through the window, raking orange. | Ramp starts at 51.90-52.00, exactly on "sunrise"; done by 52.80 (**27 frames**), an ease-in-out |
| 03 | "**At** this point" (30.54) | Warm interior #a07f73 → night blue #2752cd (top #1332d7). A cross-dissolve to the night version of the room. | Starts 30.50 (on "At"); done 30.90 (**12 frames**) |
| 25 | "…" (But 9.72, night 10.20) | Day #6078a9 → night #39415e (dissolve) | Starts 9.70 (on "But"), **0.5 s before "night"**; mostly done by 10.1 |
| 13 | "…" (11.08-11.58), "Now" (11.78) | Light dims to near black: top #4a392b → #0f0809, mean #615046 → #221613. An iris-like dark ring closes in. | Dim 10.8-11.8: starts at "yourself", reaches black at "Now" |
| 21 | "…" (night 43.32) | The interior goes blue: #3e59b2 → #2a3c79 → #132153 top. Then on "forgets" (44.04) the warm-grey room light comes back. | On "night" ±0.1 s |
| 05 | "…" (But 18.10) | A cannon smoke burst fills the frame: luma +0.30 for 7 frames, a white-out acting as a transition | Burst starts 18.00 (0.1 s before "But") |

The other flashes are short luma spikes of 1-10 frames and +0.12 to +0.30. Examples:

- the cannon at 05 1.5 s and 30.2 s;
- the shotgun muzzle at 22 0.73 s ("…");
- 16 44.1 s;
- 18 5.0 s / 51.2 s;
- 01 64.3 s ("train rolls onto").

**All of these land on the action word, ±0.1 s.** Shot-level luma varies a lot: shot mean p10/50/90 = .28/.45/.61. The in-shot luma range is p50 .23, mostly from camera moves between sky and ground.

## 6. Agreement with the bridge skill reports (`grade.md`, `lighting.md`)

**Agrees:**

- The warm lifted black point: #201314 here against (35,19,20) = #231314 there.
- Night darks: here a*/b* +17/−34, there +19.7/−33.1.
- Violet day cast shadows that are bluer than the lit ground: here B ratio .87, there "…".
- Lit/shade ratio of about 2.5-3.4: there 2.8-4.4.
- No large black areas, ink at about 2.2 %, near-white tops, no specular except on metal.
- Faces near white (V .89-.96), tinted at night.

**Differs or is new:**

- **Interiors dominate here (49 %)**, against day in the bridge set. The interior grade is darker:
  - p50 .385, against .448 in the bridge set;
  - stronger vignette, .60 against .67;
  - rose darks.
  We need an `INTERIOR` grade preset, not only DAY and GOLDEN.
- The **day sky top is deeper here**: #3e79cd against #5997e2, a more saturated gradient. Use about #3e79cd to #4a86d6 at the top and #83a7e4 to #c8e0f6 at the horizon.
- Day vignette is slightly stronger: .80 against .86.
- Night is more saturated than any other mode here: S .54, C* p50 37.
- **Lighting changes are word-timed events** (section 5), which neither report covers. This is the key new rule.
- Grain: neither report mentions it. The reference has none, so add none.

## 7. Recipe for three.js (r175) + postprocessing + the grade shader

### Renderer

```ts
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;  // soft shoulder, p98 ≈ .91-.94, no hard clip
renderer.toneMappingExposure = 1.0;               // D/G/I; N 0.85
```

When using EffectComposer, keep `ToneMappingEffect(NEUTRAL)` and put the grade after it (bridge `grade.md` 5B).

### Lights per mode

Colours are sRGB hex. Pass them to `new THREE.Color(hex)`, which converts them to linear.

| | DAY | GOLDEN | NIGHT | INTERIOR |
|---|---|---|---|---|
| Hemisphere sky / ground, intensity | #9cc4f0 / #8a6f7a, 1.4 | #c9a0b0 / #5b4a7a, 1.1 | #3b55b0 / #1a1440, 0.9 | #f2d6c0 / #5a3a44, 1.0 |
| Directional key colour, intensity | #fff1dc, 2.6 | #ffb071, 2.8 | moon #a9b8ff, 0.7 | window #ffe2b8, 1.2 (optional) |
| Key azimuth vs camera, elevation | side-back 50-70°, 35-45° | back 0-40°, 5-15° | side 60-90°, 30° | from the window |
| Practicals | – | fire PointLight #ff9a4a 3.0, decay 2 | window/lamp PointLight #ffb45a 4-6, distance 6 m, decay 2; emissive meshes #ffe6b0 | lamp PointLight #ffc27a 3-5 over each pool + SpotLight cone for floor pools (angle 0.6, penumbra 0.8) |
| Shadow tint (multiply in shadowed area, linear) | (0.30, 0.41, 1.10) → #7c7388 on #d6ad7f sand | (0.35, 0.33, 0.75), violet #514d74 | (0.55, 0.55, 0.8) | (0.55, 0.42, 0.50), rose #3b292e |
| Fog (THREE.Fog colour, near, far) | #c8e0f6, 30, 180 m | #e8a88a, 25, 150 m | #2b3f80, 20, 120 m | none |
| Vignette k, r0 | 0.20, 0.45 | 0.26, 0.40 | 0.34, 0.30 | 0.40, 0.30 |
| Bloom (threshold / intensity / radius) | .9 / .3 / .6 | .85 / .6 / .7 | .8 / .8 / .75 | .85 / .6 / .7 |

Implement the shadow tint as in bridge `lighting.md` 9.2: inside `onBeforeCompile`, `outgoingLight = mix(outgoingLight, outgoingLight*tint + lift, 1.0 - sunVis)`.

**Character card material.**

- Use emissive 0.10-0.15 so heads stay at V ≥ .9 by day.
- Multiply by a scene-tint uniform: D #ffffff, G #fff0dc, I #fff4ee, N #c2b0c6.
- Add a rim from the practical (V .95 on the edge facing the lamp).

**Blob shadow per character.**

- A CircleGeometry ellipse, 1.3x the body width and 0.45x as deep.
- Colour #5a4f7a, opacity .55, radial gradient alpha (soft edge 15 % of the radius).
- Offset 0.2 body widths away from the key.
- At golden, stretch it 3-4x toward the camera.

### Grade shader

Add the targets after tone mapping (bridge `GradeEffect`), with a new **INTERIOR** preset. Targets per mode, measured on the final frame:

| target | D | G | N | I |
|---|---|---|---|---|
| Y' p2 / p50 / p98 | .145/.517/.930 | .150/.535/.939 | .099/.371/.740 | .101/.385/.913 |
| black point (lift colour) | #201314 | #301318 | #100e26 | #1a0c14 |
| shadow tint (Cb, Cr) | warm-rose (−0.02, +0.035) | rose-violet (+0.02, +0.04) | indigo (+0.09, +0.03) | rose (−0.01, +0.035) |
| highlight tint | none | warm (−0.05, +0.03) | none | warm (−0.035, +0.01) |
| saturation sh/mid/hi | 1.0/1.2/1.3 | 0.9/1.0/1.4 | 1.2/1.25/1.0 | 1.0/1.1/1.2 |

Add to `mainImage` before the vignette: `c = max(c, blackPoint)` as a soft lift, i.e.

```glsl
c = blackPoint + c*(1.0 - blackPoint)
```

Never output RGB below about (25, 13, 22)/255 except in a scripted blackout.

No grain pass. No chromatic aberration (none observed).

### Word-timed light changes

Add this to the timeline, mapped to the bridge template's `story.ts` shot entries:

```ts
lightCue: { word: "sunrise", from: "NIGHT", to: "GOLDEN", lead: 0.0, dur: 0.9 }
```

At render time, interpolate every light, fog and grade uniform with `easeInOutCubic` from `wordOnset − lead`.

| cue type | duration | lead |
|---|---|---|
| Mood switch (day ↔ night) | 12-15 frames | 0-0.15 s, or start on the first word of the clause ("At this point", "But the night…") |
| Sunrise / lights-up | 27 frames | 0 |
| Dim-to-black | 20-30 frames | ends on the next sentence onset |
| Muzzle/cannon flash | 2-7 frames | +0.30 luma via an exposure spike or white smoke card, onset −0.1 to 0 s vs the action word; bloom intensity ×3 for those frames |

## 8. Top rules, ranked by impact

1. **Light and mood changes land on the word.** Start on the onset of the naming word, or on the first word of its clause (−0.0 to −0.5 s). Ramps run 12 frames (cut/dissolve) to 27 frames (sunrise); flashes run 2-7 frames at +0.3 luma.
2. **No black.** Lift the black point to rose #1d0e16 (day #201314, night indigo #100e26). Darks are coloured; ink stays at about 2 % of pixels.
3. **Shadows are painted colour, not darkness.**
   - Day: violet #7c7388 on #d6ad7f, with the B channel above the lit ground.
   - Night: indigo #273165.
   - Interior: rose #3b292e.
   - Lit/shade ratio is about 2.5-3.4 in R.
4. **Per-mode grade presets, including INTERIOR**, the most common mode. Y' p50 targets: D .52, G .54, I .39, N .37. p98 is .91-.94, except night at .74.
5. **Heads stay the brightest thing** (V .9-1.0). Only the night tint drops them to about .70 mauve, with a rim from the practical. Add a soft violet blob contact shadow under every character.
6. **Saturated two-pole palette.**
   - Day: orange/wood 27 % against azure 35 %, with a deep sky top #3e79cd fading to a #83a7e4-#c8e0f6 horizon.
   - Interiors: 57 % red and orange.
   - Night: 76 % blue.
7. **Atmosphere.** Distance haze mixes 50-65 % toward the horizon colour in exteriors. Vignette corner/centre is .80 by day and .60-.66 at night or indoors. Use wide bloom on emissives only.
8. **No grain** and no hard clipping. Use a NeutralToneMapping shoulder.
