# Louisiana Purchase (Hindi): Asset Prompts and Asset Plan

Style target: the reference Short (antique parchment map, chibi historical characters walking and reacting on the map, a recurring map-room set, short photo-background inserts, quick satellite cuts). We match the **style and quality**, but every character, prop and scene is our own design.

Script: `script_hindi_draft.txt` (the creator may still reword it; these assets cover every beat).

---

## 0. Read this first

**1. GPT never draws a map.** The parchment map (land, sea, country colours, borders, rivers) is built from real data (Natural Earth) plus the paper texture below. The satellite shots use NASA Blue Marble.

**2. No text, numbers, letters or flags inside any GPT image.** "$10M", "$15M", "FOR SALE", "SOLD", "1802", "1803", "<3¢/acre", labels and the French/US/British flags are all drawn in Remotion.

**3. One character style for the whole video.** Every person is a cute 2D chibi figure: a big round head (about 45% of the height), a small rounded body with no visible legs (a "bobblehead" peg shape), dot eyes, simple brows and mouth, soft cel shading, a thin dark-brown outline, and warm muted colours. Costumes are historically accurate for 1802–03. Make **all characters in one chat**, starting from B1, and keep the same scale.

**4. Respect the people in this story.** The enslaved workers and the Haitian revolutionaries are drawn with the same care and dignity as Napoleon or Jefferson: no exaggerated or stereotyped features, no suffering for shock value. Same chibi style, same proportions as everyone else.

**5. Clean assets from GPT; glow, shadows and motion in Remotion.**

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the start of each chat, then send the prompts one by one.
- Sizes: **1024×1024** for characters and props, **1024×1536** for full-screen scenes, **1536×1024** for the map-room set.
- `PNG-T` = real transparent background. If ChatGPT returns a checkerboard or white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000), for light/smoke effects.
- **Character poses:** for each character, generate the neutral pose first, then for every other pose say *"the exact same character as the previous image, same size, same angle, same outfit"* and upload the neutral image as a reference.
- Make 2–3 versions of each and keep the best. Name files exactly as listed. They go in `public/louisiana/img/`.

### Style Lock (paste once at the top of each chat)
```
You are generating production assets for a premium animated history explainer
(vertical 9:16 Short, antique parchment-map look, like a high-end After Effects
cartoon documentary). The story is the Louisiana Purchase, 1802–1803: Napoleon,
Thomas Jefferson, two American diplomats, Britain, and the Haitian Revolution
in Saint-Domingue. Characters are cute 2D chibi figures: big round head (about
45% of the height), small rounded peg-shaped body with no visible legs, dot
eyes, simple brows and mouth, soft cel shading, thin dark-brown outline, warm
muted colours, historically accurate 1800s costumes. Everyone is drawn with
dignity, no stereotyped or exaggerated features. Props are in the same cartoon
style. No text, no letters, no numbers, no flags, no logos, no watermark, no
signature, no frame or border. When I say PNG-T the background must be fully
transparent (real alpha channel). When I say BLACK the background must be pure
flat black #000000. Keep the subject centred with generous empty padding. Do
not add glow or drop shadows; those are added later in the video editor.
```

---

## 1. Maps and data (real, NOT GPT; I build these)

| What | Source |
|---|---|
| Antique parchment world/Europe/North America/Caribbean maps, colour-blocked by power (Britain, France, USA, Spain) as of 1802–03 | Natural Earth (public domain) coastlines + historical borders drawn by me, on the paper texture D4 |
| Mississippi River (glowing) and New Orleans | Natural Earth rivers / populated places |
| Satellite Caribbean and Hispaniola shots | NASA Blue Marble (public domain) |
| India outline at true scale over Louisiana | Natural Earth, India in its official boundary view |
| Flags, price tags' text, signs' text, counters, thought bubbles, arrows, labels | Drawn in Remotion |

---

## 2. GPT asset prompts

### B. Characters (all in ONE chat; upload B1 as the reference for every other character so the style matches)

