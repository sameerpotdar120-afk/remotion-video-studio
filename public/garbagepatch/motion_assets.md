# Garbage Patch: motion assets (Remotion)

Code: `src/garbagepatch/motion/` (entry `src/garbagepatch/motion/index.ts`, zip `exports/garbagepatch_remotion_code.zip`). Map: `public/garbagepatch/maps/`. These are the bright world and north-east Pacific plates, built by `tools/build_garbagepatch_maps.py` from EOX Sentinel-2 cloudless (CC BY 4.0), AWS terrain and Natural Earth's India edition (India's official boundary, point-tested: Gilgit, Muzaffarabad, Aksai Chin, Shaksgam, Tawang), plus California, Hawaii and nine Pacific-coast rivers. `p99-reel` lays every piece on the real map with the camera moving.

Every piece follows the reference's moves and timing (`reference_analysis.md`) and the hit-every-second pace of `edit_plan.md`. Props come from your images (gp01–gp25), and nothing is drawn in their place. Text, arrows, outlines, rings, dashed paths, HUD and currents are graphics, the same as in the reference.

All are 60 fps and transparent unless noted. To render a standalone piece (transparent WebM, 4K detail):
```
npx remotion render src/garbagepatch/motion/index.ts <id> out/<id>.webm --codec=vp9 --pixel-format=yuva420p --scale=2
```

| piece | What it does | Line | Image |
|---|---|---|---|
| p01 mosaic | The island as a censor mosaic (big square cells in its own colours) in a soft oval. The cells shrink and the real island sharpens out (0.5 s), and it can re-pixelate for the loop | 1–2, 14 | gp01 |
| p02 accent | Big glowing words: letter-by-letter pop, or fly in big from the left; exit into dots or spreading apart; can curve on an arc ("माइक्रोप्लास्टिक") | all | |
| p03 hand arrow | A hand-drawn white arrow draws on along a curve, the head flicks open, and the line boils slightly | 1–2 | |
| p04 glow outline | A cyan neon outline draws round the patch with a white-hot running head, then a light keeps circling | 3, 4, 12 | |
| p05 leader | A line grows up from the patch and "Great Pacific Garbage Patch" types on | 3 | |
| p06 region glow | California fills gold from its centre with a white sheen and a throbbing bloom; Hawaii glows | 3 | |
| p07 count up | A big cyan number counts up with its unit and bumps, then a sub-line slides up ("16 लाख km²", "80,000 टन", "आबादी 0") | 2, 4, 6 | |
| p08 shape land | India (official boundary) flies in, lands with an overshoot and an edge flash, then bobs, with a lift shadow and a name tag | 1, 4 | |
| p09 map card | The world map tilts back into a card on a blue blueprint grid, drifts, and tilts back for the dive | 5 | |
| p10 num ring | A numbered cyan ring pops in, with a rotating dashed rim and ripples | 5 | |
| p11 callout | A leader line shoots out from the island, and a white bubble pops open holding a prop that bobs | 6 | gp03, gp04, gp05 |
| p12 dash paths | White dashed curves draw on and march toward the patch, with a bead running down each | 3, 7 | |
| p13 boat | A boat or ship sails from A to B, bobbing and rolling, with a spreading V wake | 7 | gp07, gp08 |
| p14 sun + drops | The sun slides in turning, with a warm wash; drops fall, stretch, and splash with rings and spray | 8 | gp10, gp11 |
| p15 patch | The trash island floating; it eats away in noisy blotches into the microplastic speckle, the speckle fades (satellites), and the patch swells (grows) | 1–14 | gp01, gp02 |
| p16 food chain | Glowing pink-red badges pop left to right, joined by dashes with a running pulse | 9 | gp02, gp15, gp16, gp17 |
| p17 letterbox | A 16:9 shot over its own blurred fill, slowly pushing and drifting, with bubbles rising; hard cuts between shots | 11 | gp21, gp22 |
| p18 zoom blur | A radial zoom blur in and out of the letterbox shots | 11, 12 | |
| p19 currents | Blue arrows circle the patch clockwise, then burst outward | 12 | |
| p20 smear | A liquid pull-down wipe in vertical strips into the next shot | 13 | |
| p21 cross-section | The ocean cutaway: props bob on the surface, the camera pans down, props sink tumbling to the floor, and the beach wipes in | 13 | gp24, gp25, gp03, gp04, gp06 |
| p22 satellite | The satellite glides across, a scan beam sweeps, and a red ✕ blinks over the patch | 10 | gp18 |
| p23 plane | A plane crosses from above with its shadow on the map (ambient, like the reference) | 1, 7 | gp09 |
| p24 pin drop | A map pin drops and bounces with a ring and a "?" (or a name tag); a red ✕ slams over it and it falls away | 1, 3 | gp19 |
| p25 shatter | A big bottle pops in and shakes, cracks race across it, and it bursts into its pieces with a flash and spray | 8 | gp03, gp13 |
| p26 magnifier | A magnifying glass slides in and hovers; the microplastic shows enlarged inside the lens | 8 | gp14, gp02 |
| p27 hud | A satellite viewfinder: corner brackets snap in, with a crosshair, a scan line, a blinking REC dot and a zoom readout; a red ✕ with "कुछ नहीं" | 10 | |
| p28 vortex | Spiral current arms spin round the patch (and small ones inside the gyre rings) | 5, 12 | |
| p29 prop path | Any prop through keyframes: debris bursting out and falling back, the net drifting, the bottle bouncing off the current | 2, 6, 12 | gp03–gp06 |
| p30 rivers | Pacific-coast rivers light up cyan from source to mouth, then dashes keep flowing seaward | 7 | |
| p31 soup bowl | The bowl pops up, and the ladle dips in and stirs round with ripples | 11 | gp23, gp23b |
| p32 shock | Shockwave rings and a flash, plus a matching camera jolt; can repeat as a throb | 1, 4, 6 | |
| p33 city pins | Skylines rise one by one down the coast with name tags and glowing feet | 7 | gp20 |
| p34 waves | Waves rise, curl and break round the patch's edge, collapsing into foam, staggered | 8 | gp12 |
| p35 bracket | A curly bracket draws beside the surface layer, with a "थोड़ा सा" tag | 13 | |

Standalone renders: `p02-accent`, `p07-count-up`, `p10-num-ring`. Everything else takes map geometry or your images and is used in the edit (and shown in `p99-reel`).
