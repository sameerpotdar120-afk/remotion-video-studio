# The Worst Hostage in History: LAYERED GPT prompt pack (v4, Napoleon method)

133.7 s Short (your VO at 1.10x), 9:16, 4K final. Every time below is from your real VO, so cuts land on words.

## How it works (same as the Napoleon video)

We generate **pieces, not pictures**. I assemble them in Remotion like a game engine:

```
  [ FX: sparks, spray, dust, fog, coins, lightning ]
  [ googly eyes + mouths (code), tracked to every face ]
  [ foreground props ]
  [ CHARACTER cut-outs: poses swap 8-12x per second = movement; characters walk in, pop up, react ]
  [ midground props: ships, barrels, cages, crosses ]
  [ EMPTY BACKGROUND set: moves slower than the characters = parallax depth ]
```

So in one background the characters can walk in, sit, jump, react, get dragged, run off, and change expression, and the camera can push, pan and shake. The same pose is reused in many shots.

**Totals: 192 images**

| Group | Codes | Images |
|---|---|---|
| Character sheets | CS1–CS5 | 5 |
| Empty backgrounds | BG01–BG24 | 24 |
| The Hero (face always hidden until the REVEAL poses) | HE01–HE42 | 42 |
| The Hero on horseback, gallop cycle | GA1–GA6 | 6 |
| Pirate Captain | CA01–CA18 | 18 |
| Pirate crew: groups + individuals | PG01–PG12, PI01–PI16 | 28 |
| Friend + servants | FR01–FR07 | 7 |
| Governor | GV01–GV08 | 8 |
| Messengers, marines, sailors, legion | RM01–RM12 | 12 |
| Props (ships, boats, chests, crosses, door…) | PR01–PR28 | 28 |
| FX | FX01–FX14 | 14 |
| Eyes and mouth code update | 1 prompt | — |

**Rules (read once):**
1. **Name every file exactly by its code.** Send at GPT's **native size, no upscaling** (I upscale).
2. **Cut-outs:** transparent background. If GPT won't make one, a plain light-grey background is fine; I cut it out.
3. **Attach the matching character sheet** to every character prompt and say "exactly this character from the attached sheet".
4. **Lighting must match the set it's used in.** Every cut-out names its light (L-DAY, L-GOLD, L-FIRE, L-TORCH, L-PALACE, L-STORM). Copy the text as written, or it will look pasted on.
5. **Cycles (walks, runs, gallops, rowing, dancing):** make frame 1 first. Make every next frame by **editing the previous image**: "same character, same camera angle, same lighting, same size in frame, change ONLY the pose to: …".
6. **Faces:** everyone's face visible, eyes open, mouth closed (I add the cartoon eyes and mouths). **Except THE HERO:** his face is always lost in the shadow of his hood until the poses marked REVEAL. In the dark I give him glowing eyes only; that's the suspense gag.
7. **Nothing graphic.** The crosses are empty or distant silhouettes, and the throat line plays over a black screen.

---

## Copy blocks

### STYLE LOCK (paste once at the start of every GPT chat)
```
For every image in this chat: a real cinematic film still look, shot on an ARRI Alexa with a 35mm or 50mm prime lens,
Kodak Vision3 film emulation, natural film grain, rich deep colour. Natural skin with real pores and imperfections,
real fabric weave, weathered wood, salt-stained rope. Historically grounded eastern Mediterranean, 75 BC: Cilician
pirates, Greek islands, Roman clothing. NOT a video game render, NOT CGI, NOT plastic or waxy skin, NOT over-sharpened,
NOT HDR, NOT upscaled. NO text, NO letters, NO watermarks, NO logos, NO borders, NO cartoon eyes or drawn faces.
Everyone's faces clearly visible with eyes open and mouths closed, EXCEPT THE HERO, whose face is always lost in the
black shadow of his hood unless I write REVEAL. Keep every character identical to the attached character sheets.
```

### CUT-OUT HEADER (start of every HE / CA / PG / PI / FR / GV / RM / PR / FX prompt)
```
Isolated cut-out on a fully transparent background (PNG with alpha channel). No scenery, no ground, no floor shadow,
no background colour. The whole subject inside the frame with a small margin, nothing cropped, clean sharp edges,
every hair and cloth edge visible. Exactly the character from the attached sheet.
```

### LIGHTING (paste the one the prompt names)
- **L-DAY:** `bright midday Aegean sun from the upper left, warm key light, crisp soft shadows on the right side, blue-sky bounce fill`
- **L-GOLD:** `low golden-hour sun from behind on the right, strong warm amber rim light on hair and shoulders, soft warm fill on the front`
- **L-FIRE:** `night, lit from the front-left by orange bonfire light, deep shadows, cool teal-blue fill on the right side`
- **L-TORCH:** `dark prison, lit by a single orange torch from the upper right, very dark shadows, faint cold blue fill`
- **L-PALACE:** `warm oil-lamp light from the left, golden and soft, rich warm shadows`
- **L-STORM:** `overcast steel-blue light, soft and cool, wet sheen, wind`

