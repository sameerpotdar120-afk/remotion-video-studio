#!/bin/bash
# low-res animatic of every shot: every 2nd frame, 12 %, 6 spp
OUT=/root/zack/animatic; mkdir -p $OUT
for sh in $(python3 -c "import json; print(' '.join(s[0] for s in json.load(open('/root/zack/scripts/shots.json'))))"); do
  s=$(date +%s); /root/zack/scripts/render_shot.sh $sh $OUT 12 6 "" "" 2 > $OUT/log_$sh.txt 2>&1; echo "$sh $(( $(date +%s)-s ))s $(grep -c FRAME $OUT/log_$sh.txt) frames" >> $OUT/times.txt
done
echo ALLDONE >> $OUT/times.txt
