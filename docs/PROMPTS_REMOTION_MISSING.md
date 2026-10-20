# Remotion prompts — missing assets, map style & colour grade

Everything here is built **in Remotion** (in ChatGPT's Remotion environment, as with the first batch), plus the
**downloads** that Remotion needs and that must never be AI-generated. GPT images are in
`docs/PROMPTS_GPT_MISSING.md`.

| # | What | Output |
|---|---|---|
| R0 | Ground rules: which code to give ChatGPT | — |
| R1 | Bourbon France flag (currently a plain white rectangle) | `flags/bourbon_france.png` + fixed component |
| R2 | White block arrow (the GPT one lost its fill) | `ArrowBlock` component + `icons/arrow_white_block.png` |
| R3 | Neon icons on black → screen blend | fixed `NeonIcon` |
| **R4** | **Map style = the reference's four looks, kept in 3D, with a full colour grade** | look presets, `Grade` v2, `Map3D` v2 |
| R5 | Fixes the demo renders exposed | code fixes |
| R6 | Re-render the four demos as the acceptance test | 4 MP4s |
| D1–D4 | Downloads: Blue Marble, public-domain scans, hillshade, 10m coastlines | files in `public/` |

---

## R0. Ground rules — give ChatGPT the right code

The source zip you used last time is **older than the branch** (no cue sheet, no measured rigs, no bundled fonts, no
S01/S02). The demo bugs mostly come from that. **Give ChatGPT the branch code:** `analysis/america-independence-reference`,
which with these docs added will be the working branch.

Paste this once at the start of the ChatGPT session:
```
You are working on a Remotion 4.0.523 project (React + TypeScript, 3840×2160 @ 60 fps). The source
of truth is the code I give you now. Do NOT use any earlier copy of this project. Rules:
- Keep every existing file name, export name and composition id unless I say otherwise.
- Fonts are bundled locally in public/fonts and loaded by src/lib/fonts.ts. Never switch to
  Google Fonts or the network.
- All colours come from src/lib/constants.ts (C). Add new constants there, never hard-code hex
  values in scenes.
- After every change: run `npx tsc -p .` and fix all errors, then render the stills or videos I
  ask for and show me a frame.
- If you need the network shim for your sandbox, keep remotion-network-preload.cjs OUT of the
  committed code; it is only for your environment.
```

---

## R1. Bourbon France flag — S20 "France इस जंग में"

**Problem:** `BourbonFrance` in `src/lib/fx/flags.tsx` is a plain white rectangle. On screen that reads as a **surrender
flag**. The recognisable Bourbon royal flag of the period is white sown with gold fleurs-de-lis.

```
PROMPT R1
In src/lib/fx/flags.tsx, rewrite BourbonFrance as an SVG of the French royal (Bourbon) flag of
the 1770s: an off-white field (#FBFBF5) sown with gold fleurs-de-lis (#D4AF37 with a thin
#8A6A12 outline) in a staggered grid, 5 columns × 3 rows offset by half a step on alternate
rows, each fleur-de-lis about 0.28 of the flag height. Draw ONE fleur-de-lis as a reusable
<path> (classic three-petal heraldic lily with a band across the middle) and place it with
<use>. Keep the 3:2 ratio and the existing { width } prop.
Then add a still composition in src/Root.tsx next to Flag-GrandUnion:
  id="Flag-Bourbon", width 3600, height 2400, durationInFrames 1.
Render it:
  npx remotion still src/index.ts Flag-Bourbon public/assets/flags/bourbon_france.png
Show me the PNG.
```
Check: gold lilies clearly visible at thumbnail size; no blue field (a blue field with three lilies is the *royal arms*,
not the flag).

---

## R2. White block arrow — Britain's arrow, S05 and wherever `ArrowBob` is used

**Problem:** `icons/arrow_white_block.png` is outline-only (interior alpha 0), so it vanished in `demo-britain`. A code arrow is
also crisper at 4K and can be recoloured.

```
PROMPT R2
Create src/lib/fx/ArrowBlock.tsx exporting <ArrowBlock width rotate? fill? /> that draws, as SVG,
a thick solid block arrow pointing RIGHT like the reference's map arrow:
- shaft height 34% of the arrow's height, head 100% height, head length 42% of the width
- fill C.neonWhite (#EAF6FF) by default, fully opaque
- outline C.outline (#2A211B), stroke width = 2.2% of the height, rounded joins
- a soft drop shadow underneath: offset (0, 3% of height), blur 4% of height, rgba(0,0,0,0.35)
Then change ArrowBob in src/lib/fx/motion.tsx to render <ArrowBlock> instead of the PNG,
keeping its existing bob motion and props.
Also add a still composition "Icon-Arrow" (2048×1024, transparent) and render
  npx remotion still src/index.ts Icon-Arrow public/assets/icons/arrow_white_block.png --image-format=png
so the PNG name keeps working. Show me the arrow on parchment AND on the satellite map.
```

---

## R3. Neon icons — make the black-background PNGs work

The GPT file generates the neon icons on **pure black** (a glow can't survive background removal). The current `NeonIcon`
puts `drop-shadow` on the image, which on a black PNG would glow a whole **square**.

```
PROMPT R3
In src/lib/fx/motion.tsx, change NeonIcon so it works with neon PNGs that are on a pure black
background:
- render the <Img> with style mixBlendMode: 'screen' (black disappears, light stays)
- remove the drop-shadow filters (they outline the black square)
- add the glow as a second copy of the same <Img> behind it, also mixBlendMode 'screen',
  filter blur(28px) brightness(1.6), opacity 0.7 × flick
- keep the existing flicker timing (6 f on/off @60), popScale entry and exit ramp
The parent of NeonIcon must not be isolated (no opacity/transform wrapper with its own
stacking context directly around it), otherwise screen blending only sees transparency.
Test with public/assets/icons/neon_parliament_x.png over the satellite map and over parchment.
```

---

## R4. Map style — exactly the reference's looks, kept in 3D, with a full colour grade

### R4.1 What "like the reference" means — four looks, switched by meaning

The reference rotates map looks to reset attention, and **every switch lands on a narrative turn**:

| Look | Reference use | Our scenes (from the cue sheet) |
|---|---|---|
| **Satellite** (Blue Marble terrain, deep ocean) | present-tense facts: the hook, tax goods, the congresses, Lexington pin | S01, S07 second half, S14, S15 (night variant) |
| **Parchment** (tan paper land, teal sea) | story and character beats: Britain-as-character, wars, July 1776, ending | S02–S06, S09, S10, S13, S16, S18, S20 |
| **Flat political** (solid blue land, dark navy sea) | used once, for a close-up (the Boston punishment) | S14 Boston harbour close-up |
| **Relief parchment** (parchment + hillshade) | battle map (Lexington/Concord) | S04 Ohio country, S06 Appalachians, S15 route |

**Keep all four in 3D** (your request): the land is a slab, colonies extrude and rise, and the camera tilts and orbits as in
`demo-map-3d`. The reference is flat 2D; the 3D is our upgrade.

**Close-up rule (from the reference and the data):** Blue Marble is 240 px/degree, so on a 3840-wide frame it goes soft
once the shot spans less than ~16° of longitude. The reference does the same thing: it switches to the **flat** look for
the Boston close-up. Use satellite for wide and medium shots, and flat or parchment for city close-ups.

### R4.2 Target colours — measured on screen in the reference

Dominant colours measured with k-means on 10 reference frames, compared with the current `C` constants and with our
demo renders. These are **final on-screen** colours (after the reference's own grade), so they are what our *graded
output* should hit, ±5%.

| Element | Reference (measured) | `C` constant now | Our demo render | Action |
|---|---|---|---|---|
| Satellite deep ocean | **#022C40** / #023144 | `#0B2A44` (flat fill, no imagery) | — | Use Blue Marble + grade |
| Satellite shelf water | **#2A6977** | — | — | comes from Blue Marble bathymetry |
| Satellite land (forest) | **#3C4A20** / #47502B | — | — | Blue Marble + grade |
| Satellite land (arid) | **#857650** | — | — | Blue Marble |
| Satellite colonies | **#3B80B7** | `#5B9BE0` | — | darken `colonyBlue` |
| Parchment land | **#A19573** (5 frames: #9D916F–#A59A76) | `#C9B48A` | `#C8A76B` (too yellow, too bright) | **change** |
| Parchment sea | **#5E8488** | `#5E8C8E` | `#5A7977`, 3D: `#447474` (too green) | small change |
| Parchment colonies | **#49738A** | `#4F7099` | 3D: `#6496C1` (too light) | **change** |
| Britain red | **#C7383C** (dark #8A2D26) | `#D62935` | `#E2212C` (too hot) | **change** |
| France blue | **#274097** | `#2B3FA0` | — | fine |
| Spain orange | **#BE6F24** | `#E3862D` | — | darken |
| Flat land | **#2A79BA** | `#3D86C6` | — | darken |
| Flat sea | **#122834** | `#1B2B38` | — | darken |
| Relief land | **#A59A76** with hillshade #948A6A–#AFA481 | — | — | parchment + hillshade multiply |

Measured grade characteristics:

| Look | Saturation | Contrast (L std) | Vignette (corner ÷ centre) |
|---|---|---|---|
| Satellite | **70–73%** | 12–16 | **0.83–0.86** (corners ~15% darker) |
| Parchment | **30–34%** | 6–9 | **none** (0.96–1.15) |
| Flat | **71%** | 18 | 0.91 |
| Relief | **28%** | 7 | none |
| *Ours, parchment demo* | 35% | **11.3** (too contrasty) | **0.88** (vignette the reference doesn't have) |
| *Ours, 3D demo* | 38% | 13 | 0.97 |

### R4.3 The grade — "match" layer (measured) + "more grading" layer (added on top)

**Match layer** = hit §4.2. **More grading** = my recommendation for the extra richness you asked for. It's kept subtle
enough that the looks still read like the reference.

| Look | Match (measured) | More grading (added) |
|---|---|---|
| **Satellite** | saturate so the output is ~70%; contrast ~1.10; vignette 15% at corners | **Split-tone**: shadows → teal `#0A2F3F` at 18%, highlights → warm `#FFE2B8` at 8%. **Ocean depth**: keep Blue Marble bathymetry and add a radial darkening 10% away from the coast. **Horizon haze** in tilted 3D: `#6FA8C8`, 0 → 30% toward the far edge. **Bloom** on whites, pins and neon: threshold 0.85, radius 18 px, 25%. |
| **Parchment** | land/sea/colony per §4.2; contrast ~0.95; **no vignette** | **Paper grain** `textures/paper_grain_tile.jpg` multiply 22% over everything (land, sea, colonies), so the whole map looks printed. **Ink edge**: colony and country fills get a 10% darker inner edge (2.5% of the colony size), like a hand-tinted map. **Warmth**: +4% red in highlights. **Edge burn on the paper only** ≤6%, not a camera vignette. |
| **Flat** | land/sea per §4.2; contrast ~1.15; vignette 9% | Highlight wash `#B0CEDC` on the land's top-left facing slopes (3D side light); subtle grain 3%. |
| **Relief** | parchment palette + hillshade multiply 45% | Warm hillshade: tint the hillshade `#6B5A3A` before multiplying, so mountains read sepia, not grey. |
| **Night** (S15) | not in the reference | Exposure −1.3 stops, shadows → `#0B1A33`, saturation −20%, pins, lanterns and labels emissive warm `#FFB347` with bloom 35%. |
| **Memorial beats** (S11 deaths, S19 Monticello) | reference drops music, no gag | Desaturate −25% over 40 frames, warm +6%, no bloom. Restore over 60 frames afterwards. |
| **All looks** | — | **Film grain** 3% animated (different noise every frame, `@remotion/noise`). Soft S-curve. **Whites capped at 96%** so labels never blow out at 4K. |

### R4.4 3D treatment (all looks)

| Part | Spec |
|---|---|
| Land slab | Top face textured with the look's raster (Blue Marble / parchment texture / flat colour / relief). Side walls = top colour × 0.62. |
| Colonies | Top colour per look (§4.2) with the existing ±4% lightness per colony. Side walls × 0.62. **Thin white top rim** `#FFFFFF` 35%, 1.2 px at 4K: the reference's thin white state borders. Rise animation unchanged. |
| Ocean | **Matte**: `roughness 0.9, metalness 0`. The current `roughness 0.35, metalness 0.1` causes the white hotspot over the Gulf in `demo-map-3d` from f320. |
| Lights | Key from top-left (as STYLE C), cool rim from the right, hemisphere sky/ground per look. |
| Contact shadow | Colonies cast a soft shadow onto the land slab, 30% opacity, toward bottom-right. |
| Fog | Distance fog in the look's haze colour: satellite `#6FA8C8`, parchment `#CFC3A1`, flat `#1B3A52`. Starts at 60% of the camera distance. |
| Camera | Never rolls (the reference's rotation is 0). Tilt ≤ 46°. Always drifting (`T.driftPerSec`). |

### R4.5 The prompts

Run them in order. Each one ends with a still for you to check.

```
PROMPT R4-A — palette + Grade v2
1. In src/lib/constants.ts, update C to the measured on-screen reference colours:
   parchLand '#A19573', parchSea '#5E8488', parchColony '#49738A', britainRed '#C7383C',
   britainRedDark '#8A2D26', spainOrange '#BE6F24', flatLand '#2A79BA', flatSea '#122834',
   colonyBlue (satellite) '#3B80B7'. Add: satOcean '#022C40', satShelf '#2A6977',
   hazeSat '#6FA8C8', hazeParch '#CFC3A1', hazeFlat '#1B3A52', nightShadow '#0B1A33',
   nightGlow '#FFB347'.
2. Replace Grade in src/lib/fx/particles.tsx with a preset-based version:
   <Grade look="satellite" | "parchment" | "flat" | "relief" | "night" mood?="normal"|"memorial">
   Each preset applies, in this order:
   a) CSS filter contrast/saturate/brightness (satellite 1.10/1.18/1.0, parchment 0.95/0.92/1.02,
      flat 1.15/1.05/1.0, relief 0.95/0.85/1.02, night 1.05/0.80/0.45)
   b) split-tone via an SVG feColorMatrix filter (satellite: shadows toward #0A2F3F 18%,
      highlights toward #FFE2B8 8%; parchment: highlights +4% red)
   c) vignette overlay, radial-gradient multiply: satellite 15%, flat 9%, night 30%,
      parchment/relief 0%
   d) animated film grain 3% (@remotion/noise, new seed each frame), mix-blend overlay
   e) for parchment and relief, paper_grain_tile.jpg tiled, multiply 22%
   f) mood="memorial": extra saturate(0.75) and a warm 6% overlay, both eased in over
      40 frames from the Sequence start
   Keep the old contrast/saturate/brightness props working as overrides so S01/S02 still render.
3. Render a 2×2 still sheet composition "Grade-Test" (3840×2160) showing the same colonies map in
   satellite / parchment / flat / relief, and show it to me.
```

```
PROMPT R4-B — Blue Marble satellite + raster drape in 3D
1. MapStage (src/lib/map/MapStage.tsx): when style === 'satellite', draw the raster(s) passed in
   a new `rasters` prop: { src, west, south, east, north }[]. Place each image with the SAME
   plate-carrée projection used for the vector layers (src/lib/map/geo.ts toXY), so coastlines in
   the image and the SVG colonies line up exactly. Fall back to C.satOcean only where no raster
   covers the frame.
2. Map3D (src/lib/three/Map3D.tsx):
   - add props `look` ('satellite'|'parchment'|'flat'|'relief') and `rasters` (same shape)
   - land slab top face: a MeshStandardMaterial with `map` = the raster texture (useLoader
     TextureLoader on staticFile), UVs computed from each vertex's lon/lat so
     u=(lon-west)/(east-west), v=(lat-south)/(north-south); parchment look uses
     textures/parchment_paper_4k.jpg tiled instead; relief multiplies textures/hillshade_*.jpg
   - ocean material: roughness 0.9, metalness 0 (removes the Gulf hotspot)
   - colony side walls: top colour × 0.62; thin white top-edge rim (#FFFFFF, opacity 0.35)
   - fog per look using C.hazeSat / C.hazeParch / C.hazeFlat, near = 0.6 × camera distance
   - texture colour space sRGB, renderer toneMapping NoToneMapping (so §4.2 colours are hit)
3. Render stills of Demo-Map3D at frames 0, 240 and 479 with look="satellite" using
   public/assets/maps_raster/bm_eastcoast.jpg (bounds W-86 S28 E-64 N48), and the same frames
   with look="parchment". Show me all six.
```

```
PROMPT R4-C — style-switch transition and look per scene
1. In src/lib/fx/transitions.tsx add <PushWipe from to start dir="left" duration={36}>: the
   new look slides in from the RIGHT behind a hard, near-vertical seam (tilted 6°) with a 6 px
   bright edge (#FFFFFF 70%), duration 36 frames at 60 fps, ease in-out. This replaces the
   "white flash" style switch: in the reference it is a push-wipe, not a flash.
2. Add a look map in src/lib/map/looks.ts:
   S01 satellite · S02–S06 parchment (S04 and S06 relief while tilted over mountains) ·
   S07 parchment → satellite · S09 S10 S13 S16 S18 S20 parchment · S14 flat for the Boston
   close-up, satellite otherwise · S15 night.
   Export lookFor(sceneId, localFrame) so scenes ask for their look instead of hard-coding it.
```

### R4.6 How to check the result

Re-measure the graded output with the same method used on the reference (k-means on 640×360 frames). Targets:

| Look | Saturation | Contrast (L std) | Vignette | Land / sea / colony within ±5% of |
|---|---|---|---|---|
| Satellite | 68–76% | 12–16 | 0.82–0.87 | #3C4A20 / #022C40 / #3B80B7 |
| Parchment | 28–36% | 6–9 | ≥ 0.96 | #A19573 / #5E8488 / #49738A |

Send me the renders and I'll run the measurement.

---

## R5. Fixes the demo renders exposed

```
PROMPT R5
Fix these, each in the file named, and show me a still proving each fix:
1. Titles under characters (demo-map-hook f400+: eyebrows render on top of "Proclamation Line").
   In MapStage, render all MapTitle / labels in a top overlay layer ABOVE RegionEyes, and move
   any RegionEyes whose screen position falls inside a title's box by +6% of frame height.
2. Two Britains (demo-britain f60–f240). When the Britain MapCharacter detaches and slides, hide
   the map's own Great Britain + Ireland land shapes (fade 8 frames) and restore them when it
   returns. Only one Britain may be visible at any time.
3. DEBT stamp near-black (demo-britain f60–f90). StampSlam must render the stamp PNG with normal
   blending at full opacity on top of the character, never multiply over red.
4. Framing after punch-in (demo-britain f320–359). Keep the MapCharacter's face inside the
   centre safe box x 30–65%, y 15–60% of the frame (where the reference stages all action);
   clamp camera targets so the character is never cropped by the frame edge.
5. Frame-0 camera (demo-map-3d f0 shows the Arctic). In Map3D, pose the camera synchronously
   before the first render (poseCamera in useLayoutEffect and in the Canvas onCreated), so
   frame 0 already matches the first camera key.
6. Freeze (demo-map-hook f415–420, 6 identical frames). The camera must keep drifting during
   holds: apply T.driftPerSec in MapStage after the last camera key, like ParallaxPlate does.
7. Rigs (demo-volley: muskets at the feet, arms across the chest). Use the measured rigs
   (src/lib/character/rigs.generated.json via rigs.ts) and the CROPPED character PNGs in
   public/assets/chars. Muskets attach at shoulderR and rotate about it from -10° to +38° over
   16-20 frames, staggered 8-12 frames per soldier.
8. Franklin and stamp clerk spectacles. In rigs.ts add a `face` override for
   benjamin_franklin.png and stamp_clerk.png so Face.tsx draws the eyes centred inside the
   painted lenses and the brows just above the frames.
```

---

## R6. Acceptance test — re-render the four demos from the fixed code

```
PROMPT R6
Render the four demos at 3840×2160, 60 fps, with the new looks:
  Demo-MapHook look="parchment", Demo-Britain look="parchment",
  Demo-Map3D look="satellite" with bm_eastcoast.jpg, Demo-Volley on bg_king_street_boston_1770_night
npx remotion render src/index.ts <id> out/<id>.mp4 --gl=angle --concurrency=50%
Give me the four MP4s.
```
Send them over and I'll check them frame by frame again, against the reference measurements.

---

# Downloads — NOT generated, NOT made in Remotion

## D1. NASA Blue Marble (public domain) — the satellite look

Source: NASA Visible Earth, **Blue Marble Next Generation, "world.topo.bathy" December** (topography + bathymetry,
so shallow seas show the lighter shelf colour the reference has).

| File to make | Region | Source image | Crop (ImageMagick) |
|---|---|---|---|
| `public/assets/maps_raster/bm_eastcoast.jpg` | lon −86…−64, lat 28…48 (13 colonies, medium) | tile **B1** 21600×21600, 240 px/° | `-crop 5280x4800+960+10080` |
| `public/assets/maps_raster/bm_atlantic.jpg` | lon −82…+5, lat 25…62 (colonies ↔ Britain) | global **21600×10800**, 60 px/° | `-crop 5220x2220+5880+1680` |
| `public/assets/maps_raster/bm_europe.jpg` | lon −12…+32, lat 34…62 | global 21600×10800 | `-crop 2640x1680+10080+1680` |
| `public/assets/maps_raster/bm_india.jpg` | lon 66…98, lat 6…36 (S04 "भारत", S13 Bengal) | global 21600×10800 | `-crop 1920x1800+14760+3240` |
| `public/assets/maps_raster/bm_world.jpg` | whole world, lat 75…−60 | global 21600×10800 | `-crop 21600x8100+0+900 -resize 7680x` |

Formulas, for any other crop: **tile B1** x = (lon + 90) × 240, y = (90 − lat) × 240.
**Global 21600×10800** x = (lon + 180) × 60, y = (90 − lat) × 60.

Example:
```bash
magick world.topo.bathy.200412.3x21600x21600.B1.jpg -crop 5280x4800+960+10080 +repage -quality 92 public/assets/maps_raster/bm_eastcoast.jpg
```
Credit line: *"Imagery: NASA Visible Earth, Blue Marble Next Generation (public domain)"*.
Below ~16° of longitude across the frame these get soft at 4K. That's the close-up rule in R4.1.

## D2. Public-domain historical scans → `public/assets/docs/`

Download from the **Library of Congress** / **National Archives** item pages. Check each page says "No known restrictions"
or public domain, and pick the largest TIFF/JPEG.

| File | Item | Search on loc.gov / archives.gov | Used in |
|---|---|---|---|
| `pd_join_or_die_1754.png` | Franklin, "Join, or Die", *Pennsylvania Gazette*, 9 May 1754 | "Join, or die" | S03; S20 (cut into its 8 snake pieces) |
| `pd_revere_bloody_massacre_1770.jpg` | Paul Revere, "The Bloody Massacre perpetrated in King Street", 1770 | "bloody massacre perpetrated in King Street" | S11 |
| `pd_common_sense_titlepage_1776.jpg` | *Common Sense* title page, Philadelphia 1776 | "Common sense addressed to the inhabitants of America" | S17 |
| `pd_declaration_engrossed.jpg` | Engrossed Declaration of Independence | archives.gov → "Declaration of Independence" high-resolution download | S18 macro + highlighter |
| `pd_proclamation_1763_map.jpg` | A 1763–65 map showing the Proclamation boundary | "proclamation 1763 map" (Geography & Map Division) | not shown; used to correct `PROCLAMATION_LINE` |

The engrossed Declaration is very faded. The highlighter beat reads better on the **1823 Stone facsimile** (also public
domain, National Archives), so download both and choose on screen.

## D3. Hillshade → `public/assets/textures/`

| File | Region | How |
|---|---|---|
| `hillshade_appalachians.jpg` | lon −86…−72, lat 33…45 (S04 Ohio country, S06 the Line) | SRTM 90 m or GEBCO → `gdaldem hillshade -z 2.5 -az 315 -alt 40` at 240 px/° (commands in `ASSET_PROMPTS.md` §10.3) |
| `hillshade_massachusetts.jpg` | lon −72…−70, lat 41.8…43 (S15 Lexington/Concord relief) | same, at 480 px/° for the close-up |

Simpler for wide shots: Natural Earth **Shaded Relief 1:10m** (`SR_HR`, public domain), cropped with the global formula
above.

## D4. 10m coastlines — already in your source zip

Copy `public/maps/countries-10m.geo.json` and `public/maps/land-10m.geo.json` from the source zip into the project. The
50m data looks crude at 4K in the Boston close-ups (S11 pin, S14 harbour, S15 route). Load 10m only for close-ups,
since it's 36 MB.

---

## Not in either file

- **Sound:** 7 SFX named by the cue sheet don't exist yet (`musket_single`, `crowd_angry_loop`, `wood_crash_cards`,
  `church_bell`, `horse_gallop`, `quill_scratch`, a water splash). They're neither GPT nor Remotion.
- Drawn in scene code, so no files needed: price tags, speech bubble, myth card, like/share icons, Part 2 card,
  subscribe button, counters, date cards, pins, timeline, highlighter, strike-throughs.
