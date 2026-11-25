# The Worst Hostage in History: GPT prompt pack (v2 workflow)

147 s Short, 9:16, 4K final. Script: `episodes/caesar/SCRIPT.md` (22 beats, 411 words).
The timings below are estimates at your pace (2.8 words/s). After you send the VO, I retime every cut to the real words.

**About 102 images:**

| Group | Images |
|---|---|
| Character sheets | 5 |
| Whole-scene shots | 76 (61 shots, 15 with a b pose swap) |
| Cut-outs (horse gallop, prison door, coins, crosses) | 11 |
| Backgrounds for the cut-outs | 2 |
| FX | 8 |
| Eyes and mouth code update | 1 prompt |

---

## What changed from the Napoleon pack (from the reference analysis)

1. **Most shots are WHOLE SCENES.** The characters are painted into the scene, so light, shadows, depth of field and colour all match. This is the main reason the reference looks more real than our cut-outs.
   - Cut-outs are used only where something must move across the frame: the horse gallop, the prison door and flying coins.
2. **Pose swaps:** generate `a` first, then make `b` by **editing `a`**: "Same image, same camera, same lighting, same people. Change ONLY: …". I hide each swap with a 2-frame blur, like the reference.
3. **Film look, not game render.** Real camera, real lens, film grain, natural skin. **No upscaling and no sharpening.**
   - Send GPT's native 1024 x 1536 images; I upscale them myself.
   - The 4K-upscaled files last time came out waxy and over-sharp.
4. **A colour mood per scene** (M1–M7 below). The reference is darker and richer, and it changes colour with the story.
5. **The hero's face stays hidden until the very last shot.** Use a hood, deep shadow, his back to camera, or a close-up of his hands or mouth only.
   - In the dark I'll add only his glowing googly eyes. That's the suspense gag.
   - The last shot (S62) shows his face in full.
6. **Faces of everyone else:** clearly visible, eyes open, mouth closed (I add the cartoon eyes and mouths). Keep faces medium-sized, not tiny.
7. **Nothing graphic.** The crosses are distant silhouettes, there's no blood, and the throat line plays over a black screen.

---

## Copy blocks

### STYLE LOCK v2 (paste once at the start of every GPT chat)
```
For every image in this chat: a real cinematic film still, shot on an ARRI Alexa with a 35mm or 50mm prime lens,
Kodak Vision3 film emulation, natural film grain, shallow depth of field with soft background blur, motivated
practical lighting, rich deep colour grade. Natural skin with real pores and imperfections, real fabric weave,
weathered wood, salt-stained rope. Historically grounded eastern Mediterranean, 75 BC: Cilician pirate galleys,
Greek island coastlines, Roman clothing. NOT a video game render, NOT CGI, NOT plastic or waxy skin,
NOT over-sharpened, NOT HDR, NOT upscaled. NO text, NO letters, NO watermarks, NO logos, NO borders,
NO cartoon eyes or drawn faces. Vertical 9:16 composition, main subject in the middle 80% of the frame.
Everyone's faces clearly visible with eyes open and mouths closed, EXCEPT the HERO, whose face must always be hidden
(hood shadow, back to camera, silhouette) unless I say "REVEAL".
Keep every character identical to the attached character sheets.
```

### MOODS (add the one the shot names, word for word)
- **M1 AEGEAN DAY:** `bright midday Aegean light, turquoise and teal sea, sun-bleached wood, warm skin tones, crisp blue sky`
- **M2 FIRELIGHT NIGHT:** `night, lit only by a bonfire and torches, deep orange firelight on faces against teal-blue darkness, sparks in the air`
- **M3 GOLDEN HOUR:** `low golden-hour sun, long shadows, amber haze over the water, strong warm rim light`
- **M4 STORM BLUE:** `overcast steel-blue dusk, wind, sea spray, desaturated cool tones, dramatic clouds`
- **M5 TORCH PRISON:** `dark stone prison, flickering torchlight, heavy shadows, warm orange pools of light, cold blue darkness`
- **M6 PALACE:** `opulent Roman villa interior, warm lamp light, marble and red drapes, rich golds`
- **M7 DUSK FOG:** `blood-red and violet dusk sky, thin fog on the ground, silhouettes, sombre`

