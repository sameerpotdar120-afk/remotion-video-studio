"""
Russia video — original background score, composed in code (pretty_midi) and rendered with FluidSynth +
FluidR3_GM (MIT licence): 100 % original, copyright-free.

The reference keeps its music bed almost silent under the narration (VO +31 dB, analysis §4), so this is a
quiet, slow bed: D minor, a balalaika-like tremolo guitar for the folk chapters, low strings and timpani
for the dark ones, a march for 1812, strings + celesta for the last Tsar, a synth pad for today, and a
timpani + cymbal hit on every chapter card. Section boundaries come from src/russia/vo/video.json.

    python3 scripts/russia/make_bgm.py public/russia/music/bgm.wav
"""
import json, os, subprocess, sys, tempfile
import numpy as np
import pretty_midi as pm

OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/russia/music/bgm.wav'
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
SR = 48000
V = json.load(open('src/russia/vo/video.json'))
F = lambda f: f / 60.0
TOTAL = F(V['total'])
TEMPO = 92
BEAT = 60 / TEMPO

song = pm.PrettyMIDI(initial_tempo=TEMPO)
INST = {}
PROG = {'guitar': 24, 'pizz': 45, 'strings': 48, 'slowstr': 49, 'cello': 42, 'contra': 43, 'choir': 52, 'brass': 61,
        'horn': 60, 'timp': 47, 'glock': 9, 'celesta': 8, 'pad': 89, 'epiano': 4, 'flute': 73, 'oboe': 68}

def I(name):
    if name not in INST:
        drum = name == 'drums'
        INST[name] = pm.Instrument(program=0 if drum else PROG[name], is_drum=drum, name=name)
        song.instruments.append(INST[name])
    return INST[name]

def note(name, t, d, pitch, vel):
    if t >= TOTAL: return
    I(name).notes.append(pm.Note(velocity=int(max(1, min(127, vel))), pitch=int(pitch), start=t, end=min(TOTAL, t + d)))

NAMES = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
def p(s): return 12 * (int(s[-1]) + 1) + NAMES[s[:-1]]

# chords as (root note, minor/major/7)
CH = {
    'Dm': ['D3', 'F3', 'A3'], 'Gm': ['G2', 'A#2', 'D3'], 'A7': ['A2', 'C#3', 'G3'], 'Bb': ['A#2', 'D3', 'F3'],
    'C': ['C3', 'E3', 'G3'], 'F': ['F2', 'A2', 'C3'], 'A': ['A2', 'C#3', 'E3'], 'Em7b5': ['E3', 'G3', 'A#3'],
}
PROGRESSIONS = {
    'folk': ['Dm', 'Gm', 'A7', 'Dm', 'Bb', 'C', 'A7', 'Dm'],
    'dark': ['Dm', 'Dm', 'Bb', 'A', 'Gm', 'Gm', 'Em7b5', 'A'],
    'march': ['Dm', 'A7', 'Dm', 'C', 'F', 'C', 'A7', 'Dm'],
    'sad': ['Dm', 'Bb', 'F', 'C', 'Gm', 'Bb', 'A', 'A'],
    'modern': ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'C', 'A'],
    'epic': ['Dm', 'Bb', 'C', 'Dm', 'Gm', 'Bb', 'A', 'Dm'],
}

