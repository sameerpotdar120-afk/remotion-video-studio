# REMOTION ANIMATION CODE — 4K (3840×2160) @ 60 fps

The complete motion system for the video, rebuilt from the frame-by-frame analysis of the
reference (`analysis/reference-framelog.md`, 5,062 frames). Every number here comes from that
analysis, doubled from the reference's 30 fps to our 60 fps.

**Status: real code, not pseudo-code.** Everything below is the actual source in this repo. It
type-checks with zero errors (`npx tsc -p .`) and was test-rendered at full 4K 60 fps
(`3840×2160, 60/1, h264` confirmed with ffprobe). Placeholder art was used in the test; drop in the
GPT assets from `docs/ASSET_PROMPTS.md` with the same file names.

---

## 1. Setup

```bash
npm install
npm install @remotion/paths@4.0.523 @remotion/noise@4.0.523 @remotion/transitions@4.0.523 \
  @remotion/motion-blur@4.0.523 @remotion/shapes@4.0.523 @remotion/fonts@4.0.523 \
  d3-geo@3.1.1 topojson-client@3.1.0
npm install -D @types/d3-geo @types/topojson-client @types/geojson
npx remotion studio                      # preview
```

All `@remotion/*` packages MUST be the same version as `remotion` (4.0.523 here).

**Render**

```bash
# one scene at a time (recommended at 4K60)
npx remotion render src/index.ts Demo-MapHook out/maphook.mp4
# master for colour grading (10-bit ProRes 422 HQ)
npx remotion render src/index.ts Demo-MapHook out/maphook.mov --codec=prores --prores-profile=hq
# quick preview at 1080p
npx remotion render src/index.ts Demo-MapHook out/preview.mp4 --scale=0.5
```

**Speed:** the 4K60 test rendered at ~1 frame/second on a 4-core cloud machine. A 15-minute video is
54,000 frames, so render **scene by scene** (each a few hundred frames), on your fastest machine, and
join with `ffmpeg -f concat`. An 8–16-core machine will be several times faster; Remotion Lambda is
the option for the whole film in minutes.

---

## 2. Motion grammar (frames @ 60 fps)

| Move | Frames | Reference (30 fps) |
|---|---|---|
| Prop / icon pop: 1-frame squash → overshoot ~110% → 100% | 8 + 6 settle | 2–6 f |
| Stamp: appears at 150% for 1 f → 100% | 6, then 8 f micro-shake | 3 f |
| Stamp lands after a cut | 20 | ~10 f |
| Wind-up before a slam (shrink, rise) | 16 | 4–15 f |
| Whip-pan (directional blur) | 8 | 3–5 f |
| Zoom-blur transition | 10 | 3–9 f |
| Zoom punch to read a document (2.5–4×) | 10 | 3–6 f |
| Comic slide-in with blur | 7 | 3–4 f |
| Character travelling across a map | 34 | 15–18 f |
| Stagger between repeated items | 3 | 1–3 f |
| Musket raise / offset between soldiers | 12 / 8 | 6 / 3–5 f |
| Lip-flap cycle | 10 | 4–6 f |
| Glove point/pump cycle | 16 | 8 f |
| Blink (every ~2.7 s) | 5 | 2–3 f |
| Strike-through | 14 | 6–7 f |
| Spoken-list item spacing | 44 | 18–25 f |
| Title entry (slam-down / type-on 1 char per 2 f) | 12 | 4–8 f |
| Colony fill per state (white flash → colour) | 14 | 6–8 f |
| Neon outline hold | 44 | 22 f |
| "Let it land" hold | 200 | 84–150 f |
| The one black hold | 62 | 31 f |
| Camera drift during holds | +1.2 % zoom / s | camera never stops |

---

## 3. How a scene is assembled

```tsx
<AbsoluteFill>
  <Shake hits={[...gunshot/stamp frames]}>        {/* screen shake */}
    <ZoomPunch start={..} focus={[x, y]}>          {/* optional punch-in */}
      <Grade>                                       {/* contrast / saturation */}
        <MapStage style="parchment" camera={[...]}
          world={<>{/* SVG in world px: fills, outlines, lines */}</>}
          overlay={<>{/* screen px: pins, labels, characters, props */}</>} />
      </Grade>
    </ZoomPunch>
  </Shake>
  <Finish />                                        {/* warm soft-light, vignette, film grain */}
  <Sfx at={..} file="stamp_slam.wav" />
</AbsoluteFill>
```

