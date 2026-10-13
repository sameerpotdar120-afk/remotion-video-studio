# Karl Bushby, 28 years on foot: asset prompts

Script confirmed: `public/bushby/script_hindi.txt` (187 words, about 72 s).
Editing style: our GeoGlobe look. A continuous satellite globe and map with fast camera moves, a glowing route line, highlighted regions, pins and tags, and the miniatures below popping in on the map at each beat.
All-new assets for this video. Nothing is reused from earlier videos.

## 0. Beat map (script → screen)

| Script | On screen | Assets |
|---|---|---|
| आप एक दिन में थक जाते। पर एक आदमी ने कसम खाई… | Frame 0: satellite globe with the glowing route wrapped around it, Karl standing on top, only "28 साल पैदल" | A2 |
| Plan था 12 साल का… हो गए 28 साल। पर क्यों? | "12" crossed out, "28" slams in, a "?" pill (code) | A2 |
| Karl Bushby 1998 में Chile के आखिरी छोर से निकला। न गाड़ी, न जहाज़, न Plane। | Dive to Chile's southern tip, pin and "1998" stamp; Karl sets off; car, ship and plane pop up and get crossed out | A1, B1, B2, B3 |
| पहला इम्तिहान: Darién Gap। घना जंगल, तस्कर, हथियारबंद गुट। | The route races north; the Darién Gap glows green with skull pins; a jungle tile rises with mist, Karl pushes through | A5, C1, D2 |
| मौत को छूकर लौटा… और Panama में बिना Visa के 18 दिन जेल। | A jail cell slams down on Panama, "18 दिन" (code) | C2 |
| फिर Bering Strait… 14 दिन बहती बर्फ़ पर… पहुँचते ही गिरफ़्तार। | A long pan north; the strait turns white, snow falls; the Karl in Arctic gear on an ice floe, "14 दिन"; handcuffs drop in | A3, C3, C4, D1 |
| Russia में Visa सिर्फ 90 दिन का। हर बार Exit… Entry। | A passport flips open; the route loops out of Russia and back to the same spot (code) | C5 |
| ऊपर से Ban भी लगा… अकेले Russia ने 11 साल खा लिए। | "BANNED" stamp (code); snow across Siberia; "11 साल" counter (code) | D1 |
| फिर Pandemic ने रोका। सरहदें बंद। | Borders flash red; a closed checkpoint; Karl waits on his backpack | A6, C6 |
| फिर Caspian Sea ने रोका। Russia और Iran, दोनों रास्ते बंद। | Russia and Iran flash red, the Caspian glows blue (code) | — |
| तो Karl पानी में कूद गया। 31 दिन में 288 KM… नाव पर। | Splash; Karl swims across with the support boat beside him; "31 दिन · 288 KM" (code) | A4, C7, D3 |
| फिर Turkey, पूरा Europe… English Channel… England पहुँच गया। | The route sweeps across Europe; a quick swim across the Channel to Dover | A4 |
| 28 साल, करीब 50,000 KM… घर बस कुछ सौ KM दूर। | Pull out to the globe with the full route, "50,000 KM" (code); dive to England, the house with a lit window | A7, C8 |
| ये जुनून है या पागलपन? Comment में बताओ। | Two buttons "जुनून" / "पागलपन" (code) | — |

---

## 1. Read this first

**1. GPT never draws a map.** I build every map from Sentinel-2 satellite imagery (EOX, CC BY 4.0, credited) and Natural Earth borders.
The route line, pins, stamps, counters, the "BANNED" stamp and every label are drawn in code.

**2. No text, numbers, letters, flags or logos in any GPT image.**

**3. Karl is Karl, as a stylised glossy miniature (not photoreal).** Upload the creator's reference photo of Karl in Karl chat and ask GPT to match only his face and look.
His look: tall, lean, around 50, swept-back blond-grey hair, short grey goatee beard, black sunglasses, mustard-olive T-shirt and navy shorts (warm clothes where the scene needs them), and his trademark two-wheeled cart piled with bags.
Only true moments from his journey. The reference photo itself never appears in the video, and the credits say "AI illustration".

