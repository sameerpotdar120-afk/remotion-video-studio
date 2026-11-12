"""Synthesised, copyright-free sound effects placed on a frame timeline (frame f starts at (f-1)/fps s).
usage: python3 sfx.py cues.json out.wav [--dur SECONDS]
cues.json = {"fps": 30, "cues": [[name, {params}], ...]}   (see reference/07 for the library and examples)
Output: 48 kHz stereo 16-bit WAV, peak-normalised to -1 dB, meant to sit under the voice (mix.sh ducks it)."""
import sys, math, json, wave, argparse
import numpy as np

ap = argparse.ArgumentParser(); ap.add_argument('cues'); ap.add_argument('out'); ap.add_argument('--dur', type=float, default=None)
a = ap.parse_args(); C = json.load(open(a.cues)); FPS = C.get('fps', 30)
SR = 48000; rng = np.random.default_rng(7)
def t0(f): return (f - 1) / FPS
last = max([p.get('f1', p.get('f', 1)) for _, p in C['cues']] + [1])
DUR = a.dur or t0(last) + 2.0; N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)

def env_ar(n, at, rl):
    e = np.ones(n); na, nr = max(1, int(n * at)), max(1, int(n * rl)); e[:na] = np.linspace(0, 1, na) ** 2; e[-nr:] *= np.linspace(1, 0, nr) ** 2; return e