### BACKGROUND MOODS (for the BG prompts)
- **M1 AEGEAN DAY:** `bright midday Aegean light, turquoise and teal sea, sun-bleached wood, crisp blue sky`
- **M2 FIRELIGHT NIGHT:** `night, deep teal-blue darkness, orange firelight glow, sparks in the air`
- **M3 GOLDEN HOUR:** `low golden-hour sun, long shadows, amber haze over the water`
- **M4 STORM BLUE:** `overcast steel-blue dusk, wind, sea spray, desaturated cool tones, dramatic clouds`
- **M5 TORCH PRISON:** `dark stone, flickering torchlight, heavy shadows, warm orange pools, cold blue darkness`
- **M6 PALACE:** `opulent Roman villa interior, warm lamp light, marble and red drapes, rich golds`
- **M7 DUSK FOG:** `blood-red and violet dusk sky, thin fog on the ground, sombre`

---

## Part 1: Character sheets (make first; attach to every later prompt for that person)

**CS1 THE HERO** (face shown here only, so GPT knows him)
```
Character turnaround sheet on plain light grey, the same young man 4 times, full body: front, three-quarter, side,
back, plus one front view with the hood up and his face lost in shadow. THE HERO: Roman nobleman aged 25, lean,
sharp cheekbones, short dark hair combed forward, clean-shaven, confident half-smile. White wool tunic with two
narrow purple stripes, charcoal blue-grey hooded travelling cloak with a silver clasp, brown leather belt, leather
sandals, a heavy gold signet ring on his right hand. Natural soft light.
```
**CS2 THE PIRATE CAPTAIN**
```
Character sheet on plain light grey, full body front and three-quarter: Cilician pirate captain aged 45, huge
barrel-chested man, sun-weathered olive skin, a scar across one eyebrow, thick black beard in two braids with
bronze rings, one gold front tooth, rust-red headscarf, sleeveless dark leather vest over a bare chest, wide
leather belt with a curved sword, bronze arm rings, gold hoop earrings. Eyes open, mouth closed.
```
**CS3 THE PIRATE CREW** (five distinct men)
```
Character sheet on plain light grey, five Cilician pirates side by side, full body front view:
1) SKINNY: tall, bald, thin, tattooed arms, ochre tunic. 2) BRUTE: enormous, shaved head, thick neck, grey vest.
3) KID: youngest, 18, curly hair, olive tunic, eager face. 4) OLD SALT: grey beard, missing teeth, faded blue tunic.
5) FURRY: wild hair, goat-fur vest, many necklaces. Sun-weathered skin, bare feet or sandals, knives in belts.
Eyes open, mouths closed.
```
**CS4 THE HERO'S PEOPLE**
```
Character sheet on plain light grey, full body front view: 1) THE FRIEND: Roman man aged 30, plump, round face,
curly brown hair, clean-shaven, nervous expression, beige tunic, brown cloak. 2) SERVANT ONE: thin young man,
undyed linen tunic. 3) SERVANT TWO: stocky young man, undyed linen tunic, rope belt. Eyes open, mouths closed.
```
**CS5 THE GOVERNOR + ROMANS**
```
Character sheet on plain light grey, full body front view: 1) THE GOVERNOR: fat Roman official aged 55, bald with a
grey fringe, double chin, white toga with a purple border, many gold rings, greedy little smile. 2) A ROMAN MARINE:
bronze helmet, chainmail, oval shield, short sword. 3) A MILESIAN SAILOR: tanned, short tunic, rope over shoulder.
4) A ROMAN MESSENGER: slim, short travelling cloak, satchel. Eyes open, mouths closed.
```

---

## Part 2: Empty backgrounds (STYLE LOCK + mood; NO people, NO ships unless written)
Portrait 1024x1536 unless marked LANDSCAPE (1536x1024, for pans).