### CUT-OUT HEADER (only for the C- and FX- items)
```
Isolated cut-out on a fully transparent background (PNG with alpha). No scenery, no ground, no floor shadow.
Whole subject inside the frame with a small margin, nothing cropped, clean edges. Same film look as the STYLE LOCK.
```

---

## Character sheets (make these first and attach the matching sheet to every prompt that uses that person)

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
**CS5 THE GOVERNOR + ROMAN TROOPS**
```
Character sheet on plain light grey, full body front view: 1) THE GOVERNOR: fat Roman official aged 55, bald with a
grey fringe, double chin, white toga with a purple border, many gold rings, greedy little smile. 2) A ROMAN MARINE:
bronze helmet, chainmail, oval shield, short sword. 3) A MILESIAN SAILOR: tanned, short tunic, rope over shoulder.
Eyes open, mouths closed.
```

---

## Shot list: whole scenes (STYLE LOCK + the mood named + the attached sheets)

Each line is one image. `S05b` = an edit of `S05a`. Times are estimates.

### Beat 1 · 0:00–0:08 · "You think you know the worst hostage in history, but in 75 BC these pirates almost lost their minds before he even left."
| Code | Prompt |
|---|---|
| S01a | `M1. On the deck of a pirate galley, the PIRATE CAPTAIN sits on a barrel clutching his head with both hands in despair, exhausted, crew members slumped behind him. Medium shot, captain's face visible.` |
| S01b | Edit S01a → `the captain now bangs his forehead against the wooden mast.` |
| S02a | `M1. From directly behind and low: THE HERO sits relaxed on a crate in the middle of the deck, hood up, feet up on a coil of rope, while the five PIRATES stand around him glaring with weapons. We only see his back and hood.` |
| S03a | `M1. Close group shot of the five PIRATES side by side looking exhausted and miserable, dark circles under their eyes, slumped shoulders. All faces visible.` |

### Beat 2 · 0:08–0:18 · "It starts near a tiny island… Strangely calm."
| Code | Prompt |
|---|---|
| S04a | `M1. Aerial drone view of a tiny rocky island in the Aegean Sea, turquoise shallows, a small Roman merchant ship sailing past, two lean pirate galleys hiding behind the island's cliffs.` |
| S05a | `M1. Two low pirate galleys with oars churning white water racing toward a slow merchant ship, spray flying, pirates at the bows with ropes and hooks. Low angle from the water.` |
| S05b | Edit S05a → `the galleys are now alongside the merchant ship, grappling hooks flying.` |
| S06a | `M1. Pirates leaping and swinging on ropes onto the merchant ship's deck, sailors scattering, action, motion in clothes.` |
| S07a | `M1. Two PIRATES (BRUTE and SKINNY) dragging THE HERO across the deck by his arms, his hood up hiding his face, his body relaxed and not resisting.` |
| S07b | Edit S07a → `the hero now walks calmly between them on his own, as if they are escorting him.` |
| S08a | `M1. Extreme close-up of THE HERO's right hand resting calmly on his knee: heavy gold signet ring, fine wool cloak edge with a silver clasp, a pirate's knife blade near it. Only the hand is visible.` |
| S09a | `M1. THE HERO sits perfectly still on a crate, hood up, his whole face in deep black shadow, only his chin visible, while three PIRATES point swords at him from all sides. Medium shot.` |

### Beat 3 · 0:18–0:24 · "Twenty talents of silver. A fortune. They expect him to beg."
| Code | Prompt |
|---|---|
| S10a | `M1. The PIRATE CAPTAIN leans toward camera holding up two fingers, greedy gold-tooth grin, crew grinning behind him. Face clearly visible.` |
| S10b | Edit S10a → `he now rubs his hands together greedily.` |
| S11a | `M1. Close-up of open wooden chests and leather sacks overflowing with silver coins and silver bars, gleaming on the deck.` |
| S12a | `M1. The five PIRATES lean in toward camera with smug expectant faces, hands cupped to their ears, as if waiting for someone to beg.` |

