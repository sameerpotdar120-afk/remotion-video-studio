#!/usr/bin/env bash
set -euo pipefail

# Rebuild only transparency from the original green-screen footage.
# The prior graded RGB stream contains the full recorded body, but its alpha
# used a hard silhouette mask that clipped the sleeves. No spatial mask is used
# here: green-channel dominance removes the screen while keeping blue clothing.
# Both streams are reset to the first source frame; timing remains 24 fps, 1x.
raw_source=${1:?Pass the original green-screen video}
graded_source=${2:?Pass the existing full-frame graded VP9 video}
output_path=${3:?Pass a new output WebM path}

ffmpeg -hide_banner -nostdin -n \
  -i "$raw_source" \
  -c:v vp9 -i "$graded_source" \
  -filter_complex_threads 4 \
  -filter_complex "[0:v]setpts=PTS-STARTPTS,scale=864:1536:flags=lanczos,format=gbrap,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*(1-clip((g(X,Y)-max(r(X,Y),b(X,Y))-2)/12,0,1))',alphaextract[matte];[1:v]setpts=PTS-STARTPTS,format=rgb24[rgb];[rgb][matte]alphamerge,format=yuva420p[out]" \
  -map '[out]' -an -c:v libvpx-vp9 -pix_fmt yuva420p \
  -b:v 0 -crf 20 -deadline realtime -cpu-used 5 -row-mt 1 \
  -threads 4 -auto-alt-ref 0 -g 48 -r 24 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  "$output_path"
