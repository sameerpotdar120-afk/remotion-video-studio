#!/bin/bash
# Render Lighthouse in 4K in chunks (so frames can be checked while it runs), then join + mux audio.
cd "$(dirname "$0")/.."
mkdir -p out/lighthouse/chunks
N=4440; STEP=500
for ((a=${FROM:-0}; a<${UNTIL:-N}; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $N ] && b=$((N-1))
  f=out/lighthouse/chunks/c_$(printf %04d $a).mp4
  [ -f "$f" ] && continue
  npx remotion render src/index.ts Lighthouse "$f.tmp.mp4" --frames=$a-$b --scale=2 --concurrency=4 --codec=h264 --crf=16 --muted --log=error && mv "$f.tmp.mp4" "$f"
  echo "CHUNK $a-$b DONE $(TZ=Asia/Kolkata date +%H:%M)"
done
[ -n "$UNTIL" ] && [ "$UNTIL" -lt "$N" ] && exit 0
ls out/lighthouse/chunks/c_*.mp4 | sed 's/^/file /;s#file out/lighthouse/chunks/#file #' > out/lighthouse/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/lighthouse/chunks/list.txt -c copy out/lighthouse/lighthouse_4k_noaudio.mp4
ffmpeg -v error -y -i out/lighthouse/lighthouse_4k_noaudio.mp4 -i public/lighthouse/mix.wav -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=7" -ar 48000 -c:a aac -b:a 256k -shortest -movflags +faststart out/lighthouse/lighthouse_4k.mp4
ffmpeg -v error -y -i out/lighthouse/lighthouse_4k.mp4 -vf scale=1080:1920:flags=lanczos -c:v libx264 -crf 18 -preset medium -c:a copy -movflags +faststart out/lighthouse/lighthouse_1080p.mp4
echo ALLDONE
