---
name: zack-style-3d-short
description: Recreate or build a Zack D. Films-style photoreal 3D vertical short (cyan sky, macro insect/body shots, glowing parts, word-synced captions) with free Blender (bpy) and free CC0/CC-BY models, rendered headless in a cloud sandbox or on a free GPU.
---

# Zack-style 3D short (Blender, free assets, headless)

This is the exact pipeline used to recreate the first 5 s of the reference short "How Horseflies Bite You"
(1440x2560, 29.97 fps, 27.6 s) for the Sam-ulation channel. It covers analysis, free assets, the scene
look, every shot, rendering on a 2-core CPU or a free GPU, captions, assembly and QA, plus every bug hit.

Honest benchmark from the first run: ~65-70 % visual match on CPU with free models. The gaps (photoreal human,
hand-sculpted mouthparts, micro skin detail) need better assets and GPU render time, not more code.
Tell the user this number up front; never promise 90 %.

## 0. Rules
- Assets: only **CC0** or **CC-BY** (allows YouTube monetization; CC-BY needs a credit line in the
  description). Reject every **NC** (NonCommercial) and **ND** (NoDerivs) model. Verify the licence from
  the source metadata, never from the model name.
- A creator's audio, script and shot order may be used only for a private side-by-side quality test.
  Anything published uses an original script (facts checked against 2+ sources) and our own voice
  (e.g. free local Kokoro TTS).
- Show the user every draft frame as it is rendered (send stills/strips, not just a final video). They
  want to watch progress.
- No GPU in the cloud sandbox: ~65-70 s per 720x1280 frame at 32 spp. State render time before starting.

## 1. Analyse the reference (do this slowly, frame by frame)
```bash
V=reference.webm
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of default=nw=1 "$V"
# timestamped contact sheets, 6 fps, 12 frames per sheet -> read every sheet
ffmpeg -i "$V" -vf "fps=6,scale=240:-1,drawtext=text='%{pts\:hms}':x=4:y=4:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=6x2" sheet_%02d.jpg
ffmpeg -i "$V" -vn -c:a pcm_s16le ref_vo.wav           # VO for the private test only
```
Write down: shot list with times, what each shot shows, camera move, which word it lands on.
Reference grammar found:
- No hard cuts: every shot flows into the next with a fast camera move / whip.
- A new shot every 1-1.5 s, roughly one per caption phrase.
- Look: bright saturated cyan gradient sky with a soft glow right behind the subject; warm peach-orange
  skin; shallow depth of field; soft studio light.
- The part being named glows yellow (emission pulse), one part at a time.
- A visual metaphor morph (blade -> metal saw) and a loop ending (last shot = first shot).
- Captions: 2-3 words, lowercase, white bold rounded sans, thin black outline + soft shadow, fixed at
  ~77 % height, phrase swaps (no word-by-word pop).

Caption timing: tile 6 caption crops around each phrase change and read the swap frame:
```bash
for t in 0.80 0.83 0.87 0.90 0.93 0.97; do ffmpeg -v error -ss $t -i "$V" -frames:v 1 \
 -vf "crop=1100:200:170:1880,scale=330:60,drawtext=text='$t':fontsize=14:fontcolor=yellow:box=1" c_$t.png; done
```
Horsefly reference cues (s): "When a horse fly" 0-0.99, "bites you" 0.99-1.75, "it presses" 1.75-2.42,
"six needle like tools" 2.42-4.12, "against your skin" 4.12-5.0.

Caption size: threshold white pixels (min channel > 235) in the caption band to get the text bbox, then
find the font size whose `getbbox` width matches. Result at 1440x2560: DejaVu Sans Bold **87 px**,
glyph tops at **y = 1960**.

## 2. Environment
- Cloud sandbox (Python 3.13): `pip install --break-system-packages bpy` (gave bpy 5.2.3 LTS). Run
  scenes with `python3 script.py`. ffmpeg is preinstalled.
- Free GPU (recommended for real quality): **Kaggle** notebook, Accelerator "GPU T4 x2", Internet on
  (needs phone verification). Use "Save Version -> Save & Run All" so it renders in the background with
  the phone locked. Download the Blender binary instead of bpy (bundled Python, no version clash):
  `https://download.blender.org/release/Blender5.2/blender-5.2.3-linux-x64.tar.xz`, run
  `blender -b --python script.py -- args`. Output an MP4 (CRF ~14) to `/kaggle/working`, not 150 PNGs.
  Colab free tier stops when the phone tab sleeps, so prefer Kaggle.
