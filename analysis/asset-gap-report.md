# Asset gap report — America Azaad (4K60)

What was checked: all 76 delivered images (asset parts 01–22), the Remotion source zip, the four demo renders
(every frame), both docs, the raw VO and the script. Then every one of the 163 cue actions in
`src/vo/cues.json`, and every asset path the branch code references, were checked against what exists.

Branch checked against: `analysis/america-independence-reference` @ `571ff45`.

---

## 1. What arrived, and how it relates to the branch

| Item | Verdict |
|---|---|
| 76 images | 45 byte-identical to the branch. 26 characters are the **uncropped originals** of the branch files (pixel-identical after `prep_assets.py` cropping: worst diff 0). 4 backgrounds are lossless PNG versions of the branch JPGs (mean diff ≈1). Nothing new and nothing lost. |
| `flags/union_1707.png` | Identical to the branch's `union_flag_1707.png`, under a different name. Keep the branch name. |
| `ASSET_PROMPTS.md` (×2) | Both copies identical to each other and to the branch. |
| `REMOTION_ANIMATION_CODE.md` (×2) | Both identical; an **older** version (3,111 lines). The branch has 3,203 lines and adds `cues.ts` + `Animatic.tsx`. |
| Remotion source zip | An **older snapshot** as it ran in ChatGPT's sandbox (`remotion-network-preload.cjs` fakes a loopback adapter so Remotion can start there). Older than the branch in every code file: no cue sheet, no S01/S02, no measured rigs, no local fonts. **One useful addition:** `countries-10m.geo.json` (20.5 MB) and `land-10m.geo.json` (15.4 MB). |
| `America_Independence_VO.mp3` | Same take as the branch `vo_master.mp3` (envelope correlation 0.97, 0 ms offset). This is the raw ElevenLabs file (−24.5 LUFS, 44.1 kHz, 128 kbps). The branch master is the normalised one (−14.5 LUFS, 48 kHz, 320 kbps). |
| Script | Matches the branch's `scripts/america-independence-final-vo.txt` on a paragraph-by-paragraph spot check. |

---

## 2. Quality check of the delivered assets

**Passes:** consistent STYLE A across all 26 characters and the style sheet; clean alpha everywhere; every face blank;
arms hidden; feet on the bottom edge. Every directional spec is met (muskets, bayonet, cannon and ship face left; the
pointing glove points right, cuff left). Every document heading is spelled correctly. The QA-checklist history rules
all pass: 29th Foot yellow facings, young unwigged Washington in 1754, red-haired Jefferson, blanket-and-soot Tea Party
disguise with no headdress, no saltire on the 1707 Union, and respectful Attucks and enslaved figures. All four plates
have no people, no legible text, and an open floor in the lower third.

**Defects:**

| Asset | Problem | Fix |
|---|---|---|
| `icons/arrow_white_block.png` | **Outline only.** The interior alpha is 0 (12.8% of its bounding box is opaque). The white fill was stripped as "background". In `demo-britain` the arrow is nearly invisible. | Draw the arrow in code (an SVG polygon is crisper at 4K), or regenerate and ask for "solid white fill, keep the fill opaque". |
| `props/stamp_closed.png`, `stamp_limited.png` | **Code-drawn placeholders** (flat font, clean edges). They clash with the grunge GPT `TAXED`/`DEBT`. | Regenerate (prompts in `ASSET_PROMPTS.md` §6). |
| `docs/doc_olive_branch_scroll.png` | It came out as a formal petition, but the prompt and cue S16 ask for the comic **"Truce?"** scroll. It's also sealed with the King's own "GR" seal, which is wrong for a petition *to* the King. | Regenerate per §5, or keep the serious version and drop the gag. Either way, remove the GR seal. |
| `docs/doc_townshend_list.png` | Has no per-row engraved icons and no per-row TAXED stamps. | **Acceptable as is:** cue S10 pops `stamp_taxed` on each row in code. |
| `docs/doc_sugar_act_1764.png` | Plain style; the other six have the royal crest and blackletter heading. | Optional restyle for set consistency. |
| `chars/benjamin_franklin.png`, `chars/stamp_clerk.png` | Spectacles are painted on the blank face. `Face.tsx` draws eyes and brows at the auto-measured face box, so they can collide with the lenses. | Code: per-rig `face` override in `rigs.ts` so the eyes sit inside the lenses. |

