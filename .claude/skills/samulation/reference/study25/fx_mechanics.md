# Effects, physics and mechanisms: how the 25 references make cause and effect readable

Scope: every effect type, how machines and projectiles are staged, how crowds react, and transitions built from effects.
Sources:
- Contact sheets for 05 (s01, s02, s04, s05, s12, s17, s18, s22, s23, s27, s29, s31), 23 (s19, s20, s23, s26-s28, s30-s34), 22 (s01, s02, s27, s28), 24 s02, 25 (s26, s31), 12 (s28, s32), 13 s09, 04 s27, 01 s31, 09 s09, 11 s03.
- Full-resolution frame tiles in `work/fx/m/`.
- An automatic scan of all 25 videos at 180x320 (`work/fx/scan.py` → `scan/NN.json`). Per frame it measures the fire-pixel fraction (hue 15-58°, S > .55, V > .75) and the near-white fraction, with the caption band masked.
- Event detection (`work/fx/events.py`), explosion colour and area tracking (`work/fx/expl.py`) and `measure/NN.json` (lm, cut, cam).

All pixel sizes are at 1080x1920. Frame numbers (f) are at 30 fps. "Word" means the whisper word onset, which can be off by ±2 f.

---

## 0. The diagnosis in one paragraph (why our last video failed)

The references never ask the viewer to infer geometry. Each physical event is cut into 3 to 5 readable beats:
1. **Source**: the whole machine is visible.
2. **Release**: a flash or smoke puff at the muzzle.
3. **Flight**: the camera rides with the projectile, or the target is in the same frame.
4. **Contact**: a 2-6 f "anticipation" on the target, such as cracks or a hold.
5. **Result**: a big effect that fills 25-100 % of the frame, then a consequence or reaction shot.

The landing point is always placed relative to an unambiguous foreground landmark. In 23 the parapet of our own wall is in the bottom 15 % of frame, with the explosion clearly beyond it. Our "…" problem came from showing flight and impact from a camera that could not tell near from far. Our "half a cannon" problem was a cropped source: the references show the whole gun, including barrel, carriage, wheels and the crew beside it, before they ever go close.

---

## 1. Effect catalogue (measured)

Two rendering families exist. Pick ONE per video and keep it:
- **A. Cel/ink FX**: 3D-ish toon-shaded blobs with a dark ink edge. Used in 05, 12 and 13, and in the pirate and storm videos.
- **B. Soft painterly volumetric FX**: no outline, ragged billows, bloom. Used in 22, 23, 25 and 24 (the more "rendered" worlds).

Our bridge look (ink world, plum-ink cards) matches family A.

