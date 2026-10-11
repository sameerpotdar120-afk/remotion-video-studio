# Trial: "Why do the King's Guard exist?" cartoon explainer: asset prompts

Trial only. The script and VO come from the reference video. Nothing here touches the map videos.

I animate everything in Remotion: camera pushes, character pop-ins, blinks, talking mouths, bounces, whip transitions.
I also draw all text, numbers, stat cards, the job-portal screen, the army tree, the sunburst, "TRUST 10/10" and the subscribe button in code.
So GPT only makes **empty backgrounds**, **characters on transparent backgrounds** and a few **props**.

---

## 1. Read this first

1. **No text, letters, numbers or logos in any image.** Signs, screens and papers stay blank.
2. **Backgrounds are empty.** No people or characters in them. I place the characters myself.
3. **Characters on a real transparent background** (PNG), full body unless a prompt says otherwise, with nothing else in the frame.
4. **Same chat for each set** (all backgrounds in one chat, all characters in another) so the style stays identical.
5. Make 2–3 versions of each and keep the best. Name files exactly as listed.
6. If you get a checkerboard or white background instead of transparency, reply:
   *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."*

Sizes: backgrounds **1024×1536** (portrait). Characters **1024×1536**. Props **1024×1024**.

## 2. Style Lock (paste once at the top of every chat)

```
You are making assets for a 2D cartoon explainer video (vertical 9:16 YouTube Short).
ART STYLE, keep it identical in every image:
- Clean 2D digital cartoon, like a polished webcomic / animated explainer.
- Thick, smooth dark-brown outlines (#2b2120), consistent line weight.
- Flat colours with soft cel shading (one shadow tone, one soft highlight), slightly muted warm palette.
- CHARACTERS: simple chibi-like people with a perfectly ROUND WHITE HEAD (like a white ball),
  two small black oval dot eyes, tiny simple mouth line, NO nose, NO ears, NO hair unless stated.
  Short stubby body, small rounded white-gloved hands, simple clothes with clear shapes.
- Expressive through eyes, eyebrows and mouth only. Funny, charming, a bit goofy.
- BACKGROUNDS: detailed but simple illustrated locations, slight depth, soft daylight,
  no people, no characters, no text, no logos, no signs with writing.
Never add text, letters, numbers, watermarks or logos.
```

---

## 3. Backgrounds (`BLANK` = no people, no text) — 11 images, 1024×1536

| File | Prompt |
|---|---|
| `bg_palace_front.png` | Wide view of a grand London royal palace front with tall black iron gates and gold details, a red-blue-white flag on the roof, a clock tower in the distance, bright blue sky with fluffy clouds, empty paved forecourt in the foreground. BLANK. |
| `bg_sentry_box.png` | Close view of a tall black wooden sentry box in front of a pale stone palace wall with columns and an iron lamp post, paved ground, soft daylight. The sentry box is empty. BLANK. |
| `bg_lineup_wall.png` | Dark red-brown brick wall lit by three warm spotlights from above (like a police line-up room), dark floor, moody. BLANK. |
| `bg_royal_path.png` | Low-angle view of a paved royal garden path with neat green lawns and trimmed hedges on both sides, a big stone urn in the foreground left, warm golden sunset light. BLANK. |
| `bg_dark_table.png` | Top-down view of an old dark wooden table in a dim room, warm candlelight from one side, deep shadows at the edges, empty table surface. BLANK. |
| `bg_throne_room.png` | Medieval-royal throne room: a golden throne with red velvet on a short red-carpeted stair, stone walls, red curtains, warm light. The throne is empty. BLANK. |
| `bg_palace_hall.png` | Palace interior corridor: cream-and-gold wall panels, a tall window with soft daylight, a red-carpeted floor, ornate doors. BLANK. |
| `bg_office_desk.png` | First-person view over a desk at a computer monitor (the monitor screen is plain light-grey, completely blank), keyboard, mouse; behind it a window showing a London street with a red double-decker bus. BLANK. |
| `bg_recruiter_office.png` | Small military recruitment office seen from the front of a desk: wooden desk in the foreground, beige wall with a cork board pinned with blank papers, a window with blinds. Chair behind the desk is empty. BLANK. |
| `bg_barracks.png` | Army barracks dorm interior: a metal bunk bed with a grey-green blanket in the foreground, dark red patterned wall, a steel locker, dim light. Bed is empty. BLANK. |
| `bg_training_field.png` | Military training field on a cloudy-bright day: green grass, a wooden climbing-wall obstacle and a rope net, a low fence, hills in the distance. BLANK. |

---

## 4. Characters (`PNG-T` = real transparent background) — 1024×1536

### Guard (the star): bearskin hat, red tunic
Always the same guard: very tall black fluffy bearskin hat that covers the top of his round white head down to the eyes, a chin strap, a bright red tunic with gold buttons and a white belt, dark navy trousers, white gloves.

