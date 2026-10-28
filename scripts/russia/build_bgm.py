"""
Russia video — background score from Kevin MacLeod's orchestral library (incompetech.com, Creative Commons
Attribution 4.0; credit line in docs/russia/AUDIO_CREDITS.md and the video description).

Each section of the timeline (intro, chapters 1–10, payoff; boundaries from src/russia/vo/video.json) gets one
piece chosen for its mood. From that piece we take the window of the section's length whose quietest moment is
loudest (no near-silent passages that would vanish under the voice), even out the orchestral dynamics, crossfade
sections at the chapter cards, fade the ends and normalise the whole bed to −36 LUFS (the level the user approved;
the mix ducks it further under speech).

    python3 scripts/russia/build_bgm.py <dir with the downloaded mp3s> public/russia/music/bgm.mp3
"""
import json, os, subprocess, sys
import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
SR = 48000
V = json.load(open('src/russia/vo/video.json'))
TOTAL = V['total'] / 60
C = [c['card'] / 60 for c in V['chapters']]
PAY = V['paragraphs'][96]['f'] / 60 - 0.3

TRACKS = {k: k + '.mp3' for k in [
    'Crusade', 'Intrepid', 'Majestic Hills', 'Oppressive Gloom', 'Dark Times', 'Noble Race', 'Court of the Queen',
    'Colossus', 'Lost Time', 'Crusade - Heavy Industry', 'Night Vigil', 'At Launch']}
# (section start s, end s, track, search range within the track (s) or None for anywhere)
SECTIONS = [
    (0.0, C[0], 'Crusade', None),                     # intro: dark, suspenseful
    (C[0], C[1], 'Intrepid', None),                   # 1 Rus: early-music colour
    (C[1], C[2], 'Majestic Hills', None),             # 2 Mongols: dark epic
    (C[2], C[3], 'Oppressive Gloom', None),           # 3 Ivan: a death march
    (C[3], C[4], 'Dark Times', None),                 # 4 Troubles: low strings, somber
    (C[4], C[5], 'Noble Race', None),                 # 5 Peter: driving, full orchestra
    (C[5], C[6], 'Court of the Queen', None),         # 6 Catherine: regal waltz
    (C[6], C[7], 'Colossus', None),                   # 7 1812: orchestral action
    (C[7], C[8], 'Lost Time', None),                  # 8 the last Tsar: violas, cellos, basses
    (C[8], C[9], 'Crusade - Heavy Industry', None),   # 9 Stalin: industry, anvils
    (C[9], PAY, 'Night Vigil', None),                 # 10 today: choir, somber
    (PAY, TOTAL, 'At Launch', None),                  # payoff: epic, uplifting
]
XF = 2.5  # crossfade at the chapter cards (s)


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def short_db(x, win=1.0):
    n = int(win * SR)
    m = len(x) // n
    e = np.sqrt((x[: m * n] ** 2).mean(1).reshape(m, n).mean(1) + 1e-12)
    return 20 * np.log10(e)


cache = {}
pieces = []
for (a, b, name, rng) in SECTIONS:
    if name not in cache:
        cache[name] = load(os.path.join(SRC, TRACKS[name]))
    x = cache[name]
    need = (b - a) + XF
    db = short_db(x)
    lo, hi = (rng if rng else (0, len(db)))
    hi = min(hi, len(db))
    L = int(np.ceil(need))
    if L >= len(db):  # piece shorter than the section: loop it
        reps = int(np.ceil(need * SR / len(x))) + 1
        seg = np.concatenate([x] * reps)[: int(need * SR)]
        start = 0
    else:
        best, start = -1e9, lo
        for s in range(lo, max(lo + 1, min(hi, len(db) - L))):
            score = np.percentile(db[s: s + L], 10)  # the quiet end of the window should still be audible
            if score > best:
                best, start = score, s
        seg = x[int(start * SR): int(start * SR) + int(need * SR)]
    pieces.append((a, b, name, start, seg))
    print(f'{name:12s} section {a:7.1f}–{b:7.1f}s  from {start:5d}s  ({need:5.1f}s)')

out = np.zeros((int(TOTAL * SR) + SR, 2), np.float32)
for i, (a, b, name, start, seg) in enumerate(pieces):
    i0 = int(max(0, a - (XF if i else 0)) * SR)
    seg = seg[: len(out) - i0].copy()
    f = int(XF * SR)
    if i: seg[:f] *= np.linspace(0, 1, f)[:, None]
    if i < len(pieces) - 1: seg[-f:] *= np.linspace(1, 0, f)[:, None]
    out[i0: i0 + len(seg)] += seg
out = out[: int(TOTAL * SR)]

tmp = OUT + '.tmp.wav'
from scipy.io import wavfile
wavfile.write(tmp, SR, out)
# even out the orchestral dynamics, fade the ends, normalise the bed to −36 LUFS
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af',
                f'dynaudnorm=f=500:g=31:m=6:p=0.9,afade=t=in:d=2,afade=t=out:st={TOTAL - 4:.2f}:d=4,loudnorm=I=-36:TP=-6:LRA=7',
                '-ar', str(SR), '-ac', '2', '-b:a', '192k', OUT], check=True)
os.remove(tmp)
print('wrote', OUT, f'{TOTAL / 60:.1f} min')
