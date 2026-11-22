# GTA 6 Short: look, tools and image prompts (22 Nov 2026)

## What we can and can't use

| Can't (Rockstar's) | Use instead (ours or free) |
|---|---|
| CJ, Tommy, Niko, Michael/Franklin/Trevor, Jason, Lucia, any GTA character or likeness | Original Indian characters in a painted crime-game poster style (prompts below) |
| GTA logos, the VI sunset logo, box art, cover-art grid, loading screens, trailer stills, gameplay | Blank game cases drawn in code (year only); our own title cards |
| GTA's in-game map art | Our own vector/satellite map, graded in the Vice City palette |
| Pricedown or any GTA logo look-alike font | Bebas Neue / Anton (OFL) for numbers; Hind / Mukta / Baloo 2 (OFL) for Hindi |
| GTA music, radio, sound effects | Mixkit synthwave/retro tracks, Sonniss SFX, our synthesised hits |

Names (GTA, Vice City, Los Santos, Leonida, Rockstar India) are fine as plain text labels: we are reporting facts
about the games, not using their artwork. Style is not copyrightable, so a magenta sunset, neon and palm trees are
fine. Just don't copy a specific Rockstar picture or layout.

## The GTA VI look (what gamers will recognise)

From Rockstar's VI marketing and coverage: a saturated Florida ("Sunshine State") palette, with a recurring
**magenta sunset** that became the campaign's signature. Tropical pastels and art-deco pinks for Vice City, ocean
teals, swamp greens for the Everglades side of Leonida, neon nightlife, and social-media/phone-video framing. GTA's
pause maps have always been dark with coloured blips and a bright **GPS route line**. The VI map UI hasn't been
publicly described in detail, so we evoke the series, not copy one screen.

Our map grade ("Leonida" look):

| Element | Colour |
|---|---|
| Ocean | deep teal-navy `#0A1A2A`, lighter teal `#0F6E7C` near coasts, slow ripple |
| Land | dark slate `#1A1F2B` with faint relief; no labels except ours |
| Active place (the city the VO names) | sunset gradient fill, hot magenta `#FF2E88` → orange `#FF8A3D`, flat on the map, white outline |
| Visited places | violet `#7B4DFF` at 60% |
| Borders / coast glow | cyan `#3FE0FF`, soft bloom |
| GPS route (city to city, Vice Beach → Bengaluru) | magenta line with a moving dash and a glowing head |
| Waypoint pins | white diamond with a magenta pulse |
| Counters and years | warm yellow `#FFD23F` with orange glow (like the reference) |
| Overall grade | shadows lifted toward purple, warm highlights, bloom on neon, strong vignette, **no grain** (house rule) |

