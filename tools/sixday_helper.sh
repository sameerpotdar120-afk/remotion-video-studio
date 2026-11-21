#!/bin/bash
# One Six-Day War render helper: render SDLong frames <first>..<last> at 4K30 in 300-frame pieces and push each piece,
# split into 45 MB parts (plain git, no LFS), to the branch <branch> as soon as it is done.
#   bash tools/sixday_helper.sh <first> <last> <branch> <tag>
set -u
cd "$(dirname "$0")/.."
A=$1; Z=$2; BR=$3; TAG=$4
OUT=$PWD/../sd_render_$TAG; mkdir -p $OUT
git checkout -B $BR >/dev/null 2>&1
for a in $(seq $A 300 $Z); do
  b=$((a + 299)); [ $b -gt $Z ] && b=$Z; n=$(printf "%05d" $a)
  CONC=${CONC:-4} bash tools/render_sixday_pieces.sh SDLong $a $b $OUT || true
  f=$OUT/SDLong_$n.mp4
  [ -f $f ] || { echo "piece $a failed"; continue; }
  D=exports/sd_chunks/$TAG; mkdir -p $D
  [ -f $D/SDLong_$n.mp4.part00 ] && continue
  split -b 45M -d -a 2 $f $D/SDLong_$n.mp4.part
  (cd $D && sha256sum SDLong_$n.mp4.part* >> SHA256SUMS && sha256sum ../../../$OUT/SDLong_$n.mp4 2>/dev/null | true)
  sha256sum $f | sed "s#$OUT/##" >> $D/WHOLE_SHA256
  git add --sparse $D 2>/dev/null || git add $D
  git -c user.name="render helper" -c user.email="helper@noreply" commit -qm "Six-Day render $TAG: SDLong frames $a-$b"
  for i in 1 2 3 4; do git push -q -u origin $BR && break; sleep $((i * 10)); done
  rm -f $D/SDLong_$n.mp4.part*
  echo "pushed piece $a-$b $(TZ=Asia/Kolkata date +%H:%M)"
done
echo HELPERDONE
