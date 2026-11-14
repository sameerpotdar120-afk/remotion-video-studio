#!/bin/bash
# Samulation #3 mechanics test (drill -> fuse -> volley -> impacts), one machine's share of the 4K Blender renders.
#   bash blender/clip_job.sh <share 1-6> <push-branch|->
set -e; cd "$(dirname "$0")/.."; M=$1; BR=$2; W=${W:-2160}; H=${H:-3840}; O=review/clip4k; mkdir -p $O
B=${BLENDER:-/tmp/blender/blender-4.5.15-linux-x64/blender}
if [ ! -x $B ]; then mkdir -p /tmp/blender; for i in 1 2 3 4; do curl -sSL https://download.blender.org/release/Blender4.5/blender-4.5.15-linux-x64.tar.xz | tar -xJ -C /tmp/blender && break; sleep 5; done; fi
P16=$(python3 -c "print(','.join(f'{k*22.5}:0.012' for k in range(16)))"); P8=$(python3 -c "print(','.join(f'{-k*14}:{0.02+0.11*(k/7)**1.5:.4f}' for k in range(8)))")
R() { $B -b -P blender/nest2.py -- --w $W --h $H "$@" > $O/log_$(date +%s%N) 2>&1; }
case $M in
  1) R --shot D --samples 48 --grassn 2000 --grassw 90000 --done 31 --nodrill 1 --dposes "$P16" --out $O/D.png ;;
  2) R --shot DM --samples 48 --grassn 2000 --grassw 90000 --nodrill 1 --dposes "$P8" --out $O/DM.png
     R --shot DM --layer drill --samples 24 --grassn 2000 --grassw 2000 --dposes "$P8" --meta $O/DMx.json --out $O/dM_%02d.png ;;
  3) R --shot L --samples 48 --grassn 160000 --out $O/L.png ;;
  4) R --shot L --samples 48 --grassn 160000 --noarrows 1 --out $O/L0.png
     R --shot L --layer mask --grassn 1000 --out $O/Lmask.png ;;
  5) R --shot I --samples 48 --grassn 2000 --grassi 260000 --out $O/I.png ;;
  6) R --shot D --layer drill --samples 24 --grassn 2000 --grassw 2000 --done 31 --dposes "$P16" --meta $O/Dx.json --out $O/dD_%02d.png ;;
esac
ls $O/*.png | wc -l
if [ "$BR" != "-" ]; then git checkout -B "$BR" >/dev/null 2>&1; git add -f $O/*.png $O/*.json; git commit -qm "Samulation #3 mechanics test: Blender renders, share $M" && for i in 1 2 3 4 5; do git push -u origin "$BR" && break; sleep $((2**i)); done; fi
echo "SHARE $M DONE"