| File | Prompt |
|---|---|
| `guard_attention.png` | The guard standing perfectly straight at attention, arms by his sides, serious neutral face, front view, full body. PNG-T. |
| `guard_smug.png` | The guard standing, one hand rubbing his chin, eyes half-closed with a smug proud little smile, front view, full body. PNG-T. |
| `guard_closeup.png` | Extreme close-up of the guard's head and shoulders leaning toward the camera, big bearskin hat filling the top, curious funny face. PNG-T. |
| `guard_march.png` | The guard marching, side view facing right, one leg forward, arms swinging, determined face, full body. PNG-T. |
| `guard_still_sweat.png` | The guard standing rigid and perfectly still, eyes straining wide, a single sweat drop on his face, a tiny fly sitting on his face, full body. PNG-T. |
| `guard_peace.png` | The guard walking away happily, turning his head back with a cheeky smile and giving a peace sign with one hand, full body. PNG-T. |
| `guard_rifle.png` | The guard holding an old-style rifle aimed forward across his body, stern face, three-quarter view, full body. PNG-T. |
| `guard_back.png` | The guard seen from behind (back view): bearskin hat, red tunic, standing straight, full body. PNG-T. |
| `guard_noir.png` | The guard drawn in a bold graphic-novel style: only black, white and red, high contrast, heavy black shadows, confident pose with arms crossed, full body. PNG-T. |

### "You" (the narrator character): ordinary guy
Round white head, a light-teal beanie, a brown coat over a dark shirt, brown trousers.

| File | Prompt |
|---|---|
| `you_think.png` | The narrator guy thinking: hand on chin, eyes looking up, puzzled little mouth, three-quarter view, upper body (waist up). PNG-T. |
| `you_shrug.png` | The narrator guy shrugging with both palms up, confused raised eyebrows, waist up. PNG-T. |
| `you_chocolate.png` | The narrator guy holding a half-eaten chocolate bar near his mouth, frozen mid-bite with shocked wide eyes, waist up. PNG-T. |
| `you_back_computer.png` | The narrator guy seen from behind (back of head and shoulders), sitting and reaching toward a mouse with one hand, as if using a computer. PNG-T. |
| `you_sleep.png` | The narrator guy lying asleep on his back with eyes closed and a peaceful smile, mouth slightly open, as if lying in a bed (just the guy, no bed). PNG-T. |
| `you_headshot.png` | Passport-style head-and-shoulders portrait of the narrator guy facing front, neutral polite face. PNG-T. |

### Other characters

| File | Prompt |
|---|---|
| `king_walk.png` | A short king: round white head, a gold crown, a thick white moustache, red royal coat with gold trim, blue trousers, walking forward pompously with chest out, full body. PNG-T. |
| `king_throne.png` | The same king sitting on an invisible seat with arms crossed, grumpy-suspicious eyebrows, full body (seated pose, no throne drawn). PNG-T. |
| `old_bodyguard.png` | A 17th-century royal bodyguard: round white head inside a silver helmet with a star badge, red coat, raising a curved sabre high in one hand, the other arm protecting someone behind him, fierce eyes, full body. PNG-T. |
| `recruiter_desk.png` | A recruiter officer: round white head, thick black moustache, white shirt and red tie, sitting with arms crossed and eyes closed in a smug "hmm" expression, waist up (as if behind a desk). PNG-T. |
| `drill_sergeant.png` | A drill sergeant: round white head, dark green beret, green army uniform, shouting with mouth wide open and pointing forward angrily, waist up. PNG-T. |

---

## 5. Props (`PNG-T`) — 1024×1024

| File | Prompt |
|---|---|
| `prop_dagger.png` | An old dagger with a dark wooden handle, blade pointing down, slight glint. PNG-T. |
| `prop_coins.png` | A small messy pile of gold coins. PNG-T. |
| `prop_poison_cake.png` | A slice of layered cake on a small plate with a suspicious green drip on top. PNG-T. |
| `prop_king_portrait.png` | A small framed portrait of the king (round white head, crown, white moustache) on old paper, slightly torn. No text. PNG-T. |
| `prop_army_crest.png` | A generic royal military crest: two crossed swords behind a red-and-gold crown with a small golden lion on top. No text, no letters. PNG-T. |
| `prop_badge_a.png` | A round dark-blue military badge with a red-and-gold crown on top and a gold flaming-grenade emblem in the centre. No text. PNG-T. |
| `prop_badge_b.png` | An eight-pointed silver star military badge with a red cross on a white circle in the centre. No text. PNG-T. |
| `prop_uniform.png` | A folded red guard tunic with gold buttons and a black bearskin hat on top, neat and shiny. PNG-T. |

---

**Total:** 11 backgrounds + 20 characters + 8 props = **39 images**. Put them all in one zip.

I'll take care of the rest:
- **VO:** pulled from the reference with Demucs, keeping only the voice.
- **Music:** Mixkit (free licence). **SFX:** Sonniss (royalty-free).
- **Fonts:** Google Fonts (OFL). **Code-drawn graphics:** "+£2,500", "EMPLOYMENT", "TRUST 10/10", the job portal, "ARMY → regiments" tree, "CLEAN STATS" card, the thought bubble, "SUBSCRIBE!".
