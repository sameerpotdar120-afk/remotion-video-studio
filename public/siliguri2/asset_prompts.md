# Siliguri Corridor v2: asset prompts (photoreal 3D props for the coloured terrain map)

The look is the reference's: a real 3D tilted terrain of the Himalayas and Bengal with strong country colours. China is
red, India blue, Bangladesh green, Nepal and Bhutan purple. The rivers glow cyan. I build all of that in code from real
terrain and satellite data.

Your GPT images are only the **props that have to look real**: the jets, the S-400 truck, the soldiers, the vehicles
and the ground tiles. I place each one at its real place on the map, scaled to the camera, with a contact shadow, so
props on the ground sit on the ground. The jets fly high, with a soft shadow far below them.

**GPT never draws a map, a flag or any text.** No national markings, roundels, flags, badges, hull or tail numbers on
anything. I add every flag, label, ring, pin and counter in code.

## How to generate (ChatGPT / GPT image)
- One image per message. Paste the **Style Lock** once at the top of the chat.
- Square, the biggest size GPT offers (2048 px or more if it can). `PNG-T` means a real transparent background.
  - If you get a checkerboard or white, reply: *"Regenerate with a truly transparent alpha background, not a drawn
    checkerboard."* Or use remove.bg / Photoroom.
- Name the files exactly as listed, zip them, and share through Google Drive ("Anyone with the link").

### Style Lock (paste once)
```
You are generating production props for a premium 3D documentary Short
about India's Siliguri Corridor, the Himalayas and the Bengal plains. Every
image is a single photorealistic 3D-rendered miniature object, like a
high-end game engine render (Unreal Engine 5 / GTA VI quality): physically
based materials, real textures, worn metal, dust and dirt where it belongs,
soft large sunlight from the upper left with a slightly warm tone, gentle
ambient occlusion, subtle tilt-shift miniature feel. Unless I say "top-down",
the camera is a three-quarter view from about 45 degrees above, the same
angle for every prop, so they all sit on one tilted map. No text, no
letters, no numbers, no logos, no flags, no roundels, no national markings,
no tail or hull numbers, no watermark. PNG-T means a fully transparent
background with a real alpha channel. Centre the subject with generous
empty padding. Keep a soft contact shadow directly under ground objects
only, no other background.
```

## The props

| # | File | Where it appears (VO) |
|---|---|---|
| J1 | `j_jet_top.png` | jets flying in formation with white contrails: the hook, and "Hasimara me Rafale Fighter Jets" |
| J2 | `j_jet_badge.png` | the ringed "RAFALE" badge |
| S1 | `s_s400_launcher.png` | the ringed "S-400" badge: "Reports ke mutabik S-400 Air Defence" |
| A1 | `a_indian_soldiers.png` | Doklam: "Bharat ki Army 73 din tak saamne khadi rahi", and the 3 garrison badges |
| A2 | `a_china_armour.png` | the Chumbi Valley: "iske theek upar baithi hai China ki Army" (I ring it red in code) |
| R1 | `r_road_works.png` | Doklam: "China yahin sadak bana raha tha" |
| L1 | `l_old_airbase.png` | "Lalmonirhat, World War ke zamaane ka ek purana Airbase" |
| G1 | `g_garrison.png` | "Army ke 3 naye Garrison: Bamuni, Kishanganj aur Chopra" |
| D1 | `d_darjeeling_hill.png` | the hook: "Tum Darjeeling jao…" |
| T1 | `t_train_top.png` | "sab isi se jude hain" (a train running through the corridor) |

#### J1 · `j_jet_top.png` (PNG-T, top-down)
```
A photorealistic 3D render of a modern twin-engine delta-wing fighter jet
with small canards behind the cockpit (like a Dassault Rafale), in flight,
seen exactly from straight above (top-down), nose pointing up in the image.
Medium-grey camouflage paint, a dark glass canopy, a few small missiles
under the wings. Sharp, clean, no motion blur. No roundels, no markings,
no numbers, no flag. No shadow at all. PNG-T.
```