- A phone GPU cannot be used (no Blender on Android/iOS, no device bridge from the phone app).

## 3. Free models (Objaverse = Sketchfab mirror on Hugging Face)
```python
import objaverse, gzip, json, glob, re
# metadata: scan chunk by chunk (load_annotations() on everything gets OOM-killed on 8 GB)
objaverse._load_object_paths()  # downloads index once
pat = re.compile(r"(horse ?fly|housefly|\bfly\b|tabanus|diptera)", re.I)
hits = []
for f in sorted(glob.glob('/root/.objaverse/hf-objaverse-v1/metadata/*.json.gz')):
    d = json.load(gzip.open(f))
    hits += [(a.get('likeCount',0), a['faceCount'], u, a['name'], a['license'], a['user']['username'])
             for u, a in d.items() if a.get('license') in ('by','cc0') and pat.search(a.get('name',''))]
objaverse.load_objects(uids=[...], download_processes=2)   # -> ~/.objaverse/.../glbs/xxx-yyy/<uid>.glb
```
(First call `objaverse.load_annotations(uids)` without other args; it has no download_processes kwarg.)
Also useful: Sketchfab search API `https://api.sketchfab.com/v3/search?type=models&downloadable=true&q=...`
to find uids, then fetch them through Objaverse. Direct URL pattern:
`https://huggingface.co/datasets/allenai/objaverse/resolve/main/glbs/<dir>/<uid>.glb`.

Preview every candidate (front/side/top on the cyan world, 16 spp) before using it. Many "fly" hits are
mushrooms, planes, scans on a plinth or untextured.

Models that worked:
| use | model | uid | licence / credit |
|---|---|---|---|
| hero fly | "Fly" by specter (1.3 M polys; separate Eyes / Head / Bodz / UP_ Mid_ Low_ legs / WINGS / Kapsel mouth) | 88b00401be8543f299b8720c2f5bd040 (000-021) | CC-BY, credit "specter" |
| backup fly | "Musca domestica" scan by disc3d (109 loose pieces, beige eyes) | 157900941156422fbd9dcdfc38a3be19 | CC0 |
| man | "Male Character- Clothes and Hair" by sapenton8821 (T-pose, PBR skin) | da02a1daf5294a86b9be5ea17d0b34c5 (000-063) | CC-BY |
Credit line template: `3D model "Fly" by specter (Sketchfab), CC BY 4.0`.

## 4. Scene look (fly_scene.py) - the base every shot exec()s
Units: the fly is ~3.4 BU long (≈2 cm), so a 1.8 m man is ~300 BU.

**Colour management:** view transform `Standard`, look `Medium High Contrast`, exposure 0. (AgX made the
cyan sky grey.)

**Sky (world):** Background colour = ColorRamp( dot(Generated coord, D) ) where D = unit vector from the
camera toward the subject (glow sits behind the subject; re-aim D every shot). Ramp stops:
0.94 -> RGB(28,150,205), 0.985 -> (65,178,222), 1.0 -> (160,218,238). Strength 1.0.
For shots with a human, light the scene with only 30 % of the sky but show 100 % to the camera:
`strength = 0.3 + 0.7 * LightPath.IsCameraRay` (otherwise the man turns blue-grey).

**Lights:** area key (-4,-6,7) 1300 W size 5 warm (1,.96,.9); area rim (5,5,5) 1100 W size 3 cool
(.8,.93,1); low front fill (0,-6,0.8) 260 W size 6. Human shots add a sun 5.0, angle 12°, colour (1,.9,.78).

**Skin ground:** a 200x200 grid bent into a cylinder of radius R=7 (`y=-1+R sin t, z=R cos t-R`,
t in ±1.6) so the horizon falls away like a shoulder; Clouds displace 0.1; material Principled base
sRGB(226,124,80), roughness 0.5, subsurface 0.15 radius (1,.4,.25); bump chain (Object coords):
noise 3 @0.5, noise 14 @0.25, voronoi-edge 9 @0.35 (creases), voronoi cells 140 @0.18 (pores).
Body hairs: ~90 tapered NURBS curves (radius 0.014 -> 0.0014, length 0.25-0.55) placed on the cylinder.

**Camera:** low, near skin level, 50-64 mm for the hero, 26-45 mm for macro, DOF f/2.8-4 focused on
the eyes.

