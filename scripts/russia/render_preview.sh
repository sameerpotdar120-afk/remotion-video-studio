#!/bin/bash
# Resumable low-res (960×540, 60 fps) PREVIEW render of a frame range of Russia-4K, in 1200-frame segments.
# Each segment is committed + pushed to branch preview/russia-<name> at once; a rerun skips pushed segments.
# usage: scripts/russia/render_preview.sh <first> <last> <name> [scale]
set -uo pipefail
FIRST=$1; LAST=$2; NAME=$3; SCALE=${4:-0.25}; SEG=1200
cd "$(dirname "$0")/../.."
[ -d node_modules ] || npm ci --no-audit --no-fund
CHROME=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1)
BR=preview/russia-$NAME
git config user.email >/dev/null || git config user.email "render@local"
git config user.name >/dev/null || git config user.name "render worker"
if git fetch -q origin "$BR" 2>/dev/null; then git checkout -q -B "$BR" FETCH_HEAD; else git checkout -q -B "$BR"; fi
mkdir -p renders/russia-preview /tmp/seg
for ((a = FIRST; a <= LAST; a += SEG)); do
  b=$((a + SEG - 1)); [ $b -gt $LAST ] && b=$LAST
  out=renders/russia-preview/seg_$(printf %05d $a).mp4
  [ -s "$out" ] && { echo "SKIP $a"; continue; }
  for try in 1 2 3; do
    npx remotion render src/index.ts Russia-4K /tmp/seg/raw.mp4 --frames=$a-$b --muted --scale=$SCALE --crf=23 --concurrency=4 --timeout=240000 \
      --gl=swangle ${CHROME:+--browser-executable="$CHROME"} > /tmp/seg/render.log 2>&1 && break
    echo "retry $a ($try)"; tail -3 /tmp/seg/render.log
  done
  [ -s /tmp/seg/raw.mp4 ] || { echo "FAILED $a"; exit 1; }
  ffmpeg -v error -y -i /tmp/seg/raw.mp4 -c:v libx264 -preset medium -crf 23 -g 120 -pix_fmt yuv420p -an "$out"
  rm -f /tmp/seg/raw.mp4
  git add -f "$out" && git commit -q -m "Russia preview segment $a-$b ($NAME)"
  for t in 1 2 3 4 5; do git push -q -u origin "$BR" && break; sleep $((2 ** t)); done
  echo "SEGMENT $a-$b pushed"
done
echo "WORKER $NAME DONE"
