# GPT image prompts — missing assets only

Everything here goes into **ChatGPT image generation**. Every block is self-contained: the style header is already pasted
in, so copy one block per image. Items that must be built in Remotion, or downloaded, are in
`docs/PROMPTS_REMOTION_MISSING.md`. Do **not** generate those here.

**Totals:** 27 required (8 plates, 1 character, 2 stamps, 2 neon icons, 3 flat icons, 10 props, 1 document
fix) + 5 optional.

---

## 0. Workflow (same as the first batch)

| Step | Rule |
|---|---|
| Attach | For every character, prop and icon, **attach `chars/_style_reference_sheet.png`**. For stamps, also attach `props/stamp_taxed.png`. |
| Size | Characters/props/icons: generate 1024×1024 → upscale ×2 → **2048×2048**. Backgrounds: 1536×1024 → upscale ×4 → centre-crop **3840×2160**. |
| Upscaler | Upscayl → *Ultrasharp* for illustrations, *Real-ESRGAN* for photo plates. |
| Transparency | Characters, props, stamps, simple icons: transparent PNG. **Exception:** the neon icons go on **pure black** (§4). The glow can't survive background removal, and Remotion screen-blends black away. |
| Check | After background removal, open the file on a checkerboard. **Any white part of the object must still be opaque.** The white arrow last time lost its fill this way. |
| Names | Exact file names below, lowercase. |

---

## 1. Background plates — STYLE B — `public/assets/bg/` (8 required)

Paste the full block. Each one already contains the STYLE B header.

### 1.1 `bg_lawyer_office_1765.png` — S08 "contract"
```
Photorealistic cinematic matte painting, historically accurate 1765 British North America,
natural soft lighting, gentle atmospheric haze, shallow depth of field on the far background,
rich but slightly desaturated colours, film still quality. Wide landscape 1536×1024.
COMPOSITION FOR A 16:9 CROP: keep all important architecture inside the middle horizontal band
(15% to 85% of the height); leave the lower third as open, flat wooden floor where cartoon
characters will stand. ABSOLUTELY NO PEOPLE, no animals, no text, no letters on any book spine or
paper, no modern objects.
SCENE: A small colonial lawyer's office in Boston, 1765: tall dark-wood bookshelves of
leather-bound law books, a writing desk by a sash window with loose papers, a quill and an
inkwell, a brass candlestick, warm late-afternoon light through the window, wide-plank floor.
```

### 1.2 `bg_courtroom_1765.png` — S08 "license" **and** S12 John Adams
```
Photorealistic cinematic matte painting, historically accurate 1760s British North America,
natural soft lighting, gentle atmospheric haze, shallow depth of field on the far background,
rich but slightly desaturated colours, film still quality. Wide landscape 1536×1024.
COMPOSITION FOR A 16:9 CROP: keep all important architecture inside the middle horizontal band
(15% to 85% of the height); leave the lower third as open, flat wooden floor where cartoon
characters will stand. ABSOLUTELY NO PEOPLE, no animals, no text, no letters, no modern objects.
SCENE: A Massachusetts colonial courtroom: a raised judge's bench of dark wood at the back
centre, a carved wooden balustrade in front of it, tall arched windows with daylight, grey-green
panelled walls, a plain wooden witness box on the left, an empty jury bench on the right.
```
Used twice, so keep the centre-back bench clear. Adams stands in front of it.

### 1.3 `bg_tavern_1765.png` — S08 card-table flip
```
Photorealistic cinematic matte painting, historically accurate 1765 British North America,
warm candle-lit interior, gentle atmospheric haze, shallow depth of field on the far background,
rich but slightly desaturated colours, film still quality. Wide landscape 1536×1024.
COMPOSITION FOR A 16:9 CROP: keep all important architecture inside the middle horizontal band
(15% to 85% of the height); leave the lower third as open, EMPTY wooden floor — NO table and NO
chairs in the foreground centre (a table is added separately in animation). ABSOLUTELY NO PEOPLE,
no animals, no text, no letters on any sign, no modern objects.
SCENE: A colonial Boston tavern at night: dark red-painted walls, a long wooden bar with pewter
mugs, stacked barrels, a stone fireplace glowing on the right, candles in wall sconces, low
ceiling beams.
```
**Changed from the old sheet:** the table is left out on purpose. The table has to flip, so it's a separate prop (§6.4).
A table baked into the plate would leave two tables on screen.

