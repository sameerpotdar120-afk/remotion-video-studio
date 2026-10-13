# Karl Bushby, 28 years on foot: asset prompts

Script confirmed: `public/bushby/script_hindi.txt` (117 words, about 45 s).
All-new assets for this video. Nothing is reused from earlier videos.

## 0. Beat map (script → screen)

| Script | On screen | Assets |
|---|---|---|
| एक आदमी, एक कसम: पूरी दुनिया पैदल घूमनी है। | Frame 0: globe with the glowing route wrapped around it, the walker on top, only "28 साल पैदल" | A2 |
| Plan था 12 साल का… हो गए 28 साल। पर क्यों? | "12" crossed out, "28" slams in, a "?" pill (code) | A2 |
| Karl Bushby 1998 में Chile से निकला। न गाड़ी, न जहाज़, न Plane। | Pin on Chile, "1998" stamp; the walker sets off along the route; car, ship and plane pop up and get crossed out one by one | A1, B1, B2, B3 |
| Darién Gap के जंगल में मौत को छूकर लौटा… | The jungle glows green with skull pins; a jungle tile rises, the walker pushes through it | A5, C1, D2 |
| …और Panama में सीधे जेल। | A jail cell slams down, the walker's backpack inside | C2 |
| Bering Strait पर 14 दिन बर्फ़ पर चलकर Russia पहुँचा… | The frozen strait in white, snow falling; the walker in winter gear crosses an ice floe | A3, C3, D1 |
| …वहाँ फिर गिरफ़्तार। | Handcuffs drop in | C4 |
| Russia में Visa सिर्फ 90 दिन का। हर बार Exit, फिर Entry… ऊपर से Ban। | A passport flips open, the route loops out and back on the map (code), a "BANNED" stamp (code) | C5 |
| अकेले Russia में 11 साल निकल गए। | Snow across Siberia, an "11 साल" counter (code) | D1 |
| फिर Pandemic ने रोका। | A closed border barrier; the walker waits, sitting on his backpack | A6, C6 |
| फिर Caspian Sea ने रोका… तो 31 दिन में 288 KM तैर गया। | Caspian glows blue; the walker swims with a support boat beside him, a splash; "31 दिन · 288 KM" (code) | A4, C7, D3 |
| अब 50,000 KM चलकर, वो घर के बस पास है। | Full route on the globe, "50,000 KM" (code), zoom to England: a warm house with a lit window | A1, C8 |
| ये जुनून है या पागलपन? Comment में बताओ। | Two buttons "जुनून" / "पागलपन" (code) | — |

---

## 1. Read this first

**1. GPT never draws a map.** I build every map from Sentinel-2 satellite imagery (EOX, CC BY 4.0, credited) and Natural Earth borders.
The route line, pins, stamps, counters, the "BANNED" stamp and every label are drawn in code.

**2. No text, numbers, letters, flags or logos in any GPT image.**

**3. The walker is a generic figurine, not Karl Bushby.** Karl is a real person and his photos belong to someone else. Never ask GPT for his face or likeness.
Use the same invented figurine in every pose: a lean bearded long-distance walker in a faded khaki shirt, cargo trousers, a wide-brim hat and a big orange backpack.

**4. One look: "Glossy 3D miniature",** the same premium diorama look as our other videos.
Soft studio light from the top-left, smooth materials, no outlines. Make set A in one chat, so the walker stays identical.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the start of each chat.
- Sizes: **1024×1024** for props, **1536×1024** for wide items, **1024×1536** for tall items.
- `PNG-T` = real transparent background. If you get a checkerboard or white background, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000), for the snow, mist and splash effects.
- Make 2–3 versions of each and keep the best. Name the files exactly as listed. They go in `public/bushby/img/`.

### Style Lock (paste once at the top of each chat)
```
You are generating production assets for a premium animated map documentary
(vertical 9:16 Short, satellite-map look, like a high-end After Effects +
GeoLayers geography video). The story is one man's 28-year walk around the
world on foot, with no car, ship or plane: through jungle, jail, sea ice,
visa trouble, a pandemic and a sea he had to swim. Every prop is a premium
glossy 3D miniature, like a high-end diorama or tabletop model: soft studio
light from the top-left, smooth realistic materials, subtle reflections, no
outlines, no cartoon line work. The walker is an invented stylised figurine
(he must not resemble any real person): a lean bearded long-distance walker,
faded khaki shirt, olive cargo trousers, worn hiking boots, a wide-brim
canvas hat and a big orange trekking backpack. No text, no letters, no
numbers, no flags, no logos, no watermark, no signature, no frame or border.
When I say PNG-T, the background must be fully transparent (real alpha
channel). When I say BLACK, the background must be pure flat black #000000.
Centre the subject with generous empty padding. Do not add glow or drop
shadows; those are added later in the video editor.
```

---

## 2. GPT asset prompts

### A. The walker (same chat, keep him identical)

#### A1 · `walker_side.png` (1024×1536, PNG-T)
```
A glossy 3D miniature of the walker striding to the right in full side view,
mid-step, the big orange backpack on his back, a wooden walking stick in his
right hand, determined face, dust under his boots. Full body, standing on
nothing. PNG-T, transparent background.
```

#### A2 · `walker_front.png` (1024×1536, PNG-T)
```
The same walker standing and facing the viewer, three-quarter front view,
both thumbs hooked in his backpack straps, chin up, calm and determined, a
faint smile. Full body. PNG-T, transparent background.
```

