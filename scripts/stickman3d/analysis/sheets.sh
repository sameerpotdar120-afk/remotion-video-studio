#!/bin/bash
# Contact sheets of a reference at 10 fps (every 6th frame), frame numbers burnt in - read these to log every shot,
# camera move and acting beat. usage: scripts/stickman3d/analysis/sheets.sh <ref.mp4> <outdir>
set -euo pipefail
mkdir -p "$2"
ffmpeg -v error -y -i "$1" -vf "select='not(mod(n\,6))',scale=120:-1,drawtext=text='%{eif\:n*6\:d}':x=2:y=2:fontsize=13:fontcolor=yellow:box=1:boxcolor=black,tile=16x4" -vsync 0 "$2/d_%02d.jpg"
ls "$2"
