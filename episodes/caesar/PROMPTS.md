# The Worst Hostage in History: GPT prompt pack (v2 workflow)

133.7 s Short (your VO at 1.10x), 9:16, 4K final. Script: `episodes/caesar/SCRIPT.md` (22 beats, 411 words).
Every timing below comes from your real VO, so each cut lands on a word.

**About 165 images**, so the picture changes about every 0.9 s, the same pace as the reference (it changes image every 0.89 s):

| Group | Images |
|---|---|
| Character sheets | 5 |
| Whole-scene shots | **139** (80 shots; most have b/c pose or reaction swaps) |
| Cut-outs (horse gallop ×6, prison door, coins, crosses) | 11 |
| Backgrounds for the cut-outs | 2 |
| FX | 8 |
| Eyes and mouth code update | 1 prompt |

Why Napoleon needed 90 pieces for 18 s but this needs ~165 for 134 s: Napoleon was built from LAYERS (each pose, prop and rabbit reused dozens of times). This video follows the reference: mostly whole pictures, about 1 image per second of VO.

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

**Times are REAL**, taken from your VO at 1.10x (133.7 s).
- `a` is a new image.
- `b` and `c` are **edits of `a`**: "Same image, same camera, same lighting, same people. Change ONLY: …".
- I swap a → b → c on the words shown, with a 2-frame blur, like the reference.
- The hero (THE HERO) is never shown in the face before S79. In the dark I'll give him glowing eyes only.

### Beat 1 · 0.0–8.3 s · "You think you know the worst hostage in history, but in 75 BC these pirates almost lost their minds before he even left."
| Code | Time · word | Prompt |
|---|---|---|
| S01a | 0.0 "You think" | `M1. On a pirate galley deck the PIRATE CAPTAIN sits on a barrel clutching his head with both hands in despair, exhausted, crew slumped behind him. Medium shot, face visible.` |
| S01b | 0.8 "worst hostage" | edit → `the captain now bangs his forehead against the wooden mast.` |
| S02a | 1.6 "in history" | `M1. Wide shot of the galley deck: pirates lying around exhausted and miserable, one hugging a rope crying; in the middle THE HERO sits relaxed on a crate, seen from behind, hood up.` |
| S02b | 2.4 | edit → `a pirate now covers his ears and screams silently.` |
| S03a | 3.2 "75 BC these pirates" | `M1. Close group shot of the five PIRATES side by side, dark circles under their eyes, hair messed up, twitching, exhausted. All faces visible.` |
| S04a | 4.9 "almost lost their minds" | `M1. The KID pirate pulling at his own curly hair, screaming at the sky. Face visible.` |
| S04b | 5.7 | edit → `now the OLD SALT pirate beside him is chewing on a rope, eyes wild.` |
| S05a | 6.5 "before he even left" | `M1. From behind: THE HERO lounging on a crate, feet up on a coil of rope, sipping from a cup, hood up, while the pirates glare at his back with weapons.` |
| S05b | 7.4 | edit → `the hero now holds his empty cup out over his shoulder for a refill; a pirate grudgingly pours.` |

