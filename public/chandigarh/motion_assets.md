# Chandigarh: motion assets (Remotion)

Code: `src/chandigarh/motion/` (entry `src/chandigarh/motion/index.ts`, zip `exports/chandigarh_remotion_code.zip`). Maps: `public/chandigarh/maps/`, three warm relief plates (South Asia, Punjab, the Chandigarh tricity) built by `tools/build_chandigarh_maps.py` from EOX Sentinel-2 cloudless (CC BY 4.0) and AWS terrain (SRTM), with the reference's warm lift. Borders come from Natural Earth's India edition: India's official boundary (point-tested: Gilgit, Muzaffarabad, Aksai Chin, Shaksgam, Tawang), Pakistan stopping at India's line, both Punjabs, undivided Punjab and the Chandigarh UT. The Shivalik line and the towns are hand-placed. Fonts: Cinzel (the engraved map labels), Jost (the plan labels), Baloo 2 (Hindi), Anton (numbers), all Google Fonts (OFL).

Every piece copies a move from the reference (`reference_analysis.md`) at the hit-every-second pace of `edit_plan.md`. The maps carry the video: the relief map with raised fills (look A), the paper plan with jute sectors (look B) and the sector spotlight (look C). Props and photos come from your images (cg01–cg26), and nothing is drawn in their place. Fills, rims, labels, ribbons, lines, roads, zones, pills, tags and wipes are graphics, the same as in the reference.

`c99-reel` plays the code-only pieces on the real plates and the paper plan, with the camera moving (about 31 s). The image pieces get checked on your own images once they arrive.

All are 60 fps and transparent unless noted. To render a standalone piece (transparent WebM, 4K detail):
```
npx remotion render src/chandigarh/motion/index.ts <id> out/<id>.webm --codec=vp9 --pixel-format=yuva420p --scale=2
```

| piece | What it does | Line | Image |
|---|---|---|---|
| c01 emboss fill | A region filled as a raised slab over the satellite: multiply colour so the terrain shows through, a white rim, a soft drop shadow and a sheen. Arrives by a soft-edged wipe at any angle (Pakistan west→east, the Punjab split), a fade or a grow from the centre; can be on from frame 0 (India, for the loop) | 1–4, 14 | |
| c02 serif label | Engraved Cinzel caps ("INDIA", "PUNJAB", "1947") in light, dark or gold, each letter fading in as the tracking closes | 1–3 | |
| c03 ribbon | The turquoise water band draws along the Shivalik foothills with a drifting texture, a dark edge and a sheen, "SHIVALIK HILLS" riding its curve | 4 | cg20 (optional) |
| c04 photo bubble | A round bubble grows out of a pin (blur to sharp), with a white rim and pointer; its photo swaps with a pop, a red ✕ can stamp it with a shake, and it can fly off and pop | 1, 3 | cg03, cg11, cg12, cg10 |
| c05 badge | A gold-rimmed icon disc pops on a squiggly leader with a black caption tag; icons flip to swap; can beat (heart) or breathe (lungs) | 1, 4, 9, 13 | cg13–cg18 |
| c06 blob | The rough gold site blob firms up from faint to solid; or the blob fills with a photo and grows organically to full frame | 4, 5 | cg23 (optional), cg01 |
| c07 pill | A dark glass pill grows from a dot and types glowing yellow (or neon green) text, with an optional V-line dot and sub-tag; erases backwards | 5–13 | |
| c08 diagonal wipe | A soft 135° wipe with a light band, into the next scene | 6, 14 | |
| c09 line morph | A hand-drawn line: the UT outline → a human body → the square plan frame, through a twisted in-between, with a boiling line | 6, 14 | |
| c10 brush wipe | Big white painterly brush strokes sweep from top-right to bottom-left, revealing the next shot | 6, 11 | |
| c11 paper tear | The shot tears away in jagged paper strips with shadows, revealing the plan | 6, 12 | |
| c12 sector plan | The plan: 2:3 paper-cut sector tiles in jute paint in with a noisy dissolve; the Capitol block drops with the brain; Sector 17 turns red with the heart beating; one sector darkens and lifts; tiles go pale for the roads; Education and Industrial zones wipe in from the edges; the Leisure Valley ribbon draws and garden dots pop | 6–13 | cg19, cg16, cg17 |
| c13 leader / dim | A dot-ended leader with a typed label ("Capitol Complex", "Sector 17", "Leisure Valley"); dimension lines with ticks counting up ("800m", "1200m") | 6–9 | |
| c14 roads | Roads draw on in maroon, magenta and cyan (V1–V7), dashed footpaths, walkers moving along them; and red veins running out from the city | 1, 9 | |
| c15 spotlight | The Sector 17 aerial pushes in, everything outside a rounded frame goes dark, the frame glows, walker dots wander inside | 8 | cg25 |
| c16 sun rays | The sun slides in glowing; its rays bend over the curved roof and glance off, flickering | 11 | gp10 |
| c17 particles | Living layers: petals drifting (temple), wind streaks (lungs), cool air streaming out of a facade (Secretariat), gold sparkles bursting (the seal) | 5, 10, 11, 12 | |
| c18 highlight | A colour overlay on part of a photo: the High Court roof fills purple, outlines and lifts; or magenta sweeps the honeycomb facade in strips with a cyan base glow | 11 | on cg04, cg05 |
| c19 map grade | Tilt-shift blur bands top and bottom, vignette, warm wash (on every map shot) | maps | |
| c20 seal | The gold seal drops at 2× and slams down with a squash and a dust ring; "WORLD HERITAGE / 2016" pops in its centre; a glint keeps sweeping | 12 | cg26 |
| c21 tag | A black name tag with white caps drops onto a point ("CHANDIGARH", "LAHORE", "KALKA") | 1–4, 9 | |
| c22 card | A photo card flips in like a page, with a white border, sheen, an "AI चित्र" tag, floating; can shrink into a point (the sector tile) | 7, 8 | cg06–cg09 |
| c26 pin hop | The pin with a wobbling "?" hops from point to point over Punjab, squashing and rippling on each landing | 3 | gp19 |
| c27 stop | A car drives in, brakes hard, gets a red ✕ slammed over it with a shake, and reverses out | 8 | cg24 |

From the Garbage Patch kit, reused in the edit: p03 hand arrow (the slope), p07 count up (2016, the temperature), p12 dash paths (rain streaks), p24 pin drop, p32 shock.

Standalone render: `c07-pill`. Everything else takes map geometry or your images and is used in the edit (and the code-only pieces are shown in `c99-reel`).

**New images:** cg25 (the Sector 17 aerial for the spotlight; Sentinel-2 is too coarse at 10 m) and cg26 (a blank gold seal, so no UNESCO emblem is used). Both prompts are at the end of `asset_prompts.md`.
