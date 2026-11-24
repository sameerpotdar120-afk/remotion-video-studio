#!/bin/bash
# Gather every film chunk (local + helper branches claude/pp-h1, claude/pp-h2), check coverage 0..LAST, join into public/pp/video.mp4.
set -e
cd "$(dirname "$0")/.."
LAST=${1:-3176}
D=out/final/parts; mkdir -p $D; rm -f $D/*.mp4
for b in claude/pp-h2 claude/pp-h1; do   # h1 last: its door-fix re-renders win
  git fetch -q origin $b 2>/dev/null || continue
  for f in $(git ls-tree --name-only FETCH_HEAD out/ppparts/ 2>/dev/null); do git show FETCH_HEAD:$f > $D/$(basename $f); done
done
cp -f out/ppparts/*.mp4 $D/ 2>/dev/null || true   # local renders win
python3 - "$D" "$LAST" <<'PY'
import os, sys, re
d, last = sys.argv[1], int(sys.argv[2])
parts = sorted((int(m[1]), int(m[2]), f) for f in os.listdir(d) if (m := re.match(r"p_(\d+)_(\d+)\.mp4", f)))
nxt, use = 0, []
for a, b, f in parts:
    if b < nxt: continue
    if a > nxt: sys.exit(f"GAP: need frame {nxt}, next part starts {a} ({f})")
    if a < nxt: sys.exit(f"OVERLAP at {a} ({f}), expected {nxt}")
    use.append(f); nxt = b + 1
if nxt <= last: sys.exit(f"MISSING frames {nxt}..{last}")
open(os.path.join(d, "list.txt"), "w").write("".join(f"file '{f}'\n" for f in use)); print("OK", len(use), "parts")
PY
ffmpeg -loglevel error -y -f concat -safe 0 -i $D/list.txt -c copy public/pp/video.mp4
ffprobe -v error -show_entries format=duration:stream=nb_frames -of compact public/pp/video.mp4
