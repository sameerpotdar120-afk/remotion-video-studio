# Aravalli: asset prompts (photoreal 3D miniatures for the 3D map)

The look you asked for: our charcoal documentary map, with the Aravalli in real 3D (built from elevation data), and
**photoreal 3D props sitting on that map**, like a high-end game engine render (GTA VI / Unreal Engine 5 quality): a
tilt-shift miniature diorama, real materials, soft studio light. I place each prop ON the 3D terrain at its real
place, matched to the camera, with a contact shadow, so nothing floats.

The terrain, the mountains, the Thar, the borders, the labels, the counters and the 100 m measuring line are all built
by me in code. **GPT never draws a map or any text.**

## How to generate (ChatGPT / GPT image)
- One image per message. Paste the **Style Lock** once at the top of the chat.
- Square, the biggest size GPT offers (2048 px or more if it can). `PNG-T` = a real transparent background (if you get
  a checkerboard or white, reply: *"Regenerate with a truly transparent alpha background, not a drawn checkerboard."*,
  or use remove.bg / Photoroom).
- Name files exactly as listed, zip them, and share through Google Drive ("Anyone with the link").

### Style Lock (paste once)
```
You are generating production props for a premium 3D documentary Short about
the Aravalli mountain range in India. Every image is a single photorealistic
3D-rendered miniature object, like a high-end game engine render (Unreal
Engine 5 / GTA VI quality): physically based materials, real textures, soft
large studio key light from the upper left, gentle ambient occlusion, subtle
tilt-shift miniature feel. Camera: three-quarter view from about 45 degrees
above, the same angle for every prop, so they all sit on one tilted map.
No text, no letters, no numbers, no logos, no flags, no watermark, no people
unless asked. PNG-T means a fully transparent background with a real alpha
channel. Centre the subject with generous empty padding. Keep a soft contact
shadow directly under the object only, no other background.
```

## The props

| # | File | Where it sits (VO) |
|---|---|---|
| R1 | `r_rashtrapati_bhavan.png` | Raisina Hill, Delhi: the hook and the loop ("राष्ट्रपति भवन एक पहाड़ पर खड़ा है") |
| R2 | `r_raisina_rock.png` | under R1 for the close-up: the rocky ridge it stands on |
| M1 | `m_quarry_pit.png` | Rajasthan: "Kaaran, Mining" (31 hills gone) |
| M2 | `m_excavator.png` | on the quarry rim |
| M3 | `m_dump_truck.png` | driving out of the quarry |
| D1 | `d_dust_wall.png` | a gap in the range: "Thar ki dhool aage badhti hai" |
| H1 | `h_hill_green.png` | the "12,000 hills" field: one Aravalli hill, many times |
| H2 | `h_hill_grey.png` | the same hill, greyed out (below 100 m) |
| C1 | `c_supreme_court.png` | New Delhi: the 2018 report and the 2025 definition |
| C2 | `c_gavel.png` | "Court ne apna hi Decision rok diya" |

#### R1 · `r_rashtrapati_bhavan.png` (PNG-T)
```
A photorealistic 3D miniature of Rashtrapati Bhavan in New Delhi: the long
red and cream sandstone palace with its great central copper-green dome and
colonnaded front, the forecourt in front, a few trees, seen from 45 degrees
above in three-quarter view. Real sandstone texture, warm late-afternoon
light. No people, no vehicles, no flag. PNG-T.
```

#### R2 · `r_raisina_rock.png` (PNG-T)
```
A photorealistic 3D miniature of a low rocky ridge: weathered grey quartzite
rock outcrops, dry thorny scrub and patches of green grass, a flat top where
a building could sit, seen from 45 degrees above. Like a slice of terrain cut
out of the earth with clean vertical edges showing layered rock strata.
PNG-T.
```

#### M1 · `m_quarry_pit.png` (PNG-T)
```
A photorealistic 3D miniature of an open-pit stone quarry cut into a green
rocky hill: stepped grey-brown benches, raw broken rock, dust, a dirt ramp
spiralling down, the remaining half of the hill still green with scrub. Seen
from 45 degrees above. PNG-T.
```

#### M2 · `m_excavator.png` (PNG-T)
```
A photorealistic 3D miniature of a yellow hydraulic excavator digging into
rock, arm extended, bucket full of broken stone, dust on the tracks. Generic
design, no brand name or logo. Seen from 45 degrees above. PNG-T.
```

#### M3 · `m_dump_truck.png` (PNG-T)
```
A photorealistic 3D miniature of a heavy tipper dump truck loaded with broken
grey stone, dusty, driving forward, three-quarter front view from 45 degrees
above. Generic design, no brand name, no number plate text. PNG-T.
```

#### D1 · `d_dust_wall.png` (PNG-T)
```
A photorealistic 3D miniature of a wall of desert dust and sand blowing
forward, billowing tan-orange clouds with fine sand streaming at the base,
moving from left to right, seen from 45 degrees above. Volumetric, soft
edges fading to fully transparent. PNG-T.
```

#### H1 · `h_hill_green.png` (PNG-T)
```
A photorealistic 3D miniature of a single small Aravalli hill: a low rounded
rocky hill with green grass and scrub on its slopes and grey rock showing at
the top, as a small round terrain tile, seen from 45 degrees above. PNG-T.
```

#### H2 · `h_hill_grey.png` (PNG-T)
```
The same small rocky hill as before, identical shape and angle, but
completely desaturated grey like unpainted clay, as if it no longer counts.
PNG-T.
```

#### C1 · `c_supreme_court.png` (PNG-T)
```
A photorealistic 3D miniature of the Supreme Court of India building in New
Delhi: the white and red sandstone building with its central dome and the
long wings, lawns in front, seen from 45 degrees above in three-quarter view.
No people, no text, no emblem. PNG-T.
```

#### C2 · `c_gavel.png` (PNG-T)
```
A photorealistic 3D render of a dark polished wooden judge's gavel resting on
its round sound block, studio light, seen from 45 degrees above. PNG-T.
```

## Priority

If you're short on time, these 5 matter most: **R1, M1, M2, D1, C1**. H1/H2 I can build in code from the terrain if
needed.
