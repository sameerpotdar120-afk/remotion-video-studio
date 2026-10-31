#!/bin/sh
# CC0 textures from Poly Haven (public domain, no credit required; credited anyway) for the Blender shots.
#   sh tools/blender/fetch_textures.sh /opt/phx
set -e
DIR=${1:-/opt/phx}
mkdir -p "$DIR"
for t in brown_mud_rocks_01 red_laterite_soil_stones rock_face_03 rocky_terrain_02; do
  for m in diff nor_gl rough; do
    out="$DIR/${t}_$( [ $m = nor_gl ] && echo nor || echo $m ).jpg"
    [ -s "$out" ] || curl -sSf -m 180 -o "$out" "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/$t/${t}_${m}_2k.jpg"
  done
done
ls "$DIR"
