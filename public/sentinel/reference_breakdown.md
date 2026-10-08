# Video 3: North Sentinel Island, reference breakdown and plan

Reference: "The Most Dangerous Island: North Sentinel Island" (competitor Short, 60.9 s, 720×1280, 30 fps).
We adopt its editing style, pacing and sound design. The script, maps, graphics and audio are our own.

## 1. What their video does, second by second

One continuous camera, no hard cuts (scene detection found none above 0.3), except a 6-second archival-footage insert.

| Time | Narration | Visual |
|---|---|---|
| 0.0–3.0 | "This is the most dangerous island in the world" | World satellite map, already moving. A red ring pops on the pin, then a slanted black label "the most DANGEROUS island" (DANGEROUS in a red box) with a leader line to the pin. Polar ice visible at the bottom. |
| 3.0–4.0 | "and if you decide to visit it" | Fast dive from the world into the Andaman Sea. Strong motion. |
| 4.0–7.0 | "you will be killed before you even set foot on the land" | The island alone, surroundings darkened. Thick red neon outline, a glowing skull fades in. The island slowly rotates. |
| 7.0–10.0 | "The danger is not from wild animals of the island" | Skull out; a red map pin with a panther head pops onto the island (big low thump). |
| 10.0–12.0 | "not from the deadly toxins floating in the air" | Second pin, a green toxic cloud, pops in. Both pins slide. |
| 12.0–15.0 | "but from the indigenous people, the Sentinelese" | Pins out; dark silhouettes of figures with bows rise on the island; red box label "Sentinelese". |
| 15.0–21.0 | "inhabited since ancient times, extremely aggressive towards outsiders" | Archival footage of the Sentinelese with orange/purple/red tints, heavy vignette, white and orange flash transitions with camera-shutter sounds. **We can't use this footage.** |
| 21.0–22.5 | "This is North Sentinel Island" | Back on the map: island small, red pin plus ring, white label "North Sentinel Island" with a leader line. |
| 22.5–24.5 | "about the size of Manhattan in New York" | A grey Manhattan outline labelled "New York" slides over the island and matches its size. |
| 24.5–26.5 | "located in the Indian Ocean" | Pull back; ocean turns bright cyan; big italic "Indian Ocean" label. |
| 26.5–29.5 | "and officially part of India" | India fills with a waving flag texture. |
| 29.5–32.0 | "never heard of India or the rest of the world" | Zoom back down; the Ashoka Chakra / flag circle sits on the island. |
| 32.0–35.5 | "only 20 miles from neighbouring populated islands" | White double-headed distance arrow to the Andaman main islands, "20 mi (32 km)" label growing. |
| 35.5–39.0 | "Several attempts to make contact ended lethally" | An arrow points at the island; a waving smiling emoji turns into a dead (X-eyes) emoji (pop). |
| 39.0–43.0 | "Indian military established a 3-mile patrolled zone" | A red disc grows around the island; two white boat icons circle it. |
| 43.0–47.5 | "even if you sneak past them, you will be shot with arrows and spears" | Fast zoom through the red zone to a close coastline; a sailboat approaches; dashed arrow trails fly at it. |
| 47.5–50.0 | "covered by jungle" | The island's jungle glows bright green/white. |
| 50.0–54.0 | "impossible to determine the exact population" | Person icon + slanted "5-140?" text. |
| 54.0–61.0 | "not immune to viruses… contact could be fatal" | Black person icons spread across the island; one red figure (us) arrives, and they turn red one by one. Ends on the island with one red figure. |

Style rules we copy:
- Change the visual every 1.5–2.5 s; the camera never stops moving (slow drift and rotation when nothing else happens).
- The island is isolated: everything around it is darkened and blurred, with a soft glow on the coastline.
- Labels: bold sans, white on black or red boxes, often slanted about 15°, with a thin leader line to a pin.
- Map pins carry icons (animal, gas, people) and pop with overshoot.
- Captions: small white sentence-case text, 2–4 words, lower middle of the frame. Same as ours.

## 2. Their sound, measured

I separated their voice from the music and effects (Demucs) and measured each stem.
- **Voice is everything.** Voice −19.0 LUFS; music plus all effects together −40.5 LUFS, so the bed sits about 21 LU under the voice. Voice loudness range only 4 LU: heavily compressed and steady.
- **Music:** a quiet, tense pulse (low hits about every 0.34 s) with sustained high tones, roughly 31 dB under the voice the whole way. It doesn't swell or drop.
- **Effects:** only about 15 that you'd notice in 60 s, about one every 4 s, always on a big visual change:

| Time | What | Level (loudest 50 ms vs voice average) |
|---|---|---|
| 0.4–1.2 | opening low whoosh (ring + label) | −14 dB |
| 3.1–4.0 | dive whoosh | −11 dB |
| 7.4 | low thump, panther pin | very loud sub, mostly felt not heard |
| 17.3 / 18.9 / 19.9 | camera shutter + flash on the footage | −10 dB |
| 23.3 / 25.2 | soft whoosh, Manhattan / Indian Ocean | −16 dB |
| 29.7–31.0 | long zoom whoosh into the island | −5.5 dB (the loudest effect) |
| 36.1 / 37.4 | whoosh + pop, emoji turns dead | −13 / −7 dB |
| 43.2–44.3 | zoom whoosh to the boat | −11 dB |
| 45.0 | arrows fly | −7 dB |
| 48.8–50.3 | high shimmer, jungle glow | −20 dB |

