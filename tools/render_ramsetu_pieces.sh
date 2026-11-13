#!/bin/bash
# 4K60 Ram Setu render in restart-safe pieces: tools/render_ramsetu_pieces.sh <first> <last> <outdir> <browser>
# High-quality settings against the "ants" (crawling compression noise on detailed satellite texture): frames as
# JPEG 95 (Remotion's default is 80), x264 CRF 15, yuv420p; pieces are joined later by stream copy, never re-encoded.
set -u
cd "$(dirname "$0")/.."
A=$1; Z=$2; OUT=$3; B=${4:-}
PUB=$OUT/pub; mkdir -p $PUB; ln -sfn $PWD/public/ramsetu $PUB/ramsetu; ln -sfn $PWD/public/brand $PUB/brand
for a in $(seq $A 300 $Z); do
  b=$((a + 299)); [ $b -gt $Z ] && b=$Z; n=$(printf "%05d" $a)
  [ -f $OUT/l_$n.mp4 ] && continue
  npx remotion render src/ramsetu/edit/render.tsx RamSetu4K60 $OUT/part_$n.mp4 --scale=2 --public-dir=$PUB ${B:+--browser-executable=$B} \
    --concurrency=${CONC:-3} --frames=$a-$b --crf=15 --jpeg-quality=95 --pixel-format=yuv420p --timeout=240000 --props='{"audio":""}' --log=error \
    && mv $OUT/part_$n.mp4 $OUT/l_$n.mp4
  echo "piece $a-$b done $(TZ=Asia/Kolkata date +%H:%M)"
done
echo RSDONE