| Code | Prompt |
|---|---|
| BG01 | `M1. Empty deck of a pirate galley seen at eye level: planks, coiled ropes, crates, the mast, rigging, sea and sky beyond the rail. No people.` |
| BG02 | `M3. The same pirate galley deck at golden hour, long shadows, amber sea. No people.` |
| BG03 LANDSCAPE | `M1. Aerial view of a tiny rocky island in the Aegean, turquoise shallows, cliffs, open sea all around. No ships, no people.` |
| BG04 LANDSCAPE | `M1. Open Aegean sea at water level, gentle waves, the rocky island in the distance, bright sky. No ships.` |
| BG05 | `M1. Empty deck of a Roman merchant ship: amphorae, sacks, a mast with a square sail. No people.` |
| BG06 | `M2. Empty island beach at night: a big bonfire burning in the middle, logs to sit on, a tent, palm-leaf shelter, dark sea behind. No people.` |
| BG07 | `M3. Empty island beach at golden hour, sand, rocks, calm sea. No people.` |
| BG08 | `M2. Inside a simple canvas tent at night, an oil lamp on a low table, a mat, papyrus scrolls. No people.` |
| BG09 | `M3. Empty stone pier stretching into the sea at sunset, huge orange sun on the horizon. No people.` |
| BG10 LANDSCAPE | `M1. Busy ancient Greek harbour of Miletus: marble stoa, white buildings, many moored ships, distant tiny crowds. Nothing in the foreground.` |
| BG11 | `M1. Inside a harbour tavern in Miletus: rough wooden table in the foreground, amphorae, open doorway to the bright harbour. No people.` |
| BG12 LANDSCAPE | `M4. Rough open sea under dramatic storm clouds, whitecaps, spray. No ships.` |
| BG13 | `M3. The pirates' island beach camp: hammocks between palms, wine jugs, cold fire pit, calm shallows. No people, no ships.` |
| BG14 | `M3. Close view of clear turquoise shallow water and sand at the shoreline, sunlight ripples. Empty.` |
| BG15 | `M4. Dusty road along the coast under a grey sky, Roman milestone, olive trees. No people.` |
| BG16 | `M5. Stone prison corridor at Pergamon with iron-barred cells along one wall, torches. No people.` |
| BG17 | `M5. Torchlit stone prison yard at night, high walls, a gate. No people.` |
| BG18 | `M6. Opulent Roman governor's hall: marble columns, red drapes, a mosaic floor, an empty table. No people, no furniture in the centre.` |
| BG19 LANDSCAPE | `M2. Empty night road through olive groves toward a distant walled city with torches on the walls. No people.` |
| BG20 | `M7. A bare hill under a blood-red and violet dusk sky, thin fog. Nothing on the hill.` |
| BG21 | `M7. The same bare hill at grey dawn in thick fog, pale sky. Nothing on the hill.` |
| BG22 LANDSCAPE | `M3. A vast valley at sunset seen from a hilltop, dust in the air, distant mountains. Empty.` |
| BG23 | `Close-up of a weathered wooden plank wall, knife marks, warm side light. Empty.` |
| BG24 | `M3. A clear golden sunset sky with soft clouds and sun flare, nothing else.` |

---

## Part 3: THE HERO, 42 poses (CUT-OUT HEADER + attach CS1; hood up, face in black shadow unless REVEAL)

| Code | Pose · light |
|---|---|
| HE01 | `sitting relaxed on a wooden crate (include the crate), seen from directly behind, hood up, feet up on a coil of rope · L-DAY` |
| HE02 | edit HE01 → `holding a cup out over his shoulder for a refill` |
| HE03 | `sitting on a crate (include the crate), front view, perfectly still, hands on knees, face lost in hood shadow, only the young jaw visible · L-DAY` |
| HE04 | edit HE03 → `yawning, only his yawning mouth lit` |
| HE05 | `sitting, throwing his head back laughing hard, only the open laughing mouth and jaw lit · L-DAY` |
| HE06 | edit HE05 → `leaning forward laughing, pointing ahead` |
| HE07 | `sitting, tapping two fingers against his hood at the temple, smug posture · L-DAY` |
| HE08 | `close-up of only his right hand and forearm holding up five spread fingers, gold signet ring, cloak sleeve · L-DAY` |
| HE09 | `close-up of only his right hand resting on his knee, gold signet ring, silver cloak clasp beside it · L-DAY` |
| HE10 | Walk 1/6, side view walking RIGHT: `contact pose, left foot forward, cloak flowing, calm confident walk · L-DAY` |
| HE11–HE15 | edit each previous → `down pose` / `passing pose` / `contact pose, right foot forward` / `down pose mirrored` / `passing pose mirrored` |
| HE16 | `walking toward camera between two invisible escorts, arms slightly lifted at the elbows as if held, relaxed · L-DAY` |
| HE17 | `lounging back on a throne of stacked crates and silk cushions (include it), feet on a barrel, cup of wine, front three-quarter · L-DAY` |
| HE18 | edit HE17 → `snapping his fingers and pointing forward` |
| HE19 | `lying on his back sunbathing on a towel, arms behind his head, hood shading his face, side view · L-DAY` |
| HE20 | `standing, holding out a pair of iron shackles at arm's length, dropping them, three-quarter view · L-DAY` |
| HE21 | `standing three-quarter back view, handing a sealed letter forward with one hand · L-GOLD` |
| HE22 | `standing, back to camera, perfectly calm, cloak blowing slightly · L-GOLD` |
| HE23 | `stretching both arms up and yawning, standing, front view · L-FIRE` |
| HE24 | `asleep lying on his side, cloak pulled over his face · L-FIRE` |
| HE25 | `sitting cross-legged hunched over a papyrus, writing with a reed pen, oil lamp beside him (include the lamp) · L-FIRE` |
| HE26 | `standing on a barrel (include it) reading from a scroll, one arm raised like an orator, front view · L-FIRE` |
| HE27 | edit HE26 → `both arms spread wide, scroll fluttering` |
| HE28 | `standing, pointing furiously downward, scroll in the other hand, only his shouting mouth lit · L-FIRE` |
| HE29 | `seen from behind, leaning forward as if nose to nose with someone, hood filling the left side · L-FIRE` |
| HE30 | `standing three-quarter back view, wagging one finger, cheerful posture · L-DAY` |
| HE31 | `extreme close-up of the lower half of his face under the hood, a calm slow smile, firelight on his lips, everything above the nose black · L-FIRE` |
| HE32 | `leaning toward camera, pointing one finger straight at the viewer · L-FIRE` |
| HE33 | `crouched, back to camera, drawing in the sand with a stick (include the stick) · L-FIRE` |
| HE34 | `standing at a ship's bow pose, back to camera, one foot raised on a beam, cloak whipping in the wind · L-STORM` |
| HE35 | `slamming a bag of coins down with one hand (bag included), standing three-quarter back view · L-DAY` |
| HE36 | `turning sharply to stride away, cloak swirling dramatically, three-quarter back view · L-PALACE` |
| HE37 | `bursting forward through an invisible doorway, torch in hand, cloak swirling, front view · L-TORCH` |
| HE38 | `standing in a prison yard, back to camera, arms crossed, still · L-TORCH` |
| HE39 | `sitting on a log, three-quarter back view, holding a piece of bread, relaxed · L-FIRE` |
| HE40 | `turning toward the camera mid-turn, hood still up, face still in shadow · L-GOLD` |
| HE41 | **REVEAL** `lowering his hood with both hands, face fully revealed for the first time, chest up, sharp confident smirk, eyes open into camera · L-GOLD` |
| HE42 | **REVEAL** edit HE41 → `hood down, one eyebrow raised, smirk wider, arms crossed` |

