# West Indies: motion assets (Remotion)

Code: `src/westindies/motion/` (entry `src/westindies/motion/index.ts`, zip `exports/westindies_remotion_code.zip`). Preview of all of them over the dark "Midnight" map: `exports/westindies_motion_preview.mp4`.
All are 60 fps and transparent unless noted. Each one draws a code stand-in until your image arrives, then takes the image as a prop (`src`, `body`, `arm`, `box`, `paper`, `ship`, `bat`).

Render any of them (transparent WebM, 4K detail):
```
npx remotion render src/westindies/motion/index.ts <id> out/<id>.webm --codec=vp9 --pixel-format=yuva420p --scale=2
```

| id | What it does | Line | Size, frames | Image |
|---|---|---|---|---|
| w01-magnifier | Brass magnifying glass glides across the map searching, eased hops with an overshoot, tilt and motion blur into each move, the lens brightens what is under it, a glint slides over the glass | 1 | 1080×1920, 140 | wi03 |
| w02-cross-stamp | Red ✗ in a ring slams onto an island (1.7× → 1 in 7 frames, a twist), squash, shock ring, ink specks, worn-ink edge | 4 | 400×400, 60 | |
| w03-big-count | Big glowing number counts up (0 → 13, or 0 → 4), lands with a bump, a teal ring and a light sweep, the caption types on | 3, 8 | 900×420, 100 | |
| w04-speech-bubble | Yellow bubble builds like the reference's: tick, tail, the bar stretches out, then "यही India है?" types on | 7 | 700×360, 90 | |
| w05-voyage | Columbus's carrack crosses the Atlantic along a path, bobbing and rolling, a gold route line drawing behind it with a dashed shimmer, wake and bow spray; Columbus (w06) rides on deck | 7 | 1080×1920, 260 | wi04 |
| w06-columbus | Two-part rig: breathing, cloak sway, the arm lifts the spyglass to his eye with an overshoot, an optional lean forward | 7 | 600×800, 120 | wi05, wi05b |
| w07-cricketer | A fictional cricketer in plain maroon rises out of the island (masked at the ground line), lifts the bat over his head, gold rays and a sparkle burst, a celebratory bounce | 1, 5 | 600×900, 120 | wi02, wi02b |
| w08-ballot | Ballot box pops in, the ticked ballot tumbles in on an arc and slips into the slot, the box thumps, a ring and a "VOTE" tag | 9 | 600×700, 90 | wi06, wi06b |
| w09-fed-flag | The West Indies Federation flag (blue, four white wavy bands, an orange sun), drawn in code, hoisted, then waving in 24 shaded strips | 8 | 520×640, 120 | |
| w10-crack | A jagged crack races across the joined Federation in 12 frames, white-hot core, red glow, two branches, chips and dust falling | 9 | 1080×1080, 80 | |
| w11-title-card | Frame-0 card: "WEST INDIES" over a maroon "कहाँ है?" sticker, already in place on frame 0 (for the loop), breathing, floating, light sweep; `fo` offsets its clock for the loop's last frame | 1, loop | 1080×640, 120 | wi01 |
| w12-glow-label | Glass pill with a glowing rim, text typing on, an arrow drawing to a pulsing dot: "WEST INDIES", "EAST INDIES", "13 आज़ाद देश", "British राज", "Guyana", "1958" | all | 700×320, 90 | |
| w13-parliament | The parliament building rises out of the ground with a dust band, its windows light one by one, the Federation flag is hoisted on the roof | 8 | 900×700, 140 | wi07 |
| w99-reel | Every piece in a row over the dark map (the grade preview), opaque | | 1080×1920, 1620 | |

The map itself (the dark satellite plates, the white outline drawing round the islands, the island fills and labels, the island tour, the grey-out of Cuba, Haiti, the Dominican Republic and the Bahamas, Guyana's fill, the Federation fills joining and splitting, the camera) is built in the edit, like Panama's.
