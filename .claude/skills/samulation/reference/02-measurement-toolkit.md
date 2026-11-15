# 02 · Measurement toolkit (reference analysis, step by step)

Everything here runs on CPU with ffmpeg, numpy and faster-whisper. Work in a private folder outside the repo (for example
`/root/proj/refs/`). **Never commit reference media, frames, sheets or transcripts.**

## 0. Get the material
- Google Drive file (shared link):
  ```bash
  curl -sSL -o ref.mp4 "https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t"
  ```
  For a Drive folder, use `gdown --folder` (pip) or ask the creator to zip it.
- `ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of compact ref.mp4` gives the
  duration, resolution and fps.
- If you download from YouTube, request the **original audio language**; dubs are served by default.

## 1. Word-timed transcript
```bash
python3 tools/transcribe_ref.py         # all vids/NN.mp4 → tx/NN.json [{w,s,e}] + tx/NN.txt (faster-whisper small.en, int8)
```
Single file version (used for the VO too):
```python
from faster_whisper import WhisperModel; m = WhisperModel('small.en', device='cpu', compute_type='int8')
segs, _ = m.transcribe(audio_float32_16k, beam_size=5, word_timestamps=True)
words = [{'w': w.word.strip(), 's': w.start, 'e': w.end} for s in segs for w in s.words]
```
- **Pace:** words / (last end − first start). The references run 3.4-3.7 w/s; the creator's own voice is 2.61 w/s.
- **Proxy:** if the model download fails behind a proxy, set `HF_HUB_DISABLE_XET=1`.

## 2. Contact sheets at the source rate
```bash
ffmpeg -nostdin -v error -i ref.mp4 -vf "scale=180:320,tile=10x6" -q:v 4 sheets/s%02d.jpg   # 1 sheet = 2 s = 60 frames
ffmpeg -nostdin -v error -i ref.mp4 -vf "fps=2,scale=144:256,tile=13x5" -q:v 3 ov%d.jpg      # overview: one tile per 0.5 s
```
- Sheet `sKK` starts at t = (KK−1)·2 s, tiles row-major.
- **How to read them:**
  1. Read the overview first to get the shot list.
  2. Then read the 30 fps sheets around every key word: the action onset vs the caption word gives the frame offset.

## 3. Per-frame numbers
```bash
python3 tools/measure_ref.py R4          # vids/R4.mp4 → measure/R4.json, one entry per frame
```
- **Fields:**
  - `lm`/`ls`: luma mean/sd, with the caption band (56-80 % height) masked;
  - `p2`/`p98`: black and white points;
  - `sat`: HSV saturation;
  - `cut`: 32-bin luma histogram L1 change. Hard cuts are >0.35-0.5; dissolves appear as runs of 0.1-0.35;
  - `cam`: `[dx, dy, zoom, roll°]` from a 9-tile phase-correlation similarity fit, in px at 360 wide (×3 for 1080).
- **Derived stats** (snippet below): cut list and shot lengths, cut↔nearest word onset in frames, median |dx|,|dy|,
  zoom %/frame, roll, and the still fraction (|d|<0.3 px and |zoom|<0.0005).
```python
cuts = [i for i in range(1, n) if M[i]['cut'] > 0.35]                    # merge cuts closer than 3 f
for c in cuts: j = argmin(|onsets - c/30|); offset_frames = (c/30 - onset[j]) * 30
```
- Slow push-ins hide in noise. Fit zoom over 15-30 frame windows before calling a shot "still" (see `01` §6).

## 4. Sound
```bash
ffmpeg -nostdin -i ref.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary     # I (LUFS), LRA, true peak
ffmpeg -nostdin -v error -y -i ref.mp4 -lavfi "showspectrumpic=s=1600x400:legend=1:scale=log:fscale=log" spec.png
```
- **SFX onsets:** spectral flux per 1/30 s frame. Keep peaks above median + 4·sd that are local maxima over ±2 frames.
- **Music bed level:** median RMS in word gaps longer than 0.25 s, compared with voice RMS. The references sit 9-21 dB under.
- In the spectrogram, horizontal tonal lines that persist under speech mean a continuous music bed.

## 5. Topic analysts (for big studies)
- **Shared brief:** write a `CONTEXT.md` with the goal, where the material is, the field meanings, and these rules:
  - private, no commits;
  - CPU budget: process at 360x640 and sample frames;
  - the deliverable is a report with tables of numbers plus implementable rules with exact values, mapped to engine code.
- **Topics:** camera · VO sync · colour/lighting · world · characters · FX/mechanics · sound · script.
- Each report ends with its top 5-8 rules ranked by impact. The lead merges them into one rule book (`reference/03`).

## 6. Side-by-side checks against our render
```bash
tools/sidebyside.sh ref.mp4 ours.mp4 t     # same timestamp, both frames
python3 tools/colormatch.py                # match black/white points and saturation to the reference preset
```
Score every shot 0-100 against the reference: look, camera, sync, mechanism, sound. Report the score honestly.
