#!/bin/bash
# Side-by-side check against a reference video: reference on the left, ours on the right, one row per time.
# usage (from the project folder): bash compare.sh <reference.mp4> <out.jpg> "1.2,4.8,9.0"
# Renders our frames with tools/capture.mjs, grabs the same times from the reference, stacks the pairs.
set -e
REF="$1"; OUT="$2"; TIMES="${3:-1,3,5}"
TMP=$(mktemp -d)
timeout 600 node tools/capture.mjs frames "$TMP/ours" "$TIMES" >/dev/null
rows=(); i=0; args=()
for t in ${TIMES//,/ }; do
  ffmpeg -loglevel error -y -ss "$t" -i "$REF" -map 0:v:0 -frames:v 1 -vf scale=540:960 "$TMP/r$i.png"
  ffmpeg -loglevel error -y -i "$TMP/ours/t$(printf %.2f "$t").jpg" -vf scale=540:960 "$TMP/o$i.png"
  ffmpeg -loglevel error -y -i "$TMP/r$i.png" -i "$TMP/o$i.png" -filter_complex hstack "$TMP/p$i.png"
  args+=(-i "$TMP/p$i.png"); i=$((i+1))
done
if [ $i -gt 1 ]; then ffmpeg -loglevel error -y "${args[@]}" -filter_complex "vstack=$i" -q:v 3 "$OUT"; else cp "$TMP/p0.png" "$OUT"; fi
echo "$OUT"
