#!/usr/bin/env bash
# Render Samulation #4 (train) frame ranges in a fresh cloud container and push the 4K result.
#   bash scripts/train_render.sh <name> <branch|-> "<shot> <from> <to>" ["<shot> <from> <to>" ...]
# Renders 1440x2560 EEVEE (16 spp) -> Lanczos 2160x3840 -> out/train/<name>.mp4 (30 fps, crf 16), splits >90 MB.
set -euo pipefail
NAME=$1; BRANCH=$2; shift 2
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
if ! command -v blender >/dev/null; then
  curl -sSfL -o /tmp/blender.tar.xz https://download.blender.org/release/Blender4.5/blender-4.5.15-linux-x64.tar.xz
  tar xf /tmp/blender.tar.xz -C /root && rm /tmp/blender.tar.xz && ln -sf /root/blender-4.5.15-linux-x64/blender /usr/local/bin/blender
fi
(apt-get update -q >/dev/null 2>&1 || true); apt-get install -y -q libegl1 libgl1-mesa-dri libegl-mesa0 libxkbcommon0 libsm6 libxi6 libxxf86vm1 libxfixes3 libxrender1 >/dev/null 2>&1 || true
OUT=$ROOT/out/train/$NAME; mkdir -p "$OUT/png" out/train
for job in "$@"; do
  set -- $job
  blender -b --python src/videos/train/blender/anim.py -- --shot "$1" --from "$2" --to "$3" --scale 0.6667 --spp 16 --outdir "$OUT/png" --tmp /tmp/train_cards 2>&1 | grep -E "FRAME|SHOT_DONE|Error|Traceback" || true
done
# one mp4 per job (frame runs have gaps between jobs; an image2 sequence stops at the first missing number)
k=0; for job in "$@"; do set -- $job; k=$((k + 1)); SUF=$([ $k -eq 1 ] && echo "" || echo "_$k")
  ffmpeg -nostdin -v error -y -framerate 30 -start_number "$2" -i "$OUT/png/f%04d.png" -frames:v $(($3 - $2)) -vf "scale=2160:3840:flags=lanczos,unsharp=5:5:0.35" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p "out/train/$NAME$SUF.mp4"
done
ls "$OUT/png" > "out/train/$NAME.frames.txt"; echo "frames: $(ls "$OUT/png" | wc -l)"
if [ "$BRANCH" != "-" ]; then
  for f in out/train/"$NAME"*.mp4; do
    if [ "$(stat -c %s "$f")" -gt 94000000 ]; then split -b 90m -d "$f" "$f.part"; rm "$f"; fi
  done
  git checkout -B "$BRANCH"; git add -f out/train/"$NAME"* ; git commit -qm "train render part $NAME";
  for i in 1 2 3 4; do git push -u origin "$BRANCH" && break || sleep $((i * 8)); done
fi
echo "RENDER_PART_DONE $NAME"
