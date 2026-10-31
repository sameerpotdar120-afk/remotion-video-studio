#!/bin/sh
# One render worker for a shot in tools/blender/shots.py: install Blender, fetch the CC0 assets, build the shot from
# code, render every STEP-th frame from FIRST to LAST as PNGs into tools/blender/renders/SHOT/.
#   sh tools/blender/helper_shot.sh SHOT FIRST LAST STEP [SAMPLES]
set -e
SHOT=$1; A=$2; B=$3; STEP=$4; SPP=${5:-20}
BL=/opt/blender/blender-4.5.15-linux-x64/blender
if [ ! -x "$BL" ]; then
  mkdir -p /opt/blender
  curl -sSf -m 900 -o /opt/blender/b.tar.xz https://download.blender.org/release/Blender4.5/blender-4.5.15-linux-x64.tar.xz
  tar xJf /opt/blender/b.tar.xz -C /opt/blender && rm /opt/blender/b.tar.xz
fi
sh tools/blender/fetch_textures.sh /opt/phx > /dev/null
W=/tmp/shot_${SHOT}_$A; mkdir -p "$W"
"$BL" -b -P tools/blender/shots.py -- "$W" --shot "$SHOT" --trees /opt/phx/tree/island_tree_02_1k.blend 2>&1 | grep -E "SAVED|Error|Trace" || true
mkdir -p "tools/blender/renders/$SHOT"
"$BL" -b "$W/$SHOT.blend" -P tools/blender/render_frames.py -- "$(pwd)/tools/blender/renders/$SHOT/f_" "$A" "$B" "$SPP" 100 "$STEP" 2>&1 | grep -E "Saved:|Error|Trace" || true
ls "tools/blender/renders/$SHOT" | wc -l
