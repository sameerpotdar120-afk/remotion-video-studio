#!/bin/bash
# Stickman3D render worker - safe to run many at once, on one machine or many.
# Renders frames <first>..<last> of a composition in <seg>-frame pieces (default 150) at full resolution, re-encodes each
# piece to the delivery format (60 Mbit/s H.264, GOP 120, video only, so pieces join by stream copy) and pushes it at once
# to branch render/<slug>-<name>. Resumable: a rerun skips pieces already on that branch.
# Isolation (lesson from the horse render): every worker gets its OWN git worktree, OWN temp dir and OWN branch, so
# parallel workers never share /tmp files or switch each other's checkout.
# usage: scripts/stickman3d/render_4k.sh <CompositionId> <slug> <first> <last> <name> [seg]
#   e.g. scripts/stickman3d/render_4k.sh Horse-4K horse 0 3679 w1
set -uo pipefail
COMP=$1; SLUG=$2; FIRST=$3; LAST=$4; NAME=$5; SEG=${6:-150}
REPO=$(cd "$(dirname "$0")/../.." && pwd)
SRC_REV=$(git -C "$REPO" rev-parse HEAD)
BR=render/$SLUG-$NAME
WT=$REPO/../stickman3d-workers/$SLUG-$NAME; TMP=$(mktemp -d /tmp/s3d-$SLUG-$NAME-XXXX)
trap 'rm -rf "$TMP"' EXIT
[ -d "$REPO/node_modules" ] || (cd "$REPO" && npm ci --no-audit --no-fund)
CHROME=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1 || true)
CONC=${CONC:-$(nproc)}
git -C "$REPO" config user.email >/dev/null || git -C "$REPO" config user.email "render@local"
git -C "$REPO" config user.name >/dev/null || git -C "$REPO" config user.name "render worker"
# own worktree on the source revision; the pieces live on an orphan-free branch that starts from it
if [ ! -d "$WT/.git" ] && [ ! -f "$WT/.git" ]; then
  mkdir -p "$(dirname "$WT")"; git -C "$REPO" worktree prune
  git -C "$REPO" worktree add -q --detach "$WT" "$SRC_REV" || exit 1
  ln -sfn "$REPO/node_modules" "$WT/node_modules"
fi
cd "$WT"
if git fetch -q origin "$BR" 2>/dev/null; then git checkout -q -f -B "$BR" FETCH_HEAD; else git checkout -q -f -B "$BR" "$SRC_REV"; fi
git checkout -q "$SRC_REV" -- src public scripts 2>/dev/null   # always render the requested source revision
mkdir -p "renders/$SLUG"
for ((a = FIRST; a <= LAST; a += SEG)); do
  b=$((a + SEG - 1)); [ $b -gt $LAST ] && b=$LAST
  out=renders/$SLUG/seg_$(printf %05d $a).mp4
  [ -s "$out" ] && { echo "SKIP $a"; continue; }
  for try in 1 2 3; do
    npx remotion render src/index.ts "$COMP" "$TMP/raw.mp4" --frames=$a-$b --muted --crf=16 --concurrency=$CONC --timeout=300000 \
      --gl=swangle ${CHROME:+--browser-executable="$CHROME"} > "$TMP/render.log" 2>&1 && break
    echo "retry $a ($try)"; tail -3 "$TMP/render.log"
  done
  [ -s "$TMP/raw.mp4" ] || { echo "FAILED $a"; exit 1; }
  ffmpeg -v error -y -i "$TMP/raw.mp4" -c:v libx264 -preset medium -b:v 60M -maxrate 75M -bufsize 120M -g 120 -pix_fmt yuv420p -an "$out"
  rm -f "$TMP/raw.mp4"
  git add -f "$out" && git commit -q -m "$COMP piece $a-$b ($NAME)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  for t in 1 2 3 4 5; do git push -q -u origin "$BR" && break; sleep $((2 ** t)); done
  echo "SEGMENT $a-$b pushed"
done
echo "WORKER $NAME DONE"
