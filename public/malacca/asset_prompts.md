# Malacca: asset prompts (photoreal 3D miniatures for the documentary map)

Same look as Aravalli: our charcoal documentary map of the Indian Ocean (India blue, China red, flat highlights, white
outlines), with **photoreal 3D props sitting on the map**, like a high-end game engine render (GTA VI / Unreal Engine 5):
a tilt-shift miniature, real materials, soft studio light. I place each prop at its real place on the map with a contact
shadow, so nothing floats.

The map, the countries, the straits, the routes, the port pins, the counters and the labels are all made by me in code.
**GPT never draws a map, a flag or any text.** No national markings on any ship or vehicle.

## How to generate (ChatGPT / GPT image)
- One image per message. Paste the **Style Lock** once at the top of the chat.
- Square, the biggest size GPT offers (2048 px or more if it can). `PNG-T` = a real transparent background (if you get
  a checkerboard or white, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."*,
  or use remove.bg / Photoroom).
- Name files exactly as listed, zip them, and share through Google Drive ("Anyone with the link").

### Style Lock (paste once)
```
You are generating production props for a premium 3D documentary Short about
the Indian Ocean, the Strait of Malacca and India's Andaman and Nicobar
Islands. Every image is a single photorealistic 3D-rendered miniature
object, like a high-end game engine render (Unreal Engine 5 / GTA VI
quality): physically based materials, real textures, soft large studio key
light from the upper left, gentle ambient occlusion, subtle tilt-shift
miniature feel. Camera: three-quarter view from about 45 degrees above, the
same angle for every prop, so they all sit on one tilted map. No text, no
letters, no numbers, no logos, no flags, no national markings, no hull
numbers, no watermark, no people unless asked. PNG-T means a fully
transparent background with a real alpha channel. Centre the subject with
generous empty padding. Keep a soft contact shadow directly under the object
only, no other background.
```

## The props

| # | File | Where it sits (VO) |
|---|---|---|
| A1 | `a_beach_island.png` | Andaman: the hook ("chhuttiyan manate ho") and the loop |
| T1 | `t_tanker.png` | the oil route: "China ka zyadatar tel guzarta hai", Malacca |
| W1 | `w_destroyer_grey.png` | the fleet duel "370 vs 140" (I colour-tag each side in code) |
| L1 | `l_lighthouse.png` | Indira Point: "Indira Point se Indonesia sirf 145 km" |
| C1 | `c_soldier.png` | the tri-service badge: Army |
| C2 | `c_warship_small.png` | the tri-service badge: Navy |
| C3 | `c_fighter_jet.png` | the tri-service badge: Air Force |
| P1 | `p_port_cranes.png` | String of Pearls: Gwadar, Hambantota, Kyaukpyu |
| P2 | `p_military_base.png` | Djibouti: "pehla videshi Military Base" |
| P3 | `p_pearl.png` | the String of Pearls title |
| D1 | `d_diamond.png` | the Necklace of Diamonds title |
| S1 | `s_carrier.png` | "2035 tak… kareeb 200 jahaaz" |

#### A1 · `a_beach_island.png` (PNG-T)
```
A photorealistic 3D miniature of a small tropical island from the Andaman
Islands: white sand beach, turquoise shallow water around it, tall leaning
coconut palms and dense green forest, a few rocks at the shore, seen from 45
degrees above, as a round island tile with clean water edges. No people, no
boats. PNG-T.
```

#### T1 · `t_tanker.png` (PNG-T)
```
A photorealistic 3D miniature of a very large crude oil tanker sailing
forward, dark red hull and black upper hull, white bridge superstructure at
the stern, pipelines on the long flat deck, a small white bow wave, three-
quarter view from 45 degrees above. No name, no markings, no flag. PNG-T.
```

#### W1 · `w_destroyer_grey.png` (PNG-T)
```
A photorealistic 3D miniature of a modern grey naval destroyer sailing
forward: angular stealth superstructure, a deck gun at the bow, a mast with
radars, a helicopter deck at the stern, a small white wake, three-quarter
view from 45 degrees above. Generic design, no hull number, no flag, no
markings. PNG-T.
```

#### L1 · `l_lighthouse.png` (PNG-T)
```
A photorealistic 3D miniature of a tall white and red striped lighthouse on
a small rocky tropical headland with a few palm trees and green scrub, seen
from 45 degrees above. No people, no text. PNG-T.
```

#### C1 · `c_soldier.png` (PNG-T)
```
A photorealistic 3D miniature figurine of a soldier in olive-green combat
uniform with a helmet, standing at attention, rifle held at his side, seen
from 45 degrees above, three-quarter view. No flag, no badges, no text.
PNG-T.
```

#### C2 · `c_warship_small.png` (PNG-T)
```
A photorealistic 3D miniature of a small grey naval patrol warship, sleek
and angular, sailing forward, three-quarter view from 45 degrees above.
Generic design, no markings, no flag. PNG-T.
```

#### C3 · `c_fighter_jet.png` (PNG-T)
```
A photorealistic 3D miniature of a grey multirole fighter jet in flight,
banking slightly, three-quarter view from 45 degrees above. Generic design,
no roundels, no markings, no flag. PNG-T.
```

#### P1 · `p_port_cranes.png` (PNG-T)
```
A photorealistic 3D miniature of a modern deep-sea container port: a
concrete quay with three tall ship-to-shore cranes, stacks of plain
coloured containers, a cargo ship moored alongside, seen from 45 degrees
above as a small square tile with water on one side. No text, no logos on
containers. PNG-T.
```

#### P2 · `p_military_base.png` (PNG-T)
```
A photorealistic 3D miniature of a fortified coastal military base in a dry
desert landscape: concrete walls, low barracks, a helipad, a small pier with
a grey ship, watchtowers, seen from 45 degrees above as a square tile. No
flags, no text. PNG-T.
```

#### P3 · `p_pearl.png` (PNG-T)
```
A photorealistic 3D render of a single large lustrous white pearl with soft
pink reflections, studio light, seen from slightly above. PNG-T.
```

#### D1 · `d_diamond.png` (PNG-T)
```
A photorealistic 3D render of a single brilliant-cut diamond with sharp
facets and rainbow light dispersion, studio light, seen from slightly above.
PNG-T.
```

#### S1 · `s_carrier.png` (PNG-T)
```
A photorealistic 3D miniature of a modern aircraft carrier with a ski-jump
bow ramp, a few grey fighter jets parked on the flight deck, sailing
forward with a white wake, three-quarter view from 45 degrees above.
Generic design, no hull number, no flag, no markings. PNG-T.
```

## Priority

If you're short on time, these 6 matter most: **A1, T1, W1, L1, P1, S1**. The tri-service badges (C1–C3) and the
pearl/diamond can be drawn in code if needed.