### Beat 2 · 8.3–19.0 s · "It starts near a tiny island… Strangely calm."
| Code | Time · word | Prompt |
|---|---|---|
| S06a | 8.3 "It starts" | `M1. Aerial view of a tiny rocky island in the Aegean, turquoise shallows, a small Roman merchant ship sailing past.` |
| S06b | 9.6 "Aegean Sea" | edit → `camera lower, two lean pirate galleys now visible hiding behind the island's cliffs.` |
| S07a | 11.3 "pirate fleet" | `M1. Two low pirate galleys racing toward a slow merchant ship, oars churning white water, pirates at the bows with ropes and hooks. Low angle from the water.` |
| S07b | 12.0 "stops a ship" | edit → `the galleys now alongside the merchant ship, grappling hooks flying, sailors panicking.` |
| S08a | 12.6 "drags off" | `M1. Pirates swinging on ropes onto the merchant ship's deck, sailors scattering, action.` |
| S08b | 13.2 "one passenger" | `M1. The BRUTE and SKINNY drag THE HERO across the deck by his arms, hood up hiding his face, his body relaxed, not resisting.` |
| S08c | 13.9 | edit S08b → `the hero now walks calmly between them on his own, as if they are his escort.` |
| S09a | 14.7 "Twenty-five years old" | `M1. Medium close-up of THE HERO seated, hood up, his face in deep shadow, only his young clean-shaven jaw visible, sunlight behind.` |
| S10a | 16.1 "Expensive clothes" | `M1. Extreme close-up of THE HERO's hand: heavy gold signet ring, fine wool cloak edge, silver clasp. Only the hand visible.` |
| S10b | 16.5 | edit → `a pirate's dirty finger now pokes at the silver clasp, curious.` |
| S11a | 17.4 "Strangely calm" | `M1. THE HERO sits perfectly still on a crate, hood up, face in black shadow, while three PIRATES point swords at him from all sides.` |
| S11b | 18.2 | edit → `the hero now yawns, only his yawning mouth lit; the pirates look at each other confused.` |

### Beat 3 · 19.0–25.2 s · "The pirates name their price… They expect him to beg."
| Code | Time · word | Prompt |
|---|---|---|
| S12a | 19.0 "name their price" | `M1. The PIRATE CAPTAIN and his crew huddled in a circle whispering, scheming, glancing back at the hooded hero. Faces visible.` |
| S12b | 19.8 | edit → `the captain now turns away from the huddle, chest puffed, about to announce.` |
| S13a | 20.7 "Twenty talents" | `M1. The PIRATE CAPTAIN leans toward camera holding up two fingers, greedy gold-tooth grin, crew grinning behind.` |
| S13b | 21.4 "of silver" | edit → `he now rubs his hands together greedily.` |
| S14a | 22.3 "A fortune" | `M1. Close-up of open wooden chests and leather sacks overflowing with silver coins and silver bars, gleaming.` |
| S15a | 23.5 "expect him to beg" | `M1. The five PIRATES lean in toward camera with smug expectant faces, hands cupped to their ears.` |
| S15b | 24.3 | edit → `the captain now points sternly at the floor as if ordering someone to kneel.` |

### Beat 4 · 25.2–32.3 s · "Instead, he laughs in their faces. Twenty? …Ask for fifty."
| Code | Time · word | Prompt |
|---|---|---|
| S16a | 25.2 "he laughs" | `M1. THE HERO throws his head back laughing hard, hood up, only his open laughing mouth and jaw lit, upper face in shadow, pirates around him.` |
| S16b | 26.2 "in their faces" | edit → `he now leans forward laughing and pointing at the captain.` |
| S17a | 27.7 "Twenty?" | `M1. The PIRATE CAPTAIN and crew with jaws dropped, frozen in shock. Faces visible.` |
| S18a | 28.5 "no idea who you've caught" | `M1. THE HERO sitting relaxed, tapping two fingers against his hood at his temple, the pirates staring blankly. Hero's face in shadow.` |
| S18b | 29.6 | edit → `the pirates now look at each other, baffled, shrugging.` |
| S19a | 30.9 "Ask for fifty" | `M1. Close foreground: THE HERO's hand holding up five spread fingers toward camera, gold ring catching light; behind it, out of focus, the stunned PIRATE CAPTAIN.` |
| S19b | 31.5 | edit → `the captain behind now falls backwards off his barrel.` |

### Beat 5 · 32.3–35.5 s · "Fifty talents. That's over a tonne of silver."
| Code | Time · word | Prompt |
|---|---|---|
| S20a | 32.3 "Fifty talents" | `M1. The PIRATE CAPTAIN counting on his fingers, confused, tongue out in concentration. Face visible.` |
| S21a | 33.6 "over a tonne" | `M3. A towering mountain of silver coins and bars on a beach at golden hour, tiny PIRATES climbing it in awe.` |
| S21b | 34.4 "of silver" | `M3. The PIRATE CAPTAIN hugging a huge pile of silver coins, eyes shut in bliss, drooling.` |