---

## 3. Demo renders — frame by frame

All four are true 3840×2160 @ 60 fps, 5–8 s each, with **no audio track**. **They were rendered from the older
sandbox code in the zip, so they understate the branch.** Findings:

| Render | Works | Problems |
|---|---|---|
| `demo-map-hook` | N→S colony fill with the white flash, neon outline, timeline rewind 1776→1763, pin, red dashed Proclamation Line. | Eyebrows render **over** the title ("Pro**č**lamation" is a brow on the "c"). The title font is **DejaVu Serif fallback**, not Playfair: the zip has no local fonts, and the branch's bundled fonts likely fix this. 6 frozen frames at f415–420; the reference is never frozen. |
| `demo-britain` | Britain map-character, noodle arm, glove holding the Sugar Act. Very close to the reference. | **Two Britains on screen:** the tan map Britain stays visible while the red character slides west. The DEBT stamp renders **near-black maroon** (blended over the red). After the punch-in, Britain is cropped by the frame edge and its eyes hang off the shape. The arrow is invisible (see §2). |
| `demo-map-3d` | Extruded colonies rise one by one under an orbiting tilt. The best motion of the four. | **Frame 0 glitch:** a default camera shows the Arctic and Hudson Bay for one frame. **The land is untextured flat tan**, while the reference always has texture. A **pale hotspot** blooms over the Gulf/Florida from f320. Title in the fallback font. |
| `demo-volley` | Faces drawn on the blank heads; brows switch neutral→angry; overshoot entry. | **The muskets never reach the hands:** they stand at the feet, then lie along the ground. Arms run sideways across the chests. Plain grey background with no plate. **Cause: the zip's `rigs.ts` uses default shoulder points on the uncropped 2048 canvases.** The branch's measured `rigs.generated.json` exists to fix this. |

> Recommendation: re-render the four demos from the **branch** code before judging them. Chromium is available in this
> environment, so it can be done here.

---

## 4. What still has to be made — by the cue sheet

The branch code that exists today (S01, S02, the demos) references 37 assets, and **all 37 are present**. Everything below
is what S03–S20 call for and the repo does not have.

### 4.1 Generate in ChatGPT — prompts already in `ASSET_PROMPTS.md`

| File | Used in | Prompt |
|---|---|---|
| `bg/bg_lawyer_office_1765.png` | S08 "contract" | §7.1 |
| `bg/bg_courtroom_1765.png` | S08 "license", **S12 Adams** | §7.1 |
| `bg/bg_tavern_1765.png` | S08 card-table flip | §7.1 |
| `bg/bg_liberty_tree_1765.png` | S08 effigy | §7.1 |
| `bg/bg_lexington_green_1775_dawn.png` | S15 first shot | §7.1 |
| `bg/bg_breeds_hill_1775.png` | S16 Bunker Hill | §7.1 |
| `bg/bg_monticello_porch_1776.png` | S19 Martha + Patsy | §7.1 |
| `bg/bg_monticello_1776.png` | S19 pull-back reveal | §7.1 |
| `props/stamp_rejected.png` | S03 "नहीं, शुक्रिया" | §6 |
| `props/stamp_closed.png` | S14 port closed (replaces placeholder) | §6 |
| `icons/clock_15min.png` | S04 "पंद्रह minute" | §6 |
| `icons/neon_parliament_x.png` | S08 "No taxation…" | §6 |
| `icons/neon_coins_check.png` | S08 "No taxation…" | §6 |

Optional from the sheet: `stamp_limited.png` (no cue uses it), `neon_crown.png`, and the `_fg` foreground layers (§7.2)
for `bg_king_street_boston_1770_night` and `bg_forest_ohio_1754_dawn`, the two plates the cues run through
`ParallaxPlate`. Without `_fg` layers the plates still work, but as a flat push with nothing passing in front of the
characters.

