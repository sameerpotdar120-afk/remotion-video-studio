# Anime Western: set-building brief (for helper sessions)

We are making a 9:16 anime-style Western short in three.js + Remotion. The look is already set by
`src/anime/farm.ts` (the Hale farm). Every new set must look like it belongs in the same film. Read farm.ts first.

## Style (copy farm.ts)
- Toon shading via `toonE(color, { map, shade })` (exported from farm.ts): lit side warm, shadow side dusky violet.
- Hand-painted canvas textures, not flat colour: use/adapt `planks`, `shingles`, `stones`, `groundTex`, `grassCard`, `treeTex`, `cloud`.
- Ink outlines on solid props: `box(w,h,d,mat,x,y,z,inkWidth)` already adds one; `ink(mesh, w)` for other meshes.
- Glowing things (windows, lamps, sun, floodlights) are `MeshBasicMaterial({ toneMapped: false })` plus an additive glow sprite (`glowTex`).
- No bloom / post-processing (it washed the colours out). No photoreal textures, no downloaded assets, no logos, no real brand names.
- Real-world scale in metres. Characters are ~1.6-1.8 m tall, floor at y = 0.
- Keep it renderable: one 4096 shadow-casting directional key light max, `castShadow/receiveShadow` set by the viewer, < ~3000 grass cards.
- Deterministic: no `Math.random()` (use a seeded rnd like farm.ts), `update(t)` must be a pure function of time.

## Contract
Each set is one file `src/anime/sets/<name>.ts` exporting `build<Name>(): BuiltSet` (see `sets/types.ts`):
`group` (incl. the set's own lights), `update(t)`, optional `fog`, `cams` (named shot cameras, 1080x1920 portrait),
`marks` (named standing spots). Replace the stub file; do not edit other files except `sets/index.ts` if you add a set.

Check your work with the look-dev composition (white capsules stand on the marks for scale):
```bash
npx remotion bundle src/index.ts --out-dir=/tmp/b --log=error
npx remotion still /tmp/b SetView /tmp/out.png --props='{"set":"fort","cam":"main"}' --timeout=300000 --log=error
```
Renders must run from the repo root (otherwise Remotion tries to download Chrome). Software WebGL: ~5-15 s per still.

## Sets and the shots they serve
Helper 1:
- **fort** (bright late-afternoon, blue sky + soft clouds): log palisade with pointed tops, big open double gate, a few
  wooden barracks, flagpole with a plain flag (no real flag), packed-dirt parade ground, a target fence with bottles/tin cans
  on it at the far end. Cams: `gate` (inside, looking at the open gate, a figure walking in), `yard` (soldiers in a line,
  medium), `targets` (over-the-shoulder towards the target fence), `main`. Marks: gate, yard line of 4, shooter, targets.
- **town** (dusty day, warm): one street of false-front wooden buildings with boardwalks, hitching rails, a saloon with
  swinging doors and a big painted sign "SALOON", water tower or barrels. Cams: `street` (low, down the middle),
  `saloonFront`, `duel` (two figures facing each other ~10 m apart), `main`. Marks: saloonDoor, duelA, duelB, twinsL, twinsR.
- **saloon** (interior, night, warm lamplight + cool moonlight through windows): bar counter with bottles and mirror,
  round poker tables with cards/chips, chandelier with candle glows, stairs + balcony, swinging doors to the dark street.
  Also a **poker corner** cam (one table under a hanging lamp, tight). Cams: `door` (from the doors looking in),
  `table` (the far poker table, three men seated), `poker` (tight lamp-lit table), `main`. Marks: door, table, seat1-3, bar.

Helper 2:
- **cabin** (night, moonlit blue, warm window): small log cabin in a pine wood, porch with a rifle leaning by the door,
  lit window with two silhouettes possible, a track leading up to it. Cams: `approach` (from the track, rider coming in),
  `window` (close on the lit window), `porch` (low, from where a rider would sit), `main`. Marks: door, porch, rider, rifle.
- **graveyard** (soft overcast day, slightly desaturated): small hillside graveyard, wooden crosses, picket fence, an open
  grave with a mound of earth and an open wooden coffin beside it, a lone tree. Cams: `overhead` (top-down on the coffin),
  `mourners`, `main`. Marks: coffin, mourner1-4, kid.
- **campus** (sunny, decades later): red-brick college building with white trim, lawn, a big tree, a path. Cams: `handshake`
  (medium two-shot), `main`. Marks: manA, manB.
- **stadium** (night game, big floodlights): one side of a stadium, stands packed with a cheering crowd (painted crowd
  cards / instanced simple shapes that bob, deterministic), field grass with white yard lines, goalposts, floodlight towers.
  Use neutral team colours (no real school colours or logos). Cams: `field` (low, on the field facing a figure),
  `crowd` (into the stands), `main`. Marks: mascot, crowdFront.

## Delivery
Commit on your own branch (you will be told its name) and push often. Post a preview still of each cam in
`docs/anime/sets_preview/<set>_<cam>.jpg` (540 px wide). Do not commit anything under `episodes/pp` or `public/pp`.
