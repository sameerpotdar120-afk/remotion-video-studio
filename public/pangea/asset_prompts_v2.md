# Pangea re-edit: asset prompts (GPT images, Mumbai look)

The VO stays the same (`audio/vo.mp3`, 88.7 s). Every prop that was drawn in code gets replaced by your GPT images, in the
same "glossy 3D miniature" look as the Mumbai reel (Koli fisherman, temple, ships). Maps, counters, labels, captions and
camera stay in code.

## 1. Read this first

**1. GPT never draws a map.** Continents, India's official boundary, the satellite and the old map stay in code.

**2. No text, numbers, letters, flags or logos in any image.** "−30 करोड़ साल", "70°C", "8–16%", "PANGEA" and every
label are drawn in code.

**3. Respect for the shaligram.** It is shown whole, on a proper puja thali, never cut, broken, X-rayed or placed on the
ground. The ammonite comparison uses a separate museum fossil (S2), shown beside it, never inside it. No image of any
deity.

**4. One look.** Premium glossy 3D miniatures, like a high-end diorama: soft studio light from the top-left, rich
realistic materials, no outlines, no cartoon line work. Make each group in the same chat so the look stays consistent.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the top of each chat.
- Use the biggest size GPT offers in that shape: square for props, wide (landscape) for wide items, tall (portrait) for
  scenes. If it can give 2048 px or more, use that. I upscale and clean the edges for 4K.
- `PNG-T` = real transparent background. If you get a checkerboard or white background, reply: *"Regenerate with a
  truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000), for glow, dust and fire effects.
- Make 2–3 versions of each and send the best. Name files exactly as listed. Send them as one zip.

### Style Lock (paste once at the top of each chat)
```
You are generating production assets for a premium animated map documentary
(vertical 9:16 Short, satellite and old-map look, like a high-end After
Effects + GeoLayers geography video). The story is how India broke away from
the supercontinent Pangea, crashed into Asia and raised the Himalaya out of
the Tethys sea, and how all continents may join again in the far future.
Every prop is a premium glossy 3D miniature, like a high-end diorama model:
soft studio light from the top-left, rich realistic materials, subtle
reflections, fine detail, no outlines, no cartoon line work. Animals are
realistic 3D miniatures with natural proportions, never cute or chibi.
No text, no letters, no numbers, no flags, no logos, no watermark, no
signature, no frame or border. When I say PNG-T, the background must be fully
transparent (real alpha channel). When I say BLACK, the background must be
pure flat black #000000. Centre the subject with generous empty padding. Do
not add glow or drop shadows; those are added later in the video editor.
```

## 2. Beat map (VO → screen → asset)

| Time | VO | On screen | Assets |
|---|---|---|---|
| 0:00 | Tumhe mehsoos nahi hota… 5 cm khisak raha hai | India on satellite, gold fill, "+5 cm/साल" counter, small arrows pushing NE | (code) |
| 0:06 | 25 crore saal baad… mammals ko mita sakta hai. Kyu? | Heat wash over India; the Earth-on-fire globe pops; the 4 animals and the family stand, then crumble to dust | F1, M1–M5, X2 |
| 0:12 | 30 crore saal pehle… Pangea | Old-map world on a real paper texture; continents slide together; "PANGEA" | X1 |
| 0:18 | Bharat? Asia mein tha hi nahi… Africa, Antarctica, Australia | India in Gondwana; gold fills; Asia far away with a red ✕ | (code) |
| 0:24 | Pangea toota… sabse tez bhaagta tukda… 15 cm | Lava rifts tear open between the pieces; India races north with a fire trail; speedometer | R1, R2, G1 |
| 0:33 | Beech mein tha ek samandar: Tethys | Tethys fills with animated sea; ancient sea life swims in it (ammonites, an ichthyosaur) | T1, T2, T3 |
| 0:36 | 5 crore saal pehle… ja takraya | "−5 करोड़ साल"; the crash: dust and rock burst, screen shake | C1 |
| 0:40 | Samandar ka farsh upar uth gaya… bana Himalaya | The mountain chunk rises out of the sea with water pouring off; it settles onto the map as the Himalaya | H1 |
| 0:44 | Everest ki choti par… fossil | Satellite Everest; the summit miniature with a climber; the limestone fossil slab pops | E1, E2 |
| 0:48 | Jo shaligram hum ghar mein poojte hain? | Warm puja scene: the shaligram on its thali, diya flickering, marigold petals | S1 |
| 0:51 | Wo bhi usi samandar ke jeev, ammonite, ke fossil | The museum ammonite fossil beside it, then the live ammonite swimming in the Tethys | S2, T1 |
| 0:54 | Ye takkar aaj bhi jaari hai | Null in the bottom half; above: Himalaya on satellite with arrows | (Null clip) |
| 0:57 | Ek model kehta hai… America… Australia… | Future old map (red grade); continents move; lit on each name | (code) |
| 1:04 | 25 crore saal baad… Pangaea Ultima | The ring supercontinent; "PANGAEA ULTIMA" | (code) |
| 1:10 | 2023 ki ek study… 40 se 70 degree | The research journal pops; land turns to cracked desert; the blazing sun; thermometer climbs | P1, F2, F3, G2 |
| 1:16 | Mammals ke rehne layak… 8 se 16 pratishat | The animals and the family again; most crumble to dust; land meter drops | M1–M5, X2 |
| 1:20 | Jis takkar ne humein Himalaya diya… mita sakti hai | Push into India; the Himalaya miniature glows, then a heat wave crosses it | H1 |
| 1:25 | Aur ye safar abhi chal raha hai, kyunki… | Back to frame 0: India on satellite | (code) |

