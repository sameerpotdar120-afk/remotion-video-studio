# Kalpasar, the 60 KM wall in the sea: asset prompts

Script confirmed: `public/kalpasar/script_hindi.txt` (creator's version, about 110 s).
Editing style: our GeoGlobe look, like Twin Countries and Karl Bushby. A satellite globe and map that is always moving, glowing rivers, the wall drawing across the gulf, a lake filling, route lines and counters, a bold teal-and-gold grade, and the props below popping in on their exact words.
All-new assets for this video. Nothing is reused from earlier videos. Null's clip has its own file: `public/kalpasar/omni_prompts.md`.

## 0. Beat map (script → screen)

| Script | On screen | Assets |
|---|---|---|
| शायद आपने कभी सुना भी नहीं… 60 KM लंबी दीवार… क्यों? | Frame 0: India (official boundary) glowing on the satellite globe, diving to Gujarat, only "60 KM दीवार?"; a glowing wall slams across the gulf | — |
| सोचो, वो किसान जो Saurashtra में रहता है। | Saurashtra lights up; the farmer pops up standing on it | A1 |
| बारिश कम, कुएँ सूखे, ज़मीन में खारा पानी… खेत प्यासे | Saurashtra cracks into dry earth with a heat shimmer; a dry well pops up; salt crust spreads (code) | A2, A3 |
| पानी ज़्यादा दूर नहीं… Gulf of Khambhat… नदियाँ… खारे समंदर में बहा देती हैं | Camera swings east across the gulf; glowing blue rivers flow in and turn salty green in the sea (code); a water splash where they meet | D1 |
| तभी 50 साल पहले एक Idea आया… समंदर को ही रोक दें? | Old sepia map grade, a lightbulb pops over the farmer, a pencil line sketches across the gulf (code) | A4 |
| यहीं से पैदा हुआ Kalpasar। Bhavnagar से Bharuch तक… 60 KM | Pins on Bhavnagar and Bharuch, the wall builds across the gulf with a "60 KM" counter, "KALPASAR" title (code) | — |
| भरती आएगी तो Gates बंद, उतरेगी तो Gates खुलेंगे… | The tide rises and falls against the wall; a close-up of the gates opening with water rushing out | A5, D1 |
| 1,600 वर्ग KM की मीठे पानी की झील… Saurashtra के 9 ज़िलों तक | The lake fills bright blue with a counter; canals run out to 9 glowing districts; the farmer, now happy, in a green field | A6 |
| ऊपर से 16 Lane का Highway और Railway… 356 KM से 177 KM | Tilt onto the dam top with the highway and train; the old route goes around the gulf, the new one cuts straight across (code) | A7 |
| सुनने में Perfect है ना? पर समंदर… हार नहीं मानता। | Record-scratch stop, the grade drains to stormy blue, a big wave rises | D2 |
| ज्वार 10 मीटर से ऊपर… ज़मीन पत्थर नहीं, दलदल है | A tide ruler surges past "10 M" (code); a seabed cut-away with a pillar sinking into the mud | A8 |
| 50 साल हो गए… File तो मोटी हो गई… एक ईंट भी नहीं लगी | A huge dusty file stack slams down; a single brick sits alone on the shore | A9, A10 |
| Cost… अब 1 लाख 33 हज़ार करोड़ | A ₹ counter spins up (code) | — |
| नाम है Kalpasar… इच्छा पूरी करने वाली झील | "KALPASAR" in gold over a dream lake (code) | — |
| वो किसान आज भी इंतज़ार में है… ये बनेगा, या बस कल्पना ही रह जाएगा? | The farmer sits on the shore watching the sea; the lake flickers into a dotted outline. Then split screen: map on top, Null below | A11 + Null |
| आपको क्या लगता है? हाँ या ना? | "हाँ / ना" buttons (code), Null asks | Null |

---

## 1. Read this first

**1. GPT never draws a map.** Every map comes from Sentinel-2 satellite imagery (EOX, CC BY 4.0, credited) and Natural Earth borders. India always appears with its official boundary.
The wall, rivers, lake, routes, pins, counters, labels and the tide ruler are drawn in code.

**2. No text, numbers, letters, flags or logos in any GPT image.**

**3. One look: "Glossy 3D miniature",** the same premium diorama look as our other videos.
Soft studio light from the top-left, smooth materials, no outlines. Make set A in one chat, so the farmer stays identical.

**4. The farmer:** an imagined, ordinary Saurashtra farmer, not a real person. Show him with dignity and warmth, as one of "हमारे किसान भाई": hardworking, patient, never as a figure of pity or a joke.

### How to generate: 4K (we render every video in 4K 60 fps now)
- **Best: Gemini, Nano Banana Pro image model, resolution set to 4K.** Pick the aspect ratio listed on each asset: **9:16** for tall items (2160×3840), **16:9** for wide items (3840×2160), **1:1** for props.
- **If you use ChatGPT instead:** ask for the largest size it offers, then send it as is. ChatGPT tops out well below 4K, so I upscale those in code, and they come out a little softer than the Gemini ones.
- One asset per message. Paste the **Style Lock** once at the start of the chat, and make all the farmer images in that same chat so he stays identical.
- `WHITE` = plain flat white background (#FFFFFF), no floor, no shadow on the background. I cut every object out myself, at full 4K, so you don't need transparency. (If your tool gives a real transparent PNG, that's fine too.)
- `BLACK` = pure flat black background (#000000), for the water effects.
- Download the original full-size file, not a screenshot or the chat preview, so the 4K pixels survive.
- Make 2–3 versions of each and keep the best. Name the files exactly as listed. They go in `public/kalpasar/img/`.

### Style Lock (paste once at the top of the chat)
```
You are generating production assets for a premium animated map documentary
(vertical 9:16 Short, satellite-map look, like a high-end After Effects +
GeoLayers geography video). The story is about Kalpasar, a planned 60 km
wall across the sea in Gujarat, India, that would turn part of the sea into
a freshwater lake for drought-hit farmers. Every prop is a premium glossy 3D
miniature, like a high-end diorama or tabletop model: soft studio light from
the top-left, smooth realistic materials, subtle reflections, no outlines,
no cartoon line work. The recurring character is a stylised glossy 3D
miniature figurine (not photoreal) of a Gujarati farmer from Saurashtra:
a lean, weathered man in his late 40s with a short grey moustache, a
white kediyu (traditional short Gujarati jacket), white dhoti, a bright red
cotton turban (pagdi), and simple leather sandals. He is dignified and
hardworking. No text, no letters, no numbers, no flags, no logos, no
watermark, no signature, no frame or border. When I say WHITE, the
background must be plain flat white #FFFFFF with no floor and no shadow on
it. When I say BLACK, the background must be pure flat black #000000. Render in ultra-high
detail at 4K resolution: crisp edges, fine material textures (fabric
weave, stone, concrete, water droplets), no blur, no noise, no compression
artefacts. Centre the subject with generous empty padding. Do not add glow
or drop shadows; those are added later in the video editor.
```

---

## 2. GPT asset prompts (11 images + 2 effects)

### A. The farmer and his props (same chat, so he stays identical)

**A1. `farmer_stand.png`** (WHITE, 9:16, 4K)
```
The farmer standing full body, front three-quarter view facing slightly left, one hand shading his eyes as he looks into the distance, the other holding a simple wooden walking stick. A calm, patient expression. Full body from the turban to the sandals. WHITE.
```

**A2. `farmer_worried.png`** (WHITE, 9:16, 4K)
```
The same farmer, full body, crouching on one knee and touching the ground with one hand, looking down with a quietly worried expression, as if feeling dry, cracked soil. Side three-quarter view facing right. WHITE.
```

**A3. `well_dry.png`** (WHITE, 1:1, 4K)
```
A small traditional Indian village well: a round, low stone wall with an old wooden frame and pulley on top and a rope with an empty metal bucket. Looking slightly down into it, the well is dry, with a cracked, dusty bottom. Glossy 3D miniature. WHITE.
```

**A4. `lightbulb.png`** (WHITE, 1:1, 4K)
```
A classic glowing light bulb, a warm golden filament lit inside clear glass with a brass screw base, seen straight on. Bright and cheerful, symbolising an idea. Glossy 3D miniature. WHITE.
```

**A6. `farmer_happy.png`** (WHITE, 9:16, 4K)
```
The same farmer, full body, standing in a small patch of lush green crop with a narrow channel of clear blue water running past his feet. He smiles warmly with both arms slightly open, relieved and happy. Front three-quarter view facing left. WHITE.
```

**A11. `farmer_waiting.png`** (WHITE, 16:9, 4K)
```
The same farmer sitting on a large flat rock by the shore, seen from behind and slightly to the side, his walking stick resting across his knees, quietly looking out at a calm sea, as if waiting for something. A small patch of rocky shore under him and gentle waves at the front. Wide, calm, a little hopeful. WHITE.
```

### B. The wall and the sea

**A5. `dam_gates.png`** (WHITE, 16:9, 4K)
```
A wide section of a massive modern sea dam seen from the sea side at a low three-quarter angle: a long concrete wall with a row of tall steel sluice gates. The middle gates are raised and white foaming water rushes out through them into the sea; the gates at the ends are closed. Dark blue sea water in front. Glossy 3D miniature, like a large engineering model. WHITE.
```

**A7. `dam_top_road.png`** (WHITE, 16:9, 4K)
```
A high three-quarter aerial view of a long, wide sea dam stretching diagonally from the bottom left into the distance at the top right. On top of the dam: a very wide multi-lane highway with many small cars and trucks, and beside it a railway line with a long modern passenger train. Sea water on both sides, darker blue on one side and lighter turquoise on the other. Glossy 3D miniature diorama. No signs, no text. WHITE.
```

**A8. `seabed_cutaway.png`** (WHITE, 9:16, 4K)
```
A vertical cross-section cut-away diorama: the top third is clear blue sea water, below it a thick layer of soft, wet grey-brown mud and silt, and at the bottom harder rock layers. A single tall concrete pillar stands in the middle, tilting slightly and sinking into the soft mud, with ripples of mud around its base. Clean educational model look. Glossy 3D miniature. WHITE.
```

**A9. `brick.png`** (WHITE, 1:1, 4K)
```
A single classic red clay brick, slightly weathered at the edges, seen at a three-quarter angle, resting alone. Glossy 3D miniature. WHITE.
```

**A10. `file_stack.png`** (WHITE, 9:16, 4K)
```
A very tall, wobbly stack of thick old government office files and folders in beige and faded khaki, tied with red cloth ribbons, dusty, with papers sticking out at the edges. Front three-quarter view. Glossy 3D miniature. No writing on the files. WHITE.
```

### D. Effects (pure black background, added with screen blending)

**D1. `fx_splash.png`** (BLACK, 16:9, 4K)
```
A wide burst of white sea foam and water splash flying sideways, bright white and pale aqua droplets, realistic, on a pure flat black #000000 background. BLACK.
```

**D2. `fx_wave.png`** (BLACK, 9:16, 4K)
```
A single huge tall ocean wave rising and about to break, dark teal water with bright white foam on the crest, dramatic, filling most of the frame, on a pure flat black #000000 background. BLACK.
```

Send these 13 in one zip along with the VO and Null's Omni clip.

Credits on screen: "Satellite: Sentinel-2 cloudless by EOX (CC BY 4.0) · Borders: Natural Earth · Props, farmer and host: AI illustration".
