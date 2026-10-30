#!/bin/bash
# One-link delivery of the Horse short: joins the 4K segments from the helper branches render/horse-4k-* (made by
# scripts/horse/render_4k.sh; a redo branch render/horse-4k-x* wins), muxes public/horse/audio.wav as AAC,
# checks frames/duration, splits into <95 MB parts on branch release/horse-4k and pushes them; the workflow on that
# branch joins the parts and attaches the single MP4 to release horse-v1.  Resumable: rerun until it prints RELEASED.
set -uo pipefail
cd "$(dirname "$0")/../.."
REPO=$PWD; R=out/horse/release; mkdir -p "$R"
NAME=The_Old_Man_Who_Lost_His_Horse_4K60.mp4; FRAMES=3680; BR=release/horse-4k; CO="Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
if [ ! -s "$R/parts.done" ] && [ ! -s "$R/$NAME" ]; then
  C=$R/clone; rm -rf "$C"
  git clone -q --filter=blob:none --no-checkout "$(git remote get-url origin)" "$C" || exit 1
  REFS=$(git ls-remote origin 'refs/heads/render/horse-4k-*' | awk '{print $2}')
  for ref in $REFS; do git -C "$C" fetch -q --filter=blob:none origin "+$ref:refs/d/${ref##*/}"; done
  ORDER="$(echo "$REFS" | grep -v -- '-x[0-9]*$') $(echo "$REFS" | grep -- '-x[0-9]*$')"
  : > "$R/list.txt"; miss=0; mkdir -p "$R/pieces"
  for ((a = 0; a < FRAMES; a += 300)); do
    s=seg_$(printf %05d $a).mp4; src=""
    for r in $ORDER; do [ -n "$(git -C "$C" ls-tree "refs/d/${r##*/}" "renders/horse-4k/$s")" ] && src=${r##*/}; done
    [ -n "$src" ] || { echo "MISSING piece $s"; miss=1; continue; }
    [ -s "$R/pieces/$s" ] || git -C "$C" show "refs/d/$src:renders/horse-4k/$s" > "$R/pieces/$s"
    echo "file 'pieces/$s'" >> "$R/list.txt"
  done
  rm -rf "$C"
  [ $miss -eq 0 ] || { echo "RELEASE waiting for pieces"; exit 1; }
  ffmpeg -v error -y -f concat -safe 0 -i "$R/list.txt" -i public/horse/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k \
    -shortest -movflags +faststart "$R/$NAME.tmp.mp4" && mv "$R/$NAME.tmp.mp4" "$R/$NAME" || exit 1
  frames=$(ffprobe -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of default=nk=1:nw=1 "$R/$NAME")
  echo "RELEASE file: frames $frames/$FRAMES · $(stat -c %s "$R/$NAME") bytes"
  [ "$frames" -eq $FRAMES ] || { echo "RELEASE CHECK FAILED"; mv "$R/$NAME" "$R/$NAME.failed"; exit 1; }
  rm -rf "$R/pieces"
fi
T=$R/wt
if [ ! -e "$T/.git" ]; then
  git worktree prune
  if git fetch -q origin "+$BR:refs/rel/horse" 2>/dev/null; then git worktree add -q -f -B "$BR" "$T" refs/rel/horse
  else
    git worktree add -q --detach "$T" && (cd "$T" && git checkout -q --orphan "$BR" && git rm -rfq . && mkdir -p .github/workflows \
      && cp "$REPO/scripts/horse/release_workflow.yml" .github/workflows/publish.yml && git add .github \
      && git commit -q -m "Publish workflow for the Horse short" -m "$CO")
  fi
fi
if [ ! -s "$R/parts.done" ]; then
  sha256sum "$R/$NAME" | cut -d' ' -f1 > "$R/sha.txt"
  if [ -f "$T/video/manifest.txt" ]; then (cd "$T" && git rm -q video/manifest.txt && git commit -q -m "Video manifest removed: new version uploading" -m "$CO"); fi
  mkdir -p "$T/video"; rm -f "$T"/video/part_*
  split -b 90M -d -a 2 "$R/$NAME" "$T/video/part_" && echo ok > "$R/parts.done" && cp "$R/$NAME" "$R/last_$NAME" && rm -f "$R/$NAME"
fi
cd "$T"
for f in video/part_*; do
  git ls-files --error-unmatch "$f" >/dev/null 2>&1 && git diff --quiet HEAD -- "$f" && continue
  git add "$f" && git commit -q -m "Video $(basename "$f")" -m "$CO"
  for t in 1 2 3 4 5; do git push -q origin "HEAD:$BR" && break; sleep $((2 ** t)); done
done
for f in $(git ls-files 'video/part_*'); do [ -e "$f" ] || { git rm -q "$f" && git commit -q -m "Remove stale $(basename "$f")" -m "$CO"; }; done
if [ ! -f video/manifest.txt ]; then
  printf "%s\n%s\n" "$NAME" "$(cat "$REPO/$R/sha.txt")" > video/manifest.txt
  git add video/manifest.txt && git commit -q -m "Video manifest: publish the joined MP4" -m "$CO"
fi
for t in 1 2 3 4 5; do git push -q origin "HEAD:$BR" && break; sleep $((2 ** t)); done
[ "$(git rev-parse HEAD)" = "$(git ls-remote origin "refs/heads/$BR" | cut -f1)" ] && echo "RELEASED"