### Beat 4 · 0:24–0:30 · "Instead, he laughs in their faces… Ask for fifty."
| Code | Prompt |
|---|---|
| S13a | `M1. THE HERO throws his head back laughing hard, hood up, only his open laughing mouth and jaw lit by sun, eyes and upper face lost in shadow, pirates around him.` |
| S13b | Edit S13a → `now he leans forward, laughing and pointing at the captain.` |
| S14a | `M1. The PIRATE CAPTAIN and crew with jaws dropped, completely stunned, frozen. Faces visible.` |
| S15a | `M1. Close foreground: THE HERO's hand holding up five spread fingers toward the camera, gold signet ring catching the light; behind it, out of focus, the stunned PIRATE CAPTAIN.` |

### Beat 5 · 0:30–0:33 · "Fifty talents. That's over a tonne of silver."
| Code | Prompt |
|---|---|
| S16a | `M3. A towering mountain of silver coins and silver bars on a beach at golden hour, tiny PIRATES climbing it in awe, scale like a hill.` |
| S17a | `M3. The PIRATE CAPTAIN hugging a huge pile of silver coins, eyes shut in bliss, drooling. Face visible.` |

### Beat 6 · 0:33–0:45 · "So he sends his people off… the most dangerous men at sea."
| Code | Prompt |
|---|---|
| S18a | `M3. A small rowing boat with four Roman messengers rowing away from the pirate galley toward a distant coast, golden water.` |
| S19a | `M3. On the pirate deck: THE HERO (back to camera, hood up) standing calmly, beside him THE FRIEND sweating and terrified, and the two SERVANTS hugging each other. Friend and servants' faces visible.` |
| S19b | Edit S19a → `the friend now bites his nails, the servants peek over each other's shoulders.` |
| S20a | `M3. Low wide angle: a ring of twenty armed PIRATES with swords, clubs and axes closing in around the four small figures in the middle of the deck, menacing silhouettes against the sunset.` |

### Beat 7 · 0:45–0:51 · "This is where it gets weird. He doesn't act like a prisoner. He acts like their boss."
| Code | Prompt |
|---|---|
| S21a | `M1. THE HERO lounges on a throne made of stacked crates and silk cushions, hood up, face in shadow, feet up on a barrel, holding a cup of wine, while the five PIRATES stand stiffly in a line in front of him like soldiers.` |
| S21b | Edit S21a → `the hero now snaps his fingers and points; the pirates flinch.` |
| S22a | `M1. PIRATES scrambling across the deck carrying a cushion, a fan, a bowl of grapes and a parasol toward the hooded HERO who points directions. Faces of pirates visible, panicked.` |
| S22b | Edit S22a → `two pirates collide and the grapes fly.` |

### Beat 8 · 0:51–0:57 · "When he wants to sleep, he sends a servant to tell the pirates to keep it down."
| Code | Prompt |
|---|---|
| S23a | `M2. Night on the island beach: the PIRATES partying around a big bonfire, drums, wine jugs raised, dancing wildly, sparks flying. Faces visible.` |
| S23b | Edit S23a → `different dance poses, one pirate mid-jump, drums mid-hit.` |
| S24a | `M2. SERVANT ONE tiptoeing into the firelight with one finger pressed to his lips, stern face.` |
| S25a | `M2. The PIRATES frozen mid-dance in silly poses, drum sticks in the air, sheepish guilty faces, total silence.` |
| S26a | `M2. THE HERO asleep peacefully in a rope hammock between two posts, cloak pulled over his face, moonlight, the bonfire behind now dim.` |

### Beat 9 · 0:57–1:07 · "He writes poems and speeches… illiterate barbarians, right to their faces."
| Code | Prompt |
|---|---|
| S27a | `M2. THE HERO standing on a barrel reading dramatically from a papyrus scroll by torchlight, one arm raised like an orator, hood up, face in shadow.` |
| S27b | Edit S27a → `now both arms spread wide, scroll fluttering.` |
| S28a | `M2. The PIRATES sitting cross-legged on the sand in a row like schoolboys, bored, one asleep, one picking his ear. Faces visible.` |
| S29a | `M2. Four PIRATES clapping nervously while the BRUTE sits with arms crossed refusing to clap, grumpy.` |
| S30a | `M2. THE HERO pointing furiously down at the BRUTE, scroll in the other hand, hood up, only his shouting mouth lit by the torch.` |
| S31a | `M2. Close-up of the BRUTE looking deeply offended, lip trembling. Face visible.` |