### 1.4 `bg_liberty_tree_1765.png` — S08 effigy
```
Photorealistic cinematic matte painting, historically accurate 1765 Boston, overcast autumn
light, gentle atmospheric haze, shallow depth of field on the far background, rich but slightly
desaturated colours, film still quality. Wide landscape 1536×1024.
COMPOSITION FOR A 16:9 CROP: keep all important elements inside the middle horizontal band
(15% to 85% of the height); leave the lower third as open, flat cobbled street where cartoon
characters will stand. ABSOLUTELY NO PEOPLE, no animals, no text, no letters on any sign, no
modern objects.
SCENE: A huge old elm tree on a Boston street corner, August 1765: thick gnarled trunk on the
left third, ONE strong, clearly visible horizontal branch reaching out over the street at about
35% of the image height with empty sky beneath it (an effigy will hang from it), colonial brick
and white clapboard houses around, grey overcast sky.
```

### 1.5 `bg_lexington_green_1775_dawn.png` — S15 first shot
```
Photorealistic cinematic matte painting, historically accurate April 1775 New England, early
dawn light, low ground mist, gentle atmospheric haze, shallow depth of field on the far
background, rich but slightly desaturated colours, film still quality. Wide landscape 1536×1024.
COMPOSITION FOR A 16:9 CROP: keep all important architecture inside the middle horizontal band
(15% to 85% of the height); leave the lower half as open, flat grassy green where two lines of
cartoon soldiers will stand facing each other. ABSOLUTELY NO PEOPLE, no animals, no text, no
modern objects.
SCENE: Lexington Common at dawn on 19 April 1775: a wide open triangular grassy green with low
morning mist, a plain two-storey wooden meetinghouse with a small belfry at the far centre, a few
farmhouses and bare early-spring trees at the edges, pale pink and grey sky.
```

### 1.6 `bg_breeds_hill_1775.png` — S16 Bunker Hill
```
Photorealistic cinematic matte painting, historically accurate June 1775 Charlestown,
Massachusetts, hazy summer afternoon, gentle atmospheric haze, shallow depth of field on the far
background, rich but slightly desaturated colours, film still quality. Wide landscape 1536×1024.
COMPOSITION FOR A 16:9 CROP: keep all important elements inside the middle horizontal band
(15% to 85% of the height); leave the lower third as open grassy slope where cartoon soldiers
will stand. ABSOLUTELY NO PEOPLE, no animals, no text, no modern objects.
SCENE: The top of Breed's Hill above Charlestown on 17 June 1775: a hastily dug earthen redoubt
(raw brown dirt walls about chest high) on a grassy hilltop, long grass and a split-rail fence
running down the slope, columns of grey smoke rising from burning Charlestown below on the
right, Boston harbour and distant ship masts on the horizon.
```

### 1.7 `bg_monticello_porch_1776.png` — S19 Martha + Patsy
```
Photorealistic cinematic matte painting, historically accurate 1776 Virginia, warm summer
evening light, gentle atmospheric haze, shallow depth of field on the far background, rich but
slightly desaturated colours, film still quality. Wide landscape 1536×1024.
COMPOSITION FOR A 16:9 CROP: keep all important elements inside the middle horizontal band
(15% to 85% of the height); leave the lower third as open brick porch floor where cartoon
characters will stand. ABSOLUTELY NO PEOPLE, no animals, no text, no modern objects.
SCENE: The brick porch of Thomas Jefferson's FIRST Monticello in 1776: a plain red-brick wall and
a simple white-painted doorway behind, a herringbone brick floor in the foreground, a small round
wooden tea table on the right third with a white porcelain tea set, and beyond the porch rail a
view over green Virginia hills and plantation fields. NO dome, NO grand columned portico.
```

