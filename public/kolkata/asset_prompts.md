# Kolkata, three villages: asset prompts (Unreal Engine 5 look, built in parts)

Script: `public/kolkata/script_hindi.txt` (creator's final version, about 70 s).
Null's clip has its own file: `public/kolkata/omni_prompts.md`.

**What's new from this video on:**
1. **Look.** Every asset is an Unreal Engine 5 cinematic render: real materials, real light. No more glossy toy props.
2. **Parts.** Anything that moves is made in pieces, so I can rig it in Remotion and actually move it:
   - fort gates swing open
   - the deed unrolls
   - the charkha wheel spins
   - the gavel strikes
   - the ship's sails fill
   - taxi wheels turn

   It's the same idea as the dam gates in the Kalpasar reference.

## 0. Beat map (script → screen)

| Script | On screen | Assets |
|---|---|---|
| दुनिया इसे City of Joy कहती है… | Frame 0: satellite Kolkata, the Hooghly glowing, only "City of Joy". A UE5 street corner rises out of the map: a yellow taxi drives through (wheels turning) and a tram slides past | K1, K2, K3 |
| …तीन गाँव हुआ करते थे… 1,300 रुपये सालाना किराए पर | The city sinks away; three small villages rise on the riverbank. Coins drop one by one into a cloth pouch, and a "₹1,300 / साल" counter runs (code) | K4, K5 |
| …देश की राजधानी कैसे बन गए? | A question-mark glow over the three villages (code) | — |
| पहला गाँव था Sutanuti… सूत के गट्ठर… Shobhabazar और Chitpur | Pin on Sutanuti; a charkha wheel spins, and thread bales drop and stack. Ghost labels for today's areas (code) | K6, K7 |
| दूसरा था Gobindapur… Maidan और Fort William | Pin on Gobindapur; a calm village scene, then a ghost outline of today's fort over it (code) | K4 |
| और तीसरा था Kalikata… माँ काली… Central Kolkata | Pin on Kalikata; a Bengali temple with its bell swinging, lamp glow (code) | K8 |
| Hooghly के किनारे… व्यापार के लिए Perfect | A trading ship sails up the glowing Hooghly, its sails filling | K9 |
| 1698 में East India Company ने… Sabarna Roy Choudhury परिवार से… हक़ ले लिया | A deed unrolls, a quill writes, the wax seal stamps down, and two hands meet over it; the three villages get one border (code) | K10, K11 |
| फिर Fort William के लिए… पूरा Gobindapur ही खाली करा दिया | Gobindapur's huts lift off and fade, a family walks away with their bundles, the star fort rises, its gates swing shut and the cannon recoils | K4, K12, K13 |
| यहीं से तीनों गाँव एक शहर बने… British India की राजधानी | Three glows merge into one city; pull out to the India map (official boundary) and a crown settles on Calcutta | K14 |
| किताबों में लिखा गया… Job Charnock ने बसाया | An old history book opens; the page reads "Founder: Job Charnock" (text in code) | K15 |
| पर Calcutta High Court ने माना… बहुत पहले से रहते थे | The High Court building rises, a gavel strikes, a red ✗ lands on "Founder", and the three villages glow again | K16, K17 |
| मतलब, ये शहर किसी ने बसाया नहीं… ये हमेशा से यहीं था | Village → today's city morph on the same riverbank, warm golden light | K1, K4 |
| तो क्या यह बात आपको पता थी? भेजो… follow करो… | Split screen: map on top, Null below (about 6 s) | Null |

---

## 1. Read this first

**Maps are never AI.** Every map comes from Sentinel-2 satellite imagery (EOX, CC BY 4.0, credited) and Natural Earth. India always appears with its official boundary. Pins, labels, river glow, borders, counters and the ✗ are drawn in code.

**No text, numbers, letters, flags or logos in any image.** I add all the text myself.

**People:** every person is imagined, not a real person. Show the villagers, the zamindar and the boatmen with dignity: hardworking, proud, never poor-looking caricatures. The Gobindapur family leaving is sad and dignified, not pitiful.

**Religion:** for Kalikata we show the temple's architecture, the bell, flowers and lamps. Never a picture of Maa Kali herself.

### How to generate (4K)
- **Best: Gemini, Nano Banana Pro, resolution 4K.** Use **1:1** for props and **16:9** for wide scenes, as listed.
- **ChatGPT:** largest size; I upscale.
- **WHITE** = plain flat white background (#FFFFFF), no floor, no shadow on the background. I cut everything out and add the shadows in code.
- Download the full-size original, never a screenshot.
- Make 2–3 versions of each HERO and keep the best before you make its parts.
- Name the files exactly as listed. They go in `public/kolkata/img/`.

### Style Lock (paste once at the top of the chat)
```
You are generating production assets for a premium animated history Short
(vertical video) about how Kolkata, India grew from three riverside villages
in the 1690s. Every asset is a cinematic Unreal Engine 5 render: Lumen-style
global illumination, physically based materials with real surface detail
(weathered wood grain, hand-made brick, terracotta, woven cloth, aged brass,
wet mud, rope fibre), ray-traced soft shadows, subtle ambient occlusion,
crisp Nanite-level geometric detail, photoreal with a light stylised touch,
like a AAA game cinematic. Warm golden-hour key light from the top-left,
soft cool fill from the right. Camera: three-quarter view from about 30
degrees above, 50mm lens, everything sharply in focus, the whole object
inside the frame with a margin. Plain flat white background, no floor, no
ground shadow, no text, no letters, no numbers, no logos, no flags,
no watermark. Not cartoon, not clay, not plastic toy, not low-poly.
```

### How the PARTS work (do this for every asset marked PARTS)
1. Make the **HERO** first: the whole object, assembled.
2. In the same chat, for each part, send this, filling in the part:
```
Using the exact same object from the previous image, same camera angle, same
scale, same lighting and same position in the frame, render ONLY the
[PART] by itself on the plain white background. Everything else removed.
Keep the part exactly where it sits in the original image, at the same size.
```
3. Then make the **BASE** (the object with the moving parts taken away):
```
Using the exact same image, remove the [PARTS] completely and fill in what
would be behind them naturally (the empty doorway, the bare frame, the empty
mount). Same camera, scale, lighting and framing. Plain white background.
```
If a part comes out at a different size or angle, regenerate it. Matching is what lets me hinge it. I'll do the fine alignment in code.

---

## 2. Assets

### K1. Today's Kolkata street corner (16:9), PARTS
HERO:
```
A cinematic Unreal Engine 5 diorama of a classic Kolkata street corner on a
small square base of road and pavement: a yellow Ambassador-style taxi, a
blue-and-white tram on its tracks, old North-Kolkata style buildings with
green wooden shutters and wrought-iron balconies, a tea stall with clay
cups, hand-pulled rickshaw parked at the side, overhead tram wires, warm
evening light, slight haze. Lively but no people's faces in close-up.
```
PARTS: `k1_hero.png`, `k1_base.png` (no taxi, no tram), `k1_taxi_body.png` (taxi without wheels), `k1_taxi_wheel.png` (one wheel, seen straight from the side, on its own), `k1_tram.png` (whole tram on its own).

### K2. Yellow taxi side view (16:9), PARTS
A clean side view so the drive-through reads.
```
A yellow Ambassador-style Kolkata taxi in exact side profile, facing right,
chrome bumpers, black-and-yellow paint with light road dust, a roof carrier,
cinematic Unreal Engine 5 render, soft evening light.
```
PARTS: `k2_taxi_body.png` (no wheels), `k2_wheel.png` (one wheel, exact side view, centred).

### K3. Kolkata tram side view (16:9)
```
A classic Kolkata tram car in exact side profile, facing left, cream and
blue paint, wooden window frames, a roof pantograph, light wear and rust
streaks, cinematic Unreal Engine 5 render.
```
PARTS: `k3_tram.png`, `k3_pantograph.png` (the roof arm alone, same position).

### K4. A Bengal riverside village, 1690s (16:9), PARTS
One design, used three times (I tint it and change the layout per village). Make 2 variations.
```
A small Bengal riverside village of the 1690s on a floating chunk of earth
with a muddy riverbank edge: three thatched huts with curved Bengali
do-chala roofs, mud walls, bamboo fences, a big banyan tree, a few coconut
palms, a small wooden boat pulled up on the bank, clay pots, a haystack.
Peaceful, golden morning light, a little mist. Cinematic Unreal Engine 5
render.
```
PARTS: `k4_hero.png`, `k4_ground.png` (only the earth chunk, riverbank and boat, with no huts or trees), `k4_hut_a.png`, `k4_hut_b.png`, `k4_hut_c.png` (each hut alone), `k4_banyan.png` (the tree alone, so its canopy can sway), `k4_palm.png`.

### K5. Rent coins and pouch (1:1), PARTS
```
An old hand-stitched cloth money pouch with a drawstring, sitting open, and
a small heap of worn silver coins of the 1690s beside it, coins with blurred
worn faces and no readable text or symbols, aged brass and silver,
cinematic Unreal Engine 5 render.
```
PARTS: `k5_pouch.png` (the pouch alone, open), `k5_coin.png` (ONE coin alone, flat, seen from the front), `k5_coin_side.png` (one coin tilted at 45°).

### K6. Charkha spinning wheel (1:1), PARTS
```
A traditional Indian wooden charkha spinning wheel, hand-carved spokes,
worn wood, cotton thread running from the wheel to the spindle, a small
pile of raw cotton beside it, cinematic Unreal Engine 5 render.
```
PARTS: `k6_hero.png`, `k6_frame.png` (frame and stand, no wheel), `k6_wheel.png` (the wheel alone, seen straight on, centred, so I can spin it).

### K7. Thread bales (1:1), PARTS
```
Three bundles of handmade cotton yarn skeins, tied with jute rope, stacked
on top of each other, natural off-white and soft indigo-dyed colours,
visible fibre detail, cinematic Unreal Engine 5 render.
```
PARTS: `k7_bale_a.png`, `k7_bale_b.png`, `k7_bale_c.png` (each bale alone) so they can drop in and stack.

### K8. Bengali temple (1:1), PARTS
```
A small traditional Bengali aat-chala temple of terracotta brick with
curved layered roofs and carved terracotta panels, steps at the front,
marigold garlands hanging at the doorway, a brass bell hanging from a
wooden frame beside the steps, small clay lamps on the steps, a large
peepal tree behind. Seen from outside only, with the doorway softly dark.
Respectful, serene, golden light. Cinematic Unreal Engine 5 render.
```
PARTS: `k8_hero.png`, `k8_base.png` (no bell), `k8_bell.png` (the bell and its chain alone, same position, so it can swing).

### K9. East India Company-era trading ship (16:9), PARTS
```
A 17th-century merchant sailing ship (East Indiaman type), wooden hull with
a carved stern, three masts, cream canvas sails, rope rigging, sailing
to the right, seen from the side with a slight three-quarter angle, no
flags on the masts, no water. Cinematic Unreal Engine 5 render.
```
PARTS: `k9_hero.png`, `k9_hull.png` (hull, masts and rigging, no sails), `k9_sails_fore.png`, `k9_sails_main.png`, `k9_sails_mizzen.png` (each mast's sails alone) so they can fill with wind.

### K10. The 1698 deed (16:9), PARTS
```
An old 17th-century land deed: a long sheet of aged handmade paper rolled
on two dark wooden rods, shown half unrolled and lying flat, faint
unreadable ink marks that look like handwriting (no real letters), a red
wax seal at the bottom, a feather quill and a brass ink pot beside it.
Cinematic Unreal Engine 5 render, warm candlelight.
```
PARTS: `k10_paper.png` (the open paper sheet alone, flat, no rods), `k10_rod_top.png` and `k10_rod_bottom.png` (each rolled rod alone), `k10_seal.png` (wax seal alone), `k10_quill.png` (quill alone, tip at the bottom left), `k10_inkpot.png`.

### K11. Two hands over the deed (16:9), PARTS
```
Two hands reaching in from opposite sides to shake: on the left, a Bengali
zamindar's hand of the 1690s with a gold ring and the edge of a fine white
muslin sleeve with gold border; on the right, an English merchant's hand
with a white lace cuff and dark blue coat sleeve. Respectful, equal,
cinematic Unreal Engine 5 render, dramatic warm light.
```
PARTS: `k11_hand_left.png`, `k11_hand_right.png` (each hand alone, same angle, about to meet).

### K12. Fort William, star fort (16:9), PARTS
```
An 18th-century star-shaped British artillery fort on flat green ground by
a river, low thick brick and stone walls with angled bastions, a moat, a
grand arched main gate with two heavy wooden doors, a few cannons on the
walls, barracks roofs inside. Seen from three-quarter above. No flags.
Cinematic Unreal Engine 5 render, dusty golden light.
```
PARTS: `k12_hero.png`, `k12_base.png` (gateway empty, doors removed, dark passage behind), `k12_door_left.png` and `k12_door_right.png` (each door alone, closed position), `k12_cannon_carriage.png` and `k12_cannon_barrel.png` (one cannon split in two so the barrel can recoil).

### K13. Gobindapur family leaving (16:9), PARTS
```
A Bengal village family of the 1750s walking away along a dirt path,
seen from behind at three-quarter: a father carrying a cloth bundle on his
shoulder, a mother carrying a brass pot and holding a child's hand, an old
grandmother with a walking stick. Simple cotton dhoti and saris, dignified,
quiet sadness, soft evening light. Cinematic Unreal Engine 5 render.
```
PARTS: `k13_father.png`, `k13_mother_child.png`, `k13_grandmother.png` (each figure alone, same scale) so they can walk off in a staggered line.

### K14. Crown on a cushion (1:1), PARTS
```
An ornate 18th-century European royal crown of gold with red velvet and
pearls, sitting on a deep red velvet cushion with gold tassels,
cinematic Unreal Engine 5 render, dramatic top light.
```
PARTS: `k14_crown.png`, `k14_cushion.png`.

### K15. Old history book (16:9), PARTS
```
An old thick history book with a worn brown leather cover and gold-tooled
edges, lying open flat on its spine, aged cream pages that are completely
BLANK (no text), slight page curl. Cinematic Unreal Engine 5 render.
```
PARTS: `k15_open.png` (open, blank pages), `k15_closed.png` (the same book closed, front cover up, same scale).

### K16. Calcutta High Court building (16:9)
```
A grand red-brick Gothic Revival court building in Kolkata, inspired by the
Calcutta High Court, with pointed arches, a tall central clock tower, stone
trim and arcades, on a small square base of lawn, seen from three-quarter
above. No text or signs. Cinematic Unreal Engine 5 render, morning light.
```
File: `k16_court.png`.

### K17. Judge's gavel (1:1), PARTS
```
A polished dark wooden judge's gavel with a brass band, and its round
wooden sound block, cinematic Unreal Engine 5 render, dramatic side light.
```
PARTS: `k17_gavel.png` (gavel alone, lying flat, head on the left), `k17_block.png` (block alone).

---

## 3. Checklist

17 assets: K1–K17, with their parts.

What I draw in code:
- maps, river glow, village pins and labels
- the ₹1,300 counter, the merging glows, the India boundary
- the ✗, the book text, light sweeps
- dust, smoke, water ripples and shadows

Send the images as a zip together with the VO and the Null clip.