### Beat 6 · 35.5–45.2 s · "So he sends his people off… the most dangerous men at sea."
| Code | Time · word | Prompt |
|---|---|---|
| S22a | 35.5 "sends his people off" | `M3. THE HERO (back to camera, hood up) handing sealed letters to four Roman messengers who bow; pirate galley deck.` |
| S22b | 36.6 | edit → `the messengers now climbing down a rope ladder into a small boat.` |
| S23a | 37.6 "nearby cities" | `M3. A small rowing boat with four messengers rowing away across golden water toward a distant white Greek coastal town.` |
| S23b | 38.4 "to collect it" | edit → `the boat is now tiny, almost at the far shore.` |
| S24a | 39.2 "stays behind" | `M3. On the pirate deck: THE HERO (back to camera, hood up) standing calmly; beside him THE FRIEND sweating and terrified, the two SERVANTS hugging each other. Their faces visible.` |
| S24b | 40.3 "one friend and two servants" | edit → `the friend now bites his nails; the servants peek over each other's shoulders.` |
| S25a | 41.8 "Alone" | `M3. High wide shot: four small figures standing in the middle of an empty galley deck, long shadows, sea all around.` |
| S26a | 42.6 "most dangerous men" | `M3. Low wide angle: a ring of twenty armed PIRATES with swords, clubs and axes closing in around the four small figures, menacing silhouettes against the sunset.` |
| S26b | 43.5 | `M3. Close-up of the BRUTE slowly sharpening a huge axe, grinning. Face visible.` |
| S26c | 44.3 "at sea" | `M3. Close-up of SKINNY licking the flat of his knife blade, wide crazy eyes.` |

### Beat 7 · 45.2–50.8 s · "And this is where it gets weird… He acts like their boss."
| Code | Time · word | Prompt |
|---|---|---|
| S27a | 45.2 "gets weird" | `M1. THE HERO lying back sunbathing on a towel on the deck, hood shading his face, arms behind his head, while the pirates stand around gawking. Pirates' faces visible.` |
| S28a | 47.3 "not a prisoner" | `M1. THE HERO (face hidden in hood) calmly holding out a pair of unused iron shackles and dropping them into a pirate's hands; the pirate is confused.` |
| S28b | 48.0 | edit → `the pirate now stands holding the shackles, staring at them, baffled.` |
| S29a | 49.1 "their boss" | `M1. THE HERO lounges on a throne of stacked crates and silk cushions, hood up, face in shadow, feet on a barrel, cup of wine, the five PIRATES standing stiffly in a line like soldiers.` |
| S29b | 49.7 | edit → `the hero snaps his fingers and points; the pirates flinch.` |
| S29c | 50.3 | `M1. PIRATES scrambling across the deck carrying a cushion, a fan, grapes and a parasol, two colliding, grapes flying. Faces visible, panicked.` |

### Beat 8 · 50.8–54.7 s · "When he wants to sleep, he sends a servant to tell the pirates to keep it down."
| Code | Time · word | Prompt |
|---|---|---|
| S30a | 50.8 "wants to sleep" | `M2. Night, beach camp: THE HERO stretching and yawning by a tent, hood up, face in shadow, firelight.` |
| S31a | 51.9 "sends a servant" | `M2. SERVANT ONE tiptoeing into the firelight with one finger pressed to his lips, stern.` |
| S32a | 52.8 "the pirates" | `M2. The PIRATES partying around a big bonfire, drums, wine jugs raised, dancing wildly, sparks. Faces visible.` |
| S32b | 53.5 "keep it down" | edit → `the pirates frozen mid-dance in silly poses, drum sticks in the air, guilty faces, total silence.` |
| S32c | 54.2 | `M2. THE HERO asleep in a rope hammock, cloak pulled over his face, moonlight, the bonfire now dim.` |

