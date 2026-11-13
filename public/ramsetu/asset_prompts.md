# Ram Setu: asset prompts (GPT images, Mumbai look)

Same look as the "every second" re-edit and the Mumbai reel: premium glossy 3D miniatures. Maps, India's official
boundary, the Setu line, labels, counters and captions are drawn in code.

## 1. Read this first

**1. GPT never draws a map.** The satellite map, Pamban island, the Setu line and the cross-section are built in code
(EOX Sentinel-2, AWS terrain, Natural Earth India edition, credited on screen).

**2. No text, numbers, letters, flags or logos in any image.** "राम" on the floating stones, "1480", "1964", "29 km",
every label and every number are drawn in code, so they stay sharp and correctly spelled.

**3. Devotion and respect.** Shri Ram, Nal and the Vanar Sena are shown the way a devotee would want them shown:
dignified, divine, warm light, never cartoonish or comic. The 1964 victims are shown only through the train and the
ruins, never as bodies.

**4. One look.** Glossy 3D miniatures, like a high-end diorama: soft studio light from the top-left, rich realistic
materials, no outlines. Make each group in the same chat.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the top of each chat.
- Use the biggest size GPT offers in that shape: square for props, wide for wide items, tall for scenes. 2048 px or more
  if it can.
- `PNG-T` = real transparent background. If you get a checkerboard or white background, reply: *"Regenerate with a
  truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000), for glow and storm effects.
- Name files exactly as listed, zip them, and share the zip through Google Drive ("Anyone with the link").

### Reused from "every second" (no need to make again)
`l_storm_cloud` (storm), `l_satellite` (the ISRO/NASA laser beat), `d_diya` (the faith side of the science-vs-faith card).

### Style Lock (paste once at the top of each chat)
```
You are generating production assets for a premium animated map documentary
(vertical 9:16 Short, satellite map look, like a high-end After Effects +
GeoLayers geography video). The story is Ram Setu, the chain of shoals between
Dhanushkodi in India and Mannar in Sri Lanka: the Ramayana's account of Shri
Ram's Vanar Sena building the Setu, and the 1964 cyclone that destroyed
Dhanushkodi. Every prop and figure is a premium glossy 3D miniature, like a
high-end diorama model: soft warm studio light from the top-left, rich
realistic materials, subtle reflections, fine detail, no outlines, no cartoon
line work. Divine and devotional figures are shown with reverence, dignity and
grace, in traditional Indian devotional art proportions, never comic or
cartoonish. No text, no letters, no numbers, no flags, no logos, no watermark,
no signature, no frame or border. When I say PNG-T, the background must be
fully transparent (real alpha channel). When I say BLACK, the background must
be pure flat black #000000. Centre the subject with generous empty padding. Do
not add glow or drop shadows; those are added later in the video editor.
```

## 2. Beat map (VO → screen → asset)

