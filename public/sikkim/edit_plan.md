# Sikkim: edit plan (the reference's style, built in code)

No GPT image props this time. Every map, graphic and animation is drawn in Remotion code; the only outside assets are the Omni clips (`omni_prompts.md`): 8 footage shots, used the way the reference uses its footage (with lines, tints, labels and cards drawn over them), plus 2 Null clips in split screen.

The look follows the reference: a dark, desaturated relief map (our EOX Sentinel-2 + AWS terrain, graded dark like their Esri map), one cyan accent, heavy vignette, drifting clouds, no subtitles (labels only), the camera always moving, one big graphic building per shot. India is always the official map. The video runs about 100 s at the creator's pace, so it gets about 50 events, one every ~2 s.

`[code]` = drawn in Remotion. `[omXX]` = an Omni footage clip with code on top. Times are estimates; they get re-timed to the VO.

| # | VO | on screen |
|---|---|---|
| 1 | भारत में 7,000 से ज़्यादा रेलवे स्टेशन हैं, | `[code]` Frame 0: dark India (official boundary) with a dusty rose fill, clouds drifting over the bottom third. Gold city dots light up and gold rail lines shoot between them into a dense web; a counter ticks up to "7,000+". |
| | पर एक पूरा राज्य ऐसा है जहाँ आज तक एक भी ट्रेन नहीं पहुँची है: सिक्किम। | `[code]` The web shrinks into sparks; the camera swings and pushes to the north-east; Sikkim lights up cyan (its own terrain tinted, everything else darker), thick white borders (Nepal, Bhutan, West Bengal, China) draw on, and the 3D extruded "SIKKIM" title drops in and floats. |
| 2 | क्यों? क्या किसी ने कोशिश ही नहीं की? | `[code]` A drawn track with a small train climbs from the south toward Sikkim and stops short of the border; a "?" pulses. |
| 3 | सिलीगुड़ी या न्यू जलपाईगुड़ी में ही ट्रेन से उतरना… सड़क से | `[code]` Pins on Siliguri and New Jalpaiguri; the train stops there; a road line (NH10) winds up the Teesta valley into Sikkim, with a small car moving along it. |
| 4 | असली वजह है हिमालय। | `[code]` Sikkim's fill turns into an illustrated Himalaya (rows of snow-peak shapes on teal), "HIMALAYAS" curves across it, and a big "SIKKIM" slides up from the bottom. |
| 5 | लंबी, धीमी चढ़ाई और कम से कम मोड़। | `[code]` A side diagram: a long gentle ramp with a train gliding up and a "✓"; then a steep jagged profile that the train can't climb, with a "✕". |
| 6 | ज़मीन सीधी ऊपर उठती है, गहरी घाटियाँ | `[om01]` Hard cut to the valley rise; hexagon badges "PEAKS" / "VALLEYS" pop (stills from om01). |
| 7 | पहाड़ के ऊपर से नहीं, पहाड़ के अंदर से | `[om02]` The viaduct pushing into the tunnel; a glowing line traces the track up into the portal, and the mountain gets a tinted, glowing overlay. |
| 8 | सेवोक से रंगपो… 45 किलोमीटर… 86 प्रतिशत… 38 किलोमीटर | `[code]` Paper-tear back to the map, zoomed on the Teesta valley: the route draws Sevoke → Rangpo with stations (Sevoke, Riyang, Teesta Bazar, Melli, Rangpo); counters for "45 km" and a ring filling to "86%" → "38 km". |
| 9 | 14 सुरंगें, 22 पुल और 5 स्टेशन। सबसे लंबी सुरंग 5.3 km | `[code]` Tunnel segments light up along the route one by one (counter 1→14), bridge ticks (→22), station dots (→5); then the longest tunnel glows with a "5.3 km" bracket. Quick `[om03]` insert of the tunnel interior. |
| 10 | बारिश… पहाड़ खिसकते… टनल नंबर 7 की सुरक्षा दीवार | `[code]` Storm clouds roll over the map, rain streaks and lightning; a tilted "LANDSLIDE · AUG 2025" photo card (a frame from `[om04]`) slides in at Tunnel 7. **Null A** split screen. |
| 11 | भूकंप के ज़ोन 4, high-risk | `[code]` Red pulse rings throb over Sikkim; a "ZONE IV · HIGH RISK" tag; a shake. |
| 12 | इंजीनियर्स की एक छोटी सी ग़लती | `[om05]` The tunnel portal push-in, with code labels on leader lines: STABILIZE, DRAINAGE, VENTILATION, LINING; a process strip "STABILIZE → LINE → DRAIN → VENTILATE". **Null B** split screen. |
| 13 | फिर भी काम चल रहा है… 85 प्रतिशत… दिसंबर 2027… रंगपो | `[code]` Our own fact card (not a real publication) whips in with a highlight sweep; a progress ring fills to 85%. `[om06]` the new station at dusk, with a "RANGPO" pin and "DEC 2027". |
| 14 | हर इंच सावधानी से… हिमालय ग़लतियाँ माफ़ नहीं करता। इसीलिए तो… | `[om07]` the train out of the tunnel, then `[om08]` the train on the viaduct; clouds wipe back to the dark India map, which pulls out to frame 0 (the loop). |

**Sound:** a dark cinematic bed, mixed loud like the reference's; a whoosh or hit on every transition and pop.

**Data:** Natural Earth India edition for the country and state borders (Sikkim, West Bengal, Nepal, Bhutan, China); the Sevoke–Rangpo alignment drawn along the Teesta from the five station locations; NH10 along the valley; city dots for the rail web from Natural Earth populated places.
