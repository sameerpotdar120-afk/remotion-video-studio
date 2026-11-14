# UK: asset prompts (GPT images, Mumbai look)

Same look as the Ram Setu and "every second" videos: premium glossy 3D miniatures. The satellite map, country fills
(slabs), flags, flag faces, hex badges, the "रिश्वत / BRIBED" stamp, dates, labels and captions are drawn in code.

## 1. Read this first

**1. GPT never draws a map.** The satellite map (EOX Sentinel-2), the UK countries, Ireland and India (India's official
boundary) are built in code.

**2. No text, numbers, letters, flags, logos or crests in any image.** No Union Jack, no St George's cross, no Saltire,
no royal coat of arms, no team crests, no Olympic rings. Flags and every word are drawn in code.

**3. Respect.** No real people's faces (no real kings or politicians); the 1916 and 1919-21 events are shown through
buildings, never violence or bodies.

**4. One look.** Glossy 3D miniatures, like a high-end diorama: soft studio light from the top-left, rich realistic
materials, no outlines, no cartoon line work. Make each group in the same chat.

### How to generate (ChatGPT / GPT image)
- One asset per message. Paste the **Style Lock** once at the top of each chat.
- Use the biggest size GPT offers in that shape: square for props, wide for wide items, tall for tall ones; 2048 px or
  more if it can.
- `PNG-T` = real transparent background. If you get a checkerboard or white, reply: *"Regenerate with a truly
  transparent alpha background, not a drawn checkerboard."* If it still fails, use remove.bg or Photoroom.
- Name files exactly as listed, zip them, and share through Google Drive ("Anyone with the link").

### Style Lock (paste once at the top of each chat)
```
You are generating production assets for a premium animated map documentary
(vertical 9:16 Short, satellite map look, like a high-end After Effects +
GeoLayers geography video). The story is how England, Wales, Scotland and
Ireland were joined into the United Kingdom (1283, 1603, 1707, 1801, 1922).
Every prop is a premium glossy 3D miniature, like a high-end diorama model:
soft studio light from the top-left, rich realistic materials, subtle
reflections, fine detail, no outlines, no cartoon line work. Figures are
stylised 3D miniature figurines with natural proportions, never caricatures,
and never the likeness of a real person. No text, no letters, no numbers, no
flags, no crests, no coats of arms, no logos, no watermark, no signature, no
frame or border. When I say PNG-T, the background must be fully transparent
(real alpha channel). Centre the subject with generous empty padding. Do not
add glow or drop shadows; those are added later in the video editor.
```

## 2. Beat map (VO → screen → asset)

| VO | On screen | Assets |
|---|---|---|
| Jin Angrezon ne… chaar desh… 1801 mein bribe se… Kaise? | Frame 0: kinetic type "UNITED KINGDOM" over India; pull back to the UK; "1801" and the code "रिश्वत" stamp on Ireland; coins burst | P3 |
| UK mein ek King, ek Passport, ek Army. | The three props spring out of the UK on their words, each on a glowing hex badge | A1, A2, A3 |
| Par andar chaar desh… Chaaron ki apni Capital. | White-flash reveal of the four countries in colour; capital pins | (code) |
| Cricket mein "England" ki team… Football… Olympics mein sab ek: Team GB. | Cricket kit pops on England and Wales together; four footballs, one per country; they merge into the torch and medal | K1, K2, K3; Null A |
| 13vi sadi mein England ne Wales ko jeet liya… kilon ke ghere… | Castles pop one by one along the Welsh coast | W1 |
| Phir baari Scotland ki… Scots sadiyon tak lade. | Crossed swords clash at the border | S1 |
| 1603 mein… London chala gaya. | The crown hops from Edinburgh to London | A1 |
| Panama mein colony… paisa doob gaya. | A ship sinks with its treasure chest | S2, S3 |
| 1707… kanoon, adalatein aur church bacha liye. Aise bana Great Britain. | Scales, gavel and a Scottish church pop around Scotland and stay | S4, S5, S6 |
| Ireland… apni Parliament… 1801… khitabon aur paison se khareedi gayi… | The Irish Parliament House; a coronet and a money bag fly in; the "रिश्वत" stamp slams | I1, P1, P3 |
| 1916 ka Easter Rising… azaadi ki jung… 1922… | The Dublin post office building with smoke drifting; Ireland turns green and slides apart | I2 |
| Ireland ka batwara London ki Parliament ke kanoon se… 1947 mein Bharat ka bhi. | Westminster pops over London; dashed partition lines on Ireland, then India; Null B | L1; null_uk_B |
| …United Kingdom of Great Britain and Northern Ireland. … ek sovereign rashtra… | The full name builds; four colour slabs flash white into a single "1" | (code) |

## 3. GPT asset prompts

### A. One king, one passport, one army (same chat)

#### A1 · `a_crown.png` (square, PNG-T)
```
A premium glossy 3D miniature of a regal royal crown: gold arches, a cross
on top, rows of white pearls, red, blue and green gemstones, a deep purple
velvet cap and an ermine band at the base. Majestic, three-quarter view.
No crest, no text. PNG-T, transparent background.
```

#### A2 · `a_passport.png` (square, PNG-T)
```
A glossy 3D miniature of a closed burgundy-red passport booklet standing
slightly open at an angle, soft leather texture, gold edges on the pages, a
plain embossed gold rectangle on the cover (no crest, no words). PNG-T,
transparent background.
```