India appears with its official boundary (Natural Earth, India's point-of-view edition).

## Which tool builds it

The new **cinematic-film** skill fits this reference well. The reference is one continuous camera over a map with
region fills, counters, routes and pins, and the skill already has `GeoMap`, `RegionFill`, `Route`, `MapPin`,
`Counter`, `BigText` and `DotField`, all timed to the spoken word (`doc.W`). What we add for this video:

- vertical render (`--size 1080x1920` drafts, `2160x3840` final);
- a "leonida" look based on its `night` look with the colours above, `grain` set to 0;
- Hindi fonts in `fonts/` (Hind / Mukta), since its default roles are Latin-only;
- the India map from the Natural Earth India-POV GeoJSON (its `make_map.py` takes a local GeoJSON);
- two custom items: a game-case stack that fills the map (the reference's best beat), and a GPS route with a
  moving dash;
- the painted images below as `Print`s, unpinned and with no paper frame, so they sit like loading-screen art.

Our Remotion map pipeline can do the same, but the skill gets us there faster for this layout. That's the plan unless
you say otherwise.

## Image prompts (your GPT images)

Use the same style line at the start of every prompt so the set matches. All vertical 9:16. Generate a plain-background
version too where it says CUT-OUT, so we can lift the person onto the map. Every image is labelled "AI illustration"
on screen.

**Style line (paste first, every time):**
> Painted digital illustration in the style of a 2000s crime-action video game poster: bold dark ink outlines,
> cel-shaded flat colour with soft airbrushed gradients, saturated magenta-to-orange sunset light, teal-blue shadows,
> light halftone texture. Original characters only, not based on any existing game character. No text, no logos, no
> brand names, no watermark. Vertical 9:16.

**P1. Cyber cafe, early 2000s India (beat 4)**
> [style line] A small cyber cafe in an Indian town in the early 2000s: two teenage boys in school shirts leaning in
> at a chunky beige CRT monitor, faces lit by the screen, one gripping the mouse, the other pointing and laughing. Rows
> of other CRT monitors, plastic chairs, a handwritten price board on the wall (blank, no readable text), tube light,
> evening. Warm nostalgic mood. Camera at shoulder height behind the boys, the screen glowing but its picture abstract
> (just colour and light).

**P2. The bicycle kid (beat 5, CJ line), CUT-OUT**
> [style line] An Indian teenage boy, about 15, riding a BMX-style bicycle standing on the pedals, loose shirt,
> confident grin, sunset behind him on a dusty colony road with neem trees and an overhead water tank. Full body,
> three-quarter view, motion in the shirt. Second version: same boy and bicycle on a plain flat mid-grey background,
> full body, nothing cropped, for cut-out.

**P3. The RP streamer (beat 7), CUT-OUT**
> [style line] A young Indian streamer, early 20s, in a small bedroom set-up: big headphones, a microphone on an arm,
> RGB light strip in magenta and teal, two monitors showing an abstract night-time police-chase glow (no recognisable
> game). Mid-shot, looking at camera, mid-laugh, hand raised as if talking to chat. Second version on a plain mid-grey
> background, waist up, for cut-out.

**P4. School to job: the generation that waited (beat 8), two images**
> P4a: [style line] An Indian schoolboy, about 14, in uniform with a heavy school bag, standing at a bus stop in 2013,
> holding a flip phone, looking up hopefully. Plain mid-grey background, full body, for cut-out.
> P4b: [style line] The same person grown up, about 27, in office clothes with an ID lanyard, holding a game controller
> and grinning, laptop bag on his shoulder. Same pose and framing as P4a, plain mid-grey background, full body, for
> cut-out.

**P5. Where it started: one computer, the 1990s (beat 9)**
> [style line] A small, plain room in 1990s Bengaluru: one beige desktop computer with a CRT monitor on a wooden table,
> a person seen only from behind working late, a ceiling fan, a window with a streetlight outside. Lonely, hopeful
> mood, cool blue with a warm monitor glow. No face visible (this is not a portrait of a real person).

**P6. The Bengaluru studio today (beat 9)**
> [style line] A modern open-plan game studio at night in Bengaluru: many young Indian developers and artists at
> large monitors, the nearest screens showing an original sunny beach town being built in 3D (wireframe turning into
> pastel art-deco hotels, palm trees and turquoise water). City lights of Bengaluru through tall windows. Wide shot,
> energetic, magenta and teal light.

**P7. Vice Beach mood plate, original (beats 1, 4, 8)**
> [style line] An original 1980s-style beach boulevard at magenta sunset: pastel art-deco hotels with neon signs (no
> readable words), tall palm trees, a vintage convertible, rollerskaters and joggers as small figures, turquoise sea,
> glowing sky. Wide establishing shot, no main character.

**P8. The next city? (beat 10), two panels**
> P8a: [style line] Mumbai at night as a crime-game city: Marine Drive's curve of lights, the sea, a yellow-black
> taxi and a motorcycle racing along the promenade, neon reflections, monsoon sky. Wide, cinematic.
> P8b: [style line] Bengaluru at night as a crime-game city: a flyover full of traffic, glass tech towers, a
> rain-wet street with an auto-rickshaw and a superbike side by side, neon reflections. Wide, cinematic.

## Credits line (description)

Map: Natural Earth (India's official boundary) · US states: US Census via us-atlas · AI illustrations (original
characters) · Music: Mixkit · SFX: Sonniss + own · GTA and Grand Theft Auto are trademarks of Take-Two Interactive;
this video is not affiliated with Rockstar Games.
