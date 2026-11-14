# zack3d — 5 s photoreal 3D test (horsefly), Blender + free CC models

Goal: rebuild the first 5 s of the reference short (frames in `ref/ref_<t>.png`, 1440x2560) at 80–90 % visual
match. Read `.claude/skills/zack-style-3d-short/SKILL.md` for the pipeline and its bug list.

## Setup (each session)
```bash
mkdir -p ~/zack/bin && cd ~/zack/bin
curl -s -o b.tar.xz https://download.blender.org/release/Blender4.5/blender-4.5.15-linux-x64.tar.xz && tar xf b.tar.xz && rm b.tar.xz
B=~/zack/bin/blender-4.5.15-linux-x64/blender
```
Run scripts with `$B -b --python <script.py> -- <args>`. Cycles CPU; ~10–60 s per 720x1280 test frame.

## Files
- `scripts/scene.py` — shared look: `reset()`, `sky()` (cyan, glow behind subject), `lights()`, `skin()` (bent skin
  ground + hairs), `load_fly()` (Domestic Fly CC-BY with reference-matched shading + procedural head with faceted
  eyes), `fly_fur()` (call after placing the fly), `camera()`, `render()`.
- `scripts/t_shot1.py` — opening shot test; `scripts/t_head.py` — head close-up test.
- `assets/domestic.glb` — "Domestic Fly" by aramabdulrahim (Sketchfab), CC BY 4.0.
- `assets/bearded.glb` — "Bearded Man" by KaitlynAndrus (Sketchfab), CC BY 4.0.

## Shot list (30 fps, frame 1 = 0.0 s)
| frames | s | shot |
|---|---|---|
| 1–24 | 0–0.8 | fly descends nose-down and lands on skin (front, cyan glow) |
| 25–45 | 0.8–1.5 | over the man's bare shoulder: big bumpy skin foreground, fly small on it, blue T-shirt, his bearded profile top right |
| 46–56 | 1.5–1.87 | wide low shot along the skin, small fly centred |
| 57–114 | 1.9–3.8 | macro under the fly: huge glossy black legs, long amber serrated blades reaching the skin; one glows yellow at a time |
| 115–129 | 3.8–4.3 | head-on close-up of the face, orange mouthparts in the skin |
| 130–150 | 4.3–5.0 | down at skin level, blades pressing in |

## Rules
- Compare every test render side by side with the matching `ref/ref_<t>.png` at full size and in crops; fix the
  biggest gaps; repeat until it is close. Never call a shot done from a thumbnail.
- Only CC0 / CC-BY assets. No NC/ND. Credit CC-BY authors.
- Commit and push your work to this branch often (scripts + small PNG comparisons, no renders > 20 MB).
