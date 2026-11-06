#!/bin/bash
# usage: bash tools/render_slice.sh F0 F1  -> renders frames [F0,F1) at 60 fps 4K as renders/s_F0.mp4, commits + pushes it.
set -u
cd "$(dirname "$0")/.."
F0=$1; F1=$2; BR=$(git branch --show-current); export SOFTWARE_GL=1 FPS=60
name=$(printf "renders/s_%05d.mp4" $F0); mkdir -p renders
a0=$(awk "BEGIN{printf \"%.6f\", $F0/60}"); a1=$(awk "BEGIN{printf \"%.6f\", $F1/60}")
node tools/capture.mjs video "$name" "$a0" "$a1" || { echo "RENDER FAILED"; exit 1; }
sha256sum "$name" > "$name.sha256"; git add -f "$name" "$name.sha256"; git commit -qm "Atlantic Wall slice $F0-$F1"
for i in 1 2 3 4 5 6 8 10; do git push -q origin "$BR" && break; git pull -q --rebase origin "$BR"; sleep $i; done
echo "SLICE COMPLETE $F0-$F1"
