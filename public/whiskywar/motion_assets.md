# Whisky War: Remotion motion assets

20 components in `src/whiskywar/motion/` (entry `src/whiskywar/motion/index.ts`), each rendered and checked here. All 60 fps on a transparent background. Fonts: Anton, Baloo 2 and Dancing Script (Google Fonts, OFL) from `public/whiskywar/fonts/`. The two flags are drawn in code (`Flags.tsx`, including the waving pole flag). Nothing is copied from the reference: no Google Earth, no newspaper masthead, no brand labels, no photos of real people.

**Render one** (4K detail, transparent WebM):
```
npx remotion render src/whiskywar/motion/index.ts <id> out/whiskywar/<file>.webm --codec=vp9 --pixel-format=yuva420p --scale=2
```
Names: id `w05-ring-label` → file `w05_ring_label.webm`.

| id | component | size | frames | line | what it does |
|---|---|---|---|---|---|
| `w01-flag-fill` | W01FlagFill | 1080×1080 | 90 | 1 "सोचो, दो देश …" | A red dot pops inside the country, and the waving flag wipes out from it in a growing circle to fill the country shape, with the name in big outlined letters. `kind` canada/denmark, `d` outline path, `from`, `label`. |
| `w02-war-badge` | W02WarBadge | 1080×1080 | 150 | 1 "… जंग लड़ते रहे" | Glossy red "WAR?" disc pops mid-ocean, two thick white curved arrows draw in from both sides, the badge pulses. `text` (e.g. "जंग?"), `a`, `b`. |
| `w03-highlight` | W03Highlight | 1080×400 | 40 | 2 "Whisky War" | Yellow highlighter swipes left→right over the headline (multiply blend, ragged edge). `w`, `h`, `tilt`. |
| `w04-burn-reveal` | W04BurnReveal | 1080×1920 | 60 | 2 → the island | The newspaper burns away from the centre with glowing rims, char and sparks, revealing what is behind. Wrap the paper as `children`. |
| `w05-ring-label` | W05RingLabel | 900×600 | 120 | 2 "Hans Island" | Yellow ring draws round the point, a leader line shoots out, a yellow box types the name in. |
| `w06-type-tag` | W06TypeTag | 800×300 | 90 | 3–4 CANADA / DENMARK / GREENLAND | Yellow box tilts in and the name types inside it letter by letter, then bobs. |
| `w07-distance` | W07Distance | 1080×700 | 120 | 3 "हज़ारों किलोमीटर दूर" | Dashed line draws A→B with a riding label ticking km (and mi). `text` replaces the counter. |
| `w08-pin-pulse` | W08PinPulse | 600×600 | 120 | 4–5 the island pinned | Red dot pops, a thick ring bursts out and contracts onto it, then thin rings keep pulsing. |
| `w09-year-type` | W09YearType | 1080×500 | 130 | 4, 6, 10: 1953 / 1984 / 2022 | Big year types in digit by digit with pops, wipes off at `out`. `color` per era. |
| `w10-two-way` | W10TwoWay | 1080×1080 | 120 | 5 "दोनों किनारों से करीब 18 किलोमीटर" | Two arrows grow from the island toward both shores with counters to 18 km (mi under). `angle`, `len`, `km`. |
| `w11-color-flash` | W11ColorFlash | 1080×1920 | 40 | era changes (6, 8, 10, 11) | Overexposed red→orange→white→magenta→violet wash with a light leak; cut at `peak`. |
| `w12-heli-route` | W12HeliRoute | 1080×1080 | 120 | 7 "Tom Høyem पहुँचे" | A round portrait pops with a typed yellow name tag; a small helicopter flies a curved route leaving a glowing yellow trail. `face` image. |
| `w13-sticker` | W13Sticker | 1080×1920 | 90 | 6–9 bottles, notes, soldiers, helicopter | Any cutout gets a thick white sticker outline and shadow, is thrown in with a spin and lands with a squash and wobble. Pass the prop `<Img>` as `children`; `w`, `h`, `at`, `from`, `spin`. |
| `w14-flag-swap` | W14FlagSwap | 1080×1920 | 120 | 6, 7, 9 the flags | The old flag is yanked out and flung away, the new one thrown in, stabs the ground with a dust puff and waves. `old` (or null), `next`, `at`, `yank`, `plant`. |
| `w15-script-note` | W15ScriptNote | 1080×1920 | 180 | 7 / 9 "… में आपका स्वागत है" | A torn-paper note slides up, the message writes on in red script with a flourish, then it shrinks onto the pole as a little sign. `text`, `sub`, `sign`. |
| `w16-war-arrows` | W16WarArrows | 1080×1080 | 150 | 8 "जंग का ऐलान?" | Three thick red arrows arc from the west to the island; tiny planes and tanks pop up and creep behind them. |
| `w17-tape-stop` | W17TapeStop | 1080×1920 | 40 | 9 "नहीं।" | The scene freezes to grey with VHS tracking lines and a ⏪ chip, then snaps back. Wrap the scene as `children`. |
| `w18-montage` | W18Montage | 1080×1080 | 150 | 10 "ये सिलसिला सालों चलता रहा" | A year counter runs 1984→2022 while flag and bottle stickers drop in and pile up, faster and faster. |
| `w19-island-split` | W19IslandSplit | 1080×1080 | 150 | 10 "करीब 60 प्रतिशत … 40 प्रतिशत" | The island turns slowly; a dashed yellow ridge line draws, the Danish flag paints the east side and the Canadian flag the west (multiplied onto the rock), tags tick 0→60% and 0→40%. `img` = the island model. |
| `w20-border-sweep` | W20BorderSweep | 1080×1920 | 100 | 11 "पहली ज़मीनी सरहद" | A dashed white border draws through the island top to bottom, then CANADA and DENMARK, huge and rotated, sweep in either side. |

**Render all:**
```
for c in w01-flag-fill w02-war-badge w03-highlight w04-burn-reveal w05-ring-label w06-type-tag w07-distance w08-pin-pulse w09-year-type w10-two-way w11-color-flash w12-heli-route w13-sticker w14-flag-swap w15-script-note w16-war-arrows w17-tape-stop w18-montage w19-island-split w20-border-sweep; do
  npx remotion render src/whiskywar/motion/index.ts $c out/whiskywar/${c//-/_}.webm --codec=vp9 --pixel-format=yuva420p --scale=2
done
```

The code zip is `exports/whiskywar_remotion_code.zip` (the motion folder plus the fonts).
