#!/bin/bash
# One-link download: a GitHub Release asset may be at most 2 GiB, the 40 Mbit/s master is ~2.5 GB, so this builds a
# ~30 Mbit/s copy (same 3840x2160 60 fps), splits it into <95 MB parts on branch release/4k and pushes them; the
# workflow there (.github/workflows/release.yml) joins the parts and attaches the single MP4 to release v1.0.
# Pieces are re-encoded one by one as soon as scripts/assemble_final.sh has fetched them, so most of the work is
# done while the last segments still render. Resumable: run repeatedly until it prints RELEASED.
# usage: scripts/make_release.sh
set -uo pipefail
cd "$(dirname "$0")/.."
W=out/final/assemble; R=out/final/release; mkdir -p "$R/pieces"
NAME=America_Azaad_Kaise_Hua_4K60.mp4
ENC="-c:v libx264 -preset medium -b:v 30M -maxrate 38M -bufsize 60M -g 120 -pix_fmt yuv420p -an"
LIMIT=2000000000

# 1 · re-encode every piece that is already here (edge chunks and 240-frame segments)
pieces="$W/enc_00.mp4"
for ((a = 2952; a <= 26567; a += 240)); do pieces="$pieces $(printf "%s/seg/seg_%05d.mp4" "$W" $a)"; done
pieces="$pieces $W/enc_09.mp4"
done=0; n=0
for p in $pieces; do
  n=$((n + 1)); out="$R/pieces/$(basename "$p")"
  [ -s "$out" ] && { done=$((done + 1)); continue; }
  [ -s "$p" ] || continue
  ffmpeg -v error -y -i "$p" $ENC "$out.tmp.mp4" && mv "$out.tmp.mp4" "$out" && done=$((done + 1))
done
echo "RELEASE pieces $done/$n"
[ "$done" -eq "$n" ] && [ -s "$W/audio_full.wav" ] || exit 0

# 2 · join with the soundtrack and check
if [ ! -s "$R/$NAME" ]; then
  : > "$R/video.txt"; for p in $pieces; do echo "file 'pieces/$(basename "$p")'" >> "$R/video.txt"; done
  ffmpeg -v error -y -f concat -safe 0 -i "$R/video.txt" -i "$W/audio_full.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k \
    -movflags +faststart "$R/$NAME.tmp.mp4" && mv "$R/$NAME.tmp.mp4" "$R/$NAME"
fi
frames=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of default=nk=1:nw=1 "$R/$NAME")
size=$(stat -c %s "$R/$NAME")
echo "RELEASE file frames $frames/29520 · $size bytes"
[ "$frames" -eq 29520 ] && [ "$size" -lt "$LIMIT" ] || { echo "RELEASE CHECK FAILED"; exit 1; }

# 3 · parts on branch release/4k, pushed a few at a time, manifest last (that push starts the publish workflow)
T=out/final/relwt
if [ ! -d "$T/.git" ] && [ ! -f "$T/.git" ]; then
  git worktree prune; git fetch -q origin release/4k && git worktree add -q -f "$T" FETCH_HEAD && git -C "$T" checkout -q -B release/4k
fi
mkdir -p "$T/video"
[ -s "$R/parts.done" ] || { rm -f "$R"/part_*; split -b 90M -d -a 2 "$R/$NAME" "$R/part_" && touch "$R/parts.done"; }
for f in "$R"/part_*; do
  b=$(basename "$f")
  git -C "$T" ls-files --error-unmatch "video/$b" >/dev/null 2>&1 && continue
  cp "$f" "$T/video/$b" && git -C "$T" add "video/$b" && git -C "$T" commit -q -m "Video part $b" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  if [ $(( 10#${b#part_} % 4 )) -eq 3 ]; then for t in 1 2 3 4 5; do git -C "$T" push -q origin release/4k && break; sleep $((2 ** t)); done; fi
done
if [ ! -f "$T/video/manifest.txt" ]; then
  printf "%s\n%s\n" "$NAME" "$(sha256sum "$R/$NAME" | cut -d' ' -f1)" > "$T/video/manifest.txt"
  git -C "$T" add video/manifest.txt && git -C "$T" commit -q -m "Video manifest: publish the joined MP4" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
fi
for t in 1 2 3 4 5; do git -C "$T" push -q origin release/4k && break; sleep $((2 ** t)); done
[ "$(git -C "$T" rev-parse HEAD)" = "$(git ls-remote origin refs/heads/release/4k | cut -f1)" ] && echo "RELEASED"
