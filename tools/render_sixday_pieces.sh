#!/bin/bash
# 4K30 Six-Day War render in restart-safe pieces:
#   tools/render_sixday_pieces.sh <comp> <first> <last> <outdir> [browser]
# <comp> is SDLong (1920x1080 -> 3840x2160) or SDShort1..6 (1080x1920 -> 2160x3840). Frames as JPEG 95, x264 CRF 17,
# yuv420p; video only (the mix is added when the pieces are joined, by stream copy). Writes SDDONE at the end.
set -u
cd "$(dirname "$0")/.."
COMP=$1; A=$2; Z=$3; OUT=$4; B=${5:-}
PUB=$OUT/pub; mkdir -p $PUB; ln -sfn $PWD/public/sixday $PUB/sixday
for a in $(seq $A 300 $Z); do
  b=$((a + 299)); [ $b -gt $Z ] && b=$Z; n=$(printf "%05d" $a)
  [ -f $OUT/${COMP}_$n.mp4 ] && continue
  npx remotion render src/sixday/edit/render.tsx $COMP --gl=swangle $OUT/part_$n.mp4 --scale=2 --public-dir=$PUB ${B:+--browser-executable=$B} \
    --concurrency=${CONC:-3} --frames=$a-$b --crf=17 --jpeg-quality=95 --pixel-format=yuv420p --timeout=300000 --props='{"audio":""}' --muted --log=error \
    && mv $OUT/part_$n.mp4 $OUT/${COMP}_$n.mp4
  echo "$COMP piece $a-$b done $(TZ=Asia/Kolkata date +%H:%M)"
done
echo SDDONE
