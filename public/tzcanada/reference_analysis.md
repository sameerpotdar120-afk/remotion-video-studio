# Reference analysis: "Why Time Zones Got So Weird (Canada vs USA)" (67.5 s)

Measured from the file: 1080×1920, 30 fps, 2,022 frames, 67.45 s. Scene detection finds **no hard cut**: the whole
video is one continuous map camera; changes happen by zooms, recolours and two full-screen inserts (a clock, satellite
close-ups). Captions: small white word-by-word line at y≈1200 (about 62 % down) all the way through.

| Time | Shot | Motion, frame by frame |
| --- | --- | --- |
| 0.00–0.40 | World map (satellite, ice white) tilted, top edge visible | frames 0–12: slow push; no labels (picture-first frame 0); caption "Look at the time zones" from frame 2 |
| 0.40–0.80 | North America pops pale | frames 12–24: USA + Canada fade to a pale cream overlay while the camera pushes in and the map flattens |
| 0.80–1.20 | Time zones develop | frames 24–36: each zone fades from pale to its colour (blue, green, orange, red, yellow, purple) over ~0.4 s, west first |
| 1.20–1.60 | Zone tags | frames 36–48: small "UTC-8 … UTC-3:30" boxed tags pop on each zone |
| 2.0–4.5 | Hold, slight drift | Alaska light blue, Pacific green, Mountain orange, Central red, Eastern yellow-red, Atlantic yellow, Newfoundland purple |
| 4.5–6.6 | Longitude lines | thin white meridians sweep across the map left to right, slightly curved |
| 7.0–9.0 | Clock labels | the UTC tags swap to clock times (9 AM, 10 AM, 11 AM, 12 PM, 1 PM, 1:30 PM) |
| 9.5–12.5 | Push west + red pin | zoom onto the western US/Canada, a pin drops, the zone edge glows as the camera crosses ("east or west") |
| 12.8–15.0 | Full-screen clock "November 1" | a white wall clock at 2:00 with a date window fills the frame, slight push and tilt |
| 15.0–15.6 | Clock flies away | frames: the clock blurs and drops down out of frame in ~0.5 s with heavy motion blur, map revealed behind |
| 15.6–17.5 | Recolour | zones in BC, Alberta, Manitoba, NWT, Yukon, Saskatchewan change colour (Pacific → green, etc.); "really weird" |
| 17.5–21.0 | Calgary and Destin | zoom to Alberta, Calgary tag with a ring pulse; whip to Florida, Destin tag |
| 21.0–25.0 | Distance | pull out, the zone colours fade to satellite; a yellow line Calgary → Destin with "2,000 mi" and a "27.5°" longitude label between two meridians |
| 25.0–27.5 | Same time | zones recolour, both show "10 AM" |
| 27.5–29.5 | Vancouver circle | a white ring draws round Vancouver, camera dives into it |
| 29.5–33.5 | Vancouver–Seattle satellite | two meridians drop through both cities, "123.12° W / 122.33° W", "0.79°" between |
| 33.8–36.0 | Hour difference | border split: green (BC) above, blue (Washington) below, "9 AM" / "8 AM" tags |
| 36.5–45.2 | The train | a red rail line draws Vancouver → Seattle, a train icon moves along it; split-flap departure boards "VAC 1:00 → SEA 4:00" and the return "SEA 4:00 → VAC 9:00"; "4H" glowing tag over the train |
| 45.7–48.3 | Dozens more | pull out to the continent, white ring pulses pop at many places |
| 48.3–49.3 | "?" | big white question marks pop over the zones |
| 49.7–55.8 | The provinces | satellite, BC / Alberta / Manitoba / NWT go pale with name tags, one by one |
| 55.8–58.5 | Locks | clock icons on each, then they flip to red padlocks (not switching); Saskatchewan and Yukon join |
| 58.5–62.8 | Everyone else turns back | many clock icons pop over the US and eastern Canada and spin back an hour |
| 62.8–67.4 | Spring | zones recolour, clock labels back; slow push; ends on the normal map (not a loop) |

Style notes for our version: the same continuous camera on EOX satellite with Natural Earth zone fills (time zones are
cut from Natural Earth's time-zone polygons, with India never involved here), boxed UTC / clock tags, sweeping
meridians, a code-drawn clock that flies off with motion blur, ring pulses, a drawn rail line with a moving train icon,
split-flap boards drawn in code, padlock / clock icons in code. The clock and boards are the only "props"; everything
else is map work. Every image in the reference (satellite, icons) is someone else's: we rebuild it all.

## Facts checked (Nov 4, 2026)
- On 1 November 2026 most of North America fell back an hour, but British Columbia (now UTC−7 year-round, "Pacific
  time"), Alberta (UTC−6), Manitoba and the Northwest Territories did not change their clocks. Sources agree on BC,
  Alberta and NWT; Manitoba's coverage differs on details. Saskatchewan and Yukon already stay on one time all year.
- Ontario and Quebec still change clocks, so the gaps between provinces change over the winter.
- Still to check before the script: Calgary–Destin distance and longitude gap, Vancouver/Seattle longitudes, the
  Amtrak Cascades schedule times, and the reference's "in spring everything returns to normal" (it may not, if the
  provinces stay put all year).

Sources: payworks.ca DST guide 2026; moving2canada.com (Oct 2026); nowtoronto.com; Wikipedia "Time in British
Columbia", "Daylight saving time in Canada"; Boston Globe (16 Oct 2026).
