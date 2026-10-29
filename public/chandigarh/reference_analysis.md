# Reference analysis: "This is India's Perfect City" (Chandigarh)

**Source:** 720×1280, 30 fps, 107.7 s, English VO by an on-camera presenter.

**How I checked it:** the whole video at 3 fps, then 15–22 fps (every 1–2 frames) through every map move and transition. The windows: the intro and the photo bubble, the bubble out, Pakistan and Punjab, the cut to Punjab, the Shivalik ribbon, the site blob, the icon pops, the temple reveal, back to the satellite, the diagonal wipe, the line morphs, the brush wipe, the paper tear, the sector fill, the zoom into the grid, Sector 17, the roads, V1 to V7, the zones, the sun on the roof and the honeycomb facade.

**The core is maps.** About 70 of the 107 seconds are maps, in three looks (A, B and C below). The rest is a talking head (about 18 s, five short cuts), real photos of buildings, and one newspaper clipping.

## Pace

There are about 95 on-screen events in 107 s, roughly one every 1.1 s, the same as the Garbage Patch reference. With the talking head taken out, the map stretches run faster, about one event every 0.9 s. On the maps the camera is never still: a slow push or drift goes under every beat, and every new label, fill or icon arrives on its own beat.

## Map look A: the satellite relief map (0:00–0:31)

- **Base:** a natural satellite basemap with strong terrain relief. The original is Esri World Imagery, so we rebuild it from EOX Sentinel-2 plus AWS terrain hillshade. The colours are warm: sand-beige Tibet, green plains, white snow on the Himalaya, deep teal sea with visible ocean-floor relief.
- **Grade:** a strong dark vignette on all four edges, plus a **tilt-shift blur**: the top and bottom 15% of the frame are soft, the middle sharp. A small italic tile credit runs along the bottom.
- **Country and state fills** (the signature look):
  - The colour is laid over the satellite with *multiply/colour* blending, so the terrain still shows through: India dark red, Pakistan green, Pakistani Punjab violet-blue, Indian Punjab mustard yellow, the Chandigarh site gold, the Chandigarh UT bright orange-red.
  - Each fill is a **raised slab**: a thin bright rim (white, about 2 px) and a soft dark drop shadow offset down and right, so the region looks cut out and lifted a few pixels off the map.
  - Mountains inside a fill keep their hillshade, so the Himalaya inside the red reads as embossed red relief.
- **How fills arrive:**
  - India is already filled on frame 0.
  - Pakistan grows in as a soft-edged colour wipe from west to east over about 0.5 s.
  - Undivided Punjab first appears as a glossy white fill. It then splits: the west half turns violet (Pakistan) and the east half yellow (India), in 0.3 s each, while the camera pushes in.
  - The Chandigarh site blob fades in at 30%, then firms up to a solid gold, paper-cut shape with a rough, irregular edge over about 1 s.
  - The UT shape appears through the cross-dissolve, already orange-red.
- **Labels:**
  - Country and state names ("INDIA", "PUNJAB") are in a classical **serif** (Cinzel/Trajan style): engraved white-to-grey gradient on the red, dark brown on the yellow, with a soft shadow.
  - Place pins are small black boxes with white caps and an arrow ("LAHORE", "CHANDIGARH").
- **The Shivalik Hills ribbon:** a wide, slightly see-through **turquoise band with a water-like texture**. It draws itself along the foothill line from north-west to south-east in about 1.2 s, with a thin dark edge. "SHIVALIK HILLS" is written along it in black serif capitals that follow the curve.
- **Camera:**
  - Frame 0 is India big, top-down, with a slight downward tilt.
  - Then a slow push. When the photo bubble opens, it zooms out to all of India (0:00.5–0:01).
  - It pushes in toward Punjab during the fills (0:05–0:10).
  - It cuts to the talking head, then cuts back to a much closer Punjab (0:12).
  - It pushes in while the colours dissolve away to the plain satellite (0:14.5–0:15.5), and keeps a slow push on the site (0:15–0:23).
  - After the temple, a cross-dissolve lands on a higher zoom of the UT, then a slow zoom out while the map **desaturates** to a grey, urban satellite (0:25–0:27).

