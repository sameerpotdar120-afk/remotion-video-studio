# Junagadh: asset prompts (realistic, real people from Indian history)

This video uses **realistic** images, not the glossy miniature look: real historical people and places, photographed
the way a 1940s documentary would show them. Maps, the accession dates, vote counters, the 2020 map card, labels and
captions are drawn in code.

## 1. Read this first

**1. Real people, shown with respect.** Sardar Patel, Nawab Mahabat Khan III, Shah Nawaz Bhutto and Zulfikar Ali
Bhutto are real historical figures. Ask for a respectful, dignified documentary portrait of each, in period dress, in a
neutral pose. No caricature, no mocking or humiliating poses (the Nawab included), no invented scenes that could pass as
real news photos. On screen I label every portrait **"AI illustration"**, and the description says so too.

**2. If GPT won't draw a real person**, tell me. I can use genuine public-domain archive photos from Wikimedia Commons
instead (Indian photos published before 1966 are in the public domain), checked and credited on screen.

**3. GPT never draws a map.** India's official boundary, Junagadh, Pakistan and the 2020 map card are built in code.

**4. No text, numbers, flags or logos in any image.** No national flags, no party symbols, no readable words on
documents or banners. Every date, name and number is drawn in code.

### How to generate (ChatGPT / GPT image)
- One image per message. Paste the **Style Lock** once at the top of the chat.
- Use the biggest size GPT offers in that shape: tall for portraits, wide for scenes, square for props; 2048 px or more
  if it can.