**Helpers you need:**
- `mat(name, srgb_linear_color, roughness, **principled_inputs)`
- `lin(r,g,b)` sRGB 0-255 -> linear.
- `bump_chain(material, [(kind, scale, strength), ...], co="Object"|"Generated", mul=1)` chaining Bump
  nodes from Noise / Voronoi F1 ("cells") / Voronoi distance-to-edge ("voronoi").
- `mottle(material, dark, light, scale, lo, hi)`: Noise -> ColorRamp -> Base Color (chitin speckle).
- `fur(name, obj, n, length, radius, material, sweep, jitter, curl, filt)`: one curve object of n
  tapered POLY strands grown from area-weighted random surface points. Sample with numpy
  (`foreach_get` on vertices/loop_triangles, `rng.choice(p=area/area.sum())`); the pure-Python version is
  far too slow on 1 M-poly models.

**Fly materials (applied by object-name prefix after import):**
- Eyes: base RGB(105,42,30), roughness 0.5, coat 0.35; facets = Voronoi distance-to-edge on Generated
  coords, scale ~70 (210 is sub-pixel and reads smooth) as bump 0.9 and as a colour ramp (seams
  RGB(45,16,11) -> cell RGB(128,52,34)). Scale the eye mesh 1.35-1.4x about its centre (reference eyes
  are huge).
- Head/Body: mottle dark RGB(14,14,15) / light RGB(150,150,146), scale 24, ramp 0.52-0.66; bump noise 40
  + cells 160; roughness 0.42, coat 0.35.
- Legs: chitin RGB(34,22,18), roughness 0.5; Displace modifier strength ~3 BU along normals to thicken.
- Use **Generated** texture coords on imported models (`TEXMUL` to tune); Object coords give huge or
  microscopic patterns because the model's object scale is arbitrary.
- Fur: body 600 strands len 0.06 r 0.0035, head 350, legs 500 len 0.05. **Grow fur after the fly is
  placed and parent the fur curves to the FLY empty** (`matrix_parent_inverse = FLY.matrix_world.inverted()`)
  or the hair stays floating in mid-air when the fly animates.

**Import pattern:** import glb -> collect new objects -> compute world bbox -> parent roots to a PIV empty
scaled to 3.4 BU length and centred -> parent PIV to the animated FLY empty. Remove
`__hair_dummy_ignore__*` objects. Hide `Kapsel*` (model proboscis) in mouth shots.

**Recolouring a scan texture (Musca):** never guess UV-atlas islands. Raycast from the eye pixels in a
render (`scene.ray_cast` from the camera through the pixel), collect faces within r of the hits, draw
their UV polygons into a mask, multiply only bright pixels by a red-brown tint, and assign the new image
directly to the TEX_IMAGE nodes (changing the packed image filepath does nothing).

## 5. Shots (0-5 s of the horsefly reference) - one global 30 fps timeline
| frames | s | shot | how |
|---|---|---|---|
| 1-24 | 0-0.8 | fly hovers in, lands | FLY keys: hover z0 -> z0-0.35 (f7) -> land+0.03 (f15) -> land (f17), pitch 20°->6°; camera follows down then pulls back, lens 64->50 |
| 25-44 | 0.8-1.45 | "bites you": fly on a man's bare arm, his profile above | see Human below |
| 45-54 | 1.45-1.8 | low angle on the skin | camera from (-2.6,-6.5,-0.15) rel. fly -> (0.15,-4.3,0.05), lens 40->50, small roll |
| 55-150 | 1.8-5.0 | macro mouth: blades fan, glow one by one, gather, press skin | see Blades below |

**Landing height:** feet must touch the skin. Compute `foot_drop = FLY.z - min(z of leg vertices)` from
the evaluated mesh, skin height under the fly `R cos(asin((y+1)/R)) - R`, then
`land_z = skin_z + foot_drop - 0.04`.

**Human (shot 2):** scale 300/1562; raycast straight down at x = -345 model units to find the bare upper
arm (x = -250 hits the T-shirt); move the man so that point is under the fly's feet; tilt the fly to the
surface normal. Fixes needed on this model:
- Skin looked grey: remove the link into Metallic (set 0), multiply base colour by (1,.72,.55), SSS 0.12.
- Untextured hair cards: hide them. Build a hair cap = icosphere shrink-wrapped (nearest surface point,
  offset 0.35) onto the main body mesh, delete faces outside the hair region (defined in the model's own
  unscaled coords: z > 690, or z > 630 at the back; skip forehead y < -95 & z < 760, and temples),
  matte material RGB(40,28,19) rough 0.85 + noise bump; then grow ~40 k strands (len 0.9, r 0.06) on the
  cap. Using the scalp sub-mesh leaves holes (the crown is in the other mesh); Solidify makes lumps.
