#!/bin/bash
# Soundtrack of a frame range of Russia-4K (VO + score + every SFX) as WAV, frames rendered at 5 % scale.
# usage: scripts/russia/render_audio.sh <first> <last>   -> renders/russia-audio/part_<first>.wav
set -euo pipefail
a=$1; b=$2
cd "$(dirname "$0")/../.."
CHROME=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)
printf "import { Config } from '@remotion/cli/config';\nConfig.setOverwriteOutput(true);\n" > /tmp/audio.config.ts
mkdir -p renders/russia-audio
npx remotion render src/index.ts Russia-Audio renders/russia-audio/part_$a.wav --codec=wav --frames=$a-$b --scale=0.25 --concurrency=4 \
  --timeout=240000 --config=/tmp/audio.config.ts --gl=swangle --browser-executable="$CHROME"
echo "RENDERED part_$a"