### Beat 9 · 54.7–63.3 s · "He writes poems and speeches… illiterate barbarians, right to their faces."
| Code | Time · word | Prompt |
|---|---|---|
| S33a | 54.7 "writes poems" | `M2. THE HERO hunched over a papyrus by an oil lamp, writing with a reed pen, hood up, face in shadow.` |
| S33b | 55.6 "and speeches" | edit → `crumpled papyrus balls all around him; two pirates peek in curiously from the doorway.` |
| S34a | 56.4 "sit and listen" | `M2. THE HERO standing on a barrel reading dramatically from a scroll by torchlight, one arm raised like an orator, hood up.` |
| S34b | 57.2 | `M2. The PIRATES sitting cross-legged on the sand in a row like schoolboys, bored, one asleep, one picking his ear. Faces visible.` |
| S34c | 57.8 | edit S34a → `both arms now spread wide, scroll fluttering in the wind.` |
| S35a | 58.7 "if they don't clap" | `M2. Four PIRATES clapping nervously while the BRUTE sits with arms crossed refusing to clap.` |
| S36a | 60.0 "illiterate barbarians" | `M2. THE HERO pointing furiously down at the BRUTE, scroll in the other hand, hood up, only his shouting mouth lit by the torch.` |
| S36b | 60.9 | `M2. Close-up of the BRUTE looking deeply offended, lip trembling, eyes watery.` |
| S37a | 61.8 "right to their faces" | `M2. Over-the-shoulder from behind THE HERO's hood: he is nose to nose with the BRUTE, whose face fills the frame, shocked.` |
| S37b | 62.6 | edit → `the brute now leans back, sweat on his face.` |

### Beat 10 · 63.3–71.0 s · "And again and again, with a smile… crucify every single one of you."
| Code | Time · word | Prompt |
|---|---|---|
| S38a | 63.3 "again and again" | `M1. Day: THE HERO (hood up, back three-quarter) wagging his finger at the PIRATE CAPTAIN, who is laughing.` |
| S38b | 64.1 | `M3. Sunset: the same gesture, now wagging his finger at the KID, who grins.` |
| S39a | 64.8 "with a smile" | `M2. Extreme close-up of the lower half of THE HERO's face under the hood: a calm slow confident smile, firelight on his lips, everything above the nose in black shadow.` |
| S40a | 66.8 "when I get out of here" | `M2. THE HERO leaning toward camera, hood up, face in shadow, pointing one by one at the crew behind him, who are grinning.` |
| S40b | 67.7 | edit → `the pirates now elbow each other, giggling.` |
| S41a | 68.4 "crucify" | `M7. Five tall wooden crosses silhouetted against a blood-red sky, empty, ominous, low angle, fog.` |
| S42a | 69.5 "every single one" | `M2. THE HERO crouched drawing rows of small crosses in the sand with a stick while the PIRATES lean over watching, puzzled. Hero's back to camera.` |
| S42b | 70.3 "of you" | edit → `the hero now points the stick up at the pirates one by one; they still smile.` |

### Beat 11 · 71.0–75.7 s · "The pirates think it's hilarious. They love this kid. They think he's joking."
| Code | Time · word | Prompt |
|---|---|---|
| S43a | 71.0 "hilarious" | `M2. The PIRATES roaring with laughter around the fire, slapping knees, wine spilling. Faces visible.` |
| S43b | 71.8 | edit → `one pirate falls backwards off his log laughing.` |
| S44a | 73.0 "love this kid" | `M2. The PIRATE CAPTAIN with his big arm around THE HERO's shoulders like a proud uncle, ruffling the top of his hood; hero's face hidden.` |
| S45a | 74.2 "think he's joking" | `M2. The KID giving a big thumbs up and the OLD SALT wiping tears of laughter. Faces visible.` |
| S45b | 74.9 | edit → `the captain now winks at the camera.` |

### Beat 12 · 75.7–79.3 s · "Thirty-eight days later, the ransom arrives. He's free."
| Code | Time · word | Prompt |
|---|---|---|
| S46a | 75.7 "Thirty-eight days" | `M1. Close-up of a wooden plank wall with a few scratched tally marks, a knife stuck in the wood, morning light.` |
| S46b | 76.4 "later" | edit → `the wall is now covered in many groups of tally marks, evening light.` |
| S47a | 77.0 "ransom arrives" | `M1. A Roman boat arriving at the pirate beach, sailors unloading heavy chests of silver, pirates rushing to grab them.` |
| S48a | 78.4 "He's free" | `M3. THE HERO walking away down a gangplank onto a pier, back to camera, cloak flowing.` |

