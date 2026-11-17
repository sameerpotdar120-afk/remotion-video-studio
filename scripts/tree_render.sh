#!/usr/bin/env bash
# Helper job for Samulation #5 (tree): install Blender, fetch the CC0 HDRI, render a frame range of a shot, push the PNGs.
#   bash scripts/tree_render.sh <shot> <from> <to> <branch>
set -euo pipefail
SHOT=$1; F0=$2; F1=$3; BRANCH=$4; ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
if ! command -v blender >/dev/null; then
  curl -sSfL -o /tmp/blender.tar.xz https://download.blender.org/release/Blender4.5/blender-4.5.15-linux-x64.tar.xz
  tar xf /tmp/blender.tar.xz -C /root && rm /tmp/blender.tar.xz && ln -sf /root/blender-4.5.15-linux-x64/blender /usr/local/bin/blender
fi
mkdir -p /root/proj/tree/hdri; H=/root/proj/tree/hdri/kloofendal_48d_partly_cloudy_puresky.hdr
[ -f "$H" ] || curl -sSfL -o "$H" https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/kloofendal_48d_partly_cloudy_puresky_2k.hdr   # CC0 (Poly Haven)
OUT=out/tree/$SHOT; mkdir -p "$OUT"
blender -b --python src/videos/tree/tree.py -- --shot "$SHOT" --from "$F0" --to "$F1" --res 360 --spp 48 --outdir "$OUT" --hdri "$H" 2>&1 | grep -E "FRAME|DONE|Error|Traceback" || true
git checkout -B "$BRANCH"; git add -f "$OUT"; git commit -qm "tree render $SHOT $F0-$F1"
for i in 1 2 3 4; do git push -u origin "$BRANCH" && break || sleep $((i * 8)); done
echo "RENDER_PART_DONE $SHOT $F0 $F1"
