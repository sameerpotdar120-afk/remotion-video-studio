# Reference analysis: "The Window That Breaks Japan's Gambling Law" (private analysis only)

## Specs
- 1080x1920, 30 fps, 45.09 s, H.264 + AAC 44.1 kHz stereo, loudness -14.3 LUFS.
- 161 spoken words in 45 s = **3.58 words/s** (fast, energetic; ~215 wpm). Pauses only 0.2-0.6 s.
- A constant audio bed under the voice (pauses sit only ~5-7 dB below speech): music and/or ambience (street, pachinko).

## Story structure (explainer of a legal loophole)
| t (s) | beat | narration (paraphrased) |
|---|---|---|
| 0-4.9 | hook: paradox | X is illegal, yet it's on every street |
| 4.9-10.1 | world-building | inside: noise, lights, people carrying winnings |
| 10.1-13.4 | the mystery | police walk past, nobody arrested |
| 13.4-24 | "you" journey 1 | you win, try to cash in, get prizes instead (list: 4 items) |
| 24-30 | "you" journey 2 | follow the guy in front with the tokens to a window with no sign |
| 30-40.5 | the reveal | the window is legally a separate shop buying the tokens |
| 40.5-45 | payoff + loop | the cash changes hands; "on paper, nobody gambles" → loops to "Gambling…" |
Second-person ("you") makes the viewer the protagonist. The last word ("gambled") loops into the first ("Gambling").

## Edit grammar (measured)
- **Zero hard cuts.** Every shot change is a **4-6 frame cross-dissolve combined with camera motion** (push, crane, dolly).
- ~12 shots / 45 s → **one shot every ~3.7 s** (slower than the 3D explainer style); inside a shot the camera
  **never stops** (only 2.7% static frames): slow dolly, push-in, crane up, orbit.
- Transitions at ≈ 2.1, 4.7, 10.5, 13.9, 16.4, 24.0, 27.0, 30.5, 37.2, 40.8, 43.6 s.

## Shot list
| # | t (s) | shot | camera |
|---|---|---|---|
| 1 | 0-2.1 | narrow night alley: a character walks through the foreground; two others at a lit window with crates, a cat and plants | slow push |
| 2 | 2.1-4.7 | street level, neon vertical signs with arrows, rain-wet reflective road, a parked car → crane up to an aerial night city grid | crane up / fly over |
| 3 | 4.7-10.4 | inside a hall: long symmetric aisle, rows of machines, red stools, patterned red carpet, ceiling light strips; seated characters; tall stacked buckets carried past | dolly forward down the aisle |
| 4 | 10.5-13.9 | exterior hall entrance (gold sign, auto door, posters); police character strolls past | slow push |
| 5 | 13.9-16.4 | close: the "you" character at a machine, balls pour into a bucket | push in |
| 6 | 16.4-24.0 | prize counter (shelves of goods, clerk); items appear one by one on the counter on their words | slow drift/push |
| 7 | 24.0-27.0 | exit (THANK YOU sign, auto door opens to blue night) — another character leaves with tokens | push |
| 8 | 27.0-30.5 | street: following him around the corner to a small lit window in the wall | dolly / follow |
| 9 | 30.5-37.2 | over-the-shoulder: character from behind at the glowing window, long slow push | very slow push |
| 10 | 37.2-40.8 | wide: hall entrance + queue of people at the window | pan / drift |
| 11 | 40.8-43.6 | close: character slides tokens, a hand slides cash back | push |
| 12 | 43.6-45 | payoff: police with a clipboard log "NONE ✓", happy old lady with her prize — same alley as shot 1 (loop) | drift |

## Look
- **World = 3D, drawn like 2D:** real 3D geometry (perspective, parallax, depth of field) but textured to look hand-drawn:
  dark ink outlines on every edge (line-art pass), flat-ish colours, hand-drawn details (air-con units, cables, signs,
  posters with readable text), patterned carpet texture.
- **Cinematic lighting:** night scenes in deep blue/violet with warm practical lights (lit windows, lanterns, neon pink/
  cyan signs), volumetric glow/bloom around lights, wet floors with coloured reflections, vignette; interiors warm
  (cream walls, long fluorescent strips, golden haze down the aisle).
- **Shallow depth of field** in most shots (foreground/background blur).
- **Characters = flat 2D cartoon cut-outs in the 3D world:** bean/egg-shaped coloured bodies (orange, purple, blue),
  big round white heads, thick dark outlines, stick legs, simple stick arms with small hands, minimal faces (dot or
  line eyes, brows, small mouth), accessories define them (camera strap, sunglasses, police cap, glasses, fluffy white hair,
  bob haircut). They take the scene lighting (rim light, tint) and cast shadows.
- **Faces act every beat:** smug, sly, grimace, wide grin, squint.
- Props carry story text: shop signs, price tags, "PATROL LOG – GAMBLING: NONE ✓" clipboard (text-as-punchline).

## Captions
- **1 word at a time** (sometimes 2-3 short words: "past the door," "the shop"), swapping on each word.
- White, bold heavy rounded-geometric sans (Montserrat/Poppins ExtraBold–Black feel), lowercase except sentence starts,
  punctuation kept; thin black outline + soft dark drop shadow.
- Centre-aligned, x = 540, glyph tops at **y ≈ 1323 (69% height)**, text height ≈ 55 px (≈ 75-80 px font).

## What it would take for us to match it at ~90%
- **Engine:** Blender (Cycles CPU here) with Line Art/Freestyle ink outlines, hand-painted-look textures, volumetric
  light, bloom-like glare, DOF, wet reflective floors; 2D characters drawn with our ink-cartoon kit as image cut-outs
  (planes) placed in the 3D sets — or the faster "Tall Tale 3D" three.js engine (2D people in a 3D world, one-word
  captions) as a quicker path at lower fidelity.
- **Heaviest work:** set dressing (dense, text-rich sets: alley, neon street + aerial city, machine hall, counter, exit,
  window), and character acting per beat.
- Original script, our own characters and topic; no reuse of this video's audio, frames or designs.
