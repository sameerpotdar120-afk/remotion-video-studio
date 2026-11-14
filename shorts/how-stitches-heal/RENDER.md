# How Stitches Heal (2K, 30 fps)

One continuous three.js shot, rendered frame-exact in headless Chrome.

```bash
SOFTWARE_GL=1 FPS=30 node tools/capture.mjs check                              # boot + sanity
SOFTWARE_GL=1 FPS=30 node tools/capture.mjs frames review/f "0.6,14.8,23.4"     # stills
SOFTWARE_GL=1 FPS=30 node tools/capture.mjs video renders/part_0.mp4 0 10       # a chunk (start end, seconds)
```
Chunks: 0-10, 10-20, 20-29.806. Output is 1440x2560. The voiceover/mix is not in the repo; audio is muxed afterwards.
If Chrome is not at /usr/bin/google-chrome, set CHROME=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome.
