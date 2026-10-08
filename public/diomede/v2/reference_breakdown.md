# Diomede v2: reference breakdown and plan

Reference: "The Distance Between the US and Russia is Less Than You Think | Diomede Islands" (competitor Short, 60.0 s, 1080×1920).
Same channel style as the North Sentinel reference. We adopt the beat order, pacing and sound design; script, maps, graphics and audio are ours.

## 1. Their video, beat by beat

| Time | Narration | Visual |
|---|---|---|
| 0.0–1.5 | "Not all Americans know" | Satellite world map over North America; the USA is filled with a **waving US flag** (cloth folds, shading). |
| 1.5–4.0 | "the US and Russia are actually much closer" | Camera pans east across the Atlantic; a **glowing pink-purple laser beam** shoots from the US to Russia, which fills with a waving Russian flag. |
| 4.0–5.0 | "to each other" | The map **swings around the globe** to the Pacific side: now Russia and Alaska face each other. |
| 5.0–5.5 | "just two miles apart" | **Iris wipe**: a black circle closes, then opens on a new look. |
| 5.5–9.5 | "they are even connected… sometimes" | **Flat infographic map**: Russia solid red, Alaska solid blue, pale cyan ocean; big tilted "2 miles" text; dashed lines converge from both sides and meet in a **light burst** at the strait. |
| 10.0–13.0 | "separated by the Bering Strait" | Back to dark satellite: Russia **neon red**, Alaska **neon cyan**; big 3D-tilted "Bering Strait" label sweeping in. |
| 13.0–16.5 | "if we look closer… two tiny Diomede Islands" | Dive between the coasts; the two islands glow white; label "Diomede Islands" with leader lines to both. |
| 16.5–18.5 | "2.4 miles apart" | Island pair rotated; double-headed distance arrow, "2.4 mi (3.8 km)". |
| 18.5–22.0 | "divide the mainland of the US and Russia" | Big **split screen**: "RUSSIA" over a brown-tinted half, "USA" over a blue-tinted half, a dotted border down the middle, text pushing in. |
| 22.0–24.5 | "Little Diomede belongs to the USA" | Dashed border line; Little Diomede fills with a **waving US flag**, label above. |
| 24.5–30.5 | "one of the most isolated towns… 82 people" | **Deep zoom into the real village** on the island's slope (high-res aerial); pin "Diomede" + a yellow **population chip counting up** to 82. |
| 30.5–36.5 | "Big Diomede belongs to Russia… only military" | Big Diomede fills with the Russian flag; three teal **soldier avatar pins** pop in, a speech bubble says "COMRADE!". |
| 36.5–41.0 | "closest American town to Russia, two miles of water" | Coastline close-ups; huge distance arrow between the islands, "2.4 mi (3.8 km)". |
| 41.0–43.5 | "in winter the water freezes" | Islands as small flag icons; snowfall; the sea **turns to white ice** in a sweeping wipe; red dashed border. |
| 43.5–49.5 | "an ice bridge… cross the border by land" | Fully white ice map, dashed border zig-zagging between the islands, a **black hiker icon** walking across with trekking poles. |
| 49.5–54.5 | "an International Date Line… 21 hours" | Pull back over the Bering Sea; a **glowing white line** draws, text "International Date Line" written along it. |
| 54.5–59.9 | "cross from the US side… time traveler" | Dark close view; day/time labels on each side; a **big curved arrow** swings across the line; a cartoon **sticker** pops in for "time traveler". |

Style notes: something changes every 1–1.5 s; every pop has overshoot; four looks alternate (satellite, flat infographic, split screen, white ice) so the eye keeps getting something new.

## 2. Their sound (measured with Demucs separation)

- Voice −18.9 LUFS; music + effects −37.9 LUFS, so the bed sits **19 LU under the voice** (the North Sentinel reference: 21.5).
- Music bed about 31 dB under the voice, steady.
- **Transitions hit hard:** iris wipe 5.5 s (−4 dB vs voice), switch to satellite 10.2 s (−2), zoom into the village 25.4 s (−5), Big Diomede 31.6 s (−5), coast 37.0 s (−4), date line 54.7 s (−5). Everything else is small pops and ticks around −13 to −18 dB.
- Takeaway for our mix: same quiet bed as North Sentinel, but **transition whooshes about 3 dB louder** than we used.

## 3. Our version

Script: `script_hindi.txt` (152 words, about 58 s). Same beat order as theirs.

