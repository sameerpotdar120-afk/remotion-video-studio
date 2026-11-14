# 07: Shot list on the words, shot recipes, the worked example

## 1. From words to shots
1. Print every word with its start: `python3 -c "import json;[print(w['w'],w['s']) for w in json.load(open('data/words.json'))]"`.
2. One shot per sentence (or two for a long one). Shot start = 2-4 frames (≈0.1 s) before the sentence's first word.
3. For each shot write: `id, at, location, camera from→to (+fov), who's in frame, mood/pose changes with the word time, prop events`.
4. Inside a shot use **local time** `t` (seconds since the shot started) and `seg(t, a, b)` windows anchored on word times minus `at`.
5. A key motion (stamp, glow, reveal, reaction) starts **on the stressed word**, lasts 0.3-0.6 s, eased.

## 2. Shot code pattern (`main.js` → `build()`)
```js
SHOTS.push({ id: 'front', at: 10.5, draw(t, d) {
  const k = clamp(t / 3.25), w = t * 4.2;                                   // progress + walk phase
  aim(lerp3([1.4, 1.55, 9.2], [1.0, 1.55, 7.8], ease(k)), lerp3([-0.3, 2.5, -3], [-0.2, 2.35, -3], k), 46);   // camera from→to, look, fov
  Fr.cop.at(lerp(-2.3, 2.0, k), 0, 0.9).set({ mood: 'smug', turn: 0.8, walk: w, armL: [-25 + Math.sin(w) * 30, 120], armR: [25 - Math.sin(w) * 30, 120] }).face(cam);
  Fr.hero.at(1.55, 0, -1.1).set({ mood: k > 0.45 ? 'shock' : 'neutral', turn: -0.7, lookAt: [-1, 0] }).face(cam);
  E.render(Fr.scene, cam, { bloom: 0.36, bloomThreshold: 0.82, focus: 7.5, aperture: 0.00018, maxblur: 0.004, vignette: 0.42, grain: 0.012, sat: 1.18, t });
} });
```

## 3. Recipes that worked
| recipe | how |
|---|---|
| **Walk-through establishing** | hero crosses the foreground (`walk`, smug, `turn` 0.75) while extras wait at a lit focal point deep in frame; slow push, fov ~54 |
| **Crane-up reveal** | street level (fov 50) easing up to ~60 m looking down the grid (fov 46): "on almost every street" |
| **Aisle dolly** | eye height down a symmetric aisle (fov 62); seated extras in profile; one character walks toward camera with a prop; screens flicker (emissive sine), lamps blink |
| **Pass-by** | official walks across in front of a lit doorway while the hero reacts (shock) at the side |
| **Product stage** | object on a pedestal in a dark studio under a spot; slow push; reveal states on words (foil → material → x-ray glow) |
| **Document slam** | parchment on a desk under a lamp, top-down push; stamp lands on the year/number word |
| **Discovery** | hero walks in, stops on "there it is", shock → happy 1 s later, points at the prop |
| **Payoff close-up** | hero big in frame (smug), the proof prop beside him, the other character reacts |
| **Loop return** | last shot reuses shot 1's set and ends on shot 1's opening camera position |

## 4. Worked example: our recreation of the reference (`engine/src/main.js`, 13.75 s)
| shot | at | set | camera | action |
|---|---|---|---|---|
| alley | 0.0 | alley.js | (0.25,1.5,3.6)→(0.15,1.45,2.9), fov 54, look at the hatch | hero walks across, smug; two extras at the lit window |
| city | 2.1 | city.js | street level (1.2,1.7,9) → crane to (3,62,6) looking down the grid | neon street → aerial city |
| hall | 4.7 | hall.js | (0,1.62,4.2)→(0,1.5,-4.6), fov 62 | seated players react; carrier walks toward camera with a box tower; screens flicker, lamps blink |
| front | 10.5 | front.js | (1.4,1.55,9.2)→(1.0,1.55,7.8), fov 46 | police strolls past the glowing doors; hero shocked at the side |
To reproduce it: copy `examples/reference-japan-gambling-loophole/analysis/words.json` (keep words < 13.5 s) to `data/words.json`, put
the reference audio (private!) cut to 13.75 s as `data/mix.wav`, render. Result: `examples/.../our-recreation/Preview-13s.mp4`.
