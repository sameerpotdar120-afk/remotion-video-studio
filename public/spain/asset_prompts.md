# Spain: 5 Hidden Neighbours (Hindi): Asset Prompts and Asset Plan

Style: our continuous map edit. One camera over real satellite maps with no cuts: quick keyframed dives and pull-outs, 2–4 s holds with a slow push-in, and a gentle 3D sway (roll) on every move, as in the reference. Countries light up in colour, borders glow and draw on, a neighbour counter ticks 2 → 5, and glossy 3D props pop onto the map.

Script: `script_hindi.txt` (confirmed). Every asset below is new.

---

## 0. Beat map (script → screen)

| Script | On screen | Assets |
|---|---|---|
| तुमने पढ़ा है… बस दो पड़ोसी… क्विज़ तुम हार गए। पाँच हैं… नक्शे ने छुपा लिए। | Dive from Europe onto Spain. An old classroom wall map shows Spain with only France and Portugal. A brass magnifying glass slides over it, the map goes dark, and the counter jumps from "2?" to "5". | A1, A2 |
| स्पेन का बॉर्डर खुद इतना अजीब है… | Push along the glowing Pyrenees border with question marks popping up. | (map) |
| फ्रांस के अंदर… ल्लिविया… 1659… गाँव नहीं, शहर… | Dive into France: Llívia lights up orange in a sea of blue, with a "1.6 km" line to Spain. A small hill town pops up. A treaty scroll unrolls, "गाँव" is crossed out and "शहर" is stamped. | B1, B2, B3 |
| फेज़ेंट आइलैंड… हर छह महीने… इस वक़्त? फ्रांस का। | Pan west to the river: the tiny island sits in the middle and a pheasant flutters up. A calendar flips its pages, and the flag above the island flips Spain ↔ France and lands on France. | C1, C2, C3 |
| तीसरा पड़ोसी… अंडोरा… दो प्रिंस… | Counter "3". Andorra glows in the mountains, a stone village pops up, then two co-prince figures stand on either side of it, one French and one Spanish. | D1, D2, D3 |
| चौथा पड़ोसी… ब्रिटेन… जिब्राल्टर… 1713… दरवाज़ा | Counter "4". Big pull-out to the UK, then a red line down to the southern tip. The Rock rises, a monkey peeks out, and a giant stone gate swings open over the Strait as a ship sails through. | E1, E2, E3, E4 |
| पाँचवाँ पड़ोसी… मोरक्को… अफ्रीका… | Counter "5". Africa lights up across the Strait and Morocco is tinted. | (map) |
| सेउटा और मेलिया… एक चट्टान जो कभी टापू थी… रेत… 85 मीटर | City pins drop on Ceuta and Melilla. Dive onto the tiny rock fortress, sand blows in and fills the gap, and a measuring tape stretches across: "85 मीटर". | F1, F2, F3, G1 |
| कितने पड़ोसी तुम्हें पता थे? | Pull out to all 5 neighbours lit up around Spain, with the counter on "5". | (map) |

---

## 1. Read this first

**1. GPT never draws a map.** I build every map from Sentinel-2 satellite imagery (EOX, CC BY 4.0, credited), Natural Earth borders and OpenStreetMap coastlines. That includes Spain, France, Portugal, Andorra, Gibraltar, Ceuta, Melilla, the Peñón, Llívia and Pheasant Island.

**2. No text, numbers, letters or flags in any GPT image.** Country names, the counter, "1659", "1713", "1.6 km", "85 मीटर", the crossed-out words and every flag are drawn in code. That way the flags come out exactly right.

**3. No real people.** The two co-princes (D2, D3) are generic figures. Don't make either look like any real president or bishop.

**4. One look: "Glossy 3D miniature".** Every prop and figure is a premium glossy 3D miniature, like a high-end diorama or tabletop model: soft studio light from the top-left, smooth materials, no outlines. Figures are stylised 3D miniatures (not chibi, not photoreal), with consistent proportions. Make each set in the same chat.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the start of each chat.
- Sizes: **1024×1024** for props and figures, **1536×1024** for wide items, **1024×1536** for tall items.
- `PNG-T` = real transparent background. If you get a checkerboard or white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000), for particles and effects.
- Make 2–3 versions of each and keep the best. Name files exactly as listed; they go in `public/spain/img/`.

### Style Lock (paste once at the top of each chat)
```
You are generating production assets for a premium animated map documentary
(vertical 9:16 Short, satellite-map look, like a high-end After Effects +
GeoLayers geography video). The story is Spain's strange borders and its five
land neighbours: France, Portugal, Andorra, the United Kingdom (Gibraltar) and
Morocco, plus the Spanish town of Llivia inside France and Pheasant Island,
which changes country every six months. Every prop and figure is a premium
glossy 3D miniature, like a high-end diorama model: soft studio light from the
top-left, smooth realistic materials, subtle reflections, no outlines, no
cartoon line work. Human figures are stylised 3D miniature figurines with
natural proportions and dignified poses, generic people who do not resemble
any real person. No text, no letters, no numbers, no flags, no logos, no coats
of arms, no watermark, no signature, no frame or border. When I say PNG-T, the
background must be fully transparent (real alpha channel). When I say BLACK,
the background must be pure flat black #000000. Centre the subject with
generous empty padding. Do not add glow or drop shadows; those are added
later in the video editor.
```

