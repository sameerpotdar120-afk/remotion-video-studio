# "Every second" re-edit: asset prompts (GPT images, Mumbai look)

The VO stays the same (`audio/vo.mp3`, 62.2 s) and so do the two Null clips. Every prop that was drawn in code gets
replaced by your GPT images, in the same "glossy 3D miniature" look as the Mumbai reel. The satellite map, counters,
labels, captions and camera stay in code, now with the studio red/blue slab highlights, a moving camera and motion blur.

## 1. Read this first

**1. GPT never draws a map.** The world map and India's official boundary stay in code.

**2. No text, numbers, letters, flags or logos in any image.** No Google, Gmail, UPI, PhonePe, GPay, Paytm or NASA marks.
"4", "40 लाख", "9,500", "44", "₹", every label and every number are drawn in code.

**3. Respect.** The two people who die each second are shown only as a lit diya (D1). No bodies, graves or skulls.

**4. One look.** Premium glossy 3D miniatures, like a high-end diorama: soft studio light from the top-left, rich
realistic materials, no outlines, no cartoon line work. People are stylised 3D miniature figurines with natural
proportions, never caricatures. Make each group in the same chat so the look stays consistent.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the top of each chat.
- Use the biggest size GPT offers in that shape: square for props, wide (landscape) for wide items, tall (portrait) for
  scenes. If it can give 2048 px or more, use that. I upscale and clean the edges for 4K.
