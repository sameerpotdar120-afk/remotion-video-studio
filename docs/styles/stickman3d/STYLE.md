# Stickman3D: the studio's core style

**Stickman3D** is our default house style for short story videos. It was first made for *The Old Man Who Lost His
Horse* (`src/horse`, release `horse-v1`): flat, hand-drawn-looking stickman characters standing in a soft-lit 3D
world, with one-word captions and continuous camera moves.

All visuals are produced by code: no AI or stock images. Characters and animals are drawn on canvas, and sets are
procedural three.js geometry with painted canvas textures. Each episode keeps its source audio unchanged, or gets a
new one if the user supplies it.

- **Code:** `src/styles/stickman3d/`. Import everything from that folder's index.
- **Workflow:** `.claude/skills/stickman3d-video/SKILL.md`.
- **Scripts:** `scripts/stickman3d/`.

## 1. Look

| Element | Rule |
|---|---|
| **World** | A real 3D set seen through a perspective camera, lit by a low warm sun with soft shadows (PCF soft, about 2k shadow map) plus hemisphere fill and light fog. Surfaces use painted canvas textures: rammed-earth strata, horizontal plank boards, clay-tile roofs, brick, sand with bird-foot marks and grass tufts. The backdrop is a painted dune band with dark ridge strokes. |
| **Characters** | Flat billboards in the world. They face the camera (yaw only) and cast shadows. They are never lit or shaded by the 3D lights; their colours are fixed and flat, as in a cartoon. |
| **Proportions** (100 units = 1.7 m) | Rounded-square head (27 × 29 units). Pill-shaped robe (25 × 41). Stick legs to y = 98.5 with dark oval feet. Stick arms 34 units long with round hands. Ink outline `#2a1c12`, about 1.55 units thick. |
| **Faces** | Dot eyes, with blush always on. Expression changes are *swaps*, not morphs: `sleepy`, `happy`, `star`, `wide`, `sad`, `angry`, `dizzy`, `closed`. Mouths: `line`, `smile`, `open` (talk), `grin`, `frown`, `o`, `wavy`. |
| **Effects** | Drawn into the character's own sprite: anger marks, sweat drop, sparkles, dizzy stars. World effects (dust puffs, leaves, clouds) are their own sprites. |
| **Animals** | Same ink style, side view: `drawHorse` has gallop, stand, graze, buck and rear poses. Add new animals to `animals.ts` the same way. |
| **Grade** | Every episode gets its *own* grade, never a copy of the reference's. Our default is a clean blue sky, warm sun and a light cool vignette. Story turns get their own light presets: `DUSK`, `NIGHT`, `SUNSET` (war or loss), `OVERCAST` (modern day). Time-lapses blend presets with `lerpLight`. |
| **Captions** | `WordCaptions`: one word at a time with hard cuts and no pop. White Poppins Bold, thin dark outline, soft shadow, at 73 % of the height. The word track is measured from the reference, frame-exact. |
| **Text and calligraphy** | `Hanzi` writes CJK characters stroke by stroke from real stroke-order data (`scripts/stickman3d/hanzi_strokes.py`). For a plain font, use Ma Shan Zheng, subset to the glyphs needed (`public/fonts`). |
| **Format** | 2160 × 3840 (9:16) at 60 fps. Acting runs on twos (30 fps): change poses on even frames. |

## 2. Camera and editing grammar

- **Continuous camera:** prefer it to cuts.
  - A slow drift or push runs through every shot.
  - Fast push-ins go to a close-up, with a 10–16 frame dissolve where the reference has one.
  - Fast pull-outs go back to the group.
  - A whip or truck follows the action.
- **Close-ups:** use a cropped drawing box (`box` on `Figure`) with a high `res`, at about 1.45 m from the face. The
  face sits left of centre, so a gesture arm has room on the right.
