#!/bin/sh
# CC0 assets from Poly Haven (public domain, no credit required; credited anyway) for the Blender shots:
# rock and soil textures, and the island_tree_02 broadleaf model.
#   sh tools/blender/fetch_textures.sh /opt/phx
set -e
DIR=${1:-/opt/phx}
mkdir -p "$DIR/tree/textures"
for t in brown_mud_rocks_01 red_laterite_soil_stones rock_face_03 rocky_terrain_02; do
  for m in diff nor_gl rough; do
    out="$DIR/${t}_$( [ $m = nor_gl ] && echo nor || echo $m ).jpg"
    [ -s "$out" ] || curl -sSf -m 180 -o "$out" "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/$t/${t}_${m}_2k.jpg"
  done
done
T=https://dl.polyhaven.org/file/ph-assets/Models
[ -s "$DIR/tree/island_tree_02_1k.blend" ] || curl -sSf -m 300 -o "$DIR/tree/island_tree_02_1k.blend" "$T/blend/1k/island_tree_02/island_tree_02_1k.blend"
for f in branches_diff_1k.png branches_nor_gl_1k.png branches_rough_1k.png diff_1k.jpg leaves_alpha_1k.png leaves_diff_1k.png \
         leaves_nor_gl_1k.png leaves_rough_1k.png nor_gl_1k.exr rough_1k.exr; do
  ext=${f##*.}
  [ -s "$DIR/tree/textures/island_tree_02_$f" ] || curl -sSf -m 180 -o "$DIR/tree/textures/island_tree_02_$f" "$T/$ext/1k/island_tree_02/island_tree_02_$f" 2>/dev/null || true
done
ls "$DIR" "$DIR/tree/textures"