#### A3 · `walker_ice.png` (1024×1536, PNG-T)
```
The same walker in heavy winter gear: a thick hooded orange parka with fur
trim, snow goggles pushed up, mittens, the same orange backpack, frost on his
beard, leaning into the wind and walking to the right on a small slab of sea
ice. PNG-T, transparent background.
```

#### A4 · `walker_swim.png` (1536×1024, PNG-T)
```
The same walker swimming front crawl to the right, seen from the side, one
arm reaching forward out of the water, wearing a bright swim cap and goggles,
beard visible, a small patch of dark blue sea water with ripples around him
fading out softly at the edges. PNG-T, transparent background.
```

#### A5 · `walker_jungle.png` (1024×1536, PNG-T)
```
The same walker pushing through dense jungle, pulling aside big green leaves
with one hand, sweat on his face, mud on his boots and trousers, the orange
backpack scratched and dirty, walking toward the viewer at three-quarter
view. PNG-T, transparent background.
```

#### A6 · `walker_waiting.png` (1024×1024, PNG-T)
```
The same walker sitting on his orange backpack, elbows on his knees, chin on
his fists, looking tired and patient, his walking stick leaning beside him.
Side three-quarter view. PNG-T, transparent background.
```

### B. No car, no ship, no plane (same chat)

#### B1 · `car.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a simple modern red hatchback car, three-quarter
front view, clean and shiny, no badges, no number plate. PNG-T, transparent
background.
```

#### B2 · `ship.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a white passenger ferry ship with a blue hull
stripe, side view, sailing to the right, small waves at the waterline fading
out softly. No markings or writing. PNG-T, transparent background.
```

#### B3 · `plane.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a white passenger airliner flying to the right,
side three-quarter view, landing gear up, no airline livery, no markings or
writing. PNG-T, transparent background.
```

### C. The obstacles (same chat)

#### C1 · `jungle.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a patch of dense tropical rainforest like a
tabletop diorama tile: tall tangled trees, hanging vines, giant leaves, a
muddy narrow trail disappearing into the dark green, a little mist low
between the trunks. Three-quarter view from slightly above. PNG-T,
transparent background.
```

#### C2 · `jail.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small old jail cell seen from the front: a
cracked plaster back wall, a hard metal bench, thick dark iron bars across
the front with a closed barred door and a heavy padlock, an orange trekking
backpack on the bench inside. PNG-T, transparent background.
```

#### C3 · `ice_floe.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a large flat slab of cracked white-blue sea ice
floating on a small patch of dark icy water, jagged edges, little ice chunks
drifting around it, fading out softly at the edges. Three-quarter view from
above. PNG-T, transparent background.
```

#### C4 · `handcuffs.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a pair of shiny steel handcuffs lying open on
nothing, the chain slightly curved, catching the light. PNG-T, transparent
background.
```

#### C5 · `passport.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of an open worn passport seen from above at a slight
tilt, both pages covered in many overlapping blank ink stamps of different
shapes and colours (round, square, triangular), but with absolutely no
readable text, letters or numbers anywhere; the cover is plain dark red with
no emblem. PNG-T, transparent background.
```

#### C6 · `border_barrier.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a closed border checkpoint: a red-and-white striped
boom barrier lowered across an empty road, a small grey guard booth with its
window shut and a lamp off, a padlocked gate beside it. No flags, no signs,
no writing. PNG-T, transparent background.
```

#### C7 · `support_boat.png` (1536×1024, PNG-T)
```
A glossy 3D miniature of a small white support boat with an orange
inflatable rim and a little cabin, side view, moving to the right on a small
patch of blue sea water with a short wake, fading out softly. No markings or
writing. PNG-T, transparent background.
```

#### C8 · `home.png` (1024×1024, PNG-T)
```
A glossy 3D miniature of a small English red-brick terraced house at dusk:
a white front door, warm yellow light glowing in the windows, a little low
brick wall and gate, a wet street in front. Cosy and welcoming. No house
number, no writing. PNG-T, transparent background.
```

### D. Effects (same chat)

#### D1 · `overlay_snow.png` (1536×1024, BLACK)
```
Heavy falling snow blown diagonally from upper left to lower right, many
white flakes of different sizes, some sharp and some softly out of focus. On
a pure flat black #000000 background. BLACK.
```

#### D2 · `overlay_jungle_mist.png` (1536×1024, BLACK)
```
Soft humid white mist drifting in a wide horizontal band across the lower
half of the frame, thin and wispy, fading out at the edges. On a pure flat
black #000000 background. BLACK.
```

#### D3 · `overlay_splash.png` (1536×1024, BLACK)
```
A bright white water splash and spray bursting upward and outward from the
bottom centre, droplets flying, some in focus and some blurred. On a pure
flat black #000000 background. BLACK.
```

---

**Total:** 20 images (17 props + 3 effects). Put them in one zip.

**Done in code:** the maps, the glowing route, pins, the "1998" stamp, the "12 → 28" counter, the crosses over the car, ship and plane, skull pins, the "BANNED" stamp, the exit/entry loop, the "11 साल", "31 दिन · 288 KM" and "50,000 KM" counters, the two answer buttons and the subtitles.

**Music and SFX** (I'll source these, no action needed): a driving, adventurous Mixkit track, plus Sonniss footsteps, jungle, jail-door slam, ice cracks, wind, splash and whooshes.
