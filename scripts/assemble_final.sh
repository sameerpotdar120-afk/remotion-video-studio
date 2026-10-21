#!/bin/bash
# Join the 10 parallel 4K chunks + 10 audio chunks into the final video, one chunk at a time (the raw crf-18 chunks
# are ~1.6 GB each because film grain is incompressible; holding all of them plus git's copy would not fit on disk).
#   per chunk: fetch render/4k-chunk-XX → rebuild from its <95 MB parts → re-encode to 40 Mbit/s H.264 (YouTube 4K60
#   range) → drop the raw chunk and git's copy. Already-encoded chunks are skipped, so the script can run repeatedly
#   while chunks arrive. When all 10 are encoded: concat video (stream copy) + the 10 WAVs (sample-exact), mux AAC 320k.
# usage: scripts/assemble_final.sh            -> out/final/America_Azaad_Kaise_Hua_4K60.mp4
set -uo pipefail
cd "$(dirname "$0")/.."
W=out/final/assemble; mkdir -p "$W"
ready=0
for i in $(seq -w 0 9); do
  enc="$W/enc_$i.mp4"
  if [ ! -s "$enc" ]; then
    if git fetch -q origin "render/4k-chunk-$i" 2>/dev/null; then
      rm -f "$W"/chunk_$i.mp4*
      git archive "origin/render/4k-chunk-$i" "renders/4k/chunk_$i" | tar -x -C "$W" --strip-components=3
      cat "$W"/chunk_$i.mp4.part_* > "$W/chunk_$i.mp4" && rm "$W"/chunk_$i.mp4.part_*
      ffmpeg -v error -y -i "$W/chunk_$i.mp4" -c:v libx264 -preset medium -b:v 40M -maxrate 50M -bufsize 80M -g 120 \
        -pix_fmt yuv420p -an "$enc.tmp.mp4" && mv "$enc.tmp.mp4" "$enc" && echo "ENCODED video $i"
      rm -f "$W/chunk_$i.mp4"
      git update-ref -d "refs/remotes/origin/render/4k-chunk-$i"; git gc -q --prune=now 2>/dev/null
    fi
  fi
  if [ ! -s "$W/chunk_$i.wav" ]; then
    git fetch -q origin "render/audio-v2-chunk-$i" 2>/dev/null && \
      git archive "origin/render/audio-v2-chunk-$i" "renders/audio/chunk_$i.wav" | tar -x -C "$W" --strip-components=2 && echo "GOT audio $i"
  fi
  [ -s "$enc" ] && [ -s "$W/chunk_$i.wav" ] && ready=$((ready + 1))
done
echo "READY $ready/10"
[ "$ready" -eq 10 ] || exit 0
: > "$W/video.txt"; : > "$W/audio.txt"
for i in $(seq -w 0 9); do echo "file 'enc_$i.mp4'" >> "$W/video.txt"; echo "file 'chunk_$i.wav'" >> "$W/audio.txt"; done
ffmpeg -v error -y -f concat -safe 0 -i "$W/audio.txt" -c:a pcm_s16le "$W/audio_full.wav"
ffmpeg -v error -y -f concat -safe 0 -i "$W/video.txt" -i "$W/audio_full.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k \
  -movflags +faststart out/final/America_Azaad_Kaise_Hua_4K60.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of default=nw=1 out/final/America_Azaad_Kaise_Hua_4K60.mp4
echo "ASSEMBLED"
