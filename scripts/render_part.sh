#!/bin/bash
# Render a frame range of a composition at 4K (scale 2) and push the mp4 to a branch.
#   bash scripts/render_part.sh <COMP> <from> <to> <part-name> <push-branch|->
set -e; cd "$(dirname "$0")/.."; COMP=$1; A=$2; B=$3; N=$4; BR=$5
[ -d node_modules/@remotion/three ] || npm ci --no-audit --no-fund
HS=$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell | head -1)
mkdir -p out/parts
npx remotion render src/index.ts $COMP out/parts/$N.mp4 --frames=$A-$B --scale=2 --gl=swangle --browser-executable=$HS --concurrency=${CONC:-2} --codec=h264 --crf=16 --timeout=900000 --muted 2>&1 | grep -E "Rendered [0-9]+/|Encoded|rror" | tail -3
ls -la out/parts/$N.mp4
if [ "$BR" != "-" ]; then git checkout -B "$BR" >/dev/null 2>&1; git add -f out/parts/$N.mp4; git commit -qm "render part $N ($COMP $A-$B)" && for i in 1 2 3 4 5; do git push -u origin "$BR" && break; sleep $((2**i)); done; fi
echo "PART $N DONE"