- Everything else (label pops, pins sliding) is either silent or a tiny tick around −22 dB.
- Takeaway: fewer, bigger whooshes on camera moves; small UI sounds kept very low; music almost subliminal; voice steady and on top. Our Diomede mix had about 80 effects. This style needs about 20–25.

## 3. Our version

Same beats, same order, our Hindi script (`script_hindi.txt`, about 176 words, about 63–67 s at your pace).

**Changes from theirs:**
- **The extra element (not in their video): the 2004 tsunami helicopter.** After the tsunami, an Indian Coast Guard helicopter flew over to check on them, and a Sentinelese man stood on the beach and aimed an arrow at it. It's a real, well-documented moment, it's India's own story, and it makes "they don't want contact" concrete. Visual: a helicopter icon sweeps over the island with rotor blur, a tiny figure on the beach, and a dashed arrow trail pointing up. Rotor sound, then a sharp arrow "thwip".
- **The footage insert is replaced** with three illustrated, respectful silhouette scenes (GPT): figures on a beach with bows, backlit, no faces, with the same tint, flash and shutter treatment. We don't use real footage of the Sentinelese.
- **Facts corrected:** the no-go zone is 5 nautical miles (about 9 km), not "3 miles"; Port Blair is 64 km away (verifiable, and means more to an Indian viewer than "20 miles"); population is unknown (we show "50–200?", the range most sources give, instead of their "5–140?"). The term "Aborigines" is dropped.

**Beat sheet (approximate; final times come from your voiceover):**

| # | Line | Visual | Sound |
|---|---|---|---|
| 1 | ये दुनिया का सबसे ख़तरनाक टापू है… | World map moving; red ring + slanted label "दुनिया का सबसे ख़तरनाक टापू" | low opening whoosh |
| 1b | …मारे जा सकते हो | Dive to the island; red neon outline + skull | dive whoosh |
| 2 | जंगली जानवरों या ज़हरीली हवा से नहीं | Panther pin, then toxic-cloud pin | low thump, small pop |
| 3–4 | Sentinelese लोगों से है… पास नहीं आने देते | Silhouettes rise + red label "सेंटिनलीज़"; three tinted silhouette scenes with flashes | shutter + flash ×3 |
| 5 | ये है North Sentinel Island… Manhattan जितना | Pin + label; Manhattan outline slides over the island | soft whoosh |
| 6 | Indian Ocean में, officially भारत का हिस्सा | Pull back; "Indian Ocean" label; India fills with the flag | soft whoosh |
| 7 | India का नाम भी नहीं सुना | Zoom down; chakra on the island | long zoom whoosh (loudest) |
| 8 | Port Blair सिर्फ़ 64 किलोमीटर दूर | Distance arrow to Port Blair, "64 किमी" counting up | counter tick (quiet) |
| 9 | कई कोशिशें जानलेवा साबित हुईं | Waving emoji turns into a dead emoji | whoosh + pop |
| 10 | 2004 की सुनामी… helicopter… तीर तान दिया | **Extra:** helicopter sweeps over; figure aims; arrow trail | rotor pass-by, arrow thwip |
| 11 | 9 किलोमीटर तक जाना गैरकानूनी | Red zone disc grows; boats circle it | low swell |
| 12 | चोरी-छिपे पहुँच भी गए… तीर और भाले | Zoom through to the coast; a boat approaches; arrow trails | zoom whoosh, arrows |
| 13 | घने जंगल… कितने लोग रहते हैं | Jungle glows; person icon + "50–200?" | shimmer |
| 14–15 | बीमारियों से लड़ना नहीं जानते… जानलेवा | Black figures spread; one red figure arrives; they turn red one by one | quiet, music only, one low hit at the end |

**Audio plan:** voice compressed and steady (as in their mix), music bed about 25–28 dB under the voice, about 20–25 effects from our Sonniss library, with whooshes doing most of the work.

**Maps:** EOX Sentinel-2 cloudless (10 m) for the island, NASA Blue Marble for the world. Sentinel-2 at 10 m is softer than their imagery on the deepest coastline zoom (beat 12), so that shot will stop a little wider than theirs.

## 4. Facts used (checked Oct 8)

- Area about 59.7 km², almost the same as Manhattan (about 59 km²).
- About 64 km west of Port Blair.
- Entry within 5 nautical miles is illegal under the Andaman and Nicobar Islands (Protection of Aboriginal Tribes) Regulation, 1956.
- Population: never counted; estimates mostly 50–200.
- Dec 2004: a Sentinelese man was photographed aiming an arrow at an Indian Coast Guard helicopter after the tsunami.
- 2006: two fishermen killed; Nov 2018: American missionary John Allen Chau killed.
- Isolated peoples have little immunity to common outside diseases; contact can be fatal (Survival International).
