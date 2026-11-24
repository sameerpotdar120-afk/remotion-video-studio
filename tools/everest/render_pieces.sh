#!/bin/bash
# 4K30 Everest render in restart-safe pieces: tools/everest/render_pieces.sh <first> <last> <outdir> [step]
# 3D terrain needs --gl=swangle. JPEG 95 frames, x264 CRF 15, yuv420p; pieces are joined later by stream copy.
set -u
cd "$(dirname "$0")/../.."
A=$1; Z=$2; OUT=$3; STEP=${4:-122}
PUB=$OUT/pub; mkdir -p $PUB; ln -sfn $PWD/public/everest $PUB/everest
for a in $(seq $A $STEP $Z); do
  b=$((a + STEP - 1)); [ $b -gt $Z ] && b=$Z; n=$(printf "%05d" $a)
  [ -f $OUT/ev_$n.mp4 ] && continue
  npx remotion render src/everest/render.tsx EV4K30 $OUT/part_$n.mp4 --scale=2 --gl=swangle --public-dir=$PUB \
    --concurrency=${CONC:-3} --frames=$a-$b --crf=15 --jpeg-quality=95 --pixel-format=yuv420p --timeout=300000 --props='{"audio":""}' --log=error \
    && mv $OUT/part_$n.mp4 $OUT/ev_$n.mp4
  echo "piece $a-$b done $(TZ=Asia/Kolkata date +%H:%M)"
done
echo EVDONE
