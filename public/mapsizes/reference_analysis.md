# Reference analysis: "Why World Maps Don't Show Actual Country Sizes" (79.7 s)

Measured from the file: 720×1280, 30 fps, 2,387 frames, 79.68 s. The VO is Hindi; `reference_transcript.txt` is
whisper's English rendering of it (so "marketer" = Mercator, "sellers" = sailors, line 20.96 means "India is much bigger
than Greenland"). Scene detection finds one hard cut (27.53 s). Everything else is a camera move, a split, a lift or a
card slide.

## Three looks, one per act

1. **0–33 s, flat vector map** (navy sea, cyan land, thin borders). The named country is a bevelled 3D fill with a
   long drop shadow: Greenland yellow, India orange, Africa lime. N/S/E/W letters round it, a red dashed line measures
   it with a km counter riding the label, and a small "source card" (title, red-highlighted phrase, source URL) sits
   at the bottom.
2. **33–59 s, wooden desk**: an old double-hemisphere world map as a photo print with a cream border; Mercator's
   engraved portrait; type writing on letter by letter ("Mercator Projection", "1569"); a red dashed circle; a red
   dotted straight line drawn across the old map; a Google Maps print with its pin; a hand slides an Earth photo in.
3. **59–79.7 s, 3D globe in space**: the globe spins, red cut lines draw on it, it splits into six gores, the gores
   lay flat, then stretch into a rectangle map; the camera flies over it, green labels on Greenland/USA/Australia, a
   red equator line.

## Beat by beat

| Time | VO (meaning) | On screen |
| --- | --- | --- |
| 0.0–3.7 | Draw a straight line north–south through Greenland | world map, Greenland already yellow; fast push in, map fills screen, N/S/E/W pop |
| 3.7–7.4 | that's 2,670 km | red dashed line draws top→bottom, counter 1,817→2,670 km, source card slides in from left |
| 7.0–8.0 | (transition) | **split screen**: Greenland panel greys and slides up; a tilted divider; India panel (light map) rises from below |
| 7.7–11.3 | India north–south: 3,214 km | dashed line on India, counter 99→3,214 km, "India at a glance" card (knowindia.gov.in) |
| 11.5–12.5 | a lot more than Greenland | India panel slides down, Greenland panel back to full screen |
| 12.8–17.3 | east–west Greenland 1,050 km | horizontal dashed line, counter 68→1,050 km |
| 17.4–19.5 | India 2,933 km | split again, India horizontal line, counter to 2,933 km |
| 19.7–22.4 | again more / India is bigger | India alone full screen, labels clear |
| 22.4–23.8 | pick India up and put it on Greenland | India **lifts** (white ghost stays behind), camera pulls out fast across Asia |
| 23.8–27.5 | it looks quite small | orange India flies north-west and lands on yellow Greenland: a small patch |
| 27.5 | (hard cut) Africa too | Europe/Africa view, Africa lime-green 3D fill, card "The true size of Africa" (reuters) |
| 29.4–32.5 | 14 times bigger, still looks the same | Africa lifts (white ghost), slides next to Greenland, both about the same size |
| 33.0–34.4 | so why does this happen? | a presenter (stock man in a suit with a tablet) rises from the bottom, red 3D question marks pop |
| 34.3–36.0 | because of the Mercator projection | old world map card on wood, "Mercator Projection" types on |
| 36.3–41.0 | in 1569 Gerardus Mercator made a map | "1569" counts up, Mercator portrait pops, name types on |
| 41.0–47.0 | useful for sailors, straight lines | red dashed circle, then a red dotted straight line drawn across the old map, card "What's wrong with the world map" |
| 47.3–51.7 | became popular, used everywhere, even Google Maps | map card shrinks back to desk; a Google Maps style print flips in; card on the 2018 switch to globe view |
| 52.1–59.5 | big problem: no flat map without distortion | a hand slides a photo of Earth over the map card; the card grows to fill the screen |
| 59.5–62.6 | to make the map, cut it into six curved pieces | globe in space spins and pushes in; red cut lines draw down it |
| 62.6–64.3 | then lay them flat | the globe splits into six gores that spin and line up side by side |
| 64.3–67.1 | and stretch it | the gores flatten into one rectangular map |
| 67.6–73.8 | near the poles (Greenland, Russia, Canada, USA) stretch and look big | camera flies over the north, whip blur, green labels |
| 74.3–79.7 | near the equator (India, Africa, Australia) look small | red equator line, pass over Africa and Australia, pull back; ends on the tilted map (no loop) |

## Why it works

- **Measure first, explain later.** 33 s of hard numbers (two dashed lines, two counters, a split screen) before the
  word "Mercator". The viewer is told India is longer and wider than Greenland before they see India look tiny.
- **The lift-and-drop.** India peels off the map, leaves a white ghost, flies to Greenland. That single move is the
  whole video. Africa repeats it.
- **Every number has a source card** on screen (knowindia.gov.in, reuters, National Geographic, moneycontrol).
- **The orange peel.** The cause is shown, not described: globe → six gores → flat → stretched.

## What we can't take

Its stock presenter, the old Mercator map scan, the Google Maps screenshot and logo, the photo-hand, the 3D Earth
render and the source-card screenshots of other sites. Our versions:

- Flat vector map in code from Natural Earth (India POV edition), drawn the house way with real EOX Sentinel-2 plates
  where we go satellite. Countries moved across latitudes with the **true-size** maths (Mercator scale = 1/cos(lat)),
  so a moved India really shrinks/grows correctly on screen.
- Mercator's 1569 map is in the public domain (scans from the Library of Congress / Wikimedia Commons, PD); his
  portrait (Hogenberg engraving, 1574) is PD too. Still, safest: redraw both in code or have the creator make the
  GPT versions. No Google Maps imagery or logo: a generic "phone map app" drawn in code.
- The globe and the gores can be drawn in code: an orthographic globe from Natural Earth land, cut along meridians
  into 6 gores (interrupted sinusoidal), laid flat, then morphed into Mercator. Our map core, no 3D render needed.
- Null replaces the presenter (split screen, middle only, 5–8 s).

## Facts to check (for the script)

- Greenland N–S ≈ 2,670 km, E–W ≈ 1,050 km; area 2,166,086 km².
- India N–S 3,214 km, E–W 2,933 km (Government of India, knowindia.india.gov.in); area 3,287,263 km².
  So India is about 1.5× Greenland by area.
- Africa ≈ 30.37 million km² ≈ 14× Greenland.
- Mercator's world map: 1569, Duisburg, made for navigation (constant compass bearing = straight line, rhumb line).
- Google Maps desktop switched to a 3D globe when zoomed out in August 2018; the mobile app stays Mercator.
- Mercator stretch: linear scale 1/cos(lat), area × 1/cos²(lat). At 72° N (central Greenland) ≈ 10.5×; at 20° N (India) ≈ 1.13×.
