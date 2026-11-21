# Six-Day War (long video + 6 Shorts): asset prompts

The look follows the reference: one continuous, tilted 3D map, in our own colours. I build all of these in code:
- the map, country fills and borders
- rivers and place names
- the unit blocks (dark tiles with flag-coloured icons)
- attack arrows and radio-wave arcs
- stat cards, counters and the losses scoreboard
- target brackets, stamps and explosion puffs
- the portrait-card frames and stands (the "card on a stand" look)
- every flag

Your GPT images are only the things that must look real or hand-made:
- the **3D miniature props** that stand on the map (jets, tanks, ships, the airfield, the bunker)
- the **portraits** that go inside the cards
- the **"breather" illustrations** (B&W, old-photo style) that replace archival photos, all labelled AI illustration
  on screen
- the **desk diorama** for the opening

**GPT never draws a map, a flag, text, a number, an insignia or a roundel.** No national markings on any vehicle,
aircraft or ship; I add colours and flags in code. Nothing violent or graphic: no bodies, no injuries, no blood.

## How to generate (ChatGPT / GPT image)
- One image per message. Paste the **Style Lock** at the top of the chat for each group: props, portraits, breathers.
- Biggest size GPT offers. **PNG-T** means a real transparent background. If you get a checkerboard or white, reply:
  *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."* Or use remove.bg / Photoroom.
- Landscape breathers: **16:9**, the biggest size.
- Name files exactly as listed, zip them, and share through Google Drive ("Anyone with the link").

---

## A. 3D miniature props (they stand on the map)

### Style Lock (paste once)
```
You are generating production props for a premium 3D documentary about the
1967 Six-Day War, shown on a painted tilted 3D map. Every image is a single
photorealistic 3D-rendered miniature object, like a high-end game engine
render (Unreal Engine 5 quality): physically based materials, real textures,
soft large sunlight from the upper left with a warm desert tone, gentle
ambient occlusion, subtle tilt-shift miniature feel. Unless I say "top-down",
the camera is a three-quarter view from about 45 degrees above, the same
angle for every prop. Period-accurate 1960s look. No text, no letters, no
numbers, no logos, no flags, no insignia, no roundels, no national markings,
no watermark, no people unless asked, nothing graphic. PNG-T means a fully
transparent background with a real alpha channel. Centre the subject with
generous empty padding. Keep a soft contact shadow directly under ground
objects only.
```

| # | File | Where it's used |
|---|---|---|
| J1 | `j_delta_jet_top.png` | Short 2: jets skimming the sea (top-down, flies along paths) |
| J2 | `j_delta_jet_side.png` | Short 2: the low-angle "under the radar" shot |
| J3 | `j_swept_jet_parked.png` | Short 2: the aircraft parked on the airfields |
| A1 | `a_airfield_tile.png` | Short 2: the airbase the strike hits; the counter sits on it |
| A2 | `a_runway_crater_tile.png` | Short 2: "pehle runway tode gaye" |
| T1 | `t_tank_desert.png` | Ch 5 Sinai; the hook's "tank in half an hour" line |
| T2 | `t_tank_column.png` | Ch 2: troops moving into Sinai; the retreat jam in the passes |
| T3 | `t_halftrack.png` | Ch 6 / Short 4: troops moving up |
| B1 | `b_bunker_ridge.png` | Short 4: bunkers on the Golan escarpment |
| P1 | `p_coastal_post.png` | Ch 2: Sharm el-Sheikh, the empty post over the strait |
| P2 | `p_port_eilat.png` | Short 1: Eilat, the only Red Sea port |
| S1 | `s_cargo_ship.png` | Short 1: ships through the strait; Short 6 |
| S2 | `s_tanker.png` | Short 1: "tel ke tanker" |
| S3 | `s_yellow_freighter.png` | Short 6: the Yellow Fleet freighter covered in desert sand |
| U1 | `u_blue_helmet.png` | Ch 2 and Short 3: the UN peacekeeper's blue helmet |
| U2 | `u_un_jeep.png` | Short 3: a white UN jeep, the peacekeepers waiting to go home |
| W1 | `w_old_city_wall.png` | Ch 6: a generic old stone city-wall tile (no religious buildings) |
| D1 | `d_document_seal.png` | Ch 8: Resolution 242 as a document prop |
| R1 | `r_radio_set.png` | Ch 2/3: an old military radio for the diplomacy and decision beats |

