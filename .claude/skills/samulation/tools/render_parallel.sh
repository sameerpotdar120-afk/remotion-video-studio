#!/bin/bash
# Final render in N parallel parts, then join + mux the final audio. Run from the PROJECT folder.
# usage: bash ../tools/render_parallel.sh <out.mp4> [parts=3] [duration=auto]
#   needs data/mix.wav (voice + sfx + music). Measured: ~2.9 s per frame per process on a 4-core CPU without GPU;
#   3 parts on 4 cores rendered 40 s (1205 frames) in 30 min. Use parts = number of CPU cores - 1.
#   With a real GPU drop SOFTWARE_GL (much faster). Progress prints every 150 frames per part.
set -e
OUT=${1:-renders/final.mp4}; P=${2:-3}; DUR=${3:-}
[ -f data/mix.wav ] || { echo "data/mix.wav missing: make the mix first (tools/mix.sh)"; exit 1; }
if [ -z "$DUR" ]; then DUR=$(python3 -c "import json; w=json.load(open('data/words.json')); print(round(w[-1]['e']+0.6,3))"); fi
GL=${SOFTWARE_GL-1}; mkdir -p renders review
echo "rendering $DUR s in $P parts (start $(date '+%H:%M'))"
pids=(); : > renders/list.txt
for i in $(seq 0 $((P-1))); do
  a=$(python3 -c "print(round($DUR*$i/$P,4))"); b=$(python3 -c "print(round($DUR*($i+1)/$P,4))")
  SOFTWARE_GL=$GL FPS=30 node tools/capture.mjs video renders/part$i.mp4 $a $b > review/part$i.log 2>&1 & pids+=($!)
  echo "file 'part$i.mp4'" >> renders/list.txt
done
for p in "${pids[@]}"; do wait $p; done
ffmpeg -nostdin -v error -y -f concat -safe 0 -i renders/list.txt -i data/mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
  -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
echo "frames: $(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUT")  (expected $(python3 -c "print(round($DUR*30))"))"
ffmpeg -nostdin -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
echo "done $(date '+%H:%M') -> $OUT"
