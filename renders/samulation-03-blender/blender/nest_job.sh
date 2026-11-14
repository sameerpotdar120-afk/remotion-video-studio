#!/bin/bash
# Samulation #3 Blender renders, one machine's share.  bash blender/nest_job.sh <machine 1-6> <push-branch|->  [W H]
# Machine shares (balanced by measured cost): plates P1..P12 (4K, 48 spp), cart wheel poses (12), arrow slide poses (12).
set -e; cd "$(dirname "$0")/.."; M=$1; BR=$2; W=2160; H=3840; O=review/nest4k; mkdir -p $O; G="--grassn 160000"
B=${BLENDER:-/tmp/blender/blender-4.5.15-linux-x64/blender}
if [ ! -x $B ]; then mkdir -p /tmp/blender; for i in 1 2 3 4; do curl -sSL https://download.blender.org/release/Blender4.5/blender-4.5.15-linux-x64.tar.xz | tar -xJ -C /tmp/blender && break; sleep 5; done; fi
plate() { $B -b -P blender/nest.py -- --shot $1 --w $W --h $H --samples ${3:-48} $G ${2:-} --out $O/$1.png > $O/log_$1 2>&1; echo "$1 $(grep -c WROTE $O/log_$1)"; }
CP=$(python3 -c "print(','.join(str(k*3) for k in range(12)))"); AP=$(python3 -c "print(','.join(f'{0.38*k/11:.4f}' for k in range(12)))")
case $M in
  1) plate P1; plate P2 ;;
  2) plate P3; plate P4 ;;
  3) plate P5 "--nocart 1"; plate P6; $B -b -P blender/nest.py -- --shot P6 --layer arrow --poses "$AP" --w $W --h $H --samples 24 $G --meta $O/arrowmeta.json --out $O/arrow_%02d.png > $O/log_arrow 2>&1 ;;
  4) plate P7; plate P8 ;;
  5) plate P9; plate P10 ;;
  6) plate P11; plate P12; $B -b -P blender/nest.py -- --shot P5 --layer cart --poses "$CP" --w $W --h $H --samples 24 $G --meta $O/cartmeta.json --out $O/cart_%02d.png > $O/log_cart 2>&1 ;;
  9) $B -b -P blender/nest.py -- --shot P5 --layer cart --poses "$CP" --w $W --h $H --samples 24 $G --meta $O/cartmeta.json --out $O/cart_%02d.png > $O/log_cart 2>&1 ;;
  10) I0=$3; I1=$4; QS=$(python3 -c "print(','.join(f'{0.38*k/11:.4f}' for k in range($I0, $I1)))"); $B -b -P blender/nest.py -- --shot P6 --layer arrow --poses "$QS" --k0 $I0 --w 2160 --h 3840 --samples 12 $G --meta $O/arrowmeta_$I0.json --out $O/arrow_%02d.png > $O/log_arrow_$I0 2>&1 ;;
  7) plate P7 ;;
  8) plate P9 ;;
esac
ls $O/*.png | wc -l
if [ "$BR" != "-" ]; then git checkout -B "$BR" >/dev/null 2>&1; git add -f $O/*.png $O/*.json; git commit -qm "Samulation #3: Blender renders, machine $M" && for i in 1 2 3 4 5; do git push -u origin "$BR" && break; sleep $((2**i)); done; fi
echo "MACHINE $M DONE"