## Map look B: the paper planning map (0:31–1:26)

- **Background:** off-white paper with a soft grey radial vignette, flat (no perspective).
- **Line art:** black hand-drawn outlines, about 3 px, a little uneven.
- **The morphs** (each about 1 s, smooth point-to-point interpolation):
  1. The Chandigarh outline morphs into a **human body** outline, through a stretched, twisted in-between shape.
  2. The body morphs into a **rough square**, the city's plan frame, which straightens itself.
- **Typography:**
  - "CHANDIGARH" in a wide-tracked geometric sans (Jost or Futura style) at the top.
  - Labels ("Capitol Complex", "Sectors", "Sector 17", "Education Zone", "Leisure Valley") are smaller and bold, and **type on letter by letter**.
  - Each label is linked to its feature by a thin black **leader line with a dot at each end**.
- **The sectors:**
  - The city is a grid of about 50 rectangles with slightly irregular, paper-cut edges and rounded corners, filled with a **woven burlap (jute) texture** in burnt orange, separated by white roads of uneven width.
  - They appear with a **noisy "paint" dissolve**: speckled patches that harden into solid tiles, spreading row by row from the top-left over about 1.8 s.
  - The **Capitol Complex** is a yellow block at the top with a white **brain** icon (the head).
  - **Sector 17** is a red tile with a white **anatomical heart** icon. It pulses, and the camera zooms in on it.
  - When zoomed in, the tiles turn pale beige jute. One sector stays dark and gets **dimension lines** with ticks: "800m" across the top and "1200m" down the side, each counting up, then "250 Acres" typed inside.
- **Roads (the circulation):**
  - The whole map fades to pale, and road lines **draw on** from the edges in three colours: maroon (V1/V2 arterials), magenta (the sector roads) and cyan (the curved V3s).
  - The V1 lines then run off the map to black name tags: Kalka, Ambala, Patiala, Mullanpur, Abhipur.
  - A dark glass **pill badge** with a red dot reads "V1 Line". The camera zooms in through it, and the badge changes to "V7 Line" with a grey dot as dashed footpath lines appear between the tiles.
- **Zones** (the limbs and lungs):
  - Education Zone is a blue fill on the left edge and Industrial Zone a magenta fill on the right edge, each wiping in from its edge.
  - The Leisure Valley is a green ribbon that draws down the middle from top to bottom, and small green dots (the gardens) pop across the sectors.
- **Camera:** gentle zooms on each beat (scale about 1.0 → 1.15). There are zoom-throughs into the grid twice, at 0:45 and 0:58, each with motion blur. The plan frame drifts slightly between beats.

## Map look C: the satellite sector spotlight (0:59–1:01)

A dark, desaturated top-down satellite of Sector 17. The sector is outlined with a **rounded rectangle in glowing white**, and everything outside it is darkened further, like a spotlight. A label pill with neon green text, "PEDESTRIAN-ONLY ZONE", types on.

## Photos, cards and transitions

