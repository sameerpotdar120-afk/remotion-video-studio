# शक्कर का सफ़र (the journey of the word sugar): asset prompts

Script confirmed: `public/sugar/script_hindi.txt` (159 words, about 57–61 s).
All-new assets for this video. Nothing is reused from earlier videos.

## 0. Beat map (script → screen)

| Script | On screen | Assets |
|---|---|---|
| चीनी का नाम चीन पर क्यों… मिश्री का, मिस्र पर? | Frame 0: bold text "चीनी = चीन? मिश्री = मिस्र?" over the sugar bowl; China and Egypt glow on the map behind | A1 |
| जवाब छुपा है एक शब्द के सफ़र में… भारत से | Fast pull-out to the satellite globe, India lights up, sugar sparkle sweeps across | G1 |
| 1500 साल पहले… गन्ने के रस को जमाकर… दाने | Dive onto India: sugarcane → boiling pot of juice with steam → golden crystals | A2, A3, A4, G2 |
| शर्करा… छोटे-छोटे कंकड़ | Tag "शर्करा" (code); a handful of pebbles beside the crystals, "=" between them | A5 |
| Persia… शकर। Arab… सुक्कर | A glowing route India → Persia (camel caravan) → Arabia; tags pop on arrival | B1, B2 |
| Arab इसे Europe ले गए… Zucchero, Sucre… Sugar | A dhow sails the route into the Mediterranean; routes fan out; tags ZUCCHERO, SUCRE, SUGAR; a sugar loaf on England | B3, B4 |
| यानी Sugar असल में हमारा ही शब्द है | Snap back to India; stamp "SUGAR = शर्करा" (code) | — |
| बड़े टुकड़ों को… खण्ड | A big rock-sugar lump drops in; tag "खण्ड" | C1 |
| Persia में… कंद… कलाकंद और गुलकंद | Route to Persia, tag "कंद"; plates of kalakand and gulkand pop in | C2, C3 |
| अंग्रेज़ों तक… Candy | A long route to England; rock candy on a stick; tag "CANDY" | C4 |
| Egypt… Crystals… मिश्री | Zoom to Egypt (a pyramid miniature marks it); misri crystals on thread; route Egypt → India; tag "मिस्र → मिश्री" | D1, D2 |
| China से आई एकदम सफ़ेद शक्कर… चीनी | A junk ship sails China → India; white sugar heap; tag "चीन → चीनी" | E1, E2 |
| भारत से निकली… घर लौट आई | Pull-out: every route on the map at once, all tags fly back to India, sparkle burst | G1 |
| तुम्हारे घर में इसे क्या कहते हैं? | The steel sugar dabba; question card with three buttons (code) | F1 |

---

## 1. Read this first

**1. GPT never draws a map.** I build every map from Sentinel-2 satellite imagery (EOX, CC BY 4.0, credited) and Natural Earth borders.
I also draw every route line and every name tag (शर्करा, शकर, सुक्कर, ZUCCHERO, SUCRE, SUGAR, खण्ड, कंद, CANDY, मिश्री, चीनी) in code.

**2. No text, numbers, letters, flags or logos in any GPT image.**

**3. No real people.** The only figures are generic traders seen small, and they don't resemble any real person.

**4. One look: "Glossy 3D miniature".** Every prop is a premium glossy 3D miniature, like a high-end diorama or tabletop model, with soft studio light from the top-left, smooth materials and no outlines. Make each set in the same chat.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the start of each chat.
- Sizes: **1024×1024** for props, **1536×1024** for wide items, **1024×1536** for tall items.
- `PNG-T` = real transparent background. If you get a checkerboard or white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000), for sparkle and steam effects.
- Make 2–3 versions of each and keep the best. Name files exactly as listed. They go in `public/sugar/img/`.

### Style Lock (paste once at the top of each chat)
```
You are generating production assets for a premium animated map documentary
(vertical 9:16 Short, satellite-map look, like a high-end After Effects +
GeoLayers geography video). The story is the journey of sugar and its name:
India first turned sugarcane juice into crystals about 1,500 years ago, and the
sugar (and its name) travelled to Persia, Arabia, Europe, Egypt and China and
came back to India with new names. Every prop is a premium glossy 3D miniature,
like a high-end diorama or tabletop model: soft studio light from the
top-left, smooth realistic materials, appetising food textures, subtle
reflections, no outlines, no cartoon line work. Any human figure is a tiny
generic stylised figurine that does not resemble any real person. No text, no
letters, no numbers, no flags, no logos, no watermark, no signature, no frame
or border. When I say PNG-T, the background must be fully transparent (real
alpha channel). When I say BLACK, the background must be pure flat black
#000000. Centre the subject with generous empty padding. Do not add glow or
drop shadows; those are added later in the video editor.
```

---

## 2. GPT asset prompts

### A. India: where it starts (same chat)

