# Panama Canal: Remotion motion assets

22 components in `src/panama/motion/` (entry `src/panama/motion/index.ts`), each rendered and checked here. All 60 fps, transparent background unless marked "opaque scene". Fonts: Anton and Baloo 2 (Google Fonts, OFL) from `public/panama/fonts/`. Ships, the chibi Panamanian (`Kid.tsx`), the locks cross-section, pools, gavel, dam, ECG and route are all drawn in code; where a UE5 image is coming (`pc01`–`pc06`), the component takes it as a prop (`ship`, `gold`, `hammer`, `block`) and the code drawing is the stand-in. Nothing is copied from the reference.

Each component copies a move measured frame by frame in the reference (see `reference_analysis.md`). Nothing holds still: every element has an idle float once it lands, fast moves get motion blur from their speed, landings overshoot and settle, and textures keep living (wakes flicker, halos pulse, dashes stream, water ripples, light sweeps). `p99-reel` plays all 22 in a row; a half-resolution preview is `exports/panama_motion_preview.mp4`.

**Render one** (4K detail, transparent WebM):
```
npx remotion render src/panama/motion/index.ts <id> out/panama/<file>.webm --codec=vp9 --pixel-format=yuva420p --scale=2
```

| id | component | size | frames | line | what it does |
|---|---|---|---|---|---|
| `p01-ship-queue` | P01ShipQueue | 1080×1920 | 240 | 1 and the loop "एक ship ने 5.3 million dollar दे दिए…" | A long diagonal queue of ships creeping toward the canal (bob, yaw, wakes); one glows gold with a pulsing halo, and at `overtake` it pulls out and races past the line (motion blur, long wake), red rings rippling at the ships it passes. `lanes` for parallel queues. Images: `ship`, `gold`. |
| `p02-bob-arrow` | P02BobArrow | 300×300 | 60 | 1 | A thick red arrow with a white rim pops in, points at the gold ship and bobs along its axis with a squash, fades at `out`. |
| `p03-odometer` | P03Odometer | 1000×260 | 120 | 1, 3, 4, 5 ($5.3M, 20 करोड़ लीटर, 36 ships, 36 → 22) | A big glowing number counts `from` → `to` with scrambling, motion-blurred lower digits, then lands with a bump and a glow flash. `prefix`, `suffix`, `indian` separators, `down` (red with ↓). |
| `p04-sticker` | P04Sticker | 1080×500 | 180 | frame 0 and the loop | "PANAMA CANAL" over a red tilted "सूख रही है" sticker, already in place on frame 0 so the loop matches; breathes, floats, a light sweep crosses it; fades at `out`. |
| `p05-stamp` | P05Stamp | 1000×320 | 90 | 5 "record बोली", "TRAFFIC फिर कम!" | A worn red rubber stamp slams from 1.5× with a twist, shake and a dust puff, then breathes. `text`. |
| `p06-label` | P06Label | 600×300 | 90 | every name and pill | A rounded tag pops with an overshoot, its text typing on, a leader line drawing to a pulsing anchor dot, then floats. `look`: dark, pill (with a `tag`), red. |
| `p07-salt-fresh` | P07SaltFresh | 1080×1080 | 110 | 2 "समुंदर के पानी से चलती ही नहीं… मीठे पानी की झील से" | Curved "खारा पानी" arrows draw from both seas, red ⊗ marks slam on, then a green ✓ "मीठा पानी" pops at the lake with a ring burst. Points `a`, `b`, `c`. |
| `p08-locks` | P08Locks | 1080×1920 opaque | 540 | 2 "Locks हर ship को 26 मीटर ऊपर उठाकर…" | The cross-section: Atlantic, three chambers up, Gatun Lake, three down, Pacific. The ship sails into each chamber, the water rises (or drains) with ^ / v arrows, gates slide open, the camera follows, a yellow bar counts 0 → 26 m; tags for Gatun Locks, Gatun Lake, Pedro Miguel, Miraflores. Image: `ship` (side view). |
| `p09-water-arc` | P09WaterArc | 1080×1080 | 150 | 3 "20 करोड़ लीटर मीठा पानी समुंदर में बह जाता है" | A glowing ribbon of water arcs from the lake into the sea, bright dashes streaming along it, droplets spraying, a splash ring pulsing where it lands. |
| `p10-pools` | P10Pools | 1080×1920 opaque | 220 | 3 "मतलब 80 Olympic pools, सिर्फ़ एक ship के लिए खत्म" | On navy, pool tiles (water, lane lines, shimmer) pop in row by row as the count runs to `n`, "= 1 [ship]" slides in, then at `drain` the pools empty row by row and the ship sails off. Image: `ship`. |
| `p11-rain-cloud` | P11RainCloud | 800×800 | 150 | 4 "भरती है सिर्फ़ बारिश से", 5 "बारिश नहीं आई" | A fluffy cloud of breathing puffs drifts in raining (streaks and splashes); from `dry` the rain stops and the puffs shrink and evaporate one by one. |
| `p12-kid` | P12Kid | 800×1000 | 440 | 5 "2023 में बारिश नहीं आई…", 6 "Panama के आधे लोग पीते हैं" | The chibi Panamanian (white shirt, Panama flag badge) pops up and changes face on `beats` = [[frame, face, mark]]: cry with tear streams, "!" shock, drink from a paper cup, "?" puzzled; squash on each change, a sway and blink throughout. |
| `p13-sun` | P13Sun | 600×600 | 150 | 5 the drought | A hot cartoon sun: the disc pulses, two rings of rays turn opposite ways and pulse in length, a wide glow and a heat-shimmer ring. |
| `p14-waiting` | P14Waiting | 600×600 | 100 | 5 "दोनों तरफ़ किलोमीटर लंबी line लग गई" | Tiny anchored ships pop into a cluster one by one, swinging on their anchors; a red hand-drawn circle draws round them; a "Waiting" tag pops. Image: `ship`. |
| `p15-el-nino` | P15ElNino | 1080×1920 | 120 | the drought cause (El Niño) | A warm red band spreads along the equator over the map, ragged and churning (turbulence displacement), breathing. `y`, `h`. |
| `p16-calendar` | P16Calendar | 400×400 | 90 | 5 "इस साल September के एक slot के लिए" | A calendar tile pops in tilted, "SEPTEMBER" on the red header, the year flips down with a bounce, then floats. `month`, `year`. |
| `p17-auction` | P17Auction | 1080×1080 | 140 | 5 "auction होने लगे… 5.3 million dollar की record बोली" | A gavel winds up and strikes its block four times (shock rings, screen kick); bid tags pop up a stack ($1M, $2.5M, $4.6M) and the last strike lands the gold "$5.3M" with a sparkle burst. Images: `hammer`, `block`. |
| `p18-lake-bubble` | P18LakeBubble | 500×700 | 100 | 6 "इसी Gatun Lake का पानी…" | A glowing leader draws up from the character's head and a round lake inset pops (the satellite crop inside slowly drifting), with a "Gatun Lake" tag. `src`. |
| `p19-balance` | P19Balance | 900×700 | 140 | 6 "एक ही झील पर ships का business भी है, और पीने का पानी भी" | A weighing scale pops in; a ship drops into one pan, a water drop into the other; the beam keeps seesawing and the pans swing; labels under each. |
| `p20-dam` | P20Dam | 1080×1080 | 140 | 7 "Río Indio नदी पर एक नया dam" | A river draws down the map with a flowing dash, a curved concrete dam drops across it with a bounce and dust ring, the reservoir fills as a soft blob, a dashed arrow runs to "→ Gatun Lake". `river`, `dam`, `to`. |
| `p21-ecg` | P21Ecg | 800×240 | 180 | 7 "canal को ज़िंदा रखने के लिए", 8 "अगर पानी फिर भी खत्म हो गया" | A heart monitor: a green ECG trace sweeps with a bright head dot, the heart beats on each spike; at `flat` it turns red and flatlines, the heart greys. |
| `p22-route` | P22Route | 1080×1920 | 130 | 8 "पूरा South America घूमकर… लगभग 13,000 किलोमीटर ज़्यादा" | A glowing yellow route draws round the continent with a streaming shimmer; the distance tag pops and counts up to "+13,000 km". `d`, `len`, `km`, `tag`. |

**Render all:**
```
for c in p01-ship-queue p02-bob-arrow p03-odometer p04-sticker p05-stamp p06-label p07-salt-fresh p08-locks p09-water-arc p10-pools p11-rain-cloud p12-kid p13-sun p14-waiting p15-el-nino p16-calendar p17-auction p18-lake-bubble p19-balance p20-dam p21-ecg p22-route; do
  npx remotion render src/panama/motion/index.ts $c out/panama/${c//-/_}.webm --codec=vp9 --pixel-format=yuva420p --scale=2
done
```

The code zip is `exports/panama_remotion_code.zip` (the motion folder plus the fonts).