#### J1 · `j_delta_jet_top.png` (PNG-T, top-down)
```
A photorealistic 3D render of a 1960s single-engine delta-wing fighter jet
in flight, seen exactly from straight above (top-down), nose pointing up in
the image, silver-grey and sand camouflage paint, a dark glass canopy. Sharp,
no motion blur. No roundels, no markings, no numbers, no flag. No shadow.
PNG-T.
```

#### J2 · `j_delta_jet_side.png` (PNG-T)
```
The same 1960s single-engine delta-wing fighter jet, flying very low and
fast, seen from a low side angle slightly in front, as if skimming just above
the sea, a faint heat shimmer behind the engine. No roundels, no markings, no
numbers, no flag. No background, no water. PNG-T.
```

#### J3 · `j_swept_jet_parked.png` (PNG-T)
```
A photorealistic 3D miniature of a 1960s swept-wing single-seat fighter jet
parked on the ground, silver natural metal, canopy closed, a small wheel
chock, three-quarter view from 45 degrees above. Generic design, no
roundels, no markings, no numbers, no flag. PNG-T.
```

#### A1 · `a_airfield_tile.png` (PNG-T)
```
A photorealistic 3D miniature of a 1960s desert military airfield as a
square ground tile: two crossing concrete runways, a taxiway, a row of
small parked fighter jets, two low hangars, a control tower, sandy ground
around. Seen from 45 degrees above. No flags, no text, no markings. PNG-T.
```

#### A2 · `a_runway_crater_tile.png` (PNG-T)
```
The same desert airfield tile, but the runways are broken by a line of deep
round craters with scattered concrete chunks and thin grey smoke rising, no
fire, no wreckage of people. Seen from 45 degrees above. No text. PNG-T.
```

#### T1 · `t_tank_desert.png` (PNG-T)
```
A photorealistic 3D miniature of a 1960s main battle tank driving forward
across sand, sand-coloured paint, a long gun, a small dust plume behind the
tracks, three-quarter view from 45 degrees above. Generic design, no
markings, no numbers, no flag. PNG-T.
```

#### T2 · `t_tank_column.png` (PNG-T)
```
A photorealistic 3D miniature of a short column of four 1960s tanks and two
military trucks moving along a desert road in a line, olive-drab paint, dust
in the air, seen from 45 degrees above as a long diagonal ground strip.
Generic designs, no markings, no flags. PNG-T.
```

#### T3 · `t_halftrack.png` (PNG-T)
```
A photorealistic 3D miniature of a 1960s armoured half-track vehicle
(wheels at the front, tracks at the back), olive paint, open top, empty,
three-quarter view from 45 degrees above. Generic, no markings, no flag.
PNG-T.
```

#### B1 · `b_bunker_ridge.png` (PNG-T)
```
A photorealistic 3D miniature of a rocky basalt ridge with two low concrete
bunkers and a zigzag trench line along the top, dark volcanic stones, dry
yellow grass, seen from 45 degrees above as an irregular ground tile. No
people, no flags, no text. PNG-T.
```

#### P1 · `p_coastal_post.png` (PNG-T)
```
A photorealistic 3D miniature of a small, empty military outpost on a desert
headland by turquoise water: a low stone building, a radio mast, a
sandbagged lookout, a short jetty, seen from 45 degrees above as a round
ground tile with a little sea edge. No people, no flags, no text. PNG-T.
```