**The gallop (HE + horse, a cycle):**
| Code | Pose |
|---|---|
| GA1 | `THE HERO riding a black horse at full gallop to the RIGHT, side view, hood up, cloak streaming, all four hooves gathered under the body · L-FIRE` |
| GA2–GA6 | edit each previous → `front legs reaching forward` / `front hooves striking` / `body stretched, hind legs pushing` / `airborne, legs extended` / `hind legs landing` |


---

## Part 4: The Pirate Captain, 18 poses (CUT-OUT HEADER + CS2; face visible)
| Code | Pose · light |
|---|---|
| CA01 | `sitting on a barrel (include it) clutching his head with both hands in despair · L-DAY` |
| CA02 | `standing leaning forward, forehead pressed to an invisible mast, eyes squeezed · L-DAY` |
| CA03 | `leaning toward camera holding up two fingers, greedy gold-tooth grin · L-DAY` |
| CA04 | edit CA03 → `rubbing his hands together greedily` |
| CA05 | `standing, jaw dropped in total shock, arms limp · L-DAY` |
| CA06 | `falling backwards, arms flailing, feet in the air · L-DAY` |
| CA07 | `counting on his fingers, confused, tongue out in concentration · L-DAY` |
| CA08 | `kneeling, hugging something huge with both arms, eyes shut in bliss, drooling · L-GOLD` |
| CA09 | `pointing sternly down at the ground, ordering · L-DAY` |
| CA10 | `turning from a huddle, chest puffed, about to announce · L-DAY` |
| CA11 | `standing with one arm stretched out sideways at shoulder height (for an arm around someone), proud uncle grin · L-FIRE` |
| CA12 | `roaring with laughter, slapping his knee, sitting on a log (include it) · L-FIRE` |
| CA13 | `winking at camera with a thumbs up · L-FIRE` |
| CA14 | `reaching out desperately, crying, as if held back · L-STORM` |
| CA15 | `gripping prison bars (bars not included, just the hands gripping), terrified face pressed forward · L-TORCH` |
| CA16 | `walking with head down, wrists in iron chains, defeated · L-STORM` |
| CA17 | `sitting on a log offering a piece of bread forward, warm smile · L-FIRE` |
| CA18 | `looking up in horror, mouth open, holding silver coins that fall from his hands · L-GOLD` |

---

## Part 5: The crew, 28 images (CUT-OUT HEADER + CS3; faces visible)

**Groups (all five together in one cut-out):**
| Code | Pose · light |
|---|---|
| PG01 | `the five pirates standing side by side exhausted: dark circles under their eyes, slumped, hair messed up · L-DAY` |
| PG02 | `the five leaning in toward camera, smug, hands cupped to their ears · L-DAY` |
| PG03 | `the five in a whispering huddle, scheming, glancing back over their shoulders · L-DAY` |
| PG04 | `the five standing stiffly in a line like soldiers, chins up · L-DAY` |
| PG05 | Dance 1/2: `the five dancing wildly, wine jugs raised, drums · L-FIRE` |
| PG06 | edit PG05 → `different dance poses, one mid-jump` |
| PG07 | `the five frozen mid-dance in silly poses, guilty faces · L-FIRE` |
| PG08 | `the five sitting cross-legged in a row like schoolboys, bored, one asleep · L-FIRE` |
| PG09 | `four clapping nervously while the BRUTE sits arms crossed refusing · L-FIRE` |
| PG10 | `the five roaring with laughter, slapping knees, tears of laughter · L-FIRE` |
| PG11 | `the five kneeling on the sand counting silver coins into piles (coins included), happy · L-GOLD` |
| PG12 | `the five in a line in iron chains, heads down · L-STORM` |

