# Image prompts v2 — matched to the reference video

Supersedes `PROMPTS_GPT_MISSING.md` and the character/prop sections of `ASSET_PROMPTS.md`. Every block is
self-contained: copy one block per image into ChatGPT's image tool. Remotion-made assets are in
`docs/PROMPTS_REMOTION_v2.md`.

## What changed, and why

Measured against the reference frame by frame (`analysis/reference-microframe.md`, and the crops of its
characters, props and icons):

| | Reference | First batch | v2 prompt |
|---|---|---|---|
| Character body | **peg doll**: one rounded capsule, flat rounded bottom | chibi with a separate torso | peg doll |
| Legs / feet / shoes | **none** | legs, stockings, buckled shoes | none |
| Head | ~45% of total height, sits on the collar, no neck | ~35%, with a neck | 45%, no neck |
| Outline / shading | medium dark-brown line, soft painterly shading, paper grain | thick even line, flat cel shading | as reference |
| Arms | none on the art; drawn as thin lines in animation | hands behind the back | no arms, no hands |
| White arrow | solid white, **no outline**, soft shadow | outline only (fill lost) | built in Remotion now |
| Neon icon | pink-red ring + silhouette + white X with red glow, heavy bloom | not made | on pure black |

**Keep, don't regenerate:** all props, gloves, documents (except the Olive Branch), stamps TAXED/DEBT, the four
backgrounds, both textures. They already match the reference's semi-realistic prop style.

**Regenerate:** the style sheet and all 29 characters (§2–3), plus the missing items (§4–9).

**Totals:** 30 character images (style sheet + 29 characters) + 26 other required (2 stamps, 3 flat icons, 2 neon icons, 10 props, 8 plates, 1 document) + 5 optional.

---

## 0. Workflow

| Step | Rule |
|---|---|
| Order | Generate the **style sheet (§2) first**. Approve it. Then attach it to every character prompt. |
| Attach | Characters: `chars/_style_reference_sheet.png` (the NEW one). Props/icons: the same sheet. Stamps: `props/stamp_taxed.png` + `props/stamp_debt.png`. 3D props: `props/crown_gold.png`. |
| Size | Characters/props/icons 1024×1024 → upscale ×2 → **2048×2048**. Backgrounds 1536×1024 → ×4 → centre-crop **3840×2160**. |
| Transparency | Transparent PNG, **except the neon icons: pure black** (§6). |
| White-fill trap | After background removal, view on a checkerboard: **every white part of the object must still be opaque** (the arrow lost its fill this way). |
| Send raw | If ChatGPT's file tools are down, send the raw images as they come. Renaming, trimming, transparency checks and placement happen in the repo. |

---

## 1. STYLE P — the reference's peg-doll character style

Pasted into every character prompt below (already included in each block).

```
STYLE P: 2D illustrated character for an animated history YouTube channel, in a "peg doll" cartoon
style. The whole figure is ONE soft rounded capsule like a wooden peg doll or a bowling pin: a very
large, perfectly round head (45% of the total height) sitting directly on the collar with NO neck;
below it a smooth rounded body that widens slightly toward a flat, gently rounded bottom edge.
NO LEGS, NO FEET, NO SHOES: the clothing simply ends at the rounded bottom of the body. Body width at
the bottom about 1.1 times the head width. Historically accurate 1760s-1770s clothing drawn ONTO the
body shape with fine detail: coat lapels and brass buttons that follow the body's curve, waistcoats,
lace cravats, cuffs, sashes, belts. Soft painterly shading with gentle gradients, light from the top
left, subtle paper grain inside the colours, a thin-to-medium dark-brown outline (#3A2A20) around the
silhouette and main shapes. Warm pale skin (#F3DCC4). Hair and wigs drawn with fine strands. Tricorne
hats are large and overhang the head. BLANK FACE: the face is completely smooth skin with NO eyes,
NO eyebrows, NO nose, NO mouth, NO blush. NO ARMS and NO HANDS anywhere (arms are added in animation).
Front view, body very slightly turned to the right. Centred, the bottom of the body touching the
bottom edge of the canvas, 6% empty margin left, right and top. Transparent background, PNG, no ground
shadow, no text, no border, square 1024x1024.
```

---

## 2. Style reference sheet — generate FIRST → `chars/_style_reference_sheet.png`