- Camera: offset (-46, 22, -6) from the fly, look at lerp(fly, head, 0.45), 28 mm, f/5.6, re-aim the sky.

**Blades (shot 4):** six procedural blades made with bmesh: elliptical rings, width
`W*(1-t)^0.55*(0.85+0.3 sin(0.9πt))`, thickness `0.7T(1-t)^0.5` (flat leaf), Subsurf 1/2, plus small
cone teeth along the edges. Spec (name, dx, W, T, teeth side, count, tooth len, fan°):
mandibles ±0.05, 0.075, 0.014, both, 26, 0.009, ±26; maxillae ±0.03, 0.05, 0.012, outer, 22, 0.016, ±14;
labrum -0.01, 0.05, 0.03, none, -4; hypopharynx 0.01, 0.022, 0.012, none, 5.
Material: amber RGB(225,112,18), roughness 0.16, subsurface 0.35 (radius 1,.55,.15), transmission 0.15,
coat 0.8; one material copy per blade so each can glow alone.
Root the blades **inside the head** (no visible sheath tube: a black cylinder looked fake) under a MOUTH
empty. Pose keys (spread 0-1, drop): f55 .15, f72 .35, f100 .45, f114 1.0 (fanned), f122 .12,
f136 .12 + 8 % reach, f150 .12 + 14 % reach.
Glow: Emission colour (1,.85,.15); strength 0 -> 2.2 -> 0 over frames on-3, on, on+6, with on = 76 + 7n
for blade order [0,5,1,4,2,3] (lands on "six needle like tools").
Camera keys are relative to the mouth point M: head close-up (f55), dive under (f62), low looking up at
blades (f72-100), pull back to see the fan (f114), front of head (f122), down to the skin (f136-150).

## 6. Rendering
- Cycles, denoise on, adaptive sampling, persistent data, max bounces 6.
- Resumable: `render.use_overwrite = False; render.use_placeholder = True`; a killed job restarts where it
  stopped (delete 0-byte placeholders first: `find frames -size 0 -delete`).
- Queue shots in one shell script; each shot is `python3 shotX.py outdir res% spp fs fe` writing
  `frames/f_####.png` with global frame numbers.
- Fast mode on CPU (`STEP=2 MB=0`, 16 spp, adaptive threshold 0.05): renders every other frame; fill the
  gaps with motion-compensated interpolation (pad the 2-frame clip with a third frame or ffmpeg
  outputs nothing):
  `ffmpeg -framerate 1 -i i_%d.png -vf minterpolate=fps=2:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1 o_%d.png`
  (o_2 is the in-between). Never interpolate across a cut. It halves the frame count but the macro shot
  still costs ~65-70 s/frame on 2 cores; CPU time is dominated by the scene, not the sample count.
- GPU switch (put after the engine is set):
```python
pr = bpy.context.preferences.addons["cycles"].preferences
for t in ("OPTIX", "CUDA"):
    try:
        pr.compute_device_type = t; pr.get_devices()
        if any(d.type == t for d in pr.devices): break
    except Exception: pass
for d in pr.devices: d.use = d.type != "CPU"
scene.cycles.device = "GPU"
```
On a T4 use 100 % res (1440x2560), 64-128 spp, motion blur on (shutter 0.5).
- Sub-agents/"helpers" in the same sandbox share the same 2 cores: they do not speed rendering up.

## 7. Captions
PIL overlay per phrase, 1440x2560 RGBA: DejaVu Sans Bold 87 px, centred, glyph top y=1960, white fill,
black stroke 3 px, shadow = same text offset (+3,+5) in black alpha 120 with stroke 3, Gaussian blur 3.
Compare against a crop of the reference caption on a flat background before using.

