# Reference short: "60 seconds before the nuke" (Hiroshima), micro-frame analysis

The user supplied a reference for analysis only: a 65 s vertical short. The new video copies its editing style
exactly, uses its audio, and swaps every character and prop for new designs. The numbers below are measured
from all 3,901 frames.

## 1 · File

| | |
|---|---|
| Video | H.264, **720 × 1280 (9:16), 60 fps CFR**, 3,901 frames, **65.017 s** |
| Audio | **None in the supplied file.** It is a YouTube video-only stream ("videoplayback"). The audio must be supplied separately. |

## 2 · Structure

The video counts down 60 → 50 → 40 → 30 → 20 → 10 → 5 → 2 → 1. A stopwatch card on black separates the story
beats; the story itself is told through illustrated scenes with word-by-word captions. There are 25 shots
(frame-exact; frame = t × 60).

| # | In (s) | Len (s) | Shot | Camera (measured) |
|---|---|---|---|---|
| 1 | 0.00 | 4.73 | Old man eating rice (close-up); the wife drinking tea is revealed. The "60" stopwatch is overlaid at 0.15–1.25 s. | Holds ~1 s, then **pulls back to 0.63×** with an ease-in-out, drifting left and down |
| 2 | 4.73 | 3.32 | Soldier cranking an air-raid siren in front of a building; a blurred foreground soldier frames the left edge | Linear pull-back to 0.81× |
| 3 | 8.05 | 4.43 | B-29 high in the sky, treetops at the bottom, then a **tilt down** to two soldiers waving it off | Fast tilt: the full frame height in ~1 s (9.6–10.4 s); 0.90× pull |
| 4 | 12.48 | 0.95 | **"50" card** | Pop (see §4) |
| 5 | 13.43 | 3.68 | Husband reading at a low table, folding the newspaper; the wife walks in from the left | 0.88× pull, pan right |
| 6 | 17.12 | 3.33 | Schoolkids walking on a hill, sunny sky | 0.90× pull, parallax |
| 7 | 20.45 | 1.12 | **"40" card** | Pop |
| 8 | 21.57 | 2.57 | Top-down map of Hiroshima's rivers with a target reticle at the centre | Flat pan, uniform 52 px/s right and 18 px/s down; no zoom |
| 9 | 24.13 | 4.25 | Husband from behind, then **a pose swap** to his front, frowning, listening | Slight pull (0.97×) |
| 10 | 28.38 | 0.97 | **"30" card** | Pop |
| 11 | 29.35 | 1.87 | Husband stands with the paper and walks to the window | Fast pull 0.67× and pan |
| 12 | 31.22 | 1.02 | Husband with his hands cupped at his face, looking out of the window | Near static |
| 13 | 32.23 | 3.57 | A single B-29 crossing a bright sky; hexagonal lens flare | Static frame; the plane drifts and the clouds parallax |
| 14 | 35.80 | 1.17 | **"20" card** | Pop |
| 15 | 36.97 | **8.35** | Husband seated, arms crossed, glasses, worried. The wife enters from the right, gesturing "sit". A **thought bubble with a siren icon** pops in at 43.4 s. | Slow pull 0.87×, mostly between 40 and 43 s |
| 16 | 45.32 | 1.03 | **"10" card** | Pop |
| 17 | 46.35 | 6.77 | Looking up into the sun: sunburst rays and a pink lens streak, a tiny plane silhouette; **a speck drops** at about 47.8 s and falls slowly | Near static; the plane and the speck animate |
| 18 | ~50.8 | (dissolve) | **Cross-dissolve, ~0.2 s**, into shot 19 | |
| 19 | 51.0 | 2.1 | High angle: the old man squinting up, hand shading his eyes, by the window | Slow drift |
| 20 | 53.12 | 0.68 | **"5" card** | Pop |
| 21 | 53.80 | 1.58 | The bomb (Little Boy shape) falling, big in frame, small clouds passing | Clouds stream up; ends in a **vertical whip-blur transition** (55.0–55.4) |
| 22 | 55.38 | 1.47 | Close two-shot: the husband says "Honey, I think it's better to go…" | Slight push |
| 23 | 56.85 | 0.43 | **"2" card** (shorter) | Pop |
| 24 | 57.28 | 1.13 | Close-up: his hand slides in and reaches for hers | Static; the hand animates in |
| 25 | 58.42 | 2.15 | **"1" card**, which **dissolves (~0.3 s, 59.0–59.3) into** the couple hurrying across the room. Light blooms; luma climbs 77 → 233 over 59.2–60.5 s to a white-out. | |
| 26 | 60.57 | 4.45 | White frame with **pencil cross-hatch "shadows"** of the couple (the Hiroshima shadows). **Line boil at 12 fps** (a new drawing every 5 frames); the sketch fades out over 61–64.2 s; the background **fades white → black** over 64.4–65.0 s. Captions: "…claims the lives of 140,000 citizens, including American prisoners of war". | Static, slight drift |

