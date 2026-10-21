#!/bin/bash
# Render the soundtrack (VO + music + SFX) of one chunk of Final-4K as WAV and push it (small file) back to the repo.
# usage: scripts/render_audio_chunk.sh <chunk index 0-9>   -> branch render/audio-v2-chunk-XX, renders/audio/chunk_XX.wav
set -euo pipefail
i=$1; N=10; TOTAL=29520; STEP=$(( (TOTAL + N - 1) / N ))
a=$(( i * STEP )); b=$(( (i + 1) * STEP - 1 )); [ $b -ge $TOTAL ] && b=$(( TOTAL - 1 ))
id=$(printf %02d "$i")
cd "$(dirname "$0")/.."
[ -d node_modules ] || npm ci --no-audit --no-fund
CHROME=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
[ -x "$CHROME" ] || CHROME=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)
# the project config sets --crf, which audio codecs reject: use a minimal config for this pass
printf "import { Config } from '@remotion/cli/config';\nConfig.setOverwriteOutput(true);\n" > /tmp/audio.config.ts
mkdir -p renders/audio
npx remotion render src/index.ts Final-4K renders/audio/chunk_$id.wav --codec=wav --frames=$a-$b --scale=0.05 --concurrency=4 \
  --config=/tmp/audio.config.ts --gl=swangle --browser-executable="$CHROME"
git checkout -B render/audio-v2-chunk-$id
git add -f renders/audio/chunk_$id.wav
git commit -m "Audio render chunk $id (frames $a-$b)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
for t in 1 2 3 4; do git push -u origin render/audio-v2-chunk-$id && break; sleep $((2 ** t)); done
echo "PUSHED audio $id"
