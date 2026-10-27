#!/bin/bash
# 1080p60 sample of a frame range of Russia-4K (video only; the soundtrack is muxed later), pushed to
# branch sample/russia-<name> as renders/russia-sample/seg_FFFFF.mp4.
# usage: scripts/russia/render_sample.sh <first> <last> <name>
set -uo pipefail
A=$1; B=$2; NAME=$3
cd "$(dirname "$0")/../.."
[ -d node_modules ] || npm ci --no-audit --no-fund
CHROME=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1 || true)
BR=sample/russia-$NAME
git config user.email >/dev/null || git config user.email "render@local"
git config user.name >/dev/null || git config user.name "render worker"
git checkout -q -B "$BR"
mkdir -p renders/russia-sample
out=renders/russia-sample/seg_$(printf %05d $A).mp4
npx remotion render src/index.ts Russia-4K "$out" --frames=$A-$B --muted --scale=0.5 --crf=17 --concurrency=$(nproc) --timeout=300000 \
  --gl=swangle ${CHROME:+--browser-executable="$CHROME"} > /tmp/sample.log 2>&1 || { tail -20 /tmp/sample.log; echo "SAMPLE FAILED"; exit 1; }
git add -f "$out" && git commit -q -m "Russia 1080p sample $A-$B ($NAME)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
for t in 1 2 3 4 5; do git push -q -f -u origin "$BR" && break; sleep $((2 ** t)); done
echo "SAMPLE $NAME DONE"
