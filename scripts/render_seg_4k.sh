#!/bin/bash
# Resumable 4K render of a frame range in 4-second segments (survives container restarts and slow frames).
# Each 240-frame segment is rendered at crf 18, re-encoded to the delivery format (40 Mbit/s H.264, GOP 120 — the same
# settings scripts/assemble_final.sh uses, so all segments concat by stream copy), committed and pushed at once.
# A rerun skips segments already on the remote branch.
# usage: scripts/render_seg_4k.sh <first frame> <last frame> <worker name>   -> branch render/4k-v2-<name>, renders/4k-v2/seg_FFFFF.mp4
set -uo pipefail
FIRST=$1; LAST=$2; NAME=$3; SEG=240
cd "$(dirname "$0")/.."
[ -d node_modules ] || npm ci --no-audit --no-fund
CHROME=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
[ -x "$CHROME" ] || CHROME=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)
BR=render/4k-v2-$NAME
git config user.email >/dev/null || git config user.email "render@local"
git config user.name >/dev/null || git config user.name "render worker"
# resume from the remote branch if it exists, else start it from the current commit
if git fetch -q origin "$BR" 2>/dev/null; then git checkout -q -B "$BR" FETCH_HEAD; else git checkout -q -B "$BR"; fi
mkdir -p renders/4k-v2 /tmp/seg
for ((a = FIRST; a <= LAST; a += SEG)); do
  b=$((a + SEG - 1)); [ $b -gt $LAST ] && b=$LAST
  out=renders/4k-v2/seg_$(printf %05d $a).mp4
  [ -s "$out" ] && { echo "SKIP $a"; continue; }
  for try in 1 2 3; do
    npx remotion render src/index.ts Final-4K /tmp/seg/raw.mp4 --frames=$a-$b --muted --crf=18 --concurrency=4 --timeout=240000 \
      --gl=swangle --browser-executable="$CHROME" > /tmp/seg/render.log 2>&1 && break
    echo "retry $a ($try)"; tail -3 /tmp/seg/render.log
  done
  [ -s /tmp/seg/raw.mp4 ] || { echo "FAILED $a"; exit 1; }
  ffmpeg -v error -y -i /tmp/seg/raw.mp4 -c:v libx264 -preset medium -b:v 40M -maxrate 50M -bufsize 80M -g 120 -pix_fmt yuv420p -an "$out"
  rm -f /tmp/seg/raw.mp4
  git add -f "$out" && git commit -q -m "4K segment $a-$b ($NAME)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  for t in 1 2 3 4 5; do git push -q -u origin "$BR" && break; sleep $((2 ** t)); done
  echo "SEGMENT $a-$b pushed"
done
echo "WORKER $NAME DONE"
