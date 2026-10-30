"""One-word caption track from a reference: finds every frame where the caption changes (pixel XOR of the white-text
mask in the caption band) and OCRs one frame per word with tesseract (single-threaded - parallel tesseract crawls).
Writes [{f, w}] JSON. ALWAYS read the result: fix OCR slips (e.g. ran->fon), drop duplicate events one frame apart,
and add words whose width matched the previous word (check a contact sheet of the band around suspicious gaps).
    OMP_THREAD_LIMIT=1 python3 -I scripts/stickman3d/analysis/captions_ocr.py <ref.mp4> <out.json> [y0 y1]
y0/y1: caption band in source pixels (default 895-975 for 720x1280, i.e. ~70-76 % of the height).
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip().split(',')
Wv, Hv = int(probe[0]), int(probe[1])
y0, y1 = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (round(Hv * 0.699), round(Hv * 0.762))
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'crop={Wv}:{y1 - y0}:0:{y0}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.uint8).reshape(-1, y1 - y0, Wv, 3).astype(np.int16)
m = (a.min(-1) > 228) & ((a.max(-1) - a.min(-1)) < 25)          # white, unsaturated text pixels
s = m.reshape(len(m), -1)
d = (s[1:] ^ s[:-1]).sum(1); tot = s[1:].sum(1) + s[:-1].sum(1)
ev = [0] + [i + 1 for i in range(len(d)) if d[i] > 60 and d[i] > 0.35 * max(tot[i], 1)]
ded = []
for e in ev:
    if not ded or e - ded[-1] > 1: ded.append(e)
os.environ['OMP_THREAD_LIMIT'] = '1'; td = tempfile.mkdtemp(); res = []
for i in ded:
    k = m[min(i + 3, len(m) - 1)]; cols = np.nonzero(k.sum(0) > 1)[0]
    if len(cols) == 0: continue
    x0, x1 = max(0, cols.min() - 20), min(Wv, cols.max() + 20)
    Image.fromarray(np.where(k, 0, 255).astype(np.uint8)).crop((x0, 0, x1, y1 - y0)).resize(((x1 - x0) * 3, (y1 - y0) * 3)).save(f'{td}/w.png')
    w = subprocess.run(['tesseract', f'{td}/w.png', '-', '--psm', '8'], capture_output=True, text=True).stdout.strip()
    w = re.sub(r"[^A-Za-z0-9',.!?-]", '', w.replace('’', "'")).strip(",.'")
    if w and (not res or res[-1]['w'] != w or i - res[-1]['f'] > 4): res.append({'f': i, 'w': w})
json.dump(res, open(out, 'w'), indent=0)
print(len(res), 'words:', ' '.join(r['w'] for r in res))
