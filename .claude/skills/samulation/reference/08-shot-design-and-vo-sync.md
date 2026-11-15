# 08 · Shot design keyed to the voice-over

## 1. From words to shots
1. Load the final `words.json` and make a key-word table:
   `WF = {'fire': round(0.26*fps), 'gap': round(1.62*fps), …}`.
2. **Shot boundaries:** cut or start a dissolve **1-2 f before the first word of a sentence** (sentence starts are where the
   references change staging). A mid-sentence change ends on the noun it shows.
3. **Shot length:** median ~1.2-3.2 s, max ~8 s. Never 30 f without a visible change (1.5-2 visual beats/s).
4. **Action contacts** (impact, strike, glance, colour fill) **on the word, up to 5 f early, never late.**
   - Anticipation (wind-up) starts ~6 f before.
   - FX bursts +0..+5 f, lasting 6-12 f.
   - Expressions swap through a blink (~3 f) and are held ≥15 f.
5. Render each shot with a **4-frame tail** past its end, then cross-dissolve 4-10 f in assembly with both cameras still moving.

## 2. Camera grammar
- **Holds push in** 0.25-0.5 %/f. Glides of 20-40 f, eased in/out (never snap: the tutorial's 3-frame snap vs 23-frame
  glide). Arrive already moving and ease off in the last ~12 f of a sentence.
- **Speed shots** (rail glide, chase): position by a **monotone cubic (PCHIP)** through key frames, so objects pass at
  exact word frames. Example: a camera at rail height passes a joint at `joint − 3 m` on the frames of three successive
  words.
- **Shake by event only:** decaying offset `amp·e^(−k(f−hit))` (amp ~1 cm, k 0.35) on impacts. Stillness for crashes.
- **Rack focus** to make the viewer look: animate `focus_distance` from the character to the prop over ~8 f right after the word.
- **DOF:** f/2-4 near the action, f/5.6 for wide physics shots. Don't blur the mechanism.

## 3. Worked shot list (video #4 preview, VO at ×1.10, 30 fps)
| shot | frames | words → events |
|---|---|---|
| hook | 0-53 | maul strikes on "fire" (f8) and "gap" (f49); 0.4 cm spike sink per hit; sparks; slow push-in + impact shake |
| glide | 53-121 | low camera along the rail; joints pass on "39" (f64), "feet" (f82), "railroad" (f95); chalk "39 FT" marks |
| town | 121-152 | townsfolk glare (angry); the mayor jabs a finger on "did" (f135) with overshoot |
| smug | 152-201 | hero leans on the maul; glance + rack focus to the joint gap on "why" (f180) |
| kink | 201-276 | flash-forward: gapless hot rails kick into an S at f203-208; loco charges; headlight blooms on "train" (f247) |
| aerial | 276-386 | drone over the town (depot, GRAND OPENING banner, bunting, false fronts), arriving at the new loco on "first train" |

## 4. Lint before rendering
- Every key verb/noun has an event.
- No shot shows a character inside geometry (check one still per shot at low resolution).
- Each shot's first and last frames are checked (dissolve partners).
