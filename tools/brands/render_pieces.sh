#!/bin/bash
# 4K60 Brands render in restart-safe pieces: tools/brands/render_pieces.sh <first> <last> <outdir> [step]
# JPEG 95 frames, x264 CRF 15, yuv420p, no audio; pieces are joined later by stream copy and muxed with mix.wav.
set -u
cd "$(dirname "$0")/../.."
A=$1; Z=$2; OUT=$3; STEP=${4:-150}
PUB=$OUT/pub; mkdir -p $PUB; ln -sfn $PWD/public/brands $PUB/brands
for a in $(seq $A $STEP $Z); do
  b=$((a + STEP - 1)); [ $b -gt $Z ] && b=$Z; n=$(printf "%05d" $a)
  [ -f $OUT/br_$n.mp4 ] && continue
  npx remotion render src/brands/render.tsx BR4K60 $OUT/part_$n.mp4 --scale=2 --public-dir=$PUB \
    --concurrency=${CONC:-3} --frames=$a-$b --crf=15 --jpeg-quality=95 --pixel-format=yuv420p --timeout=300000 --props='{"audio":""}' --log=error \
    && mv $OUT/part_$n.mp4 $OUT/br_$n.mp4
  echo "piece $a-$b done $(TZ=Asia/Kolkata date +%H:%M)"
done
echo BRDONE
