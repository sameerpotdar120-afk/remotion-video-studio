#!/bin/bash
# Mountain Cabin Part 1: gather chunks (local + helper branches), check every frame 0..LAST is covered, join, add the sound mix (-14 LUFS).
set -e
cd "$(dirname "$0")/.."
LAST=${1:-2201}; OUT=${2:-out/final4/Mountain-Cabin-Part1.mp4}
D=out/final4/parts; mkdir -p $D; rm -f $D/*.mp4
for h in 1 2; do
  git fetch -q origin claude/ep4-render-h$h 2>/dev/null || continue
  for f in $(git ls-tree --name-only FETCH_HEAD out/ep4parts/ 2>/dev/null); do git show FETCH_HEAD:$f > $D/$(basename $f); done
done
cp -f out/ep4parts/*.mp4 $D/
python3 - "$D" "$LAST" <<'PY'
import os, sys, re
d, last = sys.argv[1], int(sys.argv[2])
parts = sorted((int(m[1]), int(m[2]), f) for f in os.listdir(d) if (m := re.match(r"p_(\d+)_(\d+)\.mp4", f)))
nxt, use = 0, []
for a, b, f in parts:
    if b < nxt: continue
    if a != nxt: sys.exit(f"GAP: need frame {nxt}, next part starts {a} ({f})")
    use.append(f); nxt = b + 1
if nxt <= last: sys.exit(f"MISSING frames {nxt}..{last}")
open(os.path.join(d, "list.txt"), "w").write("".join(f"file '{f}'\n" for f in use))
print("OK", len(use), "parts")
PY
ffmpeg -loglevel error -y -f concat -safe 0 -i $D/list.txt -c copy out/final4/video_only.mp4
ffmpeg -loglevel error -y -i out/final4/video_only.mp4 -i public/ep4/mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart $OUT
ffprobe -v error -show_entries format=duration:stream=width,height,nb_frames -of compact $OUT
