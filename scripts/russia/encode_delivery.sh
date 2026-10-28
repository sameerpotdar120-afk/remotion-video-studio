#!/bin/bash
# Resumable delivery encode of the final 4K60 render: for every 600-frame segment in [first, last] it takes
# seg_NNNNN.mp4 from the render branches (a redo branch render/russia-4k-x* wins over the main pass), re-encodes it
# to HEVC at ~10.5 Mbit/s (the whole 24:52 video then stays under GitHub's 2 GiB release-asset limit) with identical
# settings and closed GOPs, so all pieces join by stream copy, and pushes each piece to delivery/russia-hevc-<name>.
# Only the trees of the render branches are fetched; each segment's video blob is fetched on demand.
# usage: scripts/russia/encode_delivery.sh <first> <last> <name>      (NOPUSH=1 to test without pushing)
set -uo pipefail
FIRST=$1; LAST=$2; NAME=$3; SEG=600
cd "$(dirname "$0")/../.."
REPO=$PWD; BR=delivery/russia-hevc-$NAME; T=/tmp/enc-$NAME; WT=$T/wt
mkdir -p "$T"
git config remote.origin.promisor true; git config remote.origin.partialclonefilter blob:none
git config transfer.unpackLimit 100000
REFS=$(git ls-remote origin 'refs/heads/render/russia-4k-*' | awk '{print $2}')
for ref in $REFS; do git fetch -q --filter=blob:none origin "+$ref:refs/enc/${ref##*/}"; done
# redo branches last, so their copy of a segment overrides
ORDER="$(echo "$REFS" | grep -v -- '-x[0-9]*$') $(echo "$REFS" | grep -- '-x[0-9]*$')"

# the pieces live in their own worktree on the delivery branch
if [ ! -d "$WT" ]; then
  git worktree prune
  if git fetch -q origin "+$BR:refs/enc/out-$NAME" 2>/dev/null; then git worktree add -q -f -B "$BR" "$WT" "refs/enc/out-$NAME"
  else git worktree add -q --detach "$WT" && (cd "$WT" && git checkout -q --orphan "$BR" && git rm -rfq .); fi
fi
cd "$WT"; mkdir -p delivery
git config user.email >/dev/null || git config user.email "render@local"
git config user.name >/dev/null || git config user.name "render worker"

for ((a = FIRST; a <= LAST; a += SEG)); do
  s=seg_$(printf %05d $a).mp4
  [ -s "delivery/$s" ] && { echo "SKIP $a"; continue; }
  src=""
  for ref in $ORDER; do
    [ -n "$(git ls-tree "refs/enc/${ref##*/}" "renders/russia-4k/$s")" ] && src=${ref##*/}
  done
  [ -n "$src" ] || { echo "MISSING $a"; continue; }
  git show "refs/enc/$src:renders/russia-4k/$s" > "$T/in.mp4" || { echo "FETCH FAILED $a"; continue; }
  ffmpeg -v error -y -i "$T/in.mp4" -c:v libx265 -preset medium -b:v 10500k -maxrate 15000k -bufsize 30000k \
    -x265-params "keyint=120:min-keyint=120:no-open-gop=1:scenecut=0:log-level=error" -pix_fmt yuv420p -tag:v hvc1 -an \
    "$T/out.mp4" || { echo "ENCODE FAILED $a"; continue; }
  mv "$T/out.mp4" "delivery/$s"; rm -f "$T/in.mp4"
  git add "delivery/$s" && git commit -qm "delivery $s (from $src)"
  [ "${NOPUSH:-}" = 1 ] || for t in 1 2 3 4; do git push -q origin "HEAD:$BR" && break; sleep $((2 ** t)); done
  echo "DONE $a from $src ($(du -m "delivery/$s" | cut -f1) MB)"
done
n=0; m=0
for ((a = FIRST; a <= LAST; a += SEG)); do m=$((m + 1)); [ -s "delivery/seg_$(printf %05d $a).mp4" ] && n=$((n + 1)); done
[ $n -eq $m ] && echo "WORKER $NAME DONE" || echo "WORKER $NAME $n/$m"
