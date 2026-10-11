# Märket: the border that bends around a lighthouse (Hindi): Asset Prompts and Asset Plan

Style: our continuous map edit with no cuts. The hook opens on the zig-zag itself at frame 0. Then a pull-out to Scandinavia on
satellite, a magnifying-glass dive onto the island, a film-strip rewind into an antique 1809 map, back to the island for the
lighthouse, and the border bending live into its zig-zag. The camera moves in quick bursts with 2–4 s holds and a gentle 3D roll.

Script: `script_hindi.txt` (confirmed). Every asset below is new.

---

## 0. Beat map (script → screen)

| Script | On screen | Assets |
|---|---|---|
| ये बॉर्डर… ज़िग-ज़ैग क्यों… एक लाइटहाउस | Frame 0: the glowing zig-zag on the island + bold text; the lighthouse silhouette pulses | B1 |
| ये है स्वीडन, और ये फ़िनलैंड… समंदर से भी | Pull out to Scandinavia; both countries fill with waving flag colours (code); the sea border draws on | (map) |
| ज़ूम करो… और ज़ूम… पाँच फुटबॉल मैदान से भी छोटा… मार्केट | A hand slides a magnifying glass over the sea border; dive onto the island; five mini football pitches line up beside it | A1, A2 |
| 1809… स्वीडन रूस से जंग हार गया… रूसी साम्राज्य | Film-strip rewind onto an antique 1809 map; a Swedish and a Russian soldier figure face off; Finland turns Russian red | C1, C2, C3, G1 |
| नया बॉर्डर… सीधा इस टापू के बीच से | A straight ink line draws across the sea and cuts the island in two | (map) |
| 1885… लाइटहाउस… सबसे ऊँची जगह | "1885"; the lighthouse rises on the island's highest point | B1, B2 |
| वो जगह स्वीडन की थी | The line glows red right through the lighthouse; a Swedish flag (code) pops up beside it | B2 |
| यहीं से जंग… पर यहाँ नहीं… सबका फ़ायदा | Crossed swords slam in, then fade away; a steamship passes safely through the sweeping lighthouse beam | E1, E2, G2 |
| 1985… कमाल का हल | "1985"; a surveyor's theodolite pops up; two hands shake | F1, F2 |
| बॉर्डर ही मोड़ दिया… ज़मीन बराबर | The line bends live into the zig-zag around the lighthouse; a golden balance scale settles level | F3 |
| न जंग, न नुकसान… सबसे शरीफ़ बॉर्डर | Pull out: the island glows, with fog drifting over the Baltic | G3 |
| लाइटहाउस, या बॉर्डर? | Question card with two buttons (code) | — |

---

## 1. Read this first

**1. GPT never draws a map.** I build every map: the satellite views from Sentinel-2 (EOX, CC BY 4.0, credited), the borders from Natural Earth and OpenStreetMap, and the 1809 antique map on the parchment texture (G1).

**2. No text, numbers, letters or flags in any GPT image.** "1809", "1885", "1985", country names, the flags (Sweden, Finland), the football-pitch count and the question buttons are all drawn in code.

**3. No real people.** Every figure is generic. The two soldiers are period-accurate but not any real person.

**4. One look: "Glossy 3D miniature".** Every prop and figure is a premium glossy 3D miniature, like a high-end diorama or tabletop model: soft studio light from the top-left, smooth materials, no outlines. Make each set in the same chat.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the start of each chat.
- Sizes: **1024×1024** for props and figures, **1536×1024** for wide items, **1024×1536** for tall items.
- `PNG-T` = real transparent background. If you get a checkerboard or white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000), for light and fog effects.
- Make 2–3 versions of each and keep the best. Name files exactly as listed; they go in `public/market/img/`.

### Style Lock (paste once at the top of each chat)
```
You are generating production assets for a premium animated map documentary
(vertical 9:16 Short, satellite-map look, like a high-end After Effects +
GeoLayers geography video). The story is Märket, a tiny rocky island in the
Baltic Sea shared by Sweden and Finland, where the border zig-zags around a
lighthouse: in 1809 the border was drawn straight across the island, in 1885 a
lighthouse was built on the Swedish half by mistake, and in 1985 the two
countries peacefully redrew the border around it. Every prop and figure is a
premium glossy 3D miniature, like a high-end diorama model: soft studio light
from the top-left, smooth realistic materials, subtle reflections, no outlines,
no cartoon line work. Human figures are stylised 3D miniature figurines with
natural proportions, generic people who do not resemble any real person. No
text, no letters, no numbers, no flags, no logos, no coats of arms, no
watermark, no signature, no frame or border. When I say PNG-T, the background
must be fully transparent (real alpha channel). When I say BLACK, the
background must be pure flat black #000000. Centre the subject with generous
empty padding. Do not add glow or drop shadows; those are added later in the
video editor.
```

---

## 2. GPT asset prompts

### A. The zoom (same chat)