### 4.2 Generate in ChatGPT — NOT in the prompt sheet (new prompts below)

| File | Used in | Why |
|---|---|---|
| `chars/french_officer_1754.png` | S04 "Jumonville मारा जाता है" (the French officer `fallAt`) | No French character exists |
| `props/coin_british_shilling.png` | S03 "अपना पैसा", S05 coins drain | Cue needs *different* coins on 3 colonies |
| `props/coin_spanish_dollar.png` | S03, S05 | " |
| `props/colonial_paper_note.png` | S03 | " |
| `props/effigy_hanging.png` | S08 "पुतला एक पेड़ पर" | Effigy swings on the Liberty Tree |
| `props/card_table_round.png` | S08 table flip | The table has to be separate from the plate to flip |
| `props/candle_lit.png` | S11 "पाँच लोग मारे गए" (five candles) | |
| `props/gavel_wood.png` | S12 "बरी हो गए" (gavel tap) | |
| `icons/warehouse_icon.png` | S13 "चाय बिक नहीं रही" | Tea piling up in a warehouse |
| `props/pamphlet_folded.png` | S17 "और आग लग गई" (copies fling) | The PD title page is for the read; this is for the fling |
| `props/rope_tug.png` | S20 crown vs colonies tug-of-war | |
| `props/ship_navy_warship.png` | S07 navy circles the coast, S14 port | `ship_brig` is a merchant ship |
| `icons/courthouse_icon.png` | S07 "jury ही नहीं" | |

**Ready-to-paste prompts** (STYLE A / STYLE C headers from `ASSET_PROMPTS.md` §1, attach the style sheet as usual):

