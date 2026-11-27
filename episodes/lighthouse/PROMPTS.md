# The Man Who Wished for the Storm: LAYERED GPT prompt pack (Napoleon / Caesar method)

147.3 s Short (your VO at 1.10x), 9:16, 4K final. Every time below is from your real VO, so cuts land on words.

## How it works (same as Caesar)
We generate pieces, not pictures. I assemble them in Remotion:
- **empty sets** with nobody in them;
- **characters as pose cut-outs** that swap 8–12 times a second;
- **ships and boats** that sail;
- **a lighthouse that is built up stage by stage on the rock**;
- **waves that sweep across the frame**;
- **effects:** spray, rain, lightning, sparks;
- **animated maps**, and a telescope view drawn in code.

The googly eyes and mouths are tracked to every face, like Caesar.

New this time (from the reference analysis):
- an animated parchment map (a pin drops, a route line draws itself);
- the tower growing in stages;
- a telescope view;
- a sepia flashback;
- a recurring **seagull** witness with googly eyes who reacts all the way through and ends alone on the empty rock.

**Totals: 214 images**

| Group | Codes | Images |
|---|---|---|
| Character sheets | CS1–CS6 | 6 |
| Empty backgrounds | BG01–BG28 | 28 |
| Henry Winstanley poses + 6-frame walk | WN01–WN42 | 42 |
| Workers | WK01–WK14 | 14 |
| French privateers + King Louis | FP01–FP08, LX01–LX03 | 11 |
| Friends, keepers, shore people | FD01–FD04, KP01–KP03, SP01–SP06 | 13 |
| The seagull | GL01–GL08 | 8 |
| Ships and boats | SH01–SH16 | 16 |
| Lighthouse stages | LT01–LT12 | 12 |
| Water: waves, spray, foam | WV01–WV14 | 14 |
| Props | PR01–PR24 | 24 |
| Map pieces | MP01–MP06 | 6 |
| Other FX | FX01–FX20 | 20 |

**Rules (same as last time):**
1. Name files exactly by code. Use GPT's **largest native size, no upscaling**. Keep subjects **big in the frame**: faces should not be tiny, so they stay sharp.
2. Cut-outs on a transparent background. A plain light-grey background is fine if GPT refuses; I'll cut it out myself.
3. **Attach the right character sheet** to every character prompt.
4. **Copy the lighting text exactly** so cut-outs match the set they go on.
5. **Cycles** (walk, rowing, hammering, wave, gull flap): make frame 1, then **edit** it for each next frame. Change only the pose.
6. Faces visible, eyes open, mouths closed.
7. Nothing graphic: no bodies; the storm destroys things, not people.

---

## Copy blocks

### STYLE LOCK (paste once at the start of every GPT chat)
```
For every image in this chat: a real cinematic film still look, shot on an ARRI Alexa with a 35mm or 50mm prime lens,
Kodak Vision3 film emulation, natural film grain, rich deep colour. Natural skin with real pores and imperfections,
real fabric weave, wet weathered wood, granite, salt spray. Historically grounded England, 1696-1703: late
seventeenth-century clothing, wooden sailing ships, Plymouth, the English Channel. NOT a video game render,
NOT CGI, NOT plastic or waxy skin, NOT over-sharpened, NOT HDR, NOT upscaled. NO text, NO letters, NO watermarks,
NO logos, NO borders, NO cartoon eyes or drawn faces. Faces clearly visible with eyes open and mouths closed.
Keep every character identical to the attached character sheets.
```

### CUT-OUT HEADER (start of every WN / WK / FP / LX / FD / KP / SP / GL / SH / LT / WV / PR / MP / FX prompt)
```
Isolated cut-out on a fully transparent background (PNG with alpha channel). No scenery, no ground, no floor shadow,
no background colour. The whole subject inside the frame with a small margin, nothing cropped, clean sharp edges,
every hair, rope and spray droplet visible. Exactly the character from the attached sheet.
```

### LIGHTING (paste the one named)
- **L-DAY:** `bright overcast-sun English Channel daylight from the upper left, cool clean light, soft shadows on the right, sea-blue bounce`
- **L-GOLD:** `low golden-hour sun from behind on the right, warm amber rim light, soft warm fill on the front`
- **L-STORM:** `night storm, cold blue-white lightning light from the upper right, deep navy shadows, wet sheen on everything`
- **L-CANDLE:** `warm candle and lantern light from the left, golden glow, rich soft shadows`
- **L-GREY:** `flat grey dawn after a storm, soft cold light, desaturated, damp`
- **L-PARCH:** `flat warm even light, like an old document on a table`

### BACKGROUND MOODS
- **M1 CHANNEL DAY:** `cool bright daylight over the English Channel, grey-blue sea, white foam, moving clouds`
- **M2 GOLDEN:** `golden-hour sun, amber haze on the water, long shadows`
- **M3 STORM NIGHT:** `black-navy storm night, lightning, huge waves, rain streaks, wind-torn spray`
- **M4 CANDLE INTERIOR:** `warm candle-lit interior, dark wood, deep shadows`
- **M5 GREY DAWN:** `cold grey dawn after a storm, flat light, mist, desaturated blue-grey`
- **M6 SEPIA:** `faded warm sepia, like an old memory`

