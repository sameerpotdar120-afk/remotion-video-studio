# Brands: edit plan and image prompts

Script: `public/brands/elevenlabs_script.txt` (181 words, about 0:59 after the 1.15× speed-up).
Reference: "Popular brands from different countries": one continuous camera over a satellite map, each country floods with
one saturated colour on its name, a brand mark pops in on every brand name, a change every 1.0–1.3 s, a one-word caption
in the centre. We keep that rhythm and add what it lacks: a hook, a twist on every brand, India, and a loop ending.

---

## 1. How we edit it

**Map (documentary style, approved on Junagadh)**
- EOX Sentinel-2 cloudless plates (CC BY 4.0, credited) in black and white (`grayscale(1) contrast(1.38) brightness(0.8)`),
  dark neutral grade, strong vignette. Only the fills carry colour, so each country's flood hits harder than in the
  reference.
- Fills lie FLAT on the map (`FlatHL`): colour in a hard-light layer so the relief shows through, a crisp white outline,
  a keyframed wipe-in from the centre. Never lifted or floating.
- Natural Earth borders, India point-of-view edition: India's official boundary on every frame that shows India.
- One colour per country, kept all video: India saffron, Czechia red, Switzerland red with a white cross (drawn in
  code), USA blue, Britain navy, France blue-white-red flag fill, Monaco red-white, Canada red.
- A huge faded country name drifts slowly across each fill (as the reference), in Anton at 12 % opacity.

**Brand names (no logos)**
- Logos and packaging are the companies' artwork, so we never show them. Each brand name is set as type in our own OFL
  fonts (Anton for the name, Montserrat for the small line), white with a soft shadow, and it lands on the map on its
  word: scale 108 → 100 % with 3 frames of motion blur and a short light sweep. That is the reference's "logo pop"
  without the logos.
- Under each name a small glass pill gives the twist: "CZECH · 1894", "LUDHIANA · 1984", "KANPUR", "TATA · 1952".

**Camera**
- One continuous camera: it drifts and breathes on every frame. Country to country is a whip with real motion blur
  (sub-frames), never a crossfade. Every move eases in and out with a slight overshoot.
- The twist move: the camera first lands on the country the name *sounds* like (France, Monaco, Britain), the fill
  starts, then a whip throws the name across to India, where the real city lights up.
- Punch-in on each twist word: "Czech", "लुधियाना", "उल्टा", "भारत", "कानपुर", "Tata".

**Props and people**
- The renders below land next to the name on its word, with a contact shadow and a light wrap from the fill colour.
  None show a brand, logo or label: they stand for the product type only.
- Tomáš Baťa and King Louis-Philippe rise out of their place on the map (`MapPerson`): head-and-shoulders cut-out,
  bottom fading into the map, dark halo, a white name box (Hindi name, small English line), "AI illustration".

**Captions:** Hindi, word-highlight, 3 words at most, never over the name. Numbers as digits (1894, 1930s, 1952).

**Sound:** a Mixkit bed under the voice, ducked, running through the loop point. Sonniss SFX: a whoosh on every whip,
a low hit on each fill, a soft tick on each name, a record-scratch-style stop on "उल्टा" (from Sonniss, not a meme
sound). −14 LUFS.

**Rules that stay:** frame 0 = the payoff picture (India, "BATA", already moving), three words at most. Null once, in the
middle. Loop: the last frame runs into frame 0. 4K at 30 fps. No grain.

---

## 2. Beat map (script → screen; times are estimates until the VO is in)

