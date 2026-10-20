"""
Original background score, composed in code (pretty_midi) and rendered with FluidSynth +
FluidR3_GM (MIT licence) → 100 % original, copyright-free music.

Each section starts at an absolute VO time (seconds, from src/vo/cues.json) so musical hits land
exactly on the narration beats. Sections are appended as later chunks are built.

    python3 scripts/audio/make_bgm.py public/assets/music/bgm.wav
"""
import subprocess, sys, tempfile
import numpy as np
import pretty_midi as pm
from scipy.io import wavfile

OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/assets/music/bgm.wav'
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
SR = 48000
F = lambda frame: frame / 60.0  # frame @60 → seconds

song = pm.PrettyMIDI(initial_tempo=120)
INST = {}


def inst(name, program, drum=False):
    if name not in INST:
        INST[name] = pm.Instrument(program=program, is_drum=drum, name=name)
        song.instruments.append(INST[name])
    return INST[name]


def note(name, start, dur, pitch, vel):
    inst(*PROG[name]).notes.append(pm.Note(velocity=int(max(1, min(127, vel))), pitch=int(pitch), start=start, end=start + dur))


PROG = {
    'strings': ('strings', 48), 'slowstr': ('slowstr', 49), 'cello': ('cello', 42), 'bass': ('bass', 43),
    'pizz': ('pizz', 45), 'harpsi': ('harpsi', 6), 'flute': ('flute', 73), 'piccolo': ('piccolo', 72),
    'horn': ('horn', 60), 'brass': ('brass', 61), 'trumpet': ('trumpet', 56), 'timp': ('timp', 47),
    'choir': ('choir', 52), 'drums': ('drums', 0, True), 'glock': ('glock', 9),
}
N = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}


def p(s):
    """'D4' → 62, 'A#3' → 58"""
    return 12 * (int(s[-1]) + 1) + N[s[:-1]]


def chord(name, start, dur, notes, vel):
    for s in notes:
        note(name, start, dur, p(s), vel)


# ── S01 A: 0 → 4.27 s  "आपको बताया गया कि America ने आज़ादी के लिए लड़ाई लड़ी"
#    rising D-major swell, snare roll, brass + timpani hit on "आज़ादी" (1.876 s)
hit1 = F(112)
for i in range(12):  # swell built from repeated soft re-attacks (crescendo)
    t = i * hit1 / 12
    chord('slowstr', t, hit1 / 12 + 0.05, ['D3', 'A3', 'D4', 'F#4'], 40 + i * 4)
for i in range(int(hit1 / 0.06)):
    note('drums', i * 0.06, 0.05, 38, 30 + i * 2.6)
chord('brass', hit1, 2.2, ['D3', 'A3', 'D4', 'F#4', 'A4'], 112)
chord('strings', hit1, 2.3, ['D4', 'F#4', 'A4', 'D5'], 100)
note('timp', hit1, 1.2, p('D2'), 120)
note('drums', hit1, 1.5, 49, 110)  # crash
for i, s in enumerate(['A5', 'B5', 'C#6', 'D6', 'F#6', 'A6']):
    note('piccolo', hit1 + 0.4 + i * 0.09, 0.12 if i < 5 else 1.4, p(s), 85)
for k, s in enumerate(['D5', 'E5', 'F#5', 'A5', 'D6']):  # glints during fireworks
    note('glock', hit1 + 0.9 + k * 0.3, 0.5, p(s), 70)
chord('strings', hit1 + 2.3, 4.27 - hit1 - 2.3 - 0.05, ['D4', 'F#4', 'A4', 'D5'], 78)

# ── S01 B: 4.40 → 9.10 s  rewind → 1763 "यही लोग अपने राजा से प्यार करते थे" — courtly minuet, G major 3/4
t0, beat = F(264), 0.46
mel = [('G4', 1), ('B4', .5), ('C5', .5), ('D5', 1), ('G5', 1), ('F#5', .5), ('E5', .5), ('D5', 1), ('C5', 1), ('B4', 1),
       ('A4', .5), ('B4', .5), ('C5', 1), ('A4', 1), ('B4', 1.5), ('A4', .5), ('G4', 1)]