#### A3 · `a_guardsman.png` (tall, PNG-T)
```
A glossy 3D miniature figurine of a ceremonial royal guardsman standing to
attention: tall black bearskin hat, red tunic with gold buttons, white belt,
dark blue trousers with a red stripe, holding a rifle upright at his
shoulder. Dignified, stylised, no face of a real person. PNG-T,
transparent background.
```

### K. The sports proof (same chat)

#### K1 · `k_cricket.png` (square, PNG-T)
```
A glossy 3D miniature of a cricket set: a willow cricket bat leaning
against three wooden stumps with bails, a shiny red leather cricket ball
with a white seam in front. No logos, no text. PNG-T, transparent
background.
```

#### K2 · `k_football.png` (square, PNG-T)
```
A glossy 3D miniature of a classic white leather football with black
pentagon panels, mid-bounce on a small patch of green grass. No logos, no
text. PNG-T, transparent background.
```

#### K3 · `k_torch_medal.png` (square, PNG-T)
```
A glossy 3D miniature of a golden sports torch with a bright flame, and a
gold winner's medal on a ribbon draped beside it (plain ribbon, no
rings, no logos, no text). PNG-T, transparent background.
```

### W, S. Wales and Scotland (same chat)

#### W1 · `w_castle.png` (square, PNG-T)
```
A glossy 3D miniature of a massive medieval stone castle in the style of
Edward I's castles in Wales: thick walls, tall polygonal towers with
battlements, a gatehouse, standing on a small grassy rock by the water. No
flags. PNG-T, transparent background.
```

#### S1 · `s_swords.png` (square, PNG-T)
```
A glossy 3D miniature of two medieval broadswords crossed in an X, one a
Scottish claymore with a basket-like hilt, the other an English knight's
sword, steel blades gleaming, small sparks where they meet. PNG-T,
transparent background.
```

#### S2 · `s_ship_sinking.png` (wide, PNG-T)
```
A glossy 3D miniature of a late-1600s three-masted sailing ship tilted
steeply as it sinks into a small patch of dark sea, torn sails, waves
washing over the deck, a few gold coins spilling into the water. No flags.
PNG-T, transparent background.
```

#### S3 · `s_treasure.png` (square, PNG-T)
```
A glossy 3D miniature of an open wooden treasure chest with iron bands,
overflowing with gold coins, a few coins spilling out. No text. PNG-T,
transparent background.
```

#### S4 · `s_scales.png` (square, PNG-T)
```
A glossy 3D miniature of classic brass scales of justice, perfectly
balanced, on a small dark wooden base. PNG-T, transparent background.
```

#### S5 · `s_gavel.png` (square, PNG-T)
```
A glossy 3D miniature of a polished dark wooden judge's gavel resting on
its round sound block. PNG-T, transparent background.
```

#### S6 · `s_kirk.png` (square, PNG-T)
```
A glossy 3D miniature of a traditional Scottish stone church (kirk): grey
stone walls, a tall square bell tower with a pointed spire, arched windows,
on a small patch of green grass. No flags. PNG-T, transparent background.
```

### I, P, L. Ireland and London (same chat)

#### I1 · `i_parliament_dublin.png` (wide, PNG-T)
```
A glossy 3D miniature of the 18th-century Irish Parliament House in Dublin:
a grand curved Palladian building with a long colonnade of Ionic columns, a
central portico, pale Portland stone, on a small cobbled plaza. No text, no
flags. PNG-T, transparent background.
```

#### I2 · `i_gpo_dublin.png` (wide, PNG-T)
```
A glossy 3D miniature of a grand neoclassical post office building inspired
by Dublin's GPO: a six-column Ionic portico with statues on the roof, a few
thin wisps of grey smoke drifting from behind it. No people, no flags, no
text. PNG-T, transparent background.
```

#### P1 · `p_coronet_money.png` (square, PNG-T)
```
A glossy 3D miniature of a nobleman's coronet (a gold circlet with silver
balls and velvet cap) resting on a fat leather money bag tied with a cord,
with a few gold coins scattered around. No text, no crest. PNG-T,
transparent background.
```

#### P3 · `p_coin_burst.png` (wide, PNG-T)
```
A burst of shiny gold coins flying outward from the centre in every
direction, some spinning, varied sizes for depth, a few slightly
motion-blurred. Plain coins, no symbols or text. PNG-T, transparent
background.
```

#### L1 · `l_westminster.png` (wide, PNG-T)
```
A glossy 3D miniature of the Palace of Westminster in London with its tall
clock tower: Gothic Revival golden-stone facade, pointed spires, the clock
tower at the right end, on a small riverside base with the Thames. No text,
no flags. PNG-T, transparent background.
```

## 4. What I do with them

- Clean edges, upscale for 4K, and cut out anything that comes with a background.
- Bring each one to life on the map: badges spring out with a glow, castles pop around Wales one by one, the swords clash
  with sparks, the crown hops along an arc to London, the ship sinks with coins, the coronet and money fly into the Irish
  Parliament as the stamp slams, smoke drifts from the post office, Westminster rises over London.
- Flags with faces (England, Wales, Scotland, Ireland), hex badges, dates, the full name and the "1" are drawn in code.
- Studio slabs: England red, Scotland blue, Wales green, Northern Ireland orange, India red for the 1947 beat.
- 18 images. If you're short on time, these 10 matter most: A1, A2, A3, K1, W1, S2, I1, P1, I2, L1.