---

## Part 1: Character sheets (make first; attach to every later prompt for that person)

**CS1 HENRY WINSTANLEY (the hero)**
```
Character turnaround sheet on plain light grey, the same man 4 times full body (front, three-quarter, side, back) plus a
chest-up close-up. HENRY WINSTANLEY: Englishman aged 55, tall and lanky, long narrow face, thin dark moustache, big
confident showman grin, long brown curly full-bottomed periwig, black tricorn hat with gold trim, deep claret-red
knee-length coat with gold buttons and wide turned-back cuffs, cream waistcoat, white lace cravat, dark breeches,
white stockings, black buckled shoes. Eyes open, mouth closed.
```
**CS2 THE WORKERS** (four distinct men)
```
Character sheet on plain light grey, four Plymouth labourers side by side, full body front view, 1690s working
clothes, rolled sleeves, knitted caps: 1) BIG TOM: huge, red beard, brown waistcoat. 2) SKINNY NED: thin, long neck,
grey shirt. 3) OLD JACK: white stubble, missing tooth, blue jacket. 4) YOUNG WILL: 17, freckles, curly hair,
oversized shirt. Wet boots, tools in belts. Eyes open, mouths closed.
```
**CS3 THE FRENCH**
```
Character sheet on plain light grey, full body front view: 1) PRIVATEER CAPTAIN: swaggering Frenchman, curled black
moustache, long dark hair, wide hat with a white plume, blue coat with silver braid, sash, cutlass. 2) and 3) two
PRIVATEER SAILORS: striped shirts, red caps, earrings, rough beards. 4) KING LOUIS XIV: older king, huge dark curly
wig, ermine-lined blue velvet robe embroidered with gold fleurs-de-lis, lace, jewelled sword. Eyes open, mouths closed.
```
**CS4 KEEPERS, FRIENDS, SHORE PEOPLE**
```
Character sheet on plain light grey, full body front view: 1) and 2) two LIGHTHOUSE KEEPERS: weathered, thick wool
coats, one bald with grey whiskers, one younger with a beard. 3) and 4) two GENTLEMEN FRIENDS: grey periwigs, brown
and green coats, worried faces. 5) a FISHERWOMAN in a shawl, 6) a small BOY, 7) a SHORE MAN with a brass telescope.
Eyes open, mouths closed.
```
**CS5 THE SEAGULL (our recurring witness)**
```
Character sheet on plain light grey: the same big herring gull 4 times: standing front view, side view, wings
spread, sitting. White head, grey wings with black tips, yellow beak with a red spot, pink legs, slightly scruffy,
very expressive posture. Eyes open.
```
**CS6 THE LIGHTHOUSE** (the design all LT stages must follow)
```
Design sheet on plain light grey: the first Eddystone lighthouse of 1698, three versions side by side, same scale:
1) the first tower: an octagonal stone base with a slender wooden tower on top and a glazed lantern room with candles.
2) the rebuilt tower of 1699: much taller and thicker, twelve-sided, with an open wooden balcony gallery, ornate carved
wooden decorations, iron brackets and cranes sticking out, a fancy lantern with a weather vane, like a palace.
3) the ruin: only a few bent iron bars sticking out of a wet granite rock. Front view, same rock base for all three.
```

---

## Part 2: Empty backgrounds (STYLE LOCK + mood; NO people, NO ships, NO lighthouse unless written)
Portrait 1024x1536 unless LANDSCAPE (1536x1024 for pans).