```
chars/french_officer_1754.png — STYLE A + :
A French colonial officer of the Troupes de la Marine, May 1754 (Ensign Jumonville): greyish-white
justaucorps coat with BLUE cuffs and lining, blue waistcoat, white breeches, black gaiters, black
tricorne hat with gold edging, white powdered hair tied back, small gilt gorget at the throat.
NO weapon in the image.
```
```
props/coin_british_shilling.png — STYLE A prop + :
A silver British shilling of George III, 1760s: crowned shield on the face, slight 3/4 tilt,
no readable lettering.
```
```
props/coin_spanish_dollar.png — STYLE A prop + :
A Spanish silver dollar ("piece of eight") of the 1760s, the coin most used in the colonies:
two crowned pillars either side of a crowned shield, slight 3/4 tilt, no readable lettering.
```
```
props/colonial_paper_note.png — STYLE A prop + :
A small 1760s colonial paper banknote: cream paper, ornate engraved border, a few lines of tiny
illegible text, one folded corner.
```
```
props/effigy_hanging.png — STYLE A prop + :
A crude straw-stuffed effigy dummy hanging from a rope, Boston 1765: old grey coat, stuffed
sack-cloth head with a blank face, straw poking out of the cuffs, a single old boot hanging
beside it on its own string, rope rising from the top centre to the top edge. Comic and
folk-art, NOT gruesome.
```
(The boot is a real detail: on 14 August 1765 the effigy of stamp distributor Andrew Oliver was hung with a boot, a
pun on Lord Bute.)
```
props/card_table_round.png — STYLE A prop + :
A small round wooden 18th-century tavern card table on a single turned pedestal with three
curved feet, 3/4 view from slightly above, empty top.
```
```
props/candle_lit.png — STYLE C + :
A single white wax candle in a simple brass candleholder, lit, small calm warm flame.
```
```
props/gavel_wood.png — STYLE C + :
A dark wooden judge's gavel resting on a round wooden sounding block, 3/4 view.
```
```
icons/warehouse_icon.png — STYLE A prop + :
A tiny illustrated 18th-century London riverside brick warehouse with a wooden crane hoist,
wooden tea chests stacked at the open door, map icon, 3/4 top-down view.
```
```
props/pamphlet_folded.png — STYLE A prop + :
A small printed pamphlet of 1776, plain cream cover with a thin printed border and tiny
illegible print, slightly open, slight tilt. NO readable title.
```
```
props/rope_tug.png — STYLE A prop + :
A thick twisted hemp rope, perfectly HORIZONTAL, frayed at both ends, long thin object
filling the width.
```
```
props/ship_navy_warship.png — STYLE A prop + :
An 18th-century Royal Navy frigate, side view facing LEFT, chibi proportions, three masts with
furled sails, a row of gun ports with small cannon muzzles along the hull. NO flag anywhere
(the flag is added in animation).
```
(No flag on purpose: AI almost always draws the post-1801 Union with St Patrick's cross. The code flag is correct.)
```
icons/courthouse_icon.png — STYLE A prop + :
A tiny illustrated colonial courthouse: small brick building with a white columned portico and
a pediment, map icon, 3/4 top-down view.
```

### 4.3 Render in Remotion (code already exists)

| File | Used in | How |
|---|---|---|
| `flags/bourbon_france.png` | S20 "France इस जंग में" | `BourbonFrance` is already in `flags.tsx`. Add a `Flag-Bourbon` still composition like the other two and export. |

Price tags, the speech bubble, the myth card, like/share icons, the Part 2 card, the subscribe button, counters, date
cards, pins, the timeline, the highlighter and strike-throughs are all drawn in code. No images needed.

### 4.4 Download — public domain, do not generate (`ASSET_PROMPTS.md` §9)

The asset pack's README confirms these were deliberately not AI-made.

| File | Used in |
|---|---|
| `docs/pd_join_or_die_1754.png` | S03 Paper3D, S03 snake flash, **S20 snake pieces snap together** (needs cutting into 8 pieces) |
| `docs/pd_revere_bloody_massacre_1770.jpg` | S11 spin-in + split screen |
| `docs/pd_common_sense_titlepage_1776.jpg` | S17 |
| `docs/pd_declaration_engrossed.jpg` | S18 drop-in + macro highlighter |
| `docs/pd_proclamation_1763_map.jpg` | Not shown. Used to correct `PROCLAMATION_LINE` before publishing (§10.5). |

### 4.5 Map data — not GPT, but the biggest gap for the core look

| Need | Why it matters |
|---|---|
| **NASA Blue Marble crops** (east coast; North Atlantic with Britain; Europe; India/Bengal; world) | **The satellite style has no imagery at all.** `MapStage` fills it with a flat `#0B2A44`. Satellite is the reference's primary map look, and the cues call for it in S01, S07 and S14. Crop commands are in §10.2. |
| `textures/hillshade_appalachians.jpg` | S04 "tilt 25 + hillshade", S06 "tilts 28° over hillshade". Made from SRTM elevation (§10.3). |
| A land texture for `Map3D` | Demo 3D land is flat tan. Drape the parchment or Blue Marble crop on it. |
| `public/maps/*-10m.geo.json` | **Already in your source zip — copy across.** 50m coastlines will look crude at 4K for the Boston close-ups (S11 pin, S14 harbour, S15 route). |

### 4.6 Sound (not images, but the cues name these files and they don't exist)

`musket_single.wav` (the existing `musket_shot.wav` may simply be renamed), `crowd_angry_loop.wav`,
`wood_crash_cards.wav`, `church_bell.wav`, `horse_gallop.wav`, `quill_scratch.wav`, plus a water splash for S13's
"splash ×N" (no splash file exists).

---

## 5. Count

| | Required | Optional |
|---|---|---|
| ChatGPT, prompt already in sheet | 13 (8 plates, 5 stamps/icons) | 4 (`stamp_limited`, `neon_crown`, 2 `_fg` layers) |
| ChatGPT, new prompts above | 13 (1 character, 12 props/icons) | — |
| Fix existing | 2 (arrow, Olive Branch; `stamp_closed` is counted in the first row) | 2 (Sugar Act restyle, Franklin/clerk face rigs) |
| Remotion still | 1 (Bourbon flag) | — |
| Public-domain download | 4 shown + 1 reference | — |
| Map data | Blue Marble crops, hillshade, 3D land texture, copy 10m geojson | — |
| SFX | 7 | — |
