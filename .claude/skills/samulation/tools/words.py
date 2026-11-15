"""Word-level timestamps for a voiceover, offline, with faster-whisper.
usage: python3 words.py vo.wav words.json [--model small.en] [--lang en]
writes [{"w": "word", "s": start, "e": end}, ...] and prints the transcript with times so you can check it.
Tips: HF_HUB_DISABLE_XET=1 if the model download fails behind a proxy; HF_HUB_OFFLINE=1 once it's cached."""
import sys, json, argparse, subprocess
import numpy as np
from faster_whisper import WhisperModel

ap = argparse.ArgumentParser(); ap.add_argument('audio'); ap.add_argument('out')
ap.add_argument('--model', default='small.en'); ap.add_argument('--lang', default=None)
a = ap.parse_args()
# decode with ffmpeg to 16 kHz mono float32 (avoids decoder argument mismatches)
raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', a.audio, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
                     capture_output=True, check=True).stdout
pcm = np.frombuffer(raw, dtype=np.float32).copy()
m = WhisperModel(a.model, device='cpu', compute_type='int8')
segs, info = m.transcribe(pcm, word_timestamps=True, vad_filter=False, language=a.lang)
words = []
for s in segs:
    print(f'[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}')
    for w in s.words: words.append({'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)})
json.dump(words, open(a.out, 'w'), indent=0)
print(f'{len(words)} words, {words[-1]["e"]:.2f}s -> {a.out}' if words else 'no words found')