| Code | Prompt |
|---|---|
| BG01 | `M3. Wide storm sea at night, giant waves, lightning, a low black reef in the middle of the frame (the rock), nothing on it.` |
| BG02 | `M1. The Eddystone reef close up at low tide: a low jagged granite rock in the open sea, wet, seaweed, waves breaking on it, nothing built on it, horizon far away.` |
| BG03 | `M1. The same reef at high tide: only a little foam and a few rock tips showing, the sea over it, same camera.` |
| BG04 LANDSCAPE | `M3. Night sea with rough waves over a reef, a dark coastline far away, no ships.` |
| BG05 | `M4. A 1690s artist's workshop in London: engraving table with copper plates, tools, candles, maps on the wall, a window. No people.` |
| BG06 | `M4. A small 1690s London theatre stage with a fancy water-fountain machine in the middle, curtains, candles. No people.` |
| BG07 | `M4. A merchant's study: desk with papers, a ledger, a model ship, a window to grey sea. No people.` |
| BG08 LANDSCAPE | `M1. Plymouth harbour 1696: stone quay, moored ships, houses, gulls. Nothing in the foreground.` |
| BG09 LANDSCAPE | `M1. Open sea seen from a low boat, the reef far ahead on the horizon, choppy water.` |
| BG10 | `M1. Top-down drone view straight down onto the granite reef, waves around it, wet rock surface, nothing on it.` |
| BG11 | `M1. Close-up of the wet granite rock surface at low tide, at ground level, sea behind.` |
| BG12 | `M2. The reef at golden hour, calm sea, nothing on it, warm sky.` |
| BG13 | `M1. The deck of a French privateer ship: masts, cannons, ropes, sea beyond. No people.` |
| BG14 | `M4. A stone prison cell in France: straw, a barred window with light, a bench. No people.` |
| BG15 | `M6. The throne room of Versailles in faded sepia: gold, mirrors, a throne on steps. No people.` |
| BG16 | `M6. A French prison door open onto a sunny courtyard, sepia. No people.` |
| BG17 | `M3. The reef at night in a storm, nothing on it, huge waves breaking over it.` |
| BG18 | `M2. Calm night sea with stars and a ship's lights far away, golden glow on the water.` |
| BG19 | `M1. A Plymouth street by the harbour wall with the sea beyond, grey sky. No people.` |
| BG20 | `M3. Wild storm sky over England: black clouds, lightning, rain sheets.` |
| BG21 LANDSCAPE | `M3. Countryside in the storm: bending trees, flying leaves, a windmill on a hill, rain. No people.` |
| BG22 LANDSCAPE | `M3. A huge storm sea seen from water level, enormous grey-black waves, no ships.` |
| BG23 | `M5. A cliff-top shore at dawn after the storm, wet grass, debris, the grey sea beyond. No people.` |
| BG24 | `M5. Empty grey sea after a storm, mist, the reef small in the distance, nothing on it.` |
| BG25 | `M5. The reef close at grey dawn: wet granite, seaweed, nothing on it.` |
| BG26 | `M3. A dark night sea in rain, no lights anywhere, waves.` |
| BG27 | `Old parchment paper texture, warm, stained edges, empty, flat front view.` |
| BG28 | `M4. Inside the lighthouse lantern room at night: glass windows all round, candle holders, wooden floor, the storm outside. No people.` |

---

## Part 3: Henry Winstanley, 42 poses (CUT-OUT HEADER + CS1)
| Code | Pose · light |
|---|---|
| WN01 | `standing seen from behind, hands on hips, staring out at the sea · L-STORM` |
| WN02 | `standing, three-quarter view, staring in horror, hand over mouth · L-STORM` |
| WN03 | `slamming a fat leather money bag down onto an invisible table, determined grin · L-CANDLE` |
| WN04 | `sitting at an invisible desk engraving a copper plate with a tool, concentrating (include the stool) · L-CANDLE` |
| WN05 | `showman pose, both arms spread wide, presenting proudly, big grin · L-CANDLE` |
| WN06 | `holding a big rolled plan, scratching his wig, confused · L-CANDLE` |
| WN07 | `sitting in the bow of a boat (no boat), pointing forward heroically · L-DAY` |
| WN08 | `knocked over backwards by water, arms flailing, hat flying off, soaked · L-DAY` |
| WN09 | `soaking wet, standing, wig dripping, unimpressed face · L-DAY` |
| WN10 | `supervising, one hand on hip, pointing down at the ground · L-DAY` |
| WN11 | `exhausted, sitting on the ground, back slumped, hat in hand · L-GOLD` |
| WN12 | `turning in shock, looking over his shoulder, eyes wide · L-DAY` |
| WN13 | `sitting on a prison bench, sulking, chin on fist · L-CANDLE` |
| WN14 | `walking out free, chest puffed, hat tipped, three-quarter view · L-DAY (sepia edit later in code)` |
| WN15 | `leaping forward through the air, arms out, coat flying (jumping from a boat) · L-DAY` |
| WN16 | `lying on his belly hugging the rock lovingly, cheek pressed down (no rock) · L-DAY` |
| WN17 | `holding up a lit taper to light candles, reaching up, proud · L-CANDLE` |
| WN18 | `standing proudly, arms crossed, chin up · L-GOLD` |
| WN19 | `drenched by a wave from the side, flinching, eyes shut · L-STORM` |
| WN20 | `holding big plans, pointing upward, excited, inspired · L-CANDLE` |
| WN21 | `on a balcony pose: leaning on a railing (no railing) waving his tricorn hat · L-DAY` |
| WN22 | `cocky grin, waving one hand dismissively at someone off to the side · L-DAY` |
| WN23 | `big gesture pointing up at the sky, laughing confidently, chin high · L-STORM` |
| WN24 | `sitting in a boat (no boat), waving goodbye cheerfully · L-GREY` |
| WN25 | `close-up chest up, grinning smugly, looking up at the sky · L-STORM` |
| WN26 | `inside a lantern room, gripping a rail (no rail), looking out at something huge, eyes wide · L-STORM` |
| WN27 | `close-up face looking up at something enormous, terrified, rain on face · L-STORM` |
| WN28 | `standing on the rock, hands on hips, satisfied, looking up at his tower · L-GOLD` |
| WN29 | `giving a thumbs up to camera, winking · L-DAY` |
| WN30 | `rubbing his chin, scheming, eyes narrowed · L-CANDLE` |
| WN31 | `being carried horizontally by the arms and legs (no carriers visible), struggling, hat falling · L-DAY` |
| WN32 | `bowing deeply with a flourish of his hat · L-DAY (sepia edit later)` |
| WN33 | `chest-up portrait, proud and calm, like a painted portrait · L-CANDLE` |
| WN34 | `pointing at a sketch of a lighthouse held up in the other hand, excited · L-CANDLE` |
| WN35 | `hammering a nail into wood, focused · L-GOLD` |
| WN36 | `leaning on a shovel laughing at someone · L-DAY` |
| WN37–WN42 | Walk 1/6, side view walking RIGHT, then edit each → `down` / `passing` / `contact mirrored` / `down mirrored` / `passing mirrored` · L-DAY |

