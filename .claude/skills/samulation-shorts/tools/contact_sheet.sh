#!/bin/bash
# Time-stamped contact sheet of a video for QA (read EVERY cell).
# usage: bash contact_sheet.sh video.mp4 out.jpg [every_seconds=0.5] [cols=8]
set -e
V=$1; OUT=$2; EV=${3:-0.5}; C=${4:-8}
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V"); N=$(python3 -c "import math;print(math.ceil($DUR/$EV))")
ROWS=$(( (N + C - 1) / C ))
ffmpeg -nostdin -v error -y -i "$V" -vf "fps=1/$EV,scale=200:-1,drawtext=text='%{pts\:hms}':x=4:y=4:fontsize=16:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=${C}x${ROWS}" -frames:v 1 -q:v 3 "$OUT"
echo "$OUT ($N frames, ${C}x${ROWS})"