def section(mood, t0, t1, energy=1.0):
    bar = BEAT * 4
    prog = PROGRESSIONS[mood]
    k = 0
    t = t0
    while t < t1 - 0.5:
        chord = [p(x) for x in CH[prog[k % len(prog)]]]
        root = chord[0]
        dur = min(bar, t1 - t)
        e = energy
        if mood == 'folk':
            # balalaika-style tremolo on the top two notes (16ths), pizz bass on 1 and 3, soft string pad
            for i in range(int(dur / (BEAT / 4))):
                note('guitar', t + i * BEAT / 4, BEAT / 4 * 0.9, chord[(i // 4) % 3] + 12, 34 * e + (6 if i % 4 == 0 else 0))
            note('pizz', t, BEAT, root - 12, 52 * e); note('pizz', t + 2 * BEAT, BEAT, root - 5, 46 * e)
            for n in chord: note('slowstr', t, dur, n + 12, 26 * e)
            if k % 4 == 3: note('flute', t + 2 * BEAT, BEAT * 2, chord[2] + 24, 30 * e)
        elif mood == 'dark':
            for n in chord: note('cello', t, dur, n - 12, 40 * e)
            note('contra', t, dur, root - 24, 46 * e)
            note('choir', t, dur, chord[1] + 12, 22 * e)
            note('timp', t, BEAT, root - 12, 44 * e)
            if k % 2: note('timp', t + 2.5 * BEAT, BEAT, root - 12, 30 * e)
        elif mood == 'march':
            for b in range(4):
                note('drums', t + b * BEAT, 0.1, 38, (50 if b % 2 == 0 else 34) * e)
                note('drums', t + b * BEAT + BEAT / 2, 0.08, 38, 22 * e)
            for n in chord: note('horn', t, BEAT * 1.8, n + 12, 36 * e)
            note('brass', t + 2 * BEAT, BEAT * 1.5, chord[2] + 12, 30 * e)
            note('pizz', t, BEAT, root - 12, 50 * e)
        elif mood == 'sad':
            for n in chord: note('strings', t, dur, n + 12, 30 * e)
            for i, n in enumerate(chord + [chord[1] + 12]):
                note('celesta', t + i * BEAT, BEAT * 0.9, n + 24, 30 * e)
            note('contra', t, dur, root - 12, 30 * e)
        elif mood == 'modern':
            for n in chord: note('pad', t, dur, n + 12, 34 * e)
            for i in range(8): note('epiano', t + i * BEAT / 2, BEAT / 2 * 0.8, chord[i % 3] + 24, 26 * e)
            note('contra', t, dur, root - 12, 32 * e)
            for b in range(4): note('drums', t + b * BEAT, 0.08, 42, 18 * e)
        elif mood == 'epic':
            for n in chord: note('strings', t, dur, n + 12, 42 * e); note('choir', t, dur, n + 12, 30 * e)
            note('contra', t, dur, root - 12, 44 * e)
            note('timp', t, BEAT, root - 12, 50 * e)
            note('horn', t + 2 * BEAT, BEAT * 2, chord[2] + 12, 36 * e)
        t += bar
        k += 1

def hit(t, big=False):
    note('timp', t, 1.5, p('D2'), 80 if big else 64)
    note('drums', t, 1.0, 49, 70 if big else 52)  # crash cymbal

C = V['chapters']
# (mood, from, to)
plan = [('dark', 0.0, F(C[0]['card']), 0.8)]
MOODS = ['folk', 'folk', 'dark', 'dark', 'folk', 'folk', 'march', 'sad', 'dark', 'modern']
for i, c in enumerate(C):
    end = F(C[i + 1]['card']) if i + 1 < len(C) else F(V['paragraphs'][96]['f'])
    plan.append((MOODS[i], F(c['card']) + 0.4, end, 1.0))
plan.append(('epic', F(V['paragraphs'][96]['f']) - 0.3, TOTAL - 2.0, 1.0))
for mood, a, b, e in plan:
    section(mood, a, b, e)
for c in C:
    hit(F(c['card']), big=True)
hit(F(V['paragraphs'][96]['f']) - 0.3)

with tempfile.TemporaryDirectory() as td:
    song.write(f'{td}/bgm.mid')
    subprocess.run(['fluidsynth', '-ni', '-g', '0.7', '-r', str(SR), '-F', f'{td}/raw.wav', SF2, f'{td}/bgm.mid'], check=True, capture_output=True)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    # gentle reverb-free bed, fades at the ends, loudness well under the VO (VO ≈ −24.5 LUFS in the files)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{td}/raw.wav', '-af',
                    f'afade=t=in:d=2,afade=t=out:st={TOTAL - 4:.2f}:d=4,loudnorm=I=-36:TP=-6:LRA=7', '-ar', str(SR), '-ac', '2', OUT], check=True)
print('wrote', OUT, f'{TOTAL / 60:.1f} min')
