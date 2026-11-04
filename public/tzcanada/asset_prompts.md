# Canada vs USA time zones: image prompts (ChatGPT image)

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
