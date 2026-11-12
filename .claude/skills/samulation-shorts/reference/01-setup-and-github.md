# 01: Setup, GitHub, and where everything lives

## 1. Machine setup (once)
```bash
bash SKILL/tools/setup.sh      # checks Node 22+, Chrome/Chromium, ffmpeg, Python 3.10+, installs numpy pillow faster-whisper -> "All set."
```
- Without a GPU (cloud sandbox, most laptops in software mode) every capture command needs `SOFTWARE_GL=1`.
  With a GPU, drop it: rendering is several times faster.
- If capture can't find Chrome: `export CHROME=/path/to/chrome`. Windows: run the `.sh` tools in Git Bash or WSL.
- faster-whisper downloads `small.en` (~0.5 GB) on first use; behind a proxy set `HF_HUB_DISABLE_XET=1`.
- Fonts ship in `engine/fonts/` (Montserrat 800/900, Fredoka 700, Caladea Bold: all OFL). Japanese signage needs IPAGothic
  (`apt install fonts-ipafont-gothic`), only if a video uses Japanese text.

## 2. GitHub repository
- Repo: **`sameerpotdar120-afk/remotion-video-studio`** (private). Working branch: `claude/sharp-shannon-ylvoxe`.
- In the repo: `.claude/skills/` holds `neon-bean-3d` (the house style), `yt-*` (YouTube agent skills), `ink-toon`, `zack-style-3d-short`.
  This `samulation-shorts` package is the complete superset: install it once and you have everything.
```bash
git clone https://github.com/sameerpotdar120-afk/remotion-video-studio.git && cd remotion-video-studio
git checkout claude/sharp-shannon-ylvoxe
```
- Commit per video: the project's `src/*.js` and `data/words.json`/`cues.json` (small). **Never commit**: reference videos, reference
  audio, the creator's raw VO if they don't want it public, renders (`*.mp4`), `review/`. Use git only for code and small data.
- Commit message format used on this repo (keep the trailer lines the user's tools add).
- Never open a pull request unless asked. Never push to `main` directly.

## 3. Installing this skill in each agent
- **Google Antigravity:** put the folder at `<workspace>/.agent/skills/samulation-shorts/` (workspace skill), or in your global
  skills folder per the current Antigravity docs. Copy `workflows/*.md` into `<workspace>/.agent/workflows/` to get `/new-short`,
  `/seo-kit`, `/analyze-reference`, `/hero-art` as slash workflows. Open the workspace, then ask: "Make a new Samulation short about …".
  Antigravity's agent has a terminal and a browser, so it can run every command here.
- **Claude Code:** copy the folder to `~/.claude/skills/samulation-shorts/` or the repo's `.claude/skills/`.
- **Any other agent (ChatGPT, Gemini):** give it `SKILL.md` + the `reference/` files as instructions; run the commands yourself
  and paste back logs/frames.
- Paths in this skill are written relative to `SKILL` (this folder). When the agent copies `engine/` per video, tools are called as
  `SKILL/tools/...`.

## 4. Folder map of a video project (a copy of `engine/`)
```
<short>/index.html  brand.html  tools/capture.mjs  vendor/ (three.js r-module, MIT)  fonts/
<short>/src/main.js        shots, captions, cross-dissolves, overlays         <- you edit per video
<short>/src/<set>.js       one file per location                               <- you add/adapt per video
<short>/src/core.js kit.js char.js engine.js brand.js                          <- shared engine (don't fork casually)
<short>/data/vo.wav words.json cues.json sfx.wav music.wav mix.wav
<short>/review/ (stills, sheets)   renders/ (parts + final)
```