| Effect | Where seen | Build | Size (px @1080 w) | Duration | Colours (measured) | Timing vs word |
|---|---|---|---|---|---|---|
| **Muzzle flash** | 05 f39-41, 05 f1336, 22 f58-59 | 2D spiky star (4-8 points) plus a round core; 22 uses a white 4-point star | 05: 240 px (22 % W) at onset, then becomes a cloud. 22: ~500 px star (fills the gunner's chest) | star 1-2 f, then hands over to a fire cloud or smoke | core #fff6c8, star rim #ffd23c, outer #ff9a2a | **2-5 f before** the noun ("cannonball" f44 → flash f39; "spat" f1338 → f1336) |
| **Fire cloud / explosion (A)** | 05 f1824-1895, 12 f1903-1930 | 6-12 cel spheres (cumulus), 3-tone toon plus a dark ink edge, debris inside, radial white speed lines in the sky | grows from 1 blob (~300 px) to **100 % frame width in 3 f** (f1824→1827), top at y≈26 % H | fire 35 f, then smoke ≥ 70 f (still there at cut) | onset cream #f1d1a4/#e6bd63 (f0), then a ramp every 3 f: #ffca5f, #ffbe48, #ffae3a, #ff9e33, #ff8d2f, #ff812d, #ff7b2c, #e06e22, #c16b29; smoke #442a1f → #33231f; ink edge #6f340a | cracks on "iron" f1819; the fireball's first frame (cream) at f1824 = **1 f before** "warship" f1825 |
| **Fire cloud (B)** | 23 f1937-2000, 25 f1832-1860 | ragged volumetric billows, white-hot core, no outline, dark crown later | 23: 85 % W, from y 3 % to 87 % H. 25: 12 f to 45 % W | 60+ f, held behind the closing character | 23: #f2a24b → #faa448 → #f28218 → #db6617 → #ca5716 (every 8 f); white ring/shock donut #fff2dc | 25: +4 f after "hits". 23: chain of hits on "packed" / "tight" |
| **Smoke puff (muzzle)** | 05 f33 (touch-hole wisp), 05 f1340-1400 | white cel cumulus, grey crescent shadows, thin outline | 150-250 px, drifts 3-5 px/f downwind | 40-60 f linger | #fbf8f2 / #eee9e6 / shadow #ddd7d2, #cfcac8 | wisp 8 f before the shot (fuse), puff on the shot |
| **Broadside smoke bank** | 05 s04 (Navy ship firing) | row of 10-15 white cumulus spheres along the hull | 70 % of ship length | > 60 f | same whites | covers the ship on "shot" |
| **Splinter burst** | 05 f69 (hull), f199 (pirate wall) | radial "hedgehog" of 30-60 brown spikes at the hole, plus 100-200 thin tan stick particles flying out and tumbling, plus 8-15 beige dust puffs | hedgehog 250-350 px. Sticks 30-90 px long × 4-8 px. Puffs 60-100 px | burst 2 f to full; sticks fly and fall for **60-90 f** while the camera trucks along | spikes #5a3a1e-#8a5a2e, sticks #e8c38a, dust #e9dcc0 | hole opens 1 f before "actually" / at "smash" |
| **Crack anticipation** | 05 f66-68 (3 f embedded ball), f1816-1823 (glowing cracks across the hull) | 2D crack lines on the surface, growing; glowing white-yellow cracks for the big one | lines reach 70 % W in 6 f | 3-8 f **hold before** the burst | crack glow #fff1b0 | the burst lands on the noun. The cracks occupy the previous word |
| **Debris (big)** | 05 f1825-1880 | 3D planks, funnel and metal plates, launched up and tumbling slowly | planks 150-300 px, funnel 120 px | rise 15 f, hang, fall over 40+ f (low gravity, ~0.5 g feel) | planks #b06a32, plates #555c66 | with the fireball |
| **Rock chips + dust** | 22 f94-120 (nugget hits rock) | 10-15 grey chips, small gold burst, then a beige dust plume drifting sideways | chips 8-20 px, plume 400 px wide | 30 f | dust #d8b48a α .5 | 4 f before "mine" |
| **Dust wall (transition)** | 22 f1668-1690 | volumetric dust rolls toward the lens, fills the frame | 100 % | in 10 f, solid 5 f, out 6 f | #c8955f-#e2b47c | "the dust clears" literally |
| **Splash / water** | 05 f1810 (V-wake bubbles under the ball), 12 f1903 (wave hits ship) | white-lavender cel cumulus (same rig as the fire clouds, re-coloured); bubble-dot wake arcs | wake: 2 arcs of 10-15 dots of 12-25 px. Splash cloud 400 px | splash 10 f, then explosion | #d5d1fb / #888fed / shadow #202687 (night grade) | f1903 vs "onto" f1900 |
| **Sparks** | 01 f1856 (rails), 22 dynamite fuse, 23 fuse, 05 f1562 (iron bounce stars) | additive dots/streaks, 2-6 px wide, 10-40 px streaks; star-shaped glints 30-40 px for ricochets | 15-40 per burst | 6-15 f life | #ffd27a core, #ff9a3c tail; glint #fff8d0 | rails: +5-8 f after "kicks" (deform first, sparks after) |
| **Fuse spark (travelling)** | 23 f1528-1563, 22 dynamite | 1 HDR dot (60-80 px with bloom) that runs along the rope; splits into 82 dots at the fork | runs ~6-10 px/f in screen space; camera dollies with it | 35 f along the rope, then a 20 f "split" fan | #fff6d8 core, bloom #ffc04a | starts on "spark" f1521, splits on "splits" f1564 |
| **Glow from within** | 05 f576-610 (ship "…"), 05 s12 (red-hot balls) | emissive ramp on seams, windows and gun ports, plus bloom; balls lerp #2a2a2a → #ff7a2a | whole hull | **ramp 20-30 f**, starting on "lit"/"up" and finishing on "inside" | #ffb347 emissive ×3 | slow ramp, not a pop |
| **Time-lapse grade** | 05 f1020-1080 ("…") | sky and sea grade lerp day → dusk in the same locked shot | full frame | 40 f | sky #8fc2e8 → #6a3f8c | on "later" |
| **Speed lines** | 05 f54-64 (ball follow-cam), 05 f1826-1840 (explosion sky) | thin white streaks radiating from the vanishing point / blast centre | 2-4 px × 150-500 px, 20-40 lines, α .4-.7 | while the follow-cam runs; 15 f at the blast | #ffffff α .5 | on with the motion |
| **Shock rings** | 22 f60-95 (nugget flight), 13 f483-540 (sound) | thin transparent rings: around a flying object, or concentric arcs expanding from a sound source | 22: 200-300 px ring re-spawned every ~8 f. 13: 3-4 arcs, 4 px stroke, expanding ~12 px/f to 900 px | ring life 12-20 f | white α .35-.6 | sound arcs start on "smash" |
| **Impact star** | 05 f100 (ball hits mug), 12 f1910 | 2D 8-12-point white/yellow star with a dark centre, 1-2 f | 90-150 px | **2 f** | #ffffff / #ffe066 | on the hit word |
| **Energy / "where" highlight** | 25 s26 (glowing track section = hairpin), 12 (glowing golden oil slick on the sea), 13 (yellow nerve signal up the spine), 01 (hot glowing rails) | an emissive ribbon on the 3D part itself, with a sparkle stream along it | follows the geometry, 15-30 px wide | holds while explained (60-120 f) | #fff2b0 core, #ffb84a glow | on the noun that names the part |
| **X-ray / cutaway** | 13 (translucent cyan body, opaque brain and nerves), 08 (body-as-house), 09 (slot machine front swings open), 04 (pendulum inside the jar) | translucent shell α .55 with an ink outline and opaque organs; OR a literal hinge-open door / camera passing through the shell | full figure | the whole explanation | shell #4fb6e8 α .55, ink #1d3b5a | open on "open"/"inside" (09: the door swings in 4 f, f524→528) |
| **Numbers / money** | 11 f120-129 (bank LED billboard counts $1,003,911 → $2,000,000), 22, 14 | **diegetic only**: a counter on an in-world sign or object, ticking every frame | sign ~35 % W | count-up 9 f, landing on the number word (+4 f) | LED #ffb000 on #2a1a10 | the counter **lands** on the word |
| Arrows / labels / floating text / music notes | none found in the 12 videos sampled | — | — | — | — | the captions are the only text. Explanation is done with highlight glows, cutaways and literal props |

Fire-scan census across all 25 videos: big (> 15 % frame) fire events happen in only 9/25 videos (01, 05, 12, 14, 17, 18, 20, 22, 23), mostly once or twice each. **One hero explosion per video, placed in the climax 75-95 % through the runtime** (05 f1824/1905, 23 f1937/2010, 25 f1832/1890, 12 f1903/1930, 22 f1650/1833). Whole-frame white flashes are rare: 3 in 25 videos, and two of those are smoke wipes (§5). There is no generic "…".

---

## 2. Projectiles and trajectories: how they stay readable

Measured staging patterns (each one used at least twice):

1. **Show the whole weapon first.**
   - 05 f0-30: the full cannon (barrel, carriage, wheels, rammer) with 2 crew. The camera starts behind and above the breech, 3/4 view.
   - 05 f1680 (Rodman): the whole gun, plus a tripod hoist lifting the ball, with a crew member for scale.
   - 23: the whole cart with its 82 tubes is shown 4 times before launch.
   - 22: the shotgun is broken open and both barrels are loaded in 3 inserts (f60-110).
   - Rule: the source machine is ≥ 60 % visible and ≥ 35 % of the frame width the first time. Close-ups come after.
2. **Fire along the barrel axis.** Camera behind the breech, 0.5-1.5 m above the barrel, lens pointed down the bore toward the target. Target ship visible on the horizon in the SAME frame (05 f30-45: the ship is 70 px tall at y 22 % H). The camera dollies forward along the barrel (~8 % frame scale per frame during f44-54) and passes through the muzzle cloud.
3. **Ride the projectile (follow-cam).**
   - Ball locked at x≈.42-.50, y≈.50-.57 of the frame, 90-160 px diameter. The target grows behind it over 10-14 f.
   - Speed lines radiate from the ball (05 f54-64), or a glowing tracer tail plus shock rings follow it (22 f60-95).
   - A bystander passes the camera mid-flight as a speed/scale marker (22: the buddy on a stool).
4. **Release the camera 4-6 f before contact.** The camera stops; the ball keeps going and shrinks into the target:
   - 05 f1808-1815: 160 → 10 px in 6 f.
   - 22 f90-94: the nugget shrinks into the wall.
   - The contact point is then a known spot in a static frame. Never cut on contact.
5. **Contact anticipation, then result.**
   - Embedded ball plus cracks, held 3 f (05 f66-68), then the burst.
   - Or glowing cracks spreading for 6 f (05 f1818-1823), then the fireball on the noun.
6. **Arc readability for volleys (23).** Rockets launch from the cart on the wall walk:
   - The camera sits at the cart's side, then follows the smoke over the parapet (f1830-1850).
   - Next is a HIGH wide shot: the plain and the enemy army (a dense band at 70-85 % H) are in frame, and the white trails cross from the upper-left foreground down toward the army. The trails droop and curl at their ends (gravity reads), are 15-40 px thick, are white #f4f1ea, and persist for 100+ f.
   - Impacts are shown from **on top of our wall**: the parapet and the enemy's ladder hooks fill the bottom 12-18 % of the frame, and the army band sits beyond it at y≈55-60 % H.
   - Hits ripple along the army line left→right as 10-12 small puffs of 60-90 px over 12 f (f1937-1950). They merge into a band, then one big central fireball that grows for 30 f while the camera pushes in (zoom +1.6-3.4 %/f, tilt up 12-25 px/f, measured f1966-1975).
   - **The wall is always between the camera and the impact, at the bottom of the frame.**
7. **Ricochet as proof (05 s27, iron hull).** 4 burning balls hit an iron wall. Each one is a 30-40 px yellow glint star that bounces off and slides down and away over 20 f, then a small white fizzle cloud in the water. No explosion: the *absence* of the effect is the point.
8. **Bystander in the line of fire for scale.** The pirate in front of the wall is hit by splinters (05 f199). The army is "…" (23).

Cause→effect timing summary (frames relative to the word that names the effect):

| Beat | Offset |
|---|---|
| fuse/touch-hole wisp | −8 to −12 f |
| muzzle flash | −2 to −5 f |
| follow-cam flight | 10-14 f |
| camera release before contact | −4 to −6 f |
| crack hold | 3-8 f, on the previous word |
| burst/fireball first frame | −1 to 0 f |
| peak area | +3 f |
| fire → smoke | +30 to +35 f |
| reaction cut | +25 to +40 f |
| explosion on the far object (25) | +4 f |

---

## 3. Mechanisms: how a machine is explained

- **Step-by-step inserts, one action per word.**
  - 22 loading: barrel breaks open on "loaded", nugget in on "gold", closes on "and".
  - 23: drill → bolt → tube → string → rope, one shot each.
  - 04: pendulum → rod → jaw → ball.
  - Each insert is 20-40 f, the camera pushes 0.3-0.6 %/f, and the part being named is centred.
- **Follow the energy path with the camera.**
  - 23: one 90-f continuous dolly follows the spark up the rope to the fork, then the fan of 82 strings fills the frame, then a pull back.
  - 04: the camera descends into the jar from top-down to low angle as the pendulum swings (f1560-1620).
  - The viewer always tracks a single bright thing.
- **Highlight, don't label.** The part that matters glows:
  - 25: a glowing stream along the hairpin section of track.
  - 12: a golden oil ribbon on the sea.
  - 13: a yellow nerve signal.
  - 01: the rails glow orange-hot, then buckle.
  - Glow strength: emissive ≈ ×3 with bloom, a 15-30 px core.
- **Cutaway = physical opening or a translucent shell.**
  - 09: the slot machine's front panel swings open on "open" (4 f), then the camera pushes into the reels.
  - 13: the body becomes cyan glass (α≈.55) with opaque organs.
  - The camera can also pass through the shell (05 through the hole in the hull; 04 into the jar).
- **Cause and consequence in one frame when possible.**
  - 01: the train is in the same shot as the rails that kick sideways. The rails deform 5 f after "kicks", then sparks, with the camera locked.
  - 25: the explosion at the bottom of the loop is seen past the hero's cart.
- **Before/after with the same framing.**
  - 05: a locked shot of the ship while the sky goes from day to dusk ("…"), then the ship glows from inside.
  - 22: the dust wipe reveals the same wall with a gold vein.
- **Slow motion is not used as a speed effect.** Debris hangs (low gravity, ~0.5 g) and smoke lingers, but no ramped slo-mo was measured. Readability comes from holds and camera releases instead.

---

## 4. Crowds and armies under impact

| Case | Who moves | How far / how | Timing |
|---|---|---|---|
| 05 pirate at the hull (hero-scale, 1 figure) | the nearest figure only | arms up, gritted-teeth face swap, leans back 10-15°, no displacement | face swap 1-2 f **before** impact (f197 vs f199). Holds the pose for 60 f while the splinters pass |
| 05 deck crew after the splinter storm | 2-3 figures | cowering, one walks off; others squint | face changes on the next words ("storm", "splinters") |
| 05 gun crew at firing | 2 gunners | squint/grimace on the flash, no recoil step | grimace from −6 f |
| 12 pirate ship under the wave | 6-10 tiny figures (20-30 px) | ejected from the explosion in arcs, land in the sea as bobbing heads with small white splashes | ejected +12 to +25 f after the splash, landing over 20 f |
| 05 Rodman aftermath | 2 survivors in a barrel | cut to them floating in front of the smoke column | +55 f after the fireball |
| 23 enemy army hit by rockets | **nobody animates individually** | the dense band (hundreds of instanced figures) is simply engulfed by the puff chain and fireball | puffs ripple along the line at ~1 puff/f |
| 23 "closer and closer" | 1 enemy | climbs up over the parapet into a medium close-up in 8 f, grinning | lands on "closer" |
| 24 car crash | the driver behind | shocked eyes, face swap | +8 to +18 f after impact, after the cut to the close-up |

Rules:
1. Reactions belong to 1-3 readable faces near the camera. Swap the expression 0-2 f before impact for the target, and on the next word for bystanders.
2. Distant masses are never animated as individuals at impact. They are covered by FX, and the story jumps to aftermath figures (survivors, smug hero).
3. Ejected figures are small (2-3 % of frame height) and follow ballistic arcs: up 60-120 px, then down over 20-25 f.

---

## 5. Transitions built from effects

| Transition | Example | Frames | Recipe |
|---|---|---|---|
| **Smoke wipe** | 05 f539-548, 05 f1790-1800 | cover 2 f (lm .60 → .88), hold 3-4 f solid, tear open 3-4 f (lm .82 → .50) = **9-11 f** | the cel cumulus from the muzzle balloons toward the lens; the cut happens hidden in the hold; the cloud tears away to reveal the new place |
| **Dust wall** | 22 f1668-1690 | in 10 f, solid 5 f, out 6 f | volumetric dust rolls to the camera; the reveal is the "after" |
| **Through the explosion** | 05 f44-60 | 16 f | camera dollies along the barrel into the orange muzzle cloud (fills 100 %), comes out riding the ball |
| **Through the hole** | 05 f69-74 | 5 f | burst, then the camera flies through the splintered hole into the cabin |
| **Follow the object** | 23 spark (90 f), 22 nugget (35 f), 22 dynamite (50 f, bouncing off the cart) | — | the object stays near screen centre; the cut/whip happens when it leaves |
| **Whip/smear crossfade** | 09 f485-490 | 5-6 f | motion-blurred streak crossfade between two angles of the same place |
| **Iris/lens zoom** | 10 f221-226 | 5 f | the subject sits in a circular lens mask that grows to full frame (white surround #f4f2ee, ink ring ~60 px) |
| **Time crossfade** | 23 f1100-1110 ("next morning"), f1180-1186, f1376-1382 | 6-10 f | plain dissolve, always on a time/place change |

The fire scan never finds a whole-frame flash between shots. Flashes are always a diegetic cloud or dust. **Replace our `FLASH_AT` white flash with a smoke wipe.**

---

## 6. Camera behaviour on impacts (measured `cam`)

- **Car crash (24 f84-97): the camera is static.** |dx|,|dy| ≤ 2 px/f and zoom drifts 0.3 → 0 %/f. No shake. Then a hard cut to a closer angle 13 f after impact.
- **Big explosion (23 f1964-1975): push-in plus tilt-up**, zoom +1.4-3.4 %/f and dy −12 to −25 px/f for ≥ 12 f. No sign-flipping.
- **Distant explosion (25): a continuous slow pan is kept** (dx 6-15 px/f), then a cut to an over-the-shoulder reaction.
- **Hull burst (05 f197-210): chaotic large motion (36-51 px/f, zoom ±5-8 %/f).** This is the camera charging through the hole (a move, not shake).
- So the frame-alternating "kick" from the bridge report (motion.md, v14 spear) is correct only for **hand-scale contact hits** (spear on shield, hammer). For explosions and crashes, the references use a **push-in** (1.5-3 %/f for 10-15 f) or nothing.

---

## 7. Implementation rules for three.js + Remotion + Canvas2D (modest compute)

### 7.1 Fire/smoke cloud rig (family A, matches our ink look). This replaces `fxBurst` for big blasts (`cast.ts`).
- **Geometry.** 8-14 `SphereGeometry(1, 16, 12)` instanced puffs (one InstancedMesh, ≤ 40 instances per blast). Each puff is a radial jitter around the centre: r ∈ [0.35, 0.6]·R, spread on the upper hemisphere plus a ground ring.
- **Shading.** Custom toon shader with 3 bands on N·L:
  - thresholds .65 / .25; light, mid and shadow colours from §1;
  - an ink rim where N·V < .28, colour #6f340a for fire and #8a8580 for white smoke, ~4 px at 1080 (scale by H/1920).
  - Put it on the INK layer only if the ink pass reproduces this. Otherwise draw the rim in-shader and use `NOINK`.
- **Timeline** (t in frames from onset f0 = word − 1):
  - scale `R(t) = Rmax·(1 − (1 − min(t/3, 1))^3)` for the core puffs. Outer puffs are delayed 1-2 f each.
  - `Rmax` = 0.5 × frame-width-at-depth: **the blast fills 85-100 % of W at its peak**.
  - Colour: a ramp through the 9-step palette, one step per 3-4 f (`#f1d1a4` f0 → `#ffca5f` f1 → … → `#c16b29` f30), then lerp to smoke `#442a1f` (f30-45) → `#33231f`.
  - Rise: the crown moves up at 0.6 %H/f and the stem narrows (mushroom). Hold ≥ 70 f, or until the cut.
  - Base ring: 15-25 small white puffs (#fbf8f2) at the ground/water line, appearing at f+6.
- **Sky speed lines.** Canvas2D overlay of 24-32 radial white strokes from the blast centre, 3 px, α .5, for f0-f15. Fade out over the last 5 f.
- **Grade bump.** Lerp `grade.ts` warmth +.08 and exposure +6 % over f0-f3, decaying by f20 (reference lm .63 → .75 → .61).
- **Debris.** 10-20 instanced boxes/planks launched with vy = 0.08-0.14 H/s, gravity 0.5 g, spin 4-10 rad/s, fading out at f60.

### 7.2 Muzzle and fuse
- **Flash.** A Canvas2D star card on `NOINK`, 6-8 points: outer radius 240 px / inner 110 px, core #fff6c8, rim #ffd23c, emissive ×3. It shows for **2 f** at word −3, then hands over to the cloud rig with Rmax ≈ 0.25 W.
- **Smoke puff.** 5-7 white cel spheres, 150-250 px, drifting 4 px/f downwind, α fading over the last 15 of 50 f.
- **Fuse spark.** One additive sprite of 24 px with an HDR value of ×8 (bloom makes it 60-80 px), plus 6 trailing sparks of 2-4 px with a 6-10 f life. Speed ≤ 10 px/f in screen space, so the camera can follow.

### 7.3 Projectile shots (`story.ts` CAMS). Make every launch exactly this five-shot block:
1. **Source wide**, 30-45 f: the whole launcher ≥ 35 % W, crew visible, target visible in the same frame if at all possible (the target at 5-10 % H on the horizon).
2. **Breech cam**, 10-15 f: camera 1 m behind and above the bore, dolly forward ~8 %/f; muzzle flash at word −3.
3. **Ride**, 10-14 f: projectile parented to the camera at screen (.46, .54), 90-160 px; speed lines or a tracer plus a shock ring every 8 f; the target grows.
4. **Release**, 4-6 f: freeze the camera; the projectile continues to its contact point and shrinks to ~10 px.
5. **Contact**: crack lines 3-8 f (Canvas2D decal on the target, glowing #fff1b0 for the big one), then the cloud rig on the noun (−1 f).

For volleys or arcs (rockets, arrows, catapults):
- Use a high wide shot with **both** the launch edge and the target band in frame.
- Trails are a `TubeGeometry` grown along a quadratic Bezier (apex 20-30 % above the chord), 15-40 px thick, #f4f1ea, with 1-2 sag noise near the end.
- Then put the impact shot **on top of our wall**: the parapet mesh fills the bottom 12-18 % of the frame and the army band sits at y 55-60 %. Hits run as a left→right chain of 10-12 small clouds (Rmax 60-90 px), one every 1-1.2 f, then one big rig at the centre.
- Camera push-in +2 %/f and tilt-up 15 px/f for 12 f.
- Never show a landing from a camera that has the wall behind the impact.

### 7.4 Splinters and hole (wood impact)
- Hedgehog: a Canvas2D card of 40 radial spikes (#5a3a1e-#8a5a2e), 300 px, alpha-punched hole showing what is behind.
- 120 instanced thin boxes (0.02 × 0.02 × 0.25 m), #e8c38a, radial initial velocity 6-10 m/s, gravity 0.5 g, tumbling, living 60-90 f.
- 10 beige puffs (#e9dcc0).
- Cost: one InstancedMesh per type, so it is cheap.

### 7.5 Explanation devices
- Highlight glow: duplicate the relevant mesh's edge or path as a `TubeGeometry` with emissive #ffb84a ×3, plus 10-20 sparkle sprites streaming along it at 8-12 px/f. On for the whole explanation, faded in over 6 f on the noun.
- X-ray: swap the character card for a translucent variant (cyan #4fb6e8 α .55, ink #1d3b5a) with the organs drawn opaque, cross-fading in 4 f.
- Sound: Canvas2D concentric arcs, 4 px, white α .5, a new one every 10 f, growing 12 px/f, life 40 f.
- Numbers: put them on an in-world sign or object as a CanvasTexture (LED #ffb000 on #2a1a10) counting up over 9 f, landing on the word +0 to +4 f. No floating numbers. This also respects the user's "no labels" rule.

### 7.6 Transitions (`story.ts` XFADE / FLASH_AT)
- **Smoke wipe** (replaces `FLASH_AT`): a full-screen cel cloud made of 12 large puffs placed 0.5-2 m in front of the lens. They grow in 2 f, hold 3-4 f (the shot cut hides here), then pull apart outward in 3-4 f. Total 9-11 f.
- Dust wall: the same with soft dust sprites (#d8a36a, α .9), 10/5/6 f.
- Use these, follow-the-object or through-the-hole moves for place changes caused by an event. Keep plain 6-10 f crossfades for time changes.

### 7.7 Camera on impact (`story.ts` kickAt)
- Keep the 7-f sign-flip KICKS only for small contact hits (hammer, slap, ball on plate).
- Explosions: replace the kick with a push-in of 1.5-3 %/f for 10-15 f plus a 10-25 px/f tilt toward the rising crown.
- Crashes: hold the camera still, then cut to a closer angle at +10 to +13 f.

### 7.8 Compute budget (per frame)
- ≤ 3 InstancedMeshes per blast (puffs ≤ 40, debris ≤ 20, splinters ≤ 150).
- Canvas2D FX cards cached by quantised phase (`q(u, 30)` as in cast.ts).
- Trails: ≤ 82 TubeGeometries with 24 segments, grown with `setDrawRange` (no re-allocation).
- No GPU particles or fluid sims. Everything is deterministic in f (Remotion re-renders frames out of order, so derive every particle from a seeded hash of its index, never from accumulated state).

---

## 8. Agreement and disagreement with the bridge skill reports

| Bridge report claim | These 25 videos | Verdict |
|---|---|---|
| motion.md: impacts are 7-f kicks that flip sign every frame (v14 spear) | true for hand-scale contact; **explosions use a push-in, crashes use no camera move at all** | **partly disagree**: restrict kicks to small hits |
| motion.md: reactions 0-3 f before the word | target reaction −2 f (05 f197/199), flash −2 to −5 f, fireball −1 f | agree. Effects lead the word too |
| story.ts FLASH_AT: a white 4-f flash after the hook | no plain white flashes. The 3 bright full-frame events are smoke wipes of 9-11 f | **disagree**: use a smoke/dust wipe |
| outlines.md: smoke cards on NOINK (no ink) | family-A clouds carry a dark ink rim (#6f340a fire, light grey on smoke); family-B clouds have none | disagree for our ink style: add an in-shader rim |
| depth.md: emissive ×3 for fire, ×8 for sparks; bloom threshold 1.0 | glows, fuse sparks and the inner ship glow all bloom; the fire cloud body is NOT bloomed (it is flat toon colour, only the core) | agree for sparks and glows; keep cloud bodies < 1.0 so they stay cel |
| cast.ts fxBurst 9 f, 0.9-1.5 m | the hero blast fills 85-100 % W, has 35 f of fire plus ≥ 70 f of smoke; small hits are 2-f stars | the bridge burst is a mid-size "small hit". The hero blast needs §7.1 |
| SKILL: no captions or labels | no arrows or labels were found in the references either; numbers are diegetic | agree |

---

## 9. Top rules ranked by impact

1. **Five-beat projectile block** (§7.3): whole source, then breech cam, then ride, then a 4-6 f release before contact, then crack hold, then the blast on the noun. This fixes "half a cannon" and the unreadable flights.
2. **Impact geography**: show the hit from behind our own landmark (wall parapet in the bottom 12-18 %, target band at 55-60 % H), with the launch edge and target in one wide shot before it. This fixes "…".
3. **One hero explosion in the climax**: an instanced cel-cloud rig that reaches 85-100 % W in 3 f, with the 9-step colour ramp, 35 f of fire and ≥ 70 f of smoke, debris at 0.5 g, sky speed lines, a grade bump and a camera push-in. Not a 9-f sprite.
4. **Effects lead the word**: wisp −10 f, flash −3 f, fireball −1 f, cracks on the previous word, target face swap −2 f.
5. **Crowds**: only 1-3 near faces react. Distant masses are engulfed by a left→right chain of puffs; small figures are ejected on ballistic arcs at +12 to +25 f; then cut to aftermath faces at +25 to +55 f.
6. **Mechanisms by highlight and literal opening**: glow the part, follow the energy with one continuous dolly, open the shell; one insert per word, 20-40 f each.
7. **Effect-driven transitions**: smoke wipe (9-11 f), dust wall, through the muzzle or hole, follow the object. Drop the white flash.
8. **Camera on impact by scale**: kick for hand hits, push-in for blasts, stillness plus a cut at +10 to +13 f for crashes.

Files: `/root/proj/refs/work/fx/` (`scan.py`, `events.py`, `expl.py`, `fr.py`, `tile.sh`, `w.py`, `scan/*.json`, `m/*.jpg` frame tiles).