### Beat 10 · 1:07–1:16 · "With a smile, he promises them: …crucify every single one of you."
| Code | Prompt |
|---|---|
| S32a | `M2. Extreme close-up of the lower half of THE HERO's face under the hood: a calm, slow, confident smile, firelight on his lips, everything above the nose in black shadow.` |
| S33a | `M2. THE HERO crouched drawing rows of small crosses in the sand with a stick while the five PIRATES lean over watching, puzzled. Hero's back to camera.` |
| S34a | `M7. Five tall wooden crosses silhouetted against a blood-red sky, empty, ominous, low angle, fog.` |

### Beat 11 · 1:16–1:20 · "The pirates think it's hilarious. They love this kid. They think he's joking."
| Code | Prompt |
|---|---|
| S35a | `M2. The PIRATES roaring with laughter around the fire, slapping knees, wine spilling, tears of laughter. Faces visible.` |
| S35b | Edit S35a → `one pirate falls backwards off a log laughing.` |
| S36a | `M2. The PIRATE CAPTAIN with his big arm around THE HERO's shoulders like a proud uncle, ruffling the top of his hood; hero's face hidden in the hood.` |

### Beat 12 · 1:20–1:23 · "Thirty-eight days later, the ransom arrives. He's free."
| Code | Prompt |
|---|---|
| S37a | `M1. Close-up of a rough wooden plank wall with many scratched tally marks in groups, a knife stuck in the wood.` |
| S38a | `M1. A Roman boat arriving at the pirate beach, sailors unloading heavy chests of silver, pirates rushing to grab them.` |
| S39a | `M3. THE HERO walking away down a gangplank onto a pier, back to camera, cloak flowing, free.` |

### Beat 13 · 1:23–1:29 · "Any normal person would run home and never look at the sea again. Not him."
| Code | Prompt |
|---|---|
| S40a | `M1. THE FRIEND running joyfully up a beach away from the sea, arms in the air, sandals flying off. Face visible.` |
| S41a | `M3. THE HERO standing alone at the end of a stone pier, back to camera, turned toward the sea, cloak blowing, a huge sunset, silhouette.` |

### Beat 14 · 1:29–1:35 · "He goes straight to the port of Miletus… sails right back to that island."
| Code | Prompt |
|---|---|
| S42a | `M1. Busy ancient Greek harbour of Miletus: marble stoa, white buildings, dozens of ships, sailors, merchants, crowds.` |
| S43a | `M1. THE HERO (hood up, face in shadow) slamming a bag of coins onto a table in front of a line of tough MILESIAN SAILORS and ROMAN MARINES, who grin. Their faces visible.` |
| S44a | `M4. Three war galleys launching from the harbour, oars rising in unison, sails unfurling, marines on deck.` |
| S44b | Edit S44a → `oars now down in the water, galleys surging forward with spray.` |
| S45a | `M4. A fleet of war galleys under full sail cutting through rough sea toward a rocky island on the horizon, dramatic clouds.` |

### Beat 15 · 1:35–1:40 · "The pirates are still there. Still anchored. Probably still counting his silver."
| Code | Prompt |
|---|---|
| S46a | `M3. The PIRATES on the beach happily counting silver coins into piles, galleys anchored behind them. Faces visible, smiling.` |
| S46b | Edit S46a → `all the pirates look up in horror at something out at sea, coins falling from their hands.` |

### Beat 16 · 1:40–1:46 · "He captures most of them… the prison at Pergamon."
| Code | Prompt |
|---|---|
| S47a | `M4. ROMAN MARINES storming the beach from their galleys, shields up, pirates fleeing in chaos, splashing water.` |
| S47b | Edit S47a → `the marines now pin pirates down in the surf, swords knocked away.` |
| S48a | `M4. The PIRATES in iron chains walking in a sad line along a road, heads down, marines guarding. Faces visible, miserable.` |
| S49a | `M5. Inside a stone prison corridor at Pergamon, the PIRATES crammed behind iron bars, torches on the walls. Faces visible, gripping the bars.` |

