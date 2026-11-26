# Tamil Nadu letters: edit plan, visual hook, SFX plan and image prompts

VO: `public/tamilnadu/audio/vo_115.wav` (73.7 s after the 1.15× speed-up). Times below are from its word timings.
**No music** (creator, Nov 26). SFX only, each one the real thing on screen, from open-source libraries.

---

## 1. The visual hook, word for word (0.0–7.4 s)

| Time | VO | Picture | Sound |
|---|---|---|---|
| frame 0 | — | The payoff: the campus straight from above, five buildings glowing gold reading "தமிழ்நாடு", the ring round the library, already pushing in. Text: "தமிழ்நாடு" only. | a soft sub hit |
| 0.00 | "Google Map" | A map-pin (drawn in code, no app branding) drops onto the campus and the camera whips UP through thin cloud | pin tap + rising wind |
| 0.76 | "भारत" | India from space, official boundary, India flashes saffron; the pin pulses on Thanjavur | wind peak |
| 1.42 | "एक University" | dive straight back down (0.8 s, motion blur) through cloud | wind falling |
| 2.40 | "ऊपर से देखो" | lands top-down on the campus, but now the five buildings are plain grey; a viewfinder frame snaps round the campus | lens focus servo + shutter |
| 3.92 | "पाँच Buildings" | five quick ticks: each building gets a white number 1–5 (0.15 s apart) | five pencil taps |
| 4.68 | "नहीं" | the numbers get one red slash | red marker strike |
| 5.18 | "असल में" | punch-in; the ground darkens | — |
| 5.64–7.04 | "एक राज्य का नाम लिखा हुआ दिखेगा" | the Tamil letters cut into each building one by one (த → மி → ழ் → நா → டு), the building turns gold, the Hindi reading types under each (त · मि · ऴ · ना · डु) | five chisel-on-stone strikes |
| 7.04 | "दिखेगा" | the ring closes round the library; "தமிழ்நாடு" big, "तमिलनाडु" under it | a resonant brass plate ring |

That is 10 changes before 7.4 s, 5 of them before 3 s, each on its word.

## 2. The rest (beat map)

| Time | VO | Picture | Sound |
|---|---|---|---|
| 7.9–10.6 | ये है तंजावुर में Tamil University का campus | pull out to Tamil Nadu (Thanjavur district fills), the Thanjavur doll lands in the district and wobbles, then dive back | wooden doll knock + wobble rattle |
| 10.8–14.6 | क़रीब 900 एकड़… सबसे बड़ा University campus | the campus boundary traces round (gold line), counter "≈ 900 एकड़"; "सबसे बड़ा" stamp | marker line draw; rubber stamp thud |
| 14.9–20.0 | 1981 में मुख्यमंत्री… MGR ने इसे शुरू किया | flip clock "1981"; MGR rises out of Thanjavur (AI illustration, name box) | flip-clock flaps; one camera flash |
| 20.4–29.1 | उनका सपना था… बीच में हो Library | the campus becomes a blueprint (white lines on blue paper, drawn in code on tn03): the five letter outlines draw themselves, the library circle is drawn with a compass | pencil on paper, ruler scrape, compass scratch |
| 29.2–31.7 | पर MGR 1987 में चले गए | clock flips to "1987", MGR fades to grey and out | clock flap; then a held silence |
| 31.8–36.8 | उन्होंने अपना सपना काग़ज़ पर देखा था… | Null split screen (bottom half); top half: the blueprint, still empty | paper rustle |
| 36.8–43.6 | उनके जाने के दो साल बाद… फिर मि और डु | clock runs 1987 → 1989; ழ rises out of the ground in 3D from its real footprint, then மி, then டு | clock flaps; concrete/construction rumble on each rise |
| 43.7–47.8 | आख़िरी दो 2016 में… क़रीब 35 साल बाद | clock races to "2016"; the last two rise; counter "35 साल"; the camera pulls straight up and the word reads | crane + construction, then the brass ring |
| 47.8–55.6 | ये सिर्फ़ दिखावे के अक्षर नहीं… | dive to ழ: palm-leaf manuscript "भाषा"; whip to மி: microscope "विज्ञान"; whip to டு: sapling "तमिल विकास" | palm-leaf rustle; glass clink; leaves |
| 55.7–59.9 | एक अक्षर ऐसा है, जिसकी आवाज़ हिंदी में है ही नहीं | ழ lifts off its building and fills the frame | everything drops out: silence |
| 59.9–65.8 | तमिल वाला ऴ… न र जैसा, न ल जैसा | a side-view mouth diagram (drawn in code) curls the tongue back; "र" and "ल" pop and get a red slash each | two marker strikes |
| 65.8–69.7 | इसी ऴ से… असली नाम, तमिऴ | ழ flies into "தமிழ்" / "तमिऴ" | one chisel strike |
| 69.7–73.7 | तो अगली बार… तंजावुर ज़रूर देखना | the pin drops on Thanjavur again, the camera dives to the campus and lands on the exact frame 0 | wind, pin tap → loops into frame 0 |

**Look:** the zoom levels use the Junagadh documentary map (black-and-white Sentinel-2, colour only on highlights, India's
official boundary). On the campus, Sentinel-2 cannot show buildings, so the campus is drawn from OpenStreetMap: dark
ground, roads and tree canopy as texture, the five letter buildings from their real footprints (3D when they rise).
Credit: "© OpenStreetMap contributors (ODbL)". No Google Maps, Esri or app imagery anywhere; the map-pin is our own.

**SFX sources:** Sonniss GDC bundles (royalty-free), Freesound (CC0 only) and Kenney (CC0). I pick each sound for its
moment (no stock whoosh/pop packs) and list every file and its source in the upload kit.

---

