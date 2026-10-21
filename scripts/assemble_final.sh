#!/bin/bash
# Join the 10 parallel 4K chunks + 10 audio chunks into the final video.
#   fetches render/4k-chunk-XX and render/audio-v2-chunk-XX, rebuilds each chunk from its <95 MB parts,
#   concatenates the video, the WAVs sample-exactly, re-encodes to 40 Mbit/s H.264 + AAC 320k.
# usage: scripts/assemble_final.sh            -> out/final/America_Azaad_Kaise_Hua_4K60.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
W=out/final/assemble; mkdir -p "$W"; rm -f "$W"/*.mp4 "$W"/*.wav "$W"/*.txt
for i in $(seq -w 0 9); do
  for kind in 4k audio-v2; do
    for t in 1 2 3 4; do git fetch -q origin "render/$kind-chunk-$i" && break; sleep $((2 ** t)); done
  done
  # video: parts → one chunk
  git archive "origin/render/4k-chunk-$i" "renders/4k/chunk_$i" | tar -x -C "$W" --strip-components=3
  cat "$W"/chunk_$i.mp4.part_* > "$W/chunk_$i.mp4" && rm "$W"/chunk_$i.mp4.part_*
  git archive "origin/render/audio-v2-chunk-$i" "renders/audio/chunk_$i.wav" | tar -x -C "$W" --strip-components=2
  echo "file 'chunk_$i.mp4'" >> "$W/video.txt"
  echo "file 'chunk_$i.wav'" >> "$W/audio.txt"
done
ffmpeg -v error -y -f concat -safe 0 -i "$W/audio.txt" -c:a pcm_s16le "$W/audio_full.wav"
# the crf-18 render chunks run ~260 Mbit/s (film grain is incompressible): re-encode once to 40 Mbit/s H.264,
# inside YouTube's 4K60 range, so the delivered file is ~2.5 GB instead of ~16 GB
ffmpeg -v error -stats -y -f concat -safe 0 -i "$W/video.txt" -i "$W/audio_full.wav" -map 0:v -map 1:a \
  -c:v libx264 -preset medium -b:v 40M -maxrate 50M -bufsize 80M -g 120 -pix_fmt yuv420p -c:a aac -b:a 320k \
  -movflags +faststart out/final/America_Azaad_Kaise_Hua_4K60.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of default=nw=1 out/final/America_Azaad_Kaise_Hua_4K60.mp4
echo "ASSEMBLED"
