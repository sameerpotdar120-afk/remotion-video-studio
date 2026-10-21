#!/bin/bash
# Render one 4K60 chunk of Final-4K (video only) and push it back to the repo in <95 MB pieces.
# usage: scripts/render_chunk_4k.sh <chunk index 0-9>
# The pieces land on branch render/4k-chunk-XX under renders/4k/chunk_XX/ ; join them with:  cat chunk_XX.mp4.part_* > chunk_XX.mp4
set -euo pipefail
i=$1; N=10; TOTAL=29520; STEP=$(( (TOTAL + N - 1) / N ))
a=$(( i * STEP )); b=$(( (i + 1) * STEP - 1 )); [ $b -ge $TOTAL ] && b=$(( TOTAL - 1 ))
id=$(printf %02d "$i")
cd "$(dirname "$0")/.."
[ -d node_modules ] || npm ci --no-audit --no-fund
CHROME=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
[ -x "$CHROME" ] || CHROME=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)
mkdir -p renders/4k/chunk_$id
out=renders/4k/chunk_$id/chunk_$id.mp4
echo "chunk $id: frames $a-$b"
npx remotion render src/index.ts Final-4K "$out" --frames=$a-$b --muted --crf=18 --concurrency=4 --gl=swangle --browser-executable="$CHROME"
split -b 95m -d -a 2 "$out" "$out.part_" && rm "$out"
git checkout -B render/4k-chunk-$id
git add -f renders/4k/chunk_$id
git commit -m "4K render chunk $id (frames $a-$b)"
for t in 1 2 3 4; do git push -u origin render/4k-chunk-$id && break; sleep $((2 ** t)); done
echo "PUSHED chunk $id"