## 3 · Captions (the most important style element)

- **Placement:** centred block, **line 1 at about 69 % of frame height**, line 2 just below. At most 2 lines and
  about 22 characters per line.
- **Font:**
  - very heavy rounded geometric sans, ALL CAPS, about 5 % of frame width per cap height;
  - **white fill, thick black outline (~3 px at 720 w), soft drop shadow down and right**.
- **Key word:** one word per phrase is **red (#E0141E-ish) with the same black outline**, e.g. NUKE, HIROSHIMA.
- **Timing:** **word by word, synced to the voice**. The whole phrase's layout is computed first; each word then
  appears **in its final position**, so earlier words never shift.
- **Word pop (4 frames):** scale **~55 % → ~115 % (next frame) → 100 %** by frame 4. There is no fade.
- **Exit:**
  - the red key word disappears **~7 frames before** the rest of the phrase;
  - then the whole phrase **hard-cuts off**, and the next phrase starts 1 frame later.
- **Dialogue** is in quotes ("HONEY, I THINK IT'S BETTER TO GO…").
- Ellipses are used for dramatic pauses ("JUST A…", "…DARK SPECK").

## 4 · Countdown stopwatch card (identical every time)

- **Background:** pure black, full frame. The stopwatch is centred at about 37 % of frame height and is about
  33 % of frame width.
- **Design:**
  - chrome ring and dark glossy glass face with a highlight;
  - crown button on top and a small side button at the top right;
  - **red number** (heavy rounded sans) with a dark outline.
- **Pop curve, measured, the same on all 8 cards:**
  - over 8 frames the scale rises **0.50 → 0.57 → 0.66 → 0.73 → 0.82 → 0.89 → 0.97 → 1.05 → 1.13**
    (linear, about +0.08 per frame);
  - it then settles **1.13 → 1.10 → 1.08 → 1.05 → 1.02 → 1.00** over 5 frames, then holds;
  - total 13 frames (0.22 s).
- **Duration:** 0.95–1.17 s; the "2" card is 0.43 s. A **hard cut** ends the card, except "1", which dissolves.
- **Opening overlay variant ("60"):**
  - the stopwatch is overlaid on shot 1 and **spins in**: about −90° → 0° with motion-blur transparency over
    about 6 frames (0.15–0.25 s);
  - it holds, then **spins out** the same way (1.1–1.25 s).

## 5 · Camera and layers

- **Every scene is 2.5D layered:** background, characters and foreground are separate layers with parallax.
  Optical flow shows different speeds per layer, for example sky still vs trees moving, or ground vs kids.
- **Default move:**
  - a slow **pull-back** (zoom out) of 10–35 % per shot, near-linear with soft ease ends;
  - plus a small diagonal drift of 10–80 px at 720 w.
- **Accents:**
  - one fast tilt (shot 3);
  - one fast pull (shot 11);
  - one flat map pan (shot 8);
  - one vertical whip-blur (shot 21);
  - two cross-dissolves (into shot 19, and card "1" into shot 25).
- **Optics:** depth-of-field blur on near foreground elements (the soldier in shot 2); sun glow, lens rays and
  hex flares in the sky shots.

## 6 · Character animation

- **Cut-out (puppet) animation**, not frame-by-frame:
  - rigid parts tween smoothly: the hand, chopsticks and bowl, the cup to the mouth, arm gestures, the walk bob;
  - faces change by **swapping drawings**: eyes closed to open, smile to frown, the back-view to front-view pose
    swap in shot 9.
- **Small loops keep every frame alive:** eating, sipping, the siren crank spinning (it stops on "IT STOPPED"),
  kids bobbing, the plane drifting.
- **Expression and acting beats land on caption words**, e.g. the wife's hand on "TELLS HIM TO SIT" and the
  thought bubble on "OFFICIALS WOULD BE SOUNDING".
- **Character design:**
  - round, oversized white heads with thick dark outlines;
  - small dot or line eyes;
  - simple bodies;
  - a muted, warm palette indoors and saturated blue skies outdoors.

## 7 · Backgrounds and grading

- **Backgrounds:** painted, semi-detailed and softly shaded: Japanese interior wood and shoji windows, a street
  building, the sky, a hill, a top-down map.
- **Grading:** each scene keeps one consistent palette, with no film grain or vignette (black cards measure
  pure 0). The ending goes high-key white.

## 8 · What changes for our version

- **Same:**
  - the shot list and timings (to the frame);
  - the camera moves;
  - the caption system;
  - the stopwatch card;
  - the transitions;
  - the ending treatment;
  - the audio.
- **New:** every character, prop and background design, with original art matching the role of each shot. No
  reuse of the reference artwork.

## 9 · Audio (from the version with sound)

- **Mix:** −17.6 LUFS integrated, LRA 4 LU, stereo 44.1 kHz.
- **Separation:**
  - Voice and music were split with the MDX-Net Kim Vocal 2 model (`/home/user/ref/tools/mdx.py`).
  - The voice alone measures −17.9 LUFS; the music and effects bed measures −28.8 LUFS, so the bed sits about
    **11 LU under the voice**.
  - The clean voice is saved as `public/hiroshima/vo.wav`, with a 70 Hz high-pass.
- **Voice-over:**
  - One male narrator: calm, documentary delivery with clear pauses between phrases.
  - **The countdown numbers are spoken:** "sixty seconds…" opens the video, then "fifty seconds", "forty
    seconds", "thirty seconds", "twenty seconds", "ten seconds", "five", "two", "one".
  - **Each card cuts in on the frame its number is spoken** (e.g. "fifty" at 12.49 s, card at 12.48 s).
- **Captions:**
  - **every caption word pops on the frame its spoken word starts** (e.g. "before" 0.87 s, "old" 2.18 s / 2.20 s);
  - the captions do not show the spoken countdown numbers ("sixty seconds", "fifty seconds", …);
  - word timings from forced alignment are in `docs/hiroshima/vo_words.json` (163 words).
- **Bed:**
  - continuous cinematic score: sustained string pads around 220–400 Hz with heavy sub-bass;
  - **low end enters with the plane (8–12 s), builds 22–56 s, drops away 56–60 s, and surges at the explosion
    60–64 s**;
  - light highs (birds and ambience) on the kids' shot (17–20 s);
  - a siren wind-down sweep around 5 s;
  - no hard SFX hits on the cuts.
- **Our version:** the reference's voice-over, plus our own free-licence score and sound effects following the
  same curve:
  - a warm morning;
  - a siren wind-down;
  - a distant plane drone that builds;
  - ticks or heartbeat under the cards;
  - the bomb whistle;
  - the whip whoosh;
  - a riser to the white-out;
  - a muffled blast and ringing;
  - silence at the end.