- **Photo bubble (0:01.5–0:03.6):** a white map pin pops from a point on the map. A circular photo bubble grows out of it, blurred to sharp in 8 frames, with a thin white rim and a pointer triangle. Its photos swap three times (a modern planned city, a pagoda, a market square), then it blurs and shrinks back into the pin.
- **Icon badges (0:18.5–0:23):** a black caption tag slides in, then a small gold disc grows on a squiggly leader line from the site and pops (with overshoot) into a gold-rimmed round icon: Natural Drainage, Fertile Soil, Water. Each icon swaps with a quick flip.
- **Blob mask reveal (0:23.2):** the gold site blob fills with the temple photo, then the blob mask **grows organically** (rough edge) to fill the frame. A dark glass pill label types "CHANDI MATA TEMPLE" in glowing yellow.
- **Label pills on photos:** a dark translucent rounded pill with glowing yellow bold caps, typed letter by letter. Each one grows from a dot, then stretches into the pill (Le Corbusier, Legislative Assembly, Secretariat, High Court, Open Air Shopping Plaza, Cinema, Fountains). There's also an "AI REPRESENTATION" tag on the AI images.
- **Diagonal soft wipe (0:32):** from a dark red glitter background with the gold, glittering city shape, a soft diagonal wipe to white paper. The shape changes into its black outline as the wipe passes.
- **Brush-stroke wipe (0:37.8):** big white painterly brush strokes sweep across from top-right to bottom-left over about 0.8 s, revealing the photo underneath.
- **Paper tear (0:41.2):** the photo tears away in jagged white paper strips from the right, revealing the plan again.
- **Cross-dissolves** between the maps, and **hard cuts** to the presenter on the beat.
- **Overlays on photos:**
  - The High Court's roof is highlighted in purple, with a cartoon glowing sun and warm rays bending onto the "CURVED ROOF" label.
  - The Secretariat facade gets a magenta overlay that sweeps across the honeycomb grid in strips, with "SUMMER – COOL" and "WINTER – WARM" pills.
- **The end:** a newspaper clipping with a highlighter sweep across one sentence, the presenter with a "FOLLOW ME" Instagram pill (the CTA), and no loop.

## Sound

- **Music:** a warm, rhythmic bed at about 109 BPM (energy at 160–520 Hz), mixed **loud**. In the gaps it sits almost at the voice's level (median about −20 dB in both speech and pauses), so the edit feels driven by the music. The music doesn't drop out at the talking-head cuts.
- **SFX:** whooshes on every transition: 14.6 (the ribbon and the dissolve), 23.1 (the blob reveal), 31.9 (the wipe), 35.2 (the morph), 37.9 (the brush), 41.2 (the tear), 45.2 (the zoom-through), 58.6 (Sector 17), 64.3 (roads), and a whoosh run at 75.2–75.9 (the zoom to V7). Soft clicks and pops sit on every pill, tag, icon and type-on. There are low hits at 69.5 and 91.6.

## What we replace (copyright-free only)

- **Esri satellite:** EOX Sentinel-2 cloudless plus AWS terrain hillshade, rebuilt in the same warm look, with the embossed colour fills, rims and shadows drawn in code. Borders from Natural Earth's India edition, with **India's official boundary** (PoK, Gilgit-Baltistan, Aksai Chin, Arunachal). Pakistan's fill must stop at India's official line. Punjab, Chandigarh UT and Punjab (Pakistan) come from Natural Earth admin-1. The Shivalik line is drawn along the foothills.
- **The presenter:** Null in split screen, in the middle only (two short moments). The video opens and ends on maps, as a loop.
- **Real photos** of the temple, Le Corbusier, the Capitol buildings, Sector 17, the cinema, the fountains and the newspaper: UE5 GPT images instead. Le Corbusier's likeness is based on a free Wikimedia Commons reference photo. The newspaper becomes a UNESCO badge drawn in code (no publication's layout or logo).
- **The paper plan map, the sectors, the jute texture (GPT texture), the line morphs, the icons (GPT, UE5 style), the roads and the zones:** all built in Remotion.

## Facts to keep straight for our script

- Chandigarh was planned after Partition (1947), when Lahore went to Pakistan.
- Le Corbusier's master plan dates from 1951. He worked with Pierre Jeanneret, Maxwell Fry and Jane Drew, building on Albert Mayer's earlier plan.
- A sector is about 800 × 1200 m, about 96 hectares. That's about 240 acres; the reference rounds it to 250.
- Sector 17 is the pedestrian city centre.
- The roads follow the "7 Vs" system.
- The Capitol Complex became a UNESCO World Heritage Site in 2016, as part of "The Architectural Work of Le Corbusier".
- I'd drop the Yale and Harvard claim: it isn't verifiable.
