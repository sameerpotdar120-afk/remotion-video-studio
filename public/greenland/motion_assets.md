# Greenland and Iceland: motion assets (Remotion)

Code: `src/greenland/motion/` (entry `src/greenland/motion/index.ts`, zip `exports/greenland_remotion_code.zip`). Preview of all of them on the real bright map: `exports/greenland_motion_preview.mp4`.
Map: `public/greenland/maps/` (bright `atlantic_geo.jpg` and `iceland_geo.jpg`, the 9th-century `atlantic_paper.jpg`), built by `tools/build_greenland_maps.py` from Sentinel-2 (EOX), AWS terrain and Natural Earth. Outlines and centres are in `src/greenland/geo.json`.

The preview shows only the graphic motion. Flóki, Erik, the longship, the ravens, the helmets and the photo cards come from your images (gl01–gl08). Each component takes them as props (`ship`, `ravenUp`, `ravenDown`, `src`), and nothing is drawn in their place until they arrive.

All are 60 fps and transparent unless noted. Render any standalone one (transparent WebM, 4K detail):
```
npx remotion render src/greenland/motion/index.ts <id> out/<id>.webm --codec=vp9 --pixel-format=yuva420p --scale=2
```

| id | What it does | Line | Size, frames | Image |
|---|---|---|---|---|
| g01-highlighter | Yellow marker stroke swipes out in 7 frames with a rough edge, the name types on at one letter per frame with a blinking cursor; `out` squeezes it flat in 5 frames | 1, 2 | 900×260, 90 | |
| g02-greenland / g02-iceland | The glowing name springs open from flat (taking over from g01). GREENLAND: green gradient, grass tufts growing and swaying in a travelling gust. ICELAND: icy blue, icicles growing down, drips falling, sparkles. Light sweep, float; `fo` for the loop | 1, 2, 3, loop | 1000×360, 180 | |
| g03 ice spread | Translucent ice sheet spreads over Greenland's real outline from a point, wavy living edge, frost rim on the front, shimmer inside; "80% बर्फ़" badge counts up and bumps | 1 | 1080×1920 (edit) | |
| g04 label swap | The two names lift off and swap islands on opposite arcs with motion blur and a speed trail, land with a bounce | 3 | 1080×1920 (edit) | |
| g05 paper reveal | The 9th-century paper map slides over the satellite map with a torn fibre edge and a cast shadow; vignette breathes | 4 | 1080×1920 (edit), opaque | |
| g06-roman-ix | Inked "IX" stamps onto the paper (ink bleeds on landing), rules draw out, "9वीं सदी" writes on by hand | 4 | 800×520, 90 | |
| g07 route | Dashed ink route draws with an arrowhead; the longship rides the tip (bob, roll, wake); the ravens flap ahead (two poses swapped every 6 frames) | 4, 7 | 1080×1920 (edit) | gl03, gl04, gl04b |
| g08-snow | Three depths of snow (near ones big, fast, soft), each flake swaying, a slow gust; wraps seamlessly | 4–7 | 1080×1920, 600 | |
| g09 spyglass | Iris in to a circle in 4 frames, polished rim with a moving glint, hand-held drift inside, "ICELAND!" shout bubble bursts out | 5 | 1080×1920 (edit), opaque | gl05 inside |
| g10 pops | Helmets spring up over Iceland one after another, squash, dust ring, idle bob (red pins until gl08 arrives) | 6 | 1080×1920 (edit) | gl08 |
| g11-hand-label | "Erik the Red" writes on in a marker hand, a hand-drawn arrow curls to him; the lines "boil" every 4 frames | 6 | 900×700, 90 | |
| g12-exile-stamp / g12-clickbait-stamp | Red rubber stamp slams (1.8× → 1 in 7 frames), shock ring, ink specks, worn ink: "देश निकाला / 3 साल" and "CLICKBAIT / 1000 साल पुराना" | 6, 10 | 900×500, 80 | |
| g13-alert | Red "!" disc pops, shakes like an alarm, then pulses rings | 7 | 400×400, 90 | |
| g14 fleet | 25 routes fan out from Iceland to Greenland's south-west coast one by one, a small longship on each tip, the counter ticks 1 → 25 with a bump each time | 9 | 1080×1920 (edit) | gl03 |
| g15-title-card | Frame-0 card: GREENLAND in ice blue, ICELAND in green, the "नाम उल्टे क्यों?" sticker; already in place on frame 0, breathing; `fo` for the loop's last frame | 1, loop | 1080×760, 120 | |
| g99-reel | Every piece in a row on the bright map, with the camera pushing, opaque | | 1080×1920, 2050 | |

Flóki and Erik (gl01, gl02) enter as cut-out cards in the edit, like Columbus in West Indies; the photo cards (gl06, gl06b, gl06c) slide in for the green, hot-spring and volcano words in line 2; the snowed-in hut (gl07) carries line 5's first winter.
