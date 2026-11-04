# Canada vs USA time zones: ElevenLabs script and asset prompts

## ElevenLabs script (copy as is)

```
अगर तुम Vancouver से Seattle की ट्रेन लो, तो schedule के हिसाब से जाने में तीन घंटे लगेंगे, और वापसी में पूरे पाँच।

क्यों? पहले America और Canada का time zone map देखो। देखने में बिल्कुल normal है। पूरब या पश्चिम जाओ, तो घड़ी एक घंटा आगे या पीछे।

पर एक नवंबर की रात दो बजे, सब उल्टा-पुल्टा हो गया।

Alberta के Calgary और Florida के Destin को देखो। दोनों के बीच तीन हज़ार किलोमीटर से ज़्यादा की दूरी है, और करीब अट्ठाईस डिग्री longitude का फ़र्क़। फिर भी अब दोनों का time एक ही है।

और यहाँ उल्टा हुआ। Vancouver और Seattle लगभग एक ही longitude पर हैं, फ़र्क़ एक डिग्री से भी कम। पर दोनों की घड़ियों में पूरा एक घंटे का फ़र्क़।

इसीलिए ट्रेन का सफ़र दोनों तरफ़ लगभग चार घंटे का ही है, पर घड़ी देखो तो जाना तीन घंटे का लगता है, और आना पाँच घंटे का।

ऐसे और भी कई अजीब मामले अब पूरे नक्शे पर हैं। पर ये हुआ कैसे?

British Columbia, Alberta, Manitoba और Northwest Territories ने इस साल घड़ियाँ पीछे करना ही छोड़ दिया। Saskatchewan और Yukon तो पहले से ऐसा करते आ रहे हैं।

तो जब बाकी सब ने अपनी घड़ियाँ एक घंटा पीछे कीं, ये वहीं रुके रहे, और पूरा नक्शा खिसक गया।

March में बाकी घड़ियाँ फिर आगे होंगी, तो नक्शा फिर सीधा दिखेगा। पर तब तक…
```

## ChatGPT image prompts

Style for every image: 2D flat cartoon (clean vector shapes, soft cel shading, thin dark outlines, warm muted colours, like an animated explainer), 4K, no text, no logos, no watermark. The subject is BIG: it fills 85–90 % of the frame, nothing cut off at the edges. Cutouts go on plain pure white #FFFFFF; green areas are flat pure green #00FF00 so I can place graphics on them.

The map, zones, UTC tags, clock tags, meridians, distance lines, rail line, split-flap boards, rings and "?" marks are all drawn in code (EOX Sentinel-2, Natural Earth India-POV borders), so they are not on this list.

**t01_wall_clock.png** (line 3, the full-screen "1 November, raat 2 baje" clock)
```json
{
  "subject": "a big round vintage wall clock, seen exactly front-on",
  "look": "cream clock face, thick dark-wood rim, bold black numerals 1 to 12, small minute ticks, a brass centre pin",
  "hands": "NO hands at all: the face is empty apart from the numerals, ticks and centre pin",
  "style": "2D flat cartoon, clean vector shapes, soft cel shading, thin dark outline",
  "framing": "the whole clock in frame, perfectly circular, filling 90% of the frame width, centred",
  "background": "plain pure white #FFFFFF, no shadow",
  "size": "4K, 9:16",
  "avoid": "clock hands, brand names, any words, wall, shadow, perspective tilt"
}
```

**t02_train.png** (line 6, the train crossing under the boards)
```json
{
  "subject": "a modern passenger train, a locomotive and three coaches, seen exactly side-on, facing right",
  "look": "generic livery: dark green and cream with a thin copper stripe along the windows, lit windows, silver roof",
  "style": "2D flat cartoon, clean vector shapes, soft cel shading, thin dark outline",
  "framing": "the whole train in frame, filling 95% of the frame width, centred vertically",
  "background": "plain pure white #FFFFFF, no rails, no ground, no shadow",
  "size": "4K, 16:9",
  "avoid": "text, logos, company names, numbers, rails, motion blur"
}
```