#### B1 · `napoleon_neutral.png` (1024×1024, PNG-T)
```
Chibi Napoleon Bonaparte as First Consul in 1803: big round head, short dark
hair, black bicorne hat worn sideways with a small tricolour cockade, dark-blue
military coat with red collar and gold epaulettes, white waistcoat, red sash.
Standing, facing three-quarters to the left, arms at his sides, calm confident
face with a slight smirk. Full figure, centred. PNG-T, transparent background.
```

#### B2 · `napoleon_smirk.png`
```
The exact same Napoleon character as the reference, same size, angle and
outfit. Now a big sly smug grin, eyebrows raised, one hand resting on his
chin as if planning something. PNG-T, transparent background.
```

#### B3 · `napoleon_shrug.png`
```
The exact same Napoleon character, same size and outfit. Now shrugging with
both palms up, eyebrows raised, mouth in a flat "oh well" line, as if
something just became useless to him. PNG-T, transparent background.
```

#### B4 · `napoleon_handshake.png`
```
The exact same Napoleon character, now facing right, right arm stretched out
for a handshake, with a fake polite smile, while his left hand hides a small
sword behind his back. PNG-T, transparent background.
```

#### B5 · `briton_handshake.png`
```
A new character in exactly the same chibi style and scale as the reference:
a British leader of 1802 inspired by King George III, white powdered wig,
red coat with gold trim, white cravat. Facing left, right arm stretched out
for a handshake with a fake polite smile, left hand hiding a small sword
behind his back. PNG-T, transparent background.
```

#### B6 · `jefferson_neutral.png`
```
A new character in exactly the same chibi style and scale: Thomas Jefferson
in 1803, reddish-grey hair tied back, plain dark-brown coat, white cravat and
waistcoat. Standing facing three-quarters right, calm and thoughtful, hands
behind his back. PNG-T, transparent background.
```

#### B7 · `jefferson_briefcase.png`
```
The exact same Jefferson character, now holding out a small silver metal
briefcase with both hands, as if handing it over, with a determined look.
PNG-T, transparent background.
```

#### B8 · `diplomat_livingston_neutral.png`
```
A new character in exactly the same chibi style and scale: American diplomat
Robert Livingston in 1803, older man, grey powdered hair, black coat, white
cravat, holding a rolled document. Facing three-quarters right, polite and
serious. PNG-T, transparent background.
```

#### B9 · `diplomat_livingston_shocked.png`
```
The exact same Livingston character, now shocked: jaw dropped wide open in a
long cartoon "O", eyes wide, the document slipping from his hand. PNG-T,
transparent background.
```

#### B10 · `diplomat_monroe_neutral.png`
```
A new character in exactly the same chibi style and scale: American diplomat
James Monroe in 1803, younger man, dark brown hair, dark-blue coat, white
cravat. Facing three-quarters right, polite and serious. PNG-T, transparent
background.
```

#### B11 · `diplomat_monroe_shocked.png`
```
The exact same Monroe character, now shocked: jaw dropped wide open, eyes
wide, both hands up. PNG-T, transparent background.
```

#### B12 · `diplomats_nod.png`
```
Livingston and Monroe (exactly the same two characters as before) standing
side by side, glancing at each other with a sly "let's do it" look, both
nodding. PNG-T, transparent background.
```

#### B13 · `worker_chained.png`
```
A new character in exactly the same chibi style and scale: an enslaved man
working on a Caribbean sugar plantation in the 1790s, simple worn
off-white linen shirt and trousers, an iron shackle and short chain on one
ankle. Standing tall, facing the viewer, a calm, serious, dignified face.
Drawn with the same care as every other character. PNG-T, transparent
background.
```

#### B14 · `rebels_rise.png`
```
A group of four Haitian revolutionaries of the 1790s in exactly the same
chibi style and scale: men and women in simple work clothes and a few
red-and-blue revolutionary jackets, broken chains hanging from their wrists,
raising their fists together, determined and proud. PNG-T, transparent
background.
```