t = t0
for s, b in mel:
    note('harpsi', t, b * beat * 0.95, p(s), 82)
    t += b * beat
bass = ['G2', 'D3', 'G2', 'C3', 'G2', 'D3', 'D3', 'G2']
for i, s in enumerate(bass):
    bt = t0 + i * 3 * beat * 0.75
    if bt < F(546):
        note('pizz', bt, 0.3, p(s), 75)
        chord('pizz', bt + beat, 0.25, ['B3', 'D4'] if i % 2 == 0 else ['A3', 'C4'], 55)
chord('strings', t0, F(546) - t0 - 0.1, ['G3', 'B3', 'D4'], 42)
note('horn', F(399), 1.6, p('D4'), 70)  # "राजा" — royal horn call
note('horn', F(399) + 0.5, 1.1, p('G4'), 74)
chord('strings', F(546) - 0.4, 0.4, ['C4', 'E4', 'G4'], 45)

# ── S01 C: 9.10 → 14.34 s  "तो सिर्फ़ तेरह साल में ऐसा क्या हुआ…" — tension build, D minor ostinato
t0, t1 = F(546), F(860)
eighth = 0.25
prog = [(['D3', 'F3', 'A3'], 'D2'), (['A#2', 'D3', 'F3'], 'A#1'), (['G2', 'A#2', 'D3'], 'G1'), (['A2', 'C#3', 'E3'], 'A1')]
n = int((t1 - t0) / eighth)
for i in range(n):
    tt = t0 + i * eighth
    ch, root = prog[min(3, int(4 * i / n))]
    note('cello', tt, eighth * 0.8, p(root) + (12 if i % 2 else 0), 60 + 50 * i / n)
    if i % 2 == 0:
        chord('strings', tt, eighth * 1.9, [c[:-1] + str(int(c[-1]) + 1) for c in ch], 45 + 50 * i / n)
for i in range(int(1.6 / 0.07)):  # timpani roll into the hit
    note('timp', t1 - 1.6 + i * 0.07, 0.07, p('A1'), 50 + i * 3)
chord('horn', F(783), t1 - F(783), ['A3', 'C#4', 'E4'], 95)  # "बंदूक उठा ली"
# the HIT on "जान की बाज़ी"
chord('brass', t1, 1.6, ['D2', 'A2', 'D3', 'F3'], 127)
chord('strings', t1, 1.6, ['D3', 'A3', 'D4', 'F4'], 115)
note('timp', t1, 1.4, p('D2'), 127)
note('drums', t1, 1.5, 49, 120)
note('drums', t1, 0.5, 36, 127)
chord('choir', t1, 1.5, ['D4', 'F4', 'A4'], 90)
chord('slowstr', t1 + 0.8, F(962) - t1 - 0.6, ['D2', 'A2'], 55)  # low drone under "लगा दी?"

# ── S02: 16.03 → 34 s  "आज हम इस पूरी कहानी को map पर देखेंगे…" — adventure march (fife & drum), D minor → F
t0 = F(962)
bpm = 104
b = 60 / bpm
end = 34.0
bars = int((end - t0) / (4 * b)) + 1
harm = [['D3', 'F3', 'A3'], ['C3', 'E3', 'G3'], ['A#2', 'D3', 'F3'], ['A2', 'C#3', 'E3'],
        ['D3', 'F3', 'A3'], ['F3', 'A3', 'C4'], ['A#2', 'D3', 'F3'], ['A2', 'C#3', 'E3']]
