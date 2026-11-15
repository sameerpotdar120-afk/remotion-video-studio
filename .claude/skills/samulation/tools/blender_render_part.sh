#!/usr/bin/env bash
# Render Samulation #4 (train) frame ranges in a fresh cloud container and push the 4K result.
#   bash scripts/train_render.sh <name> <branch|-> "<shot> <from> <to>" ["<shot> <from> <to>" ...]
# Renders 1440x2560 EEVEE (16 spp) -> Lanczos 2160x3840 -> out/train/<name>.mp4 (30 fps, crf 16), splits >90 MB.
set -euo pipefail
NAME=$1; BRANCH=$2; shift 2
SKILL=$(cd "$(dirname "$0")/.." && pwd); ROOT=${PROJECT_ROOT:-$(pwd)}; cd "$ROOT"
if ! command -v blender >/dev/null; then
  curl -sSfL -o /tmp/blender.tar.xz https://download.blender.org/release/Blender4.5/blender-4.5.15-linux-x64.tar.xz
  tar xf /tmp/blender.tar.xz -C /root && rm /tmp/blender.tar.xz && ln -sf /root/blender-4.5.15-linux-x64/blender /usr/local/bin/blender
fi
(apt-get update -q >/dev/null 2>&1 || true); apt-get install -y -q libegl1 libgl1-mesa-dri libegl-mesa0 libxkbcommon0 libsm6 libxi6 libxxf86vm1 libxfixes3 libxrender1 >/dev/null 2>&1 || true
OUT=$ROOT/out/train/$NAME; mkdir -p "$OUT/png" out/train
for job in "$@"; do
  set -- $job
  blender -b --python "$SKILL/blender/anim.py" -- --shot "$1" --from "$2" --to "$3" --scale 0.6667 --spp 16 --outdir "$OUT/png" --tmp /tmp/train_cards 2>&1 | grep -E "FRAME|SHOT_DONE|Error|Traceback" || true
done
N=$(ls "$OUT/png" | wc -l); echo "frames: $N"
FIRST=$(ls "$OUT/png" | head -1 | sed 's/f0*\([0-9]\)/\1/; s/\.png//'); [ -z "$FIRST" ] && FIRST=0
ffmpeg -nostdin -v error -y -framerate 30 -start_number "$FIRST" -i "$OUT/png/f%04d.png" -vf "scale=2160:3840:flags=lanczos,unsharp=5:5:0.35" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p "out/train/$NAME.mp4"
ls "$OUT/png" > "out/train/$NAME.frames.txt"
if [ "$BRANCH" != "-" ]; then
  SZ=$(stat -c %s "out/train/$NAME.mp4")
  if [ "$SZ" -gt 94000000 ]; then split -b 90m -d "out/train/$NAME.mp4" "out/train/$NAME.mp4.part"; rm "out/train/$NAME.mp4"; fi
  git checkout -B "$BRANCH"; git add -f out/train/"$NAME"* ; git commit -qm "train render part $NAME";
  for i in 1 2 3 4; do git push -u origin "$BRANCH" && break || sleep $((i * 8)); done
fi
echo "RENDER_PART_DONE $NAME"