## 3. GPT asset prompts

### M. Life that could vanish (same chat)

#### M1 · `m_elephant.png` (square, PNG-T)
```
A realistic glossy 3D miniature of an adult Indian elephant (Asian elephant,
smaller ears, domed head), standing calmly, three-quarter view facing left,
detailed wrinkled grey skin, small tusks. PNG-T, transparent background.
```

#### M2 · `m_tiger.png` (square, PNG-T)
```
A realistic glossy 3D miniature of a Bengal tiger standing proudly,
three-quarter view facing left, rich orange coat with sharp black stripes,
alert expression. Same scale and style as the elephant. PNG-T, transparent
background.
```

#### M3 · `m_deer.png` (square, PNG-T)
```
A realistic glossy 3D miniature of a chital (Indian spotted deer) stag with
antlers, standing alert, three-quarter view facing right, golden-brown coat
with white spots. Same style. PNG-T, transparent background.
```

#### M4 · `m_rhino.png` (square, PNG-T)
```
A realistic glossy 3D miniature of an Indian one-horned rhinoceros standing,
three-quarter view facing right, armour-plated skin with detailed folds.
Same style. PNG-T, transparent background.
```

#### M5 · `m_family.png` (square, PNG-T)
```
A glossy 3D miniature figurine of a modern Indian family of four standing
together: a father, a mother in a simple saree, a young boy and a little
girl holding hands, looking ahead calmly. Stylised 3D miniature with natural
proportions, dignified, not a caricature. PNG-T, transparent background.
```

### X. Textures and effects (same chat)

#### X1 · `x_paper.png` (wide, no transparency)
```
A flat, evenly lit texture of very old hand-made map paper, seen straight
from above, filling the whole frame: warm cream and light sepia tones, soft
fibres, gentle stains and faint fold lines, slightly darker edges. Smooth and
clean, no strong grain or noise, no writing, no drawings, no map. Seamless
look.
```

#### X2 · `x_dust_burst.png` (square, BLACK)
```
A burst of fine golden-brown sand and dust particles blowing away to the
right, like a sculpture crumbling into dust in the wind, on a pure black
#000000 background. Soft, cinematic, no solid shapes.
```

### F. Heat and the future (same chat)

#### F1 · `f_earth_fire.png` (square, PNG-T)
```
A glossy 3D miniature planet Earth on a small stand, its continents glowing
red-orange and cracked like cooling lava, the oceans shrunk and dark, faint
heat shimmer and thin smoke rising from it. Dramatic but beautiful. No text.
PNG-T, transparent background.
```

#### F2 · `f_sun.png` (square, BLACK)
```
A blazing sun, close and huge, with swirling orange and white plasma, bright
corona and heat glow, on a pure black #000000 background. Cinematic, no lens
flare streaks, no text.
```

#### F3 · `f_cracked_land.png` (wide, no transparency)
```
A top-down view of parched, cracked desert ground under extreme heat: deep
polygon cracks, sun-baked orange and ochre earth, a few dead dry twigs,
evenly lit, filling the whole frame. Photographic detail, no text.
```

### R, G, C, H. Breakup, speed, crash, mountains (same chat)

#### R1 · `r_lava_rift.png` (wide, PNG-T)
```
A long jagged crack in the Earth's crust seen from above, glowing molten
lava inside, dark basalt edges, small sparks and wisps of smoke, running
horizontally across the frame. PNG-T, transparent background.
```

#### R2 · `r_fire_trail.png` (wide, BLACK)
```
A fast streak of fire and glowing embers flying horizontally from right to
left, like a comet's trail, bright at the left end and fading to sparks on
the right, on a pure black #000000 background.
```