#### B15 · `french_soldier.png`
```
A new character in exactly the same chibi style and scale: a French infantry
soldier of 1802, tall black shako hat with a red plume, dark-blue coat with
white crossed straps, white trousers, holding a musket upright at his side.
Facing three-quarters right, confident. PNG-T, transparent background.
```

#### B16 · `french_soldier_sick.png`
```
The exact same soldier character, now sick with yellow fever: face and hands
tinted pale yellow, sweating, dizzy swirly eyes, slouching and leaning on his
musket. Cartoonish, not gruesome. PNG-T, transparent background.
```

#### B17 · `french_soldier_fallen.png`
```
The exact same sick soldier character (yellow-tinted), now lying flat on his
back on the ground, shako fallen beside him, musket on the ground, eyes shut
with cartoon "X" eyes. Cartoonish, not gruesome. Side view. PNG-T,
transparent background.
```

### C. Props (same chat as the characters, or a new chat with B1 uploaded as the style reference)

#### C1 · `ship_small.png` (1024×1024, PNG-T)
```
A small cartoon sailing ship of 1803, side view sailing to the right, brown
wooden hull, two masts with cream sails, no flags. Same cartoon style.
PNG-T, transparent background.
```

#### C2 · `ship_warship.png` (1024×1024, PNG-T)
```
A cartoon French navy warship of 1802, side view sailing to the left, dark
wood hull with a row of cannon ports, three masts with full white sails, no
flags. Same cartoon style. PNG-T, transparent background.
```

#### C3 · `briefcase_open.png`
```
A shiny silver metal briefcase in the same cartoon style, slightly open,
stacks of green banknotes visible inside. PNG-T, transparent background.
```

#### C4 · `price_tag_blank.png`
```
A big red cardboard price tag with a small hole and a short string, blank on
the front (nothing written), slight paper texture, same cartoon style. PNG-T,
transparent background.
```

#### C5 · `sign_blank.png`
```
A white wooden real-estate sign hanging from a white wooden post with two
small chains, the board completely blank (nothing written), same cartoon
style. PNG-T, transparent background.
```

#### C6 · `money_pile.png`
```
A messy pile of stacked green banknote bundles and a few gold coins, same
cartoon style. PNG-T, transparent background.
```

#### C7 · `sacks_sugar_coffee.png`
```
Two burlap sacks side by side in the same cartoon style: one overflowing with
white sugar, one overflowing with brown coffee beans. PNG-T, transparent
background.
```

#### C8 · `cargo_crate.png` and C9 · `cargo_barrel.png`
```
(C8) A small wooden cargo crate with rope ties, same cartoon style, three-
quarter view. PNG-T, transparent background.
(C9) A small wooden barrel with iron hoops, same cartoon style, three-quarter
view. PNG-T, transparent background.
```

#### C10 · `chain_broken.png`
```
A broken iron chain with a shattered shackle, a few metal fragments flying
off, same cartoon style. PNG-T, transparent background.
```

#### C11 · `coin_gold.png`
```
A single shiny gold coin seen from the front, a simple embossed rim, no
text or face on it, same cartoon style. PNG-T, transparent background.
```

### D. Sets and scenes

#### D1 · `set_map_room.png` (1536×1024, PNG-T)
The recurring "negotiation table". Characters stand in front of it; Remotion puts our own map onto the board.
```
An elegant 1800s negotiation set in the same cartoon style: a dark carved
wooden table with a few papers, a quill and an inkpot, and behind it a large
empty wooden-framed map board on an easel. The board's surface is a plain
aged-parchment rectangle with nothing drawn on it. Front view, the whole set
centred. PNG-T, transparent background.
```

#### D2 · `scene_plantation.png` (1024×1536)
Photo background; the chibi characters are composited on top.
```
Cinematic photograph of a sunny Caribbean sugar-cane plantation in the late
1700s: rows of tall green sugar cane, a dusty dirt path in the foreground, a
distant plantation house and hills, bright blue sky with white clouds. No
people. Shallow depth of field, the foreground path in focus. Portrait 9:16.
No text.
```