- **Transitions:** keep only a few kinds:
  - dissolves (`Seg` with `fi` and `fo`);
  - a white flash for impacts;
  - day/night time-lapses for "weeks later" or "one day"; the sky colour cycles, clouds race and shadows swing;
  - a crane up and away for endings.
- **Acting lands on words:** key every gesture to the caption word's frame. Examples: a shrug on "shrugged", a
  point on "maybe", star eyes and cheering on "luckiest", anger marks on "annoyed".
- **Staging:** characters stand in the open, in front of posts and walls (z nearer to the camera). Check that no
  set piece crosses a face or hides the subject of the line; this was the main QA fix on the horse video.

## 3. The kit (`src/styles/stickman3d`)

| File | What it gives you |
|---|---|
| `chars.ts` | `drawChar`, `drawFx`, the `CAST` looks, `walk` and `idle` cycles, and the `Pose`, `Eyes` and `Mouth` types. |
| `animals.ts` | `drawHorse`, `HORSES` looks. |
| `world.tsx` | `Stage` (canvas, sky, sun, fog), `camAt` keyframed camera, light presets and `lerpLight`. Set pieces: `Ground`, `Path`, `Backdrop`, `House`, `Shelter`, `Wall`, `Fence`, `Tower`, `Tree`, `Hay`, `Roof`. Billboards: `Sprite`, `Figure`, `HorseFig`. |
| `props.tsx` | `Table`, `Lanterns`, `Bench`, `Trough`, `Flag`, `StrawHat`, `Broom`, `Jar`, `Dust`, `Leaves`, `Cloud`. |
| `sets.tsx` | Ready-made sets: `StreetSet`, `StableSet`, `PartySet`, `CorralSet`, `GateSet`, `EmptyStreetSet`, `BusStopSet`, `Dune`. |
| `timing.ts` | `ramp`, `kv`, `talk`, `walkTo`, acting presets (`shrug`, `point`, `cheer`, `hipsAngry`), and `Seg` for shot windows and dissolves. |
| `Captions.tsx` | `WordCaptions`. |
| `HanziWriter.tsx` | `Hanzi` (stroke-by-stroke writing). |
| `CastSheet.tsx` | Dev sheet: composition `Horse-CastSheet`. Use it to check new looks and poses at a glance. |

New looks go into `CAST`, new set pieces into `world.tsx` or `props.tsx`, and new sets into `sets.tsx`, so every
later episode can use them.

## 4. Render and delivery

- Render in 150-frame pieces with `scripts/stickman3d/render_4k.sh`.
  - Each worker gets its own git worktree, temp folder and branch, so any number can run at once safely.
  - Pieces land on `render/<slug>-<worker>`.
- Redo a piece after a fix with a worker named `x1`, `x2`, and so on. The release prefers `-x*` branches.
- `scripts/stickman3d/make_release.sh` joins the pieces, muxes the audio and checks the frame count, then publishes
  a private GitHub release `<slug>-v1` with one download link.
- Speed on one 4-CPU machine: about 8 minutes per 150-frame piece, so about 3.5 hours for a 60 s short. To go
  faster, run workers on separate machines; see the skill's "Render" section.

## 5. A living style

Stickman3D is the base, not a fixed template. Each new video can edit or enhance it: new looks, sets, animals, light
presets, transitions, caption tweaks. When it does:

- Put reusable additions in the core kit (`src/styles/stickman3d`), not only in the episode, so later videos get them.
- Keep changes backward compatible, or update the older episodes that use them. Re-render a still of
  `src/horse` to confirm.
- Add a line to the changelog below: the episode, what was added or changed, and why.
- If a video needs a one-off look, such as a different caption position or a different grade, give the kit a
  parameter for it instead of forking the code.

### Changelog

| Episode | Change |
|---|---|
| horse (`horse-v1`) | Style created: cast, horses, village sets, props and effects, light presets, one-word captions, Hanzi brush writer, camera and transition grammar. |
