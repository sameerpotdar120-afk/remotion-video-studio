#!/bin/bash
# Final render of one job from jobs.json, then encode and push. Resumable: re-running skips frames already rendered.
# usage: run_job.sh <job index> <push branch>        (run from the repo root; needs ~/zack/bin/blender-4.5.15-linux-x64/blender)
J=$1; BR=$2; R=$(pwd); Z=$R/zack3d; OUT=$HOME/final_j$J; mkdir -p $OUT $Z/final
LOG=$OUT/job.log; echo "start $(date -u)" >> $LOG
python3 -c "import json; [print(n,a,b) for n,a,b in json.load(open('$Z/scripts/jobs.json'))[$J]]" | while read SH A B; do
  for f in $(seq $A $B); do
    [ -s $OUT/f_$(printf %04d $f).png ] && continue
    s=$(date +%s); $Z/scripts/render_shot.sh $SH $OUT 100 64 $f $f >> $LOG 2>&1; echo "frame $f $SH $(( $(date +%s)-s ))s" >> $LOG
  done
done
# encode in pieces of <= 40 frames (visually lossless x264 CRF 12), keep each file under 95 MB
python3 -c "import json; [print(n,a,b) for n,a,b in json.load(open('$Z/scripts/jobs.json'))[$J]]" | while read SH A B; do
  for s0 in $(seq $A 40 $B); do
    e0=$(( s0 + 39 < B ? s0 + 39 : B )); N=$(( e0 - s0 + 1 )); F=$Z/final/f_$(printf %04d $s0)-$(printf %04d $e0).mp4
    for crf in 12 15 18; do
      ffmpeg -nostdin -v error -y -framerate 30 -start_number $s0 -i $OUT/f_%04d.png -frames:v $N -c:v libx264 -crf $crf -preset slow -pix_fmt yuv420p $F
      [ $(stat -c %s $F) -lt 95000000 ] && break
    done
    echo "encoded $F crf $crf $(stat -c %s $F)" >> $LOG
  done
done
cd $R && git checkout -B $BR >/dev/null 2>&1; git add zack3d/final && git commit -qm "zack3d final render job $J

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3c1nFj8TdJaLN99CjvEpv"
for i in 1 2 3 4 5; do git push -u origin $BR >> $LOG 2>&1 && break; sleep $((2**i)); done
echo "JOBDONE $(date -u)" >> $LOG