#### A1 · `sugar_bowl.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small round brass bowl filled to the top with
sparkling white sugar, a little heap rising above the rim, a small brass spoon
resting inside with a few grains on it, three-quarter view from slightly
above. PNG-T, transparent background.
```

#### A2 · `sugarcane.png` (1024×1536, PNG-T)
```
A glossy 3D miniature of a bundle of five fresh sugarcane stalks standing
upright and tied with a twine rope near the bottom, green-yellow segmented
stalks with visible joints, a few long green leaves at the top, one stalk cut
at an angle showing the pale juicy inside. PNG-T, transparent background.
```

#### A3 · `juice_pot.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a large ancient Indian clay pot sitting on a small
stone hearth with glowing wood fire under it, filled with thick bubbling
golden-brown sugarcane juice, a wooden stirring paddle leaning in it. Warm,
earthy, traditional. No steam (added later). PNG-T, transparent background.
```

#### A4 · `sugar_crystals_raw.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small heap of coarse golden-brown raw sugar
crystals, chunky irregular grains like tiny amber pebbles, catching the light,
a few loose grains around the heap. PNG-T, transparent background.
```

#### A5 · `pebbles.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small handful of smooth river pebbles in warm grey
and sandy tones, about the same size and shape as coarse sugar crystals,
grouped in a loose little pile. PNG-T, transparent background.
```

### B. The road west (same chat)

#### B1 · `camel_caravan.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a small trade caravan walking to the right: three
camels in a line, each carrying jute sacks and woven bundles, one tiny generic
trader in a long robe and turban leading the first camel by a rope. Side
view, slightly from above, standing on nothing. PNG-T, transparent background.
```

#### B2 · `sugar_sack.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a single bulging jute trade sack tied at the top with
rope, the top slightly open with golden-brown sugar crystals spilling out onto
the ground in a small heap. No markings or print on the sack. PNG-T,
transparent background.
```

#### B3 · `dhow_ship.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a traditional Arab dhow trading ship sailing to the
right: a wooden hull, one large triangular cream lateen sail, cargo sacks and
wooden crates on deck, small gentle waves at the waterline fading out softly.
Side view. PNG-T, transparent background.
```

#### B4 · `sugar_loaf.png` (1024×1536, PNG-T)
```
A glossy 3D miniature of a traditional European sugar loaf: a tall white cone
of hard sugar, half wrapped in deep blue paper at the bottom, standing on a
small wooden board with a brass sugar nipper (cutting tool) beside it.
PNG-T, transparent background.
```

### C. खण्ड → कंद → Candy (same chat)

#### C1 · `sugar_lump_big.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of one big rough chunk of amber-brown rock sugar, like a
large crystal stone, with glossy facets and a few small chips broken off
beside it. PNG-T, transparent background.
```

#### C2 · `kalakand.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small round brass plate with neat square pieces of
kalakand, the Indian milk sweet: soft grainy creamy-white pieces, topped with
thin slivers of green pistachio and a touch of silver leaf. PNG-T,
transparent background.
```

#### C3 · `gulkand.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small glass jar of gulkand, the Indian rose-petal
preserve: deep red-pink glossy rose petal jam, the lid off and resting beside
it, a few fresh pink rose petals scattered around. No label. PNG-T,
transparent background.
```

#### C4 · `rock_candy.png` (1024×1536, PNG-T)
```
A glossy 3D miniature of old-fashioned rock candy: two wooden sticks standing
upright, each covered in large clear-amber sugar crystals clustered along the
stick, sparkling. PNG-T, transparent background.
```

### D. Egypt → मिश्री (same chat)

#### D1 · `misri.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of misri, Indian crystal sugar: a cluster of large
clear pale-yellow sugar crystals grown along a cotton thread, the thread ends
hanging loose, crystals glassy and translucent, catching the light. PNG-T,
transparent background.
```

#### D2 · `pyramid.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of one ancient Egyptian pyramid on a small patch of
golden sand, smooth sandstone blocks, warm late-afternoon light, a small
palm tree beside it. PNG-T, transparent background.
```

### E. China → चीनी (same chat)

#### E1 · `junk_ship.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a traditional Chinese junk sailing ship sailing to
the left: a wooden hull, three red-brown ribbed batten sails, cargo crates on
deck, small gentle waves at the waterline fading out softly. Side view. No
writing anywhere. PNG-T, transparent background.
```

#### E2 · `white_sugar.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small heap of perfectly pure, bright white
granulated sugar with three neat white sugar cubes resting against it,
sparkling, clean and refined. PNG-T, transparent background.
```

### F. The question (same chat as A)

#### F1 · `sugar_dabba.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a typical Indian kitchen stainless-steel container
(dabba) with its lid tilted open, filled with white sugar, a small steel spoon
sticking out, sitting on a tiny wooden kitchen shelf edge. No label. PNG-T,
transparent background.
```

### G. Effects (same chat)

#### G1 · `overlay_sugar_sparkle.png` (1536×1024, BLACK)
```
Glittering grains of sugar flying and tumbling through the air in a wide
diagonal stream from lower left to upper right, tiny bright white and golden
specks with soft sparkle highlights, some grains in focus and some softly out
of focus. On a pure flat black #000000 background. BLACK.
```

#### G2 · `overlay_steam.png` (1024×1536, BLACK)
```
Soft white steam rising and curling upward in gentle wisps from the bottom
centre, thin and wispy, fading out near the top. On a pure flat black
#000000 background. BLACK.
```

---

**Total:** 20 images (17 props + 1 landmark + 2 effects). Put them in one zip.

**Done in code:** all text and name tags, the glowing routes, the "SUGAR = शर्करा" stamp, the question card with three buttons, the map labels (Persia (ईरान), Arab, Europe, Egypt, China) and the subtitles.
