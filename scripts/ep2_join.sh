#!/bin/bash
# Gather every ep2 chunk (local first, then helper branches h1..h8 at their latest commit), check full coverage 0..LAST, join + add the mix.
set -e
cd "$(dirname "$0")/.."
LAST=${1:-2187}
D=out/final/parts; mkdir -p $D; rm -f $D/*.mp4
for h in 1 2 3 4 5 6 7 8; do
  git fetch -q origin claude/ep2-render-h$h 2>/dev/null || continue
  for f in $(git ls-tree --name-only FETCH_HEAD out/ep2parts/ 2>/dev/null); do b=$(basename $f); [ -s out/ep2parts/$b ] && continue; git show FETCH_HEAD:$f > $D/$b; done
done
cp -n out/ep2parts/*.mp4 $D/ 2>/dev/null || true
cp -f out/ep2parts/*.mp4 $D/   # local renders win (fixes)
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
ffmpeg -loglevel error -y -f concat -safe 0 -i $D/list.txt -c copy out/final/video_only.mp4
ffmpeg -loglevel error -y -i out/final/video_only.mp4 -i public/ep2/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart out/final/Samulation-Ep2-Tree-2K30.mp4
ffprobe -v error -show_entries format=duration:stream=width,height,nb_frames -of compact out/final/Samulation-Ep2-Tree-2K30.mp4
