"""Synthesised, copyright-free sound effects aligned to the 30 fps timeline (frame f starts at (f-1)/30 s).
usage: python3 sfx.py <out.wav>     -> 48 kHz stereo, 63.6 s, meant to sit under the VO (mixed later)"""
import sys, math, json, wave
import numpy as np
SR = 48000; DUR = 63.6; N = int(SR * DUR); rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)
def t0(f): return (f - 1) / 30.0
def env_ar(n, a, r):  # attack/release envelope (fractions of n)
    e = np.ones(n); na, nr = max(1, int(n * a)), max(1, int(n * r)); e[:na] = np.linspace(0, 1, na) ** 2; e[-nr:] *= np.linspace(1, 0, nr) ** 2; return e
def bandnoise(n, lo, hi):
    x = rng.standard_normal(n); X = np.fft.rfft(x); fr = np.fft.rfftfreq(n, 1 / SR); X[(fr < lo) | (fr > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)
def sweepnoise(n, f0, f1, q=0.6):  # noise through a moving band (whoosh)
    x = rng.standard_normal(n); out = np.zeros(n); blk = 1024
    for i in range(0, n, blk):
        seg = x[i:i + blk]; c = f0 + (f1 - f0) * (i / n); X = np.fft.rfft(seg, blk); fr = np.fft.rfftfreq(blk, 1 / SR)
        X *= np.exp(-((fr - c) / (c * q)) ** 2); out[i:i + blk] = np.fft.irfft(X, blk)[:len(seg)]
    return out / (np.abs(out).max() + 1e-9)
def put(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); n = min(len(sig), N - i)
    if n <= 0: return
    gl, gr = gain * math.cos((pan + 1) * math.pi / 4), gain * math.sin((pan + 1) * math.pi / 4)
    L[i:i + n] += sig[:n] * gl; R[i:i + n] += sig[:n] * gr
def tone(n, f, harm=(1,), decay=6.0):
    t = np.arange(n) / SR; s = sum(np.sin(2 * math.pi * f * h * t) / h for h in harm); return s * np.exp(-decay * t)

def whoosh(f, dur=0.45, gain=0.5, up=True):
    n = int(dur * SR); s = sweepnoise(n, 300 if up else 2500, 2500 if up else 300) * env_ar(n, 0.55, 0.45); put(s, t0(f) - dur * 0.55, gain, 0.3 if up else -0.3)
def buzz(f0, f1, base=170, gain=0.22, am=28, pan=0.0):  # fly wings
    n = int((t0(f1) - t0(f0)) * SR); t = np.arange(n) / SR; ph = 2 * math.pi * (base + 6 * np.sin(2 * math.pi * 0.7 * t)) * t
    saw = sum(np.sin(h * ph) / h for h in range(1, 9)); s = saw * (0.6 + 0.4 * np.sin(2 * math.pi * am * t)) * env_ar(n, 0.08, 0.25)
    put(s / np.abs(s).max(), t0(f0), gain, pan)
def whine(f0, f1, base=640, gain=0.12):  # mosquito
    n = int((t0(f1) - t0(f0)) * SR); t = np.arange(n) / SR; ph = 2 * math.pi * (base + 25 * np.sin(2 * math.pi * 3 * t)) * t
    s = (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * env_ar(n, 0.1, 0.3); put(s / np.abs(s).max(), t0(f0), gain, -0.2)
def thump(f, gain=0.55, freq=70):
    n = int(0.35 * SR); t = np.arange(n) / SR; s = np.sin(2 * math.pi * freq * t * (1 - 0.4 * t)) * np.exp(-14 * t) + 0.3 * bandnoise(n, 60, 400) * np.exp(-30 * t); put(s, t0(f), gain)
def tick(f, gain=0.25):
    n = int(0.06 * SR); s = bandnoise(n, 2000, 7000) * np.exp(-np.arange(n) / SR * 90); put(s, t0(f), gain)
def ping(f, gain=0.32, base=1320):  # glow shimmer
    n = int(1.1 * SR); t = np.arange(n) / SR
    s = (tone(n, base, (1, 2.01, 3.03), 4.5) + 0.6 * tone(n, base * 1.5, (1, 2), 5.5)) * env_ar(n, 0.01, 0.4)
    s += 0.25 * bandnoise(n, 4000, 11000) * np.exp(-8 * t); put(s / np.abs(s).max(), t0(f) - 0.02, gain, 0.15)
def slice_(f, gain=0.5):
    n = int(0.28 * SR); s = sweepnoise(n, 6000, 2000, 0.3) * env_ar(n, 0.05, 0.7); put(s, t0(f) - 0.05, gain, 0.2)
def rasp(f, gain=0.18):
    n = int(0.22 * SR); t = np.arange(n) / SR; s = bandnoise(n, 900, 5000) * (0.5 + 0.5 * np.sign(np.sin(2 * math.pi * 38 * t))) * env_ar(n, 0.2, 0.4); put(s, t0(f), gain, rng.uniform(-.3, .3))
def squelch(f, dur=0.5, gain=0.35, f0=420, f1=140):
    n = int(dur * SR); t = np.arange(n) / SR; fr = f0 + (f1 - f0) * t / dur; s = np.sin(2 * math.pi * np.cumsum(fr) / SR) * env_ar(n, 0.1, 0.6)
    s += 0.4 * bandnoise(n, 150, 1200) * env_ar(n, 0.05, 0.8); put(s / np.abs(s).max(), t0(f), gain)
def bubbles(f0, f1, gain=0.18, rate=7):
    k = int((t0(f1) - t0(f0)) * rate)
    for i in range(k):
        fq = rng.uniform(300, 900); n = int(0.09 * SR); t = np.arange(n) / SR; s = np.sin(2 * math.pi * fq * (1 + 3 * t) * t) * np.exp(-40 * t)
        put(s, t0(f0) + rng.uniform(0, t0(f1) - t0(f0)), gain * rng.uniform(.5, 1), rng.uniform(-.4, .4))
def rise(f0, f1, gain=0.18, a=180, b=420):
    n = int((t0(f1) - t0(f0)) * SR); t = np.arange(n) / SR; fr = a + (b - a) * t / t[-1]; s = np.sin(2 * math.pi * np.cumsum(fr) / SR) * env_ar(n, 0.3, 0.2)
    s += 0.3 * np.sin(2 * math.pi * np.cumsum(fr * 1.5) / SR) * env_ar(n, 0.3, 0.2); put(s / np.abs(s).max(), t0(f0), gain)
def clink(f, gain=0.3, base=2100):
    n = int(0.9 * SR); s = tone(n, base, (1, 2.76, 5.4, 8.9), 7); put(s / np.abs(s).max(), t0(f), gain, 0.2)
def bonk(f, gain=0.4):
    n = int(0.25 * SR); t = np.arange(n) / SR; s = np.sin(2 * math.pi * 220 * t * (1 - 1.2 * t)) * np.exp(-18 * t) + 0.3 * bandnoise(n, 200, 2000) * np.exp(-40 * t); put(s, t0(f), gain, -0.2)

# ---- timeline (frames from ANIMATION_PLAN.md / keys) ----
whine(1, 56); tick(54); whoosh(62, 0.4, 0.45)                        # 01 mosquito lands softly, whip
whoosh(70, 0.4, 0.5, up=False); buzz(67, 106, 175, 0.24); thump(104)    # 02 horsefly drops in, lands hard
ping(150, 0.28, 990)                                                    # 03 mouthparts pulse
whoosh(191, 0.35, 0.45); ping(197)                                      # 04 whip male->female, gap glows on "females"
bubbles(240, 300, 0.12, 9); ping(296, 0.3, 1480)                        # 05 blood streams in, eggs glow
whine(322, 360, 660, 0.08); slice_(394, 0.25)                           # 06 needle slides in
whoosh(418, 0.5, 0.45, up=False)                                        # 07 dive into the skin
whoosh(528, 0.4, 0.5); [ping(f, 0.26, 1320 + 110 * i) for i, f in enumerate((553, 561, 569, 577))]   # 08 four blades
ping(609, 0.32, 1180); ping(641, 0.32, 1560)                           # 09 mandibles / maxillae
[rasp(f) for f in range(664, 720, 9)]                                   # 10 sawing
thump(735, 0.25, 90)                                                    # 11 blades press
slice_(761, 0.55); whoosh(818, 0.45, 0.45, up=False)                    # 12 slice + dive into the cut
whoosh(826, 0.35, 0.3); ping(851, 0.38, 880); slice_(852, 0.25)         # 13 sting: nerves flash
ping(941, 0.3, 1050)                                                    # 14 vein glows
whoosh(963, 0.5, 0.35, up=False); buzz(966, 996, 160, 0.05)             # 15 pull out, the fly waits (faint hum)
bubbles(1010, 1090, 0.16, 6); squelch(1060, 0.6, 0.22, 300, 120)        # 16 blood beads
squelch(1112, 0.5, 0.25, 900, 500); ping(1112, 0.22, 1700)              # 17 saliva glistens
whoosh(1172, 0.4, 0.35, up=False); squelch(1194, 0.55, 0.4); bubbles(1200, 1270, 0.14, 10)   # 18 pad presses, soaks
rise(1295, 1350, 0.16)                                                  # 19 abdomen swells
clink(1356, 0.25); clink(1378, 0.18, 2300); clink(1388, 0.12, 2000); ping(1391, 0.3, 1240)   # 20 balance settles
whoosh(1426, 0.5, 0.5); ping(1466, 0.22, 1400)                         # 21 whip out to the zebra
buzz(1516, 1581, 190, 0.12, 31, 0.3); buzz(1520, 1581, 150, 0.08, 24, -0.3)   # 22 flies circle
buzz(1582, 1638, 185, 0.08, 29, 0.2); buzz(1639, 1695, 165, 0.16, 26, -0.2); ping(1633, 0.2, 1100)   # 23
buzz(1696, 1749, 120, 0.14, 18); bonk(1708, 0.45)                       # 24 slow-mo bounce off the stripes
whine(1750, 1810, 640, 0.12); tick(1821); whoosh(1835, 0.4, 0.45)       # 25 mosquito again
whoosh(1843, 0.4, 0.5, up=False); buzz(1840, 1882, 175, 0.24); thump(1880)   # 26 horsefly lands hard (loop)

mx = max(np.abs(L).max(), np.abs(R).max()); L, R = L / mx * 0.89, R / mx * 0.89
out = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print('wrote', sys.argv[1])
