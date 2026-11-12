# 05: Style bible (locked numbers; measured from the reference and approved by the creator)

## Frame and edit
- 1080x1920, 30 fps, 40-50 s. One shot every ~2.5-4 s, roughly one per sentence.
- **Zero hard cuts.** Every change = cross-dissolve, `XF = 0.085` s half-length (~5 frames total) on top of camera motion.
  Cut 2-4 frames before the sentence's first word.
- **The camera never stops**: dolly / push-in / crane / follow / drift on every frame. Avoid ease curves that park the camera:
  keep a small drift through holds.
- Loop: the last shot returns to the first location/framing, and the last line flows into the first.

## World (3D drawn as 2D)
- Simple geometry (planes, boxes, cylinders) carrying **hand-painted canvas textures**: flat colour + grain + ink seams +
  ink frame on every face (`inkBox`, `frame()`); drawn props with readable text (signs, posters, boards, labels).
- **Night exteriors:** walls `#7479c8→#5a5eb0`, hemisphere `#6a74ff`/`#2a2260` ×1.5-1.7, warm practicals `#ffd27a`, neon accents
  (pink `#ff2f8a`, cyan `#22c8e8`, orange `#ff8a1f`, green `#3ae28a`) at emissive 1.0-1.25, wet floors (roughness 0.22-0.32),
  glow sprites 0.1-0.25 opacity, fog `#141644` 14-40 m.
- **Warm interiors:** cream/gold walls `#f0dcae`, fog `#f6dca8`, hemisphere `#fff0d0`/`#b06a50` ×1.5, red carpet `#8f1f24` with gold
  diamonds `#d99a3a`, light strips `#fffdf0`.
- **Cool official interiors** (customs, offices): `#b8bce6→#9aa0d8` walls, hemisphere `#dfe6ff` ×1.35, fluorescent strips.
- Never blow out a light: a lit window/door/sign must keep its drawn detail (emissive ≤ 1.25 on detailed textures; point lights ≤ 16).

## Characters
- 2D cut-outs (`Actor`) on upright planes facing the camera, emissive 0.42 so they read in the dark, blob shadow under the feet.
- Same build for everyone (bean body, round white head, tube limbs). The hero's look is locked (`reference/04`).
- Extras: other hair (`mop`, `afro`, `topknot`), hats (`beanie`, `police`), `phones`; body colours from: `#e8a23a #d85a6a #3f6fb8
  #3aa878 #8a5ad8 #4a4f6a #d8402e #2f8f6a`. Officials: navy `#2a4a9a` + `hat: 'police'`.

## Post (engine `render` look)
bloom 0.30-0.42 (threshold 0.80-0.86), aperture 0.00012-0.0005 (tiny DOF), vignette 0.30-0.45, grain 0.012, saturation ×1.15-1.2,
exposure 0.92-1.0.

## Captions (locked)
Montserrat Black 78 px, white, black outline 9 px, soft drop shadow (blur 10, offset 3,6), centred at x 540, baseline y 1381.
ONE word at a time; short words (a, the, to, of, in, is, it, we…) ride with the next word when they're close (≤ 0.2 s). Keep
punctuation. No coloured keywords. Never over the hero's face: move the character or the camera instead.

## 2D overlays (sparingly, for punchlines)
Rubber stamps (`stamp(ctx, 'BANNED', x, y, rot, k)` red `#e0262e`), props with text (clipboards, signs). Max one per 10 s.