**Syncing to the VO:** export the ElevenLabs audio with word timestamps (ElevenLabs "with timestamps"
output, or run Whisper on the WAV). Cue frame = word start time (s) × 60. Every `start`, `at`,
`hits` and `talk` value in a scene comes from that list, so stamps land on the exact word,
like the reference.

**Map camera:** `{ frame, lon, lat, span }`, where `span` is the degrees of longitude visible
across the frame. Useful presets:

| Shot | lon | lat | span |
|---|---|---|---|
| World (Seven Years' War) | 0 | 25 | 330 |
| North Atlantic (Britain ↔ colonies) | −40 | 44 | 80 |
| Eastern North America | −78 | 37 | 30 |
| New England | −71.5 | 42.5 | 7 |
| Boston / Lexington / Concord | −71.2 | 42.4 | 1.2 |
| Western Pennsylvania (Jumonville Glen) | −79.6 | 39.9 | 4 |
| Great Britain | −3 | 54 | 14 |

`tilt: 20–30` on a key gives the 3D-terrain look (use with the hillshade raster).

---

## 4. Scene recipes for our VO (in order)

Cues are relative to the start of each scene. Replace them with the frames from your VO timestamps.

1. **Hook** (`satellite` → parchment): camera World → Eastern NA (`ease.out`, 70 f) · `ColonyFill` start 30 ·
   `NeonOutline` (all colonies) at fill end · `FlagFill` (href = `assets/flags/grand_union_1775.png`, exported from the `Flag-GrandUnion` composition; seed = Philadelphia) · `TimelineRuler`
   1775/**1776**/1777 → rewind to 1762/**1763**/1764 (+ `rewind_tape.wav`) · `LineWipe` to parchment.
2. **13 colonies**: `RegionEyes` per colony (stagger 3, mood `angry`, look ±1 = bickering) · pop
   `pd_join_or_die_1754.png` with `PopIn` + `franklin` puppet · `StampSlam` stamp_rejected on "शुक्रिया".
3. **Jumonville Glen**: camera → Western PA, `tilt 25` + hillshade · `MapPin` "Jumonville Glen / 28 May 1754" ·
   `ZoomBlurOut` → `bg_forest_ohio_1754_dawn` plate · `washingtonYoung` puppet + one `MuzzleSmoke` ·
   back to world map: `Territory` fills spreading (Europe, India, Caribbean) · `MapTitle` "Seven Years' War (1756–1763)".
4. **Debt**: `Territory` French Canada → red (`mode:'smash'`) · `MapCharacter` Britain + `DropIn` crown ·
   `StampSlam` stamp_debt with `handleSrc` (wind-up) · Britain travels west (`path`), glove `point` at colonies,
   `talk` on the line "bill कौन भरेगा".
5. **Proclamation Line**: camera `tilt 28` over the Appalachians · `DrawLine` (dash 34) · settler puppets bump the line.
6. **Sugar Act**: Britain `holding` doc_sugar_act → `ZoomPunch` · price tag `6d` → strike → `3d` (`StrikeThrough`) ·
   `Territory` flash on smuggling coast · `NeonIcon` red X on "jury".
7. **Stamp Act**: four background plates cut every ~50 f; `StampSlam` stamp_taxed 20 f after each cut ·
   tavern: `Fling` table + `playing_card_single` ×8 with random vx/vy · `bg_liberty_tree_1765` ·
   `MapPin` New York "Stamp Act Congress / October 1765" + 9 colonies `ColonyFill` (`per 3`) · `MapTitle` slogan.
8. **Repeal / Declaratory Act**: `PaperTear` on the Stamp Act · `ZoomPunch` doc_declaratory_act + `Highlighter` on "in all cases whatsoever".
9. **Townshend**: doc_townshend_list, items pop on `listGap` (44 f) · redcoat squad `SlideIn` onto Boston.
10. **Boston Massacre**: `IrisBlob` → pin "Boston / 5 March 1770" → `ZoomBlurIn` King Street plate · crowd puppets
    `talk` · `Fling` snowball + `ImpactPuff` · three `redcoat` puppets, `musketOffset` 8 · `MuzzleSmoke` + `Shake` ·
    `fallAt` on casualties · `Fling`-in `pd_revere_bloody_massacre_1770` (spin, blur) · `attucks` puppet, respectful hold.
11. **John Adams**: courtroom plate, `johnAdams` puppet `talk`, soldiers' moods switch to `smile` on "बरी".
12. **Tea Act → Tea Party**: doc_townshend_list strikes Glass→Paper, `MarkerLoop` on Tea · wharf plate ·
    `teaPartyDisguised` ×3 with `hop` up the gangplank · `Fling` tea_chest ×N into the water + `splash_crate.wav`
    · counter to 342 (`MapTitle` mode 'type') · title "Boston Tea Party / 16 December 1773".
13. **Intolerable Acts + First Congress**: Britain `furious` slide-in · `StampSlam` closed / limited · redcoat squad ·
    `ColonyFill` (`color C.congressOrange`, ids without 'georgia') · `MapTitle` "First Continental Congress / 5 September 1774".
14. **Lexington**: night map, `PopIn` lantern_pair · `paul_revere_on_horse` travelling along a `DrawLine` route ·
    myth card with `NeonIcon` red X · dawn plate, 5-second hold with camera drift · ONE `MuzzleSmoke`, `fallAt` ·
    `WordReveal` "The shot heard round the world." · `BlackHold` (62 f) · Concord route map with small smoke puffs.
15. **Washington / Bunker Hill / Olive Branch**: `ColonyFill` army spawn (continental puppets cascade) · `ArrowLabel`
    "George Washington" · Breed's Hill plate, `MuzzleSmoke` ×many · Washington holds doc_olive_branch_scroll →
    camera follows it across the Atlantic (camera keys only, no cut) → `king_george_iii` `PaperTear`.
16. **Common Sense**: print-shop plate · `pd_common_sense_titlepage_1776` `PopIn` · copies `Fling` across the map.
17. **July 2 / July 4**: `TimelineRuler` Jul 1/**Jul 2**/Jul 3 → Jul 4 · `ballot_raised_fist` cascade (12 colonies; New York gets none) ·
    `FlagFill` GrandUnion again (callback to the hook) · `DropIn` declaration → `ZoomBlurIn` to the macro scan ·
    `Highlighter` "All men are created equal" (chars = 29).
18. **Monticello**: porch plate with `marthaJefferson` + `patsyJefferson` · slow pull-back (camera-only) to `bg_monticello_1776`
    with `enslavedWorkerMan` / `enslavedWorkerWoman` puppets standing still. No gag, no SFX hit, music drops.
19. **Payoff**: recap icons `PopIn` along a `DrawLine` timeline route (one per law, 20 f apart) · colonies `NeonOutline`.
20. **Close**: parchment war map, `Territory` red vs blue, mini flags (code flags) `PopIn` with `stagger 3` · `MapTitle`.

---

## 5. Colour grade (studio look)

1. In-code: `<Grade>` (contrast 1.06, saturation 1.08) + `<Finish>` (warm soft-light 6 %, vignette 32 %, animated grain 6 %).
2. Better: render **ProRes HQ**, grade in DaVinci Resolve (free): gentle S-curve, lift shadows to warm brown,
   highlights slightly cream; keep map blues/reds saturated with a qualifier.
3. Or apply a `.cube` LUT with ffmpeg:
   ```bash
   ffmpeg -i maphook.mov -vf "lut3d=file=filmic_warm.cube" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -r 60 maphook_graded.mp4
   ```
4. Loudness for YouTube: VO −14 LUFS integrated, music bed ~20 dB under the VO, true peak ≤ −1 dBTP
   (the reference clipped above 0 dBFS — don't copy that).

---

## 6. Using this with ChatGPT's Remotion connector

Paste section 2 (motion grammar) plus the source files the scene needs (always include `constants.ts`,
`easing.ts` and the component files you use), then ask:
*"Using ONLY these components and timings, build `src/scenes/S10_BostonMassacre.tsx` for 3840×2160 @ 60 fps.
VO cue frames: …"*. Keep new code inside these primitives so every scene shares the same motion language.

---

## 7. Source code (verbatim from the repo)