- `PNG-T` = real transparent background. If you get a checkerboard or white background, reply: *"Regenerate with a
  truly transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- `BLACK` = pure black background (#000000), for light, lightning and glow effects.
- Make 2–3 versions of each and send the best. Name files exactly as listed. Send them as one zip.

### Style Lock (paste once at the top of each chat)
```
You are generating production assets for a premium animated map video
(vertical 9:16 Short, satellite world-map look, like a high-end After
Effects + GeoLayers geography video). The story is everything that happens
on Earth in a single second: babies born, emails sent, payments made,
lightning, oil burned, light circling the planet, Earth racing around the
Sun. Every prop is a premium glossy 3D miniature, like a high-end diorama
model: soft studio light from the top-left, rich realistic materials, subtle
reflections, fine detail, no outlines, no cartoon line work. People are
stylised 3D miniature figurines with natural proportions and warm, dignified
expressions, never caricatures. No text, no letters, no numbers, no flags,
no logos, no brand marks, no watermark, no signature, no frame or border.
When I say PNG-T, the background must be fully transparent (real alpha
channel). When I say BLACK, the background must be pure flat black #000000.
Centre the subject with generous empty padding. Do not add glow or drop
shadows; those are added later in the video editor.
```

## 2. Beat map (VO → screen → asset)

| Time | VO | On screen | Assets |
|---|---|---|---|
| 0:00 | एक सेकंड पर तुम कभी ध्यान नहीं देते। | Visual hook: the chrome stopwatch slams in and ticks exactly one second with a hard tick; next to it the "तुम" figurine scrolls a phone, not noticing; the world map breathes behind | A1, A2 |
| 0:02 | पर इसी एक सेकंड में 4 बच्चे पैदा होते हैं, | The camera whips out; 4 babies drop onto the map with a pop each, on the beat of the counter; India glows red | B1, B2 |
| 0:06 | और धरती 30 किलोमीटर आगे निकल जाती है। | The Earth miniature shoots along a glowing orbit line with a speed streak, "30 KM" | S1, S3 |
| 0:09 | और क्या होता है? | Big "?" punch, quick whip back to the map | (code) |
| 0:11 | हर सेकंड… 4 बच्चे… 2 लोग दुनिया छोड़ जाते हैं। | Babies pop across Asia and Africa (blue slabs); two diyas light softly | B1, B2, D1 |
| 0:17 | भारत में? करीब हर डेढ़ सेकंड में एक बच्चा। | Push into India (red slab rises); the mother with her newborn pops in, warm light | B3 |
| 0:21 | इसी सेकंड… 40 लाख emails… | Pull out; winged envelopes fly in streams across the map; the mail burst explodes | E1, E2 |
| 0:25 | Google पर 1 लाख से ज़्यादा searches | A big glossy magnifying glass sweeps over the map with a scan glow | E3 |
| 0:28 | भारत अकेले करीब 9,500 UPI payments | Push into India; phones pop up all over with green ticks; gold coins rain with "₹" drawn on them; counter to 9,500 | E4, E5 |
| 0:33 | धरती पर करीब 44 बार बिजली गिरती है। | Storm clouds slide in; lightning cracks across continents with flashes and shake | L1, L2 |
| 0:36 | पुरानी किताबें 100 कहती थीं… satellites ने गिना: करीब 44। | The old book opens, "100" in it, crossed out; the satellite glides over, "44" stamps | L3, L4 |
| 0:41 | दुनिया करीब 1,200 बैरल तेल जला देती है, | Oil barrels with fire pop over the oil regions (blue slabs); a pump jack nods | O1, O2 |
| 0:45 | और करीब 1,200 टन CO2… | Dark smoke clouds rise and drift across the map | O3 |
| 0:49 | रोशनी धरती के साढ़े 7 चक्कर… | Into space: starfield, the Earth turns, a light beam whips around it 7½ times | S1, S3, S4 |
| 0:53 | और तुम? | The "तुम" figurine again, now looking up | A3 |
| 0:54 | तुम भी धरती के साथ, सूरज के चारों ओर, 30 km आगे | Wide space: the Sun blazes, the Earth races along its orbit with a speed streak | S1, S2, S3, S4 |
| 0:59 | ये सब हुआ। और फिर भी… | Every prop from the video flashes past in a quick montage, back to the stopwatch at frame 0 (loop) | (all) |

## 3. GPT asset prompts

### A. The hook (same chat)

#### A1 · `a_stopwatch.png` (square, PNG-T)
```
A premium glossy 3D miniature of a classic chrome mechanical stopwatch,
face-on, slightly tilted, polished silver body, a crown button on top, a
white enamel dial with plain tick marks only (no numbers, no letters), a
single thin red second hand pointing at the top. Crisp reflections.
PNG-T, transparent background.
```

#### A2 · `a_you_phone.png` (square, PNG-T)
```
A glossy 3D miniature figurine of a young Indian person in casual modern
clothes (hoodie, jeans, sneakers), standing relaxed and scrolling a
smartphone, completely absorbed in it. The phone screen is a plain soft
glow with nothing on it. Friendly, relatable, natural proportions.
PNG-T, transparent background.
```

#### A3 · `a_you_lookup.png` (square, PNG-T)
```
The same young Indian figurine as before, same clothes and scale, now
holding the phone lowered at the side and looking up in wonder, mouth
slightly open, as if suddenly noticing something huge in the sky.
PNG-T, transparent background.
```

### B. Births (same chat)

#### B1 · `b_baby_1.png` (square, PNG-T)
```
A glossy 3D miniature of a newborn baby sleeping peacefully, wrapped in a
soft pastel blue swaddle blanket with a tiny knitted cap, rosy cheeks,
eyes closed, a tiny content smile. Adorable but realistic, not cartoon.
PNG-T, transparent background.
```

#### B2 · `b_baby_2.png` (square, PNG-T)
```
A glossy 3D miniature of a newborn baby wrapped in a soft pastel pink
swaddle blanket, awake with big curious eyes and one tiny hand out of the
blanket. Same style and scale as the previous baby. PNG-T, transparent
background.
```

#### B3 · `b_mother_india.png` (square, PNG-T)
```
A glossy 3D miniature figurine of a young Indian mother in a soft saree,
gently cradling her newborn baby wrapped in a cream swaddle, looking down
at the baby with a warm loving smile, a small bindi. Tender, dignified,
natural proportions. PNG-T, transparent background.
```

#### D1 · `d_diya.png` (square, PNG-T)
```
A glossy 3D miniature of a single traditional clay diya with a calm, gentle
flame, a soft warm glow on the clay rim. Quiet, respectful, peaceful.
PNG-T, transparent background.
```

### E. The digital second (same chat)

#### E1 · `e_envelope.png` (square, PNG-T)
```
A glossy 3D miniature of a white paper envelope with a small red wax
seal, flying with two small white feathered wings, slight motion tilt to
the right. No stamps, no writing, no logo. PNG-T, transparent background.
```

#### E2 · `e_mail_burst.png` (wide, PNG-T)
```
A dynamic burst of dozens of small white envelopes flying outward from the
centre in every direction, some tumbling, varied sizes for depth, a few
slightly motion-blurred. No writing, no logos. PNG-T, transparent
background.
```

#### E3 · `e_magnifier.png` (square, PNG-T)
```
A premium glossy 3D miniature magnifying glass with a polished gold rim
and a dark walnut handle, the lens clear with a soft blue-white reflection,
tilted at 30 degrees. PNG-T, transparent background.
```

#### E4 · `e_phone_paid.png` (square, PNG-T)
```
A glossy 3D miniature modern smartphone standing upright at a slight angle,
the screen showing only a big bright green circle with a white tick mark
in the centre on a clean white background (a payment success screen, no
text, no logo, no app name). PNG-T, transparent background.
```

#### E5 · `e_coin.png` (square, PNG-T)
```
A glossy 3D miniature of a single shiny gold coin standing on its edge at a
slight angle, smooth plain face with a raised rim, no symbol, no numbers,
no text. PNG-T, transparent background.
```

### L. Lightning (same chat)

#### L1 · `l_storm_cloud.png` (wide, PNG-T)
```
A glossy 3D miniature of a dark, dramatic thunderstorm cloud, deep blue-grey
billowing shapes, lit from inside with a faint electric blue glow, a few
rain streaks falling below. PNG-T, transparent background.
```

#### L2 · `l_bolt.png` (tall, BLACK)
```
A single bright, branching lightning bolt striking downward, electric
white-blue core with a soft violet glow, sharp jagged branches, on a pure
black #000000 background.
```

#### L3 · `l_old_book.png` (square, PNG-T)
```
A glossy 3D miniature of an old leather-bound science book lying open, aged
yellowed pages showing only blurred, unreadable grey lines and a small
faded weather diagram (no readable text), a ribbon bookmark. PNG-T,
transparent background.
```

#### L4 · `l_satellite.png` (wide, PNG-T)
```
A glossy 3D miniature of a modern Earth-observation satellite with two
large blue solar panel wings, a gold-foil wrapped body and a small sensor
dish pointing down, three-quarter view. No flags, no logos, no text.
PNG-T, transparent background.
```

### O. Oil and CO2 (same chat)

#### O1 · `o_barrel_fire.png` (square, PNG-T)
```
A glossy 3D miniature of a dark blue steel oil barrel with two raised
rings, a few oily drips down the side, bright orange flames and a little
black smoke rising from its open top. No labels, no text. PNG-T,
transparent background.
```

#### O2 · `o_pumpjack.png` (square, PNG-T)
```
A glossy 3D miniature of an oil pump jack (nodding donkey) on a small patch
of dry desert ground, painted dark grey and yellow, side view. No text, no
logos. PNG-T, transparent background.
```

#### O3 · `o_co2_cloud.png` (wide, PNG-T)
```
A thick, heavy cloud of dark grey-brown smoke billowing upward and drifting
to the right, soft volumetric edges fading to transparent, slightly
menacing. PNG-T, transparent background.
```

### S. Space (same chat)

#### S1 · `s_earth.png` (square, PNG-T)
```
A premium glossy 3D miniature of planet Earth, realistic blue oceans and
white swirling clouds, the Indian subcontinent clearly facing the viewer,
a thin glowing blue atmosphere rim, lit from the top-left with a soft
night side on the right. PNG-T, transparent background.
```

#### S2 · `s_sun.png` (square, BLACK)
```
A blazing sun, huge and close, swirling orange, yellow and white plasma,
bright corona and solar flares, on a pure black #000000 background.
Cinematic, no lens-flare streaks, no text.
```

#### S3 · `s_light_streak.png` (wide, BLACK)
```
A fast streak of pure white-blue light flying horizontally from left to
right, very bright sharp head on the right, a long soft glowing tail
fading to the left, on a pure black #000000 background.
```

#### S4 · `s_stars.png` (tall, no transparency)
```
A deep space starfield filling the whole frame: thousands of small sharp
stars of varied brightness, a faint soft violet-blue nebula haze across
the upper third, mostly dark, evenly spread. No planets, no text.
```

## 4. What I do with them

- Clean edges, upscale to 4K where needed, and cut out anything that comes with a background.
- Pop each prop onto the map with a spring, a soft shadow and a little life: the stopwatch ticks, the babies wobble in,
  envelopes fly in streams, phones bounce and coins rain, lightning cracks with a flash and a screen shake, flames
  flicker, smoke rises, the light streak whips around the Earth, and the Earth races along its orbit.
- Studio slab highlights: red for India, blue for the regions the VO names, rising off the map on the word.
- A living camera all the way through: a slow roll, punch-ins on every number, whip moves with motion blur.
- The 4K60 anti-ants render settings (JPEG 95 frames, CRF 15, no re-encode).
- 23 images in all. If you're short on time, these 10 matter most: A1, A2, B1, B2, B3, E4, L1, L4, O1, S1.