**Individuals:**
| Code | Pose · light |
|---|---|
| PI01 | `KID pulling at his curly hair, screaming at the sky · L-DAY` |
| PI02 | `OLD SALT chewing on a rope, eyes wild · L-DAY` |
| PI03 | `BRUTE slowly sharpening a huge axe, grinning · L-GOLD` |
| PI04 | `SKINNY licking the flat of his knife blade, crazy eyes · L-GOLD` |
| PI05 | `BRUTE and SKINNY side by side, each gripping an invisible arm between them, walking forward · L-DAY` |
| PI06 | `SKINNY swinging on a rope, legs out, mid-air (include the rope) · L-DAY` |
| PI07 | `FURRY swinging on a rope, yelling silently, mid-air (include the rope) · L-DAY` |
| PI08 | `BRUTE close-up chest up, deeply offended, lip trembling, eyes watery · L-FIRE` |
| PI09 | `BRUTE close-up, shocked, leaning back, sweating · L-FIRE` |
| PI10 | `KID giving a big thumbs up, grinning · L-FIRE` |
| PI11 | `OLD SALT wiping tears of laughter · L-FIRE` |
| PI12 | `a pirate falling backwards off a log, laughing, feet in the air (include the log) · L-FIRE` |
| PI13 | `KID terrified, gripping prison bars (hands only, no bars) · L-TORCH` |
| PI14 | Flee 1/2: `two pirates (KID and OLD SALT) running away to the left in panic, splashing · L-STORM` |
| PI15 | edit PI14 → `other leg forward` |
| PI16 | `a pirate holding a pair of iron shackles, staring at them, baffled · L-DAY` |

---

## Part 6: Friend + servants, 7 (CUT-OUT HEADER + CS4)
| Code | Pose · light |
|---|---|
| FR01 | `THE FRIEND sweating and terrified, hands clasped · L-GOLD` |
| FR02 | edit FR01 → `biting his nails` |
| FR03 | `the two SERVANTS hugging each other, scared, peeking · L-GOLD` |
| FR04 | `SERVANT ONE tiptoeing forward, one finger pressed to his lips, stern · L-FIRE` |
| FR05 | Run 1/2: `THE FRIEND running joyfully toward camera, arms in the air, sandals flying off · L-DAY` |
| FR06 | edit FR05 → `other leg forward, one sandal mid-air` |
| FR07 | `THE FRIEND on his knees kissing the ground · L-DAY` |

## Part 7: The Governor, 8 (CUT-OUT HEADER + CS5)
| Code | Pose · light |
|---|---|
| GV01 | `THE GOVERNOR reclining on a red couch eating grapes (include the couch) · L-PALACE` |
| GV02 | edit GV01 → `yawning hugely, a grape halfway to his mouth` |
| GV03 | edit GV01 → `fast asleep, snoring, mouth open, grape still in hand` |
| GV04 | `close-up of THE GOVERNOR's greedy face staring sideways, licking his lips · L-PALACE` |
| GV05 | `THE GOVERNOR hugging an open chest of silver (include the chest), shifty eyes · L-PALACE` |
| GV06 | `THE GOVERNOR biting a silver coin, one eye closed, grinning · L-PALACE` |
| GV07 | `THE GOVERNOR waving one hand lazily in a "later" gesture, bored · L-PALACE` |
| GV08 | `THE GOVERNOR stroking his chins, pretending to think, eyes sliding sideways · L-PALACE` |

## Part 8: Romans and others, 12 (CUT-OUT HEADER + CS5)
| Code | Pose · light |
|---|---|
| RM01 | `four ROMAN MESSENGERS bowing, one holding a sealed letter · L-GOLD` |
| RM02 | `a nervous MESSENGER holding out a scroll with a wax seal · L-PALACE` |
| RM03 | `a group of MILESIAN SAILORS and ROMAN MARINES grinning, arms crossed · L-DAY` |
| RM04 | edit RM03 → `cheering, swords and fists raised` |
| RM05 | Charge 1/2: `five ROMAN MARINES charging to the right, shields up, splashing water · L-STORM` |
| RM06 | edit RM05 → `other legs forward, closer together` |
| RM07 | `two MARINES carrying a heavy silver chest between them, walking right · L-STORM` |
| RM08 | `two MARINES each holding one arm, pulling backwards (for holding someone back) · L-STORM` |
| RM09 | `two MARINES dragging a heavy chain to the right, leaning into it · L-TORCH` |
| RM10 | `two MARINES standing guard with spears · L-TORCH` |
| RM11 | `a huge block of Roman legionaries marching toward camera in formation, eagle standards, cut out as one group · L-GOLD` |
| RM12 | `four prison guards startled, falling back · L-TORCH` |