### Beat 13 · 79.3–83.7 s · "Any normal person would run home and never look at the sea again. Not him."
| Code | Time · word | Prompt |
|---|---|---|
| S49a | 79.3 "run home" | `M1. THE FRIEND running joyfully up a beach away from the sea, arms in the air, sandals flying off. Face visible.` |
| S49b | 80.3 | `M1. THE FRIEND on his knees kissing the dry ground of a dusty road. Face visible.` |
| S50a | 81.0 "never look at the sea" | `M1. The two SERVANTS walking away from the shore covering their eyes with their hands, refusing to look back at the sea.` |
| S51a | 82.8 "Not him." | `M3. THE HERO standing alone at the end of a stone pier, back to camera, facing the sea, cloak blowing, huge sunset, silhouette.` |
| S51b | 83.3 | edit → `closer, the hood now turned slightly over his shoulder toward camera, face still black.` |

### Beat 14 · 83.7–89.0 s · "He goes straight to the port of Miletus, raises ships and men, and sails right back to that island."
| Code | Time · word | Prompt |
|---|---|---|
| S52a | 83.7 "port of Miletus" | `M1. Busy ancient Greek harbour of Miletus: marble stoa, white buildings, dozens of ships, sailors, merchants, crowds.` |
| S53a | 85.0 "raises ships and men" | `M1. THE HERO (hood up, face in shadow) slamming a bag of coins onto a table in front of tough MILESIAN SAILORS and ROMAN MARINES, who grin. Their faces visible.` |
| S53b | 85.7 | edit → `the sailors and marines now cheer, raising swords and fists.` |
| S54a | 86.3 "and sails" | `M4. Three war galleys launching from the harbour, oars rising in unison, sails unfurling, marines on deck.` |
| S54b | 87.0 | edit → `oars now down in the water, galleys surging forward with spray.` |
| S55a | 87.6 "right back to that island" | `M4. A fleet of war galleys under full sail cutting through rough sea toward a rocky island on the horizon, dramatic clouds.` |
| S55b | 88.3 | `M4. From behind: THE HERO standing at the bow of the lead galley, cloak whipping in the wind, spray, the island ahead.` |

### Beat 15 · 89.0–93.3 s · "The pirates are still there. Still anchored. Probably still counting his silver."
| Code | Time · word | Prompt |
|---|---|---|
| S56a | 89.0 "still there" | `M3. The pirates' lazy beach camp: hammocks, wine jugs, pirates napping, two galleys anchored in the shallows.` |
| S57a | 90.4 "Still anchored" | `M3. Close-up of a thick anchor rope running down into clear turquoise water, a crab on it.` |
| S58a | 91.4 "counting his silver" | `M3. The PIRATES on the beach happily counting silver coins into neat piles. Faces visible, smiling.` |
| S58b | 92.2 | edit → `all of them look up in horror at something out at sea, coins falling from their hands.` |
| S58c | 92.8 | `M4. From the beach: the war fleet appearing over the horizon, sails filling the view, pirates' heads in the foreground.` |

### Beat 16 · 93.3–97.5 s · "He captures most of them, takes the money back, and locks them up in the prison at Pergamon."
| Code | Time · word | Prompt |
|---|---|---|
| S59a | 93.3 "captures most of them" | `M4. ROMAN MARINES storming the beach from their galleys, shields up, pirates fleeing in chaos, splashing water.` |
| S59b | 94.0 | edit → `the marines now pin the pirates down in the surf, swords knocked away.` |
| S60a | 94.6 "takes the money back" | `M4. MARINES carrying the silver chests away while the PIRATE CAPTAIN, held back by two marines, reaches out for them crying.` |
| S61a | 95.6 "locks them up" | `M4. The PIRATES in iron chains walking in a sad line along a road, heads down, marines guarding. Faces visible.` |
| S61b | 96.5 "Pergamon" | `M5. Inside a stone prison at Pergamon, the PIRATES crammed behind iron bars, torches on the walls, gripping the bars.` |

