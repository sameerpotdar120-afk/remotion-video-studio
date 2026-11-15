# World / textures / outlines / depth / composition: 25 reference shorts

Analyst: world. Work folder `/root/proj/refs/work/world/`. Private study: nothing uploaded.
All pixel numbers are at 1080x1920 unless marked otherwise.

## 0. Method and files

- **Frames:** 150 PNG frames, 6 per video at 4, 19.5, 35, 50.5, 66 and 81.5 % of the duration (+0.5 s). They are in `work/world/frames/NN_TTT.t.png`.
  Overview mosaics are `mos_0..4.jpg`. The 1:1 and 2x zoom sheets are `crops/zoom1.png`, `zoom2_ink.png`, `zoom3_1to1.png` and `crops.png` (crowds).
- **Hand labels:** each frame has a shot size (CU / MS incl. full-figure / WS / INS = prop insert with no character as subject / TR = mid-dissolve) and a set (int / ext / abstract). They are in `labels.txt`.
- **`analyze.py` → `data.json`:**
  - Thin dark-run scans in 3 bands (top 0-25 %, mid 25-56 %, low 80-100 %; the caption band 56-80 % is masked).
  - A per-tile (64 px) edge-blur estimate: sigma ≈ tile contrast / (2.507 x 99.5th-percentile gradient). Sharp encoded edges read 0.9-1.1. The true sigma is about sqrt(s² - 1).
  - Band contrast and p2 (haze proxy), and a white-bean-head blob detector for subject position.
- **`fwhm.py`, `inkfrac.py`, `scanpts.py`:** line widths, the share of strong world edges that carry ink (top 22 % band, CU excluded), and 11 hand-placed perpendicular profile scans.
- Saturation and luma come from `measure/NN.json`.
- **Two families.** The 25 refs are NOT one style:
  - **A = videos 01-20:** painted toon world, inked props. These are 120 of the frames.
  - **B = videos 21-25:** the newer "game-engine" look. It has PBR-ish materials, almost no world ink, more haze and bloom, and the same 2D outlined characters. These are 30 frames.
  Both groups have the same saturation (sat 0.48 vs 0.44) and the same mean luma (0.46 vs 0.44). The difference is surface treatment, not grade.
- **Caveat:** the automatic ink and line metrics cannot separate world lines from character and text lines. The per-edge ink share is conservative, because it skips edges whose dark side is already below luma 60. Visual inspection of the zoom sheets backs every claim below.

## 1. How the world is built

