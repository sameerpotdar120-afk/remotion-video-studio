# Animation plan: 63.55 s VO, 30 fps, frames 1-1907 (frame = round(t*30)+1)

Rules (from REFERENCE_ANALYSIS.md): no hard cuts. Each shot ends with a fast camera move (whip / push / dive)
that the next shot starts with, decelerating; real motion blur (shutter 0.5) on those frames. The camera always
drifts. One glowing part at a time, landing on the word. The last frame matches the first frame (loop).

Key word frames (from vo_words.json): females 194, eggs 296, needle 394, four 561, blades 576, mandibles 609,
maxillae 641, slice 761, sting 851, vein 941, waits 971, saliva 1112, spongy 1194, weight 1391, zebras 1466,
circle 1533, quarter 1633, stripes 1708, mosquito (2nd) 1814, horsefly (2nd) 1883.

| # | frames | script / mode | subject & move | glow / event on frame |
|---|---|---|---|---|
| 01 | 1-66 | mosq.py | mosquito drifts down, lands softly on forearm skin; slow push; ends with a whip right | - |
| 02 | 67-141 | shots_me.py (fly landing) | whip in; horsefly drops nose-first, lands hard, skin dents; push to face | - |
| 03 | 142-177 | shots_me.py k1-style | push into the head-on face | mouthparts pulse ~150 |
| 04 | 178-231 | eyes.py male -> female | male head (eyes meet), whip to female head | gap glows 194-231 |
| 05 | 232-321 | xray.py | side x-ray of abdomen: blood cells stream in, eggs appear | eggs glow 296+ |
| 06 | 322-417 | mosq.py (macro under) | macro under the mosquito; proboscis slides into skin | needle glint 394 |
| 07 | 418-525 | xsec.py needle | dive through skin: needle slips into vessel, tissue undisturbed | - |
| 08 | 526-600 | xsec.py blades (wide) | whip out to under the horsefly: four amber blades | glow steps 561, 576 |
| 09 | 601-663 | xsec.py blades | mandible pair then maxilla pair | 609 mandibles, 641 maxillae |
| 10 | 664-720 | xsec.py blades close | serrated edges scissor | teeth glint |
| 11 | 721-750 | shots_me.py skin level | blades press, skin dents | - |
| 12 | 751-822 | blood.py bead (cut opens) | red slit opens; camera dives into it | cut lips flash 761 |
| 13 | 823-885 | xsec.py | cross-section: nerve endings flash yellow | 851 sting |
| 14 | 886-960 | xsec.py | vessel intact, glows, blades pass it by | vessel glow 941 |
| 15 | 961-996 | shots_me.py wide | pull out: fly still on skin, slow push (pause) | - |
| 16 | 997-1104 | blood.py bead | blood beads and pools in the cut | - |
| 17 | 1105-1167 | blood.py saliva | clear saliva fills the cut | saliva glints 1112 |
| 18 | 1168-1281 | blood.py pad | spongy pad presses in; blood wicks up (soak 0 -> 0.6) | pad glow 1194 |
| 19 | 1282-1353 | xray.py-style side | abdomen swells red | - |
| 20 | 1354-1422 | balance.py | beam settles level (tilt 8 -> 0) | drop glints 1391 |
| 21 | 1423-1515 | zebra.py | whip out wide: zebra in the cyan world | stripes 1466 |
| 22 | 1516-1581 | zebra.py + flies | flies circle the zebra | 1533 |
| 23 | 1582-1695 | zebra.py horse -> zebra | pan from horse with many flies to zebra with few | 1633 quarter |
| 24 | 1696-1749 | zebra.py flank + fly | slow-mo fly fails to brake, bounces off | 1708 |
| 25 | 1750-1839 | mosq.py | back to the forearm, mosquito lands softly (mirror of 01) | - |
| 26 | 1840-1907 | shots_me.py landing | horsefly lands hard; last frame = frame 1 framing for the loop | - |
