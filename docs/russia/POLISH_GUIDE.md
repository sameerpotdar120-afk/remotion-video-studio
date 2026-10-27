# Russia video — polish pass (one helper per chapter)

The user's bar: the generated images are high quality, so **every frame must look deliberate** — no sloppy
placement, nothing cut off by accident, everything clear and readable. You own ONE scene file. Work through it
shot by shot, using dense review stills, and fix every problem below.

## Workflow

1. `git fetch origin ccr-b793949a-9xc6cy && git checkout -B polish/russia-<chapter> FETCH_HEAD`
2. Review stills of your frame range every 90 frames (1.5 s), 1/3 scale:
   `node scripts/russia/stills.mjs /tmp/rv 0.3333 $(seq <first> 90 <last>)` — then LOOK at every still
   (build contact sheets of 2×5 with PIL to read them fast). Also check 3–4 consecutive frames (e.g. f, f+6, f+12)
   around every entrance/exit/transition to catch pops, flicker and overlaps in motion.
3. Fix problems in YOUR scene file only (src/russia/scenes/<file>.tsx). Keep every cue on its VO word (`at(p, phrase)`).
4. Re-render the stills you touched and verify the fix. Typecheck: `npx tsc --noEmit -p .`
5. Commit to `polish/russia-<chapter>` and push (`git push -u origin polish/russia-<chapter>`), then report
   a short list of what you changed. Don't touch src/russia/kit/*, src/russia/map/*, RussiaFinal.tsx or other
   chapters: if you need a kit change (a new prop of a component, a bug in one), describe it in your report
   instead and work around it locally if you can.
6. Delete `/tmp/remotion-webpack-bundle-*` only when no render of yours is running.

## What counts as a problem (fix all of them)

- **Empty or dead frames**: a grey stage with only the host or only one small caption, or a blank stage between
  beats. Every frame needs a clear subject: bring the next element in earlier, scale things up, add a relevant
  prop/character/icon from `public/russia/assets` (see `src/russia/kit/assets.generated.json`), or hold the
  previous element longer. Nothing should sit motionless for more than ~2 s (camera drift, idle bob, blinks count).
- **Cut-off characters/props**: feet, horses' legs, bodies or heads cut by the frame edge (unless it is a
  deliberate close-up). Standing characters' feet (y) must be inside the frame with ≥ 3 % margin; riders and
  horses fully visible. Rows of characters must not overlap each other's faces, and must not stack on top of
  each other.
- **Scale & composition**: characters on photo backgrounds should stand on the floor/ground of the picture
  (lower third), sized plausibly for the scene (≈ 45–60 % of frame height for 1–3 characters, smaller for crowds),
  not floating in the sky and not tiny. Keep the main action inside the safe area (5 % margins). Balance the
  frame: don't put everything in one corner with the rest empty.
- **Text**: captions must never overlap each other, a face, the year tag (top-left), or the collapse marks
  (top-right, x ≈ 0.70–0.85 W, y ≈ 0.04–0.1 H). One idea per caption; don't stack 3 captions. Text must not run
  off-screen. Partial type-on states are fine.
- **Overlays**: smoke, haze, snow, vignettes must not wash out the scene (characters must stay clearly visible).
- **Maps**: labels must not collide with each other or with tokens; tokens/pins on the right place; routes visible.
- **Transitions**: no one-frame flashes of the previous/next shot, no elements popping in and out within < 10 frames.
- **Gestures**: a gesture should match the line (pointing at what's being talked about, hands-on-head for shock);
  avoid gloves covering faces for long.

## Useful facts

- Composition is 3840×2160 @ 60 fps; `W`, `H` from `src/lib/constants`.
- `Char who=` (cast.tsx) / `Peg` props: x, y = FEET bottom centre; height = full height incl. legs;
  `legs={false}` for seated/riding; `flip` to face left; `walk` keys; `gestures`, `moods`.
- `Rider`: `height` is the horse box height; it is 1.5× as wide; the rider sits on the saddle.
- `RImg src="props/x.png" w h` (contain-fit), `PopIn`, `TypeOn`, `Caption`, `Stamp`, `BigNumber`, `Frame`, `BgPlate`.
- Asset list with descriptions: `scripts/russia/asset_list.py`.
