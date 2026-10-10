# Mumbai: 7 Islands (Hindi): Asset Prompts and Asset Plan

Style: our GeoGlobeTales-style edit. One continuous camera over real maps with no cuts, smooth keyframed moves and zooms. Glossy 3D props pop onto the map, glowing labels write on, and water animates. The story happens **on the map**: the sea flows between 7 glowing islands, then the land fills in.

Script: `script_hindi.txt` (the creator's final version). Every asset below is new.

---

## 0. Beat map (script → screen)

| Script | On screen | Assets |
|---|---|---|
| जिस मुंबई में आज 2 करोड़ लोग… 200 साल पहले वहाँ समंदर था। | Satellite dive into today's Mumbai; the city "melts", and the sea floods back between the islands. City lights glow. | (map), G1 |
| ये 7 द्वीप थे… कोलाबा … माहिम… | Only 7 islands remain. The camera sweeps south → north, each island lights up with its name, water flows between them. | G1 |
| हमारे कोली भाई… मुंबा देवी… | Koli boats sail between the islands; a Koli fisherman stands proudly on the shore; a small Mumba Devi temple glows; "मुंबा → मुंबई" writes on. | A1, A2, A3, A4 |
| 1534 पुर्तगाली… | "1534"; Portuguese caravels arrive; a Portuguese-colour wash spreads over the islands. | B1 |
| 1661 … दहेज … इंग्लैंड | Pull out to the world map: a royal wedding ring and crown, then a dowry chest carrying the islands sails to England. | B2, B3, B4 |
| 10 पाउंड सालाना … ईस्ट इंडिया कंपनी | A "£10 / साल" price tag slaps onto the islands; an East India Company ship arrives. | B5, B6 |
| ज़मीन कम… मानसून में समंदर घुस आता था | Monsoon clouds and rain; waves surge into the low land between the islands. | C1, C2, C3 |
| 1782 हॉर्नबी… वर्ली… कंपनी ने मना किया… सस्पेंड… | Zoom to Worli's Great Breach (glowing gap). The Hornby figurine plants his feet; a sealed letter flies in, its wax seal cracks, and he tears it up. | D1, D2 |
| 1784 हॉर्नबी वेलार्ड… सातों द्वीप एक होने लगे… 1845 | The stone wall builds across the breach; the water drains; stones and rubble fill the gaps; "1845". | D3, D4 |
| 2024 कोस्टल रोड… 100 हेक्टेयर | Today's satellite view; the Coastal Road draws along the sea; "100 हेक्टेयर" counter; a construction crane pops up. | E1 |
| कोली भाई… कोलीवाड़ों में सिमटते गए | The Koli fisherman again; his sea shrinks around him; colourful Koliwada clusters pin onto today's map. | A1, A5 |
| जहाँ तुम खड़े हो, वहाँ कभी समंदर था। | Final morph from today's Mumbai back to the 7 islands, with water shimmering under the city. | (map) |

---

## 1. Read this first

**1. GPT never draws a map.** I build every map: today's Mumbai from Sentinel-2 satellite (EOX, CC BY 4.0, credited) and OpenStreetMap, and the 7 islands traced by me from public-domain 18th–19th-century survey maps, on an old nautical-chart texture (F1).

**2. No text, numbers, letters or flags in any GPT image.** "1534", "£10", "1845", "100 हेक्टेयर", island names and labels are all drawn in code.

**3. Respect.** Our Koli bhai are shown with pride and dignity: real traditional Koli dress, confident poses, no caricature, no "poor fisherman" pity. Mumba Devi is shown only through her **temple** (A3). No image of the deity herself, out of respect.

**4. One look: "Glossy 3D miniature".** Every prop and figure is a premium glossy 3D miniature, like a high-end diorama or tabletop model: soft studio light from the top-left, smooth materials, no outlines. Figures are stylised 3D miniatures (not chibi, not photoreal), with consistent proportions. Make each set in the same chat.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the start of each chat.
- Sizes: **1024×1024** for props and figures, **1024×1536** for full scenes, **1536×1024** for wide items.
- `PNG-T` = real transparent background. If you get a checkerboard or white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000), for water and light effects.
- Make 2–3 versions of each and keep the best. Name files exactly as listed; they go in `public/mumbai/img/`.

### Style Lock (paste once at the top of each chat)
```
You are generating production assets for a premium animated map documentary
(vertical 9:16 Short, satellite and old-nautical-chart map look, like a high-end
After Effects + GeoLayers geography video). The story is how Mumbai's seven
islands were joined into one city by reclaiming land from the sea (1534–1845),
and the Koli fishing community, the islands' original people. Every prop and
figure is a premium glossy 3D miniature, like a high-end diorama model: soft
studio light from the top-left, smooth realistic materials, subtle
reflections, no outlines, no cartoon line work. Human figures are stylised 3D
miniature figurines with natural proportions and dignified, confident poses,
historically and culturally accurate dress, never caricatures. No text, no
letters, no numbers, no flags, no logos, no watermark, no signature, no frame
or border. When I say PNG-T, the background must be fully transparent (real
alpha channel). When I say BLACK, the background must be pure flat black
#000000. Centre the subject with generous empty padding. Do not add glow or
drop shadows; those are added later in the video editor.
```

