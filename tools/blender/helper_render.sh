#!/bin/sh
# One render worker for the Blender landslide shot: install Blender, fetch the CC0 assets, rebuild the scene from code
# and the recorded rockfall (tools/blender/data/landslide_anim.json), render frames FIRST..LAST, encode an mp4.
#   sh tools/blender/helper_render.sh FIRST LAST NAME [SAMPLES]
set -e
A=$1; B=$2; N=$3; SPP=${4:-12}
BL=/opt/blender/blender-4.5.15-linux-x64/blender
if [ ! -x "$BL" ]; then
  mkdir -p /opt/blender
  curl -sSf -m 900 -o /opt/blender/b.tar.xz https://download.blender.org/release/Blender4.5/blender-4.5.15-linux-x64.tar.xz
  tar xJf /opt/blender/b.tar.xz -C /opt/blender && rm /opt/blender/b.tar.xz
fi
sh tools/blender/fetch_textures.sh /opt/phx > /dev/null
W=/tmp/ls_$N; mkdir -p "$W"
"$BL" -b -P tools/blender/sikkim_landslide.py -- "$W" --anim tools/blender/data/landslide_anim.json --trees /opt/phx/tree/island_tree_02_1k.blend 2>&1 | grep -E "puffs|Error|Trace" || true
"$BL" -b "$W/landslide.blend" -P tools/blender/render_frames.py -- "$W/f_" "$A" "$B" "$SPP" 2>&1 | grep -E "Saved:|Error|Trace" || true
mkdir -p tools/blender/renders
ffmpeg -v error -y -framerate 30 -start_number "$A" -i "$W/f_%04d.png" -c:v libx264 -crf 12 -pix_fmt yuv420p "tools/blender/renders/$N.mp4"
ffprobe -v error -count_frames -show_entries stream=nb_read_frames,width,height -of csv=p=0 "tools/blender/renders/$N.mp4"
