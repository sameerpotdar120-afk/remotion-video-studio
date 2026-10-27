#!/bin/bash
# Resumable FINAL 4K60 render of a frame range of Russia-4K, in 600-frame (10 s) segments, video only (the soundtrack
# is muxed at the end from renders/russia-audio/soundtrack.m4a). Each segment is re-encoded to the delivery format
# (40 Mbit/s H.264, GOP 120, so all segments concat by stream copy), committed and pushed to render/russia-4k-<name>
# at once; a rerun skips segments already on that branch.
# usage: scripts/russia/render_4k.sh <first> <last> <name>
set -uo pipefail
FIRST=$1; LAST=$2; NAME=$3; SEG=600
cd "$(dirname "$0")/../.."
[ -d node_modules ] || npm ci --no-audit --no-fund
CHROME=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1 || true)
CONC=$(nproc)
BR=render/russia-4k-$NAME
git config user.email >/dev/null || git config user.email "render@local"
git config user.name >/dev/null || git config user.name "render worker"
if git fetch -q origin "$BR" 2>/dev/null; then git checkout -q -B "$BR" FETCH_HEAD; else git checkout -q -B "$BR"; fi
mkdir -p renders/russia-4k /tmp/seg
for ((a = FIRST; a <= LAST; a += SEG)); do
  b=$((a + SEG - 1)); [ $b -gt $LAST ] && b=$LAST
  out=renders/russia-4k/seg_$(printf %05d $a).mp4
  [ -s "$out" ] && { echo "SKIP $a"; continue; }
  for try in 1 2 3; do
    npx remotion render src/index.ts Russia-4K /tmp/seg/raw.mp4 --frames=$a-$b --muted --crf=16 --concurrency=$CONC --timeout=300000 \
      --gl=swangle ${CHROME:+--browser-executable="$CHROME"} > /tmp/seg/render.log 2>&1 && break
    echo "retry $a ($try)"; tail -3 /tmp/seg/render.log
  done
  [ -s /tmp/seg/raw.mp4 ] || { echo "FAILED $a"; exit 1; }
  ffmpeg -v error -y -i /tmp/seg/raw.mp4 -c:v libx264 -preset medium -b:v 40M -maxrate 50M -bufsize 80M -g 120 -pix_fmt yuv420p -an "$out"
  rm -f /tmp/seg/raw.mp4; rm -rf /tmp/remotion-webpack-bundle-*
  git add -f "$out" && git commit -q -m "Russia 4K segment $a-$b ($NAME)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  for t in 1 2 3 4 5; do git push -q -u origin "$BR" && break; sleep $((2 ** t)); done
  echo "SEGMENT $a-$b pushed"
done
echo "WORKER $NAME DONE"