| Time | VO | On screen | Assets |
|---|---|---|---|
| 0:00–0:07 | तुम जो Bata पहनते हो… हमारे लुधियाना का है। | Frame 0: India saffron, "BATA" on it, the shoes landing, already pushing in. On "Czech Republic" the saffron drains and a whip throws "BATA" to Czechia (red fill). On "Monte Carlo" a whip to Monaco (tiny, ringed in white), "MONTE CARLO" + sweater; on "लुधियाना" a whip back to Punjab, pin "LUDHIANA" | br01, br02 |
| 0:07–0:15 | 1894 में Czech के Zlín… विदेशी parent कंपनी के पास है। | Czechia red, pin "ZLÍN · 1894", Tomáš Baťa rises out of Zlín; a dotted route arcs to India, pin near Kolkata "1930s"; a small pie flips to "≈ आधा · विदेशी parent" | br03 |
| 0:15–0:20 | इसी तरह Maggi… Lifebuoy ब्रिटेन का। | The reference rhythm, 1.5 s each: Switzerland + "MAGGI" + noodles → USA + "COLGATE" + toothpaste → Britain + "LIFEBUOY" + soap | br04, br05, br06 |
| 0:20–0:25 | लेकिन खेल उल्टा भी है… देसी निकलते हैं। | Pull back to the world; every foreign fill drains to grey at once and India floods saffron. Null split screen (4–5 s): he flips his palm over | null_br_A |
| 0:25–0:31 | Louis Philippe का नाम फ़्रांस के एक राजा पर… भारत में ही शुरू हुआ। | France floods in flag colours, the king rises out of Paris with "LOUIS PHILIPPE" under him; on "भारत" the name and the shirt whip across to India, "1989" | br07, br08 |
| 0:31–0:36 | Monte Carlo नाम Monaco का… Oswal Woollen Mills का brand है। | Back to the Monaco ring, then a whip to Ludhiana, "OSWAL WOOLLEN MILLS · 1984", the sweater again | br02 |
| 0:36–0:40 | Red Tape सुनने में British… कानपुर में हैं। | A pin starts to drop on London with "RED TAPE", stops, whips to Kanpur (Uttar Pradesh fills), the leather shoes | br09 |
| 0:40–0:48 | और Lakmé?… Tata ने खड़ा किया था। | France again: an opera stage opens over Paris (curtains part), "LAKMÉ"; whip to Mumbai, lipstick lands, "TATA · 1952" | br10, br11 |
| 0:48–0:59 | तो अगली बार सिर्फ़ नाम देखकर… खुद को French समझता है। | India saffron with all four Indian names on it, the props around them; a slow push into India; the last frame is the frame before frame 0 | — |

Woodland is not in the VO any more, so it has no asset.

---

## 3. Image prompts (West Indies format)

**Style (in every prompt):** Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global
illumination, physically based materials, soft ray-traced shadows.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. Make 2–3 of each and keep the best.
**Save as:** the file name above each prompt, into `public/brands/img/`.
All on plain white so I can cut them out. **No text, logos, labels, brand names or brand colours** on any product. The two
people are historical figures shown as AI illustrations (tagged on screen).

---

**br01_canvas_shoes.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a pair of classic white canvas lace-up school shoes with white rubber soles and white laces, clean and new, one shoe placed slightly in front of the other and angled toward the camera",
  "camera": "three-quarter front view from slightly above, both shoes fully in frame with empty space around them",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (canvas weave, rubber texture, stitching)",
  "lighting": "soft warm studio light from the upper left, a cool fill from the right, a crisp rim light",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "logos", "brand names", "labels", "tags", "stripes", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**br02_wool_sweater.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a thick cable-knit woollen sweater in deep maroon, neatly folded in a square stack with the round neck and a cable pattern on top, soft and premium-looking",
  "camera": "three-quarter view from slightly above, the whole folded sweater fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (wool fibres, knit cables, soft fuzz on the edges)",
  "lighting": "soft warm studio light from the upper left, a cool fill from the right",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "logos", "brand names", "labels", "tags", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**br03_tomas_bata.png** (1:1)
