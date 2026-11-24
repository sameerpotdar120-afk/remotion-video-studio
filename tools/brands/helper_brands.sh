#!/bin/bash
# One Brands render helper: render frames <first>..<last> at 4K60 in 150-frame pieces and push each finished piece, split
# into 45 MB plain-git parts (no LFS), to the branch <branch> under exports/br_chunks/<tag>/.
#   bash tools/everest/helper_brands.sh <first> <last> <branch> <tag>
set -u
cd "$(dirname "$0")/../.."
A=$1; Z=$2; BR=$3; TAG=$4
OUT=$PWD/../br_render_$TAG; mkdir -p $OUT
git checkout -B $BR >/dev/null 2>&1
for a in $(seq $A 150 $Z); do
  b=$((a + 149)); [ $b -gt $Z ] && b=$Z; n=$(printf "%05d" $a)
  bash tools/brands/render_pieces.sh $a $b $OUT 150 >> $OUT/render.log 2>&1 || true
  f=$OUT/br_$n.mp4
  [ -f $f ] || { echo "piece $a failed"; continue; }
  D=exports/br_chunks/$TAG; mkdir -p $D
  [ -f $D/br_$n.mp4.part00 ] && continue
  split -b 45M -d -a 2 $f $D/br_$n.mp4.part
  (cd $D && sha256sum br_$n.mp4.part* >> SHA256SUMS)
  sha256sum $f | sed "s#$OUT/##" >> $D/WHOLE_SHA256
  git add --sparse $D 2>/dev/null || git add $D
  git -c user.name="render helper" -c user.email="helper@noreply" commit -qm "Brands render $TAG: frames $a-$b"
  for i in 1 2 3 4; do GIT_LFS_SKIP_PUSH=1 git push -q -u origin $BR && break; sleep $((i * 10)); done
  echo "pushed piece $a-$b $(TZ=Asia/Kolkata date +%H:%M)"
done
echo HELPERDONE