#### D3 · `scene_beach.png` (1024×1536)
```
Cinematic photograph of a tropical Caribbean beach on Hispaniola: pale sand in
the foreground, palm trees, green jungle and misty mountains behind, a calm
turquoise sea on one side, bright sky with big white clouds. No people.
Portrait 9:16. No text.
```

#### D4 · `texture_parchment.png` (1536×1536)
The paper the whole map is printed on.
```
A seamless, tileable texture of aged antique parchment paper: warm beige,
subtle fibres, soft stains and faint creases, evenly lit, no edges, no
borders, no text, no drawings. Square, flat, photographed straight on.
```

#### D5 · `scene_dust_puff.png` (1024×1024, BLACK)
For soldiers falling and quick impacts.
```
A soft puff of beige sand dust kicked up from the ground, realistic, soft
edges, centred, against pure flat black #000000. BLACK background.
```

---

## 3. Drawn in code (no GPT)

The parchment map and its country colours and borders · the glowing Mississippi and cargo floating down it · flags (French, US, British) · "$10M" / "$15M" on the price tags · "FOR SALE" → "SOLD" on the sign · "1802" / "1803" / "<3¢/acre" · thought bubbles · lasso circles and arrows · India's outline at true scale · rewind effect · whip transitions · Hindi subtitles · the @null_dynasty watermark.

---

## 4. File checklist

| # | File | Size | Required |
|---|---|---|---|
| B1 | `napoleon_neutral.png` | 1024² PNG-T | yes |
| B2 | `napoleon_smirk.png` | 1024² PNG-T | yes |
| B3 | `napoleon_shrug.png` | 1024² PNG-T | yes |
| B4 | `napoleon_handshake.png` | 1024² PNG-T | yes |
| B5 | `briton_handshake.png` | 1024² PNG-T | yes |
| B6 | `jefferson_neutral.png` | 1024² PNG-T | yes |
| B7 | `jefferson_briefcase.png` | 1024² PNG-T | yes |
| B8 | `diplomat_livingston_neutral.png` | 1024² PNG-T | yes |
| B9 | `diplomat_livingston_shocked.png` | 1024² PNG-T | yes |
| B10 | `diplomat_monroe_neutral.png` | 1024² PNG-T | yes |
| B11 | `diplomat_monroe_shocked.png` | 1024² PNG-T | yes |
| B12 | `diplomats_nod.png` | 1024² PNG-T | yes |
| B13 | `worker_chained.png` | 1024² PNG-T | yes |
| B14 | `rebels_rise.png` | 1024² PNG-T | yes |
| B15 | `french_soldier.png` | 1024² PNG-T | yes |
| B16 | `french_soldier_sick.png` | 1024² PNG-T | yes |
| B17 | `french_soldier_fallen.png` | 1024² PNG-T | yes |
| C1 | `ship_small.png` | 1024² PNG-T | yes |
| C2 | `ship_warship.png` | 1024² PNG-T | yes |
| C3 | `briefcase_open.png` | 1024² PNG-T | yes |
| C4 | `price_tag_blank.png` | 1024² PNG-T | yes |
| C5 | `sign_blank.png` | 1024² PNG-T | yes |
| C6 | `money_pile.png` | 1024² PNG-T | yes |
| C7 | `sacks_sugar_coffee.png` | 1024² PNG-T | yes |
| C8 | `cargo_crate.png` | 1024² PNG-T | yes |
| C9 | `cargo_barrel.png` | 1024² PNG-T | yes |
| C10 | `chain_broken.png` | 1024² PNG-T | yes |
| C11 | `coin_gold.png` | 1024² PNG-T | yes |
| D1 | `set_map_room.png` | 1536×1024 PNG-T | yes |
| D2 | `scene_plantation.png` | 1024×1536 | yes |
| D3 | `scene_beach.png` | 1024×1536 | yes |
| D4 | `texture_parchment.png` | 1536² | yes |
| D5 | `scene_dust_puff.png` | 1024² BLACK | optional |

32 required and 1 optional. Send them together with your voiceover (MP3) and SRT.