#### A1 · `hand_magnifier.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a human hand holding a large round magnifying glass
from below, the hand entering from the lower right, the brass-rimmed lens
facing the viewer, clear glass with soft reflections and nothing seen through
it. Natural skin tone, a plain dark sleeve cuff at the wrist. PNG-T,
transparent background.
```

#### A2 · `football_pitch.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a single small football pitch seen from a
three-quarter aerial angle: bright green striped grass, white field markings,
two tiny white goals, a thin base edge like a tabletop model. No players, no
stands, no logos. PNG-T, transparent background.
```

### B. The island and the lighthouse (same chat)

#### B1 · `lighthouse.png` (1024×1536, PNG-T)
```
A glossy 3D miniature of a classic 19th-century lighthouse: a sturdy round
stone tower painted in bold red and white bands, a black iron gallery with a
railing near the top, a glass lantern room with a warm golden light inside,
a small red domed roof. Standing upright, front three-quarter view, on a small
granite rock base. PNG-T, transparent background.
```

#### B2 · `market_island.png` (1536×1024, PNG-T)
```
A glossy 3D miniature diorama of a tiny bare granite rock island in a cold
northern sea, seen from a three-quarter aerial angle: smooth grey-pink
granite slabs, almost no plants, a few patches of moss, a red and white
lighthouse standing on the highest point with a small stone keeper's house
beside it, calm dark-blue water with gentle ripples around the edge fading
out softly. Lonely, windswept, beautiful. PNG-T, transparent background.
```

### C. 1809: the war (same chat)

#### C1 · `soldier_sweden_1809.png` (1024×1024, PNG-T)
```
A glossy 3D miniature figurine of a generic early-19th-century Swedish
infantry soldier: dark blue coat with yellow facings, white trousers, a tall
black shako hat, a musket held upright at his side, standing proud facing
three-quarters right. No flags, no insignia with text. PNG-T, transparent
background.
```

#### C2 · `soldier_russia_1809.png` (1024×1024, PNG-T)
```
A glossy 3D miniature figurine of a generic early-19th-century Russian
infantry soldier in the same style and scale as the previous figure: dark
green coat with red facings, white trousers, a tall black shako hat, a musket
held upright, standing proud facing three-quarters left. No flags, no
insignia with text. PNG-T, transparent background.
```

#### C3 · `treaty_1809.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of an early-19th-century peace treaty: a folded thick
parchment document lying open at a slight angle, completely blank (no
writing), with a dark red ribbon and a red wax seal at the bottom, and a
small brass candlestick beside it. PNG-T, transparent background.
```

### E. No war, only ships (same chat)

#### E1 · `swords_crossed.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of two crossed 19th-century cavalry sabres with brass
hilts, blades shining, crossed in an X, slight three-quarter angle. PNG-T,
transparent background.
```

#### E2 · `steamship_1880s.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of an 1880s steamship sailing to the right, side view:
a black iron hull with a red waterline, one tall black funnel with a thin
trail of smoke, two masts with furled sails, a small white wake at the bow.
No flags, no names. PNG-T, transparent background.
```

### F. 1985: the polite fix (same chat)

#### F1 · `surveyor_theodolite.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a 1980s surveyor's theodolite on a wooden tripod
with yellow and red painted legs, the brass and green instrument head with a
small telescope, standing on a little patch of granite rock. No people.
PNG-T, transparent background.
```

#### F2 · `handshake.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of two hands in a firm friendly handshake, seen from
the side: one sleeve plain navy blue, the other plain light grey, crisp white
shirt cuffs, warm natural skin tones. Nothing else. PNG-T, transparent
background.
```

#### F3 · `balance_scale.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of an elegant golden balance scale, both pans perfectly
level, each pan holding an identical small piece of grey granite rock.
PNG-T, transparent background.
```

### G. Textures and overlays

#### G1 · `texture_parchment_1809.png` (1536×1536)
```
A seamless old map parchment texture, aged cream and tan paper with soft
brown stains, faint fibres, gentle uneven darkening at the edges, very subtle
fold lines, evenly lit, no drawings, no lines, no text. Full frame, no
background.
```

#### G2 · `overlay_lighthouse_beam.png` (1536×1024, BLACK)
```
A single soft lighthouse light beam: a long cone of warm white-gold light
spreading from a bright point on the left towards the right, with faint mist
visible inside the beam, on a pure flat black #000000 background. No other
objects.
```

#### G3 · `overlay_sea_fog.png` (1536×1024, BLACK)
```
Thin drifting sea fog seen from slightly above, soft white wisps and veils
with gaps of pure black between them, on a pure flat black #000000
background. No sea, no sky colour, only the white fog.
```

---

## 3. Drawn in code (no GPT)

All maps:
- the Scandinavia satellite views and the island close-ups
- the 1809 antique map on G1

Waving flag fills (Sweden, Finland) and flags on poles · the glowing sea border and its straight 1809 line · the live bend into the zig-zag · "1809", "1885", "1985" · "< 5 फुटबॉल मैदान" · the film-strip rewind · the question card · Hindi subtitles · the @null_dynasty watermark.

---

## 4. File checklist

| # | File | Size | Required |
|---|---|---|---|
| A1 | `hand_magnifier.png` | 1024² PNG-T | yes |
| A2 | `football_pitch.png` | 1024² PNG-T | yes |
| B1 | `lighthouse.png` | 1024×1536 PNG-T | yes |
| B2 | `market_island.png` | 1536×1024 PNG-T | yes |
| C1 | `soldier_sweden_1809.png` | 1024² PNG-T | yes |
| C2 | `soldier_russia_1809.png` | 1024² PNG-T | yes |
| C3 | `treaty_1809.png` | 1024² PNG-T | optional |
| E1 | `swords_crossed.png` | 1024² PNG-T | yes |
| E2 | `steamship_1880s.png` | 1536×1024 PNG-T | yes |
| F1 | `surveyor_theodolite.png` | 1024² PNG-T | yes |
| F2 | `handshake.png` | 1536×1024 PNG-T | yes |
| F3 | `balance_scale.png` | 1024² PNG-T | yes |
| G1 | `texture_parchment_1809.png` | 1536² | yes |
| G2 | `overlay_lighthouse_beam.png` | 1536×1024 BLACK | yes |
| G3 | `overlay_sea_fog.png` | 1536×1024 BLACK | optional |

15 assets (13 required, 2 optional). Send them with the voiceover (MP3). I'll make the SRT myself from the audio.
