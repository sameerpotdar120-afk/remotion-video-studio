# Reference: "The Old Man Who Lost His Horse", frame analysis

This reference was supplied for analysis only. Our version is rebuilt from scratch: every set, character, prop and
camera move is generated in code (Remotion plus three.js, with characters drawn on canvas). The audio track is
reused as the user asked. The colour grade is our own.

## File

| | |
|---|---|
| Video | AV1, **720 × 1280 (9:16), 60 fps**, **3,680 frames (61.33 s)**. The animation itself is 30 fps; every drawing is held for 2 frames. |
| Audio | AAC stereo 44.1 kHz with voice-over, sound effects and music already mixed. We reuse it unchanged. |

## Style

- **World:** a soft-lit 3D village in a dry dune landscape, viewed through a real perspective camera.
  - **Buildings:** rammed-earth walls with horizontal strata, red-brown timber posts and grey clay-tile gable roofs.
  - **Village features:** courtyard walls with tile caps, a brick watchtower with a red flag, round cartoon trees
    with ink outlines, and hay piles.
  - **Ground:** sand with little bird-foot marks and a pale cart-track road.
  - **Lighting:** a low warm sun with long soft shadows, a hazy sky, and far dunes in bands with dark ridge lines.
- **Characters:** flat 2D drawings standing in the 3D set; they cast soft shadows.
  - **Head:** a rounded-square head with a thick ink outline, blush dots, and dot or half-lidded eyes.
  - **Body:** a pill-shaped robe with a white crossed collar and a coloured belt.
  - **Limbs:** stick legs and arms, round hands and dark oval feet.
- **The cast:**
  - **Old man:** white hair cap and topknot, long white beard and drooping moustache, cream robe, brown belt.
  - **Neighbours:**
    - a man in a blue robe with a black bun;
    - a woman in a red robe with a brown bob;
    - a dark-skinned man in a yellow robe with an orange cap;
    - a man in a green robe with a fur hat.
  - **Son:** brown robe with a yellow headband.
  - **Soldiers:** grey helmet with a red tassel, scale armour, red skirt and a spear.
  - **Bus-stop man:** a modern man in a blue striped vest.
  - **Bus-stop woman:** a woman in a yellow puffer vest.
- **Acting:** cartoon acting.
  - **Faces:** expression swaps, such as star eyes, sad brows and anger marks.
  - **Gestures:** shrugs, an "explaining" arm, cheering with both arms up.
  - **Movement:** walk bobs; the son is thrown in a spinning arc.
  - **Effects:** dust puffs, dizzy stars, sparkles.
- **Captions:**
  - one word at a time, white Poppins Bold with a thin dark outline and a soft shadow;
  - centred, with the baseline at about 73 % of the frame height and a cap height of about 3 % of the frame height;
  - a hard cut from one word to the next, with no pop.
  - Words and start frames are in `src/horse/captions.json` (182 words, measured from the frames).

## Shots (frame numbers at 60 fps)

