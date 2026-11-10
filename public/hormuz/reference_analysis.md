# Reference analysis: "The irreplaceable Strait of Hormuz" (44.5 s)

Measured from the file: 720×1280, 30 fps, 44.5 s, Hindi VO (whisper medium, `reference_transcript.txt`). Scene
detection finds only two hard cuts (10.6 s and 26.5 s); everything else is camera moves on one 3D map.

## The look (this is what we have to match)

- **A real 3D map, not a flat one.** A relief terrain seen through a perspective camera, tilted about 30-45° from
  vertical, with slow push-ins, orbits and roll. Mountains have real shading and depth; the camera sometimes drops low
  enough that the horizon bends away (frames 13-15, 24-26).
- **Two map moods.** (1) A desaturated "atlas" grade: brown-grey land, flat pale-grey sea, thin white borders, place names
  in a typewriter face laid **flat on the ground in perspective** (IRAN, OMAN, U.A.E.) and small serif sea names
  (Persian Gulf, Gulf of Oman). (2) A satellite close-up of Musandam: sandy Iran coast, deep navy sea with shallow
  turquoise shelves.
- **Countries as raised slabs.** Iran, the UAE and Oman fill with flat colours (Iran lime green, UAE pink-red, Oman green)
  **extruded upwards** with an edge and a soft shadow, the terrain texture still showing through the colour.
- **Shipping lanes** as glowing red lines through the strait, with small 3D oil-drum icons travelling along them.
- **Overlays.** Green sign-post labels ("STRAIT OF HORMUZ", "20% of Global oil supply passes here", "Why can't we create an
  Alternative Route?"), a 3D extruded green "$200 BILLION" in perspective, a hypothetical canal cut as a dark channel
  through Musandam, the Al Hajar range as a raised blue band with a height counter (1,555 → 1,800 M), stock-style 3D
  icons (explosions over Iran, oil drums, an Israel badge), cut-out handshake hands (UAE and Oman), and octagon icon
  badges (Security, Customs, Military).
- **Motion.** Everything moves: the camera never stops, labels pop with overshoot, fills grow in, the canal draws in.

## Beat by beat

| Time | VO (meaning) | On screen |
| --- | --- | --- |
| 0-4 | Hormuz carries about 20% of the world's oil | atlas map of the Middle East pushes in to the strait; red shipping lane draws through; oil drums; "20% of Global oil supply passes here" |
| 4-10.6 | in a war, why not just build an alternative route? | explosion icons over Iran; Iran rises as a green slab; Israel badge; "Why can't we create an Alternative Route?" |
| 10.6-16.6 | (cut) on the map it looks like you can just cut through here, but it's hard | satellite close-up of Musandam: UAE pink, Oman green, a dark canal draws across, red lanes reroute through it |
| 16.6-24.5 | the Hajar mountains, about 1,800 m high | camera pulls back; the Hajar range rises as a blue band; height counter to 1,800 M; camera tilts low along it |
| 24.5-26.5 | over $200 billion | 3D "$200 BILLION" text sweeps over, coins and cash tumble onto the map |
| 26.5-33.5 | (cut) UAE and Oman would have to agree; both countries cut in two | atlas map again: UAE red, Oman green, handshake hands; push in on the cut |
| 33.5-39.8 | key locations and centres split: security, customs, military | "Key locations", "Major centers" tags; octagon icons pop |
| 39.8-44.5 | that's why there's still no alternative to Hormuz | pull back to the strait, "STRAIT OF HORMUZ" sign, red lane |

## Fact check of the reference

| Claim | Verdict |
| --- | --- |
| About 20% of world oil supply passes Hormuz | **True.** EIA: about 20 million b/d in 2024, about 20% of global petroleum liquids consumption. |
| Hajar mountains "about 1,800 m" | **Too low for the range.** The range is about 700 km long; its highest peak, Jebel Shams (Oman), is about 3,009 m. In the north near the UAE, Jebel Jais reaches about 1,911 m. |
| A canal would cost "more than $200 billion" | **Unsourced.** No study we could find; dropped from our script. |
| UAE and Oman would both be cut in two | **Plausible framing** of a hypothetical canal across Musandam/Ras Al Khaimah (Musandam is an Omani exclave). |
| "No alternative to Hormuz has been built" | **Misleading.** Saudi Arabia's East-West pipeline (5 million b/d, briefly 7 million in 2019) runs to the Red Sea, and the UAE's pipeline (1.8 million b/d) runs to Fujairah outside the strait. EIA estimates only about 2.6 million b/d of spare capacity could bypass Hormuz in a disruption, against 20 million through it. |

## Current context (check again before upload)

- After the US-Israel strikes on Iran (February 2026) and the war that followed, traffic through Hormuz collapsed.
  Early November 2026: IMF PortWatch data counted 1 transit on 1 November against a pre-crisis 85 a day (Straits brief,
  10 Nov); UKMTO describes traffic as "well below normal but not stalled"; Saudi tankers crossing with US military
  coordination (Bloomberg, 10 Nov). Our script says only that traffic "बहुत कम हो गया है", which every source supports.
- India: Kpler put about 50% of India's crude imports through Hormuz in January-February 2026 (S&P Global: about 52%).
  The government says it has since rerouted much of it. The script says "इस साल की शुरुआत में… करीब आधा".

## How we match the quality (no cheap flat render)

- **Blender terrain**, from our `tools/blender` pipeline (the Sikkim landslide setup): AWS terrarium DEM displaced into a
  real mesh, EOX Sentinel-2 cloudless as the texture, graded two ways (atlas grade and satellite grade), rendered through
  a tilted perspective camera with depth of field and soft sun shadows.
- **Raised country slabs** from Natural Earth (India POV edition) as extruded, bevelled meshes with a translucent
  colour material over the terrain; the Hajar range as a raised band from the DEM above a height threshold.
- **Labels laid on the ground** in perspective (country names, sea names), lanes and the canal as glowing curves on the
  terrain, the oil drums and icons as simple 3D objects.
- Rendered as image sequences (EXR/PNG) and composited in Remotion with the house grade, captions, Null and the mix.
- Copyright: no reference graphics, stock icons, hands or the "$200 BILLION" asset; only the creator's images and code-drawn
  or Blender-built props.

Sources: EIA Today in Energy (id=65504); Wikipedia "Al Hajar Mountains"; ThePrint / Business Today / S&P Global (India's
Hormuz share, early 2026); Straits.live daily brief (10 Nov 2026); Gulf News (UKMTO); Bloomberg (10 Nov 2026).