**The extra (not in their video): 1867.** One line explains *why* the border runs between the two islands: the US bought Alaska from Russia in 1867. Visual: Alaska flashes from red to blue with a "1867" stamp, and the border line draws itself between the islands.

**Facts corrected:**
- "Just two miles apart" is about the islands (3.8 km), so our hook says 4 km. The mainlands are about 88 km apart.
- The village had **83 people** in the 2020 census, so we say "80".
- Their time labels are wrong: "Monday 9 PM" against "Sunday 12 AM" is 45 hours apart, not 21. Ours: US side **रविवार दोपहर 3 बजे**, Russian side **सोमवार दोपहर 12 बजे** (exactly 21 hours later). In summer the gap is 20 hours; the upload kit will note that.

## 4. How we get closer to After Effects quality

These are the upgrades over our earlier videos, all built in Remotion:

1. **Waving cloth flags.** Flags drawn to spec in code, then a real fabric-fold texture (GPT asset, no flag in it) multiplied over them and animated, plus an SVG displacement ripple. The result looks like waving cloth, not a flat fill. Used on the USA, Russia and both islands.
2. **A laser beam with a glow core and particles**, and the camera swinging from the Atlantic side of the globe to the Pacific side.
3. **Iris-wipe and ice-sweep transitions**, each with its own big whoosh.
4. **Four map looks:** satellite (EOX + NASA), a flat infographic look drawn from real Natural Earth outlines, a split screen, and the white ice map.
5. **Big 3D-tilted kinetic labels** ("बेरिंग स्ट्रेट", "रशिया | अमेरिका") that sweep in with perspective and motion blur.
6. **Character moments:** soldier avatars with a speech bubble ("कॉमरेड!"), a walk-cycle hiker crossing the ice, and a time-traveler sticker.
7. **A real close-up of the village:** I'll look for a public-domain US government aerial photo first (NOAA/USGS); if there isn't a good one, we use the GPT illustration below.

## 5. Assets

**Reuse:** `sea_ice_topdown`, `frost_overlay`, `pin_military`, `emoji_thinking`, `footprints_snow` (Diomede v1), `emoji_wave_smile`, `overlay_lightleak`, clouds (North Sentinel pack). Maps and island outlines from v1 (EOX, NASA, OSM).

**New GPT assets:** only 5. Paste the Style Lock from the North Sentinel prompts first; same rules (no text, no flags, PNG-T means a real transparent background).

#### N1 · `fabric_folds.png` (1536×1024, opaque)
```
A seamless close-up texture of pure white satin fabric gently waving in the
wind: soft diagonal folds and ripples, smooth highlights and soft shadows,
evenly lit, grayscale only, no pattern, no print, no flag, no text. Fills the
whole frame edge to edge, tileable left to right.
```

#### N2 · `hiker_a.png` and `hiker_b.png` (1024×1024, PNG-T, same chat)
```
A: A solid flat black silhouette icon of a hiker walking to the right, with a
big backpack and a trekking pole in each hand, left leg forward. Clean vector
icon style, crisp edges, no details inside, no ground. PNG-T, transparent.

B: Exactly the same hiker silhouette, same size and style, mid-stride with the
right leg forward and the poles swapped, so the two images make a walk cycle.
PNG-T, transparent.
```

#### N3 · `sticker_time_traveler.png` (1024×1024, PNG-T)
```
A cheerful cartoon time traveler as a die-cut sticker: a young explorer in a
brown jacket and aviator goggles stepping out of a glowing swirl portal,
holding a big brass pocket watch, excited expression. Flat colorful
illustration with soft shading, a thick white sticker border around the whole
shape and a soft drop shadow. Original character, not based on any film. No
text. PNG-T, transparent.
```

#### N4 · `scene_village_aerial.png` (1024×1536), backup only if no public-domain photo is found
```
Realistic aerial drone photograph looking down at a tiny remote Arctic village
of about thirty small wooden houses with colorful roofs, clinging to the
bottom of a very steep, dark rocky island slope that drops straight into a
cold grey-blue sea, a narrow strip of rocky beach, a few boats pulled up on
the stones, overcast light. No text. Portrait 9:16.
```

**Voiceover:** record `script_hindi.txt` at the same pace as North Sentinel and send the MP3 (+ SRT if you make one). Pause briefly after "कैसे? देखो।" (the iris wipe lands there) and before "एक तरह का टाइम ट्रैवल!".