---

## Part 9: Props, 28 (CUT-OUT HEADER; lighting as written)
| Code | Prop |
|---|---|
| PR01 | `a lean Cilician pirate galley, side view facing right, oars out, square sail · L-DAY` |
| PR02 | edit PR01 → `oars in the other position (for a rowing cycle)` |
| PR03 | `a slow Roman merchant ship, side view facing right, square sail · L-DAY` |
| PR04 | `a Roman war galley, side view facing right, oars out, marines on deck, sail full · L-STORM` |
| PR05 | `a small rowing boat with four messengers rowing, side view facing right · L-GOLD` |
| PR06 | `open wooden chests and leather sacks overflowing with silver coins and bars · L-DAY` |
| PR07 | `a towering mountain of silver coins and silver bars · L-GOLD` |
| PR08 | `a single heavy silver chest, closed · L-PALACE` |
| PR09 | `a rope hammock strung between two posts · L-FIRE` |
| PR10 | `a pair of iron shackles lying on the ground · L-DAY` |
| PR11 | `a wooden barrel · L-DAY` |
| PR12 | `coiled ropes and a stack of crates · L-DAY` |
| PR13 | `a heavy iron-banded prison door, front view, flat · L-TORCH` |
| PR14 | `iron prison bars, front view, flat · L-TORCH` |
| PR15 | `a single tall wooden cross, dark silhouette, plain` |
| PR16 | `a row of seven wooden crosses as small silhouettes on a ridge line` |
| PR17 | `a golden Roman eagle standard on a pole · L-GOLD` |
| PR18 | `a thick anchor rope going diagonally down, with a small crab on it · L-GOLD` |
| PR19 | `a burst of dozens of silver coins frozen mid-air, spinning` |
| PR20 | `a single big shiny silver coin, front view` |
| PR21 | `a papyrus scroll unrolled · L-FIRE` |
| PR22 | `crumpled papyrus balls scattered · L-FIRE` |
| PR23 | `a big wooden drum and two drumsticks · L-FIRE` |
| PR24 | `a towel on the deck with a cup of wine beside it · L-DAY` |
| PR25 | `a parasol, a fan, a cushion and a bowl of grapes flying through the air, scattered · L-DAY` |
| PR26 | `a grappling hook on a rope, flying · L-DAY` |
| PR27 | `a black horse standing, saddled, side view facing right · L-FIRE` |
| PR28 | `a burning torch on a wall bracket · L-TORCH` |

## Part 10: FX, 14 (CUT-OUT HEADER)
| Code | Element |
|---|---|
| FX01 | `bonfire flames, tall, frame 1 of 3` · FX02 / FX03 `edit → flames in a different shape` (I loop them) |
| FX04 | `sparks and embers flying upward` |
| FX05 | `a splash of white sea spray and droplets` |
| FX06 | `a big water splash` |
| FX07 | `a cloud of warm golden dust, soft edges` |
| FX08 | `wisps of thin ground fog, soft` |
| FX09 | `a single torch flame` |
| FX10 | `a jagged white lightning bolt` |
| FX11 | `red wine splashing out of a cup, droplets` |
| FX12 | `a burst of wood splinters and dust` |
| FX13 | `grey smoke puffs` |
| FX14 | `sweat drops, glossy` |

---

## Part 11: Shot assembly (my edit plan: real times; layers listed back → front; ⟳ = pose swaps/cycle)

