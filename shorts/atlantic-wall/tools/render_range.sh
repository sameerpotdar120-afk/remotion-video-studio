#!/bin/bash
# usage: bash tools/render_range.sh F0 F1   -> renders frames [F0, F1) at 60 fps, 4K, in 60-frame pieces;
# commits + pushes each piece to the current branch as soon as it is done (safe against restarts: done pieces are skipped).
set -u
cd "$(dirname "$0")/.."
F0=$1; F1=$2; STEP=60; BR=$(git branch --show-current)
export SOFTWARE_GL=1 FPS=60
mkdir -p renders
for ((f=F0; f<F1; f+=STEP)); do
  e=$(( f+STEP<F1 ? f+STEP : F1 )); name=$(printf "renders/p_%05d.mp4" $f)
  git fetch -q origin "$BR"; if git cat-file -e "origin/$BR:shorts/atlantic-wall/$name.sha256" 2>/dev/null; then echo "skip $name (already pushed)"; continue; fi
  a0=$(awk "BEGIN{printf \"%.6f\", $f/60}"); a1=$(awk "BEGIN{printf \"%.6f\", $e/60}")
  node tools/capture.mjs video "$name" "$a0" "$a1" || { echo "RENDER FAILED $name"; exit 1; }
  sha256sum "$name" > "$name.sha256"
  sz=$(stat -c %s "$name")
  if [ "$sz" -ge 95000000 ]; then split -b 90M -d "$name" "$name.p"; git add -f "$name".p* "$name.sha256"; else git add -f "$name" "$name.sha256"; fi
  git commit -qm "Atlantic Wall render frames $f-$e" || true
  for i in 1 2 3 4 5 6; do git push -q origin "$BR" && break; git pull -q --rebase origin "$BR"; sleep $((i*3)); done
  echo "DONE $name $(date +%T)"
done
echo "RANGE COMPLETE $F0-$F1"
