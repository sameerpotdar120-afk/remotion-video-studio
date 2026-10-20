# Remotion prompts v2 — asset stills only

Supersedes `PROMPTS_REMOTION_MISSING.md`. ChatGPT's Remotion makes **asset stills only**. Everything else (the
maps, the map looks and colour grade, character animation, scene building, sourcing map data, SFX and music) is
built in this repo. Image prompts are in `docs/PROMPTS_IMAGES_v2.md`.

| # | Asset | Why it's made in Remotion | Output |
|---|---|---|---|
| R1 | Bourbon France flag | Flags are drawn in code (AI draws them wrong); the current one is a plain white rectangle, which reads as a surrender flag | `flags/bourbon_france.png` |
| R2 | White block arrow | The GPT arrow lost its fill (interior alpha 0); a code arrow matches the reference exactly and stays crisp at 4K | `icons/arrow_white_block.png` |

Both prompts are self-contained: they need **no project code**. Each one creates a one-frame composition and
renders a still. If ChatGPT's file runtime is down, these can't run there; say so and they'll be rendered in the repo
instead.

---

## R1. Bourbon France flag → `flags/bourbon_france.png` — S20 "France इस जंग में"

```
Create a minimal Remotion 4.0.523 project with ONE composition, id "Flag-Bourbon", width 3600,
height 2400, fps 30, durationInFrames 1, transparent background. It renders an SVG (viewBox 0 0 3 2,
filling the frame) of the French royal Bourbon flag of the 1770s:
- field: off-white #FBFBF5, with a very thin #BBBBBB edge line (0.01)
- gold fleurs-de-lis #D4AF37 with a thin #8A6A12 outline (stroke 0.006), sown in a staggered grid:
  5 columns x 3 rows, alternate rows offset by half a column, each fleur about 0.28 tall
- draw ONE fleur-de-lis as a <path> inside <defs> (the classic heraldic lily: a tall central petal,
  two outward-curling side petals, a horizontal band across the middle, three short stems below)
  and place every copy with <use>
- no shading, no wind, no pole, no text
Render it with:
  npx remotion still src/index.ts Flag-Bourbon bourbon_france.png --image-format=png
Show me the PNG at full size and at 200 px wide.
```
**Check:** gold lilies clearly visible even at 200 px. **No blue field** (a blue field with three lilies is the royal
*arms*, not the flag).

---

## R2. White block arrow → `icons/arrow_white_block.png` — Britain's arrow (S05, wherever `ArrowBob` is used)

Reference f950: a chunky **solid white** arrow, **no outline**, with a soft drop shadow.

```
Create a minimal Remotion 4.0.523 project with ONE composition, id "Icon-Arrow", width 2048, height
1024, fps 30, durationInFrames 1, transparent background. It renders an SVG block arrow pointing
RIGHT, centred, filling about 84% of the width:
- shaft: a rectangle, height 36% of the canvas height, starting at 8% of the width
- head: a triangle, full height 82% of the canvas height, its base 56% of the way along, its tip at
  92% of the width
- shaft and head merged into ONE path; corners rounded with a 2% radius
- fill: solid opaque white #FFFFFF. NO outline, NO stroke
- a soft drop shadow under it: offset (0, 2.5% of the height), blur 3% of the height,
  colour rgba(0,0,0,0.35), applied with an SVG feDropShadow filter
Render it with:
  npx remotion still src/index.ts Icon-Arrow arrow_white_block.png --image-format=png
Show me the PNG on a checkerboard so I can confirm the white fill is OPAQUE.
```
**Check:** the inside of the arrow is solid white on a checkerboard. The old one was see-through. The animation
rotates it to any direction, so it only needs to point right.

---

## Not made in ChatGPT anymore

| Item | Where it's built now |
|---|---|
| Map looks, colour grade, 3D terrain | Repo (`src/lib/three/Map3D.tsx`, `src/lib/fx/particles.tsx` Grade, `public/assets/maps_raster/`) |
| Neon glow and screen blending | Repo (the neon PNGs come from the image prompts, on black) |
| Musket handling, hands, held props, staging | Repo (`Puppet` / `MapCharacter`, matched to the reference frames) |
| Union Flag 1707, Grand Union 1775 | Already rendered; unchanged |
| Map data, public-domain scans, SFX, music | Sourced in the repo from copyright-free sites (blocked hosts must be allowed first) |