### 1.8 `bg_monticello_1776.png` — S19 pull-back reveal
```
Photorealistic cinematic matte painting, historically accurate 1776 Virginia, warm summer
evening light, gentle atmospheric haze, shallow depth of field on the far background, rich but
slightly desaturated colours, film still quality. Wide landscape 1536×1024.
COMPOSITION FOR A 16:9 CROP: keep the house in the upper-middle band (15% to 55% of the height);
the whole lower half is open fields and a dirt path where many small cartoon figures will be
placed. ABSOLUTELY NO PEOPLE, no animals, no text, no modern objects.
SCENE: Monticello as it stood in 1776, the FIRST unfinished version of Thomas Jefferson's house
on a Virginia mountaintop: a modest two-storey red-brick house with a simple portico, NO dome
(the dome was added decades later), small outbuildings and a row of plain wooden cabins
to one side, fields of tobacco and wheat on the slopes below, Virginia piedmont hills fading into
haze.
```
The cabins matter: the reveal is about the enslaved people who lived there. Keep the cabins plain and the image
dignified.

### 1.9 Optional — foreground layers for depth (`ParallaxPlate`)

Only these two plates run through `ParallaxPlate` in the cue sheet. Attach the finished plate and paste:

`bg_king_street_boston_1770_night_fg.png`
```
Using the attached image, output ONLY the nearest foreground elements — the snow banks and the
first rows of cobblestones in the bottom 30% of the frame — on a fully transparent background.
Everything else must be transparent. Same lighting, same perspective, same resolution.
```
`bg_forest_ohio_1754_dawn_fg.png`
```
Using the attached image, output ONLY the nearest foreground elements — the ferns, rocks and the
fallen log in the bottom 30% of the frame — on a fully transparent background. Everything else
must be transparent. Same lighting, same perspective, same resolution.
```

---

## 2. Character — STYLE A — `public/assets/chars/` (1 required)

### 2.1 `french_officer_1754.png` — S04 "Jumonville मारा जाता है"
Attach `_style_reference_sheet.png`.
```
Use the attached image as the strict style reference.
2D vector cartoon illustration for an animated history YouTube channel. Chibi proportions: very
large perfectly round head (about 40% of total height), small rounded bell-shaped body, tiny feet
just visible at the bottom. Flat colours with soft cel shading (one shadow tone, one subtle
highlight), clean thick dark-brown outline (#2A211B) of even width on every shape. Warm peach skin
(#F6D9BF). Muted, earthy, slightly desaturated palette, no neon. Gentle paper-grain texture inside
the fills. Character stands upright, front view turned very slightly (10°) to the right, centred,
feet touching the bottom edge of the canvas, full body visible with 6% empty margin
left/right/top. BLANK FACE: the face is completely smooth skin with NO eyes, NO eyebrows, NO nose,
NO mouth, NO blush. ARMS HIDDEN: both arms tucked inside the coat, no hands visible. Transparent
background, PNG, no ground shadow, no text, no border, square 1024×1024.
CHARACTER: A French colonial officer of the Troupes de la Marine, May 1754: greyish-white
justaucorps coat with BLUE cuffs and blue lining, blue waistcoat, white breeches, black gaiters,
black tricorne hat with gold edging, white powdered hair tied back, small gilt gorget at the
throat. NO weapon.
```
Check: grey-white coat with **blue** cuffs (not red; red would read as British), and no musket.

---

## 3. Stamps — `public/assets/props/` (2 required, 1 optional)

Attach `props/stamp_taxed.png` **and** `props/stamp_debt.png` so the grunge matches exactly.

### 3.1 `stamp_rejected.png` — S03 "नहीं, शुक्रिया"
```
Match the attached rubber-stamp images exactly in style: a red rubber-stamp ink impression reading
"REJECTED" in heavy condensed capital letters inside a rounded rectangle border, grungy uneven ink
with gaps and speckles, rotation 0°, colour #C81E2B, transparent background, wide 1536×1024.
```