## 8. Assembly
```bash
ffmpeg -framerate 30 -i frames/f_%04d.png \
  -loop 1 -t 5 -i caps/cap_00.png ... -loop 1 -t 5 -i caps/cap_04.png -ss 0 -t 5 -i ref_vo.wav \
  -filter_complex "[0]scale=1440:2560:flags=lanczos,unsharp=5:5:0.6,gblur=sigma=28:sigmaV=0.01:enable='between(n,23,24)+between(n,43,44)+between(n,53,54)',format=rgba[v0];[v0][1]overlay=enable='between(t,0,0.99)'[v1];...;[v5]format=yuv420p[out]" \
  -map "[out]" -map 6:a -c:v libx264 -crf 16 -c:a aac -shortest -movflags +faststart out.mp4
```
- `-loop 1 -t <dur>` on every caption image is required; without it only the first caption shows.
- The horizontal gblur on the two frames around each cut fakes the reference's whip transitions.
- Make a side-by-side with the reference (hstack, labels) for the user to judge.

## 9. QA (never send a frame you have not looked at)
- Contact sheet of the side-by-side every 0.33 s; read it fully.
- Check per frame: feet touch the skin; fur moves with the fly; no fur/hair floating; captions present
  and timed; nothing fake-looking (sheath tubes, red dots, grey people); sky glow behind the subject.
- Compare one hero frame at full res with the matching reference frame, plus a close-up crop.

## 10. Bugs hit and fixes (checklist)
| symptom | cause | fix |
|---|---|---|
| hair a giant spiky ball / huge strands | particle hair `hair_length` scaled by object | build hair as curve strands yourself |
| fur hanging in the air after landing | fur generated before the fly moved / not parented | grow after placement, parent to FLY |
| sky grey-blue | AgX view transform | Standard + Medium High Contrast |
| texture patterns wrong size on imported model | Object coords | Generated coords + TEXMUL |
| eye tint landed on the wings | guessed UV-atlas region | raycast pick from the render |
| new texture had no effect | changed packed image filepath | assign new image to TEX_IMAGE nodes |
| man grey/blue | metallic map + full sky light | unlink metallic, warm multiply, camera-only sky |
| bald patches on the man | crown in another mesh; filter in wrong units | shrink-wrapped icosphere cap, filter in model coords |
| fly sat on the shirt | wrong raycast x | x = -345 (bare upper arm) |
| "test" image never changed | `use_overwrite=False` kept the old file | delete the test folder before re-rendering |
| `load_annotations` killed | whole metadata in RAM | scan the .json.gz chunks one by one |
| only first caption visible | single-frame image inputs | `-loop 1 -t 5` |
| black sheath + red dot looked fake | sheath tube and hollow-tip torus | hide; root blades inside the head |

## 11. Where the remaining quality gap is (to reach 80 %+)
1. Human: needs a photoreal scanned head/body (CC0/CC-BY scan) with beard and pore-level skin.
2. Mouthparts: sculpted, translucent, finely serrated blades; dark fleshy labium and palps.
3. Micro detail: eye facets, bristles and skin pores at full resolution, with high samples on a GPU.
4. Motion: hand-tuned easing and whip transitions rendered as real camera moves, not post blur.

## 12. v2 enhancements (second run, ~75-80 % match) - use these first
Working code: `zack3d/scripts/scene.py` (shared look), `shots_me.py` (landing, wide, face, skin-level),
`zack3d/scripts/shot_man.py` and `shot_blades.py` (helper branches `claude/zack3d-man`, `claude/zack3d-blades`),
`assemble.py` (upscale + whip blur + PIL captions). Reference frames: `zack3d/ref/ref_<t>.png`.

Environment (Claude Code cloud): Blender **4.5.15 LTS binary** from download.blender.org (no bpy pip). No
libEGL -> Workbench/EEVEE fail, use Cycles CPU (OIDN, adaptive, persistent data). 4 cores: ~2.3-3.6 min per
1080x1920 frame at 32 spp for the heavy fur/face shots, ~1 min for wide shots. Render at 75 % and Lanczos
upscale to 1440x2560 in assembly. Network hosts to allow: download.blender.org, huggingface.co,
cdn-lfs.huggingface.co, cas-bridge.xethub.hf.co, us.aws.cdn.hf.co, cdn.hf.co, api.sketchfab.com,
dl.polyhaven.org, api.polyhaven.com, ambientcg.com.

Better models (both CC-BY, fetch from the Objaverse HF mirror):
| use | model | uid (dir) | credit |
|---|---|---|---|
| hero fly | "Domestic Fly" (clean anatomy, untextured -> shade it yourself) | 3d305de3106d462194ed03fad5715ddf (000-050) | aramabdulrahim |
| man | "Bearded Man" (photoreal head, beard) | 60947a1819a1407685cb4332e894e585 (000-039) | KaitlynAndrus |
Rejected: "tabanos" (actually a rock scan), specter fly (crude up close), Musca scan (crouched pose).