| Aspect | A (01-20) | B (21-25) |
|---|---|---|
| Geometry | Low-to-mid poly, chunky. Furniture, chests, signs and barrels are boxes and cylinders with visible small bevels (rounded edges, about 2-4 % of the object's size). Terrain is gently undulating planes. Cliffs (01) are stacked strata slabs | Smoother and more realistic. Real car bodies (24), prison architecture with rails and ceilings (21), coaster track and scaffolds (25), mine timbering (22). Still simple shapes, but more segments |
| Materials | Painted texture: flat colour fields, painted plank/brick/tile lines 3-5 px, stylised 3-tone clouds. Lambert/toon shading with soft sun-shadow shapes. Gold/brass props get a bright specular hotspot plus sparkle stars (09, 11, 13, 17) | PBR-ish: roughness variation, specular cars, rock detail (22), grass-blade fields (23-25), blue sky with painted-style clouds still. Soft shadows, bloom on lights, lens streaks (25) |
| Texture scale | Big flat fields. Line detail every 40-120 px on walls and floors (tiles, planks, brick courses). Signage and printed props (newspapers, lottery tickets, scoreboards) carry most of the fine detail and are readable at 1080 | Fine noise texture (concrete, gravel, grass) at a 2-10 px scale. Blocks of 30-60 px on walls |
| Sets | 69 int / 46 ext / 5 abstract (inside-body, blueprint) | 12 int / 18 ext |
| Prop density | WS interior: about 8-15 distinct props visible (kitchen 03_011.9: lamp, calendar, phone, fridge, counter, door, magnets ...; office 02_021.7: about 12). MS: 3-6 props framing the character. Walls are never bare: there is always a clock, poster, frame, shelf or sign | Similar or a little sparser. Larger repeated elements (cell doors, rails, fences) |

Every video builds 4-6 distinct sets, and the camera returns to 2-3 of them (from the mosaics).

## 2. Ink outlines

### 2.1 Measurements

| Measure | A | B |
|---|---|---|
| Share of strong world edges (top band) with a dark line under 0.6 x the lighter side. Per-frame median (IQR) | **0.08** (0.01-0.21) | **0.04** (0.01-0.17) |
| Per-video median of that share | 0.00-0.38. Highest: 08, 12, 06, 11, 03, 18. Near 0: 07, 13, 15, 16, 19 | 0.01-0.12 |
| Dark-run FWHM, all thin lines in all bands (n = 260k / 94k) | median 4 px (IQR 3-7) | 5 px (4-7) |
| Thin-line core luma (median) | 33 | 33 |

**Hand-placed perpendicular scans (FWHM, core luma, core RGB):**

| Edge | FWHM | Core luma | Core RGB |
|---|---|---|---|
| World prop: clock rim 13_032.4 | 4 px | 47 | (70,38,34) |
| World prop: plinth top 15_033.6 | 4 px | 77 | (78,68,123) |
| World prop: window frame 18_052.1 | 5 px | 60 | (63,53,85) |
| World prop: house eave 19_039.8 | 4 px | 24 | (33,18,29) |
| World prop: banner edge 20_038.6 | 3 px | 153 | (light, dark-tint line) |
| Character outline: 12_023.1 | 6 px | 3 | |
| Character outline: 24_041.6 | 9 px | 0 | |
| Character outline: 10_026.9 | 4 px | 0 | |
| Character outline: 06_002.1 | 3 px | 27 | |

### 2.2 Reading

- **World ink is selective.** It sits on props, furniture, signage, vehicles, machines, windows and door frames, arches, house eaves, banners and bunting.
- **It is mostly absent on big architecture and the ground:** wall-to-wall, wall-to-floor, ceiling grids, terrain, cliffs, water, sky and clouds. In B it is nearly absent everywhere. In the B prison (21) and mine (22) there is no ink at all, and depth is carried by lighting and haze.
- **World line width is about 3-5 px** (FWHM), and it stays roughly constant on screen.
- **World line colour is a dark tint of the surface, not neutral black.** Core luma is 24-77, with brown (70,38,34) on wood and purple-grey (78,68,123) on blue stone.
- **Character outlines are thicker and truly black:** 4-9 px FWHM, core luma 0-27. This is consistent with the bridge figure of 4.6 px.
- **Characters never get a world-ink box,** and world lines never double the character line.

## 3. Depth of field, haze, foreground framing

| Measure | Value |
|---|---|
| Frames with clear defocus (tile-blur p90/p10 > 2.2) | **27 / 150 = 18 %**. A 25/120 (21 %), B 2/30 (7 %) |
| By shot size | CU 2/15 (13 %), MS 9/63 (14 %), WS 8/41 (20 %), INS 7/27 (26 %) |
| Background blur when DOF is on: Gaussian sigma | median **3.5 px** (IQR 2.5-5.5); disc radius ≈ 2 x sigma ≈ **7 px** (5-11) |
| Strongest blur | Foreground sword 06_021.0: sigma about 13 px. Brain insert 08_012.6: 6.7 px. Cars top-down 10_014.5: 9.7 px (tilt-shift look) |
| Focus target | Always the speaking or acting character, or the prop named by the VO word on an insert. No rack-focus seen inside the sampled shots |
| Haze proxy: darkest-pixel lift top band vs mid band (p2 luma) | A 40 vs 32. **B 45 vs 22** (B lifts the far blacks about 2x) |
| Contrast top vs mid band (p98-p2) | A 136 vs 197. B 117 vs 218. The top/far region is about 30-45 % lower in contrast |
| Visible haze or fog | Exteriors with a far skyline: 01, 07, 14, 17, 23 (aerial dust veil over the army), 24 (blue distance). B interiors: volumetric shafts in 21 and 22 (mine light beam), smoke in 24 |
| Foreground framing | About 7 % of frames (10/150): blurred FG prop (06_021.0 sword, 24_032.0 cash, 11_009.7 glass pane, 14_013.0 magnifier lens); FG over-shoulder heads (15_033.6, 23_044.7, 12_023.1); FG streak (25_052.0) |

## 4. Composition

**Shot-size shares (150 frames):**

| Shot | All | A | B |
|---|---|---|---|
| MS (incl. full figure) | **42 %** | 40 % | 50 % |
| WS | **27 %** | 26 % | 33 % |
| INS (prop or mechanism insert) | **18 %** | 20 % | 10 % |
| CU | **10 %** | 11 % | 7 % |
| Mid-dissolve | 3 % | | |

**Subject placement** (white-head detector, matched frames: A n = 54, B n = 11):

| Shot | Head top y, fraction of height | Head centre x | Head width / frame width |
|---|---|---|---|
| CU | 0.35 (0.25-0.41) | 0.45 | 0.22 (up to 0.33) |
| MS | 0.37 (0.22-0.43). B 0.41 | 0.49 (0.32-0.76) | 0.21 (B 0.15) |
| WS | 0.40 (0.29-0.46) | 0.48 | 0.12 |

- **The caption band (0.60-0.74) sits on the subject's torso or belly, or on the floor in front.** Faces are always above it. Faces sit in the 0.22-0.45 zone, so headroom is 22-40 % of the frame.
- **The skyline or horizon** (bottom of the sky region, ext frames with sky, n = 38) is at **y = 0.36** (IQR 0.25-0.43), WS 0.34. So the sky takes the top third and ground or buildings fill the rest. Top-down and high-angle shots put the horizon above 0.15 or out of frame (05_052.3, 12_033.1, 14_013.0, 15_053.9, 21_043.6).
- **Two-shots** place the heads at x ≈ 0.3 and 0.7. Single subjects are centred: the x IQR of 0.32-0.76 comes from two-shots.

## 5. Crowds, armies, machines

- **Crowds are many individually outlined 2D characters, each still with a face down to about 35 px head width** (15_053.9: about 150 people in a ring).
  - Each unit varies hair, hat and outfit colour from a palette of about 10-12 muted pastels plus a few accents.
  - Each casts a consistent soft shadow on the ground.
  - The formation leaves an empty negative-space centre around the subject (hero + button).
- **Armies use one uniform per side,** repeated in tight rows. Examples: grey-helmet block in 23_003.2 (about 300 units); blue spear rows vs red column in 07.
  - **Team colour coding** (red vs blue) makes the sides readable at 10-15 px per unit.
  - **Saturated banners every about 8-12 units stand above the silhouette line:** yellow in 23, red in 07.
  - **Distant ranks dissolve into a white-dot texture under haze.**
  - **A foreground leader at 3-5x scale with one saturated accent gives the scale cue:** red parasol 23_003.2, crowned king 07_016.3.
  - An army behind the hero in an MS (23_044.7) fills the whole background band from y 0.35 to 0.55 as a "…".
- **Queues and lines** recede along a winding path (19_039.8), with every unit unique. Size falloff gives the depth cue.
- **Machines and mechanisms are shown whole.** The whole machine appears at least once in an MS or WS next to a character (scale cue), then the camera cuts or pushes to INS shots of the working part. 18 % of frames are inserts.
  - Examples: 11 "The One" lever board, 13 spotlight chair rig with steel balls, 15 button under glass, 17 happiness gauge, 25 coaster loop, 12 ship.
  - Parts are big, few and bright: brass, gold or red on a darker or complementary background. They carry ink lines (A) and read as a silhouette against a plain background.
  - Moving parts get motion streaks or sparkle stars (25_052.0 coaster streak, 23_055.0 arrow volley as radial gold streaks).

## 6. three.js / Remotion rules (map to the bridge template)

### Geometry (`templates/bridge` set builders)

- **Props:** `RoundedBoxGeometry` (three/examples/jsm/geometries/RoundedBoxGeometry.js), radius = 3 % of the smallest dimension, segments = 2. Cylinders use 16-24 radial segments. No sharp 90° unbevelled boxes on hero props.
- **Big architecture and ground:** plain boxes and planes are fine. Terrain is a PlaneGeometry 64x64 with ±2-5 % height noise.
- **Dress every set to these counts:**
  - WS interior: ≥ 8 distinct props.
  - MS: ≥ 3 props visible behind or around the subject.
  - Each wall: ≥ 1 hung object (clock, poster, sign, frame).
  - Text props (signs, papers, gauges) should be legible at 1080: cap height ≥ 28 px.

### Materials

- **Default (family A, recommended for our mascot style):** `MeshLambertMaterial`, or `MeshToonMaterial` with a 3-step ramp. Use a `CanvasTexture` with flat fields and painted lines 3-5 px wide (at final screen scale), in the surface hue at about 45 % luma.
- **Metals:** brass and gold props use `MeshStandardMaterial` metalness 0.7, roughness 0.3, plus an env map (a `RoomEnvironment` PMREM is enough) so they get a hot specular. Add 2-3 four-point sparkle sprites on emphasis words.
- **Family B (optional for "real-world" topics, such as cars or infrastructure):** `MeshStandardMaterial` roughness 0.6-0.9 with a noise normalMap at 0.3, bloom threshold 0.85 on lamps and headlights, and no world ink.

### Ink pass (replaces the bridge outline recipe's "ink everything")

- **Put inkable objects on a layer:** `obj.layers.enable(INK_LAYER)` for props, furniture, signage, vehicles, machines, window and door frames, eaves and banners. **Never** ink walls, floors, ceilings, terrain, water, sky or clouds.
- **Render a normal + depth + objectId target** for the INK layer only. Sobel on depth (threshold 1-2 % of linear depth), normal (dot < 0.8) and objectId change.
- **Line width:** 3 px at 1080, constant on screen (do not scale with distance). Fade to 2 px and lighten 30 % beyond 3x the subject distance.
- **Colour:** do not use pure black. Use `ink = surfaceColor * 0.28` (resulting luma about 25-60), clamped to at most `#3a2a2a` luminance. A wood line should come out about `#46261f` and a blue-stone line about `#4e447b`.
- **Apply the ink before DOF and fog** in the composer, so lens blur and haze soften far lines. This is the fix the bridge outlines report already names.
- **Characters (Canvas2D cards):** keep their own outline at 5-6 px, pure `#000` to `#1a1a1a`. That is 1.5-2x the world line. This width contrast is what separates characters from the world.

### Lens blur

- **Turn DOF on in about 20 % of shots,** chosen from:
  - WS establishing shots with a mid-ground subject;
  - inserts on a prop (26 % of inserts);
  - shots with a foreground framing object.
- **Keep CUs mostly sharp:** about 13 % of CUs.
- **Background:** Gaussian sigma 3.5 px (2.5-5.5), so the CoC disc radius is about 7 px at 1080. Map it with `sigma = clamp(K * |1/z - 1/zFocus|, 0, 6)`, with K solved so that objects at 3x the focus distance reach 3.5 px.
- **Foreground framing objects:** sigma 8-13 px (cap 14).
- **Implementation:** do not use `postprocessing`'s DepthOfFieldEffect with a small bokehScale, because it caps blur at about 2 px (bridge depth.md). Use a two-pass separable Gaussian on CoC, or bokehScale ≥ 7.
- **Tilt-shift top-down shots** (10_014.5 style): blur top and bottom 25 % of the frame by sigma 6-10 px.

### Fog / haze

- **Exteriors:** `scene.fog = new THREE.Fog(horizonSkyHex, 1.5 * dSubject, 8 * dSubject)`. The far skyline should lose 30-45 % contrast and its darkest pixels should be lifted to luma about 40-45 (of 255). This is the measured top-band p2.
- **B-style or dramatic interiors:** use `FogExp2`, density chosen so luma at 20 m is about 0.6 fog. Add 1-2 additive light-shaft cones (opacity 0.12-0.2) from windows or lamps.
- **Army or crowd wides:** add a dust or haze sprite band along the far ranks (opacity 0.4-0.6) so distant units read as a texture.

### Composition (camera rigs)

- **Shot plan per 60 s video:** MS 40-50 %, WS 25-30 %, INS 15-20 %, CU about 10 %. About 55 % interiors.
- **Head top:** CU y 0.25-0.35, MS 0.33-0.40, WS 0.38-0.46. Head centre x 0.45-0.50 for a single subject, and 0.30 / 0.70 for a two-shot.
- **Keep faces and key mechanism parts out of y 0.56-0.80** (the caption band). The caption should overlay the torso, the floor or a table edge.
- **Skyline at y 0.30-0.43** for eye-level exteriors. Go top-down or high-angle (horizon < 0.15) for crowds, maps and layouts.

### Crowds and mechanisms

- **Crowd units:** `InstancedMesh` of card planes with an atlas of 10-12 outfit and hair variants. Each unit is outlined and has a face down to a head width of about 35 px. Under 15 px, switch to a dot-sprite impostor.
  - Add a blob contact shadow per unit (radial texture, opacity 0.35, offset along the sun direction).
  - Formations: rows, ring or queue, with an empty centre around the subject.
- **Armies:**
  - One uniform colour per side, with the sides colour-contrasted (red vs blue, or grey vs gold).
  - A banner pole every 8-12 units, rising 1.5x a unit's height above the crowd line, saturated hue.
  - A foreground leader at 3-5x screen scale with one saturated accent prop.
- **Mechanisms:**
  - Build the whole machine. Show it whole in a WS or MS next to a character before any insert.
  - Use 3-6 large parts, bright metal or saturated paint against a contrasting background, with world ink on every part edge.
  - Inserts frame the one moving part, centred in y 0.25-0.50.
  - Projectiles or moving parts get streak trails, never just a translated mesh. This addresses our "…" failure: the trajectory and the whole launcher are on screen in one WS first.

## 7. Agreement / disagreement with the bridge skill reports

| Bridge report claim | These 25 refs |
|---|---|
| outlines.md: 74 % of geometry edges carry a line, neutral near-black `#0b0a0c`, about 3 px | **DISAGREE in part.** Width agrees (3-5 px). But ink is selective: on props and objects, not on walls, floors or terrain (auto share 8 % in A, 4 % in B on strong edges). The colour is a dark tint of the surface (luma 24-77, brown or purple), not neutral black. Family B has almost no world ink |
| outlines.md: character outline about 4.6 px, black | Agree: 4-9 px, core luma 0-27 |
| outlines.md: constant on-screen width | Agree |
| depth.md: DOF on about 1/3 of shots, strongest in CU (sigma720 4.2) | **DISAGREE.** DOF in 18 % of frames, and least in CU (13 %). The most DOF is on inserts and wides. Blur size agrees: 3.5 px @1080 ≈ sigma720 2.3 |
| depth.md: foreground objects in 20 % of frames | Lower here: about 7 % |
| depth.md: aerial perspective, far things toward the horizon colour | Agree. B is stronger (far black lift about 2x) |
| depth.md: head top CU 0.28 / MS 0.35 / FS 0.38 / WS 0.50, horizon 0.45 | Close for head tops (0.35 / 0.37 / 0.40). The skyline is higher here (0.36 median), because sets are more enclosed (buildings and hills) |
| textures.md: flat colour fields, 3-5 px painted lines, bright and saturated | Agree for A. Family B uses noisier, PBR-ish textures at the same saturation |

## 8. Top rules ranked by impact

1. **Selective, tinted world ink** (props, machines, signage only; 3 px; surface x 0.28) against **thicker pure-black 5-6 px character outlines**. This is the core "…" read.
2. **Build mechanisms whole and show them whole first** (WS or MS with a character for scale), then inserts on the moving part. 18 % of shots are inserts. Use streaks for projectiles.
3. **Armies and crowds:** one colour per side, banners every 8-12 units, a foreground leader at 3-5x scale, haze-dissolved far ranks, and per-unit faces and contact shadows down to a 35 px head.
4. **Composition:** faces at y 0.22-0.45, caption band over torsos, skyline at about 0.36. Shot mix MS 42 / WS 27 / INS 18 / CU 10.
5. **Dense set dressing:** at least 8 props in WS interiors, every wall hung, bevelled chunky props, painted flat-field textures, and brass props with real specular plus sparkles.
6. **DOF on about 20 % of shots** (wides and inserts), background sigma 3.5 px (radius about 7 px), foreground framing sigma 8-13 px. Never capped at 2 px. Ink before DOF.
7. **Fog on every exterior,** tuned so the far skyline loses 30-45 % contrast and its blacks lift to luma about 40-45. Light-shaft haze for dramatic interiors.