| VO | On screen | Assets |
|---|---|---|
| Tum Ram Setu par chalkar Sri Lanka tak ja sakte the… 1480 tak. | Frame 0: satellite low over the shoals; glowing footprints walk the line toward Sri Lanka; the palm-leaf record unrolls, "1480" | P1 |
| Phir ek toofan ne ise tod diya, aur 1964 mein… Kaise? | The storm sweeps in, waves break over the line, footprints wash away; the cyclone spiral flashes, "1964", big "?" | l_storm_cloud, C1, C3 |
| Ye hai Bharat ka aakhri sira, Dhanushkodi… dhanush ki nok se Setu ko toda tha. | India rises as the red slab, zoom to Dhanushkodi; Shri Ram stands on the shore; the golden bow's tip touches the water and a ripple of light runs out | F1, F2 |
| Yahin se Mannar tak… Palk ki khaadi, Mannar ki khaadi, aur beech mein Ram Setu. | The gold Setu line draws to Mannar; the two bays labelled; Rameswaram temple pops on Pamban island | T1 |
| Aastha kehti hai… Nal… patthar tairne lagte the… Ram naam likhkar, paanch din mein… | Nal places a stone; stones float on the water, "राम" glowing on each (code); the Vanar Sena wide scene builds the Setu across the sea, day counter 1→5 | F3, F4, F5 |
| Sita Maa ko wapas laane ke liye. | Sita Maa in Ashok Vatika, far across the water, soft light | F6 |
| Angrezon ke nakshon mein… Adam's Bridge. Par hamare liye… Ram Setu tha, hai, aur rahega. | An old British chart page slides in (code), "Adam's Bridge" crossed by a saffron "राम सेतु" stamp; Null A | (code), null_rs_A |
| Phir 2024 mein ISRO… 29 km… 99.98%… 8 meter upar | The satellite glides over, laser pulses scan the line; "48" crossed, "29 km"; 3D cross-section of the ridge | l_satellite |
| Ye choona-patthar aur ret ke teele hain… | Cross-section labels: limestone, sand | (code) |
| Vigyan ne… naapi hai… Par aastha ke liye… | Split card: science (satellite, blue) / faith (diya and floating stone, saffron); Null B | d_diya, F4, null_rs_B |
| Dhanushkodi… 22 December 1964 ki raat, ek chakravaat… | Night grade; the cyclone spiral over Pamban | C1 |
| 115 logon se bhari ek poori train samundar mein beh gayi… 1,800… | The steam train on the line; the giant wave rolls in and the train is gone; quiet counters | C2, C3 |
| Sarkar ne… toota church, toota station, aur kuch machhuaare parivaar. | Dawn grade; the ruined church, the ruined station, the fisher family with their boat | R1, R2, R3 |
| Samundar ne shehar ko mita diya, par Setu ko nahi mita paaya. | The ruins fade; the Setu line glows gold under the water | (code) |
| …29 km ki lakeer chupchaap leti hai. Kehte hain, kabhi… | Back to frame 0, footprints appearing again (loop) | (code) |

## 3. GPT asset prompts

### F. The Ramayana (same chat)

#### F1 · `f_shri_ram.png` (tall, PNG-T)
```
A reverent, glossy 3D miniature figure of Bhagwan Shri Ram standing on a
sandy shore, facing three-quarters right towards the sea: serene, divine face
with a gentle smile, blue-tinged complexion, a golden crown (mukut), saffron
and yellow dhoti and angavastram, a garland, a quiver of arrows on his back,
holding his tall golden bow upright in his left hand. Dignified, graceful,
devotional, warm divine light. PNG-T, transparent background.
```

#### F2 · `f_golden_bow.png` (tall, PNG-T)
```
A glossy 3D miniature of a divine golden bow (dhanush), tall and gracefully
curved, ornate engraved gold with small red gemstones at the grip, a taut
golden string, standing upright at a slight tilt. Majestic, sacred. PNG-T,
transparent background.
```

#### F3 · `f_nal.png` (square, PNG-T)
```
A reverent glossy 3D miniature figure of Nal, the vanar architect of the
Ramayana: a strong, wise vanar with a calm focused face, wearing a simple
dhoti and armbands, kneeling at the water's edge and gently placing a large
grey stone onto the surface of the sea, which floats. Dignified, divine
warm light. PNG-T, transparent background.
```

#### F4 · `f_floating_stone.png` (square, PNG-T)
```
A glossy 3D miniature of a single rough grey stone floating on a small patch
of calm turquoise water, gentle ripples around it, a soft golden glow on its
flat top face (left blank for writing to be added later). No text. PNG-T,
transparent background.
```

#### F5 · `f_vanar_sena.png` (wide, PNG-T)
```
A wide, reverent glossy 3D miniature diorama of the Vanar Sena building Ram
Setu across the sea: dozens of vanars in a long line passing large grey
stones hand to hand and placing them on the water, the stone path stretching
from the shore towards the horizon, a few vanars carrying stones on their
shoulders, gentle waves, warm golden morning light. Heroic, devotional, full
of energy. No text. PNG-T, transparent background.
```