What closed the gap:
- **Procedural head**: hide the model's low-poly open-shell eyes; build ellipsoid eyes (scale ~0.37/0.34/0.50,
  toed out ±16°) with a Voronoi distance-to-edge facet bump (scale 70), dark red-brown ramp, clearcoat 0.35,
  layer-weight rim darkening; plus an ellipsoid head capsule, face plate and frons stripe; olive antennae
  with an arista curve.
- **Mouthparts**: NURBS-curve tubes (radius 0.075 -> 0.012) with an orange gradient material (tip
  (246,162,64) -> base (186,52,32) by Z map range), black palps, a thin central stylet. Make them longer
  (MOUTH_LEN 1.9) for the face and skin-level shots.
- **Body**: cosine stripe shader along the thorax (period 0.30) over a grey mottle, clearcoat; legs glossy
  near-black with a fine bump; Displace (0.014) on legs so they are not pencil-thin.
- **Fur**: numpy area-weighted strands (3 point POLY curves) grown after placement and parented to the fly:
  3200 dark + 1400 light body hairs, 3500 leg bristles.
- **Sky**: colour ramp on dot(view dir, camera->subject), re-aimed every frame so the glow always sits
  behind the subject; `LightPath.IsCameraRay` mix so the sky lights the scene only at 0.5.
- **Skin**: bent cylinder ground with displacement, mottle, bump chain, curve hairs (bevel 0.007);
  roughness 0.72, Specular IOR Level 0.12 - higher specular washes out at grazing angles.
- **Blades shot**: amber translucent serrated blades, crumpled-chitin leg bump, one blade at a time
  emission-pulsed yellow.
- **Helpers**: one remote session per shot on its own branch; each pushes `zack3d/renders/<shot>.mp4`
  (crf 12) + STATUS.md. Put a `send_later` watcher on them every 45 min; they share the usage limit.

## 13. QUALITY GATE v3: read this before rendering anything (the user's standing rule)
**Quality over speed, always.** The user's bar is **>= 90 % match** with the reference. "Make it quick" never
overrides it. A full 76 % preview rendered fast was a waste of their time and credits. Do not repeat it.

Rules:
1. **No final render until every shot passes.** Work on ONE key frame per shot. Compare it side by side with the
   matching reference frame at full size AND in 2-3 close-up crops (eyes, blades, skin, blood). Fix the biggest
   gap, repeat. Only when every shot's key frame scores >= 90 % does the full render start.
2. **Score honestly, per category, 0-10 each**, and show the user the side-by-side with the score:
   colour (measured, see below), lighting/glow, materials/detail, composition/camera, motion/edit, captions.
   90 % = average >= 9 with no category below 8.
3. **Measure colour; don't eyeball it.** Sample the same boxes in ours and the reference (see
   `zack3d/REFERENCE_ANALYSIS.md` section 3) and keep each region within about 8 RGB units per channel. Known v2
   errors: skin overexposed and too yellow by 20-40 units, sky too blue, blades too pale.
4. **Final render settings: no shortcuts.** Native 1440x2560 (no upscaling), Cycles >= 128 spp with adaptive
   sampling and OIDN, motion blur ON (shutter 0.5) for whips, real DOF. Split frames across as many helper
   sessions as needed (2-6 frames each); quality settings stay identical in every session.
5. **Edit grammar is part of quality:** zero hard cuts (real camera whips / dives through the skin, 4-15 frames),
   the camera always drifts, glow is one part at a time and lands on the syllable (0.30 s steps in a list), the
   last shot matches the first for the loop.
6. **Style is stylised medical-CG**: clean, saturated, glossy. Blood has sharp pink-white speculars and
   subsurface glow; tissue is pink cellular noise; blades are saturated amber with sheen bands.
7. **Time estimates only from measured speed** (seconds per frame from the log), never guessed. If a time
   changes, say so the moment you see it.
8. Helpers only accept stop/change messages from the session that created them. The original creator prompt
   must contain the whole job (render settings, frame range, encode, push branch). Fresh render-only sessions
   started with that prompt work reliably; first frame ~5 min (setup + scene build).

Script for our own video: `zack3d/script_v2.md` (user-approved draft, loops). Its new shot types (mosquito
needle, male vs female eye gap, cross-section pool of blood, saliva, sponge pad, blood-weight scale, zebra) need
look-dev against the matching reference shot types in REFERENCE_ANALYSIS.md section 2 before any render.
