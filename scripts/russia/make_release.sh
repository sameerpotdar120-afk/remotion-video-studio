#!/bin/bash
# One-link delivery of the Russia video: joins the 150 HEVC pieces from delivery/russia-hevc-* (encoded by
# scripts/russia/encode_delivery.sh) with renders/russia-audio/soundtrack.m4a, checks frame count, duration and size
# (< 2 GiB, GitHub's release-asset limit), splits the MP4 into <95 MB parts on branch release/russia-4k and pushes
# them; the workflow on that branch joins the parts and attaches the single MP4 to release russia-v1.
# Disk-frugal: pieces come through a throwaway blobless clone and every intermediate is deleted once used.
# Resumable: run repeatedly until it prints RELEASED.
# usage: scripts/russia/make_release.sh
set -uo pipefail
cd "$(dirname "$0")/../.."
REPO=$PWD; R=out/russia/release; mkdir -p "$R"
NAME=Russia_Ki_Kahani_4K60.mp4
FRAMES=89542; LIMIT=2000000000; BR=release/russia-4k
AUDIO=renders/russia-audio/soundtrack.m4a
[ -s "$AUDIO" ] || { echo "no soundtrack yet ($AUDIO)"; exit 1; }

# 1 · the joined, checked MP4 (kept only until its parts exist)
if [ ! -s "$R/parts.done" ] && [ ! -s "$R/$NAME" ]; then
  C=$R/clone; rm -rf "$C"
  git clone -q --filter=blob:none --no-checkout "$(git remote get-url origin)" "$C" || exit 1
  : > "$R/list.txt"; miss=0
  for ref in $(git ls-remote origin 'refs/heads/delivery/russia-hevc-*' | awk '{print $2}'); do
    git -C "$C" fetch -q --filter=blob:none origin "+$ref:refs/d/${ref##*/}"
  done
  for ((a = 0; a <= FRAMES - 1; a += 600)); do
    s=seg_$(printf %05d $a).mp4; src=""
    for r in $(git -C "$C" for-each-ref --format='%(refname)' refs/d/); do
      [ -n "$(git -C "$C" ls-tree "$r" "delivery/$s")" ] && src=$r
    done
    [ -n "$src" ] || { echo "MISSING piece $s"; miss=1; continue; }
    [ -s "$R/pieces/$s" ] || { mkdir -p "$R/pieces"; git -C "$C" show "$src:delivery/$s" > "$R/pieces/$s"; }
    echo "file 'pieces/$s'" >> "$R/list.txt"
  done
  rm -rf "$C"
  [ $miss -eq 0 ] || { echo "RELEASE waiting for pieces"; exit 1; }
  python3 -I scripts/russia/scan_bands.py "$R/pieces" | tee "$R/bands.txt" | tail -3
  grep -q "^BANDS 0$" "$R/bands.txt" || [ "${ALLOW_BANDS:-}" = 1 ] || { echo "RELEASE stopped: black bands found (see $R/bands.txt)"; exit 1; }
  ffmpeg -v error -y -f concat -safe 0 -i "$R/list.txt" -i "$AUDIO" -map 0:v -map 1:a -c:v copy -tag:v hvc1 -c:a copy \
    -movflags +faststart "$R/$NAME.tmp.mp4" && mv "$R/$NAME.tmp.mp4" "$R/$NAME" || exit 1
  frames=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of default=nk=1:nw=1 "$R/$NAME")
  vdur=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "$R/$NAME")
  adur=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 "$R/$NAME")
  size=$(stat -c %s "$R/$NAME")
  echo "RELEASE file: frames $frames/$FRAMES · video ${vdur}s · audio ${adur}s · $size bytes"
  [ "$frames" -eq $FRAMES ] && [ "$size" -lt $LIMIT ] || { echo "RELEASE CHECK FAILED"; mv "$R/$NAME" "$R/$NAME.failed"; exit 1; }
  rm -rf "$R/pieces"
fi

# 2 · parts straight into a worktree of the release branch, manifest last (that push starts the publish workflow)
T=$R/wt
if [ ! -e "$T/.git" ]; then
  git worktree prune
  if git fetch -q origin "+$BR:refs/rel/russia" 2>/dev/null; then git worktree add -q -f -B "$BR" "$T" refs/rel/russia
  else
    git worktree add -q --detach "$T" && (cd "$T" && git checkout -q --orphan "$BR" && git rm -rfq . && mkdir -p .github/workflows \
      && cp "$REPO/scripts/russia/release_workflow.yml" .github/workflows/publish.yml && git add .github \
      && git commit -q -m "Publish workflow for the Russia video" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>")
  fi
fi
if [ ! -s "$R/parts.done" ]; then
  sha256sum "$R/$NAME" | cut -d' ' -f1 > "$R/sha.txt"
  mkdir -p "$T/video"; rm -f "$T"/video/part_*
  split -b 90M -d -a 2 "$R/$NAME" "$T/video/part_" && echo ok > "$R/parts.done" && rm -f "$R/$NAME"
fi
cd "$T"
for f in video/part_*; do
  git ls-files --error-unmatch "$f" >/dev/null 2>&1 && continue
  git add "$f" && git commit -q -m "Video $(basename "$f")" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  n=$(basename "$f"); if [ $(( 10#${n#part_} % 4 )) -eq 3 ]; then for t in 1 2 3 4 5; do git push -q origin "HEAD:$BR" && break; sleep $((2 ** t)); done; fi
done
if [ ! -f video/manifest.txt ]; then
  printf "%s\n%s\n" "$NAME" "$(cat "$REPO/$R/sha.txt")" > video/manifest.txt
  git add video/manifest.txt && git commit -q -m "Video manifest: publish the joined MP4" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
fi
for t in 1 2 3 4 5; do git push -q origin "HEAD:$BR" && break; sleep $((2 ** t)); done
[ "$(git rev-parse HEAD)" = "$(git ls-remote origin "refs/heads/$BR" | cut -f1)" ] && echo "RELEASED"