#### P2 · `p_port_eilat.png` (PNG-T)
```
A photorealistic 3D miniature of a small 1960s seaport at the tip of a desert
gulf: one quay with two cranes, oil storage tanks, a docked cargo ship,
pale desert mountains behind, seen from 45 degrees above as a square tile
with water on one side. No text, no logos, no flags. PNG-T.
```

#### S1 · `s_cargo_ship.png` (PNG-T)
```
A photorealistic 3D miniature of a 1960s general cargo ship sailing forward,
dark hull, white superstructure amidships, cargo derricks on deck, a small
white bow wave, three-quarter view from 45 degrees above. No name, no
markings, no flag. PNG-T.
```

#### S2 · `s_tanker.png` (PNG-T)
```
A photorealistic 3D miniature of a 1960s oil tanker sailing forward, long
flat red-and-black hull, white bridge at the stern, pipes on deck, a small
bow wave, three-quarter view from 45 degrees above. No name, no markings, no
flag. PNG-T.
```

#### S3 · `s_yellow_freighter.png` (PNG-T)
```
A photorealistic 3D miniature of a 1960s cargo freighter at anchor on calm
water, its decks, hatches and superstructure covered in a thick layer of
yellow desert sand and dust, slightly weathered and rusty, a hand-made sail
and a small flag-less mast added by the crew, peaceful, three-quarter view
from 45 degrees above. No name, no markings, no flag, no people. PNG-T.
```

#### U1 · `u_blue_helmet.png` (PNG-T)
```
A photorealistic 3D render of a single light-blue military helmet resting
on a small patch of sand, soft light, three-quarter view from slightly
above. Plain helmet, no letters, no emblem, no text. PNG-T.
```

#### U2 · `u_un_jeep.png` (PNG-T)
```
A photorealistic 3D miniature of a 1960s white military jeep with a canvas
top, parked on sand beside two duffel bags and a wooden crate, as if waiting
to leave, three-quarter view from 45 degrees above. No letters, no emblem,
no text, no people. PNG-T.
```

#### W1 · `w_old_city_wall.png` (PNG-T)
```
A photorealistic 3D miniature of a section of an ancient golden-limestone
city wall with crenellations and one arched gate, a few cypress trees
outside, seen from 45 degrees above as a long ground tile. Only walls, no
religious buildings, no domes, no symbols, no people, no text. PNG-T.
```

#### D1 · `d_document_seal.png` (PNG-T)
```
A photorealistic 3D render of a formal 1960s typed document of several pages
on a dark wooden surface, with a blue wax seal and a fountain pen, seen from
45 degrees above. The typed lines are blurred and unreadable, no real words,
no logos. PNG-T.
```

#### R1 · `r_radio_set.png` (PNG-T)
```
A photorealistic 3D miniature of a 1960s military field radio set with a
handset on a coiled cord, dials and switches, olive metal case, seen from 45
degrees above. No text on the dials, no logos. PNG-T.
```

---

## B. Portraits (inside the cards on stands)

The reference's look is a framed portrait standing upright on the map, with a name plate. I build the frame, the stand
and the name plate (Hindi + English) in code, plus the "AI illustration" label. You make only the head-and-shoulders
picture: respectful, neutral, no caricature, in a **new chat** with this style line:

```
Photorealistic, respectful black-and-white portrait in the style of a 1960s
press photograph: natural skin texture, soft even studio light, calm
neutral expression, head and shoulders, facing the camera with a slight
three-quarter turn, plain mid-grey background. No text, no logos, no flags,
no insignia, no medals with symbols, no watermark.
```
(These have a plain grey background, not PNG-T: they sit inside a frame.)

| # | File | Person (as in 1967) | Used at |
|---|---|---|---|
| Q1 | `q_nasser.png` | Gamal Abdel Nasser, President of Egypt | Ch 2, Short 1 |
| Q2 | `q_eshkol.png` | Levi Eshkol, Prime Minister of Israel | Ch 3 |
| Q3 | `q_dayan.png` | Moshe Dayan, Defence Minister (eye patch on his left eye) | Ch 3 |
| Q4 | `q_hussein.png` | King Hussein of Jordan | Ch 6 |
| Q5 | `q_sharon.png` | Ariel Sharon, division commander | Ch 5 |
| Q6 | `q_u_thant.png` | U Thant, UN Secretary-General | Ch 2 (UNEF withdrawal) |

