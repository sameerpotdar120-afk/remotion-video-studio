# Sikkim: Omni prompts

**Tool:** Google Omni (Gemini Omni Flash), vertical 9:16, 10 seconds, highest quality. Save each clip as the file name above its prompt (2 takes each if you can: `..._1.mp4`, `..._2.mp4`). No text, logos or watermarks in any shot; I add every label, line and effect in code. Mute is fine; I add all sound.

## Footage (text to video, no starting image)

**om01_valley_rise.mp4** (lines 5–6: the steep land and deep valleys; the route line gets drawn over it)
```json
{
  "shot": "slow aerial drone shot rising up a steep, narrow Himalayan river valley",
  "subject": "a fast green-blue mountain river at the bottom of a deep V-shaped gorge, near-vertical forested slopes on both sides, a thin road cut into one slope, small villages clinging to the hillsides, layered ridges fading into mist, snow peaks far away",
  "action": "the drone climbs and moves forward up the valley, revealing how steeply the mountains rise from the river; low clouds drift through the gorge",
  "camera": "smooth forward and upward drone move, slight tilt up at the end, no shake, no cuts",
  "lighting": "soft overcast monsoon light, mist in the valley, gentle highlights on wet leaves",
  "style": "photoreal cinematic aerial footage, natural colours, high detail, 4K look",
  "framing": "vertical 9:16, the river and both slopes in frame the whole time",
  "duration": "10 seconds",
  "avoid": ["text", "logos", "watermark", "people close up", "drones visible", "cartoon look"]
}
```