### 3.2 `stamp_closed.png` — S14 "Boston का port बंद" (replaces the code placeholder)
```
Match the attached rubber-stamp images exactly in style: a red rubber-stamp ink impression reading
"CLOSED" in heavy condensed capital letters inside a rounded rectangle border, grungy uneven ink
with gaps and speckles, rotation 0°, colour #C81E2B, transparent background, wide 1536×1024.
```

### 3.3 Optional — `stamp_limited.png` (no cue uses it yet; the reference uses it at Boston)
```
Match the attached rubber-stamp images exactly in style: a red rubber-stamp ink impression reading
"LIMITED" in heavy condensed capital letters inside a rounded rectangle border, grungy uneven ink
with gaps and speckles, rotation 0°, colour #C81E2B, transparent background, wide 1536×1024.
```
Check each letter. AI misspells stamp words more than anything else.

---

## 4. Neon icons — `public/assets/icons/` (2 required, 1 optional)

**Generate these on pure black, not transparent.** A glow is semi-transparent light, and background removal deletes
it. Remotion draws them with `mix-blend-mode: screen`, which makes black invisible and keeps the glow (see the Remotion
file, R3).

### 4.1 `neon_parliament_x.png` — S08 "No taxation without representation"
```
A glowing neon sign icon on a PURE BLACK background (#000000): a circle made of a single neon
tube, inside it the outline of the Westminster clock tower drawn in a single glowing white-pink
neon line, and a big bold red neon X across the whole icon. Realistic neon tube glow with soft
bloom, no wall, no bricks, no reflections, nothing else in the image, centred, square 1024×1024.
```

### 4.2 `neon_coins_check.png` — S08, paired with 4.1
```
A glowing neon sign icon on a PURE BLACK background (#000000): a circle made of a single green
neon tube, inside it the outline of a small stack of coins drawn in a single glowing white neon
line, and a big bold green neon check mark across the lower right. Realistic neon tube glow with
soft bloom, no wall, no reflections, nothing else in the image, centred, square 1024×1024.
```

### 4.3 Optional — `neon_crown.png`
```
A glowing neon sign icon on a PURE BLACK background (#000000): a circle made of a single gold
neon tube, inside it the outline of a royal crown drawn in a single glowing gold neon line.
Realistic neon tube glow with soft bloom, nothing else in the image, centred, square 1024×1024.
```

---

## 5. Flat icons — STYLE A icon — `public/assets/icons/` (3 required)

Attach `_style_reference_sheet.png` for all three.

### 5.1 `clock_15min.png` — S04 "पंद्रह minute"
```
Use the attached image as the strict style reference for outline and shading. A simple flat
cartoon 18th-century brass pocket watch seen from the front, white face with NO numbers, one
quarter of the dial (12 to 3 o'clock) filled with a translucent red wedge, two hands at 12 and 3,
thick dark-brown outline (#2A211B), soft cel shading, centred, transparent background, PNG,
square 1024×1024, no text.
```

### 5.2 `warehouse_icon.png` — S13 "चाय बिक नहीं रही"
```
Use the attached image as the strict style reference for outline and shading. A tiny illustrated
18th-century London riverside brick warehouse used as a map icon: three storeys, a wooden crane
hoist on the top floor, wooden tea chests stacked high at the open ground-floor door, 3/4
top-down view, thick dark-brown outline, soft cel shading, centred, transparent background, PNG,
square 1024×1024, no text, no signs.
```

### 5.3 `courthouse_icon.png` — S07 "jury ही नहीं"
```
Use the attached image as the strict style reference for outline and shading. A tiny illustrated
colonial courthouse used as a map icon: small red-brick building with a white columned portico
and a triangular pediment, small cupola, 3/4 top-down view, thick dark-brown outline, soft cel
shading, centred, transparent background, PNG, square 1024×1024, no text, no flags.
```

---

## 6. Props — `public/assets/props/` (10 required)

**STYLE A props:** attach `_style_reference_sheet.png`. **STYLE C props (3D):** attach `props/crown_gold.png` as the
3D reference.

