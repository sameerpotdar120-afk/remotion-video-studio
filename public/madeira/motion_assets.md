# Madeira: motion assets (Remotion)

Code: `src/madeira/motion/` (entry `src/madeira/motion/index.ts`, zip `exports/madeira_remotion_code.zip`). Map: `public/madeira/maps/` (the dark "Midnight" Atlantic, archipelago and Madeira plates, built by `tools/build_madeira_maps.py` from Sentinel-2 (EOX), AWS terrain and Natural Earth; Madeira's coastline traced from the terrain, 319 points). `m99-reel` lays every piece on the real map with the camera moving.

Every piece follows the reference's moves and timing (see `reference_analysis.md`). The trees, flames, title, cane, sugar loaf, boats, photo cards, bottle and Ronaldo come from your images (md01–md16) as props. Nothing is drawn in their place; I tested them with images from earlier videos and will check them again with yours before you see a preview.

All are 60 fps and transparent unless noted. Render a standalone one (transparent WebM, 4K detail):
```
npx remotion render src/madeira/motion/index.ts <id> out/<id>.webm --codec=vp9 --pixel-format=yuva420p --scale=2
```

| piece | What it does | Line | Image |
|---|---|---|---|
| m01 neon | Red neon outline (hot core, red stroke, wide glow). `strobe`: outline and a yellow-green fill flash 3 times, 4 frames on and 4 off, then breathe. `draw`: draws round the coast with a running light at its head, then a slow light keeps circling | 1, 9 | |
| m02 forest | Trees spring up in a wave from west to east (each from its base, with an overshoot), back to front, crowns swaying; the fire front swaps each tree for the burning one as it passes; `clear` shrinks them away in a wave (the ash) | 2–5 | md02, md02b, md03 |
| m03 fuse | A burning fuse runs along the south coast: glowing gold line, a white-hot tip with your flame flickering on it, sparks spitting backwards | 3 | md04 |
| m04 fire | Fires light up as the front reaches them, your two flames swapping and stretching in the wind, a warm glow pooling under each, embers rising | 3–4 | md04, md04b |
| m05 title drop | Your wooden MADEIRA lands letter by letter (each a slice of the image dropping from above with a back-ease bounce, 3 frames apart), red neon glow swelling behind it | 2 | md05 |
| m06 voyage | The caravel rides a dashed route from Lisbon (bob, roll, wake); the camera locks on it in the edit | 2 | md01 |
| m07 sprout | Sugar cane shoots up out of the ground, clump after clump, then sinks back down one by one when the trade moves to Brazil | 5–6 | md06 |
| m08 card flip | Photo card turns in like a page from its left edge (3D, perspective, a moving shadow and a sheen), lands with an overshoot, floats; can shrink and fly into the island | 7–9 | md09, md09b, md10, md12 |
| m09 zoom through | The bottle pops up, a light sweeps down the glass, then it rushes at the camera (×9, motion blur) to cut to the next shot | 8 | md11 |
| m10 neon label | White letters with red neon glow, each dropping in with a bounce, or a number counting up (0 → 2,000 km, 0 → 7 साल) with a bump: "लकड़ी", "सफ़ेद सोना", "Funchal" | all | |
| m12 player | Ronaldo dribbling over the island (stride bob, lean, contact shadow, rushing in from 1.6×), or popping up for the celebration and the boy (landing squash, gold rays, flash ring) | 10 | md13, md14, md16 |
| m13 embers | Embers drift up through the frame, flickering; loops seamlessly (under the loop's last and first frames) | 4, 11 | |
| m14 trade | Gold arcs shoot from Madeira to Europe's ports one by one, your sugar loaf riding each tip, a shimmer and a pulse ring on arrival; then one arc to Brazil | 5–6 | md07 |
| m15 levadas | Blue water lines draw across the island one after another, with glowing heads, then a shimmer keeps flowing along them | 7 | |
| m16 boats | Your settlers' boats bob offshore, lit orange from the fire, ripple rings spreading | 4 | md08 |
| m17 pin label | Red pin drops and squashes, pulse ring, a boxed label rises out of it: "Funchal", "Cristiano Ronaldo International Airport" | 10 | |
| m99 reel | Every piece in a row on the real map (`m99-reel`; `m99-reel-test` is my test harness with old images) | | |

The dive from Europe, the camera, the map, the cuts between plates and Null's split screen are built in the edit, like Greenland's.
