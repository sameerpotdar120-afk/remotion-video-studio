# Horsefly short: shot list v1, timed to the VO (63.55 s, 1907 frames at 30 fps)
Word timings: `vo_words.json` (faster-whisper small.en). Every shot change is a camera move (no hard cuts); the
"ref type" column points at the matching reference shot in REFERENCE_ANALYSIS.md section 2.

| # | t (s) | VO | shot | ref type |
|---|---|---|---|---|
| 01 | 0.00-2.20 | You barely feel a mosquito, | mosquito drifts down and lands softly on a forearm, front low, cyan glow | fly lands 0-0.8 |
| 02 | 2.20-4.70 | but you always feel a horsefly. | whip: horsefly drops in nose-first and lands hard, skin dents | fly lands 0-0.8 |
| 03 | 4.70-5.90 | Here's why. | push in to head-on face, mouthparts glow once | face 3.8-4.3 |
| 04 | 5.90-7.70 | Only the females bite. | male + female side by side facing camera; male eyes touch, female gap glows yellow | face 3.8-4.3 |
| 05 | 7.70-10.70 | They need the protein in your blood to make their eggs. | x-ray through the female's abdomen: red cells stream in, eggs form and glow | inside 7.6-17 |
| 06 | 10.70-13.90 | A mosquito slides in one thin needle. | macro under the mosquito: one hair-thin proboscis slides into the skin | under fly 1.9-4 |
| 07 | 13.90-17.50 | Clean, quiet, almost invisible. | dive into cross-section: needle slips into a vessel, tissue undisturbed | inside 7.6-17 |
| 08 | 17.50-20.00 | A horsefly brings four blades, | whip out to under the horsefly: four amber blades, glow steps one blade per beat | under fly 1.9-4 |
| 09 | 20.00-22.10 | two mandibles and two maxillae, | glow on the mandible pair, then the maxilla pair | under fly 1.9-4 |
| 10 | 22.10-24.00 | working like tiny knives. | close on serrated edges, scissor motion | skin level 4.3-7.5 |
| 11 | 24.00-25.00 | They don't pierce, | skin level: blades press, skin dents | skin level 4.3-7.5 |
| 12 | 25.00-27.40 | they slice straight through your skin, | red slit opens, camera dives through it | 7.1-8.0 |
| 13 | 27.40-29.50 | and that's the sting you feel. | cross-section: nerve endings flash yellow | inside 7.6-17 |
| 14 | 29.50-32.00 | Then, she doesn't sip from a vein. | cross-section: an intact vessel glows, blades pass it by | inside 7.6-17 |
| 15 | 32.00-33.20 | She waits. | pull out: fly still on the skin, slow push (pause beat) | wide 1.5-1.9 |
| 16 | 33.20-36.80 | She waits for a small pool of blood to form in the cut. | extreme macro skin surface: red-rimmed cut, blood beads and pools | macro skin 20-24.4 |
| 17 | 36.80-38.90 | Her saliva stops it from clotting, | clear glassy saliva drop falls into the pool and spreads | spit 17.3-20 |
| 18 | 38.90-42.70 | while a soft, spongy pad soaks it up like a paper towel. | spongy pad presses into the pool, blood wicks up into it | sponge 24.4-26.6 |
| 19 | 42.70-45.10 | In one meal, some horseflies drink | side view: abdomen swells, turns translucent red | wide / under fly |
| 20 | 45.10-47.40 | about their own body weight in blood, | stylised balance: the fly vs a blood drop of equal size, level | (new) |
| 21 | 47.40-50.50 | which might be why zebras have stripes. | whip out wide: zebra flank in the cyan world | man shoulder 0.8-1.5 (scale shot) |
| 22 | 50.50-52.70 | Horseflies circle them just as much, | flies circling the zebra | (new) |
| 23 | 52.70-56.50 | but they land on them less than a quarter as often as on plain horses. | pan from a plain horse with many flies landed to the zebra with few | (new) |
| 24 | 56.50-58.30 | The stripes break their landing. | slow-mo: a fly comes in fast, fails to brake on the stripes, bounces off | (new) |
| 25 | 58.30-61.30 | So, you barely feel a mosquito, | back to the forearm: mosquito lands softly (mirror of 01) | fly lands |
| 26 | 61.30-63.55 | but you always feel a horsefly. | horsefly lands hard; last frame matches frame 1 framing for the loop | loop 26.8-27.6 |

New assets needed (CC0/CC-BY only): mosquito, zebra, horse; male fly = same model with eyes meeting.

## Assets picked for the new shots (CC-BY, credit in the description)
| use | model | uid (Objaverse dir) | author |
|---|---|---|---|
| mosquito | "MOSQUITO" (realistic, 683k faces; delete its skin plane) | fce3bbae949c4966a6cfd9d757deba9b (000-129) | Branislav |
| zebra + plain horse | "Zebra Anatomy" (standing; one side realistic stripes, other side muscles: film the striped side; brown coat material for the plain horse) | c60aa3efb391448faa955426411d485a (000-138) | Shikaki_Naito |
Rejected: cartoon zebra (AlexaKruckenberg), galloping horse on a plinth (kling), paint horse (low detail),
"Zuk" (a truck scene), gold horse statue scan.

## Measured render cost (final settings: 1440x2560, 128 spp, fur, Cycles CPU, 4 cores)
Fly-landing shot: **8.0 min per frame**. 1907 frames at that rate = ~254 machine-hours.

## Measured cost per scene type (1440x2560, 4-core CPU; setup is only 1-5 s, so this is all render time)
| scene | 128 spp min/frame | 64 spp min/frame |
|---|---|---|
| pad (blood.py pad) | 18.0 | 9.5 |
| bead/saliva (blood.py) | 15.9 | ~9.5 (est.) |
| eyes close-up | 14.0 | ~8.4 (est.) |
| cross-section (xsec.py) | 13.7 | 8.6 |
| mosquito | 9.9 | ~6 (est.) |
| fly exterior with fur | 8.0 | ~4.8 (est.) |
| zebra/horse | 3.7 | ~2.2 (est.) |
64 vs 128 spp (OIDN, adaptive 0.02): PSNR 48.2 dB (xsec) and 46.5 dB (pad), mean abs diff 0.5/255, 99th pct 4-5/255;
indistinguishable in 1:1 crops (review/proof_128_vs_64spp.jpg). Final render uses 64 spp. Total ~220 machine-hours.
