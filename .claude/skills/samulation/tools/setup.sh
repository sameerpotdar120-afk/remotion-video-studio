#!/bin/bash
# One-time environment check / install for Samulation Shorts. Run from anywhere: bash tools/setup.sh
# Needs: Node 22+ (headless capture), Google Chrome or Chromium, ffmpeg + ffprobe, Python 3.10+ with numpy, pillow, faster-whisper.
# Prints OK / MISSING per item and installs the Python packages. Does NOT install system packages without asking (prints the command).
ok() { printf "  OK       %s\n" "$1"; } ; miss() { printf "  MISSING  %s  ->  %s\n" "$1" "$2"; MISSING=1; }
MISSING=0; echo "Samulation Shorts setup check"
if command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ]; then ok "node $(node -v)"; else miss "Node 22+" "https://nodejs.org (or: nvm install 22)"; fi
CH=""; for c in "$CHROME" /usr/bin/google-chrome /usr/bin/google-chrome-stable /usr/bin/chromium /usr/bin/chromium-browser /snap/bin/chromium /opt/pw-browsers/chromium \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "C:/Program Files/Google/Chrome/Application/chrome.exe"; do [ -n "$c" ] && [ -e "$c" ] && CH="$c" && break; done
[ -z "$CH" ] && CH=$(ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome 2>/dev/null | head -1)
if [ -n "$CH" ]; then ok "chrome: $CH  (export CHROME=\"$CH\" if capture can't find it)"; else miss "Chrome/Chromium" "install Google Chrome, or set CHROME=/path/to/chrome"; fi
command -v ffmpeg >/dev/null && ok "$(ffmpeg -version | head -1 | cut -c1-40)" || miss "ffmpeg" "apt install ffmpeg | brew install ffmpeg | winget install ffmpeg"
command -v python3 >/dev/null && ok "$(python3 --version)" || miss "python3" "https://python.org"
python3 -m pip install --quiet --upgrade numpy pillow faster-whisper 2>/dev/null || python3 -m pip install --quiet --break-system-packages numpy pillow faster-whisper 2>/dev/null
python3 -c "import numpy, PIL, faster_whisper" 2>/dev/null && ok "python packages: numpy, pillow, faster-whisper" || miss "python packages" "pip install numpy pillow faster-whisper"
fc-list 2>/dev/null | grep -qi "IPAGothic\|Noto Sans CJK" && ok "Japanese/CJK font (optional, for Japanese signs)" || echo "  optional Japanese font not found (only needed for Japanese signage): apt install fonts-ipafont-gothic"
[ $MISSING = 0 ] && echo "All set." || { echo "Fix the MISSING items, then run this again."; exit 1; }
