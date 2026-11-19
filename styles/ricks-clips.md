# Ricks Clips (@RicksClips3000): measured style (20 most-viewed Shorts, measured 2026-11-05)

Sources: `ref/RicksClips3000/` (top 20 of the channel's 60 newest Shorts, 3.7M–31M views) → `scripts/measure.py` (numbers.json) + every contact sheet read at 30 fps + English auto-subtitles (16 of 18 narrated videos).
**Excluded:** `29uKrdHEg6U` and `ODJsROQqsFQ` are still webcomic panels over Minecraft parkour footage, with no narration and no 3D. That is a different (reposted) format, so all numbers below are the **18 narrated videos**.
Measured from the channel's 20 most-viewed Shorts. (An earlier version measured from 1 video said the world has ink outlines and the shadows are wine-purple; the 20-video measurement showed both were wrong. Always measure many videos, not one.)

**How to check a render against this file:** put your own render in a folder and run `python scripts/measure.py <folder>`. Each "Measure" target below is that script's output, or a count on its 30 fps sheets.

## Format
| Rule | Target (measured) |
|---|---|
| Frame | 9:16, 720×1280 source, 30 fps |
| Length | median 58 s (39–65 s) |
| Narrated by one voice, no dialogue between characters | yes (18 of 18) |

## Pacing + transitions
| Rule | Target (measured) |
|---|---|
| Picture changes (any transition, measure.py `cuts_per_min`) | median 15.7 / min (10.2–27.7) |
| Average setup length (`avg_shot_s`) | median 3.6 s (2.1–5.2) |
| Hard cut inside the first 8 s | **no** (only 3 of 18 have one) |
| Transition types | cross-dissolve 4–10 frames (usually 5–6); whip pan/push 5–10 frames with motion blur; match-dissolve (same framing, new time/place). Plain hard cuts are the rarest. |
| Long opening take | the first 4–7 s are one continuous camera move in most videos |
| Something moves on frame 0 | yes |

## Camera
| Rule | Target (measured on 30 fps sheets) |
|---|---|
| Camera ever fully still | no; between moves it drifts about 2–5 % scale per second |
| Glide moves (push, pull, truck, crane) | 13–75 frames, eased in/out, often followed by a 1–2 s hold |
| Snap moves (whip, snap push) | 5–10 frames, motion blur, ease-out |
| Motion between frames (`camera_motion`) | median 0.082 (0.048–0.103) |
| Lens | wide in about 15 of 18 (strong vanishing lines, roughly a 24–35 mm feel); a flat side-on (tele-like) view for cross-sections |
| Height | mostly low to eye level; overhead for maps, cross-sections and "falling" shots |
| Special frames | fisheye or porthole circle (2 of 18), split screen (1 of 18), speed lines on fast moves (3 of 18) |

## Light + colour
| Rule | Target (measured, numbers.json) |
|---|---|
| Shadow colour | median RGB (38, 32, 52) ≈ `#262034`; hue 230–265° (blue-violet) in 11 of 18, 290–360° (plum/wine) in 6, warm brown in 1 |
| Highlight colour | median RGB (240, 233, 227) ≈ `#F0E9E3`, warm cream, hue ≈ 36° |
| Saturation | median 0.44 (0.28–0.59) |
| Pure black (`pure_black_pct`) | median 0.07 %; ≤ 0.2 % in 14 of 18. Only allowed in a spotlight vignette or a fisheye surround. |
| Cast shadows tinted, never black | yes: blue `#4A55A8`–lavender `#8A86C0` by day, navy `#1A2A70` at night |
| Lighting moods per video | 2–3 (e.g. day → sunset `#F7B26A` → night `#2A3A9A` with warm lamps `#E8A050`) |
| Warm practicals against cool shadows, slight bloom on lights | yes |

## Ink (outlines)
| Rule | Target (measured) |
|---|---|
| Lines on characters | yes, near-black / dark brown, about 1–1.5 % of frame width |
| Lines on hero props (coffin, cannon, jar, counter, booth) | yes, dark brown, about 0.5–0.8 % of frame width |
| Lines on big world surfaces (walls, ground, buildings, sky) | **no** in 16 of 18 (only `0m6G8pDtzNs` outlines the whole world) |
| Ink colour pure black | no; dark brown-black (≈ `#3A2418` on props) |

## Characters
| Rule | Target (measured) |
|---|---|
| 2D drawn cut-outs standing in a 3D world, lit by the scene and casting 3D shadows | yes |
| Head height ÷ body height | about 0.30 (helpers measured 0.20–0.35; check this against a still in step 3) |
| Head | a circle as wide as the torso or wider, no neck, skin white `#F2EEE8`–`#F4F0EC` |
| Torso | bean or capsule shape in one costume colour |
| Limbs | single black lines, 5–8 % of head width |
| Hands / feet | small dots or balls, no fingers |
| Face | dot eyes with lid/brow lines, no nose; ringed "O O" eyes when shocked; gridded teeth for fear; sweat drops |
| Hat or distinct hair on almost every character | yes (court hats, bowlers, cowboy hats, bandanas, bowl cuts) |
| Facial expressions | swapped drawings that pop in 1 frame and hold 3–20 frames |
| Body motion | smooth (on 1s), idle sway and head tilt; walk cycles on 1s or 2s |

## Depth
| Rule | Target (measured) |
|---|---|
| Background blur in close-ups | strong |
| Background blur in wide shots | slight |
| Distance haze / aerial perspective | yes (light) |

## Captions
| Rule | Target (measured) |
|---|---|
| Words at a time | 1–2 (3 at most) |
| Time each chunk stays up | 6–15 frames |
| Font | heavy rounded sans, weight 900 |
| Fill / outline / shadow | white / thin black outline about 1 % of frame width / soft drop shadow |
| Highlighted word colour | no |
| Vertical position | centre at 70 % from the top |
| Size | cap height about 3 % of frame height; about 4–5 % of frame width per character ("blacksmith" ≈ 39 %) |
| First caption on screen | ≤ 0.07 s |

## Voice + script (16 narrated videos with subtitles)
| Rule | Target (measured) |
|---|---|
| Words per second | mean 3.71 (3.35–4.09) |
| Words per video | mean 205 (143–255); a 60 s Short is 225–255 words |
| Voice starts | 0.1 s, no intro, no title card |
| First line | a strange act in the past tense ("He poured cooking oil into the sea…", "They buried a man alive…") in 8 of 16; a flat paradox ("Gambling is illegal in Japan. However…", "never shoot first") in 4; "If you…" in 3; "Check out these two…" in 1 |
| "You see," pivot | in 11 of 16. Two positions: right after the hook at 3–7 s (4 videos), or at 66–81 % of the video (median 73 %) to reveal the real reason (7 videos) |
| Tense | the hook may be past tense, then the scene is told in the present ("The whole betting room is laughing at him"): present-tense verbs outnumber past in 8 of 16, with 1 tie |
| Last line | a payoff twist in the final sentence; the picture loops or bookends the opening frame in 6 of 18 |
| Graphics | built into the world (signs, counters, maps, blueprints with stamps, labels like "HOT SHOT"), never flat on-screen overlays |

## Engine starting points (tune in step 3, "Turn this into a skill")
| Setting | Start at | Why |
|---|---|---|
| `ink` | 0.3, and draw outlines on props by hand | Stage.tsx outlines every world edge at the same strength; this channel outlines props only. Doing it properly needs props-only ink (a per-object layer). |
| `hemi.ground` / `cool` | blue-violet ≈ `#3A3A78` / `#4A55A8` | shadows at hue 230–265° |
| `sun.color` / `warm` | cream ≈ `#FFF0D8` / `#FFB347` | highlights ≈ (240, 233, 227) |
| `saturation` | lower it until measure.py reads 0.40–0.48 | measured 0.44 (the old file's 0.50 was too high) |
| `aperture` | 0.5–0.6 for close-ups, 0.2–0.3 for wides | strong blur close, slight blur wide |
| Captions | `y = 0.70` (Captions.tsx defaults to 0.75), size 86, weight 900 | weight, outline, shadow and size already match; only the position is off |
| Voice | `am_michael`, speed about 1.15–1.2, then check timing.json for 3.6–3.8 words/s | the skill's 3.2 words/s is too slow for this channel |
| Shots | a new camera setup every 2–4 s, a 5-frame dissolve or 6-frame whip between them, no hard cut before 8 s | |

**Tested settings:** the starting points above were tuned against a channel frame on 2026-11-05 in a fresh install. When you turn this file into a skill (step 3), Claude writes the final values into a style file in `src/styles/` and checks them against a channel still.