---

## 2. GPT asset prompts

### A. The quiz you just lost (same chat)

#### A1 · `school_wall_map.png` (1024×1536, PNG-T)
```
A glossy 3D miniature of an old classroom pull-down wall map: a wooden roller
bar at the top with a small hanging cord, a large blank cream paper sheet
hanging flat and slightly curled at the bottom edge, a thin wooden bar at the
bottom. The paper is completely blank and evenly lit (I will put the map on
it later). Front view, straight on. PNG-T, transparent background.
```

#### A2 · `magnifying_glass.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a classic brass magnifying glass with a dark wooden
handle, lens facing the viewer, slight three-quarter angle, handle pointing to
the lower right. The lens is clear glass with soft reflections, nothing seen
through it. PNG-T, transparent background.
```

### B. Llívia: the town saved by one word (same chat)

#### B1 · `llivia_town.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small old Catalan mountain town on a gentle green
hill: about a dozen stone houses with terracotta roofs packed around a sturdy
Romanesque stone church with a square bell tower, a few cypress and pine
trees, a little stone wall around it, the small hill base visible at the
bottom like a diorama. Warm late-afternoon light. PNG-T, transparent
background.
```

#### B2 · `treaty_scroll.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a 17th-century royal treaty: a wide unrolled
parchment scroll lying almost flat, rolled at both ends on dark wooden rods,
aged cream paper with soft stains, completely blank (no writing), a red wax
seal with a ribbon hanging from the bottom edge. Seen from slightly above.
PNG-T, transparent background.
```

#### B3 · `quill_inkwell.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a white feather quill standing in a small round
glass inkwell with dark ink and a brass lid flipped open, tilted elegantly to
the right. PNG-T, transparent background.
```

### C. Pheasant Island: the island that changes country (same chat)

#### C1 · `pheasant_island.png` (1536×1024, PNG-T)
```
A glossy 3D miniature diorama of a tiny long narrow river island, seen from a
three-quarter aerial angle: grassy and green, lined with tall poplar trees,
a small stone obelisk monument in the middle, a ring of calm river water
around the island's edge with gentle ripples, the water fading out softly at
the edges. Peaceful and slightly mysterious. PNG-T, transparent background.
```

#### C2 · `desk_calendar.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a classic flip desk calendar: a sturdy dark wooden
stand with two brass rings at the top holding a stack of blank cream pages,
the front page slightly lifting as if about to flip. All pages are completely
blank (no numbers, no months). PNG-T, transparent background.
```

#### C3 · `pheasant_bird.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a male common pheasant mid-flight, wings spread,
long striped tail, copper-gold body, iridescent green-blue head with red
face, flying to the right. PNG-T, transparent background.
```

### D. Andorra: the country with two princes (same chat)

#### D1 · `andorra_village.png` (1024×1024, PNG-T)
```
A glossy 3D miniature diorama of a small Pyrenees mountain village: grey
stone houses with dark slate roofs, a small Romanesque church with a round
bell tower, a stone bridge over a mountain stream, pine trees, and two
snow-capped peaks rising behind, on a small round diorama base. PNG-T,
transparent background.
```

#### D2 · `coprince_president.png` (1024×1024, PNG-T)
```
A glossy 3D miniature figurine of a generic modern head of state: a
middle-aged man in a dark navy suit, white shirt, plain dark tie, a plain
blue ceremonial sash across his chest with a small gold medal (no symbols),
a small golden coronet on his head, standing upright facing three-quarters
right with a calm, dignified expression. He must not resemble any real
person. PNG-T, transparent background.
```

#### D3 · `coprince_bishop.png` (1024×1024, PNG-T)
```
A glossy 3D miniature figurine of a generic Catholic bishop in the same
style and scale as the previous figure: a tall white-and-gold mitre, red and
white vestments, a golden crosier staff in one hand, the other hand raised
in a gentle blessing, standing upright facing three-quarters left, calm and
kind. A small golden coronet floats just above the mitre. He must not
resemble any real person. PNG-T, transparent background.
```

### E. Britain at the tip of Spain: Gibraltar (same chat)

#### E1 · `rock_gibraltar.png` (1536×1024, PNG-T)
```
A glossy 3D miniature diorama of the Rock of Gibraltar seen from the side:
a dramatic tall limestone rock with a sheer pale cliff face on one side and
green scrub on its slopes, a small white town packed at its base along the
water, a strip of calm sea at the bottom of the diorama. Majestic,
fortress-like. PNG-T, transparent background.
```

#### E2 · `barbary_macaque.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a cute Barbary macaque (the tailless monkey of
Gibraltar) sitting on a small rock, fluffy golden-brown fur, curious face
looking toward the viewer, one hand resting on its knee. PNG-T, transparent
background.
```

#### E3 · `ship_cargo.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a modern container ship, side view sailing to the
right, dark blue hull, red waterline, colourful stacked shipping containers
(plain, no writing or logos), white bridge tower at the back, a small white
wake at the bow. PNG-T, transparent background.
```

#### E4 · `stone_gate.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a monumental ancient stone gateway: two massive
carved stone pillars and an arch, with two heavy wooden doors bound in iron,
both doors swung half open inward, warm light coming through the gap. Front
view. PNG-T, transparent background.
```

### F. Morocco and the 85-metre border (same chat)

#### F1 · `penon_rock.png` (1536×1024, PNG-T)
```
A glossy 3D miniature diorama of a tiny craggy rock island off a desert
coast: a steep dark rock with small white and ochre fort buildings and old
walls clinging to the top, a narrow low strip of pale sand connecting its
base to a small piece of mainland beach on the left, calm turquoise water on
both sides of the sand strip. Seen from a three-quarter aerial angle. PNG-T,
transparent background.
```

#### F2 · `tape_measure.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a retro yellow metal tape measure: the round case
on the left, the tape pulled out straight to the right in a long flat
ribbon, the metal hook at the end. Leave the tape blank (no numbers or
markings). Side view. PNG-T, transparent background.
```

#### F3 · `white_coastal_city.png` (1024×1024, PNG-T)
```
A glossy 3D miniature diorama of a small white Mediterranean port city on a
rocky peninsula: whitewashed buildings, a few old fortress walls, a
lighthouse, palm trees, a tiny harbour with two little boats, calm blue sea
around the edge. Bright sunny light. PNG-T, transparent background.
```

### G. Overlays

#### G1 · `overlay_sand_drift.png` (1536×1024, BLACK)
```
Fine golden sand blowing from left to right in soft drifting streaks and
tiny flying grains, photographic, varied density, glowing slightly where
the light hits it, on a pure flat black #000000 background. No other
objects.
```

#### G2 · `overlay_clouds.png` (1024×1536, BLACK)
```
Soft thin white clouds seen from above, as if a camera is diving down
through them from high altitude: wispy, semi-transparent, with gaps of pure
black between them, on a pure flat black #000000 background. No ground, no
sky colour, only the white clouds.
```

---

## 3. Drawn in code (no GPT)

All maps:
- the Europe → Spain dive
- the dark "count" map
- Llívia, Pheasant Island, Andorra, Gibraltar, Ceuta, Melilla and the Peñón

Country colour tints and glowing border lines · the neighbour counter 2? → 5 · flags (Spain, France, UK) with exact colours · country and place names · "1659", "1713", "1.6 km", "85 मीटर" · "गाँव" crossed out and "शहर" stamped on the scroll · the calendar flip and the month names · the flag flip on Pheasant Island · question marks along the border · the measuring tape's markings · Hindi subtitles · the @null_dynasty watermark.

---

## 4. File checklist

| # | File | Size | Required |
|---|---|---|---|
| A1 | `school_wall_map.png` | 1024×1536 PNG-T | yes |
| A2 | `magnifying_glass.png` | 1024² PNG-T | yes |
| B1 | `llivia_town.png` | 1024² PNG-T | yes |
| B2 | `treaty_scroll.png` | 1536×1024 PNG-T | yes |
| B3 | `quill_inkwell.png` | 1024² PNG-T | optional |
| C1 | `pheasant_island.png` | 1536×1024 PNG-T | yes |
| C2 | `desk_calendar.png` | 1024² PNG-T | yes |
| C3 | `pheasant_bird.png` | 1024² PNG-T | optional |
| D1 | `andorra_village.png` | 1024² PNG-T | yes |
| D2 | `coprince_president.png` | 1024² PNG-T | yes |
| D3 | `coprince_bishop.png` | 1024² PNG-T | yes |
| E1 | `rock_gibraltar.png` | 1536×1024 PNG-T | yes |
| E2 | `barbary_macaque.png` | 1024² PNG-T | optional |
| E3 | `ship_cargo.png` | 1536×1024 PNG-T | yes |
| E4 | `stone_gate.png` | 1024² PNG-T | yes |
| F1 | `penon_rock.png` | 1536×1024 PNG-T | yes |
| F2 | `tape_measure.png` | 1536×1024 PNG-T | yes |
| F3 | `white_coastal_city.png` | 1024² PNG-T | yes |
| G1 | `overlay_sand_drift.png` | 1536×1024 BLACK | yes |
| G2 | `overlay_clouds.png` | 1024×1536 BLACK | yes |

20 assets (17 required, 3 optional). Send them with the voiceover (MP3) and SRT.