| # | Time | VO | Layers | Movement |
|---|---|---|---|---|
| 1 | 0.0 | You think you know the worst hostage | BG01, PR12, CA01⟳CA02 | captain flops between despair poses; slow push |
| 2 | 1.6 | in history | BG01, PG01 (back), HE01⟳HE02 (front, back view) | pirates glare; hero sips; a cup refill (FX11) |
| 3 | 3.2 | 75 BC these pirates | BG01, PG01 | pirates twitch (squash bob), eyes shake |
| 4 | 4.9 | almost lost their minds | BG01, PI01 + PI02 | kid pops in from the left, old salt from the right |
| 5 | 6.5 | before he even left | BG01, PG01, HE01⟳HE02 | camera swings round behind the hero |
| 6 | 8.3 | It starts near a tiny island | BG03 (pan), PR03 | merchant ship sails across |
| 7 | 9.6 | Aegean Sea | BG04, PR03, PR01 ×2 | galleys glide out from behind the island (PR01⟳PR02 rowing) |
| 8 | 11.3 | pirate fleet stops a ship | BG04, PR01⟳PR02 ×2, PR03, FX05, PR26 | galleys race in, hooks fly, spray |
| 9 | 12.6 | drags off | BG05, PI06, PI07 | pirates swing in on ropes |
| 10 | 13.2 | one passenger | BG05 → BG01, PI05 + HE16 | hero dragged; then he walks calmly (HE10–15 walk cycle) |
| 11 | 14.7 | Twenty-five years old | BG01, HE03 | slow push on the shadowed hood |
| 12 | 16.1 | Expensive clothes | BG01 blurred, HE09 | macro push; ring glint |
| 13 | 17.4 | Strangely calm | BG01, HE03⟳HE04, PG04 (swords) | swords point in; he yawns |
| 14 | 19.0 | The pirates name their price | BG01, PG03 → CA10 | huddle, captain turns |
| 15 | 20.7 | Twenty talents of silver | BG01, CA03⟳CA04, PR06 | fingers up, then hands rubbed; coins glint |
| 16 | 22.3 | A fortune | BG23 blurred, PR06 + PR19 | coin burst |
| 17 | 23.5 | They expect him to beg | BG01, PG02, CA09 | they lean in; captain points down |
| 18 | 25.2 | Instead, he laughs | BG01, HE05⟳HE06 | punch-in, laugh shake |
| 19 | 27.7 | Twenty? | BG01, CA05 + PG01 | freeze-frame shock zoom |
| 20 | 28.5 | no idea who you've caught | BG01, HE07, PG01 | pirates' heads turn to each other |
| 21 | 30.9 | Ask for fifty | BG01, CA05 → CA06, HE08 (foreground) | hand pops up; captain falls back |
| 22 | 32.3 | Fifty talents | BG01, CA07 | finger counting |
| 23 | 33.6 | over a tonne of silver | BG07, PR07, CA08 | silver mountain rises; captain hugs it |
| 24 | 35.5 | sends his people off | BG02, HE21, RM01 | letter handed over |
| 25 | 37.6 | nearby cities to collect it | BG07 (sea), PR05 | the boat rows away and shrinks |
| 26 | 39.2 | stays behind… one friend and two servants | BG02, HE22, FR01⟳FR02, FR03 | the friend bites his nails |
| 27 | 41.8 | Alone | BG02 high wide, HE22 + FR01 + FR03 small | camera pulls up and back |
| 28 | 42.6 | most dangerous men at sea | BG02, PG04 ×3 ring, PI03, PI04 | pirates close in; axe then knife close-ups |
| 29 | 45.2 | this is where it gets weird | BG01, PR24, HE19, PG01 | whip-blur in; the hero is sunbathing |
| 30 | 47.3 | not a prisoner | BG01, HE20 → PI16, PR10 | shackles drop and land |
| 31 | 49.1 | acts like their boss | BG01, HE17⟳HE18, PG04, PR25 | snap → pirates flinch; things fly |
| 32 | 50.8 | When he wants to sleep | BG06, FX01–03, HE23 | the fire flickers |
| 33 | 51.9 | sends a servant | BG06, FR04 | servant tiptoes in from the left |
| 34 | 52.8 | keep it down | BG06, PG05⟳PG06 → PG07, PR23 | dancing, then a hard freeze; the music cuts |
| 35 | 54.2 | (sleeps) | BG06 dim, PR09, HE24 | the hammock sways |
| 36 | 54.7 | writes poems and speeches | BG08, HE25, PR22 | crumpled balls pop in one by one |
| 37 | 56.4 | sit and listen | BG06, HE26⟳HE27, PG08 | orator poses swap; pirates bored |
| 38 | 58.7 | if they don't clap | BG06, PG09 | nervous claps (bob) |
| 39 | 60.0 | illiterate barbarians | BG06, HE28 → PI08 | snap zoom to the brute |
| 40 | 61.8 | right to their faces | BG06, HE29 + PI09 | nose to nose; sweat FX14 |
| 41 | 63.3 | again and again | BG01 → BG02, HE30 + CA12/PI10 | quick day/sunset jump-cuts |
| 42 | 64.8 | with a smile | black/fire, HE31 | slow push on the smile |
| 43 | 66.8 | when I get out of here | BG06, HE32, PG10 | finger at the camera; pirates giggle |
| 44 | 68.4 | crucify | BG20, PR15 ×5, FX10 | whip-blur, lightning flash, thunder |
| 45 | 69.5 | every single one of you | BG06, HE33, PG08 | stick points one by one |
| 46 | 71.0 | hilarious | BG06, PG10, PI12 | laughter bobbing; one falls off a log |
| 47 | 73.0 | love this kid | BG06, CA11 + HE22 | the captain's arm drops round him |
| 48 | 74.2 | think he's joking | BG06, PI10, PI11, CA13 | pop-ins: thumbs up, tears, wink |
| 49 | 75.7 | Thirty-eight days later | BG23 + tally marks drawn in code | the tallies scratch in fast |
| 50 | 77.0 | the ransom arrives | BG07, PR05, PR06 | boat arrives, chests dumped |
| 51 | 78.4 | He's free | BG09, HE10–15 walk | walks off down the pier |
| 52 | 79.3 | run home | BG07, FR05⟳FR06 → FR07 | friend runs at camera, then kisses the ground |
| 53 | 81.0 | never look at the sea again | BG07, FR03 (turned away) | servants shuffle off |
| 54 | 82.8 | Not him. | BG09, HE22 | music drop; slow push |
| 55 | 83.7 | port of Miletus | BG10 (pan) | crowd ambience |
| 56 | 85.0 | raises ships and men | BG11, HE35, RM03⟳RM04 | slam → cheer |
| 57 | 86.3 | and sails | BG12, PR04 ×3 | galleys surge across |
| 58 | 87.6 | right back to that island | BG12, HE34, FX05 | wind, spray, drums |
| 59 | 89.0 | still there | BG13, PR09 ×2, PG08 (napping) | lazy sway |
| 60 | 90.4 | still anchored | BG14, PR18 | crab scuttles |
| 61 | 91.4 | counting his silver | BG13, PG11 → CA18, PR04 on the horizon | coins fall in slow motion |
| 62 | 93.3 | captures most of them | BG07, RM05⟳RM06, PI14⟳PI15, FX06 | charge vs flee, splashes |
| 63 | 94.6 | takes the money back | BG07, RM07, CA14 + RM08 | the chest carried off; captain reaches after it |
| 64 | 95.6 | locks them up | BG15, PG12, RM10 | sad chained walk |
| 65 | 96.5 | Pergamon | BG16, PR14, CA15, PI13 | the door slams (PR13); shake |
| 66 | 97.5 | But there's a problem | BG18, RM02 + HE22 | the scroll is handed over |
| 67 | 98.7 | the governor's job | BG18, GV01⟳GV02 | grapes, yawn |
| 68 | 100.5 | eye on all that silver | BG18, GV04 → GV05 → GV06 | greed escalates |
| 69 | 103.5 | think about it | BG18, GV07⟳GV08 + HE22 | wave, chin stroke |
| 70 | 105.6 | doesn't wait | BG18, HE36 | whip turn out |
| 71 | 106.5 | races back | BG17, PR27 → GA1–GA6 over BG19 | mount, then gallop at 12/s, parallax road, dust |
| 72 | 109.0 | before the governor can decide | BG18, GV03 | snoring |
| 73 | 109.7 | (bursts in) | BG16, PR13 → HE37, RM12, FX12 | door kicked open, splinters |
| 74 | 110.5 | drags the pirates out | BG16, CA15, PI13 → RM09 + PG12 | dragged out |
| 75 | 112.2 | exactly what he promised | BG17, HE38, PG12 kneeling | eyes look up in horror |
| 76 | 114.1 | goes on a cross | BG20, PR16 → PR15 ×7, FX08 | whip-blur; the crosses rise in silhouette |
| 77 | 116.2 | treated him well | BG06 warm, CA17 + HE39 | memory glow, soft vignette |
| 78 | 117.8 | throats cut first | black | sound only |
| 79 | 119.4 | wouldn't suffer up there | BG21, PR16, FX08 | fog drifts, birds |
| 80 | 121.2 | a rich kid | BG01, PG10 + HE03 | memory: mocking |
| 81 | 123.5 | actually kidnapped the man | BG22, RM11, HE22 small | legions fill the valley |
| 82 | 125.0 | one day rule Rome | BG22, RM11 close, PR17 + BG24 | eagle flare |
| 83 | 126.8 | That hostage was | BG07, HE40 | slow turn |
| 84 | 128.0 | Julius Caesar | BG07, HE41 → HE42 | REVEAL: light flare, music hit, his googly eyes appear for the first time |
| 85 | 130.5 | always kept his promises | BG07, HE42, PR16 tiny on the far hill | slow push; smirk; end |