#### F6 · `f_sita_vatika.png` (square, PNG-T)
```
A reverent glossy 3D miniature of Sita Maa seated in Ashok Vatika beneath an
Ashoka tree with red-orange blossoms: a serene, graceful face looking into the
distance with quiet hope, a simple yellow saree, soft divine light. Dignified
and devotional. PNG-T, transparent background.
```

### P, T. The temple and its record (same chat)

#### P1 · `p_palm_leaf.png` (wide, PNG-T)
```
A glossy 3D miniature of an old palm-leaf manuscript bundle, partly unrolled:
long golden-brown palm leaves strung on a cord between two carved wooden
covers, the leaves showing only faint unreadable etched lines (no readable
script). PNG-T, transparent background.
```

#### T1 · `t_rameswaram_temple.png` (square, PNG-T)
```
A glossy 3D miniature of a grand South Indian Dravidian temple inspired by
Rameswaram's Ramanathaswamy temple: a tall, richly carved gopuram tower in
warm sandstone colours, a long pillared corridor at its base, a small temple
tank in front. Majestic and sacred, warm light. PNG-T, transparent background.
```

### C. The 1964 cyclone (same chat)

#### C1 · `c_cyclone.png` (square, PNG-T)
```
A top-down view of a powerful tropical cyclone over a dark sea: a tight
spiral of white and grey cloud bands with a clear eye in the centre, dramatic
and ominous, the edges fading to transparent. PNG-T, transparent background.
```

#### C2 · `c_steam_train.png` (wide, PNG-T)
```
A glossy 3D miniature of a 1960s Indian Railways metre-gauge steam
locomotive pulling four old maroon passenger carriages, side view facing
left, smoke rising from the chimney, warm lit windows. No text, no numbers,
no logos. PNG-T, transparent background.
```

#### C3 · `c_giant_wave.png` (wide, PNG-T)
```
A huge dark storm wave curling and about to crash, deep blue-grey water with
white foam crest and spray, side view moving to the left, dramatic and
powerful. PNG-T, transparent background.
```

### R. Dhanushkodi today (same chat)

#### R1 · `r_ruined_church.png` (square, PNG-T)
```
A glossy 3D miniature of the ruined church of Dhanushkodi: a roofless coral-
stone and brick church with an arched doorway and arched windows, crumbling
walls, sand drifted against its base, a few shrubs. Quiet, haunting, soft
dawn light. PNG-T, transparent background.
```

#### R2 · `r_ruined_station.png` (square, PNG-T)
```
A glossy 3D miniature of a ruined old railway station: broken brick walls,
an empty doorway, a rusted water tank on stone pillars beside it, sand
covering the old platform, no tracks left. Quiet and haunting, soft dawn
light. No signboards, no text. PNG-T, transparent background.
```

#### R3 · `r_fisher_family.png` (wide, PNG-T)
```
A glossy 3D miniature of a Tamil fishing family on a sandy shore beside their
small wooden fishing boat: a father mending a net, a mother in a bright
cotton saree carrying a basket, a child sitting on the boat's edge. Warm,
dignified, resilient, not poor or pitiful. Natural proportions. PNG-T,
transparent background.
```

## 4. What I do with them

- Clean edges, upscale to 4K where needed, cut out anything that comes with a background.
- Bring each one to life: footprints glow and wash away, the bow's tip sends a ripple of light, stones bob on the water
  with "राम" glowing on them, the Vanar Sena line builds across the sea, the cyclone spins, the wave rolls over the train,
  the diya flickers.
- Studio slab highlights: red for India, blue for Sri Lanka, yellow for Pamban island, gold for the Setu line.
- A living camera all the way through, and the 4K60 anti-ants render.
- 16 new images. If you're short on time, these 10 matter most: F1, F2, F4, F5, T1, P1, C1, C2, C3, R1.
