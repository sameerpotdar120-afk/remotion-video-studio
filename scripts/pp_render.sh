#!/bin/bash
# Render a frame range of the anime Western ("Film", 1080x1920 30 fps, muted) in 45-frame mp4 chunks + a preview still per chunk.
# usage: scripts/pp_render.sh FROM TO [BRANCH_TO_PUSH]   (no branch = keep local)
set -u
FROM=$1; TO=$2; BR=${3:-}
cd "$(dirname "$0")/.."
[ -d node_modules/remotion ] || npm ci --no-audit --no-fund
[ -s public/anime/Horse.fbx ] || bash scripts/fetch_anime_bases.sh
mkdir -p out/ppparts out/ppprev
npx remotion bundle src/index.ts --out-dir=out/ppbundle --log=error
for ((a=FROM; a<=TO; a+=45)); do
  b=$((a+44)); [ $b -gt $TO ] && b=$TO
  f=$(printf "out/ppparts/p_%05d_%05d.mp4" $a $b)
  [ -s "$f" ] && continue
  echo "CHUNK $a-$b start $(date +%T)"
  for try in 1 2 3; do
    npx remotion render out/ppbundle Film "$f" --frames=$a-$b --concurrency=2 --codec=h264 --crf=17 --muted --timeout=900000 --log=error && break
    echo "RETRY $a-$b"; rm -f "$f"
  done
  ffmpeg -loglevel error -y -ss 0.5 -i "$f" -frames:v 1 -vf scale=360:-1 "out/ppprev/f_$(printf %05d $a).jpg"
  echo "CHUNK $a-$b done $(date +%T)"
  if [ -n "$BR" ]; then git add -f "$f" out/ppprev && git commit -qm "pp render chunk $a-$b" && for i in 1 2 3 4; do git push -q origin HEAD:$BR && break; sleep $((i*5)); done; fi
done
echo "ALL DONE $FROM-$TO $(date +%T)"
