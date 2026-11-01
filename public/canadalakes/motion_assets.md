# Canada lake names: motion assets (Remotion code)

Built and tested here (`src/canadalakes/motion/`, test composition `CaMotionTest` in `src/canadalakes/test.tsx`).
All are 60 fps, sized for 1080×1920 (render at `--scale=2` for 4K), text-free except where the text is a prop.
They copy the reference's timing measured frame by frame. Defaults are big, to fill the reel.

| Component | Reference | Line | What it does |
| --- | --- | --- | --- |
| `QuestionStorm` | 16.2–19.9 s | 2 ("हर एक का नाम रखना था") | ~220 "???" labels pop in (6-frame overshoot each), then all fly to the centre, shrink and fade |
| `ThoughtBubble` | 29.6–33.3 s | 5 ("फिर नाम ख़त्म होने लगे") | two small circles pop 4 frames apart, the cloud springs open, three dots pulse in turn |
| `PeopleCrowd` | 37.6–43.3 s | 6 ("शिकारी और लकड़हारे") | 22 white person icons rise into a crowd 2 frames apart, then bob gently |
| `PinDrop` | 20.5–27 s, 43–50 s | 3, 7, 8 | a red pin falls (7 frames), squashes, a ring ripples from the tip, the boxed label slides up |
| `WhipCard` | 27.43 s, 28.63 s | 4, 5 | a picture card whips in from the right in 5 frames with heavy motion blur, settles tilted 2°, slow push; leaves left the same way |
| `TypeOn` | 0.87 s, 61–66 s | 9, 10 | types text one character every 2 frames with a caret; two-tone tail |

Still to rig when the images arrive: the cat walking across the keyboard (c01 + c02 on c03: body slides and bobs with
the step rhythm, tail sways from its base), the two cartographers (c04, c05 pop in on c06 with a shake), the trout
wriggling on the hook (c07 swings from the line). The map (EOX Sentinel-2, Natural Earth lakes and borders, red Canada fill,
cyan lake fills, labels, whips, camera) is built here as always.

Test render (stills): `node stills.mjs src/canadalakes/test.tsx <out> CaMotionTest 20 60 85 135 160 250 330 420 470 560`
