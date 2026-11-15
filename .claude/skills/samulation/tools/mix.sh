#!/bin/bash
# Voice-led mix: SFX (and optional music) ducked under the voice, then loudness-normalised for streaming.
# usage: bash mix.sh vo.wav sfx.wav [music.wav|-] out.wav [video_seconds]
#   -14 LUFS integrated, -1 dBTP true peak. Music sits ~20 dB under the voice before ducking.
set -e
VO=$1; FX=$2; MU=${3:--}; OUT=$4; DUR=${5:-}
T=(); PAD=""; [ -n "$DUR" ] && T=(-t "$DUR") && PAD="apad,"
if [ "$MU" != "-" ]; then
  ffmpeg -nostdin -v error -y -i "$VO" -i "$FX" -i "$MU" -filter_complex \
  "[1:a]volume=0.55[fx];[2:a]volume=0.10[mu];[fx][mu]amix=inputs=2:normalize=0[bed];[0:a]asplit=2[vo][sc];\
[bed][sc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[duck];\
[vo][duck]amix=inputs=2:normalize=0,${PAD}loudnorm=I=-14:TP=-1.0:LRA=9[out]" -map "[out]" -ar 48000 -ac 2 "${T[@]}" "$OUT"
else
  ffmpeg -nostdin -v error -y -i "$VO" -i "$FX" -filter_complex \
  "[1:a]volume=0.55[fx];[0:a]asplit=2[vo][sc];[fx][sc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[duck];\
[vo][duck]amix=inputs=2:normalize=0,${PAD}loudnorm=I=-14:TP=-1.0:LRA=9[out]" -map "[out]" -ar 48000 -ac 2 "${T[@]}" "$OUT"
fi
ffmpeg -nostdin -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
