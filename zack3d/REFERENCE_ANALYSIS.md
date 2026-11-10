# Reference analysis: "How Horseflies Bite You" (1440x2560, 29.97 fps, 27.6 s)

Full frame-by-frame pass (contact sheets at 6 fps, frame-difference cut detection at 30 fps, full-res crops,
colour measurements). Use this as the target sheet for every shot of our own video.

## 1. Edit grammar (measured)
- **Zero hard cuts.** Frame-difference never spikes for a single frame; every shot change is a 4-15 frame camera
  move: whip pans (0.73-0.97 s, 1.43-1.53 s), dives through the skin surface into a cross-section (7.6-8.0 s),
  pull-outs back to the sky world (17.3-18.0 s), push-ins (24.4-25.7 s). Motion blur on the whip frames.
- **The camera never stops.** Every shot has a slow drift/push (frame diff 14-25 on "static" shots).
- **Glow is beat-synced.** In "six needle like tools" (2.3-3.9 s) the yellow glow jumps to the next blade every
  0.30 s (9 frames), on the syllables. One glowing part at a time. Glow also marks the named thing: blades
  (5.0 s "against your skin"), vessel wall (14.2-14.5 s "your blood vessels"), clot column (16.4-16.8 s "burst"),
  hollow blade (18.2 s "hollow blade").
- **A new shot every 1.0-2.5 s**, roughly one per caption phrase; long ideas (blood vessel burst, saliva in cut)
  get 2-4 s of continuous move.
- **It loops.** The last shot (26.8-27.6 s) is the same framing as the first: fly front-on standing on the skin
  in the cyan world.

## 2. Shot catalogue (what each shot type looks like)
| t (s) | shot | key look |
|---|---|---|
| 0-0.8 | fly lands, front, low | cyan sky, glow behind fly, peach skin ground, fly sharp, slight DOF |
| 0.8-1.5 | over the man's shoulder | bumpy skin dome fg, small fly, light-blue tee, photoreal bearded profile |
| 1.5-1.9 | wide low along skin | small fly centred, skin falls off in DOF |
| 1.9-4.0 | macro under the fly | glossy black crumpled-chitin legs, long amber blades to the skin, one glows yellow |
| 3.8-4.3 | head-on face close-up | huge red-brown pebbled eyes, olive antennae, orange labrum, black bristles |
| 4.3-7.5 | skin level, blades press in | blades split into 6, serrated, skin dents, a red slit opens |
| 7.6-17.3 | **inside the skin** (cross-section) | pink cellular tissue, dark-red dermis band, red vessel; blades saw, vessel tears, glossy blood column glows |
| 17.3-20.0 | back out under the fly | hollow blade (yellow-cream tube) drips a clear glass-like drop of saliva |
| 20.0-24.4 | extreme macro on skin surface | velvety skin with fine fuzz, a red-rimmed cut, clear gel fills it, blood beads up |
| 24.4-26.6 | under the fly again, into cross-section | spongy tip presses on the blood bead, blood climbs the tube (cutaway) |
| 26.8-27.6 | loop shot | fly standing on skin, front 3/4, cyan sky |

## 3. Measured colours (sRGB, 1440x2560 frame)
| region | reference | our v2 preview | gap |
|---|---|---|---|
| sky, corners | (42,165,208) flat | (29,164,225) | ours too blue/bright: lower B by ~17, raise R |
| sky glow behind subject | mean (76,169,207), max ~(103,179,213) | brighter, whiter | glow is subtle: +35 R max, never near-white |
| skin ground, exterior | (233,147,99) | (253,188,126) | **ours overexposed and too yellow**: ~-20 R, -40 G, -27 B |
| skin under blades | (208,129,92) | (255,201,130) | same problem, worse |
| skin macro surface | (206,139,105) | n/a | velvety, low contrast |
| man's foreground skin | (200,142,111) | pinker, regular waves | |
| tissue cross-section | mean (238,179,136), pink cells | n/a | |
| dermis band | (181,93,81) | n/a | |
| blood / vessel | (188,98,61) mid, deep (134,39,42) | n/a | glossy, sharp pink-white speculars |
| glowing clot | (207,90,50) to (251,174,101) | n/a | orange-yellow emission |
| blades | saturated yellow-amber with bright sheen bands | paler peach | deeper amber, more contrast |

## 4. Material notes (from full-res crops)
- **Fly eyes:** red-brown, fine pebbled facets (bumps, not hex lines), strong sparkly specular; dark seam between eyes.
- **Head/thorax chitin:** glossy black-grey, wrinkled/pebbled bump, crisp rim highlights; sparse long black bristles.
- **Antennae:** olive-yellow, sitting in a groove on the face.
- **Blades:** saturated amber-yellow, smooth, glossy with long sheen bands, slightly translucent, sparse tiny cone
  spines along the shaft, fine serration at the cutting edge only.
- **Blood:** deep red, very glossy, *stylised* sharp pink-white specular blobs (almost toon), subsurface glow.
- **Tissue:** pink with soft cellular noise (Voronoi blobs), no realism; dermis band darker red.
- **Skin macro:** soft, velvety (fine vellus fuzz), almost no specular.
- **Saliva:** clear, glassy, refractive with bright rim highlights.
- Overall: *stylised medical-CG*, clean and saturated, not gritty-photoreal.

## 5. Captions
2-3 words, lowercase except the sentence start, white, bold rounded wide sans, thin dark outline + soft shadow,
fixed band at ~77 % height (glyph top y ~1960 at 1440x2560), phrase swaps on the word, no word pop.