## Part 4: Workers, 14 (CUT-OUT HEADER + CS2)
| Code | Pose · light |
|---|---|
| WK01 | `the four workers sitting in a row rowing (no boat), oars forward, straining · L-DAY` |
| WK02 | edit WK01 → `oars pulled back, leaning back` |
| WK03 | `BIG TOM and SKINNY NED, one holding an iron drill bar, the other swinging a sledgehammer up · L-DAY` |
| WK04 | edit WK03 → `the hammer coming down on the drill, sparks` |
| WK05 | `the four workers knocked flat, swept sideways, arms out, splashing · L-DAY` |
| WK06 | `the four lying exhausted on the ground, panting · L-GOLD` |
| WK07 | `OLD JACK counting on his fingers, holding up twelve fingers' worth (two hands), weary · L-GOLD` |
| WK08 | `the four cheering, hats in the air · L-GOLD` |
| WK09 | `YOUNG WILL soaked, spitting out water · L-DAY` |
| WK10 | `the four running away from something, panicked · L-DAY` |
| WK11 | `the four sitting in a boat row (no boat) looking up at a storm sky, worried · L-GREY` |
| WK12 | `BIG TOM carrying a huge stone block on his shoulder · L-GOLD` |
| WK13 | `SKINNY NED on a ladder (include ladder) carving wooden decoration · L-GOLD` |
| WK14 | `OLD JACK holding his cap, staring at the sea, shaking his head · L-GREY` |

## Part 5: The French, 11 (CUT-OUT HEADER + CS3)
| Code | Pose · light |
|---|---|
| FP01 | `PRIVATEER CAPTAIN standing at a ship's rail pose, pointing ahead with his cutlass, grinning · L-DAY` |
| FP02 | `CAPTAIN laughing, hand on belly · L-DAY` |
| FP03 | `two SAILORS smashing wooden scaffolding with axes, mid-swing (include the broken wood) · L-DAY` |
| FP04 | edit FP03 → `axes coming down, wood splintering` |
| FP05 | `two SAILORS carrying a struggling man horizontally between them by the arms and legs (the man is WINSTANLEY from CS1) · L-DAY` |
| FP06 | `CAPTAIN tipping his plumed hat mockingly · L-DAY` |
| FP07 | `two SAILORS rowing away fast, laughing (no boat) · L-DAY` |
| FP08 | `a French jailer with keys, opening a door, bored · L-CANDLE` |
| LX01 | `KING LOUIS XIV seated on a throne (include the throne), frowning, reading a letter · L-CANDLE` |
| LX02 | edit LX01 → `waving one hand graciously, a calm smile` |
| LX03 | `KING LOUIS XIV standing, one hand on heart, noble pose · L-CANDLE` |

## Part 6: Friends, keepers, shore people, 13 (CUT-OUT HEADER + CS4)
| Code | Pose · light |
|---|---|
| FD01 | `the two GENTLEMEN FRIENDS pointing out to sea, worried · L-DAY` |
| FD02 | `one FRIEND wagging his finger, warning · L-DAY` |
| FD03 | `the two FRIENDS covering their faces in disbelief · L-GREY` |
| FD04 | `the two FRIENDS standing on a quay waving goodbye, uneasy · L-GREY` |
| KP01 | `the two KEEPERS sitting in a boat (no boat), clutching their hats, nervous · L-GREY` |
| KP02 | `the two KEEPERS lighting candles with tapers · L-CANDLE` |
| KP03 | `the two KEEPERS holding on to each other, terrified · L-STORM` |
| SP01 | `FISHERWOMAN, BOY and SHORE MAN standing seen from behind, looking out to sea · L-GREY` |
| SP02 | `SHORE MAN raising a brass telescope to his eye, seen from behind-three-quarter · L-GREY` |
| SP03 | `SHORE MAN lowering the telescope, face pale, stunned · L-GREY` |
| SP04 | `FISHERWOMAN with a hand over her mouth, BOY clutching her skirt · L-GREY` |
| SP05 | `a crowd of six townspeople pointing out to sea, worried · L-GREY` |
| SP06 | `townspeople holding their hats in howling wind, leaning into it · L-STORM` |

