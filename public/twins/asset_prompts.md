# Twin countries: asset prompts

Script confirmed: `public/twins/script_hindi.txt` (creator's version, about 55–60 s).
Editing style: our GeoGlobe look, as in Karl Bushby and the reference. A continuous satellite globe and map that is always moving, country shapes that glow, lift off the map, flip, slide and overlap, a bold teal-and-gold grade with highlighted colours, and the props below popping in on their exact words.
All-new assets for this video. Nothing is reused from earlier videos. Null's clip has its own file: `public/twins/omni_prompts.md`.

## 0. Beat map (script → screen)

| Script | On screen | Assets |
|---|---|---|
| आज तक हज़ार Maps देखे होंगे, पर ये किसी ने Notice नहीं करवाया। | Frame 0: satellite globe spinning, Italy and Vietnam glowing side by side, only "जुड़वा देश?" in big text. A magnifying glass sweeps across the map on "Notice" | A1 |
| दुनिया में कुछ देश बिल्कुल जुड़वा हैं। | Whip across the globe; four pairs flash for a split second each (code) | — |
| पहला: Thailand और Myanmar। Thailand को बस पलट दो… | Big "1" (code), dive to South-East Asia, Thailand lifts off the map and flips like a card | — |
| सामने खड़ा है उसका पड़ोसी, Myanmar। Same to same, जैसे एक ही साँचे से निकले हों। | The flipped Thailand lands beside Myanmar; a brass stamp presses the shape twice: "Same to same" (code text) | A2 |
| दूसरा: Africa में, Benin और Togo। एक साथ कंधे से कंधा मिलाकर खड़े हैं। | Big "2", fast pan to West Africa; the two strips light up, get cartoon eyes and arms around each other's shoulders (code) | — |
| दोनों लंबे, दोनों पतले। और सुनो, Togo का पूरा समंदर किनारा सिर्फ 56 KM का है। | Both stretch tall; zoom into Togo's coast, a measuring line and a "56 KM" counter (code) | — |
| तीसरा: सबसे Famous, Italy का Boot। | Big "3", fly to Italy; a glossy boot fades in over Italy's outline | A3 |
| पर हज़ारों KM दूर, Vietnam ने भी वही Boot पहन रखा है। | Long whip east; the same boot snaps onto Vietnam's outline | A3 |
| Italy ने Boot के आगे Football रख रखी है… और Italy का Boot उस Football को लात मार रहा है। | Back to Italy: a football pops onto Sicily, the boot kicks, the ball wobbles, kick SFX | A3, A4 |
| और असली जुड़वा तो अब आएँगे। Norway और Chile। | Big "4", drumroll; pull out to the full globe | — |
| दुनिया की दो सबसे लंबी मिर्ची। | Norway turns into a green chilli, Chile into a red chilli, both glossy | A5, A6 |
| एक बिल्कुल ऊपर, एक बिल्कुल नीचे… जैसे बीच में आईना रख दिया हो। | A glowing mirror line sweeps along the equator; Norway's shape reflects down onto Chile (code) | — |
| तो सोचो, आपकी Copy कौन है? ये Video उसी को भेजो। | Split screen: top half, two identical twin figurines pop up over the mirror map; bottom half, Null (Omni clip) | A7 + Null |

---

## 1. Read this first

**1. GPT never draws a map or a country.** Every map and every country shape comes from Sentinel-2 satellite imagery (EOX, CC BY 4.0, credited) and Natural Earth borders. India, if it appears on the globe, uses its official boundary.
Numbers, labels, "Same to same", the cartoon eyes and arms, the measuring line, the mirror line and every other bit of text are drawn in code.

**2. No text, numbers, letters, flags or logos in any GPT image.**

**3. One look: "Glossy 3D miniature",** the same premium diorama look as our other videos.
Soft studio light from the top-left, smooth materials, no outlines.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the start of the chat.
- Sizes: **1024×1024** for props, **1024×1536** for tall items.
- `PNG-T` = real transparent background. If you get a checkerboard or white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- Make 2–3 versions of each and keep the best. Name the files exactly as listed. They go in `public/twins/img/`.

### Style Lock (paste once at the top of the chat)
```
You are generating production assets for a premium animated map documentary
(vertical 9:16 Short, satellite-map look, like a high-end After Effects +
GeoLayers geography video). The story is about pairs of countries that look
like twins on the world map. Every prop is a premium glossy 3D miniature,
like a high-end diorama or tabletop model: soft studio light from the
top-left, smooth realistic materials, subtle reflections, no outlines, no
cartoon line work. No text, no letters, no numbers, no flags, no logos, no
watermark, no signature, no frame or border. When I say PNG-T, the
background must be fully transparent (real alpha channel). Centre the
subject with generous empty padding. Do not add glow or drop shadows; those
are added later in the video editor.
```

---

## 2. GPT asset prompts (7 images)

**A1. `magnifying_glass.png`** (PNG-T, 1024×1024)
```
A classic magnifying glass with a polished brass rim and a dark wooden handle, seen from the front at a slight angle, handle pointing to the bottom right. The lens is clear glass with a soft reflection highlight on the top left. Glossy 3D miniature. PNG-T.
```

**A2. `brass_stamp.png`** (PNG-T, 1024×1024)
```
A vintage brass hand stamp, like an old seal or mould, standing upright: a rounded dark wooden handle on top and a wide, flat, blank brass base at the bottom (the stamping face is completely plain, no design). Seen from the front at a slight three-quarter angle. Polished, warm metal reflections. Glossy 3D miniature. PNG-T.
```

**A3. `boot.png`** (PNG-T, 1024×1536)
```
A single tall classic leather riding boot, rich dark brown leather with a subtle shine, seen exactly from the side. The shaft reaches up to the knee, the heel is low, and the toe points to the LEFT. Clean, simple shape, no laces, no buckles, no logo. Glossy 3D miniature. PNG-T.
```

**A4. `football.png`** (PNG-T, 1024×1024)
```
A classic football (soccer ball) with the traditional black and white pentagon and hexagon pattern, perfectly round, seen straight on. Slightly glossy leather surface with a soft highlight on the top left. No logo, no brand, no text. Glossy 3D miniature. PNG-T.
```

**A5. `chilli_green.png`** (PNG-T, 1024×1536)
```
One long, thin, fresh green chilli (Indian hari mirchi), standing vertically: the green stem at the TOP, the body long and slender with a gentle curve, the pointed tip at the BOTTOM. Bright fresh green, glossy skin with soft reflections. Glossy 3D miniature. PNG-T.
```

**A6. `chilli_red.png`** (PNG-T, 1024×1536)
```
One long, thin, ripe red chilli, standing vertically: the green stem at the TOP, the body long and slender with a gentle curve, the pointed tip at the BOTTOM. Deep bright red, glossy skin with soft reflections. Same size and style as a matching green chilli. Glossy 3D miniature. PNG-T.
```

**A7. `twins_friends.png`** (PNG-T, 1024×1024)
```
Two young Indian friends standing side by side as cheerful glossy 3D miniature figurines, dressed exactly alike in the same outfit (white T-shirt, blue jeans, white sneakers) and striking the exact same pose: each with one arm around the other's shoulder and the other hand giving a thumbs up. They look like identical twins, friendly smiles. Full body, front view. Glossy 3D miniature, not photoreal. PNG-T.
```

Send these 7 in one zip along with the VO and Null's Omni clip.

Credits on screen: "Satellite: Sentinel-2 cloudless by EOX (CC BY 4.0) · Borders: Natural Earth · Props and host: AI illustration".
