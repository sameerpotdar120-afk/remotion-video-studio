#!/bin/bash
# Review stills of Russia-4K every <step> frames in [first, last] at 1/3 scale (1280×720 JPG), pushed to branch
# review/russia-<name> as renders/russia-review/fFFFFF.jpg.
# usage: scripts/russia/review_stills.sh <first> <last> <step> <name>
set -uo pipefail
FIRST=$1; LAST=$2; STEP=$3; NAME=$4
cd "$(dirname "$0")/../.."
[ -d node_modules ] || npm ci --no-audit --no-fund
BR=review/russia-$NAME
git config user.email >/dev/null || git config user.email "render@local"
git config user.name >/dev/null || git config user.name "render worker"
git checkout -q -B "$BR"
frames=$(seq $FIRST $STEP $LAST | tr '\n' ' ')
mkdir -p renders/russia-review
node scripts/russia/stills.mjs renders/russia-review 0.3333 $frames || { echo "STILLS FAILED"; exit 1; }
rm -rf /tmp/remotion-webpack-bundle-*
git add -f renders/russia-review && git commit -q -m "Russia review stills $FIRST-$LAST ($NAME)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
for t in 1 2 3 4 5; do git push -q -f -u origin "$BR" && break; sleep $((2 ** t)); done
echo "REVIEW $NAME DONE"
