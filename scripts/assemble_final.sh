#!/bin/bash
# Join the final 4K video:
#   frames     0– 2951  render/4k-chunk-00  (raw crf-18 chunk in <95 MB parts → re-encoded to 40 Mbit/s here)
#   frames  2952–26567  render/4k-v2-w01…w16 (240-frame segments, already 40 Mbit/s, scripts/render_seg_4k.sh)
#   frames 26568–29519  render/4k-chunk-09  (raw, re-encoded here)
#   audio               render/audio-v2-chunk-00…09 (WAV, trimmed-SFX mix), concatenated sample-exactly
# Every piece uses the same H.264 settings (40 Mbit/s, GOP 120), so the video concatenates by stream copy.
# Resumable: finished pieces are kept; run repeatedly until it prints ASSEMBLED.
# usage: scripts/assemble_final.sh            -> out/final/America_Azaad_Kaise_Hua_4K60.mp4
set -uo pipefail
cd "$(dirname "$0")/.."
W=out/final/assemble; mkdir -p "$W/seg"
ENC="-c:v libx264 -preset medium -b:v 40M -maxrate 50M -bufsize 80M -g 120 -pix_fmt yuv420p -an"
TOTAL=29520

# 1 · the two raw edge chunks
for i in 00 09; do
  enc="$W/enc_$i.mp4"
  [ -s "$enc" ] && continue
  git fetch -q origin "render/4k-chunk-$i" 2>/dev/null || continue
  rm -f "$W"/chunk_$i.mp4*
  git archive "origin/render/4k-chunk-$i" "renders/4k/chunk_$i" | tar -x -C "$W" --strip-components=3
  cat "$W"/chunk_$i.mp4.part_* > "$W/chunk_$i.mp4" && rm "$W"/chunk_$i.mp4.part_*
  ffmpeg -v error -y -i "$W/chunk_$i.mp4" $ENC "$enc.tmp.mp4" && mv "$enc.tmp.mp4" "$enc" && echo "ENCODED edge chunk $i"
  rm -f "$W/chunk_$i.mp4"
  git update-ref -d "refs/remotes/origin/render/4k-chunk-$i"; git gc -q --prune=now 2>/dev/null
done

# 2 · the segments from the 16 resumable workers
for w in $(seq -w 1 16); do
  git fetch -q origin "render/4k-v2-w$w" 2>/dev/null || continue
  git archive "origin/render/4k-v2-w$w" renders/4k-v2 2>/dev/null | tar -x -C "$W/seg" --strip-components=2 2>/dev/null
done

# 3 · audio
for i in $(seq -w 0 9); do
  [ -s "$W/chunk_$i.wav" ] && continue
  git fetch -q origin "render/audio-v2-chunk-$i" 2>/dev/null && \
    git archive "origin/render/audio-v2-chunk-$i" "renders/audio/chunk_$i.wav" | tar -x -C "$W" --strip-components=2 && echo "GOT audio $i"
done

# 4 · coverage check: every frame exactly once
: > "$W/video.txt"; frames=0; missing=""
add() { local n; n=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 "$1"); echo "file '$(basename "$1")'" >> "$W/video.txt"; frames=$((frames + n)); }
if [ -s "$W/enc_00.mp4" ]; then add "$W/enc_00.mp4"; else missing="$missing chunk00"; fi
for ((a = 2952; a <= 26567; a += 240)); do
  s=$(printf "%s/seg/seg_%05d.mp4" "$W" $a)
  if [ -s "$s" ]; then ln -sf "seg/$(basename "$s")" "$W/$(basename "$s")"; add "$W/$(basename "$s")"; else missing="$missing $a"; fi
done
if [ -s "$W/enc_09.mp4" ]; then add "$W/enc_09.mp4"; else missing="$missing chunk09"; fi
wavs=$(ls "$W"/chunk_*.wav 2>/dev/null | wc -l)
echo "VIDEO frames $frames/$TOTAL · audio $wavs/10 · missing:${missing:- none}"
[ -z "$missing" ] && [ "$frames" -eq "$TOTAL" ] && [ "$wavs" -eq 10 ] || exit 0

# 5 · final mux
: > "$W/audio.txt"; for i in $(seq -w 0 9); do echo "file 'chunk_$i.wav'" >> "$W/audio.txt"; done
ffmpeg -v error -y -f concat -safe 0 -i "$W/audio.txt" -c:a pcm_s16le "$W/audio_full.wav"
ffmpeg -v error -y -f concat -safe 0 -i "$W/video.txt" -i "$W/audio_full.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k \
  -movflags +faststart out/final/America_Azaad_Kaise_Hua_4K60.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of default=nw=1 out/final/America_Azaad_Kaise_Hua_4K60.mp4
echo "ASSEMBLED"
