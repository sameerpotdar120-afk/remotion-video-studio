#!/bin/bash
# Render Caesar in 4K in chunks (so frames can be checked while it runs), then join + mux audio.
cd "$(dirname "$0")/.."
mkdir -p out/caesar/chunks
N=4029; STEP=500
for ((a=0; a<N; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $N ] && b=$((N-1))
  f=out/caesar/chunks/c_$(printf %04d $a).mp4
  [ -f "$f" ] && continue
  npx remotion render src/index.ts Caesar "$f.tmp.mp4" --frames=$a-$b --scale=2 --concurrency=4 --codec=h264 --crf=16 --muted --log=error && mv "$f.tmp.mp4" "$f"
  echo "CHUNK $a-$b DONE $(TZ=Asia/Kolkata date +%H:%M)"
done
ls out/caesar/chunks/c_*.mp4 | sed 's/^/file /;s#file out/caesar/chunks/#file #' > out/caesar/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/caesar/chunks/list.txt -c copy out/caesar/caesar_4k_noaudio.mp4
ffmpeg -v error -y -i out/caesar/caesar_4k_noaudio.mp4 -i public/caesar/mix.wav -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=7" -ar 48000 -c:a aac -b:a 256k -shortest -movflags +faststart out/caesar/caesar_4k.mp4
ffmpeg -v error -y -i out/caesar/caesar_4k.mp4 -vf scale=1080:1920:flags=lanczos -c:v libx264 -crf 18 -preset medium -c:a copy -movflags +faststart out/caesar/caesar_1080p.mp4
echo ALLDONE
