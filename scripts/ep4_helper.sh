#!/bin/bash
# Helper render for Mountain Cabin Part 1 (1080x1920, 30 fps). Rebuilds the private environment assets from the creator's Drive zip
# (never committed), then renders FROM..TO in 150-frame chunks and pushes each chunk (+ a preview frame) to BRANCH.
# usage: scripts/ep4_helper.sh FROM TO BRANCH DRIVE_FILE_ID
set -u
FROM=$1; TO=$2; BR=$3; ID=$4
cd "$(dirname "$0")/.."
export npm_config_onnxruntime_node_install_cuda=skip
[ -d node_modules/remotion ] || npm ci --no-audit --no-fund --onnxruntime-node-install-cuda=skip
export NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt
if [ ! -s public/ep4/env/E9_depth.png ]; then
  T=$(mktemp -d); curl -sSL -o $T/env.zip "https://drive.usercontent.google.com/download?id=$ID&export=download&confirm=t"
  mkdir -p $T/x && (cd $T/x && unzip -oq ../env.zip) && mkdir -p public/ep4/env
  for i in 1 2 3 4 5 6 7 8 9; do src=$(find $T/x -iname "E${i}_*.png" | head -1); ffmpeg -loglevel error -y -i "$src" -q:v 2 public/ep4/env/E$i.jpg; node scripts/depth.mjs public/ep4/env/E$i.jpg public/ep4/env/E${i}_depth.png base; done
fi
ls public/ep4/env | wc -l
mkdir -p out/ep4parts out/ep4prev
npx remotion bundle src/index.ts --out-dir=out/bundle4 --log=error
for ((a=FROM; a<=TO; a+=150)); do
  b=$((a+149)); [ $b -gt $TO ] && b=$TO
  f=$(printf "out/ep4parts/p_%04d_%04d.mp4" $a $b); [ -s "$f" ] && continue
  echo "CHUNK $a-$b start $(date +%T)"
  for try in 1 2 3; do
    npx remotion render out/bundle4 Ep4Part1 "$f" --frames=$a-$b --concurrency=4 --codec=h264 --crf=16 --muted --props='{"audio":false}' --timeout=600000 --log=error && break
    echo "RETRY $a-$b"; rm -f "$f"
  done
  ffmpeg -loglevel error -y -sseof -0.1 -i "$f" -frames:v 1 -vf scale=540:-1 "out/ep4prev/f_$(printf %04d $b).jpg"
  git add -f "$f" out/ep4prev && git commit -qm "ep4 part1 render chunk $a-$b" && for i in 1 2 3 4; do git push -q origin HEAD:$BR && break; sleep $((i*5)); done
  echo "CHUNK $a-$b done $(date +%T)"
done
echo "ALL DONE $FROM-$TO $(date +%T)"
