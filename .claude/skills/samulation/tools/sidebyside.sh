#!/bin/bash
# Reference | ours side by side, labelled, same height (for the user to judge, and for scoring).
# usage: bash sidebyside.sh ref.mp4 ours.mp4 out.mp4 [height=1280] [audio: ours|ref|none]
set -e
R=$1; O=$2; OUT=$3; HT=${4:-1280}; AU=${5:-ours}
LBL="drawtext=fontsize=$((HT/28)):fontcolor=white:box=1:boxcolor=black@0.6:x=12:y=12:text"
case $AU in ours) MAP=(-map 1:a?);; ref) MAP=(-map 0:a?);; *) MAP=();; esac
ffmpeg -nostdin -v error -y -i "$R" -i "$O" -filter_complex \
 "[0:v]scale=-2:$HT,setsar=1,$LBL='REFERENCE'[a];[1:v]scale=-2:$HT,setsar=1,$LBL='OURS'[b];[a][b]hstack=inputs=2:shortest=1[v]" \
 -map "[v]" "${MAP[@]}" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -shortest -movflags +faststart "$OUT"
echo "$OUT"
