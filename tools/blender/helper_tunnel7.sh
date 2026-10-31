#!/bin/sh
# One render worker for the Tunnel 7 shot: install Blender, fetch the CC0 assets, rebuild the scene from code and the
# recorded slide (tools/blender/data/tunnel7_anim.json), render every STEP-th frame from FIRST to LAST as PNGs into
# tools/blender/renders/t7/ (frames interleave across workers, so the heavy dust frames at the end are shared).
#   sh tools/blender/helper_tunnel7.sh FIRST LAST STEP [SAMPLES]
set -e
A=$1; B=$2; STEP=$3; SPP=${4:-20}
BL=/opt/blender/blender-4.5.15-linux-x64/blender
if [ ! -x "$BL" ]; then
  mkdir -p /opt/blender
  curl -sSf -m 900 -o /opt/blender/b.tar.xz https://download.blender.org/release/Blender4.5/blender-4.5.15-linux-x64.tar.xz
  tar xJf /opt/blender/b.tar.xz -C /opt/blender && rm /opt/blender/b.tar.xz
fi
sh tools/blender/fetch_textures.sh /opt/phx > /dev/null
W=/tmp/t7w_$A; mkdir -p "$W"
"$BL" -b -P tools/blender/tunnel7.py -- "$W" --anim tools/blender/data/tunnel7_anim.json $(cat tools/blender/data/tunnel7_args.txt) \
  --trees /opt/phx/tree/island_tree_02_1k.blend 2>&1 | grep -E "SAVED|portal polys|Error|Trace" || true
mkdir -p tools/blender/renders/t7
"$BL" -b "$W/tunnel7.blend" -P tools/blender/render_frames.py -- "$(pwd)/tools/blender/renders/t7/f_" "$A" "$B" "$SPP" 100 "$STEP" 2>&1 | grep -E "Saved:|Error|Trace" || true
ls tools/blender/renders/t7 | wc -l
