#!/bin/bash
# usage: still.sh FRAME OUT.png   (run from repo root)
cd /home/user/remotion-video-studio && npx remotion still src/index.ts Tree3 "$2" --frame "$1" --gl=swangle --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell --log=error 2>&1 | grep -v "memory\|Memory\|docker\|lower amount" 