Example prompt for each (change the description):
```
A respectful black-and-white portrait of Gamal Abdel Nasser, President of
Egypt, as he looked in 1967: short dark hair, a dark suit and tie, calm
expression, head and shoulders, slight three-quarter turn.
```
- **Dayan:** "short dark hair, a black eye patch over his left eye, a plain military shirt without insignia".
- **Hussein:** "short dark hair, a neat moustache, a plain military jacket without insignia".
- **Sharon:** "short dark wavy hair, a plain military shirt without insignia".
- **Eshkol:** "white hair, round glasses, a dark suit".
- **U Thant:** "dark hair, round glasses, a dark suit".

**If GPT won't draw real people,** tell me. I'll use freely licensed or public-domain photos (Wikimedia Commons) and
credit them on screen.

**Captain Vijay Sachar** gets a **text-only** name card in Short 3 (no portrait), unless you find a photo we're free
to use.

---

## C. Breathers (replace the reference's archival photos; B&W, old-photo style, 16:9)

These are shown on a paper card with a white border (built in code) between map sequences, labelled **"AI
illustration"**. They must stay generic: no identifiable real people, no text, no flags, nothing graphic.

### Style Lock (paste once, new chat)
```
Black-and-white photograph in the style of 1960s war photojournalism, 16:9,
clean (no film grain), soft contrast, slightly faded,
documentary composition. No identifiable real people (figures small, from
behind or silhouetted), no text, no flags, no insignia, no logos, nothing
graphic: no bodies, no injuries, no blood.
```

| # | File | Scene | Used at |
|---|---|---|---|
| H1 | `h_reservists.png` | Civilians in work clothes boarding army trucks at dawn, bags over shoulders, seen from behind | Ch 3 |
| H2 | `h_airfield_smoke.png` | A distant desert airfield with columns of smoke on the horizon, empty runway in front | Short 2 |
| H3 | `h_tanks_dust.png` | A line of tanks crossing open desert, huge dust clouds, low sun | Ch 5 |
| H4 | `h_mountain_pass.png` | A narrow rocky desert pass crowded with abandoned trucks, seen from a ridge | Ch 5 (the retreat) |
| H5 | `h_stone_streets.png` | Narrow old stone streets with arches, soldiers as small figures far down the lane, from behind | Ch 6 |
| H6 | `h_golan_slope.png` | Steep basalt slopes with half-tracks climbing a dirt road, smoke on the ridge | Short 4 |
| H7 | `h_ships_lake.png` | Several old freighters at anchor on a wide flat lake, desert banks, total calm | Short 6 |
| H8 | `h_ships_party.png` | Sailors on deck playing a deck game between two moored freighters, small figures, cheerful | Short 6 (the "Olympics") |

---

## D. Opening desk diorama (frame 0 of the long video's chapter intro; 16:9)

The reference opens on a desk covered in old maps with small 3D tiles on it. Ours:

```
A photorealistic top-down-angled view (45 degrees) of an old wooden war-room
desk in warm low light: scattered yellowed paper maps of a desert region
(lines and shapes only, no readable words), a brass compass, a pair of field
binoculars, a pencil and a ruler, a coffee cup, and three small 3D miniature
tiles on the maps: a desert airfield with tiny jets, a short tank column, and
a small seaport. Shallow depth of field, cinematic, 16:9. No text, no flags,
no insignia, no weapons pointing, no people.
```
File: `x_desk_diorama.png` (16:9, not transparent).

---

## Priority

If you're short on time, these matter most:
- **Props:** J1, J3, A1, T1, T2, B1, S1, S3, U1
- **Portraits:** Q1–Q4
- **Breathers:** H3, H7
- **Diorama:** X

The rest can be drawn in code or skipped.
