"""Soft synthesised music bed (copyright-free): warm detuned pad chords + light plucks on eighths + a soft kick, fades in/out.
usage: python3 music.py out.wav --dur 40.2 [--bpm 92] [--prog Am,F,C,G] [--mood light|tense]
It sits under the voice (mix.sh puts it ~20 dB down and ducks it). The reference style has a constant bed; never silent."""
import argparse, math, wave
import numpy as np
ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--dur', type=float, required=True); ap.add_argument('--bpm', type=float, default=92)
ap.add_argument('--prog', default='Am,F,C,G'); ap.add_argument('--mood', default='light'); a = ap.parse_args()
NOTES = {'C': 48, 'D': 50, 'E': 52, 'F': 53, 'G': 55, 'A': 57, 'B': 59}
def chord(n):
    root = NOTES[n[0]] + (1 if '#' in n else 0); minor = n.endswith('m'); return [root, root + (3 if minor else 4), root + 7]
prog = [chord(c.strip()) for c in a.prog.split(',')]
if a.mood == 'tense': prog = [chord('Am'), chord('Am'), chord('F'), chord('E')]
SR = 48000; D = a.dur; N = int(SR * D); out = np.zeros((N, 2)); beat = 60 / a.bpm; bar = beat * 4
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
for i in range(int(D / bar) + 1):
    s = int(i * bar * SR); e = min(N, int((i + 1) * bar * SR))
    if s >= N: break
    tt = np.arange(e - s) / SR; env = np.minimum(1, tt / 0.4) * np.minimum(1, np.maximum(0, (bar - tt) / 0.5))
    for m in prog[i % len(prog)]:
        for ch, det in ((0, -0.6), (1, 0.6)):
            ph = 2 * math.pi * mf(m) * (1 + det / 1000) * tt; out[s:e, ch] += 0.05 * env * (np.sin(ph) + 0.3 * np.sin(2 * ph))
    for b in range(8):
        ps = s + int(b * beat / 2 * SR)
        if ps >= N: break
        m = prog[i % len(prog)][b % 3] + 12; n = min(int(0.35 * SR), N - ps); tp = np.arange(n) / SR
        sig = 0.06 * np.sin(2 * math.pi * mf(m) * tp) * np.exp(-9 * tp); out[ps:ps + n, 0] += sig * 0.8; out[ps:ps + n, 1] += sig
    for b in range(4):
        ks = s + int(b * beat * SR); n = int(0.25 * SR)
        if ks + n < N: tk = np.arange(n) / SR; out[ks:ks + n] += (0.12 * np.sin(2 * math.pi * 55 * tk * (1 - 0.5 * tk)) * np.exp(-16 * tk))[:, None]
t = np.arange(N) / SR; out *= np.minimum(1, np.minimum(t / 1.0, (D - t) / 1.2))[:, None]; out = out / (np.abs(out).max() + 1e-9) * 0.8
with wave.open(a.out, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('wrote', a.out, f'{D:.1f}s')