```json
{
  "type": "head-and-shoulders portrait on a plain white background, for cutting out (AI illustration of a historical figure)",
  "subject": "Tomáš Baťa, the Czech shoemaker and industrialist (1876–1932), as he looks in 1920s photographs: a man in his late forties, short neatly combed dark hair with a side parting, a full dark moustache, a determined friendly expression, a dark three-piece suit with a white shirt and a dark tie",
  "camera": "head and shoulders, front view turned slightly to the left, eye level, the shoulders cut off cleanly at the bottom of the frame",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, natural skin detail",
  "lighting": "soft warm key light from the upper left, a cool fill from the right, a crisp rim light on the hair and shoulders",
  "background": "plain pure white, no shadow",
  "avoid": ["text", "logos", "shoes", "a factory", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**br04_noodles.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a white ceramic bowl of hot instant noodles in a light yellow masala broth, curly noodles lifted by a fork above the bowl, a few peas and diced carrots, a soft wisp of steam rising",
  "camera": "three-quarter view from slightly above, the whole bowl and fork fully in frame with empty space around them",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (glossy noodles, glazed ceramic, steam)",
  "lighting": "soft warm studio light from the upper left, a cool fill from the right",
  "background": "plain pure white, no table, no shadow",
  "avoid": ["text", "logos", "brand names", "packets", "packaging", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**br05_toothpaste.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a plain glossy white toothpaste tube with a pale grey cap lying at an angle, a white toothbrush beside it with a neat swirl of white paste on its bristles",
  "camera": "three-quarter view from slightly above, the tube and brush fully in frame with empty space around them",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (crimped tube end, bristles, glossy paste)",
  "lighting": "soft cool studio light from the upper left, a warm fill from the right",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "logos", "brand names", "labels", "red stripes or red packaging", "boxes", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**br06_soap.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a plain rounded bar of red soap with a little white lather on one corner and a few soap bubbles floating beside it",
  "camera": "three-quarter view from slightly above, the bar and bubbles fully in frame with empty space around them",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (slightly waxy soap, wet sheen, iridescent bubbles)",
  "lighting": "soft cool studio light from the upper left, a warm fill from the right",
  "background": "plain pure white, no dish, no floor, no shadow",
  "avoid": ["text", "logos", "brand names", "embossed letters on the soap", "wrappers", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**br07_king_louis_philippe.png** (1:1)
```json
{
  "type": "head-and-shoulders portrait on a plain white background, for cutting out (AI illustration of a historical figure)",
  "subject": "King Louis-Philippe I of France (reigned 1830–1848), as in his 1830s portraits: a man in his late fifties with a broad, rounded pear-shaped face, a high quiff of grey-brown hair, long side-whiskers, clean-shaven chin, a dark blue military coat with gold epaulettes and a high gold-embroidered collar, a red sash across the chest",
  "camera": "head and shoulders, front view turned slightly to the right, eye level, the shoulders cut off cleanly at the bottom of the frame",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, natural skin detail, rich fabric and gold thread",
  "lighting": "soft warm key light from the upper left, a cool fill from the right, a crisp rim light",
  "background": "plain pure white, no shadow",
  "avoid": ["text", "a crown on the head", "a throne", "a painting frame", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**br08_formal_shirt.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a premium men's formal shirt in crisp light sky-blue cotton, neatly folded as in a shop display with the collar standing up and the top button done, mother-of-pearl buttons",
  "camera": "three-quarter view from slightly above, the whole folded shirt fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (fine cotton weave, stitching, pearl buttons)",
  "lighting": "soft cool studio light from the upper left, a warm fill from the right",
  "background": "plain pure white, no box, no floor, no shadow",
  "avoid": ["text", "logos", "brand names", "labels", "tags", "packaging", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**br09_leather_shoes.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a pair of polished dark-brown leather men's formal derby shoes with brown laces, one shoe slightly in front of the other, angled toward the camera",
  "camera": "three-quarter front view from slightly above, both shoes fully in frame with empty space around them",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (leather grain, polish highlights, welt stitching)",
  "lighting": "soft warm studio light from the upper left, a cool fill from the right, a crisp rim light along the toes",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "logos", "brand names", "embossing", "labels", "a shoebox", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**br10_opera_stage.png** (16:9)
```json
{
  "type": "a scene, for placing over the map (the curtains will be animated opening)",
  "subject": "a grand 19th-century opera house stage seen straight on: heavy deep-red velvet curtains with gold fringe, half open, a gilded proscenium arch, warm footlights glowing along the front of the stage, the stage behind softly lit and empty",
  "camera": "straight front view, centred, the whole arch in frame",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (velvet folds, gold leaf, wood boards)",
  "lighting": "warm footlights from below, a soft spotlight from above centre, dark around the edges",
  "background": "plain pure white outside the proscenium arch",
  "avoid": ["text", "logos", "people", "an audience", "watermark"],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**br11_lipstick.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "an open lipstick in a sleek plain black-and-gold metal case, a rich classic red bullet, the cap lying beside it, and a small round compact mirror slightly open next to them",
  "camera": "three-quarter view from slightly above, all three fully in frame with empty space around them",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (creamy lipstick texture, brushed metal, mirror reflection)",
  "lighting": "soft warm studio light from the upper left, a cool fill from the right, a crisp rim light",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "logos", "brand names", "engraving", "labels", "packaging", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```