| # | Frames | Shot | Camera and transition |
|---|---|---|---|
| 1 | 0–329 | **Village street, wide.** The horse gallops up the dune road and over the crest (0–75). The old man stands by a timber shelter on the right. From about 170 the neighbours walk in from the left and gather. He shrugs on "shrugged" (288). | Near-static with a slow drift. |
| 2 | 330–463 | **Close-up of the old man** in front of the shelter post. "Bad luck?" "Maybe" (his arm swings out, brows rise). "Who knows" (half-lidded eyes). | **Fast push-in with a 14-frame dissolve** (330–344). |
| 3 | 464–595 | **The neighbours and the old man.** "They thought he'd lost his mind": neighbours glance at each other, puzzled. | **Fast pull-out** (464–494), continuous with no cut. |
| 4 | 596–655 | **"A few weeks later":** a time-lapse on the same group. The sky flickers day → dusk → night → day twice; clouds race; shadows swing. | Then a dissolve (640–660). |
| 5 | 656–1009 | **Stable yard, low and wide.** The horse gallops along the far ridge and comes back (666–760). A black stallion follows (778–870). The camera trucks and pushes in to reveal the old man by the corral with two horses. The stallion runs across (960–1000). | Slow truck right and push-in. |
| 6 | 1010–1143 | **The party.** Strings of paper lanterns, a table of food and jars. The blue neighbour laughs, the old man stands behind the table, the yellow neighbour is on the right. | Dissolve, then a slow push. |
| 7 | 1144–1264 | **The blue neighbour cheering:** star eyes, both arms up, sparkles. "You're the luckiest man in the village." | **Fast dolly-in** (1144–1172). |
| 8 | 1265–1337 | **Medium shot of the old man shrugging** (arms out and palms up, 1290–1330). | Dissolve. |
| 9 | 1338–1461 | **Close-up of the old man.** "Good luck?" "Maybe" (arm out, 1385–1420). "Who knows." | **Push-in** (1334–1348). |
| 10 | 1462–1599 | **The corral:** a fence in the foreground, the watchtower and red flag behind. The son rides the bucking black stallion. | Dissolve, then a slow truck right. |
| 11 | 1600–1715 | **The stallion throws him.** He flies up, spinning (1644–1670), and lands in dust puffs (1680–1715). | The truck continues and holds. |
| 12 | 1716–1757 | **"Snapped":** the son staggers with dizzy stars and a bent leg. | **White flash** (1716–1724). |
| 13 | 1758–1899 | **Under the shelter:** the son limps on a crutch with a bandaged leg; the old man is at the left. | Dissolve. |
| 14 | 1900–2059 | **The street:** "Back come the neighbours: what terrible luck." Sad faces. | Swing left, then a **push-in** (1980–2010). |
| 15 | 2060–2111 | **Close-up of the old man:** "maybe" (arm gesture), "okay". | Dissolve and push. |
| 16 | 2112–2255 | **The neighbours, annoyed:** anger marks and frowns. | Pull-out. |
| 17 | 2256–2603 | **War, in a sunset red grade:** village gate with the tower and flag. Soldiers march in and drag young men off to the left, kicking up dust. | Dissolve, then a slow push and pan. |
| 18 | 2604–2729 | **Empty street at sunset:** leaves blow, and a dropped straw hat lies on the ground. "Almost none of them came back." | Dissolve; near-static. |
| 19 | 2730–2915 | **The shelter at sunset:** the old man and the son on his crutch; a soldier with a spear looks the son over and moves on. | Pan right. |
| 20 | 2916–3149 | **The stable by day:** two horses grazing; the old man and the son lean on the corral post. "You see, the old man wasn't lucky…" | Dissolve, a slow push, then a pull back from 3130. |
| 21 | 3150–3249 | **Night/day time-lapse** as the camera cranes up and back over the village. | Crane. |
| 22 | 3250–3489 | **A modern bus stop with the "12路" (Route 12) sign.** A man walks in. The bus pulls away (3380–3400). He is sad. A woman in a yellow vest walks in (3400) and pats his shoulder (3440). | Dissolve; static. |
| 23 | 3490–3679 | **A hanging scroll on a plaster wall.** It unrolls (3492–3520). 塞翁失马 is written stroke by stroke (3520–3595). Then the pinyin "sài wēng shī mǎ", a red seal, and 焉知非福 fade in. | Dissolve; static. |

## Our version

- **Kept from the reference:**
  - the shot list and timings, to the frame;
  - the camera moves and transitions;
  - the acting beats on caption words;
  - the caption system;
  - the audio.
- **New:**
  - all sets and characters, procedurally built and drawn, with no source images;
  - our own colour grade: a cleaner, cooler sky with a little more saturation and warm sunlight, in place of the
    reference's hazy beige;
  - 2160 × 3840 at 60 fps.
