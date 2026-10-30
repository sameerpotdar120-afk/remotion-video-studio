# Sikkim: edit plan (the reference's style, built in code)

Everything is built in Remotion code: no GPT images, no AI footage. The only outside assets are the 2 Null clips (`omni_prompts.md`). Where the reference cuts to drone footage, we cut to **real 3D flyovers of the actual Teesta valley**, rendered with three.js from AWS terrain elevation data with EOX Sentinel-2 imagery draped over it (free, credited), plus code-drawn trains, viaducts, tunnels and the station. Lines, tints, labels and cards go over these shots the way the reference draws over its footage.

The look follows the reference: a dark, desaturated relief map (our EOX Sentinel-2 + AWS terrain, graded dark like their Esri map), one cyan accent, heavy vignette, drifting clouds, no subtitles (labels only), the camera always moving, one big graphic building per shot. India is always the official map. The video runs about 100 s at the creator's pace, so it gets about 50 events, one every ~2 s.

`[code]` = drawn in Remotion. `[3D]` = a three.js flyover of the real terrain, with code graphics on top. Times are estimates; they get re-timed to the VO.

| # | VO | on screen |
|---|---|---|
| 1 | भारत में 7,000 से ज़्यादा रेलवे स्टेशन हैं, | `[code]` Frame 0: dark India (official boundary) with a dusty rose fill, clouds drifting over the bottom third. Gold city dots light up and gold rail lines shoot between them into a dense web; a counter ticks up to "7,000+". |
| | पर एक पूरा राज्य ऐसा है जहाँ आज तक एक भी ट्रेन नहीं पहुँची है: सिक्किम। | `[code]` The web shrinks into sparks; the camera swings and pushes to the north-east; Sikkim lights up cyan (its own terrain tinted, everything else darker), thick white borders (Nepal, Bhutan, West Bengal, China) draw on, and the 3D extruded "SIKKIM" title drops in and floats. |
| 2 | क्यों? क्या किसी ने कोशिश ही नहीं की? | `[code]` A drawn track with a small train climbs from the south toward Sikkim and stops short of the border; a "?" pulses. |
| 3 | सिलीगुड़ी या न्यू जलपाईगुड़ी में ही ट्रेन से उतरना… सड़क से | `[code]` Pins on Siliguri and New Jalpaiguri; the train stops there; a road line (NH10) winds up the Teesta valley into Sikkim, with a small car moving along it. |
| 4 | असली वजह है हिमालय। | `[code]` Sikkim's fill turns into an illustrated Himalaya (rows of snow-peak shapes on teal), "HIMALAYAS" curves across it, and a big "SIKKIM" slides up from the bottom. |
| 5 | लंबी, धीमी चढ़ाई और कम से कम मोड़। | `[code]` A side diagram: a long gentle ramp with a train gliding up and a "✓"; then a steep jagged profile that the train can't climb, with a "✕". |
| 6 | ज़मीन सीधी ऊपर उठती है, गहरी घाटियाँ | `[3D]` Hard cut to a low flyover rising up the real Teesta gorge (DEM relief exaggerated a little, mist drifting through); hexagon badges "PEAKS" / "VALLEYS" pop, each holding a small 3D view of a peak and a valley. |
| 7 | पहाड़ के ऊपर से नहीं, पहाड़ के अंदर से | `[3D]` The camera pushes along the real valley; a code-drawn viaduct carries a glowing line that dives into the mountainside; the hill turns translucent with a tinted glow so the line shows running inside it. |
| 8 | सेवोक से रंगपो… 45 किलोमीटर… 86 प्रतिशत… 38 किलोमीटर | `[code]` Paper-tear back to the map, zoomed on the Teesta valley: the route draws Sevoke → Rangpo with stations (Sevoke, Riyang, Teesta Bazar, Melli, Rangpo); counters for "45 km" and a ring filling to "86%" → "38 km". |
| 9 | 14 सुरंगें, 22 पुल और 5 स्टेशन। सबसे लंबी सुरंग 5.3 km | `[code]` Tunnel segments light up along the route one by one (counter 1→14), bridge ticks (→22), station dots (→5); then the longest tunnel glows with a "5.3 km" bracket. Quick `[code]` insert: a rush through a tunnel (perspective rings, work lights streaking past, a drill rig silhouette at the face). |
| 10 | बारिश… पहाड़ खिसकते… टनल नंबर 7 की सुरक्षा दीवार | `[code]` Storm clouds roll over the map, rain streaks and lightning; a tilted "LANDSLIDE · AUG 2025" card slides in at Tunnel 7, holding a `[3D]` close view of the slope where a code-drawn scar of soil slips down toward a wall. **Null A** split screen. |
| 11 | भूकंप के ज़ोन 4, high-risk | `[code]` Red pulse rings throb over Sikkim; a "ZONE IV · HIGH RISK" tag; a shake. |
| 12 | इंजीनियर्स की एक छोटी सी ग़लती | `[code]` An illustrated tunnel portal in a rock face (layered rock, bolts, mesh, a lit interior), pushing in, with labels on leader lines: STABILIZE, DRAINAGE, VENTILATION, LINING; a process strip "STABILIZE → LINE → DRAIN → VENTILATE". **Null B** split screen. |
| 13 | फिर भी काम चल रहा है… 85 प्रतिशत… दिसंबर 2027… रंगपो | `[code]` Our own fact card (not a real publication) whips in with a highlight sweep; a progress ring fills to 85%. `[3D]` Dusk over the valley at Rangpo: a code-drawn station with a pagoda-style roof, platform lights coming on, a "RANGPO" pin and "DEC 2027". |
| 14 | हर इंच सावधानी से… हिमालय ग़लतियाँ माफ़ नहीं करता। इसीलिए तो… | `[3D]` a code-drawn train comes out of a tunnel portal and runs along a viaduct across the valley; clouds wipe back to the dark India map, which pulls out to frame 0 (the loop). |

**Sound:** a dark cinematic bed, mixed loud like the reference's; a whoosh or hit on every transition and pop.

**Data:** Natural Earth India edition for the country and state borders (Sikkim, West Bengal, Nepal, Bhutan, China); the Sevoke–Rangpo alignment drawn along the Teesta from the five station locations; NH10 along the valley; city dots for the rail web from Natural Earth populated places.
