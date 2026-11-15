#!/bin/bash
# Analyse a reference short: probe, timestamped contact sheets, audio (private use), 1 fps stills, cut/motion curve.
# usage: bash analyze_ref.sh reference.mp4 out_dir [sheet_fps=6]
set -e
V=$1; O=$2; FPS=${3:-6}; mkdir -p "$O/sheets" "$O/stills"
D=$(cd "$(dirname "$0")" && pwd)
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of default=nw=1 "$V" | tee "$O/probe.txt"
ffmpeg -nostdin -v error -y -i "$V" -vf "fps=$FPS,scale=240:-1,drawtext=text='%{pts\:hms}':x=4:y=4:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=6x2" "$O/sheets/sheet_%03d.jpg"
ffmpeg -nostdin -v error -y -i "$V" -vf fps=1 "$O/stills/s_%03d.png"
ffmpeg -nostdin -v error -y -i "$V" -vn -ac 1 -ar 48000 -c:a pcm_s16le "$O/ref_audio.wav" || true
python3 "$D/cuts.py" "$V" > "$O/cuts.tsv"
echo "sheets: $(ls $O/sheets | wc -l), stills: $(ls $O/stills | wc -l)"
echo "hard cuts / camera moves summary:"; grep -E "^#" "$O/cuts.tsv" || true
echo "READ EVERY SHEET. Private comparison only: never publish the reference audio or frames."