## 3. Image prompts (West Indies format)

**Style (in every prompt):** Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global
illumination, physically based materials, soft ray-traced shadows.
**Size:** Gemini Nano Banana Pro at 4K, or ChatGPT at its largest size. Make 2–3 of each and keep the best.
**Save as:** the file name above each prompt, into `public/tamilnadu/img/`.
All on plain white so I can cut them out. No readable text, logos or watermarks. MGR is an AI illustration of a
historical figure (tagged on screen).

---

**tn01_mgr.png** (1:1)
```json
{
  "type": "head-and-shoulders portrait on a plain white background, for cutting out (AI illustration of a historical figure)",
  "subject": "M. G. Ramachandran (MGR), the Tamil film star and Chief Minister of Tamil Nadu, as he looked in the early 1980s: a man in his sixties with a warm, gentle smile, his signature white fur cap (a karakul-style cap) and dark tinted sunglasses, a crisp white shirt, a fair complexion, dignified and friendly",
  "camera": "head and shoulders, front view turned slightly to the left, eye level, the shoulders cut off cleanly at the bottom of the frame",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, natural skin detail",
  "lighting": "soft warm key light from the upper left, a cool fill from the right, a crisp rim light on the cap and shoulders",
  "background": "plain pure white, no shadow",
  "avoid": ["text", "logos", "party symbols", "flags", "a crowd", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**tn02_thanjavur_doll.png** (9:16)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a traditional Thanjavur dancing doll (Thalaiyatti Bommai) made of painted papier-mâché and terracotta: a smiling woman figure in a bright red, green and gold Bharatanatyam-style costume with a pleated fan skirt, gold jewellery, hands in a graceful dance pose, a rounded weighted base",
  "camera": "full figure, front view at eye level, the whole doll fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (glossy hand-painted lacquer, gold leaf, small brush marks)",
  "lighting": "soft warm studio light from the upper left, a cool fill from the right, a crisp rim light",
  "background": "plain pure white, no floor, no shadow",
  "avoid": ["text", "logos", "a shelf", "other dolls", "watermark"],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**tn03_blueprint_sheet.png** (9:16)
```json
{
  "type": "single prop on a plain white background, for cutting out (I draw the plan onto it in code)",
  "subject": "a large old architect's blueprint sheet, deep Prussian-blue paper with a faint fine grid, completely EMPTY (no drawings, no writing), slightly curled at the corners, soft creases from being rolled, worn edges",
  "camera": "straight top-down, the whole sheet fully in frame with a little empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real paper texture (fibres, creases, slight fading)",
  "lighting": "soft even light from above with a gentle warm falloff toward the bottom",
  "background": "plain pure white, no table, no shadow",
  "avoid": ["text", "drawings", "plans", "letters", "numbers", "pencils", "tools", "watermark"],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

---

**tn04_palm_leaf_manuscript.png** (16:9)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "an old South Indian palm-leaf manuscript (olai chuvadi): a bundle of long narrow dried palm leaves, golden brown, held between two carved wooden boards with a cord through the holes, the top leaf fanned open and covered in fine dark incised lines of script, too small to read",
  "camera": "three-quarter view from slightly above, the whole bundle fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (leaf fibres, cracked edges, worn wood, cotton cord)",
  "lighting": "soft warm studio light from the upper left, a cool fill from the right",
  "background": "plain pure white, no table, no shadow",
  "avoid": ["readable letters", "Latin text", "logos", "a hand", "watermark"],
  "aspect_ratio": "16:9",
  "output": "largest size available (4K if possible)"
}
```

---

**tn05_microscope.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a classic laboratory microscope in white enamel and brushed steel, with a glass slide on the stage and a small glass flask of clear blue liquid beside it",
  "camera": "three-quarter view from slightly above, both fully in frame with empty space around them",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (enamel, glass, steel knurling)",
  "lighting": "soft cool studio light from the upper left, a warm fill from the right",
  "background": "plain pure white, no table, no shadow",
  "avoid": ["text", "logos", "brand names", "labels", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**tn06_sapling.png** (1:1)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a young green sapling with fresh bright leaves growing out of a small round terracotta pot, a little dark soil, a drop of water on one leaf",
  "camera": "three-quarter view at eye level, the pot and plant fully in frame with empty space around them",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (leaf veins, clay texture, moist soil)",
  "lighting": "soft warm sunlight from the upper left, a cool fill from the right",
  "background": "plain pure white, no table, no shadow",
  "avoid": ["text", "logos", "watermark"],
  "aspect_ratio": "1:1",
  "output": "largest size available (4K if possible)"
}
```

---

**tn07_tower_crane.png** (9:16)
```json
{
  "type": "single prop on a plain white background, for cutting out",
  "subject": "a yellow construction tower crane, a tall lattice mast with a long horizontal jib and a counterweight, a hook hanging on a steel cable",
  "camera": "full crane, side view from slightly below, the whole crane fully in frame with empty space around it",
  "style": "Unreal Engine 5 cinematic render, photoreal with a light stylised touch, Lumen global illumination, physically based materials, soft ray-traced shadows, real surface detail (painted steel, rivets, cables)",
  "lighting": "warm late-afternoon sun from the left, a cool fill from the right",
  "background": "plain pure white, no ground, no shadow",
  "avoid": ["text", "logos", "brand names", "people", "buildings", "watermark"],
  "aspect_ratio": "9:16",
  "output": "largest size available (4K if possible)"
}
```

Drawn in code (no image needed): the five letter buildings (from OpenStreetMap footprints, 3D when they rise), the
map-pin, the viewfinder, the numbers and red slashes, the blueprint lines, the flip clock, the ring, the mouth diagram,
the Tamil letters (Noto Sans Tamil, OFL) and their Hindi readings.
