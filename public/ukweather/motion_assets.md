# UK weather: Remotion motion assets

18 components in `src/ukweather/motion/` (entry `src/ukweather/motion/index.ts`), each rendered and checked here. All 60 fps on a transparent background. Fonts: Anton and Baloo 2 (Google Fonts, OFL) from `public/ukweather/fonts/`. The chibi tourist and his umbrella (four states: closed, opening, open, inside out) are drawn in code in `Tourist.tsx`; Hindi titles type in by grapheme so matras stay on their letters. Nothing is copied from the reference.

Each component copies a move measured frame by frame in the reference (see `reference_analysis.md`, "Motion detail at 30 fps"). Nothing holds still, After Effects style: every element has an idle float (mixed sines, so it never visibly loops) once it lands, fast moves get motion blur from their speed, landings overshoot and settle, and textures keep living (hatch scrolling, glows pulsing, light sweeps, hand-drawn boil on the ellipse). `u99-reel` plays all 18 in a row; a half-resolution preview is `exports/ukweather_motion_preview.mp4`.

**Render one** (4K detail, transparent WebM):
```
npx remotion render src/ukweather/motion/index.ts <id> out/ukweather/<file>.webm --codec=vp9 --pixel-format=yuva420p --scale=2
```

| id | component | size | frames | line | what it does |
|---|---|---|---|---|---|
| `u01-tourist-pop` | U01TouristPop | 800×1000 | 120 | 2 "सोचो, तुम Mumbai की गर्मी से London गए" | Our chibi Indian tourist pops onto the map from a dot (overshoot, squash on landing), sweating from Mumbai; at `open` the furled umbrella swings up and snaps open in 4 frames; slow bob. |
| `u02-weather-montage` | U02WeatherMontage | 1080×1920 | 300 | 2 "सुबह तेज़ बारिश, … कोहरा, … धूप, … ओले" | One full-screen weather per word (`rain`, `fog`, `sun`, `hail` frames): rain streaks + cool grade, drifting fog, a sun bloom + golden grade (sunglasses on, umbrella down), bouncing hail with splash rings; the tourist reacts to each. |
| `u03-wind-blow` | U03WindBlow | 1080×1920 | 90 | 2 "और हवा तो free में मिलती है" | Diagonal wind streaks; he leans 15° in, hair blown back, the umbrella turns inside out at `flip`, is ripped away at `rip`, and he is blown out of frame with leaves flying. |
| `u04-neon-slam` | U04NeonSlam | 1080×1080 | 140 | 1 "…कोई हिसाब ही नहीं" | A word slams in huge from the right (rotated −5°, cropped), shrinks to a title in 20 frames with a red neon glow pulse, hovers, flies off left at `out`. |
| `u05-lightning` | U05Lightning | 1080×1920 | 30 | 1 | A forked white-blue bolt strikes (3 bright frames, flicker, fade) with a full-screen flash; lands at (`x`,`y`). |
| `u06-fill-develop` | U06FillDevelop | 1080×1080 | 60 | 3 the UK and Ireland, 5 Colombia | A country flashes cream, then develops through tan into its colour in 20 frames with a scale pop and settle, ending multiply so the terrain shows. `d` outline, `color`. |
| `u07-calendar` | U07Calendar | 1080×700 | 150 | 3 "साल के 250 से ज़्यादा दिन बारिश" | A tear-off pad flies in, a page flips every 3 frames (pad wobbling ±8°), lands on a red "250", slides left, and the yellow label types in. Uses the `pad` / `page` images when given. |
| `u08-ellipse-title` | U08EllipseTitle | 1080×1080 | 150 | 3 "…यही दुनिया की सबसे गीली जगह होगी" / 4 "पर नहीं।" | A hand-drawn white ellipse draws round the islands, a red-neon title types in, a curved arrow draws to the ellipse; at `strike` two red strike-throughs cross it out. |
| `u09-tilt-world` | U09TiltWorld | 1080×1920 | 240 | 5 "दुनिया के 70 से ज़्यादा देशों में…" | The world map (as `children`) tilts back into a sheet in space with a white edge, dozens of country tags pop on in a wave; un-tilts at `back`. `tags` = [x, y, label]. |
| `u10-giant-word` | U10GiantWord | 1080×1920 | 120 | 5 "वजह है गर्म मौसम" | A giant cropped word wipes in from the left and settles over the country with a pink-red band and isobar curves; fades at `out`. |
| `u11-glow-label` | U11GlowLabel | 800×400 | 90 | 5 "बाजू में Pacific Ocean" | A glowing cyan two-line ocean label pops and types in, with a wave shimmer under it. |
| `u12-ribbon-grow` | U12RibbonGrow | 1080×1080 | 60 | 5 "और ऊँचे पहाड़" | Three darker red-brown ribbons (the Andes cordilleras) grow up the country from the south, staggered. `paths`, `w`. |
| `u13-hatch-halo` | U13HatchHalo | 1080×1080 | 120 | 7 "क्योंकि ये मौसम की जंग का मैदान है" | Fat blue stripes sweep the frame, condense into a hatched rounded halo with a bright rim that contracts onto the islands, and the title types in on it. |
| `u14-dash-arrow` | U14DashArrow | 1080×1920 | 60 | 7–9 the four winds, the Gulf Stream | Thick dashed semi-transparent arrows with big triangle heads grow along cubic curves (ease-out), dashes scrolling to the head; `fork` splits the tip in two. `arrows` = [{ p, color, at, len, w, fork }]. |
| `u15-fly-at-camera` | U15FlyAtCamera | 1080×1080 | 110 | 8 "…असली sponsor, Gulf Stream" | The name types in, holds, then at `fly` scales ×14 at the camera as the transition. |
| `u16-wind-curls` | U16WindCurls | 1080×1920 | 180 | 8 "नमी भरकर सीधे Britain पर बरसा देती है" | A field of blue moisture rings on the sea and white crescent wind strokes with a curl drifting left → right in layers, fading in and out. |
| `u17-air-tag` | U17AirTag | 600×300 | 90 | 9 "उत्तर से … दक्षिण से … पूरब से…" | A rounded air-mass tag with a white rim slides in from `from` with an overshoot, tilted, then bobs. `lines`, `color`. |
| `u18-send-umbrella` | U18SendUmbrella | 600×700 | 120 | 12 "ये video उस दोस्त को भेजो…" | A send button pops and pulses, an umbrella drops onto it, then a paper plane carries the umbrella off on a dashed trail at `launch`. |

**Render all:**
```
for c in u01-tourist-pop u02-weather-montage u03-wind-blow u04-neon-slam u05-lightning u06-fill-develop u07-calendar u08-ellipse-title u09-tilt-world u10-giant-word u11-glow-label u12-ribbon-grow u13-hatch-halo u14-dash-arrow u15-fly-at-camera u16-wind-curls u17-air-tag u18-send-umbrella; do
  npx remotion render src/ukweather/motion/index.ts $c out/ukweather/${c//-/_}.webm --codec=vp9 --pixel-format=yuva420p --scale=2
done
```

The code zip is `exports/ukweather_remotion_code.zip` (the motion folder plus the fonts).
