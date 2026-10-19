# Closest to space: Remotion motion assets

17 components in `src/closestspace/motion/` (entry `src/closestspace/motion/index.ts`), each tested here. All are 60 fps with a transparent background except c13 (black by default). Fonts are Anton and Baloo 2 (Google Fonts, OFL) from `public/closestspace/fonts/`. The plush rig (`Plush.tsx`: two climbers, a cook, a flag) and `theme.ts`/`font.ts` are shared. Nothing in them is copied from the reference: the geoid comes from EGM96 (NGA, public domain), everything else is drawn in code.

**Render one** (4K detail, transparent WebM):
```
npx remotion render src/closestspace/motion/index.ts <id> out/closestspace/<file>.webm --codec=vp9 --pixel-format=yuva420p --scale=2
```
For c13 add `--gl=angle` (three.js). Names: id `c05-peak-label` → file `c05_peak_label.webm`.

| id | component | size | frames | line | what it does |
|---|---|---|---|---|---|
| `c01-peak-pins` | C01PeakPins | 1080×1920 | 240 | 1 (hook) "सोचो, दुनिया का कौन सा देश space के सबसे पास है?" | Pins pop on the big peaks one by one, then lift off on dashed white stems that grow straight up toward space. `pts` = screen points of the peaks, `rise` = frame the stems start. |
| `c02-glow-word` | C02GlowWord | 1080×700 | 200 | 1 "सुनने में easy लगता है, पर है नहीं।" | "EASY" slams in from the top-left glowing green, flips red with a "?" at `flip`, wobbles, punches up at `punch`. `text` prop. |
| `c03-magnifier` | C03Magnifier | 1080×1920 | 240 | 2 "सबसे पहले ढूँढते हैं…" and 9 "तो अब ढूँढते हैं…" | Chrome magnifying glass hunts along `path` ([frame, x, y] keys), the lens showing the scene 1.7× bigger; at `fill` the lens grows to cover the screen (the dive). Pass the map as `children`; renders a test pattern on its own. |
| `c04-zoom-blur` | C04ZoomBlur | 1080×1920 | 60 | every scene change | Fast push with a radial zoom blur peaking at `at` (`dir` 1 in, -1 out, point `ox`,`oy`). Wraps `children`. |
| `c05-peak-label` | C05PeakLabel | 900×700 | 150 | 2 "Everest, 8,849 मीटर" and 9 "Chimborazo, 6,263 मीटर" | Red triangle drops onto the summit with a ripple, a leader line draws up, a glowing pill pops with the name and the height ticks up. Props `name`, `count`, `unit`. |
| `c06-climber` | C06Climber | 1080×1400 | 200 | 2 "दुनिया की छत।" | Plush mountaineer scrambles up a snowy summit, plants a flag at `plant` (it unfurls and flaps), throws his arms up and hops with snow puffs. `who` climberA/climberB, `flag` colour. |
| `c07-red-x` | C07RedX | 1080×1920 | 110 | 4 "पर ये ग़लत है।" | Small red X pops, grows big with an overshoot, the frame washes red, then it shrinks back and the red drains at `out`. |
| `c08-flat-earth` | C08FlatEarth | 1080×1920 | 130 | 4–5 "वो चपटी है। हाहा, मज़ाक कर रहा हूँ।" | Cartoon flat-earth disc slides in from the right with a bounce and a slow wobble, then slides off left at `out`. |
| `c09-sphere-geoid` | C09SphereGeoid | 1080×1080 | 160 | 5 "पर वो perfect गोल ball भी नहीं है।" | White ring traces round the globe, "गोल" pops with a hand-drawn arrow; at `strike` a red slash, the letters scramble and fall, "Geoid" types in letter by letter. Props `first`, `second`, `r`. |
| `c10-spin-arrows` | C10SpinArrows | 1080×1080 | 270 | 6 "धरती अपनी धुरी पर घूमती है…" | Spin swooshes orbit the globe, then arrows push out at the equator (`stretch`) and in at the poles (`squash`). Export `bulge(f)` gives the globe's x/y scale. |
| `c11-rumali-roti` | C11RumaliRoti | 1080×1400 | 300 | 6 "…जैसे हवा में घुमाई हुई रूमाली रोटी फैल जाती है।" | Plush cook spins a roti on his fingertips; it spins faster and stretches wider and thinner, with speed lines and flour dust. |
| `c12-lumpy-glow` | C12LumpyGlow | 1080×1080 | 150 | 7 "ऊपर से पहाड़, गहरे समुंदर और अंदर का uneven वज़न।" | Glowing yellow lumpy outline crawls once round the squashed globe from the top, clockwise, then keeps wriggling. `rx`, `ry`, `dur`. |
| `c13-geoid` | C13Geoid | 1080×1080 | 480 | 7 "इन सबको हज़ारों गुना बड़ा करके देखो…" | Our own potato: the EGM96 geoid (NGA, public domain, baked into `egm96_2deg.json`) as a sphere displaced about 7,000×, coloured blue (low) to red (high), growing in over `grow` frames then tumbling. Black background (`bg={null}` for transparent). Uses three.js. |
| `c14-radius-lines` | C14RadiusLines | 1080×1080 | 180 | 8 "…poles के मुकाबले 21 किलोमीटर ज़्यादा है।" | Centre dot, blue line to the pole "6,357 km", red line to the equator "6,378 km", then "+21 km" pops in gold at `plus`. |
| `c15-tape-measure` | C15TapeMeasure | 1080×1080 | 200 | 10 "पर धरती के center से नापो…" | Tape-measure case at Earth's centre, two yellow tapes unroll to the two summits with plush climbers on them; 6,382 km (blue) and 6,384 km (red) pop, "+2 km" in gold, the Chimborazo climber cheers and the Everest one droops. |
| `c16-answer-type` | C16AnswerType | 1080×1080 | 180 | 11 "मतलब space के सबसे पास Nepal या China नहीं, Ecuador है।" | "Ecuador" types in glowing gold letter by letter, "space के सबसे पास" types under it, a curved arrow draws to a white-gold flare at (`px`,`py`). |
| `c17-send-pop` | C17SendPop | 600×600 | 120 | 12 "ये video उस दोस्त को भेजो…" | Round send button pops and pulses like a tap, then a paper plane launches out on a dashed trail at `launch`. |

**Render all:**
```
for c in c01-peak-pins c02-glow-word c03-magnifier c04-zoom-blur c05-peak-label c06-climber c07-red-x c08-flat-earth c09-sphere-geoid c10-spin-arrows c11-rumali-roti c12-lumpy-glow c13-geoid c14-radius-lines c15-tape-measure c16-answer-type c17-send-pop; do
  g=''; [ $c = c13-geoid ] && g='--gl=angle'
  npx remotion render src/closestspace/motion/index.ts $c out/closestspace/${c//-/_}.webm --codec=vp9 --pixel-format=yuva420p --scale=2 $g
done
```

The code zip is `exports/closestspace_remotion_code.zip` (the motion folder plus the fonts).