### Beat 17 · 1:46–1:55 · "But there's a problem… He says he'll think about it."
| Code | Prompt |
|---|---|
| S50a | `M6. THE GOVERNOR reclining on a red couch in a marble hall, eating grapes, servants fanning him. Face visible.` |
| S51a | `M6. Close-up of THE GOVERNOR's greedy face staring sideways at an open chest of silver on a table, licking his lips.` |
| S52a | `M6. THE GOVERNOR waving one hand lazily in a "later" gesture at THE HERO (back to camera, hood up) standing before him.` |

### Beat 18 · 1:55–2:01 · "So our hostage doesn't wait. He races back to the prison before the governor can decide."
| Code | Prompt |
|---|---|
| S53a | `M5. THE HERO bursting through a heavy prison door at night, cloak swirling, torch in hand, hood up, face in shadow, guards startled.` |
(The gallop itself is the cut-out cycle C-H1…H6 below.)

### Beat 19 · 2:01–2:09 · "He drags the pirates out… Every one of them goes on a cross."
| Code | Prompt |
|---|---|
| S54a | `M5. Close-up of the PIRATE CAPTAIN and the KID behind bars, terrified, torchlight on their faces. Faces visible.` |
| S55a | `M5. ROMAN MARINES dragging the chained PIRATES out of the prison into the torchlit yard, pirates digging their heels in.` |
| S56a | `M7. Wide shot of a distant hill at dusk with a long row of wooden crosses as small dark silhouettes against a red and violet sky, fog, no gore, nothing graphic.` |

### Beat 20 · 2:09–2:15 · "But because they'd treated him well… so they wouldn't suffer up there."
| Code | Prompt |
|---|---|
| S57a | `M7. The same hill of distant crosses at dawn in thick fog, almost hidden, quiet, birds flying, sombre, nothing graphic.` |
(The throat line plays over a black screen with sound only.)

### Beat 21 · 2:15–2:22 · "The pirates thought they'd kidnapped a rich kid… the man who would one day rule Rome."
| Code | Prompt |
|---|---|
| S58a | `M3. Thousands of Roman legionaries marching in perfect formation toward camera, eagle standards raised, dust, epic scale, sunset.` |
| S59a | `M3. A golden eagle standard against the sky, flags, sunlight flaring behind it, low angle.` |

### Beat 22 · 2:22–2:27 · "That hostage was a twenty-five-year-old Julius Caesar. And he always kept his promises." — REVEAL
| Code | Prompt |
|---|---|
| S60a | `REVEAL. M3. THE HERO lowering his hood, face fully revealed for the first time, chest-up portrait, golden light on his face, a sharp confident smirk, eyes open looking straight into the camera, the sea and anchored galleys behind him.` |
| S60b | Edit S60a → `the same, now raising one eyebrow, smirk slightly wider.` |
| S61a | `REVEAL. M2. Close-up of THE HERO's face lit by firelight, hood down, a calm cold smile, eyes open, looking into the camera.` (used for a flashback flash in beat 21) |

**Count:** 76 whole-scene images (61 shots S01a–S61a, plus 15 b edits).

---

## Cut-outs (CUT-OUT HEADER + attach CS1)

| Code | Prompt |
|---|---|
| H1 | Gallop 1/6: `THE HERO riding a black horse at full gallop toward the RIGHT, side view, hood up and face in shadow, cloak streaming behind. Horse pose: all four legs gathered under the body. Lighting: M2 torchlight from the left.` |
| H2–H6 | Edit the previous one each time → `same rider, same angle, same lighting, change ONLY the horse's legs to:` H2 `front legs reaching forward`, H3 `front hooves striking the ground`, H4 `body stretched, hind legs pushing`, H5 `fully airborne, legs extended`, H6 `hind legs landing`. |
| BGH | (no cut-out header) `M2. Empty night road through olive trees toward a distant walled city with torches, wide landscape 1536x1024, no people.` |
| D1 | `A heavy iron-banded wooden prison door, front view, flat.` |
| BGD | (no cut-out header) `M5. Empty stone prison doorway and corridor seen from inside, torches, the door opening empty, 1024x1536.` |
| K1 | `A burst of dozens of silver coins frozen mid-air, spinning, sparkling.` |
| K2 | `A single big shiny silver coin with a stamped face design, front view.` |
| X1 | `A single tall wooden cross silhouette, dark, plain.` |
| X2 | `A row of five small wooden cross silhouettes on a ridge line.` |