## Part 7: The seagull, 8 (CUT-OUT HEADER + CS5)
| Code | Pose · light |
|---|---|
| GL01 | `standing on a rock pose, front view, judging look · L-DAY` |
| GL02 | `squawking, beak wide open, wings half up · L-DAY` |
| GL03 | `flapping 1/2: wings up, taking off · L-DAY` |
| GL04 | edit GL03 → `wings down` |
| GL05 | `blown sideways by wind, feathers ruffled, tumbling · L-STORM` |
| GL06 | `soaked, dripping, unimpressed · L-DAY` |
| GL07 | `standing on one leg, side view, staring · L-GREY` |
| GL08 | `sitting alone, small, hunched, looking down · L-GREY` |

## Part 8: Ships and boats, 16 (CUT-OUT HEADER)
| Code | Ship · light |
|---|---|
| SH01 | `a 1690s English merchant sailing ship, side view facing right, full sails · L-DAY` |
| SH02 | `the same ship at night, tilting, hull torn open on rocks, mast cracking · L-STORM` |
| SH03 | `a second merchant ship sinking bow-first, side view · L-STORM` |
| SH04 | `a small open rowing boat with no people, side view facing right · L-DAY` |
| SH05 | `the four WORKERS from CS2 rowing the boat with WINSTANLEY (CS1) in the bow pointing forward, side view facing right · L-DAY` |
| SH06 | edit SH05 → `oars in the other position (rowing cycle)` |
| SH07 | `a French privateer sloop, side view facing left, guns, black sails, flag · L-DAY` |
| SH08 | `a Royal Navy warship of 1703 tossed in a storm, tilted, side view · L-STORM` |
| SH09 | edit SH08 → `tilted the other way, masts snapping` |
| SH10 | `a warship sinking, only the stern and masts above huge waves · L-STORM` |
| SH11 | `a sailing ship at night with lanterns, passing safely, side view facing right · L-GOLD` |
| SH12 | `a boat with WINSTANLEY, two KEEPERS and the workers heading out, side view facing right, darkening clouds · L-GREY` |
| SH13 | `the bow of a merchant ship in the dark, front three-quarter, sailing toward camera, lanterns · L-STORM` |
| SH14 | `a ship's hull smashing into rock, splinters flying · L-STORM` |
| SH15 | `a small rowing boat with two men going out across grey water, side view · L-GREY` |
| SH16 | `a French prisoner-exchange boat with a white flag, side view · L-DAY` |

## Part 9: The lighthouse stages, 12 (CUT-OUT HEADER + CS6; ALL front view, same angle, same scale; make each by EDITING the previous)
| Code | Stage · light |
|---|---|
| LT01 | `twelve iron bars set upright in a low granite rock top (rock included, cut out), nothing else · L-DAY` |
| LT02 | edit → `a low octagonal stone base built around the iron bars` |
| LT03 | edit → `half a wooden tower rising from the base, scaffolding around it` |
| LT04 | edit → `the first tower finished: slender wooden tower and a glazed lantern room on top, no scaffolding` |
| LT05 | edit LT04 → `same tower at night with warm candlelight glowing in the lantern, light rays · L-STORM` |
| LT06 | edit LT04 → `scaffolding again, a thick new outer wall rising around the old tower` |
| LT07 | edit → `the new tower now much taller and twelve-sided, plain, scaffolding` |
| LT08 | edit → `finished palace tower: ornate carved decorations, iron cranes, open balcony gallery, fancy lantern with a weather vane · L-DAY` |
| LT09 | edit LT08 → `golden-hour light, ships' sails behind · L-GOLD` |
| LT10 | edit LT08 → `night storm, lantern glowing, wet and battered · L-STORM` |
| LT11 | `top-down view straight down onto the ornate tower on its rock, lantern glowing · L-STORM` |
| LT12 | `the ruin: only a few bent iron bars sticking out of the bare rock top (rock included) · L-GREY` |

## Part 10: Water, 14 (CUT-OUT HEADER)
| Code | Element · light |
|---|---|
| WV01 | `a huge curling green-grey wave, side view breaking to the right, frame 1 of 3 · L-DAY` |
| WV02 | edit → `the wave curling further, top crashing over` |
| WV03 | edit → `the wave collapsed into a wall of white foam and spray` |
| WV04 | `a giant black storm wave rising straight up, cut out · L-STORM` |
| WV05 | `a tall column of white spray shooting up · L-DAY` |
| WV06 | `a tall column of white spray shooting up · L-STORM` |
| WV07 | `a wide sheet of white foam and spray flying sideways · L-STORM` |
| WV08 | `a ring of white foam (seen from above) · L-DAY` |
| WV09 | `a big water splash · L-DAY` |
| WV10 | `water pouring down like a waterfall · L-STORM` |
| WV11 | `rain streaks, diagonal, semi-transparent` |
| WV12 | `sea mist, soft, semi-transparent · L-GREY` |
| WV13 | `water dripping off something, drops · L-DAY` |
| WV14 | `a rising tide line of foam and seawater, wide, flat · L-DAY` |