### 6.1 `coin_british_shilling.png` — S03 "अपना पैसा", S05 coins drain
```
Use the attached image as the strict style reference for outline and shading. A single silver
British shilling of King George III, 1760s: crowned shield design on the face, slight 3/4 tilt
showing the coin's edge, soft cel shading with one silver highlight, thick dark-brown outline
(#2A211B), centred, transparent background, PNG, square 1024×1024, NO readable lettering.
```

### 6.2 `coin_spanish_dollar.png` — S03, S05
```
Use the attached image as the strict style reference for outline and shading. A single Spanish
silver dollar ("piece of eight") of the 1760s, the coin most used in the American colonies: two
crowned pillars either side of a crowned shield, slight 3/4 tilt showing the edge, soft cel
shading, thick dark-brown outline (#2A211B), centred, transparent background, PNG, square
1024×1024, NO readable lettering.
```

### 6.3 `colonial_paper_note.png` — S03
```
Use the attached image as the strict style reference for outline and shading. A small 1760s
colonial paper banknote: cream paper, ornate engraved border, a small round seal, a few lines of
tiny illegible text, one folded corner, slight tilt, soft cel shading, thick dark-brown outline
(#2A211B), centred, transparent background, PNG, square 1024×1024, NO readable words or numbers.
```
The three money items have to read as **three different currencies** at a glance: silver, silver with pillars, and
paper.

### 6.4 `card_table_round.png` — S08 table flip
```
Use the attached image as the strict style reference for outline and shading. A small round
wooden 18th-century tavern card table on a single turned pedestal with three curved feet, 3/4
view from slightly above, empty table top, warm brown wood, soft cel shading, thick dark-brown
outline (#2A211B), centred, transparent background, PNG, square 1024×1024, nothing on the table.
```

### 6.5 `effigy_hanging.png` — S08 "पुतला एक पेड़ पर"
```
Use the attached image as the strict style reference for outline and shading. A crude
straw-stuffed effigy dummy hanging from a rope, Boston 1765: an old grey coat and breeches stuffed
with straw, straw poking out of the cuffs and collar, a stuffed sack-cloth head with a BLANK face,
and a single old leather boot hanging beside it on its own short string. The rope rises from the
top of the head straight up to the top edge of the canvas. Comic folk-art prop, NOT gruesome, no
blood. Thick dark-brown outline (#2A211B), soft cel shading, centred, transparent background,
PNG, portrait 1024×1536.
```
The boot is a real detail: on 14 August 1765 stamp distributor Andrew Oliver's effigy was hung with a boot, a pun on
Lord Bute.

### 6.6 `pamphlet_folded.png` — S17 "और आग लग गई" (copies fling)
```
Use the attached image as the strict style reference for outline and shading. A small printed
pamphlet of 1776, stitched paper cover, plain cream paper with a thin printed border and lines of
tiny illegible print, slightly open, slight tilt, soft cel shading, thick dark-brown outline
(#2A211B), centred, transparent background, PNG, square 1024×1024, NO readable title.
```
The readable Common Sense title page comes from the real public-domain scan (Remotion file, D2). This one is for the
copies flying across the colonies.

### 6.7 `rope_tug.png` — S20 "फ़ैसला कौन करेगा" (tug-of-war)
```
Use the attached image as the strict style reference for outline and shading. A thick twisted
hemp rope, perfectly HORIZONTAL, straight and taut, frayed at both ends, long thin object filling
the width, soft cel shading, thick dark-brown outline (#2A211B), transparent background, PNG,
wide 1536×1024.
```

### 6.8 `ship_navy_warship.png` — S07 navy circles the coast, S14 port
```
Use the attached image as the strict style reference for outline and shading. An 18th-century
Royal Navy frigate in chibi proportions (slightly fat hull, short masts), side view facing LEFT,
three masts with furled white sails, black and yellow-ochre striped hull with a row of gun ports
and small cannon muzzles, soft cel shading, thick dark-brown outline (#2A211B), centred,
transparent background, PNG, wide 1536×1024. NO FLAG anywhere on the ship.
```
No flag on purpose: AI almost always draws the post-1801 Union Jack with St Patrick's cross, which is wrong for
the 1770s. The code adds the correct flag.