```
STYLE P (peg doll): a character model sheet on a plain light-grey background showing FIVE peg-doll
characters standing in a row at the same scale: a colonial townsman in a brown coat, tan waistcoat
and black tricorne; a British redcoat soldier of 1770 with white cross-belts and a black tricorne
with white lace; a gentleman in a white powdered wig and dark-blue coat; a woman in a long pale-blue
1770s gown with a white cap; a small child. Every figure is one rounded capsule: very large round
head (45% of the height) directly on the collar, no neck, smooth body widening slightly to a flat
rounded bottom, NO LEGS, NO FEET, NO ARMS, NO HANDS. All faces completely blank (no eyes, no mouth,
no brows, no nose). Soft painterly shading, light from the top left, subtle paper grain, thin-to-medium
dark-brown outline. Wide 1536x1024.
```
**Approve it before going on.** Check: no legs or feet on anyone, heads about half the height, blank faces.

---

## 3. Characters — STYLE P — `public/assets/chars/` (29)

Each block = attach the new style sheet, paste the block. Names must match exactly.

### 3.1 Colonists and townspeople

`colonist_brown_coat.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: a Boston townsman of 1765: brown wool frock coat with brass buttons, tan waistcoat, white
linen neck stock, black tricorne hat, natural brown hair tied in a short queue.
```

`colonist_bearded.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: a stout Boston dock-worker of 1770 with a full brown beard and moustache around the blank
face: dark-brown coat open over a rust waistcoat, red neckerchief, knitted brown wool cap.
```

`colonist_young_waistcoat.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: a young apprentice of 1770: no coat, mustard-yellow waistcoat over a white shirt, brown
work apron straps (suspenders) over the shoulders, no hat, messy light-brown hair.
```

`merchant_green_coat.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: a prosperous colonial merchant: dark-green silk coat with brass buttons, cream embroidered
waistcoat, lace cravat, white powdered bob wig, no hat.
```

`printer_apron.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: a colonial newspaper printer of 1765: leather work apron with an ink smudge over a white
shirt and brown waistcoat, cloth cap, rolled-up look.
```

`stamp_clerk.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: a British stamp distributor clerk of 1765: dark-grey coat, black waistcoat, white neck
stock, white powdered wig, small round spectacles pushed HIGH UP onto the forehead above the face
(not over the face).
```

`judge_white_wig.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: a 1760s colonial judge: long white full-bottomed powdered wig falling to the shoulders,
black judicial robe covering the whole body, white bands at the neck.
```

`crispus_attucks.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: Crispus Attucks, Boston 1770: a tall, strong, dignified man of African and Native American
descent, rich brown skin (#8A5A3C), short dark hair, a sailor's navy wool pea-jacket over a white
shirt, grey knitted cap. Heroic and respectful, no caricature.
```

`tea_party_disguised_colonist.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: a Boston colonist on the night of 16 December 1773 in a hasty disguise: an old striped wool
blanket wrapped around the body like a cloak, a smudge of black soot across the forehead, black
tricorne, a small hatchet tucked in the belt. NO feathers, NO headdress, NO Native costume.
```
The real 1773 disguise was crude: blankets and soot. This avoids the reference's feather stereotype.

`crowd_boston_back_heads.png`
```
Use the attached image as the strict style reference. STYLE P peg-doll townspeople seen FROM BEHIND:
a row of 12 figures packed shoulder to shoulder as a foreground layer, showing the backs of very
large round heads (some bald, some with hair tied in a queue, some with tricornes and caps) on
rounded capsule bodies with coats, waistcoat backs and suspender straps. NO legs, NO arms. Soft
painterly shading, thin dark-brown outline, transparent background, wide 1536x1024.
```

### 3.2 Soldiers

`redcoat_soldier.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: a British private of the 29th Regiment of Foot, Boston 1770: red wool coat with YELLOW
facings (lapels and cuffs), white lace buttonhole loops, white waistcoat with a lace jabot, white
leather cross-belts, black tricorne with white lace edging, powdered hair with side curls. NO musket
(added in animation).
```

`redcoat_officer.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: a British officer of 1770 (Captain Preston style): fine scarlet coat with yellow facings
and gold lace, crimson silk sash around the waist, gilt gorget at the throat, black tricorne with
gold lace, powdered hair. NO sword in hand.
```

`militia_minuteman.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: a Massachusetts militiaman of April 1775 in civilian farm clothes, NO uniform: brown
homespun coat, grey waistcoat, linen shirt, a powder horn on a strap across the chest, brown slouch
felt hat. NO musket.
```

