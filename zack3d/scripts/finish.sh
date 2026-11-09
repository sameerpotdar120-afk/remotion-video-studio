#!/bin/bash
# extract helper mp4s -> render/x, assemble, encode preview + side-by-side
set -e; cd ~/zack; S=/tmp/claude-0/-home-user/1d9d8587-1819-5bd4-9931-b2426c40eaf0/scratchpad
for m in hmp/*.mp4; do n=$(basename $m .mp4); case $n in shot_man) s=25;; shot_m2) s=42;; shot_m3) s=44;; shot_blades1) s=57;; shot_b1c) s=84;; shot_blades2) s=86;; shot_blades2a) s=98;; shot_blades2b) s=104;; shot_blades2c) s=110;; esac
  ffmpeg -v error -y -i $m -start_number $s render/x/f_%04d.png; done
nice python3 scripts/assemble.py $S/asm
ffmpeg -v error -y -framerate 30 -i $S/asm/p_%04d.png -i ref5.wav -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -shortest /home/user/Zack3D-Horsefly-Preview-5s.mp4
ffmpeg -v error -y -i ref5_720.mp4 -i /home/user/Zack3D-Horsefly-Preview-5s.mp4 -filter_complex "[1:v]scale=720:1280[b];[0:v][b]hstack,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='REFERENCE':x=20:y=20:fontsize=36:fontcolor=white:box=1:boxcolor=black@0.5,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='OURS':x=740:y=20:fontsize=36:fontcolor=white:box=1:boxcolor=black@0.5[v]" -map "[v]" -map 1:a -c:v libx264 -crf 18 -c:a copy /home/user/Zack3D-Preview-vs-Reference.mp4
ls -la /home/user/Zack3D-*.mp4
