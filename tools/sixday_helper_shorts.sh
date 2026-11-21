#!/bin/bash
# One Six-Day War Shorts render helper: render whole Shorts (SDShort<n>) at 4K30 (2160x3840) in 300-frame pieces,
# join each Short's pieces by stream copy, and push it split into 45 MB parts (plain git, no LFS) to <branch>.
#   bash tools/sixday_helper_shorts.sh <branch> <tag> <n> [<n> ...]
set -u
cd "$(dirname "$0")/.."
BR=$1; TAG=$2; shift 2
OUT=$PWD/../sd_render_$TAG; mkdir -p $OUT
git checkout -B $BR >/dev/null 2>&1
for n in "$@"; do
  F=$(node -e "const T=require('./src/sixday/edit/timing.json');const s=T.shorts[$n-1];console.log(Math.round((s.t1-s.t0)*30))")
  CONC=${CONC:-4} bash tools/render_sixday_pieces.sh SDShort$n 0 $((F - 1)) $OUT/s$n || true
  ls $OUT/s$n/SDShort${n}_*.mp4 | sort | sed "s#^#file '#; s#\$#'#" > $OUT/s$n/list.txt
  want=$(( (F + 299) / 300 )); have=$(wc -l < $OUT/s$n/list.txt)
  [ "$have" -eq "$want" ] || { echo "short $n: $have of $want pieces, re-run me"; continue; }
  ffmpeg -v error -y -f concat -safe 0 -i $OUT/s$n/list.txt -c copy $OUT/SDShort$n.mp4
  D=exports/sd_chunks/$TAG; mkdir -p $D
  split -b 45M -d -a 2 $OUT/SDShort$n.mp4 $D/SDShort$n.mp4.part
  (cd $D && sha256sum SDShort$n.mp4.part* >> SHA256SUMS)
  sha256sum $OUT/SDShort$n.mp4 | sed "s#$OUT/##" >> $D/WHOLE_SHA256
  git add --sparse $D 2>/dev/null || git add $D
  git -c user.name="render helper" -c user.email="helper@noreply" commit -qm "Six-Day render $TAG: SDShort$n ($F frames)"
  for i in 1 2 3 4; do git push -q -u origin $BR && break; sleep $((i * 10)); done
  echo "pushed SDShort$n $(TZ=Asia/Kolkata date +%H:%M)"
done
echo HELPERDONE
