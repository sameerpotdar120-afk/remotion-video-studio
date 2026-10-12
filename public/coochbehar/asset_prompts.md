# Cooch Behar enclaves (छिटमहल): asset prompts

Script confirmed: `public/coochbehar/script_hindi.txt` (236 words, about 90 s at the creator's pace).
All-new assets for this video. Nothing is reused from earlier videos.

## 0. Beat map (script → screen)

| Script | On screen | Assets |
|---|---|---|
| क्या आप जानते हैं… 111 गाँव Bangladesh के अंदर बंद थे? | Frame 0: bold question text. Satellite globe → India (official boundary, gold glow) → 111 saffron dots pop inside Bangladesh; small village miniatures pop up on a few of them | A1 |
| हज़ारों लोग सोए एक देश में, और जागे दूसरे में। पर क्यों? | A village hut at night under the moon cross-fades to the same hut at dawn; the dots flip colour | A2, A3, G1 |
| ये कहानी है Cooch Behar की… 162 टुकड़े | Satellite zoom to Cooch Behar; a straight border line shatters into 162 glowing pieces, with a counter (code) | — |
| इनमें सबसे अनोखा था, Dahala Khagrabari | Spotlight dive onto one tiny piece; the field miniature rises out of the map, with a name tag | B1 |
| सोचिए, एक खेत जो भारत का था… चारों तरफ Bangladesh… | Nested glowing rings drawn on the beat, saffron → green → saffron → green, with labels (code) | B1 |
| …दुनिया का इकलौता ऐसा बॉर्डर चक्रव्यूह! | The rings spin into a chakravyuh spiral (code); "दुनिया में सिर्फ 1" stamp | — |
| कहते हैं, राजा शतरंज में ये गाँव दाँव पर लगाते थे | The chessboard with tiny village pieces on it | C1 |
| 1947 के बँटवारे में ये टुकड़े वहीं फँस गए | 1947 stamp; the border tears through; a barbed fence rises around the dots | C2 |
| सोचिए, 68 साल तक… कोई पहचान ही नहीं थी | An enclave family outside their hut; a blank ID card flips and stays empty; "51,000" and "68 साल" counters | D1, D2 |
| न भारत की सरकार मदद कर सकती थी, न Bangladesh की | Two closed government-office doors, one on each side of the map | D3 |
| बच्चे बिना School के बड़े हुए | Children playing in a field outside a locked school gate | D4 |
| एक बुखार की दवा के लिए भी… जान जोखिम में | A mother carrying her sick child across a field at dusk, toward a fence; a dashed route on the map; a medicine bottle pops in | D5, D6, G1 |
| 31 July 2015 की आधी रात, इतिहास बदला… नक्शे बदले | A clock strikes 12; 111 dots turn green, 51 turn saffron; the border redraws | E1 |
| ज़िंदगी का सबसे मुश्किल सवाल… "ज़मीन तुम्हारी, पर देश चुन लो।" | Families holding candles at night; the quote appears as a card (code) | E2, G2 |
| करीब 1,000 लोगों ने तिरंगे को चुना… पीछे छोड़कर चले आए | A family walking away with their belongings, the old hut behind them; an arrow into India; the Tricolour glows on India (code); "~1,000" counter | E3, F1 |
| सच बताना… घर और देश में से एक… किसे चुनेंगे? | The ancestral hut with a key in its door; the question card (code) | F1 |

---

## 1. Read this first

**1. GPT never draws a map.** I build every map from Sentinel-2 satellite imagery (EOX, CC BY 4.0, credited) and Natural Earth borders (India point-of-view edition, so India has its official boundary).
I also draw the enclave dots, the nested rings, the chakravyuh spiral, the Tricolour and every name tag in code.

**2. No text, numbers, letters, flags or logos in any GPT image.** The Tricolour is drawn in code, never by GPT.

**3. No real people.** Every figure is a generic stylised figurine and doesn't resemble any real person.
The enclave families are shown with dignity and warmth: hard-working, close, strong. Never shown as poor props or as pitiable.

**4. One look: "Glossy 3D miniature",** the same premium diorama look as the Mumbai and Sugar videos.
Soft studio light from the top-left, smooth materials, no outlines. Make each set in the same chat.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the start of each chat.
- Sizes: **1024×1024** for props, **1536×1024** for wide items, **1024×1536** for tall items.
- `PNG-T` = real transparent background. If you get a checkerboard or white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000), for the mist and candle-light effects.
- Make 2–3 versions of each and keep the best. Name the files exactly as listed. They go in `public/coochbehar/img/`.