## Part 11: Props, 24 (CUT-OUT HEADER)
| Code | Prop |
|---|---|
| PR01 | `a fat leather money bag, coins spilling · L-CANDLE` |
| PR02 | `a copper engraving plate with an engraving of a ship · L-CANDLE` |
| PR03 | `a 1690s lighthouse plan drawing on paper, ink · L-CANDLE` |
| PR04 | `a fancy brass water-fountain machine shooting little jets · L-CANDLE` |
| PR05 | `a sledgehammer · L-DAY` |
| PR06 | `an iron drill bar · L-DAY` |
| PR07 | `wooden scaffolding planks, broken, flying · L-DAY` |
| PR08 | `a letter with a red wax seal · L-CANDLE` |
| PR09 | `a heavy prison door with a barred window · L-CANDLE` |
| PR10 | `a tall candle with a flame · L-CANDLE` |
| PR11 | `a bundle of candles in a brass holder, lit · L-CANDLE` |
| PR12 | `a tricorn hat flying through the air · L-DAY` |
| PR13 | `a brass telescope · L-GREY` |
| PR14 | `a windmill being blown apart, sails flying off · L-STORM` |
| PR15 | `a tree bent sideways by wind · L-STORM` |
| PR16 | `a roof being torn off a cottage, tiles flying · L-STORM` |
| PR17 | `a broken wooden beam floating · L-GREY` |
| PR18 | `three bent iron bars, close-up · L-GREY` |
| PR19 | `a wooden ship's wheel · L-STORM` |
| PR20 | `a ship's lantern, glowing · L-STORM` |
| PR21 | `a carved wooden decoration (scroll and flourish) · L-GOLD` |
| PR22 | `a stone block · L-GOLD` |
| PR23 | `a rope ladder · L-DAY` |
| PR24 | `a plumed French hat · L-DAY` |

## Part 12: Map pieces, 6 (CUT-OUT HEADER; I animate them on BG27)
| Code | Piece |
|---|---|
| MP01 | `an ink line drawing of the south-west coast of England with Plymouth Sound, black ink, no text, on transparent background · L-PARCH` |
| MP02 | `a small ink drawing of a jagged reef in the sea, no text · L-PARCH` |
| MP03 | `a red map pin with a round head, side view · L-PARCH` |
| MP04 | `a tiny ink-drawn sailing ship · L-PARCH` |
| MP05 | `an ink compass rose · L-PARCH` |
| MP06 | `an ink drawing of the coast of France (Brittany), no text · L-PARCH` |

## Part 13: Other FX, 20 (CUT-OUT HEADER)
| Code | Element |
|---|---|
| FX01 | `a jagged white lightning bolt` |
| FX02 | `a branching lightning bolt, purple-white` |
| FX03 | `candle-flame glow, soft warm halo` |
| FX04 | `a beam of light shining out sideways, soft, semi-transparent` |
| FX05 | `sparks from a hammer strike` |
| FX06 | `wood splinters and dust burst` |
| FX07 | `flying leaves and twigs` |
| FX08 | `storm clouds, dark, soft edges` |
| FX09 | `cannon smoke puff` |
| FX10 | `rain splashes on stone` |
| FX11 | `dust cloud` |
| FX12 | `sweat drops` |
| FX13 | `a sunbeam, soft` |
| FX14 | `fog bank, low` |
| FX15 | `flying roof tiles` |
| FX16 | `water drops spraying outward` |
| FX17 | `a small fountain jet of water` |
| FX18 | `torn paper scraps flying` |
| FX19 | `stars and a moon glow` |
| FX20 | `a glint, star-shaped sparkle` |

---

## Part 14: Shot assembly (my edit plan on your real times; layers back → front; ⟳ = swaps / cycle)
(About 110 shots, a new picture about every 0.7 s like the reference.)

