# 11: Reaching 95-100% (scoring and the upgrade path)

## 1. How to score (every video, honestly)
Make a side-by-side of the reference and ours (`tools/sidebyside.sh ref.mp4 ours.mp4 cmp.mp4 1280 ours`) and score 0-10:
| category | 10 means | how to check |
|---|---|---|
| Colour & lighting mood | same palette per scene type, glows soft, nothing blown | `tools/colormatch.py` boxes within ~8 RGB units |
| Edit rhythm & transitions | shot length ~3-4 s, 0 hard cuts, ~5-frame dissolves, camera always moving | `tools/cuts.py` (0 cuts, static < 5%) |
| Captions | same font feel/size/position/timing | crop at swap frames |
| Set detail & ink | every wall dense with drawn detail and ink edges, readable signs | crops of walls at full res |
| Character acting | mood/pose change on every key word, hands doing things, look-at | count changes per 10 s (reference ≈ 5-7) |
| Camera & composition | characters framed large, clear focal point, foreground/background depth | compare key frames |
| Sound | constant bed, effects on every event, -14 LUFS | listen + ebur128 |
**95% = average ≥ 9.5 and nothing below 9.** Report the table with every delivery.

## 2. Where we are (approved baseline, measured)
Reference recreation (`examples/.../our-recreation/`): colour 8 · edit 8 · captions 8.5 · set detail 5 · acting 5 · camera 7 → **~65-70%**.
**This is the floor, not the target.**

## 3. The upgrade path to 95-100% (do these in order; each is measurable)
1. **Ink edges on all 3D geometry** (+1.5 set detail): add an outline post-pass: render normals+depth, Sobel edge detect, multiply
   dark ink lines (2-3 px) onto the frame, OR give every mesh an inverted-hull outline (`BackSide` black shell scaled 1.02). Target: every edge in frame has a dark line like the reference.
2. **Set density** (+1.5): per wall ≥ 4 drawn objects (AC units, pipes, cables, posters, signage, meters, plants, crates), readable
   sign text, wear and grime strokes, and props on the floor. Build a reusable prop library (`props.js`): AC unit, pipe run, cable
   bundle, poster, vending machine, bike, plant, crate stack, bin, lantern, neon board, shop shutter.
3. **Acting** (+2): drive mood/pose from the words automatically: a table `{word: {who, mood, arms}}` applied at word start;
   talking mouth on VO amplitude; blinks; reaction holds of 0.3-0.6 s; every character in frame reacts, not only the hero.
4. **Camera** (+1): tighter framing on characters (hero head ≥ 12% of frame height in mid shots), foreground elements passing the
   lens (out-of-focus props) for depth, motivated moves (follow the walker, push on the reveal).
5. **Neon/colour balance** (+1): street signs at emissive ≤ 1.1, glows ≤ 0.15, one dominant hue per shot + one accent; colour-match
   boxes vs the reference per scene type.
6. **Sound polish** (+0.5): ambience per location (street hum, crowd murmur, machine clatter), Foley footsteps.
7. **Iterate per shot**: 3-6 rounds of render key frame → compare with the matching reference frame at full size and in crops →
   fix the biggest gap. Budget 20-40 min per shot.
Record the new scores after each video; the floor rises every time.