---

## Part 12: Eyes and mouth update (prompt for GPT)
```
Update my Remotion components GooglyEyes.tsx and CartoonMouth.tsx (attached) to match a new style:
- Eyes 25% smaller by default, outline thinner (3.5% of size instead of 6%), slightly oval.
- New moods: "sideEye", "sad" (droopy upper lids, pupils down), "scheming" (lids flat at 40%), "shock" (very wide,
  tiny pupils, brows high), "glow" (eyes only: soft glowing white ovals, NO outline, small black pupils, for a face
  hidden in shadow).
- Mouth: add visemes "grin" (both rows of teeth), "teeth" (clenched), "wobble" (wavy sad line); outline 30% thinner.
Keep every existing prop and behaviour working. Return the full updated files.
```

---

## What to send me
In order (Drive folder, in parts is perfect):
1. CS1–CS5 and BG01–BG24 first (sets and sheets).
2. HE, CA, PG/PI, FR, GV, RM poses.
3. PR, FX, and the updated eye and mouth code.

Everything at native GPT size, no upscaling, named exactly by code. Shots 1–28 (0–45 s) need: BG01–BG05, BG07, BG23, HE01–HE16, HE21–HE22, CA01–CA10, PG01–PG04, PI01–PI07, FR01–FR03, RM01, PR01–PR07, PR12, PR19, PR26, FX05, FX11. That's enough for me to start.