---

## 2. GPT asset prompts

### A. Our Koli bhai and Mumba Devi (same chat)

#### A1 · `koli_fisherman.png` (1024×1024, PNG-T)
```
A glossy 3D miniature figurine of a proud Koli fisherman from Mumbai's coast
in the 18th century: strong, confident, standing tall facing three-quarters
left, a warm smile, wearing the traditional Koli dress: a short checked
lungi/langoti-style wrap, a sleeveless vest (bandi), a red Koli cap (topi), and
a folded fishing net over one shoulder. Barefoot. Dignified and full of
pride, like the true owner of the sea. PNG-T, transparent background.
```

#### A2 · `koli_woman.png` (1024×1024, PNG-T)
Optional, but it makes the community feel real and not "one man".
```
A glossy 3D miniature figurine of a proud Koli woman from Mumbai in the same
style and scale as the previous figure: wearing a bright traditional
nauvari (nine-yard) saree in vivid colours, gold jewellery, flowers in her
hair, carrying a woven fish basket on her head, standing confidently with a
warm smile. PNG-T, transparent background.
```

#### A3 · `mumbadevi_temple.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small traditional Hindu temple of the Konkan coast,
inspired by the Mumba Devi shrine: a stone base, a pale shikhara (spire) with
a saffron pennant (plain, no symbols), a small doorway glowing with warm
lamp light, marigold garlands, a brass bell and a few lit diyas on the steps.
Respectful, serene, beautiful. No deity figure visible. PNG-T, transparent
background.
```

#### A4 · `koli_boat.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a traditional Koli wooden fishing boat of Mumbai,
side view sailing to the left: a long narrow hull painted in bright stripes
(red, yellow, blue), a single tall triangular sail, a small fishing net hanging
over the side, a couple of fish baskets on board. No people, no flags.
PNG-T, transparent background.
```

#### A5 · `koliwada_houses.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small, lively Koliwada fishing village cluster:
five or six colourful little houses in bright painted colours (turquoise,
pink, yellow) with tiled roofs, packed close together, fishing nets drying on
poles, two small colourful boats pulled up in front, a few fish drying on
racks. Warm and full of life. PNG-T, transparent background.
```

### B. Portugal, the dowry, the £10 rent (same chat)

#### B1 · `ship_portuguese_caravel.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a 16th-century Portuguese caravel, three-quarter view
sailing to the right: dark wooden hull, triangular lateen sails and one square
sail, each sail with a plain red cross shape painted on it (a simple cross, no
text). No water. PNG-T, transparent background.
```

#### B2 · `royal_ring.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a 17th-century royal wedding ring: a heavy gold band
with a large cut ruby and small diamonds around it, resting on a small red
velvet cushion with gold tassels. PNG-T, transparent background.
```

#### B3 · `royal_crown.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of an English royal crown of the 17th century: gold
frame with crosses and fleurs-de-lis, red velvet cap, ermine band, set with
large red and blue jewels. PNG-T, transparent background.
```

#### B4 · `dowry_chest.png` (1024×1024, PNG-T)
The 7 islands go inside it on screen; I composite them in.
```
A glossy 3D miniature of an ornate open treasure chest of the 1600s, used as a
royal wedding dowry: dark wood with gold corners and filigree, the lid open,
red silk lining, a few pearls and gold coins spilling out, and an EMPTY space
in the middle of the chest (something will be placed there later). PNG-T,
transparent background.
```

#### B5 · `price_tag_gold.png` (1024×1024, PNG-T)
"£10 / साल" is written on it in code.
```
A glossy 3D miniature of an old-fashioned brown parchment price tag with a
brass grommet and a short red string, slightly curled at the edges, blank on
the front (nothing written). PNG-T, transparent background.
```

#### B6 · `ship_east_indiaman.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a large 1660s English East India Company merchant
ship (an East Indiaman), three-quarter view sailing to the left: tall
three-masted ship with full white sails, warm wooden hull with gold trim, a
row of gun ports, cargo crates on deck. No flags. No water. PNG-T,
transparent background.
```

### C. Monsoon and the sea (same chat)

#### C1 · `monsoon_cloud.png` (1536×1024, PNG-T)
```
A large, heavy, dark monsoon storm cloud as a glossy 3D miniature: deep
blue-grey, wide and flat-bottomed with towering soft tops, a faint inner glow
as if lightning is about to strike. No rain. PNG-T, transparent background.
```

#### C2 · `overlay_rain.png` (1024×1536, BLACK)
```
Heavy monsoon rain: many thin, slanted, bright white rain streaks falling
diagonally across the whole frame, some closer and blurred, some far and
fine, photographed against pure flat black #000000. BLACK background.
```

#### C3 · `wave_surge.png` (1536×1024, BLACK)
```
A powerful sea wave crashing and surging forward from left to right with
white foam, spray and splashing droplets, realistic high-speed photograph,
against pure flat black #000000. BLACK background.
```

### D. Hornby and the wall (same chat)

#### D1 · `hornby_figure.png` (1024×1024, PNG-T)
```
A glossy 3D miniature figurine of a determined British colonial governor of
Bombay in 1782 (inspired by William Hornby): middle-aged man in a dark blue
long coat with gold buttons, white cravat, white breeches, black tricorn hat,
holding a rolled engineering plan in one hand and pointing forward with the
other, a stubborn, determined expression. PNG-T, transparent background.
```

#### D2 · `letter_wax_seal.png` (1024×1024, PNG-T)
Remotion cracks the seal and tears the letter.
```
A glossy 3D miniature of an 18th-century folded official letter on cream
parchment, closed with a large red wax seal (plain seal design, no letters),
slightly curled, seen from a three-quarter angle. No visible writing. PNG-T,
transparent background.
```

#### D3 · `sea_wall_segment.png` (1536×1024, PNG-T)
The Hornby Vellard. Remotion repeats it along the breach line on the map.
```
A glossy 3D miniature of a straight section of an 18th-century stone sea wall
(causeway), seen from a high three-quarter angle: large grey-brown cut stone
blocks, a flat top walkway, slightly weathered, small waves lapping at the
base on one side. Isolated piece, ends cut cleanly. PNG-T, transparent
background.
```

#### D4 · `rubble_pile.png` (1024×1024, PNG-T)
```
A glossy 3D miniature pile of rocks, stones, earth and rubble used for land
filling, with a wooden handcart and a few baskets beside it. PNG-T,
transparent background.
```

### E. Today

#### E1 · `crane_construction.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a modern yellow construction crane next to a stack
of concrete tetrapods and a small piece of new seafront road, as used for
sea-front land reclamation. PNG-T, transparent background.
```

### F. Map textures and overlays

#### F1 · `texture_nautical_chart.png` (1536×1536)
The paper the historical 7-island map is printed on.
```
A seamless, tileable texture of an aged 18th-century nautical chart paper:
warm cream-beige, subtle fibres, faint foxing stains, very faint ruled grid
lines, evenly lit, no edges, no borders, no text, no drawings. Square, flat,
photographed straight on.
```

#### G1 · `overlay_water_shimmer.png` (1536×1536, BLACK)
For the sea flowing between the islands and under today's city at the end.
```
Seamless top-down view of sunlit sea water caustics: bright, fine, wavy
light patterns dancing on dark water, high contrast, white and pale cyan
light lines against pure flat black #000000. Tileable. BLACK background.
```

---

## 3. Drawn in code (no GPT)

Every map (today's Mumbai satellite, the 7 islands, the morph between them) · island glows and names · animated water flowing between the islands · the Great Breach glow and the water draining · the wall building along the breach · land filling time-lapse · the Coastal Road line · flags (Portuguese, English) · "1534", "1661", "£10 / साल", "1782", "1784", "1845", "100 हेक्टेयर" · "मुंबा → मुंबई" lettering · the letter's seal cracking and tearing · rain and lightning timing · Hindi subtitles · the @null_dynasty watermark.

---

## 4. File checklist

| # | File | Size | Required |
|---|---|---|---|
| A1 | `koli_fisherman.png` | 1024² PNG-T | yes |
| A2 | `koli_woman.png` | 1024² PNG-T | yes |
| A3 | `mumbadevi_temple.png` | 1024² PNG-T | yes |
| A4 | `koli_boat.png` | 1536×1024 PNG-T | yes |
| A5 | `koliwada_houses.png` | 1024² PNG-T | yes |
| B1 | `ship_portuguese_caravel.png` | 1024² PNG-T | yes |
| B2 | `royal_ring.png` | 1024² PNG-T | yes |
| B3 | `royal_crown.png` | 1024² PNG-T | yes |
| B4 | `dowry_chest.png` | 1024² PNG-T | yes |
| B5 | `price_tag_gold.png` | 1024² PNG-T | yes |
| B6 | `ship_east_indiaman.png` | 1024² PNG-T | yes |
| C1 | `monsoon_cloud.png` | 1536×1024 PNG-T | yes |
| C2 | `overlay_rain.png` | 1024×1536 BLACK | yes |
| C3 | `wave_surge.png` | 1536×1024 BLACK | yes |
| D1 | `hornby_figure.png` | 1024² PNG-T | yes |
| D2 | `letter_wax_seal.png` | 1024² PNG-T | yes |
| D3 | `sea_wall_segment.png` | 1536×1024 PNG-T | yes |
| D4 | `rubble_pile.png` | 1024² PNG-T | yes |
| E1 | `crane_construction.png` | 1024² PNG-T | yes |
| F1 | `texture_nautical_chart.png` | 1536² | yes |
| G1 | `overlay_water_shimmer.png` | 1536² BLACK | yes |

21 assets. Send them with the voiceover (MP3) and SRT.
