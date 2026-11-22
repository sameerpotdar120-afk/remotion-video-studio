#!/bin/bash
# GTA 6 Short render helper: render frames <f0>..<f1> (end exclusive) at 4K30 in 150-frame pieces and push each finished
# piece, split into 45 MB plain-git parts (no LFS), to the branch <branch> under exports/gta_chunks/<tag>/.
#   bash tools/gta6/helper_gta.sh <f0> <f1> <branch> <tag>
set -u
cd "$(dirname "$0")/../.."
F0=$1; F1=$2; BR=$3; TAG=$4
(command -v apt-get >/dev/null && (apt-get install -y -q libegl1 libgl1 >/dev/null 2>&1 || (apt-get update -q >/dev/null 2>&1 && apt-get install -y -q libegl1 libgl1 >/dev/null 2>&1)))
pip install -q skia-python numpy pillow scipy >/dev/null 2>&1
python3 -c "import skia; from PIL import features; assert features.check('raqm'), 'PIL lacks raqm'; print('skia', skia.__version__)" || exit 1
mkdir -p public/gta6/film/assets/null_a public/gta6/film/assets/null_b
ffmpeg -v error -y -i public/gta6/null/null_gta_A.mp4 -t 4.2 -vf fps=30 -q:v 3 public/gta6/film/assets/null_a/f%04d.jpg
ffmpeg -v error -y -i public/gta6/null/null_gta_B.mp4 -t 5.2 -vf fps=30 -q:v 3 public/gta6/film/assets/null_b/f%04d.jpg
git checkout -B "$BR" >/dev/null 2>&1
PD=public/gta6/film/out/pieces_2160x3840
python3 tools/gta6/render_gta.py --size 2160x3840 --workers 3 --crf 17 --f0 "$F0" --f1 "$F1" > ../render_$TAG.log 2>&1 &
RP=$!
push_ready() {
  for f in $(ls $PD/piece_*.mp4 2>/dev/null | grep -v '\.part\.'); do
    n=$(basename "$f" .mp4); D=exports/gta_chunks/$TAG
    [ -f "$D/$n.mp4.part00" ] && continue
    mkdir -p $D
    split -b 45M -d -a 2 "$f" "$D/$n.mp4.part"
    (cd $D && sha256sum $n.mp4.part* >> SHA256SUMS)
    sha256sum "$f" | sed "s#$PD/##" >> $D/WHOLE_SHA256
    git add -f $D
    git -c user.name="render helper" -c user.email="helper@noreply" commit -qm "GTA6 render $TAG: $n"
    for i in 1 2 3 4; do GIT_LFS_SKIP_PUSH=1 git push -q -u origin "$BR" && break; sleep $((i * 10)); done
    echo "pushed $n $(TZ=Asia/Kolkata date +%H:%M)"
  done
}
while kill -0 $RP 2>/dev/null; do push_ready; sleep 30; done
push_ready
grep -q RENDERDONE ../render_$TAG.log && echo HELPERDONE || { echo "render failed:"; tail -20 ../render_$TAG.log; }