### Beat 17 · 97.5–105.6 s · "But there's a problem… He says he'll think about it."
| Code | Time · word | Prompt |
|---|---|---|
| S62a | 97.5 "But there's a problem" | `M6. A nervous messenger handing THE HERO (back to camera, hood up) a scroll with a wax seal in a marble corridor.` |
| S63a | 98.7 "the governor's job" | `M6. THE GOVERNOR reclining on a red couch in a marble hall, eating grapes, servants fanning him. Face visible.` |
| S63b | 99.7 | edit → `the governor yawns hugely, a grape halfway to his mouth.` |
| S64a | 100.5 "eye on all that silver" | `M6. Close-up of THE GOVERNOR's greedy face staring sideways at an open chest of silver on a table, licking his lips.` |
| S64b | 101.4 | edit → `the governor now secretly hugs the silver chest.` |
| S64c | 102.3 | `M6. THE GOVERNOR biting a silver coin to test it, one eye closed, grinning.` |
| S65a | 103.5 "think about it" | `M6. THE GOVERNOR waving one hand lazily in a "later" gesture at THE HERO (back to camera, hood up) standing before him.` |
| S65b | 104.4 | edit → `the governor now strokes his chins, pretending to think, eyes still on the silver.` |

### Beat 18 · 105.6–110.5 s · "So our hostage doesn't wait. He races back to the prison before the governor can decide."
| Code | Time · word | Prompt |
|---|---|---|
| S66a | 105.6 "doesn't wait" | `M6. THE HERO turning sharply and striding out of the marble hall, cloak swirling, hood up, the governor blurred behind.` |
| S66b | 106.5 | `M2. Night courtyard: THE HERO swinging up onto a black horse, hood up, torches.` |
| — | 107.2–109.0 "races back to the prison" | **GALLOP cut-out cycle H1–H6 over BGH** (see the cut-outs section) |
| S67a | 109.0 "before the governor can decide" | `M6. THE GOVERNOR fast asleep on his couch, snoring, a grape still in his hand.` |
| S68a | 109.7 | `M5. THE HERO bursting through a heavy prison door at night, cloak swirling, torch in hand, hood up, face in shadow, guards startled.` |

### Beat 19 · 110.5–116.2 s · "He drags the pirates out… Every one of them goes on a cross."
| Code | Time · word | Prompt |
|---|---|---|
| S69a | 110.5 "drags the pirates out" | `M5. Close-up of the PIRATE CAPTAIN and the KID behind bars, terrified, torchlight on their faces.` |
| S69b | 111.3 | `M5. ROMAN MARINES dragging the chained PIRATES out into the torchlit yard, pirates digging in their heels.` |
| S70a | 112.2 "exactly what he promised" | `M5. THE HERO standing in the torchlit prison yard watching, back to camera, hood up, the chained pirates kneeling before him.` |
| S70b | 113.0 "on that island" | edit → `the pirates now look up at him in horror as they recognise the promise.` |
| S71a | 114.1 "Every one of them" | `M7. Wide shot of a distant hill at dusk with a long row of wooden crosses as small dark silhouettes against a red and violet sky, fog, nothing graphic.` |
| S71b | 115.0 "on a cross" | edit → `closer and lower, the crosses taller against the sky, fog drifting.` |

### Beat 20 · 116.2–121.2 s · "But because they'd treated him well… so they wouldn't suffer up there."
| Code | Time · word | Prompt |
|---|---|---|
| S72a | 116.2 "treated him well" | `M2. Warm memory: the PIRATE CAPTAIN sharing bread with THE HERO (hood up, back three-quarter) by the campfire, both relaxed, soft glow.` |
| — | 117.8–119.4 "throats cut first" | **Black screen, sound only** (no image) |
| S73a | 119.4 "wouldn't suffer" | `M7. The same hill of distant crosses at dawn in thick fog, almost hidden, quiet, nothing graphic.` |
| S73b | 120.3 "up there" | edit → `birds now lifting off into the pale sky.` |

