#!/bin/bash
# Render a frame range of episode 2 (2K 1440x2560, 30 fps) in 60-frame chunks, pushing each chunk + a preview frame.
# usage: scripts/ep2_render.sh FROM TO BRANCH [push=1]
set -u
FROM=$1; TO=$2; BR=$3; PUSH=${4:-1}
cd "$(dirname "$0")/.."
[ -d node_modules/remotion ] || npm ci --no-audit --no-fund
mkdir -p out/ep2parts out/ep2prev
npx remotion bundle src/index.ts --out-dir=out/bundle --log=error
for ((a=FROM; a<=TO; a+=60)); do
  b=$((a+59)); [ $b -gt $TO ] && b=$TO
  f=$(printf "out/ep2parts/p_%05d_%05d.mp4" $a $b)
  [ -s "$f" ] && continue
  echo "CHUNK $a-$b start $(date +%T)"
  for try in 1 2 3; do
    npx remotion render out/bundle Ep2 "$f" --frames=$a-$b --concurrency=4 --codec=h264 --crf=17 --muted --props='{"audio":false}' --timeout=900000 --log=error && break
    echo "RETRY $a-$b"; rm -f "$f"
  done
  ffmpeg -loglevel error -y -sseof -0.1 -i "$f" -frames:v 1 -vf scale=540:-1 "out/ep2prev/f_$(printf %05d $b).jpg"
  echo "CHUNK $a-$b done $(date +%T)"
  if [ "$PUSH" = 1 ]; then
    git add -f "$f" out/ep2prev && git commit -qm "ep2 render chunk $a-$b" && for i in 1 2 3 4; do git push -q origin HEAD:$BR && break; sleep $((i*5)); done
  fi
done
echo "ALL DONE $FROM-$TO $(date +%T)"