### Style Lock (paste once at the top of each chat)
```
You are generating production assets for a premium animated map documentary
(vertical 9:16 Short, satellite-map look, like a high-end After Effects +
GeoLayers geography video). The story is about the Cooch Behar enclaves on the
India–Bangladesh border in rural North Bengal: tiny pieces of one country
surrounded by the other, where families lived for 68 years without proper
identity papers, until the two countries swapped the land at midnight on 31
July 2015. Every prop is a premium glossy 3D miniature, like a high-end
diorama or tabletop model: soft studio light from the top-left, smooth
realistic materials, subtle reflections, no outlines, no cartoon line work.
The setting is rural Bengal: mud and bamboo huts with corrugated tin or
thatched roofs, banana and betel-nut trees, jute and paddy fields, small
ponds. Human figures are small generic stylised figurines in simple rural
Bengali clothes (sari, lungi, kurta, gamchha) that do not resemble any real
person, shown with dignity and warmth. No text, no letters, no numbers, no
flags, no logos, no watermark, no signature, no frame or border. When I say
PNG-T, the background must be fully transparent (real alpha channel). When I
say BLACK, the background must be pure flat black #000000. Centre the subject
with generous empty padding. Do not add glow or drop shadows; those are added
later in the video editor.
```

---

## 2. GPT asset prompts

### A. The villages (same chat)

