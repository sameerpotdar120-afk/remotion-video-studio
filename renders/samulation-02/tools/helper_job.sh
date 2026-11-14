#!/bin/bash
# Render one quarter of Samulation #2 at 4K 60 fps (silent video parts) and push them to a branch.
# usage (from this project folder): bash tools/helper_job.sh <machine 0-3> <push-branch|-> [procs=3]
# Total = 3158 frames (52.6333 s at 60 fps), machine q renders frames [q*790, min((q+1)*790, 3158)), split across `procs` processes.
set -u
Q=$1; BR=$2; P=${3:-3}; TOTAL=3158; PER=790; FPS=60
S=$((Q*PER)); E=$(( (Q+1)*PER < TOTAL ? (Q+1)*PER : TOTAL )); N=$((E-S))
mkdir -p renders review; [ -f data/mix.wav ] && mv data/mix.wav data/mix.wav.off   # parts are silent; audio is muxed at the end
echo "machine $Q: frames $S..$((E-1)) ($N frames) in $P processes, start $(date -u +%H:%M:%S)" | tee review/helper$Q.log
pids=()
for i in $(seq 0 $((P-1))); do
  a=$(( S + N*i/P )); b=$(( S + N*(i+1)/P ))
  A=$(python3 -c "print(repr($a/$FPS))"); B=$(python3 -c "print(repr($b/$FPS))")
  QS='&res=2&scale=2' SOFTWARE_GL=1 FPS=$FPS node tools/capture.mjs video renders/q${Q}_p$i.mp4 $A $B > review/q${Q}_p$i.log 2>&1 &
  pids+=($!); echo "  part $i: frames $a..$((b-1)) -> renders/q${Q}_p$i.mp4" | tee -a review/helper$Q.log
done
for p in "${pids[@]}"; do wait $p; done
for f in renders/q${Q}_p*.mp4; do   # keep every file under 95 MB for GitHub (re-encode if needed)
  sz=$(stat -c %s "$f"); fr=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$f")
  if [ "$sz" -gt 95000000 ]; then ffmpeg -nostdin -v error -y -i "$f" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -an "${f%.mp4}_s.mp4" && mv "${f%.mp4}_s.mp4" "$f"; fi
  echo "  $f: $fr frames, $(du -h "$f" | cut -f1)" | tee -a review/helper$Q.log
done
echo "done $(date -u +%H:%M:%S)" | tee -a review/helper$Q.log
if [ "$BR" != "-" ]; then
  git checkout -B "$BR" >/dev/null 2>&1; git add -f renders/q${Q}_p*.mp4 review/helper$Q.log
  git commit -qm "Samulation #2: 4K60 render, machine $Q" && for i in 1 2 3 4 5; do git push -u origin "$BR" && break; sleep $((2**i)); done
fi