## FX (CUT-OUT HEADER)
| Code | Prompt |
|---|---|
| F1 | `Bonfire sparks and embers flying upward, glowing orange, scattered.` |
| F2 | `A splash of white sea spray and water droplets, frozen mid-air.` |
| F3 | `A cloud of warm golden dust, soft edges, semi-transparent.` |
| F4 | `Wisps of thin ground fog, soft, semi-transparent.` |
| F5 | `A single torch flame, bright, flickering.` |
| F6 | `A crack of white lightning, jagged.` |
| F7 | `Wine splashing out of a cup, red droplets mid-air.` |
| F8 | `A burst of wood splinters and dust, as if a door was kicked in.` |

---

## Eyes and mouth update (prompt for GPT, to restyle the existing code)
```
Update my Remotion components GooglyEyes.tsx and CartoonMouth.tsx (attached) to match a new style:
- Eyes 25% smaller by default, outline thinner (3.5% of size instead of 6%), slightly oval (taller than wide).
- New moods: "sideEye" (pupils hard to one side, lids half closed), "sad" (droopy upper lids slanting down at the
  outer corners, pupils looking down), "scheming" (lids flat at 40% with pupils centred), "shock" (very wide, tiny
  pupils, brows high), "glow" (eyes only: white ovals with a soft white outer glow and NO outline, for a face hidden
  in shadow; pupils small and black).
- Optional drawn eyelid line and brow shapes per mood, thin and expressive.
- Mouth: add visemes "grin" (wide with top and bottom teeth), "teeth" (clenched rectangle of teeth), "wobble"
  (wavy sad line), and make the outline 30% thinner.
Keep every existing prop and behaviour working. Return the full updated files.
```

---

## Effects cue sheet (my edit plan, so you can see where the effects go)
| Time | Word | Effect |
|---|---|---|
| 0:00 | "worst hostage" | slow push on the captain; heavy vignette |
| 0:12 | "drags off" | swap with motion blur, spray FX |
| 0:24 | "laughs" | camera punch-in + echoing laugh SFX |
| 0:28 | "fifty" | coin burst K1 flying at the camera + cash-register "ding" |
| 0:45 | "gets weird" | **whip-blur transition** + record scratch |
| 0:54 | "keep it down" | music cuts out for 1 beat (silence gag) |
| 1:03 | "barbarians" | snap zoom on the BRUTE's face |
| 1:10 | "crucify" | **whip-blur** to the crosses, thunder + lightning F6 flash |
| 1:20 | "thirty-eight days" | tally marks appear one by one (code), fast time-lapse light change |
| 1:27 | "Not him." | music drop, slow push on the silhouette |
| 1:33 | "sails right back" | storm grade, sea spray, drums kick in |
| 1:38 | "counting his silver" → look up | coins fall in slow motion |
| 1:44 | "Pergamon" | prison door slam (D1) + shake + flash |
| 1:55 | "races back" | 6-pose gallop at 12/s over a parallax road, dust, hooves |
| 2:05 | "on a cross" | **whip-blur** + low drone, colour drains to M7 |
| 2:09 | throats line | black screen, sound only |
| 2:22 | "Julius Caesar" | hood drop, light flare, music hit, his googly eyes appear for the first time; caption in gold |

---

## What to send me
1. **VO first:** the whole script recorded. I speed it up 1.10x and retime every cut to your words.
2. A Drive folder or zip with: CS1–CS5, S01a–S61a plus the b edits (76 images), H1–H6, BGH, D1, BGD, K1, K2, X1, X2, F1–F8, all at **native GPT size, no upscaling**.
3. The updated eye and mouth code files.

Send in parts if easier: beats 1–6 first (S01–S20) lets me start building while you make the rest.
