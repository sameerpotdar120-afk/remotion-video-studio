# 07 · Engine A: three.js inside Remotion (video #3, "Nest of Bees")

Repo: `remotion-video-studio`. Composition per video in `src/videos/<name>/`, registered in `src/Root.tsx`.
Started from the cartoon-3d-short "bridge" template (`src/videos/bridge/`).

## Stack (pinned)
- remotion 4.0.523 + @remotion/three 4.0.523, three 0.175, @react-three/fiber 9.1.2, @react-three/postprocessing 3.0.4,
  postprocessing 6.37.2.
- Software WebGL: `--gl=swangle`. Headless shell: the pre-installed chromium headless shell.
- Render: `npx remotion render <Comp> out.mp4 --scale=2 --gl=swangle --concurrency=2 --crf=16 --muted --frames=a-b`
  (author at 1080x1920, scale 2 → 4K).

## Building blocks (bridge template)
- **Shading:**
  - `twoTone` / `cardShade` (toon ramps);
  - paint textures (`paint.ts`: wood, stone, grass painted in code);
  - `lam()` Lambert helper, `Batch` / `boxGeo` instancing.
- **Post chain** (order matters):
  1. ink (edge pass, world layer only; `NOINK` layer for cards and sky);
  2. lens blur pre/main (circle of confusion from depth);
  3. bloom;
  4. Neutral tone map;
  5. day grade;
  6. vignette.

  Keep ink before blur on the world, or ink disappears (the tutorial's bug). N8AO broke the depth that DOF reads, so it was removed.
- **Hero card:**
  - `HeroCard` draws `char()` into a CanvasTexture each frame;
  - grips are ray-projected onto the card plane;
  - the drill/props draw over the card with `depthTest=false` and renderOrder 3.

## Shot system
- **Files:**
  - `story.ts`: FPS, TOTAL, `wordAt()` (exact word match; prefix matching put a shot at the wrong word), cue objects `T`/`M`,
    `LEAD` (action lead), `XF` (dissolve frames), the `SHOTS` list, `layersAt(f)` for dissolves, plus story clocks such as
    `tau(t)` (a volley clock with flash-forward, slow motion and real-time segments);
  - `world.ts`: sets plus `update(si, f, cam, scene)` per-shot poses, `dof(id, t)`, and the camera per shot;
  - `Nest.tsx`: renders the active layers per frame (two ShotViews during a dissolve).
- **Physics modules:** `volley.ts`, with rockets solved for burn/yaw to hit a target, drag, `wallCheck` that throws if a path
  touches the parapet, trail fade near the camera, and cel fire/smoke/debris instanced. See `09`.

## When to choose it
- **Pros:** fast iteration (seconds per preview frame), 60 fps 4K at ~4-8 s/frame on 2 threads, ink look family A, many
  characters, deterministic.
- **Cons:** lighting richness, terrain scale and metal/smoke realism are below Blender.
