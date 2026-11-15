# 10 · Engine B: Blender (EEVEE, procedural, headless)

Built for video #4 (the creator asked for Blender for the environment). Everything is procedural Python: no downloaded
models or textures, so it is copyright-free by construction. Code: `blender/` + `card/`.

## 1. Install (cloud container, no GPU)
```bash
curl -sSfL -o /tmp/b.tar.xz https://download.blender.org/release/Blender4.5/blender-4.5.15-linux-x64.tar.xz
tar xf /tmp/b.tar.xz -C /root && ln -sf /root/blender-4.5.15-linux-x64/blender /usr/local/bin/blender
apt-get update -q; apt-get install -y -q libegl1 libgl1-mesa-dri libegl-mesa0 libxkbcommon0 libsm6 libxi6 libxxf86vm1 libxfixes3 libxrender1
```
- **EEVEE Next runs on Mesa llvmpipe through EGL.** The `EGL_BAD_MATCH` messages are harmless.
- Without those libraries, only Cycles works, and Cycles is far slower here.
- The card renderer needs Node + Playwright Chromium (pre-installed in these containers; set `PLAYWRIGHT_PATH` if
  `playwright` doesn't resolve from the skill folder).

## 2. Files
| file | role |
|---|---|
| `blender/world.py` | the whole world, built in code (see below). Globals: `WELD`, `KINK(y)`, `SUN_EL_DEG`, `SUN_COL` set by the caller |
| `blender/town.py` | depot + platform, signs (Blender built-in font), GRAND OPENING banner, red/white/blue bunting, two rows of false-front buildings |
| `blender/loco.py` | 4-4-0 locomotive + tender (boiler, smokebox, balloon stack, brass domes and bell, headlamp, cowcatcher, spoked drivers, side rods, cab), `loco_update()`, `smoke_puffs()` |
| `blender/anim.py` | the shot driver: per-shot `setup_*()` / `frame_*(f)`, cards, maul, sparks, chalk marks, render settings and 3 passes |
| `blender/scene.py` | single-still version (first-frame look-dev) |
| `card/render_card.mjs` + `card.html` + `extras.js` + `toon/` | renders our Canvas2D rig poses to transparent PNGs in headless Chromium (batch, deduped) |
| `tools/blender_render_part.sh` | one helper's job: install, render frame ranges at 2/3 scale, Lanczos to 4K, push |

**world.py contents:**
- **Materials:** layered noise sand; strata rock (Z bands warped by noise); long-grain wood without moiré; rail (polished
  top, rust sides, low specular so the sides don't mirror the sky); ballast (per-instance random colour); emissive sparks;
  hot rail.
- **Track:**
  - gauge 1.435 m, 39 ft rails with a 26 mm drawn gap;
  - joint bars, 4 bolts per side, tie units (tie + plates + 4 spikes);
  - 70-130 jittered near ties, then an array;
  - ballast bed;
  - **particle** gravel (130k instances, no shadow casting);
  - `WELD` / `KINK` give continuous rails with a kink shape key.
- **Terrain:** a grid denser near the track, flat near it, with fractal dunes away from it.
- **Mesas:** buttes with a talus skirt, stepped cliff bands with ledges and undercuts, vertical fluting.
- **Distance props:** telegraph poles with sagging wires; shrubs; water tower.
- **Sky:** Nishita sky with a saturation/hue tweak, a matched sun lamp, emissive cloud cards.
- **Camera:** 36 mm, vertical sensor.
- **Compositor:** mist haze, then fog-glow glare.

## 3. The animation driver (anim.py)
```bash
blender -b --python blender/anim.py -- --shot hook --from 0 --to 57 --scale 0.6667 --spp 16 --outdir out/hook --tmp /tmp/cards
```
- **Pass 0:** for each frame, set `frame_current` and call `FRAME[shot](f)`. That sets the camera, props and physics, and
  returns `[(card, feet, pose)]`. The card solves its camera-facing matrix and turns world grip points into design-space arm
  offsets.
- **Pass 1:** all unique card poses (hashed) are rendered in one Chromium batch.
- **Pass 2:** for each frame, set the state again, apply the card images, and render the PNG. The script skips frames that
  already exist, so it can resume after a restart.
- **Adding a shot:**
  1. write `setup_x()` (build shot-only assets: loco, chalk, maul…);
  2. write `frame_x(f)` (deterministic: no unseeded randomness);
  3. add both to `SETUP`/`FRAME` and add the range to `SHOTS`.

## 4. Performance traps (all measured on 4 CPU cores, llvmpipe)
| trap | cost | fix |
|---|---|---|
| EEVEE **motion blur** | shadow maps re-rendered per blur step, ~4× slower | off; fake speed with camera motion, or a vector-blur pass only if nothing else is animated |
| **Vector pass + keyframed objects** | EEVEE evaluates and syncs the scene at f−1, f, f+1 (3× full sync of 130k instances) | don't keyframe; set transforms per frame in Python; no vector pass |
| **Geometry Nodes scatter** (instances) | ~6× slower render than a particle system with the same instances (250 s vs 40 s) | keep particle-system instancing for gravel/shrubs |
| gravel **casting shadows** | +25-40 s per frame | `visible_shadow = False` on the rock objects |
| swapping a material's **image datablock** each frame | material recompiles | one image per card; change `filepath` + `reload()` |
| screen-space ray tracing | ~+35 % | off unless reflections are the subject |
| shadow rays 2 / steps 8 | slower | 1 ray / 6 steps is visually the same for the soft sun |
| **exec'd world.py overwrites the caller's globals** (`arg`, `SHOT`, `SCALE`) | every option silently ignored: tests ran at full settings, and a glide QA frame rendered the hook | read the args before the exec, and filter those names when merging globals |

**Measured costs:**
- one still at 4K, 48 spp, ray tracing on: ~590 s;
- animation frame at 1440x2560, 24 spp: ~165 s;
- at 16 spp: ~110-120 s;
- at 540x960, 8 spp: ~45 s;
- scene build + first shader compile: ~60-90 s per process.

## 5. Look-dev loop
1. Test at `--scale 0.25 --spp 8-16` (40-80 s) and view the PNG.
2. Fix, then render the 4K still at 48 spp for the creator.
3. Crop the critical detail at 100 % (maul on the spike, joint gap, faces) before sending.

**Typical first-pass bugs:**
- `join()` without applying the parts' locations sank the rails into the ties;
- the Nishita sun rotation is mirrored vs the sun lamp, so the bright sky is on the wrong side (add π);
- AgX washed out the saturated look (use Standard);
- noisy wave textures caused moiré on the ties.
