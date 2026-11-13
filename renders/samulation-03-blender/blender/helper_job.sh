#!/bin/bash
# Path-traced test clip, one helper's share.  bash blender/helper_job.sh <part 1-4> <push-branch>
# Downloads Blender 4.5 (CC0 assets are in the repo), renders its plates / drill poses into review/clip, commits and pushes them.
set -e; cd "$(dirname "$0")/.."; PART=$1; BR=$2; O=review/clip; G="--grassn 30000"; W=1080; H=1920
B=/tmp/blender/blender-4.5.15-linux-x64/blender
if [ ! -x $B ]; then mkdir -p /tmp/blender; for i in 1 2 3 4; do curl -sSL https://download.blender.org/release/Blender4.5/blender-4.5.15-linux-x64.tar.xz | tar -xJ -C /tmp/blender && break; sleep 5; done; fi
PA=$(python3 -c "print(','.join(f'{k*22.5}:0.012' for k in range(16)))"); PB=$(python3 -c "print(','.join(f'{k*22.5}:0.02' for k in range(16)))")
PW=$(python3 -c "print(','.join(f'{-k*14}:{0.02+0.11*(k/7)**1.5:.4f}' for k in range(8)))")
case $PART in
  1) $B -b -P blender/courtyard.py -- --shot A --w $W --h $H --samples 48 --done 31 --nodrill 1 --poses "$PA" --grips $O/x.json --hero $O/cardA.png --card $O/cardA.json --out $O/plateA.png $G
     $B -b -P blender/courtyard.py -- --shot B --w $W --h $H --samples 48 --done 31 --nodrill 1 --poses "$PB" --grips $O/x.json --out $O/plateB.png $G ;;
  2) $B -b -P blender/courtyard.py -- --shot B --w $W --h $H --samples 48 --done 32 --nodrill 1 --poses "$PW" --grips $O/x.json --out $O/plateW.png $G
     $B -b -P blender/courtyard.py -- --shot C --w $W --h $H --samples 48 --done 32 --grips $O/x.json --hero $O/cardC.png --card $O/cardC.json --out $O/plateC.png $G ;;
  3) $B -b -P blender/courtyard.py -- --layer drill --shot A --w $W --h $H --samples 24 --done 31 --poses "$PA" --grips $O/x.json --out $O/dA_%02d.png $G ;;
  4) $B -b -P blender/courtyard.py -- --layer drill --shot B --w $W --h $H --samples 24 --done 31 --poses "$PB" --grips $O/x.json --out $O/dB_%02d.png $G ;;
  5) $B -b -P blender/courtyard.py -- --layer drill --shot B --w $W --h $H --samples 24 --done 32 --poses "$PW" --grips $O/x.json --out $O/dW_%02d.png $G ;;
esac
ls $O/*.png | wc -l
if [ "$BR" != "-" ]; then git checkout -B "$BR" >/dev/null 2>&1; git add -f $O/plate*.png $O/d?_*.png 2>/dev/null || true; git commit -qm "Samulation #3 Blender test clip: part $PART renders" && for i in 1 2 3 4 5; do git push -u origin "$BR" && break; sleep $((2**i)); done; fi
echo "PART $PART DONE"
