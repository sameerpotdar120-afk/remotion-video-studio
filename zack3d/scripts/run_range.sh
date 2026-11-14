#!/bin/bash
# Render one frame range of one shot at final quality, encode, push.  usage: run_range.sh <shot> <f0> <f1> <branch>
SH=$1; A=$2; B=$3; BR=$4; R=$(pwd); Z=$R/zack3d; OUT=$HOME/final_r; mkdir -p $OUT $Z/final; LOG=$OUT/job.log
for f in $(seq $A $B); do
  [ -s $OUT/f_$(printf %04d $f).png ] && continue
  s=$(date +%s); $Z/scripts/render_shot.sh $SH $OUT 100 64 $f $f >> $LOG 2>&1 < /dev/null; echo "frame $f $SH $(( $(date +%s)-s ))s" >> $LOG
done
F=$Z/final/f_$(printf %04d $A)-$(printf %04d $B).mp4
ffmpeg -nostdin -v error -y -framerate 30 -start_number $A -i $OUT/f_%04d.png -frames:v $((B-A+1)) -c:v libx264 -crf 12 -preset slow -pix_fmt yuv420p $F
cd $R && git checkout -B $BR >/dev/null 2>&1; git add $F && git commit -qm "zack3d final render $SH $A-$B

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3c1nFj8TdJaLN99CjvEpv"
for i in 1 2 3 4 5; do git push -u origin $BR >> $LOG 2>&1 && break; sleep $((2**i)); done
echo "JOBDONE $(date -u)" >> $LOG