- `PNG-T` = real transparent background (if you get a checkerboard or white, reply: *"Regenerate with a truly
  transparent alpha background, not a drawn checkerboard."*, or use remove.bg / Photoroom).
- Name files exactly as listed, zip them, and share through Google Drive ("Anyone with the link").

### Style Lock (paste once at the top of the chat)
```
You are generating production images for a respectful historical documentary
(vertical 9:16 Short) about the princely state of Junagadh, Gujarat, India,
in 1947-1951. Style: photorealistic, like a high-quality restored and
colourised 1940s documentary photograph: natural skin texture, accurate
period clothing, soft natural light, gentle film-like colour, sharp detail,
no painterly or cartoon look. Real historical figures are shown with dignity
and accuracy, in a calm neutral documentary pose, never caricatured or
mocked. No text, no letters, no numbers, no flags, no logos, no watermark,
no signature, no frame or border. When I say PNG-T, the background must be
fully transparent (real alpha channel). Centre the subject with generous
empty padding. Do not add glow or drop shadows.
```

## 2. Beat map (VO → screen → image)

| VO | On screen | Images |
|---|---|---|
| 1947 mein Gujarat ka ek hissa Pakistan mein… Somnath Mandir bhi… Map aaj bhi… Kaise? | Frame 0: India on satellite; Pakistan-green floods over the Junagadh patch; the Somnath ruins image rises on it; the 2020 map card (code); "?" | S1 |
| Ye hai Junagadh… 80% Hindu, par Raja tha Nawab Mahabat Khan. | Junagadh rises as a slab with a pin; the population bar; the Nawab's portrait card with name plate | N1 |
| 15 September 1947 ko Nawab ne Pakistan chun liya. | The accession document gets its wax seal; Junagadh flips to green; "15.9.1947" | D1 |
| Teen taraf Bharat, aur saamne Samundar. | Pull out: India red around it, the sea in front, a dashed sea line to Karachi; Null A | — |
| Phir aaye Sardar Patel… nakabandi… Aarzi Hukumat… gaon-gaon | Patel's portrait; a blockade ring closes; the volunteers image; village pins flip one by one | P1, A1 |
| October mein Nawab Karachi bhaag gaya. | The Nawab's card slides off along the dashed line to Karachi | N1 |
| 9 November 1947… Diwan… Shah Nawaz Bhutto… Zulfikar Ali Bhutto ke pita. | Junagadh turns red; "9.11.1947"; a two-portrait family card: father → son | B1, B2 |
| 13 November ko Patel Somnath pahunche… khandhar… 1951 mein naya Mandir. | Patel at the ruins; the ruins dissolve into the new temple; "1951"; warm saffron grade | P2, S1, S2 |
| February 1948… 1,90,870 Vote… Pakistan ke liye sirf 91. | The ballot box; a counter rolls up; a tiny "91" | V1 |
| 2020 mein Pakistan ne naya Map… | The 2020 map card (code) with a red ✕; Null B | — |
| …bina Passport… ek Signature se kaagaz par… Map aaj bhi kehta hai… | The signed document again, then back to frame 0 (loop) | D1, S1 |

## 3. GPT image prompts

#### P1 · `p_patel.png` (tall, PNG-T)
```
A respectful photorealistic documentary portrait of Sardar Vallabhbhai Patel
around 1947: an elderly Indian statesman with a calm, resolute expression,
short grey hair, wearing a simple white khadi dhoti and kurta with a white
shawl over his shoulders, standing upright, three-quarter view, hands
clasped in front. Dignified, natural light, restored colourised 1940s
photograph look. PNG-T, transparent background.
```

#### P2 · `p_patel_somnath.png` (tall, no transparency)
```
A respectful photorealistic documentary scene, November 1947: Sardar
Vallabhbhai Patel, in a white khadi dhoti, kurta and shawl, stands quietly
with a few companions among the weathered stone ruins of the old Somnath
temple on the Gujarat coast, carved broken pillars and a damaged spire
around him, the Arabian Sea in the background, soft morning light, a mood
of quiet resolve. Restored colourised 1940s photograph look. No text.
```

#### N1 · `n_nawab.png` (tall, PNG-T)
```
A respectful photorealistic documentary portrait of Nawab Mahabat Khan III,
the ruler of Junagadh in the 1940s: a middle-aged Indian royal with a
neatly trimmed moustache, wearing a dark formal sherwani buttoned to the
neck and a traditional cap, a calm neutral expression, standing, three-
quarter view. Dignified, natural light, restored colourised 1940s
photograph look. PNG-T, transparent background.
```

#### B1 · `b_shahnawaz_bhutto.png` (tall, PNG-T)
```
A respectful photorealistic documentary portrait of Sir Shah Nawaz Bhutto,
Dewan of Junagadh in 1947: a dignified middle-aged South Asian
administrator in a tailored 1940s Western suit and tie, a neat moustache,
calm neutral expression, head-and-shoulders, three-quarter view. Restored
colourised 1940s photograph look. PNG-T, transparent background.
```

#### B2 · `b_zulfikar_bhutto.png` (tall, PNG-T)
```
A respectful photorealistic documentary portrait of Zulfikar Ali Bhutto in
the early 1970s as Prime Minister of Pakistan: a South Asian statesman with
swept-back dark hair, wearing a dark suit and tie, a confident calm
expression, head-and-shoulders, three-quarter view. Restored colour
photograph look. No flags. PNG-T, transparent background.
```

#### D1 · `d_accession.png` (wide, PNG-T)
```
A photorealistic close-up of an old 1947 official document on aged cream
paper lying on a dark wooden desk: lines of faded typewritten text that is
completely blurred and unreadable, a red wax seal pressed at the bottom, and
an old black fountain pen resting beside the signature space. No readable
text, no emblems. PNG-T, transparent background.
```

#### A1 · `a_volunteers.png` (wide, PNG-T)
```
A photorealistic 1947 documentary group of ordinary Gujarati villagers and
young volunteers walking together along a dusty village road, men in white
dhotis and kurtas with traditional caps, a few women in saris, determined
peaceful faces, plain blank cloth banners with no writing, no flags, no
weapons. Restored colourised 1940s photograph look. PNG-T, transparent
background.
```

#### S1 · `s_somnath_ruins.png` (square, PNG-T)
```
A photorealistic image of the old Somnath temple ruins as they stood in the
1940s, based on 19th-century photographs: a large weathered sandstone temple
structure with a broken, partly collapsed spire, intricately carved but
damaged walls and pillars, rubble at its base, on a small patch of coastal
ground. Restored colourised archival look, soft natural light. PNG-T,
transparent background.
```

#### S2 · `s_somnath_new.png` (square, PNG-T)
```
A photorealistic image of today's Somnath temple in Gujarat: the grand
Chalukya-style temple in warm golden-pink sandstone with its tall, richly
carved shikhara and a saffron pennant at the top (plain, no symbols), the
Arabian Sea behind it, golden evening light. Majestic and serene. PNG-T,
transparent background.
```

#### V1 · `v_ballot_box.png` (square, PNG-T)
```
A photorealistic 1948 metal ballot box painted dark green, with a padlock
and a slot on top, a few folded paper ballots beside it on a wooden table
(no writing visible). Restored colourised archival look. PNG-T, transparent
background.
```

## 4. What I do with them

- Clean edges, upscale for 4K, and cut out anything that comes with a background.
- Portraits go on documentary cards (name in Hindi and English, years, a thin gold rule, a small "AI illustration"
  label), with a slow Ken Burns push so nothing is ever still.
- The Somnath ruins dissolve into the new temple; the seal stamps onto the document; the ballot counter rolls; the
  Nawab's card slides off to Karachi; the Bhutto father-son card links with a gold line.
- Map: India red (official boundary), Junagadh gold, Pakistan green, the sea route dashed, village pins flipping, and the
  2020 map card, all in code.
- 10 images. If you're short on time, these 6 matter most: P1, N1, S1, S2, D1, V1.