**om02_viaduct_tunnel.mp4** (line 7: "पहाड़ के ऊपर से नहीं, पहाड़ के अंदर से"; the reference's viaduct-into-tunnel shot)
```json
{
  "shot": "aerial drone shot of a new concrete railway line in the Himalayan foothills that runs along a tall viaduct straight into a tunnel portal cut into a steep forested cliff",
  "subject": "a single-track railway on a slender concrete viaduct with tall piers, ending at an arched concrete tunnel portal in the mountainside; construction roads, retaining walls and fresh cuttings on the slope below; mist and clouds on the peaks above",
  "action": "the drone slowly pushes forward along the viaduct toward the dark tunnel mouth, which grows larger in frame",
  "camera": "slow, steady forward push from behind and above the track, centred on the line, no shake, no cuts",
  "lighting": "soft overcast daylight, light mist, realistic shadows",
  "style": "photoreal cinematic aerial footage, slightly desaturated greens, high detail, 4K look",
  "framing": "vertical 9:16, the track leading from the bottom of the frame up to the tunnel portal",
  "duration": "10 seconds",
  "avoid": ["text", "logos", "signboards", "watermark", "trains", "people close up", "cartoon look"]
}
```

**om03_tunnel_inside.mp4** (lines 7–8: digging inside the mountain)
```json
{
  "shot": "slow push through a railway tunnel under construction deep inside a mountain",
  "subject": "a long horseshoe-shaped tunnel with sprayed concrete walls, steel arch supports, a row of work lights along one wall, a large drilling rig with arms raised at the rock face at the far end, a ventilation duct running along the ceiling, wet rock and a little dust in the air",
  "action": "the camera glides forward toward the drilling rig at the rock face; the work lights pass by overhead",
  "camera": "smooth forward dolly at walking speed, centred in the tunnel, no shake, no cuts",
  "lighting": "warm sodium work lights against cool grey rock, light haze catching the light",
  "style": "photoreal cinematic, high detail, 4K look",
  "framing": "vertical 9:16, the tunnel's vanishing point in the upper middle of the frame",
  "duration": "10 seconds",
  "avoid": ["text", "logos", "signboards", "watermark", "faces", "cartoon look"]
}
```

**om04_monsoon_slope.mp4** (line 9: heavy rain, the land slipping; a card and the stormy map use it)
```json
{
  "shot": "heavy monsoon rain on a steep mountain slope above a mountain road",
  "subject": "a steep, freshly cut hillside of mud, loose rock and broken trees, with a concrete retaining wall at its base beside a narrow road; dense forest around it; low dark clouds",
  "action": "heavy rain pours down; streams of muddy water run down the slope, then a section of loose soil and small rocks slides slowly down toward the retaining wall, leaving a brown scar; nobody is in the shot",
  "camera": "steady wide shot from across the valley, very slow push in, no shake, no cuts",
  "lighting": "dark grey monsoon light, rain streaks visible, wet reflective surfaces",
  "style": "photoreal cinematic, documentary feel, high detail, 4K look",
  "framing": "vertical 9:16, the whole slope and the wall in frame",
  "duration": "10 seconds",
  "avoid": ["text", "logos", "watermark", "people", "vehicles", "cartoon look"]
}
```

**om05_tunnel_portal.mp4** (line 11: one small mistake by engineers; I draw the labels, leader lines and icons on top, like the reference)
```json
{
  "shot": "front view of a finished railway tunnel portal cut into a steep rock face in the Himalaya",
  "subject": "an arched concrete tunnel portal with a lit tunnel interior, rock bolts and steel mesh on the rock face around it, a drainage channel along the track, rails entering the tunnel, layered rock and patches of moss",
  "action": "the camera slowly pushes straight in toward the portal; the tunnel lights glow warmly inside",
  "camera": "slow, perfectly centred, symmetrical forward push at track level, no shake, no cuts",
  "lighting": "cool overcast daylight on the rock, warm lights inside the tunnel",
  "style": "photoreal cinematic, crisp detail, 4K look",
  "framing": "vertical 9:16, the portal centred, plenty of rock face around it for labels",
  "duration": "10 seconds",
  "avoid": ["text", "logos", "signboards", "watermark", "people", "trains", "cartoon look"]
}
```

**om06_station_dusk.mp4** (line 12: Rangpo, Sikkim's first station, could open by December 2027)
```json
{
  "shot": "slow aerial orbit around a brand-new small mountain railway station at dusk",
  "subject": "a modern station building with a sloping pagoda-style roof inspired by Sikkimese architecture, two platforms with warm lights, a single railway line curving along a green river valley, forested Himalayan foothills and clouds behind, the river glowing in the last light",
  "action": "the camera slowly orbits and rises; the platform lights flicker on one by one",
  "camera": "smooth slow orbit to the right with a gentle rise, no shake, no cuts",
  "lighting": "golden dusk light fading to blue hour, warm station lights",
  "style": "photoreal cinematic architectural visualisation, hopeful mood, 4K look",
  "framing": "vertical 9:16, the station in the middle third with sky above",
  "duration": "10 seconds",
  "avoid": ["text", "station name boards", "logos", "watermark", "people close up", "cartoon look"]
}
```

**om07_train_tunnel_exit.mp4** (line 13: "हर इंच बहुत सावधानी से"; the reference's train out of a tunnel)
```json
{
  "shot": "low shot by the track as a train comes out of a mountain tunnel toward the camera",
  "subject": "a modern passenger train with a plain yellow and grey livery and its headlights on, coming out of an arched tunnel in a lush green, wet hillside; ballast, rails and dripping ferns in the foreground",
  "action": "the train emerges slowly from the dark tunnel and rolls toward the camera, its headlights flaring",
  "camera": "static low camera beside the track, very slight push in, no shake, no cuts",
  "lighting": "soft overcast light, misty, wet surfaces",
  "style": "photoreal cinematic, high detail, 4K look",
  "framing": "vertical 9:16, the tunnel mouth in the upper middle, the rails leading out of frame at the bottom",
  "duration": "10 seconds",
  "avoid": ["text", "logos", "numbers on the train", "watermark", "people", "cartoon look"]
}
```

**om08_train_viaduct_forest.mp4** (line 13, last shot before the loop; the reference's bright, green ending)
```json
{
  "shot": "aerial drone shot following a passenger train crossing a tall curved railway viaduct over a deep forested gorge",
  "subject": "a modern passenger train on a slender curved viaduct with tall piers, very dense bright green rainforest covering the gorge, a river far below, light mist",
  "action": "the drone tracks alongside and slightly above the train as it crosses the viaduct and heads toward a tunnel at the far end",
  "camera": "smooth tracking drone move from the side and above, no shake, no cuts",
  "lighting": "bright diffused daylight after rain, rich greens",
  "style": "photoreal cinematic aerial footage, vivid but natural colours, 4K look",
  "framing": "vertical 9:16, the viaduct running diagonally through the frame",
  "duration": "10 seconds",
  "avoid": ["text", "logos", "numbers on the train", "watermark", "cartoon look"]
}
```

## Null (attach `public/null/studio_master_9x16.jpg` as the starting frame)

Null appears in the middle only, in split screen: about 6 s each, about 12 s in total.

**null_sk_A.mp4** (line 9: "यहाँ बहुत ज़्यादा बारिश होती है, पहाड़ खिसकते रहते हैं")
```
Animate this stylised 3D animated character as a friendly podcast host in his studio. Keep the image, character design, studio, microphone, lighting and framing exactly as they are, with a static camera.

He explains "heavy rain and sliding hills":
0–2 s: he raises both hands and wiggles his fingers downward, like rain falling.
2–4 s: he holds one hand flat and tilted, then slides the other hand down along it, like a slope sliding.
4–6 s: he shakes his head slowly from side to side, concerned.
6–10 s: he rests both hands calmly on the desk.

Smooth, calm, explanatory movements, with his hands near the microphone. His face design stays the same throughout. No dialogue, no text.
```
Backup:
```
Animate this 3D animated podcast host. Static camera, same studio. He wiggles his fingers downward like rain, slides one hand down a tilted hand like a slope, shakes his head slowly, and rests his hands. Smooth, hands near the microphone.
```

**null_sk_B.mp4** (line 11: "इंजीनियर्स की एक छोटी सी ग़लती भी बहुत भारी पड़ सकती है")
```
Animate this stylised 3D animated character as a friendly podcast host in his studio. Keep the image, character design, studio, microphone, lighting and framing exactly as they are, with a static camera.

He explains "a tiny mistake, a big price":
0–2 s: he holds up one hand and pinches his thumb and finger almost together, showing something very small.
2–4 s: he opens both hands wide apart, showing something very big.
4–6 s: he taps the desk once firmly with his index finger, making the point.
6–10 s: he rests both hands calmly on the desk.

Smooth, calm, explanatory movements, with his hands near the microphone. His face design stays the same throughout. No dialogue, no text.
```
Backup:
```
Animate this 3D animated podcast host. Static camera, same studio. He shows a tiny gap between thumb and finger, then opens both hands wide, taps the desk once with one finger, and rests his hands. Smooth, hands near the microphone.
```
