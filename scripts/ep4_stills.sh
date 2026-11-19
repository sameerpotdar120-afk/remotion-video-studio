#!/bin/bash
# Mountain Cabin: bundle once, render stills of composition $1 at the given frames (4 at a time), then a contact sheet.
# usage: scripts/ep4_stills.sh Ep4Part1 out_dir frame1 frame2 ...
set -e
cd "$(dirname "$0")/.."
C=$1; O=$2; shift 2; mkdir -p $O
npx remotion bundle src/index.ts --out-dir=out/bundle4 --log=error >/dev/null
i=0; for f in "$@"; do
  npx remotion still out/bundle4 $C $O/f$(printf %04d $f).png --frame=$f --timeout=300000 --log=error &
  i=$((i+1)); if [ $((i % 4)) -eq 0 ]; then wait; fi
done; wait