**t03_station.png** (line 6, background for the departure boards)
```json
{
  "subject": "an empty train station platform at dusk, no people",
  "details": "a very large departure board hanging from the roof in the upper half of the frame; the board's display is one flat solid pure green #00FF00 rectangle (I place the split-flap boards on it); platform edge and tracks in the lower third; steel roof beams",
  "camera": "front view from the middle of the platform, slightly low, the green board large and centred",
  "lighting": "warm platform lamps, deep blue evening sky beyond the roof",
  "style": "2D flat cartoon background, clean vector shapes, soft cel shading",
  "framing": "full frame edge to edge",
  "size": "4K, 9:16",
  "avoid": "text, logos, people, trains, anything drawn on the green board"
}
```

**t04_traveller.png** (line 6, "par ghadi dekho to...")
```json
{
  "subject": "a cartoon young traveller with a backpack and a rolling suitcase, confused, checking his wristwatch",
  "look": "short black hair, olive jacket, blue jeans, white sneakers, grey suitcase",
  "pose": "standing three-quarters to the right, left wrist raised in front of his face, eyebrows up, mouth twisted in confusion, a little sweat drop",
  "style": "2D flat cartoon, clean vector shapes, soft cel shading, thin dark outline",
  "framing": "full body with the suitcase, filling 85-90% of the frame height, centred",
  "background": "plain pure white #FFFFFF, no floor, no shadow",
  "size": "4K, 9:16",
  "avoid": "text, logos, floor shadow"
}
```

**t05_padlock.png** (line 8, the clocks turning into padlocks)
```json
{
  "subject": "a big shiny red padlock, closed, seen front-on",
  "look": "glossy red body with a soft highlight, thick silver shackle, a small dark keyhole in the middle",
  "style": "2D flat cartoon, clean vector shapes, soft cel shading, thin dark outline",
  "framing": "the whole padlock in frame, filling 85% of the frame height, centred",
  "background": "plain pure white #FFFFFF, no shadow",
  "size": "4K, 1:1",
  "avoid": "text, logos, keys, chains"
}
```

## Omni prompts for Null

**Tool:** Google Omni (Gemini Omni Flash), vertical 9:16, 10 seconds. **Starting frame:** attach `public/null/studio_master_9x16.jpg`. **Save as:** the file name above each clip (2 takes each if you can, e.g. `null_tz_A1.mp4`, `null_tz_A2.mp4`).

Null appears in the middle only, in split screen, about 4 s each, about 8 s in total. Never at the start or the end (the video loops).

**null_tz_A.mp4** (line 5: "Par dono ki ghadiyon me poora ek ghante ka fark.")
```
Animate this stylised 3D animated character as a friendly podcast host in his studio. Keep the image, character design, studio, microphone, lighting and framing exactly as they are, with a static camera.

He explains "the clocks are one hour apart":
0–2 s: he raises his left wrist and taps it twice with his right index finger, as if pointing at a watch.
2–5 s: he holds up one finger clearly towards the camera, eyebrows raised, as if saying "one full hour".
5–7 s: he spreads both hands apart a little, palms facing each other, showing a gap.
7–10 s: he rests both hands calmly on the desk.

Smooth, calm, explanatory movements, with his hands near the microphone. His face design stays the same throughout. No dialogue, no text.
```
Backup:
```
Animate this 3D animated podcast host. Static camera, same studio. He taps his wrist twice as if pointing at a watch, holds up one finger towards the camera, spreads his hands a little apart, and rests his hands. Smooth, hands near the microphone.
```

**null_tz_B.mp4** (line 7: "Par ye hua kaise?")
```
Animate this stylised 3D animated character as a friendly podcast host in his studio. Keep the image, character design, studio, microphone, lighting and framing exactly as they are, with a static camera.

He asks "but how did this happen?":
0–2 s: he turns both palms up in a small shrug and tilts his head slightly.
2–5 s: he brings one hand to his chin, eyes looking up and to the side, thinking.
5–7 s: he lowers the hand and leans in slightly towards the microphone, curious, as if about to explain.
7–10 s: he rests both hands calmly on the desk.

Smooth, calm, curious movements, with his hands near the microphone. His face design stays the same throughout. No dialogue, no text.
```
Backup:
```
Animate this 3D animated podcast host. Static camera, same studio. He shrugs with both palms up, puts one hand on his chin and looks up thinking, then leans in towards the microphone and rests his hands. Smooth, hands near the microphone.
```