#### A1 · `village.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a small rural Bengal village on a round patch of
green land: four mud-and-bamboo huts with corrugated tin and thatched roofs,
banana trees and two tall betel-nut palms, a small pond with lily pads, a
narrow dirt path, a patch of green paddy field at the edge. Three-quarter view
from slightly above, like a tabletop diorama tile. PNG-T, transparent
background.
```

#### A2 · `hut_night.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of one mud-and-bamboo hut with a tin roof at night,
lit by soft blue moonlight, a warm dim glow of an oil lamp through the small
window, a sleeping cat curled by the door, a banana tree beside it. Calm and
quiet. Three-quarter view. PNG-T, transparent background.
```

#### A3 · `hut_dawn.png` (1024×1024, PNG-T)
```
The exact same hut as before, same angle, same banana tree and the same cat,
now at sunrise: warm golden morning light from the left, the door open, a
small brass water pot (lota) by the step, the cat awake and stretching.
PNG-T, transparent background.
```

### B. Dahala Khagrabari (same chat as A)

#### B1 · `jute_field.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of one small square plot of farmland like a tabletop
tile, densely planted with tall green jute plants, a narrow raised mud edge
(aal) around it, one small bamboo marker post at one corner, a tiny farmer's
straw hat resting on the edge. Three-quarter view from above. PNG-T,
transparent background.
```

### C. How it began (same chat)

#### C1 · `chess_kings.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of two generic 18th-century Indian nobles seated on
cushions on opposite sides of a low carved wooden chessboard (chaturanga),
one in a Bengali royal outfit with a jewelled turban, the other in a Mughal
court robe and turban. On the board, between the chess pieces, stand tiny
miniature village huts as if they were the stakes of the game. Rich silks,
warm lamp light, side view. Stylised figurines, not real historical people.
PNG-T, transparent background.
```

#### C2 · `fence.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a straight section of a border fence: grey concrete
posts with taut rows of barbed wire between them, a little tall grass at the
bottom, standing on a thin strip of earth. Side view, slightly from above.
PNG-T, transparent background.
```

### D. 68 years without an identity (same chat)

#### D1 · `family.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a rural Bengali family standing together in front of
their mud hut: a grandfather with a white beard and a gamchha on his shoulder,
a mother in a simple cotton sari, a father in a lungi and kurta, and two small
children holding hands. Calm, dignified, close to each other, looking slightly
toward the viewer. PNG-T, transparent background.
```

#### D2 · `id_card.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a blank identity card lying slightly tilted: a plain
off-white laminated card with an empty grey photo box and empty lines where
the details would be, completely blank, nothing written on it. PNG-T,
transparent background.
```

#### D3 · `office_door.png` (1024×1536, PNG-T)
```
A glossy 3D miniature of the front of a small old government office building:
a heavy closed wooden double door with a padlocked iron latch, a cracked
plaster wall, an empty wooden bench outside. No signboard, no writing. PNG-T,
transparent background.
```

#### D4 · `school_gate.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a small rural school building with a closed and
padlocked iron gate in front, and outside the gate three small barefoot
children in simple clothes playing with a stick and a bicycle tyre on the
dirt road, one of them looking back at the school. No signboard, no writing.
PNG-T, transparent background.
```

#### D5 · `mother_child.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a young rural Bengali mother in a cotton sari
walking quickly through tall field grass at dusk, carrying her sick child
wrapped in a light shawl on her hip, holding a small cloth bundle, her face
worried but determined. Side view, walking to the right, soft orange dusk
light. PNG-T, transparent background.
```

#### D6 · `medicine.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small brown glass medicine bottle with a plain
white cap and a strip of white tablets beside it, no label and no writing.
PNG-T, transparent background.
```

### E. 31 July 2015 (same chat)

#### E1 · `clock.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of an old round wall clock with a wooden frame and a
cream face with simple tick marks only (no numerals), both hands pointing
straight up at twelve. Front view. PNG-T, transparent background.
```

#### E2 · `candles_crowd.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a small group of rural Bengali villagers, men,
women, elders and children, standing together at night, each holding a
lit candle or small clay diya, faces lit warmly from below, hopeful and
emotional, some smiling with tears. Three-quarter view. PNG-T, transparent
background.
```

#### E3 · `family_leaving.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a rural Bengali family walking away to the right on a
dirt road: the father carrying a tin trunk on his head, the mother with a
cloth bundle and holding a child's hand, the grandfather with a walking
stick looking back over his shoulder. Morning light. Side view. PNG-T,
transparent background.
```

### F. The question (same chat as A)

#### F1 · `old_home_key.png` (1024×1024, PNG-T)
```
The same mud-and-bamboo hut with a tin roof as before, now empty and quiet in
soft morning light, the wooden door closed, an old iron key left in the
padlock on the door, a few fallen leaves on the step, the banana tree beside
it. PNG-T, transparent background.
```

### G. Effects (same chat)

#### G1 · `overlay_mist.png` (1536×1024, BLACK)
```
Soft low ground mist drifting in a wide horizontal band across the lower half
of the frame, thin and wispy white, fading out at the edges. On a pure flat
black #000000 background. BLACK.
```

#### G2 · `overlay_candlelight.png` (1536×1024, BLACK)
```
Dozens of small warm golden candle flames and soft out-of-focus bokeh lights
scattered across the frame, some sharp and some blurred, like a night vigil.
On a pure flat black #000000 background. BLACK.
```

---

**Total:** 18 images (16 props + 2 effects). Put them in one zip.

**Done in code:** the maps (Sentinel-2 satellite, India's official boundary), the 162 enclave dots and their colour swap, the nested Dahala Khagrabari rings, the chakravyuh spiral, the Tricolour glow on India, the 1947 stamp, the counters (111, 162, 51,000, 68 साल, ~1,000), the quote card, the name tags (Cooch Behar, Dahala Khagrabari, Bangladesh), the question card and the subtitles.

**Music and SFX** (I'll source these, no action needed): an emotional Mixkit track, plus Sonniss night crickets, a clock chime at midnight, a fence rattle and soft whooshes.
