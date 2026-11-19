#!/bin/bash
# Mountain Cabin Part 1: render in 300-frame chunks (silent video, captions burned), so frames can be checked while it runs.
set -e
cd "$(dirname "$0")/.."
LAST=${1:-2201}; D=out/ep4parts; mkdir -p $D
npx remotion bundle src/index.ts --out-dir=out/bundle4 --log=error >/dev/null
for ((a=0; a<=LAST; a+=300)); do b=$((a+299)); [ $b -gt $LAST ] && b=$LAST
  f=$D/p_$(printf %04d $a)_$(printf %04d $b).mp4; [ -s $f ] && continue
  npx remotion render out/bundle4 Ep4Part1 $f --frames=$a-$b --codec=h264 --crf=16 --concurrency=4 --muted --props='{"audio":false}' --timeout=600000 --log=error
  echo "DONE $a-$b $(date +%T)"
done
