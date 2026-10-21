#!/bin/bash
# Render the soundtrack of an arbitrary frame range of Final-4K as WAV (for an audio chunk too slow to finish in one
# 2-hour job: render it in halves and join them). Optional third argument pushes the WAV to render/audio-v2-part-<name>.
# usage: scripts/render_audio_range.sh <first frame> <last frame> [name]   -> renders/audio/part_<first>.wav
set -euo pipefail
a=$1; b=$2; NAME=${3:-}
cd "$(dirname "$0")/.."
[ -d node_modules ] || npm ci --no-audit --no-fund
CHROME=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
[ -x "$CHROME" ] || CHROME=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)
printf "import { Config } from '@remotion/cli/config';\nConfig.setOverwriteOutput(true);\n" > /tmp/audio.config.ts
mkdir -p renders/audio
out=renders/audio/part_$a.wav
npx remotion render src/index.ts Final-4K "$out" --codec=wav --frames=$a-$b --scale=0.05 --concurrency=4 --timeout=240000 \
  --config=/tmp/audio.config.ts --gl=swangle --browser-executable="$CHROME"
echo "RENDERED $out"
[ -n "$NAME" ] || exit 0
git checkout -B render/audio-v2-part-$NAME
git add -f "$out"
git commit -m "Audio render frames $a-$b" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
for t in 1 2 3 4; do git push -u origin render/audio-v2-part-$NAME && break; sleep $((2 ** t)); done
echo "PUSHED audio part $NAME"