### Beat 21 · 121.2–126.8 s · "The pirates thought they'd kidnapped a rich kid… the man who would one day rule Rome."
| Code | Time · word | Prompt |
|---|---|---|
| S74a | 121.2 "a rich kid" | `M1. Memory: the PIRATES mock-bowing and laughing at the hooded HERO on the galley deck, pinching his fine cloak. Pirates' faces visible.` |
| S75a | 123.5 "actually kidnapped the man" | `M3. THE HERO from behind, hood up, standing on a hill as a small silhouette before a vast valley full of Roman legions.` |
| S76a | 125.0 "one day rule" | `M3. Thousands of Roman legionaries marching in perfect formation toward camera, eagle standards raised, dust, epic.` |
| S76b | 125.9 "Rome" | `M3. A golden eagle standard against the sky, sunlight flaring behind it, low angle.` |

### Beat 22 · 126.8–133.7 s · "That hostage was a twenty-five-year-old Julius Caesar. And he always kept his promises." — REVEAL
| Code | Time · word | Prompt |
|---|---|---|
| S77a | 126.8 "That hostage was" | `M3. THE HERO, hood still up, turning toward the camera mid-turn, face still in shadow, the anchored galleys and the sea behind him.` |
| S78a | 128.0 "Julius Caesar" | `REVEAL. M3. THE HERO lowering his hood, face fully revealed for the first time, chest-up portrait, golden light, sharp confident smirk, eyes open looking into the camera.` |
| S78b | 128.8 | edit → `the same, now raising one eyebrow, smirk wider.` |
| S79a | 129.3 "always kept" | `REVEAL. M2. Close-up of THE HERO's face lit by firelight, hood down, a calm cold smile, eyes open, looking into the camera.` |
| S80a | 130.5 "his promises" | `REVEAL. M3. Wide final shot: THE HERO standing on the island beach at sunset, hood down, arms crossed, looking at camera, a tiny row of crosses on the distant hill behind him.` |
| S80b | 131.6 | edit → `a slow smile; he turns away toward the sea.` |

**Count:** 80 shots and **139 whole-scene images** (S01a–S80b). Including the gallop, the picture changes about every 0.9 s, the same pace as the reference.

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
| 0.0 s | "worst hostage" | slow push on the captain; heavy vignette |
| 12.6 s | "drags off" | swap with motion blur, spray FX |
| 25.2 s | "laughs" | camera punch-in + echoing laugh SFX |
| 30.9 s | "fifty" | coin burst K1 flying at the camera + cash-register "ding" |
| 45.2 s | "gets weird" | **whip-blur transition** + record scratch |
| 53.5 s | "keep it down" | music cuts out for 1 beat (silence gag) |
| 60.0 s | "barbarians" | snap zoom on the BRUTE's face |
| 68.4 s | "crucify" | **whip-blur** to the crosses, thunder + lightning F6 flash |
| 75.7 s | "thirty-eight days" | tally marks appear one by one (code), fast time-lapse light change |
| 82.8 s | "Not him." | music drop, slow push on the silhouette |
| 86.3 s | "sails right back" | storm grade, sea spray, drums kick in |
| 92.2 s | "counting his silver" → look up | coins fall in slow motion |
| 96.5 s | "Pergamon" | prison door slam (D1) + shake + flash |
| 107.2 s | "races back" | 6-pose gallop at 12/s over a parallax road, dust, hooves |
| 114.1 s | "on a cross" | **whip-blur** + low drone, colour drains to M7 |
| 117.8 s | throats line | black screen, sound only |
| 128.0 s | "Julius Caesar" | hood drop, light flare, music hit, his googly eyes appear for the first time; caption in gold |

---

## What to send me
VO received and timed (133.7 s at 1.10x). Now the images, at **native GPT size, no upscaling**, named exactly as the codes:
1. CS1–CS5 first.
2. S01a … S80b (139 images), H1–H6, BGH, D1, BGD, K1, K2, X1, X2, F1–F8.
3. The updated eye and mouth code files.

Send them in parts (Drive folder is perfect). Beats 1–6 (S01–S26, 0–45 s) let me start building while you make the rest.