### 6.9 `candle_lit.png` — S11 "पाँच लोग मारे गए" (five candles) — **STYLE C**
Attach `props/crown_gold.png`.
```
Use the attached image as the strict style reference for render quality. Stylised 3D render of a
single object, like a high-end animated feature film prop: soft rounded forms, physically based
materials, soft three-point studio lighting (warm key from top-left, cool rim light from the
right), gentle ambient occlusion. A single white wax candle in a simple round brass
candleholder with a small ring handle, lit, with a small calm warm flame and a little melted wax
on the side. Object centred, 3/4 view from slightly above, filling 80% of the frame, NO contact
shadow. Transparent background, PNG, square 1024×1024.
```
Calm and respectful: this is the memorial beat for the five killed.

### 6.10 `gavel_wood.png` — S12 "बरी हो गए" (gavel tap) — **STYLE C**
Attach `props/crown_gold.png`.
```
Use the attached image as the strict style reference for render quality. Stylised 3D render of a
single object, like a high-end animated feature film prop: soft rounded forms, physically based
materials (real polished dark wood grain), soft three-point studio lighting (warm key from
top-left, cool rim light from the right), gentle ambient occlusion. A dark wooden judge's gavel
lying on a round wooden sounding block, 3/4 view from slightly above, object centred, filling 80%
of the frame, NO contact shadow. Transparent background, PNG, square 1024×1024.
```

---

## 7. Document fixes — `public/assets/docs/` (1 required, 1 optional)

### 7.1 `doc_olive_branch_scroll.png` — S16 (replace) — **required**
Attach `docs/doc_stamp_act_1765.png` as the style reference.
```
Match the attached document in paper, ageing and rendering. A photorealistic aged 18th-century
parchment SCROLL rolled open (rolled ends at top and bottom, not a flat sheet), cream-yellow paper
with foxing and darker edges, soft drop shadow, facing the camera, transparent background around
the scroll, portrait 1024×1536. In the centre, the single word "Truce?" handwritten LARGE in brown
ink in an elegant 18th-century hand, with a small green olive sprig drawn beneath it. NO royal
coat of arms, NO crown, NO "GR" cypher, NO red wax seal. Nothing else written.
```
This is the "Truce?" scroll the S16 cue asks for. The old file was sealed with the King's own "GR" seal, which is wrong
on a petition sent *to* the King. Check the spelling of "Truce?".

### 7.2 Optional — `doc_sugar_act_1764.png` restyle, to match the other six
Attach `docs/doc_stamp_act_1765.png`.
```
Match the attached document exactly in layout, paper, ageing, typography and decoration: royal
coat of arms at the top, a large blackletter heading, paragraphs of small italic script, a red
wax seal with ribbon at the bottom right, transparent background around the paper, portrait
1024×1536. The heading reads exactly "Sugar Act 1764." Body text illegible.
```

---

## 8. Not in this file (see `docs/PROMPTS_REMOTION_MISSING.md`)

- `icons/arrow_white_block.png`: rebuilt in Remotion (the GPT version lost its fill).
- `flags/bourbon_france.png`: rendered from code.
- The map look (satellite, parchment, flat, relief, 3D) and its colour grade.
- Public-domain scans (Join or Die, Revere engraving, Common Sense, Declaration) and map data (NASA Blue Marble,
  hillshade, 10m coastlines): downloaded, never generated.

---

## 9. QA before sending them over

- [ ] File names exactly as above.
- [ ] Characters, props, stamps and flat icons: transparent; **white areas still opaque** on a checkerboard.
- [ ] Neon icons: on pure black, not transparent.
- [ ] Faces blank, arms hidden (French officer, effigy head).
- [ ] Spelling: REJECTED, CLOSED, LIMITED, "Truce?", "Sugar Act 1764."
- [ ] No people and no readable text in any plate. Tavern has **no** table. Monticello has **no** dome.
- [ ] No flag on the warship. French officer has **blue** cuffs.