#### G1 · `g_speedometer.png` (square, PNG-T)
```
A glossy 3D miniature vintage brass speedometer dial with a red needle, a
dark face with plain tick marks only (no numbers, no letters), polished
brass bezel. Face-on view. PNG-T, transparent background.
```

#### G2 · `g_thermometer.png` (tall, PNG-T)
```
A glossy 3D miniature glass laboratory thermometer standing upright, a brass
cap and base, a clear glass tube with red liquid filling about one quarter,
plain tick marks only (no numbers). PNG-T, transparent background.
```

#### C1 · `c_impact_burst.png` (square, BLACK)
```
A huge cinematic impact explosion of rock debris and dust: chunks of rock and
earth flying outward in every direction from the centre, brown and grey dust
clouds, a few bright sparks, on a pure black #000000 background.
```

#### H1 · `h_himalaya.png` (wide, PNG-T)
```
A glossy 3D miniature diorama of the Himalaya mountain range rising out of
the sea: a long, dramatic chain of sharp rocky peaks with snow-capped tops,
the tallest peak in the centre, layered rock folds visible on the sides, and
sea water pouring off the lower slopes in small waterfalls at the base.
Side view, wide. PNG-T, transparent background.
```

### T. The Tethys sea (same chat)

#### T1 · `t_ammonite_live.png` (square, PNG-T)
```
A realistic glossy 3D miniature of a living ammonite swimming: a coiled,
ribbed spiral shell in warm cream and brown bands, with soft squid-like
tentacles flowing out of the opening, moving to the left. Ancient and
beautiful. PNG-T, transparent background.
```

#### T2 · `t_ichthyosaur.png` (wide, PNG-T)
```
A realistic glossy 3D miniature of an ichthyosaur, the dolphin-like marine
reptile of ancient seas, swimming to the left, sleek blue-grey body, long
narrow snout, large eye. PNG-T, transparent background.
```

#### T3 · `t_sea_overlay.png` (wide, PNG-T)
```
A top-down patch of clear turquoise tropical sea with soft white wave crests
and gentle ripples, the edges fading to transparent all around (an oval
vignette of water). PNG-T, transparent background.
```

### E, S, P. Everest, the shaligram, the study (same chat)

#### E1 · `e_everest_summit.png` (square, PNG-T)
```
A glossy 3D miniature of the summit of Mount Everest: a sharp snowy pyramid
peak with exposed grey-brown limestone bands below the snow, a tiny
mountaineer in a bright orange down suit standing near the top holding an
ice axe up in triumph. Plain cloth, no flags. PNG-T, transparent background.
```

#### E2 · `e_fossil_slab.png` (square, PNG-T)
```
A realistic glossy 3D miniature slab of grey marine limestone with fossils of
ancient sea creatures pressed into its surface: two trilobites, crinoid stem
segments and small shells, lit from the top-left. PNG-T, transparent
background.
```

#### S1 · `s_shaligram_puja.png` (square, PNG-T)
```
A respectful, beautiful glossy 3D miniature of a puja thali: a polished brass
plate holding a smooth, round, glossy black shaligram stone resting on a
small bed of fresh tulsi leaves, a little sandalwood paste mark on the
stone, a few orange marigold petals around it, a small lit brass diya with a
gentle flame and a tiny brass kalash to the side. Warm, devotional, serene
lighting. No deity figure, no text. PNG-T, transparent background.
```

#### S2 · `s_ammonite_fossil.png` (square, PNG-T)
```
A realistic museum specimen of an ammonite fossil cut and polished in half,
showing the beautiful spiral chambers inside in warm amber, cream and
mother-of-pearl tones, resting on a small dark wooden display stand. No
labels. PNG-T, transparent background.
```

#### P1 · `p_journal.png` (square, PNG-T)
```
A glossy 3D miniature of an open scientific journal lying at a slight
angle: the pages show only blurred, unreadable grey lines and a small
blurred map figure with red-orange colours (no readable text, no logo),
with a pair of reading glasses resting on it. PNG-T, transparent background.
```

## 4. What I do with them

- Clean edges, upscale to 4K where needed, and cut out anything that comes with a background.
- Pop each one onto the map with a spring, a soft shadow and a little life: the ammonite and the ichthyosaur swim, the diya
  flame flickers, the lava rifts glow, the Himalaya rises with water pouring off it, and the animals and family crumble
  into the dust burst (X2).
- Replace the flat parchment with your paper texture (X1), held still on screen so it can't shimmer (no "ants").
- Keep the 4K60 anti-ants render settings from this version.
- About 21 images. If you're short on time, the 10 that matter most: S1, S2, H1, E1, E2, T1, M1, M2, M5, F1.