| # | Time | VO | Layers + motion |
|---|---|---|---|
| 1 | 0.00 | You'd never wish | BG01 + LT10 small + WV04 rising behind it; lightning FX01 flash |
| 2 | 1.50 | for the worst storm in history | BG20 + FX08 clouds racing, WV11 rain, camera shake |
| 3 | 2.90 | But in 1703, | WN25 close-up grinning at the sky, lightning flash |
| 4 | 4.68 | one man did, | WN23 pointing at the sky laughing, GL05 gull blown past |
| 5 | 5.82 | and nobody saw him | BG25 empty rock at grey dawn, LT12 iron bars |
| 6 | 7.00 | again. | GL08 gull alone on the bars, slow push |
| 7 | 8.08 | It all starts with a rock. | BG27 map: MP01 coast, MP03 pin DROPS and bounces on MP02 |
| 8 | 10.48 | 14 miles off the coast of England, | map pulls back to show the whole coast, line from Plymouth to the rock |
| 9 | 12.54 | a reef so low the sea swallows it | BG02 → BG03 dissolve, WV14 tide line sweeping over |
| 10 | 14.20 | twice a day. | quick tide time-lapse back and forth (BG02⟳BG03), sun arc |
| 11 | 15.82 | For years, | BG04 night, SH01 sailing in |
| 12 | 16.48 | it had been tearing open ships | SH02 hits, WV06 spray, FX06 splinters, shake |
| 13 | 17.80 | in the dark. | SH03 sinking, lightning |
| 14 | 18.92 | One man had lost two of his own ships | BG07, WN02 horrified at the window |
| 15 | 20.62 | to it, | PR02 ship engraving torn in two (FX18) |
| 16 | 21.22 | so he decided to do something | WN30 scheming, chin rub |
| 17 | 22.80 | nobody had ever tried. | WN34 pointing at the sketch, GL02 gull squawks at the window |
| 18 | 24.70 | Build a lighthouse on it | WN20 inspired, PR03 plan pops up, FX20 glint |
| 19 | 26.00 | with his own money. | WN03 slams PR01, coins burst, shake |
| 20 | 27.44 | His name was Henry Winstanley, | WN33 portrait, name moment, light sweep |
| 21 | 30.22 | an engraver, | BG05, WN04 engraving, FX05 tiny sparks |
| 22 | 31.02 | an inventor, | WN06 scratching wig over plans |
| 23 | 31.86 | a showman who ran a theatre of water tricks | BG06, PR04 fountain jets FX17 cycling, WN05 arms wide |
| 24 | 33.84 | in London. | crowd SP05 clapping in silhouette, quick |
| 25 | 34.64 | Not an engineer. | WN06 again, confused, GL01 gull judging |
| 26 | 36.14 | In the summer of 1696, | BG27 map: route line draws Plymouth → rock, MP04 ship moves along it |
| 27 | 38.16 | he and his workers start rowing out | BG09, SH05⟳SH06 rowing across, spray |
| 28 | 39.50 | from Plymouth. | BG08 harbour, SH05 leaving the quay |
| 29 | 40.72 | They can only work at low tide | BG11, WK03⟳WK04 hammering, FX05 sparks |
| 30 | 42.66 | in calm weather, | WN10 pointing, GL01 gull watching |
| 31 | 43.12 | and the waves keep washing | WV01⟳WV02⟳WV03 sweeps over WK05 |
| 32 | 44.40 | their work away. | WN08 knocked over, PR12 hat flies, WV09 splash |
| 33 | 45.62 | That entire first summer, | BG10 top-down rock, sun time-lapse shadows |
| 34 | 47.22 | all they manage | WK06 exhausted, WN11 slumped |
| 35 | 48.30 | is 12 holes in the rock. | BG10 top-down: 12 holes pop in one by one (code) + WK07 counting |
| 36 | 49.98 | Then it gets worse. | whip-blur, WN12 turning in shock |
| 37 | 51.78 | England is at war with France, | BG27 map: MP06 France slides in, FX09 cannon smoke puffs between the coasts |
| 38 | 53.44 | and in 1697, | BG02, SH07 privateer sails in from the left, FX09 cannon smoke |
| 39 | 54.84 | a French privateer sails up, | BG13, FP01 pointing the cutlass, FP02 laugh swap |
| 40 | 56.54 | smashes the work, | LT03 + FP03⟳FP04, FX06 splinters, PR07 planks flying, shake |
| 41 | 57.78 | and drags Winstanley off | FP05 carrying WN, WN31 struggle, PR12 hat |
| 42 | 59.00 | to France as a prisoner. | BG14, WN13 sulking, PR09 door slam |
| 43 | 60.50 | The story goes that King Louis XIV | sepia: BG15, LX01 reading PR08 |
| 44 | 62.30 | heard about it | LX01 eyebrow raise (eye overlay) |
| 45 | 63.18 | and let him go, | LX02 wave, BG16 door opens, WN14 walks out (WN37–42 walk) |
| 46 | 64.34 | saying France was at war with England, | LX03 hand on heart |
| 47 | 66.14 | not with humanity. | WN32 bowing, GL02 gull squawks |
| 48 | 67.42 | So he goes straight back | SH16 boat, BG09 |
| 49 | 68.60 | to his rock. | WN15 leaps, then WN16 hugging BG11 rock |
| 50 | 69.84 | And in November 1698, | BG02 + LT01 → LT02 → LT03 → LT04 build sequence, WK12/WK13 working |
| 51 | 71.88 | the light finally shines. | BG17 dark, LT05 glowing, FX04 beam sweeps |
| 52 | 73.98 | Candles | WN17 + KP02 lighting PR11, FX03 glow |
| 53 | 75.00 | on a wooden tower | LT05 close, wood detail |
| 54 | 76.00 | in the middle of the sea. | drone pull-out: BG01 with LT05 tiny |
| 55 | 77.44 | That first winter, | BG17 storm, LT05, rain WV11 |
| 56 | 78.52 | the waves climb right over the top | WV04 rising behind LT05, then WV10 pouring |
| 57 | 79.80 | and bury the lantern, | LT05 vanishes under WV07; WN19 drenched, insert |
| 58 | 81.46 | so he wraps the whole tower | BG12, LT06 scaffolding rising, WN35 hammering |
| 59 | 83.20 | inside a bigger one, | LT07 grows (scale up), WK12 carrying stone |
| 60 | 84.18 | taller, | LT07 stretch upward |
| 61 | 84.82 | thicker, | LT07 widen (squash) |
| 62 | 85.10 | and because he's a showman, | WN05 arms wide on the rock |
| 63 | 86.68 | covered in carvings, | WK13 carving, PR21 pops on |
| 64 | 87.92 | ironwork, | LT08 iron cranes appear, FX20 glint |
| 65 | 88.60 | and an open balcony. | WN21 waving hat from LT08's balcony |
| 66 | 90.02 | A palace on a rock. | LT09 golden-hour hero shot, gulls flying GL03⟳GL04 |
| 67 | 91.84 | For five years, | BG18, SH11 sails past, LT09 small, FX04 beam |
| 68 | 93.02 | it works. | WN29 thumbs up wink |
| 69 | 94.04 | Ships finally have a light to steer by, | SH11 + second ship, beam sweep |
| 70 | 96.42 | but people keep warning him. | BG19, FD01 pointing at the sea |
| 71 | 98.20 | One day, | FD02 wagging finger |
| 72 | 98.98 | the sea will take it, | BG17, LT10 battered, WV04 rising |
| 73 | 100.28 | and his answer became famous. | WN22 dismissive wave at FD01 |
| 74 | 102.62 | He said he only wished he could be inside it | WN23 pointing at the sky, BG20 |
| 75 | 104.84 | during the greatest storm that ever blew, | WN25 grin close-up, FX01 lightning |
| 76 | 107.42 | just to see what it would do. | WN36 laughing, GL02 gull squawks in horror |
| 77 | 109.38 | In November 1703, | BG27 map: pin on rock, storm clouds FX08 drawn over the map |
| 78 | 111.16 | he rows out to repair it | SH12 heading out, BG09 grey |
| 79 | 112.60 | with his workers | WK11 worried |
| 80 | 113.18 | and the keepers, | KP01 clutching hats |
| 81 | 113.96 | and on the night of the 26th, | BG17, LT10, clouds roll in fast |
| 82 | 116.14 | he gets his wish. | BG28, WN26 at the window, WV04 rising outside, lightning |
| 83 | 117.66 | The worst storm ever recorded in Britain | BG20, FX01/FX02 lightning, WV11 rain, heavy shake |
| 84 | 119.20 | tears across the country. | BG21 pan: PR14 windmill flying apart, PR15 trees, FX15 tiles, PR16 roof |
| 85 | 120.64 | (wind) | SP06 people leaning into the wind |
| 86 | 121.68 | Thirteen Navy warships go down, | BG22, SH08⟳SH09 tossed, then SH10 sinking |
| 87 | 123.98 | thousands of people die. | BG26 black sea, slow push, music drops |
| 88 | 125.74 | The next morning, | BG23 grey dawn, WV12 mist |
| 89 | 126.62 | people on the shore look out to sea. | SP01 from behind |
| 90 | 128.76 | Through the telescope, | SP02 raising PR13 |
| 91 | 129.96 | there is nothing there. | TELESCOPE MASK over BG24: empty sea |
| 92 | 131.54 | No tower, | BG25 rock, LT12 bars, grey |
| 93 | 132.44 | no light, | FX03 glow fading out on black |
| 94 | 133.42 | just a few bent iron bars | PR18 close, WV13 drips |
| 95 | 135.00 | sticking out of the rock. | BG25 wide, LT12, GL07 gull on one leg |
| 96 | 136.74 | Henry Winstanley and the men inside | WN33 portrait fading in sepia, then out |
| 97 | 138.20 | were never found. | SP03 lowering the telescope, FD03, SP04 (no eyes, grey) |
| 98 | 140.08 | And just days later, | BG26 night, rain |
| 99 | 141.64 | a ship sailing home in the dark | SH13 bow coming at camera, PR20 lantern swinging |
| 100 | 143.30 | hit that same rock | SH14 smash, FX06, shake, flash |
| 101 | 144.60 | because there was no light anymore. | black; one last beat on BG25 with LT12 and GL08 alone; cut |

---

## Part 15: Eyes and mouth
We keep the Caesar overlay code (already in the project): the same googly eyes and mouths, with moods. No new code is needed. If you want to tweak them, tell me.

---

## What to send me
One Drive folder (parts are fine) with every code above at **native GPT size, no upscaling**. To start building early, send this set first:
- character sheets **CS1–CS6**;
- backgrounds **BG01–BG12** and **BG27**;
- **WN01–WN36**;
- **WK01–WK07**;
- **GL01–GL04**;
- **SH01–SH06**;
- **LT01–LT05**;
- **WV01–WV09**, **WV11** and **WV14**;
- **PR01–PR06** and **PR12**;
- map pieces **MP01–MP04**;
- effects **FX01**, **FX05**, **FX06**, **FX08**, **FX17**, **FX18** and **FX20**.

That's enough for 0–50 s.
