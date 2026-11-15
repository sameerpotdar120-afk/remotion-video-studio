# 11 · Render economics and helper sessions

## 1. Estimate before promising
1. Render **3-4 consecutive frames at the real settings** in one process. Read the per-frame time, not the first frame
   (which includes shader compile). Print the actual resolution % and spp in the log to prove which settings ran.
2. Cost = frames × s/frame / machines + setup per machine (Blender download and libraries ~3-5 min; first compile ~1-2 min).
3. Quote in IST, with the dependency stated ("~7 PM IST if the per-frame time holds").

| engine / setting | s/frame (4 cores) | 1 min video at 30 fps (1,800 f) on 6 machines |
|---|---|---|
| three.js 1080→4K (scale 2) | 4-8 | ~0.5 h |
| Blender 1440x2560, 16 spp → 4K | ~110-120 | ~10 h |
| Blender 1080x1920, 16 spp → 4K | ~60-70 | ~5.5 h |
| Blender native 4K, 48 spp | ~590 | ~49 h (not viable) |

**Ways to cut cost:**
- render smaller and upscale (Lanczos + light unsharp);
- fewer samples;
- reuse still backgrounds for shots where the camera barely moves;
- per-shot culling (hide the gravel in aerials, the town in rail macros);
- shorter shots.

## 2. Splitting across helper sessions
- Each helper is a fresh cloud session on the same environment, cloned at the working branch. Its job:
  ```bash
  bash <skill>/tools/blender_render_part.sh <name> claude/<video>-<name> "<shot> <from> <to>" ["<shot> <from> <to>" …]
  ```
  This installs Blender and Mesa, renders the PNGs, upscales them to `out/train/<name>.mp4` (30 fps, crf 16), splits files
  over 90 MB (GitHub rejects >100 MB), and pushes to its own branch.
- **Balancing:** give each machine about the same frame count, including the 4-frame dissolve tails. Mix short shots onto one helper.
- **Monitoring:**
  - watch helpers with `list_sessions` / `list_events`, or wait for their pushes;
  - containers restart when idle, so keep a background watcher running and design jobs to **resume** (anim.py skips existing frames);
  - if a helper dies, re-split its remaining range across others.
- **Collecting:** fetch each branch, `cat name.mp4.part* > name.mp4`, and verify the exact frame count with ffprobe before joining.
- When everything is verified, archive the helper sessions.

## 3. Respect the creator's budget
- Helpers use the creator's usage allowance. Use exactly the number asked for, and stop them all when told to stop.
- There is no legitimate way to remove Claude usage limits; tools that "route Claude Code to free models" swap in other,
  weaker models. Don't install them for production work.
