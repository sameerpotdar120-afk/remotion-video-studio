# Hundred Years' War: Remotion motion pieces

Every character, prop and effect from the reference is built in Remotion, all tested: 22 pieces plus a test card. The code is in `src/hundredyears/motion/`, which has its own entry point (`index.ts`, `Root.tsx`).

- **Format:** 60 fps, transparent backgrounds.
- **Style:** the reference's plush chibi look, with big heads, bell bodies, dot eyes and thin black stick arms drawn on top.
- **Flags:** period heraldry only. St George's cross for England, gold fleur-de-lis on blue for France, Burgundy's red saltire. No Union Jack, no tricolour.
- **Fonts:** Anton and Baloo 2 (Google Fonts, OFL), in `public/hundredyears/fonts/`.

The main edit uses these components directly, timed to the VO. The render commands at the bottom are only for previews or for handing a piece to another editor.

## Shared parts

| File | What it is |
|---|---|
| `Plush.tsx` | The plush chibi rig, with nine characters: the English knight (great helm, St George surcoat and shield), the French knight (bascinet with a visor that opens and closes, fleur-de-lis surcoat), Edward III (crown, beard, ermine and red robe), the French king Philip VI, Charles VII (crown that can drop in), Joan as a peasant (brown dress, coif), armoured Joan (plate, red cape, fleur-de-lis skirt, helmet), the hooded judge, and an English longbowman. Each pose is a set of numbers that blend smoothly: stick arms, mouth (smile, flat, frown, oh, grin, worried), talking, eyes, brows, tilt, lean, squash, hop, sweat, visor. Props: sword, shield, a waving banner, a bow that draws, a scroll. Also a caparisoned warhorse with galloping legs. |
| `Heraldry.tsx` | The fleur-de-lis, the three banners, heater shields, and the waving banner pins used on the map. |
| `theme.ts`, `font.ts` | Colours (England #D0111B and France #1F2BD0, matching the map fills), easing helpers and the font loader. |

## The pieces, in script order

| Composition | Line | What moves | Size, frames |
|---|---|---|---|
| `h01-duel` | 1–2 | The English and French knights duel on the Channel coast. They swing alternately at 4 Hz, lunge on every fourth swing, bob, and throw clash sparks. At `swoop`, armoured Joan flies in from the bottom-left on her banner with a glow and knocks both knights flying. | 1080×1080, 300 |
| `h02-counter` | 1 | A yellow counter rolls 13 → 116 with an ease-out and lands with a punch, then rushes at the camera (scales up, blurs, flies off the top). | 900×500, 200 |
| `h03-slam` | 3 | "1337" slams in from the top-left, oversized, tilted and motion-blurred, settles with an overshoot, then punches once more. | 1080×700, 150 |
| `h04-edward` | 3 | Edward III pops in, rubs his chin with a sly look, then his stick arms flail as he schemes and talks. A thought bubble shows his mother Isabella in a fleur-de-lis crown. | 900×1100, 240 |
| `h05-philip-no` | 4 | The French king crosses his arms in an X, shakes his head three times and frowns. | 900×1100, 120 |
| `h06-brawl` | 4 | A cartoon brawl cloud: dust puffs boil while the St George and fleur-de-lis banners dart about inside, jumping every 3 frames with speed lines. | 900×900, 150 |
| `h07-cavalry` | 5 | French knights on caparisoned horses bob forward with galloping legs. At `rain`, arrows fall from the upper right and the riders topple one after another into a heap of arrows. Laid over `h02_battlefield_bg`. | 1080×1920, 270 |
| `h08-longbow` | 5 | A row of English longbowmen draws, holds and looses volleys, staggered so the line ripples. Over the battlefield. | 1080×1920, 240 |
| `h09-game` | 6 | Our own strategy-game screen (no real game's art). A carved-wood top bar with counting-down resources; a FRANCE panel whose stability, army and morale bars slide into the red; English army tokens bobbing over the map. Then the clean chat: England "North की तरफ़ बढ़ रहा हूँ ⚔️", France "Truce करें? 🙏", England "Nope 🙂". France types "GG 😞" and the cursor clicks SEND. | 1080×1920, 480 |
| `h10-joan-card` | 7 | A light flare blooms and peasant Joan pops in inside a ring of light. The parchment "Joan of Arc" tag flips in, then RPG stat icons pop: crown 0 (no noble blood), swords 0 (no army), and a fist whose bar fills green (belief). | 900×1200, 420 |
| `h11-voices` | 7 | Rays of light come down from above. Joan's arms rise and wave and she talks, eyes up. Over `h01_village_bg`. | 1080×1400, 210 |
| `h12-armor-up` | 8 | The armour drops onto peasant Joan with a squash and she becomes armoured Joan. The warhorse slides in under her with a bounce, and the banner unfurls. Over the village. | 1080×1500, 240 |
| `h13-shockwave` | 8 | A white and cyan ring of light expands from Joan with an echo ring (the army rallying). | 1080×1080, 120 |
| `h14-plus-one` | 9 | A glowing green "+1" with a laurel pops, floats up and fades (Orléans, then each victory). | 500×400, 90 |
| `h15-arrow-hit` | 9 | Joan trots on her horse, banner up. An arrow streaks in and sticks in her shoulder: a flash, a wobble and a wince, then she rides on. | 1080×1300, 240 |
| `h16-coronation` | 9 | Charles VII, bare-headed and nervous. The crown drops onto his head with a squash, sparkles burst and he beams (Reims). | 900×1200, 180 |
| `h17-grab` | 11 | A white glove on a long curving arm shoots out from Burgundy, grabs the little Joan figure and pulls her to Rouen, while a coin bag flies the other way to England (sold). The points are props. | 1080×1920, 180 |
| `h18-trial` | 11 | The hooded judge reads his scroll sternly. A parchment slides up and a red tick stamps beside each charge: men's clothes (tunic icon) and misleading the people (crowd icon). Over `h03_town_square_bg`. | 1080×1500, 300 |
| `h19-stake` | 11 | Armoured Joan tied with ropes, brave and worried, breathing, a sweat drop. It sits in front of the creator's `h04_stake_pyre`. No fire on her. | 900×1400, 240 |
| `h20-burn` | 12 | The reference's signature move: the picture burns away like paper. Noise holes spread with glowing orange rims and charred bands, embers drift up, and the map shows through underneath. It wraps any layer as `children`. | 1080×1920, 150 |
| `h21-banners` | 12 | Banner pins pop over the map. France's fleur-de-lis multiply while England's St George banners slide out to the edges and vanish, all but one (Calais). | 1080×1920, 300 |
| `h22-saint` | 12–13 | A translucent, glowing Joan rises with soft light rays, and a golden halo fades in and pulses (made a saint). | 900×1300, 240 |

Test card (not in the edit): `h00-lineup`, every character, the horse and the banners.

## On the map (built in the main edit, as in our previous videos)

- **Two bases:** our EOX satellite map, plus a parchment relief map for the 1337 section, with a hard cut and a snap zoom between them.
- **Fills:** England and Wales flat red, France royal blue, Burgundy in a third colour. English-held France fills red with a soft, blobby flowing edge, then blue spreads back. Where Joan stands, the border melts red → white → blue under a glow.
- **Labels:** calligraphic place labels with draw-on curved arrows: Domrémy, Orléans (1429), Reims (1429), Compiègne, Rouen (1431).
- **Camera:** the restless camera (a constant push, drift, snap zooms and pull-outs).
- **Transitions:** the iris from the map into the village, whips, the dissolve into a glowing close-up, and the title "Hundred Years' War 1337–1453".

## Render commands (previews only)

```bash
# one piece, 4K 60 fps, transparent (VP9 with alpha)
npx remotion render src/hundredyears/motion/index.ts h01-duel out/h01_duel.webm --scale=2 --codec=vp9 --pixel-format=yuva420p --image-format=png

# with props, e.g. the duel with Joan's swoop at frame 200
npx remotion render src/hundredyears/motion/index.ts h01-duel out/h01_duel.webm --scale=2 --codec=vp9 --pixel-format=yuva420p --image-format=png --props='{"swoop":200}'
```
