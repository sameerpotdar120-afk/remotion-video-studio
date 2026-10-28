"""
Russia video — background score from public-domain recordings of Russian classical music
(Musopen collection on archive.org, Public Domain Mark 1.0; see docs/russia/AUDIO_CREDITS.md).

Each section of the timeline (intro, chapters 1–10, payoff; boundaries from src/russia/vo/video.json) gets one
piece. From that piece we take the window of the section's length whose quietest moment is loudest (no
near-silent passages that would vanish under the voice), even out the orchestral dynamics, crossfade sections at
the chapter cards, fade the ends and normalise the whole bed to −36 LUFS (the level the user approved; the mix
ducks it further under speech).

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

P6 = 'PyotrIlyichTchaikovsky-SymphonyNo.6InBMinorOp.74pathtique-0{}'
TRACKS = {
    'pathetique1': P6.format('1-AdagioAllegroNonTroppo.mp3'),
    'pathetique3': P6.format('3-AllegroMoltoVivace.mp3'),
    'pathetique4': P6.format('4-FinaleAdagioLamentoso.mp3'),
    'easter': 'NikolaiRimsky-korsakov-RussianEasterFestivalOvertureOp.36.mp3',
    'steppes': 'AlexanderBorodin-InTheSteppesOfCentralAsia.mp3',
    'quartet2_1': 'AlexanderBorodin-StringQuartetNo.2InDMajor-01-AllegroModerato.mp3',
    'nocturne': 'AlexanderBorodin-StringQuartetNo.2InDMajor-03-NocturneAndante.mp3',
}
# (section start s, end s, track, search range within the track (s) or None for anywhere)
SECTIONS = [
    (0.0, C[0], 'pathetique1', (0, 180)),         # intro: the dark bassoon opening
    (C[0], C[1], 'easter', (0, 420)),             # 1 Rus: Orthodox chant themes (Kyiv, 988)
    (C[1], C[2], 'steppes', None),                # 2 Mongols: In the Steppes of Central Asia
    (C[2], C[3], 'pathetique1', (250, 700)),      # 3 Ivan: the stormy development
    (C[3], C[4], 'pathetique1', (500, 1000)),     # 4 Troubles
    (C[4], C[5], 'easter', (380, 800)),           # 5 Peter: the festive allegro
    (C[5], C[6], 'quartet2_1', None),             # 6 Catherine: court elegance
    (C[6], C[7], 'pathetique3', None),            # 7 1812: the march
    (C[7], C[8], 'pathetique4', None),            # 8 the last Tsar: Adagio lamentoso
    (C[8], C[9], 'pathetique1', (300, 1050)),     # 9 Stalin
    (C[9], PAY, 'nocturne', None),                # 10 today: Borodin's Nocturne
    (PAY, TOTAL, 'easter', (700, 940)),           # payoff: the triumphant finale
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