`continental_soldier.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: a Continental Army soldier of 1775: a fringed linen hunting shirt in light brown, a
cartridge-box strap and canteen strap across the chest, black cocked hat. NO musket.
```

`french_officer_1754.png` (new)
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: Ensign Jumonville, a French colonial officer of the Troupes de la Marine, May 1754:
greyish-white justaucorps coat with BLUE cuffs and lining, blue waistcoat, small gilt gorget at the
throat, black tricorne with gold edging, white powdered hair tied back. NO weapon.
```
Check: **blue** cuffs, not red (red would read as British).

### 3.3 Named figures

`washington_1754_virginia_officer.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: George Washington aged 22 in 1754, a Virginia provincial officer: dark-blue coat with red
facings, red waistcoat, gilt gorget at the throat, black tricorne with gold edge, his OWN reddish-brown
hair tied back, NO wig. Young and slim, NOT the famous old portrait.
```

`washington_1775_general.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: General George Washington in 1775: dark-blue coat with buff (tan) facings, gold epaulettes
and brass buttons, buff waistcoat, light-blue sash across the chest, powdered greyish hair with side
rolls tied with a black ribbon, NO hat (as in the reference's map shot).
```

`benjamin_franklin.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: Benjamin Franklin in 1754, aged 48: plump, plain brown suit (coat and waistcoat), long
grey hair at the sides with a bald top, NO spectacles on the face (spectacles hide the animated eyes).
NOT the 1776 fur cap.
```
Spectacles removed on purpose: the last Franklin had glasses painted over the blank face, where the animated eyes go.

`thomas_jefferson.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: Thomas Jefferson in 1776, aged 33: tall and thin, RED-ORANGE natural hair loosely tied
back, dark-green coat, red waistcoat, white neck cloth, a white quill pen tucked into the coat lapel.
```

`john_adams.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: John Adams in 1770, aged 34, a Boston lawyer: short and stocky, black lawyer's coat,
white neck bands, white powdered wig with side curls.
```

`paul_revere.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: Paul Revere in 1775, a Boston silversmith: dark-brown riding coat, buff waistcoat, black
tricorne, his own dark hair tied back.
```

`paul_revere_on_horse.png`
```
Use the attached image as the strict style reference. Paul Revere as a STYLE P peg doll (very large
round head, no neck, rounded capsule body, NO arms, NO hands, BLANK face, dark-brown riding coat,
black tricorne) sitting upright in the saddle of a brown horse galloping to the LEFT, side view. The
horse is a chibi horse (big head, short legs stretched in mid-gallop, flowing mane and tail); the
rider's rounded body sits into the saddle with no legs showing. Soft painterly shading, thin
dark-brown outline, transparent background, wide 1536x1024.
```

`thomas_paine.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: Thomas Paine in 1776, aged 38: plain black coat, simple white neck cloth, his own dark hair
tied back, a rolled pamphlet tucked against the body at the side.
```

`king_george_iii.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: King George III in 1770, aged 32, a YOUNG king: scarlet and gold coat, wide blue Garter
sash across the chest with a silver star badge, ermine-trimmed red robe over the shoulders falling to
the bottom of the body, white powdered wig, a small golden crown on the head.
```

`lord_north.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: Lord North, British Prime Minister in 1770, aged 37: heavy-set, dark-blue coat, blue Garter
sash with a silver star, white powdered wig.
```

### 3.4 Monticello (serious beat — no gag, dignified)

`martha_jefferson.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: Martha Wayles Jefferson in 1776: a young woman in a long pale slate-blue silk gown that
falls to the bottom of the body, white lace fichu over the shoulders, brown hair up under a white
linen cap. Gentle and dignified.
```

`patsy_jefferson_child.png`
```
Use the attached image as the strict style reference. STYLE P peg doll, child proportions (head even
larger, about 55% of the height), no neck, rounded body with a flat rounded bottom, NO legs, NO feet,
NO arms, NO hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background,
1024x1024. CHARACTER: Martha "Patsy" Jefferson aged 3 in 1776: a small girl in a simple white muslin
dress with a pink sash, light-red hair.
```

`enslaved_worker_man.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: an enslaved field worker at a Virginia plantation in 1776, portrayed with dignity and
humanity: dark-brown skin (#6B4430), short dark hair, a coarse undyed linen shirt, a straw hat.
Respectful, no caricature, no exaggerated features.
```

`enslaved_worker_woman.png`
```
Use the attached image as the strict style reference. STYLE P peg doll (very large round head 45% of
the height, no neck, rounded capsule body with a flat rounded bottom, NO legs, NO feet, NO arms, NO
hands, BLANK face, soft painterly shading, thin dark-brown outline, transparent background, 1024x1024).
CHARACTER: an enslaved woman working at a Virginia plantation house in 1776, portrayed with dignity:
brown skin (#7A4E36), a plain blue-checked linen dress to the bottom of the body, white apron, a
cloth head wrap. Respectful, no caricature.
```

---

## 4. Stamps — `public/assets/props/` (2 required + 1 optional)

Attach `props/stamp_taxed.png` **and** `props/stamp_debt.png`.

`stamp_rejected.png` — S03 "नहीं, शुक्रिया"
```
Match the attached rubber-stamp images exactly in style: a red rubber-stamp ink impression reading
"REJECTED" in heavy condensed capital letters inside a rounded-rectangle border, grungy uneven ink
with gaps and speckles, rotation 0°, colour #C81E2B, transparent background, wide 1536x1024.
```

`stamp_closed.png` — S14 "Boston का port बंद" (replaces the code placeholder)
```
Match the attached rubber-stamp images exactly in style: a red rubber-stamp ink impression reading
"CLOSED" in heavy condensed capital letters inside a rounded-rectangle border, grungy uneven ink with
gaps and speckles, rotation 0°, colour #C81E2B, transparent background, wide 1536x1024.
```

Optional `stamp_limited.png` — same block with `"LIMITED"`.

---

## 5. Flat icons — `public/assets/icons/` (3)

Attach the new style sheet.

`clock_15min.png` — S04 "पंद्रह minute"
```
Use the attached image as the style reference for outline and shading. A simple cartoon 18th-century
brass pocket watch seen from the front, white face with NO numbers, one quarter of the dial (12 to 3
o'clock) filled with a translucent red wedge, two hands at 12 and 3, thin dark-brown outline, soft
painterly shading, centred, transparent background, PNG, 1024x1024, no text.
```

`warehouse_icon.png` — S13 "चाय बिक नहीं रही"
```
Use the attached image as the style reference for outline and shading. A tiny illustrated
18th-century London riverside brick warehouse used as a map icon: three storeys, a wooden crane hoist
on the top floor, wooden tea chests stacked high at the open door, 3/4 top-down view, thin dark-brown
outline, soft painterly shading, centred, transparent background, PNG, 1024x1024, no text, no signs.
```

`courthouse_icon.png` — S07 "jury ही नहीं"
```
Use the attached image as the style reference for outline and shading. A tiny illustrated colonial
courthouse used as a map icon: small red-brick building with a white columned portico, triangular
pediment and a small cupola, 3/4 top-down view, thin dark-brown outline, soft painterly shading,
centred, transparent background, PNG, 1024x1024, no text, no flags.
```

---

## 6. Neon icons — `public/assets/icons/` (2 required + 1 optional) — on PURE BLACK

Reference f2000: a pink-red neon ring, a pink-white silhouette inside it, a big white X with a red glow
across it, and strong bloom. **Generate on pure black, not transparent.** The glow is semi-transparent light and
background removal deletes it; Remotion blends the black away.

`neon_parliament_x.png` — S08 "No taxation without representation"
```
A glowing neon sign icon on a PURE BLACK background (#000000): a circle made of one bright pink-red
neon tube; inside it the silhouette of the Palace of Westminster with its clock tower drawn as
glowing pink-white neon; a big bold WHITE neon X across the whole icon with a strong red glow. Strong
realistic neon bloom spilling outward, no wall, no bricks, no reflections, nothing else, centred,
square 1024x1024.
```

`neon_coins_check.png` — S08, paired with the above
```
A glowing neon sign icon on a PURE BLACK background (#000000): a circle made of one bright green neon
tube; inside it the outline of a small stack of coins drawn as glowing white neon; a big bold WHITE
neon check mark with a strong green glow across the lower right. Strong realistic neon bloom spilling
outward, nothing else, centred, square 1024x1024.
```

Optional `neon_crown.png`: same style, gold ring, gold crown outline inside.

---

## 7. New props — `public/assets/props/` (10)

Props match the reference's semi-realistic prop style, so they use the existing props as the reference.
**Attach `props/tea_chest.png` and `props/crown_gold.png`.**

`coin_british_shilling.png` — S03, S05
```
Match the attached props in rendering. A single silver British shilling of King George III, 1760s,
crowned shield on the face, slight 3/4 tilt showing the edge, soft realistic shading with one bright
highlight, centred, transparent background, PNG, 1024x1024, NO readable lettering.
```

`coin_spanish_dollar.png` — S03, S05
```
Match the attached props in rendering. A single Spanish silver dollar ("piece of eight") of the 1760s,
the coin most used in the colonies: two crowned pillars either side of a crowned shield, slight 3/4
tilt showing the edge, soft realistic shading, centred, transparent background, PNG, 1024x1024, NO
readable lettering.
```

`colonial_paper_note.png` — S03
```
Match the attached props in rendering. A small 1760s colonial paper banknote: cream paper, ornate
engraved border, a small round seal, a few lines of tiny illegible print, one folded corner, slight
tilt, centred, transparent background, PNG, 1024x1024, NO readable words or numbers.
```
The three must read as **three different currencies** at a glance: silver, silver with pillars, paper.

`card_table_round.png` — S08 table flip (ref f1740–1764: a round pedestal table)
```
Match the attached props in rendering. A round dark-wood 18th-century tavern card table on a single
turned pedestal with three curved feet, 3/4 view from slightly above, empty top, centred, transparent
background, PNG, 1024x1024.
```

`effigy_hanging.png` — S08 "पुतला एक पेड़ पर"
```
Match the attached props in rendering. A crude straw-stuffed effigy dummy hanging from a rope, Boston
1765: an old grey coat stuffed with straw, straw poking from the cuffs and collar, a stuffed sack-cloth
head with a BLANK face, and a single old leather boot hanging beside it on its own short string. The
rope rises from the top of the head straight to the top edge of the canvas. Folk-art prop, comic and
NOT gruesome, no blood. Transparent background, PNG, portrait 1024x1536.
```
The boot is real: on 14 August 1765 Andrew Oliver's effigy was hung with a boot, a pun on Lord Bute.

`candle_lit.png` — S11 five candles (memorial beat)
```
Match the attached 3D props in render quality. A single white wax candle in a simple round brass
candleholder with a small ring handle, lit, a small calm warm flame, a little melted wax on the side,
3/4 view from slightly above, filling 80% of the frame, NO contact shadow, transparent background,
PNG, 1024x1024.
```

`gavel_wood.png` — S12 "बरी हो गए"
```
Match the attached 3D props in render quality. A dark polished wooden judge's gavel lying on a round
wooden sounding block, 3/4 view from slightly above, filling 80% of the frame, NO contact shadow,
transparent background, PNG, 1024x1024.
```

`pamphlet_folded.png` — S17 copies fling across the colonies
```
Match the attached props in rendering. A small printed pamphlet of 1776 with a stitched spine, plain
cream paper cover with a thin printed border and lines of tiny illegible print, slightly open, slight
tilt, centred, transparent background, PNG, 1024x1024, NO readable title.
```

`rope_tug.png` — S20 tug-of-war
```
Match the attached props in rendering. A thick twisted hemp rope, perfectly HORIZONTAL, straight and
taut, frayed at both ends, a long thin object filling the width, transparent background, PNG, wide
1536x1024.
```

`ship_navy_warship.png` — S07 navy circles the coast, S14 port
```
Match the attached props in rendering. An 18th-century Royal Navy frigate in toy-like proportions
(slightly fat hull, short masts), side view facing LEFT, three masts with furled white sails, a black
and yellow-ochre striped hull with a row of gun ports and small cannon muzzles, transparent background,
PNG, wide 1536x1024. NO FLAG anywhere on the ship.
```
No flag on purpose: AI draws the post-1801 Union Jack (with St Patrick's cross). The code adds the correct 1770s flag.

---

## 8. Backgrounds — STYLE B — `public/assets/bg/` (8 required + 2 optional)

The four existing plates are good; keep them. Same STYLE B as before (photoreal matte painting, **no people, no
text**, open floor in the lower third). Each block is complete.

`bg_lawyer_office_1765.png` — S08 "contract"
```
Photorealistic cinematic matte painting, historically accurate 1765 Boston, natural soft lighting,
gentle atmospheric haze, shallow depth of field on the far background, rich but slightly desaturated
colours, film still quality. Wide 1536x1024. Keep all important elements inside the middle band (15%
to 85% of the height); leave the lower third as open, flat wooden floor where cartoon characters will
stand. ABSOLUTELY NO PEOPLE, no animals, no text, no letters on any book spine or paper, no modern
objects. SCENE: a small colonial lawyer's office: tall dark-wood bookshelves of leather-bound law
books, a writing desk by a sash window with loose papers, a quill and an inkwell, a brass candlestick,
warm late-afternoon light, wide-plank floor.
```

`bg_courtroom_1765.png` — S08 "license" and S12 John Adams
```
Photorealistic cinematic matte painting, historically accurate 1760s Massachusetts, natural soft
lighting, gentle atmospheric haze, shallow depth of field on the far background, rich but slightly
desaturated colours, film still quality. Wide 1536x1024. Keep all important elements inside the
middle band (15% to 85% of the height); leave the lower third as open, flat wooden floor. ABSOLUTELY
NO PEOPLE, no animals, no text, no letters, no modern objects. SCENE: a colonial courtroom: a raised
judge's bench of dark wood at the back centre, a carved wooden balustrade in front of it, tall arched
windows with daylight, grey-green panelled walls, a plain wooden witness box on the left, an empty
jury bench on the right.
```

`bg_tavern_1765.png` — S08 card-table flip
```
Photorealistic cinematic matte painting, historically accurate 1765 Boston, warm candle-lit interior,
gentle atmospheric haze, shallow depth of field on the far background, rich but slightly desaturated
colours, film still quality. Wide 1536x1024. Keep all important elements inside the middle band (15%
to 85% of the height); leave the lower third as open, EMPTY wooden floor: NO table and NO chairs in
the foreground centre (a table is added in animation). ABSOLUTELY NO PEOPLE, no animals, no text, no
letters on any sign, no modern objects. SCENE: a colonial tavern: dark-red walls, a long wooden bar
with pewter mugs, stacked barrels, a stone fireplace glowing on the right, candles in wall sconces,
low ceiling beams, a window at the back.
```

`bg_liberty_tree_1765.png` — S08 effigy
```
Photorealistic cinematic matte painting, historically accurate August 1765 Boston, overcast light,
gentle atmospheric haze, shallow depth of field on the far background, rich but slightly desaturated
colours, film still quality. Wide 1536x1024. Keep important elements inside the middle band (15% to
85% of the height); leave the lower third as open cobbled street. ABSOLUTELY NO PEOPLE, no animals, no
text, no letters on any sign, no modern objects. SCENE: a huge old elm on a Boston street corner: a
thick gnarled trunk on the left third, ONE strong, clearly visible horizontal branch reaching out over
the street at about 35% of the image height with empty sky beneath it (an effigy will hang from it),
colonial brick and white clapboard houses around, grey overcast sky.
```

`bg_lexington_green_1775_dawn.png` — S15 first shot
```
Photorealistic cinematic matte painting, historically accurate 19 April 1775 New England, early dawn
light, low ground mist, gentle atmospheric haze, shallow depth of field on the far background, rich
but slightly desaturated colours, film still quality. Wide 1536x1024. Keep the buildings inside the
middle band (15% to 55% of the height); leave the lower half as open, flat grassy green where two
lines of cartoon soldiers will face each other. ABSOLUTELY NO PEOPLE, no animals, no text, no modern
objects. SCENE: Lexington Common at dawn: a wide open grassy green with low mist, a plain two-storey
wooden meetinghouse with a small belfry at the far centre, a few farmhouses and bare early-spring
trees at the edges, pale pink and grey sky.
```

`bg_breeds_hill_1775.png` — S16 Bunker Hill
```
Photorealistic cinematic matte painting, historically accurate 17 June 1775 Charlestown,
Massachusetts, hazy summer afternoon, gentle atmospheric haze, shallow depth of field on the far
background, rich but slightly desaturated colours, film still quality. Wide 1536x1024. Keep important
elements inside the middle band (15% to 85% of the height); leave the lower third as open grassy
slope. ABSOLUTELY NO PEOPLE, no animals, no text, no modern objects. SCENE: the top of Breed's Hill: a
hastily dug earthen redoubt (raw brown dirt walls about chest high) on a grassy hilltop, long grass
and a split-rail fence down the slope, grey smoke rising from burning Charlestown below on the right,
Boston harbour and distant ship masts on the horizon.
```

`bg_monticello_porch_1776.png` — S19 Martha + Patsy (ref f4800)
```
Photorealistic cinematic matte painting, historically accurate 1776 Virginia, warm summer evening
light, gentle atmospheric haze, shallow depth of field on the far background, rich but slightly
desaturated colours, film still quality. Wide 1536x1024. Keep important elements inside the middle
band (15% to 85% of the height); leave the lower third as open herringbone brick floor. ABSOLUTELY NO
PEOPLE, no animals, no text, no modern objects. SCENE: the brick porch of Thomas Jefferson's FIRST
Monticello in 1776: a plain red-brick wall with a simple white-painted doorway and dark-green
shutters behind, a small round wooden tea table on the centre-left with a white porcelain tea set, a
wicker baby cradle beside it, a view of green Virginia hills beyond the rail. NO dome, NO grand
columned portico.
```

`bg_monticello_1776.png` — S19 pull-back reveal
```
Photorealistic cinematic matte painting, historically accurate 1776 Virginia, warm summer evening
light, gentle atmospheric haze, shallow depth of field on the far background, rich but slightly
desaturated colours, film still quality. Wide 1536x1024. Keep the house in the upper-middle band (15%
to 55% of the height); the whole lower half is open fields and a dirt path where many small figures
will be placed. ABSOLUTELY NO PEOPLE, no animals, no text, no modern objects. SCENE: Monticello as it
stood in 1776, the FIRST unfinished version of Jefferson's house on a Virginia mountaintop: a modest
two-storey red-brick house with a simple portico, NO dome (added decades later), small outbuildings
and a row of plain wooden cabins to one side, fields of tobacco and wheat on the slopes, piedmont
hills fading into haze.
```

Optional foreground layers (depth for `ParallaxPlate`). Attach the finished plate:
`bg_king_street_boston_1770_night_fg.png`
```
Using the attached image, output ONLY the nearest foreground elements — the snow banks and the first
rows of cobblestones in the bottom 30% of the frame — on a fully transparent background. Everything
else transparent. Same lighting, perspective and resolution.
```
`bg_forest_ohio_1754_dawn_fg.png` — same block, with "the ferns, rocks and the fallen log".

---

## 9. Document fix — `public/assets/docs/` (1 required + 1 optional)

`doc_olive_branch_scroll.png` — S16 (replace; ref f4110 "Truce, mb?"; held by Washington, torn by the King)
Attach `docs/doc_stamp_act_1765.png`.
```
Match the attached document in paper, ageing and rendering. A photorealistic aged 18th-century
parchment SCROLL rolled open (rolled ends at top and bottom, not a flat sheet), cream-yellow paper with
foxing and darker edges, facing the camera, transparent background around the scroll, portrait
1024x1536. In the centre the single word "Truce?" handwritten LARGE in brown ink in an elegant
18th-century hand, with a small green olive sprig drawn beneath it. NO coat of arms, NO crown, NO
"GR" cypher, NO wax seal. Nothing else written.
```
The old one carried the King's own "GR" seal, which is wrong on a petition sent *to* him. Check the spelling of "Truce?".

Optional `doc_sugar_act_1764.png` restyle (to match the other six)
```
Match the attached document exactly in layout, paper, ageing, typography and decoration: royal coat
of arms at the top, a large blackletter heading, paragraphs of small italic script, a red wax seal
with ribbon at the bottom right, transparent background around the paper, portrait 1024x1536. The
heading reads exactly "Sugar Act 1764." Body text illegible.
```

---

## 10. QA before sending

- [ ] **Characters: no legs, no feet, no shoes, no arms, no hands.** Head ≈ half the height, no neck. Bottom of the body on the bottom edge of the canvas.
- [ ] Faces completely blank. **Nothing painted over the face** (no spectacles: Franklin's are removed, the clerk's sit on the forehead).
- [ ] 29th Foot: yellow facings. Washington 1754: no wig. Jefferson: red hair. French officer: blue cuffs. Tea Party: no feathers.
- [ ] Every transparent PNG: white parts still opaque on a checkerboard.
- [ ] Neon icons on pure black.
- [ ] Spelling: REJECTED, CLOSED, LIMITED, "Truce?", "Sugar Act 1764."
- [ ] Plates: no people, no readable text. Tavern: no table. Monticello: no dome. Warship: no flag.
