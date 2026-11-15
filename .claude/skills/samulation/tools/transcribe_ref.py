# word-level transcripts of every reference (faster-whisper small.en, decoded with ffmpeg -> numpy)
import json, subprocess, sys, numpy as np, os
from faster_whisper import WhisperModel
m = WhisperModel('small.en', device='cpu', compute_type='int8')
for n in sorted(os.listdir('vids')):
    k = n[:2]; out = f'tx/{k}.json'
    if os.path.exists(out): continue
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f'vids/{n}', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout, np.int16).astype(np.float32) / 32768
    segs, _ = m.transcribe(a, beam_size=5, word_timestamps=True)
    words = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
    json.dump(words, open(out, 'w')); open(f'tx/{k}.txt', 'w').write(' '.join(w['w'] for w in words)); print(k, len(words), flush=True)