#### J2 · `j_jet_badge.png` (PNG-T)
```
The same modern twin-engine delta-wing fighter jet with small canards
(like a Dassault Rafale), medium-grey camouflage, banking slightly in
flight, three-quarter view from 45 degrees above and from the front left,
so the whole aircraft fills a square frame. No roundels, no markings, no
numbers, no flag. No shadow. PNG-T.
```

#### S1 · `s_s400_launcher.png` (PNG-T)
```
A photorealistic 3D miniature of a long-range air defence missile launcher
vehicle (like the S-400 system): a large eight-wheeled olive-green military
truck carrying four long cylindrical missile tubes raised almost vertical
at the rear, stabiliser legs down on the ground, three-quarter view from 45
degrees above. Generic design, no markings, no numbers, no flag. PNG-T.
```

#### A1 · `a_indian_soldiers.png` (PNG-T)
```
A photorealistic 3D miniature of a line of six soldiers standing shoulder
to shoulder, as if forming a human wall, in a high-altitude setting:
disruptive-pattern olive and brown camouflage uniforms, combat helmets,
cold-weather jackets, rifles held across the chest, firm stance, seen from
45 degrees above, three-quarter view. A thin patch of rocky snowy ground
under their feet only. No flags, no badges, no patches, no text. PNG-T.
```

#### A2 · `a_china_armour.png` (PNG-T)
```
A photorealistic 3D miniature of a short military column on a mountain
road: two dark green armoured personnel carriers and one military truck,
with a few dark-uniformed soldiers standing beside them, seen from 45
degrees above, three-quarter view. A thin strip of grey gravel road with a
little snow under them only. Generic designs, no flags, no stars, no
markings, no numbers. PNG-T.
```

#### R1 · `r_road_works.png` (PNG-T)
```
A photorealistic 3D miniature of road construction on a high mountain
plateau: a yellow excavator and a bulldozer cutting a fresh dirt road
through rocky grassland, a dump truck, piles of gravel, a little snow on
the rocks, seen from 45 degrees above as a small irregular ground tile. No
people, no text, no logos. PNG-T.
```

#### L1 · `l_old_airbase.png` (PNG-T)
```
A photorealistic 3D miniature of an old, long-unused 1940s airfield on
flat green farmland: a single cracked concrete runway with weeds growing
through the joints, faded edge lines, a rusty curved-roof hangar, a small
old control tower, scattered trees, seen from 45 degrees above as a long
rectangular ground tile. No aircraft, no people, no text. PNG-T.
```

#### G1 · `g_garrison.png` (PNG-T)
```
A photorealistic 3D miniature of a new army station on flat green plains:
neat rows of low barracks with green roofs, a parade ground, a helipad with
a white circle, parked olive military trucks, a perimeter wall with
watchtowers at the corners, seen from 45 degrees above as a square ground
tile. No flags, no text, no markings. PNG-T.
```

#### D1 · `d_darjeeling_hill.png` (PNG-T)
```
A photorealistic 3D miniature of a misty Himalayan hill town: steep slopes
covered in neat green tea-garden rows, small colourful houses stacked on the
ridge, a tiny blue toy-train on a narrow mountain railway curling round the
hill, a thin cloud drifting across, seen from 45 degrees above as a round
ground tile. No people, no text. PNG-T.
```

#### T1 · `t_train_top.png` (PNG-T, top-down)
```
A photorealistic 3D render of a long Indian goods train, seen exactly from
straight above (top-down), running straight up the image: a dark locomotive
at the top followed by about twelve brown and grey freight wagons. No
track, no ground, no text, no logos. No shadow. PNG-T.
```

## Made in code (no prompts needed)

The terrain, country colours, glowing rivers, snow and clouds; the flags and the "चीन" / "बांग्लादेश" territory tags; the
glowing "सिलीगुड़ी कॉरिडोर" label and its "22 KM" counter; the white rings around the badges; the pins; the road, rail
and Doklam-road lines; the hatched "Greater Bangladesh" claim pattern and the "ख़ारिज" stamp; the "73 दिन" and "4.5
करोड़" counters; and the blue "किला" outline round the corridor.

## Priority

If you're short on time, these 6 matter most: **J1, S1, A1, A2, L1, G1**. J2 can be cut from J1 if needed. If you skip
D1, R1 or T1, I can do without them.