roots = ['D2', 'C2', 'A#1', 'A1', 'D2', 'F2', 'A#1', 'A1']
theme = [  # (beat, pitch, beats) per 2 bars — fife melody
    [(0, 'D5', 1), (1, 'A4', .5), (1.5, 'D5', .5), (2, 'F5', 1), (3, 'E5', .5), (3.5, 'D5', .5),
     (4, 'C5', 1), (5, 'A4', 1), (6, 'C5', .5), (6.5, 'E5', .5), (7, 'G5', 1)],
    [(0, 'F5', 1), (1, 'G5', .5), (1.5, 'A5', .5), (2, 'A#5', 1.5), (3.5, 'A5', .5),
     (4, 'G5', .5), (4.5, 'F5', .5), (5, 'E5', 1), (6, 'C#5', 1), (7, 'E5', 1)],
]
for bar in range(bars):
    bt = t0 + bar * 4 * b
    if bt >= end:
        break
    h = harm[bar % 8]
    lvl = 0.75 + 0.25 * min(1, bar / 4)
    note('bass', bt, 1.8 * b, p(roots[bar % 8]), 85 * lvl)
    note('bass', bt + 2 * b, 1.8 * b, p(roots[bar % 8]) + 7, 75 * lvl)
    for e in range(8):  # staccato string ostinato in 8ths
        chord('strings', bt + e * b / 2, b * 0.35, [h[e % 3][:-1] + str(int(h[e % 3][-1]) + 1)], (52 + 10 * (e % 2 == 0)) * lvl)
    # snare march: 1 (accent), & of 2, 3, 4-e-&-a
    for off, v in [(0, 95), (1.5, 60), (2, 80), (3, 55), (3.25, 50), (3.5, 60), (3.75, 70)]:
        note('drums', bt + off * b, 0.1, 38, v * lvl)
    note('drums', bt, 0.2, 36, 90 * lvl)
    note('drums', bt + 2 * b, 0.2, 36, 70 * lvl)
    if bar % 2 == 0 and bar >= 1:
        for (o, s, ln) in theme[(bar // 2) % 2]:
            if bt + o * b < end - 0.3:
                note('flute', bt + o * b, ln * b * 0.92, p(s), 72)
# "हर बार problem…" (26.25 s) → horns join; "problem और बड़ी हो गई" (29.9 s) → crescendo + cymbal swell
for k in range(4):
    chord('horn', F(1575) + k * 2 * b, 2 * b * 0.95, [['D4', 'F4'], ['C4', 'E4'], ['A#3', 'D4'], ['A3', 'C#4']][k], 80)
for i in range(int(1.8 / 0.06)):
    note('timp', F(1793) - 0.2 + i * 0.06, 0.06, p('A1'), 50 + i * 2.2)
chord('brass', F(1853) + 0.3, 1.2, ['A2', 'E3', 'A3', 'C#4'], 105)
note('drums', F(1853) + 0.3, 1.2, 57, 100)

# ── render ──────────────────────────────────────────────────────────────────
with tempfile.TemporaryDirectory() as td:
    song.write(f'{td}/bgm.mid')
    subprocess.run(['fluidsynth', '-ni', '-g', '0.6', '-r', str(SR), '-R', '1', '-C', '1', '-F', f'{td}/raw.wav', SF2, f'{td}/bgm.mid'],
                   check=True, capture_output=True)
    # gentle mastering: tame lows, glue, normalise (music sits UNDER the VO — mixed in Remotion)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{td}/raw.wav', '-af',
                    'highpass=f=35,acompressor=threshold=-18dB:ratio=2.5:attack=20:release=250,'
                    'aecho=0.8:0.6:60|110:0.18|0.12,loudnorm=I=-16:TP=-1.5:LRA=11',
                    '-ar', str(SR), '-ac', '2', OUT], check=True)
sr, y = wavfile.read(OUT)
print('bgm', OUT, f'{len(y) / sr:.1f}s')
song.write(OUT.replace('.wav', '.mid'))