def bandnoise(n, lo, hi):
    X = np.fft.rfft(rng.standard_normal(n)); fr = np.fft.rfftfreq(n, 1 / SR); X[(fr < lo) | (fr > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)
def sweepnoise(n, f0, f1, q=0.6):
    x = rng.standard_normal(n); out = np.zeros(n); blk = 1024
    for i in range(0, n, blk):
        seg = x[i:i + blk]; c = f0 + (f1 - f0) * (i / n); X = np.fft.rfft(seg, blk); fr = np.fft.rfftfreq(blk, 1 / SR)
        X *= np.exp(-((fr - c) / (c * q)) ** 2); out[i:i + blk] = np.fft.irfft(X, blk)[:len(seg)]
    return out / (np.abs(out).max() + 1e-9)
def put(sig, t, gain=1.0, pan=0.0):
    i = int(max(t, 0) * SR); n = min(len(sig), N - i)
    if n <= 0: return
    gl, gr = gain * math.cos((pan + 1) * math.pi / 4), gain * math.sin((pan + 1) * math.pi / 4)
    L[i:i + n] += sig[:n] * gl; R[i:i + n] += sig[:n] * gr
def tone(n, f, harm=(1,), decay=6.0):
    t = np.arange(n) / SR; return sum(np.sin(2 * math.pi * f * h * t) / h for h in harm) * np.exp(-decay * t)
def span(f0, f1): return max(1, int((t0(f1) - t0(f0)) * SR))

def whoosh(f, dur=0.45, gain=0.5, up=True, pan=None):
    n = int(dur * SR); s = sweepnoise(n, 300 if up else 2500, 2500 if up else 300) * env_ar(n, 0.55, 0.45); put(s, t0(f) - dur * 0.55, gain, pan if pan is not None else (0.3 if up else -0.3))
def buzz(f0, f1, base=170, gain=0.22, am=28, pan=0.0):
    n = span(f0, f1); t = np.arange(n) / SR; ph = 2 * math.pi * (base + 6 * np.sin(2 * math.pi * 0.7 * t)) * t
    s = sum(np.sin(h * ph) / h for h in range(1, 9)) * (0.6 + 0.4 * np.sin(2 * math.pi * am * t)) * env_ar(n, 0.08, 0.25); put(s / np.abs(s).max(), t0(f0), gain, pan)
def whine(f0, f1, base=640, gain=0.12, pan=-0.2):
    n = span(f0, f1); t = np.arange(n) / SR; ph = 2 * math.pi * (base + 25 * np.sin(2 * math.pi * 3 * t)) * t
    s = (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * env_ar(n, 0.1, 0.3); put(s / np.abs(s).max(), t0(f0), gain, pan)
def thump(f, gain=0.55, freq=70):
    n = int(0.35 * SR); t = np.arange(n) / SR; s = np.sin(2 * math.pi * freq * t * (1 - 0.4 * t)) * np.exp(-14 * t) + 0.3 * bandnoise(n, 60, 400) * np.exp(-30 * t); put(s, t0(f), gain)
def tick(f, gain=0.25):
    n = int(0.06 * SR); put(bandnoise(n, 2000, 7000) * np.exp(-np.arange(n) / SR * 90), t0(f), gain)
def ping(f, gain=0.32, base=1320, pan=0.15):
    n = int(1.1 * SR); t = np.arange(n) / SR
    s = (tone(n, base, (1, 2.01, 3.03), 4.5) + 0.6 * tone(n, base * 1.5, (1, 2), 5.5)) * env_ar(n, 0.01, 0.4) + 0.25 * bandnoise(n, 4000, 11000) * np.exp(-8 * t)
    put(s / np.abs(s).max(), t0(f) - 0.02, gain, pan)
def slice_(f, gain=0.5):
    n = int(0.28 * SR); put(sweepnoise(n, 6000, 2000, 0.3) * env_ar(n, 0.05, 0.7), t0(f) - 0.05, gain, 0.2)
def rasp(f, gain=0.18):
    n = int(0.22 * SR); t = np.arange(n) / SR; s = bandnoise(n, 900, 5000) * (0.5 + 0.5 * np.sign(np.sin(2 * math.pi * 38 * t))) * env_ar(n, 0.2, 0.4); put(s, t0(f), gain, rng.uniform(-.3, .3))
def squelch(f, dur=0.5, gain=0.35, f0=420, f1=140):
    n = int(dur * SR); t = np.arange(n) / SR; fr = f0 + (f1 - f0) * t / dur; s = np.sin(2 * math.pi * np.cumsum(fr) / SR) * env_ar(n, 0.1, 0.6)
    s += 0.4 * bandnoise(n, 150, 1200) * env_ar(n, 0.05, 0.8); put(s / np.abs(s).max(), t0(f), gain)
def bubbles(f0, f1, gain=0.18, rate=7):
    for _ in range(int((t0(f1) - t0(f0)) * rate)):
        fq = rng.uniform(300, 900); n = int(0.09 * SR); t = np.arange(n) / SR
        put(np.sin(2 * math.pi * fq * (1 + 3 * t) * t) * np.exp(-40 * t), t0(f0) + rng.uniform(0, t0(f1) - t0(f0)), gain * rng.uniform(.5, 1), rng.uniform(-.4, .4))
def rise(f0, f1, gain=0.18, a=180, b=420):
    n = span(f0, f1); t = np.arange(n) / SR; fr = a + (b - a) * t / max(t[-1], 1e-9)
    s = np.sin(2 * math.pi * np.cumsum(fr) / SR) * env_ar(n, 0.3, 0.2) + 0.3 * np.sin(2 * math.pi * np.cumsum(fr * 1.5) / SR) * env_ar(n, 0.3, 0.2); put(s / np.abs(s).max(), t0(f0), gain)
def clink(f, gain=0.3, base=2100):
    n = int(0.9 * SR); s = tone(n, base, (1, 2.76, 5.4, 8.9), 7); put(s / np.abs(s).max(), t0(f), gain, 0.2)
def bonk(f, gain=0.4):
    n = int(0.25 * SR); t = np.arange(n) / SR; put(np.sin(2 * math.pi * 220 * t * (1 - 1.2 * t)) * np.exp(-18 * t) + 0.3 * bandnoise(n, 200, 2000) * np.exp(-40 * t), t0(f), gain, -0.2)

LIB = dict(whoosh=whoosh, buzz=buzz, whine=whine, thump=thump, tick=tick, ping=ping, slice=slice_, rasp=rasp,
           squelch=squelch, bubbles=bubbles, rise=rise, clink=clink, bonk=bonk)
for name, p in C['cues']:
    p = dict(p); fn = LIB[name]
    if 'every' in p:                      # repeat a one-shot sound every N frames between f0 and f1
        ev, f0, f1 = p.pop('every'), p.pop('f0'), p.pop('f1')
        for f in range(f0, f1, ev): fn(f, **p)
    elif 'f' in p: f = p.pop('f'); fn(f, **p)
    else: fn(p.pop('f0'), p.pop('f1'), **p)

mx = max(np.abs(L).max(), np.abs(R).max(), 1e-9); L, R = L / mx * 0.89, R / mx * 0.89
with wave.open(a.out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.stack([L, R], 1) * 32767).astype(np.int16).tobytes())
print('wrote', a.out, f'{DUR:.2f}s', len(C['cues']), 'cues')