**4. One look: "Glossy 3D miniature",** the same premium diorama look as our other videos.
Soft studio light from the top-left, smooth materials, no outlines. Make set A in one chat, so Karl stays identical.

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
outlines, no cartoon line work. The main character is a stylised glossy 3D
miniature figurine (not photoreal) of a tall, lean man around 50 with
swept-back blond-grey hair, a short grey goatee and black sunglasses, in a
mustard-olive T-shirt and navy shorts, with a two-wheeled cart piled with
bags; match his face to the reference photo I attach. No text, no letters, no
numbers, no flags, no logos, no watermark, no signature, no frame or border.
When I say PNG-T, the background must be fully transparent (real alpha
channel). When I say BLACK, the background must be pure flat black #000000.
Centre the subject with generous empty padding. Do not add glow or drop
shadows; those are added later in the video editor.
```

---

## 2. GPT asset prompts

### A. Karl (same chat; attach the reference photo once at the start)

Start the chat with the Style Lock, attach the photo, then send:
```
This is my reference for the main character. Match only his face and look (hair, goatee, sunglasses, build) in every image I ask for, as a stylised glossy 3D miniature figurine in the same style each time. Do not copy the photo, its background, the bridge or the flag.
```

#### A1 · `karl_walk.png` (1536×1024, PNG-T)
```
The character walking to the right in full side view, mid-stride, pushing his
two-wheeled cart in front of him: a long-handled trolley on two bicycle
wheels, piled high with tied bags, a rolled jacket, an orange hi-vis vest and
water bottles. Mustard-olive T-shirt, navy shorts, hiking shoes, sunglasses,
determined face. PNG-T, transparent background.
```

#### A2 · `karl_front.png` (1024×1536, PNG-T)
```
The character standing and facing the viewer, three-quarter front view, one
hand resting on the handle of his loaded two-wheeled cart beside him, hands
calm, a small confident smile, sunglasses on. Full body. PNG-T, transparent
background.
```

#### A3 · `karl_ice.png` (1536×1024, PNG-T)
```
The character in heavy Arctic gear: a thick orange hooded parka with fur
trim, snow goggles, mittens, frost on his grey goatee, leaning into the wind
and pulling a small loaded sled behind him by a rope, walking to the right
across a slab of cracked sea ice. PNG-T, transparent background.
```

#### A4 · `karl_swim.png` (1536×1024, PNG-T)
```
The character swimming front crawl to the right, seen from the side, one arm
reaching forward out of the water, a bright swim cap and goggles, grey goatee
visible, a small patch of dark blue sea with ripples around him fading out
softly at the edges. PNG-T, transparent background.
```

#### A5 · `karl_jungle.png` (1024×1536, PNG-T)
```
The character pushing his two-wheeled cart through dense jungle mud,
shoulders down, pulling aside big green leaves with one hand, sweat on his
face, mud splashed up his legs and on the cart wheels, sunglasses pushed up
on his head. Three-quarter front view. PNG-T, transparent background.
```

#### A6 · `karl_waiting.png` (1024×1024, PNG-T)
```
The character sitting on the edge of his parked two-wheeled cart, elbows on
his knees, chin resting on his fists, tired but patient, a light jacket over
his T-shirt, sunglasses in his hand. Side three-quarter view. PNG-T,
transparent background.
```

#### A7 · `karl_arrive.png` (1024×1536, PNG-T)
```
The character close to home on a wet English road in a light rain jacket,
pushing his worn, mud-stained two-wheeled cart toward the viewer, one hand
raised in a happy wave, a big tired smile. Full body. PNG-T, transparent
background.
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

**Total:** 21 images (18 props + 3 effects). Put them in one zip.

**Done in code:** the maps, the glowing route, pins, the "1998" stamp, the "12 → 28" counter, the crosses over the car, ship and plane, skull pins, the "BANNED" stamp, the exit/entry loop, the "11 साल", "31 दिन · 288 KM" and "50,000 KM" counters, the two answer buttons and the subtitles.

**Music and SFX** (I'll source these, no action needed): a driving, adventurous Mixkit track, plus Sonniss footsteps, jungle, jail-door slam, ice cracks, wind, splash and whooshes.
